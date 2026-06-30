import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Lightbulb,
  MousePointerClick,
  Network,
  TrendingUp,
  Users,
} from 'lucide-react'
import styles from './SzenarioVorspann.module.css'
import { ACHSEN, SZENARIEN, VORSPANN, getSzenario, type SzenarioId } from './szenarien'

// ─────────────────────────────────────────────────────────────────────────────
// SzenarioVorspann — interaktiver Auftakt vor der Kommandobrücke.
//
// Eine 2×2-Szenario-Matrix (links) mit Achsenkreuz, vier Quadranten-Kacheln
// (Titel + Kernthemen + Sentiment-Badge) und einem Detailpanel (rechts). Beim
// Mouseover über eine Kachel hebt sich der Quadrant hervor und das Panel blendet
// Narrativ + Workshop-Sentiment des Szenarios ein. Verdichtet drei Workshop-
// Folien zu einem Screen; führt per CTA in das Holodeck.
// ─────────────────────────────────────────────────────────────────────────────

// Fett-Auszeichnung in den Detail-Texten: **…** → <strong>; sonst Klartext.
function rich(text: string): React.ReactNode[] {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .filter((p) => p !== '')
    .map((p, i) =>
      p.startsWith('**') && p.endsWith('**') ? (
        <strong key={i}>{p.slice(2, -2)}</strong>
      ) : (
        <span key={i}>{p}</span>
      ),
    )
}

// Pro Detailpunkt ein einfarbiges Icon (in der Szenariofarbe). Die vier Punkte
// folgen in allen Szenarien demselben Bogen: Verbraucher:innen → Markt &
// Wettbewerb → IT & Ökosystem → KI & Beratung.
const DETAIL_ICONS = [Users, TrendingUp, Network, Lightbulb] as const

type Props = {
  /** Weiter in die Kommandobrücke (Vorspann verlassen). */
  onEnter: () => void
}

export function SzenarioVorspann({ onEnter }: Props): React.ReactElement {
  const [active, setActive] = useState<SzenarioId | null>(null)
  const aktiv = active ? getSzenario(active) : null
  const panelRef = useRef<HTMLDivElement>(null)

  // Bei jedem Szenariowechsel die Detailspalte an den Anfang scrollen, damit
  // immer der Titel oben sichtbar ist (nicht mitten im Text einsteigen).
  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0 })
  }, [active])

  return (
    // Aktives Szenario bleibt sichtbar, solange die Maus irgendwo in der
    // Komponente ist — so kann rechts gelesen/gescrollt werden, ohne dass das
    // Detail beim Verlassen der Kachel verschwindet. Erst beim Verlassen der
    // gesamten Fläche zurück zur Intro-Ansicht.
    <div className={styles.root} onMouseLeave={() => setActive(null)}>
      {/* ── Matrix (links) ── */}
      <div className={styles.matrixCol}>
        <div className={styles.matrixFrame}>
          {/* Richtungs-Labels an den Achsenenden */}
          <span className={`${styles.dir} ${styles.dirTop}`}>
            <ChevronUp size={15} strokeWidth={2.4} aria-hidden /> {ACHSEN.yOben}
          </span>
          <span className={`${styles.dir} ${styles.dirBottom}`}>
            {ACHSEN.yUnten} <ChevronDown size={15} strokeWidth={2.4} aria-hidden />
          </span>
          <span className={`${styles.dir} ${styles.dirLeft}`}>
            <ChevronLeft size={15} strokeWidth={2.4} aria-hidden /> {ACHSEN.xLinks}
          </span>
          <span className={`${styles.dir} ${styles.dirRight}`}>
            {ACHSEN.xRechts} <ChevronRight size={15} strokeWidth={2.4} aria-hidden />
          </span>

          <div className={styles.grid}>
            {/* Achsenkreuz in den Zwischenräumen */}
            <span className={styles.crossH} aria-hidden />
            <span className={styles.crossV} aria-hidden />
            <span className={`${styles.axisTitle} ${styles.axisXLeft}`} aria-hidden>
              {ACHSEN.xTitelLinks}
            </span>
            <span className={`${styles.axisTitle} ${styles.axisXRight}`} aria-hidden>
              {ACHSEN.xTitelRechts}
            </span>
            <span className={`${styles.axisTitle} ${styles.axisY}`} aria-hidden>
              {ACHSEN.yTitel}
            </span>

            {SZENARIEN.map((s) => {
              const dimmed = active !== null && active !== s.id
              return (
                <button
                  type="button"
                  key={s.id}
                  className={styles.tile}
                  data-active={active === s.id || undefined}
                  data-dimmed={dimmed || undefined}
                  style={{ '--sz': s.color } as React.CSSProperties}
                  onMouseEnter={() => setActive(s.id)}
                  onFocus={() => setActive(s.id)}
                  aria-label={`${s.title} — Sentiment ${s.sentiment} %`}
                >
                  <span className={styles.tileHead}>
                    <span className={styles.tileTitle}>{s.title}</span>
                    <span className={styles.tileSentiment}>{s.sentiment} %</span>
                  </span>
                  <ul className={styles.tileList}>
                    {s.kernthemen.map((k) => (
                      <li key={k}>{k}</li>
                    ))}
                  </ul>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Detailpanel (rechts) ── */}
      <aside className={styles.panel}>
        <div className={styles.panelScroll} ref={panelRef} data-active={aktiv ? '' : undefined}>
          {aktiv ? (
            <div className={styles.detail} style={{ '--sz': aktiv.color } as React.CSSProperties}>
              <div className={styles.detailHead}>
                <span className={styles.detailDot} aria-hidden />
                <h2 className={styles.detailTitle}>{aktiv.title}</h2>
              </div>
              <div className={styles.sentimentRow}>
                <span className={styles.sentimentBig}>{aktiv.sentiment} %</span>
                <span className={styles.sentimentLabel}>{VORSPANN.sentimentLabel}</span>
              </div>
              <p className={styles.narrativ}>{aktiv.narrativ}</p>
              <ul className={styles.detailList}>
                {aktiv.details.map((d, i) => {
                  const Icon = DETAIL_ICONS[i] ?? DETAIL_ICONS[DETAIL_ICONS.length - 1]
                  return (
                    <li key={d}>
                      <Icon className={styles.detailIcon} size={20} strokeWidth={2} aria-hidden />
                      <span className={styles.detailText}>{rich(d)}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          ) : (
            <div className={styles.intro}>
              <div className={styles.eyebrow}>{VORSPANN.eyebrow}</div>
              <h1 className={styles.title}>{VORSPANN.title}</h1>
              <p className={styles.lead}>{VORSPANN.lead}</p>
              <div className={styles.hint}>
                <MousePointerClick size={18} strokeWidth={2} aria-hidden />
                <span>{VORSPANN.hint}</span>
              </div>
              <p className={styles.note}>{VORSPANN.sentimentNote}</p>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <span className={styles.legende}>{VORSPANN.legende}</span>
          <button type="button" className={styles.cta} onClick={onEnter}>
            {VORSPANN.cta}
            <ArrowRight size={16} strokeWidth={2.4} aria-hidden />
          </button>
        </div>
      </aside>
    </div>
  )
}
