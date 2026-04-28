import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Building2,
  Workflow,
  Sparkles,
  BrainCircuit,
  Server,
  Users,
  ShieldCheck,
  Leaf,
  ArrowRight,
  Compass,
  Play,
} from 'lucide-react'
import { MODULES } from '../data/modules.js'

const ICONS = {
  Building2,
  Workflow,
  Sparkles,
  BrainCircuit,
  Server,
  Users,
  ShieldCheck,
  Leaf,
}

const SIZE_MAP = {
  sm: { w: 200, h: 200, title: 'text-base', sub: 'text-xs', icon: 36 },
  md: { w: 240, h: 240, title: 'text-lg', sub: 'text-sm', icon: 42 },
  lg: { w: 280, h: 280, title: 'text-xl', sub: 'text-sm', icon: 48 },
  xl: { w: 320, h: 320, title: 'text-2xl', sub: 'text-sm', icon: 56 },
}

function FloatingModule({ mod, delay }) {
  const Icon = ICONS[mod.icon] || Compass
  const size = SIZE_MAP[mod.position.size] || SIZE_MAP.md
  const anim = mod.position.anim || 'bdz-float'

  return (
    <a
      href={`#/modul/${mod.id}`}
      className={`absolute block no-underline ${anim}`}
      style={{
        left: `${mod.position.x}%`,
        top: `${mod.position.y}%`,
        width: size.w,
        height: size.h,
        animationDelay: `${delay}ms`,
        transform: 'translate(-50%, -50%)',
      }}
      aria-label={mod.title}
    >
      <div
        className="bdz-card bdz-fade-in h-full w-full flex flex-col items-center justify-center p-7 text-center cursor-pointer"
        style={{ animationDelay: `${delay + 200}ms` }}
      >
        {/* colored halo behind card */}
        <div
          className="bdz-halo"
          style={{
            background: `radial-gradient(circle, ${mod.color}66 0%, transparent 70%)`,
          }}
        />

        {/* Icon orb */}
        <div
          className="relative mb-4 flex items-center justify-center rounded-full"
          style={{
            width: size.icon + 28,
            height: size.icon + 28,
            background: `linear-gradient(135deg, ${mod.color} 0%, ${mod.colorDeep} 100%)`,
            boxShadow: `0 8px 32px ${mod.colorDeep}66, inset 0 1px 0 rgba(255,255,255,0.25)`,
          }}
        >
          <Icon size={size.icon} color="white" strokeWidth={1.5} />
          {mod.featured && (
            <span
              className="absolute -top-1 -right-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold tracking-wide"
              style={{ color: mod.colorDeep }}
            >
              FOKUS
            </span>
          )}
        </div>

        <div className={`font-semibold text-white ${size.title} tracking-tight`}>
          {mod.title}
        </div>
        <div className={`mt-1 text-slate-300/80 ${size.sub}`}>{mod.subtitle}</div>

        <div
          className="mt-4 inline-flex items-center gap-1 text-xs font-medium opacity-70 group-hover:opacity-100 transition-opacity"
          style={{ color: mod.color }}
        >
          Erkunden
          <ArrowRight size={12} strokeWidth={2.25} />
        </div>
      </div>
    </a>
  )
}

// Verbindungs-Linien zwischen den Modulen (als SVG gerendert).
// 2-1-2-Layout: „Bank der Zukunft" als zentraler Hub, vier andere
// Module als Eckpunkte. Spider-Pattern + zwei Crossbars.
const CONNECTIONS = [
  ['bank-der-zukunft', 'kundenperspektive'],
  ['bank-der-zukunft', 'betriebsmodell-zukunft'],
  ['bank-der-zukunft', 'transitionspfad'],
  ['bank-der-zukunft', 'offering'],
  ['kundenperspektive', 'betriebsmodell-zukunft'],
  ['transitionspfad', 'offering'],
]

function ConnectionLayer() {
  const byId = useMemo(
    () => Object.fromEntries(MODULES.map((m) => [m.id, m])),
    [],
  )
  return (
    <svg
      className="pointer-events-none absolute inset-0 w-full h-full"
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      {CONNECTIONS.map(([from, to], i) => {
        const a = byId[from]
        const b = byId[to]
        if (!a || !b) return null
        return (
          <line
            key={`${from}-${to}`}
            x1={a.position.x}
            y1={a.position.y}
            x2={b.position.x}
            y2={b.position.y}
            stroke="rgba(148, 163, 184, 0.18)"
            strokeWidth="0.12"
            className="bdz-arch-line"
            style={{ animationDelay: `${i * 0.6}s` }}
          />
        )
      })}
    </svg>
  )
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)
  const canvasRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="bdz-stage">
      <div className="bdz-grid" />
      <div className="bdz-stars absolute inset-0" />

      {/* Floating gradient blobs */}
      <div
        className="bdz-pulse-glow pointer-events-none absolute"
        style={{
          left: '5%',
          top: '30%',
          width: 420,
          height: 420,
          background: 'radial-gradient(circle, rgba(14,165,233,0.35), transparent 70%)',
          filter: 'blur(50px)',
        }}
      />
      <div
        className="bdz-pulse-glow pointer-events-none absolute"
        style={{
          right: '8%',
          bottom: '10%',
          width: 480,
          height: 480,
          background: 'radial-gradient(circle, rgba(168,85,247,0.25), transparent 70%)',
          filter: 'blur(50px)',
          animationDelay: '2.5s',
        }}
      />

      {/* Header */}
      <header className="relative z-20 px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
              boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
            }}
          >
            <Compass size={22} color="white" strokeWidth={1.75} />
          </div>
          <div>
            <div className="text-white font-semibold tracking-tight text-lg leading-tight">
              Bank der Zukunft
            </div>
            <div className="text-slate-400 text-xs tracking-widest uppercase font-medium">
              Interaktiver Workshop
            </div>
          </div>
        </div>
        <a
          href="../../index.html"
          className="text-sm text-slate-300 hover:text-white transition-colors flex items-center gap-2 no-underline"
        >
          <span>Zur Plattform</span>
        </a>
      </header>

      {/* Hero headline */}
      <section className="relative z-20 px-8 pt-6 pb-4 text-center max-w-4xl mx-auto">
        <div
          className={`bdz-fade-in inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300 mb-6`}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-400" />
          </span>
          Workshop-Erlebnis · Bank 2030
        </div>
        <h1
          className="bdz-fade-in text-white font-bold tracking-tight text-4xl md:text-5xl leading-[1.05]"
          style={{ animationDelay: '120ms' }}
        >
          Fünf Bausteine der{' '}
          <span
            style={{
              background: 'linear-gradient(90deg, #38bdf8 0%, #a78bfa 50%, #34d399 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Bank der Zukunft
          </span>
        </h1>
        <p
          className="bdz-fade-in mt-5 text-slate-300 text-base md:text-lg max-w-2xl mx-auto"
          style={{ animationDelay: '220ms' }}
        >
          Klicke auf einen Baustein und tauche ein — Kundenperspektive, Betriebsmodell,
          Transformationspfad und unser Offering. Im Zentrum steht das gemeinsame Zielbild
          „Bank der Zukunft".
        </p>
        <div
          className="bdz-fade-in mt-8 flex flex-wrap items-center justify-center gap-3"
          style={{ animationDelay: '320ms' }}
        >
          <a
            href="#/modul/bank-der-zukunft"
            className="inline-flex items-center gap-2 rounded-full bg-white text-slate-900 px-5 py-2.5 text-sm font-semibold hover:scale-[1.03] transition-transform no-underline"
          >
            <Play size={14} strokeWidth={2.5} />
            Workshop starten
          </a>
          <a
            href="#/modul/kundenperspektive"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 text-white px-5 py-2.5 text-sm font-medium hover:bg-white/10 transition-colors no-underline"
          >
            Mit Kundenperspektive beginnen
            <ArrowRight size={14} strokeWidth={2.25} />
          </a>
        </div>
      </section>

      {/* Floating modules canvas — full viewport width for generous spacing */}
      <section
        ref={canvasRef}
        className="relative z-10 w-full mt-6 h-[1100px] md:h-[950px] px-4"
      >
        <ConnectionLayer />
        {mounted &&
          MODULES.map((mod, i) => (
            <FloatingModule key={mod.id} mod={mod} delay={i * 120} />
          ))}
      </section>

      {/* Legend */}
      <div className="relative z-20 mx-auto max-w-5xl px-8 pb-12 text-center text-xs text-slate-400">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            Fünf Bausteine
          </span>
          <span className="opacity-40">·</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-violet-400" />
            Fokus-Demo: Vertriebsarbeitsplatz
          </span>
          <span className="opacity-40">·</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Live-Demo verfügbar
          </span>
        </div>
      </div>
    </div>
  )
}
