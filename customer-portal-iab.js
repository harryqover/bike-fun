console.warn("v20230323 1008");

const variants = {
    "VARIANT_SILVER": "Preferred",
    "VARIANT_GOLD": "Complete",
    "VARIANT_BRONZE": "Essential"
}

const assistancePhone = {
    "BE" : "+32 2 320 39 75",
    "ES" : "+34 900 431 710",
    "AT" : "+43 800 007 018",
    "FR" : "+33 9 71 07 28 38",
    "DE" : "+49 800 000 96 19",
    "NL" : "+31 800 020 03 62",
    "PT" : "+351 800 181 521",
    "DK" : "+45 89 87 06 42"
};

const qoverPhone = {
    "BE" : "+32 2 588 25 50",
    "FR" : "+33 9 74 99 61 71",
    "DE" : "+49 800 000 96 19",
    "NL" : "+31 800 020 03 62",
    "ES" : "+34 900 838 023",
    "PT" : "+351 882 880 091",
    "AT" : "+43 800 007 018",
    "DK" : "+45 89 87 06 42"
};

const makeTranslation = {
    "MAKE_TESLA": "Tesla"
};
const modelTranslation = {
    "MODEL_S": "Model S",
    "MODEL_3": "Model 3",
    "MODEL_X": "Model X",
    "MODEL_Y": "Model Y"
};
const modelPic = {
    "MODEL_S": "https://uploads-ssl.webflow.com/60a4c929fe1abc532b620edf/64218f31a4c76c265ae9b4e9_Capture%20d%E2%80%99e%CC%81cran%202023-03-27%20a%CC%80%2014.40.55.png",
    "MODEL_3": "https://uploads-ssl.webflow.com/60a4c929fe1abc532b620edf/64218f3c3c62b4c04a258d07_model3.webp",
    "MODEL_X": "https://uploads-ssl.webflow.com/60a4c929fe1abc532b620edf/64218f3d85883ccb22a490e2_X.png",
    "MODEL_Y": "https://uploads-ssl.webflow.com/60a4c929fe1abc532b620edf/64218f3c1b100d7ddf18da62_Y.png"
};

const mileageTranslation = {
    "MILEAGE_0TO9999": "0 - 9.999 km",
    "MILEAGE_10000TO14999": "10.000 - 14.999 km",
    "MILEAGE_15000TO19999": "15.000 - 19.999 km",
    "MILEAGE_20000TO24999": "20.000 - 24.999 km",
    "MILEAGE_25000TO29999": "25.000 - 29.999 km",
    "MILEAGE_OVER30000": ">30.000 km"
};

const allowedLinkIncomplete = ["AT", "FR"]

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
        //$("[data-var='bonusmalus']").text(response.payload.risk.bonusMalus);
        $("[data-var='seconddriver']").text(translations[response.payload.risk.hasSecondDriver]);

        $('[data-var="greencardbypost"]').attr('href','https://forms.qover.com/230804510892049?contractReference='+cigarId);
        
        $("[data-var='registrationPlate']").text(response.payload.risk.registrationPlate);
        $("[data-var='vin']").text(response.payload.risk.vin);

        $("[data-var='resendcontract']").click(function() {
          reSendEmail();
        });

        if(response.payload.nextVersion){
           $("[data-var='mileagerenewal']").text(mileageTranslation[response.payload.nextVersion.risk.yearMileageKm]+translations['peryear']);
           $("[data-var='seconddriverrenewal']").text(translations[response.payload.nextVersion.risk.hasSecondDriver]);
           var lang = $('#langinput').find(":selected").val()
           $("[data-var='linkrenewal']").attr("href","https://app.qover.com/iab/contracts/"+response.payload.contractId+"/renewal?key=pk_8608895FC72565DF474D&locale="+response.payload.language+"-"+response.payload.refs.country)
           $("[data-var='renewalblock']").show();
        } else {
            $("[data-var='renewalblock']").hide();
        }

        if(response.payload.status == "STATUS_INCOMPLETE" && allowedLinkIncomplete.includes(response.payload.refs.country)){
            $("[data-var='incompleteblock']").show();
            $("[data-var='linkincomplete']").attr('href','https://app.qover.com/iab/contracts/'+response.payload.contractId+'/missing-data?key=pk_8608895FC72565DF474D&locale='+response.payload.language+'-'+response.payload.refs.country)
        } else {
            $("[data-var='incompleteblock']").hide();
        }

        $("[data-var='requeststatementofinformation']").attr('onclick','alert("we still need to implement this")');

        //START action to display/hide block to request Qover to cancel old contract cfr Loi Hamon in France
        //We want to show this block only within the first 2 months after purchase date
        var purchaseDate = new Date(response.payload.purchaseDate);
        var today = new Date();
        var diffInMonths = (today.getFullYear() - purchaseDate.getFullYear()) * 12 + (today.getMonth() - purchaseDate.getMonth());

        if(response.payload.refs.country == "FR" && diffInMonths <= 2){
            $("[data-var='requestcanceloldcontract']").show();
            $("[data-var='requestcanceloldcontract']").attr('href','https://forms.qover.com/230812152139044?contractReference='+cigarId+'&registrationPlate='+response.payload.risk.registrationPlate)
        } else {
            $("[data-var='requestcanceloldcontract']").hide();
        }
        //END action to display/hide block to request Qover to cancel old contract cfr Loi Hamon in France

        //START show button to request invoice for companies
        if(response.payload.entityType == "ENTITY_TYPE_COMPANY"){
             $("[data-var='requestinvoice']").show();
             $("[data-var='requestinvoice']").attr('onclick','alert("we still need to implement this")');
        } else {
            $("[data-var='requestinvoice']").hide();
        }
        //END show button to request invoice for companies
        

        if(response.payload.paymentMethod != "PAYMENT_METHOD_SEPADD"){
            //showing only price per year
            $(".permonth").hide();
            $("[data-var='price']").text("EUR " + formatPrice(response.payload.price));
            if(response.payload.nextVersion){
                $("[data-var='pricerenewal']").text("EUR " + formatPrice(response.payload.nextVersion.price));
            }
        } else {
            //showing only price per month
            $(".peryear").hide();
            $("[data-var='pricepermonth']").text("EUR " + formatPrice(response.payload.price/12));
            if(response.payload.nextVersion){
                $("[data-var='pricepermonthrenewal']").text("EUR " + formatPrice(response.payload.nextVersion.price/12));
            }
        }
        
        $("[data-var='status']").text(statusContract[response.payload.status]);
        $("[data-var='product']").text(variants[response.payload.terms.variant]);
        $("[data-var='cigarid']").text(cigarId);
        var start = new Date(response.payload.start);
        var end = new Date(response.payload.end);
        $("[data-var='start']").text(start.toLocaleDateString());
        $("[data-var='end']").text(end.toLocaleDateString());
        $("[data-var='phone']").text(qoverPhone[response.payload.refs.country]);

        var lang = $('#langinput').find(":selected").val();
        var country = response.payload.refs.country;

        var zendeskLang = lang+"-"+country.toLowerCase();
        console.log("country: ", country);
        if (country == "NL"){
            zendeskLang = (lang == "nl") ? "nl":"en-"+country.toLowerCase();
        } else if (country == "FR"){
            zendeskLang = "fr";
        } else if (country == "DE"){
            zendeskLang = "de";
        } else if (country == "ES"){
            zendeskLang = "es";
        } else if (country == "PT"){
            zendeskLang = "pt";
        } else if (country == "DK"){
            zendeskLang = "da-dk";
        } else if (country == "AT"){
            zendeskLang = (lang == "de") ? "de-at":"en-at";
        }

        //english only in AT, BE, NL

        console.log("zendeskLang: ", zendeskLang);

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

        $("[data-var='teslamodelimg']").text("src",modelPic[response.payload.risk.model]);


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
            "contractId": window.payloadFromNinja.payload.contractId,
            "request": "contract",
            "product": "IAB",
            "versionNumber": window.payloadFromNinja.payload.versionInfo.versionNumber
        }),
    };

    $.ajax(settings).done(function(response) {
        console.log(response);
        $(".loading-resend-email").hide();
        $("[data-translation='requestresendcontract']").text(translations['emailsent']);
        $("[data-translation='requestresendcontract']").show();
    });
}

function formatPrice(amount){
    amount = amount /100;
    amount = amount.toFixed(2);
    return amount
}