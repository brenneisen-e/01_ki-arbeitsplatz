// AufDieserSeite — Inhaltsverzeichnis der Lerneinheit, nach Tiefe gruppiert.
// Variante „leiste“ (rechte Leiste ab 1440 px) und „kompakt“ (einklappbarer
// Block über dem Inhalt). Gruppen einer Tiefe, die gerade nicht sichtbar
// ist, zeigen statt ihrer Einträge einen Knopf „einblenden“, der die Tiefe
// im Store hochschaltet. Der aktive Eintrag folgt dem Scrollen
// (useAktiverBlock, IntersectionObserver).
import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { useWissen } from '../../store/Wissen.jsx';
import { TIEFEN, stufeFuerTiefe } from '../../lib/bloecke.js';
import { mehrzahl } from '../../lib/format.js';

/**
 * Welcher Block liegt gerade in der Leselinie? Beobachtet alle
 * `[data-block][id]` im Container mit einem IntersectionObserver, dessen
 * Band von der Topbar bis 45 % der Fensterhöhe reicht; aktiv ist der erste
 * Block im Band. Ganz unten gilt der letzte Block. Neue Blöcke (Tiefe
 * gewechselt, lazy geladen) werden über einen MutationObserver erfasst.
 */
export function useAktiverBlock(containerRef, schluessel) {
  const [aktiv, setAktiv] = useState(null);
  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof IntersectionObserver === 'undefined') return undefined;
    const topbar = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--topbar-hoehe'), 10) || 56;
    const imBand = new Set();
    let io = null;
    let bekannteIds = '';
    let raf = 0;

    const bloecke = () => [...container.querySelectorAll('[data-block][id]')];
    const berechne = () => {
      const alle = bloecke();
      if (alle.length === 0) return;
      const amEnde = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (amEnde) { setAktiv(alle[alle.length - 1].id); return; }
      const erster = alle.find((el) => imBand.has(el.id));
      if (erster) setAktiv(erster.id);
    };
    const beobachte = () => {
      const alle = bloecke();
      const ids = alle.map((el) => el.id).join('|');
      if (ids === bekannteIds && io) return;
      bekannteIds = ids;
      if (io) io.disconnect();
      imBand.clear();
      io = new IntersectionObserver((eintraege) => {
        for (const e of eintraege) {
          if (e.isIntersecting) imBand.add(e.target.id);
          else imBand.delete(e.target.id);
        }
        berechne();
      }, { rootMargin: `-${topbar + 8}px 0px -55% 0px`, threshold: 0 });
      alle.forEach((el) => io.observe(el));
    };
    beobachte();
    const mo = new MutationObserver(() => beobachte());
    mo.observe(container, { childList: true, subtree: true });
    const aufScroll = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; berechne(); }); };
    window.addEventListener('scroll', aufScroll, { passive: true });
    return () => {
      if (io) io.disconnect();
      mo.disconnect();
      window.removeEventListener('scroll', aufScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [containerRef, schluessel]);
  return aktiv;
}

function Verzeichnis({ eintraege, aktiverId, kapitel, einheit, tiefe, rollenRef }) {
  const { routeZuHash, ersetzeRoute, setzeTiefe } = useWissen();
  const sichtbareStufe = stufeFuerTiefe(tiefe);
  const gruppen = TIEFEN.map((t) => ({ ...t, eintraege: eintraege.filter((e) => e.stufe === t.stufe) })).filter((g) => g.eintraege.length > 0);

  // aktiven Eintrag im Scrollrahmen der Leiste sichtbar halten (nur die
  // Leiste scrollt, nie die Seite — deshalb kein scrollIntoView)
  useEffect(() => {
    const rahmen = rollenRef?.current;
    if (!rahmen || !aktiverId) return;
    const el = rahmen.querySelector(`[data-eintrag="${aktiverId}"]`);
    if (!el || rahmen.scrollHeight <= rahmen.clientHeight) return;
    const oben = el.getBoundingClientRect().top - rahmen.getBoundingClientRect().top + rahmen.scrollTop;
    const unten = oben + el.offsetHeight;
    if (oben < rahmen.scrollTop + 8) rahmen.scrollTop = Math.max(0, oben - 8);
    else if (unten > rahmen.scrollTop + rahmen.clientHeight - 8) rahmen.scrollTop = unten - rahmen.clientHeight + 8;
  }, [aktiverId, rollenRef]);

  if (gruppen.length === 0) return <p className="adsseite-leer">Keine Abschnitte mit Überschrift.</p>;
  return (
    <div className="adsseite">
      {gruppen.map((g) => {
        const verborgen = g.stufe > sichtbareStufe;
        return (
          <div key={g.wert} className="adsseite-gruppe" data-tiefe={g.wert}>
            <div className="adsseite-gruppe-kopf">
              <span className="tiefen-punkt" style={{ '--tiefe-farbe': g.farbe }} aria-hidden="true" />
              {g.label}
            </div>
            {verborgen ? (
              <button type="button" className="adsseite-einblenden" onClick={() => setzeTiefe(g.wert)}>
                <Eye size={14} aria-hidden="true" />
                {mehrzahl(g.eintraege.length, 'Abschnitt', 'Abschnitte')} einblenden
              </button>
            ) : (
              <ul className="adsseite-liste">
                {g.eintraege.map((e) => {
                  const ziel = { name: 'kapitel', kapitelId: kapitel.id, einheitId: einheit.id, blockId: e.id };
                  return (
                    <li key={e.id}>
                      <a
                        href={routeZuHash(ziel)}
                        className="adsseite-link"
                        data-eintrag={e.id}
                        aria-current={aktiverId === e.id ? 'location' : undefined}
                        onClick={(ev) => {
                          if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey || ev.button !== 0) return;
                          ev.preventDefault();
                          ersetzeRoute(ziel);
                        }}
                      >
                        {e.titel}
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function AufDieserSeite({ variante = 'leiste', eintraege, aktiverId, kapitel, einheit, tiefe, rollenRef }) {
  const [offen, setOffen] = useState(false);
  if (!eintraege || eintraege.length === 0) return null;

  if (variante === 'kompakt') {
    const Symbol = offen ? ChevronUp : ChevronDown;
    return (
      <div className="adsseite-kompakt">
        <button type="button" className="adsseite-kompakt-knopf" aria-expanded={offen} aria-controls="adsseite-kompakt-inhalt" onClick={() => setOffen((o) => !o)}>
          <span>Auf dieser Seite</span>
          <span className="chip-zahl">{eintraege.length}</span>
          <Symbol size={16} aria-hidden="true" className="adsseite-kompakt-pfeil" />
        </button>
        {offen && (
          <div id="adsseite-kompakt-inhalt" className="adsseite-kompakt-inhalt">
            <Verzeichnis eintraege={eintraege} aktiverId={aktiverId} kapitel={kapitel} einheit={einheit} tiefe={tiefe} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="adsseite-leiste">
      <h2 className="adsseite-titel" id="adsseite-titel">Auf dieser Seite</h2>
      <Verzeichnis eintraege={eintraege} aktiverId={aktiverId} kapitel={kapitel} einheit={einheit} tiefe={tiefe} rollenRef={rollenRef} />
    </div>
  );
}
