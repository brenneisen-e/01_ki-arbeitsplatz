// Modul-Katalog für den Workshop "Banking im KI-Zeitalter".
// Inhalte basieren auf dem Kickoff-Deck vom 24.04.2026 (siehe
// 20260424 Kickoff Banking im KI-Zeitalter.pdf im Repo-Root).
// Fünf Module bilden das gemeinsame Workshop-Format ab —
// vom Markt aus (Kundenperspektive) bis zum Liefervehikel (Angebote).

export const MODULES = [
  {
    id: 'kundenperspektive',
    title: 'Kundenperspektive',
    subtitle: 'Was Kunden 2035 erwarten',
    icon: 'Users',
    color: '#34d399',
    colorDeep: '#059669',
    owner: 'Andreas R. / Andreas P. (Cap. Markets)',
    tagline:
      'Hyper-personalisierte Interaktion — über Retail, Corporate und Capital Markets hinweg.',
    summary:
      'Kunden erwarten 2035 ein durchgängiges Echtzeit-Banking, in dem KI-Avatare und proaktive Berater für jede Lebenslage zur Verfügung stehen. Heute reagiert die Bank auf Anfragen — morgen führt sie das Gespräch. Pro Segment unterscheiden sich die Treiber: Retail will Embedded Convenience, Corporate Echtzeit-Insight, Capital Markets demokratisierten Zugang zu neuen Asset-Klassen.',
    pillars: [
      {
        id: 'retail',
        title: 'Retail',
        description:
          '24/7-Erlebnis durch KI-Avatare und Chatbots; menschliche Beratung gezielt für komplexe Lebenslagen.',
        bullets: [
          'KI-Avatare als 1st-Level-Channel',
          'Lebenslagen-Erkennung statt Produktansprache',
          'Embedded Finance im Alltag (Mobility, Energy, Health)',
        ],
      },
      {
        id: 'corporate',
        title: 'Corporate',
        description:
          'Vom reaktiven Firmenkundenbetreuer zum proaktiven Strategie-Sparring auf Echtzeit-Datenbasis.',
        bullets: [
          'Proaktive Cashflow- & Working-Capital-Insights',
          'API-Integration in ERP/Treasury der Kunden',
          'Branchenspezifische Co-Piloten',
        ],
      },
      {
        id: 'capital-markets',
        title: 'Capital Markets',
        description:
          'KI-gestütztes Trading, prädiktive Risikoanalyse und Tokenisierung als Standard.',
        bullets: [
          'Algorithmische Handelsentscheidungen',
          'Tokenisierte Realwerte (Immobilien, Kunst, Infrastruktur)',
          'Demokratisierter Zugang zu neuen Anlageklassen',
        ],
      },
      {
        id: 'trust',
        title: 'Vertrauen & Transparenz',
        description:
          'Erklärbare KI, Datenhoheit und Consent-Management als Basis für Kundenbindung.',
        bullets: ['Explainable AI', 'Consent Management', 'Bias- & Fairness-Monitoring'],
      },
    ],
  },
  {
    id: 'bank-der-zukunft',
    title: 'Bank der Zukunft',
    subtitle: 'Geschäftsmodelle 2035',
    icon: 'Compass',
    color: '#38bdf8',
    colorDeep: '#0284c7',
    featured: true,
    owner: 'Holger',
    tagline:
      'Vom produktzentrierten Bankhaus zum Ökosystem-Anbieter mit KI als Mitarbeitendem.',
    summary:
      'KI ist Fundament der gesamten Wertschöpfungskette und in alle Kernprozesse integriert. Relevanz wird durch Embedded Finance, BaaS und strategische Partnerschaften mit FinTechs und BigTechs gesichert. Erlöse entstehen jenseits klassischer Zins- und Provisionsmodelle. Steuerung erfolgt über einen Chief AI Officer und ein AI-Governance-Board auf Vorstandsebene.',
    pillars: [
      {
        id: 'oekosystem',
        title: 'Ökosystem-Geschäftsmodell',
        description:
          'Embedded Finance, Banking-as-a-Service und Plattform-Modelle als zentrale Wachstumshebel.',
        bullets: ['Embedded Finance in Branchenplattformen', 'BaaS für Drittanbieter', 'Marktplatz-Integrationen'],
      },
      {
        id: 'ki-first',
        title: 'KI-First-Prinzip',
        description:
          'KI ist nicht Tool, sondern Mitarbeitender — orchestriert in jedem Kern- und Supportprozess.',
        bullets: ['Agentische KI in jedem Prozess', 'Daten- & Modell-Plattform als Fundament', 'Continuous Learning Culture'],
      },
      {
        id: 'erloesmodelle',
        title: 'Neue Erlösmodelle',
        description:
          'Diversifizierung jenseits von Zins und Provision — Subscription, Plattform-Gebühren, Daten-Monetarisierung.',
        bullets: ['Advisory-as-a-Service', 'API-Monetarisierung', 'DSGVO-konforme Daten-Monetarisierung'],
      },
      {
        id: 'governance-vorstand',
        title: 'Governance auf C-Level',
        description:
          'Chief AI Officer (CAIDO) und AI-Governance-Board steuern die Transformation strategisch.',
        bullets: ['CAIDO-Rolle im Vorstand', 'AI-Governance-Board', 'KI als Vorstands-Agenda'],
      },
    ],
  },
  {
    id: 'betriebsmodell-zukunft',
    title: 'Betriebsmodell der Zukunft',
    subtitle: 'The art of the possible',
    icon: 'Workflow',
    color: '#a78bfa',
    colorDeep: '#7c3aed',
    owner: 'Georg / Thorsten / Lars (Demo & Deep Dive)',
    tagline:
      'Dunkelverarbeitung End-to-End, Composable Architecture, KI-Vertriebsarbeitsplatz als Co-Pilot.',
    summary:
      'Vertrieb, Operations, IT, HR, Finanzen, GRC — alle Kern- und Supportfunktionen laufen KI-First. Vertrieb arbeitet am KI-Vertriebsarbeitsplatz mit 360°-Kundensicht. Operations basiert auf Hyperautomation und Dunkelverarbeitung. IT setzt auf Composable Banking und löst Legacy schrittweise ab. Corporate Services agieren als strategische Business Partner.',
    pillars: [
      {
        id: 'vertriebsarbeitsplatz',
        title: 'KI-Vertriebsarbeitsplatz',
        description:
          'Der KI-gestützte Arbeitsplatz für Berater: 360°-Kundensicht, Next-Best-Action, Co-Pilot, Echtzeit-Compliance.',
        bullets: [
          'Agentische KI-Orchestrierung',
          'Echtzeit-Kundensicht aus allen Kanälen',
          'Voice-First & Ambient Interfaces',
        ],
        deepLink: 'vertriebsarbeitsplatz',
      },
      {
        id: 'operations',
        title: 'Operations & Hyperautomation',
        description:
          'Dunkelverarbeitung als Standard: Geschäftsvorfälle End-to-End vollautomatisiert ohne menschlichen Eingriff.',
        bullets: ['RPA + KI + Process Mining', 'Realtime Banking', 'Exception-Handling per Workflow'],
      },
      {
        id: 'it-architektur',
        title: 'IT & Composable Architecture',
        description:
          'Modulare, API-gesteuerte Infrastruktur. Legacy schrittweise abgelöst (Strangler Fig Pattern).',
        bullets: ['Composable Banking', 'Banking-as-a-Service', 'Strangler-Fig-Migrationen'],
      },
      {
        id: 'corporate-services',
        title: 'Corporate Services',
        description:
          'HR als Enabler des Wandels, CFO als strategischer Partner, GRC als Risk-Steuerung der KI.',
        bullets: ['Upskilling für AI-Translator-Rollen', 'Predictive Forecasting im CFO-Office', 'GRC mit technologie-gestützten Prüfmethoden'],
      },
    ],
  },
  {
    id: 'transitionspfad',
    title: 'Transitions- & Transformationspfad',
    subtitle: 'Vom Heute zum Zielbild 2035',
    icon: 'TrendingUp',
    color: '#fbbf24',
    colorDeep: '#d97706',
    owner: 'Andreas Reuß / Andreas Pfeil',
    tagline:
      'Welche Dimensionen verändern sich, in welchen Wellen — und was bedeutet das für Steering und Investitionsplanung?',
    summary:
      'Drei bis fünf Transformations-Wellen mit klaren Meilensteinen und MVPs. Capital Markets und Retail laufen mit unterschiedlichen Geschwindigkeiten, aber demselben Zielbild. Wert-/Risiko-Priorisierung und governance-starkes Programm-Management sind Pflicht — Transformation ist kein Big Bang, sondern eine kontrollierte Welle nach der anderen.',
    pillars: [
      {
        id: 'wellen-roadmap',
        title: 'Wellen-Roadmap',
        description:
          'Foundation → Scale & Embed → Reinvent. Klare MVP-Lieferungen pro Welle, Quick Wins zuerst.',
        bullets: ['Welle 1: Foundations (Daten, Plattform, Skills)', 'Welle 2: Scale & Embed', 'Welle 3: Reinvent (neue Geschäftsmodelle)'],
      },
      {
        id: 'priorisierung',
        title: 'Wert- & Risiko-Priorisierung',
        description:
          'Initiativen werden nach Business-Value, Realisierungsrisiko und Abhängigkeiten geordnet.',
        bullets: ['Value-Risk-Matrix', 'Investment-Case je Welle', 'Dependency-Graph'],
      },
      {
        id: 'sparten-takt',
        title: 'Capital Markets vs. Retail',
        description:
          'Zwei Zielarchitekturen, ein Fundament — abgestimmte Migrationspfade in passender Geschwindigkeit.',
        bullets: ['Spartenspezifische MVPs', 'Gemeinsame Plattform-Bausteine', 'Migrations-Welle pro Sparte'],
      },
      {
        id: 'steering',
        title: 'Steering & Governance',
        description:
          'Klare Entscheidungsstrukturen, Steering-Boards, Eskalationspfade — schnell und transparent.',
        bullets: ['Steering Cadence', 'OKR-Verankerung', 'PMO & Reporting'],
      },
    ],
  },
  {
    id: 'angebotsbausteine',
    title: 'Angebotsbausteine',
    subtitle: 'Was Deloitte konkret liefert',
    icon: 'ShieldCheck',
    color: '#fb7185',
    colorDeep: '#e11d48',
    owner: 'Holger',
    tagline:
      'Sieben modulare Pakete — passgenau zum Transformationspfad.',
    summary:
      'Unsere Angebote kombinieren sich entlang der Transformationspfade des Kunden: Strategie, Implementierung, Operations, Infrastruktur, Change, GRC und Capital Markets — als eigenständige Bausteine oder als Programm-Bundle.',
    pillars: [
      {
        id: 'strategie',
        title: 'Strategie: AI-Ready & Ecosystem Banking 2035',
        description:
          'Entwicklung einer KI-Strategie und eines adaptiven Operating Models. Positionierung im Ökosystem (BaaS, Embedded Finance, Partnerschaften).',
        bullets: ['Zielbild-Workshops', 'Operating-Model-Design', 'Ökosystem-Strategie'],
      },
      {
        id: 'vertrieb-service',
        title: 'Implementation: Intelligenter Vertrieb & Service',
        description:
          'Agiler Aufbau des KI-Vertriebsarbeitsplatzes und Konzeption vertrauenswürdiger Kundenschnittstellen (Avatare, Conversational AI).',
        bullets: ['KI-Vertriebsarbeitsplatz', 'KI-Avatare & Conversational AI', 'Customer-Journey-Design'],
      },
      {
        id: 'hyperautomation',
        title: 'Operations: Road to Hyperautomation',
        description:
          'Prozessoptimierung über Process Mining und Implementierung einer ganzheitlichen Automatisierungsstrategie mit klarem Business Case.',
        bullets: ['Process Mining', 'RPA + KI-Orchestrierung', 'ROI-Modell & Tracking'],
      },
      {
        id: 'composable',
        title: 'Infrastruktur: Composable Architecture',
        description:
          'Modernisierung der IT-Landschaft durch Composable Banking und schrittweise Migration von Altsystemen via Strangler-Fig-Pattern.',
        bullets: ['Composable-Blueprint', 'Strangler-Fig-Migration', 'BaaS-Integrationen'],
      },
      {
        id: 'change',
        title: 'Change: Future Workforce & Culture',
        description:
          'Begleitung des kulturellen Wandels, Konzeption von Upskilling-Programmen und Gestaltung neuer Jobprofile (z. B. AI-Translator).',
        bullets: ['Upskilling/Reskilling', 'AI-Translator-Curriculum', 'Lernkultur-Etablierung'],
      },
      {
        id: 'grc',
        title: 'GRC: AI Governance, Risk & Compliance',
        description:
          'Aufbau eines ganzheitlichen KI-Governance-Frameworks. Compliance mit EU AI Act und DSGVO. Transformation der Risk- und Revisionsfunktionen.',
        bullets: ['EU-AI-Act-Compliance', 'KI-Risk-Framework', 'Audit & Continuous Monitoring'],
      },
      {
        id: 'capital-markets-paket',
        title: 'Capital Markets: Next-Gen Asset Management',
        description:
          'Implementierung von KI-gestütztem Trading, prädiktiver Risikoanalyse und Erschließung des Geschäftsfelds „Tokenisierte Assets".',
        bullets: ['KI-Trading-Plattform', 'Prädiktive Risikoanalysen', 'Tokenized-Assets-Marktplatz'],
      },
    ],
  },
]

export function findModule(id) {
  return MODULES.find((m) => m.id === id)
}
