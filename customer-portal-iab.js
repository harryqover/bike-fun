console.warn("v20240430 0928");

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
    "MODEL_S": "https://uploads-ssl.webflow.com/60a4c929fe1abc532b620edf/6333002f43ba3deb577247df_Model%20S%402x.png",
    "MODEL_3": "https://uploads-ssl.webflow.com/60a4c929fe1abc532b620edf/6333002f43ba3d1c337247e3_Model%203%402x.png",
    "MODEL_X": "https://uploads-ssl.webflow.com/60a4c929fe1abc532b620edf/6333002f43ba3d0df37247dd_Model%20X%402x.png",
    "MODEL_Y": "https://uploads-ssl.webflow.com/60a4c929fe1abc532b620edf/6333002f43ba3de2607247e1_Model%20Y%402x.png"
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
$(".head-cp-connected").hide();
$("#disconnected").show();
$("[data-translation='logout']").hide();
$("[data-var='assistance-icon']").hide();

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

    //HIDING EVERYHTING BEHIND LOADING ICON
    $(".loading").show();
    $("#connected").hide();
    $("#disconnected").hide();
    $("#bikedata").hide();
    $(".head-cp-connected").hide();
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
        if(response.payload == "error"){
            console.warn("error while trying to connect");
            $(".loading").hide();
            $("#connected").hide();
            $(".head-cp-connected").hide();
            $("#disconnected").show();
            $("[data-translation='logout']").hide();
            $("[data-var='assistance-icon']").hide();
        } else {
            const currency = response.payload.currency;
            const lang = $('#langinput').find(":selected").val();
            const country = response.payload.refs.country;

            //START create var for zendesk lang based on zendesk locales availabilities
            var zendeskLang = lang+"-"+country.toLowerCase();
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
            //STOP create var for zendesk lang based on zendesk locales availabilities

            if(country == "NL"){
                $("[data-var='transferclaimfreeyears']").show();
                $("[data-var='transferclaimfreeyears']").attr("href", "https://forms.qover.com/233023321061033?contract="+response.payload.cigarId+"&email="+email);
            } else {
                $("[data-var='transferclaimfreeyears']").hide();
            }

            //START adding dynamic info from ninja on page
            $("[data-var='brand']").text(makeTranslation[response.payload.risk.make]);
            $("[data-var='model']").text(modelTranslation[response.payload.risk.model]);
            $("[data-var='mileage']").text(mileageTranslation[response.payload.risk.yearMileageKm]+translations['peryear']);
            $("[data-var='seconddriver']").text(translations[response.payload.risk.hasSecondDriver]);
            $("[data-var='registrationPlate']").text(response.payload.risk.registrationPlate);
            $("[data-var='vin']").text(response.payload.risk.vin);
            $("[data-var='status']").text(statusContract[response.payload.status]);
            $("[data-var='product']").text(variants[response.payload.terms.variant]);
            $("[data-var='cigarid']").text(response.payload.cigarId);
            var start = new Date(response.payload.start);
            var end = new Date(response.payload.end);
            $("[data-var='start']").text(start.toLocaleDateString());
            $("[data-var='end']").text(end.toLocaleDateString());
            $("[data-var='phone']").text(qoverPhone[response.payload.refs.country]);
            $("[data-var='teslamodelimg']").attr("src",modelPic[response.payload.risk.model]);
            $("[data-var='teslamodelimg']").attr("srcset",modelPic[response.payload.risk.model]);
            $("[data-var='value']").text(currency+ " " + response.payload.risk.originalValue / 100);
            //STOP adding dynamic info from ninja on page

            //START adding interactions
            //$('[data-var="greencardbypost"]').attr('href','https://forms.qover.com/230804510892049?contractReference='+response.payload.cigarId);
            $('[data-var="greencardbypost"]').attr("href", "https://insuremytesla.zendesk.com/hc/"+zendeskLang+"/requests/new?tf_description=Contract%20reference:%20"+cigarId+"&tf_anonymous_requester_email=" + email);
            $("[data-var='resendcontract']").click(function() {
              reSendEmail();
            });
            //$("[data-var='requeststatementofinformation']").attr("href", "https://insuremytesla.zendesk.com/hc/"+zendeskLang+"/requests/new?tf_description=Contract%20reference:%20"+cigarId+"&tf_anonymous_requester_email=" + email);
            $("[data-var='requeststatementofinformation']").click(function() {
              sendClaimsAttestation();
            });
            $("[data-var='amendlink']").attr("href", "https://insuremytesla.zendesk.com/hc/"+zendeskLang+"/requests/new?tf_4414496783761=iab_amend&tf_description=Contract%20reference:%20"+response.payload.cigarId+"&tf_anonymous_requester_email=" + email);
            $("[data-var='contracttandlink']").attr("href", "https://insuremytesla.zendesk.com/hc/"+zendeskLang);
            //$("[data-var='cancel']").attr("href", "https://insuremytesla.zendesk.com/hc/"+zendeskLang+"/requests/new?tf_description=Contract%20reference:%20"+response.payload.cigarId+"&tf_anonymous_requester_email=" + email);
            $("[data-var='cancel']").attr("href", "https://forms.qover.com/231272799262059?partner=tesla&language="+lang+"&email=" + email+"&contract=" + response.payload.cigarId);
            $("[data-var='contact']").attr("href", "https://insuremytesla.zendesk.com/hc/"+zendeskLang+"/requests/new?tf_description=Contract%20reference:%20"+response.payload.cigarId+"&tf_anonymous_requester_email=" + email);
            $("[data-var='makeaclaim']").attr("href", "https://insuremytesla.qover.com/claims?language="+lang);
            //STOP adding interactions 

            //START RENEWAL BLOCK
            if(response.payload.nextVersion){
               $("[data-var='mileagerenewal']").text(mileageTranslation[response.payload.nextVersion.risk.yearMileageKm]+translations['peryear']);
               $("[data-var='seconddriverrenewal']").text(translations[response.payload.nextVersion.risk.hasSecondDriver]);
               //var lang = $('#langinput').find(":selected").val()
               var startRenew = new Date(response.payload.nextVersion.start);
               $("[data-var='startrenewal']").text(startRenew.toLocaleDateString());
               $("[data-var='linkrenewal']").attr("href","https://app.qover.com/iab/contracts/"+response.payload.contractId+"/renewal?key="+response.payload.pkey+"&locale="+response.payload.language+"-"+response.payload.refs.country)
               $("[data-var='renewalblock']").show();
            } else {
                $("[data-var='renewalblock']").hide();
            }
            //STOP RENEWAL BLOCK

            //START show incomplete banner if STATUS_INCOMPLETE
            if(response.payload.status == "STATUS_INCOMPLETE" && allowedLinkIncomplete.includes(response.payload.refs.country)){
                $("[data-var='incompleteblock']").show();
                $("[data-var='linkincomplete']").attr('href','https://app.qover.com/iab/contracts/'+response.payload.contractId+'/missing-data?key='+response.payload.pkey+'&locale='+response.payload.language+'-'+response.payload.refs.country)
            } else {
                $("[data-var='incompleteblock']").hide();
            }
            //STOP show incomplete banner if STATUS_INCOMPLETE

            //START action to display/hide block to request Qover to cancel old contract cfr Loi Hamon in France
            //We want to show this block only within the first 2 months after purchase date
            var purchaseDate = new Date(response.payload.purchaseDate);
            var today = new Date();
            var diffInMonths = (today.getFullYear() - purchaseDate.getFullYear()) * 12 + (today.getMonth() - purchaseDate.getMonth());

            if(response.payload.refs.country == "FR" && diffInMonths <= 2){
                $("[data-var='requestcanceloldcontract']").show();
                $("[data-var='requestcanceloldcontract']").attr('href','https://forms.qover.com/230812152139044?contractReference='+response.payload.cigarId+'&registrationPlate='+response.payload.risk.registrationPlate)
            } else {
                $("[data-var='requestcanceloldcontract']").hide();
            }
            //END action to display/hide block to request Qover to cancel old contract cfr Loi Hamon in France

            //START show button to request invoice for companies
            if(response.payload.entityType == "ENTITY_TYPE_COMPANY"){
                 $("[data-var='requestinvoice']").show();
                 //$("[data-var='requestinvoice']").attr('onclick','alert("we still need to implement this")');
                 $("[data-var='requestinvoice']").attr("href", "https://insuremytesla.zendesk.com/hc/"+zendeskLang+"/requests/new?tf_description=Contract%20reference:%20"+response.payload.cigarId+"&tf_anonymous_requester_email=" + email);
            } else {
                $("[data-var='requestinvoice']").hide();
            }
            //END show button to request invoice for companies

            //START hide stuff not available for pending contracts
            if(response.payload.status == "STATUS_PENDING"){
                
            }
            //END hide stuff not available for pending contracts
            
            //START show prices information
            if(response.payload.paymentMethod != "PAYMENT_METHOD_SEPADD"){
                //showing only price per year
                $(".permonth").hide();
                $("[data-var='price']").text(currency+ " " + formatPrice(response.payload.price));
                if(response.payload.nextVersion){
                    $("[data-var='pricerenewal']").text(currency+ " " + formatPrice(response.payload.nextVersion.price));
                }
            } else {
                //showing only price per month
                $(".peryear").hide();
                $("[data-var='pricepermonth']").text(currency+ " " + formatPrice(response.payload.price/12));
                if(response.payload.nextVersion){
                    $("[data-var='pricepermonthrenewal']").text(currency+ " " + formatPrice(response.payload.nextVersion.price/12));
                }
            }
            //STOP show prices information
            
            //START show correct renewal status and color
            if ((response.payload.status == "STATUS_OPEN" || response.payload.status == "STATUS_INCOMPLETE") && !response.payload.versionInfo.cancelInformation) {
                console.log("full active")
                $("[data-var='renewal']").text(translations['renewed']);
                $(".statusdiv").css("background-color", "#80cc7a")
            } else if ((response.payload.status == "STATUS_OPEN" || response.payload.status == "STATUS_INCOMPLETE") && response.payload.versionInfo.cancelInformation.requestCancelAtRenewal == true) {
                console.log("active but cancel at renewal")
                $(".statusdiv").css("background-color", "#FFC1BC");
                $("[data-var='renewal']").text(translations['cancelled']);
            } else if (response.payload.status == "STATUS_CLOSED") {
                console.log("closed");
                var cancelDate = new Date(response.payload.versionInfo.effectiveDate);
                $(".statusdiv").css("background-color", "#FFC1BC")
                $("[data-var='renewal']").text(translations['cancelledon']+ " " + cancelDate.toLocaleDateString());
                $("[data-var='cancel']").hide();
                $("[data-var='greencardbypost']").hide();
            } else if (response.payload.status == "STATUS_PENDING") {
                $(".statusdiv").css("background-color", "#FFC1BC");
                $("[data-var='makeaclaim']").hide();
                $("[data-var='greencardbypost']").hide();
                $("[data-var='requeststatementofinformation']").hide();
                $("[data-var='start']").text(translations['notavailable']);
                $("[data-var='end']").text(translations['notavailable']);
                $("[data-translation='requestresendcontractgreencard'").text(translations['resendemailpending']);
                if(!response.payload.risk.registrationPlate){
                    $("[data-var='registrationPlate']").text(translations['missing']);
                }            
                if(!response.payload.risk.vin){
                    $("[data-var='vin']").text(translations['missing']);
                }
            } else {
                console.log("something else: " + response.payload.status + " - " + response.payload.versionInfo);
            }
            //STOP show correct renewal status and color

            //START hide incomplete status for DE
            if (response.payload.status == "STATUS_INCOMPLETE" && (response.payload.refs.country == "DE"||response.payload.refs.country == "NL")) {
                $(".statusdiv").hide();
            }
            //STOP hide incomplete status for DE

            //START show assistance block if SILVER or GOLD
            if(response.payload.terms.variant == "VARIANT_SILVER" || response.payload.terms.variant == "VARIANT_GOLD"){
                $("[data-var='phoneassistance']").text(assistancePhone[response.payload.refs.country]);
                $("[data-var='assistance-icon']").show();
            } else {
                $("[data-var='phoneassistance']").text("not available");    
                $("[data-var='assistance-icon']").hide();
            }
            //STOP show assistance block if SILVER or GOLD

            
            //SHOWING BACK ALL BLOCKS AFTER COMPUTING EVERYTHING
            $("#bikedata").show();
            $("#connected").show();
            $(".loading-resend-email").hide();
            $("#disconnected").hide();
            $(".loading").hide();
            $(".head-cp-connected").show();
            getBanners("IAB", lang);

        }

        
        
        
    });
}

function logout() {
    $(".loading").show();
    $("#connected").hide();
    $("#disconnected").hide();
    $(".alert-banner").remove();

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
                //translate all data attributes that contains data-translation
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
    $("[data-translation='requestresendcontractgreencard']").text(translations['waitwhilesending']);
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
        $("[data-translation='requestresendcontractgreencard']").text(translations['emailsent']);
        $("[data-translation='requestresendcontractgreencard']").show();
    });
}

function sendClaimsAttestation(){
    $("[data-translation='requeststatementofinformation']").text(translations['waitwhilesending']);
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
            "request": "claimsAttestation",
            "product": "IAB",
            "versionNumber": window.payloadFromNinja.payload.versionInfo.versionNumber
        }),
    };
    $.ajax(settings).done(function(response) {
        console.log(response);
        $(".loading-resend-email").hide();
        $("[data-translation='requeststatementofinformation']").text(translations['emailsent']);
        $("[data-translation='requeststatementofinformation']").show();
    });
}

function formatPrice(amount){
    amount = amount /100;
    amount = amount.toFixed(2);
    return amount
}


function getBanners(product, lang) {
    var googleSheetUrl = "https://script.google.com/macros/s/AKfycbyuWuOPkdF-6k1KzVCpd9rt-3_5rTw6LjhmSE3zsm66eCph9D5GI8GSp9PWGjd4-N2J/exec";

    var settings = {
        "url": googleSheetUrl,
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "text/plain;charset=utf-8"
        },
        "data": JSON.stringify({
            "product": product,
            "lang": lang
        }),
    };

    $.ajax(settings).done(function(response) {
        if(response.payload.message){
            console.log(response.payload.message);
            var divAlert = "<div class='alert-banner' style='background-color:"+response.payload.backgroundColor+";line-height: 1.3em;padding: 10px 30px;display:flex;justify-content: center;'>";
divAlert = divAlert + "<span style='color:"+response.payload.textColor+";'>"+response.payload.message+"</span>";
divAlert = divAlert + "</div>";

$( "body" ).prepend(divAlert);
        }
        console.log(response);
    });
}


