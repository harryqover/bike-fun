# Bike Flow - Contract Period Fix (v6.11)

## Changes Applied

### 1. ✅ Added contractPeriod
**Change**: Added `contractPeriod` object to the API payload.
**Fields**:
-   `startDate`: From the form input `startDate`.
-   `timeZone`: Determined by country (e.g., `Europe/Brussels` for BE).

### 2. ✅ Added metadata
**Change**: Added `metadata` object with `terms` for consent tracking.

### 3. ✅ getTimeZone Helper
**Change**: Added a helper function to map country codes to IANA time zones.
**Mapping**:
-   BE -> Europe/Brussels
-   FR -> Europe/Paris
-   NL -> Europe/Amsterdam
-   DE -> Europe/Berlin

---

## Files Updated

### 1. bike-flow.js (v6.11)
**Status**: ✅ Updated
**Location**: `/Users/HarryEvrard/Documents/GitHub/bike-fun/bike-flow.js`
**Action**: Push to GitHub.

---

## How to Apply

1.  **Push JS**:
    ```bash
    cd /Users/HarryEvrard/Documents/GitHub/bike-fun
    git add bike-flow.js
    git commit -m "Add contractPeriod to quote payload"
    git push origin main
    ```
2.  **Cache**: Update script URL to `?v=18` in Webflow.

## Expected Result
-   API payload now includes `contractPeriod.startDate` and `contractPeriod.timeZone`.
-   No more "CONTRACT_PERIOD_REQUIRED" validation error.
