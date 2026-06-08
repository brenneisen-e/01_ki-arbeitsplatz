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
import type { Chapter, Handoff, ScreenOverlay } from '../data/chapters'

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

function handoffMeta(handoff: Handoff): { label: string; icon: React.ReactElement } {
  switch (handoff.kind) {
    case 'iframe':
      return { label: 'Live-Demo', icon: <Play size={17} strokeWidth={2} aria-hidden /> }
    case 'strategy-lab':
      return { label: 'Strategy Lab · Diskussion', icon: <LayoutGrid size={17} strokeWidth={2} aria-hidden /> }
    case 'cocreation':
      return { label: 'Co-Creation', icon: <Users size={17} strokeWidth={2} aria-hidden /> }
    case 'kredit-dilemma':
      return { label: 'Interaktives Szenario', icon: <Phone size={17} strokeWidth={2} aria-hidden /> }
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
  const kicker = hypothesis
    ? `Kapitel ${chapter.kapitel} · Hypothese ${step + 1} von 3`
    : `Kapitel ${chapter.kapitel} · Aktivität & Absprung`
  const slotLabel = hypothesis
    ? `Kapitel ${chapter.kapitel} · Hypothese ${step + 1}`
    : `Kapitel ${chapter.kapitel} · Aktivität`

  const meta = handoffMeta(activity.handoff)

  return (
    <div className={styles.root}>
      <header className={styles.topbar}>
        <button type="button" className={styles.back} onClick={onBack}>
          <ArrowLeft size={16} strokeWidth={1.8} aria-hidden />
          <span>Übersicht</span>
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
                <span className={styles.splitLeft}>Status Quo</span>
                <span className={styles.splitRight}>2035</span>
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
              <span className={styles.calloutHead}>
                <Lightbulb size={14} strokeWidth={2} aria-hidden />
                Leitfrage
              </span>
              <p className={styles.calloutText}>{hypothesis.leitfrage}</p>
            </aside>
          )}
        </div>

        {hypothesis ? (
          <>
            <div className={styles.compareGrid}>
              <article className={styles.compareCard} data-quo>
                <span className={styles.compareHead}>
                  <Clock size={14} strokeWidth={2.2} aria-hidden />
                  Heute · Status Quo
                </span>
                <p className={styles.compareText}>
                  {renderRichText(hypothesis.statusQuo)}
                </p>
              </article>
              <article className={styles.compareCard} data-future>
                <span className={styles.compareHead}>
                  <Sparkles size={14} strokeWidth={2.2} aria-hidden />
                  2035
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
              {meta.icon}
              {meta.label}
            </span>
            <p className={styles.copy}>{renderRichText(activity.text)}</p>
            <div className={styles.ctaRow}>
              <button
                type="button"
                className={styles.cta}
                onClick={() => onHandoff(activity.handoff)}
              >
                {meta.icon}
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
          aria-label="Vorheriger Schritt"
        >
          <ChevronLeft size={18} strokeWidth={2} />
        </button>

        <div className={styles.dots} role="tablist" aria-label="Kapitel-Schritte">
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
              aria-label={i === STEP_COUNT - 1 ? 'Aktivität' : `Hypothese ${i + 1}`}
            />
          ))}
        </div>

        <button
          type="button"
          className={styles.pagerBtn}
          onClick={goNext}
          disabled={isActivity}
          aria-label="Nächster Schritt"
        >
          <ChevronRight size={18} strokeWidth={2} />
        </button>
      </footer>
    </div>
  )
}
