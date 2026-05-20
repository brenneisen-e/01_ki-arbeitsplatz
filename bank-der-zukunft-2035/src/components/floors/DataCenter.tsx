import styles from './DataCenter.module.css'
import { Terminal } from '../widgets/Terminal'

type DataCenterProps = {
  focused: boolean
}

export function DataCenter({ focused }: DataCenterProps): React.ReactElement {
  return (
    <div className={styles.room}>
      <div className={styles.ambient} aria-hidden />

      <div className={styles.rackRow} aria-hidden>
        {Array.from({ length: 5 }, (_, i) => (
          <ServerRack key={i} variant={i % 3 as 0 | 1 | 2} />
        ))}
      </div>

      {/* Terminal-Log auf einem virtuellen Display in der Mitte */}
      <div className={styles.terminalSlot}>
        <Terminal live={focused} />
      </div>

      <div className={styles.rackRow} data-side="right" aria-hidden>
        {Array.from({ length: 5 }, (_, i) => (
          <ServerRack key={i} variant={(i + 1) % 3 as 0 | 1 | 2} />
        ))}
      </div>

      {/* Fiber-Optic-Pulse, die nach oben wandern */}
      <div className={styles.fiberLayer} aria-hidden>
        {Array.from({ length: 8 }, (_, i) => (
          <span
            key={i}
            className={styles.fiber}
            style={{
              left: `${6 + i * 12}%`,
              animationDelay: `${(i * 0.6) % 4.8}s`,
            }}
          />
        ))}
      </div>

      {/* Bodengitter -- Lüftungsplatten */}
      <div className={styles.floorGrid} aria-hidden />
    </div>
  )
}

function ServerRack({ variant }: { variant: 0 | 1 | 2 }): React.ReactElement {
  return (
    <div className={styles.rack} data-variant={variant}>
      {Array.from({ length: 8 }, (_, i) => (
        <div className={styles.rackUnit} key={i}>
          <span className={styles.led} data-on={(i + variant) % 3 !== 0 || undefined} />
          <span className={styles.ledSm} data-on={(i + variant) % 2 === 0 || undefined} />
        </div>
      ))}
    </div>
  )
}
