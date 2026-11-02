// App — Provider, App-Shell und Routen-Switch. Die Seiten sind Default-
// Exporte ohne Props (alles aus useWissen()), damit die Phase-3-Agenten sie
// 1:1 ersetzen. Die Suchpalette wird genau hier gemountet, wenn sucheOffen.
import { WissenProvider, useWissen } from './store/Wissen.jsx';
import AppShell from './components/layout/AppShell.jsx';
import SuchePalette from './components/suche/SuchePalette.jsx';
import UmfangPanel from './components/umfang/UmfangPanel.jsx';
import Start from './pages/Start.jsx';
import Kapitel from './pages/Kapitel.jsx';
import Glossar from './pages/Glossar.jsx';
import Wissenscheck from './pages/Wissenscheck.jsx';
import Knopf from './components/ui/Knopf.jsx';
import Leerzustand from './components/ui/Leerzustand.jsx';
import { CircleAlert, RotateCcw } from 'lucide-react';

function LadeSkelett() {
  return (
    <div className="lade-skelett" aria-busy="true" aria-label="Inhalte werden geladen">
      <div className="skelett" style={{ height: 14, width: 120 }} />
      <div className="skelett" style={{ height: 36, width: '60%' }} />
      <div className="skelett" style={{ height: 18, width: '85%' }} />
      <div className="skelett" style={{ height: 18, width: '70%' }} />
      <div className="skelett" style={{ height: 160, width: '100%', marginTop: 12 }} />
    </div>
  );
}

function Seite() {
  const { route, laden, fehler, nochmalLaden, sucheOffen, umfang } = useWissen();
  let inhalt;
  if (fehler) {
    inhalt = (
      <div className="seite">
        <Leerzustand
          symbol={CircleAlert}
          titel="Die Inhalte konnten nicht geladen werden"
          text={`Die Datei data/chapters.json war nicht erreichbar (${fehler}).`}
          aktion={<Knopf variante="primaer" symbol={RotateCcw} onClick={nochmalLaden}>Erneut versuchen</Knopf>}
        />
      </div>
    );
  } else if (laden) {
    inhalt = <LadeSkelett />;
  } else if (route.name === 'kapitel') {
    inhalt = <Kapitel />;
  } else if (route.name === 'glossar') {
    inhalt = <Glossar />;
  } else if (route.name === 'wissenscheck') {
    inhalt = <Wissenscheck />;
  } else {
    inhalt = <Start />;
  }
  const seitenSchluessel = `${route.name}|${route.kapitelId || ''}|${route.einheitId || ''}`;
  return (
    <AppShell>
      <div key={seitenSchluessel} className="seiten-einblendung">{inhalt}</div>
      {sucheOffen && <SuchePalette />}
      {umfang.panelOffen && <UmfangPanel />}
    </AppShell>
  );
}

export default function App() {
  return (
    <WissenProvider>
      <Seite />
    </WissenProvider>
  );
}
