# Ownership discovery — gate A
Status: UNTESTED

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
