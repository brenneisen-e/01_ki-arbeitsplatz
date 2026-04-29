import type { Hotspot } from '../types'

// Koordinaten sind normalisiert 0..1 relativ zum Hero-Bild.
// Justiert nach finaler Bildposition — Eike kann jeden Wert
// hier direkt anpassen, ohne Code-Änderung.

export const HOTSPOTS: ReadonlyArray<Hotspot> = [
  // KELLER ───────────────────────────────────────────────────────
  {
    id: 'core-data-center',
    floor: 'basement',
    x: 0.42, y: 0.78,
    title: 'Data Backbone',
    subtitle: 'LLM Gateway · Vector Search · Feature Store',
    body: 'Realtime data mesh underpins every business process. The LLM gateway routes, caches and enforces policy on every model call. Single source of truth for retrieval-augmented generation.',
  },
  {
    id: 'observability',
    floor: 'basement',
    x: 0.55, y: 0.78,
    title: 'Live Observability',
    subtitle: 'p95 latency · cache hit rate · policy enforcement',
    body: 'Every model and every transaction is traced end to end. Anomalies surface before customers feel them. Compliance evidence is generated continuously, not at audit time.',
  },

  // ERDGESCHOSS ──────────────────────────────────────────────────
  {
    id: 'process-mining',
    floor: 'ground',
    x: 0.62, y: 0.55,
    title: 'Process Mining & Hyperautomation',
    subtitle: 'Real-time process intelligence',
    body: 'Every business event is observed. Bottlenecks become automation candidates with quantified ROI. Dark processing becomes the default; humans only handle true exceptions.',
  },
  {
    id: 'agentic-ops',
    floor: 'ground',
    x: 0.45, y: 0.55,
    title: 'Agentic Operations',
    subtitle: 'Self-orchestrating workflows',
    body: 'AI agents take routine decisions across credit, KYC, customer service. They hand off seamlessly, document their reasoning and improve with every loop.',
  },

  // VORSTAND ─────────────────────────────────────────────────────
  {
    id: 'ai-governance',
    floor: 'top',
    x: 0.50, y: 0.30,
    title: 'AI Governance Board',
    subtitle: 'CAIDO · Risk · Compliance · Model Lifecycle',
    body: 'A Chief AI Officer reports to the board. Risk classification per the EU AI Act is built in. Every model has a registry entry, a lifecycle and an auditable decision trail.',
  },
  {
    id: 'strategic-radar',
    floor: 'top',
    x: 0.30, y: 0.30,
    title: 'Strategic Radar',
    subtitle: 'Embedded finance · stablecoins · platform banking',
    body: 'The board sees adjacent threats and platform plays in real time. Embedded finance, stablecoin rails, tokenized assets — surfaced when they become material, not when they are inevitable.',
  },

  // AUSSEN ───────────────────────────────────────────────────────
  {
    id: 'customer-video',
    floor: 'outdoor',
    x: 0.20, y: 0.85,
    title: 'AI Avatar Banking',
    subtitle: '24/7 personalized advisor in your pocket',
    body: 'Photo-realistic avatars conduct conversations with empathy and lip-sync. They know the customer’s life context and hand off to a human only when value warrants it.',
  },
  {
    id: 'customer-pavilion',
    floor: 'outdoor',
    x: 0.85, y: 0.85,
    title: 'Self-Service Pavilion',
    subtitle: 'Spatial computing banking interface',
    body: 'Holographic pavilion experience for in-person flows. Identity, advice and product issuance in a single, transparent interaction — branchless yet present.',
  },
]
