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
  'Bausparkasse Schwäbisch Hall': 'schwaebisch-hall.de',
  'Schwäbisch Hall': 'schwaebisch-hall.de',
  'Bausparkasse LBS': 'lbs.de',
  'Targobank': 'targobank.de',
  'N26': 'n26.com',
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
  if (!domain) return null;
  return `https://img.logo.dev/${domain}?token=${LOGO_TOKEN}&size=${size}&format=png`;
}

export function getDomain(name) {
  return DOMAIN_MAP[name] || null;
}
