/**
 * Übersicht: das Angebotspostfach, nachdem die Strecke gelaufen ist.
 *
 * Jeder Eingang hat ein Deckblatt und ein Ergebnis. Die Liste zeigt, was
 * erfassungsbereit ist, wo eine Rückfrage vorbereitet wurde und was als
 * Sonderfall beim Menschen bleibt. Rechts steht, welche Angaben über alle
 * Eingänge am häufigsten fehlen – der Stoff für ein besseres Anfrageformular.
 */

import { useMemo, useState } from 'react'
import { Search, Inbox, FileSpreadsheet, Paperclip, ChevronRight, Presentation, Play, Columns2 } from 'lucide-react'
import { VORGAENGE, BEISPIELE } from '../daten/vorgaenge'
import { auswertung, haeufigFehlend } from '../utils/pruefengine'
import { layoutVon, ANGEBOTSLAYOUTS } from '../utils/layouts'
import { ERGEBNIS, ERGEBNIS_FOLGE } from '../utils/ergebnis'
import { begriffe } from '../utils/branding'
import { Kennzahl, ErgebnisBadge, LayoutChip, HerkunftChip, BeispielNummer } from '../components/Bausteine'

const FILTER = [
  { id: 'alle', label: 'Alle Eingänge' },
  { id: 'beispiele', label: 'Beispielanfragen' },
  ...ERGEBNIS_FOLGE.map(id => ({ id, label: ERGEBNIS[id].titel }))
]

function Balkenliste({ titel, hinweis, eintraege, einheit }) {
  const max = Math.max(...eintraege.map(e => e.anzahl), 1)
  return (
    <div className="card-base p-5">
      <h3 className="font-semibold text-base text-slate-800">{titel}</h3>
      {hinweis && <p className="mt-0.5 text-xs text-slate-500 leading-snug">{hinweis}</p>}
      <div className="mt-3 space-y-2">
        {eintraege.length === 0 && <p className="text-sm text-slate-400">Keine Einträge</p>}
        {eintraege.map(e => (
          <div key={e.name} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 items-center">
            <span className="text-sm text-slate-700 leading-snug truncate" title={e.name}>{e.name}</span>
            <span className="text-sm font-mono text-slate-700">{e.anzahl}{einheit ? ` ${einheit}` : ''}</span>
            <span className="col-span-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <span className="block h-full rounded-full" style={{ width: `${Math.round((e.anzahl / max) * 100)}%`, backgroundColor: 'var(--mode-primary-light)' }} />
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Die Beispielanfragen aus dem Fachbereich, jede direkt aufrufbar: Öffnen
 * zeigt Original und Deckblatt nebeneinander, Präsentieren führt die Strecke
 * an genau diesem Eingang vor.
 */
function Beispielleiste({ laeufe, onOpenVorgang, onPraesentation }) {
  if (BEISPIELE.length === 0) return null
  const laufZu = new Map(laeufe.map(({ vorgang, lauf }) => [vorgang.id, lauf]))
  return (
    <div className="card-base p-5">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="font-semibold text-lg text-slate-900">Beispielanfragen aus dem Fachbereich</h3>
        <span className="text-sm text-slate-500">
          {BEISPIELE.length} verfremdete Anfragen im Original, mit den Fundstellen der KI auf den Seiten. Direkter Aufruf auch über die Ziffern im Kopf.
        </span>
      </div>
      <div className="mt-4 grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(15rem, 1fr))' }}>
        {BEISPIELE.map(v => {
          const lauf = laufZu.get(v.id)
          return (
            <div key={v.id} className="beispiel-kachel rounded-2xl p-4 flex flex-col">
              <button onClick={() => onOpenVorgang(v)} className="text-left flex items-start gap-3" title="Original und Deckblatt öffnen">
                <BeispielNummer nr={v.beispiel} gross />
                <span className="min-w-0">
                  <span className="block text-xs uppercase tracking-wide text-slate-500">Beispiel {v.beispiel}</span>
                  <span className="block text-base font-semibold text-slate-900 leading-snug">{v.kunde}</span>
                </span>
              </button>
              <p className="mt-2.5 text-sm text-slate-600 leading-snug">{v.form}</p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <LayoutChip vorgang={v} />
                {lauf && <ErgebnisBadge art={lauf.ergebnis.art} />}
              </div>
              <div className="mt-auto pt-3.5 flex items-center gap-2">
                <button onClick={() => onOpenVorgang(v)}
                  className="flex-1 px-3 py-2 rounded-lg text-sm font-medium text-white inline-flex items-center justify-center gap-2 whitespace-nowrap"
                  style={{ backgroundColor: 'var(--mode-primary-light)' }}>
                  <Columns2 size={15} /> Öffnen
                </button>
                <button onClick={() => onPraesentation(0, v.id)} title={`Präsentation mit Beispiel ${v.beispiel} starten`}
                  className="flex-1 px-3 py-2 rounded-lg text-sm font-medium border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 inline-flex items-center justify-center gap-2 whitespace-nowrap">
                  <Play size={14} /> Präsentieren
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function UebersichtPage({ onOpenVorgang, onPraesentation }) {
  const B = begriffe()
  const [suche, setSuche] = useState('')
  const [filter, setFilter] = useState('alle')
  const gesamt = useMemo(() => auswertung(VORGAENGE), [])
  const fehlend = useMemo(() => haeufigFehlend(gesamt.laeufe).slice(0, 7), [gesamt])

  const sparten = useMemo(() => {
    const zaehler = new Map()
    for (const { vorgang } of gesamt.laeufe) {
      const layout = layoutVon(vorgang)
      const name = layout.id === 'sonstig' ? 'Kein Angebotslayout' : layout.name
      zaehler.set(name, (zaehler.get(name) || 0) + 1)
    }
    return [...ANGEBOTSLAYOUTS.map(l => l.name), 'Kein Angebotslayout']
      .filter(n => zaehler.has(n)).map(name => ({ name, anzahl: zaehler.get(name) }))
  }, [gesamt])

  const liste = useMemo(() => gesamt.laeufe.filter(({ vorgang, lauf }) => {
    if (filter === 'beispiele' && !vorgang.beispiel) return false
    if (ERGEBNIS[filter] && lauf.ergebnis.art !== filter) return false
    if (suche) {
      const text = [vorgang.kunde, vorgang.id, vorgang.mail.vonName, vorgang.mail.betreff, layoutVon(vorgang).name]
        .join(' ').toLowerCase()
      if (!text.includes(suche.toLowerCase())) return false
    }
    return true
  }), [gesamt, filter, suche])

  return (
    <div className="p-6 space-y-5 animate-fade-in-up">
      <div className="card-base p-5 flex flex-wrap items-start gap-5">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-semibold text-slate-900">Angebotspostfach</h2>
          <p className="mt-1.5 text-base text-slate-600 max-w-4xl leading-relaxed">
            Angebotsanfragen kommen als Freitext, als weitergeleiteter Verlauf oder als Formular einer Plattform an.
            Die KI liest jeden Eingang samt Anhängen und legt ein Deckblatt in der Reihenfolge an, in der {B.imSystem} erfasst
            wird. Was fehlt, steht als fertige Rückfrage bereit. Entschieden, erfasst und versendet wird weiter von Menschen.
          </p>
        </div>
        <button onClick={() => onPraesentation(0)}
          className="px-5 py-3 rounded-xl text-base font-medium text-white flex items-center gap-3 shadow-md hover:shadow-lg transition-shadow shrink-0"
          style={{ background: 'var(--mode-gradient)' }}>
          <Presentation size={19} strokeWidth={1.75} /> Präsentation starten
        </button>
      </div>

      <Beispielleiste laeufe={gesamt.laeufe} onOpenVorgang={onOpenVorgang} onPraesentation={onPraesentation} />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Kennzahl Icon={Inbox} wert={gesamt.gesamt} label="Eingänge im Postfach" />
        <Kennzahl Icon={FileSpreadsheet} wert={`${gesamt.gesamt} von ${gesamt.gesamt}`} label="mit Deckblatt in einheitlicher Struktur" />
        {ERGEBNIS_FOLGE.map(id => (
          <Kennzahl key={id} Icon={ERGEBNIS[id].Icon} wert={gesamt[id]} label={ERGEBNIS[id].titel}
            ton={id === 'bereit' ? 'gruen' : id === 'rueckfrage' ? 'gelb' : 'grau'} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-5 items-start">
        {/* Posteingang */}
        <div className="card-base overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
            <h3 className="font-semibold text-base text-slate-800 mr-2">Posteingang</h3>
            <div className="relative flex-1 min-w-[200px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text" placeholder="Kunde, Vermittler oder Betreff …" value={suche} onChange={e => setSuche(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg text-sm bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-(--mode-primary-light)/30"
              />
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {FILTER.map(f => (
                <button key={f.id} onClick={() => setFilter(f.id)}
                  style={filter === f.id ? { backgroundColor: 'var(--mode-primary-light)' } : undefined}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${filter === f.id ? 'text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {liste.map(({ vorgang, lauf }) => (
              <button key={vorgang.id} data-eingang={vorgang.id} onClick={() => onOpenVorgang(vorgang)}
                className={`w-full text-left px-5 py-3.5 flex items-start gap-4 transition-colors ${vorgang.beispiel ? 'beispiel-zeile' : 'hover:bg-slate-50'}`}>
                <div className="w-[104px] shrink-0">
                  <div className="text-sm font-mono text-slate-700">{vorgang.eingang}</div>
                  <div className="text-xs font-mono text-slate-400">{vorgang.uhrzeit} Uhr</div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-medium text-slate-800">{vorgang.kunde}</span>
                    <LayoutChip vorgang={vorgang} />
                    <HerkunftChip vorgang={vorgang} />
                  </div>
                  <div className="mt-0.5 text-sm text-slate-500 truncate">{vorgang.mail.vonName} · {vorgang.mail.betreff}</div>
                  <div className="mt-1 text-xs text-slate-400 flex items-center gap-1.5 flex-wrap">
                    <span>{vorgang.kanal} · {vorgang.form}</span>
                    {vorgang.mail.anhaenge.length > 0 && (
                      <span className="inline-flex items-center gap-1"><Paperclip size={11} /> {vorgang.mail.anhaenge.length}</span>
                    )}
                  </div>
                </div>
                <div className="w-[230px] shrink-0 text-right max-lg:hidden">
                  <ErgebnisBadge art={lauf.ergebnis.art} />
                  <div className="mt-1 text-xs text-slate-500 leading-snug">
                    {lauf.ergebnis.art === 'bereit'
                      ? (lauf.auftraege.length ? `${lauf.auftraege.length} Recherche im eigenen Haus` : 'alle Pflichtangaben da')
                      : lauf.ergebnis.kurz}
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-300 shrink-0 mt-1.5" />
              </button>
            ))}
            {liste.length === 0 && <div className="p-8 text-center text-sm text-slate-500">Kein Eingang passt zu dieser Auswahl.</div>}
          </div>
        </div>

        <div className="space-y-5">
          <Balkenliste
            titel="Was am häufigsten fehlt"
            hinweis="Angaben, die über alle Angebotsanfragen zur Rückfrage geführt haben"
            eintraege={fehlend}
          />
          <Balkenliste titel="Eingänge nach Layout" eintraege={sparten} />
        </div>
      </div>
    </div>
  )
}
