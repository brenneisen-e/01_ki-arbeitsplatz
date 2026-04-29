import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { motion } from 'framer-motion'
import { HORIZONS } from '../../data/horizons'

/**
 * Interaktive 3-Horizonte-Matrix.
 * Vertikal gestaffelte Plateau-Kurven (Grau, Hellgrün, Dunkelgrün),
 * Status Quo + Zielbild + bogiger Pfeil dazwischen, daneben die
 * Tech-Etiketten je Horizont. Hover auf eine Tech zeigt eine
 * Glasmorphism-Card mit Beschreibung.
 */
export function HorizonsView() {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [hovered, setHovered] = useState<{ horizon: number; technique: number } | null>(null)
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null)

  // Eintritts-Animation NUR auf Linien/Pfeil, nicht auf Labels
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
    tl.from(svg.querySelectorAll('.curve'), {
        strokeDashoffset: (_i, t) => (t as SVGPathElement).getTotalLength(),
        duration: 1.4, stagger: 0.25,
      })
      .from(svg.querySelectorAll('.dot'), {
        scale: 0, transformOrigin: 'center', duration: 0.5,
        stagger: 0.1, ease: 'back.out(2)',
      }, '-=0.4')
      .from(svg.querySelectorAll('.journey'), {
        strokeDashoffset: (_i, t) => (t as SVGPathElement).getTotalLength(),
        duration: 0.9,
      }, '-=0.3')
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 flex items-center justify-center px-6"
    >
      <div className="relative w-[min(96vw,1480px)] aspect-[16/9.2]">
        <svg ref={svgRef} viewBox="0 0 1480 800" className="w-full h-full" aria-label="3-Horizonte Ambition Matrix">
          <defs>
            <marker id="ambArrow" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="11" markerHeight="11" orient="auto">
              <path d="M0,0 L12,6 L0,12 Z" fill="#86bc25" />
            </marker>
          </defs>

          {/* Achsen */}
          <line x1="80" y1="720" x2="1440" y2="720" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
          <line x1="80" y1="720" x2="80"   y2="60"   stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
          <text x="38"   y="80"  fill="rgba(255,255,255,0.7)" fontSize="14" fontStyle="italic" fontFamily="var(--font-display)">Profit</text>
          <text x="1380" y="765" fill="rgba(255,255,255,0.7)" fontSize="14" fontStyle="italic" fontFamily="var(--font-display)">Veränderung</text>

          {/* Drei Plateau-Kurven (klassische S-Kurven, levelnd ab) */}
          <Curve d="M 100 600 C 360 600 460 480 720 460 C 980 445 1180 440 1440 440" color={HORIZONS[0].colorDeep} />
          <Curve d="M 220 620 C 480 620 600 360 880 320 C 1080 295 1240 285 1440 280" color={HORIZONS[1].colorDeep} />
          <Curve d="M 360 640 C 620 640 740 240 1020 175 C 1180 145 1310 135 1440 130" color={HORIZONS[2].colorDeep} />

          {/* Status Quo + Zielbild + Pfeil */}
          <DotWithLabel cx={420}  cy={465} color={HORIZONS[1].colorDeep} label="Status Quo" align="left" />
          <DotWithLabel cx={1220} cy={170} color={HORIZONS[2].colorDeep} label="Zielbild"   align="right" />
          <path
            className="journey"
            d="M 420 465 C 420 320 420 250 470 220 C 600 160 1080 165 1220 170"
            stroke="#86bc25" strokeWidth="6" fill="none"
            strokeLinecap="round" markerEnd="url(#ambArrow)"
          />

          {/* Horizont-Beschriftungen direkt an den Plateau-Enden */}
          <HorizonLabel x={1100} y={420} h={HORIZONS[0]} />
          <HorizonLabel x={1100} y={310} h={HORIZONS[1]} />
          <HorizonLabel x={1100} y={130} h={HORIZONS[2]} />

          {/* Technique-Spalten unter den Kurven */}
          <TechColumn xCenter={250} yTop={680} h={HORIZONS[0]} hi={0}
                      hovered={hovered} setHovered={setHovered} setHoverPos={setHoverPos} svgRef={svgRef} />
          <TechColumn xCenter={620} yTop={580} h={HORIZONS[1]} hi={1}
                      hovered={hovered} setHovered={setHovered} setHoverPos={setHoverPos} svgRef={svgRef} />
          <TechColumn xCenter={1000} yTop={420} h={HORIZONS[2]} hi={2}
                      hovered={hovered} setHovered={setHovered} setHoverPos={setHoverPos} svgRef={svgRef} />
        </svg>

        {/* Hover-Card */}
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

// ── Sub-Komponenten ──────────────────────────────────────────────

function Curve({ d, color }: { d: string; color: string }) {
  return (
    <path
      className="curve"
      d={d}
      stroke={color}
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
    />
  )
}

function DotWithLabel({ cx, cy, color, label, align }: { cx: number; cy: number; color: string; label: string; align: 'left' | 'right' }) {
  const lx = align === 'left' ? cx - 26 : cx + 26
  const anchor = align === 'left' ? 'end' : 'start'
  return (
    <g>
      <circle className="dot" cx={cx} cy={cy} r="14" fill={color} opacity="0.25" />
      <circle className="dot" cx={cx} cy={cy} r="9"  fill={color} />
      <circle cx={cx} cy={cy} r="22" fill="none" stroke={color} strokeOpacity="0.55" strokeWidth="1.5">
        <animate attributeName="r" values="22;30;22" dur="2.6s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.55;0;0.55" dur="2.6s" repeatCount="indefinite" />
      </circle>
      <text x={lx} y={cy + 5} textAnchor={anchor} fill="white"
            fontFamily="var(--font-display)" fontWeight="500" fontSize="18">{label}</text>
    </g>
  )
}

function HorizonLabel({ x, y, h }: { x: number; y: number; h: typeof HORIZONS[number] }) {
  return (
    <g>
      <text x={x} y={y} fill="white"
            fontFamily="var(--font-display)" fontWeight="600" fontSize="22">{h.label}</text>
      <text x={x} y={y + 22} fill={h.color}
            fontFamily="var(--font-display)" fontStyle="italic" fontSize="14">{h.subtitle}</text>
    </g>
  )
}

interface TechColumnProps {
  xCenter: number
  yTop: number
  h: typeof HORIZONS[number]
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
        const y = yTop + i * 26
        const active = hovered?.horizon === hi && hovered?.technique === i
        return (
          <text
            key={t.name}
            x={xCenter}
            y={y}
            textAnchor="middle"
            fill={active ? 'white' : 'rgba(255,255,255,0.55)'}
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

