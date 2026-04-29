import type { FloorContent, FloorId } from '../types'

export const FLOORS: ReadonlyArray<FloorContent> = [
  {
    id: 'basement',
    badge: 'IT & Daten-Backbone',
    heading: 'Daten- & KI-Plattform als Fundament',
    description:
      'Die Bank der Zukunft steht auf einer modernen Daten-Plattform. Data Mesh mit Domänen-Ownership, Feature Store, Vektor-Indizes für Retrieval-Augmented Generation und ein LLM-Gateway mit Policy-Layer bilden die Basis für jeden Geschäftsprozess.',
    bullets: [
      'Data Mesh + Echtzeit-Streams (Kafka, Flink) als Single Source of Truth',
      'LLM-Gateway mit Routing, Caching und Audit-Trail für jeden Aufruf',
      'Composable Banking statt Monolith — Strangler-Fig-Migration der Legacy-Systeme',
    ],
    stats: [
      { label: 'STP-Quote',     value: '> 90 %' },
      { label: 'p95 Latency',   value: '< 50 ms' },
      { label: 'Modell-Calls',  value: '12 M / Tag' },
    ],
  },
  {
    id: 'ground',
    badge: 'Operations & Hyperautomation',
    heading: 'Realtime Banking durch Dunkelverarbeitung',
    description:
      'Geschäftsvorfälle werden End-to-End vollautomatisiert abgewickelt — Process Mining liefert die Grundlage, RPA + KI die Ausführung. Mitarbeitende fokussieren sich auf Eskalation und Entscheidungen, die menschliches Urteil verlangen.',
    bullets: [
      'Hyperautomation aus RPA, KI-Agenten und Process Mining — messbar im Business Case',
      'Vertriebsarbeitsplatz als KI-Co-Pilot mit 360°-Kundensicht & Next-Best-Action',
      'Exception-Handling per Workflow — Mensch nur noch bei wirklichen Ausnahmen',
    ],
    stats: [
      { label: 'Dunkelv.-Quote', value: '90 %' },
      { label: 'Antrag → Zusage', value: '< 5 Min' },
      { label: 'Cost-Income',     value: '−18 Pp' },
    ],
  },
  {
    id: 'top',
    badge: 'AI Governance Board',
    heading: 'KI-Steuerung als Vorstands-Agenda',
    description:
      'Ein Chief AI Officer (CAIDO) und ein AI-Governance-Board steuern die Transformation strategisch. EU AI Act Compliance ist eingebaut, jedes Modell ist im Registry, jede Entscheidung auditierbar.',
    bullets: [
      'CAIDO im Vorstand + AI-Governance-Board mit klarem Mandat',
      'Risiko-Klassifizierung gemäß EU AI Act, Modell-Dokumentation, Continuous Monitoring',
      'Echtzeit-Cockpit für Risk-Heatmap, Knoten-Graph und CAIDO-Status',
    ],
    stats: [
      { label: 'Modell-Registry', value: '142' },
      { label: 'High-Risk-Modelle', value: '11' },
      { label: 'Audit-Findings', value: '0 offen' },
    ],
  },
  {
    id: 'plaza',
    badge: 'Kundenperspektive 2035',
    heading: 'Hyper-personalisierte Kundenreise',
    description:
      'Banking 2035 erlebt der Kunde jenseits der Filiale — als 24/7-AI-Avatar, als Pavillon-Erlebnis am Marktplatz, als Sprach-KI in der Hotline und als hybride Beratung in der neuen Filiale. Die Wahl liegt beim Kunden, der Kontext folgt ihm überall hin.',
    bullets: [
      'Sprach-KI mit LLM-Routing nimmt jeden Erstkontakt — eskaliert nur bei Substanz',
      'Foto-realistische Avatare führen empathische Gespräche mit Lebenslagen-Kontext',
      'Spatial-Banking-Pavillon ersetzt die klassische Filiale am Marktplatz',
    ],
    stats: [
      { label: 'Self-Service-Quote', value: '78 %' },
      { label: 'NPS-Lift',           value: '+24' },
      { label: 'Time-to-Answer',     value: '< 8 s' },
    ],
  },
]

export function findFloor(id: FloorId): FloorContent | undefined {
  return FLOORS.find((f) => f.id === id)
}
