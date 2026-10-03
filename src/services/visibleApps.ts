// One timer for mounted capsules; no full-library enumeration or render reads.
export class VisibleApps {
  private apps = new Map<number, number>();
  private timer?: ReturnType<typeof setInterval>;
  private disposed = false;
  constructor(private refresh: () => void, private intervalMs = 30000) {}
  watch(appId: number): () => void {
    if (this.disposed) return () => {};
    this.apps.set(appId, (this.apps.get(appId) ?? 0) + 1);
    if (!this.timer) this.timer = setInterval(() => { if (this.apps.size) this.refresh(); }, this.intervalMs);
    let released = false;
    return () => {
      if (released) return;
      released = true;
      const count = this.apps.get(appId) ?? 0;
      if (count <= 1) this.apps.delete(appId); else this.apps.set(appId, count - 1);
      if (!this.apps.size) { clearInterval(this.timer); this.timer = undefined; }
    };
  }
  dispose(): void { this.disposed = true; clearInterval(this.timer); this.timer = undefined; this.apps.clear(); }
}
