export type Corner = "top-left" | "top-right" | "bottom-left" | "bottom-right";
export interface Settings { enabled: boolean; size: 20 | 28 | 36; corner: Corner }
export const DEFAULT_SETTINGS: Readonly<Settings> = Object.freeze({ enabled: true, size: 28, corner: "bottom-left" });

export interface SettingsStorage { getItem(key: string): string | null; setItem(key: string, value: string): void }
const KEY = "FamilyOwner.settings.v2";
export function validateSettings(raw: unknown): Settings {
  const value = raw as Partial<Settings> | null;
  const corners: Corner[] = ["top-left", "top-right", "bottom-left", "bottom-right"];
  return {
    enabled: typeof value?.enabled === "boolean" ? value.enabled : DEFAULT_SETTINGS.enabled,
    size: value?.size === 20 || value?.size === 28 || value?.size === 36 ? value.size : DEFAULT_SETTINGS.size,
    corner: corners.includes(value?.corner as Corner) ? value!.corner! : DEFAULT_SETTINGS.corner,
  };
}
// Browser storage is plugin-namespaced; no Steam objects/files are written.
// Persistence availability and reload behavior still require device validation.
export class SettingsStore {
  private value: Settings;
  private listeners = new Set<() => void>();
  private disposed = false;
  constructor(private storage?: SettingsStorage) {
    let raw: unknown;
    try {
      const saved = storage?.getItem(KEY);
      if (saved) raw = JSON.parse(saved);
      else {
        const legacy = JSON.parse(storage?.getItem("FamilyOwner.settings.v1") ?? "null");
        raw = legacy ? { ...validateSettings(legacy), corner: "bottom-left" } : null;
      }
    } catch { /* defaults */ }
    this.value = Object.freeze(validateSettings(raw));
  }
  getSnapshot = (): Settings => this.value;
  subscribe = (fn: () => void): (() => void) => {
    if (!this.disposed) this.listeners.add(fn);
    return () => { this.listeners.delete(fn); };
  };
  update(patch: Partial<Settings>): void {
    if (this.disposed) return;
    this.value = Object.freeze(validateSettings({ ...this.value, ...patch }));
    try { this.storage?.setItem(KEY, JSON.stringify(this.value)); } catch { /* session settings work */ }
    for (const fn of this.listeners) { try { fn(); } catch { /* isolated subscribers */ } }
  }
  dispose(): void { this.disposed = true; this.listeners.clear(); }
}
