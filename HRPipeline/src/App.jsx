import { useState, Suspense, lazy } from 'react';
import { ToastProvider } from './hooks/useToast';
import { InstitutProvider } from './hooks/useInstitut';
import GlobalHeader from './components/layout/GlobalHeader';
import DockedAIAssistant from './components/chat/DockedAIAssistant';

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
  const [newApplicantProfileId, setNewApplicantProfileId] = useState(null);
  const [chatOpen, setChatOpen] = useState(true);
  const [chatTrigger, setChatTrigger] = useState(null);

  const triggerChat = (prompt) => {
    setChatOpen(true);
    setChatTrigger({ prompt, ts: Date.now() });
  };

  return (
    <ToastProvider>
      <InstitutProvider>
        <div className="hp-scanner-page" style={{ padding: 0, maxWidth: 'none' }}>
          <GlobalHeader currentMode={currentMode} onModeChange={setCurrentMode} />
          <div className="hp-body-flex">
            <div className="hp-main-content">
              <Suspense fallback={<LoadingFallback />}>
                {currentMode === 'bewerber' && (
                  <BewerberMode onProfileSubmitted={setNewApplicantProfileId} onTriggerChat={triggerChat} />
                )}
                {currentMode === 'arbeitgeber' && <ArbeitgeberMode newApplicantProfileId={newApplicantProfileId} />}
                {currentMode === 'cockpit' && <CockpitMode />}
              </Suspense>
            </div>
            <DockedAIAssistant
              mode={currentMode}
              open={chatOpen}
              onOpenChange={setChatOpen}
              triggerAction={chatTrigger}
            />
          </div>
        </div>
      </InstitutProvider>
    </ToastProvider>
  );
}
