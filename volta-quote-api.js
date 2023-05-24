$(".ambient-vz, .img-ambient").show();
$(".refrigerated-vz, .img-refrigerated").hide();

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

function clickToGetPrice(){
	/*var truckAmount = 1;
	var truckType = "18tRefriBi";
	var dangerousGoodsTrucks = true;
	var leasedTrucks = true;
	var deductible_MTPL = "2000EUR";
	var deductible_PartialCasco = "2000EUR";
	var deductible_CollisionCasco = "2000EUR";*/
    console.log(quoteInfo);
	getPrice(quoteInfo.truckAmount, quoteInfo.truckType, quoteInfo.dangerousGoodsTrucks, quoteInfo.leasedTrucks, quoteInfo.deductible_MTPL, quoteInfo.deductible_PartialCasco, quoteInfo.deductible_CollisionCasco);
}


function getPrice(truckAmount, truckType, dangerousGoodsTrucks, leasedTrucks, deductible_MTPL, deductible_PartialCasco, deductible_CollisionCasco) {
    var googleSheetUrl = "https://script.google.com/macros/s/AKfycbxd7iLSKEWjn4Kjsh6SR4zVDZCz2HxnAXA1OHG_7pzBrE0VLi5ze-9DOV1Y7tpyr13d6Q/exec";
    //$(".amount").text("loading prices");
    var loadingPricesDiv = '<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>';
    loadingPricesDiv = loadingPricesDiv + '<style>.lds-ellipsis {display: inline-block;position: relative;width: 80px;height: 80px;}.lds-ellipsis div {position: absolute;top: 33px;width: 13px;height: 13px;border-radius: 50%;background: #000;animation-timing-function: cubic-bezier(0, 1, 1, 0);}.lds-ellipsis div:nth-child(1) {left: 8px;animation: lds-ellipsis1 0.6s infinite;}.lds-ellipsis div:nth-child(2) {left: 8px;animation: lds-ellipsis2 0.6s infinite;}.lds-ellipsis div:nth-child(3) {left: 32px;animation: lds-ellipsis2 0.6s infinite;}.lds-ellipsis div:nth-child(4) {left: 56px;animation: lds-ellipsis3 0.6s infinite;}@keyframes lds-ellipsis1 {0% {transform: scale(0);}100% {transform: scale(1);}}@keyframes lds-ellipsis3 {0% {transform: scale(1);}100% {transform: scale(0);}}@keyframes lds-ellipsis2 {0% {transform: translate(0, 0);}100% {transform: translate(24px, 0);}}</style>'
    $(".amount").html(loadingPricesDiv);
    var settings = {
        "url": googleSheetUrl,
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "text/plain;charset=utf-8"
        },
        "data": JSON.stringify({
            "truckAmount": truckAmount,
            "truckType": truckType,
            "dangerousGoodsTrucks": dangerousGoodsTrucks,
            "leasedTrucks": leasedTrucks,
            "deductible_MTPL": deductible_MTPL,
            "deductible_PartialCasco": deductible_PartialCasco,
            "deductible_CollisionCasco": deductible_CollisionCasco,
        }),
    };

    $.ajax(settings).done(function(response) {
            console.log(response);
            window.payloadFromNinja = response;
            var formattedTotalPrice = response.response.total.toLocaleString("en-BE", {style: "currency", currency: "EUR"});
            $(".amount").text(formattedTotalPrice);
            //$("#form-quote > div.flex-v-25.margin-bottom-60 > div.price > div:nth-child(2)").text(formattedTotalPrice);
        }
    )
}
clickToGetPrice();



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