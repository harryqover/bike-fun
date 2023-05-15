console.warn("v20230515 1246");

const isValidCigar = (str) => /^[A-Za-z]{2}20\d{9}$/.test(str);
const isValidEmail = (str) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);

function clickToLogin() {
    var cigarId = $('input[name="name"]').val();
    var email = $('input[name="email"]').val();
    if (isValidCigar(cigarId)){
    	//valid cigar id
    	if (isValidEmail(email)){
    		//valid email
    		goLogin(cigarId, email);
    	} else {
    		//not valid email
    		alert("Email format is not valid");
   		 }
    } else {
    	//not valid cigar id
    	alert("Contract reference is not valid");
    }
}