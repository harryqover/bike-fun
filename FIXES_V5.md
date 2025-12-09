# Bike Flow - Premium "GAFAM" Design (v5.0)

## Design Philosophy
Based on your request for a "GAFAM UX/UI expert" review, I have completely redesigned the form to match the standards of top tech companies (Google, Apple, Meta).

### Key Design Changes
1.  **Card-Based Layout**: The form is now contained in a clean, white card with subtle shadows, centered on the page (`max-width: 640px`). This improves focus and readability.
2.  **Modern Inputs**:
    *   Taller touch targets (44px).
    *   Clean borders (`#D1D5DB`) that turn vibrant blue (`#0057FF`) on focus.
    *   White backgrounds to ensure contrast on any page.
3.  **Premium Radio Cards**:
    *   Replaced standard radio buttons with clickable cards.
    *   Grid layout for better use of space.
    *   Selected state uses a light blue background (`#EFF6FF`) and thick blue border.
4.  **Typography**:
    *   Used **Inter** font throughout.
    *   Headings are cleaner (20px, semi-bold).
    *   Labels are legible (14px, medium weight).
5.  **Visual Hierarchy**:
    *   Removed the overwhelming blue background from the coverage section.
    *   Used whitespace and subtle borders to group related content.
    *   Price display is now a prominent, premium-looking card at the bottom.

### Fixes Included
- **Encoding**: Fixed the `€` symbol issue in the fallback text by using HTML entities (`&euro;`).
- **Layout**: Fixed all overlap issues.
- **Static Flow**: Removed all collapsible logic for a smooth, single-page experience.

---

## Files Updated

### 1. bike-flow-webflow.css (v5.0)
**Status**: ✅ **MAJOR UPDATE**
**Location**: `/Users/HarryEvrard/Documents/GitHub/bike-fun/bike-flow-webflow.css`
**Action**: Replace **ENTIRE** CSS in Webflow embed.

### 2. bike-flow-embed.html
**Status**: ✅ Updated
**Location**: `/Users/HarryEvrard/Documents/GitHub/bike-fun/bike-flow-embed.html`
**Action**: Replace HTML in Webflow embed (contains encoding fix).

### 3. bike-flow.js
**Status**: ✅ Updated (No changes needed since v4, just ensure it's pushed)
**Location**: `/Users/HarryEvrard/Documents/GitHub/bike-fun/bike-flow.js`
**Action**: Push to GitHub if not done.

---

## How to Apply

1.  **CSS**: Copy all code from `bike-flow-webflow.css` and paste into your Webflow CSS embed.
2.  **HTML**: Copy all code from `bike-flow-embed.html` and paste into your Webflow HTML embed.
3.  **Cache**: Update script URL to `?v=6` to see changes immediately.

## Expected Result
A clean, professional, high-trust form that looks like it belongs on a modern fintech or tech product page.
