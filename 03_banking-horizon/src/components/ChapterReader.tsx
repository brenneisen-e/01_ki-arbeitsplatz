import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  BookOpen,
  Camera,
  Check,
  CloudUpload,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Clock,
  ImageUp,
  LayoutGrid,
  Lightbulb,
  Loader2,
  MessageSquare,
  ArrowRight,
  Pause,
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
import {
  getMasterImage,
  stepOffsetForChapter,
  type Chapter,
  type Handoff,
  type ScreenOverlay,
} from '../data/chapters'
import { getFakt } from '../data/fakten'
import { FaktSlide } from './FaktSlide'
import { HYPO_VIDEOS } from '../data/hypothesenVideos'
import { downloadStockwerk } from '../data/stockwerkDownload'
import { SUMMARY_BULLETS } from '../data/summaryBullets'
import { renderRichHtml } from '../data/richtext'
import {
  commentKey,
  imageKey,
  readEditMode,
  summaryBulletKey,
  textKey,
  uploadImage,
  useChapterEdits,
  writeEditMode,
  type EditField,
} from '../data/chapterEdits'
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
  shot: string
  shotAria: string
  shotSaving: string
  shotFailed: string
  excel: string
  exporting: string
  summaryKicker: string
  summaryTitle: string
  summaryAria: string
  mgmtSummaryLabel: string
  businessCaseLabel: string
  kpiHeading: string
  kpiHint: string
  kpiApprox: string
  kpiRangeJoin: string
  todayTag: string
  todaySub: string
  futureSub: string
  kpiFootnote: string
  consultantOpen: string
  consultantClose: string
  consultantNew: string
  saveShared: string
  saving: string
  saved: string
  serverOff: string
  replaceImage: string
  uploadFailed: string
  videoToggle: string
  videoPlay: string
  videoStop: string
  faktKicker: string
  faktAria: string
  screenLoading: string
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
      video: 'Demo-Video',
      extern: 'Demo-Video · SharePoint',
      operations: 'Live-Demo · Vollbild',
      'strategy-lab': 'Strategy Lab · Diskussion',
      cocreation: 'Co-Creation',
      'kredit-dilemma': 'Interaktives Szenario',
    },
    edit: 'Bearbeiten',
    editDone: 'Fertig',
    editBanner: 'Änderungen werden sofort lokal gespeichert. Mit „Für alle speichern" werden sie über den Server geteilt und für alle sichtbar.',
    editTag: 'Bearbeiten',
    resetStep: 'Diesen Schritt zurücksetzen',
    commentLabel: 'Kommentar zum Bild',
    commentPlaceholder: 'Kommentar zum Bild (nur lokal sichtbar)…',
    leitfragePlaceholder: 'Leitfrage (optional)…',
    boldHint: '**Text** für fett',
    editTitleAria: 'Titel bearbeiten',
    shot: 'Screenshot speichern',
    shotAria: 'Stockwerk dieses Kapitels als quadratisches Bild (1:1) speichern',
    shotSaving: 'Speichere…',
    shotFailed: 'Bild konnte nicht erzeugt werden',
    excel: 'Excel',
    exporting: 'Erzeuge…',
    summaryKicker: 'Management Summary',
    summaryTitle: 'Management Summary',
    summaryAria: 'Management Summary',
    mgmtSummaryLabel: 'Kernaussagen',
    businessCaseLabel: 'Business Case (exemplarisch)',
    kpiHeading: 'Potenzial',
    kpiHint: 'bei Erfüllung der Hypothesen',
    kpiApprox: 'ca.',
    kpiRangeJoin: 'bis',
    todayTag: 'Heute',
    todaySub: 'Status quo',
    futureSub: 'Zielbild',
    kpiFootnote:
      'Illustrative Zielkorridore bei Erfüllung der Hypothesen: gerundete Spannen als Diskussionsgrundlage, keine Ist-Werte und keine Prognose.',
    consultantOpen: 'Leitfrage anzeigen',
    consultantClose: 'Leitfrage ausblenden',
    consultantNew: 'Neue Leitfrage',
    saveShared: 'Für alle speichern',
    saving: 'Speichere…',
    saved: 'Gespeichert',
    serverOff: 'Server nicht verbunden, nur lokal',
    replaceImage: 'Bild ersetzen',
    uploadFailed: 'Upload nicht möglich (Server nicht verbunden)',
    videoToggle: 'Videos aktivieren',
    videoPlay: 'Bewegtbild abspielen',
    videoStop: 'Bewegtbild stoppen',
    faktKicker: 'Studie',
    faktAria: 'Studie',
    screenLoading: 'Live-Demo wird geladen…',
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
      video: 'Demo video',
      extern: 'Demo video · SharePoint',
      operations: 'Live demo · full screen',
      'strategy-lab': 'Strategy Lab · discussion',
      cocreation: 'Co-creation',
      'kredit-dilemma': 'Interactive scenario',
    },
    edit: 'Edit',
    editDone: 'Done',
    editBanner: 'Changes are saved locally right away. Use “Save for everyone” to share them via the server so all viewers see them.',
    editTag: 'Editing',
    resetStep: 'Reset this step',
    commentLabel: 'Comment on the image',
    commentPlaceholder: 'Comment on the image (visible locally only)…',
    leitfragePlaceholder: 'Guiding question (optional)…',
    boldHint: '**text** for bold',
    editTitleAria: 'Edit title',
    shot: 'Save screenshot',
    shotAria: 'Save this chapter’s floor as a square (1:1) image',
    shotSaving: 'Saving…',
    shotFailed: 'Could not create the image',
    excel: 'Excel',
    exporting: 'Exporting…',
    summaryKicker: 'Management summary',
    summaryTitle: 'Management summary',
    summaryAria: 'Management summary',
    mgmtSummaryLabel: 'Key takeaways',
    businessCaseLabel: 'Business case (illustrative)',
    kpiHeading: 'Potential',
    kpiHint: 'once the hypotheses are met',
    kpiApprox: '~',
    kpiRangeJoin: 'to',
    todayTag: 'Today',
    todaySub: 'Status quo',
    futureSub: 'Target picture',
    kpiFootnote:
      'Illustrative target ranges once the hypotheses are met: rounded spans as a basis for discussion, neither actuals nor a forecast.',
    consultantOpen: 'Show guiding question',
    consultantClose: 'Hide guiding question',
    consultantNew: 'New guiding question',
    saveShared: 'Save for everyone',
    saving: 'Saving…',
    saved: 'Saved',
    serverOff: 'Server not connected, local only',
    replaceImage: 'Replace image',
    uploadFailed: 'Upload not possible (server not connected)',
    videoToggle: 'Enable videos',
    videoPlay: 'Play motion clip',
    videoStop: 'Stop motion clip',
    faktKicker: 'Study',
    faktAria: 'Study',
    screenLoading: 'Loading the live demo…',
  },
  fr: {
    back: 'Vue d’ensemble',
    chapterPrefix: 'Chapitre',
    hypothesisOf: (n, total) => `Hypothèse ${n} sur ${total}`,
    activityKicker: 'Activité & accès à la démo',
    hypothesisSlot: (n) => `Hypothèse ${n}`,
    activitySlot: 'Activité',
    statusQuo: 'Statu quo',
    future: 'En 2030',
    leitfrage: 'Question clé',
    today: 'Aujourd’hui · statu quo',
    prevStep: 'Étape précédente',
    nextStep: 'Étape suivante',
    steps: 'Étapes du chapitre',
    activity: 'Activité',
    hypothesisAria: (n) => `Hypothèse ${n}`,
    meta: {
      iframe: 'Démo live',
      video: 'Vidéo de démo',
      extern: 'Vidéo de démo · SharePoint',
      operations: 'Démo live · plein écran',
      'strategy-lab': 'Strategy Lab · discussion',
      cocreation: 'Co-création',
      'kredit-dilemma': 'Scénario interactif',
    },
    edit: 'Modifier',
    editDone: 'Terminé',
    editBanner: 'Les modifications sont enregistrées localement sans délai. Avec « Enregistrer pour tous », elles sont partagées via le serveur et visibles par tous.',
    editTag: 'Édition',
    resetStep: 'Réinitialiser cette étape',
    commentLabel: 'Commentaire sur l’image',
    commentPlaceholder: 'Commentaire sur l’image (visible en local uniquement)…',
    leitfragePlaceholder: 'Question clé (facultatif)…',
    boldHint: '**texte** pour le gras',
    editTitleAria: 'Modifier le titre',
    shot: 'Enregistrer la capture',
    shotAria: 'Enregistrer l’étage de ce chapitre en image carrée (1:1)',
    shotSaving: 'Enregistrement…',
    shotFailed: 'Impossible de générer l’image',
    excel: 'Excel',
    exporting: 'Génération…',
    summaryKicker: 'Synthèse de direction',
    summaryTitle: 'Synthèse de direction',
    summaryAria: 'Synthèse de direction',
    mgmtSummaryLabel: 'Messages clés',
    businessCaseLabel: 'Business case (illustratif)',
    kpiHeading: 'Potentiel',
    kpiHint: 'si les hypothèses se réalisent',
    kpiApprox: 'env.',
    kpiRangeJoin: 'à',
    todayTag: 'Aujourd’hui',
    todaySub: 'Statu quo',
    futureSub: 'Modèle cible',
    kpiFootnote:
      'Fourchettes cibles illustratives si les hypothèses se réalisent : intervalles arrondis comme base de discussion, ni valeurs réelles ni prévision.',
    consultantOpen: 'Afficher la question clé',
    consultantClose: 'Masquer la question clé',
    consultantNew: 'Nouvelle question clé',
    saveShared: 'Enregistrer pour tous',
    saving: 'Enregistrement…',
    saved: 'Enregistré',
    serverOff: 'Serveur non connecté, en local uniquement',
    replaceImage: 'Remplacer l’image',
    uploadFailed: 'Envoi impossible (serveur non connecté)',
    videoToggle: 'Activer les vidéos',
    videoPlay: 'Lire la vidéo',
    videoStop: 'Arrêter la vidéo',
    faktKicker: 'Étude',
    faktAria: 'Étude',
    screenLoading: 'Chargement de la démo live…',
  },
}

// Das Board sieht je KPI einen Zielkorridor, keinen Punktwert: angezeigt wird
// die Spanne zwischen dem vorsichtigen und dem ambitionierten Eckwert
// (src/data/kpis.ts), bewusst grob gerundet. Keine Ist-Werte, kein Szenario-
// Etikett, keine hinterlegte Rechenlogik — die Spanne ist die Aussage.

/** Einheiten, die als relative Veränderung gegenüber heute gelesen werden. */
const RELATIVE_UNITS = new Set(['Index (100)', '€ p.a.', 'Anzahl'])

/** Zahlenformat je Sprache. */
const LOCALE: Record<Lang, string> = { de: 'de-DE', en: 'en-GB', fr: 'fr-FR' }

/** Suffixe der absoluten Einheiten je Sprache (ohne Eintrag bleibt der Wert nackt). */
const UNIT_SUFFIX: Record<Lang, Record<string, string>> = {
  de: {
    '%': ' %',
    Punkte: ' Pkt.',
    Tage: ' Tage',
    Monate: ' Mon.',
    Min: ' Min',
    'Std. p.a.': ' Std.',
  },
  en: {
    '%': ' %',
    Punkte: ' pts',
    Tage: ' days',
    Monate: ' mths',
    Min: ' min',
    'Std. p.a.': ' hrs',
  },
  fr: {
    '%': ' %',
    Punkte: ' pts',
    Tage: ' jours',
    Monate: ' mois',
    Min: ' min',
    'Std. p.a.': ' h',
  },
}

/**
 * Ein KPI wird als Zugewinn gegenüber heute gelesen, wenn sein Absolutwert
 * ohne Bezugspunkt nichts sagt: Zufriedenheitspunkte („+3 bis +20 Pkt.") und
 * Prozentgrößen, die bei null starten und damit ohnehin schon Zuwachs sind.
 */
function isDeltaKpi(kpi: Kpi): boolean {
  return kpi.unit === 'Punkte' || (kpi.unit === '%' && kpi.base === 0)
}

/** Rundet einen Korridor-Eckwert grob: ab 20 auf Fünferschritte, darunter auf
    ganze Zahlen — abstrakt genug fürs Board, ohne die Größenordnung zu kippen.
    Landet der Eckwert dabei auf dem heutigen Wert, wird fein gerundet: sonst
    beginnt der Korridor optisch beim Status quo, obwohl er es nicht tut. */
function roundEdge(n: number, base: number): number {
  const coarse = (v: number) => (Math.abs(v) >= 20 ? Math.round(v / 5) * 5 : Math.round(v))
  const r = n !== base && coarse(n) === coarse(base) ? Math.round(n) : coarse(n)
  return r === 0 ? 0 : r
}

/**
 * Anzeige-Spanne je KPI. Index- und Absolut-KPIs (Index 100, € p.a., Anzahl)
 * werden zur Veränderung in Prozent („−20 bis −60 %" Kostenabbau, „+10 bis
 * +45 %" Wachstum), Zugewinn-KPIs zur vorzeichenbehafteten Differenz („+3 bis
 * +20 Pkt."), alle übrigen bleiben absolute Eckwerte („50–60 %", „1–3 Tage").
 * Fallen beide Enden nach dem Runden zusammen, steht wieder ein einzelner
 * Circa-Wert da.
 */
function kpiRange(kpi: Kpi, lang: Lang, approx: string, join: string): string {
  const num = (n: number) =>
    (n === 0 ? 0 : n).toLocaleString(LOCALE[lang]).replace('-', '−')

  const suffixes = UNIT_SUFFIX[lang]
  const relative = RELATIVE_UNITS.has(kpi.unit)
  if (relative || isDeltaKpi(kpi)) {
    const step = relative
      ? (v: number) => ((v - kpi.base) / kpi.base) * 100
      : (v: number) => v - kpi.base
    const a = roundEdge(step(kpi.konservativ), 0)
    const b = roundEdge(step(kpi.ambitioniert), 0)
    // Von vorsichtig nach ambitioniert, also nach Betrag aufsteigend — so
    // bleibt das Vorzeichen über die ganze Spanne hinweg dasselbe.
    const [lo, hi] = Math.abs(a) <= Math.abs(b) ? [a, b] : [b, a]
    const sign = (n: number) => (n > 0 ? '+' : '')
    const unit = relative ? ' %' : (suffixes[kpi.unit] ?? '')
    if (lo === hi) return `${approx} ${sign(lo)}${num(lo)}${unit}`
    return `${sign(lo)}${num(lo)} ${join} ${sign(hi)}${num(hi)}${unit}`
  }

  const suffix = suffixes[kpi.unit] ?? ''
  // Ein positiver Zielwert darf nicht auf 0 zusammenfallen („0 Tage").
  const edge = (v: number) => {
    const r = roundEdge(v, kpi.base)
    return r === 0 && v > 0 ? 1 : r
  }
  const a = edge(kpi.konservativ)
  const b = edge(kpi.ambitioniert)
  const [lo, hi] = a <= b ? [a, b] : [b, a]
  if (lo === hi) return `${approx} ${num(lo)}${suffix}`
  return `${num(lo)}–${num(hi)}${suffix}`
}

/* (Die frühere CountUp-Animation ist bewusst entfernt — die Potenzial-Werte
   stehen ruhig und fest, nichts rollt oder springt.) */

// Management-Summary-Kernaussagen je Kapitel — jetzt zentral in data/summaryBullets.

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

// Rich-Text-Anzeige: gibt saniertes HTML für dangerouslySetInnerHTML zurück.
// Unterstützt WYSIWYG-Formatierung (Fett/Kursiv/Farbe/Größe) und Legacy `**fett**`.
function rich(value: string): { __html: string } {
  return { __html: renderRichHtml(value) }
}

function handoffIcon(kind: Handoff['kind']): React.ReactElement {
  switch (kind) {
    case 'iframe':
    case 'video':
      return <Play size={17} strokeWidth={2} aria-hidden />
    case 'extern':
      return <ExternalLink size={17} strokeWidth={2} aria-hidden />
    case 'operations':
      return <Clock size={17} strokeWidth={2} aria-hidden />
    case 'strategy-lab':
      return <LayoutGrid size={17} strokeWidth={2} aria-hidden />
    case 'cocreation':
      return <Users size={17} strokeWidth={2} aria-hidden />
    case 'kredit-dilemma':
      return <Phone size={17} strokeWidth={2} aria-hidden />
  }
}

// Das iframe rendert bei fester Logik-BREITE; seine Logik-Höhe folgt dem
// Seitenverhältnis der Bildschirmfläche im Foto, sodass die Demo die Fläche
// exakt füllt — kein Beschnitt, keine Ränder. Bewusst niedrige Logik-Breite
// (1280 statt 1920): die eingebettete Live-Demo wird dadurch deutlich weniger
// herunterskaliert und bleibt lesbar.
const IFRAME_LOGICAL_W = 1280

/**
 * Live-iframe auf der Bildschirmfläche des Aktivitäts-Fotos, als dauerhafte
 * Ebene des Readers: Das iframe wird beim Öffnen des Kapitels angelegt und
 * lädt die Demo, während noch Studie und Hypothesen gelesen werden. Auf dem
 * Aktivitäts-Schritt liegt es über dem Rahmen des Fotos (gemessen per
 * getBoundingClientRect; der Reader selbst füllt den Viewport), auf allen
 * anderen Schritten ist es unsichtbar am Fensterrand geparkt, ohne aus dem
 * DOM zu fallen, denn ein neu eingehängtes iframe lädt neu.
 *
 * Bis das Dokument geladen ist, bleibt das iframe durchsichtig und die Fläche
 * zeigt den dunklen Bildschirm mit Ladehinweis. Vorher stand dort ein weißes
 * Rechteck, weil der Browser das noch leere Dokument weiß zeichnet.
 *
 * Die Overlay-Anteile beziehen sich auf das BILD, nicht auf den Rahmen: das
 * Foto liegt per object-fit: cover (zentriert) im 16:9-Rahmen und wird, je
 * nach eigenem Seitenverhältnis, oben/unten oder links/rechts beschnitten.
 * Deshalb wird die Lage der Fläche aus Rahmenmaß und Bildseitenverhältnis
 * umgerechnet; vorher lagen die Anteile auf dem Rahmen, und das Cockpit saß
 * kleiner und versetzt auf dem Monitor, mit grauem Saum ringsum.
 */
function ScreenIframe({
  overlay,
  imageSrc,
  frame,
  active,
  loadingLabel,
}: {
  overlay: ScreenOverlay
  imageSrc: string
  /** Rahmen (.imageInner) des Aktivitäts-Fotos; null auf allen anderen Schritten. */
  frame: HTMLDivElement | null
  active: boolean
  loadingLabel: string
}): React.ReactElement {
  const wrapRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  // Seitenverhältnis des Fotos (Breite ÷ Höhe); bis es geladen ist, gilt der
  // 16:9-Rahmen selbst als Maß.
  const [bildRatio, setBildRatio] = useState<number | null>(null)
  const [geladen, setGeladen] = useState(false)
  useEffect(() => {
    let aktiv = true
    const img = new Image()
    img.onload = () => {
      if (aktiv && img.naturalWidth > 0 && img.naturalHeight > 0) {
        setBildRatio(img.naturalWidth / img.naturalHeight)
      }
    }
    img.src = imageSrc
    return () => {
      aktiv = false
    }
  }, [imageSrc])

  useLayoutEffect(() => {
    const wrap = wrapRef.current
    const iframe = iframeRef.current
    if (!wrap || !iframe) return
    const ratio = bildRatio ?? 16 / 9
    // Lage der Bildschirmfläche in einem Rahmen der Größe cw × ch: object-fit:
    // cover skaliert das Foto auf die engere Seite und zentriert den Überhang.
    const flaeche = (cw: number, ch: number) => {
      let w = cw
      let h = ch
      let x = 0
      let y = 0
      if (ratio > cw / ch) {
        h = ch
        w = ch * ratio
        x = (cw - w) / 2
      } else {
        w = cw
        h = cw / ratio
        y = (ch - h) / 2
      }
      // Hauchdünn über die vermessene Graufläche hinaus in den Monitorrahmen:
      // die Kanten im Foto sind weichgezeichnet, sonst bliebe ein grauer Saum.
      const rand = 0.0015 * w
      return {
        left: x + (overlay.leftPct / 100) * w - rand,
        top: y + (overlay.topPct / 100) * h - rand,
        width: (overlay.widthPct / 100) * w + 2 * rand,
        height: (overlay.heightPct / 100) * h + 2 * rand,
      }
    }
    // Logik-Höhe folgt dem Seitenverhältnis der Fläche (an einem nominellen
    // 16:9-Rahmen gerechnet, also auch ohne sichtbaren Rahmen): die Demo füllt
    // die Fläche exakt, ohne beschnitten zu werden oder Balken zu lassen.
    const nominal = flaeche(1600, 900)
    const logicalH = Math.max(1, Math.round((IFRAME_LOGICAL_W * nominal.height) / nominal.width))
    iframe.style.width = `${IFRAME_LOGICAL_W}px`
    iframe.style.height = `${logicalH}px`

    if (!active || !frame) {
      // Geparkt: unsichtbar außerhalb des Fensters, aber in voller Logikgröße,
      // damit die Demo schon jetzt in ihrem endgültigen Layout rendert.
      wrap.style.visibility = 'hidden'
      wrap.style.left = '-20000px'
      wrap.style.top = '0px'
      wrap.style.width = `${IFRAME_LOGICAL_W}px`
      wrap.style.height = `${logicalH}px`
      iframe.style.transform = 'translate(-50%, -50%) scale(1)'
      return
    }
    const update = () => {
      const r = frame.getBoundingClientRect()
      if (r.width <= 0 || r.height <= 0) return
      const f = flaeche(r.width, r.height)
      wrap.style.visibility = 'visible'
      wrap.style.left = `${r.left + f.left}px`
      wrap.style.top = `${r.top + f.top}px`
      wrap.style.width = `${f.width}px`
      wrap.style.height = `${f.height}px`
      iframe.style.transform = `translate(-50%, -50%) scale(${f.width / IFRAME_LOGICAL_W})`
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(frame)
    window.addEventListener('resize', update)
    // Scrollt der Inhalt (kleine Fenster), wandert der Rahmen: Scroll-Ereignisse
    // aller Container in der Capture-Phase abfangen.
    document.addEventListener('scroll', update, true)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
      document.removeEventListener('scroll', update, true)
    }
  }, [overlay, bildRatio, active, frame])

  const onLoad = useCallback(() => {
    // Einen Moment warten, bis die Demo ihr erstes Bild gezeichnet hat.
    window.setTimeout(() => setGeladen(true), 250)
  }, [])

  return (
    <div
      ref={wrapRef}
      className={styles.screen}
      data-active={active || undefined}
      data-geladen={geladen || undefined}
      aria-hidden={!active}
    >
      {!geladen && (
        <div className={styles.screenLade}>
          <Loader2 size={22} strokeWidth={2} className={styles.spin} aria-hidden />
          <span>{loadingLabel}</span>
        </div>
      )}
      <iframe
        ref={iframeRef}
        className={styles.screenIframe}
        src={overlay.url}
        title={overlay.title}
        onLoad={onLoad}
        tabIndex={active ? undefined : -1}
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
  const { edits, setText, setComment, resetStep, saveToServer, syncState } = useChapterEdits()
  const [editMode, setEditMode] = useState(readEditMode)
  // Werkzeuge in der Kopfleiste („Screenshot speichern", „Bearbeiten"): in
  // der Vorführung ausgeblendet. Umschalt+B blendet sie ein; solange der
  // Bearbeitungsmodus läuft, bleiben sie ohnehin sichtbar (sonst käme man
  // nicht mehr auf „Fertig").
  const [werkzeuge, setWerkzeuge] = useState(false)
  const zeigeWerkzeuge = werkzeuge || editMode
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadErr, setUploadErr] = useState(false)

  // Schrittzahl: optionaler Studien-Schritt (data/fakten.ts) + N Hypothesen
  // + 1 Aktivität/Live-Demo + 1 Management Summary.
  const fakt = getFakt(chapter.id)
  const offset = stepOffsetForChapter(chapter.id)
  const stepCount = chapter.hypotheses.length + 2 + offset
  const activityIndex = chapter.hypotheses.length + offset
  // Rahmen des Aktivitäts-Fotos, über den die dauerhafte iframe-Ebene gelegt
  // wird (nur auf dem Aktivitäts-Schritt gesetzt).
  const [frameEl, setFrameEl] = useState<HTMLDivElement | null>(null)

  // Overlay-Chatbot zur Leitfrage (statt statischer Sprechblase). Beim Wechsel
  // von Schritt oder Kapitel schließen, damit die Leitfrage zum Kontext passt.
  const [chatOpen, setChatOpen] = useState(false)
  useEffect(() => {
    setChatOpen(false)
  }, [step, chapter.id])

  // Bewegtbild-Erprobung: Der Schalter oben rechts erscheint nur auf
  // Hypothesen-Schritten mit hinterlegten Clips (data/hypothesenVideos.ts).
  // Ist er an, sind die beiden Bildhälften klickbar und spielen ihren
  // 10-s-Clip. Welche Hälfte läuft, wird je Schritt zurückgesetzt.
  const [videosOn, setVideosOn] = useState(false)
  const [playing, setPlaying] = useState({ quo: false, future: false })
  useEffect(() => {
    setPlaying({ quo: false, future: false })
  }, [step, chapter.id, videosOn])

  // Stockwerk-Screenshot: quadratische Kachel des Kapitels (siehe
  // data/stockwerkDownload) — ohne Bedienelemente, direkt folientauglich.
  const [shotSaving, setShotSaving] = useState(false)
  const [shotErr, setShotErr] = useState(false)
  const onSaveShot = useCallback(async () => {
    setShotErr(false)
    setShotSaving(true)
    try {
      await downloadStockwerk(getMasterImage(lang).src, chapter, lang)
    } catch (err) {
      console.error('Stockwerk-Download fehlgeschlagen', err)
      setShotErr(true)
    } finally {
      setShotSaving(false)
    }
  }, [chapter, lang])

  const toggleEdit = useCallback(() => {
    setEditMode((on) => {
      writeEditMode(!on)
      return !on
    })
  }, [])

  const goPrev = useCallback(
    () => onStepChange(Math.max(0, step - 1)),
    [step, onStepChange],
  )
  const goNext = useCallback(
    () => onStepChange(Math.min(stepCount - 1, step + 1)),
    [step, onStepChange, stepCount],
  )

  // Tastatur: Esc → zurück, Pfeile blättern, Umschalt+B → Werkzeuge. Beim
  // Tippen in Eingabefeldern (Bearbeitungsmodus) NICHT abfangen, damit
  // Cursor/Text normal funktionieren.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.key === 'Escape') onBack()
      else if (e.key === 'ArrowRight') goNext()
      else if (e.key === 'ArrowLeft') goPrev()
      else if (e.key === 'B' && e.shiftKey) setWerkzeuge((w) => !w)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onBack, goNext, goPrev])

  const isSummary = step === stepCount - 1
  const isActivity = step === activityIndex
  const isFakt = fakt !== null && step === 0
  const hypothesis = isActivity || isSummary || isFakt ? null : chapter.hypotheses[step - offset]
  const activity = chapter.activity
  // Bearbeitungs-Schlüssel zählen ab der ersten Hypothese (Hypothese n =
  // Schlüssel n-1, Aktivität = Hypothesenzahl), unabhängig vom Studien-Schritt,
  // damit gespeicherte Änderungen und der Änderungsbereich dieselben Schlüssel
  // nutzen.
  const editStep = step - offset
  // Clips sind am Basis-Bildpfad verdrahtet (nicht am Edit-Override).
  const hypoVideos = hypothesis ? HYPO_VIDEOS[hypothesis.image.src] : undefined

  const image = hypothesis ? hypothesis.image : activity.image
  const effImageSrc = edits.texts[imageKey(image.src)] ?? image.src
  const effActivityImage = edits.texts[imageKey(activity.image.src)] ?? activity.image.src
  const onImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    setUploadErr(false)
    setUploading(true)
    const url = await uploadImage(f)
    setUploading(false)
    if (url) setText(imageKey(image.src), url)
    else setUploadErr(true)
  }
  const title = hypothesis ? hypothesis.title : isFakt && fakt ? fakt.titel[lang] : activity.title
  const chapterLabel = `${t.chapterPrefix} ${chapter.kapitel}`
  const kicker = isSummary
    ? `${chapterLabel} · ${t.summaryKicker}`
    : isFakt
      ? `${chapterLabel} · ${t.faktKicker}`
      : hypothesis
      ? `${chapterLabel} · ${t.hypothesisOf(step - offset + 1, chapter.hypotheses.length)}`
      : `${chapterLabel} · ${t.activityKicker}`
  const slotLabel = hypothesis
    ? `${chapterLabel} · ${t.hypothesisSlot(step - offset + 1)}`
    : `${chapterLabel} · ${t.activitySlot}`

  const metaLabel = t.meta[activity.handoff.kind]
  const metaIcon = handoffIcon(activity.handoff.kind)

  // Bearbeitungs-Layer: Override (localStorage) über die Basisdaten legen.
  const tk = (field: EditField) => textKey(chapter.id, editStep, lang, field)
  const eff = (field: EditField, base: string) => edits.texts[tk(field)] ?? base
  const onEdit = (field: EditField) => (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setText(tk(field), e.target.value)

  const titleField: EditField = hypothesis ? 'title' : 'activityTitle'
  const effTitle = isFakt ? title : eff(titleField, title)
  const effStatusQuo = hypothesis ? eff('statusQuo', hypothesis.statusQuo) : ''
  const effIn2030 = hypothesis ? eff('in2030', hypothesis.in2030) : ''
  const effLeitfrage = hypothesis ? eff('leitfrage', hypothesis.leitfrage ?? '') : ''
  const effActivityText = hypothesis ? '' : eff('activityText', activity.text)

  const cKey = commentKey(chapter.id, editStep)
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

        {hypoVideos && (
          <button
            type="button"
            className={styles.videoToggle}
            data-on={videosOn || undefined}
            onClick={() => setVideosOn((v) => !v)}
            aria-pressed={videosOn}
          >
            <Clapperboard size={14} strokeWidth={2} aria-hidden />
            {t.videoToggle}
          </button>
        )}

        {zeigeWerkzeuge && (
          <>
            {shotErr && <span className={styles.saveHint}>{t.shotFailed}</span>}
            <button
              type="button"
              className={styles.shotBtn}
              onClick={onSaveShot}
              disabled={shotSaving}
              aria-label={t.shotAria}
              title={t.shotAria}
            >
              {shotSaving ? (
                <Loader2 size={14} strokeWidth={2} className={styles.spin} aria-hidden />
              ) : (
                <Camera size={14} strokeWidth={2} aria-hidden />
              )}
              {shotSaving ? t.shotSaving : t.shot}
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
          </>
        )}

        {editMode && (
          <>
            {syncState === 'unconfigured' && (
              <span className={styles.saveHint}>{t.serverOff}</span>
            )}
            <button
              type="button"
              className={styles.saveBtn}
              onClick={saveToServer}
              disabled={syncState === 'saving'}
              data-state={syncState}
            >
              {syncState === 'saving' ? (
                <Loader2 size={13} strokeWidth={2} className={styles.spin} aria-hidden />
              ) : syncState === 'saved' ? (
                <Check size={13} strokeWidth={2.6} aria-hidden />
              ) : (
                <CloudUpload size={13} strokeWidth={2} aria-hidden />
              )}
              {syncState === 'saving' ? t.saving : syncState === 'saved' ? t.saved : t.saveShared}
            </button>
            <button
              type="button"
              className={styles.resetBtn}
              onClick={() => resetStep(chapter.id, editStep, lang)}
            >
              <RotateCcw size={13} strokeWidth={2} aria-hidden /> {t.resetStep}
            </button>
          </>
        )}
      </header>

      <div className={styles.content} key={`content-${step}`}>
        {/* Weiße Folien-Fläche: Inhalt liegt auf Weiß, das gezoomte Haus bleibt
            drumherum transparent sichtbar. */}
        <div className={styles.slide}>
        {isSummary ? (
          <h1 className={styles.title} data-wide>
            {t.summaryTitle} <span className={styles.titleSep}>|</span> {chapter.label}
          </h1>
        ) : editMode && !isFakt ? (
          <textarea
            className={styles.titleInput}
            value={effTitle}
            onChange={onEdit(titleField)}
            rows={1}
            aria-label={t.editTitleAria}
          />
        ) : (
          <h1 className={styles.title} data-fakt={isFakt || undefined}>
            {effTitle}
          </h1>
        )}

        {isSummary ? (
          /* Letzte Kachel: Management Summary + Business Case + KPI-Framework
             (gleiches Framework für alle Kapitel; KPI-Werte sind Platzhalter). */
          <div className={styles.summaryStep}>
            <div className={styles.summaryBlock}>
              <ul className={styles.summaryBullets}>
                {(SUMMARY_BULLETS[chapter.id] ?? [{ de: chapter.vision, en: chapter.vision, fr: chapter.vision }]).map(
                  (b, i) => {
                    const bk = summaryBulletKey(chapter.id, lang, i)
                    const bv = edits.texts[bk] ?? b[lang]
                    return (
                      <li className={styles.summaryBullet} key={i}>
                        <span className={styles.summaryBulletIcon} aria-hidden>
                          <Check size={14} strokeWidth={3} />
                        </span>
                        {editMode ? (
                          <textarea
                            className={styles.editInput}
                            value={bv}
                            onChange={(e) => setText(bk, e.target.value)}
                            rows={2}
                          />
                        ) : (
                          <span className={styles.summaryBulletText} dangerouslySetInnerHTML={rich(bv)} />
                        )}
                      </li>
                    )
                  },
                )}
              </ul>
            </div>

            <div className={styles.kpiSection}>
              <span className={styles.kpiHeading}>
                <BookOpen size={14} strokeWidth={2.2} aria-hidden />
                {t.kpiHeading}
              </span>
              <div className={styles.kpiRow}>
                {(KPIS_BY_CHAPTER[chapter.id] ?? []).filter((k) => k.featured).map((kpi: Kpi) => {
                  const up = kpi.ambitioniert >= kpi.base
                  const value = kpiRange(kpi, lang, t.kpiApprox, t.kpiRangeJoin)
                  return (
                    <div className={styles.kpiCard} key={kpi.label.en} data-trend={up ? 'up' : 'down'}>
                      <span className={styles.kpiLabel}>{kpi.label[lang]}</span>
                      <span className={styles.kpiValue}>
                        {up ? (
                          <TrendingUp size={20} strokeWidth={2.4} aria-hidden />
                        ) : (
                          <TrendingDown size={20} strokeWidth={2.4} aria-hidden />
                        )}
                        {value}
                      </span>
                    </div>
                  )
                })}
              </div>
              <p className={styles.kpiFootnote}>{t.kpiFootnote}</p>
            </div>
          </div>
        ) : isFakt && fakt ? (
          <FaktSlide fakt={fakt} lang={lang} />
        ) : (
          <>
        <div className={styles.media}>
          <div
            ref={isActivity ? setFrameEl : undefined}
            className={styles.imageInner}
            data-compare={hypothesis ? '' : undefined}
          >
            {hypothesis ? (
              /* Gegenüberstellung Heute | 2030 als geteilte Folie: zwei Spalten
                 (Wortmarke + Spalten-Überschrift + Bildhälfte + Text) in EINEM
                 Raster, darunter je Spalte eine getönte Fläche (.cmpBox) bis zur
                 Naht — links graphit für Heute, rechts grün für 2030, das
                 Heute-Bild entsättigt. Der im Vergleichsbild eingebackene
                 Trennbalken (mittlere ~4 %) wird weggecroppt; auf der Naht
                 verbindet ein runder Pfeil-Badge (Heute → 2030) die Szenen. */
              <div className={styles.compareMedia}>
                <span className={styles.cmpBox} data-quo aria-hidden />
                <span className={styles.cmpBox} data-future aria-hidden />
                <div className={`${styles.cmpHead}`} data-quo>
                  <span className={styles.cmpKicker}>
                    <Clock size={13} strokeWidth={2.2} aria-hidden />
                    {t.todayTag}
                    <em className={styles.cmpSub}>{t.todaySub}</em>
                  </span>
                  {hypothesis.imageTitles && (
                    <span className={styles.cmpTitle}>{hypothesis.imageTitles.statusQuo}</span>
                  )}
                </div>
                <div className={`${styles.cmpHead}`} data-future>
                  <span className={styles.cmpKicker}>
                    <Sparkles size={13} strokeWidth={2.2} aria-hidden />
                    {t.future}
                    <em className={styles.cmpSub}>{t.futureSub}</em>
                  </span>
                  {hypothesis.imageTitles && (
                    <span className={styles.cmpTitle}>{hypothesis.imageTitles.in2030}</span>
                  )}
                </div>
                <div className={styles.cmpImg} data-quo>
                  {videosOn && hypoVideos?.statusQuo && playing.quo ? (
                    <video
                      className={styles.cmpVideo}
                      src={hypoVideos.statusQuo}
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                  ) : (
                    <img src={effImageSrc} alt={image.alt} />
                  )}
                  {videosOn && hypoVideos?.statusQuo && (
                    <button
                      type="button"
                      className={styles.cmpPlayArea}
                      data-playing={playing.quo || undefined}
                      onClick={() => setPlaying((p) => ({ ...p, quo: !p.quo }))}
                      aria-label={playing.quo ? t.videoStop : t.videoPlay}
                      aria-pressed={playing.quo}
                    >
                      <span className={styles.cmpPlayBadge} aria-hidden>
                        {playing.quo ? (
                          <Pause size={20} strokeWidth={2.4} />
                        ) : (
                          <Play size={20} strokeWidth={2.4} />
                        )}
                      </span>
                    </button>
                  )}
                </div>
                <div className={styles.cmpBadge} aria-hidden>
                  <span className={styles.cmpBadgeCircle}>
                    <ArrowRight size={20} strokeWidth={2.6} />
                  </span>
                </div>
                <div className={styles.cmpImg} data-future>
                  {videosOn && hypoVideos?.in2030 && playing.future ? (
                    <video
                      className={styles.cmpVideo}
                      src={hypoVideos.in2030}
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                  ) : (
                    <img src={effImageSrc} alt="" />
                  )}
                  {videosOn && hypoVideos?.in2030 && (
                    <button
                      type="button"
                      className={styles.cmpPlayArea}
                      data-playing={playing.future || undefined}
                      onClick={() => setPlaying((p) => ({ ...p, future: !p.future }))}
                      aria-label={playing.future ? t.videoStop : t.videoPlay}
                      aria-pressed={playing.future}
                    >
                      <span className={styles.cmpPlayBadge} aria-hidden>
                        {playing.future ? (
                          <Pause size={20} strokeWidth={2.4} />
                        ) : (
                          <Play size={20} strokeWidth={2.4} />
                        )}
                      </span>
                    </button>
                  )}
                </div>
                <div className={styles.cmpBody} data-quo>
                  {editMode ? (
                    <>
                      <textarea
                        className={styles.editInput}
                        value={effStatusQuo}
                        onChange={onEdit('statusQuo')}
                        rows={4}
                      />
                      <div className={styles.boldHint}>{t.boldHint}</div>
                    </>
                  ) : (
                    <p className={styles.cmpText} dangerouslySetInnerHTML={rich(effStatusQuo)} />
                  )}
                </div>
                <div className={styles.cmpBody} data-future>
                  {editMode ? (
                    <>
                      <textarea
                        className={styles.editInput}
                        value={effIn2030}
                        onChange={onEdit('in2030')}
                        rows={4}
                      />
                      <div className={styles.boldHint}>{t.boldHint}</div>
                    </>
                  ) : (
                    <p className={styles.cmpText} dangerouslySetInnerHTML={rich(effIn2030)} />
                  )}
                </div>
              </div>
            ) : (
              <ImageSlot
                src={effImageSrc}
                alt={image.alt}
                fit="cover"
                label={slotLabel}
                caption={effTitle}
              />
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
            {editMode && (
              <div className={styles.imgUpload}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={onImageFile}
                />
                <button
                  type="button"
                  className={styles.imgUploadBtn}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 size={14} strokeWidth={2} className={styles.spin} aria-hidden />
                  ) : (
                    <ImageUp size={14} strokeWidth={2} aria-hidden />
                  )}
                  {t.replaceImage}
                </button>
                {uploadErr && <span className={styles.imgUploadErr}>{t.uploadFailed}</span>}
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
            {/* Status-Quo-/2030-Texte stehen direkt in den Vergleichsspalten oben.
                Im Lese-Modus präsentiert allein der Consultant unten rechts die
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
              <p className={styles.copy} dangerouslySetInnerHTML={rich(effActivityText)} />
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
      </div>

      {/* Dauerhafte iframe-Ebene: lädt die Live-Demo ab dem ersten Schritt
          und liegt auf dem Aktivitäts-Schritt über dem Monitor im Foto. */}
      {activity.screenOverlay && (
        <ScreenIframe
          overlay={activity.screenOverlay}
          imageSrc={effActivityImage}
          frame={frameEl}
          active={isActivity}
          loadingLabel={t.screenLoading}
        />
      )}

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
              data-fakt={(fakt !== null && i === 0) || undefined}
              onClick={() => onStepChange(i)}
              aria-label={
                i === stepCount - 1
                  ? t.summaryAria
                  : i === activityIndex
                    ? t.activity
                    : fakt !== null && i === 0
                      ? t.faktAria
                      : t.hypothesisAria(i + 1 - offset)
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
          newLabel={t.consultantNew}
          context={kicker}
          openLabel={t.consultantOpen}
          closeLabel={t.consultantClose}
        />
      )}
    </div>
  )
}
