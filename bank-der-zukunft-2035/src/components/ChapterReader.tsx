import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileSpreadsheet,
  LayoutGrid,
  Lightbulb,
  Loader2,
  MessageSquare,
  Pencil,
  Phone,
  Play,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'
import styles from './ChapterReader.module.css'
import { ImageSlot } from './ImageSlot'
import { LeitfrageChat } from './LeitfrageChat'
import { useLang, type Lang } from '../i18n/LanguageContext'
import type { Chapter, Handoff, ScreenOverlay } from '../data/chapters'
import {
  commentKey,
  readEditMode,
  textKey,
  useChapterEdits,
  writeEditMode,
  type EditField,
} from '../data/chapterEdits'
import { exportChaptersXlsx } from '../data/exportChaptersXlsx'

type ReaderStrings = {
  back: string
  chapterPrefix: string
  hypothesisOf: (n: number, total: number) => string
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
  edit: string
  editDone: string
  editBanner: string
  editTag: string
  resetStep: string
  commentLabel: string
  commentPlaceholder: string
  leitfragePlaceholder: string
  boldHint: string
  editTitleAria: string
  excel: string
  exporting: string
}

const STR: Record<Lang, ReaderStrings> = {
  de: {
    back: 'Übersicht',
    chapterPrefix: 'Kapitel',
    hypothesisOf: (n, total) => `Hypothese ${n} von ${total}`,
    activityKicker: 'Aktivität & Absprung',
    hypothesisSlot: (n) => `Hypothese ${n}`,
    activitySlot: 'Aktivität',
    statusQuo: 'Status Quo',
    future: '2030',
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
    edit: 'Bearbeiten',
    editDone: 'Fertig',
    editBanner: 'Änderungen werden nur lokal in diesem Browser gespeichert (localStorage) — die Demo-Daten bleiben unverändert.',
    editTag: 'Bearbeiten',
    resetStep: 'Diesen Schritt zurücksetzen',
    commentLabel: 'Kommentar zum Bild',
    commentPlaceholder: 'Kommentar zum Bild (nur lokal sichtbar)…',
    leitfragePlaceholder: 'Leitfrage (optional)…',
    boldHint: '**Text** für fett',
    editTitleAria: 'Titel bearbeiten',
    excel: 'Excel',
    exporting: 'Erzeuge…',
  },
  en: {
    back: 'Overview',
    chapterPrefix: 'Chapter',
    hypothesisOf: (n, total) => `Hypothesis ${n} of ${total}`,
    activityKicker: 'Activity & hand-off',
    hypothesisSlot: (n) => `Hypothesis ${n}`,
    activitySlot: 'Activity',
    statusQuo: 'Status quo',
    future: '2030',
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
    edit: 'Edit',
    editDone: 'Done',
    editBanner: 'Changes are stored only locally in this browser (localStorage) — the demo data stays unchanged.',
    editTag: 'Editing',
    resetStep: 'Reset this step',
    commentLabel: 'Comment on the image',
    commentPlaceholder: 'Comment on the image (visible locally only)…',
    leitfragePlaceholder: 'Guiding question (optional)…',
    boldHint: '**text** for bold',
    editTitleAria: 'Edit title',
    excel: 'Excel',
    exporting: 'Exporting…',
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// ChapterReader — die Kapitel-Sequenz nach dem Kameraflug:
//   Hypothese 1 → 2 → 3 → Aktivität/Demo.
// Layout: Vergleichsbild oben (Status Quo | 2030), darunter die beiden
// Hypothesen-Texte je unter ihrer Bildhälfte (links Status Quo, rechts 2030).
// Akzent #046A38, Absprung-Button auf dem Aktivitäts-Schritt.
// `step` wird von außen (BankExplorer) gesteuert, damit ein Refresh die Stelle
// wiederherstellen kann.
// ─────────────────────────────────────────────────────────────────────────────

// Schritte je Kapitel = Anzahl Hypothesen + 1 Aktivität. Die Hypothesenzahl kann
// je Kapitel variieren (Zusatz-Hypothesen), daher wird sie im Reader aus dem
// Kapitel abgeleitet (stepCount) statt als globale Konstante gehalten.

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
  const { edits, setText, setComment, resetStep } = useChapterEdits()
  const [editMode, setEditMode] = useState(readEditMode)

  // Schrittzahl aus dem Kapitel: N Hypothesen + 1 Aktivität.
  const stepCount = chapter.hypotheses.length + 1

  // Overlay-Chatbot zur Leitfrage (statt statischer Sprechblase). Beim Wechsel
  // von Schritt oder Kapitel schließen, damit die Leitfrage zum Kontext passt.
  const [chatOpen, setChatOpen] = useState(false)
  useEffect(() => {
    setChatOpen(false)
  }, [step, chapter.id])

  const toggleEdit = useCallback(() => {
    setEditMode((on) => {
      writeEditMode(!on)
      return !on
    })
  }, [])

  const [exporting, setExporting] = useState(false)
  const onExport = useCallback(async () => {
    setExporting(true)
    try {
      await exportChaptersXlsx(lang, edits)
    } catch (err) {
      console.error('Excel-Export fehlgeschlagen', err)
    } finally {
      setExporting(false)
    }
  }, [lang, edits])

  const goPrev = useCallback(
    () => onStepChange(Math.max(0, step - 1)),
    [step, onStepChange],
  )
  const goNext = useCallback(
    () => onStepChange(Math.min(stepCount - 1, step + 1)),
    [step, onStepChange, stepCount],
  )

  // Tastatur: Esc → zurück, Pfeile blättern. Beim Tippen in Eingabefeldern
  // (Bearbeitungsmodus) NICHT abfangen, damit Cursor/Text normal funktionieren.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'Escape') onBack()
      else if (e.key === 'ArrowRight') goNext()
      else if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onBack, goNext, goPrev])

  const isActivity = step === stepCount - 1
  const hypothesis = isActivity ? null : chapter.hypotheses[step]
  const activity = chapter.activity

  const image = hypothesis ? hypothesis.image : activity.image
  const title = hypothesis ? hypothesis.title : activity.title
  const chapterLabel = `${t.chapterPrefix} ${chapter.kapitel}`
  const kicker = hypothesis
    ? `${chapterLabel} · ${t.hypothesisOf(step + 1, chapter.hypotheses.length)}`
    : `${chapterLabel} · ${t.activityKicker}`
  const slotLabel = hypothesis
    ? `${chapterLabel} · ${t.hypothesisSlot(step + 1)}`
    : `${chapterLabel} · ${t.activitySlot}`

  const metaLabel = t.meta[activity.handoff.kind]
  const metaIcon = handoffIcon(activity.handoff.kind)

  // Bearbeitungs-Layer: Override (localStorage) über die Basisdaten legen.
  const tk = (field: EditField) => textKey(chapter.id, step, lang, field)
  const eff = (field: EditField, base: string) => edits.texts[tk(field)] ?? base
  const onEdit = (field: EditField) => (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setText(tk(field), e.target.value)

  const titleField: EditField = hypothesis ? 'title' : 'activityTitle'
  const effTitle = eff(titleField, title)
  const effStatusQuo = hypothesis ? eff('statusQuo', hypothesis.statusQuo) : ''
  const effIn2030 = hypothesis ? eff('in2030', hypothesis.in2030) : ''
  const effLeitfrage = hypothesis ? eff('leitfrage', hypothesis.leitfrage ?? '') : ''
  const effActivityText = hypothesis ? '' : eff('activityText', activity.text)

  const cKey = commentKey(chapter.id, step)
  const comment = edits.comments[cKey] ?? ''

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

        <button
          type="button"
          className={styles.editToggle}
          onClick={onExport}
          disabled={exporting}
        >
          {exporting ? (
            <Loader2 size={14} strokeWidth={2} className={styles.spin} aria-hidden />
          ) : (
            <FileSpreadsheet size={14} strokeWidth={2} aria-hidden />
          )}
          {exporting ? t.exporting : t.excel}
        </button>

        <button
          type="button"
          className={styles.editToggle}
          data-on={editMode || undefined}
          onClick={toggleEdit}
          aria-pressed={editMode}
        >
          <Pencil size={14} strokeWidth={2} aria-hidden />
          {editMode ? t.editDone : t.edit}
        </button>
      </header>

      <div className={styles.content} key={`content-${step}`}>
        {editMode && (
          <div className={styles.editBanner}>
            <span className={styles.editBannerText}>
              <Pencil size={13} strokeWidth={2} aria-hidden /> {t.editTag}
            </span>
            <span>{t.editBanner}</span>
            <span className={styles.editSpacer} />
            <button
              type="button"
              className={styles.resetBtn}
              onClick={() => resetStep(chapter.id, step, lang)}
            >
              <RotateCcw size={13} strokeWidth={2} aria-hidden /> {t.resetStep}
            </button>
          </div>
        )}

        {editMode ? (
          <textarea
            className={styles.titleInput}
            value={effTitle}
            onChange={onEdit(titleField)}
            rows={1}
            aria-label={t.editTitleAria}
          />
        ) : (
          <h1 className={styles.title}>{effTitle}</h1>
        )}

        {/* Management Summary & exemplarischer Business Case — je Kapitel,
            aufklappbar direkt im Kapitel. Quelle: chapter.vision + chapter.businessCase. */}
        <details className={styles.summaryPanel}>
          <summary className={styles.summaryToggle}>
            <BookOpen size={15} strokeWidth={2} aria-hidden />
            {lang === 'de' ? 'Management Summary & Business Case' : 'Management summary & business case'}
          </summary>
          <div className={styles.summaryBody}>
            <div className={styles.summaryBlock}>
              <span className={styles.summaryBlockLabel}>
                <Sparkles size={13} strokeWidth={2.2} aria-hidden />
                {lang === 'de' ? 'Management Summary' : 'Management summary'}
              </span>
              <p className={styles.summaryText}>{renderRichText(chapter.vision)}</p>
            </div>
            <div className={styles.summaryBlock}>
              <span className={styles.summaryBlockLabel}>
                <TrendingUp size={13} strokeWidth={2.2} aria-hidden />
                {lang === 'de' ? 'Business Case (exemplarisch)' : 'Business case (illustrative)'}
              </span>
              <p className={styles.summaryText}>{renderRichText(chapter.businessCase)}</p>
            </div>
          </div>
        </details>

        <div className={styles.media}>
          <div className={styles.imageInner}>
            <ImageSlot
              src={image.src}
              alt={image.alt}
              fit="cover"
              label={slotLabel}
              caption={effTitle}
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
            {!editMode && comment && (
              <div className={styles.commentNote}>
                <MessageSquare
                  size={15}
                  strokeWidth={2}
                  className={styles.commentNoteIcon}
                  aria-hidden
                />
                <span>{comment}</span>
              </div>
            )}
          </div>
          {/* Leitfrage als Sprechblase rechts neben dem 2030-Bild (breite Screens).
              Auf schmalen Screens unsichtbar — dort greift die Leiste unten. */}
          {!editMode && effLeitfrage && (
            <aside className={styles.calloutFloat}>
              {/* PowerPoint-Form „Sprechblase: abgerundetes Rechteck"
                  (wedgeRoundRectCallout): abgerundetes Rechteck + gerader,
                  dreieckiger Zeiger nach links auf das 2030-Bild — als ein
                  einziger SVG-Pfad, damit die Kontur durchgehend bleibt. */}
              <svg
                className={styles.calloutBubble}
                viewBox="0 0 250 162"
                preserveAspectRatio="none"
                aria-hidden
                focusable="false"
              >
                <path d="M38,6 H226 Q246,6 246,26 V136 Q246,156 226,156 H38 Q18,156 18,136 V112 L2,96 L18,80 V26 Q18,6 38,6 Z" />
              </svg>
              <div className={styles.calloutInner}>
                <span className={styles.calloutHead}>
                  <Lightbulb size={14} strokeWidth={2} aria-hidden />
                  {t.leitfrage}
                </span>
                <p className={styles.calloutText}>{effLeitfrage}</p>
                <button
                  type="button"
                  className={styles.leitfrageChatBtn}
                  onClick={() => setChatOpen(true)}
                >
                  <MessageSquare size={13} strokeWidth={2} aria-hidden />
                  {lang === 'de' ? 'Mit KI-Assistent diskutieren' : 'Discuss with AI assistant'}
                </button>
              </div>
            </aside>
          )}
        </div>

        {editMode && (
          <div className={styles.commentEditor}>
            <span className={styles.editLabel}>
              <MessageSquare size={13} strokeWidth={2} aria-hidden /> {t.commentLabel}
            </span>
            <textarea
              className={styles.editInput}
              value={comment}
              onChange={(e) => setComment(cKey, e.target.value)}
              placeholder={t.commentPlaceholder}
              rows={2}
            />
          </div>
        )}

        {hypothesis ? (
          <>
            <div className={styles.compareGrid}>
              <article className={styles.compareCard} data-quo>
                <span className={styles.compareHead}>
                  <Clock size={14} strokeWidth={2.2} aria-hidden />
                  {t.today}
                </span>
                {editMode ? (
                  <>
                    <textarea
                      className={styles.editInput}
                      value={effStatusQuo}
                      onChange={onEdit('statusQuo')}
                      rows={3}
                    />
                    <div className={styles.boldHint}>{t.boldHint}</div>
                  </>
                ) : (
                  <p className={styles.compareText}>{renderRichText(effStatusQuo)}</p>
                )}
              </article>
              <article className={styles.compareCard} data-future>
                <span className={styles.compareHead}>
                  <Sparkles size={14} strokeWidth={2.2} aria-hidden />
                  {t.future}
                </span>
                {editMode ? (
                  <>
                    <textarea
                      className={styles.editInput}
                      value={effIn2030}
                      onChange={onEdit('in2030')}
                      rows={3}
                    />
                    <div className={styles.boldHint}>{t.boldHint}</div>
                  </>
                ) : (
                  <p className={styles.compareText}>{renderRichText(effIn2030)}</p>
                )}
              </article>
            </div>
            {editMode ? (
              <div className={styles.editLeitfrage}>
                <span className={styles.editLabel}>
                  <Lightbulb size={13} strokeWidth={2} aria-hidden /> {t.leitfrage}
                </span>
                <textarea
                  className={styles.editInput}
                  value={effLeitfrage}
                  onChange={onEdit('leitfrage')}
                  placeholder={t.leitfragePlaceholder}
                  rows={2}
                />
              </div>
            ) : (
              effLeitfrage && (
                <div className={styles.leitfrageWrap}>
                  <p className={styles.leitfrage}>
                    <Lightbulb size={16} strokeWidth={2} aria-hidden />
                    <span>{effLeitfrage}</span>
                  </p>
                  <button
                    type="button"
                    className={styles.leitfrageChatBtn}
                    onClick={() => setChatOpen(true)}
                  >
                    <MessageSquare size={13} strokeWidth={2} aria-hidden />
                    {lang === 'de' ? 'Diskutieren' : 'Discuss'}
                  </button>
                </div>
              )
            )}
          </>
        ) : (
          <div className={styles.activityBox}>
            <span className={styles.compareTag} data-accent>
              {metaIcon}
              {metaLabel}
            </span>
            {editMode ? (
              <>
                <textarea
                  className={styles.editInput}
                  value={effActivityText}
                  onChange={onEdit('activityText')}
                  rows={3}
                />
                <div className={styles.boldHint}>{t.boldHint}</div>
              </>
            ) : (
              <p className={styles.copy}>{renderRichText(effActivityText)}</p>
            )}
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
          {Array.from({ length: stepCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === step}
              className={styles.dot}
              data-active={i === step || undefined}
              data-activity={i === stepCount - 1 || undefined}
              onClick={() => onStepChange(i)}
              aria-label={i === stepCount - 1 ? t.activity : t.hypothesisAria(i + 1)}
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

      {chatOpen && hypothesis && effLeitfrage && (
        <LeitfrageChat
          chapter={chapter}
          leitfrage={effLeitfrage}
          hypoTitle={effTitle}
          in2030={effIn2030}
          onClose={() => setChatOpen(false)}
        />
      )}
    </div>
  )
}
