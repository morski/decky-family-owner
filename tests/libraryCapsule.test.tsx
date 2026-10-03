import { describe, expect, it, vi } from "vitest";
import { createRef, isValidElement, type ReactElement } from "react";
import { capsuleAppId, discoverLibraryCapsule } from "../src/steam/libraryCapsule";
import { injectCapsuleBadge, LibraryCapsulePatch } from "../src/patches/libraryCapsulePatch";
import type { BadgeServices } from "../src/components/ConnectedOwnerBadge";
import { Lifecycle } from "../src/services/lifecycle";
const css = { LibraryItemBox: "observed-class", LibraryItemOverlayOuterArea: "overlay" };
class Portrait { GetAssetImage() {} BHasVerticalCapsule() {} }
const memo = { $$typeof: Symbol.for("react.memo"), type: () => null };
const module = { portrait: Portrait, capsule: memo };
const search = (modules: unknown[]) => (filter: (module: unknown) => boolean) => modules.filter(filter);
describe("device-grounded capsule discovery", () => {
  it("selects by methods and React shape, deduplicating repeated module observations", () => {
    expect(discoverLibraryCapsule(search([css, module, module]))).toEqual({ target: memo, boxClass: "observed-class" });
  });
  it("fails closed on missing/ambiguous module, memo and CSS", () => {
    for (const modules of [[], [css], [module], [css, module, { ...module }], [css, { ...module, other: { ...memo } }], [css, { ...css, LibraryItemBox: "other" }, module]]) {
      expect(discoverLibraryCapsule(search(modules))).toBeUndefined();
    }
    expect(discoverLibraryCapsule(() => { throw Error(); })).toBeUndefined();
  });
  it("accepts only observed numeric app props", () => {
    expect(capsuleAppId({ app: { appid: 1599660 } })).toBe(1599660);
    for (const props of [null, {}, { appid: 10 }, { app: { appid: "10" } }, { app: { appid: -1 } }]) expect(capsuleAppId(props)).toBeUndefined();
  });
});
it("clones a unique native container without losing focus/ref/children or mutating original", () => {
  const ref = createRef<HTMLDivElement>(); const click = vi.fn();
  const child = <img src="native.jpg" />;
  const native = <section><div ref={ref} className="extra observed-class" onClick={click} tabIndex={0}>{child}</div></section>;
  const badge = <span key="badge" data-family-owner />;
  const result = injectCapsuleBadge(native, "observed-class", badge) as ReactElement;
  expect(result).not.toBe(native);
  const box = result.props.children;
  expect(box.props.onClick).toBe(click); expect(box.props.tabIndex).toBe(0); expect(box.ref).toBe(ref);
  expect(box.props.children[0]).toBe(child); expect(box.props.children[1]).toBe(badge);
  expect(native.props.children.props.children).toBe(child);
  expect(injectCapsuleBadge(result, "observed-class", badge)).toEqual(result);
  const ambiguous = <><div className="observed-class" /><div className="observed-class" /></>;
  expect(injectCapsuleBadge(ambiguous, "observed-class", badge)).toBe(ambiguous);
});
it("patch install/remove are idempotent; invalid props/unload preserve native output", () => {
  const lifecycle = new Lifecycle();
  const unpatch = vi.fn(); let handler!: (args: unknown[], tree: ReactElement) => unknown;
  const after = vi.fn((_object, _property, callback) => { handler = callback; return { unpatch }; });
  const patch = new LibraryCapsulePatch(after, { lifecycle } as BadgeServices);
  expect(patch.installLibraryCapsulePatch(memo, "observed-class")).toBe(true);
  patch.installLibraryCapsulePatch(memo, "observed-class"); expect(after).toHaveBeenCalledTimes(1);
  const native = <div className="observed-class" />;
  expect(handler([{}], native)).toBe(native);
  expect(isValidElement(handler([{ app: { appid: 10 } }], native))).toBe(true);
  lifecycle.dispose(); expect(handler([{ app: { appid: 10 } }], native)).toBe(native);
  patch.removeLibraryCapsulePatch(); patch.removeLibraryCapsulePatch(); expect(unpatch).toHaveBeenCalledTimes(1);
});
it("preserves Steam's focus component around the positioned native DIV", () => {
  const FocusContainer = ({ className, children }: { className: string; children?: React.ReactNode }) => <div className={className}>{children}</div>;
  const native = <FocusContainer className="observed-class"><img src="native.jpg" /></FocusContainer>;
  const badge = <span data-family-owner />;
  const result = injectCapsuleBadge(native, "observed-class", badge) as ReactElement;
  expect(result.type).toBe(FocusContainer);
  expect(result.props.children[0]).toBe(native.props.children);
  expect(result.props.children[1]).toBe(badge);
});
