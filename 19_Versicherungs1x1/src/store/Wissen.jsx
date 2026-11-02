// ===========================================================================
// Wissen.jsx — der Store: Daten, Route, Fortschritt und UI-Zustand.
//
// Ein Provider, ein Hook: useWissen(). Die API ist im Brief §5 festgelegt und
// in README.md mit Beispielen dokumentiert. Fortschritt liegt unter dem
// localStorage-Schlüssel v1x1.fortschritt.v2 (nur über lib/speicher.js).
//
// Umfang: `daten`, `kapitelListe`, `glossar`, `kennzahlen`, `einheitenFolge`
// und `fortschritt` sind IMMER die Fassung des eingestellten Umfangs
// (store/umfang.js). Wer den vollen Stoff braucht, nimmt `datenVoll` — das
// tut nur die Umfangssteuerung selbst. Damit wirkt die Einstellung überall,
// ohne dass eine Seite davon wissen muss.
// ===========================================================================
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { lade, speichere, SCHLUESSEL } from '../lib/speicher.js';
import { hashZuRoute, routeZuHash, route as baueRoute } from './routen.js';
import { slugFuerBegriff } from '../lib/begriffe.js';
import { lesezeitMinuten } from '../lib/text.js';
import { alleBloecke, TIEFEN } from '../lib/bloecke.js';
import {
  ladeUmfang, speichereUmfang, normalisiereUmfang, sichtbareKapitelIds, umfangsDaten,
  umfangsFortschritt, parameterAusAdresse, entferneParameterAusAdresse, umfangAusParameter,
  parameterFuerUmfang, baueUmfangLink,
} from './umfang.js';

const DATEN_URL = './data/chapters.json';
const FORTSCHRITT_VERSION = 2;
/** Leitner light: Tage bis zur Fälligkeit je Box (Box 0 sofort). */
export const LEITNER_TAGE = [0, 1, 3, 7];
export const BESTANDEN_AB = 0.8;
const TITEL_APP = 'Versicherungs-1×1';

const WissenContext = createContext(null);

/** Schlüssel einer Lerneinheit — einheitId ist nur je Kapitel eindeutig. */
export function einheitSchluessel(kapitelId, einheitId) {
  return `${kapitelId}/${einheitId}`;
}

/** Kennung einer Quizfrage: `${kapitelId}#${indexImQuizArray}`. */
export function frageKennung(kapitelId, index) {
  return `${kapitelId}#${index}`;
}

export const LEERER_FORTSCHRITT = Object.freeze({
  gelesen: {}, besucht: {}, bestanden: {}, zuletzt: null, lesezeichen: [],
  quiz: { verlauf: [], karten: {} },
  einstellungen: { tiefe: 'basis' },
});

function normalisiereFortschritt(roh) {
  const f = roh && typeof roh === 'object' ? roh : {};
  const tiefe = TIEFEN.some((t) => t.wert === f.einstellungen?.tiefe) ? f.einstellungen.tiefe : 'basis';
  return {
    gelesen: { ...(f.gelesen || {}) },
    besucht: { ...(f.besucht || {}) },
    bestanden: { ...(f.bestanden || {}) },
    zuletzt: f.zuletzt && f.zuletzt.kapitelId && f.zuletzt.einheitId ? { ...f.zuletzt } : null,
    lesezeichen: Array.isArray(f.lesezeichen) ? [...f.lesezeichen] : [],
    quiz: {
      verlauf: Array.isArray(f.quiz?.verlauf) ? [...f.quiz.verlauf] : [],
      karten: { ...(f.quiz?.karten || {}) },
    },
    einstellungen: { tiefe },
  };
}

function liesRoute() {
  const { route, ersetzen } = hashZuRoute(window.location.hash);
  if (ersetzen) {
    try { window.history.replaceState(null, '', ersetzen); } catch { /* egal */ }
  }
  return route;
}

/** Zählt Quellenverweise in einem Datenteil (Markup `.v1x1-cite-num`). */
function zaehleQuellen(wert) {
  try {
    return (JSON.stringify(wert).match(/v1x1-cite-num/g) || []).length;
  } catch {
    return 0;
  }
}

/**
 * Umfang beim Seitenstart: gespeicherter Stand, von der Adresse überstimmt
 * (`?umfang=…`). Der Parameter wird sofort übernommen, gespeichert und aus der
 * Adresszeile entfernt. Das Ergebnis wird gemerkt, damit der doppelte Aufruf
 * im StrictMode und ein Neuaufbau des Providers dasselbe liefern.
 */
let umfangStart = null;
function starteUmfang() {
  if (umfangStart) return umfangStart;
  const gespeichert = ladeUmfang();
  const parameter = parameterAusAdresse();
  if (!parameter) {
    umfangStart = gespeichert;
    return umfangStart;
  }
  const neu = umfangAusParameter(parameter.wert, gespeichert);
  speichereUmfang(neu);
  entferneParameterAusAdresse();
  umfangStart = neu;
  return umfangStart;
}

export function WissenProvider({ children }) {
  // ---------------------------------------------------------------- Daten
  const [datenVoll, setDaten] = useState(null);
  const [laden, setLaden] = useState(true);
  const [fehler, setFehler] = useState(null);
  const [ladeVersuch, setLadeVersuch] = useState(0);

  useEffect(() => {
    let aktiv = true;
    setLaden(true);
    setFehler(null);
    fetch(DATEN_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => {
        if (!aktiv) return;
        if (!d || !Array.isArray(d.chapters)) throw new Error('Datei ohne Kapitel');
        setDaten(d);
        setLaden(false);
      })
      .catch((e) => {
        if (!aktiv) return;
        setFehler(e && e.message ? e.message : 'Unbekannter Fehler');
        setLaden(false);
      });
    return () => { aktiv = false; };
  }, [ladeVersuch]);

  const nochmalLaden = useCallback(() => setLadeVersuch((n) => n + 1), []);

  // ---------------------------------------------------------------- Umfang
  const [umfangZustand, setUmfangZustand] = useState(starteUmfang);
  const erstesUmfangSchreiben = useRef(true);
  useEffect(() => {
    if (erstesUmfangSchreiben.current) { erstesUmfangSchreiben.current = false; return; }
    speichereUmfang(umfangZustand);
  }, [umfangZustand]);

  // Ein Hashwechsel lädt die Seite nicht neu — ein Parameter hinter dem Hash
  // (#/glossar?umfang=…) muss deshalb auch hier greifen.
  const umfangRef = useRef(umfangZustand);
  umfangRef.current = umfangZustand;
  useEffect(() => {
    const aufHash = () => {
      const parameter = parameterAusAdresse();
      if (!parameter) return;
      setUmfangZustand(umfangAusParameter(parameter.wert, umfangRef.current));
      entferneParameterAusAdresse();
    };
    window.addEventListener('hashchange', aufHash);
    return () => window.removeEventListener('hashchange', aufHash);
  }, []);

  const alleKapitel = useMemo(
    () => (datenVoll && Array.isArray(datenVoll.chapters) ? datenVoll.chapters : []),
    [datenVoll],
  );
  const alleKapitelIds = useMemo(() => alleKapitel.map((k) => k.id), [alleKapitel]);
  const sichtbarIds = useMemo(() => sichtbareKapitelIds(umfangZustand, alleKapitel), [umfangZustand, alleKapitel]);
  const umfangAktiv = alleKapitel.length > 0 && sichtbarIds.length < alleKapitel.length;

  const glossarVoll = useMemo(() => {
    const liste = datenVoll && Array.isArray(datenVoll.glossary) ? datenVoll.glossary : [];
    const gesehen = new Set();
    return liste
      .filter((g) => g && g.term)
      .map((g) => {
        let s = g.slug || slugFuerBegriff(g.term);
        let n = 2;
        while (gesehen.has(s)) s = `${g.slug || slugFuerBegriff(g.term)}-${n++}`;
        gesehen.add(s);
        return { ...g, slug: s, tags: Array.isArray(g.tags) ? g.tags : [] };
      })
      .sort((a, b) => a.term.localeCompare(b.term, 'de'));
  }, [datenVoll]);

  // Ab hier gilt nur noch die Fassung des Umfangs.
  const { daten, glossar } = useMemo(
    () => umfangsDaten(datenVoll, glossarVoll, sichtbarIds),
    [datenVoll, glossarVoll, sichtbarIds],
  );
  const kapitelListe = useMemo(() => (daten && Array.isArray(daten.chapters) ? daten.chapters : []), [daten]);

  // Ein Punkt am Monogramm ist das einzige Zeichen für einen begrenzten Umfang.
  useEffect(() => {
    const wurzel = document.documentElement;
    if (umfangAktiv) wurzel.setAttribute('data-umfang', 'begrenzt');
    else wurzel.removeAttribute('data-umfang');
    return () => wurzel.removeAttribute('data-umfang');
  }, [umfangAktiv]);

  // ---------------------------------------------------------------- Route
  const [route, setRoute] = useState(liesRoute);

  useEffect(() => {
    const aufHash = () => setRoute(liesRoute());
    window.addEventListener('hashchange', aufHash);
    return () => window.removeEventListener('hashchange', aufHash);
  }, []);

  const navigiere = useCallback((ziel) => {
    const hash = routeZuHash(ziel);
    if (window.location.hash === hash) {
      setRoute(hashZuRoute(hash).route);
      return;
    }
    window.location.hash = hash;
  }, []);

  const ersetzeRoute = useCallback((ziel) => {
    const hash = routeZuHash(ziel);
    try { window.history.replaceState(null, '', hash); } catch { /* egal */ }
    setRoute(hashZuRoute(hash).route);
  }, []);

  const kapitelIndex = useMemo(
    () => (route.name === 'kapitel' || route.name === 'wissenscheck') && route.kapitelId
      ? kapitelListe.findIndex((k) => k.id === route.kapitelId)
      : -1,
    [kapitelListe, route.name, route.kapitelId],
  );
  const kapitel = kapitelIndex >= 0 ? kapitelListe[kapitelIndex] : null;
  const einheit = useMemo(() => {
    if (route.name !== 'kapitel' || !kapitel || !route.einheitId) return null;
    return (kapitel.subChapters || []).find((s) => s.id === route.einheitId) || null;
  }, [route.name, route.einheitId, kapitel]);

  // Kapitel ohne Einheit → erste Einheit; unbekanntes Kapitel/Einheit → Start bzw. erste Einheit
  useEffect(() => {
    if (laden || !daten) return;
    if (route.name === 'kapitel') {
      if (!kapitel) { ersetzeRoute(baueRoute('start')); return; }
      if (!einheit) {
        const erste = (kapitel.subChapters || [])[0];
        if (erste) ersetzeRoute(baueRoute('kapitel', { kapitelId: kapitel.id, einheitId: erste.id }));
        else ersetzeRoute(baueRoute('start'));
      }
    } else if (route.name === 'glossar' && route.slug && umfangAktiv
      && !glossar.some((g) => g.slug === route.slug)) {
      // Nicht im Umfang: wie eine unbekannte Route, ohne Hinweis auf das Ziel.
      ersetzeRoute(baueRoute('start'));
    } else if (route.name === 'wissenscheck' && route.kapitelId && !kapitel) {
      ersetzeRoute(umfangAktiv ? baueRoute('start') : baueRoute('wissenscheck'));
    }
  }, [laden, daten, route, kapitel, einheit, ersetzeRoute, umfangAktiv, glossar]);

  const oeffneKapitel = useCallback((kapitelId, einheitId, blockId) => {
    navigiere(baueRoute('kapitel', { kapitelId, einheitId: einheitId || null, blockId: einheitId && blockId ? blockId : null }));
  }, [navigiere]);
  const oeffneGlossar = useCallback((slug) => navigiere(baueRoute('glossar', { slug: slug || null })), [navigiere]);
  const oeffneWissenscheck = useCallback((kapitelId) => navigiere(baueRoute('wissenscheck', { kapitelId: kapitelId || null })), [navigiere]);
  const zurStartseite = useCallback(() => navigiere(baueRoute('start')), [navigiere]);

  /** Flache Liste aller Lerneinheiten in Lernreihenfolge. */
  const einheitenFolge = useMemo(() => {
    const liste = [];
    kapitelListe.forEach((k, ki) => {
      (k.subChapters || []).forEach((s, si) => liste.push({ kapitel: k, einheit: s, kapitelIndex: ki, einheitIndex: si }));
    });
    return liste;
  }, [kapitelListe]);

  const positionVon = useCallback((kapitelId, einheitId) => einheitenFolge.findIndex(
    (e) => e.kapitel.id === kapitelId && e.einheit.id === einheitId,
  ), [einheitenFolge]);

  const naechsteEinheit = useCallback((kapitelId, einheitId) => {
    const i = positionVon(kapitelId, einheitId);
    return i >= 0 && i < einheitenFolge.length - 1 ? einheitenFolge[i + 1] : null;
  }, [einheitenFolge, positionVon]);

  const vorherigeEinheit = useCallback((kapitelId, einheitId) => {
    const i = positionVon(kapitelId, einheitId);
    return i > 0 ? einheitenFolge[i - 1] : null;
  }, [einheitenFolge, positionVon]);

  // Dokumenttitel folgt der Route
  useEffect(() => {
    let titel = TITEL_APP;
    if (route.name === 'kapitel' && kapitel) {
      titel = einheit ? `${einheit.title} · ${kapitel.title} · ${TITEL_APP}` : `${kapitel.title} · ${TITEL_APP}`;
    } else if (route.name === 'glossar') {
      const g = route.slug ? glossar.find((x) => x.slug === route.slug) : null;
      titel = g ? `${g.term} · Glossar · ${TITEL_APP}` : `Glossar · ${TITEL_APP}`;
    } else if (route.name === 'wissenscheck') {
      titel = kapitel ? `Wissenscheck ${kapitel.title} · ${TITEL_APP}` : `Wissenscheck · ${TITEL_APP}`;
    }
    document.title = titel;
  }, [route, kapitel, einheit, glossar]);

  // Routenwechsel scrollt nach oben — außer bei Block-Deeplinks (macht die Kapitelseite)
  const letzteSeite = useRef(null);
  useEffect(() => {
    const seite = `${route.name}|${route.kapitelId}|${route.einheitId}|${route.slug}`;
    if (letzteSeite.current === seite) return;
    letzteSeite.current = seite;
    if (!route.blockId && !(route.name === 'glossar' && route.slug)) window.scrollTo(0, 0);
  }, [route]);

  // ------------------------------------------------------------ Fortschritt
  // Gespeichert wird immer der ganze Stand (fortschrittRoh); herausgegeben
  // wird die Sicht des Umfangs. Alle Schreibfunktionen arbeiten auf dem rohen
  // Stand — so geht beim Ein- und Ausblenden nichts verloren.
  const [fortschrittRoh, setFortschritt] = useState(() => normalisiereFortschritt(lade(SCHLUESSEL.fortschritt, null, FORTSCHRITT_VERSION)));
  const erstesSchreiben = useRef(true);
  useEffect(() => {
    if (erstesSchreiben.current) { erstesSchreiben.current = false; return; }
    speichere(SCHLUESSEL.fortschritt, fortschrittRoh, FORTSCHRITT_VERSION);
  }, [fortschrittRoh]);

  const fragenSichtbar = useMemo(
    () => kapitelListe.reduce((n, k) => n + (Array.isArray(k.quiz) ? k.quiz.length : 0), 0),
    [kapitelListe],
  );

  const fortschritt = useMemo(() => umfangsFortschritt(fortschrittRoh, {
    sichtbar: new Set(sichtbarIds),
    vollerUmfang: !umfangAktiv,
    fortschrittZeigen: umfangZustand.fortschrittZeigen,
    grenze: umfangZustand.stand,
    fragenSichtbar,
  }), [fortschrittRoh, sichtbarIds, umfangAktiv, umfangZustand.fortschrittZeigen, umfangZustand.stand, fragenSichtbar]);

  // Besuch automatisch merken, wenn eine Lerneinheit offen ist
  useEffect(() => {
    if (route.name !== 'kapitel' || !kapitel || !einheit) return;
    const schluessel = einheitSchluessel(kapitel.id, einheit.id);
    const zeit = new Date().toISOString();
    setFortschritt((f) => ({
      ...f,
      besucht: { ...f.besucht, [schluessel]: zeit },
      zuletzt: { kapitelId: kapitel.id, einheitId: einheit.id, zeit },
    }));
  }, [route.name, kapitel, einheit]);

  const istGelesen = useCallback((kapitelId, einheitId) => Boolean(fortschritt.gelesen[einheitSchluessel(kapitelId, einheitId)]), [fortschritt.gelesen]);

  const markiereGelesen = useCallback((kapitelId, einheitId, wert = true) => {
    const schluessel = einheitSchluessel(kapitelId, einheitId);
    setFortschritt((f) => {
      const gelesen = { ...f.gelesen };
      if (wert) gelesen[schluessel] = new Date().toISOString();
      else delete gelesen[schluessel];
      return { ...f, gelesen };
    });
  }, []);

  const istLesezeichen = useCallback((kapitelId, einheitId) => fortschritt.lesezeichen.includes(einheitSchluessel(kapitelId, einheitId)), [fortschritt.lesezeichen]);

  const toggleLesezeichen = useCallback((kapitelId, einheitId) => {
    const schluessel = einheitSchluessel(kapitelId, einheitId);
    setFortschritt((f) => ({
      ...f,
      lesezeichen: f.lesezeichen.includes(schluessel)
        ? f.lesezeichen.filter((s) => s !== schluessel)
        : [...f.lesezeichen, schluessel],
    }));
  }, []);

  const tiefe = fortschrittRoh.einstellungen.tiefe;

  const setzeTiefe = useCallback((tiefe) => {
    if (!TIEFEN.some((t) => t.wert === tiefe)) return;
    setFortschritt((f) => (f.einstellungen.tiefe === tiefe ? f : { ...f, einstellungen: { ...f.einstellungen, tiefe } }));
  }, []);

  const markiereBestanden = useCallback((kapitelId, prozent) => {
    setFortschritt((f) => ({
      ...f,
      bestanden: { ...f.bestanden, [kapitelId]: { zeit: new Date().toISOString(), prozent } },
    }));
  }, []);

  /**
   * Merkt einen Quizdurchgang: { modus, kapitelIds, richtig, gesamt, falsch: [frageId] }.
   * „Bestanden“ setzt nur ein echter Kapitel-Check (`modus === 'kapitel'`) über
   * genau ein Kapitel mit ≥ 80 % richtig — ein Schnellcheck oder „Fehler
   * wiederholen“, der zufällig nur ein Kapitel berührt, zählt nicht. Deshalb
   * dürfen alle Modi ihre echten Kapitel in den Verlauf melden.
   */
  const merkeQuiz = useCallback((ergebnis) => {
    const zeit = new Date().toISOString();
    const eintrag = {
      zeit,
      modus: ergebnis?.modus || 'schnell',
      kapitelIds: Array.isArray(ergebnis?.kapitelIds) ? [...ergebnis.kapitelIds] : [],
      richtig: Number(ergebnis?.richtig) || 0,
      gesamt: Number(ergebnis?.gesamt) || 0,
      falsch: Array.isArray(ergebnis?.falsch) ? [...ergebnis.falsch] : [],
    };
    setFortschritt((f) => {
      const verlauf = [eintrag, ...f.quiz.verlauf].slice(0, 100);
      let bestanden = f.bestanden;
      if (eintrag.modus === 'kapitel' && eintrag.kapitelIds.length === 1 && eintrag.gesamt > 0 && eintrag.richtig / eintrag.gesamt >= BESTANDEN_AB) {
        bestanden = { ...bestanden, [eintrag.kapitelIds[0]]: { zeit, prozent: Math.round((eintrag.richtig / eintrag.gesamt) * 100) } };
      }
      return { ...f, bestanden, quiz: { ...f.quiz, verlauf } };
    });
    return eintrag;
  }, []);

  /** Pflegt die Leitner-Karte einer Frage: richtig → Box +1 (max. 3), falsch → Box 0, sofort fällig. */
  const merkeAntwort = useCallback((frageId, richtig) => {
    setFortschritt((f) => {
      const alt = f.quiz.karten[frageId] || { versuche: 0, richtig: 0, box: 0, faellig: null };
      const box = richtig ? Math.min(3, (alt.box || 0) + 1) : 0;
      const faellig = new Date(Date.now() + LEITNER_TAGE[box] * 86400000).toISOString();
      const karte = { versuche: alt.versuche + 1, richtig: alt.richtig + (richtig ? 1 : 0), box, faellig };
      return { ...f, quiz: { ...f.quiz, karten: { ...f.quiz.karten, [frageId]: karte } } };
    });
  }, []);

  const faelligeFragen = useCallback(() => {
    const jetzt = Date.now();
    return Object.entries(fortschritt.quiz.karten)
      .filter(([, k]) => !k.faellig || new Date(k.faellig).getTime() <= jetzt)
      .map(([id]) => id);
  }, [fortschritt.quiz.karten]);

  const fortschrittKapitel = useCallback((kapitelId) => {
    const k = kapitelListe.find((x) => x.id === kapitelId);
    const einheiten = k ? (k.subChapters || []) : [];
    const gesamt = einheiten.length;
    const gelesen = einheiten.filter((s) => fortschritt.gelesen[einheitSchluessel(kapitelId, s.id)]).length;
    return { gelesen, gesamt, anteil: gesamt ? gelesen / gesamt : 0, bestanden: Boolean(fortschritt.bestanden[kapitelId]) };
  }, [kapitelListe, fortschritt.gelesen, fortschritt.bestanden]);

  const fortschrittGesamt = useMemo(() => {
    const gesamt = einheitenFolge.length;
    const gelesen = einheitenFolge.filter((e) => fortschritt.gelesen[einheitSchluessel(e.kapitel.id, e.einheit.id)]).length;
    return { gelesen, gesamt, anteil: gesamt ? gelesen / gesamt : 0 };
  }, [einheitenFolge, fortschritt.gelesen]);

  // ------------------------------------------------------------ Lesezeiten
  const lesezeiten = useMemo(() => {
    const je = new Map();
    for (const k of kapitelListe) {
      let summe = 0;
      for (const s of k.subChapters || []) {
        const m = lesezeitMinuten(alleBloecke(s));
        je.set(einheitSchluessel(k.id, s.id), m);
        summe += m;
      }
      je.set(k.id, summe);
    }
    return je;
  }, [kapitelListe]);

  const lesezeitEinheit = useCallback((kapitelId, einheitId) => lesezeiten.get(einheitSchluessel(kapitelId, einheitId)) || 1, [lesezeiten]);
  const lesezeitKapitel = useCallback((kapitelId) => lesezeiten.get(kapitelId) || 0, [lesezeiten]);

  /** Kennzahlen der Startseite — ausschließlich aus den Daten. */
  const kennzahlen = useMemo(() => ({
    kapitel: kapitelListe.length,
    einheiten: einheitenFolge.length,
    begriffe: glossar.length,
    fragen: fragenSichtbar,
    quellen: kapitelListe.reduce((n, k) => n + zaehleQuellen(k.subChapters), 0),
    lesezeitMinuten: kapitelListe.reduce((n, k) => n + (lesezeiten.get(k.id) || 0), 0),
  }), [kapitelListe, einheitenFolge, glossar, lesezeiten, fragenSichtbar]);

  // --------------------------------------------------------------------- UI
  const [sucheOffen, setSucheOffen] = useState(false);
  const [sucheVorbelegung, setSucheVorbelegung] = useState('');
  const oeffneSuche = useCallback((vorbelegung) => {
    setSucheVorbelegung(typeof vorbelegung === 'string' ? vorbelegung : '');
    setSucheOffen(true);
  }, []);
  const schliesseSuche = useCallback(() => setSucheOffen(false), []);

  const [drawerOffen, setDrawerOffenState] = useState(false);
  const setzeDrawer = useCallback((wert) => setDrawerOffenState(Boolean(wert)), []);

  const [hilfeOffen, setHilfeOffen] = useState(false);
  const oeffneHilfe = useCallback(() => setHilfeOffen(true), []);
  const schliesseHilfe = useCallback(() => setHilfeOffen(false), []);

  // Schublade schließt sich bei jedem Routenwechsel
  useEffect(() => { setDrawerOffenState(false); }, [route]);

  // ------------------------------------------------------- Umfang: Bedienung
  const [umfangPanelOffen, setUmfangPanelOffen] = useState(false);
  // Die Fokus-Rückgabe erledigt der Dialog-Baustein (useHintergrundInert steht
  // dort vor useFokusfalle, siehe ui/schweben.js).
  const oeffneUmfangPanel = useCallback(() => setUmfangPanelOffen(true), []);
  const schliesseUmfangPanel = useCallback(() => setUmfangPanelOffen(false), []);
  const schalteUmfangPanel = useCallback(() => setUmfangPanelOffen((o) => !o), []);

  const setzeUmfang = useCallback((teil) => {
    setUmfangZustand((alt) => normalisiereUmfang({
      ...alt, ...teil, wunsch: null, stand: new Date().toISOString(),
    }));
  }, []);

  const alleEinschalten = useCallback(() => setzeUmfang({ profil: 'alles', sichtbar: [] }), [setzeUmfang]);

  const nurErstesKapitel = useCallback(() => {
    if (alleKapitelIds.length === 0) { setzeUmfang({ profil: 'alles', sichtbar: [], wunsch: 'erstes' }); return; }
    setzeUmfang({ profil: 'auswahl', sichtbar: [alleKapitelIds[0]] });
  }, [alleKapitelIds, setzeUmfang]);

  /** Profil der Oberfläche: 'alles' · 'erstes' (immer das erste der Reihenfolge) · 'auswahl'. */
  const umfangProfil = !umfangAktiv ? 'alles'
    : (sichtbarIds.length === 1 && sichtbarIds[0] === alleKapitelIds[0] ? 'erstes' : 'auswahl');

  const setzeProfil = useCallback((profil) => {
    if (profil === 'alles') { alleEinschalten(); return; }
    if (profil === 'erstes') { nurErstesKapitel(); return; }
    setzeUmfang({ profil: 'auswahl', sichtbar: sichtbarIds.length ? sichtbarIds : alleKapitelIds });
  }, [alleEinschalten, nurErstesKapitel, setzeUmfang, sichtbarIds, alleKapitelIds]);

  const schalteKapitel = useCallback((kapitelId) => {
    const gewaehlt = new Set(sichtbarIds);
    if (gewaehlt.has(kapitelId)) gewaehlt.delete(kapitelId); else gewaehlt.add(kapitelId);
    const liste = alleKapitelIds.filter((id) => gewaehlt.has(id));
    // Nichts und alles bedeuten dasselbe: voller Umfang (nie eine leere App).
    if (liste.length === 0 || liste.length === alleKapitelIds.length) alleEinschalten();
    else setzeUmfang({ profil: 'auswahl', sichtbar: liste });
  }, [sichtbarIds, alleKapitelIds, alleEinschalten, setzeUmfang]);

  const setzeFortschrittZeigen = useCallback(
    (wert) => setzeUmfang({ fortschrittZeigen: Boolean(wert) }),
    [setzeUmfang],
  );

  const demoLink = useCallback(
    () => baueUmfangLink(parameterFuerUmfang(umfangZustand, sichtbarIds, alleKapitelIds)),
    [umfangZustand, sichtbarIds, alleKapitelIds],
  );

  // „Erstes Kapitel“ aus der Adresse: die Kennung steht erst mit den Daten fest.
  useEffect(() => {
    if (umfangZustand.wunsch !== 'erstes' || alleKapitelIds.length === 0) return;
    setzeUmfang({ profil: 'auswahl', sichtbar: [alleKapitelIds[0]] });
  }, [umfangZustand.wunsch, alleKapitelIds, setzeUmfang]);

  const umfang = useMemo(() => ({
    profil: umfangProfil,
    sichtbar: sichtbarIds,
    alleKapitelIds,
    fortschrittZeigen: umfangZustand.fortschrittZeigen,
    stand: umfangZustand.stand,
    umfangAktiv,
    setzeUmfang, setzeProfil, schalteKapitel, alleEinschalten, nurErstesKapitel,
    setzeFortschrittZeigen, demoLink,
    panelOffen: umfangPanelOffen, oeffnePanel: oeffneUmfangPanel,
    schliessePanel: schliesseUmfangPanel, schaltePanel: schalteUmfangPanel,
  }), [
    umfangProfil, sichtbarIds, alleKapitelIds, umfangZustand.fortschrittZeigen, umfangZustand.stand,
    umfangAktiv, setzeUmfang, setzeProfil, schalteKapitel, alleEinschalten, nurErstesKapitel,
    setzeFortschrittZeigen, demoLink, umfangPanelOffen, oeffneUmfangPanel, schliesseUmfangPanel,
    schalteUmfangPanel,
  ]);

  const wert = useMemo(() => ({
    daten, datenVoll, laden, fehler, nochmalLaden,
    kapitelListe, glossar, umfang,
    route, kapitel, kapitelIndex, einheit,
    navigiere, ersetzeRoute, oeffneKapitel, oeffneGlossar, oeffneWissenscheck, zurStartseite,
    einheitenFolge, naechsteEinheit, vorherigeEinheit,
    fortschritt, markiereGelesen, istGelesen, toggleLesezeichen, istLesezeichen,
    setzeTiefe, tiefe,
    merkeQuiz, merkeAntwort, markiereBestanden, faelligeFragen,
    fortschrittKapitel, fortschrittGesamt,
    lesezeitEinheit, lesezeitKapitel, kennzahlen,
    sucheOffen, sucheVorbelegung, oeffneSuche, schliesseSuche,
    drawerOffen, setzeDrawer,
    hilfeOffen, oeffneHilfe, schliesseHilfe,
    einheitSchluessel, frageKennung, routeZuHash,
  }), [
    daten, datenVoll, laden, fehler, nochmalLaden, kapitelListe, glossar, umfang,
    route, kapitel, kapitelIndex, einheit,
    navigiere, ersetzeRoute, oeffneKapitel, oeffneGlossar, oeffneWissenscheck, zurStartseite,
    einheitenFolge, naechsteEinheit, vorherigeEinheit, fortschritt, markiereGelesen, istGelesen,
    toggleLesezeichen, istLesezeichen, setzeTiefe, merkeQuiz, merkeAntwort, markiereBestanden,
    faelligeFragen, fortschrittKapitel, fortschrittGesamt, lesezeitEinheit, lesezeitKapitel, kennzahlen, tiefe,
    sucheOffen, sucheVorbelegung, oeffneSuche, schliesseSuche, drawerOffen, setzeDrawer,
    hilfeOffen, oeffneHilfe, schliesseHilfe,
  ]);

  return <WissenContext.Provider value={wert}>{children}</WissenContext.Provider>;
}

/** Zugriff auf den Store; wirft außerhalb des Providers. */
export function useWissen() {
  const ctx = useContext(WissenContext);
  if (!ctx) throw new Error('useWissen() braucht einen WissenProvider.');
  return ctx;
}
