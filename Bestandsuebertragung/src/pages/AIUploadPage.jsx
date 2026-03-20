/**
 * KI Upload Seite – Claude API Token + Datei-Upload + KI-Analyse
 */
import { useState, useCallback, useRef } from 'react'
import { useApp } from '../context/AppContext'
import * as AI from '../utils/ai-processor'
import * as Storage from '../utils/storage'
import StatusBadge from '../components/StatusBadge'
import { Upload, Key, X, FileText, Mail, CheckCircle, AlertTriangle, Loader2, Save, Download, Trash2, Eye, EyeOff, ChevronDown, ChevronRight, Package, ArrowRight, ArrowDown, Clock, Link2, Layers, Inbox, XCircle, GitMerge, Paperclip } from 'lucide-react'
import { getFileCatalog, downloadFile as downloadDemoFile, generateFile } from '../utils/demo-files-gen'

const VALID_EXTENSIONS = ['.eml', '.msg', '.docx', '.xlsx', '.pdf']

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function getFileIcon(name) {
  const ext = name.split('.').pop().toLowerCase()
  if (['eml', 'msg'].includes(ext)) return Mail
  return FileText
}

export default function AIUploadPage() {
  const { showToast, refresh } = useApp()

  // API Key state
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [keyInput, setKeyInput] = useState('')
  const [showKey, setShowKey] = useState(false)
  const hasKey = AI.hasApiKey()
  const maskedKey = hasKey ? AI.getApiKey().substring(0, 10) + '...' : ''

  // File upload state
  const [files, setFiles] = useState([])
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  // Processing state
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(null)
  const [results, setResults] = useState([])

  // API Key functions
  function openKeyModal() {
    setKeyInput(hasKey ? AI.getApiKey() : '')
    setShowKeyModal(true)
  }

  function saveKey() {
    const key = keyInput.trim()
    if (!key) {
      AI.setApiKey('')
      showToast('API Key entfernt', 'info')
    } else if (key.startsWith('sk-')) {
      AI.setApiKey(key)
      showToast('API Key gespeichert', 'success')
    } else {
      showToast('Ungültiger API Key (muss mit sk- beginnen)', 'error')
      return
    }
    setShowKeyModal(false)
    setKeyInput('')
  }

  // File functions
  function addFiles(newFiles) {
    const valid = Array.from(newFiles).filter(f => {
      const ext = '.' + f.name.split('.').pop().toLowerCase()
      return VALID_EXTENSIONS.includes(ext)
    })
    const existing = new Set(files.map(f => f.name + f.size))
    const unique = valid.filter(f => !existing.has(f.name + f.size))
    if (unique.length < newFiles.length) showToast('Einige Dateien übersprungen (Duplikate oder ungültiges Format)', 'info')
    setFiles(prev => [...prev, ...unique])
  }

  function removeFile(idx) {
    setFiles(prev => prev.filter((_, i) => i !== idx))
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    addFiles(e.dataTransfer.files)
  }, [files])

  // Analysis
  async function startAnalysis() {
    if (files.length === 0 || !AI.hasApiKey()) return
    setProcessing(true)
    setResults([])

    try {
      const res = await AI.processBatch(files, setProgress)
      setResults(res)
      const successCount = res.filter(r => r.success && r.analysis).length
      const errorCount = res.filter(r => !r.success).length
      if (errorCount > 0) showToast(`${successCount} analysiert, ${errorCount} Fehler`, 'warning')
      else showToast(`${successCount} E-Mails erfolgreich analysiert`, 'success')
    } catch (err) {
      showToast('Analyse fehlgeschlagen: ' + err.message, 'error')
    } finally {
      setProcessing(false)
      setProgress(null)
    }
  }

  // Save results to storage
  function saveToStorage() {
    let count = 0
    for (const result of results) {
      if (!result.success || !result.analysis?.vorgaenge) continue
      for (const v of result.analysis.vorgaenge) {
        const statusMap = { 'angefragt': 'zu-validieren', 'bestaetigt': 'export-bereit', 'abgelehnt': 'abgelehnt' }
        Storage.saveCase({
          kunde: { name: v.kunde || '', confidence: 0.9, source: 'ai' },
          versicherungsnummer: { value: v.versicherungsnummer || '', confidence: 0.9, source: 'ai' },
          sparte: v.sparte || '',
          makler: { name: v.makler || '', email: v.maklerEmail || '' },
          status: statusMap[v.status] || 'zu-validieren',
          notes: [v.notizen, v.fehlende_infos?.length ? `Fehlend: ${v.fehlende_infos.join(', ')}` : null].filter(Boolean).join('\n'),
          workflow: { mailReceived: new Date().toISOString(), kiRecognized: new Date().toISOString() },
          statusHistory: [{ date: new Date().toISOString(), from: null, to: 'zu-validieren', note: 'Aus KI-Analyse erstellt' }],
          aiAnalysis: { maklervollmacht: v.maklervollmacht, sourceFile: result.filename }
        })
        count++
      }
    }
    if (count > 0) {
      Storage.logImportExport('import', count, 'KI-Upload')
      refresh()
      showToast(`${count} Vorgänge gespeichert`, 'success')
    }
  }

  function clearAll() {
    setFiles([])
    setResults([])
  }

  const totalVorgaenge = results.reduce((sum, r) => sum + (r.analysis?.vorgaenge?.length || 0), 0)

  return (
    <div className="p-6 space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--mode-pastel)' }}>
            <Upload size={24} style={{ color: 'var(--mode-primary-light)' }} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">KI Upload</h2>
            <p className="text-base text-slate-500">E-Mails (.eml, .msg) hochladen und automatisch analysieren</p>
          </div>
        </div>

        {/* API Key Button */}
        <button
          onClick={openKeyModal}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors border ${
            hasKey
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
          }`}
        >
          <Key size={16} />
          {hasKey ? 'API verbunden' : 'API Key eingeben'}
          {hasKey && <span className="text-xs text-emerald-500 font-mono">{maskedKey}</span>}
        </button>
      </div>

      {/* No API Key Warning */}
      {!hasKey && (
        <div className="card-base p-4 border-amber-200 bg-amber-50 flex items-start gap-3">
          <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <div className="text-base font-medium text-amber-800">Kein Claude API Key hinterlegt</div>
            <div className="text-sm text-amber-600 mt-1">
              Klicken Sie auf "API Key eingeben" und geben Sie Ihren Anthropic API Key ein (beginnt mit <code className="bg-amber-100 px-1 rounded">sk-ant-...</code>).
              Der Key wird nur lokal in Ihrem Browser gespeichert.
            </div>
          </div>
        </div>
      )}

      {/* Heutige Problematik */}
      <HeutigeProblematikSection showToast={showToast} />

      {/* Drop Zone */}
      <div
        className={`card-base p-8 text-center cursor-pointer transition-all ${
          dragOver ? 'ring-2 ring-[#c41230] bg-red-50' : 'hover:bg-slate-50'
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <Upload size={40} className="mx-auto text-slate-300 mb-3" />
        <div className="text-base text-slate-600 font-medium">Dateien hierher ziehen oder klicken</div>
        <div className="text-sm text-slate-400 mt-1">Unterstützt: .eml, .msg, .docx, .xlsx, .pdf</div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".eml,.msg,.docx,.xlsx,.pdf"
          multiple
          className="hidden"
          onChange={e => { addFiles(e.target.files); e.target.value = '' }}
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="card-base divide-y divide-slate-100">
          {files.map((file, i) => {
            const Icon = getFileIcon(file.name)
            return (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                <Icon size={16} className="text-slate-400 shrink-0" />
                <span className="text-base text-slate-700 truncate flex-1">{file.name}</span>
                <span className="text-sm text-slate-400 font-mono">{formatSize(file.size)}</span>
                <button onClick={() => removeFile(i)} className="p-1 text-slate-300 hover:text-red-500 transition-colors">
                  <X size={14} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Action Buttons */}
      {(files.length > 0 || results.length > 0) && (
        <div className="flex items-center gap-3">
          <button
            onClick={startAnalysis}
            disabled={!hasKey || files.length === 0 || processing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--mode-primary-light)' }}
          >
            {processing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {processing ? 'Analysiere...' : `${files.length} Datei${files.length > 1 ? 'en' : ''} analysieren`}
          </button>

          {totalVorgaenge > 0 && (
            <button onClick={saveToStorage} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
              <Save size={16} /> {totalVorgaenge} Vorgänge speichern
            </button>
          )}

          <button onClick={clearAll} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors ml-auto">
            <Trash2 size={16} /> Alles löschen
          </button>
        </div>
      )}

      {/* Progress */}
      {processing && progress && (
        <div className="card-base p-4">
          <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
            <span>{progress.filename}</span>
            <span className="font-mono">{progress.current}/{progress.total}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${(progress.current / progress.total) * 100}%`, backgroundColor: 'var(--mode-primary-light)' }} />
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && <AnalyseErgebnisse results={results} />}

      {/* Demo Files Section */}
      <DemoFilesSection
        onAddToUpload={(file) => {
          setFiles(prev => {
            const existing = new Set(prev.map(f => f.name + f.size))
            return existing.has(file.name + file.size) ? prev : [...prev, file]
          })
          showToast(`${file.name} zur Upload-Liste hinzugefügt`, 'success')
        }}
        showToast={showToast}
      />

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50" onClick={() => setShowKeyModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Claude API Key</h3>
              <button onClick={() => setShowKeyModal(false)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            <p className="text-sm text-slate-500 mb-4">
              Ihr Anthropic API Key wird nur lokal im Browser gespeichert und niemals an Dritte übertragen.
            </p>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={keyInput}
                onChange={e => setKeyInput(e.target.value)}
                placeholder="sk-ant-api03-..."
                className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm font-mono bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#c41230]/30"
                style={{ border: 'var(--card-border)' }}
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={saveKey}
                className="flex-1 px-4 py-2 rounded-lg text-sm text-white transition-colors"
                style={{ backgroundColor: 'var(--mode-primary-light)' }}
              >
                Speichern
              </button>
              {hasKey && (
                <button
                  onClick={() => { AI.setApiKey(''); setShowKeyModal(false); showToast('API Key entfernt', 'info') }}
                  className="px-4 py-2 rounded-lg text-sm text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
                >
                  Entfernen
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// Heutige Problematik Section
// ============================================================

const EXAMPLE_SCENARIOS = [
  {
    id: 'reminder',
    title: 'Erstanfrage + Erinnerung',
    description: '1 Vorgang, 2 E-Mails über Wochen verteilt',
    color: 'blue',
    emails: [
      { date: '13.01.2026', from: 'thomas.meier@meier-versicherungen.de', subject: 'Bestandsübertragung KFZ – Hans Müller, ERG-7823456', type: 'Erstanfrage', fileId: 'anfrage_text_mueller' },
      { date: '27.01.2026', from: 'thomas.meier@meier-versicherungen.de', subject: 'Erinnerung: Bestandsübertragung KFZ – Hans Müller', type: 'Erinnerung (14 Tage)', fileId: 'erinnerung_kfz_mueller' },
    ],
    realResult: '1 Vorgang: Müller, KFZ, ERG-7823456',
    wrongResult: '2 separate Vorgänge im Postkorb',
  },
  {
    id: 'supplement',
    title: 'Ergänzende Unterlagen',
    description: '1 Vorgang, Nachlieferung von Dokumenten',
    color: 'indigo',
    emails: [
      { date: '16.01.2026', from: 'lisa.wagner@wagner-makler.de', subject: 'BÜ Petra Schneider, ERG-5567891 – Vollmacht folgt', type: 'Erstanfrage', fileId: 'nachreichung_schneider' },
      { date: '17.01.2026', from: 'lisa.wagner@wagner-makler.de', subject: 'Re: Fehlende Maklervollmacht – Petra Schneider', type: 'Ergänzung (Vollmacht)', fileId: 'antwort_vollmacht_schneider' },
      { date: '20.01.2026', from: 'lisa.wagner@wagner-makler.de', subject: 'Nachtrag: Unterschriebener Antrag – Schneider', type: 'Ergänzung (Antrag)', fileId: 'nachreichung_antrag_schneider' },
    ],
    realResult: '1 Vorgang: Schneider, BU – mit allen Unterlagen',
    wrongResult: '3 separate Vorgänge im Postkorb',
  },
  {
    id: 'multi',
    title: 'Sammel-E-Mail',
    description: '1 E-Mail enthält mehrere Vorgänge',
    color: 'purple',
    emails: [
      { date: '12.03.2026', from: 'hendrik.falk@falk-makler.de', subject: 'Bestandsübertragungen März – 3 Kunden (Bauer, Klein, Wolf)', type: 'Sammelanfrage', fileId: 'sammel_bauer_klein_wolf' },
    ],
    realResult: '3 Vorgänge: Bauer (KFZ), Klein (Haftpflicht), Wolf (Unfall)',
    wrongResult: '1 Vorgang im Postkorb – 2 Kunden gehen unter',
  },
]

const COLOR_VARIANTS = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', light: 'bg-blue-100', dot: 'bg-blue-400' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', light: 'bg-indigo-100', dot: 'bg-indigo-400' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', light: 'bg-purple-100', dot: 'bg-purple-400' },
}

// ============================================================
// Analyse Ergebnisse (grouped by Vorgang)
// ============================================================

function buildGroupedResults(results) {
  // Collect all vorgaenge with their source file info
  const allEntries = []
  const errors = []

  for (const result of results) {
    if (!result.success) {
      errors.push(result)
      continue
    }
    if (!result.analysis?.vorgaenge) continue
    for (const v of result.analysis.vorgaenge) {
      allEntries.push({
        vorgang: v,
        filename: result.filename,
        zusammenfassung: result.analysis.zusammenfassung,
      })
    }
  }

  // Group by kunde + versicherungsnummer (normalized)
  const groups = []
  const groupMap = new Map()

  for (const entry of allEntries) {
    const kunde = (entry.vorgang.kunde || '').toLowerCase().trim()
    const vsNr = (entry.vorgang.versicherungsnummer || '').toLowerCase().trim()
    // Build key: if we have both kunde and vsNr, use both; otherwise just kunde
    const key = vsNr ? `${kunde}::${vsNr}` : `${kunde}::${entry.filename}::${Math.random()}`

    if (groupMap.has(key)) {
      groupMap.get(key).entries.push(entry)
    } else {
      const group = { key, entries: [entry] }
      groupMap.set(key, group)
      groups.push(group)
    }
  }

  return { groups, errors }
}

function VorgangDetails({ v }) {
  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
        <div><span className="text-slate-400">VS-Nr:</span> <span className="text-slate-700 font-mono">{v.versicherungsnummer || '-'}</span></div>
        <div><span className="text-slate-400">Sparte:</span> <span className="text-slate-700">{v.sparte || '-'}</span></div>
        <div><span className="text-slate-400">Makler:</span> <span className="text-slate-700">{v.makler || '-'}</span></div>
        <div><span className="text-slate-400">Gültig ab:</span> <span className="text-slate-700 font-mono">{v.gueltigkeitsdatum || '-'}</span></div>
      </div>
      {v.maklervollmacht && (
        <div className="mt-2 flex items-center gap-2 text-sm">
          <span className="text-slate-400">Vollmacht:</span>
          {v.maklervollmacht.als_anhang && v.maklervollmacht.unterschrieben ? (
            <span className="text-emerald-600 flex items-center gap-1"><CheckCircle size={12} /> Vorhanden, unterschrieben</span>
          ) : v.maklervollmacht.als_anhang ? (
            <span className="text-amber-600 flex items-center gap-1"><AlertTriangle size={12} /> Vorhanden, nicht unterschrieben</span>
          ) : v.maklervollmacht.nur_erwaehnt ? (
            <span className="text-amber-600">Nur erwähnt</span>
          ) : (
            <span className="text-red-600">Fehlt</span>
          )}
        </div>
      )}
      {v.fehlende_infos?.length > 0 && (
        <div className="mt-1 text-sm text-amber-600">Fehlend: {v.fehlende_infos.join(', ')}</div>
      )}
    </div>
  )
}

function AnalyseErgebnisse({ results }) {
  const { groups, errors } = buildGroupedResults(results)
  const totalVorgaenge = groups.length

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-semibold text-slate-700">Analyseergebnisse</h3>
        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          {totalVorgaenge} {totalVorgaenge === 1 ? 'Vorgang' : 'Vorgänge'} erkannt
        </span>
        {groups.some(g => g.entries.length > 1) && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
            <GitMerge size={12} /> Zusammengehörige E-Mails erkannt
          </span>
        )}
      </div>

      {/* Error results */}
      {errors.map((result, i) => (
        <div key={`err-${i}`} className="card-base overflow-hidden">
          <div className="px-4 py-3 flex items-center gap-2 bg-red-50">
            <AlertTriangle size={16} className="text-red-500" />
            <span className="text-base font-medium text-slate-700">{result.filename}</span>
          </div>
          <div className="px-4 py-3 text-sm text-red-600">{result.error}</div>
        </div>
      ))}

      {/* Grouped Vorgänge */}
      {groups.map((group, gi) => {
        const isGrouped = group.entries.length > 1
        const primaryV = group.entries[0].vorgang

        if (!isGrouped) {
          // Single entry — render as simple card
          const entry = group.entries[0]
          return (
            <div key={gi} className="card-base overflow-hidden">
              <div className="px-4 py-3 flex items-center gap-2 bg-emerald-50">
                <CheckCircle size={16} className="text-emerald-500" />
                <span className="text-base font-medium text-slate-800">{primaryV.kunde || 'Unbekannt'}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  primaryV.kategorie === 'erinnerung' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                }`}>{primaryV.kategorie === 'erinnerung' ? 'Erinnerung' : 'Neu'}</span>
                <span className="ml-auto text-xs text-slate-400">{entry.filename}</span>
              </div>
              {entry.zusammenfassung && (
                <div className="px-4 py-2 text-xs text-slate-500 border-b border-slate-100">{entry.zusammenfassung}</div>
              )}
              <div className="px-4 py-3">
                <VorgangDetails v={primaryV} />
              </div>
            </div>
          )
        }

        // Grouped entries — multiple emails for the same Vorgang
        return (
          <div key={gi} className="card-base overflow-hidden border-2 border-blue-200">
            {/* Group header */}
            <div className="px-4 py-3 flex items-center gap-2 bg-blue-50">
              <GitMerge size={16} className="text-blue-600" />
              <span className="text-base font-bold text-slate-800">{primaryV.kunde || 'Unbekannt'}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                {group.entries.length} E-Mails zusammengeführt
              </span>
              <span className="text-xs text-slate-500 font-mono ml-auto">{primaryV.versicherungsnummer || ''}</span>
            </div>

            {/* Merged Vorgang summary */}
            <div className="px-4 py-3 border-b border-blue-100 bg-blue-50/30">
              <VorgangDetails v={primaryV} />
            </div>

            {/* Individual email sub-cards */}
            <div className="px-4 py-3 space-y-2">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Zusammengeführte E-Mails</div>
              {group.entries.map((entry, ei) => (
                <div key={ei} className="rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
                  <div className="px-3 py-2 flex items-center gap-2">
                    <Mail size={14} className="text-slate-400 shrink-0" />
                    <span className="text-sm font-medium text-slate-700 truncate flex-1">{entry.filename}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      entry.vorgang.kategorie === 'erinnerung' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    }`}>{entry.vorgang.kategorie === 'erinnerung' ? 'Erinnerung' : 'Erstanfrage'}</span>
                  </div>
                  {entry.zusammenfassung && (
                    <div className="px-3 pb-2 text-xs text-slate-500">{entry.zusammenfassung}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function parseEmlRaw(raw) {
  const splitIdx = raw.search(/\r?\n\r?\n/)
  const headerBlock = splitIdx >= 0 ? raw.substring(0, splitIdx) : raw
  const bodyBlock = splitIdx >= 0 ? raw.substring(splitIdx).replace(/^[\r\n]+/, '') : ''

  const headers = {}
  let currentKey = ''
  for (const line of headerBlock.replace(/\r\n/g, '\n').split('\n')) {
    if (/^\s/.test(line) && currentKey) headers[currentKey] += ' ' + line.trim()
    else {
      const m = line.match(/^([A-Za-z-]+):\s*(.*)/)
      if (m) { currentKey = m[1].toLowerCase(); headers[currentKey] = m[2].trim() }
    }
  }

  // Decode RFC 2047 encoded subject
  const decodeRfc = (s) => {
    if (!s) return ''
    return s.replace(/=\?([^?]+)\?([BQ])\?([^?]+)\?=/gi, (_, charset, enc, text) => {
      try {
        if (enc.toUpperCase() === 'B') return new TextDecoder(charset).decode(Uint8Array.from(atob(text), c => c.charCodeAt(0)))
        return decodeURIComponent(text.replace(/=([0-9A-Fa-f]{2})/g, '%$1').replace(/_/g, ' '))
      } catch { return text }
    })
  }

  // Decode quoted-printable body
  const decodeQP = (s) => {
    const decoded = s.replace(/=\r?\n/g, '').replace(/=([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    try { return new TextDecoder('utf-8').decode(Uint8Array.from(decoded, c => c.charCodeAt(0))) } catch { return decoded }
  }

  const subject = decodeRfc(headers['subject'] || '')
  const from = decodeRfc(headers['from'] || '')
  const to = decodeRfc(headers['to'] || '')
  const date = headers['date'] || ''
  const contentType = headers['content-type'] || ''
  const boundaryMatch = contentType.match(/boundary="?([^";\s]+)"?/i)

  let body = ''
  const attachments = []

  if (boundaryMatch) {
    const parts = bodyBlock.split('--' + boundaryMatch[1])
    for (let i = 1; i < parts.length; i++) {
      if (parts[i].startsWith('--')) break
      const part = parts[i].replace(/^[\r\n]+/, '')
      const pSplit = part.search(/\r?\n\r?\n/)
      const pHeaders = pSplit >= 0 ? part.substring(0, pSplit).toLowerCase() : ''
      const pBody = pSplit >= 0 ? part.substring(pSplit).replace(/^[\r\n]+/, '') : part

      if (pHeaders.includes('content-disposition: attachment') || pHeaders.includes('application/')) {
        const fnMatch = part.substring(0, pSplit).match(/filename="?([^";\r\n]+)"?/i)
        if (fnMatch) attachments.push(fnMatch[1].trim())
      } else if (pHeaders.includes('text/plain') && !body) {
        body = pHeaders.includes('quoted-printable') ? decodeQP(pBody) : pBody
      }
    }
  } else {
    const encoding = (headers['content-transfer-encoding'] || '').toLowerCase()
    body = encoding.includes('quoted-printable') ? decodeQP(bodyBlock) : bodyBlock
  }

  return { subject, from, to, date, body: body.trim(), attachments }
}

function EmailPreviewModal({ fileId, onClose, onDownload }) {
  const email = (() => {
    if (!fileId) return null
    const result = generateFile(fileId)
    if (!result) return null
    const raw = new TextDecoder('utf-8').decode(result.data)
    return { ...parseEmlRaw(raw), filename: result.filename }
  })()

  if (!email) return null

  // Format date nicely
  let dateFormatted = email.date
  try {
    const d = new Date(email.date)
    if (!isNaN(d)) dateFormatted = d.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch {}

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-scale-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Mail size={20} style={{ color: 'var(--mode-primary-light)' }} />
            <span className="font-semibold text-base text-slate-800">E-Mail Vorschau</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Email metadata */}
        <div className="px-6 py-4 border-b border-slate-100 space-y-2 bg-slate-50">
          <div className="text-lg font-semibold text-slate-800">{email.subject}</div>
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
            <span className="text-slate-400 font-medium">Von:</span>
            <span className="text-slate-700">{email.from}</span>
            <span className="text-slate-400 font-medium">An:</span>
            <span className="text-slate-700">{email.to}</span>
            <span className="text-slate-400 font-medium">Datum:</span>
            <span className="text-slate-700">{dateFormatted}</span>
          </div>
          {email.attachments.length > 0 && (
            <div className="flex items-center gap-2 pt-1">
              <Paperclip size={14} className="text-slate-400" />
              <div className="flex flex-wrap gap-1">
                {email.attachments.map((att, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                    {att}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Email body */}
        <div className="flex-1 overflow-auto px-6 py-4">
          <pre className="text-sm text-slate-700 whitespace-pre-wrap font-[inherit] leading-relaxed">{email.body}</pre>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={() => onDownload(fileId)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-white transition-colors"
          >
            <Download size={14} /> Herunterladen (.eml)
          </button>
          <span className="ml-auto text-xs text-slate-400 font-mono">{email.filename}</span>
        </div>
      </div>
    </div>
  )
}

function HeutigeProblematikSection({ showToast }) {
  const [expanded, setExpanded] = useState(true)
  const [previewFileId, setPreviewFileId] = useState(null)

  function handleDownload(fileId) {
    downloadDemoFile(fileId)
    showToast('Demo-Datei heruntergeladen', 'success')
  }

  return (
    <div className="card-base overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <div className="text-left">
            <div className="text-base font-semibold text-slate-800">Heutige Problematik: E-Mail-Zuordnung im Postkorb</div>
            <div className="text-sm text-slate-500">Warum einzelne E-Mails als Vorgänge nicht funktionieren</div>
          </div>
        </div>
        {expanded ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
      </button>

      {/* Email Preview Modal */}
      {previewFileId && (
        <EmailPreviewModal
          fileId={previewFileId}
          onClose={() => setPreviewFileId(null)}
          onDownload={handleDownload}
        />
      )}

      {expanded && (
        <div className="border-t border-slate-100 px-6 py-5 space-y-6">
          {/* Intro */}
          <p className="text-base text-slate-600">
            E-Mails zu Bestandsübertragungen stehen in Beziehung zueinander. Im realen Posteingang sieht das so aus:
          </p>

          {/* Scenario Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {EXAMPLE_SCENARIOS.map(scenario => {
              const c = COLOR_VARIANTS[scenario.color]
              return (
                <div key={scenario.id} className={`rounded-xl border ${c.border} overflow-hidden`}>
                  {/* Scenario Header */}
                  <div className={`${c.bg} px-4 py-3`}>
                    <div className={`font-semibold text-base ${c.text}`}>{scenario.title}</div>
                    <div className="text-sm text-slate-500">{scenario.description}</div>
                  </div>

                  {/* Email Timeline */}
                  <div className="px-4 py-3 space-y-0">
                    {scenario.emails.map((email, i) => (
                      <div key={i} className="flex gap-3">
                        {/* Timeline line */}
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${c.dot} shrink-0 mt-1.5`} />
                          {i < scenario.emails.length - 1 && (
                            <div className="w-0.5 flex-1 bg-slate-200 my-1" />
                          )}
                        </div>
                        {/* Email content */}
                        <div className="pb-3 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-slate-400">{email.date}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${c.light} ${c.text}`}>{email.type}</span>
                          </div>
                          <div className="text-sm text-slate-600 mt-0.5 truncate" title={email.from}>{email.from}</div>
                          <div className="text-sm font-medium text-slate-800 truncate" title={email.subject}>{email.subject}</div>
                          {email.fileId && (
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <button
                                onClick={(e) => { e.stopPropagation(); setPreviewFileId(email.fileId) }}
                                className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                                title="E-Mail anschauen"
                              >
                                <Eye size={11} /> Anschauen
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDownload(email.fileId) }}
                                className="flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
                                title="Herunterladen"
                              >
                                <Download size={11} /> .eml
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Correct vs Wrong */}
                  <div className="border-t border-slate-100 px-4 py-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <GitMerge size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-semibold text-emerald-700">KI-Erkennung (richtig)</div>
                        <div className="text-sm text-slate-700">{scenario.realResult}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-semibold text-red-600">Manuell / Postkorb (Problem)</div>
                        <div className="text-sm text-slate-700">{scenario.wrongResult}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Problem Summary */}
          <div className="rounded-xl border-2 border-red-200 bg-red-50 p-5">
            <div className="flex items-start gap-3">
              <Inbox size={24} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-base text-red-800 mb-2">Das Problem: Jede E-Mail = 1 Vorgang im Postkorb</h4>
                <div className="space-y-2 text-sm text-red-900/80">
                  <p>
                    Wenn jede eingehende E-Mail automatisch als eigener Vorgang im Postkorb eröffnet wird, entstehen massive Probleme:
                  </p>
                  <ul className="space-y-1.5 ml-1">
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">1.</span>
                      <span><strong>Duplikate:</strong> Erinnerungsmails erzeugen Doppel-Vorgänge — der Sachbearbeiter sieht denselben Kunden mehrfach und muss manuell zusammenführen.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">2.</span>
                      <span><strong>Verstreute Unterlagen:</strong> Nachgelieferte Vollmachten oder Anträge landen als separate Vorgänge — der Zusammenhang zum Ursprungsantrag geht verloren.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">3.</span>
                      <span><strong>Verlorene Vorgänge:</strong> Sammel-E-Mails mit mehreren Kunden werden als ein Vorgang behandelt — nur der erste Kunde wird bearbeitet, die restlichen gehen unter.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">4.</span>
                      <span><strong>Manueller Aufwand:</strong> Sachbearbeiter müssen jeden einzelnen Vorgang manuell prüfen, zuordnen und zusammenführen — bei hohem Volumen nicht leistbar.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Solution Hint */}
          <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-start gap-3">
              <GitMerge size={24} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-base text-emerald-800 mb-1">Die Lösung: KI-gestützte Analyse</h4>
                <p className="text-sm text-emerald-900/80">
                  Die KI erkennt automatisch Zusammenhänge zwischen E-Mails (Kunde, VS-Nr, Makler), fasst zusammengehörige Nachrichten zu einem Vorgang zusammen,
                  trennt Sammel-E-Mails in einzelne Vorgänge auf und ordnet Nachlieferungen dem richtigen Vorgang zu.
                  Laden Sie E-Mails oben hoch, um die KI-Analyse in Aktion zu sehen.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// Demo Files Section
// ============================================================

const CATEGORY_LABELS = {
  'email-simple': { label: 'Einfache E-Mails', color: 'text-blue-600', bg: 'bg-blue-50' },
  'email-word': { label: 'E-Mails mit Word-Anhang', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  'email-excel': { label: 'E-Mails mit Excel-Anhang', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  'email-complex': { label: 'Komplexe E-Mails (mehrere Anhänge)', color: 'text-purple-600', bg: 'bg-purple-50' },
  'email-edge': { label: 'Edge-Cases (fehlende Daten)', color: 'text-amber-600', bg: 'bg-amber-50' },
  'template': { label: 'Vorlagen (DOCX/XLSX)', color: 'text-slate-600', bg: 'bg-slate-50' },
}

function DemoFilesSection({ onAddToUpload, showToast }) {
  const [expanded, setExpanded] = useState(false)
  const [expandedCats, setExpandedCats] = useState({})
  const catalog = getFileCatalog()

  // Group by category
  const grouped = {}
  for (const file of catalog) {
    if (!grouped[file.category]) grouped[file.category] = []
    grouped[file.category].push(file)
  }

  function handleDownload(fileId) {
    downloadDemoFile(fileId)
    showToast('Demo-Datei heruntergeladen', 'success')
  }

  function handleAddToUpload(fileId, filename) {
    const result = generateFile(fileId)
    if (!result) return
    const blob = new Blob([result.data], { type: result.mimeType })
    const file = new File([blob], result.filename, { type: result.mimeType })
    onAddToUpload(file)
  }

  function toggleCat(cat) {
    setExpandedCats(prev => ({ ...prev, [cat]: !prev[cat] }))
  }

  return (
    <div className="card-base overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Package size={20} style={{ color: 'var(--mode-primary-light)' }} />
          <div className="text-left">
            <div className="text-base font-semibold text-slate-800">Demo-Dateien zum Testen</div>
            <div className="text-sm text-slate-500">{catalog.length} realistische Vorgänge (EML mit DOCX/XLSX-Anhängen) — herunterladen oder direkt in Upload laden</div>
          </div>
        </div>
        {expanded ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
      </button>

      {expanded && (
        <div className="border-t border-slate-100">
          {Object.entries(grouped).map(([cat, files]) => {
            const catInfo = CATEGORY_LABELS[cat] || { label: cat, color: 'text-slate-600', bg: 'bg-slate-50' }
            const isOpen = expandedCats[cat] !== false // default open
            return (
              <div key={cat}>
                <button
                  onClick={() => toggleCat(cat)}
                  className={`w-full flex items-center gap-2 px-5 py-2.5 text-xs font-semibold ${catInfo.color} ${catInfo.bg} border-b border-slate-100`}
                >
                  {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  {catInfo.label}
                  <span className="text-slate-400 font-normal">({files.length})</span>
                </button>
                {isOpen && (
                  <div className="divide-y divide-slate-50">
                    {files.map(file => (
                      <div key={file.id} className="flex items-center gap-3 px-5 py-2.5 hover:bg-slate-50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="text-base text-slate-700 font-medium truncate">{file.title}</div>
                          <div className="text-sm text-slate-400 truncate">{file.description}</div>
                          <div className="flex items-center gap-1 mt-1">
                            {file.tags.map(tag => (
                              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">{tag}</span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {file.filename.endsWith('.eml') && (
                            <button
                              onClick={() => handleAddToUpload(file.id, file.filename)}
                              className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg text-white transition-colors"
                              style={{ backgroundColor: 'var(--mode-primary-light)' }}
                              title="Direkt in Upload-Liste laden"
                            >
                              <Upload size={12} /> Upload
                            </button>
                          )}
                          <button
                            onClick={() => handleDownload(file.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                            title="Herunterladen"
                          >
                            <Download size={12} /> .{file.filename.split('.').pop()}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
