import { it, expect } from 'vitest';
import { isObservedSteamAvatarUrl } from '../src/steam/avatarUrl';
const path = '/1eed2efd03a89fe4d95cd5fd62661a522fe1d5e0_medium.jpg';
it('accepts the device-observed Steam avatar URL', () => {
  expect(isObservedSteamAvatarUrl(`https://avatars.steamstatic.com${path}`)).toBe(true);
});
it.each([
  `http://avatars.steamstatic.com${path}`,
  `https://avatars.steamstatic.com.evil.invalid${path}`,
  `https://evil.invalid${path}`,
  `https://avatars.steamstatic.com:444${path}`,
  `https://name:password@avatars.steamstatic.com${path}`,
  `https://avatars.steamstatic.com${path}?token=example`,
  `https://avatars.steamstatic.com${path}#fragment`,
  'https://avatars.steamstatic.com/not-an-avatar_medium.jpg',
  'https://avatars.steamstatic.com/1eed2efd03a89fe4d95cd5fd62661a522fe1d5e0_full.jpg',
  path, 'javascript:alert(1)', 'data:image/png;base64,AA',
])('rejects unsupported avatar source %s', value => {
  expect(isObservedSteamAvatarUrl(value)).toBe(false);
});
