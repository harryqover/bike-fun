# Bike Flow - Company Fields Logic (v6.9)

## Changes Applied

### 1. ✅ Conditional Company Fields
**Change**: `companyName` and `vatIn` are now ONLY sent in the API payload if `entityType` is `ENTITY_TYPE_COMPANY`.
**Why**: Personal policies should not include these fields.

### 2. ✅ Field Renaming
**Change**: Renamed `vatNumber` to `vatIn` in the payload.
**Why**: To match the backend API requirement.

**Logic**:
```javascript
const payload = { ... }; // Basic payload

// Add company fields ONLY if company
if (formData.get("isCompany") === "yes") {
    payload.policyholder.companyName = formData.get("companyName");
    payload.policyholder.vatIn = formData.get("companyVat");
}
```

---

## Files Updated

### 1. bike-flow.js (v6.9)
**Status**: ✅ Updated
**Location**: `/Users/HarryEvrard/Documents/GitHub/bike-fun/bike-flow.js`
**Action**: Push to GitHub.

---

## How to Apply

1.  **Push JS**:
    ```bash
    cd /Users/HarryEvrard/Documents/GitHub/bike-fun
    git add bike-flow.js
    git commit -m "Fix company fields: rename vatIn and make conditional"
    git push origin main
    ```
2.  **Cache**: Update script URL to `?v=16` in Webflow.

## Expected Result
-   **Personal**: Payload has NO `companyName` or `vatIn`.
-   **Company**: Payload HAS `companyName` and `vatIn`.
