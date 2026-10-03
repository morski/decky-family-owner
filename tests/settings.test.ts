import { it, expect, vi } from 'vitest';
import { SettingsStore, DEFAULT_SETTINGS } from '../src/settings/settings';
it('settings notify and roundtrip only plugin data; disposal removes listeners', () => {
  const data = new Map<string, string>(); const storage = { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => { data.set(k, v); } };
  const s = new SettingsStore(storage); expect(s.getSnapshot()).toEqual(DEFAULT_SETTINGS);
  const fn = vi.fn(); s.subscribe(fn); s.update({ enabled: false, size: 20, corner: 'top-left' }); expect(fn).toHaveBeenCalledOnce();
  expect(new SettingsStore(storage).getSnapshot()).toEqual(s.getSnapshot()); expect([...data.keys()]).toEqual(['FamilyOwner.settings.v2']);
  s.dispose(); s.update({ enabled: true }); expect(fn).toHaveBeenCalledOnce(); expect(s.getSnapshot().enabled).toBe(false);
});
it('corrupt and unavailable storage safely use defaults/session state', () => {
  const bad = new SettingsStore({ getItem: () => '{', setItem() { throw Error(); } }); expect(bad.getSnapshot()).toEqual(DEFAULT_SETTINGS); bad.update({ size: 36 }); expect(bad.getSnapshot().size).toBe(36);
  const malformed = new SettingsStore({ getItem: () => '{"enabled": "false", "size": 100, "corner": "outside"}', setItem() {} }); expect(malformed.getSnapshot()).toEqual(DEFAULT_SETTINGS);
});

it('migrates legacy preferences to lower-left while retaining size and enabled', () => {
  const storage = { getItem: (key: string) => key === 'FamilyOwner.settings.v1' ? '{"enabled":false,"size":36,"corner":"bottom-right"}' : null, setItem() {} };
  expect(new SettingsStore(storage).getSnapshot()).toEqual({enabled:false,size:36,corner:'bottom-left'});
});
