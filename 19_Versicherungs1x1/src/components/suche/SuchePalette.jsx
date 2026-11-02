// ===========================================================================
// SuchePalette — Befehlspalette (⌘K / Strg K / „/“). Default-Export ohne
// Props; App.jsx mountet sie, wenn `sucheOffen`. Brief §6 „Suche“.
//
// Index aus lib/suche.js (einmal je Datenstand): Kapitel, Lerneinheiten,
// Blöcke mit blockId, Glossar, Werkzeuge. Dazu Schnellaktionen (Weiterlernen,
// Wissenscheck, Zufällige Lerneinheit, Glossar, Tiefe, Tastaturkürzel).
// Ohne Eingabe: Zuletzt gesucht (localStorage), Vorschläge, Werkzeuge.
// Tastatur: ↑ ↓ (aria-activedescendant, kein Fokuswechsel), Enter, Esc; Tab
// bleibt im Dialog (Fokusfalle des Dialog-Bausteins). Maus wählt per Bewegung.
// ===========================================================================
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Search, X, Layers, FileText, BookMarked, Calculator, Radar, GitBranch, Workflow, Play, ListChecks,
  Shuffle, BookOpen, SlidersHorizontal, Keyboard, History, Table, Info, LayoutGrid, BarChart3, Clock,
  AlignLeft, Network, Pyramid, Route, CornerDownLeft, Sparkles,
} from 'lucide-react';
import { useWissen } from '../../store/Wissen.jsx';
import Dialog from '../ui/Dialog.jsx';
import Kbd from '../ui/Kbd.jsx';
import Pille from '../ui/Pille.jsx';
import Leerzustand from '../ui/Leerzustand.jsx';
import Knopf from '../ui/Knopf.jsx';
import {
  indexFuer, suche, alsTreffer, neuerEintrag, ladeZuletzt, merkeZuletzt, loescheZuletzt, zuletztGegenIndex,
} from '../../lib/suche.js';
import { naechsteTiefe, tiefeLabel } from '../../lib/bloecke.js';
import { datumRelativ, mehrzahl } from '../../lib/format.js';
import { nummer } from '../../lib/text.js';

const SYMBOL_JE_TYP = { kapitel: Layers, einheit: FileText, glossar: BookMarked, werkzeug: Calculator, aktion: Sparkles, inhalt: AlignLeft, zuletzt: History };
const SYMBOL_JE_BLOCK = {
  paragraph: AlignLeft, table: Table, comparisonTable: Table, callout: Info, infoKachelGrid: LayoutGrid,
  chartLine: BarChart3, chartBar: BarChart3, chartDonut: BarChart3, timeline: Clock, heatmapGrid: LayoutGrid,
  regulatoryPyramid: Pyramid, valueChain: Route, networkGraph: Network,
  combinedRatioCalc: Calculator, provisionCalc: Calculator, trendRadar: Radar, decisionTree: GitBranch, sankey: Workflow,
};

function symbolFuer(e) {
  if (e.symbol) return e.symbol;
  if (e.blockTyp && SYMBOL_JE_BLOCK[e.blockTyp]) return SYMBOL_JE_BLOCK[e.blockTyp];
  return SYMBOL_JE_TYP[e.typ] || FileText;
}

function Teile({ teile }) {
  return teile.map((t, i) => (t.mark ? <mark key={i}>{t.text}</mark> : <span key={i}>{t.text}</span>));
}

export default function SuchePalette() {
  const {
    daten, glossar, kapitelListe, einheitenFolge, fortschritt, tiefe, setzeTiefe,
    sucheOffen, schliesseSuche, sucheVorbelegung, navigiere,
    oeffneKapitel, oeffneGlossar, oeffneWissenscheck, oeffneHilfe,
  } = useWissen();

  const [eingabe, setEingabe] = useState(sucheVorbelegung || '');
  const [aktiv, setAktiv] = useState(0);
  const [zuletzt, setZuletzt] = useState(() => ladeZuletzt());
  const eingabeRef = useRef(null);
  const listeRef = useRef(null);
  const listboxId = 'suche-liste';

  const index = useMemo(() => indexFuer(daten, glossar), [daten, glossar]);

  // Schnellaktionen — werden wie Indexeinträge bewertet (Typ „aktion“)
  const aktionen = useMemo(() => {
    const liste = [];
    const mach = (felder, symbol, aktion) => {
      const e = neuerEintrag('aktion', { ...felder, id: `aktion:${felder.id}` });
      e.symbol = symbol;
      e.aktion = aktion;
      liste.push(e);
    };
    const z = fortschritt.zuletzt;
    const letzte = z ? einheitenFolge.find((e) => e.kapitel.id === z.kapitelId && e.einheit.id === z.einheitId) : null;
    if (letzte) {
      mach({ id: 'weiter', titel: `Weiterlernen: ${letzte.einheit.title}`, text: `${nummer(letzte.kapitelIndex)} ${letzte.kapitel.title} · zuletzt ${datumRelativ(z.zeit)}`, extra: 'weiterlernen fortsetzen weiter' }, Play, () => oeffneKapitel(z.kapitelId, z.einheitId));
    } else if (einheitenFolge[0]) {
      const e = einheitenFolge[0];
      mach({ id: 'start', titel: `Hier starten: ${e.einheit.title}`, text: `${nummer(e.kapitelIndex)} ${e.kapitel.title}`, extra: 'starten anfangen beginnen' }, Play, () => oeffneKapitel(e.kapitel.id, e.einheit.id));
    }
    mach({ id: 'wissenscheck', titel: 'Wissenscheck starten', text: 'Schnellcheck, Kapitel-Check, Wiederholen oder Kompletttest', extra: 'quiz test fragen prüfen üben' }, ListChecks, () => oeffneWissenscheck());
    if (einheitenFolge.length) {
      mach({ id: 'zufall', titel: 'Zufällige Lerneinheit', text: 'Irgendwo im Versicherungs-1×1 einsteigen', extra: 'zufall random entdecken' }, Shuffle, () => {
        const e = einheitenFolge[Math.floor(Math.random() * einheitenFolge.length)];
        oeffneKapitel(e.kapitel.id, e.einheit.id);
      });
    }
    mach({ id: 'glossar', titel: 'Glossar öffnen', text: `${mehrzahl(glossar.length, 'Fachbegriff', 'Fachbegriffe')} mit Definition`, extra: 'begriffe lexikon definition' }, BookOpen, () => oeffneGlossar());
    const naechste = naechsteTiefe(tiefe);
    mach({ id: 'tiefe', titel: `Tiefe wechseln: ${tiefeLabel(tiefe)} → ${tiefeLabel(naechste)}`, text: 'Gilt für alle Lerneinheiten · Basis · Vertiefung · Experte', extra: 'tiefe basis vertiefung experte level stufe' }, SlidersHorizontal, () => setzeTiefe(naechste));
    mach({ id: 'hilfe', titel: 'Tastaturkürzel anzeigen', text: 'Alle Kürzel auf einen Blick', extra: 'hilfe tasten shortcuts tastatur' }, Keyboard, () => oeffneHilfe());
    return liste;
  }, [fortschritt.zuletzt, einheitenFolge, glossar.length, tiefe, oeffneKapitel, oeffneWissenscheck, oeffneGlossar, setzeTiefe, oeffneHilfe]);

  const ergebnis = useMemo(() => {
    const q = eingabe.trim();
    if (!q) {
      const gruppen = [];
      const z = zuletztGegenIndex(zuletzt, index);
      if (z.length) gruppen.push({ typ: 'zuletzt', titel: 'Zuletzt gesucht', treffer: alsTreffer(z, 90) });
      gruppen.push({ typ: 'aktion', titel: 'Vorschläge', treffer: alsTreffer(aktionen) });
      if (index.werkzeuge.length) gruppen.push({ typ: 'werkzeug', titel: 'Werkzeuge', treffer: alsTreffer(index.werkzeuge) });
      return { gruppen, gesamt: 0, leer: true };
    }
    return { ...suche(index, q, { zusatz: aktionen }), leer: false };
  }, [eingabe, index, aktionen, zuletzt]);

  const flach = useMemo(() => ergebnis.gruppen.flatMap((g) => g.treffer), [ergebnis]);
  const anzahl = flach.length;

  useEffect(() => { setAktiv(0); }, [eingabe]);
  useEffect(() => { if (aktiv >= anzahl) setAktiv(Math.max(0, anzahl - 1)); }, [aktiv, anzahl]);

  // Aktiven Eintrag in der Liste sichtbar halten — im Listenrahmen, nicht per scrollIntoView (das könnte die Seite bewegen)
  useEffect(() => {
    const liste = listeRef.current;
    const el = liste?.querySelector(`[data-index="${aktiv}"]`);
    if (!liste || !el) return;
    const oben = el.offsetTop - 8;
    const unten = el.offsetTop + el.offsetHeight + 8;
    if (oben < liste.scrollTop) liste.scrollTop = oben;
    else if (unten > liste.scrollTop + liste.clientHeight) liste.scrollTop = unten - liste.clientHeight;
  }, [aktiv, ergebnis]);

  const waehle = useCallback((t) => {
    if (!t) return;
    const e = t.eintrag;
    if (e.typ === 'aktion') { schliesseSuche(); if (e.aktion) e.aktion(); return; }
    setZuletzt(merkeZuletzt(e.quelle || e));
    schliesseSuche();
    if (e.route) navigiere(e.route);
  }, [schliesseSuche, navigiere]);

  const aufTaste = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setAktiv((i) => Math.min(anzahl - 1, i + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setAktiv((i) => Math.max(0, i - 1)); }
    else if (e.key === 'PageDown') { e.preventDefault(); setAktiv((i) => Math.min(anzahl - 1, i + 5)); }
    else if (e.key === 'PageUp') { e.preventDefault(); setAktiv((i) => Math.max(0, i - 5)); }
    else if (e.key === 'Enter') { e.preventDefault(); waehle(flach[aktiv]); }
  };

  const verlaufLoeschen = () => { setZuletzt(loescheZuletzt()); eingabeRef.current?.focus(); };

  const aktivId = flach[aktiv] ? `suche-option-${aktiv}` : undefined;
  const status = ergebnis.leer ? '' : (ergebnis.gesamt === 0 ? 'Keine Treffer' : `${mehrzahl(ergebnis.gesamt, 'Treffer', 'Treffer')}`);
  let laufIndex = -1;

  return (
    <Dialog offen={sucheOffen} onSchliessen={schliesseSuche} label="Suche" ausrichtung="oben" breite={640} schliessenKnopf={false} className="suche-palette">
      <div className="suche-kopf">
        <Search size={18} aria-hidden="true" />
        <input
          ref={eingabeRef}
          data-autofokus
          type="text"
          className="suche-eingabe"
          value={eingabe}
          onChange={(e) => setEingabe(e.target.value)}
          onKeyDown={aufTaste}
          placeholder="Kapitel, Lerneinheit, Begriff oder Inhalt suchen …"
          aria-label="Suche"
          role="combobox"
          aria-expanded={anzahl > 0}
          aria-controls={listboxId}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-activedescendant={aktivId}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="go"
        />
        {eingabe && (
          <Knopf variante="still" groesse="klein" nurSymbol symbol={X} aria-label="Eingabe löschen" onClick={() => { setEingabe(''); eingabeRef.current?.focus(); }} />
        )}
      </div>

      <div className="sr-only" role="status" aria-live="polite">{status}</div>

      <div ref={listeRef} id={listboxId} role="listbox" aria-label="Suchergebnisse" className="suche-liste">
        {!ergebnis.leer && ergebnis.gesamt === 0 && (
          <Leerzustand
            className="suche-leer"
            symbol={Search}
            titel={`Keine Treffer für „${eingabe.trim()}“`}
            text="Probier eine andere Schreibweise oder ein kürzeres Wort. Die Suche kennt Kapitel, Lerneinheiten, Absätze, Tabellen, Glossar und Werkzeuge."
          />
        )}
        {ergebnis.gruppen.map((g) => (
          <div key={g.typ} role="group" aria-labelledby={`suche-gruppe-${g.typ}`} className="suche-gruppe">
            <div id={`suche-gruppe-${g.typ}`} role="presentation" className="suche-gruppe-titel">
              <span>{g.titel}</span>
              {g.typ === 'zuletzt' && (
                <button type="button" className="suche-gruppe-knopf" onClick={verlaufLoeschen}>Löschen</button>
              )}
              {g.weitere > 0 && <span className="suche-gruppe-mehr">{g.treffer.length} von {g.treffer.length + g.weitere}</span>}
            </div>
            {g.treffer.map((t) => {
              laufIndex += 1;
              const i = laufIndex;
              const e = t.eintrag;
              const Symbol = symbolFuer(e);
              const istAktiv = i === aktiv;
              const zeigeArt = e.typ === 'inhalt' && e.art && e.art !== 'Absatz';
              return (
                <div
                  key={e.id}
                  id={`suche-option-${i}`}
                  role="option"
                  aria-selected={istAktiv}
                  data-index={i}
                  data-typ={e.typ}
                  className="suche-treffer"
                  onMouseMove={() => { if (!istAktiv) setAktiv(i); }}
                  onMouseDown={(ev) => ev.preventDefault()}
                  onClick={() => waehle(t)}
                >
                  <span className="suche-treffer-symbol"><Symbol size={15} aria-hidden="true" /></span>
                  <span className="suche-treffer-text">
                    <span className="suche-treffer-kopf">
                      <span className="suche-treffer-titel"><Teile teile={t.titelTeile} /></span>
                      {zeigeArt && <Pille>{e.art}</Pille>}
                      {e.tiefe && e.tiefe !== 'basis' && <Pille ton={e.tiefe} punkt>{tiefeLabel(e.tiefe)}</Pille>}
                    </span>
                    {/* data-kappung="absicht": der Ausschnitt ist ein Auszug und
                        wird bewusst auf zwei Zeilen geklemmt (Enter öffnet die
                        Fundstelle im Volltext). */}
                    {t.textTeile.length > 0 && <span className="suche-treffer-ausschnitt" data-kappung="absicht"><Teile teile={t.textTeile} /></span>}
                    {e.pfad && <span className="suche-treffer-pfad">{e.pfad}</span>}
                  </span>
                  <span className="suche-treffer-enter" aria-hidden="true">{istAktiv && <CornerDownLeft size={14} />}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="suche-fuss">
        <span className="suche-fuss-hinweis"><Kbd taste="ArrowUp" /><Kbd taste="ArrowDown" /> wählen</span>
        <span className="suche-fuss-hinweis"><Kbd taste="Enter" /> öffnen</span>
        <span><Kbd taste="Esc" /> schließen</span>
        <span className="suche-fuss-zahl">{ergebnis.leer ? `${mehrzahl(einheitenFolge.length, 'Lerneinheit', 'Lerneinheiten')} · ${mehrzahl(glossar.length, 'Begriff', 'Begriffe')} · Volltext` : status}</span>
      </div>
    </Dialog>
  );
}
