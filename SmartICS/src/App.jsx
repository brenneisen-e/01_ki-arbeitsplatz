import { useState } from 'react';
import { InstitutProvider } from './hooks/useInstitut';
import { SmartIcsProvider } from './hooks/useSmartIcs';
import { BiksProvider } from './hooks/useBiks';
import GlobalHeader from './components/layout/GlobalHeader';
import BiksAgentView from './components/biks/BiksAgentView';
import RkmView from './components/export/RkmView';
import MethodikView from './components/shared/MethodikView';
import AIChatPanel from './components/chat/AIChatPanel';

function AppShell() {
  const [activeView, setActiveView] = useState('workflow');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <GlobalHeader activeView={activeView} onViewChange={setActiveView} />
      <div className="flex flex-1 min-h-0">
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="px-6 py-6 max-w-[1400px] mx-auto w-full">
            {activeView === 'workflow' && <BiksAgentView />}
            {activeView === 'rkm' && (
              <RkmView onStartWorkflow={() => setActiveView('workflow')} />
            )}
            {activeView === 'methodik' && <MethodikView />}
          </div>
        </main>
        <AIChatPanel activeView={activeView} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <InstitutProvider>
      <BiksProvider>
        <SmartIcsProvider>
          <AppShell />
        </SmartIcsProvider>
      </BiksProvider>
    </InstitutProvider>
  );
}
