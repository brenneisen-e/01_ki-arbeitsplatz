import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
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
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react'
import styles from './ChapterReader.module.css'
import { ImageSlot } from './ImageSlot'
import { LeitfrageChat } from './LeitfrageChat'
import { ConsultantAvatar } from '../consultant/ConsultantAvatar'
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
import { KPIS_BY_CHAPTER, type Kpi } from '../data/kpis'

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
  summaryKicker: string
  summaryTitle: string
  summaryAria: string
  mgmtSummaryLabel: string
  businessCaseLabel: string
  kpiHeading: string
  kpiHint: string
  kpiTodayLabel: string
  kpiScenarioLabel: string
  kpiFootnote: string
  consultantOpen: string
  consultantClose: string
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
    summaryKicker: 'Management Summary',
    summaryTitle: 'Management Summary & Business Case',
    summaryAria: 'Management Summary',
    mgmtSummaryLabel: 'Management Summary',
    businessCaseLabel: 'Business Case (exemplarisch)',
    kpiHeading: 'Zielwerte 2030 bei Erfüllung der Hypothesen',
    kpiHint: 'bei Erfüllung der Hypothesen',
    kpiTodayLabel: 'heute',
    kpiScenarioLabel: 'Szenario Basis',
    kpiFootnote:
      'Zielwerte aus dem KPI-Modell (Szenario Basis; Spanne konservativ–ambitioniert im Modell). Illustrative Eckwerte, quellenbasiert.',
    consultantOpen: 'Leitfrage anzeigen',
    consultantClose: 'Leitfrage ausblenden',
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
    summaryKicker: 'Management summary',
    summaryTitle: 'Management summary & business case',
    summaryAria: 'Management summary',
    mgmtSummaryLabel: 'Management summary',
    businessCaseLabel: 'Business case (illustrative)',
    kpiHeading: '2030 targets once the hypotheses are met',
    kpiHint: 'once the hypotheses are met',
    kpiTodayLabel: 'today',
    kpiScenarioLabel: 'Base scenario',
    kpiFootnote:
      'Targets from the KPI model (base scenario; conservative–ambitious range in the model). Illustrative, source-based figures.',
    consultantOpen: 'Show guiding question',
    consultantClose: 'Hide guiding question',
  },
}

// KPI-Zielwerte je Kapitel kommen aus dem Modell (src/data/kpis.ts, generiert aus
// Banking_Horizon_2030_KPI-Modell.xlsx). Angezeigt wird das Szenario „Basis";
// die Zahl rollt beim Aufruf der Summary-Kachel von 0 auf den Zielwert hoch.

/** Nachkommastellen je Einheit/Zielwert (stabil über alle Animations-Frames). */
function kpiDecimals(unit: string, target: number): number {
  if (
    unit === '€ p.a.' ||
    unit === 'Anzahl' ||
    unit === 'Index (100)' ||
    unit === 'Punkte' ||
    unit === 'Min' ||
    unit === 'Std. p.a.'
  ) {
    return 0
  }
  if (unit === 'Produkte/Kunde') return 1
  return Number.isInteger(target) ? 0 : 1
}

/** Deutsche Formatierung inkl. knapper Einheit (z. B. „625.000 €", „58 %", „6,6 Mon."). */
function formatKpi(value: number, unit: string, decimals: number): string {
  const de = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  switch (unit) {
    case '€ p.a.':
      return `${de(Math.round(value))} €`
    case '%':
      return `${de(value)} %`
    case 'Min':
      return `${de(Math.round(value))} Min`
    case 'Tage':
      return `${de(value)} Tage`
    case 'Monate':
      return `${de(value)} Mon.`
    case 'Std. p.a.':
      return `${de(Math.round(value))} Std.`
    default:
      // Punkte, Index (100), Anzahl, Produkte/Kunde: reine Zahl
      return de(value)
  }
}

/** Zählt beim Mounten von 0 auf `to` hoch (Ease-out); respektiert reduzierte Bewegung. */
function CountUp({ to, unit, decimals }: { to: number; unit: string; decimals: number }) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setValue(to)
      return
    }
    let raf = 0
    let start: number | null = null
    const duration = 1100
    const tick = (ts: number) => {
      if (start === null) start = ts
      const p = Math.min(1, (ts - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(to * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
      else setValue(to)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to])
  return <>{formatKpi(value, unit, decimals)}</>
}

// Management Summary je Kapitel als McKinsey-Style-Bulletpoints für den Vorstand
// (so-what-first, prägnant). Werden mit SVG-Icon-Marker gerendert. **fett** hebt
// die Kernaussage hervor.
const SUMMARY_BULLETS: Record<string, { de: string; en: string }[]> = {
  kunde: [
    { de: '**Banking wird unsichtbar**: KI-Assistenten begleiten Kund:innen kontinuierlich im Alltag; die aktive, kanalzentrierte Interaktion tritt in den Hintergrund.', en: '**Banking becomes invisible**: AI assistants accompany customers continuously in daily life; active, channel-centric interaction recedes into the background.' },
    { de: '**Von der Auswahl zur Entscheidung**: KI überführt eine Vielzahl an Optionen in klare, simulierte und begründete Empfehlungen.', en: '**From selection to decision**: AI turns a multitude of options into clear, simulated and reasoned recommendations.' },
    { de: '**Von reaktiv zu proaktiv**: teilautonome Finanzsteuerung mit Vertrauensmandat — die Kund:in entscheidet auf KI-vorbereiteter Grundlage.', en: '**From reactive to proactive**: semi-autonomous financial management with a trust mandate — the customer decides on an AI-prepared basis.' },
  ],
  vertrieb: [
    { de: '**Vom Produktvertrieb zur Lösungsorchestrierung**: Berater:innen entwickeln mit KI maßgeschneiderte Lösungen.', en: '**From product sales to solution orchestration**: advisers develop tailored solutions with AI.' },
    { de: '**Beratung wird KI-augmentiert**: der Mensch fokussiert komplexe und emotionale Entscheidungen.', en: '**Advisory becomes AI-augmented**: people focus on complex and emotional decisions.' },
    { de: '**Die Kundenschnittstelle wird dauerhaft und hyperpersonalisiert** — kanalübergreifend und in Echtzeit.', en: '**The customer interface becomes permanent and hyper-personalised** — cross-channel and in real time.' },
  ],
  marktfolge: [
    { de: '**Marktfolge wird zur autonomen Dunkelverarbeitung**; menschliches Eingreifen beschränkt sich auf begründete Ausnahmefälle.', en: '**Operations become autonomous straight-through processing**; human intervention is limited to justified exceptions.' },
    { de: '**Die interne Wertschöpfung öffnet sich**: modulare Utility-Plattformen, die Bank agiert als Orchestrator.', en: '**The internal value chain opens up**: modular utility platforms, with the bank acting as orchestrator.' },
    { de: '**Von der Kostenstelle zur skalierbaren Serviceplattform** (Banking-as-a-Service); Compliance ist „by design" im Prozess-Lifecycle verankert.', en: '**From cost centre to a scalable service platform** (banking-as-a-service); compliance is embedded “by design” in the process lifecycle.' },
  ],
  corporate: [
    { de: '**Von punktuellem Training zu kontinuierlichem, KI-personalisiertem Kompetenzaufbau** (inklusive immersiver Lernformate).', en: '**From point-in-time training to continuous, AI-personalised capability building** (including immersive formats).' },
    { de: '**Die Organisation wird über Kompetenzen gesteuert statt über Strukturen** — flexible, fließende Teams.', en: '**The organisation is steered by capabilities rather than structures** — flexible, fluid teams.' },
    { de: '**Personalsteuerung wird vorausschauend und datenbasiert**; der demografische Wandel erfordert lebenslanges Reskilling.', en: '**Workforce management becomes predictive and data-driven**; demographic change requires lifelong reskilling.' },
  ],
  it: [
    { de: '**Selbstoptimierende AI-Delivery löst die klassische Softwareentwicklung ab**; Teams steuern und überwachen, statt zu programmieren.', en: '**Self-optimising AI delivery replaces classic software development**; teams steer and oversee rather than program.' },
    { de: '**Die IT wird zur datengetriebenen, sich kontinuierlich verbessernden Plattform.**', en: '**IT becomes a data-driven, continuously self-improving platform.**' },
    { de: '**Von der Gatekeeper- zur Enabler-Rolle**: integrierte, vertikale Delivery-Teams; KI entscheidet innerhalb definierter Leitplanken.', en: '**From gatekeeper to enabler**: integrated, vertical delivery teams; AI decides within defined guardrails.' },
  ],
  compliance: [
    { de: '**Von der nachgelagerten Prüfung zur Echtzeit-Compliance** direkt in den Systemen.', en: '**From ex-post review to real-time compliance** embedded directly in the systems.' },
    { de: '**Integrierte, kontinuierliche Kontrolle** in einem KI-überwachten Governance-Cockpit.', en: '**Integrated, continuous control** in an AI-monitored governance cockpit.' },
    { de: '**Cyber- und Operational-Risk-Resilienz wird geschäftskritisch** und ist fest im Betriebsmodell verankert.', en: '**Cyber and operational-risk resilience becomes business-critical** and is firmly anchored in the operating model.' },
    { de: '**Compliance und Innenrevision werden zu Enablern** der KI-Transformation (Explainability).', en: '**Compliance and internal audit become enablers** of the AI transformation (explainability).' },
  ],
  transformation: [
    { de: '**KI als strategischer Fixstern**: die Plattform wird zum Geschäfts- und Betriebsmodell; Fokus auf Kultur und Befähigung.', en: '**AI as a strategic guiding star**: the platform becomes the business and operating model; focus on culture and enablement.' },
    { de: '**Ein KI-natives Target Operating Model** mit durchgängigen Journey-Teams und Human-in-the-loop.', en: '**An AI-native target operating model** with end-to-end journey teams and human-in-the-loop.' },
    { de: '**Decision-first statt einer Vielzahl isolierter Use Cases**: klare Roadmap und skalierbare Decision Spine vor dem Rollout.', en: '**Decision-first rather than a multitude of isolated use cases**: a clear roadmap and scalable decision spine before rollout.' },
    { de: '**Wandel ist im Target Operating Model verankert**; eine strukturierte Projektmethodik führt vom Reifegrad zum Zielbild.', en: '**Change is anchored in the target operating model**; a structured project methodology leads from maturity to the target picture.' },
  ],
  projekt: [
    { de: '**Vom Produktkatalog zum „Segment of One"**: KI komponiert hyperpersonalisierte Lösungen im Moment des Bedarfs.', en: '**From product catalogue to a “segment of one”**: AI composes hyper-personalised solutions at the moment of need.' },
    { de: '**Produkte werden zu lebenden, adaptiven Services** — Selbstanpassung innerhalb definierter Leitplanken.', en: '**Products become living, adaptive services** — self-adjusting within defined guardrails.' },
    { de: '**Produktentwicklung wird kontinuierlich**; die Time-to-Market sinkt von Jahren auf Tage.', en: '**Product development becomes continuous**; time-to-market drops from years to days.' },
  ],
  vorstand: [
    { de: '**Von der periodischen Berichterstattung zur Echtzeit-Steuerung** über ein Governance-Cockpit.', en: '**From periodic reporting to real-time steering** via a governance cockpit.' },
    { de: '**AI-Governance wird zur Vorstandsverantwortung**: Leitplanken, Risikoappetit, Ethik und Explainability.', en: '**AI governance becomes a board responsibility**: guardrails, risk appetite, ethics and explainability.' },
    { de: '**Von der Jahresstrategie zur kontinuierlichen, adaptiven Steuerung** mit dynamischer Kapital- und Ressourcenallokation.', en: '**From annual strategy to continuous, adaptive steering** with dynamic allocation of capital and resources.' },
  ],
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

  // Schrittzahl: N Hypothesen + 1 Aktivität/Live-Demo + 1 Management Summary.
  const stepCount = chapter.hypotheses.length + 2
  const activityIndex = chapter.hypotheses.length

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

  const isSummary = step === stepCount - 1
  const isActivity = step === activityIndex
  const hypothesis = isActivity || isSummary ? null : chapter.hypotheses[step]
  const activity = chapter.activity

  const image = hypothesis ? hypothesis.image : activity.image
  const title = hypothesis ? hypothesis.title : activity.title
  const chapterLabel = `${t.chapterPrefix} ${chapter.kapitel}`
  const kicker = isSummary
    ? `${chapterLabel} · ${t.summaryKicker}`
    : hypothesis
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

        {isSummary ? (
          <h1 className={styles.title}>{t.summaryTitle}</h1>
        ) : editMode ? (
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

        {isSummary ? (
          /* Letzte Kachel: Management Summary + Business Case + KPI-Framework
             (gleiches Framework für alle Kapitel; KPI-Werte sind Platzhalter). */
          <div className={styles.summaryStep}>
            <div className={styles.summaryBlock}>
              <span className={styles.summaryBlockLabel}>
                <Sparkles size={13} strokeWidth={2.2} aria-hidden />
                {t.mgmtSummaryLabel}
              </span>
              <ul className={styles.summaryBullets}>
                {(SUMMARY_BULLETS[chapter.id] ?? [{ de: chapter.vision, en: chapter.vision }]).map(
                  (b, i) => (
                    <li className={styles.summaryBullet} key={i}>
                      <ArrowRight
                        className={styles.summaryBulletIcon}
                        size={19}
                        strokeWidth={2.4}
                        aria-hidden
                      />
                      <span className={styles.summaryBulletText}>{renderRichText(b[lang])}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>

            <div className={styles.kpiSection}>
              <span className={styles.kpiHeading}>
                <BookOpen size={14} strokeWidth={2.2} aria-hidden />
                {t.kpiHeading}
                <span className={styles.kpiScenarioTag}>{t.kpiScenarioLabel}</span>
              </span>
              <div className={styles.kpiRow}>
                {(KPIS_BY_CHAPTER[chapter.id] ?? []).filter((k) => k.featured).map((kpi: Kpi) => {
                  const up = kpi.basis >= kpi.base
                  const dec = kpiDecimals(kpi.unit, kpi.basis)
                  return (
                    <div className={styles.kpiCard} key={kpi.label.en} data-trend={up ? 'up' : 'down'}>
                      <span className={styles.kpiLabel}>{kpi.label[lang]}</span>
                      <span className={styles.kpiValue}>
                        {up ? (
                          <TrendingUp size={20} strokeWidth={2.4} aria-hidden />
                        ) : (
                          <TrendingDown size={20} strokeWidth={2.4} aria-hidden />
                        )}
                        <CountUp to={kpi.basis} unit={kpi.unit} decimals={dec} />
                      </span>
                      <span className={styles.kpiHint}>
                        {t.kpiTodayLabel}: {formatKpi(kpi.base, kpi.unit, kpiDecimals(kpi.unit, kpi.base))}
                      </span>
                    </div>
                  )
                })}
              </div>
              <p className={styles.kpiFootnote}>{t.kpiFootnote}</p>
            </div>
          </div>
        ) : (
          <>
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
            {/* Im Lese-Modus präsentiert allein der Consultant unten rechts die
                Leitfrage — keine zweite statische Darstellung mehr. */}
            {editMode && (
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
          </>
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
              data-activity={i === activityIndex || undefined}
              data-summary={i === stepCount - 1 || undefined}
              onClick={() => onStepChange(i)}
              aria-label={
                i === stepCount - 1
                  ? t.summaryAria
                  : i === activityIndex
                    ? t.activity
                    : t.hypothesisAria(i + 1)
              }
            />
          ))}
        </div>

        <button
          type="button"
          className={styles.pagerBtn}
          onClick={goNext}
          disabled={isSummary}
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

      {/* "Karl-Klammer"-Consultant unten rechts: stellt die Leitfrage des
          aktuellen Schritts. Blendet sich bei Schritten ohne Leitfrage
          (Aktivität, Management Summary) automatisch aus. Im Bearbeitungsmodus
          ausgeblendet, damit er die Editier-Felder nicht überlagert. */}
      {!editMode && (
        <ConsultantAvatar
          leitfrage={hypothesis ? effLeitfrage : ''}
          label={t.leitfrage}
          context={kicker}
          openLabel={t.consultantOpen}
          closeLabel={t.consultantClose}
        />
      )}
    </div>
  )
}
