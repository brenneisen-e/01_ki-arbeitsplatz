/**
 * Deckblatt-Layouts: die Gliederung, nach der die KI jedes Deckblatt aufbaut.
 *
 * Oben stehen die vier Sparten nebeneinander, Abschnitt für Abschnitt. Was in
 * allen Layouts gleich ist, steht einmal über die ganze Breite; was sich
 * unterscheidet (PHV/THV, Kennzahlen, Summen), steht je Sparte. Darunter die
 * Regeln der Vorgabe und der Auszug der Betriebsartenliste, gegen den die
 * Demo zuordnet.
 *
 * Die Seite liest alles aus `layouts.js` und `betriebsarten.js`. Sie zeigt
 * also genau das, womit Deckblatt, Prüfung und der Auftrag an die KI arbeiten.
 */

import { useMemo } from 'react'
import { clsx } from 'clsx'
import { ArrowRight } from 'lucide-react'
import { VORGAENGE } from '../daten/vorgaenge'
import { ANGEBOTSLAYOUTS, LAYOUTS, FELDER, KI_REGELN, BETRIEBSART_REGELN, TREFFER } from '../utils/layouts'
import { BETRIEBSARTEN, ALLE_BETRIEBSARTEN } from '../utils/betriebsarten'
import { begriffe } from '../utils/branding'

const NUMMERN = [1, 2, 3, 4, 5, 6, 7, 8]

/** Abschnitt 2 hat keine festen Felder: Die KI ordnet Tätigkeiten der Betriebsartenliste zu. */
const BETRIEBSART_ZEILEN = [
  { key: 'ba', label: 'Betriebsart je Tätigkeit, Bezeichnung aus der Liste', pflicht: true },
  { key: 'baGrund', label: 'Kurze Begründung der Auswahl', pflicht: false },
  { key: 'baAnteil', label: 'Anteil nach Umsatz oder Tätigkeit', pflicht: false }
]

/** Was ein Abschnitt in einem Layout verlangt, in vergleichbarer Form. */
function abschnittVon(layout, nr) {
  const a = layout.abschnitte.find(x => x.nr === nr)
  if (!a) return null
  const pflicht = new Set([...(layout.pflicht || []), ...(layout.pflichtJeObjekt || [])])
  const zeile = (key) => ({ key, label: FELDER[key]?.label || key, pflicht: pflicht.has(key) })
  return {
    titel: a.titel,
    felder: a.typ === 'betriebsarten' ? BETRIEBSART_ZEILEN : (a.felder || []).map(zeile),
    jeObjekt: (a.jeObjekt || []).map(zeile),
    risikofragen: !!a.risikofragen,
    hinweis: a.hinweis || ''
  }
}

function Feldzeile({ feld }) {
  return (
    <li className="flex items-start gap-2 text-sm leading-snug text-slate-700">
      <span
        className={clsx('mt-[0.42em] w-2 h-2 rounded-full shrink-0', feld.pflicht ? '' : 'border border-slate-300 bg-white')}
        style={feld.pflicht ? { backgroundColor: 'var(--mode-primary-light)' } : undefined}
      />
      <span className={feld.pflicht ? 'text-slate-900' : undefined}>{feld.label}</span>
    </li>
  )
}

function Abschnittsinhalt({ abschnitt, breit }) {
  if (!abschnitt) return <p className="text-sm text-slate-400">entfällt</p>
  return (
    <div className="space-y-2">
      <ul className={breit ? 'flex flex-wrap gap-x-8 gap-y-1.5' : 'grid grid-cols-1 gap-y-1.5'}>
        {abschnitt.felder.map(f => <Feldzeile key={f.key} feld={f} />)}
      </ul>
      {abschnitt.jeObjekt.length > 0 && (
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">Je Gebäude</div>
          <ul className="grid grid-cols-1 gap-y-1.5">
            {abschnitt.jeObjekt.map(f => <Feldzeile key={f.key} feld={f} />)}
          </ul>
        </div>
      )}
      {abschnitt.risikofragen && <p className="text-xs text-slate-500 leading-snug">Dazu die Risikofragen aus dem Eingang, jede mit Antwort.</p>}
      {abschnitt.hinweis && <p className="text-xs text-slate-500 leading-snug">{abschnitt.hinweis}</p>}
    </div>
  )
}

/** Marke an Zeilen, die in allen vier Layouts denselben Inhalt haben. */
function Gleich() {
  return <span className="text-xs text-slate-400 whitespace-nowrap shrink-0 pt-0.5">in allen vier Layouts gleich</span>
}

function Nummer({ nr }) {
  return (
    <span className="w-8 h-8 rounded-lg text-sm font-semibold flex items-center justify-center text-white shrink-0"
      style={{ backgroundColor: 'var(--mode-primary)' }}>{nr}</span>
  )
}

function Regelliste({ titel, regeln }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-800">{titel}</h4>
      <ol className="mt-2 space-y-1.5">
        {regeln.map((r, i) => (
          <li key={r} className="flex gap-2.5 text-sm text-slate-700 leading-snug">
            <span className="font-mono text-xs text-slate-400 mt-0.5 w-4 shrink-0">{i + 1}</span>
            <span>{r}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

const TREFFER_TON = {
  gruen: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  blau: 'bg-sky-50 text-sky-700 border-sky-200',
  rot: 'bg-red-50 text-red-700 border-red-200'
}

const TREFFER_TEXT = {
  exakt: 'Die Tätigkeit steht wörtlich in der Liste und wird 1:1 übernommen.',
  naechste: 'Es gibt keine wörtliche Bezeichnung. Die KI wählt die fachlich engste und begründet die Wahl.',
  offen: 'Keine Bezeichnung passt. Die Einstufung bleibt bei den Fachspezialisten, der Eingang wird zum Sonderfall.'
}

export default function LayoutsPage({ onOpenVorgang }) {
  const B = begriffe()

  // Je Layout ein Eingang zum Ansehen: bevorzugt eine der Beispielanfragen.
  const beispiele = useMemo(() => Object.fromEntries(ANGEBOTSLAYOUTS.map(l => {
    const passend = VORGAENGE.filter(v => v.produkt === l.id)
    return [l.id, { anzahl: passend.length, vorgang: passend.find(v => v.beispiel) || passend[0] || null }]
  })), [])

  const zeilen = useMemo(() => NUMMERN.map(nr => {
    const je = ANGEBOTSLAYOUTS.map(l => abschnittVon(l, nr))
    const erster = je.find(Boolean)
    const alleGleich = je.every(a => a && JSON.stringify(a) === JSON.stringify(erster))
    return { nr, titel: erster.titel, je, alleGleich }
  }), [])

  const sonstig = LAYOUTS.sonstig
  const raster = { gridTemplateColumns: '15.5rem repeat(4, minmax(0, 1fr))' }

  return (
    <div className="p-6 space-y-5 animate-fade-in-up">
      <div className="card-base p-5">
        <h2 className="text-2xl font-semibold text-slate-900">Deckblatt-Layouts</h2>
        <p className="mt-1.5 text-base text-slate-600 max-w-5xl leading-relaxed">
          Jedes Deckblatt hat denselben Aufbau: acht nummerierte Abschnitte in der Reihenfolge, in der {B.imSystem} erfasst
          wird, dazu eine fachliche Gesamteinschätzung und die Auffälligkeiten. Vier Sparten haben ein eigenes Layout.
          Die Gliederung stammt aus der {B.layoutQuelle}.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1.5 text-sm text-slate-600">
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--mode-primary-light)' }} />
            für ein Angebot nötig; fehlt die Angabe, entsteht eine Rückfrage
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full border border-slate-300 bg-white" />
            wird übernommen, wenn der Eingang sie nennt
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-500 leading-snug max-w-5xl">
          Welche Angaben für ein Angebot zwingend sind, ist eine Annahme dieser Demo. Im Piloten legt der Fachbereich
          sie je Sparte fest.
        </p>
      </div>

      {/* Die vier Layouts nebeneinander */}
      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[60rem]">
            <div className="grid border-b border-slate-200 bg-slate-50" style={raster}>
              <div className="px-5 py-4 flex items-end">
                <span className="text-xs uppercase tracking-wide text-slate-400">Abschnitt</span>
              </div>
              {ANGEBOTSLAYOUTS.map(l => {
                const b = beispiele[l.id]
                return (
                  <div key={l.id} className="px-4 py-4 border-l border-slate-200">
                    <div className="text-base 2xl:text-lg font-semibold text-slate-900 leading-tight break-words">{l.name}</div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {l.kurz === l.name ? 'Layout' : `Layout ${l.kurz}`} · {b.anzahl} {b.anzahl === 1 ? 'Eingang' : 'Eingänge'} im Postfach
                    </div>
                    {b.vorgang && (
                      <button onClick={() => onOpenVorgang?.(b.vorgang)}
                        className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
                        style={{ color: 'var(--mode-primary-light)' }}>
                        Deckblatt ansehen <ArrowRight size={14} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            {zeilen.map(z => (
              <div key={z.nr} className="grid border-b border-slate-100" style={raster}>
                <div className="px-5 py-4 flex items-start gap-3">
                  <Nummer nr={z.nr} />
                  <span className="min-w-0 text-base font-semibold text-slate-900 leading-snug pt-0.5 break-words">{z.titel}</span>
                </div>
                {z.alleGleich ? (
                  <div className="col-span-4 px-4 py-4 border-l border-slate-200 bg-slate-50/50 flex items-start gap-6">
                    <div className="min-w-0 flex-1"><Abschnittsinhalt abschnitt={z.je[0]} breit /></div>
                    <Gleich />
                  </div>
                ) : z.je.map((a, i) => (
                  <div key={ANGEBOTSLAYOUTS[i].id} className={clsx('px-4 py-4 border-l border-slate-200', !a && 'bg-slate-50/60')}>
                    <Abschnittsinhalt abschnitt={a} />
                  </div>
                ))}
              </div>
            ))}

            <div className="grid" style={raster}>
              <div className="px-5 py-4 flex items-start gap-3">
                <span className="w-8 h-8 rounded-lg text-sm font-semibold flex items-center justify-center bg-slate-100 text-slate-600 shrink-0">+</span>
                <span className="text-base font-semibold text-slate-900 leading-snug pt-0.5">Einschätzung der KI</span>
              </div>
              <div className="col-span-4 px-4 py-4 border-l border-slate-200 bg-slate-50/50 flex items-start gap-6">
                <ul className="min-w-0 flex-1 flex flex-wrap gap-x-8 gap-y-1.5">
                  <Feldzeile feld={{ label: 'Fachliche Gesamteinschätzung zur Einordnung des Risikos', pflicht: false }} />
                  <Feldzeile feld={{ label: 'Auffälligkeiten und mögliche Probleme, jede mit Fundstelle', pflicht: false }} />
                </ul>
                <Gleich />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
        {/* Regeln der Vorgabe */}
        <div className="card-base p-5 space-y-5">
          <div>
            <h3 className="font-semibold text-base text-slate-800">Regeln für die KI</h3>
            <p className="mt-0.5 text-xs text-slate-500 leading-snug">
              Aus der {B.layoutQuelle}. Dieselben Regeln stehen im Auftrag, mit dem die KI eigene Anfragen live liest.
            </p>
          </div>
          <Regelliste titel="Für jedes Layout" regeln={KI_REGELN} />
          <Regelliste titel="Zu Abschnitt 2, Betriebsarten" regeln={BETRIEBSART_REGELN} />
        </div>

        <div className="space-y-5">
          {/* Eingänge ohne Angebotslayout */}
          <div className="card-base p-5">
            <h3 className="font-semibold text-base text-slate-800">Wenn der Eingang keine Angebotsanfrage ist</h3>
            <p className="mt-0.5 text-sm text-slate-600 leading-relaxed">
              Vertragsänderungen, Tarifauskünfte und andere Anliegen bekommen kein Angebotslayout. Die KI hält die
              Kerndaten für die Weitergabe fest, der Eingang bleibt als Sonderfall beim Menschen.
            </p>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              {sonstig.abschnitte.map(a => (
                <div key={a.nr} className="flex items-start gap-2.5">
                  <span className="w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center bg-slate-100 text-slate-600 shrink-0">{a.nr}</span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-800 leading-snug">{a.titel}</div>
                    <div className="text-xs text-slate-500 leading-snug">{a.felder.map(k => FELDER[k].label).join(' · ')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Wie eine Tätigkeit zur Betriebsart wird */}
          <div className="card-base p-5">
            <h3 className="font-semibold text-base text-slate-800">Wie eine Tätigkeit zur Betriebsart wird</h3>
            <div className="mt-3 space-y-2.5">
              {Object.entries(TREFFER).map(([id, t]) => (
                <div key={id} className="flex items-start gap-3">
                  <span className={clsx('text-2xs px-2 py-0.5 rounded-full border whitespace-nowrap mt-0.5', TREFFER_TON[t.ton])}>{t.label}</span>
                  <span className="text-sm text-slate-700 leading-snug">{TREFFER_TEXT[id]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Betriebsartenliste */}
      <div className="card-base p-5">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="font-semibold text-base text-slate-800">Betriebsartenliste, Auszug für die Demo</h3>
          <span className="text-xs font-mono text-slate-500">{ALLE_BETRIEBSARTEN.length} Bezeichnungen in {BETRIEBSARTEN.length} Gruppen</span>
        </div>
        <p className="mt-0.5 text-xs text-slate-500 leading-snug max-w-5xl">
          Die Vorgabe verlangt, jede Tätigkeit vollständig gegen die Betriebsartenliste zu prüfen. Hier steht ein frei
          zusammengestellter Auszug, gegen den die Eingänge der Demo zugeordnet sind. Im Piloten tritt die Liste {B.desSystems} an
          seine Stelle.
        </p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-5">
          {BETRIEBSARTEN.map(g => (
            <div key={g.gruppe}>
              <div className="text-xs uppercase tracking-wide text-slate-400 pb-1.5 border-b border-slate-100">{g.gruppe}</div>
              <ul className="mt-1.5 space-y-1">
                {g.eintraege.map(e => <li key={e} className="text-sm text-slate-700 leading-snug">{e}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
