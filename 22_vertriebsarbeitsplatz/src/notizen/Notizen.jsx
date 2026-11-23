import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link2, Link2Off, LocateFixed, Minus, Mouse, MouseOff, Pause, Play, Plus, RotateCcw } from 'lucide-react';
import { ankerZuAbschnitt, inBloecke, parseH2, saetze, teile } from './parse';
import { HERZSCHLAG_MS, NOTIZEN_KANAL, STAND_KEY } from './kanal';
import { stelleAusStand } from './stellen';
import { SKRIPTE, skriptAusAdresse, skriptFuerModus, skriptStart } from './skripte';

// ─────────────────────────────────────────────────────────────────────────────
// Notizfenster (speakernotes.html): die Speakernotes zur Demo des
// Vertriebsarbeitsplatzes als eigenes Browserfenster, das der Vortragende per
// OS-Werkzeug über andere Bildschirme legt. Dasselbe Werkzeug wie das
// Notizfenster von Banking Horizon: dunkel, große Schrift, Sätze als
// Stichpunkte, Timer, Schriftgröße, Sprungchips je Abschnitt.
//
// Es folgt dem Arbeitsplatz: Der schreibt seinen Stand nach localStorage
// (kopplung.jsx), das storage-Ereignis kommt hier an, und die Notizen springen
// zum Anker der Stelle (stellen.js). Wechselt der Arbeitsplatz den Modus,
// wechselt das Skript mit. Das Mausrad im Arbeitsplatz scrollt die Notizen
// (BroadcastChannel); kurz nach einem Sprung werden Rad-Nachrichten verworfen,
// damit der Sprung nicht gleich wieder überschrieben wird.
// ─────────────────────────────────────────────────────────────────────────────

const SCHRIFT_KEY = 'kia-notizen-schrift';
const RAD_KEY = 'kia-notizen-rad';
const SPRUNG_SPERRE_MS = 1200;
const RAHMEN = 'Rahmen: ';

function leseStand() {
  try {
    const roh = localStorage.getItem(STAND_KEY);
    return roh ? JSON.parse(roh) : null;
  } catch {
    return null;
  }
}

function mmss(s) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// Zahlen mit Einheit stehen im Redetext hervorgehoben, als Anker für das Auge.
const ZAHL = /(\d[\d.,]*(?: bis \d[\d.,]*)? (?:Prozent|Euro))/;

function Fett({ text }) {
  return text.split(ZAHL).map((t, i) => (i % 2 ? <b key={i}>{t}</b> : t));
}

function Rede({ text }) {
  return (
    <ul className="rede">
      {saetze(text).map((s, i) => (
        <li key={i}><Fett text={s} /></li>
      ))}
    </ul>
  );
}

function RedeBloecke({ bloecke, ziel }) {
  const out = [];
  let key = 0;
  for (const b of bloecke) {
    if (b.typ === 'h2') {
      const a = parseH2(b);
      out.push(
        <h2 key={key++} id={a?.id ?? b.anker ?? undefined}>
          {a?.marke && <span className="marke">{a.marke}</span>}
          <span>{a?.titel ?? b.text}</span>
          {a?.dauer && <span className="dauer">{a.dauer}</span>}
        </h2>,
      );
      continue;
    }
    if (b.typ !== 'p') continue;
    const t = b.text;
    // Regieanweisung: der ganze Absatz in eckigen Klammern
    if (/^\[[^\]]*\]$/.test(t)) {
      out.push(
        <p key={key++} id={b.anker ?? undefined} className="regie" data-aktiv={(b.anker && b.anker === ziel) || undefined}>
          {t.slice(1, -1)}
        </p>,
      );
      continue;
    }
    // Kasten: „[Etikett.] Text“
    const m = t.match(/^\[([^\]]*)\]\s*(.+)$/);
    if (m) {
      out.push(
        <div key={key++} id={b.anker ?? undefined} className={`kasten${/^Optional/i.test(m[1]) ? ' optional' : ''}`}>
          <span className="etikett">{m[1].replace(/[.:]$/, '')}</span>
          <Rede text={m[2]} />
        </div>,
      );
      continue;
    }
    out.push(<Rede key={key++} text={t} />);
  }
  return out;
}

function Anhang({ bloecke }) {
  return bloecke.map((b, i) => {
    if (b.typ === 'p') return <p key={i}>{b.text}</p>;
    if (b.typ === 'liste') {
      return (
        <ul key={i} className="quellen">
          {b.punkte.map((p, j) => (
            <li key={j}>{/^https?:\/\//.test(p) ? <a href={p} target="_blank" rel="noopener noreferrer">{p}</a> : p}</li>
          ))}
        </ul>
      );
    }
    if (b.typ === 'tabelle') {
      const [kopf, ...zeilen] = b.zeilen;
      return (
        <table key={i} className="zahlen">
          <thead><tr>{kopf.map((c, j) => <th key={j}>{c}</th>)}</tr></thead>
          <tbody>{zeilen.map((r, j) => <tr key={j}>{r.map((c, k) => <td key={k}>{c}</td>)}</tr>)}</tbody>
        </table>
      );
    }
    return null;
  });
}

export default function Notizen() {
  const [stand, setStand] = useState(leseStand);
  const [skript, setSkript] = useState(() => skriptStart(leseStand()));
  const { vorspann, rede, anhang } = useMemo(() => teile(inBloecke(skript.markdown)), [skript]);
  const titel = vorspann.find((b) => b.typ === 'h1')?.text ?? 'Speakernotes';
  const abschnitte = useMemo(() => rede.flatMap((b) => (b.typ === 'h2' ? [parseH2(b)] : [])).filter(Boolean), [rede]);
  const zuAbschnitt = useMemo(() => ankerZuAbschnitt(rede), [rede]);
  const rahmen = vorspann.find((b) => b.typ === 'p' && b.text.startsWith(RAHMEN))?.text.slice(RAHMEN.length);
  const vorbereitung = vorspann.find((b) => b.typ === 'liste')?.punkte ?? [];
  const anhangTitel = anhang.find((b) => b.typ === 'h2')?.text ?? 'Zahlen für Rückfragen';

  // Fenstertitel, Farbe des Modus, Adresse nachziehen
  useEffect(() => {
    document.title = `Speakernotes · ${titel.replace(/^Speaker ?notes:\s*/i, '')}`;
  }, [titel]);
  useEffect(() => {
    document.documentElement.dataset.modus = skript.modus;
    const u = new URL(window.location.href);
    if (u.searchParams.get('skript') !== skript.id) {
      u.searchParams.set('skript', skript.id);
      window.history.replaceState(null, '', u);
    }
  }, [skript]);

  // Höhe der festen Kopfzeile: die Sprungziele halten sie frei, auch wenn die
  // Chips in einem schmalen Fenster umbrechen.
  const kopfRef = useRef(null);
  useLayoutEffect(() => {
    const el = kopfRef.current;
    if (!el) return undefined;
    const setze = () => document.documentElement.style.setProperty('--kopf', `${Math.ceil(el.getBoundingClientRect().height)}px`);
    setze();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const beobachter = new ResizeObserver(setze);
    beobachter.observe(el);
    return () => beobachter.disconnect();
  }, []);

  // Schriftgröße
  const [schrift, setSchrift] = useState(() => {
    try { return Number(localStorage.getItem(SCHRIFT_KEY)) || 20; } catch { return 20; }
  });
  useEffect(() => { try { localStorage.setItem(SCHRIFT_KEY, String(schrift)); } catch { /* ohne Speicher weiter */ } }, [schrift]);

  // Timer
  const [laeuft, setLaeuft] = useState(false);
  const [sekunden, setSekunden] = useState(0);
  useEffect(() => {
    if (!laeuft) return undefined;
    const id = window.setInterval(() => setSekunden((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [laeuft]);

  // Dem Arbeitsplatz folgen. Wer in der Adresse ausdrücklich ein Skript nennt,
  // das nicht zum Modus des Arbeitsplatzes gehört, will es lesen: dann folgt
  // das Fenster erst wieder, wenn man es einschaltet.
  const [folgen, setFolgen] = useState(() => {
    const gewaehlt = skriptAusAdresse();
    const s = leseStand();
    return !(gewaehlt && s && skriptFuerModus(s.modus) && gewaehlt.modus !== s.modus);
  });
  const ziel = stand && stand.modus === skript.modus ? stelleAusStand(stand) : null;
  const sprungRef = useRef(0);

  const springe = useCallback((id, sofort = false) => {
    const el = document.getElementById(id);
    if (!el) return;
    sprungRef.current = Date.now();
    el.scrollIntoView({ behavior: sofort ? 'auto' : 'smooth', block: 'start' });
  }, []);

  useEffect(() => {
    const onStorage = (e) => { if (e.key === STAND_KEY) setStand(leseStand()); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Wechselt der Arbeitsplatz den Modus, wechselt das Skript mit.
  useEffect(() => {
    if (!folgen || !stand || stand.modus === skript.modus) return;
    const neu = skriptFuerModus(stand.modus);
    if (neu) setSkript(neu);
  }, [stand, folgen, skript]);

  // Zur Stelle springen, sobald sie wechselt (nicht bei jedem Schreiben des
  // Stands: wer innerhalb einer Stelle weitergelesen hat, bleibt dort). Erst
  // wenn die Schriften geladen sind, sonst verschiebt ihr Nachladen das Ziel.
  const [schriftenDa, setSchriftenDa] = useState(false);
  useEffect(() => {
    let gilt = true;
    const da = () => { if (gilt) setSchriftenDa(true); };
    (document.fonts?.ready ?? Promise.resolve()).then(da, da);
    return () => { gilt = false; };
  }, []);
  // Nach einem Skriptwechsel ohne Gleiten: der Text ist ein anderer, und ein
  // sanfter Sprung direkt nach dem Wechsel ging im Browser gelegentlich verloren.
  const letzteStelle = useRef(null);
  const letztesSkript = useRef(skript.id);
  useEffect(() => {
    if (!schriftenDa) return;
    const neuesSkript = letztesSkript.current !== skript.id;
    letztesSkript.current = skript.id;
    if (!folgen || !ziel) {
      letzteStelle.current = null;
      if (neuesSkript) window.scrollTo(0, 0);
      return;
    }
    const marke = `${skript.id}:${ziel}`;
    if (letzteStelle.current === marke) return;
    letzteStelle.current = marke;
    springe(ziel, neuesSkript);
  }, [schriftenDa, ziel, folgen, skript, springe]);

  // Skript von Hand wählen. Passt es nicht zum Modus des Arbeitsplatzes, hört
  // das Fenster auf zu folgen, sonst wechselte es beim nächsten Klick dort
  // wieder zurück.
  const waehleSkript = (id) => {
    const neu = SKRIPTE.find((s) => s.id === id) ?? SKRIPTE[0];
    setSkript(neu);
    if (stand && skriptFuerModus(stand.modus) && neu.modus !== stand.modus) setFolgen(false);
  };

  // Mausrad des Arbeitsplatzes: an (Standard) scrollt es die Notizen.
  const [rad, setRad] = useState(() => {
    try { return localStorage.getItem(RAD_KEY) !== 'aus'; } catch { return true; }
  });
  const radRef = useRef(rad);
  radRef.current = rad;
  const kanalRef = useRef(null);

  // Kanal zum Arbeitsplatz: Herzschlag senden, Rad-Bewegungen empfangen.
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return undefined;
    const kanal = new BroadcastChannel(NOTIZEN_KANAL);
    kanalRef.current = kanal;
    const sag = (n) => { try { kanal.postMessage(n); } catch { /* Kanal zu */ } };
    const offen = () => sag({ typ: 'offen', rad: radRef.current });
    offen();
    const herz = window.setInterval(offen, HERZSCHLAG_MS);
    kanal.onmessage = (e) => {
      if (e.data?.typ !== 'scroll' || typeof e.data.deltaY !== 'number') return;
      if (Date.now() - sprungRef.current < SPRUNG_SPERRE_MS) return;
      window.scrollBy({ top: e.data.deltaY, behavior: 'auto' });
    };
    const zu = () => sag({ typ: 'zu' });
    window.addEventListener('pagehide', zu);
    return () => {
      window.clearInterval(herz);
      window.removeEventListener('pagehide', zu);
      zu();
      kanal.close();
      kanalRef.current = null;
    };
  }, []);
  // Umschalten sofort melden, nicht erst mit dem nächsten Herzschlag
  useEffect(() => {
    try { localStorage.setItem(RAD_KEY, rad ? 'an' : 'aus'); } catch { /* ohne Speicher weiter */ }
    try { kanalRef.current?.postMessage({ typ: 'offen', rad }); } catch { /* Kanal zu */ }
  }, [rad]);

  // Tastenkürzel: + und − Schrift, T Timer, F Folgen, M Mausrad
  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if (e.key === '+') setSchrift((s) => Math.min(36, s + 2));
      if (e.key === '-') setSchrift((s) => Math.max(14, s - 2));
      if (e.key === 't' || e.key === 'T') setLaeuft((l) => !l);
      if (e.key === 'f' || e.key === 'F') setFolgen((f) => !f);
      if (e.key === 'm' || e.key === 'M') setRad((r) => !r);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const aktiverAbschnitt = ziel ? zuAbschnitt[ziel] : null;
  const folgtTitel = folgen ? 'Folgt dem Arbeitsplatz (F schaltet aus)' : 'Folgt nicht (F schaltet ein)';
  const radTitel = rad
    ? 'Mausrad im Arbeitsplatz scrollt die Notizen, Umschalt + Rad die Seite (M schaltet aus)'
    : 'Mausrad im Arbeitsplatz scrollt die Seite (M schaltet ein)';

  return (
    <>
      <header className="kopf" ref={kopfRef}>
        <div className="kopfZeile">
          <select
            className="skriptWahl"
            value={skript.id}
            // Fokus abgeben: im Auswahlfeld gälten die Tastenkürzel nicht
            onChange={(e) => { waehleSkript(e.target.value); e.target.blur(); }}
            aria-label="Skript wählen"
            title="Skript wählen"
          >
            {SKRIPTE.map((s) => <option key={s.id} value={s.id}>{s.titel}</option>)}
          </select>
          <span className="timer" title="Timer (T startet und pausiert)">{mmss(sekunden)}</span>
          <button type="button" className="knopf" onClick={() => setLaeuft((l) => !l)} aria-label={laeuft ? 'Timer pausieren' : 'Timer starten'} title={laeuft ? 'Timer pausieren (T)' : 'Timer starten (T)'}>
            {laeuft ? <Pause size={15} /> : <Play size={15} />}
          </button>
          <button type="button" className="knopf" onClick={() => { setLaeuft(false); setSekunden(0); }} aria-label="Timer zurücksetzen" title="Timer zurücksetzen">
            <RotateCcw size={15} />
          </button>
          <span className="trenner" />
          <button type="button" className="knopf" onClick={() => setSchrift((s) => Math.max(14, s - 2))} aria-label="Schrift kleiner" title="Schrift kleiner (−)"><Minus size={15} /></button>
          <span className="schriftWert">{schrift}</span>
          <button type="button" className="knopf" onClick={() => setSchrift((s) => Math.min(36, s + 2))} aria-label="Schrift größer" title="Schrift größer (+)"><Plus size={15} /></button>
          <span className="trenner" />
          <button type="button" className="knopf" data-an={folgen || undefined} aria-pressed={folgen} onClick={() => setFolgen((f) => !f)} aria-label={folgtTitel} title={folgtTitel}>
            {folgen ? <Link2 size={15} /> : <Link2Off size={15} />}
          </button>
          <button type="button" className="knopf" data-an={rad || undefined} aria-pressed={rad} onClick={() => setRad((r) => !r)} aria-label={radTitel} title={radTitel}>
            {rad ? <Mouse size={15} /> : <MouseOff size={15} />}
          </button>
          {/* Immer da, damit die Kopfzeile ihre Höhe behält; hervorgehoben, solange
              das Fenster nicht folgt und der Arbeitsplatz an einer Stelle steht. */}
          <button type="button" className="knopf" data-zur-stelle data-ruf={(ziel && !folgen) || undefined} disabled={!ziel} onClick={() => ziel && springe(ziel)} aria-label="Zur aktuellen Stelle" title="Zur aktuellen Stelle des Arbeitsplatzes">
            <LocateFixed size={15} />
          </button>
        </div>
        <nav className="chips" aria-label="Abschnitte">
          {abschnitte.map((a) => (
            <button type="button" key={a.id} className="chip" data-aktiv={aktiverAbschnitt === a.id || undefined} onClick={() => springe(a.id)} title={`${a.titel} (${a.dauer})`}>
              <span className="chipMarke">{a.marke}</span>{a.kurz}
            </button>
          ))}
        </nav>
      </header>

      <main style={{ fontSize: schrift }}>
        <details className="vorspann">
          <summary>Vorbereitung</summary>
          {rahmen && <p>{rahmen}</p>}
          <ul>{vorbereitung.map((p, i) => <li key={i}>{p}</li>)}</ul>
        </details>

        <RedeBloecke bloecke={rede} ziel={ziel} />

        {anhang.length > 0 && (
          <details className="anhang">
            <summary>{anhangTitel}</summary>
            <Anhang bloecke={anhang} />
          </details>
        )}
      </main>
    </>
  );
}
