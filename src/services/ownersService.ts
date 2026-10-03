import type { CurrentUser } from "../steam/types";
import type { OwnersAdapter } from "../steam/owners";
import { validateOwners } from "../steam/owners";
import { accountIdToSteamId64 } from "../utils/steamId";
export class OwnersService {
  private user?: CurrentUser;
  private generation = 0;
  private disposed = false;
  private cache = new Map<number, { value?: number[]; expires: number }>();
  private pending = new Map<number, Promise<number[] | undefined>>();
  private queue: Array<{ run(): void; cancel(): void }> = [];
  private running = 0;
  private cancels = new Set<() => void>();
  private listeners = new Set<() => void>();
  constructor(private adapter: OwnersAdapter, private now = Date.now, private ttl = 30000, private timeoutMs = 4000) {}
  getCurrentAccount = (): number | undefined => this.user?.accountId;
  subscribe = (fn: () => void): (() => void) => { if (!this.disposed) this.listeners.add(fn); return () => { this.listeners.delete(fn); }; };
  setCurrentUser(user?: CurrentUser): void {
    const valid = user && user.accountId > 0 && accountIdToSteamId64(user.accountId) === user.steamId64 ? user : undefined;
    if (this.disposed || valid?.accountId === this.user?.accountId) return;
    this.user = valid;
    this.refresh();
  }
  refresh(): void {
    if (this.disposed) return;
    this.generation++; this.cache.clear(); this.pending.clear();
    for (const job of this.queue.splice(0)) job.cancel();
    for (const cancel of [...this.cancels]) cancel();
    for (const listener of this.listeners) { try { listener(); } catch { /* isolate consumers */ } }
  }
  private drain(): void {
    while (!this.disposed && this.running < 4 && this.queue.length) this.queue.shift()!.run();
  }
  get(appId: number): Promise<number[] | undefined> {
    if (this.disposed || !this.user || !Number.isInteger(appId) || appId <= 0 || appId > 2147483647) return Promise.resolve(undefined);
    const cached = this.cache.get(appId);
    if (cached && cached.expires > this.now()) return Promise.resolve(cached.value);
    const pending = this.pending.get(appId); if (pending) return pending;
    if (this.pending.size >= 256) return Promise.resolve(undefined);
    const generation = this.generation, account = this.user.accountId;
    const request = new Promise<number[] | undefined>(resolve => {
      const run = () => {
        if (this.disposed || generation !== this.generation) { resolve(undefined); return; }
        this.running++;
        const controller = new AbortController();
        let settled = false;
        const finish = (raw?: unknown) => {
          if (settled) return; settled = true;
          clearTimeout(timer); this.cancels.delete(cancel); this.running--; controller.abort();
          const valid = !this.disposed && generation === this.generation;
          const value = valid ? validateOwners(appId, raw, account) : undefined;
          if (valid) {
            this.cache.delete(appId);
            while (this.cache.size >= 256) this.cache.delete(this.cache.keys().next().value!);
            this.cache.set(appId, { value, expires: this.now() + this.ttl });
          }
          resolve(value); this.drain();
        };
        const cancel = () => finish();
        const timer = setTimeout(cancel, this.timeoutMs);
        this.cancels.add(cancel);
        Promise.resolve().then(() => this.disposed || generation !== this.generation ? undefined : this.adapter.resolve(appId, accountIdToSteamId64(account), controller.signal)).then(finish, cancel);
      };
      this.queue.push({ run, cancel: () => resolve(undefined) });
    }).finally(() => { if (this.pending.get(appId) === request) this.pending.delete(appId); });
    this.pending.set(appId, request); this.drain(); return request;
  }
  dispose(): void { if (this.disposed) return; this.user = undefined; this.refresh(); this.disposed = true; this.listeners.clear(); this.cache.clear(); }
}
