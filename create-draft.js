console.log("hello world 20261113 - v2 deeplink router");

var V2_COUNTRIES = ["BE", "FR", "NL", "DE"];
var V2_BASE_URL = "https://bike.app.qover.com/bike-v2/subject";

var code64 = getParameterByName("coded");
// Normalize URL-safe base64 / spaces before decoding
var normalizedCode64 = code64.replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, "+");
var decodedBytes = Uint8Array.from(atob(normalizedCode64), function(c) { return c.charCodeAt(0); });
var decoded = new TextDecoder().decode(decodedBytes);
console.log(decoded);

var decodedObject = decoded.split("&").reduce(function(obj, str) {
  var eqIndex = str.indexOf("=");
  if (eqIndex > -1) {
    var key = str.slice(0, eqIndex).replace(/\s+/g, "");
    var val = str.slice(eqIndex + 1);
    obj[key] = val;
  }
  return obj;
}, {});

console.log(decodedObject);

$("body > div.lottie-animation-12").hide(2500);

var variant = "VARIANT_" + decodedObject.vrt;
var lang = decodedObject.lng;
var country = (decodedObject.cty || "").toUpperCase();
var locale = lang + "-" + country;
var __QOVER_API_KEY__ = decodedObject.key;

if (V2_COUNTRIES.indexOf(country) !== -1) {
  redirectToV2Flow(decodedObject, variant, lang, country, locale, __QOVER_API_KEY__);
} else {
  createPayload(variant, "redirect");
}

// ==========================================
// V2 DEEPLINK REDIRECT (BE, FR, NL, DE)
// ==========================================
function redirectToV2Flow(data, variant, lang, country, locale, apiKey) {
  var startDateObj = new Date();
  startDateObj.setDate(startDateObj.getDate() + 1);
  var startDate = startDateObj.toISOString().split("T")[0];

  // Build metadata as a flat string-to-string map
  var metadata = {
    version_bike_quote_JS: "redirect v2 deeplink 20261113"
  };
  if (data.meta) metadata.standalone_assistance_ref = String(data.meta);

  var allChannelCloser = getCookie("all_channel_closer");
  if (allChannelCloser) metadata.all_channel_closer = String(allChannelCloser);

  var referralId = getParameterByName("referralid");
  if (referralId) metadata.referralId = String(referralId);

  var referrerUrl = getCookie("referrer_url");
  if (referrerUrl) metadata.referrer_url = String(referrerUrl);

  var utmSource = getCookie("utm_source");
  if (utmSource) metadata.utm_source = String(utmSource);

  var utmMedium = getCookie("utm_medium");
  if (utmMedium) metadata.utm_medium = String(utmMedium);

  // Build subject strictly matching subjectSchema
  var bikeType = data.type
    ? (data.type.indexOf("TYPE_") === 0 ? data.type : "TYPE_" + data.type)
    : undefined;

  var subject = {
    make: data.brd,
    model: data.mod,
    bikeValue: data.ogvle ? Number(data.ogvle) / 100 : undefined, // cents -> EUR (250..10000)
    bikePurchaseDate: data.pdte,
    bikeCondition: data.cond || "BIKE_CONDITION_NEW",
    bikeType: bikeType,
    antiTheftMeasure: data.antitheft || "ANTI_THEFT_MEASURE_NONE",
    applyDepreciation: false // Set to true if standard depreciation should apply
  };

  if (data.thftdeduc) {
    subject.theftDeductibleType = data.thftdeduc.indexOf("THEFT_DEDUCTIBLE_") === 0
      ? data.thftdeduc
      : "THEFT_DEDUCTIBLE_" + data.thftdeduc;
  }
  if (data.dmgdeduc) {
    subject.damageDeductibleType = data.dmgdeduc.indexOf("DAMAGE_DEDUCTIBLE_") === 0
      ? data.dmgdeduc
      : "DAMAGE_DEDUCTIBLE_" + data.dmgdeduc;
  }
  if (data.sn) {
    subject.serialNumber = String(data.sn);
  }

  // Build policyholder object (omit empty fields)
  var address = {};
  if (data.zip) address.zip = data.zip;
  if (data.number) address.number = data.number;
  if (data.strt) address.street = data.strt;
  if (data.city) address.city = data.city;
  if (country) address.country = country;

  var policyholder = {};
  if (data.fn) policyholder.firstName = data.fn;
  if (data.ln) policyholder.lastName = data.ln;
  if (data.e) policyholder.email = data.e;
  if (data.t) policyholder.phone = data.t;
  if (data.birth) policyholder.birthdate = data.birth;
  if (Object.keys(address).length > 0) policyholder.address = address;

  // Assemble pq initialization payload
  var pq = {
    settings: {
      locale: locale
    },
    package: {
      code: variant
    },
    contractPeriod: {
      startDate: startDate
    },
    policyholder: policyholder,
    subject: subject,
    metadata: metadata
  };

  // Flatten pq into dot-notated URL query params (e.g. pq.subject.make=RubRider)
  var params = new URLSearchParams();
  appendFlattenedParams(params, "pq", pq);

  var targetUrl = V2_BASE_URL + "?" + params.toString();
  console.log("Redirecting to v2 flow:", targetUrl);
  window.location.href = targetUrl;
}

function appendFlattenedParams(searchParams, prefix, value) {
  if (value === undefined || value === null || value === "") {
    return;
  }
  if (Array.isArray(value)) {
    value.forEach(function(item, idx) {
      appendFlattenedParams(searchParams, prefix + "." + idx, item);
    });
  } else if (typeof value === "object") {
    Object.keys(value).forEach(function(key) {
      appendFlattenedParams(searchParams, prefix + "." + key, value[key]);
    });
  } else {
    searchParams.append(prefix, String(value));
  }
}

// ==========================================
// LEGACY V1 DRAFT FLOW (OTHER COUNTRIES)
// ==========================================
function createPayload(variant, reason) {
  var startDateObj = new Date();
  startDateObj.setDate(startDateObj.getDate() + 1);
  var startDate = startDateObj.toISOString().split("T")[0];

  window.payload = {
    "settings": { "language": "" },
    "refs": { "country": "" },
    "discountCodes": [],
    "terms": {
      "variant": "",
      "depreciation": false,
      "damageDeductible": "",
      "theftDeductible": ""
    },
    "risk": {
      "originalValue": 0,
      "antiTheftMeasure": "ANTI_THEFT_MEASURE_NONE",
      "lowTheftSensitiveness": false,
      "address": { "zip": "", "country": "" }
    },
    "policyholder": {
      "address": { "zip": "", "country": "" },
      "entityType": "ENTITY_TYPE_PERSON"
    },
    "publicMetadata": [{ "key": "version_bike_quote_JS", "value": "redirect create draft 20220322" }],
    "metadata": []
  };

  window.payload.startDate = startDate;
  window.payload.terms.damageDeductible = "DAMAGE_DEDUCTIBLE_" + decodedObject.dmgdeduc;
  window.payload.terms.theftDeductible = "THEFT_DEDUCTIBLE_" + decodedObject.thftdeduc;
  window.payload.settings.language = lang;
  window.payload.refs.country = country;
  window.payload.policyholder.address.country = country;
  window.payload.risk.address.country = country;

  var all_channel_closer = getCookie("all_channel_closer");
  if (all_channel_closer != "") {
    window.payload.publicMetadata.push({ "key": "all_channel_closer", "value": all_channel_closer });
  }
  window.payload.publicMetadata.push({ "key": "standalone_assistance_ref", "value": decodedObject.meta });

  var referralId = getParameterByName("referralid");
  if (referralId != "") {
    window.payload.metadata.push({ "key": "referralId", "value": referralId });
  }
  var referrerUrlfromCookie = getCookie("referrer_url");
  if (referrerUrlfromCookie != "") {
    window.payload.publicMetadata.push({ "key": "referrer_url", "value": referrerUrlfromCookie });
  }
  var utmSourceFromCookie = getCookie("utm_source");
  if (utmSourceFromCookie != "") {
    window.payload.publicMetadata.push({ "key": "utm_source", "value": utmSourceFromCookie });
  }
  var utmMediumFromCookie = getCookie("utm_medium");
  if (utmMediumFromCookie != "") {
    window.payload.publicMetadata.push({ "key": "utm_medium", "value": utmMediumFromCookie });
  }

  window.payload.terms.variant = variant;
  window.payload.risk.originalValue = decodedObject.ogvle * 1;
  window.payload.risk.type = "TYPE_" + decodedObject.type;
  window.payload.risk.make = decodedObject.brd;
  window.payload.risk.model = decodedObject.mod;
  window.payload.risk.address.zip = decodedObject.zip;
  window.payload.risk.serialNumber = decodedObject.sn;
  window.payload.risk.bikePurchaseDate = decodedObject.pdte;
  window.payload.policyholder.address.zip = decodedObject.zip;
  window.payload.policyholder.address.number = decodedObject.number ? decodedObject.number : " ";
  window.payload.policyholder.address.street = decodedObject.strt;
  window.payload.policyholder.address.city = decodedObject.city;
  window.payload.policyholder.firstName = decodedObject.fn;
  window.payload.policyholder.lastName = decodedObject.ln;
  window.payload.policyholder.email = decodedObject.e;
  window.payload.policyholder.phone = decodedObject.t;
  window.payload.policyholder.birthdate = decodedObject.birth;

  getDraft(window.payload, reason);
}

function getDraft(payload, reason) {
  $(".error").hide();
  $(".successapiresponse").hide();

  var postUrl = "https://app.qover.com/api/bike/v1/drafts?apikey=" + __QOVER_API_KEY__;
  var xhr = new XMLHttpRequest();
  xhr.open("POST", postUrl, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onreadystatechange = function() {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 201) {
      var response = JSON.parse(xhr.response);
      window.draftid = response.draftId;
      if (reason == "save") {
        sendEmail(window.draftid, window.payload.policyholder.email, "save");
      } else {
        var now = new Date(Date.now() + 7 * 864e5);
        document.cookie = "draftId=" + window.draftid + "; expires=" + now.toGMTString() + "; path=/; domain=.webflow.io";
        document.cookie = "draftId=" + window.draftid + "; expires=" + now.toGMTString() + "; path=/; domain=.qover.com";

        var urlSummary = "https://app.qover.com/bike/summary?locale=" + locale + "&id=" + window.draftid + "&key=" + __QOVER_API_KEY__;
        var urlQuote = "https://app.qover.com/bike/quote?locale=" + locale + "&id=" + window.draftid + "&key=" + __QOVER_API_KEY__;
        var urlToRedirect = (__QOVER_API_KEY__ == "pk_98DABF9A747BE244BC22") ? urlSummary : urlQuote;
        window.location.href = urlToRedirect;
      }
    } else if (this.status === 400) {
      var response = JSON.parse(xhr.response);
      var errorsDB = {
        "policyholder.address.zip": { "fr": "Code postal nécessaire pour continuer", "en": "Zipcode required to continue", "nl": "Postcode vereist om verder te gaan" },
        "discountCodes": { "fr": "Le code promo n'est pas valide", "en": "Promocode is not valid", "nl": "Promocode is not valid" },
        "policyholder.phone": { "fr": "Clear your cookies and start again", "en": "Clear your cookies and start again", "nl": "Clear your cookies and start again" },
        "refs.country": { "fr": "Clear your cookies and start again", "en": "Clear your cookies and start again", "nl": "Clear your cookies and start again" }
      };
      var field = response.details && response.details[0] && response.details[0].fields[0];
      var errorToShow = errorsDB[field];
      var msg = (errorToShow && (errorToShow[lang] || errorToShow["en"])) || (response.details && response.details[0].message) || "Invalid request";
      $(".error").text(msg).show(250);
    }
  };
  xhr.send(JSON.stringify(payload));
}