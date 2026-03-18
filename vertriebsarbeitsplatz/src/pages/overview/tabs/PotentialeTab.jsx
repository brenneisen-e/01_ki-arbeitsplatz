import { useState, useMemo } from 'react';
import KPIGrid from '../../../components/ui/KPIGrid';
import Card from '../../../components/ui/Card';
import PipelineBar from '../../../components/ui/PipelineBar';
import { PrioBadge, QuellenBadge } from '../../../components/ui/Badge';
import { useMode } from '../../../hooks/useMode';
import useTranslation from '../../../i18n/useTranslation';
import { KUNDEN_BY_MODE, getAllPotentiale } from '../../../data';
import { formatEur } from '../../../utils/formatters';
import { clsx } from 'clsx';

const KUNDEN_FOTOS = {
  'KD00001': './images/AdobeStock_624564221.jpeg',
  'KD00002': './images/AdobeStock_252262042.jpeg',
  'KD00003': './images/AdobeStock_361342769.jpeg',
  'KD00005': './images/AdobeStock_612932760.jpeg',
  'KD00008': './images/AdobeStock_1091012713.jpeg',
  'BK00001': './images/AdobeStock_624564221.jpeg',
  'BK00003': './images/AdobeStock_361342769.jpeg',
  'BK00005': './images/AdobeStock_252262042.jpeg',
  'WM00001': './images/AdobeStock_612932760.jpeg',
  'WM00003': './images/AdobeStock_1091012713.jpeg',
};

export default function PotentialeTab() {
  const { modeId, navigateTo } = useMode();
  const { t, tn } = useTranslation();

  const P_KPI_CONFIG = [
    { id: 'consentKunden', label: t('consentKunden'), format: 'num', icon: 'Users' },
    { id: 'potentiale', label: t('potenziale'), format: 'num', icon: 'Zap' },
    { id: 'praemienvolumen', label: t('praemienvolumen'), format: 'eur', icon: 'Briefcase' },
    { id: 'convRate', label: t('convRate'), format: 'pct', icon: 'Target' },
  ];

  const STATUS_TABS = [
    { id: 'alle', label: t('alle') },
    { id: 'identifiziert', label: t('identifiziert') },
    { id: 'angeschrieben', label: t('angeschrieben') },
    { id: 'termin', label: t('terminLabel') },
    { id: 'abgeschlossen', label: t('abgeschlossen') },
  ];
  const [statusFilter, setStatusFilter] = useState('alle');
  const allPotentiale = getAllPotentiale(modeId);
  const kunden = KUNDEN_BY_MODE[modeId] || [];

  const { statusCounts, totalVolumen } = useMemo(() => {
    const counts = { identifiziert: 0, angeschrieben: 0, termin: 0, abgeschlossen: 0 };
    let vol = 0;
    for (const p of allPotentiale) {
      if (counts[p.status] !== undefined) counts[p.status]++;
      if (p.volumenTyp === 'jaehrlich') vol += p.volumen;
    }
    return { statusCounts: counts, totalVolumen: vol };
  }, [allPotentiale]);

  const kpiValues = useMemo(() => ({
    consentKunden: { wert: kunden.length, trend: 5.0 },
    potentiale: { wert: allPotentiale.length, trend: 8.2 },
    praemienvolumen: { wert: totalVolumen, trend: 12.5 },
    convRate: { wert: 13.6, trend: 2.1 },
  }), [kunden.length, allPotentiale.length, totalVolumen]);

  const pipelineSegments = useMemo(() => [
    { label: t('identifiziert'), count: statusCounts.identifiziert, color: '#3b82f6' },
    { label: t('angeschrieben'), count: statusCounts.angeschrieben, color: '#f59e0b' },
    { label: t('terminLabel'), count: statusCounts.termin, color: '#10b981' },
    { label: t('abgeschl'), count: statusCounts.abgeschlossen, color: 'var(--mode-primary)' },
  ], [statusCounts, t]);

  // Filtered + grouped (memoized)
  const grouped = useMemo(() => {
    const filtered = statusFilter === 'alle'
      ? allPotentiale
      : allPotentiale.filter(p => p.status === statusFilter);
    const map = new Map();
    for (const p of filtered) {
      if (!map.has(p.kundeId)) map.set(p.kundeId, []);
      map.get(p.kundeId).push(p);
    }
    return map;
  }, [allPotentiale, statusFilter]);

  return (
    <div className="space-y-6">
      <KPIGrid kpiConfig={P_KPI_CONFIG} kpiValues={kpiValues} />

      {/* Pipeline */}
      <Card>
        <h3 className="font-semibold text-slate-800 mb-4">{t('pipeline')}</h3>
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
                className="flex items-center justify-between px-4 py-3 bg-slate-50 cursor-pointer row-hover"
                onClick={() => navigateTo('detail', { kundeId, tab: 'impulse' })}
              >
                <div className="flex items-center gap-3">
                  {KUNDEN_FOTOS[kundeId] ? (
                    <img
                      src={KUNDEN_FOTOS[kundeId]}
                      alt={kunde?.name || kundeId}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                      {kunde?.name?.split(' ').map(n => n[0]).join('') || '?'}
                    </div>
                  )}
                  <span className="font-semibold text-sm text-slate-800">{tn(kunde?.name) || kundeId}</span>
                  <span className="text-xs text-slate-400">{kundeId} &middot; {potentiale.length} Potentiale</span>
                </div>
                <span className="font-mono text-sm font-medium text-slate-700">{t('gesamt')} {formatEur(gesamt)}</span>
              </div>

              {/* Potentiale-Zeilen */}
              {potentiale.map((p, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 pl-12 border-t border-slate-100 row-hover cursor-pointer">
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
