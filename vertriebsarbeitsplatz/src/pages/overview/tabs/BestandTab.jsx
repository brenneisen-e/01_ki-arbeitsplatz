import { useState } from 'react';
import KPIGrid from '../../../components/ui/KPIGrid';
import DataTable from '../../../components/ui/DataTable';
import VertragDetailModal from '../../../components/ui/VertragDetailModal';
import { SparteBadge, StatusBadge } from '../../../components/ui/Badge';
import { useMode } from '../../../hooks/useMode';
import { KUNDEN_BY_MODE, BESTAND_DATA } from '../../../data';
import { formatEur } from '../../../utils/formatters';

const BESTAND_KPI_CONFIG = {
  versicherung: [
    { id: 'vertraege', label: 'Verträge', format: 'num', icon: 'FileText' },
    { id: 'praemienvolumen', label: 'Prämienvolumen', format: 'eur', icon: 'Briefcase' },
    { id: 'durchschnittspraemie', label: '\u00d8 Prämie/Kunde', format: 'eur', icon: 'BarChart3' },
    { id: 'vertragsdichte', label: '\u00d8 Verträge/Kunde', format: 'num', icon: 'Layers' },
  ],
  banking: [
    { id: 'vertraege', label: 'Produktanzahl', format: 'num', icon: 'FileText' },
    { id: 'praemienvolumen', label: 'Kreditvolumen', format: 'eur', icon: 'Landmark' },
    { id: 'durchschnittspraemie', label: 'Einlagenvolumen', format: 'eur', icon: 'PiggyBank' },
    { id: 'vertragsdichte', label: 'Produkte/Kunde (PPK)', format: 'num', icon: 'Layers' },
  ],
  vermoegensverwaltung: [
    { id: 'vertraege', label: 'Mandate', format: 'num', icon: 'FileText' },
    { id: 'praemienvolumen', label: 'AuM Gesamt', format: 'eur', icon: 'Briefcase' },
    { id: 'durchschnittspraemie', label: '\u00d8 AuM/Mandat', format: 'eur', icon: 'BarChart3' },
    { id: 'vertragsdichte', label: '\u00d8 Mandate/Berater', format: 'num', icon: 'Layers' },
  ],
};

const COLUMNS = [
  { id: 'typ', label: 'Typ' },
  { id: 'sparte', label: 'Sparte', render: (v) => v ? <SparteBadge sparte={v} /> : '-' },
  { id: 'produkt', label: 'Produkt' },
  { id: 'details', label: 'Details' },
  { id: 'praemie', label: 'Prämie/J.', render: (v) => <span className="font-mono">{formatEur(v)}</span> },
  { id: 'seit', label: 'Seit' },
  { id: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
];

export default function BestandTab() {
  const { modeId } = useMode();
  const [selectedVertrag, setSelectedVertrag] = useState(null);
  const kunden = KUNDEN_BY_MODE[modeId] || [];
  const data = BESTAND_DATA[modeId] || BESTAND_DATA.versicherung;
  const kpiConfig = BESTAND_KPI_CONFIG[modeId] || BESTAND_KPI_CONFIG.versicherung;

  // Flatten all products
  const allProdukte = kunden.flatMap(k =>
    (k.eigeneProdukte || []).map(p => ({
      ...p,
      id: `${k.id}-${p.typ}`,
      kundeId: k.id,
      kunde: k.name,
      kundeName: k.name,
      beitrag: p.praemie,
      beitragsart: 'J',
      versicherer: p.produkt?.split(' ')[0],
      datum: p.seit,
    }))
  );

  return (
    <div className="space-y-6">
      {selectedVertrag && (
        <VertragDetailModal vertrag={selectedVertrag} onClose={() => setSelectedVertrag(null)} />
      )}
      <KPIGrid kpiConfig={kpiConfig} kpiValues={data.kpiValues} />

      <DataTable
        columns={COLUMNS}
        data={allProdukte}
        groupBy="kundeName"
        renderGroupHeader={(name, rows) => {
          const total = rows.reduce((s, r) => s + (r.praemie || 0), 0);
          return (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                {name.split(' ').map(n => n[0]).join('')}
              </div>
              <span>{name}</span>
              <span className="text-slate-400">{rows[0]?.kundeId}</span>
              <span className="text-slate-400">&middot; {rows.length} {modeId === 'vermoegensverwaltung' ? 'Positionen' : 'Verträge'} &middot; {formatEur(total)}</span>
            </div>
          );
        }}
        onRowClick={(row) => setSelectedVertrag(row)}
      />
    </div>
  );
}
