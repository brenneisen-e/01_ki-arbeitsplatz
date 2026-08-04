import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { gsap } from 'gsap'
import {
  ArrowLeft,
  Download,
  FileSpreadsheet,
  Loader2,
  ScrollText,
  SlidersHorizontal,
} from 'lucide-react'
import styles from './BankExplorer.module.css'
import { ImageSlot } from './ImageSlot'
import { ChapterReader } from './ChapterReader'
import { TransformationOffering } from './TransformationOffering'
import { AdminCms } from './AdminCms'
import { EinstiegsBuehne } from './EinstiegsBuehne'
import { IframeStage } from './IframeStage'
import { StrategyLab } from './StrategyLab'
import { CoCreationCanvas } from './CoCreationCanvas'
import { KreditDilemma } from './KreditDilemma'
import { ManagementSummary } from './ManagementSummary'
import { DeloitteBadge } from './DeloitteBadge'
import { LanguageSwitch } from './LanguageSwitch'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useLang, type Lang } from '../i18n/LanguageContext'
import { parseHash, formatHash } from '../deeplink'
import {
  CHAPTER_IDS,
  DEFAULT_API,
  isTeaserChapter,
  stepCountForChapter,
  type Chapter,
  type ChapterId,
  type ExperienceApi,
  type Handoff,
} from '../data/chapters'
import { hasEinstieg } from '../data/einstieg'
import { useChapterEdits } from '../data/chapterEdits'
import { exportChaptersXlsx } from '../data/exportChaptersXlsx'

type ExplorerStrings = {
  backToChat: string
  backToChatAria: string
  topKicker: string
  topTitle: string
  summary: string
  summaryAria: string
  masterLabel: string
  masterCaption: string
  chapter: string
  zoneAria: (label: string, kapitel: string) => string
}

const STR: Record<Lang, ExplorerStrings> = {
  de: {
    backToChat: 'Zurück zum Chat',
    backToChatAria: 'Zurück zum Chatbot',
    topKicker: 'Banking Horizon 2030',
    topTitle: 'Interaktive Demo',
    summary: 'Management Summary',
    summaryAria: 'Management Summary öffnen — Vision der Bank 2030',
    masterLabel: 'Master · Strukturbild',
    masterCaption: 'Bank’26 — Querschnitt',
    chapter: 'Kapitel',
    zoneAria: (label, kapitel) => `${label} — Kapitel ${kapitel} öffnen`,
  },
  en: {
    backToChat: 'Back to chat',
    backToChatAria: 'Back to the chatbot',
    topKicker: 'Banking Horizon 2030',
    topTitle: 'Interactive demo',
    summary: 'Management summary',
    summaryAria: 'Open the management summary — vision of the bank in 2030',
    masterLabel: 'Master · Cross-section',
    masterCaption: 'Bank’26 — cross-section',
    chapter: 'Chapter',
    zoneAria: (label, kapitel) => `${label} — open chapter ${kapitel}`,
  },
}

// Persistenz: aktueller Navigationsstand (offenes Kapitel + Schritt) wird in der
// Browser-Sitzung gehalten, damit ein Refresh an genau dieser Stelle bleibt
// statt auf die Übersicht/Landing-Page zurückzuspringen.
const NAV_KEY = 'bz2030:nav'

type SavedNav = { chapter: ChapterId | null; step: number }

function loadNav(): SavedNav {
  // Deep-Link im URL-Hash hat Vorrang vor der Sitzungs-Persistenz.
  const link = parseHash()
  if (link.view === 'chapter') return { chapter: link.chapter, step: link.step }
  if (link.view === 'overview') return { chapter: null, step: 0 }
  try {
    const raw = sessionStorage.getItem(NAV_KEY)
    if (!raw) return { chapter: null, step: 0 }
    const parsed = JSON.parse(raw) as Partial<SavedNav>
    const chapter =
      typeof parsed.chapter === 'string' && CHAPTER_IDS.includes(parsed.chapter as ChapterId)
        ? (parsed.chapter as ChapterId)
        : null
    const maxStep = chapter ? stepCountForChapter(chapter) - 1 : 0
    const step =
      typeof parsed.step === 'number'
        ? Math.min(Math.max(0, Math.floor(parsed.step)), maxStep)
        : 0
    return { chapter, step }
  } catch {
    return { chapter: null, step: 0 }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BankExplorer — die begehbare Navigations-Karte.
//
// Zustände:  overview → (Klick auf Zone) Kameraflug → ChapterReader
//            (Hypothese 1–3 → Aktivität) → Handoff (Demo / Tool) → zurück.
//
// Zoom: jede Zone hat Mittelpunkt + Größe in % der Bild-Maße. Die Camera
// trägt die Bild-Aspect-Ratio und wird per GSAP auf die Zone gefahren; der
// ChapterReader legt sich (halbtransparent) darüber, sodass die geflogene
// Szene dahinter durchschimmert.
// ─────────────────────────────────────────────────────────────────────────────

/** Kameraflug: ruhiger Cinematic-Flug. */
const ZOOM_DURATION = 2.4
const ZOOM_EASE = 'power3.inOut'

type Geom = { scale: number; x: number; y: number }

function computeGeom(
  chapter: Chapter,
  stageWidth: number,
  stageHeight: number,
  cameraWidth: number,
  cameraHeight: number,
): Geom {
  const safeCameraH = Math.max(cameraHeight, 1)
  const safeCameraW = Math.max(cameraWidth, 1)
  const { zone } = chapter
  const scaleH = (stageHeight * 100) / (safeCameraH * zone.height)
  const scaleW = (stageWidth * 100) / (safeCameraW * zone.width)
  const fit = zone.fit ?? 'contain'
  const scale = fit === 'cover' ? Math.max(scaleH, scaleW) : Math.min(scaleH, scaleW)
  const x = (scale * safeCameraW * (50 - zone.centerX)) / 100
  const y = (scale * safeCameraH * (50 - zone.centerY)) / 100
  return { scale, x, y }
}

type BankExplorerProps = {
  /** Zurück zur Chatbot-Landing (nur aus der Übersicht erreichbar). */
  onExitToIntro?: () => void
  /**
   * Daten-Instanz (Master-Bild + Kapitel) für diese Engine. Default ist die
   * Standard-Instanz „Bank'26"; die Edekabank-Instanz übergibt ihre eigene API.
   */
  api?: ExperienceApi
}

/** Belebtes Strukturbild in 6 Kacheln: je Kachel ein Veo-Loop (1080p für die
 *  halbe Bildbreite → Schärfe auf Original-Niveau). Die Kachelgrenzen liegen
 *  auf statischer Architektur (Geschossdecken, Aufzugsmitte), die Videos
 *  enthalten exakt den Kern-Ausschnitt; Position in % des Master-Bilds
 *  (2304×1536). */
const MASTER_TILES: Array<{ file: string; left: string; top: string; width: string; height: string }> = [
  // Der Aufzugschacht (x 1040–1170 von 2304) bleibt bewusst statisch (Still) —
  // die Kachel-Crops schließen ihn komplett aus, sonst halluziniert die
  // Video-Generierung dort zusätzliche Kabinen.
  { file: 't2-0l.webm', left: '0%', top: '0%', width: '45.139%', height: '24.349%' },
  { file: 't2-0r.webm', left: '50.781%', top: '0%', width: '49.219%', height: '24.349%' },
  { file: 't2-1l.webm', left: '0%', top: '24.349%', width: '45.139%', height: '37.630%' },
  { file: 't2-1r.webm', left: '50.781%', top: '24.349%', width: '49.219%', height: '37.630%' },
  { file: 't2-2l.webm', left: '0%', top: '61.979%', width: '45.139%', height: '38.021%' },
  { file: 't2-2r.webm', left: '50.781%', top: '61.979%', width: '49.219%', height: '38.021%' },
]

export function BankExplorer({ onExitToIntro, api = DEFAULT_API }: BankExplorerProps): React.ReactElement {
  const rootRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const cameraRef = useRef<HTMLDivElement>(null)
  const tweenRef = useRef<gsap.core.Tween | null>(null)
  const flyTimeoutRef = useRef<number | null>(null)

  // Gemerkten Navigationsstand einmalig laden (Refresh-Wiederherstellung).
  const [initialNav] = useState(loadNav)
  // Teaser-Kapitel haben nur die Einstiegsbühne: Schritt auf 0 klemmen und die
  // Bühne beim Wiederherstellen sofort öffnen (es gibt keinen Reader dahinter).
  const initialTeaser = isTeaserChapter(initialNav.chapter)
  const [activeId, setActiveId] = useState<ChapterId | null>(initialNav.chapter)
  const [step, setStep] = useState(initialTeaser ? 0 : initialNav.step)
  const [hoverId, setHoverId] = useState<ChapterId | null>(null)
  const [handoff, setHandoff] = useState<Handoff | null>(null)
  // Reader erst NACH dem Kameraflug zeigen, damit der Zoom sichtbar bleibt —
  // bei einem wiederhergestellten Kapitel jedoch sofort.
  const [readerShown, setReaderShown] = useState(initialNav.chapter !== null)
  // Management-Summary-Overlay (Vision der Bank 2030) — nur aus der Übersicht.
  const [summaryOpen, setSummaryOpen] = useState(false)
  // Änderungsbereich (Admin-CMS) — strukturierte Bearbeitung aller Kapitelinhalte.
  const [cmsOpen, setCmsOpen] = useState(false)
  // Excel-Export: Ladezustand (edits/lang/Handler weiter unten, nach useLang).
  const [exporting, setExporting] = useState(false)
  // Einstiegsbühne (Raum groß + Heute/Morgen) beim frischen Öffnen eines Raum-
  // Kapitels, bevor der Reader mit den Hypothesen übernimmt. Bei einem
  // wiederhergestellten Teaser-Kapitel sofort offen (einzige Ansicht).
  const [einstiegOpen, setEinstiegOpen] = useState(initialTeaser)

  const reducedMotion = useReducedMotion()
  const { lang } = useLang()
  const t = STR[lang]
  // Excel-Export aller Kapitel (inkl. gespeicherter Edits) — von der Übersicht aus.
  const { edits } = useChapterEdits()
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
  const chapters = useMemo(() => api.getChapters(lang), [api, lang])
  const masterImage = useMemo(() => api.getMasterImage(lang), [api, lang])
  // Plaza-Sprites (transparente Video-Loops einzelner Fußgänger) nur für das
  // Standard-Strukturbild — das Still bleibt in voller Schärfe, nur die
  // Personen bewegen sich. Braucht VP9/WebM (Alpha-Kanal); Safari o. ä. ohne
  // Support bekommt einfach das unbewegte Bild.
  const spritesEnabled = masterImage.src.includes('Strukturbild')
  const spriteOk = useMemo(() => {
    try {
      return document.createElement('video').canPlayType('video/webm; codecs="vp9"') !== ''
    } catch {
      return false
    }
  }, [])
  const activeChapter = useMemo(() => api.getChapter(activeId, lang), [api, activeId, lang])
  const isOverview = activeChapter === null

  const animateTo = useCallback(
    (chapter: Chapter | null, opts: { instant?: boolean } = {}) => {
      const camera = cameraRef.current
      const stage = stageRef.current
      if (!camera || !stage) return
      tweenRef.current?.kill()

      const geom: Geom = chapter
        ? computeGeom(
            chapter,
            stage.clientWidth,
            stage.clientHeight,
            camera.clientWidth,
            camera.clientHeight,
          )
        : { scale: 1, x: 0, y: 0 }

      if (opts.instant || reducedMotion) {
        gsap.set(camera, { scale: geom.scale, x: geom.x, y: geom.y, force3D: true })
        return
      }
      tweenRef.current = gsap.to(camera, {
        scale: geom.scale,
        x: geom.x,
        y: geom.y,
        duration: ZOOM_DURATION,
        ease: ZOOM_EASE,
        force3D: true,
      })
    },
    [reducedMotion],
  )

  // Mount: Kamera sofort auf den gemerkten Stand setzen (Übersicht ODER ein
  // per Refresh wiederhergestelltes Kapitel) + sanft einblenden.
  useLayoutEffect(() => {
    animateTo(activeChapter, { instant: true })
    const root = rootRef.current
    if (root && !reducedMotion) {
      gsap.fromTo(root, { opacity: 0 }, { opacity: 1, duration: 0.7, ease: 'power2.out' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Navigationsstand persistieren, sobald sich Kapitel oder Schritt ändern.
  useEffect(() => {
    try {
      sessionStorage.setItem(NAV_KEY, JSON.stringify({ chapter: activeId, step }))
    } catch {
      // Persistenz optional — ohne sessionStorage läuft die App normal weiter.
    }
  }, [activeId, step])

  // Beim Unmount einen evtl. laufenden Kameraflug-Timer aufräumen.
  useEffect(() => () => {
    if (flyTimeoutRef.current) window.clearTimeout(flyTimeoutRef.current)
  }, [])

  // Resize-Listener: bei aktivem Zoom neu ausrichten. Der ResizeObserver
  // feuert synchron beim observe() einmal — diesen ersten Call überspringen,
  // sonst zerschießt er eine gerade gestartete Tween.
  const activeChapterRef = useRef<Chapter | null>(null)
  useEffect(() => {
    activeChapterRef.current = activeChapter
  }, [activeChapter])

  useEffect(() => {
    const stage = stageRef.current
    const camera = cameraRef.current
    if (!stage || !camera) return
    let firstCall = true
    let lastW = stage.clientWidth
    let lastH = stage.clientHeight
    const onResize = () => {
      if (firstCall) {
        firstCall = false
        return
      }
      const w = stage.clientWidth
      const h = stage.clientHeight
      if (w === lastW && h === lastH) return
      lastW = w
      lastH = h
      animateTo(activeChapterRef.current, { instant: true })
    }
    const ro = new ResizeObserver(onResize)
    ro.observe(stage)
    ro.observe(camera)
    window.addEventListener('orientationchange', onResize)
    return () => {
      ro.disconnect()
      window.removeEventListener('orientationchange', onResize)
    }
  }, [animateTo])

  // Zentrale Kapitel-Navigation (Zonen-Klick UND Deep-Link/Hash-Wechsel).
  const goToChapter = useCallback(
    (id: ChapterId, nextStep: number, opts: { instant?: boolean } = {}) => {
      const chapter = chapters.find((c) => c.id === id)
      if (!chapter) return
      setHoverId(null)
      setActiveId(id)
      // Teaser-Kapitel (z. B. Produktraum): es gibt nur die Einstiegsbühne —
      // Deep-Links auf spätere Schritte werden auf 0 geklemmt.
      const teaser = chapter.teaserOnly === true
      const effStep = teaser ? 0 : nextStep
      setStep(effStep)
      setReaderShown(false)
      setEinstiegOpen(false)
      animateTo(chapter, opts)
      if (flyTimeoutRef.current) window.clearTimeout(flyTimeoutRef.current)
      // Frisches Öffnen eines Raum-Kapitels (Schritt 0): zuerst die Einstiegs-
      // bühne (Raum groß), danach per CTA in den Reader.
      const wantEinstieg = (effStep === 0 || teaser) && hasEinstieg(id)
      // Die Einstiegsbühne erst einblenden, wenn der Kameraflug fast steht
      // (~92 %) — sonst faded das Raumbild über eine noch bewegte Kamera und es
      // wirkt abgehackt. Der reine Reader darf früher (~60 %) erscheinen.
      const delay = reducedMotion || opts.instant
        ? 0
        : ZOOM_DURATION * (wantEinstieg ? 920 : 600)
      flyTimeoutRef.current = window.setTimeout(() => {
        setReaderShown(true)
        if (wantEinstieg) setEinstiegOpen(true)
      }, delay)
    },
    [animateTo, reducedMotion, chapters],
  )

  const handleZoneClick = useCallback(
    (chapter: Chapter) => goToChapter(chapter.id, 0),
    [goToChapter],
  )

  const handleBack = useCallback(() => {
    if (flyTimeoutRef.current) window.clearTimeout(flyTimeoutRef.current)
    setHandoff(null)
    setReaderShown(false)
    setEinstiegOpen(false)
    setActiveId(null)
    animateTo(null, { instant: true })
  }, [animateTo])

  const handleHandoff = useCallback((h: Handoff) => setHandoff(h), [])
  const handleHandoffClose = useCallback(() => setHandoff(null), [])

  // Zurück zum Chatbot: gemerkten Navigationsstand verwerfen, damit der
  // nächste Einstieg wieder sauber auf der Übersicht beginnt.
  const handleExitToIntro = useCallback(() => {
    try {
      sessionStorage.removeItem(NAV_KEY)
    } catch {
      // Persistenz optional.
    }
    onExitToIntro?.()
  }, [onExitToIntro])

  // URL-Hash an den aktuellen Navigationsstand angleichen (teilbarer Deep-Link).
  // replaceState statt location.hash: erzeugt keinen History-Eintrag pro Schritt
  // und löst kein hashchange aus (kein Rück-Trigger des Listeners unten).
  useEffect(() => {
    const desired = activeId
      ? formatHash({ view: 'chapter', chapter: activeId, step })
      : formatHash({ view: 'overview' })
    if (window.location.hash !== desired) {
      window.history.replaceState(
        null,
        '',
        desired || window.location.pathname + window.location.search,
      )
    }
  }, [activeId, step])

  // Externe Hash-Änderungen (Deep-Link eingefügt, URL editiert, Vor-/Zurück):
  // die Navigation entsprechend nachziehen.
  useEffect(() => {
    const onHash = () => {
      const link = parseHash()
      if (link.view === 'chapter') {
        if (link.chapter !== activeId || link.step !== step) {
          goToChapter(link.chapter, link.step)
        }
      } else if (activeId !== null) {
        handleBack()
      }
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [activeId, step, goToChapter, handleBack])

  return (
    <div className={styles.root} ref={rootRef}>
      <div className={styles.stage} ref={stageRef}>
        <div
          className={styles.camera}
          ref={cameraRef}
          style={{ ['--ar' as string]: String(api.MASTER_ASPECT) }}
        >
          <ImageSlot
            src={masterImage.src}
            alt={masterImage.alt}
            fit="cover"
            label={t.masterLabel}
            caption={t.masterCaption}
          />

          {/* Belebtes Strukturbild: 6 Video-Kacheln exakt über ihren Bild-
              regionen (Grenzen auf statischer Architektur). Jede Kachel
              blendet erst ein, wenn sie wirklich spielt — bis dahin (und bei
              Ladefehlern) sieht man das scharfe Still darunter.
              pointer-events: none — die Klick-Zonen bleiben unberührt. */}
          {spritesEnabled && spriteOk && !reducedMotion && (
            <div className={styles.spriteLayer} aria-hidden>
              {MASTER_TILES.map((tile) => (
                <video
                  key={tile.file}
                  className={styles.tile}
                  style={{ left: tile.left, top: tile.top, width: tile.width, height: tile.height }}
                  src={`${import.meta.env.BASE_URL}videos/${tile.file}`}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  onPlaying={(e) => {
                    e.currentTarget.dataset.ready = '1'
                  }}
                />
              ))}
            </div>
          )}

          {isOverview && (
            <div className={styles.zones}>
              {chapters.map((chapter) => {
                const { zone } = chapter
                // Trefferfläche (Hover/Klick) am Label-/Schlüsselobjekt-Punkt
                // zentrieren und auf den jeweiligen Raum begrenzen (hitWidth/
                // hitHeight). So reagiert nicht der ganze Stock — die Zoom-Zone
                // (computeGeom) bleibt davon unberührt.
                const hitCX = zone.labelX ?? zone.centerX
                const hitCY = zone.labelY ?? zone.centerY
                const hitW = zone.hitWidth ?? zone.width
                const hitH = zone.hitHeight ?? zone.height
                const top = hitCY - hitH / 2
                const left = hitCX - hitW / 2
                // Hotspot + Label sitzen mittig in der Trefferfläche (= am
                // Schlüsselobjekt-Punkt).
                const spotLeft = ((hitCX - left) / hitW) * 100
                const spotTop = ((hitCY - top) / hitH) * 100
                const zIndex =
                  chapter.id === 'transformation' ? 3 : chapter.id === 'kunde' ? 2 : 1
                return (
                  <button
                    type="button"
                    key={chapter.id}
                    className={styles.zone}
                    style={{
                      top: `${top}%`,
                      left: `${left}%`,
                      height: `${hitH}%`,
                      width: `${hitW}%`,
                      zIndex,
                    }}
                    data-hovered={hoverId === chapter.id || undefined}
                    onPointerEnter={() => setHoverId(chapter.id)}
                    onPointerLeave={() =>
                      setHoverId((h) => (h === chapter.id ? null : h))
                    }
                    onFocus={() => setHoverId(chapter.id)}
                    onBlur={() => setHoverId((h) => (h === chapter.id ? null : h))}
                    onClick={() => handleZoneClick(chapter)}
                    aria-label={t.zoneAria(chapter.label, chapter.kapitel)}
                  >
                    <span
                      className={styles.hotspot}
                      style={{ left: `${spotLeft}%`, top: `${spotTop}%` }}
                      aria-hidden
                    >
                      {chapter.kapitel}
                    </span>
                    <span
                      className={styles.zoneLabel}
                      style={{ left: `${spotLeft}%`, top: `${spotTop}%` }}
                    >
                      <span className={styles.zoneKicker}>{t.chapter} {chapter.kapitel}</span>
                      <span className={styles.zoneTitle}>{chapter.label}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Oben links (nur Übersicht): Sprache + Zurück zum Chatbot + Deloitte-„Demo" */}
        <div className={styles.topLeft} data-visible={isOverview || undefined}>
          <LanguageSwitch />
          {onExitToIntro && (
            <button
              type="button"
              className={styles.introBtn}
              tabIndex={isOverview ? 0 : -1}
              onClick={handleExitToIntro}
              aria-label={t.backToChatAria}
            >
              <ArrowLeft size={16} strokeWidth={2} aria-hidden />
              <span>{t.backToChat}</span>
            </button>
          )}
          <DeloitteBadge />
          <button
            type="button"
            className={styles.introBtn}
            tabIndex={isOverview ? 0 : -1}
            onClick={() => setCmsOpen(true)}
            aria-label={lang === 'de' ? 'Änderungsbereich öffnen' : 'Open editing area'}
          >
            <SlidersHorizontal size={16} strokeWidth={2} aria-hidden />
            <span>{lang === 'de' ? 'Bearbeiten' : 'Edit'}</span>
          </button>
          <button
            type="button"
            className={styles.introBtn}
            tabIndex={isOverview ? 0 : -1}
            onClick={onExport}
            disabled={exporting}
            aria-label={lang === 'de' ? 'Excel-Export aller Kapitel' : 'Excel export of all chapters'}
          >
            {exporting ? (
              <Loader2 size={16} strokeWidth={2} className={styles.spin} aria-hidden />
            ) : (
              <FileSpreadsheet size={16} strokeWidth={2} aria-hidden />
            )}
            <span>Excel</span>
          </button>
          <a
            className={styles.introBtn}
            href={`${import.meta.env.BASE_URL}Banking_Horizon_2030_KPI-Modell.xlsx`}
            download
            tabIndex={isOverview ? 0 : -1}
            aria-label={lang === 'de' ? 'KPI-Modell (Excel) herunterladen' : 'Download KPI model (Excel)'}
          >
            <Download size={16} strokeWidth={2} aria-hidden />
            <span>{lang === 'de' ? 'KPI-Modell' : 'KPI model'}</span>
          </a>
        </div>

        {/* Titel-Box, kommt oben mittig herein (nur Übersicht) */}
        <div className={styles.topbar} data-visible={isOverview || undefined}>
          <span className={styles.topbarKicker}>{t.topKicker}</span>
          <span className={styles.topbarSep} aria-hidden />
          <span className={styles.topbarTitle}>{t.topTitle}</span>
        </div>

        {/* Management Summary — Vision der Bank 2030 (unten rechts, nur Übersicht) */}
        <button
          type="button"
          className={styles.summaryBtn}
          data-visible={isOverview || undefined}
          tabIndex={isOverview ? 0 : -1}
          onClick={() => setSummaryOpen(true)}
          aria-label={t.summaryAria}
        >
          <ScrollText size={17} strokeWidth={1.9} aria-hidden />
          <span>{t.summary}</span>
        </button>

        {/* Kapitel-Reader (Hypothesen → Aktivität) — erst nach dem Kameraflug.
            Das Transformationskapitel zeigt stattdessen das Deloitte-Offering.
            Teaser-Kapitel (Produktraum) haben keinen Reader — nur die
            Einstiegsbühne, danach zurück zur Übersicht. */}
        {activeChapter && readerShown && !einstiegOpen && !activeChapter.teaserOnly && (
          activeChapter.id === 'transformation' ? (
            <TransformationOffering chapter={activeChapter} onBack={handleBack} />
          ) : (
            <ChapterReader
              chapter={activeChapter}
              step={step}
              onStepChange={setStep}
              onBack={handleBack}
              onHandoff={handleHandoff}
            />
          )
        )}

        {/* Einstiegsbühne: nach dem Reinzoomen zuerst der Raum groß + Heute/
            Morgen; der CTA schließt sie und gibt den Reader frei. */}
        {activeChapter && einstiegOpen && (
          <EinstiegsBuehne
            chapter={activeChapter}
            onWeiter={
              activeChapter.teaserOnly
                ? handleBack
                : () => setEinstiegOpen(false)
            }
          />
        )}

        {/* Handoff-Overlays */}
        {handoff?.kind === 'iframe' && (
          <IframeStage url={handoff.url} title={handoff.title} onClose={handleHandoffClose} />
        )}
        {handoff?.kind === 'strategy-lab' && <StrategyLab onClose={handleHandoffClose} />}
        {handoff?.kind === 'cocreation' && (
          <CoCreationCanvas variant={handoff.variant} onClose={handleHandoffClose} />
        )}
        {handoff?.kind === 'kredit-dilemma' && <KreditDilemma onClose={handleHandoffClose} />}

        {/* Management-Summary-Overlay (Vision der Bank 2030) */}
        {summaryOpen && <ManagementSummary onClose={() => setSummaryOpen(false)} />}

        {/* Änderungsbereich (Admin-CMS) — strukturierte Bearbeitung je Kapitel */}
        {cmsOpen && <AdminCms onClose={() => setCmsOpen(false)} />}
      </div>
    </div>
  )
}
