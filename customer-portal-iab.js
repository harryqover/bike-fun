console.warn("v20230320 1605");
const cowboyIds = ["60a75f9f987d3f484ed24ef4", "607937e4654780240a132641", "60938efba79100e71519a03b", "5ff6cf4fceba6039aadb446f", "61b1c260415df342d60f4e10", "61b1b145415df342d60f4e0f", "61b1d0a02656f6227dc3476f", "61b8a43042cef3c0bc2cc26d", "61b8a49f11e584fcae0ee070", "61b8a45842cef3c0bc2cc26e", "61b8a4c211e584fcae0ee071", "61b8a4e807007c0a5b94d673", "61b8a51111e584fcae0ee072", "61b8a52111e584fcae0ee073"];
const cowboyAlteosIds = ["5ff6cf4fceba6039aadb446f", "60938efba79100e71519a03b", "607937e4654780240a132641", "61b1b145415df342d60f4e0f", "61b1c260415df342d60f4e10", "60a75f9f987d3f484ed24ef4"]

//const partnerWith120Fee = ["606c50af2c855b773d15fd37","5ff6cf4fceba6039aadb446f","60938efba79100e71519a03b","607937e4654780240a132641","6239bdc7b96b08fbe8142622","63736c55e19342075afe9cc4","621e2870bcd73ab2d2550568","6373a0d1a5d163f0f6f59931","61b8a51111e584fcae0ee072","61b1b145415df342d60f4e0f","61b8a52111e584fcae0ee073","61b1d0a02656f6227dc3476f","61b8a4c211e584fcae0ee071","62cd828ecb175250d8e1fbc4","61b8a45842cef3c0bc2cc26e","61b8a49f11e584fcae0ee070","61b8a4e807007c0a5b94d673","61b1c260415df342d60f4e10","61b8a43042cef3c0bc2cc26d","60a75f9f987d3f484ed24ef4","62cd81bd736462368428da2b","63736c4da5d163f0f6f5992f","63736caba5d163f0f6f59930","62cd81b2736462368428da27","63736ca28d4465756472b505","63736c3fa5d163f0f6f5992e","63736c9c8d4465756472b504","63736c37e19342075afe9cc3","63736c958d4465756472b503","63736c2a8d4465756472b502","63736c86e19342075afe9cc5",]
const partnerWith120Fee = ["606c50af2c855b773d15fd37"]

const variants = {
    "VARIANT_SILVER": "Preferred",
    "VARIANT_GOLD": "Complete",
    "VARIANT_BRONZE": "Essential"
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

const makeTranslation = {
    "MAKE_TESLA": "Tesla"
};
const modelTranslation = {
    "MODEL_S": "Model S",
    "MODEL_E": "Model E",
    "MODEL_X": "Model X",
    "MODEL_Y": "Model Y"
};

const mileageTranslation = {
    "MILEAGE_0TO9999": "0 - 9.999 km",
    "MILEAGE_10000TO14999": "10.000 - 14.999 km",
    "MILEAGE_15000TO19999": "15.000 - 19.999 km",
    "MILEAGE_20000TO24999": "20.000 - 24.999 km",
    "MILEAGE_25000TO29999": "25.000 - 29.999 km",
    "MILEAGE_OVER30000": ">30.000 km"
};


var translations;
var refundDamage = 0;
var refundTheft = 0;
var damageDeductibleAmount = 0;

$(".loading").hide();
$("#connected").hide();
$("#disconnected").show();
$("[data-translation='logout']").hide();

var login = getCookie("login");
var cigarId = getCookie("cigarId");
/*
if (login && cigarId) {
    goLogin(cigarId, login);
}
*/

setTimeout(function() {
    $("#email").val(getParameterByName("email"));
    $("#cigardid").val(getParameterByName("contract"));
    //getTranslation();
}, 1500);

function clickToLogin() {
    var cigarId = $('input[name="name"]').val();
    var email = $('input[name="email"]').val();
    goLogin(cigarId, email);
}

function goLogin(cigarId, email) {
    console.log("start goLogin")
    translateAll();
    $(".loading").show();
    $("#connected").hide();
    $("#disconnected").hide();
    $("#bikedata").hide();
    console.log("loading should be visible")
    getNinjaData(cigarId, email);
    $("[data-translation='logout']").show();
}

function getNinjaData(cigarId, email) {
    var googleSheetUrl = "https://script.google.com/macros/s/AKfycbxw_NiE8wEmOykXDcnaM6vzVfS6bYdv-Ne6bQmo-IBi0IvlKpSUW-6IAVxq5AwqrGasoQ/exec";
    const statusContract = {
        "STATUS_OPEN": translations['active'],
        "STATUS_CLOSED": translations['closed'],
        "STATUS_PENDING": translations['notactive'],
        "STATUS_INCOMPLETE": translations['missingdata']
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
        window.payloadFromNinja = response;
        const currency = response.payload.currency;
        $("[data-var='brand']").text(makeTranslation[response.payload.risk.make]);
        $("[data-var='model']").text(modelTranslation[response.payload.risk.model]);
        $("[data-var='mileage']").text(mileageTranslation[response.payload.risk.yearMileageKm]+translations['peryear']);
        $("[data-var='bonusmalus']").text(response.payload.risk.bonusMalus);
        $("[data-var='seconddriver']").text(response.payload.risk.hasSecondDriver);
        
        $("[data-var='registrationPlate']").text(response.payload.risk.registrationPlate);
        $("[data-var='vin']").text(response.payload.risk.vin);

        $("[data-var='resendcontract']").click(function() {
          reSendEmail();
        });
        

        if(response.payload != "PAYMENT_METHOD_SEPADD"){
            //showing only price per year
            $(".permonth").hide();
            $("[data-var='price']").text("EUR " + response.payload.price / 100);
        } else {
            //showing only price per month
            $(".peryear").hide();
            $("[data-var='pricepermonth']").text("EUR " + response.payload.price / 100 / 12);
        }
        
        $("[data-var='status']").text(statusContract[response.payload.status]);
        $("[data-var='product']").text(translations['iabproduct']);
        $("[data-var='cigarid']").text(cigarId);
        var start = new Date(response.payload.start);
        var end = new Date(response.payload.end);
        $("[data-var='start']").text(start.toLocaleDateString());
        $("[data-var='end']").text(end.toLocaleDateString());
        $("[data-var='phone']").text(qoverPhone[response.payload.refs.country]);

        var lang = $('#langinput').find(":selected").val();
        var country = response.payload.refs.country;

        var zendeskLang = lang+"-"+country.toLowerCase();

        if (country == "NL"){
            zendeskLang = (lang == "nl") ? "nl":"en-"+country.toLowerCase();
        } else if (country == "FR"){
            zendeskLang = (lang == "fr") ? "fr":"en-"+country.toLowerCase();
        } else if (country == "DE"){
            zendeskLang = (lang == "de") ? "de":"en-"+country.toLowerCase();
        } else if (country == "ES"){
            zendeskLang = (lang == "es") ? "es":"en-"+country.toLowerCase();
        } else if (country == "PT"){
            zendeskLang = (lang == "pt") ? "pt":"en-"+country.toLowerCase();
        }

        $("[data-var='amendlink']").attr("href", "https://insuremytesla.zendesk.com/hc/"+zendeskLang+"/requests/new?tf_4414433182481=iab_amend&tf_description=Contract%20reference:%20"+cigarId+"&tf_anonymous_requester_email=" + email);
        $("[data-var='contracttandlink']").attr("href", "https://insuremytesla.zendesk.com/hc/"+zendeskLang);
        $("[data-var='cancel']").attr("href", "https://insuremytesla.zendesk.com/hc/"+zendeskLang+"/requests/new?tf_4414433182481=iab_cancel&tf_description=Contract%20reference:%20"+cigarId+"&tf_anonymous_requester_email=" + email);
        $("[data-var='documentupload']").attr("href", "https://insuremytesla.zendesk.com/hc/"+zendeskLang+"/requests/new?tf_4414433182481=iab_upload&tf_description=Contract%20reference:%20"+cigarId+"&tf_anonymous_requester_email=" + email);
        $("[data-var='makeaclaim']").attr("href", "https://www.qover.com/claims?lang="+lang+"&contract=" + cigarId + "&email=" + email);
        /*
            $("[data-var='cancel']").attr("href", "https://form.jotform.com/230021764194349?language="+lang+"&cigarid=" + cigarId + "&email=" + email);
            $("[data-var='documentupload']").attr("href", "https://qover.jotform.com/223391631989063?email=" + email + "&contractReference=" + cigarId + "&language="+lang);
            $("[data-var='claims']").attr("href", "https://www.qover.com/claims?lang="+lang+"&contract=" + cigarId + "&email=" + email);
            
            $("[data-var='1starlink']").attr("href","https://harryqover.github.io/bike-fun/reviewQover?r=1&c=" + cigarId + "&l="+lang+"&s=customer_portal");
            $("[data-var='2starlink']").attr("href","https://harryqover.github.io/bike-fun/reviewQover?r=2&c=" + cigarId + "&l="+lang+"&s=customer_portal");
            $("[data-var='3starlink']").attr("href","https://harryqover.github.io/bike-fun/reviewQover?r=3&c=" + cigarId + "&l="+lang+"&s=customer_portal");
            $("[data-var='4starlink']").attr("href","https://harryqover.github.io/bike-fun/reviewQover?r=4&c=" + cigarId + "&l="+lang+"&s=customer_portal");
            $("[data-var='5starlink']").attr("href","https://harryqover.github.io/bike-fun/reviewQover?r=5&c=" + cigarId + "&l="+lang+"&s=customer_portal");

        */


        if ((response.payload.status == "STATUS_OPEN" || response.payload.status == "STATUS_INCOMPLETE") && !response.payload.versionInfo.cancelInformation) {
            console.log("full active")
            $("[data-var='renewal']").text(translations['renewed']);
        } else if ((response.payload.status == "STATUS_OPEN" || response.payload.status == "STATUS_INCOMPLETE") && response.payload.versionInfo.cancelInformation.requestCancelAtRenewal == true) {
            console.log("active but cancel at renewal")
            $(".statusdiv").css("background-color", "#FFC1BC")
            $("[data-var='renewal']").text(translations['cancelled']);
        } else if (response.payload.status == "STATUS_CLOSED") {
            console.log("closed");
            var cancelDate = new Date(response.payload.versionInfo.effectiveDate);
            $(".statusdiv").css("background-color", "#FFC1BC")
            $("[data-var='renewalorcanceltext']").text(translations['cancelledon']+" " + cancelDate.toLocaleDateString());
        } else {
            console.log("something else: " + response.payload.status + " - " + response.payload.versionInfo);
        }

        if(response.payload.terms.variant == "VARIANT_SILVER" || response.payload.terms.variant == "VARIANT_GOLD"){
            $("[data-var='phoneassistance']").text(assistancePhone[response.payload.refs.country]);
            //$("[data-var='explanation-deductible']").text(translations['incaseoftheft']+ " "+ currency + " " + refundTheft + " "+translations['incaseofdamage']+ " "+ currency + " " + Math.round(damageDeductibleAmount * 100) / 100);
        } else {
            $("[data-var='phoneassistance']").text("not available");    
            $(".assistance-emergency").hide();
            //$(".div-block-324").hide();
        }



        $("[data-var='value']").text(currency+" " + response.payload.risk.originalValue / 100);

        $("#bikedata").show();
        $("#connected").show();
        $(".loading-resend-email").hide();
        $("#disconnected").hide();
        $(".loading").hide();
        var lang = $('#langinput').find(":selected").val();
        /* HIDE JOTFORM FEEDBACK
        if(lang == "fr" || lang == "en"){
            startJotformFeedback();
            setTimeout(function() { 
                window.open( 'https://qover.jotform.com/230382756620354?contract='+cigarId+'&language='+lang, 'blank', 'scrollbars=yes, toolbar=no, width=700, height=1000' )    
            }, 5000);    
        }
        */
        
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
    $("#cigardid,#email").val('');

    $(".loading").hide();
    $("#disconnected").show();
    $("[data-translation='logout']").hide();
}

function translateAll() {
    var lang = $('#langinput').find(":selected").val();
    let xhrLocales = new XMLHttpRequest();
    var content = "";
    xhrLocales.open("get", "https://api.prd.qover.io/i18n/v1/projects/webflow-customer-portal/" + lang + ".json?refresh=007", true);
    xhrLocales.setRequestHeader("Cache-Control", "max-age=3600");

    xhrLocales.onreadystatechange = function() {
        if (xhrLocales.readyState == 4) {
            if (xhrLocales.status >= 200 && xhrLocales.status < 300 || xhrLocales.status == 304) {
                content = JSON.parse(xhrLocales.responseText);
                window.translations = content;
                console.log(window.translations);
                $("[data-translation]").each(function(index) {
                    $(this).html(content[$(this).data("translation")]);
                    var text = $(this).html();
                });
            }
        }
    };
    xhrLocales.send();
}
translateAll();

function trck(cigarId, click) {
    var googleSheetUrl = "https://script.google.com/macros/s/AKfycbxw_NiE8wEmOykXDcnaM6vzVfS6bYdv-Ne6bQmo-IBi0IvlKpSUW-6IAVxq5AwqrGasoQ/exec";

    var settings = {
        "url": googleSheetUrl,
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "text/plain;charset=utf-8"
        },
        "data": JSON.stringify({
            "cigarId": cigarId,
            "click": click,
            "action": "trck"
        }),
    };

    $.ajax(settings).done(function(response) {
        console.log(response);
    });
}

$(function(){
    $("[data-var]").click(function() {
        var clickedThing = $(this).data('var');
        var cigarId = $("#cigardid").val();
        trck(cigarId, clickedThing)
    });
});


function reSendEmail(){
    $(".loading-resend-email").show();
    $("[data-translation='requestresendcontract']").hide();
    var googleSheetUrl = "https://script.google.com/macros/s/AKfycbxeGtXJNhmovLSnsMqB7OALejUUqEeLEFS3vLetKRyujIkERQH-VmVy9gAXOqNX5j6zeQ/exec";

    var settings = {
        "url": googleSheetUrl,
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "text/plain;charset=utf-8"
        },
        "data": JSON.stringify({
            "contractId": "looks-like-a-contractid",
            "request": "contract",
            "product": "BIKE"
        }),
    };

    $.ajax(settings).done(function(response) {
        console.log(response);
        $(".loading-resend-email").hide();
        $("[data-translation='requestresendcontract']").text("sent");
        $("[data-translation='requestresendcontract']").show();
    });
}