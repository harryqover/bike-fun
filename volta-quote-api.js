console.warn("updated 20230802 1411")
//$(".ambient-vz, .img-ambient").show();
//$(".refrigerated-vz, .img-refrigerated").hide();

/*
var quoteInfo = {
    "truckAmount": 1,
    "truckType": "16tAmbient",
    "dangerousGoodsTrucks": false,
    "leasedTrucks": false,
    "deductible_MTPL": "2000EUR",
    "deductible_PartialCasco": "2000EUR",
    "deductible_CollisionCasco": "2000EUR",
    "tons" : "16t",
    "type" : "Ambient",
    "zone" : ""
}
*/

var quoteInfo = {
  "truckPrice": 400000,
  "usage": "onlyGoods4Company",
  "truckAmount": 1,
  "truckType": "18tRefriBi",
  "dangerousGoodsTrucks": false,
  "leasedTrucks": false,
  "deductible_MTPL": "10000",
  "deductible_Casco": "10000",
  "country": configQuoteEngine.country
}

function clickToGetPrice(){
  console.log(quoteInfo);
	getPrice(quoteInfo.truckAmount, quoteInfo.truckPrice, quoteInfo.dangerousGoodsTrucks, quoteInfo.leasedTrucks, quoteInfo.deductible_MTPL, quoteInfo.deductible_Casco, quoteInfo.country, quoteInfo.usage);
}

const googleSheetUrl = "https://script.google.com/macros/s/AKfycbxd7iLSKEWjn4Kjsh6SR4zVDZCz2HxnAXA1OHG_7pzBrE0VLi5ze-9DOV1Y7tpyr13d6Q/exec";

function getPrice(truckAmount, truckPrice, dangerousGoodsTrucks, leasedTrucks, deductible_MTPL, deductible_Casco, country, usage) {    
    $("[data-price]").text('Loading new prices');
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
        }),
    };

    $.ajax(settings).done(function(response) {
            console.log(response);
            window.payloadFromNinja = response;
            if(response.response.errors.length > 0){
              console.warn(response.response.errors);
              alert("errors check logs");
            } else {
              const formatter = new Intl.NumberFormat('en-'+country, {
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

              /*
              var formattedTotalPrice1 = response.response.packs.pack1.toLocaleString("en-"+country, {style: "currency", currency: response.response.currency.currency});
              var formattedTotalPrice2 = response.response.packs.pack2.toLocaleString("en-"+country, {style: "currency", currency: response.response.currency.currency});
              var formattedTotalPrice3 = response.response.packs.pack3.toLocaleString("en-"+country, {style: "currency", currency: response.response.currency.currency});

              $("[data-price='pack1'").text(response.response.currency.symbol + " " +formattedTotalPrice1);
              $("[data-price='pack2'").text(response.response.currency.symbol + " " +formattedTotalPrice2);
              $("[data-price='pack3'").text(response.response.currency.symbol + " " +formattedTotalPrice3);
              */
            }
            
            //$("#form-quote > div.flex-v-25.margin-bottom-60 > div.price > div:nth-child(2)").text(formattedTotalPrice);
        }
    )
}
clickToGetPrice();



const priceInput = document.querySelector('#truckprice');
priceInput.addEventListener('change', function() {
  quoteInfo.truckPrice = $('#truckprice').val() ;
  clickToGetPrice();
})

const avgTruckPrice = {"DE":345000,"FR":345000};
$("[data-click='avgprice']").on( "click", function() {
  $('#truckprice').val(avgTruckPrice[configQuoteEngine.country]);
  quoteInfo.truckPrice = $('#truckprice').val() ;
  clickToGetPrice();
} );

const radioLeasingTrue = document.querySelector('#leasing-true');
const radioLeasingFalse = document.querySelector('#leasing-false');
radioLeasingFalse.click(); //select false by default

radioLeasingTrue.addEventListener('change', function() {
  if (this.checked) {
    quoteInfo.leasedTrucks = true;
  }
  clickToGetPrice();
});

radioLeasingFalse.addEventListener('change', function() {
  if (this.checked) {
    quoteInfo.leasedTrucks = false;
  }
  clickToGetPrice();
});


const radioDangerousgoodsTrue = document.querySelector('#dangerousgoods-true');
const radioDangerousgoodsFalse = document.querySelector('#dangerousgoods-false');
radioDangerousgoodsFalse.click(); //select false by default

radioDangerousgoodsTrue.addEventListener('change', function() {
  if (this.checked) {
    quoteInfo.dangerousGoodsTrucks = true;
  }
  clickToGetPrice();
});

radioDangerousgoodsFalse.addEventListener('change', function() {
  if (this.checked) {
    quoteInfo.dangerousGoodsTrucks = false;
  }
  clickToGetPrice();
});

var selectUsage = $("#usage");
selectUsage.on("change", function() {
  var value = $(this).val();
  quoteInfo.usage = value;
  clickToGetPrice();
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



// OLD CODE
/*
const checkboxLeasing = document.querySelector('#leasing');
checkboxLeasing.addEventListener('change', function() {
  if (this.checked) {
    console.log('The checkboxLeasing is toggled on');
    quoteInfo.leasedTrucks = true;
    // Perform additional actions when the checkbox is toggled on
  } else {
    console.log('The checkboxLeasing is toggled off');
    quoteInfo.leasedTrucks = false;
    // Perform additional actions when the checkbox is toggled off
  }
  clickToGetPrice();
});


const checkboxDangerous = document.querySelector('#dangerous');
checkboxDangerous.addEventListener('change', function() {
  if (this.checked) {
    console.log('The checkboxDangerous is toggled on');
    quoteInfo.dangerousGoodsTrucks = true;
    // Perform additional actions when the checkbox is toggled on
  } else {
    console.log('The checkboxDangerous is toggled off');
    quoteInfo.dangerousGoodsTrucks = false;
    // Perform additional actions when the checkbox is toggled off
  }
  clickToGetPrice();
});
*/

const radioZone1 = document.querySelector('#zone1');
radioZone1.click(); //select 16t by default
const radioZone2 = document.querySelector('#zone2');

radioZone1.addEventListener('change', function() {
  if (this.checked) {
    console.log('radioZone1 is selected');
    quoteInfo.zone = "Mono";
    quoteInfo.truckType = quoteInfo.tons + quoteInfo.type + quoteInfo.zone;
    // Perform additional actions when 16T is selected
  }
  clickToGetPrice();
});
radioZone2.addEventListener('change', function() {
  if (this.checked) {
    console.log('radioZone2 is selected');
    quoteInfo.zone = "Bi";
    quoteInfo.truckType = quoteInfo.tons + quoteInfo.type + quoteInfo.zone;
    // Perform additional actions when 16T is selected
  }
  clickToGetPrice();
});



const checkboxRefrigerated = document.querySelector('#refrigerated');
checkboxRefrigerated.addEventListener('change', function() {
  if (this.checked) {
    console.log('The checkboxRefrigerated is toggled on');
    // Perform additional actions when the checkbox is toggled on
    $(".ambient-vz, .img-ambient").hide();
    $(".refrigerated-vz, .img-refrigerated, .zoneblock").show();
    quoteInfo.type = "Refri";
    quoteInfo.zone = "Mono";
    quoteInfo.truckType = quoteInfo.tons + quoteInfo.type + quoteInfo.zone;
  } else {
    console.log('The checkboxRefrigerated is toggled off');
    // Perform additional actions when the checkbox is toggled off
    $(".ambient-vz, .img-ambient").show();
    $(".refrigerated-vz, .img-refrigerated, .zoneblock").hide();
    quoteInfo.type = "Ambient";
    quoteInfo.zone = "";
    quoteInfo.truckType = quoteInfo.tons + quoteInfo.type + quoteInfo.zone;
  }
  clickToGetPrice();
});


const radio16T = document.querySelector('#tons16');
radio16T.click(); //select 16t by default
const radio18T = document.querySelector('#tons18');

radio16T.addEventListener('change', function() {
  if (this.checked) {
    console.log('16T is selected');
    quoteInfo.tons = "16t";
    quoteInfo.truckType = quoteInfo.tons + quoteInfo.type + quoteInfo.zone;
    // Perform additional actions when 16T is selected
  }
  clickToGetPrice();
});

radio18T.addEventListener('change', function() {
  if (this.checked) {
    console.log('18T is selected');
    quoteInfo.tons = "18t";
    quoteInfo.truckType = quoteInfo.tons + quoteInfo.type + quoteInfo.zone;
    // Perform additional actions when 18T is selected
  }
  clickToGetPrice();
});



const trucksAmount = document.querySelector('#trucksamount');
$("#trucksamount").val(1);

trucksAmount.addEventListener('input', function() {
  const value = parseFloat(this.value);
  quoteInfo.truckAmount = value;
  $("[data-var=truckamount]").text(value);
  // Perform additional actions with the updated value
  clickToGetPrice();
});

const selectDeductible_MTPL = document.querySelector('#deductible_MTPL');
selectDeductible_MTPL.addEventListener('change', function() {
  const selectedValue = this.value;
  quoteInfo.deductible_MTPL = selectedValue;
  clickToGetPrice();
});


const selectDeductible_PartialCasco = document.querySelector('#deductible_PartialCasco');
selectDeductible_PartialCasco.addEventListener('change', function() {
  const selectedValue = this.value;
  quoteInfo.deductible_PartialCasco = selectedValue;
  clickToGetPrice();
});


const selectDeductible_CollisionCasco = document.querySelector('#deductible_CollisionCasco');
selectDeductible_CollisionCasco.addEventListener('change', function() {
  const selectedValue = this.value;
  quoteInfo.deductible_CollisionCasco = selectedValue;
  clickToGetPrice();
});

function actionOnErrors (errorsTriggered){
  $.each(errorsTriggered, function(index, error) {
    switch (error) {
      case "dangerousGoodsTrucksCantBeInsured":
        alert("We can't insure dangerous good trucks.");
        break;
      case "truckPriceTooLow":
        alert("Truck price is too low.");
        break;
      case "truckPriceTooHigh":
        alert("Truck price is too high.");
        break;
      default:
        alert("Unknown error: " + error);
    }
  });
}

function openSaveQuoteModal(quoteId, pack){
  console.log(quoteId, pack);
  var modal = '<section style="display: flex;" class="modal"><div data-w-id="395cefe5-e9fb-3b6d-d18c-16158910455b" class="div-block-320"></div><div style="transform: translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg); filter: blur(0px); transform-style: preserve-3d;" class="w-layout-blockcontainer address-modal w-container">';
  modal = modal + '<h4 class="h4-modal">You have selected the #### plan</h4>';
  modal = modal + '<h2 class="h2-second">Get master policy sent to you</h2>';
  modal = modal + '<div class="w-form"><form id="getquote" class="flex-v for-modal">';
    modal = modal + '<div class="flex-h"><div class="rightaligned">VAT</div><input type="text" class="input nomarginbottom w-input" maxlength="256" name="field-3" placeholder="" id="getquote-vat" required=""></div>';
    modal = modal + '<div class="flex-h"><div class="rightaligned">Email</div><input type="email" class="input nomarginbottom w-input" maxlength="256" name="field-3" placeholder="" id="getquote-email" required=""></div>';
    modal = modal + '<div class="flex-h"><div class="rightaligned">Phone</div><input type="tel" class="input nomarginbottom w-input" maxlength="256" name="field-3" placeholder="" id="getquote-tel" required=""></div>';
    modal = modal + '<div class="flex-h"><div class="rightaligned">Address</div><input type="text" class="input nomarginbottom w-input" maxlength="256" name="field-3" placeholder="" id="getquote-address" required=""></div>';
    modal = modal + '<div class="flex-h"><div class="rightaligned">Company name</div><input type="text" class="input nomarginbottom w-input" maxlength="256" name="field-3" placeholder="" id="getquote-company" required=""></div>';
    modal = modal + '<input type="text" id="quoteId" value="'+quoteId+'" style="display:none">'
    modal = modal + '<input type="text" id="pack" value="'+pack+'" style="display:none">'
    modal = modal + '<input type="submit" value="Submit" class="button-primary-2 grey center w-button"></form>';
  modal = modal + '</div>';
  modal = modal + '<div class="div-close">';
  modal = modal + '<img src="https://assets.website-files.com/644911ac1572f72efba69772/644922a7462df727411a64b5_cross.svg" loading="lazy" alt="" class="close-icon"><div>Close</div></div></div></section>';

  $("body").append(modal);
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
        "pack": payload.pack
    }),
};

$.ajax(settings).done(function(response) {
        console.log(response);
}