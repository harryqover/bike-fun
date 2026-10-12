# Guatemala & Belize PWA

Static Progressive Web App for GitHub Pages.

## Deploy on a Qover GitHub Pages repository

1. Copy the complete contents of this folder into the repository root, or into the folder used by the GitHub Pages workflow.
2. Keep the relative structure intact:
   - `index.html`
   - `manifest.webmanifest`
   - `sw.js`
   - `icons/icon-192.png`
   - `icons/icon-512.png`
3. Publish the site over HTTPS through GitHub Pages.
4. Open the site once while online. The service worker then caches the app shell for offline use.
5. On supported browsers, use **Installer l’app** or the browser install prompt.

The application contains no external JavaScript, CSS, font, map tile or API dependency. The route map is an embedded schematic SVG, so the itinerary remains usable offline after the first visit.

If the app is deployed under a subdirectory, keep all links relative as provided. If an older service worker was previously deployed under the same path, change `CACHE_NAME` in `sw.js` to force a new cache version.
