/*20250403 0913*/
console.log("20250403 1550")
const isValidEmail = (str) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);

const productPattern = [
  { PatternPrefix: "xx20", Product: "IAB" },
  { PatternPrefix: "xx10", Product: "BIKE" },
  { PatternPrefix: "BE08", Product: "COWBOY" },
  { PatternPrefix: "NL01", Product: "COWBOY" },
  { PatternPrefix: "DE01", Product: "COWBOYDE" },
  { PatternPrefix: "FR03", Product: "COWBOY" },
  { PatternPrefix: "xx31", Product: "PLEV" },
  { PatternPrefix: "BE07", Product: "TENANT" },
  { PatternPrefix: "P-MICAT", Product: "MIC" },
  { PatternPrefix: "P-MICDE", Product: "MIC" },
  { PatternPrefix: "P-VDMIE", Product: "VDM" },
  { PatternPrefix: "P-BMMIE", Product: "BMM" },
  { PatternPrefix: "M-ASG", Product: "ASG" }
];

const cowboyAlteosIds = [
  "5ff6cf4fceba6039aadb446f",
  "60938efba79100e71519a03b",
  "607937e4654780240a132641",
  "61b1b145415df342d60f4e0f",
  "61b1c260415df342d60f4e10",
  "60a75f9f987d3f484ed24ef4"
];

const redirectConfig = [
  { product: "BIKE", claimProcess: "CowboyAlteos", Redirect: "https://forms.qover.com/213533942109352?language={{lang}}&variant={{variant}}&email={{email}}&contract_number={{cigarId}}&claims_handler=Alteos" },
  { product: "COWBOYDE", claimProcess: "CowboyAlteos", Redirect: "https://forms.qover.com/213533942109352?language={{lang}}&variant={{variant}}&email={{email}}&contract_number={{cigarId}}&claims_handler=Alteos" },
  { product: "COWBOY", claimProcess: "bikeQover", Redirect: "https://forms.qover.com/212795616223356?language={{lang}}&variant={{variant}}&email={{email}}&contract_number={{cigarId}}&claims_handler=Qover" },
  { product: "BIKE", claimProcess: "bikeQover", Redirect: "https://forms.qover.com/212795616223356?language={{lang}}&variant={{variant}}&email={{email}}&contract_number={{cigarId}}&claims_handler=Qover&ref_country={{country}}" },
  { product: "IAB", claimProcess: "teslaWakam", Redirect: "https://insuremytesla.qover.com/claims?language={{lang}}&variant={{variant}}&claimant_email={{email}}&policy_reference={{cigarId}}&claims_handler=Crawford&ref_country={{country}}" },
  { product: "IAB", claimProcess: "teslaHelvetia", Redirect: "https://insuremytesla.qover.com/claims?language={{lang}}&variant={{variant}}&claimant_email={{email}}&policy_reference={{cigarId}}&claims_handler=VanAmeyde&ref_country={{country}}" },
  { product: "PLEV", claimProcess: "PLEV", Redirect: "https://carrefour-assurance.qover.com/declaration-de-sinistre?language=fr&claimant_email={{email}}&contract_number={{cigarId}}&partner=634e5fe8c9833bb23bd94be9&variant={{variant}}" },
  { product: "TENANT", claimProcess: "TENANT", Redirect: "https://forms.qover.com/222193789305361?tpa=Baloise" },
  { product: "IAB", claimProcess: "iabHelvetia", Redirect: "https://forms.qover.com/233112828692357?product=IAB&language={{lang}}&variant={{variant}}&email={{email}}&policy_reference={{cigarId}}&tpa_name=Van%20Ameyde" },
  { product: "MIC", claimProcess: "MIC", Redirect: "https://forms.qover.com/233112828692357?product=microlino&ref_country={{country}}&tpa_name=Van%20Ameyde&policy_reference={{cigarId}}" },
  { product: "VDM", claimProcess: "VDM", Redirect: "https://forms.qover.com/233112828692357?product=volvo&ref_country=IE&tpa_name=RedClick&policy_reference={{cigarId}}" },
  { product: "BMM", claimProcess: "BMM", Redirect: "https://forms.qover.com/233112828692357?product=bmwmini&ref_country=IE&tpa_name=Crawford&policy_reference={{cigarId}}" },
  { product: "ASG", claimProcess: "ASG", Redirect: "https://forms.qover.com/242413491528961/prefill/67fe4f60393237229158d3c207e1?claimant_email={{email}}&policy_id={{cigarId}}" }
];

const modalContent = {
  BIKE: `
    <p>Make sure you have these elements in your possession before you continue:</p>
    <ul>
      <li>Invoice of your bike</li>
      <li>Your IBAN (and/or RIB in France)</li>
      <li>If your bike has an additional marking (Bicycode, Paravol, ...), we need the marking ID</li>
    </ul>
    <p><strong>Specific in case of material damage:</strong></p>
    <ul>
      <li>Pictures of the damaged bike</li>
      <li>If there is a third party involved, the information of that third party</li>
    </ul>
    <p><strong>Specific in case of theft:</strong></p>
    <ul>
      <li>The copy of the police report</li>
      <li>The brand and the model of your lock</li>
      <li>If you have a GPS tracker on your bike, a screenshot of the last location</li>
    </ul>
  `,
  IAB: `
    <p>Please ensure you have the following items:</p>
    <ul>
      <li>A description of the incident</li>
      <li>Accident Form (if available)</li>
      <li>Pictures of damaged car(s) (if applicable)</li>
    </ul>
  `,
  PLEV: `<p>Have your invoice and any police reports ready if applicable.</p>`,
  TENANT: `<p>Make sure you have your lease agreement and any incident documentation.</p>`,
  MIC: `<p>Have your policy document and proof of incident ready.</p>`,
  VDM: `<p>Prepare a claim report and supporting documents.</p>`,
  BMM: `<p>Make sure to gather your agreement details and relevant photos.</p>`
};

const translations = {
  en: {
    modalTitle: "Before you continue...",
    confirm: "Continue",
    loading: "Loading...",
    errorTitle: "An error occurred",
    missingProduct: "Unable to detect product from contract reference.",
    missingRedirect: "No redirect configured for this product.",
    emailMismatch: "The email address does not match the contract reference. Please verify and try again.",
    contractNotFound: "We couldn't find your contract. Please verify your contract reference and email address."
  },
  fr: {
    modalTitle: "Avant de continuer...",
    confirm: "Continuer",
    loading: "Chargement...",
    errorTitle: "Une erreur s'est produite",
    missingProduct: "Produit non reconnu depuis la référence de contrat.",
    missingRedirect: "Aucune redirection configurée pour ce produit.",
    emailMismatch: "L'adresse email ne correspond pas à la référence de contrat. Veuillez vérifier.",
    contractNotFound: "Nous n'avons pas trouvé votre contrat. Vérifiez votre référence et votre email."
  },
  nl: {
    modalTitle: "Voor je verdergaat...",
    confirm: "Doorgaan",
    loading: "Laden...",
    errorTitle: "Er is een fout opgetreden",
    missingProduct: "Kan product niet afleiden uit contractreferentie.",
    missingRedirect: "Geen redirect geconfigureerd voor dit product.",
    emailMismatch: "Het e-mailadres komt niet overeen met het contractnummer.",
    contractNotFound: "We konden je contract niet vinden. Controleer je gegevens."
  }
};

function translateOld() {
  var l = $('#state').find(":selected").val();
  $("[trans-key='sorry']").text(claimsTranslation[l].sorry);
  $("[trans-key='fillininformation']").text(claimsTranslation[l].fillininformation);
  $("[trans-key='reportincident']").text(claimsTranslation[l].reportincident);
  $("[trans-key='helptextcigarid']").text(claimsTranslation[l].helptextcigarid);
  $("[trans-key='issuecontactus']").html(claimsTranslation[l].issuecontactus);
  $("[trans-key='submit']").text(claimsTranslation[l].submit);
  $("[trans-key='titlepartners']").text(claimsTranslation[l].titlepartners);
  $("[trans-key='subtitlepartners']").text(claimsTranslation[l].subtitlepartners);
  getTranslation();
}

function getTranslation(){
  var lang = $('#state').find(":selected").val();
  var rand = Math.random();
  let xhrLocales = new XMLHttpRequest();
  xhrLocales.open("get", "https://translations.qover.com/widget/" + lang + "-raw.json?cache="+rand, true);
  xhrLocales.setRequestHeader("Cache-Control", "max-age=3600");
  xhrLocales.onreadystatechange = function() {
  if (xhrLocales.readyState == 4) {
    if (xhrLocales.status >= 200 && xhrLocales.status < 300 || xhrLocales.status == 304) {
      translation = JSON.parse(xhrLocales.responseText);
      window.claimsTranslation = translation;
    }
  }
  };
  xhrLocales.send();
}

setTimeout(function(){
  $("#email").val(getParameterByName("email"));
  $("#cigardid").val(getParameterByName("contract"));
  getTranslation();
 },2500);

function findPaperform() {
  const cigarId = document.querySelector("#cigardid").value.trim();
  const email = document.querySelector("#email").value.trim();
  const lang = document.querySelector("#state")?.value || "en";
  if (isValidEmail(email)){
    handleRedirectFlow(cigarId, email, lang);
  } else {
    $("#btnToPaperform").after("<p>Should be a valid email</p>");
  }
}


function translate(key, lang = "en") {
  return translations[lang]?.[key] || translations.en[key] || key;
}

function extractPrefix(contractRef) {
  const match = contractRef.match(/^([A-Z]{2}\d{2})/);
  if (match) return match[1];
  //const policyMatch = contractRef.match(/^(P\-[A-Z]+)/);
  const policyMatch = contractRef.match(/^([PM]\-[A-Z]+)/);
  return policyMatch ? policyMatch[1] : null;
}

function identifyProduct(contractRef) {
  const prefix = extractPrefix(contractRef);
  let match = productPattern.find(p => p.PatternPrefix === prefix);
  if (!match && prefix && prefix.length === 4) {
    const wildcardPrefix = 'xx' + prefix.slice(2);
    match = productPattern.find(p => p.PatternPrefix === wildcardPrefix);
  }
  return match ? match.Product : null;
}

function getRedirectTemplate(product, claimProcess) {
  const entry = redirectConfig.find(r => r.product === product && r.claimProcess === claimProcess);
  return entry ? entry.Redirect : null;
}

function buildRedirectUrl(template, data) {
  console.log("data buildRedirectUrl: ", data)
  return template
    .replace("{{lang}}", data.lang)
    .replace("{{variant}}", data.variant || "")
    .replace("{{email}}", encodeURIComponent(data.email))
    .replace("{{cigarId}}", data.cigarId)
    .replace("{{country}}", data.country);
}

let preFetchedData = null;

function showClaimModal(product, onConfirm, isLoading = false) {
  const modalText = modalContent[product] || "<p>Please ensure you have the necessary documents ready before proceeding.</p>";

  const modal = document.createElement("div");
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.background = "rgba(0,0,0,0.6)";
  modal.style.display = "flex";
  modal.style.justifyContent = "center";
  modal.style.alignItems = "center";
  modal.style.zIndex = "9999";

  modal.innerHTML = `
    <style>
      .loader {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3498db;
        border-radius: 50%;
        width: 16px;
        height: 16px;
        animation: spin 1s linear infinite;
        display: inline-block;
        margin-left: 8px;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      #confirmBtn {
        margin-top: 1rem;
        padding: 0.75rem 1.5rem;
        font-size: 1rem;
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.3s ease, box-shadow 0.3s ease;
      }

      #confirmBtn:hover:not(:disabled) {
        background-color: #2980b9;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      }

      #confirmBtn:disabled {
        background-color: #ccc;
        cursor: not-allowed;
      }
    </style>
    <div style="background: white; padding: 2rem; border-radius: 10px; text-align: left; max-width: 500px;">
      <h2 style="margin-top: 0;">Before you continue...</h2>
      ${modalText}
      <div style="text-align: center;">
        <button id="confirmBtn" style="margin-top: 1rem; padding: 0.5rem 1rem;" ${isLoading ? "disabled" : ""}>
          Continue
          <span id="loadingSpinner" class="loader" style="${isLoading ? "display: inline-block;" : "display: none;"}"></span>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const btn = modal.querySelector("#confirmBtn");
  const spinner = modal.querySelector("#loadingSpinner");

  btn.addEventListener("click", () => {
    spinner.style.display = "inline-block";
    btn.disabled = true;
    onConfirm(() => {
      modal.remove();
    });
  });

  // Return a reference to update loading state later if needed
  return {
    modal,
    setLoading: (loading) => {
      spinner.style.display = loading ? "inline-block" : "none";
      btn.disabled = loading;
    }
  };
}



function getBikeRedirect(cigarId, email, lang, callback) {
  if (preFetchedData?.product === "BIKE") {
    callback(preFetchedData.url);
    return;
  }
  const url = "https://api.prd.qover.io/bike/v1/contracts/claim-info?apikey=pk_C0132D71B8C4C4E55690";
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cigarId, email })
  })
    .then(async res => {
      if (!res.ok) {
        const error = await res.json();
        if (error.code === "EMAIL_DOESNT_MATCH") {
          alert("The email address does not match the contract reference. Please verify and try again.");
        } else {
          alert("Something went wrong while retrieving your contract information.");
        }
        throw new Error(error.message || "API error");
      }
      return res.json();
    })
    .then(response => {
      const partnerId = response.partnerId;
      const country = response.country;
      const variant = response.variant;
      const claimProcess = (cowboyAlteosIds.includes(partnerId) && country === "DE") ? "CowboyAlteos" : "bikeQover";
      const template = getRedirectTemplate("BIKE", claimProcess);
      const url = buildRedirectUrl(template, { lang, variant, email, cigarId, country });
      preFetchedData = { product: "BIKE", url };
      callback(url);
    })
    .catch(err => {
      console.error("Failed to fetch BIKE data", err);
    });
}

function getIABRedirect(cigarId, email, lang, callback) {
  if (preFetchedData?.product === "IAB") {
    callback(preFetchedData.url);
    return;
  }
  const url = "https://script.google.com/macros/s/AKfycbxw_NiE8wEmOykXDcnaM6vzVfS6bYdv-Ne6bQmo-IBi0IvlKpSUW-6IAVxq5AwqrGasoQ/exec";
  const payload = { cigarId, email, action: "getContractData" };
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=UTF-8" },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(response => {
      if (response.status === "success" && response.payload === "error") {
        alert("We couldn't find your contract. Please verify your contract reference and email address.");
        return;
      }
      const make = response.payload.risk.make;
      const country = cigarId.substring(0, 2);
      let claimProcess = "iabHelvetia";
      if (make === "MAKE_TESLA" && country === "GB") claimProcess = "teslaWakam";
      else if (make === "MAKE_TESLA") claimProcess = "teslaHelvetia";
      const template = getRedirectTemplate("IAB", claimProcess);
      const url = buildRedirectUrl(template, { lang, variant: "", email, cigarId, country});
      preFetchedData = { product: "IAB", url };
      callback(url);
    })
    .catch(error => {
      console.error("Failed to fetch IAB data", error);
      alert("Something went wrong while retrieving your contract information. Please try again later.");
    });
}

function handleRedirectFlow(cigarId, email, lang) {
  const product = identifyProduct(cigarId);
  if (!product) return alert("Unable to detect product from contract reference.");

  let modalRef = showClaimModal(product, (closeModal) => {
    const finish = (url) => {
      closeModal();
      window.open(url, "_blank");
    };
    if (product === "BIKE") {
      getBikeRedirect(cigarId, email, lang, finish);
    } else if (product === "IAB") {
      getIABRedirect(cigarId, email, lang, finish);
    } else {
      const template = getRedirectTemplate(product, product);
      if (!template) return alert("No redirect configured for this product.");
      const url = buildRedirectUrl(template, { lang, variant: "", email, cigarId });
      finish(url);
    }
  }, true); // <-- starts with loading=true

  // Start prefetch and disable "Continue" while loading
  const finishPrefetch = () => {
    modalRef.setLoading(false);
  };

  if (product === "BIKE") {
    getBikeRedirect(cigarId, email, lang, () => {
      finishPrefetch();
    });
  } else if (product === "IAB") {
    getIABRedirect(cigarId, email, lang, () => {
      finishPrefetch();
    });
  } else {
    finishPrefetch(); // not async
  }
}




