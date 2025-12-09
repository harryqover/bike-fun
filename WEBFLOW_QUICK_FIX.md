# Quick Fix for Hidden Sections in Webflow

## The Problem
Form sections are not visible on the Webflow page because they have `display: none` by default and the JavaScript isn't expanding them properly.

## Immediate Solution (Manual Fix)

### Option 1: Add This JavaScript to Webflow (Temporary Fix)

Add this code snippet at the END of your HTML embed in Webflow (after the form closing tag):

```html
<script>
// Force all sections to be visible on page load
jQuery(document).ready(function($) {
    // Make first section active by default
    $('.section-content').first().addClass('active');
    
    // Add click handlers for section headers
    $('.collapsible').on('click', function() {
        var $content = $(this).next('.section-content');
        $('.section-content').not($content).removeClass('active');
        $content.toggleClass('active');
    });
    
    // Add click handlers for confirm buttons
    $('.toggle-icon').on('click', function() {
        var $currentSection = $(this).closest('.section');
        var $nextSection = $currentSection.next('.section');
        
        $(this).parent().removeClass('active');
        
        if ($nextSection.length) {
            $nextSection.find('.section-content').addClass('active');
        }
    });
});
</script>
```

### Option 2: Make All Sections Visible by Default (CSS Fix)

Add this to your CSS embed in Webflow:

```css
/* Override: Make all sections visible by default */
#bikeQuoteForm .section-content {
    display: block !important;
}

/* Or just make first section visible */
#bikeQuoteForm .section:first-child .section-content {
    display: block !important;
}
```

---

## Root Cause Analysis

The issue is that:

1. **CSS hides sections**: `#bikeQuoteForm .section-content { display: none; }`
2. **JavaScript should show them**: By adding `.active` class which sets `display: block`
3. **But JavaScript isn't running properly** because:
   - File might not be pushed togithub
   - Or cache is preventing updates
   - Or jQuery isn't loaded when script runs

---

## Proper Fix (What You Should Do)

### Step 1: Verify JavaScript is on GitHub

Run this command to check if your latest changes are pushed:

```bash
cd /Users/HarryEvrard/Documents/GitHub/bike-fun
git status
git log --oneline -1
```

If not pushed:
```bash
git add bike-flow.js
git commit -m "Fix form ID references for Webflow"  
git push origin main
```

### Step 2: Force Cache Bust in Webflow

In your Webflow HTML embed, update the script tag:

**Change from:**
```html
<script src="https://harryqover.github.io/bike-fun/bike-flow.js"></script>
```

**Change to:**
```html
<script src="https://harryqover.github.io/bike-fun/bike-flow.js?v=20251208"></script>
```

The `?v=20251208` forces browsers to fetch a fresh copy.

### Step 3: Also Load Script in Document Head

The jQuery handlers might be running before the DOM is ready. Make sure jQuery is loaded BEFORE the bike-flow.js script:

```html
<!-- In Webflow HTML Embed, ensure this order: -->

<!-- 1. jQuery first (if not already in page) -->
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

<!-- 2. Your form HTML here -->
<form id="bikeQuoteForm">
  <!-- form content -->
</form>

<!-- 3. Bike flow script last -->
<script src="https://harryqover.github.io/bike-fun/bike-flow.js?v=20251208"></script>
```

---

## Testing After Fix

1. Clear browser cache completely (Cmd+Shift+R or Ctrl+Shift+F5)
2. Visit: `https://bike-a5adfd.webflow.io/flow?locale=fr-FR&test=true`
3. Open browser console (F12) and check for errors
4. Run diagnostic:
   ```javascript
   console.log("Form:", $("#bikeQuoteForm").length);
   console.log("Sections:", $(".section-content").length);
   console.log("Active:", $(".section-content.active").length);
   ```

Expected output:
- Form: 1
- Sections: 4
- Active: 1 (at minimum, the first section should be active)

---

## Quick Test Command (Run in Browser Console)

Paste this in browser console on the Webflow page:

```javascript
// Show all sections immediately
$('.section-content').addClass('active').css('display', 'block');

// Check if it worked
console.log('Visible sections:', $('.section-content:visible').length);
```

If sections appear after running this, then the issue is definitely the JavaScript file not loading or running properly.

---

## Files to Check

1. **bike-flow.js on GitHub**: 
   - URL: https://github.com/harryqover/bike-fun/blob/main/bike-flow.js
   - Should contain `#bikeQuoteForm` (not `#quoteForm`)
   - Should have language extraction for translations

2. **Webflow HTML Embed**:
   - Should have `<form id="bikeQuoteForm">` (with ID)
   - Should load jQuery before bike-flow.js
   - Should have cache-busting parameter on script URL

3. **Webflow CSS Embed**:
   - Should have rules for `.section-content.active { display: block; }`
   - Should be BEFORE the HTML embed element

---

## If Nothing Works

Use the "Option 1" temporary fix above - it's a self-contained JavaScript snippet that doesn't rely on external files and will make the sections work immediately while you debug the main issue.
