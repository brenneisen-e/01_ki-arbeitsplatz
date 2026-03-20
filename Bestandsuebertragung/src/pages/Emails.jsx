import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import * as Storage from '../utils/storage'
import StatusBadge from '../components/StatusBadge'
import { formatDateTime } from '../utils/format'
import { Search } from 'lucide-react'

export default function Emails({ onOpenCase }) {
  const { cases } = useApp()
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('desc')

  const emails = useMemo(() => {
    let result = Storage.getAllEmails()
    if (search) {
      const s = search.toLowerCase()
      result = result.filter(e => [e.subject, e.senderEmail, e.kundeName, e.bodyPlain].filter(Boolean).join(' ').toLowerCase().includes(s))
    }
    if (sort === 'asc') result = [...result].sort((a, b) => new Date(a.receivedTime) - new Date(b.receivedTime))
    return result
  }, [cases, search, sort])

  return (
    <div className="p-6 space-y-4 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="E-Mails suchen..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg text-base bg-white focus:outline-none focus:ring-2 focus:ring-[#c41230]/30"
            style={{ border: 'var(--card-border)' }} />
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white">
          <option value="desc">Neueste zuerst</option>
          <option value="asc">Älteste zuerst</option>
        </select>
      </div>

      {emails.length === 0 ? (
        <div className="text-center py-12 text-slate-400">Keine E-Mails vorhanden</div>
      ) : (
        <div className="card-base overflow-hidden">
          <table className="w-full text-base">
            <thead>
              <tr className="text-left text-sm text-slate-500 border-b border-slate-200 bg-slate-50">
                <th className="py-2 px-3 w-8"></th>
                <th className="py-2 px-3">Datum</th>
                <th className="py-2 px-3">Absender</th>
                <th className="py-2 px-3">Betreff</th>
                <th className="py-2 px-3">Kunde</th>
                <th className="py-2 px-3 w-10">Status</th>
              </tr>
            </thead>
            <tbody>
              {emails.map((email, i) => {
                const isSent = email.folder === 'sent'
                return (
                  <tr key={i} onClick={() => { const c = Storage.getCase(email.caseId); if (c) onOpenCase(c) }}
                    className="hover:bg-slate-50 cursor-pointer border-b border-slate-100 transition-colors">
                    <td className="py-2.5 px-3"><span className={isSent ? 'text-emerald-500' : 'text-blue-500'}>{isSent ? '↑' : '↓'}</span></td>
                    <td className="py-2.5 px-3 text-xs text-slate-500 font-mono whitespace-nowrap">{formatDateTime(email.receivedTime)}</td>
                    <td className="py-2.5 px-3 text-slate-600 truncate max-w-[200px]">{email.senderEmail || '-'}</td>
                    <td className="py-2.5 px-3 text-slate-700 truncate max-w-[300px]">{email.subject || 'Kein Betreff'}</td>
                    <td className="py-2.5 px-3 text-slate-600">{email.kundeName || 'Unbekannt'}</td>
                    <td className="py-2.5 px-3"><StatusBadge status={email.status} showLabel={false} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
