import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { BadgeErrorBoundary } from "../components/BadgeErrorBoundary";
import { ConnectedOwnerBadge, type BadgeServices } from "../components/ConnectedOwnerBadge";
import { capsuleAppId, type CapsuleTarget } from "../steam/libraryCapsule";
type TreeProps = { className?: string; children?: ReactNode; "data-family-owner"?: boolean };
const KEY = "family-owner-badge";
// Clone the path only. Native refs, focus props, handlers and children survive.
export function injectCapsuleBadge(tree: ReactNode, boxClass: string, badge: ReactElement): ReactNode {
  let matches = 0;
  function walk(node: ReactNode, inject: boolean, depth = 0): ReactNode {
    if (depth > 30) return node;
    if (Array.isArray(node)) return node.map(child => walk(child, inject, depth + 1));
    if (!isValidElement<TreeProps>(node)) return node;
    // Steam renders this positioned DIV through its native focus component.
    // Preserve that component and append to its existing children.
    if (node.props.className?.split(/\s+/).includes(boxClass)) {
      if (!inject) matches++;
      if (!inject || Children.toArray(node.props.children).some(child => isValidElement<TreeProps>(child) && child.props["data-family-owner"])) return node;
      return cloneElement(node, undefined, node.props.children, badge);
    }
    const children = node.props.children;
    if (children === undefined) return node;
    const next = walk(children, inject, depth + 1);
    return inject && next !== children ? cloneElement(node, undefined, next) : node;
  }
  walk(tree, false);
  return matches === 1 ? walk(tree, true) : tree;
}
export type AfterPatch = (object: CapsuleTarget, property: "type", handler: (args: unknown[], tree: ReactNode) => ReactNode) => { unpatch(): void };
export class LibraryCapsulePatch {
  private remove?: () => void;
  constructor(private patch: AfterPatch, private services: BadgeServices) {}
  installLibraryCapsulePatch(target: CapsuleTarget, boxClass: string): boolean {
    if (this.remove) return true;
    try {
      const handle = this.patch(target, "type", (args, tree) => {
        if (!this.services.lifecycle.getSnapshot()) return tree;
        const appId = capsuleAppId(args[0]);
        if (!appId) return tree;
        try {
          return injectCapsuleBadge(tree, boxClass,
            <BadgeErrorBoundary key={KEY} data-family-owner><ConnectedOwnerBadge appId={appId} services={this.services} /></BadgeErrorBoundary>);
        } catch { return tree; }
      });
      this.remove = () => handle.unpatch();
      return true;
    } catch { return false; }
  }
  removeLibraryCapsulePatch(): void { const remove = this.remove; this.remove = undefined; remove?.(); }
}
