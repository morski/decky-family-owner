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
