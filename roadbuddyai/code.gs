// --- CONFIGURATION ---
const API_KEY = "AIzaSyDfml1kLimj-q0WEsteNYtAEbI43YmdxeQ"; // Your Gemini API Key
const SHEET_NAME = "⛽ Logs Carburant";
const PUSHOVER_USER_KEY = 'uncyanuh6z9nt6x412js4u5svvdiui';
const PUSHOVER_API_TOKEN = 'amsq8312w4io163o4h4fc25b45s4ff';

/**
 * Handles GET requests. Used for fetching initial data.
 * The frontend will call this with a URL parameter like ?action=getLastMileage
 * @param {object} e The event parameter from the HTTP request.
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    let data;

    switch (action) {
      case 'getLastMileage':
        data = getLastMileage();
        break;
      case 'getYearlyCosts':
        data = getYearlyCosts();
        break;
      case 'getConsumptionHistory':
        data = getConsumptionHistory();
        break;
      default:
        throw new Error("Invalid GET action specified.");
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: data }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handles POST requests. Used for submitting data.
 * The frontend will send a JSON payload with an 'action' and 'payload'.
 * @param {object} e The event parameter from the HTTP request.
 */
function doPost(e) {
  try {
    const request = JSON.parse(e.postData.contents);
    const action = request.action;
    const payload = request.payload;
    let responseData;

    switch (action) {
      case 'logData':
        responseData = logData(payload);
        break;
      case 'getGamificationMessage':
        responseData = { message: getGamificationMessage(payload) };
        break;
      case 'extractDataFromImage':
        // This function returns a stringified JSON, so we parse it to embed in our response
        responseData = JSON.parse(extractDataFromImage(payload.base64ImageData));
        break;
      default:
        throw new Error("Invalid POST action specified.");
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: responseData }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}


// --- DATA FUNCTIONS ---
// These are your original functions, mostly unchanged. They just return raw data
// instead of JSON strings now.

function getYearlyCosts() {
  // This function is the same as your original.
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet || sheet.getLastRow() <= 1) {
      return { qover: 0, personnel: 0 };
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const dateIndex = headers.indexOf("Date");
    const costIndex = headers.indexOf("Coût Total (€)");
    const paidByIndex = headers.indexOf("Payé par");

    if (dateIndex === -1 || costIndex === -1 || paidByIndex === -1) {
      throw new Error("Missing required columns in the sheet: Date, Coût Total (€), or Payé par.");
    }

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    let qoverTotal = 0;
    let personnelTotal = 0;

    const parseFrenchDate = (dateString) => {
        if (dateString instanceof Date) return dateString;
        if (typeof dateString !== 'string' || !dateString.includes('/')) return null;
        const parts = dateString.split(' ')[0].split('/'); 
        if (parts.length !== 3) return null;
        return new Date(parts[2], parts[1] - 1, parts[0]);
    };

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowDate = parseFrenchDate(row[dateIndex]);
      
      if (rowDate && rowDate >= twelveMonthsAgo) {
        const costString = String(row[costIndex]).replace(',', '.');
        const cost = parseFloat(costString);

        if (!isNaN(cost)) {
          if (row[paidByIndex] === 'Qover') {
            qoverTotal += cost;
          } else if (row[paidByIndex] === 'Personnel') {
            personnelTotal += cost;
          }
        }
      }
    }
    
    return { 
      qover: parseFloat(qoverTotal.toFixed(2)), 
      personnel: parseFloat(personnelTotal.toFixed(2)) 
    };

  } catch (e) {
    console.error("Error in getYearlyCosts: " + e.toString());
    return { qover: 0, personnel: 0 };
  }
}

function extractDataFromImage(base64ImageData) {
  // This function is the same as your original.
  if (!API_KEY || API_KEY === "YOUR_GEMINI_API_KEY") {
    return JSON.stringify({ error: "La clé API Gemini n'est pas configurée dans le script." });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
  const prompt = `Analyse cette image d'un écran de pompe à essence. Extrait le PRIX total en euros, le VOLUME en litres, et le PRIX AU LITRE. Réponds uniquement avec un objet JSON valide au format suivant : {"totalCost": nombre, "liters": nombre, "pricePerLiter": nombre}. Les nombres doivent utiliser un point comme séparateur décimal. Si une valeur n'est pas visible, mets sa valeur à 0.`;
  const payload = {
    contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType: 'image/png', data: base64ImageData } }] }]
  };
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseBody = response.getContentText();

    if (responseCode === 200) {
      const data = JSON.parse(responseBody);
      if (data.candidates && data.candidates.length > 0) {
        const textResponse = data.candidates[0].content.parts[0].text;
        const jsonMatch = textResponse.match(/\{.*\}/);
        if (jsonMatch) return jsonMatch[0];
      }
    }
    Logger.log(`Gemini API Error (Code: ${responseCode}): ${responseBody}`);
    return JSON.stringify({ error: "L'IA n'a pas pu extraire les données. Réponse invalide." });

  } catch (e) {
    Logger.log("Failed to call Gemini API: " + e.toString());
    return JSON.stringify({ error: "Impossible de contacter l'IA pour le moment." });
  }
}

function getLastMileage() {
  // This function is the same as your original.
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet || sheet.getLastRow() <= 1) return 0;
    return sheet.getRange(sheet.getLastRow(), 2).getValue();
  } catch (error) {
    console.error("Error in getLastMileage: " + error.toString());
    return 0;
  }
}

function getConsumptionHistory() {
  // This function is the same as your original.
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet || sheet.getLastRow() <= 2) return [];

    const data = sheet.getDataRange().getValues();
    const essenceEntries = data.slice(1).filter(row => row[2] === 'Essence' && row[3] > 0);

    if (essenceEntries.length < 2) return [];

    const history = [];
    for (let i = 1; i < essenceEntries.length; i++) {
      const prevEntry = essenceEntries[i - 1];
      const currentEntry = essenceEntries[i];
      const distance = currentEntry[1] - prevEntry[1];
      const liters = prevEntry[3];
      if (distance > 0 && liters > 0) {
        const consumption = (liters / distance) * 100;
        history.push(parseFloat(consumption.toFixed(2)));
      }
    }
    return history.slice(-10);
  } catch (e) {
    console.error("Error in getConsumptionHistory: " + e.toString());
    return [];
  }
}

function getGamificationMessage(formData) {
  // This function is the same as your original.
  if (API_KEY === "YOUR_GEMINI_API_KEY" || API_KEY === "") {
    return "Pensez à configurer votre clé API Gemini dans le script pour activer les messages IA !";
  }
  
  let context = "";

  if (formData.fuelType === 'Électricité') {
    context = `L'utilisateur vient de faire une recharge électrique. Le kilométrage actuel est ${formData.mileage} km.`;
  } else if (formData.fuelType === 'Essence' && formData.liters > 0) {
    const consumption = getConsumptionInfo(formData.mileage, formData.liters);
    if (consumption) {
      context = `L'utilisateur vient de faire le plein d'essence. Sa consommation calculée est de ${consumption.current} L/100km.`;
      if (consumption.previous) {
        const diff = parseFloat(consumption.current) - parseFloat(consumption.previous);
        if (diff < -0.1) context += ` C'est une super amélioration par rapport à son précédent plein qui était de ${consumption.previous} L/100km !`;
        else if (diff > 0.1) context += ` C'est un peu plus que son dernier plein (${consumption.previous} L/100km).`;
        else context += ` C'est quasiment identique à son dernier plein (${consumption.previous} L/100km).`;
      } else {
        context += " C'est la première consommation qu'on enregistre, une excellente donnée de base pour la suite !";
      }
    } else {
      context = "L'utilisateur vient de faire le plein d'essence, mais nous n'avons pas encore assez de données pour analyser sa consommation.";
    }
  }

  const prompt = `Tu es un coach automobile amusant et motivant pour le conducteur d'une Skoda Octavia Hybride. Rédige **un seul et unique message** (une ou deux phrases maximum) pour le conducteur en te basant **uniquement** sur le contexte suivant. Ton ton doit être comique et encourageant. Utilise des emojis. Ne donne jamais d'options ou de liste. Contexte : "${context}"`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
  const payload = { contents: [{ parts: [{ text: prompt }] }] };
  const options = { method: 'post', contentType: 'application/json', payload: JSON.stringify(payload), muteHttpExceptions: true };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseBody = response.getContentText();

    if (responseCode === 200) {
      const data = JSON.parse(responseBody);
      if (data.candidates && data.candidates.length > 0) {
        return data.candidates[0].content.parts[0].text.trim();
      }
    }
    console.error(`Gemini API Error (Code: ${responseCode}): ${responseBody}`);
    return "Bien joué ! Chaque enregistrement est une victoire !";
    
  } catch (e) {
    console.error("Failed to call Gemini API: " + e.toString());
    return "Impossible de contacter l'IA pour le moment.";
  }
}

function logData(formData) {
  // Modified to return an object instead of a string
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      const headers = ["Date", "Kilométrage (km)", "Type de Carburant", "Litres (L)", "Prix/Litre (€)", "Coût Total (€)", "Payé par", "Latitude", "Longitude"];
      sheet.appendRow(headers);
      sheet.getRange("A1:I1").setFontWeight("bold").setBackground("#4a5568").setFontColor("#ffffff");
      sheet.setFrozenRows(1);
    }

    const newRow = [new Date(), formData.mileage, formData.fuelType, formData.liters, formData.pricePerLiter, formData.totalCost, formData.paidBy, formData.latitude, formData.longitude];
    sheet.appendRow(newRow);

    let notificationMessage = "";
    if (formData.fuelType === 'Essence') {
      notificationMessage = `Plein ⛽: ${formData.liters} L pour ${formData.totalCost} €.\nKM: ${formData.mileage}.\nPayé par: ${formData.paidBy}.`;
    } else {
      notificationMessage = `Recharge 🔌 enregistrée à ${formData.mileage} km.\nPayé par: ${formData.paidBy}.`;
      createChargeReminderTrigger(formData);
    }
    sendPushoverNotification(notificationMessage);

    return { status: 'success', message: 'Données enregistrées !' };

  } catch (error) {
    console.error("Error in logData: " + error.toString());
    return { status: 'error', message: 'Erreur: ' + error.message };
  }
}

function getConsumptionInfo(newMileage, newLiters) {
  // This function is the same as your original.
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet || sheet.getLastRow() <= 1) return null;

    const data = sheet.getDataRange().getValues();
    const essenceEntries = data.slice(1).filter(row => row[2] === 'Essence');

    if (essenceEntries.length < 1) return null;

    const lastEssenceEntry = essenceEntries[essenceEntries.length - 1];
    const km_prev1 = lastEssenceEntry[1];
    const liters_prev1 = lastEssenceEntry[3];
    const distance_current = newMileage - km_prev1;

    if (distance_current <= 0) return null;

    const currentConsumption = (liters_prev1 / distance_current) * 100;

    if (essenceEntries.length < 2) {
      return { current: currentConsumption.toFixed(2), previous: null };
    }

    const prevEssenceEntry = essenceEntries[essenceEntries.length - 2];
    const km_prev2 = prevEssenceEntry[1];
    const distance_previous = km_prev1 - km_prev2;

    if (distance_previous <= 0) {
       return { current: currentConsumption.toFixed(2), previous: null };
    }
    
    const liters_prev2 = prevEssenceEntry[3];
    const previousConsumption = (liters_prev2 / distance_previous) * 100;

    return {
      current: currentConsumption.toFixed(2),
      previous: previousConsumption.toFixed(2)
    };

  } catch (e) {
    console.error("Error in getConsumptionInfo: " + e.toString());
    return null;
  }
}

// --- NOTIFICATION AND REMINDER FUNCTIONS ---
// These functions are the same as your original.

function createChargeReminderTrigger(formData) {
  if (formData.latitude && formData.longitude) {
    const triggerTime = new Date(Date.now() + (4.5 * 60 * 60 * 1000));
    const trigger = ScriptApp.newTrigger('sendChargingReminder').timeBased().at(triggerTime).create();
    const triggerUid = trigger.getUniqueId();
    const reminderData = { latitude: formData.latitude, longitude: formData.longitude };
    PropertiesService.getUserProperties().setProperty(triggerUid, JSON.stringify(reminderData));
    Logger.log(`Reminder trigger created with UID: ${triggerUid}`);
  }
}

function sendChargingReminder(e) {
  const triggerUid = e.triggerUid;
  if (!triggerUid) {
    Logger.log("sendChargingReminder was called without a trigger UID.");
    return;
  }

  const reminderDataString = PropertiesService.getUserProperties().getProperty(triggerUid);

  if (reminderDataString) {
    const reminderData = JSON.parse(reminderDataString);
    const { latitude, longitude } = reminderData;
    const message = "La recharge est probablement terminée. Pensez à déplacer le véhicule !";
    const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
    sendPushoverNotification(message, mapsUrl);
    
    PropertiesService.getUserProperties().deleteProperty(triggerUid);
    const allTriggers = ScriptApp.getProjectTriggers();
    for (const trigger of allTriggers) {
      if (trigger.getUniqueId() === triggerUid) {
        ScriptApp.deleteTrigger(trigger);
        Logger.log(`Deleted trigger with UID: ${triggerUid}`);
        break;
      }
    }
  } else {
    Logger.log(`No data found for trigger UID: ${triggerUid}.`);
  }
}

function sendPushoverNotification(message, url = null) {
  var userKey = PUSHOVER_USER_KEY;
  var apiToken = PUSHOVER_API_TOKEN;
  var apiUrl = 'https://api.pushover.net/1/messages.json';

  var payload = {
    'user': userKey,
    'token': apiToken,
    'title': 'RoadBuddy AI',
    'message': message
  };
  
  if (url) {
      payload.url = url;
      payload.url_title = "Voir sur la carte";
      payload.title = "🔌 Rappel de recharge";
  }

  var options = {
    'method': 'post',
    'contentType': 'application/x-www-form-urlencoded',
    'payload': payload,
    'muteHttpExceptions': true
  };

  try {
    UrlFetchApp.fetch(apiUrl, options);
  } catch (e) {
    Logger.log('Error sending Pushover notification: ' + e.toString());
  }
}
