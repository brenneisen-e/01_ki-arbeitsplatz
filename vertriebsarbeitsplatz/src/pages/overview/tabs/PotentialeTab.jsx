import { useState } from 'react';
import KPIGrid from '../../../components/ui/KPIGrid';
import Card from '../../../components/ui/Card';
import PipelineBar from '../../../components/ui/PipelineBar';
import { PrioBadge, QuellenBadge } from '../../../components/ui/Badge';
import { useMode } from '../../../hooks/useMode';
import { KUNDEN_BY_MODE, getAllPotentiale } from '../../../data';
import { formatEur } from '../../../utils/formatters';
import { clsx } from 'clsx';

const P_KPI_CONFIG = [
  { id: 'consentKunden', label: 'Consent-Kunden', format: 'num', icon: 'Users' },
  { id: 'potentiale', label: 'Potentiale', format: 'num', icon: 'Zap' },
  { id: 'praemienvolumen', label: 'Praemienvolumen', format: 'eur', icon: 'Briefcase' },
  { id: 'convRate', label: 'Conv.-Rate', format: 'pct', icon: 'Target' },
];

const STATUS_TABS = [
  { id: 'alle', label: 'Alle' },
  { id: 'identifiziert', label: 'Identifiziert' },
  { id: 'angeschrieben', label: 'Angeschrieben' },
  { id: 'termin', label: 'Termin' },
  { id: 'abgeschlossen', label: 'Abgeschlossen' },
];

export default function PotentialeTab() {
  const { modeId, navigateTo } = useMode();
  const [statusFilter, setStatusFilter] = useState('alle');
  const allPotentiale = getAllPotentiale(modeId);
  const kunden = KUNDEN_BY_MODE[modeId] || [];

  const statusCounts = {
    identifiziert: allPotentiale.filter(p => p.status === 'identifiziert').length,
    angeschrieben: allPotentiale.filter(p => p.status === 'angeschrieben').length,
    termin: allPotentiale.filter(p => p.status === 'termin').length,
    abgeschlossen: allPotentiale.filter(p => p.status === 'abgeschlossen').length,
  };

  const totalVolumen = allPotentiale.reduce((s, p) => s + (p.volumenTyp === 'jaehrlich' ? p.volumen : 0), 0);

  const kpiValues = {
    consentKunden: { wert: kunden.length, trend: 5.0 },
    potentiale: { wert: allPotentiale.length, trend: 8.2 },
    praemienvolumen: { wert: totalVolumen, trend: 12.5 },
    convRate: { wert: 13.6, trend: 2.1 },
  };

  const pipelineSegments = [
    { label: 'Identifiziert', count: statusCounts.identifiziert, color: '#3b82f6' },
    { label: 'Angeschrieben', count: statusCounts.angeschrieben, color: '#f59e0b' },
    { label: 'Termin', count: statusCounts.termin, color: '#10b981' },
    { label: 'Abgeschl.', count: statusCounts.abgeschlossen, color: 'var(--mode-primary)' },
  ];

  const filtered = statusFilter === 'alle'
    ? allPotentiale
    : allPotentiale.filter(p => p.status === statusFilter);

  // Group by Kunde
  const grouped = new Map();
  filtered.forEach(p => {
    if (!grouped.has(p.kundeId)) grouped.set(p.kundeId, []);
    grouped.get(p.kundeId).push(p);
  });

  return (
    <div className="space-y-6">
      <KPIGrid kpiConfig={P_KPI_CONFIG} kpiValues={kpiValues} />

      {/* Pipeline */}
      <Card>
        <h3 className="font-semibold text-slate-800 mb-4">Pipeline</h3>
        <PipelineBar segments={pipelineSegments} />
      </Card>

      {/* Status Filter */}
      <div className="flex gap-2">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              statusFilter === tab.id
                ? 'bg-slate-800 text-white'
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            )}
          >
            {tab.label} {tab.id === 'alle' ? allPotentiale.length : statusCounts[tab.id] || 0}
          </button>
        ))}
      </div>

      {/* Gruppierte Potentiale */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden" style={{ boxShadow: 'var(--card-shadow)' }}>
        {Array.from(grouped.entries()).map(([kundeId, potentiale]) => {
          const kunde = kunden.find(k => k.id === kundeId);
          const gesamt = potentiale.reduce((s, p) => s + (p.volumen || 0), 0);
          return (
            <div key={kundeId} className="border-b border-slate-200 last:border-0">
              {/* Kunden-Header */}
              <div
                className="flex items-center justify-between px-4 py-3 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => navigateTo('detail', { kundeId, tab: 'impulse' })}
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                    {kunde?.name?.split(' ').map(n => n[0]).join('') || '?'}
                  </div>
                  <span className="font-semibold text-sm text-slate-800">{kunde?.name || kundeId}</span>
                  <span className="text-xs text-slate-400">{kundeId} &middot; {potentiale.length} Potentiale</span>
                </div>
                <span className="font-mono text-sm font-medium text-slate-700">Gesamt {formatEur(gesamt)}</span>
              </div>

              {/* Potentiale-Zeilen */}
              {potentiale.map((p, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 pl-12 border-t border-slate-100 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-sm text-slate-700 truncate">{p.titel}</span>
                    <div className="flex gap-1">
                      {p.quellen?.map((q, qi) => <QuellenBadge key={qi} quelle={q} />)}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <PrioBadge prioritaet={p.prioritaet} />
                    <span className="text-xs text-slate-400 w-24">{p.status}</span>
                    <span className="font-mono text-sm text-slate-700 w-24 text-right">
                      {p.volumen > 0 ? `${formatEur(p.volumen)}/${p.volumenTyp === 'jaehrlich' ? 'J' : p.volumenTyp === 'einmalig' ? 'E' : 'V'}` : '-'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
