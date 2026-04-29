import { ExecutiveFigure } from '../characters/ExecutiveFigure'
import { AIAvatarSphere } from '../effects/AIAvatarSphere'
import { useScene } from '../../../hooks/useScene'

/**
 * Vorstands-Etage / KI-Steuerung — AI Governance Board.
 * Ovaler Konferenztisch, 6 Vorstandsmitglieder, KI-Avatar-Sphäre über
 * dem Tisch, großer Wandbildschirm mit AI-Governance-Cockpit.
 */
export function TopBoardroom() {
  const setHover = useScene((s) => s.setHoverHotspot)

  return (
    <g>
      {/* Bodenraster */}
      <rect x="430" y="370" width="740" height="6" fill="#1f2c3f" />

      {/* Wand-Display links: AI Governance Cockpit */}
      <g
        transform="translate(440, 220)"
        onMouseEnter={() => setHover('governance-cockpit')}
        onMouseLeave={() => setHover(null)}
        style={{ cursor: 'help' }}
      >
        <rect x="0" y="0" width="180" height="118" fill="#0a1628" stroke="#1f2c3f" rx="3" />
        <text x="90" y="14" textAnchor="middle" fontSize="8" fontFamily="var(--font-mono)" fill="#aab8c9">AI GOVERNANCE COCKPIT</text>

        {/* Knoten-Graph */}
        <g transform="translate(60, 60)">
          <circle cx="0" cy="0" r="6" fill="#3ba4f5" />
          {[0, 60, 120, 180, 240, 300].map((deg) => {
            const rad = (deg * Math.PI) / 180
            const x2 = Math.cos(rad) * 26
            const y2 = Math.sin(rad) * 26
            return (
              <g key={deg}>
                <line x1="0" y1="0" x2={x2} y2={y2} stroke="#3ba4f5" strokeOpacity="0.55" />
                <circle cx={x2} cy={y2} r="3" fill="#f5b03b" />
              </g>
            )
          })}
          <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="38s" repeatCount="indefinite" />
        </g>

        {/* Risiko-Heatmap rechts */}
        <g transform="translate(110, 28)">
          {[0, 1, 2, 3].map((row) =>
            [0, 1, 2, 3].map((col) => {
              const v = (row + col + 2) % 5
              const fill = v < 2 ? '#3eb87b' : v < 3 ? '#f5b03b' : '#f5614b'
              return (
                <rect key={`${row}-${col}`} x={col * 14} y={row * 14} width={12} height={12} fill={fill} opacity={0.85} />
              )
            })
          )}
          <text x="30" y="76" textAnchor="middle" fontSize="7" fontFamily="var(--font-mono)" fill="#aab8c9">RISK MAP</text>
        </g>

        {/* CAIDO Status Indicator */}
        <g transform="translate(0, 96)">
          <rect x="6" y="0" width="100" height="14" rx="7" fill="#11243d" />
          <circle cx="14" cy="7" r="4" fill="#3eb87b">
            <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
          </circle>
          <text x="22" y="10" fontSize="7" fontFamily="var(--font-mono)" fill="#3eb87b">CAIDO STATUS: GREEN</text>
        </g>
      </g>

      {/* Konferenztisch (oval) */}
      <ellipse cx="900" cy="320" rx="180" ry="36" fill="#5a4225" stroke="#3a2a14" strokeWidth="2" />
      <ellipse cx="900" cy="318" rx="172" ry="30" fill="#7a5d3b" />

      {/* 6 Vorstandsmitglieder */}
      <ExecutiveFigure x={760} y={310} facing="left"  shirt="#1f2c43" />
      <ExecutiveFigure x={830} y={300} facing="left"  shirt="#1a73c5" />
      <ExecutiveFigure x={900} y={296} facing="left"  shirt="#3a2a14" />
      <ExecutiveFigure x={970} y={300} facing="right" shirt="#1f2c43" />
      <ExecutiveFigure x={1040} y={310} facing="right" shirt="#1a73c5" />

      {/* KI-Avatar-Sphäre schwebt über dem Tisch */}
      <g
        onMouseEnter={() => setHover('ai-avatar')}
        onMouseLeave={() => setHover(null)}
        style={{ cursor: 'help' }}
      >
        <AIAvatarSphere x={900} y={250} r={20} />
        <animateTransform attributeName="transform" type="translate" values="0,0; 0,-4; 0,0" dur="4s" repeatCount="indefinite" />
      </g>

      {/* Floor-Label */}
      <text x={1170} y={376} textAnchor="end" fontSize="11" fontFamily="var(--font-mono)" fill="#6b7c92" letterSpacing="2">
        VORSTAND · AI GOVERNANCE
      </text>
    </g>
  )
}
