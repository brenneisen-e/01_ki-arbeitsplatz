#!/usr/bin/env node
/**
 * daten-deck.mjs – arbeitet die vier Redaktionslieferungen aus dem Monitor-Deloitte-
 * Sektortraining („Insurance Strategy – Grundlagentraining & Onboarding“, 89 Folien) in
 * public/data/chapters.json ein.
 *
 * Grundlage: scratchpad/ZIELSTRUKTUR.md (13 Kapitel, sieben neue Blocktypen) und
 * scratchpad/ENTSCHEIDUNGEN.md (Punkte 1–37 des Orchestrators). Jede redaktionelle
 * Entscheidung steht als benannte Konstante oder Tabelle am Anfang dieser Datei; der
 * Protokolltext nennt zu jedem Schritt Ort und Grund.
 *
 * Eingaben (alle im Repository, damit der Lauf ohne Scratchpad wiederholbar ist):
 *   scripts/daten/deck/chapters-2.0.json   Abzug der Fassung 2.0 – die Positionsangaben
 *                                          der Lieferungen beziehen sich auf diese Datei
 *   scripts/daten/deck/teil1..teil4.json   die vier Lieferungen, unverändert
 * Ausgabe: public/data/chapters.json
 *
 * Das Skript baut immer aus dem Abzug neu und ist damit idempotent: ein zweiter Lauf
 * erzeugt eine byteidentische Datei. Jede Positionsangabe wird vor dem Einfügen geprüft;
 * passt sie nicht mehr, bricht der Lauf mit Ort, Erwartung und Vorgefundenem ab.
 *
 * Aufruf:  node scripts/daten-deck.mjs [--trocken] [--still] [--ziel <pfad>] [--basis <pfad>]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NBSP, AUSGENOMMENE_SCHLUESSEL, formatiereText } from './daten/format.mjs';

const HIER = path.dirname(fileURLToPath(import.meta.url));
const QUELLVERZEICHNIS = path.resolve(HIER, 'daten/deck');
const BASIS_ARG = process.argv.indexOf('--basis') >= 0 ? process.argv[process.argv.indexOf('--basis') + 1] : null;
const BASIS = BASIS_ARG ? path.resolve(BASIS_ARG) : path.join(QUELLVERZEICHNIS, 'chapters-2.0.json');
const TEILE = ['teil1', 'teil2', 'teil3', 'teil4'];
const ZIEL_ARG = process.argv.indexOf('--ziel') >= 0 ? process.argv[process.argv.indexOf('--ziel') + 1] : null;
const ZIEL = ZIEL_ARG ? path.resolve(ZIEL_ARG) : path.resolve(HIER, '../public/data/chapters.json');
const TROCKEN = process.argv.includes('--trocken');
const STILL = process.argv.includes('--still');
const TIEFEN = ['level1', 'level2', 'level3'];
const FELD = { 1: 'level1', 2: 'level2', 3: 'level3' };

// ===========================================================================
// 0. Entscheidungstabellen – jede Zeile ist eine Entscheidung mit Begründung
// ===========================================================================

/** ZIELSTRUKTUR §1 / Entscheidung 8: Kapitelreihenfolge, Anzeigenummer = Position. */
const KAPITELREIHENFOLGE = [
  'grundlagen', '01-marktueberblick', '02-marktteilnehmer', 'kundengruppen', '03-produktlandschaft',
  '04-vertriebswege', '05-verguetung-provision', '06-regulatorik', '07-wertschoepfungskette',
  'geschaeftsmodell', '08-zukunftsthemen', '09-verbaende-institutionen', 'beratungspraxis',
];

/** Welche Lieferung die Hülle eines neuen Kapitels stellt. */
const NEUE_KAPITEL = { grundlagen: 'teil1', kundengruppen: 'teil2', geschaeftsmodell: 'teil3', beratungspraxis: 'teil4' };

/** Entscheidung 16 (grundlagen) und 35 (Wertschöpfungskette): Reihenfolge der Lerneinheiten. */
const EINHEITENREIHENFOLGE = {
  grundlagen: ['definition', 'risikotransfer', 'grosse-zahlen', 'praemie', 'marktineffizienzen', 'risikokette'],
  '07-wertschoepfungskette': ['ueberblick', 'produktentwicklung', 'aktuariat-underwriting', 'bestandsfuehrung',
    'schadenmgmt', 'kundenservice', 'kapitalanlage', 'it-digitalisierung'],
};

/** Felder der Lieferungen, die nur Lieferhinweise sind und nicht in die Daten gehören. */
const LIEFERFELDER = ['position', 'positionHinweis', 'heroStatHinweis', 'hinweis', 'art', 'bestehendeDefinition', 'grund', 'quelle', 'folie'];

/**
 * Entscheidung 16: `grundlagen` erhält heroStat und quickStats aus Teil 3 (Folien 52–54).
 * Teil 1 liefert die Hülle ohne Kennzahlen (die Folien 1–6 nennen keine), Teil 3 die Zahlen
 * des Rechenbeispiels der Prämienformel. Alle vier Werte stehen wörtlich auf Folie 54.
 */
const GRUNDLAGEN_KENNZAHLEN = {
  heroStat: { value: 1000, unit: '€', label: 'Reinprämie bei 1 % Schadenwahrscheinlichkeit und 100.000 € erwarteter Schadenhöhe' },
  quickStats: [
    { value: 1, unit: '%', label: 'Schadenwahrscheinlichkeit im Rechenbeispiel des Hausbrands' },
    { value: 100000, unit: '€', label: 'erwartete Schadenhöhe im Rechenbeispiel' },
    { value: 4, unit: '', label: 'Glieder des Bruttobeitrags von der Reinprämie bis zur Gewinnmarge' },
  ],
};

/**
 * Entscheidungen 1, 2 und 18: Korrekturen an den Hüllen der neuen Kapitel.
 * `beratungspraxis` bekommt den kurzen Titel für die Seitenleiste und statt der
 * Praxiszahl 70 % die abzählbare Zahl der Themenfelder; `kundengruppen` bleibt ohne
 * quickStats, weil weder das Deck noch der Bestand drei belegte, thematisch passende
 * Kennzahlen zu Privat-, Gewerbe- und Industriekunden hergeben (Regel 9 und 18).
 */
const KAPITELKORREKTUREN = {
  beratungspraxis: {
    title: 'Beratungspraxis',
    subtitle: 'Projekte verorten und typische Fragestellungen erkennen',
    quickStatErsatz: {
      index: 2,
      erwartetesLabel: 'Anteil reiner Strategiearbeit an den Projekten',
      neu: { value: 7, unit: '', label: 'Themenfelder, in denen die Projekte liegen' },
      grund: 'Entscheidung 2: Die App zeigt als Kennzahl nur belegte Marktzahlen. Die 70/30-Aussage bleibt im Fließtext von projektbeispiele (level3) mit Quellenverweis auf Folie 78.',
    },
  },
  kundengruppen: {
    quickStatsWeglassen: 'Entscheidung 9 und 18: Die Folien 24–27 nennen keine Kennzahl, und der Bestand führt keine belegte Zahl zu Privat-, Gewerbe- und Industriekunden. Das Feld entfällt, die Kennzahlenleiste zeigt nur den heroStat.',
  },
};

/** Entscheidung 24: Cyber-Prämien – der Textwert mit GDV-Verweis (330 Mio. €) gewinnt. */
const KENNZAHLKORREKTUREN = [
  {
    ort: 'kapitel:03-produktlandschaft.quickStats[2]', label: 'Cyber-Prämien', alt: 600, neu: 330,
    grund: 'Entscheidung 24 / Regel 10: 03-produktlandschaft/gewerbe.level2[2] nennt 330 Mio. € mit Quellenverweis (GDV-Cyberstatistik).',
  },
  {
    ort: 'einheit:03-produktlandschaft/gewerbe.quickStats[1]', label: 'Cyber-Prämien Deutschland', alt: 600, neu: 330,
    grund: 'Entscheidung 24: derselbe Wert in der Einheit, die den Textbeleg trägt.',
  },
  {
    ort: 'einheit:03-produktlandschaft/innovativ.quickStats[0]', label: 'Cyber-Prämien Deutschland', alt: 600, neu: 330,
    grund: 'Entscheidung 24: dritte Fundstelle desselben Wertes in Kapitel 03.',
  },
  {
    ort: 'einheit:03-produktlandschaft/innovativ.quickStats[1]', label: 'Embedded Insurance Prognose 2030', alt: 70,
    neuerWert: { value: 33, unit: '%', label: 'Kunden befürworten Embedded Insurance (Nordlight)' },
    grund: 'Entscheidung 23: Die Embedded-Prognosen stehen künftig nur in 04-vertriebswege/embedded. Als Kennzahl der Einheit tritt die Zustimmungsquote aus demselben Absatz an ihre Stelle.',
  },
];

/**
 * Textkorrekturen am Bestand. Jede Zeile nennt Ort, Erwartung und Grund; passt die
 * Erwartung nicht mehr, bricht der Lauf ab (kein stilles Ersetzen).
 */
const TEXTKORREKTUREN = [
  {
    ort: '04-vertriebswege/ueberblick.level1[0]', feld: 'title',
    erwartet: 'Die sieben Vertriebskanäle', neu: 'Die Kanäle des deutschen Versicherungsvertriebs',
    grund: 'Entscheidung 22: Nach der Einarbeitung hat das Kapitel sechs Kanaleinheiten (AO, Makler, Bancassurance, Direkt/Online, Embedded, Assekuradeure). Der Überblick nennt die Kanäle, statt eine Zahl zu behaupten.',
  },
  {
    ort: '03-produktlandschaft/leben-rente.level2[8]', feld: 'content', modus: 'anhang',
    erwartetEnthaelt: 'Riester', titelErwartet: 'Riester-Rente vor grundlegender Reform',
    neu: ' Was das Altersvorsorge-Reformgesetz (AVRG) ab Januar 2027 an ihre Stelle setzt, steht in der Lerneinheit Altersvorsorge-Reform im Kapitel Zukunftsthemen.',
    grund: 'Entscheidung 25: Querverweis auf die neue Einheit altersvorsorge-reform.',
  },
  {
    ort: '03-produktlandschaft/innovativ.level1[2]', feld: 'content', modus: 'ersetzen',
    erwartet: `BCG prognostiziert bis 2030 über <strong>70${NBSP}Mrd.${NBSP}USD</strong> an Bruttoprämien.`,
    neu: 'Die Marktprognosen gehen je nach Abgrenzung weit auseinander; sie stehen mit ihren Quellen gebündelt in der Lerneinheit Embedded Insurance im Kapitel Vertriebswege.',
    grund: 'Entscheidung 23: Die Zahlen stehen an einer Stelle; hier bleibt ein Verweissatz ohne Zahl.',
  },
  {
    ort: '03-produktlandschaft/innovativ.kurzgesagt[1]', feld: null, modus: 'ersetzen-ganz',
    erwartetEnthaelt: `70${NBSP}Mrd.${NBSP}USD`,
    neu: 'Embedded Insurance integriert Versicherungsschutz per Schnittstelle in fremde Kaufprozesse; nur 33 % der deutschen Versicherungskunden befürworten das Modell grundsätzlich.',
    grund: 'Entscheidung 23: Die Kernaussage darf die Prognose nicht mehr nennen, weil sie in dieser Einheit nicht mehr im Text steht. Beide Aussagen des Satzes stehen in level1[2].',
  },
];

/**
 * Entscheidung 34: `01-marktueberblick/marktstruktur.level2[3]` ist der Teiltext des
 * Combined-Ratio-Callouts aus `level1[6]` – ein Bestandsfehler, der entfällt.
 * Entscheidung 32: der datenlose Combined-Ratio-Rechner verlässt die Wertschöpfungskette.
 */
const BLOECKE_ENTFERNEN = [
  {
    ort: '01-marktueberblick/marktstruktur.level2[3]', typ: 'callout', enthaelt: 'Combined Ratio',
    grund: 'Entscheidung 34: Teiltext des Callouts aus level1[6] desselben Unterkapitels.',
  },
];

/** Erwartung zu den Blöcken, die die Lieferungen ersetzen oder entfernen (Positionsprüfung). */
const INDEXERWARTUNG = {
  '04-vertriebswege/direkt-online.level1[3]': { type: 'paragraph', titel: 'Embedded Insurance' },
  '07-wertschoepfungskette/ueberblick.level1[6]': { type: 'valueChain', titel: 'Wertschöpfungskette in der Versicherungswirtschaft' },
  '07-wertschoepfungskette/ueberblick.level1[7]': { type: 'combinedRatioCalc', titel: 'Combined Ratio Rechner' },
};

/**
 * Entscheidung 19 mit der Leseempfehlung der Lieferung: Der neue Absatz „Ertragslogik des
 * Direktkanals“ steht vor dem Embedded-Verweis, nicht hinter ihm.
 */
const POSITIONSUEBERSTEUERUNG = [
  {
    kapitel: '04-vertriebswege', einheit: 'direkt-online', tiefe: 1, titel: 'Ertragslogik des Direktkanals',
    position: 'nach:2',
    grund: 'Bericht Teil 2, Abschnitt 2.3: Leserichtung Direktvertrieb, Vergleichsportale, Callout, Ertragslogik, Embedded-Verweis.',
  },
];

/**
 * Entscheidung 33: Die Detailangaben des ersetzten `valueChain`-Blocks bleiben erhalten.
 * Jede Stufe des alten Blocks wird zu einem level2-Absatz der Lerneinheit, die die Stufe
 * führt; die Aufgabenlisten sind wörtlich aus dem alten Block übernommen.
 */
const VALUECHAIN_UEBERFUEHRUNG = [
  { stufe: 'produktentwicklung', einheit: 'produktentwicklung', titel: 'Aufgaben der Produktentwicklung im Einzelnen' },
  { stufe: 'underwriting', einheit: 'aktuariat-underwriting', titel: 'Aufgaben des Underwritings im Einzelnen' },
  { stufe: 'vertrieb', einheit: 'ueberblick', titel: 'Aufgaben von Vertrieb und Abschluss im Einzelnen' },
  { stufe: 'vertragsverwaltung', einheit: 'bestandsfuehrung', titel: 'Aufgaben der Vertragsverwaltung im Einzelnen' },
  { stufe: 'schadenmanagement', einheit: 'schadenmgmt', titel: 'Aufgaben des Schadenmanagements im Einzelnen' },
  { stufe: 'kapitalanlage', einheit: 'kapitalanlage', titel: 'Aufgaben der Kapitalanlage im Einzelnen' },
  { stufe: 'kundenservice', einheit: 'kundenservice', titel: 'Aufgaben des Kundenservice im Einzelnen' },
];

/**
 * Entscheidung 23: Die Marktprognosen zu Embedded Insurance stehen an einer Stelle.
 * Der belegte Bestandsabsatz aus `08-zukunftsthemen/insurtechs-plattformen` wandert
 * vollständig in die neue Einheit `04-vertriebswege/embedded` (dort liegt auch die
 * Prognose aus dem Deck) und bekommt einen Brückensatz, der die Abgrenzungen verbindet;
 * an der alten Stelle bleibt ein Verweisabsatz ohne Zahl.
 */
const EMBEDDED_BUENDELUNG = {
  von: { kapitel: '08-zukunftsthemen', einheit: 'insurtechs-plattformen', tiefe: 1, index: 3 },
  erwartet: { type: 'paragraph', titel: 'Ein Markt mit dreistelligem Milliarden-Potenzial' },
  nach: { kapitel: '04-vertriebswege', einheit: 'embedded', tiefe: 2, position: 'anfang' },
  bruecke: ' Der im Absatz „Der Markt in Deutschland“ genannte Wert von bis zu 512 Mrd. USD bis 2033 (Allied Market Research) liegt zwischen diesen Schätzungen: Er folgt einer breiteren Abgrenzung als die Bruttoprämien-Rechnung von BCG und WEF und reicht zugleich drei Jahre weiter.',
  ersatz: {
    type: 'paragraph',
    title: 'Marktprognosen je nach Abgrenzung',
    content: 'Wie groß der Markt für Embedded Insurance ist, hängt vor allem an der Abgrenzung: Konservative Rechnungen zählen nur Bruttoprämien, breitere Definitionen das gesamte über eingebettete Kanäle vermittelte Volumen. Die Prognosen, ihre Quellen und der Unterschied der Abgrenzung stehen gebündelt in der Lerneinheit Embedded Insurance im Kapitel Vertriebswege.',
  },
  grund: 'Entscheidung 23: Zahlen an einer Stelle, an den anderen zwei Stellen nur ein Verweissatz ohne Zahl.',
};

/**
 * Korrekturen in Blöcken der Lieferungen. Sie greifen erst nach dem Einfügen und finden
 * den Block über seinen Titel, nicht über einen Index.
 */
const LIEFERKORREKTUREN = [
  {
    kapitel: 'grundlagen', einheit: 'definition', tiefe: 1,
    titel: 'Die Definition, auf der alles aufbaut',
    feld: 'content', modus: 'ersetzen',
    erwartet: 'Das ganze Geschäft steckt in einem einzigen Satz:',
    neu: 'Das ganze Geschäft steckt in einem einzigen Satz – der klassischen Definition der Versicherungsbetriebslehre nach Dieter Farny:',
    grund: 'Entscheidung 12: Die Zuschreibung an Farny ist branchenübliches Fachwissen und darf im Text stehen; die Folie nennt den Urheber nicht, deshalb trägt der Quellenverweis nur den Wortlaut.',
  },
  {
    kapitel: '02-marktteilnehmer', einheit: 'erstversicherer', tiefe: 2,
    titel: 'Private Versicherer: kommerzielles Modell unter Wettbewerbs- und Kostendruck',
    feld: 'content', modus: 'ersetzen',
    erwartet: `mit rund 17${NBSP}% Marktanteil`, neu: `mit 17,4${NBSP}% Marktanteil`,
    grund: 'Entscheidung 15 / Regel 10: Der Bestand nennt 17,4 % – heroStat von 02-marktteilnehmer, Top-10-Tabelle in erstversicherer.level1[4] und 08-zukunftsthemen/ma-konsolidierung.level1[5]; das Deck sagt nur „rund 17 %“.',
  },
  {
    kapitel: '04-vertriebswege', einheit: 'ueberblick', tiefe: 1,
    titel: 'Kanäle, Produkte und Zielgruppen sind verzahnt',
    feld: 'content', modus: 'anhang',
    neu: ' Mehrfachagenten und Strukturvertriebe sind dabei keine eigenen Kanäle, sondern Formen des Vertreterkanals: Sie stehen wie die gebundenen Vertreter im Lager des Versicherers (§ 59 Abs. 2 VVG), vertreten aber mehrere Gesellschaften.',
    grund: 'Entscheidung 22: Mehrfachagenten als Unterform der Ausschließlichkeit benennen, statt eine Kanalzahl zu behaupten. Belegt im Bestand (06-regulatorik/idd.level1[3], Glossar „Mehrfachagent“).',
  },
];

/**
 * Entscheidung 6 und 36: Glossar-Kollisionen. Je Begriff gewinnt eine Fassung; die
 * verworfenen Fassungen stehen mit Grund im Protokoll (und im Bericht).
 */
const GLOSSARENTSCHEIDUNGEN = [
  {
    term: 'Assekuradeur', nimm: 'teil2', verwirf: ['basis'],
    grund: 'Teil 2 liefert die Fassung ausdrücklich als Verbesserung (art: verbesserung): Sie nennt die Ertragslogik (Gebühren plus Beteiligung am Underwriting-Ergebnis) und stellt klar, dass der Assekuradeur das Risiko nicht trägt. Präzision geht hier vor Kürze; der MGA-Verweis der Bestandsfassung steht in 04-vertriebswege/assekuradeure (level3).',
  },
  {
    term: 'Dunkelverarbeitung', nimm: 'teil1', verwirf: ['teil2'],
    grund: 'Regel 6: Die Fassung von Teil 1 ist die kürzere (121 gegen 143 Zeichen) und benennt die beiden Prozessfelder konkret (Vertragsverwaltung und Schadenmanagement). Die von Teil 3 vorgeschlagene dritte Fassung („fallabschließende Bearbeitung“) ist länger und nennt kein Prozessfeld.',
  },
  {
    term: 'SHUK', nimm: 'teil1', verwirf: ['teil4'],
    grund: 'Regel 6: Teil 1 ist kürzer (126 gegen 155 Zeichen) und löst das Kürzel vollständig auf. Die Teilung in SHU und K, die Teil 4 anfügt, steht im Fließtext von beratungspraxis/verortung.',
  },
];

/** Entscheidung 26: zweite Lesart des Nettobeitrags ergänzen, kein zweiter Eintrag. */
const GLOSSARERGAENZUNGEN = [
  {
    term: 'Nettobeitrag', enthaeltNicht: 'Sektortraining',
    anhang: ' Im Sektortraining wird der Begriff weiter gefasst und umfasst Reinprämie, Risiko- und Kostenzuschlag.',
    grund: 'Entscheidung 26: Die Lesart der Folie 54 wird genannt, der Bestandseintrag bleibt führend.',
  },
];

/** Entscheidung 7: Die richtige Antwort verteilt sich gleichmäßig über die Positionen. */
const QUIZ_AUSGLEICH = { aktiv: true, grund: 'Entscheidung 7: Verteilung über alle Fragen annähernd gleich; die richtige Option wandert, die Reihenfolge der übrigen bleibt.' };

/** Entscheidung 11: Grenze der Lesezeit je Kapitel in der Basis-Tiefe (Minuten). */
const LESEZEIT_GRENZE = 35;

// ===========================================================================
// 1. Hilfen
// ===========================================================================
const protokoll = [];
const log = (schritt, text) => protokoll.push(`[${schritt}] ${text}`);
function abbruch(text) {
  console.error(`ABBRUCH: ${text}`);
  if (!STILL) for (const z of protokoll) console.error(z);
  process.exit(1);
}

const CITE_RE = /<span class="v1x1-cite"><span class="v1x1-cite-num">[^<]*<\/span><span class="v1x1-cite-tooltip">[^<]*<\/span><\/span>/g;
const entferneHtml = (s) => String(s ?? '').replace(CITE_RE, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
/** Entfernt weiche Trennstriche (U+00AD), die in Diagramm-Beschriftungen stehen. */
const ohneWeichtrenner = (s) => String(s ?? '').replace(/\u00ad/g, '');
const zaehleWoerter = (s) => { const t = entferneHtml(s); return t ? t.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length : 0; };
const tief = (v) => JSON.parse(JSON.stringify(v));

/** Eigene Texte werden formatiert; technische Felder und die Zeichen der neuen Typen nicht. */
const EIGENE_AUSNAHMEN = new Set([...AUSGENOMMENE_SCHLUESSEL, 'zeichen', 'art', 'rolle', 'gruppe', 'traegt']);
function formatiere(v, schluessel = '') {
  if (typeof v === 'string') return EIGENE_AUSNAHMEN.has(schluessel) ? v : formatiereText(v);
  if (Array.isArray(v)) return v.map((x) => formatiere(x, schluessel));
  if (v && typeof v === 'object') { for (const k of Object.keys(v)) v[k] = formatiere(v[k], k); return v; }
  return v;
}

/** Zählt alle sichtbaren Wörter eines Blocks (auch in den neuen Blocktypen). */
function blockWoerter(block) {
  let n = 0;
  const geh = (v, k = '') => {
    if (typeof v === 'string') { if (!EIGENE_AUSNAHMEN.has(k)) n += zaehleWoerter(v); return; }
    if (Array.isArray(v)) { v.forEach((x) => geh(x, k)); return; }
    if (v && typeof v === 'object') for (const [kk, x] of Object.entries(v)) geh(x, kk);
  };
  geh(block);
  return n;
}

function kapitel(daten, id) {
  const c = daten.chapters.find((x) => x.id === id);
  if (!c) abbruch(`Kapitel „${id}“ fehlt`);
  return c;
}
function einheit(daten, kapitelId, einheitId) {
  const c = kapitel(daten, kapitelId);
  const s = (c.subChapters || []).find((x) => x.id === einheitId);
  if (!s) abbruch(`Lerneinheit „${kapitelId}/${einheitId}“ fehlt`);
  return s;
}
/** Löst „kapitel/einheit.levelN[i]“ auf und gibt { liste, index, block } zurück. */
function ortAuflösen(daten, ort) {
  const m = ort.match(/^([^/]+)\/([^.]+)\.(level[123]|kurzgesagt|lernziele)\[(\d+)\]$/);
  if (!m) abbruch(`Ortsangabe „${ort}“ nicht lesbar`);
  const s = einheit(daten, m[1], m[2]);
  const liste = s[m[3]];
  if (!Array.isArray(liste)) abbruch(`${ort}: ${m[3]} ist keine Liste`);
  const index = Number(m[4]);
  if (index >= liste.length) abbruch(`${ort}: Position ${index} gibt es nicht (nur ${liste.length} Einträge) – die Fassung hat sich geändert`);
  return { einheit: s, liste, index, block: liste[index], kapitelId: m[1], einheitId: m[2], tiefe: m[3] };
}
/** Prüft Typ und Titel eines Blocks gegen die Erwartung der Positionstabelle. */
function pruefeErwartung(ort, block, erwartung) {
  if (!erwartung) return;
  if (erwartung.type && block.type !== erwartung.type) abbruch(`${ort}: erwartet Blocktyp „${erwartung.type}“, gefunden „${block.type}“ – Positionsangabe passt nicht mehr`);
  if (erwartung.titel !== undefined && entferneHtml(block.title || '') !== erwartung.titel) abbruch(`${ort}: erwartet Titel „${erwartung.titel}“, gefunden „${entferneHtml(block.title || '')}“`);
  if (erwartung.enthaelt && !JSON.stringify(block).includes(erwartung.enthaelt)) abbruch(`${ort}: erwartet Text mit „${erwartung.enthaelt}“`);
}
/** Fügt einen Block nach der Positionsangabe der Lieferung ein (anfang | ende | nach:<index>). */
function einfuegen(liste, block, position, ort) {
  if (position === 'anfang') { liste.unshift(block); return 0; }
  if (position === undefined || position === 'ende') { liste.push(block); return liste.length - 1; }
  const m = String(position).match(/^nach:(\d+)$/);
  if (!m) abbruch(`${ort}: Positionsangabe „${position}“ nicht lesbar`);
  const i = Number(m[1]);
  if (i >= liste.length) abbruch(`${ort}: Position „nach:${i}“ gibt es nicht (nur ${liste.length} Blöcke) – die Fassung hat sich geändert`);
  liste.splice(i + 1, 0, block);
  return i + 1;
}
/** Entfernt die Lieferfelder eines Objekts (position, hinweis …). */
function ohneLieferfelder(o) {
  const k = tief(o);
  for (const f of LIEFERFELDER) delete k[f];
  return k;
}

// ===========================================================================
// 2. Einlesen und Vorprüfung
// ===========================================================================
if (!fs.existsSync(BASIS)) abbruch(`Abzug der Fassung 2.0 fehlt: ${BASIS}`);
const daten = JSON.parse(fs.readFileSync(BASIS, 'utf8'));
if (daten.version !== '2.0') abbruch(`Abzug hat version „${daten.version}“, erwartet „2.0“ – die Positionsangaben der Lieferungen gelten nur für 2.0`);
if (daten.chapters.length !== 9) abbruch(`Abzug hat ${daten.chapters.length} Kapitel, erwartet 9 – ist hier schon eine eingearbeitete Fassung hinterlegt?`);
for (const id of Object.keys(NEUE_KAPITEL)) if (daten.chapters.some((c) => c.id === id)) abbruch(`Der Abzug enthält das neue Kapitel „${id}“ schon – bitte den Abzug der Fassung 2.0 wiederherstellen`);
const basisZahlen = kennzahlen(daten);

const lieferung = {};
for (const t of TEILE) {
  const p = path.join(QUELLVERZEICHNIS, `${t}.json`);
  if (!fs.existsSync(p)) abbruch(`Lieferung fehlt: ${p}`);
  lieferung[t] = JSON.parse(fs.readFileSync(p, 'utf8'));
}
log('0 Eingaben', `Abzug 2.0 (${daten.chapters.length} Kapitel, ${basisZahlen.einheiten} Lerneinheiten, ${basisZahlen.bloecke} Blöcke, ${basisZahlen.fragen} Fragen, ${daten.glossary.length} Glossarbegriffe) und vier Lieferungen gelesen`);

// ===========================================================================
// 3. Neue Kapitel bauen (Hülle, Lerneinheiten, Kennzahlen)
// ===========================================================================
for (const [id, teil] of Object.entries(NEUE_KAPITEL)) {
  const roh = (lieferung[teil].neueKapitel || []).find((k) => k.id === id);
  if (!roh) abbruch(`${teil}.json liefert kein Kapitel „${id}“`);
  const k = ohneLieferfelder(roh);
  k.subChapters = (k.subChapters || []).map((s) => ohneLieferfelder(s));
  const korrektur = KAPITELKORREKTUREN[id];
  if (korrektur) {
    if (korrektur.title && k.title !== korrektur.title) { log('1 Kapitelhülle', `${id}: title „${k.title}“ → „${korrektur.title}“ (Entscheidung 1)`); k.title = korrektur.title; }
    if (korrektur.subtitle && k.subtitle !== korrektur.subtitle) { log('1 Kapitelhülle', `${id}: subtitle → „${korrektur.subtitle}“ (Entscheidung 1)`); k.subtitle = korrektur.subtitle; }
    if (korrektur.quickStatErsatz) {
      const q = korrektur.quickStatErsatz;
      const vorhanden = (k.quickStats || [])[q.index];
      if (!vorhanden || vorhanden.label !== q.erwartetesLabel) abbruch(`${id}.quickStats[${q.index}]: erwartet Label „${q.erwartetesLabel}“, gefunden „${vorhanden && vorhanden.label}“`);
      k.quickStats[q.index] = formatiere(tief(q.neu));
      log('1 Kapitelhülle', `${id}.quickStats[${q.index}]: „${q.erwartetesLabel}“ → „${q.neu.label}“ – ${q.grund}`);
    }
    if (korrektur.quickStatsWeglassen) { delete k.quickStats; log('1 Kapitelhülle', `${id}: quickStats weggelassen – ${korrektur.quickStatsWeglassen}`); }
  }
  if (id === 'grundlagen') {
    k.heroStat = formatiere(tief(GRUNDLAGEN_KENNZAHLEN.heroStat));
    k.quickStats = formatiere(tief(GRUNDLAGEN_KENNZAHLEN.quickStats));
    log('1 Kapitelhülle', 'grundlagen: heroStat und quickStats aus den Folien 52–54 ergänzt (Entscheidung 16, Teil 1 liefert keine)');
  }
  daten.chapters.push(k);
  log('1 Kapitelhülle', `${id} aus ${teil}.json angelegt (${(k.subChapters || []).length} Lerneinheit(en), ${(k.quiz || []).length} Fragen)`);
}

// ===========================================================================
// 4. Neue Lerneinheiten einhängen (Position „nach:<einheitId>“)
// ===========================================================================
for (const t of TEILE) {
  for (const erw of lieferung[t].erweiterungen || []) {
    for (const rohEinheit of erw.neueEinheiten || []) {
      const c = kapitel(daten, erw.kapitelId);
      const neu = ohneLieferfelder(rohEinheit);
      if (c.subChapters.some((s) => s.id === neu.id)) abbruch(`${erw.kapitelId}/${neu.id} gibt es schon – Lieferung doppelt?`);
      const position = rohEinheit.position || 'ende';
      let i = c.subChapters.length;
      if (position !== 'ende') {
        const m = String(position).match(/^nach:(.+)$/);
        if (!m) abbruch(`${erw.kapitelId}/${neu.id}: Positionsangabe „${position}“ nicht lesbar`);
        i = c.subChapters.findIndex((s) => s.id === m[1]);
        if (i < 0) abbruch(`${erw.kapitelId}/${neu.id}: Bezugseinheit „${m[1]}“ gibt es nicht – Positionsangabe passt nicht mehr`);
        i += 1;
      }
      c.subChapters.splice(i, 0, neu);
      log('2 Lerneinheiten', `${erw.kapitelId}/${neu.id} an Position ${i} eingehängt (${position}, ${t})`);
    }
  }
}

// ===========================================================================
// 5. Bestandskorrekturen und Blockersatz – alles mit Indizes der Fassung 2.0
// ===========================================================================

// 5.1 Die Stufen des valueChain-Blocks sichern, bevor er ersetzt wird (Entscheidung 33).
const altVK = ortAuflösen(daten, '07-wertschoepfungskette/ueberblick.level1[6]');
pruefeErwartung('07-wertschoepfungskette/ueberblick.level1[6]', altVK.block, INDEXERWARTUNG['07-wertschoepfungskette/ueberblick.level1[6]']);
const vkStufen = new Map((altVK.block.steps || []).map((s) => [s.id, s]));

// 5.2 Der Embedded-Marktabsatz wandert aus Kapitel 08 in die neue Einheit embedded.
const eb = EMBEDDED_BUENDELUNG;
const ebOrt = `${eb.von.kapitel}/${eb.von.einheit}.${FELD[eb.von.tiefe]}[${eb.von.index}]`;
const ebStelle = ortAuflösen(daten, ebOrt);
pruefeErwartung(ebOrt, ebStelle.block, eb.erwartet);
const embeddedMarktBlock = tief(ebStelle.block);
embeddedMarktBlock.content = `${embeddedMarktBlock.content}${formatiereText(eb.bruecke)}`;
ebStelle.liste[ebStelle.index] = formatiere(tief(eb.ersatz));
log('3 Bestand', `${ebOrt}: Marktprognosen-Absatz nach ${eb.nach.kapitel}/${eb.nach.einheit} (${FELD[eb.nach.tiefe]}) verschoben, Verweisabsatz ohne Zahl bleibt – ${eb.grund}`);

// 5.3 Textkorrekturen
for (const k of TEXTKORREKTUREN) {
  if (k.modus === 'ersetzen-ganz') {
    const stelle = ortAuflösen(daten, k.ort);
    if (!String(stelle.block).includes(k.erwartetEnthaelt)) abbruch(`${k.ort}: erwartet Text mit „${k.erwartetEnthaelt}“`);
    stelle.liste[stelle.index] = formatiereText(k.neu);
    log('3 Bestand', `${k.ort} neu gefasst – ${k.grund}`);
    continue;
  }
  const stelle = ortAuflösen(daten, k.ort);
  if (k.titelErwartet !== undefined) pruefeErwartung(k.ort, stelle.block, { titel: k.titelErwartet });
  const wert = stelle.block[k.feld];
  if (typeof wert !== 'string') abbruch(`${k.ort}.${k.feld} ist kein Text`);
  if (k.modus === 'anhang') {
    if (k.erwartetEnthaelt && !wert.includes(k.erwartetEnthaelt)) abbruch(`${k.ort}.${k.feld}: erwartet Text mit „${k.erwartetEnthaelt}“`);
    if (wert.includes(entferneHtml(k.neu))) { log('3 Bestand', `${k.ort}: Satz war schon vorhanden`); continue; }
    stelle.block[k.feld] = `${wert}${formatiereText(k.neu)}`;
  } else {
    if (!wert.includes(k.erwartet)) abbruch(`${k.ort}.${k.feld}: erwartete Stelle „${k.erwartet.slice(0, 60)}…“ nicht gefunden`);
    stelle.block[k.feld] = wert.replace(k.erwartet, formatiereText(k.neu));
  }
  log('3 Bestand', `${k.ort}.${k.feld} ${k.modus === 'anhang' ? 'ergänzt' : 'ersetzt'} – ${k.grund}`);
}

// 5.4 Kennzahlkorrekturen
for (const k of KENNZAHLKORREKTUREN) {
  const m = k.ort.match(/^(kapitel|einheit):([^/.]+)(?:\/([^.]+))?\.quickStats\[(\d+)\]$/);
  if (!m) abbruch(`Kennzahl-Ort „${k.ort}“ nicht lesbar`);
  const traeger = m[1] === 'kapitel' ? kapitel(daten, m[2]) : einheit(daten, m[2], m[3]);
  const q = (traeger.quickStats || [])[Number(m[4])];
  if (!q) abbruch(`${k.ort}: quickStat gibt es nicht`);
  if (q.label !== k.label) abbruch(`${k.ort}: erwartet Label „${k.label}“, gefunden „${q.label}“`);
  if (q.value !== k.alt) abbruch(`${k.ort}: erwartet Wert ${k.alt}, gefunden ${q.value}`);
  if (k.neuerWert) { traeger.quickStats[Number(m[4])] = formatiere(tief(k.neuerWert)); log('3 Bestand', `${k.ort}: „${k.label}“ (${k.alt}) → „${k.neuerWert.label}“ (${k.neuerWert.value} ${k.neuerWert.unit}) – ${k.grund}`); }
  else { q.value = k.neu; log('3 Bestand', `${k.ort}: ${k.alt} → ${k.neu} ${q.unit} („${k.label}“) – ${k.grund}`); }
}

// 5.5 Blockersatz und -entfernung der Lieferungen (Indizes der Fassung 2.0)
for (const t of TEILE) {
  for (const erw of lieferung[t].erweiterungen || []) {
    for (const ers of erw.ersetzteBloecke || []) {
      const ort = `${erw.kapitelId}/${ers.einheitId}.${FELD[ers.tiefe]}[${ers.index}]`;
      const stelle = ortAuflösen(daten, ort);
      pruefeErwartung(ort, stelle.block, INDEXERWARTUNG[ort]);
      stelle.liste[stelle.index] = tief(ers.block);
      log('4 Blockersatz', `${ort}: „${entferneHtml(INDEXERWARTUNG[ort] ? INDEXERWARTUNG[ort].titel : '')}“ (${stelle.block.type}) → ${ers.block.type} „${entferneHtml(ers.block.title || '')}“ – ${String(ers.grund || '').slice(0, 160)}`);
    }
  }
}
const zuEntfernen = [];
for (const t of TEILE) {
  for (const erw of lieferung[t].erweiterungen || []) {
    for (const ent of erw.entfernteBloecke || []) {
      zuEntfernen.push({ ort: `${erw.kapitelId}/${ent.einheitId}.${FELD[ent.tiefe]}[${ent.index}]`, typ: ent.typ, grund: ent.grund, quelle: t });
    }
  }
}
for (const b of BLOECKE_ENTFERNEN) zuEntfernen.push({ ort: b.ort, typ: b.typ, enthaelt: b.enthaelt, grund: b.grund, quelle: 'Entscheidung' });
// absteigend nach Index, damit sich nichts verschiebt
zuEntfernen.sort((a, b) => Number(b.ort.match(/\[(\d+)\]$/)[1]) - Number(a.ort.match(/\[(\d+)\]$/)[1]));
for (const e of zuEntfernen) {
  const stelle = ortAuflösen(daten, e.ort);
  pruefeErwartung(e.ort, stelle.block, { type: e.typ, ...(e.enthaelt ? { enthaelt: e.enthaelt } : {}), ...(INDEXERWARTUNG[e.ort] || {}) });
  stelle.liste.splice(stelle.index, 1);
  log('4 Blockersatz', `${e.ort} (${e.typ}) entfernt – ${String(e.grund).slice(0, 200)}`);
}

// ===========================================================================
// 6. Neue Blöcke einfügen (Reihenfolge der Lieferung, Positionen fortlaufend)
// ===========================================================================
function positionFuer(kapitelId, einheitId, tiefe, block, vorgabe) {
  const u = POSITIONSUEBERSTEUERUNG.find((x) => x.kapitel === kapitelId && x.einheit === einheitId && x.tiefe === tiefe
    && entferneHtml(block.title || '') === x.titel);
  if (!u) return { position: vorgabe, grund: null };
  return { position: u.position, grund: u.grund };
}
for (const t of TEILE) {
  for (const erw of lieferung[t].erweiterungen || []) {
    for (const nb of erw.neueBloecke || []) {
      const s = einheit(daten, erw.kapitelId, nb.einheitId);
      const feld = FELD[nb.tiefe];
      if (!Array.isArray(s[feld])) s[feld] = [];
      const { position, grund } = positionFuer(erw.kapitelId, nb.einheitId, nb.tiefe, nb.block, nb.position);
      const ort = `${erw.kapitelId}/${nb.einheitId}.${feld}`;
      const i = einfuegen(s[feld], tief(nb.block), position, ort);
      log('5 Blöcke', `${ort}[${i}] ${nb.block.type} „${entferneHtml(nb.block.title || '').slice(0, 60)}“ (${position}${grund ? `, abweichend: ${grund}` : ''}, ${t})`);
    }
  }
}

// 6.1 Der verschobene Embedded-Marktabsatz
{
  const s = einheit(daten, eb.nach.kapitel, eb.nach.einheit);
  const feld = FELD[eb.nach.tiefe];
  if (!Array.isArray(s[feld])) s[feld] = [];
  const i = einfuegen(s[feld], embeddedMarktBlock, eb.nach.position, `${eb.nach.kapitel}/${eb.nach.einheit}.${feld}`);
  log('5 Blöcke', `${eb.nach.kapitel}/${eb.nach.einheit}.${feld}[${i}]: verschobener Absatz „${entferneHtml(embeddedMarktBlock.title)}“ mit Brückensatz zur Abgrenzung`);
}

// 6.2 Die Details des ersetzten valueChain-Blocks (Entscheidung 33)
for (const u of VALUECHAIN_UEBERFUEHRUNG) {
  const stufe = vkStufen.get(u.stufe);
  if (!stufe) abbruch(`valueChain-Stufe „${u.stufe}“ fehlt im ersetzten Block`);
  const s = einheit(daten, '07-wertschoepfungskette', u.einheit);
  if (!Array.isArray(s.level2)) s.level2 = [];
  const liste = String(stufe.description).replace(/\.$/, '');
  const block = formatiere({ type: 'paragraph', title: u.titel, content: `Die Stufe „${ohneWeichtrenner(entferneHtml(stufe.label))}“ der Wertschöpfungskette umfasst im Einzelnen: ${liste}.` });
  s.level2.push(block);
  log('5 Blöcke', `07-wertschoepfungskette/${u.einheit}.level2[${s.level2.length - 1}]: Details der Stufe „${ohneWeichtrenner(entferneHtml(stufe.label))}“ gesichert (Entscheidung 33)`);
}

// 6.3 Korrekturen in den eingefügten Blöcken der Lieferungen (Entscheidungen 15 und 22)
for (const k of LIEFERKORREKTUREN) {
  const s = einheit(daten, k.kapitel, k.einheit);
  const feld = FELD[k.tiefe];
  const i = (s[feld] || []).findIndex((b) => entferneHtml(b.title || '') === k.titel);
  if (i < 0) abbruch(`${k.kapitel}/${k.einheit}.${feld}: Block „${k.titel}“ nicht gefunden – die Lieferung hat ihn umbenannt`);
  const wert = s[feld][i][k.feld];
  if (typeof wert !== 'string') abbruch(`${k.kapitel}/${k.einheit}.${feld}[${i}].${k.feld} ist kein Text`);
  if (k.modus === 'anhang') {
    if (wert.includes(entferneHtml(k.neu))) { log('5 Blöcke', `${k.kapitel}/${k.einheit}.${feld}[${i}]: Satz war schon vorhanden`); continue; }
    s[feld][i][k.feld] = `${wert}${formatiereText(k.neu)}`;
  } else {
    if (!wert.includes(k.erwartet)) abbruch(`${k.kapitel}/${k.einheit}.${feld}[${i}].${k.feld}: erwartete Stelle „${k.erwartet}“ nicht gefunden – die Lieferung hat den Text geändert`);
    s[feld][i][k.feld] = wert.replace(k.erwartet, formatiereText(k.neu));
  }
  log('5 Blöcke', `${k.kapitel}/${k.einheit}.${feld}[${i}].${k.feld} ${k.modus === 'anhang' ? 'ergänzt' : 'korrigiert'} – ${k.grund}`);
}

// ===========================================================================
// 7. chartData der Lieferungen (trendRadar-Items anfügen)
// ===========================================================================
for (const t of TEILE) {
  for (const erw of lieferung[t].erweiterungen || []) {
    for (const [schluessel, wert] of Object.entries(erw.chartData || {})) {
      const c = kapitel(daten, erw.kapitelId);
      const vorhanden = (c.chartData || {})[schluessel];
      if (!vorhanden) abbruch(`${erw.kapitelId}.chartData.${schluessel} gibt es nicht – Anweisung der Lieferung passt nicht mehr`);
      if (!Array.isArray(wert.items)) abbruch(`${erw.kapitelId}.chartData.${schluessel}: Lieferung hat keine items`);
      const ringe = vorhanden.rings || [];
      const segmente = vorhanden.segments || [];
      const vorher = vorhanden.items.length;
      for (const item of wert.items) {
        if (vorhanden.items.some((x) => x.label === item.label)) abbruch(`${erw.kapitelId}.chartData.${schluessel}: Item „${item.label}“ gibt es schon`);
        if (!(item.ring >= 0 && item.ring < ringe.length) || !(item.segment >= 0 && item.segment < segmente.length)) abbruch(`${erw.kapitelId}.chartData.${schluessel}: Item „${item.label}“ zeigt auf Ring ${item.ring} / Segment ${item.segment}, die es nicht gibt`);
        vorhanden.items.push(tief(item));
      }
      log('6 Diagramme', `${erw.kapitelId}.chartData.${schluessel}: ${wert.items.length} Items angefügt (${vorher} → ${vorhanden.items.length}), rings und segments unverändert`);
    }
  }
}

// ===========================================================================
// 8. Reihenfolgen: Lerneinheiten, dann Kapitel
// ===========================================================================
for (const [kapitelId, folge] of Object.entries(EINHEITENREIHENFOLGE)) {
  const c = kapitel(daten, kapitelId);
  const vorhanden = c.subChapters.map((s) => s.id);
  const fehlt = folge.filter((id) => !vorhanden.includes(id));
  const zusatz = vorhanden.filter((id) => !folge.includes(id));
  if (fehlt.length) abbruch(`${kapitelId}: Reihenfolge nennt „${fehlt.join(', ')}“, das Kapitel hat sie nicht`);
  if (zusatz.length) abbruch(`${kapitelId}: Kapitel hat „${zusatz.join(', ')}“, die Reihenfolge nennt sie nicht`);
  const vorher = vorhanden.join(' → ');
  c.subChapters = folge.map((id) => c.subChapters.find((s) => s.id === id));
  log('7 Reihenfolge', `${kapitelId}: ${vorher}  ⇒  ${folge.join(' → ')}`);
}
{
  const vorhanden = daten.chapters.map((c) => c.id);
  const fehlt = KAPITELREIHENFOLGE.filter((id) => !vorhanden.includes(id));
  const zusatz = vorhanden.filter((id) => !KAPITELREIHENFOLGE.includes(id));
  if (fehlt.length || zusatz.length) abbruch(`Kapitelreihenfolge passt nicht: fehlt „${fehlt.join(', ')}“, zusätzlich „${zusatz.join(', ')}“`);
  daten.chapters = KAPITELREIHENFOLGE.map((id) => daten.chapters.find((c) => c.id === id));
  log('7 Reihenfolge', `Kapitel: ${KAPITELREIHENFOLGE.map((id, i) => `${String(i + 1).padStart(2, '0')} ${id}`).join(' · ')}`);
}

// ===========================================================================
// 9. Quiz: zusammenführen, entdoppeln, Positionen ausgleichen
// ===========================================================================
const POSITIONSHINWEIS = /(Antwort|Option|Auswahl)\s*[ABCD]\b|\b[ABCD]\)|(erste|zweite|dritte|vierte|letzte)\s+(Antwort|Option)|Antwort\s*[1-4]\b/i;
const fragenVorher = {};
for (const c of daten.chapters) fragenVorher[c.id] = (c.quiz || []).length;
const gesehen = new Map();
for (const c of daten.chapters) for (const q of c.quiz || []) gesehen.set(entferneHtml(q.question).toLowerCase(), c.id);
let neueFragen = 0;
for (const t of TEILE) {
  for (const erw of lieferung[t].erweiterungen || []) {
    const c = kapitel(daten, erw.kapitelId);
    if (!Array.isArray(c.quiz)) c.quiz = [];
    for (const q of erw.neueQuizfragen || []) {
      const norm = entferneHtml(q.question).toLowerCase();
      if (gesehen.has(norm)) { log('8 Quiz', `Frage übersprungen (steht schon in ${gesehen.get(norm)}): „${entferneHtml(q.question).slice(0, 70)}…“`); continue; }
      gesehen.set(norm, c.id);
      c.quiz.push(tief(q));
      neueFragen += 1;
    }
  }
}
log('8 Quiz', `${neueFragen} neue Fragen aus den Erweiterungen angefügt; Fragen der neuen Kapitel kommen aus deren Hülle`);
const alleFragen = [];
for (const c of daten.chapters) {
  const einheitIds = new Set((c.subChapters || []).map((s) => s.id));
  for (const [qi, q] of (c.quiz || []).entries()) {
    if (q.einheitId && !einheitIds.has(q.einheitId)) abbruch(`${c.id}.quiz[${qi}]: einheitId „${q.einheitId}“ gibt es im Kapitel nicht`);
    if (POSITIONSHINWEIS.test(q.explanation || '')) abbruch(`${c.id}.quiz[${qi}]: Erklärung nennt eine Antwortposition – „${q.explanation.slice(0, 80)}“`);
    alleFragen.push(q);
  }
}
const positionenVorher = {};
for (const q of alleFragen) positionenVorher[q.correct] = (positionenVorher[q.correct] || 0) + 1;
const positionenNachher = [0, 0, 0, 0];
let verschoben = 0;
if (QUIZ_AUSGLEICH.aktiv) {
  for (const q of alleFragen) {
    const n = q.options.length;
    let ziel = 0;
    for (let i = 1; i < n; i += 1) if (positionenNachher[i] < positionenNachher[ziel]) ziel = i;
    if (ziel !== q.correct) {
      const richtig = q.options[q.correct];
      const rest = q.options.filter((_, i) => i !== q.correct);
      q.options = [...rest.slice(0, ziel), richtig, ...rest.slice(ziel)];
      q.correct = ziel;
      verschoben += 1;
    }
    positionenNachher[ziel] += 1;
  }
}
log('8 Quiz', `${alleFragen.length} Fragen; richtige Position vorher ${JSON.stringify(positionenVorher)}, nachher ${JSON.stringify(Object.fromEntries(positionenNachher.entries()))}; ${verschoben} Fragen umgestellt – ${QUIZ_AUSGLEICH.grund}`);

// ===========================================================================
// 10. Glossar: zusammenführen, entdoppeln, ergänzen, sortieren
// ===========================================================================
const glossar = new Map();
const glossarQuelle = new Map();
for (const g of daten.glossary) { glossar.set(g.term.toLowerCase(), tief(g)); glossarQuelle.set(g.term.toLowerCase(), 'basis'); }
const entscheidung = new Map(GLOSSARENTSCHEIDUNGEN.map((e) => [e.term.toLowerCase(), e]));
const verworfen = [];
for (const t of TEILE) {
  for (const g of lieferung[t].glossar || []) {
    const schluessel = g.term.toLowerCase();
    const eintrag = ohneLieferfelder(g);
    if (!glossar.has(schluessel)) { glossar.set(schluessel, eintrag); glossarQuelle.set(schluessel, t); continue; }
    const e = entscheidung.get(schluessel);
    if (!e) abbruch(`Glossar: „${g.term}“ kommt doppelt vor (${glossarQuelle.get(schluessel)} und ${t}), ohne Entscheidung in GLOSSARENTSCHEIDUNGEN`);
    if (e.nimm === t) {
      verworfen.push({ term: g.term, verworfen: glossarQuelle.get(schluessel), definition: glossar.get(schluessel).definition, grund: e.grund, gewinner: t });
      glossar.set(schluessel, eintrag);
      glossarQuelle.set(schluessel, t);
    } else {
      verworfen.push({ term: g.term, verworfen: t, definition: g.definition, grund: e.grund, gewinner: glossarQuelle.get(schluessel) });
    }
  }
}
for (const v of verworfen) log('9 Glossar', `„${v.term}“: Fassung aus ${v.gewinner} behalten, Fassung aus ${v.verworfen} verworfen – ${v.grund}`);
for (const e of GLOSSARERGAENZUNGEN) {
  const g = glossar.get(e.term.toLowerCase());
  if (!g) abbruch(`Glossar: „${e.term}“ gibt es nicht`);
  if (e.enthaeltNicht && g.definition.includes(e.enthaeltNicht)) { log('9 Glossar', `„${e.term}“ war schon ergänzt`); continue; }
  g.definition = `${g.definition}${formatiereText(e.anhang)}`;
  log('9 Glossar', `„${e.term}“ ergänzt – ${e.grund}`);
}
const TAG_VOKABULAR = new Set(['Markt', 'Produkte', 'Vertrieb', 'Regulatorik', 'Finanzen', 'PKV', 'Zukunft']);
const slugs = new Map();
for (const g of glossar.values()) {
  for (const tag of g.tags || []) if (!TAG_VOKABULAR.has(tag)) abbruch(`Glossar „${g.term}“: Tag „${tag}“ ist nicht im Vokabular`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(g.slug || '')) abbruch(`Glossar „${g.term}“: slug „${g.slug}“ fehlt oder ist nicht ASCII`);
  if (slugs.has(g.slug)) abbruch(`Glossar: slug „${g.slug}“ doppelt („${slugs.get(g.slug)}“ und „${g.term}“)`);
  slugs.set(g.slug, g.term);
}
daten.glossary = [...glossar.values()].sort((a, b) => a.term.localeCompare(b.term, 'de', { sensitivity: 'base' }) || a.slug.localeCompare(b.slug));
log('9 Glossar', `${daten.glossary.length} Begriffe (Abzug ${basisZahlen.glossar} + Lieferungen ${TEILE.reduce((n, t) => n + (lieferung[t].glossar || []).length, 0)} − ${verworfen.length} entdoppelt), alphabetisch sortiert`);

// ===========================================================================
// 11. Abschlussprüfungen
// ===========================================================================
// 11.1 Rechner je genau einmal (Entscheidung 32)
const rechner = { combinedRatioCalc: [], provisionCalc: [] };
for (const c of daten.chapters) for (const s of c.subChapters || []) for (const t of TIEFEN) (s[t] || []).forEach((b, i) => { if (rechner[b.type]) rechner[b.type].push(`${c.id}/${s.id}.${t}[${i}]`); });
for (const [typ, orte] of Object.entries(rechner)) {
  if (orte.length !== 1) abbruch(`${typ} kommt ${orte.length}× vor (${orte.join(', ')}), erwartet genau einmal`);
  log('10 Prüfung', `${typ}: genau einmal, in ${orte[0]}`);
}
// 11.2 Lerneinheiten vollständig (kurzgesagt, lernziele)
for (const c of daten.chapters) for (const s of c.subChapters || []) {
  if (!Array.isArray(s.kurzgesagt) || s.kurzgesagt.length < 2) abbruch(`${c.id}/${s.id}: kurzgesagt fehlt`);
  if (!Array.isArray(s.lernziele) || s.lernziele.length < 2) abbruch(`${c.id}/${s.id}: lernziele fehlen`);
}
// 11.3 Lesezeit je Kapitel in der Basis-Tiefe (Entscheidung 11)
const lesezeit = [];
for (const c of daten.chapters) {
  let basis = 0;
  let gesamt = 0;
  for (const s of c.subChapters || []) {
    const je = TIEFEN.map((t) => (s[t] || []).reduce((n, b) => n + blockWoerter(b), 0));
    basis += je[0] ? Math.max(1, Math.ceil(je[0] / 200)) : 0;
    gesamt += Math.max(1, Math.ceil((je[0] + je[1] + je[2]) / 200));
  }
  lesezeit.push({ id: c.id, basis, gesamt });
  if (basis > LESEZEIT_GRENZE) log('10 Prüfung', `WARNUNG ${c.id}: ${basis} Minuten Basis-Lesezeit über der Grenze von ${LESEZEIT_GRENZE}`);
}
log('10 Prüfung', `Basis-Lesezeit je Kapitel: ${lesezeit.map((l) => `${l.id} ${l.basis}`).join(' · ')} (Grenze ${LESEZEIT_GRENZE})`);
log('10 Prüfung', `Lesezeit alle Tiefen: ${lesezeit.map((l) => `${l.id} ${l.gesamt}`).join(' · ')}`);

// ===========================================================================
// 12. Schreiben und Protokoll
// ===========================================================================
function kennzahlen(d) {
  let einheiten = 0;
  let bloecke = 0;
  let woerter = 0;
  let basisWoerter = 0;
  let fragen = 0;
  const typen = {};
  for (const c of d.chapters) {
    fragen += (c.quiz || []).length;
    for (const s of c.subChapters || []) {
      einheiten += 1;
      for (const t of TIEFEN) for (const b of s[t] || []) {
        bloecke += 1;
        typen[b.type] = (typen[b.type] || 0) + 1;
        const w = blockWoerter(b);
        woerter += w;
        if (t === 'level1') basisWoerter += w;
      }
    }
  }
  return { kapitel: d.chapters.length, einheiten, bloecke, woerter, basisWoerter, fragen, glossar: d.glossary.length, typen };
}
const neueZahlen = kennzahlen(daten);
const ausgabe = `${JSON.stringify(daten, null, 2)}\n`;
if (!TROCKEN) fs.writeFileSync(ZIEL, ausgabe);

if (!STILL) {
  for (const z of protokoll) console.log(z);
  console.log('');
  console.log('Kennzahlen           vorher →  nachher');
  const zeile = (name, a, b) => console.log(`  ${name.padEnd(18)} ${String(a).padStart(7)} → ${String(b).padStart(8)}`);
  zeile('Kapitel', basisZahlen.kapitel, neueZahlen.kapitel);
  zeile('Lerneinheiten', basisZahlen.einheiten, neueZahlen.einheiten);
  zeile('Blöcke', basisZahlen.bloecke, neueZahlen.bloecke);
  zeile('Wörter', basisZahlen.woerter, neueZahlen.woerter);
  zeile('Wörter Basis', basisZahlen.basisWoerter, neueZahlen.basisWoerter);
  zeile('Quizfragen', basisZahlen.fragen, neueZahlen.fragen);
  zeile('Glossar', basisZahlen.glossar, neueZahlen.glossar);
  zeile('Bytes', fs.statSync(BASIS).size, Buffer.byteLength(ausgabe));
  console.log(`  Blocktypen neu: ${Object.entries(neueZahlen.typen).filter(([k]) => !basisZahlen.typen[k]).map(([k, v]) => `${k} ${v}`).join(', ') || 'keine'}`);
  console.log(TROCKEN ? 'Trockenlauf: nichts geschrieben' : `Geschrieben: ${ZIEL}`);
}
