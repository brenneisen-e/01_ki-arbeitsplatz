import { useMemo, useState, useRef, useCallback, useEffect } from 'react'
import {
  Search, CheckCircle2, AlertTriangle, Ban, Gauge, ListChecks, Mail, Paperclip,
  ChevronRight, ShieldCheck, Download, Upload, Loader2, FileText, Trash2, X,
  ArrowLeft, ArrowRight, Sparkles, KeyRound, RotateCcw
} from 'lucide-react'
import { VORGAENGE, SPARTEN_FILTER, baueEigenenVorgang } from '../utils/pruefvorgaenge'
import { pruefe, auswertung } from '../utils/pruefengine'
import { PRUEFUNGEN_BY_STUFE, PRUEFUNGEN } from '../utils/pruefkatalog'
import { ladeEingaengeHerunter, leseVorgangId } from '../utils/eingangsexport'
import * as AI from '../utils/ai-processor'
import PruefungModal from '../components/PruefungModal'
import EingangModal from '../components/EingangModal'
import EigenerEingangPanel from '../components/EigenerEingangPanel'
import ProzessUebersicht from '../components/ProzessUebersicht'
import Praesentation from '../components/Praesentation'

const SCHRITTE = [
  { nr: 1, titel: 'Eingänge bereitstellen', kurz: 'Herunterladen' },
  { nr: 2, titel: 'Eingänge hochladen', kurz: 'Hochladen' },
  { nr: 3, titel: 'Analyse', kurz: 'Analysieren' },
  { nr: 4, titel: 'Dunkelverarbeitung', kurz: 'Ergebnis' }
]

const FILTER = [
  { id: 'alle', label: 'Alle Eingänge' },
  { id: 'clean', label: 'Dunkelverarbeitung' },
  { id: 'be', label: 'Prüfung offen' },
  { id: 'hart', label: 'Formal abgewiesen' }
]

const ERGEBNIS_BADGE = {
  clean: { klasse: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Durchgelaufen', Icon: CheckCircle2 },
  be:    { klasse: 'bg-red-50 text-red-700 border-red-200',             label: 'Business Exception', Icon: AlertTriangle },
  hart:  { klasse: 'bg-slate-100 text-slate-700 border-slate-300',      label: 'Formal abgewiesen', Icon: Ban }
}

/**
 * Cluster der Auswertung. Die Eingänge stehen nicht als eine lange Liste
 * untereinander, sondern in den drei Gruppen, die fachlich unterschiedlich
 * weiterlaufen. Die Dunkelverarbeitung ist zugeklappt – dort ist nichts zu tun.
 */
const CLUSTER = [
  {
    id: 'clean',
    titel: 'Dunkelverarbeitung',
    beschreibung: 'Ohne Ablehnungsgrund durchgelaufen, Übergabe an die automatisierte Weiterverarbeitung',
    Icon: CheckCircle2,
    kreis: 'bg-emerald-50',
    ton: 'text-emerald-600',
    balken: 'bg-emerald-500',
    offenInitial: false
  },
  {
    id: 'be',
    titel: 'Prüfung offen',
    beschreibung: 'Business Exception: mindestens ein Grund gemerkt, Aussteuerung an den Themenpostkorb',
    Icon: AlertTriangle,
    kreis: 'bg-red-50',
    ton: 'text-red-600',
    balken: 'bg-red-500',
    offenInitial: true
  },
  {
    id: 'hart',
    titel: 'Formal abgewiesen',
    beschreibung: 'Hartes Kriterium verletzt, die Verarbeitung endet sofort',
    Icon: Ban,
    kreis: 'bg-slate-100',
    ton: 'text-slate-600',
    balken: 'bg-slate-400',
    offenInitial: true
  }
]

const CLUSTER_START = Object.fromEntries(CLUSTER.map(c => [c.id, c.offenInitial]))

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
            <button
              onClick={() => erledigt && aufSchritt(s.nr)}
              disabled={!erledigt}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                erledigt ? 'hover:bg-slate-50 cursor-pointer' : 'cursor-default'
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                ist ? 'text-white' : erledigt ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
              }`} style={ist ? { backgroundColor: 'var(--mode-primary-light)' } : undefined}>
                {erledigt ? <CheckCircle2 size={14} /> : s.nr}
              </span>
              <span className={`text-sm ${ist ? 'font-semibold text-slate-800' : erledigt ? 'text-slate-600' : 'text-slate-400'}`}>
                {s.titel}
              </span>
            </button>
            {i < SCHRITTE.length - 1 && <ChevronRight size={14} className="text-slate-300" />}
          </div>
        )
      })}
    </div>
  )
}

function Kennzahl({ Icon, wert, label, ton }) {
  const toene = { neutral: 'text-slate-800', gruen: 'text-emerald-600', rot: 'text-red-600', grau: 'text-slate-500' }
  return (
    <div className="card-base px-4 py-3.5 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
        <Icon size={18} className="text-slate-500" strokeWidth={1.75} />
      </div>
      <div>
        <div className={`text-xl font-semibold leading-tight ${toene[ton] || toene.neutral}`}>{wert}</div>
        <div className="text-xs text-slate-500">{label}</div>
      </div>
    </div>
  )
}

function Katalog({ offenInitial = false }) {
  const [offen, setOffen] = useState(offenInitial)
  const harte = PRUEFUNGEN_BY_STUFE.filter(s => s.art === 'hart').reduce((n, s) => n + s.pruefungen.length, 0)
  const weiche = PRUEFUNGEN.length - harte

  return (
    <div className="card-base overflow-hidden">
      <button onClick={() => setOffen(o => !o)} className="w-full px-5 py-4 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors">
        <span className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
          <ShieldCheck size={17} className="text-slate-500" strokeWidth={1.75} />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-slate-800">Prüfkatalog</span>
          <span className="block text-xs text-slate-500">
            {harte} harte Kriterien, dann {weiche} inhaltliche Prüfungen, dann die Bewertung der gemerkten Gründe
          </span>
        </span>
        <span className="ml-auto flex items-center gap-3 shrink-0">
          <span className="hidden md:flex items-center gap-1.5">
            {PRUEFUNGEN_BY_STUFE.map(st => (
              <span key={st.id} className={`h-1.5 rounded-full ${st.art === 'hart' ? 'bg-slate-800' : 'bg-slate-300'}`}
                style={{ width: 12 + st.pruefungen.length * 5 }} />
            ))}
          </span>
          <ChevronRight size={16} className={`text-slate-400 transition-transform ${offen ? 'rotate-90' : ''}`} />
        </span>
      </button>

      {offen && (
        <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {PRUEFUNGEN_BY_STUFE.map(stufe => {
            const hart = stufe.art === 'hart'
            return (
              <div key={stufe.id} className="relative rounded-xl border border-slate-200 bg-white p-4 pl-5 overflow-hidden">
                <span className="absolute left-0 top-0 bottom-0 w-1"
                  style={{ background: hart ? '#0f172a' : 'var(--mode-primary-light)' }} />
                <div className="flex items-center gap-2.5">
                  <span className={`w-7 h-7 rounded-lg text-sm font-semibold flex items-center justify-center shrink-0 ${
                    hart ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>{stufe.nr}</span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-900 leading-tight">{stufe.titel}</span>
                    <span className="block text-[11px] text-slate-400">
                      {stufe.pruefungen.length} {stufe.pruefungen.length === 1 ? 'Prüfung' : 'Prüfungen'} ·{' '}
                      {hart ? 'Verstoß beendet die Verarbeitung' : 'Verstoß wird nur gemerkt'}
                    </span>
                  </span>
                </div>
                <p className="mt-2.5 text-xs text-slate-500 leading-relaxed">{stufe.beschreibung}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {stufe.pruefungen.map(p => (
                    <span key={p.id} className="text-[11px] leading-tight px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-600">
                      {p.titel}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ============================================================
// Schritt 1 – Eingänge bereitstellen
// ============================================================

function auszug(text, laenge = 130) {
  const eins = text.replace(/\s+/g, ' ').trim()
  return eins.length > laenge ? eins.slice(0, laenge).replace(/\s\S*$/, '') + ' …' : eins
}

function EingangKachel({ vorgang, onClick }) {
  const { mail } = vorgang
  return (
    <button
      onClick={onClick}
      className="text-left rounded-xl border border-slate-200 bg-white p-4 flex flex-col gap-2 hover:border-slate-300 hover:bg-slate-50 transition-colors"
    >
      <div className="flex items-center gap-2 text-xs text-slate-400 min-w-0">
        <Mail size={13} className="shrink-0" />
        <span className="truncate">{mail.vonName}</span>
        <span className="ml-auto shrink-0 font-mono">{mail.datum}</span>
      </div>
      <div className="text-sm font-medium text-slate-800 leading-snug line-clamp-2">{mail.betreff}</div>
      <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{auszug(mail.text)}</p>
      <div className="mt-auto pt-2 border-t border-slate-100 flex items-center gap-2 text-xs min-w-0">
        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">{vorgang.sparte}</span>
        {mail.anhaenge.length > 0 ? (
          <span className="text-slate-500 flex items-center gap-1 min-w-0">
            <Paperclip size={11} className="shrink-0" />
            <span className="truncate">{mail.anhaenge[0].name}</span>
            {mail.anhaenge.length > 1 && <span className="shrink-0">+{mail.anhaenge.length - 1}</span>}
          </span>
        ) : (
          <span className="text-amber-600 flex items-center gap-1"><Paperclip size={11} /> ohne Anhang</span>
        )}
      </div>
    </button>
  )
}

function EingangKacheln({ aufEingang }) {
  const [alle, setAlle] = useState(false)
  const ANZAHL = 8
  const liste = alle ? VORGAENGE : VORGAENGE.slice(0, ANZAHL)

  return (
    <div className="card-base p-5">
      <h3 className="text-lg font-semibold text-slate-800">So sehen die Eingänge aus</h3>
      <p className="mt-1.5 text-sm text-slate-600 max-w-4xl">
        Jede Kachel ist ein Maklerschreiben, wie es im Postfach liegt. Anklicken zeigt die Mail im Original
        samt Anhängen – die Vollmacht lässt sich dort öffnen.
      </p>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {liste.map(v => <EingangKachel key={v.id} vorgang={v} onClick={() => aufEingang(v)} />)}
      </div>

      {VORGAENGE.length > ANZAHL && (
        <button
          onClick={() => setAlle(a => !a)}
          className="mt-4 px-3 py-2 rounded-lg text-sm border border-slate-200 bg-white hover:bg-slate-50 flex items-center gap-1.5 text-slate-700"
        >
          <ChevronRight size={14} className={`transition-transform ${alle ? 'rotate-90' : ''}`} />
          {alle ? `Nur die ersten ${ANZAHL} zeigen` : `Alle ${VORGAENGE.length} Eingänge zeigen`}
        </button>
      )}
    </div>
  )
}

function SchrittHerunterladen({ weiter, direktZumErgebnis, aufEingang }) {
  const [geladen, setGeladen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="card-base p-5">
        <h3 className="text-lg font-semibold text-slate-800">Eingänge bereitstellen</h3>
        <p className="mt-1.5 text-sm text-slate-600 max-w-4xl">
          Bestandsübertragungen kommen als unstrukturierte E-Mail an: Freitext, jeder Vermittler schreibt anders,
          die entscheidenden Angaben stehen mal im Text, mal nur in der angehängten Vollmacht. Laden Sie sich
          {' '}{VORGAENGE.length} solcher Eingänge als EML-Dateien herunter – Sie können sie in Ihrem Mailprogramm
          öffnen und ansehen, bevor Sie sie im nächsten Schritt hier hochladen.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Alle Namen, Adressen, Vertrags- und Vermittlernummern sind erfunden.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={() => { ladeEingaengeHerunter(); setGeladen(true) }}
            className="px-4 py-2.5 rounded-lg text-sm text-white flex items-center gap-2"
            style={{ backgroundColor: 'var(--mode-primary-light)' }}
          >
            <Download size={16} /> {VORGAENGE.length} Eingänge als ZIP herunterladen
          </button>
          <button
            onClick={weiter}
            className="px-4 py-2.5 rounded-lg text-sm border border-slate-200 bg-white hover:bg-slate-50 flex items-center gap-2"
          >
            Weiter zum Hochladen <ArrowRight size={15} />
          </button>
          {geladen && (
            <span className="text-sm text-emerald-600 flex items-center gap-1.5">
              <CheckCircle2 size={15} /> ZIP wurde erzeugt
            </span>
          )}
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

function SchrittHochladen({ dateien, setDateien, zurueck, weiter, mitClaude, setMitClaude, aufPruefen }) {
  const [ueber, setUeber] = useState(false)
  const inputRef = useRef(null)
  const hatKey = AI.hasApiKey()

  const einlesen = useCallback(async (fileList) => {
    // Erst alle Dateien vollständig lesen: das Eingabefeld wird direkt nach dem
    // Auswählen geleert, danach sind die Dateiobjekte nicht mehr zuverlässig lesbar.
    const gelesen = await Promise.all(
      Array.from(fileList)
        .filter(f => f.name.toLowerCase().endsWith('.eml'))
        .map(async f => {
          try {
            const roh = await f.text()
            return { name: f.name, roh, vorgangId: leseVorgangId(roh) }
          } catch {
            return null
          }
        })
    )
    const neue = gelesen.filter(Boolean)
    setDateien(alt => {
      const namen = new Set(alt.map(d => d.name))
      return [...alt, ...neue.filter(d => !namen.has(d.name))]
    })
  }, [setDateien])

  return (
    <div className="space-y-4">
      <div className="card-base p-5">
        <h3 className="text-lg font-semibold text-slate-800">Eingänge hochladen</h3>
        <p className="mt-1.5 text-sm text-slate-600 max-w-4xl">
          Ziehen Sie die heruntergeladenen EML-Dateien hierher oder wählen Sie sie aus. Sie können auch eigene
          Maklerschreiben hochladen.
        </p>

        <div
          onDragOver={e => { e.preventDefault(); setUeber(true) }}
          onDragLeave={() => setUeber(false)}
          onDrop={e => { e.preventDefault(); setUeber(false); einlesen(e.dataTransfer.files) }}
          onClick={() => inputRef.current?.click()}
          className={`mt-4 rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
            ueber ? 'border-slate-400 bg-slate-100' : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
          }`}
        >
          <Upload size={26} className="mx-auto text-slate-400" strokeWidth={1.5} />
          <div className="mt-2 text-sm text-slate-600">EML-Dateien hierher ziehen oder klicken</div>
          <div className="text-xs text-slate-400 mt-0.5">Mehrfachauswahl möglich</div>
          <input
            ref={inputRef} type="file" accept=".eml" multiple className="hidden"
            onChange={async e => { const feld = e.target; await einlesen(feld.files); feld.value = '' }}
          />
        </div>

        {dateien.length > 0 && (
          <div className="mt-4 space-y-1.5 max-h-64 overflow-y-auto">
            {dateien.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2.5 rounded-lg border border-slate-200 px-3 py-2">
                <FileText size={14} className="text-slate-400 shrink-0" />
                <span className="text-sm text-slate-700 truncate">{d.name}</span>
                {d.vorgangId
                  ? <span className="text-xs text-slate-400 font-mono shrink-0">{d.vorgangId}</span>
                  : <span className="text-xs text-amber-600 shrink-0">unbekannter Eingang</span>}
                <button
                  onClick={() => setDateien(alt => alt.filter((_, j) => j !== i))}
                  className="ml-auto p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Analysevariante */}
        <div className="mt-4 rounded-lg border border-slate-200 p-3 space-y-2">
          <div className="text-xs uppercase tracking-wide text-slate-400">Wie sollen die Felder gelesen werden?</div>
          <label className="flex items-start gap-2.5 text-sm text-slate-700 cursor-pointer">
            <input type="radio" checked={!mitClaude} onChange={() => setMitClaude(false)} className="mt-1" />
            <span>
              Hinterlegte Auswertung verwenden
              <span className="block text-xs text-slate-500">
                Ohne API-Aufruf. Funktioniert nur für die heruntergeladenen Demo-Eingänge.
              </span>
            </span>
          </label>
          <label className="flex items-start gap-2.5 text-sm text-slate-700 cursor-pointer">
            <input type="radio" checked={mitClaude} onChange={() => setMitClaude(true)} className="mt-1" />
            <span className="flex-1">
              Felder von Claude auslesen lassen
              <span className="block text-xs text-slate-500">
                Jede Mail geht einzeln an die Anthropic-API. {hatKey
                  ? 'Ein API Key ist hinterlegt.'
                  : 'Dafür ist ein API Key nötig – unten unter „Eigenen Eingang prüfen“ zu hinterlegen.'}
              </span>
            </span>
            {!hatKey && <KeyRound size={14} className="text-amber-500 mt-1" />}
          </label>
          <p className="text-xs text-slate-500 pt-1 border-t border-slate-100">
            Die Antworten von Bestands-, Vermittler- und Partnersystem sind in dieser Umgebung nicht angebunden.
            Für die Demo-Eingänge stammen sie aus dem hinterlegten Datensatz.
          </p>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button onClick={zurueck} className="px-4 py-2.5 rounded-lg text-sm border border-slate-200 bg-white hover:bg-slate-50 flex items-center gap-2">
            <ArrowLeft size={15} /> Zurück
          </button>
          <button
            onClick={weiter}
            disabled={dateien.length === 0 || (mitClaude && !hatKey)}
            className="px-4 py-2.5 rounded-lg text-sm text-white flex items-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: 'var(--mode-primary-light)' }}
          >
            <Sparkles size={15} /> {dateien.length || ''} Eingänge analysieren
          </button>
          {dateien.length > 0 && (
            <button onClick={() => setDateien([])} className="px-3 py-2.5 rounded-lg text-sm text-slate-500 border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5">
              <Trash2 size={14} /> Liste leeren
            </button>
          )}
        </div>
      </div>

      <EigenerEingangPanel onPruefen={aufPruefen} />
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
      <p className="mt-1.5 text-sm text-slate-600">
        Je Eingang werden die Felder gelesen und anschließend die {PRUEFUNGEN.length} Prüfungen des Katalogs
        ausgeführt.
      </p>

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

      <button onClick={abbrechen} className="mt-4 px-4 py-2 rounded-lg text-sm border border-slate-200 bg-white hover:bg-slate-50">
        Abbrechen
      </button>
    </div>
  )
}

// ============================================================
// Schritt 4 – Ergebnis
// ============================================================

function Vorgangszeile({ vorgang, lauf, quelle, aufPruefen }) {
  const badge = ERGEBNIS_BADGE[lauf.ergebnis.art]
  const BadgeIcon = badge.Icon

  return (
    <button
      onClick={() => aufPruefen(vorgang)}
      className="w-full text-left rounded-xl border border-slate-200 bg-white px-4 py-3 flex items-start gap-4 hover:border-slate-300 hover:bg-slate-50 transition-colors"
    >
      <div className="w-[190px] shrink-0">
        <span className={`text-xs px-2.5 py-1 rounded-full border inline-flex items-center gap-1.5 ${badge.klasse}`}>
          <BadgeIcon size={12} /> {badge.label}
        </span>
        <div className="mt-1 text-xs text-slate-400">{lauf.bestanden} / {lauf.geprueft} Prüfungen</div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-base font-medium text-slate-800">{vorgang.kunde}</span>
          <span className="text-xs font-mono text-slate-400">{vorgang.deckblatt.vnr || 'ohne Vertragsnummer'}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{vorgang.sparte}</span>
          {vorgang.mail.anhaenge.length === 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
              <Paperclip size={11} /> ohne Anhang
            </span>
          )}
          {quelle === 'claude' && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
              <Sparkles size={11} /> von Claude gelesen
            </span>
          )}
        </div>
        <div className="mt-1 text-sm text-slate-500 truncate">{vorgang.mail.betreff}</div>
        <div className="mt-1 text-xs text-slate-400">
          {vorgang.deckblatt.vermittlerName} · Eingang {vorgang.eingang}
        </div>
        {lauf.ergebnis.gruende.length > 0 && (
          <div className="mt-1.5 text-xs text-red-700">{lauf.ergebnis.gruende.join(' · ')}</div>
        )}
      </div>

      <ChevronRight size={16} className="text-slate-300 shrink-0 mt-1" />
    </button>
  )
}

function Cluster({ cluster, eintraege, gesamt, offen, umschalten, aufPruefen }) {
  const Icon = cluster.Icon
  const anteil = gesamt ? Math.round((eintraege.length / gesamt) * 100) : 0

  return (
    <div className="card-base overflow-hidden">
      <button onClick={umschalten} className="w-full px-4 py-3.5 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors">
        <ChevronRight size={16} className={`text-slate-400 shrink-0 transition-transform ${offen ? 'rotate-90' : ''}`} />
        <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${cluster.kreis}`}>
          <Icon size={17} className={cluster.ton} strokeWidth={1.75} />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-slate-800">{cluster.titel}</span>
          <span className="block text-xs text-slate-500">{cluster.beschreibung}</span>
        </span>
        <span className="ml-auto flex items-center gap-3 shrink-0 pl-3">
          <span className="hidden md:block w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <span className={`block h-full ${cluster.balken}`} style={{ width: `${anteil}%` }} />
          </span>
          <span className="text-right">
            <span className="block text-xl font-semibold leading-tight text-slate-800">{eintraege.length}</span>
            <span className="block text-[11px] text-slate-400">{anteil} % der Eingänge</span>
          </span>
        </span>
      </button>

      {offen && (
        <div className="border-t border-slate-100 px-3 py-3 space-y-2 bg-slate-50/40">
          {eintraege.map(({ vorgang, lauf, quelle }) => (
            <Vorgangszeile
              key={vorgang.id + vorgang.mail.betreff}
              vorgang={vorgang} lauf={lauf} quelle={quelle}
              aufPruefen={aufPruefen}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function SchrittErgebnis({ laeufe, fehler, neuStarten, aufPruefen }) {
  const [suche, setSuche] = useState('')
  const [filter, setFilter] = useState('alle')
  const [sparte, setSparte] = useState('')
  const [offeneCluster, setOffeneCluster] = useState(CLUSTER_START)

  const kennzahlen = useMemo(() => {
    const clean = laeufe.filter(l => l.lauf.ergebnis.art === 'clean').length
    const hart = laeufe.filter(l => l.lauf.ergebnis.art === 'hart').length
    const be = laeufe.filter(l => l.lauf.ergebnis.art === 'be').length
    return { gesamt: laeufe.length, clean, hart, be, quote: laeufe.length ? Math.round((clean / laeufe.length) * 100) : 0 }
  }, [laeufe])

  const gefiltert = useMemo(() => laeufe.filter(({ vorgang, lauf }) => {
    if (filter !== 'alle' && lauf.ergebnis.art !== filter) return false
    if (sparte && vorgang.sparte !== sparte) return false
    if (suche) {
      const s = suche.toLowerCase()
      const text = [vorgang.kunde, vorgang.id, vorgang.deckblatt.vnr, vorgang.deckblatt.vermittlerName, vorgang.mail.betreff]
        .filter(Boolean).join(' ').toLowerCase()
      if (!text.includes(s)) return false
    }
    return true
  }), [laeufe, filter, sparte, suche])

  return (
    <div className="space-y-4">
      <div className="card-base p-5">
        <h3 className="text-lg font-semibold text-slate-800">Dunkelverarbeitung</h3>
        <p className="mt-1.5 text-sm text-slate-600 max-w-4xl">
          Zuerst laufen die harten Kriterien – ist eines verletzt, endet die Verarbeitung sofort. Danach laufen die
          inhaltlichen Prüfungen vollständig durch; jeder Verstoß wird nur gemerkt. Erst am Ende entscheidet die Summe
          der gemerkten Gründe über Weiterverarbeitung oder Aussteuerung. Die Eingänge stehen in drei Clustern:
          was dunkel durchgelaufen ist, bleibt zugeklappt – aufzuklappen ist, was Arbeit macht. Jeder Eingang lässt
          sich einzeln öffnen: links der Eingang samt Anhängen, in der Mitte das KI-Deckblatt, rechts die Prüfungen.
        </p>
        <button onClick={neuStarten} className="mt-3 px-3 py-2 rounded-lg text-sm border border-slate-200 bg-white hover:bg-slate-50 flex items-center gap-1.5">
          <RotateCcw size={14} /> Neue Analyse starten
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Kennzahl Icon={Mail} wert={kennzahlen.gesamt} label="Analysierte Eingänge" ton="neutral" />
        <Kennzahl Icon={CheckCircle2} wert={kennzahlen.clean} label="Sauber durchgelaufen" ton="gruen" />
        <Kennzahl Icon={AlertTriangle} wert={kennzahlen.be} label="Business Exception" ton="rot" />
        <Kennzahl Icon={Ban} wert={kennzahlen.hart} label="Formal abgewiesen" ton="grau" />
        <Kennzahl Icon={Gauge} wert={`${kennzahlen.quote} %`} label="Dunkelverarbeitungsquote" ton="gruen" />
      </div>

      {fehler.length > 0 && (
        <div className="card-base p-4 border-l-4 border-l-amber-400">
          <div className="text-sm font-medium text-slate-800 mb-1.5">
            {fehler.length} Datei{fehler.length > 1 ? 'en' : ''} konnte{fehler.length > 1 ? 'n' : ''} nicht ausgewertet werden
          </div>
          {fehler.map((f, i) => (
            <div key={i} className="text-xs text-slate-500"><span className="font-mono">{f.datei}</span> – {f.text}</div>
          ))}
        </div>
      )}

      <Katalog />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" placeholder="Kunde, Vertrag, Vermittler oder Betreff..."
            value={suche} onChange={e => setSuche(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg text-base bg-white focus:outline-none focus:ring-2 focus:ring-[#c41230]/30"
            style={{ border: 'var(--card-border)' }}
          />
        </div>
        <select value={sparte} onChange={e => setSparte(e.target.value)}
          className="text-base border border-slate-200 rounded-lg px-3 py-2.5 bg-white">
          <option value="">Alle Sparten</option>
          {SPARTEN_FILTER.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="flex items-center gap-1.5">
          {FILTER.map(f => (
            <button key={f.id}
              onClick={() => {
                setFilter(f.id)
                if (f.id !== 'alle') setOffeneCluster(o => ({ ...o, [f.id]: true }))
              }}
              style={filter === f.id ? { backgroundColor: 'var(--mode-primary-light)' } : undefined}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                filter === f.id ? 'text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ListChecks size={14} /> {gefiltert.length} von {kennzahlen.gesamt} Eingängen, gruppiert nach Ergebnis
        </div>

        {CLUSTER.map(cluster => {
          const eintraege = gefiltert.filter(({ lauf }) => lauf.ergebnis.art === cluster.id)
          if (eintraege.length === 0) return null
          return (
            <Cluster
              key={cluster.id}
              cluster={cluster}
              eintraege={eintraege}
              gesamt={kennzahlen.gesamt}
              offen={offeneCluster[cluster.id]}
              umschalten={() => setOffeneCluster(o => ({ ...o, [cluster.id]: !o[cluster.id] }))}
              aufPruefen={aufPruefen}
            />
          )
        })}

        {gefiltert.length === 0 && (
          <div className="card-base p-8 text-center text-sm text-slate-500">Kein Eingang passt zu dieser Auswahl.</div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// Seite
// ============================================================

export default function PruefstreckePage({ praesentationAngefordert = false, onPraesentationGestartet }) {
  const [schritt, setSchritt] = useState(1)
  const [dateien, setDateien] = useState([])
  const [mitClaude, setMitClaude] = useState(false)
  const [fortschritt, setFortschritt] = useState({ fertig: 0, gesamt: 0, aktuell: '' })
  const [protokoll, setProtokoll] = useState([])
  const [laeufe, setLaeufe] = useState([])
  const [fehler, setFehler] = useState([])
  const [offenerVorgang, setOffenerVorgang] = useState(null)
  const [startSchritt, setStartSchritt] = useState(1)
  const [offenerEingang, setOffenerEingang] = useState(null)
  const [praesentation, setPraesentation] = useState({ offen: false, start: 0 })

  // Play-Knopf im Kopf: Präsentation ab dem ersten Schritt öffnen.
  useEffect(() => {
    if (!praesentationAngefordert) return
    setPraesentation({ offen: true, start: 0 })
    onPraesentationGestartet?.()
  }, [praesentationAngefordert, onPraesentationGestartet])

  // Aus der Liste beginnt das Detail bei der Mail, aus dem Eingangsmodal beim Deckblatt.
  function oeffneVorgang(v, schritt = 1) { setStartSchritt(schritt); setOffenerVorgang(v) }
  const abbruch = useRef(false)

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

      const demo = datei.vorgangId ? VORGAENGE.find(v => v.id === datei.vorgangId) : null

      try {
        let vorgang
        let quelle = 'hinterlegt'

        if (mitClaude) {
          const kopf = datei.roh.slice(0, datei.roh.search(/\r?\n\r?\n/))
          const betreffRoh = kopf.match(/^Subject:\s*(.*)$/mi)?.[1] || ''
          const absender = kopf.match(/^From:\s*(.*)$/mi)?.[1] || ''
          const blob = new File([datei.roh], datei.name, { type: 'message/rfc822' })
          const mail = await AI.parseEmlFile(blob)
          const felder = await AI.leseDeckblattfelder({
            betreff: mail.subject || betreffRoh,
            absender: mail.sender || absender,
            text: mail.body,
            anhaenge: mail.attachmentNames
          })
          vorgang = baueEigenenVorgang({
            mail: {
              von: mail.sender, vonName: mail.sender, an: 'maklerservice@versicherer.de',
              datum: demo?.eingang || new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
              betreff: mail.subject, text: mail.body,
              anhaenge: (mail.attachmentNames || []).map(n => ({ name: n, typ: 'Anhang', info: 'vom Absender beigefügt' }))
            },
            deckblatt: felder,
            // Die Systemantworten kommen aus dem hinterlegten Datensatz; ein
            // Bestandssystem ist in dieser Umgebung nicht angebunden.
            bestand: demo ? demo.bestand : {}
          })
          vorgang.id = demo?.id || datei.name
          quelle = 'claude'
        } else if (demo) {
          vorgang = demo
        } else {
          throw new Error('Kein hinterlegter Eingang – für eigene Dateien die Auslesung mit Claude wählen.')
        }

        neueLaeufe.push({ vorgang, lauf: pruefe(vorgang), quelle })
        setProtokoll(p => [...p, { datei: datei.name, text: 'ausgewertet' }])
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

  function direktZumErgebnis() {
    const alle = auswertung(VORGAENGE)
    setLaeufe(alle.laeufe.map(l => ({ ...l, quelle: 'hinterlegt' })))
    setFehler([])
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
      <ProzessUebersicht aufAbspielen={i => setPraesentation({ offen: true, start: i })} />

      <div className="pt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h3 className="text-xl font-semibold text-slate-800">Selbst ausprobieren</h3>
        <p className="text-sm text-slate-500">
          Eingänge als EML herunterladen, hochladen, analysieren lassen und das Ergebnis je Vorgang nachvollziehen.
          Der Prüfkatalog bildet die Prüfungen ab, die im Markt üblich sind.
        </p>
      </div>

      <Stepper aktiv={schritt} aufSchritt={setSchritt} />

      {schritt === 1 && (
        <SchrittHerunterladen weiter={() => setSchritt(2)} direktZumErgebnis={direktZumErgebnis} aufEingang={setOffenerEingang} />
      )}
      {schritt === 2 && (
        <SchrittHochladen
          dateien={dateien} setDateien={setDateien}
          mitClaude={mitClaude} setMitClaude={setMitClaude}
          zurueck={() => setSchritt(1)} weiter={analysiere}
          aufPruefen={v => oeffneVorgang(v, 1)}
        />
      )}
      {schritt === 3 && (
        <SchrittAnalyse
          fortschritt={fortschritt} protokoll={protokoll}
          abbrechen={() => { abbruch.current = true; setSchritt(2) }}
        />
      )}
      {schritt === 4 && (
        <SchrittErgebnis laeufe={laeufe} fehler={fehler} neuStarten={neuStarten} aufPruefen={v => oeffneVorgang(v, 1)} />
      )}

      <EingangModal
        vorgang={offenerEingang}
        onClose={() => setOffenerEingang(null)}
        aufPruefen={v => { setOffenerEingang(null); oeffneVorgang(v, 2) }}
      />
      <PruefungModal vorgang={offenerVorgang} startSchritt={startSchritt} onClose={() => setOffenerVorgang(null)} />
      <Praesentation
        offen={praesentation.offen}
        startSchritt={praesentation.start}
        onClose={() => setPraesentation(p => ({ ...p, offen: false }))}
        aufAuswertung={direktZumErgebnis}
      />
    </div>
  )
}
