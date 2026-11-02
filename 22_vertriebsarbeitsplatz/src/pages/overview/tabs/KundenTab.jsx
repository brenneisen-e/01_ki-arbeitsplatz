import { useState, useMemo, memo } from 'react';
import KPIGrid from '../../../components/ui/KPIGrid';
import { useMode } from '../../../hooks/useMode';
import useTranslation from '../../../i18n/useTranslation';
import { KUNDEN_BY_MODE } from '../../../data';
import { formatEur, potentialSterne } from '../../../utils/formatters';
import { Star, Search, TrendingDown, Minus, AlertTriangle, ChevronUp, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

// Cockpit 2026: Sterne in Gold (Akzent), leere Sterne als Hairline-Ton.
const StarRating = memo(function StarRating({ score }) {
  const { full, half, empty } = potentialSterne(score);
  return (
    <div className="flex items-center gap-0.5">
      {Array(full).fill(0).map((_, i) => <Star key={`f${i}`} size={12} className="text-(--mode-accent) fill-(--mode-accent)" />)}
      {half ? <Star size={12} className="text-(--mode-accent) fill-(--mode-accent)/50" /> : null}
      {Array(empty).fill(0).map((_, i) => <Star key={`e${i}`} size={12} className="text-(--border-strong)" />)}
    </div>
  );
});

function formatAuM(val) {
  if (val == null || val === 0) return '-';
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M€`;
  if (val >= 1000) return `${Math.round(val / 1000)}k€`;
  return formatEur(val);
}

// Getönte Plakette ohne Rahmen in Signalfarbe.
function SegmentBadge({ typ, t }) {
  if (!typ) return null;
  const labels = { Spezialmandat: t ? t('individuell') : 'Individuell' };
  const styles = {
    FairValue: 'bg-(--tint-info) text-(--color-info)',
    SmartValue: 'bg-(--tint-success) text-(--color-success)',
    Spezialmandat: 'bg-violet-50 text-violet-700',
  };
  return (
    <span className={clsx('inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded-full', styles[typ] || 'bg-(--bg-inset) text-(--text-secondary)')}>
      {labels[typ] || typ}
    </span>
  );
}

function RiskBadge({ risk, t }) {
  if (!risk) return null;
  const styles = {
    niedrig: 'text-(--color-success)',
    mittel: 'text-(--color-warning)',
    hoch: 'text-(--color-danger)',
  };
  const icons = {
    niedrig: <TrendingDown size={10} />,
    mittel: <Minus size={10} />,
    hoch: <AlertTriangle size={10} />,
  };
  return (
    <span className={clsx('inline-flex items-center gap-0.5 text-[10px] font-medium', styles[risk] || 'text-(--text-tertiary)')}>
      {icons[risk]} {risk === 'niedrig' ? t('stabil') : risk === 'mittel' ? t('beobachten') : t('risiko')}
    </span>
  );
}

// Allokation als kleiner Stapelbalken: Modusfarbe, Gold, Tönung, Neutral —
// höchstens eine Modusfarbe plus Gold je Chart.
const ALLOKATION_FARBEN = {
  aktien: 'var(--mode-chart)',
  anleihen: 'var(--mode-accent)',
  alternative: 'color-mix(in oklab, var(--mode-chart) 40%, white)',
  cash: 'var(--border-strong)',
};

function AllocationBar({ allocation, t }) {
  if (!allocation) return <span className="text-(--border-strong)">-</span>;
  const segments = [
    { key: 'aktien', label: t('aktien') },
    { key: 'anleihen', label: t('anleihen') },
    { key: 'alternative', label: t('alternative') },
    { key: 'cash', label: t('cash') },
  ];
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex w-16 h-2 rounded-full overflow-hidden bg-(--bg-inset)">
        {segments.map(s => {
          const val = allocation[s.key] || 0;
          return val > 0 ? <div key={s.key} style={{ width: `${val}%`, backgroundColor: ALLOKATION_FARBEN[s.key] }} title={`${s.label}: ${val}%`} /> : null;
        })}
      </div>
      <span className="text-[10px] font-mono text-(--text-tertiary)">{allocation.aktien || 0}%</span>
    </div>
  );
}

function getColumns(modeId, t) {
  const isVV = modeId === 'vermoegensverwaltung';
  const isBanking = modeId === 'banking';

  if (isVV) {
    return [
      { id: 'name', label: t('mandant'), flex: 1.8 },
      { id: 'volumen', label: t('aum'), flex: 0.9, align: 'right' },
      { id: 'letzterKontakt', label: t('letztesGespraech'), flex: 0.9, align: 'right' },
      { id: 'mandatsTyp', label: t('strategie'), flex: 0.8, align: 'center' },
      { id: 'mandatSeit', label: t('mandantSeit'), flex: 0.7, align: 'right' },
      { id: 'ytd', label: t('perfYtd'), flex: 0.7, align: 'right' },
      { id: 'perfVsBm', label: t('gguBm'), flex: 0.6, align: 'right' },
      { id: 'allocation', label: t('allokation'), flex: 1, align: 'center' },
      { id: 'esgScore', label: 'ESG', flex: 0.5, align: 'center' },
      { id: 'gesamtVermoegen', label: t('gesamtverm'), flex: 0.9, align: 'right' },
      { id: 'potentialCount', label: t('potenziale'), flex: 0.6, align: 'center' },
      { id: 'status', label: t('status'), flex: 0.7, align: 'center' },
    ];
  }

  const cols = [
    { id: 'name', label: t('name'), flex: 2 },
    { id: 'beruf', label: t('beruf'), flex: 2 },
  ];

  cols.push({ id: 'volumen', label: isBanking ? t('volumen') : t('praemie'), flex: 1, align: 'right' });

  cols.push(
    { id: 'potentialScore', label: t('potenzial'), flex: 1, align: 'center' },
    { id: 'nps', label: 'NPS', flex: 0.5, align: 'center' },
    { id: 'status', label: t('status'), flex: 1, align: 'center' },
    { id: 'letzterKontakt', label: t('kontakt'), flex: 0.7, align: 'right' },
  );

  return cols;
}

// Signalfarbe nach Schwelle: gut, beobachten, kritisch.
function signalKlasse(wert, gut, mittel) {
  return wert >= gut ? 'text-(--color-success)' : wert >= mittel ? 'text-(--color-warning)' : 'text-(--color-danger)';
}

export default function KundenTab() {
  const { modeId, navigateTo } = useMode();
  const { t, tn } = useTranslation();
  const kunden = KUNDEN_BY_MODE[modeId] || [];
  const [filter, setFilter] = useState('');
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const isVV = modeId === 'vermoegensverwaltung';

  const K_KPI_CONFIG = [
    { id: 'kundenAnzahl', label: t('kundenLabel'), format: 'num', icon: 'Users' },
    { id: 'avgVertraege', label: t('avgVertraegeProKunde'), format: 'num', icon: 'FileText' },
    { id: 'avgVolumen', label: t('avgBestandsvolumen'), format: 'eur', icon: 'Briefcase' },
    { id: 'avgNps', label: t('avgNps'), format: 'num', icon: 'ThumbsUp' },
  ];

  const VV_KPI_CONFIG = [
    { id: 'mandatAnzahl', label: t('mandate'), format: 'num', icon: 'Users' },
    { id: 'gesamtAuM', label: t('aumGesamt'), format: 'eur', icon: 'Wallet' },
    { id: 'avgAuM', label: t('avgAumMandat'), format: 'eur', icon: 'Briefcase' },
    { id: 'avgNps', label: t('avgNps'), format: 'num', icon: 'ThumbsUp' },
  ];

  const columns = getColumns(modeId, t);

  function handleSort(colId) {
    if (sortCol === colId) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(colId);
      setSortDir('asc');
    }
  }

  // Build table data (memoized)
  const tableData = useMemo(() => {
    const data = kunden
      .filter(k => !filter || k.name.toLowerCase().includes(filter.toLowerCase()))
      .map(k => {
        const volumen = isVV
          ? (k.aum || k.eigeneProdukte?.reduce((s, p) => s + (p.volumen || 0), 0) || 0)
          : (k.eigeneProdukte?.reduce((s, p) => s + (p.praemie || p.volumen || 0), 0) || 0);
        const fremdTotal = k.fremdProdukte?.reduce((s, p) => s + (p.volumen || 0), 0) || 0;
        const mandatStart = k.eigeneProdukte?.[0]?.seit || null;
        return {
          ...k,
          volumen,
          gesamtVermoegen: volumen + fremdTotal,
          mandatSeit: mandatStart,
          allocation: k.portfolio?.allocation ?? null,
          esgScore: k.portfolio?.esgScore ?? null,
          ytd: k.portfolio?.performance?.ytd ?? null,
          perfVsBm: k.portfolio?.performance?.ytd != null && k.portfolio?.benchmark?.ytd != null
            ? +(k.portfolio.performance.ytd - k.portfolio.benchmark.ytd).toFixed(1) : null,
          letzterKontakt: k.kommunikation?.[0]?.datum
            ? (() => {
                const [y, m, d] = k.kommunikation[0].datum.split('-');
                return `${d}.${m}.${y}`;
              })()
            : '-',
          potCount: k.potentiale?.filter(p => p.status !== 'abgeschlossen')?.length || 0,
          potValue: k.potentiale?.filter(p => p.status !== 'abgeschlossen')?.reduce((s, p) => s + (p.volumen || 0), 0) || 0,
        };
      });

    // Sort
    if (sortCol) {
      data.sort((a, b) => {
        let va = a[sortCol], vb = b[sortCol];
        if (va == null) return 1;
        if (vb == null) return -1;
        const cmp = typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb), 'de');
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return data;
  }, [kunden, filter, sortCol, sortDir, isVV]);

  // KPIs (memoized)
  const { kpiConfig, kpiValues } = useMemo(() => {
    if (isVV) {
      const gesamtAuM = kunden.reduce((s, k) => s + (k.aum || k.eigeneProdukte?.reduce((ps, p) => ps + (p.volumen || 0), 0) || 0), 0);
      return {
        kpiConfig: VV_KPI_CONFIG,
        kpiValues: {
          mandatAnzahl: { wert: kunden.length, trend: 2.1 },
          gesamtAuM: { wert: gesamtAuM, trend: 4.5 },
          avgAuM: { wert: Math.round(gesamtAuM / (kunden.length || 1)), trend: 2.3 },
          avgNps: { wert: parseFloat((kunden.reduce((s, k) => s + (k.nps || 0), 0) / (kunden.length || 1)).toFixed(1)), trend: 0.3 },
        },
      };
    }
    const avgVertraege = kunden.reduce((s, k) => s + (k.eigeneProdukte?.length || 0), 0) / (kunden.length || 1);
    const avgVolumen = kunden.reduce((s, k) => s + k.eigeneProdukte?.reduce((ps, p) => ps + (p.praemie || 0), 0), 0) / (kunden.length || 1);
    const avgNps = kunden.reduce((s, k) => s + (k.nps || 0), 0) / (kunden.length || 1);
    return {
      kpiConfig: K_KPI_CONFIG,
      kpiValues: {
        kundenAnzahl: { wert: kunden.length, trend: 3.2 },
        avgVertraege: { wert: parseFloat(avgVertraege.toFixed(1)), trend: 0.2 },
        avgVolumen: { wert: Math.round(avgVolumen), trend: 1.5 },
        avgNps: { wert: parseFloat(avgNps.toFixed(1)), trend: 0.3 },
      },
    };
  }, [kunden, isVV]);

  const kundenLabel = isVV ? t('mandant') : t('kundeLabel');

  // Cell renderer
  function renderCell(col, row) {
    switch (col.id) {
      case 'name':
        return <span className="font-medium text-(--text-primary)">{tn(row.name)}</span>;
      case 'beruf':
        return <span className="text-(--text-secondary) truncate">{row.beruf}</span>;
      case 'mandatsTyp':
        return <SegmentBadge typ={row.mandatsTyp} t={t} />;
      case 'volumen':
        return <span className="font-mono font-medium text-(--text-primary)">{isVV ? formatAuM(row.volumen) : formatEur(row.volumen)}</span>;
      case 'gesamtVermoegen':
        return <span className="font-mono text-(--text-secondary)">{formatAuM(row.gesamtVermoegen)}</span>;
      case 'mandatSeit':
        if (!row.mandatSeit) return <span className="text-(--border-strong)">-</span>;
        { const [y, m] = row.mandatSeit.split('-');
          return <span className="text-(--text-secondary)">{m}/{y}</span>; }
      case 'allocation':
        return <AllocationBar allocation={row.allocation} t={t} />;
      case 'esgScore':
        if (row.esgScore == null) return <span className="text-(--border-strong)">-</span>;
        return (
          <span className={clsx('font-mono font-medium text-[12px]', signalKlasse(row.esgScore, 75, 60))}>{row.esgScore}</span>
        );
      case 'potentialCount':
        return row.potCount > 0 ? (
          <div className="flex flex-col items-center">
            <span className="font-mono font-semibold text-(--text-primary)">{row.potCount}</span>
            {row.potValue > 0 && <span className="text-[9px] font-mono text-(--text-tertiary)">{formatAuM(row.potValue)}</span>}
          </div>
        ) : <span className="text-(--border-strong)">-</span>;
      case 'ytd':
        return row.ytd != null ? (
          <span className={clsx('font-mono font-medium', row.ytd >= 0 ? 'text-(--color-success)' : 'text-(--color-danger)')}>
            {row.ytd >= 0 ? '+' : ''}{row.ytd.toFixed(1)}%
          </span>
        ) : <span className="text-(--border-strong)">-</span>;
      case 'perfVsBm':
        return row.perfVsBm != null ? (
          <span className={clsx('font-mono font-medium', row.perfVsBm >= 0 ? 'text-(--color-success)' : 'text-(--color-danger)')}>
            {row.perfVsBm >= 0 ? '+' : ''}{row.perfVsBm.toFixed(1)}%
          </span>
        ) : <span className="text-(--border-strong)">-</span>;
      case 'potentialScore':
        return (
          <div className="flex items-center gap-1.5">
            <StarRating score={row.potentialScore || 0} />
            {row.potCount > 0 && <span className="text-[10px] font-mono text-(--text-tertiary)">{row.potCount}</span>}
          </div>
        );
      case 'nps':
        return (
          <span className={clsx('font-mono font-semibold', signalKlasse(row.nps, 7, 5))}>
            {row.nps}
          </span>
        );
      case 'status':
        return <RiskBadge risk={row.abwanderungsrisiko} t={t} />;
      case 'letzterKontakt':
        return <span className="text-(--text-secondary)">{row.letzterKontakt}</span>;
      default:
        return row[col.id] ?? '-';
    }
  }

  return (
    <div className="space-y-5">
      <KPIGrid kpiConfig={kpiConfig} kpiValues={kpiValues} />

      <div className="flex gap-3 items-center">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-tertiary)" />
          <input
            type="text"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder={isVV ? t('mandantSuchen') : t('kundeSuchen', { label: kundenLabel })}
            className="surface-inset pl-9 pr-4 h-9 rounded-[10px] text-sm text-(--text-primary) placeholder:text-(--text-tertiary) focus:border-(--mode-accent) transition-colors w-64"
          />
        </div>
        <div className="text-xs text-(--text-tertiary) ml-2">
          <span className="font-mono">{tableData.length}</span> {tableData.length === 1 ? kundenLabel : isVV ? t('mandantenPlural') : t('kundenPlural')}
        </div>
      </div>

      {/* Table */}
      <div className="surface-card overflow-hidden">
        {/* Header */}
        <div className="flex items-stretch border-b border-(--border-light)">
          {columns.map(col => (
            <div
              key={col.id}
              className={clsx(
                'px-4 py-3 text-[11px] font-semibold uppercase tracking-wider select-none cursor-pointer',
                'flex items-center gap-1 transition-colors',
                sortCol === col.id ? 'text-(--text-primary)' : 'text-(--text-tertiary) hover:text-(--text-primary)',
                col.align === 'right' && 'justify-end',
                col.align === 'center' && 'justify-center',
              )}
              style={{ flex: col.flex }}
              onClick={() => handleSort(col.id)}
            >
              {col.label}
              {sortCol === col.id && (
                sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />
              )}
            </div>
          ))}
        </div>

        {/* Rows */}
        {tableData.map((row, i) => (
          <div
            key={row.id || i}
            className={clsx(
              'flex items-center border-b border-(--border-light) last:border-0 cursor-pointer transition-colors duration-150',
              i % 2 === 0 ? 'bg-(--bg-card)' : 'bg-(--bg-table-stripe)',
              'hover:bg-(--bg-table-hover)',
            )}
            onClick={() => navigateTo('detail', { kundeId: row.id })}
          >
            {columns.map(col => (
              <div
                key={col.id}
                className={clsx(
                  'px-4 py-2.5 text-[13px] min-w-0 truncate',
                  col.align === 'right' && 'text-right',
                  col.align === 'center' && 'text-center flex justify-center',
                )}
                style={{ flex: col.flex }}
              >
                {renderCell(col, row)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
