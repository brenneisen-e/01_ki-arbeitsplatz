// Ableitung der Stammdatenfelder aus einer Kundenakte.
// Das Legacy-Tool (updateStammdatenFields) hat Handelsregister, USt-ID,
// Gruendungsjahr, Mitarbeiterzahl und Umsatz per Math.random() erzeugt — die
// Werte sprangen dadurch bei jedem Oeffnen. Hier werden sie deterministisch aus
// der Kundennummer abgeleitet, sehen also gleich aus, bleiben aber stabil.

function hash(text) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
}

// '-', '–' und Leerstrings sind im Legacy-Datenmodell Platzhalter fuer
// „nicht erfasst" und duerfen nicht in zusammengesetzte Werte einfliessen.
const LEER = new Set(['', '-', '–', 'Unbekannt']);
function wert(v) {
  const t = String(v ?? '').trim();
  return LEER.has(t) ? null : t;
}

function stadt(adresse) {
  const teil = String(adresse || '').split(',')[1];
  return teil ? teil.trim().replace(/^\d{5}\s*/, '') : 'Deutschland';
}

export function buildStammdaten(customer) {
  const privat = customer.type === 'Privat';
  const h = hash(customer.id || customer.name || '');

  const name = wert(customer.name) || '–';
  const telefon = wert(customer.telefon);
  const email = wert(customer.email);
  const adresse = wert(customer.adresse);
  const branche = wert(customer.branche);
  const ansprechpartner = wert(customer.ansprechpartner);

  const domain = email?.includes('@') ? email.split('@')[1] : null;
  const [strasse, plzOrt] = adresse
    ? adresse.split(',').map(x => x.trim())
    : [null, null];

  const kuerzel = (ansprechpartner || '')
    .split(/\s+/).filter(Boolean).map(w => w[0].toLowerCase()).join('.');

  return {
    privat,
    unternehmen: [
      { label: privat ? 'Name' : 'Firmenname', wert: name },
      { label: 'Rechtsform', wert: wert(customer.rechtsform) || (privat ? 'Privatperson' : '–') },
      { label: 'Handelsregister', wert: privat ? '–' : `HRB ${10000 + (h % 89999)}${adresse ? ` ${stadt(adresse)}` : ''}` },
      { label: 'USt-ID', wert: privat ? '–' : `DE${100000000 + (h % 899999999)}` },
      { label: 'Branche', wert: branche || 'Nicht erfasst' },
      { label: 'Gründungsjahr', wert: privat ? '–' : String(2000 + (h % 20)) },
      { label: 'Mitarbeiter', wert: privat ? '–' : `${1 + (h % 50)} (Stand: 2024)` },
      { label: 'Jahresumsatz', wert: privat ? '–' : `${(0.5 + (h % 50) / 10).toFixed(1).replace('.', ',')} Mio EUR (2023)` },
      { label: 'Kundentyp', wert: privat ? 'Privatkunde' : 'Gewerbekunde', badge: true },
      { label: 'Kunde seit', wert: customer.kundeSeit || '01.01.2020 (5 Jahre)' },
      { label: 'Kundenbetreuer', wert: 'Eike Brenneisen' },
    ],
    kontakt: [
      { label: 'Adresse', wert: [strasse, plzOrt].filter(Boolean).join('\n') || '–' },
      { label: 'Telefon Zentrale', wert: telefon || '–' },
      { label: 'Telefon Mobil', wert: wert(customer.telefonMobil) || `+49 170 ${1000000 + (h % 8999999)}` },
      { label: 'E-Mail', wert: email || '–' },
      {
        label: 'Website',
        wert: privat ? '–' : `www.${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.de`,
      },
    ],
    leitung: {
      titel: privat ? 'Ansprechpartner' : 'Geschäftsführung',
      zeilen: [
        { label: 'Name', wert: ansprechpartner || (privat ? name : '–') },
        { label: 'Direktwahl', wert: telefon ? `${telefon}-10` : '–' },
        { label: 'E-Mail', wert: domain ? `${kuerzel || 'kontakt'}@${domain}` : '–' },
      ],
    },
    buchhaltung: {
      titel: privat ? 'Weitere Kontaktdaten' : 'Ansprechpartner Buchhaltung',
      zeilen: [
        { label: 'Name', wert: privat ? name : `Buchhaltung ${name.split(/[\s,]+/)[0]}` },
        { label: 'Direktwahl', wert: telefon ? `${telefon}-20` : '–' },
        { label: 'E-Mail', wert: privat ? (email || '–') : (domain ? `buchhaltung@${domain}` : '–') },
      ],
    },
    bank: [
      { label: 'IBAN', wert: `DE${10 + (h % 79)} 3704 0044 ${String(1000 + (h % 8999))} ${String(1000 + ((h >> 4) % 8999))} 00`, mono: true },
      { label: 'BIC', wert: 'NOLADE2HXXX', mono: true },
      { label: 'Kreditinstitut', wert: 'Braunschweiger Sparkasse' },
      {
        label: 'SEPA-Mandat',
        wert: customer.rueckgabequote > 0 && customer.status !== 'Bezahlt'
          ? 'Widerrufen (01.11.2025)'
          : 'Aktiv',
        warnung: customer.rueckgabequote > 0 && customer.status !== 'Bezahlt',
      },
    ],
  };
}

export const SCHNELLAKTIONEN = [
  { id: 'lastschriftsperre', label: 'Lastschriftsperre', meldung: 'Lastschriftsperre gesetzt. Weitere Einzüge werden abgelehnt.' },
  { id: 'mahnung', label: 'Mahnung versenden', meldung: 'Mahnung wurde in die Versandwarteschlange gestellt.' },
  { id: 'ratenzahlung', label: 'Ratenzahlung', meldung: 'Ratenzahlungsvereinbarung wird zur Prüfung vorbereitet.' },
  { id: 'anruf', label: 'Anruf planen', meldung: 'Anruf für morgen 10:00 Uhr terminiert.' },
  { id: 'inkasso', label: 'Inkasso einleiten', meldung: 'Inkasso-Übergabe angestoßen — Freigabe durch Teamleitung erforderlich.', ton: 'warning' },
  { id: 'kuendigung', label: 'Kündigung', meldung: 'Kündigungsentwurf erstellt und der Rechtsabteilung vorgelegt.', ton: 'warning' },
];

// Kommunikationshistorie der Referenzakte (Legacy: Tab „Kommunikation").
export const KOMMUNIKATION_REFERENZ = [
  {
    id: 'mahnung3', art: 'ausgehend', titel: 'Letzte Mahnung', datum: '15.11.2025, 09:30',
    betreff: 'Letzte Zahlungsaufforderung – Vertrag BMK-2018-0456789',
    text: 'Sehr geehrter Herr Mueller,\n\ntrotz mehrfacher Aufforderung ist die ausstehende Forderung in Höhe von 7.500,00 EUR nicht beglichen worden.\n\nWir fordern Sie hiermit letztmalig auf, den offenen Betrag bis zum 25.11.2025 zu begleichen.\n\nSollte die Zahlung nicht fristgerecht eingehen, sehen wir uns gezwungen, den Fall an ein Inkassounternehmen zu übergeben.',
    status: 'Zugestellt', kanal: 'Per Post',
  },
  {
    id: 'anruf', art: 'verpasst', titel: 'Anrufversuch', datum: '10.11.2025, 14:15',
    text: '3 Anrufversuche – Kunde nicht erreichbar.\n\nNotiz: Mailbox aktiv, keine Rückrufoption. Nächster Versuch morgen vormittags geplant.',
    status: 'Nicht erreicht', kanal: 'Bearbeiter: E. Brenneisen',
  },
  {
    id: 'mahnung2', art: 'ausgehend', titel: '2. Mahnung', datum: '01.11.2025, 08:00',
    betreff: 'Zweite Zahlungserinnerung – Vertrag BMK-2018-0456789',
    text: 'Sehr geehrter Herr Mueller,\n\nleider haben wir bis heute keinen Zahlungseingang für die fällige Rate feststellen können.\n\nWir bitten Sie, den offenen Betrag von 5.000,00 EUR umgehend zu überweisen.',
    status: 'Zugestellt', kanal: 'Per E-Mail und Post',
  },
  {
    id: 'kundenmail', art: 'eingehend', titel: 'E-Mail vom Kunden', datum: '20.10.2025, 16:42',
    betreff: 'Re: Zahlungserinnerung',
    text: 'Sehr geehrte Damen und Herren,\n\naufgrund von Liquiditätsengpässen ist es uns derzeit nicht möglich, die volle Rate zu begleichen.\n\nWir bitten um Ratenzahlung und werden ab dem 15.11. wieder regulär zahlen können.',
    status: 'Eingegangen', kanal: 'Von: h.mueller@mueller-gmbh.de',
  },
  {
    id: 'mahnung1', art: 'ausgehend', titel: '1. Mahnung', datum: '15.10.2025, 08:00',
    betreff: 'Zahlungserinnerung – Vertrag BMK-2018-0456789',
    text: 'Sehr geehrter Herr Mueller,\n\nbei der Überprüfung unserer Konten haben wir festgestellt, dass die am 01.10.2025 fällige Rate in Höhe von 2.500,00 EUR noch nicht eingegangen ist.',
    status: 'Zugestellt', kanal: 'Automatisch versendet',
  },
];

