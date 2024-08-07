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
            "lowTheftSensitiveness": false
        },
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
    //window.payload.discountCodes.push({"name": window.promocode});
    //HARRY TRYING TO FIX UNDEFINED DISCOUNT
    if(window.promocode != ""){
        window.payload.discountCodes.push({"name": window.promocode});
    }
    window.payload.terms.variant = variant;
    window.payload.risk.originalValue = $("#value").val() * 100;
    window.payload.risk.antiTheftMeasure = $("#bike-gpstracker").val();
    window.payload.risk.type = $("#bike-type").val();
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
    var postBody = payload;
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
                document.cookie = "draftId=" + window.draftid + "; expires=" +now.toGMTString() + "; path=/; domain=.qover.com";
                window.location.href = 'https://app.qover.com/bike/policyholder?locale=' + locale + '&id=' + window.draftid + '&key='+__QOVER_API_KEY__;
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
            $(".error").text(response);
            $(".error").show();
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
    window.promocode = $("#promocode").val();

    if (type == "SPEEDPEDELEC" || type == "TYPE_FAT_EBIKE" || type == "TYPE_FAT_BIKE") {
        var errorTextDB = (type == "SPEEDPEDELEC")?window.text.pedelecError:window.text.fatbikeError;
        $(".error").text(errorTextDB);
        $(".error").show();
        gtag('event', 'allTagsWithEvents', {
          'event_category': 'error - getPrice',
          'event_label': type
        });
    } else {
        xhrPrice.open('GET', 'https://app.qoverme.com/api/bike/v1/price-info?apikey=' + __QOVER_API_KEY__ + '&iecb=1592535798477&country=' + country + '&type=' + type + '&value=' + value + '&antiTheftMeasure=' + gpstracker + '&discountCodes=' + window.promocode);
        xhrPrice.setRequestHeader("Cache-Control", "max-age=3600");
        xhrPrice.send();
        xhrPrice.onload = function() {
            if (xhrPrice.status != 200) {
                console.warn(`Error ${xhrPrice.status}: ${xhrPrice.statusText}`); // e.g. 404: Not Found
                $(".error").text(window.text.priceLimits);
                $(".error").show();
                dataLayer.push({
                'event': 'allTagsWithEvents',
                'eventCategory': 'error',
                'eventAction': 'getPrice',
                'eventLabel': xhrPrice.status + ' url used: ' + 'https://app.qoverme.com/api/bike/v1/price-info?apikey=' + __QOVER_API_KEY__ + '&iecb=1592535798477&country=' + country + '&type=' + type + '&value=' + value + '&antiTheftMeasure=' + gpstracker + '&discountCodes=' + window.promocode
              });
                if(country == "DE"){
                    window.__QOVER_API_KEY__ = "pk_5B7B1ADFC6AC6857DC34"; //qover partner for new com in DE
                } else {
                    window.__QOVER_API_KEY__ = "pk_F2654BC3CEC684D9ED1E"; //qover-me partner
                }
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
                var discountsOnVariant = [];
                if(percentdiscountVariant1>0){discountsOnVariant.push("v1")}

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
                    if(percentdiscountVariant2>0){discountsOnVariant.push("v2")}

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
                        if(percentdiscountVariant3>0){discountsOnVariant.push("v3")}
                    }
                }
                if (discountsOnVariant.length > 0) {
                    $(".discount, .promo-label").show(250);
                    if(discountsOnVariant.includes("v1")){
                        $("#percentdiscountVariant1").text(percentdiscountVariant1);
                    } else {
                        $("#percentdiscountVariant1").text("0");
                    }
                    if(discountsOnVariant.includes("v2")){
                        $("#percentdiscountVariant2").text(percentdiscountVariant2);    
                    } else {
                        $("#percentdiscountVariant2").text("0");
                    }
                    if(discountsOnVariant.includes("v3")){
                        $("#percentdiscountVariant3").text(percentdiscountVariant3);    
                    } else {
                        $("#percentdiscountVariant3").text("0");
                    }
                    
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
                    $(".discount").hide(250);
                } else {
                  $(".discount").hide(250);
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


                if(!window.minMaxDeductible){
                    var minMaxDeductible = {"min":50,"max":200, "75fix": 75, "35fix": 35};
                } else {
                    var minMaxDeductible = window.minMaxDeductible;
                }
                console.log(minMaxDeductible);
                

                if (damageDeductible == "DAMAGE_DEDUCTIBLE_ENGLISH_10PC" || damageDeductible == "DAMAGE_DEDUCTIBLE_STANDARD_10PC") {
                    var damageDeductibleAmount = $("#value").val() * 0.1;
                    if (damageDeductibleAmount > minMaxDeductible["max"]) {
                        damageDeductibleAmount = minMaxDeductible["max"];
                    } else if (damageDeductibleAmount < minMaxDeductible["min"]) {
                        damageDeductibleAmount = minMaxDeductible["min"];
                    }
                    console.log(damageDeductibleAmount);
                } else if (damageDeductible == "DAMAGE_DEDUCTIBLE_ENGLISH_75_FIX") {
                    var damageDeductibleAmount = minMaxDeductible["75fix"];
                } else if (damageDeductible == "DAMAGE_DEDUCTIBLE_STANDARD_35_FIX") {
                    var damageDeductibleAmount = minMaxDeductible["35fix"];
                }

                if (theftDeductible == "THEFT_DEDUCTIBLE_STANDARD_10PC") {
                    var theftDeductibleAmount = $("#value").val() * 0.1;
                    if (theftDeductibleAmount > minMaxDeductible["max"]) {
                        theftDeductibleAmount = minMaxDeductible["max"];
                    } else if (theftDeductibleAmount < minMaxDeductible["min"]) {
                        theftDeductibleAmount = minMaxDeductible["min"];
                    }
                console.log(theftDeductibleAmount);
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

                $(".price").show(250);
                $(".refunded-value").show(250);
                $(".quote-section").show(250);
                $(".select-plan").show(250);
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
    $(".price, .refunded-value, .select-plan, .discount").hide(250);
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