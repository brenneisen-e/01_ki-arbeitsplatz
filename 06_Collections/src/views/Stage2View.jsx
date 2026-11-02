import { clsx } from 'clsx';
import { ArrowRight } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { STAGE2_INTRO, STAGE2_KPIS, STAGE2_MIGRATION, ECL_TREND, RISIKOTREIBER } from '../data/npl';
import { Card, CardTitle, SectionIntro } from '../components/ui/primitives';
import { zahl } from '../utils/format';

function MigrationBox({ label, wert, sub, tone }) {
  return (
    <div
      className="rounded-xl border px-4 py-3 text-center min-w-[130px]"
      style={{
        background: tone === 'aktiv' ? 'var(--mode-pastel)' : '#f8fafc',
        borderColor: tone === 'aktiv' ? 'color-mix(in srgb, var(--mode-primary) 30%, white)' : '#e2e8f0',
      }}
    >
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-lg font-semibold text-slate-900 mt-1 tabular-nums">{wert}</div>
      {sub && <div className="text-[11px] text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function Stage2View({ eingebettet = false }) {
  return (
    <div className={eingebettet ? 'space-y-6' : 'px-6 py-6 space-y-6'}>
      {!eingebettet && <SectionIntro titel={STAGE2_INTRO.titel} text={STAGE2_INTRO.text} />}

      <div className="grid grid-cols-[1.4fr_1fr] gap-5 items-start">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">GuV-Auswirkung Stage 2 Portfolio</h3>
          <div className="grid grid-cols-4 gap-4">
            {STAGE2_KPIS.map(k => (
              <div key={k.label} className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                <div className="text-[11px] uppercase tracking-wide text-slate-500 leading-tight">{k.label}</div>
                <div className={clsx('text-xl font-semibold mt-1.5 tabular-nums', k.negativ ? 'text-red-600' : 'text-slate-900')}>
                  {k.value}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Stage-Migration (letzte 30 Tage)</h3>
          <div className="flex items-center justify-between gap-2">
            <MigrationBox label="Stage 1" wert={`-${zahl(STAGE2_MIGRATION.ausStage1)}`} sub="Fälle abgegeben" />
            <div className="flex flex-col items-center gap-0.5 text-emerald-600 shrink-0">
              <ArrowRight size={16} strokeWidth={2} />
              <span className="text-[11px] font-semibold tabular-nums">+{zahl(STAGE2_MIGRATION.ausStage1)}</span>
            </div>
            <MigrationBox label="Stage 2" wert={zahl(STAGE2_MIGRATION.bestand)} sub="Bestand" tone="aktiv" />
            <div className="flex flex-col items-center gap-0.5 text-red-600 shrink-0">
              <ArrowRight size={16} strokeWidth={2} />
              <span className="text-[11px] font-semibold tabular-nums">-{zahl(STAGE2_MIGRATION.nachStage3)}</span>
            </div>
            <MigrationBox label="Stage 3" wert={`+${zahl(STAGE2_MIGRATION.nachStage3)}`} sub="Fälle erhalten" />
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <span className="text-sm font-semibold text-red-600">Netto-Zugang Stage 2: {STAGE2_MIGRATION.netto}</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Card className="p-1">
          <CardTitle>ECL-Entwicklung</CardTitle>
          <div className="px-3 pb-4" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ECL_TREND} margin={{ top: 8, right: 26, left: 0, bottom: 4 }}>
                <defs>
                  <linearGradient id="eclGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="monat" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={52}
                  domain={['auto', 'auto']} tickFormatter={v => zahl(v, 1)}
                />
                <Tooltip
                  formatter={v => [`${zahl(v, 1)} Mio EUR`, 'Risikovorsorge']}
                  contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12, boxShadow: '0 6px 18px rgba(15,23,42,0.10)' }}
                />
                <Area type="monotone" dataKey="ecl" stroke="#f59e0b" strokeWidth={2} fill="url(#eclGradient)" dot={{ r: 3, fill: '#f59e0b', strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Top-Risikotreiber</h3>
          <div className="space-y-4">
            {RISIKOTREIBER.map(r => (
              <div key={r.name}>
                <div className="flex items-baseline justify-between gap-3 mb-1.5">
                  <span className="text-[13px] text-slate-700">{r.name}</span>
                  <span className="text-[13px] font-semibold text-slate-900 tabular-nums shrink-0">{r.wert}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${r.anteil}%`, background: 'var(--mode-primary)' }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
