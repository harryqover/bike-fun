/**
 * Client-side script for RoadBuddy AI.
 * Handles user interactions, form submissions, and communication with the Google Apps Script API.
 */

// --- CONFIGURATION ---
// IMPORTANT: Paste the Web App URL from your Google Apps Script deployment here.
const SCRIPT_API_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';

// --- PWA SERVICE WORKER ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(registration => console.log('ServiceWorker registration successful.'))
      .catch(err => console.error('ServiceWorker registration failed: ', err));
  });
}

// --- GLOBAL VARIABLES ---
let lastKnownMileage = 0;
let consumptionChartInstance = null;

// --- API HELPER FUNCTIONS ---

/**
 * Performs a GET request to the Google Script API.
 * @param {string} action The action to perform (e.g., 'getLastMileage').
 * @returns {Promise<any>} The data from the API response.
 */
async function apiGet(action) {
    const response = await fetch(`${SCRIPT_API_URL}?action=${action}`);
    if (!response.ok) {
        throw new Error(`Network error calling action: ${action}`);
    }
    const result = await response.json();
    if (result.status === 'error') {
        throw new Error(`API Error: ${result.message}`);
    }
    return result.data;
}

/**
 * Performs a POST request to the Google Script API.
 * @param {string} action The action to perform (e.g., 'logData').
 * @param {object} payload The data to send in the request body.
 * @returns {Promise<any>} The data from the API response.
 */
async function apiPost(action, payload) {
    const response = await fetch(SCRIPT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // To bypass CORS issues with Google Scripts, we send as text and stringify manually.
        body: JSON.stringify({ action, payload }),
        mode: 'cors'
    });
    if (!response.ok) {
        throw new Error(`Network error calling action: ${action}`);
    }
    const result = await response.json();
    if (result.status === 'error') {
        throw new Error(`API Error: ${result.message}`);
    }
    return result.data;
}


// --- MAIN APP LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT DECLARATIONS ---
    const form = document.getElementById('fuel-form');
    const mileageInput = document.getElementById('mileage');
    const mileageValidationMessage = document.getElementById('mileage-validation-message');
    const pinContainer = document.getElementById('pin-container');
    const submitBtn = document.getElementById('submit-btn');
    const submitText = document.getElementById('submit-text');
    const loader = document.getElementById('loader');
    const statusMessage = document.getElementById('status-message');
    const btnGas = document.getElementById('btn-gas');
    const btnElectric = document.getElementById('btn-electric');
    const fuelTypeInput = document.getElementById('fuelType');
    const geolocateBtn = document.getElementById('geolocate-btn');
    const latInput = document.getElementById('latitude');
    const longInput = document.getElementById('longitude');
    const litersInput = document.getElementById('liters');
    const pricePerLiterInput = document.getElementById('pricePerLiter');
    const totalCostInput = document.getElementById('totalCost');
    const geminiContainer = document.getElementById('gemini-message-container');
    const geminiMessage = document.getElementById('gemini-message');
    const chartContainer = document.getElementById('chart-container');
    const imagePicker = document.getElementById('image-picker');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imagePreview = document.getElementById('image-preview');
    const aiStatus = document.getElementById('ai-status');
    const fuelDetailsSection = document.getElementById('fuel-details-section');
    const yearlyCostsContainer = document.getElementById('yearly-costs');
    const qoverCostEl = document.getElementById('qover-cost');
    const personnelCostEl = document.getElementById('personnel-cost');

    /**
     * Initializes the application by fetching initial data from the backend.
     */
    async function initializeApp() {
        try {
            const mileage = await apiGet('getLastMileage');
            lastKnownMileage = Number(mileage) || 0;
            mileageInput.placeholder = `Dernier: ${lastKnownMileage} km`;
        } catch (error) {
            console.error("Failed to get last mileage:", error);
            mileageInput.placeholder = 'Erreur de chargement';
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

    // --- EVENT LISTENERS ---
    mileageInput.addEventListener('input', handleMileageInput);
    btnGas.addEventListener('click', () => selectFuelType('Essence'));
    btnElectric.addEventListener('click', () => selectFuelType('Électricité'));
    geolocateBtn.addEventListener('click', getLocation);
    litersInput.addEventListener('input', updateCosts);
    pricePerLiterInput.addEventListener('input', updateCosts);
    totalCostInput.addEventListener('input', updatePricePerLiter);
    form.addEventListener('submit', handleFormSubmit);
    imagePicker.addEventListener('change', handleImageUpload);

    // --- FUNCTIONS ---
    function handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        latInput.value = '';
        longInput.value = '';
        updateGeolocateButton(false);

        // Extract GPS data from image EXIF
        EXIF.getData(file, function() {
            const lat = EXIF.getTag(this, "GPSLatitude");
            const lon = EXIF.getTag(this, "GPSLongitude");
            const latRef = EXIF.getTag(this, "GPSLatitudeRef");
            const lonRef = EXIF.getTag(this, "GPSLongitudeRef");

            if (lat && lon && latRef && lonRef) {
                const latitude = convertDMSToDD(lat[0], lat[1], lat[2], latRef);
                const longitude = convertDMSToDD(lon[0], lon[1], lon[2], lonRef);
                latInput.value = latitude.toFixed(6);
                longInput.value = longitude.toFixed(6);
                updateGeolocateButton(true, 'Photo');
            }
        });

        const reader = new FileReader();
        reader.onload = async function(e) {
            imagePreview.src = e.target.result;
            imagePreviewContainer.classList.remove('hidden');
            aiStatus.textContent = "Analyse par l'IA en cours...";

            const base64Data = e.target.result.split(',')[1];
            try {
                const data = await apiPost('extractDataFromImage', { base64ImageData: base64Data });
                onAiSuccess(data);
            } catch (error) {
                onAiFailure(error);
            }
        };
        reader.readAsDataURL(file);
    }

    function convertDMSToDD(degrees, minutes, seconds, direction) {
        let dd = degrees + minutes / 60 + seconds / 3600;
        if (direction == "S" || direction == "W") {
            dd = dd * -1;
        }
        return dd;
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

    function onAiFailure(error) {
        aiStatus.textContent = "L'extraction a échoué. Veuillez entrer les données manuellement.";
        console.error("AI extraction failed:", error);
    }

    function handleMileageInput() {
        const currentMileage = Number(mileageInput.value);
        geminiContainer.style.display = 'none';
        mileageValidationMessage.textContent = '';

        if (mileageInput.value === "") {
            pinContainer.style.display = 'none';
            return;
        }

        if (currentMileage > lastKnownMileage) {
            pinContainer.style.display = 'block';
            mileageValidationMessage.textContent = '';
        } else {
            pinContainer.style.display = 'none';
            if (lastKnownMileage > 0) {
                mileageValidationMessage.textContent = `Doit être > ${lastKnownMileage} km.`;
            }
        }
    }

    function selectFuelType(type) {
        fuelTypeInput.value = type;
        const isGas = type === 'Essence';

        btnGas.classList.toggle('btn-active', isGas);
        btnGas.classList.toggle('bg-gray-700', !isGas);
        btnElectric.classList.toggle('btn-active', !isGas);
        btnElectric.classList.toggle('bg-gray-700', isGas);

        fuelDetailsSection.style.display = isGas ? 'block' : 'none';
    }

    function updateCosts() {
        const liters = parseFloat(litersInput.value);
        const price = parseFloat(pricePerLiterInput.value);
        if (!isNaN(liters) && !isNaN(price)) {
            totalCostInput.value = (liters * price).toFixed(2);
        }
    }

    function updatePricePerLiter() {
        const liters = parseFloat(litersInput.value);
        const total = parseFloat(totalCostInput.value);
        if (!isNaN(liters) && !isNaN(total) && liters > 0) {
            pricePerLiterInput.value = (total / liters).toFixed(3);
        }
    }

    function updateGeolocateButton(found, source = 'GPS') {
        if (found) {
            geolocateBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-circle-fill text-green-400" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/></svg> Pos. (${source})`;
        } else {
            geolocateBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/></svg> Position';
        }
        geolocateBtn.disabled = false;
    }

    function getLocation() {
        if (navigator.geolocation) {
            geolocateBtn.disabled = true;
            geolocateBtn.innerHTML = 'Recherche...';
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    latInput.value = position.coords.latitude.toFixed(6);
                    longInput.value = position.coords.longitude.toFixed(6);
                    updateGeolocateButton(true, 'GPS');
                },
                () => {
                    showStatus("Erreur de géolocalisation.", 'error');
                    updateGeolocateButton(false);
                }
            );
        } else {
            showStatus("La géolocalisation n'est pas supportée.", 'error');
        }
    }

    async function handleFormSubmit(event) {
        event.preventDefault();
        const currentMileage = Number(mileageInput.value);
        if (currentMileage <= lastKnownMileage && lastKnownMileage > 0) {
            showStatus(`Le kilométrage doit être supérieur à ${lastKnownMileage} km.`, 'error');
            return;
        }
        setLoadingState(true);
        const formData = {
            mileage: currentMileage,
            fuelType: fuelTypeInput.value,
            liters: litersInput.value || 0,
            pricePerLiter: pricePerLiterInput.value || 0,
            totalCost: totalCostInput.value || 0,
            paidBy: document.getElementById('paidBy').checked ? 'Qover' : 'Personnel',
            latitude: latInput.value,
            longitude: longInput.value
        };

        try {
            const response = await apiPost('logData', formData);
            showStatus(response.message, 'success');
            lastKnownMileage = currentMileage;

            // Get gamification message in parallel
            showAiLoading();
            apiPost('getGamificationMessage', formData).then(gamifyResponse => {
                geminiMessage.innerHTML = gamifyResponse.message;
            });

            resetForm();
            updateChart();
            // Refresh yearly costs after submission
            apiGet('getYearlyCosts').then(costs => {
                qoverCostEl.textContent = `${costs.qover} €`;
                personnelCostEl.textContent = `${costs.personnel} €`;
            });

        } catch (error) {
            showStatus('Erreur: ' + error.message, 'error');
        } finally {
            setLoadingState(false);
        }
    }

    function showAiLoading() {
        geminiContainer.style.display = 'block';
        geminiMessage.innerHTML = `<span class="italic text-purple-400 ai-loader">L'IA réfléchit<span>.</span><span>.</span><span>.</span></span>`;
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
            chartContainer.style.display = 'none';
        }
    }

    function renderChart(data) {
        const ctx = document.getElementById('consumptionChart').getContext('2d');
        if (consumptionChartInstance) {
            consumptionChartInstance.destroy();
        }
        consumptionChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map((_, i) => `Plein ${i + 1}`),
                datasets: [{
                    label: 'L/100km',
                    data: data,
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1,
                    borderRadius: 5,
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#d1d5db' } },
                    x: { grid: { display: false }, ticks: { color: '#d1d5db' } }
                }
            }
        });
    }

    function resetForm() {
        form.reset();
        selectFuelType('Essence');
        mileageValidationMessage.textContent = '';
        updateGeolocateButton(false);
        document.getElementById('paidBy').checked = true;
        mileageInput.placeholder = `Dernier: ${lastKnownMileage} km`;
        imagePreviewContainer.classList.add('hidden');
        imagePicker.value = '';
        setTimeout(() => { statusMessage.textContent = ''; }, 8000);
    }

    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = `text-center text-sm h-4 ${type === 'error' ? 'text-red-400' : 'text-green-400'}`;
    }

    function setLoadingState(isLoading) {
        submitText.style.display = isLoading ? 'none' : 'block';
        loader.style.display = isLoading ? 'block' : 'none';
        submitBtn.disabled = isLoading;
    }

    // Start the application
    initializeApp();
});