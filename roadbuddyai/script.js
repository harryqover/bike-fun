// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js') // Path to your service worker file
      .then(registration => console.log('ServiceWorker registration successful.'))
      .catch(err => console.log('ServiceWorker registration failed: ', err));
  });
}

// --- CONFIGURATION ---
// PASTE THE GOOGLE SCRIPT WEB APP URL YOU COPIED EARLIER
const SCRIPT_API_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec'; 

// --- Helper function for API calls ---
async function apiGet(action) {
    const response = await fetch(`${SCRIPT_API_URL}?action=${action}`);
    if (!response.ok) throw new Error(`Network response was not ok for ${action}`);
    return await response.json();
}

async function apiPost(action, payload) {
    const response = await fetch(SCRIPT_API_URL, {
        method: 'POST',
        mode: 'no-cors', // Important for handling responses from Google Scripts in this setup
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, payload })
    });
     // In no-cors mode, you can't read the response, so we'll have to rely on optimistic updates
     // or trigger a secondary 'status' check if needed.
    return { status: 'success', data: { message: "Request sent. Check sheet for confirmation."} };
}

// --- MAIN SCRIPT ---
let lastKnownMileage = 0;
let consumptionChartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    // --- Element declarations (same as before) ---
    const form = document.getElementById('fuel-form');
    // ... all other const declarations ...

    async function initializeApp() {
        try {
            const mileage = await apiGet('getLastMileage');
            lastKnownMileage = Number(mileage) || 0;
            mileageInput.placeholder = `Dernier: ${lastKnownMileage} km`;
        } catch (error) {
            console.error("Failed to get last mileage:", error);
        }
        
        try {
            const costs = await apiGet('getYearlyCosts');
            qoverCostEl.textContent = `${costs.qover} €`;
            personnelCostEl.textContent = `${costs.personnel} €`;
            yearlyCostsContainer.classList.remove('opacity-0');
        } catch (error) {
            console.error("Failed to get yearly costs:", error);
        }
        
        document.getElementById('paidBy').checked = true;
        updateChart();
    }

    // --- Event Listeners (same as before) ---
    // ... all event listeners ...

    // --- MODIFIED Functions to use fetch ---

    function handleImageUpload(event) {
        // ... (this function's internal logic is mostly the same)
        reader.onload = function(e) {
            // ... (image preview logic) ...
            const base64Data = e.target.result.split(',')[1];
            
            // This is the modified part
            fetch(SCRIPT_API_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'extractDataFromImage', payload: { base64ImageData: base64Data } })
            })
            .then(res => res.json())
            .then(response => {
                if (response.status === 'success') {
                    onAiSuccess(response.data);
                } else {
                    onAiFailure(response.message);
                }
            })
            .catch(err => onAiFailure(err));
        };
        reader.readAsDataURL(file);
    }
    
    function onAiSuccess(data) {
        if (data.error) {
            aiStatus.textContent = `Erreur IA: ${data.error}`;
            return;
        }
        aiStatus.textContent = "Données extraites !";
        litersInput.value = data.liters || '';
        pricePerLiterInput.value = data.pricePerLiter || '';
        totalCostInput.value = data.totalCost || '';
    }

    async function handleFormSubmit(event) {
        event.preventDefault();
        // ... (validation logic is the same) ...
        setLoadingState(true);
        const formData = { /* ... form data object ... */ };

        try {
            // Log the data
            const logResponse = await fetch(SCRIPT_API_URL, {
                method: 'POST',
                redirect: "follow",
                body: JSON.stringify({ action: 'logData', payload: formData })
            });

            // Optimistically update UI
            showStatus('Données enregistrées !', 'success');
            lastKnownMileage = formData.mileage;
            resetForm();
            setLoadingState(false);
            updateChart();
            
            // Refresh yearly costs
            const costs = await apiGet('getYearlyCosts');
            qoverCostEl.textContent = `${costs.qover} €`;
            personnelCostEl.textContent = `${costs.personnel} €`;
            
            // Get gamification message
            showAiLoading();
            const gamifyResponse = await fetch(SCRIPT_API_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'getGamificationMessage', payload: formData })
            });
            const gamifyData = await gamifyResponse.json();
            if (gamifyData.status === 'success') {
                geminiMessage.innerHTML = gamifyData.data.message;
            }

        } catch (error) {
            showStatus('Erreur: ' + error.message, 'error');
            setLoadingState(false);
        }
    }

    async function updateChart() {
        try {
            const history = await apiGet('getConsumptionHistory');
            if (history && history.length > 0) {
                chartContainer.style.display = 'block';
                renderChart(history);
            } else {
                chartContainer.style.display = 'none';
            }
        } catch (error) {
            console.error("Failed to update chart:", error);
        }
    }

    // --- Keep all other helper functions as they were ---
    // showAiLoading(), renderChart(), resetForm(), showStatus(), setLoadingState(),
    // handleMileageInput(), selectFuelType(), updateCosts(), updatePricePerLiter(),
    // updateGeolocateButton(), getLocation(), convertDMSToDD()
    
    initializeApp();
});