const LOGO_TOKEN = 'pk_H7vb5Y2lTsW47U4Xq-w3HA';
export const logoUrl = (domain) => `https://img.logo.dev/${domain}?token=${LOGO_TOKEN}&format=png`;

export const INSTITUT_VARIANTEN = [
  {
    institut: 'ERGO',
    domain: 'ergo.de',
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
    colors: {
      primary: '#003d7a',
      primaryLight: '#0060bf',
      gradient: 'linear-gradient(135deg, #002a55 0%, #003d7a 40%, #0060bf 100%)',
      accent: '#e6a817',
    },
  },
];

export const DEFAULT_INSTITUT = INSTITUT_VARIANTEN[0];
