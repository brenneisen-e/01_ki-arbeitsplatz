interface DashboardLoopProps {
  x: number
  y: number
  width?: number
  height?: number
  variant?: 'line' | 'donut' | 'kpi'
}

/**
 * Animiertes KPI-Dashboard auf einem Office-Bildschirm. 3 Varianten:
 *  - 'line':   wachsende Linecharts mit Tween
 *  - 'donut':  rotierender Donut mit pulsierender Mitte
 *  - 'kpi':    Zähler-Animation auf großen Zahlen
 */
export function DashboardLoop({
  x, y, width = 88, height = 56, variant = 'line',
}: DashboardLoopProps) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="0" y="0" width={width} height={height} fill="#0a1628" stroke="#1f2c3f" rx="2" />
      {variant === 'line' && (
        <>
          {/* Achsen */}
          <line x1="6" y1={height - 6} x2={width - 4} y2={height - 6} stroke="#1f2c3f" strokeWidth="1" />
          <line x1="6" y1="8" x2="6" y2={height - 6} stroke="#1f2c3f" strokeWidth="1" />
          {/* Linie wächst */}
          <polyline
            points={`6,${height - 12} 22,${height - 18} 38,${height - 14} 54,${height - 26} 70,${height - 22} ${width - 6},${height - 32}`}
            stroke="#3ba4f5" strokeWidth="2" fill="none" strokeLinejoin="round"
            strokeDasharray="220" strokeDashoffset="220">
            <animate attributeName="stroke-dashoffset" values="220;0;0;220" dur="6s" repeatCount="indefinite" />
          </polyline>
          {/* Zweite Linie verzögert */}
          <polyline
            points={`6,${height - 8} 22,${height - 12} 38,${height - 11} 54,${height - 18} 70,${height - 16} ${width - 6},${height - 24}`}
            stroke="#f5b03b" strokeWidth="1.6" fill="none" strokeLinejoin="round"
            strokeDasharray="220" strokeDashoffset="220" opacity="0.85">
            <animate attributeName="stroke-dashoffset" values="220;0;0;220" dur="6s" begin="0.6s" repeatCount="indefinite" />
          </polyline>
        </>
      )}
      {variant === 'donut' && (
        <>
          <circle cx={width / 2} cy={height / 2} r={Math.min(width, height) / 3} fill="none" stroke="#1f2c3f" strokeWidth="6" />
          <circle cx={width / 2} cy={height / 2} r={Math.min(width, height) / 3}
                  fill="none" stroke="#3ba4f5" strokeWidth="6"
                  strokeDasharray="120" strokeDashoffset="40"
                  transform={`rotate(-90 ${width / 2} ${height / 2})`}>
            <animate attributeName="stroke-dashoffset" values="120;30;120" dur="5s" repeatCount="indefinite" />
          </circle>
          <text x={width / 2} y={height / 2 + 4} textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="#3ba4f5">62%</text>
        </>
      )}
      {variant === 'kpi' && (
        <>
          <text x={width / 2} y={26} textAnchor="middle" fontSize="22" fontFamily="var(--font-mono)" fontWeight="700" fill="#3ba4f5">
            <animate attributeName="opacity" values="0;1;1;0;1" dur="6s" repeatCount="indefinite" />
            12.4M
          </text>
          <text x={width / 2} y={46} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="#aab8c9">EUR / DAY</text>
        </>
      )}
    </g>
  )
}
