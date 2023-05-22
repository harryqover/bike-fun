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
    "zone" : "Mono"
}

function clickToGetPrice(){
	var truckAmount = 1;
	var truckType = "18tRefriBi";
	var dangerousGoodsTrucks = true;
	var leasedTrucks = true;
	var deductible_MTPL = "2000EUR";
	var deductible_PartialCasco = "2000EUR";
	var deductible_CollisionCasco = "2000EUR";
	getPrice(truckAmount, truckType, dangerousGoodsTrucks, leasedTrucks, deductible_MTPL, deductible_PartialCasco, deductible_CollisionCasco);
}


function getPrice(truckAmount, truckType, dangerousGoodsTrucks, leasedTrucks, deductible_MTPL, deductible_PartialCasco, deductible_CollisionCasco) {
    var googleSheetUrl = "https://script.google.com/macros/s/AKfycbxd7iLSKEWjn4Kjsh6SR4zVDZCz2HxnAXA1OHG_7pzBrE0VLi5ze-9DOV1Y7tpyr13d6Q/exec";

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
            
            $("#form-quote > div.flex-v-25.margin-bottom-60 > div.price > div:nth-child(2)").text(formattedTotalPrice);
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
  console.log(quoteInfo);
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
  console.log(quoteInfo);
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
  console.log(quoteInfo);
});
radioZone2.addEventListener('change', function() {
  if (this.checked) {
    console.log('radioZone2 is selected');
    quoteInfo.zone = "Bi";
    quoteInfo.truckType = quoteInfo.tons + quoteInfo.type + quoteInfo.zone;
    // Perform additional actions when 16T is selected
  }
  console.log(quoteInfo);
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
  console.log(quoteInfo);
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
  console.log(quoteInfo);
});

radio18T.addEventListener('change', function() {
  if (this.checked) {
    console.log('18T is selected');
    quoteInfo.tons = "18t";
    quoteInfo.truckType = quoteInfo.tons + quoteInfo.type + quoteInfo.zone;
    // Perform additional actions when 18T is selected
  }
  console.log(quoteInfo);
});



const trucksAmount = document.querySelector('#trucksamount');

trucksAmount.addEventListener('input', function() {
  const value = this.value;
  quoteInfo.truckAmount = value;
  // Perform additional actions with the updated value
  console.log(quoteInfo);
});