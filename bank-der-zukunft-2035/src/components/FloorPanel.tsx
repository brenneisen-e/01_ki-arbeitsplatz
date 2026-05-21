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
  }
}

export function FloorPanel({ floor }: FloorPanelProps): React.ReactElement {
  const { kicker, label, chapter } = floor
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

        <footer className={styles.footer}>
          <span className={styles.footerHint}>
            Kapitel-Inhalt · Platzhalter · später editierbar in&nbsp;
            <code>src/components/BankExplorer.tsx → FLOORS</code>
          </span>
        </footer>
      </div>
    </article>
  )
}
