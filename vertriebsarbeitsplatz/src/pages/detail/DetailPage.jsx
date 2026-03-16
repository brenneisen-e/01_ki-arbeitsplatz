import { useMode } from '../../hooks/useMode';
import { KUNDEN_BY_MODE, getKundeById } from '../../data';
import GlobalHeader from '../../components/layout/GlobalHeader';
import StammdatenDetailTab from './tabs/StammdatenDetailTab';
import VertraegeTab from './tabs/VertraegeTab';
import OpenFinanceTab from './tabs/OpenFinanceTab';
import ImpulseTab from './tabs/ImpulseTab';
import FinanzprofilTab from './tabs/FinanzprofilTab';
import KommunikationTab from './tabs/KommunikationTab';
import PerformanceTab from './tabs/PerformanceTab';
import WpHGComplianceTab from './tabs/WpHGComplianceTab';
import FamilieNetzwerkTab from './tabs/FamilieNetzwerkTab';
import EngagementTab from './tabs/EngagementTab';
import LeadsTab from './tabs/LeadsTab';
import ProduktabschlussTab from './tabs/ProduktabschlussTab';

const TAB_COMPONENTS = {
  stammdaten: StammdatenDetailTab,
  vertraege: VertraegeTab,
  produkte: VertraegeTab,
  openfinance: OpenFinanceTab,
  impulse: ImpulseTab,
  finanzprofil: FinanzprofilTab,
  kommunikation: KommunikationTab,
  performance: PerformanceTab,
  wphg: WpHGComplianceTab,
  familie: FamilieNetzwerkTab,
  engagement: EngagementTab,
  leads: LeadsTab,
  produktabschluss: ProduktabschlussTab,
  portfolio: VertraegeTab,
  vermoegensbilanz: FinanzprofilTab,
  compliance: OpenFinanceTab,
};

export default function DetailPage() {
  const { modeId, activeTab, selectedKundeId } = useMode();
  const kunden = KUNDEN_BY_MODE[modeId] || [];

  // Wenn kein Kunde gewaehlt, nimm den ersten
  const kunde = getKundeById(modeId, selectedKundeId) || kunden[0];
  if (!kunde) return <div className="p-10">Kein Kunde gefunden.</div>;

  const TabComponent = TAB_COMPONENTS[activeTab] || StammdatenDetailTab;

  return (
    <div className="min-h-screen bg-slate-50">
      <GlobalHeader kundeInfo={{ name: kunde.name, id: kunde.id, beruf: kunde.beruf }} />
      <div className="px-6 py-6 animate-fade-in-up">
        <TabComponent kunde={kunde} />
      </div>
    </div>
  );
}
