import { afterEach, expect, it, vi } from "vitest";
import { OwnersService } from "../src/services/ownersService";
import { createOwnersAdapter, validateOwners } from "../src/steam/owners";
import { accountIdToSteamId64 } from "../src/utils/steamId";
const user = { accountId: 552534, steamId64: accountIdToSteamId64(552534)! };
const row = (appid: number, id: number) => ({ appid, steamid: accountIdToSteamId64(id) });
afterEach(() => vi.useRealTimers());
it("validates all observed owners including self, deduplicates, rejects partial/malformed results", () => {
  expect(validateOwners(431240, [row(431240, 79927), row(431240, user.accountId), row(431240, 87888646), row(431240, 79927)], user.accountId)).toEqual([user.accountId, 79927, 87888646]);
  for (const raw of [null, [], [row(1, 79927)], [{appid:431240,steamid:'bad'}], [row(431240, 0)], [row(431240, 79927), {}]]) expect(validateOwners(431240, raw, user.accountId)).toBeUndefined();
  expect(validateOwners(431240, [{ get steamid() { throw Error(); } }], user.accountId)).toBeUndefined();
});
it("adapter calls native list only for an exact Steam game and keeps native receiver", async () => {
  const sharing = { GetAvailableLenders: vi.fn(async function(this: unknown, id: number) { expect(this).toBe(sharing); return [row(id, 79927)]; }) };
  const app = { appid: 10, app_type: 1 };
  const adapter = createOwnersAdapter(() => ({GetAppOverviewByAppID: () => app}), () => ({FamilySharing: sharing}));
  expect(await adapter.resolve(10)).toEqual([row(10,79927)]);
  app.app_type = 1073741824; expect(await adapter.resolve(10)).toBeUndefined();
  expect(sharing.GetAvailableLenders).toHaveBeenCalledOnce();
});
it("deduplicates requests and expires cache, retaining all copies instead of preferred copy", async () => {
  let now = 0; const resolve = vi.fn(async (appId: number) => [row(appId,user.accountId),row(appId,79927)]);
  const service = new OwnersService({resolve}, () => now); service.setCurrentUser(user);
  const a = service.get(431240), b = service.get(431240); expect(a).toBe(b);
  expect(await a).toEqual([user.accountId,79927]); await service.get(431240); expect(resolve).toHaveBeenCalledOnce();
  now = 30001; await service.get(431240); expect(resolve).toHaveBeenCalledTimes(2); service.dispose();
});
it("caps simultaneous requests and discards queued/inflight results at account change and unload", async () => {
  const finishes: Array<(value: unknown) => void> = [];
  const resolve = vi.fn(() => new Promise(done => finishes.push(done)));
  const service = new OwnersService({resolve}); service.setCurrentUser(user);
  const requests = Array.from({length:12}, (_,i) => service.get(i+1));
  await Promise.resolve(); expect(resolve).toHaveBeenCalledTimes(4);
  service.setCurrentUser(undefined);
  expect(await Promise.all(requests)).toEqual(Array(12).fill(undefined));
  finishes.forEach(done => done([row(1,79927)]));
  service.setCurrentUser(user); const later = service.get(10); await Promise.resolve();
  service.dispose(); expect(await later).toBeUndefined(); expect(await service.get(10)).toBeUndefined();
});
it("times out unknown results and clears timers on disposal", async () => {
  vi.useFakeTimers(); const service = new OwnersService({resolve: () => new Promise(() => {})}); service.setCurrentUser(user);
  const result = service.get(10); await vi.advanceTimersByTimeAsync(4000); expect(await result).toBeUndefined();
  service.get(20); service.dispose(); expect(vi.getTimerCount()).toBe(0);
});
