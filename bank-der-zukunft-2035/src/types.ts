export type FloorId = 'basement' | 'ground' | 'top'

export type HotspotId =
  | 'server-rack'
  | 'data-pulse'
  | 'process-mining'
  | 'rpa-bot'
  | 'ai-avatar'
  | 'governance-cockpit'
  | 'customer-phone'
  | 'customer-video'
  | 'customer-pavillon'

export interface FloorContent {
  id: FloorId
  label: string
  badge: string
  heading: string
  description: string
  bullets: string[]
  stats: { label: string; value: string }[]
}

export interface Hotspot {
  id: HotspotId
  floor: FloorId | 'outdoor'
  /** SVG-Koordinaten innerhalb der Bühne (viewBox 1600×1000). */
  x: number
  y: number
  title: string
  body: string
}

export interface WorkshopStep {
  floor: FloorId | 'outdoor'
  hotspot?: HotspotId
  /** Sekunden, die der Schritt sichtbar bleibt, bevor automatisch
      weitergesprungen wird (nur Auto-Advance / Präsentations-Modus). */
  durationSec: number
  narration: string
}

export type ThemeMode = 'day' | 'night'
