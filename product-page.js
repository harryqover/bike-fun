var hideAcceptanceCriteria = ["IT"];
var hidePricingCriteria = ["IT"];

var country = getParameterByName("country");


if(hideAcceptanceCriteria.includes(country)){
	$('[data-translation="bike.pp.acceptance.criteria.title"]').parent().hide()
}
if(hidePricingCriteria.includes(country)){
	$('[data-translation="bike.pp.pricing.criteria.title"]').parent().hide()
}
