console.log("Bike Flow v1.0 - 20251208");

// Partner ID for bike insurance
const partnerId = "5e78aea105bffd763b2b0a48";

// Product configuration ID
const productConfigurationId = "bike";

// API endpoint for bike insurance
const bikeApiEndpoint = "https://script.google.com/macros/s/AKfycbz2qPaamWm0ohds60rTzhKF9BnyE3cYpMk3bqOl4MlUPPQcADpb2VU0hqdosRELu3kp/exec";

// Get locale from URL parameter
const urlParams = new URLSearchParams(window.location.search);
let locale = urlParams.get('locale') || 'en-BE'; // Default to en-BE

// Validate locale format (xx-YY)
const localeRegex = /^[a-z]{2}-[A-Z]{2}$/;
if (!localeRegex.test(locale)) {
    console.warn(`Invalid locale format "${locale}". Using default "en-BE". Expected format: xx-YY (e.g., fr-BE).`);
    locale = 'en-BE';
}

const [language, country] = locale.split('-');
window.locale = locale;
console.log("Current locale:", locale);
console.log("Language:", language);
console.log("Country:", country);

// Determine domain for sandbox vs production
function getRootDomain(hostname) {
    const parts = hostname.split('.');
    if (parts.length > 2) {
        const tld = parts.slice(-2).join('.');
        const knownTLDs = ['co.uk', 'com.au', 'org.uk', 'gov.uk'];
        if (knownTLDs.includes(tld)) {
            return parts.slice(-3).join('.');
        }
    }
    return parts.slice(-2).join('.');
}

const domain = getRootDomain(window.location.hostname);
const isSandbox = domain.includes('webflow.io');
const isProduction = !isSandbox;

console.log("Domain:", domain);
console.log("Is Sandbox:", isSandbox);

// Field mapping for API error handling
const fieldMapping = {
    "subject.make": "make",
    "subject.model": "model",
    "subject.serialNumber": "serialNumber",
    "subject.bikeValue": "bikeValue",
    "subject.bikePurchaseDate": "bikePurchaseDate",
    "subject.newBike": "newBike",
    "subject.bikeType": "bikeType",
    "policyholder.email": "email",
    "policyholder.firstName": "firstName",
    "policyholder.lastName": "lastName",
    "policyholder.phone": "phone",
    "policyholder.address.street": "street",
    "policyholder.address.zip": "zip",
    "policyholder.address.city": "city"
};

// Helper function to remove empty values from object
function removeEmpty(obj) {
    Object.keys(obj).forEach(key => {
        if (obj[key] === "" || obj[key] === null || obj[key] === undefined) {
            delete obj[key];
        } else if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
            removeEmpty(obj[key]);
            if (Object.keys(obj[key]).length === 0) {
                delete obj[key];
            }
        }
    });
    return obj;
}

// Translation loading function
function translateAll(locale) {
    let xhrLocales = new XMLHttpRequest();
    let content = "";
    const [language] = locale.split('-'); // Extract language only
    const translationUrl = `https://api.prd.qover.io/i18n/v1/projects/webflow-bike-flow/${language}.json?refresh=001`;

    xhrLocales.open("get", translationUrl, true);
    xhrLocales.overrideMimeType("application/json; charset=UTF-8");
    xhrLocales.setRequestHeader("Cache-Control", "max-age=3600");

    xhrLocales.onreadystatechange = function () {
        if (xhrLocales.readyState == 4) {
            if (xhrLocales.status >= 200 && xhrLocales.status < 300 || xhrLocales.status == 304) {
                content = JSON.parse(xhrLocales.responseText);
                window.translations = content;
                console.log("Translations loaded:", window.translations);

                // Apply translations to elements with data-trans attribute
                $("[data-trans]").each(function () {
                    const key = $(this).data("trans");
                    if (content[key]) {
                        $(this).html(content[key]);
                    }
                });

                // Apply placeholder translations
                $("[data-trans-placeholder]").each(function () {
                    const key = $(this).data("trans-placeholder");
                    if (content[key]) {
                        $(this).attr("placeholder", content[key]);
                    }
                });
            } else {
                console.warn("Failed to load translations, status:", xhrLocales.status);
            }
        }
    };

    xhrLocales.send();
}

// Initialize form on document ready
$(document).ready(function () {

    // Set country field based on locale
    $("#countryField").val(country);

    // Focus event for required fields
    $("#bikeQuoteForm").on("focus", "[required]", function () {
        $(this).css("border", "1px solid #E2E2E2");
    });

    // Set today's date as default start date
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    $("input[name='startDate']").val(formattedToday);

    // Collapse all sections except the first one
    $(".section").each(function (index) {
        if (index !== 0) {
            $(this).find(".section-content").removeClass("active");
        }
    });

    // Toggle company fields based on entity type
    $('input[name="isCompany"]').on('change', function () {
        if (this.value === 'yes') {
            $('#companyFields').slideDown(function () {
                $(this).css('display', 'grid');
            });
            $('#birthdate').prop('required', false);
        } else {
            $('#companyFields').slideUp();
            $('#birthdate').prop('required', true);
        }
    });

    // Toggle start date field visibility
    $('#setStartDateNow').on('change', function () {
        if ($(this).is(':checked')) {
            $('#startDateContainer').slideDown();
            $('input[name="startDate"]').prop('required', true);
        } else {
            $('#startDateContainer').slideUp();
            $('input[name="startDate"]').prop('required', false);
        }
    });

    // Package selection auto-updates coverage checkboxes
    $('input[name="package"]').on('change', function () {
        const packageValue = $(this).val();

        if (packageValue === 'comprehensive') {
            $('#includeAssistance').prop('checked', true);
        } else if (packageValue === 'theft' || packageValue === 'damage') {
            $('#includeAssistance').prop('checked', false);
        }
    });

    // Load translations
    translateAll(locale);

    // Test mode: prefill form with sample data
    if (urlParams.get("test") === "true") {
        console.log("Test mode: prefilling form");
        $('input[name="package"][value="comprehensive"]').prop("checked", true).trigger('change');
        $('#includeAssistance').prop("checked", true);
        $('input[name="make"]').val("Canyon");
        $('input[name="model"]').val("Spectral");
        $('input[name="serialNumber"]').val("TEST123456789");
        $('input[name="bikeValue"]').val("1999");
        $('input[name="bikePurchaseDate"]').val("2025-11-15");
        $('input[name="newBike"][value="true"]').prop("checked", true);
        $('select[name="bikeType"]').val("TYPE_REGULAR_BIKE");
        $('input[name="isCompany"][value="no"]').prop("checked", true).trigger("change");
        $('input[name="firstName"]').val("John");
        $('input[name="lastName"]').val("Doe");
        $('input[name="birthdate"]').val("1980-01-01");
        $('input[name="email"]').val("harry+test@qover.com");
        $('input[name="phone"]').val("+32123456789");
        $('input[name="street"]').val("Main Street 123");
        $('input[name="zip"]').val("1000");
        $('input[name="city"]').val("Brussels");
        $("#setStartDateNow").prop("checked", true).trigger("change");
        $('input[name="startDate"]').val("2025-12-01");
        $("#acceptance").prop("checked", true);
        $("#important").prop("checked", true);
        $("#eligibility").prop("checked", true);
        $("#privacy").prop("checked", true);
    }
});

// Collapsible section functionality
$(".collapsible").click(function () {
    const $thisSectionContent = $(this).next(".section-content");

    // Collapse all other sections
    $(".section-content").not($thisSectionContent).removeClass("active");

    // Toggle clicked section
    $thisSectionContent.toggleClass("active");

    // Track event
    const stepName = $(this).data("step");
    console.log("User clicked on step:", stepName);

    if (typeof dataLayer !== 'undefined') {
        dataLayer.push({
            'event': 'generic',
            'eventCategory': 'step',
            'eventAction': 'click',
            'eventLabel': stepName
        });
    }
});

// Toggle icon functionality (confirm and move to next section)
$(".toggle-icon").click(function () {
    const currentSection = $(this).closest(".section");
    const nextSection = currentSection.next(".section");
    const $thisSectionContent = $(this).parent();

    // Hide current section
    if ($thisSectionContent.hasClass("active")) {
        $thisSectionContent.removeClass("active");
    }

    // Show next section if it exists
    if (nextSection.length) {
        nextSection.find(".section-content").addClass("active");
    }
});

// Modal close functionality
$(".close").on("click", function () {
    $("#errorModal").hide();
});

// Form submission
$("#bikeQuoteForm").on("submit", function (e) {
    e.preventDefault();
    console.log('Form submission started');

    // Reset error highlighting
    $("input, select").css("border", "1px solid #E2E2E2");
    $("#message").html("");

    // Expand all sections for validation
    $(".section-content").addClass("active");

    // Validate required fields
    let hasError = false;
    $("#bikeQuoteForm [required]").each(function () {
        const $field = $(this);

        // Skip hidden fields
        if (!$field.is(':visible')) {
            return;
        }

        // Check if field is empty or unchecked
        if (!$field.val() || ($field.is(":checkbox") && !$field.is(":checked"))) {
            $field.css("border", "2px solid red");
            hasError = true;
        }
    });

    if (hasError) {
        $("#message").html('<p class="error" data-trans="bf.error.required">Please fill in all required fields</p>');
        translateAll(locale);
        return;
    }

    // Show loading overlay
    $("#loadingOverlay").css("display", "flex");

    // Collect form data
    const formData = new FormData(this);

    // Extract coverage data
    const packageType = formData.get("package");
    const includeAssistance = $("#includeAssistance").is(":checked");
    const theftDeductibleType = formData.get("theftDeductibleType");
    const damageDeductibleType = formData.get("damageDeductibleType");

    // Determine package name and coverages
    let packageName = "";
    let coverages = {};

    if (packageType === "comprehensive") {
        packageName = "VARIANT_THEFT_DAMAGE_ASSISTANCE";
        coverages = {
            theft: "default",
            damage: "default",
            assistance: "default"
        };
    } else if (packageType === "theft") {
        packageName = includeAssistance ? "VARIANT_THEFT_ASSISTANCE" : "VARIANT_THEFT";
        coverages.theft = "default";
        if (includeAssistance) coverages.assistance = "default";
    } else if (packageType === "damage") {
        packageName = includeAssistance ? "VARIANT_DAMAGE_ASSISTANCE" : "VARIANT_DAMAGE";
        coverages.damage = "default";
        if (includeAssistance) coverages.assistance = "default";
    }

    // Extract bike data
    const make = formData.get("make").trim();
    const model = formData.get("model").trim();
    const serialNumber = formData.get("serialNumber") ? formData.get("serialNumber").trim() : "";
    const bikeValue = parseFloat(formData.get("bikeValue"));
    const bikePurchaseDate = formData.get("bikePurchaseDate");
    const newBike = formData.get("newBike") === "true";
    const bikeType = formData.get("bikeType");
    const antiTheftMeasure = formData.get("antiTheftMeasure");
    const applyDepreciation = formData.get("applyDepreciation") === "true";

    // Validate bike value
    if (bikeValue < 250 || bikeValue > 10000) {
        $("#loadingOverlay").hide();
        $("#message").html('<p class="error">Bike value must be between €250 and €10,000</p>');
        return;
    }

    // Extract policyholder data
    const isCompany = formData.get("isCompany") === "yes";
    const firstName = formData.get("firstName").trim();
    const lastName = formData.get("lastName").trim();
    const birthdate = formData.get("birthdate");
    const email = formData.get("email").trim();
    const phone = formData.get("phone").trim();
    const street = formData.get("street").trim();
    const zip = formData.get("zip").trim();
    const city = formData.get("city").trim();

    // Validate email
    const emailPattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!emailPattern.test(email)) {
        $("#loadingOverlay").hide();
        $("#message").html('<p class="error" data-trans="bf.error.email.invalid">Please enter a valid email address</p>');
        translateAll(locale);
        return;
    }

    // Company specific fields
    const companyName = isCompany && formData.get("companyName") ? formData.get("companyName").trim() : "";
    const companyVat = isCompany && formData.get("companyVat") ? formData.get("companyVat").trim() : "";

    // Start date
    const setStart = $("#setStartDateNow").is(":checked");
    const startDate = setStart ? formData.get("startDate") : "";

    // Build payload
    const payload = {
        productConfigurationId: productConfigurationId,
        partnerId: partnerId,
        country: country,
        language: language,
        renewal: {
            type: "RENEWAL_TYPE_OPT_IN"
        },
        package: {
            name: packageName,
            coverages: coverages
        },
        policyholder: {
            entityType: isCompany ? "ENTITY_TYPE_COMPANY" : "ENTITY_TYPE_PERSON",
            firstName: firstName,
            lastName: lastName,
            email: email,
            phone: phone,
            address: {
                street: street,
                number: "1", // Default number
                zip: zip,
                city: city,
                country: country
            }
        },
        subject: {
            make: make,
            model: model,
            bikeValue: bikeValue,
            bikePurchaseDate: bikePurchaseDate,
            newBike: newBike,
            bikeType: bikeType,
            antiTheftMeasure: antiTheftMeasure,
            applyDepreciation: applyDepreciation,
            theftDeductibleType: theftDeductibleType,
            damageDeductibleType: damageDeductibleType,
            includeAssistance: includeAssistance
        },
        metadata: {
            lastStepUrl: window.location.href,
            terms: "acceptance,important,eligibility,privacy"
        }
    };

    // Add optional fields
    if (serialNumber) {
        payload.subject.serialNumber = serialNumber;
    }

    if (birthdate && !isCompany) {
        payload.policyholder.birthdate = birthdate;
    }

    if (isCompany) {
        if (companyName) payload.policyholder.companyName = companyName;
        if (companyVat) payload.policyholder.vatIn = companyVat;
    }

    if (setStart && startDate) {
        payload.contractPeriod = {
            startDate: startDate,
            timeZone: "Europe/Brussels"
        };
    }

    // Remove empty values
    removeEmpty(payload);

    console.log("Final Payload:", JSON.stringify(payload, null, 2));

    // AJAX request to create quote
    const settings = {
        url: bikeApiEndpoint,
        method: "POST",
        timeout: 0,
        headers: {
            "Content-Type": "text/plain;charset=utf-8"
        },
        data: JSON.stringify({
            payload: payload,
            action: "createQuote",
            domain: domain
        })
    };

    $.ajax(settings).done(function (response) {
        $("#loadingOverlay").hide();
        console.log("API Response:", response);

        // Check for validation errors
        let errors = [];
        if (response.payload && response.payload._validationErrors && response.payload._validationErrors.length > 0) {
            errors = response.payload._validationErrors;
        }

        if (errors.length > 0) {
            let errorList = "<ul>";
            errors.forEach(function (error) {
                console.error("Validation error:", error);
                errorList += "<li>" + error.code + " (Field: " + error.field + ")</li>";

                // Highlight error fields
                const fieldName = fieldMapping[error.field];
                if (fieldName) {
                    $("[name='" + fieldName + "']").css("border", "2px solid red");
                }

                // Track error
                if (typeof dataLayer !== 'undefined') {
                    dataLayer.push({
                        'event': 'generic',
                        'eventCategory': 'error',
                        'eventAction': 'apiCall',
                        'eventLabel': error.code
                    });
                }
            });
            errorList += "</ul>";

            $("#errorModal .modal-body").html(errorList);
            $("#errorModal").show();
        } else {
            // Success - redirect to payment if payment object exists
            if (response.payload && response.payload.payment && response.payload.payment.id) {
                console.log("Redirecting to payment page");

                // Country-specific app IDs
                const sandboxAppIds = {
                    'BE': 'p2x4mkg2a5iekldgfao8p9jd',
                    'DE': 'bvy4vhb4lbuib5oqw65st8cf',
                    'FR': 'va92wpwvvzcpv66o73arkm5u',
                    'NL': 'te0fl6v564tgh57tle6tq69k'
                };

                const productionAppIds = {
                    'BE': 'bike_production_be',  // TODO: Replace with actual production app IDs
                    'DE': 'bike_production_de',
                    'FR': 'bike_production_fr',
                    'NL': 'bike_production_nl'
                };

                // Get app ID based on country and environment
                const appId = isSandbox ? sandboxAppIds[country] : productionAppIds[country];

                // Build redirect URL based on environment
                let redirectUrl = "";
                if (isSandbox) {
                    redirectUrl = `https://appqoverme-ui.sbx.qover.io/payout/pay?locale=${locale}&id=${response.payload.id}&appId=${appId}`;
                } else {
                    redirectUrl = `https://app.qover.com/payout/pay?locale=${locale}&id=${response.payload.id}&appId=${appId}`;
                }

                console.log("Redirect URL:", redirectUrl);

                // Track success
                if (typeof dataLayer !== 'undefined') {
                    dataLayer.push({
                        'event': 'generic',
                        'eventCategory': 'step',
                        'eventAction': 'apiCall',
                        'eventLabel': 'goToPayment'
                    });
                }

                window.location.href = redirectUrl;
            } else {
                // Quote created but no payment - show success message
                $("#message").html('<p class="success">Quote created successfully!</p><pre>' + JSON.stringify(response, null, 2) + "</pre>");
            }
        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
        console.error("AJAX Error:", textStatus, errorThrown);
        $("#loadingOverlay").hide();
        $("#message").html('<p class="error" data-trans="bf.error.generic">An error occurred. Please try again.</p>');
        translateAll(locale);
    });
});
