# Current user and persona discovery
Status: CACHE-BACKED LENDER LOOKUP AND ONLINE AVATARS VERIFIED; offline/login transitions UNTESTED

Record exact versions from ownership-data.md.

## Current account
- Verified global/API:
- Narrow fields read:
- AccountID / SteamID64 types:
- Login-change subscription or fallback:

## Avatar resolution
- Verified persona store/API:
- Name and avatar fields:
- Avatar URL scheme/path:
- Verified loopback route, if any:
- Offline/cached image result:
- Missing/private persona result:
- Failed image result:
- Refresh/retry policy:

The proposed steamloopback.host/avatarcache/<SteamID64>.png route is unverified. Determine the actual route on the Deck. Frontend code cannot read arbitrary local Steam cache files directly.

## Decision
Chosen source, evidence, limitations, backend necessity (if any):

## Local implementation status — 2026-10-03

No current-account global or persona/loopback route is bound. readCurrentUser validates an injected AccountID and derives a decimal SteamID64; unavailable/zero identity fails closed. Account notification source remains undiscovered.

PersonaService requires a device-proven injected resolver and URL allowlist. Web image URLs must also be absolute HTTP(S) without embedded credentials. No avatar fetch occurs in the development plugin. Settled cache is bounded at 256 entries, successful image TTL is 5 minutes, missing/failed-image-source retry TTL is 30 seconds. Pending requests are deduplicated; account changes, manual invalidation and unload advance a generation so late responses return undefined and cannot overwrite new caches/pending requests. Invalidations notify subscribers. Image loading errors use a UI fallback until the URL changes; no automatic image-error refresh loop exists. Offline resolution remains UNTESTED.

## Next targeted identity and lender-name probe — 2026-10-03

Run in the same Gaming Mode SharedJSContext. These are **discovery candidates**, not implemented runtime bindings. g_AccountID/g_steamID and SteamClient.User.GetSteamID have not been verified on this device. The persona-cache shape is a source lead from TabMaster's friendStore declarations at cd01770a80a37e0692e76ad8083719c15205f5d9, not target-device evidence. Only two known lender IDs are queried; no friend/store enumeration or authenticated request is performed.

```js
(async () => {
  let steamIdFromReader = null;
  try {
    const user = window.SteamClient?.User;
    if (typeof user?.GetSteamID === "function") {
      const value = await user.GetSteamID();
      if (typeof value === "string" && /^[0-9]{17}$/.test(value)) {
        steamIdFromReader = value;
      }
    }
  } catch { /* unavailable candidate */ }
  const accountCandidate = window.g_AccountID;
  const steamIdCandidate = window.g_steamID;
  const personas = [79927, 68324741].map(accountId => {
    try {
      const cache = window.friendStore?.m_mapPersonaCache?._data;
      const persona = typeof cache?.get === "function"
        ? cache.get(accountId)?.value?.m_persona : undefined;
      const name = persona?.m_strPlayerName;
      return { accountId, name: typeof name === "string" ? name : null };
    } catch { return { accountId, name: null }; }
  });
  console.log(JSON.stringify({
    accountIdCandidate: typeof accountCandidate === "number" ? accountCandidate : null,
    steamIdCandidate: typeof steamIdCandidate === "string" ? steamIdCandidate : null,
    steamIdReaderAvailable: typeof window.SteamClient?.User?.GetSteamID === "function",
    steamIdFromReader,
    personas
  }));
})();
```

Return this JSON and confirm whether any identity candidate belongs to the active account, and whether the two persona names correspond to Steam's selected copies before/after the switch. If candidates are null, report them as null; do not dump stores. Names may be replaced consistently with Lender A/Lender B. No avatar route, login subscription or persona getter is bound based on this probe's existence.


{"accountIdCandidate":null,"steamIdCandidate":null,"steamIdReaderAvailable":false,"steamIdFromReader":null,"personas":[{"accountId":79927,"name":null},{"accountId":68324741,"name":null}]}

## Supplied result reviewed — 2026-10-03

The user appended the JSON above: both identity candidates null; SteamClient.User.GetSteamID unavailable; both targeted cached persona names null. These paths are not usable from this tested context. The result cannot distinguish missing friendStore, absent cache entries and a changed cache shape, since the probe collapsed all of those to null. It does not prove that all frontend identity/persona access is impossible.

No failed candidate is bound into runtime code. No task checkbox advances. Ownership selected-copy responsiveness remains observed; independent lender identity correlation and capsule gate B remain pending. The user-waived negative fixture probes remain skipped.

### Corrected source-backed active-account probe

Inspected official decky-frontend-lib commit `4b68ef7287d8b11e62ed7b285532cf4ea36df89c`, `src/globals/steam-client/WebChat.ts`. It declares **GetCurrentUserAccountID(): Promise<number>** and **GetLocalPersonaName(): Promise<string>** under SteamClient.WebChat. This is source evidence, not proof of target availability. The original GetSteamID candidate had no equivalent source evidence and is retired.

Official reference: https://github.com/SteamDeckHomebrew/decky-frontend-lib/blob/4b68ef7287d8b11e62ed7b285532cf4ea36df89c/src/globals/steam-client/WebChat.ts

Run this in the same Gaming Mode SharedJSContext. It reads only current-account ID/name and API availability. The appStore check helps identify whether the context still exposes the known library API. Each read has a five-second timeout and timer cleanup; no registration, mutation, credential read or whole-object dump occurs.

```js
(async () => {
  const client = typeof SteamClient !== "undefined" ? SteamClient : window.SteamClient;
  const chat = client?.WebChat;
  async function read(method) {
    if (typeof chat?.[method] !== "function") return { status: "unavailable" };
    let timer;
    try {
      const value = await Promise.race([
        Promise.resolve().then(() => chat[method]()),
        new Promise((_, reject) => { timer = setTimeout(() => reject(), 5000); })
      ]);
      return typeof value === "number" || typeof value === "string"
        ? { status: "returned", value, type: typeof value }
        : { status: "unexpected type", type: typeof value };
    } catch { return { status: "failed or timed out" }; }
    finally { clearTimeout(timer); }
  }
  const [account, personaName] = await Promise.all([
    read("GetCurrentUserAccountID"), read("GetLocalPersonaName")
  ]);
  console.log(JSON.stringify({
    appStoreAvailable: typeof window.appStore?.GetAppOverviewByAppID === "function",
    steamClientAvailable: !!client,
    webChatAvailable: !!chat,
    account, personaName
  }));
})();
```

Append the JSON and confirm whether the returned name is your active Steam profile. If the ID returns, compare it with your known active account if available; deriving a SteamID64 for profile comparison uses BASE 76561197960265728n only after the numeric AccountID is validated. Do not repeat the old null-returning probe or the skipped negative fixtures.

Avatar source and lender-persona source still require separate targeted discovery. GetLocalPersonaName identifies only the current user, not either lender. No API subscription is installed because its target behavior and unregister contract remain untested.


{"appStoreAvailable":true,"steamClientAvailable":true,"webChatAvailable":true,"account":{"status":"returned","value":552534,"type":"number"},"personaName":{"status":"returned","value":"morski","type":"string"}}

## Successful active-account observation — 2026-10-03

The newest supplied JSON reports appStoreAvailable/steamClientAvailable/webChatAvailable all true, GetCurrentUserAccountID returning numeric **552534**, and GetLocalPersonaName returning **morski**. Derived individual public-universe SteamID64: **76561197960818262**. This is user-supplied runtime evidence on the recorded Steam build 1788652215; not a plugin load test or a login-change test. Lender identities/avatars were not queried by this corrected probe.

Implemented the observed WebChat.GetCurrentUserAccountID reader behind an injected adapter, preserving its receiver. CurrentUserService performs bounded asynchronous reads outside render, clears identity at refresh start, ignores obsolete results, clears timeout timers and resolves pending callers on unload. Initial plugin load and the existing manual Refresh action request identity. Account changes are detected only when refreshed at this stage; no unverified login subscription or account polling is installed. No badges are enabled while this limitation exists.

Local tests cover the exact observed ID, rejected/unavailable/malformed IDs, active refresh transitions, older promise races, timeout and teardown. Task 08 remains partial because actual plugin load and automatic login-change handling are not yet verified.

### Next: inspect one actual selected-lender avatar

This step uses an image Steam already displays, rather than guessing another cache or URL route.

1. In Gaming Mode, open Little Nightmares' copy selector/details and show the **currently selected lender's avatar**. Record which selected lender it belongs to (an anonymous label is fine). The latest owner_account_id observation for this selected copy is 68324741.
2. In CEF DevTools, inspect the page/target that actually renders that view. Open Elements and use its element picker to select that lender's avatar. SharedJSContext may not contain the rendered DOM; if Elements is empty, return to the CEF target list and choose the rendered Steam UI view. Do not switch Steam channels.
3. Run the following in that target's Console. `$0` is DevTools' selected element, not a React-fiber index. The probe reads one chosen image and optional wrapping profile link; it prints only URL origin/path, not query strings or fragments, and issues no requests.

```js
(() => {
  const selected = typeof $0 !== "undefined" ? $0 : null;
  const img = selected?.tagName === "IMG" ? selected : selected?.querySelector?.("img");
  if (!img) {
    console.log(JSON.stringify({ status: "selected element has no image" }));
    return;
  }
  function urlParts(value) {
    if (!value) return null;
    try {
      const url = new URL(value, location.href);
      if (!["https:", "http:"].includes(url.protocol)) return { scheme: url.protocol };
      return { origin: url.origin, path: url.pathname, hasQuery: !!url.search };
    } catch { return null; }
  }
  console.log(JSON.stringify({
    avatar: urlParts(img.currentSrc || img.getAttribute("src")),
    loaded: img.complete && img.naturalWidth > 0,
    width: img.naturalWidth,
    height: img.naturalHeight,
    profile: urlParts(img.closest("a")?.getAttribute("href"))
  }));
})();
```

Append the JSON and the selected-lender label. If this view has no visible lender avatar or you cannot locate the rendered target, report that exact limitation instead of substituting your own avatar or a game image. No new copy switch is needed. Actual loaded image source may guide the next resolver probe, but does not by itself prove an AccountID-to-avatar API or offline behavior.

## SharedJSContext black-screen clarification — 2026-10-03

User reports a black screen in SharedJSContext. A background/shared JavaScript target may have no rendered UI; this report alone does not establish a Steam or plugin failure. The successful account/appStore probes remain valid. No new runtime or device PASS is inferred.

For the selected-avatar DOM inspection, return to the CEF **target list**, rather than selecting another execution context inside the same DevTools target:

1. Open `http://localhost:8080` on the Deck. If using the previously documented host SSH tunnel, use `http://127.0.0.1:18080` on that host instead.
2. Inspect a separate Steam UI page target, with Little Nightmares' copy selector open. Names vary; select by the rendered content, not a hardcoded title. SharedJSContext is not required for this DOM step.
3. In that target's Elements panel, verify Steam's UI DOM exists, then select the lender avatar and run the selected-image probe above.

If the target list has only a shared/blank target or there is no rendered Steam UI DOM, stop this DOM route and report **only target titles** and whether Elements contains UI. Do not dump targets' URLs/objects, stores or credentials. We will use another source-discovery route rather than repeating the black-screen step.

If instead the actual Steam Gaming Mode screen is black outside DevTools, close the inspector and report that distinction; do not assume it is the expected background-context behavior. No plugin install, Steam file change or client-channel change is requested.


{"avatar":{"origin":"https://avatars.steamstatic.com","path":"/1eed2efd03a89fe4d95cd5fd62661a522fe1d5e0_medium.jpg","hasQuery":false},"loaded":true,"width":64,"height":64,"profile":null}

## Loaded avatar observation — 2026-10-03

User supplied the selected-image JSON above via remote Chrome CEF debugging. It reports origin **https://avatars.steamstatic.com**, path **/1eed2efd03a89fe4d95cd5fd62661a522fe1d5e0_medium.jpg**, no query, loaded=true, intrinsic size 64×64 and no wrapping profile link. This proves the inspected image loaded from that CDN in the inspected Steam UI target. It does not identify a persona lookup API, map the image hash to either AccountID, establish offline behavior, or verify the steamloopback avatarcache hypothesis.

Implemented src/steam/avatarUrl.ts as a narrow policy for the observed HTTPS origin and 40-lowercase-hex `_medium.jpg` path shape. It rejects credentials, query/fragment, foreign origins, unsupported image variants and malformed paths. It performs no request, synthesizes no hashes and is not bound to an unverified persona adapter. Tests cover observed URL and rejected source shapes. Runtime remains fallback-only for lender personas until the lookup is proven.

### Next source inspection in remote Chrome

We need the Steam code that obtains an avatar hash for a given person. Do not repeat the image-selection or old failed persona-cache probes.

1. Keep the **rendered Steam UI target** inspected in Chrome (the target where the image probe succeeded).
2. Open **Sources**, press **Ctrl+Shift+F** (search all loaded sources), and search for `_medium.jpg` (without quotes).
3. Open a JavaScript match, press the **{ }** pretty-print button if the source is compressed, and copy a short snippet around the avatar URL construction (roughly 10–20 lines). Include the enclosing function/getter if visible; do not copy the entire bundle or runtime objects.
4. If no loaded JavaScript match exists, search `m_mapPersonaCache` instead, the descriptive source lead previously seen in TabMaster. Report no matches if neither is present; do not guess a new global.

Append the snippet under a new heading in this file. This is read-only source inspection; there is no command to enumerate MobX stores or traverse React fibers. Source snippets must not include credentials or authenticated responses. Runtime lookup discovery will use structural evidence and ambiguity checks, never fixed minified symbols/module IDs.

## Source searches unsuccessful — 2026-10-03

User reports no matches for `_medium.jpg` or `m_mapPersonaCache` in Chrome's loaded-source search. Neither selector is used for runtime discovery. No matches do not prove that Steam lacks persona access: the URL may be assembled from separate strings or the implementation may live in another context/source. Those explanations remain hypotheses, not observations.

### Next: trace the already-observed avatar request

Use the rendered Steam UI target in remote Chrome:

1. Open **Network**, ensure recording is enabled, and enter `1eed2efd` in the filter (the prefix of the observed avatar filename).
2. On the Deck, close and reopen the Little Nightmares copy selector. Do not change the selected copy or reload Steam.
3. If the avatar request appears, right-click that single row → **Copy → Copy stack trace**. Append only that stack trace here. Alternatively hover the **Initiator** column and follow its source link to capture the short relevant code snippet.
4. If there is no row or the initiator is Parser/Other without a JavaScript stack, report that exact result. Do not keep retrying the missing source searches.

Official Chrome reference: https://developer.chrome.com/docs/devtools/network/reference#view-the-stack-trace-that-caused-a-request . Chrome documents the Initiator column/source link and Copy stack trace action for script-initiated requests. A stack may identify only React's image assignment; it does not automatically prove the lender lookup.

No HAR, Copy as cURL/fetch, request headers, cookies or authenticated response is requested. The next evidence is limited to the initiating code of the known public avatar request. No plugin code, backend, release gate or compatibility result changes from this search failure.

## Direct CEF persona and image verification — 2026-10-03

User authorized direct remote inspection. The agent found **one unique** exported persona-store singleton through window.DFL.findAllModules. Discovery matched descriptive methods/explicit cache fields; no fixed webpack ID, export symbol, minified name or fiber index is used. The final predicate in src/steam/personas.ts was independently rerun on-device and returned one candidate.

Narrow cache path:

```text
store.m_FriendsUIFriendStore.m_mapPlayerCache.get(AccountID)
  || store.m_mapPlayerCache.get(AccountID)
player.m_persona.m_strPlayerName
player.m_persona.m_strAvatarHash
player.m_persona.m_steamid.ConvertTo64BitString()
store.currentUserSteamID.GetAccountID()
```

No map/store enumeration is performed. Steam's GetFriendState delegates to GetPlayer, which can call AddPlayerToCache for missing entries; **neither method is called by the adapter**. Missing cached entries produce a generic fallback rather than Steam cache mutation or profile fetches. A profile-loader source lead uses credentialed requests; it is not invoked or implemented.

| Lender | AccountID | Verified cached SteamID64 | Avatar hash | Online image result |
|---|---|---|---|---|
| A | 79927 | 76561197960345655 | e729340c0cda2935be187cda3208e346882cc811 | Loaded, 64×64 |
| B | 68324741 | 76561198028590469 | 1eed2efd03a89fe4d95cd5fd62661a522fe1d5e0 | Loaded, 64×64 |

Both cached names resolved. Names are omitted from this summary to minimize account details. Lender B's hash exactly matches the user's selected-avatar image. Two unmounted temporary Image instances on the Deck verified the derived HTTPS Steam CDN `_medium.jpg` URLs; handlers/timers were removed and image sources cleared afterward. Offline was not tested or forced.

Implemented src/steam/personas.ts and wired it to PersonaService at plugin initialization. Before resolving, adapter validates current store account against the plugin's identity and validates the requested persona SteamID64. Avatar source is restricted to the observed HTTPS CDN path. Structural ambiguity/missing cache/invalid hash returns fallback. No CDP tool is included in plugin runtime or intended release package.

Initial 30-second Network capture saw no matching request; it was cleaned up. Direct static-source and cache inspection solved the lookup without a captured initiator stack, so no further manual Chrome probes are required for this step. Plugin installation, automatic login updates, offline behavior and actual capsule rendering remain unverified.
