import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import StatusBadge from '../components/StatusBadge'
import { formatDate } from '../utils/format'
import { STATUS_ORDER, STATUS_LABELS, STATUS_ICONS, SPARTEN } from '../utils/constants'
import { Search, Plus } from 'lucide-react'

export default function Vorgaenge({ onOpenCase }) {
  const { cases } = useApp()
  const [search, setSearch] = useState('')
  const [sparteFilter, setSparteFilter] = useState('')
  const [exportFilter, setExportFilter] = useState('')

  const filtered = useMemo(() => {
    let result = cases.filter(c => {
      if (search) {
        const s = search.toLowerCase()
        const fields = [c.kunde?.name, c.versicherungsnummer?.value, c.makler?.name, c.sparte, c.notes].filter(Boolean).join(' ').toLowerCase()
        if (!fields.includes(s)) return false
      }
      if (sparteFilter && c.sparte !== sparteFilter) return false
      if (exportFilter === 'exported' && !c.exported?.date) return false
      if (exportFilter === 'not-exported' && c.exported?.date) return false
      return true
    })
    result.sort((a, b) => {
      const aL = a.linkedCaseIds?.length > 0 ? 1 : 0
      const bL = b.linkedCaseIds?.length > 0 ? 1 : 0
      if (bL !== aL) return bL - aL
      return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
    })
    return result
  }, [cases, search, sparteFilter, exportFilter])

  const grouped = useMemo(() => {
    const g = {}
    STATUS_ORDER.forEach(s => { g[s] = filtered.filter(c => c.status === s) })
    return g
  }, [filtered])

  return (
    <div className="p-6 space-y-4 animate-fade-in-up">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Suche..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg text-base bg-white focus:outline-none focus:ring-2 focus:ring-[#c41230]/30"
            style={{ border: 'var(--card-border)' }} />
        </div>
        <select value={sparteFilter} onChange={e => setSparteFilter(e.target.value)}
          className="text-base border border-slate-200 rounded-lg px-3 py-2.5 bg-white">
          <option value="">Alle Sparten</option>
          {SPARTEN.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={exportFilter} onChange={e => setExportFilter(e.target.value)}
          className="text-base border border-slate-200 rounded-lg px-3 py-2.5 bg-white">
          <option value="">Alle</option>
          <option value="exported">Exportiert</option>
          <option value="not-exported">Nicht exportiert</option>
        </select>
        <button onClick={() => onOpenCase(null)} className="flex items-center gap-1.5 px-4 py-2 text-white rounded-lg text-sm transition-colors"
          style={{ backgroundColor: 'var(--mode-primary-light)' }}>
          <Plus size={16} /> Neuer Vorgang
        </button>
      </div>

      {/* Grouped list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p className="text-lg mb-1">Keine Vorgänge gefunden</p>
          <p className="text-sm">Importieren Sie E-Mails oder erstellen Sie einen neuen Vorgang</p>
        </div>
      ) : (
        <div className="space-y-6">
          {STATUS_ORDER.map(status => {
            const group = grouped[status]
            if (!group || group.length === 0) return null
            return (
              <div key={status}>
                <div className="flex items-center gap-2 mb-3">
                  <StatusBadge status={status} />
                  <span className="text-base text-slate-400 font-mono">{group.length}</span>
                </div>
                <div className="space-y-2">
                  {group.map(c => (
                    <div key={c.id} onClick={() => onOpenCase(c)}
                      className="card-base p-4 cursor-pointer transition-all flex items-center justify-between">
                      <div>
                        <div className="font-medium text-base text-slate-800">{c.kunde?.name || 'Unbekannt'}</div>
                        <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                          <span>VS-Nr: {c.versicherungsnummer?.value || '-'}</span>
                          <span>{c.sparte || '-'}</span>
                          <span>Makler: {c.makler?.name || '-'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {c.exported?.date && <span className="text-sm px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">Exportiert</span>}
                        <span className="text-sm text-slate-400 font-mono">{formatDate(c.updatedAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
