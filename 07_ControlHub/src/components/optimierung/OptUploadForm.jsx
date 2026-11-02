import { useRef, useState } from 'react';
import {
  UploadCloud, X, Sparkles, ShieldCheck, ChevronRight,
  FileSpreadsheet, Database, Info, FileUp, BookMarked, BarChart3, Recycle,
} from 'lucide-react';
import { useOptimierung } from '../../hooks/useOptimierung';

const BEISPIEL_RCM = { name: 'Risiko-Kontroll-Matrix_Auszahlung_Bestand.xlsx', typ: 'RCM / Kontrollinventar', size: 68231 };
const BEISPIEL_PROZESS = { name: 'Arbeitsanweisung_Auszahlungsprozess.docx', typ: 'Arbeitsanweisung' };

// IKS-Vorgaben steuern, wie der Agent bewertet: Was gilt als Schluesselkontrolle,
// welche Risikotaxonomie liegt zugrunde, wie wird mit Teil-IKS umgegangen.
const VORGABEN_ARTEN = [
  { id: 'richtlinie',   label: 'b-IKS Richtlinie',            beispiel: 'b-IKS-Richtlinie_v4.pdf' },
  { id: 'taxonomie',    label: 'Risikotaxonomie',             beispiel: 'Risikotaxonomie_NFR_2026.xlsx' },
  { id: 'schluessel',   label: 'Definition Schlüsselkontrolle', beispiel: 'Definition_Schluesselkontrolle.docx' },
  { id: 'teiliks',      label: 'Umgang mit Teil-IKS',         beispiel: 'Rahmenwerk_Teil-IKS.pdf' },
];

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}


export default function OptUploadForm() {
  const { startProcessing } = useOptimierung();
  const rcmRef = useRef(null);
  const prozessRef = useRef(null);
  const vorgabenRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [rcm, setRcm] = useState(null);
  const [prozessDatei, setProzessDatei] = useState(null);
  const [vorgaben, setVorgaben] = useState([]);
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

  const onVorgaben = (files) => {
    const neu = Array.from(files || []).map(f => ({ name: f.name, art: 'IKS-Vorgabe' }));
    if (neu.length) setVorgaben(v => [...v, ...neu]);
  };
  const removeVorgabe = (i) => setVorgaben(v => v.filter((_, idx) => idx !== i));

  const loadBeispiel = () => {
    setRcm({ ...BEISPIEL_RCM });
    setProzessDatei({ ...BEISPIEL_PROZESS });
    setProzessName('Auszahlungsprozess (Bank)');
    setVorgaben(VORGABEN_ARTEN.map(v => ({ name: v.beispiel, art: v.label })));
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
      vorgaben,
    });
  };

  return (
    <div className="max-w-[1000px] mx-auto w-full space-y-5 animate-fade-in-up">
      {/* Intro / Hero */}
      <div className="card-base p-6 hero-dots relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-white" style={{ background: 'var(--mode-gradient, linear-gradient(135deg,#0F4D2A,#1D7B3F))' }}>
            <Database size={24} strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight">Bestehendes IKS einlesen</h1>
            </div>
            <p className="text-[13.5px] text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Laden Sie Ihr <span className="font-semibold">bestehendes</span> Risiko- und Kontrollinventar (RCM) hoch. Analyzer und
              Optimizer arbeiten anschliessend auf demselben Bestand: der <span className="font-semibold">Analyzer</span> nimmt ihn
              quantitativ auf — Abdeckung über Bereiche, Prozesse und Risiken, WhiteSpots und der Aufwand für Durchführung und
              Testing. Der <span className="font-semibold">Optimizer</span> zeigt darauf aufbauend, welche Kontrollen entfallen,
              automatisiert oder in einem niedrigeren Turnus geführt werden können.
            </p>
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              {['MaRisk', 'DORA', 'BAIT', 'GwG'].map(t => (
                <span key={t} className="chip"><ShieldCheck size={11} /> {t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Was auf dem Inventar aufsetzt */}
        <div className="mt-4 grid sm:grid-cols-2 gap-2.5">
          {[
            { icon: BarChart3, titel: 'Analyzer', text: 'Abdeckung, WhiteSpots und Aufwand für Durchführung und Testing' },
            { icon: Recycle, titel: 'Optimizer', text: 'Redundanzen, Automatisierungsgrad, Kontrolltypen und Turnus' },
          ].map(m => {
            const Icon = m.icon;
            return (
              <div key={m.titel} className="flex items-start gap-2.5 rounded-lg px-3 py-2.5 bg-white/70 border border-slate-200">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'color-mix(in srgb, var(--mode-primary, #0F4D2A) 12%, white)', color: 'var(--mode-primary, #0F4D2A)' }}>
                  <Icon size={16} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[12.5px] font-bold text-slate-800 leading-tight">{m.titel}</span>
                  <span className="block text-[11.5px] text-slate-500 leading-snug mt-0.5">{m.text}</span>
                </span>
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
                Risiko-Kontroll-Matrix (RCM), Kontrollkatalog oder IKS-Export — oder klicken, um eine Datei auszuwählen.
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
                <div className="text-[11.5px] text-slate-500 truncate">Kontrollinventar, Prozessdokument und alle vier IKS-Vorgaben vorbelegt</div>
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
          {/* IKS-Vorgaben — steuern die Bewertungsmassstaebe des Agents */}
          <div className="card-base p-4">
            <div className="text-[12px] font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <BookMarked size={13} className="text-slate-400" /> IKS-Vorgaben
              <span className="text-slate-400 font-normal">(optional)</span>
            </div>
            <p className="text-[11.5px] text-slate-500 mb-2.5 leading-snug">
              Ohne Vorgaben bewertet der Agent nach dem Marktstandard. Mit Ihren Vorgaben legt er Ihre eigenen Massstäbe zugrunde —
              was als Schlüsselkontrolle gilt, welche Risikotaxonomie greift und wie mit Teil-IKS umzugehen ist.
            </p>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {VORGABEN_ARTEN.map(v => <span key={v.id} className="chip">{v.label}</span>)}
            </div>
            {vorgaben.length > 0 && (
              <div className="space-y-1.5 mb-2.5">
                {vorgaben.map((v, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5">
                    <BookMarked size={13} className="shrink-0" style={{ color: 'var(--mode-primary, #0F4D2A)' }} />
                    <span className="flex-1 min-w-0">
                      <span className="block text-[12px] font-semibold truncate">{v.name}</span>
                      <span className="block text-[10.5px] text-slate-500 truncate">{v.art}</span>
                    </span>
                    <button onClick={() => removeVorgabe(i)} className="text-slate-400 hover:text-red-600 p-0.5 shrink-0" title="Entfernen">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => vorgabenRef.current?.click()}
                    className="w-full border-2 border-dashed rounded-xl p-3 text-center hover:bg-slate-50 transition-colors"
                    style={{ borderColor: '#CBD5E1' }}>
              <FileUp size={17} className="mx-auto mb-1 text-slate-400" />
              <div className="text-[12.5px] font-semibold text-slate-700">
                {vorgaben.length ? 'Weitere Vorgabe hinzufügen' : 'Vorgaben hochladen'}
              </div>
              <div className="text-[11px] text-slate-500">Mehrfachauswahl möglich</div>
            </button>
            <input ref={vorgabenRef} type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.txt" className="hidden"
                   onChange={(e) => onVorgaben(e.target.files)} />
          </div>

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
              <Database size={18} /> IKS einlesen und analysieren
            </button>
            <p className="text-[11px] text-slate-400 mt-2 text-center leading-snug">
              {canProcess
                ? 'Der Agent nimmt den Bestand auf; Analyzer und Optimizer greifen anschließend auf dasselbe Inventar zu.'
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
