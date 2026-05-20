import styles from './Boardroom.module.css'
import { CockpitDashboard } from '../widgets/CockpitDashboard'

type BoardroomProps = {
  focused: boolean
}

export function Boardroom({ focused }: BoardroomProps): React.ReactElement {
  return (
    <div className={styles.room}>
      {/* Glaswand / Fenster-Andeutung */}
      <div className={styles.windows} aria-hidden>
        <div className={styles.windowPane} />
        <div className={styles.windowPane} />
        <div className={styles.windowPane} />
        <div className={styles.windowPane} />
        <div className={styles.windowPane} />
      </div>

      {/* Wand-Dashboard */}
      <div className={styles.dashboardSlot}>
        <CockpitDashboard live={focused} />
      </div>

      {/* Konferenztisch */}
      <div className={styles.table} aria-hidden>
        <div className={styles.tableTop} />
        <div className={styles.tableShadow} />
      </div>

      {/* Vier sitzende Vorstands-Figuren */}
      <div className={styles.figures} aria-hidden>
        <ExecutiveFigure offsetX={18} skin="#D6A77A" jacket="#2B3A47" />
        <ExecutiveFigure offsetX={38} skin="#C68A65" jacket="#1F2B36" />
        <ExecutiveFigure offsetX={62} skin="#D4A37E" jacket="#3A4452" />
        <ExecutiveFigure offsetX={82} skin="#B97F58" jacket="#28323F" />
      </div>

      {/* Hängelampe */}
      <div className={styles.pendantLight} aria-hidden>
        <div className={styles.pendantCord} />
        <div className={styles.pendantBulb} />
        <div className={styles.pendantGlow} />
      </div>
    </div>
  )
}

function ExecutiveFigure({
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
      className={styles.figure}
      style={{ left: `${offsetX}%` }}
      viewBox="0 0 60 70"
      width={48}
      height={56}
    >
      <ellipse cx="30" cy="14" rx="9" ry="10" fill={skin} />
      <path
        d="M14 70 L46 70 L43 38 Q43 30 30 26 Q17 30 17 38 Z"
        fill={jacket}
      />
      <path
        d="M30 32 L30 52"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="1"
      />
      <ellipse cx="30" cy="9" rx="9" ry="6" fill="#1B1F25" opacity="0.78" />
    </svg>
  )
}
