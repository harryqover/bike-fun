const redirectRules = [
  { PatternPrefix: "FR20", TPA: "VA", Redirect: "https://forms.qover.com/233112828692357?tpa=VA&contractRef=FR20xxxxxxxxx" },
  { PatternPrefix: "BE20", TPA: "VA", Redirect: "https://forms.qover.com/233112828692357?tpa=VA&contractRef=BE20xxxxxxxxx" },
  { PatternPrefix: "GB20", TPA: "Crawford", Redirect: "https://forms.qover.com/233112828692357?tpa=VA&contractRef=GB20xxxxxxxxx" },
  // ... Add all rows from CSV here
];

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function extractPrefix(contractRef) {
  const match = contractRef.match(/^([A-Z]{2}\d{2})/);
  return match ? match[1] : null;
}

function findRedirectUrl(contractRef) {
  const prefix = extractPrefix(contractRef);
  return redirectRules.find(rule => rule.PatternPrefix === prefix);
}

function handleClaimRedirect() {
  const contractRef = document.querySelector("#cigardid").value.trim();
  const email = document.querySelector("#email").value.trim();

  if (!isValidEmail(email)) {
    showError("Please enter a valid email.");
    return;
  }

  const rule = findRedirectUrl(contractRef);
  if (!rule) {
    showError("We couldn’t match your contract. Please check or contact us.");
    return;
  }

  const finalUrl = rule.Redirect
    .replace("xxxxxxxxx", contractRef) // insert full contract
    + `&email=${encodeURIComponent(email)}`;

  window.location.href = finalUrl;
}

function showError(message) {
  const existing = document.querySelector(".error");
  if (existing) existing.remove();
  const p = document.createElement("p");
  p.className = "error";
  p.style.color = "red";
  p.textContent = message;
  document.querySelector("#btnToPaperform").after(p);
}
