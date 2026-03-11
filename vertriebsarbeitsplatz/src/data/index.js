import { V1, V2, V3, V4 } from './versicherung-v1-v4';
import { V5, V6, V7, V8 } from './versicherung-v5-v8';
import { B1, B2, B3, B4, B5, B6 } from './banking';
import { W1, W2, W3, W4, W5 } from './vv';

export const VERSICHERUNG_KUNDEN = [V1, V2, V3, V4, V5, V6, V7, V8];
export const BANKING_KUNDEN = [B1, B2, B3, B4, B5, B6];
export const VV_MANDANTEN = [W1, W2, W3, W4, W5];

export const KUNDEN_BY_MODE = {
  versicherung: VERSICHERUNG_KUNDEN,
  banking: BANKING_KUNDEN,
  vermoegensverwaltung: VV_MANDANTEN,
};

export function getKundeById(modeId, kundeId) {
  const list = KUNDEN_BY_MODE[modeId] || [];
  return list.find(k => k.id === kundeId);
}

export function getAllPotentiale(modeId) {
  const kunden = KUNDEN_BY_MODE[modeId] || [];
  return kunden.flatMap(k =>
    (k.potentiale || []).map(p => ({ ...p, kundeId: k.id, kundeName: k.name }))
  );
}

// Neugeschaeft Mock-Daten
export const NEUGESCHAEFT_DATA = {
  versicherung: {
    kpiValues: {
      antraege: { wert: 86, trend: 12.5 },
      policiert: { wert: 392209, trend: 8.3 },
      ape: { wert: 313000, trend: 15.2 },
      abschlussquote: { wert: 77.9, trend: 3.1 },
    },
    spartenVerteilung: [
      { name: 'Leben', value: 32, color: '#3b82f6' },
      { name: 'Kranken', value: 21, color: '#10b981' },
      { name: 'Schaden', value: 21, color: '#8b5cf6' },
      { name: 'Kfz', value: 12, color: '#f59e0b' },
    ],
    top5: [
      { name: 'Ralf Dietrich', betrag: 1585 },
      { name: 'Ingrid Sommer', betrag: 514 },
      { name: 'Dirk Hoffmann', betrag: 1400 },
      { name: 'Heike Bauer', betrag: 890 },
      { name: 'Frank Peters', betrag: 720 },
    ],
    vertraege: [
      { id: 'NG-2026-001', kundeId: 'KD00026', kunde: 'Ralf Dietrich', sparte: 'leben', produkt: 'BU-Versicherung', versicherer: 'HDI', beitrag: 1500, beitragsart: 'mtl', status: 'policiert', datum: '2026-01-15' },
      { id: 'NG-2026-002', kundeId: 'KD00026', kunde: 'Ralf Dietrich', sparte: 'schaden', produkt: 'Haftpflicht', versicherer: 'HDI', beitrag: 85, beitragsart: 'J', status: 'policiert', datum: '2026-01-15' },
      { id: 'NG-2026-003', kundeId: 'KD00027', kunde: 'Ingrid Sommer', sparte: 'kranken', produkt: 'Zahnzusatz', versicherer: 'DKV', beitrag: 384, beitragsart: 'mtl', status: 'policiert', datum: '2026-02-01' },
      { id: 'NG-2026-004', kundeId: 'KD00027', kunde: 'Ingrid Sommer', sparte: 'schaden', produkt: 'Hausrat', versicherer: 'Allianz', beitrag: 130, beitragsart: 'J', status: 'policiert', datum: '2026-02-01' },
      { id: 'NG-2026-005', kundeId: 'KD00028', kunde: 'Dirk Hoffmann', sparte: 'leben', produkt: 'Fondspolice', versicherer: 'ERGO', beitrag: 1400, beitragsart: 'mtl', status: 'policiert', datum: '2026-02-10' },
    ],
  },
  banking: {
    kpiValues: {
      antraege: { wert: 42, trend: 8.2 },
      policiert: { wert: 2850000, trend: 12.1 },
      ape: { wert: 385000, trend: 9.5 },
      abschlussquote: { wert: 82.3, trend: 4.2 },
    },
    spartenVerteilung: [
      { name: 'Baufinanzierung', value: 38, color: '#3b82f6' },
      { name: 'Konsumentenkredit', value: 22, color: '#10b981' },
      { name: 'Wertpapiere', value: 25, color: '#8b5cf6' },
      { name: 'Versicherung', value: 15, color: '#f59e0b' },
    ],
    top5: [
      { name: 'Lukas Braun', betrag: 285000 },
      { name: 'Sabine Fischer', betrag: 180000 },
      { name: 'Markus Klein', betrag: 125000 },
      { name: 'Petra Neumann', betrag: 95000 },
      { name: 'Jens Hartmann', betrag: 72000 },
    ],
    vertraege: [
      { id: 'BK-2026-001', kundeId: 'BK00001', kunde: 'Lukas Braun', sparte: 'baufi', produkt: 'Baufinanzierung', versicherer: 'Volksbank', beitrag: 285000, beitragsart: 'ges.', status: 'policiert', datum: '2026-01-20' },
      { id: 'BK-2026-002', kundeId: 'BK00002', kunde: 'Sabine Fischer', sparte: 'kredit', produkt: 'Ratenkredit', versicherer: 'Volksbank', beitrag: 15000, beitragsart: 'ges.', status: 'policiert', datum: '2026-02-05' },
      { id: 'BK-2026-003', kundeId: 'BK00003', kunde: 'Markus Klein', sparte: 'wertpapiere', produkt: 'Depot-Eroeffnung', versicherer: 'Union Investment', beitrag: 125000, beitragsart: 'einm.', status: 'policiert', datum: '2026-02-15' },
      { id: 'BK-2026-004', kundeId: 'BK00004', kunde: 'Petra Neumann', sparte: 'baufi', produkt: 'Anschlussfinanzierung', versicherer: 'Schwäbisch Hall', beitrag: 95000, beitragsart: 'ges.', status: 'beantragt', datum: '2026-03-01' },
    ],
  },
  vermoegensverwaltung: {
    kpiValues: {
      antraege: { wert: 8, trend: 33.3 },
      policiert: { wert: 5800000, trend: 15.3 },
      ape: { wert: 892000, trend: 18.7 },
      abschlussquote: { wert: 88.9, trend: 5.6 },
    },
    spartenVerteilung: [
      { name: 'Diskretionaer', value: 45, color: '#1a365d' },
      { name: 'Advisory', value: 30, color: '#2b4c7e' },
      { name: 'Family Office', value: 15, color: '#c4a35a' },
      { name: 'Stiftungen', value: 10, color: '#8b5cf6' },
    ],
    top5: [
      { name: 'Dr. Heinrich von Stein', betrag: 2500000 },
      { name: 'Familie Goldberg', betrag: 1800000 },
      { name: 'Stiftung Lichtblick', betrag: 850000 },
      { name: 'Karl-Friedrich Mueller', betrag: 420000 },
      { name: 'Elisabeth Hartwig', betrag: 230000 },
    ],
    vertraege: [
      { id: 'VV-2026-001', kundeId: 'WM00001', kunde: 'Dr. Heinrich von Stein', sparte: 'diskretionaer', produkt: 'VV Mandat Defensiv Plus', versicherer: 'HRK LUNIS', beitrag: 2500000, beitragsart: 'AuM', status: 'aktiv', datum: '2026-01-10' },
      { id: 'VV-2026-002', kundeId: 'WM00002', kunde: 'Familie Goldberg', sparte: 'advisory', produkt: 'Advisory Mandat', versicherer: 'Berenberg', beitrag: 1800000, beitragsart: 'AuM', status: 'aktiv', datum: '2026-01-25' },
      { id: 'VV-2026-003', kundeId: 'WM00003', kunde: 'Stiftung Lichtblick', sparte: 'stiftung', produkt: 'Stiftungsmandat ESG', versicherer: 'Flossbach von Storch', beitrag: 850000, beitragsart: 'AuM', status: 'aktiv', datum: '2026-02-15' },
    ],
  },
};

// Bestand Mock-Daten (aggregiert)
export const BESTAND_DATA = {
  versicherung: {
    kpiValues: {
      vertraege: { wert: 42, trend: 2.1 },
      praemienvolumen: { wert: 141863, trend: 0.9 },
      durchschnittspraemie: { wert: 3378, trend: -0.5 },
      vertragsdichte: { wert: 3.8, trend: 0.2 },
    },
  },
  banking: {
    kpiValues: {
      vertraege: { wert: 186, trend: 5.3 },
      praemienvolumen: { wert: 12450000, trend: 8.1 },
      durchschnittspraemie: { wert: 66935, trend: 2.4 },
      vertragsdichte: { wert: 2.9, trend: 0.3 },
    },
  },
  vermoegensverwaltung: {
    kpiValues: {
      vertraege: { wert: 12, trend: 8.3 },
      praemienvolumen: { wert: 30050000, trend: 4.2 },
      durchschnittspraemie: { wert: 2504167, trend: 1.8 },
      vertragsdichte: { wert: 2.4, trend: 0.5 },
    },
  },
};

// Storno Mock-Daten
export const STORNO_DATA = {
  versicherung: {
    kpiValues: {
      stornoAnzahl: { wert: 4, trend: -25.0 },
      stornoQuote: { wert: 5.0, trend: -0.3 },
      stornoVolumen: { wert: 8200, trend: -15.0 },
      fruehstorno: { wert: 1, trend: -50.0 },
    },
    gruende: [
      { name: 'Preis / zu teuer', value: 35, color: '#ef4444' },
      { name: 'Finanzielle Gruende', value: 12, color: '#f87171' },
      { name: 'Wettbewerber', value: 18, color: '#f59e0b' },
      { name: 'Leistung unzufrieden', value: 10, color: '#fb923c' },
      { name: 'Kein Bedarf mehr', value: 15, color: '#94a3b8' },
      { name: 'Sonstiges', value: 10, color: '#cbd5e1' },
    ],
  },
  banking: {
    kpiValues: {
      stornoAnzahl: { wert: 8, trend: -12.5 },
      stornoQuote: { wert: 3.2, trend: -0.4 },
      stornoVolumen: { wert: 45000, trend: -8.0 },
      fruehstorno: { wert: 2, trend: -33.3 },
    },
    gruende: [
      { name: 'Konditionen', value: 28, color: '#ef4444' },
      { name: 'Wettbewerber', value: 22, color: '#f59e0b' },
      { name: 'Umzug/Wechsel', value: 18, color: '#fb923c' },
      { name: 'Unzufriedenheit Service', value: 15, color: '#f87171' },
      { name: 'Kein Bedarf', value: 10, color: '#94a3b8' },
      { name: 'Sonstiges', value: 7, color: '#cbd5e1' },
    ],
  },
  vermoegensverwaltung: {
    kpiValues: {
      stornoAnzahl: { wert: 1, trend: -50.0 },
      stornoQuote: { wert: 2.0, trend: -1.0 },
      stornoVolumen: { wert: 420000, trend: -20.0 },
      fruehstorno: { wert: 0, trend: 0 },
    },
    gruende: [
      { name: 'Performance', value: 30, color: '#ef4444' },
      { name: 'Gebuehren', value: 25, color: '#f59e0b' },
      { name: 'Strategiewechsel', value: 20, color: '#fb923c' },
      { name: 'Liquiditaetsbedarf', value: 15, color: '#94a3b8' },
      { name: 'Sonstiges', value: 10, color: '#cbd5e1' },
    ],
  },
};

// Termine Mock
export const TERMINE = [
  { datum: '2026-03-11', zeit: '17:30', kunde: 'Amira Koenig', betreff: 'Kfz-Angebot besprechen', kundeId: 'KD00002', foto: '/images/AdobeStock_252262042.jpeg' },
  { datum: '2026-03-12', zeit: '10:30', kunde: 'Anna Hoffmann', betreff: 'Altersvorsorge-Beratung', kundeId: 'KD00004' },
  { datum: '2026-03-13', zeit: '14:00', kunde: 'Thomas Weber', betreff: 'Hausbesuch Bindungsgespraech', kundeId: 'KD00003', foto: '/images/AdobeStock_361342769.jpeg' },
  { datum: '2026-03-14', zeit: '09:00', kunde: 'Sandra Yilmaz', betreff: 'Jahresgespraech', kundeId: 'KD00008', foto: '/images/AdobeStock_612932760.jpeg' },
];

// Aufgaben Mock
export const AUFGABEN = [
  { text: 'Rueckruf Peter Schmidt (BU-Nachversicherung)', faellig: 'Heute', kundeId: 'KD00001', erledigt: false },
  { text: 'Angebot Amira Koenig nachfassen', faellig: 'Morgen', kundeId: 'KD00002', erledigt: false },
  { text: 'Storno-Warnung Klaus Wagner pruefen', faellig: 'Fr', kundeId: 'KD00003', erledigt: false },
];
