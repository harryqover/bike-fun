console.log("up3");
/*
document.querySelectorAll("body > section.promo").forEach(element => {
    element.style.display = "none";
});
*/

function getGiftCard(email) {
    if (!email) {
        var email = $("#email").val();
    }
    $(".modal-gift-card > div > p").text("⏳ Please hold on, we are creating your gift card...");
    $("#email").hide();
    $("#submitgift").hide();

    var settings = {
        "url": "https://script.google.com/macros/s/AKfycbyRx9n9A8wunSh2a7lAZ4xy7vThiaSf7of_ES36qTW2jVCL_U_WJc-qJLtN8qph0jM/exec",
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
            $(".modal-gift-card > div > p").text("✅ Success! Check your mailbox to find your gift card code.");

            // Hide the modal after 10 seconds
            setTimeout(function() {
                $(".modal-gift-card").hide();
            }, 10000);
        })
        .fail(function(error) {
            console.error("Error:", error);
            $(".modal-gift-card > div > p").text("❌ Oops! Something went wrong. Please try again later.");
        });
}


