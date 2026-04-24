// Module catalog for the "Bank der Zukunft" workshop.
// Each module describes a pillar of the future bank with sub-aspects.
// Positions (x, y in percent) define the initial placement on the
// floating landing canvas.

export const MODULES = [
  {
    id: 'geschaeftsmodell',
    title: 'Geschäftsmodell',
    subtitle: 'Wie wir Wert schaffen',
    icon: 'Building2',
    color: '#38bdf8',
    colorDeep: '#0284c7',
    position: { x: 16, y: 22, size: 'lg', anim: 'bdz-float' },
    tagline:
      'Vom produktzentrierten Bank-Anbieter zum kundenzentrierten Ökosystempartner.',
    summary:
      'Das Geschäftsmodell der Bank der Zukunft ist kontextuell, datengetrieben und eingebettet. Kunden erleben Finanzdienstleistungen dort, wo sie entstehen — im Alltag, in der Kaufsituation, im unternehmerischen Prozess.',
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
        id: 'segments',
        title: 'Zielsegmente',
        description:
          'Hyper-Personalisierung auf Basis von Lebensphasen, Events und Mikrosegmenten.',
        bullets: [
          'Private Kunden & Vermögen',
          'Firmenkunden & Mittelstand',
          'Institutionelle Investoren',
        ],
      },
      {
        id: 'revenue',
        title: 'Revenue Streams',
        description:
          'Diversifizierung jenseits von Zins- und Provisionserträgen.',
        bullets: [
          'Subscription-Modelle für Beratung',
          'Data-Monetarisierung (DSGVO-konform)',
          'Plattform-Gebühren & API-Monetarisierung',
        ],
      },
      {
        id: 'partners',
        title: 'Ökosystem',
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
    id: 'betriebsmodell',
    title: 'Betriebsmodell',
    subtitle: 'Wie wir Wert liefern',
    icon: 'Workflow',
    color: '#a78bfa',
    colorDeep: '#6366f1',
    featured: true,
    position: { x: 62, y: 18, size: 'xl', anim: 'bdz-float-slow' },
    tagline:
      'Ein KI-natives Betriebsmodell mit klarer Orchestrierung zwischen Mensch, Prozess und Automatisierung.',
    summary:
      'Das Betriebsmodell der Zukunft verbindet skalierbare Prozessautomatisierung mit einem neu gedachten Arbeitsplatz. KI übernimmt repetitive Arbeit, Menschen fokussieren sich auf Beziehung, Urteil und Eskalation.',
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
          'Straight-Through-Processing für Standardprozesse, menschliche Eskalation nur noch bei Ausnahmen.',
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
        title: 'Prozesse',
        description:
          'Prozesse als Software — versioniert, testbar, kontinuierlich optimiert mit Prozess-Mining.',
        bullets: [
          'Event-getriebene Prozesse',
          'Process Mining & Observability',
          'Human-in-the-Loop-Design',
        ],
      },
    ],
  },
  {
    id: 'kundenerlebnis',
    title: 'Kundenerlebnis',
    subtitle: 'Wie Kunden uns erleben',
    icon: 'Sparkles',
    color: '#34d399',
    colorDeep: '#059669',
    position: { x: 14, y: 62, size: 'md', anim: 'bdz-float-reverse' },
    tagline:
      'Konsistent, proaktiv und nahtlos — über alle Kanäle hinweg mit KI als Guide.',
    summary:
      'Kunden begegnen der Bank nicht mehr an „Touchpoints", sondern werden entlang ihrer Lebensreise begleitet. KI-Assistenten antizipieren Bedürfnisse, bevor sie artikuliert werden.',
    pillars: [
      {
        id: 'omnichannel',
        title: 'Omnichannel',
        description:
          'Nahtloser Wechsel zwischen App, Web, Filiale, Voice und Messaging mit durchgehendem Kontext.',
        bullets: ['Unified Customer Context', 'Voice-First-Interfaces', 'Conversational Banking'],
      },
      {
        id: 'personalisierung',
        title: 'Hyper-Personalisierung',
        description:
          'Individuelle Ansprache, Produkte und Inhalte auf Basis von Echtzeit-Events und Präferenzen.',
        bullets: ['Behavioral Insights', 'Next-Best-Offer-Engine', 'Kontextuelle Empfehlungen'],
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
    id: 'daten-ki',
    title: 'Daten & KI',
    subtitle: 'Das Nervensystem der Bank',
    icon: 'BrainCircuit',
    color: '#fb7185',
    colorDeep: '#e11d48',
    position: { x: 48, y: 56, size: 'lg', anim: 'bdz-float' },
    tagline:
      'Eine moderne Daten- & KI-Plattform als Fundament für jeden Geschäftsprozess.',
    summary:
      'Daten sind das wertvollste Asset. Die Bank der Zukunft besitzt eine skalierbare, governance-starke Plattform, auf der generative KI, klassische ML-Modelle und Analytics gemeinsam leben.',
    pillars: [
      {
        id: 'platform',
        title: 'Daten-Plattform',
        description:
          'Data Mesh mit Domänen-Ownership, Feature Store und Echtzeit-Streams.',
        bullets: ['Data Mesh & Data Products', 'Feature Store', 'Event Streaming (Kafka)'],
      },
      {
        id: 'genai',
        title: 'Generative KI',
        description:
          'LLM-Gateway mit sicherem Zugang zu Modellen, Vektor-Indizes und Policy-Guardrails.',
        bullets: ['LLM-Gateway & Routing', 'Vector Search & RAG', 'Prompt- & Policy-Layer'],
      },
      {
        id: 'governance',
        title: 'Governance',
        description:
          'Datenhoheit, Qualität und Compliance by Design — mit Audit-Trail für jedes Modell.',
        bullets: ['Data Lineage', 'Model Registry', 'AI Act & DSGVO Compliance'],
      },
    ],
  },
  {
    id: 'technologie',
    title: 'Technologie',
    subtitle: 'Die Plattform dahinter',
    icon: 'Server',
    color: '#fbbf24',
    colorDeep: '#d97706',
    position: { x: 78, y: 60, size: 'md', anim: 'bdz-float-slow' },
    tagline:
      'Cloud-nativ, API-first und event-getrieben — mit Legacy-Modernisierung als Dauerthema.',
    summary:
      'Die Bank der Zukunft arbeitet auf einer modularen, resilient entwickelten Technologie-Basis. Neue Fähigkeiten entstehen in Wochen, nicht in Monaten.',
    pillars: [
      {
        id: 'cloud',
        title: 'Cloud-Native',
        description:
          'Multi-Cloud-Strategie mit Container-Orchestrierung und Zero-Trust-Sicherheit.',
        bullets: ['Kubernetes & Service Mesh', 'Zero-Trust Security', 'Observability'],
      },
      {
        id: 'api',
        title: 'API-First',
        description:
          'Alle Fähigkeiten als kuratierte APIs — für interne Teams, Partner und Kunden.',
        bullets: ['API-Gateway', 'Developer-Portal', 'Event-getriebene APIs'],
      },
      {
        id: 'legacy',
        title: 'Legacy-Transformation',
        description:
          'Schrittweise Ablösung von Monolithen durch domänenorientierte Services.',
        bullets: ['Strangler-Muster', 'Domain-Driven Design', 'Modular Banking'],
      },
    ],
  },
  {
    id: 'menschen-kultur',
    title: 'Menschen & Kultur',
    subtitle: 'Die Organisation als Software',
    icon: 'Users',
    color: '#f472b6',
    colorDeep: '#db2777',
    position: { x: 32, y: 82, size: 'sm', anim: 'bdz-float-reverse' },
    tagline:
      'KI-native Teams, neue Rollen und eine Kultur des kontinuierlichen Lernens.',
    summary:
      'Die Bank der Zukunft ist kein Tech-Unternehmen mit Banklizenz, sondern eine Organisation, in der Menschen und KI als Partner arbeiten. Dafür braucht es neue Rollen, neue Skills und eine Haltung.',
    pillars: [
      {
        id: 'roles',
        title: 'Neue Rollen',
        description:
          'Vom Sachbearbeiter zum Kurator — Menschen orchestrieren KI-Agenten statt Formulare auszufüllen.',
        bullets: ['AI Product Manager', 'Prompt Engineer', 'Domain Data Steward'],
      },
      {
        id: 'skills',
        title: 'Skills & Lernen',
        description:
          'Kontinuierliches Lernen als integraler Bestandteil des Arbeitsalltags.',
        bullets: ['KI-Grundausbildung für alle', 'Tool-Literacy', 'Experimentier-Kultur'],
      },
      {
        id: 'leadership',
        title: 'Führung',
        description:
          'Entscheidungen werden dezentralisiert, Transparenz wird zum Führungsinstrument.',
        bullets: ['Distributed Leadership', 'Outcome-orientierung', 'Psychological Safety'],
      },
    ],
  },
  {
    id: 'regulatorik',
    title: 'Regulatorik',
    subtitle: 'Compliance by Design',
    icon: 'ShieldCheck',
    color: '#22d3ee',
    colorDeep: '#0891b2',
    position: { x: 68, y: 84, size: 'sm', anim: 'bdz-float' },
    tagline:
      'Regulatorik nicht als Bremse, sondern als eingebaute Qualität.',
    summary:
      'Von MaRisk über DORA bis zum EU AI Act: Die Bank der Zukunft baut Compliance in ihre Plattform, Prozesse und Produkte ein — automatisiert, auditierbar, nachvollziehbar.',
    pillars: [
      {
        id: 'ai-act',
        title: 'EU AI Act',
        description:
          'Risiko-Klassifizierung, Transparenzpflichten und Monitoring für jedes KI-System.',
        bullets: ['Risiko-Register', 'Modell-Dokumentation', 'Continuous Monitoring'],
      },
      {
        id: 'dora',
        title: 'DORA & ICT-Resilienz',
        description:
          'Operative Widerstandsfähigkeit als Fundament — inklusive Drittanbieter-Risiken.',
        bullets: ['ICT-Risk-Framework', 'Third-Party-Register', 'Resilience Testing'],
      },
      {
        id: 'datenschutz',
        title: 'DSGVO & Datenhoheit',
        description:
          'Einwilligung, Zweckbindung und Löschkonzepte als Teil der Plattform.',
        bullets: ['Consent Management', 'Data Minimization', 'Privacy-by-Design'],
      },
    ],
  },
  {
    id: 'nachhaltigkeit',
    title: 'Nachhaltigkeit',
    subtitle: 'Finanzierung der Transformation',
    icon: 'Leaf',
    color: '#86efac',
    colorDeep: '#16a34a',
    position: { x: 84, y: 38, size: 'sm', anim: 'bdz-float-slow' },
    tagline:
      'Banken sind Schlüssel-Akteure der grünen Transformation — und müssen es selbst vorleben.',
    summary:
      'Die Bank der Zukunft lenkt Kapitalströme gezielt in nachhaltige Vorhaben, misst ESG-Wirkungen ihrer Portfolios und reduziert den eigenen Footprint.',
    pillars: [
      {
        id: 'esg-portfolio',
        title: 'ESG-Portfoliosteuerung',
        description:
          'Messbare ESG-KPIs für jedes Asset, integriert in Kredit- und Anlageentscheidungen.',
        bullets: ['ESG-Scoring', 'Klimapfad-Analyse', 'Impact-Reporting'],
      },
      {
        id: 'green-products',
        title: 'Grüne Produkte',
        description:
          'Transition-Finance, Green Loans und nachhaltige Investmentstrategien.',
        bullets: ['Sustainable Finance', 'Transition Loans', 'Green Bonds'],
      },
      {
        id: 'own-footprint',
        title: 'Eigener Footprint',
        description:
          'Vom Rechenzentrum bis zur Filiale: Klima-Netto-Null als Ziel.',
        bullets: ['Green Data Centers', 'CO2-Reporting', 'Supply-Chain-Transparenz'],
      },
    ],
  },
]

export function findModule(id) {
  return MODULES.find((m) => m.id === id)
}
