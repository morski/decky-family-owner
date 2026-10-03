# Research starting points

These links come from the supplied conversation. They have not been revalidated for this planning bundle. Prefer current official documentation and source; record access date and exact source commit during implementation. Internal Steam behavior always needs target-device evidence.

- Official scaffold: https://github.com/SteamDeckHomebrew/decky-plugin-template
- Decky UI library: https://github.com/SteamDeckHomebrew/decky-frontend-lib
- Decky UI releases: https://github.com/SteamDeckHomebrew/decky-frontend-lib/releases
- Loader: https://github.com/SteamDeckHomebrew/decky-loader
- Plugin database/process: https://github.com/SteamDeckHomebrew/decky-plugin-database
- Library patch example, TabMaster: https://github.com/Tormak9970/TabMaster
- Device verification/MobX caution: https://github.com/beallio/Decky-Metadata/blob/main/docs/runbooks/on-device-verification.md
- AppOverview usage lead: https://github.com/moraroy/NonSteamLaunchers-On-Steam-Deck/blob/main/NSLGameScanner.py
- Local Steam metadata lead: https://github.com/Faugus/faugus-launcher/blob/main/faugus/steam_setup.py
- Avatar route lead: https://github.com/STEAMBALANCE/booster-framework/blob/main/docs/steam-api.md
- Local library cache lead: https://github.com/aesxsc/steam-game-list-exporter

Do not assume claims about published versions, field semantics or avatar URLs are proven merely because an earlier plan linked these projects.

## Verified local source snapshots — 2026-10-03

- Official template: commit `90d0780e882a17f5714fc6de044c645f22608290`; README, package/lockfile, Rollup and build/development scripts read. Upstream README retained at docs/upstream-template-README.md.
- Official loader: commit `75563316f9119ee7e36be7f43885be65e877fad0`; backend/decky_loader/plugin/plugin.py (passive frontend support and metadata), injector.py (localhost:8080), frontend/src/components/settings/pages/developer/index.tsx (SharedJSContext console and ZIP installer).
- TabMaster: commit `cd01770a80a37e0692e76ad8083719c15205f5d9`; LibraryPatch.tsx and mobx.ts studied only; no copied code or device conclusion.
- Installed @decky/ui 4.11.0 declarations inspected for settings controls and structural-discovery helpers. @decky/api 1.1.3 declarations inspected; no frontend settings API assumed. Settings use namespaced browser localStorage, with session-only fallback and pending device persistence verification.

Upstream source dates are not Steam runtime verification. The wiki getting-started page returned no readable body through the browser tool; concrete instructions above derive from official checked-out source and template README.

## Active-account source research — 2026-10-03

Official decky-frontend-lib commit `4b68ef7287d8b11e62ed7b285532cf4ea36df89c`: src/globals/steam-client/WebChat.ts explicitly declares GetCurrentUserAccountID and GetLocalPersonaName. These now guide the next probe; target availability is not inferred from types. User.ts declares RegisterForCurrentUserChanges with a void return, so no such subscription is implemented without a verified cleanup mechanism. No dependency versions changed.

Supplementary source lead: kmturley/steam-debug commit `0599deaa280347c275b258b3dcb37c2d05db95a0`, docs/steam-client/WebChat.ts/User.ts. Read only; no code copied or tool from that repository executed. Broad search results for native Steamworks SDKs do not establish Gaming Mode JavaScript methods and were not used as runtime evidence.

## Local packaging contract inspection — 2026-10-03

Official Decky loader checkout: `backend/decky_loader/browser.py` `_unzip_to_plugin_dir` verifies supplied SHA-256 and extracts the archive directly into the plugins directory, requiring one plugin root. `frontend/src/components/settings/pages/developer/index.tsx` uses a native ZIP file picker and `file://` installation URL. English locale confirms “Install Plugin from ZIP File.” The actual extraction method was executed locally against the generated ZIP; persistent device install remains untested.
