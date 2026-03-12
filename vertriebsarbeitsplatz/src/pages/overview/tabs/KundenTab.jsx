import { useState } from 'react';
import KPIGrid from '../../../components/ui/KPIGrid';
import DataTable from '../../../components/ui/DataTable';
import Avatar from '../../../components/ui/Avatar';
import { useMode } from '../../../hooks/useMode';
import { KUNDEN_BY_MODE } from '../../../data';
import { formatEur, potentialSterne } from '../../../utils/formatters';
import { Star } from 'lucide-react';

const K_KPI_CONFIG = [
  { id: 'kundenAnzahl', label: 'Kunden', format: 'num', icon: 'Users' },
  { id: 'avgVertraege', label: '\u00d8 Verträge/Kunde', format: 'num', icon: 'FileText' },
  { id: 'avgVolumen', label: '\u00d8 Bestandsvolumen', format: 'eur', icon: 'Briefcase' },
  { id: 'avgNps', label: '\u00d8 NPS', format: 'num', icon: 'ThumbsUp' },
];

function StarRating({ score }) {
  const { full, half, empty } = potentialSterne(score);
  return (
    <div className="flex items-center gap-0.5">
      {Array(full).fill(0).map((_, i) => <Star key={`f${i}`} size={14} className="text-amber-400 fill-amber-400" />)}
      {half ? <Star size={14} className="text-amber-400 fill-amber-400/50" /> : null}
      {Array(empty).fill(0).map((_, i) => <Star key={`e${i}`} size={14} className="text-slate-200" />)}
    </div>
  );
}

export default function KundenTab() {
  const { modeId, navigateTo } = useMode();
  const kunden = KUNDEN_BY_MODE[modeId] || [];
  const [filter, setFilter] = useState('');

  const avgVertraege = kunden.reduce((s, k) => s + (k.eigeneProdukte?.length || 0), 0) / (kunden.length || 1);
  const avgVolumen = kunden.reduce((s, k) => s + k.eigeneProdukte?.reduce((ps, p) => ps + (p.praemie || 0), 0), 0) / (kunden.length || 1);
  const avgNps = kunden.reduce((s, k) => s + (k.nps || 0), 0) / (kunden.length || 1);

  const kpiValues = {
    kundenAnzahl: { wert: kunden.length, trend: 3.2 },
    avgVertraege: { wert: parseFloat(avgVertraege.toFixed(1)), trend: 0.2 },
    avgVolumen: { wert: Math.round(avgVolumen), trend: 1.5 },
    avgNps: { wert: parseFloat(avgNps.toFixed(1)), trend: 0.3 },
  };

  const filtered = kunden.filter(k =>
    !filter || k.name.toLowerCase().includes(filter.toLowerCase())
  );

  const columns = [
    { id: 'name', label: 'Name', render: (v, row) => (
      <div className="flex items-center gap-2">
        <Avatar name={v} foto={row.foto} size={36} />
        <span className="font-medium">{v}</span>
      </div>
    )},
    { id: 'potentialScore', label: 'Potenzial', render: (v) => <StarRating score={v || 0} /> },
    { id: 'id', label: 'ID' },
    { id: 'beruf', label: 'Beruf' },
    { id: 'volumen', label: 'Volumen', render: (v) => <span className="font-mono">{formatEur(v)}</span> },
    { id: 'nps', label: 'NPS', render: (v) => (
      <span className={v >= 7 ? 'text-emerald-600' : v >= 5 ? 'text-amber-600' : 'text-red-600'}>
        {v}/10
      </span>
    )},
    { id: 'letzterKontakt', label: 'Kontakt' },
  ];

  const tableData = filtered.map(k => ({
    ...k,
    volumen: k.eigeneProdukte?.reduce((s, p) => s + (p.praemie || 0), 0) || 0,
    letzterKontakt: k.kommunikation?.[0]?.datum?.slice(5) || '-',
  }));

  return (
    <div className="space-y-6">
      <KPIGrid kpiConfig={K_KPI_CONFIG} kpiValues={kpiValues} />

      <div className="flex gap-3 items-center">
        <input
          type="text"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Kunde suchen..."
          className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 w-64"
        />
      </div>

      <DataTable
        columns={columns}
        data={tableData}
        onRowClick={(row) => navigateTo('detail', { kundeId: row.id })}
      />
    </div>
  );
}
