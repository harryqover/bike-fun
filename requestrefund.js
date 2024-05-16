function sendIban(){
	console.log("hello");

	var googleSheetUrl = "https://script.google.com/macros/s/AKfycbxy9Mhdj_sXeOHse9SWTKOHSO1KYxQOYeFND9m9QC_hl0zTcK6oelysAdlg0QZxBWY3ZQ/exec";
	var settings = {
        "url": googleSheetUrl,
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "text/plain;charset=utf-8"
        },
        "data": JSON.stringify({
		    "email": "harry@qover.com",
		    "contract": "BE1012345678",
		    "iban": "BE79750665443933",
		    "bic": "BEBRU",
		    "ip": "123456.23456.98765.876"
		}),
    };

    $.ajax(settings).done(function(response) {
        console.log(response);
    });

}

/*
curl --location 'https://script.google.com/macros/s/AKfycbxy9Mhdj_sXeOHse9SWTKOHSO1KYxQOYeFND9m9QC_hl0zTcK6oelysAdlg0QZxBWY3ZQ/exec' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "harry@qover.com",
    "contract": "BE1012345678",
    "iban": "BE79750665443933",
    "bic": "BEBRU",
    "ip": "123456.23456.98765.876"
}'
*/