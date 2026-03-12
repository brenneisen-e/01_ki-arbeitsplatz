import Card from '../../../components/ui/Card';
import DataTable from '../../../components/ui/DataTable';
import LogoImg from '../../../components/ui/LogoImg';
import { StatusBadge, SparteBadge } from '../../../components/ui/Badge';
import { formatEur } from '../../../utils/formatters';
import { useMode } from '../../../hooks/useMode';

export default function VertraegeTab({ kunde }) {
  const { modeId } = useMode();
  const produkte = kunde.eigeneProdukte || [];

  const praemieLabel = modeId === 'banking' ? 'Jahreskosten' : modeId === 'vermoegensverwaltung' ? 'Volumen' : 'Prämie/J.';
  const sumLabel = modeId === 'banking' ? 'Gesamtkosten/J.' : modeId === 'vermoegensverwaltung' ? 'Gesamtvolumen' : 'Gesamtprämie/J.';

  const columns = [
    { id: 'produkt', label: 'Produkt', render: (v, row) => (
      <div className="flex items-center gap-2">
        {row.versicherer && <LogoImg name={row.versicherer} size={18} />}
        <span className="font-medium">{v}</span>
      </div>
    )},
    { id: 'sparte', label: 'Sparte', render: v => v ? <SparteBadge sparte={v} /> : '-' },
    { id: 'details', label: 'Tarif / Details' },
    { id: 'praemie', label: praemieLabel, render: v => <span className="font-mono font-medium">{formatEur(v)}</span> },
    { id: 'seit', label: 'Seit' },
    { id: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
  ];

  // For banking: add a Volumen column for credit products
  if (modeId === 'banking') {
    columns.splice(4, 0, {
      id: 'volumen', label: 'Volumen',
      render: v => v ? <span className="font-mono text-slate-500">{formatEur(v)}</span> : '-',
    });
  }

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="font-semibold text-slate-800 mb-4">
          Eigene Produkte ({produkte.length} {modeId === 'banking' ? 'Produkte' : 'Verträge'})
        </h3>
        <DataTable columns={columns} data={produkte} />
      </Card>

      <Card>
        <h3 className="font-semibold text-slate-800 mb-4">Vertragszusammenfassung</h3>
        <div className="grid grid-cols-3 gap-6">
          <SummaryItem label={sumLabel} value={formatEur(produkte.reduce((s, p) => s + (p.praemie || 0), 0))} />
          <SummaryItem label={modeId === 'banking' ? 'Anzahl Produkte' : 'Anzahl Verträge'} value={produkte.length} />
          <SummaryItem label="Optimierbar" value={produkte.filter(p => p.status === 'optimierbar').length} highlight />
        </div>
      </Card>
    </div>
  );
}

function SummaryItem({ label, value, highlight }) {
  return (
    <div>
      <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">{label}</div>
      <div className={`font-mono text-2xl font-bold ${highlight ? 'text-amber-600' : 'text-slate-800'}`}>{value}</div>
    </div>
  );
}
