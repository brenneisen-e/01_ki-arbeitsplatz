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
    frage: { de: 'Warum', en: 'Why' },
    label: { de: 'Strategie', en: 'Strategy' },
    text: {
      de: 'Wir schärfen Ambition und Zielbild: Wo schafft KI im Geschäftsmodell Ihrer Bank messbaren Wert, und welche Entscheidungen sollen künftig KI-gestützt fallen? Ein klares Zielbild statt verstreuter Einzel-Use-Cases.',
      en: 'We sharpen ambition and target picture: where does AI create measurable value in your bank’s business model, and which decisions should be AI-supported in future? A clear target picture instead of scattered point use cases.',
    },
    icon: 'Lightbulb',
    color: '#0097A9',
    colorInner: '#1B7480',
  },
  {
    id: 'people',
    frage: { de: 'Wer', en: 'Who' },
    label: { de: 'People', en: 'People' },
    text: {
      de: 'Transformation gelingt über Menschen: Rollen, Skills und Anreize werden im Target Operating Model verankert, Change und Adoption von Anfang an mitgeführt — damit Veränderung nicht nur beschlossen, sondern nachhaltig gelebt wird.',
      en: 'Transformation succeeds through people: roles, skills and incentives are anchored in the target operating model, with change and adoption managed from day one — so change is not merely decided but sustainably lived.',
    },
    icon: 'Users',
    color: '#86BC25',
    colorInner: '#6E9A22',
  },
  {
    id: 'prozesse',
    frage: { de: 'Wie', en: 'How' },
    label: { de: 'Prozesse', en: 'Processes' },
    text: {
      de: 'Wir übersetzen die Entscheidungslogik in Prozesse: Journey-Teams mit End-to-End-Ownership, priorisierte Decision Journeys und eine Delivery, die von 2–4 auf 100+ Deployments pro Jahr skaliert.',
      en: 'We translate decision logic into processes: journey teams with end-to-end ownership, prioritised decision journeys and a delivery that scales from 2–4 to 100+ deployments per year.',
    },
    icon: 'Settings',
    color: '#00778B',
    colorInner: '#1D5F6B',
  },
  {
    id: 'governance',
    frage: { de: 'Wie', en: 'How' },
    label: { de: 'Governance', en: 'Governance' },
    text: {
      de: 'Trustworthy AI „by design": Leitplanken, Risiko- und Compliance-Kontrollen sind integraler Teil der Plattform — mit klarer Verantwortung bis auf Vorstandsebene, nicht als nachgelagerte Kontrolle.',
      en: 'Trustworthy AI “by design”: guardrails, risk and compliance controls are an integral part of the platform — with clear accountability up to board level, not a downstream control.',
    },
    icon: 'Scale',
    color: '#1F9163',
    colorInner: '#2A6A52',
  },
  {
    id: 'daten',
    frage: { de: 'Womit', en: 'With what' },
    label: { de: 'Daten', en: 'Data' },
    text: {
      de: 'Wir schaffen das Datenfundament: verlässliche, verfügbare Datenprodukte und eine skalierbare Decision Spine als Rückgrat, damit KI-Entscheidungen auf belastbarer Basis fallen.',
      en: 'We build the data foundation: reliable, available data products and a scalable decision spine as the backbone, so AI decisions rest on a solid basis.',
    },
    icon: 'Database',
    color: '#383838',
    colorInner: '#4C4C4C',
  },
  {
    id: 'technologie',
    frage: { de: 'Womit', en: 'With what' },
    label: { de: 'Technologie', en: 'Technology' },
    text: {
      de: 'Wir bauen die AI-native Plattform: modulare, API-basierte Architektur, MLOps und wiederverwendbare Accelerators — beschleunigt durch Deloittes Methodik und Assets.',
      en: 'We build the AI-native platform: modular, API-based architecture, MLOps and reusable accelerators — sped up by Deloitte’s methodology and assets.',
    },
    icon: 'BarChart3',
    color: '#808080',
    colorInner: '#666666',
  },
]

/** Platzhalter-Bildpfade (existieren als Datei nicht — im CMS per Upload ersetzbar). */
export const OFFERING_IMAGE_SRC = './images/offering-uebersicht.png'
export const OFFERING_CONTACTS: OfferingContact[] = [
  { defaultRole: { de: 'Partner', en: 'Partner' }, imageSrc: './images/offering-kontakt-1.png' },
  { defaultRole: { de: 'Partner', en: 'Partner' }, imageSrc: './images/offering-kontakt-2.png' },
  { defaultRole: { de: 'Director', en: 'Director' }, imageSrc: './images/offering-kontakt-3.png' },
  { defaultRole: { de: 'Director', en: 'Director' }, imageSrc: './images/offering-kontakt-4.png' },
]

export const DELOITTE_OFFERING: Offering = {
  kicker: { de: 'Transformation mit Deloitte', en: 'Transformation with Deloitte' },
  title: {
    de: 'KI-Transformation holistisch gestalten',
    en: 'Shaping AI transformation holistically',
  },
  lead: {
    de: 'Der Weg zur AI-nativen Bank ist weit mehr als ein IT-Projekt — er verändert, wie Entscheidungen getroffen, Arbeit organisiert und Wert geschaffen wird. Mit dem Deloitte AI Transformation Framework bewerten wir systematisch die KI-Readiness Ihrer Bank entlang von sechs Dimensionen — von der Strategie bis zur Technologie — und machen Handlungsbedarf sichtbar, priorisierbar und umsetzbar.',
    en: 'The path to the AI-native bank is far more than an IT project — it changes how decisions are made, work is organised and value is created. With the Deloitte AI Transformation Framework we systematically assess your bank’s AI readiness across six dimensions — from strategy to technology — making the need for action visible, prioritisable and actionable.',
  },
  whyTitle: { de: 'Warum Deloitte', en: 'Why Deloitte' },
  why: [
    { de: 'Decision-first statt technologiegetrieben', en: 'Decision-first, not technology-driven' },
    { de: 'Trustworthy AI von Anfang an eingebaut', en: 'Trustworthy AI built in from the start' },
    { de: 'End-to-end: von der Strategie bis zur Skalierung', en: 'End-to-end: from strategy to scale' },
    { de: 'Branchentiefe in Banking & Regulatorik', en: 'Deep expertise in banking & regulation' },
  ],
  kontaktTitle: { de: 'Ihr Deloitte-Team', en: 'Your Deloitte team' },
  offeringLabel: {
    de: 'Deloitte-Offering — Platzhalter (im Änderungsbereich hochladbar)',
    en: 'Deloitte offering — placeholder (uploadable in the editing area)',
  },
  contactHint: { de: 'Name & Foto folgen', en: 'Name & photo to follow' },
}
