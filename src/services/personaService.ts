import type { OwnerPersona } from "../steam/types";
import { accountIdToSteamId64 } from "../utils/steamId";
export interface PersonaAdapter {
  resolve(accountId: number, steamId64: string): Promise<{ name?: unknown; avatarUrl?: unknown } | undefined>;
  // Implement only with device-proven URL origins/paths. No default loopback guess.
  isAllowedAvatarUrl(url: string): boolean;
}
function isSafeImageUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (url.protocol === "https:" || url.protocol === "http:") && !url.username && !url.password;
  } catch { return false; }
}
export class PersonaService {
  private cache = new Map<number, { value: OwnerPersona; expires: number }>();
  private pending = new Map<number, Promise<OwnerPersona | undefined>>();
  private listeners = new Set<() => void>();
  private generation = 0;
  private account?: number;
  private disposed = false;
  constructor(private adapter?: PersonaAdapter, private now: () => number = Date.now,
    private successTtl = 300000, private retryTtl = 30000, private limit = 256) {}
  subscribe = (listener: () => void): (() => void) => {
    if (!this.disposed) this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };
  setCurrentAccount(account?: number): void {
    if (this.disposed) return;
    const valid = account && accountIdToSteamId64(account) ? account : undefined;
    if (valid === this.account) return;
    this.account = valid;
    this.invalidate();
  }
  invalidate(): void {
    this.generation++; this.cache.clear(); this.pending.clear();
    if (!this.disposed) for (const fn of this.listeners) { try { fn(); } catch { /* isolate consumers */ } }
  }
  get(accountId: number): Promise<OwnerPersona | undefined> {
    const steamId64 = accountIdToSteamId64(accountId);
    if (this.disposed || !this.account || !steamId64 || accountId === 0) return Promise.resolve(undefined);
    const cached = this.cache.get(accountId);
    if (cached && cached.expires > this.now()) return Promise.resolve(cached.value);
    const pending = this.pending.get(accountId);
    if (pending) return pending;
    const generation = this.generation;
    const request = Promise.resolve().then(async () => {
      if (this.disposed || generation !== this.generation) return undefined;
      let value: OwnerPersona = { accountId, steamId64 };
      try {
        const raw = await this.adapter?.resolve(accountId, steamId64);
        if (typeof raw?.name === "string" && raw.name.trim()) value.name = raw.name.trim().slice(0, 128);
        if (typeof raw?.avatarUrl === "string" && isSafeImageUrl(raw.avatarUrl) && this.adapter?.isAllowedAvatarUrl(raw.avatarUrl)) value.avatarUrl = raw.avatarUrl;
      } catch { /* safe fallback, bounded retry */ }
      if (this.disposed || generation !== this.generation) return undefined;
      if (this.limit > 0) {
        this.cache.delete(accountId);
        while (this.cache.size >= this.limit) this.cache.delete(this.cache.keys().next().value!);
        this.cache.set(accountId, { value, expires: this.now() + (value.avatarUrl ? this.successTtl : this.retryTtl) });
      }
      return value;
    }).finally(() => {
      if (this.pending.get(accountId) === request) this.pending.delete(accountId);
    });
    this.pending.set(accountId, request);
    return request;
  }
  dispose(): void { this.disposed = true; this.account = undefined; this.invalidate(); this.listeners.clear(); }
}
