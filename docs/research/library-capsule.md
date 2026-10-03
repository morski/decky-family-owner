# Library capsule discovery — gate B
Status: GATE B PASSED for observed Steam build 1788652215

- Steam channel / exact build:
- Decky / @decky/ui versions:
- Discovery utility/API:
- Structural matching strategy:
- Number of matching candidates:
- Validated component:
- Verified props / app ID extraction:
- Existing positioned container:
- Injection location:
- Original children/focus/layout preserved:
- Patch handle and teardown API:
- How existing mounted badges disappear on unload:
- Stable evidence:
- Beta evidence:

No fixed webpack module IDs, minified symbol names or fiber indices.
Gate B: NOT PASSED. Record evidence and ambiguity checks before integration.

## Local source research — 2026-10-03 (not device evidence)

- Studied TabMaster commit `cd01770a80a37e0692e76ad8083719c15205f5d9`, `src/patches/LibraryPatch.tsx` and `src/lib/mobx.ts`. Its library route patch uses Decky afterPatch/replacePatch/wrapReactType and React-tree traversal; a tab-grid lookup checks the descriptive `Library_FilteredByHeader` string. This identifies a grid lead, not a proven per-game capsule.
- TabMaster also reaches React dispatcher internals and dependency positions. Those assumptions are not copied into this project. No TabMaster code is incorporated, and no target selector is implemented.
- Installed @decky/ui 4.11.0 exports findAllModules, findModuleExport, afterPatch and React-tree helpers. A future device investigation must gather all structural candidates, prove uniqueness and a numeric app-ID prop on own/borrowed/uninstalled fixtures, then identify an existing positioned element without changing focus/layout.
- Candidate count, app-ID extraction and positioned container remain UNTESTED. Source reading does not pass gate B. No capsule patch file or discovery invocation exists in the plugin.

## Direct source-only discovery — 2026-10-03

Ownership gate A has passed for the observed build, with skipped cases documented. The agent inspected loaded static Steam JavaScript through CDP and found a capsule-rendering source using descriptive CSS keys LibraryItemBox, LibraryItemOverlayOuterArea and LibraryItemOverlayInnerArea. Props source includes app:i and accesses i.appid; this is a source lead, not proven props on a uniquely discovered runtime export. Source snapshot filenames/hash identifiers are observations only and are not selectors in plugin code.

Runtime source matching through existing DFL.findAllModules, traversing supported function/memo/forwardRef/class-render structures and deduplicating function identities, returned **0 candidates** containing LibraryItemBox/library_capsule_filename. No patch or React component invocation was installed. Possible stale module-cache or hidden/non-exported component causes remain hypotheses. Existing positioned-container CSS, app-ID props on actual library renders, uniqueness and Stable/Beta behavior are not yet proven.

Gate B remains NOT PASSED. src/patches/libraryCapsulePatch.tsx has not been created. Preserve the original library while discovery is unresolved. No manual avatar/cache probe is pending; future discovery can use the authorized private CEF connection.

## Open Library inspection — 2026-10-03

Direct CEF inspection after the user opened Library found one unique CSS module with descriptive LibraryItemBox/LibraryItemOverlayOuterArea keys in SharedJSContext. Passing that freshly discovered class to the rendered Steam Big Picture Mode document found 25 mounted capsules. Five sampled capsules were DIVs with computed position:relative and dimensions 134×201; each had an absolute child and a static child. No CSS hash is hardcoded into the plugin or inspector; temporary /tmp evidence bridges the separate contexts.

Read-only structural React ancestor traversal (return links, no fixed indices) found app.appid on each sampled capsule component. IDs 435790, 793460, 410110, 251570 and 668550 matched their image asset paths. The actual component is an observer wrapper; its function source hides the inner renderer in a closure. This explains why matching LibraryItemBox in exported function source can miss it, but does not yet establish a unique patchable export. The repeated supported module search still returned zero source-matching candidates.

Gate B remains NOT PASSED: positioned container and sample props are observed, but export identity/unique supported patch target remains unresolved. No capsule integration, patches, component calls, or Steam object mutations occurred. Runtime inspection domains were disabled and sockets closed. Temporary evidence: /tmp/family-owner-capsule-dom-Steam-Big-Picture-Mode.json. Next: correlate the observed wrapper identity with supported Decky export discovery, then validate known borrowed/own fixture props before integration.

## Unique component/export correlation — 2026-10-03

Gate B PASSED for the observed build only. Through supported DFL.Router.WindowStore.GamepadUIMainWindowInstance.BrowserWindow, direct read-only structural ancestor traversal found one component type across all 25 mounted capsules. Exact object identity correlated that type to one exported React memo object. A separate structural module scan found exactly one module exporting a class with GetAssetImage and BHasVerticalCapsule, and exactly one memo object with a function type in that module. That memo is the exact observed capsule component. The minified export name is omitted from runtime selectors. No fixed module IDs, CSS hashes or fiber indices are used.

App-ID extraction is props.app.appid; all 25 sampled values were positive integer AppIDs. Five independently matched asset paths. The existing native LibraryItemBox DIV has position:relative; injection will clone only the React path to this DIV, preserving children, refs, native focus props and wrapper hierarchy. Supported Decky afterPatch on the memo object type provides an unpatch handle. Mounted plugin children also subscribe to lifecycle active state so unload hides them immediately. Ambiguous module/memo/CSS matches disable integration. Known own/borrowed installed/uninstalled visual fixtures, navigation, teardown and other channels remain UNTESTED and do not become gate evidence. Temporary identity evidence: /tmp/family-owner-capsule-identity.json.

Integration clarification: the positioned DOM DIV is rendered through Steam's native focus component. The React injection matches the uniquely discovered LibraryItemBox class on that native component, preserves its type/props/refs and appends to existing children; it does not require a literal div React element. Real rendering verified this shape. Unpatch restored the original memo type by object identity, and mounted badges disappeared immediately.
