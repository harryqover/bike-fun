$(".loading").hide();
$("div.content-block-platform.hide-when-loading > div:nth-child(1)").remove();
showGeneralInfo();
  if(getCookie("authvoucher")!=""){
    //partner should be logged in
    $(".login-container").hide();
    $(".form-check-validity-voucher,#nav").show();
    $(".user").text(getCookie("username"));
    //$(".shopname").text(getCookie("shopName"));
    var shopLogo = getCookie("shopLogo");
    $(".logo-partner-platform").attr('src',shopLogo);
  } else {
    $(".login-container").show();
    $(".form-check-validity-voucher,#nav").hide();
    window.location.href = 'https://bike-a5adfd.webflow.io/login-partner';
  }


  var voucherparam = getParameterByName("voucher");
  var htmlVoucherSearchInput = '<div class="form-7" style=""><input type="text" id="voucher-code" name="voucher-code" placeholder="Voucher code" style="" class="text-field-11 w-input"><button class="second-action-platform-2-2 w-button" onclick="checkCode()">Submit</button></div>';
  var googleSheetUrl = "https://script.google.com/macros/s/AKfycbxqUEiWrq_FvaW14kUD5xpRGXPYyb1D9P0yYVf62J8A5cmC9Qb0BAsG1Vge05RwT-ww/exec";

  function loginvoucherpartner(){
    $(".loading").show();
    var username = $("#username").val();
    var password = $("#password").val();
    var settings = {
      "url": googleSheetUrl,
      "method": "POST",
      "timeout": 0,
      "headers": {
        "Content-Type": "text/plain;charset=utf-8"
      },
      "data": JSON.stringify({
        "username": username,
        "password": password,
        "action": "login"
      }),
    };

    $.ajax(settings).done(function (response) {
      console.log(response);
      var authorization = response.payload.authorization;
      var partnerName = response.payload.shop;
      var shopName = response.payload.shopName;
      if(response.payload.statuslogin == "connected"){
        setCookie("username", username, "7");
        setCookie("authvoucher", authorization, "7");
        setCookie("partnerName", partnerName, "7");
        setCookie("shopName", shopName, "7");
        location.reload();
      } else {
        alert("error login");
      }
      $(".loading").hide();
      $(".hide-when-loading").show();

    });


  }



  function checkCode(){
    $(".loading").show();
    $(".hide-when-loading").hide();
    var voucher = $("#voucher-code").val();
    var settings = {
      "url": googleSheetUrl,
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
      var value = response.payload.currency+" "+response.payload.leftValue;
      var expiryDate = new Date(response.payload.expiryDate);
      var expiryDate = expiryDate.toLocaleDateString("en-BE");
      var customer = response.payload.customer;
      var voucherValidFor = response.payload.voucherValidFor;
      /*WIP*/
      var newHtmlText = '<div class="platform-voucher-status-check-2"><div class="platform-voucher-status-check-col-2"><div class="platform-voucher-status-check-label">Value</div><div>'+value+'</div></div><div class="platform-voucher-status-check-col-2"><div class="platform-voucher-status-check-label">Expiry date</div><div class="platform-voucher-status-check-value">'+expiryDate+'</div></div><div class="platform-voucher-status-check-col-2"><div class="platform-voucher-status-check-label">Customer initiales</div><div class="platform-voucher-status-check-value">'+customer+'</div></div><div class="platform-voucher-status-check-col-2"><div class="platform-voucher-status-check-label">Reason</div><div class="platform-voucher-status-check-value">'+voucherValidFor+'e</div></div><div class="platform-voucher-status-check-col-2"><div class="platform-voucher-status-check-label">Voucher status</div><div class="platform-voucher-status-check-tag">'+response.payload.status+'</div></div></div>';
      var newHtmlForm = '<div class="form-use-voucher-2 w-form"><div id="" name="" data-name="" method="" class="form-9" aria-label=""><div class="div-block-40"><label for="name" class="field-label-3">Value of the voucher used for the bike</label><input type="text" class="text-field-3 w-input" maxlength="256" name="name" data-name="Name" placeholder="1000 €" id="name"></div><div class="div-block-40"><label for="email" class="field-label-3">Description of the purchase</label><input type="email" class="w-input" maxlength="256" name="email" data-name="Email" placeholder="Small description of the item purchased with the voucher" id="email" required=""></div><div class="div-block-40"><label for="email-2" class="field-label-3">Invoice number of the bike</label><input type="email" class="w-input" maxlength="256" name="email-2" data-name="Email 2" placeholder="Example: EA23B456" id="email-2" required=""></div><input type="submit" value="Submit" class="submit-button-6 w-button"></div></div>';
      //var text ="<div>Value: "+value+"<br>Expiry date: "+expiryDate+"<br>Voucher status:"+response.payload.status+"<br> Customer initiales: "+customer+"<br>Reason: "+voucherValidFor+"</div>";
      //var redeemtext = '<div style="margin-top:20px;" id="redeemform"><input type="number" id="valueToUse" name="valueToUse" placeholder="Value of the voucher used for the bike"><br><input type="text" id="productPurchased" name="productPurchased" placeholder="Description of the purchase"><br><input type="text" id="invoice" name="invoice" placeholder="Invoice number of the bike"><br><input type="text" id="shop" name="shop" placeholder="Shop name" style="display:none" value="'+getCookie("username")+'"><br><input type="text" id="login" name="login" placeholder="Password" style="display:none" value="'+getCookie("authvoucher")+'"><br><button onclick="useCode()">Redeem</button></div>';
      var htmlToShow = newHtmlText;
      if(response.payload.status == "Not used"){
      	htmlToShow = '<div class="voucher-redeem-container" style="display: flex;flex-direction: column;">'+htmlToShow+newHtmlForm+'</div>';
      }
      $(".block-in-content-platform").html(htmlToShow);
      $(".loading").hide();
      $(".hide-when-loading").show();
    });

  }


  function useCode(){
    $(".loading").show();
    $(".hide-when-loading").hide();
    var voucher = $("#voucher-code").val();
    var shop = $("#shop").val();
    var login = $("#login").val();
    var value = $("#valueToUse").val();
    var productPurchased = $("#productPurchased").val();
    var invoice = $("#invoice").val();
    var username = getCookie("username");

    var settings = {
      "url": googleSheetUrl,
      "method": "POST",
      "timeout": 0,
      "headers": {
        "Content-Type": "text/plain;charset=utf-8"
      },
      "data": JSON.stringify({
        "voucher": voucher,
        "value": value,
        "usedby": shop,
        "purchasedItem": productPurchased,
        "action":"usevoucher",
        "checker": login,
        "invoice": invoice,
        "username": username
      }),
    };

    $.ajax(settings).done(function (response) {
      $("#textcodecheck").html(JSON.stringify(response.payload));
      $(".loading").hide();
      $(".hide-when-loading").show();
    });

  }

  function findAllVouchers(){
    $(".loading").show();
    $(".hide-when-loading").hide();
    $(".title-platform, .breadcrumb-here").text("All vouchers");

    var username = getCookie("username");
    var authorization = getCookie("authvoucher");

    var settings = {
      "url": googleSheetUrl,
      "method": "POST",
      "timeout": 0,
      "headers": {
        "Content-Type": "text/plain;charset=utf-8"
      },
      "data": JSON.stringify({
        "action":"findAllVouchers",
        "checker": authorization,
        "username": username
      }),
    };

    $.ajax(settings).done(function (response) {
      var data = response.payload;
      console.warn("data: ", data);
      if (data == "not authorized"){
        logout();
      } else {
        var allHTML = "<table><tr><th>Invoice #</th><th>Code</th><th>Amount</th><th>Date</th><th>Invoice status</th><th>Used by</th></tr>";

        for (var i = 1; i < data.length; i++) {
          console.log(data[i].code);
          var codeUsed = data[i].code;
          var codeUsed5Characters = "xxxx-xxxx-xxxx"+codeUsed.substr(codeUsed.length - 5);
          var dateNotFormatted = new Date(data[i].dateUsed);
          var dateFormatted = dateNotFormatted.toLocaleDateString("en-BE");
          var htmllinevoucher = '<tr class="voucher-line"><td>'+data[i].purchasedInvoice+'</td><td>'+codeUsed5Characters+'</td><td>'+data[i].currency+' '+data[i].valueUsed+'</td><td>'+dateFormatted+'</td><td>'+data[i].invoiceStatus+'</td><td>'+data[i].usedby+'</td></tr>';
          allHTML = allHTML+htmllinevoucher;
        }
        allHTML = allHTML+"</table>";
        $(".title-platform, .breadcrumb-here").text("Vouchers");
        $(".block-in-content-platform").html(allHTML);
        $(".loading").hide();
        $(".hide-when-loading").show();
        $(".form-check-validity-voucher").show();
        //$("#allvouchers").show();
      }
    });

  }

  /*function  showUseVoucher(){
    $(".form-check-validity-voucher").show();
    $("#allvouchers").hide();
  }*/
  function delete_cookie(name) {
      document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
  function logout(){
    delete_cookie("authvoucher");
    delete_cookie("shopLogo");
    delete_cookie("shopName");
    delete_cookie("username");
    delete_cookie("partnerName");
    location.reload();
  }

function showUseVoucher(){
  $(".loading").show();
  $(".hide-when-loading").hide();

  $(".title-platform, .breadcrumb-here").text("Use a voucher");
  $(".block-in-content-platform").html(htmlVoucherSearchInput);
  document.getElementById("voucher-code").value = voucherparam;

  $(".hide-when-loading").show();
  $(".loading").hide();
}

function showGeneralInfo(){
  $(".loading").show();
  $(".hide-when-loading").hide();
  //$(".form-check-validity-voucher").hide();
  $(".title-platform, .breadcrumb-here").text("General information");
  var allHTML = '<div class="generalInfoContent"><h3>Welcome to our general info page</h3><p>In this admin you can redeem a voucher and see all vouchers used.</p></div></div>';
  $(".block-in-content-platform").html(allHTML);
  $(".hide-when-loading").show();
  $(".loading").hide();
}