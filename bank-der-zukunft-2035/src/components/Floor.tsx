import { useCallback } from 'react'
import styles from './Floor.module.css'
import { Hotspot } from './Hotspot'
import {
  HOTSPOTS_BY_FLOOR,
  type FloorDef,
  type FloorId,
} from '../data/modules'

type FloorProps = {
  floor: FloorDef
  focusedFloor: FloorId | null
  activeHotspotId: string | null
  onFocus: (id: FloorId | null) => void
  onOpenHotspot: (id: string) => void
  children: React.ReactNode
}

export function Floor({
  floor,
  focusedFloor,
  activeHotspotId,
  onFocus,
  onOpenHotspot,
  children,
}: FloorProps): React.ReactElement {
  const isFocused = focusedFloor === floor.id
  const isDimmed = focusedFloor !== null && !isFocused

  const handleClick = useCallback(() => {
    if (isFocused) {
      onFocus(null)
    } else {
      onFocus(floor.id)
    }
  }, [floor.id, isFocused, onFocus])

  return (
    <div
      className={styles.floor}
      data-floor={floor.id}
      data-focused={isFocused || undefined}
      data-dimmed={isDimmed || undefined}
      aria-label={`Etage ${floor.order + 1}: ${floor.title}`}
    >
      <button
        type="button"
        className={styles.floorPlate}
        onClick={handleClick}
        aria-expanded={isFocused}
        aria-controls={`floor-content-${floor.id}`}
      >
        <span className={styles.srLabel}>
          {floor.title} — {isFocused ? 'fokussiert, klick zum Verlassen' : 'klick zum Fokussieren'}
        </span>
      </button>

      <div className={styles.interior} id={`floor-content-${floor.id}`}>
        {children}
      </div>

      <div className={styles.hotspots}>
        {HOTSPOTS_BY_FLOOR[floor.id].map((h) => (
          <Hotspot
            key={h.id}
            hotspot={h}
            active={activeHotspotId === h.id}
            onActivate={onOpenHotspot}
          />
        ))}
      </div>

      <div className={styles.label} aria-hidden>
        <span className={styles.labelIndex}>0{floor.order + 1}</span>
        <span className={styles.labelShort}>{floor.shortLabel}</span>
      </div>
    </div>
  )
}
