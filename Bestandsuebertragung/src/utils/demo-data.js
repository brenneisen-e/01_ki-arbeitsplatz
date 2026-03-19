import * as Storage from './storage.js'

const MAKLER_POOL = [
  { name: 'Thomas Meier', email: 'thomas.meier@meier-makler.de' },
  { name: 'Sandra Müller', email: 'mueller@vsm-versicherung.de' },
  { name: 'Michael Schmidt', email: 'm.schmidt@schmidt-finanz.de' },
  { name: 'Andrea Weber', email: 'weber@finanzkonzepte.de' },
  { name: 'Stefan Bauer', email: 'bauer@makler-bauer.de' },
  { name: 'Christine Fischer', email: 'c.fischer@fischer-makler.de' },
  { name: 'Peter Wagner', email: 'pwagner@vfb-versicherung.de' },
  { name: 'Sabine Koch', email: 'koch@skv-makler.de' },
  { name: 'Klaus Becker', email: 'becker@becker-assekuranz.de' },
  { name: 'Martina Hoffmann', email: 'hoffmann@mh-versicherungen.de' },
  { name: 'Frank Schulz', email: 'schulz@schulz-makler.de' },
  { name: 'Julia Richter', email: 'j.richter@richter-finanz.de' },
  { name: 'Hans Klein', email: 'klein@kleinmaklerbüro.de' },
  { name: 'Petra Wolf', email: 'p.wolf@wolf-assekuranz.de' },
  { name: 'Ralf Schäfer', email: 'schaefer@rs-versicherungen.de' },
  { name: 'Monika Neumann', email: 'neumann@neumann-makler.de' },
  { name: 'Jürgen Schwarz', email: 'schwarz@jsm-versicherung.de' },
  { name: 'Angelika Braun', email: 'braun@ab-finanzservice.de' },
  { name: 'Werner Zimmermann', email: 'zimmermann@wz-makler.de' },
  { name: 'Elisabeth Hartmann', email: 'hartmann@hartmann-versicherungen.de' }
]

const SPARTEN = ['KFZ', 'Leben', 'Kranken', 'Haftpflicht', 'Hausrat', 'Rechtsschutz', 'Unfall', 'BU', 'Wohngebäude', 'Rente']

const KUNDEN_POOL = [
  'Müller, Hans', 'Schmidt, Peter', 'Schneider, Maria', 'Fischer, Anna',
  'Weber, Thomas', 'Meyer, Julia', 'Wagner, Michael', 'Becker, Sandra',
  'Schulz, Klaus', 'Hoffmann, Petra', 'Koch, Stefan', 'Richter, Sabine',
  'Klein, Frank', 'Wolf, Martina', 'Schröder, Andreas', 'Neumann, Christine',
  'Schwarz, Ralf', 'Zimmermann, Elisabeth', 'Braun, Werner', 'Krüger, Monika',
  'Hartmann, Jürgen', 'Lange, Angelika', 'Schmitt, Bernd', 'Werner, Susanne',
  'Schmitz, Oliver', 'Krause, Birgit', 'Meier, Dieter', 'Lehmann, Karin',
  'Schmid, Wolfgang', 'Schulze, Renate', 'Maier, Heinz', 'Köhler, Ingrid',
  'Herrmann, Manfred', 'König, Ursula', 'Walter, Günter', 'Mayer, Helga',
  'Huber, Roland', 'Kaiser, Gisela', 'Fuchs, Horst', 'Peters, Erika'
]

function generateVsNr() {
  return `ERG-${Math.floor(1000000 + Math.random() * 9000000)}`
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function fmtDate(date) {
  return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

function generateEmail(kunde, vsNr, sparte, makler, type = 'request', receivedDate) {
  const subjects = {
    request: [`Bestandsübertragung für ${kunde}`, `Antrag auf Bestandsübertragung - ${vsNr}`],
    confirmation: [`Bestätigung Bestandsübertragung ${vsNr}`],
    reminder: [`Erinnerung: Bestandsübertragung ${kunde}`]
  }

  const bodies = {
    request: `Sehr geehrte Damen und Herren,\n\nhiermit beantrage ich die Übertragung des Vertrages auf mein Maklermandat.\n\nKundendaten:\n- Versicherungsnehmer: ${kunde}\n- Versicherungsnummer: ${vsNr}\n- Sparte: ${sparte}\n\nMit freundlichen Grüßen\n${makler.name}\nVersicherungsmakler\n${makler.email}`,
    confirmation: `Wir bestätigen die erfolgreiche Übertragung des Vertrages ${vsNr} auf ${makler.name}.\n\nMit freundlichen Grüßen\nERGO Bestandsservice`,
    reminder: `Nachfrage zum Stand der Bestandsübertragung für ${kunde} (VS-Nr: ${vsNr}).\n\n${makler.name}`
  }

  const d = receivedDate || new Date()
  const dateStr = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:00`

  return {
    entryID: 'demo-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
    conversationID: 'conv-' + vsNr.replace(/[^a-zA-Z0-9]/g, ''),
    subject: pick(subjects[type] || subjects.request),
    senderEmail: type === 'confirmation' ? 'bestand@ergo.de' : makler.email,
    receivedTime: dateStr,
    bodyPlain: bodies[type] || bodies.request,
    folder: type === 'confirmation' ? 'inbox' : 'sent'
  }
}

function generateDemoCase(status, workflowLevel) {
  const makler = pick(MAKLER_POOL)
  const kunde = pick(KUNDEN_POOL)
  const vsNr = generateVsNr()
  const sparte = pick(SPARTEN)
  const now = new Date()
  const created = randomDate(new Date(now - 30 * 86400000), now)
  const updated = randomDate(created, now)
  const gueltigDatum = new Date(now.getTime() + (30 + Math.random() * 60) * 86400000)

  const workflow = {
    mailReceived: randomDate(new Date(created.getTime() - 2 * 86400000), created).toISOString(),
    mailUploaded: created.toISOString(),
    kiRecognized: workflowLevel >= 1 ? created.toISOString() : null,
    pvValidated: workflowLevel >= 2 ? randomDate(created, updated).toISOString() : null,
    exported: workflowLevel >= 3 ? updated.toISOString() : null
  }

  const messages = [generateEmail(kunde, vsNr, sparte, makler, 'request', created)]
  if (workflowLevel >= 2) messages.push(generateEmail(kunde, vsNr, sparte, makler, 'confirmation', updated))
  else if (status === 'wiedervorlage') messages.push(generateEmail(kunde, vsNr, sparte, makler, 'reminder', updated))

  const statusHistory = [{ date: created.toISOString(), from: null, to: 'unvollstaendig', note: 'Aus E-Mail erstellt' }]
  if (workflowLevel >= 1) statusHistory.push({ date: created.toISOString(), from: 'unvollstaendig', to: 'zu-validieren', note: 'Automatisch erkannt' })
  if (workflowLevel >= 2) statusHistory.push({ date: updated.toISOString(), from: 'zu-validieren', to: 'export-bereit', note: 'PV validiert' })
  if (workflowLevel >= 3) statusHistory.push({ date: updated.toISOString(), from: 'export-bereit', to: 'abgeschlossen', note: 'Exportiert' })

  return {
    id: Storage.generateId(),
    createdAt: created.toISOString(), updatedAt: updated.toISOString(),
    kunde: { name: kunde, confidence: 0.9 + Math.random() * 0.1, source: 'auto' },
    versicherungsnummer: { value: vsNr, confidence: 0.95 + Math.random() * 0.05, source: 'auto' },
    gueltigkeitsdatum: { value: fmtDate(gueltigDatum), confidence: 0.85 + Math.random() * 0.1, source: 'auto' },
    versicherer: { name: 'ERGO', confidence: 1.0, source: 'email-domain' },
    makler, status, sparte, notes: '', flagged: false, workflow,
    conversationIds: [messages[0].conversationID],
    messageIds: messages.map(m => m.entryID),
    messages, statusHistory,
    validationHistory: workflowLevel >= 2 ? [{ date: updated.toISOString(), user: 'Demo', action: 'validiert' }] : [],
    exported: workflowLevel >= 3 ? { date: updated.toISOString(), by: 'Demo-Export' } : null
  }
}

export function loadDemoData(force = false) {
  const settings = Storage.getSettings()
  const existing = Storage.getCasesArray()
  if (settings.demoLoaded && !force && existing.length > 0) return false
  if (force) Storage.clearAll()

  const cases = []
  for (let i = 0; i < 6; i++) cases.push(generateDemoCase('export-bereit', 2))
  for (let i = 0; i < 5; i++) cases.push(generateDemoCase('zu-validieren', 1))
  for (let i = 0; i < 2; i++) { const c = generateDemoCase('wiedervorlage', 1); c.wiedervorlage = fmtDate(new Date(Date.now() + 14 * 86400000)); cases.push(c) }
  for (let i = 0; i < 2; i++) cases.push(generateDemoCase('abgeschlossen', 3))
  for (let i = 0; i < 3; i++) {
    const c = generateDemoCase('unvollstaendig', 0)
    if (i === 0) c.versicherungsnummer = { value: '', confidence: 0, source: 'manual' }
    if (i === 1) c.kunde = { name: '', confidence: 0, source: 'manual' }
    cases.push(c)
  }
  for (let i = 0; i < 2; i++) {
    const c = generateDemoCase('abgelehnt', 2)
    c.status = 'abgelehnt'
    c.rejectReason = i === 0 ? 'Maklervollmacht fehlt' : 'Vertrag bereits gekündigt'
    cases.push(c)
  }
  for (let batch = 0; batch < 2; batch++) {
    const bm = pick(MAKLER_POOL), bs = pick(SPARTEN), ids = []
    for (let i = 0; i < 3; i++) { const c = generateDemoCase('zu-validieren', 1); c.makler = bm; c.sparte = bs; ids.push(c.id); cases.push(c) }
    ids.forEach(id => { const c = cases.find(c => c.id === id); if (c) { c.linkedCaseIds = ids.filter(lid => lid !== id); c.sourceEmailId = 'sammelmail-' + batch } })
  }

  const casesObj = {}
  cases.forEach(c => casesObj[c.id] = c)
  Storage.saveCases(casesObj)
  Storage.saveSettings({ demoLoaded: true })
  return true
}

export function downloadDemoExportJSON() {
  const conversations = []
  for (let i = 0; i < 800; i++) {
    const m = pick(MAKLER_POOL), k = pick(KUNDEN_POOL), v = generateVsNr(), s = pick(SPARTEN)
    const rd = randomDate(new Date(Date.now() - 90 * 86400000), new Date())
    conversations.push({ conversationID: 'conv-' + i + '-' + Math.random().toString(36).substr(2, 6), emails: [generateEmail(k, v, s, m, 'request', rd)] })
  }
  for (let i = 0; i < 200; i++) {
    const m = pick(MAKLER_POOL), k = pick(KUNDEN_POOL), v = generateVsNr(), s = pick(SPARTEN)
    const rd = randomDate(new Date(Date.now() - 60 * 86400000), new Date())
    conversations.push({ conversationID: 'conv-r-' + i, emails: [generateEmail(k, v, s, m, 'request', new Date(rd.getTime() - 7 * 86400000)), generateEmail(k, v, s, m, 'reminder', rd)] })
  }
  const data = { exportDate: new Date().toISOString(), source: 'Demo-Generator', conversations }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = `demo_outlook_export_${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
  return data.conversations.reduce((sum, c) => sum + c.emails.length, 0)
}
