document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwY1AHmB52TDJTerlryEZkwK7nzDrB5YD0w94QwMY-ioyyMkWsnUG-pS0uDBrhLmDKB/exec";

    // --- DOM Elements ---
    const getCodeBtn = document.getElementById('getCodeBtn');
    const statusMessage = document.getElementById('statusMessage');
    
    const steps = document.querySelectorAll('.step');
    const codeDisplay = document.getElementById('codeDisplay');
    const plaqueButtons = document.querySelectorAll('.plaque-btn');
    const otherPlaqueBtn = document.getElementById('otherPlaqueBtn');
    const otherPlaqueSection = document.getElementById('otherPlaqueSection');
    const plaqueInput = document.getElementById('plaqueInput');
    const submitManualPlaqueBtn = document.getElementById('submitManualPlaqueBtn');
    
    const finalPlaque = document.getElementById('finalPlaque');
    const smsText = document.getElementById('smsText');
    const copySmsBtn = document.getElementById('copySmsBtn');
    const openSmsLink = document.getElementById('openSmsLink');

    // Admin Panel Elements
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
        if (show) {
            overlay.classList.add('active');
            adminPanel.classList.add('active');
        } else {
            overlay.classList.remove('active');
            adminPanel.classList.remove('active');
        }
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
        statusMessage.textContent = "Recherche d'un code...";
        getCodeBtn.disabled = true;
        try {
            const response = await fetch(SCRIPT_URL);
            if (!response.ok) throw new Error(`Erreur serveur: ${response.status}`);
            const data = await response.json();
            if (data.code) {
                currentCode = data.code;
                codeDisplay.textContent = currentCode;
                showStep(2);
            } else {
                statusMessage.textContent = data.error || "Aucun code trouvé.";
            }
        } catch (error) {
            console.error("Erreur getCode:", error);
            statusMessage.textContent = "Erreur de communication.";
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
            showStep(2); // Revenir à l'étape de sélection
        }
    }

    plaqueButtons.forEach(button => {
        button.addEventListener('click', () => submitParking(button.dataset.plaque));
    });

    otherPlaqueBtn.addEventListener('click', () => {
        otherPlaqueSection.classList.remove('hidden');
        otherPlaqueBtn.style.display = 'none';
    });

    submitManualPlaqueBtn.addEventListener('click', () => {
        const plaque = plaqueInput.value.trim().toUpperCase();
        if (plaque) submitParking(plaque);
    });

    function showSmsStep(code, plaque) {
        const smsBody = `${code} ${plaque}`;
        finalPlaque.textContent = plaque;
        smsText.textContent = smsBody;
        // CORRECTION: Utilisation de '?' comme premier séparateur de paramètre
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
    submitTextBtn.addEventListener('click', async () => {
        const codes = codesTextarea.value.split('\n').filter(c => c.trim() !== '');
        if (codes.length === 0) {
            alert("Veuillez coller des codes.");
            return;
        }
        statusMessage.textContent = `Ajout de ${codes.length} codes...`;
        toggleAdminPanel(false);
        try {
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'cors',
                body: JSON.stringify({ action: 'addCodesFromText', codes: codes }),
            });
            const data = await response.json();
            if (data.success) {
                statusMessage.textContent = `✅ ${data.message}`;
            } else {
                statusMessage.textContent = `❌ ${data.error}`;
            }
        } catch (error) {
            console.error("Erreur addCodesFromText:", error);
            statusMessage.textContent = "Erreur de communication.";
        }
    });

    uploadBtn.addEventListener('click', () => {
        const file = imageUploadInput.files[0];
        if (!file) {
            alert("Sélectionnez une image.");
            return;
        }
        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64Image = event.target.result.split(',')[1];
            statusMessage.textContent = "🤖 Analyse de l'image...";
            toggleAdminPanel(false);
            try {
                const response = await fetch(SCRIPT_URL, {
                    method: 'POST',
                    mode: 'cors',
                    body: JSON.stringify({ action: 'addCodesFromImage', imageData: base64Image }),
                });
                const data = await response.json();
                if (data.success) {
                    statusMessage.textContent = `✅ ${data.message}`;
                } else {
                    statusMessage.textContent = `❌ ${data.error}`;
                }
            } catch (error) {
                console.error("Erreur addCodesFromImage:", error);
                statusMessage.textContent = "Erreur de communication.";
            }
        };
        reader.readAsDataURL(file);
    });

    // Initialize first step
    showStep(1);
});
