import { useEffect, useMemo, useState } from 'react'
import styles from './MiniLine.module.css'

type MiniLineProps = {
  /** Anfangs-Datenpunkte, werden mit Live-Werten gestreckt */
  initial: number[]
  height?: number
  width?: number
  color?: string
  /** Live-Tick-Intervall in ms */
  tickMs?: number
  /** Mittelwert ± Span pro Tick */
  drift?: { center: number; span: number; min: number; max: number }
  enabled?: boolean
}

/**
 * Kleine Live-Linie für die Operations-Etage. Schiebt neue Punkte rein,
 * verwirft alte -- erzeugt das „atmende" Gefühl.
 */
export function MiniLine({
  initial,
  height = 52,
  width = 168,
  color = '#046A38',
  tickMs = 1400,
  drift = { center: 50, span: 30, min: 10, max: 90 },
  enabled = true,
}: MiniLineProps): React.ReactElement {
  const [points, setPoints] = useState<number[]>(initial)

  useEffect(() => {
    if (!enabled) return
    const id = window.setInterval(() => {
      setPoints((prev) => {
        const next = (Math.random() - 0.5) * drift.span + drift.center
        const v = Math.max(drift.min, Math.min(drift.max, next))
        return [...prev.slice(1), v]
      })
    }, tickMs)
    return () => window.clearInterval(id)
  }, [drift.center, drift.max, drift.min, drift.span, enabled, tickMs])

  const path = useMemo(() => {
    const step = width / (points.length - 1)
    const minV = Math.min(...points)
    const maxV = Math.max(...points)
    const range = Math.max(maxV - minV, 1)
    return points
      .map((v, i) => {
        const x = i * step
        const y = height - ((v - minV) / range) * (height - 6) - 3
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
      })
      .join(' ')
  }, [points, width, height])

  const areaPath = `${path} L ${width} ${height} L 0 ${height} Z`

  return (
    <svg className={styles.svg} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={`mlGrad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#mlGrad-${color.replace('#', '')})`} />
      <path d={path} stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {points.length > 0 && (() => {
        const lastIdx = points.length - 1
        const step = width / (points.length - 1)
        const minV = Math.min(...points)
        const maxV = Math.max(...points)
        const range = Math.max(maxV - minV, 1)
        const x = lastIdx * step
        const lastY = height - ((points[lastIdx]! - minV) / range) * (height - 6) - 3
        return <circle cx={x} cy={lastY} r="2.4" fill={color} />
      })()}
    </svg>
  )
}
