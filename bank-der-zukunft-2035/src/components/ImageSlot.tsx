import { useEffect, useState } from 'react'
import { ImageOff } from 'lucide-react'
import styles from './ImageSlot.module.css'

// ─────────────────────────────────────────────────────────────────────────────
// ImageSlot — rendert ein Bild und degradiert sauber, wenn die Datei (noch)
// fehlt. Die 29 Firefly-Bilder werden separat erzeugt und unter public/
// abgelegt; solange ein Slot leer ist (leerer src oder Lade-Fehler), zeigt
// die Komponente einen ruhigen Platzhalter mit Kapitel-/Szenen-Label und
// dem erwarteten Dateinamen — so ist die App jederzeit vorführbar und es ist
// glasklar, welche Datei wohin gehört.
// ─────────────────────────────────────────────────────────────────────────────

type ImageSlotProps = {
  src: string
  alt: string
  className?: string
  /** Bild-Skalierung innerhalb des Slots. */
  fit?: 'cover' | 'contain'
  /** Kicker-Zeile im Platzhalter, z. B. „Kapitel 01 · Hypothese 1". */
  label?: string
  /** Titel-Zeile im Platzhalter. */
  caption?: string
}

export function ImageSlot({
  src,
  alt,
  className,
  fit = 'cover',
  label,
  caption,
}: ImageSlotProps): React.ReactElement {
  const [errored, setErrored] = useState(false)

  // Beim src-Wechsel den Fehlerzustand zurücksetzen, damit ein neu gesetzter
  // (vorhandener) Pfad wieder versucht wird.
  useEffect(() => {
    setErrored(false)
  }, [src])

  const missing = src.trim() === '' || errored
  const filename = src.split('/').pop() || src

  return (
    <div
      className={[styles.slot, className].filter(Boolean).join(' ')}
      data-missing={missing || undefined}
    >
      {!missing && (
        <img
          className={styles.img}
          src={src}
          alt={alt}
          draggable={false}
          style={{ objectFit: fit }}
          onError={() => setErrored(true)}
        />
      )}
      {missing && (
        <div className={styles.placeholder} role="img" aria-label={alt}>
          <span className={styles.phIcon} aria-hidden>
            <ImageOff size={26} strokeWidth={1.6} />
          </span>
          {label && <span className={styles.phLabel}>{label}</span>}
          {caption && <span className={styles.phCaption}>{caption}</span>}
          <code className={styles.phFile}>{filename}</code>
          <span className={styles.phHint}>Bild-Slot frei · Datei unter public/ ablegen</span>
        </div>
      )}
    </div>
  )
}
