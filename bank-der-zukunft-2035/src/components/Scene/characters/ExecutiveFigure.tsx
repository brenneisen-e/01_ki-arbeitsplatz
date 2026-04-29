interface ExecutiveProps {
  x: number
  y: number
  /** 'left' = sitzt links am Tisch (Körper Richtung Tischmitte gedreht)
   *  'right' = sitzt rechts (gespiegelt) */
  facing: 'left' | 'right'
  shirt?: string
}

/**
 * Vorstandsmitglied am ovalen Konferenztisch. Sitzt mit leicht
 * gedrehtem Torso. Subtile Atmungs-/Kopf-Idle-Anim.
 */
export function ExecutiveFigure({ x, y, facing, shirt = '#1f2c43' }: ExecutiveProps) {
  const skin = '#e8c39a'
  const flip = facing === 'right' ? -1 : 1
  return (
    <g transform={`translate(${x}, ${y}) scale(${flip}, 1)`}>
      {/* Stuhllehne hinter der Figur */}
      <rect x="-15" y="-32" width="30" height="36" rx="4" fill="#283648" />
      {/* Mantel */}
      <rect x="-13" y="-30" width="26" height="30" rx="6" fill={shirt} />
      {/* Hemd-V */}
      <polygon points="-3,-26 3,-26 0,-18" fill="#f3f6fb" />
      <polygon points="-2.5,-26 0,-21 2.5,-26" fill="#3ba4f5" />
      {/* Kopf — leicht zur Tischmitte gedreht */}
      <circle cx="2" cy="-40" r="11" fill={skin} stroke="#0f1d33" strokeWidth="0.6" />
      {/* Haare */}
      <path d="M -8 -45 q 10 -10 22 0 v 3 q -10 -6 -22 0 z" fill="#1f2937" />
      {/* Idle: leichtes Kopfnicken */}
      <animateTransform attributeName="transform" type="translate" additive="sum"
                        values="0,0; 0,-0.6; 0,0" dur="3.6s" repeatCount="indefinite" />
    </g>
  )
}
