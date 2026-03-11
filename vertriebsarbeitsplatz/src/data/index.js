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
      { name: 'Preis', value: 35 },
      { name: 'Wettbewerb', value: 25 },
      { name: 'Umzug', value: 15 },
      { name: 'Unzufriedenheit', value: 15 },
      { name: 'Sonstiges', value: 10 },
    ],
  },
};

// Termine Mock
export const TERMINE = [
  { datum: '2026-03-11', zeit: '17:30', kunde: 'Amira Koenig', betreff: 'Kfz-Angebot besprechen', kundeId: 'KD00002' },
  { datum: '2026-03-12', zeit: '10:30', kunde: 'Anna Hoffmann', betreff: 'Altersvorsorge-Beratung', kundeId: 'KD00004' },
  { datum: '2026-03-13', zeit: '14:00', kunde: 'Thomas Weber', betreff: 'Hausbesuch Bindungsgespraech', kundeId: 'KD00003' },
  { datum: '2026-03-14', zeit: '09:00', kunde: 'Sandra Yilmaz', betreff: 'Jahresgespraech', kundeId: 'KD00008' },
];

// Aufgaben Mock
export const AUFGABEN = [
  { text: 'Rueckruf Peter Schmidt (BU-Nachversicherung)', faellig: 'Heute', kundeId: 'KD00001', erledigt: false },
  { text: 'Angebot Amira Koenig nachfassen', faellig: 'Morgen', kundeId: 'KD00002', erledigt: false },
  { text: 'Storno-Warnung Klaus Wagner pruefen', faellig: 'Fr', kundeId: 'KD00003', erledigt: false },
];
