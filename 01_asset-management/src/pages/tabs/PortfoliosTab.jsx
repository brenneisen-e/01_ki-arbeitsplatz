import KpiRow from '../../components/KpiRow';
import Badge from '../../components/Badge';
import { PORTFOLIO_DATA, formatCompact } from '../../data';

export default function PortfoliosTab() {
  const activeCount = PORTFOLIO_DATA.filter(p => p.status === 'Active').length;
  const totalAum = PORTFOLIO_DATA.reduce((s, p) => s + p.aum, 0);
  const withOrders = PORTFOLIO_DATA.filter(p => p.orders > 0).length;
  const avgCash = (PORTFOLIO_DATA.reduce((s, p) => s + p.cashPct, 0) / PORTFOLIO_DATA.length).toFixed(2);

  const kpis = [
    { label: 'Total Portfolios', value: String(PORTFOLIO_DATA.length), type: 'neutral' },
    { label: 'Total AUM', value: formatCompact(totalAum), type: 'info' },
    { label: 'Active', value: String(activeCount), type: 'success' },
    { label: 'With Orders', value: String(withOrders), type: 'info' },
    { label: 'Avg Cash %', value: avgCash + '%', type: 'neutral' },
  ];

  const getStatusType = (status) => {
    if (status === 'Active' || status === 'Trading') return 'active';
    if (status === 'Trade required') return 'trade-required';
    if (status === 'PTC pending') return 'ptc-pending';
    if (status === 'SOD break') return 'sod-break';
    if (status === 'Rebalancing') return 'rebalancing';
    return 'draft';
  };

  return (
    <div className="animate-fade-in">
      <KpiRow items={kpis} />

      <div className="border border-slate-200 rounded-[10px] overflow-hidden bg-white">
        <table className="w-full border-collapse text-[15px]">
          <thead className="bg-slate-50">
            <tr>
              {['ID', 'Portfolio', 'CCY', 'AUM', 'Cash %', 'Drift', 'Status', 'Orders'].map(h => (
                <th key={h} className="px-3.5 py-2.5 text-left text-[15px] font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-200">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PORTFOLIO_DATA.map(p => {
              const driftCls = p.driftPct < -0.1 ? 'text-red-600' : p.driftPct > 0.1 ? 'text-emerald-600' : 'text-slate-600';
              return (
                <tr key={p.id} className="row-hover">
                  <td className="px-3.5 py-2.5 border-b border-slate-100 font-mono text-base text-blue-500 font-medium">{p.id}</td>
                  <td className="px-3.5 py-2.5 border-b border-slate-100 font-medium text-slate-800 max-w-[240px] truncate">{p.name}</td>
                  <td className="px-3.5 py-2.5 border-b border-slate-100">{p.ccy}</td>
                  <td className="px-3.5 py-2.5 border-b border-slate-100 text-right font-mono text-base">{formatCompact(p.aum)}</td>
                  <td className="px-3.5 py-2.5 border-b border-slate-100">{p.cashPct.toFixed(2)}%</td>
                  <td className="px-3.5 py-2.5 border-b border-slate-100">
                    <span className={`font-mono ${driftCls}`}>{p.driftPct >= 0 ? '+' : ''}{p.driftPct.toFixed(2)}%</span>
                  </td>
                  <td className="px-3.5 py-2.5 border-b border-slate-100"><Badge type={getStatusType(p.status)}>{p.status}</Badge></td>
                  <td className="px-3.5 py-2.5 border-b border-slate-100">{p.orders > 0 ? p.orders : '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
