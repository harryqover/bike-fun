/*20250403 0913*/
console.log("20250403 0913")
var product = {
  BE10: "BIKE",
  FR10: "BIKE",
  ES10: "BIKE",
  NL10: "BIKE",
  GB10: "BIKE",
  DE10: "BIKE",
  PT10: "BIKE",
  IT10: "BIKE",
  IE10: "BIKE",
  PL10: "BIKE",
  AT10: "BIKE",
  FI10: "BIKE",
  SE10: "BIKE",
  DK10: "BIKE",
  NO10: "BIKE",
  FR09: "TRAVEL",
  BE09: "TRAVEL",
  BE04: "TRAVEL",
  BE07: "TENANT",
  BE03: "LANDLORD",
  DE01: "COWBOY",
  BE08: "COWBOY",
  NL01: "COWBOY",
  FR03: "COWBOY",
  GB01: "COWBOY",
  BE20: "IAB",
  ES20: "IAB",
  AT20: "IAB",
  FR20: "IAB",
  DE20: "IAB",
  NL20: "IAB",
  PT20: "IAB",
  DK20: "IAB",
  GB20: "IAB",
  FR31: "PLEV"
};

var cowboyIds = [
  "5ff6cf4fceba6039aadb446f",
  "60938efba79100e71519a03b",
  "607937e4654780240a132641",
  "61b1b145415df342d60f4e0f",
  "61b1d0a02656f6227dc3476f",
  "61b1c260415df342d60f4e10",
  "60a75f9f987d3f484ed24ef4",
  "6239bdc7b96b08fbe8142622",
  "63736c55e19342075afe9cc4",
  "621e2870bcd73ab2d2550568",
  "6373a0d1a5d163f0f6f59931",
  "61b8a51111e584fcae0ee072",
  "61b8a52111e584fcae0ee073",
  "61b8a4c211e584fcae0ee071",
  "62cd828ecb175250d8e1fbc4",
  "61b8a45842cef3c0bc2cc26e",
  "61b8a49f11e584fcae0ee070",
  "61b8a4e807007c0a5b94d673",
  "61b8a43042cef3c0bc2cc26d",
  "62cd81bd736462368428da2b",
  "63736c4da5d163f0f6f5992f",
  "63736caba5d163f0f6f59930",
  "62cd81b2736462368428da27",
  "63736ca28d4465756472b505",
  "63736c3fa5d163f0f6f5992e",
  "63736c9c8d4465756472b504",
  "63736c37e19342075afe9cc3",
  "63736c958d4465756472b503",
  "63736c2a8d4465756472b502",
  "63736c86e19342075afe9cc5"
  ];
var cowboyAlteosIds = ["5ff6cf4fceba6039aadb446f","60938efba79100e71519a03b","607937e4654780240a132641","61b1b145415df342d60f4e0f","61b1c260415df342d60f4e10","60a75f9f987d3f484ed24ef4"]

const baseUrlClaimIAB = {
  "MAKE_TESLA": "https://insuremytesla.qover.com/claims?",
  "MAKE_NIO": "https://forms.qover.com/form/230372864555663?",
  //"MAKE_FISKER": "https://form.jotform.com/230644976859373", 
  //"MAKE_LUCID": "https://form.jotform.com/223494218513354",
  "MAKE_LUCID": "https://forms.qover.com/233112828692357?product=LUCID&",
  "MAKE_FISKER": "https://forms.qover.com/233112828692357?product=FISKER&", 
  "MAKE_ZEEKR": "https://forms.qover.com/233112828692357?product=ZEEKR&", 
  "MAKE_OPEN": "https://forms.qover.com/233112828692357?product=OPEN&",
}

const partnerIdIAB = {
  "63ea293a4a3a52645189f0f1": "Fisker",
  "63cfa5a0f6e5d3d875610048": "Tesla",
  "61001af3ededf75733d1c157": "Tesla",
  "639c829a22732f7628171bf8": "Lucid",
  "6489bf7f291dee7aa3b65f0d": "Niu",
  "63e0fe5cf6e5d3d87561004a": "Nio",
  "654b4e5fc1ebc873d2e7edf7": "Zeekr",
  "6569f1426a95fa27a3fd6302": "ASG"
}

const isValidIABCigar = (str) => /^[A-Za-z]{2}20\d{9}$/.test(str);
const isValidEmail = (str) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
const isValidPolicyId = (str) => /^P-[A-Z]+\d+$/.test(str);

function translate2() {
  var l = $('#state').find(":selected").val();
  $("[trans-key='sorry']").text(claimTranslation[l].sorry);
  $("[trans-key='fillininformation']").text(claimTranslation[l].fillininformation);
  $("[trans-key='reportincident']").text(claimTranslation[l].reportincident);
  $("[trans-key='helptextcigarid']").text(claimTranslation[l].helptextcigarid);
  $("[trans-key='submit']").text(claimTranslation[l].submit);
  $("[trans-key='titlepartners']").text(claimTranslation[l].titlepartners);
  $("[trans-key='subtitlepartners']").text(claimTranslation[l].subtitlepartners);
  $("[trans-key='issuecontactus']").html(claimTranslation[l].issuecontactus);
  $("#cigardid").attr("placeholder", claimTranslation[l].contractRef);
  $("#email").attr("placeholder", claimTranslation[l].email);
  getTranslation();
}

function translate() {
  var l = $('#state').find(":selected").val();
  $("[trans-key='sorry']").text(claimTranslation[l].sorry);
  $("[trans-key='fillininformation']").text(claimTranslation[l].fillininformation);
  $("[trans-key='reportincident']").text(claimTranslation[l].reportincident);
  $("[trans-key='helptextcigarid']").text(claimTranslation[l].helptextcigarid);
  $("[trans-key='issuecontactus']").html(claimTranslation[l].issuecontactus);
  $("[trans-key='submit']").text(claimTranslation[l].submit);
  $("[trans-key='titlepartners']").text(claimTranslation[l].titlepartners);
  $("[trans-key='subtitlepartners']").text(claimTranslation[l].subtitlepartners);
  getTranslation();
}

function findPaperform() {
  var cigarId = $('input[name="name"]').val();
  var email = $('input[name="email"]').val();
  if (isValidEmail(email)){
    getClaimInfo(cigarId, email);
  } else {
    $("#btnToPaperform").after("<p>should be a valid email</p>");
  }
}

function findPaperform2(partnerid, variant, email) {
  var cigarId = $('input[name="name"]').val();
  var email = $('input[name="email"]').val();
  var cigarIdRef = cigarId.substring(0, 4);
  var lang = $('#state').find(":selected").val();
  var cigLang = cigarIdRef + lang;
  var url = "https://claims-qover.paperform.co/";

  var bUBike = "https://forms.qover.com/212795616223356?language=";

  var paperformDatabase = {
    BE10fr: bUBike + "fr&partnerid=" + partnerid + "&variant=" + variant + "&email=" + email + "&contract_number=",
    BE10nl: bUBike + "nl&partnerid=" + partnerid + "&variant=" + variant + "&email=" + email + "&contract_number=",
    BE10en: bUBike + "en&partnerid=" + partnerid + "&variant=" + variant + "&email=" + email + "&contract_number=",
    FR10fr: bUBike + "fr&partnerid=" + partnerid + "&variant=" + variant + "&email=" + email + "&contract_number=",
    FR10en: bUBike + "en&partnerid=" + partnerid + "&variant=" + variant + "&email=" + email + "&contract_number=",
    DE10en: bUBike + "en&partnerid=" + partnerid + "&variant=" + variant + "&email=" + email + "&contract_number=",
    DE10de: bUBike + "de&partnerid=" + partnerid + "&variant=" + variant + "&email=" + email + "&contract_number=",
    NL10nl: bUBike + "nl&partnerid=" + partnerid + "&variant=" + variant + "&email=" + email + "&contract_number=",
    NL10en: bUBike + "en&partnerid=" + partnerid + "&variant=" + variant + "&email=" + email + "&contract_number=",
    GB10en: bUBike + "en&partnerid=" + partnerid + "&variant=" + variant + "&email=" + email + "&contract_number=",
    PT10pt: bUBike + "pt&partnerid=" + partnerid + "&variant=" + variant + "&email=" + email + "&contract_number=",
    PT10en: bUBike + "en&partnerid=" + partnerid + "&variant=" + variant + "&email=" + email + "&contract_number=",
    ES10es: bUBike + "es&partnerid=" + partnerid + "&variant=" + variant + "&email=" + email + "&contract_number=",
    ES10en: bUBike + "en&partnerid=" + partnerid + "&variant=" + variant + "&email=" + email + "&contract_number=",
    IT10it: bUBike + "it&partnerid=" + partnerid + "&variant=" + variant + "&email=" + email + "&contract_number=",
    IT10en: bUBike + "en&partnerid=" + partnerid + "&variant=" + variant + "&email=" + email + "&contract_number=",
    NO10en: bUBike + "en&partnerid=" + partnerid + "&variant=" + variant + "&email=" + email + "&contract_number=",
    SE10en: bUBike + "en&partnerid=" + partnerid + "&variant=" + variant + "&email=" + email + "&contract_number=",
    DK10en: bUBike + "en&partnerid=" + partnerid + "&variant=" + variant + "&email=" + email + "&contract_number=",
    FI10en: bUBike + "en&partnerid=" + partnerid + "&variant=" + variant + "&email=" + email + "&contract_number=",
    NO10no: bUBike + "no&partnerid=" + partnerid + "&variant=" + variant + "&email=" + email + "&contract_number=",
    SE10sv: bUBike + "sv&partnerid=" + partnerid + "&variant=" + variant + "&email=" + email + "&contract_number=",
    DK10da: bUBike + "da&partnerid=" + partnerid + "&variant=" + variant + "&email=" + email + "&contract_number=",
    FI10fi: bUBike + "fi&partnerid=" + partnerid + "&variant=" + variant + "&email=" + email + "&contract_number=",
    FR09fr: "https://travel-france.paperform.co/?policyNumber=",
    FR09en: "https://travel-france-en.paperform.co/?policyNumber=",
    BE09fr: "https://travel-belgique.paperform.co/?policyNumber=",
    BE09nl: "https://travel-belgie.paperform.co/?policyNumber=",
    BE09en: "https://travel-belgium.paperform.co/?policyNumber=",
    BE09es: "https://travel-belgium.paperform.co/?policyNumber=",
    BE09de: "https://travel-belgium.paperform.co/?policyNumber=",
    BE09it: "https://travel-belgium.paperform.co/?policyNumber=",
    BE04fr: "https://travel-fr-be.paperform.co/?policyNumber=",
    BE04en: "https://travel-en-be.paperform.co/?policyNumber=",
    BE04de: "https://travel-en-be.paperform.co/?policyNumber=",
    BE04es: "https://travel-en-be.paperform.co/?policyNumber=",
    BE04it: "https://travel-en-be.paperform.co/?policyNumber=",
    BE04nl: "https://travel-nl-be.paperform.co/?policyNumber=",
    BE07en: "https://homeprotect-en.paperform.co/?e4sir=", //tenant
    BE07es: "https://homeprotect-en.paperform.co/?e4sir=", //tenant
    BE07it: "https://homeprotect-en.paperform.co/?e4sir=", //tenant
    BE07de: "https://homeprotect-en.paperform.co/?e4sir=", //tenant
    BE07fr: "https://homeprotect-fr.paperform.co/?e4sir=", //tenant
    BE07nl: "https://homeprotect-en.paperform.co/?e4sir=", //tenant
    BE03en: "https://rent-guarantee-en-be.paperform.co/?policyNumber=", //landlord
    BE03es: "https://rent-guarantee-en-be.paperform.co/?policyNumber=", //landlord
    BE03de: "https://rent-guarantee-en-be.paperform.co/?policyNumber=", //landlord
    BE03it: "https://rent-guarantee-en-be.paperform.co/?policyNumber=", //landlord
    BE03fr: "https://assurance-loyer-fr-be.paperform.co/?policyNumber=", //landlord
    BE03nl: "https://huurgarantie-nl-be.paperform.co/?policyNumber=", //landlord
    BE12fr: "https://homeprotect-owner-fr.paperform.co/?policyNumber=",
    BE12en: "https://homeprotect-owner-en.paperform.co/?policyNumber=",
    BE12nl: "https://homeprotect-owner-nl.paperform.co/?policyNumber=",
    BE20fr: "https://insuremytesla.qover.com/claims?language=fr&policyNumber=",
    BE20nl: "https://insuremytesla.qover.com/claims?language=nl&policyNumber=",
    BE20en: "https://insuremytesla.qover.com/claims?language=en&policyNumber=",
    AT20en: "https://insuremytesla.qover.com/claims?language=en&policyNumber=",
    AT20de: "https://insuremytesla.qover.com/claims?language=de&policyNumber=",
    ES20en: "https://insuremytesla.qover.com/claims?language=en&policyNumber=",
    ES20es: "https://insuremytesla.qover.com/claims?language=es&policyNumber=",
    FR31fr: "https://form.jotformeu.com/222722171740044?language=fr&claimant_email="+email+"&contract_number="
  };
  const policyClaimsLinks = {
    MICAT: "https://forms.qover.com/233112828692357?product=MIC&country=AT&contract=",
    VDMIE: "https://forms.qover.com/233112828692357?product=VDM&country=IE&contract=",
    BMMIE: "https://forms.qover.com/233112828692357?product=BMM&country=IE&contract="
  }
  if (paperformDatabase[cigLang]) {
    url = paperformDatabase[cigLang] + cigarId;
    if (typeof dataLayer !== 'undefined') {
      dataLayer.push({
        'event': 'allTagsWithEvents',
        'eventCategory': 'modal-B2BB2C-contracts',
        'eventAction': 'test', 
        'eventLabel': 'test'
      });
    }
  } else if(isValidPolicyId(cigarId)){
    console.warn("it's a policy");
    url = policyClaimsLinks[cigarId.substring(2,7)] + cigarId;
    if (typeof dataLayer !== 'undefined') {
      dataLayer.push({
        'event': 'allTagsWithEvents',
        'eventCategory': 'modal-B2BB2C-policy',
        'eventAction': 'test', 
        'eventLabel': 'test'
      });
    }
  } else {
    var lang = $('#state').find(":selected").val();
    if(typeof(lang) === undefined){
      if(window.location.href == "https://carrefour-assurance.qover.com/"){
        lang = "fr";
      } else {
        lang = "en";
      }
    }
    var transAlert = {
      "en": "We couldn't find your contract, please contact us.",
      "fr": "Nous n'avons pas trouvé votre contrat, veuillez nous contacter.",
      "de": "We couldn't find your contract, please contact us.",
      "nl": "We couldn't find your contract, please contact us.",
      "es": "We couldn't find your contract, please contact us.",
      "it": "We couldn't find your contract, please contact us.",
      "fi": "We couldn't find your contract, please contact us.",
      "no": "We couldn't find your contract, please contact us.",
      "da": "We couldn't find your contract, please contact us.",
      "pl": "We couldn't find your contract, please contact us."
    }
    var popupClaimErrorTranslation = {
      "en": {
        "title": "An error has occurred",
        "bold": "Please check that your contract reference and email address are correct before trying again.",
        "text1": "If both details are correct but an error appears, it may be that the combination of the 2 is incorrect.",
        "text2": "If you are stuck, please <u>contact us</u> directly to resolve your problem."
      },
      "fr": {
        "title": "Une erreur s'est produite",
        "bold": "Veuillez vérifier que votre référence de contrat et votre adresse e-mail sont correctes avant de réessayer.",
        "text1": "Si les deux informations sont correctes mais qu'une erreur apparaît, il se peut que la combinaison des deux soit incorrecte.",
        "text2": "Si vous êtes bloqué, veuillez nous <u>contacter</u> directement pour résoudre votre problème."
      },
      "de": {
        "title": "Ein Fehler ist aufgetreten",
        "bold": "Bitte überprüfen Sie, ob Ihre Vertragsreferenz und E-Mail-Adresse korrekt sind, bevor Sie es erneut versuchen.",
        "text1": "Wenn beide Angaben korrekt sind, aber ein Fehler angezeigt wird, könnte die Kombination der beiden falsch sein.",
        "text2": "Wenn Sie feststecken, kontaktieren Sie uns bitte <u>direkt</u>, um Ihr Problem zu lösen."
      },
      "nl": {
        "title": "Er is een fout opgetreden",
        "bold": "Controleer voordat u het opnieuw probeert of uw contractreferentie en e-mailadres juist zijn.",
        "text1": "Als beide gegevens juist zijn maar er toch een fout optreedt, kan het zijn dat de combinatie van beide onjuist is.",
        "text2": "Als u vastzit, neem dan <u>direct contact met ons op</u> om uw probleem op te lossen."
      },
      "es": {
        "title": "Se ha producido un error",
        "bold": "Por favor, compruebe que su referencia de contrato y dirección de correo electrónico son correctas antes de intentarlo de nuevo.",
        "text1": "Si ambos detalles son correctos pero aparece un error, puede ser que la combinación de ambos sea incorrecta.",
        "text2": "Si está bloqueado, por favor <u>contáctenos</u> directamente para resolver su problema."
      },
      "it": {
        "title": "Si è verificato un errore",
        "bold": "Controlla che il tuo riferimento contratto e l'indirizzo email siano corretti prima di riprovare.",
        "text1": "Se entrambi i dettagli sono corretti ma compare un errore, potrebbe essere che la combinazione dei due sia errata.",
        "text2": "Se sei bloccato, <u>contattaci</u> direttamente per risolvere il tuo problema."
      },
      "pt": {
        "title": "Ocorreu um erro",
        "bold": "Verifique se a referência do contrato e o endereço de e-mail estão corretos antes de tentar novamente.",
        "text1": "Se ambos os detalhes estiverem corretos, mas ocorrer um erro, pode ser que a combinação dos dois esteja incorreta.",
        "text2": "Se estiver com problemas, entre em <u>contato conosco</u> diretamente para resolver o seu problema."
      },
      "no": {
        "title": "Det har oppstått en feil",
        "bold": "Vennligst sjekk at kontraktsreferansen og e-postadressen din er korrekte før du prøver igjen.",
        "text1": "Hvis begge detaljene er riktige, men det oppstår en feil, kan det hende at kombinasjonen av begge er feil.",
        "text2": "Hvis du står fast, vennligst <u>kontakt oss</u> direkte for å løse problemet ditt."
      },
      "fi": {
        "title": "Tapahtui virhe",
        "bold": "Tarkista ennen uudelleenyritystä, että sopimuksen viitenumero ja sähköpostiosoite ovat oikein.",
        "text1": "Jos molemmat tiedot ovat oikein, mutta virhe ilmenee, voi olla, että niiden yhdistelmä on virheellinen.",
        "text2": "Jos olet jumissa, ota yhteyttä meihin <u>suoraan</u> ongelmasi ratkaisemiseksi."
      },
      "da": {
        "title": "Der opstod en fejl",
        "bold": "Kontrollér, at din kontraktreference og e-mailadresse er korrekte, før du prøver igen.",
        "text1": "Hvis begge oplysninger er korrekte, men en fejl opstår, kan det være, at kombinationen af de to er forkert.",
        "text2": "Hvis du er fastlåst, bedes du <u>kontakte os</u> direkte for at løse dit problem."
      },
      "pl": {
        "title": "Wystąpił błąd",
        "bold": "Sprawdź, czy numer referencyjny umowy i adres e-mail są poprawne, zanim spróbujesz ponownie.",
        "text1": "Jeśli oba szczegóły są poprawne, ale pojawia się błąd, może to oznaczać, że kombinacja tych dwóch jest niepoprawna.",
        "text2": "Jeśli utkniesz, skontaktuj się z nami <u>bezpośrednio</u>, aby rozwiązać swój problem."
      }
    }

    var popupClaimError = '<div onclick="closePopupClaimError()" id="popupClaimError" style="position:fixed;z-index:1999;width:100%; height: 100vh; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center;"><div style="width:480px; border-radius: 3px; background-color: white; padding: 20px 40px 60px 40px; font-family: Albert Sans;"><h2 style="margin-bottom: 40px;">'+ popupClaimErrorTranslation[lang].title +'</h2><p><b>'+ popupClaimErrorTranslation[lang].bold +'</b></p><p>'+ popupClaimErrorTranslation[lang].text1 +'</p><p>'+ popupClaimErrorTranslation[lang].text2 +'</p></div></div>'
    $("body").prepend(popupClaimError);
    //alert(transAlert[lang]);
    console.warn("cigar id couldn't be found");
    url = "";
    if (typeof dataLayer !== 'undefined') {
      dataLayer.push({
        'event': 'allTagsWithEvents',
        'eventCategory': 'claimForm',
        'eventAction': 'no match',
        'eventLabel': cigarId + lang
      });
    }
  }
  console.log("final url: ", url);

  setTimeout(function() {
    if(url != ""){
      window.location.href = url;
    }
  }, 1000);
}

function closePopupClaimError(){
    $("#popupClaimError").remove();
}

function getClaimInfo(cigarId, email) {
  var cigarIdRef = cigarId.substring(0, 4);
  var lang = $('#state').find(":selected").val();
  var country = cigarId.substring(0, 2);

  if (product[cigarIdRef] == "COWBOY") {
    var claims_handler = "to be verified";
    if (country == "DE"){
      claims_handler = "Alteos";
    } else if (country == "NL" || country == "BE") {
      claims_handler = "Qover";
    } else if (country == "FR") {
      claims_handler = "SPB";
    } else if (country == "GB") {
      claims_handler = "Qover";
    }
    var url = "https://eu.jotform.com/213533942109352?language=" + lang + "&email=" + email + "&contract_number=" + cigarId + "&claims_handler=" + claims_handler;
    setTimeout(function() {
      //window.location.href = url;
      showModal(url);
    }, 1000);
  } else if (product[cigarIdRef] == "BIKE") {
    var data = JSON.stringify({
      "cigarId": cigarId,
      "email": email
    });

    var partnerMapping = {
      "5e58cf936ad8cf0e9dc678a6": "unknown",
    };

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function() {
      if (this.readyState === 4 && this.status === 200) {
        var obj = JSON.parse(this.responseText);
        var partnerId = obj.partnerId;
        var variant = obj.variant;
        var country = obj.country;
        console.log(obj);
        console.log(partnerMapping[partnerId]);

        var isCowboy = cowboyIds.includes(partnerId);
        var isCowboyAlteosId = cowboyAlteosIds.includes(partnerId);

        /*console.warn("isCowboy", isCowboy);
        console.log("partnerId", partnerId);
        console.log("variant", variant);
        console.warn("isCowboyAlteosId", isCowboyAlteosId);
        console.log("country", country);*/

        var claims_handler = "to be verified";

        if (isCowboyAlteosId === true && country == "DE"){
          claims_handler = "Alteos";
        } else {
          claims_handler = "Qover";
        }

        if (isCowboyAlteosId === true && country == "DE") {
          var url = "https://eu.jotform.com/213533942109352?language=" + lang + "&variant=" + variant + "&email=" + email + "&contract_number=" + cigarId + "&claims_handler=" + claims_handler;
          setTimeout(function() {
            //window.location.href = url;
            showModal(url);
          }, 1000);
        } else {
          //findPaperform2(partnerId, variant);
          var url = "https://forms.qover.com/212795616223356?language=" + lang + "&variant=" + variant + "&email=" + email + "&contract_number=" + cigarId + "&claims_handler=" + claims_handler;
          //var url = "https://eu.jotform.com/212795616223356?language=" + lang + "&variant=" + variant + "&email=" + email + "&contract_number=" + cigarId + "&claims_handler=" + claims_handler;
          setTimeout(function() {
            //window.location.href = url;
            showModal(url);
          }, 1000);
        }

        /* HIDDEN WHILE COWBOY CLAIMS ARE NOT MANAGED BY QOVER

        if (isCowboy === true) {
          var url = "https://eu.jotform.com/213533942109352?language=" + lang + "&variant=" + variant + "&email=" + email + "&contract_number=" + cigarId;
          setTimeout(function() {
            window.location.href = url;
          }, 1000);
        } else {
          findPaperform2(partnerId, variant);
        }
        */
        //findPaperform2(partnerId, variant);

      } else if (this.readyState === 4 && this.status === 400) {
        console.log(this.status);
        var obj = JSON.parse(this.responseText);
        alert(obj.message);
      }
    });

    xhr.open("POST", "https://api.prd.qover.io/bike/v1/contracts/claim-info?apikey=pk_C0132D71B8C4C4E55690");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(data);

  } else if (product[cigarIdRef] == "PLEV") {

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function() {
      if(this.readyState === 4 && this.status === 200) {
        var response = JSON.parse(this.responseText);
        console.log(response.refs.partnerId);

        var baseUrlCarrefour = "https://carrefour-assurance.qover.com/declaration-de-sinistre";
        var baseUrlGeneric = "https://forms.qover.com/222722171740044";

        var baseUrl = (response.refs.partnerId == "634e5fe8c9833bb23bd94be9") ? baseUrlCarrefour : baseUrlGeneric ;


        var redirectUrl = baseUrl+"?language=fr&claimant_email="+email+"&contract_number="+cigarId+"&partner="+response.refs.partnerId+"&variant="+response.terms.variant;
        window.location.href = redirectUrl;
      } else if (this.readyState === 4 && (this.status === 404 || this.status === 400) ){
        console.log(this.status);
        var obj = JSON.parse(this.responseText);
        //alert(obj.message);
        alert("Veuillez entrez un numéro de contrat valide et l'adresse email du souscripteur.");
      }
    });

    xhr.open("GET", "https://api.prd.qover.io/iab/v1/contracts/"+cigarId+"?apikey=pk_9CEA03CE24D7AF5FB0F7&email="+email);

    xhr.send();

  } else if (product[cigarIdRef] == "IAB") {
    // CHECK TO REDIRECT TO THE CORRECT IAB FORM
    getNinjaData(cigarId, email);


  } else {
    findPaperform2("xxx", "xxx", "xxx");
  }
}

setTimeout(function(){
  $("#email").val(getParameterByName("email"));
  $("#cigardid").val(getParameterByName("contract"));
  var fancyboxCode = '<script async="" src="https://storage.googleapis.com/qover-assets/scripts/fancybox.js"></script><link rel="stylesheet" type="text/css" href="https://storage.googleapis.com/qover-assets/scripts/fancybox.css">'
  $('head').append(fancyboxCode);
  getTranslation();
 },5000);

function showModal(url){
  var htmlToShow = "";
  htmlToShow = htmlToShow + "<h2>"+claimsTranslation.claimModalBeforeYouContinue+"</h2>";
  htmlToShow = htmlToShow + "<p>"+claimsTranslation.claimModalContent+"</p>";
  htmlToShow = htmlToShow + "<a class='new-cta big w-button' href='"+url+"'>"+claimsTranslation.claimModalContinue+"</a>";

  Fancybox.show([
    {
      src: htmlToShow,
      type: "html",
    },
  ]);
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



function getNinjaData(cigarId, email) {
  $(".loading").show();
    $('#btnToPaperform').after('<div id="loading-container"><div class="loader"></div></div><style>#loading-container{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(255,255,255,.8);z-index:9999}.loader{border:8px solid #f3f3f3;border-top:8px solid #3498db;border-radius:50%;width:50px;height:50px;margin:20% auto;animation:1s linear infinite spin}@keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}</style>');
    $("#loading-container").show(250);
    var googleSheetUrl = "https://script.google.com/macros/s/AKfycbxw_NiE8wEmOykXDcnaM6vzVfS6bYdv-Ne6bQmo-IBi0IvlKpSUW-6IAVxq5AwqrGasoQ/exec";
    var settings = {
        "url": googleSheetUrl,
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "text/plain;charset=utf-8"
        },
        "data": JSON.stringify({
            "cigarId": cigarId,
            "email": email,
            "action": "getContractData"
        }),
    };

    $.ajax(settings).done(function(response) {
      console.log(response);
        window.payloadFromNinja = response;
        if(response.payload == "error"){
            console.warn("error while trying to connect");
            //alert("Make sure you connect with the email and contract reference from your contract");
            $('<style>p.error {color: #DC3545;margin-top: 10px;}</style>').insertAfter("#btnToPaperform");
            $("<p class='error'>Make sure you connect with the email and contract reference from your contract</p>").insertAfter("#btnToPaperform");
            $("#disconnected").show();
            $(".loading").hide();
            $("#loading-container").hide(250);
        } else {
          var lang = response.payload.language;
          var registrationPlate = response.payload.risk.registrationPlate;
          var brand = response.payload.risk.make;
          var partnerId = response.payload.refs.partnerId;
          var partnerName = partnerIdIAB[partnerId];
          var country = cigarId.substring(0, 2);
          if(lang == "de"||lang == "pt"){
            lang = "de-"+country;
          }
          var baseUrl = (baseUrlClaimIAB[brand])?baseUrlClaimIAB[brand]:"https://forms.qover.com/233112828692357?product=IAB&";
          window.location.href = baseUrlClaimIAB[brand]+"&partnerName="+partnerName+"&language="+lang+"&claimant_email="+email+"&policy_reference="+cigarId+"&vehicle_plate_number="+registrationPlate+"&ref_country="+country+"&brand="+brand;
        }
        $(".loading").hide();
        $("#loading-container").hide(250);
        $("#disconnected").show();
    })
}