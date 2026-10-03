import { it, expect, vi } from 'vitest';
import { createCachedPersonaAdapter, discoverPersonaCache, type PersonaCacheStore } from '../src/steam/personas';
import { PersonaService } from '../src/services/personaService';
import { accountIdToSteamId64 } from '../src/utils/steamId';
const hash = '1eed2efd03a89fe4d95cd5fd62661a522fe1d5e0';
function store(): PersonaCacheStore {
  const players = new Map([[68324741, { m_persona: { m_strPlayerName: 'Lender', m_strAvatarHash: hash, m_steamid: { ConvertTo64BitString: () => accountIdToSteamId64(68324741) } } }]]);
  return { GetFriendState: vi.fn(() => { throw Error('do not call this'); }), m_FriendsUIFriendStore: { m_mapPlayerCache: players }, m_mapPlayerCache: new Map(), currentUserSteamID: { GetAccountID: () => 552534 } };
}
it('structural discovery requires a unique store and deduplicates repeated exports', () => {
  const first = store(), second = store();
  const discover = (mods: unknown[]) => discoverPersonaCache(filter => mods.filter(filter));
  expect(discover([{ a: first }, { default: first }])).toBe(first);
  expect(discover([{ a: first, b: second }])).toBeUndefined();
  expect(discover([{ a: {} }])).toBeUndefined();
  expect(discoverPersonaCache(() => { throw Error(); })).toBeUndefined();
});
it('cached resolver uses exact identity/hash and never populates Steam caches', async () => {
  const source = store(); let active: number | undefined = 552534;
  const adapter = createCachedPersonaAdapter(source, () => active);
  const personas = new PersonaService(adapter); personas.setCurrentAccount(active);
  expect(await personas.get(68324741)).toMatchObject({ name: 'Lender', avatarUrl: `https://avatars.steamstatic.com/${hash}_medium.jpg` });
  expect((await personas.get(79927))?.avatarUrl).toBeUndefined();
  expect(source.GetFriendState).not.toHaveBeenCalled(); expect(source.m_FriendsUIFriendStore.m_mapPlayerCache.get(79927)).toBeUndefined();
  active = 123; expect(await adapter.resolve(68324741, accountIdToSteamId64(68324741)!)).toBeUndefined();
  active = 552534; expect(await adapter.resolve(68324741, accountIdToSteamId64(79927)!)).toBeUndefined();
  active = undefined; expect(await adapter.resolve(68324741, accountIdToSteamId64(68324741)!)).toBeUndefined();
});
