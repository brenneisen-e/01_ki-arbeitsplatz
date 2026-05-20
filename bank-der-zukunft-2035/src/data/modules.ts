/**
 * Alle editierbaren Workshop-Inhalte. Texte hier anpassen -- alles andere
 * (Etagen-Layout, Hotspot-Positionen, Visuals) ist Code.
 *
 * Hotspot-Positionen sind Prozent-Koordinaten innerhalb der jeweiligen
 * Etage (0 = links/oben, 100 = rechts/unten). So bleibt das Layout
 * responsive.
 */

import type { LucideIcon } from 'lucide-react'
import {
  Bot,
  CircuitBoard,
  Database,
  Gauge,
  Lock,
  Network,
  ShieldCheck,
  Sparkles,
  Workflow,
} from 'lucide-react'

export type FloorId = 'boardroom' | 'operations' | 'datacenter'

export type FloorDef = {
  id: FloorId
  /** vertikale Reihenfolge -- 0 oben, 2 unten */
  order: number
  shortLabel: string
  title: string
  subtitle: string
  ambient: string
}

export type HotspotDef = {
  id: string
  floor: FloorId
  /** Position in % innerhalb der Etage */
  x: number
  y: number
  icon: LucideIcon
  label: string
  title: string
  description: string
  /** Pointed-Statement, das im Workshop hängenbleibt */
  hypothesis: string
  facts?: { label: string; value: string }[]
}

export const FLOORS: FloorDef[] = [
  {
    id: 'boardroom',
    order: 0,
    shortLabel: 'Vorstand',
    title: 'Vorstand & AI Governance',
    subtitle: 'Der Raum, in dem Banking-Entscheidungen entstehen.',
    ambient:
      'Tageslicht-Boardroom mit Wand-Dashboard. Kapitaladäquanz, Liquidität und Risiko werden hier in Echtzeit verhandelt.',
  },
  {
    id: 'operations',
    order: 1,
    shortLabel: 'Operations',
    title: 'Operations & Hybrid Teams',
    subtitle: 'Mensch und Modell teilen sich das Workflow-Backbone.',
    ambient:
      'Open-Plan-Etage. Service-Roboter, KI-Agenten und Spezialist:innen routen den Tagesfluss von 12,4 Mio. EUR Volumen.',
  },
  {
    id: 'datacenter',
    order: 2,
    shortLabel: 'IT & Data',
    title: 'IT, Daten & Plattform',
    subtitle: 'Das Fundament, das alles trägt -- physisch und digital.',
    ambient:
      'Server-Rack-Ebene. Fiber-Pulse wandern nach oben, Logs laufen durch -- die Plattform atmet.',
  },
]

export const HOTSPOTS: HotspotDef[] = [
  // Boardroom
  {
    id: 'governance-cockpit',
    floor: 'boardroom',
    x: 50,
    y: 32,
    icon: Gauge,
    label: 'Governance Cockpit',
    title: 'Governance Cockpit',
    description:
      'Live-Sicht auf alle aufsichtsrechtlich kritischen Werte. Kapitaladäquanz, LCR, NSFR und Risiko-Exposure werden aus den Quellsystemen gestreamt und mit Erklärungs-KI annotiert.',
    hypothesis:
      'Hypothese 2035: Aufsichtsgespräche laufen über ein einziges Dashboard, nicht über Quartals-PDFs.',
    facts: [
      { label: 'Quellen', value: '14 Systeme' },
      { label: 'Latenz', value: '< 90 Sek' },
      { label: 'Erklär-Tiefe', value: '3 Ebenen' },
    ],
  },
  {
    id: 'ai-policy',
    floor: 'boardroom',
    x: 78,
    y: 60,
    icon: ShieldCheck,
    label: 'AI Policy & Audit',
    title: 'AI Policy & Model Audit',
    description:
      'Eine eigene Abteilung verwaltet Modelle wie Produkte -- mit Versionierung, Bias-Tests, Eskalationspfaden und einer öffentlich einsehbaren Modellkarte je Use Case.',
    hypothesis:
      'Hypothese 2035: AI Governance ist eine eigene Vorstandsfunktion, mindestens auf Augenhöhe mit CRO.',
    facts: [
      { label: 'Modelle im Betrieb', value: '47' },
      { label: 'Modelle in Quarantäne', value: '3' },
      { label: 'Audit-Tiefe', value: 'L2' },
    ],
  },
  {
    id: 'capital-strategy',
    floor: 'boardroom',
    x: 22,
    y: 62,
    icon: Sparkles,
    label: 'Capital Strategy',
    title: 'Capital & Pricing Strategy',
    description:
      'Capital-Allocation-Modelle laufen kontinuierlich, nicht nur quartalsweise. Pricing-Vorschläge für Neugeschäft kommen mit Sensitivitäten und Stress-Szenarien direkt in die Sitzung.',
    hypothesis:
      'Hypothese 2035: Pricing-Entscheidungen sind szenariobasiert -- das Modell zeigt die Bandbreite, der Mensch wählt.',
    facts: [
      { label: 'Szenarien', value: '8 parallel' },
      { label: 'Rebalancing', value: 'täglich' },
    ],
  },

  // Operations
  {
    id: 'ai-copilot',
    floor: 'operations',
    x: 50,
    y: 38,
    icon: Bot,
    label: 'KI-Copilot',
    title: 'KI-Copilot für Spezialist:innen',
    description:
      'Jede:r Sachbearbeiter:in arbeitet mit einem persönlichen Copilot. Vorgänge werden vorgeprüft, Begründungen vorgeschlagen, Eskalationen markiert -- aber die Entscheidung bleibt menschlich.',
    hypothesis:
      'Hypothese 2035: Der Durchsatz pro Kopf verdoppelt sich, weil 40 % der Bearbeitungszeit Routine-Begründungen sind.',
    facts: [
      { label: 'STP-Quote', value: '62 %' },
      { label: 'Eskalationsrate', value: '5,1 %' },
      { label: 'Tagesvolumen', value: '12,4 Mio. EUR' },
    ],
  },
  {
    id: 'process-fabric',
    floor: 'operations',
    x: 20,
    y: 60,
    icon: Workflow,
    label: 'Process Fabric',
    title: 'Process Fabric: INPUT → SETTLE',
    description:
      'Die fünf Prozess-Schritte INPUT, VALIDATE, ENRICH, ROUTE, SETTLE sind als eine Plattform abgebildet. Jeder Schritt kann von Mensch, Modell oder Robotic-Service-Worker übernommen werden.',
    hypothesis:
      'Hypothese 2035: Prozesse werden komponiert, nicht codiert -- jeder Vorgang wird zur Laufzeit zusammengesteckt.',
    facts: [
      { label: 'Komponenten', value: '38' },
      { label: 'Tägliche Vorgänge', value: '94.000' },
    ],
  },
  {
    id: 'service-bot',
    floor: 'operations',
    x: 78,
    y: 62,
    icon: Network,
    label: 'Service-Mesh',
    title: 'Autonomous Service Worker',
    description:
      'Ein autonomer Service-Worker übernimmt Logistik, Postraum und physische Übergaben zwischen Teams. Er ist Symbol für eine Klasse von Agents, die wirklich „durchs Haus laufen".',
    hypothesis:
      'Hypothese 2035: Im Bankhaus laufen mehr Software-Agents als Mitarbeitende -- still, im Hintergrund, gemessen.',
    facts: [
      { label: 'Tasks pro Tag', value: '~1.300' },
      { label: 'Mean Time To Action', value: '2,1 Sek' },
    ],
  },

  // Data Center
  {
    id: 'platform-core',
    floor: 'datacenter',
    x: 28,
    y: 50,
    icon: Database,
    label: 'Platform Core',
    title: 'Platform Core & Data Mesh',
    description:
      'Domänen besitzen ihre Daten als Produkt. Ein zentraler Catalog kennt jede Tabelle, jeden Verbraucher, jede Re-Use-Lizenz -- inklusive automatischer DSGVO-Begründungen.',
    hypothesis:
      'Hypothese 2035: Datenprodukte sind versioniert, monetarisiert und vom Konsumenten aus selbst bedienbar.',
    facts: [
      { label: 'Domänen', value: '11' },
      { label: 'Datenprodukte', value: '212' },
    ],
  },
  {
    id: 'quantum-vault',
    floor: 'datacenter',
    x: 60,
    y: 42,
    icon: Lock,
    label: 'Post-Quantum Vault',
    title: 'Post-Quantum Vault',
    description:
      'Schlüsselmaterial wandert auf quanten-resistente Verfahren. Der Vault ist physisch sichtbar als HSM-Schrank, weil Security im Workshop angefasst werden muss, nicht nur erklärt.',
    hypothesis:
      'Hypothese 2035: Post-Quantum-Migration ist kein Projekt mehr, sondern ein Dauerzustand.',
    facts: [
      { label: 'Schlüssel migriert', value: '74 %' },
      { label: 'Algorithmen', value: 'CRYSTALS / Dilithium' },
    ],
  },
  {
    id: 'observability',
    floor: 'datacenter',
    x: 80,
    y: 60,
    icon: CircuitBoard,
    label: 'Telemetry Loop',
    title: 'Telemetry & Self-Healing',
    description:
      'Live-Logs, Tracing-Spans und Modell-Telemetrie laufen in eine Feedback-Schleife. Das System repariert Routinefehler selbst und eskaliert das, was wirklich neu ist.',
    hypothesis:
      'Hypothese 2035: 80 % aller Incidents werden geschlossen, bevor ein Mensch sie sieht.',
    facts: [
      { label: 'MTTR', value: '4,2 Min' },
      { label: 'Auto-Recovery', value: '81 %' },
    ],
  },
]

/** Initiale Werte für das Governance-Cockpit -- werden vom Ticker mutiert. */
export const COCKPIT_INITIAL = {
  /** Capital Adequacy Ratio in Prozent */
  car: 17.8,
  /** Liquidity Coverage Ratio in Prozent */
  lcr: 138.4,
  /** Net Stable Funding Ratio in Prozent */
  nsfr: 121.7,
  /** Risk Exposure als Anteil der Risikolimits, 0-1 */
  riskExposure: 0.42,
  /** Tagesvolumen in Mio. EUR */
  dailyVolume: 12.4,
  /** STP-Quote in Prozent */
  stp: 62,
  /** Vier Quartals-Balken für Net Interest Income */
  nii: [128, 134, 141, 152],
}

export const TERMINAL_TEMPLATE = [
  { tag: 'ok' as const, text: 'core/ledger-stream connected · partition 0..7' },
  { tag: 'ok' as const, text: 'feature-store/customer-360 refreshed (Δ 14.2k rows)' },
  { tag: 'ok' as const, text: 'model/credit-risk v2026.04 — promotion gate green' },
  { tag: 'warn' as const, text: 'model/fraud-net v2026.03 — drift score 0.42 ↑ watching' },
  { tag: 'ok' as const, text: 'kms/post-quantum migration batch 074 committed' },
  { tag: 'ok' as const, text: 'platform/data-mesh — domain "treasury" published' },
  { tag: 'ok' as const, text: 'agent/swift-router — 218 messages routed last 60s' },
  { tag: 'warn' as const, text: 'gateway/europe-west3 latency 142ms (sla 120ms)' },
  { tag: 'ok' as const, text: 'agent/service-worker-04 — task batch closed' },
  { tag: 'ok' as const, text: 'catalog/dsgvo annotations regenerated' },
  { tag: 'ok' as const, text: 'governance/aut-trail — quarterly export sealed' },
  { tag: 'ok' as const, text: 'observability/self-heal — incident 8821 resolved automatically' },
  { tag: 'ok' as const, text: 'agent/loan-decision — 412 decisions, 0 escalations' },
  { tag: 'warn' as const, text: 'capacity/forecast — peak utilisation 78 % next 6h' },
] satisfies { tag: 'ok' | 'warn'; text: string }[]

export const HOTSPOTS_BY_FLOOR: Record<FloorId, HotspotDef[]> = {
  boardroom: HOTSPOTS.filter((h) => h.floor === 'boardroom'),
  operations: HOTSPOTS.filter((h) => h.floor === 'operations'),
  datacenter: HOTSPOTS.filter((h) => h.floor === 'datacenter'),
}
