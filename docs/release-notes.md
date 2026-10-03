# 0.1.0 — local install build

User approved the upward avatar layout and requested cleanup and a Decky-installable build. This is a private local artifact, not a published release.

- Shows all native reported owners, including self, with 2px bottom-left inset and an upward vertical stack.
- Adds exact permanent self-license fallback for successful empty lender lists, verified for CS2.
- Provides cached avatars, initial/silhouette fallback, live enable/size/corner settings, bounded requests and complete unload cleanup.
- Removes obsolete single-owner code and template backend/deployment scaffolding.

Real temporary frontend verification: SteamOS 3.8.16 (20260716.1), Steam client 1788652215, Decky 3.2.9. Own installed/uninstalled, borrowed installed/uninstalled, own+family (three owners), borrowed multi-owner (two), CS2, settings persistence, image error fallback, upward geometry and unload were observed. Scripted scrolling encountered 935 mounted AppIDs. The current Steam channel is unknown.

Not verified: fresh persistent ZIP installation/QAM panel, full physical-controller acceptance, actual logout/account/family changes, offline requests or another Steam channel. Other waived discovery fixtures remain skipped. These are tracked separately from local archive acceptance. No fabricated Steam results or public release/store submission.

Project code remains UNLICENSED until the owner chooses terms for public distribution; the upstream BSD template notice is preserved in LICENSE.
