// ===========================================================================
// Glossar — volle Seite (Brief §6): Suchfeld, Tag-Chips in fester
// Reihenfolge, A–Z-Leiste (sticky, Umlaute gefaltet, inaktive Buchstaben
// gedämpft), Liste nach Anfangsbuchstaben mit Begriff, Definition, Tags
// (klickbar = Filter), „Kommt vor in:“ (Lerneinheiten aus dem Text berechnet)
// und „Link kopieren“. #/glossar/:slug scrollt zum Begriff und hebt ihn hervor.
// Default-Export ohne Props.
// ===========================================================================
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Search, BookOpen, Link as LinkSymbol, Check, X } from 'lucide-react';
import { useWissen } from '../store/Wissen.jsx';
import Eingabe from '../components/ui/Eingabe.jsx';
import Chip from '../components/ui/Chip.jsx';
import Knopf from '../components/ui/Knopf.jsx';
import Leerzustand from '../components/ui/Leerzustand.jsx';
import { falte, nummer } from '../lib/text.js';
import { mehrzahl } from '../lib/format.js';
import { anfrageWoerter, markiere } from '../lib/suche.js';
import { useBegriffsDaten, vorkommenVon } from '../components/glossar/begriffsDaten.js';

const TAG_REIHENFOLGE = ['Markt', 'Produkte', 'Vertrieb', 'Regulatorik', 'Finanzen', 'PKV', 'Zukunft'];
const BUCHSTABEN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const MAX_VORKOMMEN = 5;
const HERVOR_MS = 2000;

/** Anfangsbuchstabe mit Umlautfaltung: Ä→A, Ö→O, Ü→U; sonst „#“. */
function anfangsbuchstabe(term) {
  const z = falte(term).charAt(0).toUpperCase();
  return /[A-Z]/.test(z) ? z : '#';
}

function Teile({ teile }) {
  return teile.map((t, i) => (t.mark ? <mark key={i}>{t.text}</mark> : <span key={i}>{t.text}</span>));
}

/** A–Z-Leiste als Werkzeugleiste: ein Tab-Stopp, Pfeiltasten wandern, Home/Ende springen, Enter/Leertaste wählen. */
function AzLeiste({ buchstaben, vorhanden, wert, onWechsel }) {
  const eintraege = useMemo(() => ['', ...buchstaben], [buchstaben]);
  const knoepfe = useRef([]);
  const [fokus, setFokus] = useState(0);
  useEffect(() => { const i = eintraege.indexOf(wert); if (i >= 0) setFokus(i); }, [wert, eintraege]);

  const aktivierbar = (b) => b === '' || vorhanden.has(b);
  const aufTaste = (e, i) => {
    const n = eintraege.length;
    let ziel = null;
    let schritt = 1;
    if (e.key === 'ArrowRight') ziel = i + 1;
    else if (e.key === 'ArrowLeft') { ziel = i - 1; schritt = -1; }
    else if (e.key === 'Home') ziel = 0;
    else if (e.key === 'End') { ziel = n - 1; schritt = -1; }
    if (ziel === null) return;
    e.preventDefault();
    let versuche = 0;
    while (versuche < n && (ziel < 0 || ziel >= n || !aktivierbar(eintraege[ziel]))) {
      ziel = (ziel + schritt + n) % n;
      versuche += 1;
    }
    if (ziel >= 0 && ziel < n) { setFokus(ziel); knoepfe.current[ziel]?.focus(); }
  };

  return (
    <div role="toolbar" aria-label="Anfangsbuchstabe" aria-orientation="horizontal" className="glossar-az">
      {eintraege.map((b, i) => {
        const aktiv = wert === b;
        return (
          <button
            key={b || 'alle'}
            ref={(el) => { knoepfe.current[i] = el; }}
            type="button"
            className={`glossar-az-knopf${b === '' ? ' glossar-az-alle' : ''}`}
            aria-pressed={aktiv}
            aria-label={b === '' ? 'Alle Buchstaben' : `Buchstabe ${b}`}
            disabled={!aktivierbar(b)}
            tabIndex={i === fokus ? 0 : -1}
            onFocus={() => setFokus(i)}
            onKeyDown={(e) => aufTaste(e, i)}
            onClick={() => onWechsel(aktiv && b !== '' ? '' : b)}
          >
            {b || 'Alle'}
          </button>
        );
      })}
    </div>
  );
}

export default function Glossar() {
  const { glossar, route, routeZuHash } = useWissen();
  const daten = useBegriffsDaten();
  const [suche, setSuche] = useState('');
  const [buchstabe, setBuchstabe] = useState('');
  const [tag, setTag] = useState('');
  const [hervor, setHervor] = useState(null);
  const [kopiert, setKopiert] = useState(null);
  const [aufgeklappt, setAufgeklappt] = useState(() => new Set());
  const kopierTimer = useRef(0);

  const woerter = useMemo(() => anfrageWoerter(suche), [suche]);
  const q = useMemo(() => falte(suche.trim()), [suche]);
  const passtSuche = useCallback((g) => !q || falte(g.term).includes(q) || falte(g.definition || '').includes(q), [q]);

  const tags = useMemo(() => {
    const vorhanden = new Set();
    glossar.forEach((g) => g.tags.forEach((t) => vorhanden.add(t)));
    const geordnet = TAG_REIHENFOLGE.filter((t) => vorhanden.has(t));
    [...vorhanden].sort((a, b) => a.localeCompare(b, 'de')).forEach((t) => { if (!geordnet.includes(t)) geordnet.push(t); });
    return geordnet;
  }, [glossar]);

  // Verfügbarkeit je Steuerelement aus den jeweils anderen Filtern
  const buchstabenVorhanden = useMemo(() => new Set(
    glossar.filter((g) => (!tag || g.tags.includes(tag)) && passtSuche(g)).map((g) => anfangsbuchstabe(g.term)),
  ), [glossar, tag, passtSuche]);
  const zahlJeTag = useMemo(() => {
    const je = new Map();
    glossar.filter((g) => (!buchstabe || anfangsbuchstabe(g.term) === buchstabe) && passtSuche(g))
      .forEach((g) => g.tags.forEach((t) => je.set(t, (je.get(t) || 0) + 1)));
    return je;
  }, [glossar, buchstabe, passtSuche]);
  const buchstabenListe = useMemo(() => (glossar.some((g) => anfangsbuchstabe(g.term) === '#') ? [...BUCHSTABEN, '#'] : BUCHSTABEN), [glossar]);

  const gefiltert = useMemo(() => glossar.filter((g) => (!buchstabe || anfangsbuchstabe(g.term) === buchstabe)
    && (!tag || g.tags.includes(tag)) && passtSuche(g)), [glossar, buchstabe, tag, passtSuche]);

  const gruppen = useMemo(() => {
    const je = new Map();
    for (const g of gefiltert) {
      const b = anfangsbuchstabe(g.term);
      if (!je.has(b)) je.set(b, []);
      je.get(b).push(g);
    }
    return [...je.entries()].map(([b, eintraege]) => ({ buchstabe: b, eintraege }));
  }, [gefiltert]);

  const filterAktiv = Boolean(q || buchstabe || tag);
  const zuruecksetzen = () => { setSuche(''); setBuchstabe(''); setTag(''); };

  // Deeplink #/glossar/:slug: Filter zurücksetzen, hinscrollen, hervorheben, fokussieren
  const deeplinkFehlt = Boolean(route.slug && glossar.length && !daten.nachSlug.has(route.slug));
  useEffect(() => {
    if (!route.slug || !glossar.length || !daten.nachSlug.has(route.slug)) return undefined;
    setSuche(''); setBuchstabe(''); setTag('');
    setHervor(route.slug);
    let versuche = 0;
    let timer = 0;
    const springe = () => {
      const el = document.getElementById(`begriff-${route.slug}`);
      if (el) {
        el.scrollIntoView({ block: 'start' });
        el.focus({ preventScroll: true });
      } else if (versuche < 20) { versuche += 1; timer = window.setTimeout(springe, 80); }
    };
    timer = window.setTimeout(springe, 40);
    const ende = window.setTimeout(() => setHervor(null), HERVOR_MS);
    return () => { window.clearTimeout(timer); window.clearTimeout(ende); };
  }, [route.slug, glossar.length, daten]);

  useEffect(() => () => window.clearTimeout(kopierTimer.current), []);

  const kopiereLink = async (g) => {
    const url = `${window.location.origin}${window.location.pathname}${window.location.search}${routeZuHash({ name: 'glossar', slug: g.slug })}`;
    let ok = false;
    try {
      if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(url); ok = true; }
    } catch { ok = false; }
    if (!ok) {
      try {
        const feld = document.createElement('textarea');
        feld.value = url;
        feld.setAttribute('readonly', '');
        feld.style.position = 'fixed';
        feld.style.opacity = '0';
        document.body.appendChild(feld);
        feld.select();
        ok = document.execCommand('copy');
        document.body.removeChild(feld);
      } catch { ok = false; }
    }
    setKopiert(ok ? g.slug : null);
    window.clearTimeout(kopierTimer.current);
    kopierTimer.current = window.setTimeout(() => setKopiert(null), 1800);
  };

  const standText = (() => {
    const teile = [mehrzahl(gefiltert.length, 'Begriff', 'Begriffe')];
    if (filterAktiv) teile.push(`von ${glossar.length}`);
    if (q) teile.push(`zu „${suche.trim()}“`);
    if (tag) teile.push(`· Thema ${tag}`);
    if (buchstabe) teile.push(`· Buchstabe ${buchstabe}`);
    return teile.join(' ');
  })();

  return (
    <div className="seite glossar">
      <header className="glossar-kopf">
        <div className="ueberschrift-meta">Nachschlagen</div>
        <h1 style={{ marginTop: 6 }}>Glossar</h1>
        <p className="nebentext" style={{ marginTop: 6 }}>
          {mehrzahl(glossar.length, 'Fachbegriff', 'Fachbegriffe')} mit Definition – nach Volltext, Thema oder Anfangsbuchstabe. Jeder Begriff zeigt, in welchen Lerneinheiten er vorkommt.
        </p>
      </header>

      <div className="glossar-filter">
        <Eingabe
          wert={suche}
          onAendern={setSuche}
          placeholder="Begriff oder Definition suchen …"
          symbol={Search}
          loeschbar
          gross
          aria-label="Glossar durchsuchen"
          onKeyDown={(e) => { if (e.key === 'Escape' && suche) { e.preventDefault(); setSuche(''); } }}
        />
        <div role="group" aria-label="Thema" className="glossar-tags">
          <Chip aktiv={!tag} onClick={() => setTag('')}>Alle Themen</Chip>
          {tags.map((t) => (
            <Chip key={t} aktiv={tag === t} onClick={() => setTag(tag === t ? '' : t)} zahl={zahlJeTag.get(t) || 0} disabled={!zahlJeTag.get(t) && tag !== t}>
              {t}
            </Chip>
          ))}
        </div>
      </div>
      {/* Die A–Z-Leiste steht außerhalb des Filterblocks: sticky reicht nur so weit wie der Elternkasten */}
      <AzLeiste buchstaben={buchstabenListe} vorhanden={buchstabenVorhanden} wert={buchstabe} onWechsel={setBuchstabe} />

      <div className="glossar-stand">
        <span aria-live="polite" aria-atomic="true">{standText}</span>
        {filterAktiv && (
          <Knopf variante="still" groesse="klein" symbol={X} onClick={zuruecksetzen}>Filter zurücksetzen</Knopf>
        )}
      </div>

      {deeplinkFehlt && (
        <p className="nebentext glossar-hinweis">Zu „{route.slug}“ gibt es keinen Eintrag – hier ist die ganze Liste.</p>
      )}

      {gefiltert.length === 0 ? (
        <Leerzustand
          symbol={BookOpen}
          titel="Kein Begriff passt"
          text="Andere Schreibweise probieren oder die Filter zurücksetzen. Die Suche prüft Begriff und Definition, Umlaute sind egal."
          aktion={<Knopf variante="primaer" symbol={X} onClick={zuruecksetzen}>Filter zurücksetzen</Knopf>}
        />
      ) : gruppen.map((gruppe) => (
        <section key={gruppe.buchstabe} className="glossar-gruppe" aria-labelledby={`glossar-buchstabe-${gruppe.buchstabe === '#' ? 'sonstige' : gruppe.buchstabe}`}>
          <h2 id={`glossar-buchstabe-${gruppe.buchstabe === '#' ? 'sonstige' : gruppe.buchstabe}`} className="glossar-buchstabe">{gruppe.buchstabe}</h2>
          <dl className="glossar-liste">
            {gruppe.eintraege.map((g) => {
              const vork = vorkommenVon(daten, g.slug);
              const offen = aufgeklappt.has(g.slug);
              const sichtbar = offen ? vork : vork.slice(0, MAX_VORKOMMEN);
              const rest = vork.length - sichtbar.length;
              return (
                <div
                  key={g.slug}
                  id={`begriff-${g.slug}`}
                  className={`glossar-eintrag${hervor === g.slug ? ' glossar-eintrag-hervor' : ''}`}
                  tabIndex={-1}
                  data-slug={g.slug}
                >
                  <dt className="glossar-begriff"><Teile teile={markiere(g.term, woerter)} /></dt>
                  <dd className="glossar-definition">
                    <p><Teile teile={markiere(g.definition || '', woerter)} /></p>
                    <div className="glossar-eintrag-fuss">
                      {g.tags.length > 0 && (
                        <div className="glossar-eintrag-tags" role="group" aria-label={`Themen von ${g.term}`}>
                          {g.tags.map((t) => (
                            <Chip key={t} aktiv={tag === t} onClick={() => setTag(tag === t ? '' : t)} aria-label={`Thema ${t}${tag === t ? ' (Filter aufheben)' : ' (als Filter)'}`}>
                              {t}
                            </Chip>
                          ))}
                        </div>
                      )}
                      {vork.length > 0 && (
                        <div className="glossar-vorkommen">
                          <span className="glossar-vorkommen-label">Kommt vor in:</span>
                          {sichtbar.map((v, i) => (
                            <span key={`${v.kapitelId}/${v.einheitId}`}>
                              {i > 0 && <span aria-hidden="true"> · </span>}
                              <a
                                href={routeZuHash({ name: 'kapitel', kapitelId: v.kapitelId, einheitId: v.einheitId })}
                                title={`Kapitel ${nummer(v.kapitelIndex)} ${v.kapitel.title} · ${mehrzahl(v.anzahl, 'Nennung', 'Nennungen')}`}
                              >
                                {v.einheit.title}
                              </a>
                            </span>
                          ))}
                          {rest > 0 && (
                            <button type="button" className="glossar-vorkommen-mehr" onClick={() => setAufgeklappt((s) => new Set(s).add(g.slug))} aria-label={`${rest} weitere Lerneinheiten anzeigen`}>
                              +{rest} weitere
                            </button>
                          )}
                        </div>
                      )}
                      <Knopf
                        variante="still"
                        groesse="klein"
                        symbol={kopiert === g.slug ? Check : LinkSymbol}
                        className="glossar-kopieren"
                        data-kopiert={kopiert === g.slug ? 'true' : 'false'}
                        aria-label={kopiert === g.slug ? `Link zu „${g.term}“ kopiert` : `Link zu „${g.term}“ kopieren`}
                        onClick={() => kopiereLink(g)}
                      >
                        {kopiert === g.slug ? 'Kopiert' : 'Link kopieren'}
                      </Knopf>
                    </div>
                  </dd>
                </div>
              );
            })}
          </dl>
        </section>
      ))}
    </div>
  );
}
