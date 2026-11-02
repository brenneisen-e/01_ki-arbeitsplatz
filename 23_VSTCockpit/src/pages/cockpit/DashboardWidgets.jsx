import { useEffect, useState, Fragment } from 'react';
import { clsx } from 'clsx';
import { Sparkles } from 'lucide-react';
import {
  ResponsiveContainer, ComposedChart, Area, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ReferenceLine, PieChart, Pie, Cell, CartesianGrid,
} from 'recharts';
import Zaehler from './Zaehler';
import { useLive } from './liveDaten';
import { EreignisZeile, LivePunkt } from './LiveLeiste';
import { euroKompakt, euroEinheitlich, prozent, zahl, FARBE } from './format';
import VertragDetail from './VertragDetail';

// Spaltenbreite nach der Breite der Fläche (Container-Abfrage), nicht des Fensters:
// Neben dem offenen Chat ist die Fläche bei 1280 px nur gut 700 px breit.
const SPANNE = {
  3: 'col-span-6 @4xl:col-span-3',
  4: 'col-span-12 @2xl:col-span-6 @4xl:col-span-4',
  5: 'col-span-12 @4xl:col-span-5',
  6: 'col-span-12 @2xl:col-span-6',
  7: 'col-span-12 @4xl:col-span-7',
  8: 'col-span-12 @4xl:col-span-8',
  12: 'col-span-12',
};

const FORMATE = {
  euro: euroKompakt,
  prozent: (v) => prozent(v),
  zahl: (v) => zahl(v),
  zahl1: (v) => v.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
};
const fmt = (f) => FORMATE[f] || FORMATE.zahl;

function achse(f) {
  if (f === 'prozent') return (v) => `${v.toLocaleString('de-DE', { maximumFractionDigits: 1 })} %`;
  if (f === 'euro') return (v) => (Math.abs(v) >= 1e6 ? `${(v / 1e6).toLocaleString('de-DE', { maximumFractionDigits: 1 })} Mio.` : Math.abs(v) >= 1e3 ? `${(v / 1e3).toLocaleString('de-DE', { maximumFractionDigits: 1 })} T` : `${v}`);
  return (v) => v.toLocaleString('de-DE');
}

/** **fett** in Einschätzungen ohne HTML-Einschleusung darstellen. */
function MitFett({ text }) {
  return text.split('**').map((teil, i) => (i % 2 ? <strong key={i} className="font-semibold text-slate-900">{teil}</strong> : <Fragment key={i}>{teil}</Fragment>));
}

function LiveMarke() {
  return (
    <span className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.12em] uppercase text-slate-500">
      <LivePunkt /> Live
    </span>
  );
}

function Kachel({ w, children, className }) {
  return (
    <div className={clsx(SPANNE[w.breite] || 'col-span-4', 'bg-white rounded-2xl border border-slate-200 p-4 flex flex-col min-w-0 animate-aufbauen', className)}
      style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
      {w.typ !== 'kpi' && (
        <div className="flex items-center justify-between gap-3 mb-3">
          <h4 className="text-sm font-semibold text-slate-800 truncate">{w.titel}</h4>
          {w.live && <LiveMarke />}
        </div>
      )}
      {children}
    </div>
  );
}

function ChartTip({ active, payload, label, format }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-slate-200 text-xs">
      <div className="font-medium text-slate-700 mb-1">{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2 text-slate-600">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color || p.fill }} />
          {p.dataKey}: <span className="font-mono text-slate-800">{fmt(format)(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function KPI({ w, erscheinen }) {
  const farbe = w.ton === 'gut' ? FARBE.gut : w.ton === 'schlecht' ? FARBE.schlecht : FARBE.modus;
  return (
    <Kachel w={w}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs text-slate-500 truncate flex items-center gap-2">
          {w.farbe && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: w.farbe }} />}
          {w.titel}
        </span>
        {w.live && <LiveMarke />}
      </div>
      {w.text !== undefined
        ? <div className="text-2xl font-semibold text-slate-900 truncate">{w.text}</div>
        : <Zaehler wert={w.wert} format={fmt(w.format)} vonNull={erscheinen} dauer={erscheinen ? 1100 : 700} className="font-mono text-[1.7rem] leading-tight font-bold" />}
      <div className="text-xs mt-1 truncate" style={{ color: w.ton ? farbe : undefined }}>
        <span className={w.ton ? '' : 'text-slate-400'}>{w.unter}</span>
      </div>
    </Kachel>
  );
}

function Verlauf({ w }) {
  return (
    <Kachel w={w}>
      <div className="h-[230px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={w.daten} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              {w.reihen.filter(r => r.flaeche).map(r => (
                <linearGradient key={r.key} id={`kd-${w.titel}-${r.key}`.replace(/\W/g, '')} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={r.farbe} stopOpacity={0.18} />
                  <stop offset="95%" stopColor={r.farbe} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} stroke="#eef0f3" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: FARBE.achse }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: FARBE.achse }} axisLine={false} tickLine={false} width={52} tickFormatter={achse(w.format)} domain={['auto', 'auto']} />
            <Tooltip content={<ChartTip format={w.format} />} />
            {w.referenz && <ReferenceLine y={w.referenz.wert} stroke={FARBE.achse} strokeDasharray="4 4" label={{ value: w.referenz.label, position: 'insideTopRight', fontSize: 10, fill: FARBE.achse }} />}
            {w.reihen.map(r => r.flaeche
              ? <Area key={r.key} type="monotone" dataKey={r.key} stroke={r.farbe} strokeWidth={2.2} fill={`url(#${`kd-${w.titel}-${r.key}`.replace(/\W/g, '')})`} dot={false} animationDuration={1200} />
              : <Line key={r.key} type="monotone" dataKey={r.key} stroke={r.farbe} strokeWidth={2} strokeDasharray={r.gestrichelt ? '6 4' : undefined} dot={false} animationDuration={1200} />)}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {w.reihen.length > 1 && (
        <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-500">
          {w.reihen.map(r => (
            <span key={r.key} className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 inline-block" style={{ background: r.farbe, borderTop: r.gestrichelt ? `1px dashed ${r.farbe}` : undefined }} /> {r.key}
            </span>
          ))}
        </div>
      )}
    </Kachel>
  );
}

function Abweichung({ w }) {
  return (
    <Kachel w={w}>
      <div className="h-[170px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={w.daten} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="#eef0f3" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: FARBE.achse }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: FARBE.achse }} axisLine={false} tickLine={false} width={52} tickFormatter={achse(w.format)} />
            <ReferenceLine y={0} stroke="#cbd5e1" />
            <Tooltip content={<ChartTip format={w.format} />} />
            <Bar dataKey="wert" radius={[4, 4, 4, 4]} barSize={26} animationDuration={1000}>
              {w.daten.map(d => <Cell key={d.name} fill={d.wert >= 0 ? FARBE.gut : FARBE.schlecht} fillOpacity={0.85} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Kachel>
  );
}

function Saeulen({ w }) {
  const reihen = w.reihen || [{ key: w.key, farbe: w.farbe }];
  return (
    <Kachel w={w}>
      <div className="h-[230px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={w.daten} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="#eef0f3" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: FARBE.achse }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: FARBE.achse }} axisLine={false} tickLine={false} width={52} tickFormatter={achse(w.format)} />
            <Tooltip content={<ChartTip format={w.format} />} cursor={{ fill: 'rgba(97,117,58,0.06)' }} />
            {reihen.map(r => <Bar key={r.key} dataKey={r.key} fill={r.farbe} radius={[4, 4, 0, 0]} maxBarSize={34} animationDuration={1000} />)}
          </BarChart>
        </ResponsiveContainer>
      </div>
      {reihen.length > 1 && (
        <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-500">
          {reihen.map(r => <span key={r.key} className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: r.farbe }} /> {r.key}</span>)}
        </div>
      )}
    </Kachel>
  );
}

function Donut({ w }) {
  const gesamt = w.daten.reduce((s, d) => s + d.wert, 0) || 1;
  // Summe in der Mitte zweizeilig: Zahl groß, Einheit klein darunter, damit sie
  // auch bei „38,5 Mio. €“ im Loch bleibt.
  const [zahlTeil, ...einheit] = fmt(w.format)(gesamt).split(' ');
  const wertFmt = w.format === 'euro' ? euroEinheitlich(Math.max(...w.daten.map(d => d.wert))) : fmt(w.format);
  return (
    <Kachel w={w}>
      <div className="@container flex-1 flex items-center">
        <div className="w-full flex flex-col @sm:flex-row items-center gap-5">
          <div className="w-[168px] h-[168px] relative shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={w.daten} dataKey="wert" nameKey="name" innerRadius={58} outerRadius={82} paddingAngle={2} stroke="none" animationDuration={1100}>
                  {w.daten.map(d => <Cell key={d.name} fill={d.farbe} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none leading-tight">
              <span className="font-mono text-lg font-semibold text-slate-800">{zahlTeil}</span>
              <span className="text-[10px] text-slate-400">{einheit.join(' ')}{einheit.length ? ' · ' : ''}gesamt</span>
            </div>
          </div>
          <ul className="w-full min-w-0 flex-1 space-y-2">
            {w.daten.map(d => (
              <li key={d.name} className="flex items-center gap-2 text-xs min-w-0">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.farbe }} />
                <span className="text-slate-700 truncate" title={d.name}>{d.name}</span>
                <span className="ml-auto font-mono text-slate-400 whitespace-nowrap">{wertFmt(d.wert)}</span>
                <span className="w-10 text-right font-mono text-slate-800 whitespace-nowrap">{prozent((d.wert / gesamt) * 100, 0)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Kachel>
  );
}

function Rangliste({ w }) {
  const [bereit, setBereit] = useState(false);
  useEffect(() => { const t = setTimeout(() => setBereit(true), 60); return () => clearTimeout(t); }, []);
  const max = Math.max(...w.daten.map(d => d.wert), 1);
  // Mit `basis` beginnen die Balken nicht bei null, damit kleine Unterschiede sichtbar werden.
  const basis = w.basis ?? 0;
  const breite = (v) => Math.max(4, ((v - basis) / Math.max(max - basis, 1e-9)) * 100);
  // Alle Werte einer Liste in derselben Einheit (13,1 T€ · 9,2 T€, nicht 13 T€ · 9.172 €)
  const wertFmt = w.format === 'euro' ? euroEinheitlich(max) : fmt(w.format);
  return (
    <Kachel w={w}>
      <div className="space-y-2">
        {w.daten.map((d, i) => (
          <div key={d.name} className="text-xs">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-slate-400 font-mono w-4">{i + 1}</span>
              <span className="text-slate-700 truncate" title={d.zusatz ? `${d.name} · ${d.zusatz}` : d.name}>{d.name}</span>
              {d.zusatz && w.breite > 3 && <span className="text-slate-400 truncate">{d.zusatz}</span>}
              <span className="ml-auto font-mono text-slate-800 shrink-0">{wertFmt(d.wert)}</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden ml-6">
              <div className="h-full rounded-full" style={{
                width: bereit ? `${breite(d.wert)}%` : '0%',
                background: d.farbe || FARBE.modusHell,
                transition: `width 900ms cubic-bezier(0.16,1,0.3,1) ${i * 70}ms`,
              }} />
            </div>
          </div>
        ))}
      </div>
    </Kachel>
  );
}

function Tabelle({ w }) {
  return (
    <Kachel w={w}>
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left border-b border-slate-100">
              {w.spalten.map(s => (
                <th key={s.key} className={clsx('px-1.5 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap', s.rechts && 'text-right')}>{s.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {w.zeilen.map((z, i) => (
              <tr key={z.id || z.name || i} className="border-b border-slate-50 last:border-0 animate-aufbauen" style={{ animationDelay: `${i * 60}ms` }}>
                {w.spalten.map(s => {
                  const v = z[s.key];
                  let inhalt = v;
                  if (s.art === 'signale') {
                    inhalt = (
                      <span className="flex flex-wrap gap-1">
                        {v.map(sig => <span key={sig} className="px-1.5 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px] font-medium whitespace-nowrap">{sig}</span>)}
                      </span>
                    );
                  } else if (s.format) inhalt = fmt(s.format)(v);
                  const warn = s.warnAb !== undefined && v >= s.warnAb;
                  return (
                    <td key={s.key} className={clsx('px-1.5 py-2', s.rechts && 'text-right font-mono whitespace-nowrap', warn ? 'text-red-600 font-medium' : 'text-slate-700', s.key === 'name' && 'font-medium text-slate-800 whitespace-nowrap')}>
                      {s.live && v > 0 ? <span className="px-1.5 py-0.5 rounded bg-[#eef1e6] text-[#46552b] font-semibold">{inhalt}</span> : inhalt}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Kachel>
  );
}

function Feed({ w }) {
  const live = useLive();
  const [vertrag, setVertrag] = useState(null);
  return (
    <Kachel w={w}>
      <div className="space-y-2">
        {live.ereignisse.slice(0, 7).map((e, i) => (
          <button
            key={e.id}
            type="button"
            onClick={() => setVertrag(e)}
            title="Vertrag ansehen"
            className={clsx(
              'group block w-full text-left rounded-lg px-2.5 py-2 border border-transparent transition-colors',
              'hover:border-[#61753a]/30 hover:bg-[#e6ebdb] focus-visible:outline-none focus-visible:border-[#61753a]/60',
              i === 0 ? 'bg-[#eef1e6]' : 'bg-slate-50',
            )}
          >
            <EreignisZeile e={e} neu={i === 0} klickbar />
          </button>
        ))}
      </div>
      <VertragDetail e={vertrag} onClose={() => setVertrag(null)} />
    </Kachel>
  );
}

function Einschaetzung({ w }) {
  return (
    <Kachel w={w} className="bg-[#fbfbf7]">
      <ul className="space-y-2.5 text-[13px] leading-relaxed text-slate-600">
        {w.punkte.map((p, i) => (
          <li key={i} className="flex gap-2.5 animate-aufbauen" style={{ animationDelay: `${150 + i * 180}ms` }}>
            <Sparkles size={14} className="shrink-0 mt-1" style={{ color: FARBE.gold }} />
            <span><MitFett text={p} /></span>
          </li>
        ))}
      </ul>
    </Kachel>
  );
}

const WIDGETS = { kpi: KPI, verlauf: Verlauf, abweichung: Abweichung, saeulen: Saeulen, donut: Donut, rangliste: Rangliste, tabelle: Tabelle, feed: Feed, einschaetzung: Einschaetzung };

const SKELETT_HOEHE = { kpi: 'h-[104px]', verlauf: 'h-[290px]', abweichung: 'h-[220px]', saeulen: 'h-[290px]', donut: 'h-[210px]', rangliste: 'h-[290px]', tabelle: 'h-[320px]', feed: 'h-[320px]', einschaetzung: 'h-[200px]' };

function Skelett({ w }) {
  return (
    <div className={clsx(SPANNE[w.breite] || 'col-span-4', SKELETT_HOEHE[w.typ], 'rounded-2xl border border-slate-200 bg-white p-4 flex flex-col gap-3')}>
      <div className="skelett h-3 w-1/3 rounded" />
      {w.typ === 'kpi' ? (
        <>
          <div className="skelett h-7 w-2/3 rounded" />
          <div className="skelett h-2.5 w-1/2 rounded" />
        </>
      ) : (
        <div className="skelett flex-1 rounded-xl" />
      )}
    </div>
  );
}

/**
 * Raster der Kacheln. Mit `aufbau` erscheinen zuerst Skelette, dann eine Kachel
 * nach der anderen (Werte zählen hoch, Diagramme zeichnen sich).
 */
export default function DashboardRaster({ spec, aufbau = false, verzoegerung = 1700, takt = 230, onFertig }) {
  const anzahl = spec.widgets.length;
  const [sichtbar, setSichtbar] = useState(aufbau ? 0 : anzahl);

  useEffect(() => {
    if (!aufbau) { setSichtbar(anzahl); return undefined; }
    setSichtbar(0);
    let n = 0;
    let t = setTimeout(function weiter() {
      n += 1;
      setSichtbar(n);
      if (n < anzahl) t = setTimeout(weiter, takt);
      else onFertig?.();
    }, verzoegerung);
    return () => clearTimeout(t);
    // Neu aufbauen nur, wenn ein anderes Dashboard kommt
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec.id, aufbau]);

  return (
    <div className="@container">
    <div className="grid grid-cols-12 gap-4">
      {spec.widgets.map((w, i) => {
        const W = WIDGETS[w.typ];
        if (i >= sichtbar) return <Skelett key={`${w.typ}-${i}`} w={w} />;
        return <W key={`${w.typ}-${i}`} w={w} erscheinen={aufbau} />;
      })}
    </div>
    </div>
  );
}
