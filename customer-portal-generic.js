console.warn("v20240614 1305");

const variants = {
    "VARIANT_SILVER": "Preferred",
    "VARIANT_GOLD": "Complete",
    "VARIANT_BRONZE": "Essential"
}

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


const allowedLinkIncomplete = ["AT", "FR"]

var translations;
var refundDamage = 0;
var refundTheft = 0;
var damageDeductibleAmount = 0;

$(".loading").hide();
$(".connected").hide();
$(".head-cp-connected").hide();
$(".disconnected").show();
$("[data-trans='logout']").hide();
$("[data-var='assistance-icon']").hide();


//var login = getCookie("login");
//var cigarId = getCookie("cigarId");


setTimeout(function() {
    $("#email").val(getParameterByName("email"));
    $("#cigardid").val(getParameterByName("contract"));
    $(".loading").hide();
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
    $(".connected").hide();
    $(".disconnected").hide();
    $("#bikedata").hide();
    $(".head-cp-connected").hide();
    getNinjaData(cigarId, email);
    $("[data-trans='logout']").show();
}

function getNinjaData(cigarId, email) {
    var googleSheetUrl = "https://script.google.com/macros/s/AKfycbz_c5JuP0Z5nLgd-Kge_ybU6kebIl4gmoSDEAJjNW-xCcCvWOGSfItOtGn7QsiYm1dZ/exec";
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
            $(".connected").hide();
            $(".head-cp-connected").hide();
            $(".disconnected").show();
            $("[data-trans='logout']").hide();
            $("[data-var='assistance-icon']").hide();
        } else {
            const currency = response.payload.currency;
            const lang = $('#langinput').find(":selected").val();
            const country = response.payload.refs.country;
            const product = response.payload.refs.product;

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
            var zendeskSubDomain = "qover";
            if(product == "IAB"){
                zendeskSubDomain = (partnerId == "6569f1426a95fa27a3fd6302")?"helvetia-asg":zendeskSubDomain;
                zendeskSubDomain = (partnerId == "61001af3ededf75733d1c157")?"insuremytesla":zendeskSubDomain;
                zendeskSubDomain = (partnerId == "63cfa5a0f6e5d3d875610048")?"insuremytesla":zendeskSubDomain;
                zendeskSubDomain = (partnerId == "656857420de6ea64bb52529d")?"insuremytesla":zendeskSubDomain;
            }
            if(product == "BIKE"){
                zendeskSubDomain = "qoverme";
            }

            
            //STOP create var for zendesk lang based on zendesk locales availabilities

            if(country == "NL"){
                $("[data-var='transferclaimfreeyears']").show();
                $("[data-var='transferclaimfreeyears']").attr("href", "https://forms.qover.com/233023321061033?contract="+response.payload.cigarId+"&email="+email);
            } else {
                $("[data-var='transferclaimfreeyears']").hide();
            }




            //START adding dynamic info from ninja on page
            if(response.payload.risk.description == ""){
                $("#riskDescription-block").hide();
            } else {
                $("#riskDescription-block > div.label").text(translations['riskDescription_'+product]);
                $("[data-var='riskDescription']").text(response.payload.risk.description);
            }
            if(response.payload.risk.type == ""){
                $("#riskType-block").hide();
            } else {
                $("#riskType-block > div.label").text(translations['riskType_'+product]);
                $("[data-var='riskType']").text(response.payload.risk.type);
            }
            if(response.payload.risk.purchaseDate == ""){
                $("#riskPurchaseDate-block").hide();
            } else {
                $("#riskPurchaseDate-block > div.label").text(translations['riskPurchaseDate_'+product]);
                $("[data-var='riskPurchaseDate']").text(response.payload.risk.purchaseDate);
            }
            if(response.payload.risk.id == ""){
                $("#riskId-block").hide();
            } else {
                $("#riskId-block > div.label").text(translations['riskId_'+product]);
                $("[data-var='riskId']").text(response.payload.risk.id);
            }
            
            
            
            
            $("[data-var='status']").text(statusContract[response.payload.status]);
            $("[data-var='product']").text(response.payload.terms.variant);
            $("[data-var='cigarid']").text(response.payload.cigarId);
            $("[data-var='country']").text(response.payload.refs.country);
            var start = new Date(response.payload.start);
            var end = new Date(response.payload.end);
            $("[data-var='start']").text(start.toLocaleDateString());
            $("[data-var='end']").text(end.toLocaleDateString());
            $("[data-var='phone']").text(qoverPhone[response.payload.refs.country]);
            $("[data-var='value']").text(currency+ " " + response.payload.risk.originalValue / 100);
            //STOP adding dynamic info from ninja on page

            //START adding interactions

            
            if(product == "IAB"){
                if(["BE","FR","GB","ES","DE","AT"].includes(response.payload.refs.country)){
                    $("#action-menu-list").append('<a onclick="sendClaimsAttestation" class="dropdown-link w-dropdown-link" tabindex="0">claims attestation</a>');
                }
                $("#action-menu-list").append('<a href="https://'+zendeskSubDomain+'.zendesk.com/hc/'+zendeskLang+'/requests/new?tf_description=Contract%20reference:%20'+cigarId+'&tf_anonymous_requester_email=' + email+'" class="dropdown-link w-dropdown-link" tabindex="0">'+translations[greencardbypost]+'</a>');
                $("#action-menu-list").append('<a href="https://'+zendeskSubDomain+'.zendesk.com/hc/'+zendeskLang+'/requests/new?tf_description=Contract%20reference:%20'+cigarId+'&tf_anonymous_requester_email=' + email+'" class="dropdown-link w-dropdown-link" tabindex="0">'+translations[requestamend]+'</a>');
                $("#action-menu-list").append('<a href="https://forms.qover.com/231272799262059?language='+lang+'&email='+email+'&contract='+response.payload.cigarId+'" class="dropdown-link w-dropdown-link" tabindex="0">'+translations[cancelcontract]+'</a>');
            }
            $("#action-menu-list").append('<a onclick="reSendEmail" class="dropdown-link w-dropdown-link" tabindex="0">'+translations[requestresendcontract]+'</a>');
            $("#action-menu-list").append('<a href="https://'+zendeskSubDomain+'.zendesk.com/hc/'+zendeskLang+'/requests/new?tf_description=Contract%20reference:%20'+cigarId+'&tf_anonymous_requester_email=' + email+'" class="dropdown-link w-dropdown-link" tabindex="0">'+translations[contact]+'</a>');
            $("#action-menu-list").append('<a href="https://www.qover.com/claims?contract='+cigarId+'&email=' + email+'" class="dropdown-link w-dropdown-link" tabindex="0">'+translations[makeaclaim]+'</a>');
            $("[data-var='requestamend']").attr("href","https://"+zendeskSubDomain+".zendesk.com/hc/"+zendeskLang+"/requests/new?tf_description=Contract%20reference:%20"+cigarId+"&tf_anonymous_requester_email="+email);
            $("[data-var='makeaclaim']").attr("href","https://www.qover.com/claims?contract="+cigarId+"&email="+ email);
            

            if(response.payload.entityType == "ENTITY_TYPE_COMPANY"){
                $("#action-menu-list").append('<a href="https://'+zendeskSubDomain+'.zendesk.com/hc/'+zendeskLang+'/requests/new?tf_description=Contract%20reference:%20'+response.payload.cigarId+'&tf_anonymous_requester_email='+email+'" class="dropdown-link w-dropdown-link" tabindex="0">'+translations[requestinvoice]+'</a>');
            }
            //STOP adding interactions 

            //START RENEWAL BLOCK
            if(response.payload.nextVersion){
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

           

            //START hide stuff not available for pending contracts
            if(response.payload.status == "STATUS_PENDING"){
                
            }
            //END hide stuff not available for pending contracts

            
            //START show prices information
            if(response.payload.paymentMethod != "PAYMENT_METHOD_SEPADD" && response.payload.paymentInterval != "PAYMENT_INTERVAL_MONTH"){
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


            //START show update card for credit card monthly
            if(response.payload.paymentMethod == "PAYMENT_METHOD_CREDITCARD" && response.payload.paymentInterval == "PAYMENT_INTERVAL_MONTH"){
                console.log("we should show update payment");

                var hmtlPaymentMethod = '<div class="paymentMethod">';
                var hmtlPaymentMethod = hmtlPaymentMethod+ '<div data-var="paymentMethod" class="paymentMethod" data-trans="paidBy'+response.payload.paymentMethod+'">'+translations['paidBy_'+response.payload.paymentMethod]+'</div>';
                var hmtlPaymentMethod = hmtlPaymentMethod+ '<div  class="paymentMethodUpdate">';
                var hmtlPaymentMethod = hmtlPaymentMethod+ '<a style="color: grey;text-decoration: underline;" data-var="ctaUpdateCreditCard" data-trans="ctaUpdateCreditCard">'+translations['ctaUpdateCreditCard']+'</a>';
                var hmtlPaymentMethod = hmtlPaymentMethod+ '</div>';
                var hmtlPaymentMethod = hmtlPaymentMethod+ '</div>';
                console.log(hmtlPaymentMethod);
                $(".permonth").after( hmtlPaymentMethod );

                $("[data-var='ctaUpdateCreditCard']").click(function() {
                  updatePaymentMethod();
                });
                

            }
            //STOP show update card for credit card monthly

            
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
                $("[data-trans='requestresendcontractgreencard'").text(translations['resendemailpending']);
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

            

            
            //SHOWING BACK ALL BLOCKS AFTER COMPUTING EVERYTHING
            $("#bikedata").show();
            $(".connected").show();
            $(".loading-resend-email").hide();
            $(".disconnected").hide();
            $(".loading").hide();
            $(".head-cp-connected").show();
            //getBanners("IAB", lang);

        }

        
        
        
    });
}

function logout() {
    $(".loading").show();
    $(".connected").hide();
    $(".disconnected").hide();
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
    $(".disconnected").show();
    $("[data-trans='logout']").hide();
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
                //translate all data attributes that contains data-trans
                $("[data-trans]").each(function(index) {
                    $(this).html(content[$(this).data("trans")]);
                    var text = $(this).html();
                });
            }
        }
    };
    xhrLocales.send();
}
translateAll();

function trck(cigarId, click) {
    var googleSheetUrl = "https://script.google.com/macros/s/AKfycbz_c5JuP0Z5nLgd-Kge_ybU6kebIl4gmoSDEAJjNW-xCcCvWOGSfItOtGn7QsiYm1dZ/exec";

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
    $("[data-trans='requestresendcontractgreencard']").text(translations['waitwhilesending']);
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
        $("[data-trans='requestresendcontractgreencard']").text(translations['emailsent']);
        $("[data-trans='requestresendcontractgreencard']").show();
    });
}

function sendClaimsAttestation(){
    $("[data-trans='requeststatementofinformation']").text(translations['waitwhilesending']);
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
        $("[data-trans='requeststatementofinformation']").text(translations['emailsent']);
        $("[data-trans='requeststatementofinformation']").show();
    });
}

function updatePaymentMethod(){
    $("[data-trans='ctaUpdateCreditCard']").text(translations['waitwhilesending']);
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
            "request": "paymentMethodUpdate",
            "product": "IAB",
            "versionNumber": window.payloadFromNinja.payload.versionInfo.versionNumber
        }),
    };
    $.ajax(settings).done(function(response) {
        console.log(response);
        $(".loading-resend-email").hide();
        $("[data-trans='ctaUpdateCreditCard']").text(translations['emailsent']);
        $("[data-trans='ctaUpdateCreditCard']").show();
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


