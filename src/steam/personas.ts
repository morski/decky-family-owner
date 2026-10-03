import type { PersonaAdapter } from '../services/personaService';
import { isAccountId } from '../utils/steamId';
import { isObservedSteamAvatarUrl } from './avatarUrl';
type Persona = {
  m_strPlayerName?: unknown; m_strAvatarHash?: unknown;
  m_steamid?: { ConvertTo64BitString?: () => unknown };
};
type Player = { m_persona?: Persona };
type Cache = { get(accountId: number): Player | undefined };
export interface PersonaCacheStore {
  GetFriendState: (...args: unknown[]) => unknown;
  m_FriendsUIFriendStore: { m_mapPlayerCache: Cache };
  m_mapPlayerCache: Cache;
  currentUserSteamID: { GetAccountID(): unknown };
}
export type FindAllModules = (filter: (module: unknown) => boolean) => unknown[];
function matches(value: unknown): value is PersonaCacheStore {
  const store = value as Partial<PersonaCacheStore> | null;
  return !!store && typeof store.GetFriendState === 'function' &&
    typeof store.m_FriendsUIFriendStore?.m_mapPlayerCache?.get === 'function' &&
    typeof store.m_mapPlayerCache?.get === 'function' &&
    typeof store.currentUserSteamID?.GetAccountID === 'function';
}
// Enumerate webpack exports only during discovery, never MobX store contents.
// All actual cache reads target one AccountID; no GetPlayer/cache-populating call.
export function discoverPersonaCache(findAllModules: FindAllModules): PersonaCacheStore | undefined {
  const candidates = new Set<PersonaCacheStore>();
  try {
    findAllModules(module => {
      if (!module || typeof module !== 'object') return false;
      for (const key of Object.keys(module)) {
        try {
          const value = (module as Record<string, unknown>)[key];
          if (matches(value)) candidates.add(value);
        } catch { /* inaccessible export is not a candidate */ }
      }
      return false;
    });
  } catch { return undefined; }
  return candidates.size === 1 ? candidates.values().next().value : undefined;
}
export function createCachedPersonaAdapter(store: PersonaCacheStore | undefined, getActiveAccount: () => number | undefined): PersonaAdapter {
  return {
    async resolve(accountId, steamId64) {
      const activeAccount = getActiveAccount();
      if (!store || !isAccountId(accountId) || accountId === 0 || !activeAccount ||
        store.currentUserSteamID.GetAccountID() !== activeAccount) return undefined;
      const player = store.m_FriendsUIFriendStore.m_mapPlayerCache.get(accountId) || store.m_mapPlayerCache.get(accountId);
      const persona = player?.m_persona;
      if (typeof persona?.m_steamid?.ConvertTo64BitString !== 'function' || persona.m_steamid.ConvertTo64BitString() !== steamId64) return undefined;
      const hash = persona.m_strAvatarHash;
      const avatarUrl = typeof hash === 'string' && /^[a-f0-9]{40}$/.test(hash)
        ? `https://avatars.steamstatic.com/${hash}_medium.jpg` : undefined;
      return { name: persona.m_strPlayerName, avatarUrl };
    },
    isAllowedAvatarUrl: isObservedSteamAvatarUrl,
  };
}
