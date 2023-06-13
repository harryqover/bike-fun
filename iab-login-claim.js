console.warn("v20230515 1246");

const isValidCigar = (str) => /^[A-Za-z]{2}20\d{9}$/.test(str);
const isValidEmail = (str) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);

const baseUrlClaim = {
    "MAKE_TESLA": "https://insuremytesla.qover.com/claims",
    "MAKE_NIO": "https://form.jotform.com/230372864555663",
    "MAKE_FISKER": "https://form.jotform.com/230644976859373", 
    "MAKE_LUCID": "https://form.jotform.com/223494218513354", 
}



function loadAtStart(){
	$(".loading").show();
    translateAll();
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
        $("#disconnected").hide();
	}
}

function clickToLogin() {
    $("#disconnected").hide();
    $(".loading").show();
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
            $("#disconnected").show();
            $(".loading").hide();
   		 }
    } else {
    	//not valid cigar id
        $("#disconnected").show();
        $(".loading").hide();
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
            alert("Make sure you connect with the email and contract reference from your contract");
        } else {
        	var lang = response.payload.language;
        	var registrationPlate = response.payload.risk.registrationPlate;
        	var brand = response.payload.risk.make;
            var country = cigarId.substring(0, 2);
            if(lang = "de"||lang = "pt"){
                lang = "de-"+country;
            }
        	window.location.href = baseUrlClaim[brand]+"?language="+lang+"&claimant_email="+email+"&policy_reference="+cigarId+"&vehicle_plate_number="+registrationPlate+"&ref_country="+country;
        }
        $(".loading").hide();
        $("#disconnected").show();
    })
}

function translateAll() {
    var lang = $('#langinput').find(":selected").val();
    let xhrLocales = new XMLHttpRequest();
    var content = "";
    xhrLocales.open("get", "https://api.prd.qover.io/i18n/v1/projects/webflow-customer-portal/" + lang + ".json?refresh=007", true);
    xhrLocales.setRequestHeader("Cache-Control", "max-age=3600");

    xhrLocales.onreadystatechange = function() {
        if (xhrLocales.readyState == 4) {
            if (xhrLocales.status >= 200 && xhrLocales.status < 300 || xhrLocales.status == 304) {
                content = JSON.parse(xhrLocales.responseText);
                window.translations = content;
                console.log(window.translations);
                //translate all data attributes that contains data-translation
                $("[data-translation]").each(function(index) {
                    $(this).html(content[$(this).data("translation")]);
                    var text = $(this).html();
                });
            }
        }
    };
    xhrLocales.send();
}

loadAtStart();