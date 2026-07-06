import { useEffect, useRef, useState } from 'react'
import { Lightbulb, MessageCircle, X } from 'lucide-react'
import styles from './ConsultantAvatar.module.css'
import { useReducedMotion } from '../hooks/useReducedMotion'
import avatarUrl from './leitfragen-avatar.png'

// ─────────────────────────────────────────────────────────────────────────────
// ConsultantAvatar — der "Karl-Klammer"-Leitfragen-Consultant unten rechts.
//
// Poppt auf, sobald der aktuelle Schritt eine Leitfrage hat, und zeigt sie in
// einer Sprechblase. Der Avatar ist eine Senior-Consultant-Figur (Deloitte) als
// gerendertes Bild im runden Chip, dezent animiert (Idle-Schweben). Bewusste,
// vom Nutzer freigegebene Ausnahme von der „nur einfarbige Icons"-Regel: hier
// trägt ein hochwertiges Avatar-Bild die Persona besser als ein Icon.
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
          <img
            className={styles.avatarImg}
            src={avatarUrl}
            alt=""
            aria-hidden
            draggable={false}
            data-motion={reducedMotion ? undefined : 'on'}
          />
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

