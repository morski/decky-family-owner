import { describe, it, expect } from 'vitest';
import { accountIdToSteamId64 as to64, steamId64ToAccountId as from64 } from '../src/utils/steamId';
import { readCurrentUser } from '../src/steam/currentUser';
describe('public individual Steam IDs', () => {
  it.each([0, 1, 123456789, 4294967295])('round trips %s exactly', id => expect(from64(to64(id))).toBe(id));
  it('uses the exact BigInt base and maximum', () => {
    expect(to64(0)).toBe('76561197960265728'); expect(to64(4294967295)).toBe('76561202255233023');
  });
  it.each([-1, 4294967296, 1.5, NaN, Infinity, '123', null, undefined, {}, 1n])('rejects invalid AccountID %s', id => expect(to64(id)).toBeUndefined());
  it.each(['76561197960265727', '76561202255233024', ' 76561197960265728', '+76561197960265728', '76561197960265728.0', '1e17', 'abc', '', 76561197960265728, null])('rejects malformed SteamID64 %s', id => expect(from64(id)).toBeUndefined());
  it('identity fails closed and detects changed reads', () => {
    let id: unknown = 123; const adapter = { readAccountId: () => id };
    expect(readCurrentUser(adapter)).toEqual({ accountId: 123, steamId64: to64(123) });
    id = 456; expect(readCurrentUser(adapter)?.accountId).toBe(456);
    id = 0; expect(readCurrentUser(adapter)).toBeUndefined();
    expect(readCurrentUser()).toBeUndefined();
    expect(readCurrentUser({ readAccountId() { throw Error(); } })).toBeUndefined();
  });
});
