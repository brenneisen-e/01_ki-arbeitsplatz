import { useState } from 'react';
import { clsx } from 'clsx';
import {
  Banknote, Users, TrendingUp, Clock, CheckCircle2,
} from 'lucide-react';
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, ComposedChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { NPL_INTRO, NPL_KPIS, NPL_TREND, NPL_PRODUKTE, NPL_MASSNAHMEN, NPL_MASSNAHMEN_ERGEBNIS } from '../data/npl';
import { Card, CardTitle, SectionIntro, Modal } from '../components/ui/primitives';
import { zahl } from '../utils/format';
import { useCollections } from '../hooks/useCollections';

const ICONS = { banknote: Banknote, users: Users, 'trending-up': TrendingUp, clock: Clock };

const TONE = {
  neutral: { bg: '#eff6ff', color: '#2563eb' },
  warning: { bg: '#fffbeb', color: '#d97706' },
  success: { bg: '#f0fdf4', color: '#16a34a' },
};

function NplKpi({ kpi }) {
  const Icon = ICONS[kpi.icon] || Banknote;
  const tone = TONE[kpi.tone] || TONE.neutral;
  return (
    <Card className="p-5 flex items-start gap-4">
      <span className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: tone.bg, color: tone.color }}>
        <Icon size={24} strokeWidth={1.7} />
      </span>
      <div className="min-w-0">
        <div className="text-2xl font-semibold text-slate-900 tabular-nums">{kpi.value}</div>
        <div className="text-xs text-slate-500 mt-0.5">{kpi.label}</div>
        <div className={clsx('text-[11px] font-medium mt-1.5',
          kpi.sentiment === 'positive' ? 'text-emerald-600' : kpi.sentiment === 'negative' ? 'text-red-600' : 'text-slate-500')}>
          {kpi.change}
        </div>
      </div>
    </Card>
  );
}

export default function NplView({ eingebettet = false }) {
  const { toast } = useCollections();
  const [ergebnis, setErgebnis] = useState(null);

  return (
    <div className={eingebettet ? 'space-y-6' : 'px-6 py-6 space-y-6'}>
      {!eingebettet && <SectionIntro titel={NPL_INTRO.titel} text={NPL_INTRO.text} />}

      <div className="grid grid-cols-4 gap-4">
        {NPL_KPIS.map(k => <NplKpi key={k.id} kpi={k} />)}
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Card className="p-1">
          <CardTitle>NPL-Entwicklung nach Monat</CardTitle>
          <div className="px-3 pb-4" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={NPL_TREND} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="monat" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  yAxisId="links" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={52}
                  tickFormatter={v => `${zahl(v, 1)}`}
                />
                <YAxis
                  yAxisId="rechts" orientation="right" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={48}
                  tickFormatter={v => zahl(v)}
                />
                <Tooltip
                  formatter={(v, name) => name === 'Volumen' ? [`${zahl(v, 1)} Mio EUR`, name] : [`${zahl(v)} Fälle`, name]}
                  contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12, boxShadow: '0 6px 18px rgba(15,23,42,0.10)' }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" iconSize={8} />
                <Bar yAxisId="links" dataKey="volumen" name="Volumen" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={26} />
                <Line yAxisId="rechts" type="monotone" dataKey="faelle" name="Fälle" stroke="#0f172a" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-1">
          <CardTitle>Verteilung nach Produkttyp</CardTitle>
          <div className="px-3 pb-4" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={NPL_PRODUKTE} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 4 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={v => `${zahl(v, 1)}`} />
                <YAxis type="category" dataKey="produkt" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} width={150} />
                <Tooltip
                  formatter={(v, _n, p) => [`${zahl(v, 1)} Mio EUR (${p.payload.anteil} %)`, 'Volumen']}
                  contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12, boxShadow: '0 6px 18px rgba(15,23,42,0.10)' }}
                />
                <Bar dataKey="volumen" radius={[0, 4, 4, 0]} barSize={20}>
                  {NPL_PRODUKTE.map(p => <Cell key={p.produkt} fill={p.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Empfohlene Maßnahmen</h3>
        <div className="grid grid-cols-3 gap-4">
          {NPL_MASSNAHMEN.map(m => (
            <div
              key={m.id}
              className={clsx('rounded-xl border p-4 flex flex-col', m.highlight ? 'border-transparent' : 'border-slate-200')}
              style={m.highlight ? { background: 'var(--mode-pastel)', borderColor: 'color-mix(in srgb, var(--mode-primary) 25%, white)' } : undefined}
            >
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-semibold text-slate-900 tabular-nums">{zahl(m.count)}</span>
                <span className="text-xs text-slate-500">Fälle</span>
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-800">{m.titel}</div>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed flex-1">{m.text}</p>
              <button
                onClick={() => setErgebnis(NPL_MASSNAHMEN_ERGEBNIS[m.id])}
                className={clsx('mt-3 w-full py-2 text-xs font-semibold rounded-lg transition-colors',
                  m.highlight ? 'text-white hover:opacity-90' : 'text-slate-700 bg-slate-100 hover:bg-slate-200')}
                style={m.highlight ? { background: 'var(--mode-primary)' } : undefined}
              >
                {m.button}
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Modal
        offen={!!ergebnis}
        onClose={() => setErgebnis(null)}
        titel={ergebnis?.titel || ''}
        subtitel="Ergebnis der KI-gestützten Vorprüfung"
        breite="max-w-2xl"
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setErgebnis(null)}
              className="px-4 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Schließen
            </button>
            <button
              onClick={() => { setErgebnis(null); toast('Maßnahme zur Freigabe an die Marktfolge Aktiv übergeben.', 'success'); }}
              className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-opacity hover:opacity-90"
              style={{ background: 'var(--mode-primary)' }}
            >
              Zur Freigabe vorlegen
            </button>
          </div>
        }
      >
        {ergebnis && (
          <ul className="p-6 space-y-3">
            {ergebnis.zeilen.map((z, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" strokeWidth={1.9} />
                {z}
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </div>
  );
}
