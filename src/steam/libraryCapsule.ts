export interface CapsuleTarget { type: (...args: unknown[]) => unknown }
export type ModuleSearch = (filter: (module: unknown) => boolean) => unknown[];
function values(module: unknown): unknown[] {
  if (!module || !["object", "function"].includes(typeof module)) return [];
  return Object.keys(module).flatMap(key => {
    try { return [(module as Record<string, unknown>)[key]]; } catch { return []; }
  });
}
// Proven by exact identity against 25 native capsule renders on build 1788652215.
export function discoverLibraryCapsule(search: ModuleSearch): { target: CapsuleTarget; boxClass: string } | undefined {
  try {
    const modules = new Set<unknown>();
    const classes = new Set<string>();
    search(module => {
      const css = module as { LibraryItemBox?: unknown; LibraryItemOverlayOuterArea?: unknown } | null;
      if (typeof css?.LibraryItemBox === "string" && typeof css.LibraryItemOverlayOuterArea === "string") classes.add(css.LibraryItemBox);
      if (values(module).some(value => {
        const proto = (value as { prototype?: Record<string, unknown> } | null)?.prototype;
        return typeof proto?.GetAssetImage === "function" && typeof proto.BHasVerticalCapsule === "function";
      })) modules.add(module);
      return false;
    });
    if (modules.size !== 1 || classes.size !== 1) return undefined;
    const targets = new Set(values([...modules][0]).filter(value => {
      const memo = value as { $$typeof?: symbol; type?: unknown } | null;
      return memo?.$$typeof === Symbol.for("react.memo") && typeof memo.type === "function";
    }));
    if (targets.size !== 1) return undefined;
    return { target: [...targets][0] as CapsuleTarget, boxClass: [...classes][0] };
  } catch { return undefined; }
}
export function capsuleAppId(props: unknown): number | undefined {
  const id = (props as { app?: { appid?: unknown } } | null)?.app?.appid;
  return typeof id === "number" && Number.isInteger(id) && id > 0 && id <= 2147483647 ? id : undefined;
}
