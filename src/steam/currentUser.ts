import { accountIdToSteamId64 } from "../utils/steamId";
import type { CurrentUser } from "./types";
// Validate explicit AccountIDs; unavailable/zero values never identify an active user.
export interface CurrentUserAdapter { readAccountId(): unknown }
export function readCurrentUser(adapter?: CurrentUserAdapter): CurrentUser | undefined {
  try {
    const accountId = adapter?.readAccountId();
    const steamId64 = accountIdToSteamId64(accountId);
    return typeof accountId === "number" && accountId > 0 && steamId64 ? { accountId, steamId64 } : undefined;
  } catch { return undefined; }
}

export interface IdentitySteamClient {
  WebChat?: { GetCurrentUserAccountID?: () => unknown };
  User?: { RegisterForLoginStateChange?: (callback: (...args: unknown[]) => void) => { unregister(): void } };
}
// Verified registration and unregister handle on target; never read account names.
export function subscribeLoginChanges(client: IdentitySteamClient | undefined, refresh: () => void): (() => void) | undefined {
  try {
    const user = client?.User;
    if (typeof user?.RegisterForLoginStateChange !== "function") return undefined;
    const handle = user.RegisterForLoginStateChange(() => refresh());
    if (typeof handle?.unregister !== "function") return undefined;
    return () => handle.unregister();
  } catch { return undefined; }
}
// Device evidence: persona-data.md, Steam build 1788652215.
export function createWebChatCurrentUserAdapter(getClient: () => IdentitySteamClient | undefined): CurrentUserAdapter {
  return {
    readAccountId() {
      const chat = getClient()?.WebChat;
      return typeof chat?.GetCurrentUserAccountID === "function" ? chat.GetCurrentUserAccountID() : undefined;
    },
  };
}

// Read outside render. Each refresh hides the prior identity immediately.
// No unverified login subscription is installed; refresh is explicit for now.
export class CurrentUserService {
  private user?: CurrentUser;
  private listeners = new Set<() => void>();
  private generation = 0;
  private disposed = false;
  private cancel?: () => void;
  constructor(private adapter: CurrentUserAdapter, private timeoutMs = 5000) {}
  getSnapshot = (): CurrentUser | undefined => this.user;
  subscribe = (fn: () => void): (() => void) => {
    if (!this.disposed) this.listeners.add(fn);
    return () => { this.listeners.delete(fn); };
  };
  private publish(user?: CurrentUser): void {
    this.user = user;
    for (const fn of this.listeners) { try { fn(); } catch { /* isolate consumers */ } }
  }
  async refresh(): Promise<CurrentUser | undefined> {
    if (this.disposed) return undefined;
    const generation = ++this.generation;
    this.cancel?.();
    this.publish();
    const raw = await new Promise<unknown>(resolve => {
      let settled = false;
      const finish = (value?: unknown): void => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (this.cancel === cancel) this.cancel = undefined;
        resolve(value);
      };
      const cancel = (): void => finish();
      const timer = setTimeout(cancel, this.timeoutMs);
      this.cancel = cancel;
      Promise.resolve().then(() => {
        if (!this.disposed && generation === this.generation) return this.adapter.readAccountId();
        return undefined;
      }).then(finish, () => finish());
    });
    if (this.disposed || generation !== this.generation) return undefined;
    const user = readCurrentUser({ readAccountId: () => raw });
    this.publish(user);
    return user;
  }
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.generation++;
    this.cancel?.();
    this.publish();
    this.listeners.clear();
  }
}
