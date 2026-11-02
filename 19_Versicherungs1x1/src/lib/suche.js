// ===========================================================================
// suche.js — Volltextindex und Anfrage-Auswertung der Befehlspalette.
//
// Reine Funktionen ohne React und ohne DOM (auch aus Node prüfbar). Der
// Index wird einmal je Datenstand gebaut (WeakMap-Cache auf `daten`) und
// enthält Kapitel, Lerneinheiten, Blöcke (Titel + Klartext je Block, mit
// blockId für den Sprung zur Fundstelle), Glossar und Werkzeuge.
//
// Normalisierung: Kleinschreibung, ä→ae, ö→oe, ü→ue, ß→ss, Diakritika
// entfernt — mit Positionskarte zurück auf den Originaltext, damit Treffer
// im Original hervorgehoben werden können („Rückversicherer“ = „rueck…“).
// Mehrwort-Anfragen sind UND-Anfragen; Präfix (Wortanfang) zählt mehr als
// Teilwort. Gewichtung Titel > Glossarbegriff > Blocktitel > Absatztext.
// ===========================================================================
import { blockText, entferneHtml, nummer } from './text.js';
import { alleBloecke, blockTitel, hatEigenenTitel, tiefeFuerStufe } from './bloecke.js';
import { slugFuerBegriff } from './begriffe.js';
import { lade, speichere, entferne, SCHLUESSEL } from './speicher.js';

/** Gruppen der Trefferliste in Anzeigereihenfolge mit Deckelung. */
export const GRUPPEN = [
  { typ: 'zuletzt', titel: 'Zuletzt gesucht', max: 5 },
  { typ: 'aktion', titel: 'Vorschläge', titelSuche: 'Aktionen', max: 4 },
  { typ: 'kapitel', titel: 'Kapitel', max: 3 },
  { typ: 'einheit', titel: 'Lerneinheiten', max: 5 },
  { typ: 'glossar', titel: 'Glossar', max: 5 },
  { typ: 'werkzeug', titel: 'Werkzeuge', max: 6 },
  { typ: 'inhalt', titel: 'Inhalte', max: 8 },
];

/** Grundgewichte je Typ: Treffer im Titel bzw. im Text. */
const GEWICHT = {
  kapitel: { titel: 100, text: 40 },
  einheit: { titel: 90, text: 40 },
  glossar: { titel: 80, text: 25 },
  werkzeug: { titel: 70, text: 30 },
  aktion: { titel: 70, text: 30 },
  inhalt: { titel: 60, text: 30 },
  zuletzt: { titel: 60, text: 30 },
};

/** Blocktypen, die als Werkzeuge geführt werden, mit Kurzbezeichnung. */
export const WERKZEUG_TYPEN = {
  combinedRatioCalc: 'Rechner',
  provisionCalc: 'Rechner',
  trendRadar: 'Radar',
  decisionTree: 'Entscheidungsbaum',
};

const ART_NAMEN = {
  paragraph: 'Absatz', table: 'Tabelle', comparisonTable: 'Vergleich', callout: 'Hinweis',
  chartLine: 'Diagramm', chartBar: 'Diagramm', chartDonut: 'Diagramm', timeline: 'Zeitleiste',
  infoKachelGrid: 'Überblick', heatmapGrid: 'Heatmap', regulatoryPyramid: 'Ebenen',
  valueChain: 'Wertschöpfungskette', networkGraph: 'Netzwerk', sankey: 'Flussdiagramm',
};

const MAX_TEXT = 4000;
const KONTEXT = 60;

// ---------------------------------------------------------------- Faltung

const UMLAUTE = { 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss' };
const KOMBINIEREND = /[̀-ͯ]/g;

/**
 * Faltet einen Text wie die Faltung in text.js, liefert aber zusätzlich eine
 * Karte von jeder gefalteten Position auf den Index im Original (Länge
 * gefaltet + 1, letzter Eintrag = Originallänge). `karte` ist null, wenn
 * Original und Faltung Zeichen für Zeichen gleich lang sind.
 * @param {string} text
 * @returns {{ gefaltet: string, karte: Uint32Array|null }}
 */
export function falteMitKarte(text) {
  const s = String(text ?? '');
  let gefaltet = '';
  let karte = null;
  let versetzt = false;
  const positionen = [];
  for (let i = 0; i < s.length; i += 1) {
    const z = s[i];
    let f = z.toLowerCase();
    if (UMLAUTE[f]) f = UMLAUTE[f];
    else if (f.charCodeAt(0) > 127) f = f.normalize('NFD').replace(KOMBINIEREND, '');
    if (f.length !== 1) versetzt = true;
    for (let j = 0; j < f.length; j += 1) positionen.push(i);
    gefaltet += f;
  }
  if (versetzt) {
    karte = new Uint32Array(positionen.length + 1);
    for (let i = 0; i < positionen.length; i += 1) karte[i] = positionen[i];
    karte[positionen.length] = s.length;
  }
  return { gefaltet, karte };
}

/** Nur die Faltung (für Anfragewörter). */
export function falteWort(text) {
  return falteMitKarte(text).gefaltet;
}

/** Gefaltetes Intervall [a, b) → Intervall im Originaltext. */
function originalBereich(karte, a, b) {
  if (!karte) return [a, b];
  const start = karte[a];
  const ende = b > a ? karte[b - 1] + 1 : start;
  return [start, ende];
}

function istWortzeichen(z) {
  return z != null && /[\p{L}\p{N}]/u.test(z);
}

/**
 * Zerlegt die Eingabe in gefaltete Suchwörter (leer bei leerer Eingabe).
 * @param {string} anfrage
 * @returns {string[]}
 */
export function anfrageWoerter(anfrage) {
  return String(anfrage ?? '')
    .split(/\s+/)
    .map((w) => falteWort(w).replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ''))
    .filter((w) => w.length > 0);
}

// ---------------------------------------------------------------- Index

function feld(text) {
  const rein = entferneHtml(text).slice(0, MAX_TEXT);
  const { gefaltet, karte } = falteMitKarte(rein);
  return { text: rein, gefaltet, karte };
}

/** Baut einen Indexeintrag; auch für Zusatzeinträge der Palette (Aktionen). */
export function neuerEintrag(typ, felder) {
  const titel = feld(felder.titel || '');
  const text = feld(felder.text || '');
  const extra = falteWort(felder.extra || '');
  return {
    id: felder.id,
    typ,
    titel: titel.text,
    text: text.text,
    pfad: felder.pfad || '',
    art: felder.art || null,
    route: felder.route || null,
    kapitelId: felder.kapitelId || null,
    einheitId: felder.einheitId || null,
    blockId: felder.blockId || null,
    slug: felder.slug || null,
    tiefe: felder.tiefe || null,
    _titel: titel,
    _text: text,
    _extra: extra,
  };
}

/**
 * Baut den Index aus den geladenen Daten. `glossar` ist die sortierte Liste
 * des Stores (mit slug); fehlt ein slug, wird er nach derselben Regel
 * erzeugt wie im Store (slugFuerBegriff).
 * @param {object} daten chapters.json
 * @param {Array} [glossar]
 * @returns {{ eintraege: object[], werkzeuge: object[] }}
 */
export function baueIndex(daten, glossar) {
  const eintraege = [];
  const werkzeuge = [];
  const kapitelListe = daten && Array.isArray(daten.chapters) ? daten.chapters : [];

  kapitelListe.forEach((k, ki) => {
    const nr = nummer(ki);
    const einheiten = k.subChapters || [];
    const erste = einheiten[0];
    eintraege.push(neuerEintrag('kapitel', {
      id: `kapitel:${k.id}`,
      titel: k.title,
      text: k.subtitle,
      extra: `${nr} kapitel ${nr}`,
      pfad: `Kapitel ${nr} · ${einheiten.length} ${einheiten.length === 1 ? 'Lerneinheit' : 'Lerneinheiten'}`,
      route: { name: 'kapitel', kapitelId: k.id, einheitId: erste ? erste.id : null, blockId: null, slug: null },
      kapitelId: k.id,
    }));

    for (const e of einheiten) {
      const pfadEinheit = `${nr} ${k.title}`;
      eintraege.push(neuerEintrag('einheit', {
        id: `einheit:${k.id}/${e.id}`,
        titel: e.title,
        text: e.subtitle,
        extra: `${nr} ${k.title}`,
        pfad: pfadEinheit,
        route: { name: 'kapitel', kapitelId: k.id, einheitId: e.id, blockId: null, slug: null },
        kapitelId: k.id,
        einheitId: e.id,
      }));

      // Blöcke: ein Eintrag je Block. Ohne eigenen Titel erbt der Block die
      // letzte Überschrift derselben Tiefe, sonst den Titel der Einheit.
      let letzteUeberschrift = null;
      let letzteTiefe = 0;
      for (const b of alleBloecke(e)) {
        if (b.tiefe !== letzteTiefe) { letzteUeberschrift = null; letzteTiefe = b.tiefe; }
        const eigener = hatEigenenTitel(b.block);
        if (eigener) letzteUeberschrift = blockTitel(b.block);
        const tiefeWert = tiefeFuerStufe(b.tiefe);
        const pfad = `${nr} ${k.title} › ${e.title}`;
        const route = { name: 'kapitel', kapitelId: k.id, einheitId: e.id, blockId: b.id, slug: null };

        if (WERKZEUG_TYPEN[b.block.type]) {
          const baum = b.block.type === 'decisionTree' && k.decisionTrees ? k.decisionTrees[b.block.treeKey] : null;
          const titel = (b.block.title || (baum && baum.title) || blockTitel(b.block)).trim();
          const w = neuerEintrag('werkzeug', {
            id: `werkzeug:${k.id}/${e.id}/${b.id}`,
            titel,
            text: `${WERKZEUG_TYPEN[b.block.type]} in ${e.title}`,
            extra: `${WERKZEUG_TYPEN[b.block.type]} werkzeug ${nr} ${k.title} ${e.title} ${b.block.type}`,
            pfad,
            art: WERKZEUG_TYPEN[b.block.type],
            route,
            kapitelId: k.id, einheitId: e.id, blockId: b.id, tiefe: tiefeWert,
            blockTyp: b.block.type,
          });
          w.blockTyp = b.block.type;
          eintraege.push(w);
          werkzeuge.push(w);
          continue;
        }

        const text = eigener ? textOhneTitel(b.block) : blockText(b.block);
        if (!eigener && !text) continue;
        eintraege.push(neuerEintrag('inhalt', {
          id: `inhalt:${k.id}/${e.id}/${b.id}`,
          titel: eigener ? blockTitel(b.block) : (letzteUeberschrift || e.title),
          text,
          extra: '',
          pfad,
          art: ART_NAMEN[b.block.type] || 'Abschnitt',
          route,
          kapitelId: k.id, einheitId: e.id, blockId: b.id, tiefe: tiefeWert,
          geerbterTitel: !eigener,
        }));
        eintraege[eintraege.length - 1].geerbterTitel = !eigener;
        eintraege[eintraege.length - 1].blockTyp = b.block.type;
      }
    }
  });

  const liste = Array.isArray(glossar) && glossar.length ? glossar : (daten && Array.isArray(daten.glossary) ? daten.glossary : []);
  for (const g of liste) {
    if (!g || !g.term) continue;
    const slug = g.slug || slugFuerBegriff(g.term);
    const tags = Array.isArray(g.tags) ? g.tags : [];
    eintraege.push(neuerEintrag('glossar', {
      id: `glossar:${slug}`,
      titel: g.term,
      text: g.definition,
      extra: tags.join(' '),
      pfad: tags.length ? `Glossar · ${tags.join(' · ')}` : 'Glossar',
      route: { name: 'glossar', kapitelId: null, einheitId: null, blockId: null, slug },
      slug,
    }));
  }

  return { eintraege, werkzeuge };
}

/** Text eines Blocks ohne seinen Titel (damit der Titel nicht doppelt zählt). */
function textOhneTitel(block) {
  const t = blockText(block);
  const titel = entferneHtml(blockTitel(block));
  return titel && t.startsWith(titel) ? t.slice(titel.length).trim() : t;
}

const indexCache = new WeakMap();

/**
 * Index für einen Datenstand — einmal gebaut, danach aus dem Cache.
 * @param {object} daten
 * @param {Array} [glossar]
 */
export function indexFuer(daten, glossar) {
  if (!daten || typeof daten !== 'object') return { eintraege: [], werkzeuge: [] };
  const vorhanden = indexCache.get(daten);
  if (vorhanden && vorhanden.glossar === glossar) return vorhanden.index;
  const index = baueIndex(daten, glossar);
  indexCache.set(daten, { glossar, index });
  return index;
}

// ---------------------------------------------------------------- Anfrage

/**
 * Alle Vorkommen eines gefalteten Wortes in einem gefalteten Feld.
 * @returns {Array<{ start: number, ende: number, wortanfang: boolean }>}
 */
function vorkommen(gefaltet, wort) {
  const treffer = [];
  if (!wort || !gefaltet) return treffer;
  let i = gefaltet.indexOf(wort);
  while (i >= 0) {
    treffer.push({ start: i, ende: i + wort.length, wortanfang: i === 0 || !istWortzeichen(gefaltet[i - 1]) });
    i = gefaltet.indexOf(wort, i + 1);
    if (treffer.length >= 40) break;
  }
  return treffer;
}

function besterTreffer(liste) {
  let best = null;
  for (const t of liste) if (!best || (t.wortanfang && !best.wortanfang) || (t.wortanfang === best.wortanfang && t.start < best.start)) best = t;
  return best;
}

/**
 * Bewertet einen Eintrag gegen die Suchwörter. Alle Wörter müssen irgendwo
 * (Titel, Text oder Zusatzwörter) vorkommen. Ergebnis mit Punkten und den
 * Trefferpositionen in Titel und Text (gefaltete Koordinaten) oder null.
 */
function bewerte(e, woerter, anfrageGefaltet) {
  const g = GEWICHT[e.typ] || GEWICHT.inhalt;
  const gewichtTitel = e.geerbterTitel ? g.text : g.titel;
  let punkte = 0;
  const titelTreffer = [];
  const textTreffer = [];
  let alleImTitel = true;
  let ersterTextTreffer = null;

  for (const w of woerter) {
    const imTitel = vorkommen(e._titel.gefaltet, w);
    const imText = vorkommen(e._text.gefaltet, w);
    const imExtra = e._extra ? e._extra.includes(w) : false;
    if (imTitel.length === 0 && imText.length === 0 && !imExtra) return null;
    titelTreffer.push(...imTitel);
    textTreffer.push(...imText);
    let beste = imExtra ? g.text * 0.5 : 0;
    if (imTitel.length) {
      const b = besterTreffer(imTitel);
      beste = Math.max(beste, gewichtTitel * (b.wortanfang ? 1 : 0.6));
    } else {
      alleImTitel = false;
    }
    if (imText.length) {
      const b = besterTreffer(imText);
      beste = Math.max(beste, g.text * (b.wortanfang ? 1 : 0.6) * (1 - Math.min(b.start, 2000) / 8000));
      if (!ersterTextTreffer || b.start < ersterTextTreffer.start) ersterTextTreffer = b;
    }
    punkte += beste;
  }

  // Boni: exakter Titel, Titel beginnt mit der Anfrage, Anfrage als Phrase
  const t = e._titel.gefaltet;
  if (!e.geerbterTitel) {
    if (t === anfrageGefaltet) punkte += 60;
    else if (t.startsWith(anfrageGefaltet)) punkte += 30;
    else if (alleImTitel && woerter.length > 1 && t.includes(anfrageGefaltet)) punkte += 15;
  }
  if (woerter.length > 1 && e._text.gefaltet.includes(anfrageGefaltet)) punkte += 10;
  // Kurze Titel vor langen bei gleichem Treffer
  punkte -= Math.min(10, t.length / 20);

  return { punkte, titelTreffer, textTreffer, ersterTextTreffer };
}

/** Sortiert und verschmilzt überlappende Intervalle. */
function verschmelze(bereiche) {
  const s = [...bereiche].sort((a, b) => a[0] - b[0]);
  const r = [];
  for (const b of s) {
    const l = r[r.length - 1];
    if (l && b[0] <= l[1]) l[1] = Math.max(l[1], b[1]);
    else r.push([b[0], b[1]]);
  }
  return r;
}

/**
 * Zerlegt einen Text in Segmente { text, mark } anhand von Bereichen im
 * Originaltext.
 */
function segmente(text, bereiche) {
  const teile = [];
  let pos = 0;
  for (const [a, b] of verschmelze(bereiche)) {
    if (a > pos) teile.push({ text: text.slice(pos, a), mark: false });
    if (b > a) teile.push({ text: text.slice(a, b), mark: true });
    pos = Math.max(pos, b);
  }
  if (pos < text.length) teile.push({ text: text.slice(pos), mark: false });
  return teile.length ? teile : [{ text, mark: false }];
}

/** Hervorgehobener Titel als Segmente. */
function titelSegmente(e, treffer) {
  const bereiche = treffer.map((t) => originalBereich(e._titel.karte, t.start, t.ende));
  return segmente(e.titel, bereiche);
}

/**
 * Ausschnitt des Textes mit ± KONTEXT Zeichen um den ersten Treffer, an
 * Wortgrenzen geschnitten, mit „…“, Treffer im Fenster hervorgehoben.
 */
function ausschnitt(e, treffer, erster, laengeOhneTreffer = 150) {
  const text = e.text;
  if (!text) return [];
  if (!erster) {
    const kurz = text.length > laengeOhneTreffer ? `${text.slice(0, laengeOhneTreffer).replace(/\s+\S*$/, '')} …` : text;
    return [{ text: kurz, mark: false }];
  }
  const [oStart, oEnde] = originalBereich(e._text.karte, erster.start, erster.ende);
  let von = Math.max(0, oStart - KONTEXT);
  let bis = Math.min(text.length, oEnde + KONTEXT);
  if (von > 0) {
    const grenze = text.lastIndexOf(' ', von + 12);
    von = grenze > von - 12 && grenze >= 0 ? grenze + 1 : von;
  }
  if (bis < text.length) {
    const grenze = text.indexOf(' ', bis - 12);
    bis = grenze >= 0 && grenze <= bis + 12 ? grenze : bis;
  }
  const fenster = text.slice(von, bis);
  const bereiche = [];
  for (const t of treffer) {
    const [a, b] = originalBereich(e._text.karte, t.start, t.ende);
    if (a >= von && b <= bis) bereiche.push([a - von, b - von]);
  }
  const teile = segmente(fenster, bereiche);
  if (von > 0) teile.unshift({ text: '… ', mark: false });
  if (bis < text.length) teile.push({ text: ' …', mark: false });
  return teile;
}

/**
 * Hebt Suchwörter in einem beliebigen Text hervor (für Glossarseite u. a.).
 * @param {string} text
 * @param {string[]} woerter gefaltete Wörter (anfrageWoerter)
 * @returns {Array<{ text: string, mark: boolean }>}
 */
export function markiere(text, woerter) {
  const s = String(text ?? '');
  if (!s || !woerter || woerter.length === 0) return [{ text: s, mark: false }];
  const { gefaltet, karte } = falteMitKarte(s);
  const bereiche = [];
  for (const w of woerter) for (const t of vorkommen(gefaltet, w)) bereiche.push(originalBereich(karte, t.start, t.ende));
  return segmente(s, bereiche);
}

/**
 * Führt eine Anfrage gegen den Index aus. `zusatz` sind weitere Einträge
 * (z. B. Aktionen der Palette), die wie Indexeinträge bewertet werden.
 * @param {{ eintraege: object[] }} index
 * @param {string} anfrage
 * @param {{ zusatz?: object[], gruppen?: typeof GRUPPEN }} [opt]
 * @returns {{ gruppen: Array<{ typ: string, titel: string, treffer: object[] }>, gesamt: number, woerter: string[] }}
 */
export function suche(index, anfrage, opt = {}) {
  const woerter = anfrageWoerter(anfrage);
  const gruppenDef = opt.gruppen || GRUPPEN;
  if (woerter.length === 0) return { gruppen: [], gesamt: 0, woerter };
  const anfrageGefaltet = woerter.join(' ');
  const kandidaten = [...(index?.eintraege || []), ...(opt.zusatz || [])];
  const jeGruppe = new Map();
  let gesamt = 0;
  for (const e of kandidaten) {
    const b = bewerte(e, woerter, anfrageGefaltet);
    if (!b) continue;
    gesamt += 1;
    if (!jeGruppe.has(e.typ)) jeGruppe.set(e.typ, []);
    jeGruppe.get(e.typ).push({ eintrag: e, punkte: b.punkte, _b: b });
  }
  const gruppen = [];
  for (const def of gruppenDef) {
    const liste = jeGruppe.get(def.typ);
    if (!liste || liste.length === 0) continue;
    liste.sort((a, b) => b.punkte - a.punkte || a.eintrag.titel.localeCompare(b.eintrag.titel, 'de'));
    const treffer = liste.slice(0, def.max).map(({ eintrag: e, punkte, _b }) => ({
      eintrag: e,
      punkte,
      titelTeile: titelSegmente(e, _b.titelTreffer),
      textTeile: ausschnitt(e, _b.textTreffer, _b.ersterTextTreffer),
    }));
    gruppen.push({ typ: def.typ, titel: def.titelSuche || def.titel, treffer, weitere: liste.length - treffer.length });
  }
  return { gruppen, gesamt, woerter };
}

/** Einträge ohne Anfrage als Trefferzeilen (Text als kurzer Ausschnitt). */
export function alsTreffer(eintraege, laenge = 110) {
  return (eintraege || []).map((e) => ({
    eintrag: e,
    punkte: 0,
    titelTeile: [{ text: e.titel, mark: false }],
    textTeile: e.text ? ausschnitt(e, [], null, laenge) : [],
  }));
}

// ---------------------------------------------------------------- Zuletzt

const ZULETZT_VERSION = 1;
const ZULETZT_MAX = 5;

/** Reduziert einen Treffer auf das, was für „Zuletzt gesucht“ gespeichert wird. */
export function zuletztEintrag(e) {
  if (!e || !e.route) return null;
  return {
    id: e.id, typ: e.typ, titel: e.titel, pfad: e.pfad, art: e.art, route: e.route, tiefe: e.tiefe || null,
    text: e.typ === 'glossar' ? e.text : '', blockTyp: e.blockTyp || null,
  };
}

/** Liest die zuletzt geöffneten Treffer (neueste zuerst). */
export function ladeZuletzt() {
  const liste = lade(SCHLUESSEL.zuletztGesucht, [], ZULETZT_VERSION);
  return Array.isArray(liste) ? liste.filter((x) => x && x.id && x.route && x.titel).slice(0, ZULETZT_MAX) : [];
}

/** Merkt einen geöffneten Treffer (vorne, ohne Doppelungen, höchstens fünf). */
export function merkeZuletzt(e) {
  const eintrag = zuletztEintrag(e);
  if (!eintrag) return ladeZuletzt();
  const liste = [eintrag, ...ladeZuletzt().filter((x) => x.id !== eintrag.id)].slice(0, ZULETZT_MAX);
  speichere(SCHLUESSEL.zuletztGesucht, liste, ZULETZT_VERSION);
  return liste;
}

/** Löscht die Liste. */
export function loescheZuletzt() {
  entferne(SCHLUESSEL.zuletztGesucht);
  return [];
}

/**
 * Prüft gespeicherte Einträge gegen den aktuellen Index (Ziele können nach
 * einem Datenupdate fehlen) und frischt Titel/Pfad auf.
 */
export function zuletztGegenIndex(liste, index) {
  const nachId = new Map((index?.eintraege || []).map((e) => [e.id, e]));
  return (liste || []).map((z) => {
    const e = nachId.get(z.id);
    if (!e) return null;
    const z2 = neuerEintrag('zuletzt', { id: `zuletzt:${e.id}`, titel: e.titel, text: e.typ === 'glossar' ? e.text : '', pfad: e.pfad, art: e.art, route: e.route, slug: e.slug, kapitelId: e.kapitelId, einheitId: e.einheitId, blockId: e.blockId, tiefe: e.tiefe });
    z2.blockTyp = e.blockTyp || null;
    z2.quelle = e;
    return z2;
  }).filter(Boolean);
}
