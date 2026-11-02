import { CollectionsProvider, useCollections } from './hooks/useCollections';
import GlobalHeader from './components/layout/GlobalHeader';
import CockpitView from './views/CockpitView';
import PortfolioView from './views/PortfolioView';
import RisikoView from './views/RisikoView';
import CustomerPeek from './features/customer/CustomerPeek';
import CrmProfileView from './features/customer/CrmProfileView';
import DocumentScannerModal from './features/scanner/DocumentScannerModal';
import CollectionsAssistant from './features/chat/CollectionsAssistant';
import FeedbackPanel from './features/feedback/FeedbackPanel';
import Toasts from './components/ui/Toasts';

const VIEWS = {
  cockpit: CockpitView,
  portfolio: PortfolioView,
  risiko: RisikoView,
};

function Inhalt() {
  const { section, crmKunde } = useCollections();
  const View = VIEWS[section] || CockpitView;

  return (
    <>
      <GlobalHeader />
      {/* Die Akte ersetzt den Arbeitsbereich, statt ihn zu ueberlagern. */}
      {crmKunde ? <CrmProfileView /> : <main className="flex-1"><View /></main>}

      <CustomerPeek />
      <DocumentScannerModal />
      <CollectionsAssistant />
      <FeedbackPanel />
      <Toasts />
    </>
  );
}

export default function App() {
  return (
    <CollectionsProvider>
      <Inhalt />
    </CollectionsProvider>
  );
}
