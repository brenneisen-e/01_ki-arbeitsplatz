import type { Hotspot } from '../types'

// Koordinaten normalisiert 0..1 relativ zum Hero-Bild.
// Drei Etagen + Plaza, alle Inhalte auf Deutsch.

export const HOTSPOTS: ReadonlyArray<Hotspot> = [
  {
    id: 'top-boardroom',
    floor: 'top',
    x: 0.50, y: 0.20,
    title: 'KI-Governance-Board',
    subtitle: 'CAIDO · Risiko · Modell-Lifecycle',
    body: 'Ein Chief AI Officer und ein KI-Governance-Board steuern die Transformation auf C-Level. Risiko-Klassifizierung gemäß EU AI Act, Modell-Lifecycle und auditierbare Entscheidungen — direkt am Vorstandstisch.',
  },
  {
    id: 'top-display',
    floor: 'top',
    x: 0.30, y: 0.16,
    title: 'Strategisches Radar',
    subtitle: 'Embedded Finance · Stablecoins · Plattform-Banking',
    body: 'Live-Cockpit für strategische Marktbewegung. Embedded Finance, Stablecoin-Rails, tokenisierte Assets — sichtbar bevor sie unausweichlich werden.',
  },
  {
    id: 'mid-process',
    floor: 'ground',
    x: 0.55, y: 0.48,
    title: 'Process Mining & Hyperautomation',
    subtitle: 'Echtzeit-Prozessintelligenz',
    body: 'Jeder Geschäftsvorfall wird gemessen und visualisiert. Engstellen werden zu Automatisierungs-Kandidaten mit quantifiziertem ROI. Dunkelverarbeitung wird zum Standard.',
  },
  {
    id: 'mid-workstations',
    floor: 'ground',
    x: 0.30, y: 0.52,
    title: 'Agentische Operations',
    subtitle: 'Selbst-orchestrierende Workflows',
    body: 'KI-Agenten übernehmen Routine-Entscheidungen über Kredit, KYC und Service. Sie reichen weiter, dokumentieren ihre Argumentation und werden mit jeder Schleife besser.',
  },
  {
    id: 'basement-data',
    floor: 'basement',
    x: 0.50, y: 0.82,
    title: 'Daten-Backbone',
    subtitle: 'LLM-Gateway · Vector Search · Feature Store',
    body: 'Echtzeit-Datenmesh trägt jeden Geschäftsprozess. Das LLM-Gateway routet, cached und enforced Policies bei jedem Modell-Aufruf. Single Source of Truth für Retrieval-Augmented Generation.',
  },
  {
    id: 'basement-control',
    floor: 'basement',
    x: 0.18, y: 0.82,
    title: 'Live-Beobachtung',
    subtitle: 'p95-Latenz · Cache-Trefferquote · Policy-Enforcement',
    body: 'Jedes Modell, jede Transaktion ist End-to-End getraced. Anomalien tauchen auf, bevor Kunden sie spüren. Compliance-Evidenz entsteht kontinuierlich, nicht erst zum Audit.',
  },

  // PLAZA / KUNDENPERSPEKTIVE ─────────────────────────────────────
  {
    id: 'customer-hotline',
    floor: 'plaza',
    x: 0.20, y: 0.55,
    title: 'KI-Hotline',
    subtitle: 'Sprachassistenz mit LLM-Routing',
    body: 'Die Sprach-KI nimmt das Anliegen entgegen, klärt Routinefragen ab und routet erst bei Bedarf an einen menschlichen Berater weiter. Lebenslagen-Kontext liegt vor dem ersten Wort vor.',
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
    body: 'Die Filiale wird zum Treffpunkt für komplexe Entscheidungen. Routine bleibt digital, Bauchgefühl-Themen werden im Raum geklärt — mit derselben Datenbasis im Hintergrund.',
  },
  {
    id: 'customer-pavilion',
    floor: 'plaza',
    x: 0.88, y: 0.50,
    title: 'Self-Service-Pavillon',
    subtitle: 'Spatial-Banking-Interface',
    body: 'Holographisches Display am Marktplatz — Identifikation, Beratung und Vertragsabschluss in einer Spatial-Computing-Interaktion. Branchless, aber präsent.',
  },
]
