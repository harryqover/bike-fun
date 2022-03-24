console.log("js file update 20220225 0732");
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
      $("body > div.voucher-section.hidewhenloading.wf-section > h1").text(translation.voucherVoucherYourQoverVoucher);
      $("#link-redeem").text(translation.voucherVoucherAskYourBikeRetailer);
      $(".legal-mention-voucher-text").text(translation.voucherVoucherLegalMention);

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
  var cigarId = response.payload.cigarId;
  var country = cigarId.substring(0, 2);
  if(country == "BE"){
    $(".voucher-france").hide();
  } else if(country == "FR"){
    $(".voucher-belgium").hide();
  }
  var today = new Date()
  var expiryDate = new Date(response.payload.expiryDate);
  if (expiryDate < today) {
    var expiryDate = expiryDate.toLocaleDateString("en-BE");
    var expiryDateTxt = translation.voucherVoucherOutdated.replaceAll("{{expiryDate}}", expiryDate);
  } else {
    var expiryDate = expiryDate.toLocaleDateString("en-BE");
    var expiryDateTxt = translation.voucherVoucherMaxDateToRedeem.replaceAll("{{expiryDate}}", expiryDate);
  }
  $("#expiryDate").text(expiryDateTxt);
  var textvoucherVoucherUsedAt = translation.voucherVoucherUsedAt.replaceAll("{{shopName}}", response.payload.store);
  textvoucherVoucherUsedAt = textvoucherVoucherUsedAt.replaceAll("{{usedFor}}", response.payload.purchasedItem);
  var textPurchasedItem = textvoucherVoucherUsedAt;
  if (response.payload.leftValue > 0) {
    //
    textPurchasedItem = textPurchasedItem + translation.voucherLeftValueGoBackToTPA
  }
  $(".purchased-item-text").text(textPurchasedItem);
  var textnominative = translation.voucherVoucherVoucherNominative;
  textnominative = textnominative.replaceAll("{{customer}}", response.payload.customer);
  textnominative = textnominative + response.payload.voucherValidFor;

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
    colorDark: "#171c34",
  });
  $("#link-redeem").attr("href", urlRedeem);
  $(".hidewhenloading").show();
  $(".loading").hide();
});