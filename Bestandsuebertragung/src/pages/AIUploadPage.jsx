/**
 * KI Upload Seite – Claude API Token + Datei-Upload + KI-Analyse
 */
import { useState, useCallback, useRef } from 'react'
import { useApp } from '../context/AppContext'
import * as AI from '../utils/ai-processor'
import * as Storage from '../utils/storage'
import StatusBadge from '../components/StatusBadge'
import { Upload, Key, X, FileText, Mail, CheckCircle, AlertTriangle, Loader2, Save, Download, Trash2, Eye, EyeOff, ChevronDown, ChevronRight, Package } from 'lucide-react'
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
      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-700">Analyseergebnisse</h3>
          {results.map((result, ri) => (
            <div key={ri} className="card-base overflow-hidden">
              <div className={`px-4 py-3 flex items-center gap-2 ${result.success ? 'bg-emerald-50' : 'bg-red-50'}`}>
                {result.success ? <CheckCircle size={16} className="text-emerald-500" /> : <AlertTriangle size={16} className="text-red-500" />}
                <span className="text-base font-medium text-slate-700">{result.filename}</span>
                {result.analysis?.vorgaenge && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                    {result.analysis.vorgaenge.length} Vorgänge
                  </span>
                )}
              </div>

              {result.error && (
                <div className="px-4 py-3 text-sm text-red-600">{result.error}</div>
              )}

              {result.analysis?.zusammenfassung && (
                <div className="px-4 py-2 text-xs text-slate-500 border-b border-slate-100">{result.analysis.zusammenfassung}</div>
              )}

              {result.analysis?.vorgaenge?.map((v, vi) => (
                <div key={vi} className="px-4 py-3 border-b border-slate-100 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-base font-medium text-slate-800">{v.kunde || 'Unbekannt'}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      v.kategorie === 'erinnerung' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    }`}>{v.kategorie === 'erinnerung' ? 'Erinnerung' : 'Neu'}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div><span className="text-slate-400">VS-Nr:</span> <span className="text-slate-700 font-mono">{v.versicherungsnummer || '-'}</span></div>
                    <div><span className="text-slate-400">Sparte:</span> <span className="text-slate-700">{v.sparte || '-'}</span></div>
                    <div><span className="text-slate-400">Makler:</span> <span className="text-slate-700">{v.makler || '-'}</span></div>
                    <div><span className="text-slate-400">Gültig ab:</span> <span className="text-slate-700 font-mono">{v.gueltigkeitsdatum || '-'}</span></div>
                  </div>

                  {/* Maklervollmacht */}
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
              ))}
            </div>
          ))}
        </div>
      )}

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
