import { useMemo } from 'react';
import { CheckCircle, AlertTriangle, TrendingUp, ArrowRight } from 'lucide-react';
import { PROFILE, WELCOME_KPIS, WELCOME_AUM_TREND, WELCOME_CASHFLOW_DATA, WELCOME_WORKFLOW_PIE, WELCOME_HIGHLIGHTS } from '../data';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const HIGHLIGHT_ICONS = {
  check: CheckCircle,
  alert: AlertTriangle,
  trend: TrendingUp,
};

const HIGHLIGHT_COLORS = {
  check: 'text-green-400',
  alert: 'text-amber-400',
  trend: 'text-blue-400',
};

export default function WelcomeScreen({ onEnter }) {
  const dateStr = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-8 relative overflow-hidden"
         style={{ background: 'linear-gradient(145deg, #0a0f1e 0%, #111936 40%, #0d1529 100%)' }}>
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none"
           style={{ backgroundImage: 'linear-gradient(rgba(96,165,250,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)' }} />

      <div className="relative max-w-[1100px] w-full animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full mx-auto mb-4 overflow-hidden border-2 border-blue-400/40"
               style={{ boxShadow: '0 0 30px rgba(59,130,246,0.3)' }}>
            <img src={PROFILE.photo} alt={PROFILE.fullName} className="w-full h-full object-cover" />
          </div>
          <h1 className="text-[42px] font-light text-slate-100 tracking-tight">Welcome</h1>
          <p className="text-[15px] text-slate-500 mt-1.5 uppercase tracking-[1.5px]">{dateStr}</p>
          <div className="flex items-center justify-center gap-2.5 mt-2.5">
            <span className="text-slate-300 text-base font-medium">{PROFILE.fullName}</span>
            <span className="text-slate-500 text-[15px] px-2.5 py-0.5 bg-slate-500/15 rounded-full tracking-wide">{PROFILE.role}</span>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-4 gap-3.5 mb-5">
          {WELCOME_KPIS.map((kpi, i) => (
            <button key={i} onClick={onEnter}
              className={`rounded-[14px] px-4 py-[18px] text-center backdrop-blur-[10px] border transition-all duration-300 cursor-pointer select-none
                hover:!bg-[#86BC25] hover:!border-[#86BC25] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(134,188,37,0.3)] active:translate-y-0
                ${kpi.accent
                  ? 'bg-amber-400/[0.08] border-amber-400/20'
                  : 'bg-white/[0.03] border-slate-400/[0.08]'
                }
                group`}>
              <div className={`text-[32px] font-bold leading-none group-hover:text-white ${kpi.accent ? 'text-amber-400' : 'text-slate-100'}`}>{kpi.value}</div>
              <div className="text-base text-slate-500 tracking-[1.5px] mt-2 font-semibold group-hover:text-white">{kpi.label}</div>
              <div className={`text-[15px] mt-1.5 opacity-80 group-hover:text-white group-hover:opacity-100 ${kpi.accent ? 'text-amber-400' : 'text-slate-400'}`}>{kpi.sub}</div>
            </button>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid gap-3.5 mb-5" style={{ gridTemplateColumns: '1.4fr 0.8fr 0.8fr' }}>
          {/* AUM Trend */}
          <div className="bg-white/[0.03] border border-slate-400/[0.08] rounded-[14px] px-[18px] pt-[18px] pb-2.5 transition-all hover:bg-white/[0.04] hover:border-slate-400/15">
            <div className="flex justify-between items-baseline mb-3">
              <div>
                <div className="text-[15px] text-slate-500 tracking-wide font-semibold uppercase">AUM — LAST 5 DAYS</div>
                <div className="text-2xl font-bold text-slate-100 mt-1">€2.41B</div>
              </div>
              <div className="text-base text-green-400 font-semibold flex items-center gap-1 px-2.5 py-1 bg-green-400/[0.08] rounded-full">
                <TrendingUp size={12} /> +1.7%
              </div>
            </div>
            <div className="h-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={WELCOME_AUM_TREND}>
                  <defs>
                    <linearGradient id="aumGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[2.24, 2.46]} tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => v.toFixed(2)} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 10, fontSize: 13 }}
                           labelStyle={{ color: '#94a3b8' }} itemStyle={{ color: '#f1f5f9' }}
                           formatter={v => [`€${v.toFixed(2)}B`, 'AUM']} />
                  <Area type="monotone" dataKey="aum" stroke="#3b82f6" fill="url(#aumGrad)" strokeWidth={2.5}
                        dot={{ fill: '#0f172a', stroke: '#3b82f6', strokeWidth: 2, r: 4 }}
                        activeDot={{ fill: '#3b82f6', stroke: '#0f172a', r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cashflows */}
          <div className="bg-white/[0.03] border border-slate-400/[0.08] rounded-[14px] px-[18px] pt-[18px] pb-2.5 transition-all hover:bg-white/[0.04] hover:border-slate-400/15">
            <div className="text-[15px] text-slate-500 tracking-wide font-semibold uppercase">YESTERDAY'S CASHFLOWS</div>
            <div className="text-2xl font-bold text-slate-100 mt-1">€4.3M <span className="text-[15px] font-medium text-green-400">net</span></div>
            <div className="h-[120px] mt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={WELCOME_CASHFLOW_DATA}>
                  <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 10, fontSize: 13 }}
                           formatter={v => [`€${v.toFixed(1)}M`]} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={28}>
                    {WELCOME_CASHFLOW_DATA.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Workflow Status */}
          <div className="bg-white/[0.03] border border-slate-400/[0.08] rounded-[14px] px-[18px] pt-[18px] pb-2.5 transition-all hover:bg-white/[0.04] hover:border-slate-400/15">
            <div className="text-[15px] text-slate-500 tracking-wide font-semibold uppercase">WORKFLOW STATUS</div>
            <div className="text-2xl font-bold text-slate-100 mt-1">65 <span className="text-[15px] font-medium text-green-400">total</span></div>
            <div className="flex items-center justify-center gap-3 mt-2">
              <div className="w-[110px] h-[110px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={WELCOME_WORKFLOW_PIE} cx="50%" cy="50%" innerRadius={33} outerRadius={50} dataKey="value" strokeWidth={0}>
                      {WELCOME_WORKFLOW_PIE.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-2">
                {WELCOME_WORKFLOW_PIE.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-[15px] text-slate-400">
                    <div className="w-2 h-2 rounded-full opacity-80" style={{ background: item.color }} />
                    <span>{item.name} <strong className="text-slate-300">{item.value}</strong></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Highlights */}
        <div className="bg-white/[0.02] border border-slate-400/[0.06] rounded-[14px] px-5 py-3.5 mb-7">
          <div className="text-[15px] text-slate-500 tracking-[1.2px] font-semibold mb-2.5 uppercase">YESTERDAY'S HIGHLIGHTS</div>
          <div className="flex gap-8">
            {WELCOME_HIGHLIGHTS.map((h, i) => {
              const Icon = HIGHLIGHT_ICONS[h.icon];
              return (
                <div key={i} className="flex items-center gap-2.5 text-[15px] text-slate-300">
                  <div className="w-7 h-7 rounded-lg bg-slate-400/[0.06] flex items-center justify-center shrink-0">
                    <Icon size={16} className={HIGHLIGHT_COLORS[h.icon]} />
                  </div>
                  <span>{h.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button onClick={onEnter}
            className="inline-flex items-center gap-2.5 px-10 py-3.5 text-[15px] font-semibold text-white rounded-xl border-none cursor-pointer tracking-wide transition-all
              hover:-translate-y-px hover:shadow-[0_6px_32px_rgba(59,130,246,0.45)]"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', boxShadow: '0 4px 24px rgba(59,130,246,0.3)' }}>
            Enter Dashboard
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
