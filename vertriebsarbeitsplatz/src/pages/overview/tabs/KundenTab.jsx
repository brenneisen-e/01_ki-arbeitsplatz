import { useState } from 'react';
import KPIGrid from '../../../components/ui/KPIGrid';
import { useMode } from '../../../hooks/useMode';
import { KUNDEN_BY_MODE } from '../../../data';
import { formatEur, potentialSterne } from '../../../utils/formatters';
import { Star, Search, TrendingDown, Minus, AlertTriangle, ChevronUp, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

const K_KPI_CONFIG = [
  { id: 'kundenAnzahl', label: 'Kunden', format: 'num', icon: 'Users' },
  { id: 'avgVertraege', label: '\u00d8 Vertraege/Kunde', format: 'num', icon: 'FileText' },
  { id: 'avgVolumen', label: '\u00d8 Bestandsvolumen', format: 'eur', icon: 'Briefcase' },
  { id: 'avgNps', label: '\u00d8 NPS', format: 'num', icon: 'ThumbsUp' },
];

const VV_KPI_CONFIG = [
  { id: 'mandatAnzahl', label: 'Mandate', format: 'num', icon: 'Users' },
  { id: 'gesamtAuM', label: 'AuM Gesamt', format: 'eur', icon: 'Wallet' },
  { id: 'avgAuM', label: '\u00d8 AuM/Mandant', format: 'eur', icon: 'Briefcase' },
  { id: 'avgNps', label: '\u00d8 NPS', format: 'num', icon: 'ThumbsUp' },
];

function StarRating({ score }) {
  const { full, half, empty } = potentialSterne(score);
  return (
    <div className="flex items-center gap-0.5">
      {Array(full).fill(0).map((_, i) => <Star key={`f${i}`} size={12} className="text-amber-400 fill-amber-400" />)}
      {half ? <Star size={12} className="text-amber-400 fill-amber-400/50" /> : null}
      {Array(empty).fill(0).map((_, i) => <Star key={`e${i}`} size={12} className="text-slate-200" />)}
    </div>
  );
}

function formatAuM(val) {
  if (val == null || val === 0) return '-';
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M\u20ac`;
  if (val >= 1000) return `${Math.round(val / 1000)}k\u20ac`;
  return formatEur(val);
}

function SegmentBadge({ typ }) {
  if (!typ) return null;
  const labels = { Spezialmandat: 'Individuell' };
  const styles = {
    FairValue: 'bg-blue-50 text-blue-700 border-blue-200',
    SmartValue: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Spezialmandat: 'bg-purple-50 text-purple-700 border-purple-200',
  };
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${styles[typ] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
      {labels[typ] || typ}
    </span>
  );
}

function RiskBadge({ risk }) {
  if (!risk) return null;
  const styles = {
    niedrig: 'text-emerald-600',
    mittel: 'text-amber-600',
    hoch: 'text-red-600',
  };
  const icons = {
    niedrig: <TrendingDown size={10} />,
    mittel: <Minus size={10} />,
    hoch: <AlertTriangle size={10} />,
  };
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium ${styles[risk] || 'text-slate-400'}`}>
      {icons[risk]} {risk === 'niedrig' ? 'Stabil' : risk === 'mittel' ? 'Beobachten' : 'Risiko'}
    </span>
  );
}

function getColumns(modeId) {
  const isVV = modeId === 'vermoegensverwaltung';
  const isBanking = modeId === 'banking';

  const cols = [
    { id: 'name', label: 'Name', flex: 2 },
    { id: 'beruf', label: 'Beruf', flex: 2 },
  ];

  if (isVV) {
    cols.push({ id: 'mandatsTyp', label: 'Anlagestrategie', flex: 1, align: 'center' });
  }

  cols.push({ id: 'volumen', label: isVV ? 'AuM' : isBanking ? 'Volumen' : 'Praemie', flex: 1, align: 'right' });

  if (isVV) {
    cols.push(
      { id: 'ytd', label: 'Perf. YTD', flex: 1, align: 'right' },
      { id: 'perfVsBm', label: 'ggü. BM', flex: 0.8, align: 'right' },
    );
  }

  cols.push(
    { id: 'potentialScore', label: isVV ? 'Cross-Sell' : 'Potenzial', flex: 1, align: 'center' },
    { id: 'nps', label: 'NPS', flex: 0.5, align: 'center' },
    { id: 'status', label: 'Status', flex: 1, align: 'center' },
    { id: 'letzterKontakt', label: 'Kontakt', flex: 0.7, align: 'right' },
  );

  return cols;
}

export default function KundenTab() {
  const { modeId, navigateTo } = useMode();
  const kunden = KUNDEN_BY_MODE[modeId] || [];
  const [filter, setFilter] = useState('');
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const isVV = modeId === 'vermoegensverwaltung';

  const columns = getColumns(modeId);

  function handleSort(colId) {
    if (sortCol === colId) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(colId);
      setSortDir('asc');
    }
  }

  // Build table data
  const tableData = kunden
    .filter(k => !filter || k.name.toLowerCase().includes(filter.toLowerCase()))
    .map(k => {
      const volumen = isVV
        ? (k.aum || k.eigeneProdukte?.reduce((s, p) => s + (p.volumen || 0), 0) || 0)
        : (k.eigeneProdukte?.reduce((s, p) => s + (p.praemie || p.volumen || 0), 0) || 0);
      return {
        ...k,
        volumen,
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
      };
    });

  // Sort
  if (sortCol) {
    tableData.sort((a, b) => {
      let va = a[sortCol], vb = b[sortCol];
      if (va == null) return 1;
      if (vb == null) return -1;
      const cmp = typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb), 'de');
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }

  // KPIs
  let kpiConfig, kpiValues;
  if (isVV) {
    const gesamtAuM = kunden.reduce((s, k) => s + (k.aum || k.eigeneProdukte?.reduce((ps, p) => ps + (p.volumen || 0), 0) || 0), 0);
    kpiConfig = VV_KPI_CONFIG;
    kpiValues = {
      mandatAnzahl: { wert: kunden.length, trend: 2.1 },
      gesamtAuM: { wert: gesamtAuM, trend: 4.5 },
      avgAuM: { wert: Math.round(gesamtAuM / (kunden.length || 1)), trend: 2.3 },
      avgNps: { wert: parseFloat((kunden.reduce((s, k) => s + (k.nps || 0), 0) / (kunden.length || 1)).toFixed(1)), trend: 0.3 },
    };
  } else {
    const avgVertraege = kunden.reduce((s, k) => s + (k.eigeneProdukte?.length || 0), 0) / (kunden.length || 1);
    const avgVolumen = kunden.reduce((s, k) => s + k.eigeneProdukte?.reduce((ps, p) => ps + (p.praemie || 0), 0), 0) / (kunden.length || 1);
    const avgNps = kunden.reduce((s, k) => s + (k.nps || 0), 0) / (kunden.length || 1);
    kpiConfig = K_KPI_CONFIG;
    kpiValues = {
      kundenAnzahl: { wert: kunden.length, trend: 3.2 },
      avgVertraege: { wert: parseFloat(avgVertraege.toFixed(1)), trend: 0.2 },
      avgVolumen: { wert: Math.round(avgVolumen), trend: 1.5 },
      avgNps: { wert: parseFloat(avgNps.toFixed(1)), trend: 0.3 },
    };
  }

  const kundenLabel = isVV ? 'Mandant' : 'Kunde';

  // Cell renderer
  function renderCell(col, row) {
    switch (col.id) {
      case 'name':
        return <span className="font-medium text-slate-800">{row.name}</span>;
      case 'beruf':
        return <span className="text-slate-600 truncate">{row.beruf}</span>;
      case 'mandatsTyp':
        return <SegmentBadge typ={row.mandatsTyp} />;
      case 'volumen':
        return <span className="font-mono font-medium text-slate-800">{isVV ? formatAuM(row.volumen) : formatEur(row.volumen)}</span>;
      case 'ytd':
        return row.ytd != null ? (
          <span className={`font-mono font-medium ${row.ytd >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {row.ytd >= 0 ? '+' : ''}{row.ytd.toFixed(1)}%
          </span>
        ) : <span className="text-slate-300">-</span>;
      case 'perfVsBm':
        return row.perfVsBm != null ? (
          <span className={`font-mono font-medium ${row.perfVsBm >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {row.perfVsBm >= 0 ? '+' : ''}{row.perfVsBm.toFixed(1)}%
          </span>
        ) : <span className="text-slate-300">-</span>;
      case 'potentialScore':
        return (
          <div>
            <StarRating score={row.potentialScore || 0} />
            {row.potCount > 0 && <span className="text-[10px] text-slate-400 ml-1">{row.potCount}</span>}
          </div>
        );
      case 'nps':
        return (
          <span className={`font-semibold ${row.nps >= 7 ? 'text-emerald-600' : row.nps >= 5 ? 'text-amber-600' : 'text-red-600'}`}>
            {row.nps}
          </span>
        );
      case 'status':
        return <RiskBadge risk={row.abwanderungsrisiko} />;
      case 'letzterKontakt':
        return <span className="text-slate-500">{row.letzterKontakt}</span>;
      default:
        return row[col.id] ?? '-';
    }
  }

  return (
    <div className="space-y-5">
      <KPIGrid kpiConfig={kpiConfig} kpiValues={kpiValues} />

      <div className="flex gap-3 items-center">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder={`${kundenLabel} suchen...`}
            className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 w-64"
          />
        </div>
        <div className="text-xs text-slate-400 ml-2">
          {tableData.length} {tableData.length === 1 ? kundenLabel : isVV ? 'Mandanten' : 'Kunden'}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden" style={{ boxShadow: 'var(--card-shadow)' }}>
        {/* Header */}
        <div className="flex items-stretch bg-slate-100 border-b border-slate-200">
          {columns.map(col => (
            <div
              key={col.id}
              className={clsx(
                'px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-600 select-none cursor-pointer',
                'flex items-center gap-1 hover:bg-slate-200/60 transition-colors',
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
              'flex items-center border-b border-slate-100 last:border-0 cursor-pointer transition-colors duration-100',
              i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40',
              'row-hover',
            )}
            onClick={() => navigateTo('detail', { kundeId: row.id })}
          >
            {columns.map(col => (
              <div
                key={col.id}
                className={clsx(
                  'px-4 py-2 text-[13px] min-w-0 truncate',
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
