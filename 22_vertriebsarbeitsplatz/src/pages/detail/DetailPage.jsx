import { Suspense } from 'react';
import { useMode } from '../../hooks/useMode';
import useTranslation from '../../i18n/useTranslation';
import { KUNDEN_BY_MODE, getKundeById } from '../../data';
import GlobalHeader from '../../components/layout/GlobalHeader';
import StammdatenDetailTab from './tabs/StammdatenDetailTab';
import lazyRetry from '../../utils/lazyRetry';

const VertraegeTab = lazyRetry(() => import('./tabs/VertraegeTab'));
const OpenFinanceTab = lazyRetry(() => import('./tabs/OpenFinanceTab'));
const ImpulseTab = lazyRetry(() => import('./tabs/ImpulseTab'));
const FinanzprofilTab = lazyRetry(() => import('./tabs/FinanzprofilTab'));
const KommunikationTab = lazyRetry(() => import('./tabs/KommunikationTab'));
const PerformanceTab = lazyRetry(() => import('./tabs/PerformanceTab'));
const WpHGComplianceTab = lazyRetry(() => import('./tabs/WpHGComplianceTab'));
const FamilieNetzwerkTab = lazyRetry(() => import('./tabs/FamilieNetzwerkTab'));
const EngagementTab = lazyRetry(() => import('./tabs/EngagementTab'));
const LeadsTab = lazyRetry(() => import('./tabs/LeadsTab'));
const ProduktabschlussTab = lazyRetry(() => import('./tabs/ProduktabschlussTab'));
const ServiceTab = lazyRetry(() => import('./tabs/ServiceTab'));

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
  service: ServiceTab,
  portfolio: VertraegeTab,
  vermoegensbilanz: FinanzprofilTab,
  compliance: OpenFinanceTab,
};

const TabFallback = (
  <div className="flex items-center justify-center py-20">
    <div className="w-8 h-8 border-2 border-(--border-medium) border-t-(--mode-primary) rounded-full animate-spin" />
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
    <div className="min-h-screen bg-(--bg-primary)">
      <GlobalHeader kundeInfo={{ name: tn(kunde.name), id: kunde.id, beruf: kunde.beruf }} tabBadges={{ produktabschluss: (kunde.produktabschluss || []).filter(a => a.status === 'abgebrochen').length || undefined }} />
      <div className="px-6 py-6 animate-fade-in">
        <Suspense fallback={TabFallback}>
          <TabComponent kunde={kunde} />
        </Suspense>
      </div>
    </div>
  );
}
