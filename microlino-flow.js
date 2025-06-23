console.log("20250623 vin validation")

const appId = {
  sbx: {
    DE: "egf710aj4kzoe1ikycy8ddrl",
    AT: "q809unxlpt18fzf20zgb9vqu"
  },
  prd: {
    DE: "emnyw0tvs3fkqyfb8ah58qvj",
    AT: "iw702hil7q0ejwxkt23hdya8"
  }
}

//define which SF values don't need previous insurer object
const sfValuesNoPrevInsurerNeeded = ['SF0', 'NoSFClass', ''];

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
  "subject.underwriting.birthdateYoungestDriver": "driverBirthdate",
  "subject.firstRegistrationDate": "firstRegistrationDate",
  "subject.policyholderRegistrationDate": "policyholderRegistrationDate",
  "subject.underwriting.bonusMalusTpl": "sfClassTpl",
  "subject.underwriting.bonusMalusOmium": "sfClassMod"
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
      $("input[name='firstRegistrationDate']").val("06/2025");
      $("[data-hidden-field-id='firstRegistrationDate']").val("06/2025");
      $("input[name='policyholderRegistrationDate']").val("06/2025");
      $("[data-hidden-field-id='policyholderRegistrationDate']").val("06/2025");
      
    } else {
      $("input[name='city']").val("Vienna");
      $("input[name='zip']").val("1234");
      $("input[name='diplomaticCar'][value='no']").prop("checked", true);
      $("input[name='interchangeableLicensePlate'][value='no']").prop("checked", true);
    }
    $("input[name='isCompany'][value='no']").prop("checked", true).trigger("change");
    //$("input[name='country']").val("AT");
    // Set as company for testing and prefill company fields.
    //$("input[name='isCompany'][value='yes']").prop("checked", true).trigger("change");
    //$("input[name='companyName']").val("Test Company");
    //$("input[name='companyNumber']").val("123456789");
    $("input[name='startDate']").val("2025-06-30");
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

  //if(urlParams.get("test") === "trueDE"){
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
                <label class="w-checkbox"><input type="checkbox" id="eligibility" name="eligibility" data-name="eligibility" class="w-checkbox-input" required><span class="w-form-label" for="eligibility">Ich bestätige, dass ich die Allgemeinen Versicherungsbedingungen der <a href="" data-document="terms-and-conditions-tpl" target="_blank">Kfz-Haftpflichtversicherung</a> und der <a href="" data-document="terms-and-conditions-mod" target="_blank">Kaskoversicherung</a> gelesen und akzeptiert habe, und bestätige, dass ich die Voraussetzungen für diese Versicherung erfülle. Ich bestätige ferner, dass ich keine andere Versicherung habe, die das gleiche versicherte Risiko abdeckt, und dass der Inhalt des gewählten Versicherungsvertrags meinen Anforderungen und Bedürfnissen entspricht. Weitere Informationen entnehmen Sie bitte dem Informationsblatt zu den Versicherungsprodukten für die <a href="" data-document="ipid-tpl" target="_blank">Kfz-Haftpflichtversicherung</a> und für die <a href="" data-document="ipid-mod" target="_blank">Kaskoversicherung</a>.</span></label>
                <label class="w-checkbox"><input type="checkbox" id="general" name="general" data-name="general" class="w-checkbox-input" required><span class="w-form-label" for="general">Ich stimme zu, dass der Versicherungsschutz vor Ablauf der Rücktrittsfrist beginnt.</span></label>
                <label class="w-checkbox"><input type="checkbox" id="privacy" name="privacy" data-name="privacy" class="w-checkbox-input" required><span class="w-form-label" for="privacy"> Ich habe die Datenschutzerklärung zur Kenntnis genommen und bin darüber informiert, dass meine persönlichen Daten gemäß dieser <a href="https://www.helvetia.com/ch/web/de/ueber-uns/kontakt/datenschutz.html" target="_blank">Datenschutzerklärung</a> verarbeitet werden. </span></label>
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
                    {
                        type: 'month-year', name: 'policyholderRegistrationDate', label: 'Zulassung auf Halter (I)',
                        placeholder: 'YYYY-MM',
                        //insertBefore: 'span.toggle-icon[data-confirm-vehicle]',
                        insertBefore: 'label[data-vehicle-vin]',
                        isRequired: '',
                        tooltip: 'Bitte tragen Sie das Datum ein, zu dem das Fahrzeug erstmals auf Sie oder den abweichenden Fahrzeughalter zugelassen wurde oder wann es voraussichtlich auf Sie angemeldet wird. Das Datum der aktuellen Zulassung finden Sie auf der Zulassungsbescheinigung unter Position I.'
                    },
                    {
                        type: 'month-year', name: 'firstRegistrationDate', label: 'Datum der Erstzulassung (B)',
                        placeholder: 'YYYY-MM',
                        //insertBefore: 'span.toggle-icon[data-confirm-vehicle]',
                        insertBefore: 'label[data-vehicle-vin]',
                        isRequired: '',
                        tooltip: 'An diesem Datum (Monat und Jahr) wurde Ihr Fahrzeug erstmals zum öffentlichen Verkehr zugelassen. Sie finden dieses in der Zulassungsbescheinigung Ihres Fahrzeugs (ehemals Fahrzeugschein) unter Position B.'
                    },
                    /*{
                        type: 'radio', name: 'carIsReadyToBeRegistred', label: 'Fahrzeug ist zulassungsfertig',
                        options: [{value: 'true', text: 'Ja'}, {value: 'false', text: 'Nein'}],
                        insertBefore: 'span.toggle-icon[data-confirm-vehicle]'
                    },*/
                    {
                        type: 'radio', name: 'registeredCar', label: 'Wofür benötigen Sie die Versicherung?',
                        options: [{value: 'false', text: '<strong>Neu erworbenes Fahrzeug</strong> zulassen und versichern <div class="tooltip-container"><span class="tooltip-icon">?</span><div class="tooltip-text">Die eVB (Elektronische Versicherungsbestätigung) zur Zulassung Ihres Fahrzeugs erhalten Sie direkt nach Antragsabschluss per E-Mail.</div></div>'}, {value: 'true', text: '<strong>Versicherung wechseln</strong> mit bereits auf mich versichertem Fahrzeug'}],
                        //insertBefore: 'span.toggle-icon[data-confirm-vehicle]',
                        insertBefore: 'label[data-vehicle-vin]',
                        isRequired: 'required',
                        explanation: 'Wenn Sie kürzlich ein Auto (entweder neu oder gebraucht) gekauft haben, das noch nicht auf Ihren Namen zugelassen ist, wählen Sie bitte die Option Neu erworbenes Fahrzeug. Wenn Sie ein bereits auf Sie zugelassenes, bestehendes Auto haben, wählen Sie bitte Versicherung wechseln.'
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
                        type: 'dropdown', name: 'previousInsurerId', label: 'Vorheriger Versicherer',
                        options: [
                            {"value": '', "text": 'n/a' },
                            {"value": "5586", "text": "\"Schweiz Allgemeine\" Direkt Vers. AG"},
                            {"value": "5447", "text": "\"Winterthur\" Schweizerische Vers.-Ges."},
                            {"value": "5483", "text": "\"Zürich\" Versicherungs-Gesellschaft, F rankfurt/M."},
                            {"value": "5480", "text": "(ehemals Württembergische und Badische Versicherungs-Aktiengesellschaft)"},
                            {"value": "5059", "text": "A&O Autoversicherung Oldenburg AG"},
                            {"value": "5135", "text": "ADAC Autoversicherung AG"},
                            {"value": "0028", "text": "Admiral Insurance Company Limited (AIC L)"},
                            {"value": "9053", "text": "Admiral Insurance Company Limited (AICL) c/o AdmiralDirekt"},
                            {"value": "5401", "text": "AdmiralDirekt Eine Marke der Itzehoer Versicherung"},
                            {"value": "5305", "text": "Agrippina Versicherung Aktiengesellschaft"},
                            {"value": "7066", "text": "AIG EUROPE (Netherlands) N.V."},
                            {"value": "5163", "text": "AIG Europe S.A., Direktion für Deutschland"},
                            {"value": "5206", "text": "AIG Europe S.A., Direktion für Deutschland Standort Heilbronn"},
                            {"value": "5029", "text": "Aioi Nissay Dowa Insurance Company of Europe SE Niederlassung Deutschland"},
                            {"value": "5306", "text": "Albingia Versicherungs-Aktiengesellschaft"},
                            {"value": "5312", "text": "Allianz Automotive - Stellantis Bank (ehem. PSA Bank)"},
                            {"value": "5441", "text": "Allianz Direct Versicherungs-AG"},
                            {"value": "5405", "text": "Alte Leipziger Versicherung AG"},
                            {"value": "5455", "text": "ARAG Allgemeine Versicherungs-AG"},
                            {"value": "7253", "text": "Assicurazioni Generali S.p.A."},
                            {"value": "5397", "text": "ASSTEL Sachversicherung Aktiengesellschaft"},
                            {"value": "5553", "text": "AUTO DIREKT Versicherungs-Aktiengesellschaft"},
                            {"value": "0007", "text": "Autoschadenausgleich Deutscher Gemeinden und Gemeindeverbände"},
                            {"value": "5132", "text": "Avetas Versicherungs-AG"},
                            {"value": "5052", "text": "AXA \"die Alternative\" Versicherung AG"},
                            {"value": "5155", "text": "AXA easy Versicherung AG"},
                            {"value": "5515", "text": "AXA Versicherung AG"},
                            {"value": "5593", "text": "Badische Allgemeine AG"},
                            {"value": "5316", "text": "Badischer Gemeinde-Versicherungs-Verband"},
                            {"value": "5633", "text": "Baloise Sachversicherung AG"},
                            {"value": "5317", "text": "Barmenia Versicherungen"},
                            {"value": "5318", "text": "Basler Versicherung AG, Direktion für Deutschland"},
                            {"value": "5787", "text": "BavariaDirekt Versicherung AG"},
                            {"value": "5325", "text": "Bayerische Versicherungsbank  Aktiengesellschaft"},
                            {"value": "0510", "text": "Bayerische Versicherungskammer / Bayer ischer Versicherungsverband"},
                            {"value": "5324", "text": "Bayerischer Versicherungsverband Versicherungsaktiengesellschaft"},
                            {"value": "5062", "text": "BERLIN-KÖLNISCHE Sachversicherung AG"},
                            {"value": "5146", "text": "BGV-Versicherung AG"},
                            {"value": "5333", "text": "BRUDERHILFE Sachversicherung auf Gegenseitigkeit"},
                            {"value": "7842", "text": "BTA Insurance Company SE"},
                            {"value": "7042", "text": "Chartis Europe S.A"},
                            {"value": "5595", "text": "Chartis EUROPE S.A., Direktion für Deutschland"},
                            {"value": "5902", "text": "Chubb European Group SE Direktion für Deutschland"},
                            {"value": "5142", "text": "CHUBB Insurance Company of Europe SE"},
                            {"value": "5487", "text": "CIGNA Insurance Company of Europe S.A. -N.V."},
                            {"value": "5338", "text": "Concordia Versicherungs-Gesellschaft auf Gegenseitigkeit"},
                            {"value": "5340", "text": "Continentale Sachversicherung AG Servicecenter Kraftfahrt"},
                            {"value": "5049", "text": "Cordial Versicherung AG"},
                            {"value": "5552", "text": "Cosmos Versicherung Aktiengesellschaft"},
                            {"value": "5529", "text": "D.A.S. Deutscher Automobil Schutz Versicherungs AG"},
                            {"value": "5343", "text": "DA Deutsche Allgemeine Versicherung AG"},
                            {"value": "5771", "text": "DARAG Deutschland AG"},
                            {"value": "5311", "text": "DBV Deutsche Beamten Versicherung AG"},
                            {"value": "5854", "text": "DBV-WinSelect Versicherung AG"},
                            {"value": "5037", "text": "DBV-Winterthur Versicherung AG"},
                            {"value": "5549", "text": "Debeka Allgemeine Versicherung AG"},
                            {"value": "5429", "text": "Delfin Direkt Versicherung"},
                            {"value": "5084", "text": "deutsche internet versicherung Servicecenter Kraftfahrt"},
                            {"value": "5188", "text": "Deutsche Niederlassung der Basler Versicherungen Luxemburg AG (FRI:DAY)"},
                            {"value": "5209", "text": "Deutsche Niederlassung der FRIDAY Insurance S.A."},
                            {"value": "5768", "text": "Deutsche Versicherungs-Aktiengesellschaft"},
                            {"value": "5347", "text": "Deutscher Herold Allgemeine Versicherung AG \"ADAC-AutoVersicherung \""},
                            {"value": "5349", "text": "Deutscher Lloyd Vers.-Actien-Ges."},
                            {"value": "5350", "text": "DEUTSCHER RING Sachversicherungs-AG"},
                            {"value": "0008", "text": "Deutsches Büro Grüne Karte e. V."},
                            {"value": "5513", "text": "DEVK Allgem. Versicherungs-AG"},
                            {"value": "5344", "text": "DEVK Deutsche Eisenbahn Versicherung Sach- u. HUK-Versicherungsverein a. G. Betriebliche Sozialeinrichtung der Deutschen Bahn"},
                            {"value": "5210", "text": "Dialog Versicherung AG"},
                            {"value": "5858", "text": "EMIL Deutschland für Gothaer Allgemeine Versicherung AG"},
                            {"value": "5472", "text": "Ergo Mobility Solutions"},
                            {"value": "5562", "text": "ERGO Mobility Solutions"},
                            {"value": "7641", "text": "Euro Insurances dac c/o Van Ameyde Germany AG Maarweg-Center"},
                            {"value": "5508", "text": "EUROPA Versicherung Aktiengesellschaft EUROPA-go Servicecenter Kraftfahrt"},
                            {"value": "5470", "text": "Fahrlehrerversicherung Verein auf Gegenseitigkeit"},
                            {"value": "5359", "text": "Feuersozietät Berlin Brandenburg"},
                            {"value": "5024", "text": "Feuersozietät Berlin Brandenburg Versicherung Aktiengesellschaft"},
                            {"value": "5364", "text": "Frankfurter Versicherungs-Aktiengesellschaft"},
                            {"value": "5033", "text": "freeyou AG Ein Vertriebspartner der GAV Vers.-AG (online-Vertrieb)"},
                            {"value": "5310", "text": "FRESH Insurance Services GmbH"},
                            {"value": "5505", "text": "GARANTA Versicherungs-AG"},
                            {"value": "5736", "text": "General Accident fire and Life"},
                            {"value": "7039", "text": "GENERALI Assicurazioni Generali S.p.A."},
                            {"value": "5345", "text": "Generali Deutschland Versicherung AG"},
                            {"value": "5342", "text": "Generali Deutschland Versicherung AG (ehem. Volksfürsorge Deutsche Sachversicherung AG)"},
                            {"value": "5599", "text": "Generali Lloyd Versicherung AG"},
                            {"value": "5368", "text": "Gerling-Konzern Allgemeine Versicherungs-Gesellschaft"},
                            {"value": "8609", "text": "GHV DARMSTADT Gemeinnützige Haftpflicht-Versicherungsanstalt Darmstadt"},
                            {"value": "0523", "text": "GHV Gemeinnützige Haftpflicht-Versicherungsanstalt Anstalt des öffentlichen Rechts"},
                            {"value": "5531", "text": "Gothaer Allgemeine Versicherung Aktiengesellschaft"},
                            {"value": "5372", "text": "Gothaer Versicherungsbank VvaG"},
                            {"value": "9369", "text": "Greenval Insurance DAC 2nd Floor, The Anchorage,"},
                            {"value": "5365", "text": "GVO Gegenseitigkeit Versicherung Oldenburg VVaG"},
                            {"value": "5585", "text": "GVV Direktversicherung AG"},
                            {"value": "5469", "text": "GVV Kommunalversicherung VVaG"},
                            {"value": "0001", "text": "Haftpflichtgemeinschaft Deutscher Nahverkehrs- und Versorgungs-unternehmen"},
                            {"value": "5044", "text": "Haftpflichtgemeinschaft Deutscher Nahverkehrs- und Versorgungsunternehme Allgemein (HDNA) VVaG"},
                            {"value": "0004", "text": "Haftpflichtschadenausgleich der Deutschen Großstädte (HADG)"},
                            {"value": "0002", "text": "Haftpflichtverband öffentlicher Verkehrsbetriebe"},
                            {"value": "8612", "text": "Haftpflichtversicherungsanstalt Braunschweig"},
                            {"value": "5420", "text": "Hamburg-Mannheimer Sachversicherungs-AG"},
                            {"value": "5032", "text": "Hamburger Feuerkasse Versicherungs-AG"},
                            {"value": "5383", "text": "Hamburger Phönix früher Gaedesche Vers .-AG"},
                            {"value": "5512", "text": "Hannover Allgemeine Vers. AG"},
                            {"value": "5131", "text": "Hannoversche Direktversicherung AG"},
                            {"value": "5501", "text": "HanseMerkur Allgemeine Versicherung AG"},
                            {"value": "5096", "text": "HDI Global SE"},
                            {"value": "5377", "text": "HDI Haftpflichtverband der Deutschen Industrie"},
                            {"value": "7997", "text": "Helvetia Global Solutions Ltd"},
                            {"value": "5384", "text": "Helvetia Schweizerische Versicherungsgesellschaft AG Filialdirektion"},
                            {"value": "5448", "text": "Helvetia Versicherungs-AG ehemals: Schweizer-National Versicherungs-AG in Deutschland"},
                            {"value": "5079", "text": "HISCOX SA Niederlassung für Deutschland"},
                            {"value": "5214", "text": "Hiscox SA Niederlassung für Deutschland"},
                            {"value": "5375", "text": "HUK-COBURG Haftpflicht-Unterstützungs-Kasse kraftfahrender Beamter Deutschlands a.G. in Coburg"},
                            {"value": "5521", "text": "HUK-COBURG-Allgemeine Versicherung AG"},
                            {"value": "5086", "text": "HUK24 AG"},
                            {"value": "7970", "text": "InShared eine Marke der Achmea Schadeverzekeringen N.V."},
                            {"value": "5584", "text": "INTERUNFALL Allgem. Versicherungs-AG"},
                            {"value": "5225", "text": "iptiQ EMEA P&C S.A. Niederlassung Deutschland"},
                            {"value": "5078", "text": "Janitos Versicherung AG"},
                            {"value": "5509", "text": "Karlsruher Versicherung AG"},
                            {"value": "5570", "text": "Karlsruher Versicherung AG (ehem. Karlsruher Beamten Versicherung AG)"},
                            {"value": "5550", "text": "Kraft Versicherungs-Aktiengesellschaft"},
                            {"value": "5058", "text": "KRAVAG-ALLGEMEINE Versicherungs-Aktiengesellschaft c/o R+V Allgemeine Versicherung AG"},
                            {"value": "5080", "text": "KRAVAG-LOGISTIC Versicherungs-AG c/o R+V Allgemeine Versicherung AG"},
                            {"value": "5399", "text": "KRAVAG-SACH Versicherung"},
                            {"value": "0010", "text": "KSA Kommunaler Schadenausgleich der Länder Brandenburg, Mecklenburg-Vorpommern, Sachsen, Sachsen-Anhalt und Thüringen"},
                            {"value": "0006", "text": "KSA Kommunaler Schadenausgleich Schleswig-Holstein"},
                            {"value": "0003", "text": "KSA Kommunaler Schadenausgleich westdeutscher Städte"},
                            {"value": "7067", "text": "LA CONCORDE S.A."},
                            {"value": "5362", "text": "Landesschadenhilfe Versicherung VaG"},
                            {"value": "0505", "text": "Lippische Landes-Brandversicherungsanstalt"},
                            {"value": "5232", "text": "Lippische Landesbrandversicherung AG"},
                            {"value": "5215", "text": "Lloyd's Insurance Company S.A., Niederlassung für Deutschland"},
                            {"value": "5402", "text": "LVM Landwirtschaftlicher Versicherungsverein Münster a.G."},
                            {"value": "5409", "text": "Magdeburger Versicherung AG"},
                            {"value": "5411", "text": "Mannheimer Versicherung AG"},
                            {"value": "5061", "text": "Mannheimer Versicherung Aktiengesellschaft"},
                            {"value": "5412", "text": "Mecklenburgische Versicherungs-Gesellschaft a.G. Direktion Hannover"},
                            {"value": "7287", "text": "MMA IARD Assurances Mutuelles"},
                            {"value": "5414", "text": "Münchener Verein Allgemeine Versicherungs-AG"},
                            {"value": "5548", "text": "NECKURA Allgemeine Versicherungs-AG"},
                            {"value": "5793", "text": "NECKURA Versicherungs-Aktiengesellschaft"},
                            {"value": "5241", "text": "Neodigital Autoversicherung AG"},
                            {"value": "5207", "text": "Neodigital Versicherung AG"},
                            {"value": "5070", "text": "Nexible GmbH"},
                            {"value": "5421", "text": "NORDSTERN Allgemeine Versicherungs-AG"},
                            {"value": "5426", "text": "NÜRNBERGER Allgemeine Versicherungs-AG"},
                            {"value": "5686", "text": "NÜRNBERGER Beamten Allgemeine Versicherung AG"},
                            {"value": "0522", "text": "Öffentliche Feuerversicherung Sachsen-Anhalt"},
                            {"value": "0501", "text": "Öffentliche Sachversicherung Braunschweig"},
                            {"value": "0521", "text": "Öffentliche Versicherung Oldenburg"},
                            {"value": "0506", "text": "Oldenburgische Landesbrandkasse"},
                            {"value": "5791", "text": "ONTOS Versicherung AG"},
                            {"value": "5519", "text": "Optima Versicherungs-AG"},
                            {"value": "5543", "text": "ÖVA Allgemeine Versicherungs-AG"},
                            {"value": "5432", "text": "Patria Versicherung Aktiengesellschaft"},
                            {"value": "5777", "text": "PRO DIREKT Vers. AG"},
                            {"value": "7455", "text": "Probus Insurance Company Europe DAC Hertz Europe Service Centre"},
                            {"value": "5446", "text": "Provinzial Nord Brandkasse Aktiengesellschaft"},
                            {"value": "5093", "text": "Provinzial Versicherung AG (ehemals Westfälische Provinzial Versicherung AG Die Versicherung der Sparkassen)"},
                            {"value": "5095", "text": "Provinzial Versicherung AG Standort Münster"},
                            {"value": "5436", "text": "Provinzial-Feuerversicherungsanstalt der Rheinprovinz"},
                            {"value": "5120", "text": "QBE Insurance (Europe) Limited, Direktion für Deutschland, Düsseldorf"},
                            {"value": "5438", "text": "R+V Allgemeine Versicherung AG"},
                            {"value": "5339", "text": "R+V Allgemeine Versicherung AG (ehemals Condor)"},
                            {"value": "5137", "text": "R+V Direktversicherung Kraftfahrt Betrieb"},
                            {"value": "5798", "text": "RheinLand Versicherungs AG"},
                            {"value": "5121", "text": "Rhion Versicherung AG"},
                            {"value": "5773", "text": "Saarland Feuerversicherung AG"},
                            {"value": "5440", "text": "SAVAG Saarbrücker Versicherungs-AG"},
                            {"value": "5690", "text": "SCHWARZMEER UND OSTSEE Versicherungs-AG SOVAG"},
                            {"value": "5450", "text": "SECURITAS Bremer Allgemeine Versicherungs-AG"},
                            {"value": "5607", "text": "Sicher Direct Versicherung AG"},
                            {"value": "5451", "text": "SIGNAL IDUNA Unfallversicherung a.G."},
                            {"value": "9460", "text": "Sofinsod Insurance dac c/o Broadspire by Crawford & Company (Deutschland) GmbH"},
                            {"value": "5051", "text": "Sparkassen DirektVersicherung AG"},
                            {"value": "5482", "text": "Sparkassen-Versicherung Allgemeine Vers. AG"},
                            {"value": "5781", "text": "Sparkassen-Versicherung Sachsen Allgemeine Versicherung AG"},
                            {"value": "5565", "text": "Sun Alliance und London Insurance"},
                            {"value": "5075", "text": "Sun Direct Versicherungs-AG"},
                            {"value": "5036", "text": "SV SparkassenVersicherung Gebäudeversicherung AG"},
                            {"value": "5385", "text": "SV SparkassenVersicherung öffentliche Versicherungsanstalt Hessen-Nassau-Thü"},
                            {"value": "5776", "text": "telcon Allgemeine Versicherung AG"},
                            {"value": "5795", "text": "Tellit Direkt Versicherung AG"},
                            {"value": "5551", "text": "The Chiyoda Fire and Marine Insurance Co."},
                            {"value": "5572", "text": "The Continental Insurance Co."},
                            {"value": "5456", "text": "Thuringia Generali Versicherung AG"},
                            {"value": "5458", "text": "Transatlantische Vers.-AG"},
                            {"value": "9281", "text": "TVM zakelijk N.V."},
                            {"value": "5442", "text": "UAP International Allgem. Vers.-AG, Saarbrücken"},
                            {"value": "5463", "text": "uniVersa Allgemeine Versicherung AG"},
                            {"value": "7754", "text": "UPS International Insurance dac c/o Marsh Management Services Limited"},
                            {"value": "7259", "text": "USAA Limited Frankfurt Claims Branch Niederlassung der USAA Limited UK für Deutschland"},
                            {"value": "9524", "text": "USAA S.A."},
                            {"value": "5462", "text": "USAA United Services Automobile Association Direktion für Deutschland"},
                            {"value": "7258", "text": "VAV Versicherung für die Bauwirtschaft Allgemeine Versicherungs-AG c/o AKO Versicherungsmakler GmbH&Co. K"},
                            {"value": "5125", "text": "VdK Versicherung der Kraftfahrt Zweigniederlassung der SIGNAL IDUNA Allgemeine Versicherung AG"},
                            {"value": "5464", "text": "Vereinigte Haftpflichtversicherung V.a .G."},
                            {"value": "5327", "text": "Vereinte Versicherung AG"},
                            {"value": "5098", "text": "Versicherer im Raum der Kirchen Sachversicherung AG"},
                            {"value": "5042", "text": "Versicherungskammer Bayern Versicherungsanstalt des öffentlichen Rechts"},
                            {"value": "5055", "text": "Verti Versicherung AG"},
                            {"value": "5400", "text": "VGH Landschaftliche Brandkasse Hannover Lampe und Schwartze KG"},
                            {"value": "5862", "text": "VHV Allgemeine Versicherung AG"},
                            {"value": "5598", "text": "VHV Autoversicherungs-AG"},
                            {"value": "5514", "text": "VÖDAG Versicherung"},
                            {"value": "5581", "text": "VÖDAG Versicherung für den öffentlichen Dienst Zweigniederlassung der ADLER Versicherung AG"},
                            {"value": "5473", "text": "Volksfürsorge Deutsche Sachversicherung AG"},
                            {"value": "5169", "text": "Volkswagen Autoversicherung AG"},
                            {"value": "5484", "text": "VOLKSWOHL-BUND Sachversicherung AG"},
                            {"value": "5085", "text": "VOLVO Auto Versicherung HDI Versicherung AG"},
                            {"value": "5468", "text": "VVDE Versicherungsverband Deutscher Eisenbahnen VVaG"},
                            {"value": "9496", "text": "wefox Insurance AG Niederlassung Deutschland"},
                            {"value": "0509", "text": "Westfälische Provinzial-Feuersozietät"},
                            {"value": "5525", "text": "WGV-Versicherung AG"},
                            {"value": "5060", "text": "Winterthur International (Deutschland) Versicherung Aktiengesellschaft"},
                            {"value": "5479", "text": "Württembergische Gemeinde-Versicherung a.G."},
                            {"value": "5783", "text": "Württembergische Versicherung AG Servicebereich Leipzig"},
                            {"value": "5476", "text": "WWK Allgemeine Versicherung AG"},
                            {"value": "5088", "text": "XL Insurance Company SE Direktion für Deutschland"},
                            {"value": "5481", "text": "Zenith Versicherung Aktiengesellschaft"},
                            {"value": "5151", "text": "Zurich Insurance Europe AG Niederlassung für Deutschland Zurich Kunden Service"},
                            {"value": "5050", "text": "Zürich Versicherungs-Aktiengesellschaft"}
                        ],
                        insertBefore: 'span.toggle-icon[data-confirm-underwriting]'
                    },
                    {
                        type: 'dropdown', name: 'sfClassMod', label: 'SF-Klasse Kaskoversicherung',
                        options: [
                          { value: '', text: 'Bitte wählen' },
                          { value: 'NoSFClass', text: 'Keine SF-Klasse vorhanden' },
                          { value: 'SF0', text: 'SF 0 (Anfänger)' },
                          { value: 'SFM', text: 'SF M (Malusklasse)' },
                          //{ value: 'S', text: 'SF S (Nach Rückstufung)' }, not supported with current enum
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
                        type: 'dropdown', name: 'sfClassTpl', label: 'SF-Klasse Kfz-Haftpflichtversicherung',
                        options: [
                            { value: '', text: 'Bitte wählen' },
                            { value: 'NoSFClass', text: 'Keine SF-Klasse vorhanden' },
                            { value: 'SF0', text: 'SF 0 (Anfänger)' },
                            { value: 'SFM', text: 'SF M (Malusklasse)' },
                            //{ value: 'S', text: 'SF S (Nach Rückstufung)' }, not supported with current enum
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
                        explanation: 'Bitte beachten Sie, dass Ihre SF-Klasse (Schadenfreiheitsklasse) keinen Einfluss auf die Berechnung Ihrer Versicherungsprämie hat. Wir erfassen diese Information ausschließlich zur Dokumentation der Schadenhistorie.',
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
        let html = `<div class="js-dynamic-field js-de-field"  id="div-${item.name}">`; // Mark as dynamic and DE-specific
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
                html += `<label><input class="radio-circle" type="radio" name="${item.name}" value="${opt.value}" ${item.isRequired}> ${opt.text}</label>`;
            });
            html += `</div>`;
        } else if (item.type === 'date') {
            html += `<input class="field date w-input" type="date" name="${item.name}" placeholder="${item.placeholder || ''}" ${item.isRequired}>`;
        } else if (item.type === 'text') {
            html += `<input class="field date w-input" type="text" name="${item.name}" placeholder="${item.placeholder || ''}" ${item.isRequired}>`;
        } else if (item.type === 'month-year') {
          // This creates two inputs: a visible one for the user and a hidden one for the form data.
          // The 'updateMonthYearField' function (defined below) is required for this to work.
          
          // 1. The visible text input for the user (MM/YYYY). It has no 'name' attribute.
          html += `<input class="field w-input" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #ccc;" 
              type="text" 
              placeholder="MM/YYYY" 
              maxlength="7" 
              pattern="^(0[1-9]|1[0-2])\/([0-9]{4})$"
              onkeyup="updateMonthYearField(event)"
              onchange="updateMonthYearField(event)"
              data-hidden-field-id="${item.name}"
              title="Please enter the date in MM/YYYY format."
              >`;

          // 2. The hidden input that stores the formatted date (YYYY-MM-01) for submission.
          html += `<input type="hidden" id="${item.name}" name="${item.name}" ${item.isRequired}>`;
      
        } else if (item.type === 'dropdown') {
            html += `<select class="field" name="${item.name}" id="${item.name}" ${item.isRequired}>`;
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
            $('input[name="registeredOwnercountry"]').val(config.policyholder.country);
            const $cityInput = $('input[name="city"]');
            $cityInput.attr('placeholder', config.policyholder.cityPlaceholder);
            const $registeredOwnercity = $('input[name="registeredOwnercity"]');
            $registeredOwnercity.attr('placeholder', config.policyholder.cityPlaceholder);

            const $zipInput = $('input[name="zip"]');
            $zipInput.attr('placeholder', config.policyholder.zipPlaceholder);
            $zipInput.attr('pattern', config.policyholder.zipPattern);
            $zipInput.attr('maxlength', config.policyholder.zipMaxlength);
            const $registeredOwnerzip = $('input[name="registeredOwnerzip"]');
            $registeredOwnerzip.attr('placeholder', config.policyholder.zipPlaceholder);
            $registeredOwnerzip.attr('pattern', config.policyholder.zipPattern);
            $registeredOwnerzip.attr('maxlength', config.policyholder.zipMaxlength);
        }

        //6. Update content
        if(country == "DE"){
          $('[data-startDate-explanation]').text('Zulassungsdatum noch unsicher? Kein Problem. Wählen Sie einfach das heutige Datum aus. Ihr Versicherungsschutz startet dann automatisch am Tag der tatsächlichen Zulassung.');
          $('[data-driverInfo-minAge]').text('Für den Microlino LITE beträgt das Mindestalter 15 Jahre, für den Microlino Edition 18 Jahre.');
        }


        // Simple collapsible functionality (if you want to keep it)
        $('.collapsible').off('click').on('click', function() {
            $(this).next('.section-content').slideToggle();
        }).first().next('.section-content').show(); // Open first section by default

        // Toggle company fields
        $('input[name="isCompany"]').off('change').on('change', function() {
          if (this.value === 'yes') {
            $('#companyFields').slideDown(function() {
              $(this).css('display', 'flex');
            });
          } else {
            $('#companyFields').slideUp(); // slideUp will set display to none at the end
          }
        });
        $('#companyFields').slideUp();

        if(country == "AT"){
          $("#registeredOwnerSection").remove();
        } else {
          $('input[name="policyholderIsRegisteredOwner"]').off('change').on('change', function() {
              console.log("policyholderIsRegisteredOwner ", this.value)
              if (this.value == 'false') {
                $('.registeredOwnerSectionForm').slideDown(function() {
                  $(this).css('display', 'block');
                });
              } else {
                $('.registeredOwnerSectionForm').slideUp();
              }
          });
          $('.registeredOwnerSectionForm').slideUp();

          $('input[name="registeredCar"]').off('change').on('change', function() {
            console.log("registeredCar ", this.value)
            if (this.value == 'true') {
              $('#div-policyholderRegistrationDate').slideDown(function() {
                $(this).css('display', 'block');
              });
            } else {
              $('#div-policyholderRegistrationDate').slideUp();
            }
          });
          $('#div-policyholderRegistrationDate').slideUp();

          $('input[name="registeredOwnerisCompany"]').off('change').on('change', function() {
              if (this.value === 'yes') {
                $('#registeredOwnercompanyFields').slideDown(function() {
                  $(this).css('display', 'flex');
                });
              } else {
                $('#registeredOwnercompanyFields').slideUp();
              }
          });
          $('#registeredOwnercompanyFields').slideUp();
        }
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
          const previousInsurerFieldContainer = $('select[name="previousInsurerId"]').closest('.js-dynamic-field');
          const previousInsurerVRNFieldContainer = $('input[name="previousInsurerVRN"]').closest('.js-dynamic-field');
          const previousInsurerReferenceFieldContainer = $('input[name="previousInsurerReference"]').closest('.js-dynamic-field');

          const previousInsurerSelect = $('#previousInsurerId');
          const previousInsurerVRNInput = $('[name="previousInsurerVRN"]')
          const previousInsurerReferenceInput = $('[name="previousInsurerReference"]');

          function togglePreviousInsurerFields() {
              const tplValue = sfTplSelect.val();
              const modValue = sfModSelect.val();
              if (sfValuesNoPrevInsurerNeeded.includes(tplValue) && sfValuesNoPrevInsurerNeeded.includes(modValue)) {
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
                      previousInsurerVRNInput.prop('required', true);
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

  //}
  console.log("locale before translateAll ", locale);
  translateAll(locale);
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
  let firstRegistrationDate, policyholderRegistrationDate, registeredCar, sfClassTpl, sfClassMod, previousInsurerId, previousInsurerReference, previousInsurerVRN, policyholderIsRegisteredOwner, registeredOwnerisCompany, registeredOwnerfirstName, registeredOwnerlastName, registeredOwnerstreet, registeredOwnerzip, registeredOwnercity, registeredOwnercountry; //DE specific
  if (country === "AT") {
      diplomaticCar = formData.get("diplomaticCar");
      interchangeableLicensePlate = formData.get("interchangeableLicensePlate");
  } else if (country === "DE") {
      //conditionAtPurchase = formData.get("conditionAtPurchase");
      firstRegistrationDate = formData.get("firstRegistrationDate");
      policyholderRegistrationDate = formData.get("policyholderRegistrationDate");
      previousInsurerId = formData.get("previousInsurerId");
      previousInsurerReference = formData.get("previousInsurerReference");
      previousInsurerVRN = formData.get("previousInsurerVRN");
      
      policyholderIsRegisteredOwnerVal = formData.get("policyholderIsRegisteredOwner");
      policyholderIsRegisteredOwner = policyholderIsRegisteredOwnerVal === "true"

      if(policyholderIsRegisteredOwner === false){
        registeredOwnerisCompany= formData.get("registeredOwnerisCompany");
        registeredOwnerfirstName = formData.get("registeredOwnerfirstName");
        registeredOwnerlastName = formData.get("registeredOwnerlastName");
        registeredOwnerstreet = formData.get("registeredOwnerstreet");
        registeredOwnerzip = formData.get("registeredOwnerzip");
        registeredOwnercity = formData.get("registeredOwnercity");
        registeredOwnercountry = formData.get("registeredOwnercountry");
      }
      

      // Ensure boolean conversion for radio button values like "true"/"false"
      /*const carIsReadyVal = formData.get("carIsReadyToBeRegistred");
      carIsReadyToBeRegistred = carIsReadyVal === "true";*/

      const registeredCarVal = formData.get("registeredCar");
      registeredCar = registeredCarVal === "true";

      sfClassTpl = formData.get("sfClassTpl");
      sfClassMod = formData.get("sfClassMod");
  }
  
  // If start date is to be set, validate it.
  // A standard regex for email validation
  const emailPattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  if (!email || !emailPattern.test(email)) {
    $("#message").html('<p class="error">Bitte geben Sie eine gültige E-Mail-Adresse ein.</p>');
    $("#loadingOverlay").hide();
    return;
  }

  if(setStart) {
    if (!startDate) {
      $("#message").html('<p class="error">Bitte wählen Sie ein Startdatum.</p>');
      $("#loadingOverlay").hide();
      return;
    }

    if (vin && vin.length !== 17) {
      $("#message").html('<p class="error">Die Fahrgestellnummer (VIN) muss genau 17 Zeichen lang sein.</p>');
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
      const ageAtStart = getAgeAtStart(driverBirthdate, startDate);
      if (model === "edition" && ageAtStart < 17) {
        $("#message").html('<p class="error">Für den Microlino EDITION muss der jüngste Fahrer mindestens 17 Jahre alt sein.</p>');
        $("#loadingOverlay").hide();
        return;
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
      if(registeredCar && vrn === ""){
        $("#message").html('<p class="error">Wenn Sie die Option "Versicherung wechseln mit bereits auf mich versichertem Fahrzeug" wählen, geben Sie bitte das Kennzeichen des Fahrzeugs an.</p>');
        $("#loadingOverlay").hide(); return;
      }
      const ageAtStart = getAgeAtStart(driverBirthdate, startDate);
      if (model === "edition" && ageAtStart < 18) {
        $("#message").html('<p class="error">Für den Microlino EDITION muss der jüngste Fahrer mindestens 18 Jahre alt sein.</p>');
        $("#loadingOverlay").hide();
        return;
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
      payload.subject.firstRegistrationDate = firstRegistrationDate;
      payload.subject.policyholderRegistrationDate = policyholderRegistrationDate;
      payload.subject.registeredCar = registeredCar;
      payload.subject.underwriting.bonusMalusTpl = sfClassTpl;
      payload.subject.underwriting.bonusMalusOmium = sfClassMod;
      if (!sfValuesNoPrevInsurerNeeded.includes(sfClassTpl) || !sfValuesNoPrevInsurerNeeded.includes(sfClassMod)) {
        payload.subject.previousInsurer = {
          insurerId: previousInsurerId,
          reference: previousInsurerReference,
          vrn: previousInsurerVRN,
        };
      }
      
      payload.subject.policyholderIsRegisteredOwner = policyholderIsRegisteredOwner;
      if (policyholderIsRegisteredOwner === false) {
      payload.subject.registeredOwner = {
          entityType: (registeredOwnerisCompany === "yes") ? "ENTITY_TYPE_COMPANY" : "ENTITY_TYPE_PERSON",
          firstName: registeredOwnerfirstName,
          lastName: registeredOwnerlastName,
          address: {
            street: registeredOwnerstreet,
            number: ' ',
            postalCode: registeredOwnerzip,
            city: registeredOwnercity,
            country: registeredOwnercountry,
          },
        };
      }

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


function translateAll(locale){
    let xhrLocales = new XMLHttpRequest();
    var content = "";
    xhrLocales.open("get", "https://api.prd.qover.io/i18n/v1/projects/client-motor-microlino/" + locale + ".json?refresh=007", true);
    xhrLocales.setRequestHeader("Cache-Control", "max-age=3600");

    xhrLocales.onreadystatechange = function() {
        if (xhrLocales.readyState == 4) {
            if (xhrLocales.status >= 200 && xhrLocales.status < 300 || xhrLocales.status == 304) {
                content = JSON.parse(xhrLocales.responseText);
                window.translations = content;
                console.log(window.translations);
                $("[data-trans]").each(function(index) {
                    $(this).html(content[$(this).data("trans")]);
                    var text = $(this).html();
                });
            }
        }
    };
    xhrLocales.send();
}

function updateMonthYearField(event) {
    const visibleInput = event.target;
    // Find the hidden input using the data attribute we set
    const hiddenInput = document.getElementById(visibleInput.dataset.hiddenFieldId);

    // Auto-add the '/' for better user experience, avoiding it on backspace/delete
    if (visibleInput.value.length === 2 && event.key && !['Backspace', 'Delete', 'Tab'].includes(event.key)) {
        if (!visibleInput.value.includes('/')) {
            visibleInput.value += '/';
        }
    }

    // Use regex to validate the MM/YYYY format and extract its parts
    const match = visibleInput.value.match(/^(0[1-9]|1[0-2])\/(\d{4})$/);

    if (match) {
        // If it matches, format the date as YYYY-MM-01 and update the hidden input
        const month = match[1];
        const year = match[2];
        hiddenInput.value = `${year}-${month}-01`;
        visibleInput.setCustomValidity(''); // Mark as valid
    } else {
        // If it doesn't match, clear the hidden input's value and mark visible input as invalid
        hiddenInput.value = '';
        visibleInput.setCustomValidity('Please enter a valid date in MM/YYYY format.');
    }
}