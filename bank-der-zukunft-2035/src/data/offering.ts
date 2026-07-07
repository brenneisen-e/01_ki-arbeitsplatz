// ─────────────────────────────────────────────────────────────────────────────
// DELOITTE_OFFERING — Inhalt des Transformationskapitels „Transformation mit
// Deloitte" (Glas-Aufzug). Dieses Kapitel zeigt bewusst KEINE Bank-Hypothesen
// (Status Quo / 2030), sondern das Leistungsangebot von Deloitte: wie Deloitte
// die Bank decision-first zur AI-nativen Plattform-Bank begleitet.
// Zweisprachig; wird von TransformationOffering gerendert.
// ─────────────────────────────────────────────────────────────────────────────

import type { L } from '../i18n/LanguageContext'

/** Ein Baustein des Deloitte-Transformationsangebots. `icon` = Lucide-Name. */
export type OfferingPillar = { icon: string; title: L; text: L }

export type Offering = {
  kicker: L
  title: L
  lead: L
  pillars: OfferingPillar[]
  whyTitle: L
  why: L[]
  ctaLead: L
  ctaButton: L
}

export const DELOITTE_OFFERING: Offering = {
  kicker: { de: 'Transformation mit Deloitte', en: 'Transformation with Deloitte' },
  title: {
    de: 'Wir bringen Sie zur AI-nativen Bank',
    en: 'We take you to the AI-native bank',
  },
  lead: {
    de: 'Der Weg von der heutigen Bank zur AI-nativen Plattform-Bank ist kein Technologieprojekt, sondern eine Transformation von Strategie, Betriebsmodell, Governance und Menschen. Deloitte begleitet Sie decision-first — von der Ambition bis zur Skalierung.',
    en: 'The path from today’s bank to an AI-native platform bank is not a technology project but a transformation of strategy, operating model, governance and people. Deloitte guides you decision-first — from ambition to scale.',
  },
  pillars: [
    {
      icon: 'Compass',
      title: { de: 'Ambition & Strategie', en: 'Ambition & strategy' },
      text: {
        de: 'Wir schärfen Ihre KI-Ambition und richten Geschäfts- und Betriebsmodell auf die KI als Fixstern aus — ein klares Zielbild statt verstreuter Einzel-Use-Cases.',
        en: 'We sharpen your AI ambition and align business and operating model to AI as the guiding star — a clear target picture instead of scattered point use cases.',
      },
    },
    {
      icon: 'Network',
      title: { de: 'AI-natives Operating Model', en: 'AI-native operating model' },
      text: {
        de: 'Wir gestalten Ihr Zielbetriebsmodell entlang der Entscheidungslogik: Journey-Teams mit End-to-End-Ownership, Human-in-the-loop und AI-Governance fest verankert.',
        en: 'We design your target operating model along decision logic: journey teams with end-to-end ownership, human-in-the-loop and AI governance firmly anchored.',
      },
    },
    {
      icon: 'GitBranch',
      title: { de: 'Decision-first Delivery', en: 'Decision-first delivery' },
      text: {
        de: 'Wir priorisieren die wenigen kritischen Decision Journeys und bauen eine skalierbare Decision Spine — der Sprung von 2–4 auf 100+ Deployments pro Jahr.',
        en: 'We prioritise the few critical decision journeys and build a scalable decision spine — the leap from 2–4 to 100+ deployments per year.',
      },
    },
    {
      icon: 'ShieldCheck',
      title: { de: 'Trustworthy AI & Governance', en: 'Trustworthy AI & governance' },
      text: {
        de: 'Wir verankern Governance, Risk und Compliance „by design" — als integralen Teil der Plattform, nicht als nachgelagerte Kontrolle.',
        en: 'We embed governance, risk and compliance “by design” — as an integral part of the platform, not a downstream control.',
      },
    },
    {
      icon: 'Users',
      title: { de: 'People, Change & Adoption', en: 'People, change & adoption' },
      text: {
        de: 'Wir verankern Change im Target Operating Model: Rollen, Anreize und Skills, damit Veränderung nicht nur beschlossen, sondern nachhaltig gelebt wird.',
        en: 'We anchor change in the target operating model: roles, incentives and skills, so change is not merely decided but sustainably lived.',
      },
    },
    {
      icon: 'Layers',
      title: { de: 'Methodik & Assets', en: 'Methodology & assets' },
      text: {
        de: 'AI-native Projektmethodik mit wiederverwendbaren Artefakten und einem klaren Pfad von der Reifegrad-Bestimmung zum Zielbild — beschleunigt durch Deloittes Accelerators.',
        en: 'An AI-native project methodology with reusable artefacts and a clear path from maturity assessment to the target picture — accelerated by Deloitte’s accelerators.',
      },
    },
  ],
  whyTitle: { de: 'Warum Deloitte', en: 'Why Deloitte' },
  why: [
    { de: 'Decision-first statt technologiegetrieben', en: 'Decision-first, not technology-driven' },
    { de: 'Trustworthy AI von Anfang an eingebaut', en: 'Trustworthy AI built in from the start' },
    { de: 'End-to-end: von der Strategie bis zur Skalierung', en: 'End-to-end: from strategy to scale' },
    { de: 'Branchentiefe in Banking & Regulatorik', en: 'Deep expertise in banking & regulation' },
  ],
  ctaLead: {
    de: 'Lassen Sie uns Ihr Zielbild gemeinsam entwickeln — wer künftig entscheidet, was Sie abgeben und wo Sie starten.',
    en: 'Let us shape your target picture together — who decides in future, what you hand over and where you start.',
  },
  ctaButton: { de: 'Future Interaction Model entwickeln', en: 'Develop the future interaction model' },
}
