import { useEffect, useRef, useState } from 'react'
import { Lightbulb, MessageCircle, X } from 'lucide-react'
import styles from './ConsultantAvatar.module.css'
import { useReducedMotion } from '../hooks/useReducedMotion'

// ─────────────────────────────────────────────────────────────────────────────
// ConsultantAvatar — der "Karl-Klammer"-Leitfragen-Consultant unten rechts.
//
// Poppt auf, sobald der aktuelle Schritt eine Leitfrage hat, und zeigt sie in
// einer Sprechblase. Der Avatar ist ein einfarbiger, ikonischer Berater-Mascot
// (SVG) — bei jeder Größe scharf lesbar, dezent animiert (Idle-Schweben,
// „spricht"-Sprechwellen). Bewusst kein 3D/Foto: eine realistische Figur ist im
// ~100-px-Chip nicht erkennbar, ein Icon liest sich sofort. Passt zu den
// Design-Regeln: eine Farbe, keine Emojis, keine Verläufe im Icon selbst.
// ─────────────────────────────────────────────────────────────────────────────

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
  const [open, setOpen] = useState(false)
  const enterTimer = useRef<number | null>(null)

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
        <span className={styles.avatarStage}>
          <ConsultantMascot speaking={open} reducedMotion={reducedMotion} />
        </span>
        {!open && (
          <span className={styles.avatarPing} aria-hidden>
            <MessageCircle size={14} strokeWidth={2.4} />
          </span>
        )}
      </button>
    </div>
  )
}

// Einfarbiger Berater-Mascot als SVG. Die Figur ist genau EINE Farbe
// (var(--accent)); Augen, Lächeln und Hemdkragen sind Aussparungen (Maske), durch
// die der helle Kreis-Hintergrund der .avatarStage scheint — kein zweiter
// Farbwert. Beim Sprechen erscheinen dezente Schallwellen neben dem Kopf.
function ConsultantMascot({
  speaking,
  reducedMotion,
}: {
  speaking: boolean
  reducedMotion: boolean
}): React.ReactElement {
  return (
    <span
      className={styles.mascot}
      data-motion={reducedMotion ? undefined : 'on'}
      data-speaking={speaking || undefined}
      aria-hidden
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <defs>
          <mask id="consultant-mascot-cut">
            <rect width="100" height="100" fill="#fff" />
            {/* Augen */}
            <circle cx="43.5" cy="40" r="2.5" fill="#000" />
            <circle cx="56.5" cy="40" r="2.5" fill="#000" />
            {/* Lächeln */}
            <path
              d="M43.5 47 Q50 52 56.5 47"
              stroke="#000"
              strokeWidth="2.4"
              fill="none"
              strokeLinecap="round"
            />
            {/* Hemdkragen (V-Aussparung) */}
            <path d="M50 61 L41.5 68 Q50 72.5 58.5 68 Z" fill="#000" />
          </mask>
        </defs>

        <g fill="var(--accent)" mask="url(#consultant-mascot-cut)">
          {/* Kopf + Kurzhaar als eine glatte Silhouette */}
          <path d="M31.5 39 C31.5 22 39 14 50 14 C61 14 68.5 22 68.5 39 C68.5 49 60.5 57 50 57 C39.5 57 31.5 49 31.5 39 Z" />
          {/* Hals */}
          <rect x="43" y="50" width="14" height="12" rx="4.5" />
          {/* Schultern / Sakko */}
          <path d="M15 96 C15 73 32 63 50 63 C68 63 85 73 85 96 Z" />
        </g>

        {/* Krawatte (grün, in der Kragen-Aussparung) */}
        <path d="M50 62 L45.5 69 L50 86 L54.5 69 Z" fill="var(--accent)" />

        {/* Sprechwellen — nur im „spricht"-Zustand sichtbar */}
        <g
          className={styles.mascotWaves}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.4"
          strokeLinecap="round"
        >
          <path d="M75 33 Q79 40 75 47" />
          <path d="M81 29 Q88 40 81 51" />
        </g>
      </svg>
    </span>
  )
}
