import { afterEach, it, expect, vi } from 'vitest';
import { CurrentUserService, createWebChatCurrentUserAdapter } from '../src/steam/currentUser';
afterEach(() => vi.useRealTimers());
it('uses the observed async API with its receiver and exact ID conversion', async () => {
  const chat = { async GetCurrentUserAccountID() { expect(this).toBe(chat); return 552534; } };
  const s = new CurrentUserService(createWebChatCurrentUserAdapter(() => ({ WebChat: chat })));
  expect(await s.refresh()).toEqual({ accountId: 552534, steamId64: '76561197960818262' });
  s.dispose();
});
it('missing, rejected and invalid identities fail closed', async () => {
  const missing = new CurrentUserService(createWebChatCurrentUserAdapter(() => undefined));
  expect(await missing.refresh()).toBeUndefined(); missing.dispose();
  for (const raw of [0, -1, '552534', NaN, 4294967296]) {
    const s = new CurrentUserService({ readAccountId: async () => raw });
    expect(await s.refresh()).toBeUndefined(); s.dispose();
  }
  const s = new CurrentUserService({ readAccountId: () => Promise.reject(Error()) });
  expect(await s.refresh()).toBeUndefined(); s.dispose();
});
it('refresh hides old identity and an old response cannot overwrite the new account', async () => {
  const done: Array<(value: number) => void> = [];
  const s = new CurrentUserService({ readAccountId: () => new Promise<number>(resolve => done.push(resolve)) });
  const first = s.refresh(); await Promise.resolve(); done[0](552534); await first;
  const snapshots: Array<number | undefined> = []; const off = s.subscribe(() => snapshots.push(s.getSnapshot()?.accountId));
  const old = s.refresh(); expect(s.getSnapshot()).toBeUndefined(); await Promise.resolve();
  const current = s.refresh(); await Promise.resolve(); done[2](123); expect((await current)?.accountId).toBe(123);
  done[1](999); expect(await old).toBeUndefined(); expect(s.getSnapshot()?.accountId).toBe(123);
  expect(snapshots).toEqual([undefined, undefined, 123]); off(); s.dispose();
});
it('hung reads time out and clear their timers', async () => {
  vi.useFakeTimers(); const s = new CurrentUserService({ readAccountId: () => new Promise(() => {}) });
  const pending = s.refresh(); await vi.advanceTimersByTimeAsync(5000);
  expect(await pending).toBeUndefined(); expect(vi.getTimerCount()).toBe(0); s.dispose();
});
it('dispose cancels outstanding reads, clears timers and notifies once', async () => {
  vi.useFakeTimers(); const readAccountId = vi.fn(async () => 552534);
  const s = new CurrentUserService({ readAccountId }); const listener = vi.fn(); s.subscribe(listener);
  const pending = s.refresh(); s.dispose(); s.dispose();
  expect(await pending).toBeUndefined(); expect(await s.refresh()).toBeUndefined();
  expect(readAccountId).not.toHaveBeenCalled(); expect(vi.getTimerCount()).toBe(0); expect(listener).toHaveBeenCalledTimes(2);
});
