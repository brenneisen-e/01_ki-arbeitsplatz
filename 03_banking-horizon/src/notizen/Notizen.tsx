import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link2, Link2Off, LocateFixed, Minus, Pause, Play, Plus, RotateCcw } from 'lucide-react'
import { abschnittId, regieAnker, inBloecke, parseH2, saetze, teile, type Abschnitt, type Block } from './parse'
import { HERZSCHLAG_MS, NOTIZEN_KANAL, STAND_KEY, type NotizenNachricht } from './kanal'
import { SKRIPTE, SKRIPT_KEY, skriptStart, type Skript } from './skripte'

// ─────────────────────────────────────────────────────────────────────────────
// Notizfenster (speakernotes.html): die Speakernotes des Vortrags als eigenes
// Browserfenster, das per OS-Werkzeug über andere Bildschirme gelegt wird.
// Dunkel, große Schrift, Sätze als Stichpunkte, Timer, Schriftgröße, Sprung-
// chips je Abschnitt. Folgt dem Strukturbild: BankExplorer schreibt seinen
// Stand (Kapitel, Schritt, Einstiegsbühne) nach localStorage, das storage-
// Ereignis kommt hier an und scrollt zur passenden Stelle. Das Mausrad im
// Strukturbild scrollt die Notizen mit (BroadcastChannel, wie in EikeCase);
// kurz nach einem Sprung werden Rad-Nachrichten verworfen, damit der Sprung
// nicht gleich wieder überschrieben wird. Mehrere Skripte (skripteListe.ts):
// Auswahl über ?skript= in der Adresse (so öffnet das Menü am Deloitte-Logo
// gezielt eines) oder den Umschalter im Kopf; die Wahl bleibt in localStorage.
// Nur das Skript zum Strukturbild folgt der Navigation.
// ─────────────────────────────────────────────────────────────────────────────

const TEXTE = {
  de: {
    vorbereitung: 'Vorbereitung', anhang: 'Zahlen für Rückfragen', rahmen: 'Rahmen: ', zurStelle: 'Zur aktuellen Stelle',
    skript: 'Skript wählen', folgt: 'Folgt dem Strukturbild (F schaltet aus)', folgtNicht: 'Folgt nicht (F schaltet ein)',
    timer: 'Timer (T startet und pausiert)', kleiner: 'Schrift kleiner (−)', groesser: 'Schrift größer (+)', fenster: 'Speakernotes',
  },
  en: {
    vorbereitung: 'Preparation', anhang: 'Facts for questions', rahmen: 'Frame: ', zurStelle: 'Back to the current spot',
    skript: 'Choose script', folgt: 'Follows the structure view (F turns off)', folgtNicht: 'Not following (F turns on)',
    timer: 'Timer (T starts and pauses)', kleiner: 'Smaller type (−)', groesser: 'Larger type (+)', fenster: 'Speaker notes',
  },
}

const SCHRIFT_KEY = 'bh-notizen-schrift'
const SPRUNG_SPERRE_MS = 1200

type Stand = { kapitel: string | null; step: number; einstieg: boolean }

function zielAusStand(s: Stand | null): string | null {
  if (!s) return null
  // Übersicht: Vorstellung und der Anfang der Bühne laufen dort noch; der
  // Klick ins Kapitel (Einstiegsbühne) springt zur Regieanweisung dafür.
  if (s.kapitel === null) return 'vorstellung'
  if (s.kapitel !== 'vertrieb') return null
  if (s.einstieg) return document.getElementById('einstieg-buehne') ? 'einstieg-buehne' : 'einstieg'
  if (s.step === 0) return 'studie'
  if (s.step >= 1 && s.step <= 3) return `hypothese-${s.step}`
  if (s.step === 4) return 'demo'
  return 'schluss'
}

function mmss(s: number): string {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

const ZAHL = /(\d[\d.,]*(?: (?:bis|to) \d[\d.,]*)? (?:Prozent|Euro|Bankkunden|percent|euros|clients))/

function Fett({ text }: { text: string }): React.ReactElement {
  const stuecke = text.split(ZAHL)
  return <>{stuecke.map((t, i) => (i % 2 ? <b key={i}>{t}</b> : t))}</>
}

function Rede({ text }: { text: string }): React.ReactElement {
  return (
    <ul className="rede">
      {saetze(text).map((s, i) => (
        <li key={i}><Fett text={s} /></li>
      ))}
    </ul>
  )
}

function RedeBloecke({ bloecke }: { bloecke: Block[] }): React.ReactElement {
  const out: React.ReactElement[] = []
  let key = 0
  for (const b of bloecke) {
    if (b.typ === 'h2') {
      const a = parseH2(b.text)
      out.push(
        <h2 key={key++} id={a?.id ?? abschnittId(b.text)}>
          {a?.marke && <span className="marke">{a.marke}</span>}
          <span>{a?.titel ?? b.text}</span>
          {a?.dauer && <span className="dauer">{a.dauer}</span>}
        </h2>,
      )
      continue
    }
    if (b.typ !== 'p') continue
    const t = b.text
    if (/^\[[^\]]*\]$/.test(t)) {
      out.push(<p key={key++} id={regieAnker(t) ?? undefined} className="regie">{t.slice(1, -1)}</p>)
      continue
    }
    const m = t.match(/^\[([^\]]*)\]\s*(.+)$/)
    if (m) {
      const optional = /^Optional/i.test(m[1])
      out.push(
        <div key={key++} className={`kasten${optional ? ' optional' : ''}`}>
          <span className="etikett">{m[1].replace(/[.:]$/, '')}</span>
          <Rede text={m[2]} />
        </div>,
      )
      continue
    }
    if (/^Die (erste|zweite|dritte) Hypothese:/.test(t)) {
      out.push(<p key={key++} className="titel">{t}</p>)
      continue
    }
    out.push(<Rede key={key++} text={t} />)
  }
  return <>{out}</>
}

function Anhang({ bloecke }: { bloecke: Block[] }): React.ReactElement {
  return (
    <>
      {bloecke.map((b, i) => {
        if (b.typ === 'h2') return null
        if (b.typ === 'p') return <p key={i}>{b.text}</p>
        if (b.typ === 'liste') {
          return (
            <ul key={i} className="quellen">
              {b.punkte.map((p, j) => (
                <li key={j}>{/^https?:\/\//.test(p) ? <a href={p} target="_blank" rel="noopener noreferrer">{p}</a> : p}</li>
              ))}
            </ul>
          )
        }
        if (b.typ === 'tabelle') {
          const [kopf, ...zeilen] = b.zeilen
          return (
            <table key={i} className="zahlen">
              <thead><tr>{kopf.map((c, j) => <th key={j}>{c}</th>)}</tr></thead>
              <tbody>{zeilen.map((r, j) => <tr key={j}>{r.map((c, k) => <td key={k}>{c}</td>)}</tr>)}</tbody>
            </table>
          )
        }
        return null
      })}
    </>
  )
}

export function Notizen(): React.ReactElement {
  const [skript, setSkript] = useState<Skript>(skriptStart)
  const T = TEXTE[skript.sprache]
  const { vorspann, rede, anhang } = useMemo(() => teile(inBloecke(skript.markdown)), [skript])
  const titel = vorspann.find((b): b is { typ: 'h1'; text: string } => b.typ === 'h1')?.text ?? T.fenster
  const abschnitte = useMemo(
    () => rede.flatMap((b) => (b.typ === 'h2' ? [parseH2(b.text)] : [])).filter((a): a is Abschnitt => a !== null),
    [rede],
  )
  const rahmen = vorspann.find((b): b is { typ: 'p'; text: string } => b.typ === 'p' && b.text.startsWith(T.rahmen))?.text.slice(T.rahmen.length)
  const vorbereitung = vorspann.find((b): b is { typ: 'liste'; punkte: string[] } => b.typ === 'liste')?.punkte ?? []

  useEffect(() => { document.title = `${T.fenster} · ${titel.replace(/^Speaker ?notes(?: Vortrag)?:\s*/i, '')}` }, [titel, T.fenster])
  // Wahl merken, Adresse nachziehen, oben anfangen
  useEffect(() => {
    try { localStorage.setItem(SKRIPT_KEY, skript.id) } catch { /* ohne Speicher weiter */ }
    const u = new URL(window.location.href)
    if (u.searchParams.get('skript') !== skript.id) {
      u.searchParams.set('skript', skript.id)
      window.history.replaceState(null, '', u)
      window.scrollTo(0, 0)
    }
  }, [skript])

  // Schriftgröße
  const [schrift, setSchrift] = useState(() => {
    try { return Number(localStorage.getItem(SCHRIFT_KEY)) || 20 } catch { return 20 }
  })
  useEffect(() => { try { localStorage.setItem(SCHRIFT_KEY, String(schrift)) } catch { /* ohne Speicher weiter */ } }, [schrift])

  // Timer
  const [laeuft, setLaeuft] = useState(false)
  const [sekunden, setSekunden] = useState(0)
  useEffect(() => {
    if (!laeuft) return
    const id = window.setInterval(() => setSekunden((s) => s + 1), 1000)
    return () => window.clearInterval(id)
  }, [laeuft])

  // Dem Strukturbild folgen
  const [folgen, setFolgen] = useState(true)
  const folgenRef = useRef(folgen)
  folgenRef.current = folgen
  const [ziel, setZiel] = useState<string | null>(null)
  const [abweichung, setAbweichung] = useState(false)
  const sprungRef = useRef(0)

  const springe = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    sprungRef.current = Date.now()
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setAbweichung(false)
  }, [])

  // Kanal zum Strukturbild: Herzschlag senden, Rad-Bewegungen empfangen.
  useEffect(() => {
    const kanal = new BroadcastChannel(NOTIZEN_KANAL)
    const sag = (n: NotizenNachricht) => { try { kanal.postMessage(n) } catch { /* Kanal zu */ } }
    sag({ typ: 'offen' })
    const herz = window.setInterval(() => sag({ typ: 'offen' }), HERZSCHLAG_MS)
    kanal.onmessage = (e: MessageEvent<NotizenNachricht>) => {
      if (e.data?.typ !== 'scroll') return
      if (Date.now() - sprungRef.current < SPRUNG_SPERRE_MS) return
      window.scrollBy({ top: e.data.deltaY, behavior: 'auto' })
    }
    const zu = () => sag({ typ: 'zu' })
    window.addEventListener('pagehide', zu)
    return () => {
      window.clearInterval(herz)
      window.removeEventListener('pagehide', zu)
      zu()
      kanal.close()
    }
  }, [])

  useEffect(() => {
    const lesen = (): Stand | null => {
      try {
        const r = localStorage.getItem(STAND_KEY)
        return r ? (JSON.parse(r) as Stand) : null
      } catch { return null }
    }
    const anwenden = (s: Stand | null) => {
      const z = zielAusStand(s)
      if (!z) return
      setZiel(z)
      if (!folgenRef.current) { setAbweichung(true); return }
      springe(z)
    }
    if (!skript.folgtStrukturbild) { setZiel(null); setAbweichung(false); return }
    anwenden(lesen())
    const onStorage = (e: StorageEvent) => { if (e.key === STAND_KEY) anwenden(lesen()) }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [springe, skript])

  // Tastenkürzel: + und − Schrift, T Timer, F Folgen
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === '+') setSchrift((s) => Math.min(36, s + 2))
      if (e.key === '-') setSchrift((s) => Math.max(14, s - 2))
      if (e.key === 't' || e.key === 'T') setLaeuft((l) => !l)
      if (e.key === 'f' || e.key === 'F') setFolgen((f) => !f)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const aktiv = (a: Abschnitt) => ziel !== null && (ziel === a.id || (a.id === 'hypothesen' && ziel.startsWith('hypothese-')) || (a.id === 'einstieg' && ziel === 'einstieg-buehne'))

  return (
    <>
      <header className="kopf">
        <div className="kopfZeile">
          <select
            className="skriptWahl"
            value={skript.id}
            onChange={(e) => setSkript(SKRIPTE.find((s) => s.id === e.target.value) ?? SKRIPTE[0])}
            aria-label={T.skript}
            title={T.skript}
          >
            {SKRIPTE.map((s) => <option key={s.id} value={s.id}>{s.titel}</option>)}
          </select>
          <span className="timer" title={T.timer}>{mmss(sekunden)}</span>
          <button type="button" className="knopf" onClick={() => setLaeuft((l) => !l)} aria-label={laeuft ? 'Timer pausieren' : 'Timer starten'} title={laeuft ? 'Timer pausieren (T)' : 'Timer starten (T)'}>
            {laeuft ? <Pause size={15} /> : <Play size={15} />}
          </button>
          <button type="button" className="knopf" onClick={() => { setLaeuft(false); setSekunden(0) }} aria-label="Timer zurücksetzen" title="Timer zurücksetzen">
            <RotateCcw size={15} />
          </button>
          <span className="trenner" />
          <button type="button" className="knopf" onClick={() => setSchrift((s) => Math.max(14, s - 2))} aria-label={T.kleiner} title={T.kleiner}><Minus size={15} /></button>
          <span className="schriftWert">{schrift}</span>
          <button type="button" className="knopf" onClick={() => setSchrift((s) => Math.min(36, s + 2))} aria-label={T.groesser} title={T.groesser}><Plus size={15} /></button>
          {skript.folgtStrukturbild && (<>
            <span className="trenner" />
            <button type="button" className="knopf" data-an={folgen || undefined} onClick={() => setFolgen((f) => !f)} aria-label={T.folgt} title={folgen ? T.folgt : T.folgtNicht}>
              {folgen ? <Link2 size={15} /> : <Link2Off size={15} />}
            </button>
            {ziel && abweichung && (
              <button type="button" className="knopf zurStelle" onClick={() => springe(ziel)}>
                <LocateFixed size={14} /> {T.zurStelle}
              </button>
            )}
          </>)}
        </div>
        <nav className="chips" aria-label="Abschnitte">
          {abschnitte.map((a) => (
            <button type="button" key={a.id} className="chip" data-aktiv={aktiv(a) || undefined} onClick={() => springe(a.id)} title={`${a.titel} (${a.dauer})`}>
              <span className="chipMarke">{a.marke}</span>{a.kurz}
            </button>
          ))}
        </nav>
      </header>

      <main style={{ fontSize: schrift }}>
        <details className="vorspann">
          <summary>{T.vorbereitung}</summary>
          {rahmen && <p>{rahmen}</p>}
          <ul>{vorbereitung.map((p, i) => <li key={i}>{p}</li>)}</ul>
        </details>

        <RedeBloecke bloecke={rede} />

        <details className="anhang">
          <summary>{T.anhang}</summary>
          <Anhang bloecke={anhang} />
        </details>
      </main>
    </>
  )
}
