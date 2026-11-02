import { useState, useMemo } from 'react'
import {
  KeyRound, Eye, EyeOff, X, Sparkles, Loader2, AlertTriangle, ChevronRight,
  Trash2, SlidersHorizontal
} from 'lucide-react'
import * as AI from '../utils/ai-processor'
import { baueEigenenVorgang } from '../utils/pruefvorgaenge'
import { pruefe } from '../utils/pruefengine'

const BEISPIEL = `Sehr geehrte Damen und Herren,

hiermit beantragen wir die Bestandsübertragung für unsere Kundin:

Versicherungsnehmerin: Kerstin Brandt, geb. 03.03.1971
Anschrift: Lindenallee 3, 20144 Hamburg
Vertrag: LF-70902206 (Lebensversicherung)

Die unterschriebene Maklervollmacht vom 21.07.2026 liegt bei.

Mit freundlichen Grüßen
Nils Petersen
Petersen & Partner Assekuranzmakler, Vermittlernummer 600203441
petersen@petersen-partner.de`

const SYSTEMSCHALTER = [
  { key: 'vertragGefunden', label: 'Vertrag im Bestandssystem', werte: [[true, 'gefunden'], [false, 'nicht gefunden']] },
  { key: 'vertragsstatus', label: 'Vertragsstatus', werte: [['aktiv', 'aktiv'], ['storniert', 'storniert'], ['historisch', 'historisch']] },
  { key: 'bereitsUebertragen', label: 'Übertragung', werte: [[false, 'noch nicht erfolgt'], [true, 'bereits erfolgt']] },
  { key: 'vermittlerGefunden', label: 'Vermittler im Vermittlersystem', werte: [[true, 'gefunden'], [false, 'nicht gefunden']] },
  { key: 'anbindung', label: 'Anbindung', werte: [['aktiv', 'aktiv'], ['beendet', 'beendet']] },
  { key: 'zusammenarbeit', label: 'Zusammenarbeit', werte: [[true, 'vereinbart'], [false, 'nicht vereinbart']] },
  { key: 'courtagefortzahler', label: 'Vermittlerkennzeichen', werte: [[false, 'regulär'], [true, 'Courtagefortzahler']] },
  { key: 'vertriebskanal', label: 'Abgebender Vertriebskanal', werte: [['Makler', 'Makler'], ['AO', 'Ausschließlichkeit']] }
]

const BESTANDSFELDER = [
  ['nachname', 'Nachname'], ['vorname', 'Vorname'], ['gebdat', 'Geburtsdatum'],
  ['strasse', 'Straße'], ['plz', 'PLZ']
]

export default function EigenerEingangPanel({ onPruefen }) {
  const [offen, setOffen] = useState(false)
  const [keyModal, setKeyModal] = useState(false)
  const [keyInput, setKeyInput] = useState(AI.getApiKey())
  const [keySichtbar, setKeySichtbar] = useState(false)
  const [hatKey, setHatKey] = useState(AI.hasApiKey())

  const [betreff, setBetreff] = useState('Bestandsübertragung – Kerstin Brandt, LF-70902206')
  const [absender, setAbsender] = useState('petersen@petersen-partner.de')
  const [anhang, setAnhang] = useState('Maklervollmacht_Brandt.pdf')
  const [text, setText] = useState(BEISPIEL)

  const [laden, setLaden] = useState(false)
  const [fehler, setFehler] = useState('')
  const [deckblatt, setDeckblatt] = useState(null)
  const [bestand, setBestand] = useState({})

  const vorgang = useMemo(() => {
    if (!deckblatt) return null
    return baueEigenenVorgang({
      mail: {
        von: absender, vonName: absender, an: 'maklerservice@versicherer.de',
        datum: new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        betreff, text,
        anhaenge: anhang.split(';').map(a => a.trim()).filter(Boolean).map(a => ({ name: a, typ: 'Anhang', info: 'vom Absender beigefügt' }))
      },
      deckblatt,
      bestand
    })
  }, [deckblatt, bestand, betreff, absender, anhang, text])

  const lauf = useMemo(() => (vorgang ? pruefe(vorgang) : null), [vorgang])

  function keySpeichern() {
    AI.setApiKey(keyInput.trim())
    setHatKey(AI.hasApiKey())
    setKeyModal(false)
  }

  async function auslesen() {
    setFehler('')
    if (!AI.hasApiKey()) { setKeyModal(true); return }
    setLaden(true)
    try {
      const felder = await AI.leseDeckblattfelder({
        betreff, absender, text,
        anhaenge: anhang.split(';').map(a => a.trim()).filter(Boolean)
      })
      setDeckblatt(felder)
      setBestand({})
    } catch (err) {
      setFehler(err.message)
    } finally {
      setLaden(false)
    }
  }

  function setzeBestand(key, wert) {
    setBestand(b => ({ ...b, [key]: wert }))
  }

  return (
    <div className="card-base overflow-hidden">
      <button onClick={() => setOffen(o => !o)} className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors">
        <Sparkles size={16} className="text-slate-400" />
        <span className="text-sm font-semibold text-slate-800">Eigenen Eingang prüfen</span>
        <span className="text-xs text-slate-500">Text einfügen, Felder mit Claude auslesen und durch den Katalog schicken</span>
        <ChevronRight size={16} className={`ml-auto text-slate-400 transition-transform ${offen ? 'rotate-90' : ''}`} />
      </button>

      {offen && (
        <div className="px-4 pb-4 space-y-4">
          {/* API Key */}
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
            <KeyRound size={15} className={hatKey ? 'text-emerald-600' : 'text-amber-600'} />
            <span className="text-sm text-slate-700">
              {hatKey ? 'Claude API Key hinterlegt' : 'Kein Claude API Key hinterlegt'}
            </span>
            <span className="text-xs text-slate-400">Der Key bleibt im Browser (localStorage) und wird nur an die Anthropic-API gesendet.</span>
            <button
              onClick={() => { setKeyInput(AI.getApiKey()); setKeyModal(true) }}
              className="ml-auto px-3 py-1.5 rounded-lg text-sm border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
            >
              {hatKey ? 'Key ändern' : 'Key hinterlegen'}
            </button>
          </div>

          {/* Eingabe */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="text-xs text-slate-500 space-y-1">
              <span>Betreff</span>
              <input value={betreff} onChange={e => setBetreff(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#c41230]/30" />
            </label>
            <label className="text-xs text-slate-500 space-y-1">
              <span>Absender</span>
              <input value={absender} onChange={e => setAbsender(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#c41230]/30" />
            </label>
            <label className="text-xs text-slate-500 space-y-1">
              <span>Anhänge, mehrere mit Semikolon</span>
              <input value={anhang} onChange={e => setAnhang(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#c41230]/30" />
            </label>
          </div>

          <label className="block text-xs text-slate-500 space-y-1">
            <span>Text des Eingangs</span>
            <textarea value={text} onChange={e => setText(e.target.value)} rows={10}
              className="w-full px-3 py-2 rounded-lg text-sm font-mono bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#c41230]/30" />
          </label>

          <div className="flex items-center gap-3">
            <button
              onClick={auslesen}
              disabled={laden || !text.trim()}
              className="px-4 py-2 rounded-lg text-sm text-white flex items-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: 'var(--mode-primary-light)' }}
            >
              {laden ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
              {laden ? 'Claude liest die Felder aus...' : 'Felder auslesen und prüfen'}
            </button>
            {deckblatt && (
              <button
                onClick={() => { setDeckblatt(null); setBestand({}) }}
                className="px-3 py-2 rounded-lg text-sm text-slate-500 border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5"
              >
                <Trash2 size={14} /> Ergebnis verwerfen
              </button>
            )}
          </div>

          {fehler && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 flex items-start gap-2 text-sm text-red-700">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" /> {fehler}
            </div>
          )}

          {/* Ergebnis */}
          {vorgang && lauf && (
            <div className="space-y-3">
              <div className={`rounded-lg border px-4 py-3 flex items-center gap-3 ${
                lauf.ergebnis.art === 'clean' ? 'border-emerald-200 bg-emerald-50' :
                lauf.ergebnis.art === 'hart' ? 'border-slate-300 bg-slate-100' : 'border-red-200 bg-red-50'
              }`}>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-800">{lauf.ergebnis.titel}</div>
                  <div className="text-xs text-slate-600">{lauf.ergebnis.aktion}</div>
                  {lauf.ergebnis.gruende.length > 0 && (
                    <div className="text-xs text-red-700 mt-0.5">{lauf.ergebnis.gruende.join(' · ')}</div>
                  )}
                  {deckblatt.begruendung && (
                    <div className="text-xs text-slate-500 mt-1">Einordnung durch Claude: {deckblatt.begruendung}</div>
                  )}
                </div>
                <button
                  onClick={() => onPruefen(vorgang)}
                  className="ml-auto shrink-0 px-3 py-2 rounded-lg text-sm bg-white border border-slate-200 hover:bg-slate-50"
                >
                  Prüflauf im Detail
                </button>
              </div>

              {/* Systemantworten */}
              <div className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400 mb-2">
                  <SlidersHorizontal size={13} /> Antworten der Bestandsführung
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Bestands-, Vermittler- und Partnersystem sind in dieser Umgebung nicht angebunden. Die Werte sind mit
                  den ausgelesenen Angaben vorbelegt; ändern Sie sie, um eine Abweichung und die daraus folgende
                  Business Exception vorzuführen.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {BESTANDSFELDER.map(([key, label]) => (
                    <label key={key} className="text-xs text-slate-500 space-y-1">
                      <span>{label} laut Bestandssystem</span>
                      <input
                        value={vorgang.bestand[key] || ''}
                        onChange={e => setzeBestand(key, e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg text-sm font-mono bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#c41230]/30"
                      />
                    </label>
                  ))}
                  {SYSTEMSCHALTER.map(s => (
                    <label key={s.key} className="text-xs text-slate-500 space-y-1">
                      <span>{s.label}</span>
                      <select
                        value={String(vorgang.bestand[s.key])}
                        onChange={e => {
                          const treffer = s.werte.find(([w]) => String(w) === e.target.value)
                          setzeBestand(s.key, treffer ? treffer[0] : e.target.value)
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg text-sm bg-white border border-slate-200"
                      >
                        {s.werte.map(([wert, label]) => (
                          <option key={String(wert)} value={String(wert)}>{label}</option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* API-Key-Dialog */}
      {keyModal && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/50" onClick={() => setKeyModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Claude API Key</h3>
              <button onClick={() => setKeyModal(false)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Der Key wird ausschließlich im localStorage dieses Browsers abgelegt und direkt an die Anthropic-API
              gesendet. Für eine produktive Nutzung gehört der Aufruf hinter einen eigenen Dienst, damit der Key nicht
              im Browser liegt.
            </p>
            <div className="relative">
              <input
                type={keySichtbar ? 'text' : 'password'}
                value={keyInput}
                onChange={e => setKeyInput(e.target.value)}
                placeholder="sk-ant-api03-..."
                className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm font-mono bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#c41230]/30"
              />
              <button onClick={() => setKeySichtbar(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600">
                {keySichtbar ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <button onClick={keySpeichern} className="flex-1 px-4 py-2 rounded-lg text-sm text-white" style={{ backgroundColor: 'var(--mode-primary-light)' }}>
                Speichern
              </button>
              {hatKey && (
                <button
                  onClick={() => { AI.setApiKey(''); setKeyInput(''); setHatKey(false); setKeyModal(false) }}
                  className="px-4 py-2 rounded-lg text-sm text-red-600 border border-red-200 hover:bg-red-50"
                >
                  Entfernen
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
