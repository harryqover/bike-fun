console.log("hello");

let country = getParameterByName("country");


let assistancePhone = {
	"BE" : "+32 2 541 92 01",
	"FR" : "+33 9 78 46 61 24",
	"DE" : "+49 800 589 39 21",
	"NL" : "020 532 07 06"
}

let qoverPhone = {
	"BE" : "+32 2 541 92 01",
	"FR" : "+33 9 78 46 61 24",
	"DE" : "+49 800 589 39 21",
	"NL" : "020 532 07 06"
}


$("[data-phone='qover-text']").text(qoverPhone[country]);
$("[data-phone='assistance-text']").text(assistancePhone[country]);
$("[data-phone='qover-link']").attr("href", "tel:"+qoverPhone[country]);
$("[data-phone='assistance-link']").attr("href", "tel:"+assistancePhone[country]);