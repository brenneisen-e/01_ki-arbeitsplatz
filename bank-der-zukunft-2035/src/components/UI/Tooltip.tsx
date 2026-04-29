import { motion, AnimatePresence } from 'framer-motion'
import { useScene } from '../../hooks/useScene'
import { HOTSPOTS } from '../../data/hotspots'
import { fmEase } from '../../lib/easings'

/**
 * Hairline-Tooltip am Bildrand. Position: rechts unten, fix — die
 * Aufmerksamkeit fließt vom Hotspot dorthin. Plex Mono Subtitle,
 * Inter Body. Erinnert an Bloomberg-Terminal.
 */
export function Tooltip() {
  const hover = useScene((s) => s.hoverHotspot)
  const data = hover ? HOTSPOTS.find((h) => h.id === hover) : undefined

  return (
    <AnimatePresence>
      {data && (
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 4, opacity: 0 }}
          transition={{ duration: 0.36, ease: fmEase }}
          className="tooltip-frame fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] rounded-xl px-5 py-3.5 max-w-[420px] pointer-events-none"
        >
          <div className="mono-label mb-1.5" style={{ color: 'var(--color-accent-cyan)' }}>
            {data.subtitle}
          </div>
          <div className="text-[15px] leading-snug text-[var(--color-ink-primary)]" style={{ fontFamily: 'var(--font-display)', fontWeight: 300 }}>
            {data.title}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
