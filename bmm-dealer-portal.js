console.log("hello bmwmini 19");
/*
$('#employeeEmail').val("employee@dealer.com")
$('#vehicleModel').val("your model")
$('#deliveryDate').val("yyyy-mm-dd")
$('#customerName').val("customer name")
$('#customerEmail').val("customer@domain.com")
*/

// VEHICLE MODEL DATA
const modelData = [
  {
      "make": "BMW",
      "model": "I5",
      "modelExt": "I5 M60 4DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "I5",
      "modelExt": "I5 EDRIVE40 M SPORT 4DR 2025MY"
  },
  {
      "make": "MINI",
      "model": "COUNTRYMAN",
      "modelExt": "COUNTRYMAN COOPER SPORT SE 5DR 2024MY"
  }
];

document.addEventListener("DOMContentLoaded", function () {
  // Add a small delay to ensure elements are fully loaded
  setTimeout(() => {
    const vehicleMakeDropdown = document.getElementById("vehicleMake");
    const vehicleModelDropdown = document.getElementById("vehicleModel");
    const extendedModelDropdown = document.getElementById("extendedVehicleModel");
    
    if (!vehicleMakeDropdown || !vehicleModelDropdown || !extendedModelDropdown) {
      console.error("One or more dropdown elements not found");
      return;
    }
    
    console.log("Make dropdown value:", vehicleMakeDropdown.value);
    
    vehicleModelDropdown.disabled = true;
    extendedModelDropdown.disabled = true;
    
    // On make change, populate models
    vehicleMakeDropdown.addEventListener("change", function () {
      const selectedMake = this.value.toLowerCase();
      
      console.log("Selected make:", selectedMake);
      
      // Clear model and extended model dropdowns
      vehicleModelDropdown.innerHTML = `<option value="" disabled selected>Select a vehicle model</option>`;
      extendedModelDropdown.innerHTML = `<option value="" disabled selected>Select an extended vehicle model</option>`;
      vehicleModelDropdown.disabled = true;
      extendedModelDropdown.disabled = true;
      
      const modelsForMake = modelData
        .filter(item => item.make.toLowerCase() === selectedMake)
        .map(item => item.model);
      
      const uniqueModels = [...new Set(modelsForMake)];
      
      console.log("Models for make:", modelsForMake);
      console.log("Unique models:", uniqueModels);
      
      if (uniqueModels.length > 0) {
        vehicleModelDropdown.disabled = false;
        uniqueModels.forEach(model => {
          const option = document.createElement("option");
          option.value = model;
          option.textContent = model;
          vehicleModelDropdown.appendChild(option);
        });
      }
    });
    
    // On model change, populate extended models
    vehicleModelDropdown.addEventListener("change", function () {
      const selectedMake = vehicleMakeDropdown.value.toLowerCase();
      const selectedModel = this.value;
      
      extendedModelDropdown.innerHTML = `<option value="" disabled selected>Select an extended vehicle model</option>`;
      extendedModelDropdown.disabled = true;
      
      const matchingModels = modelData.filter(item =>
        item.make.toLowerCase() === selectedMake &&
        item.model === selectedModel
      );
      
      if (matchingModels.length > 0) {
        extendedModelDropdown.disabled = false;
        matchingModels.forEach(item => {
          const option = document.createElement("option");
          option.value = item.modelExt;
          option.textContent = item.modelExt;
          extendedModelDropdown.appendChild(option);
        });
      }
    });
    
    // Trigger the initial change event after everything is set up
    vehicleMakeDropdown.dispatchEvent(new Event("change"));
  }, 100); // Small delay to ensure DOM is fully ready
});


// FORM SUBMISSION
document.getElementById('insuranceForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent the default form submission
    $("#loadingOverlay").show(500);

    // Extract form data
    const employeeEmail = document.getElementById('employeeEmail').value;
    const vehicleMake = document.getElementById('vehicleMake').value;
    const vehicleModel = document.getElementById('vehicleModel').value;
    const extendedVehicleModel = document.getElementById('extendedVehicleModel').value;
    const deliveryDate = document.getElementById('deliveryDate').value;
    const customerName = document.getElementById('customerName').value;
    const customerEmail = document.getElementById('customerEmail').value;
    const dealership = document.getElementById('dealership').value;

    // Prepare data for API request
    const requestData = {
      subject: {
        make: vehicleMake,
        model: vehicleModel,
        modelVersion: extendedVehicleModel,
        vehiclePurchaseDate: deliveryDate
      },
      policyholder: {
        entityType: "ENTITY_TYPE_PERSON",
        email: customerEmail,
        firstName: customerName,
      },
      productConfigurationId: "bmwmini",
      country: "IE",
      language: "en",
      contractPeriod: {
        timeZone: "Europe/Dublin",
        startDate: new Date(deliveryDate).toISOString().split('T')[0] // Current date in YYYY-MM-DD format
      },
      metadata: {
        stepHistory: "dealer-portal",
        dealerReferrer: employeeEmail,
        dealerStore: dealership,
        lastStepAt: Date.now().toString(),
        lastStepUrl: "https://appqoverme-ui.sbx.qover.io/bmm/risk?appId=m1yf5oeskryvn0cs89je3f8i",
        documentsSentByMailConsented: "true",
        termsAndConditionsConsented: "true",
        requestPaperCopy: "false"
      },
      appId: "m1yf5oeskryvn0cs89je3f8i"
    };

    var settings = {
      url: "https://script.google.com/macros/s/AKfycbxzMsR5FrB4fouWlxZiHDjX5h6cXoXGQs7y3QElScz6PPm0ewkhymQ4P61Nm9QJwB2QDw/exec",
      method: "POST",
      timeout: 0,
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      data: JSON.stringify({
        payload: requestData,
        action: "createQuote"
      })
    };
    
    $.ajax(settings).done(function(response) {
      console.log("draft created");
      console.log(response);
      console.log(response.payload.id);
      $("#loadingOverlay").hide(500);
      $("#message").html('<p class="success">Quote created successfully!</p><pre>' + JSON.stringify(response.payload.id, null, 2) + "</pre>");

    }).fail(function(jqXHR, textStatus, errorThrown) {
      console.error("Error:", textStatus, errorThrown);
      $("#loadingOverlay").hide(500);
      $("#message").html('<p class="error">An error occurred while creating the quote.</p><pre>' + JSON.stringify(response, null, 2) + '</pre>');
    });
  });
