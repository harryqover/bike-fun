$(".loading").hide();
  if(getCookie("authvoucher")!=""){
    $(".login-container").hide();
    $(".form-check-validity-voucher,#nav").show();
    $(".user").text(getCookie("username"));
    $(".shopname").text(getCookie("shopName"))
  } else {
    $(".login-container").show();
    $(".form-check-validity-voucher,#nav").hide();
  }


  var voucherparam = getParameterByName("voucher");
  document.getElementById("voucher-code").value = voucherparam;

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
      var text ="<div>Value: "+value+"<br>Expiry date: "+expiryDate+"<br>Voucher status:"+response.payload.status+"<br> Customer initiales: "+customer+"<br>Reason: "+voucherValidFor+"</div>";
      var redeemtext = '<div style="margin-top:20px;" id="redeemform"><input type="number" id="valueToUse" name="valueToUse" placeholder="Value of the voucher used for the bike"><br><input type="text" id="productPurchased" name="productPurchased" placeholder="Description of the purchase"><br><input type="text" id="invoice" name="invoice" placeholder="Invoice number of the bike"><br><input type="text" id="shop" name="shop" placeholder="Shop name" style="display:none" value="'+getCookie("username")+'"><br><input type="text" id="login" name="login" placeholder="Password" style="display:none" value="'+getCookie("authvoucher")+'"><br><button onclick="useCode()">Redeem</button></div>';
      var htmlToShow = text;
      if(response.payload.status == "Not used"){
      	htmlToShow = htmlToShow+redeemtext;
      }
      $("#textcodecheck").html(htmlToShow);
      $(".loading").hide();
      $(".hide-when-loading").show();
      $("#allvouchers").hide();

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
        $("#allvouchers").html(allHTML);
        //$("#allvouchers").html(JSON.stringify(response));
        $(".loading").hide();
        $(".hide-when-loading").show();
        $(".form-check-validity-voucher").hide();
        $("#allvouchers").show();
        $("#textcodecheck").hide();
      }
    });

  }
  function  showUseVoucher(){
    $(".form-check-validity-voucher").show();
    $("#allvouchers").hide();
  }
  function delete_cookie(name) {
      document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
  function logout(){
    delete_cookie("authvoucher");
    location.reload();
  }
