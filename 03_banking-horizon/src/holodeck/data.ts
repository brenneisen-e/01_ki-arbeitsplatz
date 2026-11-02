// ─────────────────────────────────────────────────────────────────────────────
// EDEKABANK Holodeck 2031 — Datenmodell & Inhalte
//
// Begehbare Kommandobrücke: ein Ankerbild der runden Brücke; fünf anklickbare
// Stationen führen per Kameraflug in einen Deep-Dive (Bild links, Text rechts).
// Struktur-Referenz: edekabank/holodeck-2031-build-spec.md (§8).
// Tool-Texte: EDEKA-spezifische, überarbeitete Fassung (Review Reuss).
//
// Eigenständiges, additives Tool — unabhängig vom Banking-2030-Strukturbild.
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
  // Operatoren im Bogen), nicht die beiden Vorstände vorne. Bei Bedarf über
  // den Debug-Editor (Taste „D") final justieren.
  vertrieb: { x: 8, y: 60, r: 8 }, // vorne links (Flanke)
  it: { x: 92, y: 60, r: 8 }, // vorne rechts (Flanke)
  produkt: { x: 14, y: 48, r: 7 }, // hinten links
  risiko: { x: 85, y: 48, r: 7 }, // hinten rechts
  betrieb: { x: 50, y: 42, r: 6 }, // hinten Mitte
}

// ── Übersicht „Die Brücke — Steuerung" (rechte Spalte, einziger Inhalt) ───────
export const STEUERUNG = {
  eyebrow: 'KOMMANDOBRÜCKE · STEUERUNG',
  title: 'EDEKABANK Holodeck 2031',
  these:
    'Die KI-native **EDEKABANK** ist kein Technologie-Upgrade, sondern ein **neues Betriebsmodell** für den Finanzkreislauf des EDEKA-Kaufmanns. Maik und Heiko steuern nicht mehr primär Bereiche, Projekte und Eskalationslisten, sondern **Autonomiegrade, Leitplanken und Ausnahmeentscheidungen**.',
  maximalbild:
    'Im Maximum läuft der Standardbetrieb **weitgehend autonom**: Händlerimpulse, Liquiditätsveränderungen, Payment-Ströme, Investitionssignale, Kreditvorbereitung, Risikoindikatoren und Serviceprozesse werden in Echtzeit erkannt, bewertet und verarbeitet.',
  aber:
    '**Autonomie ersetzt nicht Verantwortung.** Die fünf Leads sind die **menschlichen Kontrollpunkte** des Systems: Sie sichern Vertrauen im Händlerkontakt, ökonomische Leitplanken im Lösungsbaukasten, Qualität in der Abwicklung, Resilienz in der Steuerung und Verlässlichkeit im Daten- und KI-Betrieb.',
  hinweis:
    'Wir tauchen jetzt in die fünf Steuerungsräume ein, nicht als klassische Abteilungen, sondern als neue Verantwortungsräume einer Bank, die für Märkte, Menschen und Morgen arbeitet.',
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
        text: 'Verantwortet die <strong>wertentscheidenden Beziehungen</strong> zu EDEKA-Kaufleuten. Nicht mehr die <strong>Breite der Kontaktstrecke</strong> steht im Mittelpunkt, sondern die Momente, in denen Vertrauen, Finanzierung, Expansion, Liquidität, Nachfolge oder eine kritische Unternehmerentscheidung zusammenkommen.',
      },
      {
        label: FIELD_LABELS.skills,
        text: 'Tiefes Verständnis des selbstständigen Lebensmitteleinzelhandels, der Marktökonomie und der Unternehmerlogik der Kaufleute. Dazu <strong>Beziehungs- und Verhandlungskompetenz</strong>, Abschlussstärke in hochwertigen Situationen und die Fähigkeit, <strong>KI-Signale kritisch einzuordnen</strong>: Ist das nur ein Datenmuster oder ein echter geschäftlicher Anlass?',
      },
      {
        label: FIELD_LABELS.zielbild,
        text: 'Die KI erkennt Liquiditätsbedarf, Investitionssignale, Saisonspitzen, Margendruck, Expansionschancen und Payment-Auffälligkeiten, <strong>bevor der Kaufmann aktiv wird</strong>. Ansprache, Timing, Vorqualifizierung und Angebotsvorbereitung <strong>laufen autonom</strong>; der Mensch übernimmt definierte Vertrauens-, Abschluss- und Eskalationsmomente.',
      },
      {
        label: FIELD_LABELS.delta,
        text: 'Heute entstehen viele Vertriebsanlässe aus Beziehung, Erfahrung, manueller Analyse oder reaktiver Nachfrage. 2031 wird die Breite durch KI skaliert. Die menschliche Rolle wird <strong>kleiner in der Menge, aber größer in der Wirkung</strong>: <strong>weniger Kontaktverwaltung, mehr Unternehmerdialog</strong>.',
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
        text: 'Verantwortet die <strong>ökonomische Qualität des Lösungsbaukastens</strong> für Kaufleute: Module, Pricing-Logik, Risikoleitplanken, Margenziele, Sicherheitenlogik und Kombinationsregeln. Er gestaltet nicht mehr das einzelne Standardprodukt, sondern <strong>die Regeln, nach denen die KI individuelle Händlerlösungen baut</strong>.',
      },
      {
        label: FIELD_LABELS.skills,
        text: '<strong>Modulares Produkt- und Pricingdenken</strong>, tiefes Verständnis von Händlerökonomie, Kreditrisiko, Payment, Liquidität, Absicherung, Working Capital und Nachhaltigkeitsinvestitionen. Entscheidend ist die Fähigkeit, <strong>fachliche Leitplanken</strong> so zu definieren, dass die KI innerhalb klarer Risiko-, Margen- und Aufsichtsgrenzen konfigurieren kann.',
      },
      {
        label: FIELD_LABELS.zielbild,
        text: 'Die KI kombiniert in Echtzeit Finanzierung, Liquidität, Payment, Absicherung, Working Capital und ergänzende Services zu einer <strong>passgenauen Kaufmannslösung</strong>. Marge, Risiko, Kapitalbindung, Sicherheiten, Förderfähigkeit, Zahlungsstromdaten und Kundenbedarf werden <strong>laufend gegeneinander optimiert</strong>.',
      },
      {
        label: FIELD_LABELS.delta,
        text: 'Heute dominieren Produktkataloge, Angebotslogiken und Entwicklungszyklen. 2031 verschiebt sich Produktarbeit <strong>von Katalogpflege zu Lösungsarchitektur</strong>. Der <strong>statische Produktkatalog verliert an Bedeutung</strong>; entscheidend werden Module, Daten, Leitplanken und die Fähigkeit, den nächsten wirtschaftlich richtigen Schritt für den Kaufmann zu konfigurieren.',
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
        text: 'Verantwortet die <strong>verlässliche autonome Abwicklung</strong> in Kredit, KYC, Vertragsstrecke, Dokumentenprüfung, Auszahlung, Zahlungsverkehrsklärung und Serviceprozesse. Steuert künftig nicht mehr den Normalbetrieb, sondern das <strong>Ausnahme-Regime</strong>, also genau die Fälle, die die Maschine bewusst nicht allein entscheiden darf.',
      },
      {
        label: FIELD_LABELS.skills,
        text: '<strong>Prozess-, Kontroll- und Regulatorikkompetenz</strong>; Entscheidungsstärke im Ausnahmefall; Verständnis für Kreditstrecken, Geldwäscheprävention, Datenqualität und Kundenerlebnis. Entscheidend ist die <strong>Sensorik</strong> dafür, welche Fälle automatisiert durchlaufen dürfen und welche zwingend menschliche Prüfung brauchen.',
      },
      {
        label: FIELD_LABELS.zielbild,
        text: 'Standardfälle laufen <strong>weitgehend durchgängig automatisiert</strong>. Die KI prüft Unterlagen, plausibilisiert Daten, erkennt fehlende Informationen, bereitet Entscheidungen vor und stößt nächste Prozessschritte an. Der Mensch bearbeitet <strong>nur noch Ausnahmen</strong>, Grenzfälle, unplausible Datenlagen und risikorelevante Abweichungen.',
      },
      {
        label: FIELD_LABELS.delta,
        text: 'Heute erzeugen Regulierung, Medienbrüche, Unterlagenlogik und Systemgrenzen erhebliche manuelle Bearbeitung. 2031 ist nicht mehr das Bearbeitungsvolumen die zentrale Steuerungsgröße, sondern die <strong>Qualität der Ausnahmeerkennung</strong>. Der Betrieb wird <strong>vom Abwicklungsapparat zum Kontroll- und Ausnahmezentrum</strong>.',
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
        text: 'Verantwortet <strong>Früherkennung und Resilienz</strong>. Die Funktion verlagert sich von <strong>Reporting</strong> hin zu aktiver <strong>Vorsteuerung</strong>: gegensteuern, bevor etwas eskaliert.',
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
        text: 'Heute <strong>periodisches, rückblickendes Reporting</strong>, meist zu spät zum Gegensteuern. Implikation: Verschiebung von <strong>Schadensverwaltung</strong> zu <strong>Schadensvermeidung</strong>, mit entsprechend anderem Kompetenzprofil.',
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
        text: 'Verantwortet das <strong>Daten- und KI-Betriebssystem der EDEKABANK</strong>: die sichere Verbindung von Händlerdaten, Bankdaten, Payment-Daten, Portal-Daten, Verbundsignalen und externen Informationen. Kernaufgabe ist, die <strong>Vertrauenswürdigkeit der Modelle</strong> sicherzustellen, denen die Bank operative Entscheidungen anvertraut.',
      },
      {
        label: FIELD_LABELS.skills,
        text: '<strong>Daten- und Plattformarchitektur</strong>, Schnittstellensteuerung, Modell-Governance, Informationssicherheit, Datenschutz, Cyber-Resilienz und Übersetzung zwischen Fachbereich, IT, Verbundpartnern und Aufsicht. Entscheidend ist nicht nur Technologieverständnis, sondern die Fähigkeit, <strong>Datenhoheit, Skalierung und Auditierbarkeit</strong> zusammenzubringen.',
      },
      {
        label: FIELD_LABELS.zielbild,
        text: 'Ein <strong>integriertes Datenfundament</strong> speist Händler-Radar, Lösungsbaukasten, autonome Abwicklung und Risikofrühwarnung. Modelle werden laufend überwacht, Drift wird erkannt, Entscheidungen sind nachvollziehbar, Agentenrechte sind begrenzt, und <strong>jeder autonome Prozess hinterlässt eine prüfbare Datenspur</strong>.',
      },
      {
        label: FIELD_LABELS.delta,
        text: 'Heute entstehen digitale Services, Portalstrecken, Payment-Infrastruktur und Prozessautomatisierung Schritt für Schritt. 2031 entscheidet die produktive Daten- und KI-Plattform darüber, <strong>ob die EDEKABANK wirklich skaliert</strong>. Der kritische Engpass ist nicht das einzelne Modell, sondern das <strong>vertrauenswürdige Datenfundament</strong>.',
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
