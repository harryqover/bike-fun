console.log("up2")
function getGiftCard(email) {
    if (!email) {
        var email = $("#email").val();
    }
    $(".modal-gift-card > div > p").text("Loading....")

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

    $.ajax(settings)
        .done(function(response) {
            console.log(response);
            $(".modal-gift-card > div > p").text("✅ Check your mailbox to get the code!");

            // Hide the modal after 10 seconds
            setTimeout(function() {
                $(".modal-gift-card").hide();
            }, 10000);
        })
        .fail(function(error) {
            console.error("Error:", error);
            $(".modal-gift-card > div > p").text("An error occurred. Please try again.");
        });
}


