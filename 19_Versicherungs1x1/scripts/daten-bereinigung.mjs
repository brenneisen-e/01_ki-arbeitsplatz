#!/usr/bin/env node
/**
 * daten-bereinigung.mjs – strukturelle und formale Bereinigung von public/data/chapters.json
 *
 * Grundlage: BRIEF.md Abschnitt 11 (Punkte 1–11) und Datenaudit Abschnitt D (Regelwerk).
 * Das Skript ist idempotent: ein zweiter Lauf ändert nichts mehr. Alle redaktionellen
 * Einzelentscheidungen stehen als Tabellen am Anfang (RETTUNG, KOPIEN_ENTFERNEN,
 * TEXTKORREKTUREN, KENNZAHLEN, GLOSSAR_*), damit sie nachvollziehbar und wiederholbar sind.
 *
 * Aufruf:  node scripts/daten-bereinigung.mjs            schreibt die Datei
 *          node scripts/daten-bereinigung.mjs --trocken  nur Protokoll, nichts schreiben
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NBSP, AUSGENOMMENE_SCHLUESSEL, formatiereText } from './daten/format.mjs';

const HIER = path.dirname(fileURLToPath(import.meta.url));
const DATEI = path.resolve(HIER, '../public/data/chapters.json');
const TROCKEN = process.argv.includes('--trocken');
const TIEFEN = ['level1', 'level2', 'level3'];

const protokoll = [];
const log = (schritt, text) => protokoll.push(`[${schritt}] ${text}`);

// ---------------------------------------------------------------------------
// Hilfsfunktionen
// ---------------------------------------------------------------------------
const CITE_RE = /<span class="v1x1-cite"><span class="v1x1-cite-num">([^<]*)<\/span><span class="v1x1-cite-tooltip">([^<]*)<\/span><\/span>/g;
const entferneHtml = (s) => String(s ?? '').replace(CITE_RE, '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const schluessel = (b) => JSON.stringify(b);
/** Erkennungstext eines Blocks: Titel, sonst Inhalt, sonst Spaltenköpfe. */
const kennung = (b) => entferneHtml(b.title || b.content || b.text || (b.headers || b.columns || []).join('|'));
const woerter = (b) => { const t = entferneHtml(JSON.stringify(b).replace(/\\"/g, ' ')); return t ? t.split(/\s+/).length : 0; };
const passt = (b, fingerabdruck) => kennung(b).startsWith(fingerabdruck);

function einheit(daten, kap, id) {
  const s = daten.chapters[kap].subChapters.find((x) => x.id === id);
  if (!s) throw new Error(`Einheit ${kap}/${id} nicht gefunden`);
  return s;
}
function findeIndex(liste, fingerabdruck) {
  const i = liste.findIndex((b) => passt(b, fingerabdruck));
  if (i < 0) throw new Error(`Block „${fingerabdruck}“ nicht gefunden`);
  return i;
}
/** Löst einen Pfad wie chapters[2].subChapters[4].quickStats[2] auf. */
function loese(daten, pfad) {
  return pfad.split('.').reduce((o, teil) => {
    const m = teil.match(/^(\w+)(?:\[(\d+)\])?$/);
    if (!m) throw new Error(`Ungültiger Pfad ${pfad}`);
    let v = o[m[1]];
    if (m[2] !== undefined) v = v[Number(m[2])];
    if (v === undefined) throw new Error(`Pfad ${pfad} nicht auflösbar (${teil})`);
    return v;
  }, daten);
}
function alleStrings(v, cb, k = '') {
  if (typeof v === 'string') return cb(v, k);
  if (Array.isArray(v)) return v.map((x) => alleStrings(x, cb, k));
  if (v && typeof v === 'object') { for (const key of Object.keys(v)) v[key] = alleStrings(v[key], cb, key); return v; }
  return v;
}

// ---------------------------------------------------------------------------
// Entscheidungstabellen
// ---------------------------------------------------------------------------

/**
 * Punkt 1: die 24 Blöcke, die nur in chapter.levels existierten (07-details.txt).
 * `von`: [Kapitelindex, Tiefe, Index, Prüftext]; `nach`: Einheit, Tiefe und Position
 * (`anfang`, `ende`, `nach`/`vor`/`ersetzt` mit Erkennungstext des Nachbarblocks).
 * Reihenfolge der Einträge = Reihenfolge des Einfügens.
 */
const RETTUNG = [
  // Leben & Rente: Kennzahlen, Kapital-LV, Überschussbeteiligung, Sterbegeld (alle level1 wie im Original)
  { von: [2, 'level1', 10, 'Lebensversicherung in Zahlen (2024)'], nach: { kap: 2, einheit: 'leben-rente', tiefe: 'level1', nach: 'Die Lebensversicherung ist mit' } },
  { von: [2, 'level1', 1, 'Die klassische Kapitallebensversicherung verliert'], nach: { kap: 2, einheit: 'leben-rente', tiefe: 'level1', nach: 'Lebensversicherung in Zahlen (2024)' } },
  { von: [2, 'level1', 2, 'Überschussbeteiligung speist sich aus drei Quellen'], nach: { kap: 2, einheit: 'leben-rente', tiefe: 'level1', nach: 'Die klassische Kapitallebensversicherung verliert' } },
  { von: [2, 'level1', 9, 'Sterbegeldversicherung als Nischenprodukt'], nach: { kap: 2, einheit: 'leben-rente', tiefe: 'level1', am: 'ende' } },
  // Berufsunfähigkeit (level2)
  { von: [2, 'level2', 0, 'Die BU-Versicherung als Goldstandard'], nach: { kap: 2, einheit: 'bu', tiefe: 'level2', am: 'anfang' } },
  { von: [2, 'level2', 4, 'Seit 2001 gibt es keinen gesetzlichen BU-Schutz'], nach: { kap: 2, einheit: 'bu', tiefe: 'level2', nach: 'Die BU-Versicherung als Goldstandard' } },
  { von: [2, 'level2', 6, 'Marktdurchdringung BU'], nach: { kap: 2, einheit: 'bu', tiefe: 'level2', nach: 'Seit 2001 gibt es keinen gesetzlichen BU-Schutz' } },
  // ersetzt die unbelegte Kurzfassung (32 %/21 %/17 %/9 %) durch die belegte Fassung (GDV, Franke & Bornberg)
  { von: [2, 'level2', 3, 'Leistungsquoten widerlegen das Vorurteil der Nicht-Zahlung'], nach: { kap: 2, einheit: 'bu', tiefe: 'level2', ersetzt: 'Leistungsquoten widerlegen das Vorurteil: Laut GDV' } },
  // ersetzt die reine Zwischenüberschrift „Alternativen zur BU für schwer Versicherbare“
  { von: [2, 'level2', 5, 'Alternativen zur BU für schwer versicherbare Berufe'], nach: { kap: 2, einheit: 'bu', tiefe: 'level2', ersetzt: 'Alternativen zur BU für schwer Versicherbare' } },
  // Gewerbe (level3): Technische Versicherungen, Betriebsunterbrechung, Transport
  { von: [2, 'level3', 2, 'Technische Versicherungen und Transportschutz'], nach: { kap: 2, einheit: 'gewerbe', tiefe: 'level3', am: 'anfang' } },
  { von: [2, 'level3', 3, 'Die Betriebsunterbrechungsversicherung ersetzt'], nach: { kap: 2, einheit: 'gewerbe', tiefe: 'level3', nach: 'Technische Versicherungen und Transportschutz' } },
  { von: [2, 'level3', 4, 'Technische Versicherungen (Maschinen-'], nach: { kap: 2, einheit: 'gewerbe', tiefe: 'level3', nach: 'Die Betriebsunterbrechungsversicherung ersetzt' } },
  // Überblick (level3, neu): spartenübergreifende Tarifmerkmale und Rahmen
  { von: [2, 'level3', 17, 'Zentral ist die vorvertragliche Anzeigepflicht'], nach: { kap: 2, einheit: 'ueberblick', tiefe: 'level3', am: 'ende' }, titel: 'Vorvertragliche Anzeigepflicht und Quotelungsprinzip' },
  { von: [2, 'level3', 18, 'Aufsicht durch BaFin und Solvency II'], nach: { kap: 2, einheit: 'ueberblick', tiefe: 'level3', am: 'ende' } },
  { von: [2, 'level3', 19, 'Der Sicherungsfonds Protektor'], nach: { kap: 2, einheit: 'ueberblick', tiefe: 'level3', am: 'ende' } },
  { von: [2, 'level3', 20, 'Kostenstrukturen und Prämiensteuerung'], nach: { kap: 2, einheit: 'ueberblick', tiefe: 'level3', am: 'ende' } },
  { von: [2, 'level3', 21, 'Wartezeiten gelten in der PKV'], nach: { kap: 2, einheit: 'ueberblick', tiefe: 'level3', am: 'ende' } },
  { von: [2, 'level3', 22, 'Standardausschlüsse und Obliegenheiten'], nach: { kap: 2, einheit: 'ueberblick', tiefe: 'level3', am: 'ende' } },
  { von: [2, 'level3', 23, 'Obliegenheiten gliedern sich'], nach: { kap: 2, einheit: 'ueberblick', tiefe: 'level3', am: 'ende' } },
  // Innovative Produkte (level3): Fazit des Kapitels am Ende der letzten Einheit
  { von: [2, 'level3', 24, 'Fazit: Ein Markt zwischen Tradition und Transformation'], nach: { kap: 2, einheit: 'innovativ', tiefe: 'level3', am: 'ende' } },
  { von: [2, 'level3', 25, 'Drei strukturelle Entwicklungen prägen'], nach: { kap: 2, einheit: 'innovativ', tiefe: 'level3', am: 'ende' } },
  // Vergütung: Vergleichstabelle Vertreter/Makler und Erläuterung (level1) → Provisionssätze
  { von: [4, 'level1', 9, 'Merkmal|Vertreter (Provision)|Makler (Courtage)'], nach: { kap: 4, einheit: 'saetze', tiefe: 'level1', am: 'ende' }, titel: 'Vertreter und Makler im Vergleich' },
  { von: [4, 'level1', 10, 'In der Praxis liegen die Netto-Vergütungssätze'], nach: { kap: 4, einheit: 'saetze', tiefe: 'level1', am: 'ende' } },
  // Wertschöpfung: Cat Bonds (level2) → Kapitalanlage
  { von: [6, 'level2', 15, 'Cat Bonds erreichen Rekordhöhen'], nach: { kap: 6, einheit: 'kapitalanlage', tiefe: 'level2', am: 'ende' } },
];

/** Punkt 3: Kopien zwischen Einheiten desselben Kapitels – aus welcher Einheit die Kopie entfällt. */
const KOPIEN_ENTFERNEN = [
  { kap: 0, aus: 'international', gegen: 'marktstruktur', grund: 'Solvenzquoten deutscher Lebensversicherer und Höchstrechnungszins sind Marktstruktur, nicht International' },
  { kap: 3, aus: 'ausschliesslichkeit', gegen: 'makler', grund: 'Vermittlerregister und Vermittlerbestand gehören zu Makler & Mehrfachagenten' },
  { kap: 5, aus: 'bafin', gegen: 'solvency2', grund: 'BaFin-Aufsicht level2 bestand vollständig aus Kopien aus Solvency II & VAG' },
  { kap: 5, aus: 'bafin', gegen: 'idd', grund: 'BaFin-Aufsicht level2 bestand vollständig aus Kopien aus IDD & Vertrieb' },
  { kap: 5, aus: 'solvency2', gegen: 'neue-regulierung', grund: 'Solvency-II-Review wirkt ab 2027 ist neue Regulierung' },
  { kap: 6, aus: 'schadenmgmt', gegen: 'it-digitalisierung', grund: 'Outsourcing ist Thema von IT & Digitalisierung (Untertitel nennt es)' },
];

/** Punkt 2/3: einzelne Blöcke, die entfallen (Kopien, deren Original in einer anderen Einheit bleibt). */
const BLOECKE_ENTFERNEN = [
  { kap: 1, einheit: 'erstversicherer', tiefe: 'level1', typ: 'chartDonut', chartKey: 'marktanteileGesamt', grund: 'Donut bleibt nur in 2/marktanteile' },
  { kap: 1, einheit: 'marktanteile', tiefe: 'level1', typ: 'infoKachelGrid', titel: 'InsurTech-Kategorien im Überblick', grund: 'Kachelraster bleibt nur in 2/insurtechs' },
  { kap: 2, einheit: 'ueberblick', tiefe: 'level1', typ: 'callout', enthaelt: 'Navigationshinweis', grund: 'UI-Hinweis mit Emoji, kein Inhalt (Punkt 5)' },
];

/** Neue Untertitel nach Verschiebung (Punkt 3). */
const UNTERTITEL = [
  { kap: 0, einheit: 'international', subtitle: 'Deutschland im globalen Versicherungsvergleich – Top-10-Märkte, Versicherungsdichte und -durchdringung' },
];

/** Punkt 2: bisher unsichtbare Werkzeuge als Blöcke. */
const NEUE_BLOECKE = [
  { kap: 4, einheit: 'saetze', tiefe: 'level1', block: { type: 'provisionCalc', title: 'Provisionsrechner' } },
  { kap: 2, einheit: 'ueberblick', tiefe: 'level1', block: { type: 'decisionTree', treeKey: 'welcheVersicherung', title: 'Welche Versicherung brauche ich?' } },
  { kap: 2, einheit: 'kv', tiefe: 'level1', block: { type: 'decisionTree', treeKey: 'gkvPkv', title: 'GKV oder PKV – Was passt zu mir?' } },
  { kap: 3, einheit: 'ueberblick', tiefe: 'level1', block: { type: 'sankey', title: 'Vertriebsströme: von der Kundengruppe über den Vertriebsweg zum Erstversicherer', chartKey: 'sankeyData' } },
];

/** Titel für bisher titellose Tabellen (für „Auf dieser Seite“ und Suche). */
const TABELLEN_TITEL = [
  { headers: ['Sparte', 'Typische Courtage (% des Nettobeitrags)'], title: 'Typische Courtagesätze nach Sparte' },
  { headers: ['Unternehmen', 'S&P', "Moody's", 'AM Best', 'Fitch'], title: 'Finanzstärke-Ratings ausgewählter Versicherer' },
];

/**
 * Punkte 9 und 10: Textkorrekturen und Zahlenabgleiche als exakte Ersetzungen.
 * Gilt für alle sichtbaren Strings. Zahlen werden auf den Wert mit Quellenverweis vereinheitlicht.
 */
const TEXTKORREKTUREN = [
  // „Performance Management.Prozessoptimierung“ aus dem Audit ist kein Fehler: im HTML steht </li><li> dazwischen.
  ['Wasserscadenprävention', 'Wasserschadenprävention', 'Tippfehler'],
  ['Spartentrennnung', 'Spartentrennung', 'Tippfehler (Quiz)'],
  ['Hanover Re', 'Hannover Re', 'Schreibweise (Quiz)'],
  ['Was ist die PKV-Verband', 'Was ist der PKV-Verband', 'Grammatik (Quiz)'],
  ['Ein Provision des Bancassurance-Vertriebs', 'Eine Provision des Bancassurance-Vertriebs', 'Grammatik (Quiz)'],
  ['Hausrat schützt Ihren Hausstand.', 'Hausrat schützt deinen Hausstand.', 'Du-Ansprache im Entscheidungsbaum'],
  ['Beitragssumme (bei Lebensversicherungen die Summe aller Beiträge über die Laufzeit)', 'Bewertungssumme (bei Lebensversicherungen die Summe aller Beiträge über die Laufzeit)', 'Quiz 5.7: BWS heißt Bewertungssumme (wie Text, Glossar und Quiz 5.1)'],
  ['BWS steht für Beitragssumme', 'BWS steht für Bewertungssumme', 'Quiz 5.7: BWS heißt Bewertungssumme'],
  ['Embedded Insurance – Der stärkste Wachstumstrend', 'On-Demand- und Peer-to-Peer-Modelle', 'Zwischenüberschrift nach Entfernen der Embedded-Kopie (3/innovativ level2)'],
  // Zahlenabgleiche (Wert mit Quellenverweis gewinnt)
  ['rund <strong>500 Millionen Versicherungsverträge</strong>', 'rund <strong>488 Millionen Versicherungsverträge</strong>', 'Verträge: 488 Mio. (GDV Statistisches Taschenbuch 2024/2025; 1/marktstruktur)'],
  ['rund 500 Millionen Versicherungsverträge.', 'rund 488 Millionen Versicherungsverträge.', 'Verträge: 488 Mio. (Quiz 1.11, Erklärung)'],
  ['<strong>rund 462 Mitgliedsunternehmen</strong>', '<strong>rund 470 Mitgliedsunternehmen</strong>', 'GDV-Mitglieder: 470 mit Quellenverweis (1/marktstruktur, Kachel 9/branchenverbande, Glossar)'],
  ['beaufsichtigt rund 500 Versicherungsunternehmen in Deutschland', 'beaufsichtigt rund 490 Versicherungsunternehmen in Deutschland', 'Versichererzahl: rund 490 unter BaFin-Aufsicht (Handelsblatt/GDV Statistik, 1/segmente)'],
  ['Beaufsichtigt ~350 Versicherungsunternehmen.', 'Beaufsichtigt rund 490 Versicherungsunternehmen, darunter 349 Erst- und Rückversicherer.', 'Versichererzahl (Kachel 9/branchenverbande)'],
  ['rund 540 Versicherungsunternehmen, 122 Pensionskassen und 35 Pensionsfonds', 'rund 490 Versicherungsunternehmen und Pensionsfonds, darunter 349 Erst- und Rückversicherer', 'Versichererzahl (geretteter Block „Aufsicht durch BaFin und Solvency II“)'],
  ['Jährlich ~20.000 Beschwerden, ~50% zugunsten des Kunden.', '21.548 Beschwerden im Rekordjahr 2024; Erfolgsquote der Verbraucher in Sachsparten über 50 %.', 'Ombudsmann: 21.548 (Jahresbericht 2024, 9/schlichtung)'],
  ['Berufsverband der Aktuare mit ~6.500 Mitgliedern', 'Berufsverband der Aktuare mit rund 6.700 Mitgliedern', 'DAV-Mitglieder: 6.700 (DAV Jahresbericht 2024, 9/rating-agenturen)'],
  ['Die Branche beschäftigt ca. 473.780 Erwerbstätige, davon', 'Die Branche beschäftigt rund 474.000 Erwerbstätige (473.780 laut GDV Jahrbuch 2024), davon', 'Quiz 1.7: Option „~474.000“ an den Text (473.780) gebunden'],
];

/** Punkt 9: quickStats – Werte ohne Textentsprechung und unlesbare Einheiten. */
const KENNZAHLEN = [
  { pfad: 'chapters[0].quickStats[1]', setze: { value: 488, label: 'Versicherungsverträge (2024)' }, grund: '501,5 stand nirgends; 488 Mio. mit Quellenverweis' },
  { pfad: 'chapters[1].quickStats[1]', setze: { label: 'Versicherungsgruppen mit über 50 Mio. € Prämien', unit: '' }, grund: 'Einheit „>€50M“ war ein Qualifier' },
  { pfad: 'chapters[2].quickStats[1]', setze: { label: 'PKV-Alterungsrückstellungen 2025' }, grund: '355 Mrd. € ist der Wert 2025 (9/branchenverbande, PKV-Zahlenbericht); 3/kv nennt 341,7 für 2024' },
  { pfad: 'chapters[2].subChapters[0].quickStats[2]', setze: { label: 'Produkttypen am Markt (mindestens)', unit: '' }, grund: 'Einheit „+“' },
  { pfad: 'chapters[2].subChapters[4].quickStats[2]', setze: { label: 'PKV-Alterungsrückstellungen 2025' }, grund: 'siehe oben' },
  { pfad: 'chapters[4].quickStats[1]', setze: { label: 'PKV-Abschlussprovision (Makler, Durchschnitt)', unit: 'Monatsbeiträge' }, grund: 'Einheit „MB“ unlesbar' },
  { pfad: 'chapters[6].quickStats[0]', setze: { value: 6700 }, grund: 'DAV-Mitglieder 6.700 mit Quellenverweis (9/rating-agenturen)' },
  { pfad: 'chapters[7].quickStats[2]', setze: { label: 'ERGO-Stellenabbau durch KI bis 2030', unit: 'Stellen' }, grund: 'Einheit „bis 2030“ war ein Zeitraum' },
  { pfad: 'chapters[8].quickStats[1]', setze: { value: 15, label: 'GDV-Lobbybudget pro Jahr' }, grund: 'Text nennt „circa 15 Millionen Euro“ mit Quellenverweis (Lobbyregister)' },
  // Quiz 1.11: Option folgt dem Zahlenabgleich (488 Mio.)
  { pfad: 'chapters[0].quiz[10]', setze: { options: ['125 Mio.', '250 Mio.', '490 Mio.', '1 Mrd.'] }, grund: 'Option „500 Mio.“ an den Text (rund 488 Mio.) angeglichen' },
];

/** Punkt 7: Glossar. */
const GLOSSAR_UMBENENNEN = { 'Outsouring (Dienstleistungsauslagerung)': 'Outsourcing (Dienstleistungsauslagerung)' };
const GLOSSAR_ZUSAMMENFUEHREN = { AO: 'Ausschließlichkeitsorganisation (AO)', bAV: 'Betriebliche Altersversorgung (bAV)' }; // Kurzeintrag entfällt, vollständigere Definition bleibt
const GLOSSAR_TAGS = {
  BaFin: ['Regulatorik'], BWS: ['Vertrieb', 'Finanzen'], 'Combined Ratio': ['Finanzen'], Courtage: ['Vertrieb'],
  DAV: ['Markt', 'Finanzen'], DORA: ['Regulatorik', 'Zukunft'], EIOPA: ['Regulatorik'], FIDA: ['Regulatorik', 'Zukunft'],
  FRIDA: ['Zukunft', 'Markt'], GBE: ['Finanzen'], GDV: ['Markt'], GKV: ['PKV'], Höchstrechnungszins: ['Finanzen', 'Produkte'],
  IDD: ['Regulatorik', 'Vertrieb'], LVRG: ['Regulatorik', 'Vertrieb'], MCR: ['Regulatorik', 'Finanzen'], ORSA: ['Regulatorik'],
  PKV: ['PKV', 'Produkte'], 'Run-off': ['Markt', 'Finanzen'], 'S/U': ['Produkte', 'Markt'], SCR: ['Regulatorik', 'Finanzen'],
  SFCR: ['Regulatorik'], Stornohaftung: ['Vertrieb', 'Regulatorik'], VAG: ['Regulatorik'], VVaG: ['Markt'], VVG: ['Regulatorik'],
};
const TAG_VOKABULAR = ['Markt', 'Produkte', 'Vertrieb', 'Regulatorik', 'Finanzen', 'PKV', 'Zukunft'];

// ---------------------------------------------------------------------------
// Formatregeln (Regelwerk D) liegen in scripts/daten/format.mjs
// ---------------------------------------------------------------------------

/** Glossar-Slug: ASCII, ä→ae, ö→oe, ü→ue, ß→ss, Leerzeichen → „-“. */
function slug(text) {
  return text.toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/&/g, ' und ')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// ---------------------------------------------------------------------------
// Schritte
// ---------------------------------------------------------------------------

function schritt1Rettung(daten) {
  let n = 0;
  for (const r of RETTUNG) {
    const [kap, tiefe, index, pruef] = r.von;
    const levels = daten.chapters[kap].levels;
    if (!levels) continue; // levels bereits entfernt → schon erledigt
    const block = levels[tiefe][index];
    if (!block || !passt(block, pruef)) throw new Error(`Rettung: Block chapters[${kap}].levels.${tiefe}[${index}] passt nicht zu „${pruef}“ (gefunden: „${block ? kennung(block).slice(0, 50) : '-'}“)`);
    const ziel = einheit(daten, r.nach.kap, r.nach.einheit);
    if (!ziel[r.nach.tiefe]) ziel[r.nach.tiefe] = [];
    const liste = ziel[r.nach.tiefe];
    if (liste.some((b) => schluessel(b) === schluessel(block))) continue;
    let neu = structuredClone(block);
    if (r.titel) neu = { type: neu.type, title: r.titel, ...Object.fromEntries(Object.entries(neu).filter(([k]) => k !== 'type' && k !== 'title')) };
    let wo;
    if (r.nach.am === 'anfang') { liste.unshift(neu); wo = 'Anfang'; }
    else if (r.nach.am === 'ende') { liste.push(neu); wo = 'Ende'; }
    else if (r.nach.nach) { const i = findeIndex(liste, r.nach.nach); liste.splice(i + 1, 0, neu); wo = `nach „${r.nach.nach}“`; }
    else if (r.nach.vor) { const i = findeIndex(liste, r.nach.vor); liste.splice(i, 0, neu); wo = `vor „${r.nach.vor}“`; }
    else if (r.nach.ersetzt) { const i = findeIndex(liste, r.nach.ersetzt); const alt = liste[i]; liste.splice(i, 1, neu); wo = `ersetzt „${r.nach.ersetzt}“ (${entferneHtml(alt.content || '').split(/\s+/).length} Wörter)`; }
    n += 1;
    log('1 Rettung', `chapters[${kap}].levels.${tiefe}[${index}] „${kennung(block).slice(0, 55)}“ → ${r.nach.kap + 1}/${r.nach.einheit}.${r.nach.tiefe} ${wo}`);
  }
  log('1 Rettung', `${n} Blöcke übernommen`);
}

function schritt2LevelsEntfernen(daten) {
  let n = 0;
  for (const c of daten.chapters) if (c.levels) { delete c.levels; n += 1; }
  log('1 levels', `chapter.levels in ${n} Kapiteln entfernt`);
}

function schritt3Doppelte(daten) {
  // a) einzelne Blöcke
  for (const e of BLOECKE_ENTFERNEN) {
    const s = einheit(daten, e.kap, e.einheit);
    const liste = s[e.tiefe];
    const i = liste.findIndex((b) => b.type === e.typ && (!e.chartKey || b.chartKey === e.chartKey) && (!e.titel || b.title === e.titel) && (!e.enthaelt || (b.text || b.content || '').includes(e.enthaelt)));
    if (i >= 0) { const entfernt = liste[i]; liste.splice(i, 1); liste.__entfernt = entfernt; log('3 Kopien', `${e.kap + 1}/${e.einheit}.${e.tiefe}: ${e.typ} „${e.titel || e.chartKey || e.enthaelt}“ entfernt (${woerter(liste.__entfernt)} Wörter) – ${e.grund}`); }
  }
  // b) byteidentische Wiederholungen innerhalb einer Einheit: die spätere Kopie entfällt
  for (const [ci, c] of daten.chapters.entries()) for (const s of c.subChapters) {
    const gesehen = new Set();
    for (const tiefe of TIEFEN) {
      if (!s[tiefe]) continue;
      s[tiefe] = s[tiefe].filter((b) => {
        const k = schluessel(b);
        if (gesehen.has(k)) { log('3 Kopien', `${ci + 1}/${s.id}.${tiefe}: byteidentische Wiederholung „${kennung(b).slice(0, 50)}“ entfernt (${woerter(b)} Wörter)`); return false; }
        gesehen.add(k);
        return true;
      });
    }
  }
  // c) Kopien zwischen Einheiten desselben Kapitels
  for (const [ci, c] of daten.chapters.entries()) {
    const vorkommen = new Map(); // schluessel → [{einheit, tiefe}]
    for (const s of c.subChapters) for (const tiefe of TIEFEN) for (const b of s[tiefe] || []) {
      const k = schluessel(b);
      if (!vorkommen.has(k)) vorkommen.set(k, []);
      vorkommen.get(k).push({ einheit: s.id, tiefe, b });
    }
    for (const [, orte] of vorkommen) {
      if (orte.length < 2) continue;
      const ids = orte.map((o) => o.einheit);
      const regel = KOPIEN_ENTFERNEN.find((r) => r.kap === ci && ids.includes(r.aus) && ids.includes(r.gegen));
      if (!regel) throw new Error(`Kopie ohne Regel in Kapitel ${ci + 1}: „${kennung(orte[0].b).slice(0, 50)}“ in ${ids.join(', ')}`);
      for (const o of orte.filter((x) => x.einheit === regel.aus)) {
        const s = einheit(daten, ci, o.einheit);
        s[o.tiefe] = s[o.tiefe].filter((b) => b !== o.b);
        log('3 Kopien', `${ci + 1}/${o.einheit}.${o.tiefe}: Kopie „${kennung(o.b).slice(0, 50)}“ entfernt (${woerter(o.b)} Wörter), bleibt in ${ci + 1}/${regel.gegen} – ${regel.grund}`);
      }
    }
  }
  for (const u of UNTERTITEL) { const s = einheit(daten, u.kap, u.einheit); if (s.subtitle !== u.subtitle) { s.subtitle = u.subtitle; log('3 Kopien', `${u.kap + 1}/${u.einheit}: Untertitel angepasst`); } }
}

function schritt4NeueBloecke(daten) {
  for (const e of NEUE_BLOECKE) {
    const s = einheit(daten, e.kap, e.einheit);
    if (s[e.tiefe].some((b) => b.type === e.block.type && (b.chartKey || b.treeKey || '') === (e.block.chartKey || e.block.treeKey || ''))) continue;
    if (e.block.treeKey && !daten.chapters[e.kap].decisionTrees?.[e.block.treeKey]) throw new Error(`treeKey ${e.block.treeKey} fehlt`);
    if (e.block.chartKey && !daten.chapters[e.kap].chartData?.[e.block.chartKey]) throw new Error(`chartKey ${e.block.chartKey} fehlt`);
    s[e.tiefe].push(structuredClone(e.block));
    log('2 Werkzeuge', `${e.kap + 1}/${e.einheit}.${e.tiefe}: Block ${e.block.type} „${e.block.title}“ eingehängt`);
  }
  const cd = daten.chapters[3].chartData;
  if (cd?.vertriebswegHeatmap) { delete cd.vertriebswegHeatmap; log('2 Werkzeuge', 'chartData.vertriebswegHeatmap (Duplikat des heatmapGrid-Blocks) gelöscht'); }
  for (const c of daten.chapters) for (const [k, cdaten] of Object.entries(c.chartData || {})) for (const it of cdaten.items || []) if ('rule' in it) { delete it.rule; log('2 Werkzeuge', `chartData.${k}: verwaistes Feld „rule“ entfernt`); }
  for (const c of daten.chapters) for (const s of c.subChapters) for (const tiefe of TIEFEN) for (const b of s[tiefe] || []) {
    if (b.type !== 'table' || b.title) continue;
    const t = TABELLEN_TITEL.find((x) => JSON.stringify(x.headers) === JSON.stringify(b.headers));
    if (t) { const rest = { ...b }; delete rest.type; for (const k of Object.keys(b)) delete b[k]; Object.assign(b, { type: 'table', title: t.title, ...rest }); log('2 Werkzeuge', `${s.id}: Tabelle ohne Titel → „${t.title}“`); }
  }
}

function schritt5Textkorrekturen(daten) {
  for (const [von, nach, grund] of TEXTKORREKTUREN) {
    let n = 0;
    alleStrings(daten, (s, k) => { if (AUSGENOMMENE_SCHLUESSEL.has(k) || !s.includes(von)) return s; n += s.split(von).length - 1; return s.split(von).join(nach); });
    if (n) log('9/10 Text', `${n}× „${von.slice(0, 60)}“ → „${nach.slice(0, 60)}“ – ${grund}`);
    else { let schon = 0; alleStrings(daten, (t) => { if (t.includes(nach)) schon += 1; return t; }); if (!schon) log('9/10 Text', `WARNUNG: „${von.slice(0, 60)}“ nirgends gefunden (auch nicht die Zielfassung)`); }
  }
  for (const k of KENNZAHLEN) {
    const o = loese(daten, k.pfad);
    const vorher = JSON.stringify(o);
    Object.assign(o, k.setze);
    if (JSON.stringify(o) !== vorher) log('9 Kennzahlen', `${k.pfad}: ${vorher} → ${JSON.stringify(o)} – ${k.grund}`);
  }
}

/** Zwischenüberschrift: Absatz ohne Titel, kurz, ohne Satzzeichen am Ende, höchstens in <strong> gehüllt. */
function ueberschriftText(b) {
  if (b.type !== 'paragraph' || b.title || typeof b.content !== 'string') return null;
  const t = b.content.trim().replace(/^<strong>([^<]*)<\/strong>$/, '$1').trim();
  if (/[<\n]/.test(t)) return null;
  return t.length > 0 && t.length <= 70 && !/[.:;!?]$/.test(t) && /^[A-ZÄÖÜ§0-9]/.test(t) ? t : null;
}

function schritt6Ueberschriften(daten) {
  for (const [ci, c] of daten.chapters.entries()) for (const s of c.subChapters) for (const tiefe of TIEFEN) {
    const liste = s[tiefe] || [];
    for (let i = 0; i < liste.length; i += 1) {
      const b = liste[i];
      const titel = ueberschriftText(b);
      if (!titel) continue;
      const folge = liste[i + 1];
      if (folge && !folge.title && ['paragraph', 'table', 'comparisonTable', 'callout'].includes(folge.type)) {
        const typ = folge.type;
        const rest = { ...folge }; delete rest.type;
        for (const k of Object.keys(folge)) delete folge[k];
        Object.assign(folge, { type: typ, title: titel, ...rest });
        liste.splice(i, 1); i -= 1;
        log('4 Überschriften', `${ci + 1}/${s.id}.${tiefe}: „${titel}“ wird Titel des folgenden ${folge.type}-Blocks`);
      } else {
        for (const k of Object.keys(b)) delete b[k];
        Object.assign(b, { type: 'paragraph', title: titel });
        log('4 Überschriften', `${ci + 1}/${s.id}.${tiefe}: „${titel}“ bleibt als Absatz nur mit Titel`);
      }
    }
  }
}

function schritt7Statuszellen(daten) {
  const STATUS = { '✅': ['ja', 'Ja'], '❌': ['nein', 'Nein'], '⚠': ['teils', 'Eingeschränkt'] };
  let n = 0;
  for (const c of daten.chapters) for (const s of c.subChapters) for (const tiefe of TIEFEN) for (const b of s[tiefe] || []) {
    if (!['table', 'comparisonTable'].includes(b.type)) continue;
    b.rows = b.rows.map((zeile) => zeile.map((zelle) => {
      if (typeof zelle !== 'string') return zelle;
      const m = zelle.match(/^(✅|❌|⚠)️?\s*(.*)$/u);
      if (!m) return zelle;
      const [status, standard] = STATUS[m[1]];
      n += 1;
      return { text: m[2].trim() || standard, status };
    }));
  }
  log('5 Statuszellen', `${n} Tabellenzellen mit Emoji in Statuszellen umgewandelt`);
}

function schritt8Formate(daten) {
  let geaendert = 0;
  alleStrings(daten, (s, k) => {
    if (AUSGENOMMENE_SCHLUESSEL.has(k)) return s;
    const neu = formatiereText(s);
    if (neu !== s) geaendert += 1;
    return neu;
  });
  // Quiz-Optionen: „1,00 %“ → „1,0 %“ (Punkt 8), Nachkommanullen in Prozentoptionen
  for (const c of daten.chapters) for (const q of c.quiz || []) q.options = q.options.map((o) => (typeof o === 'string' ? o.replace(/(\d,\d)0(?= %)/g, '$1') : o));
  log('6 Formate', `${geaendert} Strings nach Regelwerk D umgeformt`);
}

function schritt9Glossar(daten) {
  let g = daten.glossary;
  for (const e of g) if (GLOSSAR_UMBENENNEN[e.term]) { log('7 Glossar', `„${e.term}“ → „${GLOSSAR_UMBENENNEN[e.term]}“`); e.term = GLOSSAR_UMBENENNEN[e.term]; }
  for (const [kurz, lang] of Object.entries(GLOSSAR_ZUSAMMENFUEHREN)) {
    const k = g.find((e) => e.term === kurz);
    const l = g.find((e) => e.term === lang);
    if (k && l) { g = g.filter((e) => e !== k); log('7 Glossar', `„${kurz}“ in „${lang}“ zusammengeführt (Definition von „${lang}“ bleibt: „${l.definition.slice(0, 60)}…“)`); }
  }
  let getaggt = 0;
  for (const e of g) {
    if (!e.tags || e.tags.length === 0) {
      const t = GLOSSAR_TAGS[e.term];
      if (!t) throw new Error(`Glossar: keine Tags für „${e.term}“`);
      e.tags = t; getaggt += 1;
    }
    for (const t of e.tags) if (!TAG_VOKABULAR.includes(t)) throw new Error(`Glossar: Tag „${t}“ bei „${e.term}“ nicht im Vokabular`);
  }
  if (getaggt) log('7 Glossar', `${getaggt} Einträge mit Tags versehen`);
  g.sort((a, b) => a.term.localeCompare(b.term, 'de', { sensitivity: 'base' }));
  const vergeben = new Set();
  for (const e of g) {
    let s = slug(e.term);
    let i = 2;
    while (vergeben.has(s)) { s = `${slug(e.term)}-${i}`; i += 1; }
    vergeben.add(s);
    const { term, definition, tags, ...rest } = e;
    for (const k of Object.keys(e)) delete e[k];
    Object.assign(e, { term, definition, tags, ...rest, slug: s });
  }
  daten.glossary = g;
  log('7 Glossar', `${g.length} Einträge, alphabetisch sortiert, slugs vergeben`);
}

function schritt10Wurzel(daten) {
  if (daten.version !== '2.0') { daten.version = '2.0'; log('11 Wurzel', 'version → 2.0'); }
  if (daten.bearbeitet !== '2026-09-18') { daten.bearbeitet = '2026-09-18'; log('11 Wurzel', 'bearbeitet → 2026-09-18'); }
}

function pruefeRettung(daten) {
  const alle = [];
  for (const c of daten.chapters) for (const s of c.subChapters) for (const tiefe of TIEFEN) for (const b of s[tiefe] || []) alle.push(kennung(b));
  const fehlend = RETTUNG.map((r) => r.titel || r.von[3]).filter((f) => !alle.some((k) => k.startsWith(f.replace(/\|/g, ' | ')) || k.startsWith(f)));
  if (fehlend.length) throw new Error(`Gerettete Blöcke nicht sichtbar: ${fehlend.join('; ')}`);
  for (const c of daten.chapters) if (c.levels) throw new Error(`levels noch vorhanden in ${c.id}`);
}

// ---------------------------------------------------------------------------
// Ablauf
// ---------------------------------------------------------------------------
const roh = fs.readFileSync(DATEI, 'utf8');
const daten = JSON.parse(roh);

schritt1Rettung(daten);
schritt2LevelsEntfernen(daten);
schritt3Doppelte(daten);
schritt4NeueBloecke(daten);
schritt5Textkorrekturen(daten);
schritt6Ueberschriften(daten);
schritt7Statuszellen(daten);
schritt8Formate(daten);
schritt9Glossar(daten);
schritt10Wurzel(daten);
pruefeRettung(daten);

const ausgabe = `${JSON.stringify(daten, null, 2)}\n`;
console.log(protokoll.join('\n'));
console.log(`\nBytes: ${Buffer.byteLength(roh)} → ${Buffer.byteLength(ausgabe)}${ausgabe === roh ? ' (unverändert)' : ''}`);
if (!TROCKEN && ausgabe !== roh) { fs.writeFileSync(DATEI, ausgabe); console.log(`geschrieben: ${DATEI}`); }
