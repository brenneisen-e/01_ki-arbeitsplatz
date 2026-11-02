import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { Sparkles, X, Pin, Check, MessageSquare, Loader2 } from 'lucide-react';
import DashboardRaster from './DashboardWidgets';
import { LivePunkt } from './LiveLeiste';
import { useLive } from './liveDaten';
import { uhrzeit, FARBE } from './format';

/** Kopf eines generierten Dashboards, auf der Fläche und im Reiter „KI-Dashboards“ gleich. */
export function DashboardKopf({ spec, angeheftet, onAnheften, rechts }) {
  const live = useLive();
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.14em] uppercase" style={{ color: FARBE.modusHell }}>
          <Sparkles size={13} /> KI-Dashboard
        </div>
        <h2 className="text-xl font-semibold text-slate-900 mt-1 truncate">{spec.titel}</h2>
        <p className="text-sm text-slate-500 truncate">{spec.untertitel}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500">
          <LivePunkt aktiv={live.laeuft} /> Live · Stand <span className="font-mono">{uhrzeit(live.stand)}</span>
        </span>
        <button
          onClick={onAnheften}
          className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
            angeheftet ? 'border-[#61753a]/40 bg-[#eef1e6] text-[#46552b]' : 'border-slate-200 text-slate-600 hover:bg-slate-50')}
        >
          {angeheftet ? <Check size={14} /> : <Pin size={14} />} {angeheftet ? 'Angeheftet' : 'Ans Cockpit heften'}
        </button>
        {rechts}
      </div>
    </div>
  );
}

/**
 * Die Fläche, auf der der Assistent ein Dashboard aufbaut: links neben dem
 * Chat, über dem Cockpit. Erst Skelette, dann Kachel für Kachel.
 */
export default function DashboardFlaeche({ spec, aufbau, chatOffen, angeheftet, onAnheften, onSchliessen }) {
  const [fertig, setFertig] = useState(!aufbau);
  useEffect(() => { setFertig(!aufbau); }, [spec.id, aufbau]);

  useEffect(() => {
    const taste = (e) => { if (e.key === 'Escape') onSchliessen(); };
    window.addEventListener('keydown', taste);
    return () => window.removeEventListener('keydown', taste);
  }, [onSchliessen]);

  return createPortal(
    <>
      <div className="fixed inset-0 z-[45] bg-slate-900/25 backdrop-blur-[2px] animate-fade-in" onClick={onSchliessen} />
      <div
        data-praes="dashboard"
        className={clsx('fixed z-[46] top-[72px] bottom-5 left-5 rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-flaeche-ein', chatOffen ? 'right-[480px]' : 'right-5')}
        style={{ background: '#f6f7f3' }}
      >
        <div className="px-6 pt-4 pb-3 bg-white border-b border-slate-200">
          <DashboardKopf
            spec={spec}
            angeheftet={angeheftet}
            onAnheften={onAnheften}
            rechts={(
              <button onClick={onSchliessen} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors" title="Schließen (Esc)">
                <X size={18} />
              </button>
            )}
          />
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <MessageSquare size={13} className="shrink-0" />
            <span className="truncate">Frage: „{spec.frage}“</span>
            <span className="ml-auto flex items-center gap-1.5 shrink-0">
              {fertig
                ? <><Check size={13} style={{ color: FARBE.gut }} /> generiert aus Cockpit- und Live-Daten</>
                : <><Loader2 size={13} className="animate-spin" style={{ color: FARBE.modusHell }} /> wird aufgebaut</>}
            </span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <DashboardRaster spec={spec} aufbau={aufbau} onFertig={() => setFertig(true)} />
        </div>
      </div>
    </>,
    document.body,
  );
}
