console.log("hello");
var lang = getParameterByName("lang");


if(lang !== undefined){
	translateAll();
}

function translateAll(){
  let xhrLocales = new XMLHttpRequest();
  var content = "";
  xhrLocales.open("get", "https://translations.qover.com/widget/" + lang + "-raw.json?refresh=007", true);
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