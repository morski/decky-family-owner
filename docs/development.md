# Development

## Toolchain and commands

Verified locally: Node 22.14.0, pnpm 9.15.9, TypeScript 5.6.2, Rollup 4.53.3, React 18.3.1, Decky API 1.1.3 and UI 4.11.0. Dependencies are pinned in package.json/pnpm-lock.yaml.

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
pnpm package
python3 scripts/package.py --verify
```

`pnpm package` runs strict production/test typechecking, Vitest, production compilation and ZIP creation. Python 3 standard-library packaging uses an explicit allowlist, deterministic file metadata and a single `decky-family-owner/` root. It verifies entry bytes, CRC, metadata and absence of duplicate entries, and writes a SHA-256 sidecar. No backend, development inspector, dependencies, source, tests, private research or credentials enter the ZIP. Rollup bundles the frontend; Decky supplies its supported runtime API/UI globals.

Tests cover native ownership validation and license fallback, identifier boundaries, queue concurrency, deduplication, cancellation/stale responses, persona matching, account refresh, lifecycle cleanup, reversible patches, fallback images and live settings. These tests are local fixtures and do not prove native Steam runtime behavior.

`scripts/inspect-cef.mjs` is developer-only remote CEF evidence tooling. Temporary development loads have an automatic ten-minute cleanup and explicit `dev-stop`. It is not included in the plugin or ZIP. Read-only `cleanup-check` reports the development instance and rendered owner groups. Do not expose CEF debugging beyond the trusted local network.

Read AGENTS.md, implementation-plan.md and progress.md before changes. Keep native adapters isolated and preserve discovery evidence. If Steam changes, gather targeted device evidence before changing ownership or capsule discovery; do not replace missing evidence with hardcoded IDs, minified symbols, fiber indices or store mutation.

The obsolete selected-owner service/UI and template password/sudo/SSH deployment scripts have been removed. Native Decky ZIP installation is the supported local installation path. Publishing requires separate user instruction and a project license decision.
