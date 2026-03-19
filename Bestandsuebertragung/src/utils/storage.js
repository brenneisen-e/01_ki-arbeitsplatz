/**
 * Storage Modul - localStorage Persistenz für Bestandsübertragung
 */

const KEYS = {
  CASES: 'bestandsuebertragung_cases',
  PROCESSED: 'bestandsuebertragung_processed',
  SETTINGS: 'bestandsuebertragung_settings',
  UNASSIGNED: 'bestandsuebertragung_unassigned'
}

const DEFAULT_SETTINGS = {
  autoMatch: true,
  confirmDelete: true,
  demoLoaded: false
}

function safeJSONParse(str, fallback) {
  try { return JSON.parse(str) || fallback }
  catch { return fallback }
}

export function generateId() {
  return 'case-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9)
}

export function getCases() {
  return safeJSONParse(localStorage.getItem(KEYS.CASES), {})
}

export function saveCases(cases) {
  try { localStorage.setItem(KEYS.CASES, JSON.stringify(cases)); return true }
  catch { return false }
}

export function getCase(id) {
  return getCases()[id] || null
}

export function saveCase(caseData) {
  const cases = getCases()
  const now = new Date().toISOString()
  if (!caseData.id) { caseData.id = generateId(); caseData.createdAt = now }
  caseData.updatedAt = now
  cases[caseData.id] = caseData
  return saveCases(cases) ? caseData : null
}

export function deleteCase(id) {
  const cases = getCases()
  if (cases[id]) { delete cases[id]; return saveCases(cases) }
  return false
}

export function getCasesArray() {
  return Object.values(getCases())
}

export function getProcessedMessageIds() {
  return safeJSONParse(localStorage.getItem(KEYS.PROCESSED), [])
}

export function markMessageProcessed(messageId) {
  const processed = getProcessedMessageIds()
  if (!processed.includes(messageId)) {
    processed.push(messageId)
    localStorage.setItem(KEYS.PROCESSED, JSON.stringify(processed))
  }
}

export function markMessagesProcessed(messageIds) {
  const processed = getProcessedMessageIds()
  let changed = false
  messageIds.forEach(id => {
    if (!processed.includes(id)) { processed.push(id); changed = true }
  })
  if (changed) localStorage.setItem(KEYS.PROCESSED, JSON.stringify(processed))
}

export function isMessageProcessed(messageId) {
  return getProcessedMessageIds().includes(messageId)
}

export function getUnassignedMails() {
  return safeJSONParse(localStorage.getItem(KEYS.UNASSIGNED), [])
}

export function addUnassignedMail(mail) {
  const mails = getUnassignedMails()
  if (!mails.find(m => m.entryID === mail.entryID)) {
    mails.push(mail)
    localStorage.setItem(KEYS.UNASSIGNED, JSON.stringify(mails))
  }
}

export function removeUnassignedMail(entryID) {
  const mails = getUnassignedMails().filter(m => m.entryID !== entryID)
  localStorage.setItem(KEYS.UNASSIGNED, JSON.stringify(mails))
}

export function clearUnassignedMails() {
  localStorage.setItem(KEYS.UNASSIGNED, JSON.stringify([]))
}

export function getSettings() {
  return { ...DEFAULT_SETTINGS, ...safeJSONParse(localStorage.getItem(KEYS.SETTINGS), {}) }
}

export function saveSettings(settings) {
  const updated = { ...getSettings(), ...settings }
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(updated))
  return updated
}

export function clearAll() {
  localStorage.removeItem(KEYS.CASES)
  localStorage.removeItem(KEYS.PROCESSED)
  localStorage.removeItem(KEYS.UNASSIGNED)
  localStorage.removeItem('importExportHistory')
  const settings = getSettings()
  settings.demoLoaded = false
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings))
}

export function getDetailedStats() {
  const cases = getCasesArray()
  const stats = {
    total: cases.length,
    byStatus: { 'unvollstaendig': 0, 'zu-validieren': 0, 'export-bereit': 0, 'abgeschlossen': 0, 'abgelehnt': 0, 'wiedervorlage': 0 },
    exportiert: 0,
    exportReady: 0,
    byWorkflow: { mailReceived: 0, mailUploaded: 0, kiRecognized: 0, pvValidated: 0, exported: 0 }
  }
  cases.forEach(c => {
    if (stats.byStatus.hasOwnProperty(c.status)) stats.byStatus[c.status]++
    if (c.exported?.date) stats.exportiert++
    if (c.status === 'export-bereit' && !c.exported?.date) stats.exportReady++
    if (c.workflow) {
      if (c.workflow.mailReceived) stats.byWorkflow.mailReceived++
      if (c.workflow.mailUploaded) stats.byWorkflow.mailUploaded++
      if (c.workflow.kiRecognized && c.status !== 'unvollstaendig') stats.byWorkflow.kiRecognized++
      if (c.workflow.pvValidated) stats.byWorkflow.pvValidated++
      if (c.workflow.exported) stats.byWorkflow.exported++
    }
  })
  return stats
}

export function getExportReadyCases() {
  return getCasesArray().filter(c => c.workflow?.pvValidated && !c.exported?.date)
}

export function getPendingValidationCases() {
  return getCasesArray().filter(c => c.workflow?.kiRecognized && !c.workflow?.pvValidated && c.status !== 'unvollstaendig')
}

export function getIncompleteCases() {
  return getCasesArray().filter(c => c.status === 'unvollstaendig')
}

export function markCaseValidated(caseId) {
  const caseData = getCase(caseId)
  if (!caseData) return false
  if (!caseData.workflow) caseData.workflow = {}
  caseData.workflow.pvValidated = new Date().toISOString()
  return saveCase(caseData)
}

export function markCasesValidated(caseIds) {
  const cases = getCases()
  const date = new Date().toISOString()
  let count = 0
  caseIds.forEach(id => {
    if (cases[id]) {
      if (!cases[id].workflow) cases[id].workflow = {}
      cases[id].workflow.pvValidated = date
      cases[id].updatedAt = date
      count++
    }
  })
  saveCases(cases)
  return count
}

export function markCasesExported(caseIds, exporterName) {
  const cases = getCases()
  const exportDate = new Date().toISOString()
  let count = 0
  caseIds.forEach(id => {
    if (cases[id]) {
      const prev = cases[id].status
      cases[id].exported = { date: exportDate, by: exporterName }
      cases[id].status = 'abgeschlossen'
      if (!cases[id].workflow) cases[id].workflow = {}
      cases[id].workflow.exported = exportDate
      if (!cases[id].statusHistory) cases[id].statusHistory = []
      cases[id].statusHistory.push({ date: exportDate.split('T')[0], from: prev, to: 'abgeschlossen', note: `Exportiert von ${exporterName}` })
      cases[id].updatedAt = exportDate
      count++
    }
  })
  saveCases(cases)
  return count
}

export function getSpartenStats() {
  const spartenMap = {}
  getCasesArray().forEach(c => {
    const sparte = c.sparte || 'Unbekannt'
    spartenMap[sparte] = (spartenMap[sparte] || 0) + 1
  })
  return Object.entries(spartenMap).map(([sparte, count]) => ({ sparte, count })).sort((a, b) => b.count - a.count)
}

export function getRecentActivity(limit = 10) {
  const activities = []
  getCasesArray().forEach(c => {
    (c.statusHistory || []).forEach(h => {
      activities.push({
        caseId: c.id, kundeName: c.kunde?.name || 'Unbekannt',
        maklerName: c.makler?.name || '-', date: h.date,
        from: h.from, to: h.to, note: h.note, isNew: h.isNew || false
      })
    })
  })
  return activities.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, limit)
}

export function getImportExportHistory() {
  try { return JSON.parse(localStorage.getItem('importExportHistory')) || [] }
  catch { return [] }
}

export function logImportExport(type, count, user) {
  const history = getImportExportHistory()
  history.unshift({ date: new Date().toISOString(), type, count, user: user || 'Unbekannt' })
  localStorage.setItem('importExportHistory', JSON.stringify(history.slice(0, 50)))
}

export function getMaklerStats() {
  const maklerMap = {}
  getCasesArray().forEach(c => {
    const name = c.makler?.name || 'Unbekannt'
    const email = c.makler?.email || ''
    if (!maklerMap[name]) maklerMap[name] = { name, email, total: 0, bestaetigt: 0, abgelehnt: 0, offen: 0, cases: [] }
    maklerMap[name].total++
    maklerMap[name].cases.push(c)
    if (c.status === 'bestaetigt') maklerMap[name].bestaetigt++
    else if (c.status === 'abgelehnt') maklerMap[name].abgelehnt++
    else maklerMap[name].offen++
  })
  return Object.values(maklerMap).sort((a, b) => b.total - a.total)
}

export function getAllEmails() {
  const emails = []
  getCasesArray().forEach(c => {
    (c.messages || []).forEach(msg => {
      emails.push({ ...msg, caseId: c.id, kundeName: c.kunde?.name || 'Unbekannt', status: c.status })
    })
  })
  return emails.sort((a, b) => new Date(b.receivedTime) - new Date(a.receivedTime))
}

export function findCasesByMakler(maklerName) {
  if (!maklerName) return []
  const n = maklerName.toLowerCase()
  return getCasesArray().filter(c => c.makler?.name?.toLowerCase().includes(n))
}

export function addMessagesToCase(caseId, messages) {
  const caseData = getCase(caseId)
  if (!caseData) return false
  if (!caseData.messages) caseData.messages = []
  if (!caseData.messageIds) caseData.messageIds = []
  if (!caseData.conversationIds) caseData.conversationIds = []
  if (!caseData.statusHistory) caseData.statusHistory = []
  let added = 0
  messages.forEach(msg => {
    if (!caseData.messageIds.includes(msg.entryID)) {
      caseData.messages.push(msg)
      caseData.messageIds.push(msg.entryID)
      added++
      if (msg.conversationID && !caseData.conversationIds.includes(msg.conversationID))
        caseData.conversationIds.push(msg.conversationID)
    }
  })
  if (added > 0) {
    caseData.statusHistory.push({
      date: new Date().toISOString(), from: caseData.status, to: caseData.status,
      note: `${added} neue Mail${added > 1 ? 's' : ''} erhalten`, isNew: true
    })
  }
  return saveCase(caseData)
}

export function addStatusHistory(caseId, from, to, note) {
  const caseData = getCase(caseId)
  if (!caseData) return false
  if (!caseData.statusHistory) caseData.statusHistory = []
  caseData.statusHistory.push({ date: new Date().toISOString(), from, to, note: note || '', isNew: true })
  return saveCase(caseData)
}

export function getLinkedCases(caseId) {
  const caseData = getCase(caseId)
  if (!caseData?.linkedCaseIds?.length) return []
  const all = getCases()
  return caseData.linkedCaseIds.filter(id => all[id]).map(id => all[id])
}

export function exportData() {
  return {
    exportDate: new Date().toISOString(),
    cases: getCases(),
    processed: getProcessedMessageIds(),
    unassigned: getUnassignedMails(),
    settings: getSettings()
  }
}

export function importData(data) {
  try {
    if (data.cases) localStorage.setItem(KEYS.CASES, JSON.stringify(data.cases))
    if (data.processed) localStorage.setItem(KEYS.PROCESSED, JSON.stringify(data.processed))
    if (data.unassigned) localStorage.setItem(KEYS.UNASSIGNED, JSON.stringify(data.unassigned))
    if (data.settings) localStorage.setItem(KEYS.SETTINGS, JSON.stringify(data.settings))
    return true
  } catch { return false }
}
