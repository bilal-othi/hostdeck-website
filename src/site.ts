/** Everything that changes with a release or a new address lives here. */
export const site = {
  name: 'HostDeck',
  tagline: 'Every server, one shortcut away.',
  description:
    'HostDeck is a menu bar app for macOS that keeps your SSH hosts, file-transfer servers and everyday commands one click, or one shortcut, away.',
  /** The notarized DMG (a GitHub Release of this repository). Null until the first release: the page says "coming soon". */
  downloadUrl: null as string | null,
  /** The Mac App Store listing. Null until the app is live. */
  appStoreUrl: null as string | null,
  /** Where people report problems and ask questions. */
  supportUrl: 'https://github.com/bilal-othi/hostdeck-website/issues',
  releasesUrl: 'https://github.com/bilal-othi/hostdeck-website/releases',
  requirements: 'macOS 14 Sonoma or later',
  copyright: '© 2026 Bilal Hassan',
};

/** A link inside the site, including the base path GitHub Pages serves it under. */
export function url(path = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${path.replace(/^\//, '')}`;
}
