console.warn("v20221227 1314");
const cowboyIds = ["60a75f9f987d3f484ed24ef4", "607937e4654780240a132641", "60938efba79100e71519a03b", "5ff6cf4fceba6039aadb446f", "61b1c260415df342d60f4e10", "61b1b145415df342d60f4e0f", "61b1d0a02656f6227dc3476f", "61b8a43042cef3c0bc2cc26d", "61b8a49f11e584fcae0ee070", "61b8a45842cef3c0bc2cc26e", "61b8a4c211e584fcae0ee071", "61b8a4e807007c0a5b94d673", "61b8a51111e584fcae0ee072", "61b8a52111e584fcae0ee073"];
const cowboyAlteosIds = ["5ff6cf4fceba6039aadb446f", "60938efba79100e71519a03b", "607937e4654780240a132641", "61b1b145415df342d60f4e0f", "61b1c260415df342d60f4e10", "60a75f9f987d3f484ed24ef4"]

const variants = {
    "VARIANT_THEFT_DAMAGE_ASSISTANCE": "Omnium",
    "VARIANT_THEFT_ASSISTANCE": "Theft & Assistance",
    "VARIANT_ASSISTANCE": "Assistance 24/7"
}
const assistancePhone = {
    "BE" : "+32 2 541 92 01",
    "FR" : "+33 9 78 46 61 24",
    "DE" : "+49 800 589 39 21",
    "NL" : "020 532 07 06"
};

const qoverPhone = {
    "BE" : "+32 2 588 25 50",
    "FR" : "+33 9 71 07 28 38",
    "DE" : "+49 800 000 97 29",
    "NL" : "020 532 07 05",
    "ES" : "+34 900 861 622",
    "IT" : "+39 800 693 271",
    "PT" : "+351 800 181 009",
    "GB" : "+44 800 048 8899",
    "DK" : "xxx",
    "NO" : "xxx",
    "SE" : "xxx",
    "FI" : "xxx",
    "AT" : "xxx",
    "PL" : "xxx",
    "IE" : "xxx"
};

$(".loading").hide();
$("#connected").hide();
$("#disconnected").show();

var login = getCookie("login");
var cigarId = getCookie("cigarId");

if (login && cigarId) {
    goLogin(cigarId, login);
}

setTimeout(function() {
    $("#email").val(getParameterByName("email"));
    $("#cigardid").val(getParameterByName("contract"));
    //getTranslation();
}, 2500);

function clickToLogin() {
    var cigarId = $('input[name="name"]').val();
    var email = $('input[name="email"]').val();
    goLogin(cigarId, email);
}

function goLogin(cigarId, email) {
    translateAll();
    $(".loading").show();
    $("#connected").hide();
    $("#disconnected").hide();
    $("#bikedata").hide();

    var data = JSON.stringify({
        "cigarId": cigarId,
        "email": email
    });
    var partnerMapping = {
        "5e58cf936ad8cf0e9dc678a6": "unknown",
    };

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function() {
        if (this.readyState === 4 && this.status === 200) {

            var timeToAdd = 1000 * 60 * 60 * 24 * 1 * 1 * 1;
            var date = new Date();
            var expiryTime = parseInt(date.getTime()) + timeToAdd;
            date.setTime(expiryTime);
            var utcTime = date.toUTCString();
            document.cookie = "login=" + email + "; expires=" + utcTime + ";";
            document.cookie = "cigarId=" + cigarId + "; expires=" + utcTime + ";";

            var obj = JSON.parse(this.responseText);
            var partnerId = obj.partnerId;
            var variant = obj.variant;
            var country = obj.country;
            var start = new Date(obj.startDate);
            var end = new Date(obj.endDate);
            console.log(obj);
            console.log(partnerMapping[partnerId]);

            var isCowboy = cowboyIds.includes(partnerId);
            var isCowboyAlteosId = cowboyAlteosIds.includes(partnerId);

            var claims_handler = "to be verified";

            if (isCowboyAlteosId === true && country == "DE") {
                claims_handler = "Alteos";
            } else if (country == "DE" || country == "FR" || country == "NL" || country == "BE" || country == "NO" || country == "SE" || country == "DK" || country == "FI" || country == "AT") {
                claims_handler = "Van Ameyde";
            } else if (country == "ES" || country == "IT" || country == "PT" || country == "IE" || country == "PL") {
                claims_handler = "Qover";
            } else if (country == "GB") {
                claims_handler = "Qover";
            }

            /* START DEFINE DEDUCTIBLES */
            var theftDeductible = obj.theftDeductible;
            var damageDeductible = obj.damageDeductible;
            var bikeValue = obj.originalValue / 100;

            if (damageDeductible == "DAMAGE_DEDUCTIBLE_ENGLISH_10PC" || damageDeductible == "DAMAGE_DEDUCTIBLE_STANDARD_10PC") {
                var damageDeductibleAmount = bikeValue * 0.1;
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
                var theftDeductibleAmount = bikeValue * 0.1;
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
            /* END DEFINE DEDUCTIBLES */

            $("[data-var='product']").text(variants[obj.variant]);
            $("[data-var='cigarid']").text(cigarId);
            $("[data-var='start']").text(start.toLocaleDateString());
            $("[data-var='end']").text(end.toLocaleDateString());
            $("[data-var='theftdeductible']").text("EUR " + Math.round(theftDeductibleAmount * 100) / 100);
            $("[data-var='materialdeductible']").text("EUR " + Math.round(damageDeductibleAmount * 100) / 100);
            $("[data-var='phone']").text(qoverPhone[country]);
            if(variant == "VARIANT_ASSISTANCE"){
                $("[data-var='phoneassistance']").text("02 533 75 75");    
            } else if(variant == "VARIANT_THEFT_ASSISTANCE" || variant == "VARIANT_THEFT_DAMAGE_ASSISTANCE"){
                $("[data-var='phoneassistance']").text(assistancePhone[country]);
            } else {
                $("[data-var='phoneassistance']").text("not available");    
                $(".assistance-emergency").hide();
                $(".div-block-324").hide();
            }
            

            $("[data-var='cancel']").attr("href", "https://form.jotform.com/222763047790359?lang=en&contractid=" + cigarId + "&email=" + email);
            $("[data-var='documentupload']").attr("href", "https://form.jotform.com/223391631989063?email=" + email + "&contractReference=" + cigarId + "&language=en");
            $("[data-var='claims']").attr("href", "https://www.qover.com/claims?lang=en&contract=" + cigarId + "&email=" + email);
            $("[data-var='amendlink']").attr("href", "https://qoverme.zendesk.com/hc/fr/requests/new?tf_anonymous_requester_email=" + email);
            $("[data-var='contracttandlink']").attr("href", "https://qoverme.zendesk.com/hc/fr/requests/new?tf_anonymous_requester_email=" + email);

            $("[data-var='explanation-deductible']").text("In case of total loss or theft the maximum amount refunded is EUR " + refundTheft + " and in case of repairs we refund repairs above the deductible of EUR " + Math.round(damageDeductibleAmount * 100) / 100);

            var responseTest = {
                "country": "BE",
                "depreciation": false,
                "damageDeductible": "DAMAGE_DEDUCTIBLE_ENGLISH_10PC",
                "endDate": "2023-08-07T21:59:59.999Z",
                "originalValue": 115200,
                "partnerId": "5e7a295467920985a134f426",
                "startDate": "2022-08-07T22:00:00.000Z",
                "status": "STATUS_OPEN",
                "theftDeductible": "THEFT_DEDUCTIBLE_STANDARD_10PC",
                "variant": "VARIANT_THEFT_DAMAGE_ASSISTANCE"
            };

            /* YOU ARE LOGGED IN*/

            getNinjaData(cigarId, email);

        } else if (this.readyState === 4 && this.status === 400) {
            $("#connected").hide();
            $("#disconnected").show();
            $(".loading").hide();
            console.log(this.status);
            var obj = JSON.parse(this.responseText);
            alert(obj.message);
        }
    });

    xhr.open("POST", "https://api.prd.qover.io/bike/v1/contracts/claim-info?apikey=pk_C0132D71B8C4C4E55690");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(data);
}

function getNinjaData(cigarId, email) {
    var googleSheetUrl = "https://script.google.com/macros/s/AKfycbxMbv5qoBCHH9cYabzTgql7Ml2I0SucLFCy8vYNgdUwzOE8eb1psn5aW7wk7dOvY5M/exec";
    const statusContract = {
        "STATUS_OPEN": "ACTIVE",
        "STATUS_CLOSED": "CLOSED",
        "STATUS_PENDING": "NOT ACTIVE",
        "STATUS_INCOMPLETE": "MISSING DATA"
    }


    var settings = {
        "url": googleSheetUrl,
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "text/plain;charset=utf-8"
        },
        "data": JSON.stringify({
            "cigarId": cigarId,
            "email": email,
            "action": "getContractData"
        }),
    };

    $.ajax(settings).done(function(response) {
        console.log(response);
        $("[data-var='brand']").text(response.payload.risk.make);
        $("[data-var='model']").text(response.payload.risk.model);
        $("[data-var='serial']").text(response.payload.risk.serialNumber);
        $("[data-var='price']").text("EUR " + response.payload.price / 100);
        $("[data-var='status']").text(statusContract[response.payload.status]);


        if (response.payload.status == "STATUS_OPEN" && !response.payload.versionInfo.cancelInformation) {
            console.log("full active")
            $("[data-var='renewal']").text("renewed");
        } else if (response.payload.status == "STATUS_OPEN" && response.payload.versionInfo.cancelInformation.requestCancelAtRenewal == true) {
            console.log("active but cancel at renewal")
            $(".statusdiv").css("background-color", "#FFC1BC")
            $("[data-var='renewal']").text("cancelled");
        } else if (response.payload.status == "STATUS_CLOSED") {
            console.log("closed");
            var cancelDate = new Date(response.payload.versionInfo.effectiveDate);
            $(".statusdiv").css("background-color", "#FFC1BC")
            $("[data-var='renewalorcanceltext']").text("Cancelled on " + cancelDate.toLocaleDateString());
        } else {
            console.log("something else: " + response.payload.status + " - " + response.payload.versionInfo);
        }

        $("[data-var='value']").text("EUR " + response.payload.risk.originalValue / 100);
        $("#bikedata").show();
        $("#connected").show();
        $("#disconnected").hide();
        $(".loading").hide();
    });
}

function logout() {
    $(".loading").show();
    $("#connected").hide();
    $("#disconnected").hide();

    var timeToAdd = 1000 * 60 * 60 * 24 * -1 * 1 * 1;
    var date = new Date();
    var expiryTime = parseInt(date.getTime()) + timeToAdd;
    date.setTime(expiryTime);
    var utcTime = date.toUTCString();

    document.cookie = "login=; expires=" + utcTime + ";";
    document.cookie = "cigarId=; expires=" + utcTime + ";";

    $(".loading").hide();
    $("#disconnected").show();
}

function translateAll() {
    var lang = $('#langinput').find(":selected").val();
    let xhrLocales = new XMLHttpRequest();
    var content = "";
    //https://api.prd.qover.io/i18n/v1/projects/webflow-customer-portal/en.json
    xhrLocales.open("get", "https://api.prd.qover.io/i18n/v1/projects/webflow-customer-portal/" + lang + ".json?refresh=007", true);
    xhrLocales.setRequestHeader("Cache-Control", "max-age=3600");

    xhrLocales.onreadystatechange = function() {
        if (xhrLocales.readyState == 4) {
            if (xhrLocales.status >= 200 && xhrLocales.status < 300 || xhrLocales.status == 304) {
                content = JSON.parse(xhrLocales.responseText);
                $("[data-translation]").each(function(index) {
                    $(this).html(content[$(this).data("translation")]);
                    var text = $(this).html();
                });
            }
        }
    };
    xhrLocales.send();
}