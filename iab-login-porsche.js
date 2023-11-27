console.warn("v20230515 1246");

const isValidCigar = (str) => /^[A-Za-z]{2}20\d{9}$/.test(str);
const isValidEmail = (str) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);

function clickToLogin() {
    var cigarId = $('input[name="name"]').val();
    var email = $('input[name="email"]').val();
    if (isValidCigar(cigarId)){
    	//valid cigar id
    	if (isValidEmail(email)){
    		//valid email
    		getNinjaData(cigarId, email);
    	} else {
    		//not valid email
    		alert("Email format is not valid");
   		 }
    } else {
    	//not valid cigar id
    	alert("Contract reference is not valid");
    }
}


function getNinjaData(cigarId, email) {
    var googleSheetUrl = "https://script.google.com/macros/s/AKfycbxw_NiE8wEmOykXDcnaM6vzVfS6bYdv-Ne6bQmo-IBi0IvlKpSUW-6IAVxq5AwqrGasoQ/exec";
    var settings = {
        "url": googleSheetUrl,
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "text/plain;charset=utf-8"
        },
        "data": JSON.stringify({
            "cigarId": cigarId,
            "email": email,
            "action": "getContractData"
        }),
    };

    $.ajax(settings).done(function(response) {
    	console.log(response);
        window.payloadFromNinja = response;
        if(response.payload == "error"){
            console.warn("error while trying to connect");
        } else {
        	window.location.href = "https://insuremytesla.qover.com/claims?language=fr";
        }
    }
}