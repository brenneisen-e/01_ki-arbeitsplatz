import {
  Building2,
  Workflow,
  Sparkles,
  BrainCircuit,
  Server,
  Users,
  ShieldCheck,
  Leaf,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Compass,
  Check,
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

export default function ModuleDetail({ module: mod }) {
  const Icon = ICONS[mod.icon] || Compass

  const moduleIndex = MODULES.findIndex((m) => m.id === mod.id)
  const next = MODULES[(moduleIndex + 1) % MODULES.length]
  const prev = MODULES[(moduleIndex - 1 + MODULES.length) % MODULES.length]

  return (
    <div className="bdz-stage">
      <div className="bdz-grid" />

      {/* Module-tinted ambient glows */}
      <div
        className="bdz-pulse-glow pointer-events-none absolute"
        style={{
          left: '-5%',
          top: '-5%',
          width: 600,
          height: 600,
          background: `radial-gradient(circle, ${mod.color}44, transparent 70%)`,
          filter: 'blur(70px)',
        }}
      />
      <div
        className="bdz-pulse-glow pointer-events-none absolute"
        style={{
          right: '-10%',
          top: '20%',
          width: 480,
          height: 480,
          background: `radial-gradient(circle, ${mod.colorDeep}55, transparent 70%)`,
          filter: 'blur(70px)',
          animationDelay: '2s',
        }}
      />

      {/* Top bar */}
      <header className="relative z-20 px-6 md:px-10 py-5 flex items-center justify-between">
        <a
          href="#/"
          className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors no-underline"
        >
          <ArrowLeft size={16} strokeWidth={2} />
          Alle Module
        </a>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>Modul {moduleIndex + 1} von {MODULES.length}</span>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 px-6 md:px-10 max-w-6xl mx-auto pt-8 pb-10">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400 tracking-widest uppercase mb-5 bdz-fade-in">
          <span>Bank der Zukunft</span>
          <ChevronRight size={12} />
          <span style={{ color: mod.color }}>{mod.title}</span>
        </div>

        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Icon orb */}
          <div
            className="bdz-fade-in shrink-0 rounded-3xl flex items-center justify-center"
            style={{
              width: 104,
              height: 104,
              background: `linear-gradient(135deg, ${mod.color} 0%, ${mod.colorDeep} 100%)`,
              boxShadow: `0 18px 48px ${mod.colorDeep}66, inset 0 1px 0 rgba(255,255,255,0.25)`,
              animationDelay: '60ms',
            }}
          >
            <Icon size={52} color="white" strokeWidth={1.5} />
          </div>

          <div className="flex-1 min-w-0">
            <h1
              className="bdz-fade-in text-white font-bold tracking-tight text-4xl md:text-5xl leading-[1.05]"
              style={{ animationDelay: '120ms' }}
            >
              {mod.title}
            </h1>
            <p
              className="bdz-fade-in mt-2 text-lg md:text-xl font-medium"
              style={{ color: mod.color, animationDelay: '180ms' }}
            >
              {mod.subtitle}
            </p>
            <p
              className="bdz-fade-in mt-6 text-slate-300 text-base md:text-lg leading-relaxed max-w-3xl"
              style={{ animationDelay: '240ms' }}
            >
              {mod.tagline}
            </p>
            <p
              className="bdz-fade-in mt-4 text-slate-400 text-sm md:text-base leading-relaxed max-w-3xl"
              style={{ animationDelay: '300ms' }}
            >
              {mod.summary}
            </p>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="relative z-10 px-6 md:px-10 max-w-6xl mx-auto pb-12">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-white font-semibold text-xl tracking-tight">
            Dimensionen
          </h2>
          <span className="text-slate-500 text-sm">·</span>
          <span className="text-slate-400 text-sm">
            {mod.pillars.length} Bausteine
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {mod.pillars.map((pillar, i) => {
            const isDeepLink = pillar.deepLink === 'vertriebsarbeitsplatz'
            const Wrapper = isDeepLink ? 'a' : 'div'
            const props = isDeepLink
              ? {
                  href: `#/modul/${mod.id}/${pillar.deepLink}`,
                  className:
                    'bdz-card bdz-fade-in block no-underline p-6 group cursor-pointer',
                }
              : {
                  className: 'bdz-card bdz-fade-in p-6',
                }
            return (
              <Wrapper
                key={pillar.id}
                {...props}
                style={{ animationDelay: `${i * 80 + 340}ms` }}
              >
                {isDeepLink && (
                  <div
                    className="bdz-halo"
                    style={{
                      background: `radial-gradient(circle, ${mod.color}55 0%, transparent 70%)`,
                    }}
                  />
                )}

                <div className="flex items-center justify-between mb-4">
                  <div
                    className="rounded-xl px-3 py-1 text-xs font-semibold tracking-wide"
                    style={{
                      background: `${mod.color}22`,
                      color: mod.color,
                      border: `1px solid ${mod.color}44`,
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  {isDeepLink && (
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide"
                      style={{
                        background: `${mod.color}22`,
                        color: mod.color,
                        border: `1px solid ${mod.color}66`,
                      }}
                    >
                      Architektur & Live-Demo
                    </span>
                  )}
                </div>

                <h3 className="text-white font-semibold text-xl tracking-tight">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-slate-300 text-sm leading-relaxed">
                  {pillar.description}
                </p>

                <ul className="mt-4 space-y-2">
                  {pillar.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-2 text-sm text-slate-400"
                    >
                      <span
                        className="mt-1 shrink-0 rounded-full w-3.5 h-3.5 flex items-center justify-center"
                        style={{
                          background: `${mod.color}33`,
                          border: `1px solid ${mod.color}66`,
                        }}
                      >
                        <Check size={9} color={mod.color} strokeWidth={3} />
                      </span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                {isDeepLink && (
                  <div
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold"
                    style={{ color: mod.color }}
                  >
                    Architektur & Live-Demo öffnen
                    <ArrowRight size={14} strokeWidth={2.25} />
                  </div>
                )}
              </Wrapper>
            )
          })}
        </div>
      </section>

      {/* Navigation footer */}
      <section className="relative z-10 px-6 md:px-10 max-w-6xl mx-auto pb-16">
        <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-6">
          <a
            href={`#/modul/${prev.id}`}
            className="group flex items-center gap-3 text-left no-underline flex-1"
          >
            <div
              className="rounded-xl p-2 border border-white/10 group-hover:border-white/30 transition-colors"
              style={{ color: prev.color }}
            >
              <ArrowLeft size={16} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-slate-500 tracking-widest uppercase">
                Zurück
              </div>
              <div className="text-sm text-slate-300 font-medium truncate">
                {prev.title}
              </div>
            </div>
          </a>

          <a
            href={`#/modul/${next.id}`}
            className="group flex items-center gap-3 text-right no-underline flex-1 justify-end"
          >
            <div className="min-w-0">
              <div className="text-xs text-slate-500 tracking-widest uppercase">
                Weiter
              </div>
              <div className="text-sm text-slate-300 font-medium truncate">
                {next.title}
              </div>
            </div>
            <div
              className="rounded-xl p-2 border border-white/10 group-hover:border-white/30 transition-colors"
              style={{ color: next.color }}
            >
              <ArrowRight size={16} strokeWidth={2} />
            </div>
          </a>
        </div>
      </section>
    </div>
  )
}
