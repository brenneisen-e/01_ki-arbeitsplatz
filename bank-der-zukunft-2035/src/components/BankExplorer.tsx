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
// topPct / heightPct sind PROZENT der BILD-HÖHE. Das Master-Bild ist 16:9
// und wird per object-fit: cover in den Viewport eingepasst. Bei 16:9-
// Viewports stimmen die Prozente mit der sichtbaren Bild-Höhe überein;
// bei stark abweichenden Viewport-Ratios kann es leichten Crop-Versatz
// geben (siehe Hinweis bei der Zoom-Mathematik unten).
//
// Werte hier solange justieren, bis die drei Bands beim Klick die jeweilige
// Etage exakt einrahmen. Hilfreich: kurzzeitig `outline: 2px dashed lime;`
// auf .zone in BankExplorer.module.css einblenden, um die Boxen zu sehen.
// ─────────────────────────────────────────────────────────────────────────────

type FloorId = 'governance' | 'operations' | 'datacenter'

type Floor = {
  id: FloorId
  label: string
  kicker: string
  /** Anteil der Bildhöhe, ab dem die Zone beginnt (0..100) */
  topPct: number
  /** Höhe der Zone in % der Bildhöhe */
  heightPct: number
  /**
   * Optional: hochauflösendes Detail-Bild für diese Etage. Wenn gesetzt,
   * blendet die Komponente es im Zoom per Cross-Fade ein (Platzhalter
   * unten in <CameraImage> -- die Logik dafür einfach aktivieren).
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
    label: 'AI-Governance',
    kicker: 'Etage 1 · Vorstand',
    topPct: 4,
    heightPct: 34,
    // detailImage: '/bank-floor-governance.png', // ← später aktivieren für Cross-Fade
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
    id: 'operations',
    label: 'Operations',
    kicker: 'Etage 2 · Hybride Teams',
    topPct: 40,
    heightPct: 26,
    chapter: {
      title: 'Hybride Operations: Mensch, Copilot und Agent',
      body:
        'Auf der Operations-Ebene teilen sich Spezialist:innen, KI-Copilots und autonome Service-Worker das Workflow-Backbone. Routine-Begründungen entfallen, Eskalationen kommen vorab annotiert. Der Mensch bleibt verantwortlich -- aber nur noch für das, was wirklich Entscheidung ist.',
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
    kicker: 'Etage 3 · Plattform',
    topPct: 68,
    heightPct: 28,
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

// Animations-Konfiguration -- aus dem Prompt: ca. 1.2 s, power3.inOut.
const ZOOM_DURATION = 1.2
const ZOOM_EASE = 'power3.inOut'
const PANEL_DELAY = 0.55
const PANEL_DURATION = 0.45

// ─────────────────────────────────────────────────────────────────────────────
// Zoom-Mathematik (Kommentar, damit du sie selbst nachjustieren kannst):
//
// 1. Skalierung:
//    Wir wollen die Etagen-Zone (heightPct % der Bildhöhe) auf 100 %
//    Viewport-Höhe vergrößern.
//
//        scale = 100 / heightPct
//
// 2. Vertikale Verschiebung:
//    Nach reinem Scale (transform-origin: 50% 50%) bleibt das Bildzentrum
//    am Viewport-Zentrum. Die Zone hat ihren Mittelpunkt bei
//
//        zoneCenterPct = topPct + heightPct / 2
//
//    in % der Bildhöhe. Wir verschieben das Bild so, dass dieser Punkt
//    auf das Viewport-Zentrum rückt:
//
//        translateY (px) = (50 − zoneCenterPct) × stageHeight / heightPct
//
//    Herleitung: Nach Scale s ist 1 % der Bildhöhe = s × stageHeight / 100;
//    der Versatz beträgt (50 − zoneCenterPct) % der Bildhöhe ⇒
//        translateY = (50 − zoneCenterPct) × s × stageHeight / 100
//                   = (50 − zoneCenterPct) × stageHeight / heightPct.
//
// 3. Horizontale Verschiebung:
//    Die Etagen sind horizontale Bänder über die ganze Bildbreite,
//    deshalb hier 0. Falls du später einen einzelnen Schreibtisch
//    anvisieren willst, leitest du translateX analog her (centerXPct).
//
// 4. Viewport-AR != Bild-AR (16:9):
//    Mit object-fit: cover wird das Bild ggf. an der schmaleren Achse
//    beschnitten. Auf 16:9-Bildschirmen passt es exakt. Auf abweichenden
//    ARs (Ultrawide, Hochkant) verschiebt sich die effektive Zone-
//    Position um den Crop-Versatz; die obigen Prozente bleiben aber als
//    Referenz die einfachste Stellschraube.
// ─────────────────────────────────────────────────────────────────────────────

type Geom = { scale: number; y: number }

function computeGeom(floor: Floor, stageHeight: number): Geom {
  const scale = 100 / floor.heightPct
  const zoneCenterPct = floor.topPct + floor.heightPct / 2
  const y = ((50 - zoneCenterPct) * stageHeight) / floor.heightPct
  return { scale, y }
}

export function BankExplorer(): React.ReactElement {
  const stageRef = useRef<HTMLDivElement>(null)
  const cameraRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
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
        ? computeGeom(floor, stage.clientHeight)
        : { scale: 1, y: 0 }

      const instant = opts.instant || reducedMotion

      if (instant) {
        gsap.set(camera, { scale: geom.scale, y: geom.y, force3D: true })
        return
      }

      tweenRef.current = gsap.to(camera, {
        scale: geom.scale,
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
          { opacity: 0, y: 16 },
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
          duration: 0.28,
          ease: 'power2.in',
        })
      }
    }
  }, [activeFloor, reducedMotion])

  // Resize-Listener: solange wir in einen Floor gezoomt sind, neu
  // ausrichten, sobald sich die Stage-Höhe ändert.
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const onResize = () => animateTo(activeFloor, { instant: true })
    const ro = new ResizeObserver(onResize)
    ro.observe(stage)
    window.addEventListener('orientationchange', onResize)
    return () => {
      ro.disconnect()
      window.removeEventListener('orientationchange', onResize)
    }
  }, [activeFloor, animateTo])

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
    animateTo(null)
  }, [animateTo])

  const isOverview = activeFloor === null

  return (
    <div className={styles.root}>
      {/* STAGE = Viewport-große Bühne; hier wird gezoomt */}
      <div className={styles.stage} ref={stageRef}>
        {/* CAMERA = Element, das transformiert wird (scale + translateY) */}
        <div className={styles.camera} ref={cameraRef}>
          <img
            className={styles.master}
            src="./bank-master.png"
            alt="Querschnitt der Bank der Zukunft -- drei Etagen: Vorstand mit Governance-Cockpit, Operations mit hybriden Teams, Data Center mit Plattform-Infrastruktur."
            draggable={false}
          />

          {/*
            Cross-Fade-Slot für Detail-Bilder:
            Sobald ein Floor ein `detailImage` hat und wir ihn aktivieren,
            können wir hier eine zweite <img> opazitätsbasiert einblenden.
            Beispiel (auskommentiert, weil v1 nur das Master-Bild zeigt):

            {activeFloor?.detailImage && (
              <img
                className={`${styles.master} ${styles.masterDetail}`}
                src={activeFloor.detailImage}
                alt={activeFloor.label}
                aria-hidden
              />
            )}

            Dazu noch eine CSS-Regel ergänzen, die opacity per
            data-attribute toggelt. (Bewusst nicht aktiviert in v1.)
          */}
        </div>

        {/* HIGHLIGHT-/HOVER-ZONEN -- nur sichtbar in der Übersicht.
            Pointer-events wandern via data-overview an/aus, damit man im
            Zoom nicht versehentlich Klicks abfängt. */}
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
              onPointerLeave={() => setHoverId((h) => (h === floor.id ? null : h))}
              onFocus={() => setHoverId(floor.id)}
              onBlur={() => setHoverId((h) => (h === floor.id ? null : h))}
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

        {/* ZURÜCK-BUTTON -- erscheint nur im Zoom */}
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

        {/* KAPITEL-PANEL -- gefadet via gsap (siehe useEffect oben) */}
        <div
          className={styles.panelLayer}
          ref={panelRef}
          aria-hidden={isOverview}
          data-visible={!isOverview || undefined}
        >
          {activeFloor && <FloorPanel floor={activeFloor} />}
        </div>

        {/* Logo / Bühnentitel oben rechts (nur Übersicht) */}
        <div className={styles.brand} data-visible={isOverview || undefined}>
          <span className={styles.brandKicker}>Banking 2035</span>
          <span className={styles.brandTitle}>Future Bank — Querschnitt</span>
        </div>
      </div>
    </div>
  )
}
