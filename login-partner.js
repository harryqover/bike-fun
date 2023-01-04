  console.log("20221001 2158")
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

  $( "<a onclick='showMagicLink()' id='magicLink'>Recevoir un lien magique pour se connecter</a>" ).insertAfter( ".submit-button-5" );
  $( "<a onclick='showCreateAccount()' id='showCreateAccount'>Créer un compte ou mettre à jour le mot de passe</a>" ).insertAfter( ".submit-button-5" );


  function showMagicLink(){
    $("#password").hide();
    $(".submit-button-5").hide();
    $("#magicLink").hide();
    $('<button onclick="getMagicLink()" style="display:block; width:280px; margin: 15px auto;" class="submit-button-5 w-button">Envoyer le lien par email</button>').insertAfter( ".submit-button-5" );

  }

  function showCreateAccount(){
    $(".submit-button-5").hide();
    $("#magicLink").hide();
    $('<input type="text" id="partnershop" name="partnershop" placeholder="Nom du magasin" class="text-field-3 w-input" value="" autocomplete="off">').insertAfter( "#password" );
    $('<button onclick="createAccount()" style="display:block; width:280px; margin: 15px auto;" class="submit-button-5 w-button">Créer un compte ou mettre à jour le mot de passe</button>').insertAfter( ".submit-button-5" );


  }

  function createAccount(){
    $(".loading").show(250);
    $(".hide-when-loading").hide(250);
    var username = $("#username").val();
    var password = $("#password").val();
    var partnershop = $("#partnershop").val();
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
        "partnershop":partnershop,
        "action": "createAccount"
      }),
    };

    $.ajax(settings).done(function (response) {
      console.log(response);
      //var authorization = response.payload.authorization;
      if(response.payload == "success"){
        $(".hide-when-loading").text("Un administrateur va valider votre compte");
      } else {
        $(".hide-when-loading").text("Erreur");
      }
      
      $(".hide-when-loading").show();
      $(".loading").hide();
    });
  }


  function getMagicLink(){
    $(".loading").show(250);
    $(".hide-when-loading").hide(250);
    var username = $("#username").val();
    var settings = {
      "url": googleSheetUrl,
      "method": "POST",
      "timeout": 0,
      "headers": {
        "Content-Type": "text/plain;charset=utf-8"
      },
      "data": JSON.stringify({
        "username": username,
        "action": "magicLink"
      }),
    };

    $.ajax(settings).done(function (response) {
      console.log(response);
      //var authorization = response.payload.authorization;
      if(response.payload == "success"){
        setCookie("username", username, "7");
        $(".hide-when-loading").text("Vérifiez votre boite email");
      } else {
        $(".hide-when-loading").text("Erreur avec votre email");
      }
      
      $(".hide-when-loading").show();
      $(".loading").hide();
    });
  }

  var auth = getParameterByName("auth");
  if(auth){
    setCookie("authvoucher", auth, "7");
    window.location.href = 'https://bike.qover.com/portal/main';
  }