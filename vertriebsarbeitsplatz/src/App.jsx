import { ModeProvider, useMode } from './hooks/useMode';
import OverviewPage from './pages/overview/OverviewPage';
import DetailPage from './pages/detail/DetailPage';
import CockpitPage from './pages/cockpit/CockpitPage';
import LandingPage from './pages/landing/LandingPage';
import VertriebsAssistent from './components/layout/VertriebsAssistent';

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
      <AppRouter />
      <VertriebsAssistent />
    </ModeProvider>
  );
}
