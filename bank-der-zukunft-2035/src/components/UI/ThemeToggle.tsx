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
      className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full glass hairline-hover flex items-center justify-center transition-colors"
      title={isNight ? 'Wechsel zu Tag-Modus' : 'Wechsel zu Nacht-Modus'}
    >
      {isNight
        ? <Sun  size={15} strokeWidth={1.4} className="text-[var(--color-ink-secondary)]" />
        : <Moon size={15} strokeWidth={1.4} className="text-[var(--color-ink-secondary)]" />}
    </button>
  )
}
