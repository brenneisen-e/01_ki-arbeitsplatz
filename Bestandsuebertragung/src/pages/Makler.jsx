import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import * as Storage from '../utils/storage'
import { Search, ArrowUpDown } from 'lucide-react'

export default function Makler({ onOpenMakler }) {
  const { cases } = useApp()
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState('total')
  const [sortDir, setSortDir] = useState('desc')

  const maklerStats = useMemo(() => Storage.getMaklerStats(), [cases])

  const filtered = useMemo(() => {
    let result = maklerStats
    if (search) {
      const s = search.toLowerCase()
      result = result.filter(m => m.name.toLowerCase().includes(s) || m.email.toLowerCase().includes(s))
    }
    const mult = sortDir === 'desc' ? -1 : 1
    result = [...result].sort((a, b) => {
      const va = sortField === 'name' ? a.name.toLowerCase() : a[sortField]
      const vb = sortField === 'name' ? b.name.toLowerCase() : b[sortField]
      if (va < vb) return -1 * mult
      if (va > vb) return 1 * mult
      return 0
    })
    return result
  }, [maklerStats, search, sortField, sortDir])

  function handleSort(field) {
    if (sortField === field) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortField(field); setSortDir('desc') }
  }

  const SortHeader = ({ field, children }) => (
    <th className="pb-2 pr-2 cursor-pointer select-none hover:text-gray-700" onClick={() => handleSort(field)}>
      <span className="flex items-center gap-1">
        {children}
        {sortField === field && <span className="text-[10px]">{sortDir === 'desc' ? '↓' : '↑'}</span>}
      </span>
    </th>
  )

  return (
    <div className="p-6 space-y-4">
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Makler suchen..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c41230]/30" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">Keine Makler gefunden</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-200 bg-gray-50">
                <SortHeader field="name">Name</SortHeader>
                <th className="pb-2 pr-2 font-normal">E-Mail</th>
                <SortHeader field="total">Gesamt</SortHeader>
                <SortHeader field="bestaetigt">Bestätigt</SortHeader>
                <SortHeader field="offen">Offen</SortHeader>
                <SortHeader field="abgelehnt">Abgelehnt</SortHeader>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.name} onClick={() => onOpenMakler(m)}
                  className="hover:bg-gray-50 cursor-pointer border-b border-gray-50">
                  <td className="py-3 pr-2 font-medium text-gray-800">{m.name}</td>
                  <td className="py-3 pr-2 text-gray-500">{m.email}</td>
                  <td className="py-3 pr-2 text-gray-700">{m.total}</td>
                  <td className="py-3 pr-2 text-green-600">{m.bestaetigt}</td>
                  <td className="py-3 pr-2 text-yellow-600">{m.offen}</td>
                  <td className="py-3 pr-2 text-red-600">{m.abgelehnt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
