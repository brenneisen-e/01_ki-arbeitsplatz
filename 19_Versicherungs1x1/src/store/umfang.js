// ===========================================================================
// umfang.js — Umfangssteuerung: welche Kapitel zeigt die App?
//
// Ein Vorführ- oder Freigabestand: die Einstellung begrenzt den sichtbaren
// Stoff auf eine Auswahl von Kapiteln. Alles Weitere folgt daraus von selbst,
// weil der Store nur noch die gefilterte Fassung der Daten herausgibt
// (Wissen.jsx). Hier stehen die reinen Funktionen dazu — kein React.
//
// KEIN Zugriffsschutz: die ausgeblendeten Kapitel stecken weiterhin in der
// ausgelieferten public/data/chapters.json und sind mit Entwicklerwerkzeugen
// auffindbar. Der Sinn ist ein aufgeräumter Ausschnitt, keine Geheimhaltung.
//
// Zustand (localStorage 'v1x1.umfang.v1'):
//   { profil: 'alles'|'auswahl', sichtbar: [kapitelId], fortschrittZeigen, stand }
// `wunsch` kommt nur aus der Adresszeile (?umfang=erstes) und wird nicht
// gespeichert: „erstes Kapitel“ lässt sich erst beantworten, wenn die Daten
// da sind — bis dahin trägt der Zustand den Wunsch, danach die Kennung.
// ===========================================================================
import { lade, speichere, SCHLUESSEL } from '../lib/speicher.js';
import { begriffeInEinheit } from '../lib/begriffe.js';

export const UMFANG_VERSION = 1;
export const UMFANG_PARAMETER = 'umfang';

export const STANDARD_UMFANG = Object.freeze({
  profil: 'alles', sichtbar: [], fortschrittZeigen: true, stand: null, wunsch: null,
});

/** Kapitel-Kennung aus einem Einheiten-Schlüssel `kapitelId/einheitId`. */
function kapitelAusSchluessel(schluessel) {
  return String(schluessel).split('/')[0];
}

/** Kapitel-Kennung aus einer Frage-Kennung `kapitelId#index`. */
function kapitelAusFrage(frageId) {
  return String(frageId).split('#')[0];
}

function zeitMs(wert) {
  const t = wert ? Date.parse(wert) : NaN;
  return Number.isFinite(t) ? t : 0;
}

/**
 * Bringt einen gelesenen oder übergebenen Zustand in Form. Unbekannte Profile,
 * kaputte Listen und eine leere Auswahl fallen auf „alles“ zurück — es gibt
 * nie eine leere App.
 */
export function normalisiereUmfang(roh) {
  const u = roh && typeof roh === 'object' ? roh : {};
  const sichtbar = Array.isArray(u.sichtbar)
    ? [...new Set(u.sichtbar.filter((id) => typeof id === 'string' && id))]
    : [];
  const profil = u.profil === 'auswahl' && sichtbar.length > 0 ? 'auswahl' : 'alles';
  return {
    profil,
    sichtbar,
    fortschrittZeigen: u.fortschrittZeigen !== false,
    stand: typeof u.stand === 'string' && u.stand ? u.stand : new Date().toISOString(),
    wunsch: u.wunsch === 'erstes' ? 'erstes' : null,
  };
}

/** Liest den gespeicherten Umfang (ohne Adresszeile). */
export function ladeUmfang() {
  return normalisiereUmfang(lade(SCHLUESSEL.umfang, null, UMFANG_VERSION));
}

/** Schreibt den Umfang; `wunsch` ist flüchtig und wird nicht gespeichert. */
export function speichereUmfang(umfang) {
  const u = normalisiereUmfang(umfang);
  return speichere(
    SCHLUESSEL.umfang,
    { profil: u.profil, sichtbar: u.sichtbar, fortschrittZeigen: u.fortschrittZeigen, stand: u.stand },
    UMFANG_VERSION,
  );
}

/**
 * Sichtbare Kapitel-Kennungen in Originalreihenfolge. Ohne Daten leer, bei
 * unbekannter oder leerer Auswahl alle.
 * @param {object} umfang
 * @param {Array<{id:string}>} kapitelListe ungefilterte Kapitel
 * @returns {string[]}
 */
export function sichtbareKapitelIds(umfang, kapitelListe) {
  const alle = (Array.isArray(kapitelListe) ? kapitelListe : []).map((k) => k && k.id).filter(Boolean);
  if (alle.length === 0) return [];
  if (umfang && umfang.wunsch === 'erstes') return [alle[0]];
  if (!umfang || umfang.profil !== 'auswahl') return alle;
  const menge = new Set(umfang.sichtbar || []);
  const treffer = alle.filter((id) => menge.has(id));
  return treffer.length > 0 ? treffer : alle;
}

/** Lerneinheiten und Fragen eines Kapitels (für das Panel). */
export function kapitelUmfang(kapitel) {
  return {
    einheiten: Array.isArray(kapitel?.subChapters) ? kapitel.subChapters.length : 0,
    fragen: Array.isArray(kapitel?.quiz) ? kapitel.quiz.length : 0,
  };
}

// --------------------------------------------------------------- Daten filtern

// Je Datenstand ein Cache über die Umfänge (Schlüssel = sichtbare Kennungen).
// Der Begriffs-Scan über alle sichtbaren Einheiten kostet ~30 ms und darf
// nicht bei jedem Rendern laufen; außerdem bleibt so die Objekt-Identität von
// `daten` stabil, an der die Caches von Suchindex und Begriffsdaten hängen.
const datenCache = new WeakMap();

/**
 * Gefilterte Fassung der Daten: nur sichtbare Kapitel (Originalreihenfolge)
 * und nur Glossarbegriffe, die in diesen Kapiteln vorkommen.
 * Bei vollem Umfang kommen die Originalobjekte unverändert zurück (gleiche
 * Identität — kein Cache wird unnötig verworfen).
 * @param {object} datenVoll chapters.json
 * @param {Array} glossarVoll sortiertes Glossar des Stores (mit slug)
 * @param {string[]} sichtbarIds
 * @returns {{ daten: object, glossar: Array }}
 */
export function umfangsDaten(datenVoll, glossarVoll, sichtbarIds) {
  const glossar = Array.isArray(glossarVoll) ? glossarVoll : [];
  if (!datenVoll || typeof datenVoll !== 'object') return { daten: datenVoll, glossar };
  const alle = Array.isArray(datenVoll.chapters) ? datenVoll.chapters : [];
  const ids = Array.isArray(sichtbarIds) ? sichtbarIds : [];
  if (alle.length === 0 || ids.length >= alle.length) return { daten: datenVoll, glossar };

  const schluessel = ids.join('|');
  let jeUmfang = datenCache.get(datenVoll);
  if (!jeUmfang) { jeUmfang = new Map(); datenCache.set(datenVoll, jeUmfang); }
  const vorhanden = jeUmfang.get(schluessel);
  if (vorhanden && vorhanden.glossarVoll === glossar) return vorhanden.wert;

  const menge = new Set(ids);
  const chapters = alle.filter((k) => k && menge.has(k.id));
  const slugs = new Set();
  for (const k of chapters) {
    for (const e of k.subChapters || []) {
      for (const b of begriffeInEinheit(e, glossar)) slugs.add(b.slug);
    }
  }
  const gefiltertesGlossar = glossar.filter((g) => slugs.has(g.slug));
  const wert = { daten: { ...datenVoll, chapters, glossary: gefiltertesGlossar }, glossar: gefiltertesGlossar };
  jeUmfang.set(schluessel, { glossarVoll: glossar, wert });
  return wert;
}

// ---------------------------------------------------------- Fortschritt filtern

/**
 * Sicht auf den Fortschritt: nur sichtbare Kapitel, und bei
 * `fortschrittZeigen: false` nur, was nach `grenze` dazugekommen ist (so
 * bleibt der eigene Lesestand unsichtbar, ohne gelöscht zu werden, und ein
 * frisch gelesener Abschnitt lässt sich trotzdem abhaken).
 * Gespeichert wird immer der vollständige Stand — diese Funktion liest nur.
 * @param {object} fortschritt
 * @param {{ sichtbar:Set<string>, vollerUmfang:boolean, fortschrittZeigen:boolean, grenze:string|null, fragenSichtbar:number }} lage
 */
export function umfangsFortschritt(fortschritt, lage) {
  const { sichtbar, vollerUmfang, fortschrittZeigen, grenze, fragenSichtbar } = lage;
  if (vollerUmfang && fortschrittZeigen) return fortschritt;
  const grenzeMs = fortschrittZeigen ? -Infinity : zeitMs(grenze);
  const kapitelSichtbar = (id) => vollerUmfang || sichtbar.has(id);
  const neuGenug = (wert) => fortschrittZeigen || zeitMs(wert) > grenzeMs;

  const filtereEinheiten = (karte) => {
    const raus = {};
    for (const [schluessel, zeit] of Object.entries(karte || {})) {
      if (kapitelSichtbar(kapitelAusSchluessel(schluessel)) && neuGenug(zeit)) raus[schluessel] = zeit;
    }
    return raus;
  };

  const bestanden = {};
  for (const [kapitelId, eintrag] of Object.entries(fortschritt.bestanden || {})) {
    if (kapitelSichtbar(kapitelId) && neuGenug(eintrag && eintrag.zeit)) bestanden[kapitelId] = eintrag;
  }

  const karten = {};
  if (fortschrittZeigen) {
    for (const [frageId, karte] of Object.entries(fortschritt.quiz?.karten || {})) {
      if (kapitelSichtbar(kapitelAusFrage(frageId))) karten[frageId] = karte;
    }
  }

  const verlauf = (fortschritt.quiz?.verlauf || []).filter((v) => {
    if (!neuGenug(v && v.zeit)) return false;
    const ids = Array.isArray(v.kapitelIds) ? v.kapitelIds : [];
    if (!ids.every((id) => kapitelSichtbar(id))) return false;
    // Ein Durchgang über mehr Fragen, als der Umfang hergibt, verrät ihn.
    return vollerUmfang || (Number(v.gesamt) || 0) <= fragenSichtbar;
  });

  const zuletzt = fortschritt.zuletzt
    && kapitelSichtbar(fortschritt.zuletzt.kapitelId)
    && neuGenug(fortschritt.zuletzt.zeit)
    ? fortschritt.zuletzt : null;

  return {
    ...fortschritt,
    gelesen: filtereEinheiten(fortschritt.gelesen),
    besucht: filtereEinheiten(fortschritt.besucht),
    bestanden,
    zuletzt,
    // Lesezeichen tragen keine Zeit: sie folgen nur der Kapitelsicht, damit
    // ein Klick nie einen gespeicherten Eintrag unbemerkt entfernt.
    lesezeichen: (fortschritt.lesezeichen || []).filter((s) => kapitelSichtbar(kapitelAusSchluessel(s))),
    quiz: { verlauf, karten },
  };
}

// ------------------------------------------------------------- Adresse / Link

/**
 * Wert des Parameters `umfang` — vor dem Hash (?umfang=…) oder dahinter
 * (#/kapitel/x?umfang=…).
 * @returns {{ wert: string, imHash: boolean }|null}
 */
export function parameterAusAdresse(ort = window.location) {
  try {
    const ausSuche = new URLSearchParams(ort.search || '').get(UMFANG_PARAMETER);
    if (ausSuche !== null) return { wert: ausSuche, imHash: false };
    const hash = String(ort.hash || '');
    const i = hash.indexOf('?');
    if (i < 0) return null;
    const ausHash = new URLSearchParams(hash.slice(i + 1)).get(UMFANG_PARAMETER);
    return ausHash === null ? null : { wert: ausHash, imHash: true };
  } catch {
    return null;
  }
}

/** Entfernt den Parameter aus der Adresszeile, ohne die Route zu verlieren. */
export function entferneParameterAusAdresse(ort = window.location) {
  try {
    const suche = new URLSearchParams(ort.search || '');
    suche.delete(UMFANG_PARAMETER);
    const suchteil = suche.toString();
    let hash = String(ort.hash || '');
    const i = hash.indexOf('?');
    if (i >= 0) {
      const inHash = new URLSearchParams(hash.slice(i + 1));
      inHash.delete(UMFANG_PARAMETER);
      const rest = inHash.toString();
      hash = hash.slice(0, i) + (rest ? `?${rest}` : '');
    }
    const ziel = `${ort.pathname}${suchteil ? `?${suchteil}` : ''}${hash}`;
    window.history.replaceState(null, '', ziel);
  } catch { /* ohne History-Zugriff bleibt der Parameter stehen */ }
}

/**
 * Parameterwert → Umfang. `alles`, `erstes` oder eine Liste von Kennungen.
 * Ohne brauchbaren Inhalt bleibt es bei „alles“.
 */
export function umfangAusParameter(wert, vorher = STANDARD_UMFANG) {
  const roh = String(wert || '').trim();
  const basis = { fortschrittZeigen: vorher.fortschrittZeigen, stand: new Date().toISOString() };
  if (!roh || roh === 'alles' || roh === 'alle') return normalisiereUmfang({ ...basis, profil: 'alles', sichtbar: vorher.sichtbar });
  if (roh === 'erstes' || roh === 'erstes-kapitel') return normalisiereUmfang({ ...basis, profil: 'alles', sichtbar: [], wunsch: 'erstes' });
  const ids = roh.split(/[,;+\s]+/).map((s) => s.trim()).filter(Boolean);
  if (ids.length === 0) return normalisiereUmfang({ ...basis, profil: 'alles', sichtbar: [] });
  return normalisiereUmfang({ ...basis, profil: 'auswahl', sichtbar: ids });
}

/** Parameterwert für den aktuellen Umfang. */
export function parameterFuerUmfang(umfang, sichtbarIds, alleIds) {
  if (!Array.isArray(sichtbarIds) || sichtbarIds.length === 0) return 'alles';
  if (sichtbarIds.length >= (alleIds || []).length) return 'alles';
  if (sichtbarIds.length === 1 && alleIds && sichtbarIds[0] === alleIds[0]) return 'erstes';
  return sichtbarIds.join(',');
}

/** Vollständige Adresse mit `?umfang=…` (Hash bleibt erhalten). */
export function baueUmfangLink(parameter, ort = window.location) {
  try {
    const suche = new URLSearchParams(ort.search || '');
    suche.set(UMFANG_PARAMETER, parameter);
    const hash = String(ort.hash || '').split('?')[0];
    return `${ort.origin}${ort.pathname}?${suche.toString()}${hash}`;
  } catch {
    return '';
  }
}
