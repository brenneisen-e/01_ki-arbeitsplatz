import { useState, useMemo, useEffect } from 'react';
import KPIGrid from '../../../components/ui/KPIGrid';
import { useMode } from '../../../hooks/useMode';
import useTranslation from '../../../i18n/useTranslation';
import { KUNDEN_BY_MODE, getAllPotentiale } from '../../../data';
import GamificationDashboard from '../../../components/ui/GamificationDashboard';
import KanbanBoard from '../../../components/ui/KanbanBoard';

export default function PotentialeTab() {
  const { modeId } = useMode();
  const { t } = useTranslation();

  const P_KPI_CONFIG = [
    { id: 'consentKunden', label: t('consentKunden'), format: 'num', icon: 'Users' },
    { id: 'potentiale', label: t('potenziale'), format: 'num', icon: 'Zap' },
    { id: 'praemienvolumen', label: t('praemienvolumen'), format: 'eur', icon: 'Briefcase' },
    { id: 'convRate', label: t('convRate'), format: 'pct', icon: 'Target' },
  ];

  const allPotentiale = getAllPotentiale(modeId);
  const kunden = KUNDEN_BY_MODE[modeId] || [];

  // Local state for kanban moves so user moves persist within the session
  // without mutating the underlying generated data.
  const STORAGE_KEY = `kanban_state_${modeId}`;
  const [kanbanState, setKanbanState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(kanbanState));
    } catch {}
  }, [kanbanState, STORAGE_KEY]);

  // Stable id per potential — composed of kundeId + index because the source
  // data has no explicit id field. We compute it once per allPotentiale array.
  const potentialeWithIds = useMemo(() => {
    const counts = {};
    return allPotentiale.map(p => {
      const i = counts[p.kundeId] || 0;
      counts[p.kundeId] = i + 1;
      return { ...p, _id: `${p.kundeId}_${i}` };
    });
  }, [allPotentiale]);

  // Apply local kanban overrides on top of the source statuses
  const enrichedPotentiale = useMemo(() => {
    return potentialeWithIds.map(p => {
      const override = kanbanState[p._id];
      if (override) {
        return { ...p, status: override.status, _override: override };
      }
      return p;
    });
  }, [potentialeWithIds, kanbanState]);

  const totalVolumen = useMemo(() => {
    return allPotentiale.reduce((s, p) => s + (p.volumenTyp === 'jaehrlich' ? (p.volumen || 0) : 0), 0);
  }, [allPotentiale]);

  const kpiValues = useMemo(() => ({
    consentKunden: { wert: kunden.length, trend: 5.0 },
    potentiale: { wert: allPotentiale.length, trend: 8.2 },
    praemienvolumen: { wert: totalVolumen, trend: 12.5 },
    convRate: { wert: 80.6, trend: 2.1 },
  }), [kunden.length, allPotentiale.length, totalVolumen]);

  const handleMoveCard = (potentialId, newStatus, extras = {}) => {
    setKanbanState(prev => ({
      ...prev,
      [potentialId]: {
        status: newStatus,
        ...extras,
        movedAt: new Date().toISOString(),
      },
    }));
  };

  const handleReactivate = (potentialId) => {
    setKanbanState(prev => {
      const next = { ...prev };
      delete next[potentialId];
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <KPIGrid kpiConfig={P_KPI_CONFIG} kpiValues={kpiValues} />

      <GamificationDashboard
        potentiale={enrichedPotentiale}
        kanbanState={kanbanState}
      />

      <KanbanBoard
        potentiale={enrichedPotentiale}
        kunden={kunden}
        onMoveCard={handleMoveCard}
        onReactivate={handleReactivate}
      />
    </div>
  );
}
