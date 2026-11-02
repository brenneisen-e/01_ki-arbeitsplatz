import { useState, useCallback, useEffect } from 'react'
import { FolderOpen } from 'lucide-react'
import { AppProvider, useApp } from './context/AppContext'
import Header from './components/Header'
import ToastContainer from './components/Toast'
import CaseModal from './components/CaseModal'
import MaklerModal from './components/MaklerModal'
import ExportModal from './components/ExportModal'
import ValidationModal from './components/ValidationModal'
import Dashboard from './pages/Dashboard'
import Vorgaenge from './pages/Vorgaenge'
import Makler from './pages/Makler'
import Emails from './pages/Emails'
import AIUploadPage from './pages/AIUploadPage'
import PruefstreckePage from './pages/PruefstreckePage'
import VorlagenPage from './pages/VorlagenPage'
import StaticPage from './pages/StaticPage'
import SimulationPage from './pages/SimulationPage'
import * as Storage from './utils/storage'
import { loadDemoData, downloadDemoExportJSON } from './utils/demo-data'
import { importFromJSON, fixEmailEncoding } from './utils/export'

const ANSICHTEN = [
  'dashboard', 'vorgaenge', 'makler', 'emails', 'ai-upload', 'pruefstrecke',
  'simulation', 'vorlagen', 'architektur', 'prozess', 'projektplan'
]

/** Ansicht aus dem URL-Hash, z. B. „#pruefstrecke“ – damit sich eine Seite direkt verlinken lässt. */
function ansichtAusHash() {
  const hash = window.location.hash.replace(/^#\/?/, '')
  return ANSICHTEN.includes(hash) ? hash : 'dashboard'
}

function AppContent() {
  const { refresh, showToast, cases } = useApp()
  const [activeView, setActiveView] = useState(ansichtAusHash)
  // Der Play-Knopf im Kopf startet die Präsentation von jeder Ansicht aus; sie
  // gehört zur Prüfstrecke, die sie öffnet und die Anforderung dann quittiert.
  const [praesentationAngefordert, setPraesentationAngefordert] = useState(false)
  const startePraesentation = useCallback(() => {
    setActiveView('pruefstrecke')
    setPraesentationAngefordert(true)
  }, [])

  // Ansicht und URL-Hash in beide Richtungen koppeln, damit Deep-Links von außen
  // (etwa aus einer Präsentation) direkt auf einer Seite landen. Der Hash wird
  // ersetzt statt angehängt, damit jeder Tabwechsel keinen Verlaufseintrag erzeugt.
  useEffect(() => {
    const ausHash = () => setActiveView(ansichtAusHash())
    window.addEventListener('hashchange', ausHash)
    return () => window.removeEventListener('hashchange', ausHash)
  }, [])

  useEffect(() => {
    const ziel = activeView === 'dashboard' ? '' : `#${activeView}`
    if (window.location.hash !== ziel) {
      history.replaceState(null, '', ziel || window.location.pathname + window.location.search)
    }
  }, [activeView])

  // Modal states
  const [caseModal, setCaseModal] = useState({ open: false, data: null })
  const [maklerModal, setMaklerModal] = useState({ open: false, data: null })
  const [exportModal, setExportModal] = useState(false)
  const [validationModal, setValidationModal] = useState({ open: false, cases: [] })

  // Drag and drop
  const [dragOver, setDragOver] = useState(false)

  const openCase = useCallback((c) => setCaseModal({ open: true, data: c }), [])
  const openMakler = useCallback((m) => setMaklerModal({ open: true, data: m }), [])

  function handleOpenValidation(specificCases) {
    const cases = specificCases || Storage.getPendingValidationCases()
    if (cases.length === 0) { showToast('Keine Vorgänge zur Validierung', 'info'); return }
    setValidationModal({ open: true, cases })
  }

  function handleExportReady() {
    const ready = Storage.getExportReadyCases()
    if (ready.length === 0) { showToast('Keine Vorgänge zum Exportieren', 'info'); return }
    setExportModal(true)
  }

  async function handleImport(file) {
    try {
      const result = await importFromJSON(file)
      if (result.type === 'backup') {
        Storage.logImportExport('import', Storage.getCasesArray().length, 'Backup-Import')
        showToast('Backup erfolgreich importiert', 'success')
      } else if (result.type === 'outlook') {
        const processResult = processOutlookExport(result.data)
        let msg = `${processResult.processed} E-Mails verarbeitet`
        if (processResult.created > 0) msg += `, ${processResult.created} neue Vorgänge`
        if (processResult.matched > 0) msg += `, ${processResult.matched} zugeordnet`
        const importCount = processResult.created + processResult.matched
        if (importCount > 0) Storage.logImportExport('import', importCount, 'Outlook-Import')
        showToast(msg, importCount > 0 ? 'success' : 'info')
      }
      refresh()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  function handleDemoDownload() {
    const count = downloadDemoExportJSON()
    showToast(`Demo-JSON mit ${count} E-Mails heruntergeladen`, 'success')
  }

  function handleReset() {
    if (confirm('Alle Daten zurücksetzen und Demo-Daten neu laden?')) {
      Storage.clearAll()
      loadDemoData(true)
      showToast('Demo-Daten wurden neu geladen', 'success')
      refresh()
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0 && files[0].type === 'application/json') {
      handleImport(files[0])
    } else {
      showToast('Bitte nur JSON-Dateien importieren', 'warning')
    }
  }

  const maklerStats = Storage.getMaklerStats()
  const allEmails = Storage.getAllEmails()
  const counts = { vorgaenge: cases.length, makler: maklerStats.length, emails: allEmails.length }

  return (
    <div className="flex flex-col min-h-screen"
      style={{ backgroundColor: 'var(--bg-primary)' }}
      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={e => { if (e.target === e.currentTarget) setDragOver(false) }}
      onDrop={handleDrop}>

      {/* Drag overlay */}
      {dragOver && (
        <div className="fixed inset-0 z-[2000] bg-[#c41230]/10 border-4 border-dashed border-[#c41230] flex items-center justify-center"
          onDragLeave={() => setDragOver(false)}>
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-center animate-scale-in">
            <FolderOpen size={40} strokeWidth={1.5} className="mx-auto mb-3 text-[#c41230]" />
            <div className="text-lg font-semibold text-slate-800">JSON-Datei hier ablegen</div>
            <div className="text-sm text-slate-500 mt-1">Outlook-Export oder Backup importieren</div>
          </div>
        </div>
      )}

      <Header
        activeView={activeView}
        onViewChange={setActiveView}
        counts={counts}
        onImport={handleImport}
        onDemoDownload={handleDemoDownload}
        onReset={handleReset}
        onPraesentation={startePraesentation}
      />

      <main className="flex-1">
        {activeView === 'dashboard' && (
          <Dashboard onOpenCase={openCase} onOpenValidation={() => handleOpenValidation()} onExportReady={handleExportReady} />
        )}
        {activeView === 'vorgaenge' && <Vorgaenge onOpenCase={openCase} />}
        {activeView === 'makler' && <Makler onOpenMakler={openMakler} />}
        {activeView === 'emails' && <Emails onOpenCase={openCase} />}
        {activeView === 'ai-upload' && <AIUploadPage />}
        {activeView === 'pruefstrecke' && (
          <PruefstreckePage
            praesentationAngefordert={praesentationAngefordert}
            onPraesentationGestartet={() => setPraesentationAngefordert(false)}
          />
        )}
        {activeView === 'simulation' && <SimulationPage />}
        {activeView === 'vorlagen' && <VorlagenPage />}
        {['architektur', 'prozess', 'projektplan'].includes(activeView) && (
          <StaticPage pageId={activeView} />
        )}
      </main>

      {/* Modals */}
      <CaseModal
        isOpen={caseModal.open}
        onClose={() => setCaseModal({ open: false, data: null })}
        caseData={caseModal.data}
        onOpenValidation={(cases) => handleOpenValidation(cases)}
      />
      <MaklerModal
        isOpen={maklerModal.open}
        onClose={() => setMaklerModal({ open: false, data: null })}
        maklerData={maklerModal.data}
        onOpenCase={openCase}
      />
      <ExportModal isOpen={exportModal} onClose={() => setExportModal(false)} />
      <ValidationModal
        isOpen={validationModal.open}
        onClose={() => setValidationModal({ open: false, cases: [] })}
        casesToValidate={validationModal.cases}
      />
      <ToastContainer />
    </div>
  )
}

// Simplified outlook processing (matching is handled by storage)
function processOutlookExport(data) {
  const results = { processed: 0, created: 0, matched: 0, errors: 0, skipped: 0 }
  let emails = []

  if (data.conversations && Array.isArray(data.conversations)) {
    data.conversations.forEach(conv => {
      if (conv.emails) conv.emails.forEach(email => {
        email.conversationID = conv.conversationID || email.conversationID
        emails.push(fixEmailEncoding(email))
      })
    })
  } else if (data.emails) {
    emails = data.emails.map(e => fixEmailEncoding(e))
  }

  // Group by conversation
  const groups = {}
  emails.forEach(email => {
    const convId = email.conversationID || email.entryID
    if (!groups[convId]) groups[convId] = []
    groups[convId].push(email)
  })

  Object.values(groups).forEach(convEmails => {
    results.processed += convEmails.length
    if (convEmails.every(e => Storage.isMessageProcessed(e.entryID))) {
      results.skipped += convEmails.length
      return
    }

    // Create new case for each conversation
    const primary = convEmails[0]
    const newCase = {
      kunde: { name: '', confidence: 0, source: 'auto' },
      versicherungsnummer: { value: '', confidence: 0, source: 'auto' },
      makler: { name: '', email: primary.senderEmail || '' },
      status: 'unvollstaendig',
      sparte: '',
      messages: convEmails,
      messageIds: convEmails.map(m => m.entryID),
      conversationIds: primary.conversationID ? [primary.conversationID] : [],
      workflow: { mailReceived: new Date().toISOString(), mailUploaded: new Date().toISOString() },
      statusHistory: [{ date: new Date().toISOString(), from: null, to: 'unvollstaendig', note: 'Aus Import erstellt', isNew: true }]
    }
    Storage.saveCase(newCase)
    Storage.markMessagesProcessed(convEmails.map(e => e.entryID))
    results.created++
  })

  return results
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
