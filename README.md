# Family Owner

Family Owner is a frontend-only Decky plugin under development for the Steam Deck Gaming Mode Library and Steam Families. The intended MVP adds a small avatar for the **selected copy's lender**, only when that owner can be established reliably. Games owned by the active user, unknown ownership and non-Steam entries stay unchanged. It does not switch licenses or show multiple owners.

The planned badge defaults to a 28px circle in the bottom-right corner, with a generic fallback when the lender's avatar cannot load. Settings will offer enable/disable, three sizes, four corners and safe refresh. Badges must not change controller focus, pointer handling or library layout, and unload must hide mounted badges immediately.

## Current status

Local scaffold and isolated components are being developed. Steam ownership semantics, active-account APIs, persona sources and capsule discovery are **unverified**. The development panel deliberately performs no library integration. No device compatibility, selected-lender behavior or installable release is claimed. See [progress](docs/progress.md) and [device evidence instructions](docs/device-testing.md).

## Requirements and privacy

The release target requires Steam Deck Gaming Mode, Decky Loader and Steam Families. Active-account detection and a proven selected-copy mapping are prerequisites. Runtime data will be read through narrow frontend adapters. No Steam API keys, tokens, cookies, credential collection, plugin-operated service or Steam-file changes are involved. Diagnostic IDs are opt-in only. Steam's own verified avatar source may be used once discovered.

## Development

The official template requires Node.js 16.14+ and pnpm 9. This project is tested locally with Node 22.14.0 and pnpm 9.15.9. Run `pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm test` and `pnpm build`.

Distribution is blocked on real-device acceptance and a project license chosen with the user. The upstream template's BSD notice is retained in LICENSE; it does not settle the license for new project code. No release ZIP or screenshots are provided until the discovery and acceptance gates pass. Future tested packages can be installed using Decky's developer ZIP installer and removed using Decky's plugin management; exact device steps remain untested.
