import { lazy, Suspense } from 'react';
import { useMode } from '../../hooks/useMode';
import useTranslation from '../../i18n/useTranslation';
import { KUNDEN_BY_MODE, getKundeById } from '../../data';
import GlobalHeader from '../../components/layout/GlobalHeader';
import StammdatenDetailTab from './tabs/StammdatenDetailTab';

const VertraegeTab = lazy(() => import('./tabs/VertraegeTab'));
const OpenFinanceTab = lazy(() => import('./tabs/OpenFinanceTab'));
const ImpulseTab = lazy(() => import('./tabs/ImpulseTab'));
const FinanzprofilTab = lazy(() => import('./tabs/FinanzprofilTab'));
const KommunikationTab = lazy(() => import('./tabs/KommunikationTab'));
const PerformanceTab = lazy(() => import('./tabs/PerformanceTab'));
const WpHGComplianceTab = lazy(() => import('./tabs/WpHGComplianceTab'));
const FamilieNetzwerkTab = lazy(() => import('./tabs/FamilieNetzwerkTab'));
const EngagementTab = lazy(() => import('./tabs/EngagementTab'));
const LeadsTab = lazy(() => import('./tabs/LeadsTab'));
const ProduktabschlussTab = lazy(() => import('./tabs/ProduktabschlussTab'));

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

const TabFallback = (
  <div className="flex items-center justify-center py-20">
    <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
  </div>
);

export default function DetailPage() {
  const { t, tn } = useTranslation();
  const { modeId, activeTab, selectedKundeId } = useMode();
  const kunden = KUNDEN_BY_MODE[modeId] || [];

  // Wenn kein Kunde gewaehlt, nimm den ersten
  const kunde = getKundeById(modeId, selectedKundeId) || kunden[0];
  if (!kunde) return <div className="p-10">{t('keinKundeGefunden')}</div>;

  const TabComponent = TAB_COMPONENTS[activeTab] || StammdatenDetailTab;

  return (
    <div className="min-h-screen bg-slate-50">
      <GlobalHeader kundeInfo={{ name: tn(kunde.name), id: kunde.id, beruf: kunde.beruf }} />
      <div className="px-6 py-6 animate-fade-in-up">
        <Suspense fallback={TabFallback}>
          <TabComponent kunde={kunde} />
        </Suspense>
      </div>
    </div>
  );
}
