setTimeout(function() {
    $.getJSON('https://harryqover.github.io/bike-fun/volvo_car_data.json', function(data) {
        vehicles = data;
        filteredVehicles = data;
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
// Event Listeners
document.getElementById('year-filter').addEventListener('change', function() {
    updateModelFilterOptions();
    updateFuelFilterOptions();
    filterVehicles();
});

document.getElementById('model-filter').addEventListener('input', function() {
    updateFuelFilterOptions();
    filterVehicles();
});

document.getElementById('fuel-filter').addEventListener('change', function() {
    updateModelFilterOptions();
    filterVehicles();
});

// Filter Vehicles Function
function filterVehicles() {
    const selectedYear = document.getElementById('year-filter').value;
    const selectedModel = document.getElementById('model-filter').value.toLowerCase();
    const selectedFuel = document.getElementById('fuel-filter').value;

    filteredVehicles = vehicles.filter(vehicle => {
        const matchesYear = selectedYear ? vehicle.year === parseInt(selectedYear) : true;
        const matchesModel = selectedModel ? vehicle.model.toLowerCase().includes(selectedModel) : true;
        const matchesFuel = selectedFuel ? vehicle.fuelType === selectedFuel : true;
        return matchesYear && matchesModel && matchesFuel;
    });

    updateVehicleList();
}

// Update Model Filter Options Function
function updateModelFilterOptions() {
    const modelOptions = document.getElementById('model-options');
    modelOptions.innerHTML = ''; // Clear existing options

    const selectedYear = document.getElementById('year-filter').value;
    const selectedFuel = document.getElementById('fuel-filter').value;

    let vehiclesForModels = vehicles.slice();

    if (selectedYear) {
        vehiclesForModels = vehiclesForModels.filter(vehicle => vehicle.year === parseInt(selectedYear));
    }

    if (selectedFuel) {
        vehiclesForModels = vehiclesForModels.filter(vehicle => vehicle.fuelType === selectedFuel);
    }

    const models = [...new Set(vehiclesForModels.map(v => v.model))].sort();

    models.forEach(model => {
        const option = document.createElement('option');
        option.value = model;
        modelOptions.appendChild(option);
    });
}

// Update Fuel Filter Options Function
function updateFuelFilterOptions() {
    const fuelFilter = document.getElementById('fuel-filter');
    fuelFilter.innerHTML = '<option value="">Fuel Type</option>'; // Reset options

    const selectedYear = document.getElementById('year-filter').value;
    const selectedModel = document.getElementById('model-filter').value.toLowerCase();

    let vehiclesForFuelTypes = vehicles.slice();

    if (selectedYear) {
        vehiclesForFuelTypes = vehiclesForFuelTypes.filter(vehicle => vehicle.year === parseInt(selectedYear));
    }

    if (selectedModel) {
        vehiclesForFuelTypes = vehiclesForFuelTypes.filter(vehicle => vehicle.model.toLowerCase().includes(selectedModel));
    }

    const fuelTypes = [...new Set(vehiclesForFuelTypes.map(v => v.fuelType))].sort();

    fuelTypes.forEach(fuel => {
        const option = document.createElement('option');
        option.value = fuel;
        option.textContent = fuel;
        fuelFilter.appendChild(option);
    });
}

}, 2000);