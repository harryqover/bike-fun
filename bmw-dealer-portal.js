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
        vin: "TEMP", // Replace with actual VIN if available
        yearlyMileageKmRange: "MILEAGE_0_TO_9999",
        conditionAtPurchase: "VEHICLE_CONDITION_NEW",
        value: 500000, // Replace with actual value
        mainDriver: {
          firstName: customerName,
          address: {
            ratingArea: "42",
            smallAreaId: "42",
            matchLevel: "42",
            country: "IE"
          }
        },
        cylinderCapacity: 2000, // Example value, replace with actual
        fuelType: "P", // Example value, replace with actual
        handDrive: "RIGHT_HAND_DRIVE",
        transmission: "A",
        yearManufactured: 2024, // Replace with actual year
        modifications: [],
        abi: 12345678, // Replace with actual ABI code
        usage: "1",
        vehicleDoors: 4, // Example value
        additionalDrivers: [],
        registeredKeeper: { isPolicyholder: true },
        medicalConditionsNotifiedToNDLS: true,
        vehicleAddress: {
          country: "IE",
          ratingArea: "42",
          smallAreaId: "default"
        },
        insuranceGroup: 12,
        vehiclePurchaseDate: deliveryDate,
        insurerVehicleTerm: "",
        anyDriverPenaltyPoints: false,
        anyDriverConvictedMotorOffenceLastThreeYears: false,
        anyDriverConvictedNonMotorOffences: false,
        anyDriverClaimsLastThreeYears: false
      },
      policyHolder: {
        entityType: "ENTITY_TYPE_PERSON",
        email: customerEmail,
        firstName: customerName,
        phone: customerPhone,
      }
      partnerId: "66f672c447f3f290d35c8609",
      productConfigurationId: "bmwdemo", // Update with your product configuration ID
      country: "IE",
      language: "en",
      contractPeriod: {
        timeZone: "Europe/Brussels",
        startDate: new Date().toISOString().split('T')[0] // Current date in YYYY-MM-DD format
      },
      metadata: {
        stepHistory: "dealer-portal",
        lastStepAt: Date.now().toString(),
        documentsSentByMailConsented: "true",
        termsAndConditionsConsented: "true",
        requestPaperCopy: "false"
      },
      renewal: {
        type: "RENEWAL_TYPE_OPT_OUT"
      }
    };

    try {
      // Send POST request to API endpoint
      const response = await fetch('https://appqoverme-ui.sbx.qover.io/modules/policies/policy-quotes?appId=volvodemo', {
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
