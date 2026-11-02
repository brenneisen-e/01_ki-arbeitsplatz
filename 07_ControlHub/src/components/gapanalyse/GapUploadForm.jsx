import { useRef, useState } from 'react';
import {
  UploadCloud, X, Sparkles, ShieldCheck, ChevronRight, FileSpreadsheet,
  GitCompareArrows, Info, Split, Merge, CircleSlash, Unplug, Gavel, Building2, TrendingUp,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useGapAnalyse } from '../../hooks/useGapAnalyse';
import { SZENARIEN, SZENARIO_MAP } from '../../data/gapAnalyseAgent';

const SZENARIO_ICON = { Split, Merge, Building2 };

const HEBEL = {
  'carve-out': [
    { icon: Unplug, color: '#EA580C', label: 'Konzernabhängigkeiten' },
    { icon: CircleSlash, color: '#DC2626', label: 'Fehlende Kontrollen' },
    { icon: Gavel, color: '#2563EB', label: 'Neue Pflichten' },
    { icon: GitCompareArrows, color: '#D97706', label: 'Abweichendes Design' },
  ],
  fusion: [
    { icon: Merge, color: '#7C3AED', label: 'Doppelte Kontrollen' },
    { icon: GitCompareArrows, color: '#D97706', label: 'Schwellenkonflikte' },
    { icon: CircleSlash, color: '#DC2626', label: 'Einseitige Lücken' },
    { icon: Gavel, color: '#2563EB', label: 'Neue Pflichten' },
  ],
  anlehnung: [
    { icon: CircleSlash, color: '#DC2626', label: 'Hinter dem Standard' },
    { icon: GitCompareArrows, color: '#D97706', label: 'Abweichendes Design' },
    { icon: TrendingUp, color: '#0891B2', label: 'Über Standard' },
    { icon: Gavel, color: '#2563EB', label: 'Konzernvorgaben' },
  ],
};

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function Dropzone({ titel, hinweis, datei, onFiles, onClear, inputRef, rolle }) {
  const [dragging, setDragging] = useState(false);
  if (datei) {
    return (
      <div className="card-base p-3.5">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">{rolle}</div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
               style={{ background: 'color-mix(in srgb, var(--mode-primary, #0F4D2A) 12%, white)', color: 'var(--mode-primary, #0F4D2A)' }}>
            <FileSpreadsheet size={20} strokeWidth={1.6} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold truncate">{datei.name}</div>
            <div className="text-[11px] text-slate-500 flex items-center gap-2 flex-wrap">
              <span className="chip" style={{ padding: '0.02rem 0.4rem' }}>{datei.typ}</span>
              {datei.size ? <span>{formatSize(datei.size)}</span> : null}
            </div>
          </div>
          <button onClick={onClear} className="text-slate-400 hover:text-red-600 p-1 shrink-0" title="Entfernen"><X size={17} /></button>
        </div>
      </div>
    );
  }
  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); onFiles(e.dataTransfer.files); }}
      className="card-base p-6 text-center cursor-pointer border-2 border-dashed transition-all"
      style={{
        borderColor: dragging ? 'var(--mode-primary, #0F4D2A)' : '#CBD5E1',
        background: dragging ? 'color-mix(in srgb, var(--mode-primary, #0F4D2A) 5%, white)' : 'white',
      }}
    >
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">{rolle}</div>
      <div className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center mb-2.5"
           style={{ background: 'color-mix(in srgb, var(--mode-primary, #0F4D2A) 10%, white)', color: 'var(--mode-primary, #0F4D2A)' }}>
        <UploadCloud size={24} strokeWidth={1.6} />
      </div>
      <div className="font-semibold text-slate-800 text-[13.5px]">{titel}</div>
      <div className="text-[11.5px] text-slate-500 mt-1">{hinweis}</div>
      <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv,.pdf,.docx,.doc,.txt" className="hidden" onChange={(e) => onFiles(e.target.files)} />
    </div>
  );
}

export default function GapUploadForm() {
  const { startProcessing } = useGapAnalyse();
  const refA = useRef(null);
  const refB = useRef(null);
  const [szenario, setSzenario] = useState('carve-out');
  const [dateiA, setDateiA] = useState(null);
  const [dateiB, setDateiB] = useState(null);
  const [zielName, setZielName] = useState('');
  const [stichtag, setStichtag] = useState('');
  const [weitereInfos, setWeitereInfos] = useState('');

  const sz = SZENARIO_MAP[szenario];

  const wechsleSzenario = (id) => {
    setSzenario(id);
    // Beispiel-Dateien gehören zum Szenario — bei Wechsel zurücksetzen.
    setDateiA(null);
    setDateiB(null);
    setZielName('');
  };

  const onA = (files) => {
    const f = Array.from(files || [])[0];
    if (f) setDateiA({ name: f.name, size: f.size || 0, typ: sz.beispielA.typ });
  };
  const onB = (files) => {
    const f = Array.from(files || [])[0];
    if (f) setDateiB({ name: f.name, size: f.size || 0, typ: sz.beispielB.typ });
  };

  const loadBeispiel = () => {
    setDateiA({ ...sz.beispielA });
    setDateiB({ ...sz.beispielB });
    setZielName(sz.zielName);
  };

  const canProcess = !!dateiA && !!dateiB;

  const handleProcess = () => {
    if (!canProcess) return;
    startProcessing({
      szenario,
      zielName: zielName || sz.zielName,
      stichtag,
      weitereInfos,
      quelldokumentA: dateiA,
      quelldokumentB: dateiB,
    });
  };

  // Stichtag zusätzlich in deutschem Format anzeigen — das native Feld rendert
  // je nach Browsersprache abweichend.
  const stichtagDe = stichtag
    ? new Date(stichtag).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : null;

  return (
    <div className="max-w-[1000px] mx-auto w-full space-y-5 animate-fade-in-up">
      {/* Intro */}
      <div className="card-base p-6 hero-dots relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-white"
               style={{ background: 'var(--mode-gradient, linear-gradient(135deg,#0F4D2A,#1D7B3F))' }}>
            <GitCompareArrows size={24} strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight">Gap Analyzer &mdash; zwei Kontrollinventare abgleichen</h1>
              <span style={{ background: '#DBEAFE', color: '#1E40AF', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5, letterSpacing: 0.4, textTransform: 'uppercase' }}>Ausblick</span>
            </div>
            <p className="text-[13.5px] text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Zwei Kontrollinventare gegenüberstellen und die Frage beantworten, die bei jeder Strukturveränderung zuerst kommt:
              <span className="font-semibold"> Welche Kontrollen fehlen der neuen Einheit — und was davon muss zum Vollzugsstichtag stehen?</span>
            </p>
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              {['MaRisk', 'DORA', 'CRR', 'GwG'].map(t => (
                <span key={t} className="chip"><ShieldCheck size={11} /> {t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Szenario-Umschalter */}
        <div className="mt-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Szenario</div>
          <div className="grid sm:grid-cols-3 gap-2.5">
            {SZENARIEN.map(s => {
              const Icon = SZENARIO_ICON[s.icon] || Split;
              const aktiv = szenario === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => wechsleSzenario(s.id)}
                  aria-pressed={aktiv}
                  className={clsx(
                    'text-left rounded-xl border-2 p-3.5 transition-all',
                    aktiv ? 'shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'
                  )}
                  style={aktiv ? {
                    borderColor: 'var(--mode-primary, #0F4D2A)',
                    background: 'color-mix(in srgb, var(--mode-primary, #0F4D2A) 6%, white)',
                  } : undefined}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                          style={aktiv
                            ? { background: 'var(--mode-gradient, linear-gradient(135deg,#0F4D2A,#1D7B3F))', color: 'white' }
                            : { background: '#F1F5F9', color: '#64748B' }}>
                      <Icon size={18} strokeWidth={1.75} />
                    </span>
                    <span className="text-[14px] font-bold">{s.label}</span>
                  </div>
                  <p className="text-[11.5px] text-slate-600 mt-2 leading-snug">{s.frage}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Was der Agent im gewählten Szenario sucht */}
        <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {HEBEL[szenario].map(h => {
            const Icon = h.icon;
            return (
              <div key={h.label} className="flex items-center gap-2 rounded-lg px-2.5 py-2 bg-white/70 border border-slate-200">
                <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `color-mix(in srgb, ${h.color} 12%, white)`, color: h.color }}>
                  <Icon size={15} />
                </span>
                <span className="text-[11.5px] font-semibold text-slate-700 leading-tight">{h.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[12.5px] text-slate-600 leading-relaxed px-1">{sz.beschreibung}</p>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
        <div className="space-y-4">
          {/* Zwei Inventare */}
          <div className="grid sm:grid-cols-2 gap-3">
            <Dropzone
              rolle={sz.einheitA.label}
              titel="Inventar hierher ziehen"
              hinweis="RCM, Kontrollkatalog oder IKS-Export"
              datei={dateiA}
              inputRef={refA}
              onFiles={onA}
              onClear={() => { setDateiA(null); if (refA.current) refA.current.value = ''; }}
            />
            <Dropzone
              rolle={sz.einheitB.label}
              titel="Inventar hierher ziehen"
              hinweis="RCM, Kontrollkatalog oder IKS-Export"
              datei={dateiB}
              inputRef={refB}
              onFiles={onB}
              onClear={() => { setDateiB(null); if (refB.current) refB.current.value = ''; }}
            />
          </div>

          {!canProcess && (
            <button
              onClick={loadBeispiel}
              className="w-full card-base p-3.5 flex items-center gap-3 text-left hover:shadow-md transition-shadow group"
              style={{ background: 'color-mix(in srgb, var(--mode-primary, #0F4D2A) 4%, white)' }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                   style={{ background: 'var(--mode-gradient, linear-gradient(135deg,#0F4D2A,#1D7B3F))', color: 'white' }}>
                <Sparkles size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-semibold flex items-center gap-2">
                  Beispiel für {sz.label} verwenden
                  <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 4, letterSpacing: 0.4, textTransform: 'uppercase' }}>Demo</span>
                </div>
                <div className="text-[11.5px] text-slate-500 truncate">{sz.zielName} — beide Inventare vorbelegt</div>
              </div>
              <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}

          <div className="card-base p-4 space-y-3.5">
            <label className="block">
              <span className="block text-[12px] font-semibold text-slate-700 mb-1">
                {szenario === 'carve-out' ? 'Zieleinheit' : szenario === 'fusion' ? 'Fusionierte Einheit' : 'Tochtergesellschaft'}
              </span>
              <input
                value={zielName}
                onChange={(e) => setZielName(e.target.value)}
                placeholder={sz.zielName}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-[13.5px] focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
            <label className="block">
              <span className="block text-[12px] font-semibold text-slate-700 mb-1">
                {sz.stichtagLabel} <span className="text-slate-400 font-normal">(optional)</span>
              </span>
              <input
                type="date"
                lang="de-DE"
                value={stichtag}
                onChange={(e) => setStichtag(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-[13.5px] focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
              {/* Der native Picker rendert in der Browsersprache — die DE-Anzeige
                  bzw. der Formathinweis stellt sicher, dass kein Zweifel bleibt. */}
              <span className="block text-[11.5px] text-slate-500 mt-1">
                {stichtagDe ? `Gewählt: ${stichtagDe}` : 'Format: TT.MM.JJJJ'}
              </span>
            </label>
            <label className="block">
              <span className="block text-[12px] font-semibold text-slate-700 mb-1">
                Weitere Informationen / Vorgaben <span className="text-slate-400 font-normal">(optional)</span>
              </span>
              <textarea
                value={weitereInfos}
                onChange={(e) => setWeitereInfos(e.target.value)}
                rows={2}
                placeholder="z. B. geplante Service-Vereinbarungen, Zielorganisation, offene Prüfungsfeststellungen …"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-[13.5px] resize-none focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card-base p-4">
            <div className="flex items-start gap-2 text-[11.5px] text-slate-500 leading-snug mb-3">
              <Info size={14} className="shrink-0 mt-0.5 text-slate-400" />
              <span>
                Der Agent gleicht Kontrollziele semantisch ab — gleiche Wirkung zählt, nicht gleicher Wortlaut.
                Unterschiedliche Kontrollnummern und Formulierungen der beiden Häuser sind kein Hindernis.
              </span>
            </div>
            <button
              onClick={handleProcess}
              disabled={!canProcess}
              className="w-full px-4 py-3 rounded-xl text-white text-[14.5px] font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-45 disabled:cursor-not-allowed transition-all hover:brightness-110"
              style={{ background: 'var(--mode-gradient, linear-gradient(135deg,#0F4D2A,#1D7B3F))' }}
            >
              <GitCompareArrows size={18} /> Inventare abgleichen
            </button>
            <p className="text-[11px] text-slate-400 mt-2 text-center leading-snug">
              {canProcess
                ? 'Der Agent ermittelt Lücken, Doppelungen und Abweichungen und priorisiert sie nach Dringlichkeit.'
                : 'Laden Sie beide Inventare hoch oder starten Sie mit dem Beispiel.'}
            </p>
          </div>

          <div className="text-[11px] text-slate-400 leading-relaxed px-1">
            Ausblick auf eine geplante Erweiterung · synthetische Daten. Es werden keine echten Dokumente an externe Dienste übertragen.
          </div>
        </div>
      </div>
    </div>
  );
}
