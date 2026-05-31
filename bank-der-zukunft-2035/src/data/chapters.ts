// ─────────────────────────────────────────────────────────────────────────────
// CHAPTERS — die zentrale, editierbare Datenquelle für „Banking Horizon 2035".
//
// 7 Kapitel = 7 Zonen im Strukturbild. Jedes Kapitel besteht aus
//   · 3 Hypothesen-Vergleichsbildern (Status Quo links / 2035 rechts)
//   · 1 Aktivitäts-/Demo-Bild mit Absprung (iframe-Demo, Strategy Lab,
//     Co-Creation oder Kredit-Dilemma-Tool).
//
// BILD-SLOTS: Alle Bild-Pfade sind hier verdrahtet. Die Workshop-Bilder liegen
// als PNG unter `public/images/` — Schema: `Strukturbild.png` (Master) sowie
// pro Kapitel `Kapitel N_1.png` / `Kapitel N_2.png` / `Kapitel N_3.png`
// (Hypothesen) und `Kapitel N_Demo.png` (Aktivität), N = 1..7. Fehlt eine
// Datei, zeigt die App einen sauberen Platzhalter mit Dateiname (ImageSlot).
//
// Zoom-Koordinaten (ZONES) stammen aus dem Konzept und sind auf das neue
// Master-Bild „Bank'26" kalibriert. Im Browser ggf. um 1–2 % nachjustieren.
// ─────────────────────────────────────────────────────────────────────────────

export type ChapterId =
  | 'kunde'
  | 'vertrieb'
  | 'marktfolge'
  | 'corporate'
  | 'it'
  | 'compliance'
  | 'transformation'

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
}

export type ImageRef = {
  /** Pfad relativ zu public/ (z. B. './images/Kapitel 1_1.png'). */
  src: string
  /** Beschreibung für Screenreader + Platzhalter-Label. */
  alt: string
}

export type Hypothesis = {
  /** Knackige These-Überschrift (ohne „Hypothese N" — das ergänzt das UI). */
  title: string
  image: ImageRef
  /** Erläuternder Text (Panel rechts). „**fett**" wird unterstützt. */
  text: string
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
  hypotheses: [Hypothesis, Hypothesis, Hypothesis]
  activity: Activity
}

// Live-Demo des KI-Vertriebsarbeitsplatzes (bereits deployt). Wird im
// Vertriebs-Kapitel als „Vertriebscockpit" eingebunden.
const VERTRIEBSCOCKPIT_URL =
  'https://kiarbeitsplatz.pages.dev/vertriebsarbeitsplatz/dist/#/versicherung/landing/uebersicht'

export const CHAPTERS: Chapter[] = [
  // ── 01 Kundenperspektive · Plaza ──────────────────────────────────────────
  {
    id: 'kunde',
    kapitel: '01',
    label: 'Kundenperspektive',
    ort: 'Plaza (außen)',
    keyObject: 'Smartphone mit Banking-App',
    zone: { centerX: 6, centerY: 64, width: 12, height: 48, fit: 'contain' },
    hypotheses: [
      {
        title: 'Banking verschwindet als eigener Moment',
        image: {
          src: './images/Kapitel 1_1.png',
          alt: 'Status Quo: Kundin tippt aktiv in einer Banking-App. 2035: persönlicher KI-Finanzassistent arbeitet unaufgefordert im Hintergrund auf Smartwatch und Smartphone.',
        },
        text: 'Heute machen Kund:innen aktiv Banking — kanalzentriert und reaktiv. 2035 begleiten persönliche KI-Finanzassistenten kontinuierlich und proaktiv. Banking wird Teil des Alltags statt eigener Interaktion.',
      },
      {
        title: 'Optionen verschwinden, Entscheidungen werden vorbereitet',
        image: {
          src: './images/Kapitel 1_2.png',
          alt: 'Status Quo: Kunde ratlos vor vielen Produktoptionen. 2035: KI-Assistent präsentiert eine klare Empfehlung mit Simulation und Begründung.',
        },
        text: 'Heute erhalten Kunden Produktangebote und müssen selbst entscheiden. 2035 liefert KI klare Empfehlungen, Simulationen und Begründungen — der Kunde entscheidet auf Basis einer **AI-prepared decision**.',
      },
      {
        title: 'Von Reaktion zu proaktiver, teilautonomer Steuerung',
        image: {
          src: './images/Kapitel 1_3.png',
          alt: 'Status Quo: Kunde kontaktiert die Bank und wartet auf Reaktion. 2035: autonomer KI-Agent erkennt ein Ereignis früh und handelt, der Kunde gibt frei.',
        },
        text: 'Heute erfolgt Interaktion auf Kundeninitiative, die Bank reagiert. 2035 erkennen autonome KI-Agenten Ereignisse früh und handeln in Leitplanken — **trusted autonomy** mit Freigabelogik.',
      },
    ],
    activity: {
      image: {
        src: './images/Kapitel 1_Demo.png',
        alt: 'Person zu Hause mit persönlichem KI-Finanzbegleiter auf einem großen Tablet, dessen Bildschirm als leere 16:9-Fläche frontal zur Kamera zeigt.',
      },
      title: 'Demo Liquid: der Kunde entscheidet — auf AI-Basis',
      text: 'In der Demo entscheidet der Kunde — auf AI-Basis. Empfehlungen, Simulationen und Begründungen werden vorbereitet.',
      buttonLabel: 'Demo Liquid starten',
      // URL bewusst leer: Demo-URL hier eintragen, sobald „Liquid" verfügbar ist.
      handoff: { kind: 'iframe', url: '', title: 'Demo Liquid' },
    },
  },

  // ── 02 Markt & Vertrieb · Etage 3 ─────────────────────────────────────────
  {
    id: 'vertrieb',
    kapitel: '02',
    label: 'Markt & Vertrieb',
    ort: 'Etage 3 (Advisory)',
    keyObject: '„VERTRIEBS-COCKPIT"-Screen',
    zone: { centerX: 50, centerY: 50, width: 48, height: 18 },
    hypotheses: [
      {
        title: 'Vom Produktvertrieb zum Lösungsorchestrator',
        image: {
          src: './images/Kapitel 2_1.png',
          alt: 'Status Quo: produktzentriertes Verkaufsgespräch mit Broschüren. 2035: Berater und Kunde gestalten gemeinsam eine maßgeschneiderte Lösung mit holografischem KI-Display.',
        },
        text: 'Heute ist Vertrieb produkt- und kanalzentriert. 2035 wird die Bank zum kontext-basierten **Lösungsorchestrator** — der Kunde definiert das Ziel, nicht das Produktportfolio.',
      },
      {
        title: 'Vom Berater zum KI-augmentierten Strategieberater',
        image: {
          src: './images/Kapitel 2_2.png',
          alt: 'Status Quo: standardisiertes Beratungsgespräch nach Skript, KI nur kleines Tool. 2035: Berater als KI-augmentierter Sparringspartner mit reichem KI-Kontext-Display.',
        },
        text: 'Heute ist Beratung standardisiert und produktorientiert, KI nur Werkzeug. 2035 wird der Berater zum **KI-augmentierten Sparringspartner** — Standardtransaktionen autonom, der Mensch gewinnt bei Komplexität.',
      },
      {
        title: 'Kundenschnittstelle wird permanent und hyperpersonalisiert',
        image: {
          src: './images/Kapitel 2_3.png',
          alt: 'Status Quo: punktueller, reaktiver Kundenkontakt an fragmentiertem CRM. 2035: Agentensystem begleitet kanalübergreifend in Echtzeit auf mehreren Geräten.',
        },
        text: 'Heute ist Kundeninteraktion punktuell und reaktiv, CRM fragmentiert. 2035 begleiten Agentensysteme kontinuierlich, kanalübergreifend und in Echtzeit — **hyperpersonalisiert**.',
      },
    ],
    activity: {
      image: {
        src: './images/Kapitel 2_Demo.png',
        alt: 'Over-the-Shoulder-Blick eines Bankberaters auf einen großen Desktop-Monitor, dessen Bildschirm als leere 16:9-Fläche frontal zur Kamera zeigt.',
      },
      title: 'Vertriebscockpit: KI-augmentiert am Berater-Desktop',
      text: 'Der Berater bereitet sich auf den nächsten Termin vor. Das Vertriebscockpit läuft als App auf seinem Desktop — KI-augmentiert, kontextbasiert, lösungsorientiert.',
      buttonLabel: 'Vertriebscockpit öffnen',
      handoff: {
        kind: 'iframe',
        url: VERTRIEBSCOCKPIT_URL,
        title: 'KI-Arbeitsplatz — Vertriebscockpit (Live)',
      },
    },
  },

  // ── 03 Marktfolge · Etage 2 ───────────────────────────────────────────────
  {
    id: 'marktfolge',
    kapitel: '03',
    label: 'Marktfolge',
    ort: 'Etage 2 (Back-Office)',
    keyObject: '„WORKFLOW AUTOMATION"-Screen',
    zone: { centerX: 50, centerY: 68, width: 48, height: 18 },
    hypotheses: [
      {
        title: 'Marktfolge wird zur autonomen Dunkelverarbeitung',
        image: {
          src: './images/Kapitel 3_1.png',
          alt: 'Status Quo: Back-Office bearbeitet manuell Papierakten an Legacy-Bildschirmen. 2035: vollautonome Dunkelverarbeitung, Mensch nur bei einem komplexen Sonderfall.',
        },
        text: 'Heute: fragmentierte Prozesse, Legacy, hohe manuelle Anteile. 2035: Standardvorfälle laufen **vollautonom** (Kredit, KYC, Abwicklung E2E) — der Mensch nur bei komplexen Sonderfällen.',
      },
      {
        title: 'Interne Wertschöpfungskette bricht auf',
        image: {
          src: './images/Kapitel 3_2.png',
          alt: 'Status Quo: geschlossenes Back-Office, alles intern. 2035: modulare externe Utility-Plattformen übernehmen Standardbetrieb, die Bank orchestriert ein Ökosystem.',
        },
        text: 'Heute werden Leistungen überwiegend intern erbracht. 2035 übernehmen externe Plattformen und Utility-Modelle Standardleistungen — die Bank **orchestriert ein Service-Ökosystem**.',
      },
      {
        title: 'Marktfolge wird zur skalierbaren Serviceplattform',
        image: {
          src: './images/Kapitel 3_3.png',
          alt: 'Status Quo: Operations als interne Kostenstelle. 2035: skalierbare Banking-as-a-Service-Plattform, die standardisierte Services für Dritte anbietet.',
        },
        text: 'Heute gilt Marktfolge als interne Kosten- und Kontrollfunktion. 2035 wird sie zum **eigenständigen Geschäftsmodell** — standardisierte Banking-Services für Dritte.',
      },
    ],
    activity: {
      image: {
        src: './images/Kapitel 3_Demo.png',
        alt: 'Strategie-Workshop in einem modernen Bank-Besprechungsraum mit Entscheidungskarten und einem Board mit drei Rollen-Optionen.',
      },
      title: 'Marktfolge Strategy Lab: drei Entscheidungen in 60 Minuten',
      text: 'Marktfolge Strategy Lab: Drei Entscheidungen in 60 Minuten. Welche Zukunftsrolle? Was bleibt intern, was geht ins Ökosystem? Wo liegt Plattformpotenzial?',
      buttonLabel: 'Strategy Lab starten',
      handoff: { kind: 'strategy-lab' },
    },
  },

  // ── 04 Corporate Services · Etage 4 ───────────────────────────────────────
  {
    id: 'corporate',
    kapitel: '04',
    label: 'Corporate Services',
    ort: 'Etage 4 (HR / People & Culture)',
    keyObject: '„ORGANISATION"-Screen',
    zone: { centerX: 50, centerY: 32, width: 48, height: 17 },
    hypotheses: [
      {
        title: 'Vom Training zum kontinuierlichen Skill-Aufbau',
        image: {
          src: './images/Kapitel 4_1.png',
          alt: 'Status Quo: isoliertes Classroom-Training. 2035: kontinuierlicher, personalisierter Skill-Aufbau mit adaptivem KI-Lernbegleiter.',
        },
        text: 'Heute: isolierte, reaktive Weiterbildung. 2035: HR als **Enabler** — kontinuierliches Upskilling/Reskilling für neue Profile (AI-Translator) und agile Lernkultur.',
      },
      {
        title: 'Organisation wird durch Skills gesteuert',
        image: {
          src: './images/Kapitel 4_2.png',
          alt: 'Status Quo: starres funktionales Organigramm mit Silos. 2035: skills-getriebene, flexible Organisation, KI orchestriert Rollen und Teams als fluides Netzwerk.',
        },
        text: 'Heute ist die Organisation funktional, silo-orientiert, mit festen Stellenprofilen. 2035 wird sie flexibel — **AI orchestriert Skills, Rollen und Teams in Echtzeit**.',
      },
      {
        title: 'Workforce-Steuerung wird zum Wettbewerbsvorteil',
        image: {
          src: './images/Kapitel 4_3.png',
          alt: 'Status Quo: administrative, reaktive HR-Verwaltung. 2035: datenbasierte, vorausschauende Workforce-Steuerung auf einem Predictive-Analytics-Dashboard.',
        },
        text: 'Heute sind Corporate Services administrativ und reaktiv. 2035 steuern sie Workforce und Transformation **datenbasiert und vorausschauend** — ein Wettbewerbsvorteil.',
      },
    ],
    activity: {
      image: {
        src: './images/Kapitel 4_Demo.png',
        alt: 'Co-Creation-Workshop an Flipchart und Whiteboard voller Haftnotizen und Gestaltungsdimensionen.',
      },
      title: 'Co-Creation: Organisation unter Transformationsdruck',
      text: 'Co-Creation: Organisation unter Transformationsdruck. Zielbild für 2035 entlang vier Dimensionen — Skill-Aufbau, Organisationslogik, Workforce-Steuerung, Rolle Corporate Services.',
      buttonLabel: 'Zur Co-Creation',
      handoff: { kind: 'cocreation', variant: 'organisation' },
    },
  },

  // ── 05 Technologie / IT · Keller / Etage 1 ────────────────────────────────
  {
    id: 'it',
    kapitel: '05',
    label: 'Technologie / IT',
    ort: 'Keller / Etage 1 (Data Center)',
    keyObject: 'Monitoring-Arbeitsplatz',
    zone: { centerX: 50, centerY: 88, width: 60, height: 18 },
    hypotheses: [
      {
        title: 'Selbstoptimierende AI-Delivery ersetzt Entwicklung',
        image: {
          src: './images/Kapitel 5_1.png',
          alt: 'Status Quo: Entwickler schreiben und testen Software manuell. 2035: selbstoptimierende AI-Delivery, Software baut/testet/deployt sich selbst, Mensch überwacht nur.',
        },
        text: 'Heute: lineare, deterministische Entwicklungszyklen durch Menschen. 2035: Software entwickelt, testet und deployt sich **kontinuierlich selbst** durch AI-Systeme.',
      },
      {
        title: 'Entscheidungen verlagern sich zur AI, IT wird Plattform',
        image: {
          src: './images/Kapitel 5_2.png',
          alt: 'Status Quo: regelbasierte IT mit manuellen Freigaben und Monolith. 2035: AI entscheidet autonom in Leitplanken, IT als modulare, API-basierte Plattform.',
        },
        text: 'Heute: regelbasierte Steuerung, manuelle Freigaben, Monolithen. 2035: AI trifft Entscheidungen, der Mensch setzt Leitplanken — **IT als modulare, API-basierte Plattformen**.',
      },
      {
        title: 'Fachbereiche steuern direkt, IT verliert Gatekeeper-Rolle',
        image: {
          src: './images/Kapitel 5_3.png',
          alt: 'Status Quo: IT als separate Gatekeeper-Funktion, Fachbereich übergibt Anforderungen. 2035: Fachbereiche steuern AI-Systeme direkt selbst, Gatekeeping entfällt.',
        },
        text: 'Heute ist IT eine eigenständige Funktion, die Anforderungen umsetzt. 2035 steuern Fachbereiche direkt AI-Systeme — **Geschwindigkeit wird zum zentralen Wettbewerbsfaktor**.',
      },
    ],
    activity: {
      image: {
        src: './images/Kapitel 5_Demo.png',
        alt: 'Over-the-Shoulder-Blick eines IT-Engineers auf einen großen Desktop-Monitor, dessen Bildschirm als leere 16:9-Fläche frontal zur Kamera zeigt.',
      },
      title: 'Demo SDLC AI-Platform: Software entwickelt sich selbst',
      text: 'In der Demo entwickelt, testet und deployt sich Software selbst. Der Mensch definiert Leitplanken und Governance.',
      buttonLabel: 'SDLC AI-Platform starten',
      // URL bewusst leer: Demo-URL hier eintragen, sobald „SDLC AI-Platform" verfügbar ist.
      handoff: { kind: 'iframe', url: '', title: 'SDLC AI-Platform' },
    },
  },

  // ── 06 Compliance & Risk · Etage 5 ────────────────────────────────────────
  {
    id: 'compliance',
    kapitel: '06',
    label: 'Compliance & Risk',
    ort: 'Etage 5 (Boardroom)',
    keyObject: '„GOVERNANCE COCKPIT"-Screen',
    zone: { centerX: 50, centerY: 15, width: 48, height: 17 },
    hypotheses: [
      {
        title: 'Von ex-post-Kontrolle zu Echtzeitsteuerung',
        image: {
          src: './images/Kapitel 6_1.png',
          alt: 'Status Quo: ex-post-Compliance, nachträgliche Prüfung von Dokumenten und Stichproben. 2035: Echtzeit-Compliance direkt in den Systemen, Regeln im Live-Entscheidungs-Dashboard.',
        },
        text: 'Heute greifen Risk/Compliance nachgelagert und erzeugen zusätzliche Prozessschritte. 2035 sind regulatorische Anforderungen **direkt in Systeme und Entscheidungslogiken eingebettet**.',
      },
      {
        title: 'Three-Lines-of-Defense verliert seine Form',
        image: {
          src: './images/Kapitel 6_2.png',
          alt: 'Status Quo: drei getrennte Verteidigungslinien mit Stichproben. 2035: integrierte, kontinuierliche Kontrolle in einem KI-überwachten Governance-Cockpit mit CAIO im Zentrum.',
        },
        text: 'Heute sind Risk, Compliance und Operations klar getrennt, Kontrolle über Stichproben. 2035 wird Kontrolle technisch integriert und kontinuierlich überwacht — **CAIO im Mittelpunkt**.',
      },
      {
        title: 'Cyber- und Operational Risk verschmelzen mit dem Betriebsmodell',
        image: {
          src: './images/Kapitel 6_3.png',
          alt: 'Status Quo: Cyber- und Operational Risk als separate, perimeterorientierte Schutzfunktion. 2035: in das Betriebsmodell integriert, kontinuierliche Resilienzsteuerung im Live-Dashboard.',
        },
        text: 'Heute sind Cyber- und Operational Risk eine perimeterorientierte Schutzfunktion. 2035 werden sie integraler Bestandteil des Betriebsmodells — **kontinuierliche Resilienzsteuerung**.',
      },
    ],
    activity: {
      image: {
        src: './images/Kapitel 6_Demo.png',
        alt: 'Angespannter Entscheidungsmoment: Kunde am Telefon nach einer autonomen KI-Kreditentscheidung, im Hintergrund drei horizontale Status-Balken.',
      },
      title: 'Kredit-Dilemma: 100 Mio € — die KI lehnt autonom ab',
      text: 'Dilemma: Ein Großkunde beantragt einen Kredit über 100 Mio €, die KI lehnt autonom ab. Entscheiden Sie entlang des Telefongesprächs — drei Balken (Regulatorik, Geschwindigkeit, Zufriedenheit) reagieren. Wer hat freigegeben? Wer haftet? Wie wird kontrolliert?',
      buttonLabel: 'Szenario starten',
      handoff: { kind: 'kredit-dilemma' },
    },
  },

  // ── 07 Transformation · Glas-Aufzug ───────────────────────────────────────
  {
    id: 'transformation',
    kapitel: '07',
    label: 'Transformation',
    ort: 'Glas-Aufzug (vertikal)',
    keyObject: 'der Aufzug-Spine',
    zone: { centerX: 50, centerY: 50, width: 9, height: 90, fit: 'contain' },
    hypotheses: [
      {
        title: 'Ökosystem-Plattform mit integrierter Governance',
        image: {
          src: './images/Kapitel 7_1.png',
          alt: 'Status Quo: intern fokussierte Transformation an fragmentierten IT-/Prozessprojekten. 2035: AI-getriebene Ökosystem-Plattform aus Daten, Partnern und eingebauter Compliance.',
        },
        text: 'Heute ist Transformation intern fokussiert und fragmentiert. 2035 entsteht eine **AI-getriebene Ökosystem-Plattform** aus Daten, Ökosystem und Governance — Compliance als integraler Bestandteil.',
      },
      {
        title: 'AI-natives Entscheidungs-Operating-Model',
        image: {
          src: './images/Kapitel 7_2.png',
          alt: 'Status Quo: produkt- und silogetriebene Organisation, Transformation in starren Strukturen gefangen. 2035: AI-natives Operating Model, Journey-Teams mit E2E-Ownership und Human-in-the-loop.',
        },
        text: 'Heute ist die Organisation produkt-/silogetrieben, Transformation bleibt in Strukturen gefangen. 2035: **AI-natives Operating Model** entlang der Entscheidungslogik — Journey-Teams, E2E-Ownership, Human-in-the-loop.',
      },
      {
        title: 'Decision-first Transformation',
        image: {
          src: './images/Kapitel 7_3.png',
          alt: 'Status Quo: technologiegetriebene Transformation in vielen isolierten Use Cases ohne Priorität. 2035: decision-first mit klarer Roadmap und skalierbarer Decision Spine vor dem AI-Rollout.',
        },
        text: 'Heute startet Transformation technologiegetrieben in isolierten Use Cases. 2035 gilt **Decision-first**: erst kritische Decision Journeys und eine Decision Spine, dann der AI-Rollout.',
      },
    ],
    activity: {
      image: {
        src: './images/Kapitel 7_Demo.png',
        alt: 'Executive-Co-Creation im Boardroom rund um ein großes System-Diagramm und eine 2x2-Priorisierungsmatrix.',
      },
      title: 'Co-Creation: Future Interaction Model',
      text: 'Co-Creation: Future Interaction Model. Zielbild → Kontrolle → Priorisierung → Pilot. Wer entscheidet künftig (Mensch / AI / Hybrid)? Was geben wir ab, was zuerst, wo starten wir?',
      buttonLabel: 'Zur Co-Creation',
      handoff: { kind: 'cocreation', variant: 'future-interaction' },
    },
  },
]

/** Master-Strukturbild („Bank'26"), Übersicht + Intro-Reveal. */
export const MASTER_IMAGE: ImageRef = {
  src: './images/Strukturbild.png',
  alt: 'Orthografischer fotorealistischer Querschnitt einer Bank im Jahr 2026 — fünf Etagen von Compliance & Risk oben bis Technologie/IT unten, Plaza außen, zentraler Glas-Aufzug.',
}

/** Echte Pixel-Auflösung des Master-Bildes (für die Kamera-Aspect-Ratio). */
export const MASTER_ASPECT = 1536 / 1024

export function getChapter(id: ChapterId | null): Chapter | null {
  if (!id) return null
  return CHAPTERS.find((c) => c.id === id) ?? null
}
