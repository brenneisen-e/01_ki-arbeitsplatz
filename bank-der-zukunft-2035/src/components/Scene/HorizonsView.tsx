import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { motion } from 'framer-motion'
import { HORIZONS } from '../../data/horizons'

/**
 * Interaktive 3-Horizonte-Matrix.
 *  - X-Achse: Veränderung
 *  - Y-Achse: Profit
 *  - Drei Kurven (grau / hellgrün / dunkelgrün) zeichnen sich beim
 *    Mount nacheinander von links nach rechts.
 *  - Status Quo & Zielbild als Punkte mit Pulse, dazwischen ein
 *    bogiger Pfeil von Status Quo nach oben → rechts zum Zielbild.
 *  - Technique-Etiketten sind klickbar/hoverbar — bei Hover schwebt
 *    eine kleine Beschreibungs-Card daneben ein.
 */
export function HorizonsView() {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [hovered, setHovered] = useState<{ horizon: number; technique: number } | null>(null)
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null)

  // Eintritts-Animation: Achsen → Kurven → Punkte → Pfeil → Labels
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })

    tl.from(svg.querySelectorAll('.axis-line'),  { opacity: 0, duration: 0.5, stagger: 0.1 })
      .from(svg.querySelectorAll('.curve'),      { strokeDashoffset: (_i, t) => (t as SVGPathElement).getTotalLength(), duration: 1.4, stagger: 0.25 }, '-=0.2')
      .from(svg.querySelectorAll('.dot'),        { scale: 0, transformOrigin: 'center', duration: 0.5, stagger: 0.1, ease: 'back.out(2)' }, '-=0.4')
      .from(svg.querySelectorAll('.journey'),    { strokeDashoffset: (_i, t) => (t as SVGPathElement).getTotalLength(), duration: 0.9 }, '-=0.3')
      .from(svg.querySelectorAll('.arrowhead'),  { scale: 0, transformOrigin: '50% 50%', duration: 0.4, ease: 'back.out(2)' }, '-=0.2')
      .from(svg.querySelectorAll('.h-label'),    { opacity: 0, y: 8, duration: 0.5, stagger: 0.1 }, '-=0.6')
      .from(svg.querySelectorAll('.tech-label'), { opacity: 0, y: 6, duration: 0.4, stagger: 0.04 }, '-=0.4')
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 flex items-center justify-center"
    >
      <div className="relative w-[min(94vw,1280px)] aspect-[16/9.2]">
        <svg ref={svgRef} viewBox="0 0 1280 720" className="w-full h-full" aria-label="3-Horizonte Ambition Matrix">
          <defs>
            <marker id="ambArrow" viewBox="0 0 12 12" refX="9" refY="6" markerWidth="9" markerHeight="9" orient="auto">
              <path d="M0,0 L12,6 L0,12 Z" fill="#86bc25" />
            </marker>
          </defs>

          {/* Achsen */}
          <line className="axis-line" x1="80"   y1="640" x2="1240" y2="640" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
          <line className="axis-line" x1="80"   y1="640" x2="80"   y2="80"  stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
          <text className="axis-line" x="34"   y="80"  fill="rgba(255,255,255,0.7)" fontSize="14" fontStyle="italic" fontFamily="var(--font-display)">Profit</text>
          <text className="axis-line" x="1180" y="685" fill="rgba(255,255,255,0.7)" fontSize="14" fontStyle="italic" fontFamily="var(--font-display)">Veränderung</text>

          {/* Drei Horizonte als Kurven */}
          <Curve d="M 80 510 Q 380 350 1240 410" color={HORIZONS[0].colorDeep} />
          <Curve d="M 80 540 Q 460 360 1240 270" color={HORIZONS[1].colorDeep} />
          <Curve d="M 80 580 Q 700 420 1240 130" color={HORIZONS[2].colorDeep} />

          {/* Status-Quo + Zielbild + Journey-Pfeil */}
          <DotWithLabel cx={350} cy={300} color={HORIZONS[1].colorDeep} label="Status Quo" align="left" />
          <DotWithLabel cx={1080} cy={140} color={HORIZONS[2].colorDeep} label="Zielbild" align="right" />
          <path className="journey" d="M 350 300 C 350 220 350 200 380 180 C 480 130 980 130 1080 140"
                stroke="#86bc25" strokeWidth="6" fill="none" strokeLinecap="round" markerEnd="url(#ambArrow)" />

          {/* Horizont-Beschriftungen */}
          <HorizonLabel x={250}  y={490} h={HORIZONS[0]} />
          <HorizonLabel x={520}  y={420} h={HORIZONS[1]} />
          <HorizonLabel x={830}  y={250} h={HORIZONS[2]} />

          {/* Technique-Spalten */}
          <TechColumn xCenter={230} yTop={580} h={HORIZONS[0]} hi={0}
                      hovered={hovered} setHovered={setHovered} setHoverPos={setHoverPos} svgRef={svgRef} />
          <TechColumn xCenter={560} yTop={520} h={HORIZONS[1]} hi={1}
                      hovered={hovered} setHovered={setHovered} setHoverPos={setHoverPos} svgRef={svgRef} />
          <TechColumn xCenter={1000} yTop={350} h={HORIZONS[2]} hi={2}
                      hovered={hovered} setHovered={setHovered} setHoverPos={setHoverPos} svgRef={svgRef} />
        </svg>

        {/* Hover-Card für Technique-Beschreibung */}
        {hovered && hoverPos && (
          <div
            className="glass-strong absolute rounded-xl px-4 py-3 pointer-events-none"
            style={{
              left: hoverPos.x, top: hoverPos.y,
              transform: 'translate(12px, -50%)',
              maxWidth: 280, zIndex: 10,
              borderColor: 'var(--line-hairline)',
            }}
          >
            <div className="mono-label mb-1" style={{ color: HORIZONS[hovered.horizon].color }}>
              {HORIZONS[hovered.horizon].label}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 14 }}>
              {HORIZONS[hovered.horizon].techniques[hovered.technique].name}
            </div>
            <p style={{ marginTop: 6, fontSize: 12, color: 'var(--color-ink-secondary)', lineHeight: 1.5 }}>
              {HORIZONS[hovered.horizon].techniques[hovered.technique].desc}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Sub-Komponenten ───────────────────────────────────────────────

function Curve({ d, color }: { d: string; color: string }) {
  return (
    <path
      className="curve"
      d={d}
      stroke={color}
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
      pathLength="1"
      style={{ strokeDasharray: 1 }}
    />
  )
}

function DotWithLabel({ cx, cy, color, label, align }: { cx: number; cy: number; color: string; label: string; align: 'left' | 'right' }) {
  const lx = align === 'left' ? cx - 22 : cx + 22
  const anchor = align === 'left' ? 'end' : 'start'
  return (
    <g>
      <circle className="dot" cx={cx} cy={cy} r="14" fill={color} opacity="0.25" />
      <circle className="dot" cx={cx} cy={cy} r="9"  fill={color} />
      <circle className="dot" cx={cx} cy={cy} r="22" fill="none" stroke={color} strokeOpacity="0.55" strokeWidth="1.5">
        <animate attributeName="r" values="22;30;22" dur="2.6s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.55;0;0.55" dur="2.6s" repeatCount="indefinite" />
      </circle>
      <text className="dot" x={lx} y={cy + 5} textAnchor={anchor} fill="white"
            fontFamily="var(--font-display)" fontWeight="500" fontSize="18">{label}</text>
    </g>
  )
}

function HorizonLabel({ x, y, h }: { x: number; y: number; h: typeof import('../../data/horizons').HORIZONS[number] }) {
  return (
    <g className="h-label">
      <text x={x} y={y} fill="white" fontFamily="var(--font-display)" fontWeight="600" fontSize="20">{h.label}</text>
      <text x={x} y={y + 22} fill="rgba(255,255,255,0.6)" fontFamily="var(--font-display)" fontStyle="italic" fontSize="14">{h.subtitle}</text>
    </g>
  )
}

interface TechColumnProps {
  xCenter: number
  yTop: number
  h: typeof import('../../data/horizons').HORIZONS[number]
  hi: number
  hovered: { horizon: number; technique: number } | null
  setHovered: (v: { horizon: number; technique: number } | null) => void
  setHoverPos: (v: { x: number; y: number } | null) => void
  svgRef: React.RefObject<SVGSVGElement | null>
}
function TechColumn({ xCenter, yTop, h, hi, hovered, setHovered, setHoverPos, svgRef }: TechColumnProps) {
  return (
    <g>
      {h.techniques.map((t, i) => {
        const y = yTop + i * 28
        const active = hovered?.horizon === hi && hovered?.technique === i
        return (
          <text
            key={t.name}
            className="tech-label"
            x={xCenter}
            y={y}
            textAnchor="middle"
            fill={active ? 'white' : 'rgba(255,255,255,0.45)'}
            style={{ cursor: 'pointer', transition: 'fill 0.25s ease' }}
            fontFamily="var(--font-display)"
            fontSize="15"
            fontWeight={active ? 500 : 400}
            onMouseEnter={(e) => {
              setHovered({ horizon: hi, technique: i })
              const svg = svgRef.current
              if (!svg) return
              const r = svg.getBoundingClientRect()
              const tgt = (e.target as SVGTextElement).getBoundingClientRect()
              setHoverPos({ x: tgt.right - r.left, y: tgt.top + tgt.height / 2 - r.top })
            }}
            onMouseLeave={() => { setHovered(null); setHoverPos(null) }}
          >
            {t.name}
          </text>
        )
      })}
    </g>
  )
}

