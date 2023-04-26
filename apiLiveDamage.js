/* OLD CODE
const apiDamage = "https://script.google.com/macros/s/AKfycbzzVrd1MmC3pHOWZJ7RIEBbTwtxs-8XYN23E16oQ7yix0bLlR1mxSAt3JkEoNvnkwzq/exec";

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

$.ajax(settings).done(function(response) {
	console.log(response.total);
	var total = response.total;
	total = total.toLocaleString();
	console.log(total);
	$("[data-var='live-damage']").text(total);
})



function animateLoading() {
  dots++;
  if (dots > 3) dots = 0;

  const dotsString = '.'.repeat(dots);
  $("[data-var='live-damage']").innerHTML = `${dotsString}`;
}
*/

const apiDamage = "https://script.google.com/macros/s/AKfycbzzVrd1MmC3pHOWZJ7RIEBbTwtxs-8XYN23E16oQ7yix0bLlR1mxSAt3JkEoNvnkwzq/exec";

const tradSocialProof = {
	"fr": " clients de Qover ont choisi d'assurer leur vélo contre les accidents.",
	"nl": " klanten van Qover hebben ervoor gekozen hun fiets te verzekeren tegen ongevallen.",
	"de": " clients de Qover ont choisi d'assurer leur vélo contre les accidents.",
	"en": " clients de Qover ont choisi d'assurer leur vélo contre les accidents."
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
var text = "";
var dotCount = 0;

// Create interval to add dots
var loadingInterval = setInterval(function() {
  // Add a dot
  text += ".";
  dotCount++;

  // If there are more than three dots, reset the counter
  if (dotCount > 3) {
    text = "Loading";
    dotCount = 0;
  }

  // Update the text
  $("[data-var='live-damage']").text(text);
}, 500);

$.ajax(settings).done(function(response) {
	// Clear the loading interval
	clearInterval(loadingInterval);

	// Get the total and format it
	var total = response.total;
	total = total.toLocaleString();

	// Update the element text
	$("[data-var='live-damage']").html('<b>> '+total+'</b>' + tradSocialProof[lang]);
});

