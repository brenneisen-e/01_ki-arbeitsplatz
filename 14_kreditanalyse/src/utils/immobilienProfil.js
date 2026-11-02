/**
 * immobilienProfil.js
 *
 * Baut aus einer erfassten Immobiliensicherheit ein stimmiges Demo-Objekt.
 * Aus diesem Profil werden die Demo-Unterlagen gedruckt (Energieausweis,
 * Mieterliste, Objekt-Cashflow, Verkehrswertgutachten, Grundbuchauszug).
 *
 * Das Profil ist deterministisch: dieselbe Sicherheit ergibt dasselbe
 * Objekt. Es wird beim ersten Druck an der Sicherheit gespeichert, damit
 * alle Unterlagen eines Objekts mit denselben Zahlen rechnen -- auch wenn
 * sich die Bezeichnung durch das Auslesen später ändert.
 */

// ---------------------------------------------------------------------------
// Zufall mit Startwert
// ---------------------------------------------------------------------------

function hashText(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function zufallsfolge(seed) {
  let a = seed || 1;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const runde = (wert, stellen = 0) => {
  const f = 10 ** stellen;
  return Math.round(wert * f) / f;
};
const rundeAuf = (wert, schritt) => Math.round(wert / schritt) * schritt;
const zwischen = (rnd, min, max) => min + (max - min) * rnd();
const ganzzahl = (rnd, min, max) => Math.floor(zwischen(rnd, min, max + 1));
const auswahl = (rnd, liste) => liste[Math.floor(rnd() * liste.length) % liste.length];
const mische = (rnd, liste) => {
  const kopie = [...liste];
  for (let i = kopie.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rnd() * (i + 1));
    [kopie[i], kopie[j]] = [kopie[j], kopie[i]];
  }
  return kopie;
};

const iso = (d) => {
  const j = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const t = String(d.getDate()).padStart(2, '0');
  return `${j}-${m}-${t}`;
};
const monatsende = (jahr, monat) => new Date(jahr, monat + 1, 0);

// ---------------------------------------------------------------------------
// Nutzungsarten
// ---------------------------------------------------------------------------

/**
 * rendite:   Reinertrag / Marktwert (Nettoanfangsrendite)
 * bwkQuote:  Bewirtschaftungskosten / Rohertrag
 * preisQm:   Marktwert je m² Mietfläche, falls die Fläche unbekannt ist
 * mieteQm:   Nettokaltmiete je m² und Monat, falls der Marktwert unbekannt ist
 * leerstand: typischer Flächenleerstand
 */
const NUTZUNGEN = {
  'Büro': { kategorie: 'Bürogebäude', gebaeude: 'Nichtwohngebäude', rendite: 0.052, bwkQuote: 0.16, preisQm: 3000, mieteQm: 15.8, leerstand: 0.065, einheitQm: 460, instandhaltungQm: 9.5, sonstige: 0.03, baujahr: [1992, 2012], flaeche: 3600, nutzungsdauer: 60, grundstueck: 0.5 },
  'Wohnen': { kategorie: 'Mehrfamilienhaus', gebaeude: 'Wohngebäude', rendite: 0.036, bwkQuote: 0.21, preisQm: 3400, mieteQm: 11.2, leerstand: 0.025, einheitQm: 72, instandhaltungQm: 13, sonstige: 0.02, baujahr: [1958, 1998], flaeche: 1850, nutzungsdauer: 80, grundstueck: 0.6 },
  'Wohn- und Geschäftshaus': { kategorie: 'Wohn- und Geschäftshaus', gebaeude: 'Wohngebäude', rendite: 0.046, bwkQuote: 0.19, preisQm: 2500, mieteQm: 12.4, leerstand: 0.045, einheitQm: 95, instandhaltungQm: 12, sonstige: 0.02, baujahr: [1955, 1975], flaeche: 2400, nutzungsdauer: 80, grundstueck: 0.35 },
  'Einzelhandel': { kategorie: 'Handelsimmobilie', gebaeude: 'Nichtwohngebäude', rendite: 0.056, bwkQuote: 0.14, preisQm: 2600, mieteQm: 16.5, leerstand: 0.05, einheitQm: 280, instandhaltungQm: 8, sonstige: 0.02, baujahr: [1985, 2010], flaeche: 1600, nutzungsdauer: 40, grundstueck: 1.2 },
  'Logistik': { kategorie: 'Lager- und Logistikgebäude', gebaeude: 'Nichtwohngebäude', rendite: 0.052, bwkQuote: 0.11, preisQm: 1150, mieteQm: 6.4, leerstand: 0, einheitQm: 2800, instandhaltungQm: 4.5, sonstige: 0.015, baujahr: [2005, 2019], flaeche: 6400, nutzungsdauer: 40, grundstueck: 1.7 },
  'Produktion': { kategorie: 'Produktionsgebäude', gebaeude: 'Nichtwohngebäude', rendite: 0.068, bwkQuote: 0.13, preisQm: 1400, mieteQm: 7.2, leerstand: 0, einheitQm: 0, instandhaltungQm: 5, sonstige: 0.01, baujahr: [1990, 2015], flaeche: 4200, nutzungsdauer: 40, grundstueck: 1.9, eigennutzung: 1 },
  'Gewerbe': { kategorie: 'Werkstatt- und Bürogebäude', gebaeude: 'Nichtwohngebäude', rendite: 0.062, bwkQuote: 0.14, preisQm: 1300, mieteQm: 7.9, leerstand: 0, einheitQm: 0, instandhaltungQm: 6, sonstige: 0.01, baujahr: [1980, 2000], flaeche: 1400, nutzungsdauer: 50, grundstueck: 1.5, eigennutzung: 0.85 },
  'Gastronomie': { kategorie: 'Gaststätte mit Wohnungen', gebaeude: 'Nichtwohngebäude', rendite: 0.065, bwkQuote: 0.16, preisQm: 1800, mieteQm: 11.5, leerstand: 0, einheitQm: 0, instandhaltungQm: 11, sonstige: 0, baujahr: [1880, 1910], flaeche: 520, nutzungsdauer: 80, grundstueck: 0.8, eigennutzung: 0.6 },
};

export const NUTZUNGSARTEN = Object.keys(NUTZUNGEN);

function erkenneNutzung(item, company) {
  const t = (item.bezeichnung || '').toLowerCase();
  const branche = (company?.branche || '').toLowerCase();
  if (/wohnimmobilie/i.test(item.art || '') || /mehrfamilien|wohnanlage|wohnhaus|wohnungen/.test(t)) return 'Wohnen';
  if (/gasthaus|gaststätte|hotel|restaurant|gastro/.test(t)) return 'Gastronomie';
  if (/logistik|lager|halle|umschlag/.test(t)) return 'Logistik';
  if (/produktion|werk\b|fertigung|fabrik/.test(t)) return 'Produktion';
  if (/betrieb|werkstatt|firmensitz/.test(t)) {
    return /handwerk/.test(branche) ? 'Gewerbe' : 'Produktion';
  }
  if (/einzelhandel|laden|fachmarkt|retail/.test(t)) return 'Einzelhandel';
  if (/geschäftshaus|stadtmitte|innenstadt|bestandsobjekt/.test(t)) return 'Wohn- und Geschäftshaus';
  if (/büro|office|gewerbeobjekt|verwaltung|hafen/.test(t)) return 'Büro';
  if (/immobilien/.test(branche)) return 'Büro';
  if (/commerce|handel|logistik|transport/.test(branche)) return 'Logistik';
  if (/gastronomie|hotel/.test(branche)) return 'Gastronomie';
  if (/handwerk/.test(branche)) return 'Gewerbe';
  if (/maschinenbau|medizintechnik|produktion|industrie/.test(branche)) return 'Produktion';
  if (/it-|software|dienstleist|beratung/.test(branche)) return 'Büro';
  return 'Wohn- und Geschäftshaus';
}

/** Anteil der Fläche, den der Kreditnehmer selbst nutzt. */
function eigennutzerAnteil(nutzung, company) {
  const branche = (company?.branche || '').toLowerCase();
  if (/immobilien/.test(branche)) return 0;
  if (nutzung === 'Logistik' && /logistik|transport|commerce|handel/.test(branche)) return 0.7;
  return NUTZUNGEN[nutzung].eigennutzung || 0;
}

// ---------------------------------------------------------------------------
// Lage
// ---------------------------------------------------------------------------

/**
 * Adressen je Stadt. `art` trennt Innenstadt- von Gewerbelagen, `stichwort`
 * ordnet eine Bezeichnung wie "Medienhafen" oder "Stadtmitte" einer Adresse zu.
 */
const STADT_ADRESSEN = {
  'Düsseldorf': [
    { strasse: 'Speditionstraße 15', plz: '40221', land: 'NW', art: 'innen', stichwort: /hafen|medien/i },
    { strasse: 'Graf-Adolf-Straße 41', plz: '40210', land: 'NW', art: 'innen', stichwort: /stadtmitte|innenstadt|zentrum/i },
    { strasse: 'Heerdter Lohweg 89', plz: '40549', land: 'NW', art: 'gewerbe' },
  ],
  'Berlin': [
    { strasse: 'Chausseestraße 86', plz: '10115', land: 'BE', art: 'innen' },
    { strasse: 'Lahnstraße 34', plz: '12055', land: 'BE', art: 'gewerbe' },
    { strasse: 'Ringbahnstraße 12', plz: '12099', land: 'BE', art: 'gewerbe' },
  ],
  'Frankfurt am Main': [
    { strasse: 'Mainzer Landstraße 211', plz: '60326', land: 'HE', art: 'innen' },
    { strasse: 'Hanauer Landstraße 204', plz: '60314', land: 'HE', art: 'gewerbe' },
  ],
  'Hamburg': [
    { strasse: 'Große Elbstraße 145', plz: '22767', land: 'HH', art: 'innen' },
    { strasse: 'Billstraße 83', plz: '20539', land: 'HH', art: 'gewerbe' },
  ],
  'München': [
    { strasse: 'Landsberger Straße 302', plz: '80687', land: 'BY', art: 'innen' },
    { strasse: 'Lerchenauer Straße 210', plz: '80935', land: 'BY', art: 'gewerbe' },
  ],
  'Stuttgart': [
    { strasse: 'Hauptstätter Straße 67', plz: '70178', land: 'BW', art: 'innen' },
    { strasse: 'Heilbronner Straße 150', plz: '70191', land: 'BW', art: 'gewerbe' },
  ],
  'Regensburg': [
    { strasse: 'Maximilianstraße 21', plz: '93047', land: 'BY', art: 'innen' },
    { strasse: 'Im Gewerbepark A 15', plz: '93059', land: 'BY', art: 'gewerbe' },
  ],
  'Köln': [
    { strasse: 'Hansaring 97', plz: '50670', land: 'NW', art: 'innen' },
    { strasse: 'Frankfurter Straße 720', plz: '51145', land: 'NW', art: 'gewerbe' },
  ],
};

const GEWERBELAGE = ['Logistik', 'Produktion', 'Gewerbe'];

const LAND_NACH_PLZ = [
  [/^(4|5[0-3]|57|58|59)/, 'NW'], [/^(8|9)/, 'BY'], [/^(7)/, 'BW'], [/^(2[0-2])/, 'HH'],
  [/^(1[0-4])/, 'BE'], [/^(6[0-5]|3[4-6])/, 'HE'],
];

const STRASSEN_MUSTER =
  /([A-ZÄÖÜ][A-Za-zÄÖÜäöüß.-]*(?:straße|strasse|str\.|weg|allee|platz|ring|gasse|damm|ufer|kai|chaussee)\s+\d{1,4}[a-z]?)/;
const ADRESS_MUSTER = /\b([A-ZÄÖÜ][a-zäöüß]{3,}\s+\d{1,4}[a-z]?)\s*,/;

function findeStadt(text) {
  for (const stadt of Object.keys(STADT_ADRESSEN)) {
    if (text.includes(stadt.split(' ')[0])) return stadt;
  }
  return null;
}

function ermittleLage(item, company, nutzung, rnd, vermeide) {
  const text = item.bezeichnung || '';
  const firmenAdresse = company?.adresse || {};
  const stadt = findeStadt(text) || firmenAdresse.ort || 'Frankfurt am Main';
  const pool = STADT_ADRESSEN[stadt] || [];
  const landVon = (plz) => LAND_NACH_PLZ.find(([re]) => re.test(plz || ''))?.[1] || 'HE';

  const strasse = (text.match(STRASSEN_MUSTER) || text.match(ADRESS_MUSTER) || [])[1];
  if (strasse) {
    const ausPool = pool.find((p) => p.strasse === strasse);
    const plz = ausPool?.plz || (firmenAdresse.ort === stadt ? firmenAdresse.plz : pool[0]?.plz) || '00000';
    return { strasse, plz, ort: stadt, land: ausPool?.land || landVon(plz) };
  }

  // Selbst genutzte Objekte liegen am Firmensitz, sofern die Bezeichnung
  // dorthin zeigt (Betriebsgelände, Logistikzentrum am Sitz) -- ein Neubau
  // oder ein frisch angelegtes Objekt ohne Bezeichnung nicht.
  const eigen = eigennutzerAnteil(nutzung, company) > 0 && text.trim() !== '' && !/neubau/i.test(text);
  if ((eigen || /betrieb|firmensitz|hauptsitz/i.test(text)) && firmenAdresse.ort === stadt && firmenAdresse.strasse) {
    return { strasse: firmenAdresse.strasse, plz: firmenAdresse.plz, ort: stadt, land: landVon(firmenAdresse.plz) };
  }
  const frei = pool.filter((p) => !vermeide.includes(p.strasse));
  const passendeArt = frei.filter((p) => p.art === (GEWERBELAGE.includes(nutzung) ? 'gewerbe' : 'innen'));
  const eintrag = pool.find((p) => p.stichwort?.test(text)) || passendeArt[0] || frei[0];
  if (eintrag) return { strasse: eintrag.strasse, plz: eintrag.plz, ort: stadt, land: eintrag.land };
  return { strasse: `Hauptstraße ${ganzzahl(rnd, 3, 120)}`, plz: firmenAdresse.plz || '60311', ort: stadt, land: landVon(firmenAdresse.plz) };
}

// ---------------------------------------------------------------------------
// Mieter
// ---------------------------------------------------------------------------

const MIETER = {
  'Büro': [
    'Brandt & Kollegen Rechtsanwälte PartG mbB', 'Nordlicht Consulting GmbH', 'Hafenblick Medien GmbH',
    'Rheinbogen Software GmbH', 'Steuerkanzlei Seidel & Partner', 'Weitblick Architekten GmbH',
    'Kranich Personalberatung GmbH', 'Datenkai Analytics GmbH', 'Praxisgemeinschaft Dr. Albers',
    'Werftblick Coworking GmbH', 'Lotsenhaus Versicherungsmakler GmbH', 'Quaivier Projektentwicklung GmbH',
  ],
  'Laden': ['Bäckerei Wiesner', 'Apotheke am Stadtgraben', 'Optik Brandt', 'Café Kranz', 'Blumen Kramer', 'Feinkost Moretti'],
  'Lager': ['Hanse Kontraktlogistik GmbH', 'Nordkai Spedition GmbH & Co. KG', 'Elbfracht Fulfillment GmbH', 'Spreekai Distribution GmbH'],
  'Gewerbe': ['Ingenieurbüro Haller', 'Malerbetrieb Kunz GmbH', 'Steuerbüro Wendt'],
};

const GESCHOSSE = ['EG', '1. OG', '2. OG', '3. OG', '4. OG', '5. OG', '6. OG', '7. OG'];
const POSITION = ['li.', 're.', 'Mitte', 'hinten'];

/** Lage einer Wohnung: vier je Geschoss, große Anlagen in mehreren Häusern (A, B, …). */
const wohnlage = (i, { erstesGeschoss = 0, jeHaus = 16, haeuser = false } = {}) => {
  const imHaus = i % jeHaus;
  const geschoss = GESCHOSSE[Math.min(GESCHOSSE.length - 1, erstesGeschoss + Math.floor(imHaus / 4))];
  const haus = haeuser ? `${String.fromCharCode(65 + Math.floor(i / jeHaus))} · ` : '';
  return `${haus}${geschoss} ${POSITION[imHaus % 4]}`;
};

/** Teilt eine Fläche in n Einheiten mit zufälligen, aber ähnlichen Größen. */
function teileFlaeche(gesamt, anzahl, rnd) {
  if (anzahl <= 0 || gesamt <= 0) return [];
  const gewichte = Array.from({ length: anzahl }, () => zwischen(rnd, 0.7, 1.3));
  const summe = gewichte.reduce((a, b) => a + b, 0);
  const teile = gewichte.map((g) => Math.max(1, Math.round((gesamt * g) / summe)));
  teile[teile.length - 1] += gesamt - teile.reduce((a, b) => a + b, 0);
  return teile;
}

function mietende(rnd, stichtag, minJahre, maxJahre) {
  const jahre = ganzzahl(rnd, minJahre, maxJahre);
  const monat = ganzzahl(rnd, 0, 11);
  return iso(monatsende(stichtag.getFullYear() + jahre, monat));
}

function baueEinheiten({ nutzung, flaeche, leerFlaeche, eigenAnteil, company, rnd, stichtag }) {
  const einheiten = [];
  const neu = (e) => einheiten.push({ nr: `ME ${String(einheiten.length + 1).padStart(2, '0')}`, ...e });
  let rest = flaeche - leerFlaeche;

  if (eigenAnteil > 0) {
    const eigen = eigenAnteil >= 1 ? rest : Math.round(rest * eigenAnteil);
    neu({
      mieter: `${company?.firma || 'Kreditnehmer'} (Eigennutzung)`,
      nutzung: { Gastronomie: 'Gastronomie', Logistik: 'Lager', Produktion: 'Produktion' }[nutzung] || 'Gewerbe',
      lage: nutzung === 'Logistik' ? 'Halle 1' : 'EG', flaeche: eigen, faktor: 1, mietende: '', hinweis: 'kalkulatorische Miete', typ: 'eigen',
    });
    rest -= eigen;
  }

  const kommerziell = (anzahl, art, namen, lageFn, faktor, [minJ, maxJ]) => {
    const pool = mische(rnd, namen);
    teileFlaeche(rest, anzahl, rnd).forEach((f, i) => {
      neu({
        mieter: pool[i % pool.length],
        nutzung: art, lage: lageFn(i), flaeche: f, faktor: faktor * zwischen(rnd, 0.92, 1.08),
        mietende: mietende(rnd, stichtag, minJ, maxJ), hinweis: auswahl(rnd, ['indexiert', 'Staffelmiete', 'Option 5 J.', 'indexiert']), typ: 'gewerbe',
      });
    });
    rest = 0;
  };
  const wohnungen = (anzahl, lageFn) => {
    teileFlaeche(rest, anzahl, rnd).forEach((f, i) => {
      neu({ mieter: `Mietpartei WE ${String(i + 1).padStart(2, '0')}`, nutzung: 'Wohnung', lage: lageFn(i), flaeche: f, faktor: zwischen(rnd, 0.95, 1.05), mietende: 'unbefristet', hinweis: 'anonymisiert', typ: 'wohnen' });
    });
    rest = 0;
  };

  if (rest > 0) {
    if (nutzung === 'Büro') {
      const n = Math.min(11, Math.max(3, Math.round(rest / 460)));
      kommerziell(n, 'Büro', MIETER['Büro'], (i) => GESCHOSSE[Math.min(5, Math.floor(i / 2))], 1, [1, 9]);
    } else if (nutzung === 'Wohnen') {
      const n = Math.min(40, Math.max(4, Math.round(rest / 72)));
      wohnungen(n, (i) => wohnlage(i, { haeuser: n > 16 }));
    } else if (nutzung === 'Wohn- und Geschäftshaus') {
      const laeden = Math.round(rest * 0.16);
      const bueros = Math.round(rest * 0.22);
      const wohnflaeche = rest - laeden - bueros;
      rest = laeden;
      kommerziell(2, 'Laden', MIETER.Laden, () => 'EG', 1.7, [2, 8]);
      rest = bueros;
      kommerziell(2, 'Büro', MIETER['Büro'], () => '1. OG', 1, [1, 6]);
      rest = wohnflaeche;
      wohnungen(Math.min(24, Math.max(4, Math.round(wohnflaeche / 78))), (i) => wohnlage(i, { erstesGeschoss: 2, jeHaus: 24 }));
    } else if (nutzung === 'Einzelhandel') {
      kommerziell(Math.min(6, Math.max(3, Math.round(rest / 280))), 'Laden', MIETER.Laden, () => 'EG', 1, [2, 10]);
    } else if (nutzung === 'Logistik') {
      kommerziell(Math.min(3, Math.max(1, Math.round(rest / 2800))), 'Lager', MIETER.Lager, (i) => `Halle ${i + (eigenAnteil > 0 ? 2 : 1)}`, 1, [3, 10]);
    } else if (nutzung === 'Gastronomie') {
      wohnungen(Math.max(1, Math.round(rest / 70)), (i) => `${GESCHOSSE[1 + Math.floor(i / 2)]} ${['li.', 're.'][i % 2]}`);
    } else if (nutzung === 'Gewerbe') {
      kommerziell(1, 'Büro', MIETER.Gewerbe, () => '1. OG', 1.2, [2, 6]);
    }
  }

  if (leerFlaeche > 0) {
    const art = nutzung === 'Wohnen' ? 'Wohnung' : nutzung === 'Einzelhandel' ? 'Laden' : 'Büro';
    const lage = nutzung === 'Wohnen' ? 'DG' : nutzung === 'Wohn- und Geschäftshaus' ? '1. OG' : GESCHOSSE[Math.min(5, Math.ceil(einheiten.length / 2))];
    neu({ mieter: 'Leerstand', nutzung: art, lage, flaeche: leerFlaeche, faktor: 0, mietende: '', hinweis: 'in Vermarktung', typ: 'leer' });
  }
  return einheiten;
}

// ---------------------------------------------------------------------------
// Energie
// ---------------------------------------------------------------------------

const KLASSEN_GRENZEN = [
  ['A+', 30], ['A', 50], ['B', 75], ['C', 100], ['D', 130], ['E', 160], ['F', 200], ['G', 250], ['H', Infinity],
];

/** Effizienzklasse nach der Skala des GEG (Endenergie in kWh/(m²·a)). */
export function klasseAusKennwert(kennwert) {
  if (kennwert == null || kennwert === '' || Number.isNaN(Number(kennwert))) return '';
  return KLASSEN_GRENZEN.find(([, grenze]) => Number(kennwert) < grenze)[0];
}

export const ENERGIE_KLASSEN = KLASSEN_GRENZEN.map(([k]) => k);

function energiekennwert(baujahr, rnd) {
  if (baujahr >= 2020) return zwischen(rnd, 38, 58);
  if (baujahr >= 2010) return zwischen(rnd, 60, 85);
  if (baujahr >= 2002) return zwischen(rnd, 88, 118);
  if (baujahr >= 1978) return zwischen(rnd, 112, 155);
  if (baujahr >= 1950) return zwischen(rnd, 138, 178);
  return zwischen(rnd, 190, 240);
}

// ---------------------------------------------------------------------------
// Hauptfunktion
// ---------------------------------------------------------------------------

function objektname(item, kategorie, lage) {
  const b = (item.bezeichnung || '')
    .replace(/^(grundschuld|hypothek)\s+(auf|am)\s+/i, '')
    .replace(/,?\s*\d{1,3}(?:\.\d{3})*\s*m(?:²|2)(?!\w)/, '')
    .trim();
  return b || `${kategorie} ${lage.strasse}, ${lage.ort}`;
}

function vorrangGlaeubiger(company, item, ort) {
  const verbindlichkeiten = company?.bestehende_verbindlichkeiten || [];
  const stichworte = (item.bezeichnung || '')
    .toLowerCase()
    .split(/[\s,()-]+/)
    .filter((w) => w.length > 4);
  const mitGrundschuld = verbindlichkeiten.filter((v) => /grundschuld/i.test(v.sicherheit || ''));
  const passend = mitGrundschuld.find((v) =>
    stichworte.some((w) => (v.sicherheit || '').toLowerCase().includes(w))
  );
  const name = (passend || mitGrundschuld[0])?.glaeubiger || `Sparkasse ${ort}`;
  return name;
}

/**
 * @param {object} item     erfasste Immobiliensicherheit
 * @param {object} company  Kreditnehmer
 * @param {object} [optionen]
 * @param {string[]} [optionen.vermeideAdressen]  Straßen anderer Objekte des Vorgangs
 * @returns {object}        Objektprofil für die Demo-Unterlagen
 */
export function erstelleObjektprofil(item, company, { vermeideAdressen = [] } = {}) {
  const heute = new Date();
  const rnd = zufallsfolge(hashText(`${company?.id || ''}|${item.bezeichnung || item.id}|${item.art}`));
  const nutzung = erkenneNutzung(item, company);
  const n = NUTZUNGEN[nutzung];
  const lage = ermittleLage(item, company, nutzung, rnd, vermeideAdressen);
  const name = objektname(item, n.kategorie, lage);

  // Fläche und Leerstand
  const flaecheText = (item.bezeichnung || '').match(/(\d{1,3}(?:\.\d{3})+|\d+)\s*m(?:²|2)/);
  const wertBekannt = Number(item.wert) > 0;
  // Ein neu angelegtes Objekt bekommt einen Wert in der Größenordnung des
  // beantragten Kredits, damit die Demo-Unterlagen zum Vorgang passen.
  const basisWert = wertBekannt
    ? Number(item.wert)
    : rundeAuf(Math.min(25e6, Math.max(4e5, (company?.kredit?.betrag || 1e6) * zwischen(rnd, 1.3, 1.6))), 10000);
  const flaeche = flaecheText
    ? parseInt(flaecheText[1].replace(/\./g, ''), 10)
    : rundeAuf(basisWert / n.preisQm, 10);
  const eigenAnteil = eigennutzerAnteil(nutzung, company);
  const leerQuote = eigenAnteil > 0 ? 0 : n.leerstand * zwischen(rnd, 0.85, 1.15);
  const leerFlaeche = Math.round(flaeche * leerQuote);

  const stichtag = monatsende(heute.getFullYear(), heute.getMonth() - 1);
  const baujahr = /neubau/i.test(item.bezeichnung || '')
    ? heute.getFullYear() - 1
    : ganzzahl(rnd, n.baujahr[0], n.baujahr[1]);

  // Mieter und Mieten
  const einheiten = baueEinheiten({ nutzung, flaeche, leerFlaeche, eigenAnteil, company, rnd, stichtag });
  const vermietet = einheiten.filter((e) => e.typ !== 'leer');
  const zielMietePa = (basisWert * n.rendite) / (1 - n.bwkQuote) / (1 + n.sonstige);
  const gewichtSumme = vermietet.reduce((s, e) => s + e.flaeche * e.faktor, 0) || 1;
  einheiten.forEach((e) => {
    e.mieteMtl = e.typ === 'leer' ? 0 : rundeAuf(((zielMietePa / 12) * e.flaeche * e.faktor) / gewichtSumme, 10);
    delete e.faktor;
  });
  const mieteSollPa = vermietet.reduce((s, e) => s + e.mieteMtl * 12, 0);
  const vermieteteFlaeche = vermietet.reduce((s, e) => s + e.flaeche, 0);
  const befristet = vermietet.filter((e) => /^\d{4}-/.test(e.mietende));
  const befristetMiete = befristet.reduce((s, e) => s + e.mieteMtl, 0);
  const walt = befristetMiete > 0
    ? runde(befristet.reduce((s, e) => s + e.mieteMtl * ((new Date(e.mietende) - stichtag) / (365.25 * 864e5)), 0) / befristetMiete, 1)
    : null;

  // Objekt-Cashflow (Ist Vorjahr und Vorvorjahr)
  const jahr = heute.getFullYear() - 1;
  const mietertraege = rundeAuf(mieteSollPa * zwischen(rnd, 0.984, 0.996), 100);
  const sonstige = rundeAuf(mietertraege * n.sonstige, 100);
  const rohertrag = mietertraege + sonstige;
  const wohnungen = einheiten.filter((e) => e.typ === 'wohnen');
  const wohnMietePa = wohnungen.reduce((s, e) => s + e.mieteMtl * 12, 0);
  const kosten = [
    ['Nicht umlagefähige Betriebskosten', rundeAuf(rohertrag * 0.022, 100)],
    ['Instandhaltung', rundeAuf(flaeche * n.instandhaltungQm, 100)],
    // Wohnungen: Verwaltung je Einheit, Gewerbe: Anteil am Rohertrag
    ['Verwaltungskosten', rundeAuf(wohnungen.length * 320 + Math.max(0, rohertrag - wohnMietePa) * 0.02, 100)],
    ['Forderungsausfälle und Mietrückstände', rundeAuf(mietertraege * 0.006, 100)],
  ];
  const bewirtschaftung = kosten.reduce((s, [, v]) => s + v, 0);
  const reinertrag = rohertrag - bewirtschaftung;
  const vj = zwischen(rnd, 0.968, 0.982);
  const cashflow = {
    jahr,
    zeilen: [
      { label: 'Mieterträge (Nettokaltmiete)', ist: mietertraege, vj: rundeAuf(mietertraege * vj, 100) },
      { label: 'Sonstige Erträge (Stellplätze, Werbeflächen)', ist: sonstige, vj: rundeAuf(sonstige * vj, 100) },
      { label: 'Rohertrag', ist: rohertrag, vj: rundeAuf(mietertraege * vj, 100) + rundeAuf(sonstige * vj, 100), fett: true, linie: true },
      ...kosten.map(([label, v]) => ({ label, ist: -v, vj: -rundeAuf(v * (vj + 0.01), 100) })),
    ],
    mietertraege,
    sonstige,
    rohertrag,
    bewirtschaftung,
    reinertrag,
  };
  const vjKosten = cashflow.zeilen.slice(3).reduce((s, z) => s + z.vj, 0);
  cashflow.zeilen.push({ label: 'Summe Bewirtschaftungskosten', ist: -bewirtschaftung, vj: vjKosten, fett: true, linie: true });
  cashflow.zeilen.push({ label: 'Jährlicher Cashflow (Reinertrag vor Kapitaldienst)', ist: reinertrag, vj: cashflow.zeilen[2].vj + vjKosten, fett: true, linie: true });

  const verkehrswert = wertBekannt ? Number(item.wert) : rundeAuf(reinertrag / n.rendite, 10000);

  // Energieausweis
  const kennwert = runde(energiekennwert(baujahr, rnd), 1);
  const traeger = baujahr >= 2015
    ? 'Wärmepumpe (Strom)'
    : ['Büro', 'Wohn- und Geschäftshaus'].includes(nutzung) && ['Düsseldorf', 'Hamburg', 'München', 'Frankfurt am Main', 'Berlin', 'Köln'].includes(lage.ort)
      ? 'Fernwärme'
      : 'Erdgas';
  const primaerFaktor = { 'Wärmepumpe (Strom)': 0.62, Fernwärme: 0.72, Erdgas: 1.1 }[traeger];
  const co2Faktor = { 'Wärmepumpe (Strom)': 0.11, Fernwärme: 0.19, Erdgas: 0.24 }[traeger];
  // Neubauten brauchen einen Bedarfsausweis, bei Bestandsbauten ist beides üblich.
  const bedarf = baujahr >= heute.getFullYear() - 5 || (baujahr >= 2002 || n.gebaeude === 'Nichtwohngebäude' ? rnd() < 0.8 : rnd() < 0.35);
  const ausgestellt = baujahr < 1950
    ? new Date(2016, 2, ganzzahl(rnd, 3, 24))
    : baujahr >= heute.getFullYear() - 1
      ? new Date(baujahr, 10, ganzzahl(rnd, 3, 25))
      : new Date(ganzzahl(rnd, 2019, 2025), ganzzahl(rnd, 0, 11), ganzzahl(rnd, 2, 26));
  const gueltigBis = new Date(ausgestellt.getFullYear() + 10, ausgestellt.getMonth(), ausgestellt.getDate() - 1);
  const energie = {
    gebaeude: n.gebaeude,
    ausweisart: bedarf ? 'Bedarfsausweis' : 'Verbrauchsausweis',
    kennwert,
    primaer: runde(kennwert * primaerFaktor, 1),
    co2: runde(kennwert * co2Faktor, 1),
    klasse: klasseAusKennwert(kennwert),
    traeger,
    flaecheLabel: n.gebaeude === 'Wohngebäude' ? 'Gebäudenutzfläche (AN)' : 'Nettogrundfläche',
    flaeche: Math.round(flaeche * (n.gebaeude === 'Wohngebäude' ? 1.18 : 1.06)),
    wohnungen: einheiten.filter((e) => e.nutzung === 'Wohnung').length,
    ausgestellt: iso(ausgestellt),
    gueltigBis: iso(gueltigBis),
    registriernummer: `${lage.land}-${ausgestellt.getFullYear()}-${String(ganzzahl(rnd, 1000000, 9999999)).padStart(9, '0')}`,
    baujahrWaerme: Math.max(baujahr, ganzzahl(rnd, 2008, 2022)),
    aussteller: auswahl(rnd, ['Dipl.-Ing. (FH) Petra Kühn, Energieberatung Kühn', 'Dipl.-Ing. Markus Reiter, Ingenieurbüro Reiter', 'M. Eng. Sandra Ohm, Gebäudeenergie Ohm']),
  };

  // Gutachten
  const verfahren = /ertragswert/i.test(item.bewertung || '')
    ? 'Ertragswertverfahren'
    : /sachwert|baukosten/i.test(item.bewertung || '')
      ? 'Sachwertverfahren'
      : /vergleichswert/i.test(item.bewertung || '')
        ? 'Vergleichswertverfahren'
        : eigenAnteil >= 0.8
          ? 'Sachwertverfahren'
          : 'Ertragswertverfahren';
  const stichtagGutachten = item.datum || iso(new Date(heute.getFullYear(), heute.getMonth() - 3, 1));
  const grundstuecksflaeche = rundeAuf(flaeche * n.grundstueck, 10);
  const gutachten = {
    aktenzeichen: `WG-${stichtagGutachten.slice(0, 4)}-${String(ganzzahl(rnd, 100, 9999)).padStart(4, '0')}`,
    stichtag: stichtagGutachten,
    verfahren,
    verkehrswert,
    liegenschaftszins: runde(Math.round((reinertrag / verkehrswert) * 400) / 4, 2),
    restnutzungsdauer: Math.max(15, Math.min(n.nutzungsdauer, n.nutzungsdauer - (heute.getFullYear() - baujahr))),
    grundstuecksflaeche,
    bodenwert: rundeAuf(verkehrswert * zwischen(rnd, 0.18, 0.28), 10000),
    gutachter: auswahl(rnd, ['Dipl.-Ing. Jonas Albrecht', 'Dipl.-Kffr. Miriam Falk', 'Dipl.-Ing. Henrik Brandes']),
  };

  // Grundbuch
  const vorlasten = Number(item.vorlasten) || 0;
  const anzahlVorrang = vorlasten > 0 ? Math.max(1, (Number(item.rang) || 2) - 1) : 0;
  const glaeubiger = vorrangGlaeubiger(company, item, lage.ort);
  const abt3 = Array.from({ length: anzahlVorrang }, (_, i) => {
    const betrag = i === anzahlVorrang - 1
      ? vorlasten - rundeAuf(vorlasten / anzahlVorrang, 1000) * (anzahlVorrang - 1)
      : rundeAuf(vorlasten / anzahlVorrang, 1000);
    return { nr: i + 1, betrag, glaeubiger: i === 0 ? glaeubiger : `Sparkasse ${lage.ort}` };
  });
  const grundbuch = {
    amtsgericht: lage.ort,
    gemarkung: lage.ort.split(' ')[0],
    blatt: ganzzahl(rnd, 10000, 29999),
    flur: ganzzahl(rnd, 1, 40),
    flurstueck: `${ganzzahl(rnd, 100, 899)}/${ganzzahl(rnd, 1, 12)}`,
    groesse: grundstuecksflaeche,
    eigentuemer: `${company?.firma || 'Eigentümer'}, ${company?.adresse?.ort || lage.ort}`,
    abt3,
    summe: abt3.reduce((s, e) => s + e.betrag, 0),
  };

  return {
    version: 1,
    name,
    nutzung,
    kategorie: n.kategorie,
    lage,
    adresseText: `${lage.strasse}, ${lage.plz} ${lage.ort}`,
    eigentuemer: company?.firma || 'Eigentümer',
    verwalter: nutzung === 'Wohnen' || nutzung === 'Wohn- und Geschäftshaus' ? 'Hausverwaltung Keller & Söhne GmbH' : 'Asset Management des Eigentümers',
    baujahr,
    flaeche,
    stichtag: iso(stichtag),
    einheiten,
    mieteSollPa,
    vermieteteFlaeche,
    leerFlaeche,
    leerstandsquote: flaeche > 0 ? runde((leerFlaeche / flaeche) * 100, 1) : 0,
    walt,
    cashflow,
    energie,
    gutachten,
    grundbuch,
  };
}
