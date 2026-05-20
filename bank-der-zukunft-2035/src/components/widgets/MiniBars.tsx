import styles from './MiniBars.module.css'
import { quarterLabel } from '../../lib/format'

type MiniBarsProps = {
  values: number[]
  /** Höhe in px */
  height?: number
  accent?: string
  /** Labels (Q1..Q4 wenn nicht gesetzt) */
  labels?: string[]
}

export function MiniBars({
  values,
  height = 56,
  accent = '#046A38',
  labels,
}: MiniBarsProps): React.ReactElement {
  const max = Math.max(...values, 1)
  return (
    <div className={styles.wrap} style={{ height }}>
      {values.map((v, i) => {
        const isLast = i === values.length - 1
        const pct = (v / max) * 100
        return (
          <div className={styles.col} key={i}>
            <div className={styles.barTrack}>
              <div
                className={styles.bar}
                style={{
                  height: `${pct}%`,
                  background: isLast
                    ? `linear-gradient(180deg, ${accent} 0%, #86BC25 100%)`
                    : accent,
                  opacity: isLast ? 1 : 0.6,
                }}
              />
            </div>
            <span className={styles.colLabel}>{labels?.[i] ?? quarterLabel(i)}</span>
          </div>
        )
      })}
    </div>
  )
}
