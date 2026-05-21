import { ArrowRight, Play } from 'lucide-react'
import styles from './FloorPanel.module.css'

type FloorPanelProps = {
  floor: {
    id: string
    label: string
    kicker: string
    chapter: {
      title: string
      body: string
      kpis: { label: string; value: string }[]
    }
    demo?: unknown
  }
  onOpenDemo?: () => void
}

export function FloorPanel({ floor, onOpenDemo }: FloorPanelProps): React.ReactElement {
  const { kicker, label, chapter, demo } = floor
  const hasDemo = Boolean(demo)
  return (
    <article className={styles.panel} aria-labelledby={`floor-${floor.id}-title`}>
      <div className={styles.shade} aria-hidden />
      <div className={styles.body}>
        <header className={styles.header}>
          <span className={styles.kicker}>{kicker}</span>
          <h1 id={`floor-${floor.id}-title`} className={styles.title}>
            {chapter.title}
          </h1>
          <span className={styles.subLabel}>{label}</span>
        </header>

        <p className={styles.copy}>{chapter.body}</p>

        <ul className={styles.kpis} role="list">
          {chapter.kpis.map((k) => (
            <li key={k.label} className={styles.kpiCard}>
              <span className={styles.kpiLabel}>{k.label}</span>
              <span className={styles.kpiValue}>{k.value}</span>
            </li>
          ))}
        </ul>

        {hasDemo && onOpenDemo && (
          <button type="button" className={styles.demoCard} onClick={onOpenDemo}>
            <span className={styles.demoCardIcon}>
              <Play size={16} strokeWidth={2.2} />
            </span>
            <span className={styles.demoCardText}>
              <span className={styles.demoCardKicker}>Live-Demo &amp; Folien</span>
              <span className={styles.demoCardLabel}>Vertiefung öffnen</span>
            </span>
            <ArrowRight
              size={16}
              strokeWidth={2}
              className={styles.demoCardArrow}
              aria-hidden
            />
          </button>
        )}
      </div>
    </article>
  )
}
