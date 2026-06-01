import { tx } from '../utils/langHelper';

// Demo-Stammdaten für Termin-Stub-Kunden (KDB00X).
// Diese Kunden tauchen in den "Anstehenden Terminen" der Uebersicht auf,
// sind aber bewusst NICHT im regulaeren KUNDEN_BY_MODE-Bestand (sonst
// wuerden sie auch in der Kundenliste, Potenziale, Kanban etc. auftauchen
// und die dortigen Listen verwaessern). Fuer das TerminPrepModal brauchen
// wir aber sinnvolle Stammdaten — ansonsten waere das Modal nahezu leer.
//
// Die Daten sind minimal gehalten (keine Potenziale/Transaktionen/…),
// aber so dass das Modal die Vorstellung + grobe Haushalts-/Finanzkennzahlen
// korrekt rendern kann.

export const TERMIN_STUB_KUNDEN = {
  KDB004: {
    id: 'KDB004',
    name: 'Julia Becker',
    alter: 58,
    beruf: 'Personalleiterin',
    arbeitgeber: { name: 'Fresenius', quelle: 'arbeitgeber', bestaetigt: true },
    nettoeinkommen: 4800,
    familienstand: 'verheiratet',
    partner: { name: 'Michael', einkommen: 5200 },
    kinder: [{ name: 'Laura', alter: 26 }, { name: 'Jonas', alter: 23 }],
    wohnsituation: 'Eigentum',
    wohnflaeche: 155,
    adresse: 'Parkstr. 42, 35390 Gießen',
    nps: 8,
    risikoscore: 25,
    eigeneProdukte: [
      { typ: 'girokonto', sparte: 'konto', produkt: 'VR-MeinKonto Plus', details: tx('Hauptkonto', 'Main account'), praemie: 0, seit: '2009-04', status: 'aktiv' },
      { typ: 'sparkonto', sparte: 'sparen', produkt: 'VR-Sparkonto', details: tx('Notgroschen', 'Emergency fund'), praemie: 0, seit: '2009-04', status: 'aktiv', volumen: 32000 },
      { typ: 'depot', sparte: 'wertpapiere', produkt: 'UnionDepot Klassik', details: tx('Ausgewogen', 'Balanced'), praemie: 0, seit: '2012-09', status: 'aktiv', volumen: 78000 },
      { typ: 'bausparvertrag', sparte: 'sparen', produkt: 'VR-Bausparvertrag', details: tx('Tarif Klassik', 'Classic plan'), praemie: 0, seit: '2015-01', status: 'aktiv', volumen: 24000 },
    ],
    fremdProdukte: [],
  },

  KDB007: {
    id: 'KDB007',
    name: 'Thomas Krüger',
    alter: 34,
    beruf: 'Software-Entwickler',
    arbeitgeber: { name: 'SAP', quelle: 'arbeitgeber', bestaetigt: true },
    nettoeinkommen: 4200,
    familienstand: 'verheiratet',
    partner: { name: 'Lisa', einkommen: 2800 },
    kinder: [{ name: 'Emma', alter: 3 }],
    wohnsituation: 'Miete',
    wohnflaeche: 95,
    adresse: 'Friedrichstr. 12, 35398 Gießen',
    nps: 9,
    risikoscore: 20,
    eigeneProdukte: [
      { typ: 'girokonto', sparte: 'konto', produkt: 'VR-MeinKonto Plus', details: tx('Gehaltskonto', 'Salary account'), praemie: 0, seit: '2019-06', status: 'aktiv' },
      { typ: 'sparkonto', sparte: 'sparen', produkt: 'VR-Tagesgeld', details: tx('Eigenkapital Immobilie', 'Equity for property'), praemie: 0, seit: '2021-03', status: 'aktiv', volumen: 68000 },
      { typ: 'visa', sparte: 'karte', produkt: 'VR-Visa Classic', details: 'Limit 3k', praemie: 35, seit: '2019-06', status: 'aktiv' },
    ],
    fremdProdukte: [
      { typ: 'depot', institut: 'Trade Republic', details: tx('ETF-Sparplan (MSCI World)', 'ETF savings plan (MSCI World)'), volumen: 18500, consent: true },
    ],
  },

  KDB010: {
    id: 'KDB010',
    name: 'Christian Binder',
    alter: 47,
    beruf: 'Steuerberater',
    arbeitgeber: { name: 'Selbstständig', quelle: 'eigenangabe', bestaetigt: true },
    nettoeinkommen: 7200,
    familienstand: 'verheiratet',
    partner: { name: 'Katharina', einkommen: 3400 },
    kinder: [{ name: 'Paul', alter: 14 }, { name: 'Lina', alter: 11 }],
    wohnsituation: 'Eigentum',
    wohnflaeche: 210,
    adresse: 'Lindenallee 7, 35394 Gießen',
    nps: 7,
    risikoscore: 28,
    eigeneProdukte: [
      { typ: 'girokonto', sparte: 'konto', produkt: 'VR-PremiumKonto', details: tx('Geschäfts- und Privatkonto', 'Business and personal account'), praemie: 0, seit: '2011-10', status: 'aktiv' },
      { typ: 'depot', sparte: 'wertpapiere', produkt: 'UnionDepot Select', details: tx('Wachstum', 'Growth'), praemie: 0, seit: '2014-02', status: 'aktiv', volumen: 245000 },
      { typ: 'rente', sparte: 'vorsorge', produkt: 'R+V Rürup-Rente', details: tx('Steueroptimiert', 'Tax-optimised'), praemie: 4800, seit: '2013-11', status: 'aktiv', volumen: 128000 },
      { typ: 'visa', sparte: 'karte', produkt: 'VR-Visa Gold', details: 'Limit 15k', praemie: 120, seit: '2012-01', status: 'aktiv' },
    ],
    fremdProdukte: [
      { typ: 'depot', institut: 'Deutsche Bank', details: tx('Vermögensverwaltung', 'Asset management'), volumen: 180000, consent: false },
    ],
  },

  KDB011: {
    id: 'KDB011',
    name: 'Sabine Lorenz',
    alter: 52,
    beruf: 'Fachärztin Kardiologie',
    arbeitgeber: { name: 'Uniklinikum Marburg', quelle: 'arbeitgeber', bestaetigt: true },
    nettoeinkommen: 6500,
    familienstand: 'geschieden',
    partner: null,
    kinder: [{ name: 'Sophie', alter: 19 }],
    wohnsituation: 'Eigentum',
    wohnflaeche: 140,
    adresse: 'Bahnhofstr. 21, 35037 Marburg',
    nps: 9,
    risikoscore: 18,
    eigeneProdukte: [
      { typ: 'girokonto', sparte: 'konto', produkt: 'VR-MeinKonto Plus', details: tx('Hauptkonto', 'Main account'), praemie: 0, seit: '2008-05', status: 'aktiv' },
      { typ: 'depot', sparte: 'wertpapiere', produkt: 'UnionDepot Dynamik', details: tx('Aktien-ETF + Einzeltitel', 'Equity ETF + single stocks'), praemie: 0, seit: '2010-08', status: 'aktiv', volumen: 310000 },
      { typ: 'rente', sparte: 'vorsorge', produkt: 'R+V Privatrente Performance', details: tx('Fondsgebunden', 'Unit-linked'), praemie: 3600, seit: '2011-01', status: 'aktiv', volumen: 142000 },
      { typ: 'sparkonto', sparte: 'sparen', produkt: 'VR-Sparkonto', details: tx('Notgroschen', 'Emergency fund'), praemie: 0, seit: '2008-05', status: 'aktiv', volumen: 45000 },
    ],
    fremdProdukte: [
      { typ: 'versicherung', produktart: 'Berufshaftpflicht', institut: 'HDI', details: tx('Ärzte-Tarif', 'Physicians plan'), volumen: 1800, consent: true },
    ],
  },
};

export function getTerminStubKunde(kundeId) {
  return TERMIN_STUB_KUNDEN[kundeId] || null;
}
