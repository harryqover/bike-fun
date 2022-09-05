/* INSERT THIS ELEMENT ON YOUR PAGE WHERE YOU WANT THE TEXT TO BE DISPLAYED


<div id="qover" data-lang="fr" data-type="usp" data-key="pk_29D66CCD9AE08A1B59C9"></div>

type => productPage / contact / usp
x

*/
console.log("helloHarry 20220905 1020");

var qoverEl = document.getElementById("qover");

var lang = ((qoverEl.getAttribute('data-lang') == "") ? window.lang : qoverEl.getAttribute('data-lang'));

var key = qoverEl.getAttribute('data-key');
var type = qoverEl.getAttribute('data-type');
var country = qoverEl.getAttribute('data-country');
var countryDefault = qoverEl.getAttribute('data-countryDefault');

var typeInfo = {
	"contact" : {
		"url" : "https://bike.qover.com/assistance-qover",
		"txtCta" : {
			"fr" : "Contacter Qover",
			"en" : "Contact Qover",
			"nl" : "Contact opnemen met Qover",
			"de" : "Kontakt zu Qover",
			"it" : "Contact Qover",
			"es" : "Contact Qover",
			"pt" : "Contact Qover",
			"fi" : "Contact Qover",
			"da" : "Contact Qover",
			"se" : "Contact Qover",
			"no" : "Contact Qover"
		}
	},
	"productPage" : {
		"url" : "https://bike.qover.com/widget/product-page",
		"txtCta" : {
			"fr" : "En savoir plus sur l'assurance Qover",
			"en" : "Learn more about Qover insurance.",
			"nl" : "Meer informatie over Qover fietsverzekeringen.",
			"de" : "Weitere Informationen über die Qover Fahrradversicherung.",
			"it" : "Learn more about Qover insurance.",
			"es" : "Learn more about Qover insurance.",
			"pt" : "Learn more about Qover insurance.",
			"fi" : "Learn more about Qover insurance.",
			"da" : "Learn more about Qover insurance.",
			"se" : "Learn more about Qover insurance.",
			"no" : "Learn more about Qover insurance."
		}
	},
	"usp" : {
		"url" : "https://bike.qover.com/widget/usp",
		"txtCta" : {
			"fr" : "En savoir plus sur l'assurance Qover",
			"en" : "Learn more about Qover insurance.",
			"nl" : "Meer informatie over Qover fietsverzekeringen..",
			"de" : "Weitere Informationen über die Qover Fahrradversicherung.",
			"it" : "Learn more about Qover insurance.",
			"es" : "Learn more about Qover insurance.",
			"pt" : "Learn more about Qover insurance.",
			"fi" : "Learn more about Qover insurance.",
			"da" : "Learn more about Qover insurance.",
			"se" : "Learn more about Qover insurance.",
			"no" : "Learn more about Qover insurance."
		}
	}
}

function qover(obj){
	console.log(obj.lang);
	console.log(obj);
}

var text = '<a onclick="showModalPopUpQover()" style="text-decoration: underline;">'+typeInfo[type].txtCta[lang]+' <svg class="info-icon" width="13" height="13" viewBox="0 0 13 13" xmlns="http://www.w3.org/2000/svg" fill="#323232" tabindex="0"><g fill="inherit" fill-rule="even-odd"><path d="M6.5.91a5.59 5.59 0 110 11.182A5.59 5.59 0 016.5.91zm0-.91a6.5 6.5 0 100 13 6.5 6.5 0 000-13z"></path><path d="M6.525 3.248c.258.016.514.047.767.092.776.18 1.254.748 1.338 1.52a1.396 1.396 0 01-.561 1.323c-.2.158-.41.302-.61.457a.953.953 0 00-.43.88.551.551 0 01-.395.561.657.657 0 01-.755-.186.55.55 0 01-.095-.28 1.871 1.871 0 01.767-1.626c.225-.175.437-.366.633-.57a.666.666 0 00.156-.391c.02-.389-.252-.629-.675-.64-.512-.014-.937.127-1.222.566a.617.617 0 01-.618.296c-.435-.053-.632-.381-.468-.772.172-.382.48-.694.87-.88a3.277 3.277 0 011.298-.35z"></path><circle cx="6.5" cy="9.4" r="1"></circle></g></svg></a>';

var urlIframe = typeInfo[type].url+'?lang='+lang;
urlIframe = ((key == "") ? urlIframe : urlIframe + "key="+key);
urlIframe = ((type == "") ? urlIframe : urlIframe + "type="+type);
urlIframe = ((countryDefault == "") ? urlIframe : urlIframe + "countryDefault="+countryDefault);
urlIframe = ((country == "") ? urlIframe : urlIframe + "country="+country);

var modal = '<div id="modal-form" class="modal-issue"><div class="modal-content"><div class="modal-header"><span onclick="closeModal()" class="close">&times;</span></div><div class="modal-body"><iframe class="airtable-embed" src="'+urlIframe+'" frameborder="0" onmousewheel="" height="650px" style="background: transparent; border-radius: 5px;" width="100%"></iframe></div></div><</div>'
var modalCss = '<style>.modal-issue{display:none;position:fixed;z-index:999;left:0;top:0;width:100%;height:100%;overflow:auto;background-color:rgba(0,0,0,.5)}.close{color:#000;float:right;font-size:50px;font-weight:700}.close:hover,.close:focus{text-decoration:none;cursor:pointer;-webkit-transition:all 200ms ease-in;transition:all 200ms ease-in}.modal-header{padding:2px 16px;color:#fff}.modal-body{padding:2px 16px;max-width:794px}.modal-content{position:relative;background-color:transparent;margin:auto;padding:0;width:50%;-webkit-animation-name:animatetop;-webkit-animation-duration:0.4s;animation-name:animatetop;animation-duration:0.4s}@-webkit-keyframes animatetop{from{top:-300px;opacity:0}to{top:0;opacity:1}}@keyframes animatetop{from{top:-300px;opacity:0}to{top:0;opacity:1}}</style>';
modal = modal+modalCss;


function closeModal(){
	var modal = document.getElementById('modal-form');
	modal.style.display = "none";
}

function modalTest (){
	// Get the modal
	var modal = document.getElementById('modal-form');

	// Get the button that opens the modal
	var btn = document.getElementById("modal-button");

	// Get the <span> element that closes the modal
	var span = document.getElementsByClassName("close")[0];

	// When the user clicks on the button, open the modal 
	btn.onclick = function() {
	    modal.style.display = "block";
	}

	// When the user clicks on <span> (x), close the modal
	span.onclick = function() {
	    modal.style.display = "none";
	}

	// When the user clicks anywhere outside of the modal, close it
	window.onclick = function(event) {
	  if (event.target == modal) {
	     modal.style.display = "none";
	 }
	}
}



if (qoverEl) {
	block_to_insert = document.createElement( 'div' );
	block_to_insert.innerHTML = modal ;
	$("body").append(block_to_insert);

    qoverEl.innerHTML = text;

    function showModalPopUpQover() {
    	var modal = document.getElementById('modal-form');
    	modal.style.display = "block";
    }

    var modal = document.getElementById('modal-form');
    window.onclick = function(event) {
	  if (event.target == modal) {
	     modal.style.display = "none";
	 }
	}


} else {
    console.log("not available")
}