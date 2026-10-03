const BASE = 76561197960265728n;
export function isAccountId(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 4294967295;
}
export function accountIdToSteamId64(value: unknown): string | undefined {
  return isAccountId(value) ? (BASE + BigInt(value)).toString() : undefined;
}
export function steamId64ToAccountId(value: unknown): number | undefined {
  if (typeof value !== "string" || !/^[0-9]{17}$/.test(value)) return undefined;
  const id = BigInt(value) - BASE;
  return id >= 0n && id <= 4294967295n ? Number(id) : undefined;
}
