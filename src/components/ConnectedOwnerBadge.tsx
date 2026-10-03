import { useEffect, useState, useSyncExternalStore } from "react";
import { OwnersBadge } from "./OwnersBadge";
import type { OwnersService } from "../services/ownersService";
import type { PersonaService } from "../services/personaService";
import type { Lifecycle } from "../services/lifecycle";
import type { VisibleApps } from "../services/visibleApps";
import type { SettingsStore } from "../settings/settings";
import type { OwnerPersona } from "../steam/types";
export interface BadgeServices {
  ownership: OwnersService; personas: PersonaService; lifecycle: Lifecycle;
  settings: SettingsStore; visible: VisibleApps;
}
interface Data { appId: number; accountId?: number; ownerIds: number[]; personas: OwnerPersona[] }
export function ConnectedOwnerBadge({ appId, services }: { appId: number; services: BadgeServices }) {
  const { ownership, personas, lifecycle, settings, visible } = services;
  const active = useSyncExternalStore(lifecycle.subscribe, lifecycle.getSnapshot, lifecycle.getSnapshot);
  const preferences = useSyncExternalStore(settings.subscribe, settings.getSnapshot, settings.getSnapshot);
  const [data, setData] = useState<Data>({ appId, ownerIds: [], personas: [] });
  useEffect(() => {
    if (!active || !preferences.enabled) return;
    let generation = 0;
    let mounted = true;
    const update = () => {
      const ticket = ++generation;
      const accountId = ownership.getCurrentAccount();
      setData(previous => previous.appId === appId && previous.accountId === accountId ? previous : { appId, accountId, ownerIds: [], personas: [] });
      const valid = () => mounted && ticket === generation && lifecycle.getSnapshot() && ownership.getCurrentAccount() === accountId;
      void ownership.get(appId).then(async ids => {
        if (!valid()) return;
        const ownerIds = ids ?? [];
        setData(previous => ({ appId, accountId, ownerIds, personas: previous.personas.filter(p => ownerIds.includes(p.accountId)) }));
        const resolved = await Promise.all(ownerIds.map(id => personas.get(id)));
        if (valid()) setData({ appId, accountId, ownerIds, personas: resolved.filter((p): p is OwnerPersona => !!p) });
      });
    };
    const unsubscribeOwnership = ownership.subscribe(update);
    const unsubscribePersona = personas.subscribe(update);
    const unwatch = visible.watch(appId);
    update();
    return () => { mounted = false; generation++; unsubscribeOwnership(); unsubscribePersona(); unwatch(); };
  }, [appId, active, preferences.enabled, ownership, personas, lifecycle, visible]);
  if (data.appId !== appId) return null;
  return <OwnersBadge ownerIds={data.ownerIds} personas={data.personas} settings={preferences} lifecycle={lifecycle} />;
}
