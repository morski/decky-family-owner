import { Component, type ReactNode } from "react";
export class BadgeErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError(): { failed: boolean } { return { failed: true }; }
  render(): ReactNode { return this.state.failed ? null : this.props.children; }
}
