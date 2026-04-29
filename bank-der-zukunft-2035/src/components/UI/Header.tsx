import { Play, Layers } from 'lucide-react'
import { useScene } from '../../hooks/useScene'

interface HeaderProps {
  onStartWorkshop: () => void
}

/**
 * Minimaler, monochromer Header. Zwei Glasmorphism-Buttons.
 */
export function Header({ onStartWorkshop }: HeaderProps) {
  const setActiveFloor = useScene((s) => s.setActiveFloor)

  function walkFloors() {
    // Geht durch alle 3 Etagen sequentiell, jeweils 3,5 s
    const seq: ('top' | 'ground' | 'basement')[] = ['top', 'ground', 'basement']
    seq.forEach((id, i) => setTimeout(() => setActiveFloor(id), i * 3500))
  }

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-16 px-8 flex items-center justify-between glass"
      style={{ borderBottom: '1px solid var(--line-hairline)', backdropFilter: 'blur(40px) saturate(180%)' }}
    >
      <div className="flex items-center gap-4">
        <ThinCompass />
        <div className="flex flex-col leading-tight">
          <span className="display-md text-[var(--color-ink-primary)]">Bank der Zukunft</span>
          <span className="mono-label opacity-50">Banking · KI · 2035</span>
        </div>
      </div>

      <nav className="flex items-center gap-2.5">
        <button
          onClick={onStartWorkshop}
          className="hairline hairline-hover inline-flex items-center gap-2.5 rounded-full h-9 px-4 text-[13px] font-normal tracking-tight text-[var(--color-ink-primary)] transition-colors"
          style={{ background: 'transparent' }}
        >
          <Play size={12} strokeWidth={1.4} />
          Workshop starten
        </button>
        <button
          onClick={walkFloors}
          className="hairline hairline-hover inline-flex items-center gap-2.5 rounded-full h-9 px-4 text-[13px] font-normal tracking-tight text-[var(--color-ink-primary)] transition-colors"
          style={{ background: 'transparent' }}
        >
          <Layers size={12} strokeWidth={1.4} />
          Etagen durchlaufen
        </button>
      </nav>
    </header>
  )
}

function ThinCompass() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="var(--color-accent-cyan)" strokeWidth="1.1" />
      <path d="M12 5 L13.6 12 L12 19 L10.4 12 Z"
            stroke="var(--color-accent-cyan)" strokeWidth="1.1" strokeLinejoin="round" fill="none" />
      <circle cx="12" cy="12" r="0.8" fill="var(--color-accent-cyan)" />
    </svg>
  )
}
