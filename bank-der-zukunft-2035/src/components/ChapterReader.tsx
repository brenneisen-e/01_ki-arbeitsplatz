import { useCallback, useEffect, useState } from 'react'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Phone,
  Play,
  Users,
} from 'lucide-react'
import styles from './ChapterReader.module.css'
import { ImageSlot } from './ImageSlot'
import type { Chapter, Handoff } from '../data/chapters'

// ─────────────────────────────────────────────────────────────────────────────
// ChapterReader — die Kapitel-Sequenz nach dem Kameraflug:
//   Hypothese 1 → 2 → 3 → Aktivität/Demo.
// Layout einheitlich: Bild links/mittig, Textpanel rechts, Akzent #046A38,
// Absprung-Button unten rechts (auf dem Aktivitäts-Schritt).
// ─────────────────────────────────────────────────────────────────────────────

type ChapterReaderProps = {
  chapter: Chapter
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

const STEP_COUNT = 4 // 3 Hypothesen + 1 Aktivität

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

export function ChapterReader({
  chapter,
  onBack,
  onHandoff,
}: ChapterReaderProps): React.ReactElement {
  const [step, setStep] = useState(0)

  // Beim Kapitelwechsel auf Schritt 1 zurück.
  useEffect(() => {
    setStep(0)
  }, [chapter.id])

  const goPrev = useCallback(() => setStep((s) => Math.max(0, s - 1)), [])
  const goNext = useCallback(() => setStep((s) => Math.min(STEP_COUNT - 1, s + 1)), [])

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
  const text = hypothesis ? hypothesis.text : activity.text
  const kicker = hypothesis
    ? `Kapitel ${chapter.kapitel} · Hypothese ${step + 1} von 3`
    : `Kapitel ${chapter.kapitel} · Aktivität & Absprung`
  const slotLabel = hypothesis
    ? `Kapitel ${chapter.kapitel} · Hypothese ${step + 1}`
    : `Kapitel ${chapter.kapitel} · Aktivität`

  const meta = handoffMeta(activity.handoff)

  return (
    <div className={styles.root}>
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

      <div className={styles.stage}>
        <div className={styles.imageWrap} key={`img-${step}`}>
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
          </div>
        </div>
      </div>

      <aside className={styles.panel}>
        <div className={styles.panelShade} aria-hidden />
        <div className={styles.panelInner}>
          <div className={styles.panelBody} key={`body-${step}`}>
            <span className={styles.kicker}>{kicker}</span>
            {hypothesis ? (
              <span className={styles.compareTag}>Status Quo &nbsp;↔&nbsp; 2035</span>
            ) : (
              <span className={styles.compareTag} data-accent>
                {meta.icon}
                {meta.label}
              </span>
            )}
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.copy}>{renderRichText(text)}</p>

            {isActivity && (
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
                  onClick={() => setStep(i)}
                  aria-label={
                    i === STEP_COUNT - 1 ? 'Aktivität' : `Hypothese ${i + 1}`
                  }
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
      </aside>
    </div>
  )
}
