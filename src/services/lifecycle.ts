export class Lifecycle {
  private active = true;
  private listeners = new Set<() => void>();
  private cleanups: Array<() => void> = [];
  getSnapshot = (): boolean => this.active;
  subscribe = (listener: () => void): (() => void) => {
    if (!this.active) return () => {};
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };
  addCleanup(cleanup: () => void): void {
    if (this.active) this.cleanups.push(cleanup);
    else { try { cleanup(); } catch { /* teardown remains safe */ } }
  }
  dispose(): void {
    if (!this.active) return;
    this.active = false;
    // Notify mounted consumers before removing patches/listeners.
    for (const listener of this.listeners) { try { listener(); } catch { /* isolate listeners */ } }
    this.listeners.clear();
    for (const cleanup of this.cleanups.reverse()) { try { cleanup(); } catch { /* continue cleanup */ } }
    this.cleanups = [];
  }
}
