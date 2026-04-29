// 3-Horizonte-Modell: Status quo → Zielbild
// Inhalte aus dem Workshop-Foliendeck (Ambition-Seite).

export interface Technique {
  name: string
  desc: string
}

export interface Horizon {
  id: 'h1' | 'h2' | 'h3'
  label: string
  subtitle: string
  description: string
  /** Hauptfarbe der Kurve + Etiketten */
  color: string
  /** Stark deckende Variante (Linie, Punkt) */
  colorDeep: string
  techniques: Technique[]
}

export const HORIZONS: ReadonlyArray<Horizon> = [
  {
    id: 'h1',
    label: 'Horizont 1',
    subtitle: 'Optimierung bestehender Prozesse',
    description: 'Wo wir heute stehen — punktuelle KI in bestehenden Abläufen, ohne das Operating-Model zu verändern.',
    color: '#a3a3a3',
    colorDeep: '#737373',
    techniques: [
      { name: 'Task-Automatisierung', desc: 'RPA + KI für klar abgegrenzte Routineaufgaben.' },
      { name: 'Regelbasierte KI',     desc: 'Klassische ML- und Rule-Engines im Bestand.' },
      { name: 'Dokument Intelligenz', desc: 'OCR, Klassifikation, Auto-Extraktion aus Verträgen.' },
      { name: 'Entscheidungssupport', desc: 'Empfehlungen für menschliche Entscheider.' },
    ],
  },
  {
    id: 'h2',
    label: 'Horizont 2',
    subtitle: 'Weiterentwicklung von Prozessen',
    description: 'Prozesse werden um KI herum neu gedacht. Mensch und Maschine kollaborieren als Team.',
    color: '#86bc25',
    colorDeep: '#5d8419',
    techniques: [
      { name: 'Hyper-Personalisierung',     desc: 'Live-Anpassung von Angebot, Sprache und Kanal.' },
      { name: 'KI-Copiloten',               desc: 'Vertrieb, Compliance, Service — jeweils mit eigenem Co-Pilot.' },
      { name: 'Mensch-KI-Kollaboration',    desc: 'Gemeinsame Entscheidungs-Workflows mit Übergabe-Punkten.' },
      { name: 'Agenten-gestützte Prozesse', desc: 'Spezialisierte Agenten für KYC, Kredit, Onboarding.' },
      { name: 'End-to-End-Automation',      desc: 'Dunkelverarbeitung über Systemgrenzen hinweg.' },
    ],
  },
  {
    id: 'h3',
    label: 'Horizont 3',
    subtitle: 'Disruptive Innovation & radikal neues Denken',
    description: 'Die Bank wird KI-nativ. Wertschöpfung, Geschäftsmodell und Kundenbeziehung werden neu erfunden.',
    color: '#2d8c2d',
    colorDeep: '#1f5e1f',
    techniques: [
      { name: 'KI-natives Betriebsmodell', desc: 'Operating-Model ist um KI herum gebaut, nicht andersherum.' },
      { name: 'Autonomes Banking',         desc: 'Bank-Funktionen laufen weitestgehend ohne menschliche Eingriffe.' },
      { name: 'Self-driving Banking',      desc: 'Kunden-Finanzen werden proaktiv von KI orchestriert.' },
      { name: 'Selbstlernende Systeme',    desc: 'Modelle verbessern sich kontinuierlich aus realen Outcomes.' },
      { name: 'KI-zu-KI-Finance',          desc: 'Banken-KI verhandelt direkt mit Kunden-/Lieferanten-KI.' },
      { name: 'Unsichtbares Banking',      desc: 'Banking als Hintergrund-Service in nicht-Bank-Plattformen.' },
      { name: 'Outcome-getriebenes Banking', desc: 'Bezahlt wird für erreichte Ergebnisse, nicht für Produkte.' },
    ],
  },
]
