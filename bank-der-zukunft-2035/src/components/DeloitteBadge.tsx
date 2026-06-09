import { useState } from 'react'
import styles from './DeloitteBadge.module.css'

// ─────────────────────────────────────────────────────────────────────────────
// DeloitteBadge — „Deloitte Demo"-Lockup oben links. Echtes Logo via logo.dev
// (öffentlicher Publishable-Key, identisch zu den übrigen Repo-Apps), auf einem
// weißen Tile, damit die dunkle Wortmarke auf dunklem Hintergrund lesbar bleibt.
// Fällt logo.dev aus, greift ein Wortmarken-Fallback („Deloitte.").
// ─────────────────────────────────────────────────────────────────────────────

const LOGO_TOKEN = 'pk_H7vb5Y2lTsW47U4Xq-w3HA'
const DELOITTE_LOGO = `https://img.logo.dev/deloitte.com?token=${LOGO_TOKEN}&format=png&size=240&retina=true`

export function DeloitteBadge(): React.ReactElement {
  const [failed, setFailed] = useState(false)
  return (
    <div className={styles.badge} aria-label="Deloitte Demo">
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
      <span className={styles.demo}>Demo</span>
    </div>
  )
}
