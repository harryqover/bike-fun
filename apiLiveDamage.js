const apiDamage = "https://script.google.com/macros/s/AKfycbzzVrd1MmC3pHOWZJ7RIEBbTwtxs-8XYN23E16oQ7yix0bLlR1mxSAt3JkEoNvnkwzq/exec";

const tradSocialProof = {
	"fr": "% des clients de Qover ont choisi d'assurer leur vélo contre la casse.",
	"nl": "% van de Qover-klanten heeft ervoor gekozen hun fiets te verzekeren tegen ongevallen.",
	"de": " % der Qover-Kunden haben sich dafür entschieden, ihre Fahrräder gegen Unfälle zu versichern.",
	"en": "% of Qover customers have chosen to insure their bikes against accidents."
}


var settings = {
	"url": apiDamage,
	"method": "POST",
	"timeout": 0,
	"headers": {
	    "Content-Type": "text/plain;charset=utf-8"
	},
	"data": JSON.stringify({
	    "action": "getLiveDamage"
	}),
};

// Set initial text and dot counter
var textApiLiveDamage = "";
var dotCount = 0;

// Create interval to add dots
var loadingInterval = setInterval(function() {
  // Add a dot
  textApiLiveDamage += ".";
  dotCount++;

  // If there are more than three dots, reset the counter
  if (dotCount > 3) {
    textApiLiveDamage = "Loading";
    dotCount = 0;
  }

  // Update the text
  $("[data-var='live-damage']").text(textApiLiveDamage);
}, 500);

setTimeout(getDamageStat, 1000);

function getDamageStat(){
	$.ajax(settings).done(function(response) {
		// Clear the loading interval
		clearInterval(loadingInterval);

		// Get the total and format it
		var total = response.total;
		//total = total.toLocaleString();
		total = (total * 100).toFixed(1);
		
		// Update the element text
		$("[data-var='live-damage']").html('<b>'+total+'</b>' + tradSocialProof[lang]);
	});
}


