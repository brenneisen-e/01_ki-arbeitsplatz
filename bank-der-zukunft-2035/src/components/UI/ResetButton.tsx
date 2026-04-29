import { RotateCcw } from 'lucide-react'
import { useScene } from '../../hooks/useScene'

/** Reset-Button unten rechts (links neben ThemeToggle). */
export function ResetButton() {
  const reset = useScene((s) => s.reset)
  return (
    <button
      onClick={reset}
      aria-label="Ansicht zurücksetzen"
      className="fixed bottom-6 z-50 w-11 h-11 rounded-full glass hairline-hover flex items-center justify-center transition-colors"
      style={{ right: 'calc(1.5rem + 52px)' }}
      title="Ansicht zurücksetzen"
    >
      <RotateCcw size={15} strokeWidth={1.4} className="text-[var(--color-ink-secondary)]" />
    </button>
  )
}
