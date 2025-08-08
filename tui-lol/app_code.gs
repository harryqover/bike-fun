/**
 * @OnlyCurrentDoc
 */

// --- CONFIGURATION ---
const env = "sbx"; // Environment: "sbx" (sandbox) or "prd" (production)
const WEB_APP_URL = "https://harryqover.github.io/bike-fun/tui-lol/app.html"; // Your live web app URL

const masterPolicyIds = {
  "sbx": {
    "policyNumber": "M-xxxxx",
    "id": "68934ec4ee1eda6e351cc4b2"
  },
  "prd": {
    "policyNumber": "M-xxxx",
    "id": "xxxx"
  }
};
const SCRIPT_PROPERTIES = PropertiesService.getScriptProperties();
// --- END CONFIGURATION ---


/**
 * Main entry point for the web app.
 * Handles all POST requests.
 * @param {object} e - The event parameter from the web app request.
 * @return {ContentService.TextOutput} The JSON response.
 */
function doPost(e) {
  try {
    const request = JSON.parse(e.postData.contents);
    const action = request.action;
    
    // Public actions that don't require a token
    if (action === 'requestLoginToken') {
      return handleLoginRequest(request.email);
    }
    if (action === 'verifyToken') {
      return verifyToken(request.token);
    }

    // All other actions are protected and require a valid token.
    const user = verifyToken(request.token, true); // Internal verification returns user object or false
    if (!user) {
       throw new Error("Authentication failed: Invalid or expired token.");
    }
    const userEmail = user.email;
    
    let result;
    switch (action) {
      case 'getRiskItems':
        result = getRiskItems(env, masterPolicyIds[env].id, userEmail);
        break;
      case 'postRiskItem':
        result = addSinglePilot(request.payload, userEmail);
        break;
      case 'postBulkRiskItems':
        result = addBulkPilots(request.pilots, userEmail);
        break;
      case 'endorseRiskItem':
        result = endorseRiskItem(env, masterPolicyIds[env].id, request.payload, userEmail);
        break;
      case 'cancelRiskItem':
        result = cancelRiskItem(env, masterPolicyIds[env].id, request.payload, userEmail);
        break;
      case 'upgradeCoverage':
        result = upgradeCoverage(request.payload, userEmail);
        break;
      case 'analyzeBulkUpsert':
        result = analyzeBulkUpsert(request.csvData, userEmail);
        break;
      case 'executeBulkUpsert':
        // CHANGED: Pass the effectiveDate from the request to the function
        result = executeBulkUpsert(request.changes, request.effectiveDate, userEmail);
        break;
      default:
        throw new Error("Invalid action specified.");
    }

    if (result.error) {
      throw new Error(result.responseText || result.error);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: result }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log("Error in doPost: " + error.toString() + " Stack: " + error.stack);
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handles the initial login request from a user.
 * @param {string} email - The email address of the user requesting access.
 * @return {ContentService.TextOutput} JSON response indicating success or failure.
 */
function handleLoginRequest(email) {
  try {
    if (!email) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Email is required.' })).setMimeType(ContentService.MimeType.JSON);
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const userSheet = ss.getSheetByName("Users");
    if (!userSheet) {
      Logger.log("Critical Error: The 'Users' sheet was not found.");
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: "Server configuration error: User database not found." })).setMimeType(ContentService.MimeType.JSON);
    }

    const dataRange = userSheet.getDataRange();
    const values = dataRange.getValues();
    
    let userRow = -1;
    for (let i = 1; i < values.length; i++) { // Start from 1 to skip header
      if (values[i][0] && values[i][0].toLowerCase() === email.toLowerCase()) {
        userRow = i + 1; // Sheet rows are 1-indexed
        break;
      }
    }

    if (userRow === -1) {
      Logger.log(`Login attempt for unauthorized email: ${email}`);
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Email address not authorized.' })).setMimeType(ContentService.MimeType.JSON);
    }

    const token = Utilities.getUuid();
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 6); // Token is valid for 6 hours

    Logger.log(`Generating token for ${email} at row ${userRow}. Token: ${token}`);
    userSheet.getRange(userRow, 2).setValue(token);
    userSheet.getRange(userRow, 3).setValue(expiry);
    
    // Force the changes to be written to the sheet immediately.
    SpreadsheetApp.flush();
    Logger.log(`Token for ${email} should now be saved in the sheet.`);

    const loginLink = `${WEB_APP_URL}?token=${token}`;
    const subject = "Your Secure Login Link for the TUI Portal";
    const body = `
      <p>Hello,</p>
      <p>Please use the link below to securely access the TUI Loss of Licence Portal. This link is valid for 6 hours.</p>
      <p><a href="${loginLink}" style="font-size: 16px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; border-radius: 5px; background-color: #d9002c; border-top: 12px solid #d9002c; border-bottom: 12px solid #d9002c; border-right: 18px solid #d9002c; border-left: 18px solid #d9002c; display: inline-block;">Access Portal</a></p>
      <p>If you did not request this link, please disregard this email.</p>
      <p>Best regards,<br>TUI Team</p>
    `;
    MailApp.sendEmail({
      to: email,
      subject: subject,
      htmlBody: body
    });
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'A login link has been sent to your email.' })).setMimeType(ContentService.MimeType.JSON);
  } catch (e) {
    Logger.log(`Error in handleLoginRequest: ${e.toString()}`);
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: `An unexpected server error occurred: ${e.message}` })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Verifies a token sent from the client.
 * @param {string} token - The authentication token.
 * @param {boolean} internal - If true, returns the user object or false.
 * @return {ContentService.TextOutput|object|boolean} JSON response or user object/boolean for internal checks.
 */
function verifyToken(token, internal = false) {
  try {
    if (!token) {
      const errorResult = { status: 'error', message: 'No token provided.' };
      return internal ? false : ContentService.createTextOutput(JSON.stringify(errorResult)).setMimeType(ContentService.MimeType.JSON);
    }
    
    const userSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Users");
    if (!userSheet) {
      Logger.log("Critical Error: The 'Users' sheet was not found during token verification.");
      const errorResult = { status: 'error', message: 'Server configuration error: User database not found.' };
      return internal ? false : ContentService.createTextOutput(JSON.stringify(errorResult)).setMimeType(ContentService.MimeType.JSON);
    }

    const dataRange = userSheet.getDataRange();
    const values = dataRange.getValues();
    let foundUser = null;
    for (let i = 1; i < values.length; i++) {
      if (values[i][1] === token) {
        foundUser = { row: i + 1, email: values[i][0], token: values[i][1], expiry: new Date(values[i][2]) };
        break;
      }
    }

    if (!foundUser) {
      Logger.log(`Invalid token used for login attempt: ${token}`);
      const errorResult = { status: 'error', message: 'Invalid token.' };
      return internal ? false : ContentService.createTextOutput(JSON.stringify(errorResult)).setMimeType(ContentService.MimeType.JSON);
    }

    if (new Date() > foundUser.expiry) {
      Logger.log(`Expired token used by ${foundUser.email}. Token: ${token}`);
      const errorResult = { status: 'error', message: 'Token has expired.' };
      return internal ? false : ContentService.createTextOutput(JSON.stringify(errorResult)).setMimeType(ContentService.MimeType.JSON);
    }
    
    const successResult = { status: 'success', email: foundUser.email };
    return internal ? foundUser : ContentService.createTextOutput(JSON.stringify(successResult)).setMimeType(ContentService.MimeType.JSON);

  } catch (e) {
    Logger.log(`Error in verifyToken: ${e.toString()}`);
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: `An unexpected server error occurred: ${e.message}` })).setMimeType(ContentService.MimeType.JSON);
  }
}

function analyzeBulkUpsert(csvData, userEmail) {
  Logger.log("Starting bulk upsert analysis for user: " + userEmail);
  const existingData = getRiskItems(env, masterPolicyIds[env].id, userEmail);
  if (existingData.error) {
    throw new Error("Could not fetch existing pilot data for analysis. " + existingData.responseText);
  }

  const existingPilotsMap = new Map();
  if (existingData.items) {
    existingData.items.forEach(p => existingPilotsMap.set(p.reference, p));
  }
  
  const toCreate = [];
  const toUpdate = [];
  const noChange = [];

  const rows = csvData.trim().split('\n');
  rows.forEach(row => {
    const [pilotId, startDate, wageStr, birthdate, gender] = row.split(',').map(s => s.trim());
    if (!pilotId || !startDate || !wageStr || !birthdate || !gender) {
      Logger.log("Skipping invalid CSV row: " + row);
      return;
    }
    const wage = parseFloat(wageStr);
    const newPilotData = { pilotId, startDate, wage, birthdate, gender };

    const existingPilot = existingPilotsMap.get(pilotId);

    if (existingPilot) {
      const existingWage = parseFloat(existingPilot.subject.wage);
      const existingBirthdate = new Date(existingPilot.subject.birthdate).toISOString().split('T')[0];
      
      if (existingWage !== wage || existingBirthdate !== birthdate) {
        toUpdate.push({
          riskItemId: existingPilot.id,
          pilotId: pilotId,
          old: { wage: existingWage, birthdate: existingBirthdate },
          new: { wage: wage, birthdate: birthdate, gender: gender }
        });
     
       } else {
        noChange.push(newPilotData);
      }
    } else {
      toCreate.push(newPilotData);
    }
  });

  Logger.log(`Analysis complete: ${toCreate.length} to create, ${toUpdate.length} to update, ${noChange.length} with no change.`);
  return { toCreate, toUpdate, noChange };
}

// CHANGED: Function signature now accepts effectiveDate
function executeBulkUpsert(changes, effectiveDate, userEmail) {
  Logger.log(`Executing bulk upsert for user: ${userEmail} with effective date: ${effectiveDate}`);
  const { toCreate, toUpdate } = changes;
  let createdCount = 0;
  let updatedCount = 0;
  const errors = [];
  // Create new pilots
  if (toCreate && toCreate.length > 0) {
    toCreate.forEach(pilot => {
      try {
        const result = addSinglePilot(pilot, userEmail);
        if (result.error) {
          throw new Error(result.responseText || result.error);
        }
        createdCount++;
      } catch (e) {
        errors.push({ pilotId: pilot.pilotId, action: 'create', message: e.toString() });
      }
    });
  }

  // Update existing pilots
  if (toUpdate && toUpdate.length > 0) {
    toUpdate.forEach(pilot => {
      try {
        const payload = {
          riskItemId: pilot.riskItemId,
          // CHANGED: Use the provided effectiveDate instead of today's date
          effectiveDate: effectiveDate, 
          subject: {
            wage: pilot.new.wage,
            birthdate: pilot.new.birthdate,
            gender: pilot.new.gender
          },
          reference: pilot.pilotId
        };
        const result = endorseRiskItem(env, masterPolicyIds[env].id, payload, userEmail);
         if (result.error) {
          throw new Error(result.responseText || result.error);
        }
        
        updatedCount++;
      } catch (e) {
        errors.push({ pilotId: pilot.pilotId, action: 'update', message: e.toString() });
      }
    });
  }
  
  Logger.log(`Execution complete: ${createdCount} created, ${updatedCount} updated, ${errors.length} errors.`);
  return { createdCount, updatedCount, errors };
}


/**
 * Creates a new extension policy and links it to the master policy risk item.
 * @param {object} payload - The data from the upgrade modal form.
 * @param {string} userEmail - The email of the user making the request.
 * @return {object} The result of the final patch operation.
 */
function upgradeCoverage(payload, userEmail) {
  // 1. Create the new extension policy
  const policyPayload = {
    partnerId: "688b7e67a2f0f023b0f7c4cf",
    productConfigurationId: "tuilolextension",
    contractPeriod: {
        timeZone: "Europe/Brussels",
        startDate: payload.startDate
    },
    country: "BE",
    language: "en",
    package: {
        name: "standard",
        coverages: {
            licenseLoss: "default"
 
        }
    },
    policyholder: {
        entityType: "ENTITY_TYPE_PERSON",
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        birthdate: payload.birthdate,
        address: {
            street: payload.street,
            number: payload.number,
    
            zip: payload.zip,
            city: payload.city,
            country: "BE"
        }
    },
    subject: {
        pilotId: payload.pilotId,
        insuredAmount: payload.insuredAmount,
        gender: payload.gender
    }
  };
  const newPolicy = postNewPolicy(policyPayload, userEmail);
  if (newPolicy.error || !newPolicy.policyNumber) {
    Logger.log("Failed to create extension policy. Response: " + JSON.stringify(newPolicy));
    throw new Error("Could not create the extension policy. " + (newPolicy.responseText || ""));
  }

  const newPolicyNumber = newPolicy.policyNumber;
  Logger.log(`Successfully created extension policy ${newPolicyNumber} for pilot ${payload.pilotId}`);

  // 2. Patch the original risk item with the new policy number in its metadata
  const riskItemId = payload.riskItemId;
  const metadataPayload = {
    metadata: { policyNumber: newPolicyNumber }
  };
  const patchResult = patchRiskItem(env, masterPolicyIds[env].id, riskItemId, metadataPayload, userEmail);
  if (patchResult.error) {
    Logger.log(`CRITICAL: Created policy ${newPolicyNumber} but failed to patch risk item ${riskItemId}. Response: ${JSON.stringify(patchResult)}`);
    throw new Error(`Extension policy was created (${newPolicyNumber}) but failed to link it. Please contact support. ` + (patchResult.responseText || ""));
  }

  Logger.log(`Successfully patched risk item ${riskItemId} with metadata.`);
  return patchResult;
}

/**
 * Logs API call details to a specific sheet.
 * @param {string} url The URL that was called.
 * @param {object} options The options object sent with the request.
 * @param {number} responseCode The HTTP response code received.
 * @param {string} responseText The raw text of the HTTP response.
 * @param {string} userEmail The email of the user making the request.
 */
function logApiCall(url, options, responseCode, responseText, userEmail) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const logSheetName = "APILogs";
    let logSheet = ss.getSheetByName(logSheetName);

    if (!logSheet) {
      logSheet = ss.insertSheet(logSheetName);
      logSheet.appendRow(["Timestamp", "User", "Method", "URL", "Request Payload", "Response Code", "Response Body"]);
      logSheet.setFrozenRows(1);
    }

    const timestamp = new Date();
    const method = options.method || 'get';
    const requestPayload = typeof options.payload === 'string' ? options.payload : JSON.stringify(options.payload);
    logSheet.appendRow([
      timestamp,
      userEmail || 'N/A',
      method.toUpperCase(),
      url,
      requestPayload || 'N/A',
      responseCode,
      responseText
    ]);
  } catch (e) {
    Logger.log("Failed to log API call to sheet. Error: " + e.toString());
  }
}


/**
 * Generic function to make API calls to Qover.
 * @param {string} url - The API endpoint URL.
 * @param {object} options - The options for UrlFetchApp.
 * @param {string} userEmail - The email of the user making the request.
 * @return {object} The parsed JSON response or an error object.
 */
function fetchQoverApi(url, options, userEmail) {
  if (env === 'prd') {
    const apiKey = SCRIPT_PROPERTIES.getProperty('QOVER_API_KEY_PRD');
    if (!apiKey) {
        const errorMsg = "Production API key not configured.";
        Logger.log(errorMsg);
        logApiCall(url, options, 'N/A', `Configuration Error: ${errorMsg}`, userEmail);
        return { "error": errorMsg };
    }
    options.headers['Authorization'] = "Bearer " + apiKey;
  } else {
    options.headers['Authorization'] = "Bearer sk_B4B9BB9B72E44E264D40";
  }

  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    logApiCall(url, options, responseCode, responseText, userEmail);
    if (responseCode >= 200 && responseCode < 300) {
      return responseText ? JSON.parse(responseText) : {};
    } else {
      Logger.log("API call failed. URL: " + url + " Response Code: " + responseCode + ", Response: " + responseText);
      return { "error": "API call failed", "responseCode": responseCode, "responseText": responseText };
    }
  } catch (e) {
    Logger.log("Error fetching URL: " + url + ". Error: " + e.toString());
    logApiCall(url, options, 'FETCH_ERROR', e.toString(), userEmail);
    return { "error": e.toString() };
  }
}

function addSinglePilot(pilotData, userEmail) {
  const payload = {
    country: "BE", 
    contractPeriod: { startDate: pilotData.startDate },
    subject: {
      wage: pilotData.wage,
      birthdate: pilotData.birthdate,
      gender: pilotData.gender
    },
    reference: pilotData.pilotId
  };
  return postRiskItem(env, masterPolicyIds[env].id, payload, userEmail);
}

function addBulkPilots(pilots, userEmail) {
    const results = [];
    pilots.forEach(pilot => {
        try {
            const result = addSinglePilot(pilot, userEmail);
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

function getRiskItems(env, masterPolicyId, userEmail) {
  const url = `https://api.${env}.qover.io/policies/v1/master-policies/${masterPolicyId}/risk-items?pageSize=1000`;
  const options = { 'method': 'get', 'headers': { 'Accept': 'application/json' }, 'muteHttpExceptions': true };
  return fetchQoverApi(url, options, userEmail);
}

function postRiskItem(env, masterPolicyId, payload, userEmail) {
  const url = `https://api.${env}.qover.io/policies/v1/master-policies/${masterPolicyId}/risk-items`;
  const options = { 'method': 'post', 'contentType': 'application/json', 'payload': JSON.stringify(payload), 'headers': { 'Accept': 'application/json' }, 'muteHttpExceptions': true };
  return fetchQoverApi(url, options, userEmail);
}

function endorseRiskItem(env, masterPolicyId, payload, userEmail) {
    const apiPayload = {
        _effectiveDate: payload.effectiveDate,
        subject: payload.subject,
        reference: payload.reference
    };
    return patchRiskItem(env, masterPolicyId, payload.riskItemId, apiPayload, userEmail);
}

function cancelRiskItem(env, masterPolicyId, payload, userEmail) {
    const url = `https://api.${env}.qover.io/policies/v1/master-policies/${masterPolicyId}/risk-items/${payload.riskItemId}/contract-period`;
    const apiPayload = { endDate: payload.endDate };
    const options = { 'method': 'patch', 'contentType': 'application/json', 'payload': JSON.stringify(apiPayload), 'headers': { 'Accept': 'application/json' }, 'muteHttpExceptions': true };
    return fetchQoverApi(url, options, userEmail);
}

// --- NEW API HELPER FUNCTIONS ---

function postNewPolicy(payload, userEmail) {
  const url = `https://api.${env}.qover.io/policies/v1/policies`;
  const options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify(payload),
    'headers': { 'Accept': 'application/json' },
    'muteHttpExceptions': true
  };
  return fetchQoverApi(url, options, userEmail);
}

function patchRiskItem(env, masterPolicyId, riskItemId, payload, userEmail) {
  const url = `https://api.${env}.qover.io/policies/v1/master-policies/${masterPolicyId}/risk-items/${riskItemId}`;
  const options = {
    'method': 'patch',
    'contentType': 'application/json',
    'payload': JSON.stringify(payload),
    'headers': { 'Accept': 'application/json' },
    'muteHttpExceptions': true
  };
  return fetchQoverApi(url, options, userEmail);
}