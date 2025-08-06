/**
 * @OnlyCurrentDoc
 */

// --- CONFIGURATION ---
const env = "sbx"; // Environment: "sbx" (sandbox) or "prd" (production)

const masterPolicyIds = {
  "sbx": {
    "policyNumber": "M-TLL8143347",
    "id": "6892fffbe7783cd037e339fb"
  },
  "prd": {
    "policyNumber": "M-xxxx", // IMPORTANT: Replace with your production policy number
    "id": "xxxx"             // IMPORTANT: Replace with your production master policy ID
  }
};

const SCRIPT_PROPERTIES = PropertiesService.getScriptProperties();
// IMPORTANT: For 'prd' environment, you must set up authentication.
// This example uses a placeholder. You might need to set API keys as script properties.
// SCRIPT_PROPERTIES.setProperty('QOVER_API_KEY_PRD', 'YOUR_PRODUCTION_API_KEY');

// --- END CONFIGURATION ---


/**
 * Main entry point for the web app. Handles POST requests from the frontend.
 * @param {object} e - The event parameter from the web app request.
 * @return {ContentService.TextOutput} The JSON response.
 */
function doPost(e) {
  try {
    const request = JSON.parse(e.postData.contents);
    const action = request.action;
    let result;

    switch (action) {
      case 'getRiskItems':
        result = getRiskItems(env, masterPolicyIds[env].id);
        break;
      case 'postRiskItem':
        result = addSinglePilot(request.payload);
        break;
      case 'postBulkRiskItems':
        result = addBulkPilots(request.pilots);
        break;
      case 'endorseRiskItem':
        result = endorseRiskItem(env, masterPolicyIds[env].id, request.payload);
        break;
      case 'cancelRiskItem':
        result = cancelRiskItem(env, masterPolicyIds[env].id, request.payload);
        break;
      default:
        throw new Error("Invalid action specified.");
    }

    if (result.error) {
      // The error is already logged by fetchQoverApi, so we just re-throw it.
      throw new Error(result.responseText || result.error);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: result }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log("Error in doPost: " + error.toString());
    // We don't log this error to the sheet as it's likely an internal script error, not an API error.
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Logs API call details to a specific sheet in the active spreadsheet.
 * @param {string} url The URL that was called.
 * @param {object} options The options object sent with the request.
 * @param {number} responseCode The HTTP response code received.
 * @param {string} responseText The raw text of the HTTP response.
 */
function logApiCall(url, options, responseCode, responseText) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const logSheetName = "APILogs";
    let logSheet = ss.getSheetByName(logSheetName);

    // If the sheet doesn't exist, create it and add a header row.
    if (!logSheet) {
      logSheet = ss.insertSheet(logSheetName);
      logSheet.appendRow(["Timestamp", "Method", "URL", "Request Payload", "Response Code", "Response Body"]);
      // Freeze the header row for better readability.
      logSheet.setFrozenRows(1);
    }

    const timestamp = new Date();
    const method = options.method || 'get';
    // Ensure payload is a string for logging.
    const requestPayload = typeof options.payload === 'string' ? options.payload : JSON.stringify(options.payload);

    // Append the log entry as a new row.
    logSheet.appendRow([
      timestamp,
      method.toUpperCase(),
      url,
      requestPayload || 'N/A',
      responseCode,
      responseText
    ]);
  } catch (e) {
    // Log to the standard Apps Script logger if logging to the sheet fails.
    Logger.log("Failed to log API call to sheet. Error: " + e.toString());
  }
}


/**
 * Generic function to make API calls to Qover.
 * @param {string} url - The API endpoint URL.
 * @param {object} options - The options for UrlFetchApp.
 * @return {object} The parsed JSON response or an error object.
 */
function fetchQoverApi(url, options) {
  // --- Authentication based on environment ---
  if (env === 'prd') {
    const apiKey = SCRIPT_PROPERTIES.getProperty('QOVER_API_KEY_PRD');
    if (!apiKey) {
        const errorMsg = "Production API key not configured.";
        Logger.log(errorMsg);
        // Log this configuration error as an attempted call.
        logApiCall(url, options, 'N/A', `Configuration Error: ${errorMsg}`);
        return { "error": errorMsg };
    }
    options.headers['Authorization'] = "Bearer " + apiKey;

  } else {
    options.headers['Authorization'] = "Bearer sk_B4B9BB9B72E44E264D40";
  }
  // --- End Authentication ---

  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    // Log every API call and response
    logApiCall(url, options, responseCode, responseText);

    if (responseCode >= 200 && responseCode < 300) {
      return responseText ? JSON.parse(responseText) : {};
    } else {
      Logger.log("API call failed. URL: " + url + " Response Code: " + responseCode + ", Response: " + responseText);
      return {
        "error": "API call failed",
        "responseCode": responseCode,
        "responseText": responseText
      };
    }
  } catch (e) {
    Logger.log("Error fetching URL: " + url + ". Error: " + e.toString());
    // Log fetch errors to the sheet as well.
    logApiCall(url, options, 'FETCH_ERROR', e.toString());
    return { "error": e.toString() };
  }
}

// --- Functions to build and trigger specific API calls ---

function addSinglePilot(pilotData) {
  const payload = {
    country: "BE", 
    contractPeriod: {
      startDate: pilotData.startDate
    },
    subject: {
      pilotId: pilotData.pilotId,
      wage: pilotData.wage,
      birthdate: pilotData.birthdate,
      gender: pilotData.gender
    }
  };
  return postRiskItem(env, masterPolicyIds[env].id, payload);
}

function addBulkPilots(pilots) {
    const results = [];
    pilots.forEach(pilot => {
        try {
            const result = addSinglePilot(pilot);
            if(result.error) {
               results.push({ status: 'error', pilotId: pilot.pilotId, message: result.responseText || result.error });
            } else {
               results.push({ status: 'success', pilotId: pilot.pilotId, data: result });
            }
        } catch (e) {
            results.push({ status: 'error', pilotId: pilot.pilotId, message: e.toString() });
        }
    });
    return results;
}

function getRiskItems(env, masterPolicyId) {
  const url = `https://api.${env}.qover.io/policies/v1/master-policies/${masterPolicyId}/risk-items?pageSize=1000`;
  const options = {
    'method': 'get',
    'headers': { 'Accept': 'application/json' },
    'muteHttpExceptions': true
  };
  return fetchQoverApi(url, options);
}

function postRiskItem(env, masterPolicyId, payload) {
  const url = `https://api.${env}.qover.io/policies/v1/master-policies/${masterPolicyId}/risk-items`;
  const options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify(payload),
    'headers': { 'Accept': 'application/json' },
    'muteHttpExceptions': true
  };
  return fetchQoverApi(url, options);
}

function endorseRiskItem(env, masterPolicyId, payload) {
    const url = `https://api.${env}.qover.io/policies/v1/master-policies/${masterPolicyId}/risk-items/${payload.riskItemId}`;
    
    // Clean the subject object to remove undefined properties before sending
    const cleanSubject = {};
    for (const key in payload.subject) {
        if (payload.subject[key] !== undefined) {
            cleanSubject[key] = payload.subject[key];
        }
    }

    const apiPayload = {
        _effectiveDate: payload.effectiveDate,
        subject: cleanSubject
    };

    const options = {
        'method': 'patch',
        'contentType': 'application/json',
        'payload': JSON.stringify(apiPayload),
        'headers': { 'Accept': 'application/json' },
        'muteHttpExceptions': true
    };
    return fetchQoverApi(url, options);
}

function cancelRiskItem(env, masterPolicyId, payload) {
    const url = `https://api.${env}.qover.io/policies/v1/master-policies/${masterPolicyId}/risk-items/${payload.riskItemId}/contract-period`;
    const apiPayload = {
        endDate: payload.endDate
    };
    const options = {
        'method': 'patch',
        'contentType': 'application/json',
        'payload': JSON.stringify(apiPayload),
        'headers': { 'Accept': 'application/json' },
        'muteHttpExceptions': true
    };
    return fetchQoverApi(url, options);
}
