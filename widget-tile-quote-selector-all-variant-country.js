console.log("v 20230317 1119");

 $(".body-2").hide();
  $(".widget-card-big").hide();
  $(".content-2").hide();
  $(".widget-card-big").css('opacity', '0');

  var btnColor = getParameterByName('btnColor');
  var txtColor = getParameterByName('txtColor');

  if(btnColor!=""){
    $("#moreInfo").css('background-color','#'+btnColor);
    $(".small").css('background-color','#'+btnColor);
  }
  if(txtColor!=""){
    $("#moreInfo").css('color','#'+txtColor);
    $("image-38").css('color','#'+txtColor);
  }


  var countryCurrencySetup = {
    "BE" : ["EUR", "€"],
    "NL" : ["EUR", "€"],
    "FR" : ["EUR", "€"],
    "AT" : ["EUR", "€"],
    "DE" : ["EUR", "€"],
    "IE" : ["EUR", "€"],
    "IT" : ["EUR", "€"],
    "ES" : ["EUR", "€"],
    "PT" : ["EUR", "€"],
    "FI" : ["EUR", "€"],
    "SE" : ["SEK", "SEK"],
    "NO" : ["NOK", "NOK"],
    "GB" : ["GBP", "£"],
    "DK" : ["DKK", "DKK"],
    "PL" : ["PLN", "PLN"]
  }
  var countryWithAssistance = ["BE","FR","DE","NL","AT"];

  function getParameterByName(name) { 
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]"); 
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"), 
        results = regex.exec(location.search); 
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " ")); 
  } 
  // 1. Create a new XMLHttpRequest object
  let xhrLocales = new XMLHttpRequest();

  // 2. Configure it: GET-request for the URL /article/.../load
  //var country = getParameterByName('country');
  var countryString = getParameterByName("country");
  var countries = countryString.split(",");
  
  var type = getParameterByName('type');
  var value = getParameterByName('value');
  var discountCodes = getParameterByName('discountCodes');
  var lang = getParameterByName('lang');
  var apikey = getParameterByName('apikey');
  var currency = "€";
  var country = "BE";
  var curr = "EUR";
  

  //var xhr = new XMLHttpRequest();
  var content = "";
  xhrLocales.open("get", "https://translations.qover.com/widget/" + getParameterByName('lang') + ".json", true);
  xhrLocales.setRequestHeader("Cache-Control", "max-age=3600");

  xhrLocales.onreadystatechange = function() {
    if (xhrLocales.readyState == 4) {
      if (xhrLocales.status >= 200 && xhrLocales.status < 300 || xhrLocales.status == 304) {
        content = JSON.parse(xhrLocales.responseText);
        //console.log("content",content);
        //console.log( $(".content-2").html())
        $(".content-2").html($(".content-2").html().replace(new RegExp('bike.insureThisBike', 'g'),content["bike.insureThisBike"]));
        $(".content-2").html($(".content-2").html().replace(new RegExp('bike.theftAssistance', 'g'),content["bike.theftAssistance"]));
        $(".content-2").html($(".content-2").html().replace(new RegExp('bike.omnium', 'g'),content["bike.omnium"]));
        $(".content-2").html($(".content-2").html().replace(new RegExp('bike.getMyPrice', 'g'),content["bike.getMyPrice"]));
        $(".content-2").html($(".content-2").html().replace(new RegExp('bike.back', 'g'),content["bike.back"]));
        $(".content-2").html($(".content-2").html().replace(new RegExp('bike.back', 'g'),content["bike.back"]));
        $(".content-2").html($(".content-2").html().replace(new RegExp('bike.theft', 'g'),content["bike.theft"]));
        $(".content-2").html($(".content-2").html().replace(new RegExp('bike.assistance', 'g') ,content["bike.assistance"]));
        $(".content-2").html($(".content-2").html().replace(new RegExp('bike.materialDamage', 'g'),content["bike.materialDamage"]));
        $(".content").html($(".content").html().replace(new RegExp('bike.error', 'g'),content["bike.error"]));
        $(".content").html($(".content").html().replace('bike.insureYourBike',content["bike.insureYourBike"]));
        $(".content").html($(".content").html().replace('bike.bikeType',content["bike.bikeType"]));
        $(".content").html($(".content").html().replace('bike.bikeType.regular.bike',content["bike.bikeType.regular.bike"]));
        $(".content").html($(".content").html().replace('bike.bikeType.regular.ebike',content["bike.bikeType.regular.ebike"]));
        $(".content").html($(".content").html().replace('bike.bikeType.race.bike',content["bike.bikeType.race.bike"]));
        $(".content").html($(".content").html().replace('bike.bikeType.race.ebike',content["bike.bikeType.race.ebike"]));
        $(".content").html($(".content").html().replace('bike.bikeType.mountain.ebike',content["bike.bikeType.mountain.ebike"]));
        $(".content").html($(".content").html().replace('bike.bikeType.mountain.bike',content["bike.bikeType.mountain.bike"]));
        $(".content").html($(".content").html().replace('bike.bikeType.cargo.ebike',content["bike.bikeType.cargo.ebike"]));
        $(".content").html($(".content").html().replace('bike.bikeType.cargo.bike',content["bike.bikeType.cargo.bike"]));
        $(".content").html($(".content").html().replace('general.purchasePriceVATincl',content["general.purchasePriceVATincl"]));
        $(".content").html($(".content").html().replace('general.getMyPrice',content["general.getMyPrice"]));
        $(".content-2").html($(".content-2").html().replace(new RegExp('general.chooseThisPlan', 'g'),content["general.chooseThisPlan"]));
        $(".body-2").show();
        $(".loading").hide();
        listenToClicks();
      }
    }
  };
  xhrLocales.send();

  function getPrice(type, value){
    var country = $( "select[name='Country'] option:selected" ).val();
    let xhrPrice = new XMLHttpRequest();
    xhrPrice.open('GET', 'https://dojo-production-bike-api.production.cluster.qover.io/v1/price-info?apikey='+apikey+'&iecb=1592535798477&country='+country+'&type='+type+'&value='+value+'&discountCodes='+discountCodes);
    xhrPrice.setRequestHeader("Cache-Control", "max-age=3600");
    // 3. Send the request over the network
    xhrPrice.send();

    // 4. This will be called after the response is received
    xhrPrice.onload = function() {
      $(".widget-card-big").show();
      var product = getParameterByName('product');
      if(product=="omnium") {
        $("#theftAssistance").parent().hide()
        $(".w-col-6").css("width","100%")
      } 
      if (xhrPrice.status != 200) { // analyze HTTP status of the response
        console.warn(`Error ${xhrPrice.status}: ${xhrPrice.statusText}`); // e.g. 404: Not Found
      } else { // show the result
        console.warn(`Done, got ${xhrPrice.response.length} bytes`); // response is the server

        var responseGetPrice = JSON.parse(xhrPrice.response);

        var monthlyPriceOmnium = responseGetPrice.priceInfo[0].coverages[3].monthlyPremium.withTaxes/100;
        var yearlyPriceOmnium = responseGetPrice.priceInfo[0].coverages[3].yearlyPremium.withTaxes/100;

        var monthlyPriceTheft= responseGetPrice.priceInfo[0].coverages[1].monthlyPremium.withTaxes/100;
        var yearlyPriceTheft = responseGetPrice.priceInfo[0].coverages[1].yearlyPremium.withTaxes/100;


        var txtMonthlyPrice = content["general.perMonth"];
        
        currency = countryCurrencySetup[country][1];
        curr = countryCurrencySetup[country][0];
        
        console.warn("country", country);
        console.log("countryWithAssistance.includes(country)", countryWithAssistance.includes(country));

        if(countryWithAssistance.includes(country)){
          $("#theftAssistance > div > div.div-block-51 > div:nth-child(3),#omnium > div > div.div-block-51 > div:nth-child(3)").show()
        } else {
          $("#theftAssistance > div > div.div-block-51 > div:nth-child(3),#omnium > div > div.div-block-51 > div:nth-child(3)").hide()
        }

        if(curr=="EUR"){
          //$('.widget-price').text(monthlyPriceOmnium+currency+txtMonthlyPrice);
          $('#omniumPrice').text(monthlyPriceOmnium+currency+txtMonthlyPrice);
          $('#theftPrice').text(monthlyPriceTheft+currency+txtMonthlyPrice);
        } else {
          //$('.widget-price').text(currency+" "+monthlyPriceOmnium+txtMonthlyPrice);
          $('#omniumPrice').text(currency+" "+monthlyPriceOmnium+txtMonthlyPrice);
          $('#theftPrice').text(currency+" "+monthlyPriceTheft+txtMonthlyPrice);
        }

        //$('#omniumPrice').text(monthlyPriceOmnium+txtMonthlyPrice);
        //$('#theftPrice').text(monthlyPriceTheft+txtMonthlyPrice);

        //var country = $( "select[name='Country'] option:selected" ).val();
        var langForRedirect = getParameterByName('lang');
        langForRedirect = (country == "IT")?"it":langForRedirect;
        langForRedirect = (country == "ES")?"es":langForRedirect;
        langForRedirect = (country == "PT")?"pt":langForRedirect;
        langForRedirect = (country == "FI")?"fi":langForRedirect;
        
        $('#moreInfo').attr('href', 'https://app.qover.com/bike/quote?key='+apikey+'&locale='+langForRedirect+'-'+country+'&promocode='+discountCodes+'&bikevalue='+value+'&biketype='+type+'');
        $(".content-2").show();
        $(".widget-card-big").css('opacity', '1');
        console.log(responseGetPrice);

        //facebook track
        fbq('track', 'ViewContent', {
          value: yearlyPriceOmnium,
          currency: 'EUR',
          content_name: 'omnium',
          content_category: 'widget',
          content_ids: ['bikeinsurance'], // top 5-10 results
          content_type: 'product',
          partnerKey: __QOVER_API_KEY__
        });

        //GA event
        dataLayer.push({
          'event': 'onlyAnalytics',
          'eventCategory': 'widget',
          'eventAction': 'tile-quote-dark',
          'eventLabel': getParameterByName('type'),
          'eventValue': getParameterByName('value')/100
        });

      }
    };
  }

  function listenToClicks(){
    /*save email start*/
    console.log("listen to click start", country, lang);
    $( "#getPrice" ).click(function() {
      event.preventDefault();
      $(".widget-card-big").css('opacity', '0');
      var country = $( "select[name='Country'] option:selected" ).val();
      var type = $( "select[name='bike-type'] option:selected" ).val();
      var value = $( "#Purchase-price" ).val()*100;
      console.log(value)

      if(value/100 > 250){
        $(".content").hide()
        console.log('launch get price',type, value);
        $("#errorMessage").css('display', 'none');
        getPrice(type,value)
      }else{
        $("#errorMessage").css('display', 'inline-block');
      }
    });


    $( "#back" ).click(function() {
      $(".content").show();
      $(".widget-card-big").css('opacity', '0');
      $(".content-2").hide(); 
    }); 
  }

  
  $('#Country-2 > option').hide();
    for (var i = 0; i < countries.length; i++) {
    var cty = countries[i];
    $('#Country-2 > option[value="'+cty+'"]').show();
  }