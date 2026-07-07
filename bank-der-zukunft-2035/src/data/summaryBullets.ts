// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY_BULLETS — Management-Summary-Kernaussagen je Kapitel (McKinsey-Stil,
// so-what-first, prägnant, einzeilig). `**fett**` hebt die Kernaussage hervor.
// Wird im Reader (Summary-Kachel) und im Admin-CMS genutzt.
// ─────────────────────────────────────────────────────────────────────────────

export const SUMMARY_BULLETS: Record<string, { de: string; en: string }[]> = {
  kunde: [
    { de: '**Banking wird unsichtbar** — KI-Assistenten begleiten Kunden kontinuierlich im Alltag.', en: '**Banking becomes invisible** — AI assistants accompany customers continuously in daily life.' },
    { de: '**Von der Auswahl zur Entscheidung** — KI macht aus vielen Optionen klare, begründete Empfehlungen.', en: '**From selection to decision** — AI turns many options into clear, reasoned recommendations.' },
    { de: '**Von reaktiv zu proaktiv** — teilautonome Finanzsteuerung mit Vertrauensmandat.', en: '**From reactive to proactive** — semi-autonomous financial management with a trust mandate.' },
  ],
  vertrieb: [
    { de: '**Vom Produktvertrieb zur Lösungsorchestrierung** — Berater bauen mit KI maßgeschneiderte Lösungen.', en: '**From product sales to solution orchestration** — advisors build tailored solutions with AI.' },
    { de: '**Beratung wird KI-augmentiert** — der Mensch fokussiert komplexe Entscheidungen.', en: '**Advisory becomes AI-augmented** — people focus on complex decisions.' },
    { de: '**Die Kundenschnittstelle wird dauerhaft und hyperpersonalisiert** — kanalübergreifend, in Echtzeit.', en: '**The customer interface becomes permanent and hyper-personalised** — cross-channel, in real time.' },
  ],
  marktfolge: [
    { de: '**Marktfolge wird zur autonomen Dunkelverarbeitung** — Menschen greifen nur im Ausnahmefall ein.', en: '**Operations become autonomous straight-through processing** — humans step in only for exceptions.' },
    { de: '**Die interne Wertschöpfung öffnet sich** — modulare Plattformen, die Bank als Orchestrator.', en: '**The internal value chain opens up** — modular platforms, the bank as orchestrator.' },
    { de: '**Von der Kostenstelle zur Serviceplattform** — Banking-as-a-Service mit Compliance by Design.', en: '**From cost centre to service platform** — banking-as-a-service with compliance by design.' },
  ],
  corporate: [
    { de: '**Von punktuellem Training zu kontinuierlichem Kompetenzaufbau** — KI-personalisiert und immersiv.', en: '**From point-in-time training to continuous capability building** — AI-personalised and immersive.' },
    { de: '**Steuerung über Kompetenzen statt Strukturen** — flexible, fließende Teams.', en: '**Steering by capabilities rather than structures** — flexible, fluid teams.' },
    { de: '**Personalsteuerung wird vorausschauend und datenbasiert** — mit lebenslangem Reskilling.', en: '**Workforce management becomes predictive and data-driven** — with lifelong reskilling.' },
  ],
  it: [
    { de: '**AI-Delivery löst die klassische Softwareentwicklung ab** — Teams steuern statt zu programmieren.', en: '**AI delivery replaces classic software development** — teams steer rather than program.' },
    { de: '**Die IT wird zur selbstoptimierenden, datengetriebenen Plattform.**', en: '**IT becomes a self-optimising, data-driven platform.**' },
    { de: '**Von der Gatekeeper- zur Enabler-Rolle** — KI entscheidet in klaren Leitplanken.', en: '**From gatekeeper to enabler** — AI decides within clear guardrails.' },
  ],
  compliance: [
    { de: '**Von der nachgelagerten Prüfung zur Echtzeit-Compliance** — direkt in den Systemen.', en: '**From ex-post review to real-time compliance** — embedded directly in the systems.' },
    { de: '**Integrierte, kontinuierliche Kontrolle** — in einem KI-überwachten Governance-Cockpit.', en: '**Integrated, continuous control** — in an AI-monitored governance cockpit.' },
    { de: '**Cyber- und Operational-Risk-Resilienz wird geschäftskritisch** — fest im Betriebsmodell verankert.', en: '**Cyber and operational-risk resilience becomes business-critical** — anchored in the operating model.' },
    { de: '**Compliance und Revision werden zu Enablern** — der KI-Transformation, mit Explainability.', en: '**Compliance and audit become enablers** — of the AI transformation, with explainability.' },
  ],
  transformation: [
    { de: '**KI als strategischer Fixstern** — die Plattform wird zum Geschäfts- und Betriebsmodell.', en: '**AI as a strategic guiding star** — the platform becomes the business and operating model.' },
    { de: '**Ein KI-natives Target Operating Model** — mit Journey-Teams und Human-in-the-loop.', en: '**An AI-native target operating model** — with journey teams and human-in-the-loop.' },
    { de: '**Decision-first statt isolierter Use Cases** — klare Roadmap, skalierbare Decision Spine.', en: '**Decision-first rather than isolated use cases** — a clear roadmap, a scalable decision spine.' },
    { de: '**Wandel im Target Operating Model verankert** — strukturiert vom Reifegrad zum Zielbild.', en: '**Change anchored in the target operating model** — structured from maturity to target picture.' },
  ],
  projekt: [
    { de: '**Vom Produktkatalog zum Segment of One** — KI komponiert Lösungen im Moment des Bedarfs.', en: '**From product catalogue to segment of one** — AI composes solutions at the moment of need.' },
    { de: '**Produkte werden zu lebenden, adaptiven Services** — Selbstanpassung in klaren Leitplanken.', en: '**Products become living, adaptive services** — self-adjusting within clear guardrails.' },
    { de: '**Produktentwicklung wird kontinuierlich** — Time-to-Market von Jahren auf Tage.', en: '**Product development becomes continuous** — time-to-market from years to days.' },
  ],
  vorstand: [
    { de: '**Von periodischer Berichterstattung zur Echtzeit-Steuerung** — über ein Governance-Cockpit.', en: '**From periodic reporting to real-time steering** — via a governance cockpit.' },
    { de: '**AI-Governance wird Vorstandsverantwortung** — Leitplanken, Risikoappetit, Ethik, Explainability.', en: '**AI governance becomes a board responsibility** — guardrails, risk appetite, ethics, explainability.' },
    { de: '**Von der Jahresstrategie zur kontinuierlichen Steuerung** — mit dynamischer Kapitalallokation.', en: '**From annual strategy to continuous steering** — with dynamic capital allocation.' },
  ],
}
