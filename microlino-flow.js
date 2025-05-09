console.log("20250324 1518")
// Mapping API error field names to form input names
function getRootDomain(hostname) {
  const parts = hostname.split('.');

  // Handle domains like co.uk, com.au, etc.
  if (parts.length > 2) {
    const tld = parts.slice(-2).join('.');
    const knownTLDs = ['co.uk', 'com.au', 'org.uk', 'gov.uk']; // Add more as needed
    if (knownTLDs.includes(tld)) {
      return parts.slice(-3).join('.');
    }
  }

  return parts.slice(-2).join('.');
}

const domain = getRootDomain(window.location.hostname);

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
// Function to update button text based on VIN and start date fields
function updateSubmitButtonText() {
    const vinValue = $("input[name='vin']").val().trim();
    const startDateChecked = $("#setStartDateNow").is(":checked");

    if (vinValue !== "" || startDateChecked) {
      $("#submitButton").text("Weiter zur Zahlung");
    } else {
      $("#submitButton").text("Angebot für später speichern");
    }
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
    //$("#submitButton").text("Weiter zur Zahlung");
  } else {
    $("#startDateContainer").slideUp();
    //$("#submitButton").text("Angebot für später speichern");
  }
  updateSubmitButtonText();
});
// Trigger check on VIN input change
  $("input[name='vin']").on("input", function () {
    updateSubmitButtonText();
  });


// Collapse all sections except the first one on load.
$(document).ready(function(){
  $("#quoteForm").on("focus", "[required]", function () {
    $(this).css("border", "1px solid #E2E2E2");
  });

  $(".section").each(function(index) {
    if(index !== 0) {
      $(this).find(".section-content").hide();
      //$(this).find(".toggle-icon").text("+");
    }
  });
  const today = new Date();
  const formattedToday = today.toISOString().split('T')[0]; // Extracts YYYY-MM-DD
  $("input[name='startDate']").val(formattedToday);
  
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
    //$("input[name='houseNumber']").val("10");
    $("input[name='city']").val("Vienna");
    $("input[name='zip']").val("1234");
    //$("input[name='country']").val("AT");
    // Set as company for testing and prefill company fields.
    //$("input[name='isCompany'][value='yes']").prop("checked", true).trigger("change");
    //$("input[name='companyName']").val("Test Company");
    //$("input[name='companyNumber']").val("123456789");
    $("input[name='startDate']").val("2025-04-15");
    $("input[name='terms']").prop("checked", true);
    updatePrice();
  }
  // If URL contains action=pay and id call API to redirect to payment
  if(urlParams.get("action") === "pay"){
  	$("#loadingOverlay").show();
    console.log("starting payment flow");
  	// AJAX settings (using jQuery)
  	  var settings = {
  	    url: "https://script.google.com/macros/s/AKfycbz1WluaUb1mLRIw2FCdtmUDB0noSE0I6jOu-WVgXKL6q-UEDL6WFWfs9UXECZPjHEoW/exec",
  	    method: "POST",
  	    timeout: 0,
  	    headers: {
  	      "Content-Type": "text/plain;charset=utf-8"
  	    },
  	    data: JSON.stringify({
  	      payload: {"id":urlParams.get("id")},
  	      action: "pay",
          domain: domain
  	    })
  	  };
  	  console.log("settings");
      console.log(settings);

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
            if(domain == "webflow.io"){
               var redirectUrl1 = "https://appqoverme-ui.sbx.qover.io/payout/pay";
               var redirectUrl2 = "?locale=de-AT&id=" + response.payload.id + "&appId=q809unxlpt18fzf20zgb9vqu";
            } else {
             var redirectUrl1 = "https://app.qover.com/payout/pay";
             var redirectUrl2 = "?locale=de-AT&id=" + response.payload.id + "&appId=iw702hil7q0ejwxkt23hdya8";
            } 
            //var redirectUrl2 = "?locale=de-AT&id=" + response.payload.id + "&paymentId=" + response.payload.payment.id + "&appId=q809unxlpt18fzf20zgb9vqu";
  	        /*var redirectUrl = "https://appqoverme-ui.sbx.qover.io/subscription/pay/recurring/sepadd?locale=de-AT&id=" 
  	          + response.payload.id + "&paymentId=" + response.payload.payment.id + "&appId=q809unxlpt18fzf20zgb9vqu";
              */
  	        window.location.href = redirectUrl1 + redirectUrl2;
  	      } else {
  	        $("#message").html('<p class="success">Quote created successfully!</p><pre>' + JSON.stringify(response, null, 2) + "</pre>");
  	      }
  	    }
  	  }).fail(function(jqXHR, textStatus, errorThrown) {
  	    console.error("Error:", textStatus, errorThrown);
  	    $("#loadingOverlay").hide();
  	    $("#message").html('<p class="error">An error occurred while creating the quote.</p>');
  	  });
  }

  // If URL contains action=getQuote and id call API to prefill form
  if(urlParams.get("action") === "getQuote"){
    $("#loadingOverlay").show();
    // AJAX settings (using jQuery)
      var settings = {
        url: "https://script.google.com/macros/s/AKfycbz1WluaUb1mLRIw2FCdtmUDB0noSE0I6jOu-WVgXKL6q-UEDL6WFWfs9UXECZPjHEoW/exec",
        method: "POST",
        timeout: 0,
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        data: JSON.stringify({
          payload: {"id":urlParams.get("id")},
          action: "getQuote",
          domain: domain
        })
      };
      
      $.ajax(settings).done(function(response) {
        $("#loadingOverlay").hide();
        $("input[name='model'][value='"+response.payload.subject.model+"']").prop("checked", true);
        $("input[name='vin']").val(response.payload.subject.vin);
        $("input[name='vrn']").val(response.payload.subject.vrn);
        $("input[name='driverBirthdate']").val(response.payload.subject.underwriting.birthdateYoungestDriver);
        $("input[name='diplomaticCar'][value='no']").prop("checked", true);
        $("input[name='interchangeableLicensePlate'][value='no']").prop("checked", true);
        $("input[name='policyCancelled'][value='no']").prop("checked", true);
        $("input[name='claims'][value='0']").prop("checked", true);
        $("input[name='firstName']").val(response.payload.policyholder.firstName);
        $("input[name='lastName']").val(response.payload.policyholder.lastName);
        $("input[name='policyholderBirthdate']").val(response.payload.policyholder.birthdate);
        $("input[name='email']").val(response.payload.policyholder.email);
        $("input[name='phone']").val(response.payload.policyholder.phone);
        $("input[name='street']").val(response.payload.policyholder.address.street);
        //$("input[name='houseNumber']").val(response.payload.policyholder.address.number);
        $("input[name='city']").val(response.payload.policyholder.address.city);
        $("input[name='zip']").val(response.payload.policyholder.address.zip);
        $("input[name='country']").val("AT");
        // Set as company for testing and prefill company fields.
        if(response.payload.policyholder.entityType == "ENTITY_TYPE_COMPANY"){
          $("input[name='isCompany'][value='yes']").prop("checked", true).trigger("change");
          $("input[name='companyName']").val(response.payload.policyholder.companyName);
          $("input[name='companyNumber']").val(response.payload.policyholder.vatIn);
        }
        $("input[name='startDate']").val(response.payload.contractPeriod.startDate);
        $("input[name='terms']").prop("checked", true);
        updatePrice();
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
          console.warn("quote retrieved");
          dataLayer.push({
            'event': 'generic',
            'eventCategory': 'step',
            'eventAction': 'apiCall',
            'eventLabel': 'retrieved quote'
          });
        }
      }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error("Error:", textStatus, errorThrown);
        $("#loadingOverlay").hide();
        $("#message").html('<p class="error">Beim Erstellen des Angebots ist ein Fehler aufgetreten.</p>');
      });
  }
});


// Collapsible sections: When one section is opened, collapse all others.
$(".collapsible").click(function() {
  var $thisSectionContent = $(this).next(".section-content");
  // Collapse all other sections.
  $(".section-content").not($thisSectionContent).slideUp();
  $(".toggle-icon").not($(this).find(".toggle-icon")).text("Weiter");

	console.log("$thisSectionContent");
  	console.log($thisSectionContent);
  	console.log($($thisSectionContent.prevObject[0]).data("step"));
    console.warn("event - step - ", $($thisSectionContent.prevObject[0]).data("step"));
    dataLayer.push({
      'event': 'generic',
      'eventCategory': 'step',
      'eventAction': 'click',
      'eventLabel': $($thisSectionContent.prevObject[0]).data("step")
    });
  	//var currentStep = $($thisSectionContent.prevObject[0]).data("step");
  	//$("a[step='"+currentStep+"'] .stepper-label").css("color", "orange");
  	
  
  // Toggle the clicked section.
  if($thisSectionContent.is(":visible")) {
    $thisSectionContent.slideUp();
    $(this).find(".toggle-icon").text("Weiter");
    //var stepToHide = $(this).data("step");
    //$("a[step='"+stepToHide+"'] .stepper-label").css("color", "#36493d");
  } else {
    $thisSectionContent.slideDown();
    $(this).find(".toggle-icon").text("Ausblenden");
  }
});
/*
$(".toggle-icon").click(function() {
  var $thisSectionContent = $(this).parent();
  $(".section-content").not($thisSectionContent).slideUp();
  $(".toggle-icon").not($(this).find(".toggle-icon")).text("xxx");
  console.log("isVisible?")
  console.log($thisSectionContent.is(":visible"));
  if($thisSectionContent.is(":visible")) {
    $thisSectionContent.slideUp();
    //$(this).find(".toggle-icon").text("Continue");
  } else {
    $thisSectionContent.slideDown();
    //$(this).find(".toggle-icon").text("Hide");
  }
  console.log("next section ici");
  console.log($(this).next(".section-content"));
  $(this).next(".section-content").css("border-radius","1px solid red");
  $(this).next(".section-content").slideDown();

});*/
$(".toggle-icon").click(function() {
    var currentSection = $(this).closest(".section"); // Find the closest section
    var nextSection = currentSection.next(".section"); // Find the next section
    var $thisSectionContent = $(this).parent();
    if($thisSectionContent.is(":visible")) {
      $thisSectionContent.slideUp();
    }
    if (nextSection.length) {
        nextSection.find(".section-content").slideDown(); // Slide down the next section's content
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
  const taxValueEl = document.getElementById('taxValue');
  
  // If customer opts not to set start date, use default price.
  if(!$("#setStartDateNow").is(":checked") || !startDateInput.value) {
    priceValueEl.textContent = "€590.00";
    taxValueEl.textContent = "€59.37";
    return;
  }
  
  const startDateStr = startDateInput.value;
  const ageAtStart = getAgeAtStart(driverBirthdateStr, startDateStr);
  let price = 590;
  let taxPrice =  59.37;
  if (ageAtStart < 21) {
    price = 915;
    taxPrice =  92.07;
    $(".info-message").show(250);
  } else {
    $(".info-message").hide(250);
  }
  priceValueEl.textContent = price.toLocaleString('de-DE', {
    style: 'currency',
    currency: 'EUR'
  });
  taxValueEl.textContent = taxPrice.toLocaleString('de-DE', {
    style: 'currency',
    currency: 'EUR'
  });
}

// Listen for changes to update the price dynamically
document.querySelector('input[name="driverBirthdate"]').addEventListener('change', updatePrice);
document.querySelector('input[name="startDate"]').addEventListener('change', updatePrice);
updatePrice();


// Modal close functionality
$(".close").on("click", function() {
  $("#errorModal").hide();
});

// Handle form submission using jQuery AJAX
$("#quoteForm").on("submit", function(e) {
  e.preventDefault();
  $(".section-content").slideDown();
  console.log('start on submit');
  // Reset any previous error highlighting
  $("input").css("border", "1px solid #E2E2E2");
  $("#message").html("");

  //START HANDLE INPUT NOT FILLED IN
    // Manually validate all required visible inputs
    let hasError = false;
    console.log('checking missing required start');
    $("#quoteForm [required]").each(function () {
      const $field = $(this);
      console.log('checking missing required start', $field);

      // Check if the field is empty
      if (!$field.val() || ($field.is(":checkbox") && !$field.is(":checked"))) {
        $field.css("border", "2px solid red");
        hasError = true;
      }
    });
    console.log('checking missing required end', hasError);
    if (hasError) {
      $("#message").html('<p class="error">Bitte füllen Sie alle erforderlichen Felder aus.</p>');
      $("#loadingOverlay").hide();
      return;
    }
  //STOP HANDLE INPUT NOT FILLED IN
  
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
  const houseNumber = " ";
  const city = formData.get("city").trim();
  const zip = formData.get("zip").trim();
  const country = "AT";
  const isCompany = formData.get("isCompany");
  const companyName = formData.get("companyName") ? formData.get("companyName").trim() : "";
  const companyNumber = formData.get("companyNumber") ? formData.get("companyNumber").trim() : "";
  const setStart = $("#setStartDateNow").is(":checked");
  const startDate = setStart ? formData.get("startDate") : "";
  
  // If start date is to be set, validate it.
  if(setStart) {
    if (!startDate) {
      $("#message").html('<p class="error">Bitte wählen Sie ein Startdatum.</p>');
      $("#loadingOverlay").hide();
      return;
    }
    const agePolicyHolderAtStart = getAgeAtStart(policyholderBirthdate, startDate);
    if(agePolicyHolderAtStart < 18){
      $("#message").html('<p class="error">Der Versicherungsnehmer muss mindestens 18 Jahre alt sein.</p>');
      $("#loadingOverlay").hide();
      return;
    }

    const ageAtStart = getAgeAtStart(driverBirthdate, startDate);
    if (ageAtStart === null) {
      $("#message").html('<p class="error">Bitte geben Sie gültige Daten für den Fahrer und das Startdatum ein.</p>');
      $("#loadingOverlay").hide();
      return;
    }
    if(ageAtStart > 116){
      $("#message").html('<p class="error">Der jüngste Fahrer darf höchstens 116 Jahre alt sein.</p>');
      $("#loadingOverlay").hide();
      return;
    }
    if (model === "lite" && ageAtStart < 15) {
      $("#message").html('<p class="error">Für den Microlino LITE muss der jüngste Fahrer mindestens 15 Jahre alt sein.</p>');
      $("#loadingOverlay").hide();
      return;
    }
    if (model === "edition" && ageAtStart < 17) {
      $("#message").html('<p class="error">Für den Microlino EDITION muss der jüngste Fahrer mindestens 17 Jahre alt sein.</p>');
      $("#loadingOverlay").hide();
      return;
    }
  }
  if (!/^\d{4}$/.test(zip)) {
    $("#message").html('<p class="error">Bitte geben Sie eine gültige österreichische Postleitzahl (4 Ziffern) ein.</p>');
    $("#loadingOverlay").hide();
    return;
  }
  
  if (!vin) {
    $("#message").html('<p class="warning">Wir haben Ihnen das Angebot per E-Mail zugesendet. Für den Abschluss des Versicherungsvertrags benötigen wir jedoch noch Ihre Fahrzeug-Identifikationsnummer (FIN). Bitte reichen Sie diese nach, damit wir den Prozess fortsetzen können.</p>');
    //$("#loadingOverlay").hide();
    //return;
  }
  if (diplomaticCar === "yes") {
    $("#message").html('<p class="error">Anträge für Diplomatenfahrzeuge können nicht bearbeitet werden.</p>');
    $("#loadingOverlay").hide();
    return;
  }
  if (interchangeableLicensePlate === "yes") {
    $("#message").html('<p class="error">Anträge für Wechselkennzeichen sind nicht zulässig.</p>');
    $("#loadingOverlay").hide();
    return;
  }
  if (policyCancelled === "yes") {
    $("#message").html('<p class="error">Anträge mit einer gekündigten oder beendeten Versicherungspolice können nicht bearbeitet werden.</p>');
    $("#loadingOverlay").hide();
    return;
  }
  if (claims === "3+") {
    $("#message").html('<p class="error">Bei 3 oder mehr Haftpflichtschäden in eigener Schuld ist Ihr Antrag nicht zulässig.</p>');
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
      type: "RENEWAL_TYPE_OPT_OUT"
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
    },
    metadata:{
    	terms: "acceptance,important,eligibility,general,interchangeablePlate",
      lastStepUrl: "http://microlino-insurance.qover.com/subscription?"
    }
  };
  if(domain == "webflow.io"){
    payload.metadata.lastStepUrl = "http://microlino-aa147b.webflow.io/subscription?"
  }
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
      action: "createQuote",
      domain: domain
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

      var errorList = "";
      errors.forEach(function(error) {
        console.warn("event - error - ", error.code);
        dataLayer.push({
          'event': 'generic',
          'eventCategory': 'error',
          'eventAction': 'apiCall',
          'eventLabel': error.code
        });
        
        if(error.code == "CONTRACT_PERIOD_REQUIRED"){
        	errorList += "<p>Sie erhalten eine E-Mail mit einem Link zu Ihrem Angebot.</p>";
        } else if(error.code == "SUBJECT_VIN_REQUIRED"){
          errorList += "<p>Die Fahrzeug-Identifikationsnummer (FIN) ist nicht erforderlich, um ein Angebot zu erhalten. Sie wird jedoch für den Abschluss des Versicherungsvertrags benötigt.</p>";
        } else {
        	errorList += "<p>" + error.code + " (Field: " + error.field + ")</p>";	
        }
        var fieldName = fieldMapping[error.field];
        if (fieldName) {
          $("[name='" + fieldName + "']").css("border", "2px solid red");
        }
      });
      errorList += "";
      $("#errorModal .modal-body").html(errorList);
      $("#errorModal").show();
    } else {
      // If payment object exists and contains an id, redirect to payment page.
      console.warn("event - step - goToPayment");
      dataLayer.push({
        'event': 'generic',
        'eventCategory': 'step',
        'eventAction': 'apiCall',
        'eventLabel': 'goToPayment'
      });
      if (response.payload && response.payload.payment && response.payload.payment.id) {
        if(domain == "webflow.io"){
           var redirectUrl1 = "https://appqoverme-ui.sbx.qover.io/payout/pay";
           var redirectUrl2 = "?locale=de-AT&id=" + response.payload.id + "&appId=q809unxlpt18fzf20zgb9vqu";
        } else {
         var redirectUrl1 = "https://app.qover.com/payout/pay";
         var redirectUrl2 = "?locale=de-AT&id=" + response.payload.id + "&appId=iw702hil7q0ejwxkt23hdya8";
        } 
        //var redirectUrl2 = "?locale=de-AT&id=" + response.payload.id + "&paymentId=" + response.payload.payment.id + "&appId=q809unxlpt18fzf20zgb9vqu";
        /*var redirectUrl = "https://appqoverme-ui.sbx.qover.io/subscription/pay/recurring/sepadd?locale=de-AT&id=" 
          + response.payload.id + "&paymentId=" + response.payload.payment.id + "&appId=q809unxlpt18fzf20zgb9vqu";
          */
        window.location.href = redirectUrl1 + redirectUrl2;
      } else {
        $("#message").html('<p class="success">Angebot erfolgreich erstellt!</p><pre>' + JSON.stringify(response, null, 2) + "</pre>");
      }
    }
  }).fail(function(jqXHR, textStatus, errorThrown) {
    console.error("Error:", textStatus, errorThrown);
    $("#loadingOverlay").hide();
    $("#message").html('<p class="error">Beim Erstellen des Angebots ist ein Fehler aufgetreten.</p>');
  });
});