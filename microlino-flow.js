console.log("20250611 appid 2")

const appId = {
  sbx: {
    DE: "egf710aj4kzoe1ikycy8ddrl",
    AT: "q809unxlpt18fzf20zgb9vqu"
  },
  prd: {
    DE: "iw702hil7q0ejwxkt23hdya8",//wrong to adapt
    AT: "iw702hil7q0ejwxkt23hdya8"
  }
}

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
const urlParams = new URLSearchParams(window.location.search);

const localeRegex = /^[a-z]{2}-[A-Z]{2}$/;  
if (urlParams.has('locale')) {
  const urlLocale = urlParams.get('locale');

  // Validate the format of the locale from the URL
  if (localeRegex.test(urlLocale)) {
    locale = urlLocale; // Update locale if it's valid
  } else {
    console.warn(`Invalid locale format "${urlLocale}" found in URL. Keeping default locale "${locale}". Expected format: xx-YY (e.g., de-AT).`);
  }
}
const [language, country] = locale.split('-');
console.log("Current locale:", locale);
console.log("Language:", language);
console.log("Country:", country);

const pricing = {
  "AT": {
    "gt21": {"price":669, "tax": 137.46},
    "lt21": {"price":989, "tax": 169.66}
  },
  "DE": {
    "gt21": {"price":594, "tax": 94.84},
    "lt21": {"price":920, "tax": 146.89}
  }
}

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
  if(["trueDE","true"].includes(urlParams.get("test"))){
    $("input[name='model'][value='lite']").prop("checked", true);
    $("input[name='vin']").val("TESTVIN1234567890");
    //$("input[name='vrn']").val("TESTVRN123");
    $("input[name='driverBirthdate']").val("2000-01-01");
    $("input[name='diplomaticCar'][value='no']").prop("checked", true);
    $("input[name='interchangeableLicensePlate'][value='no']").prop("checked", true);
    $("input[name='policyCancelled'][value='no']").prop("checked", true);
    $("input[name='claims'][value='0']").prop("checked", true);
    $("input[name='firstName']").val("John");
    $("input[name='lastName']").val("debug");
    $("input[name='policyholderBirthdate']").val("1980-01-01");
    $("input[name='email']").val("harry+test@qover.com");
    $("input[name='phone']").val("+43123456789");
    $("input[name='street']").val("Main Street");
    //$("input[name='houseNumber']").val("10");
    if(country == "DE"){
      $("input[name='city']").val("Berlin");
      $("input[name='zip']").val("10115");  
    } else {
      $("input[name='city']").val("Vienna");
      $("input[name='zip']").val("1234");  
    }
    
    //$("input[name='country']").val("AT");
    // Set as company for testing and prefill company fields.
    //$("input[name='isCompany'][value='yes']").prop("checked", true).trigger("change");
    //$("input[name='companyName']").val("Test Company");
    //$("input[name='companyNumber']").val("123456789");
    $("input[name='startDate']").val("2025-06-15");
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
            console.log("appId sbx: ", appId.sbx[country]);
            console.log("appId prd: ", appId.prd[country]);
            if(domain == "webflow.io"){
               var redirectUrl1 = "https://appqoverme-ui.sbx.qover.io/payout/pay";
               var redirectUrl2 = "?locale="+locale+"&id=" + response.payload.id + "&appId="+appId.sbx[country];
            } else {
             var redirectUrl1 = "https://app.qover.com/payout/pay";
             var redirectUrl2 = "?locale="+locale+"&id=" + response.payload.id + "&appId=iw702hil7q0ejwxkt23hdya8";
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
        $("input[name='country']").val(country);
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

  if(urlParams.get("test") === "trueDE"){
    const formConfig = {
        "AT": {
            vehicleInfo: {
                add: [], // AT is the base, so nothing to add here
                removeSelectors: ['.js-de-field'] // Remove any DE fields if switching back
            },
            eligibilityCheck: {
                showSelectors: [ // Elements specific to AT, ensure they are visible
                    '[data-question-id="diplomaticCar"]',
                    '[data-question-id="interchangeableLicensePlate"]'
                ],
                removeSelectors: ['.js-de-field'] // Remove any DE fields
            },
            legalBlockHTML: `
                <label class="w-checkbox"><input type="checkbox" id="acceptance" name="acceptance" data-name="acceptance" class="w-checkbox-input" required=""><span class="w-form-label" for="acceptance">Ich bestätige, dass ich die Vereinbarung über die on <a href="https://app.qover.com/modules/dam/assets/67dbecce77819eea1123dd2e/content" data-document="electronic-communication" target="_blank">elektronische Kommunikation</a> gelesen habe, damit einverstanden bin und sie gespeichert habe.</span></label>
                <label class="w-checkbox"><input type="checkbox" id="important" name="important" data-name="important" class="w-checkbox-input" required=""><span class="w-form-label" for="important">Ich bin damit einverstanden, diese <a href="https://app.qover.com/modules/dam/assets/67dbecda77819eea1123dd2f/content" data-document="additional-info" target="_blank">Informationen</a> von Qover per E-Mail inklusive PDF-Anhängen zu erhalten.</span></label>
                <label class="w-checkbox"><input type="checkbox" id="eligibility" name="eligibility" data-name="eligibility" class="w-checkbox-input" required=""><span class="w-form-label" for="eligibility">Ich bestätige, dass ich die Allgemeinen Versicherungsbedingungen der <a href="https://app.qover.com/modules/dam/assets/67dbece5094ce3d3a56f557a/content" data-document="terms-and-conditions-tpl" target="_blank">Kfz-Haftpflichtversicherung</a> und der <a href="https://app.qover.com/modules/dam/assets/67dbecdf56c8d85c8a498740/content" data-document="terms-and-conditions-mod" target="_blank">Kaskoversicherung</a> gelesen und akzeptiert habe, und bestätige, dass ich die Voraussetzungen für diese Versicherung erfülle. Ich akzeptiere die <a href="https://www.helvetia.com/ch/web/de/ueber-uns/services/kontakt/datenschutz.html" target="_blank">Datenschutzerklärung</a> und erkläre mich damit einverstanden, dass meine persönlichen Daten in Übereinstimmung mit dieser Datenschutzerklärung gespeichert werden. Ich bestätige ferner, dass ich keine andere Versicherung habe, die das gleiche versicherte Risiko abdeckt, und dass der Inhalt des gewählten Versicherungsvertrags meinen Anforderungen und Bedürfnissen entspricht. Weitere Informationen entnehmen Sie bitte dem Informationsblatt zu den Versicherungsprodukten für die <a href="https://app.qover.com/modules/dam/assets/67dbee2456c8d85c8a498745/content" data-document="ipid-tpl" target="_blank">Kfz-Haftpflichtversicherung</a> und für die <a href="https://app.qover.com/modules/dam/assets/67dbee1e56c8d85c8a498744/content" data-document="ipid-mod" target="_blank">Kaskoversicherung</a>.</span></label>
                <label class="w-checkbox"><input type="checkbox" id="general" name="general" data-name="important" class="w-checkbox-input" style="border: 1px solid rgb(226, 226, 226);" required=""><span class="w-form-label" for="general">Ich stimme zu, dass der Versicherungsschutz vor Ablauf der Rücktrittsfrist beginnt..</span></label>
            `,
            policyholder: {
                country: "Österreich",
                cityPlaceholder: "Vienna",
                zipPlaceholder: "1234",
                zipPattern: "\\d{4}",
                zipMaxlength: "4"
            }
        },
        "DE": {
            vehicleInfo: {
                add: [
                    /*{
                        type: 'radio', name: 'conditionAtPurchase', label: 'Zustand bei Kauf',
                        options: [{value: 'VEHICLE_CONDITION_NEW', text: 'Neu'}, {value: 'VEHICLE_CONDITION_USED', text: 'Gebraucht'}],
                        insertBefore: 'span.toggle-icon[data-confirm-vehicle]'
                    },*/
                    {
                        type: 'date', name: 'policyholderRegistrationDate', label: 'Zulassung auf Halter',
                        placeholder: 'YYYY-MM-DD',
                        //insertBefore: 'span.toggle-icon[data-confirm-vehicle]',
                        insertBefore: 'label[data-vehicle-vin]',
                        tooltip: 'Bitte tragen Sie das Datum ein, zu dem das Fahrzeug erstmals auf Sie oder den abweichenden Fahrzeughalter zugelassen wurde oder wann es voraussichtlich auf Sie angemeldet wird. Das Datum der aktuellen Zulassung finden Sie auf der Zulassungsbescheinigung unter Position I.'
                    },
                    {
                        type: 'date', name: 'firstRegistrationDate', label: 'Erstzulassung des Fahrzeugs',
                        placeholder: 'YYYY-MM-DD',
                        //insertBefore: 'span.toggle-icon[data-confirm-vehicle]',
                        insertBefore: 'label[data-vehicle-vin]',
                        tooltip: 'An diesem Datum (Monat und Jahr) wurde Ihr Fahrzeug erstmals zum öffentlichen Verkehr zugelassen. Sie finden dieses in der Zulassungsbescheinigung Ihres Fahrzeugs (ehemals Fahrzeugschein) unter Position B. Haben Sie einen alten Fahrzeugschein, finden Sie die Information unter Position 32.'
                    },
                    /*{
                        type: 'radio', name: 'carIsReadyToBeRegistred', label: 'Fahrzeug ist zulassungsfertig',
                        options: [{value: 'true', text: 'Ja'}, {value: 'false', text: 'Nein'}],
                        insertBefore: 'span.toggle-icon[data-confirm-vehicle]'
                    },*/
                    {
                        type: 'radio', name: 'registeredCar', label: 'Wofür benötigen Sie die Versicherung?',
                        options: [{value: 'false', text: '<strong>Neu erworbenes Fahrzeug</strong> zulassen und versichern'}, {value: 'true', text: '<strong>Versicherung wechseln</strong> mit bereits auf mich versichertem Fahrzeug'}],
                        //insertBefore: 'span.toggle-icon[data-confirm-vehicle]',
                        insertBefore: 'label[data-vehicle-vin]',
                        tooltip: 'Die eVB (Elektronische Versicherungsbestätigung) zur Zulassung Ihres Fahrzeugs erhalten Sie direkt nach Antragsabschluss per E-Mail.'
                    }
                ],
                removeSelectors: [] // Nothing to remove from AT base for this section
            },
            eligibilityCheck: {
                hideSelectors: [ // Elements specific to AT, hide them for DE
                    '[data-question-id="diplomaticCar"]',
                    '[data-question-id="interchangeableLicensePlate"]'
                ],
                add: [
                    {
                        type: 'text', name: 'previousInsurerVRN', label: 'Kennzeichen des Vorversicherer',
                        insertBefore: 'span.toggle-icon[data-confirm-underwriting]'
                    },
                    {
                        type: 'text', name: 'previousInsurerReference', label: 'Vertragsreferenz des Vorversicherers',
                        insertBefore: 'span.toggle-icon[data-confirm-underwriting]'
                    },
                    {
                        type: 'dropdown', name: 'previousInsurerName', label: 'Vorheriger Versicherer',
                        options: [
                          {value: '', text: 'n/a' },
                          {value:"\"Schweiz Allgemeine\" Direkt Vers. AG", text: "\"Schweiz Allgemeine\" Direkt Vers. AG"},
                          {value: "\"Winterthur\" Schweizerische Vers.-Ges.", text: "\"Winterthur\" Schweizerische Vers.-Ges."},
                          {value: "\"Zürich\" Versicherungs-Gesellschaft, F rankfurt/M.", text: "\"Zürich\" Versicherungs-Gesellschaft, F rankfurt/M."},
                          {value: "(ehemals Württembergische und Badische Versicherungs-Aktiengesellschaft)", text:  "(ehemals Württembergische und Badische Versicherungs-Aktiengesellschaft)"},
                          {value: "A&O Autoversicherung Oldenburg AG", text: "A&O Autoversicherung Oldenburg AG"},
                          {value: "ADAC Autoversicherung AG", text: "ADAC Autoversicherung AG"},
                          {value: "Admiral Insurance Company Limited (AIC L)", text: "Admiral Insurance Company Limited (AIC L)"},
                          {value: "Admiral Insurance Company Limited (AICL) c/o AdmiralDirekt", text: "Admiral Insurance Company Limited (AICL) c/o AdmiralDirekt"},
                          {value: "AdmiralDirekt Eine Marke der Itzehoer Versicherung", text: "AdmiralDirekt Eine Marke der Itzehoer Versicherung"},
                          {value: "Agrippina Versicherung Aktiengesellsch aft", text: "Agrippina Versicherung Aktiengesellsch aft"},
                          {value: "AIG EUROPE (Netherlands) N.V.", text: "AIG EUROPE (Netherlands) N.V."},
                          {value: "AIG Europe S.A., Direktion für Deutsch land", text: "AIG Europe S.A., Direktion für Deutsch land"},
                          {value: "AIG Europe S.A., Direktion für Deutschland Standort Heilbronn", text: "AIG Europe S.A., Direktion für Deutschland Standort Heilbronn"},
                          {value: "Aioi Nissay Dowa Insurance Company of Europe SE Niederlassung Deutschland", text: "Aioi Nissay Dowa Insurance Company of Europe SE Niederlassung Deutschland"},
                          {value: "Albingia Versicherungs-Aktiengesellsch aft", text: "Albingia Versicherungs-Aktiengesellsch aft"},
                          {value: "Allianz Automotive - Stellantis Bank (ehem. PSA Bank)", text: "Allianz Automotive - Stellantis Bank (ehem. PSA Bank)"},
                          {value: "Allianz Direct Versicherungs-AG", text: "Allianz Direct Versicherungs-AG"},
                          {value: "Alte Leipziger Versicherung AG", text: "Alte Leipziger Versicherung AG"},
                          {value: "ARAG Allgemeine Versicherungs-AG", text: "ARAG Allgemeine Versicherungs-AG"},
                          {value: "Assicurazioni Generali S.p.A.", text: "Assicurazioni Generali S.p.A."},
                          {value: "ASSTEL Sachversicherung Aktiengesellschaft", text: "ASSTEL Sachversicherung Aktiengesellschaft"},
                          {value: "AUTO DIREKT Versicherungs-Aktiengesell schaft", text: "AUTO DIREKT Versicherungs-Aktiengesell schaft"},
                          {value: "Autoschadenausgleich Deutscher Gemeinden und Gemeindeverbände", text: "Autoschadenausgleich Deutscher Gemeinden und Gemeindeverbände"},
                          {value: "Avetas Versicherungs-AG", text: "Avetas Versicherungs-AG"},
                          {value: "AXA \"die Alternative\" Versicherung AG", text: "AXA \"die Alternative\" Versicherung AG"},
                          {value: "AXA easy Versicherung AG", text: "AXA easy Versicherung AG"},
                          {value: "AXA Versicherung AG", text: "AXA Versicherung AG"},
                          {value: "Badische Allgemeine AG", text: "Badische Allgemeine AG"},
                          {value: "Badischer Gemeinde-Versicherungs-Verband", text: "Badischer Gemeinde-Versicherungs-Verband"},
                          {value: "Baloise Sachversicherung AG", text: "Baloise Sachversicherung AG"},
                          {value: "Barmenia Versicherungen", text: "Barmenia Versicherungen"},
                          {value: "Basler Versicherung AG, Direktion für Deutschland", text: "Basler Versicherung AG, Direktion für Deutschland"},
                          {value: "BavariaDirekt Versicherung AG", text: "BavariaDirekt Versicherung AG"},
                          {value: "Bayerische Versicherungsbank Aktienge sellschaft", text: "Bayerische Versicherungsbank Aktienge sellschaft"},
                          {value: "Bayerische Versicherungskammer / Bayer ischer Versicherungsverband", text: "Bayerische Versicherungskammer / Bayer ischer Versicherungsverband"},
                          {value: "Bayerischer Versicherungsverband Versicherungsaktiengesellschaft", text: "Bayerischer Versicherungsverband Versicherungsaktiengesellschaft"},
                          {value: "BERLIN-KÖLNISCHE Sachversicherung AG", text: "BERLIN-KÖLNISCHE Sachversicherung AG"},
                          {value: "BGV-Versicherung AG", text: "BGV-Versicherung AG"},
                          {value: "BRUDERHILFE Sachversicherung auf Gegen seitigkeit", text: "BRUDERHILFE Sachversicherung auf Gegen seitigkeit"},
                          {value: "BTA Insurance Company SE", text: "BTA Insurance Company SE"},
                          {value: "Chartis Europe S.A", text: "Chartis Europe S.A"},
                          {value: "Chartis EUROPE S.A., Direktion für Deu tschland", text: "Chartis EUROPE S.A., Direktion für Deu tschland"},
                          {value: "Chubb European Group SE Direktion für Deutschland", text: "Chubb European Group SE Direktion für Deutschland"},
                          {value: "CHUBB Insurance Company of Europe SE", text: "CHUBB Insurance Company of Europe SE"},
                          {value: "CIGNA Insurance Company of Europe S.A. -N.V.", text: "CIGNA Insurance Company of Europe S.A. -N.V."},
                          {value: "Concordia Versicherungs-Gesellschaft auf Gegenseitigkeit", text: "Concordia Versicherungs-Gesellschaft auf Gegenseitigkeit"},
                          {value: "Continentale Sachversicherung AG Servicecenter Kraftfahrt", text: "Continentale Sachversicherung AG Servicecenter Kraftfahrt"},
                          {value: "Cordial Versicherung AG", text: "Cordial Versicherung AG"},
                          {value: "Cosmos Versicherung Aktiengesellschaft", text: "Cosmos Versicherung Aktiengesellschaft"},
                          {value: "D.A.S. Deutscher Automobil Schutz Vers icherungs AG", text: "D.A.S. Deutscher Automobil Schutz Vers icherungs AG"},
                          {value: "DA Deutsche Allgemeine Versicherung AG", text: "DA Deutsche Allgemeine Versicherung AG"},
                          {value: "DARAG Deutschland AG", text: "DARAG Deutschland AG"},
                          {value: "DBV Deutsche Beamten Versicherung AG", text: "DBV Deutsche Beamten Versicherung AG"},
                          {value: "DBV-WinSelect Versicherung AG", text: "DBV-WinSelect Versicherung AG"},
                          {value: "DBV-Winterthur Versicherung AG", text: "DBV-Winterthur Versicherung AG"},
                          {value: "Debeka Allgemeine Versicherung AG", text: "Debeka Allgemeine Versicherung AG"},
                          {value: "Delfin Direkt Versicherung", text: "Delfin Direkt Versicherung"},
                          {value: "deutsche internet versicherung Servicecenter Kraftfahrt", text: "deutsche internet versicherung Servicecenter Kraftfahrt"},
                          {value: "Deutsche Niederlassung der Basler Versicherungen Luxemburg AG (FRI:DAY)", text: "Deutsche Niederlassung der Basler Versicherungen Luxemburg AG (FRI:DAY)"},
                          {value: "Deutsche Niederlassung der FRIDAY Insurance S.A.", text: "Deutsche Niederlassung der FRIDAY Insurance S.A."},
                          {value: "Deutsche Versicherungs-Aktiengesellsch aft", text: "Deutsche Versicherungs-Aktiengesellsch aft"},
                          {value: "Deutscher Herold Allgemeine Versicherung AG \"ADAC-AutoVersicherung \"", text: "Deutscher Herold Allgemeine Versicherung AG \"ADAC-AutoVersicherung \""},
                          {value: "Deutscher Lloyd Vers.-Actien-Ges.", text: "Deutscher Lloyd Vers.-Actien-Ges."},
                          {value: "DEUTSCHER RING Sachversicherungs-AG", text: "DEUTSCHER RING Sachversicherungs-AG"},
                          {value: "Deutsches Büro Grüne Karte e. V.", text: "Deutsches Büro Grüne Karte e. V."},
                          {value: "DEVK Allgem. Versicherungs-AG", text: "DEVK Allgem. Versicherungs-AG"},
                          {value: "DEVK Deutsche Eisenbahn Versicherung Sach- u. HUK-Versicherungsverein a. G. Betriebliche Sozialeinrichtung der Deutschen Bahn", text: "DEVK Deutsche Eisenbahn Versicherung Sach- u. HUK-Versicherungsverein a. G. Betriebliche Sozialeinrichtung der Deutschen Bahn"},
                          {value: "Dialog Versicherung AG", text: "Dialog Versicherung AG"},
                          {value: "EMIL Deutschland für Gothaer Allgemeine Versicherung AG", text: "EMIL Deutschland für Gothaer Allgemeine Versicherung AG"},
                          {value: "Ergo Mobility Solutions", text: "Ergo Mobility Solutions"},
                          {value: "ERGO Mobility Solutions", text: "ERGO Mobility Solutions"},
                          {value: "Euro Insurances dac c/o Van Ameyde Germany AG Maarweg-Center", text: "Euro Insurances dac c/o Van Ameyde Germany AG Maarweg-Center"},
                          {value: "EUROPA Versicherung Aktiengesellschaft EUROPA-go Servicecenter Kraftfahrt", text: "EUROPA Versicherung Aktiengesellschaft EUROPA-go Servicecenter Kraftfahrt"},
                          {value: "Fahrlehrerversicherung Verein auf Gegenseitigkeit", text: "Fahrlehrerversicherung Verein auf Gegenseitigkeit"},
                          {value: "Feuersozietät Berlin Brandenburg", text: "Feuersozietät Berlin Brandenburg"},
                          {value: "Feuersozietät Berlin Brandenburg Versicherung Aktiengesellschaft", text: "Feuersozietät Berlin Brandenburg Versicherung Aktiengesellschaft"},
                          {value: "Frankfurter Versicherungs-Aktiengesell schaft", text: "Frankfurter Versicherungs-Aktiengesell schaft"},
                          {value: "freeyou AG Ein Vertriebspartner der GAV Vers.-AG (online-Vertrieb)", text: "freeyou AG Ein Vertriebspartner der GAV Vers.-AG (online-Vertrieb)"},
                          {value: "FRESH Insurance Services GmbH", text: "FRESH Insurance Services GmbH"},
                          {value: "GARANTA Versicherungs-AG", text: "GARANTA Versicherungs-AG"},
                          {value: "General Accident fire and Life", text: "General Accident fire and Life"},
                          {value: "GENERALI Assicurazioni Generali S.p.A.", text: "GENERALI Assicurazioni Generali S.p.A."},
                          {value: "Generali Deutschland Versicherung AG", text: "Generali Deutschland Versicherung AG"},
                          {value: "Generali Deutschland Versicherung AG (ehem. Volksfürsorge Deutsche Sachversicherung AG)", text: "Generali Deutschland Versicherung AG (ehem. Volksfürsorge Deutsche Sachversicherung AG)"},
                          {value: "Generali Lloyd Versicherung AG", text: "Generali Lloyd Versicherung AG"},
                          {value: "Gerling-Konzern Allgemeine Versicherun gs-Gesellschaft", text: "Gerling-Konzern Allgemeine Versicherun gs-Gesellschaft"},
                          {value: "GHV DARMSTADT Gemeinnützige Haftpflicht-Versicherungsanstalt Darmstadt", text: "GHV DARMSTADT Gemeinnützige Haftpflicht-Versicherungsanstalt Darmstadt"},
                          {value: "GHV Gemeinnützige Haftpflicht-Versicherungsanstalt Anstalt des öffentlichen Rechts", text: "GHV Gemeinnützige Haftpflicht-Versicherungsanstalt Anstalt des öffentlichen Rechts"},
                          {value: "Gothaer Allgemeine Versicherung Aktien gesellschaft", text: "Gothaer Allgemeine Versicherung Aktien gesellschaft"},
                          {value: "Gothaer Versicherungsbank VvaG", text: "Gothaer Versicherungsbank VvaG"},
                          {value: "Greenval Insurance DAC 2nd Floor, The Anchorage,", text: "Greenval Insurance DAC 2nd Floor, The Anchorage,"},
                          {value: "GVO Gegenseitigkeit Versicherung Oldenburg VVaG", text: "GVO Gegenseitigkeit Versicherung Oldenburg VVaG"},
                          {value: "GVV Direktversicherung AG", text: "GVV Direktversicherung AG"},
                          {value: "GVV Kommunalversicherung VVaG", text: "GVV Kommunalversicherung VVaG"},
                          {value: "Haftpflichtgemeinschaft Deutscher Nahverkehrs- und Versorgungs-unternehmen", text: "Haftpflichtgemeinschaft Deutscher Nahverkehrs- und Versorgungs-unternehmen"},
                          {value: "Haftpflichtgemeinschaft Deutscher Nahverkehrs- und Versorgungsunternehme Allgemein (HDNA) VVaG", text: "Haftpflichtgemeinschaft Deutscher Nahverkehrs- und Versorgungsunternehme Allgemein (HDNA) VVaG"},
                          {value: "Haftpflichtschadenausgleich der Deutschen Großstädte (HADG)", text: "Haftpflichtschadenausgleich der Deutschen Großstädte (HADG)"},
                          {value: "Haftpflichtverband öffentlicher Verkehrsbetriebe", text: "Haftpflichtverband öffentlicher Verkehrsbetriebe"},
                          {value: "Haftpflichtversicherungsanstalt Braunschweig", text: "Haftpflichtversicherungsanstalt Braunschweig"},
                          {value: "Hamburg-Mannheimer Sachversicherungs-A G", text: "Hamburg-Mannheimer Sachversicherungs-A G"},
                          {value: "Hamburger Feuerkasse Versicherungs-AG", text: "Hamburger Feuerkasse Versicherungs-AG"},
                          {value: "Hamburger Phönix früher Gaedesche Vers .-AG", text: "Hamburger Phönix früher Gaedesche Vers .-AG"},
                          {value: "Hannover Allgemeine Vers. AG", text: "Hannover Allgemeine Vers. AG"},
                          {value: "Hannoversche Direktversicherung AG", text: "Hannoversche Direktversicherung AG"},
                          {value: "HanseMerkur Allgemeine Versicherung AG", text: "HanseMerkur Allgemeine Versicherung AG"},
                          {value: "HDI Global SE", text: "HDI Global SE"},
                          {value: "HDI Haftpflichtverband der Deutschen I ndustrie", text: "HDI Haftpflichtverband der Deutschen I ndustrie"},
                          {value: "Helvetia Global Solutions Ltd", text: "Helvetia Global Solutions Ltd"},
                          {value: "Helvetia Schweizerische Versicherungsgesellschaft AG Filialdirektion", text: "Helvetia Schweizerische Versicherungsgesellschaft AG Filialdirektion"},
                          {value: "Helvetia Versicherungs-AG ehemals: Schweizer-National Versicherungs-AG in Deutschland", text: "Helvetia Versicherungs-AG ehemals: Schweizer-National Versicherungs-AG in Deutschland"},
                          {value: "HISCOX SA Niederlassung für Deutschland", text: "HISCOX SA Niederlassung für Deutschland"},
                          {value: "Hiscox SA Niederlassung für Deutschland", text: "Hiscox SA Niederlassung für Deutschland"},
                          {value: "HUK-COBURG Haftpflicht-Unterstützungs-Kasse kraftfahrender Beamter Deutschlands a.G. in Coburg", text: "HUK-COBURG Haftpflicht-Unterstützungs-Kasse kraftfahrender Beamter Deutschlands a.G. in Coburg"},
                          {value: "HUK-COBURG-Allgemeine Versicherung AG", text: "HUK-COBURG-Allgemeine Versicherung AG"},
                          {value: "HUK24 AG", text: "HUK24 AG"},
                          {value: "InShared eine Marke der Achmea Schadeverzekeringen N.V.", text: "InShared eine Marke der Achmea Schadeverzekeringen N.V."},
                          {value: "INTERUNFALL Allgem. Versicherungs-AG", text: "INTERUNFALL Allgem. Versicherungs-AG"},
                          {value: "iptiQ EMEA P&C S.A. Niederlassung Deutschland", text: "iptiQ EMEA P&C S.A. Niederlassung Deutschland"},
                          {value: "Janitos Versicherung AG", text: "Janitos Versicherung AG"},
                          {value: "Karlsruher Versicherung AG", text: "Karlsruher Versicherung AG"},
                          {value: "Karlsruher Versicherung AG (ehem. Karlsruher Beamten Versicherung AG)", text: "Karlsruher Versicherung AG (ehem. Karlsruher Beamten Versicherung AG)"},
                          {value: "Kraft Versicherungs-Aktiengesellschaft", text: "Kraft Versicherungs-Aktiengesellschaft"},
                          {value: "KRAVAG-ALLGEMEINE Versicherungs-Aktiengesellschaft c/o R+V Allgemeine Versicherung AG", text: "KRAVAG-ALLGEMEINE Versicherungs-Aktiengesellschaft c/o R+V Allgemeine Versicherung AG"},
                          {value: "KRAVAG-LOGISTIC Versicherungs-AG c/o R+V Allgemeine Versicherung AG", text: "KRAVAG-LOGISTIC Versicherungs-AG c/o R+V Allgemeine Versicherung AG"},
                          {value: "KRAVAG-SACH Versicherung", text: "KRAVAG-SACH Versicherung"},
                          {value: "KSA Kommunaler Schadenausgleich der Länder Brandenburg, Mecklenburg-Vorpommern, Sachsen, Sachsen-Anhalt und Thüringen", text: "KSA Kommunaler Schadenausgleich der Länder Brandenburg, Mecklenburg-Vorpommern, Sachsen, Sachsen-Anhalt und Thüringen"},
                          {value: "KSA Kommunaler Schadenausgleich Schleswig-Holstein", text: "KSA Kommunaler Schadenausgleich Schleswig-Holstein"},
                          {value: "KSA Kommunaler Schadenausgleich westdeutscher Städte", text: "KSA Kommunaler Schadenausgleich westdeutscher Städte"},
                          {value: "LA CONCORDE S.A.", text: "LA CONCORDE S.A."},
                          {value: "Landesschadenhilfe Versicherung VaG", text: "Landesschadenhilfe Versicherung VaG"},
                          {value: "Lippische Landes-Brandversicherungsans talt", text: "Lippische Landes-Brandversicherungsans talt"},
                          {value: "Lippische Landesbrandversicherung AG", text: "Lippische Landesbrandversicherung AG"},
                          {value: "Lloyd's Insurance Company S.A., Niederlassung für Deutschland", text: "Lloyd's Insurance Company S.A., Niederlassung für Deutschland"},
                          {value: "LVM Landwirtschaftlicher Versicherungsverein Münster a.G.", text: "LVM Landwirtschaftlicher Versicherungsverein Münster a.G."},
                          {value: "Magdeburger Versicherung AG", text: "Magdeburger Versicherung AG"},
                          {value: "Mannheimer Versicherung AG", text: "Mannheimer Versicherung AG"},
                          {value: "Mannheimer Versicherung Aktiengesellschaft", text: "Mannheimer Versicherung Aktiengesellschaft"},
                          {value: "Mecklenburgische Versicherungs-Gesellschaft a.G. Direktion Hannover", text: "Mecklenburgische Versicherungs-Gesellschaft a.G. Direktion Hannover"},
                          {value: "MMA IARD Assurances Mutuelles", text: "MMA IARD Assurances Mutuelles"},
                          {value: "Münchener Verein Allgemeine Versicherungs-AG", text: "Münchener Verein Allgemeine Versicherungs-AG"},
                          {value: "NECKURA Allgemeine Versicherungs-AG", text: "NECKURA Allgemeine Versicherungs-AG"},
                          {value: "NECKURA Versicherungs-Aktiengesellscha ft", text: "NECKURA Versicherungs-Aktiengesellscha ft"},
                          {value: "Neodigital Autoversicherung AG", text: "Neodigital Autoversicherung AG"},
                          {value: "Neodigital Versicherung AG", text: "Neodigital Versicherung AG"},
                          {value: "Nexible GmbH", text: "Nexible GmbH"},
                          {value: "NORDSTERN Allgemeine Versicherungs-AG", text: "NORDSTERN Allgemeine Versicherungs-AG"},
                          {value: "NÜRNBERGER Allgemeine Versicherungs-AG", text: "NÜRNBERGER Allgemeine Versicherungs-AG"},
                          {value: "NÜRNBERGER Beamten Allgemeine Versicherung AG", text: "NÜRNBERGER Beamten Allgemeine Versicherung AG"},
                          {value: "Öffentliche Feuerversicherung Sachsen-Anhalt", text: "Öffentliche Feuerversicherung Sachsen-Anhalt"},
                          {value: "Öffentliche Sachversicherung Braunschweig", text: "Öffentliche Sachversicherung Braunschweig"},
                          {value: "Öffentliche Versicherung Oldenburg", text: "Öffentliche Versicherung Oldenburg"},
                          {value: "Oldenburgische Landesbrandkasse", text: "Oldenburgische Landesbrandkasse"},
                          {value: "ONTOS Versicherung AG", text: "ONTOS Versicherung AG"},
                          {value: "Optima Versicherungs-AG", text: "Optima Versicherungs-AG"},
                          {value: "ÖVA Allgemeine Versicherungs-AG", text: "ÖVA Allgemeine Versicherungs-AG"},
                          {value: "Patria Versicherung Aktiengesellschaft", text: "Patria Versicherung Aktiengesellschaft"},
                          {value: "PRO DIREKT Vers. AG", text: "PRO DIREKT Vers. AG"},
                          {value: "Probus Insurance Company Europe DAC Hertz Europe Service Centre", text: "Probus Insurance Company Europe DAC Hertz Europe Service Centre"},
                          {value: "Provinzial Nord Brandkasse Aktiengesellschaft", text: "Provinzial Nord Brandkasse Aktiengesellschaft"},
                          {value: "Provinzial Versicherung AG (ehemals Westfälische Provinzial Versicherung AG Die Versicherung der Sparkassen)", text: "Provinzial Versicherung AG (ehemals Westfälische Provinzial Versicherung AG Die Versicherung der Sparkassen)"},
                          {value: "Provinzial Versicherung AG Standort Münster", text: "Provinzial Versicherung AG Standort Münster"},
                          {value: "Provinzial-Feuerversicherungsanstalt d er Rheinprovinz", text: "Provinzial-Feuerversicherungsanstalt d er Rheinprovinz"},
                          {value: "QBE Insurance (Europe) Limited, Direkt ion für Deutschland, Düsseldorf", text: "QBE Insurance (Europe) Limited, Direkt ion für Deutschland, Düsseldorf"},
                          {value: "R+V Allgemeine Versicherung AG", text: "R+V Allgemeine Versicherung AG"},
                          {value: "R+V Allgemeine Versicherung AG (ehemals Condor)", text: "R+V Allgemeine Versicherung AG (ehemals Condor)"},
                          {value: "R+V Direktversicherung Kraftfahrt Betrieb", text: "R+V Direktversicherung Kraftfahrt Betrieb"},
                          {value: "RheinLand Versicherungs AG", text: "RheinLand Versicherungs AG"},
                          {value: "Rhion Versicherung AG", text: "Rhion Versicherung AG"},
                          {value: "Saarland Feuerversicherung AG", text: "Saarland Feuerversicherung AG"},
                          {value: "SAVAG Saarbrücker Versicherungs-AG", text: "SAVAG Saarbrücker Versicherungs-AG"},
                          {value: "SCHWARZMEER UND OSTSEE Versicherungs-AG SOVAG", text: "SCHWARZMEER UND OSTSEE Versicherungs-AG SOVAG"},
                          {value: "SECURITAS Bremer Allgemeine Versicheru ngs-AG", text: "SECURITAS Bremer Allgemeine Versicheru ngs-AG"},
                          {value: "Sicher Direct Versicherung AG", text: "Sicher Direct Versicherung AG"},
                          {value: "SIGNAL IDUNA Unfallversicherung a.G.", text: "SIGNAL IDUNA Unfallversicherung a.G."},
                          {value: "Sofinsod Insurance dac c/o Broadspire by Crawford & Company (Deutschland) GmbH", text: "Sofinsod Insurance dac c/o Broadspire by Crawford & Company (Deutschland) GmbH"},
                          {value: "Sparkassen DirektVersicherung AG", text: "Sparkassen DirektVersicherung AG"},
                          {value: "Sparkassen-Versicherung Allgemeine Ver s. AG", text: "Sparkassen-Versicherung Allgemeine Ver s. AG"},
                          {value: "Sparkassen-Versicherung Sachsen Allgemeine Versicherung AG", text: "Sparkassen-Versicherung Sachsen Allgemeine Versicherung AG"},
                          {value: "Sun Alliance und London Insurance", text: "Sun Alliance und London Insurance"},
                          {value: "Sun Direct Versicherungs-AG", text: "Sun Direct Versicherungs-AG"},
                          {value: "SV SparkassenVersicherung Gebäudeversicherung AG", text: "SV SparkassenVersicherung Gebäudeversicherung AG"},
                          {value: "SV SparkassenVersicherung öffentliche Versicherungsanstalt Hessen-Nassau-Thü", text: "SV SparkassenVersicherung öffentliche Versicherungsanstalt Hessen-Nassau-Thü"},
                          {value: "telcon Allgemeine Versicherung AG", text: "telcon Allgemeine Versicherung AG"},
                          {value: "Tellit Direkt Versicherung AG", text: "Tellit Direkt Versicherung AG"},
                          {value: "The Chiyoda Fire and Marine Insurance Co.", text: "The Chiyoda Fire and Marine Insurance Co."},
                          {value: "The Continental Insurance Co.", text: "The Continental Insurance Co."},
                          {value: "Thuringia Generali Versicherung AG", text: "Thuringia Generali Versicherung AG"},
                          {value: "Transatlantische Vers.-AG", text: "Transatlantische Vers.-AG"},
                          {value: "TVM zakelijk N.V.", text: "TVM zakelijk N.V."},
                          {value: "UAP International Allgem. Vers.-AG, Sa arbrücken", text: "UAP International Allgem. Vers.-AG, Sa arbrücken"},
                          {value: "uniVersa Allgemeine Versicherung AG", text: "uniVersa Allgemeine Versicherung AG"},
                          {value: "UPS International Insurance dac c/o Marsh Management Services Limited", text: "UPS International Insurance dac c/o Marsh Management Services Limited"},
                          {value: "USAA Limited Frankfurt Claims Branch Niederlassung der USAA Limited UK für Deutschland", text: "USAA Limited Frankfurt Claims Branch Niederlassung der USAA Limited UK für Deutschland"},
                          {value: "USAA S.A.", text: "USAA S.A."},
                          {value: "USAA United Services Automobile Association Direktion für Deutschland", text: "USAA United Services Automobile Association Direktion für Deutschland"},
                          {value: "VAV Versicherung für die Bauwirtschaft Allgemeine Versicherungs-AG c/o AKO Versicherungsmakler GmbH&Co. K", text: "VAV Versicherung für die Bauwirtschaft Allgemeine Versicherungs-AG c/o AKO Versicherungsmakler GmbH&Co. K"},
                          {value: "VdK Versicherung der Kraftfahrt Zweigniederlassung der SIGNAL IDUNA Allgemeine Versicherung AG", text: "VdK Versicherung der Kraftfahrt Zweigniederlassung der SIGNAL IDUNA Allgemeine Versicherung AG"},
                          {value: "Vereinigte Haftpflichtversicherung V.a .G.", text: "Vereinigte Haftpflichtversicherung V.a .G."},
                          {value: "Vereinte Versicherung AG", text: "Vereinte Versicherung AG"},
                          {value: "Versicherer im Raum der Kirchen Sachversicherung AG", text: "Versicherer im Raum der Kirchen Sachversicherung AG"},
                          {value: "Versicherungskammer Bayern Versicherungsanstalt des öffentlichen Rechts", text: "Versicherungskammer Bayern Versicherungsanstalt des öffentlichen Rechts"},
                          {value: "Verti Versicherung AG", text: "Verti Versicherung AG"},
                          {value: "VGH Landschaftliche Brandkasse Hannover Lampe und Schwartze KG", text: "VGH Landschaftliche Brandkasse Hannover Lampe und Schwartze KG"},
                          {value: "VHV Allgemeine Versicherung AG", text: "VHV Allgemeine Versicherung AG"},
                          {value: "VHV Autoversicherungs-AG", text: "VHV Autoversicherungs-AG"},
                          {value: "VÖDAG Versicherung", text: "VÖDAG Versicherung"},
                          {value: "VÖDAG Versicherung für den öffentlichen Dienst Zweigniederlassung der ADLER Versicherung AG", text: "VÖDAG Versicherung für den öffentlichen Dienst Zweigniederlassung der ADLER Versicherung AG"},
                          {value: "Volksfürsorge Deutsche Sachversicherun g AG", text: "Volksfürsorge Deutsche Sachversicherun g AG"},
                          {value: "Volkswagen Autoversicherung AG", text: "Volkswagen Autoversicherung AG"},
                          {value: "VOLKSWOHL-BUND Sachversicherung AG", text: "VOLKSWOHL-BUND Sachversicherung AG"},
                          {value: "VOLVO Auto Versicherung HDI Versicherung AG", text: "VOLVO Auto Versicherung HDI Versicherung AG"},
                          {value: "VVDE Versicherungsverband Deutscher Eisenbahnen VVaG", text: "VVDE Versicherungsverband Deutscher Eisenbahnen VVaG"},
                          {value: "wefox Insurance AG Niederlassung Deutschland", text: "wefox Insurance AG Niederlassung Deutschland"},
                          {value: "Westfälische Provinzial-Feuersozietät", text: "Westfälische Provinzial-Feuersozietät"},
                          {value: "WGV-Versicherung AG", text: "WGV-Versicherung AG"},
                          {value: "Winterthur International (Deutschland) Versicherung Aktiengesellschaft", text: "Winterthur International (Deutschland) Versicherung Aktiengesellschaft"},
                          {value: "Württembergische Gemeinde-Versicherung a.G.", text: "Württembergische Gemeinde-Versicherung a.G."},
                          {value: "Württembergische Versicherung AG Servicebereich Leipzig", text: "Württembergische Versicherung AG Servicebereich Leipzig"},
                          {value: "WWK Allgemeine Versicherung AG", text: "WWK Allgemeine Versicherung AG"},
                          {value: "XL Insurance Company SE Direktion für Deutschland", text: "XL Insurance Company SE Direktion für Deutschland"},
                          {value: "Zenith Versicherung Aktiengesellschaft", text: "Zenith Versicherung Aktiengesellschaft"},
                          {value: "Zurich Insurance Europe AG Niederlassung für Deutschland Zurich Kunden Service", text: "Zurich Insurance Europe AG Niederlassung für Deutschland Zurich Kunden Service"},
                          {value: "Zürich Versicherungs-Aktiengesellschaf", text: "Zürich Versicherungs-Aktiengesellschaf"}
                        ],
                        insertBefore: 'span.toggle-icon[data-confirm-underwriting]'
                    },
                    {
                        type: 'dropdown', name: 'sfClassMod', label: 'SF-Klasse MOD',
                        options: [
                          { value: '', text: 'Bitte wählen' },
                          { value: '0', text: 'Keine SF-Klasse vorhanden' },
                          { value: '0', text: 'SF 0 (Anfänger)' },
                          { value: 'M', text: 'SF M (Malusklasse)' },
                          { value: 'S', text: 'SF S (Nach Rückstufung)' },
                          { value: 'SF1/2', text: 'SF 1/2' },
                          { value: 'SF1', text: 'SF 1' },
                          { value: 'SF2', text: 'SF 2' },
                          { value: 'SF3', text: 'SF 3' },
                          { value: 'SF4', text: 'SF 4' },
                          { value: 'SF5', text: 'SF 5' },
                          { value: 'SF6', text: 'SF 6' },
                          { value: 'SF7', text: 'SF 7' },
                          { value: 'SF8', text: 'SF 8' },
                          { value: 'SF9', text: 'SF 9' },
                          { value: 'SF10', text: 'SF 10' },
                          { value: 'SF11', text: 'SF 11' },
                          { value: 'SF12', text: 'SF 12' },
                          { value: 'SF13', text: 'SF 13' },
                          { value: 'SF14', text: 'SF 14' },
                          { value: 'SF15', text: 'SF 15' },
                          { value: 'SF16', text: 'SF 16' },
                          { value: 'SF17', text: 'SF 17' },
                          { value: 'SF18', text: 'SF 18' },
                          { value: 'SF19', text: 'SF 19' },
                          { value: 'SF20', text: 'SF 20' },
                          { value: 'SF21', text: 'SF 21' },
                          { value: 'SF22', text: 'SF 22' },
                          { value: 'SF23', text: 'SF 23' },
                          { value: 'SF24', text: 'SF 24' },
                          { value: 'SF25', text: 'SF 25' },
                          { value: 'SF26', text: 'SF 26' },
                          { value: 'SF27', text: 'SF 27' },
                          { value: 'SF28', text: 'SF 28' },
                          { value: 'SF29', text: 'SF 29' },
                          { value: 'SF30', text: 'SF 30' },
                          { value: 'SF31', text: 'SF 31' },
                          { value: 'SF32', text: 'SF 32' },
                          { value: 'SF33', text: 'SF 33' },
                          { value: 'SF34', text: 'SF 34' },
                          { value: 'SF35', text: 'SF 35' },
                          { value: 'SF36', text: 'SF 36' },
                          { value: 'SF37', text: 'SF 37' },
                          { value: 'SF38', text: 'SF 38' },
                          { value: 'SF39', text: 'SF 39' },
                          { value: 'SF40', text: 'SF 40' },
                          { value: 'SF41', text: 'SF 41' },
                          { value: 'SF42', text: 'SF 42' },
                          { value: 'SF43', text: 'SF 43' },
                          { value: 'SF44', text: 'SF 44' },
                          { value: 'SF45', text: 'SF 45' },
                          { value: 'SF46', text: 'SF 46' },
                          { value: 'SF47', text: 'SF 47' },
                          { value: 'SF48', text: 'SF 48' },
                          { value: 'SF49', text: 'SF 49' },
                          { value: 'SF50', text: 'SF 50 (oder mehr)' }
                      ],
                        insertBefore: 'span.toggle-icon[data-confirm-underwriting]'
                    },
                    {
                        type: 'dropdown', name: 'sfClassTpl', label: 'SF-Klasse TPL',
                        options: [
                            { value: '', text: 'Bitte wählen' },
                            { value: '0', text: 'Keine SF-Klasse vorhanden' },
                            { value: '0', text: 'SF 0 (Anfänger)' },
                            { value: 'M', text: 'SF M (Malusklasse)' },
                            { value: 'S', text: 'SF S (Nach Rückstufung)' },
                            { value: 'SF1/2', text: 'SF 1/2' },
                            { value: 'SF1', text: 'SF 1' },
                            { value: 'SF2', text: 'SF 2' },
                            { value: 'SF3', text: 'SF 3' },
                            { value: 'SF4', text: 'SF 4' },
                            { value: 'SF5', text: 'SF 5' },
                            { value: 'SF6', text: 'SF 6' },
                            { value: 'SF7', text: 'SF 7' },
                            { value: 'SF8', text: 'SF 8' },
                            { value: 'SF9', text: 'SF 9' },
                            { value: 'SF10', text: 'SF 10' },
                            { value: 'SF11', text: 'SF 11' },
                            { value: 'SF12', text: 'SF 12' },
                            { value: 'SF13', text: 'SF 13' },
                            { value: 'SF14', text: 'SF 14' },
                            { value: 'SF15', text: 'SF 15' },
                            { value: 'SF16', text: 'SF 16' },
                            { value: 'SF17', text: 'SF 17' },
                            { value: 'SF18', text: 'SF 18' },
                            { value: 'SF19', text: 'SF 19' },
                            { value: 'SF20', text: 'SF 20' },
                            { value: 'SF21', text: 'SF 21' },
                            { value: 'SF22', text: 'SF 22' },
                            { value: 'SF23', text: 'SF 23' },
                            { value: 'SF24', text: 'SF 24' },
                            { value: 'SF25', text: 'SF 25' },
                            { value: 'SF26', text: 'SF 26' },
                            { value: 'SF27', text: 'SF 27' },
                            { value: 'SF28', text: 'SF 28' },
                            { value: 'SF29', text: 'SF 29' },
                            { value: 'SF30', text: 'SF 30' },
                            { value: 'SF31', text: 'SF 31' },
                            { value: 'SF32', text: 'SF 32' },
                            { value: 'SF33', text: 'SF 33' },
                            { value: 'SF34', text: 'SF 34' },
                            { value: 'SF35', text: 'SF 35' },
                            { value: 'SF36', text: 'SF 36' },
                            { value: 'SF37', text: 'SF 37' },
                            { value: 'SF38', text: 'SF 38' },
                            { value: 'SF39', text: 'SF 39' },
                            { value: 'SF40', text: 'SF 40' },
                            { value: 'SF41', text: 'SF 41' },
                            { value: 'SF42', text: 'SF 42' },
                            { value: 'SF43', text: 'SF 43' },
                            { value: 'SF44', text: 'SF 44' },
                            { value: 'SF45', text: 'SF 45' },
                            { value: 'SF46', text: 'SF 46' },
                            { value: 'SF47', text: 'SF 47' },
                            { value: 'SF48', text: 'SF 48' },
                            { value: 'SF49', text: 'SF 49' },
                            { value: 'SF50', text: 'SF 50 (oder mehr)' }
                        ],
                        insertBefore: 'span.toggle-icon[data-confirm-underwriting]',
                        tooltip: '<strong>Neu erworbenes als Zweitfahrzeug.</strong> Möchten Sie ein neu erworbenes als Zweitfahrzeug zu Ihrem bisherigen Fahrzeug hinzufügen, dann erfolgt auf Basis des bisherigen Vertrags eine bessere Einstufung des Schadenfreiheitsrabatts für das neue Zweitfahrzeug. Wählen Sie bitte „Keine SF-Klasse vorhanden“ aus.'
                    }
                ],
                removeSelectors: [] // We are hiding AT specific, not removing the containers
            },
            legalBlockHTML: `
                <label class="w-checkbox js-de-field">
                    <input type="checkbox" id="de_terms_important" name="de_terms_important" data-name="important" class="w-checkbox-input" required="">
                    <span class="w-form-label" for="de_terms_important">Ich habe die <a href="https://api.prd.qover.io/documents/download?apikey=pk_8608895FC72565DF474D&productReference=IAB&country=DE&language=de&type=preContract" target="_blank"><strong>vorvertragliche Unterlage</strong></a> und die <a href="https://www.qover.com/terms-and-policies#complaints" target="_blank"><strong>Belehrung</strong></a> nach § 19 Abs. 5 VVG über die Folgen einer Verletzung der vorvertraglichen Anzeigepflicht gelesen und akzeptiere sie.</span>
                </label>
                <label class="w-checkbox js-de-field">
                    <input type="checkbox" id="de_terms_acceptance" name="de_terms_acceptance" data-name="acceptance" class="w-checkbox-input" required="">
                    <span class="w-form-label" for="de_terms_acceptance">Ich erkläre hiermit, dass ich auf die Beratung nach § 6 Abs. 3 und 5 VVG verzichte. Dieser <strong>Beratungsverzicht</strong> kann zu folgende rechtlichen Konsequenzen führen.<br><br>Sollten Sie bei Antragstellung auf eine Beratung und Dokumentation verzichten, kann sich dieser Verzicht nachteilig auf Ihre Möglichkeit auswirken, gegen den Versicherer Helvetia Global Solutions Ltd. oder den Versicherungsvermittler Qover S.A. Schadensersatzansprüche geltend zu machen, weil das von Ihnen ausgewählte Produkt möglicherweise Ihren Wünschen und individuellen Bedürfnissen nicht entspricht.</span>
                </label>
                <label class="w-checkbox js-de-field">
                    <input type="checkbox" id="de_terms_eligibility" name="de_terms_eligibility" data-name="eligibility" class="w-checkbox-input" required="">
                    <span class="w-form-label" for="de_terms_eligibility">Ich bestätige, dass ich die <a href="https://api.prd.qover.io/documents/download?apikey=pk_8608895FC72565DF474D&productReference=IAB&country=DE&language=de&type=generalConditions" target="_blank"><strong>Allgemeinen Versicherungsbedingungen</strong></a> gelesen und akzeptiert habe, und bestätige, dass ich die Voraussetzungen für diese Versicherung erfülle. Ich bestätige ferner, dass ich keine andere Versicherung habe, die das gleiche versicherte Risiko abdeckt, und dass der Inhalt des gewählten Versicherungsvertrags meinen Anforderungen und Bedürfnissen entspricht. Weitere Informationen entnehmen Sie bitte dem <a href="https://api.prd.qover.io/documents/download?apikey=pk_8608895FC72565DF474D&productReference=IAB&country=DE&language=de&type=IPID" target="_blank"><strong>Informationsblatt zu den Versicherungsprodukten</strong></a>.</span>
                </label>
                <label class="w-checkbox js-de-field">
                    <input type="checkbox" id="de_terms_commercial" name="de_terms_commercial" data-name="commercial" class="w-checkbox-input" required="">
                    <span class="w-form-label" for="de_terms_commercial">Ich bestätige, dass ich das Fahrzeug nicht zur gewerblichen <strong>Personenbeförderung</strong> (Taxi) oder zur gewerblichen Vermietung nutze.</span>
                </label>
                <label class="w-checkbox js-de-field">
                    <input type="checkbox" id="de_terms_diplomat" name="de_terms_diplomat" data-name="diplomat" class="w-checkbox-input" required="">
                    <span class="w-form-label" for="de_terms_diplomat">Ich bestätige, dass das versicherte Fahrzeug kein <strong>Diplomatenkennzeichen</strong> hat.</span>
                </label>
                <label class="w-checkbox js-de-field">
                    <input type="checkbox" id="de_terms_interchangeable_plate" name="de_terms_interchangeable_plate" data-name="interchangeable_plate" class="w-checkbox-input" required="">
                    <span class="w-form-label" for="de_terms_interchangeable_plate">Ich bestätige, dass das Fahrzeug nicht mit einem Wechselkennzeichen ausgestattet ist.</span>
                </label>
                <label class="w-checkbox js-de-field">
                    <input type="checkbox" id="de_terms_general" name="de_terms_general" data-name="general" class="w-checkbox-input" required="">
                    <span class="w-form-label" for="de_terms_general">Ich bestätige ferner, dass ich keine andere Versicherung habe, die das gleiche versicherte Risiko abdeckt, und dass der Inhalt des gewählten Versicherungsvertrags meinen Anforderungen und Bedürfnissen entspricht. Weitere Informationen entnehmen Sie bitte dem <a href="https://api.prd.qover.io/documents/download?apikey=pk_8608895FC72565DF474D&productReference=IAB&country=DE&language=de&type=IPID" target="_blank"><strong>Informationsblatt zu den Versicherungsprodukten.</strong></a></span>
                </label>
                <label class="w-checkbox js-de-field">
                    <input type="checkbox" id="de_terms_privacypolicy" name="de_terms_privacypolicy" data-name="privacypolicy" class="w-checkbox-input" required="">
                    <span class="w-form-label" for="de_terms_privacypolicy">Ich habe die Datenschutzerklärung zur Kenntnis genommen und bin darüber informiert, dass meine persönlichen Daten gemäß dieser <a href="https://www.helvetia.com/ch/web/de/ueber-uns/services/kontakt/datenschutz.html" target="_blank"><strong>Datenschutzerklärung</strong></a> verarbeitet werden.</span>
                </label>
            `,
            policyholder: {
                country: "Deutschland",
                cityPlaceholder: "Berlin",
                zipPlaceholder: "10115",
                zipPattern: "\\d{5}",
                zipMaxlength: "5"
            }
        }
    };

    // --- Helper function to create form elements ---
    function createFieldHtml(item) {
        let html = `<div class="js-dynamic-field js-de-field">`; // Mark as dynamic and DE-specific
        html += `<label for="${item.name}">${item.label}`;
        if (item.tooltip) {
          html += `<div class="tooltip-container">`;
          html += `<span class="tooltip-icon">?</span>`;
          html += `<div class="tooltip-text">${item.tooltip}</div>`;
          html += `</div>`;
        }
        html += `</label>`;
        if(item.explanation){
          html += `<span style="font-size:0.8rem">${item.explanation}</span>`;
        }
        if (item.type === 'radio') {
            html += `<div class="radio-group" id="rg-${item.name}">`;
            item.options.forEach(opt => {
                html += `<label><input class="radio-circle" type="radio" name="${item.name}" value="${opt.value}" required> ${opt.text}</label>`;
            });
            html += `</div>`;
        } else if (item.type === 'date') {
            html += `<input class="field date w-input" type="date" name="${item.name}" placeholder="${item.placeholder || ''}" required>`;
        } else if (item.type === 'text') {
            html += `<input class="field date w-input" type="text" name="${item.name}" placeholder="${item.placeholder || ''}" required>`;
        } else if (item.type === 'dropdown') {
            html += `<select class="field" name="${item.name}" id="${item.name}" required>`;
            item.options.forEach(opt => {
                html += `<option value="${opt.value}">${opt.text}</option>`;
            });
            html += `</select>`;
        }
        html += `</div>`;
        return html;
    }

    // --- Main Update Function ---
    function updateFormForCountry(countryCode) {
        const config = formConfig[countryCode];
        console.log(config);
        if (!config) {
            console.error("No configuration found for country:", countryCode);
            return;
        }

        // 1. Reset: Remove all dynamically added DE fields first
        $('.js-de-field').remove();
        // Reset AT specific visibility (show all initially marked for AT)
        $('[data-original-for-at]').removeClass('js-removed-placeholder');
        $('[data-question-id]').removeClass('js-removed-placeholder');


        // 2. Apply Vehicle Info changes
        //const $vehicleInfoContent = $('div[data-step="vehicle-info"] .section-content');
        const $vehicleInfoContent = $('h2[data-step="vehicle-info"]').next('.section-content');
        //const $vehicleInfoContent = $('[data-step="vehicle-info"]');
        if (config.vehicleInfo) {
            // Add new fields for DE
            if (countryCode === "DE" && config.vehicleInfo.add) {
                 // Iterate in reverse if inserting before the same element multiple times
                [...config.vehicleInfo.add].reverse().forEach(item => {
                  //console.log("item to add ", item);
                    const fieldHtml = createFieldHtml(item);
                    //console.log("fieldHtml ", item.name);
                    //console.log(fieldHtml);
                    if (item.insertBefore) {
                        $vehicleInfoContent.find(item.insertBefore).before(fieldHtml);
                        //$vehicleInfoContent.append(fieldHtml);
                    } else {
                        $vehicleInfoContent.append(fieldHtml); // Fallback
                    }
                });
            }
        }

        // 3. Apply Eligibility Check changes
        const $eligibilityCheckContent = $('h2[data-step="eligibility-check"]').next('.section-content');
        if (config.eligibilityCheck) {
            // Hide/Show AT specific questions
            if (countryCode === "DE" && config.eligibilityCheck.hideSelectors) {
                config.eligibilityCheck.hideSelectors.forEach(selector => {
                    $eligibilityCheckContent.find(selector).addClass('js-removed-placeholder');
                });
            } else if (countryCode === "AT" && formConfig.AT.eligibilityCheck.showSelectors) {
                 formConfig.AT.eligibilityCheck.showSelectors.forEach(selector => {
                    $eligibilityCheckContent.find(selector).removeClass('js-removed-placeholder');
                });
            }

            // Add new DE fields
            if (countryCode === "DE" && config.eligibilityCheck.add) {
                // Add in reverse order to maintain specified order if insertAfter is the same element
                [...config.eligibilityCheck.add].reverse().forEach(item => {
                    const fieldHtml = createFieldHtml(item);
                    //console.log("fieldHtml ", item.name);
                    //console.log(fieldHtml);
                    if (item.insertAfter) {
                        //$eligibilityCheckContent.find(item.insertAfter).after(fieldHtml);
                        $vehicleInfoContent.find(item.insertBefore).before(fieldHtml);
                    } else {
                        $eligibilityCheckContent.find('.toggle-icon').before(fieldHtml); // Default before confirm
                    }
                });
            }
        }

        // 4. Update Legal Block
        const $legalBlock = $('.legal-block');
        const $submitButton = $legalBlock.find('#submitButton');
        // Remove existing legal checkboxes (but not the button or message div)
        $legalBlock.find('label.w-checkbox').remove();
        if (config.legalBlockHTML) {
            $submitButton.before(config.legalBlockHTML);
        }

        // 5. Update Policyholder section (Country field, ZIP validation)
        if (config.policyholder) {
            $('input[name="country"]').val(config.policyholder.country);
            const $cityInput = $('input[name="city"]');
            $cityInput.attr('placeholder', config.policyholder.cityPlaceholder);

            const $zipInput = $('input[name="zip"]');
            $zipInput.attr('placeholder', config.policyholder.zipPlaceholder);
            $zipInput.attr('pattern', config.policyholder.zipPattern);
            $zipInput.attr('maxlength', config.policyholder.zipMaxlength);
        }

        //6. Update content
        if(country == "DE"){
          $('[data-startDate-explanation]').text('Zulassungsdatum noch unsicher? Kein Problem. Wählen Sie einfach das heutige Datum aus. Ihr Versicherungsschutz startet dann automatisch am Tag der tatsächlichen Zulassung.');
        }


        // Simple collapsible functionality (if you want to keep it)
        $('.collapsible').off('click').on('click', function() {
            $(this).next('.section-content').slideToggle();
        }).first().next('.section-content').show(); // Open first section by default

        // Toggle company fields
        $('input[name="isCompany"]').off('change').on('change', function() {
            if (this.value === 'yes') {
                $('#companyFields').slideDown();
            } else {
                $('#companyFields').slideUp();
            }
        }).trigger('change'); // Trigger on load to set initial state

         // Toggle start date field visibility
        $('#setStartDateNow').off('change').on('change', function() {
            if ($(this).is(':checked')) {
                $('#startDateContainer').slideDown();
            } else {
                $('#startDateContainer').slideUp();
            }
        }).trigger('change');

        //Toggle insurer ref and name if SF Klass is adapted
        if(country == "DE"){
          const sfTplSelect = $('#sfClassTpl');
          const sfModSelect = $('#sfClassMod');
          const previousInsurerFieldContainer = $('select[name="previousInsurerName"]').closest('.js-dynamic-field');
          const previousInsurerVRNFieldContainer = $('input[name="previousInsurerVRN"]').closest('.js-dynamic-field');
          const previousInsurerReferenceFieldContainer = $('input[name="previousInsurerReference"]').closest('.js-dynamic-field');

          const previousInsurerSelect = $('#previousInsurerName');
          const previousInsurerVRNInput = $('#previousInsurerVRN');
          const previousInsurerReferenceInput = $('#previousInsurerReference');

          function togglePreviousInsurerFields() {
              const tplValue = sfTplSelect.val();
              const modValue = sfModSelect.val();
              if (
                  (tplValue === '0' && modValue === '0') ||
                  (tplValue === '' && modValue === '')
                 ) {
                  previousInsurerFieldContainer.slideUp(function() {
                      previousInsurerSelect.prop('required', false).val('');
                  });
                  previousInsurerReferenceFieldContainer.slideUp(function() {
                      previousInsurerReferenceInput.prop('required', false).val('');
                  });
                  previousInsurerVRNFieldContainer.slideUp(function() {
                      previousInsurerVRNInput.prop('required', false).val('');
                  });

              } else {
                  previousInsurerFieldContainer.slideDown(function() {
                      previousInsurerSelect.prop('required', true);
                  });
                  previousInsurerReferenceFieldContainer.slideDown(function() {
                      previousInsurerReferenceInput.prop('required', true);
                  });
                  previousInsurerVRNFieldContainer.slideDown(function() {
                      previousInsurerVRNInput.prop('required', false).val('');
                  });
              }
          }

          sfTplSelect.add(sfModSelect).on('change', function() {
              togglePreviousInsurerFields();
          });

          togglePreviousInsurerFields(); // Initial check
          /*$('.collapsible').on('click', function() {
            $(this).toggleClass('active');
            var content = $(this).next('.section-content');
            if (content.css('display') === "block") {
                content.slideUp();
            } else {
                content.slideDown();
            }
        });
        */

        }
        

        

    }


    // --- Initial Form Build ---
    updateFormForCountry(country); // Initialize with the default selected country

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
    priceValueEl.textContent = pricing[country].gt21.price.toLocaleString(locale, {style: 'currency',currency: 'EUR'});;
    taxValueEl.textContent = pricing[country].gt21.tax.toLocaleString(locale, {style: 'currency',currency: 'EUR'});;
    return;
  }
  
  const startDateStr = startDateInput.value;
  const ageAtStart = getAgeAtStart(driverBirthdateStr, startDateStr);
  let price = pricing[country].gt21.price;
  let taxPrice =  pricing[country].gt21.tax;
  if (ageAtStart < 21) {
    price = pricing[country].lt21.price;
    taxPrice =  pricing[country].lt21.tax;
    $(".info-message").show(250);
  } else {
    $(".info-message").hide(250);
  }
  priceValueEl.textContent = price.toLocaleString(locale, {
    style: 'currency',
    currency: 'EUR'
  });
  taxValueEl.textContent = taxPrice.toLocaleString(locale, {
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

  // --- Collect Common Data ---
  const formData = new FormData(this);

  const model = formData.get("model");
  const vin = formData.get("vin") ? formData.get("vin").trim() : "";
  const vrn = formData.get("vrn") ? formData.get("vrn").trim() : "";
  const driverBirthdate = formData.get("driverBirthdate");
  const policyCancelled = formData.get("policyCancelled");

  let claims = formData.get("claims"); // Will be processed later
  
  const isCompany = formData.get("isCompany");
  const companyName = (isCompany === "yes" && formData.get("companyName")) ? formData.get("companyName").trim() : "";
  const companyNumber = (isCompany === "yes" && formData.get("companyNumber")) ? formData.get("companyNumber").trim() : "";

  const firstName = formData.get("firstName").trim();
  const lastName = formData.get("lastName").trim();
  const policyholderBirthdate = formData.get("policyholderBirthdate");
  const email = formData.get("email").trim();
  const phone = formData.get("phone").trim();
  const street = formData.get("street").trim();
  const houseNumber = " ";
  const city = formData.get("city") ? formData.get("city").trim() : "";
  const zip = formData.get("zip") ? formData.get("zip").trim() : "";
  
  const setStart = $("#setStartDateNow").is(":checked");
  const startDate = setStart ? formData.get("startDate") : "";

  // --- Country-Specific Data Collection ---
  let diplomaticCar, interchangeableLicensePlate; // AT specific
  let /*conditionAtPurchase,*/ firstRegistrationDate, policyholderRegistrationDate, /*carIsReadyToBeRegistred,*/ registeredCar, sfClassTpl, sfClassMod, previousInsurerName, previousInsurerReference, previousInsurerVRN; // DE specific

  if (country === "AT") {
      diplomaticCar = formData.get("diplomaticCar");
      interchangeableLicensePlate = formData.get("interchangeableLicensePlate");
  } else if (country === "DE") {
      //conditionAtPurchase = formData.get("conditionAtPurchase");
      firstRegistrationDate = formData.get("firstRegistrationDate");
      policyholderRegistrationDate = formData.get("policyholderRegistrationDate");
      previousInsurerName = formData.get("previousInsurerName");
      console.log('formData.get("previousInsurerName")');
      console.log(formData.get("previousInsurerName"));
      console.log(previousInsurerName);
      previousInsurerReference = formData.get("previousInsurerReference");
      previousInsurerVRN = formData.get("previousInsurerVRN");

      // Ensure boolean conversion for radio button values like "true"/"false"
      /*const carIsReadyVal = formData.get("carIsReadyToBeRegistred");
      carIsReadyToBeRegistred = carIsReadyVal === "true";*/

      const registeredCarVal = formData.get("registeredCar");
      registeredCar = registeredCarVal === "true";

      sfClassTpl = formData.get("sfClassTpl");
      sfClassMod = formData.get("sfClassMod");
  }
  
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
  if (country === "AT") {
      if (!/^\d{4}$/.test(zip)) {
          $("#message").html('<p class="error">Bitte geben Sie eine gültige österreichische Postleitzahl (4 Ziffern) ein.</p>');
          $("#loadingOverlay").hide(); return;
      }
      if (diplomaticCar === "yes") {
          $("#message").html('<p class="error">Anträge für Diplomatenfahrzeuge können nicht bearbeitet werden.</p>');
          $("#loadingOverlay").hide(); return;
      }
      if (interchangeableLicensePlate === "yes") {
          $("#message").html('<p class="error">Anträge für Wechselkennzeichen sind nicht zulässig.</p>');
          $("#loadingOverlay").hide(); return;
      }
  } else if (country === "DE") {
      if (!/^\d{5}$/.test(zip)) {
          $("#message").html('<p class="error">Bitte geben Sie eine gültige deutsche Postleitzahl (5 Ziffern) ein.</p>');
          $("#loadingOverlay").hide(); return;
      }
      // Add DE specific validations, e.g., for SF classes if they are mandatory and not empty
      if (!sfClassTpl) {
           $("#message").html('<p class="error">Bitte wählen Sie eine SF-Klasse TPL.</p>');
           $("#loadingOverlay").hide(); return;
      }
      if (!sfClassMod) {
           $("#message").html('<p class="error">Bitte wählen Sie eine SF-Klasse MOD.</p>');
           $("#loadingOverlay").hide(); return;
      }
  }
  
  if (!vin) {
    $("#message").html('<p class="warning">Wir haben Ihnen das Angebot per E-Mail zugesendet. Für den Abschluss des Versicherungsvertrags benötigen wir jedoch noch Ihre Fahrzeug-Identifikationsnummer (FIN). Bitte reichen Sie diese nach, damit wir den Prozess fortsetzen können.</p>');
    //$("#loadingOverlay").hide();
    //return;
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
    country: country,
    language: language,
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
        atFaultClaimsLast3Years: claims
      }
    },
    metadata:{
    	//terms: "acceptance,important,eligibility,general,interchangeablePlate",
      lastStepUrl: (domain == "webflow.io") ? "http://microlino-aa147b.webflow.io/subscription?" : "http://microlino-insurance.qover.com/subscription?"
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

  // Add country-specific fields to payload.subject and payload.subject.underwriting
  if (country === "AT") {
      payload.subject.underwriting.diplomaticCar = diplomaticCar === "yes";
      payload.subject.underwriting.interchangeableLicensePlate = interchangeableLicensePlate === "yes";
  } else if (country === "DE") {
      //payload.subject.conditionAtPurchase = conditionAtPurchase;
      payload.subject.firstRegistrationDate = firstRegistrationDate;
      payload.subject.policyholderRegistrationDate = policyholderRegistrationDate;
      //payload.subject.carIsReadyToBeRegistred = carIsReadyToBeRegistred;
      payload.subject.registeredCar = registeredCar;
      payload.subject.underwriting.bonusMalusTpl = sfClassTpl;
      payload.subject.underwriting.bonusMalusOmium = sfClassMod;
      payload.subject.previousInsurer = {};
      payload.subject.previousInsurer.insurerName = previousInsurerName;
      payload.subject.previousInsurer.reference = previousInsurerReference;
      payload.subject.previousInsurer.vrn = previousInsurerVRN;
  }

  // Dynamically build metadata.terms
  const checkedTerms = [];
  $('.legal-block input[type="checkbox"]:checked').each(function() {
      const termIdentifier = $(this).data('name') || $(this).attr('name'); // Prefer data-name
      if (termIdentifier) {
          checkedTerms.push(termIdentifier.replace(/de_terms_/g, '')); // Clean up prefix if needed
      }
  });
  payload.metadata.terms = checkedTerms.join(',');

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

  console.log("Final Payload:", JSON.stringify(payload, null, 2)); // For debugging


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
        console.log("appId sbx: ", appId.sbx[country]);
        console.log("appId prd: ", appId.prd[country]);
        if(domain == "webflow.io"){
           var redirectUrl1 = "https://appqoverme-ui.sbx.qover.io/payout/pay";
           var redirectUrl2 = "?locale="+locale+"&id=" + response.payload.id + "&appId="+appId.sbx[country];
        } else {
         var redirectUrl1 = "https://app.qover.com/payout/pay";
         var redirectUrl2 = "?locale="+locale+"&id=" + response.payload.id + "&appId=iw702hil7q0ejwxkt23hdya8";
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