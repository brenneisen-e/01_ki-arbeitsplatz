import Modal from './Modal'
import StatusBadge from './StatusBadge'
import { formatDate } from '../utils/format'
import * as Storage from '../utils/storage'

export default function MaklerModal({ isOpen, onClose, maklerData, onOpenCase }) {
  if (!maklerData) return null
  const cases = Storage.findCasesByMakler(maklerData.name)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={maklerData.name} wide>
      <div className="space-y-4">
        {/* Stats */}
        <div className="flex items-center gap-6">
          <div className="text-sm text-gray-500">E-Mail: <span className="text-gray-700">{maklerData.email}</span></div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <StatCard label="Vorgänge" value={maklerData.total} />
          <StatCard label="Bestätigt" value={maklerData.bestaetigt} color="text-green-600" />
          <StatCard label="Offen" value={maklerData.offen} color="text-yellow-600" />
          <StatCard label="Abgelehnt" value={maklerData.abgelehnt} color="text-red-600" />
        </div>

        {/* Cases table */}
        {cases.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 bg-gray-50 border-b border-gray-200">
                  <th className="py-2 px-3 w-10">Status</th>
                  <th className="py-2 px-3">Kunde</th>
                  <th className="py-2 px-3">VS-Nr</th>
                  <th className="py-2 px-3">Sparte</th>
                  <th className="py-2 px-3">Aktualisiert</th>
                </tr>
              </thead>
              <tbody>
                {cases.map(c => (
                  <tr key={c.id} onClick={() => { onClose(); onOpenCase(c) }}
                    className="hover:bg-gray-50 cursor-pointer border-b border-gray-50">
                    <td className="py-2.5 px-3"><StatusBadge status={c.status} showLabel={false} /></td>
                    <td className="py-2.5 px-3 text-gray-700">{c.kunde?.name || 'Unbekannt'}</td>
                    <td className="py-2.5 px-3 text-gray-500">{c.versicherungsnummer?.value || '-'}</td>
                    <td className="py-2.5 px-3 text-gray-500">{c.sparte || '-'}</td>
                    <td className="py-2.5 px-3 text-xs text-gray-400">{formatDate(c.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  )
}

function StatCard({ label, value, color = 'text-gray-800' }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 text-center">
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  )
}
