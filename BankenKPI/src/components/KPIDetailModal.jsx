import { X, Sparkles, Target, AlertTriangle, CheckCircle2, AlertCircle, Lightbulb } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
  CartesianGrid, ReferenceLine, Legend,
} from 'recharts';
import { explainKpiSegment } from '../data/aiAnalyse';
import { fmtVal, fmtCompact, AMPEL_COLORS } from '../data/kpiData';

const SEVERITY_ICONS = { red: AlertTriangle, yellow: AlertCircle, green: CheckCircle2 };

export default function KPIDetailModal({ data, bank, onClose }) {
  if (!data) return null;
  const { kpi, segmentId, segmentLabel, history, cell } = data;
  const ai = explainKpiSegment(kpi.id, segmentId);
  const severityCfg = AMPEL_COLORS[ai?.ampel || 'gray'];
  const SevIcon = SEVERITY_ICONS[ai?.ampel] || Sparkles;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 animate-fade-in" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden animate-scale-in flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 flex items-start justify-between text-white" style={{ background: bank.gradient }}>
          <div>
            <div className="text-xs uppercase tracking-wider text-white/60 mb-1">{segmentLabel}</div>
            <h2 className="text-xl font-bold">{kpi.label}</h2>
            <div className="text-sm text-white/70 mt-1">{bank.name} · KPI-Detailansicht</div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-white/15 hover:bg-white/25 transition-colors flex items-center justify-center"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Hero metric */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-1">Ist</div>
              <div className="font-mono text-2xl font-extrabold" style={{ color: bank.primary }}>
                {fmtVal(cell.ist, kpi.unit)}
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                <Target size={11} /> Plan
              </div>
              <div className="font-mono text-2xl font-extrabold text-slate-700">
                {fmtVal(cell.plan, kpi.unit)}
              </div>
            </div>
            <div className="rounded-xl p-4 border" style={{ background: severityCfg.bg, borderColor: severityCfg.bg }}>
              <div className="text-[11px] uppercase tracking-wider mb-1" style={{ color: severityCfg.text }}>
                Abweichung
              </div>
              <div className="font-mono text-2xl font-extrabold" style={{ color: severityCfg.text }}>
                {ai?.dev != null ? (ai.dev >= 0 ? '+' : '') + ai.dev.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + ' %' : '–'}
              </div>
            </div>
          </div>

          {/* Trend chart */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-800">12-Monats-Verlauf</h3>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: bank.primary }} />
                  Ist
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5" style={{ background: '#94a3b8' }} />
                  Plan
                </div>
              </div>
            </div>
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`detail-grad-${kpi.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={bank.primary} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={bank.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => fmtCompact(v, kpi.unit)} />
                  <Tooltip
                    formatter={(v) => fmtCompact(v, kpi.unit)}
                    contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                  />
                  <ReferenceLine y={cell.plan} stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={1.5} />
                  <Area type="monotone" dataKey="ist" stroke={bank.primary} strokeWidth={2.5} fill={`url(#detail-grad-${kpi.id})`} name="Ist" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Explanation */}
          {ai && (
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0" style={{ color: bank.primary }}>
                  <Sparkles size={18} strokeWidth={1.75} />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">KI-Erläuterung</div>
                  <h3 className="text-sm font-semibold text-slate-800">Was sagt diese Kennzahl aus?</h3>
                </div>
              </div>

              <div
                className="flex items-start gap-2 p-3 rounded-lg mb-3"
                style={{ background: severityCfg.bg, color: severityCfg.text }}
              >
                <SevIcon size={16} strokeWidth={1.75} className="shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{ai.headline}</p>
              </div>

              {ai.crossRefs.length > 0 && (
                <div className="bg-white/70 rounded-lg p-3 mb-3 border border-white">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Querbezüge
                  </div>
                  <ul className="space-y-1">
                    {ai.crossRefs.map((ref, i) => (
                      <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: bank.primary }} />
                        {ref}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-white rounded-lg p-3 border border-slate-100 flex items-start gap-2">
                <Lightbulb size={16} strokeWidth={1.75} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Empfehlung
                  </div>
                  <p className="text-sm text-slate-700">{ai.recommendation}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
