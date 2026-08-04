// ─────────────────────────────────────────────────────────────────────────────
// CHAPTERS — die zentrale, editierbare Datenquelle für „Banking Horizon 2030".
//
// 9 Kapitel = 9 Zonen im Strukturbild. 8 raumgebundene Kapitel + der Aufzug
// (Glas-Spine) als vertikale Zone für die Transformation. Jedes Kapitel besteht
// aus
//   · 3 Hypothesen mit je einer Status-Quo- und einer In-2030-Aussage
//     (Vergleichsbild + zwei Text-Blöcke im Panel rechts)
//   · 1 Aktivitäts-/Demo-Bild mit Absprung (iframe-Demo, Strategy Lab,
//     Co-Creation oder Kredit-Dilemma-Tool).
//
// Hypothesen-Texte sind 1:1 aus dem Deck „Banking Horizon 2030 — Deep Dive".
//
// ZWEISPRACHIGKEIT: Alle nutzersichtbaren Texte sind als `L = { de, en }`
// hinterlegt. `getChapters(lang)` / `getChapter(id, lang)` / `getMasterImage(lang)`
// lösen sie in die aktive Sprache auf und liefern die unten exportierten,
// „flachen" Typen (Chapter, Hypothesis, Activity …) mit reinen Strings — die
// Komponenten arbeiten unverändert mit Strings weiter.
//
// BILD-SLOTS: Alle Bild-Pfade sind hier verdrahtet. Die Workshop-Bilder liegen
// als PNG unter `public/images/` — Schema: `Strukturbild.png` (Master) sowie
// pro Kapitel `Kapitel N_1.png` / `Kapitel N_2.png` / `Kapitel N_3.png`
// (Hypothesen) und `Kapitel N_Demo.png` (Aktivität), N = 1..8.
//
// RAUM-MAPPING (neues Strukturbild ab 2030, 4 Etagen über Grund):
//   3. OG links  → 09 Vorstand & Governance (Boardroom / Governance-Cockpit)
//   3. OG rechts → 08 Produkte & Innovation (Projektraum)
//   2. OG links  → 06 Compliance & Risk (Risikocontroller vor Bildschirmen)
//   2. OG rechts → 05 Technologie / IT (Label „Technology", LLM/MLOps)
//   1. OG links  → 04 Corporate Services (Corporate / HR)
//   1. OG rechts → 03 Marktfolge (Label „Operations")
//   EG links     → 01 Kundenperspektive (Filiale / Branch)
//   EG rechts    → 02 Markt & Vertrieb (Advisory / Beratung)
//   Aufzug       → 07 Transformation (Glas-Spine durch alle Etagen)
//
// Zoom-Koordinaten (ZONES) sind auf das echte `Strukturbild.png`
// (1536×1024, 4 Etagen) kalibriert. Im Browser ggf. um 1–2 % nachjustieren.
// ─────────────────────────────────────────────────────────────────────────────

import { pick, type L, type Lang } from '../i18n/LanguageContext'
import { LEITFRAGE_BY_IMAGE } from './leitfragen'

export type ChapterId =
  | 'kunde'
  | 'vertrieb'
  | 'marktfolge'
  | 'corporate'
  | 'it'
  | 'compliance'
  | 'transformation'
  | 'projekt'
  | 'vorstand'

export type Zone = {
  /** Mittelpunkt X in % der Bildbreite (0..100) — Zoom-Ziel. */
  centerX: number
  /** Mittelpunkt Y in % der Bildhöhe (0..100) — Zoom-Ziel. */
  centerY: number
  /** Breite der Zone in % der Bildbreite. */
  width: number
  /** Höhe der Zone in % der Bildhöhe. */
  height: number
  /**
   * 'contain' (Default) zeigt die Zone vollständig (andere Achse
   * letterboxed), 'cover' füllt die Stage formatfüllend mit Beschnitt.
   */
  fit?: 'cover' | 'contain'
  /**
   * Optional: Position von Label + Hotspot (% der Bild-Maße) — z. B. im
   * jeweiligen Raum statt im Zonen-Zentrum. Default: centerX / centerY.
   */
  labelX?: number
  labelY?: number
  /**
   * Optional: Trefferfläche für Hover/Klick, abweichend von der (größeren)
   * Zoom-Zone. Wird am Label-/Schlüsselobjekt-Punkt (labelX/labelY) zentriert,
   * sodass z. B. nur der Back-Office-Raum reagiert statt des ganzen Stockwerks.
   * Default: width / height (gesamte Zone).
   */
  hitWidth?: number
  hitHeight?: number
}

export type ImageRef = {
  /** Pfad relativ zu public/ (z. B. './images/Kapitel 1_1.png'). */
  src: string
  /** Beschreibung für Screenreader + Platzhalter-Label. */
  alt: string
}

export type Hypothesis = {
  /** These-Überschrift (Deck-Headline). */
  title: string
  image: ImageRef
  /** Status-Quo-Block (1:1 aus dem Deck). */
  statusQuo: string
  /** In-2030-Block (1:1 aus dem Deck). */
  in2030: string
  /** Optionale Leitfrage aus dem Deck. */
  leitfrage?: string
}

/**
 * Optional: ein im Aktivitäts-Bild sichtbarer Bildschirm, auf dem ein iframe
 * maßstabsgetreu eingeblendet wird (Koordinaten in % der Bild-Maße). Per
 * Klick wächst er auf Vollbild.
 */
export type ScreenOverlay = {
  url: string
  title: string
  leftPct: number
  topPct: number
  widthPct: number
  heightPct: number
}

/**
 * Absprung-Ziel des Aktivitäts-Bildes. Diskriminierte Union:
 *  · iframe         → Bildschirm im Bild wächst auf Vollbild, echte Demo
 *  · strategy-lab   → interaktive Karten-/Matrix-Übung (Kap. 03)
 *  · cocreation     → Co-Creation-Canvas (Kap. 04 + 07, zwei Varianten)
 *  · kredit-dilemma → Telefon-Sequenz + drei reagierende Balken (Kap. 06)
 */
export type Handoff =
  | { kind: 'iframe'; url: string; title: string }
  | { kind: 'strategy-lab' }
  | { kind: 'cocreation'; variant: 'organisation' | 'future-interaction' }
  | { kind: 'kredit-dilemma' }

export type Activity = {
  image: ImageRef
  /** Überschrift im Panel rechts. */
  title: string
  /** Beschreibung im Panel rechts. „**fett**" wird unterstützt. */
  text: string
  /** Beschriftung des Absprung-Buttons (unten rechts). */
  buttonLabel: string
  handoff: Handoff
  /**
   * Optional: iframe direkt auf einem im Aktivitäts-Bild sichtbaren Bildschirm
   * einblenden (z. B. Vertriebscockpit auf dem Monitor). Der Absprung-Button
   * lässt das iframe dann auf Vollbild wachsen.
   */
  screenOverlay?: ScreenOverlay
}

export type Chapter = {
  id: ChapterId
  /** Kapitelnummer als String, z. B. '01'. */
  kapitel: string
  /** Kurzlabel der Zone (Hover-Label im Strukturbild). */
  label: string
  /** Verortung, z. B. 'Plaza (außen)'. */
  ort: string
  /** Schlüsselobjekt der Zone (glüht beim Erreichen). */
  keyObject: string
  zone: Zone
  /**
   * Aus den drei Hypothesen abgeleitetes Vision Statement für diesen Bereich
   * der „Bank 2030" — wird in der Management Summary (Overlay über dem
   * Strukturbild) gerendert. `**fett**` markiert das besonders Wichtige.
   */
  vision: string
  /**
   * Exemplarischer Business Case: grobe, illustrative Financial-Impact-Schätzung
   * der Änderungen dieses Kapitels (mittelgroße Bank, Annahmen genannt). Wird im
   * Kapitel als Management-Summary-Block gerendert. `**fett**` markiert Kernzahlen.
   */
  businessCase: string
  /** Ein bis mehrere Hypothesen (i. d. R. drei; Kapitel mit Zusatz-Hypothesen mehr). */
  hypotheses: Hypothesis[]
  activity: Activity
  /**
   * Teaser-Kapitel: Es wird NUR die Einstiegsbühne gezeigt (keine Hypothesen,
   * keine Aktivität, keine Summary) — der Raum wird kundenspezifisch bei Bedarf
   * gestaltet. Auch aus Management-Summary-Übersicht und Excel-Export ausgenommen.
   */
  teaserOnly?: boolean
}

// ─── Roh-Typen (zweisprachig). Werden über `localize*` in die obigen flachen
//     Typen aufgelöst. ───────────────────────────────────────────────────────

export type RawImageRef = { src: string; alt: L }
type RawHypothesis = {
  title: L
  image: RawImageRef
  statusQuo: L
  in2030: L
  leitfrage?: L
}
type RawScreenOverlay = {
  url: string
  title: L
  leftPct: number
  topPct: number
  widthPct: number
  heightPct: number
}
type RawHandoff =
  | { kind: 'iframe'; url: string; title: L }
  | { kind: 'strategy-lab' }
  | { kind: 'cocreation'; variant: 'organisation' | 'future-interaction' }
  | { kind: 'kredit-dilemma' }
type RawActivity = {
  image: RawImageRef
  title: L
  text: L
  buttonLabel: L
  handoff: RawHandoff
  screenOverlay?: RawScreenOverlay
}
export type RawChapter = {
  id: ChapterId
  kapitel: string
  label: L
  ort: L
  keyObject: string
  zone: Zone
  vision: L
  businessCase: L
  hypotheses: RawHypothesis[]
  activity: RawActivity
  teaserOnly?: boolean
}

// Live-Demo des KI-Vertriebsarbeitsplatzes (bereits deployt). Wird im
// Vertriebs-Kapitel als „Vertriebscockpit" eingebunden.
const VERTRIEBSCOCKPIT_URL =
  'https://kiarbeitsplatz.pages.dev/vertriebsarbeitsplatz/dist/#/versicherung/landing/uebersicht'

const RAW_CHAPTERS: RawChapter[] = [
  // ── 01 Kundenperspektive · Erdgeschoss (Filiale) ──────────────────────────
  {
    id: 'kunde',
    kapitel: '01',
    label: { de: 'Kundenperspektive', en: 'Customer Perspective' },
    ort: { de: 'Erdgeschoss links (Filiale)', en: 'Ground floor left (branch)' },
    keyObject: 'Self-Service-Lounge & Schalter',
    // Filiale links unten im Erdgeschoss (Bank'26-Schalter mit Kundenkontakt).
    // Bewusst NICHT die ganze Etage/den Fahrstuhl, sondern der Schalterbereich.
    zone: { centerX: 27, centerY: 85, width: 38, height: 22, labelX: 30, labelY: 82, hitWidth: 32, hitHeight: 18 },
    vision: {
      de: 'Für unsere Kunden wird Banking 2030 **unsichtbar und Teil des Alltags** statt eigener Interaktion: Persönliche KI-Finanzassistenten begleiten kontinuierlich, verwandeln eine Flut von Optionen in **klare, simulierte und begründete Empfehlungen** und handeln innerhalb vereinbarter Leitplanken proaktiv. Aus reaktivem Warten wird **teilautonome Finanzsteuerung mit Vertrauensmandat — der Kunde entscheidet, aber auf KI-vorbereiteter Grundlage**.',
      en: 'For our customers, banking in 2030 becomes **invisible and part of everyday life** rather than a separate interaction: personal AI financial assistants accompany them continuously, turn a flood of options into **clear, simulated and reasoned recommendations** and act proactively within agreed guardrails. Reactive waiting gives way to **semi-autonomous financial management with a trust mandate — the customer decides, but on an AI-prepared basis**.',
    },
    businessCase: {
      de: 'Exemplarisch (mittelgroße Bank, illustrativ): Proaktive KI-Finanzassistenten heben die Cross-Selling-Quote um **10–15 %** und senken die Abwanderung um **15–20 %**. Bei rund 250.000 Kunden entspricht das etwa **8–12 Mio € Mehrertrag p.a.**. Zugleich sinken die Servicekosten je Kontakt um **30–40 %**.',
      en: 'Illustrative example (mid-sized bank): Proactive AI financial assistants lift the cross-selling rate by **10–15 %** and cut churn by **15–20 %**. For around 250,000 customers that is roughly **€8–12m additional revenue p.a.**. At the same time, service cost per contact drops by **30–40 %**.',
    },
    hypotheses: [
      {
        title: { de: 'Banking verschwindet als eigener Moment', en: 'Banking disappears as a distinct moment' },
        image: {
          src: './images/Kapitel 1_1.png',
          alt: {
            de: 'Status Quo: Kundin tippt aktiv in einer Banking-App. 2030: persönlicher KI-Finanzassistent arbeitet unaufgefordert im Hintergrund auf Smartwatch und Smartphone.',
            en: 'Status quo: a customer actively taps in a banking app. 2030: a personal AI financial assistant works unprompted in the background on smartwatch and smartphone.',
          },
        },
        statusQuo: {
          de: 'Kunden „machen Banking" aktiv über App, Filiale oder Online-Banking – Interaktion ist **kanalzentriert und reaktiv**.',
          en: 'Customers actively “do banking” via app, branch or online banking – interaction is **channel-centric and reactive**.',
        },
        in2030: {
          de: 'Banking erfolgt über **persönliche KI-Finanzassistenten / Agents**, die kontinuierlich begleiten, kontextualisieren und proaktiv relevante Impulse geben – Banking wird **Teil des Alltags** statt eigener Interaktion.',
          en: 'Banking happens through **personal AI financial assistants / agents** that continuously accompany, contextualise and proactively provide relevant nudges – banking becomes **part of everyday life** rather than a separate interaction.',
        },
        leitfrage: {
          de: 'Wenn Banking künftig unsichtbar im Hintergrund über persönliche KI-Assistenten läuft – was bleibt von Ihrer Bank für die Kunden überhaupt noch sichtbar?',
          en: 'If banking runs invisibly in the background through personal AI assistants – what of your bank remains visible to customers at all?',
        },
      },
      {
        title: { de: 'Optionen verschwinden, Entscheidungen werden vorbereitet', en: 'Options disappear, decisions get prepared' },
        image: {
          src: './images/Kapitel 1_2.png',
          alt: {
            de: 'Status Quo: Kunde ratlos vor vielen Produktoptionen. 2030: KI-Assistent präsentiert eine klare Empfehlung mit Simulation und Begründung.',
            en: 'Status quo: a customer is at a loss in front of many product options. 2030: an AI assistant presents one clear recommendation with simulation and rationale.',
          },
        },
        statusQuo: {
          de: 'Kunden erhalten Produktangebote und **müssen selbst entscheiden** – wenig echte Entscheidungsunterstützung.',
          en: 'Customers receive product offers and **have to decide for themselves** – with little genuine decision support.',
        },
        in2030: {
          de: 'KI liefert **kontinuierliche Entscheidungsintelligenz**: Klare Empfehlungen statt Optionen, Simulationen & Szenarien, Erklärung & Begründung → Kunde entscheidet, aber auf Basis einer **„AI-prepared decision"**.',
          en: 'AI delivers **continuous decision intelligence**: clear recommendations instead of options, simulations & scenarios, explanation & rationale → the customer decides, but on the basis of an **“AI-prepared decision”**.',
        },
      },
      {
        title: { de: 'Von Reaktion zu proaktiver, teilautonomer Finanzsteuerung', en: 'From reaction to proactive, semi-autonomous financial management' },
        image: {
          src: './images/Kapitel 1_3.png',
          alt: {
            de: 'Status Quo: Kunde hängt in der Warteschleife der Bank und wartet auf Reaktion. 2030: Kunde läuft an einer zu verkaufenden Immobilie vorbei — der KI-Agent hat proaktiv bereits eine Finanzierung vorbereitet, der Kunde gibt nur noch frei.',
            en: 'Status quo: a customer is stuck in the bank’s hold loop waiting for a response. 2030: the customer walks past a property for sale — the AI agent has proactively prepared a financing proposal, and the customer only approves.',
          },
        },
        statusQuo: {
          de: 'Interaktion erfolgt überwiegend auf **Kundeninitiative** – Bank **reagiert** auf Anfragen oder Ereignisse.',
          en: 'Interaction happens mostly on **the customer’s initiative** – the bank **reacts** to requests or events.',
        },
        in2030: {
          de: 'Autonome KI-Agenten **erkennen Ereignisse frühzeitig** und handeln innerhalb definierter Leitplanken: Erkennen Muster / Risiken, initiieren Maßnahmen, agieren **teilautonom („trusted autonomy")** mit Freigabelogik.',
          en: 'Autonomous AI agents **detect events early** and act within defined guardrails: they recognise patterns / risks, initiate measures and operate **semi-autonomously (“trusted autonomy”)** with approval logic.',
        },
      },
    ],
    activity: {
      image: {
        src: './images/Kapitel 1_Demo.png',
        alt: {
          de: 'Person zu Hause mit persönlichem KI-Finanzbegleiter auf einem großen Tablet, dessen Bildschirm als leere 16:9-Fläche frontal zur Kamera zeigt.',
          en: 'A person at home with a personal AI financial companion on a large tablet whose screen faces the camera as an empty 16:9 surface.',
        },
      },
      title: { de: 'Demo Liquid: der Kunde entscheidet — auf AI-Basis', en: 'Liquid demo: the customer decides — on an AI basis' },
      text: {
        de: 'In der Demo entscheidet **der Kunde — auf AI-Basis**. Empfehlungen, Simulationen und Begründungen werden vorbereitet.',
        en: 'In the demo, **the customer decides — on an AI basis**. Recommendations, simulations and rationales are prepared in advance.',
      },
      buttonLabel: { de: 'Demo Liquid starten', en: 'Start the Liquid demo' },
      handoff: { kind: 'iframe', url: '', title: { de: 'Demo Liquid', en: 'Liquid demo' } },
    },
  },

  // ── 02 Markt & Vertrieb · 1. OG links (Advisory) ──────────────────────────
  {
    id: 'vertrieb',
    kapitel: '02',
    label: { de: 'Markt & Vertrieb', en: 'Sales & Distribution' },
    ort: { de: 'Erdgeschoss rechts (Beratung)', en: 'Ground floor right (advisory)' },
    keyObject: '„VERTRIEBS-COCKPIT"-Screen',
    zone: { centerX: 73, centerY: 85, width: 40, height: 22, labelX: 72, labelY: 82, hitWidth: 32, hitHeight: 18 },
    vision: {
      de: '2030 verkaufen wir keine Produkte mehr, sondern **orchestrieren Lösungen entlang der Ziele unserer Kunden**. KI kombiniert Finanz-, Service- und Ökosystemleistungen in Echtzeit. Unsere Berater werden zu **KI-augmentierten Sparringspartnern**, die bei komplexen Entscheidungen den Unterschied machen, während Standardvorgänge autonom laufen. Die Kundenbeziehung wird **permanent, kanalübergreifend und hyperpersonalisiert**.',
      en: 'By 2030 we no longer sell products but **orchestrate solutions around our customers’ goals**. AI combines financial, service and ecosystem capabilities in real time. Our advisors become **AI-augmented sparring partners** who make the difference on complex decisions, while standard transactions run autonomously. The customer relationship becomes **permanent, cross-channel and hyper-personalised**.',
    },
    businessCase: {
      de: 'Exemplarisch (illustrativ): KI-augmentierte Beratung steigert die Beraterproduktivität um **25–30 %** und den Ertrag je Kunde um **10–15 %**. Bei 400 Berater ergibt das rund **15–20 Mio € p.a.** — bei zugleich höherer Abschlussqualität durch Lösungsorchestrierung.',
      en: 'Illustrative example: AI-augmented advisory raises advisor productivity by **25–30 %** and revenue per customer by **10–15 %**. Across 400 advisors that is roughly **€15–20m p.a.** — with higher deal quality from solution orchestration.',
    },
    hypotheses: [
      {
        title: { de: 'Vom Produktvertrieb zum Lösungsorchestrator', en: 'From product sales to solution orchestrator' },
        image: {
          src: './images/Kapitel 2_1.png',
          alt: {
            de: 'Status Quo: produktzentriertes Verkaufsgespräch mit Broschüren. 2030: Berater und Kunde gestalten gemeinsam eine maßgeschneiderte Lösung mit holografischem KI-Display.',
            en: 'Status quo: a product-centric sales conversation with brochures. 2030: advisor and customer jointly design a tailored solution with a holographic AI display.',
          },
        },
        statusQuo: {
          de: 'Bankvertrieb ist **produkt- und kanalzentriert** organisiert. Kundenbetreuung folgt standardisierten Modellen. Daten und Kanäle sind **fragmentiert**.',
          en: 'Bank distribution is organised in a **product- and channel-centric** way. Client service follows standardised models. Data and channels are **fragmented**.',
        },
        in2030: {
          de: 'Die Bank agiert als **kontext-basierter Lösungsorchestrator**: KI kombiniert Finanz-, Service- und Ökosystemleistungen dynamisch zu individuellen Lösungen. **Der Kunde definiert Ziel und Ausgangssituation** – nicht mehr das Produktportfolio.',
          en: 'The bank acts as a **context-based solution orchestrator**: AI dynamically combines financial, service and ecosystem capabilities into individual solutions. **The customer defines both the goal and the starting point** – no longer the product portfolio.',
        },
        leitfrage: {
          de: 'Wenn Kunden künftig nur noch ihr Ziel nennen und die KI in Echtzeit die passende Lösung orchestriert – was passiert dann mit Ihrem produktzentrierten Vertrieb?',
          en: 'If customers merely state their goal and AI orchestrates the fitting solution in real time – what then happens to your product-centric distribution?',
        },
      },
      {
        title: { de: 'Vom Kundenberater zu KI-augmentierten Strategieberatern', en: 'From client advisor to AI-augmented strategic advisor' },
        image: {
          src: './images/Kapitel 2_2.png',
          alt: {
            de: 'Status Quo: standardisiertes Beratungsgespräch nach Skript, KI nur kleines Tool. 2030: Berater als KI-augmentierter Sparringspartner mit reichem KI-Kontext-Display.',
            en: 'Status quo: a scripted, standardised advisory conversation with AI as a minor tool. 2030: the advisor as an AI-augmented sparring partner with a rich AI context display.',
          },
        },
        statusQuo: {
          de: 'Beratung ist **stark standardisiert** und auf Produkte sowie Effizienz ausgerichtet. KI wird primär als **Produktivitätswerkzeug** eingesetzt.',
          en: 'Advisory is **highly standardised** and geared towards products and efficiency. AI is used primarily as a **productivity tool**.',
        },
        in2030: {
          de: 'Kundenberater agieren als **KI-augmentierte Sparringspartner** mit Branchen- und Kontextverständnis. Standardtransaktionen laufen autonom. **menschliche Beratung gewinnt bei komplexen Themen an Bedeutung**.',
          en: 'Client advisors act as **AI-augmented sparring partners** with industry and context understanding. Standard transactions run autonomously. **human advice gains importance on complex topics**.',
        },
      },
      {
        title: { de: 'Kundenschnittstelle wird permanent und hyperpersonalisiert', en: 'The customer interface becomes permanent and hyper-personalised' },
        image: {
          src: './images/Kapitel 2_3.png',
          alt: {
            de: 'Status Quo: punktueller, reaktiver Kundenkontakt an fragmentiertem CRM. 2030: Agentensystem begleitet kanalübergreifend in Echtzeit auf mehreren Geräten.',
            en: 'Status quo: sporadic, reactive customer contact on a fragmented CRM. 2030: an agent system accompanies across channels in real time on multiple devices.',
          },
        },
        statusQuo: {
          de: 'Kundeninteraktion erfolgt überwiegend **punktuell und reaktiv**. CRM- und Prozesslandschaften sind **fragmentiert** und wenig individualisiert.',
          en: 'Customer interaction is mostly **sporadic and reactive**. CRM and process landscapes are **fragmented** and barely individualised.',
        },
        in2030: {
          de: 'KI-basierte Agentensysteme begleiten Kunden **kontinuierlich und kanalübergreifend in Echtzeit**. **Hyperpersonalisierte Betreuung** und Produkte werden zum Standard.',
          en: 'AI-based agent systems accompany customers **continuously and across channels in real time**. **Hyper-personalised service** and products become the standard.',
        },
      },
    ],
    activity: {
      image: {
        src: './bank-floor-sales-2.png',
        alt: {
          de: 'Over-the-Shoulder-Blick am Workstation-Desk auf einen großen, frontal stehenden 16:9-Monitor. Im Hintergrund das „MARKT & VERTRIEB"-Schild.',
          en: 'An over-the-shoulder view at the workstation desk onto a large, front-facing 16:9 monitor. In the background the “SALES & DISTRIBUTION” sign.',
        },
      },
      title: { de: 'Vertriebscockpit: KI-augmentiert am Berater-Desktop', en: 'Sales cockpit: AI-augmented at the advisor’s desktop' },
      text: {
        de: 'Der Berater bereitet sich auf den nächsten Termin vor. Das Vertriebscockpit läuft direkt auf seinem Monitor — **KI-augmentiert, kontextbasiert, lösungsorientiert**. Per Klick auf Vollbild.',
        en: 'The advisor prepares for the next meeting. The sales cockpit runs directly on the monitor — **AI-augmented, context-based, solution-oriented**. One click to go full screen.',
      },
      buttonLabel: { de: 'Vertriebscockpit im Vollbild', en: 'Sales cockpit full screen' },
      handoff: {
        kind: 'iframe',
        url: VERTRIEBSCOCKPIT_URL,
        title: { de: 'KI-Arbeitsplatz — Vertriebscockpit (Live)', en: 'AI Workplace — Sales Cockpit (live)' },
      },
      // Exakt vermessenes Foto aus der Vorversion (bank-floor-sales-2.png,
      // 1672×941, Display-Aspect ~1,764): Screen-Rechteck per Edge-Detection.
      // Klick auf den Button → Vollbild.
      screenOverlay: {
        url: VERTRIEBSCOCKPIT_URL,
        title: { de: 'KI-Arbeitsplatz — Vertriebscockpit (Live)', en: 'AI Workplace — Sales Cockpit (live)' },
        leftPct: 34.63,
        topPct: 22.0,
        widthPct: 41.15,
        heightPct: 41.45,
      },
    },
  },

  // ── 03 Marktfolge · 1. OG rechts (Backoffice-Großraum) ────────────────────
  {
    id: 'marktfolge',
    kapitel: '03',
    label: { de: 'Marktfolge', en: 'Operations' },
    ort: { de: '1. OG rechts (Backoffice-Großraum)', en: '1st floor right (open-plan back office)' },
    keyObject: '„WORKFLOW AUTOMATION"-Screen',
    zone: { centerX: 73, centerY: 64, width: 40, height: 22, labelX: 72, labelY: 61, hitWidth: 32, hitHeight: 18 },
    vision: {
      de: 'Unsere Marktfolge entwickelt sich 2030 **vom internen Kostenblock zur wertschöpfenden Plattform**. Standardvorfälle laufen als **vollautonome Dunkelverarbeitung Ende-zu-Ende**, Menschen lösen nur noch komplexe Sonderfälle. Wir entscheiden bewusst, **was intern bleibt und was ein orchestriertes Ökosystem übernimmt — und bieten unsere besten Services als skalierbares Banking-as-a-Service für Dritte an**.',
      en: 'By 2030 our operations evolve **from an internal cost block into a value-creating platform**. Standard cases run as **fully autonomous straight-through processing end-to-end**, while people only resolve complex exceptions. We deliberately decide **what stays in-house and what an orchestrated ecosystem takes over — and offer our best services as scalable banking-as-a-service to third parties**.',
    },
    businessCase: {
      de: 'Exemplarisch (illustrativ): Dunkelverarbeitung senkt die Stückkosten der Marktfolge um **40–60 %**. Bei rund 2 Mio Vorgängen p.a. sind das etwa **10–14 Mio € Einsparung p.a.**. Banking-as-a-Service für Dritte eröffnet zusätzlich neue Erlösquellen.',
      en: 'Illustrative example: Straight-through processing cuts operations unit costs by **40–60 %**. At around 2 million cases p.a. that is roughly **€10–14m savings p.a.**. Banking-as-a-service for third parties opens additional revenue streams.',
    },
    hypotheses: [
      {
        title: { de: 'Marktfolge wird zur autonomen Dunkelverarbeitung', en: 'Operations become autonomous straight-through processing' },
        image: {
          src: './images/Kapitel 3_1.png',
          alt: {
            de: 'Status Quo: Back-Office bearbeitet manuell Papierakten an Legacy-Bildschirmen. 2030: vollautonome Dunkelverarbeitung, Mensch nur bei einem komplexen Sonderfall.',
            en: 'Status quo: the back office manually processes paper files at legacy screens. 2030: fully autonomous straight-through processing, with a human only for a complex exception.',
          },
        },
        statusQuo: {
          de: 'Marktfolge ist geprägt von **fragmentierten Prozessen, Legacy-Systemen** und hohen **manuellen Bearbeitungsanteilen**.',
          en: 'Operations are characterised by **fragmented processes, legacy systems** and high **manual processing shares**.',
        },
        in2030: {
          de: 'Standardisierte Geschäftsvorfälle laufen **vollständig autonom**. KI steuert Kredit-, KYC- und Abwicklungsprozesse **Ende-zu-Ende**. Menschen bearbeiten nur (komplexe) Sonderfälle.',
          en: 'Standardised transactions run **fully autonomously**. AI manages credit, KYC and settlement processes **end-to-end**. People only handle (complex) exceptions.',
        },
      },
      {
        title: { de: 'Interne Wertschöpfungskette bricht auf', en: 'The internal value chain breaks open' },
        image: {
          src: './images/Kapitel 3_2.png',
          alt: {
            de: 'Status Quo: geschlossenes Back-Office, alles intern. 2030: modulare externe Utility-Plattformen übernehmen Standardbetrieb, die Bank orchestriert ein Ökosystem.',
            en: 'Status quo: a closed back office, everything in-house. 2030: modular external utility platforms take over standard operations while the bank orchestrates an ecosystem.',
          },
        },
        statusQuo: {
          de: 'Betriebs- und Marktfolgeleistungen werden überwiegend **intern erbracht**. Kooperationen und Auslagerungen **bleiben begrenzt**.',
          en: 'Operating and back-office services are largely **provided in-house**. Cooperations and outsourcing **remain limited**.',
        },
        in2030: {
          de: 'Externe Plattformen und **KI-gestützte Utility-Modelle** übernehmen große Teile standardisierter Betriebsleistungen. Banken **orchestrieren modulare Service-Ökosysteme**.',
          en: 'External platforms and **AI-supported utility models** take over large parts of standardised operations. Banks **orchestrate modular service ecosystems**.',
        },
      },
      {
        title: { de: 'Marktfolge wird zur skalierbaren Serviceplattform', en: 'Operations become a scalable service platform' },
        image: {
          src: './images/Kapitel 3_3.png',
          alt: {
            de: 'Status Quo: Operations als interne Kostenstelle. 2030: skalierbare Banking-as-a-Service-Plattform, die standardisierte Services für Dritte anbietet.',
            en: 'Status quo: operations as an internal cost centre. 2030: a scalable banking-as-a-service platform offering standardised services to third parties.',
          },
        },
        statusQuo: {
          de: 'Betriebs- und Abwicklungseinheiten gelten primär als **interne Kosten- und Kontrollfunktion**.',
          en: 'Operating and settlement units are seen primarily as an **internal cost and control function**.',
        },
        in2030: {
          de: 'Große Banken entwickeln Marktfolge- und Serviceplattformen zu **eigenständigen Geschäftsmodellen** und bieten **standardisierte Banking-Services für Dritte** an.',
          en: 'Large banks develop operations and service platforms into **standalone business models** and offer **standardised banking services to third parties**.',
        },
      },
      {
        // NEU aus Workshop-Feedback (gelbes Kommentarfeld): Regulatorik/Compliance
        // wird aufgebrochen, weil sie im Lifecycle berücksichtigt wird.
        title: { de: 'Regulatorik & Compliance wandern in den Lifecycle', en: 'Regulation & compliance move into the lifecycle' },
        image: {
          src: './images/Kapitel 3_4.png',
          alt: {
            de: 'Status Quo: nachgelagerte Compliance-Prüfung als separater Kontrollschritt nach dem Prozess. 2030: Regulatorik ist als „compliant by design" direkt in den automatisierten Prozess-Lifecycle eingebaut.',
            en: 'Status quo: downstream compliance check as a separate control step after the process. 2030: regulation is built directly into the automated process lifecycle as “compliant by design”.',
          },
        },
        statusQuo: {
          de: 'Regulatorik und Compliance sind der Marktfolge **nachgelagert** – als **separate Prüf- und Kontrollschritte**, die Durchlaufzeiten verlängern.',
          en: 'Regulation and compliance sit **downstream** of operations – as **separate check and control steps** that extend throughput times.',
        },
        in2030: {
          de: 'Regulatorische und Compliance-Anforderungen sind **direkt in den Prozess-Lifecycle eingebaut** („compliant by design"). Die klassische, aufgesetzte Compliance-Schicht **bricht auf** – Prüfungen laufen automatisch im Prozess mit.',
          en: 'Regulatory and compliance requirements are **built directly into the process lifecycle** (“compliant by design”). The classic, bolted-on compliance layer **breaks open** – checks run automatically within the process.',
        },
      },
    ],
    activity: {
      image: {
        src: './images/Kapitel 3_Demo.png',
        alt: {
          de: 'Strategie-Workshop in einem modernen Bank-Besprechungsraum mit Entscheidungskarten und einem Board mit drei Rollen-Optionen.',
          en: 'A strategy workshop in a modern bank meeting room with decision cards and a board showing three role options.',
        },
      },
      title: { de: 'Marktfolge Strategy Lab: drei Entscheidungen in 60 Minuten', en: 'Operations Strategy Lab: three decisions in 60 minutes' },
      text: {
        de: 'Marktfolge Strategy Lab: **Drei Entscheidungen in 60 Minuten**. Welche Zukunftsrolle? **Was bleibt intern, was geht ins Ökosystem?** Wo liegt Plattformpotenzial?',
        en: 'Operations Strategy Lab: **three decisions in 60 minutes**. Which future role? **What stays in-house, what moves into the ecosystem?** Where is the platform potential?',
      },
      buttonLabel: { de: 'Strategy Lab starten', en: 'Start the Strategy Lab' },
      handoff: { kind: 'strategy-lab' },
    },
  },

  // ── 04 Corporate Services · 2. OG links (Corporate / HR) ──────────────────
  {
    id: 'corporate',
    kapitel: '04',
    label: {
      de: 'Organisationsentwicklung (HR & Corporate Services)',
      en: 'Organisational Development (HR & Corporate Services)',
    },
    ort: { de: '1. OG links (Corporate / HR)', en: '1st floor left (Corporate / HR)' },
    keyObject: '„ORGANISATION"-Screen',
    zone: { centerX: 27, centerY: 64, width: 38, height: 22, labelX: 30, labelY: 61, hitWidth: 32, hitHeight: 18 },
    vision: {
      de: 'Corporate Services sind 2030 der **Enabler des Wandels**. Lernen ist kein Event mehr, sondern **kontinuierlicher, KI-gestützter Skill-Aufbau** für neue Profile wie den AI-Translator. Unsere Organisation wird **nicht mehr von starren Strukturen, sondern von Skills, Rollen und Teams in Echtzeit gesteuert** — und datenbasierte, vorausschauende Workforce-Steuerung wird zum Wettbewerbsvorteil.',
      en: 'In 2030, Corporate Services are the **enabler of change**. Learning is no longer an event but **continuous, AI-supported skill building** for new profiles such as the AI translator. Our organisation is **no longer steered by rigid structures but by skills, roles and teams in real time** — and data-driven, forward-looking workforce management becomes a competitive advantage.',
    },
    businessCase: {
      de: 'Exemplarisch (illustrativ): Reskilling statt Neueinstellung spart je 100 umgeschulten Stellen rund **3–5 Mio € p.a.** (Recruiting, Fluktuation, Anlernzeit). Immersives, KI-personalisiertes Lernen verkürzt die Time-to-Competency um **30–50 %**.',
      en: 'Illustrative example: Reskilling instead of hiring saves roughly **€3–5m p.a. per 100 reskilled roles** (recruiting, attrition, ramp-up). Immersive, AI-personalised learning shortens time-to-competency by **30–50 %**.',
    },
    hypotheses: [
      {
        title: { de: 'Vom Training zum kontinuierlichen Skill-Aufbau', en: 'From training to continuous skill building' },
        image: {
          src: './images/Kapitel 4_1.png',
          alt: {
            de: 'Status Quo: isoliertes Classroom-Training. 2030: kontinuierlicher, personalisierter Skill-Aufbau mit adaptivem KI-Lernbegleiter.',
            en: 'Status quo: isolated classroom training. 2030: continuous, personalised skill building with an adaptive AI learning companion.',
          },
        },
        statusQuo: {
          de: 'Weiterbildungsinitiativen sind oft **nicht entlang zukünftiger Kompetenzbedarfe** (z. B. Daten- oder KI-Kompetenzen) ausgerichtet, sondern finden **isoliert und reaktiv** statt.',
          en: 'Upskilling initiatives are often **not aligned with future skill needs** (e.g. data or AI skills) but happen **in isolation and reactively**.',
        },
        in2030: {
          de: 'HR als **„Enabler" des Wandels**: Fokus liegt auf **Upskilling / Reskilling** für neue Jobprofile („AI-Translator") und der Etablierung einer agilen Lernkultur.',
          en: 'HR as the **“enabler” of change**: the focus is on **upskilling / reskilling** for new job profiles (“AI translator”) and on establishing an agile learning culture.',
        },
      },
      {
        title: { de: 'Organisation wird durch Skills gesteuert, nicht durch Strukturen', en: 'The organisation is steered by skills, not by structures' },
        image: {
          src: './images/Kapitel 4_2.png',
          alt: {
            de: 'Status Quo: starres funktionales Organigramm mit Silos. 2030: skills-getriebene, flexible Organisation, KI orchestriert Rollen und Teams als fluides Netzwerk.',
            en: 'Status quo: a rigid functional org chart with silos. 2030: a skills-driven, flexible organisation in which AI orchestrates roles and teams as a fluid network.',
          },
        },
        statusQuo: {
          de: 'Organisationen sind **funktional und silo-orientiert** aufgebaut. Rollen und Zusammenarbeit folgen **stabilen Hierarchien und festen Stellenprofilen**.',
          en: 'Organisations are built **functionally and along silos**. Roles and collaboration follow **stable hierarchies and fixed job profiles**.',
        },
        in2030: {
          de: 'Organisation wird **flexibel gesteuert** – AI orchestriert **Skills, Rollen und Teams in Echtzeit**.',
          en: 'The organisation is **steered flexibly** – AI orchestrates **skills, roles and teams in real time**.',
        },
      },
      {
        title: { de: 'Workforce-Steuerung wird zum Wettbewerbsvorteil', en: 'Workforce management becomes a competitive advantage' },
        image: {
          src: './images/Kapitel 4_3.png',
          alt: {
            de: 'Status Quo: administrative, reaktive HR-Verwaltung. 2030: datenbasierte, vorausschauende Workforce-Steuerung auf einem Predictive-Analytics-Dashboard.',
            en: 'Status quo: administrative, reactive HR administration. 2030: data-driven, forward-looking workforce management on a predictive analytics dashboard.',
          },
        },
        // Hinweis: Status-Quo im Deck fehlerhaft (Copy-Paste-Bug). Platzhalter
        // gemäß Vorgabe — bei Vorliegen des Originaltexts ersetzen.
        statusQuo: {
          de: 'Workforce-Planung erfolgt überwiegend **administrativ und reaktiv**. Die Steuerung von Skills und Transformation ist **wenig datenbasiert** und kaum vorausschauend.',
          en: 'Workforce planning is mostly **administrative and reactive**. Steering of skills and transformation is **barely data-driven** and hardly forward-looking.',
        },
        in2030: {
          de: 'Corporate Services steuern Workforce und Transformation **datenbasiert und vorausschauend**.',
          en: 'Corporate Services steer workforce and transformation **in a data-driven and forward-looking way**.',
        },
      },
      {
        // NEU aus Workshop-Feedback: Wie passiert Weiterbildung? (VR-Training,
        // KI leitet aus der Skill-Veränderung ein Trainingsprogramm ab.)
        title: { de: 'Lernen wird immersiv und KI-personalisiert', en: 'Learning becomes immersive and AI-personalised' },
        image: {
          src: './images/Kapitel 4_4.png',
          alt: {
            de: 'Status Quo: klassisches Classroom-/E-Learning ohne Bezug zur individuellen Skill-Lücke. 2030: Mitarbeitende trainieren mit VR-Brille, während die KI aus der Skill-Veränderung automatisch ein passgenaues Trainingsprogramm ableitet.',
            en: 'Status quo: classic classroom/e-learning with no link to the individual skill gap. 2030: employees train with VR glasses while the AI automatically derives a tailored training programme from their skill changes.',
          },
        },
        statusQuo: {
          de: 'Weiterbildung findet in **klassischen Formaten** (Präsenz, E-Learning) statt und ist **selten auf die individuelle Skill-Lücke** zugeschnitten.',
          en: 'Upskilling happens in **classic formats** (classroom, e-learning) and is **rarely tailored to the individual skill gap**.',
        },
        in2030: {
          de: 'Training wird **immersiv** durchgeführt (z. B. per VR/AR). **KI leitet aus der individuellen Skill-Veränderung automatisch ein passgenaues Trainingsprogramm ab** – kontinuierlich und im Arbeitsfluss.',
          en: 'Training becomes **immersive** (e.g. via VR/AR). **AI automatically derives a tailored training programme from each person’s skill changes** – continuously and in the flow of work.',
        },
      },
      {
        // NEU aus Workshop-Feedback: Demografischer Wandel — auch 50+ müssen
        // grundlegend neue Skills lernen.
        title: { de: 'Demografischer Wandel erzwingt lebenslanges Reskilling', en: 'Demographic change forces lifelong reskilling' },
        image: {
          src: './images/Kapitel 4_5.png',
          alt: {
            de: 'Status Quo: Qualifizierung konzentriert sich auf junge Mitarbeitende. 2030: gemischte, auch ältere Belegschaft lernt selbstverständlich grundlegend neue Fähigkeiten mit KI-Lernbegleitung.',
            en: 'Status quo: qualification focuses on younger employees. 2030: a mixed, also older workforce naturally learns fundamentally new skills with AI learning support.',
          },
        },
        statusQuo: {
          de: 'Qualifizierung ist überwiegend auf **frühe Karrierephasen** ausgerichtet. Ältere Belegschaften werden bei grundlegend neuen Kompetenzen **selten systematisch mitgenommen**.',
          en: 'Qualification is mostly geared towards **early career stages**. Older parts of the workforce are **rarely systematically included** in fundamentally new competencies.',
        },
        in2030: {
          de: 'Die alternde Belegschaft lernt **kontinuierlich neue Skills** – auch mit 50+ müssen dieselben Menschen **grundlegend neue Fähigkeiten** aufbauen. **Lebenslanges Reskilling** wird zum Normalfall und zur strategischen Notwendigkeit.',
          en: 'The ageing workforce **continuously learns new skills** – even at 50+, the same people must build **fundamentally new capabilities**. **Lifelong reskilling** becomes the norm and a strategic necessity.',
        },
      },
    ],
    activity: {
      image: {
        src: './images/Kapitel 4_Demo.png',
        alt: {
          de: 'Co-Creation-Workshop an Flipchart und Whiteboard voller Haftnotizen und Gestaltungsdimensionen.',
          en: 'A co-creation workshop at a flipchart and whiteboard full of sticky notes and design dimensions.',
        },
      },
      title: { de: 'Co-Creation: Organisation unter Transformationsdruck', en: 'Co-creation: organisation under transformation pressure' },
      text: {
        de: 'Co-Creation: **Organisation unter Transformationsdruck**. Zielbild für 2030 entlang **vier Dimensionen** — Skill-Aufbau, Organisationslogik, Workforce-Steuerung, Rolle Corporate Services.',
        en: 'Co-creation: **organisation under transformation pressure**. A 2030 target picture along **four dimensions** — skill building, organisational logic, workforce management, role of Corporate Services.',
      },
      buttonLabel: { de: 'Zur Co-Creation', en: 'Go to co-creation' },
      handoff: { kind: 'cocreation', variant: 'organisation' },
    },
  },

  // ── 05 Technologie / IT · 2. OG rechts (Serverraum) ───────────────────────
  {
    id: 'it',
    kapitel: '05',
    label: { de: 'Technologie / IT', en: 'Technology / IT' },
    ort: { de: '2. OG rechts (Technology)', en: '2nd floor right (technology)' },
    keyObject: 'Monitoring-Arbeitsplatz am Server-Rack',
    zone: { centerX: 73, centerY: 42, width: 40, height: 22, labelX: 72, labelY: 39, hitWidth: 32, hitHeight: 18 },
    vision: {
      de: '2030 **entwickelt, testet und deployt sich unsere Software weitgehend selbst**. KI entscheidet autonom innerhalb der von uns gesetzten **Governance und Leitplanken**, während die IT zur **modularen, API-basierten Plattform** wird. Fachbereiche steuern diese Systeme zunehmend direkt — die **Gatekeeper-Rolle der klassischen IT verschwindet**, und unser Vorsprung entsteht aus der Geschwindigkeit, mit der wir Anforderungen in Lösungen verwandeln.',
      en: 'By 2030 **our software largely develops, tests and deploys itself**. AI decides autonomously within the **governance and guardrails** we set, while IT becomes a **modular, API-based platform**. Business units increasingly steer these systems directly — the **gatekeeper role of classic IT disappears**, and our edge comes from the speed at which we turn requirements into solutions.',
    },
    businessCase: {
      de: 'Exemplarisch (illustrativ): Selbstoptimierende AI-Delivery senkt Entwicklungs- und Betriebskosten um **20–35 %**. Bei einem IT-Budget von 80 Mio € entspricht das rund **16–28 Mio € p.a.** — zusätzlich verkürzt sich die Time-to-Market drastisch.',
      en: 'Illustrative example: Self-optimising AI delivery cuts development and run costs by **20–35 %**. On an €80m IT budget that is roughly **€16–28m p.a.** — plus a drastic reduction in time-to-market.',
    },
    hypotheses: [
      {
        title: { de: 'Selbstoptimierende AI-Delivery ersetzt Softwareentwicklung As-Is', en: 'Self-optimising AI delivery replaces software development as-is' },
        image: {
          src: './images/Kapitel 5_1.png',
          alt: {
            de: 'Status Quo: Entwickler schreiben und testen Software manuell. 2030: selbstoptimierende AI-Delivery, Software baut/testet/deployt sich selbst, Mensch überwacht nur.',
            en: 'Status quo: developers write and test software manually. 2030: self-optimising AI delivery — software builds/tests/deploys itself while a human only supervises.',
          },
        },
        statusQuo: {
          de: 'Software wird in **linearen, deterministischen Entwicklungszyklen** **durch Menschen** erstellt, getestet und ausgerollt.',
          en: 'Software is created, tested and rolled out **by people** in **linear, deterministic development cycles**.',
        },
        in2030: {
          de: 'Software **entwickelt, testet und deployt sich kontinuierlich selbst** durch **AI-getriebene Systeme**. Die verbleibenden Teams **coden nicht mehr, sondern überwachen und steuern die KI** – ein grundlegender Rollenwandel.',
          en: 'Software **continuously develops, tests and deploys itself** through **AI-driven systems**. The remaining teams **no longer code but monitor and govern the AI** – a fundamental shift in roles.',
        },
      },
      {
        title: { de: 'Entscheidungen verlagern sich zur AI & IT wird zur orchestrierten Plattform', en: 'Decisions shift to AI & IT becomes an orchestrated platform' },
        image: {
          src: './images/Kapitel 5_2.png',
          alt: {
            de: 'Status Quo: regelbasierte IT mit manuellen Freigaben und Monolith. 2030: AI entscheidet autonom in Leitplanken, IT als modulare, API-basierte Plattform.',
            en: 'Status quo: rule-based IT with manual approvals and a monolith. 2030: AI decides autonomously within guardrails, IT as a modular, API-based platform.',
          },
        },
        statusQuo: {
          de: 'IT steuert Systeme über **Regeln, Prozesse und manuelle Freigaben** mit klarer Kontrolle über Ergebnisse. Banken betreiben gewachsene, **monolithische IT-Landschaften** mit hoher Komplexität und geringer Anpassungsfähigkeit.',
          en: 'IT steers systems via **rules, processes and manual approvals** with clear control over outcomes. Banks run grown, **monolithic IT landscapes** with high complexity and low adaptability.',
        },
        in2030: {
          de: 'AI-Systeme **treffen eigenständig Entscheidungen**, während die Bank primär **Governance, Leitplanken und Kontrolle** definiert. Die IT wird zur **datengetriebenen Plattform, die sich in einem kontinuierlichen Loop selbst verbessert** – der entscheidende Vorteil ist die **Geschwindigkeit**, mit der aus Daten in Echtzeit neue Lösungen werden.',
          en: 'AI systems **make decisions independently**, while the bank primarily defines **governance, guardrails and control**. IT becomes a **data-driven platform that continuously improves itself in a feedback loop** – the decisive advantage is the **speed** at which data turns into new solutions in real time.',
        },
      },
      {
        title: { de: 'Fachbereiche steuern direkt, IT verliert die Gatekeeper-Rolle', en: 'Business units steer directly, IT loses the gatekeeper role' },
        image: {
          src: './images/Kapitel 5_3.png',
          alt: {
            de: 'Status Quo: IT als separate Gatekeeper-Funktion, Fachbereich übergibt Anforderungen. 2030: Fachbereiche steuern AI-Systeme direkt selbst, Gatekeeping entfällt.',
            en: 'Status quo: IT as a separate gatekeeper function, with the business handing over requirements. 2030: business units steer AI systems directly themselves, and gatekeeping disappears.',
          },
        },
        statusQuo: {
          de: 'IT ist eine **eigenständige Funktion**, die Anforderungen aus dem Business umsetzt und Systeme betreibt. Wettbewerb entsteht durch **proprietäre Systeme und funktionale Differenzierung**.',
          en: 'IT is a **standalone function** that implements business requirements and runs systems. Competition arises from **proprietary systems and functional differentiation**.',
        },
        in2030: {
          de: 'Fachbereich und IT verschmelzen zu **integrierten, vertikalen Delivery-Teams** – der Fachbereich ist **Teil des Teams**, nicht mehr Auftraggeber. IT als separater Gatekeeper **verschwindet**. Der Vorsprung entsteht aus der **Geschwindigkeit**, mit der diese Teams Anforderungen in Lösungen verwandeln.',
          en: 'Business and IT merge into **integrated, vertical delivery teams** – the business is **part of the team**, no longer a client handing over requirements. IT as a separate gatekeeper **disappears**. The edge comes from the **speed** at which these teams turn requirements into solutions.',
        },
      },
    ],
    activity: {
      image: {
        src: './images/Kapitel 5_Demo.png',
        alt: {
          de: 'Over-the-Shoulder-Blick eines IT-Engineers auf einen großen Desktop-Monitor, dessen Bildschirm als leere 16:9-Fläche frontal zur Kamera zeigt.',
          en: 'An over-the-shoulder view of an IT engineer onto a large desktop monitor whose screen faces the camera as an empty 16:9 surface.',
        },
      },
      title: { de: 'Demo SDLC AI-Platform: Software entwickelt sich selbst', en: 'SDLC AI platform demo: software develops itself' },
      text: {
        de: 'In der Demo **entwickelt, testet und deployt sich Software selbst**. Der Mensch definiert **Leitplanken und Governance**.',
        en: 'In the demo, **software develops, tests and deploys itself**. The human defines **guardrails and governance**.',
      },
      buttonLabel: { de: 'SDLC AI-Platform starten', en: 'Start the SDLC AI platform' },
      handoff: { kind: 'iframe', url: '', title: { de: 'SDLC AI-Platform', en: 'SDLC AI platform' } },
    },
  },

  // ── 06 Compliance & Risk · 3. OG links (Boardroom) ────────────────────────
  {
    id: 'compliance',
    kapitel: '06',
    label: { de: 'Compliance & Risk', en: 'Compliance & Risk' },
    ort: { de: '2. OG links (Compliance & Risk)', en: '2nd floor left (compliance & risk)' },
    keyObject: '„GOVERNANCE COCKPIT"-Screen',
    zone: { centerX: 27, centerY: 42, width: 38, height: 22, labelX: 30, labelY: 39, hitWidth: 32, hitHeight: 18 },
    vision: {
      de: 'Compliance ist 2030 **kein nachgelagerter Bremsklotz mehr, sondern in jede Entscheidung eingebaut**. Regulatorik ist direkt in Systeme und Entscheidungslogiken integriert. Aus dem Three-Lines-of-Defense-Modell wird **kontinuierliche, technisch integrierte Echtzeit-Kontrolle mit dem CAIO im Zentrum**. Cyber- und Operational Risk werden **untrennbarer Teil des Betriebsmodells — Sicherheit heißt permanente Resilienzsteuerung statt nachträglicher Schutzwall**.',
      en: 'By 2030 compliance is **no longer a downstream brake but built into every decision**. Regulation is integrated directly into systems and decision logic. The three-lines-of-defence model becomes **continuous, technically integrated real-time control with the CAIO at the centre**. Cyber and operational risk become **an inseparable part of the operating model — security means permanent resilience management rather than a retrofitted protective wall**.',
    },
    businessCase: {
      de: 'Exemplarisch (illustrativ): Eingebettete Echtzeit-Compliance senkt die Kontrollkosten um **20–30 %** und vermeidet regulatorische Strafen und Verluste in **zweistelliger Millionenhöhe**. Robuste Cyber-Resilienz reduziert die erwartete Schadenshöhe erheblich.',
      en: 'Illustrative example: Embedded real-time compliance cuts control costs by **20–30 %** and avoids regulatory penalties and losses in the **tens of millions of euros**. Robust cyber resilience materially reduces expected loss.',
    },
    hypotheses: [
      {
        title: { de: 'Von ex-post-Kontrolle zu kontinuierlicher Echtzeitsteuerung', en: 'From ex-post control to continuous real-time steering' },
        image: {
          src: './images/Kapitel 6_1.png',
          alt: {
            de: 'Status Quo: ex-post-Compliance, nachträgliche Prüfung von Dokumenten und Stichproben. 2030: Echtzeit-Compliance direkt in den Systemen, Regeln im Live-Entscheidungs-Dashboard.',
            en: 'Status quo: ex-post compliance with after-the-fact review of documents and samples. 2030: real-time compliance directly in the systems, with rules in a live decision dashboard.',
          },
        },
        statusQuo: {
          de: 'Risiko- und Compliance-Funktionen greifen überwiegend **nachgelagert** ein und erzeugen zusätzliche Prozessschritte, die die **Geschwindigkeit von Innovation reduzieren** – bei **hoher Kostenintensität** und niedriger regulatorischer Geschwindigkeit.',
          en: 'Risk and compliance functions mostly intervene **downstream** and create additional process steps that **reduce the speed of innovation** – at **high cost intensity** and low regulatory speed.',
        },
        in2030: {
          de: 'Regulatorische Anforderungen sind **direkt in Systeme und Entscheidungslogiken eingebettet** – Kontrolle wird dadurch **schneller und effizienter**.',
          en: 'Regulatory requirements are **embedded directly into systems and decision logic** – making control **faster and more efficient**.',
        },
      },
      {
        title: { de: 'Three-Lines-of-Defense-Modell verändert sich grundlegend', en: 'The three-lines-of-defence model changes fundamentally' },
        image: {
          src: './images/Kapitel 6_2.png',
          alt: {
            de: 'Status Quo: drei getrennte Verteidigungslinien mit Stichproben. 2030: integrierte, kontinuierliche Kontrolle in einem KI-überwachten Governance-Cockpit mit CAIO im Zentrum.',
            en: 'Status quo: three separate lines of defence with sample checks. 2030: integrated, continuous control in an AI-monitored governance cockpit with the CAIO at the centre.',
          },
        },
        statusQuo: {
          de: 'Risikomanagement, Compliance und operative Einheiten sind organisatorisch **klar getrennt**. Kontrolle erfolgt überwiegend über definierte Verantwortlichkeiten, **Stichproben und nachgelagerte Reviews**.',
          en: 'Risk management, compliance and operating units are organisationally **clearly separated**. Control happens mostly via defined responsibilities, **sample checks and downstream reviews**.',
        },
        in2030: {
          de: 'AI-gestützte Entscheidungen und autonome Prozesse erzwingen **neue Governance-Modelle**: Kontrolle wird zunehmend **technisch integriert und kontinuierlich überwacht**. **CAIO im Mittelpunkt**. **AI-Kompetenz wird zur Schlüsselfähigkeit** in allen Kontrollfunktionen.',
          en: 'AI-supported decisions and autonomous processes force **new governance models**: control becomes increasingly **technically integrated and continuously monitored**. **The CAIO takes centre stage**. **AI skills become a key capability** across all control functions.',
        },
      },
      {
        title: { de: 'Cyber- und Operational Risk verschmelzen mit dem Betriebsmodell', en: 'Cyber and operational risk merge with the operating model' },
        image: {
          src: './images/Kapitel 6_3.png',
          alt: {
            de: 'Status Quo: Cyber- und Operational Risk als separate, perimeterorientierte Schutzfunktion. 2030: in das Betriebsmodell integriert, kontinuierliche Resilienzsteuerung im Live-Dashboard.',
            en: 'Status quo: cyber and operational risk as a separate, perimeter-oriented protective function. 2030: integrated into the operating model with continuous resilience management in a live dashboard.',
          },
        },
        statusQuo: {
          de: 'Cybersecurity und Operational Risk werden weitgehend als **unterstützende Kontroll- und Schutzfunktion** organisiert. Sicherheitsmechanismen sind häufig **nachgelagert und perimeterorientiert** – während sich die **Bedrohungslage stetig verschärft** (Cyberangriffe nehmen zu).',
          en: 'Cybersecurity and operational risk are largely organised as a **supporting control and protection function**. Security mechanisms are often **downstream and perimeter-oriented** – while the **threat landscape keeps worsening** (cyberattacks are increasing).',
        },
        in2030: {
          de: 'Mit AI-first-Architekturen, Echtzeitintegration und offenen Plattformmodellen werden Cyber- und Operational Risks **integraler Bestandteil des Betriebsmodells** – Cybersecurity wird **überlebenswichtig** und verlangt **robuste Cyber- und Operational-Risk-Fähigkeiten**. Sicherheit verschiebt sich von Schutzmechanismen zu **kontinuierlicher Resilienzsteuerung**.',
          en: 'With AI-first architectures, real-time integration and open platform models, cyber and operational risks become an **integral part of the operating model** – cybersecurity becomes **survival-critical** and demands **robust cyber and operational risk capabilities**. Security shifts from protective mechanisms to **continuous resilience management**.',
        },
      },
      {
        // NEU aus Workshop-Feedback: Compliance/Innenrevision muss sich neu
        // aufstellen. Explainability der KI-Outputs wird zum Kern.
        title: { de: 'Compliance & Innenrevision stellen sich neu auf', en: 'Compliance & internal audit reposition themselves' },
        image: {
          src: './images/Kapitel 6_4.png',
          alt: {
            de: 'Status Quo: Innenrevision prüft nachgelagert und stichprobenartig mit Aktenordnern. 2030: Compliance/Revision als Enabler mit einem Explainability-Cockpit, das transparent macht, wie und warum die KI einen Output erzeugt hat.',
            en: 'Status quo: internal audit reviews downstream and by sampling with paper files. 2030: compliance/audit as an enabler with an explainability cockpit that shows transparently how and why the AI produced an output.',
          },
        },
        statusQuo: {
          de: 'Compliance und Innenrevision prüfen überwiegend **nachgelagert** und stichprobenartig. Für KI-getriebene Entscheidungen fehlen **Methoden, Skills und Prüftiefe**.',
          en: 'Compliance and internal audit mostly review **downstream** and by sampling. For AI-driven decisions they lack **methods, skills and audit depth**.',
        },
        in2030: {
          de: 'Compliance und Innenrevision **stellen sich grundlegend neu auf**, damit die KI-Transformation gelingt: Sie werden zum **Enabler** und sichern die **transparente Nachvollziehbarkeit, wie und warum die KI einen Output erzeugt hat** (Explainability).',
          en: 'Compliance and internal audit **fundamentally reposition themselves** so that the AI transformation succeeds: they become an **enabler** and ensure **transparent traceability of how and why the AI produced an output** (explainability).',
        },
      },
    ],
    activity: {
      image: {
        src: './images/Kapitel 6_Demo.png',
        alt: {
          de: 'Angespannter Entscheidungsmoment: Kunde am Telefon nach einer autonomen KI-Kreditentscheidung, im Hintergrund drei horizontale Status-Balken.',
          en: 'A tense decision moment: a customer on the phone after an autonomous AI credit decision, with three horizontal status bars in the background.',
        },
      },
      title: { de: 'Kredit-Dilemma: 50.000 € — die KI lehnt autonom ab', en: 'Credit dilemma: €50,000 — the AI rejects autonomously' },
      text: {
        de: 'Dilemma: Ein Geschäftskunde beantragt einen Kredit über **50.000 €**, **die KI lehnt autonom ab**. Die Autonomiegrenzen sind **gestuft** (5.000 · 50.000 · 500.000 · 5 Mio · 50 Mio €) – je nach **Risikoklasse des Kunden** und den KI-Hintergrundinformationen. Entscheiden Sie entlang des Telefongesprächs — drei Balken (Regulatorik, Geschwindigkeit, Zufriedenheit) reagieren. **Wer hat freigegeben? Wer haftet?** Wie wird kontrolliert?',
        en: 'Dilemma: a business customer applies for a **€50,000** loan, **the AI rejects it autonomously**. The autonomy thresholds are **tiered** (€5,000 · 50,000 · 500,000 · 5m · 50m) – depending on the **customer’s risk class** and the AI’s background information. Decide along the phone call — three bars (regulation, speed, satisfaction) react. **Who approved it? Who is liable?** How is it controlled?',
      },
      buttonLabel: { de: 'Szenario starten', en: 'Start the scenario' },
      handoff: { kind: 'kredit-dilemma' },
    },
  },

  // ── 07 Transformation · Glas-Aufzug (Spine) ───────────────────────────────
  {
    id: 'transformation',
    kapitel: '09',
    label: { de: 'Transformation mit Deloitte', en: 'Transformation with Deloitte' },
    ort: { de: 'Glas-Aufzug (vertikal, alle Etagen)', en: 'Glass elevator (vertical, all floors)' },
    keyObject: 'die Glas-Spine durch alle Etagen',
    zone: { centerX: 50, centerY: 50, width: 16, height: 92, fit: 'contain', labelX: 50, labelY: 50, hitWidth: 13, hitHeight: 86 },
    vision: {
      de: 'Wir wandeln uns bis 2030 **zur AI-nativen Plattform-Bank** — aufgebaut aus Daten, Ökosystem und **integrierter Governance statt nachgelagerter Kontrolle**. Unser Operating Model folgt der Entscheidungslogik: **Journey-Teams mit End-to-End-Ownership, Human-in-the-loop und AI-Governance**. Wir transformieren **decision-first** — zuerst die wenigen kritischen Decision Journeys und eine **skalierbare Decision Spine**, dann der systematische Roll-out von KI und Technologie.',
      en: 'By 2030 we transform **into an AI-native platform bank** — built from data, ecosystem and **integrated governance instead of downstream control**. Our operating model follows decision logic: **journey teams with end-to-end ownership, human-in-the-loop and AI governance**. We transform **decision-first** — starting with the few critical decision journeys and a **scalable decision spine**, then the systematic roll-out of AI and technology.',
    },
    businessCase: {
      de: 'Exemplarisch (illustrativ): Der Sprung von 2–4 auf **100+ Deployments p.a.** und decision-first-Priorisierung heben den Transformations-ROI um das **2–3-Fache** und verkürzen die Amortisation kritischer Decision Journeys auf **unter 12 Monate**.',
      en: 'Illustrative example: Moving from 2–4 to **100+ deployments p.a.** and decision-first prioritisation lift transformation ROI by **2–3×** and shorten payback of critical decision journeys to **under 12 months**.',
    },
    hypotheses: [
      {
        title: { de: 'Ökosystem-Plattform mit integrierter Governance', en: 'Ecosystem platform with integrated governance' },
        image: {
          src: './images/Kapitel 7_1.png',
          alt: {
            de: 'Status Quo: intern fokussierte Transformation an fragmentierten IT-/Prozessprojekten. 2030: AI-getriebene Ökosystem-Plattform aus Daten, Partnern und eingebauter Compliance.',
            en: 'Status quo: internally focused transformation on fragmented IT/process projects. 2030: an AI-driven ecosystem platform of data, partners and built-in compliance.',
          },
        },
        statusQuo: {
          de: 'Transformation **fokussiert intern** (IT, Prozesse, Compliance) – Ökosysteme, Datenbasis und Partnerintegration **bleiben fragmentiert**.',
          en: 'Transformation is **internally focused** (IT, processes, compliance) – ecosystems, data foundation and partner integration **remain fragmented**.',
        },
        in2030: {
          de: 'Aufbau einer **AI-getriebenen Plattform** aus Daten, Ökosystem und Governance, in der **Compliance integraler Bestandteil** ist – nicht nachgelagerte Kontrollfunktion. **AI wird zum Fixstern**, an dem Daten, Ökosystem und Governance ausgerichtet werden. Die **Plattform ist Geschäfts- und Betriebsmodell zugleich** – mit klarem Fokus auch auf **HR und Change**.',
          en: 'Building an **AI-driven platform** of data, ecosystem and governance in which **compliance is an integral part** – not a downstream control function. **AI becomes the guiding star** around which data, ecosystem and governance are aligned. The **platform is business and operating model in one** – with a clear focus on **HR and change** as well.',
        },
      },
      {
        title: { de: 'AI-native Transformation zum Entscheidungs-Operating-Model', en: 'AI-native transformation to a decision operating model' },
        image: {
          src: './images/Kapitel 7_2.png',
          alt: {
            de: 'Status Quo: produkt- und silogetriebene Organisation, Transformation in starren Strukturen gefangen. 2030: AI-natives Operating Model, Journey-Teams mit E2E-Ownership und Human-in-the-loop.',
            en: 'Status quo: a product- and silo-driven organisation with transformation trapped in rigid structures. 2030: an AI-native operating model with journey teams holding E2E ownership and human-in-the-loop.',
          },
        },
        statusQuo: {
          de: 'Organisation, Governance und Prozesse sind **produkt- und silogetrieben**. Transformation **bleibt in bestehenden Strukturen gefangen**.',
          en: 'Organisation, governance and processes are **product- and silo-driven**. Transformation **remains trapped in existing structures**.',
        },
        in2030: {
          de: 'Transformation erfolgt durch den Aufbau eines **AI-nativen Operating Models** entlang der Entscheidungslogik. **End-to-End Ownership, Journey-Teams** sowie **Human-in-the-loop und AI-Governance** sind fester Bestandteil.',
          en: 'Transformation happens by building an **AI-native operating model** along decision logic. **End-to-end ownership, journey teams** as well as **human-in-the-loop and AI governance** are an integral part.',
        },
      },
      {
        title: { de: 'Decision-first Transformation', en: 'Decision-first transformation' },
        image: {
          src: './images/Kapitel 7_3.png',
          alt: {
            de: 'Status Quo: technologiegetriebene Transformation in vielen isolierten Use Cases ohne Priorität. 2030: decision-first mit klarer Roadmap und skalierbarer Decision Spine vor dem AI-Rollout.',
            en: 'Status quo: technology-driven transformation across many isolated use cases without priority. 2030: decision-first with a clear roadmap and a scalable decision spine ahead of the AI rollout.',
          },
        },
        statusQuo: {
          de: 'Transformation startet primär **technologie-(AI)-getrieben** und verteilt sich auf **isolierte Use Cases ohne klare Priorisierung**. Die IT bleibt im **Reparaturmodus** – Altsysteme werden gefixt und Produkte auf dem bestehenden Geschäfts- und Betriebsmodell erweitert. Nur **2–4 Deployments pro Jahr**.',
          en: 'Transformation starts primarily **technology-(AI)-driven** and spreads across **isolated use cases without clear prioritisation**. IT stays in **repair mode** – legacy systems get patched and products are extended on the existing business and operating model. Only **2–4 deployments per year**.',
        },
        in2030: {
          de: 'Transformation erfolgt nach einem **Decision-first-Ansatz** mit klarer Sequenzierung. Im Fokus stehen zunächst **wenige kritische Decision Journeys** und der Aufbau einer **skalierbaren Decision Spine**, bevor AI und Technologie systematisch ausgerollt werden. Der Weg von der **Idee zur Ausführung verkürzt sich drastisch** – Compliance, Risk und Governance sind eingebaut. **100+ Deployments pro Jahr** werden möglich.',
          en: 'Transformation follows a **decision-first approach** with clear sequencing. The initial focus is on **a few critical decision journeys** and on building a **scalable decision spine** before AI and technology are rolled out systematically. The path from **idea to execution shortens dramatically** – with compliance, risk and governance built in. **100+ deployments per year** become possible.',
        },
      },
      {
        // NEU aus Workshop-Feedback: Change muss im Target Operating Model
        // verankert und tatsächlich durchgeführt werden.
        title: { de: 'Change ist im Target Operating Model verankert', en: 'Change is anchored in the target operating model' },
        image: {
          src: './images/Kapitel 7_4.png',
          alt: {
            de: 'Status Quo: neue Prozesse und Systeme werden geliefert, doch der Verhaltens- und Kulturwandel verpufft. 2030: Change ist fest im Target Operating Model verankert – Governance, Rollen und Anreize stellen die Umsetzung sicher.',
            en: 'Status quo: new processes and systems are delivered, but behavioural and cultural change fizzles out. 2030: change is firmly anchored in the target operating model – governance, roles and incentives ensure it is delivered.',
          },
        },
        statusQuo: {
          de: 'Transformationsprojekte liefern neue Prozesse und Systeme, doch der **Change** – Verhaltens- und Kulturwandel – wird oft **nicht konsequent umgesetzt** und verpufft.',
          en: 'Transformation projects deliver new processes and systems, but **change** – behavioural and cultural change – is often **not consistently implemented** and fizzles out.',
        },
        in2030: {
          de: '**Change ist fest im Target Operating Model verankert**: Governance, Rollen und Anreize stellen sicher, dass Veränderung nicht nur beschlossen, sondern **tatsächlich durchgeführt und nachhaltig verankert** wird.',
          en: '**Change is firmly anchored in the target operating model**: governance, roles and incentives ensure that change is not merely decided but **actually delivered and sustainably embedded**.',
        },
      },
      {
        // NEU aus Workshop-Feedback: Beratungsangebot/Projektmethodik — wie werden
        // Projekte künftig durchgeführt, wie sieht der Transformationspfad aus.
        title: { de: 'Neue Projektmethodik & klarer Transformationspfad', en: 'New project methodology & a clear transformation path' },
        image: {
          src: './images/Kapitel 7_5.png',
          alt: {
            de: 'Status Quo: klassische Projektmethodik (Wasserfall/Stage-Gate) ohne durchgängigen Transformationspfad. 2030: AI-native Projektmethodik mit wiederverwendbaren Artefakten und einem klaren Transformationspfad von Reifegrad über nächste Schritte zum Zielbild.',
            en: 'Status quo: classic project methodology (waterfall/stage-gate) without a continuous transformation path. 2030: an AI-native project methodology with reusable artefacts and a clear transformation path from maturity through next steps to the target picture.',
          },
        },
        statusQuo: {
          de: 'Transformationsprojekte folgen **klassischen Methoden** (Wasserfall/Stage-Gate). Ein durchgängiger, **artefaktgestützter Transformationspfad** fehlt.',
          en: 'Transformation projects follow **classic methods** (waterfall/stage-gate). A continuous, **artefact-based transformation path** is missing.',
        },
        in2030: {
          de: 'Projekte werden nach einer **AI-nativen Projektmethodik** durchgeführt – mit wiederverwendbaren **Artefakten** und einem klaren **Transformationspfad** von der Reifegrad-Bestimmung über die nächsten Schritte bis zum Zielbild.',
          en: 'Projects are run with an **AI-native project methodology** – with reusable **artefacts** and a clear **transformation path** from maturity assessment through the next steps to the target picture.',
        },
      },
    ],
    activity: {
      image: {
        src: './images/Kapitel 7_Demo.png',
        alt: {
          de: 'Executive-Co-Creation im Boardroom rund um ein großes System-Diagramm und eine 2x2-Priorisierungsmatrix.',
          en: 'Executive co-creation in the boardroom around a large system diagram and a 2x2 prioritisation matrix.',
        },
      },
      title: { de: 'Co-Creation: Future Interaction Model', en: 'Co-creation: future interaction model' },
      text: {
        de: 'Co-Creation: **Future Interaction Model**. Zielbild → Kontrolle → Priorisierung → Pilot. **Wer entscheidet künftig (Mensch / AI / Hybrid)?** Was geben wir ab, was zuerst, wo starten wir?',
        en: 'Co-creation: **future interaction model**. Target picture → control → prioritisation → pilot. **Who decides in future (human / AI / hybrid)?** What do we hand over, what first, where do we start?',
      },
      buttonLabel: { de: 'Zur Co-Creation', en: 'Go to co-creation' },
      handoff: { kind: 'cocreation', variant: 'future-interaction' },
    },
  },

  // ── 08 Produkte & Innovation · 3. OG rechts (Projektraum) ─────────────────
  // NEU. Raumgebundenes 8. Kapitel oben rechts (Whiteboards, Mockups,
  // Co-Creation am Stehtisch). Drei Achsen, ohne Überlappung mit Kapitel 02:
  //   H1 Wie individuell ist das Produkt?      → Segment of One
  //   H2 Wie verhält es sich über die Zeit?    → lebender, adaptiver Service
  //   H3 Wie entsteht es?                      → kontinuierliche KI-Produktentwicklung
  // Abgrenzung zu 02-H3: dort hyperpersonalisierte Betreuung/Interaktion,
  // hier die Produktarchitektur selbst.
  //
  // HINWEIS: Diese Hypothesen sind NEU formuliert (Deck-Duktus), stammen aber
  // noch NICHT aus dem Deck-PDF — vor Workshop-Einsatz freigeben und als
  // Folien ins Deck übernehmen, damit die 1:1-Regel sauber bleibt.
  //
  // TODO(Auftraggeber): Aktivitäts-/Demo-Bild + Absprung folgen, sobald das
  // Format feststeht (iframe-Demo / Co-Creation / eigenes Tool).
  {
    id: 'projekt',
    kapitel: '07',
    // Teaser-Kapitel: nur die Einstiegsbühne wird gezeigt — der Produktraum
    // wird kundenspezifisch bei Bedarf gestaltet. Hypothesen/Aktivität bleiben
    // als Material im Datenbestand, werden aber nirgends mehr gerendert.
    teaserOnly: true,
    label: { de: 'Produkte & Innovation', en: 'Products & Innovation' },
    ort: { de: '3. OG rechts (Projektraum)', en: '3rd floor right (project room)' },
    keyObject: 'Whiteboard-Wand mit Produkt-Mockups',
    zone: { centerX: 73, centerY: 18, width: 40, height: 23, labelX: 72, labelY: 15, hitWidth: 32, hitHeight: 19 },
    vision: {
      de: '2030 gibt es keinen Produktkatalog mehr: KI komponiert aus modularen Bausteinen **hyperpersonalisierte Lösungen für das Segment of One** — im Moment des Bedarfs. Produkte sind **lebende, adaptive Services**, die sich innerhalb definierter Leitplanken selbst an Lebensereignisse und Marktlage anpassen. Und sie entstehen **kontinuierlich statt in Jahresprojekten**: KI entwirft, simuliert und testet compliant by design — **Time-to-Market sinkt von Jahren auf Tage**.',
      en: 'In 2030 there is no longer a product catalogue: from modular building blocks, AI composes **hyper-personalised solutions for the segment of one** — at the moment of need. Products are **living, adaptive services** that adjust themselves to life events and market conditions within defined guardrails. And they emerge **continuously rather than in annual projects**: AI designs, simulates and tests compliant by design — **time-to-market drops from years to days**.',
    },
    businessCase: {
      de: 'Exemplarisch (illustrativ): Time-to-Market von Monaten/Jahren auf **Tage** und Segment-of-One-Produkte steigern die Abschlussquote um **15–25 %**. Das entspricht rund **10–15 Mio € inkrementellem Ertrag p.a.** bei deutlich niedrigeren Entwicklungskosten je Produkt.',
      en: 'Illustrative example: Cutting time-to-market from months/years to **days** and segment-of-one products raise the conversion rate by **15–25 %**. That is roughly **€10–15m incremental revenue p.a.** at much lower development cost per product.',
    },
    hypotheses: [
      {
        title: { de: 'Vom Produktkatalog zum Segment of One', en: 'From product catalogue to segment of one' },
        image: {
          src: './images/Kapitel 8_1.png',
          alt: {
            de: 'Status Quo: Regal mit identischen Standard-Produktmappen, mehrere Kunden halten dieselbe Mappe. 2030: jeder Kunde sieht auf dem eigenen Gerät eine sichtbar andere, individuell komponierte Produktlösung.',
            en: 'Status quo: a shelf of identical standard product folders, several customers holding the same folder. 2030: each customer sees a visibly different, individually composed product solution on their own device.',
          },
        },
        statusQuo: {
          de: 'Banken bieten **standardisierte Produktkataloge** für breite Kundensegmente an. Individualisierung beschränkt sich auf **wenige Parameter** wie Konditionen oder Laufzeiten.',
          en: 'Banks offer **standardised product catalogues** for broad customer segments. Individualisation is limited to **a few parameters** such as terms or maturities.',
        },
        in2030: {
          de: 'Produkte entstehen **individuell im Moment des Bedarfs**: KI komponiert aus modularen Bausteinen **hyperpersonalisierte Lösungen** für den einzelnen Kunden **(„Segment of One")** – dynamisch angepasst an Lebenssituation, Ziele und Kontext.',
          en: 'Products emerge **individually at the moment of need**: from modular building blocks, AI composes **hyper-personalised solutions** for the individual customer **(“segment of one”)** – dynamically adapted to life situation, goals and context.',
        },
      },
      {
        title: { de: 'Produkte werden zu lebenden, adaptiven Services', en: 'Products become living, adaptive services' },
        image: {
          src: './images/Kapitel 8_2.png',
          alt: {
            de: 'Status Quo: dicker Papier-Vertragsordner wird geschlossen und ins Regal zu identischen Ordnern abgeheftet. 2030: Kundin im Umzug schaut entspannt auf einen Bildschirm, auf dem sich Produktparameter innerhalb markierter Leitplanken von selbst anpassen.',
            en: 'Status quo: a thick paper contract folder is closed and filed on a shelf next to identical folders. 2030: a customer in the middle of a move looks relaxed at a screen on which product parameters adjust themselves within marked guardrails.',
          },
        },
        statusQuo: {
          de: 'Produkte sind **statisch**: Nach Abschluss bleiben Struktur und Konditionen bis zur Kündigung oder Prolongation unverändert – jede Anpassung erfordert einen **Neuabschluss**.',
          en: 'Products are **static**: after closing, structure and terms remain unchanged until cancellation or renewal – every adjustment requires a **new contract**.',
        },
        in2030: {
          de: 'Produkte **passen sich kontinuierlich an**: Konditionen, Limits und Absicherungen adjustieren sich **innerhalb definierter Leitplanken automatisch** an Lebensereignisse und Marktlage. Das Produkt wird **vom Vertrag zum lebenden Service**.',
          en: 'Products **adapt continuously**: terms, limits and hedges adjust **automatically within defined guardrails** to life events and market conditions. The product turns **from a contract into a living service**.',
        },
      },
      {
        title: { de: 'Produktentwicklung wird kontinuierlich: von Jahren zu Tagen', en: 'Product development becomes continuous: from years to days' },
        image: {
          src: './images/Kapitel 8_3.png',
          alt: {
            de: 'Status Quo: zähe Gremiensitzung über dicken Anforderungsstapeln und Wandplanungstafel. 2030: kleines Produktteam im hellen Projektraum, KI simuliert parallel viele Produktvarianten, ein Same-Day-Mockup liegt auf dem Tisch.',
            en: 'Status quo: a sluggish committee meeting over thick stacks of requirements and a wall planning board. 2030: a small product team in a bright project room, AI simulating many product variants in parallel, with a same-day mockup on the table.',
          },
        },
        statusQuo: {
          de: 'Produktentwicklung ist ein **langwieriger interner Prozess** über Gremien, IT-Umsetzung und nachgelagerte Compliance-Prüfung – **Time-to-Market liegt bei Monaten bis Jahren**.',
          en: 'Product development is a **lengthy internal process** across committees, IT implementation and downstream compliance review – **time-to-market is months to years**.',
        },
        in2030: {
          de: 'KI **entwirft, simuliert und testet neue Produkte kontinuierlich** – mit synthetischen Kundendaten und integrierten Compliance-Checks **(„compliant by design")**. **Time-to-Market sinkt auf Tage**. Produktinnovation wird zum kontinuierlichen Prozess.',
          en: 'AI **continuously designs, simulates and tests new products** – with synthetic customer data and integrated compliance checks **(“compliant by design”)**. **Time-to-market drops to days**. Product innovation becomes a continuous process.',
        },
      },
    ],
    activity: {
      image: {
        src: './images/Kapitel 8_Demo.png',
        alt: {
          de: 'Projektraum mit Whiteboards und Produkt-Mockups. Großer, frontal stehender 16:9-Bildschirm für den Demo-Absprung.',
          en: 'A project room with whiteboards and product mockups. A large, front-facing 16:9 screen for the demo hand-off.',
        },
      },
      title: { de: 'Produkte & Innovation: vom Bedarf zum Produkt in Tagen', en: 'Products & Innovation: from need to product in days' },
      text: {
        de: 'Provisorischer Platzhalter. **Demo und Absprung folgen**, sobald das Format feststeht — hier soll der Projektraum zeigen, wie KI ein Produkt für das Segment of One komponiert, simuliert und compliant by design ausliefert.',
        en: 'Provisional placeholder. **Demo and hand-off to follow** once the format is set — here the project room should show how AI composes, simulates and delivers a product for the segment of one, compliant by design.',
      },
      buttonLabel: { de: 'Demo folgt', en: 'Demo to follow' },
      // TODO(Auftraggeber): finalen Handoff einsetzen (iframe-Demo / Tool).
      handoff: { kind: 'iframe', url: '', title: { de: 'Produkte-&-Innovation-Demo (folgt)', en: 'Products & Innovation demo (to follow)' } },
    },
  },
  // ── 09 Vorstand & Governance · 3. OG links (Boardroom) ────────────────────
  // NEU: eigenes Kapitel für die Vorstands-/Boardroom-Etage oben links.
  // Inhalte sind PLATZHALTER-VORSCHLÄGE (vor Workshop-Einsatz freigeben);
  // Bilder (Kapitel 9_1..9_3 / 9_Demo) folgen — bis dahin zeigt die App
  // einen sauberen Platzhalter. Bild-Prompts: bild-prompt-hypothesen-2030.md.
  {
    id: 'vorstand',
    kapitel: '08',
    label: { de: 'Vorstand & Governance', en: 'Executive Board & Governance' },
    ort: { de: '3. OG links (Boardroom)', en: '3rd floor left (boardroom)' },
    keyObject: 'Governance-Cockpit an der Wand',
    zone: { centerX: 27, centerY: 18, width: 38, height: 23, labelX: 30, labelY: 15, hitWidth: 32, hitHeight: 19 },
    vision: {
      de: 'Der Vorstand steuert die Bank 2030 **datenbasiert, in Echtzeit und mit klarer AI-Governance**: Ein Governance-Cockpit macht Kapital, Liquidität, Risiko und Ertrag **live** sichtbar, KI **simuliert Handlungsoptionen**, und der Vorstand verantwortet **Leitplanken, Risikoappetit und Ethik der KI** zentral. Aus dem jährlichen Strategiezyklus wird eine **kontinuierliche, adaptive Steuerung**. (Platzhalter-Vorschlag — vor Nutzung freigeben.)',
      en: 'In 2030 the board steers the bank **on live data, in real time and with clear AI governance**: a governance cockpit makes capital, liquidity, risk and earnings visible **live**, AI **simulates options for action**, and the board owns the **guardrails, risk appetite and ethics of AI** centrally. The annual strategy cycle turns into **continuous, adaptive steering**. (Placeholder proposal — to be signed off before use.)',
    },
    businessCase: {
      de: 'Exemplarisch (illustrativ): Schnellere, datenbasierte Vorstandsentscheidungen und **dynamische Kapitalallokation** verbessern die Eigenkapitalrendite um **0,5–1,5 %-Punkte** und senken Kosten aus Fehlentscheidungen/Verzögerung spürbar — bei einer mittelgroßen Bank grob ein **zweistelliger Mio-€-Effekt p.a.** Zahlen als Beispielrechnung, vor externer Nutzung mit realen Annahmen hinterlegen.',
      en: 'Illustrative example: faster, data-driven board decisions and **dynamic capital allocation** improve return on equity by **0.5–1.5 pp** and noticeably reduce the cost of wrong or delayed decisions — for a mid-sized bank roughly a **double-digit €m effect p.a.** Figures are an example calculation. Back them with real assumptions before external use.',
    },
    hypotheses: [
      {
        title: { de: 'Vom Quartalsbericht zur Echtzeit-Steuerung', en: 'From quarterly report to real-time steering' },
        image: {
          src: './images/Kapitel 9_1.png',
          alt: {
            de: 'Status Quo: Vorstand entscheidet in einer Sitzung anhand gedruckter Quartalsberichte und Rückspiegel-Kennzahlen. 2030: Vorstand steht in einem immersiven Datenraum — kein Konferenztisch — und steuert live über eine raumhohe Cockpit-Wand mit Echtzeit-Kennzahlen und KI-simulierten Szenarien.',
            en: 'Status quo: the board decides in a meeting based on printed quarterly reports and rear-view metrics. 2030: the board stands in an immersive data room — no conference table — steering live via a floor-to-ceiling cockpit wall with real-time metrics and AI-simulated scenarios.',
          },
        },
        statusQuo: {
          de: 'Der Vorstand entscheidet auf Basis **periodischer, rückwärtsgerichteter Berichte** (Quartals-/Monatsreporting). Zwischen Ereignis und Entscheidung liegen Wochen. Vieles beruht auf **Erfahrung und Bauchgefühl**.',
          en: 'The board decides on **periodic, backward-looking reports** (quarterly/monthly). Weeks pass between event and decision. Much rests on **experience and gut feeling**.',
        },
        in2030: {
          de: 'Ein **Governance-Cockpit in Echtzeit** bündelt Kapital, Liquidität, Risiko und Ertrag live. KI **simuliert Szenarien und Handlungsoptionen** – der Vorstand entscheidet **auf aktueller Datenbasis statt auf Quartalsständen**, schneller und fundierter.',
          en: 'A **real-time governance cockpit** brings capital, liquidity, risk and earnings together live. AI **simulates scenarios and options** – the board decides **on current data instead of quarter-end snapshots**, faster and better founded.',
        },
        leitfrage: {
          de: 'Wenn Kapital, Liquidität und Risiko künftig live statt im Quartalsbericht vorliegen und die KI Szenarien simuliert – welche Vorstandsentscheidung würden Sie dann anders treffen?',
          en: 'If capital, liquidity and risk are available live rather than in a quarterly report and AI simulates the scenarios – which board decision would you then make differently?',
        },
      },
      {
        title: { de: 'AI-Governance wird Chefsache', en: 'AI governance becomes a board responsibility' },
        image: {
          src: './images/Kapitel 9_2.png',
          alt: {
            de: 'Status Quo: KI-Governance ist an Fachbereiche und IT delegiert und fragmentiert, keine Verantwortung auf Vorstandsebene. 2030: der Vorstand verantwortet KI-Leitplanken, Risikoappetit und Ethik zentral. Eine CAIO-Rolle und ein KI-Ausschuss mit Explainability-Sicht auf jede wesentliche KI-Entscheidung.',
            en: 'Status quo: AI governance is delegated to business units and IT and fragmented, with no board-level accountability. 2030: the board owns AI guardrails, risk appetite and ethics centrally. A CAIO role and an AI committee with an explainability view of every material AI decision.',
          },
        },
        statusQuo: {
          de: 'KI-Verantwortung ist **an Fachbereiche und IT delegiert** und fragmentiert. Es fehlt eine **klare Governance und Rechenschaft auf Vorstandsebene** für Modelle, Risiken und ethische Grenzen.',
          en: 'Responsibility for AI is **delegated to business units and IT** and fragmented. There is **no clear governance or board-level accountability** for models, risks and ethical limits.',
        },
        in2030: {
          de: '**AI-Governance wird Chefsache**: Der Vorstand setzt **Leitplanken, Risikoappetit und ethische Grenzen** für KI, verankert eine **CAIO-Rolle bzw. einen KI-Ausschuss** und fordert **Explainability** für wesentliche KI-Entscheidungen.',
          en: '**AI governance becomes a board responsibility**: the board sets **guardrails, risk appetite and ethical limits** for AI, anchors a **CAIO role or AI committee** and requires **explainability** for material AI decisions.',
        },
        leitfrage: {
          de: 'Wenn KI künftig wesentliche Entscheidungen Ihrer Bank mitträgt – wer in Ihrem Vorstand verantwortet dann ihre Leitplanken, ihren Risikoappetit und ihre Ergebnisse?',
          en: 'If AI comes to carry material decisions in your bank – who on your board is then accountable for its guardrails, its risk appetite and its outcomes?',
        },
      },
      {
        title: { de: 'Von der Jahresstrategie zur kontinuierlichen Steuerung', en: 'From annual strategy to continuous steering' },
        image: {
          src: './images/Kapitel 9_3.png',
          alt: {
            de: 'Status Quo: Strategie wird in einem starren Jahreszyklus geplant, Ressourcen werden träge umverteilt. 2030: kontinuierliche, KI-gestützte Strategiesteuerung — Kapital und Ressourcen werden dynamisch am lebenden Betriebsmodell allokiert.',
            en: 'Status quo: strategy is planned in a rigid annual cycle, resources reallocated sluggishly. 2030: continuous, AI-supported strategy steering — capital and resources allocated dynamically to the living operating model.',
          },
        },
        statusQuo: {
          de: 'Strategie und Planung laufen in einem **starren Jahreszyklus**. Kapital und Ressourcen werden **träge und selten** umverteilt. Auf Marktänderungen reagiert die Bank mit **Verzögerung**.',
          en: 'Strategy and planning run on a **rigid annual cycle**. Capital and resources are reallocated **slowly and rarely**. The bank reacts to market changes with **a lag**.',
        },
        in2030: {
          de: 'Der Vorstand steuert **kontinuierlich und adaptiv**: KI liefert **laufende Lageeinschätzung**, Kapital, Risiko und Ressourcen werden **dynamisch am lebenden Betriebsmodell** allokiert – Strategie wird zum **fortlaufenden Prozess statt Jahresritual**.',
          en: 'The board steers **continuously and adaptively**: AI provides an **ongoing situational picture**. Capital, risk and resources are allocated **dynamically to the living operating model** – strategy becomes a **continuous process rather than an annual ritual**.',
        },
        leitfrage: {
          de: 'Wenn Kapital und Ressourcen künftig dynamisch am lebenden Betriebsmodell statt im starren Jahreszyklus allokiert werden – was würde Ihre Bank dann anders machen?',
          en: 'If capital and resources are allocated dynamically to the living operating model rather than in a rigid annual cycle – what would your bank then do differently?',
        },
      },
    ],
    activity: {
      image: {
        src: './images/Kapitel 9_Demo.png',
        alt: {
          de: 'Boardroom mit großem, frontal stehendem 16:9-Governance-Cockpit-Bildschirm für den Demo-Absprung.',
          en: 'A boardroom with a large, front-facing 16:9 governance-cockpit screen for the demo hand-off.',
        },
      },
      title: { de: 'Vorstands-Cockpit: Steuern in Echtzeit', en: 'Board cockpit: steering in real time' },
      text: {
        de: 'Provisorischer Platzhalter (Vorschlag). **Demo und Absprung folgen** — hier soll das Governance-Cockpit zeigen, wie der Vorstand 2030 live auf Kapital, Risiko und KI-simulierte Szenarien schaut und eine Entscheidung durchspielt.',
        en: 'Provisional placeholder (proposal). **Demo and hand-off to follow** — here the governance cockpit should show how the board in 2030 looks live at capital, risk and AI-simulated scenarios and plays through a decision.',
      },
      buttonLabel: { de: 'Demo folgt', en: 'Demo to follow' },
      // TODO(Auftraggeber): finalen Handoff einsetzen (iframe-Demo / Tool).
      handoff: { kind: 'iframe', url: '', title: { de: 'Vorstands-Cockpit-Demo (folgt)', en: 'Board cockpit demo (to follow)' } },
    },
  },
]

/** Master-Strukturbild („Bank'26"), Übersicht + Intro-Reveal (zweisprachig). */
const RAW_MASTER_IMAGE: RawImageRef = {
  src: './images/Strukturbild.png',
  alt: {
    de: 'Fotorealistischer Gebäude-Querschnitt einer Bank — vier Etagen mit je zwei Räumen: oben Boardroom und Projektraum, darunter Corporate/HR und Serverraum, darunter Advisory und Backoffice-Großraum, im Erdgeschoss die Filiale (Schalter und Self-Service-Lounge). Ein zentraler Glas-Aufzug verbindet alle Etagen.',
    en: 'A photorealistic building cross-section of a bank — four floors with two rooms each: at the top the boardroom and project room, below them Corporate/HR and the server room, below those advisory and the open-plan back office, and on the ground floor the branch (counter and self-service lounge). A central glass elevator connects all floors.',
  },
}

/** Echte Pixel-Auflösung des Master-Bildes (für die Kamera-Aspect-Ratio). */
export const MASTER_ASPECT = 1536 / 1024

// ─── Resolver: Roh (zweisprachig) → flach (aktive Sprache). ──────────────────

function localizeImage(image: RawImageRef, lang: Lang): ImageRef {
  return { src: image.src, alt: pick(image.alt, lang) }
}

function localizeHandoff(handoff: RawHandoff, lang: Lang): Handoff {
  if (handoff.kind === 'iframe') {
    return { kind: 'iframe', url: handoff.url, title: pick(handoff.title, lang) }
  }
  return handoff
}

function localizeScreenOverlay(overlay: RawScreenOverlay, lang: Lang): ScreenOverlay {
  return {
    url: overlay.url,
    title: pick(overlay.title, lang),
    leftPct: overlay.leftPct,
    topPct: overlay.topPct,
    widthPct: overlay.widthPct,
    heightPct: overlay.heightPct,
  }
}

/** Bildnummer aus dem Pfad ziehen, z. B. './images/Kapitel 3_2.png' -> '3_2'. */
function imageKeyOf(src: string): string {
  const m = src.match(/Kapitel\s+(\d+_\d+)\.png/)
  return m ? m[1] : ''
}

function localizeHypothesis(h: RawHypothesis, lang: Lang): Hypothesis {
  // Inline-Leitfrage hat Vorrang; sonst Fallback über die Bildnummer, damit
  // JEDE Hypothese eine Leitfrage trägt (Consultant, Editor, Excel-Export).
  const rawLeitfrage = h.leitfrage ?? LEITFRAGE_BY_IMAGE[imageKeyOf(h.image.src)]
  return {
    title: pick(h.title, lang),
    image: localizeImage(h.image, lang),
    statusQuo: pick(h.statusQuo, lang),
    in2030: pick(h.in2030, lang),
    ...(rawLeitfrage ? { leitfrage: pick(rawLeitfrage, lang) } : {}),
  }
}

function localizeActivity(a: RawActivity, lang: Lang): Activity {
  return {
    image: localizeImage(a.image, lang),
    title: pick(a.title, lang),
    text: pick(a.text, lang),
    buttonLabel: pick(a.buttonLabel, lang),
    handoff: localizeHandoff(a.handoff, lang),
    ...(a.screenOverlay ? { screenOverlay: localizeScreenOverlay(a.screenOverlay, lang) } : {}),
  }
}

function localizeChapter(c: RawChapter, lang: Lang): Chapter {
  return {
    id: c.id,
    kapitel: c.kapitel,
    label: pick(c.label, lang),
    ort: pick(c.ort, lang),
    keyObject: c.keyObject,
    zone: c.zone,
    vision: pick(c.vision, lang),
    businessCase: pick(c.businessCase, lang),
    hypotheses: c.hypotheses.map((h) => localizeHypothesis(h, lang)),
    activity: localizeActivity(c.activity, lang),
    ...(c.teaserOnly ? { teaserOnly: true } : {}),
  }
}

/** Sprachunabhängige Liste der Kapitel-IDs (z. B. zur Navigations-Validierung). */
export const CHAPTER_IDS: ChapterId[] = RAW_CHAPTERS.map((c) => c.id)

/** Teaser-Kapitel (nur Einstiegsbühne)? Sprachunabhängig, z. B. für Init-Logik. */
export function isTeaserChapter(id: ChapterId | null): boolean {
  return !!id && RAW_CHAPTERS.find((c) => c.id === id)?.teaserOnly === true
}

/** Map Kapitel-Nummer (z. B. '02') → ChapterId (z. B. 'vertrieb') für Deep-Links. */
export const CHAPTER_NUMBERS: Record<string, ChapterId> = Object.fromEntries(
  RAW_CHAPTERS.map((c) => [c.kapitel, c.id]),
)

/**
 * Anzahl der Schritte eines Kapitels (Hypothesen + 1 Aktivität). Kapitel können
 * unterschiedlich viele Hypothesen haben — Deep-Links und Navigation klemmen den
 * Schritt darüber. Fallback 4 (3 Hypothesen + Aktivität) für unbekannte IDs.
 */
export function stepCountForChapter(id: ChapterId): number {
  const raw = RAW_CHAPTERS.find((c) => c.id === id)
  // N Hypothesen + 1 Aktivität/Live-Demo + 1 Management Summary (letzte Kachel).
  return (raw ? raw.hypotheses.length : 3) + 2
}

/** Alle Kapitel in der aktiven Sprache. */
export function getChapters(lang: Lang): Chapter[] {
  return RAW_CHAPTERS.map((c) => localizeChapter(c, lang))
}

/** Ein Kapitel (oder null) in der aktiven Sprache. */
export function getChapter(id: ChapterId | null, lang: Lang): Chapter | null {
  if (!id) return null
  const raw = RAW_CHAPTERS.find((c) => c.id === id)
  return raw ? localizeChapter(raw, lang) : null
}

/** Master-Strukturbild in der aktiven Sprache. */
export function getMasterImage(lang: Lang): ImageRef {
  return localizeImage(RAW_MASTER_IMAGE, lang)
}

/**
 * Alle Bildpfade (Master + 24 Hypothesen + 8 Aktivitäten) — zum Vorladen beim
 * App-Start, damit das Öffnen eines Kapitels ohne Ladeverzögerung erfolgt.
 * Sprachunabhängig (nur Pfade).
 */
export function getAllImageSrcs(): string[] {
  const srcs = [RAW_MASTER_IMAGE.src]
  for (const c of RAW_CHAPTERS) {
    for (const h of c.hypotheses) srcs.push(h.image.src)
    srcs.push(c.activity.image.src)
  }
  return srcs
}

// ─────────────────────────────────────────────────────────────────────────────
// MEHRERE INSTANZEN ÜBER DIESELBE ENGINE
//
// Die BankExplorer-Engine (Strukturbild, Kameraflug, Kapitel-Reader, Absprünge)
// ist generisch. Damit neben der Standard-Instanz „Bank'26" weitere Instanzen
// (z. B. Edekabank) ohne Code-Duplikat entstehen, bündelt eine `Experience`
// ihre Rohdaten (Master-Bild + Kapitel + Bild-Seitenverhältnis). `makeExperienceApi`
// liefert daraus exakt die Accessor-Funktionen, die die Engine konsumiert.
//
// Die historischen Top-Level-Exports oben (getChapters/getChapter/… auf
// RAW_CHAPTERS) bleiben unverändert erhalten — die Standard-Instanz verhält
// sich damit 1:1 wie bisher.
// ─────────────────────────────────────────────────────────────────────────────

export type Experience = {
  /** Stabiler Schlüssel der Instanz (z. B. 'bank2026', 'edeka'). */
  id: string
  /** Pixel-Seitenverhältnis des Master-Bildes (Breite / Höhe). */
  masterAspect: number
  rawMaster: RawImageRef
  rawChapters: RawChapter[]
}

/** Die von der Engine konsumierten Accessor-Funktionen einer Instanz. */
export type ExperienceApi = {
  CHAPTER_IDS: ChapterId[]
  CHAPTER_NUMBERS: Record<string, ChapterId>
  MASTER_ASPECT: number
  getChapters: (lang: Lang) => Chapter[]
  getChapter: (id: ChapterId | null, lang: Lang) => Chapter | null
  getMasterImage: (lang: Lang) => ImageRef
  getAllImageSrcs: () => string[]
}

export function makeExperienceApi(exp: Experience): ExperienceApi {
  const CHAPTER_NUMBERS: Record<string, ChapterId> = Object.fromEntries(
    exp.rawChapters.map((c) => [c.kapitel, c.id]),
  )
  return {
    CHAPTER_IDS: exp.rawChapters.map((c) => c.id),
    CHAPTER_NUMBERS,
    MASTER_ASPECT: exp.masterAspect,
    getChapters: (lang) => exp.rawChapters.map((c) => localizeChapter(c, lang)),
    getChapter: (id, lang) => {
      if (!id) return null
      const raw = exp.rawChapters.find((c) => c.id === id)
      return raw ? localizeChapter(raw, lang) : null
    },
    getMasterImage: (lang) => localizeImage(exp.rawMaster, lang),
    getAllImageSrcs: () => {
      const srcs = [exp.rawMaster.src]
      for (const c of exp.rawChapters) {
        for (const h of c.hypotheses) srcs.push(h.image.src)
        srcs.push(c.activity.image.src)
      }
      return srcs
    },
  }
}

/** Standard-Instanz „Bank'26" — gebündelt für die generische Engine. */
export const DEFAULT_EXPERIENCE: Experience = {
  id: 'bank2026',
  masterAspect: MASTER_ASPECT,
  rawMaster: RAW_MASTER_IMAGE,
  rawChapters: RAW_CHAPTERS,
}

export const DEFAULT_API: ExperienceApi = makeExperienceApi(DEFAULT_EXPERIENCE)
