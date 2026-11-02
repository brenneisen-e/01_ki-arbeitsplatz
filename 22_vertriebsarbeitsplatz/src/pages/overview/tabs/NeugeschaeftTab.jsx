import { useState } from 'react';
import KPIGrid from '../../../components/ui/KPIGrid';
import Card from '../../../components/ui/Card';
import DonutChart from '../../../components/charts/DonutChart';
import DataTable from '../../../components/ui/DataTable';
import LogoImg from '../../../components/ui/LogoImg';
import VertragDetailModal from '../../../components/ui/VertragDetailModal';
import { SparteBadge, StatusBadge } from '../../../components/ui/Badge';
import { useMode } from '../../../hooks/useMode';
import useTranslation from '../../../i18n/useTranslation';
import { NEUGESCHAEFT_DATA } from '../../../data';
import { formatEur, formatDatum } from '../../../utils/formatters';

// Cockpit 2026: ein Chart bekommt höchstens eine Modusfarbe plus Gold. Die
// Sparten des Donuts laufen deshalb über Modusfarbe, Gold und deren Tönungen
// statt über die bunten Hexwerte der Datenquelle.
const DONUT_PALETTE = [
  'var(--mode-chart)',
  'var(--mode-accent)',
  'color-mix(in oklab, var(--mode-chart) 55%, white)',
  'color-mix(in oklab, var(--mode-accent) 55%, white)',
  'color-mix(in oklab, var(--mode-chart) 28%, white)',
  'var(--border-strong)',
];

export default function NeugeschaeftTab() {
  const { modeId } = useMode();
  const { t, tn } = useTranslation();
  const [selectedVertrag, setSelectedVertrag] = useState(null);

  const NG_KPI_CONFIG = {
    versicherung: [
      { id: 'antraege', label: t('antraege'), format: 'num', icon: 'FileText' },
      { id: 'policiert', label: t('policiertesNg'), format: 'eur', icon: 'TrendingUp' },
      { id: 'ape', label: t('apeLabel'), format: 'eur', icon: 'BarChart3' },
      { id: 'abschlussquote', label: t('abschlussquote'), format: 'pct', icon: 'Target' },
    ],
    banking: [
      { id: 'antraege', label: t('abschluesseYtd'), format: 'num', icon: 'FileText' },
      { id: 'policiert', label: t('volumenNeugeschaeft'), format: 'eur', icon: 'TrendingUp' },
      { id: 'ape', label: t('dbBeitragNg'), format: 'eur', icon: 'BarChart3' },
      { id: 'abschlussquote', label: t('abschlussquote'), format: 'pct', icon: 'Target' },
    ],
    vermoegensverwaltung: [
      { id: 'antraege', label: t('neueMandate'), format: 'num', icon: 'FileText' },
      { id: 'policiert', label: t('nnmVolumen'), format: 'eur', icon: 'TrendingUp' },
      { id: 'ape', label: t('aumZufluss'), format: 'eur', icon: 'BarChart3' },
      { id: 'abschlussquote', label: t('abschlussquote'), format: 'pct', icon: 'Target' },
    ],
  };

  const COLUMNS = [
    { id: 'id', label: t('vertragsnr'), width: '120px', render: (v) => <span className="font-mono text-xs text-(--text-secondary)">{v}</span> },
    { id: 'sparte', label: t('sparte'), render: (v) => <SparteBadge sparte={v} /> },
    { id: 'produkt', label: t('produkt'), render: (v) => <span className="text-(--text-primary)">{v}</span> },
    { id: 'versicherer', label: t('versicherer'), render: (v) => (
      <div className="flex items-center gap-2 text-(--text-secondary)">
        <LogoImg name={v} size={18} />
        <span>{v}</span>
      </div>
    )},
    { id: 'beitrag', label: t('beitrag'), render: (v, row) => <span className="font-mono text-(--text-primary)">{formatEur(v)}/{row.beitragsart}</span> },
    { id: 'status', label: t('status'), render: (v) => <StatusBadge status={v} /> },
    { id: 'datum', label: t('datum'), render: (v) => <span className="text-(--text-secondary)">{formatDatum(v)}</span> },
  ];
  const data = NEUGESCHAEFT_DATA[modeId] || NEUGESCHAEFT_DATA.versicherung;
  const spartenGesamt = data.spartenVerteilung.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-6">
      {selectedVertrag && (
        <VertragDetailModal vertrag={selectedVertrag} onClose={() => setSelectedVertrag(null)} />
      )}
      <KPIGrid kpiConfig={NG_KPI_CONFIG[modeId] || NG_KPI_CONFIG.versicherung} kpiValues={data.kpiValues} />

      <div className="grid grid-cols-2 gap-4">
        {/* Donut */}
        <Card>
          <h3 className="font-semibold text-(--text-primary) mb-4">{t('spartenverteilungNeugeschaeft')}</h3>
          <DonutChart
            data={data.spartenVerteilung}
            height={220}
            centerValue={spartenGesamt}
            centerLabel={t('gesamt')}
            colors={DONUT_PALETTE}
          />
          <div className="mt-4 space-y-2">
            {data.spartenVerteilung.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: DONUT_PALETTE[i % DONUT_PALETTE.length] }} />
                  <span className="text-(--text-secondary)">{d.name}</span>
                </div>
                <span className="font-mono text-(--text-primary)">
                  {d.value} <span className="text-(--text-tertiary)">({((d.value / spartenGesamt) * 100).toFixed(0)}%)</span>
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Top 5 */}
        <Card>
          <h3 className="font-semibold text-(--text-primary) mb-4">{t('top5KundenNeugeschaeft')}</h3>
          <div className="space-y-1">
            {data.top5.map((k, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-(--border-light) last:border-0">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-(--text-tertiary) w-5">{i + 1}.</span>
                  <span className="text-sm font-medium text-(--text-primary)">{tn(k.name)}</span>
                </div>
                <span className="font-mono text-sm font-medium text-(--text-primary)">{formatEur(k.betrag)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Tabelle */}
      <DataTable
        columns={COLUMNS}
        data={data.vertraege}
        groupBy="kunde"
        onRowClick={(row) => setSelectedVertrag(row)}
        renderGroupHeader={(kunde, rows) => (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-(--mode-primary-soft) flex items-center justify-center text-[10px] font-bold text-(--mode-primary)">
              {kunde.split(' ').map(n => n[0]).join('')}
            </div>
            <span className="text-(--text-primary)">{kunde}</span>
            <span className="text-(--text-tertiary) font-normal font-mono text-xs">{rows[0]?.kundeId}</span>
            <span className="text-(--text-tertiary) font-normal">&middot; {rows.length} {t('vertraege')}</span>
          </div>
        )}
      />
    </div>
  );
}
