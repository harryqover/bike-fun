console.log("hello bmw 8");

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
        documentsSentByMailConsented: "true",
        termsAndConditionsConsented: "true",
        requestPaperCopy: "false"
      },
      appId: "m1yf5oeskryvn0cs89je3f8i"
    };
    const payload = {
      payload: requestData,
      action: "createQuote"
    }

    try {
      // Send POST request to API endpoint
      const response = await fetch('https://script.google.com/macros/s/AKfycbxzMsR5FrB4fouWlxZiHDjX5h6cXoXGQs7y3QElScz6PPm0ewkhymQ4P61Nm9QJwB2QDw/exec', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();

      // Handle success (e.g., show confirmation to the employee)
      alert('Insurance quote created successfully!');
      console.log('Response:', responseData);
    } catch (error) {
      // Handle error (e.g., show error message)
      alert('Failed to create insurance quote. Please try again.');
      console.error('Error:', error);
    }
  });

/*
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
        documentsSentByMailConsented: "true",
        termsAndConditionsConsented: "true",
        requestPaperCopy: "false"
      },
      appId: "m1yf5oeskryvn0cs89je3f8i"
    };

    try {
      // Send POST request to API endpoint
      const response = await fetch('https://appqoverme-ui.sbx.qover.io/modules/policies/policy-quotes?appId=m1yf5oeskryvn0cs89je3f8i', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();

      // Handle success (e.g., show confirmation to the employee)
      alert('Insurance quote created successfully!');
      console.log('Response:', responseData);
    } catch (error) {
      // Handle error (e.g., show error message)
      alert('Failed to create insurance quote. Please try again.');
      console.error('Error:', error);
    }
  });

*/