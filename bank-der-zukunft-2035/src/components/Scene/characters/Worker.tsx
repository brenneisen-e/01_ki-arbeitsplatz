interface WorkerProps {
  x: number
  y: number
  /** 'sit' = sitzt am Schreibtisch (Tipp-Animation an Tastatur)
   *  'walk-x' = bewegt sich horizontal (z. B. zwischen Server-Racks)
   *  'idle' = steht und atmet */
  variant: 'sit' | 'walk-x' | 'idle'
  shirt?: string
  /** Walk-Range für Variante 'walk-x' (in SVG-Units relativ zu x) */
  walkRange?: number
  /** Sekunden pro Walk-Loop */
  walkDur?: number
}

/**
 * Mitarbeiter-Figur (Berater / Operations / IT).
 * Geriggt: Kopf, Torso, Arme, Beine — mit subtilen Idle-/Tipp-Animationen.
 */
export function Worker({
  x, y, variant, shirt = '#2a3a55', walkRange = 80, walkDur = 6,
}: WorkerProps) {
  const skin = '#e8c39a'
  const trousers = '#1c2a3f'

  return (
    <g transform={`translate(${x}, ${y})`}>
      {variant === 'walk-x' && (
        <animateTransform
          attributeName="transform"
          type="translate"
          values={`${x},${y}; ${x + walkRange},${y - 1}; ${x},${y}`}
          dur={`${walkDur}s`}
          repeatCount="indefinite"
        />
      )}

      {/* Beine */}
      {variant === 'sit' ? (
        <>
          {/* Sitzend: Beine waagerecht nach vorne */}
          <rect x="-7" y="-6" width="20" height="6" fill={trousers} />
        </>
      ) : (
        <>
          <rect x="-6" y="-4" width="5" height="28" fill={trousers}>
            {variant === 'walk-x' && (
              <animate attributeName="transform" attributeType="XML" type="rotate"
                       values="0 0 0; 22 0 0; -22 0 0; 0 0 0" dur="0.8s" repeatCount="indefinite" />
            )}
          </rect>
          <rect x="1" y="-4" width="5" height="28" fill={trousers}>
            {variant === 'walk-x' && (
              <animate attributeName="transform" attributeType="XML" type="rotate"
                       values="0 0 0; -22 0 0; 22 0 0; 0 0 0" dur="0.8s" repeatCount="indefinite" />
            )}
          </rect>
        </>
      )}

      {/* Mantel/Hemd */}
      <rect x="-11" y="-28" width="22" height="26" rx="5" fill={shirt} />
      {/* Kopf */}
      <circle cx="0" cy="-38" r="10" fill={skin} stroke="#0f1d33" strokeWidth="0.6" />
      {/* Haare */}
      <path d="M -10 -42 q 10 -10 20 0 v 3 q -10 -6 -20 0 z" fill="#1f2937" />

      {variant === 'sit' && (
        <>
          {/* Tipp-Arme */}
          <rect x="-9" y="-22" width="2.5" height="14" fill={shirt}>
            <animate attributeName="height" values="14;11;14;13;14" dur="0.6s" repeatCount="indefinite" />
          </rect>
          <rect x="6.5" y="-22" width="2.5" height="14" fill={shirt}>
            <animate attributeName="height" values="14;13;14;11;14" dur="0.6s" repeatCount="indefinite" />
          </rect>
        </>
      )}

      {/* Idle-Atmen */}
      {variant !== 'walk-x' && (
        <animateTransform attributeName="transform" type="translate" additive="sum"
                          values="0,0; 0,-1; 0,0" dur="3.2s" repeatCount="indefinite" />
      )}
    </g>
  )
}
