import { Search, Target } from 'lucide-react'
import styles from './FloorPanel.module.css'

type Slide = { title: string; statusQuo: string; in2035: string }
type Kpi = { label: string; value: string }

type SceneNarrative = {
  kicker?: string
  title?: string
  body?: string
  kpis?: Kpi[]
  slides?: Slide[]
}

type FloorPanelProps = {
  floor: {
    id: string
    label: string
    kicker: string
    chapter: {
      title: string
      body: string
      kpis: Kpi[]
    }
  }
  /**
   * Optional: aktive Szene überschreibt Kicker/Title/Body/KPIs/Slides
   * für das Panel. Beim Durchklicken durch Szenen wandert die Story
   * mit -- jede Szene erzählt ihren eigenen Schritt.
   */
  sceneNarrative?: SceneNarrative
}

export function FloorPanel({ floor, sceneNarrative }: FloorPanelProps): React.ReactElement {
  const kicker = sceneNarrative?.kicker ?? floor.kicker
  const title = sceneNarrative?.title ?? floor.chapter.title
  const body = sceneNarrative?.body ?? floor.chapter.body
  const kpis = sceneNarrative?.kpis ?? floor.chapter.kpis
  const slides = sceneNarrative?.slides ?? []
  return (
    <article className={styles.panel} aria-labelledby={`floor-${floor.id}-title`}>
      <div className={styles.shade} aria-hidden />
      <div className={styles.body}>
        <header className={styles.header}>
          <span className={styles.kicker}>{kicker}</span>
          <h1 id={`floor-${floor.id}-title`} className={styles.title}>
            {title}
          </h1>
          <span className={styles.subLabel}>{floor.label}</span>
        </header>

        <p className={styles.copy}>{body}</p>

        {slides.length > 0 && (
          <section className={styles.slides} aria-label="Status Quo vs. 2035">
            {slides.map((s, i) => (
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

        {kpis.length > 0 && (
          <ul className={styles.kpis} role="list">
            {kpis.map((k) => (
              <li key={k.label} className={styles.kpiCard}>
                <span className={styles.kpiLabel}>{k.label}</span>
                <span className={styles.kpiValue}>{k.value}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  )
}
