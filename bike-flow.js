console.log("Bike Flow v5.0 - GAFAM Style - 20251209");
console.log("UPDATE 20260119 b phone prefix");

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
let globalTranslations = {};

// Metadata Configuration
const metadataTermsConfig = {
    "BE": ["remarketing","acceptance","general"],
    "FR": ["remarketing","general", "termsOfService"],
    "DE": ["remarketing","general", "termsOfService"],
    "NL": ["remarketing","acceptance","privacyStatement","general"]
};

// Initialize
$(document).ready(function () {
    initLocale();
    initListeners();
    renderLegalMentions();
    translateAll(locale);

    // Set initial country field
    $("#countryField").val(country);

    if (country === "FR") {
        $("#birthPlaceContainer").show(); // Show if FR
        $('input[name="birthPlace"]').prop('required', true); // Make required if visible
    } else {
        $("#birthPlaceContainer").hide(); // Ensure hidden otherwise
        $('input[name="birthPlace"]').prop('required', false); // Remove requirement
        $('input[name="birthPlace"]').val(""); // Clear value just in case
    }

    // --- DATE RESTRICTION START ---
    // 1. Calculate "Tomorrow" in YYYY-MM-DD format
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Format to YYYY-MM-DD (ISO standard for date inputs)
    const minDateStr = tomorrow.toISOString().split('T')[0];
    
    // 2. Apply restriction to the input
    const $startDateInput = $('input[name="startDate"]');
    
    // Set the minimum allowed date
    $startDateInput.attr('min', minDateStr);
    
    // 3. Set default value to tomorrow (Good UX)
    // Only set if currently empty to avoid overwriting user changes if they go back
    if (!$startDateInput.val()) {
        $startDateInput.val(minDateStr);
    }

    // 4. Force check on change (prevents manual typing of bad dates)
    $startDateInput.on('change', function() {
        if (this.value < minDateStr) {
            alert("The start date cannot be today or in the past.");
            this.value = minDateStr; // Reset to tomorrow
        }
    });
    // --- DATE RESTRICTION END ---

    // 4. RENDER LEGAL CHECKBOXES (New)
    renderLegalCheckboxes();

    // Pre-fill from URL
    initUrlParams();
});

function initUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has('id')) {
        const idFromUrl = urlParams.get('id');
        console.log(`Found ID in URL: ${idFromUrl}. Fetching quote...`);
        fetchQuoteAndPrefill(idFromUrl);
        return; // Stop standard param loading if ID is present to avoid conflicts
    }

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

    $('#newBikeInput').on('change', function() {
        updateBikeConditionMessage();
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
        checkFormCompletion();
    });

    // Close modal
    $(".close").click(function () {
        $("#errorModal").hide();
    });

    // Validations triggers for Button State
    $('#bikeQuoteForm input, #bikeQuoteForm select, #bikeQuoteForm textarea').on('input change blur', function() {
        checkFormCompletion();
    });

    // Real-time Zip Validation
    $("#zipInput").on("blur", function() {
        const val = $(this).val();
        // Only validate if not empty (empty is handled by the "required" check)
        if (val) {
            const zipCheck = validateZipCode(val, country);
            if (!zipCheck.isValid) {
                $("#topBarMessage").html(`<p class="error">${zipCheck.error}</p>`);
                $(this).addClass("input-error");
            } else {
                $("#topBarMessage").empty();
                $(this).removeClass("input-error");
            }
        }
        checkFormCompletion();
    });
    
    // Clear error when user starts typing again
    $("#zipInput").on("input", function() {
        $(this).removeClass("input-error");
        $("#topBarMessage").empty();
    });

    $('input[name="bikePurchaseDate"]').on('change blur', function() {
        const val = $(this).val();
        const $input = $(this);
        const $errorMsg = $input.next('.field-error-msg');

        if (val) {
            const inputDate = new Date(val);
            const today = new Date();
            // Calculate date 8 years ago
            const limitDate = new Date(today.getFullYear() - 8, today.getMonth(), today.getDate());

            if (inputDate < limitDate) {
                // Too old
                $input.addClass("input-error");
                
                // --- NEW CODE START ---
                // 1. Define your key
                const transKey = "bf.error.bikeTooOld"; 
                
                // 2. Get text from globalTranslations, or use default English
                const errorText = globalTranslations[transKey] || "Bike is too old (max 8 years).";
                
                if ($errorMsg.length === 0) {
                    // 3. Inject with the translated text AND the data-trans attribute (for future refetches)
                    $input.after(`<span class="field-error-msg" data-trans="${transKey}">${errorText}</span>`);
                }
                // --- NEW CODE END ---
                
            } else {
                // OK
                $input.removeClass("input-error");
                $errorMsg.remove();
            }
        } else {
             // Clear if empty (let required handle it)
             $input.removeClass("input-error");
             $errorMsg.remove();
        }
        updateBikeConditionMessage();
        checkFormCompletion();
    });

    // --- PHONE FORMATTING START ---
    const phoneInput = document.getElementById('phoneInput');

    // Map countries to dialing codes
    const countryDialCodes = {
        'BE': '+32',
        'FR': '+33',
        'NL': '+31',
        'DE': '+49'
    };

    // Create a list of allowed prefixes to check against
    const allowedPrefixes = Object.values(countryDialCodes);

    if (phoneInput) {
        // 1. On Focus: Pre-fill current country code if completely empty
        phoneInput.addEventListener('focus', function (e) {
            const defaultPrefix = countryDialCodes[country] || '+32';
            const val = e.target.value;
            if (!val || val.trim() === '') {
                e.target.value = defaultPrefix + ' ';
            }
        });

        // 2. On Input: Smart Format
        phoneInput.addEventListener('input', function (e) {
            const defaultPrefix = countryDialCodes[country] || '+32';
            let val = e.target.value;

            // Strip everything that isn't a digit or a +
            let cleanVal = val.replace(/[^\d+]/g, '');

            // DETECT PREFIX:
            // Check if the number currently starts with ANY allowed prefix (+32, +31, etc.)
            let activePrefix = defaultPrefix;
            let foundInternationalParams = false;

            // Sort prefixes by length desc to match +352 (Lux) before +33 if you add it later
            const sortedPrefixes = allowedPrefixes.sort((a, b) => b.length - a.length);

            for (const p of sortedPrefixes) {
                if (cleanVal.startsWith(p)) {
                    activePrefix = p;
                    foundInternationalParams = true;
                    break;
                }
            }

            // LOGIC:
            // If user explicitly types '0' (local format), swap it for the PAGE default prefix
            if (cleanVal.startsWith('0')) {
                 cleanVal = defaultPrefix + cleanVal.substring(1);
                 activePrefix = defaultPrefix;
            }
            // If user clears the input or it doesn't start with +, force the default prefix
            // UNLESS they are in the middle of typing a '+' (to allow them to type +3...)
            else if (!cleanVal.startsWith('+')) {
                 cleanVal = defaultPrefix + cleanVal;
                 activePrefix = defaultPrefix;
            }
            // If they are typing a +, we let them type until it matches a valid prefix
            // If it matches nothing known yet, we assume they are still typing the prefix.
            
            // --- VISUAL MASKING (Adding Spaces) ---
            
            // Only format if we have a valid prefix structure
            if (cleanVal.length >= activePrefix.length) {
                
                let rawNumbers = cleanVal.substring(activePrefix.length);
                let formattedNumber = activePrefix;

                if (rawNumbers.length > 0) {
                    formattedNumber += ' ';
                    
                    // Determine spacing style based on the ACTIVE prefix (not just the page country)
                    // BE (+32) and FR (+33) uses: +32 470 12 34 56 (3 digits provider, then 2s)
                    const isBeFrStyle = activePrefix === '+32' || activePrefix === '+33';

                    if (isBeFrStyle) {
                        if (rawNumbers.length > 3) {
                            formattedNumber += rawNumbers.substring(0, 3) + ' ';
                            rawNumbers = rawNumbers.substring(3);
                            // Add spaces every 2 digits
                            formattedNumber += rawNumbers.match(/.{1,2}/g).join(' ');
                        } else {
                            formattedNumber += rawNumbers;
                        }
                    } 
                    // NL (+31) and DE (+49) usually group by spaces more simply
                    else {
                         formattedNumber += rawNumbers.match(/.{1,3}/g).join(' ');
                    }
                }
                e.target.value = formattedNumber;
            } else {
                // If they are just typing "+", let it be
                e.target.value = cleanVal;
            }
            checkFormCompletion();
        });
    }
    // --- PHONE FORMATTING END ---
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

    // --- ZIP VALIDATION START ---
    const zipCheck = validateZipCode(zip, country);
    if (!zipCheck.isValid) {
        $("#topBarMessage").html(`<p class="error">${zipCheck.error}</p>`);
        // Highlight the input in red
        $("#zipInput").addClass("input-error"); 
        return;
    } else {
        // Clear error styling if valid
        $("#zipInput").removeClass("input-error");
    }
    // --- ZIP VALIDATION END ---

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
        globalTranslations['bf.loader.step1'] || "Analyzing bike profile...",
        (globalTranslations['bf.loader.step2'] || "Checking theft risk for ") + zip + "...",
        globalTranslations['bf.loader.step3'] || "Calculating best rates...",
        globalTranslations['bf.loader.step4'] || "Finalizing your quote..."
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
        // --- START DATE LOGIC START ---
        // 1. Calculate "Tomorrow" in YYYY-MM-DD format
        const dateObj = new Date();
        dateObj.setDate(dateObj.getDate() + 1);
        const tomorrowString = dateObj.toISOString().split('T')[0];

        // 2. Get current input value (using jQuery since formData is not defined in this scope)
        const inputDate = $('input[name="startDate"]').val();

        // 3. Use input if it exists, otherwise use tomorrow
        const effectiveStartDate = inputDate ? inputDate : tomorrowString;
        // --- START DATE LOGIC END ---

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
            contractPeriod: {
                startDate: effectiveStartDate, 
                timeZone: getTimeZone(country)
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

                    console.log("Calculated Quote ID:", response.payload.id);

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
    checkFormCompletion();
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

    const txtTheft = globalTranslations['bf.coverage.theft'] || "Cover against theft";
    const txtAssistance = globalTranslations['bf.coverage.assistance'] || "24/7 roadside assistance";
    const txtDamage = globalTranslations['bf.coverage.damage'] || "Cover against material damage";

    if (packageType === 'theft') {
        coverageList.append(`<li>${txtTheft}</li>`);
        coverageList.append(`<li>${txtAssistance}</li>`);
    } else if (packageType === 'damage') {
        coverageList.append(`<li>${txtDamage}</li>`);
        coverageList.append(`<li>${txtAssistance}</li>`);
    } else {
        coverageList.append(`<li>${txtTheft}</li>`);
        coverageList.append(`<li>${txtAssistance}</li>`);
        coverageList.append(`<li>${txtDamage}</li>`);
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
        renewal: { type: "RENEWAL_TYPE_OPT_OUT" },
        package: {
            name: getVariantName(packageType),
            coverages: coverages
        },
        policyholder: {
            entityType: formData.get("isCompany") === "yes" ? "ENTITY_TYPE_COMPANY" : "ENTITY_TYPE_PERSON",
            firstName: formData.get("firstName"),
            lastName: formData.get("lastName"),
            email: formData.get("email"),
            phone: formData.get("phone").replace(/\s/g, ''),
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

    // ---------------------------------------------------------
    // NEW: Add subject.birthPlace if country is FR
    // ---------------------------------------------------------
    if (country === 'FR') {
        const birthPlaceVal = formData.get("birthPlace");
        if (birthPlaceVal) {
            payload.subject.birthPlace = birthPlaceVal;
        }
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
                console.log("Final Quote ID:", response.payload.id);
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

                    const titleText = globalTranslations['bf.error.modalTitle'] || "Please check the following fields:";
                    let errorHtml = `<h4 class="error-title">${titleText}</h4><ul class="error-list">`;

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
                    const errorMsg = globalTranslations['bf.error.generic'] || "An unexpected error occurred. Please try again.";
                    $("#errorModal .modal-body").html(`<p class="error">${errorMsg}</p>`);
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
            globalTranslations = translations;

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

function validateZipCode(zip, countryCode) {
    // Trim whitespace
    const cleanZip = zip ? zip.trim() : "";

    const rules = {
        'BE': { 
            regex: /^\d{4}$/, 
            error: globalTranslations['bf.error.zip.be'] || "Belgian zip codes must be 4 digits (e.g. 1000)." 
        },
        'FR': { 
            regex: /^\d{5}$/, 
            error: globalTranslations['bf.error.zip.fr'] || "French zip codes must be 5 digits (e.g. 75008)." 
        },
        'DE': { 
            regex: /^\d{5}$/, 
            error: globalTranslations['bf.error.zip.de'] || "German zip codes must be 5 digits (e.g. 10115)." 
        },
        'NL': { 
            regex: /^[1-9]\d{3}\s?[a-zA-Z]{2}$/, 
            error: globalTranslations['bf.error.zip.nl'] || "Dutch zip codes must be 4 digits and 2 letters (e.g. 1011 AB)." 
        }
    };

    const rule = rules[countryCode];
    
    // If no rule exists for country, assume valid (or return true)
    if (!rule) return { isValid: true };

    return {
        isValid: rule.regex.test(cleanZip),
        error: rule.error
    };
}

function renderLegalCheckboxes() {
    const container = $("#legalContainer");
    
    // 1. Get terms for current country (fallback to empty array)
    // defined in your global variable: metadataTermsConfig
    const terms = metadataTermsConfig[country] || [];

    // 2. Clear existing content
    container.empty();

    // 3. Generate Checkboxes
    terms.forEach(term => {
        // Construct the translation key: bf.terms.acceptanceBE
        const transKey = `bf.terms.${term}${country}`;

        const html = `
        <label class="w-checkbox">
            <input type="checkbox" name="${term}" class="w-checkbox-input" required>
            <span class="w-form-label" data-trans="${transKey}">
                Terms: ${term} (${country})
            </span>
        </label>
        `;

        container.append(html);
    });
    
    // 4. Important: Re-run translation since we just added new elements
    translateAll(locale);
}

function fetchQuoteAndPrefill(quoteId) {
    // Show loader
    $("#loadingOverlay").css("display", "flex");
    $("#loaderMessage").text("Retrieving your quote...");

    $.ajax({
        url: scriptUrl,
        method: "POST",
        dataType: "json",
        data: JSON.stringify({
            action: "getQuote",
            payload: {
                id: quoteId
            }
        }),
        success: function(response) {
            if (response.status === "success" && response.payload) {
                const data = response.payload;

                // 1. Log the ID as requested
                console.log("Retrieved Quote ID:", data.id);

                // 2. Prefill Top Bar Inputs (Subject)
                if (data.subject) {
                    if (data.subject.bikeType) $("#bikeTypeInput").val(data.subject.bikeType);
                    if (data.subject.bikeValue) $("#bikeValueInput").val(data.subject.bikeValue);
                    if (data.subject.antiTheftMeasure) $("#antiTheftInput").val(data.subject.antiTheftMeasure);

                    if (data.subject.newBike !== undefined) {
                        $("#newBikeInput").val(data.subject.newBike.toString());
                        // Update message manually after prefill
                        updateBikeConditionMessage();
                    }
                }

                // 3. Prefill Policyholder / Address
                if (data.policyholder) {
                    // Entity Type
                    if (data.policyholder.entityType === 'ENTITY_TYPE_COMPANY') {
                        $('input[name="isCompany"][value="yes"]').prop('checked', true).trigger('change');
                        $('input[name="companyName"]').val(data.policyholder.companyName || "");
                        $('input[name="companyVat"]').val(data.policyholder.vatIn || "");
                    } else {
                        $('input[name="isCompany"][value="no"]').prop('checked', true).trigger('change');
                    }

                    $('input[name="firstName"]').val(data.policyholder.firstName || "");
                    $('input[name="lastName"]').val(data.policyholder.lastName || "");
                    $('input[name="email"]').val(data.policyholder.email || "");
                    $('input[name="phone"]').val(data.policyholder.phone || "");
                    $('input[name="birthdate"]').val(data.policyholder.birthdate || "");

                    if (data.policyholder.address) {
                        $('input[name="street"]').val(data.policyholder.address.street || "");
                        $('input[name="city"]').val(data.policyholder.address.city || "");
                        // Also set the zip in the top bar
                        if (data.policyholder.address.zip) {
                            $("#zipInput").val(data.policyholder.address.zip);
                        }
                    }
                }

                // 4. Prefill specific FR field
                if (country === "FR" && data.subject && data.subject.birthPlace) {
                    $('input[name="birthPlace"]').val(data.subject.birthPlace);
                }

                // 5. Calculate Prices based on the filled data
                // We use a timeout to ensure inputs are DOM-updated before calculation reads them
                setTimeout(async () => {
                    await calculatePrices(); // Use await since we made calculatePrices async

                    // 6. Select the package based on response
                    if (data.package && data.package.name) {
                        let shortName = 'comprehensive'; // default
                        if (data.package.name === "VARIANT_THEFT_ASSISTANCE") shortName = 'theft';
                        if (data.package.name === "VARIANT_DAMAGE_ASSISTANCE") shortName = 'damage';

                        selectPackage(shortName);
                    }
                    checkFormCompletion();
                    $("#loadingOverlay").fadeOut(300);
                }, 500);

            } else {
                console.error("Failed to get quote", response);
                $("#loadingOverlay").hide();
                alert("Could not retrieve quote.");
            }
        },
        error: function(err) {
            console.error("API Error", err);
            $("#loadingOverlay").hide();
        }
    });
}

function checkFormCompletion() {
    const form = document.getElementById("bikeQuoteForm");
    const submitBtn = $("#submitButton");
    
    // 1. Standard HTML5 Validity (Checks 'required', 'type=email', etc.)
    const isHtmlValid = form.checkValidity();

    // 2. Custom Validations
    const packageSelected = $("#selectedPackage").val() !== "";
    const hasZipError = $("#zipInput").hasClass("input-error");
    const hasBikeAgeError = $('input[name="bikePurchaseDate"]').hasClass("input-error");
    
    // 3. Terms Checkboxes (Manual check in case checkValidity misses custom ones)
    // Note: 'form.checkValidity()' usually covers 'required' checkboxes, but we double check
    let allTermsChecked = true;
    $('#legalContainer input[type="checkbox"]').each(function() {
         if(!$(this).is(':checked')) allTermsChecked = false;
    });

    // 4. Combine Logic
    if (isHtmlValid && packageSelected && !hasZipError && !hasBikeAgeError && allTermsChecked) {
        submitBtn.prop("disabled", false).removeClass("disabled-state");
    } else {
        submitBtn.prop("disabled", true).addClass("disabled-state");
    }
}

function updateBikeConditionMessage() {
    const val = $('#newBikeInput').val();
    const purchaseDateVal = $('input[name="bikePurchaseDate"]').val();
    const $msgBox = $('#invoiceWarningMessage');
    
    // Translation Keys
    const keyNew = 'bf.invoice.new';
    const keyUsed = 'bf.invoice.secondHand';
    const keyPhotos = 'bf.invoice.photoRequirement';

    // Default Text (Fallback)
    const defaultNew = "In the event of a claim, we will ask you to send us the purchase invoice and proof of payment for your bike with the date mentioned above. Please keep it in a safe place.";
    const defaultUsed = "In the event of a claim, we will ask you to send us the purchase invoice and proof of payment for your bike with the date mentioned above. Please keep it in a safe place.";
    const defaultPhotos = "In the case of bike is over 30 days old, we will ask you to send us recent photos of your bike after the purchase of the insurance.";

    // Resolve text using globalTranslations if available, otherwise default
    const textNew = globalTranslations[keyNew] || defaultNew;
    const textUsed = globalTranslations[keyUsed] || defaultUsed;
    const textPhotos = globalTranslations[keyPhotos] || defaultPhotos;

    $msgBox.empty().hide();

    if (val === "true") {
         // Create paragraphs for granular translation updating
         const $pMain = $('<p>').attr('data-trans', keyNew).text(textNew);
         $msgBox.append($pMain);

         // Check date condition for "New" bikes
         if (purchaseDateVal) {
             const oneDay = 24 * 60 * 60 * 1000; 
             const today = new Date();
             const pDate = new Date(purchaseDateVal);
             const diffDays = Math.round((today - pDate) / oneDay);

             if (diffDays > 30) {
                 const $pPhotos = $('<p>').attr('data-trans', keyPhotos)
                                          .text(textPhotos)
                                          .css('margin-top', '8px')
                                          .css('font-weight', '500');
                 $msgBox.append($pPhotos);
             }
         }
         $msgBox.slideDown();

    } else if (val === "false") {
         const $pMain = $('<p>').attr('data-trans', keyUsed).text(textUsed);
         $msgBox.append($pMain);
         $msgBox.slideDown();
    }
}

function renderLegalMentions() {
    const $container = $("#legalMentions");
    
    // Safety check if element exists in HTML
    if ($container.length === 0) return;

    $container.empty(); // Clear existing list items

    // Hardcoded defaults from your prompt (serves as fallback until JSON is updated)
    const legalDefaults = {
        "BE": [
            "L'assurance est administrée par Qover S.A., un agent d'assurance non lié autorisé et réglementé par l'Autorité des services et marchés financiers (FSMA - BELGIQUE - numéro d'enregistrement 0650.939.878). Siège social : Rue du Commerce 31, 1000 Bruxelles, Belgique.",
            "Nationale-Nederlanden Schadeverzekering Maatschappij SA, société de droit néerlandais, habilitée à assurer les risques belges, entreprise d’assurances inscrite en Belgique sous le numéro de code 2925 (BNB). Siège social : Prinses Beatrixlaan 35, 2595 AK ‘S-Gravenhage, Pays-Bas - Numéro de registre de commerce DNB 27023707, sous le contrôle de la Nederlandsche Bank. Nationale-Nederlanden Schadeverzekering Maatschappij SA est autorisée à fournir des services d'intermédiation en assurance en Belgique sur la base de la liberté de prestation de services.",
            "L'assurance vélo est un produit d'assurance non-vie (branche 3). L'assistance est un produit d'assurance non-vie (branche 18).",
            "Le présent contrat est conclu pour une durée d'un an. Il est renouvelé tacitement pour des périodes consécutives d'un an. Nous y mettrons fin après sept renouvellements tacites.",
            "Le contrat d'assurance est soumis au droit belge."
        ],
        "FR": [
            "La gestion du contrat d’assurance est réalisée par Qover S.A, un agent d'assurance non lié autorisé et réglementé par l'Autorité des services et marchés financiers (FSMA - BELGIQUE - numéro d'enregistrement 0650.939.878). Siège social : Rue du Commerce 31, 1000 Bruxelles, Belgique. Qover SA est autorisée à fournir des services d'intermédiation en assurance en France sur la base de la liberté de prestation de services.",
            "Nationale-Nederlanden Schadeverzekering Maatschappij SA, société de droit néerlandais. Siège social : Prinses Beatrixlaan 35, 2595 AK ‘S-Gravenhage, Pays-Bas - Numéro de registre de commerce DNB 27023707, sous le contrôle de la Nederlandsche Bank. Nationale-Nederlanden Schadeverzekering Maatschappij SA est autorisée à fournir des services d'intermédiation en assurance en France sur la base de la liberté de prestation de services",
            "L'assurance vélo est un produit d'assurance non-vie (branche 3). L'assistance est un produit d'assurance non-vie (branche 18).",
            "Le présent contrat est conclu pour une durée d'un an. Il est renouvelé maximum sept fois par tacite reconduction pour des périodes consécutives d'un an.",
            "Le contrat d'assurance est soumis au droit français."
        ]
        // Add NL/DE here if needed later
    };

    // Determine which list to use based on global 'country' variable
    const contentList = legalDefaults[country] || [];

    // Loop through and inject
    contentList.forEach((text, index) => {
        // Index is 0-based, your keys are 1-based (el1, el2)
        const i = index + 1; 
        const transKey = `bf.legalMentions.el${i}.${country}`;
        
        // Check if we already have a translation loaded in globalTranslations, otherwise use default
        const finalText = globalTranslations[transKey] || text;

        const $li = $('<li>', {
            class: 'list-item-92',
            'data-trans': transKey, // Hook for translateAll()
            text: finalText
        });

        $container.append($li);
    });
}