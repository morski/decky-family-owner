import { expect, it, vi } from "vitest";
import { subscribeLoginChanges } from "../src/steam/currentUser";
it("uses verified native subscription without reading names and unregisters", () => {
  let callback!: (...args: unknown[]) => void;
  const unregister = vi.fn(); const refresh = vi.fn();
  const user = { RegisterForLoginStateChange(fn: (...args: unknown[]) => void) { expect(this).toBe(user); callback = fn; return { unregister }; } };
  const cleanup = subscribeLoginChanges({ User: user }, refresh);
  callback("ignored account name", 7, 1, 0); expect(refresh).toHaveBeenCalledOnce();
  cleanup?.(); expect(unregister).toHaveBeenCalledOnce();
  expect(subscribeLoginChanges(undefined, refresh)).toBeUndefined();
  expect(subscribeLoginChanges({ User: { RegisterForLoginStateChange() { throw Error(); } } }, refresh)).toBeUndefined();
});
