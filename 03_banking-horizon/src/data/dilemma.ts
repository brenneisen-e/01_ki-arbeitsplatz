// ─────────────────────────────────────────────────────────────────────────────
// Kredit-Dilemma (Kapitel 06) — Fotos der vier Telefon-Stationen.
//
// Ersetzt die früheren Clip-Platzhalter durch stimmungsvolle Standbilder der
// jeweiligen Anrufer (Review-Feedback: hochwertige Clips waren nicht machbar).
// Die Fotos sind wie alle Bilder über den Änderungsbereich (CMS) austauschbar
// (Override via imageKey(src)); fehlt eine Datei, zeigt ImageSlot einen ruhigen
// Platzhalter mit dem Anrufer-Namen.
// ─────────────────────────────────────────────────────────────────────────────

import type { L } from '../i18n/LanguageContext'

export type DilemmaPhoto = { src: string; caller: L }

/** Reihenfolge = Stationen 1–4 im Szenario. */
export const DILEMMA_PHOTOS: DilemmaPhoto[] = [
  {
    src: './images/Kapitel 6_Dilemma1.png',
    caller: { de: 'Der Firmenkundenbetreuer', en: 'The corporate client manager', fr: 'Le chargé d’affaires entreprises' },
  },
  {
    src: './images/Kapitel 6_Dilemma2.png',
    caller: { de: 'Die Risikovorständin', en: 'The chief risk officer', fr: 'La directrice des risques' },
  },
  {
    src: './images/Kapitel 6_Dilemma3.png',
    caller: { de: 'Die Aufsicht / Compliance', en: 'The regulator / compliance', fr: 'Le superviseur / la conformité' },
  },
  {
    src: './images/Kapitel 6_Dilemma4.png',
    caller: { de: 'Der Kunde selbst', en: 'The customer themselves', fr: 'Le client lui-même' },
  },
]
