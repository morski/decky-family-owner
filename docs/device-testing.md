# Current status — local ZIP prepared

See [installation](installation.md) for the current procedure. User approved appearance and requested a local install artifact. Temporary frontend removed; cleanup inspection found no development instance and zero owner groups. Fresh persistent installation remains untested. The records below are historical discovery procedures/results; statements that no ZIP exists describe their earlier date.

# Device development and testing
Status: UNTESTED

## Deployment record
- Official instructions followed / date:
- Build command:
- Debug access method:
- Install destination / packaging layout:
- Reload method:
- Log inspection:
- Disable/uninstall/rollback:
- Steam/SteamOS/Decky/build environment versions:

Record verified commands here; do not guess service names, ports or paths.

## UI matrix
| Screen | Correct owner badges | Native layout | Controller navigation | Smooth scrolling | Unload cleanup |
|---|---|---|---|---|---|
| Library All | UNTESTED | UNTESTED | UNTESTED | UNTESTED | UNTESTED |
| Installed | UNTESTED | UNTESTED | UNTESTED | UNTESTED | UNTESTED |
| Collections | UNTESTED | UNTESTED | UNTESTED | UNTESTED | UNTESTED |
| Favorites | UNTESTED | UNTESTED | UNTESTED | UNTESTED | UNTESTED |
| Search | UNTESTED | UNTESTED | UNTESTED | UNTESTED | UNTESTED |
| Home/recent if affected | UNTESTED | UNTESTED | UNTESTED | UNTESTED | UNTESTED |

## Mandatory checks
- [ ] Own game and own+family game remain unchanged.
- [ ] Borrowed installed game shows correct lender.
- [ ] Borrowed UNINSTALLED game shows correct lender.
- [ ] Multi-owner game matches selected copy; changes update.
- [ ] Non-Steam/free/ineligible/unknown cases have no incorrect badge.
- [ ] Image failure uses fallback; no broken image.
- [ ] D-pad/stick, A/B and context menus work normally.
- [ ] Settings update mounted badges and survive reload.
- [ ] Refresh does not leak or duplicate requests.
- [ ] Account change hides stale badges immediately.
- [ ] Disable and repeated reload remove all existing badges/listeners/timers.
- [ ] Missing runtime APIs disable feature without Library errors.
- [ ] Large-library scrolling/search/view switching has no visible degradation.
- [ ] Offline cached avatars or fallback work.

Record observations, screenshots and failures; no PASS without actual device evidence.

## Next device evidence request (2026-10-03)

No target is connected and no device test was run. Only gate A evidence is requested first; capsule integration is prohibited until gates A and B pass.

1. Record Steam channel and exact client build, SteamOS version, and Decky version from their About/settings screens. Do not change channels. In a Deck terminal, `cat /etc/os-release` supplies the OS build information only; it does not supply Steam/Decky versions.
2. With Decky already working in Gaming Mode, enable Decky's Developer mode in Settings → General, then use Settings → Developer → CEF Console. Current loader source targets **SharedJSContext** and falls back to the target list at `localhost:8080`. Select SharedJSContext if offered. Menu labels may vary with the installed loader version. No remote-debugging setting is needed for this local-console route.
3. Run the probe below for each known fixture, replacing `123456` with its numeric AppID. Return only the JSON line and the corresponding independently known own/lender/selected-copy information. Do not expand or copy the AppOverview object.

```js
(() => {
  const appId = 123456; // replace with one known fixture
  const store = window.appStore;
  if (typeof store?.GetAppOverviewByAppID !== "function") {
    console.log(JSON.stringify({ appId, probe: "appStore API unavailable" }));
    return;
  }
  try {
    const x = store.GetAppOverviewByAppID(appId);
    console.log(JSON.stringify({
      appid: x?.appid ?? null,
      display_name: x?.display_name ?? null,
      owner_account_id: x?.owner_account_id ?? null,
      app_type: x?.app_type ?? null
    }));
  } catch {
    console.log(JSON.stringify({ appId, probe: "targeted read failed" }));
  }
})();
```

Fixtures: own-only, own+family, single lender installed, single lender **uninstalled**, two lenders, sharing-ineligible, free-to-play, and non-Steam shortcut. For the two-lender fixture include the selected copy shown by Steam. If you authorize and manually change its selected copy, repeat the same probe before and after; no plugin or console command switches licenses. Record any unavailable fixture rather than inventing a result. Missing and zero fields do not prove ownership.

No identity global or avatar path is guessed by the plugin. Identity/persona and capsule probes will be narrowed using the actual runtime evidence, after ownership observations are available. Do not send credentials, full stores or authenticated responses. Account identifiers may be replaced consistently with labels in reports; keep actual numeric type/range verification private on the device.

### Optional host inspection over an existing SSH connection

If SSH is already configured, the following tunnel confines host access to localhost. Replace DECK_IP with the actual address; this procedure has not been exercised on the target.

```sh
ssh -N -L 127.0.0.1:18080:127.0.0.1:8080 deck@DECK_IP
```

In another host terminal:

```sh
curl --fail http://127.0.0.1:18080/json/list
```

Open `http://127.0.0.1:18080` in a host browser and select SharedJSContext. If inspector links refer to localhost:8080, replace that host/port with 127.0.0.1:18080 in the inspector URL and its ws parameter. Stop the tunnel with Ctrl-C afterward. If the endpoint is unavailable, report that fact; do not expose ports or change Steam files to work around it.

### Development deployment (pending acceptance)

No ZIP has been produced, per task 22's acceptance gate. The current official template specifies a top-level plugin directory with `dist/index.js`, `plugin.json`, `package.json`, LICENSE and recommended README; `main.py` is optional for frontend-only passive plugins. Loader source confirms passive handling. Once a device-tested artifact and license exist, use Decky's Developer → Install Plugin from ZIP File. Load/unload/reload, settings persistence and rollback must be recorded on the target. For rollback, remove Family Owner using Decky's plugin management; verify Library returns to its baseline. Do not restart arbitrary guessed services or alter Steam release channels.

## Evidence request superseded — 2026-10-03

SteamInfo.md supplies Steam build 1788652215 and the Little Nightmares copy-switch outputs. Do not repeat the original fixture request: the user waived free-to-play, sharing-ineligible and non-Steam probes. The next request is the single targeted identity/lender-name probe in [persona-data.md](research/persona-data.md). Device loading, avatar images, capsule discovery, navigation and release packaging remain untested.

## Next probe correction — 2026-10-03

The first identity/lender-name probe returned only unavailable/null candidates. Use the **corrected source-backed active-account probe at the end of persona-data.md**, which tests SteamClient.WebChat.GetCurrentUserAccountID/GetLocalPersonaName and records context availability. Do not repeat the old probe. No plugin install or channel change is required for this read-only check.

## Active account found; next image-source evidence — 2026-10-03

The corrected WebChat identity probe succeeded (see persona-data.md). Do not repeat it. Next, use the **selected-lender avatar inspection** at the end of that file in the rendered CEF view. Actual plugin loading and login-change behavior remain untested; library integration stays disabled.

## Avatar source observed remotely — 2026-10-03

Chrome remote CEF selected-image inspection succeeded: a Steam CDN avatar loaded at 64×64. No need to repeat it. The next step is the short Sources search/snippet at the end of persona-data.md, to identify the persona/hash lookup. It uses the rendered target already found in Chrome, not the black SharedJSContext view.

## Direct CEF workflow available — 2026-10-03

The agent connected to the user-provided private endpoint, resolved lender cache entries and verified online CDN images directly. Manual avatar/source-search requests above are superseded; they do not need to be repeated. Development-only inspector usage: `node scripts/inspect-cef.mjs HOST:PORT list`, `probe SharedJSContext`, `ownership SharedJSContext`, `avatars SharedJSContext`, and source-only discovery modes. Supply the authorized endpoint explicitly; none is embedded in plugin code. Scripts require Node 22's WebSocket and are excluded from a future runtime package.

Each session closes the WebSocket and clears command/capture/image timers; capture/Debugger modes explicitly disable their domains on exit. No listener/patch remains in Steam. Capsule gate B is still unresolved (runtime candidate count zero); direct adapter/image evidence does not constitute plugin installation or library UI acceptance.

## Temporary frontend evidence — 2026-10-03

Gate B has passed on the observed build. Agent-operated dev-test loads dist/index.js through a temporary Blob module in SharedJSContext and calls the official plugin factory. It navigates to Library using supported Decky navigation, reads only mounted capsule props and explicit overview fields, checks settings/unload, restores scroll/settings and calls onDismount in finally. This verifies the real frontend without writing Steam files or installing into Decky's plugin directory. It is not proof of persistent loader installation.

Verified: installed/uninstalled borrowed fixtures, current multi-owner lender, own/own+family hidden, 14 loaded badges among 25 initial tiles, disable→0, 36px sizing, all corners, forced image fallback and unload→0. Automated scroll encountered 935 games. Task 04 full install and task 19 physical-controller/performance exits remain pending.

Development-only commands (Node 22, authorized private endpoint substituted for HOST:PORT):
```sh
node scripts/inspect-cef.mjs HOST:PORT dev-test SharedJSContext
node scripts/inspect-cef.mjs HOST:PORT dev-start SharedJSContext
node scripts/inspect-cef.mjs HOST:PORT dev-stop SharedJSContext
```
dev-start keeps a temporary build active for manual controls and automatically removes it after 600 seconds. dev-stop removes it immediately. These scripts/debug evidence are excluded from the future ZIP. CEF factory loading does not register a persistent QAM plugin entry.

## Current scope: all reported owners, lower-left

The user replaced selected-copy-only behavior with all reported owners, including self. Older hidden-own results above are historical. Native owner-list gate A2 and six revised rendered fixtures pass on the observed build; see ownership-data.md/progress.md. Dev-test now checks Owned by labels, counts avatars per fixture, excludes detached virtualized nodes, and waits for async lookup before recording counts. Settings v2 migration adopts lower-left. Temporary dev-start runs the latest bundle for 600s; dev-stop removes it. No permanent Decky plugin entry or installable ZIP yet.

Latest dev-test includes requested CS2 (730). It now has one current-user avatar via verified permanent own-license fallback, and group inset is 2px. Seven actual rendered fixtures pass. Native details callback cleanup was checked separately and covered by timeout/abort tests; no persistent Steam files or ownership objects are changed. Other waived free/ineligible/non-Steam fixtures are still skipped.

Current layout is an upward column from bottom-left, superseding horizontal wrapping. Dev-test records avatar positions: two-/three-owner fixtures have constant x and decreasing y, preserving current user at bottom when present. Default 28px avatars use 4px vertical gaps, with 2px corner inset.
