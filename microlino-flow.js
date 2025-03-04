// Mapping API error field names to form input names
var fieldMapping = {
  "subject.underwriting.atFaultClaimsLast3Years": "claims",
  "subject.vin": "vin",
  "subject.vrn": "vrn",
  "subject.underwriting.birthdateYoungestDriver": "driverBirthdate"
  // Add more mappings as needed.
};

// Helper function: Remove keys with empty string values from an object recursively.
function removeEmpty(obj) {
  Object.keys(obj).forEach(key => {
    if (obj[key] === "") {
      delete obj[key];
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      removeEmpty(obj[key]);
    }
  });
  return obj;
}

// On Policyholder Details, show/hide company fields based on "Are you a company?" selection.
$("input[name='isCompany']").on("change", function() {
  if ($(this).val() === "yes") {
    $("#companyFields").slideDown();
  } else {
    $("#companyFields").slideUp();
  }
});

// Insurance Start Date: toggle start date input and button text.
$("#setStartDateNow").on("change", function() {
  if ($(this).is(":checked")) {
    $("#startDateContainer").slideDown();
    $("#submitButton").text("Create Quote");
  } else {
    $("#startDateContainer").slideUp();
    $("#submitButton").text("Save Quote For Later");
  }
});

// Collapse all sections except the first one on load.
$(document).ready(function(){
  $(".section").each(function(index) {
    if(index !== 0) {
      $(this).find(".section-content").hide();
      $(this).find(".toggle-icon").text("+");
    }
  });
  
  // If URL contains test=true, prefill form with fake data for testing
  const urlParams = new URLSearchParams(window.location.search);
  if(urlParams.get("test") === "true"){
    $("input[name='model'][value='lite']").prop("checked", true);
    $("input[name='vin']").val("TESTVIN1234567890");
    //$("input[name='vrn']").val("TESTVRN123");
    $("input[name='driverBirthdate']").val("2000-01-01");
    $("input[name='diplomaticCar'][value='no']").prop("checked", true);
    $("input[name='interchangeableLicensePlate'][value='no']").prop("checked", true);
    $("input[name='policyCancelled'][value='no']").prop("checked", true);
    $("input[name='claims'][value='0']").prop("checked", true);
    $("input[name='firstName']").val("John");
    $("input[name='lastName']").val("Doe");
    $("input[name='policyholderBirthdate']").val("1980-01-01");
    $("input[name='email']").val("harry+test@qover.com");
    $("input[name='phone']").val("+43123456789");
    $("input[name='street']").val("Main Street");
    $("input[name='houseNumber']").val("10");
    $("input[name='city']").val("Vienna");
    $("input[name='zip']").val("12345");
    $("input[name='country']").val("AT");
    // Set as company for testing and prefill company fields.
    $("input[name='isCompany'][value='yes']").prop("checked", true).trigger("change");
    $("input[name='companyName']").val("Test Company");
    $("input[name='companyNumber']").val("123456789");
    $("input[name='startDate']").val("2025-03-09");
    $("input[name='terms']").prop("checked", true);
    updatePrice();
  }
});

// Collapsible sections: When one section is opened, collapse all others.
$(".collapsible").click(function() {
  var $thisSectionContent = $(this).next(".section-content");
  // Collapse all other sections.
  $(".section-content").not($thisSectionContent).slideUp();
  $(".toggle-icon").not($(this).find(".toggle-icon")).text("+");

	console.log("$thisSectionContent");
  	console.log($thisSectionContent);
  	console.log($($thisSectionContent.prevObject[0]).data("step"));
  	var currentStep = $($thisSectionContent.prevObject[0]).data("step");
  	$("a[step='"+currentStep+"'] .stepper-label").css("color", "orange");
  	
  
  // Toggle the clicked section.
  if($thisSectionContent.is(":visible")) {
    $thisSectionContent.slideUp();
    $(this).find(".toggle-icon").text("Continue");
    console.log("step to hide");
    console.log($(this).data("step"));
  } else {
    $thisSectionContent.slideDown();
    $(this).find(".toggle-icon").text("Hide");
  }
});

// Calculate age at the chosen start date
function getAgeAtStart(birthdateStr, startDateStr) {
  if (!birthdateStr || !startDateStr) return null;
  const birthDate = new Date(birthdateStr);
  const startDate = new Date(startDateStr);
  let age = startDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = startDate.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && startDate.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Update the displayed insurance price based on driver age
function updatePrice() {
  const driverBirthdateStr = document.querySelector('input[name="driverBirthdate"]').value;
  const startDateInput = document.querySelector('input[name="startDate"]');
  const priceValueEl = document.getElementById('priceValue');
  
  // If customer opts not to set start date, use default price.
  if(!$("#setStartDateNow").is(":checked") || !startDateInput.value) {
    priceValueEl.textContent = "€590.41";
    return;
  }
  
  const startDateStr = startDateInput.value;
  const ageAtStart = getAgeAtStart(driverBirthdateStr, startDateStr);
  let price = 590.41;
  if (ageAtStart < 21) {
    price = 915.13;
  }
  priceValueEl.textContent = price.toLocaleString('de-DE', {
    style: 'currency',
    currency: 'EUR'
  });
}

// Listen for changes to update the price dynamically
document.querySelector('input[name="driverBirthdate"]').addEventListener('change', updatePrice);
document.querySelector('input[name="startDate"]').addEventListener('change', updatePrice);
updatePrice();

// "View Insurance Info" button redirect
document.getElementById('viewInfoButton').addEventListener('click', function() {
  // Replace with your landing page URL
  window.location.href = "https://landingpage.example.com";
});

// "Save Offer" button functionality (simulate sending by email)
document.getElementById('saveOfferButton').addEventListener('click', function() {
  alert("Your offer has been saved and sent to your email.");
});

// Modal close functionality
$(".close").on("click", function() {
  $("#errorModal").hide();
});

// Handle form submission using jQuery AJAX
$("#quoteForm").on("submit", function(e) {
  e.preventDefault();
  // Reset any previous error highlighting
  $("input").css("border", "1px solid #E2E2E2");
  $("#message").html("");
  
  // Show loading overlay
  $("#loadingOverlay").show();

  const formData = new FormData(this);
  const model = formData.get("model");
  const vin = formData.get("vin").trim();
  const vrn = formData.get("vrn").trim();
  const driverBirthdate = formData.get("driverBirthdate");
  const diplomaticCar = formData.get("diplomaticCar");
  const interchangeableLicensePlate = formData.get("interchangeableLicensePlate");
  const policyCancelled = formData.get("policyCancelled");
  const claims = formData.get("claims");
  const firstName = formData.get("firstName").trim();
  const lastName = formData.get("lastName").trim();
  const policyholderBirthdate = formData.get("policyholderBirthdate");
  const email = formData.get("email").trim();
  const phone = formData.get("phone").trim();
  const street = formData.get("street").trim();
  const houseNumber = formData.get("houseNumber").trim();
  const city = formData.get("city").trim();
  const zip = formData.get("zip").trim();
  const country = formData.get("country").trim() || "AT";
  const isCompany = formData.get("isCompany");
  const companyName = formData.get("companyName") ? formData.get("companyName").trim() : "";
  const companyNumber = formData.get("companyNumber") ? formData.get("companyNumber").trim() : "";
  const setStart = $("#setStartDateNow").is(":checked");
  const startDate = setStart ? formData.get("startDate") : "";
  
  // If start date is to be set, validate it.
  if(setStart) {
    if (!startDate) {
      $("#message").html('<p class="error">Please select a start date.</p>');
      $("#loadingOverlay").hide();
      return;
    }
    const ageAtStart = getAgeAtStart(driverBirthdate, startDate);
    if (ageAtStart === null) {
      $("#message").html('<p class="error">Please enter valid dates for the driver and start date.</p>');
      $("#loadingOverlay").hide();
      return;
    }
    if (model === "lite" && ageAtStart < 15) {
      $("#message").html('<p class="error">For Microlino LITE, the youngest driver must be at least 15 years old.</p>');
      $("#loadingOverlay").hide();
      return;
    }
    if (model === "edition" && ageAtStart < 17) {
      $("#message").html('<p class="error">For Microlino Edition, the youngest driver must be at least 17 years old.</p>');
      $("#loadingOverlay").hide();
      return;
    }
  }
  
  if (!vin) {
    $("#message").html('<p class="error">VIN is required.</p>');
    $("#loadingOverlay").hide();
    return;
  }
  if (diplomaticCar === "yes") {
    $("#message").html('<p class="error">Applications for diplomatic cars cannot proceed.</p>');
    $("#loadingOverlay").hide();
    return;
  }
  if (interchangeableLicensePlate === "yes") {
    $("#message").html('<p class="error">Interchangeable license plate applications are not eligible.</p>');
    $("#loadingOverlay").hide();
    return;
  }
  if (policyCancelled === "yes") {
    $("#message").html('<p class="error">Applications with a canceled or terminated policy cannot proceed.</p>');
    $("#loadingOverlay").hide();
    return;
  }
  if (claims === "3+") {
    $("#message").html('<p class="error">Having 3 or more at-fault liability claims disqualifies your application.</p>');
    $("#loadingOverlay").hide();
    return;
  }
  
  // Build the payload with only tpl and mod coverages
  const payload = {
    productConfigurationId: "microlino",
    partnerId: "67a9f3824ce2c52c73463db6",
    country: "AT",
    language: "de",
    renewal: {
      type: "RENEWAL_TYPE_OPT_IN"
    },
    package: {
      name: "comprehensive",
      coverages: {
        tpl: "default",
        mod: "default"
      }
    },
    policyholder: {
      entityType: (isCompany === "yes") ? "ENTITY_TYPE_COMPANY" : "ENTITY_TYPE_PERSON",
      firstName: firstName,
      lastName: lastName,
      birthdate: policyholderBirthdate,
      email: email,
      phone: phone,
      address: {
        street: street,
        number: houseNumber,
        zip: zip,
        city: city,
        country: country
      }
    },
    subject: {
      make: "Microlino",
      model: model,
      vin: vin,
      vrn: vrn || "",
      underwriting: {
        birthdateYoungestDriver: driverBirthdate,
        anyDriverInsuranceProposalDeclinedOrPolicyCancelled: policyCancelled === "yes",
        interchangeableLicensePlate: interchangeableLicensePlate === "yes",
        diplomaticCar: diplomaticCar === "yes",
        atFaultClaimsLast3Years: claims
      }
    }
  };

  if(setStart) {
    payload.contractPeriod = {
      startDate: startDate,
      timeZone: "Europe/Brussels"
    };
  }
  
  if (isCompany === "yes") {
    payload.policyholder.companyName = companyName;
    if (companyNumber) {
      payload.policyholder.vatIn = companyNumber;
    }
  }

  // Remove keys with empty string values from payload
  removeEmpty(payload);

  // Helper function to recursively remove empty strings from an object.
  function removeEmpty(obj) {
    Object.keys(obj).forEach(key => {
      if (obj[key] === "") {
        delete obj[key];
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        removeEmpty(obj[key]);
      }
    });
    return obj;
  }

  // AJAX settings (using jQuery)
  var settings = {
    url: "https://script.google.com/macros/s/AKfycbz1WluaUb1mLRIw2FCdtmUDB0noSE0I6jOu-WVgXKL6q-UEDL6WFWfs9UXECZPjHEoW/exec",
    method: "POST",
    timeout: 0,
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    data: JSON.stringify({
      payload: payload,
      action: "createQuote"
    })
  };
  
  $.ajax(settings).done(function(response) {
    $("#loadingOverlay").hide();
    // Check for validation errors inside response.payload
    var errors = [];
    if (response.payload && response.payload._validationErrors && response.payload._validationErrors.length > 0) {
      errors = response.payload._validationErrors;
    }
    if (errors.length > 0) {
      var errorList = "<ul>";
      errors.forEach(function(error) {
        errorList += "<li>" + error.code + " (Field: " + error.field + ")</li>";
        var fieldName = fieldMapping[error.field];
        if (fieldName) {
          $("[name='" + fieldName + "']").css("border", "2px solid red");
        }
      });
      errorList += "</ul>";
      $("#errorModal .modal-body").html(errorList);
      $("#errorModal").show();
    } else {
      // If payment object exists and contains an id, redirect to payment page.
      if (response.payload && response.payload.payment && response.payload.payment.id) {
        var redirectUrl = "https://appqoverme-ui.sbx.qover.io/subscription/pay/recurring/sepadd?locale=de-AT&id=" 
          + response.payload.id + "&paymentId=" + response.payload.payment.id + "&appId=q809unxlpt18fzf20zgb9vqu";
        window.location.href = redirectUrl;
      } else {
        $("#message").html('<p class="success">Quote created successfully!</p><pre>' + JSON.stringify(response, null, 2) + "</pre>");
      }
    }
  }).fail(function(jqXHR, textStatus, errorThrown) {
    console.error("Error:", textStatus, errorThrown);
    $("#loadingOverlay").hide();
    $("#message").html('<p class="error">An error occurred while creating the quote.</p>');
  });
});