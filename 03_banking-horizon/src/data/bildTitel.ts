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
    statusQuo: { de: 'App öffnen, selbst erledigen', en: 'Open the app, do it yourself', fr: 'Ouvrir l’app, tout faire soi-même' },
    in2030: { de: 'Der Assistent arbeitet im Hintergrund', en: 'The assistant works in the background', fr: 'L’assistant agit en coulisses' },
  },
  '1_2': {
    statusQuo: { de: 'Viele Optionen, keine Orientierung', en: 'Many options, no guidance', fr: 'Beaucoup d’options, aucun repère' },
    in2030: { de: 'Eine klare, begründete Empfehlung', en: 'One clear, reasoned recommendation', fr: 'Une recommandation claire et argumentée' },
  },
  '1_3': {
    statusQuo: { de: 'Warten auf die Bank', en: 'Waiting for the bank', fr: 'Attendre la banque' },
    in2030: { de: 'Finanzierung schon vorbereitet', en: 'Financing already prepared', fr: 'Financement déjà préparé' },
  },
  '2_1': {
    statusQuo: { de: 'Produkte aus der Broschüre', en: 'Products from the brochure', fr: 'Des produits sur brochure' },
    in2030: { de: 'Lösung gemeinsam komponiert', en: 'Solutions composed together', fr: 'Une solution co-construite' },
  },
  '2_2': {
    statusQuo: { de: 'Beratung nach Skript', en: 'Advice by script', fr: 'Conseil scripté' },
    in2030: { de: 'Sparringspartner mit KI-Kontext', en: 'Sparring partner with AI context', fr: 'Sparring-partner éclairé par l’IA' },
  },
  '2_3': {
    statusQuo: { de: 'Punktueller Kontakt im CRM', en: 'Occasional contact in the CRM', fr: 'Contact ponctuel dans le CRM' },
    in2030: { de: 'Permanent begleitet, auf jedem Kanal', en: 'Continuously accompanied on every channel', fr: 'Accompagné en continu, sur tous les canaux' },
  },
  '3_1': {
    statusQuo: { de: 'Manuelle Sachbearbeitung', en: 'Manual case processing', fr: 'Traitement manuel des dossiers' },
    in2030: { de: 'Autonome Dunkelverarbeitung', en: 'Autonomous straight-through processing', fr: 'Traitement STP autonome' },
  },
  '3_2': {
    statusQuo: { de: 'Alles bleibt im Haus', en: 'Everything stays in-house', fr: 'Tout reste en interne' },
    in2030: { de: 'Orchestriertes Partner-Ökosystem', en: 'An orchestrated partner ecosystem', fr: 'Écosystème de partenaires orchestré' },
  },
  '3_3': {
    statusQuo: { de: 'Interne Kostenstelle', en: 'An internal cost centre', fr: 'Centre de coûts interne' },
    in2030: { de: 'Serviceplattform für Dritte', en: 'A service platform for third parties', fr: 'Plateforme de services pour tiers' },
  },
  '3_4': {
    statusQuo: { de: 'Compliance prüft am Ende', en: 'Compliance checks at the end', fr: 'La conformité vérifie à la fin' },
    in2030: { de: 'Compliant by Design', en: 'Compliant by design', fr: 'Conformité dès la conception' },
  },
  '4_1': {
    statusQuo: { de: 'Training im Seminarraum', en: 'Classroom training', fr: 'Formation en salle' },
    in2030: { de: 'Täglicher Skill-Aufbau mit KI', en: 'Daily skill building with AI', fr: 'Se former chaque jour avec l’IA' },
  },
  '4_2': {
    statusQuo: { de: 'Starres Organigramm', en: 'A rigid org chart', fr: 'Organigramme figé' },
    in2030: { de: 'Fluides Skill-Netzwerk', en: 'A fluid skills network', fr: 'Réseau fluide de compétences' },
  },
  '4_3': {
    statusQuo: { de: 'HR verwaltet reaktiv', en: 'HR administers reactively', fr: 'Des RH en mode réactif' },
    in2030: { de: 'Workforce vorausschauend gesteuert', en: 'Workforce steered predictively', fr: 'Effectifs pilotés par anticipation' },
  },
  '4_4': {
    statusQuo: { de: 'E-Learning von der Stange', en: 'Off-the-shelf e-learning', fr: 'E-learning standardisé' },
    in2030: { de: 'Immersiv und passgenau lernen', en: 'Immersive, tailored learning', fr: 'Apprentissage immersif et sur mesure' },
  },
  '4_5': {
    statusQuo: { de: 'Qualifizierung nur für Junge', en: 'Upskilling only for the young', fr: 'Formation réservée aux jeunes' },
    in2030: { de: 'Lebenslanges Reskilling für alle', en: 'Lifelong reskilling for everyone', fr: 'Reskilling à vie pour tous' },
  },
  '5_1': {
    statusQuo: { de: 'Software von Hand gebaut', en: 'Software built by hand', fr: 'Logiciel fait à la main' },
    in2030: { de: 'Software baut sich selbst', en: 'Software builds itself', fr: 'Le logiciel se construit seul' },
  },
  '5_2': {
    statusQuo: { de: 'Manuelle Freigaben, Monolith', en: 'Manual approvals, a monolith', fr: 'Validations manuelles, monolithe' },
    in2030: { de: 'AI entscheidet in Leitplanken', en: 'AI decides within guardrails', fr: 'L’IA décide dans des garde-fous' },
  },
  '5_3': {
    statusQuo: { de: 'IT als Gatekeeper', en: 'IT as gatekeeper', fr: 'L’IT en gardien du temple' },
    in2030: { de: 'Fachbereich steuert direkt', en: 'Business units steer directly', fr: 'Les métiers pilotent en direct' },
  },
  '6_1': {
    statusQuo: { de: 'Prüfung im Nachhinein', en: 'Checks after the fact', fr: 'Contrôle a posteriori' },
    in2030: { de: 'Echtzeit-Compliance im System', en: 'Real-time compliance in the systems', fr: 'Conformité temps réel dans les systèmes' },
  },
  '6_2': {
    statusQuo: { de: 'Drei getrennte Linien', en: 'Three separate lines', fr: 'Trois lignes cloisonnées' },
    in2030: { de: 'Integriertes Governance-Cockpit', en: 'An integrated governance cockpit', fr: 'Cockpit de gouvernance intégré' },
  },
  '6_3': {
    statusQuo: { de: 'Schutzwall am Perimeter', en: 'A wall at the perimeter', fr: 'Rempart en périphérie' },
    in2030: { de: 'Resilienz im Betriebsmodell', en: 'Resilience in the operating model', fr: 'Résilience dans le modèle opérationnel' },
  },
  '6_4': {
    statusQuo: { de: 'Revision mit Aktenordnern', en: 'Audit with binders', fr: 'Audit à coups de classeurs' },
    in2030: { de: 'Explainability-Cockpit', en: 'An explainability cockpit', fr: 'Cockpit d’explicabilité' },
  },
  '8_1': {
    statusQuo: { de: 'Ein Produkt für alle', en: 'One product for everyone', fr: 'Un produit pour tous' },
    in2030: { de: 'Segment of One', en: 'Segment of one', fr: 'Segment of One' },
  },
  '8_2': {
    statusQuo: { de: 'Vertrag im Ordner', en: 'Contracts in a binder', fr: 'Contrat rangé au classeur' },
    in2030: { de: 'Das Produkt passt sich an', en: 'Products adapt themselves', fr: 'Le produit s’adapte' },
  },
  '8_3': {
    statusQuo: { de: 'Jahre bis zum Produkt', en: 'Years to a product', fr: 'Des années pour un produit' },
    in2030: { de: 'Neue Produkte in Tagen', en: 'New products in days', fr: 'Nouveaux produits en quelques jours' },
  },
  '9_1': {
    statusQuo: { de: 'Quartalsbericht im Rückspiegel', en: 'Quarterly reports in the rear-view mirror', fr: 'Rapport trimestriel dans le rétroviseur' },
    in2030: { de: 'Echtzeit-Cockpit im Datenraum', en: 'A real-time cockpit in the data room', fr: 'Cockpit temps réel en salle des données' },
  },
  '9_2': {
    statusQuo: { de: 'Governance delegiert', en: 'Governance delegated', fr: 'Gouvernance déléguée' },
    in2030: { de: 'KI-Leitplanken sind Chefsache', en: 'AI guardrails owned at the top', fr: 'Garde-fous IA : affaire de direction' },
  },
  '9_3': {
    statusQuo: { de: 'Starrer Jahreszyklus', en: 'A rigid annual cycle', fr: 'Cycle annuel rigide' },
    in2030: { de: 'Kontinuierliche Steuerung', en: 'Continuous steering', fr: 'Pilotage continu' },
  },
}
