import { useEffect, useState } from 'react'
import { COCKPIT_INITIAL } from '../data/modules'

/**
 * Simulierter Live-Stream der Cockpit-Werte. Reine Demo: keine Daten gehen
 * raus, keine Daten kommen rein. Jeder Tick verändert die Werte in einem
 * realistischen Korridor.
 */
export type CockpitValues = typeof COCKPIT_INITIAL

const clamp = (v: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, v))

const jitter = (v: number, span: number, min: number, max: number): number =>
  clamp(v + (Math.random() - 0.5) * span, min, max)

const round1 = (v: number): number => Math.round(v * 10) / 10

export function useTicker(enabled: boolean, intervalMs = 1800): CockpitValues {
  const [v, setV] = useState<CockpitValues>(COCKPIT_INITIAL)

  useEffect(() => {
    if (!enabled) return
    const id = window.setInterval(() => {
      setV((prev) => ({
        car: round1(jitter(prev.car, 0.18, 16.4, 19.2)),
        lcr: round1(jitter(prev.lcr, 1.4, 128, 152)),
        nsfr: round1(jitter(prev.nsfr, 0.9, 115, 130)),
        riskExposure: Math.round(jitter(prev.riskExposure, 0.012, 0.34, 0.5) * 1000) / 1000,
        dailyVolume: round1(jitter(prev.dailyVolume, 0.34, 10.8, 14.4)),
        stp: Math.round(jitter(prev.stp, 0.6, 58, 68)),
        nii: prev.nii.map((q, i) => {
          // Letzter Balken atmet stärker (laufendes Quartal)
          const span = i === prev.nii.length - 1 ? 4 : 1.5
          return Math.max(80, Math.round(jitter(q, span, 100, 175)))
        }),
      }))
    }, intervalMs)
    return () => window.clearInterval(id)
  }, [enabled, intervalMs])

  return v
}
