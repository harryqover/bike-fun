console.log("hello bmwmini! This should be a working version!");
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

const makeSelect = document.getElementById('vehicleMake');
const modelSelect = document.getElementById('vehicleModel');
const extendedModelSelect = document.getElementById('extendedVehicleModel');

// Get unique models for the selected make
function updateModelOptions(selectedMake) {
  // Clear model and extended model dropdowns
  modelSelect.innerHTML = '<option value="" disabled selected>Select a model</option>';
  extendedModelSelect.innerHTML = '<option value="" disabled selected>Select extended model</option>';

  const models = [...new Set(
    modelData
      .filter(entry => entry.make === selectedMake)
      .map(entry => entry.model)
  )];

  models.forEach(model => {
    const option = document.createElement('option');
    option.value = model;
    option.textContent = model;
    modelSelect.appendChild(option);
  });
}

// Get extended models for the selected model and make
function updateExtendedModelOptions(selectedMake, selectedModel) {
  extendedModelSelect.innerHTML = '<option value="" disabled selected>Select extended model</option>';

  const filteredModels = modelData.filter(entry =>
    entry.make === selectedMake && entry.model === selectedModel
  );

  filteredModels.forEach(entry => {
    const option = document.createElement('option');
    option.value = entry.modelExt;
    option.textContent = entry.modelExt;
    extendedModelSelect.appendChild(option);
  });
}

// Event listeners
makeSelect.addEventListener('change', function () {
  const selectedMake = this.value;
  updateModelOptions(selectedMake);
});

modelSelect.addEventListener('change', function () {
  const selectedModel = this.value;
  const selectedMake = makeSelect.value;
  updateExtendedModelOptions(selectedMake, selectedModel);
});

// Initial population if needed
document.addEventListener('DOMContentLoaded', function () {
  if (makeSelect.value) {
    updateModelOptions(makeSelect.value);
  }
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

document.addEventListener('DOMContentLoaded', function () {
  const selectedMake = makeSelect.value;
  if (selectedMake) {
    updateModelOptions(selectedMake);

    // Optionally pre-fill first available model
    const firstModelOption = modelSelect.options[1]; // skip placeholder
    if (firstModelOption) {
      modelSelect.value = firstModelOption.value;
      updateExtendedModelOptions(selectedMake, firstModelOption.value);
    }
  }
});
