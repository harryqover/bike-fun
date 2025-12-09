# Bike Flow - Price Calculation Update (v6.1)

## Changes Applied

### 1. ✅ Updated Price Parsing Logic
**Change**: Modified `calculatePrices()` to parse the specific API response structure provided.
**Logic**:
- Instead of looking for `payload.price.totalPremium`, the script now looks for `payload.packages[VARIANT_NAME]`.
- It iterates through all coverages within that package (e.g., `theft`, `damage`, `assistance`).
- It sums the `cip` value from `coverage.variants.default.premium.cip`.
- **Result**: Correct total price displayed on the cards.

---

## Files Updated

### 1. bike-flow.js (v6.1)
**Status**: ✅ Updated
**Location**: `/Users/HarryEvrard/Documents/GitHub/bike-fun/bike-flow.js`
**Action**: Push to GitHub.

---

## How to Apply

1.  **Push JS**:
    ```bash
    cd /Users/HarryEvrard/Documents/GitHub/bike-fun
    git add bike-flow.js
    git commit -m "Update price calculation logic to sum coverage premiums"
    git push origin main
    ```
2.  **Cache**: Update script URL to `?v=8` in Webflow.

## Expected Result
- When clicking "See prices", the script correctly parses the complex API response.
- It sums up the premiums for Theft, Damage, and Assistance.
- The correct total annual premium is displayed on each card.
