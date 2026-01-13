console.log("Bike Flow v5.0 - GAFAM Style - 20251209");
console.log("UPDATE 20260113");

// Configuration
const partnerId = "5e78aea105bffd763b2b0a48";
const productConfigurationId = "bike";
const scriptUrl = "https://script.google.com/macros/s/AKfycbz2qPaamWm0ohds60rTzhKF9BnyE3cYpMk3bqOl4MlUPPQcADpb2VU0hqdosRELu3kp/exec";

// Global variables
let locale = "en-BE";
let country = "BE";
let language = "en";
let isSandbox = true;
let currentQuoteResponse = null; // Store full quote response for documents

// Metadata Configuration
const metadataTermsConfig = {
    "BE": ["acceptance", "important", "eligibility", "general"],
    "FR": ["acceptance", "important", "eligibility", "general"],
    "DE": ["acceptance", "important", "eligibility", "general"],
    "NL": ["acceptance", "important", "eligibility", "general"]
};

// Initialize
$(document).ready(function () {
    initLocale();
    initListeners();
    translateAll(locale);

    // Set initial country field
    $("#countryField").val(country);

    // Pre-fill from URL
    initUrlParams();
});

function initUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);

    // Bike Type
    if (urlParams.has('bikeType')) {
        $("#bikeTypeInput").val(urlParams.get('bikeType'));
    }

    // Bike Value
    if (urlParams.has('bikeValue')) {
        $("#bikeValueInput").val(urlParams.get('bikeValue'));
    }

    // Anti-theft
    if (urlParams.has('antiTheftMeasure')) {
        $("#antiTheftInput").val(urlParams.get('antiTheftMeasure'));
    }

    // Zip Code
    if (urlParams.has('zip')) {
        $("#zipInput").val(urlParams.get('zip'));
    }

    // Auto-load prices if all required parameters are present
    const bikeType = $("#bikeTypeInput").val();
    const bikeValue = $("#bikeValueInput").val();
    const antiTheft = $("#antiTheftInput").val();
    const zip = $("#zipInput").val();

    if (bikeType && bikeValue && antiTheft && zip) {
        console.log("All URL params present - auto-loading prices...");
        // Small delay to ensure DOM is ready
        setTimeout(function () {
            calculatePrices();
        }, 100);
    }
}

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

function getTimeZone(countryCode) {
    const tzMap = {
        'BE': 'Europe/Brussels',
        'FR': 'Europe/Paris',
        'NL': 'Europe/Amsterdam',
        'DE': 'Europe/Berlin'
    };
    return tzMap[countryCode] || 'Europe/Brussels';
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

    // --- SMART LOADER START ---
    $("#loadingOverlay").css("display", "flex");

    // Reset loader state
    $("#progressBar").css("width", "0%");
    $("#loaderMessage").text("Gathering bike data...");

    // Start fake progress animation (up to 90% over 8 seconds)
    let progress = 0;
    const progressInterval = setInterval(() => {
        if (progress < 90) {
            progress += Math.random() * 5; // Random increment
            if (progress > 90) progress = 90;
            $("#progressBar").css("width", progress + "%");
        }
    }, 500);

    // Cycle messages
    const messages = [
        "Analyzing bike profile...",
        "Checking theft risk for " + zip + "...",
        "Calculating best rates...",
        "Applying discounts...",
        "Finalizing your quote..."
    ];
    let msgIndex = 0;
    const msgInterval = setInterval(() => {
        if (msgIndex < messages.length) {
            $("#loaderMessage").text(messages[msgIndex]);
            msgIndex++;
        }
    }, 1500);
    // --- SMART LOADER END ---

    // Prepare common payload data
    const deductibles = getDeductibles(country);

    try {
        // OPTIMIZATION: Single API call to get all prices
        // We request 'comprehensive' which usually triggers calculation for all variants
        const allPrices = await fetchAllPrices(bikeType, bikeValue, antiTheft, zip, deductibles);

        if (allPrices) {
            // Update UI with extracted prices
            updatePriceCard('theft', allPrices.theft);
            updatePriceCard('damage', allPrices.damage);
            updatePriceCard('comprehensive', allPrices.comprehensive);

            // SORTING LOGIC: Sort cards by price ascending
            const cards = [
                { type: 'theft', price: allPrices.theft || 0 },
                { type: 'damage', price: allPrices.damage || 0 },
                { type: 'comprehensive', price: allPrices.comprehensive || 0 }
            ];

            cards.sort((a, b) => a.price - b.price);

            const container = $(".pricing-cards-container");
            cards.forEach(card => {
                const cardEl = $(`.pricing-card[data-package="${card.type}"]`);
                container.append(cardEl); // Re-appending moves it to the end
            });

            // Complete loading animation
            clearInterval(progressInterval);
            clearInterval(msgInterval);
            $("#progressBar").css("width", "100%");
            $("#loaderMessage").text("Done!");

            // Short delay to show 100%
            setTimeout(() => {
                $("#loadingOverlay").fadeOut(300);

                // Show pricing section
                $("#pricingSection").slideDown();

                // Scroll to pricing
                $('html, body').animate({
                    scrollTop: $("#pricingSection").offset().top - 20
                }, 500);
            }, 500);
        } else {
            throw new Error("No prices returned");
        }

    } catch (error) {
        console.error("Pricing error:", error);
        clearInterval(progressInterval);
        clearInterval(msgInterval);
        $("#loadingOverlay").hide();
        $("#topBarMessage").html('<p class="error">Could not calculate prices. Please try again.</p>');
    }
}

function fetchAllPrices(bikeType, bikeValue, antiTheft, zip, deductibles) {
    return new Promise((resolve, reject) => {
        // Construct payload for 'comprehensive' to trigger full calculation
        // Construct payload for 'comprehensive' to trigger full calculation
        const payload = {
            productConfigurationId: productConfigurationId,
            partnerId: partnerId,
            country: country,
            language: language,
            package: {
                name: "VARIANT_THEFT_DAMAGE_ASSISTANCE", // Requesting full package
                coverages: {
                    theft: "default",
                    damage: "default",
                    assistance: "default"
                }
            },
            policyholder: {
                entityType: "ENTITY_TYPE_PERSON",
                firstName: "Pricing",
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
                bikePurchaseDate: new Date().toISOString().split('T')[0],
                newBike: true,
                bikeType: bikeType,
                antiTheftMeasure: antiTheft,
                applyDepreciation: false,
                theftDeductibleType: deductibles.theft,
                damageDeductibleType: deductibles.damage,
                //includeAssistance: true,
                serialNumber: "PRICING123"
            }
        };

        // Call API
        $.ajax({
            url: scriptUrl,
            method: "POST",
            dataType: "json",
            data: JSON.stringify({
                payload: payload,
                action: "createQuote",
                domain: "webflow.io"
            }),
            success: function (response) {
                if (response.status === "success" && response.payload && response.payload.packages) {
                    // Store full response for documents
                    currentQuoteResponse = response.payload;

                    const packages = response.payload.packages;

                    // Extract prices for each variant
                    const prices = {
                        theft: getPriceFromPackage(packages, "VARIANT_THEFT_ASSISTANCE"),
                        damage: getPriceFromPackage(packages, "VARIANT_DAMAGE_ASSISTANCE"),
                        comprehensive: getPriceFromPackage(packages, "VARIANT_THEFT_DAMAGE_ASSISTANCE")
                    };

                    resolve(prices);
                } else {
                    console.error("API Error", response);
                    resolve(null);
                }
            },
            error: function (err) {
                reject(err);
            }
        });
    });
}

function getPriceFromPackage(packages, variantName) {
    const pkgData = packages[variantName];
    if (pkgData && pkgData.coverages) {
        let totalPremium = 0;
        Object.values(pkgData.coverages).forEach(coverage => {
            if (coverage.variants && coverage.variants.default && coverage.variants.default.premium) {
                totalPremium += coverage.variants.default.premium.cip;
            }
        });
        return totalPremium;
    }
    return null;
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

    // Update Sidebar Summary
    updateSidebarSummary(type);

    // Update Legal Documents from API response
    updateLegalDocuments();

    // Show details section
    $("#detailsSection").slideDown();

    // Scroll to details
    $('html, body').animate({
        scrollTop: $("#detailsSection").offset().top - 20
    }, 500);
};

// Helper to update sidebar summary
function updateSidebarSummary(packageType) {
    // Package name mapping
    const packageNames = {
        'theft': 'Theft + Assistance',
        'damage': 'Damage + Assistance',
        'comprehensive': 'Omnium (All-Inclusive)'
    };

    // Get price from the pricing card
    const priceText = $(`#price-${packageType} .amount`).text();

    // Update sidebar elements
    $("#summaryPackageLabel").text(packageNames[packageType] || 'Selected Plan');
    $("#summaryPrice").text(priceText ? `€${priceText.replace('€', '')}` : '€--');

    // Update coverage list based on package
    const coverageList = $("#summaryCoverages");
    coverageList.empty();

    if (packageType === 'theft') {
        coverageList.append('<li>Cover against theft</li>');
        coverageList.append('<li>24/7 assistance</li>');
    } else if (packageType === 'damage') {
        coverageList.append('<li>Cover against damage</li>');
        coverageList.append('<li>24/7 assistance</li>');
    } else {
        coverageList.append('<li>Cover against theft</li>');
        coverageList.append('<li>24/7 assistance</li>');
        coverageList.append('<li>Cover against damage</li>');
    }
}

// Helper to update legal documents from quote response
function updateLegalDocuments() {
    const container = $("#legalDocumentsList");
    if (!container.length) {
        return;
    }

    // Clear existing links
    container.empty();

    if (!currentQuoteResponse || !currentQuoteResponse.documents) {
        // Fallback if no documents
        container.html('<p><a href="#" data-trans="bf.sidebar.legal.termsLink">Terms and conditions</a></p>');
        return;
    }

    // Document name mappings for display
    const documentLabels = {
        'terms-and-conditions': 'Terms and conditions',
        'ipid': 'Product Information Document (IPID)',
        'privacy-policy': 'Privacy Policy',
        'pre-contractual-info': 'Pre-contractual Information'
    };

    // Translation key mappings
    const documentTransKeys = {
        'terms-and-conditions': 'bf.sidebar.legal.termsLink',
        'ipid': 'bf.sidebar.legal.ipidLink',
        'privacy-policy': 'bf.sidebar.legal.privacyLink',
        'pre-contractual-info': 'bf.sidebar.legal.preContractLink'
    };

    // Build base URL based on environment
    const baseUrl = isSandbox
        ? 'https://appqoverme-ui.sbx.qover.io/modules/dam/assets/'
        : 'https://app.qover.com/modules/dam/assets/';

    // Iterate through documents and create links
    const documents = currentQuoteResponse.documents;
    const docKeys = Object.keys(documents);

    docKeys.forEach(docKey => {
        const doc = documents[docKey];

        if (doc && doc.assetId) {
            const url = baseUrl + doc.assetId + '/content';
            const label = documentLabels[docKey] || docKey.replace(/-/g, ' ');
            const transKey = documentTransKeys[docKey] || '';

            const link = $('<p>').append(
                $('<a>')
                    .attr('href', url)
                    .attr('target', '_blank')
                    .attr('rel', 'noopener noreferrer')
                    .attr('data-trans', transKey)
                    .text(label)
            );
            container.append(link);
        }
    });
}

// --- FINAL SUBMISSION ---

function submitFinalQuote() {
    $("#loadingOverlay").css("display", "flex");

    const formData = new FormData(document.getElementById("bikeQuoteForm"));
    const packageType = $("#selectedPackage").val();
    const deductibles = getDeductibles(country);

    // DYNAMIC METADATA TERMS LOGIC
    // Get terms for current country or fallback to a default list
    const termsArray = metadataTermsConfig[country] || ["acceptance", "important", "eligibility", "general"];
    const termsString = termsArray.join(",");

    // Build final payload (similar to fetchPrice but with real data)
    let coverages = {};
    if (packageType === 'theft') {
        coverages.theft = "default";
        coverages.assistance = "default";
    } else if (packageType === 'damage') {
        coverages["damage-alone"] = "default";
        coverages.assistance = "default";
    } else {
        coverages.theft = "default";
        coverages.damage = "default";
        coverages.assistance = "default";
    }
    const serialNumber = formData.get("serialNumber");

    const payload = {
        productConfigurationId: productConfigurationId,
        partnerId: partnerId,
        country: country,
        language: language,
        contractPeriod: {
            startDate: formData.get("startDate"),
            timeZone: getTimeZone(country)
        },
        metadata: {
            terms: termsString
        },
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
            //includeAssistance: true,
            //serialNumber: formData.get("serialNumber"),
            make: formData.get("make"),
            model: formData.get("model")
        }
    };
    if (serialNumber && serialNumber.trim() !== "") {
        payload.subject.serialNumber = serialNumber.trim();
    }

    // Add company fields if applicable
    if (formData.get("isCompany") === "yes") {
        payload.policyholder.companyName = formData.get("companyName");
        payload.policyholder.vatIn = formData.get("companyVat");
    }

    // Send to API
    $.ajax({
        url: scriptUrl,
        method: "POST",
        dataType: "json",
        data: JSON.stringify({
            payload: payload,
            action: "createQuote",
            domain: "webflow.io"
        }),
        success: function (response) {
            if (response.status === "success" && response.payload) {
                // Check for success with payment link
                if (response.payload.payment) {
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
                }
                // Check for Validation Error (Status 400 or _validationErrors array)
                else if (response.payload.status === 400 || response.payload.name === "ValidationError" || (response.payload._validationErrors && response.payload._validationErrors.length > 0)) {
                    $("#loadingOverlay").hide();

                    let errorHtml = '<h4 class="error-title">Please check the following fields:</h4><ul class="error-list">';

                    // Handle _validationErrors (New format)
                    if (response.payload._validationErrors && response.payload._validationErrors.length > 0) {
                        response.payload._validationErrors.forEach(err => {
                            // Format: subject.make -> Make
                            let fieldName = err.field || "Invalid field";
                            const cleanField = fieldName.split('.').pop()
                                .replace(/([A-Z])/g, ' $1')
                                .replace(/^./, str => str.toUpperCase());

                            errorHtml += `<li>${cleanField}: ${err.code || "Required"}</li>`;
                        });
                    }
                    // Handle details (Old format fallback)
                    else if (response.payload.details && Array.isArray(response.payload.details)) {
                        response.payload.details.forEach(err => {
                            let fieldName = err.message || "Invalid field";
                            if (err.fields && err.fields.length > 0) {
                                const rawField = err.fields[0];
                                const cleanField = rawField.split('.').pop()
                                    .replace(/([A-Z])/g, ' $1')
                                    .replace(/^./, str => str.toUpperCase());
                                fieldName = `${cleanField}: ${err.message}`;
                            }
                            errorHtml += `<li>${fieldName}</li>`;
                        });
                    } else {
                        errorHtml += `<li>${response.payload.message || "Validation failed"}</li>`;
                    }
                    errorHtml += '</ul>';

                    $("#errorModal .modal-body").html(errorHtml);
                    $("#errorModal").show();
                }

                // Other API errors
                else {
                    $("#loadingOverlay").hide();
                    $("#errorModal .modal-body").html('<p class="error">An unexpected error occurred. Please try again.</p>');
                    $("#errorModal").show();
                }
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