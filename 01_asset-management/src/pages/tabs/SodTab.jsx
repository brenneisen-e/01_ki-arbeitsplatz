import { AlertTriangle, Check } from 'lucide-react';
import KpiRow from '../../components/KpiRow';
import Badge from '../../components/Badge';
import { SOD_DATA } from '../../data';

export default function SodTab() {
  const unresolved = SOD_DATA.filter(s => !s.autoResolved);
  const resolved = SOD_DATA.filter(s => s.autoResolved);
  const totalItems = SOD_DATA.reduce((s, d) => s + d.items, 0);
  const highSev = SOD_DATA.filter(s => s.severity === 'high').length;

  const kpis = [
    { label: 'SOD Alerts', value: String(SOD_DATA.length), type: 'neutral' },
    { label: 'Manual Review', value: String(unresolved.length), type: 'warning' },
    { label: 'Auto-Resolved', value: String(resolved.length), type: 'success' },
    { label: 'Total Items', value: String(totalItems), type: 'info' },
    { label: 'High Severity', value: String(highSev), type: 'warning' },
  ];

  const openSodChat = (sod) => {
    if (window.__amOpenSodChat) {
      window.__amOpenSodChat(sod.portfolio, sod.changeReason, sod.portfolioId);
    }
  };

  const renderTable = (data) => {
    if (!data.length) return <div className="p-6 text-center text-slate-400 text-[15px]">No SOD alerts</div>;
    return (
      <div className="border border-slate-200 rounded-[10px] overflow-hidden bg-white">
        <table className="w-full border-collapse text-[15px]">
          <thead className="bg-slate-50">
            <tr>
              {['Portfolio ID', 'Portfolio', 'Change Reason', 'Severity', 'Items', 'Status'].map(h => (
                <th key={h} className="px-3.5 py-2.5 text-left text-[15px] font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-200">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((sod, i) => {
              const statusLabel = sod.autoResolved ? 'Auto-Resolved' : 'Manual Review';
              const statusType = sod.autoResolved ? 'auto-resolved' : 'manual-review';

              return (
                <tr key={i}
                    className="row-hover"
                    onClick={() => !sod.autoResolved && openSodChat(sod)}
                    style={{ cursor: !sod.autoResolved ? 'pointer' : 'default' }}>
                  <td className="px-3.5 py-2.5 border-b border-slate-100 font-mono text-base text-blue-500 font-medium">{sod.portfolioId}</td>
                  <td className="px-3.5 py-2.5 border-b border-slate-100 font-medium text-slate-800 max-w-[240px] truncate">{sod.portfolio}</td>
                  <td className="px-3.5 py-2.5 border-b border-slate-100">{sod.changeReason}</td>
                  <td className="px-3.5 py-2.5 border-b border-slate-100">
                    <Badge type={sod.severity}>{sod.severity.charAt(0).toUpperCase() + sod.severity.slice(1)}</Badge>
                  </td>
                  <td className="px-3.5 py-2.5 border-b border-slate-100">{sod.items} item{sod.items > 1 ? 's' : ''}</td>
                  <td className="px-3.5 py-2.5 border-b border-slate-100"><Badge type={statusType}>{statusLabel}</Badge></td>
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
              <AlertTriangle size={14} /> Requires Manual Review
            </h3>
            <span className="text-[15px] font-semibold px-2 py-0.5 rounded-[10px] bg-amber-100 text-amber-800">{unresolved.length}</span>
          </div>
          {renderTable(unresolved)}
        </div>

        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-800">
              <Check size={14} /> Auto-Resolved
            </h3>
            <span className="text-[15px] font-semibold px-2 py-0.5 rounded-[10px] bg-green-100 text-green-800">{resolved.length}</span>
          </div>
          {renderTable(resolved)}
        </div>
      </div>
    </div>
  );
}
