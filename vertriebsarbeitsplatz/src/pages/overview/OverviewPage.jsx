import { useMode } from '../../hooks/useMode';
import GlobalHeader from '../../components/layout/GlobalHeader';
import KPIGrid from '../../components/ui/KPIGrid';
import UebersichtTab from './tabs/UebersichtTab';
import NeugeschaeftTab from './tabs/NeugeschaeftTab';
import BestandTab from './tabs/BestandTab';
import StornoTab from './tabs/StornoTab';
import VerguetungTab from './tabs/VerguetungTab';
import QualitaetTab from './tabs/QualitaetTab';
import KundenTab from './tabs/KundenTab';
import PotentialeTab from './tabs/PotentialeTab';
import StammdatenOverviewTab from './tabs/StammdatenOverviewTab';

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
  pipeline: PotentialeTab,
  portfolio: BestandTab,
  compliance: QualitaetTab,
  reporting: VerguetungTab,
};

export default function OverviewPage() {
  const { config, activeTab } = useMode();
  const TabComponent = TAB_COMPONENTS[activeTab] || UebersichtTab;

  return (
    <div className="min-h-screen bg-slate-50">
      <GlobalHeader />
      <div className="px-10 py-6 animate-fade-in-up">
        <KPIGrid kpiConfig={config.kpiConfig} kpiValues={config.kpiValues} />
        <TabComponent />
      </div>
    </div>
  );
}
