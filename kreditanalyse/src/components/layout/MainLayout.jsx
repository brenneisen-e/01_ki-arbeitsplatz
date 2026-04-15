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
      {/* min-w-0 verhindert, dass der flex-1-Inhalt über die verfügbare
          Breite hinauswächst und so unter die (fixed positionierte)
          Navigation rutscht. overflow-x-hidden kappt lange Kanban-Boards. */}
      <div className={`flex flex-col flex-1 min-w-0 overflow-x-hidden transition-all duration-200 ${state.sidebarCollapsed ? 'ml-16' : 'ml-60'}`}>
        <Header />
        <ProcessBar />
        <div className="flex flex-1 overflow-hidden min-w-0">
          <main className="flex-1 min-w-0 overflow-y-auto p-6 scrollbar-thin">
            <div className="w-full min-w-0">
              <ViewComponent />
            </div>
          </main>
          <AIChatPanel />
        </div>
      </div>
    </div>
  );
}
