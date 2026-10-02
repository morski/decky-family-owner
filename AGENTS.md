# Agent instructions — Family Owner

## Goal
Show a small avatar on Steam Gaming Mode library capsules for games borrowed through Steam Families. Display the owner of the selected copy only when this can be established reliably. Current-user games and unknown/non-Steam entries stay unchanged.

## Read order
1. `docs/implementation-plan.md`
2. `docs/progress.md`
3. Relevant research and test records.

## Rules
- Frontend-only TypeScript/React MVP. Use current official Decky template and supported Decky APIs.
- Existing planning files must survive scaffold import. Clone the template into a separate temporary directory and copy its scaffold deliberately. Never delete an existing repository's `.git` directory.
- Treat `owner_account_id`, persona globals and loopback avatar paths as unverified hypotheses until tested on the target Deck. Do not assume a nonzero owner is the selected lender.
- No Steam API keys, tokens, cookies, credential collection or plugin-operated service.
- Never mutate Steam AppOverview/store objects or persistent Steam files. Do not use appmanifest LastOwner as the ownership source.
- Isolate runtime adapters. Read explicit fields only; never enumerate MobX stores during React render. No synchronous I/O or broad library scans in render.
- Unknown ownership fails closed for the badge; failures leave Steam Library usable.
- No fixed webpack IDs, minified symbol names or React fiber indices. Structural component discovery needs evidence and ambiguity checks.
- Every patch, listener, subscription and timer has cleanup. Unload hides mounted badges immediately as well as removing future patches.
- Avatar requests are cached and deduplicated. Handle stale responses after account changes and unload.
- Badge has no focus target, pointer handling or gamepad handling.
- Use meaningful unit tests for ownership, ID validation, persona concurrency, lifecycle and UI fallback. Run build/typecheck and applicable tests.
- Record actual versions and evidence. Mark blocked or untested work explicitly. Never claim device verification from mocks.
- Do not add a backend unless documented frontend discovery proves it necessary; reassess scope first.
- Do not publish, submit store PRs or change Steam release channels without user authorization.

## Work tracking
Check off tasks only when their exit conditions pass. Record changes, commands, outcomes, blockers and next actions in `docs/progress.md`. At a device gate, finish independent local work and give the user a small, precise evidence request.
