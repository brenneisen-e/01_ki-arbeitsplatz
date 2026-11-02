import { useState } from 'react';
import { InstitutProvider } from './hooks/useInstitut';
import { ControlHubProvider } from './hooks/useControlHub';
import { BiksProvider } from './hooks/useBiks';
import { OptimierungProvider } from './hooks/useOptimierung';
import { GapAnalyseProvider } from './hooks/useGapAnalyse';
import GlobalHeader from './components/layout/GlobalHeader';
import NavigatorView from './components/biks/BiksAgentView';
import AnalyzerView from './components/analyzer/AnalyzerView';
import OptimizerView from './components/optimizer/OptimizerView';
import GapAnalyseView from './components/gapanalyse/GapAnalyseView';
import MethodikView from './components/shared/MethodikView';
import FehlerGrenze from './components/shared/FehlerGrenze';
import AIChatPanel from './components/chat/AIChatPanel';

function AppShell() {
  const [activeView, setActiveView] = useState('navigator');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <GlobalHeader activeView={activeView} onViewChange={setActiveView} />
      <div className="flex flex-1 min-h-0">
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="px-6 py-6 max-w-[1400px] mx-auto w-full">
            {activeView === 'navigator' && <NavigatorView />}
            {activeView === 'analyzer' && <AnalyzerView onViewChange={setActiveView} />}
            {activeView === 'optimizer' && <OptimizerView onViewChange={setActiveView} />}
            {activeView === 'gapanalyse' && <GapAnalyseView />}
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
    <FehlerGrenze>
    <InstitutProvider>
      <BiksProvider>
        <OptimierungProvider>
          <GapAnalyseProvider>
            <ControlHubProvider>
              <AppShell />
            </ControlHubProvider>
          </GapAnalyseProvider>
        </OptimierungProvider>
      </BiksProvider>
    </InstitutProvider>
    </FehlerGrenze>
  );
}
