import { steamId64ToAccountId } from "../utils/steamId";
import type { SteamOverviewReader } from "./appStore";
export interface OwnersAdapter { resolve(appId: number, currentSteamId?: string, signal?: AbortSignal): Promise<unknown> }
export interface LicenseDetails { unAppID?: unknown; bIsSubscribedTo?: unknown; strOwnerSteamID?: unknown; eAppOwnershipFlags?: unknown }
export interface OwnersSteamClient {
  FamilySharing?: { GetAvailableLenders?: (appId: number) => Promise<unknown> };
  Apps?: { RegisterForAppDetails?: (appId: number, callback: (details: LicenseDetails) => void) => { unregister(): void } };
}
// Native AppDetails evidence: CS2 2049 (Subscribed|Permanent), borrowed fixture
// 33 (Subscribed|Borrowed). Owner ID is explicit; missing overview owner is unused.
export function permanentSelfOwner(appId: number, details: LicenseDetails | undefined, currentSteamId: string): string | undefined {
  const flags = details?.eAppOwnershipFlags;
  if (details?.unAppID !== appId || details.bIsSubscribedTo !== true || details.strOwnerSteamID !== currentSteamId ||
    !steamId64ToAccountId(currentSteamId) || typeof flags !== "number" || !Number.isInteger(flags) || flags < 0 || flags > 2147483647) return undefined;
  const subscribed = 1, permanent = 2048, invalid = 32 | 512 | 1024 | 8192;
  return (flags & subscribed) !== 0 && (flags & permanent) !== 0 && (flags & invalid) === 0 ? currentSteamId : undefined;
}
export function readLicenseDetails(apps: OwnersSteamClient["Apps"], appId: number, signal?: AbortSignal): Promise<LicenseDetails | undefined> {
  if (typeof apps?.RegisterForAppDetails !== "function" || signal?.aborted) return Promise.resolve(undefined);
  const register = apps.RegisterForAppDetails;
  return new Promise(resolve => {
    let handle: { unregister(): void } | undefined;
    let settled = false;
    const unregister = () => { const current = handle; handle = undefined; try { current?.unregister(); } catch { /* isolate native teardown */ } };
    const finish = (details?: LicenseDetails) => {
      if (settled) return; settled = true;
      clearTimeout(timer); signal?.removeEventListener("abort", abort); unregister(); resolve(details);
    };
    const abort = () => finish();
    const timer = setTimeout(abort, 3000);
    signal?.addEventListener("abort", abort, { once: true });
    try {
      handle = register.call(apps, appId, finish);
      if (settled) unregister();
      else if (typeof handle?.unregister !== "function") finish();
    } catch { finish(); }
  });
}
export function createOwnersAdapter(getStore: () => SteamOverviewReader | undefined, getClient: () => OwnersSteamClient | undefined): OwnersAdapter {
  return { async resolve(appId, currentSteamId, signal) {
    const app = getStore()?.GetAppOverviewByAppID(appId);
    const sharing = getClient()?.FamilySharing;
    if (app?.appid !== appId || app.app_type !== 1 || typeof sharing?.GetAvailableLenders !== "function") return undefined;
    const lenders = await sharing.GetAvailableLenders(appId);
    if (signal?.aborted) return undefined;
    if (!Array.isArray(lenders) || lenders.length !== 0 || !currentSteamId) return lenders;
    const owner = permanentSelfOwner(appId, await readLicenseDetails(getClient()?.Apps, appId, signal), currentSteamId);
    return owner && !signal?.aborted ? [{ appid: appId, steamid: owner }] : undefined;
  } };
}
// Native list includes self, independently proven on own+family and own fixtures.
export function validateOwners(appId: number, raw: unknown, currentAccount: number): number[] | undefined {
  try {
    if (!Array.isArray(raw) || raw.length === 0 || raw.length > 256) return undefined;
    const ids = new Set<number>();
    for (const entry of raw) {
      const accountId = steamId64ToAccountId(entry?.steamid);
      if (entry?.appid !== appId || accountId === undefined || accountId === 0) return undefined;
      ids.add(accountId);
    }
    return [...ids].sort((a, b) => a === currentAccount ? -1 : b === currentAccount ? 1 : a - b);
  } catch { return undefined; }
}
