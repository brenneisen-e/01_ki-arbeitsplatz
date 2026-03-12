import { ModeProvider, useMode } from './hooks/useMode';
import LandingPage from './pages/landing/LandingPage';
import OverviewPage from './pages/overview/OverviewPage';
import DetailPage from './pages/detail/DetailPage';
import VertriebsAssistent from './components/layout/VertriebsAssistent';

function AppRouter() {
  const { currentView } = useMode();

  switch (currentView) {
    case 'landing':
      return <LandingPage />;
    case 'overview':
      return <OverviewPage />;
    case 'detail':
      return <DetailPage />;
    default:
      return <LandingPage />;
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
