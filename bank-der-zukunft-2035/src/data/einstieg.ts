// ─────────────────────────────────────────────────────────────────────────────
// EINSTIEG — „Einstiegsbühne" je Raum-Kapitel.
//
// Beim Reinzoomen in einen Raum zeigt die App zunächst das hochauflösende
// Raum-Detailbild groß, dazu Kapitelname und eine „Heute vs. Morgen"-Kurz-
// beschreibung im McKinsey-Executive-Stil (essenz = die so-what-Botschaft).
// Zweisprachig; NUR die 8 raumgebundenen Kapitel (kein `transformation`).
// ─────────────────────────────────────────────────────────────────────────────

import type { ChapterId } from './chapters'
import type { L } from '../i18n/LanguageContext'

export type Einstieg = { essenz: L; heute: L; morgen: L }

export const EINSTIEG: Record<Exclude<ChapterId, 'transformation'>, Einstieg> = {
  kunde: {
    essenz: {
      de: 'Banking verschwindet als eigener Moment und wird zur proaktiven, KI-gesteuerten Finanzbegleitung im Alltag — der Kunde entscheidet, aber auf vorbereiteter Basis.',
      en: 'Banking ceases to be a distinct moment and becomes proactive, AI-driven financial guidance in everyday life — the customer decides, but on a prepared basis.',
    },
    heute: {
      de: 'Kund:innen machen Banking aktiv über App, Filiale und Online — kanalzentriert und reaktiv. Sie erhalten Produktoptionen und entscheiden allein, während die Bank auf ihre Initiative wartet.',
      en: 'Customers do banking actively via app, branch and online — channel-centric and reactive. They receive product options and decide alone, while the bank waits for their initiative.',
    },
    morgen: {
      de: 'Persönliche KI-Finanzassistenten begleiten kontinuierlich, verdichten Optionen zu klaren, simulierten Empfehlungen und handeln innerhalb vereinbarter Leitplanken proaktiv. Aus Warten wird teilautonome Finanzsteuerung mit Vertrauensmandat.',
      en: 'Personal AI financial assistants accompany continuously, distil options into clear, simulated recommendations and act proactively within agreed guardrails. Waiting gives way to semi-autonomous financial management with a trust mandate.',
    },
  },
  vertrieb: {
    essenz: {
      de: 'Vertrieb verkauft keine Produkte mehr, sondern orchestriert KI-gestützt individuelle Lösungen entlang der Kundenziele — Berater:innen werden zu Sparringspartnern für die komplexen Entscheidungen.',
      en: 'Distribution no longer sells products but orchestrates individual, AI-driven solutions around customer goals — advisors become sparring partners for the complex decisions.',
    },
    heute: {
      de: 'Vertrieb ist produkt- und kanalzentriert, Beratung folgt standardisierten Skripten, und KI dient nur als Produktivitätswerkzeug. Kundenkontakt bleibt punktuell und reaktiv auf fragmentierten CRM-Landschaften.',
      en: 'Distribution is product- and channel-centric, advice follows standardised scripts, and AI serves only as a productivity tool. Customer contact stays sporadic and reactive on fragmented CRM landscapes.',
    },
    morgen: {
      de: 'Die Bank orchestriert Finanz-, Service- und Ökosystemleistungen in Echtzeit zu individuellen Lösungen, und Berater:innen agieren als KI-augmentierte Sparringspartner bei komplexen Themen. Die Kundenbeziehung wird permanent, kanalübergreifend und hyperpersonalisiert.',
      en: 'The bank orchestrates financial, service and ecosystem capabilities in real time into individual solutions, and advisors act as AI-augmented sparring partners on complex topics. The customer relationship becomes permanent, cross-channel and hyper-personalised.',
    },
  },
  marktfolge: {
    essenz: {
      de: 'Die Marktfolge wandelt sich vom internen Kostenblock zur wertschöpfenden Plattform: Standardvorfälle laufen vollautonom Ende-zu-Ende, und die besten Services skalieren als Banking-as-a-Service für Dritte.',
      en: 'Operations shift from an internal cost block to a value-creating platform: standard cases run fully autonomously end-to-end, and the best services scale as banking-as-a-service for third parties.',
    },
    heute: {
      de: 'Die Marktfolge arbeitet mit fragmentierten Prozessen, Legacy-Systemen und hohem manuellem Anteil, überwiegend intern erbracht und als Kostenstelle geführt. Compliance greift nachgelagert als separater Kontrollschritt.',
      en: 'Operations run on fragmented processes, legacy systems and high manual effort, largely delivered in-house and managed as a cost centre. Compliance intervenes downstream as a separate control step.',
    },
    morgen: {
      de: 'Standardvorfälle laufen als vollautonome Dunkelverarbeitung Ende-zu-Ende, Menschen lösen nur noch komplexe Sonderfälle, und Regulatorik ist compliant by design eingebaut. Die Bank orchestriert ein modulares Ökosystem und bietet ihre besten Services als Banking-as-a-Service für Dritte an.',
      en: 'Standard cases run as fully autonomous straight-through processing end-to-end, people only resolve complex exceptions, and regulation is built in compliant by design. The bank orchestrates a modular ecosystem and offers its best services as banking-as-a-service to third parties.',
    },
  },
  corporate: {
    essenz: {
      de: 'Corporate Services werden zum Enabler des Wandels: Die Organisation wird nicht mehr über starre Strukturen, sondern über Skills, Rollen und Teams in Echtzeit gesteuert — getragen von kontinuierlichem, KI-gestütztem Reskilling.',
      en: 'Corporate Services become the enabler of change: the organisation is steered no longer by rigid structures but by skills, roles and teams in real time — carried by continuous, AI-supported reskilling.',
    },
    heute: {
      de: 'Weiterbildung findet isoliert und reaktiv in klassischen Formaten statt, kaum an künftigen Skill-Bedarfen ausgerichtet. Die Organisation ist funktional und silo-orientiert, Workforce-Planung administrativ und rückwärtsgewandt.',
      en: 'Upskilling happens in isolation and reactively in classic formats, barely aligned with future skill needs. The organisation is functional and siloed, and workforce planning is administrative and backward-looking.',
    },
    morgen: {
      de: 'HR treibt kontinuierliches Up- und Reskilling für neue Profile wie den AI-Translator, immersiv und KI-personalisiert bis ins Alter 50+. KI orchestriert Skills, Rollen und Teams in Echtzeit, und datenbasierte, vorausschauende Workforce-Steuerung wird zum Wettbewerbsvorteil.',
      en: 'HR drives continuous up- and reskilling for new profiles such as the AI translator, immersive and AI-personalised well into age 50+. AI orchestrates skills, roles and teams in real time, and data-driven, forward-looking workforce management becomes a competitive advantage.',
    },
  },
  it: {
    essenz: {
      de: 'Software entwickelt, testet und deployt sich weitgehend selbst; die IT wird zur modularen Plattform, verliert ihre Gatekeeper-Rolle — und der Vorsprung entsteht aus reiner Umsetzungsgeschwindigkeit.',
      en: 'Software largely develops, tests and deploys itself; IT becomes a modular platform, loses its gatekeeper role — and the edge comes purely from delivery speed.',
    },
    heute: {
      de: 'Software entsteht in linearen, deterministischen Zyklen durch Menschen, gesteuert über Regeln und manuelle Freigaben auf monolithischen Landschaften. Die IT ist eine eigenständige Funktion und Gatekeeper zwischen Business und System.',
      en: 'Software is built by people in linear, deterministic cycles, steered via rules and manual approvals on monolithic landscapes. IT is a standalone function and gatekeeper between business and system.',
    },
    morgen: {
      de: 'Software entwickelt, testet und deployt sich kontinuierlich selbst, während KI autonom innerhalb gesetzter Governance und Leitplanken entscheidet. Fachbereiche steuern die modulare, API-basierte Plattform direkt — die Gatekeeper-Rolle der IT verschwindet, der Vorsprung entsteht aus Geschwindigkeit.',
      en: 'Software continuously develops, tests and deploys itself, while AI decides autonomously within the governance and guardrails we set. Business units steer the modular, API-based platform directly — IT loses its gatekeeper role, and the edge comes from speed.',
    },
  },
  compliance: {
    essenz: {
      de: 'Compliance ist kein nachgelagerter Bremsklotz mehr, sondern in jede Entscheidung eingebaut: aus Stichprobe und Ex-post-Review wird kontinuierliche, technisch integrierte Echtzeit-Kontrolle mit dem CAIO im Zentrum.',
      en: 'Compliance is no longer a downstream brake but built into every decision: sampling and ex-post review give way to continuous, technically integrated real-time control with the CAIO at the centre.',
    },
    heute: {
      de: 'Risiko und Compliance greifen nachgelagert ein, erzeugen zusätzliche Prozessschritte und bremsen Innovation bei hohen Kosten. Drei getrennte Verteidigungslinien kontrollieren über Stichproben, und Cybersecurity bleibt perimeterorientierte Schutzfunktion.',
      en: 'Risk and compliance intervene downstream, create additional process steps and slow innovation at high cost. Three separate lines of defence control via sampling, and cybersecurity remains a perimeter-oriented protective function.',
    },
    morgen: {
      de: 'Regulatorik ist direkt in Systeme und Entscheidungslogiken eingebettet, Kontrolle läuft kontinuierlich und technisch integriert in Echtzeit mit dem CAIO im Zentrum. Cyber- und Operational Risk werden untrennbarer Teil des Betriebsmodells, und Compliance sichert als Enabler die Explainability jeder wesentlichen KI-Entscheidung.',
      en: 'Regulation is embedded directly into systems and decision logic, and control runs continuously and technically integrated in real time with the CAIO at the centre. Cyber and operational risk become an inseparable part of the operating model, and compliance, as an enabler, secures the explainability of every material AI decision.',
    },
  },
  projekt: {
    essenz: {
      de: 'Der Produktkatalog verschwindet: KI komponiert im Moment des Bedarfs lebende, adaptive Lösungen für das Segment of One — und entwickelt sie kontinuierlich statt in Jahresprojekten, die Time-to-Market fällt von Jahren auf Tage.',
      en: 'The product catalogue disappears: at the moment of need, AI composes living, adaptive solutions for the segment of one — and develops them continuously rather than in annual projects, dropping time-to-market from years to days.',
    },
    heute: {
      de: 'Banken bieten standardisierte Produktkataloge für breite Segmente, individualisierbar nur über wenige Parameter. Produkte sind statisch, jede Anpassung erfordert einen Neuabschluss, und die Entwicklung dauert Monate bis Jahre.',
      en: 'Banks offer standardised product catalogues for broad segments, individualisable only through a few parameters. Products are static, every adjustment requires a new contract, and development takes months to years.',
    },
    morgen: {
      de: 'KI komponiert aus modularen Bausteinen hyperpersonalisierte Lösungen für das Segment of One, die sich als lebende Services innerhalb von Leitplanken selbst an Lebensereignisse anpassen. Neue Produkte entstehen kontinuierlich, compliant by design — Time-to-Market sinkt auf Tage.',
      en: 'From modular building blocks, AI composes hyper-personalised solutions for the segment of one that adapt themselves as living services to life events within guardrails. New products emerge continuously, compliant by design — time-to-market drops to days.',
    },
  },
  vorstand: {
    essenz: {
      de: 'Der Vorstand steuert die Bank datenbasiert in Echtzeit und macht AI-Governance zur Chefsache — aus dem jährlichen Strategiezyklus wird kontinuierliche, adaptive Steuerung.',
      en: 'The board steers the bank on live data in real time and makes AI governance a board responsibility — the annual strategy cycle becomes continuous, adaptive steering.',
    },
    heute: {
      de: 'Der Vorstand entscheidet auf periodischen, rückwärtsgerichteten Berichten, oft aus Erfahrung und Bauchgefühl, mit Wochen zwischen Ereignis und Entscheidung. KI-Verantwortung ist an Fachbereiche und IT delegiert, und Strategie wie Kapitalallokation folgen einem starren Jahreszyklus.',
      en: 'The board decides on periodic, backward-looking reports, often from experience and gut feeling, with weeks between event and decision. Responsibility for AI is delegated to business units and IT, and strategy and capital allocation follow a rigid annual cycle.',
    },
    morgen: {
      de: 'Ein Echtzeit-Governance-Cockpit bündelt Kapital, Liquidität, Risiko und Ertrag live, KI simuliert Handlungsoptionen, und der Vorstand verantwortet Leitplanken, Risikoappetit und Ethik der KI zentral. Aus dem Jahreszyklus wird kontinuierliche, adaptive Steuerung mit dynamischer Kapitalallokation.',
      en: 'A real-time governance cockpit brings capital, liquidity, risk and earnings together live, AI simulates options for action, and the board owns the guardrails, risk appetite and ethics of AI centrally. The annual cycle gives way to continuous, adaptive steering with dynamic capital allocation.',
    },
  },
}

/** Raum-Detailbild je Kapitel (public/images/rooms/<id>.png). */
export function einstiegImage(id: ChapterId): string {
  return `./images/rooms/${id}.png`
}

/** Hat dieses Kapitel eine Einstiegsbühne (alle Raum-Kapitel außer Aufzug)? */
export function hasEinstieg(id: ChapterId): id is Exclude<ChapterId, 'transformation'> {
  return id !== 'transformation'
}
