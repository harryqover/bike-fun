console.warn("v20230710 1150");
const cowboyIds = ["60a75f9f987d3f484ed24ef4", "607937e4654780240a132641", "60938efba79100e71519a03b", "5ff6cf4fceba6039aadb446f", "61b1c260415df342d60f4e10", "61b1b145415df342d60f4e0f", "61b1d0a02656f6227dc3476f", "61b8a43042cef3c0bc2cc26d", "61b8a49f11e584fcae0ee070", "61b8a45842cef3c0bc2cc26e", "61b8a4c211e584fcae0ee071", "61b8a4e807007c0a5b94d673", "61b8a51111e584fcae0ee072", "61b8a52111e584fcae0ee073"];
const cowboyAlteosIds = ["5ff6cf4fceba6039aadb446f", "60938efba79100e71519a03b", "607937e4654780240a132641", "61b1b145415df342d60f4e0f", "61b1c260415df342d60f4e10", "60a75f9f987d3f484ed24ef4"]

//const partnerWith120Fee = ["606c50af2c855b773d15fd37","5ff6cf4fceba6039aadb446f","60938efba79100e71519a03b","607937e4654780240a132641","6239bdc7b96b08fbe8142622","63736c55e19342075afe9cc4","621e2870bcd73ab2d2550568","6373a0d1a5d163f0f6f59931","61b8a51111e584fcae0ee072","61b1b145415df342d60f4e0f","61b8a52111e584fcae0ee073","61b1d0a02656f6227dc3476f","61b8a4c211e584fcae0ee071","62cd828ecb175250d8e1fbc4","61b8a45842cef3c0bc2cc26e","61b8a49f11e584fcae0ee070","61b8a4e807007c0a5b94d673","61b1c260415df342d60f4e10","61b8a43042cef3c0bc2cc26d","60a75f9f987d3f484ed24ef4","62cd81bd736462368428da2b","63736c4da5d163f0f6f5992f","63736caba5d163f0f6f59930","62cd81b2736462368428da27","63736ca28d4465756472b505","63736c3fa5d163f0f6f5992e","63736c9c8d4465756472b504","63736c37e19342075afe9cc3","63736c958d4465756472b503","63736c2a8d4465756472b502","63736c86e19342075afe9cc5",]
//const partnerWith120Fee = ["606c50af2c855b773d15fd37"];
const partnerWith120Fee = [];

const variants = {
    "VARIANT_THEFT_DAMAGE_ASSISTANCE": "Omnium",
    "VARIANT_THEFT_ASSISTANCE": "Theft & Assistance",
    "VARIANT_THEFT_CASH_INCL": "Theft & Emergency expense",
    "VARIANT_THEFT_DAMAGE_CASH_INCL": "Premium",
    "VARIANT_THEFT": "Theft",
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

const imgPartner = {
    "canyon": "https://storage.googleapis.com/qover-assets/Logos/canyon.svg",
    "veloretti": "https://storage.googleapis.com/qover-assets/Logos/veloretti.png",
    "cowboy": "https://storage.googleapis.com/qover-assets/Logos/cowboy.png",
    "decathlon":"https://storage.googleapis.com/qover-assets/Logos/decathlon.svg"
}

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
    window.cigarId = cigarId;
    var email = $('input[name="email"]').val();
    goLogin(cigarId, email);
}

var devTest = getParameterByName("test");
 
function goLogin(cigarId, email) {
    console.log("start goLogin")
    translateAll();
    $(".loading").show();
    $("#connected").hide();
    $("#disconnected").hide();
    $("#bikedata").hide();
    console.log("loading should be visible")

    var data = JSON.stringify({
        "cigarId": cigarId,
        "email": email
    });

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function() {
        if (this.readyState === 4 && this.status === 200) {
            var timeToAdd = 1000 * 60 * 60 * 24 * 1 * 1 * 1;
            var date = new Date();
            var expiryTime = parseInt(date.getTime()) + timeToAdd;
            date.setTime(expiryTime);
            var utcTime = date.toUTCString();
            //document.cookie = "login=" + email + "; expires=" + utcTime + ";";
            //document.cookie = "cigarId=" + cigarId + "; expires=" + utcTime + ";";

            var obj = JSON.parse(this.responseText);
            var partnerId = obj.partnerId;
            var variant = obj.variant;
            var country = obj.country;
            var start = new Date(obj.startDate);
            var end = new Date(obj.endDate);
            end.setDate(end.getDate() + 1);
            window.payloadFromApi = {"partnerId": partnerId, "variant": variant, "startDate": start, "endDate": end};
            console.log(obj);

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
                damageDeductibleAmount = (country == "DK")?260:damageDeductibleAmount;
                damageDeductibleAmount = (country == "SE")?350:damageDeductibleAmount;
                damageDeductibleAmount = (country == "NO")?350:damageDeductibleAmount;
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
            window.refundDamage = bikeValue - damageDeductibleAmount;
            window.refundTheft = bikeValue - theftDeductibleAmount;
            window.damageDeductibleAmount = damageDeductibleAmount;

            var currency = "€";
            currency = (country == "GB")?"£":currency;
            currency = (country == "DK")?"DKK":currency;
            currency = (country == "SE")?"SEK":currency;
            currency = (country == "NO")?"NOK":currency;
            currency = (country == "PL")?"PLN":currency;
        

            $(".damage-deductible").text(Math.round(damageDeductibleAmount * 100) / 100);
            $(".theft-deductible").text(refundTheft);
            /* END DEFINE DEDUCTIBLES */

            $("[data-var='product']").text(variants[obj.variant]);
            $("[data-var='cigarid']").text(cigarId);
            $("[data-var='start']").text(start.toLocaleDateString());
            $("[data-var='end']").text(end.toLocaleDateString());
            $("[data-var='theftdeductible']").text(currency+ " " + Math.round(theftDeductibleAmount * 100) / 100);
            $("[data-var='materialdeductible']").text(currency+" " + Math.round(damageDeductibleAmount * 100) / 100);
            $("[data-var='phone']").text(qoverPhone[country]);

     
            var lang = $('#langinput').find(":selected").val(); 

            var zendeskLang = "fr";
            if(lang == "en"){
                zendeskLang = "en-be";
            } else if (lang == "nl") {
                zendeskLang = "nl-be";
            }

            


            
            
            $("[data-var='cancel']").attr("href", "https://forms.qover.com/230021764194349?language="+lang+"&cigarid=" + cigarId + "&email=" + email);
            if(devTest == "cancelPopup"){
                $("[data-var='cancel']").attr("onclick", "buildCancelForm()");
            }
            //$("[data-var='cancel']").attr("href", "https://form.jotform.com/222763047790359?lang="+lang+"&contractid=" + cigarId + "&email=" + email);
            $("[data-var='documentupload']").attr("href", "https://forms.qover.com/223391631989063?email=" + email + "&contractReference=" + cigarId + "&language="+lang);
            $("[data-var='claims']").attr("href", "https://www.qover.com/claims?lang="+lang+"&contract=" + cigarId + "&email=" + email);
            $("[data-var='makeaclaim']").attr("href", "https://www.qover.com/claims?lang="+lang+"&contract=" + cigarId + "&email=" + email);
            $("[data-var='amendlink']").attr("href", "https://qoverme.zendesk.com/hc/"+zendeskLang+"/requests/new?tf_4414433182481=bike_amend&tf_description=Contract%20reference:%20"+cigarId+"&tf_anonymous_requester_email=" + email);
            $("[data-var='contracttandlink']").attr("href", "https://qoverme.zendesk.com/hc/"+zendeskLang);
            $("[data-var='resendcontract']").click(function() {
              reSendEmail();
            });
            $("[data-var='1starlink']").attr("href","https://harryqover.github.io/bike-fun/reviewQover?r=1&c=" + cigarId + "&l="+lang+"&s=customer_portal");
            $("[data-var='2starlink']").attr("href","https://harryqover.github.io/bike-fun/reviewQover?r=2&c=" + cigarId + "&l="+lang+"&s=customer_portal");
            $("[data-var='3starlink']").attr("href","https://harryqover.github.io/bike-fun/reviewQover?r=3&c=" + cigarId + "&l="+lang+"&s=customer_portal");
            $("[data-var='4starlink']").attr("href","https://harryqover.github.io/bike-fun/reviewQover?r=4&c=" + cigarId + "&l="+lang+"&s=customer_portal");
            $("[data-var='5starlink']").attr("href","https://harryqover.github.io/bike-fun/reviewQover?r=5&c=" + cigarId + "&l="+lang+"&s=customer_portal");


            /* YOU ARE LOGGED IN*/

            getNinjaData(cigarId, email);

            $("[data-translation='logout']").show();

        } else if (this.readyState === 4 && this.status === 400) {
            logout();
            console.log(this.status);
            var obj = JSON.parse(this.responseText);
            alert(obj.message);
        } else if (this.readyState === 4 && this.status === 404) {
            logout();
            console.log(this.status);
            var obj = JSON.parse(this.responseText);
            alert(obj.message);
        } else if (this.readyState === 4) {
            logout();
            console.log(this.status);
        }
    });

    xhr.open("POST", "https://api.prd.qover.io/bike/v1/contracts/claim-info?apikey=pk_C0132D71B8C4C4E55690");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(data);
}

function getNinjaData(cigarId, email) {
    var googleSheetUrl = "https://script.google.com/macros/s/AKfycbxMbv5qoBCHH9cYabzTgql7Ml2I0SucLFCy8vYNgdUwzOE8eb1psn5aW7wk7dOvY5M/exec";
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
        $("[data-var='brand']").text(response.payload.risk.make);
        $("[data-var='model']").text(response.payload.risk.model);
        $("[data-var='serial']").text(response.payload.risk.serialNumber);
        $("[data-var='price']").text(currency + response.payload.price / 100);
        $("[data-var='status']").text(statusContract[response.payload.status]);


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

        if(response.payload.terms.variant == "VARIANT_ASSISTANCE"){
            $("[data-var='phoneassistance']").text("02 533 75 75"); 
            $(".div-block-324,.div-block-309,.claim-block,[data-var='pricediv'],[data-var='makeaclaim']").hide();   
        } else if(response.payload.terms.variant == "VARIANT_THEFT_ASSISTANCE" || response.payload.terms.variant == "VARIANT_THEFT_DAMAGE_ASSISTANCE"){
            $("[data-var='phoneassistance']").text(assistancePhone[response.payload.refs.country]);
            $("[data-var='explanation-deductible']").text(translations['incaseoftheft']+ " "+ currency + " " + refundTheft + " "+translations['incaseofdamage']+ " "+ currency + " " + Math.round(damageDeductibleAmount * 100) / 100);
        } else {
            $("[data-var='phoneassistance']").text("not available");    
            $(".assistance-emergency").hide();
            $("[data-var='explanation-deductible']").text(translations['incaseoftheft']+ " "+ currency + " " + refundTheft + " "+translations['incaseofdamage']+ " "+ currency + " " + Math.round(damageDeductibleAmount * 100) / 100);
            //$(".div-block-324").hide();
        }

        if(partnerWith120Fee.includes(response.payload.refs.partnerId)){
            var partnerServiceFee = 12000 - response.payload.price;
            $(".div-block-323").after("<div class='subprice' >"+translations['premiumsoftwareservices']+" ("+currency+" "+partnerServiceFee/100+")</div>")
        }

        var brandLower = response.payload.risk.make.toLowerCase();

        if (imgPartner.hasOwnProperty(brandLower)) {
            $("[data-var='imgpartner'").attr('src',imgPartner[brandLower]);
        } else {
            $("[data-var='divimgpartner'").hide();
        }

        $("[data-var='value']").text(currency+" " + response.payload.risk.originalValue / 100);
        $("#bikedata").show();
        $("#connected").show();
        $("#disconnected").hide();
        $(".loading").hide();
        var lang = $('#langinput').find(":selected").val();
        var browserWidth = getWidth();
        if((lang == "fr" || lang == "en"|| lang == "de"|| lang == "nl") && browserWidth > 500){
            startJotformFeedback();
            setTimeout(function() { 
                window.open( 'https://forms.qover.com/230382756620354?contract='+cigarId+'&language='+lang, 'blank', 'scrollbars=yes, toolbar=no, width=700, height=1000' )    
            }, 10000);    
        }
        
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
    var googleSheetUrl = "https://script.google.com/macros/s/AKfycbxMbv5qoBCHH9cYabzTgql7Ml2I0SucLFCy8vYNgdUwzOE8eb1psn5aW7wk7dOvY5M/exec";

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

function startJotformFeedback (){
    new JotformFeedback({
      
  type: false,
  width: 700,
  height: 1000,
  fontColor: "#FFFFFF",
  background: "#2f44dd",
  isCardForm: false,
  formId: "230382756620354"
  ,
      buttonText: "Feedback",
      buttonSide: "bottom",
      buttonAlign: "left",
      base: "https://qover.jotform.com/",
    });
  
    var ifr = document.getElementById("lightbox-230382756620354");
    if (ifr) {
      var src = ifr.src;
      var iframeParams = [];
      if (window.location.href && window.location.href.indexOf("?") > -1) {
        iframeParams = iframeParams.concat(window.location.href.substr(window.location.href.indexOf("?") + 1).split('&'));
      }
      if (src && src.indexOf("?") > -1) {
        iframeParams = iframeParams.concat(src.substr(src.indexOf("?") + 1).split("&"));
        src = src.substr(0, src.indexOf("?"))
      }
      iframeParams.push("isIframeEmbed=1");
      ifr.src = src + "?" + iframeParams.join('&');
    }
    window.handleIFrameMessage = function(e) {
      if (typeof e.data === 'object') { return; }
      var args = e.data.split(":");
      if (args.length > 2) { iframe = document.getElementById("lightbox-" + args[(args.length - 1)]); } else { iframe = document.getElementById("lightbox"); }
      if (!iframe) { return; }
      switch (args[0]) {
        case "scrollIntoView":
          iframe.scrollIntoView();
          break;
        case "setHeight":
          iframe.style.height = args[1] + "px";
          if (!isNaN(args[1]) && parseInt(iframe.style.minHeight) > parseInt(args[1])) {
            iframe.style.minHeight = args[1] + "px";
          }
          break;
        case "collapseErrorPage":
          if (iframe.clientHeight > window.innerHeight) {
            iframe.style.height = window.innerHeight + "px";
          }
          break;
        case "reloadPage":
          window.location.reload();
          break;
        case "loadScript":
          if( !window.isPermitted(e.origin, ['jotform.com', 'jotform.pro']) ) { break; }
          var src = args[1];
          if (args.length > 3) {
              src = args[1] + ':' + args[2];
          }
          var script = document.createElement('script');
          script.src = src;
          script.type = 'text/javascript';
          document.body.appendChild(script);
          break;
        case "exitFullscreen":
          if      (window.document.exitFullscreen)        window.document.exitFullscreen();
          else if (window.document.mozCancelFullScreen)   window.document.mozCancelFullScreen();
          else if (window.document.mozCancelFullscreen)   window.document.mozCancelFullScreen();
          else if (window.document.webkitExitFullscreen)  window.document.webkitExitFullscreen();
          else if (window.document.msExitFullscreen)      window.document.msExitFullscreen();
          break;
      }
      var isJotForm = (e.origin.indexOf("jotform") > -1) ? true : false;
      if(isJotForm && "contentWindow" in iframe && "postMessage" in iframe.contentWindow) {
        var urls = {"docurl":encodeURIComponent(document.URL),"referrer":encodeURIComponent(document.referrer)};
        iframe.contentWindow.postMessage(JSON.stringify({"type":"urls","value":urls}), "*");
      }
    };
    window.isPermitted = function(originUrl, whitelisted_domains) {
      var url = document.createElement('a');
      url.href = originUrl;
      var hostname = url.hostname;
      var result = false;
      if( typeof hostname !== 'undefined' ) {
        whitelisted_domains.forEach(function(element) {
            if( hostname.slice((-1 * element.length - 1)) === '.'.concat(element) ||  hostname === element ) {
                result = true;
            }
        });
        return result;
      }
    };
    if (window.addEventListener) {
      window.addEventListener("message", handleIFrameMessage, false);
    } else if (window.attachEvent) {
      window.attachEvent("onmessage", handleIFrameMessage);
    }
}

function reSendEmail(){
    
    i = 0;
    var loadingText = setInterval(function() {
        i = ++i % 4;
        $("[data-translation='requestresendcontract']").html(translations['waitwhilesending']+Array(i+1).join("."));
    }, 500);
    
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
            "product": "BIKE",
            "versionNumber": window.payloadFromNinja.payload.versionInfo.versionNumber
        }),
    };

    $.ajax(settings).done(function(response) {
        clearInterval(loadingText);
        $(".loading-resend-email").hide();
        if(response.status == 201){
            $("[data-translation='requestresendcontract']").text(translations['emailsent']);    
        } else {
            $("[data-translation='requestresendcontract']").text("error");    
        }
        console.log(response);
        $("[data-translation='requestresendcontract']").show();
    });
}

function getWidth() {
  return Math.max(
    document.body.scrollWidth,
    document.documentElement.scrollWidth,
    document.body.offsetWidth,
    document.documentElement.offsetWidth,
    document.documentElement.clientWidth
  );
}



function buildCancelForm (){
    var endDateObj = window.payloadFromApi.endDate;
    var endDateString = endDateObj.toLocaleDateString();
    window.endDateString = endDateString;
    var endDateParts = endDateString.split('/');
    var formattedEndDate = endDateParts[2] + '-' + endDateParts[1] + '-' + endDateParts[0];

    var cssForm = '<style>';
    cssForm = cssForm + '.cancellationSection{z-index: 10000; background-color: rgba(8,20,37,.5); position: fixed; top: 0%; bottom: 0%; left: 0%; right: 0%}';
    cssForm = cssForm + '.cancellationContainer{ max-height: 85vh; background-color: #fff; border-radius: 3px; padding: 0 40px 40px; position: relative; overflow: scroll; max-width: 728px; margin-left:auto; margin-right: auto;}';
    cssForm = cssForm + '.divCloseSection{ grid-column-gap: 6px; grid-row-gap: 6px; background-color: #fff; justify-content: flex-end; align-items: center; padding: 10px 0 10px 25px; display: flex; position: -webkit-sticky; position: sticky;top: 0;bottom: auto;left: auto;right: 0}';
    cssForm = cssForm + '.divClose{grid-column-gap: 8px; grid-row-gap: 8px; cursor: pointer; align-items: center; padding-top: 10px; padding-bottom: 10px; padding-left: 20px; display: flex}';
    cssForm = cssForm + '.grey-block {background-color: #f8f8f8; padding: 20px 20px 10px}';
    cssForm = cssForm + '.fieldDate { width: 130px; height: 28px; border: 1px solid #081425; border-radius: 4px; margin-bottom: 6px; margin-left: 10px; padding: 0 10px;}';
    cssForm = cssForm + '.cancelFormQuestions{margin-top: 40px;}';
    cssForm = cssForm + '.formSubTitles{font-weight: 600;}';
    cssForm = cssForm + '.advice{background-color: #f8f8f8; margin-bottom: 25px; padding: 10px 20px}';
    cssForm = cssForm + '.adviceText{max-width: 75ch; margin-top: 10px; margin-bottom: 10px}';
    cssForm = cssForm + '.summaryDiv{background-color: #fcfcfc; padding: 25px}';
    cssForm = cssForm + '.summaryAnswers{grid-column-gap: 10px; grid-row-gap: 10px; align-items: center; margin-top: 10px; margin-bottom: 10px; display: flex}';
    cssForm = cssForm + '.buttonCancel{transition: opacity 0.5s;text-align: center; background-color: #2f44dd; border:none; color: white; border-radius: 40px; margin-left: auto; margin-right: auto; padding: 12px 24px; display: block}';
    cssForm = cssForm + '</style>';

    var htmlForm = '<section class="cancellationSection">';
        htmlForm = htmlForm +'<div class="cancellationContainer">';
            htmlForm = htmlForm +'<div class="divCloseSection" onclick="closeCancelSection()"><div class="divClose"><img src="https://assets.website-files.com/5e8d84b86a72718111ce868b/646dff6ba2da6a846106e659_cross%20grey.svg" loading="lazy" alt=""><div>Close</div></div></div>';
            htmlForm = htmlForm +'<h2>'+window.translations.cancelTitle+'</h2>';
            htmlForm = htmlForm +'<div class="grey-block" id="blockStartForm"><p class="paragraph-73">'+window.translations.legalInfoTextOnHowToCancel+'</p></div>';
            htmlForm = htmlForm +'<div class="cancelFormQuestions">';
                htmlForm = htmlForm +'<div class="question-to-replace formSubTitles">';
                    htmlForm = htmlForm +'<div style="display:block" class="_1st">Je souhaite résilier mon contrat <a href="#" data-var="cancelFormLinkAtRenewal">à son renouvellement ('+endDateString+')</a> car :</div>';
                    htmlForm = htmlForm +'<div style="display:none" class="_2nd div-block-360">';
                        htmlForm = htmlForm +'<div class="_2nd">Je désire annuler mon contrat d’assurance (sous réserve d’acceptation)</div>';
                        hhtmlForm = htmlForm +'<div class="_2nd div-block-359">';
                            htmlForm = htmlForm +'<label class="radio-button-field-2 w-radio"><input type="radio" id="radio-cancelDate-atRenewal" name="radio-cancelDate" value="radio-cancelDate-atRenewal" class="w-form-formradioinput w-radio-input" checked><span class="w-form-label" for="radio">au renouvellement</span></label>';
                            htmlForm = htmlForm +'<div class="div-block-358"><label class="radio-button-field-2 w-radio"><input type="radio"  id="radio-cancelDate-specificDate" name="radio-cancelDate" value="radio-cancelDate-specificDate" class="w-form-formradioinput w-radio-input"><span class="w-form-label" for="radio-2">à une date spécifique</span></label>';
                            htmlForm = htmlForm +'<input type="date" class="fieldDate w-input" name="cancelDate" id="cancelDate" required="" value="'+formattedEndDate+'"></div>';
                        htmlForm = htmlForm +'</div>';
                    //htmlForm = htmlForm +'</div>';
                htmlForm = htmlForm +'</div>';
                htmlForm = htmlForm +'<div class="inputReason">';
                    htmlForm = htmlForm +'<div>';
                        htmlForm = htmlForm +'<label class="w-checkbox"><input type="checkbox" id="checkbox-1" name="checkbox-reason" data-name="Checkbox" class="w-checkbox-input withAdvice" value="cancelReasonNotEnoughRiding"><span class="w-form-label" for="checkbox-1">'+window.translations.cancelReasonNotEnoughRiding+'</span></label>';
                        htmlForm = htmlForm +'<div style="display:none" class="advice"><div class="adviceText">'+window.translations.cancelReasonNotEnoughRidingAdvice+'</div></div>';
                    htmlForm = htmlForm +'</div>';
                    htmlForm = htmlForm +'<div>';
                        htmlForm = htmlForm +'<label class="w-checkbox"><input type="checkbox" id="checkbox-2" name="checkbox-reason" data-name="Checkbox" class="w-checkbox-input withAdvice" value="cancelReasonNotRiding"><span class="w-form-label" for="checkbox-2">'+window.translations.cancelReasonNotRiding+'</span></label>';
                        htmlForm = htmlForm +'<div style="display:none" class="advice"><div class="adviceText">'+window.translations.cancelReasonNotRidingAdvice+'</div></div>';
                    htmlForm = htmlForm +'</div>';
                    htmlForm = htmlForm +'<div>';
                        htmlForm = htmlForm +'<label class="w-checkbox"><input type="checkbox" id="checkbox-3" name="checkbox-reason" data-name="Checkbox" class="w-checkbox-input withAdvice" value="cancelReasonPriceTooHigh"><span class="w-form-label" for="checkbox-3">'+window.translations.cancelReasonPriceTooHigh+'</span></label>';
                        htmlForm = htmlForm +'<div style="display:none" class="advice"><div class="adviceText">'+window.translations.cancelReasonPriceTooHighAdvice+'</div></div>';
                    htmlForm = htmlForm +'</div>';
                    htmlForm = htmlForm +'<div>';
                        htmlForm = htmlForm +'<label class="w-checkbox"><input type="checkbox" id="checkbox-4" name="checkbox-reason" data-name="Checkbox" class="w-checkbox-input withAdvice" value="cancelReasonOtherInsurer"><span class="w-form-label" for="checkbox-4">'+window.translations.cancelReasonOtherInsurer+'</span></label>';
                        htmlForm = htmlForm +'<div style="display:none" class="advice"><div class="adviceText">'+window.translations.cancelReasonOtherInsurerAdvice+'</div></div>';
                    htmlForm = htmlForm +'</div>';
                    htmlForm = htmlForm +'<div>';
                        htmlForm = htmlForm +'<label class="w-checkbox"><input type="checkbox" id="checkbox-5" name="checkbox-reason" data-name="Checkbox" class="w-checkbox-input withAdvice" value="cancelReasonBadExperience"><span class="w-form-label" for="checkbox-5">'+window.translations.cancelReasonBadExperience+'</span></label>';
                        htmlForm = htmlForm +'<div style="display:none" class="advice"><div class="adviceText">'+window.translations.cancelReasonBadExperienceAdvice+'</div></div>';
                    htmlForm = htmlForm +'</div>';
                    htmlForm = htmlForm +'<div>';
                        htmlForm = htmlForm +'<label class="w-checkbox"><input type="checkbox" id="checkbox-6" name="checkbox-reason" data-name="Checkbox" class="w-checkbox-input withAdvice" value="cancelReasonNotExposed"><span class="w-form-label" for="checkbox-6">'+window.translations.cancelReasonNotExposed+'</span></label>';
                        htmlForm = htmlForm +'<div style="display:none" class="advice"><div class="adviceText">'+window.translations.cancelReasonNotExposedAdvice+'</div></div>';
                    htmlForm = htmlForm +'</div>';
                    htmlForm = htmlForm +'<div>';
                        htmlForm = htmlForm +'<label class="w-checkbox"><input type="checkbox" id="checkbox-7" name="checkbox-reason" data-name="Checkbox" class="w-checkbox-input withAdvice" value="cancelReasonOrderCancelled"><span class="w-form-label" for="checkbox-7">'+window.translations.cancelReasonOrderCancelled+'</span></label>';
                        htmlForm = htmlForm +'<div style="display:none" class="advice"><div class="adviceText">'+window.translations.cancelReasonOrderCancelledAdvice+'</div></div>';
                    htmlForm = htmlForm +'</div>';
                    htmlForm = htmlForm +'<div>';
                        htmlForm = htmlForm +'<label class="w-checkbox"><input type="checkbox" id="checkbox-8" name="checkbox-reason" data-name="Checkbox" class="w-checkbox-input withAdvice" value="cancelReasonReturnWithinWarranty"><span class="w-form-label" for="checkbox-8">'+window.translations.cancelReasonReturnWithinWarranty+'</span></label>';
                        htmlForm = htmlForm +'<div style="display:none" class="advice"><div class="adviceText">'+window.translations.cancelReasonReturnWithinWarrantyAdvice+'</div></div>';
                    htmlForm = htmlForm +'</div>';
                    htmlForm = htmlForm +'<div>';
                        htmlForm = htmlForm +'<label class="w-checkbox"><input type="checkbox" id="checkbox-9" name="checkbox-reason" data-name="Checkbox" class="w-checkbox-input withAdvice" value="cancelReasonMoveAbroad"><span class="w-form-label" for="checkbox-9">'+window.translations.cancelReasonMoveAbroad+'</span></label>';
                        htmlForm = htmlForm +'<div style="display:none" class="advice"><div class="adviceText">'+window.translations.cancelReasonMoveAbroadAdvice+'</div></div>';
                    htmlForm = htmlForm +'</div>';
                    htmlForm = htmlForm +'<div>';
                        htmlForm = htmlForm +'<label class="w-checkbox"><input type="checkbox" id="checkbox-10" name="checkbox-reason" data-name="Checkbox" class="w-checkbox-input withAdvice" value="cancelReasonNotSatisfiedWithClaim"><span class="w-form-label" for="checkbox-10">'+window.translations.cancelReasonNotSatisfiedWithClaim+'</span></label>';
                        htmlForm = htmlForm +'<div style="display:none" class="advice"><div class="adviceText">'+window.translations.cancelReasonNotSatisfiedWithClaimAdvice+'</div></div>';
                    htmlForm = htmlForm +'</div>';
                    htmlForm = htmlForm +'<div>';
                        htmlForm = htmlForm +'<label class="w-checkbox"><input type="checkbox" id="checkbox-11" name="checkbox-reason" data-name="Checkbox" class="w-checkbox-input withAdvice" value="cancelReasonBikeSold"><span class="w-form-label" for="checkbox-11">'+window.translations.cancelReasonBikeSold+'</span></label>';
                        htmlForm = htmlForm +'<div style="display:none" class="advice"><div class="adviceText">'+window.translations.cancelReasonBikeSoldAdvice+'</div></div>';
                    htmlForm = htmlForm +'</div>';
                    htmlForm = htmlForm +'<div>';
                        htmlForm = htmlForm +'<label class="w-checkbox"><input type="checkbox" id="checkbox-12" name="checkbox-reason" data-name="Checkbox" class="w-checkbox-input withAdvice" value="cancelReasonOther"><span class="w-form-label" for="checkbox-12">'+window.translations.cancelReasonOther+'</span></label>';
                        htmlForm = htmlForm +'<div style="display: none;" class="advice"><textarea placeholder="'+window.translations.cancelReasonOtherMore+'" maxlength="5000" id="textAreaCancelReasonOtherMore" name="field-2" data-name="Field 2" class="w-input"></textarea></div>';
                    htmlForm = htmlForm +'</div>';
                htmlForm = htmlForm +'</div>';
                htmlForm = htmlForm +'<div class="formSubTitles">';
                    htmlForm = htmlForm +'Avez-vous des suggestions/commentaires pour faire évoluer notre assurance vélo ?';
                htmlForm = htmlForm +'</div>';
                htmlForm = htmlForm +'<div class="inputReason">';
                    htmlForm = htmlForm +'<textarea placeholder="'+window.translations.cancelTypeYourFeedback+'" maxlength="5000" id="textAreaSuggestions" name="field" data-name="Field" class="w-input"></textarea>';
                htmlForm = htmlForm +'</div>';
                htmlForm = htmlForm +'<div class="formSubTitles">';
                    htmlForm = htmlForm +'Fréquence dutilisation de votre vélo';
                htmlForm = htmlForm +'</div>';
                htmlForm = htmlForm +'<div class="inputReason">';
                    htmlForm = htmlForm +'<label class="radio-button-field-2 w-radio"><input type="radio" data-name="Radio 3" id="frequency-1" name="radio-frequency" value="1-daily" class="w-form-formradioinput w-radio-input"><span class="w-form-label" for="frequency-1">Plusieurs fois par jour</span></label>';
                    htmlForm = htmlForm +'<label class="radio-button-field-2 w-radio"><input type="radio" data-name="Radio 6" id="frequency-2" name="radio-frequency" value="2-weekly" class="w-form-formradioinput w-radio-input"><span class="w-form-label" for="frequency-2">Plusieurs fois par semaine</span></label>';
                    htmlForm = htmlForm +'<label class="radio-button-field-2 w-radio"><input type="radio" data-name="Radio 5" id="frequency-3" name="radio-frequency" value="3-monthly" class="w-form-formradioinput w-radio-input"><span class="w-form-label" for="frequency-3">Plusieurs fois par mois</span></label>';
                    htmlForm = htmlForm +'<label class="radio-button-field-2 w-radio"><input type="radio" data-name="Radio 4" id="frequency-4" name="radio-frequency" value="4-yearly" class="w-form-formradioinput w-radio-input"><span class="w-form-label" for="frequency-4">Plusieurs fois par an</span></label>';
                htmlForm = htmlForm +'</div>';
                htmlForm = htmlForm +'<div class="formSubTitles">';
                    htmlForm = htmlForm +'Vous utilisez votre vélo :';
                htmlForm = htmlForm +'</div>';
                htmlForm = htmlForm +'<div class="inputReason">';
                    htmlForm = htmlForm +'<label class="w-checkbox checkbox-2"><input type="checkbox" id="chckbx-usage-1" name="checkbox-usage" data-name="Checkbox 11" class="w-checkbox-input checkbox-3" value="workschool"><span class="checkbox-label-3 w-form-label" for="chckbx-usage-1">pour vous rendre au travail, à l’école/université</span></label>';
                    htmlForm = htmlForm +'<label class="w-checkbox checkbox-2"><input type="checkbox" id="chckbx-usage-2" name="checkbox-usage" data-name="Checkbox 11" class="w-checkbox-input checkbox-3" value="shopping"><span class="checkbox-label-3 w-form-label" for="chckbx-usage-2">pour aller faire des courses</span></label>';
                    htmlForm = htmlForm +'<label class="w-checkbox checkbox-2"><input type="checkbox" id="chckbx-usage-3" name="checkbox-usage" data-name="Checkbox 11" class="w-checkbox-input checkbox-3" value="delivery"><span class="checkbox-label-3 w-form-label" for="chckbx-usage-3">comme outil de travail (livraison)</span></label>';
                    htmlForm = htmlForm +'<label class="w-checkbox checkbox-2"><input type="checkbox" id="chckbx-usage-4" name="checkbox-usage" data-name="Checkbox 11" class="w-checkbox-input checkbox-3" value="entertainment"><span class="checkbox-label-3 w-form-label" for="chckbx-usage-4">pour des activités ludiques (balades)</span></label>';
                    htmlForm = htmlForm +'<label class="w-checkbox checkbox-2"><input type="checkbox" id="chckbx-usage-5" name="checkbox-usage" data-name="Checkbox 11" class="w-checkbox-input checkbox-3" value="sport"><span class="checkbox-label-3 w-form-label" for="chckbx-usage-5">pour des activités sportives (courses amateurs, entre amis)</span></label>';
                    htmlForm = htmlForm +'<label class="w-checkbox checkbox-2"><input type="checkbox" id="chckbx-usage-6" name="checkbox-usage" data-name="Checkbox 11" class="w-checkbox-input checkbox-3" value="other"><span class="checkbox-label-3 w-form-label" for="chckbx-usage-6">autre</span></label>';
                htmlForm = htmlForm +'</div>';
                htmlForm = htmlForm +'<div class="formSubTitles">';
                    htmlForm = htmlForm +'Où garez-vous votre vélo ?';
                htmlForm = htmlForm +'</div>';
                htmlForm = htmlForm +'<div class="inputReason">';
                    htmlForm = htmlForm +'<label class="w-checkbox checkbox-2"><input type="checkbox" id="chckbx-parking-1" name="checkbox-parking" data-name="Checkbox 11" class="w-checkbox-input checkbox-3" value="securedparking"><span class="checkbox-label-3 w-form-label" for="chckbx-parking-1">dans un parking sécurisé</span></label>';
                    htmlForm = htmlForm +'<label class="w-checkbox checkbox-2"><input type="checkbox" id="chckbx-parking-2" name="checkbox-parking" data-name="Checkbox 11" class="w-checkbox-input checkbox-3" value="sharedparking"><span class="checkbox-label-3 w-form-label" for="chckbx-parking-2">dans un local/parking commun</span></label>';
                    htmlForm = htmlForm +'<label class="w-checkbox checkbox-2"><input type="checkbox" id="chckbx-parking-3" name="checkbox-parking" data-name="Checkbox 11" class="w-checkbox-input checkbox-3" value="outside"><span class="checkbox-label-3 w-form-label" for="chckbx-parking-3">attaché à un point fixe à l’extérieur</span></label>';
                    htmlForm = htmlForm +'<label class="w-checkbox checkbox-2"><input type="checkbox" id="chckbx-parking-4" name="checkbox-parking" data-name="Checkbox 11" class="w-checkbox-input checkbox-3" value="insidehouse"><span class="checkbox-label-3 w-form-label" for="chckbx-parking-4">dans ma maison/appartement</span></label>';
                    htmlForm = htmlForm +'<label class="w-checkbox checkbox-2"><input type="checkbox" id="chckbx-parking-6" name="checkbox-parking" data-name="Checkbox 11" class="w-checkbox-input checkbox-3" value="other"><span class="checkbox-label-3 w-form-label" for="chckbx-parking-6">autre</span></label>';
                htmlForm = htmlForm +'</div>';
                htmlForm = htmlForm +'<div class="summaryDiv"><div class="formSubTitles">'+window.translations.cancelSummaryRequestTitle+'</div><div>';
                        htmlForm = htmlForm +'<div class="summaryAnswers"><div>Le souscripteur :</div><div class="formSubTitles"><input type="text" id="fname" name="fname" placeholder="First name">&nbsp;&nbsp;<input type="text" id="lname" name="lname" placeholder="Last Name"></div></div>';
                        htmlForm = htmlForm +'<div class="summaryAnswers"><div>Le contrat :</div><div class="formSubTitles">'+window.cigarId+'</div></div>';
                        htmlForm = htmlForm +'<div class="summaryAnswers"><div>Votre demande de résiliation :</div><div class="formSubTitles" data-var="textResiliationRequest">'+window.translations.textResiliationRequestAtRenewal + window.endDateString+'</div></div>';
                        htmlForm = htmlForm +'<div class="summaryAnswers"><div>La raison :</div><div class="formSubTitles" data-var="textReasons"></div></div>';
                    htmlForm = htmlForm +'</div>';
                    htmlForm = htmlForm + '<input type="submit" onclick="getAllInputsChecked()" value="Je confirme la demande de résiliation" data-wait="Please wait..." class="buttonCancel">';
                htmlForm = htmlForm +'</div>';
            htmlForm = htmlForm +'</div>';
        htmlForm = htmlForm +'</div>';
    htmlForm = htmlForm +'</section>';

    var htmlToShowForForm = cssForm + htmlForm;
    $("body").prepend(htmlToShowForForm);

    //Below code is to show/hide the advices when parent checkbox is checked
    const checkboxes = document.querySelectorAll('.withAdvice');
    const advices = document.querySelectorAll('.advice');
    checkboxes.forEach((checkbox, index) => {
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          advices[index].style.display = 'block';
        } else {
          advices[index].style.display = 'none';
        }
      });
    });

    var cancelFormLinkAtRenewal = document.querySelector('a[data-var="cancelFormLinkAtRenewal"]');
    cancelFormLinkAtRenewal.addEventListener('click', function(event) {
        $("._1st").hide();
        $("._2nd").show();
    });

    // Get the radio button element
    var radioCancelDateAtRenewal = document.getElementById('radio-cancelDate-atRenewal');
    // Get the date input element
    var cancelDateInput = document.getElementById('cancelDate');
    // Add click event listener to the radio button
    radioCancelDateAtRenewal.addEventListener('click', function() {
      // Set the value of the date input to "2024-04-14"
      cancelDateInput.value = formattedEndDate;
    });

    //below code is to update the summary when there is a change
    $('input[name="checkbox-reason"]').change(function() {
        checkIfCancelButtonDisable();
        var reasonsCheckedTxt = "";
        // Loop through all checked checkboxes
        $('input[name="checkbox-reason"]:checked').each(function() {
          // Get the text associated with the checkbox
          var text = $(this).siblings('span.w-form-label').text();
          
          // Append the text to the reasonsCheckedTxt variable
          reasonsCheckedTxt += text + ",\n";
        });
        
        // Display the updated reasonsCheckedTxt variable
        console.log(reasonsCheckedTxt);
        $("[data-var='textReasons']").html(reasonsCheckedTxt);
    });
    $('input[name="fname"], input[name="lname"]').change(function() {
        checkIfCancelButtonDisable();
    });
    checkIfCancelButtonDisable();

    $('input[name="radio-cancelDate"], #cancelDate').change(function() {
        //CONTINUE HERE
        var cancelDateInputVal = $('#cancelDate').val();
        var partsCancelDateInputVal = dateString.split('-');
        var dateCancelDateInputVal = new Date(partsCancelDateInputVal[0], partsCancelDateInputVal[1] - 1, partsCancelDateInputVal[2]);

        var radioCancelDateChecked = $("input[name='radio-cancelDate']:checked").val();
        if(radioCancelDateChecked == "radio-cancelDate-atRenewal"){
            $("[data-var='textResiliationRequest']").html(window.translations.textResiliationRequestAtRenewal + window.endDateString);
        } else {
            $("[data-var='textResiliationRequest']").html(window.translations.textResiliationRequestAtSpecificDate + date.getDate() + '/' + date.getMonth() + 1 + '/' + date.getFullYear());
        }
    });
}

function getAllInputsChecked (){
    var wishType = $("input[name='radio-cancelDate']:checked").val();
    var cancelDate = document.getElementById("cancelDate").value;
    var lname = document.getElementById("lname").value;
    var fname = document.getElementById("fname").value;

    var allReasonsEl = $("input[name='checkbox-reason']");
    var allReasonsArray = [];
    var allReasonsTxt = "";
    for (i = 0; i < allReasonsEl.length; i++) {
        if(allReasonsEl[i].checked){
            allReasonsArray.push(allReasonsEl[i].value);
            allReasonsTxt = allReasonsTxt + allReasonsEl[i].value + ", ";
        }
    }
    var suggestions = document.getElementById("textAreaSuggestions").value;
    var frequencyEl = $("input[name='radio-frequency']:checked");
    
    var usageEl = $("input[name='checkbox-usage']:checked");
    var allUsageArray = [];
    var allUsageTxt = "";
    usageEl.each(function() {
        var val = $(this).val();
        allUsageArray.push(val);
        allUsageTxt = allUsageTxt + val + ", ";
    });

    var parkingEl = $("input[name='checkbox-parking']:checked");
    var allParkingArray = [];
    var allParkingTxt = "";
    parkingEl.each(function() {
        var val = $(this).val();
        allParkingArray.push(val);
        allParkingTxt = allParkingTxt + val + ", ";
    });
    var lang = $('#langinput').find(":selected").val();
    var email = $('input[name="email"]').val();
    var cigarId = $('input[name="name"]').val();

    /*var inputs = document.getElementsByTagName('input');
    for (i = 0; i < inputs.length; i++) {
        if(inputs[i].checked){
            console.log(inputs[i].type, " ",inputs[i].name, " ", inputs[i].value);
        }
    }*/
    
    //document.getElementById("textAreaCancelReasonOtherMore").value
    
    var payloadToCancel = {
        "contractId": cigarId,
        "lang": lang,
        "wishType": wishType,
        "wishDate": cancelDate,
        "reason": allReasonsTxt,
        "reasonArr": allReasonsArray,
        "suggestion": suggestions,
        "frequency": frequencyEl[0].value,
        "usage": allUsageTxt,
        "usageArr": allUsageArray,
        "parking": allParkingTxt,
        "parkingArr": allParkingArray,
        "attachment": "url todo",
        "country" : payloadFromNinja.payload.refs.country,
        "email": email,
        "lname": lname,
        "fname": fname
    }

    console.log("payloadToCancel",payloadToCancel);

    if(payloadToCancel.lname != "" && payloadToCancel.fname != "" && payloadToCancel.reasonArr.length >0){
        var settings = {
          "url": "https://script.google.com/macros/s/AKfycbwF-Vfm9aeG4aNrGL2q1Yh9ZTumAtQA17tf2NnV_XjnovJiTSl1W5lK4leMyHK2r6w/exec",
          "method": "POST",
          "timeout": 0,
          "headers": {
            "Content-Type": "text/plain;charset=utf-8",
          },
          "data": JSON.stringify(payloadToCancel),
        };

        $.ajax(settings).done(function (response) {
          console.log(response);
          var responseText = JSON.stringify(response);
          $(".cancelFormQuestions").hide();
          $("#blockStartForm").text(responseText);
        });

    } else {
        window.alert("missing info before continue")
    }

    
}

function checkIfCancelButtonDisable(){
    var lname = document.getElementById("lname").value;
    var fname = document.getElementById("fname").value;
    var allReasonsArray = [];
    var allReasonsEl = $("input[name='checkbox-reason']");
    for (i = 0; i < allReasonsEl.length; i++) {
        if(allReasonsEl[i].checked){
            allReasonsArray.push(allReasonsEl[i].value);
            //allReasonsTxt = allReasonsTxt + allReasonsEl[i].value + ", ";
        }
    }
    if(lname != "" && fname != "" && allReasonsArray.length >0){
        $(".buttonCancel").attr("style","");
    } else {
        $(".buttonCancel").attr("style","opacity:25%;");
    }
}


function closeCancelSection(){
    $("section.cancellationSection").remove();
}