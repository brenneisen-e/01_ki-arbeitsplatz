#!/usr/bin/env node
/**
 * daten-pruefung.mjs – Abnahmetest für public/data/chapters.json (BRIEF.md Abschnitt 11, Punkt 15).
 *
 * Prüft Schema aller Blocktypen – auch der sieben neuen Typen der ZIELSTRUKTUR §3 (archetypenKarte,
 * stufenTabelle, morphologischerKasten, formelAufbau, simulationGrosseZahlen, risikokette, prozessKette,
 * je mit optionaler fussnote) –, Formatregeln
 * (keine Emojis, kein „€“ vor Zahlen, kein „—“, keine falsch geschlossenen Anführungszeichen, Prozent mit
 * U+00A0), HTML-Whitelist, auflösbare chartKey/treeKey, gültige quiz.correct und einheitId, eindeutige slugs,
 * kurzgesagt und lernziele in allen Lerneinheiten, keine byteidentischen Blockpaare, keine `levels` mehr,
 * Rechner (combinedRatioCalc, provisionCalc) je genau einmal, Erklärungen ohne Antwortposition und
 * Lesezeit je Kapitel in der Basis-Tiefe (Warnung ab 35 Minuten).
 *
 * Aufruf:  node scripts/daten-pruefung.mjs [--ohne-anreicherung] [--still] [--datei <pfad>]
 * Exit-Code 1 bei mindestens einem Verstoß; Warnungen ändern den Exit-Code nicht.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HIER = path.dirname(fileURLToPath(import.meta.url));
const DATEI_ARG = process.argv.indexOf('--datei') >= 0 ? process.argv[process.argv.indexOf('--datei') + 1] : null;
const DATEI = DATEI_ARG ? path.resolve(DATEI_ARG) : path.resolve(HIER, '../public/data/chapters.json');
const OHNE_ANREICHERUNG = process.argv.includes('--ohne-anreicherung');
const STILL = process.argv.includes('--still');
const TIEFEN = ['level1', 'level2', 'level3'];

const fehler = [];
const warnungen = [];
const F = (ort, text) => fehler.push(`${ort}: ${text}`);
const W = (ort, text) => warnungen.push(`${ort}: ${text}`);

const roh = fs.readFileSync(DATEI, 'utf8');
let daten;
try { daten = JSON.parse(roh); } catch (e) { console.error(`JSON nicht parsebar: ${e.message}`); process.exit(1); }

// ---------------------------------------------------------------------------
// Hilfen
// ---------------------------------------------------------------------------
const CITE_RE = /<span class="v1x1-cite"><span class="v1x1-cite-num">([^<]*)<\/span><span class="v1x1-cite-tooltip">([^<]*)<\/span><\/span>/g;
const istString = (v) => typeof v === 'string' && v.length > 0;
const istStringListe = (v, min = 1) => Array.isArray(v) && v.length >= min && v.every(istString);
const entferneHtml = (s) => String(s ?? '').replace(CITE_RE, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const woerter = (s) => { const t = entferneHtml(s); return t ? t.split(/\s+/).length : 0; };

const TECHNISCHE_SCHLUESSEL = new Set(['id', 'type', 'icon', 'chartKey', 'treeKey', 'pageId', 'version', 'lastUpdated', 'bearbeitet',
  'sourceUrl', 'link', 'color', 'borderColor', 'backgroundColor', 'slug', 'status', 'next', 'start', 'source', 'target', 'direction', 'variant', 'einheitId']);

/** Sichtbarer Text eines Strings ohne Tags, Quellen-Tooltips und Formeln. */
function sichtbar(s) {
  return s.replace(CITE_RE, ' ').replace(/<code>[\s\S]*?<\/code>/g, ' ').replace(/<[^>]+>/g, '');
}

function alleStrings(v, cb, pfad = '', schluessel = '') {
  if (typeof v === 'string') return cb(v, pfad, schluessel);
  if (Array.isArray(v)) return v.forEach((x, i) => alleStrings(x, cb, `${pfad}[${i}]`, schluessel));
  if (v && typeof v === 'object') return Object.entries(v).forEach(([k, x]) => alleStrings(x, cb, pfad ? `${pfad}.${k}` : k, k));
  return undefined;
}

// ---------------------------------------------------------------------------
// 1. Wurzel und Kapitel
// ---------------------------------------------------------------------------
if (!Array.isArray(daten.chapters) || daten.chapters.length === 0) F('Wurzel', 'chapters fehlt');
if (!Array.isArray(daten.glossary) || daten.glossary.length === 0) F('Wurzel', 'glossary fehlt');
if (!/^\d{4}-\d{2}-\d{2}$/.test(daten.lastUpdated || '')) F('Wurzel', 'lastUpdated fehlt oder kein ISO-Datum');
if (daten.version !== '2.0') F('Wurzel', `version ist „${daten.version}“, erwartet „2.0“`);
if (!/^\d{4}-\d{2}-\d{2}$/.test(daten.bearbeitet || '')) F('Wurzel', 'bearbeitet fehlt oder kein ISO-Datum');

const kapitelIds = new Set();
for (const [ci, c] of (daten.chapters || []).entries()) {
  const ort = `chapters[${ci}]`;
  for (const k of ['id', 'title', 'subtitle', 'icon']) if (!istString(c[k])) F(ort, `${k} fehlt`);
  if (kapitelIds.has(c.id)) F(ort, `Kapitel-id „${c.id}“ doppelt`);
  kapitelIds.add(c.id);
  if ('levels' in c) F(ort, 'chapter.levels ist noch vorhanden');
  if (!Array.isArray(c.subChapters) || c.subChapters.length === 0) { F(ort, 'subChapters fehlt'); continue; }
  if (c.heroStat && typeof c.heroStat.value !== 'number') F(ort, 'heroStat.value ist keine Zahl');
  for (const [qi, q] of (c.quickStats || []).entries()) if (typeof q.value !== 'number' || !istString(q.label)) F(`${ort}.quickStats[${qi}]`, 'value muss Zahl, label String sein');
  const einheitIds = new Set();
  for (const [si, s] of c.subChapters.entries()) {
    const so = `${ort}.subChapters[${si}] (${c.id}/${s.id})`;
    for (const k of ['id', 'title', 'subtitle', 'icon']) if (!istString(s[k])) F(so, `${k} fehlt`);
    if (einheitIds.has(s.id)) F(so, `Einheiten-id „${s.id}“ im Kapitel doppelt`);
    einheitIds.add(s.id);
    if (!Array.isArray(s.level1) || s.level1.length === 0) F(so, 'level1 fehlt oder leer');
    for (const t of TIEFEN) if (s[t] !== undefined && !Array.isArray(s[t])) F(so, `${t} ist kein Array`);
    for (const [qi, q] of (s.quickStats || []).entries()) if (typeof q.value !== 'number' || !istString(q.label)) F(`${so}.quickStats[${qi}]`, 'value muss Zahl, label String sein');
    if (!OHNE_ANREICHERUNG) {
      // Das Vorhandensein prüft Abschnitt 2b (unabhängig von diesem Schalter); hier geht es um Anzahl und Satzbau.
      if (istStringListe(s.kurzgesagt) && (s.kurzgesagt.length < 2 || s.kurzgesagt.length > 4)) F(so, `kurzgesagt hat ${s.kurzgesagt.length} statt 2–4 Sätze`);
      for (const satz of s.kurzgesagt || []) { if (typeof satz !== 'string') continue; if (satz.length > 220) W(so, `kurzgesagt-Satz sehr lang (${satz.length} Zeichen)`); if (!/[.!?]$/.test(satz)) F(so, `kurzgesagt-Satz ohne Satzende: „${satz.slice(0, 40)}…“`); }
      if (istStringListe(s.lernziele) && (s.lernziele.length < 2 || s.lernziele.length > 3)) F(so, `lernziele hat ${s.lernziele.length} statt 2–3 Einträge`);
    }
  }
}

// ---------------------------------------------------------------------------
// 2. Blöcke
// ---------------------------------------------------------------------------
const CALLOUT_VARIANTEN = new Set(['info', 'warning', 'alert-circle', 'tip', 'lightbulb', 'wichtig', 'hinweis', 'tipp']);
const STATUS = new Set(['ja', 'nein', 'teils']);
const TIMELINE_TYPEN = new Set(['regulation', 'crisis', 'market', 'innovation']);
const HTML_TAGS = new Set(['strong', 'code', 'ul', 'li', 'span']);
// Die sieben neuen Blocktypen (ZIELSTRUKTUR §3). Erlaubte Felder je Typ – `fussnote` und
// `untertitel` sind überall optional (Entscheidung 31); alles andere ist ein Schreibfehler.
const NEUE_TYPEN_FELDER = {
  archetypenKarte: ['type', 'title', 'untertitel', 'spalten', 'mitte', 'beziehungen', 'fussnote'],
  stufenTabelle: ['type', 'title', 'untertitel', 'kopf', 'zeilen', 'fussnote'],
  morphologischerKasten: ['type', 'title', 'untertitel', 'dimensionen', 'beispiele', 'fussnote'],
  formelAufbau: ['type', 'title', 'untertitel', 'glieder', 'ergebnis', 'fussnote'],
  simulationGrosseZahlen: ['type', 'title', 'untertitel', 'vorgabe', 'erklaerung', 'fussnote'],
  risikokette: ['type', 'title', 'untertitel', 'stufen', 'fussnote'],
  prozessKette: ['type', 'title', 'untertitel', 'kern', 'support', 'fussnote'],
};
const ARCHETYP_ROLLEN = new Set(['traeger', 'kein-traeger', 'unterstuetzer']);
const ARCHETYP_BEZIEHUNGEN = new Set(['deckt', 'zahlt', 'unterstuetzt']);
const STUFEN_ZEICHEN = new Set(['+', '-', '=']);
const STUFEN_ARTEN = new Set(['zwischensumme', 'endsumme', 'posten']);
const FORMEL_ZEICHEN = new Set(['+', '-', '×', '÷', '=']);
const RECHNER_TYPEN = ['combinedRatioCalc', 'provisionCalc'];
// Entscheidung 7: Die Erklärung einer Quizfrage nennt keine Antwortposition („Antwort B“).
const POSITIONSHINWEIS = /(Antwort|Option|Auswahl)\s*[ABCD]\b|\b[ABCD]\)|(erste|zweite|dritte|vierte|letzte)\s+(Antwort|Option)|Antwort\s*[1-4]\b/i;
const WPM = 200;
const LESEZEIT_GRENZE = 35;
const zaehler = { bloecke: 0, typen: {}, woerter: 0, woerterJeTiefe: { level1: 0, level2: 0, level3: 0 }, zitate: 0, einheiten: 0, kurzgesagt: 0, lernziele: 0 };
const chartKeysGenutzt = new Map();
const treeKeysGenutzt = new Map();
const blockSignaturen = new Map();

function pruefeHtml(s, ort) {
  const tags = [...s.matchAll(/<\/?([a-zA-Z0-9]+)([^>]*)>/g)];
  const stapel = [];
  for (const m of tags) {
    const name = m[1].toLowerCase();
    const schliesst = m[0].startsWith('</');
    if (!HTML_TAGS.has(name)) { F(ort, `HTML-Tag <${name}> nicht erlaubt`); continue; }
    if (!schliesst) {
      const attribute = m[2].trim();
      if (attribute && !(name === 'span' && /^class="v1x1-cite(-num|-tooltip)?"$/.test(attribute))) F(ort, `HTML-Attribut nicht erlaubt: <${name} ${attribute}>`);
      stapel.push(name);
    } else if (stapel.pop() !== name) F(ort, `HTML nicht balanciert bei </${name}>`);
  }
  if (stapel.length) F(ort, `HTML nicht geschlossen: <${stapel.join('>, <')}>`);
  if (/&(?!amp;|lt;|gt;|nbsp;|quot;)[a-z]+;/.test(s)) W(ort, 'HTML-Entity im Text');
}

function pruefeZellen(b, ort, spalten) {
  if (!Array.isArray(b.rows) || b.rows.length === 0) { F(ort, 'rows fehlt'); return; }
  b.rows.forEach((zeile, zi) => {
    if (!Array.isArray(zeile) || zeile.length !== spalten.length) { F(`${ort}.rows[${zi}]`, `Zeile hat ${zeile?.length} Zellen, Kopf ${spalten.length}`); return; }
    zeile.forEach((zelle, zj) => {
      if (typeof zelle === 'string') return;
      if (zelle && typeof zelle === 'object') {
        if (!istString(zelle.text)) F(`${ort}.rows[${zi}][${zj}]`, 'Statuszelle ohne text');
        if (!STATUS.has(zelle.status)) F(`${ort}.rows[${zi}][${zj}]`, `Statuszelle mit ungültigem status „${zelle.status}“`);
        const erlaubt = new Set(['text', 'status']);
        for (const k of Object.keys(zelle)) if (!erlaubt.has(k)) F(`${ort}.rows[${zi}][${zj}]`, `unbekanntes Zellenfeld „${k}“`);
        return;
      }
      F(`${ort}.rows[${zi}][${zj}]`, 'Zelle ist weder String noch Statuszelle');
    });
  });
}

function pruefeBlock(b, ort, c) {
  zaehler.bloecke += 1;
  zaehler.typen[b.type] = (zaehler.typen[b.type] || 0) + 1;
  if (!istString(b.type)) { F(ort, 'type fehlt'); return; }
  if (b.title !== undefined && !istString(b.title)) F(ort, 'title ist kein String');
  const erlaubteFelder = NEUE_TYPEN_FELDER[b.type];
  if (erlaubteFelder) {
    for (const k of Object.keys(b)) if (!erlaubteFelder.includes(k)) F(ort, `Feld „${k}“ gehört nicht zum Typ ${b.type} (erlaubt: ${erlaubteFelder.join(', ')})`);
    for (const k of ['untertitel', 'fussnote']) if (b[k] !== undefined && !istString(b[k])) F(ort, `${k} ist kein String`);
  }
  switch (b.type) {
    case 'paragraph':
      if (b.content !== undefined && typeof b.content !== 'string') F(ort, 'content ist kein String');
      if (!istString(b.title) && !istString(b.content)) F(ort, 'paragraph ohne title und content');
      if (typeof b.content === 'string' && /~\d/.test(b.content)) F(ort, '„~“ vor einer Zahl im Fließtext (im Satz „rund“ schreiben; in Tabellenzellen erlaubt)');
      break;
    case 'callout': {
      const variante = b.icon || b.variant || 'info';
      if (!CALLOUT_VARIANTEN.has(variante)) F(ort, `callout-Variante „${variante}“ unbekannt`);
      if (!istString(b.text) && !istString(b.content)) F(ort, 'callout ohne text/content');
      for (const feld of ['text', 'content']) {
        if (typeof b[feld] === 'string' && /~\d/.test(b[feld])) F(ort, '„~“ vor einer Zahl im Fließtext (im Satz „rund“ schreiben)');
      }
      break;
    }
    case 'table':
      if (!istStringListe(b.headers)) F(ort, 'headers fehlt'); else pruefeZellen(b, ort, b.headers);
      if (b.sortable !== undefined && typeof b.sortable !== 'boolean') F(ort, 'sortable ist kein Boolean');
      break;
    case 'comparisonTable':
      if (!istStringListe(b.columns)) F(ort, 'columns fehlt'); else pruefeZellen(b, ort, b.columns);
      break;
    case 'infoKachelGrid':
      if (!Array.isArray(b.items) || b.items.length === 0) F(ort, 'items fehlt');
      else b.items.forEach((it, i) => { if (!istString(it.title) || !istString(it.description)) F(`${ort}.items[${i}]`, 'title/description fehlt'); if (it.icon !== undefined && !istString(it.icon)) F(`${ort}.items[${i}]`, 'icon ist kein String'); });
      break;
    case 'chartLine': case 'chartBar': case 'chartDonut': {
      const cd = c.chartData?.[b.chartKey];
      if (!cd) { F(ort, `chartKey „${b.chartKey}“ nicht in chartData`); break; }
      chartKeysGenutzt.set(`${c.id}:${b.chartKey}`, true);
      if (!istStringListe(cd.labels)) F(ort, 'chartData.labels fehlt');
      if (!Array.isArray(cd.datasets) || cd.datasets.length === 0) F(ort, 'chartData.datasets fehlt');
      else cd.datasets.forEach((ds, i) => {
        if (!Array.isArray(ds.data) || ds.data.length !== (cd.labels || []).length) F(`${ort}.datasets[${i}]`, 'data-Länge passt nicht zu labels');
        if (!ds.data?.every((x) => typeof x === 'number')) F(`${ort}.datasets[${i}]`, 'data enthält Nicht-Zahlen');
        if (b.type !== 'chartDonut' && !istString(ds.label)) F(`${ort}.datasets[${i}]`, 'label fehlt (dataKey)');
      });
      break;
    }
    case 'timeline':
      if (!Array.isArray(b.events) || b.events.length === 0) F(ort, 'events fehlt');
      else b.events.forEach((e, i) => { if (!istString(e.year) || !istString(e.title) || !istString(e.description)) F(`${ort}.events[${i}]`, 'year/title/description fehlt'); if (e.type && !TIMELINE_TYPEN.has(e.type)) F(`${ort}.events[${i}]`, `type „${e.type}“ unbekannt`); });
      break;
    case 'heatmapGrid':
      if (!istStringListe(b.rows) || !istStringListe(b.columns)) F(ort, 'rows/columns fehlt');
      else if (!Array.isArray(b.data) || b.data.length !== b.rows.length || !b.data.every((z) => Array.isArray(z) && z.length === b.columns.length && z.every((x) => typeof x === 'number'))) F(ort, 'data passt nicht zu rows × columns');
      break;
    case 'regulatoryPyramid':
      if (!Array.isArray(b.levels) || b.levels.length === 0) F(ort, 'levels fehlt');
      else b.levels.forEach((l, i) => { if (!istString(l.label) || !istStringListe(l.items)) F(`${ort}.levels[${i}]`, 'label/items fehlt'); });
      break;
    case 'valueChain':
      if (!Array.isArray(b.steps) || b.steps.length === 0) F(ort, 'steps fehlt');
      else b.steps.forEach((s, i) => { if (!istString(s.id) || !istString(s.label) || !istString(s.description)) F(`${ort}.steps[${i}]`, 'id/label/description fehlt'); });
      break;
    case 'combinedRatioCalc': case 'provisionCalc':
      break;
    case 'trendRadar': {
      const cd = c.chartData?.[b.chartKey];
      if (!cd) { F(ort, `chartKey „${b.chartKey}“ nicht in chartData`); break; }
      chartKeysGenutzt.set(`${c.id}:${b.chartKey}`, true);
      const ringe = cd.rings || ['Adopt', 'Trial', 'Assess', 'Hold'];
      if (!istStringListe(cd.segments) || !Array.isArray(cd.items)) F(ort, 'segments/items fehlt');
      else cd.items.forEach((it, i) => { if (!istString(it.label) || !(it.ring >= 0 && it.ring < ringe.length) || !(it.segment >= 0 && it.segment < cd.segments.length)) F(`${ort}.items[${i}]`, 'label/ring/segment ungültig'); });
      break;
    }
    case 'networkGraph': case 'sankey': {
      const cd = c.chartData?.[b.chartKey];
      if (!cd) { F(ort, `chartKey „${b.chartKey}“ nicht in chartData`); break; }
      chartKeysGenutzt.set(`${c.id}:${b.chartKey}`, true);
      const knoten = new Set((cd.nodes || []).map((n) => n.id));
      if (knoten.size === 0) F(ort, 'nodes fehlt');
      (cd.nodes || []).forEach((n, i) => { if (!istString(n.id) || !istString(n.label)) F(`${ort}.nodes[${i}]`, 'id/label fehlt'); });
      (cd.links || []).forEach((l, i) => {
        if (!knoten.has(l.source) || !knoten.has(l.target)) F(`${ort}.links[${i}]`, `source/target „${l.source}→${l.target}“ nicht auflösbar`);
        if (b.type === 'sankey' && typeof l.value !== 'number') F(`${ort}.links[${i}]`, 'value fehlt');
      });
      break;
    }
    case 'decisionTree': {
      const baum = c.decisionTrees?.[b.treeKey];
      if (!baum) { F(ort, `treeKey „${b.treeKey}“ nicht in decisionTrees`); break; }
      treeKeysGenutzt.set(`${c.id}:${b.treeKey}`, true);
      if (!baum.nodes?.[baum.start]) F(ort, `start „${baum.start}“ fehlt`);
      for (const [id, k] of Object.entries(baum.nodes || {})) {
        if (k.result) { if (!istString(k.title) || !istStringListe(k.items)) F(`${ort}.nodes.${id}`, 'Ergebnisknoten ohne title/items'); continue; }
        if (!istString(k.question) || !Array.isArray(k.options) || k.options.length === 0) F(`${ort}.nodes.${id}`, 'Frageknoten ohne question/options');
        for (const o of k.options || []) if (!istString(o.label) || !baum.nodes[o.next]) F(`${ort}.nodes.${id}`, `Option „${o.label}“ zeigt auf fehlenden Knoten „${o.next}“`);
      }
      break;
    }
    // --- die sieben neuen Typen der ZIELSTRUKTUR §3 (Entscheidungen 30, 31, 37) ---
    case 'archetypenKarte': {
      const knoten = new Set();
      if (!Array.isArray(b.spalten) || b.spalten.length === 0) F(ort, 'spalten fehlt');
      else b.spalten.forEach((sp, i) => {
        if (!istString(sp.titel)) F(`${ort}.spalten[${i}]`, 'titel fehlt');
        else knoten.add(sp.titel);
        if (sp.hinweis !== undefined && !istString(sp.hinweis)) F(`${ort}.spalten[${i}]`, 'hinweis ist kein String');
        if (!Array.isArray(sp.gruppen) || sp.gruppen.length === 0) F(`${ort}.spalten[${i}]`, 'gruppen fehlt');
        else sp.gruppen.forEach((g, j) => {
          if (!istString(g.titel) || !istString(g.text)) F(`${ort}.spalten[${i}].gruppen[${j}]`, 'titel/text fehlt');
          else knoten.add(g.titel);
          if (g.rolle !== undefined && !ARCHETYP_ROLLEN.has(g.rolle)) F(`${ort}.spalten[${i}].gruppen[${j}]`, `rolle „${g.rolle}“ unbekannt`);
        });
      });
      if (!b.mitte || !istString(b.mitte.titel) || !istString(b.mitte.text)) F(ort, 'mitte mit titel und text fehlt');
      else knoten.add(b.mitte.titel);
      if (b.beziehungen !== undefined && !Array.isArray(b.beziehungen)) F(ort, 'beziehungen ist kein Array');
      else (b.beziehungen || []).forEach((bz, i) => {
        if (!ARCHETYP_BEZIEHUNGEN.has(bz.art)) F(`${ort}.beziehungen[${i}]`, `art „${bz.art}“ unbekannt`);
        for (const k of ['von', 'nach']) if (!knoten.has(bz[k])) F(`${ort}.beziehungen[${i}]`, `${k} „${bz[k]}“ ist keine Gruppe, Spalte oder Mitte dieser Karte`);
      });
      break;
    }
    case 'stufenTabelle':
      if (!istStringListe(b.kopf, 2) || b.kopf.length !== 2) F(ort, 'kopf braucht genau zwei Spalten (Zeile, Bedeutung)');
      if (!Array.isArray(b.zeilen) || b.zeilen.length === 0) F(ort, 'zeilen fehlt');
      else {
        b.zeilen.forEach((z, i) => {
          if (!STUFEN_ZEICHEN.has(z.zeichen)) F(`${ort}.zeilen[${i}]`, `zeichen „${z.zeichen}“ ungültig (erlaubt: + - =)`);
          if (!istString(z.text) || !istString(z.bedeutung)) F(`${ort}.zeilen[${i}]`, 'text/bedeutung fehlt');
          if (z.art !== undefined && !STUFEN_ARTEN.has(z.art)) F(`${ort}.zeilen[${i}]`, `art „${z.art}“ unbekannt`);
          if (z.formel !== undefined && !istString(z.formel)) F(`${ort}.zeilen[${i}]`, 'formel ist kein String');
          if (z.zeichen === '=' && z.art !== 'zwischensumme' && z.art !== 'endsumme') F(`${ort}.zeilen[${i}]`, 'Zeile mit „=“ muss art zwischensumme oder endsumme tragen');
        });
        if (!b.zeilen.some((z) => z.art === 'endsumme')) F(ort, 'keine Zeile mit art „endsumme“ – das Rechenschema hat kein Ergebnis');
      }
      break;
    case 'morphologischerKasten': {
      const dimensionen = new Map();
      if (!Array.isArray(b.dimensionen) || b.dimensionen.length === 0) F(ort, 'dimensionen fehlt');
      else b.dimensionen.forEach((dm, i) => {
        if (!istString(dm.id) || !istString(dm.titel)) F(`${ort}.dimensionen[${i}]`, 'id/titel fehlt');
        if (dimensionen.has(dm.id)) F(`${ort}.dimensionen[${i}]`, `id „${dm.id}“ doppelt`);
        const optionen = new Set();
        if (!Array.isArray(dm.optionen) || dm.optionen.length === 0) F(`${ort}.dimensionen[${i}]`, 'optionen fehlt');
        else dm.optionen.forEach((o, j) => {
          if (!istString(o.id) || !istString(o.label)) F(`${ort}.dimensionen[${i}].optionen[${j}]`, 'id/label fehlt');
          if (optionen.has(o.id)) F(`${ort}.dimensionen[${i}].optionen[${j}]`, `id „${o.id}“ in dieser Dimension doppelt`);
          if (o.gruppe !== undefined && !istString(o.gruppe)) F(`${ort}.dimensionen[${i}].optionen[${j}]`, 'gruppe ist kein String');
          optionen.add(o.id);
        });
        dimensionen.set(dm.id, optionen);
      });
      const beispielIds = new Set();
      if (!Array.isArray(b.beispiele) || b.beispiele.length === 0) F(ort, 'beispiele fehlt');
      else b.beispiele.forEach((bs, i) => {
        const bo = `${ort}.beispiele[${i}]`;
        if (!istString(bs.id) || !istString(bs.titel) || !istString(bs.text)) F(bo, 'id/titel/text fehlt');
        if (beispielIds.has(bs.id)) F(bo, `id „${bs.id}“ doppelt`);
        beispielIds.add(bs.id);
        if (!bs.auswahl || typeof bs.auswahl !== 'object') F(bo, 'auswahl fehlt');
        else for (const [dim, wert] of Object.entries(bs.auswahl)) {
          const optionen = dimensionen.get(dim);
          if (!optionen) { F(bo, `auswahl nennt die Dimension „${dim}“, die es nicht gibt`); continue; }
          for (const o of Array.isArray(wert) ? wert : [wert]) if (!optionen.has(o)) F(bo, `auswahl.${dim}: „${o}“ ist keine Option dieser Dimension`);
        }
        if (bs.ergebnis !== undefined && (!istString(bs.ergebnis.titel) || !istStringListe(bs.ergebnis.punkte))) F(bo, 'ergebnis braucht titel und punkte');
      });
      break;
    }
    case 'formelAufbau':
      if (!Array.isArray(b.glieder) || b.glieder.length === 0) F(ort, 'glieder fehlt');
      else b.glieder.forEach((g, i) => {
        if (!FORMEL_ZEICHEN.has(g.zeichen)) F(`${ort}.glieder[${i}]`, `zeichen „${g.zeichen}“ ist kein reiner Operator (+ - × ÷ =)`);
        if (!istString(g.name) || !istString(g.text)) F(`${ort}.glieder[${i}]`, 'name/text fehlt');
        if (g.beispiel !== undefined && !istString(g.beispiel)) F(`${ort}.glieder[${i}]`, 'beispiel ist kein String');
      });
      if (!b.ergebnis || !istString(b.ergebnis.name) || !istString(b.ergebnis.text)) F(ort, 'ergebnis mit name und text fehlt');
      break;
    case 'simulationGrosseZahlen': {
      const v = b.vorgabe;
      if (!v || typeof v !== 'object') { F(ort, 'vorgabe fehlt'); break; }
      for (const k of ['kollektiv', 'wahrscheinlichkeit', 'schadenhoehe']) if (typeof v[k] !== 'number' || !Number.isFinite(v[k])) F(ort, `vorgabe.${k} fehlt oder ist keine Zahl`);
      if (Number.isFinite(v.kollektiv) && (!Number.isInteger(v.kollektiv) || v.kollektiv < 1)) F(ort, 'vorgabe.kollektiv ist keine Anzahl von Verträgen ≥ 1');
      if (Number.isFinite(v.wahrscheinlichkeit) && (v.wahrscheinlichkeit <= 0 || v.wahrscheinlichkeit > 100)) F(ort, `vorgabe.wahrscheinlichkeit ${v.wahrscheinlichkeit} liegt nicht zwischen 0 und 100 (Prozentwert, 1 = 1 %)`);
      else if (Number.isFinite(v.wahrscheinlichkeit) && v.wahrscheinlichkeit < 0.1) F(ort, `vorgabe.wahrscheinlichkeit ${v.wahrscheinlichkeit} sieht nach einem Anteil aus (0,01 statt 1); erwartet ist ein Prozentwert, 1 = 1 % (Entscheidung 37)`);
      if (Number.isFinite(v.schadenhoehe) && v.schadenhoehe <= 0) F(ort, 'vorgabe.schadenhoehe muss größer als 0 sein');
      for (const k of Object.keys(v)) if (!['kollektiv', 'wahrscheinlichkeit', 'schadenhoehe'].includes(k)) F(ort, `vorgabe hat das unbekannte Feld „${k}“`);
      if (!istStringListe(b.erklaerung, 2)) F(ort, 'erklaerung fehlt oder hat weniger als zwei Sätze');
      break;
    }
    case 'risikokette':
      if (!Array.isArray(b.stufen) || b.stufen.length < 2) F(ort, 'stufen fehlt oder hat weniger als zwei Stufen');
      else b.stufen.forEach((st, i) => {
        if (!istString(st.titel) || !istString(st.text)) F(`${ort}.stufen[${i}]`, 'titel/text fehlt');
        // `uebergang` beschriftet den Pfeil zur nächsten Stufe (Rückfall im
        // Renderer: „reicht Risiko weiter“); die letzte Stufe hat keinen Pfeil.
        for (const k of ['traegt', 'beispiel', 'uebergang']) if (st[k] !== undefined && !istString(st[k])) F(`${ort}.stufen[${i}]`, `${k} ist kein String`);
        for (const k of Object.keys(st)) if (!['titel', 'text', 'traegt', 'beispiel', 'uebergang'].includes(k)) F(`${ort}.stufen[${i}]`, `unbekanntes Feld „${k}“`);
        if (i === b.stufen.length - 1 && st.uebergang !== undefined) F(`${ort}.stufen[${i}]`, 'letzte Stufe hat einen uebergang, dort steht aber kein Pfeil');
      });
      break;
    case 'prozessKette': {
      const ids = new Set();
      if (!Array.isArray(b.kern) || b.kern.length === 0) F(ort, 'kern fehlt');
      else b.kern.forEach((k, i) => {
        const ko = `${ort}.kern[${i}]`;
        if (!istString(k.id) || !istString(k.titel) || !istString(k.text)) F(ko, 'id/titel/text fehlt');
        if (ids.has(k.id)) F(ko, `id „${k.id}“ doppelt`);
        ids.add(k.id);
        if (k.aufgaben !== undefined && !istStringListe(k.aufgaben)) F(ko, 'aufgaben ist keine Liste von Sätzen');
        if (k.projektfelder !== undefined && !istStringListe(k.projektfelder)) F(ko, 'projektfelder ist keine Liste von Sätzen');
        if (k.kennzahlen !== undefined && !Array.isArray(k.kennzahlen)) F(ko, 'kennzahlen ist kein Array');
        else (k.kennzahlen || []).forEach((kz, j) => { if (!istString(kz.label) || !istString(kz.wert)) F(`${ko}.kennzahlen[${j}]`, 'label/wert fehlt'); });
        for (const kk of Object.keys(k)) if (!['id', 'titel', 'text', 'aufgaben', 'kennzahlen', 'projektfelder'].includes(kk)) F(ko, `unbekanntes Feld „${kk}“`);
      });
      if (!Array.isArray(b.support) || b.support.length === 0) F(ort, 'support fehlt');
      else b.support.forEach((sp, i) => { if (!istString(sp.titel) || !istString(sp.text)) F(`${ort}.support[${i}]`, 'titel/text fehlt'); });
      break;
    }
    default:
      F(ort, `Blocktyp „${b.type}“ unbekannt`);
  }
  for (const feld of ['content', 'text']) if (typeof b[feld] === 'string' && /<[a-z]/i.test(b[feld])) pruefeHtml(b[feld], ort);
  // In den neuen Typen steht Text auch in verschachtelten Feldern (kern[].text, zeilen[].bedeutung …).
  if (NEUE_TYPEN_FELDER[b.type]) alleStrings(b, (str, pfad, k) => { if (!TECHNISCHE_SCHLUESSEL.has(k) && /<[a-z]/i.test(str)) pruefeHtml(str, `${ort}.${pfad}`); });
  for (const zeile of b.rows || []) for (const zelle of zeile) { const t = typeof zelle === 'string' ? zelle : zelle?.text; if (typeof t === 'string' && /<[a-z]/i.test(t)) pruefeHtml(t, ort); }
  // Wörter und Zitate
  const sig = JSON.stringify(b);
  if (blockSignaturen.has(sig) && !['combinedRatioCalc', 'provisionCalc'].includes(b.type)) F(ort, `byteidentisch mit ${blockSignaturen.get(sig)}`);
  blockSignaturen.set(sig, ort);
}

for (const [ci, c] of (daten.chapters || []).entries()) {
  for (const [si, s] of (c.subChapters || []).entries()) {
    zaehler.einheiten += 1;
    if (istStringListe(s.kurzgesagt)) zaehler.kurzgesagt += 1;
    if (istStringListe(s.lernziele)) zaehler.lernziele += 1;
    for (const t of TIEFEN) (s[t] || []).forEach((b, bi) => {
      const ort = `${c.id}/${s.id}.${t}[${bi}]`;
      pruefeBlock(b, ort, c);
      let w = 0;
      alleStrings(b, (str, pfad, k) => { if (!TECHNISCHE_SCHLUESSEL.has(k)) w += woerter(str); if (k === 'content' || k === 'text') zaehler.zitate += (str.match(CITE_RE) || []).length; });
      zaehler.woerter += w;
      zaehler.woerterJeTiefe[t] += w;
    });
  }
  for (const k of Object.keys(c.chartData || {})) if (!chartKeysGenutzt.has(`${c.id}:${k}`)) W(`${c.id}.chartData.${k}`, 'wird von keinem Block verwendet');
  for (const k of Object.keys(c.decisionTrees || {})) if (!treeKeysGenutzt.has(`${c.id}:${k}`)) W(`${c.id}.decisionTrees.${k}`, 'wird von keinem Block verwendet');
}

// ---------------------------------------------------------------------------
// 2b. Zusatzprüfungen: Anreicherung, Rechner, Lesezeit je Kapitel
// ---------------------------------------------------------------------------
// (a) Jede Lerneinheit trägt kurzgesagt und lernziele – unabhängig von --ohne-anreicherung.
for (const c of daten.chapters || []) for (const s of c.subChapters || []) {
  const so = `${c.id}/${s.id}`;
  if (!istStringListe(s.kurzgesagt)) F(so, 'kurzgesagt fehlt (jede Lerneinheit braucht Kernaussagen)');
  if (!istStringListe(s.lernziele)) F(so, 'lernziele fehlen (jede Lerneinheit braucht Lernziele)');
}
// Rechnerblöcke je genau einmal im ganzen Werk (Entscheidung 32; die Dublettenprüfung nimmt sie aus).
const rechnerOrte = Object.fromEntries(RECHNER_TYPEN.map((t) => [t, []]));
for (const c of daten.chapters || []) for (const s of c.subChapters || []) for (const t of TIEFEN) (s[t] || []).forEach((b, i) => {
  if (rechnerOrte[b.type]) rechnerOrte[b.type].push(`${c.id}/${s.id}.${t}[${i}]`);
});
for (const [typ, orte] of Object.entries(rechnerOrte)) {
  if (orte.length === 0) F('Rechner', `${typ} kommt nicht vor`);
  else if (orte.length > 1) F('Rechner', `${typ} kommt ${orte.length}× vor (${orte.join(', ')}), erwartet genau einmal`);
}
// (b) Lesezeit je Kapitel in der Basis-Tiefe: Warnung ab 35 Minuten (Entscheidung 11).
const lesezeitBasis = [];
for (const c of daten.chapters || []) {
  let minuten = 0;
  for (const s of c.subChapters || []) {
    let w = 0;
    for (const b of s.level1 || []) alleStrings(b, (str, pfad, k) => { if (!TECHNISCHE_SCHLUESSEL.has(k)) w += woerter(str); });
    if (w) minuten += Math.max(1, Math.ceil(w / WPM));
  }
  lesezeitBasis.push({ id: c.id, minuten });
  if (minuten > LESEZEIT_GRENZE) W(c.id, `Basis-Lesezeit ${minuten} Minuten über der Grenze von ${LESEZEIT_GRENZE} – Stoff nach level2/level3 verschieben`);
}

// ---------------------------------------------------------------------------
// 3. Quiz
// ---------------------------------------------------------------------------
let fragen = 0;
let fragenMitEinheit = 0;
const positionen = {};
let laengsteRichtig = 0;
for (const [ci, c] of (daten.chapters || []).entries()) {
  const einheitIds = new Set((c.subChapters || []).map((s) => s.id));
  const gesehen = new Set();
  for (const [qi, q] of (c.quiz || []).entries()) {
    const ort = `${c.id}.quiz[${qi}]`;
    fragen += 1;
    if (!istString(q.question)) F(ort, 'question fehlt');
    if (!istStringListe(q.options, 3) || q.options.length > 4) F(ort, 'options müssen 3–4 Strings sein');
    if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct >= (q.options || []).length) F(ort, `correct „${q.correct}“ ungültig`);
    else { positionen[q.correct] = (positionen[q.correct] || 0) + 1; if (q.options.every((o, i) => i === q.correct || o.length < q.options[q.correct].length)) laengsteRichtig += 1; }
    if (!istString(q.explanation)) F(ort, 'explanation fehlt');
    else if (POSITIONSHINWEIS.test(q.explanation)) F(ort, `explanation nennt eine Antwortposition: „${q.explanation.slice(0, 60)}…“`);
    if (q.einheitId !== undefined) { if (!einheitIds.has(q.einheitId)) F(ort, `einheitId „${q.einheitId}“ existiert nicht in ${c.id}`); else fragenMitEinheit += 1; }
    const norm = entferneHtml(q.question || '').toLowerCase();
    if (gesehen.has(norm)) F(ort, 'Frage doppelt'); gesehen.add(norm);
  }
}

// ---------------------------------------------------------------------------
// 4. Glossar
// ---------------------------------------------------------------------------
const TAG_VOKABULAR = new Set(['Markt', 'Produkte', 'Vertrieb', 'Regulatorik', 'Finanzen', 'PKV', 'Zukunft']);
const slugs = new Set();
const terme = new Set();
(daten.glossary || []).forEach((g, i) => {
  const ort = `glossary[${i}] (${g.term})`;
  if (!istString(g.term) || !istString(g.definition)) F(ort, 'term/definition fehlt');
  if (!istStringListe(g.tags)) F(ort, 'tags fehlen'); else for (const t of g.tags) if (!TAG_VOKABULAR.has(t)) F(ort, `Tag „${t}“ nicht im Vokabular`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(g.slug || '')) F(ort, `slug „${g.slug}“ fehlt oder nicht ASCII`);
  if (slugs.has(g.slug)) F(ort, `slug „${g.slug}“ doppelt`); slugs.add(g.slug);
  const t = (g.term || '').toLowerCase();
  if (terme.has(t)) F(ort, 'term doppelt'); terme.add(t);
});
for (let i = 1; i < (daten.glossary || []).length; i += 1) if (daten.glossary[i - 1].term.localeCompare(daten.glossary[i].term, 'de', { sensitivity: 'base' }) > 0) { W('glossary', `nicht alphabetisch sortiert bei „${daten.glossary[i].term}“`); break; }

// ---------------------------------------------------------------------------
// 5. Formatregeln auf allen sichtbaren Strings
// ---------------------------------------------------------------------------
const FORMATPRUEFUNGEN = [
  ['Emoji', /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u],
  ['„€“ vor Zahl', /€\s?\d/],
  ['Geviertstrich „—“', /—/],
  ['falsch geschlossenes Anführungszeichen „…"', /„[^“]*"/],
  ['gerades Anführungszeichen im Text', /"/],
  ['einfaches gerades Anführungszeichen (außer Apostroph wie Moody\'s)', /(?<![\p{L}])'|'(?!s(?![\p{L}]))/u],
  ['Prozent/Promille ohne geschütztes Leerzeichen', /\d[ ]?[%‰]/],
  ['„EUR“ statt „€“', /\bEUR\b/],
  ['„Mrd. $“', /Mrd\. \$/],
  ['Größenordnung ohne geschütztes Leerzeichen', /\d[ ](Mrd\.|Mio\.|Bio\.|Tsd\.)|(Mrd\.|Mio\.|Bio\.|Tsd\.)[ ](€|USD)/],
  ['Abkürzung ohne geschütztes Leerzeichen (z.B., u.a., d.h.)', /\b(z\.\s?B|u\.\s?a|d\.\s?h)\.(?<!z\. B\.)(?<!u\. a\.)(?<!d\. h\.)/],
  ['Paragraph ohne geschütztes Leerzeichen', /§§?[ ]?\d/],
  ['Bereich mit Bindestrich', /\d-\d/],
  ['Hyphen-Minus vor Zahl', /(^|[\s(])-\d/],
  // Weiche Trennstriche (U+00AD) sind erlaubt — aber nur im Wortinneren; am
  // Wortrand trennen sie nichts und sind nur unsichtbarer Müll im Suchindex.
  ['weicher Trennstrich nicht im Wortinneren', /(?<!\p{L})\u00ad|\u00ad(?!\p{L})/u],
];
let stringsGeprueft = 0;
alleStrings(daten, (s, pfad, k) => {
  if (TECHNISCHE_SCHLUESSEL.has(k)) return;
  stringsGeprueft += 1;
  const t = sichtbar(s);
  for (const [name, re] of FORMATPRUEFUNGEN) {
    const m = t.match(re);
    if (m) F(pfad, `${name}: „…${t.slice(Math.max(0, m.index - 25), m.index + 30)}…“`);
  }
  if (/„/.test(t) || /“/.test(t)) { const auf = (t.match(/„/g) || []).length; const zu = (t.match(/“/g) || []).length; if (auf !== zu) F(pfad, `Anführungszeichen unausgeglichen (${auf} „ / ${zu} “)`); }
});

// ---------------------------------------------------------------------------
// 6. Gerettete Blöcke sichtbar (07-details.txt)
// ---------------------------------------------------------------------------
const GERETTET = ['Die klassische Kapitallebensversicherung verliert', 'Überschussbeteiligung speist sich aus drei Quellen', 'Sterbegeldversicherung als Nischenprodukt',
  'Lebensversicherung in Zahlen (2024)', 'Die BU-Versicherung als Goldstandard', 'Leistungsquoten widerlegen das Vorurteil der Nicht-Zahlung', 'Seit 2001 gibt es keinen gesetzlichen BU-Schutz',
  'Alternativen zur BU für schwer versicherbare Berufe', 'Marktdurchdringung BU', 'Technische Versicherungen und Transportschutz', 'Die Betriebsunterbrechungsversicherung ersetzt',
  'Technische Versicherungen (Maschinen-', 'Vorvertragliche Anzeigepflicht', 'Aufsicht durch BaFin und Solvency II', 'Der Sicherungsfonds Protektor', 'Kostenstrukturen und Prämiensteuerung',
  'Wartezeiten gelten in der PKV', 'Standardausschlüsse und Obliegenheiten', 'Obliegenheiten gliedern sich', 'Fazit: Ein Markt zwischen Tradition und Transformation',
  'Drei strukturelle Entwicklungen prägen', 'Vertreter und Makler im Vergleich', 'In der Praxis liegen die Netto-Vergütungssätze', 'Cat Bonds erreichen Rekordhöhen'];
const kennungen = [];
for (const c of daten.chapters || []) for (const s of c.subChapters || []) for (const t of TIEFEN) for (const b of s[t] || []) kennungen.push(entferneHtml(b.title || b.content || b.text || ''));
for (const g of GERETTET) if (!kennungen.some((k) => k.startsWith(g))) F('Rettung', `Block „${g}“ nicht sichtbar`);

// ---------------------------------------------------------------------------
// Ausgabe
// ---------------------------------------------------------------------------
if (!STILL) {
  console.log(`Datei: ${DATEI}`);
  console.log(`Bytes ${Buffer.byteLength(roh)} | Kapitel ${daten.chapters?.length} | Lerneinheiten ${zaehler.einheiten} | Blöcke ${zaehler.bloecke} | Wörter ${zaehler.woerter} (L1 ${zaehler.woerterJeTiefe.level1}, L2 ${zaehler.woerterJeTiefe.level2}, L3 ${zaehler.woerterJeTiefe.level3}) | Quellenverweise ${zaehler.zitate}`);
  console.log(`Quizfragen ${fragen} (mit einheitId ${fragenMitEinheit}; richtige Position ${JSON.stringify(positionen)}; richtige = längste Option ${laengsteRichtig}) | Glossar ${daten.glossary?.length} | kurzgesagt ${zaehler.kurzgesagt}/${zaehler.einheiten} | lernziele ${zaehler.lernziele}/${zaehler.einheiten}`);
  console.log(`Blocktypen: ${Object.entries(zaehler.typen).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', ')}`);
  console.log(`Basis-Lesezeit je Kapitel: ${lesezeitBasis.map((l) => `${l.id} ${l.minuten}`).join(' · ')} (Grenze ${LESEZEIT_GRENZE} Min.)`);
  console.log(`Strings geprüft: ${stringsGeprueft}`);
  for (const w of warnungen) console.log(`WARNUNG ${w}`);
  for (const f of fehler) console.log(`FEHLER ${f}`);
}
console.log(`${fehler.length} Fehler, ${warnungen.length} Warnungen`);
process.exit(fehler.length ? 1 : 0);
