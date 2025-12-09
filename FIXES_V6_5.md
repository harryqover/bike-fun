# Bike Flow - URL Parameters Support (v6.5)

## Changes Applied

### 1. ✅ URL Pre-filling
**Change**: Added logic to pre-fill the Top Bar inputs from URL parameters.
**Supported Parameters**:
- `bikeType` -> Selects the bike type (e.g., `TYPE_REGULAR_EBIKE`)
- `bikeValue` -> Fills the value field (e.g., `2500`)
- `antiTheftMeasure` -> Selects the anti-theft option (e.g., `ANTI_THEFT_MEASURE_GPS_ANTITHEFT`)
- `zip` -> Fills the postal code (e.g., `1000`)

**Example URL**:
`https://your-site.com/flow?locale=en-BE&bikeType=TYPE_REGULAR_EBIKE&bikeValue=2500&zip=1000`

---

## Files Updated

### 1. bike-flow.js (v6.5)
**Status**: ✅ Updated
**Location**: `/Users/HarryEvrard/Documents/GitHub/bike-fun/bike-flow.js`
**Action**: Push to GitHub.

---

## How to Apply

1.  **Push JS**:
    ```bash
    cd /Users/HarryEvrard/Documents/GitHub/bike-fun
    git add bike-flow.js
    git commit -m "Add URL parameter pre-filling support"
    git push origin main
    ```
2.  **Cache**: Update script URL to `?v=12` in Webflow.

## Expected Result
- When loading the page with parameters, the input fields will be automatically filled.
- The user can immediately click "See prices" without typing.
