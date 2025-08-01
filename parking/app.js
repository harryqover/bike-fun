// L'URL de votre script est déjà intégrée
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwY1AHmB52TDJTerlryEZkwK7nzDrB5YD0w94QwMY-ioyyMkWsnUG-pS0uDBrhLmDKB/exec"; 

// --- DOM Elements ---
const getCodeBtn = document.getElementById('getCodeBtn');
const statusMessage = document.getElementById('statusMessage');
const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const codeDisplay = document.getElementById('codeDisplay');
const plaqueButtons = document.querySelectorAll('.plaque-btn');
const otherPlaqueBtn = document.getElementById('otherPlaqueBtn');
const otherPlaqueSection = document.getElementById('otherPlaqueSection');
const plaqueInput = document.getElementById('plaqueInput');
const submitManualPlaqueBtn = document.getElementById('submitManualPlaqueBtn');
const step3 = document.getElementById('step3');
const finalPlaque = document.getElementById('finalPlaque');
const smsText = document.getElementById('smsText');
const copySmsBtn = document.getElementById('copySmsBtn');
const openSmsLink = document.getElementById('openSmsLink');
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

        // AMÉLIORATION : Vérifie si la réponse du serveur est une erreur
        if (!response.ok) {
            const errorText = await response.text();
            // Affiche l'erreur réelle du script si possible
            throw new Error(`Le serveur a répondu avec une erreur: ${response.status}. Réponse: ${errorText}`);
        }

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
        // Affiche une erreur plus utile dans la console du navigateur (F12)
        console.error("Détail de l'erreur lors de la récupération du code:", error);
        statusMessage.textContent = "Erreur de communication. Vérifiez la console (F12).";
        getCodeBtn.disabled = false;
    }
});

// Le reste du fichier app.js reste identique...

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
    otherPlaqueBtn.classList.add('hidden');
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
    step2.classList.add('hidden');

    try {
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ action: 'assignCode', code: currentCode, plaque: plaque }),
        });
        
        showSmsStep(currentCode, plaque);
        statusMessage.textContent = '';

    } catch (error) {
        console.error("Erreur lors de la soumission:", error);
        statusMessage.textContent = "❌ Erreur lors de l'enregistrement.";
        step2.classList.remove('hidden');
    }
}

// 4. Show the final confirmation and SMS helper step
function showSmsStep(code, plaque) {
    const smsBody = `${code} ${plaque}`;
    finalPlaque.textContent = plaque;
    smsText.textContent = smsBody;
    openSmsLink.href = `sms:4411&body=${encodeURIComponent(smsBody)}`;
    
    copySmsBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(smsBody).then(() => {
            copySmsBtn.textContent = 'Copié !';
            setTimeout(() => { copySmsBtn.textContent = 'Copier le texte'; }, 2000);
        }).catch(err => {
            console.error('Could not copy text: ', err);
            alert("La copie a échoué.");
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
        statusMessage.textContent = "🤖 Analyse de l'image par l'IA...";
        
        try {
            await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ action: 'addCodesFromImage', imageData: base64Image }),
            });
            statusMessage.textContent = "✅ Analyse terminée !";
            imageUploadInput.value = "";
            setTimeout(() => { 
                statusMessage.textContent = "Rechargement...";
                window.location.reload(); 
            }, 3000);

        } catch (error) {
            statusMessage.textContent = "❌ Erreur lors de l'analyse.";
            uploadBtn.disabled = false;
        }
    };

    reader.onerror = () => {
        statusMessage.textContent = "❌ Erreur de lecture du fichier.";
        uploadBtn.disabled = false;
    };

    reader.readAsDataURL(file);
});
