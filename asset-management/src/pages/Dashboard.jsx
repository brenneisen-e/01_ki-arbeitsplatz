import { useState, useCallback } from 'react';
import Header from '../components/Header';
import Chatbot from '../components/Chatbot';
import WorkflowModal from '../components/WorkflowModal';
import EventMonitorTab from './tabs/EventMonitorTab';
import CashflowsTab from './tabs/CashflowsTab';
import SodTab from './tabs/SodTab';
import PortfoliosTab from './tabs/PortfoliosTab';
import { WORKFLOW_STEPS, getStepType } from '../data';

export default function Dashboard({ workflows, setWorkflows, onBack }) {
  const [activeTab, setActiveTab] = useState('eventMonitor');
  const [modalWfId, setModalWfId] = useState(null);
  const [flashWfId, setFlashWfId] = useState(null);

  const modalWorkflow = modalWfId ? workflows.find(w => w.id === modalWfId) : null;

  const openModal = useCallback((wfId) => {
    setModalWfId(wfId);
  }, []);

  const closeModal = useCallback(() => {
    setModalWfId(null);
    // Flash the row if it was advanced
    if (flashWfId) {
      setTimeout(() => setFlashWfId(null), 4500);
    }
  }, [flashWfId]);

  const advanceWorkflow = useCallback((wfId) => {
    setWorkflows(prev => prev.map(wf => {
      if (wf.id !== wfId) return wf;
      const updated = { ...wf };
      const isFourEye = updated.fourEye;
      updated.step = Math.min(updated.step + 1, updated.totalSteps);
      if (updated.step >= updated.totalSteps || isFourEye) {
        updated.status = 'completed';
        updated.action = 'Trading';
        updated.step = updated.totalSteps;
      } else {
        const stepType = getStepType(updated);
        const steps = WORKFLOW_STEPS[stepType];
        if (steps[updated.step]) {
          updated.action = steps[updated.step].label;
        }
      }
      return updated;
    }));
    setFlashWfId(wfId);
  }, [setWorkflows]);

  const handleContextAction = useCallback((action, wfId) => {
    if (action === 'advance') {
      openModal(wfId);
    } else if (action === 'view') {
      setActiveTab('portfolios');
    } else if (action === 'pause') {
      setWorkflows(prev => prev.map(wf => wf.id === wfId ? { ...wf, status: 'paused', action: 'Paused' } : wf));
    } else if (action === 'reset') {
      setWorkflows(prev => prev.map(wf => {
        if (wf.id !== wfId) return wf;
        const stepType = getStepType(wf);
        const steps = WORKFLOW_STEPS[stepType];
        return { ...wf, step: 0, status: 'attention', action: steps[0]?.label || 'Draft' };
      }));
    }
  }, [openModal, setWorkflows]);

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col relative">
      <Header activeTab={activeTab} onTabChange={setActiveTab} onBack={onBack} />

      <div className="px-6 py-5 flex-1 overflow-y-auto">
        {activeTab === 'eventMonitor' && (
          <EventMonitorTab
            workflows={workflows}
            flashWfId={flashWfId}
            onOpenModal={openModal}
            onContextAction={handleContextAction}
            onSwitchTab={setActiveTab}
          />
        )}
        {activeTab === 'cashflows' && (
          <CashflowsTab
            workflows={workflows}
            flashWfId={flashWfId}
            onOpenModal={openModal}
          />
        )}
        {activeTab === 'sod' && <SodTab />}
        {activeTab === 'portfolios' && <PortfoliosTab />}
      </div>

      {modalWorkflow && (
        <WorkflowModal
          workflow={modalWorkflow}
          onClose={closeModal}
          onAdvance={advanceWorkflow}
        />
      )}

      <Chatbot onOpenWorkflow={openModal} />
    </div>
  );
}
