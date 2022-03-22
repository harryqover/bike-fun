console.log("hello world 20220322 1549");
/*
CODE FOR THE EMAIL TEMPLATE
btoa("key=pk_98DABF9A747BE244BC22&lng=fr&cty=BE&vrt=THEFT_ASSISTANCE&ogvle=259000&zip=1030&city=Schaerbeek&strt=16 rue théo coopman&dmgdeduc=ENGLISH_10PC&thftdeduc=STANDARD_10PC&brd=Veloci&mod=xxx&meta=BE108765576575&type=REGULAR_EBIKE&fn=Harry&ln=Evrard&e=harry@qover.com&t=0032486910819&pdte=2022-03-20&sn=65489754&birth=1988-03-31")

//URL => https://bike-a5adfd.webflow.io/create-draft?coded=a2V5PXBrXzk4REFCRjlBNzQ3QkUyNDRCQzIyJmxuZz1mciZjdHk9QkUmdnJ0PVRIRUZUX0FTU0lTVEFOQ0Umb2d2bGU9MjU5MDAwJnppcD0xMDMwJmNpdHk9U2NoYWVyYmVlayZzdHJ0PTE2IHJ1ZSB0aOlvIGNvb3BtYW4mZG1nZGVkdWM9RU5HTElTSF8xMFBDJnRoZnRkZWR1Yz1TVEFOREFSRF8xMFBDJmJyZD1WZWxvY2kmbW9kPXh4eCZtZXRhPUJFMTA4NzY1NTc2NTc1JnR5cGU9UkVHVUxBUl9FQklLRSZmbj1IYXJyeSZsbj1FdnJhcmQmZT1oYXJyeUBxb3Zlci5jb20mdD0wMDMyNDg2OTEwODE5JnBkdGU9MjAyMi0wMy0yMCZzbj02NTQ4OTc1NCZiaXJ0aD0xOTg4LTAzLTMx
*/

var code64 = getParameterByName("coded");
var decoded = atob(code64);
console.log(decoded)

var code64 = getParameterByName("coded");


let data = atob(code64)

let decodedObject = decoded.split("&").reduce(function(obj, str, index) {
  let strParts = str.split("=");
  obj[strParts[0].replace(/\s+/g, '')] = strParts[1];
  return obj;
}, {});

console.log(decodedObject);

$("body > div.lottie-animation-12").hide(2500);

var variant = "VARIANT_"+decodedObject.vrt;
var lang = decodedObject.lng;
var country = decodedObject.cty;
var locale = lang+"-"+country;
var __QOVER_API_KEY__ = decodedObject.key;

createPayload(variant, "redirect");


function createPayload(variant, reason) {
    //$(".errorapiresponse").hide();
    //$(".successapiresponse").hide();
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
            "address": {"zip": "","country": ""}
        },
        "policyholder": {"address": {"zip": "","country": ""},entityType: "ENTITY_TYPE_PERSON"},
        "publicMetadata": [{"key": "version_bike_quote_JS","value": "redirect create draft 20220322"}],
        "metadata": []
    };
    window.payload.terms.damageDeductible = "DAMAGE_DEDUCTIBLE_"+decodedObject.dmgdeduc;
    window.payload.terms.theftDeductible = "THEFT_DEDUCTIBLE_"+decodedObject.thftdeduc;
    window.payload.settings.language = lang;
    window.payload.refs.country = country;
    window.payload.policyholder.address.country = country;
    window.payload.risk.address.country = country;
    //window.promocode = $("#promocode").val();
    var all_channel_closer = getCookie("all_channel_closer");
    if(all_channel_closer != ""){
      window.payload.publicMetadata.push({"key": "all_channel_closer","value": all_channel_closer});
    }
    window.payload.publicMetadata.push({"key": "standalone_assistance_ref","value": decodedObject.meta});
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
    window.payload.terms.variant = variant;
    window.payload.risk.originalValue = decodedObject.ogvle*1;
    //window.payload.risk.antiTheftMeasure = $("#bike-gpstracker").val();
    window.payload.risk.type = "TYPE_"+decodedObject.type;
    window.payload.risk.make = decodedObject.brd;
    window.payload.risk.model = decodedObject.mod;
    window.payload.risk.address.zip = decodedObject.zip;
    window.payload.policyholder.address.zip = decodedObject.zip;
    window.payload.policyholder.address.street = decodedObject.strt;
    window.payload.policyholder.address.city = decodedObject.city;
    window.payload.policyholder.address.country = decodedObject.cty;
    window.payload.policyholder.firstName = decodedObject.fn;
    window.payload.policyholder.lastName = decodedObject.ln;
    window.payload.policyholder.email = decodedObject.e;
    window.payload.policyholder.phone = decodedObject.t;
    window.payload.policyholder.birthdate = decodedObject.birth;
    console.log(payload);

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
    var environement = "prd";

    /*
    if(environement == "sbx") {
        postUrl = "https://appqoverme-ui.sbx.qover.io/api/bike/v1/drafts?apikey=" + __QOVER_API_KEY__;
    }
    */

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
                document.cookie = "draftId=" + window.draftid + "; expires=" +now.toGMTString() + "; path=/; domain=.qoverme.com";
                var urlPolicyholder = 'https://app.qoverme.com/bike/policyholder?locale=' + locale + '&id=' + window.draftid + '&key=' + __QOVER_API_KEY__;
                if (environement == "sbx"){
                    urlPolicyholder = 'https://appqoverme-ui.sbx.qover.io/bike/policyholder?locale=' + locale + '&id=' + window.draftid + '&key=' + __QOVER_API_KEY__;
                }
                window.location.href = urlPolicyholder;
            }

        } else if (this.status === 400) {
            var response = JSON.parse(xhr.response);
            var responseStr = JSON.stringify(response);
            console.error("response 400 - error : ", response);
            //console.error("response 400 - responseStr : ", responseStr);
            dataLayer.push({
                'event': 'allTagsWithEvents',
                'eventCategory': 'error',
                'eventAction': 'getDraft',
                'eventLabel': responseStr
              });

            var errorsDB = {
                "policyholder.address.zip" : {
                    "fr":"Code postal nécessaire pour continuer",
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