import { Suspense } from 'react';
import { ModeProvider, useMode } from './hooks/useMode';
import OverviewPage from './pages/overview/OverviewPage';
import DetailPage from './pages/detail/DetailPage';
import CockpitPage from './pages/cockpit/CockpitPage';
import LandingPage from './pages/landing/LandingPage';
import VertriebsAssistent from './components/layout/VertriebsAssistent';

const AppFallback = (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-10 h-10 border-3 border-slate-300 border-t-slate-600 rounded-full animate-spin mx-auto mb-4" />
      <p className="text-slate-500 text-sm">Daten werden geladen…</p>
    </div>
  </div>
);

function AppRouter() {
  const { currentView } = useMode();

  switch (currentView) {
    case 'landing':
      return <LandingPage />;
    case 'cockpit':
      return <CockpitPage />;
    case 'detail':
      return <DetailPage />;
    case 'overview':
    default:
      return <OverviewPage />;
  }
}

export default function App() {
  return (
    <ModeProvider>
      <Suspense fallback={AppFallback}>
        <AppRouter />
        <VertriebsAssistent />
      </Suspense>
    </ModeProvider>
  );
}
