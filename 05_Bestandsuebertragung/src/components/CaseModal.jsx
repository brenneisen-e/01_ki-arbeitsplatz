import { useState, useEffect } from 'react'
import Modal from './Modal'
import StatusBadge from './StatusBadge'
import { useApp } from '../context/AppContext'
import * as Storage from '../utils/storage'
import { STATUS_LABELS, WORKFLOW_STEPS, SPARTEN } from '../utils/constants'
import { formatDate, formatDateTime, truncateText, parseGermanDate } from '../utils/format'

export default function CaseModal({ isOpen, onClose, caseData, onOpenValidation }) {
  const { refresh, showToast } = useApp()
  const isNew = !caseData

  const [form, setForm] = useState({
    kunde: '', vsNr: '', sparte: '', datum: '',
    maklerName: '', maklerEmail: '', status: 'unvollstaendig', notes: ''
  })

  useEffect(() => {
    if (caseData) {
      setForm({
        kunde: caseData.kunde?.name || '',
        vsNr: caseData.versicherungsnummer?.value || '',
        sparte: caseData.sparte || '',
        datum: caseData.gueltigkeitsdatum?.value || '',
        maklerName: caseData.makler?.name || '',
        maklerEmail: caseData.makler?.email || '',
        status: caseData.status || 'unvollstaendig',
        notes: caseData.notes || ''
      })
    } else {
      setForm({ kunde: '', vsNr: '', sparte: '', datum: '', maklerName: '', maklerEmail: '', status: 'unvollstaendig', notes: '' })
    }
  }, [caseData, isOpen])

  function handleSave() {
    if (!form.kunde && !form.vsNr) {
      showToast('Bitte mindestens Kunde oder VS-Nr angeben', 'warning')
      return
    }

    let data
    if (isNew) {
      data = {
        kunde: { name: form.kunde.trim(), confidence: 1.0, source: 'manual' },
        versicherungsnummer: { value: form.vsNr.trim(), confidence: 1.0, source: 'manual' },
        sparte: form.sparte, status: form.status,
        gueltigkeitsdatum: form.datum ? { value: form.datum.trim(), confidence: 1.0, source: 'manual' } : null,
        makler: { name: form.maklerName.trim(), email: form.maklerEmail.trim() },
        notes: form.notes.trim(),
        conversationIds: [], messageIds: [], messages: [],
        statusHistory: [{ date: new Date().toISOString().split('T')[0], from: null, to: form.status, note: 'Manuell erstellt' }]
      }
    } else {
      data = { ...Storage.getCase(caseData.id) }
      const oldStatus = data.status
      data.kunde = { ...data.kunde, name: form.kunde.trim() }
      data.versicherungsnummer = { ...data.versicherungsnummer, value: form.vsNr.trim() }
      data.sparte = form.sparte
      data.status = form.status
      data.gueltigkeitsdatum = form.datum ? { value: form.datum.trim(), confidence: 1.0, source: 'manual' } : data.gueltigkeitsdatum
      data.makler = { name: form.maklerName.trim(), email: form.maklerEmail.trim() }
      data.notes = form.notes.trim()

      if (oldStatus === 'unvollstaendig' && form.status === 'unvollstaendig') {
        if (form.kunde.trim() && form.vsNr.trim()) {
          data.status = 'zu-validieren'
          showToast('Daten vollständig - Status auf "Zu Validieren" geändert', 'success')
        }
      }
      if (oldStatus !== data.status) {
        if (!data.statusHistory) data.statusHistory = []
        data.statusHistory.push({ date: new Date().toISOString().split('T')[0], from: oldStatus, to: data.status, note: oldStatus === 'unvollstaendig' ? 'Daten ergänzt' : 'Manuell geändert' })
      }
    }

    const saved = Storage.saveCase(data)
    if (saved) {
      showToast(isNew ? 'Vorgang erstellt' : 'Vorgang gespeichert', 'success')
      onClose()
      refresh()
    } else {
      showToast('Fehler beim Speichern', 'error')
    }
  }

  function handleDelete() {
    if (!caseData?.id) return
    if (confirm('Vorgang wirklich löschen?')) {
      if (Storage.deleteCase(caseData.id)) {
        showToast('Vorgang gelöscht', 'success')
        onClose()
        refresh()
      }
    }
  }

  const linkedCases = caseData ? Storage.getLinkedCases(caseData.id) : []
  const messages = caseData?.messages || []
  const workflow = caseData?.workflow || {}

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isNew ? 'Neuer Vorgang' : 'Vorgang bearbeiten'} wide>
      <div className="space-y-6">
        {/* Workflow Timeline */}
        {!isNew && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {WORKFLOW_STEPS.map((step, idx) => {
              const date = workflow[step.key]
              const done = !!date
              return (
                <div key={step.key} className="flex items-center gap-2">
                  {idx > 0 && <div className={`w-8 h-0.5 ${done ? 'bg-green-400' : 'bg-gray-200'}`} />}
                  <div className={`flex flex-col items-center min-w-[80px] ${done ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${done ? 'bg-green-100 text-green-600' : 'bg-gray-100'}`}>
                      {step.icon}
                    </div>
                    <span className="text-[10px] mt-1 text-center">{step.label}</span>
                    <span className="text-[9px]">{date ? formatDate(date) : '–'}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Kundenname" value={form.kunde} onChange={v => setForm(f => ({ ...f, kunde: v }))}
            missing={caseData?.status === 'unvollstaendig' && !form.kunde.trim()} />
          <FormField label="Versicherungsnummer" value={form.vsNr} onChange={v => setForm(f => ({ ...f, vsNr: v }))}
            missing={caseData?.status === 'unvollstaendig' && !form.vsNr.trim()} />
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Sparte</label>
            <select value={form.sparte} onChange={e => setForm(f => ({ ...f, sparte: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c41230]/30">
              <option value="">– Auswählen –</option>
              {SPARTEN.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <FormField label="Gültigkeitsdatum" value={form.datum} onChange={v => setForm(f => ({ ...f, datum: v }))} />
          <FormField label="Makler Name" value={form.maklerName} onChange={v => setForm(f => ({ ...f, maklerName: v }))} />
          <FormField label="Makler E-Mail" value={form.maklerEmail} onChange={v => setForm(f => ({ ...f, maklerEmail: v }))} type="email" />
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c41230]/30">
              {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Notizen</label>
          <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c41230]/30 h-20 resize-y" />
        </div>

        {/* Linked Cases */}
        {linkedCases.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">{linkedCases.length} verknüpfte Vorgänge</h4>
            <div className="space-y-2">
              {linkedCases.map(c => (
                <div key={c.id} className="flex items-center gap-2 text-sm">
                  <StatusBadge status={c.status} showLabel={false} />
                  <span className="text-gray-700">{c.kunde?.name || 'Unbekannt'}</span>
                  <span className="text-gray-400">{c.versicherungsnummer?.value || '-'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Email Timeline */}
        {messages.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">E-Mails ({messages.length})</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {[...messages].sort((a, b) => {
                const da = parseGermanDate(a.receivedTime) || new Date(0)
                const db = parseGermanDate(b.receivedTime) || new Date(0)
                return db - da
              }).map((msg, i) => (
                <EmailItem key={i} msg={msg} />
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex gap-2">
            {!isNew && <button onClick={handleDelete} className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">Löschen</button>}
            {caseData?.status === 'zu-validieren' && (
              <button onClick={() => { onClose(); onOpenValidation([caseData]) }}
                className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">Validieren</button>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Abbrechen</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm bg-[#c41230] text-white rounded-lg hover:bg-[#a00f28] transition-colors">Speichern</button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

function FormField({ label, value, onChange, type = 'text', missing = false }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c41230]/30 ${missing ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'}`} />
    </div>
  )
}

function EmailItem({ msg }) {
  const [open, setOpen] = useState(false)
  const isSent = msg.folder === 'sent'
  return (
    <div className={`border rounded-lg overflow-hidden ${isSent ? 'border-green-200' : 'border-blue-200'}`}>
      <div onClick={() => setOpen(!open)} className="flex items-center gap-2 px-3 py-2 bg-gray-50 cursor-pointer hover:bg-gray-100">
        <span className="text-xs">{open ? '▼' : '▶'}</span>
        <span className={`text-sm ${isSent ? 'text-green-500' : 'text-blue-500'}`}>{isSent ? '↑' : '↓'}</span>
        <span className="text-xs text-gray-400">{formatDateTime(msg.receivedTime)}</span>
        <span className="text-sm text-gray-700 truncate flex-1">{msg.subject || 'Kein Betreff'}</span>
      </div>
      {open && (
        <div className="px-3 py-2 text-xs">
          <div className="text-gray-500 mb-1"><strong>Von:</strong> {msg.senderEmail || '-'}</div>
          <div className="text-gray-600 whitespace-pre-wrap">{msg.bodyPlain || msg.body || ''}</div>
        </div>
      )}
    </div>
  )
}
