import styles from './Donut.module.css'

type DonutProps = {
  /** Wert 0..1 */
  value: number
  label: string
  display: string
  size?: number
  trackColor?: string
  fillColor?: string
}

export function Donut({
  value,
  label,
  display,
  size = 84,
  trackColor = 'rgba(33, 33, 33, 0.1)',
  fillColor = '#046A38',
}: DonutProps): React.ReactElement {
  const stroke = size * 0.12
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(1, value))
  const dash = circumference * clamped
  const gap = circumference - dash

  return (
    <div className={styles.wrap} style={{ width: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={fillColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${gap}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dasharray 600ms cubic-bezier(0.22,0.61,0.36,1)' }}
        />
      </svg>
      <div className={styles.center}>
        <span className={styles.value}>{display}</span>
        <span className={styles.label}>{label}</span>
      </div>
    </div>
  )
}
