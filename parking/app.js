// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !! L'URL DE VOTRE SCRIPT A ÉTÉ INTÉGRÉE CI-DESSOUS !!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwY1AHmB52TDJTerlryEZkwK7nzDrB5YD0w94QwMY-ioyyMkWsnUG-pS0uDBrhLmDKB/exec"; 

// --- DOM Elements ---
const getCodeBtn = document.getElementById('getCodeBtn');
const statusMessage = document.getElementById('statusMessage');

// Step 1
const step1 = document.getElementById('step1');

// Step 2
const step2 = document.getElementById('step2');
const codeDisplay = document.getElementById('codeDisplay');
const plaqueButtons = document.querySelectorAll('.plaque-btn');
const otherPlaqueBtn = document.getElementById('otherPlaqueBtn');
const otherPlaqueSection = document.getElementById('otherPlaqueSection');
const plaqueInput = document.getElementById('plaqueInput');
const submitManualPlaqueBtn = document.getElementById('submitManualPlaqueBtn');

// Step 3
const step3 = document.getElementById('step3');
const finalPlaque = document.getElementById('finalPlaque');
const smsText = document.getElementById('smsText');
const copySmsBtn = document.getElementById('copySmsBtn');
const openSmsLink = document.getElementById('openSmsLink');

// Upload Section
const imageUploadInput = document.getElementById('imageUploadInput');
const uploadBtn = document.getElementById('uploadBtn');

let currentCode = '';

// --- Main App Flow ---

// 1. Get a parking code from the backend
getCodeBtn.addEventListener('click', async () => {
    statusMessage.textContent = "Recherche d'un code...";
    getCodeBtn.disabled = true;
    try {
        const response = await fetch(SCRIPT_URL);
        const data = await response.json();

        if (data.code) {
            currentCode = data.code;
            codeDisplay.textContent = currentCode;
            step1.classList.add('hidden');
            step2.classList.remove('hidden');
            statusMessage.textContent = '';
        } else {
            statusMessage.textContent = data.error || "Erreur : aucun code trouvé.";
            getCodeBtn.disabled = false;
        }
    } catch (error) {
        statusMessage.textContent = "Erreur de communication avec le serveur.";
        getCodeBtn.disabled = false;
    }
});

// 2.A. Handle clicks on suggested plaque buttons
plaqueButtons.forEach(button => {
    button.addEventListener('click', () => {
        const plaque = button.dataset.plaque;
        submitParking(plaque);
    });
});

// 2.B. Handle click on "Other Plaque"
otherPlaqueBtn.addEventListener('click', () => {
    otherPlaqueSection.classList.remove('hidden');
    otherPlaqueBtn.classList.add('hidden'); // Hide the "Other" button itself
});

// 2.C. Handle submission of a manual plaque
submitManualPlaqueBtn.addEventListener('click', () => {
    const plaque = plaqueInput.value.trim().toUpperCase();
    if (!plaque || plaque.length < 5) {
        alert("Veuillez entrer une plaque d'immatriculation valide.");
        return;
    }
    submitParking(plaque);
});

// 3. Submit the chosen plaque to the backend
async function submitParking(plaque) {
    statusMessage.textContent = "Enregistrement en cours...";
    step2.classList.add('hidden'); // Hide selection step

    try {
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // no-cors is often needed for simple POSTs to Apps Script
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ action: 'assignCode', code: currentCode, plaque: plaque }),
        });
        
        // If successful, show the final SMS step
        showSmsStep(currentCode, plaque);
        statusMessage.textContent = '';

    } catch (error) {
        statusMessage.textContent = "❌ Erreur lors de l'enregistrement.";
        step2.classList.remove('hidden'); // Show selection step again on error
    }
}

// 4. Show the final confirmation and SMS helper step
function showSmsStep(code, plaque) {
    const smsBody = `${code} ${plaque}`;
    
    finalPlaque.textContent = plaque;
    smsText.textContent = smsBody;
    
    // Set up the "Open SMS" link for mobile devices
    openSmsLink.href = `sms:4411&body=${encodeURIComponent(smsBody)}`;
    
    // Set up the "Copy" button
    copySmsBtn.addEventListener('click', () => {
        // Use the modern clipboard API
        navigator.clipboard.writeText(smsBody).then(() => {
            copySmsBtn.textContent = 'Copié !';
            setTimeout(() => { copySmsBtn.textContent = 'Copier le texte'; }, 2000);
        }).catch(err => {
            console.error('Could not copy text: ', err);
            alert("La copie a échoué. Veuillez copier le texte manuellement.");
        });
    });
    
    step3.classList.remove('hidden');
}


// --- Logic for Uploading New Codes ---
uploadBtn.addEventListener('click', () => {
    const file = imageUploadInput.files[0];
    if (!file) {
        alert("Veuillez sélectionner un fichier image.");
        return;
    }

    statusMessage.textContent = "Lecture de l'image...";
    uploadBtn.disabled = true;
    const reader = new FileReader();
    
    reader.onload = async (event) => {
        const base64Image = event.target.result.split(',')[1];
        statusMessage.textContent = "🤖 Analyse de l'image par l'IA... (Patientez)";
        
        try {
            // Using no-cors as we don't need to read the response here
            await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ action: 'addCodesFromImage', imageData: base64Image }),
            });
            statusMessage.textContent = "✅ Analyse terminée. Les codes devraient être ajoutés !";
            imageUploadInput.value = "";
            setTimeout(() => { 
                statusMessage.textContent = "Rechargement de l'app...";
                window.location.reload(); 
            }, 3000);

        } catch (error) {
            statusMessage.textContent = "❌ Erreur lors de l'envoi pour analyse.";
            uploadBtn.disabled = false;
        }
    };

    reader.onerror = () => {
        statusMessage.textContent = "❌ Erreur de lecture du fichier image.";
        uploadBtn.disabled = false;
    };

    reader.readAsDataURL(file);
});
