var translation = "";
var lang = getParameterByName('lang');
if (lang == ""){
  lang = "en";
}

function getTranslation(){
  var rand = Math.random();
  let xhrLocales = new XMLHttpRequest();

  xhrLocales.open("get", "https://translations.qover.com/widget/" + lang + "-raw.json?cache="+rand, true);
  xhrLocales.setRequestHeader("Cache-Control", "max-age=3600");

  xhrLocales.onreadystatechange = function() {
  if (xhrLocales.readyState == 4) {
    if (xhrLocales.status >= 200 && xhrLocales.status < 300 || xhrLocales.status == 304) {
      translation = JSON.parse(xhrLocales.responseText);
      console.log(translation);
      /*
      $( "[data-translation]" ).each(function( index ) {
        //console.log( index + ": " + $( this ).data("translation") );

        $( this ).html(content[$( this ).data( "translation" )]);
        var text = $( this ).html();
        $( this ).html(text.replaceAll("{{apiKey}}", getParameterByName('key')));
        var text2 = $( this ).html();
        //console.log("brand before replace is .....line 46 => ",brand);
        $( this ).html(text2.replaceAll("{{brand}}", brand));
      });
      */
    }
  }
  };
  xhrLocales.send();
}
getTranslation();

var voucher = getParameterByName("code");
var settings = {
  "url": "https://script.google.com/macros/s/AKfycbxqUEiWrq_FvaW14kUD5xpRGXPYyb1D9P0yYVf62J8A5cmC9Qb0BAsG1Vge05RwT-ww/exec",
  "method": "POST",
  "timeout": 0,
  "headers": {
    "Content-Type": "text/plain;charset=utf-8"
  },
  "data": JSON.stringify({
    "voucher": voucher,
    "action": "check"
  }),
};

$.ajax(settings).done(function(response) {
  console.log(response);
  var value = response.payload.currency + " " + response.payload.leftValue
  $("#value-left").text(value);
  $("#voucher-code").text(response.payload.voucherCode);
  var today = new Date()
  var expiryDate = new Date(response.payload.expiryDate);
  if (expiryDate < today) {
    var expiryDate = expiryDate.toLocaleDateString("en-BE");
    //var expiryDateTxt = "Voucher outdated " + expiryDate;//translation.voucherVoucherOutdated
    var expiryDateTxt = translation.voucherVoucherOutdated.replaceAll("{{expiryDate}}", expiryDate);
  } else {
    var expiryDate = expiryDate.toLocaleDateString("en-BE");
    var expiryDateTxt = translation.voucherVoucherMaxDateToRedeem.replaceAll("{{expiryDate}}", expiryDate);
    //var expiryDateTxt = "Max date to redeem " + expiryDate;//voucherVoucherMaxDateToRedeem
  }
  $("#expiryDate").text(expiryDateTxt);
  var textPurchasedItem = "Voucher used at " + response.payload.store + " for a " + response.payload.purchasedItem + ". ";
  console.log("value: ", response.payload.leftValue);
  if (response.payload.leftValue > 0) {
    textPurchasedItem = textPurchasedItem + "Go back to your claim handler to claim the value left."
  }
  $(".purchased-item-text").text(textPurchasedItem);
  var textnominative = "This voucher is nominative and can be used only by " + response.payload.customer + ". " + response.payload.voucherValidFor;

  $(".nominative-text").text(textnominative);
  if (response.payload.status == "Not used") {
    $(".hide-when-not-used").hide();
  } else {
    $("#voucher-status").text(response.payload.status);
    $(".hide-when-used").hide();
  }
  var urlRedeem = "https://bike-a5adfd.webflow.io/redeem?voucher=" + response.payload.voucherCode;
  new QRCode(document.getElementById("qrcode"), {
    text: urlRedeem,
    width: 128,
    height: 128,
    colorDark: "#eb4f87",
  });
  $("#link-redeem").attr("href", urlRedeem);
  $(".hidewhenloading").show();
  $(".loading").hide();
});