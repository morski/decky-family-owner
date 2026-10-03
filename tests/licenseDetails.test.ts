import { afterEach, expect, it, vi } from "vitest";
import { createOwnersAdapter, permanentSelfOwner, readLicenseDetails, type LicenseDetails } from "../src/steam/owners";
const current = "76561197960818262";
const own = { unAppID:730,bIsSubscribedTo:true,strOwnerSteamID:current,eAppOwnershipFlags:2049 };
afterEach(() => vi.useRealTimers());
it("requires explicit matching permanent current-user license, rejecting borrowed/unknown/expired proof", () => {
  expect(permanentSelfOwner(730,own,current)).toBe(current);
  for(const details of [undefined,{...own,unAppID:10},{...own,bIsSubscribedTo:false},{...own,strOwnerSteamID:'76561198028590469'},{...own,eAppOwnershipFlags:33},{...own,eAppOwnershipFlags:2049|1024},{...own,eAppOwnershipFlags:2049|8192},{...own,eAppOwnershipFlags:NaN}]) expect(permanentSelfOwner(730,details,current)).toBeUndefined();
});
it("empty lender list falls back to explicit CS2 license; nonempty/malformed lists do not invoke details", async () => {
  let lenders:unknown=[];const unregister=vi.fn();
  const details=vi.fn((_id:number, callback:(details:LicenseDetails)=>void)=>{callback(own);return {unregister};});
  const adapter=createOwnersAdapter(()=>({GetAppOverviewByAppID:()=>({appid:730,app_type:1})}),()=>({FamilySharing:{GetAvailableLenders:async()=>lenders},Apps:{RegisterForAppDetails:details}}));
  expect(await adapter.resolve(730,current)).toEqual([{appid:730,steamid:current}]);expect(unregister).toHaveBeenCalledOnce();
  lenders=[{appid:730,steamid:'76561198028590469'}];expect(await adapter.resolve(730,current)).toBe(lenders);
  lenders={bad:true};expect(await adapter.resolve(730,current)).toBe(lenders);expect(details).toHaveBeenCalledOnce();
});
it("abort and timeout unregister native callbacks and prevent late results", async () => {
  vi.useFakeTimers();let callback!:(details:LicenseDetails)=>void;const unregister=vi.fn();
  const apps={RegisterForAppDetails:vi.fn((_id:number,fn:(details:LicenseDetails)=>void)=>{callback=fn;return {unregister};})};
  const controller=new AbortController();const pending=readLicenseDetails(apps,730,controller.signal);controller.abort();
  expect(await pending).toBeUndefined();callback(own);expect(unregister).toHaveBeenCalledOnce();expect(vi.getTimerCount()).toBe(0);
  const timeout=readLicenseDetails(apps,730);await vi.advanceTimersByTimeAsync(3000);expect(await timeout).toBeUndefined();expect(unregister).toHaveBeenCalledTimes(2);
});
