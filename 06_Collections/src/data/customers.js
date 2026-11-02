// Kundenliste des Collections-Dashboards.
// 1:1 uebernommen aus der Tabelle in partials/banken/section-segmentierung.html.

export const SEGMENT_LABELS = {
  escalate: { label: 'Eskalation', color: '#f97316', bg: '#fff7ed' },
  priority: { label: 'Priorität', color: '#16a34a', bg: '#f0fdf4' },
  restructure: { label: 'Restrukturierung', color: '#ca8a04', bg: '#fefce8' },
  writeoff: { label: 'Abwicklung', color: '#dc2626', bg: '#fef2f2' },
  stabil: { label: 'Stabil', color: '#0284c7', bg: '#f0f9ff' },
  success: { label: 'Abgeschlossen', color: '#059669', bg: '#ecfdf5' },
};

export const STATUS_LABELS = {
  inkasso: { label: 'Inkasso', color: '#dc2626', bg: '#fef2f2' },
  zusage: { label: 'Zusage', color: '#7c3aed', bg: '#f5f3ff' },
  offen: { label: 'Aktiv', color: '#0284c7', bg: '#f0f9ff' },
  success: { label: 'Bezahlt', color: '#059669', bg: '#ecfdf5' },
};

export const MAHNSTUFEN = {
  M0: { color: '#64748b', bg: '#f1f5f9' },
  M1: { color: '#0284c7', bg: '#f0f9ff' },
  M2: { color: '#d97706', bg: '#fffbeb' },
  M3: { color: '#dc2626', bg: '#fef2f2' },
};

export const PRODUKT_FILTER = [
  { value: '', label: 'Alle Produkte' },
  { value: 'Dispositionskredit', label: 'Dispositionskredit' },
  { value: 'Ratenkredit', label: 'Ratenkredit' },
  { value: 'Kreditkarte', label: 'Kreditkarte' },
  { value: 'Betriebsmittelkredit', label: 'Betriebsmittelkredit' },
  { value: 'Kontokorrentkredit', label: 'Kontokorrentkredit' },
  { value: 'Baufinanzierung', label: 'Baufinanzierung' },
  { value: 'Investitionskredit', label: 'Investitionskredit' },
];

export const SEGMENT_FILTER = [
  { value: '', label: 'Alle Segmente' },
  { value: 'priority', label: 'Priorität' },
  { value: 'restructure', label: 'Restrukturierung' },
  { value: 'escalate', label: 'Eskalation' },
  { value: 'writeoff', label: 'Abwicklung' },
  { value: 'stabil', label: 'Stabil' },
  { value: 'success', label: 'Abgeschlossen' },
];

export const CUSTOMERS = [
  {
    id: 'K-2024-0001', name: 'Mueller GmbH', typ: 'Gewerbe',
    produkt: 'Betriebsmittelkredit', forderung: 125000, dpd: 35,
    segment: 'escalate', willingness: 25, ability: 60, mahnstufe: 'M3',
    aktion: 'Inkasso-Verfahren', aktionDatum: '10.12.2025', aktionTon: 'overdue',
    status: 'inkasso', bearbeiter: 'M. Schneider',
    aktionen: ['mahnprozess', 'verkaufen', 'abschreiben'],
  },
  {
    id: 'K-2024-8847', name: 'Müller, Hans', typ: 'Privat',
    produkt: 'Ratenkredit', forderung: 4230, dpd: 18,
    segment: 'priority', willingness: 85, ability: 70, mahnstufe: 'M1',
    aktion: 'Zahlungszusage 23.12.', aktionDatum: '23.12.2025', aktionTon: 'upcoming',
    status: 'zusage', bearbeiter: 'K. Weber',
    aktionen: ['anrufen'],
  },
  {
    id: 'K-2024-8846', name: 'Schmidt GmbH', typ: 'Gewerbe',
    produkt: 'Kontokorrentkredit', forderung: 12890, dpd: 18,
    segment: 'priority', willingness: 75, ability: 80, mahnstufe: 'M2',
    aktion: 'Zahlungszusage 27.12.', aktionDatum: '27.12.2025', aktionTon: 'upcoming',
    status: 'zusage', bearbeiter: 'T. Fischer',
    aktionen: ['anrufen'],
  },
  {
    id: 'K-2024-8845', name: 'Weber, Anna', typ: 'Privat',
    produkt: 'Kreditkarte', forderung: 2150, dpd: 18,
    segment: 'priority', willingness: 70, ability: 55, mahnstufe: 'M2',
    aktion: 'Zahlungszusage 28.12.', aktionDatum: '28.12.2025', aktionTon: 'upcoming',
    status: 'zusage', bearbeiter: 'S. Müller',
    aktionen: ['anrufen'],
  },
  {
    id: 'K-2024-7234', name: 'Braun, Thomas', typ: 'Privat',
    produkt: 'Baufinanzierung', forderung: 289350, dpd: 0,
    segment: 'stabil', willingness: 90, ability: 85, mahnstufe: 'M0',
    aktion: 'Monitoring', aktionDatum: 'Aktiv', aktionTon: 'neutral',
    status: 'offen', bearbeiter: 'A. Becker',
    aktionen: ['ansehen'],
  },
  {
    id: 'K-2024-6234', name: 'Fischer, Maria', typ: 'Privat',
    produkt: 'Ratenkredit', forderung: 3200, dpd: 0,
    segment: 'stabil', willingness: 80, ability: 50, mahnstufe: 'M0',
    aktion: 'Monitoring', aktionDatum: 'Aktiv', aktionTon: 'neutral',
    status: 'offen', bearbeiter: 'K. Weber',
    aktionen: ['ansehen'],
  },
  {
    id: 'K-2024-6891', name: 'Klein KG', typ: 'Gewerbe',
    produkt: 'Betriebsmittelkredit', forderung: 0, dpd: 0,
    segment: 'success', willingness: 85, ability: 75, mahnstufe: 'M0',
    aktion: null, aktionDatum: '19.12.2025', aktionTon: 'neutral',
    status: 'success', bearbeiter: 'M. Schneider',
    aktionen: ['ansehen'],
  },
  {
    id: 'K-2024-5982', name: 'Meier, Stefan', typ: 'Privat',
    produkt: 'Dispositionskredit', forderung: 0, dpd: 0,
    segment: 'success', willingness: 75, ability: 70, mahnstufe: 'M0',
    aktion: null, aktionDatum: '15.12.2025', aktionTon: 'neutral',
    status: 'success', bearbeiter: 'T. Fischer',
    aktionen: ['ansehen'],
  },
  {
    id: 'K-2024-5876', name: 'Schneider Logistik GmbH', typ: 'Gewerbe',
    produkt: 'Kontokorrentkredit', forderung: 0, dpd: 0,
    segment: 'success', willingness: 80, ability: 85, mahnstufe: 'M0',
    aktion: null, aktionDatum: '12.12.2025', aktionTon: 'neutral',
    status: 'success', bearbeiter: 'A. Becker',
    aktionen: ['ansehen'],
  },
  {
    id: 'K-2024-5734', name: 'Fischer, Anna', typ: 'Privat',
    produkt: 'Kreditkarte', forderung: 0, dpd: 0,
    segment: 'success', willingness: 95, ability: 90, mahnstufe: 'M0',
    aktion: null, aktionDatum: '10.12.2025', aktionTon: 'neutral',
    status: 'success', bearbeiter: 'S. Müller',
    aktionen: ['ansehen'],
  },
  {
    id: 'K-2024-5612', name: 'Bäckerei Müller', typ: 'Gewerbe',
    produkt: 'Investitionskredit', forderung: 0, dpd: 0,
    segment: 'success', willingness: 85, ability: 80, mahnstufe: 'M0',
    aktion: null, aktionDatum: '08.12.2025', aktionTon: 'neutral',
    status: 'success', bearbeiter: 'K. Weber',
    aktionen: ['ansehen'],
  },
];

export function getCustomer(id) {
  return CUSTOMERS.find(c => c.id === id) || null;
}

// Verzugstage-Bucket eines Falls (fuer den Donut-Filter der KPI-Kachel).
export function dpdBucket(dpd) {
  if (dpd <= 30) return '0-30';
  if (dpd <= 90) return '31-90';
  return '90+';
}

/**
 * Weitere Faelle des Portfolios. Sie erscheinen in den Antworten des
 * Collections Assistenten und tragen keine ausgebaute Akte — beim Oeffnen
 * liefert getFullCustomerData daraus eine Kurzakte, damit ein Klick im Chat
 * nie in einem leeren Datensatz landet.
 */
export const WEITERE_FAELLE = [
  { id: 'K-2024-0001', name: 'Mueller GmbH', forderung: 125000, dpd: 35, segment: 'eskalation', status: 'Inkasso' },
  { id: 'K-2024-0002', name: 'Schmidt, Peter', forderung: 8450, dpd: 21, segment: 'prioritaet', status: 'Offen' },
  { id: 'K-2024-0003', name: 'Weber KG', forderung: 45780, dpd: 14, segment: 'restrukturierung', status: 'Vereinbarung' },
  { id: 'K-2024-0004', name: 'Braun, Maria', forderung: 3210, dpd: 67, segment: 'abwicklung', status: 'Abschreibung' },
  { id: 'K-2024-0005', name: 'Hoffmann Bau GmbH', forderung: 287500, dpd: 48, segment: 'eskalation', status: 'Inkasso' },
  { id: 'K-2024-0006', name: 'Keller, Thomas', forderung: 15800, dpd: 42, segment: 'eskalation', status: 'Inkasso' },
  { id: 'K-2024-0007', name: 'Autohaus Berger', forderung: 89300, dpd: 55, segment: 'eskalation', status: 'Inkasso' },
  { id: 'K-2024-0008', name: 'Lehmann, Sandra', forderung: 12650, dpd: 18, segment: 'prioritaet', status: 'Offen' },
  { id: 'K-2024-0009', name: 'Meier Elektro OHG', forderung: 34200, dpd: 25, segment: 'prioritaet', status: 'Offen' },
  { id: 'K-2024-0010', name: 'Fischer, Hans', forderung: 6890, dpd: 12, segment: 'prioritaet', status: 'Zusage' },
  { id: 'K-2024-0011', name: 'Bäckerei Schulze', forderung: 67400, dpd: 28, segment: 'restrukturierung', status: 'Vereinbarung' },
  { id: 'K-2024-0012', name: 'Neumann, Klaus', forderung: 156000, dpd: 8, segment: 'restrukturierung', status: 'Vereinbarung' },
  { id: 'K-2024-0013', name: 'Gasthaus zum Löwen', forderung: 112800, dpd: 19, segment: 'restrukturierung', status: 'Vereinbarung' },
  { id: 'K-2024-0014', name: 'Werner, Sabine', forderung: 4560, dpd: 92, segment: 'abwicklung', status: 'Abschreibung' },
  { id: 'K-2024-0015', name: 'Maier Transporte', forderung: 78900, dpd: 78, segment: 'abwicklung', status: 'Abschreibung' },
  { id: 'K-2024-0016', name: 'Zimmermann, Frank', forderung: 2340, dpd: 105, segment: 'abwicklung', status: 'Abschreibung' },
  // Neue Faelle seit letztem Login
  { id: 'K-2024-8847', name: 'Müller, Hans', forderung: 4230, dpd: 2, segment: 'prioritaet', status: 'Offen' },
  { id: 'K-2024-8846', name: 'Schmidt GmbH', forderung: 12890, dpd: 3, segment: 'prioritaet', status: 'Offen' },
  { id: 'K-2024-8845', name: 'Weber, Anna', forderung: 2150, dpd: 5, segment: 'prioritaet', status: 'Offen' },
  // Zahlungseingaenge / Ehemalige Faelle
  { id: 'K-2024-7234', name: 'Braun, Thomas', forderung: 1890, dpd: 0, segment: 'abgeschlossen', status: 'Bezahlt' },
  { id: 'K-2024-6891', name: 'Klein KG', forderung: 8400, dpd: 0, segment: 'abgeschlossen', status: 'Bezahlt' },
  { id: 'K-2024-6234', name: 'Fischer, Maria', forderung: 780, dpd: 0, segment: 'abgeschlossen', status: 'Bezahlt' },
  { id: 'K-2024-5982', name: 'Meier, Stefan', forderung: 2340, dpd: 0, segment: 'abgeschlossen', status: 'Bezahlt' },
  { id: 'K-2024-5876', name: 'Schneider Logistik GmbH', forderung: 15200, dpd: 0, segment: 'abgeschlossen', status: 'Bezahlt' },
  { id: 'K-2024-5734', name: 'Fischer, Anna', forderung: 3450, dpd: 0, segment: 'abgeschlossen', status: 'Bezahlt' },
  { id: 'K-2024-5612', name: 'Bäckerei Müller', forderung: 24800, dpd: 0, segment: 'abgeschlossen', status: 'Bezahlt' },
];

export function getKurzfall(id) {
  return WEITERE_FAELLE.find(c => c.id === id) || null;
}
