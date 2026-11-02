// ═══════════════════════════════════════════════════════════════
// Vertrag zu einem Live-Eingang
// Aus einem Ereignis des Live-Stroms (liveDaten.jsx) wird der Vertrag dazu
// gebildet: Kunde, Tarifdaten, Beginn, Zahlweise, Leistung und Bearbeitungsstand.
// Alles leitet sich fest aus der Kennung des Ereignisses ab — derselbe Eingang
// zeigt also bei jedem Öffnen denselben Vertrag, und Beitrag, Neugeschäft und
// Provision sind genau die Werte des Live-Stroms.
// ═══════════════════════════════════════════════════════════════
import { FIRST_NAMES, LAST_NAMES, PRODUKTE, mulberry32 } from './cockpitData';
import { datum, euro, uhrzeit } from './format';

function saat(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

const SPARTE_KUERZEL = { Leben: 'L', Kranken: 'K', Kfz: 'F', Schaden: 'S' };

const ZAHLWEISEN = [
  { name: 'monatlich', teiler: 12, gewicht: 0.6 },
  { name: 'vierteljährlich', teiler: 4, gewicht: 0.15 },
  { name: 'jährlich', teiler: 1, gewicht: 0.25 },
];

const STORNO_GRUENDE = [
  'Widerruf innerhalb der Frist',
  'Kündigung zum Ablauf',
  'Beitragsrückstand',
  'Wechsel zu einem Wettbewerber',
  'Wegfall des Risikos',
];

/** Altersspanne der Versicherungsnehmer je Produkt. */
const ALTER = {
  'BU-Versicherung': [24, 45], 'BU-Nachversicherung': [28, 48], 'Risikoleben': [27, 50],
  'Rentenversicherung': [25, 55], 'Fondspolice': [25, 55], 'Kfz-Komfort': [20, 72],
  'Haftpflicht': [20, 75], 'Wohngebäude': [30, 70], 'Zahnzusatz': [20, 65], 'Kranken-Zusatz': [20, 65],
};

function leistung(e, rand, alter) {
  const r100 = (v) => Math.round(v / 100) * 100;
  switch (e.produkt) {
    case 'BU-Versicherung':
    case 'BU-Nachversicherung':
      return { label: 'BU-Rente', wert: `${euro(r100(500 + e.beitrag * 0.9))} mtl.` };
    case 'Risikoleben':
      return { label: 'Todesfallsumme', wert: euro(Math.round((e.beitrag * 400) / 10000) * 10000) };
    case 'Rentenversicherung':
    case 'Fondspolice':
      return { label: 'Rentenbeginn', wert: `mit 67 (in ${67 - alter} Jahren)` };
    case 'Kfz-Komfort':
      return { label: 'Deckung', wert: rand() < 0.6 ? 'Vollkasko, SB 300 €' : 'Teilkasko, SB 150 €' };
    case 'Haftpflicht':
      return { label: 'Deckungssumme', wert: '50 Mio. € pauschal' };
    case 'Wohngebäude':
      return { label: 'Versicherungswert', wert: 'gleitender Neuwert' };
    case 'Zahnzusatz':
      return { label: 'Erstattung', wert: 'Zahnersatz bis 90 %' };
    default:
      return { label: 'Leistung', wert: 'ambulante Zusatzleistungen' };
  }
}

function laufzeit(e, alter) {
  if (e.sparte === 'Leben') return `bis Alter 67 (${67 - alter} Jahre)`;
  if (e.sparte === 'Kranken') return 'unbefristet';
  return '1 Jahr, verlängert sich jährlich';
}

export function vertragAus(e) {
  const rand = mulberry32(saat(e.id));
  const vorname = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)];
  const nachname = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)];
  const [von, bis] = ALTER[e.produkt] || [25, 60];
  const alter = von + Math.floor(rand() * (bis - von + 1));
  const geburt = new Date(e.zeit.getFullYear() - alter, Math.floor(rand() * 12), 1 + Math.floor(rand() * 28));

  let r = rand();
  const zahlweise = ZAHLWEISEN.find(z => (r -= z.gewicht) <= 0) || ZAHLWEISEN[0];
  const beginn = new Date(e.zeit.getFullYear(), e.zeit.getMonth() + 1, 1);
  const p = PRODUKTE.find(x => x.produkt === e.produkt);
  const nr = String(saat(`${e.id}-nr`) % 10000000).padStart(7, '0');
  const storno = e.art === 'storno';
  const min = (n) => new Date(e.zeit.getTime() + n * 60000);

  // Bearbeitungsstand: frische Live-Eingänge stehen in der Policierung,
  // ältere des Tages sind durch.
  const alterMin = (Date.now() - e.zeit.getTime()) / 60000;
  const durch = !e.live || alterMin > 3;
  const verlauf = storno
    ? [
      { titel: 'Kündigung eingegangen', zeit: uhrzeit(e.zeit), fertig: true },
      { titel: 'Vermittler zur Rückholung informiert', zeit: uhrzeit(min(1)), fertig: true },
      { titel: 'Provision storniert', zeit: durch ? uhrzeit(min(2)) : 'läuft', fertig: durch },
    ]
    : [
      { titel: 'Antrag eingegangen', zeit: uhrzeit(e.zeit), fertig: true },
      { titel: 'Automatische Antragsprüfung', zeit: uhrzeit(min(0.3)), fertig: true },
      { titel: 'Policierung', zeit: durch ? uhrzeit(min(2)) : 'läuft', fertig: durch },
      { titel: 'Dokumente an den Kunden', zeit: durch ? uhrzeit(min(2.5)) : 'folgt', fertig: durch },
    ];

  return {
    vertragsNr: `ZV-${SPARTE_KUERZEL[e.sparte] || 'X'}-${e.zeit.getFullYear()}-${nr}`,
    antragNr: e.antragNr,
    status: storno ? 'Storniert' : durch ? 'Policiert' : 'In Policierung',
    kunde: `${vorname} ${nachname}`,
    geburtsdatum: datum(geburt),
    alter,
    region: e.vermittler.bundesland,
    beginn: datum(beginn),
    zahlweise: zahlweise.name,
    zahlbeitrag: Math.round(e.beitrag / zahlweise.teiler * 100) / 100,
    laufzeit: laufzeit(e, alter),
    leistung: leistung(e, rand, alter),
    faktor: p?.faktor ?? null,
    stornoGrund: storno ? STORNO_GRUENDE[Math.floor(rand() * STORNO_GRUENDE.length)] : null,
    verlauf,
  };
}
