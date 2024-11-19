console.warn("1911 1719")
const webhookEmailSignup = "https://script.google.com/macros/s/AKfycbwM6BWIdthN5E-ov5HTjKnIl9m54ns0Y5FJMj0Svv6lKM-JbfyLjeE-W5PoARkt8w4Few/exec";
let vehicles = []; // Your array of vehicle data

//NEW BELOW
let filteredVehicles = [];





//NEW ABOVE

setTimeout(function() {
	$("#vehicle-details").hide(500);
    populateYearFilter();
    populateModelFilter();
    populateFuelFilter();

    // Event listeners
    document.getElementById('year-filter').addEventListener('change', filterVehicles);
    document.getElementById('model-filter').addEventListener('input', filterVehicles);
    document.getElementById('fuel-filter').addEventListener('change', filterVehicles);

    // Load JSON data from GitHub-hosted JSON
    $.getJSON('https://harryqover.github.io/bike-fun/volvo_car_data.json', function(data) {
        vehicles = data;
        console.log('Vehicles data loaded:', vehicles);
        
        // Populate year options based on the vehicles' years
        //const years = [...new Set(vehicles.map(vehicle => vehicle.yearFrom))].sort((a, b) => b - a);
        const years = [
          "2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016", 
          "2015", "2014", "2013", "2012", "2011", "2010", "2009", "2008", "2007", "2006", 
          "2005", "2004", "2003", "2002", "2001", "2000", "1999", "1998", "1997", "1996", 
          "1995", "1994", "1993", "1992", "1991", "1990", "1989", "1988", "1987", "1986", 
          "1985", "1984", "1983", "1982", "1981", "1980", "1979", "1978", "1977", "1976", 
          "1975", "1974", "1973", "1972", "1971", "1970"
        ];

        const yearFilter = $('#year-filter');
        years.forEach(year => {
            yearFilter.append(`<option value="${year}">${year}</option>`);
        });
    });

        // Function to filter vehicles based on search and year
  
        /* OLD CODE
        function filterVehicles() {
            const query = $('#vehicle-search').val().toLowerCase();
            const selectedYear = parseInt($('#year-filter').val());
            $('#vehicle-list').empty();

            if (query.length > 0 || selectedYear) {
                const keywords = query.split(' ');

                const filteredVehicles = vehicles.filter(vehicle => {
                    const matchesKeywords = keywords.every(keyword => vehicle.full.toLowerCase().includes(keyword));
                    const isYearInRange = !selectedYear || (
                        selectedYear >= vehicle.yearFrom && 
                        (vehicle.yearTo === 0 || selectedYear <= vehicle.yearTo)
                    );

                    return matchesKeywords && isYearInRange;
                });

                //$("#vehicle-details").show(500);

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
        */
        


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
                console.log(key+" - "+value);
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
	var volvoABI = $("#ABI").val();
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


//NEW BELOW
function populateYearFilter() {
    const yearFilter = document.getElementById('year-filter');
    const years = [...new Set(vehicles.map(v => v.year))].sort();
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    });
}

function populateModelFilter() {
    const modelOptions = document.getElementById('model-options');
    modelOptions.innerHTML = ''; // Clear existing options
    const models = [...new Set(vehicles.map(v => v.model))].sort();
    models.forEach(model => {
        const option = document.createElement('option');
        option.value = model;
        modelOptions.appendChild(option);
    });
}

function populateFuelFilter() {
    const fuelFilter = document.getElementById('fuel-filter');
    fuelFilter.innerHTML = '<option value="">Fuel Type</option>'; // Reset options
    const fuelTypes = [...new Set(vehicles.map(v => v.fuelType))].sort();
    fuelTypes.forEach(fuel => {
        const option = document.createElement('option');
        option.value = fuel;
        option.textContent = fuel;
        fuelFilter.appendChild(option);
    });
}


function filterVehicles() {
    console.log("filterVehicles");
    const selectedYear = document.getElementById('year-filter').value;
    const selectedModel = document.getElementById('model-filter').value.toLowerCase();
    const selectedFuel = document.getElementById('fuel-filter').value;

    filteredVehicles = vehicles.filter(vehicle => {
        const matchesYear = selectedYear ? vehicle.year == selectedYear : true;
        const matchesModel = selectedModel ? vehicle.model.toLowerCase().includes(selectedModel) : true;
        const matchesFuel = selectedFuel ? vehicle.fuelType == selectedFuel : true;
        return matchesYear && matchesModel && matchesFuel;
    });

    updateVehicleList();
    updateModelFilterOptions();
    updateFuelFilterOptions();
}
function updateVehicleList() {
    const vehicleList = document.getElementById('vehicle-list');
    vehicleList.innerHTML = ''; // Clear existing list

    filteredVehicles.forEach(vehicle => {
        const div = document.createElement('div');
        div.textContent = `${vehicle.year} ${vehicle.model} (${vehicle.fuelType})`;
        vehicleList.appendChild(div);
    });
}

function updateModelFilterOptions() {
    const modelOptions = document.getElementById('model-options');
    modelOptions.innerHTML = ''; // Clear existing options
    const models = [...new Set(filteredVehicles.map(v => v.model))].sort();
    models.forEach(model => {
        const option = document.createElement('option');
        option.value = model;
        modelOptions.appendChild(option);
    });
}

function updateFuelFilterOptions() {
    const fuelFilter = document.getElementById('fuel-filter');
    fuelFilter.innerHTML = '<option value="">Fuel Type</option>'; // Reset options
    const fuelTypes = [...new Set(filteredVehicles.map(v => v.fuelType))].sort();
    fuelTypes.forEach(fuel => {
        const option = document.createElement('option');
        option.value = fuel;
        option.textContent = fuel;
        fuelFilter.appendChild(option);
    });
}
//NEW ABOVE