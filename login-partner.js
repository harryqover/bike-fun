console.log("20220316 0943")
  var voucherparam = getParameterByName("voucher");
  var googleSheetUrl = "https://script.google.com/macros/s/AKfycbxqUEiWrq_FvaW14kUD5xpRGXPYyb1D9P0yYVf62J8A5cmC9Qb0BAsG1Vge05RwT-ww/exec";
$(".loading").hide();
  function loginvoucherpartner(){
    $(".loading").show(250);
    $(".hide-when-loading").hide(250);
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
      var shopLogo = response.payload.shopData.shopLogo;
      var role = response.payload.role;
      if(response.payload.statuslogin == "connected"){
        setCookie("username", username, "7");
        setCookie("authvoucher", authorization, "7");
        setCookie("partnerName", partnerName, "7");
        setCookie("shopName", shopName, "7");
        setCookie("shopLogo", shopLogo, "7");
        if (role > 1) {
          window.location.href = 'https://bike.qover.com/portal/main-redeem?voucher='+voucherparam;
        } else {
          window.location.href = 'https://bike.qover.com/portal/main';
        }

      } else {
        alert("error login");
        $(".hide-when-loading").show();
        $(".loading").hide();
        window.location.href = 'https://bike.qover.com/login-partner?voucher='+voucherparam;
      }
    });
  }