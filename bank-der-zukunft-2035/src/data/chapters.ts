// ─────────────────────────────────────────────────────────────────────────────
// CHAPTERS — die zentrale, editierbare Datenquelle für „Banking Horizon 2035".
//
// 7 Kapitel = 7 Zonen im Strukturbild. Jedes Kapitel besteht aus
//   · 3 Hypothesen mit je einer Status-Quo- und einer In-2035-Aussage
//     (Vergleichsbild + zwei Text-Blöcke im Panel rechts)
//   · 1 Aktivitäts-/Demo-Bild mit Absprung (iframe-Demo, Strategy Lab,
//     Co-Creation oder Kredit-Dilemma-Tool).
//
// Hypothesen-Texte sind 1:1 aus dem Deck „Banking Horizon 2035 — Deep Dive".
//
// BILD-SLOTS: Alle Bild-Pfade sind hier verdrahtet. Die Workshop-Bilder liegen
// als PNG unter `public/images/` — Schema: `Strukturbild.png` (Master) sowie
// pro Kapitel `Kapitel N_1.png` / `Kapitel N_2.png` / `Kapitel N_3.png`
// (Hypothesen) und `Kapitel N_Demo.png` (Aktivität), N = 1..7.
//
// Zoom-Koordinaten (ZONES) sind auf das echte `Strukturbild.png`
// (1536×1024, 5 Etagen) kalibriert. Im Browser ggf. um 1–2 % nachjustieren.
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
  /**
   * Optional: Position von Label + Hotspot (% der Bild-Maße) — z. B. im
   * jeweiligen Raum statt im Zonen-Zentrum. Default: centerX / centerY.
   */
  labelX?: number
  labelY?: number
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
  /** In-2035-Block (1:1 aus dem Deck). */
  in2035: string
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
        statusQuo:
          'Kund:innen „machen Banking" aktiv über App, Filiale oder Online-Banking – Interaktion ist kanalzentriert und reaktiv.',
        in2035:
          'Banking erfolgt über persönliche KI-Finanzassistenten / Agents, die kontinuierlich begleiten, kontextualisieren und proaktiv relevante Impulse geben – Banking wird Teil des Alltags statt eigener Interaktion.',
        leitfrage: 'Wenn das stimmt – was bleibt von Ihrer Bank sichtbar?',
      },
      {
        title: 'Optionen verschwinden, Entscheidungen werden vorbereitet',
        image: {
          src: './images/Kapitel 1_2.png',
          alt: 'Status Quo: Kunde ratlos vor vielen Produktoptionen. 2035: KI-Assistent präsentiert eine klare Empfehlung mit Simulation und Begründung.',
        },
        statusQuo:
          'Kund:innen erhalten Produktangebote und müssen selbst entscheiden – wenig echte Entscheidungsunterstützung.',
        in2035:
          'KI liefert kontinuierliche Entscheidungsintelligenz: Klare Empfehlungen statt Optionen, Simulationen & Szenarien, Erklärung & Begründung → Kunde entscheidet, aber auf Basis einer „AI-prepared decision".',
      },
      {
        title: 'Von Reaktion zu proaktiver, teilautonomer Finanzsteuerung',
        image: {
          src: './images/Kapitel 1_3.png',
          alt: 'Status Quo: Kunde kontaktiert die Bank und wartet auf Reaktion. 2035: autonomer KI-Agent erkennt ein Ereignis früh und handelt, der Kunde gibt frei.',
        },
        statusQuo:
          'Interaktion erfolgt überwiegend auf Kund:inneninitiative – Bank reagiert auf Anfragen oder Ereignisse.',
        in2035:
          'Autonome KI-Agenten erkennen Ereignisse frühzeitig und handeln innerhalb definierter Leitplanken: Erkennen Muster / Risiken, initiieren Maßnahmen, agieren teilautonom („trusted autonomy") mit Freigabelogik.',
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
    zone: { centerX: 50, centerY: 50, width: 56, height: 18, labelX: 28, labelY: 51 },
    hypotheses: [
      {
        title: 'Vom Produktvertrieb zum Lösungsorchestrator',
        image: {
          src: './images/Kapitel 2_1.png',
          alt: 'Status Quo: produktzentriertes Verkaufsgespräch mit Broschüren. 2035: Berater und Kunde gestalten gemeinsam eine maßgeschneiderte Lösung mit holografischem KI-Display.',
        },
        statusQuo:
          'Bankvertrieb ist produkt- und kanalzentriert organisiert. Kundenbetreuung folgt standardisierten Modellen; Daten und Kanäle sind fragmentiert.',
        in2035:
          'Die Bank agiert als kontext-basierter Lösungsorchestrator: KI kombiniert Finanz-, Service- und Ökosystemleistungen dynamisch zu individuellen Lösungen. Der Kunde definiert das Ziel – nicht mehr das Produktportfolio.',
        leitfrage: 'Was passiert mit Ihrem Vertrieb, wenn das stimmt?',
      },
      {
        title: 'Vom Kund:innenberater zu KI-augmentierten Strategieberatern',
        image: {
          src: './images/Kapitel 2_2.png',
          alt: 'Status Quo: standardisiertes Beratungsgespräch nach Skript, KI nur kleines Tool. 2035: Berater als KI-augmentierter Sparringspartner mit reichem KI-Kontext-Display.',
        },
        statusQuo:
          'Beratung ist stark standardisiert und auf Produkte sowie Effizienz ausgerichtet. KI wird primär als Produktivitätswerkzeug eingesetzt.',
        in2035:
          'Kundenberater agieren als KI-augmentierte Sparringspartner mit Branchen- und Kontextverständnis. Standardtransaktionen laufen autonom; menschliche Beratung gewinnt bei komplexen Themen an Bedeutung.',
      },
      {
        title: 'Kund:innenschnittstelle wird permanent und hyperpersonalisiert',
        image: {
          src: './images/Kapitel 2_3.png',
          alt: 'Status Quo: punktueller, reaktiver Kundenkontakt an fragmentiertem CRM. 2035: Agentensystem begleitet kanalübergreifend in Echtzeit auf mehreren Geräten.',
        },
        statusQuo:
          'Kundeninteraktion erfolgt überwiegend punktuell und reaktiv. CRM- und Prozesslandschaften sind fragmentiert und wenig individualisiert.',
        in2035:
          'KI-basierte Agentensysteme begleiten Kunden kontinuierlich und kanalübergreifend in Echtzeit. Hyperpersonalisierte Betreuung und Produkte werden zum Standard.',
      },
    ],
    activity: {
      image: {
        src: './images/Kapitel 2_Demo.png',
        alt: 'Over-the-Shoulder-Blick eines Bankberaters auf einen großen Desktop-Monitor, dessen Bildschirm als leere 16:9-Fläche frontal zur Kamera zeigt.',
      },
      title: 'Vertriebscockpit: KI-augmentiert am Berater-Desktop',
      text: 'Der Berater bereitet sich auf den nächsten Termin vor. Das Vertriebscockpit läuft direkt auf seinem Monitor — KI-augmentiert, kontextbasiert, lösungsorientiert. Per Klick auf Vollbild.',
      buttonLabel: 'Vertriebscockpit im Vollbild',
      handoff: {
        kind: 'iframe',
        url: VERTRIEBSCOCKPIT_URL,
        title: 'KI-Arbeitsplatz — Vertriebscockpit (Live)',
      },
      // iframe direkt auf dem Monitor im Foto (Koordinaten in % von Kapitel 2_Demo.png).
      // Monitor + Bild sind 16:9 → widthPct ≈ heightPct. Klick auf den Button → Vollbild.
      screenOverlay: {
        url: VERTRIEBSCOCKPIT_URL,
        title: 'KI-Arbeitsplatz — Vertriebscockpit (Live)',
        leftPct: 36,
        topPct: 23,
        widthPct: 48,
        heightPct: 48,
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
    zone: { centerX: 50, centerY: 68, width: 56, height: 18, labelX: 70, labelY: 68 },
    hypotheses: [
      {
        title: 'Marktfolge wird zur autonomen Dunkelverarbeitung',
        image: {
          src: './images/Kapitel 3_1.png',
          alt: 'Status Quo: Back-Office bearbeitet manuell Papierakten an Legacy-Bildschirmen. 2035: vollautonome Dunkelverarbeitung, Mensch nur bei einem komplexen Sonderfall.',
        },
        statusQuo:
          'Marktfolge ist geprägt von fragmentierten Prozessen, Legacy-Systemen und hohen manuellen Bearbeitungsanteilen.',
        in2035:
          'Standardisierte Geschäftsvorfälle laufen vollständig autonom. KI steuert Kredit-, KYC- und Abwicklungsprozesse Ende-zu-Ende; Menschen bearbeiten nur (komplexe) Sonderfälle.',
      },
      {
        title: 'Interne Wertschöpfungskette bricht auf',
        image: {
          src: './images/Kapitel 3_2.png',
          alt: 'Status Quo: geschlossenes Back-Office, alles intern. 2035: modulare externe Utility-Plattformen übernehmen Standardbetrieb, die Bank orchestriert ein Ökosystem.',
        },
        statusQuo:
          'Betriebs- und Marktfolgeleistungen werden überwiegend intern erbracht; Kooperationen und Auslagerungen bleiben begrenzt.',
        in2035:
          'Externe Plattformen und KI-gestützte Utility-Modelle übernehmen große Teile standardisierter Betriebsleistungen. Banken orchestrieren modulare Service-Ökosysteme.',
      },
      {
        title: 'Marktfolge wird zur skalierbaren Serviceplattform',
        image: {
          src: './images/Kapitel 3_3.png',
          alt: 'Status Quo: Operations als interne Kostenstelle. 2035: skalierbare Banking-as-a-Service-Plattform, die standardisierte Services für Dritte anbietet.',
        },
        statusQuo:
          'Betriebs- und Abwicklungseinheiten gelten primär als interne Kosten- und Kontrollfunktion.',
        in2035:
          'Große Banken entwickeln Marktfolge- und Serviceplattformen zu eigenständigen Geschäftsmodellen und bieten standardisierte Banking-Services für Dritte an.',
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
    zone: { centerX: 50, centerY: 32, width: 56, height: 17, labelX: 30, labelY: 33 },
    hypotheses: [
      {
        title: 'Vom Training zum kontinuierlichen Skill-Aufbau',
        image: {
          src: './images/Kapitel 4_1.png',
          alt: 'Status Quo: isoliertes Classroom-Training. 2035: kontinuierlicher, personalisierter Skill-Aufbau mit adaptivem KI-Lernbegleiter.',
        },
        statusQuo:
          'Weiterbildungsinitiativen sind oft nicht entlang zukünftiger Kompetenzbedarfe (z. B. Daten- oder KI-Kompetenzen) ausgerichtet, sondern finden isoliert und reaktiv statt.',
        in2035:
          'HR als „Enabler" des Wandels: Fokus liegt auf Upskilling / Reskilling für neue Jobprofile („AI-Translator") und der Etablierung einer agilen Lernkultur.',
      },
      {
        title: 'Organisation wird durch Skills gesteuert, nicht durch Strukturen',
        image: {
          src: './images/Kapitel 4_2.png',
          alt: 'Status Quo: starres funktionales Organigramm mit Silos. 2035: skills-getriebene, flexible Organisation, KI orchestriert Rollen und Teams als fluides Netzwerk.',
        },
        statusQuo:
          'Organisationen sind funktional und silo-orientiert aufgebaut; Rollen und Zusammenarbeit folgen stabilen Hierarchien und festen Stellenprofilen.',
        in2035:
          'Organisation wird flexibel gesteuert – AI orchestriert Skills, Rollen und Teams in Echtzeit.',
      },
      {
        title: 'Workforce-Steuerung wird zum Wettbewerbsvorteil',
        image: {
          src: './images/Kapitel 4_3.png',
          alt: 'Status Quo: administrative, reaktive HR-Verwaltung. 2035: datenbasierte, vorausschauende Workforce-Steuerung auf einem Predictive-Analytics-Dashboard.',
        },
        // Hinweis: Status-Quo im Deck fehlerhaft (Copy-Paste-Bug). Platzhalter
        // gemäß Vorgabe — bei Vorliegen des Originaltexts ersetzen.
        statusQuo:
          'Workforce-Planung erfolgt überwiegend administrativ und reaktiv; die Steuerung von Skills und Transformation ist wenig datenbasiert und kaum vorausschauend.',
        in2035:
          'Corporate Services steuern Workforce und Transformation datenbasiert und vorausschauend.',
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
    zone: { centerX: 50, centerY: 88, width: 64, height: 18, labelX: 30, labelY: 88 },
    hypotheses: [
      {
        title: 'Selbstoptimierende AI-Delivery ersetzt Softwareentwicklung As-Is',
        image: {
          src: './images/Kapitel 5_1.png',
          alt: 'Status Quo: Entwickler schreiben und testen Software manuell. 2035: selbstoptimierende AI-Delivery, Software baut/testet/deployt sich selbst, Mensch überwacht nur.',
        },
        statusQuo:
          'Software wird in linearen, deterministischen Entwicklungszyklen durch Menschen erstellt, getestet und ausgerollt.',
        in2035:
          'Software entwickelt, testet und deployt sich kontinuierlich selbst durch AI-getriebene Systeme.',
      },
      {
        title: 'Entscheidungen verlagern sich zur AI & IT wird zur orchestrierten Plattform',
        image: {
          src: './images/Kapitel 5_2.png',
          alt: 'Status Quo: regelbasierte IT mit manuellen Freigaben und Monolith. 2035: AI entscheidet autonom in Leitplanken, IT als modulare, API-basierte Plattform.',
        },
        statusQuo:
          'IT steuert Systeme über Regeln, Prozesse und manuelle Freigaben mit klarer Kontrolle über Ergebnisse. Banken betreiben gewachsene, monolithische IT-Landschaften mit hoher Komplexität und geringer Anpassungsfähigkeit.',
        in2035:
          'AI-Systeme treffen eigenständig Entscheidungen, während die Bank primär Governance, Leitplanken und Kontrolle definiert. IT besteht aus modularen, API-basierten Plattformen, die flexibel orchestriert und dynamisch kombiniert werden.',
      },
      {
        title: 'Fachbereiche steuern direkt, IT verliert die Gatekeeper-Rolle',
        image: {
          src: './images/Kapitel 5_3.png',
          alt: 'Status Quo: IT als separate Gatekeeper-Funktion, Fachbereich übergibt Anforderungen. 2035: Fachbereiche steuern AI-Systeme direkt selbst, Gatekeeping entfällt.',
        },
        statusQuo:
          'IT ist eine eigenständige Funktion, die Anforderungen aus dem Business umsetzt und Systeme betreibt. Wettbewerb entsteht durch proprietäre Systeme und funktionale Differenzierung.',
        in2035:
          'Fachbereiche interagieren direkt mit AI-Systemen, während IT als eigenständige Funktion weitgehend verschwindet. Wettbewerb entsteht durch die Geschwindigkeit, mit der AI-Systeme neue Anforderungen umsetzen und optimieren.',
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
    zone: { centerX: 50, centerY: 15, width: 56, height: 17, labelX: 32, labelY: 16 },
    hypotheses: [
      {
        title: 'Von ex-post-Kontrolle zu kontinuierlicher Echtzeitsteuerung',
        image: {
          src: './images/Kapitel 6_1.png',
          alt: 'Status Quo: ex-post-Compliance, nachträgliche Prüfung von Dokumenten und Stichproben. 2035: Echtzeit-Compliance direkt in den Systemen, Regeln im Live-Entscheidungs-Dashboard.',
        },
        statusQuo:
          'Risiko- und Compliance-Funktionen greifen überwiegend nachgelagert ein und erzeugen zusätzliche Prozessschritte, die die Geschwindigkeit von Innovation reduzieren.',
        in2035:
          'Regulatorische Anforderungen sind direkt in Systeme und Entscheidungslogiken eingebettet.',
      },
      {
        title: 'Three-Lines-of-Defense-Modell verliert seine heutige Form',
        image: {
          src: './images/Kapitel 6_2.png',
          alt: 'Status Quo: drei getrennte Verteidigungslinien mit Stichproben. 2035: integrierte, kontinuierliche Kontrolle in einem KI-überwachten Governance-Cockpit mit CAIO im Zentrum.',
        },
        statusQuo:
          'Risikomanagement, Compliance und operative Einheiten sind organisatorisch klar getrennt; Kontrolle erfolgt überwiegend über definierte Verantwortlichkeiten, Stichproben und nachgelagerte Reviews.',
        in2035:
          'AI-gestützte Entscheidungen und autonome Prozesse erzwingen neue Governance-Modelle: Kontrolle wird zunehmend technisch integriert und kontinuierlich überwacht. CAIO im Mittelpunkt.',
      },
      {
        title: 'Cyber- und Operational Risk verschmelzen mit dem Betriebsmodell',
        image: {
          src: './images/Kapitel 6_3.png',
          alt: 'Status Quo: Cyber- und Operational Risk als separate, perimeterorientierte Schutzfunktion. 2035: in das Betriebsmodell integriert, kontinuierliche Resilienzsteuerung im Live-Dashboard.',
        },
        statusQuo:
          'Cybersecurity und Operational Risk werden weitgehend als unterstützende Kontroll- und Schutzfunktion organisiert. Sicherheitsmechanismen sind häufig nachgelagert und perimeterorientiert.',
        in2035:
          'Mit AI-first-Architekturen, Echtzeitintegration und offenen Plattformmodellen werden Cyber- und Operational Risks integraler Bestandteil des Betriebsmodells. Sicherheit verschiebt sich von Schutzmechanismen zu kontinuierlicher Resilienzsteuerung.',
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
        statusQuo:
          'Transformation fokussiert intern (IT, Prozesse, Compliance) – Ökosysteme, Datenbasis und Partnerintegration bleiben fragmentiert.',
        in2035:
          'Aufbau einer AI-getriebenen Plattform aus Daten, Ökosystem und Governance, in der Compliance integraler Bestandteil ist – nicht nachgelagerte Kontrollfunktion.',
      },
      {
        title: 'AI-natives Entscheidungs-Operating-Model',
        image: {
          src: './images/Kapitel 7_2.png',
          alt: 'Status Quo: produkt- und silogetriebene Organisation, Transformation in starren Strukturen gefangen. 2035: AI-natives Operating Model, Journey-Teams mit E2E-Ownership und Human-in-the-loop.',
        },
        statusQuo:
          'Organisation, Governance und Prozesse sind produkt- und silogetrieben; Transformation bleibt in bestehenden Strukturen gefangen.',
        in2035:
          'Transformation erfolgt durch den Aufbau eines AI-nativen Operating Models entlang der Entscheidungslogik. End-to-End Ownership, Journey-Teams sowie Human-in-the-loop und AI-Governance sind fester Bestandteil.',
      },
      {
        title: 'Decision-first Transformation',
        image: {
          src: './images/Kapitel 7_3.png',
          alt: 'Status Quo: technologiegetriebene Transformation in vielen isolierten Use Cases ohne Priorität. 2035: decision-first mit klarer Roadmap und skalierbarer Decision Spine vor dem AI-Rollout.',
        },
        statusQuo:
          'Transformation startet primär technologie-(AI)-getrieben und verteilt sich auf isolierte Use Cases ohne klare Priorisierung.',
        in2035:
          'Transformation erfolgt nach einem Decision-first-Ansatz mit klarer Sequenzierung. Im Fokus stehen zunächst wenige kritische Decision Journeys und der Aufbau einer skalierbaren Decision Spine, bevor AI und Technologie systematisch ausgerollt werden.',
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

/**
 * Alle Bildpfade (Master + 21 Hypothesen + 7 Aktivitäten) — zum Vorladen beim
 * App-Start, damit das Öffnen eines Kapitels ohne Ladeverzögerung erfolgt.
 */
export function getAllImageSrcs(): string[] {
  const srcs = [MASTER_IMAGE.src]
  for (const c of CHAPTERS) {
    for (const h of c.hypotheses) srcs.push(h.image.src)
    srcs.push(c.activity.image.src)
  }
  return srcs
}
