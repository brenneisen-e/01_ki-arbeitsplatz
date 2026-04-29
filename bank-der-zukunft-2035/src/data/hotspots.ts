import type { Hotspot } from '../types'

export const HOTSPOTS: ReadonlyArray<Hotspot> = [
  {
    id: 'server-rack',
    floor: 'basement',
    x: 460, y: 620,
    title: 'Core-Datacenter',
    body: 'Cloud-native Server-Cluster mit Realtime-Streaming und Vektor-Indizes. Laufzeit für LLM-Gateway, Feature-Store und Event-Bus.',
  },
  {
    id: 'data-pulse',
    floor: 'basement',
    x: 800, y: 660,
    title: 'Daten-Pulse',
    body: 'Events fließen in Echtzeit zwischen den Etagen — vom Kerndatenpool über Operations bis ins Vorstands-Cockpit.',
  },
  {
    id: 'process-mining',
    floor: 'ground',
    x: 1090, y: 510,
    title: 'Process Mining',
    body: 'Jeder Geschäftsvorfall wird gemessen und visualisiert. Engstellen werden zu Auto­matisierungs-Kandidaten priorisiert.',
  },
  {
    id: 'rpa-bot',
    floor: 'ground',
    x: 760, y: 540,
    title: 'RPA-Bot',
    body: 'KI-orchestrierte Bots verbinden Legacy-Masken mit modernen APIs. Sie übernehmen die Arbeit, die kein Mensch mehr machen sollte.',
  },
  {
    id: 'ai-avatar',
    floor: 'top',
    x: 900, y: 250,
    title: 'KI-Co-Pilot im Vorstand',
    body: 'Eine konversationale KI fasst Risiko-Lage, Marktentwicklung und Modell-Performance in Echtzeit zusammen — direkt am Vorstandstisch.',
  },
  {
    id: 'governance-cockpit',
    floor: 'top',
    x: 530, y: 280,
    title: 'AI-Governance-Cockpit',
    body: 'Modell-Registry, Risk-Heatmap, EU-AI-Act-Status — alles in einem Live-Dashboard. CAIDO steuert die Transformation auf Basis dieser Daten.',
  },
  {
    id: 'customer-phone',
    floor: 'outdoor',
    x: 150, y: 870,
    title: 'Bank-Hotline',
    body: 'Sprach-KI nimmt das Anliegen entgegen, klärt Routine ab und reicht erst bei Bedarf an einen menschlichen Berater weiter.',
  },
  {
    id: 'customer-video',
    floor: 'outdoor',
    x: 1240, y: 850,
    title: 'KI-Avatar-Beratung',
    body: 'Foto-realistischer Avatar im Video-Call. Empathisch, lippensynchron, erklärt Produkte mit Kontext aus der Lebenslage.',
  },
  {
    id: 'customer-pavillon',
    floor: 'outdoor',
    x: 1500, y: 880,
    title: 'Banking-Pavillon',
    body: 'Holografisches Display am Marktplatz — beratungsfähig 24/7, ohne Filiale, ohne Wartezimmer.',
  },
]
