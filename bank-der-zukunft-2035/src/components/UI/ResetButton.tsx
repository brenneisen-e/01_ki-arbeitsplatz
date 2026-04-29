import { RotateCcw } from 'lucide-react'
import { useScene } from '../../hooks/useScene'

/** Reset-Button unten rechts (links neben ThemeToggle). */
export function ResetButton() {
  const reset = useScene((s) => s.reset)
  return (
    <button
      onClick={reset}
      aria-label="Ansicht zurücksetzen"
      className="fixed bottom-6 right-22 z-50 w-12 h-12 rounded-full glass flex items-center justify-center hover:scale-105 transition-transform"
      style={{ right: 'calc(1.5rem + 56px)' }}
      title="Ansicht zurücksetzen"
    >
      <RotateCcw size={18} strokeWidth={1.8} />
    </button>
  )
}
