import { motion, AnimatePresence } from 'framer-motion'
import { useScene } from '../../hooks/useScene'
import { HOTSPOTS } from '../../data/hotspots'

/**
 * Floating Tooltip oben mittig — zeigt eine Mini-Erklärung des aktuell
 * gehoverten Hotspots. Wird von Scene-Komponenten via setHoverHotspot()
 * gesteuert.
 */
export function Tooltip() {
  const hoverHotspot = useScene((s) => s.hoverHotspot)
  const data = hoverHotspot ? HOTSPOTS.find((h) => h.id === hoverHotspot) : null

  return (
    <AnimatePresence>
      {data && (
        <motion.div
          initial={{ y: -12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          className="glass fixed top-20 left-1/2 -translate-x-1/2 z-[60] rounded-xl px-5 py-3 max-w-md text-center pointer-events-none"
        >
          <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-teal)] mb-1">
            {data.title}
          </div>
          <div className="text-sm leading-snug">{data.body}</div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
