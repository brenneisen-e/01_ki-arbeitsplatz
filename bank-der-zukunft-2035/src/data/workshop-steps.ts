import type { WorkshopStep } from '../types'

/**
 * Geführte Workshop-Sequenz. Wird von WorkshopFlow.tsx via GSAP-Timeline
 * abgespielt. Auto-Advance nach `durationSec`.
 */
export const WORKSHOP_STEPS: ReadonlyArray<WorkshopStep> = [
  {
    floor: 'outdoor',
    hotspot: 'customer-phone',
    durationSec: 8,
    narration:
      'Wir starten draußen — bei dem, was zählt: dem Kunden. 2035 erwartet jeder Kunde 24/7-Erreichbarkeit, sprachfähige KI und nahtlose Übergänge zwischen Kanälen.',
  },
  {
    floor: 'outdoor',
    hotspot: 'customer-video',
    durationSec: 7,
    narration:
      'Auf der Bank davor: ein Kunde im Video-Chat mit einem KI-Avatar — empathisch, lippensynchron, mit Kontext aus seiner Lebenslage.',
  },
  {
    floor: 'ground',
    hotspot: 'process-mining',
    durationSec: 9,
    narration:
      'Ins Erdgeschoss: Operations laufen mit Hyperautomation. Process Mining macht jede Engstelle sichtbar, RPA + KI führen aus. Dunkelverarbeitung wird zum Standard.',
  },
  {
    floor: 'basement',
    hotspot: 'server-rack',
    durationSec: 8,
    narration:
      'Darunter das Fundament: eine Daten-Plattform mit Mesh-Architektur, LLM-Gateway und Composable-Banking-Bausteinen statt Monolith.',
  },
  {
    floor: 'top',
    hotspot: 'ai-avatar',
    durationSec: 9,
    narration:
      'Ganz oben sitzt der Vorstand mit dem AI-Governance-Board und einem CAIDO. KI-Steuerung ist Vorstands-Agenda — nicht IT-Thema. Und der KI-Co-Pilot sitzt mit am Tisch.',
  },
]
