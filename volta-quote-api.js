console.warn("updated 20230912 1030")

let ipAddress = "";
$(document).ready(function() {
    $.getJSON("https://api.ipify.org?format=json", function(data) {
        ipAddress = data.ip;
    });
});


function translateAll() {
    var lang = configQuoteEngine.language;
    let xhrLocales = new XMLHttpRequest();
    var content = "";
    xhrLocales.open("get", "https://api.prd.qover.io/i18n/v1/projects/webflow-volta/" + lang + ".json?refresh=007", true);
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

var quoteInfo = {
  "truckPrice": 400000,
  "usage": "onlyGoods4Company",
  "truckAmount": 1,
  "truckType": "18tRefriBi",
  "dangerousGoodsTrucks": false,
  "leasedTrucks": false,
  "deductible_MTPL": "10000",
  "deductible_Casco": "10000",
  "country": configQuoteEngine.country,
  "samePrice": true
}

function clickToGetPrice(){
  console.log(quoteInfo);
	getPrice(quoteInfo.truckAmount, quoteInfo.truckPrice, quoteInfo.dangerousGoodsTrucks, quoteInfo.leasedTrucks, quoteInfo.deductible_MTPL, quoteInfo.deductible_Casco, quoteInfo.country, quoteInfo.usage, quote.samePrice);
}

const googleSheetUrl = "https://script.google.com/macros/s/AKfycbxd7iLSKEWjn4Kjsh6SR4zVDZCz2HxnAXA1OHG_7pzBrE0VLi5ze-9DOV1Y7tpyr13d6Q/exec";
$("[data-price]").text("...");
function getPrice(truckAmount, truckPrice, dangerousGoodsTrucks, leasedTrucks, deductible_MTPL, deductible_Casco, country, usage, samePrice) {
  var textLoading = (typeof translations !== "undefined")? translations.loadingPrices: "Loading new prices";
  $("[data-price]").text(textLoading);
  var loadingPricesDiv = '<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>';
  loadingPricesDiv = loadingPricesDiv + '<style>.lds-ellipsis {display: inline-block;position: relative;width: 80px;height: 80px;}.lds-ellipsis div {position: absolute;top: 33px;width: 13px;height: 13px;border-radius: 50%;background: #000;animation-timing-function: cubic-bezier(0, 1, 1, 0);}.lds-ellipsis div:nth-child(1) {left: 8px;animation: lds-ellipsis1 0.6s infinite;}.lds-ellipsis div:nth-child(2) {left: 8px;animation: lds-ellipsis2 0.6s infinite;}.lds-ellipsis div:nth-child(3) {left: 32px;animation: lds-ellipsis2 0.6s infinite;}.lds-ellipsis div:nth-child(4) {left: 56px;animation: lds-ellipsis3 0.6s infinite;}@keyframes lds-ellipsis1 {0% {transform: scale(0);}100% {transform: scale(1);}}@keyframes lds-ellipsis3 {0% {transform: scale(1);}100% {transform: scale(0);}}@keyframes lds-ellipsis2 {0% {transform: translate(0, 0);}100% {transform: translate(24px, 0);}}</style>'
  //$(".amount").innerhtml(loadingPricesDiv);
  var settings = {
      "url": googleSheetUrl,
      "method": "POST",
      "timeout": 0,
      "headers": {
          "Content-Type": "text/plain;charset=utf-8"
      },
      "data": JSON.stringify({
          "request":"getQuote",
          "truckAmount": truckAmount,
          "truckPrice": truckPrice,
          "dangerousGoodsTrucks": dangerousGoodsTrucks,
          "leasedTrucks": leasedTrucks,
          "deductible_MTPL": deductible_MTPL,
          "deductible_Casco": deductible_Casco,
          "country": country,
          "usage": usage,
          "ipAddress": ipAddress,
          "samePrice": samePrice
      }),
  };

  $.ajax(settings).done(function(response) {
    console.log(response);
    window.payloadFromNinja = response;
    if(response.response.errors.length > 0){
      console.warn(response.response.errors);
      //alert("errors check logs");
      actionOnErrors (response.response.errors);
    } else {
      const formatter = new Intl.NumberFormat(configQuoteEngine.language+'-'+country, {
        style: 'currency',
        currency: response.response.currency.currency,
      });
      var formattedTotalPrice1 = formatter.format(response.response.packs.pack1);
      var formattedTotalPrice2 = formatter.format(response.response.packs.pack2);
      var formattedTotalPrice3 = formatter.format(response.response.packs.pack3);
      $("[data-price='pack1']").text(formattedTotalPrice1);
      $("[data-price='pack2']").text(formattedTotalPrice2);
      $("[data-price='pack3']").text(formattedTotalPrice3);
      $('[data-click="pack1"], [data-click="pack2"], [data-click="pack3"]').attr("data-quoteid",response.response.quoteId);
      }
  })
}
//clickToGetPrice();



const priceInput = document.querySelector('#truckprice');
priceInput.addEventListener('change', function() {
  quoteInfo.truckPrice = $('#truckprice').val() ;
  clickToGetPrice();
})

$('#tooltipavgprice').hide();
const avgTruckPrice = {"DE":345000,"FR":345000};
$("[data-click='avgprice']").on( "click", function() {
  $('#truckprice').val(avgTruckPrice[configQuoteEngine.country]);
  $('#tooltipavgprice').show(500);
  quoteInfo.truckPrice = $('#truckprice').val() ;
  clickToGetPrice();
} );

$("[data-quoteid]").on( "click", function() {
  var quoteId = $(this).data('quoteid');
  var pack = $(this).data('click');
  console.log(pack);
  if(quoteId != ''){
    openSaveQuoteModal(quoteId, pack)
  }
} );

/*
STEPS
price STEP-1
truckAmount STEP-2
onePrice-true STEP-3
leasing STEP-4
usage STEP-5
dangerous STEP-6
price STEP-7

*/

$('#truckAmount').val(1);//set default to 1
const truckAmountInput = document.querySelector('#truckAmount');
truckAmountInput.addEventListener('change', function() {
  quoteInfo.truckAmount = Number($('#truckAmount').val()) ;
  if(quoteInfo.truckAmount == 1){
    $("#step-3").hide();
  } else {
    $("#step-3").show();
  }
  clickToGetPrice();
})

$("a[href$='#step-3']").on( "click", function() {
  e.preventDefault();
  if(quoteInfo.truckAmount === 1){
    var nextStepPosition = $("#step-4").offset().top;
  } else {
    var nextStepPosition = $("#step-3").offset().top;
  }
  $("html, body").animate({scrollTop: nextStepPosition}, 800);
} );


const radioOnePriceTrue = document.querySelector('#onePrice-true');
const radioOnePriceFalse = document.querySelector('#onePrice-false');

radioOnePriceTrue.addEventListener('change', function() {
  if (this.checked) {
    quoteInfo.samePrice = true;
  }
  clickToGetPrice();
  var nextStepPosition = $("#step-4").offset().top;
  $("html, body").animate({scrollTop: nextStepPosition}, 800);
});

radioOnePriceFalse.addEventListener('change', function() {
  if (this.checked) {
    quoteInfo.samePrice = false;
  }
  clickToGetPrice();
  var nextStepPosition = $("#step-4").offset().top;
  $("html, body").animate({scrollTop: nextStepPosition}, 800);
});


const radioLeasingTrue = document.querySelector('#leasing-true');
const radioLeasingFalse = document.querySelector('#leasing-false');
//radioLeasingFalse.click(); //select false by default

radioLeasingTrue.addEventListener('change', function() {
  if (this.checked) {
    quoteInfo.leasedTrucks = true;
  }
  clickToGetPrice();
  var nextStepPosition = $("#step-5").offset().top;
  $("html, body").animate({scrollTop: nextStepPosition}, 800);
});

radioLeasingFalse.addEventListener('change', function() {
  if (this.checked) {
    quoteInfo.leasedTrucks = false;
  }
  clickToGetPrice();
  var nextStepPosition = $("#step-5").offset().top;
  $("html, body").animate({scrollTop: nextStepPosition}, 800);
});


$("#tooltipdangerousgoods").hide();
const radioDangerousgoodsTrue = document.querySelector('#dangerousgoods-true');
const radioDangerousgoodsFalse = document.querySelector('#dangerousgoods-false');
//radioDangerousgoodsFalse.click(); //select false by default

radioDangerousgoodsTrue.addEventListener('change', function() {
  if (this.checked) {
    quoteInfo.dangerousGoodsTrucks = true;
    clickToGetPrice();
    var nextStepPosition = $("#step-7").offset().top;
    $("html, body").animate({scrollTop: nextStepPosition}, 800);
  }

});

radioDangerousgoodsFalse.addEventListener('change', function() {
  if (this.checked) {
    quoteInfo.dangerousGoodsTrucks = false;
    clickToGetPrice();
    var nextStepPosition = $("#step-7").offset().top;
    $("html, body").animate({scrollTop: nextStepPosition}, 800);
    $("#tooltipdangerousgoods").hide(500);
  }
});

var selectUsage = $("#usage");
selectUsage.on("change", function() {
  var value = $(this).val();
  quoteInfo.usage = value;
  clickToGetPrice();
  var nextStepPosition = $("#step-6").offset().top;
  $("html, body").animate({scrollTop: nextStepPosition}, 800);
});

var selectDeductibleMtpl = $("#deductible_MTPL");
const deductMapping = {"0":"2000","2000":"2000","5000":"5000","10000":"10000"};
selectDeductibleMtpl.on("change", function() {
  var value = $(this).val();
  quoteInfo.deductible_MTPL = value;
  $("#deductible_Casco").val(deductMapping[value]);
  quoteInfo.deductible_Casco = deductMapping[value];
  clickToGetPrice();
});


function actionOnErrors (errorsTriggered){
  $.each(errorsTriggered, function(index, error) {
    switch (error) {
      case "dangerousGoodsTrucksCantBeInsured":
        //alert("We can't insure dangerous good trucks.");
        $("#dangerousgoods-true").attr("style","accent-color:#DC3545")
        $("#tooltipdangerousgoods").show(500);
        var nextStepPosition = $("#step-4").offset().top;
        $("html, body").animate({scrollTop: nextStepPosition}, 800);
        break;
      case "truckPriceTooLow":
        //alert("Truck price is too low.");
        $("#truckprice").attr("style","border-color:#DC3545");
        $("<p style='color:#DC3545'>"+translations.truckPriceTooLow+"</p>").insertAfter("#priceelements");
        var nextStepPosition = $("#step-1").offset().top;
        $("html, body").animate({scrollTop: nextStepPosition}, 800);
        break;
      case "truckPriceTooHigh":
        //alert("Truck price is too high.");
        $("#truckprice").attr("style","border-color:#DC3545");
        $("<p style='color:#DC3545'>"+translations.truckPriceTooHigh+"</p>").insertAfter("#priceelements");
        var nextStepPosition = $("#step-1").offset().top;
        $("html, body").animate({scrollTop: nextStepPosition}, 800);
        break;
      default:
        alert("Unknown error: " + error);
    }
  });
}

function sendQuote(payload){
  var settings = {
    "url": googleSheetUrl,
    "method": "POST",
    "timeout": 0,
    "headers": {
        "Content-Type": "text/plain;charset=utf-8"
    },
    "data": JSON.stringify({
        "request":"sendQuote",
        "formData": payload.formData,
        "quoteId": payload.quoteId,
        "pack": payload.pack,
        "ipAddress": ipAddress,
        "country": payload.country
    }),
  };

  $.ajax(settings).done(function(response) {
        console.log(response);
        $("#getquotediv").html('<div class="successMessageSendQuote">'+translator("sendQuoteModalSuccessMessage",{"email": response.payload.formData.email, "quoteId": response.payload.quoteId})+'.</div>')
  })
}


function translator(key, variables){
  var translation = translations[key];

  for (const key in variables) {
    translation = translation.replace(
      `{{${key}}}`,
      variables[key]
    );
  }

  return translation
}


function openSaveQuoteModal(quoteId, pack){
  console.log(quoteId, pack);
  var tandclink = "https://www.qover.com/?tandclink";
  var ipidlink = "https://www.qover.com/?ipidlink";
  var packTranslations = translator("packNames"+pack);
  var modal = '<section style="display: flex;" class="modal" id="modalgetquote"><div class="div-block-320"></div>';
  modal = modal + '<div style="transform: translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg); filter: blur(0px); transform-style: preserve-3d;" class="w-layout-blockcontainer address-modal w-container">';
    modal = modal + '<div  id="getquotediv"><h4 class="h4-modal">'+translator("sendQuoteModalInfoText",{"pack": packTranslations})+'</h4>';
    modal = modal + '<h2 class="h2-second">'+translations.sendQuoteModalTitle+'</h2>';
    modal = modal + '<div class="w-form"><form id="getquote" class="flex-v for-modal">';
      modal = modal + '<div class="flex-h"><div class="rightaligned">'+translations.sendQuoteModalInputEmail+'</div><input type="email" class="input nomarginbottom w-input" maxlength="256" name="field-3" placeholder="" id="getquote-email" required=""></div>';
      modal = modal + '<div class="flex-h"><div class="rightaligned">'+translations.sendQuoteModalInputPhone+'</div><input type="tel" class="input nomarginbottom w-input" maxlength="256" name="field-3" placeholder="" id="getquote-tel" required=""></div>';
      modal = modal + '<div class="flex-h"><div class="rightaligned">'+translations.sendQuoteModalInputAddress+'</div><input type="text" class="input nomarginbottom w-input" maxlength="256" name="field-3" placeholder="" id="getquote-address" required=""></div>';
      modal = modal + '<div class="flex-h"><div class="rightaligned">'+translations.sendQuoteModalInputCompanyName+'</div><input type="text" class="input nomarginbottom w-input" maxlength="256" name="field-3" placeholder="" id="getquote-company" required=""></div>';
      modal = modal + '<div class="flex-h"><div class="rightaligned">'+translations.sendQuoteModalInputVAT+'</div><input type="text" class="input nomarginbottom w-input" maxlength="256" name="field-3" placeholder="" id="getquote-vat" required=""></div>';      
      if(configQuoteEngine.country == "FR"){
        modal = modal + '<div class="flex-h"><div class="rightaligned">'+translations.sendQuoteModalInputSIREN+'</div><input type="text" class="input nomarginbottom w-input" maxlength="256" name="field-3" placeholder="" id="getquote-SIREN" required=""></div>';      
        modal = modal + '<div class="flex-h"><div class="rightaligned"><img src="https://uploads-ssl.webflow.com/644911ac1572f72efba69772/64ed9b2329f3b2cfe8815217_icon%20i.svg" loading="lazy" width="39" alt="" title="'+translator("ibanExplanation")+'" class="itooltipiban">'+translations.sendQuoteModalInputRIB+'</div><input type="text" class="input nomarginbottom w-input" maxlength="256" name="field-3" placeholder="" id="getquote-iban" required=""></div>';
      } else {
        modal = modal + '<div class="flex-h"><div class="rightaligned"><img src="https://uploads-ssl.webflow.com/644911ac1572f72efba69772/64ed9b2329f3b2cfe8815217_icon%20i.svg" loading="lazy" width="39" alt="" title="'+translator("ibanExplanation")+'" class="itooltipiban">'+translations.sendQuoteModalInputIban+'</div><input type="text" class="input nomarginbottom w-input" maxlength="256" name="field-3" placeholder="" id="getquote-iban" required=""></div>';
      }
      modal = modal + '<div class="checkboxVlta"><input type="checkbox" class="checkboxTandC" maxlength="256" name="field-3" placeholder="" id="getquote-checkbox1" required=""> '+translator("checkbox1")+'</div>';
      modal = modal + '<div class="checkboxVlta"><input type="checkbox" class="checkboxTandC" maxlength="256" name="field-3" placeholder="" id="getquote-checkbox2" required=""> '+translator("checkbox2")+'</div>';
      modal = modal + '<div class="checkboxVlta"><input type="checkbox" class="checkboxTandC" maxlength="256" name="field-3" placeholder="" id="getquote-checkbox3" required=""> '+translator("checkbox3")+'</div>';
      modal = modal + '<div class="checkboxVlta"><input type="checkbox" class="checkboxTandC" maxlength="256" name="field-3" placeholder="" id="getquote-checkbox4" required=""> '+translator("checkbox4")+'</div>';
      modal = modal + '<div class="checkboxVlta"><input type="checkbox" class="checkboxTandC" maxlength="256" name="field-3" placeholder="" id="getquote-checkbox5" required=""> '+translator("checkbox5")+'</div>';
      modal = modal + '<div class="checkboxVlta"><input type="checkbox" class="checkboxTandC" maxlength="256" name="field-3" placeholder="" id="getquote-checktandc" required=""> '+translator("voltaNecessaryToReadTandC",{"ipid": ipidlink, "tandc": tandclink})+'</div>';
      modal = modal + '<div class="checkboxVlta"><input type="checkbox" class="checkboxTandC" maxlength="256" name="field-3" placeholder="" id="getquote-papercopyrqst" required=""> '+translator("paperCopyRequest")+'</div>';
      //modal = modal + '<div class="small-explanation center">'+translator("voltaNecessaryToReadTandC",{"ipid": ipidlink, "tandc": tandclink})+'</div>';
      modal = modal + '<input type="text" id="quoteId" value="'+quoteId+'" style="display:none">';
      modal = modal + '<input type="text" id="pack" value="'+pack+'" style="display:none">';
      modal = modal + '<a class="button-primary-2 grey center w-button" id="sendQuoteBtn">'+translations.sendQuoteModalSubmit+'</a></form>';
    modal = modal + '</div></div>';
    modal = modal + '<div class="div-close" id="closemodalgetquote">';
     modal = modal + '<img src="https://assets.website-files.com/644911ac1572f72efba69772/644922a7462df727411a64b5_cross.svg" loading="lazy" alt="" class="close-icon"><div>'+translations.sendQuoteModalClose+'</div>';
    modal = modal + '</div>';
  modal = modal + '</div></section>';
  modal = modal + '<style>.successMessageSendQuote {font-size: 16px;width: 100%;padding: 120px 40px 20px 40px;text-align: center;border-radius: 4px;background-image: url("https://uploads-ssl.webflow.com/644911ac1572f72efba69772/64cb5ca3f4fd1a21b4c82ad6_v.svg");background-position: center top;background-repeat: no-repeat;margin: 80px 0 40px 0;}';
  modal = modal + 'h4.h4-modal {padding-left: 100px;}img.itooltipiban {position: absolute;left: 0;}.rightaligned {position: relative;display: flex;flex-direction: row-reverse;}';
  modal = modal + 'h4.h4-modal {display: flex;align-items: center;background: #fff no-repeat url("https://uploads-ssl.webflow.com/644911ac1572f72efba69772/64cb602fa1c7d74e79e5ff52_i.svg");background-position: 20px;padding: 20px 20px 20px 80px;border: 1px solid rgba(147, 166, 185, 0.06);border-radius: 6px;box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.03);background-size: 5%;}';
  modal = modal + '.address-modal {display: block !important;}';
  modal = modal + '.checkboxVlta {font-size: 11px !important;max-width: 600px !important;margin: 0 auto !important;}';
  //modal = modal + 'img.itooltipiban {left: 100px;position: relative;}';
  modal = modal + '@media (max-width: 480px) {h4.h4-modal {background-size: 15%;text-align: left;}}</style>';
  $("body").append(modal);

  $("#closemodalgetquote").on( "click", function(event) {
    $("#modalgetquote").remove()
  })

  $("#sendQuoteBtn").on( "click", function(event) {
    event.preventDefault();
    var vat = $("#getquote-vat").val();
    var siren = $("#getquote-SIREN").val();
    var email = $("#getquote-email").val();
    var tel = $("#getquote-tel").val();
    var address = $("#getquote-address").val();
    var company = $("#getquote-company").val();
    var iban = $("#getquote-iban").val();
    var quoteId = $("#quoteId").val();
    var pack = $("#pack").val();
    var checked = $("#getquote-checktandc").is(":checked");
    var papercopyrqst = $("#getquote-papercopyrqst").is(":checked");
    var checkbox1 = $("#getquote-checkbox1").is(":checked");
    var checkbox2 = $("#getquote-checkbox2").is(":checked");
    var checkbox3 = $("#getquote-checkbox3").is(":checked");
    var checkbox4 = $("#getquote-checkbox4").is(":checked");
    var checkbox5 = $("#getquote-checkbox5").is(":checked");
    if(checked && email != "" && email != "" && vat != "" && tel != "" && address != "" && company != ""){
      var payload = {"formData": {"vat":vat, "email": email, "phone":tel, "address":address, "company":company, "iban": iban, "siren": siren}, "quoteId": quoteId, "pack": pack, "country": configQuoteEngine.country, "papercopyrqst": papercopyrqst};
      console.log(payload);
      sendQuote(payload);
      $("#sendQuoteBtn").attr("style","opacity:0.25");
      $("#sendQuoteBtn").text(translations.sending);
    } else {
      $("<p style='color:#DC3545'>"+translations.errorMissingFields+"</p>").insertAfter("#sendQuoteBtn");
    }
    
  });
}