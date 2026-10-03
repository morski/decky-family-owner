# Ownership discovery — gate A
Status: GATE A PASSED FOR OBSERVED BUILD; skipped negative fixtures limit acceptance

## Environment
- Date:
- Steam channel / exact build:
- SteamOS:
- Decky:
- Current user's AccountID (keep private if publishing):

## Safe targeted probe
Run in the correct Gaming Mode CEF context for one known app ID:
```js
const x = window.appStore?.GetAppOverviewByAppID?.(APP_ID);
console.log({appid:x?.appid, display_name:x?.display_name,
  owner_account_id:x?.owner_account_id, app_type:x?.app_type});
```
APP_ID is a placeholder; replace it with an actual numeric Steam app ID. Do not enumerate the entire store.

| Fixture | App ID | User owns? | Known lenders | Observed owner | Steam selected copy | Result |
|---|---|---|---|---|---|---|
| Own only | | | | | | UNTESTED |
| Own + family | | | | | | UNTESTED |
| Single lender installed | | | | | | UNTESTED |
| Single lender uninstalled | | | | | | UNTESTED |
| Multiple lenders | | | | | | UNTESTED |
| Sharing ineligible | | | | | | UNTESTED |
| Free-to-play | | | | | | UNTESTED |
| Non-Steam shortcut | | | | | | UNTESTED |

## Semantics
- Missing/zero values:
- ID type and range:
- Selected-copy change before/after:
- Installed vs uninstalled:
- Own+family behavior:
- Reliable classification rule:
- Fallback options if insufficient:

Gate A: NOT PASSED. Evidence required before borrowed-owner UI integration.

## Local implementation status — 2026-10-03

The injected service accepts only a plugin-owned evidence contract: exact appId, steamGame=true, explicit ownCopy boolean, and a validated selectedLenderAccountId when ownCopy=false. This is a test seam, not a mapping from Steam fields. No actual appStore adapter is bound. Missing identity, absent proof, malformed lender or same-account lender yields unknown. An explicitly proven own copy dominates family-copy availability. A nonzero owner_account_id is never interpreted by runtime code. See device-testing.md for the exact next probe. Gate A remains NOT PASSED.

## User-supplied device observations — 2026-10-03

Source: [SteamInfo.md](SteamInfo.md). These are user-supplied CEF observations, not agent-operated device tests.

- SteamOS 3.8.16, OS build 20260716.1.
- Decky 3.2.9.
- Steam client channel and exact client build: NOT PROVIDED. The OS build is not a Steam client build.

| Reported fixture | App ID | Observed owner_account_id | app_type | Interpretation limit |
|---|---|---|---|---|
| Own, installed: WheelMates | 3905450 | null | 1 | No affirmative own classification from null alone |
| Borrowed, installed: PixelJunk Monsters Ultimate | 243780 | 68324741 | 1 | Lender identity/selected-copy match not independently supplied |
| Borrowed, uninstalled: Sackboy: A Big Adventure | 1599660 | 68324741 | 1 | Field exists for an uninstalled borrowed entry |
| Own, uninstalled: Mini Motorways | 1127500 | null | 1 | No affirmative own classification from null alone |
| Reported own plus borrowed/family: Golf With Your Friends | 431240 | null | 1 | Confirms no nonzero owner in this reported fixture; own+family interpretation should be confirmed |
| Two lenders, not owned: Little Nightmares | 424840 | 79927 | 1 | Selected-copy match and before/after change not yet supplied |

The supplied probe used `?? null`, so these null outputs cannot distinguish an absent property, undefined or literal null. There is no zero-owner, unavailable-app, sharing-ineligible, free-to-play or non-Steam observation yet. All observed app_type values are 1; shortcut/ineligible classification cannot be inferred from that sample.

Gate A remains NOT PASSED. The observations establish a promising field and installed/uninstalled coverage, but cannot distinguish selected lender from preferred/historical owner. No runtime binding or capsule integration is authorized by this evidence alone.

### Minimum remaining checks

1. Record Steam client channel and exact build from Steam's About/system information.
2. For Little Nightmares (424840), record Steam's currently selected lender and whether that lender's AccountID is the observed 79927. If the user chooses to change the copy manually, record selected lender plus this same four-field probe immediately before and after, and after leaving/reopening the game details. No console code or plugin switches licenses.
3. Use the same probe for one free-to-play game, one sharing-ineligible game and one non-Steam shortcut. Label actual own/family availability and mark unavailable fixtures explicitly.
4. To distinguish missing/null for one known owned app, run this targeted primitive-only probe:

```js
(() => {
  const x = window.appStore?.GetAppOverviewByAppID?.(3905450);
  console.log(JSON.stringify({
    appid: x?.appid ?? null,
    display_name: x?.display_name ?? null,
    owner_account_id: x?.owner_account_id ?? null,
    owner_value_type: typeof x?.owner_account_id,
    owner_is_null: x?.owner_account_id === null,
    app_type: x?.app_type ?? null
  }));
})();
```

No broad store enumeration or object dump is needed. Current-account API, persona/avatar resolution and capsule target evidence remain separate pending discovery tasks.

## Updated evidence and scope — 2026-10-03

SteamInfo.md now reports Steam client version/build **1788652215**. Channel remains unspecified. For Little Nightmares 424840 the user reports manually switching the copy, with owner_account_id changing from **79927 to 68324741**; app_type remains 1. This establishes selected-copy responsiveness for the observed fixture, not an agent-run test. Independent lender identity labels are not yet supplied; matching those IDs to the selected people will close the remaining identity part of gate A.

The user explicitly waived point 3 (free-to-play, sharing-ineligible and non-Steam device probes). They are **SKIPPED BY USER**, not PASS, and will not be requested again. Full release coverage remains limited accordingly; unsupported/unknown cases must continue to hide badges. Missing/null distinction is unnecessary for hiding badges: both stay unknown unless another verified source provides affirmative ownership proof.

Gate A: SELECTED-COPY RESPONSE OBSERVED; lender identity correlation still pending. Gate B: NOT PASSED. No capsule integration is begun.

Next discovery is a targeted identity/persona-name probe in docs/research/persona-data.md. It reads candidates only; no Steam global is considered verified until its output is compared with the known active user and selected lender names.

## Direct CEF verification — 2026-10-03

User supplied a private remote CEF endpoint and authorized agent inspection. Node's CDP client connected to SharedJSContext, using supported Decky discovery and explicit targeted reads. No UI copy switch, Steam persistent-file mutation or authenticated Family service request was performed.

- Active persona store AccountID: 552534, matching the already observed WebChat identity.
- Native SteamClient.FamilySharing.GetAvailableLenders(424840) returned SteamID64 76561197960345655 (AccountID 79927, preferred=false) and 76561198028590469 (AccountID 68324741, preferred=true). Only steamid/appid/bPreferred were retained; DLC and other response fields were not dumped.
- Current Little Nightmares owner_account_id is 68324741. Direct cached persona lookup correlates this ID/hash with the avatar inspected by the user. The other lender has a distinct cached ID/hash. Combined with the user's earlier 79927 → 68324741 copy-switch observation, this passes selected-copy ownership gate A for this observed build. A single current preferred=true observation alone would not establish selected-copy semantics.
- Own fixtures 3905450, 1127500 and 431240 have owner_account_id **undefined**, not literal null (typeof=undefined, ownerIsNull=false). Borrowed fixtures 243780 and 1599660 have numeric 68324741. All have app_type=1.
- Adapter reads appid/app_type/owner_account_id only, outside render. It permits borrowed evidence only for app_type=1 with a positive integer AccountID in range; ownership service also rejects active-user matches and unknown identity. Missing/zero owner stays unknown. No affirmative own classification is inferred from absent owner data.
- Selected-copy invalidation/event delivery and running-game edge cases remain untested. Client channel unknown. Negative device fixtures explicitly waived by user remain SKIPPED. Gate A passing does not authorize integration until gate B also passes, or satisfy final release acceptance.

Implemented adapter: src/steam/appStore.ts. Runtime-adapter tests reproduce observed switch and missing-field fixtures and cover malformed IDs, unsupported types and unavailable readers; mock tests do not verify skipped device cases.

## All-owner scope and gate A2 — 2026-10-03

The user superseded selected-lender-only/own-hidden scope with all owner avatars, including self, default lower-left. Direct native GetAvailableLenders reads on build 1788652215 returned:

| Known fixture | AppID | Validated AccountIDs from returned SteamID64 |
|---|---|---|
| Own installed | 3905450 | 552534 (current user) |
| Own uninstalled | 1127500 | 552534 (current user) |
| Own + family | 431240 | 79927, 552534, 87888646 |
| Borrowed installed | 243780 | 68324741 |
| Borrowed uninstalled | 1599660 | 68324741 |
| Two lenders | 424840 | 79927, 68324741 |

Each response row had the requested appid. Current user was independently read through WebChat. Native list includes self; no absent-owner heuristic is needed. Gate A2 passes for reported available owners on the observed build. It does not prove owners who have no available shareable copy or ownership of arbitrary Steam friends outside this list. User-waived negative fixtures remain SKIPPED. Preferred status is irrelevant to displaying all owners. Temporary evidence: /tmp/family-owner-all-owners.json. Existing gate B remains passed.

## CS2 missing badge: permanent own-license evidence — 2026-10-03

User specifically reported Counter-Strike 2 missing, superseding the earlier waived free-game probe only for this requested fixture. AppID 730, app_type=1, visible_in_game_list=true, subscribed_to=true; GetAvailableLenders returns []. Missing lender data is the immediate reason the existing all-owner UI hides. No missing-owner heuristic is added.

Targeted native SteamClient.Apps.RegisterForAppDetails callbacks (unregistered on completion) returned:

| AppID | bIsSubscribedTo | strOwnerSteamID corresponds to | eAppOwnershipFlags | bIsExcludedFromSharing |
|---|---|---|---|---|
| 730 CS2 | true | current user | 2049 (Subscribed + Permanent) | true |
| 431240 own+family | true | current user | 2049 | false |
| 243780 borrowed | true | known lender | 33 (Subscribed + Borrowed) | false |

Official @decky/ui App.ts defines these flag meanings; current loaded Steam source confirms Apps.RegisterForAppDetails registration/unregistration. This is affirmative explicit own-license proof independent of missing owner_account_id. Fallback is permitted only after a successful empty native lender list, exact app-ID/current SteamID match, bIsSubscribedTo=true, Subscribed+Permanent flags and no Borrowed/Pending/Expired/Canceled bits. Unknown/error/malformed lists remain hidden. Other people's CS2 ownership is not established by a local current-user license.

Fallback subscriptions run outside render, finish after first callback/3s timeout, and unregister on completion, abort/account change, or unload. Temporary evidence: /tmp/family-owner-cs2.json and /tmp/family-owner-license-details.json. Other waived negative fixtures remain SKIPPED.
