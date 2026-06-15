import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  LayoutGrid,
  Lightbulb,
  Phone,
  Play,
  Sparkles,
  Users,
} from 'lucide-react'
import styles from './ChapterReader.module.css'
import { ImageSlot } from './ImageSlot'
import { useLang, type Lang } from '../i18n/LanguageContext'
import type { Chapter, Handoff, ScreenOverlay } from '../data/chapters'

type ReaderStrings = {
  back: string
  chapterPrefix: string
  hypothesisOf: (n: number) => string
  activityKicker: string
  hypothesisSlot: (n: number) => string
  activitySlot: string
  statusQuo: string
  future: string
  leitfrage: string
  today: string
  prevStep: string
  nextStep: string
  steps: string
  activity: string
  hypothesisAria: (n: number) => string
  meta: Record<Handoff['kind'], string>
}

const STR: Record<Lang, ReaderStrings> = {
  de: {
    back: 'Übersicht',
    chapterPrefix: 'Kapitel',
    hypothesisOf: (n) => `Hypothese ${n} von 3`,
    activityKicker: 'Aktivität & Absprung',
    hypothesisSlot: (n) => `Hypothese ${n}`,
    activitySlot: 'Aktivität',
    statusQuo: 'Status Quo',
    future: '2035',
    leitfrage: 'Leitfrage',
    today: 'Heute · Status Quo',
    prevStep: 'Vorheriger Schritt',
    nextStep: 'Nächster Schritt',
    steps: 'Kapitel-Schritte',
    activity: 'Aktivität',
    hypothesisAria: (n) => `Hypothese ${n}`,
    meta: {
      iframe: 'Live-Demo',
      'strategy-lab': 'Strategy Lab · Diskussion',
      cocreation: 'Co-Creation',
      'kredit-dilemma': 'Interaktives Szenario',
    },
  },
  en: {
    back: 'Overview',
    chapterPrefix: 'Chapter',
    hypothesisOf: (n) => `Hypothesis ${n} of 3`,
    activityKicker: 'Activity & hand-off',
    hypothesisSlot: (n) => `Hypothesis ${n}`,
    activitySlot: 'Activity',
    statusQuo: 'Status quo',
    future: '2035',
    leitfrage: 'Guiding question',
    today: 'Today · status quo',
    prevStep: 'Previous step',
    nextStep: 'Next step',
    steps: 'Chapter steps',
    activity: 'Activity',
    hypothesisAria: (n) => `Hypothesis ${n}`,
    meta: {
      iframe: 'Live demo',
      'strategy-lab': 'Strategy Lab · discussion',
      cocreation: 'Co-creation',
      'kredit-dilemma': 'Interactive scenario',
    },
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// ChapterReader — die Kapitel-Sequenz nach dem Kameraflug:
//   Hypothese 1 → 2 → 3 → Aktivität/Demo.
// Layout: Vergleichsbild oben (Status Quo | 2035), darunter die beiden
// Hypothesen-Texte je unter ihrer Bildhälfte (links Status Quo, rechts 2035).
// Akzent #046A38, Absprung-Button auf dem Aktivitäts-Schritt.
// `step` wird von außen (BankExplorer) gesteuert, damit ein Refresh die Stelle
// wiederherstellen kann.
// ─────────────────────────────────────────────────────────────────────────────

export const STEP_COUNT = 4 // 3 Hypothesen + 1 Aktivität

type ChapterReaderProps = {
  chapter: Chapter
  step: number
  onStepChange: (step: number) => void
  onBack: () => void
  onHandoff: (handoff: Handoff) => void
}

// Mini-Markdown: **fett** → <strong>. Sonst Klartext.
function renderRichText(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    return <span key={i}>{part}</span>
  })
}

function handoffIcon(kind: Handoff['kind']): React.ReactElement {
  switch (kind) {
    case 'iframe':
      return <Play size={17} strokeWidth={2} aria-hidden />
    case 'strategy-lab':
      return <LayoutGrid size={17} strokeWidth={2} aria-hidden />
    case 'cocreation':
      return <Users size={17} strokeWidth={2} aria-hidden />
    case 'kredit-dilemma':
      return <Phone size={17} strokeWidth={2} aria-hidden />
  }
}

// iframe rendert bei fester Logik-Auflösung und wird per CSS-Transform passgenau
// auf die Bildschirmfläche im Foto skaliert (cover, kein Scrollbalken).
const IFRAME_LOGICAL_W = 1920
const IFRAME_LOGICAL_H = 1080

/** Live-iframe auf einer im Aktivitäts-Bild sichtbaren Bildschirmfläche. */
function ScreenIframe({ overlay }: { overlay: ScreenOverlay }): React.ReactElement {
  const wrapRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  useLayoutEffect(() => {
    const wrap = wrapRef.current
    const iframe = iframeRef.current
    if (!wrap || !iframe) return
    const update = () => {
      const w = wrap.clientWidth
      const h = wrap.clientHeight
      if (w <= 0 || h <= 0) return
      const scale = Math.max(w / IFRAME_LOGICAL_W, h / IFRAME_LOGICAL_H)
      iframe.style.transform = `translate(-50%, -50%) scale(${scale})`
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(wrap)
    window.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [])
  return (
    <div
      ref={wrapRef}
      className={styles.screen}
      style={{
        left: `${overlay.leftPct}%`,
        top: `${overlay.topPct}%`,
        width: `${overlay.widthPct}%`,
        height: `${overlay.heightPct}%`,
      }}
    >
      <iframe
        ref={iframeRef}
        className={styles.screenIframe}
        style={{ width: `${IFRAME_LOGICAL_W}px`, height: `${IFRAME_LOGICAL_H}px` }}
        src={overlay.url}
        title={overlay.title}
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      />
    </div>
  )
}

export function ChapterReader({
  chapter,
  step,
  onStepChange,
  onBack,
  onHandoff,
}: ChapterReaderProps): React.ReactElement {
  const { lang } = useLang()
  const t = STR[lang]
  const goPrev = useCallback(
    () => onStepChange(Math.max(0, step - 1)),
    [step, onStepChange],
  )
  const goNext = useCallback(
    () => onStepChange(Math.min(STEP_COUNT - 1, step + 1)),
    [step, onStepChange],
  )

  // Tastatur: Esc → zurück, Pfeile blättern.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onBack()
      else if (e.key === 'ArrowRight') goNext()
      else if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onBack, goNext, goPrev])

  const isActivity = step === STEP_COUNT - 1
  const hypothesis = isActivity ? null : chapter.hypotheses[step]
  const activity = chapter.activity

  const image = hypothesis ? hypothesis.image : activity.image
  const title = hypothesis ? hypothesis.title : activity.title
  const chapterLabel = `${t.chapterPrefix} ${chapter.kapitel}`
  const kicker = hypothesis
    ? `${chapterLabel} · ${t.hypothesisOf(step + 1)}`
    : `${chapterLabel} · ${t.activityKicker}`
  const slotLabel = hypothesis
    ? `${chapterLabel} · ${t.hypothesisSlot(step + 1)}`
    : `${chapterLabel} · ${t.activitySlot}`

  const metaLabel = t.meta[activity.handoff.kind]
  const metaIcon = handoffIcon(activity.handoff.kind)

  return (
    <div className={styles.root}>
      <header className={styles.topbar}>
        <button type="button" className={styles.back} onClick={onBack}>
          <ArrowLeft size={16} strokeWidth={1.8} aria-hidden />
          <span>{t.back}</span>
        </button>

        <div className={styles.chapterChip} aria-hidden>
          <span className={styles.chipNum}>{chapter.kapitel}</span>
          <span className={styles.chipText}>
            <span className={styles.chipLabel}>{chapter.label}</span>
            <span className={styles.chipOrt}>{chapter.ort}</span>
          </span>
        </div>

        <span className={styles.kicker}>{kicker}</span>
      </header>

      <div className={styles.content} key={`content-${step}`}>
        <h1 className={styles.title}>{title}</h1>

        <div className={styles.media}>
          <div className={styles.imageInner}>
            <ImageSlot
              src={image.src}
              alt={image.alt}
              fit="cover"
              label={slotLabel}
              caption={title}
            />
            {hypothesis && (
              <div className={styles.split} aria-hidden>
                <span className={styles.splitLine} />
                <span className={styles.splitLeft}>{t.statusQuo}</span>
                <span className={styles.splitRight}>{t.future}</span>
              </div>
            )}
            {isActivity && activity.screenOverlay && (
              <ScreenIframe overlay={activity.screenOverlay} />
            )}
          </div>
          {/* Leitfrage als Sprechblase rechts neben dem 2035-Bild (breite Screens).
              Auf schmalen Screens unsichtbar — dort greift die Leiste unten. */}
          {hypothesis?.leitfrage && (
            <aside className={styles.calloutFloat}>
              {/* Echte Sprechblase: komplette Silhouette (Körper + Tail nach
                  links auf das 2035-Bild) als ein einziger SVG-Pfad. */}
              <svg
                className={styles.calloutBubble}
                viewBox="0 0 250 162"
                preserveAspectRatio="none"
                aria-hidden
                focusable="false"
              >
                <path d="M34,3 L226,3 Q247,3 247,26 L247,136 Q247,159 226,159 L34,159 Q13,159 13,136 L13,99 C7,96 3,91 2,83 C4,79 9,77 13,69 L13,26 Q13,3 34,3 Z" />
              </svg>
              <div className={styles.calloutInner}>
                <span className={styles.calloutHead}>
                  <Lightbulb size={14} strokeWidth={2} aria-hidden />
                  {t.leitfrage}
                </span>
                <p className={styles.calloutText}>{hypothesis.leitfrage}</p>
              </div>
            </aside>
          )}
        </div>

        {hypothesis ? (
          <>
            <div className={styles.compareGrid}>
              <article className={styles.compareCard} data-quo>
                <span className={styles.compareHead}>
                  <Clock size={14} strokeWidth={2.2} aria-hidden />
                  {t.today}
                </span>
                <p className={styles.compareText}>
                  {renderRichText(hypothesis.statusQuo)}
                </p>
              </article>
              <article className={styles.compareCard} data-future>
                <span className={styles.compareHead}>
                  <Sparkles size={14} strokeWidth={2.2} aria-hidden />
                  {t.future}
                </span>
                <p className={styles.compareText}>
                  {renderRichText(hypothesis.in2035)}
                </p>
              </article>
            </div>
            {hypothesis.leitfrage && (
              <p className={styles.leitfrage}>
                <Lightbulb size={16} strokeWidth={2} aria-hidden />
                <span>{hypothesis.leitfrage}</span>
              </p>
            )}
          </>
        ) : (
          <div className={styles.activityBox}>
            <span className={styles.compareTag} data-accent>
              {metaIcon}
              {metaLabel}
            </span>
            <p className={styles.copy}>{renderRichText(activity.text)}</p>
            <div className={styles.ctaRow}>
              <button
                type="button"
                className={styles.cta}
                onClick={() => onHandoff(activity.handoff)}
              >
                {metaIcon}
                <span>{activity.buttonLabel}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <footer className={styles.pager}>
        <button
          type="button"
          className={styles.pagerBtn}
          onClick={goPrev}
          disabled={step === 0}
          aria-label={t.prevStep}
        >
          <ChevronLeft size={18} strokeWidth={2} />
        </button>

        <div className={styles.dots} role="tablist" aria-label={t.steps}>
          {Array.from({ length: STEP_COUNT }).map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === step}
              className={styles.dot}
              data-active={i === step || undefined}
              data-activity={i === STEP_COUNT - 1 || undefined}
              onClick={() => onStepChange(i)}
              aria-label={i === STEP_COUNT - 1 ? t.activity : t.hypothesisAria(i + 1)}
            />
          ))}
        </div>

        <button
          type="button"
          className={styles.pagerBtn}
          onClick={goNext}
          disabled={isActivity}
          aria-label={t.nextStep}
        >
          <ChevronRight size={18} strokeWidth={2} />
        </button>
      </footer>
    </div>
  )
}
