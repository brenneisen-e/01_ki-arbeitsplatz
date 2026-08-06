// ─────────────────────────────────────────────────────────────────────────────
// BILD_TITEL_BY_IMAGE — prägnante Bild-Überschriften je Vergleichsbild-Hälfte,
// gekeyt auf die Bildnummer ("1_2", "3_4", … wie LEITFRAGE_BY_IMAGE). Sie stehen
// im ChapterReader als Kopfzeile über der jeweiligen Bildhälfte (links Heute,
// rechts 2030) und benennen knapp, was die Szene zeigt.
//
// Stil: 2–5 Wörter, plakativ, kein Satzzeichen am Ende.
// (Das Transformationskapitel 7_x ist bewusst NICHT enthalten — es zeigt das
//  Deloitte-Offering statt Hypothesen.)
// ─────────────────────────────────────────────────────────────────────────────

import type { L } from '../i18n/LanguageContext'

export const BILD_TITEL_BY_IMAGE: Record<string, { statusQuo: L; in2030: L }> = {
  '1_1': {
    statusQuo: { de: 'App öffnen, selbst erledigen', en: 'Open the app, do it yourself' },
    in2030: { de: 'Der Assistent arbeitet im Hintergrund', en: 'The assistant works in the background' },
  },
  '1_2': {
    statusQuo: { de: 'Viele Optionen, keine Orientierung', en: 'Many options, no guidance' },
    in2030: { de: 'Eine klare, begründete Empfehlung', en: 'One clear, reasoned recommendation' },
  },
  '1_3': {
    statusQuo: { de: 'Warten auf die Bank', en: 'Waiting for the bank' },
    in2030: { de: 'Finanzierung schon vorbereitet', en: 'Financing already prepared' },
  },
  '2_1': {
    statusQuo: { de: 'Produkte aus der Broschüre', en: 'Products from the brochure' },
    in2030: { de: 'Lösung gemeinsam komponiert', en: 'Solutions composed together' },
  },
  '2_2': {
    statusQuo: { de: 'Beratung nach Skript', en: 'Advice by script' },
    in2030: { de: 'Sparringspartner mit KI-Kontext', en: 'Sparring partner with AI context' },
  },
  '2_3': {
    statusQuo: { de: 'Punktueller Kontakt im CRM', en: 'Occasional contact in the CRM' },
    in2030: { de: 'Permanent begleitet, auf jedem Kanal', en: 'Continuously accompanied on every channel' },
  },
  '3_1': {
    statusQuo: { de: 'Manuelle Sachbearbeitung', en: 'Manual case processing' },
    in2030: { de: 'Autonome Dunkelverarbeitung', en: 'Autonomous straight-through processing' },
  },
  '3_2': {
    statusQuo: { de: 'Alles bleibt im Haus', en: 'Everything stays in-house' },
    in2030: { de: 'Orchestriertes Partner-Ökosystem', en: 'An orchestrated partner ecosystem' },
  },
  '3_3': {
    statusQuo: { de: 'Interne Kostenstelle', en: 'An internal cost centre' },
    in2030: { de: 'Serviceplattform für Dritte', en: 'A service platform for third parties' },
  },
  '3_4': {
    statusQuo: { de: 'Compliance prüft am Ende', en: 'Compliance checks at the end' },
    in2030: { de: 'Compliant by Design', en: 'Compliant by design' },
  },
  '4_1': {
    statusQuo: { de: 'Training im Seminarraum', en: 'Classroom training' },
    in2030: { de: 'Täglicher Skill-Aufbau mit KI', en: 'Daily skill building with AI' },
  },
  '4_2': {
    statusQuo: { de: 'Starres Organigramm', en: 'A rigid org chart' },
    in2030: { de: 'Fluides Skill-Netzwerk', en: 'A fluid skills network' },
  },
  '4_3': {
    statusQuo: { de: 'HR verwaltet reaktiv', en: 'HR administers reactively' },
    in2030: { de: 'Workforce vorausschauend gesteuert', en: 'Workforce steered predictively' },
  },
  '4_4': {
    statusQuo: { de: 'E-Learning von der Stange', en: 'Off-the-shelf e-learning' },
    in2030: { de: 'Immersiv und passgenau lernen', en: 'Immersive, tailored learning' },
  },
  '4_5': {
    statusQuo: { de: 'Qualifizierung nur für Junge', en: 'Upskilling only for the young' },
    in2030: { de: 'Lebenslanges Reskilling für alle', en: 'Lifelong reskilling for everyone' },
  },
  '5_1': {
    statusQuo: { de: 'Software von Hand gebaut', en: 'Software built by hand' },
    in2030: { de: 'Software baut sich selbst', en: 'Software builds itself' },
  },
  '5_2': {
    statusQuo: { de: 'Manuelle Freigaben, Monolith', en: 'Manual approvals, a monolith' },
    in2030: { de: 'AI entscheidet in Leitplanken', en: 'AI decides within guardrails' },
  },
  '5_3': {
    statusQuo: { de: 'IT als Gatekeeper', en: 'IT as gatekeeper' },
    in2030: { de: 'Fachbereich steuert direkt', en: 'Business units steer directly' },
  },
  '6_1': {
    statusQuo: { de: 'Prüfung im Nachhinein', en: 'Checks after the fact' },
    in2030: { de: 'Echtzeit-Compliance im System', en: 'Real-time compliance in the systems' },
  },
  '6_2': {
    statusQuo: { de: 'Drei getrennte Linien', en: 'Three separate lines' },
    in2030: { de: 'Integriertes Governance-Cockpit', en: 'An integrated governance cockpit' },
  },
  '6_3': {
    statusQuo: { de: 'Schutzwall am Perimeter', en: 'A wall at the perimeter' },
    in2030: { de: 'Resilienz im Betriebsmodell', en: 'Resilience in the operating model' },
  },
  '6_4': {
    statusQuo: { de: 'Revision mit Aktenordnern', en: 'Audit with binders' },
    in2030: { de: 'Explainability-Cockpit', en: 'An explainability cockpit' },
  },
  '8_1': {
    statusQuo: { de: 'Ein Produkt für alle', en: 'One product for everyone' },
    in2030: { de: 'Segment of One', en: 'Segment of one' },
  },
  '8_2': {
    statusQuo: { de: 'Vertrag im Ordner', en: 'Contracts in a binder' },
    in2030: { de: 'Das Produkt passt sich an', en: 'Products adapt themselves' },
  },
  '8_3': {
    statusQuo: { de: 'Jahre bis zum Produkt', en: 'Years to a product' },
    in2030: { de: 'Neue Produkte in Tagen', en: 'New products in days' },
  },
  '9_1': {
    statusQuo: { de: 'Quartalsbericht im Rückspiegel', en: 'Quarterly reports in the rear-view mirror' },
    in2030: { de: 'Echtzeit-Cockpit im Datenraum', en: 'A real-time cockpit in the data room' },
  },
  '9_2': {
    statusQuo: { de: 'Governance delegiert', en: 'Governance delegated' },
    in2030: { de: 'KI-Leitplanken sind Chefsache', en: 'AI guardrails owned at the top' },
  },
  '9_3': {
    statusQuo: { de: 'Starrer Jahreszyklus', en: 'A rigid annual cycle' },
    in2030: { de: 'Kontinuierliche Steuerung', en: 'Continuous steering' },
  },
}
