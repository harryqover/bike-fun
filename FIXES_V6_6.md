# Bike Flow - API Payload Structure Fix (v6.6)

## Changes Applied

### 1. ✅ Restructured API Payload
**Change**: Moved `action` and `domain` from inside the `payload` object to the root level of the JSON request.
**Why**: User specified that the backend expects this structure.

**Old Structure (Incorrect)**:
```json
{
  "payload": {
    "action": "createQuote",
    "domain": "webflow.io",
    ...
  }
}
```

**New Structure (Correct)**:
```json
{
  "payload": {
    ...
  },
  "action": "createQuote",
  "domain": "webflow.io"
}
```

---

## Files Updated

### 1. bike-flow.js (v6.6)
**Status**: ✅ Updated
**Location**: `/Users/HarryEvrard/Documents/GitHub/bike-fun/bike-flow.js`
**Action**: Push to GitHub.

---

## How to Apply

1.  **Push JS**:
    ```bash
    cd /Users/HarryEvrard/Documents/GitHub/bike-fun
    git add bike-flow.js
    git commit -m "Fix API payload structure: move action/domain to root"
    git push origin main
    ```
2.  **Cache**: Update script URL to `?v=13` in Webflow.

## Expected Result
- API calls should now be correctly processed by the backend.
