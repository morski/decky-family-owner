import { useSyncExternalStore } from "react";
import { ButtonItem, DropdownItem, PanelSection, PanelSectionRow, ToggleField } from "@decky/ui";
import type { SettingsStore, Corner } from "./settings";
export function SettingsPanel({ store, refresh }: { store: SettingsStore; refresh: () => void }) {
  const settings = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  return <PanelSection title="Family Owner">
    <PanelSectionRow>Shows every reported game owner, including you. Refresh to update ownership data.</PanelSectionRow>
    <PanelSectionRow><ToggleField label="Enabled" checked={settings.enabled} onChange={enabled => store.update({ enabled })} /></PanelSectionRow>
    <PanelSectionRow><DropdownItem label="Badge size" selectedOption={settings.size}
      rgOptions={[{ label: "Small", data: 20 }, { label: "Medium", data: 28 }, { label: "Large", data: 36 }]}
      onChange={option => store.update({ size: option.data })} /></PanelSectionRow>
    <PanelSectionRow><DropdownItem label="Badge corner" selectedOption={settings.corner}
      rgOptions={(["top-left", "top-right", "bottom-left", "bottom-right"] as Corner[]).map(data => ({ data, label: data.replace("-", " ") }))}
      onChange={option => store.update({ corner: option.data })} /></PanelSectionRow>
    <PanelSectionRow><ButtonItem layout="below" onClick={refresh}>Refresh ownership data</ButtonItem></PanelSectionRow>
  </PanelSection>;
}
