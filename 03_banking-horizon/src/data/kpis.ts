// KPI-Zielkorridore je Kapitel (Ziel 2030) — die alleinige Grundlage der
// Potenzial-Kacheln. Angezeigt wird die gerundete Spanne zwischen `konservativ`
// und `ambitioniert`; `base` (heute) dient nur der Richtung und der relativen
// Rechnung, `basis` liegt als Mittelwert dazwischen und wird nicht mehr
// angezeigt. Bewusst illustrativ und ohne hinterlegtes Rechenmodell — es gibt
// keinen Modell-Download und keine Quellenangaben.
//
// Abstraktionsniveau der angezeigten (featured) KPIs: generische Steuerungs-
// größen, wie sie im Vorstand ohnehin gelesen werden — Cost-Income-Ratio,
// Betriebskosten, Ertrag, Durchlaufzeit, Kundenzufriedenheit. Keine Kennzahlen
// auf Produkt-, System- oder Verfahrensebene („STP-Quote Konsumkredit",
// „False-Positive-Rate AML", „Ertragsanteil Produkte < 24 Monate"): solche
// Labels behaupten ein Modell dahinter, das es bewusst nicht mehr gibt.
// Nicht angezeigte (featured=false) Einträge sind Reserve und dürfen
// detaillierter bleiben — sie erscheinen nirgends im UI.
//
// featured=true markiert die 4 je Kapitel im Reader angezeigten Board-KPIs (Reihenfolge = Anzeige).

import type { L } from '../i18n/LanguageContext'

export interface Kpi {
  label: L
  unit: string
  base: number
  konservativ: number
  basis: number
  ambitioniert: number
  featured: boolean
}

/** KPI-Zielkorridore je Kapitel-ID. featured = im Reader angezeigt. */
export const KPIS_BY_CHAPTER: Record<string, Kpi[]> = {
  kunde: [
    { label: { de: 'Kundenzufriedenheit', en: 'Customer satisfaction', fr: 'Satisfaction client' }, unit: 'Punkte', base: 5, konservativ: 8, basis: 15, ambitioniert: 25, featured: true },
    { label: { de: 'Cost-Income-Ratio', en: 'Cost-income ratio', fr: 'Coefficient d’exploitation' }, unit: '%', base: 65, konservativ: 62, basis: 58, ambitioniert: 53, featured: true },
    { label: { de: 'Ertrag je Kunde', en: 'Revenue per customer', fr: 'Revenus par client' }, unit: 'Index (100)', base: 100, konservativ: 103, basis: 107, ambitioniert: 112, featured: true },
    { label: { de: 'Kundenabwanderung', en: 'Customer attrition', fr: 'Attrition client' }, unit: '%', base: 8, konservativ: 7.6, basis: 7.2, ambitioniert: 6.8, featured: true },
    { label: { de: 'Cross-Selling-Quote', en: 'Cross-selling rate', fr: 'Taux de vente croisée' }, unit: 'Produkte/Kunde', base: 2.5, konservativ: 2.625, basis: 2.875, ambitioniert: 3.125, featured: false },
    { label: { de: 'Servicekosten je Kontakt', en: 'Service cost per contact', fr: 'Coût de service par contact' }, unit: 'Index (100)', base: 100, konservativ: 85, basis: 65, ambitioniert: 45, featured: false },
    { label: { de: 'Self-Service-/Assistenznutzung', en: 'Self-service / assistant usage', fr: 'Usage libre-service / assistant' }, unit: '%', base: 50, konservativ: 60, basis: 75, ambitioniert: 90, featured: false },
    { label: { de: 'Anteil proaktiv initiierter Kontakte', en: 'Share of proactively initiated contacts', fr: 'Part des contacts proactifs' }, unit: '%', base: 10, konservativ: 25, basis: 45, ambitioniert: 65, featured: false },
  ],
  vertrieb: [
    { label: { de: 'Kundenzufriedenheit', en: 'Customer satisfaction', fr: 'Satisfaction client' }, unit: 'Punkte', base: 5, konservativ: 7, basis: 12, ambitioniert: 20, featured: true },
    { label: { de: 'Betriebskosten', en: 'Operating costs', fr: 'Coûts opérationnels' }, unit: 'Index (100)', base: 100, konservativ: 92, basis: 82, ambitioniert: 70, featured: true },
    { label: { de: 'Ertrag je Berater', en: 'Revenue per advisor', fr: 'Revenus par conseiller' }, unit: '€ p.a.', base: 500000, konservativ: 550000, basis: 625000, ambitioniert: 725000, featured: true },
    { label: { de: 'Abschlussquote', en: 'Conversion rate', fr: 'Taux de transformation' }, unit: '%', base: 20, konservativ: 23, basis: 27, ambitioniert: 32, featured: true },
    { label: { de: 'Betreute Kunden je Berater', en: 'Customers per advisor', fr: 'Clients suivis par conseiller' }, unit: 'Anzahl', base: 625, konservativ: 687.5, basis: 781.25, ambitioniert: 937.5, featured: false },
    { label: { de: 'Vor-/Nachbereitungszeit je Gespräch', en: 'Prep/follow-up time per meeting', fr: 'Préparation/suivi par entretien' }, unit: 'Min', base: 60, konservativ: 45, basis: 30, ambitioniert: 18, featured: false },
    { label: { de: 'Anteil autonom abgeschl. Standardvorgänge', en: 'Share of autonomously completed standard cases', fr: 'Part d’opérations standard traitées en autonomie' }, unit: '%', base: 20, konservativ: 40, basis: 60, ambitioniert: 80, featured: false },
  ],
  marktfolge: [
    { label: { de: 'Cost-Income-Ratio', en: 'Cost-income ratio', fr: 'Coefficient d’exploitation' }, unit: '%', base: 65, konservativ: 62, basis: 57, ambitioniert: 52, featured: true },
    // Dunkelverarbeitung über die Marktfolge insgesamt — der Korridor umspannt
    // bewusst das ganze Spektrum vom einfachen Standardvorgang bis zum
    // komplexen Fall, statt eine einzelne Produktstrecke auszuweisen.
    { label: { de: 'Dunkelverarbeitungsquote', en: 'Straight-through processing rate', fr: 'Taux de STP' }, unit: '%', base: 40, konservativ: 65, basis: 78, ambitioniert: 92, featured: true },
    { label: { de: 'Stückkosten', en: 'Unit cost', fr: 'Coût unitaire' }, unit: 'Index (100)', base: 100, konservativ: 80, basis: 60, ambitioniert: 40, featured: true },
    { label: { de: 'Durchlaufzeit', en: 'Lead time', fr: 'Délai de traitement' }, unit: 'Tage', base: 5, konservativ: 3, basis: 1.5, ambitioniert: 0.5, featured: true },
    { label: { de: 'Fehler-/Nacharbeitsquote', en: 'Error / rework rate', fr: 'Taux d’erreur / de reprise' }, unit: '%', base: 10, konservativ: 8, basis: 6, ambitioniert: 4, featured: false },
    { label: { de: 'Anteil ausgelagerter Prozessvolumina', en: 'Share of outsourced process volume', fr: 'Part des volumes externalisés' }, unit: '%', base: 5, konservativ: 10, basis: 20, ambitioniert: 35, featured: false },
  ],
  corporate: [
    { label: { de: 'Produktivität', en: 'Productivity', fr: 'Productivité' }, unit: '%', base: 0, konservativ: 5, basis: 12, ambitioniert: 20, featured: true },
    { label: { de: 'Betriebskosten', en: 'Operating costs', fr: 'Coûts opérationnels' }, unit: 'Index (100)', base: 100, konservativ: 97, basis: 92, ambitioniert: 85, featured: true },
    { label: { de: 'Interne Besetzungsquote', en: 'Internal fill rate', fr: 'Taux de pourvoi en interne' }, unit: '%', base: 30, konservativ: 45, basis: 60, ambitioniert: 75, featured: true },
    { label: { de: 'Fluktuation', en: 'Attrition', fr: 'Turnover' }, unit: '%', base: 8, konservativ: 7, basis: 6, ambitioniert: 5, featured: true },
    { label: { de: 'NPS (Kundenwirkung)', en: 'NPS (customer impact)', fr: 'NPS (impact client)' }, unit: 'Punkte', base: 5, konservativ: 6, basis: 9, ambitioniert: 13, featured: false },
    { label: { de: 'Marge/Ertrag', en: 'Margin / revenue', fr: 'Marge / revenus' }, unit: 'Index (100)', base: 100, konservativ: 101, basis: 103, ambitioniert: 106, featured: false },
    { label: { de: 'Time-to-Competence', en: 'Time-to-competence', fr: 'Time-to-Competence' }, unit: 'Monate', base: 9, konservativ: 7.65, basis: 6.3, ambitioniert: 4.5, featured: false },
    { label: { de: 'Weiterbildungsstunden/FTE', en: 'Training hours / FTE', fr: 'Heures de formation / ETP' }, unit: 'Std. p.a.', base: 25, konservativ: 30, basis: 40, ambitioniert: 50, featured: false },
  ],
  it: [
    { label: { de: 'Produktivität', en: 'Productivity', fr: 'Productivité' }, unit: '%', base: 0, konservativ: 15, basis: 30, ambitioniert: 50, featured: true },
    { label: { de: 'Time-to-Market', en: 'Time-to-market', fr: 'Time-to-Market' }, unit: 'Index (100)', base: 100, konservativ: 80, basis: 60, ambitioniert: 40, featured: true },
    { label: { de: 'Cost-Income-Ratio', en: 'Cost-income ratio', fr: 'Coefficient d’exploitation' }, unit: '%', base: 65, konservativ: 63, basis: 60, ambitioniert: 56, featured: true },
    { label: { de: 'Automatisierungsgrad', en: 'Automation level', fr: 'Taux d’automatisation' }, unit: '%', base: 5, konservativ: 25, basis: 45, ambitioniert: 70, featured: true },
    { label: { de: 'Marge/Ertrag (Time-to-Market)', en: 'Margin / revenue (time-to-market)', fr: 'Marge / revenus (time-to-market)' }, unit: 'Index (100)', base: 100, konservativ: 101, basis: 103, ambitioniert: 106, featured: false },
    { label: { de: 'Run-vs-Change-Anteil (Run)', en: 'Run share (run vs change)', fr: 'Part run vs change (run)' }, unit: '%', base: 70, konservativ: 65, basis: 55, ambitioniert: 45, featured: false },
    { label: { de: 'Deployment-Frequenz', en: 'Deployment frequency', fr: 'Fréquence de déploiement' }, unit: 'Index (100)', base: 100, konservativ: 130, basis: 180, ambitioniert: 250, featured: false },
  ],
  compliance: [
    // Als relative Kostenveränderung geführt, nicht als Anteil an den
    // Betriebskosten — der Anteilsnenner wäre wieder ein Stück Modell.
    { label: { de: 'Compliance-Kosten', en: 'Cost of compliance', fr: 'Coûts de conformité' }, unit: 'Index (100)', base: 100, konservativ: 90, basis: 75, ambitioniert: 60, featured: true },
    { label: { de: 'Fehlalarmquote', en: 'False-positive rate', fr: 'Taux de faux positifs' }, unit: '%', base: 90, konservativ: 75, basis: 55, ambitioniert: 35, featured: true },
    { label: { de: 'Automatisierte Kontrollen', en: 'Automated controls', fr: 'Contrôles automatisés' }, unit: '%', base: 10, konservativ: 30, basis: 55, ambitioniert: 80, featured: true },
    { label: { de: 'Durchlaufzeit', en: 'Lead time', fr: 'Délai de traitement' }, unit: 'Index (100)', base: 100, konservativ: 85, basis: 65, ambitioniert: 45, featured: true },
    { label: { de: 'Cost of Compliance (% Betriebskosten)', en: 'Cost of compliance (% of opex)', fr: 'Coût de conformité (% coûts opérationnels)' }, unit: '%', base: 10, konservativ: 9, basis: 7.5, ambitioniert: 6, featured: false },
    { label: { de: 'Betriebskosten/CIR', en: 'Operating costs / CIR', fr: 'Coûts opérationnels / CIR' }, unit: '%', base: 65, konservativ: 64, basis: 62, ambitioniert: 59, featured: false },
    { label: { de: 'Marge/Ertrag', en: 'Margin / revenue', fr: 'Marge / revenus' }, unit: 'Index (100)', base: 100, konservativ: 100.5, basis: 101.5, ambitioniert: 103, featured: false },
    { label: { de: 'Bearbeitungszeit je Alert', en: 'Handling time per alert', fr: 'Temps de traitement par alerte' }, unit: 'Min', base: 30, konservativ: 24, basis: 18, ambitioniert: 12, featured: false },
  ],
  projekt: [
    { label: { de: 'Time-to-Market', en: 'Time-to-market', fr: 'Time-to-Market' }, unit: 'Monate', base: 12, konservativ: 9.6, basis: 6.6, ambitioniert: 3.6, featured: true },
    { label: { de: 'Ertrag', en: 'Revenue', fr: 'Revenus' }, unit: 'Index (100)', base: 100, konservativ: 102, basis: 105, ambitioniert: 110, featured: true },
    { label: { de: 'Personalisierungsgrad', en: 'Personalisation level', fr: 'Degré de personnalisation' }, unit: '%', base: 10, konservativ: 25, basis: 45, ambitioniert: 65, featured: true },
    { label: { de: 'Ertragsanteil neuer Produkte', en: 'Revenue share of new products', fr: 'Part des revenus des nouveaux produits' }, unit: '%', base: 10, konservativ: 15, basis: 22, ambitioniert: 30, featured: true },
    { label: { de: 'NPS', en: 'NPS', fr: 'NPS' }, unit: 'Punkte', base: 5, konservativ: 7, basis: 11, ambitioniert: 18, featured: false },
    { label: { de: 'Betriebskosten (Entwicklung)', en: 'Operating costs (development)', fr: 'Coûts opérationnels (développement)' }, unit: 'Index (100)', base: 100, konservativ: 85, basis: 65, ambitioniert: 45, featured: false },
    { label: { de: 'Konversion personalisiert vs. Standard', en: 'Conversion: personalised vs standard', fr: 'Conversion personnalisé vs standard' }, unit: '%', base: 0, konservativ: 10, basis: 25, ambitioniert: 40, featured: false },
  ],
  vorstand: [
    { label: { de: 'Reporting-Latenz', en: 'Reporting latency', fr: 'Latence du reporting' }, unit: 'Tage', base: 6, konservativ: 4.8, basis: 3, ambitioniert: 1, featured: true },
    { label: { de: 'Echtzeit-Kennzahlen', en: 'Real-time metrics', fr: 'Indicateurs en temps réel' }, unit: '%', base: 10, konservativ: 30, basis: 55, ambitioniert: 80, featured: true },
    // „Dauer", nicht „Geschwindigkeit": der Wert fällt, und ein fallender
    // Pfeil an „Entscheidungsgeschwindigkeit" hätte das Gegenteil gesagt.
    { label: { de: 'Entscheidungsdauer', en: 'Time to decide', fr: 'Délai de décision' }, unit: 'Index (100)', base: 100, konservativ: 80, basis: 60, ambitioniert: 40, featured: true },
    { label: { de: 'Betriebskosten', en: 'Operating costs', fr: 'Coûts opérationnels' }, unit: 'Index (100)', base: 100, konservativ: 90, basis: 75, ambitioniert: 55, featured: true },
    { label: { de: 'NPS (indirekt)', en: 'NPS (indirect)', fr: 'NPS (indirect)' }, unit: 'Punkte', base: 5, konservativ: 5, basis: 7, ambitioniert: 9, featured: false },
    { label: { de: 'Marge/Ertrag', en: 'Margin / revenue', fr: 'Marge / revenus' }, unit: 'Index (100)', base: 100, konservativ: 101, basis: 103, ambitioniert: 106, featured: false },
    { label: { de: 'Forecast-Genauigkeit', en: 'Forecast accuracy', fr: 'Précision des prévisions' }, unit: '%', base: 0, konservativ: 5, basis: 7, ambitioniert: 15, featured: false },
  ],
}
