import styles from './Plaza.module.css'

type PlazaProps = {
  side: 'left' | 'right'
}

/**
 * Andeutung des Außenbereichs: ein Pflasterband mit ein paar Kunden-
 * Silhouetten und einer Pflanze. Bewusst minimalistisch -- die Bank
 * im Querschnitt bleibt der Held.
 */
export function Plaza({ side }: PlazaProps): React.ReactElement {
  return (
    <div className={styles.plaza} data-side={side} aria-hidden>
      <div className={styles.ground} />
      <div className={styles.figures}>
        {side === 'left' ? (
          <>
            <PersonSilhouette variant="standing" tone="dark" />
            <PersonSilhouette variant="walking" tone="mid" offsetX={36} />
            <PlantSilhouette offsetX={88} />
          </>
        ) : (
          <>
            <PlantSilhouette offsetX={4} mirror />
            <PersonSilhouette variant="walking" tone="dark" offsetX={32} mirror />
            <PersonSilhouette variant="bag" tone="mid" offsetX={70} mirror />
          </>
        )}
      </div>
    </div>
  )
}

function PersonSilhouette({
  variant,
  tone,
  offsetX = 0,
  mirror,
}: {
  variant: 'standing' | 'walking' | 'bag'
  tone: 'dark' | 'mid'
  offsetX?: number
  mirror?: boolean
}): React.ReactElement {
  const fill = tone === 'dark' ? '#3A3A38' : '#6B6963'
  return (
    <svg
      className={styles.fig}
      style={{ left: `${offsetX}%`, transform: mirror ? 'scaleX(-1)' : undefined }}
      viewBox="0 0 36 90"
      width={28}
      height={70}
    >
      {variant === 'standing' && (
        <g fill={fill}>
          <ellipse cx="18" cy="8" rx="5.4" ry="6.2" />
          <path d="M11 16 L25 16 Q27 34 24 50 L22 60 L20 90 L16 90 L14 60 L13 50 Q9 34 11 16 Z" />
        </g>
      )}
      {variant === 'walking' && (
        <g fill={fill}>
          <ellipse cx="18" cy="9" rx="5.2" ry="6" />
          <path d="M12 17 L24 17 Q28 33 24 48 L22 56 L26 88 L22 88 L18 60 L14 88 L10 88 L14 56 L12 48 Q8 33 12 17 Z" />
        </g>
      )}
      {variant === 'bag' && (
        <g fill={fill}>
          <ellipse cx="18" cy="9" rx="5.4" ry="6.2" />
          <path d="M11 17 L25 17 Q27 35 24 50 L22 60 L20 90 L16 90 L14 60 L13 50 Q9 35 11 17 Z" />
          <rect x="25" y="38" width="6" height="9" rx="1" fill="#8B6A3F" />
          <path d="M27 38 V34 H29 V38" stroke="#8B6A3F" strokeWidth="1.2" fill="none" />
        </g>
      )}
    </svg>
  )
}

function PlantSilhouette({
  offsetX = 0,
  mirror,
}: {
  offsetX?: number
  mirror?: boolean
}): React.ReactElement {
  return (
    <svg
      className={styles.plant}
      style={{ left: `${offsetX}%`, transform: mirror ? 'scaleX(-1)' : undefined }}
      viewBox="0 0 40 70"
      width={32}
      height={58}
    >
      <rect x="13" y="48" width="14" height="14" rx="1.5" fill="#5C4632" />
      <path
        d="M20 48 C 6 38, 6 22, 16 14 C 18 24, 20 30, 20 48 Z"
        fill="#3F5B3E"
        opacity="0.92"
      />
      <path
        d="M20 48 C 34 36, 32 18, 24 12 C 22 22, 20 30, 20 48 Z"
        fill="#557958"
        opacity="0.85"
      />
      <path
        d="M20 48 C 22 36, 20 22, 20 8 C 18 22, 18 36, 20 48 Z"
        fill="#456446"
        opacity="0.85"
      />
    </svg>
  )
}
