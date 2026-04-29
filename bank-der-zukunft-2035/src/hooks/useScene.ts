import { create } from 'zustand'
import type { FloorId, HotspotId, ThemeMode } from '../types'

/**
 * SceneView entscheidet, welches Hintergrundbild + welcher Hotspot-Satz
 * gerendert wird:
 *   'hero'  → Querschnitt-Hauptbild, 6 Etagen-Hotspots
 *   'detail-{floor}' → ein Etagen-Detail-Bild, Etagen-Hotspots
 *                     (ohne die anderen Etagen)
 *   'plaza' → Außen-Plaza-Bild, 4 Customer-Hotspots
 */
export type SceneView = 'hero' | 'detail-top' | 'detail-ground' | 'detail-basement' | 'plaza'

interface SceneState {
  view: SceneView
  activeFloor: FloorId | null
  activeHotspot: HotspotId | null
  hoverHotspot: HotspotId | null
  workshopStep: number | null
  theme: ThemeMode
  panelOpen: boolean

  setView: (v: SceneView) => void
  openFloor: (id: FloorId, hotspot?: HotspotId | null) => void
  openPlaza: () => void
  goHero: () => void

  setActiveFloor: (id: FloorId | null) => void
  setActiveHotspot: (id: HotspotId | null) => void
  setHoverHotspot: (id: HotspotId | null) => void
  setWorkshopStep: (idx: number | null) => void
  setTheme: (t: ThemeMode) => void
  toggleTheme: () => void
  closePanel: () => void
  reset: () => void
}

export const useScene = create<SceneState>((set) => ({
  view: 'hero',
  activeFloor: null,
  activeHotspot: null,
  hoverHotspot: null,
  workshopStep: null,
  theme: 'night',
  panelOpen: false,

  setView: (v) => set({ view: v }),

  openFloor: (id, hotspot = null) => set({
    view: id === 'top' ? 'detail-top' : id === 'ground' ? 'detail-ground' : 'detail-basement',
    activeFloor: id,
    activeHotspot: hotspot,
    panelOpen: true,
  }),

  openPlaza: () => set({
    view: 'plaza',
    activeFloor: null,
    activeHotspot: null,
    panelOpen: true,
  }),

  goHero: () => set({
    view: 'hero',
    activeFloor: null,
    activeHotspot: null,
    panelOpen: false,
  }),

  setActiveFloor: (id) => set({ activeFloor: id }),
  setActiveHotspot: (id) => set({ activeHotspot: id }),
  setHoverHotspot: (id) => set({ hoverHotspot: id }),
  setWorkshopStep: (idx) => set({ workshopStep: idx }),
  setTheme: (t) => set({ theme: t }),
  toggleTheme: () => set((s) => ({ theme: s.theme === 'night' ? 'day' : 'night' })),
  closePanel: () => set({
    view: 'hero',
    panelOpen: false,
    activeFloor: null,
    activeHotspot: null,
  }),
  reset: () => set({
    view: 'hero',
    activeFloor: null,
    activeHotspot: null,
    hoverHotspot: null,
    workshopStep: null,
    panelOpen: false,
  }),
}))
