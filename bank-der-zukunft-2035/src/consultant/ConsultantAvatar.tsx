import { Component, Suspense, lazy, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Lightbulb, MessageCircle, X } from 'lucide-react'
import styles from './ConsultantAvatar.module.css'
import { CONSULTANT_MODEL_URL } from './consultantConfig'
import { useReducedMotion } from '../hooks/useReducedMotion'

// three.js/react-three-fiber nur bei vorhandenem Modell nachladen (Code-Split).
const ConsultantCanvas = lazy(() =>
  import('./ConsultantCanvas').then((m) => ({ default: m.ConsultantCanvas })),
)

// ─────────────────────────────────────────────────────────────────────────────
// ConsultantAvatar — der "Karl-Klammer"-Leitfragen-Consultant unten rechts.
//
// Poppt auf, sobald der aktuelle Schritt eine Leitfrage hat, und zeigt sie in
// einer Sprechblase. Rendert den geriggten 3D-Avatar (Meshy-GLB), sofern das
// Modell vorliegt — andernfalls eine hochwertige 2D-SVG-Silhouette. So bleibt
// die App auch ohne generiertes Modell voll funktionsfähig.
// ─────────────────────────────────────────────────────────────────────────────

type ModelState = 'checking' | 'present' | 'absent'

type ConsultantAvatarProps = {
  /** Aktuelle Leitfrage; leer/undefined blendet den Consultant aus. */
  leitfrage: string
  /** Beschriftung "Leitfrage" / "Guiding question". */
  label: string
  /** Kontext-Zeile über der Frage (z. B. "Kapitel 01 · Hypothese 2"). */
  context?: string
  /** Aria-Label für den Öffnen-Button. */
  openLabel: string
  /** Aria-Label für den Schließen-Button. */
  closeLabel: string
}

export function ConsultantAvatar({
  leitfrage,
  label,
  context,
  openLabel,
  closeLabel,
}: ConsultantAvatarProps): React.ReactElement | null {
  const reducedMotion = useReducedMotion()
  const [modelState, setModelState] = useState<ModelState>('checking')
  const [open, setOpen] = useState(false)
  const enterTimer = useRef<number | null>(null)

  // Modell-Verfügbarkeit einmalig prüfen, damit useGLTF nicht auf eine fehlende
  // Datei läuft. Achtung: SPA-Hosts (Cloudflare Pages, vite preview) liefern für
  // fehlende Dateien den index.html-Fallback mit HTTP 200 — daher NICHT nur auf
  // r.ok prüfen, sondern HTML-Antworten explizit als "kein Modell" behandeln.
  useEffect(() => {
    let alive = true
    fetch(CONSULTANT_MODEL_URL, { method: 'HEAD' })
      .then((r) => {
        const ct = r.headers.get('content-type') ?? ''
        const present = r.ok && !ct.includes('text/html')
        if (alive) setModelState(present ? 'present' : 'absent')
      })
      .catch(() => alive && setModelState('absent'))
    return () => {
      alive = false
    }
  }, [])

  // Bei neuer Leitfrage: Sprechblase automatisch öffnen (nach kurzer Auftauch-
  // verzögerung). Ohne Leitfrage: geschlossen.
  const hasLeitfrage = leitfrage.trim().length > 0
  useEffect(() => {
    if (enterTimer.current) window.clearTimeout(enterTimer.current)
    if (!hasLeitfrage) {
      setOpen(false)
      return
    }
    enterTimer.current = window.setTimeout(() => setOpen(true), reducedMotion ? 0 : 480)
    return () => {
      if (enterTimer.current) window.clearTimeout(enterTimer.current)
    }
  }, [leitfrage, hasLeitfrage, reducedMotion])

  const avatarVisual = useMemo(() => {
    if (modelState === 'present') {
      return (
        <Avatar3DBoundary fallback={<Consultant2D reducedMotion={reducedMotion} />}>
          <Suspense fallback={<Consultant2D reducedMotion={reducedMotion} />}>
            <ConsultantCanvas speaking={open} reducedMotion={reducedMotion} />
          </Suspense>
        </Avatar3DBoundary>
      )
    }
    return <Consultant2D reducedMotion={reducedMotion} />
  }, [modelState, open, reducedMotion])

  if (!hasLeitfrage) return null

  return (
    <div className={styles.dock} data-open={open || undefined}>
      {open && (
        <div className={styles.bubble} role="status">
          <div className={styles.bubbleHead}>
            <span className={styles.bubbleTag}>
              <Lightbulb size={13} strokeWidth={2.2} aria-hidden />
              {label}
            </span>
            <button
              type="button"
              className={styles.bubbleClose}
              onClick={() => setOpen(false)}
              aria-label={closeLabel}
            >
              <X size={15} strokeWidth={2.2} aria-hidden />
            </button>
          </div>
          {context && <span className={styles.bubbleContext}>{context}</span>}
          <p className={styles.bubbleText}>{leitfrage}</p>
          <span className={styles.bubbleTail} aria-hidden />
        </div>
      )}

      <button
        type="button"
        className={styles.avatarBtn}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? closeLabel : openLabel}
        aria-expanded={open}
        data-motion={reducedMotion ? undefined : 'on'}
      >
        <span className={styles.avatarStage}>{avatarVisual}</span>
        {!open && (
          <span className={styles.avatarPing} aria-hidden>
            <MessageCircle size={14} strokeWidth={2.4} />
          </span>
        )}
      </button>
    </div>
  )
}

// Fängt jeden Fehler beim Laden/Parsen des 3D-Modells (z. B. fehlerhaftes GLB
// oder ein als GLB missverstandener HTML-Fallback) ab und zeigt statt eines
// Absturzes die 2D-Silhouette. So kann der Consultant die App nie blockieren.
class Avatar3DBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true }
  }
  componentDidCatch(error: unknown): void {
    console.warn('Consultant-3D konnte nicht geladen werden, nutze 2D-Fallback.', error)
  }
  render(): ReactNode {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

// Hochwertige einfarbige 2D-Silhouette (Berater-Büste) als Fallback und als
// Suspense-Platzhalter während das GLB lädt. Keine Emojis, nur eine Farbe.
function Consultant2D({ reducedMotion }: { reducedMotion: boolean }): React.ReactElement {
  return (
    <span className={styles.svg2d} data-motion={reducedMotion ? undefined : 'on'} aria-hidden>
      <svg viewBox="0 0 96 96" width="100%" height="100%">
        <defs>
          <clipPath id="consultant-circle">
            <circle cx="48" cy="48" r="46" />
          </clipPath>
        </defs>
        <g clipPath="url(#consultant-circle)">
          <rect x="0" y="0" width="96" height="96" fill="var(--accent)" />
          {/* Schultern / Sakko */}
          <path
            d="M14 96 C16 74 30 64 48 64 C66 64 80 74 82 96 Z"
            fill="rgba(255,255,255,0.16)"
          />
          {/* Kragen / Revers */}
          <path d="M40 66 L48 82 L56 66 L48 72 Z" fill="rgba(255,255,255,0.9)" />
          {/* Kopf */}
          <circle cx="48" cy="40" r="17" fill="rgba(255,255,255,0.92)" />
          {/* Haaransatz */}
          <path
            d="M31 38 C31 26 41 22 48 22 C55 22 65 26 65 38 C60 31 54 29 48 29 C42 29 36 31 31 38 Z"
            fill="rgba(4,106,56,0.85)"
          />
        </g>
        <circle cx="48" cy="48" r="45" fill="none" stroke="var(--accent-bright)" strokeWidth="2" />
      </svg>
    </span>
  )
}
