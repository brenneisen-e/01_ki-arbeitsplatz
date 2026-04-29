import { useScene, type SceneView } from '../../hooks/useScene'
import { HOTSPOTS } from '../../data/hotspots'
import type { Hotspot, FloorId } from '../../types'

const VIEW_TO_FLOOR: Record<SceneView, FloorId | null> = {
  'hero':            null,         // Hero zeigt alle drei Etagen-Hotspots
  'detail-top':      'top',
  'detail-ground':   'ground',
  'detail-basement': 'basement',
  'plaza':           'plaza',
}

/**
 * Filtert Hotspots passend zur aktuellen View:
 *   hero            → alle 6 Etagen-Hotspots (oben/mitte/unten)
 *   detail-{floor}  → nur die Hotspots der jeweiligen Etage
 *   plaza           → die 4 Customer-Hotspots
 */
export function HotspotOverlay() {
  const view = useScene((s) => s.view)
  const setHover = useScene((s) => s.setHoverHotspot)
  const openFloor = useScene((s) => s.openFloor)

  const targetFloor = VIEW_TO_FLOOR[view]
  const visible = HOTSPOTS.filter((h) => {
    if (view === 'hero')   return h.floor !== 'plaza'
    return h.floor === targetFloor
  })

  return (
    <>
      {visible.map((h, i) => (
        <HotspotDot
          key={h.id}
          h={h}
          delaySec={i * 0.32}
          onEnter={() => setHover(h.id)}
          onLeave={() => setHover(null)}
          onClick={() => openFloor(h.floor, h.id)}
        />
      ))}
    </>
  )
}

interface DotProps {
  h: Hotspot
  delaySec: number
  onEnter: () => void
  onLeave: () => void
  onClick: () => void
}
function HotspotDot({ h, delaySec, onEnter, onLeave, onClick }: DotProps) {
  return (
    <button
      type="button"
      aria-label={h.title}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      onClick={(e) => { e.stopPropagation(); onClick() }}
      className="hot pointer-events-auto absolute"
      data-id={h.id}
      data-floor={h.floor}
      style={{
        left: `${h.x * 100}%`,
        top:  `${h.y * 100}%`,
      }}
    >
      <span className="hot-ring"  style={{ animationDelay: `${delaySec}s` }} aria-hidden />
      <span className="hot-core" aria-hidden />
    </button>
  )
}
