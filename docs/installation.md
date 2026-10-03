# Installation and removal

1. Build with `pnpm package` or use `out/FamilyOwner-v0.1.0.zip` from this checkout.
2. Copy the ZIP to a convenient location in the Deck's home folder using your usual file transfer method.
3. In Gaming Mode, open Decky settings. Enable Developer Mode if the Developer page is hidden.
4. Open **Developer → Install Plugin from ZIP File**, select the ZIP and confirm the installation prompt.
5. Open Family Owner in the Decky plugin drawer. Enable badges and return to Library. Ownership/avatar reads are asynchronous; allow tiles to settle.

No Steam API key, backend setup or changes to Steam files are needed. The archive uses the single-root layout consumed by Decky's native ZIP installer. This layout and archive contents are checked locally against the installer contract. A fresh persistent device installation has not yet been performed; the earlier device evidence came from the production frontend loaded temporarily.

For acceptance, check one owned game, one own+family game, one borrowed game and CS2; confirm owner counts, upward lower-left layout and game activation. Toggle enable, size/corner and refresh. Reload Decky to confirm preferences, then uninstall through Decky's plugin management to confirm badges disappear. Record actual client/Decky versions and results; do not infer runtime success from the ZIP check.

Temporary development code was stopped before packaging. Read-only cleanup inspection confirmed no development instance and zero rendered owner groups. Nothing was installed persistently during that temporary test. Saved plugin preferences can remain for the regular installation.

If badges disappear after a Steam update, ambiguous discovery or unknown ownership may be failing closed. Record versions and targeted evidence; the native Library should remain usable. Do not switch Steam release channels as part of installation.
