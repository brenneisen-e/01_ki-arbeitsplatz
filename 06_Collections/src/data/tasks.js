// Aufgabenliste des Collections-Dashboards.
// 1:1 uebernommen aus partials/banken/section-aufgaben.html.

export const AUFGABEN_FILTER = [
  { id: 'alle', label: 'Alle' },
  { id: 'heute', label: 'Heute fällig' },
  { id: 'ueberfaellig', label: 'Überfällig' },
  { id: 'woche', label: 'Diese Woche' },
];

export const PRIORITAET_FARBEN = {
  hoch: { color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  mittel: { color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  normal: { color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' },
};

export const AUFGABEN = [
  { id: "T-001", titel: "R\u00fcckruf vereinbaren: Mueller GmbH", kunde: "K-2024-0001", faellig: "\u00dcberf\u00e4llig: Gestern 14:00", status: "ueberfaellig", prioritaet: "hoch" },
  { id: "T-015", titel: "Mahnung versenden: Bauer Industrie AG", kunde: "K-2024-0015", faellig: "\u00dcberf\u00e4llig: Vor 2 Tagen", status: "ueberfaellig", prioritaet: "hoch" },
  { id: "T-022", titel: "Zahlungseingang pr\u00fcfen: Fischer & S\u00f6hne", kunde: "K-2024-0022", faellig: "\u00dcberf\u00e4llig: Vor 3 Tagen", status: "ueberfaellig", prioritaet: "hoch" },
  { id: "T-008", titel: "Eskalation: Konto sperren - Huber Trading", kunde: "K-2024-0008", faellig: "\u00dcberf\u00e4llig: Vor 5 Tagen", status: "ueberfaellig", prioritaet: "hoch" },
  { id: "T-031", titel: "Ratenzahlungsvereinbarung nachfassen: Klein GmbH", kunde: "K-2024-0031", faellig: "\u00dcberf\u00e4llig: Gestern 09:00", status: "ueberfaellig", prioritaet: "hoch" },
  { id: "T-044", titel: "Inkasso-Pr\u00fcfung: Meier Technik", kunde: "K-2024-0044", faellig: "\u00dcberf\u00e4llig: Vor 4 Tagen", status: "ueberfaellig", prioritaet: "hoch" },
  { id: "T-052", titel: "Dokumentation vervollst\u00e4ndigen: Nowak Services", kunde: "K-2024-0052", faellig: "\u00dcberf\u00e4llig: Vor 2 Tagen", status: "ueberfaellig", prioritaet: "hoch" },
  { id: "T-002", titel: "Ratenvereinbarung pr\u00fcfen: Schmidt, Peter", kunde: "K-2024-0002", faellig: "Heute 16:00", status: "heute", prioritaet: "mittel" },
  { id: "T-067", titel: "Kundenanruf: Neumann Logistics", kunde: "K-2024-0067", faellig: "Heute 10:00", status: "heute", prioritaet: "mittel" },
  { id: "T-078", titel: "Zahlungszusage best\u00e4tigen: Hoffmann & Partner", kunde: "K-2024-0078", faellig: "Heute 11:30", status: "heute", prioritaet: "mittel" },
  { id: "T-085", titel: "Teilzahlung verbuchen: Lang Elektronik", kunde: "K-2024-0085", faellig: "Heute 14:00", status: "heute", prioritaet: "mittel" },
  { id: "T-091", titel: "2. Mahnung versenden: Braun Consulting", kunde: "K-2024-0091", faellig: "Heute 15:00", status: "heute", prioritaet: "mittel" },
  { id: "T-103", titel: "Bonit\u00e4tspr\u00fcfung: Krause Import", kunde: "K-2024-0103", faellig: "Heute 17:00", status: "heute", prioritaet: "mittel" },
  { id: "T-112", titel: "Vertragsdaten aktualisieren: Wolf GmbH", kunde: "K-2024-0112", faellig: "Heute 12:00", status: "heute", prioritaet: "mittel" },
  { id: "T-119", titel: "Stundungsantrag pr\u00fcfen: Richter AG", kunde: "K-2024-0119", faellig: "Heute 13:30", status: "heute", prioritaet: "mittel" },
  { id: "T-003", titel: "Inkasso-\u00dcbergabe vorbereiten: Weber KG", kunde: "K-2024-0003", faellig: "Morgen 10:00", status: "woche", prioritaet: "normal" },
  { id: "T-127", titel: "Folgetermin: Schulz Maschinenbau", kunde: "K-2024-0127", faellig: "Morgen 14:30", status: "woche", prioritaet: "normal" },
  { id: "T-134", titel: "Zahlungsplan erstellen: Frank Handels", kunde: "K-2024-0134", faellig: "\u00dcbermorgen 09:00", status: "woche", prioritaet: "normal" },
  { id: "T-142", titel: "Kreditlimit anpassen: Zimmer Transport", kunde: "K-2024-0142", faellig: "Do 11:00", status: "woche", prioritaet: "normal" },
  { id: "T-155", titel: "Jahresabschluss pr\u00fcfen: Berger Bau", kunde: "K-2024-0155", faellig: "Fr 10:00", status: "woche", prioritaet: "normal" },
  { id: "T-168", titel: "Sicherheiten bewerten: K\u00f6nig Metall", kunde: "K-2024-0168", faellig: "Fr 14:00", status: "woche", prioritaet: "normal" },
  { id: "T-176", titel: "Ratenpause genehmigen: Lorenz Design", kunde: "K-2024-0176", faellig: "Fr 16:00", status: "woche", prioritaet: "normal" },
  { id: "T-188", titel: "Vertrags\u00e4nderung: Schr\u00f6der IT", kunde: "K-2024-0188", faellig: "Sa 09:00", status: "woche", prioritaet: "normal" },
];

// Abschlussgruende aus dem Legacy-Dialog (openTaskCompletionDialog).
export const ABSCHLUSS_GRUENDE = [
  { id: 'erledigt', label: 'Erfolgreich erledigt' },
  { id: 'kontakt', label: 'Kunde kontaktiert – Rückmeldung ausstehend' },
  { id: 'nicht-erreicht', label: 'Kunde nicht erreicht' },
  { id: 'weitergeleitet', label: 'An Fachabteilung weitergeleitet' },
  { id: 'hinfaellig', label: 'Hinfällig – Forderung beglichen' },
];
