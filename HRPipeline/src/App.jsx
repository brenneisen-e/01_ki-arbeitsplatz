import { useState, Suspense, lazy } from 'react';
import { ToastProvider } from './hooks/useToast';
import GlobalHeader from './components/layout/GlobalHeader';
import ChatBot from './components/chat/ChatBot';

const BewerberMode = lazy(() => import('./components/bewerber/BewerberMode'));
const ArbeitgeberMode = lazy(() => import('./components/arbeitgeber/ArbeitgeberMode'));
const CockpitMode = lazy(() => import('./components/cockpit/CockpitMode'));

function LoadingFallback() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
      <div className="hp-loading-spinner" />
    </div>
  );
}

export default function App() {
  const [currentMode, setCurrentMode] = useState('bewerber');

  return (
    <ToastProvider>
      <div className="hp-scanner-page" style={{ padding: 0, maxWidth: 'none' }}>
        <GlobalHeader currentMode={currentMode} onModeChange={setCurrentMode} />
        <div style={{ padding: 'var(--space-6)', maxWidth: 1400, margin: '0 auto' }}>
          <Suspense fallback={<LoadingFallback />}>
            {currentMode === 'bewerber' && <BewerberMode />}
            {currentMode === 'arbeitgeber' && <ArbeitgeberMode />}
            {currentMode === 'cockpit' && <CockpitMode />}
          </Suspense>
        </div>
        <ChatBot mode={currentMode} />
      </div>
    </ToastProvider>
  );
}
