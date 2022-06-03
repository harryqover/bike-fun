
var qoverfor = getCookie("qoverfor");
if(qoverfor != "business"){
  var fancyboxCode = '<script async="" src="https://storage.googleapis.com/qover-assets/scripts/fancybox.js"></script><link rel="stylesheet" type="text/css" href="https://storage.googleapis.com/qover-assets/scripts/fancybox.css">'
$('head').append(fancyboxCode);

function showModal(){
var htmlToShow = "";
htmlToShow = htmlToShow + '<h4 class="new-h4_center dark no-margin-t">Welcome!</h4><h4 class="new-h4_center dark no-margin-t light">Are you a business or individual?</h4><div class="div-block-204"><a data-w-id="1f67638b-ae22-1537-dc86-b9c08705b53c" class="new-cta centered full-width w-button" onclick="forBusiness();"><span class="font-awesome white"></span>Business</a><a href="/individuals" data-w-id="dd0217c7-c223-81c4-68e6-d5f37fdd6605" class="new-cta centered individuals full-width w-button"><span class="font-awesome white"></span>Individual</a></div>';
  htmlToShow = htmlToShow + "<style>.new-h4_center{max-width:900px;margin:20px auto 10px;font-family:'Circularstd book',sans-serif;color:#fff;font-size:26px;line-height:38px;text-align:center}.new-h4_center.dark{margin-bottom:10px;font-family:Circularstd,sans-serif;color:#171c34;font-weight:700}.new-h4_center.dark.book{margin-bottom:0;font-weight:400}.new-h4_center.dark.no-margin-t{margin-top:0;margin-bottom:0}.new-h4_center.dark.no-margin-t.light{margin-top:10px;font-family:'Circularstd book',sans-serif;font-weight:400}.new-h4_center.margin-b_40{margin-bottom:40px}.new-h4_center.margin-b_40.dark{font-weight:400}.new-h4_center.dark.no-margin-t.light{margin-top:10px}.new-h4_center.margin-b_40.dark{margin-top:80px;font-size:21px}.new-h4_center{font-size:18px;line-height:24px}.new-h4_center.dark.no-margin-t.light{margin-top:10px}.new-h4_center.margin-b_40.dark{margin-top:50px;margin-bottom:20px}.new-h4_center{margin-top:20px;margin-bottom:5px;padding-right:0;padding-left:0;font-size:18px;line-height:24px}.new-h4_center.dark.book{margin-bottom:10px}.new-h4_center.dark.margin-b_40{margin-top:40px}.new-h4_center.dark.no-margin-t.light{margin-top:10px}.new-h4_center.margin-b_40.dark{margin-bottom:10px}.fancybox__content{border-radius:5px}</style>";
//htmlToShow = htmlToShow + "<a onclick='forBusiness();'>Business</a>";
//htmlToShow = htmlToShow + "<a href='/individuals'>Customer</a>";

Fancybox.show([
  {
    src: htmlToShow,
    type: "html",
  },
]);
}
function forBusiness(){
  document.cookie = "qoverfor=business; domain=qover.com; path=/";
  document.cookie = "qoverfor=business; path=/";
  Fancybox.close();
}
setTimeout(function(){
showModal()
},1000);
  
}
