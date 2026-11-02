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
// unter `public/images/` — Schema: `Strukturbild.jpg` (Master, gpt-image-2 +
// Magnific-2x-Upscale) sowie
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
// Zoom-Koordinaten (ZONES) sind auf `public/images/Strukturbild.jpg` (6144×4096,
// 4 Etagen) kalibriert: jede Zone umfasst genau einen Raum, von der
// Deckenunterkante bis zur Unterkante der Bodenplatte, und in der Breite von
// Stuetze zu Stuetze. Zu knapp gewaehlte Zonen schneiden unten den Fussboden ab
// und zeigen oben einen Streifen der Etage darueber — beides sieht im Zoom nach
// Bildfehler aus. Raumgrenzen im Bild (Pixel), an den Betonplatten und den
// senkrechten Kanten ausgemessen: links x 302..2780, rechts x 3390..5823,
// Aufzugsschacht x 2780..3390; 3. OG y 221..1071, 2. OG y 1071..1978,
// 1. OG y 1978..2771, EG y 2771..3581. Die Etagen stossen aneinander, weil die
// Unterkante der einen Platte zugleich die Deckenunterkante darunter ist.
// ─────────────────────────────────────────────────────────────────────────────

import { pick, type L, type Lang } from '../i18n/LanguageContext'
import { hasFakt } from './fakten'
import { LEITFRAGE_BY_IMAGE } from './leitfragen'
import { BILD_TITEL_BY_IMAGE } from './bildTitel'

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
  /** Prägnante Kopfzeilen über den beiden Vergleichsbild-Hälften. */
  imageTitles?: { statusQuo: string; in2030: string }
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
 *  · video          → Demo-Video im Vollbild (Datei aus `upload/`, Kap. 01)
 *  · extern         → Standbild im Vollbild, Klick öffnet das Video an seinem
 *                     Ablageort in neuem Tab (SharePoint/Stream, Kap. 05)
 *  · operations     → „Ein Tag in Banking Operations 2030" im Vollbild der
 *                     App (eigenes Tool unter #/operations, Kap. 03)
 *  · strategy-lab   → interaktive Karten-/Matrix-Übung
 *  · cocreation     → Co-Creation-Canvas (Kap. 04 + 07, zwei Varianten)
 *  · kredit-dilemma → Telefon-Sequenz + drei reagierende Balken (Kap. 06)
 */
export type Handoff =
  | { kind: 'iframe'; url: string; title: string }
  | { kind: 'video'; src: string; webm?: string; poster?: string; title: string }
  | { kind: 'extern'; url: string; poster: string; title: string; hinweis: string }
  | { kind: 'operations' }
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
  | { kind: 'video'; src: string; webm?: string; poster?: string; title: L }
  | { kind: 'extern'; url: string; poster: string; title: L; hinweis: L }
  | { kind: 'operations' }
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
// Vertriebs-Kapitel als „Vertriebscockpit" eingebunden — im Banking-Modus,
// weil der Demo-Pfad der Speakernotes (Assistent → Klaus Fischer →
// Finanzübersicht → Lead Immobilienfinanzierung) dort hinterlegt ist.
// `whitelabel`: immer die Zukunftsbank, egal welches Institut zuletzt im
// Vertriebsarbeitsplatz gewählt war (dieselbe Domain teilt den Speicher).
// `rahmen=banking-horizon`: der Knopf oben links schließt die Demo und führt
// zurück ins Strukturbild statt zur Plattform-Startseite (utils/einbettung.js).
const VERTRIEBSCOCKPIT_URL =
  'https://kiarbeitsplatz.pages.dev/22_vertriebsarbeitsplatz/dist/?whitelabel&rahmen=banking-horizon#/banking/landing/uebersicht'

// Demo-Video „DForge – AI SDLC" in Microsoft Stream (SharePoint der Seite
// „Banking TOM im KI-Zeitalter"), für Deloitte-Konten erreichbar.
const SDLC_VIDEO_URL =
  'https://deudeloitte.sharepoint.com/sites/BankingTOMimKIZeitalter/_layouts/15/stream.aspx?id=%2Fsites%2FBankingTOMimKIZeitalter%2FShared%20Documents%2FC%2DLevel%20Workshop%2F1%20%2D%20Input%2F1%20%2D%20Demos%2FDForge%20%2D%20AI%20SDLC%20video%2Emp4&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview%2Ea7adb491%2Db676%2D44e7%2D9917%2D443b5382040a'

const RAW_CHAPTERS: RawChapter[] = [
  // ── 01 Kundenperspektive · Erdgeschoss (Filiale) ──────────────────────────
  {
    id: 'kunde',
    kapitel: '01',
    label: { de: 'Kundenperspektive', en: 'Customer Perspective', fr: 'Perspective client' },
    ort: { de: 'Erdgeschoss links (Filiale)', en: 'Ground floor left (branch)', fr: 'Rez-de-chaussée gauche (agence)' },
    keyObject: 'Self-Service-Lounge & Schalter',
    // Filiale links unten im Erdgeschoss (Bank'26-Schalter mit Kundenkontakt).
    // Bewusst NICHT die ganze Etage/den Fahrstuhl, sondern der Schalterbereich.
    zone: { centerX: 25.1, centerY: 77.5, width: 40.3, height: 19.8, labelX: 25.1, labelY: 71.6, hitWidth: 35, hitHeight: 17 },
    vision: {
      de: 'Für unsere Kunden wird Banking 2030 **unsichtbar und Teil des Alltags** statt eigener Interaktion: Persönliche KI-Finanzassistenten begleiten kontinuierlich, verwandeln eine Flut von Optionen in **klare, simulierte und begründete Empfehlungen** und handeln innerhalb vereinbarter Leitplanken proaktiv. Aus reaktivem Warten wird **teilautonome Finanzsteuerung mit Vertrauensmandat: Der Kunde entscheidet, aber auf KI-vorbereiteter Grundlage**.',
      en: 'For our customers, banking in 2030 becomes **invisible and part of everyday life** rather than a separate interaction: personal AI financial assistants accompany them continuously, turn a flood of options into **clear, simulated and reasoned recommendations** and act proactively within agreed guardrails. Reactive waiting gives way to **semi-autonomous financial management with a trust mandate: the customer decides, but on an AI-prepared basis**.',
      fr: 'Pour nos clients, la banque devient en 2030 **invisible et intégrée au quotidien**, au lieu d’être une interaction à part : des assistants financiers IA personnels les accompagnent en continu, transforment une profusion d’options en **recommandations claires, simulées et argumentées** et agissent de manière proactive dans le cadre de garde-fous convenus. L’attente réactive cède la place à un **pilotage financier semi-autonome fondé sur un mandat de confiance : le client décide, mais sur une base préparée par l’IA**.',
    },
    businessCase: {
      de: 'Exemplarisch (mittelgroße Bank, illustrativ): Proaktive KI-Finanzassistenten heben die Cross-Selling-Quote um **10–15 %** und senken die Abwanderung um **15–20 %**. Bei rund 250.000 Kunden entspricht das etwa **8–12 Mio € Mehrertrag p.a.**. Zugleich sinken die Servicekosten je Kontakt um **30–40 %**.',
      en: 'Illustrative example (mid-sized bank): Proactive AI financial assistants lift the cross-selling rate by **10–15 %** and cut churn by **15–20 %**. For around 250,000 customers that is roughly **€8–12m additional revenue p.a.**. At the same time, service cost per contact drops by **30–40 %**.',
      fr: 'À titre illustratif (banque de taille moyenne) : des assistants financiers IA proactifs augmentent le taux de vente croisée de **10–15 %** et réduisent l’attrition de **15–20 %**. Pour environ 250 000 clients, cela représente quelque **8–12 M€ de revenus supplémentaires par an**. Parallèlement, les coûts de service par contact baissent de **30–40 %**.',
    },
    hypotheses: [
      {
        title: { de: 'Banking verschwindet als eigener Moment', en: 'Banking disappears as a distinct moment', fr: 'La banque cesse d’être un moment à part' },
        image: {
          src: './images/Kapitel 1_1.png',
          alt: {
            de: 'Status Quo: Kundin tippt aktiv in einer Banking-App. 2030: persönlicher KI-Finanzassistent arbeitet unaufgefordert im Hintergrund auf Smartwatch und Smartphone.',
            en: 'Status quo: a customer actively taps in a banking app. 2030: a personal AI financial assistant works unprompted in the background on smartwatch and smartphone.',
            fr: 'Statu quo : une cliente tape activement sur une application bancaire. En 2030 : un assistant financier IA personnel travaille de sa propre initiative en arrière-plan, sur une montre connectée et un smartphone.',
          },
        },
        statusQuo: {
          de: 'Kunden „machen Banking" aktiv über App, Filiale oder Online-Banking – Interaktion ist **kanalzentriert und reaktiv**.',
          en: 'Customers actively “do banking” via app, branch or online banking – interaction is **channel-centric and reactive**.',
          fr: 'Les clients « font leur banque » activement via l’application, l’agence ou la banque en ligne – l’interaction est **centrée sur les canaux et réactive**.',
        },
        in2030: {
          de: 'Banking erfolgt über **persönliche KI-Finanzassistenten / Agents**, die kontinuierlich begleiten, kontextualisieren und proaktiv relevante Impulse geben – Banking wird **Teil des Alltags** statt eigener Interaktion.',
          en: 'Banking happens through **personal AI financial assistants / agents** that continuously accompany, contextualise and proactively provide relevant nudges – banking becomes **part of everyday life** rather than a separate interaction.',
          fr: 'Les services bancaires passent par des **assistants financiers IA personnels / agents** qui accompagnent en continu, contextualisent et formulent de manière proactive des suggestions pertinentes – la banque devient **partie intégrante du quotidien** plutôt qu’une interaction à part.',
        },
        leitfrage: {
          de: 'Wenn Banking künftig unsichtbar im Hintergrund über persönliche KI-Assistenten läuft – was bleibt von Ihrer Bank für die Kunden überhaupt noch sichtbar?',
          en: 'If banking runs invisibly in the background through personal AI assistants – what of your bank remains visible to customers at all?',
          fr: 'Si, demain, la banque fonctionne de manière invisible en arrière-plan via des assistants IA personnels – qu’est-ce qui, de votre banque, restera encore visible pour les clients ?',
        },
      },
      {
        title: { de: 'Optionen verschwinden, Entscheidungen werden vorbereitet', en: 'Options disappear, decisions get prepared', fr: 'Les options disparaissent, les décisions sont préparées' },
        image: {
          src: './images/Kapitel 1_2.png',
          alt: {
            de: 'Status Quo: Kunde ratlos vor vielen Produktoptionen. 2030: KI-Assistent präsentiert eine klare Empfehlung mit Simulation und Begründung.',
            en: 'Status quo: a customer is at a loss in front of many product options. 2030: an AI assistant presents one clear recommendation with simulation and rationale.',
            fr: 'Statu quo : un client désemparé face à de nombreuses options de produits. En 2030 : un assistant IA présente une recommandation claire, avec simulation et justification.',
          },
        },
        statusQuo: {
          de: 'Kunden erhalten Produktangebote und **müssen selbst entscheiden** – wenig echte Entscheidungsunterstützung.',
          en: 'Customers receive product offers and **have to decide for themselves** – with little genuine decision support.',
          fr: 'Les clients reçoivent des offres de produits et **doivent décider seuls** – avec peu de véritable aide à la décision.',
        },
        in2030: {
          de: 'KI liefert **kontinuierliche Entscheidungsintelligenz**: Klare Empfehlungen statt Optionen, Simulationen & Szenarien, Erklärung & Begründung → Kunde entscheidet, aber auf Basis einer **„AI-prepared decision"**.',
          en: 'AI delivers **continuous decision intelligence**: clear recommendations instead of options, simulations & scenarios, explanation & rationale → the customer decides, but on the basis of an **“AI-prepared decision”**.',
          fr: 'L’IA fournit une **intelligence décisionnelle continue** : des recommandations claires plutôt que des options, simulations & scénarios, explication & justification → le client décide, mais sur la base d’une **« décision préparée par l’IA »**.',
        },
      },
      {
        title: { de: 'Von Reaktion zu proaktiver, teilautonomer Finanzsteuerung', en: 'From reaction to proactive, semi-autonomous financial management', fr: 'De la réaction à un pilotage financier proactif et semi-autonome' },
        image: {
          src: './images/Kapitel 1_3.png',
          alt: {
            de: 'Status Quo: Kunde hängt in der Warteschleife der Bank und wartet auf Reaktion. 2030: Kunde läuft an einer zu verkaufenden Immobilie vorbei. Der KI-Agent hat proaktiv bereits eine Finanzierung vorbereitet, der Kunde gibt nur noch frei.',
            en: 'Status quo: a customer is stuck in the bank’s hold loop waiting for a response. 2030: the customer walks past a property for sale. The AI agent has proactively prepared a financing proposal, and the customer only approves.',
            fr: 'Statu quo : un client, bloqué en attente sur la ligne de la banque, attend une réponse. En 2030 : le client passe devant un bien immobilier à vendre. L’agent IA a déjà préparé un financement de manière proactive ; le client n’a plus qu’à le valider.',
          },
        },
        statusQuo: {
          de: 'Interaktion erfolgt überwiegend auf **Kundeninitiative** – Bank **reagiert** auf Anfragen oder Ereignisse.',
          en: 'Interaction happens mostly on **the customer’s initiative** – the bank **reacts** to requests or events.',
          fr: 'L’interaction se fait principalement à l’**initiative du client** – la banque **réagit** aux demandes ou aux événements.',
        },
        in2030: {
          de: 'Autonome KI-Agenten **erkennen Ereignisse frühzeitig** und handeln innerhalb definierter Leitplanken: Erkennen Muster / Risiken, initiieren Maßnahmen, agieren **teilautonom („trusted autonomy")** mit Freigabelogik.',
          en: 'Autonomous AI agents **detect events early** and act within defined guardrails: they recognise patterns / risks, initiate measures and operate **semi-autonomously (“trusted autonomy”)** with approval logic.',
          fr: 'Des agents IA autonomes **détectent les événements de manière précoce** et agissent dans le cadre de garde-fous définis : ils repèrent des schémas / risques, initient des mesures et agissent de manière **semi-autonome (« autonomie de confiance »)** selon une logique de validation.',
        },
      },
    ],
    activity: {
      image: {
        src: './images/Kapitel 1_Demo.png',
        alt: {
          de: 'Person zu Hause mit persönlichem KI-Finanzbegleiter auf einem großen Tablet, dessen Bildschirm als leere 16:9-Fläche frontal zur Kamera zeigt.',
          en: 'A person at home with a personal AI financial companion on a large tablet whose screen faces the camera as an empty 16:9 surface.',
          fr: 'Une personne chez elle avec son compagnon financier IA personnel sur une grande tablette, dont l’écran, surface vierge au format 16:9, fait face à la caméra.',
        },
      },
      title: { de: 'Demo Liquid: der Kunde entscheidet auf AI-Basis', en: 'Liquid demo: the customer decides on an AI basis', fr: 'Démo Liquid : le client décide en s’appuyant sur l’IA' },
      text: {
        de: 'In der Demo entscheidet **der Kunde auf AI-Basis**. Empfehlungen, Simulationen und Begründungen werden vorbereitet.',
        en: 'In the demo, **the customer decides on an AI basis**. Recommendations, simulations and rationales are prepared in advance.',
        fr: 'Dans la démo, **le client décide en s’appuyant sur l’IA**. Recommandations, simulations et justifications sont préparées en amont.',
      },
      buttonLabel: { de: 'Demo Liquid starten', en: 'Start the Liquid demo', fr: 'Lancer la démo Liquid' },
      // Bildschirmaufnahme der Liquid-Demo (Aurora Bank, 1234×642, Browserleiste
      // abgeschnitten, 4,4 MB) aus dem Upload-Ordner; der Pfad gilt relativ zu
      // dist/index.html. WebM als
      // Rückfall für Browser ohne H.264 (z. B. Chromium ohne Codecs).
      handoff: {
        kind: 'video',
        src: '../upload/liquid-demo.mp4',
        webm: '../upload/liquid-demo.webm',
        poster: '../upload/liquid-demo.jpg',
        title: { de: 'Demo Liquid', en: 'Liquid demo', fr: 'Démo Liquid' },
      },
    },
  },

  // ── 02 Markt & Vertrieb · 1. OG links (Advisory) ──────────────────────────
  {
    id: 'vertrieb',
    kapitel: '02',
    label: { de: 'Markt & Vertrieb', en: 'Sales & Distribution', fr: 'Commercial & Distribution' },
    ort: { de: 'Erdgeschoss rechts (Beratung)', en: 'Ground floor right (advisory)', fr: 'Rez-de-chaussée droite (conseil)' },
    keyObject: '„VERTRIEBS-COCKPIT"-Screen',
    zone: { centerX: 75, centerY: 77.5, width: 39.6, height: 19.8, labelX: 75, labelY: 71.6, hitWidth: 35, hitHeight: 17 },
    vision: {
      de: '2030 verkaufen wir keine Produkte mehr, sondern **orchestrieren Lösungen entlang der Ziele unserer Kunden**. KI kombiniert Finanz-, Service- und Ökosystemleistungen in Echtzeit. Unsere Berater werden zu **KI-augmentierten Sparringspartnern**, die bei komplexen Entscheidungen den Unterschied machen, während Standardvorgänge autonom laufen. Die Kundenbeziehung wird **permanent, kanalübergreifend und hyperpersonalisiert**.',
      en: 'By 2030 we no longer sell products but **orchestrate solutions around our customers’ goals**. AI combines financial, service and ecosystem capabilities in real time. Our advisors become **AI-augmented sparring partners** who make the difference on complex decisions, while standard transactions run autonomously. The customer relationship becomes **permanent, cross-channel and hyper-personalised**.',
      fr: 'En 2030, nous ne vendons plus de produits : nous **orchestrons des solutions autour des objectifs de nos clients**. L’IA combine en temps réel prestations financières, de service et d’écosystème. Nos conseillers deviennent des **sparring-partners augmentés par l’IA**, qui font la différence dans les décisions complexes, tandis que les opérations courantes se déroulent de manière autonome. La relation client devient **permanente, omnicanale et hyperpersonnalisée**.',
    },
    businessCase: {
      de: 'Exemplarisch (illustrativ): KI-augmentierte Beratung steigert die Beraterproduktivität um **25–30 %** und den Ertrag je Kunde um **10–15 %**. Bei 400 Berater ergibt das rund **15–20 Mio € p.a.**, bei zugleich höherer Abschlussqualität durch Lösungsorchestrierung.',
      en: 'Illustrative example: AI-augmented advisory raises advisor productivity by **25–30 %** and revenue per customer by **10–15 %**. Across 400 advisors that is roughly **€15–20m p.a.**, with higher deal quality from solution orchestration.',
      fr: 'À titre illustratif : le conseil augmenté par l’IA accroît la productivité des conseillers de **25–30 %** et les revenus par client de **10–15 %**. Pour 400 conseillers, cela représente environ **15–20 M€ par an**, avec en outre une meilleure qualité des ventes grâce à l’orchestration de solutions.',
    },
    hypotheses: [
      {
        title: { de: 'Vom Produktvertrieb zum Lösungsorchestrator', en: 'From product sales to solution orchestrator', fr: 'Du distributeur de produits à l’orchestrateur de solutions' },
        image: {
          src: './images/Kapitel 2_1.png',
          alt: {
            de: 'Status Quo: produktzentriertes Verkaufsgespräch mit Broschüren. 2030: Berater und Kunde gestalten gemeinsam eine maßgeschneiderte Lösung mit holografischem KI-Display.',
            en: 'Status quo: a product-centric sales conversation with brochures. 2030: advisor and customer jointly design a tailored solution with a holographic AI display.',
            fr: 'Statu quo : entretien de vente centré sur le produit, avec brochures. En 2030 : conseiller et client conçoivent ensemble une solution sur mesure à l’aide d’un écran holographique d’IA.',
          },
        },
        statusQuo: {
          de: 'Bankvertrieb ist **produkt- und kanalzentriert** organisiert. Kundenbetreuung folgt standardisierten Modellen. Daten und Kanäle sind **fragmentiert**.',
          en: 'Bank distribution is organised in a **product- and channel-centric** way. Client service follows standardised models. Data and channels are **fragmented**.',
          fr: 'La distribution bancaire est organisée de manière **centrée sur les produits et les canaux**. La relation client obéit à des modèles standardisés. Données et canaux sont **fragmentés**.',
        },
        in2030: {
          de: 'Die Bank agiert als **kontext-basierter Lösungsorchestrator**: KI kombiniert Finanz-, Service- und Ökosystemleistungen dynamisch zu individuellen Lösungen. **Der Kunde definiert Ziel und Ausgangssituation** – nicht mehr das Produktportfolio.',
          en: 'The bank acts as a **context-based solution orchestrator**: AI dynamically combines financial, service and ecosystem capabilities into individual solutions. **The customer defines both the goal and the starting point** – no longer the product portfolio.',
          fr: 'La banque agit en **orchestrateur de solutions fondé sur le contexte** : l’IA combine dynamiquement prestations financières, de service et d’écosystème en solutions individualisées. **C’est le client qui définit l’objectif et la situation de départ** – et non plus le portefeuille de produits.',
        },
        leitfrage: {
          de: 'Wenn Kunden künftig nur noch ihr Ziel nennen und die KI in Echtzeit die passende Lösung orchestriert – was passiert dann mit Ihrem produktzentrierten Vertrieb?',
          en: 'If customers merely state their goal and AI orchestrates the fitting solution in real time – what then happens to your product-centric distribution?',
          fr: 'Si, demain, les clients se contentent d’indiquer leur objectif et que l’IA orchestre en temps réel la solution adaptée – qu’advient-il alors de votre distribution centrée sur les produits ?',
        },
      },
      {
        title: { de: 'Vom Kundenberater zu KI-augmentierten Strategieberatern', en: 'From client advisor to AI-augmented strategic advisor', fr: 'Des conseillers clientèle aux conseillers stratégiques augmentés par l’IA' },
        image: {
          src: './images/Kapitel 2_2.png',
          alt: {
            de: 'Status Quo: standardisiertes Beratungsgespräch nach Skript, KI nur kleines Tool. 2030: Berater als KI-augmentierter Sparringspartner mit reichem KI-Kontext-Display.',
            en: 'Status quo: a scripted, standardised advisory conversation with AI as a minor tool. 2030: the advisor as an AI-augmented sparring partner with a rich AI context display.',
            fr: 'Statu quo : entretien de conseil standardisé, suivant un script, où l’IA n’est qu’un outil d’appoint. En 2030 : le conseiller en sparring-partner augmenté par l’IA, avec un écran riche en contexte fourni par l’IA.',
          },
        },
        statusQuo: {
          de: 'Beratung ist **stark standardisiert** und auf Produkte sowie Effizienz ausgerichtet. KI wird primär als **Produktivitätswerkzeug** eingesetzt.',
          en: 'Advisory is **highly standardised** and geared towards products and efficiency. AI is used primarily as a **productivity tool**.',
          fr: 'Le conseil est **fortement standardisé** et axé sur les produits et l’efficacité. L’IA est utilisée avant tout comme **outil de productivité**.',
        },
        in2030: {
          de: 'Kundenberater agieren als **KI-augmentierte Sparringspartner** mit Branchen- und Kontextverständnis. Standardtransaktionen laufen autonom. **menschliche Beratung gewinnt bei komplexen Themen an Bedeutung**.',
          en: 'Client advisors act as **AI-augmented sparring partners** with industry and context understanding. Standard transactions run autonomously. **human advice gains importance on complex topics**.',
          fr: 'Les conseillers clientèle agissent en **sparring-partners augmentés par l’IA**, dotés d’une compréhension du secteur et du contexte. Les transactions standard se déroulent de manière autonome. **Le conseil humain gagne en importance sur les sujets complexes**.',
        },
      },
      {
        title: { de: 'Kundenschnittstelle wird permanent und hyperpersonalisiert', en: 'The customer interface becomes permanent and hyper-personalised', fr: 'L’interface client devient permanente et hyperpersonnalisée' },
        image: {
          src: './images/Kapitel 2_3.png',
          alt: {
            de: 'Status Quo: punktueller, reaktiver Kundenkontakt an fragmentiertem CRM. 2030: Agentensystem begleitet kanalübergreifend in Echtzeit auf mehreren Geräten.',
            en: 'Status quo: sporadic, reactive customer contact on a fragmented CRM. 2030: an agent system accompanies across channels in real time on multiple devices.',
            fr: 'Statu quo : contact client ponctuel et réactif via un CRM fragmenté. En 2030 : un système d’agents accompagne le client en temps réel, sur tous les canaux et sur plusieurs appareils.',
          },
        },
        statusQuo: {
          de: 'Kundeninteraktion erfolgt überwiegend **punktuell und reaktiv**. CRM- und Prozesslandschaften sind **fragmentiert** und wenig individualisiert.',
          en: 'Customer interaction is mostly **sporadic and reactive**. CRM and process landscapes are **fragmented** and barely individualised.',
          fr: 'L’interaction client est majoritairement **ponctuelle et réactive**. Les environnements CRM et les processus sont **fragmentés** et peu individualisés.',
        },
        in2030: {
          de: 'KI-basierte Agentensysteme begleiten Kunden **kontinuierlich und kanalübergreifend in Echtzeit**. **Hyperpersonalisierte Betreuung** und Produkte werden zum Standard.',
          en: 'AI-based agent systems accompany customers **continuously and across channels in real time**. **Hyper-personalised service** and products become the standard.',
          fr: 'Des systèmes d’agents fondés sur l’IA accompagnent les clients **en continu, sur tous les canaux et en temps réel**. **Un accompagnement et des produits hyperpersonnalisés** deviennent la norme.',
        },
      },
    ],
    activity: {
      image: {
        src: './bank-floor-sales-2.png',
        alt: {
          de: 'Over-the-Shoulder-Blick am Workstation-Desk auf einen großen, frontal stehenden 16:9-Monitor. Im Hintergrund das „MARKT & VERTRIEB"-Schild.',
          en: 'An over-the-shoulder view at the workstation desk onto a large, front-facing 16:9 monitor. In the background the “SALES & DISTRIBUTION” sign.',
          fr: 'Vue par-dessus l’épaule, au poste de travail, sur un grand écran 16:9 placé de face. À l’arrière-plan, le panneau « COMMERCIAL & DISTRIBUTION ».',
        },
      },
      title: { de: 'Vertriebscockpit: KI-augmentiert am Berater-Desktop', en: 'Sales cockpit: AI-augmented at the advisor’s desktop', fr: 'Cockpit commercial : augmenté par l’IA, sur le poste du conseiller' },
      text: {
        de: 'Der Berater bereitet sich auf den nächsten Termin vor. Das Vertriebscockpit läuft direkt auf seinem Monitor: **KI-augmentiert, kontextbasiert, lösungsorientiert**. Per Klick auf Vollbild.',
        en: 'The advisor prepares for the next meeting. The sales cockpit runs directly on the monitor: **AI-augmented, context-based, solution-oriented**. One click to go full screen.',
        fr: 'Le conseiller prépare son prochain rendez-vous. Le cockpit commercial s’affiche directement sur son écran : **augmenté par l’IA, fondé sur le contexte, orienté solutions**. Un clic suffit pour passer en plein écran.',
      },
      buttonLabel: { de: 'Vertriebscockpit im Vollbild', en: 'Sales cockpit full screen', fr: 'Cockpit commercial en plein écran' },
      handoff: {
        kind: 'iframe',
        url: VERTRIEBSCOCKPIT_URL,
        title: { de: 'KI-Arbeitsplatz · Vertriebscockpit (Live)', en: 'AI Workplace · Sales Cockpit (live)', fr: 'Poste de travail IA · Cockpit commercial (en direct)' },
      },
      // Bildschirmfläche des Monitors in „bank-floor-sales-2.png" (1672×941),
      // pixelgenau vermessen (graue Fläche innerhalb des schwarzen Rahmens:
      // x 570–1276, y 202–600 px). Die Anteile beziehen sich auf das BILD; der
      // Reader rechnet sie auf den per object-fit beschnittenen Rahmen um und
      // legt das iframe hauchdünn über die Kante (ScreenIframe) — vorher blieb
      // ringsum ein grauer Saum. Klick auf den Button → Vollbild.
      screenOverlay: {
        url: VERTRIEBSCOCKPIT_URL,
        title: { de: 'KI-Arbeitsplatz · Vertriebscockpit (Live)', en: 'AI Workplace · Sales Cockpit (live)', fr: 'Poste de travail IA · Cockpit commercial (en direct)' },
        leftPct: 34.09,
        topPct: 21.47,
        widthPct: 42.28,
        heightPct: 42.40,
      },
    },
  },

  // ── 03 Marktfolge · 1. OG rechts (Backoffice-Großraum) ────────────────────
  {
    id: 'marktfolge',
    kapitel: '03',
    label: { de: 'Marktfolge', en: 'Operations', fr: 'Opérations' },
    ort: { de: '1. OG rechts (Backoffice-Großraum)', en: '1st floor right (open-plan back office)', fr: '1er étage droite (open space back-office)' },
    keyObject: '„WORKFLOW AUTOMATION"-Screen',
    zone: { centerX: 75, centerY: 58, width: 39.6, height: 19.4, labelX: 75, labelY: 52.2, hitWidth: 35, hitHeight: 17 },
    vision: {
      de: 'Unsere Marktfolge entwickelt sich 2030 **vom internen Kostenblock zur wertschöpfenden Plattform**. Standardvorfälle laufen als **vollautonome Dunkelverarbeitung Ende-zu-Ende**, Menschen lösen nur noch komplexe Sonderfälle. Wir entscheiden bewusst, **was intern bleibt und was ein orchestriertes Ökosystem übernimmt, und bieten unsere besten Services als skalierbares Banking-as-a-Service für Dritte an**.',
      en: 'By 2030 our operations evolve **from an internal cost block into a value-creating platform**. Standard cases run as **fully autonomous straight-through processing end-to-end**, while people only resolve complex exceptions. We deliberately decide **what stays in-house and what an orchestrated ecosystem takes over, and offer our best services as scalable banking-as-a-service to third parties**.',
      fr: 'En 2030, nos opérations passent **d’un poste de coûts interne à une plateforme créatrice de valeur**. Les dossiers standard font l’objet d’un **traitement entièrement automatisé et autonome de bout en bout (STP)** ; l’humain n’intervient plus que sur les cas particuliers complexes. Nous décidons délibérément **ce qui reste en interne et ce qu’un écosystème orchestré prend en charge, et proposons nos meilleurs services à des tiers sous forme de banking-as-a-service évolutif**.',
    },
    businessCase: {
      de: 'Exemplarisch (illustrativ): Dunkelverarbeitung senkt die Stückkosten der Marktfolge um **40–60 %**. Bei rund 2 Mio Vorgängen p.a. sind das etwa **10–14 Mio € Einsparung p.a.**. Banking-as-a-Service für Dritte eröffnet zusätzlich neue Erlösquellen.',
      en: 'Illustrative example: Straight-through processing cuts operations unit costs by **40–60 %**. At around 2 million cases p.a. that is roughly **€10–14m savings p.a.**. Banking-as-a-service for third parties opens additional revenue streams.',
      fr: 'À titre illustratif : le traitement automatisé (STP) réduit les coûts unitaires des opérations de **40–60 %**. Pour environ 2 millions de dossiers par an, cela représente quelque **10–14 M€ d’économies par an**. Le banking-as-a-service pour des tiers ouvre en outre de nouvelles sources de revenus.',
    },
    hypotheses: [
      {
        title: { de: 'Marktfolge wird zur autonomen Dunkelverarbeitung', en: 'Operations become autonomous straight-through processing', fr: 'Les opérations passent au traitement automatisé autonome' },
        image: {
          src: './images/Kapitel 3_1.png',
          alt: {
            de: 'Status Quo: Back-Office bearbeitet manuell Papierakten an Legacy-Bildschirmen. 2030: vollautonome Dunkelverarbeitung, Mensch nur bei einem komplexen Sonderfall.',
            en: 'Status quo: the back office manually processes paper files at legacy screens. 2030: fully autonomous straight-through processing, with a human only for a complex exception.',
            fr: 'Statu quo : le back-office traite manuellement des dossiers papier sur des écrans de systèmes historiques. En 2030 : traitement automatisé entièrement autonome, l’humain n’intervenant que sur un cas particulier complexe.',
          },
        },
        statusQuo: {
          de: 'Marktfolge ist geprägt von **fragmentierten Prozessen, Legacy-Systemen** und hohen **manuellen Bearbeitungsanteilen**.',
          en: 'Operations are characterised by **fragmented processes, legacy systems** and high **manual processing shares**.',
          fr: 'Les opérations se caractérisent par des **processus fragmentés, des systèmes historiques** et une forte **part de traitement manuel**.',
        },
        in2030: {
          de: 'Standardisierte Geschäftsvorfälle laufen **vollständig autonom**. KI steuert Kredit-, KYC- und Abwicklungsprozesse **Ende-zu-Ende**. Menschen bearbeiten nur (komplexe) Sonderfälle.',
          en: 'Standardised transactions run **fully autonomously**. AI manages credit, KYC and settlement processes **end-to-end**. People only handle (complex) exceptions.',
          fr: 'Les opérations standardisées se déroulent de manière **entièrement autonome**. L’IA pilote les processus de crédit, de KYC et de règlement **de bout en bout**. L’humain ne traite plus que les cas particuliers (complexes).',
        },
      },
      {
        title: { de: 'Interne Wertschöpfungskette bricht auf', en: 'The internal value chain breaks open', fr: 'La chaîne de valeur interne se déconstruit' },
        image: {
          src: './images/Kapitel 3_2.png',
          alt: {
            de: 'Status Quo: geschlossenes Back-Office, alles intern. 2030: modulare externe Utility-Plattformen übernehmen Standardbetrieb, die Bank orchestriert ein Ökosystem.',
            en: 'Status quo: a closed back office, everything in-house. 2030: modular external utility platforms take over standard operations while the bank orchestrates an ecosystem.',
            fr: 'Statu quo : back-office fermé, tout en interne. En 2030 : des plateformes mutualisées externes et modulaires prennent en charge l’exploitation courante ; la banque orchestre un écosystème.',
          },
        },
        statusQuo: {
          de: 'Betriebs- und Marktfolgeleistungen werden überwiegend **intern erbracht**. Kooperationen und Auslagerungen **bleiben begrenzt**.',
          en: 'Operating and back-office services are largely **provided in-house**. Cooperations and outsourcing **remain limited**.',
          fr: 'Les prestations d’exploitation et de back-office sont majoritairement **assurées en interne**. Les coopérations et externalisations **restent limitées**.',
        },
        in2030: {
          de: 'Externe Plattformen und **KI-gestützte Utility-Modelle** übernehmen große Teile standardisierter Betriebsleistungen. Banken **orchestrieren modulare Service-Ökosysteme**.',
          en: 'External platforms and **AI-supported utility models** take over large parts of standardised operations. Banks **orchestrate modular service ecosystems**.',
          fr: 'Des plateformes externes et des **modèles mutualisés (utilities) assistés par l’IA** prennent en charge une grande partie des prestations d’exploitation standardisées. Les banques **orchestrent des écosystèmes de services modulaires**.',
        },
      },
      {
        title: { de: 'Marktfolge wird zur skalierbaren Serviceplattform', en: 'Operations become a scalable service platform', fr: 'Les opérations deviennent une plateforme de services évolutive' },
        image: {
          src: './images/Kapitel 3_3.png',
          alt: {
            de: 'Status Quo: Operations als interne Kostenstelle. 2030: skalierbare Banking-as-a-Service-Plattform, die standardisierte Services für Dritte anbietet.',
            en: 'Status quo: operations as an internal cost centre. 2030: a scalable banking-as-a-service platform offering standardised services to third parties.',
            fr: 'Statu quo : les opérations comme centre de coûts interne. En 2030 : une plateforme évolutive de banking-as-a-service, qui propose des services standardisés à des tiers.',
          },
        },
        statusQuo: {
          de: 'Betriebs- und Abwicklungseinheiten gelten primär als **interne Kosten- und Kontrollfunktion**.',
          en: 'Operating and settlement units are seen primarily as an **internal cost and control function**.',
          fr: 'Les unités d’exploitation et de traitement sont avant tout perçues comme une **fonction interne de coût et de contrôle**.',
        },
        in2030: {
          de: 'Große Banken entwickeln Marktfolge- und Serviceplattformen zu **eigenständigen Geschäftsmodellen** und bieten **standardisierte Banking-Services für Dritte** an.',
          en: 'Large banks develop operations and service platforms into **standalone business models** and offer **standardised banking services to third parties**.',
          fr: 'Les grandes banques font de leurs plateformes d’opérations et de services des **modèles économiques à part entière** et proposent des **services bancaires standardisés à des tiers**.',
        },
      },
      {
        // NEU aus Workshop-Feedback (gelbes Kommentarfeld): Regulatorik/Compliance
        // wird aufgebrochen, weil sie im Lifecycle berücksichtigt wird.
        title: { de: 'Regulatorik & Compliance wandern in den Lifecycle', en: 'Regulation & compliance move into the lifecycle', fr: 'La réglementation et la conformité s’intègrent au cycle de vie' },
        image: {
          src: './images/Kapitel 3_4.png',
          alt: {
            de: 'Status Quo: nachgelagerte Compliance-Prüfung als separater Kontrollschritt nach dem Prozess. 2030: Regulatorik ist als „compliant by design" direkt in den automatisierten Prozess-Lifecycle eingebaut.',
            en: 'Status quo: downstream compliance check as a separate control step after the process. 2030: regulation is built directly into the automated process lifecycle as “compliant by design”.',
            fr: 'Statu quo : contrôle de conformité en aval, comme étape de contrôle distincte après le processus. En 2030 : la réglementation est intégrée directement au cycle de vie automatisé des processus, selon le principe « compliant by design ».',
          },
        },
        statusQuo: {
          de: 'Regulatorik und Compliance sind der Marktfolge **nachgelagert** – als **separate Prüf- und Kontrollschritte**, die Durchlaufzeiten verlängern.',
          en: 'Regulation and compliance sit **downstream** of operations – as **separate check and control steps** that extend throughput times.',
          fr: 'La réglementation et la conformité interviennent **en aval** des opérations – sous forme d’**étapes distinctes de vérification et de contrôle**, qui allongent les délais de traitement.',
        },
        in2030: {
          de: 'Regulatorische und Compliance-Anforderungen sind **direkt in den Prozess-Lifecycle eingebaut** („compliant by design"). Die klassische, aufgesetzte Compliance-Schicht **bricht auf** – Prüfungen laufen automatisch im Prozess mit.',
          en: 'Regulatory and compliance requirements are **built directly into the process lifecycle** (“compliant by design”). The classic, bolted-on compliance layer **breaks open** – checks run automatically within the process.',
          fr: 'Les exigences réglementaires et de conformité sont **intégrées directement au cycle de vie des processus** (« compliant by design »). La couche de conformité classique, plaquée a posteriori, **se dissout** – les contrôles s’exécutent automatiquement au fil du processus.',
        },
      },
    ],
    activity: {
      image: {
        src: './images/Kapitel 3_Demo.png',
        alt: {
          de: 'Strategie-Workshop in einem modernen Bank-Besprechungsraum mit Entscheidungskarten und einem Board mit drei Rollen-Optionen.',
          en: 'A strategy workshop in a modern bank meeting room with decision cards and a board showing three role options.',
          fr: 'Atelier stratégique dans une salle de réunion moderne d’une banque, avec des cartes de décision et un tableau présentant trois options de rôle.',
        },
      },
      title: {
        de: 'Ein Tag in Banking Operations 2030: Maras Arbeitstag',
        en: 'A day in banking operations 2030: Mara’s working day',
        fr: 'Une journée dans les opérations bancaires de 2030 : Mara au travail',
      },
      text: {
        de: 'Mara, Operations-Spezialistin, durchläuft die Stationen eines Montags, von 07:00 bis 17:00. **Standardfälle laufen autonom Ende-zu-Ende; Menschen entscheiden nur noch dort, wo es auf ihr Urteil ankommt.** Die Demo läuft im Vollbild als Bild- und Videostrecke, Station für Station; „Overview" führt hierher zurück.',
        en: 'Mara, an operations specialist, walks through the stations of a Monday, from 07:00 to 17:00. **Standard cases run autonomously end to end; people decide only where their judgement matters.** The demo runs full screen as an image and video sequence, station by station; “Overview” brings you back here.',
        fr: 'Mara, spécialiste des opérations, parcourt les étapes d’un lundi, de 7 h à 17 h. **Les cas standard sont traités de manière autonome de bout en bout ; l’humain ne décide plus que là où son jugement compte.** La démo se déroule en plein écran sous forme de séquence d’images et de vidéos, étape par étape ; « Overview » vous ramène ici.',
      },
      buttonLabel: { de: 'Demo im Vollbild starten: Ein Tag in Banking Operations 2030', en: 'Start the demo full screen: a day in banking operations 2030', fr: 'Lancer la démo en plein écran : une journée dans les opérations bancaires de 2030' },
      // Kein iframe: die Strecke ist Teil dieser App und läuft im Vollbild
      // (#/operations/-1 — zugleich der teilbare Vollbild-Link); „Overview"
      // führt zurück in dieses Kapitel.
      handoff: { kind: 'operations' },
    },
  },

  // ── 04 Corporate Services · 2. OG links (Corporate / HR) ──────────────────
  {
    id: 'corporate',
    kapitel: '04',
    label: {
      de: 'Organisationsentwicklung (HR & Corporate Services)',
      en: 'Organisational Development (HR & Corporate Services)',
      fr: 'Développement organisationnel (RH & Corporate Services)',
    },
    ort: { de: '1. OG links (Corporate / HR)', en: '1st floor left (Corporate / HR)', fr: '1er étage gauche (Corporate / RH)' },
    keyObject: '„ORGANISATION"-Screen',
    zone: { centerX: 25.1, centerY: 58, width: 40.3, height: 19.4, labelX: 25.1, labelY: 52.2, hitWidth: 35, hitHeight: 17 },
    vision: {
      de: 'Corporate Services sind 2030 der **Enabler des Wandels**. Lernen ist kein Event mehr, sondern **kontinuierlicher, KI-gestützter Skill-Aufbau** für neue Profile wie den AI-Translator. Unsere Organisation wird **nicht mehr von starren Strukturen, sondern von Skills, Rollen und Teams in Echtzeit gesteuert**, und datenbasierte, vorausschauende Workforce-Steuerung wird zum Wettbewerbsvorteil.',
      en: 'In 2030, Corporate Services are the **enabler of change**. Learning is no longer an event but **continuous, AI-supported skill building** for new profiles such as the AI translator. Our organisation is **no longer steered by rigid structures but by skills, roles and teams in real time**, and data-driven, forward-looking workforce management becomes a competitive advantage.',
      fr: 'En 2030, les Corporate Services sont le **catalyseur du changement**. L’apprentissage n’est plus un événement ponctuel, mais un **développement continu des compétences, assisté par l’IA**, pour de nouveaux profils comme l’AI Translator. Notre organisation n’est **plus pilotée par des structures rigides, mais par les compétences, les rôles et les équipes en temps réel**, et un pilotage des effectifs fondé sur les données et prospectif devient un avantage concurrentiel.',
    },
    businessCase: {
      de: 'Exemplarisch (illustrativ): Reskilling statt Neueinstellung spart je 100 umgeschulten Stellen rund **3–5 Mio € p.a.** (Recruiting, Fluktuation, Anlernzeit). Immersives, KI-personalisiertes Lernen verkürzt die Time-to-Competency um **30–50 %**.',
      en: 'Illustrative example: Reskilling instead of hiring saves roughly **€3–5m p.a. per 100 reskilled roles** (recruiting, attrition, ramp-up). Immersive, AI-personalised learning shortens time-to-competency by **30–50 %**.',
      fr: 'À titre illustratif : miser sur le reskilling plutôt que sur le recrutement permet d’économiser environ **3–5 M€ par an** pour 100 postes reconvertis (recrutement, turnover, temps de formation). L’apprentissage immersif et personnalisé par l’IA réduit le délai d’accès à la pleine compétence (time-to-competency) de **30–50 %**.',
    },
    hypotheses: [
      {
        title: { de: 'Vom Training zum kontinuierlichen Skill-Aufbau', en: 'From training to continuous skill building', fr: 'De la formation au développement continu des compétences' },
        image: {
          src: './images/Kapitel 4_1.png',
          alt: {
            de: 'Status Quo: isoliertes Classroom-Training. 2030: kontinuierlicher, personalisierter Skill-Aufbau mit adaptivem KI-Lernbegleiter.',
            en: 'Status quo: isolated classroom training. 2030: continuous, personalised skill building with an adaptive AI learning companion.',
            fr: 'Statu quo : sessions de formation en salle isolées. En 2030 : développement continu et personnalisé des compétences avec un compagnon d’apprentissage IA adaptatif.',
          },
        },
        statusQuo: {
          de: 'Weiterbildungsinitiativen sind oft **nicht entlang zukünftiger Kompetenzbedarfe** (z. B. Daten- oder KI-Kompetenzen) ausgerichtet, sondern finden **isoliert und reaktiv** statt.',
          en: 'Upskilling initiatives are often **not aligned with future skill needs** (e.g. data or AI skills) but happen **in isolation and reactively**.',
          fr: 'Les initiatives de formation ne sont souvent **pas alignées sur les besoins futurs en compétences** (p. ex. données ou IA), mais se déroulent **de manière isolée et réactive**.',
        },
        in2030: {
          de: 'HR als **„Enabler" des Wandels**: Fokus liegt auf **Upskilling / Reskilling** für neue Jobprofile („AI-Translator") und der Etablierung einer agilen Lernkultur.',
          en: 'HR as the **“enabler” of change**: the focus is on **upskilling / reskilling** for new job profiles (“AI translator”) and on establishing an agile learning culture.',
          fr: 'Les RH, **« catalyseur » du changement** : l’accent est mis sur l’**upskilling / reskilling** pour de nouveaux métiers (« AI Translator ») et sur l’instauration d’une culture d’apprentissage agile.',
        },
      },
      {
        title: { de: 'Organisation wird durch Skills gesteuert, nicht durch Strukturen', en: 'The organisation is steered by skills, not by structures', fr: 'L’organisation est pilotée par les compétences, non par les structures' },
        image: {
          src: './images/Kapitel 4_2.png',
          alt: {
            de: 'Status Quo: starres funktionales Organigramm mit Silos. 2030: skills-getriebene, flexible Organisation, KI orchestriert Rollen und Teams als fluides Netzwerk.',
            en: 'Status quo: a rigid functional org chart with silos. 2030: a skills-driven, flexible organisation in which AI orchestrates roles and teams as a fluid network.',
            fr: 'Statu quo : organigramme fonctionnel rigide, cloisonné en silos. En 2030 : organisation flexible, pilotée par les compétences ; l’IA orchestre rôles et équipes en un réseau fluide.',
          },
        },
        statusQuo: {
          de: 'Organisationen sind **funktional und silo-orientiert** aufgebaut. Rollen und Zusammenarbeit folgen **stabilen Hierarchien und festen Stellenprofilen**.',
          en: 'Organisations are built **functionally and along silos**. Roles and collaboration follow **stable hierarchies and fixed job profiles**.',
          fr: 'Les organisations sont structurées de manière **fonctionnelle et en silos**. Les rôles et la collaboration suivent des **hiérarchies stables et des fiches de poste figées**.',
        },
        in2030: {
          de: 'Organisation wird **flexibel gesteuert** – AI orchestriert **Skills, Rollen und Teams in Echtzeit**.',
          en: 'The organisation is **steered flexibly** – AI orchestrates **skills, roles and teams in real time**.',
          fr: 'L’organisation est **pilotée avec souplesse** – l’IA orchestre **compétences, rôles et équipes en temps réel**.',
        },
      },
      {
        title: { de: 'Workforce-Steuerung wird zum Wettbewerbsvorteil', en: 'Workforce management becomes a competitive advantage', fr: 'Le pilotage des effectifs devient un avantage concurrentiel' },
        image: {
          src: './images/Kapitel 4_3.png',
          alt: {
            de: 'Status Quo: administrative, reaktive HR-Verwaltung. 2030: datenbasierte, vorausschauende Workforce-Steuerung auf einem Predictive-Analytics-Dashboard.',
            en: 'Status quo: administrative, reactive HR administration. 2030: data-driven, forward-looking workforce management on a predictive analytics dashboard.',
            fr: 'Statu quo : gestion RH administrative et réactive. En 2030 : pilotage des effectifs fondé sur les données et prospectif, sur un tableau de bord d’analyse prédictive.',
          },
        },
        // Hinweis: Status-Quo im Deck fehlerhaft (Copy-Paste-Bug). Platzhalter
        // gemäß Vorgabe — bei Vorliegen des Originaltexts ersetzen.
        statusQuo: {
          de: 'Workforce-Planung erfolgt überwiegend **administrativ und reaktiv**. Die Steuerung von Skills und Transformation ist **wenig datenbasiert** und kaum vorausschauend.',
          en: 'Workforce planning is mostly **administrative and reactive**. Steering of skills and transformation is **barely data-driven** and hardly forward-looking.',
          fr: 'La planification des effectifs est essentiellement **administrative et réactive**. Le pilotage des compétences et de la transformation est **peu fondé sur les données** et rarement prospectif.',
        },
        in2030: {
          de: 'Corporate Services steuern Workforce und Transformation **datenbasiert und vorausschauend**.',
          en: 'Corporate Services steer workforce and transformation **in a data-driven and forward-looking way**.',
          fr: 'Les Corporate Services pilotent effectifs et transformation **à partir des données et par anticipation**.',
        },
      },
      {
        // NEU aus Workshop-Feedback: Wie passiert Weiterbildung? (VR-Training,
        // KI leitet aus der Skill-Veränderung ein Trainingsprogramm ab.)
        title: { de: 'Lernen wird immersiv und KI-personalisiert', en: 'Learning becomes immersive and AI-personalised', fr: 'L’apprentissage devient immersif et personnalisé par l’IA' },
        image: {
          src: './images/Kapitel 4_4.png',
          alt: {
            de: 'Status Quo: klassisches Classroom-/E-Learning ohne Bezug zur individuellen Skill-Lücke. 2030: Mitarbeitende trainieren mit VR-Brille, während die KI aus der Skill-Veränderung automatisch ein passgenaues Trainingsprogramm ableitet.',
            en: 'Status quo: classic classroom/e-learning with no link to the individual skill gap. 2030: employees train with VR glasses while the AI automatically derives a tailored training programme from their skill changes.',
            fr: 'Statu quo : formation classique en salle ou en e-learning, sans lien avec l’écart de compétences individuel. En 2030 : les collaborateurs s’entraînent avec un casque de réalité virtuelle, tandis que l’IA déduit automatiquement de l’évolution de leurs compétences un programme de formation sur mesure.',
          },
        },
        statusQuo: {
          de: 'Weiterbildung findet in **klassischen Formaten** (Präsenz, E-Learning) statt und ist **selten auf die individuelle Skill-Lücke** zugeschnitten.',
          en: 'Upskilling happens in **classic formats** (classroom, e-learning) and is **rarely tailored to the individual skill gap**.',
          fr: 'La formation se déroule dans des **formats classiques** (présentiel, e-learning) et est **rarement adaptée à l’écart de compétences individuel**.',
        },
        in2030: {
          de: 'Training wird **immersiv** durchgeführt (z. B. per VR/AR). **KI leitet aus der individuellen Skill-Veränderung automatisch ein passgenaues Trainingsprogramm ab** – kontinuierlich und im Arbeitsfluss.',
          en: 'Training becomes **immersive** (e.g. via VR/AR). **AI automatically derives a tailored training programme from each person’s skill changes** – continuously and in the flow of work.',
          fr: 'La formation devient **immersive** (p. ex. en réalité virtuelle ou augmentée). **L’IA déduit automatiquement de l’évolution individuelle des compétences un programme de formation sur mesure** – en continu et dans le flux de travail.',
        },
      },
      {
        // NEU aus Workshop-Feedback: Demografischer Wandel — auch 50+ müssen
        // grundlegend neue Skills lernen.
        title: { de: 'Demografischer Wandel erzwingt lebenslanges Reskilling', en: 'Demographic change forces lifelong reskilling', fr: 'L’évolution démographique impose un reskilling tout au long de la vie' },
        image: {
          src: './images/Kapitel 4_5.png',
          alt: {
            de: 'Status Quo: Qualifizierung konzentriert sich auf junge Mitarbeitende. 2030: gemischte, auch ältere Belegschaft lernt selbstverständlich grundlegend neue Fähigkeiten mit KI-Lernbegleitung.',
            en: 'Status quo: qualification focuses on younger employees. 2030: a mixed, also older workforce naturally learns fundamentally new skills with AI learning support.',
            fr: 'Statu quo : la qualification se concentre sur les jeunes collaborateurs. En 2030 : des équipes mixtes, y compris des collaborateurs plus âgés, acquièrent naturellement des compétences fondamentalement nouvelles avec un accompagnement d’apprentissage par l’IA.',
          },
        },
        statusQuo: {
          de: 'Qualifizierung ist überwiegend auf **frühe Karrierephasen** ausgerichtet. Ältere Belegschaften werden bei grundlegend neuen Kompetenzen **selten systematisch mitgenommen**.',
          en: 'Qualification is mostly geared towards **early career stages**. Older parts of the workforce are **rarely systematically included** in fundamentally new competencies.',
          fr: 'La qualification est essentiellement orientée vers les **débuts de carrière**. Les collaborateurs plus âgés sont **rarement embarqués de manière systématique** dans l’acquisition de compétences fondamentalement nouvelles.',
        },
        in2030: {
          de: 'Die alternde Belegschaft lernt **kontinuierlich neue Skills** – auch mit 50+ müssen dieselben Menschen **grundlegend neue Fähigkeiten** aufbauen. **Lebenslanges Reskilling** wird zum Normalfall und zur strategischen Notwendigkeit.',
          en: 'The ageing workforce **continuously learns new skills** – even at 50+, the same people must build **fundamentally new capabilities**. **Lifelong reskilling** becomes the norm and a strategic necessity.',
          fr: 'Des effectifs vieillissants acquièrent **en continu de nouvelles compétences** – même à 50 ans et plus, les mêmes personnes doivent développer des **capacités fondamentalement nouvelles**. Le **reskilling tout au long de la vie** devient la norme et une nécessité stratégique.',
        },
      },
    ],
    activity: {
      image: {
        src: './images/Kapitel 4_Demo.png',
        alt: {
          de: 'Co-Creation-Workshop an Flipchart und Whiteboard voller Haftnotizen und Gestaltungsdimensionen.',
          en: 'A co-creation workshop at a flipchart and whiteboard full of sticky notes and design dimensions.',
          fr: 'Atelier de co-création devant un paperboard et un tableau blanc couverts de post-it et d’axes de conception.',
        },
      },
      title: { de: 'Co-Creation: Organisation unter Transformationsdruck', en: 'Co-creation: organisation under transformation pressure', fr: 'Co-création : l’organisation sous pression de transformation' },
      text: {
        de: 'Co-Creation: **Organisation unter Transformationsdruck**. Zielbild für 2030 entlang **vier Dimensionen**: Skill-Aufbau, Organisationslogik, Workforce-Steuerung, Rolle Corporate Services.',
        en: 'Co-creation: **organisation under transformation pressure**. A 2030 target picture along **four dimensions**: skill building, organisational logic, workforce management, role of Corporate Services.',
        fr: 'Co-création : **l’organisation sous pression de transformation**. Modèle cible pour 2030 selon **quatre dimensions** : développement des compétences, logique organisationnelle, pilotage des effectifs, rôle des Corporate Services.',
      },
      buttonLabel: { de: 'Zur Co-Creation', en: 'Go to co-creation', fr: 'Accéder à la co-création' },
      handoff: { kind: 'cocreation', variant: 'organisation' },
    },
  },

  // ── 05 Technologie / IT · 2. OG rechts (Serverraum) ───────────────────────
  {
    id: 'it',
    kapitel: '05',
    label: { de: 'Technologie / IT', en: 'Technology / IT', fr: 'Technologie / IT' },
    ort: { de: '2. OG rechts (Technology)', en: '2nd floor right (technology)', fr: '2e étage droite (Technology)' },
    keyObject: 'Monitoring-Arbeitsplatz am Server-Rack',
    zone: { centerX: 75, centerY: 37.2, width: 39.6, height: 22.1, labelX: 75, labelY: 30.6, hitWidth: 35, hitHeight: 19 },
    vision: {
      de: '2030 **entwickelt, testet und deployt sich unsere Software weitgehend selbst**. KI entscheidet autonom innerhalb der von uns gesetzten **Governance und Leitplanken**, während die IT zur **modularen, API-basierten Plattform** wird. Fachbereiche steuern diese Systeme zunehmend direkt. Die **Gatekeeper-Rolle der klassischen IT verschwindet**, und unser Vorsprung entsteht aus der Geschwindigkeit, mit der wir Anforderungen in Lösungen verwandeln.',
      en: 'By 2030 **our software largely develops, tests and deploys itself**. AI decides autonomously within the **governance and guardrails** we set, while IT becomes a **modular, API-based platform**. Business units increasingly steer these systems directly. The **gatekeeper role of classic IT disappears**, and our edge comes from the speed at which we turn requirements into solutions.',
      fr: 'En 2030, **notre logiciel se développe, se teste et se déploie en grande partie de lui-même**. L’IA décide de manière autonome dans le cadre de la **gouvernance et des garde-fous** que nous fixons, tandis que l’IT devient une **plateforme modulaire, fondée sur des API**. Les métiers pilotent de plus en plus directement ces systèmes. Le **rôle de gardien de l’IT classique disparaît**, et notre avance naît de la vitesse à laquelle nous transformons les besoins en solutions.',
    },
    businessCase: {
      de: 'Exemplarisch (illustrativ): Selbstoptimierende AI-Delivery senkt Entwicklungs- und Betriebskosten um **20–35 %**. Bei einem IT-Budget von 80 Mio € entspricht das rund **16–28 Mio € p.a.**, zusätzlich verkürzt sich die Time-to-Market drastisch.',
      en: 'Illustrative example: Self-optimising AI delivery cuts development and run costs by **20–35 %**. On an €80m IT budget that is roughly **€16–28m p.a.**, plus a drastic reduction in time-to-market.',
      fr: 'À titre illustratif : une delivery IA auto-optimisée réduit les coûts de développement et d’exploitation de **20–35 %**. Pour un budget IT de 80 M€, cela représente environ **16–28 M€ par an**, avec en outre une réduction drastique du time-to-market.',
    },
    hypotheses: [
      {
        title: { de: 'Selbstoptimierende AI-Delivery ersetzt Softwareentwicklung As-Is', en: 'Self-optimising AI delivery replaces software development as-is', fr: 'Une delivery IA auto-optimisée remplace le développement logiciel actuel' },
        image: {
          src: './images/Kapitel 5_1.png',
          alt: {
            de: 'Status Quo: Entwickler schreiben und testen Software manuell. 2030: selbstoptimierende AI-Delivery, Software baut/testet/deployt sich selbst, Mensch überwacht nur.',
            en: 'Status quo: developers write and test software manually. 2030: self-optimising AI delivery, software builds/tests/deploys itself while a human only supervises.',
            fr: 'Statu quo : les développeurs écrivent et testent le logiciel manuellement. En 2030 : delivery IA auto-optimisée, le logiciel se construit, se teste et se déploie lui-même, l’humain ne fait que superviser.',
          },
        },
        statusQuo: {
          de: 'Software wird in **linearen, deterministischen Entwicklungszyklen** **durch Menschen** erstellt, getestet und ausgerollt.',
          en: 'Software is created, tested and rolled out **by people** in **linear, deterministic development cycles**.',
          fr: 'Le logiciel est conçu, testé et déployé **par des humains** dans des **cycles de développement linéaires et déterministes**.',
        },
        in2030: {
          de: 'Software **entwickelt, testet und deployt sich kontinuierlich selbst** durch **AI-getriebene Systeme**. Die verbleibenden Teams **coden nicht mehr, sondern überwachen und steuern die KI** – ein grundlegender Rollenwandel.',
          en: 'Software **continuously develops, tests and deploys itself** through **AI-driven systems**. The remaining teams **no longer code but monitor and govern the AI** – a fundamental shift in roles.',
          fr: 'Le logiciel **se développe, se teste et se déploie de lui-même en continu** grâce à des **systèmes pilotés par l’IA**. Les équipes restantes **ne codent plus, elles supervisent et pilotent l’IA** – un changement de rôle fondamental.',
        },
      },
      {
        title: { de: 'Entscheidungen verlagern sich zur AI & IT wird zur orchestrierten Plattform', en: 'Decisions shift to AI & IT becomes an orchestrated platform', fr: 'Les décisions basculent vers l’IA et l’IT devient une plateforme orchestrée' },
        image: {
          src: './images/Kapitel 5_2.png',
          alt: {
            de: 'Status Quo: regelbasierte IT mit manuellen Freigaben und Monolith. 2030: AI entscheidet autonom in Leitplanken, IT als modulare, API-basierte Plattform.',
            en: 'Status quo: rule-based IT with manual approvals and a monolith. 2030: AI decides autonomously within guardrails, IT as a modular, API-based platform.',
            fr: 'Statu quo : IT fondée sur des règles, avec validations manuelles et système monolithique. En 2030 : l’IA décide de manière autonome dans des garde-fous, l’IT devient une plateforme modulaire fondée sur des API.',
          },
        },
        statusQuo: {
          de: 'IT steuert Systeme über **Regeln, Prozesse und manuelle Freigaben** mit klarer Kontrolle über Ergebnisse. Banken betreiben gewachsene, **monolithische IT-Landschaften** mit hoher Komplexität und geringer Anpassungsfähigkeit.',
          en: 'IT steers systems via **rules, processes and manual approvals** with clear control over outcomes. Banks run grown, **monolithic IT landscapes** with high complexity and low adaptability.',
          fr: 'L’IT pilote les systèmes par des **règles, des processus et des validations manuelles**, avec un contrôle clair des résultats. Les banques exploitent des **paysages IT monolithiques** hérités de leur histoire, d’une grande complexité et peu adaptables.',
        },
        in2030: {
          de: 'AI-Systeme **treffen eigenständig Entscheidungen**, während die Bank primär **Governance, Leitplanken und Kontrolle** definiert. Die IT wird zur **datengetriebenen Plattform, die sich in einem kontinuierlichen Loop selbst verbessert** – der entscheidende Vorteil ist die **Geschwindigkeit**, mit der aus Daten in Echtzeit neue Lösungen werden.',
          en: 'AI systems **make decisions independently**, while the bank primarily defines **governance, guardrails and control**. IT becomes a **data-driven platform that continuously improves itself in a feedback loop** – the decisive advantage is the **speed** at which data turns into new solutions in real time.',
          fr: 'Les systèmes d’IA **prennent des décisions de manière autonome**, tandis que la banque définit avant tout **la gouvernance, les garde-fous et le contrôle**. L’IT devient une **plateforme pilotée par les données, qui s’améliore elle-même en boucle continue** – l’avantage décisif réside dans la **vitesse** à laquelle les données en temps réel se transforment en nouvelles solutions.',
        },
      },
      {
        title: { de: 'Fachbereiche steuern direkt, IT verliert die Gatekeeper-Rolle', en: 'Business units steer directly, IT loses the gatekeeper role', fr: 'Les métiers pilotent directement, l’IT perd son rôle de gardien' },
        image: {
          src: './images/Kapitel 5_3.png',
          alt: {
            de: 'Status Quo: IT als separate Gatekeeper-Funktion, Fachbereich übergibt Anforderungen. 2030: Fachbereiche steuern AI-Systeme direkt selbst, Gatekeeping entfällt.',
            en: 'Status quo: IT as a separate gatekeeper function, with the business handing over requirements. 2030: business units steer AI systems directly themselves, and gatekeeping disappears.',
            fr: 'Statu quo : l’IT, fonction de gardien distincte, à qui les métiers transmettent leurs besoins. En 2030 : les métiers pilotent eux-mêmes directement les systèmes d’IA, le filtrage par l’IT disparaît.',
          },
        },
        statusQuo: {
          de: 'IT ist eine **eigenständige Funktion**, die Anforderungen aus dem Business umsetzt und Systeme betreibt. Wettbewerb entsteht durch **proprietäre Systeme und funktionale Differenzierung**.',
          en: 'IT is a **standalone function** that implements business requirements and runs systems. Competition arises from **proprietary systems and functional differentiation**.',
          fr: 'L’IT est une **fonction autonome** qui met en œuvre les besoins des métiers et exploite les systèmes. La concurrence repose sur des **systèmes propriétaires et la différenciation fonctionnelle**.',
        },
        in2030: {
          de: 'Fachbereich und IT verschmelzen zu **integrierten, vertikalen Delivery-Teams** – der Fachbereich ist **Teil des Teams**, nicht mehr Auftraggeber. IT als separater Gatekeeper **verschwindet**. Der Vorsprung entsteht aus der **Geschwindigkeit**, mit der diese Teams Anforderungen in Lösungen verwandeln.',
          en: 'Business and IT merge into **integrated, vertical delivery teams** – the business is **part of the team**, no longer a client handing over requirements. IT as a separate gatekeeper **disappears**. The edge comes from the **speed** at which these teams turn requirements into solutions.',
          fr: 'Métiers et IT fusionnent en **équipes de delivery intégrées et verticales** – les métiers **font partie de l’équipe** et ne sont plus donneurs d’ordre. L’IT en tant que gardien distinct **disparaît**. L’avance naît de la **vitesse** à laquelle ces équipes transforment les besoins en solutions.',
        },
      },
    ],
    activity: {
      image: {
        src: './images/Kapitel 5_Demo.png',
        alt: {
          de: 'Over-the-Shoulder-Blick eines IT-Engineers auf einen großen Desktop-Monitor, dessen Bildschirm als leere 16:9-Fläche frontal zur Kamera zeigt.',
          en: 'An over-the-shoulder view of an IT engineer onto a large desktop monitor whose screen faces the camera as an empty 16:9 surface.',
          fr: 'Vue par-dessus l’épaule d’un ingénieur IT face à un grand écran de bureau, dont la surface vide au format 16:9 fait face à la caméra.',
        },
      },
      title: { de: 'Demo SDLC AI-Platform: Software entwickelt sich selbst', en: 'SDLC AI platform demo: software develops itself', fr: 'Démo SDLC AI-Platform : le logiciel se développe lui-même' },
      text: {
        de: 'In der Demo **entwickelt, testet und deployt sich Software selbst**. Der Mensch definiert **Leitplanken und Governance**.',
        en: 'In the demo, **software develops, tests and deploys itself**. The human defines **guardrails and governance**.',
        fr: 'Dans la démo, **le logiciel se développe, se teste et se déploie de lui-même**. L’humain définit les **garde-fous et la gouvernance**.',
      },
      buttonLabel: { de: 'SDLC-Demo ansehen', en: 'Watch the SDLC demo', fr: 'Voir la démo SDLC' },
      // Das Video (DForge – AI SDLC, rund 800 MB) ist zu groß für Cloudflare
      // Pages (25 MB je Datei) und liegt in Microsoft Stream auf SharePoint;
      // die Bühne zeigt ein Standbild daraus und öffnet es in neuem Tab.
      handoff: {
        kind: 'extern',
        url: SDLC_VIDEO_URL,
        poster: '../upload/ai-sdlc-demo.jpg',
        title: { de: 'Forge · AI SDLC (Demo-Video)', en: 'Forge · AI SDLC (demo video)', fr: 'Forge · AI SDLC (vidéo de démo)' },
        hinweis: {
          de: 'Das Video liegt in Microsoft Stream auf SharePoint. Es öffnet sich in einem neuen Tab und braucht eine Deloitte-Anmeldung.',
          en: 'The video is hosted in Microsoft Stream on SharePoint. It opens in a new tab and requires a Deloitte sign-in.',
          fr: 'La vidéo est hébergée dans Microsoft Stream sur SharePoint. Elle s’ouvre dans un nouvel onglet et nécessite une connexion Deloitte.',
        },
      },
    },
  },

  // ── 06 Compliance & Risk · 3. OG links (Boardroom) ────────────────────────
  {
    id: 'compliance',
    kapitel: '06',
    label: { de: 'Compliance & Risk', en: 'Compliance & Risk', fr: 'Conformité & Risques' },
    ort: { de: '2. OG links (Compliance & Risk)', en: '2nd floor left (compliance & risk)', fr: '2e étage gauche (Compliance & Risk)' },
    keyObject: '„GOVERNANCE COCKPIT"-Screen',
    zone: { centerX: 25.1, centerY: 37.2, width: 40.3, height: 22.1, labelX: 25.1, labelY: 30.6, hitWidth: 35, hitHeight: 19 },
    vision: {
      de: 'Compliance ist 2030 **kein nachgelagerter Bremsklotz mehr, sondern in jede Entscheidung eingebaut**. Regulatorik ist direkt in Systeme und Entscheidungslogiken integriert. Aus dem Three-Lines-of-Defense-Modell wird **kontinuierliche, technisch integrierte Echtzeit-Kontrolle mit dem CAIO im Zentrum**. Cyber- und Operational Risk werden **untrennbarer Teil des Betriebsmodells: Sicherheit heißt permanente Resilienzsteuerung statt nachträglicher Schutzwall**.',
      en: 'By 2030 compliance is **no longer a downstream brake but built into every decision**. Regulation is integrated directly into systems and decision logic. The three-lines-of-defence model becomes **continuous, technically integrated real-time control with the CAIO at the centre**. Cyber and operational risk become **an inseparable part of the operating model: security means permanent resilience management rather than a retrofitted protective wall**.',
      fr: 'En 2030, la conformité n’est **plus un frein en aval, mais est intégrée à chaque décision**. La réglementation est directement inscrite dans les systèmes et les logiques de décision. Le modèle des trois lignes de défense devient un **contrôle continu en temps réel, techniquement intégré, avec le CAIO au centre**. Les risques cyber et opérationnels deviennent une **partie indissociable du modèle d’exploitation : la sécurité signifie un pilotage permanent de la résilience plutôt qu’un rempart ajouté après coup**.',
    },
    businessCase: {
      de: 'Exemplarisch (illustrativ): Eingebettete Echtzeit-Compliance senkt die Kontrollkosten um **20–30 %** und vermeidet regulatorische Strafen und Verluste in **zweistelliger Millionenhöhe**. Robuste Cyber-Resilienz reduziert die erwartete Schadenshöhe erheblich.',
      en: 'Illustrative example: Embedded real-time compliance cuts control costs by **20–30 %** and avoids regulatory penalties and losses in the **tens of millions of euros**. Robust cyber resilience materially reduces expected loss.',
      fr: 'À titre illustratif : une conformité intégrée en temps réel réduit les coûts de contrôle de **20–30 %** et évite des sanctions réglementaires et des pertes de l’ordre de **plusieurs dizaines de millions d’euros**. Une cyber-résilience robuste réduit considérablement le montant attendu des pertes.',
    },
    hypotheses: [
      {
        title: { de: 'Von ex-post-Kontrolle zu kontinuierlicher Echtzeitsteuerung', en: 'From ex-post control to continuous real-time steering', fr: 'Du contrôle ex post au pilotage continu en temps réel' },
        image: {
          src: './images/Kapitel 6_1.png',
          alt: {
            de: 'Status Quo: ex-post-Compliance, nachträgliche Prüfung von Dokumenten und Stichproben. 2030: Echtzeit-Compliance direkt in den Systemen, Regeln im Live-Entscheidungs-Dashboard.',
            en: 'Status quo: ex-post compliance with after-the-fact review of documents and samples. 2030: real-time compliance directly in the systems, with rules in a live decision dashboard.',
            fr: 'Statu quo : conformité ex post, contrôle a posteriori de documents et d’échantillons. En 2030 : conformité en temps réel directement dans les systèmes, règles dans un tableau de bord de décision en direct.',
          },
        },
        statusQuo: {
          de: 'Risiko- und Compliance-Funktionen greifen überwiegend **nachgelagert** ein und erzeugen zusätzliche Prozessschritte, die die **Geschwindigkeit von Innovation reduzieren** – bei **hoher Kostenintensität** und niedriger regulatorischer Geschwindigkeit.',
          en: 'Risk and compliance functions mostly intervene **downstream** and create additional process steps that **reduce the speed of innovation** – at **high cost intensity** and low regulatory speed.',
          fr: 'Les fonctions risques et conformité interviennent principalement **en aval** et ajoutent des étapes de processus qui **ralentissent l’innovation** – avec une **forte intensité de coûts** et une faible réactivité réglementaire.',
        },
        in2030: {
          de: 'Regulatorische Anforderungen sind **direkt in Systeme und Entscheidungslogiken eingebettet** – Kontrolle wird dadurch **schneller und effizienter**.',
          en: 'Regulatory requirements are **embedded directly into systems and decision logic** – making control **faster and more efficient**.',
          fr: 'Les exigences réglementaires sont **directement intégrées dans les systèmes et les logiques de décision** – le contrôle devient ainsi **plus rapide et plus efficace**.',
        },
      },
      {
        title: { de: 'Three-Lines-of-Defense-Modell verändert sich grundlegend', en: 'The three-lines-of-defence model changes fundamentally', fr: 'Le modèle des trois lignes de défense change en profondeur' },
        image: {
          src: './images/Kapitel 6_2.png',
          alt: {
            de: 'Status Quo: drei getrennte Verteidigungslinien mit Stichproben. 2030: integrierte, kontinuierliche Kontrolle in einem KI-überwachten Governance-Cockpit mit CAIO im Zentrum.',
            en: 'Status quo: three separate lines of defence with sample checks. 2030: integrated, continuous control in an AI-monitored governance cockpit with the CAIO at the centre.',
            fr: 'Statu quo : trois lignes de défense séparées, avec contrôles par échantillonnage. En 2030 : contrôle intégré et continu dans un cockpit de gouvernance supervisé par l’IA, avec le CAIO au centre.',
          },
        },
        statusQuo: {
          de: 'Risikomanagement, Compliance und operative Einheiten sind organisatorisch **klar getrennt**. Kontrolle erfolgt überwiegend über definierte Verantwortlichkeiten, **Stichproben und nachgelagerte Reviews**.',
          en: 'Risk management, compliance and operating units are organisationally **clearly separated**. Control happens mostly via defined responsibilities, **sample checks and downstream reviews**.',
          fr: 'La gestion des risques, la conformité et les unités opérationnelles sont **clairement séparées** sur le plan organisationnel. Le contrôle repose essentiellement sur des responsabilités définies, des **échantillonnages et des revues a posteriori**.',
        },
        in2030: {
          de: 'AI-gestützte Entscheidungen und autonome Prozesse erzwingen **neue Governance-Modelle**: Kontrolle wird zunehmend **technisch integriert und kontinuierlich überwacht**. **CAIO im Mittelpunkt**. **AI-Kompetenz wird zur Schlüsselfähigkeit** in allen Kontrollfunktionen.',
          en: 'AI-supported decisions and autonomous processes force **new governance models**: control becomes increasingly **technically integrated and continuously monitored**. **The CAIO takes centre stage**. **AI skills become a key capability** across all control functions.',
          fr: 'Les décisions assistées par l’IA et les processus autonomes imposent de **nouveaux modèles de gouvernance** : le contrôle est de plus en plus **intégré techniquement et surveillé en continu**. **Le CAIO au centre**. **La compétence en IA devient une capacité clé** dans toutes les fonctions de contrôle.',
        },
      },
      {
        title: { de: 'Cyber- und Operational Risk verschmelzen mit dem Betriebsmodell', en: 'Cyber and operational risk merge with the operating model', fr: 'Les risques cyber et opérationnels se fondent dans le modèle d’exploitation' },
        image: {
          src: './images/Kapitel 6_3.png',
          alt: {
            de: 'Status Quo: Cyber- und Operational Risk als separate, perimeterorientierte Schutzfunktion. 2030: in das Betriebsmodell integriert, kontinuierliche Resilienzsteuerung im Live-Dashboard.',
            en: 'Status quo: cyber and operational risk as a separate, perimeter-oriented protective function. 2030: integrated into the operating model with continuous resilience management in a live dashboard.',
            fr: 'Statu quo : risques cyber et opérationnels traités comme une fonction de protection distincte, centrée sur le périmètre. En 2030 : intégrés au modèle d’exploitation, pilotage continu de la résilience dans un tableau de bord en direct.',
          },
        },
        statusQuo: {
          de: 'Cybersecurity und Operational Risk werden weitgehend als **unterstützende Kontroll- und Schutzfunktion** organisiert. Sicherheitsmechanismen sind häufig **nachgelagert und perimeterorientiert** – während sich die **Bedrohungslage stetig verschärft** (Cyberangriffe nehmen zu).',
          en: 'Cybersecurity and operational risk are largely organised as a **supporting control and protection function**. Security mechanisms are often **downstream and perimeter-oriented** – while the **threat landscape keeps worsening** (cyberattacks are increasing).',
          fr: 'La cybersécurité et le risque opérationnel sont largement organisés comme une **fonction de contrôle et de protection en support**. Les mécanismes de sécurité interviennent souvent **en aval et sont centrés sur le périmètre** – alors que la **menace ne cesse de s’aggraver** (les cyberattaques se multiplient).',
        },
        in2030: {
          de: 'Mit AI-first-Architekturen, Echtzeitintegration und offenen Plattformmodellen werden Cyber- und Operational Risks **integraler Bestandteil des Betriebsmodells** – Cybersecurity wird **überlebenswichtig** und verlangt **robuste Cyber- und Operational-Risk-Fähigkeiten**. Sicherheit verschiebt sich von Schutzmechanismen zu **kontinuierlicher Resilienzsteuerung**.',
          en: 'With AI-first architectures, real-time integration and open platform models, cyber and operational risks become an **integral part of the operating model** – cybersecurity becomes **survival-critical** and demands **robust cyber and operational risk capabilities**. Security shifts from protective mechanisms to **continuous resilience management**.',
          fr: 'Avec des architectures AI-first, l’intégration en temps réel et des modèles de plateforme ouverts, les risques cyber et opérationnels deviennent **partie intégrante du modèle d’exploitation** – la cybersécurité devient **vitale** et exige des **capacités robustes en matière de risques cyber et opérationnels**. La sécurité passe des mécanismes de protection à un **pilotage continu de la résilience**.',
        },
      },
      {
        // NEU aus Workshop-Feedback: Compliance/Innenrevision muss sich neu
        // aufstellen. Explainability der KI-Outputs wird zum Kern.
        title: { de: 'Compliance & Innenrevision stellen sich neu auf', en: 'Compliance & internal audit reposition themselves', fr: 'La conformité et l’audit interne se réinventent' },
        image: {
          src: './images/Kapitel 6_4.png',
          alt: {
            de: 'Status Quo: Innenrevision prüft nachgelagert und stichprobenartig mit Aktenordnern. 2030: Compliance/Revision als Enabler mit einem Explainability-Cockpit, das transparent macht, wie und warum die KI einen Output erzeugt hat.',
            en: 'Status quo: internal audit reviews downstream and by sampling with paper files. 2030: compliance/audit as an enabler with an explainability cockpit that shows transparently how and why the AI produced an output.',
            fr: 'Statu quo : l’audit interne contrôle a posteriori et par échantillonnage, à l’aide de classeurs papier. En 2030 : la conformité et l’audit deviennent des catalyseurs, avec un cockpit d’explicabilité qui montre de manière transparente comment et pourquoi l’IA a produit un résultat.',
          },
        },
        statusQuo: {
          de: 'Compliance und Innenrevision prüfen überwiegend **nachgelagert** und stichprobenartig. Für KI-getriebene Entscheidungen fehlen **Methoden, Skills und Prüftiefe**.',
          en: 'Compliance and internal audit mostly review **downstream** and by sampling. For AI-driven decisions they lack **methods, skills and audit depth**.',
          fr: 'La conformité et l’audit interne contrôlent essentiellement **a posteriori** et par échantillonnage. Pour les décisions pilotées par l’IA, il leur manque **les méthodes, les compétences et la profondeur d’analyse**.',
        },
        in2030: {
          de: 'Compliance und Innenrevision **stellen sich grundlegend neu auf**, damit die KI-Transformation gelingt: Sie werden zum **Enabler** und sichern die **transparente Nachvollziehbarkeit, wie und warum die KI einen Output erzeugt hat** (Explainability).',
          en: 'Compliance and internal audit **fundamentally reposition themselves** so that the AI transformation succeeds: they become an **enabler** and ensure **transparent traceability of how and why the AI produced an output** (explainability).',
          fr: 'La conformité et l’audit interne **se repositionnent en profondeur** pour assurer la réussite de la transformation IA : ils deviennent un **catalyseur** et garantissent une **traçabilité transparente : comment et pourquoi l’IA a produit un résultat** (explicabilité).',
        },
      },
    ],
    activity: {
      image: {
        src: './images/Kapitel 6_Demo.png',
        alt: {
          de: 'Angespannter Entscheidungsmoment: Kunde am Telefon nach einer autonomen KI-Kreditentscheidung, im Hintergrund drei horizontale Status-Balken.',
          en: 'A tense decision moment: a customer on the phone after an autonomous AI credit decision, with three horizontal status bars in the background.',
          fr: 'Moment de décision tendu : un client au téléphone après une décision de crédit autonome de l’IA ; en arrière-plan, trois barres d’état horizontales.',
        },
      },
      title: { de: 'Kredit-Dilemma: 50.000 €, die KI lehnt autonom ab', en: 'Credit dilemma: €50,000, the AI rejects autonomously', fr: 'Dilemme du crédit : 50 000 €, l’IA refuse de manière autonome' },
      text: {
        de: 'Dilemma: Ein Geschäftskunde beantragt einen Kredit über **50.000 €**, **die KI lehnt autonom ab**. Die Autonomiegrenzen sind **gestuft** (5.000 · 50.000 · 500.000 · 5 Mio · 50 Mio €) – je nach **Risikoklasse des Kunden** und den KI-Hintergrundinformationen. Entscheiden Sie entlang des Telefongesprächs. Drei Balken (Regulatorik, Geschwindigkeit, Zufriedenheit) reagieren. **Wer hat freigegeben? Wer haftet?** Wie wird kontrolliert?',
        en: 'Dilemma: a business customer applies for a **€50,000** loan, **the AI rejects it autonomously**. The autonomy thresholds are **tiered** (€5,000 · 50,000 · 500,000 · 5m · 50m) – depending on the **customer’s risk class** and the AI’s background information. Decide along the phone call. Three bars (regulation, speed, satisfaction) react. **Who approved it? Who is liable?** How is it controlled?',
        fr: 'Dilemme : un client entreprise demande un crédit de **50 000 €**, **l’IA le refuse de manière autonome**. Les seuils d’autonomie sont **échelonnés** (5 000 € · 50 000 € · 500 000 € · 5 M€ · 50 M€) – selon la **classe de risque du client** et les informations de contexte fournies par l’IA. Décidez au fil de la conversation téléphonique. Trois barres (réglementation, rapidité, satisfaction) réagissent. **Qui a validé ? Qui est responsable ?** Comment le contrôle s’exerce-t-il ?',
      },
      buttonLabel: { de: 'Szenario starten', en: 'Start the scenario', fr: 'Lancer le scénario' },
      handoff: { kind: 'kredit-dilemma' },
    },
  },

  // ── 07 Transformation · Glas-Aufzug (Spine) ───────────────────────────────
  {
    id: 'transformation',
    kapitel: '09',
    label: { de: 'Transformation mit Deloitte', en: 'Transformation with Deloitte', fr: 'Transformation avec Deloitte' },
    ort: { de: 'Glas-Aufzug (vertikal, alle Etagen)', en: 'Glass elevator (vertical, all floors)', fr: 'Ascenseur vitré (vertical, tous les étages)' },
    keyObject: 'die Glas-Spine durch alle Etagen',
    zone: { centerX: 50.2, centerY: 46.4, width: 9.9, height: 82, fit: 'contain', labelX: 50.2, labelY: 42.8, hitWidth: 8.2, hitHeight: 77 },
    vision: {
      de: 'Wir wandeln uns bis 2030 **zur AI-nativen Plattform-Bank**, aufgebaut aus Daten, Ökosystem und **integrierter Governance statt nachgelagerter Kontrolle**. Unser Operating Model folgt der Entscheidungslogik: **Journey-Teams mit End-to-End-Ownership, Human-in-the-loop und AI-Governance**. Wir transformieren **decision-first**: zuerst die wenigen kritischen Decision Journeys und eine **skalierbare Decision Spine**, dann der systematische Roll-out von KI und Technologie.',
      en: 'By 2030 we transform **into an AI-native platform bank**, built from data, ecosystem and **integrated governance instead of downstream control**. Our operating model follows decision logic: **journey teams with end-to-end ownership, human-in-the-loop and AI governance**. We transform **decision-first**: starting with the few critical decision journeys and a **scalable decision spine**, then the systematic roll-out of AI and technology.',
      fr: 'D’ici 2030, nous devenons **une banque plateforme native IA**, bâtie sur les données, l’écosystème et **une gouvernance intégrée plutôt qu’un contrôle a posteriori**. Notre modèle opérationnel suit la logique de décision : **des équipes parcours responsables de bout en bout, l’humain dans la boucle et une gouvernance de l’IA**. Nous transformons selon une approche **decision-first** : d’abord les quelques parcours de décision critiques et une **Decision Spine évolutive**, puis le déploiement systématique de l’IA et de la technologie.',
    },
    businessCase: {
      de: 'Exemplarisch (illustrativ): Der Sprung von 2–4 auf **100+ Deployments p.a.** und decision-first-Priorisierung heben den Transformations-ROI um das **2–3-Fache** und verkürzen die Amortisation kritischer Decision Journeys auf **unter 12 Monate**.',
      en: 'Illustrative example: Moving from 2–4 to **100+ deployments p.a.** and decision-first prioritisation lift transformation ROI by **2–3×** and shorten payback of critical decision journeys to **under 12 months**.',
      fr: 'À titre illustratif : passer de 2–4 à **plus de 100 déploiements par an** et prioriser selon une logique decision-first multiplie le ROI de la transformation **par 2 à 3** et ramène le délai d’amortissement des parcours de décision critiques à **moins de 12 mois**.',
    },
    hypotheses: [
      {
        title: { de: 'Ökosystem-Plattform mit integrierter Governance', en: 'Ecosystem platform with integrated governance', fr: 'Plateforme d’écosystème à gouvernance intégrée' },
        image: {
          src: './images/Kapitel 7_1.png',
          alt: {
            de: 'Status Quo: intern fokussierte Transformation an fragmentierten IT-/Prozessprojekten. 2030: AI-getriebene Ökosystem-Plattform aus Daten, Partnern und eingebauter Compliance.',
            en: 'Status quo: internally focused transformation on fragmented IT/process projects. 2030: an AI-driven ecosystem platform of data, partners and built-in compliance.',
            fr: 'Statu quo : une transformation centrée sur l’interne, dispersée en projets IT et processus fragmentés. En 2030 : une plateforme d’écosystème pilotée par l’IA, réunissant données, partenaires et conformité intégrée.',
          },
        },
        statusQuo: {
          de: 'Transformation **fokussiert intern** (IT, Prozesse, Compliance) – Ökosysteme, Datenbasis und Partnerintegration **bleiben fragmentiert**.',
          en: 'Transformation is **internally focused** (IT, processes, compliance) – ecosystems, data foundation and partner integration **remain fragmented**.',
          fr: 'La transformation **se concentre sur l’interne** (IT, processus, conformité) – écosystèmes, socle de données et intégration des partenaires **restent fragmentés**.',
        },
        in2030: {
          de: 'Aufbau einer **AI-getriebenen Plattform** aus Daten, Ökosystem und Governance, in der **Compliance integraler Bestandteil** ist – nicht nachgelagerte Kontrollfunktion. **AI wird zum Fixstern**, an dem Daten, Ökosystem und Governance ausgerichtet werden. Die **Plattform ist Geschäfts- und Betriebsmodell zugleich** – mit klarem Fokus auch auf **HR und Change**.',
          en: 'Building an **AI-driven platform** of data, ecosystem and governance in which **compliance is an integral part** – not a downstream control function. **AI becomes the guiding star** around which data, ecosystem and governance are aligned. The **platform is business and operating model in one** – with a clear focus on **HR and change** as well.',
          fr: 'Construction d’une **plateforme pilotée par l’IA**, réunissant données, écosystème et gouvernance, dans laquelle **la conformité fait partie intégrante** du dispositif – et non une fonction de contrôle a posteriori. **L’IA devient l’étoile polaire** sur laquelle s’alignent données, écosystème et gouvernance. La **plateforme est à la fois modèle d’affaires et modèle opérationnel** – avec un accent clair, également, sur **les RH et la conduite du changement**.',
        },
      },
      {
        title: { de: 'AI-native Transformation zum Entscheidungs-Operating-Model', en: 'AI-native transformation to a decision operating model', fr: 'Transformation native IA vers un modèle opérationnel centré sur la décision' },
        image: {
          src: './images/Kapitel 7_2.png',
          alt: {
            de: 'Status Quo: produkt- und silogetriebene Organisation, Transformation in starren Strukturen gefangen. 2030: AI-natives Operating Model, Journey-Teams mit E2E-Ownership und Human-in-the-loop.',
            en: 'Status quo: a product- and silo-driven organisation with transformation trapped in rigid structures. 2030: an AI-native operating model with journey teams holding E2E ownership and human-in-the-loop.',
            fr: 'Statu quo : une organisation pilotée par les produits et les silos, une transformation prisonnière de structures rigides. En 2030 : un modèle opérationnel natif IA, des équipes parcours responsables de bout en bout et l’humain dans la boucle.',
          },
        },
        statusQuo: {
          de: 'Organisation, Governance und Prozesse sind **produkt- und silogetrieben**. Transformation **bleibt in bestehenden Strukturen gefangen**.',
          en: 'Organisation, governance and processes are **product- and silo-driven**. Transformation **remains trapped in existing structures**.',
          fr: 'Organisation, gouvernance et processus sont **pilotés par les produits et les silos**. La transformation **reste prisonnière des structures existantes**.',
        },
        in2030: {
          de: 'Transformation erfolgt durch den Aufbau eines **AI-nativen Operating Models** entlang der Entscheidungslogik. **End-to-End Ownership, Journey-Teams** sowie **Human-in-the-loop und AI-Governance** sind fester Bestandteil.',
          en: 'Transformation happens by building an **AI-native operating model** along decision logic. **End-to-end ownership, journey teams** as well as **human-in-the-loop and AI governance** are an integral part.',
          fr: 'La transformation passe par la construction d’un **modèle opérationnel natif IA** aligné sur la logique de décision. **La responsabilité de bout en bout, les équipes parcours** ainsi que **l’humain dans la boucle et la gouvernance de l’IA** en sont des composantes à part entière.',
        },
      },
      {
        title: { de: 'Decision-first Transformation', en: 'Decision-first transformation', fr: 'Transformation decision-first' },
        image: {
          src: './images/Kapitel 7_3.png',
          alt: {
            de: 'Status Quo: technologiegetriebene Transformation in vielen isolierten Use Cases ohne Priorität. 2030: decision-first mit klarer Roadmap und skalierbarer Decision Spine vor dem AI-Rollout.',
            en: 'Status quo: technology-driven transformation across many isolated use cases without priority. 2030: decision-first with a clear roadmap and a scalable decision spine ahead of the AI rollout.',
            fr: 'Statu quo : une transformation pilotée par la technologie, éclatée en de nombreux cas d’usage isolés et sans priorité. En 2030 : une approche decision-first, avec une feuille de route claire et une Decision Spine évolutive en amont du déploiement de l’IA.',
          },
        },
        statusQuo: {
          de: 'Transformation startet primär **technologie-(AI)-getrieben** und verteilt sich auf **isolierte Use Cases ohne klare Priorisierung**. Die IT bleibt im **Reparaturmodus** – Altsysteme werden gefixt und Produkte auf dem bestehenden Geschäfts- und Betriebsmodell erweitert. Nur **2–4 Deployments pro Jahr**.',
          en: 'Transformation starts primarily **technology-(AI)-driven** and spreads across **isolated use cases without clear prioritisation**. IT stays in **repair mode** – legacy systems get patched and products are extended on the existing business and operating model. Only **2–4 deployments per year**.',
          fr: 'La transformation démarre avant tout **par la technologie (l’IA)** et se disperse en **cas d’usage isolés, sans priorisation claire**. L’IT reste en **mode réparation** – les systèmes historiques sont colmatés et les produits étendus sur le modèle d’affaires et opérationnel existant. Seulement **2–4 déploiements par an**.',
        },
        in2030: {
          de: 'Transformation erfolgt nach einem **Decision-first-Ansatz** mit klarer Sequenzierung. Im Fokus stehen zunächst **wenige kritische Decision Journeys** und der Aufbau einer **skalierbaren Decision Spine**, bevor AI und Technologie systematisch ausgerollt werden. Der Weg von der **Idee zur Ausführung verkürzt sich drastisch** – Compliance, Risk und Governance sind eingebaut. **100+ Deployments pro Jahr** werden möglich.',
          en: 'Transformation follows a **decision-first approach** with clear sequencing. The initial focus is on **a few critical decision journeys** and on building a **scalable decision spine** before AI and technology are rolled out systematically. The path from **idea to execution shortens dramatically** – with compliance, risk and governance built in. **100+ deployments per year** become possible.',
          fr: 'La transformation suit une **approche decision-first** avec un séquencement clair. L’accent porte d’abord sur **quelques parcours de décision critiques** et sur la construction d’une **Decision Spine évolutive**, avant le déploiement systématique de l’IA et de la technologie. Le chemin de **l’idée à l’exécution se raccourcit radicalement** – conformité, risques et gouvernance sont intégrés. **Plus de 100 déploiements par an** deviennent possibles.',
        },
      },
      {
        // NEU aus Workshop-Feedback: Change muss im Target Operating Model
        // verankert und tatsächlich durchgeführt werden.
        title: { de: 'Change ist im Target Operating Model verankert', en: 'Change is anchored in the target operating model', fr: 'Le changement est ancré dans le modèle opérationnel cible' },
        image: {
          src: './images/Kapitel 7_4.png',
          alt: {
            de: 'Status Quo: neue Prozesse und Systeme werden geliefert, doch der Verhaltens- und Kulturwandel verpufft. 2030: Change ist fest im Target Operating Model verankert – Governance, Rollen und Anreize stellen die Umsetzung sicher.',
            en: 'Status quo: new processes and systems are delivered, but behavioural and cultural change fizzles out. 2030: change is firmly anchored in the target operating model – governance, roles and incentives ensure it is delivered.',
            fr: 'Statu quo : de nouveaux processus et systèmes sont livrés, mais l’évolution des comportements et de la culture s’essouffle. En 2030 : le changement est solidement ancré dans le modèle opérationnel cible – gouvernance, rôles et incitations en garantissent la mise en œuvre.',
          },
        },
        statusQuo: {
          de: 'Transformationsprojekte liefern neue Prozesse und Systeme, doch der **Change** – Verhaltens- und Kulturwandel – wird oft **nicht konsequent umgesetzt** und verpufft.',
          en: 'Transformation projects deliver new processes and systems, but **change** – behavioural and cultural change – is often **not consistently implemented** and fizzles out.',
          fr: 'Les projets de transformation livrent de nouveaux processus et systèmes, mais le **changement** – l’évolution des comportements et de la culture – n’est souvent **pas mené avec constance** et s’essouffle.',
        },
        in2030: {
          de: '**Change ist fest im Target Operating Model verankert**: Governance, Rollen und Anreize stellen sicher, dass Veränderung nicht nur beschlossen, sondern **tatsächlich durchgeführt und nachhaltig verankert** wird.',
          en: '**Change is firmly anchored in the target operating model**: governance, roles and incentives ensure that change is not merely decided but **actually delivered and sustainably embedded**.',
          fr: '**Le changement est solidement ancré dans le modèle opérationnel cible** : gouvernance, rôles et incitations garantissent que la transformation n’est pas seulement décidée, mais **réellement menée à bien et durablement installée**.',
        },
      },
      {
        // NEU aus Workshop-Feedback: Beratungsangebot/Projektmethodik — wie werden
        // Projekte künftig durchgeführt, wie sieht der Transformationspfad aus.
        title: { de: 'Neue Projektmethodik & klarer Transformationspfad', en: 'New project methodology & a clear transformation path', fr: 'Nouvelle méthodologie projet & trajectoire de transformation claire' },
        image: {
          src: './images/Kapitel 7_5.png',
          alt: {
            de: 'Status Quo: klassische Projektmethodik (Wasserfall/Stage-Gate) ohne durchgängigen Transformationspfad. 2030: AI-native Projektmethodik mit wiederverwendbaren Artefakten und einem klaren Transformationspfad von Reifegrad über nächste Schritte zum Zielbild.',
            en: 'Status quo: classic project methodology (waterfall/stage-gate) without a continuous transformation path. 2030: an AI-native project methodology with reusable artefacts and a clear transformation path from maturity through next steps to the target picture.',
            fr: 'Statu quo : une méthodologie projet classique (cascade / stage-gate) sans trajectoire de transformation continue. En 2030 : une méthodologie projet native IA, avec des artefacts réutilisables et une trajectoire de transformation claire, de l’évaluation de la maturité jusqu’au modèle cible, en passant par les prochaines étapes.',
          },
        },
        statusQuo: {
          de: 'Transformationsprojekte folgen **klassischen Methoden** (Wasserfall/Stage-Gate). Ein durchgängiger, **artefaktgestützter Transformationspfad** fehlt.',
          en: 'Transformation projects follow **classic methods** (waterfall/stage-gate). A continuous, **artefact-based transformation path** is missing.',
          fr: 'Les projets de transformation suivent des **méthodes classiques** (cascade / stage-gate). Il manque une **trajectoire de transformation continue et fondée sur des artefacts**.',
        },
        in2030: {
          de: 'Projekte werden nach einer **AI-nativen Projektmethodik** durchgeführt – mit wiederverwendbaren **Artefakten** und einem klaren **Transformationspfad** von der Reifegrad-Bestimmung über die nächsten Schritte bis zum Zielbild.',
          en: 'Projects are run with an **AI-native project methodology** – with reusable **artefacts** and a clear **transformation path** from maturity assessment through the next steps to the target picture.',
          fr: 'Les projets sont menés selon une **méthodologie projet native IA** – avec des **artefacts** réutilisables et une **trajectoire de transformation** claire, de l’évaluation de la maturité jusqu’au modèle cible, en passant par les prochaines étapes.',
        },
      },
    ],
    activity: {
      image: {
        src: './images/Kapitel 7_Demo.png',
        alt: {
          de: 'Executive-Co-Creation im Boardroom rund um ein großes System-Diagramm und eine 2x2-Priorisierungsmatrix.',
          en: 'Executive co-creation in the boardroom around a large system diagram and a 2x2 prioritisation matrix.',
          fr: 'Co-création avec les dirigeants dans la salle du conseil, autour d’un grand schéma systémique et d’une matrice de priorisation 2x2.',
        },
      },
      title: { de: 'Co-Creation: Future Interaction Model', en: 'Co-creation: future interaction model', fr: 'Co-création : modèle d’interaction de demain' },
      text: {
        de: 'Co-Creation: **Future Interaction Model**. Zielbild → Kontrolle → Priorisierung → Pilot. **Wer entscheidet künftig (Mensch / AI / Hybrid)?** Was geben wir ab, was zuerst, wo starten wir?',
        en: 'Co-creation: **future interaction model**. Target picture → control → prioritisation → pilot. **Who decides in future (human / AI / hybrid)?** What do we hand over, what first, where do we start?',
        fr: 'Co-création : **modèle d’interaction de demain**. Modèle cible → contrôle → priorisation → pilote. **Qui décidera demain (humain / IA / hybride) ?** Que déléguons-nous, quoi en premier, par où commençons-nous ?',
      },
      buttonLabel: { de: 'Zur Co-Creation', en: 'Go to co-creation', fr: 'Accéder à la co-création' },
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
    label: { de: 'Produkte & Innovation', en: 'Products & Innovation', fr: 'Produits & Innovation' },
    ort: { de: '3. OG rechts (Projektraum)', en: '3rd floor right (project room)', fr: '3e étage droite (salle projet)' },
    keyObject: 'Whiteboard-Wand mit Produkt-Mockups',
    zone: { centerX: 75, centerY: 15.8, width: 39.6, height: 20.8, labelX: 75, labelY: 9.6, hitWidth: 35, hitHeight: 18 },
    vision: {
      de: '2030 gibt es keinen Produktkatalog mehr: KI komponiert aus modularen Bausteinen **hyperpersonalisierte Lösungen für das Segment of One**, im Moment des Bedarfs. Produkte sind **lebende, adaptive Services**, die sich innerhalb definierter Leitplanken selbst an Lebensereignisse und Marktlage anpassen. Und sie entstehen **kontinuierlich statt in Jahresprojekten**: KI entwirft, simuliert und testet compliant by design. **Time-to-Market sinkt von Jahren auf Tage**.',
      en: 'In 2030 there is no longer a product catalogue: from modular building blocks, AI composes **hyper-personalised solutions for the segment of one**, at the moment of need. Products are **living, adaptive services** that adjust themselves to life events and market conditions within defined guardrails. And they emerge **continuously rather than in annual projects**: AI designs, simulates and tests compliant by design. **Time-to-market drops from years to days**.',
      fr: 'En 2030, le catalogue produits n’existe plus : à partir de briques modulaires, l’IA compose **des solutions hyperpersonnalisées pour le Segment of One**, au moment du besoin. Les produits deviennent des **services vivants et adaptatifs**, qui s’ajustent d’eux-mêmes aux événements de vie et au contexte de marché, dans des garde-fous définis. Et ils naissent **en continu plutôt qu’au fil de projets annuels** : l’IA conçoit, simule et teste, avec une conformité intégrée dès la conception (compliant by design). **Le time-to-market passe de plusieurs années à quelques jours**.',
    },
    businessCase: {
      de: 'Exemplarisch (illustrativ): Time-to-Market von Monaten/Jahren auf **Tage** und Segment-of-One-Produkte steigern die Abschlussquote um **15–25 %**. Das entspricht rund **10–15 Mio € inkrementellem Ertrag p.a.** bei deutlich niedrigeren Entwicklungskosten je Produkt.',
      en: 'Illustrative example: Cutting time-to-market from months/years to **days** and segment-of-one products raise the conversion rate by **15–25 %**. That is roughly **€10–15m incremental revenue p.a.** at much lower development cost per product.',
      fr: 'À titre illustratif : un time-to-market ramené de plusieurs mois ou années à **quelques jours** et des produits Segment of One augmentent le taux de transformation de **15–25 %**. Cela représente environ **10–15 M€ de revenus supplémentaires par an**, avec des coûts de développement par produit nettement inférieurs.',
    },
    hypotheses: [
      {
        title: { de: 'Vom Produktkatalog zum Segment of One', en: 'From product catalogue to segment of one', fr: 'Du catalogue produits au Segment of One' },
        image: {
          src: './images/Kapitel 8_1.png',
          alt: {
            de: 'Status Quo: Regal mit identischen Standard-Produktmappen, mehrere Kunden halten dieselbe Mappe. 2030: jeder Kunde sieht auf dem eigenen Gerät eine sichtbar andere, individuell komponierte Produktlösung.',
            en: 'Status quo: a shelf of identical standard product folders, several customers holding the same folder. 2030: each customer sees a visibly different, individually composed product solution on their own device.',
            fr: 'Statu quo : une étagère de dossiers produits standard identiques, plusieurs clients tenant le même dossier. En 2030 : chaque client voit sur son propre appareil une solution produit visiblement différente, composée individuellement.',
          },
        },
        statusQuo: {
          de: 'Banken bieten **standardisierte Produktkataloge** für breite Kundensegmente an. Individualisierung beschränkt sich auf **wenige Parameter** wie Konditionen oder Laufzeiten.',
          en: 'Banks offer **standardised product catalogues** for broad customer segments. Individualisation is limited to **a few parameters** such as terms or maturities.',
          fr: 'Les banques proposent des **catalogues de produits standardisés** à de larges segments de clientèle. La personnalisation se limite à **quelques paramètres**, comme les conditions ou les durées.',
        },
        in2030: {
          de: 'Produkte entstehen **individuell im Moment des Bedarfs**: KI komponiert aus modularen Bausteinen **hyperpersonalisierte Lösungen** für den einzelnen Kunden **(„Segment of One")** – dynamisch angepasst an Lebenssituation, Ziele und Kontext.',
          en: 'Products emerge **individually at the moment of need**: from modular building blocks, AI composes **hyper-personalised solutions** for the individual customer **(“segment of one”)** – dynamically adapted to life situation, goals and context.',
          fr: 'Les produits naissent **individuellement, au moment du besoin** : à partir de briques modulaires, l’IA compose des **solutions hyperpersonnalisées** pour chaque client **(« Segment of One »)** – ajustées dynamiquement à sa situation de vie, à ses objectifs et à son contexte.',
        },
      },
      {
        title: { de: 'Produkte werden zu lebenden, adaptiven Services', en: 'Products become living, adaptive services', fr: 'Les produits deviennent des services vivants et adaptatifs' },
        image: {
          src: './images/Kapitel 8_2.png',
          alt: {
            de: 'Status Quo: dicker Papier-Vertragsordner wird geschlossen und ins Regal zu identischen Ordnern abgeheftet. 2030: Kundin im Umzug schaut entspannt auf einen Bildschirm, auf dem sich Produktparameter innerhalb markierter Leitplanken von selbst anpassen.',
            en: 'Status quo: a thick paper contract folder is closed and filed on a shelf next to identical folders. 2030: a customer in the middle of a move looks relaxed at a screen on which product parameters adjust themselves within marked guardrails.',
            fr: 'Statu quo : un épais classeur de contrats papier est refermé et rangé sur une étagère, à côté de classeurs identiques. En 2030 : une cliente en plein déménagement regarde sereinement un écran sur lequel les paramètres du produit s’ajustent d’eux-mêmes, à l’intérieur de garde-fous signalés.',
          },
        },
        statusQuo: {
          de: 'Produkte sind **statisch**: Nach Abschluss bleiben Struktur und Konditionen bis zur Kündigung oder Prolongation unverändert – jede Anpassung erfordert einen **Neuabschluss**.',
          en: 'Products are **static**: after closing, structure and terms remain unchanged until cancellation or renewal – every adjustment requires a **new contract**.',
          fr: 'Les produits sont **statiques** : après la souscription, structure et conditions restent inchangées jusqu’à la résiliation ou la reconduction – tout ajustement exige une **nouvelle souscription**.',
        },
        in2030: {
          de: 'Produkte **passen sich kontinuierlich an**: Konditionen, Limits und Absicherungen adjustieren sich **innerhalb definierter Leitplanken automatisch** an Lebensereignisse und Marktlage. Das Produkt wird **vom Vertrag zum lebenden Service**.',
          en: 'Products **adapt continuously**: terms, limits and hedges adjust **automatically within defined guardrails** to life events and market conditions. The product turns **from a contract into a living service**.',
          fr: 'Les produits **s’adaptent en continu** : conditions, plafonds et couvertures s’ajustent **automatiquement, dans des garde-fous définis**, aux événements de vie et au contexte de marché. Le produit passe **du contrat au service vivant**.',
        },
      },
      {
        title: { de: 'Produktentwicklung wird kontinuierlich: von Jahren zu Tagen', en: 'Product development becomes continuous: from years to days', fr: 'Le développement produit devient continu : des années aux jours' },
        image: {
          src: './images/Kapitel 8_3.png',
          alt: {
            de: 'Status Quo: zähe Gremiensitzung über dicken Anforderungsstapeln und Wandplanungstafel. 2030: kleines Produktteam im hellen Projektraum, KI simuliert parallel viele Produktvarianten, ein Same-Day-Mockup liegt auf dem Tisch.',
            en: 'Status quo: a sluggish committee meeting over thick stacks of requirements and a wall planning board. 2030: a small product team in a bright project room, AI simulating many product variants in parallel, with a same-day mockup on the table.',
            fr: 'Statu quo : une réunion de comité laborieuse, au-dessus d’épaisses piles de cahiers des charges et d’un tableau de planification mural. En 2030 : une petite équipe produit dans une salle projet lumineuse, l’IA simule en parallèle de nombreuses variantes de produit, une maquette réalisée le jour même est posée sur la table.',
          },
        },
        statusQuo: {
          de: 'Produktentwicklung ist ein **langwieriger interner Prozess** über Gremien, IT-Umsetzung und nachgelagerte Compliance-Prüfung – **Time-to-Market liegt bei Monaten bis Jahren**.',
          en: 'Product development is a **lengthy internal process** across committees, IT implementation and downstream compliance review – **time-to-market is months to years**.',
          fr: 'Le développement produit est un **long processus interne**, entre comités, mise en œuvre IT et contrôle de conformité a posteriori – **le time-to-market se compte en mois, voire en années**.',
        },
        in2030: {
          de: 'KI **entwirft, simuliert und testet neue Produkte kontinuierlich** – mit synthetischen Kundendaten und integrierten Compliance-Checks **(„compliant by design")**. **Time-to-Market sinkt auf Tage**. Produktinnovation wird zum kontinuierlichen Prozess.',
          en: 'AI **continuously designs, simulates and tests new products** – with synthetic customer data and integrated compliance checks **(“compliant by design”)**. **Time-to-market drops to days**. Product innovation becomes a continuous process.',
          fr: 'L’IA **conçoit, simule et teste de nouveaux produits en continu** – avec des données clients synthétiques et des contrôles de conformité intégrés **(« compliant by design »)**. **Le time-to-market tombe à quelques jours**. L’innovation produit devient un processus continu.',
        },
      },
    ],
    activity: {
      image: {
        src: './images/Kapitel 8_Demo.png',
        alt: {
          de: 'Projektraum mit Whiteboards und Produkt-Mockups. Großer, frontal stehender 16:9-Bildschirm für den Demo-Absprung.',
          en: 'A project room with whiteboards and product mockups. A large, front-facing 16:9 screen for the demo hand-off.',
          fr: 'Salle projet avec tableaux blancs et maquettes de produits. Grand écran 16:9 placé de face pour l’accès à la démo.',
        },
      },
      title: { de: 'Produkte & Innovation: vom Bedarf zum Produkt in Tagen', en: 'Products & Innovation: from need to product in days', fr: 'Produits & Innovation : du besoin au produit en quelques jours' },
      text: {
        de: 'Provisorischer Platzhalter. **Demo und Absprung folgen**, sobald das Format feststeht. Hier soll der Projektraum zeigen, wie KI ein Produkt für das Segment of One komponiert, simuliert und compliant by design ausliefert.',
        en: 'Provisional placeholder. **Demo and hand-off to follow** once the format is set. Here the project room should show how AI composes, simulates and delivers a product for the segment of one, compliant by design.',
        fr: 'Contenu provisoire. **La démo et son accès suivront** dès que le format sera arrêté. La salle projet doit montrer ici comment l’IA compose, simule et livre un produit pour le Segment of One, conforme dès la conception (compliant by design).',
      },
      buttonLabel: { de: 'Demo folgt', en: 'Demo to follow', fr: 'Démo à venir' },
      // TODO(Auftraggeber): finalen Handoff einsetzen (iframe-Demo / Tool).
      handoff: { kind: 'iframe', url: '', title: { de: 'Produkte-&-Innovation-Demo (folgt)', en: 'Products & Innovation demo (to follow)', fr: 'Démo Produits & Innovation (à venir)' } },
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
    label: { de: 'Vorstand & Governance', en: 'Executive Board & Governance', fr: 'Direction & Gouvernance' },
    ort: { de: '3. OG links (Boardroom)', en: '3rd floor left (boardroom)', fr: '3e étage gauche (salle du conseil)' },
    keyObject: 'Governance-Cockpit an der Wand',
    zone: { centerX: 25.1, centerY: 15.8, width: 40.3, height: 20.8, labelX: 25.1, labelY: 9.6, hitWidth: 35, hitHeight: 18 },
    vision: {
      de: 'Der Vorstand steuert die Bank 2030 **datenbasiert, in Echtzeit und mit klarer AI-Governance**: Ein Governance-Cockpit macht Kapital, Liquidität, Risiko und Ertrag **live** sichtbar, KI **simuliert Handlungsoptionen**, und der Vorstand verantwortet **Leitplanken, Risikoappetit und Ethik der KI** zentral. Aus dem jährlichen Strategiezyklus wird eine **kontinuierliche, adaptive Steuerung**. (Platzhalter-Vorschlag, vor Nutzung freigeben.)',
      en: 'In 2030 the board steers the bank **on live data, in real time and with clear AI governance**: a governance cockpit makes capital, liquidity, risk and earnings visible **live**, AI **simulates options for action**, and the board owns the **guardrails, risk appetite and ethics of AI** centrally. The annual strategy cycle turns into **continuous, adaptive steering**. (Placeholder proposal, to be signed off before use.)',
      fr: 'En 2030, la direction générale pilote la banque **sur la base des données, en temps réel et avec une gouvernance de l’IA claire** : un cockpit de gouvernance rend capital, liquidité, risques et revenus visibles **en direct**, l’IA **simule les options d’action**, et la direction assume de manière centralisée **les garde-fous, l’appétit pour le risque et l’éthique de l’IA**. Le cycle stratégique annuel laisse place à un **pilotage continu et adaptatif**. (Proposition provisoire, à valider avant utilisation.)',
    },
    businessCase: {
      de: 'Exemplarisch (illustrativ): Schnellere, datenbasierte Vorstandsentscheidungen und **dynamische Kapitalallokation** verbessern die Eigenkapitalrendite um **0,5–1,5 %-Punkte** und senken Kosten aus Fehlentscheidungen/Verzögerung spürbar: bei einer mittelgroßen Bank grob ein **zweistelliger Mio-€-Effekt p.a.** Zahlen als Beispielrechnung, vor externer Nutzung mit realen Annahmen hinterlegen.',
      en: 'Illustrative example: faster, data-driven board decisions and **dynamic capital allocation** improve return on equity by **0.5–1.5 pp** and noticeably reduce the cost of wrong or delayed decisions: for a mid-sized bank roughly a **double-digit €m effect p.a.** Figures are an example calculation. Back them with real assumptions before external use.',
      fr: 'À titre illustratif : des décisions de direction plus rapides et fondées sur les données ainsi qu’une **allocation dynamique du capital** améliorent la rentabilité des fonds propres de **0,5–1,5 pts** et réduisent sensiblement les coûts liés aux mauvaises décisions et aux retards : pour une banque de taille moyenne, un **effet de l’ordre de plusieurs dizaines de M€ par an**. Chiffres donnés à titre d’exemple de calcul, à étayer par des hypothèses réelles avant toute utilisation externe.',
    },
    hypotheses: [
      {
        title: { de: 'Vom Quartalsbericht zur Echtzeit-Steuerung', en: 'From quarterly report to real-time steering', fr: 'Du rapport trimestriel au pilotage en temps réel' },
        image: {
          src: './images/Kapitel 9_1.png',
          alt: {
            de: 'Status Quo: Vorstand entscheidet in einer Sitzung anhand gedruckter Quartalsberichte und Rückspiegel-Kennzahlen. 2030: Vorstand steht in einem immersiven Datenraum (kein Konferenztisch) und steuert live über eine raumhohe Cockpit-Wand mit Echtzeit-Kennzahlen und KI-simulierten Szenarien.',
            en: 'Status quo: the board decides in a meeting based on printed quarterly reports and rear-view metrics. 2030: the board stands in an immersive data room (no conference table), steering live via a floor-to-ceiling cockpit wall with real-time metrics and AI-simulated scenarios.',
            fr: 'Statu quo : la direction décide en séance, à partir de rapports trimestriels imprimés et d’indicateurs rétrospectifs. En 2030 : la direction se tient dans une salle de données immersive (sans table de conférence) et pilote en direct via un mur-cockpit du sol au plafond, avec des indicateurs en temps réel et des scénarios simulés par l’IA.',
          },
        },
        statusQuo: {
          de: 'Der Vorstand entscheidet auf Basis **periodischer, rückwärtsgerichteter Berichte** (Quartals-/Monatsreporting). Zwischen Ereignis und Entscheidung liegen Wochen. Vieles beruht auf **Erfahrung und Bauchgefühl**.',
          en: 'The board decides on **periodic, backward-looking reports** (quarterly/monthly). Weeks pass between event and decision. Much rests on **experience and gut feeling**.',
          fr: 'La direction décide sur la base de **rapports périodiques et rétrospectifs** (reporting trimestriel ou mensuel). Des semaines séparent l’événement de la décision. Beaucoup repose sur **l’expérience et l’intuition**.',
        },
        in2030: {
          de: 'Ein **Governance-Cockpit in Echtzeit** bündelt Kapital, Liquidität, Risiko und Ertrag live. KI **simuliert Szenarien und Handlungsoptionen** – der Vorstand entscheidet **auf aktueller Datenbasis statt auf Quartalsständen**, schneller und fundierter.',
          en: 'A **real-time governance cockpit** brings capital, liquidity, risk and earnings together live. AI **simulates scenarios and options** – the board decides **on current data instead of quarter-end snapshots**, faster and better founded.',
          fr: 'Un **cockpit de gouvernance en temps réel** réunit en direct capital, liquidité, risques et revenus. L’IA **simule scénarios et options d’action** – la direction décide **sur des données actuelles plutôt que sur des arrêtés trimestriels**, plus vite et de manière plus étayée.',
        },
        leitfrage: {
          de: 'Wenn Kapital, Liquidität und Risiko künftig live statt im Quartalsbericht vorliegen und die KI Szenarien simuliert – welche Vorstandsentscheidung würden Sie dann anders treffen?',
          en: 'If capital, liquidity and risk are available live rather than in a quarterly report and AI simulates the scenarios – which board decision would you then make differently?',
          fr: 'Si, demain, capital, liquidité et risques sont disponibles en direct plutôt que dans le rapport trimestriel, et que l’IA simule les scénarios – quelle décision de votre comité de direction prendriez-vous alors différemment ?',
        },
      },
      {
        title: { de: 'AI-Governance wird Chefsache', en: 'AI governance becomes a board responsibility', fr: 'La gouvernance de l’IA devient l’affaire de la direction générale' },
        image: {
          src: './images/Kapitel 9_2.png',
          alt: {
            de: 'Status Quo: KI-Governance ist an Fachbereiche und IT delegiert und fragmentiert, keine Verantwortung auf Vorstandsebene. 2030: der Vorstand verantwortet KI-Leitplanken, Risikoappetit und Ethik zentral. Eine CAIO-Rolle und ein KI-Ausschuss mit Explainability-Sicht auf jede wesentliche KI-Entscheidung.',
            en: 'Status quo: AI governance is delegated to business units and IT and fragmented, with no board-level accountability. 2030: the board owns AI guardrails, risk appetite and ethics centrally. A CAIO role and an AI committee with an explainability view of every material AI decision.',
            fr: 'Statu quo : la gouvernance de l’IA est déléguée aux métiers et à l’IT, et fragmentée, sans responsabilité au niveau de la direction. En 2030 : la direction assume de manière centralisée les garde-fous, l’appétit pour le risque et l’éthique de l’IA. Un rôle de CAIO et un comité IA disposant d’une vue d’explicabilité sur chaque décision IA significative.',
          },
        },
        statusQuo: {
          de: 'KI-Verantwortung ist **an Fachbereiche und IT delegiert** und fragmentiert. Es fehlt eine **klare Governance und Rechenschaft auf Vorstandsebene** für Modelle, Risiken und ethische Grenzen.',
          en: 'Responsibility for AI is **delegated to business units and IT** and fragmented. There is **no clear governance or board-level accountability** for models, risks and ethical limits.',
          fr: 'La responsabilité de l’IA est **déléguée aux métiers et à l’IT**, et fragmentée. Il manque **une gouvernance claire et une obligation de rendre compte au niveau de la direction** pour les modèles, les risques et les limites éthiques.',
        },
        in2030: {
          de: '**AI-Governance wird Chefsache**: Der Vorstand setzt **Leitplanken, Risikoappetit und ethische Grenzen** für KI, verankert eine **CAIO-Rolle bzw. einen KI-Ausschuss** und fordert **Explainability** für wesentliche KI-Entscheidungen.',
          en: '**AI governance becomes a board responsibility**: the board sets **guardrails, risk appetite and ethical limits** for AI, anchors a **CAIO role or AI committee** and requires **explainability** for material AI decisions.',
          fr: '**La gouvernance de l’IA devient l’affaire de la direction générale** : la direction fixe **les garde-fous, l’appétit pour le risque et les limites éthiques** de l’IA, institue **un rôle de CAIO ou un comité IA** et exige **l’explicabilité** des décisions IA significatives.',
        },
        leitfrage: {
          de: 'Wenn KI künftig wesentliche Entscheidungen Ihrer Bank mitträgt – wer in Ihrem Vorstand verantwortet dann ihre Leitplanken, ihren Risikoappetit und ihre Ergebnisse?',
          en: 'If AI comes to carry material decisions in your bank – who on your board is then accountable for its guardrails, its risk appetite and its outcomes?',
          fr: 'Si, demain, l’IA participe aux décisions essentielles de votre banque – qui, au sein de votre comité de direction, répondra alors de ses garde-fous, de son appétit pour le risque et de ses résultats ?',
        },
      },
      {
        title: { de: 'Von der Jahresstrategie zur kontinuierlichen Steuerung', en: 'From annual strategy to continuous steering', fr: 'De la stratégie annuelle au pilotage continu' },
        image: {
          src: './images/Kapitel 9_3.png',
          alt: {
            de: 'Status Quo: Strategie wird in einem starren Jahreszyklus geplant, Ressourcen werden träge umverteilt. 2030: kontinuierliche, KI-gestützte Strategiesteuerung. Kapital und Ressourcen werden dynamisch am lebenden Betriebsmodell allokiert.',
            en: 'Status quo: strategy is planned in a rigid annual cycle, resources reallocated sluggishly. 2030: continuous, AI-supported strategy steering. Capital and resources are allocated dynamically to the living operating model.',
            fr: 'Statu quo : la stratégie est planifiée selon un cycle annuel rigide, les ressources sont réallouées avec lenteur. En 2030 : un pilotage stratégique continu, assisté par l’IA. Capital et ressources sont alloués dynamiquement en fonction du modèle opérationnel vivant.',
          },
        },
        statusQuo: {
          de: 'Strategie und Planung laufen in einem **starren Jahreszyklus**. Kapital und Ressourcen werden **träge und selten** umverteilt. Auf Marktänderungen reagiert die Bank mit **Verzögerung**.',
          en: 'Strategy and planning run on a **rigid annual cycle**. Capital and resources are reallocated **slowly and rarely**. The bank reacts to market changes with **a lag**.',
          fr: 'Stratégie et planification suivent un **cycle annuel rigide**. Capital et ressources sont réalloués **lentement et rarement**. La banque réagit aux évolutions du marché **avec retard**.',
        },
        in2030: {
          de: 'Der Vorstand steuert **kontinuierlich und adaptiv**: KI liefert **laufende Lageeinschätzung**, Kapital, Risiko und Ressourcen werden **dynamisch am lebenden Betriebsmodell** allokiert – Strategie wird zum **fortlaufenden Prozess statt Jahresritual**.',
          en: 'The board steers **continuously and adaptively**: AI provides an **ongoing situational picture**. Capital, risk and resources are allocated **dynamically to the living operating model** – strategy becomes a **continuous process rather than an annual ritual**.',
          fr: 'La direction pilote **de manière continue et adaptative** : l’IA fournit une **lecture actualisée en permanence de la situation**, capital, risques et ressources sont alloués **dynamiquement en fonction du modèle opérationnel vivant** – la stratégie devient un **processus continu plutôt qu’un rituel annuel**.',
        },
        leitfrage: {
          de: 'Wenn Kapital und Ressourcen künftig dynamisch am lebenden Betriebsmodell statt im starren Jahreszyklus allokiert werden – was würde Ihre Bank dann anders machen?',
          en: 'If capital and resources are allocated dynamically to the living operating model rather than in a rigid annual cycle – what would your bank then do differently?',
          fr: 'Si, demain, capital et ressources sont alloués dynamiquement en fonction du modèle opérationnel vivant, et non plus selon un cycle annuel rigide – que ferait alors votre banque différemment ?',
        },
      },
    ],
    activity: {
      image: {
        src: './images/Kapitel 9_Demo.png',
        alt: {
          de: 'Boardroom mit großem, frontal stehendem 16:9-Governance-Cockpit-Bildschirm für den Demo-Absprung.',
          en: 'A boardroom with a large, front-facing 16:9 governance-cockpit screen for the demo hand-off.',
          fr: 'Salle du conseil avec un grand écran 16:9 de cockpit de gouvernance, placé de face, pour l’accès à la démo.',
        },
      },
      title: { de: 'Vorstands-Cockpit: Steuern in Echtzeit', en: 'Board cockpit: steering in real time', fr: 'Cockpit de direction : piloter en temps réel' },
      text: {
        de: 'Provisorischer Platzhalter (Vorschlag). **Demo und Absprung folgen**. Hier soll das Governance-Cockpit zeigen, wie der Vorstand 2030 live auf Kapital, Risiko und KI-simulierte Szenarien schaut und eine Entscheidung durchspielt.',
        en: 'Provisional placeholder (proposal). **Demo and hand-off to follow**. Here the governance cockpit should show how the board in 2030 looks live at capital, risk and AI-simulated scenarios and plays through a decision.',
        fr: 'Contenu provisoire (proposition). **La démo et son accès suivront**. Le cockpit de gouvernance doit montrer ici comment, en 2030, la direction suit en direct le capital, les risques et les scénarios simulés par l’IA, et déroule une décision de bout en bout.',
      },
      buttonLabel: { de: 'Demo folgt', en: 'Demo to follow', fr: 'Démo à venir' },
      // TODO(Auftraggeber): finalen Handoff einsetzen (iframe-Demo / Tool).
      handoff: { kind: 'iframe', url: '', title: { de: 'Vorstands-Cockpit-Demo (folgt)', en: 'Board cockpit demo (to follow)', fr: 'Démo Cockpit de direction (à venir)' } },
    },
  },
]

/** Master-Strukturbild („Bank'26"), Übersicht + Intro-Reveal (zweisprachig). */
const RAW_MASTER_IMAGE: RawImageRef = {
  src: './images/Strukturbild.jpg',
  alt: {
    de: 'Fotorealistischer Gebäude-Querschnitt einer Bank mit vier Etagen und je zwei Räumen: oben Boardroom und Projektraum, darunter Corporate/HR und Serverraum, darunter Advisory und Backoffice-Großraum, im Erdgeschoss die Filiale (Schalter und Self-Service-Lounge). Ein zentraler Glas-Aufzug verbindet alle Etagen.',
    en: 'A photorealistic building cross-section of a bank with four floors and two rooms each: at the top the boardroom and project room, below them Corporate/HR and the server room, below those advisory and the open-plan back office, and on the ground floor the branch (counter and self-service lounge). A central glass elevator connects all floors.',
    fr: 'Vue en coupe photoréaliste d’une banque sur quatre étages comptant chacun deux salles : en haut la salle du conseil et la salle projet, en dessous Corporate/RH et la salle des serveurs, puis l’espace conseil et l’open space du back-office, et au rez-de-chaussée l’agence (guichet et espace libre-service). Un ascenseur vitré central relie tous les étages.',
  },
}

/** Echte Pixel-Auflösung des Master-Bildes (für die Kamera-Aspect-Ratio). */
export const MASTER_ASPECT = 3072 / 2048

// ─── Resolver: Roh (zweisprachig) → flach (aktive Sprache). ──────────────────

function localizeImage(image: RawImageRef, lang: Lang): ImageRef {
  return { src: image.src, alt: pick(image.alt, lang) }
}

function localizeHandoff(handoff: RawHandoff, lang: Lang): Handoff {
  if (handoff.kind === 'iframe') {
    return { kind: 'iframe', url: handoff.url, title: pick(handoff.title, lang) }
  }
  if (handoff.kind === 'video') {
    return { ...handoff, title: pick(handoff.title, lang) }
  }
  if (handoff.kind === 'extern') {
    return { ...handoff, title: pick(handoff.title, lang), hinweis: pick(handoff.hinweis, lang) }
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
  const rawBildTitel = BILD_TITEL_BY_IMAGE[imageKeyOf(h.image.src)]
  return {
    title: pick(h.title, lang),
    image: localizeImage(h.image, lang),
    statusQuo: pick(h.statusQuo, lang),
    in2030: pick(h.in2030, lang),
    ...(rawLeitfrage ? { leitfrage: pick(rawLeitfrage, lang) } : {}),
    ...(rawBildTitel
      ? {
          imageTitles: {
            statusQuo: pick(rawBildTitel.statusQuo, lang),
            in2030: pick(rawBildTitel.in2030, lang),
          },
        }
      : {}),
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
  // Optionaler Studien-Schritt + N Hypothesen + 1 Aktivität/Live-Demo
  // + 1 Management Summary (letzte Kachel).
  return stepOffsetForChapter(id) + (raw ? raw.hypotheses.length : 3) + 2
}

/**
 * Schritte VOR der ersten Hypothese: 1, wenn das Kapitel einen Studien-Schritt
 * (src/data/fakten.ts) hat, sonst 0. Reader, Deep-Links und Bearbeitungs-
 * Schlüssel rechnen damit, sodass Hypothese n immer Schritt n bleibt.
 */
export function stepOffsetForChapter(id: ChapterId | string): number {
  return hasFakt(id) ? 1 : 0
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
