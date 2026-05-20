import { useCallback, useState } from 'react'
import styles from './Hotspot.module.css'
import type { HotspotDef } from '../data/modules'

type HotspotProps = {
  hotspot: HotspotDef
  active: boolean
  onActivate: (id: string) => void
}

export function Hotspot({ hotspot, active, onActivate }: HotspotProps): React.ReactElement {
  const [hovered, setHovered] = useState(false)
  const Icon = hotspot.icon

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onActivate(hotspot.id)
    },
    [hotspot.id, onActivate],
  )

  return (
    <div
      className={styles.wrap}
      style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
    >
      <button
        type="button"
        className={
          active
            ? `${styles.dot} ${styles.dotActive}`
            : styles.dot
        }
        onClick={handleClick}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        aria-label={hotspot.title}
      >
        <span className={styles.pulse} aria-hidden />
        <span className={styles.ring} aria-hidden />
        <Icon size={16} strokeWidth={1.8} aria-hidden />
      </button>

      <div
        className={styles.tooltip}
        data-visible={hovered || undefined}
        role="tooltip"
      >
        <span className={styles.tooltipLabel}>{hotspot.label}</span>
      </div>
    </div>
  )
}
