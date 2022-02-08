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

  $.ajax(settings).done(function (response) {
    console.log(response);
    var value = response.payload.currency+" "+response.payload.leftValue
    $("#value-left").text(value);
    $("#voucher-code").text(response.payload.voucherCode);
    var today = new Date()
    var expiryDate = new Date(response.payload.expiryDate);
    if(expiryDate < today){
    	var expiryDate = expiryDate.toLocaleDateString("en-BE");
      var expiryDateTxt = "Voucher outdated "+expiryDate;
    } else {
      var expiryDate = expiryDate.toLocaleDateString("en-BE");
      var expiryDateTxt = "Max date to redeem "+expiryDate;
    }
    $("#expiryDate").text(expiryDateTxt);
    var textPurchasedItem = "Voucher used at "+response.payload.store+" for a "+response.payload.purchasedItem+". ";
    console.log("value: ",response.payload.leftValue);
    if(response.payload.leftValue>0){
    	textPurchasedItem = textPurchasedItem+"Go back to your claim handler to claim the value left."
    }
    $(".purchased-item-text").text(textPurchasedItem);
    var textnominative = "This voucher is nominative and can be used only by "+response.payload.customer+". "+response.payload.voucherValidFor;
    
    $(".nominative-text").text(textnominative);
    if(response.payload.status == "Not used"){
      $(".hide-when-not-used").hide();
    } else {
      $("#voucher-status").text(response.payload.status);
      $(".hide-when-used").hide();
    }
    var urlRedeem = "https://bike-a5adfd.webflow.io/redeem?voucher="+response.payload.voucherCode;
    new QRCode(document.getElementById("qrcode"), {
      text: urlRedeem,
      width: 128,
      height: 128,
      colorDark : "#eb4f87",
    });
    $("#link-redeem").attr("href",urlRedeem);
    $(".hidewhenloading").show();
    $(".loading").hide();
  });