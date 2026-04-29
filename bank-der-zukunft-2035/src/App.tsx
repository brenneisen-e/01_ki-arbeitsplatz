import { useEffect, useState } from 'react'
import { Hero } from './components/Scene/Hero'
import { HotspotOverlay } from './components/Scene/HotspotOverlay'
import { Header } from './components/UI/Header'
import { SidePanel } from './components/UI/SidePanel'
import { Tooltip } from './components/UI/Tooltip'
import { ThemeToggle } from './components/UI/ThemeToggle'
import { ResetButton } from './components/UI/ResetButton'
import { WorkshopFlow } from './components/Workshop/WorkshopFlow'
import { useScene } from './hooks/useScene'
import { useUrlSync } from './hooks/useUrlSync'

const FLOOR_ORDER = ['top', 'ground', 'basement'] as const

export default function App() {
  const theme = useScene((s) => s.theme)
  const setStep = useScene((s) => s.setWorkshopStep)
  const closePanel = useScene((s) => s.closePanel)
  const setActiveFloor = useScene((s) => s.setActiveFloor)
  const activeFloor = useScene((s) => s.activeFloor)
  const [showHint, setShowHint] = useState(true)

  useUrlSync()

  useEffect(() => { document.body.dataset.theme = theme }, [theme])

  // Hint nach 8s ausblenden
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
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Hero-Bühne füllt den Bereich unterhalb des 64px-Headers,
          Bild bleibt vollständig sichtbar (object-fit: contain). */}
      <main className="absolute left-0 right-0 bottom-0 top-16">
        <Hero overlay={() => <HotspotOverlay />} />
      </main>

      <Header onStartWorkshop={() => setStep(0)} />
      <Tooltip />
      <SidePanel />
      <ResetButton />
      <ThemeToggle />
      <WorkshopFlow />

      {showHint && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 mono-label pointer-events-none"
          style={{ opacity: 0.4 }}
        >
          Hover · Klick · Pfeiltasten
        </div>
      )}
    </div>
  )
}
