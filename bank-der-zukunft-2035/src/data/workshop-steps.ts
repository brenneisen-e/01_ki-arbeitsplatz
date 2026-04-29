import type { WorkshopStep } from '../types'

/**
 * Geführte Workshop-Sequenz für Auto-Play. Jeder Schritt setzt
 * activeFloor + hoverHotspot, dann nach `durationSec` weiter.
 */
export const WORKSHOP_STEPS: ReadonlyArray<WorkshopStep> = [
  {
    floor: 'outdoor',
    hotspot: 'customer-video',
    durationSec: 8,
    narration:
      'Wir starten draußen — beim Kunden. 2035 erwartet jeder eine 24/7-Avatar-Beratung, mit Empathie und Lebenslagen-Kontext.',
  },
  {
    floor: 'outdoor',
    hotspot: 'customer-pavilion',
    durationSec: 7,
    narration:
      'Selbst-Service-Pavillon mit Spatial-Computing — branchless, aber präsent. Von Identifikation bis Vertragsabschluss in einer Interaktion.',
  },
  {
    floor: 'ground',
    hotspot: 'process-mining',
    durationSec: 9,
    narration:
      'Ins Erdgeschoss: Operations laufen mit Hyperautomation. Process Mining macht jede Engstelle messbar, agentische Workflows führen aus.',
  },
  {
    floor: 'basement',
    hotspot: 'core-data-center',
    durationSec: 8,
    narration:
      'Darunter das Fundament: Daten-Plattform mit LLM-Gateway, Vector Search und Feature Store. Composable Banking statt Monolith.',
  },
  {
    floor: 'top',
    hotspot: 'ai-governance',
    durationSec: 9,
    narration:
      'Ganz oben sitzt der Vorstand mit dem AI-Governance-Board. Ein CAIDO steuert KI als Vorstands-Agenda — nicht als IT-Thema.',
  },
]
