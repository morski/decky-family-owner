import { it, expect, vi } from 'vitest';
import { PersonaService, type PersonaAdapter } from '../src/services/personaService';
function create(adapter?: PersonaAdapter, clock: () => number = () => 0, limit = 2) {
  const s = new PersonaService(adapter, clock, 100, 10, limit); s.setCurrentAccount(1); return s;
}
const allowed = (url: string) => url === 'https://verified.invalid/avatar.png';
it('deduplicates requests, caches successes and expires lazily', async () => {
  let now = 0; const resolve = vi.fn(async () => ({ name: ' Owner ', avatarUrl: 'https://verified.invalid/avatar.png' }));
  const s = create({ resolve, isAllowedAvatarUrl: allowed }, () => now);
  const a = s.get(2), b = s.get(2); expect(a).toBe(b);
  expect(await a).toMatchObject({ accountId: 2, name: 'Owner', avatarUrl: 'https://verified.invalid/avatar.png' });
  await s.get(2); expect(resolve).toHaveBeenCalledTimes(1); now = 101; await s.get(2); expect(resolve).toHaveBeenCalledTimes(2);
  await s.get(3); await s.get(4); await s.get(2); expect(resolve).toHaveBeenCalledTimes(5);
});
it('missing, failed and disallowed avatars use fallback and bounded retry', async () => {
  let now = 0; const resolve = vi.fn<PersonaAdapter['resolve']>().mockRejectedValueOnce(Error()).mockResolvedValueOnce({ avatarUrl: 'javascript:bad', name: 'Owner' }).mockResolvedValue(undefined);
  const s = create({ resolve, isAllowedAvatarUrl: allowed }, () => now);
  expect(await s.get(2)).toMatchObject({ accountId: 2 }); await s.get(2); expect(resolve).toHaveBeenCalledTimes(1);
  now = 11; expect((await s.get(2))?.avatarUrl).toBeUndefined(); now = 22; expect((await s.get(2))?.avatarUrl).toBeUndefined();
  expect(resolve).toHaveBeenCalledTimes(3); expect((await create().get(2))?.avatarUrl).toBeUndefined();
});
it('rejects IDs and unavailable active account without adapter calls', async () => {
  const resolve = vi.fn(async () => undefined); const s = create({ resolve, isAllowedAvatarUrl: allowed });
  for (const id of [0, -1, 1.5, NaN, 4294967296]) expect(await s.get(id)).toBeUndefined();
  s.setCurrentAccount(undefined); expect(await s.get(2)).toBeUndefined(); expect(resolve).not.toHaveBeenCalled();
});
it('old account response cannot populate caches or delete the new pending request', async () => {
  const completions: Array<(value: { name: string }) => void> = [];
  const resolve = vi.fn(() => new Promise<{ name: string }>(done => completions.push(done)));
  const s = create({ resolve, isAllowedAvatarUrl: allowed });
  const old = s.get(2); await Promise.resolve(); s.setCurrentAccount(3);
  const current = s.get(2); await Promise.resolve(); completions[0]({ name: 'Old' });
  expect(await old).toBeUndefined(); expect(s.get(2)).toBe(current);
  completions[1]({ name: 'New' }); expect((await current)?.name).toBe('New'); expect((await s.get(2))?.name).toBe('New'); expect(resolve).toHaveBeenCalledTimes(2);
});
it('dispose and refresh invalidate outstanding work, including before it starts', async () => {
  let finish!: (value: { name: string }) => void;
  const resolve = vi.fn(() => new Promise<{ name: string }>(done => { finish = done; }));
  const s = create({ resolve, isAllowedAvatarUrl: allowed }); const p = s.get(2); await Promise.resolve(); s.dispose(); finish({ name: 'stale' }); expect(await p).toBeUndefined(); expect(await s.get(2)).toBeUndefined();
  const other = create({ resolve, isAllowedAvatarUrl: allowed }); const q = other.get(2); other.invalidate(); expect(await q).toBeUndefined(); expect(resolve).toHaveBeenCalledTimes(1);
});
it('rejects unsafe URL schemes even if a broken adapter permits them', async () => {
  for (const avatarUrl of ['javascript:alert(1)', 'data:image/png;base64,AA', 'file:///tmp/avatar.png', 'https://user:secret@verified.invalid/avatar.png', '/relative']) {
    const s = create({ resolve: async () => ({ avatarUrl }), isAllowedAvatarUrl: () => true });
    expect((await s.get(2))?.avatarUrl).toBeUndefined();
  }
});
it('account changes and refresh notify consumers; unsubscribe and disposal stop notifications', () => {
  const s = create(); const fn = vi.fn(); const off = s.subscribe(fn);
  s.setCurrentAccount(1); expect(fn).not.toHaveBeenCalled();
  s.setCurrentAccount(3); s.invalidate(); expect(fn).toHaveBeenCalledTimes(2);
  off(); s.invalidate(); expect(fn).toHaveBeenCalledTimes(2);
  s.subscribe(fn); s.dispose(); s.setCurrentAccount(4); s.invalidate(); expect(fn).toHaveBeenCalledTimes(2);
});
