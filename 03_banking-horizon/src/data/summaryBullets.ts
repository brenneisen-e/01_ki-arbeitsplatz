// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY_BULLETS — Management-Summary-Kernaussagen je Kapitel (McKinsey-Stil,
// so-what-first, prägnant, einzeilig). `**fett**` hebt die Kernaussage hervor.
// Wird im Reader (Summary-Kachel) und im Admin-CMS genutzt.
// ─────────────────────────────────────────────────────────────────────────────

import type { L } from '../i18n/LanguageContext'

export const SUMMARY_BULLETS: Record<string, L[]> = {
  kunde: [
    { de: '**Banking wird unsichtbar**: KI-Assistenten begleiten Kunden kontinuierlich im Alltag.', en: '**Banking becomes invisible**: AI assistants accompany customers continuously in daily life.', fr: '**La banque devient invisible** : des assistants IA accompagnent les clients en continu au quotidien.' },
    { de: '**Von der Auswahl zur Entscheidung**: KI macht aus vielen Optionen klare, begründete Empfehlungen.', en: '**From selection to decision**: AI turns many options into clear, reasoned recommendations.', fr: '**Du choix à la décision** : l’IA transforme une multitude d’options en recommandations claires et argumentées.' },
    { de: '**Von reaktiv zu proaktiv**: teilautonome Finanzsteuerung mit Vertrauensmandat.', en: '**From reactive to proactive**: semi-autonomous financial management with a trust mandate.', fr: '**Du réactif au proactif** : une gestion financière semi-autonome fondée sur un mandat de confiance.' },
  ],
  vertrieb: [
    { de: '**Vom Produktvertrieb zur Lösungsorchestrierung**: Berater bauen mit KI maßgeschneiderte Lösungen.', en: '**From product sales to solution orchestration**: advisors build tailored solutions with AI.', fr: '**De la vente de produits à l’orchestration de solutions** : les conseillers construisent avec l’IA des solutions sur mesure.' },
    { de: '**Beratung wird KI-augmentiert**: Der Mensch fokussiert komplexe Entscheidungen.', en: '**Advisory becomes AI-augmented**: people focus on complex decisions.', fr: '**Le conseil est augmenté par l’IA** : l’humain se concentre sur les décisions complexes.' },
    { de: '**Die Kundenschnittstelle wird dauerhaft und hyperpersonalisiert**: kanalübergreifend, in Echtzeit.', en: '**The customer interface becomes permanent and hyper-personalised**: cross-channel, in real time.', fr: '**L’interface client devient permanente et hyperpersonnalisée** : omnicanale, en temps réel.' },
  ],
  marktfolge: [
    { de: '**Marktfolge wird zur autonomen Dunkelverarbeitung**: Menschen greifen nur im Ausnahmefall ein.', en: '**Operations become autonomous straight-through processing**: humans step in only for exceptions.', fr: '**Les opérations basculent vers un traitement STP autonome** : l’humain n’intervient qu’en cas d’exception.' },
    { de: '**Die interne Wertschöpfung öffnet sich**: modulare Plattformen, die Bank als Orchestrator.', en: '**The internal value chain opens up**: modular platforms, the bank as orchestrator.', fr: '**La chaîne de valeur interne s’ouvre** : plateformes modulaires, la banque en orchestrateur.' },
    { de: '**Von der Kostenstelle zur Serviceplattform**: Banking-as-a-Service mit Compliance by Design.', en: '**From cost centre to service platform**: banking-as-a-service with compliance by design.', fr: '**Du centre de coûts à la plateforme de services** : banking-as-a-service conforme dès la conception.' },
  ],
  corporate: [
    { de: '**Von punktuellem Training zu kontinuierlichem Kompetenzaufbau**: KI-personalisiert und immersiv.', en: '**From point-in-time training to continuous capability building**: AI-personalised and immersive.', fr: '**De la formation ponctuelle au développement continu des compétences** : personnalisé par l’IA et immersif.' },
    { de: '**Steuerung über Kompetenzen statt Strukturen**: flexible, fließende Teams.', en: '**Steering by capabilities rather than structures**: flexible, fluid teams.', fr: '**Piloter par les compétences plutôt que par les structures** : des équipes flexibles et fluides.' },
    { de: '**Personalsteuerung wird vorausschauend und datenbasiert**, mit lebenslangem Reskilling.', en: '**Workforce management becomes predictive and data-driven**, with lifelong reskilling.', fr: '**Le pilotage des effectifs devient prospectif et fondé sur les données**, avec un reskilling tout au long de la vie.' },
  ],
  it: [
    { de: '**AI-Delivery löst die klassische Softwareentwicklung ab**: Teams steuern statt zu programmieren.', en: '**AI delivery replaces classic software development**: teams steer rather than program.', fr: '**La delivery par l’IA remplace le développement logiciel classique** : les équipes pilotent au lieu de programmer.' },
    { de: '**Die IT wird zur selbstoptimierenden, datengetriebenen Plattform.**', en: '**IT becomes a self-optimising, data-driven platform.**', fr: '**L’IT devient une plateforme auto-optimisée et pilotée par les données.**' },
    { de: '**Von der Gatekeeper- zur Enabler-Rolle**: KI entscheidet in klaren Leitplanken.', en: '**From gatekeeper to enabler**: AI decides within clear guardrails.', fr: '**Du rôle de gardien du temple à celui de catalyseur** : l’IA décide dans des garde-fous clairs.' },
  ],
  compliance: [
    { de: '**Von der nachgelagerten Prüfung zur Echtzeit-Compliance**, direkt in den Systemen.', en: '**From ex-post review to real-time compliance**, embedded directly in the systems.', fr: '**Du contrôle a posteriori à la conformité en temps réel**, directement dans les systèmes.' },
    { de: '**Integrierte, kontinuierliche Kontrolle** in einem KI-überwachten Governance-Cockpit.', en: '**Integrated, continuous control** in an AI-monitored governance cockpit.', fr: '**Un contrôle intégré et continu** dans un cockpit de gouvernance supervisé par l’IA.' },
    { de: '**Cyber- und Operational-Risk-Resilienz wird geschäftskritisch**, fest im Betriebsmodell verankert.', en: '**Cyber and operational-risk resilience becomes business-critical**, anchored in the operating model.', fr: '**La résilience face aux risques cyber et opérationnels devient critique pour l’activité**, solidement ancrée dans le modèle opérationnel.' },
    { de: '**Compliance und Revision werden zu Enablern** der KI-Transformation, mit Explainability.', en: '**Compliance and audit become enablers** of the AI transformation, with explainability.', fr: '**La conformité et l’audit deviennent des catalyseurs** de la transformation IA, grâce à l’explicabilité.' },
  ],
  transformation: [
    { de: '**KI als strategischer Fixstern**: Die Plattform wird zum Geschäfts- und Betriebsmodell.', en: '**AI as a strategic guiding star**: the platform becomes the business and operating model.', fr: '**L’IA comme étoile polaire stratégique** : la plateforme devient le modèle d’affaires et le modèle opérationnel.' },
    { de: '**Ein KI-natives Target Operating Model** mit Journey-Teams und Human-in-the-loop.', en: '**An AI-native target operating model** with journey teams and human-in-the-loop.', fr: '**Un modèle opérationnel cible natif IA** avec des équipes parcours et l’humain dans la boucle.' },
    { de: '**Decision-first statt isolierter Use Cases**: klare Roadmap, skalierbare Decision Spine.', en: '**Decision-first rather than isolated use cases**: a clear roadmap, a scalable decision spine.', fr: '**Decision-first plutôt que des cas d’usage isolés** : une feuille de route claire, une Decision Spine évolutive.' },
    { de: '**Wandel im Target Operating Model verankert**: strukturiert vom Reifegrad zum Zielbild.', en: '**Change anchored in the target operating model**: structured from maturity to target picture.', fr: '**Le changement ancré dans le modèle opérationnel cible** : de la maturité actuelle à la cible, de façon structurée.' },
  ],
  projekt: [
    { de: '**Vom Produktkatalog zum Segment of One**: KI komponiert Lösungen im Moment des Bedarfs.', en: '**From product catalogue to segment of one**: AI composes solutions at the moment of need.', fr: '**Du catalogue de produits au Segment of One** : l’IA compose des solutions au moment du besoin.' },
    { de: '**Produkte werden zu lebenden, adaptiven Services**: Selbstanpassung in klaren Leitplanken.', en: '**Products become living, adaptive services**: self-adjusting within clear guardrails.', fr: '**Les produits deviennent des services vivants et adaptatifs** : auto-ajustement dans des garde-fous clairs.' },
    { de: '**Produktentwicklung wird kontinuierlich**: Time-to-Market von Jahren auf Tage.', en: '**Product development becomes continuous**: time-to-market from years to days.', fr: '**Le développement produit devient continu** : un time-to-market qui passe de plusieurs années à quelques jours.' },
  ],
  vorstand: [
    { de: '**Von periodischer Berichterstattung zur Echtzeit-Steuerung** über ein Governance-Cockpit.', en: '**From periodic reporting to real-time steering** via a governance cockpit.', fr: '**Du reporting périodique au pilotage en temps réel** via un cockpit de gouvernance.' },
    { de: '**AI-Governance wird Vorstandsverantwortung**: Leitplanken, Risikoappetit, Ethik, Explainability.', en: '**AI governance becomes a board responsibility**: guardrails, risk appetite, ethics, explainability.', fr: '**La gouvernance de l’IA devient une responsabilité de la direction générale** : garde-fous, appétit au risque, éthique, explicabilité.' },
    { de: '**Von der Jahresstrategie zur kontinuierlichen Steuerung**, mit dynamischer Kapitalallokation.', en: '**From annual strategy to continuous steering**, with dynamic capital allocation.', fr: '**De la stratégie annuelle au pilotage continu**, avec une allocation dynamique du capital.' },
  ],
}
