console.warn("1239");
const webhookEmailSignup = "https://script.google.com/macros/s/AKfycbwM6BWIdthN5E-ov5HTjKnIl9m54ns0Y5FJMj0Svv6lKM-JbfyLjeE-W5PoARkt8w4Few/exec";

setTimeout(function() {
    $("#vehicle-details").hide();
    let vehicles = [];
    let filteredVehicles = [];

    // Load vehicle data
    $.getJSON('https://harryqover.github.io/bike-fun/volvo_car_data.json?xx=3', function(data) {
        vehicles = data;
        console.log('Vehicles data loaded:', vehicles);

        // Populate year options
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

    // Event listener for year selection
    $('#year-filter').on('change', function() {
        const selectedYear = parseInt($(this).val());
        // Filter vehicles based on selected year
        filteredVehicles = vehicles.filter(vehicle => {
            const yearFrom = parseInt(vehicle.yearFrom);
            const yearTo = parseInt(vehicle.yearTo) === 0 ? 2025 : parseInt(vehicle.yearTo);
            return selectedYear >= yearFrom && selectedYear <= yearTo;
        });

        // Get unique models
        const models = [...new Set(filteredVehicles.map(vehicle => vehicle.model))].sort();

        // Initialize autocomplete for model-filter
        $("#model-filter").autocomplete({
            source: models,
            minLength: 0,
            select: function(event, ui) {
                $(this).val(ui.item.value);
                $('#model-filter').trigger('selected');
                return false;
            }
        }).focus(function(){
            // Show all options when the input is focused
            $(this).autocomplete("search", "");
        });

        // Reset fields
        $('#model-filter').val('');
        $('#fuel-filter').empty().append('<option value="">Fuel Type</option>');
        $('#vehicle-search').val('');
        $('#vehicle-details tbody').empty();
    });

    // Event listener for model selection
    $('#model-filter').on('selected', function() {
        const selectedModel = $(this).val();
        const availableModels = [...new Set(filteredVehicles.map(vehicle => vehicle.model))];

        if (!availableModels.includes(selectedModel)) {
            // Invalid model
            $('#fuel-filter').empty().append('<option value="">Fuel Type</option>');
            $('#vehicle-search').val('');
            $('#vehicle-details tbody').empty();
            return;
        }

        // Filter vehicles based on selected model
        const modelVehicles = filteredVehicles.filter(vehicle => vehicle.model === selectedModel);

        // Populate fuel type options
        const fuelTypes = [...new Set(modelVehicles.map(vehicle => vehicle.fuelType))].sort();
        const fuelFilter = $('#fuel-filter');
        fuelFilter.empty();
        fuelFilter.append('<option value="">Fuel Type</option>');
        fuelTypes.forEach(fuelType => {
            fuelFilter.append(`<option value="${fuelType}">${fuelType}</option>`);
        });

        // Reset fields
        $('#fuel-filter').val('');
        $('#vehicle-search').val('');
        $('#vehicle-details tbody').empty();
    });

    // Event listener for fuel type selection
    $('#fuel-filter').on('change', function() {
        const selectedFuelType = $(this).val();
        const selectedModel = $('#model-filter').val();

        // Filter vehicles based on selected model and fuel type
        const variantVehicles = filteredVehicles.filter(vehicle => vehicle.model === selectedModel && vehicle.fuelType === selectedFuelType);

        // Get unique variants
        const variants = [...new Set(variantVehicles.map(vehicle => vehicle.full))].sort();

        // Initialize autocomplete for vehicle-search
        $("#vehicle-search").autocomplete({
            source: variants,
            minLength: 0,
            select: function(event, ui) {
                $(this).val(ui.item.value);
                $('#vehicle-search').trigger('selected');
                return false;
            }
        }).focus(function(){
            // Show all options when the input is focused
            $(this).autocomplete("search", "");
        });

        // Reset fields
        $('#vehicle-search').val('');
        $('#vehicle-details tbody').empty();
    });

    // Event listener for variant selection
    $('#vehicle-search').on('selected', function() {
        const selectedVariant = $(this).val();
        const selectedModel = $('#model-filter').val();
        const selectedFuelType = $('#fuel-filter').val();

        // Filter vehicles based on selected model, fuel type, and variant
        const variantVehicles = filteredVehicles.filter(vehicle => vehicle.model === selectedModel && vehicle.fuelType === selectedFuelType);
        const selectedVehicle = variantVehicles.find(vehicle => vehicle.full === selectedVariant);

        if (selectedVehicle) {
            // Display vehicle details
            const tbody = $('#vehicle-details tbody');
            tbody.empty();
            for (const [key, value] of Object.entries(selectedVehicle)) {
                tbody.append(`<tr><td>${key}</td><td>${value}</td></tr>`);
                if(key == "ABI"){
                    tbody.append(`
                        <input id="ABI" value="${value || 'N/A'}">
                    `);
                } 
            }
        } else {
            // Invalid variant
            $('#vehicle-details tbody').empty();
        }
    });

    // Dynamic filtering for model input
    $('#model-filter').on('input', function() {
        const inputVal = $(this).val();
        const models = [...new Set(filteredVehicles.map(vehicle => vehicle.model))].sort();

        const filteredModels = models.filter(model => model.toLowerCase().includes(inputVal.toLowerCase()));

        $("#model-filter").autocomplete("option", "source", filteredModels);
    });

    // Dynamic filtering for variant input
    $('#vehicle-search').on('input', function() {
        const inputVal = $(this).val();
        const selectedModel = $('#model-filter').val();
        const selectedFuelType = $('#fuel-filter').val();

        // Filter vehicles based on selected model and fuel type
        const variantVehicles = filteredVehicles.filter(vehicle => vehicle.model === selectedModel && vehicle.fuelType === selectedFuelType);

        const variants = [...new Set(variantVehicles.map(vehicle => vehicle.full))].sort();

        const filteredVariants = variants.filter(variant => variant.toLowerCase().includes(inputVal.toLowerCase()));

        $("#vehicle-search").autocomplete("option", "source", filteredVariants);
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
    if(volvoABI != "" && isValidEmail(email) && date != ""){
        $.ajax(settings).done(function(response) {
            console.log(response);
            $("#confirmationModal").fadeIn();
        }) 
    } else {
        alert("missing info");
    }
    
}
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}