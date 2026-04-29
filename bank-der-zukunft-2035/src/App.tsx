import { useEffect } from 'react'
import { BankBuilding } from './components/Scene/BankBuilding'
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
  const setActiveFloor = useScene((s) => s.setActiveFloor)
  const setStep = useScene((s) => s.setWorkshopStep)
  const closePanel = useScene((s) => s.closePanel)
  const activeFloor = useScene((s) => s.activeFloor)

  useUrlSync()

  // Theme-Klasse am Body
  useEffect(() => {
    document.body.dataset.theme = theme
  }, [theme])

  // Tastatur-Navigation (ArrowUp/Down, Esc)
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
    <div className="relative w-full min-h-screen overflow-hidden">
      <Header onStartWorkshop={() => setStep(0)} />

      {/* Bühne */}
      <main className="relative w-full" style={{ height: 'calc(100vh - 80px)' }}>
        <BankBuilding />
      </main>

      <Tooltip />
      <SidePanel />
      <ResetButton />
      <ThemeToggle />
      <WorkshopFlow />
    </div>
  )
}
