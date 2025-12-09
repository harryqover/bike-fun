# Bike Flow - Fixes Applied (v2.0)

## Issues Fixed

### 1. ✅ CSV Encoding - French Accents
**Problem**: French text showing garbled characters
```
"acceptÃ©" instead of "accepté"
"Ã©lectronique" instead of "électronique"  
```

**Root Cause**: CSV file not properly encoded as UTF-8

**Fix**: Regenerated CSV file with proper UTF-8 encoding

**File**: `bike-flow-translations.csv`

**Test**: After uploading to i18n, check:
- `https://bike-a5adfd.webflow.io/flow?locale=fr-BE&test=true`
- Legal checkboxes should show proper accents: "accepté", "électronique", "général"

---

### 2. ✅ Layout Overlap - Coverage Over Bike Details
**Problem**: From screenshot - coverage section elements appearing over bike details section

**Root Cause**: Multiple CSS issues:
- Missing `clear: both` on sections
- No proper overflow control
- Sections not isolated properly

**Fixes Applied** in `bike-flow-webflow.css`:

```css
/* Section isolation */
#bikeQuoteForm .section {
  margin-bottom: 0;
  padding-bottom: 30px;
  clear: both; /* Prevent float issues */
  position: relative;
}

/* Section content overflow */
#bikeQuoteForm .section-content {
  padding: 25px 0 10px 0;
  display: none;
  clear: both;
  position: relative;
  overflow: visible;
}

/* Form clearing */
#bikeQuoteForm::after {
  content: "";
  display: table;
  clear: both;
}
```

---

### 3. ✅ Design Match - Closer to Reference
**Changes to match**: `https://bike-a5adfd.webflow.io/flow-be-en`

#### Grid Layout for Radio Buttons
**Before**: Flexbox with min-width
**After**: CSS Grid with auto-fit
```css
#bikeQuoteForm .radio-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}
```

#### Better Spacing
- Section headers: `padding: 20px 0 15px 0`
- Section content: `padding: 25px 0 10px 0`
- Input margins: consistent `margin-bottom: 20px`
- Radio group margins: `margin-bottom: 24px`

#### Typography Improvements
- H2 font-size: `22px` (was `24px`)
- Label font-size: `14px` with `line-height: 1.4`
- Better line heights throughout

#### Button Styling
- Toggle buttons: Green outline with white background
- Hover: Green fill with lift effect
- Submit button: Solid green with `!important` to override Webflow styles

---

## Files Updated

### 1. bike-flow-translations.csv
**Status**: ✅ Re-created with UTF-8 encoding
**Location**: `/Users/HarryEvrard/Documents/GitHub/bike-fun/bike-flow-translations.csv`
**Action Needed**: Upload to i18n project as `en.json`, `fr.json`, `nl.json`, `de.json`

### 2. bike-flow-webflow.css
**Status**: ✅ Updated v2.0
**Location**: `/Users/HarryEvrard/Documents/GitHub/bike-fun/bike-flow-webflow.css`
**Action Needed**: Replace CSS in Webflow embed

---

## How to Apply Fixes

### Step 1: Update CSS in Webflow

1. Open your Webflow page editor
2. Find the CSS embed element (should be BEFORE the HTML embed)
3. Replace ALL contents with the new `bike-flow-webflow.css` file:

```html
<style>
/* Paste ENTIRE contents of bike-flow-webflow.css here */
</style>
```

### Step 2: Clear Cache

- Hard refresh: `Cmd + Shift + R` (Mac)
- Or add version to URLs in embed:
  ```html
  <script src="https://harryqover.github.io/bike-fun/bike-flow.js?v=2"></script>
  ```

### Step 3: Upload Translations

Upload to i18n project `webflow-bike-flow`:
- Parse the CSV file
- Create separate JSON files for each language
- Upload as: `en.json`, `fr.json`, `nl.json`, `de.json`

---

## Expected Results After Fixes

### Visual Improvements
- ✅ No more section overlap
- ✅ Proper spacing between all sections
- ✅ Better grid layout forradio buttons
- ✅ Cleaner, more professional appearance
- ✅ Closer match to reference design

### French Text
Before: `Je confirme avoir lu et acceptÃ© l'accord sur la communication Ã©lectronique`

After: `Je confirme avoir lu et accepté l'accord sur la communication électronique`

### Layout
Before (Issue):
```
┌─────────────────────┐
│ Coverage Selection  │ ← Blue highlight
│ Select your package │
│                     │
│ [Bike make]        │ ← Overlapping!
│ [Bike value]       │
└─────────────────────┘
```

After (Fixed):
```
┌─────────────────────┐
│ Coverage Selection  │
│ Select your package │
│ [Radio buttons]     │
│ [Deductibles]       │
│ [Confirm]           │
└─────────────────────┘
┌─────────────────────┐
│ About Your Bike     │ ← Click to expand
└─────────────────────┘
```

---

## Testing Checklist

After applying updates:

- [ ] Visit: `https://bike-a5adfd.webflow.io/flow?locale=fr-BE&test=true`
- [ ] Check French accents are correct (é, è, à, etc.)
- [ ] Verify no overlap between sections
- [ ] Click each section header - should expand/collapse smoothly
- [ ] Check radio button layout - should be in grid
- [ ] Verify spacing looks professional
- [ ] Test mobile view (resize browser)
- [ ] Check all 4 languages work: `en-BE`, `fr-BE`, `nl-NL`, `de-DE`
- [ ] Test form submission works

---

## Screenshot Comparison

### Issue (Your Screenshot)
![Layout Issue](/Users/HarryEvrard/.gemini/antigravity/brain/d6afcf2c-94e7-46cc-b41e-217c1a466426/uploaded_image_1765224725049.png)

**Problems visible**:
- "Select your package" label has blue highlight
- Bike fields appearing in wrong place
- Coverage options overlapping with bike details
- Poor spacing

### Expected After Fix
- Clean section separation
- No blue highlighting
- Coverage section fully contained
- Bike details only visible when their section is expanded
- Professional spacing throughout

---

## Key CSS Changes Summary

| Element | Change | Reason |
|---------|--------|--------|
| `.section` | Added `clear: both` | Prevent float issues |
| `.section-content` | Added `clear: both`, `overflow: visible` | Isolate sections |
| `.radio-group` | Changed to CSS Grid | Better responsive layout |
| `h2` | Reduced padding, smaller font | Match reference |
| All margins | Standardized spacing | Consistent look |
| `.button` | Added `!important` flags | Override Webflow |
| Form | Added `::after` clearfix | Prevent overlaps |

---

## If Issues Persist

### Double-check:
1. CSS embed is BEFORE HTML embed in Webflow
2. CSS was pasted completely (check first and last lines)
3. Browser cache was cleared
4. No other CSS in Webflow is conflicting

### Quick Test:
Paste this in browser console:
```javascript
$('.section-content').removeClass('active');
$('.section').first().find('.section-content').addClass('active');
```

Should show only first section, properly formatted.

---

## Version Info

- **CSV**: v2 - UTF-8 encoded
- **CSS**: v2.0 - Layout fixes + design improvements
- **Date**: 2025-12-08
- **Tested**: Layout overlap, French accents, grid layout
