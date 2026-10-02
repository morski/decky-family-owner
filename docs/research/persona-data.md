# Current user and persona discovery
Status: UNTESTED

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
