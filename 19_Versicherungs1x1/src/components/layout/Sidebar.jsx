// Sidebar — Filterfeld, Eintrag „Start“, neun Kapitel mit Nummer, Titel und
// Fortschrittsring (Haken bei bestandenem Wissenscheck), aktives Kapitel
// klappt seine Lerneinheiten auf (Punkt = gelesen); unten Wissenscheck und
// Glossar, Fußzeile „Stand: …“ aus daten.lastUpdated. In der Schublade
// (< 1024 px) dieselbe Komponente mit inSchublade.
import { useMemo, useState } from 'react';
import { LayoutGrid, BookOpen, ListChecks, Search } from 'lucide-react';
import { useWissen } from '../../store/Wissen.jsx';
import Eingabe from '../ui/Eingabe.jsx';
import Fortschrittsring from '../ui/Fortschrittsring.jsx';
import { datum, mehrzahl } from '../../lib/format.js';
import { falte, nummer } from '../../lib/text.js';

/** Hebt den Suchtreffer im Text hervor (Groß-/Kleinschreibung egal). */
export function Hervorgehoben({ text, suche }) {
  if (!suche) return text;
  const t = String(text);
  const i = t.toLowerCase().indexOf(suche.toLowerCase());
  if (i < 0) return t;
  return (
    <>
      {t.slice(0, i)}
      <mark>{t.slice(i, i + suche.length)}</mark>
      {t.slice(i + suche.length)}
    </>
  );
}

export default function Sidebar({ inSchublade = false }) {
  const { daten, kapitelListe, route, kapitel, istGelesen, fortschrittKapitel, routeZuHash, laden } = useWissen();
  const [filter, setFilter] = useState('');
  const suche = filter.trim();
  const sucheGefaltet = falte(suche);

  const eintraege = useMemo(() => kapitelListe.map((k, i) => {
    const einheiten = k.subChapters || [];
    if (!sucheGefaltet) {
      return { kapitel: k, index: i, trifft: true, einheiten, offen: route.name === 'kapitel' && kapitel?.id === k.id };
    }
    const kapitelTrifft = falte(k.title).includes(sucheGefaltet) || nummer(i).includes(sucheGefaltet);
    const passende = einheiten.filter((e) => falte(e.title).includes(sucheGefaltet));
    if (!kapitelTrifft && passende.length === 0) return null;
    return { kapitel: k, index: i, trifft: kapitelTrifft, einheiten: kapitelTrifft ? einheiten : passende, offen: true };
  }).filter(Boolean), [kapitelListe, sucheGefaltet, route.name, kapitel]);

  const istStart = route.name === 'start';

  return (
    <div className="sidebar">
      <div className="sidebar-filter">
        <Eingabe
          wert={filter}
          onAendern={setFilter}
          placeholder="Kapitel filtern …"
          symbol={Search}
          loeschbar
          aria-label="Kapitel und Lerneinheiten filtern"
        />
      </div>
      <nav className="sidebar-nav" aria-label="Kapitel">
        <ul>
          {!suche && (
            <li>
              <a href="#/" className="nav-eintrag" aria-current={istStart ? 'page' : undefined}>
                <LayoutGrid size={16} aria-hidden="true" />
                <span className="nav-titel">Start</span>
              </a>
            </li>
          )}
          {laden && kapitelListe.length === 0 && (
            <li aria-hidden="true">
              {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="skelett" style={{ height: 30, margin: '6px 0' }} />)}
            </li>
          )}
          {!laden && eintraege.length === 0 && (
            <li className="nav-leer">Kein Kapitel und keine Lerneinheit passt zu „{suche}“.</li>
          )}
          {eintraege.map(({ kapitel: k, index, einheiten, offen }) => {
            const erste = (k.subChapters || [])[0];
            const href = erste ? routeZuHash({ name: 'kapitel', kapitelId: k.id, einheitId: erste.id }) : '#/';
            const f = fortschrittKapitel(k.id);
            const aktiv = route.name === 'kapitel' && kapitel?.id === k.id;
            return (
              <li key={k.id}>
                <a
                  href={href}
                  className="nav-eintrag"
                  aria-current={aktiv && !route.einheitId ? 'page' : undefined}
                  data-aktiv={aktiv ? 'true' : undefined}
                  aria-label={`Kapitel ${nummer(index)} ${k.title}, ${f.gelesen} von ${mehrzahl(f.gesamt, 'Lerneinheit', 'Lerneinheiten')} gelesen${f.bestanden ? ', Wissenscheck bestanden' : ''}`}
                >
                  <span className="nav-nummer" aria-hidden="true">{nummer(index)}</span>
                  <span className="nav-titel" title={k.title}><Hervorgehoben text={k.title} suche={suche} /></span>
                  <span className="nav-ende">
                    <Fortschrittsring anteil={f.anteil} groesse={16} fertig={f.bestanden} label={f.bestanden ? 'Wissenscheck bestanden' : `${f.gelesen} von ${f.gesamt} gelesen`} />
                  </span>
                </a>
                {offen && einheiten.length > 0 && (
                  <ul className="nav-einheiten" aria-label={`Lerneinheiten in ${k.title}`}>
                    {einheiten.map((e) => {
                      const gelesen = istGelesen(k.id, e.id);
                      const aktuell = aktiv && route.einheitId === e.id;
                      return (
                        <li key={e.id}>
                          <a
                            href={routeZuHash({ name: 'kapitel', kapitelId: k.id, einheitId: e.id })}
                            className="nav-eintrag nav-einheit"
                            aria-current={aktuell ? 'page' : undefined}
                          >
                            <span className="nav-punkt" data-gelesen={gelesen ? 'true' : 'false'} aria-hidden="true" />
                            <span className="nav-titel" title={e.title}><Hervorgehoben text={e.title} suche={suche} /></span>
                            {gelesen && <span className="sr-only">(gelesen)</span>}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="sidebar-fuss">
        <a href="#/wissenscheck" className="nav-eintrag" aria-current={route.name === 'wissenscheck' ? 'page' : undefined}>
          <ListChecks size={16} aria-hidden="true" />
          <span className="nav-titel">Wissenscheck</span>
        </a>
        <a href="#/glossar" className="nav-eintrag" aria-current={route.name === 'glossar' ? 'page' : undefined}>
          <BookOpen size={16} aria-hidden="true" />
          <span className="nav-titel">Glossar</span>
        </a>
        <div className="sidebar-stand">
          {daten?.lastUpdated ? `Stand: ${datum(daten.lastUpdated)}` : ' '}
          {inSchublade ? '' : ''}
        </div>
      </div>
    </div>
  );
}
