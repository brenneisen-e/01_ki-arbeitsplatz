// Single-color SVG-Wortmarken für jede Bank.
// Bewusst stark stilisiert (Whitelabel-Charakter), keine echten Markenrechte.
// Alle Logos zeichnen sich nur mit `currentColor`, damit sie via CSS einfärbbar sind.

export default function BankLogo({ bankId, height = 28 }) {
  const props = { height, role: 'img', 'aria-hidden': 'true' };

  switch (bankId) {
    case 'zukunftsbank':
      return (
        <svg {...props} viewBox="0 0 220 40" fill="none">
          <rect x="2" y="6" width="28" height="28" rx="6" fill="currentColor" />
          <text x="16" y="26" textAnchor="middle" fontSize="14" fontWeight="800" fontFamily="DM Sans, system-ui" fill="white">Z</text>
          <text x="40" y="27" fontSize="18" fontWeight="800" fontFamily="DM Sans, system-ui" fill="currentColor" letterSpacing="-0.3">Zukunftsbank</text>
        </svg>
      );
    case 'nordlb':
      return (
        <svg {...props} viewBox="0 0 180 40" fill="none">
          <rect x="2" y="8" width="38" height="24" rx="2" fill="currentColor" />
          <text x="21" y="26" textAnchor="middle" fontSize="13" fontWeight="800" fontFamily="DM Sans, system-ui" fill="white">N</text>
          <text x="48" y="27" fontSize="18" fontWeight="800" fontFamily="DM Sans, system-ui" fill="currentColor" letterSpacing="0.5">NORD/LB</text>
        </svg>
      );
    case 'sparkasse':
      return (
        <svg {...props} viewBox="0 0 200 40" fill="none">
          <rect x="2" y="6" width="28" height="28" rx="4" fill="currentColor" />
          <path d="M10 14 h12 M10 18 h12 M10 22 h12 M10 26 h12" stroke="white" strokeWidth="1.5" />
          <text x="38" y="27" fontSize="18" fontWeight="800" fontFamily="DM Sans, system-ui" fill="currentColor" letterSpacing="-0.2">Sparkasse</text>
        </svg>
      );
    case 'commerzbank':
      return (
        <svg {...props} viewBox="0 0 240 40" fill="none">
          <circle cx="20" cy="20" r="13" stroke="currentColor" strokeWidth="3" fill="none" />
          <path d="M14 14 L26 26 M26 14 L14 26" stroke="currentColor" strokeWidth="2.5" />
          <text x="42" y="27" fontSize="17" fontWeight="800" fontFamily="DM Sans, system-ui" fill="currentColor" letterSpacing="0.5">COMMERZBANK</text>
        </svg>
      );
    case 'deutschebank':
      return (
        <svg {...props} viewBox="0 0 200 40" fill="none">
          <rect x="4" y="8" width="28" height="24" stroke="currentColor" strokeWidth="2.5" fill="none" />
          <line x1="4" y1="32" x2="32" y2="8" stroke="currentColor" strokeWidth="2.5" />
          <text x="40" y="27" fontSize="16" fontWeight="700" fontFamily="DM Sans, system-ui" fill="currentColor" letterSpacing="0">Deutsche Bank</text>
        </svg>
      );
    case 'ing':
      return (
        <svg {...props} viewBox="0 0 100 40" fill="none">
          <text x="6" y="30" fontSize="26" fontWeight="900" fontFamily="DM Sans, system-ui" fill="currentColor" fontStyle="italic" letterSpacing="-1">ING</text>
          <circle cx="74" cy="20" r="6" fill="currentColor" />
        </svg>
      );
    case 'volksbank':
      return (
        <svg {...props} viewBox="0 0 220 40" fill="none">
          <path d="M4 10 L16 30 L28 10" stroke="currentColor" strokeWidth="3" fill="none" strokeLinejoin="round" />
          <path d="M14 10 L26 30 L38 10" stroke="currentColor" strokeWidth="3" fill="none" strokeLinejoin="round" opacity="0.55" />
          <text x="48" y="27" fontSize="17" fontWeight="800" fontFamily="DM Sans, system-ui" fill="currentColor" letterSpacing="-0.2">Volksbank</text>
        </svg>
      );
    case 'dkb':
      return (
        <svg {...props} viewBox="0 0 120 40" fill="none">
          <rect x="2" y="8" width="36" height="24" rx="3" fill="currentColor" />
          <text x="20" y="26" textAnchor="middle" fontSize="13" fontWeight="800" fontFamily="DM Sans, system-ui" fill="white" letterSpacing="0.5">DKB</text>
          <text x="46" y="27" fontSize="15" fontWeight="700" fontFamily="DM Sans, system-ui" fill="currentColor">Deutsche Kreditbank</text>
        </svg>
      );
    case 'hvb':
      return (
        <svg {...props} viewBox="0 0 220 40" fill="none">
          <rect x="2" y="8" width="34" height="24" rx="2" fill="currentColor" />
          <text x="19" y="26" textAnchor="middle" fontSize="12" fontWeight="800" fontFamily="DM Sans, system-ui" fill="white">HVB</text>
          <text x="44" y="27" fontSize="14" fontWeight="700" fontFamily="DM Sans, system-ui" fill="currentColor">HypoVereinsbank</text>
        </svg>
      );
    default:
      return (
        <svg {...props} viewBox="0 0 120 40" fill="none">
          <rect x="2" y="8" width="116" height="24" rx="3" fill="currentColor" opacity="0.1" />
          <text x="60" y="27" textAnchor="middle" fontSize="14" fontWeight="700" fontFamily="DM Sans, system-ui" fill="currentColor">Bank</text>
        </svg>
      );
  }
}
