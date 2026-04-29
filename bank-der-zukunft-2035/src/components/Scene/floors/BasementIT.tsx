import { ServerLEDs } from '../effects/ServerLEDs'
import { Worker } from '../characters/Worker'
import { useScene } from '../../../hooks/useScene'

/**
 * Keller — IT & Daten-Backbone.
 * Server-Racks, Code-Monitor, ein wandernder IT-Mitarbeiter.
 * Inneninhalt — wird vom Floor-Wrapper auf x=420..1180, y=560..740 platziert.
 */
export function BasementIT() {
  const setHover = useScene((s) => s.setHoverHotspot)

  return (
    <g>
      {/* Bodenraster */}
      <rect x="430" y="730" width="740" height="6" fill="#1f2c3f" />

      {/* Linke Server-Racks-Bank */}
      <g
        onMouseEnter={() => setHover('server-rack')}
        onMouseLeave={() => setHover(null)}
        style={{ cursor: 'help' }}
      >
        <ServerLEDs x={460} y={620} count={4} spacing={50} />
        <text x={460} y={616} fontSize="10" fill="#aab8c9" fontFamily="var(--font-mono)">CORE-DC-A</text>
      </g>

      {/* Rechte Server-Racks-Bank */}
      <g
        onMouseEnter={() => setHover('server-rack')}
        onMouseLeave={() => setHover(null)}
        style={{ cursor: 'help' }}
      >
        <ServerLEDs x={920} y={620} count={4} spacing={50} />
        <text x={920} y={616} fontSize="10" fill="#aab8c9" fontFamily="var(--font-mono)">CORE-DC-B</text>
      </g>

      {/* Mittlerer Code-Monitor */}
      <g transform="translate(720, 600)">
        <rect x="0" y="0" width="160" height="98" rx="3" fill="#0a1628" stroke="#1f2c3f" />
        {/* Terminal-Header */}
        <rect x="0" y="0" width="160" height="14" fill="#11243d" />
        <circle cx="8" cy="7" r="2" fill="#3eb87b" />
        <circle cx="16" cy="7" r="2" fill="#f5b03b" />
        <text x="80" y="11" textAnchor="middle" fontSize="8" fontFamily="var(--font-mono)" fill="#aab8c9">stream.tail — events/sec</text>
        {/* Code-Zeilen die scrollen */}
        <g fontFamily="var(--font-mono)" fontSize="7" fill="#3ba4f5">
          <text x="6" y="28">[ok] kafka topic=tx-stream lag=0</text>
          <text x="6" y="40">[ok] llm-gw req=128 cache=92%</text>
          <text x="6" y="52" fill="#3eb87b">[ok] feature-store healthy</text>
          <text x="6" y="64">[ok] vector-search p95=42ms</text>
          <text x="6" y="76" fill="#f5b03b">[warn] retrain queue=3</text>
          <text x="6" y="88">[ok] policy-layer enforced</text>
          <animate attributeName="transform" type="translate" values="0,0; 0,-12; 0,0" dur="4s" repeatCount="indefinite" />
        </g>
      </g>

      {/* Wandernder IT-Mitarbeiter zwischen Racks */}
      <Worker x={720} y={720} variant="walk-x" walkRange={120} walkDur={9} shirt="#1a73c5" />
      {/* Zweiter idle Worker rechts */}
      <Worker x={1080} y={720} variant="idle" shirt="#7a5d3b" />

      {/* Floor-Label */}
      <text x={1170} y={736} textAnchor="end" fontSize="11" fontFamily="var(--font-mono)" fill="#6b7c92" letterSpacing="2">
        KELLER · IT & DATEN
      </text>
    </g>
  )
}
