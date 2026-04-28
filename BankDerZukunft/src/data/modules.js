// Module catalog for the "Bank der Zukunft" workshop.
// 5 Module in einem 2-1-2-Layout: „Bank der Zukunft" als zentraler Hub,
// die vier anderen als Eckpunkte. Positionen (x, y in Prozent) definieren
// die initiale Platzierung auf der schwebenden Landing-Canvas.

export const MODULES = [
  {
    id: 'kundenperspektive',
    title: 'Kundenperspektive',
    subtitle: 'Wie Kunden uns erleben',
    icon: 'Users',
    color: '#34d399',
    colorDeep: '#059669',
    position: { x: 22, y: 28, size: 'lg', anim: 'bdz-float' },
    tagline:
      'Konsistent, proaktiv und nahtlos — von Privatkunde bis Capital Markets.',
    summary:
      'Kunden begegnen der Bank nicht mehr an einzelnen „Touchpoints", sondern werden entlang ihrer Lebens- und Geschäftsereignisse begleitet. KI-Assistenten antizipieren Bedürfnisse, bevor sie artikuliert werden — und liefern Antworten, die zur jeweiligen Lebenslage passen.',
    pillars: [
      {
        id: 'omnichannel',
        title: 'Omnichannel-Erlebnis',
        description:
          'Nahtloser Wechsel zwischen App, Web, Filiale, Voice und Messaging — mit durchgehendem Kontext.',
        bullets: ['Unified Customer Context', 'Voice-First-Interfaces', 'Conversational Banking'],
      },
      {
        id: 'personalisierung',
        title: 'Hyper-Personalisierung',
        description:
          'Individuelle Ansprache, Produkte und Inhalte auf Basis von Echtzeit-Events und Open-Finance-Daten.',
        bullets: ['Behavioral Insights', 'Next-Best-Offer-Engine', 'Lebenslagen-Erkennung'],
      },
      {
        id: 'capital-markets',
        title: 'Capital Markets-Sicht',
        description:
          'Institutionelle Kunden mit eigener Logik: Echtzeit-Trading, Research-Co-Pilot, Risiko-Cockpit.',
        bullets: ['Trader-Co-Pilot', 'Research-as-a-Service', 'Echtzeit-Risiko-Dashboards'],
      },
      {
        id: 'trust',
        title: 'Vertrauen & Transparenz',
        description:
          'Erklärbare KI, Datenhoheit und transparente Entscheidungen als Basis für Kundenbindung.',
        bullets: ['Explainable AI', 'Consent Management', 'Fairness & Bias-Monitoring'],
      },
    ],
  },
  {
    id: 'betriebsmodell-zukunft',
    title: 'Betriebsmodell der Zukunft',
    subtitle: 'Wie wir Wert liefern',
    icon: 'Workflow',
    color: '#a78bfa',
    colorDeep: '#7c3aed',
    position: { x: 78, y: 28, size: 'lg', anim: 'bdz-float-slow' },
    tagline:
      'Ein KI-natives Betriebsmodell mit klarer Orchestrierung zwischen Mensch, Prozess und Automatisierung.',
    summary:
      'Das Betriebsmodell der Zukunft verbindet skalierbare Prozessautomatisierung mit einem neu gedachten Arbeitsplatz. KI übernimmt repetitive Arbeit, Menschen fokussieren sich auf Beziehung, Urteil und Eskalation. Demos zeigen, wie der Vertriebsarbeitsplatz heute schon aussehen kann.',
    pillars: [
      {
        id: 'vertriebsarbeitsplatz',
        title: 'Vertriebsarbeitsplatz',
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
        id: 'backoffice',
        title: 'Backoffice-Automation',
        description:
          'Straight-Through-Processing für Standardprozesse, menschliche Eskalation nur bei Ausnahmen.',
        bullets: [
          'Dokumentenverarbeitung mit KI',
          'Automatisierte Antrags- & Kreditstrecken',
          'Exception-Handling per Workflow',
        ],
      },
      {
        id: 'organisation',
        title: 'Organisation',
        description:
          'Cross-funktionale Product-Teams mit Ende-zu-Ende-Verantwortung für Kundenreisen.',
        bullets: [
          'Domänen-orientierter Zuschnitt',
          'Plattform- & Produktteams',
          'KI-native Skill-Profile',
        ],
      },
      {
        id: 'prozesse',
        title: 'Prozesse als Software',
        description:
          'Versioniert, testbar, kontinuierlich optimiert mit Prozess-Mining und Observability.',
        bullets: [
          'Event-getriebene Prozesse',
          'Process Mining',
          'Human-in-the-Loop-Design',
        ],
      },
    ],
  },
  {
    id: 'bank-der-zukunft',
    title: 'Bank der Zukunft',
    subtitle: 'Das gemeinsame Zielbild',
    icon: 'Compass',
    color: '#38bdf8',
    colorDeep: '#0284c7',
    featured: true,
    position: { x: 50, y: 52, size: 'xl', anim: 'bdz-float-slow' },
    tagline:
      'Vom produktzentrierten Bank-Anbieter zum kundenzentrierten, KI-nativen Ökosystempartner.',
    summary:
      'Die Bank der Zukunft ist kontextuell, datengetrieben, eingebettet — und wirtschaftlich nachhaltig. Sie liefert Outcomes statt Produkte, agiert als Plattform und macht KI zum Mitarbeitenden. Dieses Modul ist die zentrale Klammer für alle anderen Bausteine.',
    pillars: [
      {
        id: 'value',
        title: 'Wertversprechen',
        description:
          'Plattform-basierte Finanzdienstleistungen mit klarem Outcome-Versprechen statt Produktkatalog.',
        bullets: [
          'Embedded Finance für Retail & Firmenkunden',
          'Advisory-as-a-Service statt Produktverkauf',
          'Plattform-Ökosysteme mit Fintech-Partnern',
        ],
      },
      {
        id: 'revenue',
        title: 'Revenue-Modelle',
        description:
          'Diversifizierung jenseits klassischer Zins- und Provisionserträge.',
        bullets: [
          'Subscription-Modelle für Beratung',
          'Plattform-Gebühren & API-Monetarisierung',
          'Data-Monetarisierung (DSGVO-konform)',
        ],
      },
      {
        id: 'ki-native',
        title: 'KI-natives Selbstverständnis',
        description:
          'Die Organisation arbeitet mit KI als ständigem Partner — nicht als Tool, sondern als Kollege.',
        bullets: [
          'Agentische KI in jedem Prozess',
          'Daten- und Modell-Plattform als Fundament',
          'Continuous Learning Culture',
        ],
      },
      {
        id: 'oekosystem',
        title: 'Ökosystem-Strategie',
        description:
          'Strategische Partnerschaften als zentraler Hebel für Reichweite und Innovation.',
        bullets: [
          'Fintech-Kooperationen',
          'Banking-as-a-Service-Angebote',
          'Plattform-Integrationen mit Marktplätzen',
        ],
      },
    ],
  },
  {
    id: 'transitionspfad',
    title: 'Transitions- & Transformationspfad',
    subtitle: 'Vom Heute zum Zielbild',
    icon: 'Workflow',
    color: '#fbbf24',
    colorDeep: '#d97706',
    position: { x: 22, y: 78, size: 'lg', anim: 'bdz-float-reverse' },
    tagline:
      'Ein klarer Weg in mehreren Wellen — vom heutigen Zustand zur Bank der Zukunft.',
    summary:
      'Transformation ist kein Big Bang. Wir definieren Wellen, MVPs und Quick Wins, machen Abhängigkeiten sichtbar und priorisieren entlang von Wert und Risiko. Capital Markets und Retail laufen dabei in unterschiedlichen Geschwindigkeiten — aber auf demselben Zielbild.',
    pillars: [
      {
        id: 'roadmap',
        title: 'Wellen-Roadmap',
        description:
          'Drei bis fünf Transformations-Wellen mit klaren Meilensteinen und MVP-Lieferungen.',
        bullets: ['Welle 1: Foundations', 'Welle 2: Scale & Embed', 'Welle 3: Reinvent'],
      },
      {
        id: 'priorisierung',
        title: 'Wert & Risiko-Priorisierung',
        description:
          'Initiativen werden nach Business-Value, Realisierungsrisiko und Abhängigkeiten geordnet.',
        bullets: ['Value-Risk-Matrix', 'Dependency-Graph', 'OKR-Verankerung'],
      },
      {
        id: 'governance',
        title: 'Transformations-Governance',
        description:
          'Klare Entscheidungsstrukturen, Steering-Boards, Eskalationspfade — schnell und transparent.',
        bullets: ['Steering Cadence', 'PMO & Reporting', 'Change-Management'],
      },
      {
        id: 'transition',
        title: 'Capital Markets vs. Retail',
        description:
          'Zwei Zielarchitekturen, ein gemeinsames Fundament — abgestimmte Migrationspfade.',
        bullets: ['Spartenspezifische MVPs', 'Gemeinsame Plattform-Bausteine', 'Migrations-Welle pro Sparte'],
      },
    ],
  },
  {
    id: 'offering',
    title: 'Offering & Angebotsbausteine',
    subtitle: 'Was wir konkret liefern',
    icon: 'ShieldCheck',
    color: '#fb7185',
    colorDeep: '#e11d48',
    position: { x: 78, y: 78, size: 'lg', anim: 'bdz-float' },
    tagline:
      'Modulare Angebotsbausteine — von Strategie über Architektur bis zum betriebenen Service.',
    summary:
      'Unsere Angebote sind so zusammengesteckt, wie der Kunde sie gerade braucht: vom Strategie-Sprint über Architektur-Blueprints bis zum laufenden Betrieb. Jeder Baustein steht für sich, lässt sich aber zu kompletten Transformationsprogrammen kombinieren.',
    pillars: [
      {
        id: 'strategy',
        title: 'Strategie & Zielbild',
        description:
          'Co-creation des Zielbilds, Business-Cases und Investitionspfade — schnell und entscheidungsreif.',
        bullets: ['Zielbild-Workshops', 'Business-Case-Modell', 'Investitions-Roadmap'],
      },
      {
        id: 'architecture',
        title: 'Architektur & Blueprints',
        description:
          'Referenzarchitekturen für Daten, KI und Plattformen — anschlussfähig an die Realität der Bank.',
        bullets: ['Daten- & KI-Plattform-Blueprints', 'Domain-Driven-Design', 'Tech-Stack-Empfehlungen'],
      },
      {
        id: 'delivery',
        title: 'Implementation & Delivery',
        description:
          'Hands-on Umsetzung in Sprints — gemeinsam mit den Bank-Teams, nicht „über sie hinweg".',
        bullets: ['Squad-Aufstellung', 'Inkrementelle Auslieferung', 'Knowledge-Transfer'],
      },
      {
        id: 'managed',
        title: 'Managed Services',
        description:
          'Ausgewählte Bausteine als laufender Service — von KI-Modellen bis zu Compliance-Frameworks.',
        bullets: ['MLOps-as-a-Service', 'AI-Governance-Service', 'Continuous-Compliance'],
      },
    ],
  },
]

export function findModule(id) {
  return MODULES.find((m) => m.id === id)
}
