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

export type View = { kind: 'overview' } | { kind: 'deepdive'; areaId: AreaId }

// ── Ankerbild der Brücke ─────────────────────────────────────────────────────
export const ANKER = {
  src: './images/holodeck/00-anker.png',
  alt: 'Runde Kommandobrücke der EDEKABANK 2031: zwei Vorstände vorne am Pult „EDEKABANK", dahinter im Bogen fünf Spezialstationen vor einer großen Datenwand (Märkte, Händler-Liquidität, Zahlungsströme, Risikosignale).',
}

// ── Zonen-Startwerte (Spec §7) — am echten Ankerbild über den Debug-Editor
//    (Taste „D" / ?debug) final justieren. ────────────────────────────────────
export const ZONES: Record<AreaId, Zone> = {
  // Auf das gelieferte Ankerbild ausgemessen: die fünf Stationen (sitzende
  // Operator:innen im Bogen), nicht die beiden Vorstände vorne. Bei Bedarf über
  // den Debug-Editor (Taste „D") final justieren.
  vertrieb: { x: 8, y: 60, r: 8 }, // vorne links (Flanke)
  it: { x: 92, y: 60, r: 8 }, // vorne rechts (Flanke)
  produkt: { x: 14, y: 48, r: 7 }, // hinten links
  risiko: { x: 85, y: 48, r: 7 }, // hinten rechts
  betrieb: { x: 50, y: 42, r: 6 }, // hinten Mitte
}

// ── Übersicht „Die Brücke — Steuerung" (rechte Spalte, einziger Inhalt) ───────
export const STEUERUNG = {
  eyebrow: 'KOMMANDOBRÜCKE — STEUERUNG',
  title: 'EDEKABANK Holodeck 2031',
  these:
    'Die KI-native Bank ist kein Technologie-Upgrade, sondern ein **anderes Betriebsmodell** — von der Brücke aus steuern zwei Menschen das Gesamtsystem, die KI exekutiert.',
  maximalbild:
    'Im Maximum liefe die Bank von hier aus nahezu **auf Autopilot** — ein Cockpit, das Märkte, Liquidität, Zahlungsströme und Risiko in Echtzeit zusammenführt und über Regeln statt Einzelfälle lenkt.',
  aber:
    'Bewusst **nicht das Zielbild**. Die Kernbereiche bleiben in der Verantwortung von **Leads** — die fünf Stationen rundherum —, weil Vertrauen, Ausnahmen und Verantwortung Menschen brauchen, nicht nur Steuerung.',
  hinweis: 'Über die Stationen im Bild in die fünf Kernbereiche eintauchen.',
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
        text: 'Verantwortet Akquise und Bindung im Händlergeschäft. Der eigene Einsatz verlagert sich von der Bearbeitung der <strong>Breite</strong> auf die wenigen <strong>wertentscheidenden Interaktionen</strong> — dort, wo eine Beziehung kippt oder ein Abschluss zustande kommt.',
      },
      {
        label: FIELD_LABELS.skills,
        text: '<strong>Relationship- und Verhandlungskompetenz</strong> als Kern; dazu die Fähigkeit, KI-Empfehlungen <strong>kritisch zu bewerten</strong> statt blind zu folgen, und <strong>Abschluss- und Eskalationssicherheit</strong> in Hochwert-Situationen.',
      },
      {
        label: FIELD_LABELS.zielbild,
        text: 'Die KI <strong>antizipiert Bedarfe</strong> (Liquidität, Saison, Expansion), bevor der Händler anfragt, und steuert <strong>Ansprache, Angebot und Timing autonom</strong>. Der Mensch greift nur noch an definierten <strong>Vertrauens-Touchpoints</strong> ein.',
      },
      {
        label: FIELD_LABELS.delta,
        text: 'Heute ist der Vertrieb <strong>reaktiv und manuell</strong>, Signale werden spät erkannt. Implikation: Die Kapazität verschiebt sich <strong>von Breite zu Tiefe</strong> — <strong>weniger Köpfe</strong>, aber deutlich höhere Anforderung pro Kopf.',
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
        text: 'Verantwortet <strong>Passung und Marge</strong> des Lösungsangebots. Gestaltet den <strong>Baukasten und die Leitplanken</strong>, nach denen kombiniert wird — nicht mehr das einzelne Produkt.',
      },
      {
        label: FIELD_LABELS.skills,
        text: '<strong>Modulares Produktdenken</strong> statt Katalogpflege; ein belastbares Gespür für die <strong>Ökonomie des Händlergeschäfts</strong>; und die Fähigkeit, <strong>Guardrails und Freigabelogik</strong> für die KI-Konfiguration sauber zu definieren.',
      },
      {
        label: FIELD_LABELS.zielbild,
        text: 'Die KI <strong>konfiguriert je Cluster in Echtzeit</strong> die optimale Lösung aus den Modulen und <strong>re-optimiert laufend</strong>. Die <strong>Time-to-Solution</strong> sinkt von Monaten auf <strong>Minuten</strong>.',
      },
      {
        label: FIELD_LABELS.delta,
        text: 'Heute lange <strong>Entwicklungszyklen</strong> und Standardprodukte mit <strong>Streuverlust</strong>. Implikation: Der <strong>statische Produktkatalog</strong> — und die Funktion, die ihn pflegt — verliert seine Existenzberechtigung.',
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
        text: 'Sichert <strong>Durchlauf und Qualität</strong> in Kredit, KYC und Abwicklung. Steuert künftig das <strong>Ausnahme-Regime</strong> statt des Normalbetriebs — also genau das, was die Maschine bewusst nicht allein entscheidet.',
      },
      {
        label: FIELD_LABELS.skills,
        text: '<strong>Prozess- und Kontrollkompetenz</strong>; <strong>Entscheidungsstärke im Ausnahmefall</strong>; und die <strong>Sensorik</strong> dafür, welche Fälle dem Menschen vorbehalten bleiben müssen.',
      },
      {
        label: FIELD_LABELS.zielbild,
        text: '<strong>Straight-Through-Processing</strong> für das Gros der Fälle; der Mensch bearbeitet nur noch <strong>Exceptions</strong>. Steuerungsgröße ist die <strong>Qualität der Ausnahmeerkennung</strong>, nicht das Bearbeitungsvolumen.',
      },
      {
        label: FIELD_LABELS.delta,
        text: 'Heute <strong>personalintensive Einzelfallbearbeitung</strong>. Implikation: Bei <strong>STP-Quoten jenseits 90 %</strong> ist nicht Effizienz die Frage, sondern der <strong>Kapazitäts- und Rollenumbau</strong> im Backoffice.',
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
        text: 'Verantwortet <strong>Früherkennung und Resilienz</strong>. Die Funktion verlagert sich von <strong>Reporting</strong> hin zu aktiver <strong>Vorsteuerung</strong> — gegensteuern, bevor etwas eskaliert.',
      },
      {
        label: FIELD_LABELS.skills,
        text: '<strong>Szenario- und Frühindikatorenkompetenz</strong>; eine <strong>präventive statt reaktive</strong> Steuerungslogik; und die <strong>Entscheidungsfähigkeit unter Unsicherheit</strong>.',
      },
      {
        label: FIELD_LABELS.zielbild,
        text: '<strong>Echtzeit-Signalauswertung</strong> und kontinuierliche <strong>Szenariosimulation</strong> (z. B. Kaufkraft −10 %) münden in automatisierte <strong>Maßnahmenempfehlungen vor Eskalation</strong>.',
      },
      {
        label: FIELD_LABELS.delta,
        text: 'Heute <strong>periodisches, rückblickendes Reporting</strong> — meist zu spät zum Gegensteuern. Implikation: Verschiebung von <strong>Schadensverwaltung</strong> zu <strong>Schadensvermeidung</strong>, mit entsprechend anderem Kompetenzprofil.',
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
        text: 'Verantwortet das <strong>Daten- und KI-Betriebssystem</strong> als Enabler aller Automatisierung. Kernaufgabe ist, die <strong>Vertrauenswürdigkeit der Modelle</strong> sicherzustellen, denen die ganze Bank vertraut.',
      },
      {
        label: FIELD_LABELS.skills,
        text: '<strong>Daten- und Plattformarchitektur</strong>; <strong>Modell-Governance und -Sicherheit</strong>; und die Fähigkeit zur <strong>Übersetzung zwischen Technik, Fachbereich und Aufsicht</strong>.',
      },
      {
        label: FIELD_LABELS.zielbild,
        text: 'Ein <strong>integriertes Datenfundament</strong> (Händler-, Bank-, Externdaten) speist <strong>alle Use Cases</strong>; die Modelle sind <strong>laufend überwacht, abgesichert und governt</strong>.',
      },
      {
        label: FIELD_LABELS.delta,
        text: 'Heute <strong>Datensilos</strong> und isolierte Pilotierung. Implikation: Der kritische <strong>Investitionshebel</strong> ist nicht das Modell, sondern das <strong>Datenfundament</strong> — typischerweise unterinvestiert und aufgeschoben.',
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

// ── Deep-Links — Hash-Routing: #/holodeck (Übersicht) · #/holodeck/<area> ─────
function holodeckParts(hash: string): string[] {
  return hash
    .replace(/^#/, '')
    .replace(/^\/+|\/+$/g, '')
    .split('/')
}

/** True, wenn der Hash auf das Holodeck zeigt (Übersicht oder ein Bereich). */
export function isHolodeckHash(hash: string = window.location.hash): boolean {
  return holodeckParts(hash)[0]?.toLowerCase() === 'holodeck'
}

/** Bereichs-ID aus dem Hash (oder null = Übersicht / kein Holodeck-Hash). */
export function holodeckAreaFromHash(hash: string = window.location.hash): AreaId | null {
  const parts = holodeckParts(hash)
  if (parts[0]?.toLowerCase() !== 'holodeck') return null
  const a = parts[1]?.toLowerCase()
  return a && (AREA_ORDER as readonly string[]).includes(a) ? (a as AreaId) : null
}

/** Baut den Hash für die Übersicht (null) bzw. einen Bereich. */
export function formatHolodeckHash(area: AreaId | null): string {
  return area ? `#/holodeck/${area}` : '#/holodeck'
}
