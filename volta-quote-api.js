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
        }
    )
}
getPrice(1, "18tRefriBi", true, true, "2000EUR", "2000EUR", "2000EUR");