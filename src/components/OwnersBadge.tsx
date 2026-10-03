import { useSyncExternalStore } from "react";
import { Avatar } from "./Avatar";
import type { OwnerPersona } from "../steam/types";
import type { Settings } from "../settings/settings";
import type { Lifecycle } from "../services/lifecycle";
export function OwnersBadge({ ownerIds, personas, settings, lifecycle }: {
  ownerIds: number[]; personas: OwnerPersona[]; settings: Settings; lifecycle: Lifecycle;
}) {
  const active = useSyncExternalStore(lifecycle.subscribe, lifecycle.getSnapshot, lifecycle.getSnapshot);
  if (!active || !settings.enabled || !ownerIds.length) return null;
  const [vertical, horizontal] = settings.corner.split("-");
  return <span role="group" aria-label="Game owners" data-family-owner-group style={{
    position: "absolute", [vertical]: 2, [horizontal]: 2, display: "flex",
    flexDirection: vertical === "bottom" ? "column-reverse" : "column", gap: 4,
    alignItems: horizontal === "left" ? "flex-start" : "flex-end", pointerEvents: "none",
  }}>{ownerIds.map(accountId => {
    const persona = personas.find(p => p.accountId === accountId);
    const label = persona?.name ? `Owned by ${persona.name}` : "Owned by a Steam Family member";
    return <span key={accountId} role="img" aria-label={label} title={label} style={{
      width: settings.size, height: settings.size, flexShrink: 0, boxSizing: "border-box", border: "2px solid white",
      borderRadius: "50%", overflow: "hidden", background: "#28323c", color: "white", display: "flex",
      alignItems: "center", justifyContent: "center", fontSize: settings.size / 2, pointerEvents: "none",
    }}><Avatar key={persona?.avatarUrl ?? "fallback"} url={persona?.avatarUrl} name={persona?.name} /></span>;
  })}</span>;
}
