// Diagnostic script to check Webflow form status
// Add this to browser console to debug: https://bike-a5adfd.webflow.io/flow

console.log("=== BIKE FLOW DIAGNOSTIC ===");

// Check jQuery
console.log("1. jQuery loaded:", typeof $ !== 'undefined');

// Check form exists
console.log("2. Form #bikeQuoteForm exists:", $("#bikeQuoteForm").length > 0);
console.log("   Form #quoteForm exists:", $("#quoteForm").length > 0);

// Check sections
console.log("3. Total sections:", $(".section").length);
console.log("   Section headers (.collapsible):", $(".collapsible").length);
console.log("   Section content divs:", $(".section-content").length);

// Check which sections have .active class
console.log("4. Active sections:", $(".section-content.active").length);
$(".section-content").each(function (i) {
    console.log(`   Section ${i}: active=${$(this).hasClass('active')}, visible=${$(this).is(':visible')}`);
});

// Check if JavaScript events are bound
console.log("5. Click handlers:");
console.log("   Collapsible headers:", $._data($(".collapsible")[0], "events"));
console.log("   Toggle icons:", $._data($(".toggle-icon")[0], "events"));

// Check visibility styles
console.log("6. CSS display values:");
$(".section-content").each(function (i) {
    console.log(`   Section ${i}: display=${$(this).css('display')}`);
});

// Try to manually expand all sections
console.log("\n7. Attempting to expand all sections...");
$(".section-content").addClass("active").show();
console.log("   Active sections after manual expand:", $(".section-content.active").length);
console.log("   Visible sections:", $(".section-content:visible").length);

// Check for JavaScript errors
console.log("\n8. Checking for script loading...");
console.log("   window.locale:", window.locale);
console.log("   translations loaded:", typeof window.translations !== 'undefined');

console.log("\n=== END DIAGNOSTIC ===");
console.log("\nTo expand all sections manually, run:");
console.log('$(".section-content").addClass("active");');
