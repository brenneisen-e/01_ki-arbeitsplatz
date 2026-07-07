// AUTO-GENERIERT aus Banking_Horizon_2030_KPI-Modell.xlsx — nicht von Hand editieren.
// Werte = Szenario-Modell (konservativ / Basis / ambitioniert), Ziel 2030.
// featured=true markiert die 4 je Kapitel im Reader angezeigten Board-KPIs (Reihenfolge = Anzeige).

export interface Kpi {
  label: { de: string; en: string }
  unit: string
  base: number
  konservativ: number
  basis: number
  ambitioniert: number
  featured: boolean
}

/** KPI-Zielwerte je Kapitel-ID (Quelle: KPI-Modell-Excel). featured = im Reader angezeigt. */
export const KPIS_BY_CHAPTER: Record<string, Kpi[]> = {
  kunde: [
    { label: { de: 'NPS', en: 'NPS' }, unit: 'Punkte', base: 5, konservativ: 8, basis: 15, ambitioniert: 25, featured: true },
    { label: { de: 'Cost-Income-Ratio', en: 'Cost-income ratio' }, unit: '%', base: 65, konservativ: 62, basis: 58, ambitioniert: 53, featured: true },
    { label: { de: 'Marge/Ertrag je Kunde', en: 'Margin / revenue per customer' }, unit: 'Index (100)', base: 100, konservativ: 103, basis: 107, ambitioniert: 112, featured: true },
    { label: { de: 'Churn/Abwanderung', en: 'Churn' }, unit: '%', base: 8, konservativ: 7.6, basis: 7.2, ambitioniert: 6.8, featured: true },
    { label: { de: 'Cross-Selling-Quote', en: 'Cross-selling rate' }, unit: 'Produkte/Kunde', base: 2.5, konservativ: 2.625, basis: 2.875, ambitioniert: 3.125, featured: false },
    { label: { de: 'Servicekosten je Kontakt', en: 'Service cost per contact' }, unit: 'Index (100)', base: 100, konservativ: 85, basis: 65, ambitioniert: 45, featured: false },
    { label: { de: 'Self-Service-/Assistenznutzung', en: 'Self-service / assistant usage' }, unit: '%', base: 50, konservativ: 60, basis: 75, ambitioniert: 90, featured: false },
    { label: { de: 'Anteil proaktiv initiierter Kontakte', en: 'Share of proactively initiated contacts' }, unit: '%', base: 10, konservativ: 25, basis: 45, ambitioniert: 65, featured: false },
  ],
  vertrieb: [
    { label: { de: 'NPS', en: 'NPS' }, unit: 'Punkte', base: 5, konservativ: 7, basis: 12, ambitioniert: 20, featured: true },
    { label: { de: 'Betriebskosten Vertrieb', en: 'Sales operating costs' }, unit: 'Index (100)', base: 100, konservativ: 92, basis: 82, ambitioniert: 70, featured: true },
    { label: { de: 'Ertrag je Berater', en: 'Revenue per advisor' }, unit: '€ p.a.', base: 500000, konservativ: 550000, basis: 625000, ambitioniert: 725000, featured: true },
    { label: { de: 'Abschluss-/Konversionsquote', en: 'Conversion rate' }, unit: '%', base: 20, konservativ: 23, basis: 27, ambitioniert: 32, featured: true },
    { label: { de: 'Betreute Kunden je Berater', en: 'Customers per advisor' }, unit: 'Anzahl', base: 625, konservativ: 687.5, basis: 781.25, ambitioniert: 937.5, featured: false },
    { label: { de: 'Vor-/Nachbereitungszeit je Gespräch', en: 'Prep/follow-up time per meeting' }, unit: 'Min', base: 60, konservativ: 45, basis: 30, ambitioniert: 18, featured: false },
    { label: { de: 'Anteil autonom abgeschl. Standardvorgänge', en: 'Share of autonomously completed standard cases' }, unit: '%', base: 20, konservativ: 40, basis: 60, ambitioniert: 80, featured: false },
  ],
  marktfolge: [
    { label: { de: 'Betriebskosten/CIR', en: 'Operating costs / CIR' }, unit: '%', base: 65, konservativ: 62, basis: 57, ambitioniert: 52, featured: true },
    { label: { de: 'STP-Quote Konsumkredit', en: 'STP rate — consumer loan' }, unit: '%', base: 50, konservativ: 70, basis: 85, ambitioniert: 97, featured: true },
    { label: { de: 'Stückkosten je Vorgang', en: 'Unit cost per case' }, unit: 'Index (100)', base: 100, konservativ: 80, basis: 60, ambitioniert: 40, featured: true },
    { label: { de: 'Durchlaufzeit (Time-to-Yes)', en: 'Lead time (time-to-yes)' }, unit: 'Tage', base: 5, konservativ: 3, basis: 1.5, ambitioniert: 0.5, featured: true },
    { label: { de: 'STP-Quote Baufinanzierung', en: 'STP rate — mortgage' }, unit: '%', base: 20, konservativ: 40, basis: 60, ambitioniert: 80, featured: false },
    { label: { de: 'Fehler-/Nacharbeitsquote', en: 'Error / rework rate' }, unit: '%', base: 10, konservativ: 8, basis: 6, ambitioniert: 4, featured: false },
    { label: { de: 'Anteil ausgelagerter Prozessvolumina', en: 'Share of outsourced process volume' }, unit: '%', base: 5, konservativ: 10, basis: 20, ambitioniert: 35, featured: false },
  ],
  corporate: [
    { label: { de: 'Produktivität je MA durch KI', en: 'Productivity per employee via AI' }, unit: '%', base: 0, konservativ: 5, basis: 12, ambitioniert: 20, featured: true },
    { label: { de: 'Betriebskosten (Personal)', en: 'Operating costs (staff)' }, unit: 'Index (100)', base: 100, konservativ: 97, basis: 92, ambitioniert: 85, featured: true },
    { label: { de: 'Interne Besetzungs-/Reskilling-Quote', en: 'Internal fill / reskilling rate' }, unit: '%', base: 30, konservativ: 45, basis: 60, ambitioniert: 75, featured: true },
    { label: { de: 'Fluktuation', en: 'Attrition' }, unit: '%', base: 8, konservativ: 7, basis: 6, ambitioniert: 5, featured: true },
    { label: { de: 'NPS (Kundenwirkung)', en: 'NPS (customer impact)' }, unit: 'Punkte', base: 5, konservativ: 6, basis: 9, ambitioniert: 13, featured: false },
    { label: { de: 'Marge/Ertrag', en: 'Margin / revenue' }, unit: 'Index (100)', base: 100, konservativ: 101, basis: 103, ambitioniert: 106, featured: false },
    { label: { de: 'Time-to-Competence', en: 'Time-to-competence' }, unit: 'Monate', base: 9, konservativ: 7.65, basis: 6.3, ambitioniert: 4.5, featured: false },
    { label: { de: 'Weiterbildungsstunden/FTE', en: 'Training hours / FTE' }, unit: 'Std. p.a.', base: 25, konservativ: 30, basis: 40, ambitioniert: 50, featured: false },
  ],
  it: [
    { label: { de: 'Entwicklungsproduktivität', en: 'Development productivity' }, unit: '%', base: 0, konservativ: 15, basis: 30, ambitioniert: 50, featured: true },
    { label: { de: 'Time-to-Market Features', en: 'Time-to-market (features)' }, unit: 'Index (100)', base: 100, konservativ: 80, basis: 60, ambitioniert: 40, featured: true },
    { label: { de: 'Betriebskosten/CIR (IT)', en: 'Operating costs / CIR (IT)' }, unit: '%', base: 65, konservativ: 63, basis: 60, ambitioniert: 56, featured: true },
    { label: { de: 'Anteil KI-generierter/-geprüfter Code', en: 'Share of AI-generated/-reviewed code' }, unit: '%', base: 5, konservativ: 25, basis: 45, ambitioniert: 70, featured: true },
    { label: { de: 'Marge/Ertrag (Time-to-Market)', en: 'Margin / revenue (time-to-market)' }, unit: 'Index (100)', base: 100, konservativ: 101, basis: 103, ambitioniert: 106, featured: false },
    { label: { de: 'Run-vs-Change-Anteil (Run)', en: 'Run share (run vs change)' }, unit: '%', base: 70, konservativ: 65, basis: 55, ambitioniert: 45, featured: false },
    { label: { de: 'Deployment-Frequenz', en: 'Deployment frequency' }, unit: 'Index (100)', base: 100, konservativ: 130, basis: 180, ambitioniert: 250, featured: false },
  ],
  compliance: [
    { label: { de: 'Cost of Compliance (% Betriebskosten)', en: 'Cost of compliance (% of opex)' }, unit: '%', base: 10, konservativ: 9, basis: 7.5, ambitioniert: 6, featured: true },
    { label: { de: 'False-Positive-Rate AML', en: 'False-positive rate (AML)' }, unit: '%', base: 90, konservativ: 75, basis: 55, ambitioniert: 35, featured: true },
    { label: { de: 'Anteil kontinuierlich überwachter Kontrollen', en: 'Share of continuously monitored controls' }, unit: '%', base: 10, konservativ: 30, basis: 55, ambitioniert: 80, featured: true },
    { label: { de: 'Prüfungsdurchlaufzeit', en: 'Audit lead time' }, unit: 'Index (100)', base: 100, konservativ: 85, basis: 65, ambitioniert: 45, featured: true },
    { label: { de: 'Betriebskosten/CIR', en: 'Operating costs / CIR' }, unit: '%', base: 65, konservativ: 64, basis: 62, ambitioniert: 59, featured: false },
    { label: { de: 'Marge/Ertrag', en: 'Margin / revenue' }, unit: 'Index (100)', base: 100, konservativ: 100.5, basis: 101.5, ambitioniert: 103, featured: false },
    { label: { de: 'Bearbeitungszeit je Alert', en: 'Handling time per alert' }, unit: 'Min', base: 30, konservativ: 24, basis: 18, ambitioniert: 12, featured: false },
  ],
  projekt: [
    { label: { de: 'Time-to-Market neue Produkte', en: 'Time-to-market (new products)' }, unit: 'Monate', base: 12, konservativ: 9.6, basis: 6.6, ambitioniert: 3.6, featured: true },
    { label: { de: 'Marge/Ertrag', en: 'Margin / revenue' }, unit: 'Index (100)', base: 100, konservativ: 102, basis: 105, ambitioniert: 110, featured: true },
    { label: { de: 'Personalisierungsgrad', en: 'Personalisation level' }, unit: '%', base: 10, konservativ: 25, basis: 45, ambitioniert: 65, featured: true },
    { label: { de: 'Ertragsanteil Produkte <24 Monate', en: 'Revenue share of products < 24 months' }, unit: '%', base: 10, konservativ: 15, basis: 22, ambitioniert: 30, featured: true },
    { label: { de: 'NPS', en: 'NPS' }, unit: 'Punkte', base: 5, konservativ: 7, basis: 11, ambitioniert: 18, featured: false },
    { label: { de: 'Betriebskosten (Entwicklung)', en: 'Operating costs (development)' }, unit: 'Index (100)', base: 100, konservativ: 85, basis: 65, ambitioniert: 45, featured: false },
    { label: { de: 'Konversion personalisiert vs. Standard', en: 'Conversion: personalised vs standard' }, unit: '%', base: 0, konservativ: 10, basis: 25, ambitioniert: 40, featured: false },
  ],
  vorstand: [
    { label: { de: 'Reporting-Latenz', en: 'Reporting latency' }, unit: 'Tage', base: 6, konservativ: 4.8, basis: 3, ambitioniert: 1, featured: true },
    { label: { de: 'Anteil Echtzeit-KPIs', en: 'Share of real-time KPIs' }, unit: '%', base: 10, konservativ: 30, basis: 55, ambitioniert: 80, featured: true },
    { label: { de: 'Entscheidungsgeschwindigkeit', en: 'Decision speed' }, unit: 'Index (100)', base: 100, konservativ: 80, basis: 60, ambitioniert: 40, featured: true },
    { label: { de: 'Betriebskosten (Reporting/Controlling)', en: 'Operating costs (reporting/controlling)' }, unit: 'Index (100)', base: 100, konservativ: 90, basis: 75, ambitioniert: 55, featured: true },
    { label: { de: 'NPS (indirekt)', en: 'NPS (indirect)' }, unit: 'Punkte', base: 5, konservativ: 5, basis: 7, ambitioniert: 9, featured: false },
    { label: { de: 'Marge/Ertrag', en: 'Margin / revenue' }, unit: 'Index (100)', base: 100, konservativ: 101, basis: 103, ambitioniert: 106, featured: false },
    { label: { de: 'Forecast-Genauigkeit', en: 'Forecast accuracy' }, unit: '%', base: 0, konservativ: 5, basis: 7, ambitioniert: 15, featured: false },
  ],
}
