/* version: 20230502 1242 */

console.warn("to remove when publish");
console.warn("version: 20230620 1242");


var payload = "";

function createDraftVariant1() {
    createPayload(variants[0], "policyholder");
}
function createDraftVariant2() {
    createPayload(variants[1], "policyholder");
}
function createDraftVariant3() {
    createPayload(variants[2], "policyholder");
}
function saveOffer() {

    createPayload("", "save");
}
function getDraftAndSendSMS() {
    $(".error-phone-format").hide();
    $("#submit-sms").hide(250);
    var draftid = createPayload(variants[0], "draftid");
    
	var phone= $("#phone").val();
	console.warn("verif phone validity: ",phone.match(/^(?:(?:\+)33)\s*[1-9](?:[\s.-]*\d{2}){4}$/gmi));
    if(phone.match(/^(?:(?:\+)33)\s*[1-9](?:[\s.-]*\d{2}){4}$/gmi) == null){
        $(".error-phone-format").show(250);
    }
	var firstname =  $("#first-name").val();

    setTimeout(function(){
    	sendSMS(phone,window.draftid,firstname,window.lang, window.country);
        $(".retry").show(250);
        $(".save4later").hide(250);
        $("#submit-sms").show();
   	}, 3000);
}
function retry(){
    $("#phone").val("");
    $(".retry").hide(250);
    $(".save4later").show(250);
}

const errorsDB = {
                "policyholder.address.zip" : {
                    "fr":"Code postal non invalide",
                    "en":"Zipcode required to continue",
                    "nl":"Postcode vereist om verder te gaan",
                    "de":"Zipcode required to continue",
                    "es":"Zipcode required to continue",
                    "it":"Zipcode required to continue",
                    "pt":"Zipcode required to continue"
                },
                "discountCodes": {
                    "fr":"Le code promo n'est pas valide",
                    "en":"Promocode is not valid",
                    "nl":"Promocode is not valid",
                    "de":"Promocode is not valid",
                    "es":"Promocode is not valid",
                    "it":"Promocode is not valid",
                    "pt":"Promocode is not valid"
                },
                "policyholder.phone": {
                    "fr":"Clear your cookies and start again",
                    "en":"Clear your cookies and start again",
                    "nl":"Clear your cookies and start again",
                    "de":"Clear your cookies and start again",
                    "es":"Clear your cookies and start again",
                    "it":"Clear your cookies and start again",
                    "pt":"Clear your cookies and start again"
                },
                "refs.country": {
                    "fr":"Clear your cookies and start again",
                    "en":"Clear your cookies and start again",
                    "nl":"Clear your cookies and start again",
                    "de":"Clear your cookies and start again",
                    "es":"Clear your cookies and start again",
                    "it":"Clear your cookies and start again",
                    "pt":"Clear your cookies and start again"
                }
            }

//SEND EMAIL START
  function sendEmail(draftId, email){
    var firstname =  $("#first-name-mail").val();
    $(".retry").show(250);
    $(".save4later").hide(250);
    var postUrl = "https://dojo-production-mailcampaign-api.production.cluster.qover.io/steps?apikey="+__QOVER_API_KEY__;
    var postBody = {"language":lang+"-"+country,"draftId":draftId,"step":"widget","email": email,"references":{"country":country,"productReference":"BIKE"}};
    var xhr = new XMLHttpRequest();
    xhr.open("POST", postUrl, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function() { 
      if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
        emailSentSavedToGsheet(email,draftId,firstname,lang);
        var responseEmailSaved = JSON.parse(xhr.response);
        var translationSent = {
            "fr": "Email envoyé à ",
            "en": "Email sent to ",
            "nl": "E-mail gestuurd naar "
        }
        $("#quote > div.div-save4later > div.div-content-save4later.retry > h5").text(translationSent[window.lang]+responseEmailSaved.email);
      }
    }
    xhr.send(JSON.stringify(postBody));
  }
  //SEND EMAIL END

var gscriptUrl = "https://script.google.com/macros/s/AKfycbz6pgfasgLk6SABJBG3rAtHzv5c-_uHKiIhu7UU8Z7OZQ12cCPBfG8dKNnJhKHimGRv5A/exec";
function sendSMS(phone,draftid,firstname,lang, country){
    var settings = {
      "url": gscriptUrl,
      "method": "POST",
      "timeout": 0,
      "headers": {
        "Content-Type": "text/plain;charset=utf-8"
      },
      "data": JSON.stringify({
        "recipient": phone,
        "draftId": draftid,
        "name": firstname,
        "lang": lang,
        "type": "SMS",
        "country": country
      }),
    };

    $.ajax(settings).done(function (response) {
      console.log("sms response: ",response);
    });
  }
function emailSentSavedToGsheet(email,draftid,firstname,lang){
    var settings = {
      "url": gscriptUrl,
      "method": "POST",
      "timeout": 0,
      "headers": {
        "Content-Type": "text/plain;charset=utf-8"
      },
      "data": JSON.stringify({
        "recipient": email,
        "draftId": draftid,
        "name": firstname,
        "lang": lang,
        "type": "EMAIL",
        "country": window.country
      }),
    };
    $.ajax(settings).done(function (response) {
      console.log("response: ",response);
    });
  }

//START CREATE PAYLOAD
function createPayload(variant, reason) {
    $(".errorapiresponse").hide();
    $(".successapiresponse").hide();
    window.payload = {
        "settings": {
            "language": ""
        },
        "refs": {
            "country": ""
        },
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
            "address": { "zip": ""}
        },
        "policyholder": {"address": { "zip": ""},entityType: "ENTITY_TYPE_PERSON"},
        "publicMetadata": [{"key": "version_bike_quote_JS","value": "20211215-0620"}],
        "metadata": []
    };
    window.payload.terms.damageDeductible = window.damageDeductible;
    window.payload.terms.theftDeductible = window.theftDeductible;
    window.payload.settings.language = lang;
    window.payload.refs.country = country;
    window.promocode = $("#promocode").val();
    var all_channel_closer = getCookie("all_channel_closer");
    if(all_channel_closer != ""){
      window.payload.publicMetadata.push({"key": "all_channel_closer","value": all_channel_closer});
    }
    var referralId = getParameterByName("referralid");
    if(referralId != ""){
      window.payload.metadata.push({"key": "referralId","value": referralId});
    }
    var referrerUrlfromCookie = getCookie("referrer_url");
    if(referrerUrlfromCookie != ""){
      window.payload.publicMetadata.push({"key": "referrer_url","value": referrerUrlfromCookie});
    }
    var utmSourceFromCookie = getCookie("utm_source");
    if(utmSourceFromCookie != ""){
      window.payload.publicMetadata.push({"key": "utm_source","value": utmSourceFromCookie});
    }
    var utmMediumFromCookie = getCookie("utm_medium");
    if(utmMediumFromCookie != ""){
      window.payload.publicMetadata.push({"key": "utm_medium","value": utmMediumFromCookie});
    }
    window.payload.discountCodes.push({"name": window.promocode});
    window.payload.terms.variant = variant;
    window.payload.risk.originalValue = $("#value").val() * 100;
    window.payload.risk.antiTheftMeasure = $("#bike-gpstracker").val();
    window.payload.risk.type = $("#bike-type").val();
    window.payload.risk.address.zip = $("#zipcode").val();
    window.payload.policyholder.address.zip = $("#zipcode").val();
    window.payload.policyholder.address.country = window.country;
    if($("#first-name").val() != ""){
        window.payload.policyholder.firstName = $("#first-name").val();
    }
    if($("#first-name-mail").val() != ""){
        window.payload.policyholder.firstName = $("#first-name-mail").val();
    }

    if($("#email-save").val() != ""){
        window.payload.policyholder.email = $("#email-save").val();
    }
    if($("#phone").val() != ""){
        window.payload.policyholder.phone = $("#phone").val();
    }
    //console.log(payload);

    var bikeValueCluser = "";
    var bikeValue = $("#value").val();
    if(bikeValue < 1000){
        bikeValueCluser = "1) <1000";
    } else if (bikeValue < 1500) {
        bikeValueCluser = "2) 1000-1499";
    } else if (bikeValue < 2000) {
        bikeValueCluser = "3) 1500-1999";
    } else if (bikeValue < 2500) {
        bikeValueCluser = "4) 2000-2499";
    } else if (bikeValue < 3000) {
        bikeValueCluser = "5) 2500-2999";
    } else if (bikeValue < 4000) {
        bikeValueCluser = "6) 3000-3999";
    } else if (bikeValue > 3999) {
        bikeValueCluser = "7) >4000";
    } else {
        bikeValueCluser = "Other";
    }

    dataLayer.push({
      'event': 'nonInteractionEvent',
      'eventCategory': 'shopping behavior - getDraft',
      'eventAction': 'bike value',
      'eventLabel': bikeValueCluser
    });
    dataLayer.push({
      'event': 'nonInteractionEvent',
      'eventCategory': 'shopping behavior - getDraft',
      'eventAction': 'promocode',
      'eventLabel': window.promocode
    });

    getDraft(window.payload, reason);
}
//CREATE PAYLOAD END

//CREATE DRAFT START
function getDraft(payload, reason) {
    $(".error").hide();
    $(".successapiresponse").hide();

    var postUrl = "https://app.qoverme.com/api/bike/v1/drafts?apikey=" + __QOVER_API_KEY__;

    if(environement == "sbx") {
        postUrl = "https://appqoverme-ui.sbx.qover.io/api/bike/v1/drafts?apikey=" + __QOVER_API_KEY__;
    }

    var postBody = payload;
    var xhr = new XMLHttpRequest();
    xhr.open("POST", postUrl, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function() {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 201) {
            var response = JSON.parse(xhr.response);
            window.draftid = response.draftId;
            var draftIdFromResponse = response.draftId;
            //console.log("from getdraft draft id ",draftIdFromResponse);
            //console.log("from getdraft reason",reason);
            if (reason == "draftid"){
            	console.log("draftid is stored in window");
            } else if (reason == "save") {
                sendEmail(window.draftid, window.payload.policyholder.email, "save");
            } else {

                dataLayer.push({
                    'event': 'addToCartMain',
                    'ecommerce': {
                        'currencyCode': 'EUR',
                        'add': {
                            'actionField': {
                                'list': 'landing|update'
                            },
                            'products': [{
                                'id': response.terms.variant,
                                'name': response.terms.variant,
                                'variant': response.risk.type,
                                'category': 'bike_insurance',
                                'brand': 'BE',
                                'dimension1': 'Main',
                                'price': response.totalCoverage.priceInfo.yearlyPremium.withTaxes / 100,
                                'coupon': ''
                            }]
                        }
                    }
                });
                document.cookie = "draftId=" + window.draftid + "; expires=" +now.toGMTString() + "; path=/; domain=.webflow.io";
                document.cookie = "draftId=" + window.draftid + "; expires=" +now.toGMTString() + "; path=/; domain=.qoverme.com";
                document.cookie = "draftId=" + window.draftid + "; expires=" +now.toGMTString() + "; path=/; domain=.qover.com";
                var urlPolicyholder = 'https://app.qover.com/bike/policyholder?locale=' + locale + '&id=' + window.draftid + '&key=' + __QOVER_API_KEY__;
                if (environement == "sbx"){
                    urlPolicyholder = 'https://appqoverme-ui.sbx.qover.io/bike/policyholder?locale=' + locale + '&id=' + window.draftid + '&key=' + __QOVER_API_KEY__;
                }
                window.location.href = urlPolicyholder;
            }

        } else if (this.status === 400) {
            var response = JSON.parse(xhr.response);
            var responseStr = JSON.stringify(response);
            //console.warn("response 400 : ", response);
            dataLayer.push({
                'event': 'allTagsWithEvents',
                'eventCategory': 'error',
                'eventAction': 'getDraft',
                'eventLabel': responseStr
              });
            
            var errorToShow = errorsDB[response.details[0].fields[0]];

            $(".error").text(response.details[0].message);
            $(".error").text(errorToShow[lang]);
            $(".error").show(250);
            //showErrorMessage(response.details);
        }
    }
    xhr.send(JSON.stringify(postBody));
}
//CREATE DRAFT END
//START GET PRICE
function getPrice() {
    $(".error").hide();
    let xhrPrice = new XMLHttpRequest();
    var type = $("#bike-type").val();
    var gpstracker = $("#bike-gpstracker").val();
    var value = $("#value").val() * 100;
    var zipcode = $("#zipcode").val();
    window.promocode = $("#promocode").val();

    if (type == "SPEEDPEDELEC") {
        $(".error").text(window.text.pedelecError);
        $(".error").show();
        dataLayer.push({
            'event': 'allTagsWithEvents',
            'eventCategory': 'error',
            'eventAction': 'getPrice',
            'eventLabel': 'SPEEDPEDELEC'
          });
    } else {
        var urlGetPrice = 'https://app.qoverme.com/api/bike/v1/price-info?apikey=' + __QOVER_API_KEY__ + '&iecb=1592535798477&country=' + country + '&type=' + type + '&value=' + value + '&antiTheftMeasure=' + gpstracker + '&zip=' + zipcode + '&discountCodes=' + window.promocode;
        if(environement == "sbx"){
            urlGetPrice = 'https://appqoverme-ui.sbx.qover.io/api/bike/v1/price-info?apikey=' + __QOVER_API_KEY__ + '&iecb=1592535798477&country=' + country + '&type=' + type + '&value=' + value + '&antiTheftMeasure=' + gpstracker + '&zip=' + zipcode + '&discountCodes=' + window.promocode;
        }
        xhrPrice.open('GET', urlGetPrice);
        xhrPrice.setRequestHeader("Cache-Control", "max-age=3600");
        xhrPrice.send();
        xhrPrice.onload = function() {
            if (xhrPrice.status != 200) {
                console.warn(`Error ${xhrPrice.status}: ${xhrPrice.statusText}`); // e.g. 404: Not Found
                var responseGetPrice = JSON.parse(xhrPrice.response);
                console.log("responseGetPrice ", responseGetPrice);
                console.log("responseGetPrice.details ", responseGetPrice.details);
                console.log("responseGetPrice.message ", responseGetPrice.message);
                console.log("window.text ", window.text)

                //$(".error").text(window.text.priceLimits);
                if(responseGetPrice.details){
                    var errorToShow = errorsDB[responseGetPrice.details[0].fields[0]];
                    errorToShow = errorToShow[lang];   
                } else {
                    if(responseGetPrice.message == "Value is not valid."){
                        var errorToShow = responseGetPrice.message;
                    } else {
                        var errorToShow = responseGetPrice.message;    
                    }
                    
                }
                

                //$(".error").text(response.details[0].message);
                $(".error").text(errorToShow);
                $(".error").show(250);
                
                //$(".error").show();
                dataLayer.push({
                'event': 'allTagsWithEvents',
                'eventCategory': 'error',
                'eventAction': 'getPrice',
                'eventLabel': xhrPrice.status + ' url used: ' + urlGetPrice
              });
                window.__QOVER_API_KEY__ = "pk_F2654BC3CEC684D9ED1E";
            } else { // show the result
                console.warn(`Done, got ${xhrPrice.response.length} bytes`); // response is the server
                var responseGetPrice = JSON.parse(xhrPrice.response);

                var priceVariant1 = responseGetPrice.priceInfo[0].coverages.find(el => el.coverageName === variants[0]);
                var priceVariant1Yearly = priceVariant1.yearlyPremium.withTaxes / 100;
                var priceVariant1Monthly = priceVariant1.monthlyPremium.withTaxes / 100;
                $("#priceVariant1Yearly").text(priceVariant1Yearly);
                $("#priceVariant1Monthly").text(priceVariant1Monthly);
                var basePriceVariant1 = responseGetPrice.basePriceInfo[0].coverages.find(el => el.coverageName === variants[0]);
                var basePriceVariant1Yearly = basePriceVariant1.yearlyPremium.withTaxes / 100;
                var percentdiscountVariant1 = ((basePriceVariant1Yearly - priceVariant1Yearly) / basePriceVariant1Yearly) * 100;
                percentdiscountVariant1 = percentdiscountVariant1.toFixed(0);
                //console.log("percentdiscountVariant1 ", percentdiscountVariant1);

                if (variants.length > 1) {
                    var priceVariant2 = responseGetPrice.priceInfo[0].coverages.find(el => el.coverageName === variants[1]);
                    var priceVariant2Yearly = priceVariant2.yearlyPremium.withTaxes / 100;
                    var priceVariant2Monthly = priceVariant2.monthlyPremium.withTaxes / 100;
                    $("#priceVariant2Yearly").text(priceVariant2Yearly);
                    $("#priceVariant2Monthly").text(priceVariant2Monthly);
                    var basePriceVariant2 = responseGetPrice.basePriceInfo[0].coverages.find(el => el.coverageName === variants[1]);
                    var basePriceVariant2Yearly = basePriceVariant2.yearlyPremium.withTaxes / 100;
                    var percentdiscountVariant2 = ((basePriceVariant2Yearly - priceVariant2Yearly) / basePriceVariant2Yearly) * 100;
                    percentdiscountVariant2 = percentdiscountVariant2.toFixed(0);

                    if (variants.length > 2) {
                        var priceVariant3 = responseGetPrice.priceInfo[0].coverages.find(el => el.coverageName === variants[2]);
                        var priceVariant3Yearly = priceVariant3.yearlyPremium.withTaxes / 100;
                        var priceVariant3Monthly = priceVariant3.monthlyPremium.withTaxes / 100;
                        $("#priceVariant3Yearly").text(priceVariant3Yearly);
                        $("#priceVariant3Monthly").text(priceVariant3Monthly);
                        var basePriceVariant3 = responseGetPrice.basePriceInfo[0].coverages.find(el => el.coverageName === variants[2]);
                        var basePriceVariant3Yearly = basePriceVariant3.yearlyPremium.withTaxes / 100;
                        var percentdiscountVariant3 = ((basePriceVariant3Yearly - priceVariant3Yearly) / basePriceVariant3Yearly) * 100;
                        percentdiscountVariant3 = percentdiscountVariant3.toFixed(0);
                    }
                }
                if (percentdiscountVariant1 > 0) {
                    $("#percentdiscountVariant1").text(percentdiscountVariant1);
                    if (variants.length > 1) {
                        $("#percentdiscountVariant2").text(percentdiscountVariant2);
                        if (variants.length > 1) {
                            $("#percentdiscountVariant3").text(percentdiscountVariant3);
                        }
                    }
                    $(".discount, .promo-label").show(250);
                } else if (window.promocode != "") {
                    if(window.promocode.substring(0,5) == "GIANT"){
                      window.location.href = "https://app.qover.com/bike/quote?locale=fr-FR&key=pk_29D66CCD9AE08A1B59C9&promocode="+window.promocode;
                      $(".error").text(window.text.promocodeNotValid);
                    } else {
                      $(".error").text(window.text.promocodeNotValid);
                    }
                    $(".error").show();
                    dataLayer.push({
                        'event': 'allTagsWithEvents',
                        'eventCategory': 'error',
                        'eventAction': 'getPrice',
                        'eventLabel': 'promocode not valid '+window.promocode+ ' '+window.__QOVER_API_KEY__
                      });
                    $(".discount, .promo-label").hide(250);
                } else {
                  $(".discount, .promo-label").hide(250);
                }

                var priceEur = value / 100;
                $("#bikeprice").text(priceEur);

                var bikeValue = $("#value").val();

                var bikeValueCluser = "";
                if(bikeValue < 1000){
                    bikeValueCluser = "1) <1000";
                } else if (bikeValue < 1500) {
                    bikeValueCluser = "2) 1000-1499";
                } else if (bikeValue < 2000) {
                    bikeValueCluser = "3) 1500-1999";
                } else if (bikeValue < 2500) {
                    bikeValueCluser = "4) 2000-2499";
                } else if (bikeValue < 3000) {
                    bikeValueCluser = "5) 2500-2999";
                } else if (bikeValue < 4000) {
                    bikeValueCluser = "6) 3000-3999";
                } else if (bikeValue > 3999) {
                    bikeValueCluser = "7) >4000";
                } else {
                    bikeValueCluser = "Other";
                }

                dataLayer.push({
                  'event': 'nonInteractionEvent',
                  'eventCategory': 'shopping behavior - getPrice',
                  'eventAction': 'bike value',
                  'eventLabel': bikeValueCluser
                });
                dataLayer.push({
                  'event': 'nonInteractionEvent',
                  'eventCategory': 'shopping behavior - getPrice',
                  'eventAction': 'promocode %',
                  'eventLabel': percentdiscountVariant1
                });
                dataLayer.push({
                  'event': 'nonInteractionEvent',
                  'eventCategory': 'shopping behavior - getPrice',
                  'eventAction': 'promocode',
                  'eventLabel': window.promocode
                });

                if (damageDeductible == "DAMAGE_DEDUCTIBLE_ENGLISH_10PC" || damageDeductible == "DAMAGE_DEDUCTIBLE_STANDARD_10PC") {
                    var damageDeductibleAmount = $("#value").val() * 0.1;
                    if (damageDeductibleAmount > 200) {
                        damageDeductibleAmount = 200;
                    } else if (damageDeductibleAmount < 50) {
                        damageDeductibleAmount = 50;
                    }
                } else if (damageDeductible == "DAMAGE_DEDUCTIBLE_ENGLISH_75_FIX") {
                    var damageDeductibleAmount = 75;
                } else if (damageDeductible == "DAMAGE_DEDUCTIBLE_STANDARD_35_FIX") {
                    var damageDeductibleAmount = 35;
                }

                if (theftDeductible == "THEFT_DEDUCTIBLE_STANDARD_10PC") {
                    var theftDeductibleAmount = $("#value").val() * 0.1;
                    if (theftDeductibleAmount > 200) {
                        theftDeductibleAmount = 200;
                    } else if (theftDeductibleAmount < 50) {
                        theftDeductibleAmount = 50;
                    }
                } else if (theftDeductible == "THEFT_DEDUCTIBLE_NO_DEDUCTIBLE") {
                    var theftDeductibleAmount = 0;
                }


                var refundDamage = bikeValue - damageDeductibleAmount;
                var refundTheft = bikeValue - theftDeductibleAmount;

                $(".damage-deductible").text(Math.round(damageDeductibleAmount * 100) / 100);
                $(".theft-deductible").text(refundTheft);

                window.yearlyPriceTheft = priceVariant1Yearly;
                window.yearlyPriceOmnium = priceVariant2Yearly;

                $('.div-block-184').removeAttr('onclick');
                $(".clickhere").hide();

                //START CREATE PRODUCT ARRAY TO SEND TO TAG MANAGER
                var productArray = [{
                                    'id': window.variants[0],
                                    'name': window.variants[0],
                                    'variant': type,
                                    'category': 'bike_insurance',
                                    'brand': window.country,
                                    'dimension1': 'Main',
                                    'price': priceVariant1Yearly
                                }
                            ];
                if (variants.length > 1) {
                  productArray.push({'id': window.variants[1],'name': window.variants[1],'variant': type,'category': 'bike_insurance','brand': window.country,'dimension1': 'Main','price': priceVariant2Yearly});
                  if (variants.length > 2) {
                    productArray.push({'id': window.variants[2],'name': window.variants[2],'variant': type,'category': 'bike_insurance','brand': window.country,'dimension1': 'Main','price': priceVariant3Yearly});
                  }
                }
                //END CREATE PRODUCT ARRAY TO SEND TO TAG MANAGER
                //START SEND PRODUCT ARRAY TO TAG MANAGER
                dataLayer.push({
                    'event': 'productDetailView2', //The event name adapts to the number of plans proposed
                    'ecommerce': {
                        'currencyCode': 'EUR',
                        'detail': {
                            'products': productArray
                        }
                    }
                });
                //END SEND PRODUCT ARRAY TO TAG MANAGER

                var elmnt = document.getElementById("quote-blocks");
                elmnt.scrollIntoView();
                gpsCheck();

                $(".price, .save4later-cta, .select-plan, .quote-section, .refunded-value, .save-for-later-link").show(250);
                $(".div-save4later").show(500);
            }
        };
    }
}
//END GET PRICE

function gpsCheck() {
    var gpstracker = $("#bike-gpstracker").val();
    if (gpstracker == "ANTI_THEFT_MEASURE_GPS") {
        $(".gpstrackerinfotext").show(250);
    } else {
        $(".gpstrackerinfotext").hide(250);
    }
}

function hidePrice() {
    $(".price, .refunded-value, .select-plan, .discount, .save4later-cta, .div-save4later, .retry, .promo-label, .save-for-later-link").hide(250);
    gpsCheck();
}

function ihavecodecheck() {
    // Get the checkbox
    var checkBox = document.getElementById("ihavecode");
    // Get the output text
    var text = document.getElementById("promocode");

    // If the checkbox is checked, display the output text
    if (checkBox.checked == true) {
        text.style.display = "block";
    } else {
        text.style.display = "none";
    }
}


// Function to check if all inputs are filled
function validateForm() {
  var inputs = document.getElementsByClassName('input-embed');
  for (var i = 0; i < inputs.length; i++) {
    if (inputs[i].value === '') {
      return false;
    }
  }
  return true;
}

// Function to enable/disable the button based on form validation
function toggleButton() {
    if(validateForm()){
        $("[data-var='startQuote']").attr("onclick","getPrice()");
        $("[data-var='startQuote']").attr("style","background-color:#2f44dd");
    } else {
        $("[data-var='startQuote']").attr("onclick","");
        $("[data-var='startQuote']").attr("style","background-color:#e8e8e8");
    }
}
setTimeout(toggleButton, 1000);

// Attach event listeners to input fields
var inputs = document.getElementsByClassName('input-embed');
for (var i = 0; i < inputs.length; i++) {
  inputs[i].addEventListener('input', toggleButton);
}

// Attach event listener to select fields
var selects = document.getElementsByTagName('select');
for (var i = 0; i < selects.length; i++) {
  selects[i].addEventListener('change', toggleButton);
}

