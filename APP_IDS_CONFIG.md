# Bike Flow - App IDs Configuration

## Sandbox App IDs - CONFIGURED ✅

The following sandbox app IDs have been added to `bike-flow.js`:

| Country | App ID |
|---------|--------|
| **BE** (Belgium) | `p2x4mkg2a5iekldgfao8p9jd` |
| **DE** (Germany) | `bvy4vhb4lbuib5oqw65st8cf` |
| **FR** (France) | `va92wpwvvzcpv66o73arkm5u` |
| **NL** (Netherlands) | `te0fl6v564tgh57tle6tq69k` |

## How It Works

The JavaScript now automatically selects the correct app ID based on:
1. **Country**: Extracted from locale (e.g., `fr-BE` → `BE`)
2. **Environment**: Detected from domain (`webflow.io` = sandbox)

### Code Implementation

```javascript
// Country-specific app IDs
const sandboxAppIds = {
    'BE': 'p2x4mkg2a5iekldgfao8p9jd',
    'DE': 'bvy4vhb4lbuib5oqw65st8cf',
    'FR': 'va92wpwvvzcpv66o73arkm5u',
    'NL': 'te0fl6v564tgh57tle6tq69k'
};

// Get app ID based on country
const appId = sandboxAppIds[country];

// Build redirect URL
redirectUrl = `https://appqoverme-ui.sbx.qover.io/payout/pay?locale=${locale}&id=${quoteId}&appId=${appId}`;
```

## Testing Redirects

After form submission, the redirect URL will be:

### Belgium (fr-BE or nl-BE or en-BE)
```
https://appqoverme-ui.sbx.qover.io/payout/pay?locale=fr-BE&id=XXX&appId=p2x4mkg2a5iekldgfao8p9jd
```

### Germany (de-DE or en-DE)
```
https://appqoverme-ui.sbx.qover.io/payout/pay?locale=de-DE&id=XXX&appId=bvy4vhb4lbuib5oqw65st8cf
```

### France (fr-FR or en-FR)
```
https://appqoverme-ui.sbx.qover.io/payout/pay?locale=fr-FR&id=XXX&appId=va92wpwvvzcpv66o73arkm5u
```

### Netherlands (nl-NL or en-NL)
```
https://appqoverme-ui.sbx.qover.io/payout/pay?locale=nl-NL&id=XXX&appId=te0fl6v564tgh57tle6tq69k
```

## Production App IDs - TODO

Production app IDs are currently placeholders:

```javascript
const productionAppIds = {
    'BE': 'bike_production_be',  // TODO: Replace with actual
    'DE': 'bike_production_de',  // TODO: Replace with actual
    'FR': 'bike_production_fr',  // TODO: Replace with actual
    'NL': 'bike_production_nl'   // TODO: Replace with actual
};
```

**Action needed**: When you have production app IDs, update these values in `bike-flow.js`.

## File Updated

✅ `/Users/HarryEvrard/Documents/GitHub/bike-fun/bike-flow.js`

**Changes**:
- Lines 502-528: Added country-specific app ID selection
- Added console logging for debugging: `console.log("Redirect URL:", redirectUrl)`

## Next Steps

1. **Push to GitHub**:
   ```bash
   cd /Users/HarryEvrard/Documents/GitHub/bike-fun
   git add bike-flow.js
   git commit -m "Add country-specific sandbox app IDs"
   git push origin main
   ```

2. **Clear cache**: Add version parameter or hard refresh
   ```html
   <script src="https://harryqover.github.io/bike-fun/bike-flow.js?v=3"></script>
   ```

3. **Test payment redirect**:
   - Fill out form completely
   - Submit form
   - Check browser console for "Redirect URL" log
   - Verify correct app ID is in the URL
   - Confirm redirect to payment page works

## Console Debugging

When testing, check browser console for:
```
Current locale: fr-BE
Language: fr
Country: BE
...
Redirecting to payment page
Redirect URL: https://appqoverme-ui.sbx.qover.io/payout/pay?locale=fr-BE&id=quote_123&appId=p2x4mkg2a5iekldgfao8p9jd
```

This confirms:
- Locale parsing is correct
- Country detection works
- Correct app ID is selected
- Full redirect URL is constructed properly
