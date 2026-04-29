interface DataPulseProps {
  from: { x: number; y: number }
  to:   { x: number; y: number }
  /** Versatz in Sekunden, damit mehrere Pulse zeitlich gestaffelt laufen */
  delay?: number
  color?: string
}

/**
 * Animierter Lichtpunkt entlang einer "Datenleitung" zwischen zwei
 * Etagen-Koordinaten. Wirkt wie ein Pulsfluss aufwärts/abwärts.
 */
export function DataPulse({ from, to, delay = 0, color = '#3ba4f5' }: DataPulseProps) {
  const pathId = `dp-${from.x}-${from.y}-${to.x}-${to.y}`
  // Leichte Bezier-Kurve damit's nicht starr aussieht
  const cx = (from.x + to.x) / 2 + 12
  const cy = (from.y + to.y) / 2
  const d = `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`

  return (
    <g>
      {/* Leitung */}
      <path d={d} stroke={color} strokeOpacity="0.18" strokeWidth="2" fill="none" />
      <path id={pathId} d={d} stroke="none" fill="none" />
      {/* Lichtpunkt mit Glow-Trail */}
      <circle r="3.5" fill={color}>
        <animate attributeName="opacity" values="0;1;1;0" dur="2.6s" begin={`${delay}s`} repeatCount="indefinite" />
        <animateMotion dur="2.6s" begin={`${delay}s`} repeatCount="indefinite">
          <mpath href={`#${pathId}`} />
        </animateMotion>
      </circle>
      <circle r="6" fill={color} opacity="0.25">
        <animate attributeName="opacity" values="0;0.45;0" dur="2.6s" begin={`${delay}s`} repeatCount="indefinite" />
        <animateMotion dur="2.6s" begin={`${delay}s`} repeatCount="indefinite">
          <mpath href={`#${pathId}`} />
        </animateMotion>
      </circle>
    </g>
  )
}
