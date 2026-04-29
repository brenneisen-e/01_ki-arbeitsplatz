import { create } from 'zustand'
import type { FloorId, HotspotId, ThemeMode } from '../types'

interface SceneState {
  activeFloor: FloorId | null
  hoverHotspot: HotspotId | null
  workshopStep: number | null  // index in workshop-steps
  theme: ThemeMode
  panelOpen: boolean

  setActiveFloor: (id: FloorId | null) => void
  setHoverHotspot: (id: HotspotId | null) => void
  setWorkshopStep: (idx: number | null) => void
  setTheme: (t: ThemeMode) => void
  toggleTheme: () => void
  openPanel: () => void
  closePanel: () => void
  reset: () => void
}

export const useScene = create<SceneState>((set) => ({
  activeFloor: null,
  hoverHotspot: null,
  workshopStep: null,
  theme: 'night',
  panelOpen: false,

  setActiveFloor: (id) => set((s) => ({ activeFloor: id, panelOpen: id !== null ? true : s.panelOpen })),
  setHoverHotspot: (id) => set({ hoverHotspot: id }),
  setWorkshopStep: (idx) => set({ workshopStep: idx }),
  setTheme: (t) => set({ theme: t }),
  toggleTheme: () => set((s) => ({ theme: s.theme === 'night' ? 'day' : 'night' })),
  openPanel: () => set({ panelOpen: true }),
  closePanel: () => set({ panelOpen: false }),
  reset: () => set({ activeFloor: null, hoverHotspot: null, workshopStep: null, panelOpen: false }),
}))
