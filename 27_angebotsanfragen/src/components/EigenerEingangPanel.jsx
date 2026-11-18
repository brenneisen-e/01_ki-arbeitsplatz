/**
 * Eigene Anfrage einfügen und von Claude lesen lassen.
 *
 * Text hinein, Felder mit Fundstellen heraus: Das Ergebnis läuft durch
 * dieselbe Prüfung wie die Demo-Eingänge und öffnet sich in derselben
 * Detailansicht. Dafür ist ein API Key nötig, der nur in diesem Browser
 * liegt.
 */

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { KeyRound, Eye, EyeOff, X, Sparkles, Loader2, AlertTriangle, ChevronRight } from 'lucide-react'
import * as AI from '../utils/ai-processor'
import { pruefe } from '../utils/pruefengine'
import { ErgebnisBadge } from './Bausteine'

const BEISPIEL = `Guten Tag,

für unseren Kunden, die Tischlerei Brandner GmbH, Werkstraße 4, 34123 Kassel, bitte ich um ein Angebot zur Betriebshaftpflicht.

Der Betrieb fertigt Möbel und Innenausbauten und montiert sie beim Kunden. 7 Mitarbeiter in Vollzeit, dazu der Inhaber, 1 Auszubildender. Umsatz im letzten Jahr 910.000 €.

Beginn zum 01.01.2027. Die Vorversicherung läuft zum Jahresende aus, Schäden gab es in den letzten Jahren zwei kleinere.

Unsere Agenturnummer: 377-21-9084

Viele Grüße
Katrin Albers
Albers Versicherungsmakler`

/** Dialog für den API Key; als Portal, damit er über allen Ansichten liegt. */
export function KeyDialog({ onClose }) {
  const [eingabe, setEingabe] = useState(AI.getApiKey())
  const [sichtbar, setSichtbar] = useState(false)
  const hatKey = AI.hasApiKey()

  return createPortal((
    <div data-modal className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Claude API Key</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition-colors"><X size={18} className="text-slate-400" /></button>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Der Key wird ausschließlich im localStorage dieses Browsers abgelegt und direkt an die Anthropic-API gesendet.
          Für den Betrieb gehört der Aufruf hinter einen eigenen Dienst, damit der Key nicht im Browser liegt.
        </p>
        <div className="relative">
          <input
            type={sichtbar ? 'text' : 'password'} value={eingabe} onChange={e => setEingabe(e.target.value)} placeholder="sk-ant-..."
            className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm font-mono bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-(--mode-primary-light)/30"
          />
          <button onClick={() => setSichtbar(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600">
            {sichtbar ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <button onClick={() => { AI.setApiKey(eingabe.trim()); onClose() }} className="flex-1 px-4 py-2 rounded-lg text-sm text-white" style={{ backgroundColor: 'var(--mode-primary-light)' }}>
            Speichern
          </button>
          {hatKey && (
            <button onClick={() => { AI.setApiKey(''); onClose() }} className="px-4 py-2 rounded-lg text-sm text-red-600 border border-red-200 hover:bg-red-50">
              Entfernen
            </button>
          )}
        </div>
      </div>
    </div>
  ), document.body)
}

export default function EigenerEingangPanel({ onOpenVorgang }) {
  const [offen, setOffen] = useState(false)
  const [keyDialog, setKeyDialog] = useState(false)
  const [, neuZeichnen] = useState(0)
  const hatKey = AI.hasApiKey()

  const [betreff, setBetreff] = useState('Anfrage Betriebshaftpflicht Tischlerei Brandner')
  const [absender, setAbsender] = useState('k.albers@albers-makler.example')
  const [text, setText] = useState(BEISPIEL)
  const [laden, setLaden] = useState(false)
  const [fehler, setFehler] = useState('')
  const [ergebnis, setErgebnis] = useState(null)

  async function auslesen() {
    setFehler('')
    if (!AI.hasApiKey()) { setKeyDialog(true); return }
    setLaden(true)
    try {
      const antwort = await AI.leseEingang({ betreff, absender, text, anhaenge: [] })
      const vorgang = AI.baueVorgang(antwort, { name: betreff, art: 'text', betreff, absender, text })
      setErgebnis({ vorgang, lauf: pruefe(vorgang) })
    } catch (err) {
      setFehler(err.message)
    } finally {
      setLaden(false)
    }
  }

  return (
    <div className="card-base overflow-hidden">
      <button onClick={() => setOffen(o => !o)} className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors">
        <Sparkles size={16} className="text-slate-400" />
        <span className="text-sm font-semibold text-slate-800">Eigene Anfrage einfügen</span>
        <span className="text-xs text-slate-500">Text einfügen, von Claude lesen lassen und das Deckblatt mit Fundstellen ansehen</span>
        <ChevronRight size={16} className={`ml-auto text-slate-400 transition-transform ${offen ? 'rotate-90' : ''}`} />
      </button>

      {offen && (
        <div className="px-4 pb-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
            <KeyRound size={15} className={hatKey ? 'text-emerald-600' : 'text-amber-600'} />
            <span className="text-sm text-slate-700">{hatKey ? 'Claude API Key hinterlegt' : 'Kein Claude API Key hinterlegt'}</span>
            <span className="text-xs text-slate-400">Der Key bleibt im Browser und geht nur an die Anthropic-API.</span>
            <button onClick={() => setKeyDialog(true)} className="ml-auto px-3 py-1.5 rounded-lg text-sm border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
              {hatKey ? 'Key ändern' : 'Key hinterlegen'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="text-xs text-slate-500 space-y-1">
              <span>Betreff</span>
              <input value={betreff} onChange={e => setBetreff(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-(--mode-primary-light)/30" />
            </label>
            <label className="text-xs text-slate-500 space-y-1">
              <span>Absender</span>
              <input value={absender} onChange={e => setAbsender(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-(--mode-primary-light)/30" />
            </label>
          </div>

          <label className="block text-xs text-slate-500 space-y-1">
            <span>Text der Anfrage, gern mit dem ganzen Verlauf</span>
            <textarea value={text} onChange={e => setText(e.target.value)} rows={12}
              className="w-full px-3 py-2 rounded-lg text-sm bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-(--mode-primary-light)/30" />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button onClick={auslesen} disabled={laden || !text.trim()}
              className="px-4 py-2 rounded-lg text-sm text-white flex items-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: 'var(--mode-primary-light)' }}>
              {laden ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
              {laden ? 'Claude liest die Anfrage …' : 'Lesen lassen und prüfen'}
            </button>
            {laden && <span className="text-xs text-slate-500">Das dauert je nach Länge des Eingangs bis zu einer Minute.</span>}
          </div>

          {fehler && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 flex items-start gap-2 text-sm text-red-700">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" /> {fehler}
            </div>
          )}

          {ergebnis && (
            <div className="rounded-lg border border-slate-200 px-4 py-3 flex flex-wrap items-center gap-3">
              <ErgebnisBadge art={ergebnis.lauf.ergebnis.art} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-slate-800">{ergebnis.vorgang.kunde} · {ergebnis.lauf.ergebnis.titel}</div>
                <div className="text-xs text-slate-600">{ergebnis.lauf.ergebnis.aktion}</div>
              </div>
              <button onClick={() => onOpenVorgang(ergebnis.vorgang)} className="px-3 py-2 rounded-lg text-sm text-white shrink-0" style={{ backgroundColor: 'var(--mode-primary-light)' }}>
                Original und Deckblatt öffnen
              </button>
            </div>
          )}
        </div>
      )}

      {keyDialog && <KeyDialog onClose={() => { setKeyDialog(false); neuZeichnen(n => n + 1) }} />}
    </div>
  )
}
