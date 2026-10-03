# Family Owner

A frontend-only Decky plugin that shows verified Steam Families owners on Gaming Mode Library capsules. Includes your avatar when you own a copy and every owner reported by Steam's available-lender list. Avatars grow upward from the lower-left corner; missing ownership hides the badge.

## Install

Build locally with `pnpm install --frozen-lockfile` and `pnpm package`, or use the generated `out/FamilyOwner-v0.1.0.zip`. Copy the ZIP to your Deck. In Decky settings, enable Developer Mode if needed, open Developer, and choose **Install Plugin from ZIP File**. Select the ZIP and confirm installation. Open Family Owner in Decky's plugin drawer to enable badges, change size/corner, or refresh ownership.

See [installation and verification](docs/installation.md). The local ZIP is verified structurally; a fresh persistent installation has not yet been tested. The approved temporary frontend was removed from the Deck.

## How it works

Ownership comes from native Steam Families APIs. A successful empty lender list can use exact proof of your permanent subscribed license, including Counter-Strike 2. Names and avatar hashes come from Steam's existing persona caches; images use Steam's avatar CDN. No API keys, credentials, backend, license switching, or Steam store mutations.

Unknown owners stay hidden. Known owners with missing images get initials or a silhouette. Badges cannot receive focus or pointer/gamepad input. Settings persist in plugin browser storage. Account changes invalidate asynchronous work; unload hides badges and removes patches, subscriptions and timers.

- [Architecture and code map](docs/architecture.md)
- [UI and ownership design](docs/design.md)
- [Development and packaging](docs/development.md)
- [Installation](docs/installation.md)
- [Build notes and tested scope](docs/release-notes.md)

Actual device discovery and temporary runtime checks used SteamOS 3.8.16, Steam client 1788652215, and Decky 3.2.9. Steam internals can change; discovery requires unique structural matches and fails closed. Channel, fresh installation, real account transitions and offline behavior remain unverified.

Project code is currently UNLICENSED pending a public license decision. [LICENSE](LICENSE) preserves the official template's BSD notice. No public release or store submission has been made.
