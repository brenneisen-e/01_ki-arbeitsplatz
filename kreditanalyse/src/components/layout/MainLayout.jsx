import { useApp } from '../../context/AppContext';
import Sidebar from './Sidebar';
import Header from './Header';
import ProcessBar from './ProcessBar';
import AIChatPanel from './AIChatPanel';
import DashboardView from '../dashboard/DashboardView';
import NewApplicationView from '../application/NewApplicationView';
import KYCView from '../kyc/KYCView';
import AnalysisView from '../analysis/AnalysisView';
import RatingView from '../rating/RatingView';
import CollateralView from '../collateral/CollateralView';
import CreditProposalView from '../credit-proposal/CreditProposalView';
import DecisionView from '../decision/DecisionView';
import ContractView from '../contract/ContractView';
import MonitoringView from '../monitoring/MonitoringView';
import CustomerApplicationView from '../customer-application/CustomerApplicationView';
import ComplianceView from '../compliance/ComplianceView';

const views = {
  dashboard: DashboardView,
  application: NewApplicationView,
  kyc: KYCView,
  analysis: AnalysisView,
  rating: RatingView,
  collateral: CollateralView,
  'credit-proposal': CreditProposalView,
  decision: DecisionView,
  contract: ContractView,
  monitoring: MonitoringView,
  'customer-application': CustomerApplicationView,
  compliance: ComplianceView,
};

export default function MainLayout() {
  const { state } = useApp();
  const ViewComponent = views[state.currentView] || DashboardView;

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar />
      <div className={`flex flex-col flex-1 transition-all duration-200 ${state.sidebarCollapsed ? 'ml-16' : 'ml-60'}`}>
        <Header />
        <ProcessBar />
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
            <div className="w-full">
              <ViewComponent />
            </div>
          </main>
          <AIChatPanel />
        </div>
      </div>
    </div>
  );
}
