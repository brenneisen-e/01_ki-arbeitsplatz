import { useRef, useState } from 'react';
import {
  UploadCloud, X, Sparkles, ShieldCheck, ChevronRight,
  FileSpreadsheet, Recycle, Info, FileUp, CopyX, Merge, Cpu, Minimize2,
} from 'lucide-react';
import { useOptimierung } from '../../hooks/useOptimierung';

const BEISPIEL_RCM = { name: 'Risiko-Kontroll-Matrix_Auszahlung_Bestand.xlsx', typ: 'RCM / Kontrollinventar', size: 68231 };
const BEISPIEL_PROZESS = { name: 'Arbeitsanweisung_Auszahlungsprozess.docx', typ: 'Arbeitsanweisung' };

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const HEBEL = [
  { icon: CopyX, color: '#DC2626', label: 'Duplikate entfernen' },
  { icon: Merge, color: '#7C3AED', label: 'Kontrollen zusammenführen' },
  { icon: Minimize2, color: '#D97706', label: 'Kontrolldichte reduzieren' },
  { icon: Cpu, color: '#2563EB', label: 'Manuelles automatisieren' },
];

export default function OptUploadForm() {
  const { startProcessing } = useOptimierung();
  const rcmRef = useRef(null);
  const prozessRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [rcm, setRcm] = useState(null);
  const [prozessDatei, setProzessDatei] = useState(null);
  const [prozessName, setProzessName] = useState('');
  const [weitereInfos, setWeitereInfos] = useState('');

  const onRcm = (files) => {
    const f = Array.from(files || [])[0];
    if (!f) return;
    setRcm({ name: f.name, size: f.size || 0, typ: 'RCM / Kontrollinventar' });
    if (!prozessName) setProzessName('Auszahlungsprozess (Bank)');
  };
  const onProzess = (files) => {
    const f = Array.from(files || [])[0];
    if (!f) return;
    setProzessDatei({ name: f.name, typ: 'Arbeitsanweisung' });
  };

  const loadBeispiel = () => {
    setRcm({ ...BEISPIEL_RCM });
    setProzessDatei({ ...BEISPIEL_PROZESS });
    setProzessName('Auszahlungsprozess (Bank)');
  };

  const clearRcm = () => { setRcm(null); if (rcmRef.current) rcmRef.current.value = ''; };
  const clearProzess = () => { setProzessDatei(null); if (prozessRef.current) prozessRef.current.value = ''; };

  const canProcess = !!rcm;

  const handleProcess = () => {
    if (!rcm) return;
    startProcessing({
      prozessName: prozessName || rcm.name,
      weitereInfos,
      quelldokument: rcm,
      prozessDokument: prozessDatei || null,
    });
  };

  return (
    <div className="max-w-[1000px] mx-auto w-full space-y-5 animate-fade-in-up">
      {/* Intro / Hero */}
      <div className="card-base p-6 hero-dots relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-white" style={{ background: 'var(--mode-gradient, linear-gradient(135deg,#0F4D2A,#1D7B3F))' }}>
            <Recycle size={24} strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight">b-IKS Optimierung — Bestandsinventar verschlanken</h1>
              <span style={{ background: '#EDE9FE', color: '#5B21B6', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5, letterSpacing: 0.4, textTransform: 'uppercase' }}>Showcase</span>
            </div>
            <p className="text-[13.5px] text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Laden Sie ein <span className="font-semibold">bestehendes</span> Risiko- und Kontrollinventar (RCM) hoch.
              Der Agent gleicht die Kontrollen semantisch ab und zeigt, wo sich <span className="font-semibold">Duplikate entfernen</span>,
              Kontrollen <span className="font-semibold">zusammenführen</span> oder <span className="font-semibold">reduzieren</span> und
              wo sich <span className="font-semibold">manuelle Kontrollen automatisieren</span> lassen —
              als Vorher/Nachher, mit gleichbleibender Risikoabdeckung und Kollaboration.
            </p>
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              {['MaRisk', 'DORA', 'BAIT', 'GwG'].map(t => (
                <span key={t} className="chip"><ShieldCheck size={11} /> {t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Optimierungshebel */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {HEBEL.map(h => {
            const Icon = h.icon;
            return (
              <div key={h.label} className="flex items-center gap-2 rounded-lg px-2.5 py-2 bg-white/70 border border-slate-200">
                <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `color-mix(in srgb, ${h.color} 12%, white)`, color: h.color }}>
                  <Icon size={15} />
                </span>
                <span className="text-[11.5px] font-semibold text-slate-700 leading-tight">{h.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
        {/* Linke Spalte */}
        <div className="space-y-4">
          {/* Dropzone RCM */}
          {!rcm ? (
            <div
              onClick={() => rcmRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); onRcm(e.dataTransfer.files); }}
              className="card-base p-9 text-center cursor-pointer border-2 border-dashed transition-all"
              style={{ borderColor: dragging ? 'var(--mode-primary, #0F4D2A)' : '#CBD5E1', background: dragging ? 'color-mix(in srgb, var(--mode-primary, #0F4D2A) 5%, white)' : 'white' }}
            >
              <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-3" style={{ background: 'color-mix(in srgb, var(--mode-primary, #0F4D2A) 10%, white)', color: 'var(--mode-primary, #0F4D2A)' }}>
                <UploadCloud size={30} strokeWidth={1.6} />
              </div>
              <div className="font-semibold text-slate-800 text-[15px]">Bestehendes Kontrollinventar hierher ziehen</div>
              <div className="text-[12.5px] text-slate-500 mt-1 max-w-sm mx-auto">
                Risiko-Kontroll-Matrix (RCM), Kontrollkatalog oder b-IKS-Export — oder klicken, um eine Datei auszuwählen.
              </div>
              <div className="mt-3.5 flex items-center justify-center gap-2 flex-wrap">
                <span className="chip">.XLSX</span>
                <span className="chip">.CSV</span>
                <span className="chip">.PDF</span>
                <span className="chip">.DOCX</span>
              </div>
              <input ref={rcmRef} type="file" accept=".xlsx,.xls,.csv,.pdf,.docx,.doc,.txt" className="hidden" onChange={(e) => onRcm(e.target.files)} />
            </div>
          ) : (
            <div className="card-base p-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'color-mix(in srgb, var(--mode-primary, #0F4D2A) 12%, white)', color: 'var(--mode-primary, #0F4D2A)' }}>
                  <FileSpreadsheet size={22} strokeWidth={1.6} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold truncate">{rcm.name}</div>
                  <div className="text-[11.5px] text-slate-500 flex items-center gap-2 flex-wrap">
                    <span className="chip" style={{ padding: '0.05rem 0.4rem' }}>{rcm.typ}</span>
                    {rcm.size ? <span>{formatSize(rcm.size)}</span> : null}
                    <span className="inline-flex items-center gap-1 text-emerald-700"><Info size={11} /> bereit zur Optimierung</span>
                  </div>
                </div>
                <button onClick={clearRcm} className="text-slate-400 hover:text-red-600 transition-colors p-1" title="Entfernen"><X size={18} /></button>
              </div>
            </div>
          )}

          {/* Beispiel-Shortcut */}
          {!rcm && (
            <button
              onClick={loadBeispiel}
              className="w-full card-base p-3.5 flex items-center gap-3 text-left hover:shadow-md transition-shadow group"
              style={{ background: 'color-mix(in srgb, var(--mode-primary, #0F4D2A) 4%, white)' }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--mode-gradient, linear-gradient(135deg,#0F4D2A,#1D7B3F))', color: 'white' }}>
                <Sparkles size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-semibold flex items-center gap-2">
                  Beispiel-Bestandsinventar verwenden
                  <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 4, letterSpacing: 0.4, textTransform: 'uppercase' }}>Demo</span>
                </div>
                <div className="text-[11.5px] text-slate-500 truncate">14 Kontrollen · Auszahlungsprozess (Bank) — mit Redundanzen und manuellen Kontrollen</div>
              </div>
              <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}

          {/* Felder */}
          <div className="card-base p-4 space-y-3.5">
            <label className="block">
              <span className="block text-[12px] font-semibold text-slate-700 mb-1">Prozess / Geltungsbereich des Inventars</span>
              <input
                value={prozessName}
                onChange={(e) => setProzessName(e.target.value)}
                placeholder="z. B. Auszahlungsprozess (Bank)"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-[13.5px] focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
            <label className="block">
              <span className="block text-[12px] font-semibold text-slate-700 mb-1">Weitere Informationen / Vorgaben <span className="text-slate-400 font-normal">(optional)</span></span>
              <textarea
                value={weitereInfos}
                onChange={(e) => setWeitereInfos(e.target.value)}
                rows={2}
                placeholder="z. B. Prüfungsfeststellungen, Automatisierungsstrategie, Kontrollen die nicht angetastet werden dürfen …"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-[13.5px] resize-none focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
          </div>
        </div>

        {/* Rechte Spalte */}
        <div className="space-y-4">
          <div className="card-base p-4">
            <div className="text-[12px] font-semibold text-slate-700 mb-1">Prozessdokument als Kontext <span className="text-slate-400 font-normal">(optional)</span></div>
            <p className="text-[11.5px] text-slate-500 mb-2.5 leading-snug">
              Liegt die zugehörige Arbeitsanweisung vor, prüft der Agent die Kontrollen zusätzlich gegen den tatsächlichen
              Prozessablauf — so werden Abdeckungslücken und überflüssige Kontrollen präziser erkannt.
            </p>
            {!prozessDatei ? (
              <button onClick={() => prozessRef.current?.click()} className="w-full border-2 border-dashed rounded-xl p-3.5 text-center hover:bg-slate-50 transition-colors" style={{ borderColor: '#CBD5E1' }}>
                <FileUp size={18} className="mx-auto mb-1 text-slate-400" />
                <div className="text-[12.5px] font-semibold text-slate-700">Prozessdokument hochladen</div>
                <div className="text-[11px] text-slate-500">Arbeitsanweisung / Richtlinie / BPMN</div>
              </button>
            ) : (
              <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 p-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'color-mix(in srgb, var(--mode-primary, #0F4D2A) 12%, white)', color: 'var(--mode-primary, #0F4D2A)' }}>
                  <FileUp size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-semibold truncate">{prozessDatei.name}</div>
                  <span className="chip" style={{ padding: '0.02rem 0.4rem' }}>{prozessDatei.typ}</span>
                </div>
                <button onClick={clearProzess} className="text-slate-400 hover:text-red-600 p-1" title="Entfernen"><X size={16} /></button>
              </div>
            )}
            <input ref={prozessRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.bpmn,.xml,.txt" className="hidden" onChange={(e) => onProzess(e.target.files)} />
          </div>

          <div className="card-base p-4">
            <button
              onClick={handleProcess}
              disabled={!canProcess}
              className="w-full px-4 py-3 rounded-xl text-white text-[14.5px] font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-45 disabled:cursor-not-allowed transition-all hover:brightness-110"
              style={{ background: 'var(--mode-gradient, linear-gradient(135deg,#0F4D2A,#1D7B3F))' }}
            >
              <Recycle size={18} /> Bestand optimieren
            </button>
            <p className="text-[11px] text-slate-400 mt-2 text-center leading-snug">
              {canProcess
                ? 'Der Agent analysiert die Kontrollen und schlägt Merges, Duplikate, Reduktionen und Automatisierungen vor.'
                : 'Laden Sie zunächst ein Kontrollinventar hoch oder starten Sie mit dem Beispiel.'}
            </p>
          </div>

          <div className="text-[11px] text-slate-400 leading-relaxed px-1">
            Showcase · synthetische Daten. Es werden keine echten Dokumente an externe Dienste übertragen.
          </div>
        </div>
      </div>
    </div>
  );
}
