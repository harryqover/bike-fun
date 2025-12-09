console.log("Bike Flow v5.0 - GAFAM Style - 20251209");

// Configuration
const partnerId = "5e78aea105bffd763b2b0a48";
const productConfigurationId = "bike";
const scriptUrl = "https://script.google.com/macros/s/AKfycbz2qPaamWm0ohds60rTzhKF9BnyE3cYpMk3bqOl4MlUPPQcADpb2VU0hqdosRELu3kp/exec";

// Global variables
let locale = "en-BE";
let country = "BE";
let language = "en";
let isSandbox = true;

// Initialize
$(document).ready(function () {
    initLocale();
    initListeners();
    translateAll(locale);

    // Set initial country field
    $("#countryField").val(country);
});

function initLocale() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('locale')) {
        locale = urlParams.get('locale');
    }

    const parts = locale.split('-');
    language = parts[0];
    if (parts.length > 1) country = parts[1].toUpperCase();

    // Check environment
    const hostname = window.location.hostname;
    isSandbox = hostname.includes("webflow.io") || hostname.includes("localhost") || urlParams.get("test") === "true";

    console.log(`Locale: ${locale}, Country: ${country}, Env: ${isSandbox ? 'Sandbox' : 'Production'}`);
}

function initListeners() {
    // "See Price" button
    $("#seePriceBtn").click(function () {
        calculatePrices();
    });

    // Final Submit
    $("#bikeQuoteForm").on("submit", function (e) {
        e.preventDefault();
        submitFinalQuote();
    });

    // Toggle company fields
    $('input[name="isCompany"]').on('change', function () {
        if ($(this).val() === 'yes') {
            $('#companyFields').slideDown();
            $('input[name="companyName"]').prop('required', true);
        } else {
            $('#companyFields').slideUp();
            $('input[name="companyName"]').prop('required', false);
        }
    });

    // Close modal
    $(".close").click(function () {
        $("#errorModal").hide();
    });
}

// --- PRICING LOGIC ---

function getDeductibles(countryCode) {
    // Hardcoded logic per user request
    if (countryCode === 'NL' || countryCode === 'DE') {
        return {
            damage: "DAMAGE_DEDUCTIBLE_STANDARD_35_FIX",
            theft: "THEFT_DEDUCTIBLE_NO_DEDUCTIBLE"
        };
    } else {
        // BE, FR, and others
        return {
            damage: "DAMAGE_DEDUCTIBLE_ENGLISH_10PC",
            theft: "THEFT_DEDUCTIBLE_STANDARD_10PC"
        };
    }
}

async function calculatePrices() {
    // Validate Top Bar inputs
    const bikeType = $("#bikeTypeInput").val();
    const bikeValue = $("#bikeValueInput").val();
    const antiTheft = $("#antiTheftInput").val();
    const zip = $("#zipInput").val();

    if (!bikeType || !bikeValue || !antiTheft || !zip) {
        $("#topBarMessage").html('<p class="error">Please fill in all fields above to see prices.</p>');
        return;
    }

    if (bikeValue < 250 || bikeValue > 10000) {
        $("#topBarMessage").html('<p class="error">Bike value must be between €250 and €10,000.</p>');
        return;
    }

    $("#topBarMessage").empty();
    $("#loadingOverlay").css("display", "flex"); // Flex to center

    // Prepare common payload data
    const deductibles = getDeductibles(country);

    // We need 3 calls: Theft, Damage, Comprehensive
    const packages = ['theft', 'damage', 'comprehensive'];

    try {
        const promises = packages.map(pkg => fetchPriceForPackage(pkg, bikeType, bikeValue, antiTheft, zip, deductibles));
        const results = await Promise.all(promises);

        // Update UI
        updatePriceCard('theft', results[0]);
        updatePriceCard('damage', results[1]);
        updatePriceCard('comprehensive', results[2]);

        // Show pricing section
        $("#pricingSection").slideDown();

        // Scroll to pricing
        $('html, body').animate({
            scrollTop: $("#pricingSection").offset().top - 20
        }, 500);

    } catch (error) {
        console.error("Pricing error:", error);
        $("#topBarMessage").html('<p class="error">Could not calculate prices. Please try again.</p>');
    } finally {
        $("#loadingOverlay").hide();
    }
}

function fetchPriceForPackage(packageType, bikeType, bikeValue, antiTheft, zip, deductibles) {
    return new Promise((resolve, reject) => {
        // Construct payload
        let coverages = {};

        if (packageType === 'theft') {
            coverages.theft = "default";
            coverages.assistance = "default"; // Always included in cards per screenshot
        } else if (packageType === 'damage') {
            coverages.damage = "default";
            coverages.assistance = "default";
        } else if (packageType === 'comprehensive') {
            coverages.theft = "default";
            coverages.damage = "default";
            coverages.assistance = "default";
        }

        const payload = {
            productConfigurationId: productConfigurationId,
            partnerId: partnerId,
            country: country,
            language: language,
            package: {
                name: getVariantName(packageType),
                coverages: coverages
            },
            policyholder: {
                entityType: "ENTITY_TYPE_PERSON",
                firstName: "Pricing", // Dummy data
                lastName: "Check",
                email: "pricing@example.com",
                address: {
                    zip: zip,
                    country: country,
                    street: "Pricing St",
                    number: "1",
                    city: "Pricing City"
                }
            },
            subject: {
                bikeValue: parseInt(bikeValue),
                bikePurchaseDate: new Date().toISOString().split('T')[0], // Assume new today
                newBike: true, // Assume new
                bikeType: bikeType,
                antiTheftMeasure: antiTheft,
                applyDepreciation: false, // Hardcoded false
                theftDeductibleType: deductibles.theft,
                damageDeductibleType: deductibles.damage,
                includeAssistance: true,
                serialNumber: "PRICING123"
            }
        };

        // Call API
        $.ajax({
            url: scriptUrl,
            method: "POST",
            dataType: "json",
            data: JSON.stringify({ payload: payload }),
            success: function (response) {
                if (response.status === "success" && response.payload && response.payload.packages) {
                    // Find the package we requested
                    const pkgName = getVariantName(packageType);
                    const pkgData = response.payload.packages[pkgName];

                    if (pkgData && pkgData.coverages) {
                        let totalPremium = 0;
                        // Sum up CIP from each coverage
                        Object.values(pkgData.coverages).forEach(coverage => {
                            // Coverage structure can be nested, e.g. coverage.theft.variants.default.premium.cip
                            // But based on user snippet: coverage -> variants -> default -> premium -> cip
                            if (coverage.variants && coverage.variants.default && coverage.variants.default.premium) {
                                totalPremium += coverage.variants.default.premium.cip;
                            }
                        });
                        resolve(totalPremium);
                    } else {
                        console.error("Package data not found for " + pkgName, response);
                        resolve(null);
                    }
                } else {
                    console.error("API Error for " + packageType, response);
                    resolve(null);
                }
            },
            error: function (err) {
                reject(err);
            }
        });
    });
}

function getVariantName(type) {
    if (type === 'theft') return "VARIANT_THEFT_ASSISTANCE";
    if (type === 'damage') return "VARIANT_DAMAGE_ASSISTANCE";
    return "VARIANT_THEFT_DAMAGE_ASSISTANCE";
}

function updatePriceCard(type, price) {
    const el = $(`#price-${type} .amount`);
    if (price) {
        // Format price (e.g. 123.45)
        const formatted = parseFloat(price).toFixed(2).replace('.', ',');
        el.text(`€${formatted}`);
    } else {
        el.text("N/A");
    }
}

// --- SELECTION LOGIC ---

window.selectPackage = function (type) {
    // Set hidden inputs
    $("#selectedPackage").val(type);

    // Set deductibles based on country
    const deductibles = getDeductibles(country);
    $("#theftDeductibleInput").val(deductibles.theft);
    $("#damageDeductibleInput").val(deductibles.damage);

    // Highlight selected card
    $(".pricing-card").removeClass("selected").css("border-color", "#E5E7EB");
    $(`.pricing-card[data-package="${type}"]`).addClass("selected").css("border-color", "#0057FF");

    // Show details section
    $("#detailsSection").slideDown();

    // Scroll to details
    $('html, body').animate({
        scrollTop: $("#detailsSection").offset().top - 20
    }, 500);
};

// --- FINAL SUBMISSION ---

function submitFinalQuote() {
    $("#loadingOverlay").css("display", "flex");

    const formData = new FormData(document.getElementById("bikeQuoteForm"));
    const packageType = $("#selectedPackage").val();
    const deductibles = getDeductibles(country);

    // Build final payload (similar to fetchPrice but with real data)
    let coverages = {};
    if (packageType === 'theft') {
        coverages.theft = "default";
        coverages.assistance = "default";
    } else if (packageType === 'damage') {
        coverages.damage = "default";
        coverages.assistance = "default";
    } else {
        coverages.theft = "default";
        coverages.damage = "default";
        coverages.assistance = "default";
    }

    const payload = {
        productConfigurationId: productConfigurationId,
        partnerId: partnerId,
        country: country,
        language: language,
        renewal: { type: "RENEWAL_TYPE_OPT_IN" },
        package: {
            name: getVariantName(packageType),
            coverages: coverages
        },
        policyholder: {
            entityType: formData.get("isCompany") === "yes" ? "ENTITY_TYPE_COMPANY" : "ENTITY_TYPE_PERSON",
            firstName: formData.get("firstName"),
            lastName: formData.get("lastName"),
            email: formData.get("email"),
            phone: formData.get("phone"),
            companyName: formData.get("companyName"),
            vatNumber: formData.get("companyVat"),
            birthdate: formData.get("birthdate"),
            address: {
                street: formData.get("street"),
                number: "1",
                zip: $("#zipInput").val(), // Use top bar value
                city: formData.get("city"),
                country: country
            }
        },
        subject: {
            bikeValue: parseInt($("#bikeValueInput").val()),
            bikePurchaseDate: formData.get("bikePurchaseDate"),
            newBike: formData.get("newBike") === "true",
            bikeType: $("#bikeTypeInput").val(),
            antiTheftMeasure: $("#antiTheftInput").val(),
            applyDepreciation: false, // Hardcoded
            theftDeductibleType: deductibles.theft,
            damageDeductibleType: deductibles.damage,
            includeAssistance: true,
            serialNumber: formData.get("serialNumber")
        }
    };

    // Send to API
    $.ajax({
        url: scriptUrl,
        method: "POST",
        dataType: "json",
        data: JSON.stringify({ payload: payload }),
        success: function (response) {
            if (response.status === "success" && response.payload && response.payload.payment) {
                // Redirect logic
                const sandboxAppIds = {
                    'BE': 'p2x4mkg2a5iekldgfao8p9jd',
                    'DE': 'bvy4vhb4lbuib5oqw65st8cf',
                    'FR': 'va92wpwvvzcpv66o73arkm5u',
                    'NL': 'te0fl6v564tgh57tle6tq69k'
                };
                const appId = isSandbox ? sandboxAppIds[country] : "bike_production_" + country.toLowerCase();
                const redirectUrl = isSandbox
                    ? `https://appqoverme-ui.sbx.qover.io/payout/pay?locale=${locale}&id=${response.payload.id}&appId=${appId}`
                    : `https://app.qover.com/payout/pay?locale=${locale}&id=${response.payload.id}&appId=${appId}`;

                window.location.href = redirectUrl;
            } else {
                $("#loadingOverlay").hide();
                $("#errorModal .modal-body").html('<p class="error">Error creating quote. Please try again.</p>');
                $("#errorModal").show();
            }
        },
        error: function () {
            $("#loadingOverlay").hide();
            $("#errorModal .modal-body").html('<p class="error">Connection error. Please try again.</p>');
            $("#errorModal").show();
        }
    });
}

// Translation logic (simplified for brevity, keep existing if possible or ensure it works)
function translateAll(locale) {
    const [lang] = locale.split('-');
    const url = `https://api.prd.qover.io/i18n/v1/projects/webflow-bike-flow/${lang}.json?refresh=001`;

    let xhr = new XMLHttpRequest();
    xhr.open("get", url, true);
    xhr.overrideMimeType("application/json; charset=UTF-8");
    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            const translations = JSON.parse(xhr.responseText);
            $("[data-trans]").each(function () {
                const key = $(this).data("trans");
                if (translations[key]) $(this).text(translations[key]);
            });
            $("[data-trans-placeholder]").each(function () {
                const key = $(this).data("trans-placeholder");
                if (translations[key]) $(this).attr("placeholder", translations[key]);
            });
        }
    };
    xhr.send();
}
