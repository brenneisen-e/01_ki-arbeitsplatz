interface CustomerProps {
  x: number
  y: number
  variant: 'phone' | 'video-chat' | 'walking' | 'standing'
  onHoverEnter?: () => void
  onHoverLeave?: () => void
}

/**
 * Stilisierte Kunden-Figur als geriggtes SVG. Premium-Look:
 * gedämpfte Wollfarben, klare Silhouette, monochrom.
 */
export function Customer({ x, y, variant, onHoverEnter, onHoverLeave }: CustomerProps) {
  const skin   = '#e8c39a'
  const coat   = variant === 'walking'    ? '#1a73c5'
              : variant === 'video-chat' ? '#2e3340'
              : variant === 'standing'   ? '#7a5d3b'
              : '#3eb87b'
  const trousers = '#162232'

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onMouseEnter={onHoverEnter}
      onMouseLeave={onHoverLeave}
      style={{ cursor: 'pointer' }}
    >
      {/* Beine */}
      <rect x="-7" y="-4" width="6" height="34" fill={trousers} />
      <rect x="1"  y="-4" width="6" height="34" fill={trousers} />
      {/* Mantel */}
      <rect x="-13" y="-32" width="26" height="32" rx="6" fill={coat} />
      {/* Kopf */}
      <circle cx="0" cy="-44" r="12" fill={skin} stroke="#0f1d33" strokeWidth="0.6" />
      {/* Haare */}
      <path d="M -12 -50 q 12 -14 24 0 v 4 q -12 -8 -24 0 z" fill="#1f2937" />

      {variant === 'phone' && (
        <>
          {/* Ein Arm hält Telefon ans Ohr */}
          <rect x="9" y="-32" width="3" height="14" fill={coat} transform="rotate(-30 10 -25)" />
          <rect x="11" y="-46" width="6" height="9" rx="1.5" fill="#0f1d33" />
          {/* Sprechblase */}
          <g transform="translate(28, -52)">
            <rect x="0" y="0" width="64" height="22" rx="11" fill="white" stroke="#0f1d33" strokeWidth="0.8" />
            <polygon points="-3,18 5,18 0,24" fill="white" stroke="#0f1d33" strokeWidth="0.8" />
            <text x="32" y="14" textAnchor="middle" fontSize="9" fill="#0f1d33" fontFamily="var(--font-display)">Bank-Hotline</text>
          </g>
        </>
      )}

      {variant === 'video-chat' && (
        <>
          {/* Sitzhaltung: Beine waagerecht */}
          <rect x="-7" y="0" width="20" height="6" fill={trousers} />
          {/* Smartphone in beiden Händen */}
          <rect x="-10" y="-22" width="20" height="28" rx="3" fill="#0f1d33" />
          <rect x="-8"  y="-20" width="16" height="22" rx="1.5" fill="var(--color-ink-2)" />
          {/* KI-Avatar-Sphäre auf Display */}
          <circle cx="0" cy="-9" r="6" fill="var(--color-teal)" opacity="0.85">
            <animate attributeName="r" values="5.5;6.5;5.5" dur="3.5s" repeatCount="indefinite" />
          </circle>
        </>
      )}

      {variant === 'walking' && (
        <>
          {/* Arm mit Aktentasche */}
          <rect x="-13" y="-26" width="3" height="14" fill={coat} transform="rotate(15 -11 -19)" />
          <rect x="-22" y="-12" width="14" height="10" rx="1.5" fill="#3a2a14" />
        </>
      )}

      {/* Idle-Atmen — sehr subtil */}
      <animateTransform
        attributeName="transform"
        type="translate"
        additive="sum"
        values="0,0; 0,-1.2; 0,0"
        dur="3s"
        repeatCount="indefinite"
      />
    </g>
  )
}
