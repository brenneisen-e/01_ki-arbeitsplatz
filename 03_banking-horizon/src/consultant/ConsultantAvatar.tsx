import { useEffect, useState } from 'react'
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
  /** Badge-Text, der auf eine neue Leitfrage hinweist. */
  newLabel: string
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
  newLabel,
  context,
  openLabel,
  closeLabel,
}: ConsultantAvatarProps): React.ReactElement | null {
  const reducedMotion = useReducedMotion()
  const [open, setOpen] = useState(false)
  // Ob die aktuelle Leitfrage noch ungelesen ist (steuert das „Neu"-Badge).
  const [unread, setUnread] = useState(false)

  // Bei neuer Leitfrage NICHT automatisch aufklappen, sondern nur als „neu"
  // markieren — der Nutzer öffnet die Blase per Klick auf den Avatar/das Badge.
  const hasLeitfrage = leitfrage.trim().length > 0
  useEffect(() => {
    setOpen(false)
    setUnread(hasLeitfrage)
  }, [leitfrage, hasLeitfrage])

  if (!hasLeitfrage) return null

  // Öffnen/Schließen; beim Öffnen ist die Frage gelesen -> Badge verschwindet.
  const toggle = () => {
    setOpen((v) => {
      const next = !v
      if (next) setUnread(false)
      return next
    })
  }

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

      {/* Badge „Neue Leitfrage": weist auf eine noch ungelesene Frage hin. Klick
          öffnet die Blase (wie auf dem Avatar). Ist die Frage gelesen, bleibt nur
          ein dezenter Punkt als Wiederöffnen-Hinweis. */}
      {!open && unread && (
        <button
          type="button"
          className={styles.newBadge}
          onClick={toggle}
          data-motion={reducedMotion ? undefined : 'on'}
        >
          <Lightbulb size={14} strokeWidth={2.4} aria-hidden />
          {newLabel}
        </button>
      )}

      <button
        type="button"
        className={styles.avatarBtn}
        onClick={toggle}
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
          <span
            className={styles.avatarPing}
            data-unread={unread || undefined}
            aria-hidden
          >
            <MessageCircle size={14} strokeWidth={2.4} />
          </span>
        )}
      </button>
    </div>
  )
}

