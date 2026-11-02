import { useState, useMemo } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend,
  ReferenceLine, CartesianGrid,
} from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, MessageSquare, Leaf } from 'lucide-react';
import { clsx } from 'clsx';
import Card from '../../../components/ui/Card';
import { useMode } from '../../../hooks/useMode';
import useTranslation from '../../../i18n/useTranslation';
import { VV_PERFORMANCE } from '../../../data/vvDataProvider';
import { KUNDEN_BY_MODE } from '../../../data/index';
import { formatEur } from '../../../utils/formatters';

// ─── Color palette ────────────────────────────────────────────────────────────
// Eine Modusfarbe plus Gold, dazu Neutraltöne aus den Tokens
const C = {
  primary: 'var(--mode-chart)',
  gold: 'var(--mode-accent)',
  slate: 'var(--text-tertiary)',
  slateLight: 'var(--border-strong)',
  slateLighter: 'var(--border-medium)',
  green: 'var(--color-success)',
  red: 'var(--color-danger)',
  amber: 'var(--color-warning)',
};

const ALLOC_COLORS = {
  aktien: C.primary,
  anleihen: C.gold,
  alternative: C.slate,
  immofonds: C.slateLight,
  cash: C.slateLighter,
};

const REGION_COLORS = [C.primary, C.gold, C.slate, C.slateLight, C.slateLighter];

// ─── Format helpers ───────────────────────────────────────────────────────────
import { getLang } from '../../../utils/langHelper';
function loc() { return getLang() === 'en' ? 'en-US' : 'de-DE'; }

function fmtPct(v, decimals = 1) {
  if (v == null) return '–';
  const sign = v > 0 ? '+' : '';
  return `${sign}${v.toLocaleString(loc(), { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}%`;
}

function fmtNum(v, decimals = 1) {
  if (v == null) return '–';
  return v.toLocaleString(loc(), { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="surface-elevated rounded-lg px-3 py-2 text-xs">
      <p className="font-semibold text-(--text-primary) mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-(--text-secondary)">{p.name}:</span>
          <span className="font-mono font-medium text-(--text-primary)">{fmtNum(p.value, 0)} EUR</span>
        </p>
      ))}
    </div>
  );
}

// ─── KPI Box ──────────────────────────────────────────────────────────────────
function KpiBox({ label, value, suffix = '%' }) {
  return (
    <Card>
      <p className="text-xs text-(--text-tertiary) mb-2">{label}</p>
      <p className="font-mono font-semibold text-[28px] leading-none text-(--text-primary)">
        {value == null ? '–' : `${typeof value === 'number' && value > 0 && suffix === '%' ? '+' : ''}${typeof value === 'string' ? value : fmtNum(value)}${suffix}`}
      </p>
    </Card>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionTitle({ children, sub }) {
  return (
    <div className="mb-3">
      <h3 className="font-semibold text-(--text-primary) text-sm">{children}</h3>
      {sub && <p className="text-xs text-(--text-tertiary) mt-0.5">{sub}</p>}
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
          <span className="text-xs font-semibold text-(--text-secondary)">{centerLabel}</span>
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
            <span className="text-(--text-secondary)">{d.name}</span>
          </div>
          <span className="font-mono text-(--text-primary)">{d.value}%</span>
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
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState('1j');
  const [showAbsolute, setShowAbsolute] = useState(true);

  const ALLOC_LABELS = {
    aktien: t('aktien'),
    anleihen: t('anleihen'),
    alternative: t('alternative'),
    immofonds: t('immofonds'),
    cash: t('cash'),
  };

  const perfData = VV_PERFORMANCE[kunde?.id];

  // Benchmark name from WPHG data or default
  const benchmarkName = '60% MSCI World / 40% Bloomberg Agg';

  // ── No data placeholder ──
  if (!perfData) {
    return (
      <div className="space-y-4">
        <Card hover={false}>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-(--bg-inset) flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-(--text-tertiary)" />
            </div>
            <h3 className="font-semibold text-(--text-primary) mb-1">{t('performanceDatenNichtVerfuegbar')}</h3>
            <p className="text-sm text-(--text-tertiary) max-w-md">
              {t('performanceDatenFehlen', { name: kunde?.name || t('diesenMandanten') })}
              {' '}{t('performanceDatenHinweis')}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const {
    monthly, einzahlungen, allocation, sollAllocation, sektoren, regionen,
    risiko, anleihen, waehrungen, hedgingQuote,
    ioKommentar, esg, kosten, verlustschwelle,
  } = perfData;

  // Derive KPIs from kunde portfolio data
  const kpis = deriveKpis(monthly, kunde?.portfolio);

  // Build deposit lookup: monat → betrag
  const depositMap = useMemo(() => {
    const map = {};
    (einzahlungen || []).forEach(e => { map[e.monat] = e; });
    return map;
  }, [einzahlungen]);

  // Convert monthly percentage returns to absolute EUR values
  // Incorporates deposits: at deposit months, add the deposit amount to portfolio value
  const absoluteMonthly = useMemo(() => {
    if (!monthly || !kunde?.aum) return monthly || [];
    const baseAum = kunde.aum;
    const len = monthly.length;
    if (len === 0) return [];

    // Walk backwards from current AuM to find the starting portfolio value
    // Subtract deposits when walking backwards
    let startVal = baseAum;
    for (let i = len - 1; i >= 1; i--) {
      const dep = depositMap[monthly[i].monat];
      if (dep) startVal -= dep.betrag;
      startVal = startVal / (1 + monthly[i].portfolio / 100);
    }

    // Now walk forward: both start at the same value
    const pfValues = new Array(len);
    const bmValues = new Array(len);
    pfValues[0] = startVal;
    bmValues[0] = startVal;
    for (let i = 1; i < len; i++) {
      pfValues[i] = pfValues[i - 1] * (1 + monthly[i].portfolio / 100);
      bmValues[i] = bmValues[i - 1] * (1 + monthly[i].benchmark / 100);
      // Add deposits to portfolio value (not benchmark)
      const dep = depositMap[monthly[i].monat];
      if (dep) {
        pfValues[i] += dep.betrag;
        bmValues[i] += dep.betrag; // benchmark also gets deposit to keep comparison fair
      }
    }
    return monthly.map((m, i) => ({
      monat: m.monat,
      portfolio: Math.round(pfValues[i]),
      benchmark: Math.round(bmValues[i]),
    }));
  }, [monthly, kunde?.aum, depositMap]);

  // Build time ranges from monthly series (using absolute values)
  const timeRanges = useMemo(() => buildTimeRanges(absoluteMonthly), [absoluteMonthly]);
  const rangeKeys = ['ytd', '1j', '3j', '5j'];
  const rangeLabels = { ytd: 'YTD', '1j': '1J', '3j': '3J', '5j': '5J' };
  const currentSeries = timeRanges[timeRange] || [];
  const lastPortfolioValue = currentSeries.length > 0 ? currentSeries[currentSeries.length - 1].portfolio : null;

  // Filter deposits to those visible in the current time range
  const visibleDeposits = useMemo(() => {
    if (!einzahlungen?.length || !currentSeries.length) return [];
    const visibleMonths = new Set(currentSeries.map(s => s.monat));
    return einzahlungen.filter(e => visibleMonths.has(e.monat));
  }, [einzahlungen, currentSeries]);

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
  // Derive hoechststand and aktuell from AuM if not absolute values
  const currentAuM = kunde?.aum || 0;
  const vsAktPct = verlustschwelle?.aktuell ?? 0;
  const vsHoechst = verlustschwelle?.hoechststand || (currentAuM > 0 ? Math.round(currentAuM / (1 + vsAktPct / 100)) : 0);
  const vsAktuell = verlustschwelle?.aktuell || currentAuM;
  const vsRatio = vsGrenze !== 0 ? Math.abs(vsAktPct) / Math.abs(vsGrenze) : 0;

  // Rating display
  const ratingDisplay = anleihen?.rating
    ? (typeof anleihen.rating === 'string'
        ? anleihen.rating
        : `IG ${anleihen.rating.ig}% / BBB ${anleihen.rating.bbb}% / Sub-IG ${anleihen.rating.subig}%`)
    : '–';

  return (
    <div className="space-y-4">

      {/* ── 1. KPI Boxes with Absolute/Percentage Toggle ── */}
      <div className="flex items-center justify-between mb-2">
        <div />
        <div className="flex items-center gap-1 bg-(--bg-inset) border border-(--border-light) rounded-lg p-0.5">
          <button
            onClick={() => setShowAbsolute(true)}
            className={clsx(
              'px-3 py-1 text-xs rounded-md font-medium transition-colors',
              showAbsolute ? 'bg-(--bg-card) text-(--text-primary) shadow-sm' : 'text-(--text-secondary) hover:text-(--text-primary)',
            )}
          >
            {t('absolut')}
          </button>
          <button
            onClick={() => setShowAbsolute(false)}
            className={clsx(
              'px-3 py-1 text-xs rounded-md font-medium transition-colors',
              !showAbsolute ? 'bg-(--bg-card) text-(--text-primary) shadow-sm' : 'text-(--text-secondary) hover:text-(--text-primary)',
            )}
          >
            {t('prozentual')}
          </button>
        </div>
      </div>
      {showAbsolute ? (
        <div className="grid grid-cols-4 gap-4">
          <KpiBox label={t('portfolioWert')} value={kunde?.aum ? fmtNum(Math.round(kunde.aum), 0) : '–'} suffix=" EUR" />
          <KpiBox label={t('performanceYtd')} value={kunde?.aum && kpis.perfYtd != null ? fmtNum(Math.round(kunde.aum * kpis.perfYtd / 100), 0) : '–'} suffix=" EUR" />
          <KpiBox label={t('vsBenchmark')} value={kunde?.aum && kpis.vsBenchmark != null ? fmtNum(Math.round(kunde.aum * kpis.vsBenchmark / 100), 0) : '–'} suffix=" EUR" />
          <KpiBox label={t('volatilitaetAbs')} value={kunde?.aum && risiko?.volatilitaet != null ? fmtNum(Math.round(kunde.aum * risiko.volatilitaet / 100), 0) : '–'} suffix=" EUR" />
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          <KpiBox label={t('performanceYtd')} value={kpis.perfYtd} suffix="%" />
          <KpiBox label={t('vsBenchmark')} value={kpis.vsBenchmark} suffix=" pp" />
          <KpiBox label={t('performance3jPa')} value={kpis.perf3j} suffix="%" />
          <KpiBox label={t('volatilitaet')} value={risiko?.volatilitaet} suffix="%" />
        </div>
      )}

      {/* ── 2. Performance vs. Benchmark (Line Chart) ── */}
      <Card hover={false}>
        <div className="flex items-center justify-between mb-4">
          <SectionTitle sub={`${t('portfolioVsBenchmark')} (${benchmarkName})`}>{t('performanceVerlauf')}</SectionTitle>
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
                      ? 'bg-(--mode-primary) text-white'
                      : hasSeries
                        ? 'bg-(--bg-inset) text-(--text-secondary) hover:bg-(--border-light)'
                        : 'bg-(--bg-inset) text-(--text-tertiary) opacity-60 cursor-not-allowed',
                  )}
                >
                  {rangeLabels[rk]}
                </button>
              );
            })}
          </div>
        </div>
        {currentSeries.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={currentSeries} margin={{ top: 25, right: 20, bottom: 5, left: 20 }}>
                <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
                <XAxis dataKey="monat" tick={{ fontSize: 11, fill: 'var(--chart-axis)' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--chart-axis)' }}
                  axisLine={false}
                  tickLine={false}
                  domain={['dataMin * 0.95', 'dataMax * 1.02']}
                  tickFormatter={v => `${fmtNum(Math.round(v / 1000), 0)}k`}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="line" wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Line type="monotone" dataKey="portfolio" name="Portfolio" stroke={C.primary} strokeWidth={2} dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: 'var(--bg-card)', fill: C.primary }} />
                <Line type="monotone" dataKey="benchmark" name={`Benchmark (${benchmarkName})`} stroke="var(--chart-axis)" strokeWidth={1.5} strokeDasharray="6 3" dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--bg-card)', fill: 'var(--chart-axis)' }} />
                {visibleDeposits.map((dep, i) => (
                  <ReferenceLine
                    key={`dep-${i}`}
                    x={dep.monat}
                    stroke={C.green}
                    strokeWidth={2}
                    strokeDasharray="4 2"
                    label={{
                      value: dep.label,
                      position: 'top',
                      fill: C.green,
                      fontSize: 10,
                      fontWeight: 600,
                      offset: 8,
                    }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
            {lastPortfolioValue && (
              <div className="flex justify-end mt-2">
                <div className="surface-inset rounded-lg px-4 py-2">
                  <span className="text-xs text-(--text-tertiary)">{t('aktuellPortfolioWert')}</span>
                  <p className="font-mono font-semibold text-lg text-(--mode-accent)">{fmtNum(lastPortfolioValue, 0)} EUR</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-48 text-sm text-(--text-tertiary)">
            {t('keineDatenZeitraum')}
          </div>
        )}
      </Card>

      {/* ── Row: Asset Allocation + Sektoren ── */}
      <div className="grid grid-cols-2 gap-4">

        {/* ── 3. Asset Allocation Donut ── */}
        <Card hover={false}>
          <SectionTitle sub={t('istVsSoll')}>{t('assetAllocation')}</SectionTitle>
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
                        <span className="w-2.5 h-2.5 rounded-full legend-dot" style={{ backgroundColor: item.color }} />
                        <span className="text-(--text-secondary)">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-(--text-primary)">{item.value}%</span>
                        <span className="text-(--text-tertiary)">/</span>
                        <span className="font-mono text-(--text-tertiary)">{sollVal}%</span>
                        {drift !== 0 && (
                          <span className={clsx(
                            'font-mono text-[10px] px-1 py-0.5 rounded drift-badge',
                            Math.abs(drift) > 3 ? 'bg-(--tint-warning) text-(--color-warning)' : 'bg-(--bg-inset) text-(--text-tertiary)',
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
        <Card hover={false}>
          <SectionTitle sub={t('topSektoren')}>{t('sektoren')}</SectionTitle>
          <div className="space-y-2.5">
            {(sektoren || []).map((s) => (
              <div key={s.name}>
                <div className="flex items-center justify-between text-xs mb-0.5">
                  <span className="text-(--text-secondary)">{s.name}</span>
                  <span className="font-mono text-(--text-primary)">{fmtNum(s.anteil)}%</span>
                </div>
                <div className="w-full rounded-full h-2 progress-track">
                  <div
                    className="h-2 rounded-full transition-all duration-500 progress-fill"
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
        <Card hover={false}>
          <SectionTitle sub={t('geographischeVerteilung')}>{t('regionen')}</SectionTitle>
          <div className="flex items-start gap-6">
            <MiniDonut data={regionData} size={160} centerLabel={t('regionen')} />
            <div className="flex-1 mt-2">
              <DonutLegend data={regionData} />
            </div>
          </div>
        </Card>

        {/* ── 6. Risk Profile ── */}
        <Card hover={false}>
          <SectionTitle sub={t('risikokennzahlen')}>{t('risikoprofil')}</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            <div className="surface-inset rounded-lg p-3 metric-box">
              <p className="text-[11px] text-(--text-tertiary) uppercase tracking-wider">{t('volatilitaet')}</p>
              <p className="font-mono font-semibold text-lg text-(--text-primary)">{fmtNum(risiko?.volatilitaet)}%</p>
              {risiko?.benchmarkVola != null && (
                <p className="text-[10px] text-(--text-tertiary) mt-0.5">BM: {fmtNum(risiko.benchmarkVola)}%</p>
              )}
            </div>
            <div className="surface-inset rounded-lg p-3 metric-box">
              <p className="text-[11px] text-(--text-tertiary) uppercase tracking-wider">{t('maxDrawdown')}</p>
              <p className="font-mono font-semibold text-lg text-(--color-danger)">{fmtNum(risiko?.maxDrawdown)}%</p>
            </div>
            <div className="surface-inset rounded-lg p-3 metric-box">
              <p className="text-[11px] text-(--text-tertiary) uppercase tracking-wider">{t('sharpeRatio')}</p>
              <p className="font-mono font-semibold text-lg text-(--text-primary)">{fmtNum(risiko?.sharpeRatio, 2)}</p>
            </div>
            <div className="surface-inset rounded-lg p-3 metric-box">
              <p className="text-[11px] text-(--text-tertiary) uppercase tracking-wider">{t('beta')}</p>
              <p className="font-mono font-semibold text-lg text-(--text-primary)">{fmtNum(risiko?.beta, 2)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Row: Anleihen + Währungen ── */}
      <div className="grid grid-cols-2 gap-4">

        {/* ── 7. Bond Maturity Structure ── */}
        <Card hover={false}>
          <SectionTitle sub={t('laufzeitenstruktur')}>{t('anleihenLabel')}</SectionTitle>
          {anleihen?.laufzeiten && (
            <div className="mb-4">
              <ResponsiveContainer width="100%" height={130}>
                <BarChart
                  data={anleihen.laufzeiten.map(l => ({ name: l.name, value: l.anteil }))}
                  layout="vertical"
                  margin={{ top: 0, right: 20, bottom: 0, left: 0 }}
                >
                  <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--chart-axis)' }} axisLine={false} tickLine={false} unit="%" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} width={110} />
                  <Tooltip formatter={(v) => [`${v}%`, getLang() === 'en' ? 'Share' : 'Anteil']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Bar dataKey="value" fill={C.gold} radius={[0, 4, 4, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-[11px] text-(--text-tertiary) uppercase tracking-wider">{t('duration')}</p>
              <p className="font-mono font-semibold text-(--text-primary)">{fmtNum(anleihen?.duration)} J</p>
            </div>
            <div className="text-center">
              <p className="text-[11px] text-(--text-tertiary) uppercase tracking-wider">{t('ytm')}</p>
              <p className="font-mono font-semibold text-(--text-primary)">{fmtNum(anleihen?.ytm)}%</p>
            </div>
            <div className="text-center">
              <p className="text-[11px] text-(--text-tertiary) uppercase tracking-wider">{t('rating')}</p>
              <p className="font-mono font-semibold text-(--text-primary) text-xs">{ratingDisplay}</p>
            </div>
          </div>
        </Card>

        {/* ── 8. Currency Allocation ── */}
        <Card hover={false}>
          <SectionTitle sub={t('waehrungsverteilung')}>{t('waehrungen')}</SectionTitle>
          <div className="flex items-start gap-6">
            <MiniDonut data={waehrungData} size={140} centerLabel="FX" />
            <div className="flex-1 mt-1">
              <DonutLegend data={waehrungData} />
              <div className="mt-4 pt-3 border-t border-(--border-light)">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-(--text-secondary)">{t('fxHedgingQuote')}</span>
                  <span className="font-mono font-semibold text-(--text-primary)">{hedgingQuote ?? '–'}%</span>
                </div>
                <div className="w-full rounded-full h-1.5 mt-1.5 progress-track">
                  <div
                    className="h-1.5 rounded-full progress-fill"
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
        <Card hover={false}>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-(--mode-pastel) flex items-center justify-center flex-shrink-0 mt-0.5">
              <MessageSquare className="w-4 h-4 text-(--mode-primary)" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="font-semibold text-(--text-primary) text-sm">{t('investmentOfficeKommentar')}</h3>
                <span className="text-[10px] text-(--text-tertiary)">{ioKommentar.datum} &middot; {ioKommentar.autor}</span>
              </div>
              <p className="text-sm text-(--text-secondary) leading-relaxed">{ioKommentar.text}</p>
              {ioKommentar.naechsterReview && (
                <p className="text-[10px] text-(--text-tertiary) mt-2">{t('naechsterReview')}{ioKommentar.naechsterReview}</p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* ── 10. Footer: ESG, Kosten, Verlustschwelle ── */}
      <div className="grid grid-cols-3 gap-4">
        {/* ESG Score */}
        <Card>
          <div className="flex items-center gap-1.5 mb-2">
            <Leaf className="w-3.5 h-3.5 text-(--color-success)" />
            <p className="text-[11px] text-(--text-tertiary) uppercase tracking-wider">{t('esgScore')}</p>
          </div>
          <div className="flex items-end gap-2">
            <span className="font-mono font-semibold text-[28px] leading-none text-(--text-primary)">{esg?.score ?? '–'}</span>
            <span className="text-xs text-(--text-tertiary) mb-1">/ 100</span>
          </div>
          {esg?.sfdr && (
            <p className="text-[10px] text-(--text-tertiary) mt-1">{esg.sfdr} &middot; CO2: {esg.co2 ?? '–'} t</p>
          )}
          <div className="w-full rounded-full h-2 mt-2 progress-track">
            <div
              className="h-2 rounded-full transition-all progress-fill"
              style={{
                width: `${esg?.score ?? 0}%`,
                backgroundColor: (esg?.score ?? 0) >= 80 ? C.green : (esg?.score ?? 0) >= 60 ? C.gold : C.red,
              }}
            />
          </div>
        </Card>

        {/* Kosten */}
        <Card>
          <p className="text-[11px] text-(--text-tertiary) uppercase tracking-wider mb-2">{t('kostenquoteAllIn')}</p>
          <div className="flex items-end gap-2">
            <span className="font-mono font-semibold text-[28px] leading-none text-(--text-primary)">{fmtNum(kosten?.quote, 2)}%</span>
            <span className="text-xs text-(--text-tertiary) mb-1">p.a.</span>
          </div>
          {kosten?.betrag != null && (
            <p className="text-[10px] text-(--text-tertiary) mt-1">{formatEur(kosten.betrag)} ({kosten.jahr})</p>
          )}
        </Card>

        {/* Verlustschwelle */}
        <Card>
          <p className="text-[11px] text-(--text-tertiary) uppercase tracking-wider mb-2">{t('verlustschwelle')}</p>
          <div className="flex items-center gap-2">
            {vsRatio < 0.8 ? (
              <CheckCircle className="w-5 h-5 text-(--color-success)" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-(--color-danger)" />
            )}
            <div>
              <span className="font-mono font-semibold text-lg text-(--text-primary)">{fmtNum(vsAktPct)}%</span>
              <span className="text-xs text-(--text-tertiary) ml-1.5">/ {vsGrenze}%</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-1">
            {verlustschwelle?.hoechststandDatum && (
              <p className="text-[10px] text-(--text-tertiary)">
                {t('hoechststand')} {formatEur(vsHoechst)} ({verlustschwelle.hoechststandDatum})
              </p>
            )}
            {vsAktuell > 0 && (
              <p className="text-[10px] text-(--text-tertiary)">
                {t('aktuell')} {formatEur(vsAktuell)}
              </p>
            )}
          </div>
          <div className="w-full rounded-full h-2 mt-2 relative progress-track">
            <div
              className="h-2 rounded-full absolute left-0 top-0 progress-fill"
              style={{
                width: `${Math.min(100, vsRatio * 100)}%`,
                backgroundColor: vsRatio > 0.8 ? C.red : vsRatio > 0.5 ? C.amber : C.green,
              }}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
