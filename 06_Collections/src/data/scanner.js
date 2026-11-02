// Dokumentenscanner (Akte scannen).
// Portiert aus partials/banken/modal-document-scanner.html und
// js/banken-scanner-crm.js (startAIRecognition, goToStep3).

export const SCANNER_SCHRITTE = [
  { id: 1, label: 'Dokument hochladen' },
  { id: 2, label: 'KI-Erkennung' },
  { id: 3, label: 'Kunde anlegen' },
];

// Werte, die die KI-Erkennung im Demo-Lauf liefert (inkl. Konfidenz).
export const ERKANNTE_FELDER = [
  { id: 'name', label: 'Name / Firma', wert: 'Schmidt Elektronik GmbH', konfidenz: 95 },
  { id: 'adresse', label: 'Adresse', wert: 'Industriestr. 45, 38112 Braunschweig', konfidenz: 88 },
  { id: 'iban', label: 'IBAN', wert: 'DE89 3704 0044 0532 0130 00', konfidenz: 92 },
  { id: 'betrag', label: 'Forderungsbetrag', wert: '€ 8.450,00', konfidenz: 97 },
  { id: 'faellig', label: 'Fälligkeitsdatum', wert: '15.10.2025', konfidenz: 90 },
];

export const DOKUMENTTYPEN = [
  { value: 'mahnung', label: 'Mahnung' },
  { value: 'rechnung', label: 'Rechnung' },
  { value: 'vertrag', label: 'Kreditvertrag' },
  { value: 'inkasso', label: 'Inkasso-Schreiben' },
  { value: 'sonstiges', label: 'Sonstiges' },
];

export const KUNDENTYPEN = [
  { value: 'privat', label: 'Privatkunde' },
  { value: 'gewerbe', label: 'Gewerbekunde' },
];

export const WAEHRUNGEN = [
  { value: 'EUR', label: 'EUR' },
  { value: 'USD', label: 'USD' },
  { value: 'CHF', label: 'CHF' },
];

export const FORDERUNGSKATEGORIEN = [
  { value: 'kredit', label: 'Kredit' },
  { value: 'dispo', label: 'Dispositionskredit' },
  { value: 'kreditkarte', label: 'Kreditkarte' },
  { value: 'sonstiges', label: 'Sonstiges' },
];

// Vorbelegung des Anlage-Formulars aus den erkannten Feldern (Legacy goToStep3).
export function formularAusErkennung() {
  const feld = id => ERKANNTE_FELDER.find(f => f.id === id)?.wert ?? '';
  const adresse = feld('adresse');
  const [strasse = '', ortTeil = ''] = adresse.split(',').map(s => s.trim());
  const plzOrt = ortTeil.match(/^(\d{5})\s+(.*)$/);
  return {
    kundentyp: 'gewerbe',
    name: feld('name'),
    strasse,
    plz: plzOrt ? plzOrt[1] : '',
    ort: plzOrt ? plzOrt[2] : ortTeil,
    telefon: '',
    email: '',
    iban: feld('iban'),
    bic: '',
    betrag: Number(feld('betrag').replace(/[€\s.]/g, '').replace(',', '.')) || 0,
    waehrung: 'EUR',
    faellig: feld('faellig'),
    kategorie: 'kredit',
    notiz: '',
  };
}
