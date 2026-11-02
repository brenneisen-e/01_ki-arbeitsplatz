import { AlertTriangle, Check } from 'lucide-react';
import KpiRow from '../../components/KpiRow';
import Badge from '../../components/Badge';
import ProgressSteps from '../../components/ProgressSteps';
import { CASHFLOW_DATA, formatCompact, formatAmount } from '../../data';

export default function CashflowsTab({ workflows, flashWfId, onOpenModal }) {
  const pending = CASHFLOW_DATA.filter(c => c.status !== 'Trading');
  const completed = CASHFLOW_DATA.filter(c => c.status === 'Trading');
  const totalInflow = CASHFLOW_DATA.filter(c => c.amount > 0).reduce((s, c) => s + c.amount, 0);
  const totalOutflow = CASHFLOW_DATA.filter(c => c.amount < 0).reduce((s, c) => s + c.amount, 0);

  const kpis = [
    { label: 'Total Cashflows', value: String(CASHFLOW_DATA.length), type: 'neutral' },
    { label: 'Inflows', value: formatCompact(totalInflow), type: 'success' },
    { label: 'Outflows', value: formatCompact(Math.abs(totalOutflow)), type: 'warning' },
    { label: 'Pending', value: String(pending.length), type: 'info' },
    { label: 'Completed', value: String(completed.length), type: 'success' },
  ];

  const renderTable = (data) => {
    if (!data.length) return <div className="p-6 text-center text-slate-400 text-[15px]">No cashflows</div>;

    return (
      <div className="border border-slate-200 rounded-[10px] overflow-hidden bg-white">
        <table className="w-full border-collapse text-[15px]">
          <thead className="bg-slate-50">
            <tr>
              {['ID', 'Portfolio', 'Type', 'Amount', 'Value Date', 'Status', 'Progress'].map(h => (
                <th key={h} className="px-3.5 py-2.5 text-left text-[15px] font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-200">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(cf => {
              const amt = formatAmount(cf.amount, cf.ccy);
              const matchingWf = workflows?.find(w => w.portfolioId === cf.portfolioId && w.event.toLowerCase().includes('cash'));
              const isFlashing = flashWfId && matchingWf && matchingWf.id === flashWfId;
              const statusKey = cf.status === 'Trading' ? 'trading' :
                cf.status === 'PTC complete' || cf.status === 'Ready to send' ? 'ptc-complete' :
                cf.status === 'Draft' ? 'draft' : 'pending';

              return (
                <tr key={cf.id}
                    className={`row-hover ${isFlashing ? 'row-flash' : ''}`}
                    onClick={() => matchingWf && onOpenModal(matchingWf.id)}
                    style={{ cursor: matchingWf ? 'pointer' : 'default' }}>
                  <td className="px-3.5 py-2.5 border-b border-slate-100 font-mono text-base text-blue-500 font-medium">{cf.id}</td>
                  <td className="px-3.5 py-2.5 border-b border-slate-100 font-medium text-slate-800 max-w-[240px] truncate">{cf.portfolio}</td>
                  <td className="px-3.5 py-2.5 border-b border-slate-100">
                    <Badge type={cf.amount > 0 ? 'cashflow' : 'sod'}>{cf.type}</Badge>
                  </td>
                  <td className="px-3.5 py-2.5 border-b border-slate-100 text-right font-mono text-base">
                    <span className={amt.positive ? 'text-emerald-600' : 'text-red-600'}>{amt.text}</span>
                  </td>
                  <td className="px-3.5 py-2.5 border-b border-slate-100">{cf.valueDate}</td>
                  <td className="px-3.5 py-2.5 border-b border-slate-100"><Badge type={statusKey}>{cf.status}</Badge></td>
                  <td className="px-3.5 py-2.5 border-b border-slate-100"><ProgressSteps current={cf.steps} total={cf.totalSteps} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
      <KpiRow items={kpis} />

      <div className="flex flex-col gap-6">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-800">
              <AlertTriangle size={14} /> Pending Cashflows
            </h3>
            <span className="text-[15px] font-semibold px-2 py-0.5 rounded-[10px] bg-amber-100 text-amber-800">{pending.length}</span>
          </div>
          {renderTable(pending)}
        </div>

        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-800">
              <Check size={14} /> Completed
            </h3>
            <span className="text-[15px] font-semibold px-2 py-0.5 rounded-[10px] bg-green-100 text-green-800">{completed.length}</span>
          </div>
          {renderTable(completed)}
        </div>
      </div>
    </div>
  );
}
