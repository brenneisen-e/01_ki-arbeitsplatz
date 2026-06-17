// ─────────────────────────────────────────────────────────────────────────────
// EDEKABANK Holodeck 2031 — Datenmodell & Inhalte
//
// Begehbare Kommandobrücke: ein Ankerbild der runden Brücke; fünf anklickbare
// Stationen führen per Kameraflug in einen Deep-Dive (Bild links, Text rechts).
// Quelle der Wahrheit für Texte/Struktur: edekabank/holodeck-2031-build-spec.md.
// Tool-Texte sind 1:1 aus der Spec (§8) übernommen.
//
// Eigenständiges, additives Tool — unabhängig vom Banking-2035-Strukturbild.
// ─────────────────────────────────────────────────────────────────────────────

export type AreaId = 'vertrieb' | 'produkt' | 'betrieb' | 'risiko' | 'it'

export interface Zone {
  /** Mittelpunkt der Station auf dem Ankerbild, in % der Bildbreite/-höhe (0–100). */
  x: number
  y: number
  /** Klick-/Hotspot-Radius in % (für die unsichtbare Trefferfläche). */
  r: number
}

export interface AreaField {
  /** z. B. "Mandat", "Skills", "Zielbild Automatisierung", "Delta zu heute". */
  label: string
  text: string
}

export interface Area {
  id: AreaId
  label: string // "Vertrieb"
  persona: string // "Lena Brandt, 34"
  role: string // "Relationship Lead"
  screenTitle: string // "HÄNDLER-RADAR"
  image: string // "/images/holodeck/01-vertrieb.png"
  alt: string
  zone: Zone // Position der Station auf dem Ankerbild
  fields: AreaField[]
}

export type View =
  | { kind: 'overview' }
  | { kind: 'deepdive'; areaId: AreaId }
  | { kind: 'outro' }

// ── Ankerbild der Brücke ─────────────────────────────────────────────────────
export const ANKER = {
  src: './images/holodeck/00-anker.png',
  alt: 'Runde Kommandobrücke der EDEKABANK 2031: zwei Vorstände vorne am Pult „EDEKABANK", dahinter im Bogen fünf Spezialstationen vor einer großen Datenwand (Märkte, Händler-Liquidität, Zahlungsströme, Risikosignale).',
}

// ── Zonen-Startwerte (Spec §7) — am echten Ankerbild über den Debug-Editor
//    (Taste „D" / ?debug) final justieren. ────────────────────────────────────
export const ZONES: Record<AreaId, Zone> = {
  vertrieb: { x: 22, y: 60, r: 12 }, // vorne links
  it: { x: 78, y: 60, r: 12 }, // vorne rechts
  produkt: { x: 31, y: 44, r: 10 }, // hinten links
  risiko: { x: 69, y: 44, r: 10 }, // hinten rechts
  betrieb: { x: 50, y: 39, r: 10 }, // hinten Mitte
}

// ── Einstieg „Die Brücke" (Overview-Text rechts) ─────────────────────────────
export const BRIDGE = {
  title: 'EDEKABANK Holodeck 2031',
  these:
    'Die KI-native Bank ist kein Technologie-Upgrade der bestehenden Bank, sondern ein anderes Betriebsmodell — Menschen steuern, KI exekutiert.',
  leitfrage:
    'Nicht „Welche KI?", sondern „Sind wir bereit, Aufbau-, Rollen- und Steuerungslogik entsprechend umzubauen?"',
}

// ── Abschluss „Die Führungsfrage" (Outro) ────────────────────────────────────
export const OUTRO = {
  title: 'Die Führungsfrage',
  strukturthese:
    'Weniger Rollen, Schnittstellen und Abstimmungsschleifen; dafür Konzentration von Steuerung und Verantwortung auf wenige Punkte — Führung über Leitplanken und Ausnahmen statt Einzelfallkontrolle.',
  entscheidung:
    'Operating-Model-Redesign vs. KI als Aufsatz auf den Status quo. Letzteres erhöht die Kostenbasis, ohne den Strukturvorteil zu heben — teure alte Bank statt neue.',
}

const FIELD_LABELS = {
  mandat: 'Mandat',
  skills: 'Skills',
  zielbild: 'Zielbild Automatisierung',
  delta: 'Delta zu heute',
} as const

// ── Die fünf Stationen (Spec §8, verbatim) ───────────────────────────────────
export const AREAS: Area[] = [
  {
    id: 'vertrieb',
    label: 'Vertrieb',
    persona: 'Lena Brandt, 34',
    role: 'Relationship Lead',
    screenTitle: 'HÄNDLER-RADAR',
    image: './images/holodeck/01-vertrieb.png',
    alt: 'Relationship Lead über die Schulter vor dem Bildschirm „HÄNDLER-RADAR" mit Liquiditätsengpässen, Expansionssignalen und regionaler Verteilung.',
    zone: ZONES.vertrieb,
    fields: [
      {
        label: FIELD_LABELS.mandat,
        text: 'Steuert Akquise und Bindung im Händlergeschäft; verlagert den eigenen Einsatz von Volumen auf die wenigen wertentscheidenden Interaktionen.',
      },
      {
        label: FIELD_LABELS.skills,
        text: 'Relationship- und Verhandlungskompetenz; kritische Bewertung KI-generierter Handlungsempfehlungen; Eskalations- und Abschlusssicherheit in Hochwert-Situationen.',
      },
      {
        label: FIELD_LABELS.zielbild,
        text: 'KI antizipiert Bedarfe (Liquidität, Saison, Expansion) und steuert Ansprache, Angebot und Timing autonom; menschlicher Eingriff nur an definierten Vertrauens-Touchpoints.',
      },
      {
        label: FIELD_LABELS.delta,
        text: 'Heute reaktiv, manuell, mit später Signalerkennung. Implikation: Vertriebskapazität verschiebt sich von Breite zu Tiefe — weniger Köpfe, höhere Anforderung pro Kopf.',
      },
    ],
  },
  {
    id: 'produkt',
    label: 'Produkt',
    persona: 'Jonas Keller, 29',
    role: 'Solution Designer',
    screenTitle: 'LÖSUNGS-BAUKASTEN',
    image: './images/holodeck/02-produkt.png',
    alt: 'Solution Designer vor dem Bildschirm „LÖSUNGS-BAUKASTEN" mit modularen Bausteinen (Kredit, Liquidität, Payment) und einer maßgeschneiderten Lösung.',
    zone: ZONES.produkt,
    fields: [
      {
        label: FIELD_LABELS.mandat,
        text: 'Verantwortet Passung und Marge des Lösungsangebots; gestaltet den Baukasten und die Leitplanken, nicht das Einzelprodukt.',
      },
      {
        label: FIELD_LABELS.skills,
        text: 'Modulares Produktdenken; Ökonomie des Händlergeschäfts; Definition von Guardrails und Freigabelogik für KI-Konfiguration.',
      },
      {
        label: FIELD_LABELS.zielbild,
        text: 'KI konfiguriert je Cluster in Echtzeit die optimale Lösung aus Modulen und re-optimiert kontinuierlich; Time-to-Solution von Monaten auf Minuten.',
      },
      {
        label: FIELD_LABELS.delta,
        text: 'Heute lange Entwicklungszyklen und Standardprodukte mit Streuverlust. Implikation: Der statische Produktkatalog — und die Funktion, die ihn pflegt — verliert seine Existenzberechtigung.',
      },
    ],
  },
  {
    id: 'betrieb',
    label: 'Betrieb',
    persona: 'Aylin Demir, 45',
    role: 'Operations Steward',
    screenTitle: 'AUTONOME ABWICKLUNG',
    image: './images/holodeck/03-betrieb.png',
    alt: 'Operations Steward über die Schulter vor dem Bildschirm „AUTONOME ABWICKLUNG" mit Kredit, KYC und Abwicklung sowie STP-Quoten.',
    zone: ZONES.betrieb,
    fields: [
      {
        label: FIELD_LABELS.mandat,
        text: 'Sichert Durchlauf und Qualität in Kredit, KYC und Abwicklung; steuert das Ausnahme-Regime statt des Normalbetriebs.',
      },
      {
        label: FIELD_LABELS.skills,
        text: 'Prozess- und Kontrollkompetenz; Entscheidungsstärke im Ausnahmefall; Sensorik dafür, welche Fälle bewusst dem Menschen vorbehalten bleiben.',
      },
      {
        label: FIELD_LABELS.zielbild,
        text: 'Straight-Through-Processing für das Gros der Fälle; der Mensch bearbeitet nur Exceptions. Steuerungsgröße ist die Qualität der Ausnahmeerkennung, nicht das Bearbeitungsvolumen.',
      },
      {
        label: FIELD_LABELS.delta,
        text: 'Heute personalintensive Einzelfallbearbeitung. Implikation: Bei STP-Quoten jenseits 90 % ist nicht Effizienz die Frage, sondern der Kapazitäts- und Rollenumbau im Backoffice.',
      },
    ],
  },
  {
    id: 'risiko',
    label: 'Risiko & Steuerung',
    persona: 'Robert Hofer, 57',
    role: 'Risk & Resilience Officer',
    screenTitle: 'FRÜHWARNUNG & SZENARIEN',
    image: './images/holodeck/04-risiko.png',
    alt: 'Risk & Resilience Officer vor dem Bildschirm „FRÜHWARNUNG & SZENARIEN" mit Frühindikatoren und einer Szenariosimulation (Kaufkraft −10 %).',
    zone: ZONES.risiko,
    fields: [
      {
        label: FIELD_LABELS.mandat,
        text: 'Verantwortet Früherkennung und Resilienz; verlagert die Funktion von Reporting zu aktiver Vorsteuerung.',
      },
      {
        label: FIELD_LABELS.skills,
        text: 'Szenario- und Frühindikatorenkompetenz; präventive statt reaktiver Steuerungslogik; Entscheidungsfähigkeit unter Unsicherheit.',
      },
      {
        label: FIELD_LABELS.zielbild,
        text: 'Echtzeit-Signalauswertung, kontinuierliche Szenariosimulation (z. B. Kaufkraft −10 %) und automatisierte Maßnahmenempfehlung vor Eskalation.',
      },
      {
        label: FIELD_LABELS.delta,
        text: 'Heute periodisches, rückblickendes Reporting. Implikation: Verschiebung von Schadensverwaltung zu Schadensvermeidung — mit entsprechend anderem Funktions- und Kompetenzprofil.',
      },
    ],
  },
  {
    id: 'it',
    label: 'IT & Daten',
    persona: 'Priya Nair, 38',
    role: 'Platform & Data Steward',
    screenTitle: 'DATEN- & KI-PLATTFORM',
    image: './images/holodeck/05-it.png',
    alt: 'Platform & Data Steward über die Schulter vor dem Bildschirm „DATEN- & KI-PLATTFORM" mit Datenintegration, Modellen, Modell-Monitoring und Governance.',
    zone: ZONES.it,
    fields: [
      {
        label: FIELD_LABELS.mandat,
        text: 'Verantwortet das Daten- und KI-Betriebssystem als Enabler aller Automatisierung; sichert Vertrauenswürdigkeit der Modelle.',
      },
      {
        label: FIELD_LABELS.skills,
        text: 'Daten- und Plattformarchitektur; Modell-Governance und -Sicherheit; Übersetzung zwischen Technik, Fachbereich und Aufsicht.',
      },
      {
        label: FIELD_LABELS.zielbild,
        text: 'Integriertes Datenfundament (Händler-, Bank-, Externdaten) speist alle Use Cases; Modelle laufend überwacht, abgesichert und governt.',
      },
      {
        label: FIELD_LABELS.delta,
        text: 'Heute Datensilos und isolierte Pilotierung. Implikation: Der kritische Investitionshebel ist nicht das Modell, sondern das Datenfundament — typischerweise unterinvestiert und aufgeschoben.',
      },
    ],
  },
]

/** Bildpfade (Anker + 5 Deep-Dives) zum Vorladen. */
export const HOLODECK_IMAGE_SRCS: string[] = [ANKER.src, ...AREAS.map((a) => a.image)]

/** Reihenfolge der Bereiche (Prev/Next). */
export const AREA_ORDER: AreaId[] = AREAS.map((a) => a.id)

export function getArea(id: AreaId): Area {
  const area = AREAS.find((a) => a.id === id)
  if (!area) throw new Error(`Unbekannte Holodeck-Area: ${id}`)
  return area
}
