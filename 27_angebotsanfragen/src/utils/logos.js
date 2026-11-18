// Logo-Domain Mapping (logo.dev API) – analog zu vertriebsarbeitsplatz
const LOGO_TOKEN = 'pk_H7vb5Y2lTsW47U4Xq-w3HA';

const DOMAIN_MAP = {
  'ERGO': 'ergo.de',
  'Allianz': 'allianz.de',
  'VHV': 'vhv.de',
  'Helvetia': 'helvetia.com',
  'Alte Leipziger': 'alte-leipziger.de',
  'AXA': 'axa.de',
  'Axa': 'axa.de',
  'Nürnberger': 'nuernberger.de',
  'Hiscox': 'hiscox.de',
  'CosmosDirekt': 'cosmosdirekt.de',
  'HUK-Coburg': 'huk.de',
  'Zurich': 'zurich.de',
  'HDI': 'hdi.de',
  'R+V': 'ruv.de',
  'Generali': 'generali.de',
  'Gothaer': 'gothaer.de',
  'Debeka': 'debeka.de',
  'Condor': 'condor-versicherungen.de',
  'Hannoversche': 'hannoversche.de',
  'Swiss Life': 'swisslife.de',
  'ARAG': 'arag.de',
  'Kravag': 'kravag.de',
  'Sparkasse': 'sparkasse.de',
  'Volksbank': 'vr.de',
};

export function getLogoUrl(name, size = 32) {
  let domain = DOMAIN_MAP[name];
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
