import { Bot, ArrowRight } from 'lucide-react'
import styles from './Operations.module.css'
import { Donut } from '../widgets/Donut'
import { MiniLine } from '../widgets/MiniLine'
import { useTicker } from '../../hooks/useTicker'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { formatEurM, formatPercent0 } from '../../lib/format'

type OperationsProps = {
  focused: boolean
}

const PROCESS_STEPS = ['INPUT', 'VALIDATE', 'ENRICH', 'ROUTE', 'SETTLE']

export function Operations({ focused }: OperationsProps): React.ReactElement {
  const reduced = useReducedMotion()
  const live = focused && !reduced
  const v = useTicker(live, 2000)

  return (
    <div className={styles.room}>
      {/* Fensterband */}
      <div className={styles.windows} aria-hidden>
        {Array.from({ length: 7 }, (_, i) => (
          <div className={styles.windowPane} key={i} />
        ))}
      </div>

      {/* Monitor-Wand */}
      <div className={styles.monitorWall}>
        <div className={styles.monitor}>
          <span className={styles.monitorLabel}>Tagesvolumen</span>
          <span className={styles.monitorValue}>{formatEurM(v.dailyVolume)}</span>
          <MiniLine
            initial={[42, 48, 55, 51, 60, 58, 64, 62, 68, 65, 72]}
            width={156}
            height={36}
            color="#046A38"
            tickMs={1700}
            drift={{ center: 64, span: 22, min: 30, max: 88 }}
            enabled={live}
          />
        </div>

        <div className={`${styles.monitor} ${styles.monitorDonut}`}>
          <span className={styles.monitorLabel}>STP-Quote</span>
          <Donut
            value={v.stp / 100}
            label="straight-through"
            display={formatPercent0(v.stp)}
            size={84}
            fillColor="#86BC25"
            trackColor="rgba(33,33,33,0.08)"
          />
        </div>

        <div className={`${styles.monitor} ${styles.monitorFlow}`}>
          <span className={styles.monitorLabel}>Process Fabric</span>
          <ul className={styles.processFlow} role="list">
            {PROCESS_STEPS.map((s, i) => (
              <li key={s} className={styles.processStep}>
                <span className={styles.processIndex}>{i + 1}</span>
                <span className={styles.processName}>{s}</span>
                {i < PROCESS_STEPS.length - 1 && (
                  <ArrowRight size={11} className={styles.processArrow} aria-hidden />
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Desks */}
      <div className={styles.desks} aria-hidden>
        <Desk offsetX={11} />
        <Desk offsetX={28} />
        <Desk offsetX={72} />
        <Desk offsetX={88} />
      </div>

      {/* Mitarbeitende */}
      <div className={styles.workers} aria-hidden>
        <Worker offsetX={11} skin="#D7A981" jacket="#3D5B68" />
        <Worker offsetX={28} skin="#C68A65" jacket="#5C4632" />
        <Worker offsetX={72} skin="#D3A580" jacket="#A04B33" />
        <Worker offsetX={88} skin="#B97F58" jacket="#2A3F2C" />
      </div>

      {/* Service-Roboter */}
      <div className={styles.robot}>
        <div className={styles.robotBody}>
          <Bot size={22} strokeWidth={1.6} aria-hidden />
        </div>
        <div className={styles.robotShadow} aria-hidden />
      </div>
    </div>
  )
}

function Desk({ offsetX }: { offsetX: number }): React.ReactElement {
  return (
    <div className={styles.desk} style={{ left: `${offsetX}%` }}>
      <div className={styles.deskTop} />
      <div className={styles.deskMonitor} />
    </div>
  )
}

function Worker({
  offsetX,
  skin,
  jacket,
}: {
  offsetX: number
  skin: string
  jacket: string
}): React.ReactElement {
  return (
    <svg
      className={styles.worker}
      style={{ left: `${offsetX}%` }}
      viewBox="0 0 50 60"
      width={42}
      height={50}
    >
      <ellipse cx="25" cy="14" rx="7.5" ry="8.5" fill={skin} />
      <path d="M12 60 L38 60 L36 32 Q36 26 25 24 Q14 26 14 32 Z" fill={jacket} />
      <ellipse cx="25" cy="10" rx="7.5" ry="5" fill="#1B1F25" opacity="0.78" />
    </svg>
  )
}
