import { useEffect, useState } from 'react'
import { Maximize2, Minimize2, Search, Target } from 'lucide-react'
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
  sceneNarrative?: SceneNarrative
  /**
   * Schrumpft das Panel horizontal (für den Hover-auf-Demo-Modus, in dem
   * das iframe mehr Platz bekommt, ohne den Kontext komplett zu verlieren).
   */
  minimized?: boolean
}

// Mini-Markdown: **fett** -> <strong>fett</strong>. Keine anderen Tags.
function renderRichText(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    return <span key={i}>{part}</span>
  })
}

export function FloorPanel({
  floor,
  sceneNarrative,
  minimized,
}: FloorPanelProps): React.ReactElement {
  const kicker = sceneNarrative?.kicker ?? floor.kicker
  const title = sceneNarrative?.title ?? floor.chapter.title
  const body = sceneNarrative?.body ?? floor.chapter.body
  const kpis = sceneNarrative?.kpis ?? floor.chapter.kpis
  const slides = sceneNarrative?.slides ?? []

  // Manuelles Minimieren via Button (unabhängig vom hover-getriebenen
  // `minimized`-Prop): wird beim Wechsel der Etage zurückgesetzt.
  const [userMinimized, setUserMinimized] = useState(false)
  useEffect(() => {
    setUserMinimized(false)
  }, [floor.id])
  const isMinimized = userMinimized || Boolean(minimized)

  return (
    <article
      className={styles.panel}
      data-minimized={isMinimized || undefined}
      aria-labelledby={`floor-${floor.id}-title`}
    >
      <div className={styles.shade} aria-hidden />
      <button
        type="button"
        className={styles.toggle}
        onClick={() => setUserMinimized((v) => !v)}
        aria-label={userMinimized ? 'Panel maximieren' : 'Panel minimieren'}
        title={userMinimized ? 'Maximieren' : 'Minimieren'}
      >
        {userMinimized ? (
          <Maximize2 size={16} strokeWidth={2} aria-hidden />
        ) : (
          <Minimize2 size={16} strokeWidth={2} aria-hidden />
        )}
      </button>
      <div className={styles.body}>
        <header className={styles.header}>
          <span className={styles.kicker}>{kicker}</span>
          <h1 id={`floor-${floor.id}-title`} className={styles.title}>
            {title}
          </h1>
          <span className={styles.subLabel}>{floor.label}</span>
        </header>

        <p className={styles.copy}>{renderRichText(body)}</p>

        {slides.length > 0 && (
          <section className={styles.slides} aria-label="Status Quo vs. 2035">
            {slides.map((s, i) => (
              <article key={i} className={styles.slide}>
                <h3 className={styles.slideTitle}>{s.title}</h3>
                <div className={styles.compare}>
                  <div className={styles.statusQuo}>
                    <div className={styles.compareHead}>
                      <span className={styles.compareIcon}>
                        <Search size={14} strokeWidth={2.2} />
                      </span>
                      <span className={styles.compareLabel}>Status Quo</span>
                    </div>
                    <p className={styles.compareBody}>{renderRichText(s.statusQuo)}</p>
                  </div>
                  <div className={styles.in2035}>
                    <div className={styles.compareHead}>
                      <span className={styles.compareIcon} data-accent>
                        <Target size={14} strokeWidth={2.2} />
                      </span>
                      <span className={styles.compareLabel}>In 2035</span>
                    </div>
                    <p className={styles.compareBody}>{renderRichText(s.in2035)}</p>
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
