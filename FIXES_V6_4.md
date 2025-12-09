# Bike Flow - API Optimization (v6.4)

## Changes Applied

### 1. ✅ Single API Call for Pricing
**Change**: Refactored `calculatePrices()` to make **one** API call instead of three.
**Logic**:
-   We now request the `VARIANT_THEFT_DAMAGE_ASSISTANCE` (Omnium) package.
-   The API response contains a `packages` object with details for *all* relevant packages.
-   The script extracts the pricing for:
    -   `VARIANT_THEFT_ASSISTANCE` (Theft)
    -   `VARIANT_DAMAGE_ASSISTANCE` (Damage)
    -   `VARIANT_THEFT_DAMAGE_ASSISTANCE` (Omnium)
-   **Benefit**: Faster response time, less network traffic, and cleaner code.

### 2. ✅ Smart Loader Updated
-   The Smart Loader still runs to provide a smooth UX (fake progress), but the underlying process is more efficient.

---

## Files Updated

### 1. bike-flow.js (v6.4)
**Status**: ✅ Updated
**Location**: `/Users/HarryEvrard/Documents/GitHub/bike-fun/bike-flow.js`
**Action**: Push to GitHub.

---

## How to Apply

1.  **Push JS**:
    ```bash
    cd /Users/HarryEvrard/Documents/GitHub/bike-fun
    git add bike-flow.js
    git commit -m "Optimize pricing to use single API call"
    git push origin main
    ```
2.  **Cache**: Update script URL to `?v=11` in Webflow.

## Expected Result
-   Same visual experience for the user (Smart Loader).
-   Under the hood: Only 1 network request to the Google Script API.
-   All 3 pricing cards populate correctly.
