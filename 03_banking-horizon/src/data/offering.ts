// ─────────────────────────────────────────────────────────────────────────────
// DELOITTE_OFFERING — Inhalt des Transformationskapitels „Transformation mit
// Deloitte" (Glas-Aufzug). Dieses Kapitel zeigt bewusst KEINE Bank-Hypothesen
// (Status Quo / 2030), sondern das Leistungsangebot von Deloitte: wie Deloitte
// die Bank decision-first zur AI-nativen Plattform-Bank begleitet.
// Zweisprachig; wird von TransformationOffering gerendert.
// ─────────────────────────────────────────────────────────────────────────────

import type { L } from '../i18n/LanguageContext'

/**
 * Dimension des Deloitte AI Transformation Framework (offizielles Rad):
 * sechs Segmente Strategie/People/Prozesse/Governance/Daten/Technologie,
 * gruppiert nach den Leitfragen WARUM / WER / WIE / WOMIT.
 * `color` = Außenring, `colorInner` = Innenring (dunkler), `icon` = Lucide-Name.
 */
export type FrameworkDimension = {
  id: string
  frage: L
  label: L
  text: L
  icon: string
  color: string
  colorInner: string
}

/** Ansprechpartner-Platzhalter (Name/Rolle/Foto werden im CMS gepflegt). */
export type OfferingContact = { defaultRole: L; imageSrc: string }

export type Offering = {
  kicker: L
  title: L
  lead: L
  whyTitle: L
  why: L[]
  kontaktTitle: L
  offeringLabel: L
  contactHint: L
}

/**
 * Die sechs Dimensionen des Deloitte AI Transformation Framework in der
 * Reihenfolge des Rads (im Uhrzeigersinn ab 12 Uhr). Farben entsprechen dem
 * offiziellen Schaubild; Texte sind auf die Bank-Transformation zugespitzt.
 */
export const FRAMEWORK_DIMENSIONS: FrameworkDimension[] = [
  {
    id: 'strategie',
    frage: { de: 'Warum', en: 'Why', fr: 'Pourquoi' },
    label: { de: 'Strategie', en: 'Strategy', fr: 'Stratégie' },
    text: {
      de: 'Wir schärfen Ambition und Zielbild: Wo schafft KI im Geschäftsmodell Ihrer Bank messbaren Wert, und welche Entscheidungen sollen künftig KI-gestützt fallen? Ein klares Zielbild statt verstreuter Einzel-Use-Cases.',
      en: 'We sharpen ambition and target picture: where does AI create measurable value in your bank’s business model, and which decisions should be AI-supported in future? A clear target picture instead of scattered point use cases.',
      fr: 'Nous affinons l’ambition et la cible : où l’IA crée-t-elle une valeur mesurable dans le modèle d’affaires de votre banque, et quelles décisions doivent à l’avenir être prises avec l’appui de l’IA ? Une cible claire plutôt que des cas d’usage isolés et dispersés.',
    },
    icon: 'Lightbulb',
    color: '#0097A9',
    colorInner: '#1B7480',
  },
  {
    id: 'people',
    frage: { de: 'Wer', en: 'Who', fr: 'Qui' },
    label: { de: 'People', en: 'People', fr: 'Humain' },
    text: {
      de: 'Transformation gelingt über Menschen: Rollen, Skills und Anreize werden im Target Operating Model verankert, Change und Adoption von Anfang an mitgeführt, damit Veränderung nicht nur beschlossen, sondern nachhaltig gelebt wird.',
      en: 'Transformation succeeds through people: roles, skills and incentives are anchored in the target operating model, with change and adoption managed from day one, so change is not merely decided but sustainably lived.',
      fr: 'La transformation réussit grâce aux personnes : rôles, compétences et incitations sont ancrés dans le modèle opérationnel cible, la conduite du changement et l’adoption sont menées dès le départ, afin que le changement ne soit pas seulement décidé, mais durablement vécu.',
    },
    icon: 'Users',
    color: '#86BC25',
    colorInner: '#6E9A22',
  },
  {
    id: 'prozesse',
    frage: { de: 'Wie', en: 'How', fr: 'Comment' },
    label: { de: 'Prozesse', en: 'Processes', fr: 'Processus' },
    text: {
      de: 'Wir übersetzen die Entscheidungslogik in Prozesse: Journey-Teams mit End-to-End-Ownership, priorisierte Decision Journeys und eine Delivery, die von 2–4 auf 100+ Deployments pro Jahr skaliert.',
      en: 'We translate decision logic into processes: journey teams with end-to-end ownership, prioritised decision journeys and a delivery that scales from 2–4 to 100+ deployments per year.',
      fr: 'Nous traduisons la logique de décision en processus : des équipes parcours responsables de bout en bout, des parcours de décision priorisés et une delivery qui passe de 2–4 à 100+ déploiements par an.',
    },
    icon: 'Settings',
    color: '#00778B',
    colorInner: '#1D5F6B',
  },
  {
    id: 'governance',
    frage: { de: 'Wie', en: 'How', fr: 'Comment' },
    label: { de: 'Governance', en: 'Governance', fr: 'Gouvernance' },
    text: {
      de: 'Trustworthy AI „by design": Leitplanken, Risiko- und Compliance-Kontrollen sind integraler Teil der Plattform, mit klarer Verantwortung bis auf Vorstandsebene, nicht als nachgelagerte Kontrolle.',
      en: 'Trustworthy AI “by design”: guardrails, risk and compliance controls are an integral part of the platform, with clear accountability up to board level, not a downstream control.',
      fr: 'Trustworthy AI « by design » : garde-fous, contrôles des risques et de la conformité font partie intégrante de la plateforme, avec des responsabilités claires jusqu’au niveau de la direction générale, et non comme un contrôle en aval.',
    },
    icon: 'Scale',
    color: '#1F9163',
    colorInner: '#2A6A52',
  },
  {
    id: 'daten',
    frage: { de: 'Womit', en: 'With what', fr: 'Avec quoi' },
    label: { de: 'Daten', en: 'Data', fr: 'Données' },
    text: {
      de: 'Wir schaffen das Datenfundament: verlässliche, verfügbare Datenprodukte und eine skalierbare Decision Spine als Rückgrat, damit KI-Entscheidungen auf belastbarer Basis fallen.',
      en: 'We build the data foundation: reliable, available data products and a scalable decision spine as the backbone, so AI decisions rest on a solid basis.',
      fr: 'Nous posons le socle de données : des produits de données fiables et disponibles et une Decision Spine évolutive comme colonne vertébrale, pour que les décisions de l’IA reposent sur une base solide.',
    },
    icon: 'Database',
    color: '#383838',
    colorInner: '#4C4C4C',
  },
  {
    id: 'technologie',
    frage: { de: 'Womit', en: 'With what', fr: 'Avec quoi' },
    label: { de: 'Technologie', en: 'Technology', fr: 'Technologie' },
    text: {
      de: 'Wir bauen die AI-native Plattform: modulare, API-basierte Architektur, MLOps und wiederverwendbare Accelerators, beschleunigt durch Deloittes Methodik und Assets.',
      en: 'We build the AI-native platform: modular, API-based architecture, MLOps and reusable accelerators, sped up by Deloitte’s methodology and assets.',
      fr: 'Nous construisons la plateforme native IA : architecture modulaire fondée sur des API, MLOps et accélérateurs réutilisables, avec la méthodologie et les actifs de Deloitte pour aller plus vite.',
    },
    icon: 'BarChart3',
    color: '#808080',
    colorInner: '#666666',
  },
]

/** Platzhalter-Bildpfade (existieren als Datei nicht — im CMS per Upload ersetzbar). */
export const OFFERING_IMAGE_SRC = './images/offering-uebersicht.png'
export const OFFERING_CONTACTS: OfferingContact[] = [
  { defaultRole: { de: 'Partner', en: 'Partner', fr: 'Associé' }, imageSrc: './images/offering-kontakt-1.png' },
  { defaultRole: { de: 'Partner', en: 'Partner', fr: 'Associé' }, imageSrc: './images/offering-kontakt-2.png' },
  { defaultRole: { de: 'Director', en: 'Director', fr: 'Directeur' }, imageSrc: './images/offering-kontakt-3.png' },
  { defaultRole: { de: 'Director', en: 'Director', fr: 'Directeur' }, imageSrc: './images/offering-kontakt-4.png' },
]

export const DELOITTE_OFFERING: Offering = {
  kicker: { de: 'Transformation mit Deloitte', en: 'Transformation with Deloitte', fr: 'Transformation avec Deloitte' },
  title: {
    de: 'KI-Transformation holistisch gestalten',
    en: 'Shaping AI transformation holistically',
    fr: 'Concevoir la transformation IA de façon holistique',
  },
  lead: {
    de: 'Der Weg zur AI-nativen Bank ist weit mehr als ein IT-Projekt: Er verändert, wie Entscheidungen getroffen, Arbeit organisiert und Wert geschaffen wird. Mit dem Deloitte AI Transformation Framework bewerten wir systematisch die KI-Readiness Ihrer Bank entlang von sechs Dimensionen (von der Strategie bis zur Technologie) und machen Handlungsbedarf sichtbar, priorisierbar und umsetzbar.',
    en: 'The path to the AI-native bank is far more than an IT project: it changes how decisions are made, work is organised and value is created. With the Deloitte AI Transformation Framework we systematically assess your bank’s AI readiness across six dimensions (from strategy to technology), making the need for action visible, prioritisable and actionable.',
    fr: 'La voie vers la banque native IA est bien plus qu’un projet IT : elle change la manière dont les décisions sont prises, dont le travail est organisé et dont la valeur est créée. Avec le Deloitte AI Transformation Framework, nous évaluons de manière systématique la maturité IA de votre banque selon six dimensions (de la stratégie à la technologie) et rendons les chantiers à mener visibles, hiérarchisables et réalisables.',
  },
  whyTitle: { de: 'Warum Deloitte', en: 'Why Deloitte', fr: 'Pourquoi Deloitte' },
  why: [
    { de: 'Decision-first statt technologiegetrieben', en: 'Decision-first, not technology-driven', fr: 'Decision-first plutôt que technocentré' },
    { de: 'Trustworthy AI von Anfang an eingebaut', en: 'Trustworthy AI built in from the start', fr: 'Trustworthy AI intégrée dès le départ' },
    { de: 'End-to-end: von der Strategie bis zur Skalierung', en: 'End-to-end: from strategy to scale', fr: 'De bout en bout : de la stratégie au passage à l’échelle' },
    { de: 'Branchentiefe in Banking & Regulatorik', en: 'Deep expertise in banking & regulation', fr: 'Expertise pointue en banque et réglementation' },
  ],
  kontaktTitle: { de: 'Ihr Deloitte-Team', en: 'Your Deloitte team', fr: 'Votre équipe Deloitte' },
  offeringLabel: {
    de: 'Deloitte-Offering: Platzhalter (im Änderungsbereich hochladbar)',
    en: 'Deloitte offering: placeholder (uploadable in the editing area)',
    fr: 'Offre Deloitte : espace réservé (à téléverser dans l’espace d’édition)',
  },
  contactHint: { de: 'Name & Foto folgen', en: 'Name & photo to follow', fr: 'Nom et photo à venir' },
}
