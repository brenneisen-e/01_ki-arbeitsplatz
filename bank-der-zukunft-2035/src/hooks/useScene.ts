import { create } from 'zustand'
import type { FloorId, HotspotId, ThemeMode } from '../types'

interface SceneState {
  activeFloor: FloorId | null
  activeHotspot: HotspotId | null
  hoverHotspot: HotspotId | null
  workshopStep: number | null
  theme: ThemeMode
  panelOpen: boolean

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
  activeFloor: null,
  activeHotspot: null,
  hoverHotspot: null,
  workshopStep: null,
  theme: 'night',
  panelOpen: false,

  setActiveFloor: (id) => set((s) => ({
    activeFloor: id,
    panelOpen: id !== null ? true : s.panelOpen,
  })),
  setActiveHotspot: (id) => set({ activeHotspot: id }),
  setHoverHotspot: (id) => set({ hoverHotspot: id }),
  setWorkshopStep: (idx) => set({ workshopStep: idx }),
  setTheme: (t) => set({ theme: t }),
  toggleTheme: () => set((s) => ({ theme: s.theme === 'night' ? 'day' : 'night' })),
  closePanel: () => set({ panelOpen: false, activeHotspot: null }),
  reset: () => set({
    activeFloor: null,
    activeHotspot: null,
    hoverHotspot: null,
    workshopStep: null,
    panelOpen: false,
  }),
}))
