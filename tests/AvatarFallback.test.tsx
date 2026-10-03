import { afterEach, it, expect, vi } from 'vitest';
import { render, fireEvent, cleanup, act } from '@testing-library/react';
import { OwnersBadge } from '../src/components/OwnersBadge';
import { BadgeErrorBoundary } from '../src/components/BadgeErrorBoundary';
import { Lifecycle } from '../src/services/lifecycle';
import { DEFAULT_SETTINGS } from '../src/settings/settings';
afterEach(cleanup);
const persona = { accountId: 2, steamId64: '76561197960265730', name: 'Lender', avatarUrl: 'https://verified.invalid/one.png' };
it('borrowed badge is accessible, noninteractive, falls back and resets on URL change', () => {
  const lifecycle = new Lifecycle();
  const { getByRole, container, rerender } = render(<OwnersBadge ownerIds={[2]} personas={[persona]} settings={DEFAULT_SETTINGS} lifecycle={lifecycle} />);
  const badge = getByRole('img', { name: 'Owned by Lender' });
  expect(badge.style.pointerEvents).toBe('none'); expect(badge.hasAttribute('tabindex')).toBe(false);
  expect(badge.style.width).toBe('28px'); expect(container.querySelector<HTMLElement>('[role=group]')!.style.bottom).toBe('2px'); expect(container.querySelector<HTMLElement>('[role=group]')!.style.left).toBe('2px');
  fireEvent.error(container.querySelector('img')!); expect(container.querySelector('img')).toBeNull(); expect(badge.textContent).toBe('L');
  rerender(<OwnersBadge ownerIds={[2]} personas={[{ ...persona, avatarUrl: 'https://verified.invalid/two.png' }]} settings={{ ...DEFAULT_SETTINGS, size: 36, corner: 'top-left' }} lifecycle={lifecycle} />);
  expect(container.querySelector('img')?.getAttribute('src')).toContain('two.png'); expect(badge.style.width).toBe('36px'); expect(container.querySelector<HTMLElement>('[role=group]')!.style.top).toBe('2px'); expect(container.querySelector<HTMLElement>('[role=group]')!.style.left).toBe('2px'); expect(container.querySelector<HTMLElement>('[role=group]')!.style.bottom).toBe('');
  act(() => lifecycle.dispose()); expect(container.childElementCount).toBe(0);
});
it('missing or mismatched persona uses generic accessible fallback', () => {
  const { getByRole } = render(<OwnersBadge ownerIds={[2]} personas={[{ ...persona, accountId: 3 }]} settings={DEFAULT_SETTINGS} lifecycle={new Lifecycle()} />);
  expect(getByRole('img').getAttribute('aria-label')).toBe('Owned by a Steam Family member');
});
it('plugin errors render nothing', () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  function Broken(): never { throw Error('fixture'); }
  try { const { container } = render(<BadgeErrorBoundary><Broken /></BadgeErrorBoundary>); expect(container.childElementCount).toBe(0); } finally { error.mockRestore(); }
});
it('mounted badges respond immediately to saved settings changes', async () => {
  const { useSyncExternalStore } = await import('react');
  const { SettingsStore } = await import('../src/settings/settings');
  const store = new SettingsStore(); const lifecycle = new Lifecycle();
  function Fixture() {
    const settings = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
    return <OwnersBadge ownerIds={[2]} personas={[persona]} settings={settings} lifecycle={lifecycle} />;
  }
  const { container, getByRole } = render(<Fixture />);
  act(() => store.update({ size: 20, corner: 'top-right' })); expect(getByRole('img').style.width).toBe('20px');
  act(() => store.update({ enabled: false })); expect(container.childElementCount).toBe(0);
  act(() => store.update({ enabled: true })); expect(getByRole('img')).toBeTruthy();
  act(() => lifecycle.dispose()); expect(container.childElementCount).toBe(0);
});
