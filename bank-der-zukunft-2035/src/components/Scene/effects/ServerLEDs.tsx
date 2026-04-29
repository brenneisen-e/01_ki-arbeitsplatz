interface ServerLEDsProps {
  x: number
  y: number
  /** Anzahl Racks (jeder mit 2-3 LEDs) */
  count?: number
  /** Abstand zwischen Racks */
  spacing?: number
}

/**
 * Stapel von Server-Racks mit gestaffelt blinkenden grün/blauen LEDs.
 * Verwendet in der Keller-Etage.
 */
export function ServerLEDs({ x, y, count = 3, spacing = 50 }: ServerLEDsProps) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      {Array.from({ length: count }).map((_, i) => (
        <g key={i} transform={`translate(${i * spacing}, 0)`}>
          {/* Rack-Gehäuse */}
          <rect x="0" y="0" width="36" height="78" rx="2" fill="#0a1628" stroke="#1f2c3f" />
          {/* LEDs */}
          <circle cx="6" cy="8" r="2.6" fill="#3eb87b">
            <animate attributeName="opacity" values="1;0.2;1" dur="1.6s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
          </circle>
          <circle cx="14" cy="8" r="2.6" fill="#3ba4f5">
            <animate attributeName="opacity" values="1;0.2;1" dur="1.6s" begin={`${i * 0.4 + 0.2}s`} repeatCount="indefinite" />
          </circle>
          <circle cx="22" cy="8" r="2.6" fill="#f5b03b">
            <animate attributeName="opacity" values="1;0.4;1" dur="2.4s" begin={`${i * 0.4 + 0.6}s`} repeatCount="indefinite" />
          </circle>
          {/* Slot-Lines */}
          {[20, 28, 36, 44, 52, 60].map((sy) => (
            <rect key={sy} x="4" y={sy} width="28" height="3" fill="#1f2c3f" />
          ))}
        </g>
      ))}
    </g>
  )
}
