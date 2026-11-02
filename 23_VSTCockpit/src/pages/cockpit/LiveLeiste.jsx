import { useState } from 'react';
import { clsx } from 'clsx';
import { Pause, Play, FileSignature, XCircle, Radio, ChevronRight } from 'lucide-react';
import { useLive } from './liveDaten';
import Zaehler from './Zaehler';
import VertragDetail from './VertragDetail';
import { euroKompakt, uhrzeit, zahl, FARBE } from './format';

/** Pulsierender Punkt für „live“. */
export function LivePunkt({ aktiv = true, farbe = FARBE.gut }) {
  return (
    <span className="relative flex h-2.5 w-2.5 shrink-0">
      {aktiv && <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: farbe }} />}
      <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: aktiv ? farbe : FARBE.achse }} />
    </span>
  );
}

export function EreignisZeile({ e, kompakt = false, neu = false, klickbar = false }) {
  const storno = e.art === 'storno';
  const Icon = storno ? XCircle : FileSignature;
  return (
    <div className={clsx('flex items-center gap-2 min-w-0 text-xs', neu && 'animate-ticker-in')}>
      <span className="font-mono text-slate-400 shrink-0">{uhrzeit(e.zeit)}</span>
      <Icon size={13} strokeWidth={1.9} className="shrink-0" style={{ color: storno ? FARBE.schlecht : FARBE.modusHell }} />
      <span className={clsx('font-medium shrink-0', storno ? 'text-red-700' : 'text-slate-800')}>{storno ? 'Storno' : 'Abschluss'}</span>
      <span className="text-slate-600 truncate">
        {e.produkt} · {e.vermittler.name}{!kompakt && ` (${e.vermittler.bundesland})`} · {e.vertriebsweg}
      </span>
      <span className="font-mono shrink-0 ml-auto" style={{ color: storno ? FARBE.schlecht : FARBE.modus }}>
        {storno ? `−${zahl(e.beitrag)} € Beitrag` : `+${euroKompakt(e.ng)} NG`}
      </span>
      {klickbar && <ChevronRight size={14} strokeWidth={2} className="shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" />}
    </div>
  );
}

/**
 * Live-Leiste über den Kacheln: Tageskennzahlen zählen bei jedem Abschluss
 * hoch, rechts läuft der jüngste Eingang ein.
 */
export default function LiveLeiste() {
  const live = useLive();
  const { heute } = live;
  const juengste = live.ereignisse.slice(0, 2);
  const [vertrag, setVertrag] = useState(null);
  const kennzahlen = [
    { label: 'Abschlüsse heute', wert: heute.abschluesse, format: zahl },
    { label: 'Neugeschäft heute', wert: heute.ng, format: euroKompakt },
    { label: 'Provision heute', wert: heute.provision, format: euroKompakt },
    { label: 'Storni heute', wert: heute.storni, format: zahl, ton: 'text-red-700' },
  ];

  return (
    <div data-praes="live" className="bg-white rounded-2xl border border-slate-200 px-5 py-3 flex items-center gap-6 mb-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div className="flex items-center gap-2.5 shrink-0">
        <LivePunkt aktiv={live.laeuft} />
        <div className="leading-tight">
          <div className="text-[11px] font-semibold tracking-[0.14em] uppercase text-slate-800 flex items-center gap-1.5">
            <Radio size={12} strokeWidth={2} /> Live
          </div>
          <div className="text-[11px] text-slate-400 font-mono">Stand {uhrzeit(live.stand)}</div>
        </div>
      </div>

      <div className="flex items-center gap-6 shrink-0 pl-6 border-l border-slate-100">
        {kennzahlen.map(k => (
          <div key={k.label} className="leading-tight">
            <div className="text-[11px] text-slate-400 whitespace-nowrap">{k.label}</div>
            <Zaehler wert={k.wert} format={k.format} className={clsx('font-mono text-base font-semibold', k.ton || 'text-slate-900')} />
          </div>
        ))}
      </div>

      <div className="flex-1 min-w-0 pl-6 border-l border-slate-100 space-y-1 overflow-hidden">
        {juengste.map((e, i) => (
          <button key={e.id} type="button" onClick={() => setVertrag(e)} title="Vertrag ansehen"
            className={clsx('group block w-full text-left rounded-md px-1.5 -mx-1.5 hover:bg-slate-50 transition-colors', i > 0 && 'opacity-50 hover:opacity-100')}>
            <EreignisZeile e={e} neu={i === 0} kompakt klickbar />
          </button>
        ))}
      </div>

      <button
        onClick={() => live.setLaeuft(l => !l)}
        title={live.laeuft ? 'Live-Daten anhalten' : 'Live-Daten fortsetzen'}
        className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors shrink-0"
      >
        {live.laeuft ? <Pause size={15} /> : <Play size={15} />}
      </button>
      <VertragDetail e={vertrag} onClose={() => setVertrag(null)} />
    </div>
  );
}
