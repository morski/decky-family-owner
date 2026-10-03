import { afterEach, expect, it } from "vitest";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { OwnersBadge } from "../src/components/OwnersBadge";
import { Lifecycle } from "../src/services/lifecycle";
import { DEFAULT_SETTINGS } from "../src/settings/settings";
afterEach(cleanup);
it("shows self and every reported owner in a nonfocusable stack growing upward from lower-left", () => {
  const lifecycle = new Lifecycle();
  const personas = [1,2,3,4,5,6].map(accountId => ({accountId,steamId64:'unused',name:`Owner ${accountId}`,avatarUrl:`https://verified.invalid/${accountId}.jpg`}));
  const { getByRole, getAllByRole, container, rerender } = render(<OwnersBadge ownerIds={[1,2,3,4,5,6]} personas={personas} settings={DEFAULT_SETTINGS} lifecycle={lifecycle} />);
  const group = getByRole('group'); expect(group.style.bottom).toBe('2px'); expect(group.style.left).toBe('2px'); expect(group.style.flexDirection).toBe('column-reverse');
  expect(group.style.flexWrap).not.toBe('wrap'); expect(group.style.alignItems).toBe('flex-start');
  expect(getAllByRole('img')).toHaveLength(6);
  expect(container.querySelector('[tabindex]')).toBeNull(); expect(group.style.pointerEvents).toBe('none');
  fireEvent.error(container.querySelector('img')!); expect(getByRole('img',{name:'Owned by Owner 1'}).textContent).toBe('O');
  rerender(<OwnersBadge ownerIds={[1,2]} personas={personas} settings={{...DEFAULT_SETTINGS,enabled:false}} lifecycle={lifecycle} />); expect(container.childElementCount).toBe(0);
  rerender(<OwnersBadge ownerIds={[1]} personas={personas} settings={DEFAULT_SETTINGS} lifecycle={lifecycle} />);
  act(()=>lifecycle.dispose()); expect(container.childElementCount).toBe(0);
});
it("unknown owner lists hide and uncached owners receive separate fallback avatars", () => {
  const { container, getAllByRole, rerender } = render(<OwnersBadge ownerIds={[]} personas={[]} settings={DEFAULT_SETTINGS} lifecycle={new Lifecycle()} />);
  expect(container.childElementCount).toBe(0);
  rerender(<OwnersBadge ownerIds={[1,2]} personas={[]} settings={DEFAULT_SETTINGS} lifecycle={new Lifecycle()} />); expect(getAllByRole('img')).toHaveLength(2);
});
