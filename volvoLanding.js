console.warn("1118")
const webhookEmailSignup = "https://script.google.com/macros/s/AKfycbwM6BWIdthN5E-ov5HTjKnIl9m54ns0Y5FJMj0Svv6lKM-JbfyLjeE-W5PoARkt8w4Few/exec";

setTimeout(function() {
	$("#vehicle-details").hide(500);


        let vehicles = [];

        // Load JSON data from GitHub-hosted JSON
        $.getJSON('https://harryqover.github.io/bike-fun/volvo_car_data.json', function(data) {
            vehicles = data;
            console.log('Vehicles data loaded:', vehicles);
            
            // Populate year options based on the vehicles' years
            const years = [...new Set(vehicles.map(vehicle => vehicle.yearFrom))].sort((a, b) => a - b);
            const yearFilter = $('#year-filter');
            years.forEach(year => {
                yearFilter.append(`<option value="${year}">${year}</option>`);
            });
        });

        // Function to filter vehicles based on search and year
        function filterVehicles() {
            const query = $('#vehicle-search').val().toLowerCase();
            const selectedYear = parseInt($('#year-filter').val());
            $('#vehicle-list').empty();

            if (query.length > 0 || selectedYear) {
                const keywords = query.split(' ');

                const filteredVehicles = vehicles.filter(vehicle => 
                    keywords.every(keyword => vehicle.full.toLowerCase().includes(keyword)) &&
                    (!selectedYear || vehicle.yearFrom >= selectedYear)
                );
                $("#vehicle-details").show(500);

                filteredVehicles.forEach(vehicle => {
                    $('#vehicle-list').append(
                        `<div class="vehicle-item" data-id="${vehicle.full}">${vehicle.full}</div>`
                    );
                });

                $('#vehicle-list').show();
            } else {
                $('#vehicle-list').hide();
            }
        }

        $('#vehicle-search').on('input', filterVehicles);
        $('#year-filter').on('change', filterVehicles);
        
        var showKeys = ["make", "model", "cylinderCapacity", "yearFrom", "yearTo", "type", "fuelType", "transmission","term"]

        $(document).on('click', '.vehicle-item', function() {
            const selectedFull = $(this).data('id');
            const selectedVehicle = vehicles.find(vehicle => vehicle.full === selectedFull);

            const detailsTableBody = $('#vehicle-details tbody');
            detailsTableBody.empty();
            
            Object.entries(selectedVehicle).forEach(([key, value]) => {
            if(showKeys.includes(key)){
            	detailsTableBody.append(`
                    <tr>
                        <td>${key}</td>
                        <td>${value || 'N/A'}</td>
                    </tr>
                `);
            }      
            if(key == "ABI"){
                detailsTableBody.append(`
                    <input id="ABI" value="${value || 'N/A'}">
                `);
            } 
            });

            $('#vehicle-list').hide();
            $('#vehicle-search').val(selectedFull);
        });

        $(document).click(function(event) {
            if (!$(event.target).closest('#vehicle-search, #vehicle-list').length) {
                $('#vehicle-list').hide();
            }
        });
        
        // Gets a reference to the form element
        var form = document.getElementById('email-form');

        // Adds a listener for the "submit" event.
        form.addEventListener('submit', function(e) {
          e.preventDefault();
        });
        $("#signupbtn").click(function(event) {
        	signUp()
        });


          // Close the modal when clicking on the "X" or the close button
		  $(".close, #closeModal").on("click", function () {
		    $("#confirmationModal").fadeOut();
		  });

		  // Optionally, close the modal when clicking outside the modal content
		  $(window).on("click", function (event) {
		    if ($(event.target).is("#confirmationModal")) {
		      $("#confirmationModal").fadeOut();
		    }
		  });
}, 2000);


function signUp(){
	var volvoModel = $("#vehicle-search").val();
	var email = $("#email").val();
	var volvoABI = $("#abi").val();
	var date = $("#Date").val();

	var settings = {
        "url": webhookEmailSignup,
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "text/plain;charset=utf-8"
        },
        "data": JSON.stringify({
            "volvoModel": volvoModel,
            "email": email,
            "date": date,
            "volvoABI": volvoABI,
        }),
    };

    $.ajax(settings).done(function(response) {
    	console.log(response);
    	$("#confirmationModal").fadeIn();
    })
}
