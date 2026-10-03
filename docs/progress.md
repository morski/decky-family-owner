# Execution progress

Status: LOCAL DEVELOPMENT; gates A and B passed for observed Steam build; integration/device acceptance pending.

## 2026-10-03 — scope and untouched scaffold
- Task 01 passed: README describes intended behavior and explicitly unverified limitations.
- Task 02 passed: cloned official template to `/tmp/family-owner-decky-template` at `90d0780e882a17f5714fc6de044c645f22608290`. Deliberately copied scaffold excluding `.git` and README; preserved all existing planning files. Saved upstream README in docs.
- Node was absent. Downloaded official Node 22.14.0 Linux x64 archive into /tmp and verified SHA256 against upstream SHASUMS256.txt. Temporary pnpm 9.15.9; npm 10.9.2. No global installation.
- `pnpm install --frozen-lockfile --store-dir /tmp/family-owner-pnpm-store` passed (201 packages); network access required escalation after sandbox DNS failure.
- Untouched `pnpm run build` PASSED: dist/index.js generated; upstream unused Navigation warning.
- Additional untouched `tsc --noEmit` FAILED: upstream unused Navigation, missing react-router declaration, react-icons/global JSX mismatch with React 19 types. These will be corrected in the minimal scaffold, not represented as an untouched typecheck pass.
- Locked upstream versions: @decky/ui 4.11.0, @decky/api 1.1.3, @decky/rollup 1.0.2, Rollup 4.53.3, TypeScript 5.6.2, React peer 18.3.1.
- Loader source inspected at `75563316f9119ee7e36be7f43885be65e877fad0`: plugin/plugin.py supports passive plugins without main.py, reads name/author/flags/api_version and package type/version. Frontend-only package needs no Python backend.
- Existing git repository retained. Scaffold checkpoint committed before demo removal.
- Device versions: unavailable; ALL DEVICE TESTS UNTESTED. No Deck connection or device evidence supplied.
- Next: minimal frontend, isolated local tests; no capsule discovery/install until gates A and B pass. Project license decision deferred until distribution.

## 2026-10-03 — independent local implementation

- Scaffold checkpoint: `231f10a`. Git mutation required escalation because .git is mounted read-only in the sandbox; the original repository was preserved.
- Task 03 LOCAL IMPLEMENTATION READY, exit still pending project license choice before distribution: removed imported Python/C demos, root/debug flags and demo logo; configured package ID decky-family-owner, display name Family Owner, version 0.1.0 and explicit author placeholder. Retained upstream BSD notice; package license UNLICENSED pending user's distribution choice.
- Tasks 04–06 BLOCKED: no Deck access or fixture data. Minimal plugin loading/unloading has not been exercised. Gate A NOT PASSED.
- Task 07 COMPLETE: exact BigInt SteamID64 helpers; zero/maximum/roundtrip and malformed-input fixtures pass.
- Task 08 PARTIAL: narrow injected identity reader validates active IDs, unavailable/error cases and changed reads. No Steam global or login subscription is guessed; device identity match pending.
- Task 09 PARTIAL: ownership service uses explicit injected proof, fails closed, bounds its cache to 256 entries, expires lazily after 30 seconds and notifies on invalidation/account transitions. Tests cover own+family proof, borrowed proof, unknown/malformed/non-Steam cases, invalid identity, cache eviction/TTL, exceptions and disposal. These mock contracts do not establish Steam classifications. Runtime adapter and discovered cases pending gate A.
- Task 10 BLOCKED: no verified persona store or avatar route; no loopback URL is hardcoded.
- Task 11 COMPLETE (isolated service): pending deduplication; settled cache maximum 256, 5-minute success TTL and 30-second fallback retry; absolute HTTP(S) plus injected source validation; no embedded credentials; generation invalidation rejects stale account/refresh/unload results and notifies consumers. Tests cover found/missing/failure/cache/retry/ID/URL/account race/disposal. Actual source resolution remains task 10's device blocker.
- Task 12 COMPLETE (isolated UI): 28px/2px/6px defaults, four corners, noninteractive avatar, name initial or silhouette fallback, image-error reset keyed by URL, accessible label, mismatched persona rejection, null error boundary. DOM tests verify live settings changes and immediate hiding of mounted badges on Lifecycle disposal. No capsule is modified.
- Task 13 SOURCE STUDY ONLY: TabMaster inspected, not copied; target uniqueness, props and positioned container remain UNTESTED. Gate B NOT PASSED.
- Task 14 NOT STARTED per gates A/B. No capsule patch/discovery code exists.
- Task 15 PARTIAL: idempotent lifecycle notifies mounted consumers before running all registered cleanups; exceptions isolated; disposed services clear caches/listeners and invalidate async work. Mounted cleanup demonstrated in DOM test, not Steam. There are no installed patches, timers or Steam listeners. Real unload acceptance pending integration/device.
- Task 16 BLOCKED: installed AND uninstalled and multi-owner fixtures require Deck evidence.
- Task 17 PARTIAL: Decky settings controls for enable/size/corner/refresh, validated plugin-namespaced browser localStorage, session fallback on unavailable storage, reactive settings store. Refresh invalidates persona generation before ownership notification. Store persistence/live badge behavior tested locally; actual Decky control behavior and reload persistence untested.
- Task 18 PARTIAL: lazy ownership/persona TTLs, explicit invalidation notifications and generation guards exist. Steam event subscriptions and visible-capsule refresh scheduling require discovery; no full-library polling or scans.
- Tasks 19–20 BLOCKED: controller/performance and Stable/Beta device checks not run; compatibility remains UNTESTED.
- Task 21 NOT TRIGGERED: frontend discovery has not failed on a device; no backend justification or implementation.
- Tasks 22–25 BLOCKED/NOT STARTED: acceptance is incomplete, so no installable ZIP, screenshots, release publication or store submission. License and author must be finalized before distribution.
- Changed: minimal src/index.tsx; steam types/adapters, ID helpers, ownership/persona/lifecycle services, badge/error boundary, settings store/panel; six test files; pinned package/lockfile; test config; README, plan and research/device/source records. Planning files preserved.
- Upstream strict declaration errors fixed by pinning React 18.3.1 with @types/react 18.3.12, @types/react-dom 18.3.1 and react-router 6.28.0 for Decky API declarations. Kept Decky packages/TypeScript/Rollup at upstream locked versions; removed unused demo import. Test-only TS config uses bundler resolution for Vite declarations; strict library checking remains enabled.
- Added exact test tools: Vitest 2.1.9, jsdom 25.0.1, Testing Library React 16.1.0/DOM 10.4.0. Package manager pinned pnpm 9.15.9. Host Linux 7.2.8-1-cachyos x86_64; not a tested Steam Deck.
- Commands: dependency install required network escalation after sandbox DNS failure; pnpm typecheck, pnpm test and pnpm build (temporary toolchain PATH in /tmp). Final results recorded below. No unit test is represented as device evidence.
- Exact next action: user runs docs/device-testing.md's read-only four-field probe in Gaming Mode SharedJSContext and returns fixture rows plus exact Steam/SteamOS/Decky versions. For two lenders compare the observed owner to Steam's selected copy, with before/after only if the user manually authorizes copy switching. No license-switch command is supplied.

### Final local verification
- `pnpm typecheck`: PASS for src and tests; no skipLibCheck.
- `pnpm test`: PASS — 45 tests across six files. Real runtime/Decky components are not exercised by the DOM fixtures.
- `pnpm build`: PASS — Rollup produced dist/index.js (18,040 bytes), without warnings. This is the disabled-integration development panel, not an accepted release.
- `git diff --check`: PASS. Static source inspection confirms no owner_account_id runtime heuristic, loopback route, network fetch, capsule patch or background timer.
- Tasks checked off: 01, 02, 07, 11 and 12 only. All other exits remain explicitly pending in the records above.
- Scaffold commit is retained; subsequent implementation and evidence changes are in the working tree for review. No ZIP or release/store mutation performed.

## 2026-10-03 — SteamInfo.md evidence review

- Read docs/implementation-plan.md, docs/progress.md, user-provided docs/research/SteamInfo.md and ownership/compatibility records.
- Recorded supplied SteamOS 3.8.16 / build 20260716.1 and Decky 3.2.9. Steam client build/channel still missing; no channel switch performed.
- Task 05 PARTIAL DEVICE EVIDENCE: six targeted observations now cover own installed/uninstalled, reported own+family, borrowed installed/uninstalled, and a two-lender game. Borrowed entries report numeric owners; reported owned entries output null. Original evidence file preserved.
- Task 06 / gate A STILL NOT PASSED: the two-lender result lacks independent selected-copy owner confirmation and before/after comparison. Probe coalesced missing/undefined/null to null; free-to-play, ineligible and shortcut cases remain unobserved.
- Updated ownership-data.md with exact fixture rows, evidence provenance, limits and targeted next checks; added an explicitly incomplete compatibility row. Task checkboxes unchanged because discovery exits have not passed.
- No runtime adapter, capsule integration, backend or ZIP added. Existing local test/build results remain the prior verified results; documentation-only changes do not require repeating tests.
- Next: obtain Steam client build/channel; compare Little Nightmares 424840's field against independently selected lender, including a manual copy change only if user chooses; probe negative fixtures and distinguish owned missing/null. Exact probe is in ownership-data.md.

## 2026-10-03 — copy-switch evidence and skipped negative fixtures

- SteamInfo.md updated by user: Steam client build/version 1788652215; Little Nightmares owner_account_id changes 79927 → 68324741 following a reported manual copy switch. Steam channel unspecified.
- Selected-copy responsiveness now observed for the multi-lender fixture. Gate A still needs correlation of the IDs to independently known selected lender identities. No more copy-switch experiment is requested.
- User explicitly skips point 3: free-to-play/ineligible/non-Steam device probes. Recorded SKIPPED BY USER; not PASS, and not a recurring evidence request. Missing vs null no longer blocks hiding owned/unknown entries, since neither is interpreted as ownership proof.
- Added one narrow console probe for active-account candidates and two cached lender names, with source provenance and unverified-candidate labeling. It performs no broad scans, patches, token collection or Steam mutation.
- Runtime code unchanged: no verified current-account source or persona route yet. Capsule gate B remains closed. Task checkboxes unchanged because actual discovery exit conditions remain incomplete; user waiver does not create test results.
- Documentation changes only; `git diff --check` passed. Prior local build/typecheck/45-test results remain the most recent code verification.
- Next: JSON from the targeted identity/name probe in persona-data.md, plus confirmation that identities/names correspond to the active user and selected-copy lenders. No negative fixture request, backend or ZIP.

## 2026-10-03 — failed identity/persona candidates reviewed

- Found user update in docs/research/persona-data.md (no person-data.md file exists). JSON reports null IDs, unavailable SteamClient.User.GetSteamID, and null cached names for both lender IDs. Preserved the supplied JSON unchanged.
- Recorded that the tested candidates are unusable; null persona results do not prove cache/store absence, and no general frontend-discovery failure is claimed. No backend is justified from this one candidate failure.
- Read current official decky-frontend-lib source at 4b68ef7287d8b11e62ed7b285532cf4ea36df89c. WebChat.ts declares GetCurrentUserAccountID and GetLocalPersonaName. Added one corrected bounded, read-only probe using those declared APIs, preserving method receiver and reading no secrets. Probe includes known appStore availability to diagnose context.
- Also inspected steam-debug source 0599deaa280347c275b258b3dcb37c2d05db95a0 as a lead; its WebChat definitions agree. The official Decky source is the authority for the next candidate probe. Attempted SteamDeckHomebrew/steam-types clone was unavailable; no source claim derives from it.
- Runtime and task checkboxes unchanged: active account/lender persona remain unverified; ownership gate A identity correlation and capsule gate B remain pending. Negative fixtures explicitly remain skipped at user's instruction.
- Updated persona-data.md, sources.md and device-testing.md; git diff --check passed. Documentation-only work; prior strict typecheck/45 tests/build remain the latest code verification.
- Exact next action: run the corrected WebChat probe at the end of persona-data.md; append JSON and confirm returned nickname belongs to the active account. No old probes, whole-store dumps, copy switching or skipped fixture requests.

## 2026-10-03 — active-account reader implemented

- Read latest user JSON in persona-data.md: known appStore context present; SteamClient.WebChat present; account ID 552534 (number), current persona name morski (string). Derived SteamID64 76561197960818262 using tested conversion helper. Original JSON preserved.
- Task 08 PARTIAL, advanced from hypothetical reader to device-observed API: src/steam/currentUser.ts now provides an injected WebChat adapter and CurrentUserService. Promise reads retain method receiver, validate IDs, time out after 5 seconds, hide old identity before refresh and discard stale results across refresh/unload. All service timers clear on settle/cancel; dispose resolves outstanding reads and notifies identity subscribers.
- Wired initial/manual identity refresh into index.tsx outside render; persona account invalidation precedes ownership identity invalidation. Registered unsubscribe/dispose in the shared lifecycle. No account IDs/names logged. No unverified login listener, periodic polling, ownership-field adapter or capsule patch added.
- Automatic login-change notification and actual plugin load/unload remain untested; task 08 is not checked off yet. Gates A (independent lender identity correlation) and B remain pending. Skipped negative fixtures remain skipped.
- Added tests/currentUser.test.ts: observed async ID and receiver binding; missing/rejected/invalid values; prior-account hiding and latest-response wins; hung-read timeout; unload cancellation/timer cleanup.
- Verification: pnpm typecheck PASS, pnpm test PASS (50 tests, seven files), pnpm build PASS (no warnings). Commands used the existing Node 22.14.0/pnpm 9.15.9 toolchain PATH in /tmp. git diff --check PASS.
- Next device evidence: select the actual lender avatar shown by Steam's Little Nightmares copy selector in the rendered CEF view, then run the single selected-image probe at the end of persona-data.md. Need origin/path and image-load result plus selected lender label; no API/cache guesses or whole-store dump. No extra copy switch, skipped fixture, credential or channel request.

## 2026-10-03 — SharedJSContext inspection obstacle

- User reports black screen in SharedJSContext. This is not treated as a plugin failure or proof that frontend sources are unavailable; shared/background target may have no DOM UI. Actual Deck-screen vs inspected-target distinction remains unspecified.
- Corrected avatar instructions to return to localhost:8080 CEF target list and inspect a separate rendered Steam UI target. Execution-context dropdown is not a target switch. Retained localhost-only host-tunnel alternative.
- If no UI target exists, next missing evidence is target titles only and UI-DOM availability; no object/URL dumps or repeated null/blank probes. Actual Gaming Mode black screen outside DevTools should be reported separately.
- Documentation only; no code/test-result changes, no capsule integration or new runtime claims. git diff --check PASS.

## 2026-10-03 — observed Steam avatar CDN

- Read newest selected-image JSON in persona-data.md: HTTPS avatars.steamstatic.com, 40-hex `_medium.jpg` path, no query, loaded=true, 64×64, no profile link. Remote debugging is via Chrome; target selection already succeeded for this image. Original JSON preserved.
- Task 10 PARTIAL: loaded image source now observed. Still no proven lender AccountID-to-persona/hash lookup or offline result. The observed hash cannot be derived from AccountID, and no loopback route is assumed.
- Added src/steam/avatarUrl.ts with a strict policy for the observed origin/path shape, plus tests/avatarUrl.test.ts validating accepted evidence and rejection of foreign/credentialed/queried/malformed/unsupported URLs. Policy is not bound to an invented runtime resolver; no external request is added.
- Next evidence narrowed to one source snippet: Chrome's rendered-target Sources → Ctrl+Shift+F → `_medium.jpg`, pretty-print matching JavaScript and copy the enclosing URL builder. If no match, the source-backed alternative search is m_mapPersonaCache. No repeat image probe or old null persona probe, broad store dump, React-fiber traversal, backend or skipped fixture request.
- Code verification results recorded below. Gates A identity correlation and B still not passed; no capsule integration or accepted ZIP.
- Final verification for this change: pnpm typecheck PASS; pnpm test PASS (63 tests, eight files); pnpm build PASS (no warnings); git diff --check PASS. Used existing Node 22.14.0/pnpm 9.15.9 temporary toolchain. URL-policy tests are local tests, not additional device verification.

## 2026-10-03 — avatar source-string searches missing

- User reports no matches for `_medium.jpg` or `m_mapPersonaCache`; recorded unsuccessful searches, not general frontend failure. No candidate selector or minified symbol is added.
- Checked official Decky WebChat/SharedConnection/FamilySharing declarations locally: they do not establish a lender avatar resolver. FamilySharing.GetAvailableLenders is a possible separate ownership-verification lead, not an avatar API. No shared connection, authenticated request or preferred-lender mutation performed.
- Verified Chrome's official Network reference for per-request initiator/source links and Copy stack trace. Added one targeted next action: record known avatar request while reopening its existing copy selector, then copy only that row's stack trace. No bundle searches repeated, headers/HAR dumps, skipped fixtures or copy switch requested.
- Documentation-only changes; latest code verification remains strict typecheck/build and 63 passing tests. git diff --check PASS. Gates A identity correlation/B remain pending; no capsule integration or ZIP.

## 2026-10-03 — direct remote CEF inspection and adapters

- User authorized agent inspection and supplied a private CEF endpoint. Added development-only scripts/inspect-cef.mjs using Node CDP/WebSocket; no new dependency, credential access, public-debug-port change or plugin-operated service. Sandbox denied initial private-network access (EPERM); reran with the required network escalation. Target titles confirmed Steam Big Picture Mode and SharedJSContext.
- Initial Network capture of the known avatar observed no request during 30 seconds; recording was disabled and connection closed. Inspected 14 loaded static scripts and selected source excerpts through Debugger; no whole store/object, request headers, HAR or authenticated response was collected. Debugger/session cleanup is explicit. Temporary source excerpts stay under /tmp, not in release assets.
- Task 05 COMPLETE: direct targeted own/borrowed fixture reads confirm absent owned owner fields (undefined, not null) and numeric borrowed owners on supplied Steam build 1788652215 / SteamOS 3.8.16 build 20260716.1 / Decky 3.2.9. Channel still unspecified.
- Task 06 / gate A COMPLETE FOR OBSERVED BUILD: native GetAvailableLenders for Little Nightmares supplies precisely the two AccountIDs from the user-reported switch. Current selected owner matches the preferred lender and its directly cached avatar hash matches the user's inspected image. Together these correlate IDs, lender identity and selected-copy response. Negative fixtures remain SKIPPED BY USER; no full release acceptance claimed.
- Task 09 COMPLETE FOR DISCOVERED CASES: added injected appStore adapter reading explicit fields outside render. Non-game types, malformed/zero/missing owners, active-user owner and unavailable active identity fail closed. Owned observations remain unknown rather than treating missing owner as proof of ownership. Local tests cover observed fixtures, switch/invalidation and malformed/unsupported cases.
- Task 10 COMPLETE (online source verified): unique structural persona cache found with supported DFL utilities. Direct targeted .get reads resolve names/hashes/SteamID64 for both lenders; active cache account matches 552534. Both derived public Steam CDN images loaded at 64×64 on the Deck using temporary unmounted Images with cleanup. Offline behavior remains UNTESTED.
- Added src/steam/personas.ts, integrated cache-backed PersonaAdapter, and validated exact discovery predicate on-device (one unique candidate). Avoided GetFriendState/GetPlayer because source shows cache population. No Steam store/map/object is mutated; no profile API fetch or credentialed request is used. Adapter identity checks and PersonaService generations isolate account transitions.
- Added tests/runtimeAdapters.test.ts for device-grounded fixture replay, unsupported/missing APIs, unique/ambiguous discovery, ID correlation, account mismatch and proof that no cache-populating method is called. These tests do not establish skipped fixture compatibility.
- Verification: pnpm typecheck PASS, pnpm test PASS (67 tests, nine files), pnpm build PASS with no warnings; inspector node --check and git diff --check PASS. Actual installed plugin still UNTESTED, distinct from direct runtime adapter evidence.
- Task 13 PARTIAL: descriptive capsule CSS/source lead found, but runtime structural component search through Decky's current module cache returned zero candidates, including memo/forwardRef traversal. No target props/positioned container proven. Gate B NOT PASSED; no capsule patch begun. No fixed module IDs, minified names, CSS hashes or fiber indices become runtime selectors.
- Tasks 04/08/14–20/22–25 retain outstanding device/integration/release exits. No accepted ZIP, fake screenshot, backend, store PR or publication. Task checkboxes advanced only 05/06/09/10; limitations recorded alongside gate A.
- User can stop manual avatar/source probes. Direct CEF inspection is now available for further capsule discovery. Do not re-request skipped negative fixtures or old null/black-screen probes. The copy-selector-open question was optional assistance; no answer was needed for the successful source/cache reads.

## 2026-10-03 — open Library capsule evidence

- User opened Library and authorized continuation. Ran capsule-probe and new read-only capsule-dom modes through 10.10.10.108:8081. Unique descriptive CSS module found; 25 native capsules mounted. Five sampled containers have position:relative, 134×201 dimensions and app.appid matching asset paths.
- Actual observed component wraps its renderer in an observer closure; source-text export discovery remains zero candidates. Gate B remains open pending unique patchable export identity and known ownership fixture validation. No capsule patch begun.
- Inspector now checks separate render contexts, dynamically transfers discovered CSS via temporary evidence and reads structural ancestor props without fixed fiber indices. No account/page text, credentials, Steam objects or full stores are serialized. No runtime code is added to the plugin.
- Verification: inspector syntax and git diff whitespace checks passed. Production source unchanged; previous 67 passing tests/build/typecheck remain applicable. Device UI installation, navigation, unload and release acceptance remain UNTESTED.
- Next: continue wrapper/export correlation; user needs only to keep Library visible and CEF connected.

## 2026-10-03 — gate B passes before integration

- capsule-identity CEF probe: one CSS module, 25 tiles, one observed wrapper type, one exact export identity match. Independent structural scan: one module with exported GetAssetImage/BHasVerticalCapsule class and one memo component. Selector uses descriptive methods and React symbols, never minified export names.
- Task 13 complete for observed Steam build 1788652215. Other channels remain UNTESTED. Updated gate record before starting task 14. No Steam store mutations or patches occurred during discovery.
- Next: local capsule integration tests, then actual device development load and known fixture validation.

## 2026-10-03 — local integration and real temporary frontend tests

- Implemented isolated capsule structural discovery, app-ID validation, idempotent supported afterPatch integration, native-child injection, ConnectedOwnerBadge effect-based reads and stale-response guard, and one shared timer for mounted capsules. Unknown and ambiguous matches fail closed. No render-time Steam store reads or full-library scans.
- Native RegisterForLoginStateChange registration/unregister handle verified directly, immediately unregistered during probe; wired cleanup and immediate identity invalidation on callback. Actual logout/login remains UNTESTED. Task 08 adapter exit passed; dynamic transition acceptance remains in task 18.
- First temporary CEF frontend test installed the patch but injected zero nodes: the React container is Steam's focus component, which renders the positioned DIV. Corrected injection to preserve that component and append native children by the uniquely observed CSS class. Added regression test for this shape.
- Subsequent actual temporary frontend load: 25 tiles, 14 badges, all 14 avatar images loaded. Toggle disabled → 0 badges; enabled with 36px → 14. All four corners observed with 6px insets. Forced image-error event retained nonfocusable fallback (not an offline test). Unload → 0 badges/25 native tiles; original memo type restored by identity. Repeated factory load/unload completed.
- Native scrolling saw 935 distinct AppIDs. Borrowed installed 243780 and borrowed uninstalled 1599660 each displayed selected lender 68324741 with loaded matching avatar. Multi-owner 424840 displayed the current selected lender. Own installed 3905450, own uninstalled 1127500 and own+family 431240 had no badge. These are real rendered DOM reads, not mock claims. Skipped negative fixtures remain SKIPPED. Human controller navigation/perceived performance remain pending.
- Tasks 14 and 15 exit conditions passed for the temporary development load. Task 04 remains partial: no persistent loader install; task 16 retains explicitly skipped fixtures. Settings store behavior verified; nondefault persistence/full panel navigation still being checked.
- Temporary inspector imported the unchanged production bundle from a revoked Blob URL, called its exported factory, and guaranteed onDismount in finally. No persistent Steam files, loader plugin lists or native store data were changed. Development observation patches also removed. /tmp/family-owner-dev-test.json records results, excluded from packaging.
- Captured actual cropped Library screenshot without account header at assets/library-device-1788652215.png. Screenshot visually confirms badge placement; no fabricated UI.
- Local verification: pnpm typecheck PASS; pnpm test PASS, 76 tests/12 files; pnpm build PASS before final settings text correction. Final build will be rerun.
- A separate temporary controller-test session has a plugin-owned 10-minute automatic cleanup timer. User asked for physical controller feedback while local documentation work continues. No accepted ZIP or publication. License/channel questions pending.

- Final local checks after settings-copy and stable-owner refresh improvements: production build PASS, strict typecheck PASS, 76 tests/12 files PASS, inspector syntax PASS, git diff --check PASS. Stable ownership refresh now keeps the same avatar mounted, avoiding fallback flicker on each TTL refresh.
- Controller feedback is pending; temporary session remains available with automatic cleanup. Do not run scripted navigation while the user performs that check. License and current channel confirmation remain pending.

## 2026-10-03 — user changes scope to all owners, lower-left

- User explicitly requests own+friend avatars together, all avatars for multi-owner games, and lower-left placement. Updated AGENTS.md goal and added superseding scope/acceptance in implementation plan. Historical selected-lender evidence retained; dependent UI acceptance checkboxes reopened.
- Native all-owners probe read six known fixtures only. GetAvailableLenders includes self on own games, three owners on own+family 431240, both lenders on 424840, and one lender on each borrowed fixture. Gate A2 passed before new integration. No Steam store/file/license mutation.
- Next: bounded async owner-list service, all-owner avatar row with safe wrapping, lower-left default/migration, tests and real-device revalidation. Original single-owner temporary session will be removed before new device tests.

- All-owner local implementation: added narrow native OwnersAdapter/validator and bounded async OwnersService (four concurrent jobs, 256 cache/pending entries, 30s TTL, 4s timeout, dedup, account generation/cancellation). Switched connected badges to validated complete owner lists and parallel cached persona resolution. Own copy is included only when returned by the native list.
- New OwnersBadge shows one accessible nonfocusable avatar per owner, default bottom-left, wrapping within capsule width; no truncation/overflow count substitutes for avatars. Settings v2 migrates v1 size/enabled and adopts requested lower-left corner. Selected-only service/tests retained as historical regression code, no longer bound by runtime index.
- Verification: pnpm typecheck PASS; pnpm test PASS (84 tests/14 files); pnpm build PASS. Direct initial multi-owner UI load showed 30 loaded avatars among 25 capsules and groups at bottom/left 6px. Disabled/unloaded → zero avatars; patch restored. Nondefault settings (disabled/20px/top-right) survived a factory reload, then original settings restored.
- Fast-scroll fixture sampling initially observed zero avatars immediately after mount; this does not count as failure/pass of owner identity because the new list is asynchronous. Inspector now waits on each known fixture before resampling. New fixture counts pending final probe completion.

- Revised device fixture probe passed after waiting for virtualized mounts and excluding detached DOM nodes: 431240 shows 3 loaded avatars including current user's verified cached hash; 424840 shows both lender avatars; 3905450 and 1127500 each show current user's avatar; 243780 and 1599660 each show the single reported lender. Earlier zero samples were taken from tiles detached by virtualization and are not accepted UI observations.
- New initial viewport: 30 loaded avatars/25 tiles; owner groups bottom=6px, left=6px, right unset, wrapping enabled. Disabled/unload=0 avatars; original component restored. Native scroll observed 935 distinct mounted AppIDs. Nondefault v2 preferences survived reload and original lower-left preferences restored.
- New tasks 14/15 acceptance restored for temporary frontend scope. Full persistent installation, real account/family changes, physical controller tests, offline and channels remain pending. Final strict typecheck, 84 tests/14 files, build and whitespace checks PASS.
- Activated the updated temporary build for visual/controller review, auto cleanup after 600s. License/channel questions remain unanswered; no ZIP/publication.

- Captured and visually inspected assets/library-all-owners-device-1788652215.png after native loading settled. It shows current lower-left placement, including current-user avatar on owned games. Original screenshot retained as historical selected-only evidence; README now uses the revised screenshot. No header/account name in the crop.

## 2026-10-03 — smaller inset and CS2 fallback

- User requests slightly lower/left placement and investigates missing CS2 badge. Reduced owner-group corner inset 6px→2px, retaining wrapping/pointer/focus behavior.
- Direct CS2 probe: exact Steam game, subscribed/visible, but native available-lender list empty. Targeted native AppDetails independently confirms current-user permanent subscribed license (2049), sharing-excluded=true. Own+family control has current owner/2049; borrowed control has lender/33. Recorded evidence before fallback integration.
- Added fallback only for successful empty lists with affirmative exact current-user permanent license proof; no borrowed=false/missing-owner inference. Native details callbacks unregister on first result/timeout/abort; OwnersService aborts these on account changes/unload. Unknown/borrowed/expired/pending/malformed proof fails closed. No family/friend ownership invented for CS2.
- Added meaningful ownership/fallback/abort/timeout tests; 87 tests passed. Initial typecheck identified closure narrowing of optional register method; captured the verified method and preserved receiver with call. Final checks/device revalidation pending below.

- Final verification: pnpm typecheck PASS; pnpm test PASS (87 tests/15 files); pnpm build PASS without warnings. Inspector native rendered fixture validation PASS: CS2 730 has one loaded current-user avatar; 431240 has three, 424840 two, all four own/borrowed installed/uninstalled controls one each. Group bottom/left 2px observed. Unload leaves 25 native tiles/0 avatars and restores memo type by identity. Nondefault settings persist across reload.
- Activated latest temporary build for user review; ten-minute automatic cleanup remains. Scope gates retained with new permanent-license proof recorded. Persistent ZIP acceptance still pending controller/account-transition/channel/license/install evidence; no publication.

- Replaced current README screenshot with a visually inspected actual settled Library crop showing 2px lower-left placement. Initial transitional/loading screenshots were not used as evidence.

## 2026-10-03 — vertical upward owner stack

- User requests upward growth from lower-left rather than extending right. Owner group now uses column-reverse for bottom corners, so first/current owner stays at bottom and later owners extend upward. Top corners use column. Kept 2px inset, 4px gap, avatar size and all owners; no wrapping into horizontal rows. Native capsule hierarchy/focus unchanged.
- Updated existing UI layout test and current README/plan. pnpm typecheck PASS, 87 tests/15 files PASS, production build PASS. Device geometry probe pending; it records each owner's x/y to prove same-column/upward order.

- Actual device geometry PASS: Golf With Your Friends has three loaded avatars at identical x coordinates, with successive y positions 32px upward; Little Nightmares has two at identical x, likewise 32px upward. Native group direction column-reverse, bottom/left 2px observed. CS2 and own/borrowed fixtures retain correct avatars. Unload → 0 avatars/25 tiles; original memo restored. Temporary probe cleanup complete.

## 2026-10-03 — cleanup and local Decky install artifact

- User approved current appearance and explicitly requested cleanup, removal of temporary Deck code, documentation and a Decky-installable build. Scoped local artifact acceptance supersedes the earlier no-ZIP restriction; fresh persistent installation and public release gates remain pending. No publication or store submission authorized/performed.
- Ran `node scripts/inspect-cef.mjs 10.10.10.108:8081 dev-stop SharedJSContext`: wasRunning=true, stopped=true. Read-only `cleanup-check SharedJSContext`: temporaryFrontendPresent=false, renderedDocumentAvailable=true, ownerGroups=0. The temporary load was memory-only; no persistent plugin files had been installed on the Deck. Saved settings retained.
- Removed obsolete selected-owner service/adapter/types/UI and corresponding obsolete tests. Extracted shared Avatar component; retained broken-image/URL-change fallback, mismatched-persona, boundary and live-setting checks against current OwnersBadge. Removed template password/sudo/SSH setup/deploy editor scripts; editor tasks now invoke pinned pnpm workflow. Current runtime ownership/discovery/layout unchanged.
- Updated README, architecture/code map, design, development, installation, build notes, metadata and release checklist. Historical research/planning preserved with superseding current status. Package author is Family Owner contributors; project remains UNLICENSED pending public-license choice; official template BSD notice unchanged.
- Added deterministic standard-library ZIP packaging with explicit runtime/documentation allowlist, reduced runtime package manifest, CRC/entry-byte/metadata validation and SHA-256 sidecar. Artifact: out/FamilyOwner-v0.1.0.zip, ten files, 20,723 bytes. No backend, dependencies, tests, inspector, debug dumps or private research shipped.
- `pnpm package` PASS: strict production/test typecheck, 80 tests/14 files, production Rollup build and archive verification. Test count decreased only through deletion of obsolete selected-owner tests; current fallback/lifecycle/ownership coverage retained. `python3 scripts/package.py --verify` PASS. `node --check dist/index.js`, `node --check scripts/inspect-cef.mjs`, `git diff --check` PASS.
- Local install smoke test executed the actual `_unzip_to_plugin_dir` method extracted from official loader checkout against a temporary filesystem: correct hash accepted, frontend root and compiled bytes correct, no backend, incorrect hash rejected. This verifies native extraction compatibility locally, not loader startup or device installation.
- ZIP SHA-256: 506a0572ffa91fe0ddd458f23b5cd275e6eed39b4662643722486bc06b088749.
- Next device action: copy ZIP to Deck and use Decky Settings → Developer → Install Plugin from ZIP File. Fresh install/QAM/reload/native removal, real account changes, offline, full controller acceptance and other-channel behavior remain UNTESTED. Current Steam channel unknown. No runtime result inferred from archive tests.
