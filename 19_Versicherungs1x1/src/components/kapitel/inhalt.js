// ===========================================================================
// inhalt.js — reine Helfer der Kapitelseite (kein React, kein DOM):
// Tiefengruppen, wirksame Tiefe, Inhaltsverzeichnis, Lesezeit je Tiefe,
// Umfang des Wissenschecks. Die Quellenliste kommt aus utils/citeMap.js.
// ===========================================================================
import { TIEFEN, alleBloecke, blockTitel, hatEigenenTitel, hatTiefe, stufeFuerTiefe, tiefeFuerStufe } from '../../lib/bloecke.js';
import { entferneHtml, lesezeitMinuten } from '../../lib/text.js';

/** Tiefe, die in dieser Einheit tatsächlich wirkt: die höchste vorhandene ≤ gewählte. */
export function wirksameTiefe(einheit, tiefe) {
  const stufe = stufeFuerTiefe(tiefe);
  let wirksam = TIEFEN[0].wert;
  for (const t of TIEFEN) {
    if (t.stufe > stufe) break;
    if (t.stufe === 1 || hatTiefe(einheit, t.wert)) wirksam = t.wert;
  }
  return wirksam;
}

/**
 * Gruppiert Blockeinträge `{ block, tiefe, id }` nach Tiefe, in fester
 * Reihenfolge Basis → Vertiefung → Experte; leere Gruppen fallen weg.
 * @returns {Array<{ wert: string, label: string, stufe: number, farbe: string, bloecke: Array, minuten: number }>}
 */
export function gruppiereNachTiefe(eintraege) {
  return TIEFEN.map((t) => {
    const bloecke = (eintraege || []).filter((e) => e.tiefe === t.stufe);
    return { wert: t.wert, label: t.label, stufe: t.stufe, farbe: t.farbe, bloecke, minuten: bloecke.length ? lesezeitMinuten(bloecke) : 0 };
  }).filter((g) => g.bloecke.length > 0);
}

/** Lesezeit je Tiefe in Minuten: { basis, vertiefung, experte } (0 ohne Inhalt). */
export function lesezeitJeTiefe(einheit) {
  const alle = alleBloecke(einheit);
  const je = {};
  for (const t of TIEFEN) {
    const bloecke = alle.filter((e) => e.tiefe === t.stufe);
    je[t.wert] = bloecke.length ? lesezeitMinuten(bloecke) : 0;
  }
  return je;
}

// Absätze und Hinweise ohne eigenen Titel gehören zum vorigen Abschnitt;
// alles andere (Tabelle, Diagramm, Rechner …) ist auch ohne Titel ein Ziel.
const NUR_MIT_TITEL = new Set(['paragraph', 'callout']);

/**
 * Einträge für „Auf dieser Seite“: alle Tiefen, in Blockreihenfolge.
 * @returns {Array<{ id: string, index: number, stufe: 1|2|3, tiefe: string, titel: string, typ: string }>}
 */
export function inhaltsverzeichnis(einheit) {
  return alleBloecke(einheit)
    .filter((e) => hatEigenenTitel(e.block) || !NUR_MIT_TITEL.has(e.block.type))
    .map((e) => ({ id: e.id, index: e.index, stufe: e.tiefe, tiefe: tiefeFuerStufe(e.tiefe), titel: entferneHtml(blockTitel(e.block)), typ: e.block.type }));
}

/** Der Eintrag des Verzeichnisses, zu dem ein Block gehört (letzter Eintrag davor). */
export function eintragFuerBlock(verzeichnis, blockId) {
  if (!blockId) return null;
  const n = Number(String(blockId).replace(/^b/, ''));
  if (!Number.isFinite(n)) return null;
  let treffer = null;
  for (const e of verzeichnis) {
    if (e.index <= n) treffer = e;
    else break;
  }
  return treffer;
}

/** Fragenzahl und geschätzte Dauer (30 s je Frage, mindestens 1 Minute) eines Kapitel-Wissenschecks. */
export function wissenscheckUmfang(kapitel) {
  const fragen = Array.isArray(kapitel?.quiz) ? kapitel.quiz.length : 0;
  return { fragen, minuten: fragen ? Math.max(1, Math.ceil(fragen / 2)) : 0 };
}
