import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useScene } from '../../hooks/useScene'
import { FLOORS } from '../../data/floors'

/**
 * Slide-In-Panel rechts: zeigt detaillierten Inhalt zur aktiven Etage.
 * Inhalt wird aus `data/floors.ts` geladen (Heading, Beschreibung,
 * 3 Bullets, Quick-Stats).
 */
export function SidePanel() {
  const activeFloor = useScene((s) => s.activeFloor)
  const panelOpen = useScene((s) => s.panelOpen)
  const closePanel = useScene((s) => s.closePanel)

  const content = activeFloor ? FLOORS.find((f) => f.id === activeFloor) : undefined
  const visible = panelOpen && !!content

  return (
    <AnimatePresence>
      {visible && content && (
        <motion.aside
          initial={{ x: 480, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 480, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 240, damping: 28 }}
          className="glass fixed right-4 top-20 bottom-4 w-[440px] max-w-[88vw] rounded-2xl p-7 z-40 overflow-y-auto"
        >
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-mid)] mb-1.5">
                {content.badge}
              </div>
              <h2 className="text-2xl font-bold tracking-tight leading-tight">{content.heading}</h2>
            </div>
            <button
              onClick={closePanel}
              aria-label="Panel schließen"
              className="rounded-full w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/15 transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          <p className="text-sm leading-relaxed text-[var(--color-text-mid)] mb-6">
            {content.description}
          </p>

          <div className="space-y-2.5 mb-6">
            {content.bullets.map((b) => (
              <div key={b} className="flex items-start gap-2.5 text-sm leading-snug">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--color-teal)] shrink-0" />
                <span>{b}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10">
            {content.stats.map((s) => (
              <div key={s.label} className="rounded-lg bg-white/5 px-3 py-2.5">
                <div className="text-base font-bold tracking-tight font-[var(--font-mono)] text-[var(--color-teal)]">{s.value}</div>
                <div className="text-[10px] uppercase tracking-wider mt-0.5 text-[var(--color-text-mid)]">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
