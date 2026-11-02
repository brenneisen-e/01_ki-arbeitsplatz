import { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import {
  Home, ChevronDown, Download, FileText, ShieldCheck, BarChart3, Calendar,
  Lock, FlaskConical,
} from 'lucide-react';
import { BANKS, getBankLogoUrl } from '../data/banks';
import { getReportDate, SEGMENTS } from '../data/kpiData';

function getBasePath() {
  const path = window.location.pathname;
  if (path.includes('/02_BankenKPI/')) {
    return path.substring(0, path.indexOf('/02_BankenKPI/')) + '/';
  }
  return '/';
}

// Logo-Komponente analog zu HR Pipeline (`InstitutLogo`).
function BankBrandLogo({ bank, className, style }) {
  const url = getBankLogoUrl(bank);
  if (url) {
    return (
      <img
        src={url}
        alt={bank.institut}
        className={className}
        style={style}
        onError={(e) => { e.target.style.display = 'none'; }}
      />
    );
  }
  const initials = bank.institut.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div
      className={className}
      style={{
        ...style,
        background: bank.colors?.primary || '#475569',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: 10,
        letterSpacing: 0.5,
      }}
    >
      {initials}
    </div>
  );
}

function BankDropdown({ activeBankId, onSelect, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div ref={ref} className="hp-institut-dropdown">
      <div className="hp-institut-dropdown-title">Institut wählen</div>
      {BANKS.map((b) => (
        <button
          key={b.id}
          className={clsx('hp-institut-option', b.id === activeBankId && 'active')}
          onClick={() => { onSelect(b.id); onClose(); }}
        >
          <div className="hp-institut-option-dot" style={{ background: b.colors.gradient }} />
          <BankBrandLogo bank={b} className="hp-institut-option-logo" />
          <span>{b.institut}</span>
          {b.mode === 'generic' && (
            <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 600, color: '#64748b', background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>
              White Label
            </span>
          )}
          {b.id === activeBankId && b.mode !== 'generic' && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14" style={{ marginLeft: 'auto', color: b.colors.primaryLight }}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>
      ))}
    </div>
  );
}

export default function Header({ bank, onBankChange, activeSegment, onSegmentChange, onExportPpt, onExportPdf }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (exportRef.current && !exportRef.current.contains(e.target)) setExportOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <header className="transition-all duration-500" style={{ background: bank.colors.gradient }}>
      {/* Top Row */}
      <div className="px-6 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => { window.location.href = getBasePath(); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Zurück zur Startseite"
          >
            <Home size={16} strokeWidth={1.75} />
            <span className="text-xs font-medium">Startseite</span>
          </button>

          {/* Institut Selector */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition-colors border border-white/20"
            >
              <BankBrandLogo bank={bank} className="w-6 h-6 rounded object-contain bg-white" />
              <span className="text-white font-bold text-sm">{bank.institut}</span>
              {bank.mode === 'generic' && (
                <span className="text-[10px] font-semibold tracking-wide text-white/70 bg-white/15 px-1.5 py-0.5 rounded">
                  White Label
                </span>
              )}
              <ChevronDown size={14} className={clsx('text-white/60 transition-transform', dropdownOpen && 'rotate-180')} />
            </button>
            {dropdownOpen && (
              <BankDropdown
                activeBankId={bank.id}
                onSelect={onBankChange}
                onClose={() => setDropdownOpen(false)}
              />
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center">
              <BarChart3 size={22} strokeWidth={1.75} className="text-white" />
            </div>
            <div>
              <div className="text-white text-sm font-medium">Banken-KPI</div>
              <div className="text-white/60 text-xs">Monatlicher Bericht · gem. XYZ-Meldung</div>
            </div>
          </div>

          {/* Klassifizierung & AI-Hinweis */}
          <div className="flex items-center gap-2 ml-4 pl-4 border-l border-white/20">
            <span className="flex items-center gap-1 text-white/80 text-xs bg-white/10 px-2.5 py-1 rounded-full">
              <Lock size={12} strokeWidth={2} />
              Vertraulich
            </span>
            <span className="flex items-center gap-1 text-white/80 text-xs bg-white/10 px-2.5 py-1 rounded-full">
              <FlaskConical size={12} strokeWidth={2} />
              Demo-Daten
            </span>
            <span className="flex items-center gap-1 text-emerald-300 text-xs bg-white/10 px-2.5 py-1 rounded-full">
              <ShieldCheck size={13} />
              EU AI Act
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Stand */}
          <span className="hidden md:flex items-center gap-1.5 text-white/70 text-xs">
            <Calendar size={13} strokeWidth={1.75} />
            Stand: {getReportDate()}
          </span>

          {/* Export */}
          <div className="relative" ref={exportRef}>
            <button
              onClick={() => setExportOpen((o) => !o)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition-colors border border-white/20 text-white text-xs font-medium"
              title="Bericht exportieren"
            >
              <Download size={14} strokeWidth={1.75} />
              <span>Export</span>
              <ChevronDown size={12} className={clsx('text-white/60 transition-transform', exportOpen && 'rotate-180')} />
            </button>
            {exportOpen && (
              <div className="hp-institut-dropdown" style={{ right: 0, left: 'auto', minWidth: 220 }}>
                <button
                  onClick={() => { setExportOpen(false); onExportPpt?.(); }}
                  className="hp-institut-option"
                >
                  <FileText size={16} className="text-slate-400" />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 600 }}>PowerPoint (.pptx)</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>Whitelabel-Layout</div>
                  </div>
                </button>
                <button
                  onClick={() => { setExportOpen(false); onExportPdf?.(); }}
                  className="hp-institut-option"
                >
                  <FileText size={16} className="text-slate-400" />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 600 }}>Druck / PDF</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>Browser-Druckdialog</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          <span className="text-[11px] text-white/40 tracking-wide">gem. XYZ-Meldung</span>
        </div>
      </div>

      {/* Tab-Leiste (Segmente) */}
      <div className="px-6 flex gap-1 overflow-x-auto pb-0">
        {SEGMENTS.map((seg) => (
          <button
            key={seg.id}
            onClick={() => onSegmentChange(seg.id)}
            className={clsx(
              'flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-t-lg transition-all duration-200 whitespace-nowrap',
              activeSegment === seg.id
                ? 'bg-white text-slate-800'
                : 'text-white/70 hover:text-white hover:bg-white/10',
            )}
          >
            {seg.label}
          </button>
        ))}
      </div>
    </header>
  );
}
