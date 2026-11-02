/**
 * Präsentationsmodus der Prüfstrecke.
 *
 * Führt die Strecke an einem einzelnen Eingang vor, Schritt für Schritt und
 * bildschirmfüllend:
 *
 *   1  E-Mail-Eingang        das Postfach, eine Mail trifft ein, Problem und Lösung
 *   2  KI-Strukturierung     die Mail wird geöffnet, die KI liest Feld für Feld
 *   3  KI-Deckblatt          das fertige Formular
 *   4  Automatische Prüfung  der Prüfkatalog läuft Prüfung für Prüfung durch
 *   5  Abschluss             Dunkelverarbeitung, der Vorgang ist erledigt
 *   6  Alle Eingänge         derselbe Weg für das ganze Postfach
 *
 * Innerhalb einer Szene laufen die Animationen von selbst (Phasen mit festen
 * Zeiten). Von Szene zu Szene geht es per Klick, Leertaste oder Pfeiltaste.
 * Ein Klick während der Animation springt zuerst an ihr Ende.
 */

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  X, ChevronLeft, ChevronRight, Maximize2, Minimize2, Inbox, Mail, Paperclip, Sparkles,
  AlertTriangle, Lightbulb, ArrowRight, Check, Minus, Ban, CheckCircle2, FileText,
  Loader2, RotateCcw, Search, Send, Archive, FolderOpen, Gauge, ListChecks
} from 'lucide-react'
import { VORGAENGE } from '../utils/pruefvorgaenge'
import { pruefe, auswertung } from '../utils/pruefengine'
import { STUFEN } from '../utils/pruefkatalog'
import { PROZESS, DEMO_VORGANG_ID } from '../utils/prozess'
import Deckblatt from './Deckblatt'

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
function useZaehler(ziel, aktiv, dauer = 2600) {
  const [wert, setWert] = useState(0)
  useEffect(() => {
    if (!aktiv) { setWert(0); return }
    let raf
    const start = performance.now()
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dauer)
      const e = 1 - Math.pow(1 - p, 3)
      setWert(Math.round(ziel * e))
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

function auszug(text, laenge = 90) {
  const eins = text.replace(/\s+/g, ' ').trim()
  return eins.length > laenge ? eins.slice(0, laenge).replace(/\s\S*$/, '') + ' …' : eins
}

function isoDatum(d) {
  const [t, m, j] = d.split('.')
  return `${j}-${m}-${t}`
}

const ERGEBNIS = {
  clean: { titel: 'Dunkelverarbeitung', Icon: CheckCircle2, ton: 'text-emerald-600', bg: 'bg-emerald-50', rand: 'border-emerald-200', balken: 'bg-emerald-500' },
  be:    { titel: 'Prüfung offen',      Icon: AlertTriangle, ton: 'text-red-600',     bg: 'bg-red-50',     rand: 'border-red-200',     balken: 'bg-red-500' },
  hart:  { titel: 'Formal abgewiesen',  Icon: Ban,           ton: 'text-slate-600',   bg: 'bg-slate-100',  rand: 'border-slate-300',   balken: 'bg-slate-400' }
}

function Hinweisbox({ Icon, titel, kinder, ton = 'neutral', sichtbar, className = '' }) {
  const toene = {
    neutral: { rahmen: 'border-slate-200 bg-white', kreis: 'bg-slate-100 text-slate-600' },
    problem: { rahmen: 'border-amber-200 bg-amber-50', kreis: 'bg-amber-100 text-amber-700' },
    loesung: { rahmen: 'bg-white', kreis: 'text-white' }
  }
  const t = toene[ton]
  return (
    <div className={`rounded-2xl border-2 p-4 transition-all duration-500 ${t.rahmen} ${
      sichtbar ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
    } ${className}`} style={ton === 'loesung' ? { borderColor: 'var(--mode-primary-light)' } : undefined}>
      <div className="flex items-center gap-3">
        <span className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${t.kreis}`}
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
      className={`flex items-center gap-3 px-4 py-3 border-b border-slate-100 border-l-4 transition-colors duration-300 ${
        neu ? 'animate-mail-eingang' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${
        ausgewaehlt && !neu ? 'bg-slate-100' : onClick && !neu ? 'hover:bg-slate-50' : ''
      }`}
      style={{
        backgroundColor: neu ? 'var(--mode-pastel)' : undefined,
        borderLeftColor: ausgewaehlt ? 'var(--mode-primary-light)' : 'transparent'
      }}>
      <span className="w-2 shrink-0 flex justify-center">
        {!gelesen && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--mode-primary-light)' }} />}
      </span>
      <span className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
        gelesen ? 'bg-slate-100 text-slate-500' : 'text-white'
      }`} style={!gelesen ? { backgroundColor: 'var(--mode-primary)' } : undefined}>
        {initialen(mail.vonName)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className={`text-base truncate ${gelesen ? 'text-slate-600' : 'font-semibold text-slate-900'}`}>{mail.vonName}</span>
          {neu && (
            <span className="text-[11px] uppercase tracking-wide px-1.5 py-0.5 rounded text-white shrink-0"
              style={{ backgroundColor: 'var(--mode-primary-light)' }}>Neu</span>
          )}
        </span>
        <span className={`block text-sm truncate ${gelesen ? 'text-slate-500' : 'text-slate-800 font-medium'}`}>{mail.betreff}</span>
        {!kompakt && <span className="block text-xs text-slate-400 truncate">{auszug(mail.text)}</span>}
      </span>
      <span className="shrink-0 flex flex-col items-end gap-1">
        <span className={`font-mono ${kompakt ? 'text-[11px]' : 'text-xs'} ${gelesen ? 'text-slate-400' : 'text-slate-700'}`}>{mail.datum}</span>
        {mail.anhaenge.length > 0 && <Paperclip size={13} className="text-slate-400" />}
      </span>
    </div>
  )
}

function Lesebereich({ vorgang }) {
  const { mail } = vorgang
  return (
    <div className="h-full overflow-y-auto animate-fade-in bg-white">
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="text-xl font-semibold text-slate-900 leading-snug">{mail.betreff}</div>
        <div className="mt-3 flex items-center gap-3">
          <span className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white shrink-0"
            style={{ backgroundColor: 'var(--mode-primary)' }}>{initialen(mail.vonName)}</span>
          <span className="min-w-0 text-sm">
            <span className="block text-slate-900 font-medium">{mail.vonName} <span className="text-slate-400 font-normal">&lt;{mail.von}&gt;</span></span>
            <span className="block text-slate-500">An: {mail.an} · {mail.datum}</span>
          </span>
        </div>
      </div>
      <pre className="px-6 py-5 text-base text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">{mail.text}</pre>
      {mail.anhaenge.length > 0 && (
        <div className="px-6 pb-5">
          <div className="text-xs uppercase tracking-wide text-slate-400 mb-2">
            {mail.anhaenge.length} {mail.anhaenge.length === 1 ? 'Anhang' : 'Anhänge'}
          </div>
          {mail.anhaenge.map((a, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 mb-2">
              <FileText size={20} className="text-slate-500 shrink-0" />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-slate-800 truncate">{a.name}</span>
                <span className="block text-xs text-slate-500">{a.typ} · {a.info}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/** Das Postfach am Tag des Eingangs: alles, was bis dahin da war, liegt schon drin. */
function useVorhandene(vorgang) {
  return useMemo(() => {
    const stichtag = isoDatum(vorgang.eingang)
    return VORGAENGE
      .filter(v => v.id !== vorgang.id && isoDatum(v.eingang) <= stichtag)
      .sort((a, b) => isoDatum(b.eingang).localeCompare(isoDatum(a.eingang)) || b.id.localeCompare(a.id))
      .slice(0, 9)
  }, [vorgang])
}

/** Das Mailprogramm: Ordner, Liste, auf Wunsch die neue Mail und der Lesebereich. */
function Postfach({ vorgang, vorhandene, neu, offen }) {
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
    { Icon: FolderOpen, label: 'Themenpostkorb Komposit / Leben', anzahl: 12 },
    { Icon: FolderOpen, label: 'Themenpostkorb Gesundheit', anzahl: 4 },
    { Icon: Send, label: 'Gesendet' },
    { Icon: Archive, label: 'Archiv' }
  ]

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col h-[min(780px,calc(100vh-320px))] relative">
      <div className="px-5 py-3 border-b border-slate-200 flex items-center gap-4 bg-slate-50">
        <span className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <Mail size={16} className="text-slate-500" /> maklerservice@versicherer.de
        </span>
        <span className="ml-auto flex items-center gap-2 text-sm text-slate-400 border border-slate-200 rounded-lg px-3 py-1.5 bg-white w-72">
          <Search size={14} /> Postfach durchsuchen
        </span>
      </div>

      <div className="flex-1 min-h-0 grid transition-[grid-template-columns] duration-500"
        style={{ gridTemplateColumns: lesebereich ? '200px 460px minmax(0,1fr)' : '240px minmax(0,1fr) 0px' }}>
        <div className="border-r border-slate-200 bg-slate-50/60 py-3 overflow-hidden">
          {ordner.map(o => (
            <div key={o.label} className={`flex items-center gap-2.5 px-4 py-2 text-sm ${
              o.aktiv ? 'font-semibold text-slate-900 bg-white border-y border-slate-200' : 'text-slate-600'
            }`}>
              <o.Icon size={15} className={o.aktiv ? 'text-slate-700' : 'text-slate-400'} />
              <span className="truncate">{o.label}</span>
              {o.anzahl != null && (
                <span className={`ml-auto text-xs font-mono ${o.aktiv ? 'text-white px-1.5 py-0.5 rounded-full' : 'text-slate-400'}`}
                  style={o.aktiv ? { backgroundColor: 'var(--mode-primary-light)' } : undefined}>{o.anzahl}</span>
              )}
            </div>
          ))}
        </div>

        <div className={`overflow-hidden ${lesebereich ? 'border-r border-slate-200' : ''}`}>
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

      {/* Benachrichtigung */}
      {neu && !lesebereich && (
        <div className={`absolute bottom-5 right-5 animate-slide-in rounded-xl border border-slate-200 bg-white shadow-xl px-4 py-3 flex items-center gap-3 max-w-md`}>
          <span className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0"
            style={{ backgroundColor: 'var(--mode-primary-light)' }}>
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

/**
 * Startseite der Präsentation: das Postfach in Ruhe, alle Mails lassen sich
 * ansehen. Der Weiter-Knopf lässt die neue Mail eintreffen.
 */
function Startseite({ vorgang }) {
  const vorhandene = useVorhandene(vorgang)
  return (
    <div className="h-full">
      <Postfach vorgang={vorgang} vorhandene={vorhandene} neu={false} offen={false} />
    </div>
  )
}

function SzeneEingang({ vorgang, phase, weiter }) {
  const vorhandene = useVorhandene(vorgang)
  const neu = phase >= 1
  const offen = phase >= 2

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px] gap-6 h-full">
      <Postfach vorgang={vorgang} vorhandene={vorhandene} neu={neu} offen={offen} />

      {/* Problem und Lösung */}
      <div className="flex flex-col gap-4 justify-center">
        <Hinweisbox
          Icon={AlertTriangle} ton="problem" sichtbar={phase >= 3}
          titel="Problem: Der Eingang ist unstrukturiert"
          kinder={(
            <ul className="space-y-2 text-[17px] leading-snug text-slate-700">
              <li className="flex gap-2"><Minus size={18} className="text-amber-500 shrink-0 mt-0.5" /> Freitext, jeder Vermittler schreibt anders</li>
              <li className="flex gap-2"><Minus size={18} className="text-amber-500 shrink-0 mt-0.5" /> Kundendaten, Vertrags- und Vermittlernummer stehen irgendwo im Text, die Vollmacht nur im Anhang</li>
              <li className="flex gap-2"><Minus size={18} className="text-amber-500 shrink-0 mt-0.5" /> Formulare und künftig die BiPRO-Norm liefern die Daten direkt als Datensatz, aber es gibt keinen Formzwang: Ein Teil kommt weiter unstrukturiert per E-Mail</li>
              <li className="flex gap-2 font-medium text-slate-900"><Minus size={18} className="text-amber-500 shrink-0 mt-0.5" /> Bisher: von Hand lesen, erfassen und gegen Bestand und Vermittlersystem prüfen</li>
            </ul>
          )}
        />
        <Hinweisbox
          Icon={Lightbulb} ton="loesung" sichtbar={phase >= 4}
          titel="Lösung: KI-Strukturierung"
          kinder={(
            <>
              <p className="text-base text-slate-700 leading-relaxed">
                Die KI liest Mail und Anhang, überführt alle Angaben in ein festes Deckblatt und lässt darauf
                den Prüfkatalog automatisch laufen. Was sauber durchläuft, wird dunkel verarbeitet.
              </p>
              <button
                onClick={weiter}
                className="mt-4 w-full px-4 py-3 rounded-xl text-base font-medium text-white flex items-center justify-center gap-2"
                style={{ backgroundColor: 'var(--mode-primary-light)' }}
              >
                <Sparkles size={18} /> E-Mail öffnen und strukturieren <ArrowRight size={18} />
              </button>
            </>
          )}
        />
      </div>
    </div>
  )
}

// ============================================================
// Szene 2 – KI-Strukturierung
// ============================================================

/** Die Felder, die die KI vor den Augen des Publikums liest, in Lesereihenfolge. */
const KI_FELDER = [
  { key: 'kundeVorname', label: 'Vorname', gruppe: 'Kunde und Vertrag' },
  { key: 'kundeNachname', label: 'Nachname', gruppe: 'Kunde und Vertrag' },
  { key: 'kundeGebdat', label: 'Geburtsdatum', gruppe: 'Kunde und Vertrag' },
  { key: 'kundeStrasse', label: 'Straße', gruppe: 'Kunde und Vertrag' },
  { key: 'kundePlz', label: 'PLZ', gruppe: 'Kunde und Vertrag' },
  { key: 'kundeOrt', label: 'Ort', gruppe: 'Kunde und Vertrag' },
  { key: 'vnr', label: 'Versicherungsnummer', gruppe: 'Kunde und Vertrag' },
  { key: 'sparte', label: 'Sparte', gruppe: 'Kunde und Vertrag', herleitung: 'aus VNR-Präfix' },
  { key: 'agenturNr', label: 'Agentur-Nr', gruppe: 'Übernehmender Vermittler' },
  { key: 'vermittlerName', label: 'Vermittler', gruppe: 'Übernehmender Vermittler', herleitung: 'Absender' },
  { key: 'maklerEmail', label: 'E-Mail', gruppe: 'Übernehmender Vermittler', herleitung: 'Absender' },
  { key: 'pool', label: 'Pool', gruppe: 'Übernehmender Vermittler', herleitung: 'aus Text' },
  { key: 'klassifikation', label: 'Klassifikation', gruppe: 'Vorgang', herleitung: 'aus Inhalt' },
  { key: 'wunschVorhanden', label: 'Übertragungswunsch', gruppe: 'Vorgang', herleitung: 'aus Inhalt' },
  { key: 'mvEnthalten', label: 'Vollmacht enthalten', gruppe: 'Maklervollmacht' },
  { key: 'mvVnNachname', label: 'Vollmachtgeber', gruppe: 'Maklervollmacht' },
  { key: 'mvUnterschriftKunde', label: 'Unterschrift Kunde', gruppe: 'Maklervollmacht' },
  { key: 'mvUnterschriftsdatum', label: 'Unterschriftsdatum', gruppe: 'Maklervollmacht' }
]

const QUELLE_LABEL = {
  text: { label: 'Mailtext', klasse: 'bg-yellow-100 text-yellow-800' },
  anhang: { label: 'Anhang', klasse: 'bg-sky-100 text-sky-800' },
  abgeleitet: { label: 'abgeleitet', klasse: 'bg-slate-100 text-slate-600' },
  leer: { label: 'nicht enthalten', klasse: 'bg-slate-100 text-slate-400' }
}

/** Woher ein Feld stammt: wörtlich aus dem Text, aus dem Anhang oder abgeleitet. */
function bestimmeFelder(vorgang) {
  const text = vorgang.mail.text
  const hatAnhang = vorgang.mail.anhaenge.length > 0
  return KI_FELDER.map(f => {
    const wert = vorgang.deckblatt[f.key] || ''
    let quelle
    if (!wert) quelle = 'leer'
    else if (f.key.startsWith('mv') && hatAnhang) quelle = 'anhang'
    else if (wert.length >= 2 && text.includes(wert)) quelle = 'text'
    else quelle = 'abgeleitet'
    return { ...f, wert, quelle }
  })
}

/** Zerlegt den Mailtext in Stücke; Stücke mit `key` sind gelesene Werte. */
function zerlegeText(text, felder) {
  const bereiche = []
  for (const f of felder) {
    if (f.quelle !== 'text') continue
    const start = text.indexOf(f.wert)
    if (start < 0) continue
    const ende = start + f.wert.length
    if (bereiche.some(b => start < b.ende && ende > b.start)) continue
    bereiche.push({ start, ende, key: f.key })
  }
  bereiche.sort((a, b) => a.start - b.start)
  const teile = []
  let pos = 0
  for (const b of bereiche) {
    if (b.start > pos) teile.push({ text: text.slice(pos, b.start) })
    teile.push({ text: text.slice(b.start, b.ende), key: b.key })
    pos = b.ende
  }
  if (pos < text.length) teile.push({ text: text.slice(pos) })
  return teile
}

export function dauernStrukturierung() {
  return [1000, 1100, ...KI_FELDER.map(() => 380), 700]
}

function SzeneStrukturierung({ vorgang, lauf, phase }) {
  const felder = useMemo(() => bestimmeFelder(vorgang), [vorgang])
  const teile = useMemo(() => zerlegeText(vorgang.mail.text, felder), [vorgang, felder])

  const anhangGelesen = phase >= 1
  const gelesen = Math.max(0, Math.min(phase - 2, felder.length))
  const laeuft = phase >= 2 && gelesen < felder.length
  const aktuell = laeuft ? felder[gelesen] : null
  const fertig = phase > felder.length + 2
  const gelesenKeys = new Set(felder.slice(0, gelesen).map(f => f.key))

  const felderGesamt = Object.keys(vorgang.deckblatt).length
  const felderGefuellt = Object.values(vorgang.deckblatt).filter(Boolean).length
  const anteil = Math.round((gelesen / felder.length) * 100)

  const gruppen = []
  felder.forEach((f, i) => {
    let g = gruppen.find(x => x.titel === f.gruppe)
    if (!g) { g = { titel: f.gruppe, felder: [] }; gruppen.push(g) }
    g.felder.push({ ...f, index: i })
  })

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-6 h-full">
      {/* Die geöffnete Mail */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2 text-sm text-slate-500">
          <Mail size={15} /> Eingang im Original
          <span className="ml-auto text-xs font-mono text-slate-400">{vorgang.id}</span>
        </div>
        <div className="p-5 space-y-3 flex-1">
          <div className="text-sm text-slate-500 space-y-0.5">
            <div><span className="text-slate-400">Von: </span>
              <span className={`transition-colors duration-500 rounded px-0.5 ${gelesenKeys.has('maklerEmail') ? 'bg-yellow-100 text-slate-800' : ''}`}>
                {vorgang.mail.vonName} &lt;{vorgang.mail.von}&gt;
              </span>
            </div>
            <div><span className="text-slate-400">An: </span>{vorgang.mail.an}</div>
            <div><span className="text-slate-400">Eingang: </span>{vorgang.mail.datum}</div>
          </div>
          <div className="pt-3 border-t border-slate-100 text-lg font-semibold text-slate-900">{vorgang.mail.betreff}</div>
          <pre className="text-base text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
            {teile.map((t, i) => t.key ? (
              <mark
                key={i}
                className={`rounded px-0.5 transition-colors duration-500 ${
                  gelesenKeys.has(t.key) ? 'bg-yellow-200 text-slate-900'
                    : aktuell?.key === t.key ? 'bg-yellow-100 text-slate-900 animate-pulse-ring'
                    : 'bg-transparent text-inherit'
                }`}
              >{t.text}</mark>
            ) : <span key={i}>{t.text}</span>)}
          </pre>

          <div className="pt-3 border-t border-slate-100">
            <div className="text-xs uppercase tracking-wide text-slate-400 mb-2">
              {vorgang.mail.anhaenge.length} {vorgang.mail.anhaenge.length === 1 ? 'Anhang' : 'Anhänge'}
            </div>
            {vorgang.mail.anhaenge.map((a, i) => {
              const liest = phase === 1 || aktuell?.quelle === 'anhang'
              return (
                <div key={i} className={`flex items-center gap-3 rounded-xl border-2 px-3.5 py-2.5 transition-colors duration-500 ${
                  liest ? 'border-sky-300 bg-sky-50 animate-pulse-ring' : anhangGelesen ? 'border-sky-200 bg-sky-50/50' : 'border-slate-200 bg-white'
                }`}>
                  <FileText size={20} className={liest || anhangGelesen ? 'text-sky-600' : 'text-slate-400'} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-slate-800 truncate">{a.name}</span>
                    <span className="block text-xs text-slate-500">{a.typ} · {a.info}</span>
                  </span>
                  {liest ? <Loader2 size={16} className="animate-spin text-sky-600" />
                    : anhangGelesen ? <span className="text-xs text-sky-700 flex items-center gap-1"><Check size={14} /> gelesen</span> : null}
                </div>
              )
            })}
            {vorgang.mail.anhaenge.length === 0 && (
              <div className="text-sm text-amber-600 flex items-center gap-2"><Paperclip size={14} /> Kein Anhang</div>
            )}
          </div>
        </div>
      </div>

      {/* Das entstehende Deckblatt */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0" style={{ backgroundColor: 'var(--mode-primary-light)' }}>
            <Sparkles size={16} />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-slate-800">KI-Strukturierung</span>
            <span className="block text-xs text-slate-500">
              {phase === 0 ? 'Eingang wird geöffnet …'
                : phase === 1 ? 'Anhang wird gelesen …'
                : fertig ? `Deckblatt vollständig: ${felderGefuellt} von ${felderGesamt} Feldern belegt`
                : `Feld ${gelesen + 1} von ${felder.length}: ${aktuell?.label} …`}
            </span>
          </span>
          <span className="ml-auto w-32 h-2 rounded-full bg-slate-200 overflow-hidden shrink-0">
            <span className="block h-full transition-all duration-300" style={{ width: `${anteil}%`, backgroundColor: 'var(--mode-primary-light)' }} />
          </span>
        </div>

        <div className="flex-1 p-5 grid grid-cols-1 2xl:grid-cols-2 gap-x-5 gap-y-4 content-start">
          {gruppen.map((g, gi) => (
            <div key={g.titel} className={gi === 0 ? '2xl:row-span-3' : ''}>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">{g.titel}</div>
              <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                {g.felder.map(f => {
                  const ist = f.index < gelesen
                  const jetzt = f.index === gelesen && laeuft
                  const q = QUELLE_LABEL[f.quelle]
                  return (
                    <div key={f.key} className={`grid grid-cols-[170px_minmax(0,1fr)_auto] gap-2 items-center px-3 py-1.5 transition-colors duration-300 ${
                      jetzt ? 'bg-slate-50' : ''
                    }`}>
                      <span className={`text-sm truncate ${ist || jetzt ? 'text-slate-600' : 'text-slate-300'}`}>{f.label}</span>
                      <span className="text-sm font-mono min-w-0 truncate" title={ist ? f.wert : undefined}>
                        {ist ? (
                          <span className={`animate-fade-in-up ${f.wert ? 'text-slate-900' : 'text-slate-300'}`}>{f.wert || 'leer'}</span>
                        ) : jetzt ? (
                          <Loader2 size={14} className="animate-spin text-slate-400" />
                        ) : (
                          <span className="text-slate-200">···</span>
                        )}
                      </span>
                      <span className={`text-[11px] px-1.5 py-0.5 rounded transition-opacity duration-300 whitespace-nowrap ${q.klasse} ${ist ? 'opacity-100' : 'opacity-0'}`}
                        title={f.herleitung}>
                        {f.quelle === 'abgeleitet' && f.herleitung ? f.herleitung : q.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {fertig && (
            <div className="2xl:col-span-2 animate-fade-in-up rounded-xl border-2 border-emerald-200 bg-emerald-50 px-4 py-3 flex items-center gap-3">
              <CheckCircle2 size={22} className="text-emerald-600 shrink-0" />
              <span className="text-base text-emerald-900">
                <span className="font-semibold">Deckblatt fertig.</span> {felderGefuellt} von {felderGesamt} Feldern belegt,
                jeder Wert mit Herkunft. Prüfergebnis vorab: {lauf.bestanden} von {lauf.geprueft} Prüfungen bestanden.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Szene 3 – KI-Deckblatt
// ============================================================

function SzeneDeckblatt({ vorgang, lauf, phase }) {
  const felderGesamt = Object.keys(vorgang.deckblatt).length
  const felderGefuellt = Object.values(vorgang.deckblatt).filter(Boolean).length
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[380px_minmax(0,1fr)] gap-6 h-full items-start">
      <div className={`space-y-4 transition-all duration-500 ${phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
        <h3 className="text-3xl font-semibold text-slate-900 leading-tight">Das KI-Deckblatt</h3>
        <p className="text-lg text-slate-600 leading-relaxed">
          Aus dem Freitext ist ein Formular geworden. Es hat immer dieselben Felder an derselben Stelle,
          egal wie der Vermittler geschrieben hat.
        </p>
        <ul className="space-y-3 text-base text-slate-700">
          <li className="flex gap-3"><Check size={20} className="text-emerald-600 shrink-0 mt-0.5" /> {felderGefuellt} von {felderGesamt} Feldern belegt, leere Felder bleiben sichtbar leer</li>
          <li className="flex gap-3"><Check size={20} className="text-emerald-600 shrink-0 mt-0.5" /> Angaben aus Mail und Anhang stehen nebeneinander und lassen sich abgleichen</li>
          <li className="flex gap-3"><Check size={20} className="text-emerald-600 shrink-0 mt-0.5" /> Auf diesem Deckblatt setzt die automatische Prüfung auf</li>
        </ul>
        <p className="text-sm text-slate-500 border-t border-slate-200 pt-3">
          Im Pilotbetrieb sieht die Sachbearbeitung das Deckblatt vor der Verarbeitung. Im Zielbild läuft der
          nächste Schritt ohne Zwischenstopp.
        </p>
      </div>
      <div className={`max-w-4xl transition-all duration-700 ${phase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98]'}`}>
        <Deckblatt vorgang={vorgang} lauf={lauf} />
      </div>
    </div>
  )
}

// ============================================================
// Szene 4 – Automatische Prüfung
// ============================================================

const PRUEF_STATUS = {
  ok: { Icon: Check, ton: 'text-emerald-600', bg: 'bg-emerald-50', label: 'bestanden' },
  be: { Icon: AlertTriangle, ton: 'text-red-600', bg: 'bg-red-50', label: 'Business Exception' },
  info: { Icon: AlertTriangle, ton: 'text-amber-600', bg: 'bg-amber-50', label: 'Hinweis' },
  neutral: { Icon: Minus, ton: 'text-slate-400', bg: 'bg-slate-50', label: 'nicht einschlägig' },
  uebersprungen: { Icon: Minus, ton: 'text-slate-300', bg: 'bg-slate-50', label: 'nicht mehr ausgeführt' }
}

export function dauernPruefung(lauf) {
  return [900, ...lauf.schritte.map(() => 230), 700]
}

function SzenePruefung({ vorgang, lauf, phase }) {
  const ausgefuehrt = Math.max(0, Math.min(phase - 1, lauf.schritte.length))
  const fertig = phase > lauf.schritte.length + 1
  const bestanden = lauf.schritte.slice(0, ausgefuehrt).filter(s => s.status === 'ok').length
  const gemerkt = lauf.schritte.slice(0, ausgefuehrt).filter(s => s.status === 'be').length
  const e = ERGEBNIS[lauf.ergebnis.art]

  let lfd = 0
  const stufen = STUFEN.map(st => ({
    stufe: st,
    schritte: lauf.schritte.filter(s => s.stufe.id === st.id).map(s => ({ ...s, index: lfd++ }))
  }))

  return (
    <div className="h-full flex flex-col gap-5">
      <div className="flex items-center gap-5 rounded-2xl border border-slate-200 bg-white shadow-sm px-6 py-4">
        <span className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: 'var(--mode-primary-light)' }}>
          {fertig ? <e.Icon size={24} /> : <Loader2 size={24} className="animate-spin" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-2xl font-semibold text-slate-900 leading-tight">
            {fertig ? lauf.ergebnis.titel : phase === 0 ? 'Prüfkatalog wird gestartet' : 'Prüfkatalog läuft'}
          </span>
          <span className="block text-base text-slate-500">
            {fertig
              ? `${lauf.bestanden} von ${lauf.geprueft} Prüfungen bestanden. ${lauf.ergebnis.aktion}.`
              : 'Zuerst die harten Kriterien, dann alle inhaltlichen Prüfungen gegen Bestand und Vermittlersystem'}
          </span>
        </span>
        <span className="flex items-center gap-6 shrink-0">
          <span className="text-right">
            <span className="block text-3xl font-semibold text-slate-900 leading-none font-mono">{ausgefuehrt}<span className="text-slate-300">/{lauf.schritte.length}</span></span>
            <span className="block text-xs text-slate-400 mt-1">ausgeführt</span>
          </span>
          <span className="text-right">
            <span className="block text-3xl font-semibold text-emerald-600 leading-none font-mono">{bestanden}</span>
            <span className="block text-xs text-slate-400 mt-1">bestanden</span>
          </span>
          <span className="text-right">
            <span className={`block text-3xl font-semibold leading-none font-mono ${gemerkt ? 'text-red-600' : 'text-slate-300'}`}>{gemerkt}</span>
            <span className="block text-xs text-slate-400 mt-1">gemerkt</span>
          </span>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-5 gap-3 flex-1 content-start">
        {stufen.map(({ stufe, schritte }) => {
          const hart = stufe.art === 'hart'
          const aktiv = schritte.some(s => s.index === ausgefuehrt) && !fertig
          const erledigt = schritte.every(s => s.index < ausgefuehrt)
          return (
            <div key={stufe.id} className={`relative rounded-2xl border bg-white shadow-sm overflow-hidden transition-colors duration-300 ${
              aktiv ? 'border-slate-400' : 'border-slate-200'
            }`}>
              <span className="absolute left-0 top-0 bottom-0 w-1.5" style={{ background: hart ? '#0f172a' : 'var(--mode-primary-light)' }} />
              <div className="pl-4 pr-3 py-2.5 border-b border-slate-100 flex items-center gap-2.5">
                <span className={`w-8 h-8 rounded-lg text-sm font-semibold flex items-center justify-center shrink-0 ${
                  hart ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                }`}>{stufe.nr}</span>
                <span className="min-w-0">
                  <span className="block text-base font-semibold text-slate-900 leading-tight">{stufe.titel}</span>
                  <span className="block text-xs text-slate-400">{hart ? 'Hartes Kriterium: Verstoß beendet die Verarbeitung' : 'Weiche Prüfung: Verstoß wird gemerkt'}</span>
                </span>
                <span className="ml-auto shrink-0">
                  {erledigt ? <CheckCircle2 size={18} className="text-emerald-500" />
                    : aktiv ? <Loader2 size={18} className="animate-spin text-slate-500" /> : null}
                </span>
              </div>
              <div className="pl-4 pr-3 py-1.5 divide-y divide-slate-100">
                {schritte.map(s => {
                  const ist = s.index < ausgefuehrt
                  const jetzt = s.index === ausgefuehrt && !fertig && phase >= 1
                  const st = PRUEF_STATUS[s.status] || PRUEF_STATUS.neutral
                  return (
                    <div key={s.pruefung.id} className={`flex items-center gap-2.5 py-1.5 transition-opacity duration-300 ${
                      ist || jetzt ? 'opacity-100' : 'opacity-35'
                    }`}>
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${ist ? st.bg : 'bg-slate-50'}`}>
                        {ist ? <st.Icon size={14} className={st.ton} strokeWidth={2.5} />
                          : jetzt ? <Loader2 size={13} className="animate-spin text-slate-500" />
                          : <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm text-slate-800 leading-snug" title={s.pruefung.titel}>{s.pruefung.titel}</span>
                        {ist && s.status !== 'uebersprungen' && s.status !== 'neutral' && (
                          <span className="block text-xs text-slate-400 truncate animate-fade-in">
                            <span className="font-mono">{s.ist || '–'}</span> gegen {s.pruefung.abgleich}
                          </span>
                        )}
                      </span>
                      {ist && (
                        <span className={`shrink-0 ${st.ton}`} title={st.label}><st.Icon size={16} strokeWidth={2.5} /></span>
                      )}
                    </div>
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
// Szene 5 – Abschluss
// ============================================================

function SzeneAbschluss({ vorgang, lauf, phase }) {
  const e = ERGEBNIS[lauf.ergebnis.art]
  const d = vorgang.deckblatt
  const felderGefuellt = Object.values(d).filter(Boolean).length
  const clean = lauf.ergebnis.art === 'clean'

  const stationen = [
    { Icon: Inbox, titel: 'Eingang', text: `${vorgang.eingang} · ${vorgang.mail.vonName}` },
    { Icon: Sparkles, titel: 'Strukturiert', text: `${felderGefuellt} Felder aus Mail und Anhang` },
    { Icon: ListChecks, titel: 'Geprüft', text: `${lauf.bestanden} von ${lauf.geprueft} Prüfungen bestanden` },
    { Icon: e.Icon, titel: clean ? 'Übertragen' : 'Ausgesteuert', text: clean ? `Vertrag ${d.vnr} auf ${d.vermittlerName}` : lauf.ergebnis.aktion }
  ]

  const alternativen = [
    {
      art: 'be',
      titel: 'Prüfung offen',
      text: `Mindestens ein Grund gemerkt. Der Vorgang geht mit Deckblatt und Prüfergebnis in den Themenpostkorb ${vorgang.postkorb}; die Sachbearbeitung entscheidet, ohne noch einmal lesen zu müssen.`
    },
    {
      art: 'hart',
      titel: 'Formal abgewiesen',
      text: 'Ein hartes Kriterium verletzt, zum Beispiel keine Vollmacht oder keine Bestandsübertragung. Die Verarbeitung endet sofort, der Vermittler erhält die Ablehnungsinformation.'
    }
  ].filter(a => a.art !== lauf.ergebnis.art)

  return (
    <div className="h-full flex flex-col justify-center max-w-6xl mx-auto w-full gap-8">
      <div className={`text-center transition-all duration-700 ${phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <span className={`inline-flex w-24 h-24 rounded-full items-center justify-center ${e.bg} ${e.ton} border-4 ${e.rand}`}>
          <e.Icon size={52} strokeWidth={1.75} />
        </span>
        <h3 className="mt-5 text-4xl font-semibold text-slate-900">{e.titel}</h3>
        <p className="mt-3 text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          {clean
            ? <>Kein Ablehnungsgrund gemerkt. Der Vertrag <span className="font-mono text-slate-800">{d.vnr}</span> geht auf {d.vermittlerName}
              {d.agenturNr ? ` (Agentur ${d.agenturNr})` : ''} über. Kein Sachbearbeiter hat den Vorgang angefasst.</>
            : <>{lauf.ergebnis.gruende.join('; ')}. {lauf.ergebnis.aktion}.</>}
        </p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stationen.map((s, i) => {
          const da = phase >= 2 + i
          return (
            <div key={s.titel} className={`relative rounded-2xl border-2 bg-white px-5 py-4 flex items-center gap-4 transition-all duration-500 ${
              da ? 'opacity-100 translate-y-0 border-emerald-200' : 'opacity-0 translate-y-3 border-slate-200'
            }`}>
              <span className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <s.Icon size={24} strokeWidth={1.75} />
              </span>
              <span className="min-w-0">
                <span className="block text-lg font-semibold text-slate-900 leading-tight">{s.titel}</span>
                <span className="block text-sm text-slate-500 leading-snug">{s.text}</span>
              </span>
              <span className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow">
                <Check size={15} strokeWidth={3} />
              </span>
            </div>
          )
        })}
      </div>

      <div className={`transition-all duration-500 ${phase >= 6 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
        <div className="text-xs uppercase tracking-wide text-slate-400 mb-2">Und wenn nicht alles passt</div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {alternativen.map(a => {
            const ae = ERGEBNIS[a.art]
            return (
              <div key={a.art} className={`rounded-2xl border ${ae.rand} ${ae.bg} px-5 py-4 flex gap-4`}>
                <ae.Icon size={26} className={`${ae.ton} shrink-0 mt-0.5`} strokeWidth={1.75} />
                <span>
                  <span className="block text-base font-semibold text-slate-900">{a.titel}</span>
                  <span className="block text-sm text-slate-600 leading-relaxed mt-0.5">{a.text}</span>
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Szene 6 – Alle Eingänge
// ============================================================

const MAIL_STROM = 14

function SzeneSkalierung({ phase, aufAuswertung, vonVorn }) {
  const gesamt = useMemo(() => auswertung(VORGAENGE), [])
  const laeuft = phase >= 1
  const zaehler = useZaehler(gesamt.gesamt, laeuft)
  const clean = useZaehler(gesamt.clean, laeuft)
  const be = useZaehler(gesamt.be, laeuft)
  const hart = useZaehler(gesamt.hart, laeuft)
  const quote = useZaehler(gesamt.quote, laeuft)
  const fertig = phase >= 2

  const ausgaenge = [
    { art: 'clean', wert: clean, ziel: gesamt.clean, text: 'ohne einen Handgriff verarbeitet' },
    { art: 'be', wert: be, ziel: gesamt.be, text: 'mit Deckblatt und Prüfergebnis im Themenpostkorb' },
    { art: 'hart', wert: hart, ziel: gesamt.hart, text: 'sofort beendet, Vermittler informiert' }
  ]

  return (
    <div className="h-full flex flex-col justify-center gap-8 max-w-7xl mx-auto w-full">
      <div className="text-center">
        <h3 className="text-4xl font-semibold text-slate-900">Und das für jeden Eingang</h3>
        <p className="mt-3 text-xl text-slate-600 max-w-3xl mx-auto">
          Ein Postfach, {gesamt.gesamt} Maklerschreiben, eine Strecke. Nur was Arbeit macht, landet bei einem Menschen.
        </p>
      </div>

      <div className="grid grid-cols-[220px_minmax(0,1fr)_260px_minmax(0,1fr)_460px] items-center gap-0">
        {/* Postfach */}
        <div className="rounded-2xl border-2 border-slate-200 bg-white px-5 py-5 text-center">
          <Inbox size={36} className="mx-auto text-slate-500" strokeWidth={1.5} />
          <div className="mt-2 text-4xl font-semibold text-slate-900 font-mono">{zaehler}</div>
          <div className="text-sm text-slate-500">Eingänge</div>
        </div>

        {/* Strom in die Strecke */}
        <div className="relative h-16 mx-2">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-300" />
          {laeuft && Array.from({ length: MAIL_STROM }).map((_, i) => (
            <span key={i} className="absolute top-1/2 -mt-3.5 animate-mail-fluss text-slate-600 bg-slate-100 rounded-full p-1"
              style={{ animationDelay: `${i * 170}ms` }}>
              <Mail size={20} />
            </span>
          ))}
        </div>

        {/* Die Strecke */}
        <div className="rounded-2xl border-2 px-5 py-5 text-center text-white shadow-lg" style={{ background: 'var(--mode-gradient)', borderColor: 'var(--mode-primary)' }}>
          <Sparkles size={36} className="mx-auto" strokeWidth={1.5} />
          <div className="mt-2 text-lg font-semibold leading-tight">KI-Strecke</div>
          <div className="text-sm text-white/80">Strukturierung · Deckblatt · Prüfung</div>
        </div>

        {/* Strom in die Ausgänge */}
        <div className="relative h-16 mx-2">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-300" />
          {laeuft && Array.from({ length: MAIL_STROM }).map((_, i) => (
            <span key={i} className="absolute top-1/2 -mt-3.5 animate-mail-fluss text-emerald-600 bg-slate-100 rounded-full p-1"
              style={{ animationDelay: `${700 + i * 170}ms` }}>
              <FileText size={20} />
            </span>
          ))}
        </div>

        {/* Ausgänge */}
        <div className="space-y-3">
          {ausgaenge.map(a => {
            const ae = ERGEBNIS[a.art]
            const anteil = gesamt.gesamt ? Math.round((a.wert / gesamt.gesamt) * 100) : 0
            return (
              <div key={a.art} className={`rounded-2xl border-2 ${ae.rand} bg-white px-4 py-3 flex items-center gap-3`}>
                <span className={`w-11 h-11 rounded-xl ${ae.bg} ${ae.ton} flex items-center justify-center shrink-0`}>
                  <ae.Icon size={22} strokeWidth={1.75} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-2">
                    <span className="text-2xl font-semibold text-slate-900 font-mono leading-none">{a.wert}</span>
                    <span className="text-base font-semibold text-slate-800">{ae.titel}</span>
                  </span>
                  <span className="block text-xs text-slate-500">{a.text}</span>
                  <span className="block mt-1.5 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <span className={`block h-full ${ae.balken} transition-all duration-200`} style={{ width: `${anteil}%` }} />
                  </span>
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className={`grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_auto] gap-6 items-center transition-all duration-700 ${fertig ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 px-6 py-5 flex items-center gap-6">
          <Gauge size={44} className="text-emerald-600 shrink-0" strokeWidth={1.5} />
          <span>
            <span className="block text-5xl font-semibold text-emerald-700 font-mono leading-none">{quote} %</span>
            <span className="block text-base text-emerald-900 mt-1.5">
              Dunkelverarbeitungsquote: {gesamt.clean} von {gesamt.gesamt} Eingängen laufen ohne Sachbearbeitung durch.
              Für die übrigen liegt die Vorarbeit fertig im Postkorb.
            </span>
          </span>
        </div>
        <div className="flex flex-col gap-2.5">
          <button onClick={aufAuswertung}
            className="px-5 py-3 rounded-xl text-base font-medium text-white flex items-center justify-center gap-2"
            style={{ backgroundColor: 'var(--mode-primary-light)' }}>
            <ListChecks size={18} /> Auswertung aller {gesamt.gesamt} Eingänge öffnen
          </button>
          <button onClick={vonVorn}
            className="px-5 py-3 rounded-xl text-base border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-2">
            <RotateCcw size={17} /> Von vorn beginnen
          </button>
        </div>
      </div>
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
          <button
            key={s.id}
            onClick={() => aufSchritt(i)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left border transition-colors min-w-0 ${
              ist ? 'text-white border-transparent shadow-md' : erledigt ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' : 'bg-white/60 border-slate-200 text-slate-400 hover:bg-white'
            }`}
            style={ist ? { backgroundColor: 'var(--mode-primary)' } : undefined}
          >
            <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              ist ? 'bg-white/20' : erledigt ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100'
            }`}>
              {erledigt ? <Check size={18} strokeWidth={2.5} /> : <s.Icon size={18} strokeWidth={1.75} />}
            </span>
            <span className="min-w-0">
              <span className={`block text-[11px] uppercase tracking-wide ${ist ? 'text-white/70' : 'text-slate-400'}`}>Schritt {s.nr}</span>
              <span className="block text-sm font-semibold leading-tight truncate">{s.titel}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default function Praesentation({ offen, startSchritt = 0, onClose, aufAuswertung }) {
  const vorgang = useMemo(() => VORGAENGE.find(v => v.id === DEMO_VORGANG_ID) || VORGAENGE[0], [])
  const lauf = useMemo(() => pruefe(vorgang), [vorgang])
  const [schritt, setSchritt] = useState(startSchritt)
  const [durchlauf, setDurchlauf] = useState(0)
  const [vollbild, setVollbild] = useState(false)
  // Von vorn beginnt die Präsentation mit der Startseite; ein Einstieg mitten
  // in die Strecke (Klick auf eine Prozesskachel) läuft sofort los.
  const [gestartet, setGestartet] = useState(startSchritt > 0)
  const buehne = useRef(null)

  // Jede Szene beginnt oben; sonst bliebe die Scrollposition der vorigen stehen.
  useEffect(() => { buehne.current?.scrollTo({ top: 0 }) }, [schritt, durchlauf])

  const dauern = useMemo(() => [
    [900, 1600, 2400, 2200],
    dauernStrukturierung(),
    [300],
    dauernPruefung(lauf),
    [400, 700, 350, 350, 350, 900],
    [500, 4600]
  ], [lauf])

  const { phase, fertig, abschliessen } = useAblauf(dauern[schritt], `${durchlauf}-${schritt}`)

  useEffect(() => {
    if (offen) { setSchritt(startSchritt); setGestartet(startSchritt > 0); setDurchlauf(d => d + 1) }
  }, [offen, startSchritt])

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
  }, [schritt])
  const vonVorn = useCallback(() => { setSchritt(0); setGestartet(false); setDurchlauf(d => d + 1) }, [])

  useEffect(() => {
    if (!offen) return
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key === 'Escape') { e.preventDefault(); schliessen() }
      else if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter' || e.key === 'PageDown') { e.preventDefault(); weiter() }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); zurueck() }
      else if (e.key === 'Home') { e.preventDefault(); vonVorn() }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [offen, weiter, zurueck, vonVorn, schliessen])

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
  const szene = [
    <SzeneEingang key="1" vorgang={vorgang} phase={phase} weiter={() => setSchritt(1)} />,
    <SzeneStrukturierung key="2" vorgang={vorgang} lauf={lauf} phase={phase} />,
    <SzeneDeckblatt key="3" vorgang={vorgang} lauf={lauf} phase={phase} />,
    <SzenePruefung key="4" vorgang={vorgang} lauf={lauf} phase={phase} />,
    <SzeneAbschluss key="5" vorgang={vorgang} lauf={lauf} phase={phase} />,
    <SzeneSkalierung key="6" phase={phase} vonVorn={vonVorn} aufAuswertung={() => { schliessen(); aufAuswertung?.() }} />
  ][schritt]

  return createPortal((
    <div className="fixed inset-0 z-[1100] bg-slate-100 flex flex-col animate-fade-in">
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
      <div ref={buehne} className="flex-1 min-h-0 overflow-y-auto">
        <div key={`${durchlauf}-${schritt}`} className="min-h-full flex flex-col p-6 2xl:px-8 animate-fade-in">
          <div className="mb-4 flex items-center gap-3 shrink-0">
            <span className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md" style={{ background: 'var(--mode-gradient)' }}>
              <s.Icon size={22} strokeWidth={1.75} />
            </span>
            <span className="text-2xl font-semibold text-slate-900 leading-tight">{s.titel}</span>
            <span className="text-base text-slate-500 hidden lg:block pl-3 border-l border-slate-300">{s.kurz}</span>
            <span className="ml-auto text-sm text-slate-400">Schritt {s.nr} von {PROZESS.length}</span>
          </div>
          <div className="flex-1 min-h-0">{gestartet ? szene : <Startseite vorgang={vorgang} />}</div>
        </div>
      </div>

      {/* Fuß: Steuerung */}
      <div className="px-6 py-3 border-t border-slate-200 bg-white shrink-0 flex items-center gap-3">
        <button onClick={zurueck} disabled={schritt === 0}
          className="px-4 py-2.5 rounded-lg text-base border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-2 disabled:opacity-40 disabled:hover:bg-white">
          <ChevronLeft size={18} /> Zurück
        </button>
        <span className="text-sm text-slate-400 mx-auto hidden md:block">
          Leertaste oder Pfeil rechts: weiter · Pfeil links: zurück · Esc: beenden
        </span>
        <button onClick={weiter}
          className={`px-5 py-2.5 rounded-lg text-base font-medium flex items-center gap-2 ${
            (fertig || !gestartet) ? 'text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
          style={(fertig || !gestartet) ? { backgroundColor: 'var(--mode-primary-light)' } : undefined}>
          {!gestartet ? <>Weiter: Eine E-Mail trifft ein <ChevronRight size={18} /></>
            : !fertig ? 'Animation überspringen'
            : letzter ? 'Präsentation beenden'
            : <>Weiter: {PROZESS[schritt + 1].titel}</>}
          {fertig && !letzter && <ChevronRight size={18} />}
        </button>
      </div>
    </div>
  ), document.body)
}
