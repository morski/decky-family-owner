# Compatibility

| Date | Steam channel/build | SteamOS | Decky | Plugin commit | Result | Evidence/limitations |
|---|---|---|---|---|---|---|
| | Stable | | | | UNTESTED | |
| | Beta | | | | UNTESTED | |

Do not switch the user's Steam channel without authorization. Unit tests do not establish Steam runtime compatibility.

## User-supplied environment, not a plugin compatibility pass

| Evidence date | Steam channel/build | SteamOS | Decky | Result | Source |
|---|---|---|---|---|---|
| 2026-10-03 | Channel unknown / 1788652215 | 3.8.16, build 20260716.1 | 3.2.9 | Ownership probes only; plugin load, UI and navigation UNTESTED | [SteamInfo.md](research/SteamInfo.md) |

Stable/Beta acceptance remains UNTESTED. Do not equate the supplied OS build with the Steam client build.

The user waived free-to-play, sharing-ineligible and non-Steam device probes on 2026-10-03. These are SKIPPED, not verified compatible.

## Direct adapter evidence — 2026-10-03

Agent-operated private CEF reads confirmed targeted ownership fields, native lender-list ID correlation, unique cached-persona discovery and both online avatar loads on the recorded environment. This is adapter evidence only. Plugin load/unload, capsule rendering, navigation, performance, login transitions, offline and Stable/Beta acceptance remain UNTESTED; no full compatibility PASS.

## Temporary frontend UI verification — 2026-10-03

Observed client 1788652215 / SteamOS 3.8.16 build 20260716.1 / Decky 3.2.9, channel awaiting confirmation. Capsule discovery passed by exact type/export identity. Temporary production-frontend factory load displayed correct avatars on installed/uninstalled borrowed fixtures and hid own/own+family badges. Disable, corner/size and unload behavior passed; original patch target restored. 935 distinct games encountered by native scrolling. This is a scoped development UI PASS, not full release compatibility: persistent installation, controller/perceived performance, account/copy transitions, offline and other channels remain UNTESTED.

## All-owner scope verification — 2026-10-03

On the same observed build, native GetAvailableLenders includes self and family owners. Revised temporary frontend passes: Golf With Your Friends 3 loaded avatars (including self); Little Nightmares 2; own installed/uninstalled 1 self avatar each; borrowed installed/uninstalled 1 lender each. Lower-left groups observed at 6px insets; wrapping, disable/unload and original memo restoration passed. 30 loaded avatars among initial 25 capsules; 935 mounted games encountered by scrolling. Nondefault settings survived factory reload. Physical controller/perceived performance, offline, account/family changes, persistent installation and channel acceptance remain pending; this is not full release acceptance.

## CS2 and inset verification — 2026-10-03

Same observed environment: CS2's native lender list is empty; short-lived native AppDetails proves the current-user subscribed permanent license and sharing exclusion. Revised temporary frontend shows one loaded current-user avatar on its actual capsule. Existing six owner-list fixtures pass unchanged, group inset observed at bottom/left 2px, unload removes every avatar/restores original memo. This adds CS2 evidence only; other previously waived negative fixtures remain SKIPPED. Full compatibility/install/controller/account-transition acceptance remains pending.

Latest layout revision: vertical upward stack. On the observed build, three-owner 431240 and two-owner 424840 show all loaded avatars at the same x coordinate and successive positions 32px upward (28px avatars + 4px gaps). Bottom/left remain 2px. Unload still removes all badges and restores native component identity.
