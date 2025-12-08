# Bike Flow - Webflow Bug Fixes

## Issues Fixed

### 1. Translation URL 404 Error ✅
**Problem**: Translation API was returning 404 error
```
GET .../webflow-bike-flow/en-BE.json 404 (Not Found)
```

**Root Cause**: Translation API expects language-only format (`en`, `fr`, `nl`, `de`), not full locale (`en-BE`, `fr-BE`)

**Fix Applied**: Modified `bike-flow.js` line 86 to extract language from locale:
```javascript
const [language] = locale.split('-'); // Extract language only
const translationUrl = `https://api.prd.qover.io/i18n/v1/projects/webflow-bike-flow/${language}.json?refresh=001`;
```

**Result**: Now correctly requests `en.json`, `fr.json`, `nl.json`, `de.json`

---

### 2. Hidden Form Sections (Bike Details & Policyholder) ✅ 
**Problem**: Form sections not visible on Webflow page - only headers showing

**Root Cause**: Form ID mismatch between HTML and JavaScript
-  **HTML embed**: Uses `id="bikeQuoteForm"`  
- **JavaScript**: Was referencing `#quoteForm`

**Fix Applied**: Updated all jQuery selectors in `bike-flow.js`:

| Line | Before | After |
|------|--------|-------|
| 130 | `$("#quoteForm").on(...)` | `$("#bikeQuoteForm").on(...)` |
| 261 | `$("#quoteForm").on("submit"...)` | `$("#bikeQuoteForm").on("submit"...)` |
| 274 | `$("#quoteForm [required]")` | `$("#bikeQuoteForm [required]")` |

**Result**: Form sections now properly respond to clicks and expand/collapse

---

## Files Updated

✅ `/Users/HarryEvrard/Documents/GitHub/bike-fun/bike-flow.js`
- Line 86: Translation URL language extraction  
- Line 130: Focus event handler
- Line 261: Form submission handler
- Line 274: Required fields validation

---

## What You Need to Do

### 1. Push Updated JavaScript to GitHub
```bash
cd /Users/HarryEvrard/Documents/GitHub/bike-fun
git add bike-flow.js
git commit -m "Fix: Translation URL and form ID references for Webflow"
git push origin main
```

### 2. Clear Browser Cache
The JavaScript is cached, so you need to:
- Hard refresh: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + F5` (Windows)
- Or update the script URL in your Webflow embed to bust cache:
```html
<script src="https://harryqover.github.io/bike-fun/bike-flow.js?v=2"></script>
```

### 3. Upload Translations to i18n
Make sure translations are uploaded with correct filenames:
- ✅ `en.json` (not `en-BE.json`)
- ✅ `fr.json` (not `fr-BE.json`)
- ✅ `nl.json` (not `nl-NL.json`)
- ✅ `de.json` (not `de-DE.json`)

---

## Testing

After pushing the updated JavaScript and clearing cache, test:

1. **Visit**: `https://bike-a5adfd.webflow.io/flow?locale=nl-BE&test=true`

2. **Check console** - should see:
   - ✅ "Translations loaded: {...}"
   - ✅ No 404 errors
   - ✅ "Test mode: prefilling form"

3. **Verify form**:
   - ✅ Coverage Selection section is expanded
   - ✅ Click "About Your Bike" header → section expands
   - ✅ Click "Policyholder Details" header → section expands
   - ✅ Test data should be prefilled
   - ✅ All fields are visible

4. **Test in other languages**:
   - `?locale=en-BE&test=true`
   - `?locale=fr-BE&test=true`
   - `?locale=de-DE&test=true`

---

## Expected Behavior After Fixes

✅ **Translations load correctly** (no 404 errors)  
✅ **All form sections visible** and clickable  
✅ **Test mode works** (prefills all fields)  
✅ **Collapsible sections** work (click to expand/collapse)  
✅ **Confirm buttons** work (expand next section)  
✅ **Form validation** works  
✅ **Form submission** works

---

## Quick Verification

Run this in browser console on the Webflow page:
```javascript
// Check form exists
console.log("Form found:", $("#bikeQuoteForm").length > 0);

// Check sections
console.log("Sections:", $(".section").length);

// Check active section
console.log("Active sections:", $(".section-content.active").length);

// Expand all sections
$(".section-content").addClass("active");
```

If form is working:
- "Form found: true"
- "Sections: 4" (Coverage, Bike, Policyholder, Start Date)
- After expanding: All sections should be visible
