import { useEffect, useState } from 'react'
import { Stage } from './components/Scene/Stage'
import { PlaceholderSilhouette } from './components/Scene/PlaceholderSilhouette'
import { HotspotOverlay } from './components/Scene/HotspotOverlay'
import { Header } from './components/UI/Header'
import { SidePanel } from './components/UI/SidePanel'
import { Tooltip } from './components/UI/Tooltip'
import { ThemeToggle } from './components/UI/ThemeToggle'
import { ResetButton } from './components/UI/ResetButton'
import { WorkshopFlow } from './components/Workshop/WorkshopFlow'
import { useScene } from './hooks/useScene'
import { useUrlSync } from './hooks/useUrlSync'

const FLOOR_ORDER = ['top', 'ground', 'basement', 'outdoor'] as const

export default function App() {
  const theme = useScene((s) => s.theme)
  const setStep = useScene((s) => s.setWorkshopStep)
  const closePanel = useScene((s) => s.closePanel)
  const setActiveFloor = useScene((s) => s.setActiveFloor)
  const activeFloor = useScene((s) => s.activeFloor)
  const [showHint, setShowHint] = useState(true)

  useUrlSync()

  useEffect(() => { document.body.dataset.theme = theme }, [theme])

  // Hint nach 8s ausblenden — Hotspots sind selbsterklärend
  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 8000)
    return () => clearTimeout(t)
  }, [])

  // Tastatur
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { closePanel(); setActiveFloor(null); return }
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault()
        const idx = activeFloor ? FLOOR_ORDER.indexOf(activeFloor as (typeof FLOOR_ORDER)[number]) : -1
        const next = e.key === 'ArrowUp'
          ? Math.max(0, idx <= 0 ? 0 : idx - 1)
          : Math.min(FLOOR_ORDER.length - 1, idx < 0 ? 0 : idx + 1)
        setActiveFloor(FLOOR_ORDER[next])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeFloor, setActiveFloor, closePanel])

  return (
    <div className="relative w-screen h-screen overflow-hidden tiltshift">
      {/* Premium-Silhouetten-Fallback hinter dem R3F-Canvas, falls
          das Hero-Bild noch fehlt. Bei vorhandenem Bild wird der
          Fallback ohnehin durch das R3F-Plane verdeckt. */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <PlaceholderSilhouette theme={theme} />
      </div>

      {/* WebGL-Bühne */}
      <div className="absolute inset-0 z-[1]">
        <Stage />
      </div>

      {/* DOM-Overlay über der Bühne */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <HotspotOverlay />
      </div>

      {/* UI */}
      <Header onStartWorkshop={() => setStep(0)} />
      <Tooltip />
      <SidePanel />
      <ResetButton />
      <ThemeToggle />
      <WorkshopFlow />

      {/* Selbsterklärender Hint, fade-out nach 8s — sehr dezent unten rechts */}
      {showHint && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 mono-label pointer-events-none"
          style={{ opacity: 0.4, transition: 'opacity 0.6s ease-out' }}
        >
          Hover · Klick · Pfeiltasten
        </div>
      )}
    </div>
  )
}
