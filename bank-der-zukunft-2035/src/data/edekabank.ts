// ─────────────────────────────────────────────────────────────────────────────
// EDEKABANK — zweite Instanz des begehbaren Strukturbilds.
//
// Nutzt dieselbe BankExplorer-Engine wie die Standard-Instanz „Bank'26"
// (siehe chapters.ts) — hier sind ausschließlich die Edekabank-spezifischen
// Daten/Texte/Bilder verdrahtet. Inhalte (7 Kapitel, je 3 Hypothesen + Absprung)
// und die Zonen-Koordinaten stammen 1:1 aus dem Build-Prompt
// (edekabank/build-prompt-bank-2035.md, §4).
//
// GERÜST-STAND (Platzhalter):
//   · Master-Strukturbild (00-strukturbild.png) liegt noch NICHT vor → der
//     ImageSlot zeigt einen sauberen Platzhalter mit erwartetem Dateinamen.
//   · Heute/2035-Vergleichsbilder je Hypothese (NN-h1/-h2/-h3.png) liegen noch
//     NICHT vor → ebenfalls Platzhalter.
//   · Die 7 gelieferten Szenen-Bilder sind je Kapitel als Aktivitäts-/Absprung-
//     Bild eingebunden (public/images/edekabank/0N-*.png). Die Kapitel-Zuordnung
//     ist provisorisch und kann jederzeit angepasst werden.
//   · Demo-iframe-URLs (Liquid, SDLC) kommen aus ENV-Variablen; solange leer,
//     zeigt die IframeStage den „noch nicht verdrahtet"-Platzhalter.
// ─────────────────────────────────────────────────────────────────────────────

import {
  makeExperienceApi,
  type Experience,
  type ExperienceApi,
  type RawChapter,
  type RawImageRef,
} from './chapters'
import type { L } from '../i18n/LanguageContext'

const l = (de: string, en: string): L => ({ de, en })
const img = (src: string, de: string, en: string): RawImageRef => ({ src, alt: l(de, en) })

const BASE = './images/edekabank'

// Live-Demo des KI-Vertriebsarbeitsplatzes (bereits deployt) — Absprung in Kap. 02.
const VERTRIEBSCOCKPIT_URL =
  'https://kiarbeitsplatz.pages.dev/vertriebsarbeitsplatz/dist/#/versicherung/landing/uebersicht'

// Noch nicht final hinterlegte Demo-URLs (TODO: in .env setzen).
const DEMO_LIQUID_URL = String(import.meta.env.VITE_DEMO_LIQUID_URL ?? '')
const DEMO_SDLC_URL = String(import.meta.env.VITE_DEMO_SDLC_URL ?? '')

// Platzhalter-Bild für die noch fehlenden Heute/2035-Vergleichsbilder. Der
// ImageSlot rendert daraus einen beschrifteten Platzhalter mit Dateinamen.
const split = (n: string, h: 1 | 2 | 3): RawImageRef =>
  img(
    `${BASE}/${n}-h${h}.png`,
    `Edekabank Kapitel ${n}, Hypothese ${h}: Heute/2035-Vergleichsbild (folgt).`,
    `Edekabank chapter ${n}, hypothesis ${h}: today/2035 comparison image (to come).`,
  )

const RAW_CHAPTERS: RawChapter[] = [
  // ── 01 Kundenperspektive ────────────────────────────────────────────────────
  {
    id: 'kunde',
    kapitel: '01',
    label: l('Kundenperspektive', 'Customer perspective'),
    ort: l('Kundenzone', 'Customer zone'),
    keyObject: 'Merchant Map · Needs & Opportunities',
    zone: { centerX: 27, centerY: 65, width: 34, height: 16, fit: 'contain' },
    vision: l(
      'Banking wird für die Edekabank-Kund:innen **unsichtbarer Teil des Alltags**: KI-Finanzassistenten begleiten kontinuierlich, bereiten Entscheidungen vor und handeln in vereinbarten Leitplanken proaktiv.',
      'For Edekabank customers, banking becomes an **invisible part of everyday life**: AI financial assistants accompany them continuously, prepare decisions and act proactively within agreed guardrails.',
    ),
    hypotheses: [
      {
        title: l('Kunde verschwindet als Moment', 'The customer moment disappears'),
        image: split('01', 1),
        statusQuo: l(
          'Heute aktives, kanalzentriertes Banking — Kund:innen „machen Banking" bewusst über App und Filiale.',
          'Today active, channel-centric banking — customers consciously “do banking” via app and branch.',
        ),
        in2035: l(
          'KI-Finanzassistenten begleiten **kontinuierlich und proaktiv** im Hintergrund.',
          'AI financial assistants accompany **continuously and proactively** in the background.',
        ),
      },
      {
        title: l('Optionen verschwinden, Entscheidung wird vorbereitet', 'Options disappear, the decision is prepared'),
        image: split('01', 2),
        statusQuo: l(
          'Heute viele Optionen zum Selbstentscheiden — wenig echte Entscheidungsunterstützung.',
          'Today many options to decide on yourself — little genuine decision support.',
        ),
        in2035: l(
          'Eine **klare KI-Empfehlung** mit Simulation und Begründung statt einer Optionsflut.',
          'One **clear AI recommendation** with simulation and rationale instead of a flood of options.',
        ),
      },
      {
        title: l('Von Reaktion zu trusted autonomy', 'From reaction to trusted autonomy'),
        image: split('01', 3),
        statusQuo: l(
          'Heute Interaktion auf Kundeninitiative — die Bank reagiert.',
          'Today interaction on the customer’s initiative — the bank reacts.',
        ),
        in2035: l(
          'Autonome Agenten erkennen Ereignisse früh und **handeln in Leitplanken** mit Freigabelogik.',
          'Autonomous agents detect events early and **act within guardrails** with approval logic.',
        ),
      },
    ],
    activity: {
      image: img(
        `${BASE}/01-kunde.png`,
        'Beraterin an einer kuratierten „Merchant Map" mit erkannten Bedarfen und Opportunitäten; ein holografischer KI-Assistent steht daneben.',
        'An advisor at a curated “Merchant Map” with detected needs and opportunities; a holographic AI assistant stands beside her.',
      ),
      title: l('Liquid — proaktiver Finanzassistent', 'Liquid — proactive financial assistant'),
      text: l(
        'Die Demo zeigt, wie ein KI-Assistent Bedarfe erkennt und **vorbereitete Entscheidungen** anbietet.',
        'The demo shows how an AI assistant detects needs and offers **prepared decisions**.',
      ),
      buttonLabel: l('Demo „Liquid" öffnen', 'Open the “Liquid” demo'),
      handoff: { kind: 'iframe', url: DEMO_LIQUID_URL, title: l('Demo Liquid', 'Liquid demo') },
    },
  },

  // ── 02 Markt & Vertrieb ──────────────────────────────────────────────────────
  {
    id: 'vertrieb',
    kapitel: '02',
    label: l('Markt & Vertrieb', 'Market & sales'),
    ort: l('Vertriebszone', 'Sales zone'),
    keyObject: 'Product Architecture Studio · Solution Composer',
    zone: { centerX: 27, centerY: 49, width: 34, height: 16, fit: 'contain' },
    vision: l(
      'Vom Produktvertrieb zum **kontext-basierten Lösungsorchestrator**: Standardtransaktionen laufen autonom, der Mensch übernimmt bei Komplexität — über eine permanente, hyperpersonalisierte Kundenschnittstelle.',
      'From product sales to a **context-based solution orchestrator**: standard transactions run autonomously, humans step in for complexity — through a permanent, hyper-personalised customer interface.',
    ),
    hypotheses: [
      {
        title: l('Vom Produktvertrieb zum Lösungsorchestrator', 'From product sales to solution orchestrator'),
        image: split('02', 1),
        statusQuo: l(
          'Heute Produktvertrieb entlang des eigenen Regals.',
          'Today product sales along the bank’s own shelf.',
        ),
        in2035: l(
          'Kontext-basierter **Lösungsorchestrator** — der Kunde definiert das Ziel.',
          'A context-based **solution orchestrator** — the customer defines the goal.',
        ),
      },
      {
        title: l('Vom Berater zum KI-Sparringspartner', 'From advisor to AI sparring partner'),
        image: split('02', 2),
        statusQuo: l(
          'Heute führt der Berater auch Standardtransaktionen.',
          'Today the advisor also handles standard transactions.',
        ),
        in2035: l(
          'Standardtransaktionen **autonom**, der Mensch bei Komplexität.',
          'Standard transactions run **autonomously**, humans for complexity.',
        ),
      },
      {
        title: l('Permanente hyperpersonalisierte Schnittstelle', 'Permanent hyper-personalised interface'),
        image: split('02', 3),
        statusQuo: l(
          'Heute punktuelle Kontakte zu definierten Anlässen.',
          'Today occasional contact on defined occasions.',
        ),
        in2035: l(
          'Permanente, **hyperpersonalisierte** Kundenschnittstelle in Echtzeit.',
          'A permanent, **hyper-personalised** customer interface in real time.',
        ),
      },
    ],
    activity: {
      image: img(
        `${BASE}/02-vertrieb.png`,
        'Ein „Product Architecture Studio": modulare Bausteine werden am Touch-Tisch zu einer maßgeschneiderten Lösung komponiert.',
        'A “Product Architecture Studio”: modular building blocks are composed into a tailored solution at a touch table.',
      ),
      title: l('Vertriebscockpit', 'Sales cockpit'),
      text: l(
        'Der Absprung öffnet das **live deployte Vertriebscockpit** des KI-Arbeitsplatzes.',
        'The hand-off opens the **live-deployed sales cockpit** of the AI workplace.',
      ),
      buttonLabel: l('Vertriebscockpit öffnen', 'Open the sales cockpit'),
      handoff: { kind: 'iframe', url: VERTRIEBSCOCKPIT_URL, title: l('Vertriebscockpit', 'Sales cockpit') },
    },
  },

  // ── 03 Marktfolge ────────────────────────────────────────────────────────────
  {
    id: 'marktfolge',
    kapitel: '03',
    label: l('Marktfolge', 'Operations / back office'),
    ort: l('Marktfolge-Zone', 'Operations zone'),
    keyObject: 'Autonomous Operations · Processing Pipelines',
    zone: { centerX: 73, centerY: 65, width: 32, height: 16, fit: 'contain' },
    vision: l(
      'Standardvorfälle laufen **E2E automatisch** (Dunkelverarbeitung); die Wertschöpfungskette bricht auf und die Marktfolge wird zur **skalierbaren Serviceplattform** — auch für Dritte.',
      'Standard cases run **end-to-end automatically** (straight-through processing); the value chain opens up and operations becomes a **scalable service platform** — also for third parties.',
    ),
    hypotheses: [
      {
        title: l('Autonome Dunkelverarbeitung', 'Autonomous straight-through processing'),
        image: split('03', 1),
        statusQuo: l(
          'Heute teil-manuelle Bearbeitung von Kredit, KYC und Abwicklung.',
          'Today partly manual processing of lending, KYC and settlement.',
        ),
        in2035: l(
          'Standardvorfälle laufen **E2E automatisch**.',
          'Standard cases run **end-to-end automatically**.',
        ),
      },
      {
        title: l('Wertschöpfungskette bricht auf', 'The value chain opens up'),
        image: split('03', 2),
        statusQuo: l(
          'Heute weitgehend integrierte Eigenleistung.',
          'Today largely integrated in-house production.',
        ),
        in2035: l(
          'Externe Plattformen/Utilities liefern **Standardleistungen herein**.',
          'External platforms/utilities deliver **standard services in**.',
        ),
      },
      {
        title: l('Skalierbare Serviceplattform', 'Scalable service platform'),
        image: split('03', 3),
        statusQuo: l(
          'Heute interne Kostenstelle.',
          'Today an internal cost centre.',
        ),
        in2035: l(
          'Marktfolge wird zur **Serviceplattform** — Banking-Services für Dritte.',
          'Operations becomes a **service platform** — banking services for third parties.',
        ),
      },
    ],
    activity: {
      image: img(
        `${BASE}/03-marktfolge.png`,
        'Leitstand „Autonomous Operations": Verarbeitungs-Pipelines, Ausnahmen und Eskalationen laufen über eine große Wandanzeige.',
        'An “Autonomous Operations” control room: processing pipelines, exceptions and escalations run across a large wall display.',
      ),
      title: l('Strategy Lab — Zukunftsrolle der Marktfolge', 'Strategy Lab — the future role of operations'),
      text: l(
        'Eine moderierte Diskussions-Übung: **Zukunftsrolle, intern vs. Ökosystem, Plattformpotenzial**.',
        'A facilitated discussion exercise: **future role, in-house vs. ecosystem, platform potential**.',
      ),
      buttonLabel: l('Strategy Lab starten', 'Start the Strategy Lab'),
      handoff: { kind: 'strategy-lab' },
    },
  },

  // ── 04 Corporate Services ────────────────────────────────────────────────────
  {
    id: 'corporate',
    kapitel: '04',
    label: l('Corporate Services', 'Corporate services'),
    ort: l('Corporate-Zone', 'Corporate zone'),
    keyObject: 'Skills & Workforce Steering',
    zone: { centerX: 28, centerY: 31, width: 36, height: 16, fit: 'contain' },
    vision: l(
      'Vom isolierten Training zum **kontinuierlichen, personalisierten Skill-Aufbau**: AI orchestriert Skills, Rollen und Teams in Echtzeit — datenbasierte, vorausschauende Workforce-Steuerung als Wettbewerbsvorteil.',
      'From isolated training to **continuous, personalised skill-building**: AI orchestrates skills, roles and teams in real time — data-driven, predictive workforce steering as a competitive advantage.',
    ),
    hypotheses: [
      {
        title: l('Kontinuierlicher Skill-Aufbau', 'Continuous skill-building'),
        image: split('04', 1),
        statusQuo: l('Heute isoliertes, punktuelles Training.', 'Today isolated, occasional training.'),
        in2035: l(
          'Kontinuierlicher, **personalisierter Skill-Aufbau**.',
          'Continuous, **personalised skill-building**.',
        ),
      },
      {
        title: l('Organisation skills-gesteuert', 'A skills-driven organisation'),
        image: split('04', 2),
        statusQuo: l('Heute starre Rollen und Teams.', 'Today rigid roles and teams.'),
        in2035: l(
          'AI orchestriert **Skills, Rollen und Teams in Echtzeit**.',
          'AI orchestrates **skills, roles and teams in real time**.',
        ),
      },
      {
        title: l('Workforce-Steuerung als Vorteil', 'Workforce steering as an advantage'),
        image: split('04', 3),
        statusQuo: l('Heute reaktive Personalplanung.', 'Today reactive workforce planning.'),
        in2035: l('**Datenbasiert und vorausschauend**.', '**Data-driven and predictive**.'),
      },
    ],
    activity: {
      image: img(
        `${BASE}/04-corporate.png`,
        'Zwei Führungskräfte vor einer Wand mit Märkten, Liquidität, Zahlungsströmen und Risikosignalen.',
        'Two executives in front of a wall showing markets, liquidity, payment flows and risk signals.',
      ),
      title: l('Co-Creation — Organisation 2035', 'Co-creation — the 2035 organisation'),
      text: l(
        'Eine freie Canvas-Übung: **Skills, Rollen und Teams** entlang der Dimensionen anordnen.',
        'A free-form canvas exercise: arrange **skills, roles and teams** along the dimensions.',
      ),
      buttonLabel: l('Co-Creation starten', 'Start co-creation'),
      handoff: { kind: 'cocreation', variant: 'organisation' },
    },
  },

  // ── 05 Technologie / IT ──────────────────────────────────────────────────────
  {
    id: 'it',
    kapitel: '05',
    label: l('Technologie / IT', 'Technology / IT'),
    ort: l('IT-Zone', 'IT zone'),
    keyObject: 'Engine Room & Data Core',
    zone: { centerX: 30, centerY: 85, width: 38, height: 22, fit: 'contain' },
    vision: l(
      '**Selbstoptimierende AI-Delivery**: Software entwickelt, testet und deployt sich selbst; IT wird zur modularen API-Plattform und verliert die Gatekeeper-Rolle — Fachbereiche steuern direkt.',
      '**Self-optimising AI delivery**: software develops, tests and deploys itself; IT becomes a modular API platform and loses its gatekeeper role — business units steer directly.',
    ),
    hypotheses: [
      {
        title: l('Selbstoptimierende AI-Delivery', 'Self-optimising AI delivery'),
        image: split('05', 1),
        statusQuo: l(
          'Heute manuelle Entwicklung, Tests und Deployments.',
          'Today manual development, testing and deployments.',
        ),
        in2035: l(
          'Software **entwickelt, testet und deployt sich selbst**.',
          'Software **develops, tests and deploys itself**.',
        ),
      },
      {
        title: l('AI entscheidet, IT wird Plattform', 'AI decides, IT becomes a platform'),
        image: split('05', 2),
        statusQuo: l('Heute monolithische IT.', 'Today monolithic IT.'),
        in2035: l(
          'IT als **modulare API-Plattform** statt Monolith.',
          'IT as a **modular API platform** instead of a monolith.',
        ),
      },
      {
        title: l('Fachbereiche steuern direkt', 'Business units steer directly'),
        image: split('05', 3),
        statusQuo: l('Heute IT als Gatekeeper.', 'Today IT as gatekeeper.'),
        in2035: l('IT **verliert die Gatekeeper-Rolle**.', 'IT **loses the gatekeeper role**.'),
      },
    ],
    activity: {
      image: img(
        `${BASE}/05-it.png`,
        'Ein „Engine Room & Data Core": ein zentrales Daten-/KI-Betriebssystem als leuchtender Kern, umringt von Arbeitsplätzen.',
        'An “Engine Room & Data Core”: a central data/AI operating system as a glowing core surrounded by workstations.',
      ),
      title: l('SDLC AI-Platform', 'SDLC AI platform'),
      text: l(
        'Die Demo zeigt eine **selbstoptimierende Software-Delivery**.',
        'The demo shows a **self-optimising software delivery**.',
      ),
      buttonLabel: l('SDLC AI-Platform öffnen', 'Open the SDLC AI platform'),
      handoff: { kind: 'iframe', url: DEMO_SDLC_URL, title: l('SDLC AI-Platform', 'SDLC AI platform') },
    },
  },

  // ── 06 Compliance & Risk ─────────────────────────────────────────────────────
  {
    id: 'compliance',
    kapitel: '06',
    label: l('Compliance & Risk', 'Compliance & risk'),
    ort: l('Compliance-Zone', 'Compliance zone'),
    keyObject: 'Foresight & Risk Steering',
    zone: { centerX: 27, centerY: 12, width: 36, height: 18, fit: 'contain' },
    vision: l(
      'Von der ex-post-Prüfung zur **Echtzeit-Kontrolle im Moment der Transaktion**: Die drei Verteidigungslinien verschmelzen zu einem integrierten Governance-Leitstand, Cyber- und Op-Risk sind ins Betriebsmodell verwoben.',
      'From ex-post checks to **real-time control at the moment of the transaction**: the three lines of defence merge into an integrated governance cockpit, with cyber and op risk woven into the operating model.',
    ),
    hypotheses: [
      {
        title: l('Von ex-post zu Echtzeit', 'From ex-post to real time'),
        image: split('06', 1),
        statusQuo: l('Heute nachgelagerte Prüfung.', 'Today downstream checks.'),
        in2035: l(
          'Prüfung **im Moment der Transaktion**.',
          'Checks **at the moment of the transaction**.',
        ),
      },
      {
        title: l('Three-Lines-of-Defense verschmilzt', 'Three lines of defence merge'),
        image: split('06', 2),
        statusQuo: l('Heute getrennte Verteidigungslinien.', 'Today separate lines of defence.'),
        in2035: l(
          'Ein **integrierter Governance-Leitstand**.',
          'A single **integrated governance cockpit**.',
        ),
      },
      {
        title: l('Cyber & Op-Risk im Betriebsmodell', 'Cyber & op risk in the operating model'),
        image: split('06', 3),
        statusQuo: l('Heute separate Kontrollen.', 'Today separate controls.'),
        in2035: l('**Resilienz im Betrieb verwoben**.', '**Resilience woven into operations**.'),
      },
    ],
    activity: {
      image: img(
        `${BASE}/06-compliance.png`,
        'Ein „Foresight & Risk Steering"-Cockpit: Stress-Signale, Forward-Szenarien und Frühwarn-Indikatoren, begleitet von einem holografischen Berater.',
        'A “Foresight & Risk Steering” cockpit: stress signals, forward scenarios and early-warning indicators, accompanied by a holographic advisor.',
      ),
      title: l('Kredit-Dilemma', 'The credit dilemma'),
      text: l(
        'Ein interaktives Szenario: Eine KI lehnt einen Großkredit autonom ab — **wer haftet?**',
        'An interactive scenario: an AI autonomously declines a large loan — **who is liable?**',
      ),
      buttonLabel: l('Kredit-Dilemma starten', 'Start the credit dilemma'),
      handoff: { kind: 'kredit-dilemma' },
    },
  },

  // ── 07 Transformation ────────────────────────────────────────────────────────
  {
    id: 'transformation',
    kapitel: '07',
    label: l('Transformation', 'Transformation'),
    ort: l('Transformations-Spine', 'Transformation spine'),
    keyObject: 'Leadership Steering Deck',
    zone: { centerX: 50, centerY: 50, width: 13, height: 94, fit: 'contain' },
    vision: l(
      'Eine **Ökosystem-Plattform mit Governance** und ein **AI-natives Operating Model** (Journey-Teams, E2E-Ownership, Human-in-the-loop) — getrieben **decision-first**: erst die kritischen Decision Journeys und die Decision Spine, dann der AI-Rollout.',
      'An **ecosystem platform with governance** and an **AI-native operating model** (journey teams, E2E ownership, human-in-the-loop) — driven **decision-first**: critical decision journeys and the decision spine first, then the AI rollout.',
    ),
    hypotheses: [
      {
        title: l('Ökosystem-Plattform mit Governance', 'Ecosystem platform with governance'),
        image: split('07', 1),
        statusQuo: l('Heute geschlossene, eigene Wertschöpfung.', 'Today a closed, in-house value chain.'),
        in2035: l(
          'Daten, Partner und Compliance **integriert**.',
          'Data, partners and compliance **integrated**.',
        ),
      },
      {
        title: l('AI-natives Operating Model', 'AI-native operating model'),
        image: split('07', 2),
        statusQuo: l('Heute funktionale Silos.', 'Today functional silos.'),
        in2035: l(
          '**Journey-Teams, E2E-Ownership, Human-in-the-loop**.',
          '**Journey teams, E2E ownership, human-in-the-loop**.',
        ),
      },
      {
        title: l('Decision-first Transformation', 'Decision-first transformation'),
        image: split('07', 3),
        statusQuo: l('Heute technologiegetriebener Rollout.', 'Today a technology-driven rollout.'),
        in2035: l(
          'Erst kritische **Decision Journeys + Decision Spine**, dann AI-Rollout.',
          'Critical **decision journeys + decision spine** first, then the AI rollout.',
        ),
      },
    ],
    activity: {
      image: img(
        `${BASE}/07-transformation.png`,
        'Ein „Leadership Steering Deck": Vorstand am Tisch vor Modell-Governance, Entscheidungs-Inputs und Eskalationen.',
        'A “Leadership Steering Deck”: the board at the table in front of model governance, decision inputs and escalations.',
      ),
      title: l('Future Interaction Model', 'Future interaction model'),
      text: l(
        'Eine Co-Creation entlang einer **Control-Shift-Matrix** für das Zielbild der Zusammenarbeit.',
        'A co-creation along a **control-shift matrix** for the target model of collaboration.',
      ),
      buttonLabel: l('Future Interaction Model', 'Future interaction model'),
      handoff: { kind: 'cocreation', variant: 'future-interaction' },
    },
  },
]

// Master-Strukturbild (Gebäude-Querschnitt der Edekabank) — liegt noch nicht vor.
// Seitenverhältnis laut Build-Prompt 3:2. Solange die Datei fehlt, zeigt der
// ImageSlot einen beschrifteten Platzhalter mit erwartetem Dateinamen.
const RAW_MASTER: RawImageRef = img(
  `${BASE}/00-strukturbild.png`,
  'Edekabank — fotorealistischer Gebäude-Querschnitt als begehbare Navigationskarte (folgt).',
  'Edekabank — photorealistic building cross-section as a walkable navigation map (to come).',
)

export const EDEKA_EXPERIENCE: Experience = {
  id: 'edeka',
  masterAspect: 3 / 2,
  rawMaster: RAW_MASTER,
  rawChapters: RAW_CHAPTERS,
}

export const EDEKA_API: ExperienceApi = makeExperienceApi(EDEKA_EXPERIENCE)
