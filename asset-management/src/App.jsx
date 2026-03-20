import { useState, useCallback } from 'react';
import WelcomeScreen from './pages/WelcomeScreen';
import Dashboard from './pages/Dashboard';
import LoadingScreen from './pages/LoadingScreen';
import { INITIAL_WORKFLOWS } from './data';

export default function App() {
  const [view, setView] = useState('welcome'); // welcome | loading | dashboard
  const [workflows, setWorkflows] = useState(() => INITIAL_WORKFLOWS.map(w => ({ ...w })));

  const enterDashboard = useCallback(() => {
    setView('loading');
    // Loading animation triggers transition to dashboard
  }, []);

  const onLoadingComplete = useCallback(() => {
    setView('dashboard');
  }, []);

  const backToWelcome = useCallback(() => {
    setView('welcome');
    setWorkflows(INITIAL_WORKFLOWS.map(w => ({ ...w })));
  }, []);

  if (view === 'welcome') {
    return <WelcomeScreen onEnter={enterDashboard} />;
  }

  if (view === 'loading') {
    return <LoadingScreen onComplete={onLoadingComplete} />;
  }

  return (
    <Dashboard
      workflows={workflows}
      setWorkflows={setWorkflows}
      onBack={backToWelcome}
    />
  );
}
