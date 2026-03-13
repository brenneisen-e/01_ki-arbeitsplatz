import { useState, useMemo } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, MessageSquare, Leaf } from 'lucide-react';
import { clsx } from 'clsx';
import Card from '../../../components/ui/Card';
import { useMode } from '../../../hooks/useMode';
import { getVVPerformance } from '../../../data/vvDataAdapter';
import { KUNDEN_BY_MODE } from '../../../data/index';
import { formatEur } from '../../../utils/formatters';

// ─── Color palette ────────────────────────────────────────────────────────────
const C = {
  primary: '#1a365d',
  gold: '#c4a35a',
  slate: '#64748b',
  slateLight: '#94a3b8',
  slateLighter: '#cbd5e1',
  green: '#10b981',
  red: '#ef4444',
  amber: '#f59e0b',
};

const ALLOC_COLORS = {
  aktien: C.primary,
  anleihen: C.gold,
  alternative: C.slate,
  immofonds: C.slateLight,
  cash: C.slateLighter,
};

const ALLOC_LABELS = {
  aktien: 'Aktien',
  anleihen: 'Anleihen',
  alternative: 'Alternative',
  immofonds: 'Immofonds',
  cash: 'Cash',
};

const REGION_COLORS = [C.primary, C.gold, C.slate, C.slateLight, C.slateLighter];

// ─── Format helpers ───────────────────────────────────────────────────────────
function fmtPct(v, decimals = 1) {
  if (v == null) return '–';
  const sign = v > 0 ? '+' : '';
  return `${sign}${v.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}%`;
}

function fmtNum(v, decimals = 1) {
  if (v == null) return '–';
  return v.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-mono font-medium text-slate-800">{fmtNum(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

// ─── KPI Box ──────────────────────────────────────────────────────────────────
function KpiBox({ label, value, suffix = '%' }) {
  const isPositive = typeof value === 'number' && value >= 0;
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4" style={{ boxShadow: 'var(--card-shadow)' }}>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={clsx('font-mono font-semibold text-2xl', isPositive ? 'text-slate-800' : 'text-red-600')}>
        {value == null ? '–' : `${value > 0 && suffix === '%' ? '+' : ''}${fmtNum(value)}${suffix}`}
      </p>
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionTitle({ children, sub }) {
  return (
    <div className="mb-3">
      <h3 className="font-semibold text-slate-800 text-sm">{children}</h3>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Donut with center text ───────────────────────────────────────────────────
function MiniDonut({ data, size = 180, centerLabel }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={size * 0.32}
            outerRadius={size * 0.45}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [`${fmtNum(value, 0)}%`, name]}
            contentStyle={{ fontSize: 11, borderRadius: 8 }}
          />
        </PieChart>
      </ResponsiveContainer>
      {centerLabel && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-xs font-semibold text-slate-600">{centerLabel}</span>
        </div>
      )}
    </div>
  );
}

// ─── Legend list ───────────────────────────────────────────────────────────────
function DonutLegend({ data }) {
  return (
    <div className="space-y-1.5 mt-1">
      {data.filter(d => d.value > 0).map((d) => (
        <div key={d.name} className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: d.color }} />
            <span className="text-slate-600">{d.name}</span>
          </div>
          <span className="font-mono text-slate-700">{d.value}%</span>
        </div>
      ))}
    </div>
  );
}

// ─── Build time range subsets from monthly data ───────────────────────────────
function buildTimeRanges(monthly) {
  if (!monthly || monthly.length === 0) return {};
  const len = monthly.length;
  // YTD: entries from Jan of the latest year onwards (or last 3 months if short)
  const lastEntry = monthly[len - 1];
  const lastYear = lastEntry?.monat?.split(' ')[1];
  const ytdStart = monthly.findIndex(m => m.monat.includes(`Jan ${lastYear}`));
  const ytd = ytdStart >= 0 ? monthly.slice(ytdStart) : monthly.slice(-3);
  // 1J: last 12 entries
  const oneYear = monthly.slice(-12);
  // 3J: last 36 entries
  const threeYear = monthly.length > 12 ? monthly.slice(-36) : [];
  // 5J: last 60 entries
  const fiveYear = monthly.length > 36 ? monthly.slice(-60) : [];

  return { ytd, '1j': oneYear, '3j': threeYear, '5j': fiveYear };
}

// ─── Derive KPIs from monthly data and kunde portfolio ────────────────────────
function deriveKpis(monthly, kundePortfolio) {
  const p = kundePortfolio || {};
  const perfYtd = p.performance?.ytd ?? null;
  const benchYtd = p.benchmark?.ytd ?? null;
  const vsBenchmark = (perfYtd != null && benchYtd != null) ? +(perfYtd - benchYtd).toFixed(1) : null;
  const perf3j = p.performance?.['3j'] ?? null;

  return { perfYtd, vsBenchmark, perf3j };
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export default function PerformanceTab({ kunde }) {
  const { config } = useMode();
  const [timeRange, setTimeRange] = useState('ytd');

  const perfData = getVVPerformance(kunde?.id, kunde);

  // ── No data placeholder ──
  if (!perfData) {
    return (
      <div className="space-y-4">
        <Card>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-700 mb-1">Performance-Daten nicht verfügbar</h3>
            <p className="text-sm text-slate-400 max-w-md">
              Für {kunde?.name || 'diesen Mandanten'} liegen noch keine Performance-Daten vor.
              Die Daten werden nach dem ersten vollständigen Berichtsmonat angezeigt.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const {
    monthly, allocation, sollAllocation, sektoren, regionen,
    risiko, anleihen, waehrungen, hedgingQuote,
    ioKommentar, esg, kosten, verlustschwelle,
  } = perfData;

  // Derive KPIs from kunde portfolio data
  const kpis = deriveKpis(monthly, kunde?.portfolio);

  // Build time ranges from monthly series
  const timeRanges = useMemo(() => buildTimeRanges(monthly), [monthly]);
  const rangeKeys = ['ytd', '1j', '3j', '5j'];
  const rangeLabels = { ytd: 'YTD', '1j': '1J', '3j': '3J', '5j': '5J' };
  const currentSeries = timeRanges[timeRange] || [];

  // Convert allocation objects to chart-ready arrays
  const allocData = useMemo(() => {
    if (!allocation) return [];
    return Object.entries(allocation)
      .filter(([, v]) => v > 0)
      .map(([key, value]) => ({
        name: ALLOC_LABELS[key] || key,
        value,
        color: ALLOC_COLORS[key] || C.slate,
        key,
      }));
  }, [allocation]);

  const sollAllocMap = sollAllocation || {};

  // Convert regionen to chart-ready arrays
  const regionData = useMemo(() => {
    if (!regionen) return [];
    return regionen.map((r, i) => ({
      name: r.name,
      value: r.anteil,
      color: REGION_COLORS[i % REGION_COLORS.length],
    }));
  }, [regionen]);

  // Convert waehrungen to chart-ready arrays
  const waehrungData = useMemo(() => {
    if (!waehrungen) return [];
    return waehrungen.map((w, i) => ({
      name: w.name,
      value: w.anteil,
      color: REGION_COLORS[i % REGION_COLORS.length],
    }));
  }, [waehrungen]);

  // Verlustschwelle calculation (percentage from high)
  const vsGrenze = verlustschwelle?.schwelle ?? -10;
  const vsHoechst = verlustschwelle?.hoechststand ?? 0;
  const vsAktuell = verlustschwelle?.aktuell ?? 0;
  const vsAktPct = vsHoechst > 0 ? +((vsAktuell - vsHoechst) / vsHoechst * 100).toFixed(1) : 0;
  const vsRatio = vsGrenze !== 0 ? Math.abs(vsAktPct) / Math.abs(vsGrenze) : 0;

  // Rating display
  const ratingDisplay = anleihen?.rating
    ? (typeof anleihen.rating === 'string'
        ? anleihen.rating
        : `IG ${anleihen.rating.ig}% / BBB ${anleihen.rating.bbb}% / Sub-IG ${anleihen.rating.subig}%`)
    : '–';

  return (
    <div className="space-y-4">

      {/* ── 1. KPI Boxes ── */}
      <div className="grid grid-cols-4 gap-4">
        <KpiBox label="Performance YTD" value={kpis.perfYtd} suffix="%" />
        <KpiBox label="vs. Benchmark" value={kpis.vsBenchmark} suffix=" pp" />
        <KpiBox label="Performance 3J (p.a.)" value={kpis.perf3j} suffix="%" />
        <KpiBox label="Volatilität" value={risiko?.volatilitaet} suffix="%" />
      </div>

      {/* ── 2. Performance vs. Benchmark (Line Chart) ── */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <SectionTitle sub="Portfolio vs. Benchmark (indexiert, Basis 100)">Performance-Verlauf</SectionTitle>
          <div className="flex gap-1">
            {rangeKeys.map(rk => {
              const hasSeries = (timeRanges[rk] || []).length > 0;
              return (
                <button
                  key={rk}
                  disabled={!hasSeries}
                  onClick={() => setTimeRange(rk)}
                  className={clsx(
                    'px-3 py-1 text-xs rounded-md font-medium transition-colors',
                    timeRange === rk
                      ? 'bg-[#1a365d] text-white'
                      : hasSeries
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        : 'bg-slate-50 text-slate-300 cursor-not-allowed',
                  )}
                >
                  {rangeLabels[rk]}
                </button>
              );
            })}
          </div>
        </div>
        {currentSeries.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={currentSeries} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <XAxis dataKey="monat" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
              <Tooltip content={<ChartTooltip />} />
              <Legend iconType="line" wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Line type="monotone" dataKey="portfolio" name="Portfolio" stroke={C.primary} strokeWidth={2.5} dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: C.primary }} />
              <Line type="monotone" dataKey="benchmark" name="Benchmark" stroke={C.slateLight} strokeWidth={1.5} strokeDasharray="6 3" dot={false} activeDot={{ r: 3, strokeWidth: 0, fill: C.slateLight }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-48 text-sm text-slate-400">
            Keine Daten für diesen Zeitraum verfügbar
          </div>
        )}
      </Card>

      {/* ── Row: Asset Allocation + Sektoren ── */}
      <div className="grid grid-cols-2 gap-4">

        {/* ── 3. Asset Allocation Donut ── */}
        <Card>
          <SectionTitle sub="Ist- vs. Soll-Allokation">Asset Allocation</SectionTitle>
          <div className="flex items-start gap-6">
            <div className="flex flex-col items-center gap-1">
              <MiniDonut data={allocData} size={160} centerLabel="Ist" />
            </div>
            <div className="flex-1 mt-2">
              <div className="space-y-2">
                {allocData.map((item) => {
                  const sollVal = sollAllocMap[item.key] ?? 0;
                  const drift = item.value - sollVal;
                  return (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-600">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-700">{item.value}%</span>
                        <span className="text-slate-300">/</span>
                        <span className="font-mono text-slate-400">{sollVal}%</span>
                        {drift !== 0 && (
                          <span className={clsx(
                            'font-mono text-[10px] px-1 py-0.5 rounded',
                            Math.abs(drift) > 3 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400',
                          )}>
                            {drift > 0 ? '+' : ''}{drift}pp
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>

        {/* ── 4. Sektoren (Horizontal Bar) ── */}
        <Card>
          <SectionTitle sub="Top-Sektoren nach Gewichtung">Sektoren</SectionTitle>
          <div className="space-y-2.5">
            {(sektoren || []).map((s) => (
              <div key={s.name}>
                <div className="flex items-center justify-between text-xs mb-0.5">
                  <span className="text-slate-600">{s.name}</span>
                  <span className="font-mono text-slate-700">{fmtNum(s.anteil)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(s.anteil, 100)}%`, backgroundColor: C.primary }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Row: Regionen + Risiko ── */}
      <div className="grid grid-cols-2 gap-4">

        {/* ── 5. Regional Allocation ── */}
        <Card>
          <SectionTitle sub="Geographische Verteilung">Regionen</SectionTitle>
          <div className="flex items-start gap-6">
            <MiniDonut data={regionData} size={160} centerLabel="Regionen" />
            <div className="flex-1 mt-2">
              <DonutLegend data={regionData} />
            </div>
          </div>
        </Card>

        {/* ── 6. Risk Profile ── */}
        <Card>
          <SectionTitle sub="Risikokennzahlen des Portfolios">Risikoprofil</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Volatilität</p>
              <p className="font-mono font-semibold text-lg text-slate-800">{fmtNum(risiko?.volatilitaet)}%</p>
              {risiko?.benchmarkVola != null && (
                <p className="text-[10px] text-slate-400 mt-0.5">BM: {fmtNum(risiko.benchmarkVola)}%</p>
              )}
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Max Drawdown</p>
              <p className="font-mono font-semibold text-lg text-red-600">{fmtNum(risiko?.maxDrawdown)}%</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Sharpe Ratio</p>
              <p className="font-mono font-semibold text-lg text-slate-800">{fmtNum(risiko?.sharpeRatio, 2)}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Beta</p>
              <p className="font-mono font-semibold text-lg text-slate-800">{fmtNum(risiko?.beta, 2)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Row: Anleihen + Währungen ── */}
      <div className="grid grid-cols-2 gap-4">

        {/* ── 7. Bond Maturity Structure ── */}
        <Card>
          <SectionTitle sub="Laufzeitenstruktur & Kennzahlen">Anleihen</SectionTitle>
          {anleihen?.laufzeiten && (
            <div className="mb-4">
              <ResponsiveContainer width="100%" height={130}>
                <BarChart
                  data={anleihen.laufzeiten.map(l => ({ name: l.name, value: l.anteil }))}
                  layout="vertical"
                  margin={{ top: 0, right: 20, bottom: 0, left: 0 }}
                >
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="%" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={48} />
                  <Tooltip formatter={(v) => [`${v}%`, 'Anteil']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Bar dataKey="value" fill={C.gold} radius={[0, 4, 4, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Duration</p>
              <p className="font-mono font-semibold text-slate-800">{fmtNum(anleihen?.duration)} J</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">YTM</p>
              <p className="font-mono font-semibold text-slate-800">{fmtNum(anleihen?.ytm)}%</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Rating</p>
              <p className="font-mono font-semibold text-slate-800 text-xs">{ratingDisplay}</p>
            </div>
          </div>
        </Card>

        {/* ── 8. Currency Allocation ── */}
        <Card>
          <SectionTitle sub="Währungsverteilung & Absicherung">Währungen</SectionTitle>
          <div className="flex items-start gap-6">
            <MiniDonut data={waehrungData} size={140} centerLabel="FX" />
            <div className="flex-1 mt-1">
              <DonutLegend data={waehrungData} />
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">FX-Hedging-Quote</span>
                  <span className="font-mono font-semibold text-slate-800">{hedgingQuote ?? '–'}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5">
                  <div
                    className="h-1.5 rounded-full"
                    style={{ width: `${hedgingQuote ?? 0}%`, backgroundColor: C.primary }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ── 9. Investment Office Kommentar ── */}
      {ioKommentar && (
        <Card>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#1a365d]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <MessageSquare className="w-4 h-4 text-[#1a365d]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="font-semibold text-slate-800 text-sm">Investment Office Kommentar</h3>
                <span className="text-[10px] text-slate-400">{ioKommentar.datum} &middot; {ioKommentar.autor}</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{ioKommentar.text}</p>
              {ioKommentar.naechsterReview && (
                <p className="text-[10px] text-slate-400 mt-2">Nächster Review: {ioKommentar.naechsterReview}</p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* ── 10. Footer: ESG, Kosten, Verlustschwelle ── */}
      <div className="grid grid-cols-3 gap-4">
        {/* ESG Score */}
        <div className="bg-white border border-slate-200 rounded-xl p-4" style={{ boxShadow: 'var(--card-shadow)' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Leaf className="w-3.5 h-3.5 text-emerald-500" />
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">ESG-Score</p>
          </div>
          <div className="flex items-end gap-2">
            <span className="font-mono font-semibold text-2xl text-slate-800">{esg?.score ?? '–'}</span>
            <span className="text-xs text-slate-400 mb-1">/ 100</span>
          </div>
          {esg?.sfdr && (
            <p className="text-[10px] text-slate-400 mt-1">{esg.sfdr} &middot; CO2: {esg.co2 ?? '–'} t</p>
          )}
          <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${esg?.score ?? 0}%`,
                backgroundColor: (esg?.score ?? 0) >= 80 ? C.green : (esg?.score ?? 0) >= 60 ? C.gold : C.red,
              }}
            />
          </div>
        </div>

        {/* Kosten */}
        <div className="bg-white border border-slate-200 rounded-xl p-4" style={{ boxShadow: 'var(--card-shadow)' }}>
          <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-2">Kostenquote (All-in)</p>
          <div className="flex items-end gap-2">
            <span className="font-mono font-semibold text-2xl text-slate-800">{fmtNum(kosten?.quote, 2)}%</span>
            <span className="text-xs text-slate-400 mb-1">p.a.</span>
          </div>
          {kosten?.betrag != null && (
            <p className="text-[10px] text-slate-400 mt-1">{formatEur(kosten.betrag)} ({kosten.jahr})</p>
          )}
        </div>

        {/* Verlustschwelle */}
        <div className="bg-white border border-slate-200 rounded-xl p-4" style={{ boxShadow: 'var(--card-shadow)' }}>
          <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-2">Verlustschwelle</p>
          <div className="flex items-center gap-2">
            {vsRatio < 0.8 ? (
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-500" />
            )}
            <div>
              <span className="font-mono font-semibold text-lg text-slate-800">{fmtNum(vsAktPct)}%</span>
              <span className="text-xs text-slate-400 ml-1.5">/ {vsGrenze}%</span>
            </div>
          </div>
          {verlustschwelle?.hoechststandDatum && (
            <p className="text-[10px] text-slate-400 mt-1">
              Höchststand: {formatEur(vsHoechst)} ({verlustschwelle.hoechststandDatum})
            </p>
          )}
          <div className="w-full bg-slate-100 rounded-full h-2 mt-2 relative">
            <div
              className="h-2 rounded-full absolute left-0 top-0"
              style={{
                width: `${Math.min(100, vsRatio * 100)}%`,
                backgroundColor: vsRatio > 0.8 ? C.red : vsRatio > 0.5 ? C.amber : C.green,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
