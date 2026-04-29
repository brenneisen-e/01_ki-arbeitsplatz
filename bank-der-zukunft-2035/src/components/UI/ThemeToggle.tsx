import { Sun, Moon } from 'lucide-react'
import { useScene } from '../../hooks/useScene'

/** Tag/Nacht-Toggle unten rechts. Pure Lucide, keine bunten Icons. */
export function ThemeToggle() {
  const theme = useScene((s) => s.theme)
  const toggle = useScene((s) => s.toggleTheme)
  const isNight = theme === 'night'

  return (
    <button
      onClick={toggle}
      aria-label={isNight ? 'Tag-Modus' : 'Nacht-Modus'}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full glass flex items-center justify-center hover:scale-105 transition-transform"
      title={isNight ? 'Wechsel zu Tag-Modus' : 'Wechsel zu Nacht-Modus'}
    >
      {isNight ? <Sun size={18} strokeWidth={1.8} /> : <Moon size={18} strokeWidth={1.8} />}
    </button>
  )
}
