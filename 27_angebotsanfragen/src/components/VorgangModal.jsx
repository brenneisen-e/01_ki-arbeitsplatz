/**
 * Detailansicht eines Eingangs in drei Schritten:
 *
 *   1  Eingang im Original    die Seiten, wie sie angekommen sind, mit den
 *                             Fundstellen der KI
 *   2  KI-Deckblatt           dieselben Angaben in der festen Gliederung
 *   3  Prüfung und Rückfrage  was fehlt, was auffällt, was als Nächstes passiert
 *
 * Auf breiten Bildschirmen stehen Original und Deckblatt nebeneinander: Ein
 * Klick auf eine Zeile des Deckblatts springt im Original zur Fundstelle, ein
 * Klick auf eine Fundstelle zur Zeile. So ist für jeden Wert zu sehen, wo ihn
 * die KI erkannt hat.
 */

import { useMemo, useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { clsx } from 'clsx'
import { X, Mail, ArrowRight, ArrowLeft, ChevronRight, ListChecks, FileSpreadsheet, Columns3 } from 'lucide-react'
import { pruefe } from '../utils/pruefengine'
import { baueVerknuepfung } from '../utils/feldinfo'
import { layoutVon } from '../utils/layouts'
import { ERGEBNIS } from '../utils/ergebnis'
import { herkunft } from '../daten/vorgaenge'
import { HerkunftChip } from './Bausteine'
import Deckblatt from './Deckblatt'
import Original from './Original'
import Pruefung from './Pruefung'

const SCHRITTE = [
  { nr: 1, titel: 'Eingang im Original', untertitel: 'So kommt die Anfrage an, mit den Fundstellen der KI', Icon: Mail },
  { nr: 2, titel: 'KI-Deckblatt', untertitel: 'Dieselben Angaben in fester Gliederung', Icon: FileSpreadsheet },
  { nr: 3, titel: 'Prüfung und nächster Schritt', untertitel: 'Was fehlt, was auffällt, was folgt', Icon: ListChecks }
]

/** Nebeneinander-Ansichten. Die Spaltenraster stehen ausgeschrieben, damit Tailwind sie erzeugt. */
const KOMBIS = [
  { id: '12', label: '1 + 2', menge: [1, 2], raster: 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]' },
  { id: '23', label: '2 + 3', menge: [2, 3], raster: 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]' },
  { id: '123', label: '1 + 2 + 3', menge: [1, 2, 3], raster: 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)]' }
]

const EINZELBREITE = { 1: 'max-w-4xl', 2: 'max-w-4xl', 3: 'max-w-5xl' }

const gleicheMenge = (a, b) => a.length === b.length && a.every((n, i) => n === b[i])

function Spaltenkopf({ nr, titel, untertitel, Icon }) {
  return (
    <div className="flex items-start gap-2.5 mb-3">
      <span className="w-6 h-6 rounded-full text-white text-2xs font-semibold flex items-center justify-center shrink-0 mt-0.5"
        style={{ backgroundColor: 'var(--mode-primary-light)' }}>{nr}</span>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
          <Icon size={14} className="text-slate-400 shrink-0" /> {titel}
        </div>
        <div className="text-2xs text-slate-400 leading-snug">{untertitel}</div>
      </div>
    </div>
  )
}

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
                className={clsx('flex items-center gap-3 pl-2.5 pr-4 py-2 rounded-xl border text-left transition-colors min-w-0',
                  aktiv ? 'text-white shadow-sm' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100')}
              >
                <span className={clsx('w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0',
                  aktiv ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600')}>{s.nr}</span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold leading-tight truncate">{s.titel}</span>
                  <span className={clsx('block text-2xs leading-tight truncate', aktiv ? 'text-white/80' : 'text-slate-400')}>
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
        <span className="text-2xs uppercase tracking-wide text-slate-400 flex items-center gap-1 mr-1">
          <Columns3 size={13} /> Nebeneinander
        </span>
        {KOMBIS.map(k => {
          const aktiv = gleicheMenge(sichtbar, k.menge)
          return (
            <button key={k.id} onClick={() => aufKombi(k.menge)}
              className={clsx('px-2.5 py-1.5 rounded-lg text-xs border transition-colors',
                aktiv ? 'bg-slate-800 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100')}>
              {k.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Auf breiten Bildschirmen öffnet das Fenster mit Original und Deckblatt nebeneinander. */
function startAnsicht(startSchritt) {
  if (startSchritt) return [startSchritt]
  return typeof window !== 'undefined' && window.innerWidth >= 1280 ? [1, 2] : [1]
}

export default function VorgangModal({ vorgang, onClose, startSchritt = 0 }) {
  const lauf = useMemo(() => (vorgang ? pruefe(vorgang) : null), [vorgang])
  const verknuepfung = useMemo(() => (vorgang ? baueVerknuepfung(vorgang) : null), [vorgang])
  const [sichtbar, setSichtbar] = useState(() => startAnsicht(startSchritt))
  // Hervorgehobenes Feld: beim Überfahren flüchtig, per Klick festgehalten.
  const [schwebe, setSchwebe] = useState(null)
  const [fest, setFest] = useState(null)
  const [sprung, setSprung] = useState(null)

  useEffect(() => { setSichtbar(startAnsicht(startSchritt)); setSchwebe(null); setFest(null); setSprung(null) }, [vorgang, startSchritt])

  useEffect(() => {
    if (!vorgang) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [vorgang, onClose])

  const vonDokument = useCallback((key, art) => {
    if (art === 'hover') { setSchwebe(key); return }
    setFest(key)
    setSprung(s => ({ key, quelle: 'dokument', n: (s?.n || 0) + 1 }))
  }, [])

  const vonDeckblatt = useCallback((key, art) => {
    if (art === 'hover') { setSchwebe(key); return }
    setFest(key)
    setSprung(s => ({ key, quelle: 'deckblatt', n: (s?.n || 0) + 1 }))
  }, [])

  if (!vorgang) return null

  const aktiv = schwebe || fest
  const e = ERGEBNIS[lauf.ergebnis.art]
  const layout = layoutVon(vorgang)
  const einzeln = sichtbar.length === 1
  const aktuell = einzeln ? sichtbar[0] : null
  const kombi = einzeln ? null : KOMBIS.find(k => gleicheMenge(k.menge, sichtbar))
  const anzahlMarken = Object.values(verknuepfung.fundstellen).reduce((n, l) => n + l.length, 0)
  const seiten = vorgang.dokumente.reduce((n, d) => n + d.seiten.length, 0)

  const hinweise = {
    1: `${seiten} ${seiten === 1 ? 'Seite' : 'Seiten'} · ${anzahlMarken} Fundstellen`,
    2: layout.id === 'sonstig' ? 'Kerndaten für die Weitergabe' : `Layout ${layout.kurz} · ${lauf.fehlendeFelder.length === 0 ? 'alle Pflichtangaben da' : lauf.fehlendeFelder.length === 1 ? '1 Angabe fehlt' : `${lauf.fehlendeFelder.length} Angaben fehlen`}`,
    3: lauf.ergebnis.titel
  }

  // Ein Klick im Deckblatt soll auch dann zur Fundstelle führen, wenn das Original gerade nicht zu sehen ist.
  function deckblattKlick(key, art) {
    vonDeckblatt(key, art)
    if (art === 'klick' && key && !sichtbar.includes(1)) setSichtbar(sichtbar.includes(3) ? [1, 2, 3] : [1, 2])
  }

  function inhalt(nr) {
    if (nr === 1) {
      return <Original vorgang={vorgang} verknuepfung={verknuepfung} aktiv={aktiv} onFeld={vonDokument}
        sprung={sprung?.quelle === 'deckblatt' ? sprung : null} />
    }
    if (nr === 2) {
      return <Deckblatt vorgang={vorgang} lauf={lauf} verknuepfung={verknuepfung} aktiv={aktiv} fest={fest} sprung={sprung} onFeld={deckblattKlick} />
    }
    return <Pruefung vorgang={vorgang} lauf={lauf} onFeld={deckblattKlick} />
  }

  // Als Portal, weil die Seiten in einem animierten Container mit transform liegen.
  return createPortal((
    <div
      data-modal
      className="fixed inset-0 z-[1000] flex items-start justify-center bg-black/50 overflow-y-auto p-3"
      onClick={(ev) => { if (ev.target === ev.currentTarget) onClose() }}
    >
      <div className={clsx('bg-white rounded-xl shadow-2xl my-3 w-full lg:h-[94vh] max-h-[94vh] flex flex-col animate-scale-in',
        einzeln ? 'max-w-6xl' : 'max-w-[94rem]')}>
        {/* Kopf */}
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg font-semibold text-slate-800">{vorgang.kunde}</h2>
              <span className="text-xs font-mono text-slate-400">{vorgang.id}</span>
              <span className={clsx('text-xs px-2.5 py-1 rounded-full border inline-flex items-center gap-1.5', e.badge)}>
                <e.Icon size={12} /> {e.titel}
              </span>
              {vorgang.beispiel
                ? <HerkunftChip vorgang={vorgang} />
                : <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{herkunft(vorgang)}</span>}
            </div>
            <div className="text-sm text-slate-500 mt-0.5">
              {layout.id === 'sonstig' ? vorgang.vorgangsart : layout.name} · {vorgang.mail.vonName} · Eingang {vorgang.eingang}, {vorgang.uhrzeit} Uhr · {vorgang.form}
            </div>
          </div>
          <button onClick={onClose} title="Schließen (Esc)" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors shrink-0">
            <X size={20} />
          </button>
        </div>

        <WizardLeiste
          sichtbar={sichtbar} hinweise={hinweise}
          aufSchritt={nr => setSichtbar([nr])}
          aufKombi={menge => setSichtbar(alt => (gleicheMenge(alt, menge) ? [menge[0]] : menge))}
        />

        {/* Inhalt */}
        {einzeln ? (
          <div className="flex-1 min-h-0 overflow-y-auto bg-slate-50/70">
            <div className={`mx-auto p-5 ${EINZELBREITE[aktuell]}`}>{inhalt(aktuell)}</div>
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto lg:overflow-hidden">
            <div className={`lg:h-full lg:min-h-0 grid grid-cols-1 ${kombi.raster}`}>
              {sichtbar.map((nr, i) => {
                const s = SCHRITTE[nr - 1]
                return (
                  <section key={nr}
                    className={clsx('p-4 lg:h-full lg:min-h-0 lg:overflow-y-auto border-b lg:border-b-0 border-slate-200',
                      i < sichtbar.length - 1 && 'lg:border-r', nr === 1 && 'bg-slate-100/70')}>
                    <Spaltenkopf nr={nr} titel={s.titel} untertitel={hinweise[nr]} Icon={s.Icon} />
                    {inhalt(nr)}
                  </section>
                )
              })}
            </div>
          </div>
        )}

        {/* Fuß */}
        <div className="px-6 py-3 border-t border-slate-200 shrink-0 flex items-center gap-3">
          {einzeln ? (
            <>
              <button onClick={() => setSichtbar([aktuell - 1])} disabled={aktuell === 1}
                className="px-3 py-2 rounded-lg text-sm border border-slate-200 bg-white hover:bg-slate-50 flex items-center gap-1.5 text-slate-700 disabled:opacity-40 disabled:hover:bg-white">
                <ArrowLeft size={14} /> {aktuell > 1 ? SCHRITTE[aktuell - 2].titel : 'Zurück'}
              </button>
              <span className="text-xs text-slate-400 mx-auto">Schritt {aktuell} von {SCHRITTE.length}</span>
              {aktuell < SCHRITTE.length ? (
                <button onClick={() => setSichtbar([aktuell + 1])}
                  className="px-4 py-2 rounded-lg text-sm text-white flex items-center gap-1.5"
                  style={{ backgroundColor: 'var(--mode-primary-light)' }}>
                  Weiter: {SCHRITTE[aktuell].titel} <ArrowRight size={14} />
                </button>
              ) : (
                <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-white" style={{ backgroundColor: 'var(--mode-primary-light)' }}>
                  Schließen
                </button>
              )}
            </>
          ) : (
            <>
              <span className="text-xs text-slate-500">
                Zeile im Deckblatt anklicken: das Original springt zur Fundstelle. Fundstelle anklicken: das Deckblatt springt zur Zeile.
              </span>
              <button onClick={() => setSichtbar(sichtbar.includes(3) ? [3] : [2, 3])}
                className="ml-auto px-4 py-2 rounded-lg text-sm text-white flex items-center gap-1.5 shrink-0"
                style={{ backgroundColor: 'var(--mode-primary-light)' }}>
                {sichtbar.includes(3) ? 'Prüfung allein zeigen' : 'Weiter: Prüfung und nächster Schritt'} <ArrowRight size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  ), document.body)
}
