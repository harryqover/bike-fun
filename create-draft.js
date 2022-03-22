console.log("hello world");
//URL = https://bike-a5adfd.webflow.io/create-draft?coded=a2V5PXh4eCZsYW5nPWZyJmNvdW50cnk9QkU=
var code64 = getParameterByName("coded");
var decoded = atob(code64);
console.log(decoded)

var code64 = getParameterByName("coded");


let data = atob(code64)

let decodedObject = decoded.split("&").reduce(function(obj, str, index) {
  let strParts = str.split("=");
  obj[strParts[0].replace(/\s+/g, '')] = strParts[1];
  return obj;
}, {});

console.log(decodedObject);

$("body > div.lottie-animation-12").hide(750);