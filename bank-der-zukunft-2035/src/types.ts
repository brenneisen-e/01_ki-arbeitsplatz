export type FloorId = 'basement' | 'ground' | 'top' | 'plaza'

export type HotspotId =
  | 'top-boardroom'
  | 'top-display'
  | 'mid-process'
  | 'mid-workstations'
  | 'basement-data'
  | 'basement-control'
  | 'customer-hotline'
  | 'customer-avatar'
  | 'customer-walking'
  | 'customer-pavilion'

export interface Hotspot {
  id: HotspotId
  floor: FloorId
  /** Normalisierte X-Koordinate über dem Hero-Bild, 0..1 (links → rechts). */
  x: number
  /** Normalisierte Y-Koordinate, 0..1 (oben → unten). */
  y: number
  title: string
  subtitle: string
  body: string
}

export interface FloorContent {
  id: FloorId
  badge: string
  heading: string
  description: string
  bullets: string[]
  stats: { label: string; value: string }[]
}

export interface WorkshopStep {
  floor: FloorId
  hotspot?: HotspotId
  durationSec: number
  narration: string
}

export type ThemeMode = 'day' | 'night'
