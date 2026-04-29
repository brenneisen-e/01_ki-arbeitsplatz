import { Worker } from '../characters/Worker'
import { DashboardLoop } from '../effects/DashboardLoop'
import { useScene } from '../../../hooks/useScene'

/**
 * Erdgeschoss — Operations & Process Mining.
 * Open-Space mit 4 Mitarbeitern, animierten Dashboards, Process-Mining-
 * Display und einem RPA-Bot der sich zwischen zwei Stationen bewegt.
 */
export function GroundOperations() {
  const setHover = useScene((s) => s.setHoverHotspot)

  // 4 Schreibtische auf einer Linie
  const desks = [
    { x: 510, dash: 'line'  as const },
    { x: 660, dash: 'donut' as const },
    { x: 820, dash: 'kpi'   as const },
    { x: 980, dash: 'line'  as const },
  ]

  return (
    <g>
      {/* Bodenraster */}
      <rect x="430" y="550" width="740" height="6" fill="#1f2c3f" />

      {/* 4 Schreibtische */}
      {desks.map((d, i) => (
        <g key={d.x} transform={`translate(${d.x}, 480)`}>
          {/* Schreibtisch */}
          <rect x="-50" y="50" width="100" height="6" fill="#5a4225" />
          <rect x="-48" y="56" width="4" height="14" fill="#5a4225" />
          <rect x="44"  y="56" width="4" height="14" fill="#5a4225" />
          {/* Bildschirm */}
          <DashboardLoop x={-44} y={-12} width={88} height={56} variant={d.dash} />
          {/* Mitarbeiter dahinter, sitzend */}
          <Worker x={0} y={70} variant="sit" shirt={i % 2 ? '#1a73c5' : '#2a3a55'} />
        </g>
      ))}

      {/* Process Mining Display rechts */}
      <g
        transform="translate(1090, 460)"
        onMouseEnter={() => setHover('process-mining')}
        onMouseLeave={() => setHover(null)}
        style={{ cursor: 'help' }}
      >
        <rect x="-40" y="-10" width="80" height="100" fill="#0a1628" stroke="#1f2c3f" rx="2" />
        <text x="0" y="2" textAnchor="middle" fontSize="8" fontFamily="var(--font-mono)" fill="#aab8c9">PROCESS MINING</text>
        {/* Knoten + Pfeile */}
        {[
          { cx: -20, cy: 22 }, { cx: 20, cy: 22 }, { cx: 0, cy: 50 }, { cx: -20, cy: 78 }, { cx: 20, cy: 78 },
        ].map((n, i) => (
          <circle key={i} cx={n.cx} cy={n.cy} r="6" fill="#3ba4f5" opacity="0.85" />
        ))}
        <line x1={-20} y1={22} x2={0}   y2={50} stroke="#3ba4f5" strokeWidth="1.4" />
        <line x1={20}  y1={22} x2={0}   y2={50} stroke="#3ba4f5" strokeWidth="1.4" />
        <line x1={0}   y1={50} x2={-20} y2={78} stroke="#3ba4f5" strokeWidth="1.4" strokeDasharray="3 3">
          <animate attributeName="stroke-dashoffset" values="0;-12;0" dur="2s" repeatCount="indefinite" />
        </line>
        <line x1={0}   y1={50} x2={20}  y2={78} stroke="#3ba4f5" strokeWidth="1.4" strokeDasharray="3 3">
          <animate attributeName="stroke-dashoffset" values="0;12;0" dur="2s" repeatCount="indefinite" />
        </line>
      </g>

      {/* RPA-Bot pendelt zwischen zwei Stationen */}
      <g
        onMouseEnter={() => setHover('rpa-bot')}
        onMouseLeave={() => setHover(null)}
        style={{ cursor: 'help' }}
      >
        <g transform="translate(490, 540)">
          <animateTransform attributeName="transform" type="translate"
                            values="490,540; 1040,540; 490,540" dur="14s" repeatCount="indefinite" />
          {/* Mini-Bot */}
          <rect x="-9" y="-14" width="18" height="14" fill="#aab8c9" stroke="#0f1d33" strokeWidth="0.8" rx="2" />
          <circle cx="-3" cy="-9" r="1.6" fill="#3ba4f5" />
          <circle cx="3"  cy="-9" r="1.6" fill="#3ba4f5" />
          <rect x="-7" y="0" width="14" height="2" fill="#0f1d33" />
          <rect x="-7" y="2" width="3" height="6" fill="#0f1d33" />
          <rect x="4"  y="2" width="3" height="6" fill="#0f1d33" />
        </g>
      </g>

      {/* Whiteboard hinter den Schreibtischen */}
      <g transform="translate(490, 396)">
        <rect x="0" y="0" width="180" height="68" fill="#f8fafc" stroke="#1f2c3f" rx="2" />
        <text x="6" y="14" fontSize="8" fontFamily="var(--font-display)" fontWeight="700" fill="#0f1d33">HYPERAUTOMATION</text>
        {/* Schematische Boxen + Pfeile */}
        {[10, 60, 110].map((bx, i) => (
          <g key={i} transform={`translate(${bx}, 24)`}>
            <rect x="0" y="0" width="40" height="20" fill="none" stroke="#1f2c3f" strokeWidth="1" rx="2" />
            <text x="20" y="13" textAnchor="middle" fontSize="7" fill="#1f2c3f" fontFamily="var(--font-mono)">
              {i === 0 ? 'INPUT' : i === 1 ? 'KI/RPA' : 'OUTPUT'}
            </text>
          </g>
        ))}
        <line x1={50} y1={34} x2={68} y2={34} stroke="#1f2c3f" strokeWidth="1" markerEnd="url(#arr)" />
        <line x1={100} y1={34} x2={118} y2={34} stroke="#1f2c3f" strokeWidth="1" markerEnd="url(#arr)" />
        <defs>
          <marker id="arr" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L6,3 L0,6 z" fill="#1f2c3f" />
          </marker>
        </defs>
      </g>

      {/* Floor-Label */}
      <text x={1170} y={556} textAnchor="end" fontSize="11" fontFamily="var(--font-mono)" fill="#6b7c92" letterSpacing="2">
        ERDGESCHOSS · OPERATIONS
      </text>
    </g>
  )
}
