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
	$("[data-var='liveDamage']").text(response.total);
})