// Bank-Stammdaten inklusive Markenfarben & SVG-Wortmarken (single-color logos).
// Logos sind bewusst als einfarbige Wortmarken gehalten, um die Vorgaben aus
// CLAUDE.md (keine Multi-Color-/Gradient-Icons) einzuhalten.

// Logo-Service (logo.dev) – identisch zur HR-Pipeline-Konfiguration.
const LOGO_TOKEN = 'pk_H7vb5Y2lTsW47U4Xq-w3HA';
export const logoUrl = (domain) =>
  `https://img.logo.dev/${domain}?token=${LOGO_TOKEN}&format=png`;

export function getBankLogoUrl(bank) {
  if (!bank?.domain) return null;
  return logoUrl(bank.domain);
}

export const BANKS = [
  {
    id: 'zukunftsbank',
    name: 'Zukunftsbank',
    institut: 'Zukunftsbank',
    domain: null,
    mode: 'generic',
    tagline: 'Whitelabel-Demobank',
    colors: {
      primary: '#1e2a4a',
      primaryLight: '#2d3f6e',
      accent: '#5b8def',
      gradient: 'linear-gradient(135deg, #121a30 0%, #1e2a4a 45%, #2d3f6e 100%)',
    },
  },
  {
    id: 'nordlb',
    name: 'NordLB',
    institut: 'NordLB',
    domain: 'nordlb.de',
    mode: 'bank',
    tagline: 'Norddeutsche Landesbank',
    colors: {
      primary: '#003366',
      primaryLight: '#0055a4',
      accent: '#e30613',
      gradient: 'linear-gradient(135deg, #001f3f 0%, #003366 45%, #0055a4 100%)',
    },
  },
  {
    id: 'sparkasse',
    name: 'Sparkasse',
    institut: 'Sparkasse',
    domain: 'sparkasse.de',
    mode: 'bank',
    tagline: 'Sparkassen-Finanzgruppe',
    colors: {
      primary: '#cc0000',
      primaryLight: '#ff3333',
      accent: '#ffffff',
      gradient: 'linear-gradient(135deg, #990000 0%, #cc0000 45%, #ff1a1a 100%)',
    },
  },
  {
    id: 'commerzbank',
    name: 'Commerzbank',
    institut: 'Commerzbank',
    domain: 'commerzbank.de',
    mode: 'bank',
    tagline: 'Mittelstandsbank',
    colors: {
      primary: '#1a1a1a',
      primaryLight: '#3d3d3d',
      accent: '#ffcc00',
      gradient: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 45%, #333333 100%)',
    },
  },
  {
    id: 'deutschebank',
    name: 'Deutsche Bank',
    institut: 'Deutsche Bank',
    domain: 'db.com',
    mode: 'bank',
    tagline: 'Universalbank',
    colors: {
      primary: '#0018a8',
      primaryLight: '#0033cc',
      accent: '#ffffff',
      gradient: 'linear-gradient(135deg, #000d66 0%, #0018a8 45%, #0033cc 100%)',
    },
  },
  {
    id: 'ing',
    name: 'ING',
    institut: 'ING',
    domain: 'ing.de',
    mode: 'bank',
    tagline: 'Direktbank',
    colors: {
      primary: '#ff6200',
      primaryLight: '#ff8533',
      accent: '#ffffff',
      gradient: 'linear-gradient(135deg, #cc4e00 0%, #ff6200 45%, #ff8533 100%)',
    },
  },
  {
    id: 'volksbank',
    name: 'Volksbank',
    institut: 'Volksbank',
    domain: 'volksbank.de',
    mode: 'bank',
    tagline: 'Volks- und Raiffeisenbanken',
    colors: {
      primary: '#004d26',
      primaryLight: '#00843d',
      accent: '#7ab648',
      gradient: 'linear-gradient(135deg, #003318 0%, #004d26 45%, #006633 100%)',
    },
  },
  {
    id: 'dkb',
    name: 'DKB',
    institut: 'DKB',
    domain: 'dkb.de',
    mode: 'bank',
    tagline: 'Deutsche Kreditbank',
    colors: {
      primary: '#1463a0',
      primaryLight: '#1e88c2',
      accent: '#7ec8e3',
      gradient: 'linear-gradient(135deg, #0d4877 0%, #1463a0 45%, #1e88c2 100%)',
    },
  },
  {
    id: 'hvb',
    name: 'HypoVereinsbank',
    institut: 'HypoVereinsbank',
    domain: 'hvb.de',
    mode: 'bank',
    tagline: 'UniCredit Group',
    colors: {
      primary: '#e2001a',
      primaryLight: '#ff3333',
      accent: '#003366',
      gradient: 'linear-gradient(135deg, #a4000f 0%, #e2001a 45%, #ff3333 100%)',
    },
  },
];

// Backwards-Kompatibilität: einige Stellen lesen `bank.primary` / `bank.gradient`
// direkt. Wir spiegeln daher die wichtigsten Farb-Properties auf das Top-Level.
BANKS.forEach((b) => {
  b.primary = b.colors.primary;
  b.primaryLight = b.colors.primaryLight;
  b.accent = b.colors.accent;
  b.gradient = b.colors.gradient;
});

export function getBank(id) {
  return BANKS.find((b) => b.id === id) || BANKS[0];
}
