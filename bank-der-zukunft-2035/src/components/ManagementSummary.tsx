import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Sparkles, Telescope, X } from 'lucide-react'
import styles from './ManagementSummary.module.css'
import { getChapters } from '../data/chapters'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useLang, type Lang } from '../i18n/LanguageContext'

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

type SummaryStrings = {
  aria: string
  kicker: string
  title: string
  close: string
  leadTitle: string
  gesamt: string
  visionTag: string
  footNote: string
  footHint: string
}

// Gesamtzusammenfassung — synthetisiert die acht Bereichs-Visionen zu einem
// durchgehenden Zielbild der „Bank 2035". `**fett**` markiert die Kernaussagen.
const STR: Record<Lang, SummaryStrings> = {
  de: {
    aria: 'Management Summary — Vision der Bank 2035',
    kicker: 'Banking Horizon 2035',
    title: 'Management Summary',
    close: 'Management Summary schließen',
    leadTitle: 'Gesamtzusammenfassung',
    gesamt:
      'Bis 2035 wird unsere Bank zur **AI-nativen Plattform-Bank**: Banking wird für Kund:innen **unsichtbar und Teil des Alltags**, der Vertrieb **orchestriert hyperpersonalisierte Lösungen** statt Produkte, die Marktfolge wird **vom Kostenblock zur Plattform**. Produkte entstehen als **lebende, adaptive Services für das Segment of One** — komponiert in Tagen statt Jahren. Software **entwickelt sich weitgehend selbst** in klaren Leitplanken, Compliance ist **in jede Entscheidung eingebaut** — den Weg dorthin gehen wir **decision-first**.',
    visionTag: 'Vision 2035',
    footNote: 'Vorstands-Workshop · abgeleitet aus 24 Hypothesen (3 je Kapitel)',
    footHint: 'Esc oder Klick außerhalb schließt',
  },
  en: {
    aria: 'Management summary — vision of the bank in 2035',
    kicker: 'Banking Horizon 2035',
    title: 'Management summary',
    close: 'Close the management summary',
    leadTitle: 'Overall summary',
    gesamt:
      'By 2035 our bank becomes an **AI-native platform bank**: for customers, banking turns **invisible and part of everyday life**, distribution **orchestrates hyper-personalised solutions** instead of products, and operations move **from a cost block to a platform**. Products emerge as **living, adaptive services for the segment of one** — composed in days rather than years. Software **largely develops itself** within clear guardrails, compliance is **built into every decision** — and we get there **decision-first**.',
    visionTag: 'Vision 2035',
    footNote: 'Board workshop · derived from 24 hypotheses (3 per chapter)',
    footHint: 'Esc or a click outside closes',
  },
}

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
  const { lang } = useLang()
  const t = STR[lang]
  const chapters = getChapters(lang)

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
      aria-label={t.aria}
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
              <span className={styles.kicker}>{t.kicker}</span>
              <h2 className={styles.title}>{t.title}</h2>
            </span>
          </div>

          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label={t.close}
          >
            <X size={18} strokeWidth={2} />
          </button>
        </header>

        <div className={styles.lead}>
          <span className={styles.leadIcon} aria-hidden>
            <Telescope size={17} strokeWidth={1.9} />
          </span>
          <div className={styles.leadText}>
            <span className={styles.leadTitle}>{t.leadTitle}</span>
            <p>{renderRichText(t.gesamt)}</p>
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.grid}>
            {chapters.map((chapter) => (
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
                  {t.visionTag}
                </span>
              </article>
            ))}
          </div>
        </div>

        <footer className={styles.footer}>
          <span className={styles.footNote}>{t.footNote}</span>
          <span className={styles.footHint}>{t.footHint}</span>
        </footer>
      </div>
    </div>
  )
}
