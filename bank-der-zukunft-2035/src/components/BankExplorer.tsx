import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
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

// Räume gemäß 9-Räume-Spec: 4 Etagen × 2 Räume (links/rechts) + Keller (volle
// Breite) + Plaza außen + goldener Glas-Aufzug = 11 Räume gesamt.
type FloorId =
  | 'governance'
  | 'businessmodel'
  | 'corporate-l'
  | 'corporate-r'
  | 'sales-l'
  | 'sales-r'
  | 'backoffice-l'
  | 'backoffice-r'
  | 'datacenter'
  | 'elevator'
  | 'plaza'

type Floor = {
  id: FloorId
  label: string
  kicker: string
  /** Mittelpunkt X in % der Bildbreite (0..100). */
  centerX: number
  /** Mittelpunkt Y in % der Bildhöhe (0..100). */
  centerY: number
  /** Breite des Raumes in % der Bildbreite (0..100). */
  width: number
  /** Höhe des Raumes in % der Bildhöhe (0..100). */
  height: number
  /**
   * Zoom-Strategie: 'cover' (Default) füllt die Stage und schneidet ggf.
   * eine Dimension. 'contain' zeigt die Zone vollständig und lässt die
   * andere Dimension letterboxen. Für sehr schmale oder sehr breite
   * Zonen (Aufzug, Plaza) ist 'contain' ehrlicher.
   */
  fit?: 'cover' | 'contain'
  /**
   * Optional: hochauflösendes Detail-Bild für diese Zone (einzelne Szene,
   * Wird per opacity-Cross-Fade auf Stage-Ebene eingeblendet. Wenn
   * detailScenes gesetzt ist, hat dieses Feld keine Wirkung.
   */
  detailImage?: string
  /**
   * Optional: Mehrere Detail-Szenen, durch die der User per Pfeilen/Dots
   * blättern kann. Pro Szene kann ein iframe als "Bildschirm" auf einer
   * im Foto sichtbaren Display-Fläche eingeblendet werden.
   */
  detailScenes?: DetailScene[]
  chapter: {
    title: string
    body: string
    kpis: { label: string; value: string }[]
  }
  /**
   * Optional: Status-Quo-↔-2035-Vergleichs-Slides, die direkt im Panel
   * unter dem Teaser angezeigt werden. teaser ersetzt den generischen
   * chapter.body, sobald dieses Feld vorhanden ist.
   */
  demo?: {
    teaser: string
    slides: { title: string; statusQuo: string; in2035: string }[]
  }
}

type DetailScene = {
  image: string
  alt?: string
  /**
   * Optional: Falls die Szene einen sichtbaren Bildschirm/Display-Bereich
   * zeigt, wird dort ein iframe der angegebenen URL maßstabsgetreu
   * eingeblendet (logische 1920×1080-Auflösung, per CSS-Transform
   * skaliert -- kein Scrollen).
   */
  screenOverlay?: {
    url: string
    title: string
    /** Position des Bildschirms in % der Bild-Maße. */
    leftPct: number
    topPct: number
    widthPct: number
    heightPct: number
  }
}

// 9 Räume + Aufzug + Plaza. Koordinaten sind Startwerte aus der Spec — im
// Browser ggf. um 1-2 % nachjustieren. centerX/centerY = Raumzentrum
// (Zoom-Ziel), width/height = Raumgröße.
const FLOORS: Floor[] = [
  {
    id: 'governance',
    label: 'Compliance & Risk',
    kicker: 'Kapitel 06 · Top Floor links',
    centerX: 30,
    centerY: 15,
    width: 36,
    height: 25,
    detailImage: './bank-floor-governance.png',
    chapter: {
      title: 'Governance Cockpit: Capital, Liquidity & Risk in Echtzeit',
      body:
        'Vorstand und Aufsichts-Funktion arbeiten 2035 mit einem Governance-Cockpit, das Kapitaladäquanz, Liquidität, Risikoexposition und ESG-Score in Echtzeit zusammenführt. Compliance ist keine Quartalsübung mehr, sondern eine laufende Konversation zwischen Vorstand, Modell und Aufsicht.',
      kpis: [
        { label: 'Capital Adequacy', value: '17,8 %' },
        { label: 'Liquidity Coverage', value: '138,4 %' },
        { label: 'Risk Exposure', value: '42 %' },
      ],
    },
  },
  {
    id: 'businessmodel',
    label: 'Geschäftsmodell der Zukunft',
    kicker: 'Top Floor rechts · Executive Lounge',
    centerX: 70,
    centerY: 15,
    width: 36,
    height: 25,
    chapter: {
      title: 'Executive Lounge: der strategische Rückzugsraum',
      body:
        'Die Lounge auf der Vorstandsebene ist 2035 der informelle Denkraum: Hier formt sich das Geschäftsmodell der Zukunft. Strategie ist keine Folie, sondern ein laufendes Gespräch zwischen Vorstand, Aufsicht und Eigentümer:innen — ergänzt um Modelle, die Szenarien durchspielen und nicht entscheiden.',
      kpis: [
        { label: 'Strategie-Reviews / Jahr', value: '12' },
        { label: 'Modell-gestützte Szenarien', value: '> 200' },
        { label: 'Vorstandsentscheidungen mit KI-Co-Pilot', value: '74 %' },
      ],
    },
  },
  {
    id: 'corporate-l',
    label: 'Corporate Services',
    kicker: 'Kapitel 04 · 2. Etage links',
    centerX: 30,
    centerY: 40,
    width: 36,
    height: 24,
    chapter: {
      title: 'Organisation & Talent: Steuerung der Menschen-Seite',
      body:
        'Die Organization-Charts und Talent-Dashboards auf der Corporate-Services-Etage zeigen Struktur, Skills-Lücken, Engagement und Nachfolgeplanung in Echtzeit. HR ist 2035 weitgehend automatisiert — Führungskräfte sehen, wo es brennt, und können punktuell eingreifen, statt Listen abzuarbeiten.',
      kpis: [
        { label: 'Skill-Match-Quote', value: '86 %' },
        { label: 'Time-to-Fill (Schlüsselrollen)', value: '32 Tage' },
        { label: 'Engagement-Score', value: '78 / 100' },
      ],
    },
  },
  {
    id: 'corporate-r',
    label: 'People & Culture',
    kicker: 'Kapitel 04 · 2. Etage rechts',
    centerX: 70,
    centerY: 40,
    width: 36,
    height: 24,
    chapter: {
      title: 'People & Culture: der menschliche Teil der Bank',
      body:
        'Gegenüber den Dashboards liegt die People-&-Culture-Lounge — Ort für 1:1-Gespräche, Mentoring und kulturelle Routinen. Während die Algorithmen Skills und Auslastung tracken, kümmert sich der Mensch um das, was Modelle nicht messen: Vertrauen, Zugehörigkeit, gemeinsame Sprache.',
      kpis: [
        { label: 'Mentoring-Stunden / Person', value: '36 / Jahr' },
        { label: 'Kultur-Index', value: '+12' },
        { label: 'Freiwillige Fluktuation', value: '4,8 %' },
      ],
    },
  },
  {
    id: 'sales-l',
    label: 'Markt & Vertrieb',
    kicker: 'Kapitel 02 · Mittlere Etage links',
    centerX: 31,
    centerY: 60,
    width: 38,
    height: 18,
    detailScenes: [
      {
        image: './bank-floor-sales.png',
        alt: 'Beratungs-Desk mit Berater:in und Kund:in, SALES COCKPIT im Hintergrund',
      },
      {
        image: './bank-floor-sales-2.png',
        alt: 'Berater:in am Workstation-Desk mit eingeblendetem KI-Arbeitsplatz auf dem Bildschirm',
        screenOverlay: {
          url: 'https://kiarbeitsplatz.pages.dev/vertriebsarbeitsplatz/dist/#/versicherung/landing/uebersicht',
          title: 'KI-Arbeitsplatz – Vertriebsarbeitsplatz Live',
          // Bildschirm-Rechteck per Edge-Detection (1-99 Perzentil der
          // hellen Gray-Fläche) auf dem Foto: x=39,0-73,0 %, y=26,8-62,3 %.
          leftPct: 39.0,
          topPct: 26.8,
          widthPct: 33.97,
          heightPct: 35.49,
        },
      },
    ],
    chapter: {
      title: 'Advisory & Sales: Co-Pilot am Beratungs-Desk',
      body:
        'Berater:innen arbeiten 2035 voll integriert mit KI: Der Vertriebsarbeitsplatz scannt Bestandsportfolios laufend nach Vertriebspotenzialen, priorisiert sie nach Conversion-Wahrscheinlichkeit und liefert Cross-Sell-Vorschläge direkt im Beratungsgespräch. KI bereitet Termine vor, schreibt Protokolle mit und übersetzt Beratungsentscheidungen in regulatorisch saubere Dokumentation — der/die Berater:in bleibt Entscheider, die Datenarbeit übernimmt das System.',
      kpis: [
        { label: 'Pipeline-Volumen', value: '45,2 Mio. EUR' },
        { label: 'Conversion-Rate', value: '62 %' },
        { label: 'Beratungsproduktivität', value: '+38 %' },
      ],
    },
  },
  {
    id: 'sales-r',
    label: 'Meeting-Pods',
    kicker: 'Kapitel 02 · Mittlere Etage rechts',
    centerX: 70,
    centerY: 60,
    width: 36,
    height: 18,
    chapter: {
      title: 'Meeting-Pods: vertrauliche Beratung & Co-Browsing',
      body:
        'Hinter den Glaswänden der Pods passieren die längeren Beratungen — Vermögensplanung, Nachfolge, komplexe Kreditstrukturen. Der Co-Pilot teilt den Bildschirm, blendet Szenarien und regulatorische Hinweise ein, und protokolliert das Gespräch in einer für die Kund:innen verständlichen Zusammenfassung.',
      kpis: [
        { label: 'Pods aktiv', value: '8 parallel' },
        { label: 'Ø Gesprächsdauer', value: '42 Min' },
        { label: 'Folge-Termin-Quote', value: '71 %' },
      ],
    },
  },
  {
    id: 'backoffice-l',
    label: 'Marktfolge',
    kicker: 'Kapitel 03 · 4. Etage links',
    centerX: 31,
    centerY: 76,
    width: 38,
    height: 14,
    chapter: {
      title: 'Back-Office Processing: STP & autonome Service-Worker',
      body:
        'Die Marktfolge ist 2035 ein hybrides Team aus Spezialist:innen, KI-Copilots und autonomen Service-Robotern. Routine-Begründungen entfallen, Eskalationen kommen vorab annotiert. Der Mensch bleibt verantwortlich — aber nur noch für das, was wirklich Entscheidung ist.',
      kpis: [
        { label: 'STP-Quote', value: '62 %' },
        { label: 'Tagesvolumen', value: '12,4 Mio. EUR' },
        { label: 'Mean Time To Action', value: '2,1 Sek' },
      ],
    },
  },
  {
    id: 'backoffice-r',
    label: 'Workflow Automation',
    kicker: 'Kapitel 03 · 4. Etage rechts',
    centerX: 70,
    centerY: 76,
    width: 36,
    height: 14,
    chapter: {
      title: 'Document Processing Pipeline & Workflow Automation',
      body:
        'Die Wandscreens zeigen die Pipeline live: Eingang → Klassifikation → Extraktion → Prüfung → Buchung. Fehler werden im Modell selbst korrigiert; Eskalationen treffen menschliche Reviewer:innen vorgefiltert. Workflow Automation ist 2035 die Marktfolge — der Mensch macht den Rest.',
      kpis: [
        { label: 'Automations-Tiefe', value: '94 %' },
        { label: 'Dokumente / Tag', value: '> 380.000' },
        { label: 'Reklamationsquote', value: '0,4 %' },
      ],
    },
  },
  {
    id: 'datacenter',
    label: 'Technologie & IT',
    kicker: 'Kapitel 05 · Basement',
    centerX: 50,
    centerY: 92,
    width: 80,
    height: 16,
    chapter: {
      title: 'Data Center: Plattform & Post-Quantum-Fundament',
      body:
        'Im Basement liegt das technologische Fundament: Server-Reihen, holografische Konsole, Datenströme zwischen Domänen. Die Plattform ist 2035 ein Data Mesh aus 11 Domänen mit 212 Datenprodukten. Schlüsselmaterial wandert kontinuierlich auf quantenresistente Verfahren, 81 % aller Incidents werden geschlossen, bevor sie sichtbar werden.',
      kpis: [
        { label: 'Datenprodukte live', value: '212' },
        { label: 'PQ-Migration', value: '74 %' },
        { label: 'Auto-Recovery', value: '81 %' },
      ],
    },
  },
  {
    id: 'elevator',
    label: 'Transformationspfad',
    kicker: 'Kapitel 07 · Goldener Aufzug',
    centerX: 50,
    centerY: 50,
    width: 14,
    height: 96,
    chapter: {
      title: 'Aufzug-Spine: Transformation über alle Ebenen',
      body:
        'Der goldene Glas-Aufzug verbindet alle Etagen — vom Boardroom oben bis zum Data Center im Fundament. Er ist die visuelle Klammer der Transformation: keine Etage steht für sich, jede Veränderung wirkt vertikal durchs ganze Haus.',
      kpis: [
        { label: 'Verbundene Etagen', value: '5' },
        { label: 'Narrative Klammer', value: 'vertikal' },
        { label: 'Akzentfarbe', value: 'Deloitte-Grün' },
      ],
    },
  },
  {
    id: 'plaza',
    label: 'Kundenperspektive',
    kicker: 'Kapitel 01 · Plaza außen',
    centerX: 5,
    centerY: 55,
    width: 10,
    height: 60,
    detailImage: './bank-floor-plaza.png',
    chapter: {
      title: 'Plaza & Self-Service: die Bank von außen gesehen',
      body:
        'Vor dem Haus stehen Self-Service-Terminals und das FUTURE BANK-Schild. Die Kund:innenperspektive ist 2035 der Startpunkt: Kontakt findet jederzeit statt — Plaza, App, Pod oder Beraterin. Die Bank ist nicht mehr ein Ort, sondern ein Dienst.',
      kpis: [
        { label: 'Touchpoints / Kund:in / Jahr', value: '52' },
        { label: 'Self-Service-Quote (Standardvorgänge)', value: '88 %' },
        { label: 'Net Promoter Score', value: '+62' },
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

/** Kameraflug: 3,0 s (entspannter Cinematic-Flug). */
const ZOOM_DURATION = 3.0
const ZOOM_EASE = 'power3.inOut'

/** Panel kommt ungefähr ab Halbzeit des Zooms; Cross-Fade des Details auch. */
const PANEL_DELAY = ZOOM_DURATION * 0.55
const PANEL_DURATION = 0.55
const DETAIL_CROSSFADE_DELAY = ZOOM_DURATION * 0.5
const DETAIL_CROSSFADE_DURATION = 0.7

// ─────────────────────────────────────────────────────────────────────────────
// Zoom-Mathematik für 2D-Räume:
//
// Jeder Raum hat ein Zentrum (centerX, centerY) und eine Größe (width, height)
// in % der Bild-Maße. Die Camera trägt die Bild-Aspect-Ratio und liegt
// zentriert in der Stage.
//
// 1. Skalierung -- separat für beide Achsen:
//
//      scale_h = stageH × 100 / (cameraH × room.height)
//      scale_w = stageW × 100 / (cameraW × room.width)
//
//    'cover' (Default) = max(scale_h, scale_w) → Stage komplett gefüllt,
//    ggf. wird eine Dimension des Raums beschnitten. 'contain' = min →
//    der Raum ist vollständig sichtbar, andere Dimension letterboxed.
//
// 2. Translation: scale × cameraDim × (50 − roomCenter) / 100. Bringt
//    den Raum-Mittelpunkt auf Stage-Mitte (sowohl horizontal als
//    auch vertikal).
// ─────────────────────────────────────────────────────────────────────────────

type Geom = { scale: number; x: number; y: number }

function computeGeom(
  floor: Floor,
  stageWidth: number,
  stageHeight: number,
  cameraWidth: number,
  cameraHeight: number,
): Geom {
  // Schutz vor Division durch 0, falls der Layout-Pass noch nicht durch ist.
  const safeCameraH = Math.max(cameraHeight, 1)
  const safeCameraW = Math.max(cameraWidth, 1)
  const scaleH = (stageHeight * 100) / (safeCameraH * floor.height)
  const scaleW = (stageWidth * 100) / (safeCameraW * floor.width)
  // Spec-Default: 'contain' (Math.min) -- beide Achsen passen rein, Raum ist
  // vollständig sichtbar, andere Dimension letterboxed. 'cover' (Math.max)
  // wäre formatfüllend mit Beschnitt; aktuell nicht verwendet.
  const fit = floor.fit ?? 'contain'
  const scale = fit === 'cover' ? Math.max(scaleH, scaleW) : Math.min(scaleH, scaleW)
  // Translation bringt (centerX, centerY) auf Stage-Mitte.
  const x = (scale * safeCameraW * (50 - floor.centerX)) / 100
  const y = (scale * safeCameraH * (50 - floor.centerY)) / 100
  return { scale, x, y }
}

export function BankExplorer(): React.ReactElement {
  const stageRef = useRef<HTMLDivElement>(null)
  const cameraRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const detailRef = useRef<HTMLDivElement>(null)
  const tweenRef = useRef<gsap.core.Tween | null>(null)

  const [activeId, setActiveId] = useState<FloorId | null>(null)
  const [hoverId, setHoverId] = useState<FloorId | null>(null)
  const [sceneIndex, setSceneIndex] = useState(0)

  const reducedMotion = useReducedMotion()

  const activeFloor = useMemo(
    () => FLOORS.find((f) => f.id === activeId) ?? null,
    [activeId],
  )

  // Effektive Szenen-Liste: explizite detailScenes oder Fallback auf das
  // alte detailImage-Feld (genau eine Szene ohne screenOverlay).
  const scenes: DetailScene[] = useMemo(() => {
    if (!activeFloor) return []
    if (activeFloor.detailScenes && activeFloor.detailScenes.length > 0) {
      return activeFloor.detailScenes
    }
    if (activeFloor.detailImage) {
      return [{ image: activeFloor.detailImage, alt: activeFloor.label }]
    }
    return []
  }, [activeFloor])

  // Beim Floor-Wechsel auf erste Szene zurückspringen.
  useEffect(() => {
    setSceneIndex(0)
  }, [activeId])

  const currentScene: DetailScene | null = scenes[sceneIndex] ?? null

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
        ? computeGeom(
            floor,
            stage.clientWidth,
            stage.clientHeight,
            camera.clientWidth,
            camera.clientHeight,
          )
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

  // Cross-Fade des Detail-Layers (gesamter Stack aus aktueller Szene +
  // iframe-Overlay) sobald Szenen für den aktiven Floor existieren. Der
  // Layer liegt AUF Stage-Ebene (nicht in der zoomenden Camera), damit er
  // bei nativer Auflösung scharf bleibt und der iframe nicht doppelt
  // skaliert wird.
  useEffect(() => {
    const detail = detailRef.current
    if (!detail) return
    gsap.killTweensOf(detail)
    if (scenes.length > 0) {
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
  }, [activeFloor, scenes.length, reducedMotion])

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

  const handlePrevScene = useCallback(() => {
    setSceneIndex((i) => (scenes.length === 0 ? 0 : (i - 1 + scenes.length) % scenes.length))
  }, [scenes.length])
  const handleNextScene = useCallback(() => {
    setSceneIndex((i) => (scenes.length === 0 ? 0 : (i + 1) % scenes.length))
  }, [scenes.length])

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

          {/* HOVER-/KLICK-ZONEN über der Camera -- Rechtecke in % der Bild-Maße */}
          <div className={styles.zones} data-overview={isOverview || undefined}>
            {FLOORS.map((floor) => {
              const top = floor.centerY - floor.height / 2
              const left = floor.centerX - floor.width / 2
              // Aufzug und Plaza liegen z-index-mäßig über den Etagen-Zonen,
              // damit ihre schmalen Bereiche bei Overlap (z. B. Aufzug 43-57 %
              // vs. Etagen-Räume bis 50 %) den Hover-Klick gewinnen.
              const zIndex = floor.id === 'elevator' || floor.id === 'plaza' ? 2 : 1
              return (
                <button
                  type="button"
                  key={floor.id}
                  className={styles.zone}
                  style={{
                    top: `${top}%`,
                    left: `${left}%`,
                    height: `${floor.height}%`,
                    width: `${floor.width}%`,
                    zIndex,
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
                  aria-label={`${floor.label} – Zone öffnen`}
                >
                  <span className={styles.zoneHighlight} aria-hidden />
                  <span className={styles.zoneLabel}>
                    <span className={styles.zoneKicker}>{floor.kicker}</span>
                    <span className={styles.zoneTitle}>{floor.label}</span>
                    <ArrowRight size={16} strokeWidth={1.8} aria-hidden />
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/*
          DETAIL-LAYER: Stack aller Szenen + ggf. iframe-Overlay auf einer
          im Foto sichtbaren Bildschirmfläche. Liegt auf Stage-Ebene
          (nicht in der Camera), damit das Bild bei nativer Auflösung
          scharf bleibt und der iframe nicht doppelt skaliert wird.
        */}
        {scenes.length > 0 && (
          <div ref={detailRef} className={styles.detailLayer}>
            {scenes.map((scene, i) => (
              <img
                key={scene.image}
                className={styles.detail}
                src={scene.image}
                alt={scene.alt ?? `Detail: ${activeFloor?.label ?? ''}`}
                draggable={false}
                data-active={i === sceneIndex || undefined}
              />
            ))}
            {currentScene?.screenOverlay && (
              <ScreenOverlay overlay={currentScene.screenOverlay} />
            )}
          </div>
        )}

        {/* SZENEN-NAVIGATION (nur bei > 1 Szene und nicht in Übersicht) */}
        {scenes.length > 1 && !isOverview && (
          <div className={styles.sceneNav} role="group" aria-label="Detail-Szenen">
            <button
              type="button"
              className={styles.sceneNavBtn}
              onClick={handlePrevScene}
              aria-label="Vorheriges Foto"
            >
              <ChevronLeft size={18} strokeWidth={2} />
            </button>
            <div className={styles.sceneDots} aria-hidden>
              {scenes.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={styles.sceneDot}
                  data-active={i === sceneIndex || undefined}
                  onClick={() => setSceneIndex(i)}
                  aria-label={`Foto ${i + 1} von ${scenes.length}`}
                />
              ))}
            </div>
            <button
              type="button"
              className={styles.sceneNavBtn}
              onClick={handleNextScene}
              aria-label="Nächstes Foto"
            >
              <ChevronRight size={18} strokeWidth={2} />
            </button>
          </div>
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

// ─────────────────────────────────────────────────────────────────────────────
// ScreenOverlay: positioniert einen iframe maßstabsgetreu auf einer im Foto
// sichtbaren Bildschirmfläche. Das iframe rendert bei fester 1920×1080-
// Logik und wird per ResizeObserver in den Overlay-Container skaliert,
// sodass das eingebettete Demo komplett ohne eigene Scrollbalken sichtbar
// ist (unabhängig von der tatsächlichen Bildschirm-Größe im Foto).
// ─────────────────────────────────────────────────────────────────────────────

const IFRAME_LOGICAL_W = 1920
const IFRAME_LOGICAL_H = 1080

function ScreenOverlay({
  overlay,
}: {
  overlay: NonNullable<DetailScene['screenOverlay']>
}): React.ReactElement {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  useLayoutEffect(() => {
    const wrapper = wrapperRef.current
    const iframe = iframeRef.current
    if (!wrapper || !iframe) return
    const updateScale = () => {
      const w = wrapper.clientWidth
      const h = wrapper.clientHeight
      if (w <= 0 || h <= 0) return
      const scale = Math.min(w / IFRAME_LOGICAL_W, h / IFRAME_LOGICAL_H)
      iframe.style.transform = `translate(-50%, -50%) scale(${scale})`
    }
    updateScale()
    const ro = new ResizeObserver(updateScale)
    ro.observe(wrapper)
    window.addEventListener('resize', updateScale)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', updateScale)
    }
  }, [])
  return (
    <div
      ref={wrapperRef}
      className={styles.screenOverlay}
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
        style={{
          width: `${IFRAME_LOGICAL_W}px`,
          height: `${IFRAME_LOGICAL_H}px`,
        }}
        src={overlay.url}
        title={overlay.title}
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      />
    </div>
  )
}
