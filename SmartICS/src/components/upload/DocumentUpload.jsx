import { useRef, useState } from 'react';
import { Upload, FileText, Trash2, CheckCircle2, FileSpreadsheet, FileType2 } from 'lucide-react';
import { useSmartIcs } from '../../hooks/useSmartIcs';
import { DEMO_PROZESSE } from '../../data/risikoKatalog';

function iconForType(name) {
  const n = name.toLowerCase();
  if (n.endsWith('.xlsx') || n.endsWith('.xls') || n.endsWith('.csv')) return FileSpreadsheet;
  if (n.endsWith('.docx') || n.endsWith('.doc')) return FileType2;
  return FileText;
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

// Sehr einfache Heuristik: Dateinamen → Prozess-Bibliothek
function matchProzessFromFilename(name) {
  const n = name.toLowerCase();
  if (n.includes('kredit')) return DEMO_PROZESSE.find(p => p.id === 'kreditvergabe');
  if (n.includes('wertpapier') || n.includes('settle')) return DEMO_PROZESSE.find(p => p.id === 'wertpapierabwicklung');
  if (n.includes('zahlung') || n.includes('sepa') || n.includes('swift')) return DEMO_PROZESSE.find(p => p.id === 'zahlungsverkehr');
  if (n.includes('schaden') || n.includes('versicher')) return DEMO_PROZESSE.find(p => p.id === 'antragsmanagement');
  return null;
}

export default function DocumentUpload({ onProzessDetected, onSessionStart }) {
  const { uploadedDocs, addUploadedDoc, removeUploadedDoc, startSession } = useSmartIcs();
  const fileRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [detected, setDetected] = useState(null);

  const onFiles = (files) => {
    const list = Array.from(files);
    list.forEach(f => {
      addUploadedDoc({ id: `${f.name}-${Date.now()}`, name: f.name, size: f.size, type: f.type });
    });
    if (list.length > 0) {
      setAnalyzing(true);
      // Simuliere Agent 1 (Prozessanalyse)
      setTimeout(() => {
        const guess = matchProzessFromFilename(list[0].name) || DEMO_PROZESSE[0];
        setDetected(guess);
        if (onProzessDetected) onProzessDetected(guess);
        setAnalyzing(false);
      }, 900);
    }
  };

  const handleStart = () => {
    if (!detected) return;
    startSession(detected.id, uploadedDocs[uploadedDocs.length - 1] || null);
    if (onSessionStart) onSessionStart();
  };

  return (
    <div className="space-y-4">
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); onFiles(e.dataTransfer.files); }}
        className={`card-base p-8 text-center cursor-pointer border-2 border-dashed transition-colors ${dragging ? 'bg-emerald-50' : 'bg-white'}`}
        style={{ borderColor: dragging ? 'var(--mode-primary, #0F4D2A)' : '#CBD5E1' }}
      >
        <div className="w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-3" style={{ background: 'color-mix(in srgb, var(--mode-primary, #0F4D2A) 10%, white)', color: 'var(--mode-primary, #0F4D2A)' }}>
          <Upload size={24} strokeWidth={1.75} />
        </div>
        <div className="font-semibold text-slate-800">Eingangsdokumente hochladen</div>
        <div className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Ziehen Sie eine Arbeitsanweisung, Richtlinie oder Prozessbeschreibung hierher (Word, PDF, Excel) — oder klicken Sie, um eine Datei auszuwählen.
        </div>
        <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
          <span className="chip">.PDF</span>
          <span className="chip">.DOCX</span>
          <span className="chip">.XLSX</span>
          <span className="chip">.CSV</span>
        </div>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
          className="hidden"
          onChange={(e) => onFiles(e.target.files)}
        />
      </div>

      {uploadedDocs.length > 0 && (
        <div className="card-base">
          <div className="px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
            <div className="text-sm font-semibold">Hochgeladene Dokumente</div>
            <div className="text-[11px] text-slate-500">{uploadedDocs.length} Datei{uploadedDocs.length !== 1 && 'en'}</div>
          </div>
          <ul className="divide-y divide-slate-100">
            {uploadedDocs.map(d => {
              const Icon = iconForType(d.name);
              return (
                <li key={d.id} className="px-4 py-2.5 flex items-center gap-3">
                  <Icon size={18} className="text-slate-500" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{d.name}</div>
                    <div className="text-[11px] text-slate-500">{formatSize(d.size)}</div>
                  </div>
                  <button onClick={() => removeUploadedDoc(d.id)} className="text-slate-400 hover:text-red-600 transition-colors" title="Entfernen">
                    <Trash2 size={16} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {analyzing && (
        <div className="card-base p-4 flex items-center gap-3" style={{ background: 'color-mix(in srgb, var(--mode-primary, #0F4D2A) 4%, white)' }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--mode-primary, #0F4D2A)' }}>
            <span className="block w-3 h-3 rounded-full bg-white animate-pulse-soft"></span>
          </div>
          <div>
            <div className="text-sm font-semibold">Agent 1 läuft – Prozessanalyse</div>
            <div className="text-xs text-slate-500">Inhalte werden ausgelesen und relevante Prozessschritte identifiziert …</div>
          </div>
        </div>
      )}

      {detected && !analyzing && (
        <div className="card-base p-4 flex items-start gap-3" style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
          <CheckCircle2 size={22} className="text-emerald-700 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-emerald-900">
              Prozess erkannt: {detected.name}
            </div>
            <div className="text-xs text-emerald-800/80 mt-0.5">
              {detected.aktivitaeten.length} Aktivitäten identifiziert · Kategorie „{detected.kategorie}"
            </div>
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              {detected.aktivitaeten.slice(0, 6).map(a => (
                <span key={a.id} className="chip">{a.name}</span>
              ))}
              {detected.aktivitaeten.length > 6 && (
                <span className="chip">+{detected.aktivitaeten.length - 6} weitere</span>
              )}
            </div>
          </div>
          <button
            onClick={handleStart}
            className="px-3 py-1.5 rounded-lg text-white text-xs font-semibold transition-colors"
            style={{ background: 'var(--mode-primary, #0F4D2A)' }}
          >
            Workflow starten
          </button>
        </div>
      )}
    </div>
  );
}
