/**
 * Prüfung und nächster Schritt zu einem Eingang.
 *
 * Oben das Ergebnis, darunter das, was daraus folgt:
 *   Rückfrage    der vorformulierte Text an den Vermittler, änderbar, mit Freigabe
 *   bereit       Übergabe des Deckblatts an die Erfassung, heute zum Abtippen,
 *                später als Datensatz für Robotics oder Schnittstelle
 *   Sonderfall   Gründe und offene Punkte für die Fachspezialisten
 * Danach der Prüflauf Stufe für Stufe.
 *
 * Senden und Übergeben sind in der Demo nur angedeutet: nichts verlässt das
 * Werkzeug, die Freigabe zeigt den Human in the Loop.
 */

import { useEffect, useMemo, useState } from 'react'
import { clsx } from 'clsx'
import {
  ChevronDown, ChevronRight, ArrowRight, Send, Copy, Check, UserCheck, Database, Bot,
  FileJson, Download, RotateCcw, Keyboard, MailQuestion
} from 'lucide-react'
import { STUFEN } from '../utils/pruefengine'
import { baueRueckfrage } from '../utils/rueckfrage'
import { baueDatensatz, ladeDatensatz } from '../utils/datensatz'
import { begriffe } from '../utils/branding'
import { ERGEBNIS, PRUEF_STATUS } from '../utils/ergebnis'

function kopiere(text, danach) {
  navigator.clipboard?.writeText(text).then(danach, danach)
}

function Ergebnisbox({ lauf }) {
  const e = ERGEBNIS[lauf.ergebnis.art]
  return (
    <div className={clsx('rounded-xl border-2 p-4', e.rand, e.bg)}>
      <div className="flex items-center gap-2">
        <e.Icon size={20} className={e.ton} />
        <span className={clsx('text-base font-semibold', e.dunkel)}>{lauf.ergebnis.titel}</span>
      </div>
      <p className={clsx('mt-1.5 text-sm', e.text)}>{lauf.ergebnis.aktion}.</p>
      {lauf.ergebnis.art === 'sonderfall' && lauf.ergebnis.gruende.length > 0 && (
        <ul className="mt-2 space-y-0.5">
          {lauf.ergebnis.gruende.map((g, i) => (
            <li key={i} className="text-sm text-slate-800 flex gap-2"><span className="text-slate-400">–</span>{g}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Freigabeleiste({ text }) {
  return (
    <div className="flex items-center gap-2 text-xs text-slate-500">
      <UserCheck size={14} className="text-slate-400 shrink-0" /> {text}
    </div>
  )
}

function Rueckfrage({ vorgang, lauf }) {
  const entwurf = useMemo(() => baueRueckfrage(vorgang, lauf), [vorgang, lauf])
  const [text, setText] = useState(entwurf.text)
  const [gesendet, setGesendet] = useState(null)
  const [kopiert, setKopiert] = useState(false)

  useEffect(() => { setText(entwurf.text); setGesendet(null) }, [entwurf])

  const geaendert = text !== entwurf.text

  return (
    <div className="card-base overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2.5">
        <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <MailQuestion size={16} />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-slate-800">Rückfrage an den Vermittler</span>
          <span className="block text-xs text-slate-500">Von der KI vorformuliert, {lauf.fragen.length} {lauf.fragen.length === 1 ? 'Punkt' : 'Punkte'} aus der Prüfung</span>
        </span>
        {geaendert && !gesendet && (
          <button onClick={() => setText(entwurf.text)} className="ml-auto px-2.5 py-1.5 rounded-lg text-xs border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center gap-1.5">
            <RotateCcw size={12} /> Entwurf wiederherstellen
          </button>
        )}
      </div>

      <div className="px-4 py-3 space-y-1 text-xs border-b border-slate-100 bg-slate-50/60">
        <div><span className="text-slate-400 inline-block w-14">An</span><span className="text-slate-800 font-mono">{entwurf.an || 'Adresse zur Agenturnummer nachschlagen'}</span></div>
        {entwurf.cc && <div><span className="text-slate-400 inline-block w-14">Cc</span><span className="text-slate-800 font-mono">{entwurf.cc}</span></div>}
        <div><span className="text-slate-400 inline-block w-14">Betreff</span><span className="text-slate-800">{entwurf.betreff}</span></div>
      </div>

      <div className="p-4">
        <textarea
          value={text} onChange={e => setText(e.target.value)} disabled={Boolean(gesendet)}
          rows={Math.min(22, text.split('\n').length + 2)}
          className="w-full px-3 py-2.5 rounded-lg text-sm leading-relaxed bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-(--mode-primary-light)/30 disabled:bg-slate-50 disabled:text-slate-500"
        />

        {gesendet ? (
          <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 flex items-start gap-2.5">
            <Check size={16} className="text-emerald-600 mt-0.5 shrink-0" />
            <div className="text-sm text-emerald-900">
              Freigegeben um {gesendet} Uhr. Der Vorgang liegt auf Wiedervorlage, bis die Antwort des Vermittlers eingeht.
              <span className="block text-xs text-emerald-700 mt-0.5">In der Demo wird keine E-Mail verschickt.</span>
            </div>
            <button onClick={() => setGesendet(null)} className="ml-auto text-xs text-emerald-700 underline shrink-0">zurücknehmen</button>
          </div>
        ) : (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setGesendet(new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }))}
              className="px-4 py-2 rounded-lg text-sm text-white flex items-center gap-2"
              style={{ backgroundColor: 'var(--mode-primary-light)' }}
            >
              <Send size={14} /> Prüfen, freigeben und senden
            </button>
            <button
              onClick={() => kopiere(text, () => { setKopiert(true); setTimeout(() => setKopiert(false), 1800) })}
              className="px-3 py-2 rounded-lg text-sm border border-slate-200 bg-white hover:bg-slate-50 flex items-center gap-1.5 text-slate-700"
            >
              {kopiert ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />} {kopiert ? 'Kopiert' : 'Text kopieren'}
            </button>
            <Freigabeleiste text="Die Rückfrage geht erst nach Freigabe durch die Sachbearbeitung hinaus." />
          </div>
        )}
      </div>
    </div>
  )
}

function Uebergabe({ vorgang, lauf }) {
  const B = begriffe()
  const [zeigtDatensatz, setZeigtDatensatz] = useState(false)
  const [kopiert, setKopiert] = useState(false)
  const datensatz = useMemo(() => baueDatensatz(vorgang, lauf), [vorgang, lauf])
  const json = useMemo(() => JSON.stringify(datensatz, null, 2), [datensatz])

  return (
    <div className="card-base overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 text-sm font-semibold text-slate-800">Übergabe an die Erfassung</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-200">
        <div className="bg-white p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
            <Keyboard size={13} /> Heute möglich, ohne Schnittstelle
          </div>
          <p className="mt-1.5 text-sm text-slate-700 leading-relaxed">
            Die Sachbearbeitung erfasst das Angebot {B.imSystem} direkt vom Deckblatt. Die Felder stehen in
            der Reihenfolge der Eingabe, gelesen und strukturiert ist bereits.
          </p>
        </div>
        <div className="bg-white p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
            <Bot size={13} /> Nächste Ausbaustufe
          </div>
          <p className="mt-1.5 text-sm text-slate-700 leading-relaxed">
            Dasselbe Deckblatt geht als Datensatz per Robotics oder Schnittstelle {B.anSystem}. Antwort und
            Angebot werden vorbereitet, gesendet wird nach Freigabe.
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <button onClick={() => setZeigtDatensatz(z => !z)}
              className="px-2.5 py-1.5 rounded-lg text-xs border border-slate-200 bg-white hover:bg-slate-50 flex items-center gap-1.5 text-slate-700">
              <FileJson size={13} /> {zeigtDatensatz ? 'Datensatz ausblenden' : 'Datensatz ansehen'}
            </button>
            <button onClick={() => ladeDatensatz(vorgang, datensatz)}
              className="px-2.5 py-1.5 rounded-lg text-xs border border-slate-200 bg-white hover:bg-slate-50 flex items-center gap-1.5 text-slate-700">
              <Download size={13} /> Als JSON laden
            </button>
          </div>
        </div>
      </div>
      {zeigtDatensatz && (
        <div className="border-t border-slate-200 bg-slate-900 relative">
          <button onClick={() => kopiere(json, () => { setKopiert(true); setTimeout(() => setKopiert(false), 1800) })}
            className="absolute top-2 right-2 px-2 py-1 rounded text-2xs bg-white/10 hover:bg-white/20 text-white flex items-center gap-1">
            {kopiert ? <Check size={11} /> : <Copy size={11} />} {kopiert ? 'Kopiert' : 'Kopieren'}
          </button>
          <pre className="p-4 text-2xs leading-relaxed text-slate-100 font-mono overflow-auto max-h-80">{json}</pre>
        </div>
      )}
    </div>
  )
}

function OffenePunkte({ lauf }) {
  if (lauf.fragen.length === 0) return null
  return (
    <div className="card-base p-4">
      <div className="text-sm font-semibold text-slate-800">Offene Punkte für die Fachspezialisten</div>
      <p className="mt-0.5 text-xs text-slate-500">Bei der Prüfung gemerkt. Ob und wie beim Vermittler nachgefragt wird, entscheidet der Mensch.</p>
      <ol className="mt-2 space-y-1.5">
        {lauf.fragen.map((f, i) => (
          <li key={i} className="text-sm text-slate-700 flex gap-2.5">
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-2xs font-semibold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
            {f}
          </li>
        ))}
      </ol>
    </div>
  )
}

function Recherche({ lauf }) {
  if (lauf.auftraege.length === 0) return null
  return (
    <div className="card-base p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        <Database size={15} className="text-indigo-600" /> Recherche im eigenen Haus
      </div>
      <p className="mt-0.5 text-xs text-slate-500">
        Diese Angaben fragt niemand beim Vermittler nach. Sie stehen in den eigenen Systemen an fester Stelle; dafür
        reicht ein Roboter, eine KI braucht es nicht.
      </p>
      <ul className="mt-2 space-y-1.5">
        {lauf.auftraege.map((a, i) => (
          <li key={i} className="text-sm text-slate-700 flex gap-2.5">
            <ArrowRight size={14} className="text-indigo-400 shrink-0 mt-1" /> {a}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Schritt({ schritt, onFeld }) {
  const stil = PRUEF_STATUS[schritt.status] || PRUEF_STATUS.neutral
  const zeigtWerte = schritt.ist != null && schritt.soll != null
  const key = schritt.pruefung.feldKey
  return (
    <div
      className={clsx('rounded-lg border px-3 py-2.5', stil.rand, stil.bg, key && onFeld && 'cursor-pointer')}
      onMouseEnter={key && onFeld ? () => onFeld(key, 'hover') : undefined}
      onMouseLeave={key && onFeld ? () => onFeld(null, 'hover') : undefined}
      onClick={key && onFeld ? () => onFeld(key, 'klick') : undefined}
    >
      <div className="flex items-start gap-2.5">
        <stil.Icon size={16} className={`${stil.ton} mt-0.5 shrink-0`} strokeWidth={2} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className={clsx('text-sm font-medium', schritt.status === 'uebersprungen' ? 'text-slate-400' : 'text-slate-800')}>
              {schritt.pruefung.titel}
            </span>
            <span className={`text-2xs uppercase tracking-wide ${stil.ton}`}>{stil.label}</span>
          </div>
          {zeigtWerte && (
            <div className="mt-1 flex items-center gap-2 text-xs flex-wrap">
              <span className="px-1.5 py-0.5 rounded bg-white/70 border border-slate-200 text-slate-600 break-words max-w-full">
                <span className="text-slate-400">gelesen: </span>{schritt.ist}
              </span>
              <ArrowRight size={12} className="text-slate-300" />
              <span className="px-1.5 py-0.5 rounded bg-white/70 border border-slate-200 text-slate-600">
                <span className="text-slate-400">erwartet: </span>{schritt.soll}
              </span>
            </div>
          )}
          {schritt.hinweis && <div className="mt-1 text-xs text-slate-600 leading-snug">{schritt.hinweis}</div>}
          {schritt.frage && <div className="mt-1 text-xs font-medium text-amber-800">Rückfrage: {schritt.frage}</div>}
          {schritt.auftrag && <div className="mt-1 text-xs font-medium text-indigo-800">Recherche: {schritt.auftrag}</div>}
        </div>
      </div>
    </div>
  )
}

function Stufe({ stufe, schritte, offenInitial, onFeld }) {
  const [offen, setOffen] = useState(offenInitial)
  const oks = schritte.filter(s => s.status === 'ok').length
  const fehlt = schritte.filter(s => s.status === 'fehlt').length
  const sonder = schritte.filter(s => s.status === 'sonderfall').length
  const hinweise = schritte.filter(s => s.status === 'hinweis').length
  const recherche = schritte.filter(s => s.status === 'recherche').length
  const uebersprungen = schritte.every(s => s.status === 'uebersprungen')

  return (
    <div className="card-base overflow-hidden">
      <button onClick={() => setOffen(o => !o)} className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors">
        {offen ? <ChevronDown size={16} className="text-slate-400 shrink-0" /> : <ChevronRight size={16} className="text-slate-400 shrink-0" />}
        <span className="text-xs font-mono text-slate-400">{stufe.nr}</span>
        <span className="text-sm font-semibold text-slate-800">{stufe.titel}</span>
        {stufe.art === 'hart' && <span className="text-2xs px-2 py-0.5 rounded-full whitespace-nowrap bg-slate-800 text-white">entscheidet über den Weg</span>}
        <span className="ml-auto flex items-center gap-2.5 text-xs whitespace-nowrap">
          {uebersprungen ? <span className="text-slate-400">nicht mehr ausgeführt</span> : (
            <>
              {oks > 0 && <span className="text-emerald-600">{oks} ohne Befund</span>}
              {fehlt > 0 && <span className="text-amber-700 font-medium">{fehlt} Rückfrage</span>}
              {recherche > 0 && <span className="text-indigo-700 font-medium">{recherche} Recherche</span>}
              {hinweise > 0 && <span className="text-sky-700">{hinweise} {hinweise === 1 ? 'Hinweis' : 'Hinweise'}</span>}
              {sonder > 0 && <span className="text-slate-800 font-medium">{sonder} Sonderfall</span>}
            </>
          )}
        </span>
      </button>
      {offen && (
        <div className="px-4 pb-4 space-y-2">
          <p className="text-xs text-slate-500 pb-1">{stufe.beschreibung}</p>
          {schritte.map((s, i) => <Schritt key={i} schritt={s} onFeld={onFeld} />)}
        </div>
      )}
    </div>
  )
}

export default function Pruefung({ vorgang, lauf, onFeld }) {
  const art = lauf.ergebnis.art
  const jeStufe = STUFEN.map(s => ({ stufe: s, schritte: lauf.schritte.filter(x => x.stufe.id === s.id) }))

  return (
    <div className="space-y-3">
      <Ergebnisbox lauf={lauf} />
      {art === 'rueckfrage' && <Rueckfrage vorgang={vorgang} lauf={lauf} />}
      {art === 'bereit' && <Uebergabe vorgang={vorgang} lauf={lauf} />}
      {art === 'sonderfall' && <OffenePunkte lauf={lauf} />}
      <Recherche lauf={lauf} />

      <div className="pt-1 text-xs uppercase tracking-wide text-slate-400">Prüflauf in {STUFEN.length} Stufen</div>
      {jeStufe.map(({ stufe, schritte }) => (
        <Stufe
          key={stufe.id} stufe={stufe} schritte={schritte} onFeld={onFeld}
          offenInitial={schritte.some(s => ['fehlt', 'sonderfall', 'recherche'].includes(s.status))}
        />
      ))}
    </div>
  )
}
