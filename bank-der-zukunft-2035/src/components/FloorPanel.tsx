import { ArrowRight, Play, Search, Target } from 'lucide-react'
import styles from './FloorPanel.module.css'

type Slide = { title: string; statusQuo: string; in2035: string }

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
    demo?: {
      teaser: string
      slides: Slide[]
    }
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

        {/* Teaser ersetzt den langen chapter.body, sobald Demo-Inhalte
            vorhanden sind -- der lange Text wäre dort nur Wiederholung. */}
        <p className={styles.copy}>{demo ? demo.teaser : chapter.body}</p>

        {hasDemo && onOpenDemo && (
          <button type="button" className={styles.demoCard} onClick={onOpenDemo}>
            <span className={styles.demoCardIcon}>
              <Play size={16} strokeWidth={2.2} />
            </span>
            <span className={styles.demoCardText}>
              <span className={styles.demoCardKicker}>Live-Demo</span>
              <span className={styles.demoCardLabel}>Vertriebsarbeitsplatz öffnen</span>
            </span>
            <ArrowRight
              size={16}
              strokeWidth={2}
              className={styles.demoCardArrow}
              aria-hidden
            />
          </button>
        )}

        {demo && (
          <section className={styles.slides} aria-label="Status Quo vs. 2035">
            {demo.slides.map((s, i) => (
              <article key={i} className={styles.slide}>
                <h3 className={styles.slideTitle}>{s.title}</h3>
                <div className={styles.compare}>
                  <div className={styles.statusQuo}>
                    <div className={styles.compareHead}>
                      <span className={styles.compareIcon}>
                        <Search size={13} strokeWidth={2.2} />
                      </span>
                      <span className={styles.compareLabel}>Status Quo</span>
                    </div>
                    <p className={styles.compareBody}>{s.statusQuo}</p>
                  </div>
                  <div className={styles.in2035}>
                    <div className={styles.compareHead}>
                      <span className={styles.compareIcon} data-accent>
                        <Target size={13} strokeWidth={2.2} />
                      </span>
                      <span className={styles.compareLabel}>In 2035</span>
                    </div>
                    <p className={styles.compareBody}>{s.in2035}</p>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}

        <ul className={styles.kpis} role="list">
          {chapter.kpis.map((k) => (
            <li key={k.label} className={styles.kpiCard}>
              <span className={styles.kpiLabel}>{k.label}</span>
              <span className={styles.kpiValue}>{k.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}
