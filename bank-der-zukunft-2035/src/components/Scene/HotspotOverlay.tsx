import { useScene } from '../../hooks/useScene'
import { HOTSPOTS } from '../../data/hotspots'
import type { Hotspot } from '../../types'

/**
 * Hotspot-Punkte über dem Hero-Bild. Wird von Hero.tsx als overlay-
 * function gerendert — der parent-Wrapper hat exakt die Maße der
 * `<img>`-Renderbox, sodass `left/top` in Prozent korrekt sitzen.
 *
 * Visualisierung pro Hotspot:
 *   12px innerer cyan-radial-gradient-Punkt
 *   24px äußerer Pulse-Ring (border 1px cyan/30)
 *   permanenter Pulse 1.0 → 1.15 → 1.0 über 2.5s, mit Stagger
 */
export function HotspotOverlay() {
  const setHover = useScene((s) => s.setHoverHotspot)
  const setActiveFloor = useScene((s) => s.setActiveFloor)
  const setActiveHotspot = useScene((s) => s.setActiveHotspot)
  const activeFloor = useScene((s) => s.activeFloor)

  return (
    <>
      {HOTSPOTS.map((h, i) => (
        <HotspotDot
          key={h.id}
          h={h}
          delaySec={i * 0.32}
          dimmed={!!activeFloor && activeFloor !== h.floor}
          onEnter={() => setHover(h.id)}
          onLeave={() => setHover(null)}
          onClick={() => { setActiveFloor(h.floor); setActiveHotspot(h.id) }}
        />
      ))}
    </>
  )
}

interface DotProps {
  h: Hotspot
  delaySec: number
  dimmed: boolean
  onEnter: () => void
  onLeave: () => void
  onClick: () => void
}
function HotspotDot({ h, delaySec, dimmed, onEnter, onLeave, onClick }: DotProps) {
  return (
    <button
      type="button"
      aria-label={h.title}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      onClick={onClick}
      className="hot pointer-events-auto absolute"
      data-id={h.id}
      style={{
        left: `${h.x * 100}%`,
        top:  `${h.y * 100}%`,
        opacity: dimmed ? 0.25 : 1,
        transition: 'opacity 0.6s cubic-bezier(0.22, 0.61, 0.36, 1)',
      }}
    >
      <span className="hot-ring"  style={{ animationDelay: `${delaySec}s` }} aria-hidden />
      <span className="hot-core" aria-hidden />
    </button>
  )
}
