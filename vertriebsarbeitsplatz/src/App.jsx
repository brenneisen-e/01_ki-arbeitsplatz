import { ModeProvider, useMode } from './hooks/useMode';
import OverviewPage from './pages/overview/OverviewPage';
import DetailPage from './pages/detail/DetailPage';
import VertriebsAssistent from './components/layout/VertriebsAssistent';

function AppRouter() {
  const { currentView } = useMode();

  switch (currentView) {
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
