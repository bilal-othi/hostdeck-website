# HostDeck website

The website for [HostDeck](https://bilal-othi.github.io/hostdeck-website/), a menu bar app for macOS that keeps SSH
hosts, file-transfer servers and commands one shortcut away. Built with [Astro](https://astro.build) and published to
GitHub Pages. The app itself lives in a separate, private repository (`hostdeck`).

## Working on it

```bash
npm install
npm run dev       # http://localhost:4321/hostdeck-website/
npm run build     # writes dist/
npm run preview   # serves dist/
```

Needs Node.js 22.12 or later.

## Where things are

- `src/site.ts`: name, tagline, download and App Store links, support link. Set `downloadUrl` when the first DMG is
  released and `appStoreUrl` when the app is live; the pages switch from "coming soon" by themselves.
- `src/pages/`: the home page, `privacy` (linked from App Store Connect) and `support` (App Store support URL).
- `src/components/MenuMock.astro`: the HostDeck menu illustration on the home page.
- `public/`: app icon and favicon, copied from the app's asset catalog.

## Publishing

Every push to `main` builds and deploys the site (`.github/workflows/deploy.yml`). One-time setup: in the repository's
Settings › Pages, set Source to **GitHub Actions**.

Releases of the direct-download DMG are published as GitHub Releases of this repository, so the download link works
while the app's source stays private.

For a custom domain: set `site` in `astro.config.mjs` to it, remove `base`, add `public/CNAME` containing the domain,
and set the domain in Settings › Pages.
