# Bike Flow - Pricing Cards & Hardcoded Logic (v6.0)

## Major Redesign Implemented

Based on your request and screenshots, I have completely restructured the form flow.

### 1. New "Top Bar" Input
Instead of a long form, users now start with a compact top bar:
- **Bike Type**
- **Bike Value**
- **Anti-theft Measure**
- **Postal Code**
- **"See prices" Button**

### 2. Pricing Cards (Tiles)
Clicking "See prices" triggers 3 parallel API calls to calculate premiums for:
1.  **Theft + Assistance**
2.  **Damage + Assistance**
3.  **Omnium (All-in)** - Highlighted as "Best Value"

The cards display the calculated price per year. Clicking "Select" reveals the rest of the form.

### 3. Hardcoded Logic per Country
As requested, deductibles and depreciation are now hardcoded based on the country (derived from locale):

| Logic | NL & DE | BE & FR (and others) |
|-------|---------|----------------------|
| **Depreciation** | `false` (All) | `false` (All) |
| **Theft Deductible** | `NO_DEDUCTIBLE` | `STANDARD_10PC` |
| **Damage Deductible** | `STANDARD_35_FIX` | `ENGLISH_10PC` |

This logic is applied automatically in the JavaScript when calculating prices and submitting the final quote.

---

## Files Updated

### 1. bike-flow-embed.html (v6.0)
**Status**: ✅ **MAJOR UPDATE**
**Location**: `/Users/HarryEvrard/Documents/GitHub/bike-fun/bike-flow-embed.html`
**Action**: Replace **ENTIRE** HTML in Webflow embed.

### 2. bike-flow-webflow.css (v6.0)
**Status**: ✅ **MAJOR UPDATE**
**Location**: `/Users/HarryEvrard/Documents/GitHub/bike-fun/bike-flow-webflow.css`
**Action**: Replace **ENTIRE** CSS in Webflow embed.

### 3. bike-flow.js (v6.0)
**Status**: ✅ **MAJOR UPDATE**
**Location**: `/Users/HarryEvrard/Documents/GitHub/bike-fun/bike-flow.js`
**Action**: Push to GitHub.

---

## How to Apply

1.  **CSS**: Copy all code from `bike-flow-webflow.css` and paste into your Webflow CSS embed.
2.  **HTML**: Copy all code from `bike-flow-embed.html` and paste into your Webflow HTML embed.
3.  **JS**: Push `bike-flow.js` to GitHub.
4.  **Cache**: Update script URL to `?v=7` to see changes immediately.

## Expected Result
1.  Page loads with just the Top Bar.
2.  Enter values (e.g., Value: 2000, Zip: 1000).
3.  Click "See prices".
4.  Loading spinner appears.
5.  3 Pricing Cards appear with real premiums.
6.  Select a card -> Form expands to show Policyholder details.
