const LOGO_TOKEN = 'pk_H7vb5Y2lTsW47U4Xq-w3HA';
export const logoUrl = (domain) => `https://img.logo.dev/${domain}?token=${LOGO_TOKEN}&format=png`;

const CUSTOM_LOGOS = {
  'Zukunftsversicherung': 'images/zukunftsversicherung-logo.svg',
};

export function getInstitutLogoUrl(variant) {
  if (CUSTOM_LOGOS[variant.institut]) {
    const base = import.meta.env.BASE_URL || './';
    return `${base}${CUSTOM_LOGOS[variant.institut]}`;
  }
  if (!variant.domain) return null;
  return logoUrl(variant.domain);
}

export const INSTITUT_VARIANTEN = [
  {
    institut: 'Zukunfts AG',
    domain: null,
    mode: 'generic',
    tagline: 'Industrieunspezifisches Karriereportal',
    colors: {
      primary: '#334155',
      primaryLight: '#475569',
      gradient: 'linear-gradient(135deg, #1e293b 0%, #334155 45%, #475569 100%)',
      accent: '#94a3b8',
    },
  },
  {
    institut: 'ERGO',
    domain: 'ergo.de',
    mode: 'insurance',
    colors: {
      primary: '#86181d',
      primaryLight: '#C8102E',
      gradient: 'linear-gradient(135deg, #5a1018 0%, #86181d 40%, #a02028 100%)',
      accent: '#e8c547',
    },
  },
  {
    institut: 'Allianz',
    domain: 'allianz.de',
    mode: 'insurance',
    colors: {
      primary: '#003781',
      primaryLight: '#0056b3',
      gradient: 'linear-gradient(135deg, #002255 0%, #003781 40%, #0056b3 100%)',
      accent: '#009ee0',
    },
  },
  {
    institut: 'AXA',
    domain: 'axa.de',
    mode: 'insurance',
    colors: {
      primary: '#00008f',
      primaryLight: '#0033cc',
      gradient: 'linear-gradient(135deg, #000066 0%, #00008f 40%, #0033cc 100%)',
      accent: '#ff1721',
    },
  },
  {
    institut: 'Generali',
    domain: 'generali.de',
    mode: 'insurance',
    colors: {
      primary: '#c8102e',
      primaryLight: '#e01e3c',
      gradient: 'linear-gradient(135deg, #8c0b20 0%, #c8102e 40%, #e01e3c 100%)',
      accent: '#ffd700',
    },
  },
  {
    institut: 'Zurich',
    domain: 'zurich.de',
    mode: 'insurance',
    colors: {
      primary: '#003399',
      primaryLight: '#0050b3',
      gradient: 'linear-gradient(135deg, #002266 0%, #003399 40%, #0050b3 100%)',
      accent: '#009fe3',
    },
  },
  {
    institut: 'HDI',
    domain: 'hdi.de',
    mode: 'insurance',
    colors: {
      primary: '#004f3b',
      primaryLight: '#007a5e',
      gradient: 'linear-gradient(135deg, #003328 0%, #004f3b 40%, #007a5e 100%)',
      accent: '#8cc63f',
    },
  },
  {
    institut: 'R+V',
    domain: 'ruv.de',
    mode: 'insurance',
    colors: {
      primary: '#003d7a',
      primaryLight: '#0060bf',
      gradient: 'linear-gradient(135deg, #002a55 0%, #003d7a 40%, #0060bf 100%)',
      accent: '#e6a817',
    },
  },
  {
    institut: 'Zukunftsversicherung',
    domain: null,
    mode: 'insurance',
    colors: {
      primary: '#1e2a4a',
      primaryLight: '#2d3f6e',
      gradient: 'linear-gradient(135deg, #121a30 0%, #1e2a4a 40%, #2d3f6e 100%)',
      accent: '#5b8def',
    },
  },
];

export const DEFAULT_INSTITUT = INSTITUT_VARIANTEN.find(v => v.institut === 'ERGO') || INSTITUT_VARIANTEN[0];
