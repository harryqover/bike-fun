console.log("hello bmw 2");


  document.getElementById('insuranceForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent the default form submission

    // Extract form data
    const employeeEmail = document.getElementById('employeeEmail').value;
    const vehicleModel = document.getElementById('vehicleModel').value;
    const deliveryDate = document.getElementById('deliveryDate').value;
    const customerName = document.getElementById('customerName').value;
    const customerEmail = document.getElementById('customerEmail').value;
    const customerPhone = document.getElementById('customerPhone').value;

    // Prepare data for API request
    const requestData = {
      subject: {
        make: "BMW",
        model: vehicleModel,
        vehiclePurchaseDate: deliveryDate
      },
      policyHolder: {
        entityType: "ENTITY_TYPE_PERSON",
        email: customerEmail,
        firstName: customerName,
        phone: customerPhone,
      },
      productConfigurationId: "bmwmini",
      country: "IE",
      language: "en",
      contractPeriod: {
        timeZone: "Europe/Dublin",
        startDate: new Date().toISOString().split('T')[0] // Current date in YYYY-MM-DD format
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
          'Content-Type': 'application/json',
          'Accept': 'application/json'
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
