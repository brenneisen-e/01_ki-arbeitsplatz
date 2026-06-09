// Versicherer/Institut Logo-Domain Mapping (logo.dev API)
// Portiert aus kunden-detail-core.js

const LOGO_TOKEN = 'pk_H7vb5Y2lTsW47U4Xq-w3HA';

// Custom local logos for fictional institutes
const CUSTOM_LOGOS = {
  'Zukunftsbank': 'images/zukunftsbank-logo.svg',
  'Zukunftsversicherung': 'images/zukunftsversicherung-logo.svg',
};

const DOMAIN_MAP = {
  'Allianz': 'allianz.de',
  'ERGO': 'ergo.de',
  'VHV': 'vhv.de',
  'Helvetia': 'helvetia.com',
  'Alte Leipziger': 'alte-leipziger.de',
  'Axa': 'axa.de',
  'AXA': 'axa.de',
  'Nürnberger': 'nuernberger.de',
  'Hiscox': 'hiscox.de',
  'Hannoversche': 'hannoversche.de',
  'CosmosDirekt': 'cosmosdirekt.de',
  'HUK-Coburg': 'huk.de',
  'HUK24': 'huk24.de',
  'Condor': 'condor-versicherungen.de',
  'Zurich': 'zurich.de',
  'HDI': 'hdi.de',
  'R+V': 'ruv.de',
  'R+V Versicherung': 'ruv.de',
  'Generali': 'generali.de',
  'Gothaer': 'gothaer.de',
  'Debeka': 'debeka.de',
  'Sparkasse': 'sparkasse.de',
  'Sparkasse Gießen': 'sparkasse.de',
  'Sparkasse Marburg': 'sparkasse.de',
  'Sparkasse Lich': 'sparkasse.de',
  'Sparkasse Essen': 'sparkasse.de',
  'Sparkasse Braunschweig': 'sparkasse.de',
  'Volksbank': 'vr.de',
  'Volksbank Dortmund': 'vr.de',
  'Volksbank Mittelhessen': 'vr.de',
  'VR / Volksbank': 'vr.de',
  'ING DiBa': 'ing.de',
  'ING': 'ing.de',
  'DKB': 'dkb.de',
  'DWS': 'dws.de',
  'Kravag': 'kravag.de',
  'ARAG': 'arag.de',
  'Fressnapf': 'fressnapf.de',
  'Continental': 'continental-corporation.com',
  'Continental AG': 'continental-corporation.com',
  'SAP': 'sap.com',
  'SAP SE': 'sap.com',
  'Bosch': 'bosch.com',
  'Siemens': 'siemens.com',
  'Daimler': 'mercedes-benz.com',
  'Mercedes-Benz': 'mercedes-benz.com',
  'BMW': 'bmw.de',
  'Volkswagen': 'volkswagen.de',
  'VW': 'volkswagen.de',
  'Audi': 'audi.de',
  'Deutsche Telekom': 'telekom.de',
  'Telekom': 'telekom.de',
  'Lufthansa': 'lufthansa.com',
  'BASF': 'basf.com',
  'Bayer': 'bayer.com',
  'Bausparkasse Schwäbisch Hall': 'schwaebisch-hall.de',
  'Schwäbisch Hall': 'schwaebisch-hall.de',
  'Bausparkasse LBS': 'lbs.de',
  'Targobank': 'targobank.de',
  'N26': 'n26.com',
  'Postbank': 'postbank.de',
  'HypoVereinsbank': 'hypovereinsbank.de',
  'Sparkasse KölnBonn': 'sparkasse-koelnbonn.de',
  'Sparkasse Köln': 'sparkasse-koelnbonn.de',
  // AISP / Open-Banking-Anbieter (Kontoinformationsdienste)
  'finAPI': 'finapi.io',
  'Tink': 'tink.com',
  'Trade Republic': 'traderepublic.com',
  'Scalable Capital': 'scalable.capital',
  'Commerzbank': 'commerzbank.de',
  'Consorsbank': 'consorsbank.de',
  'Deutsche Bank': 'db.com',
  'Deka': 'deka.de',
  'Comdirect': 'comdirect.de',
  'KfW': 'kfw.de',
  'Union Investment': 'union-investment.de',
  'Santander': 'santander.de',
  'Swiss Life': 'swisslife.de',
  'Apobank': 'apobank.de',
  'DZ BANK': 'dzbank.de',
  'DZ HYP': 'dzhyp.de',
  'DZ PRIVATBANK': 'dz-privatbank.de',
  'TeamBank': 'teambank.de',
  'easyCredit': 'easycredit.de',
  'VR Smart Finanz': 'vr-smart-finanz.de',
  'GENO Broker': 'genobroker.de',
  'ReiseBank': 'reisebank.de',
  'Münchener Hyp': 'muenchenerhyp.de',
  'HRK LUNIS': 'hrklunis.com',
  'Berenberg': 'berenberg.de',
  'Zukunftsinvestment': 'zukunftsinvestment.de',
  'Flossbach von Storch': 'flossbachvonstorch.de',
  'DJE Kapital': 'dje.de',
  'Pictet': 'pictet.com',
  'UBS': 'ubs.com',
  'N26': 'n26.com',
  'Coinbase': 'coinbase.com',
  'Coinbase/Ledger': 'coinbase.com',
  'Franke und Bornberg': 'franke-bornberg.de',
  'Franke & Bornberg': 'franke-bornberg.de',
  'Zukunftsversicherung': null,
  'Zukunftsbank': null,
  'Privat': null,
  'Eigene': null,
  // Einzeltitel / Aktien-Logos (via logo.dev)
  'Apple': 'apple.com',
  'Apple Inc.': 'apple.com',
  'Apple Inc. (AAPL)': 'apple.com',
  'AAPL': 'apple.com',
  'Amazon': 'amazon.com',
  'Amazon.com Inc.': 'amazon.com',
  'Amazon.com Inc. (AMZN)': 'amazon.com',
  'AMZN': 'amazon.com',
  'OpenAI': 'openai.com',
  'OpenAI (Pre-IPO / Secondary)': 'openai.com',
};

export function getLogoUrl(name, size = 32) {
  // Check custom local logos first
  if (CUSTOM_LOGOS[name]) {
    const base = import.meta.env.BASE_URL || '/';
    return `${base}${CUSTOM_LOGOS[name]}`;
  }

  let domain = DOMAIN_MAP[name];
  // Fallback: try matching start of name
  if (!domain) {
    for (const key in DOMAIN_MAP) {
      if (name.startsWith(key) || key.startsWith(name)) {
        domain = DOMAIN_MAP[key];
        break;
      }
    }
  }
  if (!domain) {
    // Fallback: aus Firmennamen eine wahrscheinliche Domain ableiten
    // ("Continental AG" → continental.com, "Stadt Gießen" → stadtgießen.de).
    // logo.dev liefert für unbekannte Domains einen 404 → LogoImg fängt das
    // über onError ab und zeigt die Initialen.
    const cleaned = String(name)
      .replace(/\b(AG|GmbH|KG|SE|mbH|& Co\.?|Co\.?|KGaA|Holding|Group|Konzern|e\.V\.|eG)\b/gi, '')
      .replace(/[^a-zA-ZäöüÄÖÜß0-9]+/g, '')
      .toLowerCase()
      .trim();
    if (cleaned.length >= 3) {
      domain = `${cleaned}.com`;
    }
  }
  if (!domain) return null;
  return `https://img.logo.dev/${domain}?token=${LOGO_TOKEN}&size=${size}&format=png`;
}

export function getDomain(name) {
  return DOMAIN_MAP[name] || null;
}
