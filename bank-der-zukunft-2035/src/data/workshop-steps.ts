import type { WorkshopStep } from '../types'

/**
 * Geführte Workshop-Sequenz für Auto-Play. Drei Etagen, von oben
 * nach unten. Jeder Schritt setzt activeFloor + hoverHotspot, dann
 * nach `durationSec` weiter.
 */
export const WORKSHOP_STEPS: ReadonlyArray<WorkshopStep> = [
  {
    floor: 'top',
    hotspot: 'top-boardroom',
    durationSec: 9,
    narration:
      'Wir starten oben — beim Vorstand. Ein CAIDO und das AI-Governance-Board steuern die KI-Agenda. Risiko, Compliance, Modell-Lifecycle sind C-Level-Sache.',
  },
  {
    floor: 'top',
    hotspot: 'top-display',
    durationSec: 7,
    narration:
      'Das strategische Radar zeigt Embedded Finance, Stablecoins und Plattform-Banking, bevor sie unausweichlich werden.',
  },
  {
    floor: 'ground',
    hotspot: 'mid-process',
    durationSec: 9,
    narration:
      'In den Operations: Process Mining + Hyperautomation machen jede Engstelle messbar. Dunkelverarbeitung wird zum Standard.',
  },
  {
    floor: 'ground',
    hotspot: 'mid-workstations',
    durationSec: 7,
    narration:
      'Agentische Workflows übernehmen Routineentscheidungen über Kredit, KYC und Service. Sie reichen weiter und werden mit jedem Loop besser.',
  },
  {
    floor: 'basement',
    hotspot: 'basement-data',
    durationSec: 9,
    narration:
      'Im Fundament: Daten-Mesh + LLM-Gateway + Vector-Search. Single Source of Truth für jeden Modell-Call.',
  },
  {
    floor: 'basement',
    hotspot: 'basement-control',
    durationSec: 7,
    narration:
      'Live Observability über jedes Modell und jede Transaktion — Anomalien tauchen auf, bevor Kunden sie spüren.',
  },
]
