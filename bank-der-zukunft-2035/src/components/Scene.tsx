import { useRef } from 'react'
import styles from './Scene.module.css'
import { Floor } from './Floor'
import { Boardroom } from './floors/Boardroom'
import { Operations } from './floors/Operations'
import { DataCenter } from './floors/DataCenter'
import { Plaza } from './floors/Plaza'
import { FLOORS, type FloorId } from '../data/modules'
import { useParallax } from '../hooks/useParallax'
import { useReducedMotion } from '../hooks/useReducedMotion'

type SceneProps = {
  focusedFloor: FloorId | null
  activeHotspotId: string | null
  onFocusFloor: (id: FloorId | null) => void
  onOpenHotspot: (id: string) => void
}

export function Scene({
  focusedFloor,
  activeHotspotId,
  onFocusFloor,
  onOpenHotspot,
}: SceneProps): React.ReactElement {
  const sceneRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  useParallax(sceneRef, { enabled: !reducedMotion, intensity: 1 })

  const renderInterior = (id: FloorId) => {
    switch (id) {
      case 'boardroom':
        return <Boardroom focused={focusedFloor === 'boardroom'} />
      case 'operations':
        return <Operations focused={focusedFloor === 'operations'} />
      case 'datacenter':
        return <DataCenter focused={focusedFloor === 'datacenter'} />
    }
  }

  const sceneStyle = {
    '--ambient-dim': focusedFloor ? 0.45 : 0,
  } as React.CSSProperties

  return (
    <div
      className={styles.scene}
      ref={sceneRef}
      data-focus={focusedFloor ?? 'none'}
      style={sceneStyle}
    >
      {/* Hintergrund-Layer mit Parallax-Intensität gestaffelt */}
      <div className={styles.skyFar} aria-hidden />
      <div className={styles.skyNear} aria-hidden />
      <div className={styles.cityline} aria-hidden />

      <Plaza side="left" />
      <Plaza side="right" />

      <div className={styles.buildingShell}>
        <div className={styles.building}>
          {FLOORS.map((floor) => (
            <Floor
              key={floor.id}
              floor={floor}
              focusedFloor={focusedFloor}
              activeHotspotId={activeHotspotId}
              onFocus={onFocusFloor}
              onOpenHotspot={onOpenHotspot}
            >
              {renderInterior(floor.id)}
            </Floor>
          ))}
        </div>
        <div className={styles.foundation} aria-hidden />
      </div>

      <div className={styles.groundShadow} aria-hidden />
    </div>
  )
}
