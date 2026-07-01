import { useRef, useState } from 'react';
import {
  UploadCloud, X, Sparkles, ShieldCheck, ChevronRight,
  FileType2, Wand2, Info, FileUp,
} from 'lucide-react';
import { useBiks } from '../../hooks/useBiks';
import {
  PROZESS_BIBLIOTHEK, BEISPIEL_VORGABEN, matchProzess,
} from '../../data/biksAgent';

const BEISPIEL = PROZESS_BIBLIOTHEK[0];

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function UploadForm() {
  const { startProcessing } = useBiks();
  const fileRef = useRef(null);
  const vorgabenRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [datei, setDatei] = useState(null);            // { name, size, typ, prozessId }
  const [prozessName, setProzessName] = useState('');
  const [vorgabenDatei, setVorgabenDatei] = useState(null); // { name, typ } — Risiko-Vorgaben
  const [weitereInfos, setWeitereInfos] = useState('');

  const applyFile = (fileLike, prozessId) => {
    const matched = prozessId ? PROZESS_BIBLIOTHEK.find(p => p.id === prozessId) : matchProzess(fileLike.name);
    setDatei({ name: fileLike.name, size: fileLike.size || 0, typ: matched?.typ || 'Arbeitsanweisung', prozessId: matched?.id });
    if (!prozessName) setProzessName(matched?.name || '');
  };

  const onFiles = (files) => {
    const list = Array.from(files || []);
    if (list.length === 0) return;
    applyFile(list[0]);
  };

  const onVorgaben = (files) => {
    const f = Array.from(files || [])[0];
    if (!f) return;
    setVorgabenDatei({ name: f.name, typ: 'Risikofunktionslandkarte' });
  };

  const loadBeispiel = () => {
    applyFile({ name: BEISPIEL.dateiname, size: 41114 }, BEISPIEL.id);
    setProzessName(BEISPIEL.name);
    // Das Beispiel bringt die Risikofunktionslandkarte als Vorgabe mit.
    setVorgabenDatei({ ...BEISPIEL_VORGABEN });
  };

  const clearDatei = () => { setDatei(null); if (fileRef.current) fileRef.current.value = ''; };
  const clearVorgaben = () => { setVorgabenDatei(null); if (vorgabenRef.current) vorgabenRef.current.value = ''; };

  const canProcess = !!datei;

  const handleProcess = () => {
    if (!datei) return;
    startProcessing({
      prozessId: datei.prozessId,
      prozessName: prozessName || datei.name,
      weitereInfos,
      risikoVorgaben: vorgabenDatei || null,
      quelldokument: { name: datei.name, typ: datei.typ, size: datei.size },
    });
  };

  return (
    <div className="max-w-[1000px] mx-auto w-full space-y-5 animate-fade-in-up">
      {/* Intro / Hero */}
      <div className="card-base p-6 hero-dots relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-white" style={{ background: 'var(--mode-gradient, linear-gradient(135deg,#0F4D2A,#1D7B3F))' }}>
            <Wand2 size={24} strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight">b-IKS Agent — Risiken &amp; Schlüsselkontrollen ableiten</h1>
            <p className="text-[13.5px] text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Laden Sie eine Arbeitsanweisung oder ein Prozessmodell hoch. Der Agent analysiert den Prozess
              fachlich und regulatorisch, identifiziert die wesentlichen Risiken und schlägt prüfungsfeste
              Schlüsselkontrollen vor — als bearbeitbare Kacheln mit Status und Kollaboration.
            </p>
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              {['MaRisk', 'DORA', 'BAIT', 'GwG'].map(t => (
                <span key={t} className="chip"><ShieldCheck size={11} /> {t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
        {/* Linke Spalte: Upload + Felder */}
        <div className="space-y-4">
          {/* Dropzone / geladenes Dokument */}
          {!datei ? (
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); onFiles(e.dataTransfer.files); }}
              className="card-base p-9 text-center cursor-pointer border-2 border-dashed transition-all"
              style={{ borderColor: dragging ? 'var(--mode-primary, #0F4D2A)' : '#CBD5E1', background: dragging ? 'color-mix(in srgb, var(--mode-primary, #0F4D2A) 5%, white)' : 'white' }}
            >
              <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-3" style={{ background: 'color-mix(in srgb, var(--mode-primary, #0F4D2A) 10%, white)', color: 'var(--mode-primary, #0F4D2A)' }}>
                <UploadCloud size={30} strokeWidth={1.6} />
              </div>
              <div className="font-semibold text-slate-800 text-[15px]">Prozessdokument hierher ziehen</div>
              <div className="text-[12.5px] text-slate-500 mt-1 max-w-sm mx-auto">
                Arbeitsanweisung, Richtlinie oder Prozessmodell (BPMN) — oder klicken, um eine Datei auszuwählen.
              </div>
              <div className="mt-3.5 flex items-center justify-center gap-2 flex-wrap">
                <span className="chip">.DOCX</span>
                <span className="chip">.PDF</span>
                <span className="chip">.BPMN</span>
                <span className="chip">.XLSX</span>
              </div>
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.bpmn,.xml,.txt" className="hidden" onChange={(e) => onFiles(e.target.files)} />
            </div>
          ) : (
            <div className="card-base p-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'color-mix(in srgb, var(--mode-primary, #0F4D2A) 12%, white)', color: 'var(--mode-primary, #0F4D2A)' }}>
                  <FileType2 size={22} strokeWidth={1.6} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold truncate">{datei.name}</div>
                  <div className="text-[11.5px] text-slate-500 flex items-center gap-2">
                    <span className="chip" style={{ padding: '0.05rem 0.4rem' }}>{datei.typ}</span>
                    {datei.size ? <span>{formatSize(datei.size)}</span> : null}
                    <span className="inline-flex items-center gap-1 text-emerald-700"><Info size={11} /> bereit zur Analyse</span>
                  </div>
                </div>
                <button onClick={clearDatei} className="text-slate-400 hover:text-red-600 transition-colors p-1" title="Entfernen">
                  <X size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Beispiel-Shortcut — nur solange noch kein Dokument geladen ist */}
          {!datei && (
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
                  Beispiel-Arbeitsanweisung verwenden
                  <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 4, letterSpacing: 0.4, textTransform: 'uppercase' }}>Demo</span>
                </div>
                <div className="text-[11.5px] text-slate-500 truncate">{BEISPIEL.name} — synthetischer Auszahlungsprozess (Bank)</div>
              </div>
              <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}

          {/* Felder */}
          <div className="card-base p-4 space-y-3.5">
            <label className="block">
              <span className="block text-[12px] font-semibold text-slate-700 mb-1">Zu analysierender Prozess</span>
              <input
                value={prozessName}
                onChange={(e) => setProzessName(e.target.value)}
                placeholder="z. B. Auszahlungsprozess (Bank)"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-[13.5px] focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="block">
              <span className="block text-[12px] font-semibold text-slate-700 mb-1">Weitere Informationen / weitere Inputs <span className="text-slate-400 font-normal">(optional)</span></span>
              <textarea
                value={weitereInfos}
                onChange={(e) => setWeitereInfos(e.target.value)}
                rows={2}
                placeholder="Zusätzliche Vorgaben, bestehende Kontrollen, Prüfungsfeststellungen … werden vom Agent vorrangig berücksichtigt."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-[13.5px] resize-none focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
          </div>
        </div>

        {/* Rechte Spalte: Risiko-Vorgaben + Aktion */}
        <div className="space-y-4">
          <div className="card-base p-4">
            <div className="text-[12px] font-semibold text-slate-700 mb-1">Risiko-Vorgaben <span className="text-slate-400 font-normal">(optional)</span></div>
            <p className="text-[11.5px] text-slate-500 mb-2.5 leading-snug">
              Risikofunktionslandkarte &amp; Wesentlichkeitskriterien. Ist eine Vorgabe hinterlegt, benennt der
              Agent die Risiken entsprechend dieser — sonst greift er auf die operationellen Risikoarten der
              Knowledge Base zurück.
            </p>
            {!vorgabenDatei ? (
              <button
                onClick={() => vorgabenRef.current?.click()}
                className="w-full border-2 border-dashed rounded-xl p-3.5 text-center hover:bg-slate-50 transition-colors"
                style={{ borderColor: '#CBD5E1' }}
              >
                <FileUp size={18} className="mx-auto mb-1 text-slate-400" />
                <div className="text-[12.5px] font-semibold text-slate-700">Vorgaben-Dokument hochladen</div>
                <div className="text-[11px] text-slate-500">Risikofunktionslandkarte / Wesentlichkeitskriterien</div>
              </button>
            ) : (
              <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 p-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'color-mix(in srgb, var(--mode-primary, #0F4D2A) 12%, white)', color: 'var(--mode-primary, #0F4D2A)' }}>
                  <FileType2 size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-semibold truncate">{vorgabenDatei.name}</div>
                  <span className="chip" style={{ padding: '0.02rem 0.4rem' }}>{vorgabenDatei.typ}</span>
                </div>
                <button onClick={clearVorgaben} className="text-slate-400 hover:text-red-600 p-1" title="Vorgabe entfernen"><X size={16} /></button>
              </div>
            )}
            <input ref={vorgabenRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.txt" className="hidden" onChange={(e) => onVorgaben(e.target.files)} />
          </div>

          <div className="card-base p-4">
            <button
              onClick={handleProcess}
              disabled={!canProcess}
              className="w-full px-4 py-3 rounded-xl text-white text-[14.5px] font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-45 disabled:cursor-not-allowed transition-all hover:brightness-110"
              style={{ background: 'var(--mode-gradient, linear-gradient(135deg,#0F4D2A,#1D7B3F))' }}
            >
              <Sparkles size={18} /> Verarbeiten
            </button>
            <p className="text-[11px] text-slate-400 mt-2 text-center leading-snug">
              {canProcess
                ? 'Der Agent analysiert das Dokument und leitet die Top-5-Risiken samt Schlüsselkontrollen ab.'
                : 'Laden Sie zunächst ein Dokument hoch oder starten Sie mit dem Beispiel.'}
            </p>
          </div>

          <div className="text-[11px] text-slate-400 leading-relaxed px-1">
            Demo-Umgebung · synthetische Daten. Es werden keine echten Dokumente an externe Dienste übertragen.
          </div>
        </div>
      </div>
    </div>
  );
}
