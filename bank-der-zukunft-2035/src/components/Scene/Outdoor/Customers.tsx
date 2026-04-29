import { Customer } from '../characters/Customer'
import { useScene } from '../../../hooks/useScene'

/** Vorplatz mit 4 Kunden-Figuren rund um das Gebäude. */
export function Customers() {
  const setHover = useScene((s) => s.setHoverHotspot)

  return (
    <g>
      {/* Gepflasterter Weg zum Eingang */}
      <path d="M 100 960 Q 380 880, 600 840 T 800 800" stroke="#7d6448" strokeWidth="46" fill="none" strokeLinecap="round" />
      <path d="M 100 960 Q 380 880, 600 840 T 800 800" stroke="#a18167" strokeWidth="40" fill="none" strokeLinecap="round" />
      {[180, 280, 380, 480, 580, 680].map((cx, i) => (
        <ellipse key={i} cx={cx} cy={960 - i * 24} rx="22" ry="9" fill="#bfa17c" stroke="#7d6448" strokeWidth="1.5" />
      ))}

      {/* Kunde 1: telefoniert links */}
      <Customer
        x={150} y={900} variant="phone"
        onHoverEnter={() => setHover('customer-phone')}
        onHoverLeave={() => setHover(null)}
      />

      {/* Kunde 2: Video-Chat auf einer Bank */}
      <g transform="translate(1240, 880)">
        <rect x="-44" y="14" width="88" height="6" fill="#5a4225" />
        <rect x="-40" y="20" width="6" height="14" fill="#5a4225" />
        <rect x="34"  y="20" width="6" height="14" fill="#5a4225" />
      </g>
      <Customer
        x={1240} y={880} variant="video-chat"
        onHoverEnter={() => setHover('customer-video')}
        onHoverLeave={() => setHover(null)}
      />

      {/* Kunde 3: läuft Richtung Eingang */}
      <Customer
        x={680} y={920} variant="walking"
        onHoverEnter={() => setHover(null)}
        onHoverLeave={() => setHover(null)}
      />

      {/* Kunde 4: Banking-Pavillon mit holografischem Display */}
      <g transform="translate(1450, 880)">
        <rect x="-40" y="-58" width="80" height="58" fill="rgba(59,164,245,0.18)" stroke="var(--color-teal)" strokeWidth="1.5" rx="6" />
        <rect x="-32" y="-48" width="64" height="36" fill="var(--color-ink-2)" rx="3" />
        <line x1="-26" y1="-36" x2="26" y2="-36" stroke="var(--color-teal)" strokeWidth="1" opacity="0.7" />
        <line x1="-26" y1="-30" x2="18" y2="-30" stroke="var(--color-teal)" strokeWidth="1" opacity="0.5" />
        <text x="0" y="-12" textAnchor="middle" fontSize="9" fill="var(--color-teal)" fontFamily="var(--font-mono)">PAVILLON</text>
      </g>
      <Customer
        x={1500} y={920} variant="standing"
        onHoverEnter={() => setHover('customer-pavillon')}
        onHoverLeave={() => setHover(null)}
      />
    </g>
  )
}
