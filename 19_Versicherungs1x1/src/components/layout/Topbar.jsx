// Topbar — 56 px, weiß, Linie unten: Menü (< 1024), Marke, Breadcrumb
// (≥ 1024), rechts Suche in Eingabefeld-Optik mit Kürzel, Glossar,
// Wissenscheck, Fortschrittsring mit Prozent, Link zur Plattform.
import { Menu, Search, BookOpen, ListChecks, House } from 'lucide-react';
import { useWissen } from '../../store/Wissen.jsx';
import { Tasten } from '../ui/Kbd.jsx';
import Knopf from '../ui/Knopf.jsx';
import Tooltip from '../ui/Tooltip.jsx';
import Fortschrittsring from '../ui/Fortschrittsring.jsx';
import Breadcrumb from './Breadcrumb.jsx';
import { anteil, mehrzahl } from '../../lib/format.js';

export function Marke() {
  return (
    <a href="#/" className="marke" aria-label="Versicherungs-1×1 – zur Startseite">
      <span className="marke-monogramm" aria-hidden="true">1×1</span>
      <span className="marke-wort">Versicherungs-1×1</span>
    </a>
  );
}

export default function Topbar() {
  const { route, oeffneSuche, fortschrittGesamt, setzeDrawer, drawerOffen, routeZuHash } = useWissen();
  const { gelesen, gesamt, anteil: a } = fortschrittGesamt;
  const fortschrittText = `${gelesen} von ${mehrzahl(gesamt, 'Lerneinheit', 'Lerneinheiten')} gelesen`;

  return (
    <header className="topbar">
      <div className="topbar-links">
        <button
          type="button"
          className="knopf knopf-still knopf-symbol topbar-menue lg:hidden"
          aria-label="Navigation öffnen"
          aria-expanded={drawerOffen}
          onClick={() => setzeDrawer(true)}
        >
          <Menu size={20} aria-hidden="true" />
        </button>
        <Marke />
        <Breadcrumb />
      </div>
      <div className="topbar-rechts">
        <button type="button" className="topbar-suche" onClick={() => oeffneSuche()} aria-label="Suchen (Kürzel ⌘ K oder Strg K)" aria-keyshortcuts="Meta+K Control+K">
          <Search size={16} aria-hidden="true" />
          <span>Suchen …</span>
          <Tasten tasten={['mod', 'K']} />
        </button>
        <Knopf variante="still" symbol={BookOpen} href={routeZuHash({ name: 'glossar' })} className="topbar-knopf topbar-nur-breit" aria-current={route.name === 'glossar' ? 'page' : undefined}>
          Glossar
        </Knopf>
        <Knopf variante="still" symbol={ListChecks} href={routeZuHash({ name: 'wissenscheck' })} className="topbar-knopf topbar-nur-breit" aria-current={route.name === 'wissenscheck' ? 'page' : undefined}>
          Wissenscheck
        </Knopf>
        <Tooltip text={fortschrittText}>
          <a href="#/" className="topbar-fortschritt topbar-nur-mittel" aria-label={`Dein Stand: ${fortschrittText}`}>
            <Fortschrittsring anteil={a} groesse={24} label={fortschrittText} />
            <span className="fortschrittsring-zahl">{anteil(a)}</span>
          </a>
        </Tooltip>
        <span className="topbar-trenner topbar-nur-mittel" aria-hidden="true" />
        <Knopf variante="still" symbol={House} href="/" className="topbar-plattform" aria-label="Zur Plattform-Startseite">
          <span className="topbar-nur-breit">Plattform</span>
        </Knopf>
      </div>
    </header>
  );
}
