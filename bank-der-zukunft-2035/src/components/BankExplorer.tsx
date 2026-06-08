import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { gsap } from 'gsap'
import { ScrollText } from 'lucide-react'
import styles from './BankExplorer.module.css'
import { ImageSlot } from './ImageSlot'
import { ChapterReader, STEP_COUNT } from './ChapterReader'
import { IframeStage } from './IframeStage'
import { StrategyLab } from './StrategyLab'
import { CoCreationCanvas } from './CoCreationCanvas'
import { KreditDilemma } from './KreditDilemma'
import { ManagementSummary } from './ManagementSummary'
import { useReducedMotion } from '../hooks/useReducedMotion'
import {
  CHAPTERS,
  MASTER_ASPECT,
  MASTER_IMAGE,
  getChapter,
  type Chapter,
  type ChapterId,
  type Handoff,
} from '../data/chapters'

// Persistenz: aktueller Navigationsstand (offenes Kapitel + Schritt) wird in der
// Browser-Sitzung gehalten, damit ein Refresh an genau dieser Stelle bleibt
// statt auf die Übersicht/Landing-Page zurückzuspringen.
const NAV_KEY = 'bz2035:nav'

type SavedNav = { chapter: ChapterId | null; step: number }

function loadNav(): SavedNav {
  try {
    const raw = sessionStorage.getItem(NAV_KEY)
    if (!raw) return { chapter: null, step: 0 }
    const parsed = JSON.parse(raw) as Partial<SavedNav>
    const chapter =
      typeof parsed.chapter === 'string' && CHAPTERS.some((c) => c.id === parsed.chapter)
        ? (parsed.chapter as ChapterId)
        : null
    const step =
      typeof parsed.step === 'number'
        ? Math.min(Math.max(0, Math.floor(parsed.step)), STEP_COUNT - 1)
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

export function BankExplorer(): React.ReactElement {
  const rootRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const cameraRef = useRef<HTMLDivElement>(null)
  const tweenRef = useRef<gsap.core.Tween | null>(null)
  const flyTimeoutRef = useRef<number | null>(null)

  // Gemerkten Navigationsstand einmalig laden (Refresh-Wiederherstellung).
  const [initialNav] = useState(loadNav)
  const [activeId, setActiveId] = useState<ChapterId | null>(initialNav.chapter)
  const [step, setStep] = useState(initialNav.step)
  const [hoverId, setHoverId] = useState<ChapterId | null>(null)
  const [handoff, setHandoff] = useState<Handoff | null>(null)
  // Reader erst NACH dem Kameraflug zeigen, damit der Zoom sichtbar bleibt —
  // bei einem wiederhergestellten Kapitel jedoch sofort.
  const [readerShown, setReaderShown] = useState(initialNav.chapter !== null)
  // Management-Summary-Overlay (Vision der Bank 2035) — nur aus der Übersicht.
  const [summaryOpen, setSummaryOpen] = useState(false)

  const reducedMotion = useReducedMotion()
  const activeChapter = useMemo(() => getChapter(activeId), [activeId])
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

  const handleZoneClick = useCallback(
    (chapter: Chapter) => {
      setHoverId(null)
      setActiveId(chapter.id)
      setStep(0)
      setReaderShown(false)
      animateTo(chapter)
      if (flyTimeoutRef.current) window.clearTimeout(flyTimeoutRef.current)
      // Reader nach ~60 % des Flugs einblenden (instant bei reduced motion).
      const delay = reducedMotion ? 0 : ZOOM_DURATION * 600
      flyTimeoutRef.current = window.setTimeout(() => setReaderShown(true), delay)
    },
    [animateTo, reducedMotion],
  )

  const handleBack = useCallback(() => {
    if (flyTimeoutRef.current) window.clearTimeout(flyTimeoutRef.current)
    setHandoff(null)
    setReaderShown(false)
    setActiveId(null)
    animateTo(null, { instant: true })
  }, [animateTo])

  const handleHandoff = useCallback((h: Handoff) => setHandoff(h), [])
  const handleHandoffClose = useCallback(() => setHandoff(null), [])

  return (
    <div className={styles.root} ref={rootRef}>
      <div className={styles.stage} ref={stageRef}>
        <div
          className={styles.camera}
          ref={cameraRef}
          style={{ ['--ar' as string]: String(MASTER_ASPECT) }}
        >
          <ImageSlot
            src={MASTER_IMAGE.src}
            alt={MASTER_IMAGE.alt}
            fit="cover"
            label="Master · Strukturbild"
            caption="Bank'26 — Querschnitt"
          />

          {isOverview && (
            <div className={styles.zones}>
              {CHAPTERS.map((chapter) => {
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
                    aria-label={`${chapter.label} — Kapitel ${chapter.kapitel} öffnen`}
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
                      <span className={styles.zoneKicker}>Kapitel {chapter.kapitel}</span>
                      <span className={styles.zoneTitle}>{chapter.label}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Marken-Lockup + Hinweis (nur Übersicht) */}
        <div className={styles.brand} data-visible={isOverview || undefined}>
          <span className={styles.brandKicker}>Banking Horizon 2035</span>
          <span className={styles.brandTitle}>Bank'26 — begehbares Strukturbild</span>
        </div>
        <div className={styles.hint} data-visible={isOverview || undefined} aria-hidden>
          Zone wählen — von der Steuerung bis zum Fundament
        </div>

        {/* Management Summary — Vision der Bank 2035 (unten rechts, nur Übersicht) */}
        <button
          type="button"
          className={styles.summaryBtn}
          data-visible={isOverview || undefined}
          tabIndex={isOverview ? 0 : -1}
          onClick={() => setSummaryOpen(true)}
          aria-label="Management Summary öffnen — Vision der Bank 2035"
        >
          <ScrollText size={17} strokeWidth={1.9} aria-hidden />
          <span>Management Summary</span>
        </button>

        {/* Kapitel-Reader (Hypothesen → Aktivität) — erst nach dem Kameraflug */}
        {activeChapter && readerShown && (
          <ChapterReader
            chapter={activeChapter}
            step={step}
            onStepChange={setStep}
            onBack={handleBack}
            onHandoff={handleHandoff}
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

        {/* Management-Summary-Overlay (Vision der Bank 2035) */}
        {summaryOpen && <ManagementSummary onClose={() => setSummaryOpen(false)} />}
      </div>
    </div>
  )
}
