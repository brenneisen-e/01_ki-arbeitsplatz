import { useMarke } from './MarkeProvider'

/**
 * Abstrakte, einfarbige Bildmarke. Kein externer Abruf, keine
 * Farbverläufe, keine fremde Unternehmensmarke - die Form kommt
 * aus der Konfiguration, die Farbe aus currentColor.
 */
export function Bildmarke({ variante = 'raute', size = 26, strokeWidth = 1.6 }) {
  const gemein = {
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor',
    strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round',
    'aria-hidden': true, focusable: false,
  }

  if (variante === 'balken') {
    return (
      <svg {...gemein}>
        <rect x="2.5" y="2.5" width="19" height="19" rx="4" />
        <path d="M7 16.5V11" />
        <path d="M12 16.5V7.5" />
        <path d="M17 16.5v-3" />
      </svg>
    )
  }

  if (variante === 'ring') {
    return (
      <svg {...gemein}>
        <circle cx="12" cy="12" r="9.2" />
        <path d="M12 2.8a9.2 9.2 0 0 1 0 18.4" strokeWidth={strokeWidth * 2.1} />
        <circle cx="12" cy="12" r="3.1" />
      </svg>
    )
  }

  // Standard: Raute mit Mittelachse - steht für die Neutralitätswaage
  return (
    <svg {...gemein}>
      <path d="M12 2.6 21.4 12 12 21.4 2.6 12z" />
      <path d="M12 6.6v10.8" />
      <path d="M7.4 12h9.2" strokeWidth={strokeWidth * 1.5} />
    </svg>
  )
}

/** Bildmarke in einem gefüllten Feld - für Topbar und Kacheln */
export function MarkenFeld({ size = 30 }) {
  const { marke } = useMarke()
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: 'var(--vg-r-md)',
        background: 'var(--brand-600)',
        color: '#fff',
        flex: 'none',
      }}
    >
      <Bildmarke variante={marke.wortmarke} size={size * 0.62} strokeWidth={1.8} />
    </span>
  )
}

/** Vollständige Wortmarke: Feld, Produktname, Mandant */
export default function Wortmarke({ size = 30, mitText = true }) {
  const { marke } = useMarke()
  return (
    <span className="vg-topbar-marke">
      <MarkenFeld size={size} />
      {mitText && (
        <span className="vg-topbar-marke-text">
          <span className="vg-topbar-produkt">{marke.produktName}</span>
          <span className="vg-topbar-mandant">{marke.mandantName}</span>
        </span>
      )}
    </span>
  )
}
