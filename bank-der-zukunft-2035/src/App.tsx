import { useEffect, useState } from 'react'
import { Hero } from './components/Scene/Hero'
import { HorizonsView } from './components/Scene/HorizonsView'
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

const PRELOAD_PATHS = [
  'assets/scene/floor-top-detail',
  'assets/scene/floor-ground-detail',
  'assets/scene/floor-basement-detail',
  'assets/scene/outdoor-plaza',
]

export default function App() {
  const theme = useScene((s) => s.theme)
  const view  = useScene((s) => s.view)
  const setStep    = useScene((s) => s.setWorkshopStep)
  const goHero     = useScene((s) => s.goHero)
  const openFloor  = useScene((s) => s.openFloor)
  const activeFloor = useScene((s) => s.activeFloor)
  const [showHint, setShowHint] = useState(true)

  useUrlSync()

  useEffect(() => { document.body.dataset.theme = theme }, [theme])
  useEffect(() => { const t = setTimeout(() => setShowHint(false), 8000); return () => clearTimeout(t) }, [])

  // Preload aller Detail-Bilder (lautlos, ohne Loading-State)
  useEffect(() => {
    PRELOAD_PATHS.forEach((base) => {
      ;['.webp', '.png'].forEach((ext) => {
        const img = new Image()
        img.src = `${base}${ext}`
      })
    })
  }, [])

  // Tastatur: Esc → goHero, ArrowUp/Down → Etagen wechseln
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { goHero(); return }
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault()
        const idx = activeFloor && (FLOOR_ORDER as readonly string[]).includes(activeFloor)
          ? FLOOR_ORDER.indexOf(activeFloor as (typeof FLOOR_ORDER)[number])
          : -1
        const next = e.key === 'ArrowUp'
          ? Math.max(0, idx <= 0 ? 0 : idx - 1)
          : Math.min(FLOOR_ORDER.length - 1, idx < 0 ? 0 : idx + 1)
        openFloor(FLOOR_ORDER[next])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeFloor, openFloor, goHero])

  // Klick auf die Bühne (nicht Hotspot, nicht Panel) → goHero
  function handleStageClick(e: React.MouseEvent<HTMLElement>) {
    const t = e.target as HTMLElement
    if (t.closest('.hot') || t.closest('aside') || t.closest('header')) return
    if (view !== 'hero') goHero()
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden" onClick={handleStageClick}>
      <main className="absolute left-0 right-0 bottom-0 top-16">
        {view === 'horizons'
          ? <HorizonsView />
          : <Hero overlay={() => <HotspotOverlay />} />}
      </main>

      <Header onStartWorkshop={() => setStep(0)} />
      <Tooltip />
      <SidePanel />
      <ResetButton />
      <ThemeToggle />
      <WorkshopFlow />

      {showHint && view === 'hero' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 mono-label pointer-events-none" style={{ opacity: 0.4 }}>
          Hover · Klick · Pfeiltasten
        </div>
      )}
    </div>
  )
}
