/**
 * Detailansicht eines Eingangs als Wizard in drei Schritten:
 *
 *   1  Unstrukturierter Eingang   die Mail, wie der Vermittler sie geschrieben hat,
 *                                 inklusive der Anhänge, die sich öffnen lassen
 *   2  KI-Deckblatt               dieselben Angaben als festes Formular
 *   3  Automatische Prüfung       der Prüfkatalog, ausgeführt auf dem Deckblatt
 *
 * Standard ist ein Schritt auf einmal in voller Breite. Für den Vergleich
 * lassen sich 1+2, 2+3 oder alle drei nebeneinander stellen.
 */

import { useMemo, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  X, Mail, Check, AlertTriangle, Info, Minus, ArrowRight, ArrowLeft,
  ChevronDown, ChevronRight, Ban, CheckCircle2, ListChecks, FileSpreadsheet, Columns3
} from 'lucide-react'
import { pruefe } from '../utils/pruefengine'
import { STUFEN } from '../utils/pruefkatalog'
import Deckblatt from './Deckblatt'
import Dokumentansicht from './Dokumentansicht'
import MailAnsicht from './MailAnsicht'

const STATUS_STYLE = {
  ok:            { icon: Check,          farbe: 'text-emerald-600', bg: 'bg-emerald-50',  rand: 'border-emerald-200', label: 'bestanden' },
  be:            { icon: AlertTriangle,  farbe: 'text-red-600',     bg: 'bg-red-50',      rand: 'border-red-200',     label: 'Business Exception' },
  info:          { icon: Info,           farbe: 'text-amber-600',   bg: 'bg-amber-50',    rand: 'border-amber-200',   label: 'Hinweis' },
  neutral:       { icon: Minus,          farbe: 'text-slate-400',   bg: 'bg-slate-50',    rand: 'border-slate-200',   label: 'nicht einschlägig' },
  uebersprungen: { icon: Minus,          farbe: 'text-slate-300',   bg: 'bg-slate-50/60', rand: 'border-slate-100',   label: 'nicht mehr ausgeführt' }
}

const ERGEBNIS_BADGE = {
  clean: { klasse: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Dunkelverarbeitung', Icon: CheckCircle2 },
  be:    { klasse: 'bg-red-50 text-red-700 border-red-200',             label: 'Prüfung offen',      Icon: AlertTriangle },
  hart:  { klasse: 'bg-slate-100 text-slate-700 border-slate-300',      label: 'Formal abgewiesen',  Icon: Ban }
}

function Spaltenkopf({ nr, titel, untertitel, Icon }) {
  return (
    <div className="flex items-start gap-2.5 mb-3">
      <span className="w-6 h-6 rounded-full text-white text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5"
        style={{ backgroundColor: 'var(--mode-primary-light)' }}>
        {nr}
      </span>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
          <Icon size={14} className="text-slate-400 shrink-0" /> {titel}
        </div>
        <div className="text-[11px] text-slate-400 leading-snug">{untertitel}</div>
      </div>
    </div>
  )
}

function Schritt({ schritt }) {
  const style = STATUS_STYLE[schritt.status] || STATUS_STYLE.neutral
  const Icon = style.icon
  const zeigtWerte = schritt.status === 'ok' || schritt.status === 'be' || schritt.status === 'info'

  return (
    <div className={`rounded-lg border ${style.rand} ${style.bg} px-3 py-2.5`}>
      <div className="flex items-start gap-2.5">
        <Icon size={16} className={`${style.farbe} mt-0.5 shrink-0`} strokeWidth={2} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className={`text-sm font-medium ${schritt.status === 'uebersprungen' ? 'text-slate-400' : 'text-slate-800'}`}>
              {schritt.pruefung.titel}
            </span>
            <span className={`text-[11px] uppercase tracking-wide ${style.farbe}`}>{style.label}</span>
          </div>

          <div className="mt-0.5 text-[11px] text-slate-400">
            {schritt.pruefung.feld} · Abgleich gegen {schritt.pruefung.abgleich}
          </div>

          {zeigtWerte && (
            <div className="mt-1.5 flex items-center gap-2 text-xs flex-wrap">
              <span className="px-1.5 py-0.5 rounded bg-white/70 border border-slate-200 text-slate-600">
                <span className="text-slate-400">gelesen: </span>
                <span className="font-mono">{schritt.ist || '–'}</span>
              </span>
              <ArrowRight size={12} className="text-slate-300" />
              <span className="px-1.5 py-0.5 rounded bg-white/70 border border-slate-200 text-slate-600">
                <span className="text-slate-400">erwartet: </span>
                <span className="font-mono">{schritt.soll || '–'}</span>
              </span>
            </div>
          )}

          {schritt.hinweis && (
            <div className={`mt-1.5 text-xs ${schritt.status === 'be' ? 'text-red-700' : 'text-slate-500'}`}>
              {schritt.hinweis}
            </div>
          )}

          {schritt.status === 'be' && schritt.pruefung.beText && (
            <div className="mt-1.5 text-xs font-medium text-red-800">
              Gemerkt: {schritt.pruefung.beText}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Stufe({ stufe, schritte, offenInitial }) {
  const [offen, setOffen] = useState(offenInitial)
  const bes = schritte.filter(s => s.status === 'be').length
  const oks = schritte.filter(s => s.status === 'ok').length
  const skips = schritte.filter(s => s.status === 'uebersprungen').length
  const komplettUebersprungen = skips === schritte.length

  return (
    <div className="card-base overflow-hidden">
      <button
        onClick={() => setOffen(o => !o)}
        className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors"
      >
        {offen ? <ChevronDown size={16} className="text-slate-400 shrink-0" /> : <ChevronRight size={16} className="text-slate-400 shrink-0" />}
        <span className="text-xs font-mono text-slate-400">{stufe.nr}</span>
        <span className="text-sm font-semibold text-slate-800">{stufe.titel}</span>
        <span className={`text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap ${
          stufe.art === 'hart' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
        }`}>
          {stufe.art === 'hart' ? 'hartes Kriterium' : 'weiche Prüfung'}
        </span>
        <span className="ml-auto flex items-center gap-2 text-xs whitespace-nowrap">
          {komplettUebersprungen ? (
            <span className="text-slate-400">nicht mehr ausgeführt</span>
          ) : (
            <>
              <span className="text-emerald-600">{oks} bestanden</span>
              {bes > 0 && <span className="text-red-600 font-medium">{bes} Exception</span>}
            </>
          )}
        </span>
      </button>

      {offen && (
        <div className="px-4 pb-4 space-y-2">
          <p className="text-xs text-slate-500 pb-1">{stufe.beschreibung}</p>
          {schritte.map((s, i) => <Schritt key={i} schritt={s} />)}
        </div>
      )}
    </div>
  )
}

function Ergebnisbox({ ergebnis }) {
  if (ergebnis.art === 'clean') {
    return (
      <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={20} className="text-emerald-600" />
          <span className="text-base font-semibold text-emerald-900">{ergebnis.titel}</span>
        </div>
        <p className="mt-1.5 text-sm text-emerald-800">
          Kein Ablehnungsgrund gemerkt. {ergebnis.aktion}.
        </p>
        {ergebnis.folgearbeit && (
          <p className="mt-2 text-sm text-emerald-900">
            <span className="font-medium">Folgearbeit vermerkt:</span> {ergebnis.folgearbeit}
          </p>
        )}
      </div>
    )
  }

  const hart = ergebnis.art === 'hart'
  return (
    <div className={`rounded-xl border-2 p-4 ${hart ? 'border-slate-300 bg-slate-100' : 'border-red-200 bg-red-50'}`}>
      <div className="flex items-center gap-2">
        {hart ? <Ban size={20} className="text-slate-700" /> : <AlertTriangle size={20} className="text-red-600" />}
        <span className={`text-base font-semibold ${hart ? 'text-slate-900' : 'text-red-900'}`}>{ergebnis.titel}</span>
      </div>
      <div className="mt-2 space-y-1.5 text-sm">
        <div>
          <span className={hart ? 'text-slate-500' : 'text-red-500'}>BE-Kennzeichen: </span>
          <span className={`font-medium ${hart ? 'text-slate-900' : 'text-red-900'}`}>{ergebnis.beFlag}</span>
        </div>
        {ergebnis.gruende.length > 1 && (
          <div>
            <span className="text-red-500">Bearbeitungsnotiz: </span>
            <span className="text-red-900">{ergebnis.bearbeitungsnotiz}</span>
          </div>
        )}
        <div>
          <span className={hart ? 'text-slate-500' : 'text-red-500'}>Aktion: </span>
          <span className={hart ? 'text-slate-800' : 'text-red-800'}>{ergebnis.aktion}</span>
        </div>
        {ergebnis.folgearbeit && (
          <div>
            <span className="text-red-500">Folgearbeit: </span>
            <span className="text-red-900">{ergebnis.folgearbeit}</span>
          </div>
        )}
      </div>
    </div>
  )
}

const SCHRITTE = [
  { nr: 1, titel: 'Unstrukturierter Eingang', untertitel: 'Die Mail, wie sie ankommt – samt Anhängen', Icon: Mail },
  { nr: 2, titel: 'KI-Deckblatt', untertitel: 'Dieselben Angaben in festen Feldern', Icon: FileSpreadsheet },
  { nr: 3, titel: 'Automatische Prüfung', untertitel: 'Der Prüfkatalog läuft auf dem Deckblatt', Icon: ListChecks }
]

/** Nebeneinander-Ansichten. Die Spaltenraster stehen ausgeschrieben, damit Tailwind sie erzeugt. */
const KOMBIS = [
  { id: '12', label: '1 + 2', menge: [1, 2], raster: 'lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)]' },
  { id: '23', label: '2 + 3', menge: [2, 3], raster: 'lg:grid-cols-[minmax(0,620px)_minmax(0,1fr)]' },
  { id: '123', label: '1 + 2 + 3', menge: [1, 2, 3], raster: 'lg:grid-cols-[minmax(0,420px)_minmax(0,540px)_minmax(0,1fr)]' }
]

const EINZELBREITE = { 1: 'max-w-3xl', 2: 'max-w-4xl', 3: 'max-w-5xl' }

const gleicheMenge = (a, b) => a.length === b.length && a.every((n, i) => n === b[i])

function WizardLeiste({ sichtbar, aufSchritt, aufKombi, hinweise }) {
  const einzeln = sichtbar.length === 1
  return (
    <div className="px-6 py-3 border-b border-slate-200 bg-slate-50 shrink-0 flex flex-wrap items-center gap-3">
      <div className="flex flex-wrap items-stretch gap-2 flex-1 min-w-0">
        {SCHRITTE.map((s, i) => {
          const aktiv = sichtbar.includes(s.nr)
          return (
            <div key={s.nr} className="flex items-center gap-2 min-w-0">
              <button
                onClick={() => aufSchritt(s.nr)}
                title={einzeln ? `Nur Schritt ${s.nr} zeigen` : `Schritt ${s.nr} allein zeigen`}
                style={aktiv ? { backgroundColor: 'var(--mode-primary-light)', borderColor: 'var(--mode-primary-light)' } : undefined}
                className={`flex items-center gap-3 pl-2.5 pr-4 py-2 rounded-xl border text-left transition-colors min-w-0 ${
                  aktiv ? 'text-white shadow-sm' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                  aktiv ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>{s.nr}</span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold leading-tight truncate">{s.titel}</span>
                  <span className={`block text-[11px] leading-tight truncate ${aktiv ? 'text-white/80' : 'text-slate-400'}`}>
                    {hinweise[s.nr] || s.untertitel}
                  </span>
                </span>
              </button>
              {i < SCHRITTE.length - 1 && <ChevronRight size={14} className="text-slate-300 shrink-0" />}
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-[11px] uppercase tracking-wide text-slate-400 flex items-center gap-1 mr-1">
          <Columns3 size={13} /> Nebeneinander
        </span>
        {KOMBIS.map(k => {
          const aktiv = gleicheMenge(sichtbar, k.menge)
          return (
            <button
              key={k.id}
              onClick={() => aufKombi(k.menge)}
              className={`px-2.5 py-1.5 rounded-lg text-xs border transition-colors ${
                aktiv ? 'bg-slate-800 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {k.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function PruefungModal({ vorgang, onClose, startSchritt = 1 }) {
  const lauf = useMemo(() => (vorgang ? pruefe(vorgang) : null), [vorgang])
  const [sichtbar, setSichtbar] = useState([startSchritt])
  const [anhang, setAnhang] = useState(null)

  // Beim Wechsel des Vorgangs beginnt die Ansicht wieder beim gewuenschten Schritt.
  useEffect(() => { setSichtbar([startSchritt]); setAnhang(null) }, [vorgang, startSchritt])

  useEffect(() => {
    if (!vorgang) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [vorgang, onClose])

  if (!vorgang) return null

  const schritteJeStufe = STUFEN.map(s => ({
    stufe: s,
    schritte: lauf.schritte.filter(x => x.stufe.id === s.id)
  }))

  const badge = ERGEBNIS_BADGE[lauf.ergebnis.art]
  const BadgeIcon = badge.Icon
  const offenerAnhang = anhang === null ? null : vorgang.mail.anhaenge[anhang]
  const einzeln = sichtbar.length === 1
  const aktuell = einzeln ? sichtbar[0] : null
  const kombi = einzeln ? null : KOMBIS.find(k => gleicheMenge(k.menge, sichtbar))
  const felderGesamt = Object.keys(vorgang.deckblatt).length
  const felderGefuellt = Object.values(vorgang.deckblatt).filter(Boolean).length

  const hinweise = {
    1: vorgang.mail.anhaenge.length
      ? `${vorgang.mail.anhaenge.length} ${vorgang.mail.anhaenge.length > 1 ? 'Anhänge' : 'Anhang'} · ${vorgang.mail.datum}`
      : `ohne Anhang · ${vorgang.mail.datum}`,
    2: `${felderGefuellt} von ${felderGesamt} Feldern gefüllt`,
    3: `${lauf.bestanden} von ${lauf.geprueft} bestanden · ${lauf.ergebnis.titel}`
  }

  function inhalt(nr) {
    if (nr === 1) {
      return offenerAnhang
        ? <Dokumentansicht vorgang={vorgang} anhang={offenerAnhang} onZurueck={() => setAnhang(null)} />
        : <MailAnsicht vorgang={vorgang} aufAnhang={setAnhang} />
    }
    if (nr === 2) return <Deckblatt vorgang={vorgang} lauf={lauf} />
    return (
      <div className="space-y-3">
        <Ergebnisbox ergebnis={lauf.ergebnis} />
        {schritteJeStufe.map(({ stufe, schritte }) => (
          <Stufe
            key={stufe.id}
            stufe={stufe}
            schritte={schritte}
            offenInitial={schritte.some(s => s.status === 'be') || stufe.id === 'formal'}
          />
        ))}
      </div>
    )
  }

  // Die Seite liegt in einem animierten Container mit transform; ein darin
  // gerendertes fixed-Element wuerde daran ausgerichtet. Daher als Portal.
  return createPortal((
    <div
      className="fixed inset-0 z-[1000] flex items-start justify-center bg-black/50 overflow-y-auto p-3"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className={`bg-white rounded-xl shadow-2xl my-3 w-full lg:h-[94vh] max-h-[94vh] flex flex-col animate-scale-in ${
        einzeln ? 'max-w-6xl' : 'max-w-[1800px]'
      }`}>
        {/* Kopf */}
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg font-semibold text-slate-800">{vorgang.kunde}</h2>
              <span className="text-xs font-mono text-slate-400">{vorgang.id}</span>
              <span className={`text-xs px-2.5 py-1 rounded-full border inline-flex items-center gap-1.5 ${badge.klasse}`}>
                <BadgeIcon size={12} /> {badge.label}
              </span>
            </div>
            <div className="text-sm text-slate-500 mt-0.5">
              {vorgang.sparte} · Vertrag {vorgang.deckblatt.vnr || 'ohne Nummer'} · Eingang {vorgang.eingang} · Postkorb {vorgang.postkorb}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors shrink-0">
            <X size={20} />
          </button>
        </div>

        <WizardLeiste
          sichtbar={sichtbar}
          hinweise={hinweise}
          aufSchritt={nr => setSichtbar([nr])}
          aufKombi={menge => setSichtbar(alt => (gleicheMenge(alt, menge) ? [menge[0]] : menge))}
        />

        {/* Inhalt */}
        {einzeln ? (
          <div className="flex-1 min-h-0 overflow-y-auto bg-slate-50/70">
            <div className={`mx-auto p-5 ${EINZELBREITE[aktuell]}`}>
              {inhalt(aktuell)}
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto lg:overflow-hidden">
            <div className={`lg:h-full lg:min-h-0 grid grid-cols-1 ${kombi.raster}`}>
              {sichtbar.map((nr, i) => {
                const s = SCHRITTE[nr - 1]
                return (
                  <section
                    key={nr}
                    className={`p-4 lg:h-full lg:min-h-0 lg:overflow-y-auto border-b lg:border-b-0 border-slate-200 ${
                      i < sichtbar.length - 1 ? 'lg:border-r' : ''
                    } ${nr === 1 ? 'bg-slate-50/70' : ''}`}
                  >
                    <Spaltenkopf nr={nr} titel={s.titel} untertitel={hinweise[nr]} Icon={s.Icon} />
                    {inhalt(nr)}
                  </section>
                )
              })}
            </div>
          </div>
        )}

        {/* Fuss: durch die Schritte laufen */}
        <div className="px-6 py-3 border-t border-slate-200 shrink-0 flex items-center gap-3">
          {einzeln ? (
            <>
              <button
                onClick={() => setSichtbar([aktuell - 1])}
                disabled={aktuell === 1}
                className="px-3 py-2 rounded-lg text-sm border border-slate-200 bg-white hover:bg-slate-50 flex items-center gap-1.5 text-slate-700 disabled:opacity-40 disabled:hover:bg-white"
              >
                <ArrowLeft size={14} /> {aktuell > 1 ? SCHRITTE[aktuell - 2].titel : 'Zurück'}
              </button>
              <span className="text-xs text-slate-400 mx-auto">Schritt {aktuell} von {SCHRITTE.length}</span>
              {aktuell < SCHRITTE.length ? (
                <button
                  onClick={() => setSichtbar([aktuell + 1])}
                  className="px-4 py-2 rounded-lg text-sm text-white flex items-center gap-1.5"
                  style={{ backgroundColor: 'var(--mode-primary-light)' }}
                >
                  Weiter: {SCHRITTE[aktuell].titel} <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-sm text-white flex items-center gap-1.5"
                  style={{ backgroundColor: 'var(--mode-primary-light)' }}
                >
                  Schließen
                </button>
              )}
            </>
          ) : (
            <>
              <span className="text-xs text-slate-500">
                {sichtbar.length} Schritte nebeneinander – ein Klick auf einen Schritt oben zeigt ihn wieder allein.
              </span>
              <button
                onClick={() => setSichtbar([sichtbar[0]])}
                className="ml-auto px-3 py-2 rounded-lg text-sm border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
              >
                Einzeln anzeigen
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  ), document.body)
}
