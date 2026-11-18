import { useState } from 'react'
import { clsx } from 'clsx'
import { Home, User, ChevronDown, Play, Inbox } from 'lucide-react'
import LogoImg from './LogoImg'
import DemoWasserzeichen from './DemoWasserzeichen'
import { MARKENLISTE, getMarke, setMarke, begriffe } from '../utils/branding'

/** Die Ansichten. Die IDs sind zugleich der URL-Hash („#strecke“), damit sich jede Seite direkt verlinken lässt. */
export const REITER = [
  { id: 'uebersicht', label: 'Übersicht' },
  { id: 'strecke', label: 'Angebotsstrecke' },
  { id: 'layouts', label: 'Deckblatt-Layouts' },
  { id: 'prozess', label: 'Prozess' }
]

function Markenwahl() {
  const marke = getMarke()
  const [offen, setOffen] = useState(false)

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
                // Ein Markenwechsel lädt neu: Begriffe, Demo-Eingänge und Entwürfe entstehen dann in der neuen Marke.
                onClick={() => { setOffen(false); setMarke(m.id) }}
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

export default function Header({ activeView, onViewChange, anzahl, onPraesentation, beispiele = [], onBeispiel }) {
  const B = begriffe()
  return (
    // Dieselben Maße wie der Kopf von Bestandsübertragung und Vertriebsarbeitsplatz (163 px);
    // kopf-px rechnet die Tailwind-Maße trotz 20 px Grundschrift in Pixeln.
    <header className="kopf-px transition-all duration-500 text-white" style={{ background: 'var(--mode-gradient)' }}>
      {/* pt-14 hält den Streifen unter der Wasserzeichen-Lasche frei, die Zeile bricht nie um */}
      <div className="px-6 pt-14 pb-3 flex items-center justify-between gap-4 whitespace-nowrap">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={() => { window.location.href = '/' }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Zurück zur Startseite"
          >
            <Home size={16} strokeWidth={1.75} />
            <span className="text-xs font-medium">Startseite</span>
          </button>

          <Markenwahl />

          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-full bg-white/10 border-2 border-white/40 flex items-center justify-center shrink-0">
              <User size={24} className="text-white" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <div className="text-white text-sm font-medium">Angebotsanfragen</div>
              <div className="text-white/70 text-xs truncate">Sales Operations | Quote Request Management</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Schnellzugriff: die Beispielanfragen aus dem Fachbereich, von jeder Seite aus */}
          {beispiele.length > 0 && (
            <span className="flex items-center gap-1 pl-3 pr-1 py-1 rounded-lg header-glass max-[1179px]:hidden" title="Beispielanfragen aus dem Fachbereich direkt öffnen">
              <span className="text-xs font-medium pr-1.5">Beispiele</span>
              {beispiele.map(v => (
                <button key={v.id} onClick={() => onBeispiel?.(v)} title={`Beispiel ${v.beispiel}: ${v.kunde} · ${v.form}`}
                  className="w-7 h-7 rounded-md bg-white text-(--mode-primary) text-xs font-semibold hover:bg-white/85 transition-colors">
                  {v.beispiel}
                </button>
              ))}
            </span>
          )}
          <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg header-glass text-xs font-medium max-[1459px]:hidden" title="Postfach, in dem die Anfragen eingehen">
            <Inbox size={15} strokeWidth={1.75} /> {B.postfach} · {anzahl} Eingänge
          </span>
          <button
            onClick={onPraesentation}
            title="Präsentation starten"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white bg-white text-(--mode-primary) text-xs font-semibold hover:bg-white/90 transition-colors"
          >
            <Play size={14} strokeWidth={2} fill="currentColor" />
            Präsentation
          </button>
        </div>
      </div>

      <DemoWasserzeichen />

      <nav className="px-6 flex gap-1 pb-0 border-t border-white/10 mt-1">
        {REITER.map(r => (
          <button
            key={r.id}
            onClick={() => onViewChange(r.id)}
            className={clsx('flex items-center px-4 py-2.5 text-sm font-medium border-b-2 transition-colors duration-200 whitespace-nowrap',
              activeView === r.id ? 'border-(--mode-accent) text-white' : 'border-transparent text-white/65 hover:text-white')}
          >
            {r.label}
          </button>
        ))}
      </nav>
    </header>
  )
}
