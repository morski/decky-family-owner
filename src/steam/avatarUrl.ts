// Observed selected-lender image: persona-data.md, Steam build 1788652215.
// A URL policy only; no AccountID-to-hash mapping or image request is implied.
export function isObservedSteamAvatarUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.origin === "https://avatars.steamstatic.com" &&
      !url.username && !url.password && !url.search && !url.hash &&
      /^\/[a-f0-9]{40}_medium\.jpg$/.test(url.pathname);
  } catch { return false; }
}
