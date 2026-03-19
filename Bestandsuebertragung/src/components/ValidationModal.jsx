import { useState, useEffect } from 'react'
import Modal from './Modal'
import { useApp } from '../context/AppContext'
import * as Storage from '../utils/storage'
import { SPARTEN } from '../utils/constants'
import { truncateText } from '../utils/format'

export default function ValidationModal({ isOpen, onClose, casesToValidate = [] }) {
  const { refresh, showToast } = useApp()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [form, setForm] = useState({ kunde: '', vsNr: '', sparte: '', datum: '', makler: '', wiedervorlage: '', rejectReason: '' })
  const [showReject, setShowReject] = useState(false)

  const currentCase = casesToValidate[currentIndex] || null
  const total = casesToValidate.length
  const hasMore = currentIndex < total - 1

  useEffect(() => {
    setCurrentIndex(0)
    setShowReject(false)
  }, [casesToValidate, isOpen])

  useEffect(() => {
    if (!currentCase) return
    setForm({
      kunde: currentCase.kunde?.name || '',
      vsNr: currentCase.versicherungsnummer?.value || '',
      sparte: currentCase.sparte || '',
      datum: currentCase.gueltigkeitsdatum?.value || '',
      makler: currentCase.makler?.name || '',
      wiedervorlage: '', rejectReason: ''
    })
    setShowReject(false)
  }, [currentIndex, currentCase])

  function handleConfirm() {
    if (!currentCase) return
    const c = { ...Storage.getCase(currentCase.id) }
    if (!c.kunde) c.kunde = {}; c.kunde.name = form.kunde
    if (!c.versicherungsnummer) c.versicherungsnummer = {}; c.versicherungsnummer.value = form.vsNr
    c.sparte = form.sparte
    if (!c.gueltigkeitsdatum) c.gueltigkeitsdatum = {}; c.gueltigkeitsdatum.value = form.datum
    if (!c.makler) c.makler = {}; c.makler.name = form.makler

    if (form.wiedervorlage) { c.wiedervorlage = form.wiedervorlage; c.status = 'wiedervorlage' }
    else { c.wiedervorlage = null; c.status = 'export-bereit' }

    c.updatedAt = new Date().toISOString()
    if (!c.statusHistory) c.statusHistory = []
    c.statusHistory.push({ date: new Date().toISOString().split('T')[0], from: 'zu-validieren', to: c.status, note: c.status === 'wiedervorlage' ? 'PV: Wiedervorlage' : 'PV validiert' })
    if (!c.workflow) c.workflow = {}; c.workflow.pvValidated = new Date().toISOString()

    Storage.saveCase(c)
    advance('Vorgang validiert', 'success')
  }

  function handleReject() {
    if (!showReject) { setShowReject(true); return }
    if (!form.rejectReason.trim()) { showToast('Bitte Ablehnungsgrund angeben', 'warning'); return }
    if (!currentCase) return

    const c = { ...Storage.getCase(currentCase.id) }
    if (!c.kunde) c.kunde = {}; c.kunde.name = form.kunde
    if (!c.versicherungsnummer) c.versicherungsnummer = {}; c.versicherungsnummer.value = form.vsNr
    c.sparte = form.sparte
    c.status = 'abgelehnt'
    c.rejectReason = form.rejectReason
    c.updatedAt = new Date().toISOString()
    if (!c.workflow) c.workflow = {}; c.workflow.pvValidated = new Date().toISOString()
    if (!c.statusHistory) c.statusHistory = []
    c.statusHistory.push({ date: new Date().toISOString().split('T')[0], from: 'zu-validieren', to: 'abgelehnt', note: 'Abgelehnt: ' + form.rejectReason })

    Storage.saveCase(c)
    setShowReject(false)
    advance('Vorgang abgelehnt', 'info')
  }

  function handleWiedervorlage() {
    if (!currentCase) return
    const c = { ...Storage.getCase(currentCase.id) }
    let wvDate = form.wiedervorlage
    if (!wvDate) { const d = new Date(); d.setDate(d.getDate() + 14); wvDate = d.toISOString().split('T')[0] }

    if (!c.kunde) c.kunde = {}; c.kunde.name = form.kunde
    if (!c.versicherungsnummer) c.versicherungsnummer = {}; c.versicherungsnummer.value = form.vsNr
    c.sparte = form.sparte
    c.wiedervorlage = wvDate; c.status = 'wiedervorlage'
    c.updatedAt = new Date().toISOString()
    if (!c.workflow) c.workflow = {}; c.workflow.pvValidated = new Date().toISOString()
    if (!c.statusHistory) c.statusHistory = []
    c.statusHistory.push({ date: new Date().toISOString().split('T')[0], from: 'zu-validieren', to: 'wiedervorlage', note: 'Wiedervorlage bis ' + wvDate })

    Storage.saveCase(c)
    advance('Wiedervorlage gesetzt', 'success')
  }

  function advance(msg, type) {
    if (hasMore) { setCurrentIndex(i => i + 1); showToast(msg, type) }
    else { onClose(); showToast('Alle Vorgänge validiert', 'success'); refresh() }
  }

  function handleSkip() {
    if (hasMore) setCurrentIndex(i => i + 1)
    else { onClose(); showToast('Validierung abgeschlossen', 'info'); refresh() }
  }

  if (!currentCase) return null

  const firstMsg = currentCase.messages?.[0]
  const bodyPreview = truncateText(firstMsg?.bodyPlain || firstMsg?.body || '', 500)

  return (
    <Modal isOpen={isOpen} onClose={() => { onClose(); refresh() }} title={`Validierung ${currentIndex + 1}/${total}`} wide>
      <div className="space-y-4">
        {/* Email Preview */}
        {firstMsg && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="font-medium text-sm text-gray-700 mb-2">{firstMsg.subject || 'Kein Betreff'}</div>
            <div className="text-xs text-gray-500 whitespace-pre-wrap max-h-40 overflow-y-auto">{bodyPreview}</div>
          </div>
        )}

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ValField label="Kunde" value={form.kunde} onChange={v => setForm(f => ({ ...f, kunde: v }))} />
          <ValField label="VS-Nr" value={form.vsNr} onChange={v => setForm(f => ({ ...f, vsNr: v }))} />
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Sparte</label>
            <select value={form.sparte} onChange={e => setForm(f => ({ ...f, sparte: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c41230]/30">
              <option value="">–</option>
              {SPARTEN.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <ValField label="Datum" value={form.datum} onChange={v => setForm(f => ({ ...f, datum: v }))} type="date" />
          <ValField label="Makler" value={form.makler} onChange={v => setForm(f => ({ ...f, makler: v }))} />
          <ValField label="Wiedervorlage" value={form.wiedervorlage} onChange={v => setForm(f => ({ ...f, wiedervorlage: v }))} type="date" />
        </div>

        {/* Reject section */}
        {showReject && (
          <div className="bg-red-50 rounded-lg p-4">
            <label className="block text-xs font-medium text-red-700 mb-1">Ablehnungsgrund</label>
            <textarea value={form.rejectReason} onChange={e => setForm(f => ({ ...f, rejectReason: e.target.value }))}
              className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 h-16"
              autoFocus placeholder="Grund eingeben..." />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button onClick={handleSkip} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg">
            Überspringen
          </button>
          <div className="flex gap-2">
            <button onClick={handleReject} className="px-4 py-2 text-sm text-red-600 border border-red-200 hover:bg-red-50 rounded-lg">
              Ablehnen
            </button>
            <button onClick={handleWiedervorlage} className="px-4 py-2 text-sm text-yellow-700 border border-yellow-200 hover:bg-yellow-50 rounded-lg">
              Wiedervorlage
            </button>
            <button onClick={handleConfirm} className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
              Validieren ✓
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

function ValField({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c41230]/30" />
    </div>
  )
}
