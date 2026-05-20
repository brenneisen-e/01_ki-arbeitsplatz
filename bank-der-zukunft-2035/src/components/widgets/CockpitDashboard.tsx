import styles from './CockpitDashboard.module.css'
import { Donut } from './Donut'
import { MiniBars } from './MiniBars'
import { useTicker } from '../../hooks/useTicker'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { formatEurM, formatInt, formatPercent1 } from '../../lib/format'

type CockpitDashboardProps = {
  /** Wenn true, läuft der Live-Stream */
  live: boolean
}

export function CockpitDashboard({ live }: CockpitDashboardProps): React.ReactElement {
  const reduced = useReducedMotion()
  const v = useTicker(live && !reduced, 1700)

  return (
    <div className={styles.cockpit}>
      <div className={styles.header}>
        <span className={styles.kicker}>Governance Cockpit</span>
        <span className={styles.live}>
          <span className={styles.liveDot} aria-hidden /> live
        </span>
      </div>

      <div className={styles.grid}>
        <div className={styles.cell}>
          <span className={styles.cellLabel}>Capital Adequacy</span>
          <span className={styles.cellValue}>{formatPercent1(v.car)}</span>
          <span className={styles.cellSub}>aufsichtlich · konsolidiert</span>
        </div>

        <div className={styles.cell}>
          <span className={styles.cellLabel}>Liquidity Coverage</span>
          <span className={styles.cellValue}>{formatPercent1(v.lcr)}</span>
          <span className={styles.cellSub}>30-Tage-Stress</span>
        </div>

        <div className={`${styles.cell} ${styles.cellDonut}`}>
          <span className={styles.cellLabel}>Risk Exposure</span>
          <Donut
            value={v.riskExposure}
            label="vs. Limit"
            display={`${formatInt(Math.round(v.riskExposure * 100))}%`}
            size={72}
            fillColor="var(--green-dark)"
          />
        </div>

        <div className={`${styles.cell} ${styles.cellBars}`}>
          <span className={styles.cellLabel}>Net Interest Income</span>
          <MiniBars values={v.nii} height={56} />
          <span className={styles.cellSub}>{formatEurM(v.dailyVolume)} Tagesvolumen</span>
        </div>
      </div>
    </div>
  )
}
