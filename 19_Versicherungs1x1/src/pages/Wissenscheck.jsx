// ===========================================================================
// Wissenscheck — Lernerfolgskontrolle in drei Schritten (Brief §6):
//   Einrichtung: Moduskarten Schnellcheck · Kapitel-Check · Wiederholen ·
//     Kompletttest, Kapitelwahl mit Chips, letzte Durchgänge, bestandene Kapitel.
//   Frage: eine je Bildschirm, Tasten 1–4 / A–D wählen, Enter oder → weiter,
//     Esc bricht mit Bestätigung ab; sofortiges Feedback mit Erklärung und
//     „Im Kapitel nachlesen“ (einheitId → Einheit, sonst Kapitel).
//   Ergebnis: Ring, Wertung, Balken je Kapitel, Fehlerliste, Knöpfe.
// Jede Antwort ruft merkeAntwort (Leitner-Karte), jeder abgeschlossene
// Durchgang merkeQuiz (Verlauf; setzt „bestanden“ beim Kapitel-Check).
// Fragen werden nur über `${kapitelId}#${index}` referenziert; die Route
// #/wissenscheck/:kapitelId wählt das Kapitel vor. Verlässt man die Seite
// mitten im Durchgang (etwa zum Nachlesen), merkt sich das Modul den Stand
// und bietet beim nächsten Öffnen „Fortsetzen“ an.
// ===========================================================================
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Play, Zap, ListChecks, RotateCcw, Layers } from 'lucide-react';
import { useWissen } from '../store/Wissen.jsx';
import ModusWahl from '../components/quiz/ModusWahl.jsx';
import KapitelWahl from '../components/quiz/KapitelWahl.jsx';
import Frage from '../components/quiz/Frage.jsx';
import Ergebnis from '../components/quiz/Ergebnis.jsx';
import Verlauf from '../components/quiz/Verlauf.jsx';
import Knopf from '../components/ui/Knopf.jsx';
import Karte from '../components/ui/Karte.jsx';
import Dialog from '../components/ui/Dialog.jsx';
import {
  MODUS_NAMEN, SCHNELLCHECK_ANZAHL,
  sammleFragen, fragenJeKapitel as zaehleFragenJeKapitel, wiederholungsFragen, stelleDurchgangZusammen,
  geschaetzteMinuten, neuerSeed, zaehleErgebnis, letzteErgebnisseJeKapitel, leitnerHinweis,
} from '../lib/quiz.js';
import { mehrzahl, minuten } from '../lib/format.js';

// Ein unterbrochener Durchgang überlebt den Seitenwechsel (nicht den Reload):
// wer zum Nachlesen ins Kapitel springt, kann danach weitermachen.
let unterbrochenerDurchgang = null;

const AUSGANG = { phase: 'einrichtung', durchgang: null, index: 0, antworten: [] };

function reduziere(zustand, aktion) {
  switch (aktion.typ) {
    case 'start':
      return { phase: 'frage', durchgang: aktion.durchgang, index: 0, antworten: [] };
    case 'fortsetzen':
      return { phase: 'frage', durchgang: aktion.durchgang, index: aktion.index, antworten: aktion.antworten };
    case 'antwort': {
      if (zustand.phase !== 'frage' || zustand.antworten[zustand.index]) return zustand;
      const antworten = zustand.antworten.slice();
      antworten[zustand.index] = aktion.antwort;
      return { ...zustand, antworten };
    }
    case 'weiter': {
      if (zustand.phase !== 'frage' || !zustand.antworten[zustand.index]) return zustand;
      if (zustand.index + 1 < zustand.durchgang.fragen.length) return { ...zustand, index: zustand.index + 1 };
      return { ...zustand, phase: 'ergebnis' };
    }
    case 'uebersicht':
      return AUSGANG;
    default:
      return zustand;
  }
}

const INTERAKTIV = 'a[href], button, [role="button"], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function Wissenscheck() {
  const {
    kapitelListe, route, fortschritt, merkeQuiz, merkeAntwort, faelligeFragen,
    sucheOffen, hilfeOffen, drawerOffen, routeZuHash,
  } = useWissen();

  // ---------------------------------------------------------------- Daten
  const alleFragen = useMemo(() => sammleFragen(kapitelListe), [kapitelListe]);
  const fragenJeKapitel = useMemo(() => zaehleFragenJeKapitel(alleFragen), [alleFragen]);
  const wiederholung = useMemo(
    () => wiederholungsFragen(alleFragen, fortschritt.quiz.karten, faelligeFragen()),
    [alleFragen, fortschritt.quiz.karten, faelligeFragen],
  );
  const letzteErgebnisse = useMemo(() => letzteErgebnisseJeKapitel(fortschritt.quiz.verlauf), [fortschritt.quiz.verlauf]);

  // Ein Durchgang hängt an den Fragen, die beim Zusammenstellen sichtbar
  // waren. Ändert sich der Umfang (store/umfang.js), passt er nicht mehr:
  // dann gelten weder der laufende noch der unterbrochene Durchgang.
  const imUmfang = useCallback(
    (durchgang) => Boolean(durchgang) && durchgang.fragen.every((f) => fragenJeKapitel.has(f.kapitelId)),
    [fragenJeKapitel],
  );

  // ---------------------------------------------------------- Einrichtung
  const vorwahl = route.kapitelId && fragenJeKapitel.get(route.kapitelId) ? route.kapitelId : null;
  const [modus, setModus] = useState(vorwahl ? 'kapitel' : 'schnell');
  const [gewaehlt, setGewaehlt] = useState(vorwahl ? [vorwahl] : []);
  useEffect(() => {
    if (vorwahl) { setModus('kapitel'); setGewaehlt([vorwahl]); }
  }, [vorwahl]);
  useEffect(() => {
    if (modus === 'wiederholen' && wiederholung.length === 0) setModus('schnell');
  }, [modus, wiederholung.length]);

  const gewaehltSortiert = useMemo(
    () => kapitelListe.map((k) => k.id).filter((id) => gewaehlt.includes(id)),
    [kapitelListe, gewaehlt],
  );
  const anzahlKapitel = gewaehltSortiert.reduce((n, id) => n + (fragenJeKapitel.get(id) || 0), 0);
  const anzahlSchnell = Math.min(SCHNELLCHECK_ANZAHL, alleFragen.length);
  const dauer = (n) => `ca. ${minuten(geschaetzteMinuten(n))}`;

  const modi = useMemo(() => [
    {
      wert: 'schnell', label: MODUS_NAMEN.schnell, symbol: Zap,
      text: `${SCHNELLCHECK_ANZAHL} zufällige Fragen aus allen Kapiteln – der schnelle Überblick zwischen zwei Terminen.`,
      meta: `${mehrzahl(anzahlSchnell, 'Frage', 'Fragen')} · ${dauer(anzahlSchnell)}`,
    },
    {
      wert: 'kapitel', label: MODUS_NAMEN.kapitel, symbol: ListChecks,
      text: 'Alle Fragen zu einem oder mehreren Kapiteln. Ein einzelnes Kapitel gilt ab 80 % als bestanden.',
      meta: anzahlKapitel > 0 ? `${mehrzahl(anzahlKapitel, 'Frage', 'Fragen')} · ${dauer(anzahlKapitel)}` : 'Kapitel unten wählen',
    },
    {
      wert: 'wiederholen', label: MODUS_NAMEN.wiederholen, symbol: RotateCcw,
      text: 'Fällige Karten und Fragen, die du noch nie richtig hattest – nach 1, 3 und 7 Tagen wieder.',
      meta: wiederholung.length > 0 ? `${mehrzahl(wiederholung.length, 'Frage fällig', 'Fragen fällig')} · ${dauer(wiederholung.length)}` : 'Nichts fällig',
      deaktiviert: wiederholung.length === 0,
      hinweis: 'Fragen landen hier, sobald du sie falsch beantwortet hast oder ihr Wiederholungsabstand (1 · 3 · 7 Tage) abgelaufen ist.',
    },
    {
      wert: 'komplett', label: MODUS_NAMEN.komplett, symbol: Layers,
      text: 'Alle Fragen in Kapitelreihenfolge – die große Lernerfolgskontrolle am Ende der ersten Woche.',
      meta: `${mehrzahl(alleFragen.length, 'Frage', 'Fragen')} · ${dauer(alleFragen.length)}`,
    },
  ], [anzahlSchnell, anzahlKapitel, wiederholung.length, alleFragen.length]);

  const anzahl = modus === 'schnell' ? anzahlSchnell
    : modus === 'kapitel' ? anzahlKapitel
      : modus === 'wiederholen' ? wiederholung.length
        : alleFragen.length;

  const umschaltenKapitel = useCallback((id) => {
    setGewaehlt((g) => (g.includes(id) ? g.filter((x) => x !== id) : [...g, id]));
  }, []);
  const alleKapitel = useCallback(() => setGewaehlt(kapitelListe.filter((k) => fragenJeKapitel.get(k.id)).map((k) => k.id)), [kapitelListe, fragenJeKapitel]);
  const keinKapitel = useCallback(() => setGewaehlt([]), []);

  // ------------------------------------------------------------ Durchgang
  const [lauf, dispatch] = useReducer(reduziere, AUSGANG);
  const [abbruchOffen, setAbbruchOffen] = useState(false);
  const [unterbrochen, setUnterbrochen] = useState(
    () => (imUmfang(unterbrochenerDurchgang && unterbrochenerDurchgang.durchgang) ? unterbrochenerDurchgang : null),
  );
  const titelRef = useRef(null);

  const starte = useCallback((vorgabe) => {
    const durchgang = stelleDurchgangZusammen({
      modus: vorgabe?.modus || modus,
      alleFragen,
      kapitelIds: vorgabe?.kapitelIds || gewaehltSortiert,
      wiederholung,
      nur: vorgabe?.nur || null,
      seed: neuerSeed(),
    });
    if (durchgang.fragen.length === 0) return;
    unterbrochenerDurchgang = null;
    setUnterbrochen(null);
    dispatch({ typ: 'start', durchgang });
  }, [modus, alleFragen, gewaehltSortiert, wiederholung]);

  // Umfangswechsel: alter Durchgang und unterbrochener Stand gelten nicht mehr.
  useEffect(() => {
    if (unterbrochenerDurchgang && !imUmfang(unterbrochenerDurchgang.durchgang)) {
      unterbrochenerDurchgang = null;
      setUnterbrochen(null);
    }
    if (lauf.phase !== 'einrichtung' && !imUmfang(lauf.durchgang)) dispatch({ typ: 'uebersicht' });
  }, [imUmfang, lauf.phase, lauf.durchgang]);

  const frage = lauf.phase === 'frage' ? lauf.durchgang.fragen[lauf.index] : null;
  const antwort = frage ? lauf.antworten[lauf.index] || null : null;

  const antworte = useCallback((i) => {
    if (!frage || antwort) return;
    const richtig = i === frage.richtig;
    dispatch({ typ: 'antwort', antwort: { gewaehlt: i, richtig, hinweis: leitnerHinweis(fortschritt.quiz.karten[frage.frageId], richtig) } });
    merkeAntwort(frage.frageId, richtig);
  }, [frage, antwort, fortschritt.quiz.karten, merkeAntwort]);

  const weiter = useCallback(() => { if (antwort) dispatch({ typ: 'weiter' }); }, [antwort]);

  const zurUebersicht = useCallback(() => {
    unterbrochenerDurchgang = null;
    setUnterbrochen(null);
    setAbbruchOffen(false);
    dispatch({ typ: 'uebersicht' });
  }, []);

  const fortsetzen = useCallback(() => {
    const u = unterbrochenerDurchgang;
    unterbrochenerDurchgang = null;
    setUnterbrochen(null);
    if (u) dispatch({ typ: 'fortsetzen', durchgang: u.durchgang, index: u.index, antworten: u.antworten });
  }, []);
  const verwerfen = useCallback(() => { unterbrochenerDurchgang = null; setUnterbrochen(null); }, []);

  // Ergebnis einmal je Durchgang merken (setzt „bestanden“ beim Kapitel-Check)
  const gemerkt = useRef(null);
  useEffect(() => {
    if (lauf.phase !== 'ergebnis' || !lauf.durchgang || gemerkt.current === lauf.durchgang.seed) return;
    gemerkt.current = lauf.durchgang.seed;
    const { richtig, gesamt, falsch } = zaehleErgebnis(lauf.durchgang.fragen, lauf.antworten);
    merkeQuiz({
      modus: lauf.durchgang.modus,
      kapitelIds: lauf.durchgang.kapitelIds,
      richtig,
      gesamt,
      falsch: falsch.map((f) => f.frage.frageId),
    });
  }, [lauf, merkeQuiz]);

  // Unterbrochenen Durchgang beim Verlassen der Seite aufheben
  const laufRef = useRef(lauf);
  useEffect(() => { laufRef.current = lauf; });
  useEffect(() => () => {
    const z = laufRef.current;
    if (z && z.phase === 'frage' && z.durchgang) {
      unterbrochenerDurchgang = { durchgang: z.durchgang, index: z.index, antworten: z.antworten, zeit: Date.now() };
    }
  }, []);

  // Tastatur während einer Frage: 1–4 / A–D wählen, Enter oder → weiter,
  // Esc abbrechen. Capture-Phase, damit der globale Handler (w, g, …) nicht
  // zuerst greift; nichts davon gilt, solange Suche, Hilfe, Schublade oder
  // der Abbruch-Dialog offen sind.
  useEffect(() => {
    if (lauf.phase !== 'frage' || !frage) return undefined;
    const aufTaste = (e) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if (sucheOffen || hilfeOffen || drawerOffen || abbruchOffen) return;
      const ziel = e.target;
      if (ziel instanceof Element && ziel.closest('input, textarea, select, [contenteditable="true"]')) return;
      const taste = e.key;
      if (taste === 'Escape') { e.preventDefault(); setAbbruchOffen(true); return; }
      if (!antwort) {
        let i = -1;
        if (/^[1-9]$/.test(taste)) i = Number(taste) - 1;
        else if (/^[a-fA-F]$/.test(taste)) i = taste.toUpperCase().charCodeAt(0) - 65;
        if (i >= 0 && i < frage.optionen.length) { e.preventDefault(); antworte(i); }
        return;
      }
      if (taste === 'Enter' || taste === 'ArrowRight') {
        // Enter auf einem fokussierten Knopf oder Link bleibt dessen Klick
        // (Nachlesen, Abbrechen, Weiter) — nur nicht auf den beantworteten Optionen.
        const aktiv = document.activeElement;
        const aufKnopf = taste === 'Enter' && aktiv && aktiv !== document.body && aktiv.matches(INTERAKTIV) && !aktiv.closest('.quiz-antworten');
        if (aufKnopf) return;
        e.preventDefault();
        weiter();
      }
    };
    window.addEventListener('keydown', aufTaste, true);
    return () => window.removeEventListener('keydown', aufTaste, true);
  }, [lauf.phase, frage, antwort, antworte, weiter, sucheOffen, hilfeOffen, drawerOffen, abbruchOffen]);

  // Fokus zurück auf den Seitentitel, wenn die Einrichtung wieder erscheint
  const vorigePhase = useRef(lauf.phase);
  useEffect(() => {
    if (vorigePhase.current !== 'einrichtung' && lauf.phase === 'einrichtung' && titelRef.current) {
      if (window.scrollY > 0) window.scrollTo({ top: 0 });
      titelRef.current.focus({ preventScroll: true });
    }
    vorigePhase.current = lauf.phase;
  }, [lauf.phase]);

  // ----------------------------------------------------------------- Frage
  if (lauf.phase === 'frage' && frage) {
    const nachleseHref = routeZuHash({ name: 'kapitel', kapitelId: frage.kapitelId, einheitId: frage.einheitId || null });
    return (
      <div className="seite quiz">
        <h1 className="sr-only">Wissenscheck – {MODUS_NAMEN[lauf.durchgang.modus] || lauf.durchgang.modus}</h1>
        <div className="quiz-buehne">
          <Frage
            key={frage.frageId}
            frage={frage}
            position={lauf.index + 1}
            gesamt={lauf.durchgang.fragen.length}
            antwort={antwort}
            nachleseHref={nachleseHref}
            onAntwort={antworte}
            onWeiter={weiter}
            onAbbrechen={() => setAbbruchOffen(true)}
          />
        </div>
        <Dialog
          offen={abbruchOffen}
          onSchliessen={() => setAbbruchOffen(false)}
          titel="Durchgang abbrechen?"
          breite={440}
          fuss={(
            <>
              <Knopf onClick={() => setAbbruchOffen(false)} data-autofokus>Weitermachen</Knopf>
              <Knopf variante="primaer" onClick={zurUebersicht}>Ja, abbrechen</Knopf>
            </>
          )}
        >
          <p className="nebentext">
            Deine bisherigen Antworten zählen für die Wiederholung. Der Durchgang selbst wird nicht gewertet und erscheint nicht im Verlauf.
          </p>
        </Dialog>
      </div>
    );
  }

  // -------------------------------------------------------------- Ergebnis
  if (lauf.phase === 'ergebnis' && lauf.durchgang) {
    const d = lauf.durchgang;
    const { falsch } = zaehleErgebnis(d.fragen, lauf.antworten);
    return (
      <div className="seite quiz">
        <div className="quiz-buehne quiz-buehne-breit">
          <Ergebnis
            durchgang={d}
            antworten={lauf.antworten}
            kapitelListe={kapitelListe}
            onFehlerWiederholen={() => starte({ modus: 'wiederholen', nur: falsch.map((f) => f.frage.frageId) })}
            onNeu={() => starte(d.nur ? { modus: d.modus, nur: d.nur } : { modus: d.modus, kapitelIds: d.kapitelIds })}
            onUebersicht={zurUebersicht}
          />
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------- Einrichtung
  const startText = anzahl > 0
    ? `${mehrzahl(anzahl, 'Frage', 'Fragen')} · ${dauer(anzahl)}`
    : modus === 'kapitel' ? 'Wähle mindestens ein Kapitel.' : 'Zurzeit keine Fragen.';

  return (
    <div className="seite quiz">
      <header className="quiz-kopf">
        <div className="ueberschrift-meta">Lernerfolgskontrolle</div>
        <h1 ref={titelRef} tabIndex={-1}>Wissenscheck</h1>
        <p className="nebentext">
          Teste dein Wissen: {mehrzahl(alleFragen.length, 'Frage', 'Fragen')} aus {mehrzahl(kapitelListe.length, 'Kapitel', 'Kapiteln')}, jede mit sofortiger Erklärung und Sprung zur Textstelle. Falsch beantwortete Fragen kommen nach 1, 3 und 7 Tagen wieder.
        </p>
      </header>

      {unterbrochen && unterbrochen.durchgang && (
        <div className="quiz-fortsetzen" role="region" aria-label="Unterbrochener Durchgang">
          <span className="quiz-fortsetzen-text">
            <strong>Unterbrochener Durchgang</strong>
            <span className="nebentext">{MODUS_NAMEN[unterbrochen.durchgang.modus] || unterbrochen.durchgang.modus} · Frage {unterbrochen.index + 1} von {unterbrochen.durchgang.fragen.length}</span>
          </span>
          <span className="quiz-fortsetzen-knoepfe">
            <Knopf variante="primaer" groesse="klein" symbol={Play} onClick={fortsetzen}>Fortsetzen</Knopf>
            <Knopf variante="still" groesse="klein" onClick={verwerfen}>Verwerfen</Knopf>
          </span>
        </div>
      )}

      <div className="quiz-raster">
        <Karte als="section" aria-labelledby="einrichtung-titel" className="quiz-einrichtung">
          <div className="karte-kopf"><h2 id="einrichtung-titel">Was möchtest du prüfen?</h2></div>
          <ModusWahl modi={modi} wert={modus} onWechsel={setModus} label="Modus" />
          {modus === 'kapitel' && (
            <KapitelWahl
              kapitelListe={kapitelListe}
              gewaehlt={gewaehlt}
              fragenJeKapitel={fragenJeKapitel}
              letzteErgebnisse={letzteErgebnisse}
              bestanden={fortschritt.bestanden}
              onUmschalten={umschaltenKapitel}
              onAlle={alleKapitel}
              onKeine={keinKapitel}
            />
          )}
          <div className="quiz-start">
            <Knopf variante="primaer" groesse="gross" symbol={Play} onClick={() => starte()} disabled={anzahl === 0}>
              {MODUS_NAMEN[modus]} starten
            </Knopf>
            <span className="quiz-start-meta" aria-live="polite">{startText}</span>
          </div>
        </Karte>

        <Verlauf verlauf={fortschritt.quiz.verlauf} kapitelListe={kapitelListe} bestanden={fortschritt.bestanden} />
      </div>
    </div>
  );
}
