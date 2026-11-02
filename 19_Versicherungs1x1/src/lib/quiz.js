// ===========================================================================
// quiz.js — die Rechenseite des Wissenschecks, ohne React und ohne DOM.
//
// Fragen werden aus den Kapiteln gesammelt und ausschließlich über die
// Kennung `${kapitelId}#${index}` (frageKennung des Stores) referenziert.
// Ein Durchgang wird mit einem Seed zusammengestellt: derselbe Seed liefert
// dieselbe Reihenfolge der Fragen und dieselbe Mischung der Optionen — die
// Buchstaben A–D werden erst NACH dem Mischen vergeben (Brief §11: die Daten
// tragen die richtige Antwort meist an Position B, das Mischen zur Laufzeit
// nimmt dem Raten die Grundlage). `einheitId` je Frage ist optional; fehlt
// sie oder zeigt sie ins Leere, führt „Im Kapitel nachlesen“ auf das Kapitel.
// ===========================================================================
import { frageKennung, LEITNER_TAGE, BESTANDEN_AB } from '../store/Wissen.jsx';

/** Modus → Anzeigename (auch für Verlaufseinträge älterer Fassungen). */
export const MODUS_NAMEN = {
  schnell: 'Schnellcheck',
  kapitel: 'Kapitel-Check',
  wiederholen: 'Wiederholen',
  komplett: 'Kompletttest',
};

/** Der Schnellcheck zieht so viele Fragen aus allen Kapiteln. */
export const SCHNELLCHECK_ANZAHL = 10;
/** Richtwert für „ca. m Min.“: eine halbe Minute je Frage. */
export const SEKUNDEN_JE_FRAGE = 30;
/** Buchstaben der Optionen, nach dem Mischen vergeben. */
export const BUCHSTABEN = ['A', 'B', 'C', 'D', 'E', 'F'];

// ------------------------------------------------------------------ Zufall

/** FNV-1a-Hash eines Textes als 32-Bit-Seed. */
export function seedAusText(text) {
  let h = 0x811c9dc5;
  for (const zeichen of String(text ?? '')) {
    h ^= zeichen.codePointAt(0);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Frischer Seed für einen neuen Durchgang. */
export function neuerSeed() {
  return (Date.now() ^ Math.floor(Math.random() * 0x7fffffff)) >>> 0;
}

/**
 * Deterministischer Zufallsgenerator (mulberry32): gleiche Zahl, gleiche Folge.
 * @param {number} seed
 * @returns {() => number} Zufallszahl in [0, 1)
 */
export function zufallsgenerator(seed) {
  let a = (Number(seed) >>> 0) || 1;
  return function zufall() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates auf einer Kopie; `zufall` liefert Werte in [0, 1). */
export function mische(liste, zufall = Math.random) {
  const a = Array.from(liste || []);
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(zufall() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ------------------------------------------------------------------ Fragen

/**
 * Sammelt alle gültigen Fragen der Kapitel in Datenreihenfolge.
 * Ungültige Einträge (ohne Optionen, `correct` außerhalb) werden ausgelassen,
 * damit ein Datenfehler nie eine weiße Seite erzeugt.
 * @param {Array<object>} kapitelListe daten.chapters
 * @returns {Array<{ frageId:string, kapitelId:string, kapitelTitel:string, kapitelIndex:number, index:number,
 *   einheitId:string|null, einheitTitel:string|null, text:string, optionen:string[], richtig:number, erklaerung:string }>}
 */
export function sammleFragen(kapitelListe) {
  const liste = [];
  (Array.isArray(kapitelListe) ? kapitelListe : []).forEach((k, kapitelIndex) => {
    if (!k || !k.id) return;
    const einheiten = Array.isArray(k.subChapters) ? k.subChapters : [];
    (Array.isArray(k.quiz) ? k.quiz : []).forEach((q, index) => {
      if (!q || typeof q.question !== 'string' || !Array.isArray(q.options) || q.options.length < 2) return;
      if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct >= q.options.length) return;
      const einheit = q.einheitId ? einheiten.find((s) => s && s.id === q.einheitId) || null : null;
      liste.push({
        frageId: frageKennung(k.id, index),
        kapitelId: k.id,
        kapitelTitel: k.title || k.id,
        kapitelIndex,
        index,
        einheitId: einheit ? einheit.id : null,
        einheitTitel: einheit ? einheit.title || null : null,
        text: q.question,
        optionen: q.options.map((o) => String(o)),
        richtig: q.correct,
        erklaerung: typeof q.explanation === 'string' ? q.explanation : '',
      });
    });
  });
  return liste;
}

/** Fragenzahl je Kapitel-ID. */
export function fragenJeKapitel(alleFragen) {
  const je = new Map();
  for (const f of alleFragen || []) je.set(f.kapitelId, (je.get(f.kapitelId) || 0) + 1);
  return je;
}

/**
 * Mischt die Optionen einer Frage und vergibt danach die Buchstaben.
 * `richtig` zeigt anschließend auf die neue Position, `original` auf die alte.
 */
export function bereiteFrage(frage, zufall = Math.random) {
  const reihenfolge = mische(frage.optionen.map((_, i) => i), zufall);
  const optionen = reihenfolge.map((original, i) => ({
    buchstabe: BUCHSTABEN[i] || String(i + 1),
    text: frage.optionen[original],
    original,
  }));
  return { ...frage, optionen, richtig: reihenfolge.indexOf(frage.richtig) };
}

// ------------------------------------------------------------------ Leitner

/**
 * Fragen für „Wiederholen“: fällige Leitner-Karten (Liste aus
 * `faelligeFragen()` des Stores) plus alle Fragen, die schon versucht, aber
 * noch nie richtig beantwortet wurden. Älteste Fälligkeit zuerst.
 * @param {Array<object>} alleFragen
 * @param {Record<string, {versuche:number, richtig:number, box:number, faellig:string}>} karten
 * @param {string[]} faellig Kennungen aus faelligeFragen()
 */
export function wiederholungsFragen(alleFragen, karten = {}, faellig = []) {
  const faelligSet = new Set(faellig || []);
  const zeit = (f) => {
    const k = karten[f.frageId];
    const t = k && k.faellig ? new Date(k.faellig).getTime() : 0;
    return Number.isFinite(t) ? t : 0;
  };
  return (alleFragen || [])
    .filter((f) => {
      const k = karten[f.frageId];
      if (!k) return false;
      return faelligSet.has(f.frageId) || ((k.versuche || 0) > 0 && !((k.richtig || 0) > 0));
    })
    .sort((a, b) => zeit(a) - zeit(b) || a.kapitelIndex - b.kapitelIndex || a.index - b.index);
}

/**
 * Kurzer Hinweis nach einer Antwort, was die Leitner-Karte damit macht —
 * gerechnet auf der Karte VOR der Antwort (richtig → Box + 1, falsch → Box 0).
 */
export function leitnerHinweis(karteVorher, richtig) {
  if (!richtig) return 'Kommt im Modus „Wiederholen“ wieder.';
  const box = Math.min(LEITNER_TAGE.length - 1, ((karteVorher && karteVorher.box) || 0) + 1);
  const tage = LEITNER_TAGE[box];
  if (tage <= 0) return 'Bleibt im Stapel „Wiederholen“.';
  if (tage === 1) return 'Nächste Wiederholung morgen.';
  return `Nächste Wiederholung in ${tage} Tagen.`;
}

// --------------------------------------------------------------- Durchgang

/**
 * Stellt einen Durchgang zusammen. Der Seed bestimmt Fragenreihenfolge und
 * Optionsmischung vollständig.
 *  - schnell:      SCHNELLCHECK_ANZAHL zufällige Fragen aus allen Kapiteln
 *  - kapitel:      alle Fragen der gewählten Kapitel, gemischt
 *  - wiederholen:  die übergebene Wiederholungsliste in ihrer Reihenfolge
 *  - komplett:     alle Fragen in Kapitelreihenfolge
 *  - nur:          eine feste Liste von Kennungen (z. B. „Fehler wiederholen“), gemischt
 */
export function stelleDurchgangZusammen({ modus, alleFragen, kapitelIds = [], wiederholung = [], nur = null, seed = neuerSeed() }) {
  const zufall = zufallsgenerator(seed);
  let auswahl;
  if (Array.isArray(nur)) {
    const s = new Set(nur);
    auswahl = mische(alleFragen.filter((f) => s.has(f.frageId)), zufall);
  } else if (modus === 'schnell') {
    auswahl = mische(alleFragen, zufall).slice(0, SCHNELLCHECK_ANZAHL);
  } else if (modus === 'kapitel') {
    const s = new Set(kapitelIds);
    auswahl = mische(alleFragen.filter((f) => s.has(f.kapitelId)), zufall);
  } else if (modus === 'wiederholen') {
    auswahl = Array.from(wiederholung);
  } else {
    auswahl = Array.from(alleFragen);
  }
  const fragen = auswahl.map((f) => bereiteFrage(f, zufall));
  const betroffen = [...new Set(fragen.map((f) => f.kapitelId))];
  return {
    modus,
    seed,
    nur: Array.isArray(nur) ? [...nur] : null,
    kapitelIds: modus === 'kapitel' ? [...kapitelIds] : betroffen,
    fragen,
  };
}

/** Geschätzte Dauer in Minuten, mindestens 1. */
export function geschaetzteMinuten(anzahl) {
  return Math.max(1, Math.round(((Number(anzahl) || 0) * SEKUNDEN_JE_FRAGE) / 60));
}

// ----------------------------------------------------------------- Wertung

/** Wertung in Erwachsenensprache: Sehr gut (≥ 90) · Gut (≥ 80) · Solide (≥ 60) · Ausbaufähig. */
export function werte(richtig, gesamt) {
  const a = gesamt > 0 ? richtig / gesamt : 0;
  const prozent = Math.round(a * 100);
  let label = 'Ausbaufähig';
  if (prozent >= 90) label = 'Sehr gut';
  else if (prozent >= 80) label = 'Gut';
  else if (prozent >= 60) label = 'Solide';
  return { anteil: a, prozent, label, bestanden: gesamt > 0 && a >= BESTANDEN_AB };
}

/**
 * Zählt einen Durchgang aus. `antworten[i]` ist `{ gewaehlt, richtig }` oder leer.
 * @returns {{ richtig:number, gesamt:number, falsch: Array<{ frage:object, antwort:object|null, position:number }> }}
 */
export function zaehleErgebnis(fragen, antworten) {
  let richtig = 0;
  const falsch = [];
  (fragen || []).forEach((frage, i) => {
    const a = antworten && antworten[i];
    if (a && a.richtig) richtig += 1;
    else falsch.push({ frage, antwort: a || null, position: i });
  });
  return { richtig, gesamt: (fragen || []).length, falsch };
}

/** Ergebnis je Kapitel in Kapitelreihenfolge. */
export function ergebnisJeKapitel(fragen, antworten) {
  const je = new Map();
  (fragen || []).forEach((frage, i) => {
    const e = je.get(frage.kapitelId) || { kapitelId: frage.kapitelId, kapitelTitel: frage.kapitelTitel, kapitelIndex: frage.kapitelIndex, richtig: 0, gesamt: 0 };
    e.gesamt += 1;
    if (antworten && antworten[i] && antworten[i].richtig) e.richtig += 1;
    je.set(frage.kapitelId, e);
  });
  return [...je.values()]
    .map((e) => ({ ...e, anteil: e.gesamt ? e.richtig / e.gesamt : 0 }))
    .sort((a, b) => a.kapitelIndex - b.kapitelIndex);
}

/**
 * Letztes Ergebnis je Kapitel aus dem Verlauf (neueste zuerst): nur echte
 * Kapitel-Checks mit genau diesem einen Kapitel zählen.
 * @returns {Map<string, { richtig:number, gesamt:number, anteil:number, zeit:string }>}
 */
export function letzteErgebnisseJeKapitel(verlauf) {
  const je = new Map();
  for (const v of verlauf || []) {
    if (!v || v.modus !== 'kapitel' || !Array.isArray(v.kapitelIds) || v.kapitelIds.length !== 1) continue;
    const id = v.kapitelIds[0];
    if (je.has(id)) continue;
    const gesamt = Number(v.gesamt) || 0;
    const richtig = Number(v.richtig) || 0;
    je.set(id, { richtig, gesamt, anteil: gesamt ? richtig / gesamt : 0, zeit: v.zeit });
  }
  return je;
}

/**
 * Kurztext der Kapitel eines Verlaufseintrags: „alle Kapitel“ bei
 * Schnellcheck und Kompletttest, sonst die Nummern („01, 03, 06“).
 */
export function beschreibeKapitel(modus, kapitelIds, kapitelListe) {
  if (modus === 'schnell' || modus === 'komplett') return 'alle Kapitel';
  const ids = Array.isArray(kapitelIds) ? kapitelIds : [];
  if (ids.length === 0) return 'gemischt';
  const nummern = (kapitelListe || [])
    .map((k, i) => (ids.includes(k.id) ? String(i + 1).padStart(2, '0') : null))
    .filter(Boolean);
  if (nummern.length === 0) return 'gemischt';
  if (nummern.length === (kapitelListe || []).length) return 'alle Kapitel';
  return nummern.length > 4 ? `${nummern.slice(0, 4).join(', ')} +${nummern.length - 4}` : nummern.join(', ');
}
