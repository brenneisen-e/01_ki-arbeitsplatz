// ─────────────────────────────────────────────────────────────────────────────
// Szenarien-Modell — Vorspann zum EDEKABANK Holodeck 2031
//
// Verdichtet die drei Workshop-Folien des Szenarien-Modells zu einer einzigen
// interaktiven Matrix (Mouseover):
//   • Folie „Szenario Unterscheidung" → Kernthemen je Quadrant (immer sichtbar)
//   • Folie „Kurze zusammenfassende Narrative" → Narrativ + Details (bei Hover)
//   • Folie „Szenario Sentiment" → Workshop-Zustimmung in % (Badge + Hover)
//
// Achsen (wie auf den Folien):
//   X = Vielfalt und Komplexität zukünftiger Transaktionsmöglichkeiten
//       (links NIEDRIG ↔ rechts HOCH)
//   Y = Datenverfügbarkeit und Nutzung in der Customer Journey
//       (unten EINGESCHRÄNKT ↔ oben UNBEGRENZT)
// ─────────────────────────────────────────────────────────────────────────────

export type SzenarioId = 'horizonte' | 'wunderland' | 'inseln' | 'nebel'

export interface Szenario {
  id: SzenarioId
  /** Quadrant in der 2×2-Matrix (bestimmt die Reihenfolge im Grid). */
  quadrant: 'oben-links' | 'oben-rechts' | 'unten-links' | 'unten-rechts'
  title: string
  /** Akzentfarbe, auf das dunkle Holodeck-Theme abgestimmt (lesbar auf Dunkel). */
  color: string
  /** Workshop-Sentiment in Prozent (Folie „Szenario Sentiment"). */
  sentiment: number
  /** Kurze Kernthemen — immer in der Kachel sichtbar (Folie „Unterscheidung"). */
  kernthemen: string[]
  /** Narrativ-Lead — bei Hover in der Detailspalte (Folie „Narrative"). */
  narrativ: string
  /** Ausformulierte Details — bei Hover in der Detailspalte (Folie „Narrative"). */
  details: string[]
}

// ── Achsen-Beschriftung ───────────────────────────────────────────────────────
export const ACHSEN = {
  xTitelLinks: 'Vielfalt und Komplexität',
  xTitelRechts: 'zukünftiger Transaktionsmöglichkeiten',
  xLinks: 'NIEDRIG',
  xRechts: 'HOCH',
  yTitel: 'Datenverfügbarkeit und Nutzung in der Customer Journey',
  yOben: 'UNBEGRENZT',
  yUnten: 'EINGESCHRÄNKT',
}

// ── Kopf-Texte des Vorspanns ──────────────────────────────────────────────────
export const VORSPANN = {
  eyebrow: 'SZENARIEN-MODELL · BESTÄTIGT IN WORKSHOP 1 & 2',
  title: 'Vier Visionen der Zukunft',
  lead: 'Aus der Kombination der kritischen Unsicherheiten ergeben sich vier mögliche Visionen der Zukunft — jede mit eigenen Kernthemen. Fahren Sie mit der Maus über ein Szenario, um Narrativ und Workshop-Sentiment einzublenden.',
  hint: 'Mit der Maus über ein Szenario fahren',
  cta: 'Weiter zur Kommandobrücke',
  sentimentLabel: 'Positives Sentiment im Workshop',
  sentimentNote:
    'Workshop-Teilnehmer:innen zeigten erstaunlich viel positives Sentiment gegenüber „Multikomplexes Wunderland"; am wenigsten Zustimmung erhielt „Zu neuen Horizonten".',
  legende: 'ML = Machine Learning · KI = Künstliche Intelligenz',
}

// ── Die vier Szenarien (Inhalte 1:1 aus den Workshop-Folien) ──────────────────
export const SZENARIEN: Szenario[] = [
  {
    id: 'horizonte',
    quadrant: 'oben-links',
    title: 'Zu neuen Horizonten',
    color: '#c8ac7d',
    sentiment: 12,
    kernthemen: [
      'Regulatorik begünstigt etablierte Finanzdienstleister',
      'Verbraucher:innen präferieren Convenience über Anonymität',
      'Kleinere, spezialisierte Akteure überwinden Markteintrittsbarrieren',
      'Finanzdienstleister entwickeln neue Produkte jenseits Banking',
    ],
    narrativ:
      'In dieser Welt birgt die Nutzung von unbegrenzt verfügbaren Verbraucher:innendaten in Kombination mit einer klaren Strategie der Regulatoren und Zentralbanken für die verfügbaren und zugelassenen Zahlungsmittel großes Potential für etablierte Finanzdienstleister im Lebensmitteleinzelhandel.',
    details: [
      'Verbraucher:innen sind bereit, für ein **verbessertes Einkaufserlebnis** ihre **Daten preiszugeben**. Sie stimmen z. B. Loyalitätsprogrammen zu und bevorzugen **digitale IDs** für reibungslose Zahlungs- und Einkaufsprozesse.',
      '**Kleinere, spezialisierte Akteure**, die sich im Ökosystem positionieren wollen, überwinden **Markteintrittsbarrieren**. Dies verstärkt den **Konkurrenzkampf** und treibt etablierte Firmen in Richtung zweckgetriebener, projektbasierter Zusammenarbeit.',
      'Spürbar wird der verstärkte Wettbewerb auch bei **IT-Lösungen**, die trotz Datenüberfluss meist **isoliert und ohne Schnittstellen** zur Außenwelt konzipiert sind. Der Innovationsfokus etablierter Akteure liegt auf **neuen Geschäftsmodellen** und der Erweiterung des Dienstleistungsportfolios in Richtung **Beyond Banking**.',
      'Getrieben wird dies auch durch den Einsatz von **KI und ML**. Eine klare Positionierung — als **Bediener** wie als **persönlicher Designer** neuer Technologien — ist für die Finanzberatung wichtig, um **schnelle und nachhaltige Finanzentscheidungen** zu ermöglichen.',
    ],
  },
  {
    id: 'wunderland',
    quadrant: 'oben-rechts',
    title: 'Multikomplexes Wunderland',
    color: '#4f93d6',
    sentiment: 23,
    kernthemen: [
      'Offene Regulatorik als Risiko für etablierte Finanzdienstleister',
      'Kollaborationsdruck im Finanzdienstleistungsökosystem',
      'Innovation durch leicht verständliche Geschäftsmodelle',
      'Bankberater:innen erklären Kund:innen die Empfehlungen von ML',
    ],
    narrativ:
      'In dieser Welt lässt ein Zusammenspiel von Technologie, Verbraucher:innenverhalten und Regulatorik ein extremes Maß an Individualisierung zu. Gesetzgebung erlaubt neue Technologien und Automatisierung im Banking. Dies vereinfacht die Nutzung von Kund:innendaten und erlaubt ein breites Spektrum an Transaktionsmöglichkeiten.',
    details: [
      'Der Drang von Verbraucher:innen nach immer mehr **Convenience** im Einzelhandel übersteigt ihren **Wunsch nach Anonymität** — ihre Daten stellen sie einer **vertrauenswürdigen Instanz** zur Verfügung.',
      'Die Vielzahl an **Zahlungsmöglichkeiten** und technischen Anforderungen fördert **Markteintrittsbarrieren**. Etablierte Finanzdienstleister stehen vor Herausforderungen, da sich hier attraktive **Chancen für Big Tech** bieten.',
      'Finanzdienstleister müssen **kollaborieren** und den Vorteil des **Vertrauensverhältnisses zum Einzelhandel** nutzen, um zu **Vermittlern und Vernetzern** der Angebotsflut zu werden. Dafür müssen sie über das traditionelle Bankgeschäft hinausblicken — Innovationen müssen **leicht verständliche Geschäftsmodelle** fördern.',
      '**Big Data** ermöglicht weitläufigen Einsatz von **ML-basierten Tools**, die **hoch-individualisierte Empfehlungen** (z. B. zu Finanzierungsoptionen) produzieren. Genau deswegen bleibt das **menschliche Vertrauensverhältnis** wichtig: Einzelhändler:innen wollen die Entscheidungen der Algorithmen **erklärt** bekommen.',
    ],
  },
  {
    id: 'inseln',
    quadrant: 'unten-links',
    title: 'Effiziente Inseln',
    color: '#7cc6ee',
    sentiment: 23,
    kernthemen: [
      'Verbraucher:innen priorisieren Anonymität über Convenience',
      'Hohe Marktkonsolidierung',
      'Viele Insellösungen von Zahlungssystemen',
      'Innovationsfokus auf Effizienzsteigerungen',
    ],
    narrativ:
      'In dieser Welt gibt es — eingeschränkt durch Gesetzgebung und gesellschaftliche Ablehnung — wenige dominante Zahlungsarten. Es ist daher eine große Herausforderung, Verbraucher:innendaten zu sammeln, zu aggregieren und zu nutzen, um Einkaufserlebnis und Finanzdienstleistungen zu individualisieren.',
    details: [
      '**Bargeld** bleibt eine bevorzugte Zahlungsart, wegen des allgemeinen **Verlangens nach Anonymität** bei der Bezahlung von Dienstleistungen und Produkten im Einzelhandel.',
      'Ungleicher Zugang zu Verbraucher:innendaten führt zu **Datenmonopolen**, die erhebliche **Markteintrittsbarrieren** darstellen und die Marktdynamik rivalisierend beeinflussen. Die Akteure handeln eher **individualistisch** und betreiben Partnerschaften ausschließlich mit externen Stakeholdern wie Big Tech.',
      'Signifikante **Datenströme** entwickeln sich nur innerhalb solcher **Silos**, die vorwiegend **Operationen automatisieren** und die **Prozesseffizienz** verbessern wollen.',
      'Finanzdienstleister fokussieren sich auf ihr **Kerngeschäft** und dessen Optimierung. Bestehenden Kund:innen bieten sie eine **breite Produktpalette**, die neben klassischer Finanzierung vermehrt in die Bereiche **Versicherungen und X-as-a-Service** geht. Zentral ist ihre Rolle als **Beratungspartner** für komplizierte Finanzvorhaben.',
    ],
  },
  {
    id: 'nebel',
    quadrant: 'unten-rechts',
    title: 'Im Nebel zählt Erfahrung',
    color: '#efb329',
    sentiment: 42,
    kernthemen: [
      'Schnittstellendschungel erzeugt vorteilslose Integrationskosten',
      'Transaktionelle und zweckgebundene Kooperation im Ökosystem',
      'Traditionelles Bankgeschäft im Fokus',
      'Berater:innen bieten Marktüberblick und personalisierte Angebote',
    ],
    narrativ:
      'In dieser Welt setzt Regulatorik klare Grenzen für das Finanzdienstleistungsgeschäft. Dies bevorteilt etablierte Finanzdienstleister, die Erfahrung mit Compliance und dem Spielraum für ihre Kund:innen haben. Ein Teil dieser Richtlinien ist das Resultat des Verbraucher:innenstrebens nach Anonymität im Einzelhandel.',
    details: [
      'Verbraucher:innen wollen auch **ohne Preisgabe von Daten** bequem und reibungslos einkaufen und nehmen dafür **Einschränkungen im Einkaufserlebnis** in Kauf. Jede:r verlangt andere, anonymer scheinende Zahlungsmöglichkeiten — Einzelhändler:innen müssen eine **Vielfalt an Anforderungen** erfüllen, ohne sie individualisieren zu können.',
      'Dies erfordert eine **starke Vernetzung** und damit den **kostspieligen Bau vieler Schnittstellen**, jedoch ohne Synergiepotentiale. Neue Akteure können in den Markt einsteigen; wer die **limitierten Daten aggregieren** und sinnvoll nutzen kann, hat einen **Vorteil**.',
      'Innovation wird vor allem zur **Optimierung** betrieben. Da sie nicht alle Zahlungsmöglichkeiten effizient und kostengünstig abdecken können, fokussieren sich Finanzdienstleister auf das **traditionelle Bankgeschäft**.',
      'Der persönliche **Finanzberatungsbedarf** im Lebensmitteleinzelhandel ist hoch. Einzelhändler:innen suchen **Ansprechpartner:innen**, die den **Überblick** über das Umfeld behalten und auf sie zugeschnittene **Empfehlungen und Angebote** kreieren.',
    ],
  },
]

export function getSzenario(id: SzenarioId): Szenario {
  const s = SZENARIEN.find((x) => x.id === id)
  if (!s) throw new Error(`Unbekanntes Szenario: ${id}`)
  return s
}
