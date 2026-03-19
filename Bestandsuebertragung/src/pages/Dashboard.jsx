import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import * as Storage from '../utils/storage'
import StatusBadge from '../components/StatusBadge'
import { formatDate, formatDateTime, parseGermanDate } from '../utils/format'
import { STATUS_LABELS, STATUS_ICONS } from '../utils/constants'
import { Search, AlertTriangle, CheckCircle, Upload, Download } from 'lucide-react'

export default function Dashboard({ onOpenCase, onOpenValidation, onExportReady }) {
  const { cases } = useApp()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortOrder, setSortOrder] = useState('desc')

  const stats = useMemo(() => Storage.getDetailedStats(), [cases])
  const spartenStats = useMemo(() => Storage.getSpartenStats(), [cases])
  const recentActivity = useMemo(() => Storage.getRecentActivity(26), [cases])
  const importExportHistory = useMemo(() => Storage.getImportExportHistory(), [cases])
  const pendingCount = useMemo(() => Storage.getPendingValidationCases().length, [cases])
  const incompleteCount = useMemo(() => Storage.getIncompleteCases().length, [cases])

  const searchResults = useMemo(() => {
    if (search.length < 2) return []
    const q = search.toLowerCase()
    return cases.filter(c => {
      return [c.kunde?.name, c.versicherungsnummer?.value, c.makler?.name, c.makler?.email, c.sparte]
        .filter(Boolean).join(' ').toLowerCase().includes(q)
    }).slice(0, 10)
  }, [search, cases])

  const filteredActivity = useMemo(() => {
    let items = recentActivity
    if (statusFilter) items = items.filter(a => a.to === statusFilter)
    if (sortOrder === 'asc') items = [...items].sort((a, b) => new Date(a.date) - new Date(b.date))
    return items
  }, [recentActivity, statusFilter, sortOrder])

  const total = stats.total || 1
  const wf = stats.byWorkflow || {}
  const pctKi = Math.round((wf.kiRecognized || 0) / total * 100)
  const pctPv = Math.round((wf.pvValidated || 0) / total * 100)
  const pctExport = Math.round((stats.exportReady || 0) / total * 100)
  const pctDone = Math.round((wf.exported || 0) / total * 100)

  return (
    <div className="p-6 space-y-6">
      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text" placeholder="Suche nach Kunde, VS-Nr, Makler, Sparte..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c41230]/30 focus:border-[#c41230]"
        />
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-50 max-h-80 overflow-y-auto">
            {searchResults.map(c => (
              <div key={c.id} onClick={() => { onOpenCase(c); setSearch('') }}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{c.kunde?.name || 'Unbekannt'}</div>
                    <div className="text-xs text-gray-500">VS-Nr: {c.versicherungsnummer?.value || '-'} | {c.sparte || '-'} | Makler: {c.makler?.name || '-'}</div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPICard label="Gesamt" value={stats.total} color="bg-gray-800" />
        <KPICard label="KI erkannt" value={wf.kiRecognized || 0} pct={pctKi} color="bg-blue-500" />
        <KPICard label="PV validiert" value={wf.pvValidated || 0} pct={pctPv} color="bg-indigo-500" />
        <KPICard label="Export-Bereit" value={stats.exportReady || 0} pct={pctExport} color="bg-green-500" />
        <KPICard label="Exportiert" value={wf.exported || 0} pct={pctDone} color="bg-emerald-600" />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {incompleteCount > 0 && (
          <button onClick={() => {}} className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg text-sm hover:bg-yellow-100 transition-colors">
            <AlertTriangle size={16} /> {incompleteCount} Unvollständig
          </button>
        )}
        {pendingCount > 0 && (
          <button onClick={onOpenValidation} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm hover:bg-blue-100 transition-colors">
            <CheckCircle size={16} /> {pendingCount} zu validieren
          </button>
        )}
        {(stats.exportReady || 0) > 0 && (
          <button onClick={onExportReady} className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm hover:bg-green-100 transition-colors">
            <Upload size={16} /> {stats.exportReady} Export-Bereit
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sparten */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-sm text-gray-700 mb-4">Sparten-Verteilung</h3>
          {spartenStats.length === 0 ? (
            <p className="text-sm text-gray-400">Keine Sparten</p>
          ) : (
            <div className="space-y-2">
              {spartenStats.slice(0, 8).map(s => {
                const max = Math.max(...spartenStats.map(x => x.count), 1)
                const pct = Math.round((s.count / max) * 100)
                return (
                  <div key={s.sparte} className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 w-24 truncate" title={s.sparte}>{s.sparte}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#c41230] rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-medium text-gray-700 w-6 text-right">{s.count}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-gray-700">Letzte Aktivitäten</h3>
            <div className="flex items-center gap-2">
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="text-xs border border-gray-200 rounded px-2 py-1">
                <option value="">Alle Status</option>
                {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}
                className="text-xs border border-gray-200 rounded px-2 py-1">
                <option value="desc">Neueste zuerst</option>
                <option value="asc">Älteste zuerst</option>
              </select>
            </div>
          </div>
          <div className="overflow-y-auto max-h-64">
            {filteredActivity.length === 0 ? (
              <p className="text-sm text-gray-400">Keine Aktivitäten</p>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {filteredActivity.map((a, i) => (
                    <tr key={i} onClick={() => { const c = Storage.getCase(a.caseId); if (c) onOpenCase(c) }}
                      className="hover:bg-gray-50 cursor-pointer border-b border-gray-50">
                      <td className="py-2 pr-2 text-xs text-gray-400 w-24">{formatDate(a.date)}</td>
                      <td className="py-2 pr-2 text-gray-700">{a.kundeName}</td>
                      <td className="py-2 pr-2 text-gray-500">{a.maklerName}</td>
                      <td className="py-2"><StatusBadge status={a.to} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Import/Export History */}
      {importExportHistory.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-sm text-gray-700 mb-4">Import/Export Historie</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="pb-2 pr-2">Datum</th><th className="pb-2 pr-2">Typ</th><th className="pb-2 pr-2">Anzahl</th><th className="pb-2">Benutzer</th>
              </tr>
            </thead>
            <tbody>
              {importExportHistory.map((h, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-2 pr-2 text-xs text-gray-500">{formatDateTime(h.date)}</td>
                  <td className="py-2 pr-2"><span className={`text-xs px-2 py-0.5 rounded-full ${h.type === 'import' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{h.type === 'import' ? 'Import' : 'Export'}</span></td>
                  <td className="py-2 pr-2 text-gray-700">{h.count} Vorgänge</td>
                  <td className="py-2 text-gray-500">{h.user || 'Unbekannt'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function KPICard({ label, value, pct, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      {pct !== undefined && (
        <>
          <div className="text-xs text-gray-400 mt-1">{pct}%</div>
          <div className="kpi-bar-track mt-2">
            <div className={`kpi-bar-fill ${color}`} style={{ width: `${pct}%` }} />
          </div>
        </>
      )}
    </div>
  )
}
