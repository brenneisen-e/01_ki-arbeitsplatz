import * as Storage from './storage.js'
import { formatDateForFilename } from './format.js'

function formatGermanDate(isoDate) {
  if (!isoDate) return ''
  try {
    const date = new Date(isoDate)
    if (isNaN(date.getTime())) return isoDate
    return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`
  } catch { return isoDate }
}

export function exportToCSV(cases, filename) {
  const headers = ['ID', 'Kunde', 'VS-Nr', 'Sparte', 'Status', 'Gültig ab', 'Makler', 'Makler E-Mail', 'Notizen', 'Mails', 'Erstellt', 'Aktualisiert']
  const rows = cases.map(c => {
    const gd = c.gueltigkeitsdatum?.value || ''
    const fd = gd.includes('-') ? formatGermanDate(gd) : gd
    return [c.id, c.kunde?.name || '', c.versicherungsnummer?.value || '', c.sparte || '', c.status || '', fd, c.makler?.name || '', c.makler?.email || '', (c.notes || '').replace(/[\r\n]+/g, ' '), c.messages?.length || 0, formatGermanDate(c.createdAt), formatGermanDate(c.updatedAt)]
  })
  const BOM = '\uFEFF'
  const csv = BOM + [headers.join(';'), ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))].join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = filename || `bestand_export_${formatDateForFilename(new Date())}.csv`
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
  return rows.length
}

export function importFromJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        if (data.cases && data.exportDate) { Storage.importData(data); resolve({ type: 'backup', data }) }
        else if (data.conversations || data.emails) { resolve({ type: 'outlook', data }) }
        else { reject(new Error('Unbekanntes Dateiformat')) }
      } catch (err) { reject(new Error('Fehler beim Parsen: ' + err.message)) }
    }
    reader.onerror = () => reject(new Error('Fehler beim Lesen der Datei'))
    reader.readAsText(file, 'UTF-8')
  })
}

export function fixMojibake(text) {
  if (!text) return text
  const replacements = {
    '\u00c3\u00a4': '\u00e4', '\u00c3\u00b6': '\u00f6', '\u00c3\u00bc': '\u00fc',
    '\u00c3\u201e': '\u00c4', '\u00c3\u2013': '\u00d6', '\u00c3\u0153': '\u00dc', '\u00c3\u0178': '\u00df'
  }
  let fixed = text
  for (const [wrong, correct] of Object.entries(replacements)) fixed = fixed.split(wrong).join(correct)
  return fixed
}

export function fixEmailEncoding(email) {
  if (!email) return email
  return { ...email, subject: fixMojibake(email.subject), bodyPlain: fixMojibake(email.bodyPlain), body: fixMojibake(email.body), senderName: fixMojibake(email.senderName) }
}
