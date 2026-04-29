import { useScene } from '../../hooks/useScene'
import { HOTSPOTS } from '../../data/hotspots'
import type { Hotspot } from '../../types'

/**
 * Klickbare Hotspot-Punkte über dem Hero-Bild. Layout über CSS-prozentuale
 * Positionierung gegen einen virtuellen 16:9-Bildbereich, der mittig im
 * Viewport sitzt — dieselben Koordinaten wie das Hero-Plane in R3F.
 *
 * Hover: dünne Lupen-Linie + Tooltip am Bildrand.
 * Click: setActiveHotspot + setActiveFloor → Side-Panel öffnet.
 */
export function HotspotOverlay() {
  const setHover = useScene((s) => s.setHoverHotspot)
  const setActiveFloor = useScene((s) => s.setActiveFloor)
  const setActiveHotspot = useScene((s) => s.setActiveHotspot)
  const activeFloor = useScene((s) => s.activeFloor)

  return (
    <div className="hotspot-stage absolute inset-0 pointer-events-none">
      {/* 16:9-Stage zentriert. Padding-Bottom-Hack hält das Verhältnis. */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(94vw,1700px)] aspect-[16/9]">
        {HOTSPOTS.map((h) => (
          <HotspotDot
            key={h.id}
            h={h}
            dimmed={!!activeFloor && activeFloor !== h.floor}
            onEnter={() => setHover(h.id)}
            onLeave={() => setHover(null)}
            onClick={() => { setActiveFloor(h.floor); setActiveHotspot(h.id) }}
          />
        ))}
      </div>
    </div>
  )
}

interface DotProps {
  h: Hotspot
  dimmed: boolean
  onEnter: () => void
  onLeave: () => void
  onClick: () => void
}
function HotspotDot({ h, dimmed, onEnter, onLeave, onClick }: DotProps) {
  return (
    <button
      type="button"
      aria-label={h.title}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      onClick={onClick}
      className="hotspot-dot pointer-events-auto absolute"
      data-id={h.id}
      style={{
        left: `${h.x * 100}%`,
        top:  `${h.y * 100}%`,
        opacity: dimmed ? 0.25 : 1,
        transition: 'opacity 0.6s cubic-bezier(0.22, 0.61, 0.36, 1)',
      }}
    >
      <span className="hotspot-pulse hotspot-glow" aria-hidden />
      <span className="hotspot-core" aria-hidden />
    </button>
  )
}
