import { definePlugin } from "@decky/api";
import { staticClasses, findAllModules, afterPatch } from "@decky/ui";
import { FaUsers } from "react-icons/fa";
import { BadgeErrorBoundary } from "./components/BadgeErrorBoundary";
import { Lifecycle } from "./services/lifecycle";
import { SettingsStore } from "./settings/settings";
import { SettingsPanel } from "./settings/SettingsPanel";
import { OwnersService } from "./services/ownersService";
import { createOwnersAdapter, type OwnersSteamClient } from "./steam/owners";
import { PersonaService } from "./services/personaService";
import { CurrentUserService, createWebChatCurrentUserAdapter, subscribeLoginChanges, type IdentitySteamClient } from "./steam/currentUser";
import { type SteamOverviewReader } from "./steam/appStore";
import { createCachedPersonaAdapter, discoverPersonaCache } from "./steam/personas";
import { discoverLibraryCapsule } from "./steam/libraryCapsule";
import { LibraryCapsulePatch } from "./patches/libraryCapsulePatch";
import { VisibleApps } from "./services/visibleApps";
declare const SteamClient: (IdentitySteamClient & OwnersSteamClient) | undefined;
export default definePlugin(() => {
  const lifecycle = new Lifecycle();
  let storage: Storage | undefined;
  try { storage = window.localStorage; } catch { /* session-only fallback */ }
  const settings = new SettingsStore(storage);
  const getClient = () => typeof SteamClient !== "undefined" ? SteamClient : (window as Window & { SteamClient?: IdentitySteamClient & OwnersSteamClient }).SteamClient;
  const identity = new CurrentUserService(createWebChatCurrentUserAdapter(getClient));
  const ownership = new OwnersService(createOwnersAdapter(() =>
    (window as Window & { appStore?: SteamOverviewReader }).appStore, getClient));
  const personas = new PersonaService(createCachedPersonaAdapter(discoverPersonaCache(findAllModules),
    () => identity.getSnapshot()?.accountId));
  lifecycle.addCleanup(() => settings.dispose());
  lifecycle.addCleanup(() => ownership.dispose());
  lifecycle.addCleanup(() => personas.dispose());
  lifecycle.addCleanup(identity.subscribe(() => {
    const user = identity.getSnapshot();
    personas.setCurrentAccount(user?.accountId);
    ownership.setCurrentUser(user);
  }));
  lifecycle.addCleanup(() => identity.dispose());
  const loginCleanup = subscribeLoginChanges(getClient(), () => { void identity.refresh(); });
  if (loginCleanup) lifecycle.addCleanup(loginCleanup);
  const visible = new VisibleApps(() => { ownership.refresh(); });
  lifecycle.addCleanup(() => visible.dispose());
  const capsule = discoverLibraryCapsule(findAllModules);
  const patch = new LibraryCapsulePatch(afterPatch, { lifecycle, settings, ownership, personas, visible });
  lifecycle.addCleanup(() => patch.removeLibraryCapsulePatch());
  // Fail closed if safe login teardown or unique capsule discovery is unavailable.
  const installed = !!loginCleanup && !!capsule && patch.installLibraryCapsulePatch(capsule.target, capsule.boxClass);
  void identity.refresh();
  console.info(installed ? "[FamilyOwner] patch installed" : "[FamilyOwner] unsupported runtime");
  return {
    name: "Family Owner",
    titleView: <div className={staticClasses.Title}>Family Owner</div>,
    content: <BadgeErrorBoundary><SettingsPanel store={settings}
      refresh={() => { personas.invalidate(); ownership.refresh(); void identity.refresh(); }} /></BadgeErrorBoundary>,
    icon: <FaUsers />,
    onDismount() { lifecycle.dispose(); console.info("[FamilyOwner] teardown"); },
  };
});
