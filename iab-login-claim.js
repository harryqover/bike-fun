console.warn("v20230515 1246");

const isValidCigar = (str) => /^[A-Za-z]{2}20\d{9}$/.test(str);
const isValidEmail = (str) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);

const baseUrlClaim = {
    "MAKE_TESLA": "https://insuremytesla.qover.com/claims",
    "MAKE_NIO": "https://form.jotform.com/230372864555663",
    "MAKE_FISKER": "https://form.jotform.com/230644976859373", 
    "MAKE_LUCID": "https://form.jotform.com/223494218513354", 
}

$("#disconnected").hide();
$(".loading").hide();

function loadAtStart(){
	$(".loading").show();
    var contract = getParameterByName("policy_reference");
	if(contract == ""){
		//show login
        $("#disconnected").show();
		$(".loading").hide();
        $("#claimform").hide();
	} else {
		//show claim form
        $("#claimform").show();
		$(".loading").hide();
	}
}

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
	$(".loading").show();
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
        	var lang = response.payload.language;
        	var vin = response.payload.risk.vin;
        	var brand = response.payload.risk.make;
            var country = cigarId.substring(0, 2);
        	window.location.href = baseUrlClaim[brand]+"?language="+lang+"&claimant_email="+email+"&policy_reference="+cigarId+"&vehicle_plate_number="+vin+"&ref_country="+country;
        }
        $(".loading").hide();
    })
}

/*
TO INCLUDE IN FORM REDIRECT

claimant_email
policy_reference
vehicle_plate_number
ref_country
*/