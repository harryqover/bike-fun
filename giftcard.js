function getGiftCard(email) {
    var settings = {
        "url": "https://script.google.com/macros/s/AKfycbzAbLdRcpW6ZQFYJFpU-SEM6OiO_oT0GSiNjCrNKrZQObtfnMJYR8REBA_2uQv89zYY/exec",
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "text/plain;charset=utf-8"
        },
        "data": JSON.stringify({
            "email": email
        }),
    };

    $.ajax(settings).done(function(response) {
        console.log(response);
        $(".modal-gift-card").hide();
     });
}