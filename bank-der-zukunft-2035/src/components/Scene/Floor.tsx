import type { ReactNode } from 'react'
import { useScene } from '../../hooks/useScene'
import type { FloorId } from '../../types'

interface FloorProps {
  id: FloorId
  /** SVG-Y-Position (top-edge) im viewBox 1600×1000 */
  y: number
  /** SVG-Höhe der Etage */
  height: number
  /** SVG-X-Position (left-edge) im viewBox 1600×1000 */
  x: number
  /** SVG-Breite der Etage */
  width: number
  /** Innen-Inhalt (Möbel, Personen, Effekte) */
  children: ReactNode
  /** Etagen-Label (für a11y) */
  label: string
}

/**
 * Generischer Etagen-Wrapper. Rendert:
 * 1) Boden- und Deckenlinie
 * 2) Hover-/Active-Highlights via Klassen `floor-active` / `floor-dimmed`
 * 3) Klick-Hit-Box für Selektion
 * 4) den eigentlichen Inneninhalt (`children`)
 */
export function Floor({ id, x, y, width, height, children, label }: FloorProps) {
  const activeFloor = useScene((s) => s.activeFloor)
  const setActiveFloor = useScene((s) => s.setActiveFloor)

  const isActive = activeFloor === id
  const isDimmed = activeFloor !== null && activeFloor !== id

  const klass = [
    'floor-hover',
    isActive && 'floor-active',
    isDimmed && 'floor-dimmed',
  ].filter(Boolean).join(' ')

  return (
    <g
      className={klass}
      onClick={(e) => { e.stopPropagation(); setActiveFloor(isActive ? null : id) }}
      role="button"
      aria-label={label}
      tabIndex={0}
    >
      {/* Bodenplatte */}
      <rect x={x} y={y} width={width} height={height} fill="var(--color-facade)" stroke="var(--color-facade-accent)" strokeWidth="2" />
      {/* Deckenstreifen */}
      <rect x={x} y={y} width={width} height={6} fill="var(--color-facade-dark)" />
      <rect x={x} y={y + height - 4} width={width} height={4} fill="var(--color-facade-dark)" opacity="0.55" />
      {/* Innenraum (Effekte / Personen / Möbel) */}
      <g>{children}</g>
    </g>
  )
}
