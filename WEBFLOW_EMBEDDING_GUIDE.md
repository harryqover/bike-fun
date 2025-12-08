# Webflow Embedding Guide for Bike Insurance Flow

## Files Created for Webflow

1. **bike-flow-embed.html** - HTML form content (without `<html>`, `<body>` tags)
2. **bike-flow-webflow.css** - Optimized CSS with Webflow design matching
3. **bike-flow.js** - JavaScript logic (hosted on GitHub)

## Step-by-Step Embedding Instructions

### Step 1: Add CSS to Webflow

1. In your Webflow page editor, add an **Embed** element
2. Paste the contents of `bike-flow-webflow.css` wrapped in `<style>` tags:

```html
<style>
/* Paste contents of bike-flow-webflow.css here */
</style>
```

Place this embed **before** the form HTML embed.

### Step 2: Add HTML Form to Webflow

1. Add another **Embed** element below the CSS embed
2. Paste the contents of `bike-flow-embed.html`

### Step 3: URL Parameters

The form expects a `locale` parameter in the URL:
- `?locale=en-BE` - English, Belgium
- `?locale=fr-BE` - French, Belgium
- `?locale=nl-NL` - Dutch, Netherlands
- `?locale=de-DE` - German, Germany

**In Webflow**, you can set this dynamically or use Webflow's URL settings.

### Step 4: Testing

Add `&test=true` to prefill the form with test data:
```
https://bike-a5adfd.webflow.io/flow?locale=fr-BE&test=true
```

## Key Design Improvements

### Color Scheme
- Primary: `#36493d` (Green) - used for buttons, accents, borders
- Background: `#f7f7f7` (Light grey)
- Text: `#333` (Dark grey)
- Borders: `#e2e2e2` (Light grey)
- Success: `#e8f5e9` (Light green)

### Typography
- Font: `Inter` (imported from Google Fonts)
- Headings: 600 weight
- Labels: 500 weight
- Body text: 400 weight

### Form Elements
- Border radius: `6px`
- Input padding: `12px 15px`
- Border: `1px solid #e2e2e2`
- Focus: Green border with subtle shadow
- Selected radio/checkbox: Green accent with light green background

### Buttons
- Confirm buttons: Green outline, fills on hover
- Submit button: Solid green, darker on hover
- Hover effects: Subtle lift with shadow

## CSS Selector Prefix

All CSS rules are prefixed with `#bikeQuoteForm` to avoid conflicts with Webflow styles:

```css
#bikeQuoteForm .field { ... }
#bikeQuoteForm .button { ... }
```

This ensures the styles only apply to the embedded form.

## Responsive Breakpoints

- Mobile: `max-width: 768px`
  - Single column layout
  - Stacked radio buttons
  - Smaller fonts
  - Adjusted paddings

## Common Issues & Solutions

### Issue: Styles not applying
**Solution**: Make sure the CSS embed is placed **before** the HTML embed.

### Issue: Form not submitting
**Solution**: Check browser console for JavaScript errors. Ensure jQuery is loaded.

### Issue: Translations not loading
**Solution**: Verify locale parameter is in URL and translations are uploaded to i18n project.

### Issue: Price not showing
**Solution**: Pricing API is not yet ready - form shows "Price will be calculated" placeholder.

### Issue: Button colors wrong
**Solution**: Webflow global styles might be overriding. Add `!important` to button CSS if needed:
```css
#bikeQuoteForm .button {
  background-color: #36493d !important;
}
```

## JavaScript Configuration

The `bike-flow.js` file is hosted at:
```
https://harryqover.github.io/bike-fun/bike-flow.js
```

Make sure this URL is accessible and the file is pushed to GitHub.

## Required External Dependencies

1. **jQuery 3.6.0** - Included in embed HTML
2. **Google Fonts (Inter)** - Loaded via CSS @import
3. **bike-flow.js** - Hosted on GitHub Pages

## Testing Checklist

- [ ] CSS embed added before HTML
- [ ] HTML embed added with form content
- [ ] Locale parameter in URL (`?locale=en-BE`)
- [ ] Form loads and displays correctly
- [ ] Sections are collapsible
- [ ] Coverage options work
- [ ] Form validation works
- [ ] Company/Personal toggle works
- [ ] Submit button appears
- [ ] Test mode works (`&test=true`)
- [ ] Mobile responsive (test on phone)
- [ ] Colors match reference design
- [ ] Fonts are Inter

## Next Steps After Embedding

1. Upload translations to `webflow-bike-flow` i18n project
2. Test form submission to API
3. Get actual app IDs for payment redirect
4. Test in all 4 languages
5. Remove `&test=true` for production

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify all external files are loading (Network tab)
3. Test with `?locale=en-BE&test=true` to see if form prefills
4. Compare with reference design at `/flow-be-en`
