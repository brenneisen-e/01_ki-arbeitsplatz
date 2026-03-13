import { useMemo } from 'react';
import { useMode } from '../../hooks/useMode';
import GlobalHeader from '../../components/layout/GlobalHeader';
import KPIGrid from '../../components/ui/KPIGrid';
import { KUNDEN_BY_MODE } from '../../data';
import UebersichtTab from './tabs/UebersichtTab';
import NeugeschaeftTab from './tabs/NeugeschaeftTab';
import BestandTab from './tabs/BestandTab';
import StornoTab from './tabs/StornoTab';
import VerguetungTab from './tabs/VerguetungTab';
import QualitaetTab from './tabs/QualitaetTab';
import KundenTab from './tabs/KundenTab';
import PotentialeTab from './tabs/PotentialeTab';
import StammdatenOverviewTab from './tabs/StammdatenOverviewTab';
import PipelineLeadsTab from './tabs/PipelineLeadsTab';
import RevenueTab from './tabs/RevenueTab';

const TAB_COMPONENTS = {
  uebersicht: UebersichtTab,
  stammdaten: StammdatenOverviewTab,
  neugeschaeft: NeugeschaeftTab,
  bestand: BestandTab,
  storno: StornoTab,
  verguetung: VerguetungTab,
  ertraege: VerguetungTab,
  qualitaet: QualitaetTab,
  kunden: KundenTab,
  potentiale: PotentialeTab,
  mandatsliste: KundenTab,
  pipeline: PipelineLeadsTab,
  revenue: RevenueTab,
  portfolio: BestandTab,
  compliance: QualitaetTab,
  reporting: VerguetungTab,
};

export default function OverviewPage() {
  const { config, activeTab, modeId } = useMode();
  const TabComponent = TAB_COMPONENTS[activeTab] || UebersichtTab;

  // Dynamische KPI-Werte: Mandate-Zahl aus echten Kundendaten berechnen
  const kpiValues = useMemo(() => {
    if (modeId !== 'vermoegensverwaltung') return config.kpiValues;
    const kunden = KUNDEN_BY_MODE.vermoegensverwaltung || [];
    const mandateCount = kunden.length;
    const totalAum = kunden.reduce((sum, k) => sum + (k.aum || 0), 0);
    return {
      ...config.kpiValues,
      mandate: { wert: mandateCount, trend: config.kpiValues.mandate?.trend ?? 0 },
      aum: { wert: totalAum, trend: config.kpiValues.aum?.trend ?? 0 },
    };
  }, [modeId, config.kpiValues]);

  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden">
      <GlobalHeader />
      <div className="px-6 py-6 animate-fade-in-up">
        {activeTab === 'uebersicht' && (
          <KPIGrid kpiConfig={config.kpiConfig} kpiValues={kpiValues} />
        )}
        <TabComponent />
      </div>
    </div>
  );
}
