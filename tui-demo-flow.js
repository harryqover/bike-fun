// --- Configuration ---
const API_ENDPOINT_PRICING = 'https://api.sbx.qover.io/policies/v1/product-configurations/tui-demo-multi/versions/effective/packages';
// IMPORTANT: Storing API keys client-side is insecure. Use a backend proxy in production.
const API_KEY = 'sk_B4B9BB9B72E44E264D40';
const PARTNER_ID = "6810e8b75bc1edd801534d9d";
// New endpoint for creating the quote via Google Apps Script
const CREATE_QUOTE_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwoXRnQGpQOMDyRGGS4z5RrKeB-a1KT5hTWx9J3G-cpt3MOeDqootMdPny6L6FrbQaM/exec';


let currentStep = 1;
let quoteData = {}; // Will hold trip, policyholder, beneficiaries
let apiPrices = { // Store prices fetched from API
    packages: {
        'MULTIPERILBASIC': 0,
        'MULTIPERILPLUS': 0,
        'MULTIPERILPREMIUM': 0
    },
    optionals: {
        'winterSports': 0,
        'carHireExcess': 0,
        'excessWaiver': 0
    },
    // Store raw optional data keyed by package name for lookup
    rawOptionals: {},
    // Store raw package data to access full coverage details if needed later
    rawPackages: {}
};
let selectedPackage = null; // { code: '', name: '', basePrice: 0 }
let selectedOptionals = {}; // { winterSports: { name: 'Winter Sports', price: 0, code: 'winterSports' }, ... } // Added code property


function navigateToStep(step) {
    $('.step').removeClass('active');
    $('#step' + step).addClass('active');
    currentStep = step;
    // Hide payment specific messages when navigating away from step 4
    if (step !== 4) {
        $('#paymentLoadingIndicator').hide();
        $('#paymentApiError').hide().text('');
    }
}

function clearErrors() {
    $('.error').text('');
    $('#apiError').hide().text('');
    $('#paymentApiError').hide().text(''); // Also clear payment error
}

  // --- Validation Functions ---
  function validateStep1() {
    let isValid = true;
    clearErrors();
    const tripZone = $('#tripZone').val();
    const familyType = $('#familyType').val();
    const startDate = $('#startDate').val();
    const noMedical = $('#noMedicalCondition').is(':checked');
    const today = new Date().toISOString().split('T')[0];

    if (!tripZone) { $('#tripZoneError').text('Please select a trip zone.'); isValid = false; }
    if (!familyType) { $('#familyTypeError').text('Please select who needs cover.'); isValid = false; }
    if (!startDate) { $('#startDateError').text('Please select a start date.'); isValid = false; }
    else if (startDate < today) { $('#startDateError').text('Start date cannot be in the past.'); isValid = false; }
    if (!noMedical) { $('#noMedicalConditionError').text('You must confirm no pre-existing medical conditions to proceed.'); isValid = false; }

    return isValid;
  }

function getAge(birthDateString) {
    if (!birthDateString) return 0;
    try {
        const today = new Date();
        const birthDate = new Date(birthDateString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    } catch (e) {
        return 0; // Handle invalid date format
    }
}


  function validateStep2() {
    let isValid = true;
    clearErrors();
    const familyType = $('#familyType').val(); // Needed for beneficiary validation

    // Policyholder fields
    if (!$('#phFirstName').val()) { $('#phFirstNameError').text('First name required.'); isValid = false; }
    if (!$('#phLastName').val()) { $('#phLastNameError').text('Last name required.'); isValid = false; }
    if (!$('#phEmail').val()) { $('#phEmailError').text('Email required.'); isValid = false; }
     else if (!/^\S+@\S+\.\S+$/.test($('#phEmail').val())) { $('#phEmailError').text('Invalid email format.'); isValid = false;} // Basic email format check
    if (!$('#phPhone').val()) { $('#phPhoneError').text('Phone number required.'); isValid = false; }
    // Simple check for phone format (starts with + and has digits) - refine if needed
     else if (!/^\+\d+$/.test($('#phPhone').val())) { $('#phPhoneError').text('Invalid phone format (e.g., +324...).'); isValid = false;}
    if (!$('#phBirthdate').val()) {
          $('#phBirthdateError').text('Birthdate required.'); isValid = false;
    } else {
          const age = getAge($('#phBirthdate').val());
          if (age < 18) { $('#phBirthdateError').text('Policyholder must be at least 18 years old.'); isValid = false; }
          if (age >= 76) { $('#phBirthdateError').text('Policyholder must be under 76 years old.'); isValid = false; }
    }
    if (!$('#phStreet').val()) { $('#phStreetError').text('Street required.'); isValid = false; }
    if (!$('#phNumber').val()) { $('#phNumberError').text('Number required.'); isValid = false; }
    if (!$('#phZip').val()) { $('#phZipError').text('Zip code required.'); isValid = false; }
    if (!$('#phCity').val()) { $('#phCityError').text('City required.'); isValid = false; }
    if (!$('#phCountry').val()) { $('#phCountryError').text('Country required.'); isValid = false; }

    // Beneficiary fields (only if applicable)
    if (familyType === 'FAMILY_TYPE_COUPLE' || familyType === 'FAMILY_TYPE_FAMILY') {
          if (!$('#b1FirstName').val()) { $('#b1FirstNameError').text('First name required.'); isValid = false; }
          if (!$('#b1LastName').val()) { $('#b1LastNameError').text('Last name required.'); isValid = false; }
          if (!$('#b1Birthdate').val()) { $('#b1BirthdateError').text('Birthdate required.'); isValid = false; }
          // Add age validation for partner if needed (e.g., under 76)
           else if (getAge($('#b1Birthdate').val()) >= 76) { $('#b1BirthdateError').text('Partner must be under 76 years old.'); isValid = false; }

    }
    if (familyType === 'FAMILY_TYPE_FAMILY') {
          // Assuming only one child for now, matching API example
          if (!$('#b2FirstName').val()) { $('#b2FirstNameError').text('First name required.'); isValid = false; }
          if (!$('#b2LastName').val()) { $('#b2LastNameError').text('Last name required.'); isValid = false; }
          if (!$('#b2Birthdate').val()) { $('#b2BirthdateError').text('Birthdate required.'); isValid = false; }
           // Add age validation for child if needed (e.g., under 18 or 21)
           // Example: Check if child is 18 or older, which might be invalid depending on rules
           // else if (getAge($('#b2Birthdate').val()) >= 18) { $('#b2BirthdateError').text('Child must be under 18.'); isValid = false; }

    }

    return isValid;
  }

  // --- API Call and Price Handling ---
function callPricingAPI() {
    clearErrors();
    $('#loadingIndicator').show();
    $('#btnStep2Next').prop('disabled', true);

    // 1. Construct Beneficiaries Array
    const extraBeneficiaries = [];
    const familyType = $('#familyType').val();
    if (familyType === 'FAMILY_TYPE_COUPLE' || familyType === 'FAMILY_TYPE_FAMILY') {
        extraBeneficiaries.push({
            firstName: $('#b1FirstName').val(),
            lastName: $('#b1LastName').val(),
            birthdate: $('#b1Birthdate').val()
        });
    }
    if (familyType === 'FAMILY_TYPE_FAMILY') {
        extraBeneficiaries.push({
            firstName: $('#b2FirstName').val(),
            lastName: $('#b2LastName').val(),
            birthdate: $('#b2Birthdate').val()
        });
    }

    // 2. Construct Payload
    const startDateValue = $('#startDate').val(); // YYYY-MM-DD
    const startsAtValue = `${startDateValue}T00:00:00.000Z`; // Combine date with time for ISO string

    const payload = {
        partnerId: PARTNER_ID,
        policyholder: {
            email: $('#phEmail').val(),
            entityType: "ENTITY_TYPE_PERSON",
            phone: $('#phPhone').val(),
            firstName: $('#phFirstName').val(),
            lastName: $('#phLastName').val(),
            birthdate: $('#phBirthdate').val(),
            address: {
                street: $('#phStreet').val(),
                number: $('#phNumber').val(),
                zip: $('#phZip').val(),
                city: $('#phCity').val(),
                country: $('#phCountry').val()
            }
        },
        country: $('#phCountry').val(), // Typically same as policyholder country
        subject: {
            familyType: familyType,
            tripZone: $('#tripZone').val(),
            noMedicalCondition: $('#noMedicalCondition').is(':checked'),
            // Only include if there are beneficiaries
            ...(extraBeneficiaries.length > 0 && { extraBeneficiaries: extraBeneficiaries })
        },
        contractPeriod: {
            timeZone: "Europe/Brussels", // As per JSON config
            startDate: startDateValue,
            startsAt: startsAtValue
        }
    };

    console.log("Pricing API Payload:", JSON.stringify(payload, null, 2)); // For debugging

    // 3. Make AJAX Call
    $.ajax({
        url: `${API_ENDPOINT_PRICING}?apikey=${API_KEY}`, // Use pricing endpoint
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(payload),
        success: function(response) {
            console.log("Pricing API Response:", response); // For debugging
            $('#loadingIndicator').hide();
            $('#btnStep2Next').prop('disabled', false);

            if (response && response.packages) {
                // Store the raw packages response for later use in createQuote
                apiPrices.rawPackages = response.packages;
                processApiResponse(response.packages); // Process prices for display
                // Update summary text here as inputs are now confirmed
                $('#tripInfoSummaryPrices').text(`Zone: ${$('#tripZone option:selected').text()}, Travellers: ${$('#familyType option:selected').text()}, Coverage Start: ${$('#startDate').val()}`);
                selectedPackage = null; // Reset package selection
                $('.btnSelectPackage').prop('disabled', false).text(function() { return $(this).data('package-name') ? `Select ${$(this).data('package-name')}` : 'Select'; }); // Reset button state
                $('#btnStep3Next').prop('disabled', true); // Disable next until package selected
                // Uncheck optionals before showing step 3
               $('#winterSports, #carHireExcess, #excessWaiver').prop('checked', false);
                navigateToStep(3);
            } else {
                $('#apiError').text('Invalid response received from pricing API.').show();
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error("Pricing API Error:", textStatus, errorThrown, jqXHR.responseText);
            $('#loadingIndicator').hide();
            $('#btnStep2Next').prop('disabled', false);
            let errorMsg = 'Failed to fetch prices. Please try again.';
            if (jqXHR.responseJSON && jqXHR.responseJSON.message) {
                errorMsg = jqXHR.responseJSON.message; // Use API error if available
            } else if (jqXHR.responseText) {
               // Try to parse plain text error
                try {
                    const errData = JSON.parse(jqXHR.responseText);
                    // Specific check for the schema validation error
                     if(errData.message && errData.message.includes("JSON schema validation failed")){
                         errorMsg = `API Error: ${errData.message} (Details: ${errData.errors?.[0]?.message || 'Unknown validation issue'})`;
                     } else if (errData.message) {
                         errorMsg = `API Error: ${errData.message}`;
                     } else if (jqXHR.status === 0) {
                         errorMsg = 'Network error or CORS issue. Check browser console and API endpoint.';
                     } else {
                         errorMsg = `API Error: Status ${jqXHR.status} - ${errorThrown}`;
                     }
                } catch(e) {
                    if (jqXHR.status === 0) {
                         errorMsg = 'Network error or CORS issue. Check browser console and API endpoint.';
                    } else {
                        errorMsg = `API Error: Status ${jqXHR.status} - ${errorThrown}. Response is not valid JSON.`;
                    }
                }
            } else if (textStatus === 'timeout') {
                errorMsg = 'The request to fetch prices timed out. Please try again.';
            } else if (textStatus === 'error' && jqXHR.status === 0) {
                 errorMsg = 'Network error or CORS issue preventing price fetch. Check browser console.';
            }

            $('#apiError').text(errorMsg).show();
        }
    });
}

function processApiResponse(packagesData) {
     console.log("Processing API Response Data:", packagesData); // Log the raw data received

     // Reset stored prices
     apiPrices.packages = { 'MULTIPERILBASIC': 0, 'MULTIPERILPLUS': 0, 'MULTIPERILPREMIUM': 0 };
     apiPrices.optionals = { 'winterSports': 0, 'carHireExcess': 0, 'excessWaiver': 0 };
     apiPrices.rawOptionals = {}; // Reset raw optionals too

     const packageCodes = ['MULTIPERILBASIC', 'MULTIPERILPLUS', 'MULTIPERILPREMIUM'];

     packageCodes.forEach(code => {
         let totalCip = 0;
         const packageInfo = packagesData[code];
         console.log(`--- Processing Package: ${code} ---`); // Log which package is being processed

         if (packageInfo && packageInfo.coverages) {
             // Sum CIP for all base coverages in the package
             Object.entries(packageInfo.coverages).forEach(([coverageCode, coverage]) => { // Use entries to get code and object
                  // Determine the variant key ('basic', 'plus', or 'premium')
                   const variantKey = Object.keys(coverage.variants)[0];
                   if (!variantKey) {
                       console.warn(`No variant key found for coverage ${coverageCode} in package ${code}`);
                       return; // Skip this coverage if no variant key
                   }

                   const cipValue = coverage.variants[variantKey]?.premium?.cip;
                   console.log(` -> Coverage: ${coverageCode}, Variant: ${variantKey}, CIP: ${cipValue}`); // Log each coverage CIP found

                   if (typeof cipValue === 'number' && !isNaN(cipValue)) {
                       totalCip += cipValue;
                   } else {
                        console.warn(`Invalid or missing CIP for coverage ${coverageCode} in package ${code}. Value:`, cipValue);
                   }
             });

             console.log(`Calculated Total CIP for ${code}: ${totalCip}`); // Log the final sum for the package
             apiPrices.packages[code] = totalCip;

             // Store optional coverage prices for this package
             if (packageInfo.optionalCoverages) {
                 apiPrices.rawOptionals[code] = {};
                 console.log(`Processing Optional Coverages for ${code}:`, packageInfo.optionalCoverages);
                  Object.entries(packageInfo.optionalCoverages).forEach(([optCode, optCoverage]) => {
                      // Optionals might have 'default', 'basic', 'plus', or 'premium' as the variant key
                      const variantKey = Object.keys(optCoverage.variants)[0];
                       if (!variantKey) {
                           console.warn(`No variant key found for optional coverage ${optCode} in package ${code}`);
                           return;
                       }
                       const optionalCipValue = optCoverage.variants[variantKey]?.premium?.cip;
                       console.log(` -> Optional: ${optCode}, Variant: ${variantKey}, CIP: ${optionalCipValue}`);
                       if(typeof optionalCipValue === 'number' && !isNaN(optionalCipValue)) {
                           // Store using the code from the API response (e.g., 'winterSports')
                           apiPrices.rawOptionals[code][optCode] = optionalCipValue;
                       } else {
                           console.warn(`Invalid or missing CIP for optional coverage ${optCode} in package ${code}. Value:`, optionalCipValue);
                       }
                  });
                  console.log(`Stored Optional Prices for ${code}:`, apiPrices.rawOptionals[code]);
             } else {
                  console.log(`No Optional Coverages found for ${code}`);
             }
         } else {
              console.warn(`Package data missing or invalid for code: ${code}`);
         }

         // --- Corrected ID Selection ---
         let displayId;
          if (code === 'MULTIPERILBASIC') {
               displayId = '#priceBasic';
          } else if (code === 'MULTIPERILPLUS') {
               displayId = '#pricePlus';
          } else if (code === 'MULTIPERILPREMIUM') {
               displayId = '#pricePremium';
          } else {
               console.error(`Unexpected package code: ${code}`);
               return;
          }
          // --- End Correction ---

         const priceElement = $(displayId); // Get the jQuery element using the correct ID

         if(priceElement.length) { // Check if the element exists
              const priceToShow = apiPrices.packages[code];
              if (typeof priceToShow === 'number' && !isNaN(priceToShow)) {
                   priceElement.text(priceToShow.toFixed(2));
                    console.log(`Updated HTML element ${displayId} with price: ${priceToShow.toFixed(2)}`);
              } else {
                     priceElement.text('--');
                     console.warn(`Failed to update HTML element ${displayId} - price is invalid:`, priceToShow);
              }
         } else {
              console.error(`HTML element ${displayId} not found! Check HTML structure and ID.`); // Log error if element missing
         }
     });

    // Update display for optional prices based on the 'basic' package by default
    // Or better, update when a package is selected. Let's clear them initially.
    $('#priceWinterSports').text('--');
    $('#priceCarHireExcess').text('--');
    $('#priceExcessWaiver').text('--');


    // Handle Car Hire Excess availability based on zone
    if ($('#tripZone').val() === 'ZONE_EUROPE') {
        $('#carHireExcess').prop('disabled', false);
        $('#carHireMsg').hide();
    } else {
        $('#carHireExcess').prop('disabled', true).prop('checked', false);
        $('#carHireMsg').show();
    }

     console.log("--- Finished processing API response ---");
     console.log("Stored API Prices:", apiPrices); // Log the final stored prices object
}

function updateOptionalPriceDisplay(selectedPackageCode) {
    const optionalsForPackage = apiPrices.rawOptionals[selectedPackageCode] || {};
    console.log(`Updating optional prices display based on package ${selectedPackageCode}:`, optionalsForPackage);

    // Use the codes exactly as they appear in the API response / rawOptionals keys
    // Provide default 0 if optional doesn't exist for the package
    apiPrices.optionals.winterSports = optionalsForPackage['winterSports'] ?? 0;
    apiPrices.optionals.carHireExcess = optionalsForPackage['carHireExcess'] ?? 0;
    apiPrices.optionals.excessWaiver = optionalsForPackage['excessWaiver'] ?? 0;

    $('#priceWinterSports').text(apiPrices.optionals.winterSports.toFixed(2));
    $('#priceCarHireExcess').text(apiPrices.optionals.carHireExcess.toFixed(2));
    $('#priceExcessWaiver').text(apiPrices.optionals.excessWaiver.toFixed(2));

    // Also ensure carHireExcess display matches disable state
    if ($('#tripZone').val() !== 'ZONE_EUROPE') {
        $('#priceCarHireExcess').text('--'); // Or keep price but make clear it's unavailable
    }


    console.log(`Updated optional display prices: WinterSports=${apiPrices.optionals.winterSports.toFixed(2)}, CarHire=${apiPrices.optionals.carHireExcess.toFixed(2)}, Waiver=${apiPrices.optionals.excessWaiver.toFixed(2)}`);
}


function updateTotal() {
    if (!selectedPackage) {
        $('#btnStep3Next').prop('disabled', true);
        return;
    }

    let base = selectedPackage.basePrice;
    let optionalTotal = 0;
    selectedOptionals = {}; // Reset and rebuild

    // Use the stored optional prices for calculation
    if ($('#winterSports').is(':checked')) {
        optionalTotal += apiPrices.optionals.winterSports;
        selectedOptionals.winterSports = { name: 'Winter Sports', price: apiPrices.optionals.winterSports, code: 'winterSports' }; // Add code
    }
    if ($('#carHireExcess').is(':checked') && !$('#carHireExcess').is(':disabled')) {
        optionalTotal += apiPrices.optionals.carHireExcess;
        selectedOptionals.carHireExcess = { name: 'Car Hire Excess', price: apiPrices.optionals.carHireExcess, code: 'carHireExcess' }; // Add code
    }
    if ($('#excessWaiver').is(':checked')) {
        optionalTotal += apiPrices.optionals.excessWaiver;
        selectedOptionals.excessWaiver = { name: 'Excess Waiver', price: apiPrices.optionals.excessWaiver, code: 'excessWaiver' }; // Add code
    }

    let total = base + optionalTotal; // API prices (CIP) already include tax

    // Display total somewhere if needed in step 3, or just enable the button
    // $('#someTotalDisplayInStep3').text(total.toFixed(2));
    $('#btnStep3Next').prop('disabled', false);
}

function populateSummary() {
    const zoneText = $('#tripZone option:selected').text();
    const familyText = $('#familyType option:selected').text();
    const startDateText = $('#startDate').val();

    $('#summaryTripZone').text(zoneText);
    $('#summaryFamilyType').text(familyText);
    $('#summaryPolicyholder').text(`${quoteData.policyholder.firstName} ${quoteData.policyholder.lastName} (${quoteData.policyholder.email})`); // Use stored data
    $('#summaryDates').text(`${startDateText}`);
    $('#summaryPackage').text(selectedPackage.name);
    $('#summaryBasePrice').text(selectedPackage.basePrice.toFixed(2));

    // Populate Beneficiaries in Summary
    const $beneficiaryList = $('#summaryBeneficiariesList').empty();
    const beneficiaries = quoteData.beneficiaries || [];
    if (beneficiaries.length > 0) {
        const $p = $('<p><strong>Other Travellers Covered:</strong></p>').appendTo($beneficiaryList);
        const $ul = $('<ul></ul>').appendTo($p);
        beneficiaries.forEach(b => {
            $('<li>').text(`${b.firstName} ${b.lastName} (Born: ${b.birthdate})`).appendTo($ul);
        });
    }


    const $optionalList = $('#summaryOptionalCoverages ul');
    $optionalList.empty();
    let optionalTotal = 0;

    if (Object.keys(selectedOptionals).length > 0) {
        $('#summaryOptionalCoverages').show();
        $.each(selectedOptionals, function(key, item) {
            $('<li>').text(`${item.name} (+ € ${item.price.toFixed(2)})`).appendTo($optionalList);
            optionalTotal += item.price;
        });
    } else {
        $('#summaryOptionalCoverages').hide();
    }

    let total = selectedPackage.basePrice + optionalTotal;
    $('#totalPriceSummary').text(total.toFixed(2));
}

  // --- Helper Functions for Prefill ---
  function getUrlParameter(name) {
     name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
     var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
     var results = regex.exec(location.search);
     return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
 };

function getTomorrowDate() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(tomorrow.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function prefillTestData() {
    console.log("Prefilling test data...");
    $('#tripZone').val('ZONE_EUROPE');
    $('#familyType').val('FAMILY_TYPE_INDIVIDUAL');
    $('#startDate').val(getTomorrowDate());
    $('#noMedicalCondition').prop('checked', true);

    $('#phFirstName').val('John');
    $('#phLastName').val('Doe');
    $('#phBirthdate').val('1988-03-31'); // YYYY-MM-DD format
    $('#phEmail').val('harry+test@qover.com');
    $('#phPhone').val('+32486910819');
    $('#phStreet').val('Rue du Commerce');
    $('#phNumber').val('31');
    $('#phZip').val('1000');
    $('#phCity').val('Brussels');
    $('#phCountry').val('BE');

    // Trigger change for family type to ensure beneficiary fields are hidden
    $('#familyType').trigger('change');
    console.log("Test data prefilled.");
}

// --- Event Handlers ---

  // Dynamic Beneficiary Fields
  $('#familyType').change(function() {
      const type = $(this).val();
      if (type === 'FAMILY_TYPE_COUPLE') {
          $('#beneficiarySection').show();
          $('#beneficiary1').show().find('legend').text('Partner Details');
          $('#beneficiary2').hide();
           // Clear potential child fields if switching from family
          $('#b2FirstName, #b2LastName, #b2Birthdate').val('');
      } else if (type === 'FAMILY_TYPE_FAMILY') {
           $('#beneficiarySection').show();
           $('#beneficiary1').show().find('legend').text('Partner Details');
           $('#beneficiary2').show();
      } else {
           $('#beneficiarySection').hide();
           $('#beneficiary1').hide();
           $('#beneficiary2').hide();
            // Clear all beneficiary fields if switching to individual
           $('#b1FirstName, #b1LastName, #b1Birthdate, #b2FirstName, #b2LastName, #b2Birthdate').val('');
      }
      clearErrors(); // Clear errors when type changes
  });

$('#btnStep1Next').click(function() {
    if (validateStep1()) {
        // Store trip data
          quoteData.trip = {
              tripZone: $('#tripZone').val(),
              familyType: $('#familyType').val(),
              startDate: $('#startDate').val(),
              noMedicalCondition: $('#noMedicalCondition').is(':checked')
          };
        // Trigger change to show/hide beneficiary fields correctly before showing step 2
        $('#familyType').trigger('change');
        navigateToStep(2);
    }
});

  $('#btnStep2Back').click(function() {
      navigateToStep(1);
  });

   $('#btnStep2Next').click(function() {
    if (validateStep2()) {
        // Store policyholder & beneficiary data just before API call
        quoteData.policyholder = {
            firstName: $('#phFirstName').val(), lastName: $('#phLastName').val(),
            email: $('#phEmail').val(), phone: $('#phPhone').val(),
            birthdate: $('#phBirthdate').val(),
             // Add entityType here if not added in API call
            entityType: "ENTITY_TYPE_PERSON",
            address: {
                street: $('#phStreet').val(), number: $('#phNumber').val(),
                zip: $('#phZip').val(), city: $('#phCity').val(), country: $('#phCountry').val()
            }
        };
        const beneficiaries = [];
        const familyType = $('#familyType').val();
         if (familyType === 'FAMILY_TYPE_COUPLE' || familyType === 'FAMILY_TYPE_FAMILY') {
             beneficiaries.push({
                 firstName: $('#b1FirstName').val(), lastName: $('#b1LastName').val(), birthdate: $('#b1Birthdate').val()
             });
         }
         if (familyType === 'FAMILY_TYPE_FAMILY') {
             beneficiaries.push({
                  firstName: $('#b2FirstName').val(), lastName: $('#b2LastName').val(), birthdate: $('#b2Birthdate').val()
             });
         }
        quoteData.beneficiaries = beneficiaries;

        callPricingAPI(); // Calls the pricing API first
    }
  });


$('#btnStep3Back').click(function() {
    navigateToStep(2);
});

$('.btnSelectPackage').click(function() {
    const packageCode = $(this).data('package');
    const packageName = $(this).data('package-name');
    const price = apiPrices.packages[packageCode] ?? 0;

    $('.btnSelectPackage').prop('disabled', false).text(function() { return `Select ${$(this).data('package-name')}`; });
    $(this).prop('disabled', true).text('Selected');

    selectedPackage = { code: packageCode, name: packageName, basePrice: price };

    // Update optional prices display based on the selected package variant
    updateOptionalPriceDisplay(packageCode);

    // Re-evaluate total whenever package changes (as optional prices depend on it)
    updateTotal();
});

$('#winterSports, #carHireExcess, #excessWaiver').change(function() {
   updateTotal();
});

$('#btnStep3Next').click(function() {
      if (selectedPackage) {
          populateSummary();
          navigateToStep(4);
      }
});

$('#btnStep4Back').click(function() {
    navigateToStep(3);
});

// --- NEW: Function to build coverage object for createQuote ---
function buildCoveragesForQuote(packageCode, selectedOptionalCodes) {
    const coverages = {};
    let variantName = 'basic'; // default
    if (packageCode === 'MULTIPERILPLUS') variantName = 'plus';
    if (packageCode === 'MULTIPERILPREMIUM') variantName = 'premium';

    // 1. Define Base Coverages per Package Level (Based on examples)
    const baseCoverageMap = {
         'MULTIPERILBASIC': ['cancellation', 'assistance', 'medicalExpenses', 'hospitalBenefit', 'personalAccident', 'baggages', 'moneyAndDocuments', 'personalLiability', 'missedDeparture', 'delayedDeparture'],
         'MULTIPERILPLUS': ['cancellation', 'assistance', 'medicalExpenses', 'hospitalBenefit', 'personalAccident', 'baggages', 'moneyAndDocuments', 'personalLiability', 'hijack', 'missedDeparture', 'catastrophe', 'delayedDeparture', 'holidayAbandonment', 'creditCardFraud', 'legalExpenses', 'strike'], // Assumed based on premium list
         'MULTIPERILPREMIUM': ['cancellation', 'assistance', 'medicalExpenses', 'hospitalBenefit', 'personalAccident', 'baggages', 'moneyAndDocuments', 'personalLiability', 'hijack', 'missedDeparture', 'catastrophe', 'delayedDeparture', 'holidayAbandonment', 'creditCardFraud', 'legalExpenses', 'strike']
    };

    // Add base coverages with the correct variant
    if (baseCoverageMap[packageCode]) {
         baseCoverageMap[packageCode].forEach(covCode => {
             coverages[covCode] = variantName;
         });
    } else {
        console.error("Unknown package code for base coverage mapping:", packageCode);
    }

    // 2. Add Selected Optional Coverages
    selectedOptionalCodes.forEach(optCode => {
         if (optCode === 'excessWaiver') {
             coverages[optCode] = 'default'; // As per MULTIPERILBASIC example
         } else if (optCode === 'winterSports') {
             // Determine variant: 'basic', 'plus', 'premium' based on package? Or always 'default'?
             // The PREMIUM example included 'winterSports: "premium"'. Let's assume it matches the package level.
             coverages[optCode] = variantName;
         } else if (optCode === 'carHireExcess') {
             // The PREMIUM example included 'carHireExcess: "premium"'. Let's assume it matches the package level.
              // Only add if applicable (Europe zone)
             if ($('#tripZone').val() === 'ZONE_EUROPE'){
                 coverages[optCode] = variantName;
             }
         }
         // Add other optionals here if needed
    });

    console.log("Built Coverages for Quote:", coverages);
    return coverages;
}


// --- MODIFIED: Proceed to Payment Button Handler ---
$('#btnProceedToPayment').click(function() {
    console.log("Proceed to Payment clicked.");
    clearErrors(); // Clear previous errors
    $('#paymentLoadingIndicator').show(); // Show specific loading message
    $('#btnProceedToPayment').prop('disabled', true); // Disable button
    $('#btnStep4Back').prop('disabled', true); // Disable back button too

    // 1. Gather all data needed for the createQuote payload
    if (!selectedPackage || !quoteData.trip || !quoteData.policyholder) {
        console.error("Missing required data for quote creation.");
        $('#paymentApiError').text("Error: Missing required quote data. Please go back and complete all steps.").show();
        $('#paymentLoadingIndicator').hide();
        $('#btnProceedToPayment').prop('disabled', false);
        $('#btnStep4Back').prop('disabled', false);
        return;
    }

    const selectedOptionalCodes = Object.values(selectedOptionals).map(opt => opt.code);
    const coverages = buildCoveragesForQuote(selectedPackage.code, selectedOptionalCodes);


    // 2. Construct the payload for the Google Apps Script endpoint
    const createQuotePayload = {
        productConfigurationId: "tui-demo-multi",
        partnerId: PARTNER_ID,
        package: {
            name: selectedPackage.code, // e.g., MULTIPERILBASIC
            coverages: coverages         // The object built above
        },
        policyholder: { // Ensure structure matches API requirements
            email: quoteData.policyholder.email,
            entityType: "ENTITY_TYPE_PERSON",
            phone: quoteData.policyholder.phone,
            firstName: quoteData.policyholder.firstName,
            lastName: quoteData.policyholder.lastName,
            birthdate: quoteData.policyholder.birthdate, // YYYY-MM-DD
            address: {
                street: quoteData.policyholder.address.street,
                number: quoteData.policyholder.address.number,
                zip: quoteData.policyholder.address.zip,
                city: quoteData.policyholder.address.city,
                country: quoteData.policyholder.address.country // e.g., BE
            }
        },
        country: quoteData.policyholder.address.country, // Country for the policy context
        language: "en", // Or make dynamic if needed
        subject: {
            familyType: quoteData.trip.familyType,
            tripZone: quoteData.trip.tripZone,
            noMedicalCondition: quoteData.trip.noMedicalCondition,
            // Only include extraBeneficiaries if they exist
            ...(quoteData.beneficiaries && quoteData.beneficiaries.length > 0 && {
                extraBeneficiaries: quoteData.beneficiaries.map(b => ({
                    firstName: b.firstName,
                    lastName: b.lastName,
                    birthdate: b.birthdate // YYYY-MM-DD
                }))
            })
        },
        contractPeriod: {
            timeZone: "Europe/Brussels", // As per example
            startDate: quoteData.trip.startDate // YYYY-MM-DD
        }
        // Add payment details or other fields if required by the Google Script wrapper
    };

    const requestData = {
        action: "createQuote",
        env: "sbx", // Environment specifier
        payload: createQuotePayload
    };

    console.log("Create Quote API Request Data:", JSON.stringify(requestData, null, 2));

    // 3. Make the AJAX call to the Google Apps Script endpoint
    $.ajax({
        url: CREATE_QUOTE_ENDPOINT,
        type: 'POST',
        contentType: 'text/plain;charset=utf-8',
        data: JSON.stringify(requestData),
        success: function(response) {
            console.log("Create Quote API Response:", response);
            $('#paymentLoadingIndicator').hide();

            if (response && response.status === 'success' && response.payUrl) {
                console.log("Quote created successfully. Redirecting to payment URL:", response.payUrl);
                // Redirect to the payment page
                window.location.href = response.payUrl;
                // No need to re-enable buttons here as we are redirecting
            } else {
                console.error("Failed to create quote or missing payment URL in response.");
                let errorMsg = "Failed to finalize quote or retrieve payment link.";
                if (response && response.message) { // Check if the script provided an error message
                     errorMsg += ` (Details: ${response.message})`;
                } else if (response && response.error) {
                    errorMsg += ` (Error: ${JSON.stringify(response.error)})`;
                } else if (!response?.payUrl) {
                     errorMsg += " Payment URL was missing.";
                }
                $('#paymentApiError').text(errorMsg).show();
                // Re-enable buttons on failure
                $('#btnProceedToPayment').prop('disabled', false);
                $('#btnStep4Back').prop('disabled', false);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error("Create Quote API Error:", textStatus, errorThrown, jqXHR.responseText);
            $('#paymentLoadingIndicator').hide();
            let errorMsg = 'Error communicating with the quote finalization service.';
             if (jqXHR.responseJSON && jqXHR.responseJSON.message) {
                 errorMsg = `API Error: ${jqXHR.responseJSON.message}`;
             } else if (jqXHR.responseText) {
                 try {
                     const errData = JSON.parse(jqXHR.responseText);
                     if (errData.message) {
                         errorMsg = `API Error: ${errData.message}`;
                     } else if (errData.error) {
                         errorMsg = `API Error: ${JSON.stringify(errData.error)}`;
                     }
                 } catch(e) {
                     // Response text is not JSON
                     errorMsg = `API Error: Status ${jqXHR.status} - ${errorThrown}. Check console for raw response.`;
                     console.log("Raw Error Response:", jqXHR.responseText);
                 }
             } else if (textStatus === 'timeout') {
                 errorMsg = 'The request to finalize the quote timed out. Please try again.';
             } else if (textStatus === 'error' && jqXHR.status === 0) {
                 errorMsg = 'Network error or CORS issue contacting the quote service. Check browser console.';
             }
            $('#paymentApiError').text(errorMsg).show();
            // Re-enable buttons on failure
            $('#btnProceedToPayment').prop('disabled', false);
            $('#btnStep4Back').prop('disabled', false);
        }
    });
});


// --- Initial Setup ---
// Set min/max date for date pickers
const today = new Date().toISOString().split('T')[0];
$('#phBirthdate, #b1Birthdate, #b2Birthdate').attr('max', today); // Cannot be born in future
$('#startDate').attr('min', today); // Coverage cannot start in past

// Check for test parameter on page load
if (getUrlParameter('test') === 'true') {
    prefillTestData();
}

navigateToStep(1); // Ensure only step 1 is visible initially