import { ArrowLeft, FileJson, RefreshCw } from 'lucide-react'

export default function Header({ onImport, onDemoDownload, onReset }) {
  return (
    <div className="bg-gradient-to-r from-[#8b1a2b] to-[#c41230] text-white shadow-md">
      <div className="px-6 py-3 flex items-center gap-4">
        <button
          onClick={() => window.location.href = '/'}
          className="flex items-center gap-1.5 text-sm bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-lg transition-colors"
        >
          <ArrowLeft size={16} /> Zurück
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-lg">📋</div>
          <div>
            <h1 className="text-lg font-bold">Bestandsübertragung</h1>
            <p className="text-xs text-white/70">Sales Operations | Portfolio Transfer Management</p>
          </div>
        </div>
      </div>
      <div className="bg-white px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-[#c41230] text-white text-xs font-bold px-3 py-1 rounded">ERGO</span>
          <span className="text-gray-800 font-semibold">Bestandsübertragung</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg cursor-pointer border border-gray-200 transition-colors">
            <FileJson size={14} /> JSON Import
            <input type="file" accept=".json" className="hidden" onChange={(e) => { if (e.target.files[0]) { onImport(e.target.files[0]); e.target.value = '' } }} />
          </label>
          <button onClick={onDemoDownload} className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 transition-colors">
            <FileJson size={14} /> Demo JSON
          </button>
          <button onClick={onReset} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Daten zurücksetzen">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
