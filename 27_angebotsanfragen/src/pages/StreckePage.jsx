/**
 * Angebotsstrecke: die sechs Schritte als Präsentation und darunter die
 * Strecke zum Selbstausprobieren – Eingänge ansehen, hochladen, analysieren,
 * Ergebnis je Eingang nachvollziehen.
 */

import { useMemo, useState, useRef, useCallback, useEffect } from 'react'
import {
  Search, CheckCircle2, AlertTriangle, ListChecks, Mail, Paperclip, ChevronRight, ShieldCheck,
  Download, Upload, Loader2, FileText, Trash2, X, ArrowLeft, ArrowRight, Sparkles, KeyRound, RotateCcw,
  FileSpreadsheet, Inbox
} from 'lucide-react'
import { VORGAENGE, BEISPIELE } from '../daten/vorgaenge'
import { pruefe, auswertung, STUFEN } from '../utils/pruefengine'
import { layoutVon, ANGEBOTSLAYOUTS, FELDER } from '../utils/layouts'
import { ladeEingaengeHerunter, leseDatei, ERLAUBTE_ENDUNGEN } from '../utils/eingangsexport'
import { ERGEBNIS, ERGEBNIS_FOLGE } from '../utils/ergebnis'
import { begriffe } from '../utils/branding'
import * as AI from '../utils/ai-processor'
import EigenerEingangPanel from '../components/EigenerEingangPanel'
import ProzessUebersicht from '../components/ProzessUebersicht'
import { Kennzahl, ErgebnisBadge, LayoutChip, HerkunftChip, auszug } from '../components/Bausteine'

const SCHRITTE = [
  { nr: 1, titel: 'Eingänge ansehen' },
  { nr: 2, titel: 'Eingänge hochladen' },
  { nr: 3, titel: 'Analyse' },
  { nr: 4, titel: 'Ergebnis je Eingang' }
]

/** Was in jeder Stufe geprüft wird – als Überblick, die Prüfungen selbst entstehen je Eingang. */
const STUFEN_INHALT = {
  einordnung: ['Eingang ist eine Angebotsanfrage', 'Für die Sparte gibt es ein Layout'],
  vermittler: ['Agenturnummer ist genannt', 'Vermittler ist für eine Rückfrage erreichbar'],
  betriebsart: ['Tätigkeit ist einer Betriebsart zugeordnet', 'Zuordnung ist eindeutig', 'Aufteilung bei mehreren Tätigkeiten'],
  pflicht: ['je Pflichtangabe der Sparte eine Prüfung'],
  plausi: ['je Auffälligkeit eine Prüfung']
}

// ============================================================
// Bausteine
// ============================================================

function Stepper({ aktiv, aufSchritt }) {
  return (
    <div className="card-base px-4 py-3 flex items-center gap-2 overflow-x-auto">
      {SCHRITTE.map((s, i) => {
        const erledigt = s.nr < aktiv
        const ist = s.nr === aktiv
        return (
          <div key={s.nr} className="flex items-center gap-2 shrink-0">
            <button onClick={() => erledigt && aufSchritt(s.nr)} disabled={!erledigt}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${erledigt ? 'hover:bg-slate-50 cursor-pointer' : 'cursor-default'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${ist ? 'text-white' : erledigt ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}
                style={ist ? { backgroundColor: 'var(--mode-primary-light)' } : undefined}>
                {erledigt ? <CheckCircle2 size={14} /> : s.nr}
              </span>
              <span className={`text-sm ${ist ? 'font-semibold text-slate-800' : erledigt ? 'text-slate-600' : 'text-slate-400'}`}>{s.titel}</span>
            </button>
            {i < SCHRITTE.length - 1 && <ChevronRight size={14} className="text-slate-300" />}
          </div>
        )
      })}
    </div>
  )
}

function Katalog({ offenInitial = false }) {
  const [offen, setOffen] = useState(offenInitial)
  return (
    <div className="card-base overflow-hidden">
      <button onClick={() => setOffen(o => !o)} className="w-full px-5 py-4 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors">
        <span className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
          <ShieldCheck size={17} className="text-slate-500" strokeWidth={1.75} />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-slate-800">So wird geprüft</span>
          <span className="block text-xs text-slate-500">
            Erst die Einordnung, dann Vermittler, Betriebsart, Pflichtangaben der Sparte und Auffälligkeiten
          </span>
        </span>
        <ChevronRight size={16} className={`ml-auto text-slate-400 transition-transform ${offen ? 'rotate-90' : ''}`} />
      </button>

      {offen && (
        <div className="px-5 pb-5 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
            {STUFEN.map(stufe => {
              const hart = stufe.art === 'hart'
              return (
                <div key={stufe.id} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-7 h-7 rounded-lg text-sm font-semibold flex items-center justify-center shrink-0 ${hart ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>{stufe.nr}</span>
                    <span className="block text-sm font-semibold text-slate-900 leading-tight">{stufe.titel}</span>
                  </div>
                  <p className="mt-2.5 text-xs text-slate-500 leading-relaxed">{stufe.beschreibung}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {STUFEN_INHALT[stufe.id].map(p => (
                      <span key={p} className="text-2xs leading-tight px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-600">{p}</span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="text-xs uppercase tracking-wide text-slate-400">Pflichtangaben je Sparte (Annahme der Demo, im Piloten mit dem Fachbereich festzulegen)</div>
            <div className="mt-2 grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-2">
              {ANGEBOTSLAYOUTS.map(l => (
                <div key={l.id} className="text-xs text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-800">{l.kurz}: </span>
                  {[...l.pflicht, ...(l.pflichtJeObjekt || [])].map(k => FELDER[k].lang || FELDER[k].label).join(' · ')}
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {ERGEBNIS_FOLGE.map(art => {
              const e = ERGEBNIS[art]
              return (
                <div key={art} className={`rounded-xl border px-4 py-3 flex gap-3 ${e.rand} ${e.bg}`}>
                  <e.Icon size={20} className={`${e.ton} shrink-0 mt-0.5`} />
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">{e.titel}</span>
                    <span className="block text-xs text-slate-600 leading-snug">{e.beschreibung}</span>
                  </span>
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
// Schritt 1 – Eingänge ansehen
// ============================================================

function EingangKachel({ vorgang, onClick }) {
  const { mail } = vorgang
  return (
    <button onClick={onClick}
      className="text-left rounded-xl border border-slate-200 bg-white p-4 flex flex-col gap-2 hover:border-slate-300 hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-2 text-xs text-slate-400 min-w-0">
        <Mail size={13} className="shrink-0" />
        <span className="truncate">{mail.vonName}</span>
        <span className="ml-auto shrink-0 font-mono">{vorgang.eingang}</span>
      </div>
      <div className="text-sm font-medium text-slate-800 leading-snug line-clamp-2">{mail.betreff}</div>
      <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{auszug(mail.vorschau)}</p>
      <div className="mt-auto pt-2 border-t border-slate-100 flex items-center gap-2 text-xs min-w-0">
        <HerkunftChip vorgang={vorgang} />
        <span className="text-slate-500 truncate">{vorgang.form}</span>
        {mail.anhaenge.length > 0 && (
          <span className="ml-auto text-slate-400 flex items-center gap-1 shrink-0"><Paperclip size={11} /> {mail.anhaenge.length}</span>
        )}
      </div>
    </button>
  )
}

function EingangKacheln({ aufEingang }) {
  const [alle, setAlle] = useState(false)
  const ANZAHL = 8
  // Die Beispielanfragen stehen vorn, danach die synthetischen Eingänge.
  const sortiert = useMemo(() => [...BEISPIELE, ...VORGAENGE.filter(v => !v.beispiel)], [])
  const liste = alle ? sortiert : sortiert.slice(0, ANZAHL)

  return (
    <div className="card-base p-5">
      <h3 className="text-lg font-semibold text-slate-800">So sehen die Eingänge aus</h3>
      <p className="mt-1.5 text-sm text-slate-600 max-w-4xl">
        Jede Kachel ist eine Anfrage, wie sie im Postfach liegt: ein weitergeleiteter Verlauf, die Beratungsdokumentation
        eines Vergleichsportals, das Formular einer Vermittlerplattform, ein Scan, ein Dreizeiler. Anklicken zeigt den
        Eingang im Original.
      </p>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {liste.map(v => <EingangKachel key={v.id} vorgang={v} onClick={() => aufEingang(v)} />)}
      </div>
      {sortiert.length > ANZAHL && (
        <button onClick={() => setAlle(a => !a)}
          className="mt-4 px-3 py-2 rounded-lg text-sm border border-slate-200 bg-white hover:bg-slate-50 flex items-center gap-1.5 text-slate-700">
          <ChevronRight size={14} className={`transition-transform ${alle ? 'rotate-90' : ''}`} />
          {alle ? `Nur die ersten ${ANZAHL} zeigen` : `Alle ${sortiert.length} Eingänge zeigen`}
        </button>
      )}
    </div>
  )
}

function SchrittEingaenge({ weiter, direktZumErgebnis, aufEingang }) {
  const [geladen, setGeladen] = useState(false)
  return (
    <div className="space-y-4">
      <div className="card-base p-5">
        <h3 className="text-lg font-semibold text-slate-800">Eingänge ansehen</h3>
        <p className="mt-1.5 text-sm text-slate-600 max-w-4xl">
          Im Postfach liegen {VORGAENGE.length} Anfragen: die {BEISPIELE.length} verfremdeten Beispielanfragen aus dem Fachbereich und{' '}
          {VORGAENGE.length - BEISPIELE.length} frei erfundene. Sie lassen sich als EML-Dateien herunterladen und im nächsten
          Schritt wieder hochladen. Wer die Beispielanfragen als PDF vorliegen hat, kann auch diese PDF hochladen.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button onClick={() => { ladeEingaengeHerunter(); setGeladen(true) }}
            className="px-4 py-2.5 rounded-lg text-sm text-white flex items-center gap-2" style={{ backgroundColor: 'var(--mode-primary-light)' }}>
            <Download size={16} /> {VORGAENGE.length} Eingänge als ZIP herunterladen
          </button>
          <button onClick={weiter} className="px-4 py-2.5 rounded-lg text-sm border border-slate-200 bg-white hover:bg-slate-50 flex items-center gap-2">
            Weiter zum Hochladen <ArrowRight size={15} />
          </button>
          {geladen && <span className="text-sm text-emerald-600 flex items-center gap-1.5"><CheckCircle2 size={15} /> ZIP wurde erzeugt</span>}
        </div>
        <button onClick={direktZumErgebnis} className="mt-3 text-xs text-slate-400 hover:text-slate-600 underline">
          Auswertung ohne Download und Upload öffnen
        </button>
      </div>
      <EingangKacheln aufEingang={aufEingang} />
      <Katalog offenInitial />
    </div>
  )
}

// ============================================================
// Schritt 2 – Hochladen
// ============================================================

function SchrittHochladen({ dateien, setDateien, zurueck, weiter, mitClaude, setMitClaude, onOpenVorgang }) {
  const [ueber, setUeber] = useState(false)
  const [abgelehnt, setAbgelehnt] = useState(0)
  const inputRef = useRef(null)
  const hatKey = AI.hasApiKey()

  const einlesen = useCallback(async (fileList) => {
    // Erst alle Dateien vollständig lesen: das Eingabefeld wird direkt nach dem
    // Auswählen geleert, danach sind die Dateiobjekte nicht mehr zuverlässig lesbar.
    const gelesen = await Promise.all(Array.from(fileList).map(async f => {
      try { return await leseDatei(f) } catch { return null }
    }))
    const neue = gelesen.filter(Boolean)
    setAbgelehnt(gelesen.length - neue.length)
    setDateien(alt => {
      const namen = new Set(alt.map(d => d.name))
      return [...alt, ...neue.filter(d => !namen.has(d.name))]
    })
  }, [setDateien])

  const unbekannt = dateien.filter(d => !d.vorgangId).length

  return (
    <div className="space-y-4">
      <div className="card-base p-5">
        <h3 className="text-lg font-semibold text-slate-800">Eingänge hochladen</h3>
        <p className="mt-1.5 text-sm text-slate-600 max-w-4xl">
          Ziehen Sie die heruntergeladenen EML-Dateien oder die PDF der Beispielanfragen hierher. Eigene Anfragen als EML,
          PDF oder Textdatei liest Claude live.
        </p>

        <div
          onDragOver={e => { e.preventDefault(); setUeber(true) }}
          onDragLeave={() => setUeber(false)}
          onDrop={e => { e.preventDefault(); setUeber(false); einlesen(e.dataTransfer.files) }}
          onClick={() => inputRef.current?.click()}
          className={`mt-4 rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${ueber ? 'border-slate-400 bg-slate-100' : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'}`}
        >
          <Upload size={26} className="mx-auto text-slate-400" strokeWidth={1.5} />
          <div className="mt-2 text-sm text-slate-600">EML, PDF oder TXT hierher ziehen oder klicken</div>
          <div className="text-xs text-slate-400 mt-0.5">Mehrfachauswahl möglich</div>
          <input ref={inputRef} type="file" accept={ERLAUBTE_ENDUNGEN.join(',')} multiple className="hidden"
            onChange={async e => { const feld = e.target; await einlesen(feld.files); feld.value = '' }} />
        </div>

        {abgelehnt > 0 && (
          <p className="mt-2 text-xs text-amber-700">{abgelehnt} {abgelehnt === 1 ? 'Datei wurde' : 'Dateien wurden'} übersprungen: nur EML, PDF und TXT werden gelesen.</p>
        )}

        {dateien.length > 0 && (
          <div className="mt-4 space-y-1.5 max-h-64 overflow-y-auto">
            {dateien.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2.5 rounded-lg border border-slate-200 px-3 py-2">
                <FileText size={14} className="text-slate-400 shrink-0" />
                <span className="text-sm text-slate-700 truncate">{d.name}</span>
                {d.vorgangId
                  ? <span className="text-xs text-emerald-700 shrink-0">{d.erkennung}</span>
                  : <span className="text-xs text-amber-600 shrink-0">eigene Datei, wird live gelesen</span>}
                <button onClick={() => setDateien(alt => alt.filter((_, j) => j !== i))} className="ml-auto p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 rounded-lg border border-slate-200 p-3 space-y-2">
          <div className="text-xs uppercase tracking-wide text-slate-400">Wie sollen die Eingänge gelesen werden?</div>
          <label className="flex items-start gap-2.5 text-sm text-slate-700 cursor-pointer">
            <input type="radio" checked={!mitClaude} onChange={() => setMitClaude(false)} className="mt-1" />
            <span>
              Hinterlegte Auswertung verwenden
              <span className="block text-xs text-slate-500">Ohne API-Aufruf. Gilt für die Demo-Eingänge und die PDF der Beispielanfragen.</span>
            </span>
          </label>
          <label className="flex items-start gap-2.5 text-sm text-slate-700 cursor-pointer">
            <input type="radio" checked={mitClaude} onChange={() => setMitClaude(true)} className="mt-1" />
            <span className="flex-1">
              Von Claude live lesen lassen
              <span className="block text-xs text-slate-500">
                Jede Datei geht einzeln an die Anthropic-API. {hatKey ? 'Ein API Key ist hinterlegt.' : 'Dafür ist ein API Key nötig, zu hinterlegen unten unter „Eigene Anfrage einfügen“.'}
              </span>
            </span>
            {!hatKey && <KeyRound size={14} className="text-amber-500 mt-1" />}
          </label>
          {!mitClaude && unbekannt > 0 && (
            <p className="text-xs text-amber-700 pt-1 border-t border-slate-100">
              {unbekannt} {unbekannt === 1 ? 'Datei ist' : 'Dateien sind'} kein hinterlegter Eingang. Dafür bitte „Von Claude live lesen lassen“ wählen.
            </p>
          )}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button onClick={zurueck} className="px-4 py-2.5 rounded-lg text-sm border border-slate-200 bg-white hover:bg-slate-50 flex items-center gap-2">
            <ArrowLeft size={15} /> Zurück
          </button>
          <button onClick={weiter} disabled={dateien.length === 0 || (mitClaude && !hatKey)}
            className="px-4 py-2.5 rounded-lg text-sm text-white flex items-center gap-2 disabled:opacity-50" style={{ backgroundColor: 'var(--mode-primary-light)' }}>
            <Sparkles size={15} /> {dateien.length || ''} {dateien.length === 1 ? 'Eingang' : 'Eingänge'} analysieren
          </button>
          {dateien.length > 0 && (
            <button onClick={() => setDateien([])} className="px-3 py-2.5 rounded-lg text-sm text-slate-500 border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5">
              <Trash2 size={14} /> Liste leeren
            </button>
          )}
        </div>
      </div>

      <EigenerEingangPanel onOpenVorgang={onOpenVorgang} />
    </div>
  )
}

// ============================================================
// Schritt 3 – Analyse
// ============================================================

function SchrittAnalyse({ fortschritt, protokoll, abbrechen }) {
  const anteil = fortschritt.gesamt ? Math.round((fortschritt.fertig / fortschritt.gesamt) * 100) : 0
  return (
    <div className="card-base p-5">
      <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
        <Loader2 size={18} className="animate-spin text-slate-400" /> Analyse läuft
      </h3>
      <p className="mt-1.5 text-sm text-slate-600">Je Eingang: lesen, Deckblatt füllen, prüfen.</p>
      <div className="mt-4 h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full transition-all duration-300" style={{ width: `${anteil}%`, backgroundColor: 'var(--mode-primary-light)' }} />
      </div>
      <div className="mt-1.5 text-xs text-slate-500">
        {fortschritt.fertig} von {fortschritt.gesamt} Eingängen · {fortschritt.aktuell || 'wird vorbereitet'}
      </div>
      {protokoll.length > 0 && (
        <div className="mt-4 max-h-72 overflow-y-auto space-y-1">
          {protokoll.map((z, i) => (
            <div key={i} className={`text-xs flex items-center gap-2 ${z.fehler ? 'text-red-600' : 'text-slate-500'}`}>
              {z.fehler ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} className="text-emerald-500" />}
              <span className="font-mono">{z.datei}</span>
              <span>{z.text}</span>
            </div>
          ))}
        </div>
      )}
      <button onClick={abbrechen} className="mt-4 px-4 py-2 rounded-lg text-sm border border-slate-200 bg-white hover:bg-slate-50">Abbrechen</button>
    </div>
  )
}

// ============================================================
// Schritt 4 – Ergebnis
// ============================================================

function Vorgangszeile({ vorgang, lauf, onOpenVorgang }) {
  const art = lauf.ergebnis.art
  return (
    <button onClick={() => onOpenVorgang(vorgang)}
      className="w-full text-left rounded-xl border border-slate-200 bg-white px-4 py-3 flex items-start gap-4 hover:border-slate-300 hover:bg-slate-50 transition-colors">
      <div className="w-[210px] shrink-0">
        <ErgebnisBadge art={art} />
        <div className="mt-1 text-xs text-slate-400">{lauf.bestanden} von {lauf.geprueft} Prüfungen ohne Befund</div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-base font-medium text-slate-800">{vorgang.kunde}</span>
          <LayoutChip vorgang={vorgang} />
          <HerkunftChip vorgang={vorgang} />
        </div>
        <div className="mt-1 text-sm text-slate-500 truncate">{vorgang.mail.betreff}</div>
        <div className="mt-1 text-xs text-slate-400">{vorgang.mail.vonName} · Eingang {vorgang.eingang} · {vorgang.form}</div>
        {art === 'rueckfrage' && <div className="mt-1.5 text-xs text-amber-800">Rückfrage: {lauf.fragen.join(' · ')}</div>}
        {art === 'sonderfall' && <div className="mt-1.5 text-xs text-slate-700">{lauf.ergebnis.gruende.join(' · ')}</div>}
        {art === 'bereit' && lauf.auftraege.length > 0 && <div className="mt-1.5 text-xs text-indigo-800">Recherche: {lauf.auftraege.join(' · ')}</div>}
      </div>
      <ChevronRight size={16} className="text-slate-300 shrink-0 mt-1" />
    </button>
  )
}

function Cluster({ art, eintraege, gesamt, offen, umschalten, onOpenVorgang }) {
  const e = ERGEBNIS[art]
  const anteil = gesamt ? Math.round((eintraege.length / gesamt) * 100) : 0
  return (
    <div className="card-base overflow-hidden">
      <button onClick={umschalten} className="w-full px-4 py-3.5 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors">
        <ChevronRight size={16} className={`text-slate-400 shrink-0 transition-transform ${offen ? 'rotate-90' : ''}`} />
        <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${e.bg}`}><e.Icon size={17} className={e.ton} strokeWidth={1.75} /></span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-slate-800">{e.titel}</span>
          <span className="block text-xs text-slate-500">{e.beschreibung}</span>
        </span>
        <span className="ml-auto flex items-center gap-3 shrink-0 pl-3">
          <span className="hidden md:block w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <span className={`block h-full ${e.balken}`} style={{ width: `${anteil}%` }} />
          </span>
          <span className="text-right">
            <span className="block text-xl font-semibold leading-tight text-slate-800">{eintraege.length}</span>
            <span className="block text-2xs text-slate-400">{anteil} % der Eingänge</span>
          </span>
        </span>
      </button>
      {offen && (
        <div className="border-t border-slate-100 px-3 py-3 space-y-2 bg-slate-50/40">
          {eintraege.map(({ vorgang, lauf }) => <Vorgangszeile key={vorgang.id} vorgang={vorgang} lauf={lauf} onOpenVorgang={onOpenVorgang} />)}
        </div>
      )}
    </div>
  )
}

function SchrittErgebnis({ laeufe, fehler, neuStarten, onOpenVorgang }) {
  const B = begriffe()
  const [suche, setSuche] = useState('')
  const [filter, setFilter] = useState('alle')
  const [layout, setLayout] = useState('')
  const [offene, setOffene] = useState({ bereit: true, rueckfrage: true, sonderfall: true })

  const zahl = (art) => laeufe.filter(l => l.lauf.ergebnis.art === art).length

  const gefiltert = useMemo(() => laeufe.filter(({ vorgang, lauf }) => {
    if (filter !== 'alle' && lauf.ergebnis.art !== filter) return false
    if (layout && layoutVon(vorgang).id !== layout) return false
    if (suche) {
      const text = [vorgang.kunde, vorgang.id, vorgang.mail.vonName, vorgang.mail.betreff].join(' ').toLowerCase()
      if (!text.includes(suche.toLowerCase())) return false
    }
    return true
  }), [laeufe, filter, layout, suche])

  return (
    <div className="space-y-4">
      <div className="card-base p-5">
        <h3 className="text-lg font-semibold text-slate-800">Ergebnis je Eingang</h3>
        <p className="mt-1.5 text-sm text-slate-600 max-w-4xl">
          Jeder Eingang hat ein Deckblatt und landet in einer von drei Gruppen: erfassungsbereit, Rückfrage vorbereitet oder
          Sonderfall. Jeder Eingang lässt sich öffnen: links das Original mit den Fundstellen, rechts das Deckblatt in der
          Reihenfolge der Erfassung {B.imSystem}, dann Prüfung und Rückfrage.
        </p>
        <button onClick={neuStarten} className="mt-3 px-3 py-2 rounded-lg text-sm border border-slate-200 bg-white hover:bg-slate-50 flex items-center gap-1.5">
          <RotateCcw size={14} /> Neue Analyse starten
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Kennzahl Icon={Inbox} wert={laeufe.length} label="Analysierte Eingänge" />
        <Kennzahl Icon={FileSpreadsheet} wert={`${laeufe.length} von ${laeufe.length}`} label="mit Deckblatt" />
        {ERGEBNIS_FOLGE.map(art => (
          <Kennzahl key={art} Icon={ERGEBNIS[art].Icon} wert={zahl(art)} label={ERGEBNIS[art].titel}
            ton={art === 'bereit' ? 'gruen' : art === 'rueckfrage' ? 'gelb' : 'grau'} />
        ))}
      </div>

      {fehler.length > 0 && (
        <div className="card-base p-4">
          <div className="text-sm font-medium text-slate-800 mb-1.5 flex items-center gap-2">
            <AlertTriangle size={15} className="text-amber-500 shrink-0" />
            {fehler.length} {fehler.length === 1 ? 'Datei konnte' : 'Dateien konnten'} nicht ausgewertet werden
          </div>
          {fehler.map((f, i) => <div key={i} className="text-xs text-slate-500"><span className="font-mono">{f.datei}</span> – {f.text}</div>)}
        </div>
      )}

      <Katalog />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Kunde, Vermittler oder Betreff …" value={suche} onChange={e => setSuche(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg text-base bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-(--mode-primary-light)/30" />
        </div>
        <select value={layout} onChange={e => setLayout(e.target.value)} className="text-base border border-slate-200 rounded-lg px-3 py-2.5 bg-white">
          <option value="">Alle Layouts</option>
          {ANGEBOTSLAYOUTS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          <option value="sonstig">Kein Angebotslayout</option>
        </select>
        <div className="flex items-center gap-1.5">
          {[{ id: 'alle', label: 'Alle Eingänge' }, ...ERGEBNIS_FOLGE.map(id => ({ id, label: ERGEBNIS[id].titel }))].map(f => (
            <button key={f.id}
              onClick={() => { setFilter(f.id); if (f.id !== 'alle') setOffene(o => ({ ...o, [f.id]: true })) }}
              style={filter === f.id ? { backgroundColor: 'var(--mode-primary-light)' } : undefined}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${filter === f.id ? 'text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ListChecks size={14} /> {gefiltert.length} von {laeufe.length} Eingängen, gruppiert nach Ergebnis
        </div>
        {ERGEBNIS_FOLGE.map(art => {
          const eintraege = gefiltert.filter(({ lauf }) => lauf.ergebnis.art === art)
          if (eintraege.length === 0) return null
          return (
            <Cluster key={art} art={art} eintraege={eintraege} gesamt={laeufe.length} offen={offene[art]}
              umschalten={() => setOffene(o => ({ ...o, [art]: !o[art] }))} onOpenVorgang={onOpenVorgang} />
          )
        })}
        {gefiltert.length === 0 && <div className="card-base p-8 text-center text-sm text-slate-500">Kein Eingang passt zu dieser Auswahl.</div>}
      </div>
    </div>
  )
}

// ============================================================
// Seite
// ============================================================

const warte = (ms) => new Promise(r => setTimeout(r, ms))

export default function StreckePage({ onOpenVorgang, onPraesentation, auswertungAngefordert = 0 }) {
  const [schritt, setSchritt] = useState(1)
  const [dateien, setDateien] = useState([])
  const [mitClaude, setMitClaude] = useState(false)
  const [fortschritt, setFortschritt] = useState({ fertig: 0, gesamt: 0, aktuell: '' })
  const [protokoll, setProtokoll] = useState([])
  const [laeufe, setLaeufe] = useState([])
  const [fehler, setFehler] = useState([])
  const abbruch = useRef(false)

  const direktZumErgebnis = useCallback(() => {
    setLaeufe(auswertung(VORGAENGE).laeufe)
    setFehler([])
    setSchritt(4)
  }, [])

  // Die Präsentation endet mit dem Sprung in die Auswertung aller Eingänge.
  useEffect(() => {
    if (auswertungAngefordert > 0) direktZumErgebnis()
  }, [auswertungAngefordert, direktZumErgebnis])

  async function liesLive(datei) {
    if (datei.art === 'pdf') {
      const antwort = await AI.leseEingang({ betreff: datei.name, pdfs: [{ name: datei.name, bytes: datei.bytes }], anhaenge: [datei.name] })
      const pdfUrl = URL.createObjectURL(new Blob([datei.bytes], { type: 'application/pdf' }))
      return AI.baueVorgang(antwort, { name: datei.name, art: 'pdf', betreff: datei.name, pdfUrl, anhaenge: [datei.name] })
    }
    const mail = datei.art === 'eml'
      ? AI.leseEml(datei.roh)
      : { betreff: datei.name, absender: '', text: datei.roh, anhaenge: [], pdfs: [] }
    const antwort = await AI.leseEingang(mail)
    return AI.baueVorgang(antwort, { name: datei.name, art: datei.art, ...mail })
  }

  async function analysiere() {
    abbruch.current = false
    setSchritt(3)
    setProtokoll([])
    setFehler([])
    setLaeufe([])
    setFortschritt({ fertig: 0, gesamt: dateien.length, aktuell: '' })

    const neueLaeufe = []
    const neueFehler = []

    for (let i = 0; i < dateien.length; i++) {
      if (abbruch.current) return
      const datei = dateien[i]
      setFortschritt({ fertig: i, gesamt: dateien.length, aktuell: datei.name })
      try {
        let vorgang
        if (mitClaude) {
          vorgang = await liesLive(datei)
        } else {
          vorgang = datei.vorgangId ? VORGAENGE.find(v => v.id === datei.vorgangId) : null
          if (!vorgang) throw new Error('Kein hinterlegter Eingang. Für eigene Dateien bitte „Von Claude live lesen lassen“ wählen.')
          await warte(260)
        }
        if (abbruch.current) return
        neueLaeufe.push({ vorgang, lauf: pruefe(vorgang) })
        setProtokoll(p => [...p, { datei: datei.name, text: mitClaude ? 'von Claude gelesen' : 'hinterlegte Auswertung' }])
      } catch (err) {
        neueFehler.push({ datei: datei.name, text: err.message })
        setProtokoll(p => [...p, { datei: datei.name, text: err.message, fehler: true }])
      }
    }

    setFortschritt({ fertig: dateien.length, gesamt: dateien.length, aktuell: 'fertig' })
    setLaeufe(neueLaeufe)
    setFehler(neueFehler)
    setSchritt(4)
  }

  function neuStarten() {
    setDateien([])
    setLaeufe([])
    setFehler([])
    setProtokoll([])
    setSchritt(1)
  }

  return (
    <div className="p-6 space-y-5 animate-fade-in-up">
      <ProzessUebersicht aufAbspielen={onPraesentation} />

      <div className="pt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h3 className="text-xl font-semibold text-slate-800">Selbst ausprobieren</h3>
        <p className="text-sm text-slate-500">
          Eingänge ansehen, hochladen, analysieren lassen und das Ergebnis je Eingang nachvollziehen.
        </p>
      </div>

      <Stepper aktiv={schritt} aufSchritt={setSchritt} />

      {schritt === 1 && (
        <SchrittEingaenge weiter={() => setSchritt(2)} direktZumErgebnis={direktZumErgebnis} aufEingang={v => onOpenVorgang(v, 1)} />
      )}
      {schritt === 2 && (
        <SchrittHochladen
          dateien={dateien} setDateien={setDateien} mitClaude={mitClaude} setMitClaude={setMitClaude}
          zurueck={() => setSchritt(1)} weiter={analysiere} onOpenVorgang={onOpenVorgang}
        />
      )}
      {schritt === 3 && (
        <SchrittAnalyse fortschritt={fortschritt} protokoll={protokoll} abbrechen={() => { abbruch.current = true; setSchritt(2) }} />
      )}
      {schritt === 4 && (
        <SchrittErgebnis laeufe={laeufe} fehler={fehler} neuStarten={neuStarten} onOpenVorgang={onOpenVorgang} />
      )}
    </div>
  )
}
