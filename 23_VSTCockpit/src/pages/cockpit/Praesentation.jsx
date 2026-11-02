import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { X, AlertTriangle, Lightbulb, ArrowRight, ChevronLeft } from 'lucide-react';
import { BUNDESLAND_DATA } from './cockpitData';
import { FARBE } from './format';

// Bundesland mit dem meisten Neugeschäft: Ziel des Karten-Schritts.
const STAERKSTES_LAND = [...BUNDESLAND_DATA].sort((a, b) => b.neugeschaeft - a.neugeschaeft)[0].name;

/**
 * Schritte des geführten Durchlaufs durch das echte Cockpit. `betreten` stellt
 * die Oberfläche her (Reiter, Filter, Assistent), `ziel` ist das Element mit
 * dem passenden `data-praes`, auf dem der Spotlight liegt.
 */
const SCHRITTE = [
  {
    titel: 'Lagebild auf einen Blick',
    unter: 'Neun Kennzahlen des Vertriebs über zwölf Monate',
    ziel: 'kacheln', karte: 'rechts',
    problem: ['Kennzahlen liegen verteilt in Berichten und Excel-Dateien', 'Jeder Bereich rechnet mit eigenem Stand', 'Das Gesamtbild entsteht erst zum Monatsende'],
    loesung: 'Ein Cockpit für Neugeschäft, Bestand, Storno, NPS, Risiko und Ergebnis, je Kennzahl mit Verlauf, Verteilung und Vollbild.',
    betreten: (a) => { a.setView('dashboard'); a.setFlaeche(null); a.setChatOffen(false); a.setForecast(false); a.setLaender(new Set()); },
  },
  {
    titel: 'Live statt Monatsbericht',
    unter: 'Abschlüsse und Storni laufen ein, während die Demo offen ist',
    ziel: 'live', karte: 'rechts',
    problem: ['Berichte zeigen den Stand von gestern', 'Neugeschäft wird erst nach der Policierung sichtbar'],
    loesung: 'Jeder Eingang erscheint sofort: Die Tageszahlen zählen hoch, der laufende Monat in den Kacheln wächst mit, der Vertriebsbericht zeigt die Eingänge von heute.',
    betreten: (a) => { a.setView('dashboard'); a.setFlaeche(null); a.setChatOffen(false); a.setForecast(false); a.setLaender(new Set()); a.live.sofort(); },
  },
  {
    titel: 'Regional steuern',
    unter: `Ein Klick auf die Karte filtert alle Kacheln, hier auf ${STAERKSTES_LAND}`,
    ziel: 'karte', karte: 'links',
    problem: ['Regionale Unterschiede gehen im Gesamtbild unter', 'Für jede Region braucht es einen eigenen Bericht'],
    loesung: 'Bundesländer auf der Karte an- und abwählen: Kennzahlen, Verläufe und Live-Zuwachs rechnen sofort auf die Auswahl.',
    betreten: (a) => { a.setView('dashboard'); a.setFlaeche(null); a.setChatOffen(false); a.setForecast(false); a.setLaender(new Set([STAERKSTES_LAND])); },
  },
  {
    titel: 'Blick nach vorn',
    unter: 'Der AI Forecast schreibt jede Kennzahl sechs Monate fort',
    ziel: 'kachel-erste', karte: 'rechts',
    problem: ['Steuerung schaut zurück', 'Abweichungen fallen erst auf, wenn sie eingetreten sind'],
    loesung: 'Ein Schalter im Kopf legt über jede Kennzahl die Prognose der nächsten sechs Monate, gestrichelt in Gold neben dem Ist.',
    betreten: (a) => { a.setView('dashboard'); a.setFlaeche(null); a.setChatOffen(false); a.setLaender(new Set()); a.setForecast(true); },
  },
  {
    titel: 'Fragen statt suchen',
    unter: 'Der KI-Assistent beantwortet Fragen zum Vertrieb in Sekunden',
    ziel: 'assistent', karte: 'links',
    problem: ['Jede neue Frage heißt: Auswertung anfordern und warten', 'Antworten kommen als Tabelle, nicht als Bild'],
    loesung: 'Frage stellen, die Arbeitsschritte laufen sichtbar ab, daneben entsteht das passende Dashboard aus denselben Daten wie das Cockpit.',
    betreten: (a) => {
      a.setView('dashboard'); a.setForecast(false); a.setLaender(new Set());
      a.setChatOffen(true);
      setTimeout(() => a.assistent.current?.frage('plan'), 350);
    },
  },
  {
    titel: 'Dashboard in Sekunden',
    unter: 'Neugeschäft gegen Plan, generiert aus Cockpit- und Live-Daten',
    ziel: 'dashboard', karte: 'rechts',
    problem: ['Dashboards zu bauen dauert Tage und braucht BI-Spezialisten'],
    loesung: 'Kennzahlen, Verlauf Ist gegen Plan, Abweichungen und eine KI-Einschätzung mit den Zahlen dahinter. Kacheln mit Live-Marke rechnen bei jedem Eingang neu.',
    betreten: (a) => {
      a.setView('dashboard'); a.setChatOffen(true);
      if (!a.flaeche) a.zeigeDashboard('plan', false);
    },
  },
  {
    titel: 'Ans Cockpit heften',
    unter: 'Das Dashboard bleibt und läuft live weiter',
    ziel: 'ki-kopf', karte: 'rechts',
    problem: ['Gute Auswertungen verschwinden in Postfächern und Ordnern'],
    loesung: 'Ein Klick heftet das Dashboard in den Reiter KI-Dashboards. Dort steht es neben dem Cockpit und zählt mit jedem Abschluss mit.',
    betreten: (a) => {
      if (!a.angeheftet.includes('plan')) a.anheften('plan');
      a.setFlaeche(null); a.setChatOffen(false); a.setView('ki');
    },
  },
];

function useZielRahmen(ziel, offen) {
  const [rahmen, setRahmen] = useState(null);
  useEffect(() => {
    if (!offen) return undefined;
    let gescrollt = false;
    const messen = () => {
      const el = ziel && document.querySelector(`[data-praes="${ziel}"]`);
      if (!el) { setRahmen(null); return; }
      const r = el.getBoundingClientRect();
      if (!gescrollt && (r.top < 0 || r.bottom > window.innerHeight) && r.height < window.innerHeight) {
        gescrollt = true;
        el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
      setRahmen(alt => (alt && alt.x === r.left && alt.y === r.top && alt.w === r.width && alt.h === r.height ? alt : { x: r.left, y: r.top, w: r.width, h: r.height }));
    };
    messen();
    // Ziele erscheinen oder wachsen mit Animationen; daher laufend nachmessen.
    const t = setInterval(messen, 200);
    window.addEventListener('resize', messen);
    return () => { clearInterval(t); window.removeEventListener('resize', messen); };
  }, [ziel, offen]);
  return rahmen;
}

/** Geführte Präsentation über das echte VST-Cockpit. */
export default function Praesentation({ offen, onClose, api }) {
  const [schritt, setSchritt] = useState(0);
  const s = SCHRITTE[schritt];
  const rahmen = useZielRahmen(s.ziel, offen);
  const letzter = schritt === SCHRITTE.length - 1;

  const gehe = useCallback((i) => {
    const n = Math.max(0, Math.min(SCHRITTE.length - 1, i));
    setSchritt(n);
    // Jeder Schritt beginnt oben; liegt das Ziel tiefer, holt es die Messung ins Bild.
    window.scrollTo({ top: 0, behavior: 'smooth' });
    SCHRITTE[n].betreten(api);
  }, [api]);

  useEffect(() => {
    if (offen) { setSchritt(0); window.scrollTo({ top: 0 }); SCHRITTE[0].betreten(api); }
    // nur beim Öffnen
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offen]);

  const weiter = useCallback(() => { if (letzter) onClose(); else gehe(schritt + 1); }, [letzter, onClose, gehe, schritt]);
  const zurueck = useCallback(() => gehe(schritt - 1), [gehe, schritt]);

  useEffect(() => {
    if (!offen) return undefined;
    const taste = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      // Abgefangen in der Capture-Phase, damit z. B. Esc nicht zusätzlich die Dashboard-Fläche schließt.
      if (['ArrowRight', ' ', 'Enter', 'PageDown'].includes(e.key)) { e.preventDefault(); e.stopPropagation(); weiter(); }
      else if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); e.stopPropagation(); zurueck(); }
      else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); onClose(); }
    };
    window.addEventListener('keydown', taste, true);
    return () => window.removeEventListener('keydown', taste, true);
  }, [offen, weiter, zurueck, onClose]);

  if (!offen) return null;
  const rand = 8;

  return createPortal(
    <div className="fixed inset-0 z-[80] pointer-events-none">
      {rahmen ? (
        <div
          className="fixed rounded-xl"
          style={{
            left: rahmen.x - rand, top: rahmen.y - rand, width: rahmen.w + rand * 2, height: rahmen.h + rand * 2,
            boxShadow: '0 0 0 9999px rgba(20,16,18,0.55)',
            outline: `2px solid ${FARBE.gold}`, outlineOffset: 0,
            transition: 'all 400ms cubic-bezier(0.16,1,0.3,1)',
          }}
        />
      ) : (
        <div className="fixed inset-0" style={{ background: 'rgba(20,16,18,0.25)' }} />
      )}

      <div
        className={clsx('fixed bottom-6 w-[440px] bg-white rounded-2xl border border-slate-200 shadow-2xl pointer-events-auto animate-fade-in-up', s.karte === 'rechts' ? 'right-6' : 'left-6')}
        key={schritt}
      >
        <div className="px-5 pt-4 pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1">
              {SCHRITTE.map((x, i) => (
                <button
                  key={x.titel}
                  onClick={() => gehe(i)}
                  title={x.titel}
                  className={clsx('w-7 h-7 rounded-lg text-xs font-semibold transition-colors',
                    i === schritt ? 'text-white' : i < schritt ? 'bg-[#eef1e6] text-[#46552b]' : 'bg-slate-100 text-slate-500 hover:bg-slate-200')}
                  style={i === schritt ? { background: FARBE.modus } : undefined}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100" title="Präsentation beenden (Esc)">
              <X size={16} />
            </button>
          </div>
          <div className="mt-3 text-[11px] font-semibold tracking-[0.14em] uppercase text-slate-400">Schritt {schritt + 1} von {SCHRITTE.length}</div>
          <h3 className="text-lg font-semibold text-slate-900 leading-snug">{s.titel}</h3>
          <p className="text-sm text-slate-500">{s.unter}</p>
        </div>

        <div className="px-5 py-4 space-y-3">
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-1.5">
              <AlertTriangle size={15} className="text-amber-600" /> Problem
            </div>
            <ul className="space-y-1 text-[13px] text-slate-700">
              {s.problem.map(p => <li key={p} className="flex gap-2"><span className="text-amber-500">–</span>{p}</li>)}
            </ul>
          </div>
          <div className="rounded-xl border px-3.5 py-3" style={{ borderColor: 'rgba(97,117,58,0.35)', background: FARBE.modusZart }}>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-1.5">
              <Lightbulb size={15} style={{ color: FARBE.modus }} /> Lösung
            </div>
            <p className="text-[13px] text-slate-700 leading-relaxed">{s.loesung}</p>
          </div>
        </div>

        <div className="px-5 pb-4 flex items-center justify-between gap-3">
          <button onClick={zurueck} disabled={schritt === 0} className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent">
            <ChevronLeft size={16} /> Zurück
          </button>
          <button onClick={weiter} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white min-w-0" style={{ background: FARBE.modus }}>
            <span className="truncate">{letzter ? 'Präsentation beenden' : `Weiter: ${SCHRITTE[schritt + 1].titel}`}</span>
            {!letzter && <ArrowRight size={15} className="shrink-0" />}
          </button>
        </div>
        <div className="px-5 pb-3 text-[11px] text-slate-400 text-center">Leertaste oder Pfeil rechts: weiter · Pfeil links: zurück · Esc: beenden</div>
      </div>
    </div>,
    document.body,
  );
}
