import { forwardRef, useEffect, useImperativeHandle, useRef, useState, useCallback } from 'react';
import { clsx } from 'clsx';
import * as LucideIcons from 'lucide-react';
import { Sparkles, Send, X, RotateCcw, Check, Loader2, LayoutDashboard, Pin, ArrowRight, Table2 } from 'lucide-react';
import { FRAGEN, FRAGE_NACH_ID, erkenneFrage } from './dashboards';
import { FARBE } from './format';

const GRUPPEN = ['Steuerung', 'Risiko', 'Live', 'Ergebnis'];
const SCHRITT_TAKT = 430;
const TABELLE_ZU = { top: 'agenturen', aufmerksamkeit: 'agenturen', regionen: 'bundeslaender', storno: 'bundeslaender' };

function FrageChip({ f, onClick, klein = false }) {
  const Icon = LucideIcons[f.icon] || Sparkles;
  return (
    <button
      onClick={() => onClick(f.id)}
      className={clsx(
        'group flex items-center gap-2 text-left rounded-xl border border-slate-200 bg-white hover:border-[#61753a]/50 hover:bg-[#f6f8f1] transition-colors',
        klein ? 'px-2.5 py-1.5 text-xs' : 'w-full px-3 py-2 text-[13px]'
      )}
    >
      <Icon size={klein ? 12 : 14} strokeWidth={1.9} className="shrink-0 text-slate-400 group-hover:text-[#61753a]" />
      <span className="text-slate-700 flex-1">{f.frage}</span>
      {!klein && <LayoutDashboard size={13} className="shrink-0 text-slate-300 group-hover:text-[#61753a]" />}
    </button>
  );
}

/** Antworttext erscheint Wort für Wort. */
function Tippen({ text, onFertig }) {
  const woerter = text.split(' ');
  const [n, setN] = useState(0);
  useEffect(() => {
    if (n >= woerter.length) { onFertig?.(); return undefined; }
    const t = setTimeout(() => setN(x => x + 1), 32);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, woerter.length]);
  return (
    <p className="leading-relaxed">
      {woerter.slice(0, n).join(' ')}
      {n < woerter.length && <span className="inline-block w-1.5 h-3.5 ml-0.5 align-middle bg-slate-400 animate-pulse rounded-sm" />}
    </p>
  );
}

function Arbeit({ m }) {
  const fertig = m.aktiv >= m.schritte.length;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 w-full">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-700 mb-2">
        {fertig
          ? <Check size={14} style={{ color: FARBE.gut }} strokeWidth={2.4} />
          : <Sparkles size={14} className="animate-pulse" style={{ color: FARBE.gold }} />}
        {fertig ? 'Analyse abgeschlossen, Dashboard steht' : 'Analysiere Cockpit- und Live-Daten'}
      </div>
      <ul className="space-y-1.5">
        {m.schritte.map((s, i) => {
          const status = i < m.aktiv ? 'fertig' : i === m.aktiv ? 'aktiv' : 'offen';
          return (
            <li key={s} className={clsx('flex items-center gap-2 text-xs transition-colors', status === 'offen' ? 'text-slate-300' : status === 'aktiv' ? 'text-slate-800' : 'text-slate-500')}>
              <span className="w-4 h-4 flex items-center justify-center shrink-0">
                {status === 'fertig' && <Check size={13} strokeWidth={2.4} style={{ color: FARBE.gut }} />}
                {status === 'aktiv' && <Loader2 size={13} className="animate-spin" style={{ color: FARBE.modusHell }} />}
                {status === 'offen' && <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />}
              </span>
              {s}
            </li>
          );
        })}
      </ul>
      <div className="mt-3 h-1 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (m.aktiv / m.schritte.length) * 100)}%`, background: FARBE.modusHell }} />
      </div>
    </div>
  );
}

/**
 * KI-Vertriebsassistent des VST-Cockpits. Jede Frage läuft sichtbar durch
 * Arbeitsschritte, öffnet daneben das generierte Dashboard und antwortet mit
 * einer Zusammenfassung aus denselben Zahlen.
 */
const KiAssistent = forwardRef(function KiAssistent({ offen, setOffen, holeSpec, onDashboard, onAnheften, angeheftet, onTabelle }, ref) {
  const [nachrichten, setNachrichten] = useState([{ rolle: 'ki', art: 'start' }]);
  const [eingabe, setEingabe] = useState('');
  const [beschaeftigt, setBeschaeftigt] = useState(false);
  const unten = useRef(null);
  const zeitgeber = useRef([]);

  // Erst mitscrollen, wenn das Gespräch läuft; die Begrüßung bleibt oben stehen.
  useEffect(() => { if (nachrichten.length > 1) unten.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [nachrichten]);
  useEffect(() => () => zeitgeber.current.forEach(clearTimeout), []);

  const spaeter = (fn, ms) => { zeitgeber.current.push(setTimeout(fn, ms)); };

  const frage = useCallback((id) => {
    const f = FRAGE_NACH_ID[id];
    const spec = holeSpec(id);
    if (!f || !spec) return;
    setOffen(true);
    setBeschaeftigt(true);
    const arbeitId = `${id}-${Date.now()}`;
    setNachrichten(n => [...n, { rolle: 'nutzer', text: f.frage }, { rolle: 'ki', art: 'arbeit', key: arbeitId, schritte: spec.schritte, aktiv: 0 }]);
    onDashboard(id);
    spec.schritte.forEach((_, i) => {
      spaeter(() => setNachrichten(n => n.map(m => (m.key === arbeitId ? { ...m, aktiv: i + 1 } : m))), SCHRITT_TAKT * (i + 1));
    });
    // Antwort, sobald die letzte Kachel steht (Verzögerung + Takt im Raster)
    const fertigNach = 1700 + spec.widgets.length * 230 + 200;
    spaeter(() => {
      const aktuell = holeSpec(id);
      setNachrichten(n => [...n, { rolle: 'ki', art: 'ergebnis', key: `${arbeitId}-e`, id, text: aktuell.zusammenfassung, folgefragen: aktuell.folgefragen }]);
    }, fertigNach);
  }, [holeSpec, onDashboard, setOffen]);

  useImperativeHandle(ref, () => ({ frage }), [frage]);

  function senden() {
    const text = eingabe.trim();
    if (!text || beschaeftigt) return;
    setEingabe('');
    const f = erkenneFrage(text);
    if (f) { frage(f.id); return; }
    setNachrichten(n => [...n, { rolle: 'nutzer', text }, { rolle: 'ki', art: 'unbekannt' }]);
  }

  function neu() {
    zeitgeber.current.forEach(clearTimeout);
    zeitgeber.current = [];
    setBeschaeftigt(false);
    setNachrichten([{ rolle: 'ki', art: 'start' }]);
  }

  if (!offen) {
    return (
      <button
        onClick={() => setOffen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 pl-4 pr-5 h-12 rounded-full text-white shadow-xl hover:scale-[1.03] transition-transform"
        style={{ background: 'var(--mode-gradient)' }}
        title="KI-Vertriebsassistent öffnen"
      >
        <Sparkles size={18} /> <span className="text-sm font-medium">KI-Assistent</span>
      </button>
    );
  }

  return (
    <div data-praes="assistent" className="fixed bottom-5 right-5 z-50 w-[440px] h-[min(680px,calc(100vh-40px))] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col animate-fade-in-up overflow-hidden">
      <div className="text-white px-4 py-3 flex items-center justify-between shrink-0" style={{ background: 'var(--mode-gradient)' }}>
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-8 h-8 rounded-lg header-glass flex items-center justify-center shrink-0"><Sparkles size={16} /></span>
          <div className="leading-tight min-w-0">
            <div className="font-semibold text-sm">KI-Vertriebsassistent</div>
            <div className="text-[11px] text-white/70 truncate">Antwortet mit Dashboards aus Cockpit- und Live-Daten</div>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={neu} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors" title="Neues Gespräch"><RotateCcw size={15} /></button>
          <button onClick={() => setOffen(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors" title="Schließen"><X size={16} /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60">
        {nachrichten.map((m, i) => {
          if (m.rolle === 'nutzer') {
            return (
              <div key={i} className="flex justify-end animate-fade-in-up">
                <div className="max-w-[85%] rounded-2xl rounded-br-md px-3.5 py-2 text-sm text-white" style={{ background: FARBE.modus }}>{m.text}</div>
              </div>
            );
          }
          if (m.art === 'start') {
            return (
              <div key={i} className="space-y-3">
                <div className="rounded-2xl rounded-bl-md bg-white border border-slate-200 px-3.5 py-2.5 text-sm text-slate-700 leading-relaxed">
                  Guten Tag. Ich beantworte Fragen zu Neugeschäft, Storno, Vertriebswegen und den Live-Eingängen und baue Ihnen dazu ein Dashboard. Womit fangen wir an?
                </div>
                {GRUPPEN.map(g => (
                  <div key={g}>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 mb-1.5 px-0.5">{g}</div>
                    <div className="space-y-1.5">
                      {FRAGEN.filter(f => f.gruppe === g).map(f => <FrageChip key={f.id} f={f} onClick={id => !beschaeftigt && frage(id)} />)}
                    </div>
                  </div>
                ))}
              </div>
            );
          }
          if (m.art === 'arbeit') return <div key={m.key} className="animate-fade-in-up"><Arbeit m={m} /></div>;
          if (m.art === 'unbekannt') {
            return (
              <div key={i} className="rounded-2xl rounded-bl-md bg-white border border-slate-200 px-3.5 py-2.5 text-sm text-slate-700 space-y-2.5 animate-fade-in-up">
                <p>Dazu habe ich in dieser Demo keine Auswertung. Diese Fragen kann ich mit einem Dashboard beantworten:</p>
                <div className="flex flex-wrap gap-1.5">
                  {FRAGEN.slice(0, 4).map(f => <FrageChip key={f.id} f={f} klein onClick={id => !beschaeftigt && frage(id)} />)}
                </div>
              </div>
            );
          }
          if (m.art === 'ergebnis') {
            const ist = angeheftet.includes(m.id);
            return (
              <div key={m.key} className="rounded-2xl rounded-bl-md bg-white border border-slate-200 px-3.5 py-3 text-sm text-slate-700 space-y-3 animate-fade-in-up">
                <Tippen text={m.text} onFertig={() => setBeschaeftigt(false)} />
                <div className="flex flex-wrap gap-1.5">
                  <button onClick={() => onDashboard(m.id, false)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white" style={{ background: FARBE.modus }}>
                    <LayoutDashboard size={13} /> Dashboard zeigen
                  </button>
                  <button onClick={() => onAnheften(m.id)} className={clsx('flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border', ist ? 'border-[#61753a]/40 bg-[#eef1e6] text-[#46552b]' : 'border-slate-200 text-slate-600 hover:bg-slate-50')}>
                    {ist ? <Check size={13} /> : <Pin size={13} />} {ist ? 'Angeheftet' : 'Ans Cockpit heften'}
                  </button>
                  {TABELLE_ZU[m.id] && (
                    <button onClick={() => onTabelle(TABELLE_ZU[m.id])} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50">
                      <Table2 size={13} /> In der Tabelle
                    </button>
                  )}
                </div>
                {m.folgefragen?.length > 0 && (
                  <div className="pt-1 border-t border-slate-100">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 mt-2 mb-1.5 flex items-center gap-1"><ArrowRight size={11} /> Weiter fragen</div>
                    <div className="flex flex-wrap gap-1.5">
                      {m.folgefragen.map(fid => <FrageChip key={fid} f={FRAGE_NACH_ID[fid]} klein onClick={id => !beschaeftigt && frage(id)} />)}
                    </div>
                  </div>
                )}
              </div>
            );
          }
          return null;
        })}
        <div ref={unten} />
      </div>

      <div className="p-3 border-t border-slate-100 shrink-0 bg-white">
        <div className="flex gap-2">
          <input
            value={eingabe}
            onChange={e => setEingabe(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && senden()}
            placeholder={beschaeftigt ? 'Dashboard wird gebaut …' : 'Frage zum Vertrieb stellen …'}
            disabled={beschaeftigt}
            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#61753a] focus:ring-2 focus:ring-[#61753a]/15 disabled:bg-slate-50"
          />
          <button onClick={senden} disabled={beschaeftigt} className="px-3 rounded-xl text-white transition-opacity disabled:opacity-40" style={{ background: FARBE.modus }} title="Senden">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
});

export default KiAssistent;
