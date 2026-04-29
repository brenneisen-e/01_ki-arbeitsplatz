import type { Hotspot } from '../types'

// Koordinaten normalisiert 0..1 relativ zum Hero-Bild.
// Justiert auf das aktuelle Bild (drei klar getrennte Etagen):
//   y ≈ 0.18  → Boardroom
//   y ≈ 0.50  → Operations
//   y ≈ 0.82  → Datacenter

export const HOTSPOTS: ReadonlyArray<Hotspot> = [
  {
    id: 'top-boardroom',
    floor: 'top',
    x: 0.50, y: 0.20,
    title: 'AI Governance Board',
    subtitle: 'CAIDO · Risk · Model Lifecycle',
    body: 'Ein Chief AI Officer und ein AI-Governance-Board steuern die Transformation auf C-Level. Risiko-Klassifizierung gemäß EU AI Act, Modell-Lifecycle und auditierbare Entscheidungen — direkt am Vorstandstisch.',
  },
  {
    id: 'top-display',
    floor: 'top',
    x: 0.30, y: 0.16,
    title: 'Strategic Radar',
    subtitle: 'Embedded finance · stablecoins · platform banking',
    body: 'Live-Cockpit für strategische Bewegung im Markt. Embedded Finance, Stablecoin-Rails, tokenisierte Assets — sichtbar bevor sie unausweichlich werden.',
  },
  {
    id: 'mid-process',
    floor: 'ground',
    x: 0.55, y: 0.48,
    title: 'Process Mining & Hyperautomation',
    subtitle: 'Real-time process intelligence',
    body: 'Jeder Geschäftsvorfall wird gemessen und visualisiert. Engstellen werden zu Automatisierungs-Kandidaten mit quantifiziertem ROI. Dunkelverarbeitung ist Standard.',
  },
  {
    id: 'mid-workstations',
    floor: 'ground',
    x: 0.30, y: 0.52,
    title: 'Agentic Operations',
    subtitle: 'Self-orchestrating workflows',
    body: 'KI-Agenten übernehmen Routine-Entscheidungen über Kredit, KYC, Service. Sie reichen weiter, dokumentieren ihre Argumentation und werden mit jeder Schleife besser.',
  },
  {
    id: 'basement-data',
    floor: 'basement',
    x: 0.50, y: 0.82,
    title: 'Data Backbone',
    subtitle: 'LLM Gateway · Vector Search · Feature Store',
    body: 'Realtime-Datenmesh trägt jeden Geschäftsprozess. LLM-Gateway routet, cached und enforced Policy bei jedem Modell-Call. Single Source of Truth für Retrieval-Augmented Generation.',
  },
  {
    id: 'basement-control',
    floor: 'basement',
    x: 0.18, y: 0.82,
    title: 'Live Observability',
    subtitle: 'p95 latency · cache hit rate · policy enforcement',
    body: 'Jedes Modell, jede Transaktion ist End-to-End getraced. Anomalien tauchen auf, bevor Kunden sie spüren. Compliance-Evidenz wird kontinuierlich erzeugt, nicht erst zum Audit.',
  },

  // PLAZA / KUNDENPERSPEKTIVE ─────────────────────────────────────
  {
    id: 'customer-hotline',
    floor: 'plaza',
    x: 0.20, y: 0.55,
    title: 'AI-Hotline',
    subtitle: 'Sprachassistenz mit LLM-Routing',
    body: 'Sprach-KI nimmt das Anliegen entgegen, klärt Routine ab und routet erst bei Bedarf an einen menschlichen Berater weiter. Lebenslagen-Kontext liegt vor dem ersten Wort vor.',
  },
  {
    id: 'customer-avatar',
    floor: 'plaza',
    x: 0.42, y: 0.50,
    title: 'Holographische KI-Beratung',
    subtitle: 'Persönlicher Avatar im Video-Call',
    body: 'Foto-realistischer Avatar führt das Gespräch — empathisch, lippensynchron, mit Live-Zugriff auf Produkte, Verträge und Lebensereignisse.',
  },
  {
    id: 'customer-walking',
    floor: 'plaza',
    x: 0.60, y: 0.55,
    title: 'Filiale neu gedacht',
    subtitle: 'Hybride Beratungserlebnisse',
    body: 'Filiale wird zum Treffpunkt für komplexe Entscheidungen. Routine bleibt digital, Bauchgefühl-Themen werden im Raum geklärt — mit derselben Datenbasis im Hintergrund.',
  },
  {
    id: 'customer-pavilion',
    floor: 'plaza',
    x: 0.88, y: 0.50,
    title: 'Self-Service Pavillon',
    subtitle: 'Spatial Banking Interface',
    body: 'Holographisches Display am Marktplatz — Identifikation, Beratung und Vertragsabschluss in einer Spatial-Computing-Interaktion. Branchless, aber präsent.',
  },
]
