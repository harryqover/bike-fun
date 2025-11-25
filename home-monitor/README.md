# Home Monitoring Webapp

A premium‑looking single‑page web application that visualises the latest temperature readings from your home zones.

## Features
- Dark theme with glass‑morphism cards
- Automatic data refresh every minute
- Responsive layout for mobile and desktop
- Simple deployment to GitHub Pages

## Installation & Development
```bash
# Clone the repository (if not already)
git clone https://github.com/yourusername/bike-fun.git
cd bike-fun/home-monitor
# Serve locally (Python 3)
python3 -m http.server 8000 --directory .
# Open http://localhost:8000 in a browser
```

## Deployment to GitHub Pages
1. Commit the `home-monitor` folder to the `bike-fun` repository.
2. In the repository settings, enable **GitHub Pages** and set the source to the `main` branch (or `gh-pages`).
3. The site will be available at `https://yourusername.github.io/bike-fun/home-monitor/`.

## Configuration
- Adjust the number of rows fetched by editing `DEFAULT_LIMIT` in `app.js`.
- **CORS Issue**: The Google Apps Script endpoint does not send CORS headers. If you run the app locally (file://) you will hit a CORS error. Set the `PROXY_URL` constant in `app.js` to a CORS‑proxy such as `https://cors-anywhere.herokuapp.com/` (or your own proxy) to enable the fetch.
- Change the API endpoint or sheet name if needed.

---
*Created with a focus on premium UI/UX.*
