import { useState, useRef, useEffect } from 'react';
import { Home, ChevronDown, Calendar, Download, FileText, Sparkles } from 'lucide-react';
import { BANKS } from '../data/banks';
import BankLogo from './BankLogo';
import { REPORT_DATE } from '../data/kpiData';

function getBasePath() {
  const path = window.location.pathname;
  if (path.includes('/BankenKPI/')) {
    return path.substring(0, path.indexOf('/BankenKPI/')) + '/';
  }
  return '/';
}

export default function Header({ bank, onBankChange, onExportPpt, onExportPdf }) {
  const [open, setOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const dropRef = useRef(null);
  const expRef = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
      if (expRef.current && !expRef.current.contains(e.target)) setExportOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <header
      className="text-white relative"
      style={{ background: bank.gradient }}
    >
      {/* Top row: home + bank selector + date + export */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/10">
        <div className="flex items-center gap-4">
          <a
            href={getBasePath()}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-medium"
          >
            <Home size={16} strokeWidth={1.75} />
            <span>Übersicht</span>
          </a>
          <span className="text-white/30">|</span>
          <div className="flex items-center gap-2 text-sm text-white/70">
            <Sparkles size={14} strokeWidth={1.75} />
            <span>Banken-KPI · Monatlicher Bericht</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-white/80">
            <Calendar size={14} strokeWidth={1.75} />
            <span>Stand: {REPORT_DATE}</span>
          </div>

          {/* Export */}
          <div className="relative" ref={expRef}>
            <button
              onClick={() => setExportOpen((o) => !o)}
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 transition-colors px-3 py-1.5 rounded-lg text-sm font-medium"
            >
              <Download size={14} strokeWidth={1.75} />
              <span>Export</span>
              <ChevronDown size={14} strokeWidth={1.75} />
            </button>
            {exportOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white text-slate-700 rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-fade-in-up">
                <button
                  onClick={() => { setExportOpen(false); onExportPpt?.(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-sm text-left"
                >
                  <FileText size={16} strokeWidth={1.75} className="text-slate-500" />
                  <div>
                    <div className="font-medium">PowerPoint (.pptx)</div>
                    <div className="text-xs text-slate-400">Whitelabel-Layout</div>
                  </div>
                </button>
                <button
                  onClick={() => { setExportOpen(false); onExportPdf?.(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-sm text-left border-t border-slate-100"
                >
                  <FileText size={16} strokeWidth={1.75} className="text-slate-500" />
                  <div>
                    <div className="font-medium">Druck / PDF</div>
                    <div className="text-xs text-slate-400">Browser-Druckdialog</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main bank section */}
      <div className="px-6 py-5 flex items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {/* Active bank logo */}
          <div className="bg-white rounded-xl px-5 py-3 shadow-md flex items-center" style={{ color: bank.primary }}>
            <BankLogo bankId={bank.id} height={32} />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-white/60 mb-1">KPI Dashboard · gem. XYZ-Meldung</div>
            <h1 className="text-2xl font-bold leading-tight">{bank.name}</h1>
            <div className="text-sm text-white/70">{bank.tagline}</div>
          </div>
        </div>

        {/* Bank selector */}
        <div className="relative" ref={dropRef}>
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2 bg-white/15 hover:bg-white/25 transition-colors px-4 py-2 rounded-lg text-sm font-medium"
          >
            <span>Bank wechseln</span>
            <ChevronDown size={16} strokeWidth={1.75} />
          </button>
          {open && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white text-slate-700 rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-fade-in-up">
              <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                Verfügbare Institute
              </div>
              <div className="max-h-96 overflow-y-auto">
                {BANKS.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => { setOpen(false); onBankChange(b.id); }}
                    className={
                      'w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-sm text-left ' +
                      (b.id === bank.id ? 'bg-slate-50' : '')
                    }
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ background: b.primary }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{b.name}</div>
                      <div className="text-xs text-slate-400 truncate">{b.tagline}</div>
                    </div>
                    {b.id === 'zukunftsbank' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 font-semibold">
                        DEMO
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logo strip with all banks */}
      <div className="px-6 pb-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-3 overflow-x-auto">
          <span className="text-[11px] uppercase tracking-wider text-white/60 font-semibold whitespace-nowrap mr-2">
            Banking-Partner
          </span>
          {BANKS.map((b) => (
            <button
              key={b.id}
              onClick={() => onBankChange(b.id)}
              className={
                'shrink-0 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ' +
                (b.id === bank.id
                  ? 'bg-white shadow-md scale-[1.02]'
                  : 'bg-white/70 hover:bg-white/90')
              }
              style={{ color: b.primary }}
              title={b.name}
            >
              <BankLogo bankId={b.id} height={20} />
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
