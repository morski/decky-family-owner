// Narrow read-only overview contract; ownership comes from native lender/license APIs.
export interface SteamOverviewReader {
  GetAppOverviewByAppID(appId: number): { appid?: unknown; app_type?: unknown } | undefined;
}
