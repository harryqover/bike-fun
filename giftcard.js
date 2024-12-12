console.log("up")
function getGiftCard(email) {
    if (!email) {
        var email = $("#email").val();
    }

    // Show the loading message
    $(".modal-gift-card .loading-message").show();
    $(".modal-gift-card .success-message").hide();

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

            // Hide the loading message
            $(".modal-gift-card .loading-message").hide();

            // Show the success message
            $(".modal-gift-card .success-message").text("Check your mailbox to get the code!").show();

            // Hide the modal after 10 seconds
            setTimeout(function() {
                $(".modal-gift-card").hide();
            }, 10000);
        })
        .fail(function(error) {
            console.error("Error:", error);

            // Hide the loading message and show an error message
            $(".modal-gift-card .loading-message").hide();
            $(".modal-gift-card .success-message").text("An error occurred. Please try again.").show();
        });
}

// HTML Example for modal content
const modalHTML = `
<div class="modal-gift-card">
    <div class="loading-message" style="display: none;">Loading...</div>
    <div class="success-message" style="display: none;"></div>
</div>`;

document.body.insertAdjacentHTML('beforeend', modalHTML);
