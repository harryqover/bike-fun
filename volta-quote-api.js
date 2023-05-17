function getPrice() {
    var googleSheetUrl = "https://script.google.com/macros/s/AKfycbxd7iLSKEWjn4Kjsh6SR4zVDZCz2HxnAXA1OHG_7pzBrE0VLi5ze-9DOV1Y7tpyr13d6Q/exec";

    var settings = {
        "url": googleSheetUrl,
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "text/plain;charset=utf-8"
        },
        "data": JSON.stringify({
            "truckAmount": 1,
            "truckType": "18tRefriBi",
            "dangerousGoodsTrucks": true,
            "leasedTrucks": true,
            "deductible_MTPL": "2000EUR",
            "deductible_PartialCasco": "2000EUR",
            "deductible_CollisionCasco": "2000EUR",
        }),
    };

    $.ajax(settings).done(function(response) {
            console.log(response);
            window.payloadFromNinja = response;


        }
    }