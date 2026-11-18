/**
 * Präsentationsmodus der Angebotsstrecke.
 *
 * Führt die Strecke an einem einzelnen Eingang vor, Schritt für Schritt und
 * bildschirmfüllend:
 *
 *   1  E-Mail-Eingang     das Postfach, eine Anfrage trifft ein, Problem und Lösung
 *   2  KI liest           das Original links, rechts entsteht Feld für Feld das
 *                         Deckblatt; die Fundstelle im Original leuchtet mit
 *   3  KI-Deckblatt       das fertige Blatt in der Reihenfolge der Erfassung
 *   4  Prüfung            was fehlt, was nachzuschlagen ist, was auffällt
 *   5  Nächster Schritt   Rückfrage, Erfassung oder Fachspezialist – mit Freigabe
 *   6  Alle Eingänge      derselbe Weg für das ganze Postfach
 *
 * Oben rechts lässt sich der Eingang wechseln: die Beispielanfragen und
 * die synthetischen Eingänge laufen durch dieselben Szenen.
 *
 * Innerhalb einer Szene laufen die Animationen von selbst (Phasen mit festen
 * Zeiten). Von Szene zu Szene geht es per Klick, Leertaste oder Pfeiltaste.
 * Ein Klick während der Animation springt zuerst an ihr Ende.
 */

import { Fragment, useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { clsx } from 'clsx'
import {
  X, ChevronLeft, ChevronRight, Maximize2, Minimize2, Inbox, Mail, Paperclip, Sparkles,
  AlertTriangle, Lightbulb, ArrowRight, Check, Minus, CheckCircle2, FileText, Loader2,
  RotateCcw, Search, Send, Archive, FolderOpen, ListChecks, TextSearch, UserCheck, Columns2,
  Database, MailQuestion, Keyboard, Bot, FileSpreadsheet, Play, LocateFixed, MousePointer2
} from 'lucide-react'
import { VORGAENGE, BEISPIELE, DEMO_VORGANG_ID, herkunft } from '../daten/vorgaenge'
import { pruefe, auswertung, STUFEN } from '../utils/pruefengine'
import { baueVerknuepfung } from '../utils/feldinfo'
import { feld, feldfolge, layoutVon, abschnitteFuer } from '../utils/layouts'
import { quelleLang } from '../utils/markierung'
import { baueRueckfrage } from '../utils/rueckfrage'
import { PROZESS } from '../utils/prozess'
import { ERGEBNIS, ERGEBNIS_FOLGE, PRUEF_STATUS } from '../utils/ergebnis'
import { begriffe } from '../utils/branding'
import { BeispielNummer } from './Bausteine'
import { rolleZu, findeMarke } from '../utils/rollen'
import { auszug } from './Bausteine'
import Deckblatt from './Deckblatt'
import Dokument from './Dokument'
import { originalseiten } from '../utils/originalbild'
import Legende from './Legende'

// ============================================================
// Hilfen
// ============================================================

/**
 * Läuft die Phasen einer Szene ab: `dauern[i]` ist die Zeit von Phase i nach
 * i+1. Ein Wechsel des Schlüssels beginnt von vorn.
 */
function useAblauf(dauern, schluessel) {
  const [phase, setPhase] = useState(0)
  const timer = useRef([])

  const stopp = useCallback(() => {
    timer.current.forEach(clearTimeout)
    timer.current = []
  }, [])

  useEffect(() => {
    setPhase(0)
    let summe = 0
    timer.current = dauern.map((ms, i) => {
      summe += ms
      return setTimeout(() => setPhase(i + 1), summe)
    })
    return stopp
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schluessel])

  const fertig = phase >= dauern.length
  const abschliessen = useCallback(() => { stopp(); setPhase(dauern.length) }, [stopp, dauern.length])
  return { phase, fertig, abschliessen }
}

/** Zählt von 0 bis zum Ziel hoch, sobald `aktiv` ist. */
function useZaehler(ziel, aktiv, dauer = 2400) {
  const [wert, setWert] = useState(0)
  useEffect(() => {
    if (!aktiv) { setWert(0); return }
    let raf
    const start = performance.now()
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dauer)
      setWert(Math.round(ziel * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [ziel, aktiv, dauer])
  return wert
}

function initialen(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(t => t[0].toUpperCase()).join('')
}

/** Höhe der großen Tafeln einer Szene: Bildschirm abzüglich Kopf, Szenentitel und Fuß. */
const TAFELHOEHE = { height: 'calc(100vh - 16.6rem)', minHeight: '22rem' }

function Hinweisbox({ Icon, titel, kinder, ton = 'neutral', sichtbar, className = '' }) {
  const toene = {
    neutral: { rahmen: 'border-slate-200 bg-white', kreis: 'bg-slate-100 text-slate-600' },
    problem: { rahmen: 'border-amber-200 bg-amber-50', kreis: 'bg-amber-100 text-amber-700' },
    loesung: { rahmen: 'bg-white', kreis: 'text-white' }
  }
  const t = toene[ton]
  return (
    <div className={clsx('rounded-2xl border-2 p-4 transition-all duration-500', t.rahmen,
      sichtbar ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none', className)}
      style={ton === 'loesung' ? { borderColor: 'var(--mode-primary-light)' } : undefined}>
      <div className="flex items-center gap-3">
        <span className={clsx('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', t.kreis)}
          style={ton === 'loesung' ? { backgroundColor: 'var(--mode-primary-light)' } : undefined}>
          <Icon size={22} strokeWidth={1.75} />
        </span>
        <span className="text-xl font-semibold text-slate-900 leading-tight">{titel}</span>
      </div>
      <div className="mt-3">{kinder}</div>
    </div>
  )
}

// ============================================================
// Szene 1 – E-Mail-Eingang
// ============================================================

function Postfachzeile({ vorgang, neu, gelesen, kompakt, ausgewaehlt, onClick }) {
  const { mail } = vorgang
  return (
    <div
      onClick={onClick}
      className={clsx('flex items-center gap-3 px-4 py-3 border-b border-slate-100 transition-colors duration-300 cursor-pointer',
        neu && 'animate-mail-eingang', ausgewaehlt && !neu ? 'bg-slate-100' : !neu && 'hover:bg-slate-50')}
      style={{ backgroundColor: neu ? 'var(--mode-pastel)' : undefined }}>
      <span className="w-2 shrink-0 flex justify-center">
        {!gelesen && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--mode-primary-light)' }} />}
      </span>
      <span className={clsx('w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0', gelesen ? 'bg-slate-100 text-slate-500' : 'text-white')}
        style={!gelesen ? { backgroundColor: 'var(--mode-primary)' } : undefined}>
        {initialen(mail.vonName)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className={clsx('text-base truncate', gelesen ? 'text-slate-600' : 'font-semibold text-slate-900')}>{mail.vonName}</span>
          {neu && (
            <span className="text-2xs uppercase tracking-wide px-1.5 py-0.5 rounded text-white shrink-0" style={{ backgroundColor: 'var(--mode-primary-light)' }}>Neu</span>
          )}
        </span>
        <span className={clsx('block text-sm truncate', gelesen ? 'text-slate-500' : 'text-slate-800 font-medium')}>{mail.betreff}</span>
        {!kompakt && <span className="block text-xs text-slate-400 truncate">{auszug(mail.vorschau, 110)}</span>}
      </span>
      <span className="shrink-0 flex flex-col items-end gap-1">
        <span className={clsx('font-mono', kompakt ? 'text-2xs' : 'text-xs', gelesen ? 'text-slate-400' : 'text-slate-700')}>{vorgang.eingang}</span>
        {mail.anhaenge.length > 0 && <Paperclip size={13} className="text-slate-400" />}
      </span>
    </div>
  )
}

function Lesebereich({ vorgang }) {
  const { mail } = vorgang
  const dok = vorgang.dokumente[0]
  return (
    <div className="h-full overflow-y-auto animate-fade-in bg-slate-100">
      <div className="px-6 py-4 border-b border-slate-200 bg-white">
        <div className="text-xl font-semibold text-slate-900 leading-snug">{mail.betreff}</div>
        <div className="mt-3 flex items-center gap-3">
          <span className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white shrink-0"
            style={{ backgroundColor: 'var(--mode-primary)' }}>{initialen(mail.vonName)}</span>
          <span className="min-w-0 text-sm">
            <span className="block text-slate-900 font-medium">{mail.vonName} <span className="text-slate-400 font-normal">&lt;{mail.von}&gt;</span></span>
            <span className="block text-slate-500">An: {mail.an} · {vorgang.eingang}, {vorgang.uhrzeit} Uhr</span>
          </span>
        </div>
        {mail.anhaenge.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {mail.anhaenge.map(a => (
              <span key={a.name} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700">
                <FileText size={14} className="text-slate-500" /> {a.name} <span className="text-slate-400">· {a.typ}</span>
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="p-5">
        <Dokument dok={dok} info={{}} markierung={{ an: false }} seitenbilder={originalseiten(vorgang)} />
      </div>
    </div>
  )
}

/** Was sonst im Postfach liegt: die übrigen Eingänge, neueste zuerst. */
function useVorhandene(vorgang) {
  return useMemo(() => VORGAENGE.filter(v => v.id !== vorgang.id).slice(0, 9), [vorgang])
}

/** Das Mailprogramm: Ordner, Liste, auf Wunsch die neue Mail und der Lesebereich. */
function Postfach({ vorgang, vorhandene, neu, offen }) {
  const B = begriffe()
  // Welche Mail im Lesebereich steht: beim automatischen Öffnen die neue,
  // per Klick jede andere. Die Strecke danach läuft trotzdem mit der neuen Mail.
  const [gewaehlt, setGewaehlt] = useState(null)
  useEffect(() => { setGewaehlt(offen ? vorgang.id : null) }, [offen, vorgang])
  const zeigt = gewaehlt === null ? null
    : gewaehlt === vorgang.id ? vorgang
    : vorhandene.find(v => v.id === gewaehlt) || null
  const lesebereich = zeigt !== null

  const ordner = [
    { Icon: Inbox, label: 'Posteingang', anzahl: vorhandene.length + (neu ? 1 : 0), aktiv: true },
    { Icon: FolderOpen, label: 'Rückfrage offen', anzahl: 7 },
    { Icon: FolderOpen, label: 'Fachspezialisten', anzahl: 3 },
    { Icon: Send, label: 'Gesendet' },
    { Icon: Archive, label: 'Archiv' }
  ]

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col relative" style={TAFELHOEHE}>
      <div className="px-5 py-3 border-b border-slate-200 flex items-center gap-4 bg-slate-50 shrink-0">
        <span className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <Mail size={16} className="text-slate-500" /> {B.postfach}
        </span>
        <span className="ml-auto flex items-center gap-2 text-sm text-slate-400 border border-slate-200 rounded-lg px-3 py-1.5 bg-white w-72">
          <Search size={14} /> Postfach durchsuchen
        </span>
      </div>

      <div className="flex-1 min-h-0 grid transition-[grid-template-columns] duration-500"
        style={{ gridTemplateColumns: lesebereich ? '11.5rem 19rem minmax(0,1fr)' : '11.5rem minmax(0,1fr) 0px' }}>
        <div className="border-r border-slate-200 bg-slate-50/60 py-3 overflow-hidden">
          {ordner.map(o => (
            <div key={o.label} className={clsx('flex items-center gap-2.5 px-4 py-2 text-sm',
              o.aktiv ? 'font-semibold text-slate-900 bg-white border-y border-slate-200' : 'text-slate-600')}>
              <o.Icon size={15} className={o.aktiv ? 'text-slate-700' : 'text-slate-400'} />
              <span className="truncate">{o.label}</span>
              {o.anzahl != null && (
                <span className={clsx('ml-auto text-xs font-mono', o.aktiv ? 'text-white px-1.5 py-0.5 rounded-full' : 'text-slate-400')}
                  style={o.aktiv ? { backgroundColor: 'var(--mode-primary-light)' } : undefined}>{o.anzahl}</span>
              )}
            </div>
          ))}
        </div>

        <div className={clsx('overflow-y-auto', lesebereich && 'border-r border-slate-200')}>
          {neu && (
            <Postfachzeile key={vorgang.id} vorgang={vorgang} neu gelesen={false} kompakt={lesebereich}
              ausgewaehlt={gewaehlt === vorgang.id} onClick={() => setGewaehlt(vorgang.id)} />
          )}
          {vorhandene.map(v => (
            <Postfachzeile key={v.id} vorgang={v} gelesen kompakt={lesebereich}
              ausgewaehlt={gewaehlt === v.id} onClick={() => setGewaehlt(v.id)} />
          ))}
        </div>
        <div className="min-h-0 overflow-hidden">
          {zeigt && <Lesebereich key={zeigt.id} vorgang={zeigt} />}
        </div>
      </div>

      {neu && !lesebereich && (
        <div className="absolute bottom-5 right-5 animate-slide-in rounded-xl border border-slate-200 bg-white shadow-xl px-4 py-3 flex items-center gap-3 max-w-md">
          <span className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0" style={{ backgroundColor: 'var(--mode-primary-light)' }}>
            <Mail size={17} />
          </span>
          <span className="min-w-0">
            <span className="block text-xs uppercase tracking-wide text-slate-400">Neue E-Mail</span>
            <span className="block text-sm font-semibold text-slate-900 truncate">{vorgang.mail.vonName}</span>
            <span className="block text-sm text-slate-600 truncate">{vorgang.mail.betreff}</span>
          </span>
        </div>
      )}
    </div>
  )
}

/** Startseite der Präsentation: das Postfach in Ruhe, alle Mails lassen sich ansehen. */
function Startseite({ vorgang }) {
  const vorhandene = useVorhandene(vorgang)
  return <Postfach vorgang={vorgang} vorhandene={vorhandene} neu={false} offen={false} />
}

function SzeneEingang({ vorgang, phase, weiter }) {
  const B = begriffe()
  const vorhandene = useVorhandene(vorgang)
  const punkt = 'flex gap-2'
  const strich = <Minus size={18} className="text-amber-500 shrink-0 mt-0.5" />

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_23rem] gap-6">
      <Postfach vorgang={vorgang} vorhandene={vorhandene} neu={phase >= 1} offen={phase >= 2} />

      <div className="flex flex-col gap-4 justify-center">
        <Hinweisbox
          Icon={AlertTriangle} ton="problem" sichtbar={phase >= 3}
          titel="Problem: Jede Anfrage sieht anders aus"
          kinder={(
            <ul className="space-y-2 text-[0.85rem] leading-snug text-slate-700">
              <li className={punkt}>{strich} Freitext, weitergeleiteter Verlauf, Formular einer Plattform oder Scan</li>
              <li className={punkt}>{strich} Die Angaben stehen an fünf oder sechs Stellen: im Betreff, im Text, in der Signatur, in einer älteren Mail, im Anhang</li>
              <li className={punkt}>{strich} Ein Formular lässt sich nicht erzwingen: Vermittler bleiben bei der E-Mail</li>
              <li className={clsx(punkt, 'font-medium text-slate-900')}>{strich} Bisher: lesen, strukturieren, {B.imSystem} abtippen, bei Lücken zurückfragen und warten</li>
            </ul>
          )}
        />
        <Hinweisbox
          Icon={Lightbulb} ton="loesung" sichtbar={phase >= 4}
          titel="Lösung: Die KI liest, der Mensch entscheidet"
          kinder={(
            <>
              <p className="text-[0.85rem] text-slate-700 leading-snug">
                Die KI liest Mail und Anhänge, legt ein Deckblatt in der Reihenfolge der Erfassung an und formuliert
                die Rückfrage vor. Für jeden Wert ist zu sehen, wo er im Original steht.
              </p>
              <button onClick={weiter}
                className="mt-3 w-full px-4 py-2.5 rounded-xl text-base font-medium text-white flex items-center justify-center gap-2 whitespace-nowrap"
                style={{ backgroundColor: 'var(--mode-primary-light)' }}>
                <Sparkles size={18} /> Anfrage lesen lassen <ArrowRight size={18} />
              </button>
            </>
          )}
        />
      </div>
    </div>
  )
}

// ============================================================
// Szene 2 – KI liest
// ============================================================

// Die Art eines Punktes steht als Wort im Chip, in der Farbe der Fundstelle (keine Farbleiste an der Zeile).
const ART_STIL = {
  gelesen: { chip: 'bg-yellow-100 text-yellow-900', wort: 'gelesen' },
  interpretiert: { chip: 'bg-violet-100 text-violet-900', wort: 'interpretiert' },
  auffaellig: { chip: 'bg-orange-100 text-orange-900', wort: 'Auffälligkeit' },
  fehlt: { chip: 'bg-red-100 text-red-800', wort: 'fehlt' },
  recherche: { chip: 'bg-sky-100 text-sky-800', wort: 'Recherche' }
}

/** Was die KI vor den Augen des Publikums liest, in der Reihenfolge des Deckblatts. */
function baueLeseliste(vorgang, verknuepfung) {
  const { info, fundstellen } = verknuepfung
  const abschnitte = abschnitteFuer(vorgang)
  const titelZu = (nr) => nr === '' ? 'Einordnung und Vermittler'
    : `${nr}) ${abschnitte.find(a => a.nr === nr)?.titel || ''}`
  const liste = []

  for (const key of feldfolge(vorgang)) {
    const i = info[key]
    const ba = (vorgang.betriebsarten || []).find(b => b.key === key)
    const rf = (vorgang.risikofragen || []).find(r => r.key === key)
    let e
    if (ba) e = { label: 'Betriebsart', wert: i.wert, art: 'interpretiert', herleitung: ba.begruendung }
    else if (rf) e = { label: rf.frage, wert: rf.antwort, art: 'gelesen' }
    else {
      const f = feld(vorgang, key)
      if (f.art === 'leer') continue
      e = { label: f.label, wert: f.wert, art: f.art, herleitung: f.herleitung }
    }
    liste.push({ key, gruppe: titelZu(i.nr), stelle: fundstellen[key]?.[0] || null, anzahlStellen: fundstellen[key]?.length || 0, ...e })
  }
  for (const a of vorgang.auffaelligkeiten || []) {
    liste.push({ key: a.key, gruppe: 'Auffälligkeiten', label: a.titel, wert: '', art: 'auffaellig', herleitung: a.text, stelle: fundstellen[a.key]?.[0] || null, anzahlStellen: fundstellen[a.key]?.length || 0 })
  }
  return liste
}

function dauernLesen(anzahl) {
  const jeFeld = anzahl > 34 ? 240 : anzahl > 22 ? 300 : 380
  return [900, ...Array.from({ length: anzahl }, () => jeFeld), 700]
}

// So lange ruht der Zeiger auf einem Punkt oder einer Fundstelle, bevor der Blick dorthin wechselt.
const RUHE_MS = 110

// Was der Hinweis im Kopf des Originals sagt, wenn ein Punkt keine Fundstelle hat.
const OHNE_FUNDSTELLE = {
  fehlt: 'Steht nicht im Eingang',
  recherche: 'Steht nicht im Eingang, wird im eigenen Haus nachgeschlagen',
  auffaellig: 'Betrifft den Eingang als Ganzes'
}

function SzeneLesen({ vorgang, verknuepfung, liste, phase }) {
  const links = useRef(null)
  const rechts = useRef(null)
  const gelesen = Math.max(0, Math.min(phase - 1, liste.length))
  const laeuft = phase >= 1 && gelesen < liste.length
  const aktuell = laeuft ? liste[gelesen] : null
  const fertig = phase > liste.length
  const sichtbar = useMemo(() => new Set(liste.slice(0, gelesen).map(e => e.key)), [liste, gelesen])

  // Das Dokument, in dem die KI gerade liest (Mail oder Anhang).
  const [dokNr, setDokNr] = useState(0)
  useEffect(() => { setDokNr(0) }, [vorgang])
  useEffect(() => {
    if (aktuell?.stelle && aktuell.stelle.dokNr !== dokNr) setDokNr(aktuell.stelle.dokNr)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aktuell])

  // Original und Liste folgen dem Feld, das gerade gelesen wird.
  useEffect(() => {
    if (!aktuell) return
    const t = setTimeout(() => {
      rolleZu(findeMarke(links.current, aktuell.key), { anteil: 0.3 })
      rolleZu(rechts.current?.querySelector(`[data-lesezeile="${CSS.escape(aktuell.key)}"]`), { anteil: 0.45 })
    }, 30)
    return () => clearTimeout(t)
  }, [aktuell, dokNr])

  // Ist alles gelesen, zeigt der Mauszeiger die Verbindung. Wer in der Liste einen Punkt überfährt, sieht
  // im Original die Fundstelle: Das Blatt rollt weich dorthin, die übrigen Markierungen treten zurück.
  // Der Blick bleibt stehen, bis der Zeiger auf einem anderen Punkt ruht oder beide Tafeln verlässt – so
  // lässt sich mit der Maus hinüberwandern und auf die Stelle zeigen. Wer umgekehrt im Original eine
  // Fundstelle überfährt, sieht in der Liste den Punkt dazu. Während die KI liest, führt die Animation.
  const [blick, setBlick] = useState(null) // Punkt der Liste, dessen Fundstelle im Blick ist
  const [schwebe, setSchwebe] = useState(null) // Fundstelle im Original unter dem Zeiger
  // Erst wenn der Zeiger kurz ruht, wechselt der Blick: Wer nur über Liste oder Blatt streicht, löst nichts aus.
  const absicht = useRef({ liste: null, original: null })
  const ohneAbsicht = () => { clearTimeout(absicht.current.liste); clearTimeout(absicht.current.original) }
  useEffect(() => ohneAbsicht, [])
  // Neuer Eingang oder neuer Lesedurchlauf: Der Blick beginnt leer.
  useEffect(() => { ohneAbsicht(); setBlick(null); setSchwebe(null) }, [vorgang, fertig])

  const aufPunkt = (key, sofort = false) => {
    clearTimeout(absicht.current.liste)
    if (sofort) setBlick(key)
    else absicht.current.liste = setTimeout(() => setBlick(key), RUHE_MS)
  }
  // Ein Punkt ohne Fundstelle hält den Blick nicht fest: Es gibt im Original nichts zu zeigen.
  const vomPunkt = (key, haelt) => {
    clearTimeout(absicht.current.liste)
    if (!haelt) setBlick(b => (b === key ? null : b))
  }
  const ausDenTafeln = () => { ohneAbsicht(); setBlick(null); setSchwebe(null) }
  const vonOriginal = useCallback((key, art) => {
    if (art !== 'hover') return
    clearTimeout(absicht.current.original)
    if (key) absicht.current.original = setTimeout(() => setSchwebe(key), RUHE_MS)
    else setSchwebe(null)
  }, [])

  const blickEintrag = fertig && blick ? liste.find(e => e.key === blick) || null : null
  const blickStelle = blickEintrag?.stelle || null
  const schwebeKey = fertig ? schwebe : null
  const gezeigtKey = schwebeKey || blickEintrag?.key || null
  const imFokus = !schwebeKey && Boolean(blickStelle)

  const blickKey = blickStelle ? blickEintrag.key : null
  const blickDokNr = blickStelle ? blickStelle.dokNr : null
  useEffect(() => {
    if (!blickKey) return
    // Steht die Fundstelle im anderen Dokument (Mail oder Anhang), erst dorthin wechseln.
    if (blickDokNr !== dokNr) { setDokNr(blickDokNr); return }
    const t = setTimeout(() => rolleZu(findeMarke(links.current, blickKey), { anteil: 0.3 }), 30)
    return () => clearTimeout(t)
  }, [blickKey, blickDokNr, dokNr])

  useEffect(() => {
    if (!schwebeKey) return
    const t = setTimeout(() => rolleZu(rechts.current?.querySelector(`[data-lesezeile="${CSS.escape(schwebeKey)}"]`), { anteil: 0.4 }), 30)
    return () => clearTimeout(t)
  }, [schwebeKey])

  const zaehle = (art) => liste.slice(0, gelesen).filter(e => e.art === art).length
  const anteil = Math.round((gelesen / liste.length) * 100)
  const dok = vorgang.dokumente[dokNr] || vorgang.dokumente[0]

  const gruppen = []
  liste.forEach((e, i) => {
    let g = gruppen[gruppen.length - 1]
    if (!g || g.titel !== e.gruppe) { g = { titel: e.gruppe, eintraege: [] }; gruppen.push(g) }
    g.eintraege.push({ ...e, index: i })
  })

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,11fr)_minmax(0,10fr)] gap-6"
      onMouseLeave={fertig ? ausDenTafeln : undefined}>
      {/* Das Original mit den Fundstellen */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col" style={TAFELHOEHE}>
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-3 shrink-0">
          <Mail size={15} className="text-slate-500 shrink-0" />
          <span className="text-sm font-semibold text-slate-800 whitespace-nowrap shrink-0">Eingang im Original</span>
          <span className="text-xs text-slate-500 truncate min-w-0 flex-1">{dok.titel} · {dok.art}</span>
          {/* Wo die überfahrene Zeile im Original steht */}
          {fertig && (
            <span data-fundstelle-hinweis className={clsx('shrink-0 max-w-[62%] text-xs px-2.5 py-1 rounded-lg border inline-flex items-center gap-1.5 transition-colors duration-300',
              imFokus ? 'text-white border-transparent' : 'bg-white border-slate-200 text-slate-500')}
              style={imFokus ? { backgroundColor: 'var(--mode-primary-light)' } : undefined}>
              {imFokus ? (
                <>
                  <LocateFixed size={13} className="shrink-0" />
                  <span className="truncate">
                    Seite {blickStelle.seite}{blickStelle.ort ? ` · ${blickStelle.ort}` : ''}
                    {blickEintrag.anzahlStellen > 1 ? ` · ${blickEintrag.anzahlStellen} Stellen` : ''}
                  </span>
                </>
              ) : !schwebeKey && blickEintrag ? (
                <span className="truncate">{OHNE_FUNDSTELLE[blickEintrag.art] || OHNE_FUNDSTELLE.fehlt}</span>
              ) : (
                <>
                  <MousePointer2 size={13} className="shrink-0" />
                  <span className="truncate">Punkt in der Liste überfahren: Die Fundstelle erscheint hier</span>
                </>
              )}
            </span>
          )}
          {vorgang.dokumente.length > 1 && (
            <span className="flex items-center gap-1.5 shrink-0">
              {vorgang.dokumente.map((d, i) => (
                <span key={d.id} className={clsx('text-2xs px-2 py-1 rounded-md border', i === dokNr ? 'text-white border-transparent' : 'bg-white border-slate-200 text-slate-500')}
                  style={i === dokNr ? { backgroundColor: 'var(--mode-primary-light)' } : undefined}>{d.titel}</span>
              ))}
            </span>
          )}
        </div>
        <div ref={links} className="flex-1 min-h-0 overflow-y-auto bg-slate-100 p-5">
          {/* Wechselt das Dokument (Mail oder Anhang), blendet das neue weich ein. */}
          <div key={`${vorgang.id}-${dok.id}`} className="animate-fade-in">
            <Dokument dok={dok} info={verknuepfung.info}
              markierung={{ sichtbar, laufend: aktuell?.key, aktiv: gezeigtKey, fokus: imFokus, stark: true }}
              onFeld={fertig ? vonOriginal : undefined}
              seitenbilder={originalseiten(vorgang, dokNr)} />
          </div>
        </div>
        <div className="px-5 py-2 border-t border-slate-200 bg-white shrink-0"><Legende /></div>
      </div>

      {/* Was die KI erkennt */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col" style={TAFELHOEHE}>
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-3 shrink-0">
          <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0" style={{ backgroundColor: 'var(--mode-primary-light)' }}>
            {fertig ? <Check size={16} /> : <Loader2 size={16} className="animate-spin" />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-slate-800">Was die KI erkennt</span>
            <span className="block text-xs text-slate-500 truncate">
              {phase === 0 ? 'Der Eingang wird geöffnet …'
                : fertig ? `Fertig gelesen: ${liste.length} Punkte, jeder mit Fundstelle`
                : `Punkt ${gelesen + 1} von ${liste.length}: ${aktuell.label}`}
            </span>
          </span>
          <span className="w-32 h-2 rounded-full bg-slate-200 overflow-hidden shrink-0">
            <span className="block h-full transition-all duration-300" style={{ width: `${anteil}%`, backgroundColor: 'var(--mode-primary-light)' }} />
          </span>
        </div>

        <div ref={rechts} className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-3">
          {gruppen.map(g => (
            <div key={g.titel}>
              <div className={clsx('text-xs font-semibold uppercase tracking-wide mb-1.5 transition-colors', g.eintraege[0].index <= gelesen ? 'text-slate-500' : 'text-slate-300')}>{g.titel}</div>
              <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                {g.eintraege.map(e => {
                  const ist = e.index < gelesen
                  const jetzt = e.index === gelesen && laeuft
                  const stil = ART_STIL[e.art] || ART_STIL.gelesen
                  const imBlick = gezeigtKey === e.key
                  return (
                    <div key={e.key} data-lesezeile={e.key} data-fundstelle={e.stelle ? e.stelle.seite : undefined} data-im-blick={imBlick || undefined}
                      onMouseEnter={fertig ? () => aufPunkt(e.key) : undefined}
                      onMouseLeave={fertig ? () => vomPunkt(e.key, Boolean(e.stelle)) : undefined}
                      onClick={fertig ? () => aufPunkt(e.key, true) : undefined}
                      className={clsx('px-3 py-1.5 transition-colors duration-300',
                        jetzt || imBlick ? 'bg-(--mode-pastel)' : fertig && 'hover:bg-slate-50')}>
                      <div className="grid grid-cols-[minmax(0,38%)_minmax(0,1fr)_auto] gap-2 items-baseline">
                        <span className={clsx('text-sm leading-snug', ist || jetzt ? 'text-slate-600' : 'text-slate-300')}>{e.label}</span>
                        <span className="text-sm min-w-0 leading-snug">
                          {ist ? (
                            <span className={clsx('animate-fade-in-up inline-block font-medium break-words',
                              e.art === 'fehlt' ? 'text-red-700' : e.art === 'recherche' ? 'text-sky-800' : 'text-slate-900')}>
                              {e.wert || (e.art === 'fehlt' ? 'fehlt' : e.art === 'recherche' ? 'im eigenen Haus nachschlagen' : '')}
                            </span>
                          ) : jetzt ? <Loader2 size={14} className="animate-spin text-slate-400" /> : <span className="text-slate-200">···</span>}
                        </span>
                        <span className={clsx('text-2xs px-1.5 py-0.5 rounded whitespace-nowrap transition-opacity duration-300', stil.chip, ist ? 'opacity-100' : 'opacity-0')}>
                          {e.stelle ? `S. ${e.stelle.seite}${vorgang.dokumente.length > 1 ? (e.stelle.dokNr ? ' Anhang' : ' Mail') : ''} · ${stil.wort}` : stil.wort}
                        </span>
                      </div>
                      {ist && e.herleitung && (e.art === 'interpretiert' || e.art === 'auffaellig' || e.art === 'fehlt') && (
                        <div className={clsx('mt-0.5 text-xs leading-snug animate-fade-in',
                          e.art === 'interpretiert' ? 'text-violet-800' : e.art === 'fehlt' ? 'text-red-700' : 'text-slate-500')}>{e.herleitung}</div>
                      )}
                      {ist && e.stelle && e.art !== 'auffaellig' && (
                        <div className="text-2xs leading-snug text-slate-400 truncate animate-fade-in">{quelleLang(e.stelle)}</div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 py-2.5 border-t border-slate-200 bg-white shrink-0 flex items-center gap-4 text-sm">
          <span className="text-slate-500">Bisher:</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-yellow-400" /> <span className="font-mono font-semibold text-slate-800">{zaehle('gelesen')}</span> gelesen</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-violet-400" /> <span className="font-mono font-semibold text-slate-800">{zaehle('interpretiert')}</span> interpretiert</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-400" /> <span className="font-mono font-semibold text-slate-800">{zaehle('fehlt') + zaehle('recherche')}</span> offen</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-orange-400" /> <span className="font-mono font-semibold text-slate-800">{zaehle('auffaellig')}</span> Auffälligkeiten</span>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Szene 3 – KI-Deckblatt
// ============================================================

function SzeneDeckblatt({ vorgang, lauf, verknuepfung, phase, aufVergleich }) {
  const B = begriffe()
  const layout = layoutVon(vorgang)
  const [fest, setFest] = useState(null)
  const [schwebe, setSchwebe] = useState(null)
  const onFeld = useCallback((key, art) => { if (art === 'hover') setSchwebe(key); else setFest(f => (f === key ? null : key)) }, [])
  const haken = <Check size={20} className="text-emerald-600 shrink-0 mt-0.5" />

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[20rem_minmax(0,1fr)] gap-6 items-start">
      <div className={clsx('space-y-4 transition-all duration-500', phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3')}>
        <h3 className="text-3xl font-semibold text-slate-900 leading-tight">Das KI-Deckblatt</h3>
        <p className="text-lg text-slate-600 leading-relaxed">
          Aus dem Eingang ist ein Blatt geworden, das immer gleich aufgebaut ist
          {layout.id === 'sonstig' ? '.' : <>: die acht Abschnitte der Sparte {layout.name}, in der Reihenfolge der Erfassung {B.imSystem}.</>}
        </p>
        <ul className="space-y-3 text-base text-slate-700">
          <li className="flex gap-3">{haken} Jede Zeile nennt ihre Quelle. Ein Klick klappt sie auf: Fundstelle mit Seite und Wortlaut</li>
          <li className="flex gap-3">{haken} Bei interpretierten Werten steht dort auch die Herleitung, etwa „8 Vollzeit + 2 Geschäftsführer“</li>
          <li className="flex gap-3">{haken} Was fehlt, bleibt sichtbar leer und ist als Rückfrage vorgemerkt</li>
          <li className="flex gap-3">{haken} Unten stehen die fachliche Gesamteinschätzung und die Auffälligkeiten</li>
        </ul>
        <button onClick={aufVergleich}
          className="w-full px-4 py-3 rounded-xl text-base font-medium border-2 bg-white hover:bg-slate-50 text-slate-800 flex items-center justify-center gap-2"
          style={{ borderColor: 'var(--mode-primary-light)' }}>
          <Columns2 size={18} style={{ color: 'var(--mode-primary-light)' }} /> Original und Deckblatt nebeneinander
        </button>
        <p className="text-sm text-slate-500 border-t border-slate-200 pt-3">
          Die Gliederung stammt aus der {B.layoutQuelle}. Vier Sparten haben ein eigenes Layout.
        </p>
      </div>
      <div className={clsx('max-w-4xl transition-all duration-700', phase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98]')}>
        <Deckblatt vorgang={vorgang} lauf={lauf} verknuepfung={verknuepfung} aktiv={schwebe || fest} fest={fest} onFeld={onFeld} />
      </div>
    </div>
  )
}

// ============================================================
// Szene 4 – Prüfung
// ============================================================

function dauernPruefung(lauf) {
  return [900, ...lauf.schritte.map(() => 230), 700]
}

function SzenePruefung({ lauf, phase }) {
  const ausgefuehrt = Math.max(0, Math.min(phase - 1, lauf.schritte.length))
  const fertig = phase > lauf.schritte.length
  const bisher = lauf.schritte.slice(0, ausgefuehrt)
  const zaehle = (...status) => bisher.filter(s => status.includes(s.status)).length
  const e = ERGEBNIS[lauf.ergebnis.art]

  let lfd = 0
  const stufen = STUFEN.map(st => ({
    stufe: st,
    schritte: lauf.schritte.filter(s => s.stufe.id === st.id).map(s => ({ ...s, index: lfd++ }))
  }))

  const zahl = (wert, label, ton) => (
    <span className="text-right">
      <span className={clsx('block text-3xl font-semibold leading-none font-mono', wert ? ton : 'text-slate-300')}>{wert}</span>
      <span className="block text-xs text-slate-400 mt-1">{label}</span>
    </span>
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-5 rounded-2xl border border-slate-200 bg-white shadow-sm px-6 py-3">
        <span className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: 'var(--mode-primary-light)' }}>
          {fertig ? <e.Icon size={24} /> : <Loader2 size={24} className="animate-spin" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-2xl font-semibold text-slate-900 leading-tight">
            {fertig ? lauf.ergebnis.titel : phase === 0 ? 'Die Prüfung wird gestartet' : 'Die Prüfung läuft'}
          </span>
          <span className="block text-base text-slate-500">
            {fertig ? `${lauf.ergebnis.aktion}.` : 'Erst die Einordnung, dann Vermittler, Betriebsart, Pflichtangaben der Sparte und Auffälligkeiten'}
          </span>
        </span>
        <span className="flex items-center gap-6 shrink-0">
          <span className="text-right">
            <span className="block text-3xl font-semibold text-slate-900 leading-none font-mono">{ausgefuehrt}<span className="text-slate-300">/{lauf.schritte.length}</span></span>
            <span className="block text-xs text-slate-400 mt-1">ausgeführt</span>
          </span>
          {zahl(zaehle('ok'), 'ohne Befund', 'text-emerald-600')}
          {zahl(zaehle('fehlt'), 'fehlen', 'text-amber-600')}
          {zahl(zaehle('recherche'), 'Recherche', 'text-indigo-600')}
          {zahl(zaehle('hinweis', 'sonderfall'), 'Hinweise', 'text-sky-600')}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-6 gap-3 items-start">
        {stufen.map(({ stufe, schritte }) => {
          const hart = stufe.art === 'hart'
          const aktiv = schritte.some(s => s.index === ausgefuehrt) && !fertig
          const erledigt = schritte.length > 0 && schritte.every(s => s.index < ausgefuehrt)
          // Die Pflichtangaben sind die längste Stufe: doppelte Breite, zwei Spalten.
          const breit = stufe.id === 'pflicht'
          return (
            <div key={stufe.id} className={clsx('rounded-2xl border bg-white shadow-sm overflow-hidden transition-colors duration-300', breit && 'lg:col-span-2', aktiv ? 'border-slate-400' : 'border-slate-200')}>
              <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center gap-2.5">
                <span className={clsx('w-8 h-8 rounded-lg text-sm font-semibold flex items-center justify-center shrink-0', hart ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700')}>{stufe.nr}</span>
                <span className="min-w-0">
                  <span className="block text-base font-semibold text-slate-900 leading-tight">{stufe.titel}</span>
                  <span className="block text-xs text-slate-400">{hart ? 'Entscheidet über den Weg' : 'Wird gemerkt, der Lauf geht weiter'}</span>
                </span>
                <span className="ml-auto shrink-0">
                  {erledigt ? <CheckCircle2 size={18} className="text-emerald-500" /> : aktiv ? <Loader2 size={18} className="animate-spin text-slate-500" /> : null}
                </span>
              </div>
              <div className={clsx('px-3.5 py-1.5', breit ? 'pruef-zweispaltig' : 'divide-y divide-slate-100')}>
                {schritte.length === 0 && <p className="py-2 text-sm text-slate-400">Entfällt: Der Eingang ist kein Angebotsvorgang.</p>}
                {schritte.map((s, i) => {
                  const ist = s.index < ausgefuehrt
                  const jetzt = s.index === ausgefuehrt && !fertig && phase >= 1
                  const st = PRUEF_STATUS[s.status] || PRUEF_STATUS.neutral
                  // Angaben je Objekt (Gebäude 1, Gebäude 2 …) stehen unter einer Zwischenzeile.
                  const gruppe = s.pruefung.gruppe
                  const neueGruppe = gruppe && gruppe !== schritte[i - 1]?.pruefung.gruppe
                  return (
                    <Fragment key={s.pruefung.id}>
                      {neueGruppe && <div className="pruef-gruppe pt-2.5 pb-1 text-xs uppercase tracking-wide text-slate-500">{gruppe}</div>}
                      <div className={clsx('flex items-center gap-2.5 py-1.5 transition-opacity duration-300', ist || jetzt ? 'opacity-100' : 'opacity-35')}>
                        <span className={clsx('w-6 h-6 rounded-full flex items-center justify-center shrink-0', ist ? st.bg : 'bg-slate-50')}>
                          {ist ? <st.Icon size={14} className={st.ton} strokeWidth={2.5} />
                            : jetzt ? <Loader2 size={13} className="animate-spin text-slate-500" />
                            : <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm text-slate-800 leading-snug">{gruppe ? s.pruefung.kurz : s.pruefung.titel}</span>
                          {ist && s.status !== 'uebersprungen' && s.status !== 'neutral' && (
                            <span className={clsx('block text-xs truncate animate-fade-in', st.ton)}>
                              {s.status === 'ok' ? <span className="text-slate-400">{s.ist}</span> : st.label}
                            </span>
                          )}
                        </span>
                      </div>
                    </Fragment>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================
// Szene 5 – Nächster Schritt
// ============================================================

function SzeneSchritt({ vorgang, lauf, verknuepfung, phase }) {
  const B = begriffe()
  const art = lauf.ergebnis.art
  const e = ERGEBNIS[art]
  const fundstellen = Object.values(verknuepfung.fundstellen).reduce((n, l) => n + l.length, 0)
  const entwurf = useMemo(() => (art === 'rueckfrage' ? baueRueckfrage(vorgang, lauf) : null), [vorgang, lauf, art])
  const [freigegeben, setFreigegeben] = useState(false)
  useEffect(() => { setFreigegeben(false) }, [vorgang])

  const stationen = [
    { Icon: Inbox, titel: 'Eingang', text: `${vorgang.eingang} · ${vorgang.mail.vonName}` },
    { Icon: TextSearch, titel: 'Gelesen', text: `${fundstellen} Fundstellen in ${vorgang.dokumente.reduce((n, d) => n + d.seiten.length, 0)} Seiten` },
    { Icon: FileSpreadsheet, titel: 'Deckblatt', text: layoutVon(vorgang).id === 'sonstig' ? 'Kerndaten für die Weitergabe' : `Layout ${layoutVon(vorgang).kurz}, Reihenfolge der Erfassung` },
    { Icon: ListChecks, titel: 'Geprüft', text: lauf.ergebnis.hart ? 'Schon die Einordnung entscheidet den Weg' : `${lauf.bestanden} von ${lauf.geprueft} Prüfungen ohne Befund` }
  ]

  const andere = ERGEBNIS_FOLGE.filter(a => a !== art).map(a => ({
    art: a,
    text: a === 'bereit' ? `Alle Pflichtangaben liegen vor. Die Sachbearbeitung erfasst ${B.imSystem} direkt vom Deckblatt.`
      : a === 'rueckfrage' ? 'Angaben fehlen. Die Rückfrage an den Vermittler ist vorformuliert, gesendet wird nach Freigabe.'
      : 'Kein Angebotsvorgang, keine eindeutige Betriebsart oder ein Fall außerhalb des Tarifs. Er geht mit dem Deckblatt an den Menschen, der ihn entscheidet.'
  }))

  return (
    <div className="max-w-[75rem] mx-auto w-full space-y-5">
      <div className={clsx('flex items-center gap-6 transition-all duration-700', phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4')}>
        <span className={clsx('inline-flex w-16 h-16 rounded-full items-center justify-center border-4 shrink-0', e.bg, e.ton, e.rand)}>
          <e.Icon size={32} strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <h3 className="text-3xl font-semibold text-slate-900 leading-tight">{lauf.ergebnis.titel}</h3>
          <p className="mt-1 text-lg text-slate-600 leading-relaxed">{lauf.ergebnis.aktion}.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stationen.map((s, i) => (
          <div key={s.titel} className={clsx('relative rounded-2xl border-2 bg-white px-4 py-3 flex items-center gap-3.5 transition-all duration-500',
            phase >= 2 + i ? 'opacity-100 translate-y-0 border-emerald-200' : 'opacity-0 translate-y-3 border-slate-200')}>
            <span className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><s.Icon size={24} strokeWidth={1.75} /></span>
            <span className="min-w-0">
              <span className="block text-lg font-semibold text-slate-900 leading-tight">{s.titel}</span>
              <span className="block text-sm text-slate-500 leading-snug">{s.text}</span>
            </span>
            <span className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow"><Check size={15} strokeWidth={3} /></span>
          </div>
        ))}
      </div>

      <div className={clsx('grid grid-cols-1 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-6 items-start transition-all duration-500', phase >= 6 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3')}>
        {/* Was jetzt konkret passiert */}
        <div className={clsx('rounded-2xl border-2 bg-white overflow-hidden', e.rand)}>
          {art === 'rueckfrage' && (
            <>
              <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-3">
                <MailQuestion size={20} className="text-amber-600 shrink-0" />
                <span className="text-lg font-semibold text-slate-900">Rückfrage, von der KI vorformuliert</span>
                <span className="ml-auto text-sm text-slate-500">An {entwurf.an || 'den Vermittler'}</span>
              </div>
              <pre className="px-5 py-4 text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed max-h-[29vh] overflow-y-auto">{entwurf.text}</pre>
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center gap-3">
                {freigegeben ? (
                  <span className="text-base text-emerald-700 flex items-center gap-2"><CheckCircle2 size={18} /> Freigegeben. Der Vorgang liegt auf Wiedervorlage, bis die Antwort eingeht.</span>
                ) : (
                  <>
                    <button onClick={() => setFreigegeben(true)} className="px-4 py-2.5 rounded-lg text-base text-white flex items-center gap-2" style={{ backgroundColor: 'var(--mode-primary-light)' }}>
                      <Send size={16} /> Prüfen, freigeben und senden
                    </button>
                    <span className="text-sm text-slate-500 flex items-center gap-2"><UserCheck size={16} /> Hinaus geht nichts ohne Freigabe.</span>
                  </>
                )}
              </div>
            </>
          )}

          {art === 'bereit' && (
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3">
                <Keyboard size={22} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-lg font-semibold text-slate-900">Heute möglich, ohne Schnittstelle</div>
                  <p className="text-base text-slate-600 leading-relaxed">
                    Die Sachbearbeitung erfasst {B.imSystem} direkt vom Deckblatt. Die Felder stehen in der Reihenfolge der
                    Eingabe; gelesen und strukturiert ist bereits.
                  </p>
                </div>
              </div>
              {lauf.auftraege.length > 0 && (
                <div className="flex items-start gap-3">
                  <Database size={22} className="text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-lg font-semibold text-slate-900">Recherche im eigenen Haus</div>
                    {lauf.auftraege.map((a, i) => <p key={i} className="text-base text-slate-600 leading-relaxed">{a}</p>)}
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3 pt-4 border-t border-slate-100">
                <Bot size={22} className="text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-lg font-semibold text-slate-900">Nächste Ausbaustufe</div>
                  <p className="text-base text-slate-600 leading-relaxed">
                    Dasselbe Deckblatt geht als Datensatz per Robotics oder Schnittstelle {B.anSystem}. Angebot und Antwort
                    werden vorbereitet, gesendet wird nach Freigabe.
                  </p>
                </div>
              </div>
            </div>
          )}

          {art === 'sonderfall' && (
            <div className="p-5 space-y-4">
              <div>
                <div className="text-lg font-semibold text-slate-900">Warum dieser Fall beim Menschen bleibt</div>
                <ul className="mt-1.5 space-y-1.5">
                  {lauf.ergebnis.gruende.map((g, i) => (
                    <li key={i} className="text-base text-slate-700 flex gap-2.5"><AlertTriangle size={18} className="text-slate-500 shrink-0 mt-1" /> {g}</li>
                  ))}
                </ul>
              </div>
              {lauf.fragen.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <div className="text-lg font-semibold text-slate-900">Offene Punkte, schon gemerkt</div>
                  <ul className="mt-1.5 space-y-1.5">
                    {lauf.fragen.map((f, i) => <li key={i} className="text-base text-slate-600 flex gap-2.5"><Minus size={18} className="text-slate-400 shrink-0 mt-1" /> {f}</li>)}
                  </ul>
                </div>
              )}
              {lauf.auftraege.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <div className="text-lg font-semibold text-slate-900">Recherche im eigenen Haus</div>
                  <ul className="mt-1.5 space-y-1.5">
                    {lauf.auftraege.map((a, i) => <li key={i} className="text-base text-slate-600 flex gap-2.5"><Database size={18} className="text-indigo-500 shrink-0 mt-1" /> {a}</li>)}
                  </ul>
                </div>
              )}
              <p className="text-sm text-slate-500 pt-3 border-t border-slate-100">
                Das Deckblatt geht mit. Auch im Sonderfall muss niemand den Eingang noch einmal von vorn lesen.
              </p>
            </div>
          )}
        </div>

        {/* Die beiden anderen Wege */}
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-wide text-slate-400">Die beiden anderen Wege</div>
          {andere.map(a => {
            const ae = ERGEBNIS[a.art]
            return (
              <div key={a.art} className={clsx('rounded-2xl border px-5 py-4 flex gap-4', ae.rand, ae.bg)}>
                <ae.Icon size={26} className={clsx(ae.ton, 'shrink-0 mt-0.5')} strokeWidth={1.75} />
                <span>
                  <span className="block text-base font-semibold text-slate-900">{ae.titel}</span>
                  <span className="block text-sm text-slate-600 leading-relaxed mt-0.5">{a.text}</span>
                </span>
              </div>
            )
          })}
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 flex gap-4">
            <UserCheck size={26} className="text-slate-500 shrink-0 mt-0.5" strokeWidth={1.75} />
            <span>
              <span className="block text-base font-semibold text-slate-900">In jedem Fall: Human in the Loop</span>
              <span className="block text-sm text-slate-600 leading-relaxed mt-0.5">Die KI bereitet vor. Erfasst, entschieden und versendet wird von der Sachbearbeitung.</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Szene 6 – Alle Eingänge
// ============================================================

const MAIL_STROM = 12

function SzeneAlle({ vorgang, phase, aufAuswertung, vonVorn, aufVorgang, aufWahl }) {
  const gesamt = useMemo(() => auswertung(VORGAENGE), [])
  const laeuft = phase >= 1
  const zaehler = useZaehler(gesamt.gesamt, laeuft)
  const werte = {
    bereit: useZaehler(gesamt.bereit, laeuft),
    rueckfrage: useZaehler(gesamt.rueckfrage, laeuft),
    sonderfall: useZaehler(gesamt.sonderfall, laeuft)
  }
  const fertig = phase >= 2
  const texte = {
    bereit: 'Deckblatt liegt zur Erfassung bereit',
    rueckfrage: 'Rückfrage vorformuliert, wartet auf Freigabe',
    sonderfall: 'mit Deckblatt bei den Fachspezialisten'
  }
  // Zum Schluss stehen die übrigen Beispielanfragen bereit: ansehen oder die Strecke damit durchspielen.
  const uebrige = BEISPIELE.filter(v => v.id !== vorgang.id)
  const laufZu = useMemo(() => new Map(gesamt.laeufe.map(({ vorgang: v, lauf }) => [v.id, lauf])), [gesamt])

  return (
    <div className="flex flex-col justify-center gap-5 max-w-7xl mx-auto w-full" style={{ minHeight: 'calc(100vh - 17rem)' }}>
      <div className="text-center">
        <h3 className="text-3xl font-semibold text-slate-900">Und das für jede Anfrage</h3>
        <p className="mt-1 text-lg text-slate-600">
          Ein Postfach, {gesamt.gesamt} Eingänge, eine Strecke. Jeder Eingang bekommt dasselbe Deckblatt, egal wie er geschrieben ist.
        </p>
      </div>

      <div className="grid grid-cols-[11rem_minmax(0,1fr)_13rem_minmax(0,1fr)_23.5rem] items-center gap-0">
        <div className="rounded-2xl border-2 border-slate-200 bg-white px-5 py-4 text-center">
          <Inbox size={32} className="mx-auto text-slate-500" strokeWidth={1.5} />
          <div className="mt-1.5 text-3xl font-semibold text-slate-900 font-mono">{zaehler}</div>
          <div className="text-sm text-slate-500">Eingänge</div>
        </div>

        <div className="relative h-16 mx-2">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-300" />
          {laeuft && Array.from({ length: MAIL_STROM }).map((_, i) => (
            <span key={i} className="absolute top-1/2 -mt-3.5 animate-mail-fluss text-slate-600 bg-slate-100 rounded-full p-1" style={{ animationDelay: `${i * 180}ms` }}>
              <Mail size={20} />
            </span>
          ))}
        </div>

        <div className="rounded-2xl border-2 px-5 py-4 text-center text-white shadow-lg" style={{ background: 'var(--mode-gradient)', borderColor: 'var(--mode-primary)' }}>
          <Sparkles size={32} className="mx-auto" strokeWidth={1.5} />
          <div className="mt-1.5 text-lg font-semibold leading-tight">KI-Strecke</div>
          <div className="text-sm text-white/80">Lesen · Deckblatt · Prüfung</div>
        </div>

        <div className="relative h-16 mx-2">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-300" />
          {laeuft && Array.from({ length: MAIL_STROM }).map((_, i) => (
            <span key={i} className="absolute top-1/2 -mt-3.5 animate-mail-fluss bg-slate-100 rounded-full p-1" style={{ animationDelay: `${700 + i * 180}ms`, color: 'var(--mode-primary-light)' }}>
              <FileSpreadsheet size={20} />
            </span>
          ))}
        </div>

        <div className="space-y-2">
          {ERGEBNIS_FOLGE.map(art => {
            const ae = ERGEBNIS[art]
            const anteil = gesamt.gesamt ? Math.round((werte[art] / gesamt.gesamt) * 100) : 0
            return (
              <div key={art} className={clsx('rounded-2xl border-2 bg-white px-3.5 py-2 flex items-center gap-3', ae.rand)}>
                <span className={clsx('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', ae.bg, ae.ton)}><ae.Icon size={19} strokeWidth={1.75} /></span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-2">
                    <span className="text-xl font-semibold text-slate-900 font-mono leading-none">{werte[art]}</span>
                    <span className="text-sm font-semibold text-slate-800">{ae.titel}</span>
                  </span>
                  <span className="block text-2xs text-slate-500 leading-snug">{texte[art]}</span>
                  <span className="block mt-1 h-1 rounded-full bg-slate-100 overflow-hidden">
                    <span className={clsx('block h-full transition-all duration-200', ae.balken)} style={{ width: `${anteil}%` }} />
                  </span>
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className={clsx('grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_auto] gap-5 items-center transition-all duration-700', fertig ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4')}>
        <div className="rounded-2xl border-2 bg-white px-5 py-3 flex items-center gap-5" style={{ borderColor: 'var(--mode-primary-light)' }}>
          <FileSpreadsheet size={34} className="shrink-0" strokeWidth={1.5} style={{ color: 'var(--mode-primary-light)' }} />
          <span className="text-3xl font-semibold font-mono leading-none whitespace-nowrap shrink-0" style={{ color: 'var(--mode-primary)' }}>{gesamt.gesamt} von {gesamt.gesamt}</span>
          <span>
            <span className="block text-sm text-slate-700 leading-snug">
              Eingängen haben ein Deckblatt in derselben Struktur. Das Lesen und Strukturieren entfällt,
              Entscheidung und Freigabe bleiben bei der Sachbearbeitung.
            </span>
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <button onClick={aufAuswertung} className="px-4 py-2 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2" style={{ backgroundColor: 'var(--mode-primary-light)' }}>
            <ListChecks size={16} /> Auswertung aller {gesamt.gesamt} Eingänge öffnen
          </button>
          <button onClick={vonVorn} className="px-4 py-2 rounded-xl text-sm border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-2">
            <RotateCcw size={15} /> Von vorn beginnen
          </button>
        </div>
      </div>

      {uebrige.length > 0 && (
        <div className={clsx('transition-all duration-700 delay-150', fertig ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4')} data-schluss-beispiele>
          <div className="flex items-baseline gap-3 mb-2">
            <h4 className="text-lg font-semibold text-slate-900">Die anderen Beispielanfragen zum Durchklicken</h4>
            <span className="text-sm text-slate-500">Ansehen öffnet Original und Deckblatt nebeneinander, im Fenster geht es weiter zum nächsten Beispiel.</span>
          </div>
          <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${uebrige.length}, minmax(0, 1fr))` }}>
            {uebrige.map(v => {
              const lauf = laufZu.get(v.id)
              const ae = lauf ? ERGEBNIS[lauf.ergebnis.art] : null
              return (
                <div key={v.id} className="beispiel-kachel rounded-2xl px-3.5 py-3 flex flex-col">
                  <button onClick={() => aufVorgang?.(v)} className="text-left flex items-start gap-3" title="Original und Deckblatt ansehen">
                    <BeispielNummer nr={v.beispiel} gross />
                    <span className="min-w-0">
                      <span className="block text-base font-semibold text-slate-900 leading-snug truncate">{v.kunde}</span>
                      <span className="block text-xs text-slate-600 leading-snug truncate">{v.form}</span>
                    </span>
                  </button>
                  <div className="mt-2 flex">
                    {ae && <span className={clsx('text-2xs px-2 py-0.5 rounded-full border inline-flex items-center gap-1 whitespace-nowrap', ae.badge)}><ae.Icon size={11} /> {ae.titel}</span>}
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-1.5">
                    <button onClick={() => aufVorgang?.(v)}
                      className="px-1.5 py-1.5 rounded-lg text-xs font-medium text-white inline-flex items-center justify-center gap-1 whitespace-nowrap" style={{ backgroundColor: 'var(--mode-primary-light)' }}>
                      <Columns2 size={13} /> Ansehen
                    </button>
                    <button onClick={() => aufWahl?.(v.id)} title={`Die Strecke mit Beispiel ${v.beispiel} durchspielen`}
                      className="px-1.5 py-1.5 rounded-lg text-xs font-medium border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 inline-flex items-center justify-center gap-1 whitespace-nowrap">
                      <Play size={12} /> Durchspielen
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// Rahmen
// ============================================================

function Prozessleiste({ aktiv, aufSchritt }) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {PROZESS.map((s, i) => {
        const ist = i === aktiv
        const erledigt = i < aktiv
        return (
          <button key={s.id} onClick={() => aufSchritt(i)}
            className={clsx('flex items-center gap-3 px-3 py-2.5 rounded-xl text-left border transition-colors min-w-0',
              ist ? 'text-white border-transparent shadow-md' : erledigt ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' : 'bg-white/60 border-slate-200 text-slate-400 hover:bg-white')}
            style={ist ? { backgroundColor: 'var(--mode-primary)' } : undefined}>
            <span className={clsx('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', ist ? 'bg-white/20' : erledigt ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100')}>
              {erledigt ? <Check size={18} strokeWidth={2.5} /> : <s.Icon size={18} strokeWidth={1.75} />}
            </span>
            <span className="min-w-0">
              <span className={clsx('block text-2xs uppercase tracking-wide', ist ? 'text-white/70' : 'text-slate-400')}>Schritt {s.nr}</span>
              <span className="block text-sm font-semibold leading-tight truncate">{s.titel}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

/** Auswahl des Eingangs, an dem die Strecke vorgeführt wird. */
function Eingangswahl({ vorgang, aufWahl }) {
  const [offen, setOffen] = useState(false)
  const uebrige = VORGAENGE.filter(v => !v.beispiel)
  return (
    <div className="relative shrink-0">
      <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1">
        <span className="px-2 text-2xs uppercase tracking-wide text-slate-400">Beispiel</span>
        {BEISPIELE.map(v => (
          <button key={v.id} onClick={() => aufWahl(v.id)} title={`${v.kunde} · ${v.form}`}
            className={clsx('w-8 h-8 rounded-lg text-sm font-semibold transition-colors', v.id === vorgang.id ? 'text-white' : 'text-slate-600 hover:bg-slate-100')}
            style={v.id === vorgang.id ? { backgroundColor: 'var(--mode-primary-light)' } : undefined}>
            {v.beispiel}
          </button>
        ))}
        <button onClick={() => setOffen(o => !o)} title="Weitere Eingänge"
          className={clsx('h-8 px-2 rounded-lg text-xs transition-colors flex items-center gap-1', !vorgang.beispiel ? 'text-white' : 'text-slate-500 hover:bg-slate-100')}
          style={!vorgang.beispiel ? { backgroundColor: 'var(--mode-primary-light)' } : undefined}>
          weitere <ChevronRight size={12} className={clsx('transition-transform', offen && 'rotate-90')} />
        </button>
      </div>
      {offen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOffen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 w-[21rem] rounded-xl bg-white shadow-xl border border-slate-200 py-1 max-h-[60vh] overflow-y-auto">
            {uebrige.map(v => (
              <button key={v.id} onClick={() => { setOffen(false); aufWahl(v.id) }}
                className={clsx('w-full px-3.5 py-2 text-left hover:bg-slate-50', v.id === vorgang.id && 'bg-slate-50')}>
                <span className="block text-sm font-medium text-slate-800 truncate">{v.kunde}</span>
                <span className="block text-xs text-slate-500 truncate">{layoutVon(v).id === 'sonstig' ? v.vorgangsart : layoutVon(v).name} · {v.form}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function Praesentation({ offen, startSchritt = 0, startVorgangId = null, onClose, aufAuswertung, aufVorgang }) {
  const [vorgangId, setVorgangId] = useState(DEMO_VORGANG_ID)
  const vorgang = useMemo(() => VORGAENGE.find(v => v.id === vorgangId) || VORGAENGE[0], [vorgangId])
  const lauf = useMemo(() => pruefe(vorgang), [vorgang])
  const verknuepfung = useMemo(() => baueVerknuepfung(vorgang), [vorgang])
  const leseliste = useMemo(() => baueLeseliste(vorgang, verknuepfung), [vorgang, verknuepfung])

  const [schritt, setSchritt] = useState(startSchritt)
  const [durchlauf, setDurchlauf] = useState(0)
  const [vollbild, setVollbild] = useState(false)
  // Von vorn beginnt die Präsentation mit dem ruhenden Postfach; ein Einstieg mitten
  // in die Strecke (Klick auf eine Prozesskachel) läuft sofort los.
  const [gestartet, setGestartet] = useState(startSchritt > 0)
  const buehne = useRef(null)

  // Jede Szene beginnt oben; sonst bliebe die Scrollposition der vorigen stehen.
  useEffect(() => { buehne.current?.scrollTo({ top: 0 }) }, [schritt, durchlauf])

  const dauern = useMemo(() => [
    [900, 1600, 2400, 2200],
    dauernLesen(leseliste.length),
    [300],
    dauernPruefung(lauf),
    [400, 600, 300, 300, 300, 800],
    [500, 3400]
  ], [lauf, leseliste])

  const { phase, fertig, abschliessen } = useAblauf(dauern[schritt], `${durchlauf}-${schritt}-${vorgangId}`)

  useEffect(() => {
    if (!offen) return
    // Wer die Präsentation an einer Beispielanfrage startet, sieht genau diese.
    if (startVorgangId) setVorgangId(startVorgangId)
    setSchritt(startSchritt); setGestartet(startSchritt > 0); setDurchlauf(d => d + 1)
  }, [offen, startSchritt, startVorgangId])

  const start = useCallback(() => { setGestartet(true); setDurchlauf(d => d + 1) }, [])

  const schliessen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {})
    onClose()
  }, [onClose])

  const letzter = schritt === PROZESS.length - 1

  const weiter = useCallback(() => {
    document.activeElement?.blur?.()
    if (!gestartet) { start(); return }
    if (!fertig) { abschliessen(); return }
    if (letzter) { schliessen(); return }
    setSchritt(s => s + 1)
  }, [gestartet, start, fertig, abschliessen, letzter, schliessen])

  const zurueck = useCallback(() => {
    document.activeElement?.blur?.()
    if (schritt > 0) setSchritt(s => s - 1)
    else setGestartet(false)
  }, [schritt])

  const vonVorn = useCallback(() => { setSchritt(0); setGestartet(false); setDurchlauf(d => d + 1) }, [])

  const waehleEingang = useCallback((id) => {
    setVorgangId(id)
    setSchritt(0)
    setGestartet(false)
    setDurchlauf(d => d + 1)
  }, [])

  useEffect(() => {
    if (!offen) return
    const handler = (e) => {
      // Liegt die Detailansicht eines Eingangs über der Präsentation, gehört die Tastatur ihr.
      if (document.querySelector('[data-modal]')) return
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key === 'Escape') { e.preventDefault(); schliessen() }
      else if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter' || e.key === 'PageDown') { e.preventDefault(); weiter() }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); zurueck() }
      else if (e.key === 'Home') { e.preventDefault(); vonVorn() }
      // Ziffern rufen die Beispielanfragen direkt auf: 1 für Beispiel 1 und so weiter.
      else if (/^[1-9]$/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const ziel = BEISPIELE.find(v => v.beispiel === Number(e.key))
        if (ziel) { e.preventDefault(); waehleEingang(ziel.id) }
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [offen, weiter, zurueck, vonVorn, schliessen, waehleEingang])

  // Die Präsentation ist für 1920 × 1080 gebaut und skaliert wie eine Folie:
  // Auf kleineren und größeren Fenstern (Laptop, Bildschirmfreigabe, großer
  // Monitor) wächst und schrumpft die Grundschrift mit, das Bild bleibt gleich.
  useEffect(() => {
    if (!offen) return
    const wurzel = document.documentElement
    const setze = () => {
      const groesse = Math.max(11, Math.min(32, window.innerWidth / 96, window.innerHeight / 54))
      wurzel.style.fontSize = `${groesse.toFixed(2)}px`
      wurzel.style.setProperty('--praes-skala', (groesse / 20).toFixed(4))
    }
    setze()
    window.addEventListener('resize', setze)
    return () => {
      window.removeEventListener('resize', setze)
      wurzel.style.fontSize = ''
      wurzel.style.removeProperty('--praes-skala')
    }
  }, [offen])

  useEffect(() => {
    if (!offen) return
    const alt = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const h = () => setVollbild(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', h)
    return () => { document.body.style.overflow = alt; document.removeEventListener('fullscreenchange', h) }
  }, [offen])

  if (!offen) return null

  function vollbildUmschalten() {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {})
    else document.documentElement.requestFullscreen?.().catch(() => {})
  }

  const s = PROZESS[schritt]
  const e = ERGEBNIS[lauf.ergebnis.art]
  const szene = [
    <SzeneEingang key="1" vorgang={vorgang} phase={phase} weiter={() => setSchritt(1)} />,
    <SzeneLesen key="2" vorgang={vorgang} verknuepfung={verknuepfung} liste={leseliste} phase={phase} />,
    <SzeneDeckblatt key="3" vorgang={vorgang} lauf={lauf} verknuepfung={verknuepfung} phase={phase} aufVergleich={() => aufVorgang?.(vorgang)} />,
    <SzenePruefung key="4" lauf={lauf} phase={phase} />,
    <SzeneSchritt key="5" vorgang={vorgang} lauf={lauf} verknuepfung={verknuepfung} phase={phase} />,
    <SzeneAlle key="6" vorgang={vorgang} phase={phase} vonVorn={vonVorn} aufAuswertung={() => { schliessen(); aufAuswertung?.() }}
      aufVorgang={aufVorgang} aufWahl={waehleEingang} />
  ][schritt]

  return createPortal((
    <div className="fixed inset-0 z-[900] bg-slate-100 flex flex-col animate-fade-in" data-praesentation>
      {/* Kopf: die Prozessschritte */}
      <div className="px-6 pt-4 pb-3 border-b border-slate-200 bg-white shrink-0 flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <Prozessleiste aktiv={schritt} aufSchritt={i => { setGestartet(true); setSchritt(i) }} />
        </div>
        <button onClick={vollbildUmschalten} title={vollbild ? 'Vollbild beenden' : 'Vollbild'}
          className="p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 shrink-0">
          {vollbild ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
        <button onClick={schliessen} title="Präsentation beenden (Esc)"
          className="p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 shrink-0">
          <X size={18} />
        </button>
      </div>

      {/* Bühne */}
      <div ref={buehne} data-szene className="flex-1 min-h-0 overflow-y-auto">
        <div key={`${durchlauf}-${schritt}-${vorgangId}`} className="p-6 xl:px-8 animate-fade-in">
          <div className="mb-4 flex items-center gap-3">
            <span className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md" style={{ background: 'var(--mode-gradient)' }}>
              <s.Icon size={22} strokeWidth={1.75} />
            </span>
            <span className="text-2xl font-semibold text-slate-900 leading-tight whitespace-nowrap">{s.titel}</span>
            <span className="text-base text-slate-500 hidden lg:block pl-3 border-l border-slate-300 truncate">{s.kurz}</span>
            <span className="ml-auto flex items-center gap-2.5 shrink-0">
              {schritt >= 3 && <span className={clsx('text-xs px-2.5 py-1 rounded-full border inline-flex items-center gap-1.5', e.badge)}><e.Icon size={12} /> {e.titel}</span>}
              <span className="text-sm text-slate-600 max-w-[15rem] truncate max-xl:hidden" title={`${herkunft(vorgang)} · ${vorgang.kunde}`}>{vorgang.kunde}</span>
              <Eingangswahl vorgang={vorgang} aufWahl={waehleEingang} />
            </span>
          </div>
          {gestartet ? szene : <Startseite vorgang={vorgang} />}
        </div>
      </div>

      {/* Fuß: Steuerung */}
      <div className="px-6 py-3 border-t border-slate-200 bg-white shrink-0 flex items-center gap-3">
        <button onClick={zurueck} disabled={schritt === 0 && !gestartet}
          className="px-4 py-2.5 rounded-lg text-base border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-2 disabled:opacity-40 disabled:hover:bg-white">
          <ChevronLeft size={18} /> Zurück
        </button>
        <span className="text-sm text-slate-400 mx-auto hidden md:block">
          Leertaste oder Pfeil rechts: weiter · Pfeil links: zurück · {BEISPIELE.length > 1 ? `1 bis ${BEISPIELE.length}: Beispiel wählen · ` : ''}Esc: beenden · Schritt {s.nr} von {PROZESS.length}
        </span>
        <button onClick={weiter}
          className={clsx('px-5 py-2.5 rounded-lg text-base font-medium flex items-center gap-2', (fertig || !gestartet) ? 'text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50')}
          style={(fertig || !gestartet) ? { backgroundColor: 'var(--mode-primary-light)' } : undefined}>
          {!gestartet ? <>Weiter: Eine Anfrage trifft ein <ChevronRight size={18} /></>
            : !fertig ? 'Animation überspringen'
            : letzter ? 'Präsentation beenden'
            : <>Weiter: {PROZESS[schritt + 1].titel}</>}
          {fertig && gestartet && !letzter && <ChevronRight size={18} />}
        </button>
      </div>
    </div>
  ), document.body)
}
