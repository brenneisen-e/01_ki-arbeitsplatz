/**
 * objektunterlagenParser.js
 *
 * Liest die Objektunterlagen einer Immobiliensicherheit aus:
 *   1. leseUnterlage     Datei -> Seiten mit Zeilen und Zellen
 *                        (PDF über pdf.js, Excel, CSV, Word)
 *   2. erkenneTyp        Energieausweis, Mieterliste, Objekt-Cashflow,
 *                        Verkehrswertgutachten oder Grundbuchauszug
 *   3. extrahiereWerte   Werte je Feld mit Fundstelle (Seite, Zeile)
 *   4. fuehreZusammen    Werte aller Unterlagen nach Vorrang in die Felder
 *   5. pruefeObjekt      Plausibilisierung über die Unterlagen hinweg
 *
 * Die Regeln sind bewusst tolerant formuliert (Synonyme, deutsche und
 * englische Zahlformate), damit auch Unterlagen aus anderen Systemen
 * gelesen werden. Findet sich ein Wert nicht, bleibt das Feld leer -- es
 * wird nichts erfunden.
 */

import { unzipSync, strFromU8 } from 'fflate';
import { extractPdfLayout } from './pdfTextExtract';
import { klasseAusKennwert } from './immobilienProfil';
import { OBJEKT_FELDER } from '../data/objektunterlagen';

// ---------------------------------------------------------------------------
// 1. Lesen
// ---------------------------------------------------------------------------

const endung = (name) => (String(name || '').toLowerCase().match(/\.([a-z0-9]+)$/) || [])[1] || '';

/** Zeile aus Zelltexten; x-Werte geben die Spalte an (für Tabellen). */
const zeileAus = (texte) => {
  const zellen = texte
    .map((t, i) => ({ text: String(t ?? '').replace(/\s+/g, ' ').trim(), x0: i * 100, x1: i * 100 + 90 }))
    .filter((z) => z.text !== '');
  return { zellen, text: zellen.map((z) => z.text).join('\t') };
};

function dekodiereText(bytes) {
  const utf8 = new TextDecoder('utf-8').decode(bytes);
  if (!utf8.includes('\uFFFD')) return utf8;
  try {
    return new TextDecoder('windows-1252').decode(bytes);
  } catch {
    return utf8;
  }
}

function leseCsv(bytes) {
  const text = dekodiereText(new Uint8Array(bytes)).replace(/^\uFEFF/, '');
  const roh = text.split(/\r?\n/).filter((z) => z.trim() !== '');
  const probe = roh.slice(0, 15);
  const trenner = [';', '\t', ','].reduce((best, t) => {
    const anzahl = probe.reduce((s, z) => s + (z.split(t).length - 1), 0);
    return anzahl > best.anzahl ? { t, anzahl } : best;
  }, { t: ';', anzahl: -1 }).t;
  const spalte = (zeile) => {
    const zellen = [];
    let aktuell = '';
    let inAnf = false;
    for (let i = 0; i < zeile.length; i += 1) {
      const ch = zeile[i];
      if (ch === '"') {
        if (inAnf && zeile[i + 1] === '"') { aktuell += '"'; i += 1; } else inAnf = !inAnf;
      } else if (ch === trenner && !inAnf) {
        zellen.push(aktuell);
        aktuell = '';
      } else {
        aktuell += ch;
      }
    }
    zellen.push(aktuell);
    return zellen;
  };
  return { format: 'csv', seiten: [{ nr: 1, zeilen: roh.map((z) => zeileAus(spalte(z))) }] };
}

const XML_ENTITAETEN = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
const xmlText = (s) =>
  String(s || '')
    .replace(/<[^>]+>/g, '')
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e) => {
      if (e[0] === '#') return String.fromCodePoint(e[1] === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
      return XML_ENTITAETEN[e] ?? m;
    });

// Ohne Tausenderpunkt unter 10.000, damit Jahreszahlen (2009) lesbar bleiben
const zahlDeutsch = (n) =>
  new Intl.NumberFormat('de-DE', { maximumFractionDigits: 4, useGrouping: Math.abs(n) >= 10000 }).format(n);

function spaltenIndex(ref) {
  const buchstaben = (ref.match(/^[A-Z]+/) || ['A'])[0];
  return [...buchstaben].reduce((s, ch) => s * 26 + ch.charCodeAt(0) - 64, 0) - 1;
}

function leseXlsx(bytes) {
  const dateien = unzipSync(new Uint8Array(bytes));
  const lies = (pfad) => (dateien[pfad] ? strFromU8(dateien[pfad]) : '');
  const geteilt = [...lies('xl/sharedStrings.xml').matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) =>
    [...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => xmlText(t[1])).join('')
  );
  const blaetter = Object.keys(dateien)
    .filter((p) => /^xl\/worksheets\/sheet\d+\.xml$/.test(p))
    .sort((a, b) => parseInt(a.match(/\d+/)[0], 10) - parseInt(b.match(/\d+/)[0], 10));
  const seiten = blaetter.map((pfad, i) => {
    const zeilen = [...lies(pfad).matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)].map((row) => {
      const texte = [];
      for (const c of row[1].matchAll(/<c\s([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
        const attr = c[1];
        const inhalt = c[2] || '';
        const ref = (attr.match(/r="([A-Z]+\d+)"/) || [])[1] || 'A1';
        const typ = (attr.match(/t="([a-zA-Z]+)"/) || [])[1];
        const v = (inhalt.match(/<v>([\s\S]*?)<\/v>/) || [])[1];
        let text = '';
        if (typ === 's') text = geteilt[parseInt(v, 10)] ?? '';
        else if (typ === 'inlineStr') text = xmlText((inhalt.match(/<is>([\s\S]*?)<\/is>/) || [])[1]);
        else if (typ === 'str' || typ === 'b') text = xmlText(v);
        else if (v != null && v !== '') text = Number.isFinite(Number(v)) ? zahlDeutsch(Number(v)) : xmlText(v);
        texte[spaltenIndex(ref)] = text;
      }
      return zeileAus(Array.from(texte, (t) => t ?? ''));
    }).filter((z) => z.zellen.length > 0);
    return { nr: i + 1, zeilen };
  });
  return { format: 'xlsx', seiten };
}

function leseDocx(bytes) {
  const dateien = unzipSync(new Uint8Array(bytes));
  const xml = dateien['word/document.xml'] ? strFromU8(dateien['word/document.xml']) : '';
  const absatzZellen = (p) => xmlText(p.replace(/<w:tab\/>/g, '\u0001').replace(/<w:br\/>/g, ' ')).split('\u0001');
  const zeilen = [];
  for (const teil of xml.split(/(<w:tbl>[\s\S]*?<\/w:tbl>)/)) {
    if (teil.startsWith('<w:tbl>')) {
      for (const tr of teil.matchAll(/<w:tr[\s>][\s\S]*?<\/w:tr>/g)) {
        const zellen = [...tr[0].matchAll(/<w:tc>([\s\S]*?)<\/w:tc>/g)].map((tc) =>
          [...tc[1].matchAll(/<w:p[\s>][\s\S]*?<\/w:p>/g)].map((p) => absatzZellen(p[0]).join(' ')).join(' ')
        );
        zeilen.push(zeileAus(zellen));
      }
    } else {
      for (const p of teil.matchAll(/<w:p[\s>][\s\S]*?<\/w:p>/g)) zeilen.push(zeileAus(absatzZellen(p[0])));
    }
  }
  return { format: 'docx', seiten: [{ nr: 1, zeilen: zeilen.filter((z) => z.zellen.length > 0) }] };
}

/**
 * Liest eine Unterlage. `datei` ist ein Objekt { name, bytes, type }.
 * @returns {Promise<{ format, seiten, lesbar }>}
 */
export async function leseUnterlage(datei) {
  const art = endung(datei.name);
  let dok;
  if (datei.type === 'application/pdf' || art === 'pdf') {
    const layout = await extractPdfLayout(datei.bytes);
    dok = { format: 'pdf', seiten: layout.seiten };
  } else if (['xlsx', 'xlsm'].includes(art)) {
    dok = leseXlsx(datei.bytes);
  } else if (['csv', 'txt'].includes(art)) {
    dok = leseCsv(datei.bytes);
  } else if (art === 'docx') {
    dok = leseDocx(datei.bytes);
  } else {
    return { format: art || 'unbekannt', seiten: [], lesbar: false, grund: 'Dateiformat wird nicht ausgelesen (PDF, Excel, CSV oder Word).' };
  }
  const zeichen = dok.seiten.reduce((s, seite) => s + seite.zeilen.reduce((t, z) => t + z.text.length, 0), 0);
  return {
    ...dok,
    lesbar: zeichen >= 20,
    grund: zeichen >= 20 ? null : 'Keine Textebene gefunden – eingescannte Unterlagen bitte als durchsuchbares PDF hochladen.',
  };
}

// ---------------------------------------------------------------------------
// 2. Typ erkennen
// ---------------------------------------------------------------------------

const MERKMALE = {
  energieausweis: {
    titel: /energieausweis|energiepass|energy performance/i,
    datei: /energie.?(ausweis|pass)|epc/i,
    inhalt: [/gebäudeenergiegesetz|\bGEG\b|\bEnEV\b/i, /endenergie(bedarf|verbrauch)/i, /primärenergie/i, /registriernummer/i, /energieeffizienzklasse/i],
  },
  mieterliste: {
    titel: /mieterliste|rent\s*roll|mieteraufstellung|mietaufstellung|mieterspiegel/i,
    datei: /mieter.?(liste|spiegel)|rent.?roll|mietaufstellung/i,
    inhalt: [/mietende|vertragsende|laufzeitende/i, /leerstand/i, /miete\s*(mtl|monatl|p\.?\s?a)/i, /mieteinheit/i, /\bwalt\b/i],
  },
  cashflow: {
    titel: /cash-?\s?flow|bewirtschaftungsrechnung|objektrechnung|ertragsrechnung|operating statement/i,
    datei: /cash.?flow|bewirtschaftung|objektrechnung|\bnoi\b/i,
    inhalt: [/bewirtschaftungskosten/i, /reinertrag|net operating income|\bnoi\b/i, /instandhaltung/i, /mieterträge|mieteinnahmen/i, /cash-?\s?flow/i],
  },
  gutachten: {
    titel: /(verkehrs|markt|beleihungs)wert|wertgutachten|wertermittlung|valuation/i,
    datei: /gutachten|wertermittlung|valuation/i,
    inhalt: [/verkehrswert|marktwert/i, /wertermittlungs/i, /immowertv|§\s*194\s*baugb|belwertv/i, /liegenschaftszins/i, /bodenwert/i, /(ertrags|sach|vergleichs)wertverfahren/i],
  },
  grundbuch: {
    titel: /grundbuch/i,
    datei: /grundbuch/i,
    inhalt: [/abteilung|abt\.\s*i{1,3}\b/i, /bestandsverzeichnis/i, /flurstück|gemarkung/i, /grundschuld|hypothek/i, /amtsgericht/i],
  },
};

/** Liefert den Typ der Unterlage oder null, wenn nichts eindeutig passt. */
export function erkenneTyp(dok, name = '') {
  const zeilen = dok.seiten.flatMap((s) => s.zeilen.map((z) => z.text));
  const kopfText = zeilen.slice(0, 3).join(' ');
  const text = zeilen.join('\n');
  let bester = { typ: null, punkte: 0 };
  for (const [typ, m] of Object.entries(MERKMALE)) {
    let punkte = 0;
    if (m.titel.test(kopfText)) punkte += 6;
    if (m.datei.test(name)) punkte += 3;
    punkte += m.inhalt.filter((re) => re.test(text)).length * 2;
    if (punkte > bester.punkte) bester = { typ, punkte };
  }
  return bester.punkte >= 5 ? bester.typ : null;
}

// ---------------------------------------------------------------------------
// 3. Werte lesen
// ---------------------------------------------------------------------------

const ZAHL = /[-−]?\d{1,3}(?:\.\d{3})+(?:,\d+)?|[-−]?\d{1,3}(?:,\d{3})+(?:\.\d+)?|[-−]?\d+(?:[.,]\d+)?/g;

/** "1.234,56" / "1234,5" / "1234.5" -> Zahl */
export function parseZahl(token) {
  const t = String(token).replace(/−/g, '-').replace(/\s/g, '');
  if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(t)) return Number(t.replace(/\./g, '').replace(',', '.'));
  if (/^-?\d+,\d+$/.test(t)) return Number(t.replace(',', '.'));
  if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t);
  if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(t)) return Number(t.replace(/,/g, ''));
  return null;
}

const ohneDatum = (text) => String(text).replace(/\b\d{1,2}\.\d{1,2}\.\d{2,4}\b/g, ' ');

function zahlen(text) {
  const t = ohneDatum(text);
  return [...t.matchAll(ZAHL)].map((m) => {
    const nach = t.slice(m.index + m[0].length, m.index + m[0].length + 6);
    return { wert: parseZahl(m[0]), token: m[0], waehrung: /^\s*(€|eur)/i.test(nach), prozent: /^\s*%/.test(nach) };
  }).filter((z) => z.wert != null);
}

const zahlAus = (text) => zahlen(text).find((z) => !z.prozent)?.wert ?? null;

/** Geldbetrag: bevorzugt mit Währungszeichen, sonst eine Zahl mit Trennzeichen oder ab 1.000. */
export function betragAus(text) {
  const kandidaten = zahlen(text).filter((z) => !z.prozent);
  const mitWaehrung = kandidaten.find((z) => z.waehrung);
  if (mitWaehrung) return mitWaehrung.wert;
  const gross = kandidaten.find((z) => !/^(19|20)\d{2}$/.test(z.token) && (/[.,]/.test(z.token) || Math.abs(z.wert) >= 1000));
  return gross ? gross.wert : null;
}

/** Prozentwert als Zahl in Prozent (6,5 % -> 6.5, 0,065 -> 6.5). */
function prozentAus(text) {
  const liste = zahlen(text);
  const mitZeichen = liste.find((z) => z.prozent);
  if (mitZeichen) return mitZeichen.wert;
  const ohne = liste[0];
  if (!ohne) return null;
  if (ohne.wert > 0 && ohne.wert < 1) return Math.round(ohne.wert * 1000) / 10;
  return ohne.wert <= 100 ? ohne.wert : null;
}

function datumAus(text) {
  const t = String(text);
  const de = t.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (de) return `${de[3]}-${de[2].padStart(2, '0')}-${de[1].padStart(2, '0')}`;
  const isoMatch = t.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return isoMatch[0];
  // Excel-Seriennummer (z. B. 47.092 in einer Datumsspalte)
  const n = parseZahl(t.trim().split('\t')[0]);
  if (n && n > 20000 && n < 80000 && Number.isInteger(n)) {
    return new Date(Date.UTC(1899, 11, 30) + n * 864e5).toISOString().slice(0, 10);
  }
  return null;
}

const jahrAus = (text) => {
  const m = String(text).match(/\b(1[6-9]\d{2}|20\d{2})\b/);
  return m ? Number(m[1]) : null;
};

// Die Klasse muss direkt hinter dem Label stehen ("Energieeffizienzklasse: E")
const klasseAus = (text) => {
  const m = String(text).match(/^[\s:]*(A\+|[A-H])(?=$|[\s,.;)])/);
  return m ? m[1] : null;
};

const textAus = (text) => {
  const t = String(text).split('\t').map((s) => s.trim()).filter(Boolean)[0] || '';
  return t.replace(/^[:\s]+/, '').trim() || null;
};

function nutzungAus(text) {
  const t = String(text).toLowerCase();
  if (/wohn-?\s*und\s*geschäfts|wohn-\/geschäfts|gemischt/.test(t)) return 'Wohn- und Geschäftshaus';
  if (/gast|hotel|restaurant/.test(t)) return 'Gastronomie';
  if (/werkstatt|gewerbe|handwerk/.test(t)) return 'Gewerbe';
  if (/mehrfamilien|wohngebäude|wohnhaus|wohnanlage|wohnen/.test(t)) return 'Wohnen';
  if (/büro|verwaltung|office/.test(t)) return 'Büro';
  if (/handel|laden|retail|fachmarkt/.test(t)) return 'Einzelhandel';
  if (/logistik|lager/.test(t)) return 'Logistik';
  if (/produktion|fertigung|industrie/.test(t)) return 'Produktion';
  return null;
}

const alleZeilen = (dok) => dok.seiten.flatMap((s) => s.zeilen.map((z, i) => ({ ...z, seite: s.nr, index: i })));
const rohText = (z) => z.zellen.map((c) => c.text).join('   ');

/**
 * Sucht das erste Label (in Vorrangfolge) in einer Zelle und liest den Wert
 * aus dem Rest der Zelle und den folgenden Zellen derselben Zeile.
 */
function finde(zeilen, labels, parser, { pruefe } = {}) {
  for (const label of labels) {
    for (const z of zeilen) {
      for (let c = 0; c < z.zellen.length; c += 1) {
        const m = z.zellen[c].text.match(label);
        if (!m) continue;
        // Folgt der Wert in eigener Zelle, gehört der Rest der Labelzelle
        // noch zum Label ("Leerstandsquote (Fläche)", "… / Gebäudekategorie").
        const restZelle = z.zellen[c].text.slice(m.index + m[0].length);
        const folgende = z.zellen.slice(c + 1).map((x) => x.text);
        const rest = [folgende.length && !/[:\d]/.test(restZelle) ? '' : restZelle, ...folgende]
          .join('\t')
          .replace(/^[\s:]+/, '');
        const wert = parser(rest, z);
        if (wert == null || wert === '' || (pruefe && !pruefe(wert))) continue;
        return { wert, stellen: [{ seite: z.seite, zeile: z.index }], roh: rohText(z) };
      }
    }
  }
  return null;
}

const MIT = (fund, zusatz) => (fund ? { ...fund, ...zusatz } : null);

function bezeichnungAus(kategorie, adresse) {
  if (!adresse?.wert) return null;
  const ohnePlz = adresse.wert.replace(/,?\s*\d{5}\s*/, ', ').replace(/,\s*,/g, ',').replace(/,\s*$/, '');
  return { ...adresse, wert: kategorie ? `${kategorie} ${ohnePlz}` : ohnePlz };
}

function leseEnergieausweis(zeilen) {
  const f = {};
  f.ausweisGueltigBis = finde(zeilen, [/gültig\s+bis/i, /gueltig\s+bis/i], datumAus);
  const kategorie = finde(zeilen, [/hauptnutzung|gebäudekategorie/i, /gebäudetyp|gebäudeart/i], textAus);
  f.nutzung = kategorie ? MIT(kategorie, { wert: nutzungAus(kategorie.wert) }) : null;
  if (f.nutzung && !f.nutzung.wert) f.nutzung = null;
  f.bezeichnung = bezeichnungAus(kategorie?.wert, finde(zeilen, [/^adresse\b|gebäudeadresse|adresse des gebäudes/i], textAus));
  f.baujahr = finde(zeilen, [/baujahr\s+gebäude/i, /baujahr(?!\s+wärme)/i], jahrAus);
  f.flaeche = finde(zeilen, [/gebäudenutzfläche|nettogrundfläche/i, /wohnfläche|nutzfläche/i], zahlAus, { pruefe: (w) => w > 20 });
  f.energiekennwert = finde(zeilen, [/endenergie(bedarf|verbrauch)/i, /endenergie/i], zahlAus, { pruefe: (w) => w > 0 && w < 1000 });
  f.energieklasse = finde(zeilen, [/energieeffizienzklasse|effizienzklasse/i], klasseAus);
  if (!f.energieklasse && f.energiekennwert) {
    f.energieklasse = MIT(f.energiekennwert, {
      wert: klasseAusKennwert(f.energiekennwert.wert),
      hinweis: 'Der Ausweis nennt keine Klasse (Nichtwohngebäude). Abgeleitet aus dem Endenergiekennwert auf der Skala des GEG.',
    });
  }
  return f;
}

// Spalten einer Mieterliste; die Reihenfolge entscheidet bei Mehrdeutigkeit
const SPALTEN_MUSTER = [
  ['mieteMtl', /miete.*(mtl|monat)|monatsmiete|(mtl|monatl)\.?\s*miete|nkm.*mtl/i],
  ['mietePa', /miete.*(p\.?\s?a|jahr|jährl)|jahresmiete|jahresnettokaltmiete/i],
  ['flaeche', /fläche|flaeche|\bm²|\bm2\b|\bqm\b|area|sqm/i],
  ['mietende', /mietende|vertragsende|laufzeit|ende|befristet|lease\s*end|expiry/i],
  ['mieter', /mieter\b|mietpartei|nutzer|tenant|^name/i],
  ['nutzung', /nutzung|nutzungsart|^art$|^typ|use/i],
  ['mieteMtl', /^(netto)?kaltmiete|^miete\b|^nkm|rent/i],
];

function kopfSpalten(zeile) {
  const spalten = [];
  zeile.zellen.forEach((zelle) => {
    const treffer = SPALTEN_MUSTER.find(([key, re]) => re.test(zelle.text) && !spalten.some((s) => s.key === key));
    if (treffer) spalten.push({ key: treffer[0], x0: zelle.x0, x1: zelle.x1 });
  });
  return spalten;
}

function ordneZelle(zelle, spalten) {
  let beste = null;
  let besteUeberlappung = 0;
  for (const s of spalten) {
    const ueberlappung = Math.min(zelle.x1, s.x1 + 4) - Math.max(zelle.x0, s.x0 - 4);
    if (ueberlappung > besteUeberlappung) {
      beste = s;
      besteUeberlappung = ueberlappung;
    }
  }
  return beste?.key ?? null;
}

function leseMieterliste(zeilen) {
  const f = {};
  const stichtag = finde(zeilen, [/stichtag/i], datumAus)?.wert || new Date().toISOString().slice(0, 10);

  // Tabelle: Kopfzeile mit Fläche und Miete, dann Zeilen bis zur Summe
  const kopfIndex = zeilen.findIndex((z) => {
    const keys = kopfSpalten(z).map((s) => s.key);
    return keys.includes('flaeche') && (keys.includes('mieteMtl') || keys.includes('mietePa')) && keys.length >= 3;
  });
  const einheiten = [];
  if (kopfIndex >= 0) {
    const spalten = kopfSpalten(zeilen[kopfIndex]);
    const kopfText = zeilen[kopfIndex].text;
    for (let i = kopfIndex + 1; i < zeilen.length; i += 1) {
      const z = zeilen[i];
      if (z.text === kopfText) continue; // wiederholter Tabellenkopf auf Folgeseiten
      if (/^(summe|gesamt|total)\b/i.test(z.zellen[0]?.text || '') || /\tsumme\b|\tgesamt\b/i.test(`\t${z.text}`)) break;
      const werte = {};
      z.zellen.forEach((zelle) => {
        const key = ordneZelle(zelle, spalten);
        if (key && werte[key] == null) werte[key] = zelle.text;
      });
      const flaeche = werte.flaeche != null ? zahlAus(werte.flaeche) : null;
      if (!flaeche || flaeche <= 0) continue;
      const mtl = werte.mieteMtl != null ? zahlAus(werte.mieteMtl) : null;
      const pa = werte.mietePa != null ? zahlAus(werte.mietePa) : null;
      const mietePa = pa ?? (mtl != null ? mtl * 12 : 0);
      const leer = /leerstand|\bleer\b|\bfrei\b|unvermietet|vacant/i.test(werte.mieter || z.text) || mietePa === 0;
      einheiten.push({ zeile: z, flaeche, mietePa, leer, ende: werte.mietende ? datumAus(werte.mietende) : null });
    }
  }

  const tabelle = einheiten.length > 0;
  const berechnet = (wert, auswahl, hinweis) => ({
    wert,
    stellen: auswahl.map((e) => ({ seite: e.zeile.seite, zeile: e.zeile.index })),
    roh: auswahl.slice(0, 3).map((e) => rohText(e.zeile)).join('\n'),
    hinweis,
  });

  const summe = (liste, key) => liste.reduce((s, e) => s + e[key], 0);
  const vermietet = einheiten.filter((e) => !e.leer);
  const leerstand = einheiten.filter((e) => e.leer);
  const t = tabelle
    ? {
        flaeche: summe(einheiten, 'flaeche'),
        vermietet: summe(vermietet, 'flaeche'),
        leer: summe(leerstand, 'flaeche'),
        miete: summe(vermietet, 'mietePa'),
      }
    : null;

  // Summenzeilen der Unterlage haben Vorrang, die Tabelle prüft gegen
  const angaben = {
    flaeche: finde(zeilen, [/gesamt(miet)?fläche|mietfläche\s+gesamt/i], zahlAus),
    vermieteteFlaeche: finde(zeilen, [/vermietete\s+fläche/i], zahlAus),
    leerstandFlaeche: finde(zeilen, [/leerstandsfläche|leerstehende\s+fläche/i], zahlAus),
    leerstandsquote: finde(zeilen, [/leerstandsquote|leerstandsrate|vacancy/i], prozentAus),
    einheiten: finde(zeilen, [/anzahl\s+(der\s+)?mieteinheiten|mieteinheiten\s+gesamt|anzahl\s+einheiten/i], zahlAus),
    mietertraege: finde(zeilen, [/jahresnettokaltmiete|sollmiete\s+p\.?\s?a|jahresmiete|summe\s+miete\s+p\.?\s?a/i], betragAus),
    walt: finde(zeilen, [/\bwalt\b|gewichtete\s+restlaufzeit/i], zahlAus),
  };

  const n = einheiten.length;
  f.flaeche = angaben.flaeche || (tabelle ? berechnet(t.flaeche, einheiten, `Summe der Flächen aus ${n} Mieteinheiten`) : null);
  f.vermieteteFlaeche = angaben.vermieteteFlaeche || (tabelle ? berechnet(t.vermietet, vermietet, `Summe der ${vermietet.length} vermieteten Einheiten`) : null);
  f.leerstandFlaeche = angaben.leerstandFlaeche || (tabelle ? berechnet(t.leer, leerstand.length ? leerstand : einheiten, leerstand.length ? `Summe der ${leerstand.length} leeren Einheiten` : 'Keine leeren Einheiten in der Mieterliste') : null);
  f.leerstandsquote = angaben.leerstandsquote || (tabelle && t.flaeche > 0
    ? berechnet(Math.round((t.leer / t.flaeche) * 1000) / 10, leerstand.length ? leerstand : einheiten, 'Leerstandsfläche geteilt durch Gesamtfläche')
    : null);
  f.einheiten = angaben.einheiten || (tabelle ? berechnet(n, einheiten, `${n} Zeilen der Mieterliste`) : null);
  f.mietertraege = angaben.mietertraege || (tabelle ? berechnet(t.miete, vermietet, 'Summe der Jahresmieten der vermieteten Einheiten') : null);

  let walt = angaben.walt;
  if (!walt && tabelle) {
    const basis = new Date(stichtag);
    const befristet = vermietet.filter((e) => e.ende && new Date(e.ende) > basis);
    const gewicht = summe(befristet, 'mietePa');
    if (gewicht > 0) {
      const jahre = befristet.reduce((s, e) => s + e.mietePa * ((new Date(e.ende) - basis) / (365.25 * 864e5)), 0) / gewicht;
      walt = berechnet(Math.round(jahre * 10) / 10, befristet, `Nach Jahresmiete gewichtete Restlaufzeit von ${befristet.length} befristeten Verträgen`);
    }
  }
  f.walt = walt;

  const hinweise = [];
  if (tabelle && angaben.leerstandsquote && t.flaeche > 0) {
    const gerechnet = (t.leer / t.flaeche) * 100;
    if (Math.abs(gerechnet - angaben.leerstandsquote.wert) > 0.5) {
      hinweise.push({ ton: 'warnung', text: `Leerstandsquote laut Summenzeile ${formatiere(angaben.leerstandsquote.wert, 1)} %, aus den Einzelzeilen ${formatiere(gerechnet, 1)} %.` });
    }
  }
  if (tabelle && angaben.mietertraege && Math.abs(t.miete - angaben.mietertraege.wert) > Math.max(12, angaben.mietertraege.wert * 0.005)) {
    hinweise.push({ ton: 'warnung', text: `Jahresmiete laut Summenzeile weicht von der Summe der Einzelzeilen ab (${formatiere(t.miete, 0)} €).` });
  }
  if (tabelle) hinweise.push({ ton: 'ok', text: `${n} Mieteinheiten gelesen, davon ${leerstand.length} leer.` });
  return { felder: f, hinweise, zusatz: { stichtag } };
}

function leseCashflow(zeilen) {
  const f = {};
  f.mietertraege = finde(zeilen, [/mieterträge|mieteinnahmen/i, /nettokaltmiete/i, /sollmiete|rental\s+income/i], betragAus);
  f.cashflow = finde(zeilen, [/jährlicher\s+cash-?\s?flow/i, /netto-?\s?cash-?\s?flow/i, /reinertrag/i, /net\s+operating\s+income|\bnoi\b/i, /cash-?\s?flow\s+(p\.?\s?a|vor\s+kapitaldienst)/i], betragAus);
  const summeKosten = finde(zeilen, [/summe\s+(der\s+)?bewirtschaftungskosten/i, /bewirtschaftungskosten\s+(gesamt|summe)/i, /bewirtschaftungskosten(?!quote)/i, /operating\s+expenses|\bopex\b/i], betragAus);
  f.bewirtschaftung = MIT(summeKosten, { wert: summeKosten ? Math.abs(summeKosten.wert) : null });
  const rohertrag = finde(zeilen, [/rohertrag|bruttoertrag|gesamterträge/i], betragAus);
  if (!f.bewirtschaftung && rohertrag && f.cashflow) {
    f.bewirtschaftung = MIT(rohertrag, { wert: rohertrag.wert - f.cashflow.wert, hinweis: 'Rohertrag abzüglich jährlicher Cashflow' });
  }
  if (!f.cashflow && rohertrag && f.bewirtschaftung) {
    f.cashflow = MIT(rohertrag, { wert: rohertrag.wert - f.bewirtschaftung.wert, hinweis: 'Rohertrag abzüglich Bewirtschaftungskosten' });
  }
  f.leerstandsquote = finde(zeilen, [/leerstandsquote|leerstandsrate|vacancy/i], prozentAus);
  return { felder: f, hinweise: [] };
}

const VERFAHREN = [
  [/ertragswert/i, 'Gutachten (Ertragswertverfahren)'],
  [/sachwert/i, 'Gutachten (Sachwertverfahren)'],
  [/vergleichswert/i, 'Gutachten (Vergleichswertverfahren)'],
  [/beleihungswert/i, 'Beleihungswertgutachten'],
];

function leseGutachten(zeilen) {
  const f = {};
  f.wert = finde(zeilen, [/verkehrswert\s*\(marktwert\)|marktwert\s*\(verkehrswert\)/i, /verkehrswert/i, /marktwert/i, /market\s+value/i], betragAus, { pruefe: (w) => w >= 10000 });
  f.datum = finde(zeilen, [/wertermittlungsstichtag|bewertungsstichtag/i, /stichtag/i], datumAus);
  const verfahren = finde(zeilen, [/wertermittlungsverfahren|bewertungsverfahren/i, /verfahren/i], (r) =>
    VERFAHREN.find(([re]) => re.test(r))?.[1] ?? null
  );
  f.bewertung = verfahren;
  f.baujahr = finde(zeilen, [/baujahr/i], jahrAus);
  f.flaeche = finde(zeilen, [/mietfläche|wohnfläche|nutzfläche/i], zahlAus, { pruefe: (w) => w > 20 });
  const art = finde(zeilen, [/^objektart|nutzungsart|gebäudeart/i], textAus);
  f.nutzung = art && nutzungAus(art.wert) ? MIT(art, { wert: nutzungAus(art.wert) }) : null;
  const objekt = finde(zeilen, [/^objekt\s*:?$/i, /bewertungsobjekt/i], textAus);
  const adresse = finde(zeilen, [/^adresse\b|^lage\b/i], textAus);
  f.bezeichnung = objekt && !/^\d/.test(objekt.wert) ? objekt : bezeichnungAus(art?.wert, adresse);
  f.cashflow = finde(zeilen, [/reinertrag/i], betragAus);
  const kosten = finde(zeilen, [/bewirtschaftungskosten/i], betragAus);
  f.bewirtschaftung = MIT(kosten, { wert: kosten ? Math.abs(kosten.wert) : null });
  const roh = finde(zeilen, [/rohertrag/i], betragAus);
  f.mietertraege = MIT(roh, { hinweis: 'Rohertrag laut Gutachten (nachhaltig erzielbare Erträge)' });
  return { felder: f, hinweise: [] };
}

function leseGrundbuch(zeilen) {
  const f = {};
  const start = zeilen.findIndex((z) => /dritte\s+abteilung|abteilung\s+iii|abt\.\s*iii/i.test(z.text));
  const hinweise = [];
  if (start < 0) return { felder: f, hinweise: [{ ton: 'warnung', text: 'Abteilung III nicht gefunden – Vorlasten bitte manuell prüfen.' }] };
  const bereich = [];
  for (let i = start + 1; i < zeilen.length; i += 1) {
    if (/abteilung|bestandsverzeichnis/i.test(zeilen[i].text)) break;
    bereich.push(zeilen[i]);
  }
  const keine = bereich.slice(0, 3).some((z) => /keine\s+eintragung/i.test(z.text));
  const eintraege = bereich.filter((z) => /grundschuld|hypothek|rentenschuld/i.test(z.text) && !/summe/i.test(z.text) && betragAus(z.text) != null);
  const summenZeile = bereich.find((z) => /summe/i.test(z.text) && betragAus(z.text) != null);
  const kopf = zeilen[start];
  const stelle = (z) => ({ seite: z.seite, zeile: z.index });
  if (keine || eintraege.length === 0) {
    f.vorlasten = { wert: 0, stellen: [kopf, ...bereich.slice(0, 1)].map(stelle), roh: rohText(kopf), hinweis: 'Abteilung III ohne Eintragungen – keine vorrangigen Grundpfandrechte' };
    f.rang = { ...f.vorlasten, wert: 1, hinweis: 'Keine Eintragungen in Abteilung III – die neue Grundschuld steht im ersten Rang' };
  } else {
    const summeWert = summenZeile ? betragAus(summenZeile.text) : eintraege.reduce((s, z) => s + betragAus(z.text), 0);
    f.vorlasten = {
      wert: summeWert,
      stellen: (summenZeile ? [summenZeile] : eintraege).map(stelle),
      roh: rohText(summenZeile || eintraege[0]),
      hinweis: `${eintraege.length} ${eintraege.length === 1 ? 'Eintragung' : 'Eintragungen'} in Abteilung III`,
    };
    f.rang = {
      wert: eintraege.length + 1,
      stellen: eintraege.map(stelle),
      roh: eintraege.map(rohText).join('\n'),
      hinweis: `Nach ${eintraege.length} ${eintraege.length === 1 ? 'vorrangigem Recht' : 'vorrangigen Rechten'} in Abteilung III`,
    };
  }
  const lage = finde(zeilen, [/wirtschaftsart\s+und\s+lage|^lage\b/i], textAus);
  if (lage) f.bezeichnung = MIT(lage, { wert: lage.wert.replace(/^gebäude-\s*und\s*freifläche,?\s*/i, '') });
  return { felder: f, hinweise };
}

const LESER = {
  energieausweis: (zeilen) => ({ felder: leseEnergieausweis(zeilen), hinweise: [] }),
  mieterliste: leseMieterliste,
  cashflow: leseCashflow,
  gutachten: leseGutachten,
  grundbuch: leseGrundbuch,
};

/**
 * Liest die Werte einer Unterlage bekannten Typs.
 * @returns {{ felder: Object<string, {wert, stellen, roh, hinweis?}>, hinweise: Array, zusatz?: object }}
 */
export function extrahiereWerte(typ, dok) {
  const ergebnis = LESER[typ](alleZeilen(dok));
  const felder = Object.fromEntries(
    Object.entries(ergebnis.felder).filter(([, fund]) => fund && fund.wert != null && fund.wert !== '')
  );
  return { ...ergebnis, felder };
}

// ---------------------------------------------------------------------------
// 4. Zusammenführen
// ---------------------------------------------------------------------------

/**
 * Verteilt die ausgelesenen Werte aller Unterlagen auf die Felder der
 * Sicherheit. Je Feld gewinnt die Unterlage mit dem höchsten Vorrang; von
 * Hand geänderte Felder bleiben, wie sie sind.
 */
export function fuehreZusammen(item) {
  const ausgelesen = (item.unterlagen || []).filter((u) => u.status === 'ausgelesen' && u.ergebnis);
  const sicherheit = {};
  const objekt = {};
  const quellen = {};
  const uebernommen = [];
  for (const [key, def] of Object.entries(OBJEKT_FELDER)) {
    if ((item.manuell || []).includes(key)) continue;
    for (const typ of def.quellen) {
      const unterlage = [...ausgelesen].reverse().find((u) => u.typ === typ && u.ergebnis.felder[key]);
      if (!unterlage) continue;
      const fund = unterlage.ergebnis.felder[key];
      const bisher = def.ziel === 'sicherheit' ? item[key] : item.objekt?.[key];
      if (def.nurWennLeer && bisher && !item.quellen?.[key]) break;
      if (def.ziel === 'sicherheit') sicherheit[key] = fund.wert;
      else objekt[key] = fund.wert;
      quellen[key] = { unterlageId: unterlage.id, stellen: fund.stellen, roh: fund.roh, hinweis: fund.hinweis || null };
      uebernommen.push(key);
      break;
    }
  }
  return { sicherheit, objekt, quellen, uebernommen };
}

// ---------------------------------------------------------------------------
// 5. Plausibilisierung
// ---------------------------------------------------------------------------

function formatiere(wert, stellen) {
  return new Intl.NumberFormat('de-DE', { minimumFractionDigits: stellen, maximumFractionDigits: stellen }).format(wert);
}

const datumDe = (iso) => {
  const [j, m, t] = String(iso).slice(0, 10).split('-');
  return `${t}.${m}.${j}`;
};

/** Hinweise über alle Unterlagen eines Objekts hinweg. */
export function pruefeObjekt(item) {
  const hinweise = [];
  const ausgelesen = (item.unterlagen || []).filter((u) => u.status === 'ausgelesen' && u.ergebnis);
  const wert = (typ, key) => [...ausgelesen].reverse().find((u) => u.typ === typ)?.ergebnis.felder[key]?.wert;
  const o = item.objekt || {};

  const soll = wert('mieterliste', 'mietertraege');
  const ist = wert('cashflow', 'mietertraege');
  if (soll && ist) {
    const abweichung = ((ist - soll) / soll) * 100;
    hinweise.push(Math.abs(abweichung) <= 3
      ? { ton: 'ok', text: `Mieterträge laut Objekt-Cashflow passen zur Mieterliste (Abweichung ${formatiere(abweichung, 1)} %).` }
      : { ton: 'warnung', text: `Mieterträge laut Objekt-Cashflow weichen um ${formatiere(abweichung, 1)} % von der Sollmiete der Mieterliste ab.` });
  }

  if (o.ausweisGueltigBis) {
    const bis = new Date(o.ausweisGueltigBis);
    const heute = new Date();
    const inSechsMonaten = new Date(heute.getFullYear(), heute.getMonth() + 6, heute.getDate());
    if (bis < heute) hinweise.push({ ton: 'warnung', text: `Energieausweis seit ${datumDe(o.ausweisGueltigBis)} abgelaufen – aktuellen Ausweis anfordern.` });
    else if (bis < inSechsMonaten) hinweise.push({ ton: 'info', text: `Energieausweis läuft am ${datumDe(o.ausweisGueltigBis)} ab.` });
  }
  if (['F', 'G', 'H'].includes(o.energieklasse)) {
    hinweise.push({ ton: 'info', text: `Energieeffizienzklasse ${o.energieklasse}: Sanierungsbedarf und ESG-Risiko im Beleihungswert berücksichtigen.` });
  }
  if (Number(o.leerstandsquote) > 10) {
    hinweise.push({ ton: 'warnung', text: `Leerstandsquote ${formatiere(Number(o.leerstandsquote), 1)} % – Nachhaltigkeit der Mieterträge prüfen.` });
  }
  if (o.walt !== '' && o.walt != null && Number(o.walt) < 3) {
    hinweise.push({ ton: 'warnung', text: `WALT ${formatiere(Number(o.walt), 1)} Jahre – Anschlussvermietungsrisiko in den nächsten Jahren.` });
  }
  if (Number(o.cashflow) > 0 && Number(item.wert) > 0) {
    const nar = (Number(o.cashflow) / Number(item.wert)) * 100;
    hinweise.push({ ton: 'info', text: `Nettoanfangsrendite ${formatiere(nar, 2)} % (jährlicher Cashflow zu Marktwert).` });
  }
  return hinweise;
}
