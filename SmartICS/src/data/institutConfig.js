const LOGO_TOKEN = 'pk_H7vb5Y2lTsW47U4Xq-w3HA';
export const logoUrl = (domain) => `https://img.logo.dev/${domain}?token=${LOGO_TOKEN}&format=png`;

export function getInstitutLogoUrl(variant) {
  if (!variant.domain) return null;
  return logoUrl(variant.domain);
}

export const INSTITUT_VARIANTEN = [
  {
    institut: 'Smart ICS',
    domain: null,
    mode: 'generic',
    tagline: 'Whitelabel-Demo der Smart ICS Plattform',
    colors: {
      primary: '#0F4D2A',
      primaryLight: '#1D7B3F',
      gradient: 'linear-gradient(135deg, #0F4D2A 0%, #1D7B3F 45%, #5A8F19 100%)',
      accent: '#86BC25',
    },
  },
  {
    institut: 'Deutsche Bank',
    domain: 'db.com',
    mode: 'bank',
    tagline: 'Konzern-IKS für Kreditinstitute',
    colors: {
      primary: '#003C82',
      primaryLight: '#0056b3',
      gradient: 'linear-gradient(135deg, #00214d 0%, #003C82 45%, #0056b3 100%)',
      accent: '#5b8def',
    },
  },
  {
    institut: 'Commerzbank',
    domain: 'commerzbank.de',
    mode: 'bank',
    tagline: 'IKS für Mittelstandsbanken',
    colors: {
      primary: '#FFCC00',
      primaryLight: '#E2B300',
      gradient: 'linear-gradient(135deg, #806600 0%, #B38F00 45%, #E2B300 100%)',
      accent: '#1B2B4B',
    },
  },
  {
    institut: 'NORD/LB',
    domain: 'nordlb.de',
    mode: 'bank',
    tagline: 'Landesbank-IKS',
    colors: {
      primary: '#003E68',
      primaryLight: '#0056A4',
      gradient: 'linear-gradient(135deg, #002844 0%, #003E68 45%, #0056A4 100%)',
      accent: '#FFC72C',
    },
  },
  {
    institut: 'Sparkasse',
    domain: 'sparkasse.de',
    mode: 'bank',
    tagline: 'Sparkassen-IKS-Regelkreis',
    colors: {
      primary: '#FF0000',
      primaryLight: '#C8102E',
      gradient: 'linear-gradient(135deg, #8c0b20 0%, #C8102E 45%, #FF0000 100%)',
      accent: '#1B2B4B',
    },
  },
  {
    institut: 'ERGO',
    domain: 'ergo.de',
    mode: 'insurance',
    tagline: 'Versicherungs-IKS',
    colors: {
      primary: '#86181d',
      primaryLight: '#C8102E',
      gradient: 'linear-gradient(135deg, #5a1018 0%, #86181d 45%, #a02028 100%)',
      accent: '#e8c547',
    },
  },
  {
    institut: 'Allianz',
    domain: 'allianz.de',
    mode: 'insurance',
    tagline: 'Versicherer-IKS',
    colors: {
      primary: '#003781',
      primaryLight: '#0056b3',
      gradient: 'linear-gradient(135deg, #002255 0%, #003781 45%, #0056b3 100%)',
      accent: '#009ee0',
    },
  },
  {
    institut: 'Munich Re',
    domain: 'munichre.com',
    mode: 'insurance',
    tagline: 'Rückversicherer-IKS',
    colors: {
      primary: '#69BE28',
      primaryLight: '#7FD13B',
      gradient: 'linear-gradient(135deg, #2F5A12 0%, #69BE28 45%, #7FD13B 100%)',
      accent: '#0F172A',
    },
  },
];

export const DEFAULT_INSTITUT = INSTITUT_VARIANTEN.find(v => v.institut === 'Smart ICS') || INSTITUT_VARIANTEN[0];
