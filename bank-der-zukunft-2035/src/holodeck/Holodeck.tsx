import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import {
  ArrowLeft,
  Bot,
  ChevronLeft,
  ChevronRight,
  Compass,
  GraduationCap,
  ImageOff,
  Info,
  Plus,
  Target,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'
import styles from './Holodeck.module.css'
import { DebugZoneEditor } from './DebugZoneEditor'
import { useReducedMotion } from '../hooks/useReducedMotion'
import {
  ANKER,
  AREAS,
  AREA_ORDER,
  BRIDGE,
  OUTRO,
  ZONES,
  getArea,
  type AreaId,
  type Zone,
} from './data'

// ─────────────────────────────────────────────────────────────────────────────
// Holodeck — EDEKABANK Kommandobrücke 2031.
//
// Overview: Ankerbild der Brücke + fünf Hotspots; rechts „Die Brücke" + Liste.
// Klick auf eine Station → GSAP-Kameraflug (Zoom auf die Zone, Crossfade) →
// Deep-Dive (Bild links, vier Felder rechts). Outro: „Die Führungsfrage".
// Debug-Zonen-Editor (Taste „D" / ?debug) zum Kalibrieren am echten Ankerbild.
// ─────────────────────────────────────────────────────────────────────────────

const ZOOM_SCALE = 2.4
const ZOOM_DURATION = 0.8

// Icon je Deep-Dive-Feld (nach dem Feld-Label aus data.ts).
const FIELD_ICONS: Record<string, LucideIcon> = {
  Mandat: Target,
  Skills: GraduationCap,
  'Zielbild Automatisierung': Bot,
  'Delta zu heute': TrendingUp,
}

type Mode = 'overview' | 'flying-in' | 'deepdive' | 'flying-out' | 'outro'

type Props = {
  /** Zurück zur Chatbot-Landing. */
  onExit?: () => void
}

export function Holodeck({ onExit }: Props): React.ReactElement {
  const reducedMotion = useReducedMotion()
  const anchorRef = useRef<HTMLDivElement>(null)
  const deepRef = useRef<HTMLDivElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  const [mode, setMode] = useState<Mode>('overview')
  const [areaId, setAreaId] = useState<AreaId | null>(null)
  const [flying, setFlying] = useState(false)
  const [zones, setZones] = useState<Record<AreaId, Zone>>(ZONES)
  const [debug, setDebug] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).has('debug')
    } catch {
      return false
    }
  })
  const [anchorError, setAnchorError] = useState(false)
  const [deepError, setDeepError] = useState(false)

  const isOverview = mode === 'overview'

  // ── Kameraflug hinein (overview → deepdive) ────────────────────────────────
  useEffect(() => {
    if (mode !== 'flying-in' || !areaId) return
    const anchor = anchorRef.current
    const deep = deepRef.current
    if (!anchor || !deep) {
      setMode('deepdive')
      return
    }
    const zone = zones[areaId]
    setFlying(true)
    anchor.style.transformOrigin = `${zone.x}% ${zone.y}%`
    const tl = gsap.timeline({
      onComplete: () => {
        setMode('deepdive')
        setFlying(false)
      },
    })
    tl.to(anchor, { scale: ZOOM_SCALE, opacity: 0, duration: ZOOM_DURATION, ease: 'power2.inOut' })
    tl.fromTo(
      deep,
      { opacity: 0, scale: 1.05 },
      { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' },
      '-=0.15',
    )
    tlRef.current = tl
    return () => {
      tl.kill()
    }
  }, [mode, areaId, zones])

  // ── Kameraflug heraus (deepdive → overview) ────────────────────────────────
  useEffect(() => {
    if (mode !== 'flying-out') return
    const anchor = anchorRef.current
    const deep = deepRef.current
    if (!anchor || !deep) {
      setMode('overview')
      setAreaId(null)
      return
    }
    setFlying(true)
    const tl = gsap.timeline({
      onComplete: () => {
        setMode('overview')
        setAreaId(null)
        setFlying(false)
      },
    })
    tl.to(deep, { opacity: 0, scale: 1.05, duration: 0.4, ease: 'power2.in' })
    tl.to(anchor, { scale: 1, opacity: 1, duration: 0.7, ease: 'power2.inOut' }, '-=0.1')
    tlRef.current = tl
    return () => {
      tl.kill()
    }
  }, [mode])

  useEffect(
    () => () => {
      tlRef.current?.kill()
    },
    [],
  )

  const openArea = useCallback(
    (id: AreaId) => {
      if (flying) return
      setDeepError(false)
      setAreaId(id)
      if (reducedMotion) {
        gsap.set(anchorRef.current, { opacity: 0 })
        gsap.set(deepRef.current, { opacity: 1, scale: 1 })
        setMode('deepdive')
        return
      }
      setMode('flying-in')
    },
    [flying, reducedMotion],
  )

  const goOverview = useCallback(() => {
    if (flying) return
    if (reducedMotion) {
      gsap.set(deepRef.current, { opacity: 0 })
      gsap.set(anchorRef.current, { opacity: 1, scale: 1 })
      setMode('overview')
      setAreaId(null)
      return
    }
    setMode('flying-out')
  }, [flying, reducedMotion])

  const gotoAdjacent = useCallback(
    (dir: 1 | -1) => {
      if (mode !== 'deepdive' || !areaId) return
      const idx = AREA_ORDER.indexOf(areaId)
      const next = AREA_ORDER[(idx + dir + AREA_ORDER.length) % AREA_ORDER.length]
      if (!next) return
      setDeepError(false)
      setAreaId(next)
      if (!reducedMotion) {
        gsap.fromTo(deepRef.current, { opacity: 0.35 }, { opacity: 1, duration: 0.3, ease: 'power1.out' })
      }
    },
    [mode, areaId, reducedMotion],
  )

  // ── Tastatursteuerung ──────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'd' || e.key === 'D') {
        setDebug((d) => !d)
        return
      }
      if (e.key === 'Escape') {
        if (mode === 'outro') setMode('overview')
        else if (mode === 'deepdive') goOverview()
        return
      }
      if (mode === 'deepdive') {
        if (e.key === 'ArrowLeft') gotoAdjacent(-1)
        else if (e.key === 'ArrowRight') gotoAdjacent(1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mode, goOverview, gotoAdjacent])

  const area = areaId ? getArea(areaId) : null
  const showDeepPanel = mode === 'deepdive'

  return (
    <div className={styles.root}>
      <div className={styles.topbar}>
        {onExit && (
          <button type="button" className={styles.backBtn} onClick={onExit}>
            <ArrowLeft size={16} strokeWidth={2} aria-hidden /> Zurück zum Chat
          </button>
        )}
        <span className={styles.wordmark}>
          EDEKA<span>BANK</span> · Holodeck 2031
        </span>
        <span className={styles.topSpacer} />
        <span className={styles.debugHint}>
          <kbd>D</kbd> Zonen justieren
        </span>
      </div>

      <div className={styles.layout}>
        {/* ── Bühne (links) ── */}
        <div className={styles.stage}>
          <div className={styles.anchorWrap} ref={anchorRef}>
            {anchorError ? (
              <div className={styles.placeholder}>
                <ImageOff size={28} strokeWidth={1.5} aria-hidden />
                <span>Ankerbild fehlt</span>
                <code>{ANKER.src.split('/').pop()}</code>
              </div>
            ) : (
              <img
                className={styles.media}
                src={ANKER.src}
                alt={ANKER.alt}
                draggable={false}
                onError={() => setAnchorError(true)}
              />
            )}

            {/* Hotspots nur in der Übersicht (nicht während Flug/Debug) */}
            {isOverview && !debug && (
              <div className={styles.hotspots}>
                {AREAS.map((a) => {
                  const z = zones[a.id]
                  return (
                    <button
                      type="button"
                      key={a.id}
                      className={styles.hotspot}
                      style={{ left: `${z.x}%`, top: `${z.y}%`, width: `${z.r * 2}%` }}
                      onClick={() => openArea(a.id)}
                      aria-label={`Station ${a.label} öffnen`}
                    >
                      <span className={styles.hotMarker} aria-hidden>
                        <Plus size={20} strokeWidth={2.4} />
                      </span>
                      <span className={styles.hotTip}>{a.label}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Deep-Dive-Bild (über dem Anker) */}
          {area && (
            <div className={styles.deepWrap} ref={deepRef} data-active={showDeepPanel || undefined}>
              {deepError ? (
                <div className={styles.placeholder}>
                  <ImageOff size={28} strokeWidth={1.5} aria-hidden />
                  <span>Deep-Dive-Bild fehlt</span>
                  <code>{area.image.split('/').pop()}</code>
                </div>
              ) : (
                <img
                  className={styles.media}
                  src={area.image}
                  alt={area.alt}
                  draggable={false}
                  onError={() => setDeepError(true)}
                />
              )}
            </div>
          )}

          {/* Debug-Zonen-Editor */}
          {debug && (
            <DebugZoneEditor zones={zones} onChange={setZones} onClose={() => setDebug(false)} />
          )}
        </div>

        {/* ── Textspalte (rechts) ── */}
        <aside className={styles.side}>
          {showDeepPanel && area ? (
            <>
              <div className={styles.deepHead}>
                <div className={styles.deepScreen}>{area.screenTitle}</div>
                <div className={styles.deepPersona}>{area.persona}</div>
                <div className={styles.deepRole}>
                  {area.label} · {area.role}
                </div>
              </div>
              <div className={styles.fieldList}>
                {area.fields.map((f) => {
                  const Icon = FIELD_ICONS[f.label] ?? Info
                  return (
                    <div className={styles.field} key={f.label}>
                      <div className={styles.fieldLabel}>
                        <Icon size={19} strokeWidth={2} aria-hidden />
                        {f.label}
                      </div>
                      <div className={styles.fieldText}>{f.text}</div>
                    </div>
                  )
                })}
              </div>
              <div className={styles.navRow}>
                <button type="button" className={styles.navBtn} onClick={goOverview}>
                  <ArrowLeft size={15} strokeWidth={2} aria-hidden /> Brücke
                </button>
                <span className={styles.navSpacer} />
                <button
                  type="button"
                  className={styles.navBtn}
                  onClick={() => gotoAdjacent(-1)}
                  aria-label="Vorheriger Bereich"
                >
                  <ChevronLeft size={15} strokeWidth={2} aria-hidden /> Zurück
                </button>
                <button
                  type="button"
                  className={`${styles.navBtn} ${styles.navBtnPrimary}`}
                  onClick={() => gotoAdjacent(1)}
                  aria-label="Nächster Bereich"
                >
                  Weiter <ChevronRight size={15} strokeWidth={2} aria-hidden />
                </button>
              </div>
            </>
          ) : (
            <>
              <div className={styles.kicker}>Kommandobrücke</div>
              <h1 className={styles.brandTitle}>{BRIDGE.title}</h1>

              <div className={styles.block}>
                <div className={styles.blockLabel}>These</div>
                <p className={styles.these}>{BRIDGE.these}</p>
              </div>
              <div className={styles.block}>
                <div className={styles.blockLabel}>Leitfrage</div>
                <p className={styles.leitfrage}>{BRIDGE.leitfrage}</p>
              </div>

              <div className={styles.areaListLabel}>Die fünf Stationen</div>
              <div className={styles.areaList}>
                {AREAS.map((a, i) => (
                  <button
                    type="button"
                    key={a.id}
                    className={styles.areaItem}
                    onClick={() => openArea(a.id)}
                    disabled={flying}
                  >
                    <span className={styles.areaNum}>{i + 1}</span>
                    <span className={styles.areaMeta}>
                      <span className={styles.areaName}>{a.label}</span>
                      <span className={styles.areaScreen}>
                        {a.persona} · {a.screenTitle}
                      </span>
                    </span>
                    <ChevronRight size={16} strokeWidth={2} className={styles.areaArrow} aria-hidden />
                  </button>
                ))}
              </div>

              <button type="button" className={styles.outroEntry} onClick={() => setMode('outro')}>
                <Compass size={16} strokeWidth={2} aria-hidden /> Die Führungsfrage
              </button>
            </>
          )}
        </aside>
      </div>

      {/* ── Outro ── */}
      {mode === 'outro' && (
        <div className={styles.outro} role="dialog" aria-modal="true" aria-label={OUTRO.title}>
          <div className={styles.outroCard}>
            <div className={styles.kicker}>Abschluss</div>
            <h2 className={styles.outroTitle}>{OUTRO.title}</h2>
            <div className={styles.outroBlock}>
              <div className={styles.blockLabel}>Strukturthese</div>
              {OUTRO.strukturthese}
            </div>
            <div className={styles.outroBlock}>
              <div className={styles.blockLabel}>Entscheidung</div>
              {OUTRO.entscheidung}
            </div>
            <button type="button" className={styles.navBtn} onClick={() => setMode('overview')}>
              <ArrowLeft size={15} strokeWidth={2} aria-hidden /> Zurück zur Brücke
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
