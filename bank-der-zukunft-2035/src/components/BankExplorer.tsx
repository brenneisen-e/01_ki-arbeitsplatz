import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { gsap } from 'gsap'
import styles from './BankExplorer.module.css'
import { FloorPanel } from './FloorPanel'
import { useReducedMotion } from '../hooks/useReducedMotion'

// ─────────────────────────────────────────────────────────────────────────────
// FLOORS-KONSTANTE -- hier die Etagen-Zonen kalibrieren.
//
// topPct / heightPct sind PROZENT der BILD-HÖHE (nicht der Viewport-Höhe).
// Die Camera-Div hat exakt die Bild-Aspect-Ratio (siehe IMAGE_ASPECT) und
// passt per max-width/max-height in die Stage; das Bild füllt die Camera
// 1:1, daher sind die Prozente direkt die Bild-Prozente.
//
// Werte hier solange justieren, bis die drei Bands beim Klick die jeweilige
// Etage exakt einrahmen. Tipp: in BankExplorer.module.css kurz
// `outline: 2px dashed lime;` auf .zone einkommentieren, um die Boxen zu
// sehen.
// ─────────────────────────────────────────────────────────────────────────────

type FloorId =
  | 'governance'
  | 'advisory'
  | 'markets'
  | 'backoffice'
  | 'datacenter'

type Floor = {
  id: FloorId
  label: string
  kicker: string
  /** Anteil der Bildhöhe, ab dem die Zone beginnt (0..100) */
  topPct: number
  /** Höhe der Zone in % der Bildhöhe */
  heightPct: number
  /**
   * Horizontaler Zoom-Mittelpunkt in % der Bildbreite (0..100).
   * Default ist 50 (Bild-Mitte = Aufzug). Pro Etage wird hier auf den
   * tatsächlichen Hotspot der Etage geschoben (z. B. Boardroom links
   * statt Aufzug-Mitte), damit der gezoomte Ausschnitt das relevante
   * Etagen-Motiv zeigt und nicht den leeren Aufzug-Schacht.
   */
  xCenterPct?: number
  /**
   * Optional: hochauflösendes Detail-Bild für diese Etage. Wird (sobald
   * gesetzt) im Zoom per Cross-Fade über das Master-Bild gelegt --
   * NICHT innerhalb der zoomenden Camera, sondern auf Stage-Ebene, damit
   * es bei nativer Auflösung erscheint statt nochmal hochskaliert zu
   * werden (siehe `<DetailLayer>` weiter unten).
   */
  detailImage?: string
  chapter: {
    title: string
    body: string
    kpis: { label: string; value: string }[]
  }
}

const FLOORS: Floor[] = [
  {
    id: 'governance',
    label: 'Governance Cockpit',
    kicker: 'Etage 1 · Vorstand',
    topPct: 2.5,
    heightPct: 24,
    xCenterPct: 25,
    detailImage: './bank-floor-governance.png',
    chapter: {
      title: 'AI-Governance, Risiko und Kapitalentscheidung',
      body:
        'Vorstand und Aufsichts-Funktion arbeiten 2035 mit einem Governance-Cockpit, das Kapitaladäquanz, Liquidität und Modell-Risiken in Echtzeit zusammenführt. Entscheidungen werden nicht mehr im Quartal getroffen, sondern als laufende Konversation zwischen Vorstand, Modell und Aufsicht.',
      kpis: [
        { label: 'Capital Adequacy', value: '17,8 %' },
        { label: 'Liquidity Coverage', value: '138,4 %' },
        { label: 'Modelle im Audit', value: '47 aktiv · 3 in Quarantäne' },
      ],
    },
  },
  {
    id: 'advisory',
    label: 'Wealth & Advisory',
    kicker: 'Etage 2 · Beratung',
    topPct: 26.6,
    heightPct: 20.2,
    xCenterPct: 22,
    chapter: {
      title: 'Vermögensberatung mit Co-Pilot und Hyperpersonalisierung',
      body:
        'Wealth- und Private-Banking-Berater:innen arbeiten 2035 mit einem persönlichen Assistenten, der Kundensituation, Marktlage und regulatorische Leitplanken in einer Sitzung zusammenführt. Vorschläge kommen szenariobasiert -- die finale Empfehlung bleibt menschlich.',
      kpis: [
        { label: 'Beratungsproduktivität', value: '+38 %' },
        { label: 'Cross-Sell-Quote', value: '24 %' },
        { label: 'Net Promoter Score', value: '+62' },
      ],
    },
  },
  {
    id: 'markets',
    label: 'Markt-Berater',
    kicker: 'Etage 3 · Markets',
    topPct: 46.8,
    heightPct: 15.8,
    xCenterPct: 35,
    chapter: {
      title: 'Markets & Trading: Sub-Sekunden-Insight',
      body:
        'Die Markt-Spezialist:innen bekommen Ideenflüsse aus Forschung, Sentiment- und Mikrostruktur-Modellen vorgefiltert. Ein RL-Routing-Agent verteilt Orders über Venues und führt Best-Execution-Begründungen automatisiert mit.',
      kpis: [
        { label: 'Tages-Volumen Eigenhandel', value: '3,2 Mrd. EUR' },
        { label: 'Best-Ex-Quote', value: '99,4 %' },
        { label: 'Modell-Drift-Inzidenz', value: '0,3 / Woche' },
      ],
    },
  },
  {
    id: 'backoffice',
    label: 'Marketplace Back-Office',
    kicker: 'Etage 4 · Hybride Teams',
    topPct: 62.6,
    heightPct: 18,
    chapter: {
      title: 'Marketplace & Back-Office Processing',
      body:
        'Im Back-Office teilen sich Spezialist:innen, KI-Copilots und autonome Service-Worker das Workflow-Backbone. Routine-Begründungen entfallen, Eskalationen kommen vorab annotiert. Der Mensch bleibt verantwortlich -- aber nur noch für das, was wirklich Entscheidung ist.',
      kpis: [
        { label: 'STP-Quote', value: '62 %' },
        { label: 'Tagesvolumen', value: '12,4 Mio. EUR' },
        { label: 'Mean Time To Action', value: '2,1 Sek' },
      ],
    },
  },
  {
    id: 'datacenter',
    label: 'Data & Infrastruktur',
    kicker: 'Etage 5 · Plattform',
    topPct: 80.6,
    heightPct: 17.4,
    chapter: {
      title: 'Datenplattform und Post-Quantum-Fundament',
      body:
        'Die Plattform ist 2035 ein Data Mesh aus 11 Domänen mit 212 Datenprodukten. Schlüsselmaterial wandert kontinuierlich auf quantenresistente Verfahren. Observability ist eine Feedback-Schleife: 81 % aller Incidents werden geschlossen, bevor sie überhaupt ein Mensch sieht.',
      kpis: [
        { label: 'Datenprodukte live', value: '212' },
        { label: 'PQ-Migration', value: '74 %' },
        { label: 'Auto-Recovery', value: '81 %' },
      ],
    },
  },
]

/**
 * Aspect-Ratio des Master-Bilds. Aktuell ~16:9 (1672×941). Wenn du das
 * Bild austauschst, hier die echte Auflösung eintragen -- die Camera
 * sizet sich automatisch entsprechend.
 */
const IMAGE_ASPECT = 1672 / 941

/** Smooth, langsamer Flug -- bewusst kein „snap"-Gefühl. */
const ZOOM_DURATION = 5.0
const ZOOM_EASE = 'power2.inOut'

/** Panel kommt ungefähr ab Halbzeit des Zooms; Cross-Fade des Details auch. */
const PANEL_DELAY = ZOOM_DURATION * 0.55
const PANEL_DURATION = 0.7
const DETAIL_CROSSFADE_DELAY = ZOOM_DURATION * 0.45
const DETAIL_CROSSFADE_DURATION = 0.6

// ─────────────────────────────────────────────────────────────────────────────
// Zoom-Mathematik (jetzt mit Camera-Höhe statt Stage-Höhe):
//
// Die Camera ist eine Box mit der Aspect-Ratio des Bilds, per
// max-width/max-height in die Stage eingepasst (object-fit: contain via
// CSS aspect-ratio). Sie kann also kleiner sein als die Stage in einer
// Dimension. Das Bild füllt die Camera 1:1.
//
// 1. Skalierung:
//    Wir wollen die Zone (heightPct % der CAMERA-Höhe) auf die volle
//    Stage-Höhe vergrößern. Da die Zone vor dem Scale die Höhe
//    `cameraH × heightPct / 100` hat, brauchen wir:
//
//        scale = (stageH × 100) / (cameraH × heightPct)
//
//    Wenn die Camera die Stage in der Höhe füllt (cameraH = stageH),
//    reduziert sich das auf scale = 100 / heightPct -- wie ursprünglich.
//    Bei Letterboxing oben/unten (Bild AR > Stage AR) wird mehr Zoom
//    nötig, damit die Zone die Stage füllt.
//
// 2. Vertikale Verschiebung:
//    Die Zone-Mitte liegt bei zoneCenterPct = topPct + heightPct/2 (in %
//    der Camera-Höhe). Vor dem Transform ist die Camera in der Stage
//    zentriert; nach Scale `s` ist 1 % der Camera-Höhe = s × cameraH /
//    100. Der Versatz, um zoneCenter auf Stage-Mitte zu bringen,
//    beträgt:
//
//        translateY = (50 − zoneCenterPct) × cameraH × scale / 100
//                   = (50 − zoneCenterPct) × stageH / heightPct
//
//    (cameraH kürzt sich raus -- die Translation hängt nur von der
//    Stage-Höhe ab.)
//
// 3. Horizontal:
//    Etagen sind horizontale Bänder -- translateX = 0. Wenn die Camera
//    nach Scale > Stage-Breite wird, schneidet die Stage (overflow:
//    hidden) den Rand ab.
// ─────────────────────────────────────────────────────────────────────────────

type Geom = { scale: number; x: number; y: number }

function computeGeom(
  floor: Floor,
  stageHeight: number,
  cameraWidth: number,
  cameraHeight: number,
): Geom {
  // Schutz vor Division durch 0, falls der Layout-Pass noch nicht durch ist.
  const safeCameraH = Math.max(cameraHeight, 1)
  const safeCameraW = Math.max(cameraWidth, 1)
  const scale = (stageHeight * 100) / (safeCameraH * floor.heightPct)
  const zoneCenterY = floor.topPct + floor.heightPct / 2
  const zoneCenterX = floor.xCenterPct ?? 50
  // translateY bringt die Zone-Mitte vertikal auf Stage-Mitte (siehe
  // Herleitung im Kommentar oben).
  const y = ((50 - zoneCenterY) * stageHeight) / floor.heightPct
  // translateX bringt zoneCenterX horizontal auf Stage-Mitte:
  // translateX = scale × cameraW × (50 - zoneCenterX) / 100
  const x = (scale * safeCameraW * (50 - zoneCenterX)) / 100
  return { scale, x, y }
}

export function BankExplorer(): React.ReactElement {
  const stageRef = useRef<HTMLDivElement>(null)
  const cameraRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const detailRef = useRef<HTMLImageElement>(null)
  const tweenRef = useRef<gsap.core.Tween | null>(null)

  const [activeId, setActiveId] = useState<FloorId | null>(null)
  const [hoverId, setHoverId] = useState<FloorId | null>(null)

  const reducedMotion = useReducedMotion()

  const activeFloor = useMemo(
    () => FLOORS.find((f) => f.id === activeId) ?? null,
    [activeId],
  )

  // Zentraler Animator: rechnet Geom für den aktiven Floor (oder Übersicht)
  // und tweenet die Kamera. Wird sowohl bei Klick als auch bei Resize
  // aufgerufen.
  const animateTo = useCallback(
    (floor: Floor | null, opts: { instant?: boolean } = {}) => {
      const camera = cameraRef.current
      const stage = stageRef.current
      if (!camera || !stage) return

      // Vorhandenes Tween killen, sonst überlagern sich Animationen.
      tweenRef.current?.kill()

      const geom: Geom = floor
        ? computeGeom(floor, stage.clientHeight, camera.clientWidth, camera.clientHeight)
        : { scale: 1, x: 0, y: 0 }

      const instant = opts.instant || reducedMotion

      if (instant) {
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

  // Initial: Position fixieren, falls ein Floor irgendwann aus URL/Resume
  // wiederhergestellt würde. Aktuell ist der Init-State immer null.
  useLayoutEffect(() => {
    animateTo(activeFloor, { instant: true })
    // Wir wollen das einmalig beim Mount tun; Folge-Aufrufe regelt der
    // Click-Handler bzw. der Resize-Listener.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Panel-Fade (gsap-gesteuert, damit es exakt nach dem Zoom kommt).
  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return
    gsap.killTweensOf(panel)
    if (activeFloor) {
      if (reducedMotion) {
        gsap.set(panel, { opacity: 1, y: 0 })
      } else {
        gsap.fromTo(
          panel,
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            duration: PANEL_DURATION,
            ease: 'power2.out',
            delay: PANEL_DELAY,
          },
        )
      }
    } else {
      if (reducedMotion) {
        gsap.set(panel, { opacity: 0 })
      } else {
        gsap.to(panel, {
          opacity: 0,
          y: 12,
          duration: 0.35,
          ease: 'power2.in',
        })
      }
    }
  }, [activeFloor, reducedMotion])

  // Cross-Fade des Detail-Bilds (sobald activeFloor.detailImage existiert).
  // Das Detail-Bild liegt AUF Stage-Ebene (nicht in der Camera) und wird
  // also bei nativer Viewport-Auflösung dargestellt -- kein weiteres
  // Hochskalieren, kein Pixel-Matsch.
  useEffect(() => {
    const detail = detailRef.current
    if (!detail) return
    gsap.killTweensOf(detail)
    if (activeFloor?.detailImage) {
      if (reducedMotion) {
        gsap.set(detail, { opacity: 1 })
      } else {
        gsap.fromTo(
          detail,
          { opacity: 0 },
          {
            opacity: 1,
            duration: DETAIL_CROSSFADE_DURATION,
            ease: 'power2.out',
            delay: DETAIL_CROSSFADE_DELAY,
          },
        )
      }
    } else {
      if (reducedMotion) {
        gsap.set(detail, { opacity: 0 })
      } else {
        gsap.to(detail, { opacity: 0, duration: 0.3, ease: 'power2.in' })
      }
    }
  }, [activeFloor, reducedMotion])

  // Wir halten activeFloor in einem Ref, damit der Resize-Effekt unten
  // nicht bei jedem activeFloor-Wechsel neu gemountet wird (sonst feuert
  // der frische ResizeObserver SOFORT synchron und killt die gerade
  // gestartete Zoom-Tween).
  const activeFloorRef = useRef<Floor | null>(null)
  useEffect(() => {
    activeFloorRef.current = activeFloor
  }, [activeFloor])

  // Resize-Listener: solange wir in einen Floor gezoomt sind, neu
  // ausrichten, sobald sich die Stage- oder Camera-Größe ändert.
  // WICHTIG: ResizeObserver feuert synchron beim observe() einmal --
  // die initiale Messung würden wir sonst als „Resize" interpretieren
  // und die Zoom-Tween zerschießen. Deshalb der `firstCall`-Skip.
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
      animateTo(activeFloorRef.current, { instant: true })
    }
    const ro = new ResizeObserver(onResize)
    ro.observe(stage)
    ro.observe(camera)
    const onOrient = () => {
      // orientationchange braucht keinen first-call-Skip
      animateTo(activeFloorRef.current, { instant: true })
    }
    window.addEventListener('orientationchange', onOrient)
    return () => {
      ro.disconnect()
      window.removeEventListener('orientationchange', onOrient)
    }
  }, [animateTo])

  // Tastatur: Esc verlässt den Fokus.
  useEffect(() => {
    if (!activeFloor) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveId(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeFloor])

  const handleZoneClick = useCallback(
    (floor: Floor) => {
      setActiveId(floor.id)
      animateTo(floor)
    },
    [animateTo],
  )

  const handleBack = useCallback(() => {
    setActiveId(null)
    // Zurück springt instant in die Übersicht -- kein Zoom-Out-Flug.
    animateTo(null, { instant: true })
  }, [animateTo])

  const isOverview = activeFloor === null

  return (
    <div className={styles.root}>
      <div className={styles.stage} ref={stageRef}>
        {/* CAMERA: passt sich per CSS calc an Bild-AR an, transformiert per GSAP */}
        <div
          className={styles.camera}
          ref={cameraRef}
          style={{ ['--ar' as string]: String(IMAGE_ASPECT) }}
        >
          <img
            className={styles.master}
            src="./bank-master.png"
            alt="Querschnitt der Bank der Zukunft -- drei Etagen: Vorstand mit Governance-Cockpit, Operations mit hybriden Teams, Data Center mit Plattform-Infrastruktur."
            draggable={false}
          />

          {/* HOVER-/KLICK-ZONEN über der Camera -- in % der Bild-Höhe */}
          <div className={styles.zones} data-overview={isOverview || undefined}>
            {FLOORS.map((floor) => (
              <button
                type="button"
                key={floor.id}
                className={styles.zone}
                style={{
                  top: `${floor.topPct}%`,
                  height: `${floor.heightPct}%`,
                }}
                data-hovered={hoverId === floor.id || undefined}
                onPointerEnter={() => setHoverId(floor.id)}
                onPointerLeave={() =>
                  setHoverId((h) => (h === floor.id ? null : h))
                }
                onFocus={() => setHoverId(floor.id)}
                onBlur={() =>
                  setHoverId((h) => (h === floor.id ? null : h))
                }
                onClick={() => handleZoneClick(floor)}
                aria-label={`${floor.label} – Etage öffnen`}
              >
                <span className={styles.zoneHighlight} aria-hidden />
                <span className={styles.zoneLabel}>
                  <span className={styles.zoneKicker}>{floor.kicker}</span>
                  <span className={styles.zoneTitle}>{floor.label}</span>
                  <ArrowRight size={16} strokeWidth={1.8} aria-hidden />
                </span>
                <span className={styles.zoneRule} aria-hidden />
              </button>
            ))}
          </div>
        </div>

        {/*
          DETAIL-LAYER: hochauflösendes Etagen-Bild auf Stage-Ebene
          (nicht in der zoomenden Camera). Wird per opacity-Cross-Fade
          eingeblendet, sobald activeFloor.detailImage gesetzt ist.
          So bleibt das Detail bei nativer Bildschirmauflösung scharf,
          weil es NICHT auch noch durch den Camera-Scale läuft.

          Damit das vernünftig aussieht, sollten Detail-Bilder etwa in
          Viewport-Größe gerendert werden (≥ 2560×1440, ideal 3840×2160).
        */}
        {activeFloor?.detailImage && (
          <img
            ref={detailRef}
            className={styles.detail}
            src={activeFloor.detailImage}
            alt={`Detail: ${activeFloor.label}`}
            draggable={false}
          />
        )}

        {/* ZURÜCK-BUTTON */}
        <button
          type="button"
          className={styles.backBtn}
          data-visible={!isOverview || undefined}
          onClick={handleBack}
          aria-label="Zurück zur Übersicht"
          tabIndex={isOverview ? -1 : 0}
        >
          <ArrowLeft size={16} strokeWidth={1.8} />
          <span>Übersicht</span>
        </button>

        {/* KAPITEL-PANEL */}
        <div
          className={styles.panelLayer}
          ref={panelRef}
          aria-hidden={isOverview}
          data-visible={!isOverview || undefined}
        >
          {activeFloor && <FloorPanel floor={activeFloor} />}
        </div>

        {/* Marken-Lockup oben rechts (nur Übersicht) */}
        <div className={styles.brand} data-visible={isOverview || undefined}>
          <span className={styles.brandKicker}>Banking 2035</span>
          <span className={styles.brandTitle}>Future Bank — Querschnitt</span>
        </div>
      </div>
    </div>
  )
}
