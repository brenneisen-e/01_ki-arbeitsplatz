import { useState } from 'react';
import KPIGrid from '../../../components/ui/KPIGrid';
import DataTable from '../../../components/ui/DataTable';
import VertragDetailModal from '../../../components/ui/VertragDetailModal';
import { SparteBadge, StatusBadge } from '../../../components/ui/Badge';
import { useMode } from '../../../hooks/useMode';
import useTranslation from '../../../i18n/useTranslation';
import { KUNDEN_BY_MODE, BESTAND_DATA } from '../../../data';
import { formatEur, formatDatum } from '../../../utils/formatters';

// „seit" liegt in den Daten als YYYY-MM vor und wird als MM/YYYY gezeigt;
// volle ISO-Daten laufen über formatDatum (DD.MM.YYYY).
function formatSeit(v) {
  if (!v) return '-';
  const m = String(v).match(/^(\d{4})-(\d{2})$/);
  if (m) return `${m[2]}/${m[1]}`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(v))) return formatDatum(v);
  return v;
}

export default function BestandTab() {
  const { modeId } = useMode();
  const { t, tn } = useTranslation();
  const [selectedVertrag, setSelectedVertrag] = useState(null);

  const BESTAND_KPI_CONFIG = {
    versicherung: [
      { id: 'vertraege', label: t('vertraege'), format: 'num', icon: 'FileText' },
      { id: 'praemienvolumen', label: t('praemienvolumen'), format: 'eur', icon: 'Briefcase' },
      { id: 'durchschnittspraemie', label: t('durchschnittspraemie'), format: 'eur', icon: 'BarChart3' },
      { id: 'vertragsdichte', label: t('vertragsdichte'), format: 'num', icon: 'Layers' },
    ],
    banking: [
      { id: 'vertraege', label: t('produktanzahl'), format: 'num', icon: 'FileText' },
      { id: 'praemienvolumen', label: t('kreditvolumen'), format: 'eur', icon: 'Landmark' },
      { id: 'durchschnittspraemie', label: t('einlagenvolumen'), format: 'eur', icon: 'PiggyBank' },
      { id: 'vertragsdichte', label: t('produkteProKunde'), format: 'num', icon: 'Layers' },
    ],
    vermoegensverwaltung: [
      { id: 'vertraege', label: t('mandate'), format: 'num', icon: 'FileText' },
      { id: 'praemienvolumen', label: t('aumGesamt'), format: 'eur', icon: 'Briefcase' },
      { id: 'durchschnittspraemie', label: t('avgAumMandat2'), format: 'eur', icon: 'BarChart3' },
      { id: 'vertragsdichte', label: t('mandateProBerater'), format: 'num', icon: 'Layers' },
    ],
  };

  const COLUMNS = [
    { id: 'typ', label: t('typ') },
    { id: 'sparte', label: t('sparte'), render: (v) => v ? <SparteBadge sparte={v} /> : '-' },
    { id: 'produkt', label: t('produkt') },
    { id: 'details', label: t('details') },
    { id: 'praemie', label: t('praemieJ'), render: (v) => <span className="font-mono">{formatEur(v)}</span> },
    { id: 'seit', label: t('seit'), render: (v) => <span className="text-(--text-secondary)">{formatSeit(v)}</span> },
    { id: 'status', label: t('status'), render: (v) => <StatusBadge status={v} /> },
  ];
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
              <div className="w-6 h-6 rounded-full bg-(--mode-primary-soft) flex items-center justify-center text-[10px] font-bold text-(--mode-primary)">
                {name.split(' ').map(n => n[0]).join('')}
              </div>
              <span className="text-(--text-primary)">{tn(name)}</span>
              <span className="text-(--text-tertiary) font-normal font-mono text-xs">{rows[0]?.kundeId}</span>
              <span className="text-(--text-tertiary) font-normal">&middot; {rows.length} {modeId === 'vermoegensverwaltung' ? t('positionenLabel') : t('vertraege')} &middot; <span className="font-mono">{formatEur(total)}</span></span>
            </div>
          );
        }}
        onRowClick={(row) => setSelectedVertrag(row)}
      />
    </div>
  );
}
