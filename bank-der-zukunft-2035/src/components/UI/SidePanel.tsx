import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, X } from 'lucide-react'
import { useScene } from '../../hooks/useScene'
import { FLOORS } from '../../data/floors'
import { HOTSPOTS } from '../../data/hotspots'
import { fmEase } from '../../lib/easings'

/**
 * Side-Panel rechts. 420px breit, Glasmorphism, dünne Display-Typo.
 * Inhalt kommt aus `data/floors.ts` — wenn ein konkreter Hotspot aktiv ist,
 * wird dessen Body als Headline verwendet, sonst die Etagen-Übersicht.
 */
export function SidePanel() {
  const view          = useScene((s) => s.view)
  const activeFloor   = useScene((s) => s.activeFloor)
  const activeHotspot = useScene((s) => s.activeHotspot)
  const panelOpen     = useScene((s) => s.panelOpen)
  const closePanel    = useScene((s) => s.closePanel)

  // Bei Plaza-View ziehen wir den Floor-Eintrag 'plaza' heran;
  // sonst den der aktiven Etage.
  const floorId = view === 'plaza' ? 'plaza' : activeFloor
  const floor   = floorId ? FLOORS.find((f) => f.id === floorId) : undefined
  const hotspot = activeHotspot ? HOTSPOTS.find((h) => h.id === activeHotspot) : undefined
  const visible = panelOpen && !!floor

  return (
    <AnimatePresence>
      {visible && floor && (
        <motion.aside
          initial={{ x: 460, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 460, opacity: 0 }}
          transition={{ duration: 0.6, ease: fmEase }}
          className="glass-strong fixed right-5 top-20 bottom-5 w-[420px] max-w-[88vw] rounded-2xl px-7 py-7 z-40 overflow-y-auto"
          style={{ borderColor: 'var(--line-hairline)' }}
        >
          {/* Mono-Label */}
          <div className="mono-label mb-5">{floor.badge}</div>

          {/* Headline */}
          <h2 className="display-lg text-[var(--color-ink-primary)] mb-4">
            {hotspot?.title ?? floor.heading}
          </h2>

          {/* Body */}
          <p className="text-[14px] leading-[1.65] text-[var(--color-ink-secondary)] mb-7">
            {hotspot?.body ?? floor.description}
          </p>

          {/* Bullets */}
          <div className="space-y-3 mb-7">
            {floor.bullets.map((b) => (
              <div key={b} className="flex items-start gap-3 text-[13px] leading-snug text-[var(--color-ink-secondary)]">
                <span className="mt-[7px] w-1 h-1 rounded-full bg-[var(--color-accent-cyan)] shrink-0" />
                <span>{b}</span>
              </div>
            ))}
          </div>

          {/* Quick-Stats */}
          <div className="grid grid-cols-3 gap-3 pt-5" style={{ borderTop: '1px solid var(--line-hairline)' }}>
            {floor.stats.map((s) => (
              <div key={s.label}>
                <div className="display-md text-[var(--color-accent-cyan)] mb-1">{s.value}</div>
                <div className="mono-label opacity-65">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Sekundär-CTA */}
          <button className="cta-arrow mt-7 inline-flex items-center gap-2 text-[13px] text-[var(--color-ink-primary)]">
            Tiefer eintauchen <ArrowRight size={14} strokeWidth={1.4} />
          </button>

          {/* Close-Button — dünn */}
          <button
            onClick={closePanel}
            aria-label="Schließen"
            className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center hairline hairline-hover"
          >
            <X size={13} strokeWidth={1.4} className="text-[var(--color-ink-secondary)]" />
          </button>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
