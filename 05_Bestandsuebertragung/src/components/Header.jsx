import { useState } from 'react'
import { clsx } from 'clsx'
import { ArrowLeft, Home, FileJson, RefreshCw, User, Settings, ChevronDown, Play } from 'lucide-react'
import LogoImg from './LogoImg'
import DemoWasserzeichen from './DemoWasserzeichen'
import { MARKENLISTE, getMarke, setMarke } from '../utils/branding'

/**
 * Reiter in Gruppen: Dashboard steht allein, die übrigen Ansichten liegen
 * thematisch gebündelt hinter einem Reiter mit Auswahlmenü. Die Ansichts-IDs
 * bleiben unverändert, damit Deep Links wie „#pruefstrecke“ weiter greifen.
 */
const GRUPPEN = [
  { id: 'dashboard', label: 'Dashboard', tabs: [{ id: 'dashboard', label: 'Dashboard' }] },
  {
    id: 'bearbeitung', label: 'Bearbeitung', tabs: [
      { id: 'vorgaenge', label: 'Vorgänge', countKey: 'vorgaenge' },
      { id: 'makler', label: 'Makler', countKey: 'makler' },
      { id: 'emails', label: 'E-Mails', countKey: 'emails' },
      { id: 'ai-upload', label: 'KI Upload' }
    ]
  },
  {
    id: 'pruefung', label: 'Prüfstrecke', tabs: [
      { id: 'pruefstrecke', label: 'Prüfstrecke' },
      { id: 'simulation', label: 'Simulation' }
    ]
  },
  {
    id: 'projekt', label: 'Projekt', tabs: [
      { id: 'prozess', label: 'Prozess' },
      { id: 'architektur', label: 'Architektur' },
      { id: 'vorlagen', label: 'E-Mail Vorlagen' },
      { id: 'projektplan', label: 'Projektplan' }
    ]
  }
]

function Reitergruppe({ gruppe, activeView, onViewChange, counts, offen, setOffen }) {
  const aktiverTab = gruppe.tabs.find(t => t.id === activeView)
  const aktiv = !!aktiverTab
  const einzeln = gruppe.tabs.length === 1

  return (
    <div className="relative">
      <button
        onClick={() => (einzeln ? onViewChange(gruppe.tabs[0].id) : setOffen(offen === gruppe.id ? null : gruppe.id))}
        className={clsx(
          'flex items-center px-4 py-2.5 text-sm font-medium border-b-2 transition-colors duration-200 whitespace-nowrap',
          aktiv ? 'border-(--mode-accent) text-white' : 'border-transparent text-white/65 hover:text-white'
        )}
      >
        {gruppe.label}
        {!einzeln && aktiverTab && aktiverTab.label !== gruppe.label && (
          <span className="ml-1.5 text-white/60 font-normal">· {aktiverTab.label}</span>
        )}
        {!einzeln && (
          <ChevronDown size={15} className={clsx('ml-1.5 text-white/60 transition-transform', offen === gruppe.id && 'rotate-180')} />
        )}
      </button>

      {offen === gruppe.id && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOffen(null)} />
          <div className="absolute left-0 top-full mt-1 z-50 min-w-56 rounded-lg bg-white shadow-xl border border-slate-200 py-1">
            {gruppe.tabs.map(t => (
              <button
                key={t.id}
                onClick={() => { onViewChange(t.id); setOffen(null) }}
                className={clsx('w-full px-4 py-2.5 flex items-center justify-between gap-4 text-sm text-left hover:bg-slate-50',
                  t.id === activeView ? 'text-slate-900 font-semibold' : 'text-slate-600')}
              >
                {t.label}
                {t.countKey && counts[t.countKey] !== undefined && (
                  <span className={clsx('text-[11px] font-bold rounded-full px-1.5 min-w-5 text-center',
                    t.id === activeView ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-600')}>
                    {counts[t.countKey]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function Markenwahl() {
  const [marke] = useState(getMarke())
  const [offen, setOffen] = useState(false)

  // Ein Markenwechsel lädt neu: Demodaten, Demo-Dateien und Vorlagen entstehen dann in der neuen Marke.
  function waehle(id) {
    setOffen(false)
    setMarke(id)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOffen(o => !o)}
        title="Marke wechseln"
        className="flex items-center gap-1.5 pr-1.5 rounded-lg hover:bg-white/10 transition-colors"
      >
        <span className="w-10 h-10 rounded-lg header-glass flex items-center justify-center overflow-hidden">
          {marke.logo
            ? <LogoImg name={marke.logo} size={32} />
            : <span className="text-white text-xs font-semibold tracking-wide">{marke.kuerzel}</span>}
        </span>
        <ChevronDown size={13} className="text-white/60" />
      </button>

      {offen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOffen(false)} />
          <div className="absolute left-0 top-full mt-1 z-50 w-52 rounded-lg bg-white shadow-xl border border-slate-200 py-1">
            <div className="px-3 py-1.5 text-[11px] uppercase tracking-wide text-slate-400">Marke</div>
            {MARKENLISTE.map(m => (
              <button
                key={m.id}
                onClick={() => waehle(m.id)}
                className={clsx('w-full px-3 py-2 flex items-center gap-2.5 text-sm text-left hover:bg-slate-50',
                  m.id === marke.id ? 'text-slate-900 font-medium' : 'text-slate-600')}
              >
                <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                  {m.logo ? <LogoImg name={m.logo} size={20} /> : <span className="text-[10px] font-semibold text-slate-500">{m.kuerzel}</span>}
                </span>
                {m.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/** Play-Knopf ganz rechts im Kopf: startet die Präsentation von jeder Ansicht aus. */
function PraesentationsKnopf({ onClick }) {
  return (
    <button
      onClick={onClick}
      title="Präsentation starten"
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white bg-white text-(--mode-primary) text-xs font-semibold hover:bg-white/90 transition-colors"
    >
      <Play size={14} strokeWidth={2} fill="currentColor" />
      Präsentation
    </button>
  )
}

export default function Header({ activeView, onViewChange, counts = {}, onImport, onDemoDownload, onReset, onPraesentation }) {
  const [offenGruppe, setOffenGruppe] = useState(null)
  return (
    // Dieselben Maße wie der GlobalHeader des Vertriebsarbeitsplatzes (163 px);
    // kopf-px rechnet die Tailwind-Maße trotz 20 px Grundschrift in Pixeln.
    <header className="kopf-px transition-all duration-500 text-white" style={{ background: 'var(--mode-gradient)' }}>
      {/* Top Row: pt-14 hält den Streifen unter der Wasserzeichen-Lasche frei, die Zeile bricht nie um */}
      <div className="px-6 pt-14 pb-3 flex items-center justify-between gap-4 whitespace-nowrap">
        <div className="flex items-center gap-4">
          {/* Home Button */}
          <button
            onClick={() => { window.location.href = '/' }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Zurück zur Startseite"
          >
            <Home size={16} strokeWidth={1.75} />
            <span className="text-xs font-medium">Startseite</span>
          </button>

          {/* Marke */}
          <Markenwahl />

          {/* App Info */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/10 border-2 border-white/40 flex items-center justify-center">
              <User size={24} className="text-white" strokeWidth={1.75} />
            </div>
            <div>
              <div className="text-white text-sm font-medium">
                Bestandsübertragung
              </div>
              <div className="text-white/70 text-xs">
                Sales Operations | Portfolio Transfer Management
              </div>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <label title="JSON Import" className="flex items-center gap-2 px-3 py-1.5 rounded-lg header-glass text-xs font-medium cursor-pointer">
            <FileJson size={15} strokeWidth={1.75} /> <span className="max-[1279px]:hidden">JSON Import</span>
            <input type="file" accept=".json" className="hidden" onChange={(e) => { if (e.target.files[0]) { onImport(e.target.files[0]); e.target.value = '' } }} />
          </label>
          <button onClick={onDemoDownload} title="Demo JSON" className="flex items-center gap-2 px-3 py-1.5 rounded-lg header-glass text-xs font-medium">
            <FileJson size={15} strokeWidth={1.75} /> <span className="max-[1279px]:hidden">Demo JSON</span>
          </button>
          <button onClick={onReset} className="p-2 rounded-lg header-glass" title="Daten zurücksetzen">
            <RefreshCw size={18} strokeWidth={1.75} />
          </button>
          <button className="p-2 rounded-lg header-glass">
            <Settings size={18} strokeWidth={1.75} />
          </button>
          <PraesentationsKnopf onClick={onPraesentation} />
        </div>
      </div>

      <DemoWasserzeichen />

      {/* Reiter, thematisch gruppiert (ohne overflow, sonst schneidet die Zeile die Auswahlmenüs ab) */}
      <div className="px-6 flex gap-1 pb-0 border-t border-white/10 mt-1">
        {GRUPPEN.map(g => (
          <Reitergruppe key={g.id} gruppe={g} activeView={activeView} onViewChange={onViewChange}
            counts={counts} offen={offenGruppe} setOffen={setOffenGruppe} />
        ))}
      </div>
    </header>
  )
}
