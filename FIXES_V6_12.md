# Bike Flow - CSS Overhaul & Sidebar (v6.12)

## Changes Applied

### 1. ✅ Input Styling Improvements
-   **Padding**: Increased to `14px 16px` for a more spacious feel.
-   **Background**: Added light gray background (`#F5F7FA`).
-   **Focus State**: White background + primary border on focus.
-   **Font Size**: Increased to `15px`.

### 2. ✅ Two-Column Layout
-   Form sections are now in a left column (~65%).
-   Sidebar is in a right column (~35%).
-   Responsive: Stacks on mobile (<992px).

### 3. ✅ Sidebar ("Cart") Added
**Sections Included:**
-   **Your coverage**: Package name, price, coverage bullet points.
-   **Need help with your contract?**: Phone number, chat link.
-   **Legal information**: Link to Terms and Conditions.

**Dynamic Population:**
-   `updateSidebarSummary(packageType)` function added to JS.
-   Sidebar updates when a package is selected.

---

## Files Updated

### 1. bike-flow-webflow.css (v6.12)
-   Input styling improvements.
-   Two-column layout and sidebar styles.

### 2. bike-flow-embed.html (v6.12)
-   Added `details-layout`, `form-column`, and `sidebar-column` wrappers.
-   Added sidebar card structure with `data-trans` attributes.

### 3. bike-flow.js (v6.12)
-   Added `updateSidebarSummary()` function.
-   Called from `selectPackage()`.

---

## How to Apply

1.  **Push to GitHub**:
    ```bash
    cd /Users/HarryEvrard/Documents/GitHub/bike-fun
    git add bike-flow.js bike-flow-webflow.css bike-flow-embed.html
    git commit -m "Add sidebar and improve input styling"
    git push origin main
    ```
2.  **Update Webflow**:
    -   Replace CSS in the custom code settings.
    -   Replace HTML embed block content.
    -   Update script URL to `?v=19`.

## Expected Result
-   Inputs have a refined, designer-quality look.
-   A sticky sidebar appears on the right when filling out the form.
