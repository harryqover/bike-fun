console.log("hello bmw 10");

$('#employeeEmail').val("harry+employee@qover.com")
    $('#vehicleModel').val("BMW X5")
    $('#deliveryDate').val("2025-03-28")
    $('#customerName').val("harry")
    $('#customerEmail').val("harry+customer@qover.com")


document.getElementById('insuranceForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent the default form submission

    // Extract form data
    const employeeEmail = document.getElementById('employeeEmail').value;
    const vehicleModel = document.getElementById('vehicleModel').value;
    const deliveryDate = document.getElementById('deliveryDate').value;
    const customerName = document.getElementById('customerName').value;
    const customerEmail = document.getElementById('customerEmail').value;

    // Prepare data for API request
    const requestData = {
      subject: {
        make: "BMW",
        model: vehicleModel,
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

    }).fail(function(jqXHR, textStatus, errorThrown) {
      console.error("Error:", textStatus, errorThrown);
    });
  });