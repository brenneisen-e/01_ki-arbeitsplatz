// AppShell — Raster aus Brief §3: Topbar (sticky), links Sidebar (≥ 1024 px,
// sonst Schublade), rechts <main id="inhalt"> über die volle Restbreite.
// Die rechte Leiste der Kapitelseite (≥ 1440 px) baut die Kapitelseite
// selbst innerhalb von main. Hier hängen außerdem die globalen Kürzel,
// die Tastaturhilfe und die Lesefortschrittslinie.
import { useWissen } from '../../store/Wissen.jsx';
import { useTastenkuerzel } from '../../store/tastenkuerzel.js';
import UeberspringLink from '../ui/UeberspringLink.jsx';
import Schublade from '../ui/Schublade.jsx';
import Tastaturhilfe from '../ui/Tastaturhilfe.jsx';
import Topbar from './Topbar.jsx';
import Sidebar from './Sidebar.jsx';
import Lesefortschritt from './Lesefortschritt.jsx';

export default function AppShell({ children }) {
  const { route, drawerOffen, setzeDrawer, hilfeOffen, schliesseHilfe } = useWissen();
  useTastenkuerzel();
  return (
    <div className="app">
      <UeberspringLink />
      <Topbar />
      {route.name === 'kapitel' && <Lesefortschritt />}
      <div className="app-koerper">
        <aside className="sidebar-spalte" aria-label="Seitenleiste">
          <Sidebar />
        </aside>
        <main id="inhalt" className="app-inhalt" tabIndex={-1}>
          {children}
        </main>
      </div>
      <Schublade offen={drawerOffen} onSchliessen={() => setzeDrawer(false)} titel="Versicherungs-1×1">
        <Sidebar inSchublade />
      </Schublade>
      <Tastaturhilfe offen={hilfeOffen} onSchliessen={schliesseHilfe} />
    </div>
  );
}
