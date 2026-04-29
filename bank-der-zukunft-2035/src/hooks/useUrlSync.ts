import { useEffect } from 'react'
import { useScene } from './useScene'
import type { FloorId } from '../types'

const FLOORS: ReadonlyArray<FloorId> = ['basement', 'ground', 'top']

/**
 * Hält die URL-Query-Params (?floor=...&hotspot=...) und den Zustand-Store
 * in beide Richtungen synchron. Beim Mount werden Params gelesen,
 * danach reflektiert die URL jede Änderung an activeFloor / hoverHotspot.
 */
export function useUrlSync() {
  const { activeFloor, hoverHotspot, setActiveFloor, setHoverHotspot } = useScene()

  // Initial: URL → Store
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const floor = params.get('floor') as FloorId | null
    const hotspot = params.get('hotspot')
    if (floor && FLOORS.includes(floor)) setActiveFloor(floor)
    if (hotspot) setHoverHotspot(hotspot as never)
    // popstate (Back/Forward) → Store
    const onPop = () => {
      const p = new URLSearchParams(window.location.search)
      const f = p.get('floor') as FloorId | null
      setActiveFloor(f && FLOORS.includes(f) ? f : null)
      setHoverHotspot((p.get('hotspot') as never) ?? null)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [setActiveFloor, setHoverHotspot])

  // Store → URL
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (activeFloor) params.set('floor', activeFloor); else params.delete('floor')
    if (hoverHotspot) params.set('hotspot', hoverHotspot); else params.delete('hotspot')
    const qs = params.toString()
    const next = qs ? `?${qs}` : window.location.pathname
    window.history.replaceState(null, '', next)
  }, [activeFloor, hoverHotspot])
}
