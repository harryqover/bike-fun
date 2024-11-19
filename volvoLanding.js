setTimeout(function() {
    let vehicles = [];
    let filteredVehicles = [];

    // Load vehicle data
    $.getJSON('https://harryqover.github.io/bike-fun/volvo_car_data.json', function(data) {
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

        // Populate model options
        const models = [...new Set(filteredVehicles.map(vehicle => vehicle.model))].sort();
        const modelOptions = $('#model-options');
        modelOptions.empty();
        models.forEach(model => {
            modelOptions.append(`<option value="${model}">${model}</option>`);
        });

        // Reset fields
        $('#model-filter').val('');
        $('#fuel-filter').empty().append('<option value="">Fuel Type</option>');
        $('#vehicle-search').val('');
        $('#vehicle-details tbody').empty();
    });

    // Event listener for model selection
    $('#model-filter').on('input', function() {
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

        // Populate variant options
        if ($('#variant-options').length === 0) {
            $('#vehicle-search').after('<datalist id="variant-options"></datalist>');
        } else {
            $('#variant-options').empty();
        }

        variantVehicles.forEach(vehicle => {
            $('#variant-options').append(`<option value="${vehicle.full}">${vehicle.full}</option>`);
        });

        // Attach datalist to input
        $('#vehicle-search').attr('list', 'variant-options');

        // Reset fields
        $('#vehicle-search').val('');
        $('#vehicle-details tbody').empty();
    });

    // Event listener for variant selection
    $('#vehicle-search').on('input', function() {
        const selectedVariant = $(this).val();
        const selectedModel = $('#model-filter').val();
        const selectedFuelType = $('#fuel-filter').val();

        // Get available variants
        const variantVehicles = filteredVehicles.filter(vehicle => vehicle.model === selectedModel && vehicle.fuelType === selectedFuelType);
        const availableVariants = variantVehicles.map(vehicle => vehicle.full);

        if (!availableVariants.includes(selectedVariant)) {
            // Invalid variant
            $('#vehicle-details tbody').empty();
            return;
        }

        const selectedVehicle = variantVehicles.find(vehicle => vehicle.full === selectedVariant);

        if (selectedVehicle) {
            // Display vehicle details
            const tbody = $('#vehicle-details tbody');
            tbody.empty();
            for (const [key, value] of Object.entries(selectedVehicle)) {
                tbody.append(`<tr><td>${key}</td><td>${value}</td></tr>`);
            }
        }
    });

}, 2000);