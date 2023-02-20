$(".assistance").hide();
$("[data-phone='qover-text']").hide();
$("[data-phone='qover-link']").hide();
console.log("hello 1046");

var country = getParameterByName("country");
var contract = getParameterByName("contract");
var lang = getParameterByName("lang");

var assistancePhone = {
	"BE" : "+32 2 541 92 01",
	"FR" : "+33 9 78 46 61 24",
	"DE" : "+49 800 589 39 21",
	"NL" : "020 532 07 06"
};

var qoverPhone = {
	"BE" : "+32 2 588 25 50",
	"FR" : "+33 9 71 07 28 38",
	"DE" : "+49 800 000 97 29",
	"NL" : "020 532 07 05",
	"ES" : "+34 900 861 622",
	"IT" : "+39 800 693 271",
	"PT" : "+351 800 181 009",
	"GB" : "+44 800 048 8899",
	"DK" : "xxx",
	"NO" : "xxx",
	"SE" : "xxx",
	"FI" : "xxx",
	"AT" : "xxx",
	"PL" : "xxx",
	"IE" : "xxx"
};

$("[data-phone='qover-text']").text(qoverPhone[country]);
$("[data-phone='qover-link']").attr("href", "tel:"+qoverPhone[country]);
$("[data-phone='qover-text']").show();
$("[data-phone='qover-link']").show();

if(contract){
	$("[data-link='claim']").attr("href", "https://www.qover.com/claims?contract="+contract);	
}

if(assistancePhone[country] == undefined){
	$(".assistance").hide();
} else {
	$("[data-phone='assistance-text']").text(assistancePhone[country]);
	$("[data-phone='assistance-link']").attr("href", "tel:"+assistancePhone[country]);
	$(".assistance").show();
}

if(lang !== undefined){
	translateAll();
}



function translateAll(){
  let xhrLocales = new XMLHttpRequest();
  var content = "";
  //xhrLocales.open("get", "https://translations.qover.com/widget/" + lang + "-raw.json?refresh=007", true);
  xhrLocales.open("get", "https://api.prd.qover.io/i18n/v1/projects/widget/" + lang + ".json?refresh=007", true);
  xhrLocales.setRequestHeader("Cache-Control", "max-age=3600");

  xhrLocales.onreadystatechange = function() {
    if (xhrLocales.readyState == 4) {
      if (xhrLocales.status >= 200 && xhrLocales.status < 300 || xhrLocales.status == 304) {
        content = JSON.parse(xhrLocales.responseText);
        $( "[data-translation]" ).each(function( index ) {
          $( this ).html(content[$( this ).data( "translation" )]);
          var text = $( this ).html();
        });
      }
    }
  };
  xhrLocales.send();
}