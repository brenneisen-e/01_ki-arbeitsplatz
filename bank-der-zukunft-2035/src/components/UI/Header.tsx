import { Play, Users, Compass } from 'lucide-react'
import { useScene } from '../../hooks/useScene'

interface HeaderProps {
  onStartWorkshop: () => void
}

/**
 * Premium-Header mit Logo + zwei Primary-CTAs.
 * Hintergrund: dezente Glas-Bar oben, kein verspielter Look.
 */
export function Header({ onStartWorkshop }: HeaderProps) {
  const setActiveFloor = useScene((s) => s.setActiveFloor)

  return (
    <header className="relative z-50 px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #1a73c5 0%, #3ba4f5 100%)' }}
        >
          <Compass size={20} strokeWidth={1.6} className="text-white" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-semibold text-base tracking-tight">Bank der Zukunft</span>
          <span className="text-xs uppercase tracking-[0.18em] opacity-60">Banking · KI · 2035</span>
        </div>
      </div>

      <nav className="flex items-center gap-3">
        <button
          onClick={onStartWorkshop}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border border-white/20 bg-white/5 hover:bg-white/15 transition-colors"
        >
          <Play size={14} strokeWidth={2.25} />
          Workshop starten
        </button>
        <button
          onClick={() => setActiveFloor(null)}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white"
          style={{ background: 'linear-gradient(135deg, #1a73c5 0%, #3ba4f5 100%)' }}
        >
          <Users size={14} strokeWidth={2.25} />
          Mit Kundenperspektive beginnen
        </button>
      </nav>
    </header>
  )
}
