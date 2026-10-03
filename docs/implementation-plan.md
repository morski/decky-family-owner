# Family Owner implementation plan

## Status and assumptions
This document turns the supplied conversation into executable tasks. It is not a fresh verification of upstream documentation. Version numbers from the conversation are intentionally not pinned as current facts. Steam UI internals, selected-license ownership, persona access and loopback avatar routes require on-device discovery.

## Scope revision — 2026-10-03

User now requests all owner avatars, including current-user + family copies, default lower-left. This supersedes selected-copy-only/own-hidden acceptance below. Historical evidence/tasks remain recorded, but UI acceptance is reopened for the new owner-list semantics. Gate A2 passed on the observed build: native GetAvailableLenders returns the current user for known own-only games, three owners including the current user for 431240, both lenders for 424840, and one lender for both borrowed fixtures. It reports available owners/copies, not every Steam friend globally. No ownership is inferred from missing owner_account_id. Gate B target remains unchanged and passed.

Revised UI acceptance: display every validated reported owner, deduplicate IDs, include current user, stack avatars vertically upward from bottom-left (user revision), default bottom-left; unknown/non-Steam entries hide. Use bounded asynchronous owner-list requests outside render, account generations, cleanup and persona dedup. Old selected-only UI results do not count as new multi-owner acceptance.

## CS2 and offset revision — 2026-10-03

User reports CS2 missing and requests badges closer to lower-left edges. Current inset is 2px. Device-confirmed native AppDetails proves current user's subscribed permanent license for CS2 even though GetAvailableLenders is empty. A successful empty list may therefore fall back to an exact current-user permanent license match; malformed/failed native lists and unknown/borrowed/expired/pending license proof still fail closed. No other people's ownership is inferred. Only requested CS2 free-game inspection supersedes the earlier waiver; other waived fixture requests remain skipped.

## MVP (original scope; superseded above)
In Gaming Mode Library, overlay the selected lender's avatar on borrowed Steam games. Games owned by the active account get no badge. Unknown ownership gets no badge. Unresolved lender avatars use a generic icon. No license switching, multi-owner stack, API key, credential handling or plugin-operated external service.

## Suggested source structure
```text
src/
  index.tsx
  logging.ts
  components/OwnersBadge.tsx
  components/Avatar.tsx
  components/BadgeErrorBoundary.tsx
  patches/libraryCapsulePatch.tsx
  services/ownersService.ts
  services/personaService.ts
  steam/appStore.ts
  steam/currentUser.ts
  steam/types.ts
  settings/settings.ts
  settings/SettingsPanel.tsx
  utils/steamId.ts
tests/
  steamId.test.ts
  ownershipService.test.ts
  personaService.test.ts
  OwnerBadge.test.tsx
  lifecycle.test.ts
```

## Service contracts
```ts
type OwnershipInfo =
  | { appId: number; status: "own" }
  | { appId: number; status: "borrowed"; ownerAccountId: number }
  | { appId: number; status: "unknown"; reason?: string };
interface CurrentUser { accountId: number; steamId64: string }
interface OwnerPersona {
  accountId: number; steamId64: string;
  name?: string; avatarUrl?: string;
}
// Runtime adapters should be injected for deterministic unit tests.
// Ownership reads explicit fields outside the React render path.
// Services expose refresh/change notifications and dispose().
```

`borrowed=false` alone cannot distinguish own from unknown. Do not interpret absent ownership data as confirmation that the user owns a game. Determine how Steam represents actual owned/free/non-Steam games before implementing classification.

## Execution rules
Execute the numbered tasks in order; do independent local work when a device task is blocked. Do not implement the capsule integration before gates A and B pass. Mark real-device work BLOCKED or UNTESTED when access is absent. Record exact next commands and expected evidence, then request the minimum missing input. Never report mock results as device results.

## Ordered tasks

### 01. Establish scope

- [x] Complete task.

**Instructions:** Write the final plugin README with requirements: Gaming Mode/Decky/Steam Families, active-account detection, own/borrowed/unknown classification, owner avatar overlay, graceful fallback, no keys or external plugin service, read-only Steam data, immediate cleanup. Selected-copy owner only; no license switching or multi-avatar display.

**Exit condition:** README describes MVP and limitations without claiming unverified behavior.

### 02. Initialize official scaffold

- [x] Complete task.

**Instructions:** Clone https://github.com/SteamDeckHomebrew/decky-plugin-template into a temporary sibling directory. Inspect current README, package.json, lockfile and packaging instructions. Copy scaffold into this folder preserving planning files. Use the specified Node/package-manager versions, install dependencies and run the documented build. Pin compatible dependencies; do not blindly update to latest. Initialize git only if absent and commit the working scaffold.

**Exit condition:** Untouched runtime scaffold builds; versions and commands recorded.

### 03. Strip demo and configure metadata

- [ ] Complete task.

**Instructions:** Remove template demo UI and unnecessary backend code only after checking current frontend-only packaging rules. Set display name Family Owner, unique plugin identifier, description, author placeholder and intended version 0.1.0. Retain upstream notices and choose a project license with the user before distribution.

**Exit condition:** Minimal plugin builds and metadata satisfies current loader requirements.

### 04. Establish device development

- [ ] Complete task.

**Instructions:** Follow current official development instructions to enable CEF debugging and install/reload a local development plugin. Record host environment, target Deck access, SteamOS/Steam/Decky versions and rollback steps. Do not expose debug ports to public networks.

**Exit condition:** Minimal plugin loads and unloads on target Deck; otherwise record an explicit device blocker.

### 05. Inspect ownership data

- [x] Complete task.

**Instructions:** For known own, single-lender and multi-owner games inspect window.appStore.GetAppOverviewByAppID(APP_ID). Log only appid, display_name, owner_account_id and app_type. Do not enumerate or serialize entire store objects. Use docs/research/ownership-data.md.

**Exit condition:** Observed fields and missing-field behavior recorded with exact versions.

### 06. Prove ownership semantics — gate A

- [x] Complete task.

**Instructions:** Test own-only, own+family, single lender, two lenders, ineligible game, free-to-play and non-Steam shortcut. For multi-owner games compare against Steam copy selection; when authorized, observe changes after selecting a different copy. Determine whether owner_account_id means selected lender, preferred lender, historical owner or something else. Missing/zero must remain own-or-unknown rather than proof of ownership.

**Exit condition:** A reliable borrowed-owner mapping is proven. If not, stop dependent UI integration and document alternatives; do not invent semantics.

**Evidence scope (2026-10-03):** Passed for observed Steam build 1788652215 using the user-reported copy switch, direct native lender-list comparison and direct persona/hash correlation. User explicitly skipped ineligible/free/non-Steam device fixtures; these remain SKIPPED, not PASS. Full release acceptance is incomplete.

### 07. Implement Steam ID helpers

- [x] Complete task.

**Instructions:** Use BigInt base 76561197960265728n for individual public-universe SteamID64 conversion. Validate AccountID as an integer in 0..4294967295; validate reverse conversions remain in that range. Keep SteamID64 a decimal string. Test zero, maximum, real-looking ID, round trip and malformed inputs.

**Exit condition:** Helpers and meaningful tests pass without Steam runtime.

### 08. Discover current account

- [x] Complete task.

**Instructions:** Implement src/steam/currentUser.ts behind a narrow adapter. Find the actual Steam global/API on-device rather than guessing names. Return {accountId, steamId64} or undefined. Handle unavailable account and login change. Log IDs only in opt-in diagnostics; never secrets.

**Exit condition:** Identity matches known active account and adapter can be mocked.

### 09. Implement ownership service

- [x] Complete task.

**Instructions:** Read only validated fields from appStore via an injected adapter. Return a discriminated own/borrowed/unknown result with appId and ownerAccountId when meaningful. Unknown active identity, missing app, malformed owner and non-Steam entries produce unknown. Use plugin-owned Maps and bounded/invalidatable caching. Do not mutate overview objects.

**Exit condition:** Classification tests cover all discovered cases and cache invalidation.

### 10. Discover personas and avatars

- [x] Complete task.

**Instructions:** Probe already-loaded Steam persona/profile data first, then Steam-exposed local avatar URLs. Treat https://steamloopback.host/avatarcache/<SteamID64>.png as a hypothesis, not an established route. Verify scheme, path, image load and offline behavior. File-cache access is a backend fallback, not automatically available to frontend JavaScript. Record findings.

**Exit condition:** At least one lender avatar/name resolves through a verified frontend adapter, or fallback limitation is documented.

### 11. Implement persona service

- [x] Complete task.

**Instructions:** Return {accountId, steamId64, name?, avatarUrl?}. Deduplicate in-flight requests with a pending Map; cache settled results with documented TTL and retry policy. Resolve failures to safe fallback data. Invalidate per active account; prevent old promises repopulating new caches with generation checks or cancellation. Validate URL sources based on observed Steam behavior.

**Exit condition:** Tests pass for found/missing avatar, rejected request, duplicate requests, cache hit, retry, invalid ID and account change.

### 12. Create badge and error boundary

- [x] Complete task.

**Instructions:** Implement OwnerBadge with default 28px circle, 2px border and 6px bottom-right inset. object-fit:cover, pointer-events:none; no tabIndex or controller focus. Use a silhouette/name initial on image failure and reset image-error state when URL changes. Give accessible Shared by <name> information without duplicate focus targets. Isolate all plugin content behind an error boundary returning null.

**Exit condition:** Badge tests verify own/unknown hidden, borrowed visible, broken-image fallback, accessibility and settings.

### 13. Discover library capsule — gate B

- [x] Complete task.

**Instructions:** Use CEF and current Decky webpack utilities. Study maintained library patches such as TabMaster. Identify structurally, validate candidate uniqueness and app-ID props, and document the existing positioned container. No fixed module IDs/minified names/fiber indices. Verify Stable and Beta separately when available.

**Exit condition:** Target and app-ID extraction are proven on-device; uncertain matches disable feature.

### 14. Implement capsule patch

- [x] Complete task.

**Instructions:** Keep patch logic in src/patches/libraryCapsulePatch.tsx. Inject into an existing container if possible; avoid wrappers changing grid/focus layout. Preserve original props and children. Guard missing APIs/components and catch discovery/install failures. installLibraryCapsulePatch and removeLibraryCapsulePatch must be idempotent.

**Exit condition:** Borrowed test capsule shows correct badge with native layout and no duplicate injection.

### 15. Implement complete teardown

- [x] Complete task.

**Instructions:** Store every unpatch/unregister handle. A shared active-state subscription must hide already-mounted badges on unload, because unpatching alone may not rerender existing capsules. Unregister callbacks, clear timers/maps, cancel or invalidate pending requests and remove injected styles.

**Exit condition:** Disable/reload removes all visible changes immediately without restarting Steam.

### 16. Verify essential fixtures

- [ ] Complete task.

**Instructions:** Test borrowed installed AND borrowed uninstalled games, own game, own+family game, multi-owner game, non-Steam and free game. Compare avatar owner to independently known Steam copy selection.

**Exit condition:** All fixtures match expected results; uninstalled borrowed game is mandatory.

### 17. Implement settings panel

- [ ] Complete task.

**Instructions:** Add enabled toggle, Small/Medium/Large size, four corner positions and Refresh ownership data. Default enabled, 28px, bottom-right. Persist only plugin settings using a supported mechanism. Any member/game counts must reflect reliable data or be labeled observed; do not force full-library scans just to populate counts.

**Exit condition:** Changes update existing badges and survive reload; refresh invalidates safely.

### 18. Handle dynamic updates

- [ ] Complete task.

**Instructions:** Prefer verified Steam subscriptions for login, library, family and selected-copy changes. Otherwise use bounded TTL/lazy refresh of visible apps with a documented limitation. No continuous full-library polling. Notify badge subscribers when results change; cache invalidation alone is insufficient. Account transitions hide stale badges immediately.

**Exit condition:** Purchase/family refresh/owner change/login change scenarios update safely.

### 19. Verify navigation and performance

- [ ] Complete task.

**Instructions:** Test D-pad/stick, A/B, context menu, scrolling, search, return from detail view and repeated reload. Test hundreds of games; compare disabled/enabled behavior and request counts. No repeated avatar fetches per tile, uncontrolled per-field subscriptions or synchronous render I/O.

**Exit condition:** Navigation unchanged, no visible slowdown, no subscription/timer leaks.

### 20. Verify Stable and Beta

- [ ] Complete task.

**Instructions:** Record exact Steam/SteamOS/Decky versions in compatibility matrix. Obtain authorization before changing the user's client channel. Untested channels remain UNTESTED; compatibility failures must disable feature safely.

**Exit condition:** Both channels pass for release target, or release is explicitly limited and not presented as fully accepted.

### 21. Evaluate fallback only if needed

- [ ] Complete task.

**Instructions:** If frontend ownership/avatar discovery fails, document evidence and evaluate a minimal backend reading local Steam data. Inspect userdata/config/avatarcache/appcache only with a justified parser and path design. localconfig FamilyGroup and caches are hypotheses requiring verification. Never use installed-app LastOwner as all-library ownership truth. Never collect tokens or authenticated Family API credentials.

**Exit condition:** Architecture decision and revised tests recorded before backend implementation.

### 22. Prepare package

- [ ] Complete task.

**Instructions:** Check current Decky packaging/build rules. Produce FamilyOwner-v0.1.0.zip only after implementation acceptance. Include current required metadata, package manifest, dist/index.js, README and license; include backend only if justified and required. Exclude node_modules, secrets, debug dumps and test-only files. Verify archive root layout and clean install.

**Exit condition:** ZIP installs, loads and uninstalls on-device; production build and tests pass.

### 23. Finish README and screenshots

- [ ] Complete task.

**Instructions:** Explain requirements, settings, own/borrowed behavior, data sources/privacy, installation/uninstall, compatibility and known limitations. Capture real library/settings/comparison screenshots in assets; avoid exposing unnecessary account information. No fabricated device screenshots.

**Exit condition:** Documentation matches tested implementation and screenshots are real.

### 24. Prepare release and feedback

- [ ] Complete task.

**Instructions:** Review docs/release-checklist.md. Prepare local v0.1.0 release notes and compatibility information. GitHub release publishing is a separate authorized action. Gather direct ZIP testing across several Families/Decks before store submission. Suggested progression: 0.1 direct release, 0.2 broader testing, 0.3 compatibility hardening, 1.0 store submission.

**Exit condition:** Reviewable release artifacts exist; publishing/submission remains pending unless authorized.

### 25. Prepare Decky Store submission

- [ ] Complete task.

**Instructions:** Verify current plugin-database contribution rules, metadata, licensing, channel testing and repository/submodule procedure. Prepare changes only after external testers pass. Submit a PR only when instructed.

**Exit condition:** Store checklist complete and tested release available; no premature submission.

## Final acceptance
- Own, own+family, unknown, non-Steam and free-game entries have no incorrect badge.
- Installed and uninstalled borrowed games show the proven selected lender.
- Multi-owner behavior is correct and changes refresh safely.
- Failed images and async errors have fallback; missing internals leave Library usable.
- No focus/layout/navigation regression or visible scrolling slowdown.
- Disable/unload immediately removes existing badges and all side effects.
- Account changes cannot reuse stale ownership/persona responses.
- Production build, meaningful unit tests and real-device tests pass.
- Stable and Beta pass for the full release target; untested results remain explicit.
- No keys, tokens, credentials, external plugin service or Steam-file mutation.

## Logging
Use `[FamilyOwner]` prefix. Routine logs: initialized, patch installed, unsupported runtime, teardown. IDs, per-app ownership and persona details belong in opt-in debug mode. Never dump stores, cookies, tokens or authenticated responses. Rate-limit repeated warnings.

## Local install artifact acceptance — 2026-10-03

User approves current appearance and explicitly requests cleanup and a local Decky ZIP. This authorizes a private tested install artifact while broader runtime/release checks stay untested; it does not authorize publication.

- [x] Remove running temporary frontend and verify zero residual owner groups.
- [x] Remove obsolete selected-owner implementation and template deployment scaffolding.
- [x] Document current architecture, code, UI design, development and native installation.
- [x] Run final typecheck/tests/build and verify local ZIP contents.
- [ ] Fresh persistent Decky installation and removal on device (not a local packaging claim).
