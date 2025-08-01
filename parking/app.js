document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwY1AHmB52TDJTerlryEZkwK7nzDrB5YD0w94QwMY-ioyyMkWsnUG-pS0uDBrhLmDKB/exec";

    // --- DOM Elements ---
    const getCodeBtn = document.getElementById('getCodeBtn');
    const statusMessage = document.getElementById('statusMessage');
    const steps = document.querySelectorAll('.step');
    const codeDisplay = document.getElementById('codeDisplay');
    const plaqueSuggestions = document.getElementById('plaqueSuggestions');
    const otherPlaqueBtn = document.getElementById('otherPlaqueBtn');
    const otherPlaqueSection = document.getElementById('otherPlaqueSection');
    const plaqueInput = document.getElementById('plaqueInput');
    const submitManualPlaqueBtn = document.getElementById('submitManualPlaqueBtn');
    const finalPlaque = document.getElementById('finalPlaque');
    const smsText = document.getElementById('smsText');
    const copySmsBtn = document.getElementById('copySmsBtn');
    const openSmsLink = document.getElementById('openSmsLink');
    const adminToggleBtn = document.getElementById('adminToggleBtn');
    const adminPanel = document.getElementById('adminPanel');
    const closeAdminBtn = document.getElementById('closeAdminBtn');
    const overlay = document.getElementById('overlay');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const codesTextarea = document.getElementById('codesTextarea');
    const submitTextBtn = document.getElementById('submitTextBtn');
    const imageUploadInput = document.getElementById('imageUploadInput');
    const uploadBtn = document.getElementById('uploadBtn');

    let currentCode = '';

    // --- Navigation & UI ---
    function showStep(stepNumber) {
        steps.forEach(step => step.classList.remove('active'));
        document.getElementById(`step${stepNumber}`).classList.add('active');
    }

    function toggleAdminPanel(show) {
        overlay.classList.toggle('active', show);
        adminPanel.classList.toggle('active', show);
    }

    adminToggleBtn.addEventListener('click', () => toggleAdminPanel(true));
    closeAdminBtn.addEventListener('click', () => toggleAdminPanel(false));
    overlay.addEventListener('click', () => toggleAdminPanel(false));

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`${button.dataset.tab}Tab`).classList.add('active');
        });
    });

    // --- Core App Logic ---
    getCodeBtn.addEventListener('click', async () => {
        statusMessage.textContent = "Recherche en cours...";
        getCodeBtn.disabled = true;
        try {
            const response = await fetch(SCRIPT_URL);
            if (!response.ok) throw new Error(`Erreur serveur: ${response.status}`);
            const data = await response.json();
            
            if (data.error) throw new Error(data.error);

            currentCode = data.code;
            codeDisplay.textContent = currentCode;
            
            // AMÉLIORATION : Affiche les plaques mémorisées
            plaqueSuggestions.innerHTML = ''; // Vide les anciennes suggestions
            data.plates.forEach(plate => {
                const button = document.createElement('button');
                button.className = 'plaque-btn secondary-btn';
                button.textContent = plate;
                button.dataset.plaque = plate;
                button.addEventListener('click', () => submitParking(plate));
                plaqueSuggestions.appendChild(button);
            });
            
            showStep(2);

        } catch (error) {
            console.error("Erreur getCode:", error);
            statusMessage.textContent = error.message || "Erreur de communication.";
        } finally {
            getCodeBtn.disabled = false;
        }
    });

    async function submitParking(plaque) {
        statusMessage.textContent = "Enregistrement...";
        try {
            await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify({ action: 'assignCode', code: currentCode, plaque: plaque }),
            });
            showSmsStep(currentCode, plaque);
        } catch (error) {
            console.error("Erreur submitParking:", error);
            statusMessage.textContent = "Erreur d'enregistrement.";
            showStep(2);
        }
    }

    otherPlaqueBtn.addEventListener('click', () => {
        otherPlaqueSection.classList.remove('hidden');
        otherPlaqueBtn.style.display = 'none';
    });

    submitManualPlaqueBtn.addEventListener('click', () => {
        const plaque = plaqueInput.value.trim().toUpperCase();
        if (plaque.match(/^\d-[A-Z]{3}-\d{3}$/)) {
             submitParking(plaque);
        } else {
            alert("Le format de la plaque est incorrect. Il doit être 1-ABC-123.");
        }
    });

    // AMÉLIORATION : Masque de saisie pour la plaque
    plaqueInput.addEventListener('input', (e) => {
        let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        let formattedValue = '';
        if (value.length > 0) formattedValue += value.substring(0, 1);
        if (value.length > 1) formattedValue += '-' + value.substring(1, 4);
        if (value.length > 4) formattedValue += '-' + value.substring(4, 7);
        e.target.value = formattedValue;
    });

    function showSmsStep(code, plaque) {
        const smsBody = `${code} ${plaque}`;
        finalPlaque.textContent = plaque;
        smsText.textContent = smsBody;
        openSmsLink.href = `sms:4411?body=${encodeURIComponent(smsBody)}`;
        statusMessage.textContent = '';
        showStep(3);
    }

    copySmsBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(smsText.textContent).then(() => {
            copySmsBtn.innerHTML = "<i class='bx bx-check'></i> Copié !";
            setTimeout(() => { copySmsBtn.innerHTML = "<i class='bx bx-copy'></i> Copier le texte"; }, 2000);
        });
    });

    // --- Admin Panel Logic ---
    async function addCodes(action, bodyPayload) {
        statusMessage.textContent = "Traitement en cours...";
        toggleAdminPanel(false);
        try {
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'cors',
                body: JSON.stringify({ action, ...bodyPayload }),
            });
            const data = await response.json();
            statusMessage.textContent = data.success ? `✅ ${data.message}` : `❌ ${data.error}`;
        } catch (error) {
            console.error(`Erreur ${action}:`, error);
            statusMessage.textContent = "Erreur de communication.";
        }
    }

    submitTextBtn.addEventListener('click', () => {
        const codes = codesTextarea.value.split('\n').filter(c => c.trim() !== '');
        if (codes.length > 0) {
            addCodes('addCodesFromText', { codes });
        }
    });

    uploadBtn.addEventListener('click', () => {
        const file = imageUploadInput.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const base64Image = event.target.result.split(',')[1];
            addCodes('addCodesFromImage', { imageData: base64Image });
        };
        reader.readAsDataURL(file);
    });

    // Initialize first step
    showStep(1);
});
