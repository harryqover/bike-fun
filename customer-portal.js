const cowboyIds = ["60a75f9f987d3f484ed24ef4", "607937e4654780240a132641", "60938efba79100e71519a03b", "5ff6cf4fceba6039aadb446f", "61b1c260415df342d60f4e10", "61b1b145415df342d60f4e0f", "61b1d0a02656f6227dc3476f", "61b8a43042cef3c0bc2cc26d", "61b8a49f11e584fcae0ee070", "61b8a45842cef3c0bc2cc26e", "61b8a4c211e584fcae0ee071", "61b8a4e807007c0a5b94d673", "61b8a51111e584fcae0ee072", "61b8a52111e584fcae0ee073"];
const cowboyAlteosIds = ["5ff6cf4fceba6039aadb446f", "60938efba79100e71519a03b", "607937e4654780240a132641", "61b1b145415df342d60f4e0f", "61b1c260415df342d60f4e10", "60a75f9f987d3f484ed24ef4"]

const variants = {
  "VARIANT_THEFT_DAMAGE_ASSISTANCE":"Omnium",
  "VARIANT_THEFT_ASSISTANCE":"Theft & Assistance",
  "VARIANT_ASSISTANCE":"Assistance 24/7"
}

$(".loading").hide();
$("#connected").hide();
$("#disconnected").show();

var login = getCookie("login");
var cigarId = getCookie("cigarId");

if(login && cigarId){
  goLogin(cigarId, login);
}

setTimeout(function(){
  $("#email").val(getParameterByName("email"));
  $("#cigardid").val(getParameterByName("contract"));
  
  //getTranslation();

 },2500);

function clickToLogin(){
  var cigarId = $('input[name="name"]').val();
  var email = $('input[name="email"]').val();
  goLogin(cigarId, email);
}

function goLogin(cigarId, email) {
    $(".loading").show();
    $("#connected").hide();
    $("#disconnected").hide();

    var data = JSON.stringify({
        "cigarId": cigarId,
        "email": email
    });
    var partnerMapping = {
        "5e58cf936ad8cf0e9dc678a6": "unknown",
    };

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function() {
        if (this.readyState === 4 && this.status === 200) {

            var timeToAdd = 1000 * 60 * 60 * 24 * 1 * 1 * 1;
            var date = new Date();
            var expiryTime = parseInt(date.getTime()) + timeToAdd;
            date.setTime(expiryTime);
            var utcTime = date.toUTCString();
            document.cookie = "login="+email+"; expires=" + utcTime + ";";
            document.cookie = "cigarId="+cigarId+"; expires=" + utcTime + ";";

            var obj = JSON.parse(this.responseText);
            var partnerId = obj.partnerId;
            var variant = obj.variant;
            var country = obj.country;
            var start = new Date(obj.startDate);
            var end = new Date(obj.endDate);
            console.log(obj);
            console.log(partnerMapping[partnerId]);

            var isCowboy = cowboyIds.includes(partnerId);
            var isCowboyAlteosId = cowboyAlteosIds.includes(partnerId);

            var claims_handler = "to be verified";

            if (isCowboyAlteosId === true && country == "DE") {
                claims_handler = "Alteos";
            } else if (country == "DE" || country == "FR" || country == "NL" || country == "BE" || country == "NO" || country == "SE" || country == "DK" || country == "FI" || country == "AT") {
                claims_handler = "Van Ameyde";
            } else if (country == "ES" || country == "IT" || country == "PT" || country == "IE" || country == "PL") {
                claims_handler = "Qover";
            } else if (country == "GB") {
                claims_handler = "Qover";
            }

            $("[data-var='product']").text(variants[obj.variant]);
            $("[data-var='cigarid']").text(cigarId);
            $("[data-var='start']").text(start.toLocaleDateString());
            $("[data-var='end']").text(end.toLocaleDateString());
            $("[data-var='theftdeductible']").text(obj.theftDeductible);
            $("[data-var='materialdeductible']").text(obj.damageDeductible);

            $("[data-var='cancel']").attr("href","https://form.jotform.com/222763047790359?lang=en&contractid="+cigarId+"&email="+email);
            $("[data-var='documentupload']").attr("href","https://form.jotform.com/223391631989063?email="+email+"&contractReference="+cigarId+"&language=en");
            $("[data-var='claims']").attr("href","https://www.qover.com/claims?lang=en&contract="+cigarId+"&email="+email);

            var responseTest = {"country":"BE","depreciation":false,"damageDeductible":"DAMAGE_DEDUCTIBLE_ENGLISH_10PC","endDate":"2023-08-07T21:59:59.999Z","originalValue":115200,"partnerId":"5e7a295467920985a134f426","startDate":"2022-08-07T22:00:00.000Z","status":"STATUS_OPEN","theftDeductible":"THEFT_DEDUCTIBLE_STANDARD_10PC","variant":"VARIANT_THEFT_DAMAGE_ASSISTANCE"};

            /* YOU ARE LOGGED IN*/
            $("#connected").show();
            $("#disconnected").hide();
            $(".loading").hide();


        } else if (this.readyState === 4 && this.status === 400) {
            $("#connected").hide();
            $("#disconnected").show();
            $(".loading").hide();
            console.log(this.status);
            var obj = JSON.parse(this.responseText);
            alert(obj.message);
        }
    });

    xhr.open("POST", "https://api.prd.qover.io/bike/v1/contracts/claim-info?apikey=pk_C0132D71B8C4C4E55690");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(data);
}