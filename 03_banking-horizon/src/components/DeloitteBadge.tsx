import { useState } from 'react'
import styles from './DeloitteBadge.module.css'

// ─────────────────────────────────────────────────────────────────────────────
// DeloitteBadge — Deloitte-Wortmarke oben links (ohne Zusatz). Echtes Logo via
// logo.dev (öffentlicher Publishable-Key, identisch zu den übrigen Repo-Apps),
// auf einem weißen Tile, damit die dunkle Wortmarke auf dunklem Hintergrund
// lesbar bleibt. Fällt logo.dev aus, greift ein Wortmarken-Fallback („Deloitte.").
// Mit `onClick` wird die Marke zum unauffälligen Knopf (öffnet im Strukturbild
// das Notizfenster mit den Speakernotes, ohne sichtbaren Hinweis).
// ─────────────────────────────────────────────────────────────────────────────

const LOGO_TOKEN = 'pk_H7vb5Y2lTsW47U4Xq-w3HA'
const DELOITTE_LOGO = `https://img.logo.dev/deloitte.com?token=${LOGO_TOKEN}&format=png&size=240&retina=true`

type Props = { onClick?: () => void; title?: string }

export function DeloitteBadge({ onClick, title }: Props = {}): React.ReactElement {
  const [failed, setFailed] = useState(false)
  const inhalt = (
    <span className={styles.tile}>
        {failed ? (
          <span className={styles.fallback}>
            Deloitte<span className={styles.dot}>.</span>
          </span>
        ) : (
          <img
            className={styles.logo}
            src={DELOITTE_LOGO}
            alt="Deloitte"
            width={120}
            height={28}
            onError={() => setFailed(true)}
          />
        )}
      </span>
  )
  if (onClick) {
    return (
      <button type="button" className={styles.badge} data-klickbar onClick={onClick} aria-label={title ?? 'Deloitte'} title={title}>
        {inhalt}
      </button>
    )
  }
  return (
    <div className={styles.badge} aria-label="Deloitte">
      {inhalt}
    </div>
  )
}
