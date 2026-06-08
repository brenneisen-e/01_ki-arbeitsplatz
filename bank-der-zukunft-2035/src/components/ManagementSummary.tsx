import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Sparkles, Telescope, X } from 'lucide-react'
import styles from './ManagementSummary.module.css'
import { CHAPTERS } from '../data/chapters'
import { useReducedMotion } from '../hooks/useReducedMotion'

// ─────────────────────────────────────────────────────────────────────────────
// ManagementSummary — Overlay über dem Strukturbild (Übersicht). Zeigt pro
// Kapitel (7) das aus den drei Hypothesen abgeleitete Vision Statement der
// „Bank 2035"; `**fett**` markiert das besonders Wichtige. Deloitte-Lockup via
// logo.dev mit Wortmarken-Fallback. Esc / Backdrop-Klick / X schließen; das
// Strukturbild dahinter wird vom Backdrop weichgezeichnet.
// ─────────────────────────────────────────────────────────────────────────────

// logo.dev (öffentlicher Publishable-Key, identisch zu den übrigen Repo-Apps).
const LOGO_TOKEN = 'pk_H7vb5Y2lTsW47U4Xq-w3HA'
const DELOITTE_LOGO = `https://img.logo.dev/deloitte.com?token=${LOGO_TOKEN}&format=png&size=240&retina=true`

// Gesamtzusammenfassung — synthetisiert die sieben Bereichs-Visionen zu einem
// durchgehenden Zielbild der „Bank 2035". `**fett**` markiert die Kernaussagen.
const GESAMT_SUMMARY =
  'Bis 2035 wird aus unserer Bank eine **AI-native Plattform-Bank**: Für Kund:innen wird Banking **unsichtbar und Teil des Alltags** — persönliche KI-Finanzassistenten übernehmen eine teilautonome Finanzsteuerung mit Vertrauensmandat. Im Vertrieb verkaufen wir keine Produkte mehr, sondern **orchestrieren hyperpersonalisierte Lösungen** entlang der Kundenziele, während KI-augmentierte Berater:innen bei komplexen Entscheidungen den Unterschied machen. Die Marktfolge wandelt sich **vom Kostenblock zur wertschöpfenden Plattform** mit vollautonomer Dunkelverarbeitung und Banking-as-a-Service, und Corporate Services werden zum **Enabler des Wandels**, der Skills, Rollen und Teams in Echtzeit steuert. Technologisch **entwickelt, testet und deployt sich Software weitgehend selbst** innerhalb klarer Leitplanken, während Compliance **in jede Entscheidung eingebaut** ist statt nachgelagert zu bremsen. Den Weg dorthin gehen wir **decision-first** — über wenige kritische Decision Journeys und eine skalierbare Decision Spine.'

// Mini-Markdown: **fett** → <strong>. Sonst Klartext (analog ChapterReader).
function renderRichText(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    return <span key={i}>{part}</span>
  })
}

type ManagementSummaryProps = {
  onClose: () => void
}

export function ManagementSummary({
  onClose,
}: ManagementSummaryProps): React.ReactElement {
  const backdropRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [logoFailed, setLogoFailed] = useState(false)
  const reducedMotion = useReducedMotion()

  // Esc schließt.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Fade-/Grow-in (analog IframeStage); bei reduced motion harter Schnitt.
  useLayoutEffect(() => {
    const backdrop = backdropRef.current
    const panel = panelRef.current
    if (!backdrop || !panel) return
    gsap.killTweensOf([backdrop, panel])
    if (reducedMotion) {
      gsap.set(backdrop, { opacity: 1 })
      gsap.set(panel, { opacity: 1, scale: 1, y: 0 })
      return
    }
    gsap.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' })
    gsap.fromTo(
      panel,
      { opacity: 0, scale: 0.95, y: 16 },
      { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'power3.out' },
    )
  }, [reducedMotion])

  return (
    <div
      className={styles.root}
      role="dialog"
      aria-modal="true"
      aria-label="Management Summary — Vision der Bank 2035"
    >
      <div ref={backdropRef} className={styles.backdrop} onClick={onClose} aria-hidden />

      <div ref={panelRef} className={styles.panel}>
        <header className={styles.header}>
          <div className={styles.brandRow}>
            <span className={styles.logoTile}>
              {logoFailed ? (
                <span className={styles.logoFallback}>
                  Deloitte<span className={styles.logoDot}>.</span>
                </span>
              ) : (
                <img
                  className={styles.logoImg}
                  src={DELOITTE_LOGO}
                  alt="Deloitte"
                  width={150}
                  height={36}
                  onError={() => setLogoFailed(true)}
                />
              )}
            </span>
            <span className={styles.titleBlock}>
              <span className={styles.kicker}>Banking Horizon 2035</span>
              <h2 className={styles.title}>Management Summary</h2>
            </span>
          </div>

          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Management Summary schließen"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </header>

        <div className={styles.lead}>
          <span className={styles.leadIcon} aria-hidden>
            <Telescope size={17} strokeWidth={1.9} />
          </span>
          <div className={styles.leadText}>
            <span className={styles.leadTitle}>Gesamtzusammenfassung</span>
            <p>{renderRichText(GESAMT_SUMMARY)}</p>
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.grid}>
            {CHAPTERS.map((chapter) => (
              <article key={chapter.id} className={styles.card}>
                <div className={styles.cardHead}>
                  <span className={styles.num}>{chapter.kapitel}</span>
                  <span className={styles.cardHeadText}>
                    <span className={styles.cardLabel}>{chapter.label}</span>
                  </span>
                </div>
                <p className={styles.visionText}>{renderRichText(chapter.vision)}</p>
                <span className={styles.visionTag} aria-hidden>
                  <Sparkles size={12} strokeWidth={2.2} />
                  Vision 2035
                </span>
              </article>
            ))}
          </div>
        </div>

        <footer className={styles.footer}>
          <span className={styles.footNote}>
            Vorstands-Workshop · abgeleitet aus 21 Hypothesen (3 je Kapitel)
          </span>
          <span className={styles.footHint}>Esc oder Klick außerhalb schließt</span>
        </footer>
      </div>
    </div>
  )
}
