import { useEffect } from 'react'
import { useScene } from '../../hooks/useScene'
import { WORKSHOP_STEPS } from '../../data/workshop-steps'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

/**
 * Geführte Workshop-Tour. Wird durch Klick auf "Workshop starten" im
 * Header aktiviert. Setzt activeFloor + hoverHotspot pro Schritt und
 * zeigt eine Narration-Bar unten ein. Auto-Advance via setTimeout.
 */
export function WorkshopFlow() {
  const step = useScene((s) => s.workshopStep)
  const setStep = useScene((s) => s.setWorkshopStep)
  const openFloor = useScene((s) => s.openFloor)
  const goHero = useScene((s) => s.goHero)

  // Wenn Step gesetzt, fahre die zugehörige Etage an (Cross-Fade
  // + Side-Panel) und zeige den passenden Hotspot als „aktiv".
  useEffect(() => {
    if (step === null) return
    const s = WORKSHOP_STEPS[step]
    if (!s) { setStep(null); goHero(); return }
    openFloor(s.floor, s.hotspot ?? null)
    const t = setTimeout(() => {
      if (step + 1 < WORKSHOP_STEPS.length) setStep(step + 1)
      else { setStep(null); goHero() }
    }, s.durationSec * 1000)
    return () => clearTimeout(t)
  }, [step, openFloor, goHero, setStep])

  if (step === null) return null
  const s = WORKSHOP_STEPS[step]

  return (
    <AnimatePresence>
      <motion.div
        key={step}
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 26 }}
        className="glass fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-2xl px-6 py-4 max-w-2xl w-[min(90vw,720px)]"
      >
        <div className="flex items-start gap-4">
          <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-teal)] font-semibold pt-1 shrink-0 w-12 text-right">
            {String(step + 1).padStart(2, '0')} / {String(WORKSHOP_STEPS.length).padStart(2, '0')}
          </div>
          <div className="flex-1 text-sm leading-snug">{s.narration}</div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              aria-label="Schritt zurück"
              disabled={step === 0}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 disabled:opacity-40 flex items-center justify-center"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => step + 1 < WORKSHOP_STEPS.length ? setStep(step + 1) : setStep(null)}
              aria-label="Nächster Schritt"
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center"
            >
              <ChevronRight size={14} />
            </button>
            <button
              onClick={() => setStep(null)}
              aria-label="Tour beenden"
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
