

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
