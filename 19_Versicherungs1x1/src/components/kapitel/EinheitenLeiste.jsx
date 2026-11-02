// EinheitenLeiste — die Lerneinheiten eines Kapitels als Tab-Leiste:
// role="tablist" mit Links als Tabs (Unterstrich in Markenfarbe, Punkt bei
// „gelesen“), Pfeiltasten und Home/Ende bewegen den Fokus, Enter folgt dem
// Link (manuelle Aktivierung, weil ein Wechsel eine neue Seite lädt). Bei
// Überlauf scrollt die Leiste waagerecht mit Schattenkanten; der aktive Tab
// wird in Sicht gerollt. Nach einem Wechsel per Tab bleibt der Fokus auf dem
// neuen aktiven Tab.
import { useEffect, useRef, useState } from 'react';
import { useWissen } from '../../store/Wissen.jsx';

let fokusNachWechsel = false;

export default function EinheitenLeiste({ kapitel, einheit }) {
  const { istGelesen, routeZuHash } = useWissen();
  const einheiten = kapitel.subChapters || [];
  const rollenRef = useRef(null);
  const tabs = useRef([]);
  const [kanten, setKanten] = useState({ links: false, rechts: false });
  const aktivIndex = Math.max(0, einheiten.findIndex((e) => e.id === einheit.id));

  // Schattenkanten je nach Scrollposition
  useEffect(() => {
    const el = rollenRef.current;
    if (!el) return undefined;
    const messe = () => {
      const links = el.scrollLeft > 2;
      const rechts = el.scrollWidth - el.clientWidth - el.scrollLeft > 2;
      setKanten((k) => (k.links === links && k.rechts === rechts ? k : { links, rechts }));
    };
    messe();
    el.addEventListener('scroll', messe, { passive: true });
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(messe) : null;
    if (ro) ro.observe(el);
    window.addEventListener('resize', messe);
    return () => { el.removeEventListener('scroll', messe); if (ro) ro.disconnect(); window.removeEventListener('resize', messe); };
  }, [einheiten.length]);

  // Aktiven Tab in Sicht rollen (nur waagerecht, die Seite bleibt, wo sie ist)
  useEffect(() => {
    const el = rollenRef.current;
    const tab = tabs.current[aktivIndex];
    if (!el || !tab) return;
    const rand = 24;
    const links = tab.offsetLeft - rand;
    const rechts = tab.offsetLeft + tab.offsetWidth + rand - el.clientWidth;
    if (el.scrollLeft > links) el.scrollLeft = Math.max(0, links);
    else if (el.scrollLeft < rechts) el.scrollLeft = rechts;
    if (fokusNachWechsel) {
      fokusNachWechsel = false;
      tab.focus({ preventScroll: true });
    }
  }, [aktivIndex, kapitel.id]);

  const aufTaste = (e, i) => {
    const n = einheiten.length;
    let ziel = null;
    if (e.key === 'ArrowRight') ziel = (i + 1) % n;
    else if (e.key === 'ArrowLeft') ziel = (i - 1 + n) % n;
    else if (e.key === 'Home') ziel = 0;
    else if (e.key === 'End') ziel = n - 1;
    else if (e.key === 'Enter' || e.key === ' ') {
      if (i !== aktivIndex) fokusNachWechsel = true;
      if (e.key === ' ') { e.preventDefault(); e.currentTarget.click(); }
      return;
    }
    if (ziel === null) return;
    e.preventDefault();
    const tab = tabs.current[ziel];
    if (tab) tab.focus();
  };

  return (
    <nav className="einheiten-leiste" aria-label="Lerneinheiten dieses Kapitels" data-links={kanten.links ? 'true' : 'false'} data-rechts={kanten.rechts ? 'true' : 'false'}>
      {/* data-rollen="absicht": die Leiste rollt bei vielen Einheiten bewusst
          seitlich (Brief §12, mit Schattenkanten als Hinweis) — der Rauchtest
          wertet erklärte Rollrahmen nicht als Überlauf. */}
      <div className="einheiten-rollen" data-rollen="absicht" ref={rollenRef}>
        <div role="tablist" aria-label="Lerneinheiten" className="einheiten-tabs">
          {einheiten.map((e, i) => {
            const aktiv = e.id === einheit.id;
            const gelesen = istGelesen(kapitel.id, e.id);
            return (
              <a
                key={e.id}
                ref={(el) => { tabs.current[i] = el; }}
                role="tab"
                href={routeZuHash({ name: 'kapitel', kapitelId: kapitel.id, einheitId: e.id })}
                className="einheiten-tab"
                aria-selected={aktiv}
                aria-controls="einheit-inhalt"
                tabIndex={aktiv ? 0 : -1}
                onKeyDown={(ev) => aufTaste(ev, i)}
                onClick={() => { if (!aktiv) fokusNachWechsel = true; }}
              >
                <span className="einheiten-punkt" data-gelesen={gelesen ? 'true' : 'false'} aria-hidden="true" />
                <span className="einheiten-tab-text">{e.title}</span>
                {gelesen && <span className="sr-only">(gelesen)</span>}
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
