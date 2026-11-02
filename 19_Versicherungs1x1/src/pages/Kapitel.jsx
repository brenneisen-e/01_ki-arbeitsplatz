// ===========================================================================
// Kapitel — das Leseerlebnis einer Lerneinheit (Brief §6).
//
// Kopf (Kapitelnummer, h1, Untertitel, Metazeile, Kennzahlen), Tab-Leiste der
// Lerneinheiten, Einheitenkopf mit Tiefenwahl, „Auf dieser Seite“ (rechts ab
// 1440 px, sonst einklappbar), „Kurz gesagt“ und „Danach kannst du …“ aus
// den Daten, Blöcke je Tiefe über ContentBlocks, Begriffe, Quellen, Fuß mit
// Gelesen-Knopf, stillem Kapitelabschluss, Vor/Zurück und Wissenscheck.
// Lesefortschritt und stilles „gelesen“: useLesestand. Deeplink :blockId
// schaltet die Tiefe hoch, scrollt hin und hebt den Block 1,2 s hervor.
// Default-Export ohne Props; alles kommt aus useWissen().
// ===========================================================================
import { useEffect, useMemo, useRef } from 'react';
import { Clock, BookOpen } from 'lucide-react';
import { useWissen } from '../store/Wissen.jsx';
import { sichtbareBloecke, tiefeFuerBlock, stufeFuerTiefe } from '../lib/bloecke.js';
import { minuten } from '../lib/format.js';
import Pille from '../components/ui/Pille.jsx';
import Leerzustand from '../components/ui/Leerzustand.jsx';
import BegriffeChips from '../components/glossar/BegriffeChips.jsx';
import KapitelKopf from '../components/kapitel/KapitelKopf.jsx';
import EinheitenLeiste from '../components/kapitel/EinheitenLeiste.jsx';
import TiefenWahl from '../components/kapitel/TiefenWahl.jsx';
import AufDieserSeite, { useAktiverBlock } from '../components/kapitel/AufDieserSeite.jsx';
import KurzGesagt from '../components/kapitel/KurzGesagt.jsx';
import Lernziele from '../components/kapitel/Lernziele.jsx';
import TiefenGruppen from '../components/kapitel/TiefenGruppen.jsx';
import GelesenKnopf from '../components/kapitel/GelesenKnopf.jsx';
import EinheitenNavigation from '../components/kapitel/EinheitenNavigation.jsx';
import Quellenliste from '../components/kapitel/Quellenliste.jsx';
import Kapitelabschluss from '../components/kapitel/Kapitelabschluss.jsx';
import { useLesestand } from '../components/kapitel/useLesestand.js';
import { gruppiereNachTiefe, inhaltsverzeichnis, eintragFuerBlock, wirksameTiefe } from '../components/kapitel/inhalt.js';

const HERVOR_MS = 1200;

export default function Kapitel() {
  const { kapitel, kapitelIndex, einheit, route, tiefe, setzeTiefe, istGelesen, lesezeitEinheit } = useWissen();
  const artikelRef = useRef(null);
  const inhaltAnfangRef = useRef(null);
  const inhaltEndeRef = useRef(null);
  const leisteRef = useRef(null);
  const unterdrueckt = useRef(false);
  const tiefeRef = useRef(tiefe);
  tiefeRef.current = tiefe;

  const sichtbar = useMemo(() => (einheit ? sichtbareBloecke(einheit, tiefe) : []), [einheit, tiefe]);
  const gruppen = useMemo(() => gruppiereNachTiefe(sichtbar), [sichtbar]);
  const verzeichnis = useMemo(() => (einheit ? inhaltsverzeichnis(einheit) : []), [einheit]);
  const schluessel = kapitel && einheit ? `${kapitel.id}/${einheit.id}/${tiefe}` : '';
  const aktiverBlock = useAktiverBlock(artikelRef, schluessel);
  const aktiverEintrag = useMemo(() => eintragFuerBlock(verzeichnis, aktiverBlock), [verzeichnis, aktiverBlock]);

  useLesestand({ kapitel, einheit, anfangRef: inhaltAnfangRef, endeRef: inhaltEndeRef, unterdruecktRef: unterdrueckt });

  // Deeplink auf einen Block: nötige Tiefe einschalten, hinscrollen (die
  // Topbar bleibt frei über scroll-margin-top), 1,2 s hervorheben. Läuft je
  // Navigation genau einmal — ein späterer Tiefenwechsel scrollt nicht erneut.
  useEffect(() => {
    if (!einheit || !route.blockId) return undefined;
    const noetig = tiefeFuerBlock(einheit, route.blockId);
    if (!noetig) return undefined;
    if (stufeFuerTiefe(noetig) > stufeFuerTiefe(tiefeRef.current)) setzeTiefe(noetig);
    let versuche = 0;
    let timer = 0;
    const springe = () => {
      const el = document.getElementById(route.blockId);
      if (el) {
        el.scrollIntoView({ block: 'start' });
        el.setAttribute('data-hervor', 'true');
        timer = window.setTimeout(() => el.removeAttribute('data-hervor'), HERVOR_MS);
      } else if (versuche < 40) {
        versuche += 1;
        timer = window.setTimeout(springe, 100);
      }
    };
    springe();
    return () => {
      window.clearTimeout(timer);
      document.querySelectorAll('[data-hervor]').forEach((el) => el.removeAttribute('data-hervor'));
    };
  }, [einheit, route, setzeTiefe]);

  if (!kapitel || !einheit) return null;

  const gelesen = istGelesen(kapitel.id, einheit.id);
  const lesezeit = lesezeitEinheit(kapitel.id, einheit.id);
  const wirksam = wirksameTiefe(einheit, tiefe);
  const hatEinstieg = (Array.isArray(einheit.kurzgesagt) && einheit.kurzgesagt.length > 0) || (Array.isArray(einheit.lernziele) && einheit.lernziele.length > 0);
  const zweiKarten = Array.isArray(einheit.kurzgesagt) && einheit.kurzgesagt.length > 0 && Array.isArray(einheit.lernziele) && einheit.lernziele.length > 0;
  const zuruecknehmen = () => { unterdrueckt.current = true; };

  return (
    <div className="kapitel-seite">
      <KapitelKopf kapitel={kapitel} kapitelIndex={kapitelIndex} einheit={einheit} />
      <EinheitenLeiste kapitel={kapitel} einheit={einheit} />

      <div className="kapitel-raster">
        <article id="einheit-inhalt" className="einheit" aria-labelledby="einheit-titel" ref={artikelRef}>
          <header className="einheit-kopf" ref={inhaltAnfangRef}>
            <div className="einheit-kopf-text">
              <h2 id="einheit-titel">{einheit.title}</h2>
              {einheit.subtitle ? <p className="einheit-untertitel">{einheit.subtitle}</p> : null}
              <div className="einheit-meta">
                <span><Clock size={13} aria-hidden="true" />{minuten(lesezeit)} Lesezeit</span>
                {gelesen && <Pille ton="erfolg" punkt>Gelesen</Pille>}
              </div>
            </div>
            <TiefenWahl einheit={einheit} />
          </header>

          <AufDieserSeite variante="kompakt" eintraege={verzeichnis} aktiverId={aktiverEintrag?.id || null} kapitel={kapitel} einheit={einheit} tiefe={wirksam} />

          {hatEinstieg && (
            <div className="einheit-einstieg" data-zwei={zweiKarten ? 'true' : 'false'}>
              <KurzGesagt saetze={einheit.kurzgesagt} />
              <Lernziele ziele={einheit.lernziele} />
            </div>
          )}

          {gruppen.length > 0 ? (
            <TiefenGruppen gruppen={gruppen} kapitel={kapitel} einheit={einheit} />
          ) : (
            <Leerzustand symbol={BookOpen} titel="Noch kein Inhalt" text="Diese Lerneinheit hat noch keine Inhaltsblöcke." />
          )}

          <div className="einheit-begriffe">
            <BegriffeChips kapitel={kapitel} einheit={einheit} />
          </div>
          <Quellenliste einheit={einheit} />
          <div ref={inhaltEndeRef} aria-hidden="true" />

          <footer className="einheit-fuss">
            <div className="einheit-fuss-gelesen">
              <GelesenKnopf kapitel={kapitel} einheit={einheit} onZuruecknehmen={zuruecknehmen} />
            </div>
            <Kapitelabschluss kapitel={kapitel} kapitelIndex={kapitelIndex} einheit={einheit} />
            <EinheitenNavigation kapitel={kapitel} einheit={einheit} />
          </footer>
        </article>

        <aside className="einheit-leiste" aria-labelledby="adsseite-titel" ref={leisteRef}>
          <div className="einheit-leiste-innen">
            <AufDieserSeite variante="leiste" eintraege={verzeichnis} aktiverId={aktiverEintrag?.id || null} kapitel={kapitel} einheit={einheit} tiefe={wirksam} rollenRef={leisteRef} />
            <div className="einheit-leiste-fuss">
              <span className="einheit-leiste-zeit"><Clock size={13} aria-hidden="true" />{minuten(lesezeit)} Lesezeit</span>
              <GelesenKnopf kapitel={kapitel} einheit={einheit} klein onZuruecknehmen={zuruecknehmen} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
