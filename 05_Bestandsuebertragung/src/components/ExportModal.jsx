import { useState } from 'react'
import Modal from './Modal'
import { useApp } from '../context/AppContext'
import * as Storage from '../utils/storage'
import { exportToCSV } from '../utils/export'
import { formatDateForFilename } from '../utils/format'
import { getMarke } from '../utils/branding'

export default function ExportModal({ isOpen, onClose }) {
  const { refresh, showToast } = useApp()
  const [exporterName, setExporterName] = useState('')

  const exportReadyCases = Storage.getExportReadyCases()

  function handleExport() {
    if (!exporterName.trim()) {
      showToast('Bitte Namen eingeben', 'warning')
      return
    }
    const caseIds = exportReadyCases.map(c => c.id)
    exportToCSV(exportReadyCases, `${getMarke().id === 'ergo' ? 'ergo_' : ''}robotics_export_${formatDateForFilename(new Date())}.csv`)
    const count = Storage.markCasesExported(caseIds, exporterName.trim())
    Storage.logImportExport('export', count, exporterName.trim())
    onClose()
    showToast(`${count} Vorgänge exportiert und als "exportiert" markiert`, 'success')
    refresh()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export an Robotics">
      <div className="space-y-4">
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-green-700">{exportReadyCases.length}</div>
          <div className="text-sm text-green-600">Vorgänge bereit zum Export</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Exportiert von</label>
          <input type="text" value={exporterName} onChange={e => setExporterName(e.target.value)}
            placeholder="Ihr Name..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c41230]/30" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Abbrechen</button>
          <button onClick={handleExport} className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
            Exportieren
          </button>
        </div>
      </div>
    </Modal>
  )
}
