import { clsx } from 'clsx'

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'vorgaenge', label: 'Vorgänge', countKey: 'vorgaenge' },
  { id: 'makler', label: 'Makler', countKey: 'makler' },
  { id: 'emails', label: 'E-Mails', countKey: 'emails' },
  { id: 'ai-upload', label: 'KI Upload' },
  { id: 'architektur', label: 'Architektur' },
  { id: 'vorlagen', label: 'E-Mail Vorlagen' },
  { id: 'prozess', label: 'Prozess' },
  { id: 'projektplan', label: 'Projektplan' }
]

export default function NavTabs({ activeView, onViewChange, counts = {} }) {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 flex items-center gap-1 overflow-x-auto">
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => onViewChange(tab.id)}
          className={clsx(
            'flex items-center gap-1.5 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap',
            activeView === tab.id
              ? 'bg-[#c41230] text-white'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          )}
        >
          {tab.label}
          {tab.countKey && counts[tab.countKey] !== undefined && (
            <span className={clsx(
              'text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
              activeView === tab.id ? 'bg-white/25' : 'bg-gray-200 text-gray-600'
            )}>
              {counts[tab.countKey]}
            </span>
          )}
        </button>
      ))}
    </nav>
  )
}
