// ═══════════════════════════════════════════════════════════════
// VST Cockpit – Live-Datenstrom
// Solange die Demo offen ist, laufen alle paar Sekunden neue Abschlüsse
// (und vereinzelt Stornos) ein. Der Tag beginnt nicht bei null: Beim Start
// wird der bisherige Geschäftstag (08:00 bis jetzt) aus demselben Generator
// nachgebildet. Cockpit-Kacheln, Vertriebsbericht, Assistent und die
// generierten Dashboards lesen alle denselben Stand, damit jede Zahl überall
// gleich ist.
// ═══════════════════════════════════════════════════════════════
import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { ALL_VERMITTLER, PRODUKTE, VERTRIEBSWEG_VERTEILUNG, mulberry32 } from './cockpitData';

// Ein Abschluss trägt im Schnitt rund 2.800 € Neugeschäftsvolumen (Jahresbeitrag
// × 4); bei rund 60 Abschlüssen je Geschäftstag ergibt das die rund 3,2 Mio. €
// Neugeschäft je Monat aus den Monatsdaten.
const NG_JE_BEITRAG = 4;
const ABSCHLUESSE_JE_TAG = 60;
const STORNO_ANTEIL = 0.12;
const MAX_EREIGNISSE = 400;

/** Abstand zwischen zwei Live-Ereignissen in Millisekunden (Demo-Zeitraffer). */
const ABSTAND_MIN = 3800;
const ABSTAND_MAX = 7600;

const LiveKontext = createContext(null);

function gewichtet(rand, liste, schluessel = 'value') {
  const summe = liste.reduce((s, e) => s + e[schluessel], 0);
  let r = rand() * summe;
  for (const e of liste) { r -= e[schluessel]; if (r <= 0) return e; }
  return liste[liste.length - 1];
}

// Gute Vermittler schließen öfter ab: Gewicht nach Abschlusszahl.
const VERMITTLER_GEWICHTET = ALL_VERMITTLER.map(v => ({ v, value: Math.max(4, v.abschluesse) }));

let laufendeNr = 0;

function erzeugeEreignis(rand, zeit, live) {
  const storno = rand() < STORNO_ANTEIL;
  const p = PRODUKTE[Math.floor(rand() * PRODUKTE.length)];
  const vm = gewichtet(rand, VERMITTLER_GEWICHTET).v;
  const weg = gewichtet(rand, VERTRIEBSWEG_VERTEILUNG).name;
  const beitrag = Math.round(p.beitragRange[0] + rand() * (p.beitragRange[1] - p.beitragRange[0]));
  laufendeNr += 1;
  return {
    id: `LV-${zeit.getTime()}-${laufendeNr}`,
    art: storno ? 'storno' : 'abschluss',
    zeit,
    live,
    vermittler: { id: vm.id, name: vm.name, bundesland: vm.bundesland },
    produkt: p.produkt,
    tarif: p.tarif,
    sparte: p.sparte,
    vertriebsweg: weg,
    beitrag,
    // Faktor der Produktliste in Zehnteln eines Jahresbeitrags (12,5 → 1,25 Jahresbeiträge)
    provision: storno ? 0 : Math.round(beitrag * p.faktor / 10),
    ng: storno ? 0 : beitrag * NG_JE_BEITRAG,
    antragNr: `A-${zeit.getFullYear()}-${String(zeit.getMonth() + 1).padStart(2, '0')}${String(zeit.getDate()).padStart(2, '0')}-${String(laufendeNr).padStart(4, '0')}`,
  };
}

/** Der bisherige Geschäftstag: Ereignisse von 08:00 bis jetzt, gleichmäßig verteilt. */
function bisherigerTag(rand) {
  const jetzt = new Date();
  const beginn = new Date(jetzt); beginn.setHours(8, 0, 0, 0);
  const ende = new Date(jetzt); ende.setHours(18, 0, 0, 0);
  const anteil = Math.min(1, Math.max(0.18, (jetzt - beginn) / (ende - beginn)));
  const anzahl = Math.round(ABSCHLUESSE_JE_TAG * anteil / (1 - STORNO_ANTEIL));
  const bis = Math.min(jetzt.getTime(), ende.getTime());
  const von = Math.min(beginn.getTime(), bis - 3600 * 1000);
  const liste = [];
  for (let i = 0; i < anzahl; i++) {
    const t = new Date(von + ((i + rand() * 0.8) / anzahl) * (bis - von));
    liste.push(erzeugeEreignis(rand, t, false));
  }
  return liste.sort((a, b) => b.zeit - a.zeit);
}

function summe(liste, feld) { return liste.reduce((s, e) => s + (e[feld] || 0), 0); }

function gruppiere(liste, feld) {
  const m = {};
  for (const e of liste) {
    const k = typeof feld === 'function' ? feld(e) : e[feld];
    if (!m[k]) m[k] = { name: k, abschluesse: 0, storni: 0, ng: 0, beitrag: 0, provision: 0 };
    if (e.art === 'abschluss') { m[k].abschluesse += 1; m[k].ng += e.ng; m[k].beitrag += e.beitrag; m[k].provision += e.provision; }
    else m[k].storni += 1;
  }
  return Object.values(m).sort((a, b) => b.ng - a.ng);
}

/** Kennzahlen aus der Ereignisliste (neueste zuerst). */
export function kennzahlen(ereignisse) {
  const abschl = ereignisse.filter(e => e.art === 'abschluss');
  const storni = ereignisse.filter(e => e.art === 'storno');
  const live = ereignisse.filter(e => e.live);
  const liveAbschl = live.filter(e => e.art === 'abschluss');
  return {
    heute: {
      abschluesse: abschl.length,
      storni: storni.length,
      ng: summe(abschl, 'ng'),
      beitrag: summe(abschl, 'beitrag'),
      provision: summe(abschl, 'provision'),
      stornoBeitrag: summe(storni, 'beitrag'),
    },
    seitStart: {
      ereignisse: live.length,
      abschluesse: liveAbschl.length,
      ng: summe(liveAbschl, 'ng'),
      provision: summe(liveAbschl, 'provision'),
    },
    jeSparte: gruppiere(ereignisse, 'sparte'),
    jeVertriebsweg: gruppiere(ereignisse, 'vertriebsweg'),
    jeBundesland: gruppiere(ereignisse, e => e.vermittler.bundesland),
    jeVermittler: gruppiere(abschl, e => e.vermittler.name),
    jeStunde: gruppiere(abschl, e => `${String(e.zeit.getHours()).padStart(2, '0')}:00`).sort((a, b) => a.name.localeCompare(b.name)),
  };
}

export function LiveProvider({ children }) {
  const rand = useMemo(() => {
    const d = new Date();
    return mulberry32(d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate());
  }, []);
  const [ereignisse, setEreignisse] = useState(() => bisherigerTag(rand));
  const [laeuft, setLaeuft] = useState(true);
  const [stand, setStand] = useState(() => new Date());
  const timer = useRef(null);

  useEffect(() => {
    if (!laeuft) return undefined;
    const naechster = () => {
      const warte = ABSTAND_MIN + rand() * (ABSTAND_MAX - ABSTAND_MIN);
      timer.current = setTimeout(() => {
        const jetzt = new Date();
        setEreignisse(prev => [erzeugeEreignis(rand, jetzt, true), ...prev].slice(0, MAX_EREIGNISSE));
        setStand(jetzt);
        naechster();
      }, warte);
    };
    naechster();
    return () => clearTimeout(timer.current);
  }, [laeuft, rand]);

  // Präsentation und Assistent können einen Abschluss sofort auslösen,
  // damit man den Effekt nicht abwarten muss.
  const sofort = useCallback(() => {
    const jetzt = new Date();
    setEreignisse(prev => {
      let e = erzeugeEreignis(rand, jetzt, true);
      while (e.art !== 'abschluss') e = erzeugeEreignis(rand, jetzt, true);
      return [e, ...prev].slice(0, MAX_EREIGNISSE);
    });
    setStand(jetzt);
  }, [rand]);

  const wert = useMemo(() => ({
    ereignisse, stand, laeuft, setLaeuft, sofort, ...kennzahlen(ereignisse),
  }), [ereignisse, stand, laeuft, sofort]);

  return <LiveKontext.Provider value={wert}>{children}</LiveKontext.Provider>;
}

export function useLive() {
  const ctx = useContext(LiveKontext);
  if (!ctx) throw new Error('useLive braucht den LiveProvider');
  return ctx;
}

/**
 * Wendet die seit dem Öffnen eingelaufenen Abschlüsse auf den laufenden Monat
 * an: Neugeschäft, Bestand, Ergebnis und Deckungsbeitrag wachsen mit. Bei
 * gewählten Bundesländern zählen nur deren Abschlüsse.
 */
export function mitLiveMonat(daten, ereignisse, bundeslaender) {
  if (!daten.length) return daten;
  const live = ereignisse.filter(e => e.live && e.art === 'abschluss'
    && (!bundeslaender || bundeslaender.size === 0 || bundeslaender.has(e.vermittler.bundesland)));
  if (!live.length) return daten;
  const ng = summe(live, 'ng');
  const letzter = daten[daten.length - 1];
  const neu = {
    ...letzter,
    neugeschaeft: letzter.neugeschaeft + ng,
    bestand: letzter.bestand + Math.round(ng * 0.12),
    ergebnis: letzter.ergebnis + Math.round(ng * 0.47),
    deckungsbeitrag: letzter.deckungsbeitrag + Math.round(ng * 0.35),
  };
  return [...daten.slice(0, -1), neu];
}
