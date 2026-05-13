import { useState, useRef, useEffect } from 'react';
import { Home, ChevronDown, ShieldCheck, FileText, Sparkles, Bot, BookOpen, Download, FileBarChart, FileSpreadsheet } from 'lucide-react';
import { clsx } from 'clsx';
import { useInstitut } from '../../hooks/useInstitut';
import { useSmartIcs } from '../../hooks/useSmartIcs';
import { getInstitutLogoUrl } from '../../data/institutConfig';
import { DEMO_PROZESSE } from '../../data/risikoKatalog';
import { generateArbeitsanweisungPdf, generateRichtliniePdf, generateProzessbeschreibungPdf } from '../../utils/demoPdfGenerator';
import { generateLeitfadenKreditvergabe } from '../../utils/richDocs/leitfadenKredit';
import { generateHandbuchZahlungsverkehr } from '../../utils/richDocs/handbuchZahlungsverkehr';
import { generateExcelKompetenzmatrix, generateExcelSicherheitenbewertung, generateExcelZahlungslimits } from '../../utils/richDocs/excelGenerator';

function getBasePath() {
  const path = window.location.pathname;
  if (path.includes('/SmartICS/')) {
    return path.substring(0, path.indexOf('/SmartICS/')) + '/';
  }
  return '/';
}

function InstitutLogo({ variant, className, style }) {
  const url = getInstitutLogoUrl(variant);
  if (url) {
    return (
      <img
        src={url}
        alt={variant.institut}
        className={className}
        style={style}
        onError={e => { e.target.style.display = 'none'; }}
      />
    );
  }
  const initials = variant.institut.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div
      className={className}
      style={{
        ...style,
        background: variant.colors?.primary || '#475569',
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

function InstitutDropdown({ onClose }) {
  const { institut, varianten, switchInstitut } = useInstitut();
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div ref={ref} className="dropdown-menu" style={{ minWidth: 290 }}>
      <div className="dropdown-title">Institut wählen</div>
      {varianten.map(v => (
        <button
          key={v.institut}
          className={clsx('dropdown-item', v.institut === institut.institut && 'active')}
          onClick={() => { switchInstitut(v); onClose(); }}
        >
          <div style={{ width: 8, height: 8, borderRadius: 99, background: v.colors.gradient || v.colors.primary }} />
          <InstitutLogo variant={v} className="w-6 h-6 rounded object-contain bg-white border border-slate-200" />
          <span style={{ flex: 1 }}>{v.institut}</span>
          {v.mode === 'generic' && (
            <span className="text-[10px] font-semibold tracking-wide text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
              White Label
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

function DemoDocsDropdown({ onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const richDocs = [
    {
      id: 'leitfaden-kredit',
      label: 'Prozessleitfaden Kreditvergabe Firmenkunden',
      sub: 'PDF · ~20 Seiten · v4.2 · MaRisk BTO 1.2 · § 18 KWG · DORA',
      tone: 'rich',
      icon: BookOpen,
      onClick: () => generateLeitfadenKreditvergabe(),
    },
    {
      id: 'handbuch-zv',
      label: 'Operations-Handbuch SEPA/SWIFT-Zahlungsverkehr',
      sub: 'PDF · ~20 Seiten · v6.0 · PSD2 · DORA · CSCF · GwG',
      tone: 'rich',
      icon: BookOpen,
      onClick: () => generateHandbuchZahlungsverkehr(),
    },
  ];

  const excelDocs = [
    {
      id: 'xlsx-kompetenz',
      label: 'Kompetenzmatrix Kreditgeschäft 2026',
      sub: 'XLSX · 5 Sheets · Matrix + Rating-Skala + Override-Regeln',
      icon: FileSpreadsheet,
      onClick: () => generateExcelKompetenzmatrix(),
    },
    {
      id: 'xlsx-sicherheit',
      label: 'Sicherheiten-Bewertung Q4/2025',
      sub: 'XLSX · 5 Sheets · Haircut-Matrix + Bewertungsmodelle + Trigger',
      icon: FileSpreadsheet,
      onClick: () => generateExcelSicherheitenbewertung(),
    },
    {
      id: 'xlsx-zv-limits',
      label: 'Zahlungsverkehr Limits & Schwellen',
      sub: 'XLSX · 6 Sheets · Cut-offs + Freigaben + Sanktionslisten + CSCF',
      icon: FileSpreadsheet,
      onClick: () => generateExcelZahlungslimits(),
    },
  ];

  const lightDocs = [
    {
      id: 'arbeitsanweisung',
      label: 'Arbeitsanweisung Kreditvergabe (kurz)',
      sub: 'PDF · 4 Seiten',
      icon: FileText,
      onClick: () => generateArbeitsanweisungPdf(DEMO_PROZESSE[0]),
    },
    {
      id: 'richtlinie',
      label: 'Richtlinie Zahlungsverkehr (kurz)',
      sub: 'PDF · 3 Seiten',
      icon: FileText,
      onClick: () => generateRichtliniePdf(DEMO_PROZESSE[2]),
    },
    {
      id: 'wpprozess',
      label: 'Prozessbeschreibung Wertpapier-Settlement (kurz)',
      sub: 'PDF · 3 Seiten',
      icon: FileText,
      onClick: () => generateProzessbeschreibungPdf(DEMO_PROZESSE[1]),
    },
    {
      id: 'schaden',
      label: 'Schaden-Operations Handbuch (kurz)',
      sub: 'PDF · 3 Seiten',
      icon: FileText,
      onClick: () => generateProzessbeschreibungPdf(DEMO_PROZESSE[3]),
    },
  ];

  const Item = ({ d }) => {
    const Icon = d.icon;
    const isRich = d.tone === 'rich';
    return (
      <button
        onClick={() => d.onClick()}
        className="dropdown-item"
        style={isRich ? { background: 'color-mix(in srgb, var(--mode-primary, #0F4D2A) 6%, white)' } : undefined}
      >
        <span
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            background: isRich
              ? 'var(--mode-gradient, linear-gradient(135deg,#0F4D2A,#1D7B3F))'
              : 'color-mix(in srgb, var(--mode-primary, #0F4D2A) 12%, white)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isRich ? 'white' : 'var(--mode-primary, #0F4D2A)',
            flexShrink: 0,
          }}
        >
          <Icon size={16} strokeWidth={1.75} />
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span className="flex items-center gap-1.5">
            <span className="font-semibold text-[13px] leading-tight">{d.label}</span>
            {isRich && (
              <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 4, letterSpacing: 0.4, textTransform: 'uppercase' }}>
                Realistisch
              </span>
            )}
          </span>
          <span className="block text-[11px] text-slate-500 leading-snug">{d.sub}</span>
        </span>
        <Download size={14} className="text-slate-400 shrink-0" />
      </button>
    );
  };

  return (
    <div ref={ref} className="dropdown-menu" style={{ minWidth: 440, right: 0, left: 'auto', maxHeight: 520 }}>
      <div className="dropdown-title">Demo-Eingangsdokumente</div>
      <p className="px-3 pb-2 text-[12px] text-slate-500 leading-snug">
        Realistische Banken-Dokumente zum Hochladen — verwenden Sie sie unter
        „Schritt&nbsp;1 – Prozessanalyse", um den vollständigen Smart-ICS-Workflow
        zu erleben.
      </p>

      <div className="dropdown-title" style={{ marginTop: 4 }}>Vollständige Prozessleitfäden (PDF)</div>
      {richDocs.map(d => <Item key={d.id} d={d} />)}

      <div className="dropdown-title" style={{ marginTop: 8 }}>Begleit-Workbooks (Excel)</div>
      {excelDocs.map(d => <Item key={d.id} d={d} />)}

      <div className="dropdown-title" style={{ marginTop: 8 }}>Kurzfassungen</div>
      {lightDocs.map(d => <Item key={d.id} d={d} />)}
    </div>
  );
}

export default function GlobalHeader({ activeView, onViewChange }) {
  const { institut } = useInstitut();
  const { setAiPanelOpen, aiPanelOpen } = useSmartIcs();
  const [instOpen, setInstOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);

  const modes = [
    { id: 'workflow', label: 'Smart-ICS Workflow', icon: ShieldCheck },
    { id: 'rkm',      label: 'Risiko-Kontroll-Matrix', icon: FileBarChart },
    { id: 'methodik', label: 'Methodik & Regelkreis',  icon: BookOpen },
  ];

  return (
    <header
      className="transition-all duration-500 text-white"
      style={{ background: institut.colors.gradient }}
    >
      <div className="px-6 pt-5 pb-3 flex items-center justify-between gap-4 flex-wrap">
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
              onClick={() => setInstOpen(v => !v)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition-colors border border-white/20"
            >
              <InstitutLogo variant={institut} className="w-6 h-6 rounded object-contain bg-white" />
              <span className="text-white font-bold text-sm">{institut.institut}</span>
              {institut.mode === 'generic' && (
                <span className="text-[10px] font-semibold tracking-wide text-white/70 bg-white/15 px-1.5 py-0.5 rounded">
                  White Label
                </span>
              )}
              <ChevronDown size={14} className={clsx('text-white/60 transition-transform', instOpen && 'rotate-180')} />
            </button>
            {instOpen && <InstitutDropdown onClose={() => setInstOpen(false)} />}
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center">
              <ShieldCheck size={22} className="text-white" strokeWidth={1.6} />
            </div>
            <div>
              <div className="text-white text-sm font-semibold tracking-tight">Smart ICS</div>
              <div className="text-white/70 text-xs">
                KI-gestützte Risiko- &amp; Kontrollinventarisierung
              </div>
            </div>
          </div>

          {/* Compliance Badges */}
          <div className="flex items-center gap-2 ml-4 pl-4 border-l border-white/20">
            <span className="flex items-center gap-1 text-emerald-200 text-[11px] bg-white/10 px-2.5 py-1 rounded-full">
              <ShieldCheck size={13} /> MaRisk
            </span>
            <span className="flex items-center gap-1 text-emerald-200 text-[11px] bg-white/10 px-2.5 py-1 rounded-full">
              <ShieldCheck size={13} /> DORA
            </span>
            <span className="flex items-center gap-1 text-emerald-200 text-[11px] bg-white/10 px-2.5 py-1 rounded-full">
              <ShieldCheck size={13} /> EU AI Act
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setDocsOpen(v => !v)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition-colors border border-white/20 text-white text-xs font-medium"
              title="Demo-Dokumente herunterladen"
            >
              <FileText size={14} strokeWidth={1.75} />
              <span>Demo-PDFs</span>
              <ChevronDown size={12} className={clsx('text-white/60 transition-transform', docsOpen && 'rotate-180')} />
            </button>
            {docsOpen && <DemoDocsDropdown onClose={() => setDocsOpen(false)} />}
          </div>

          <button
            onClick={() => setAiPanelOpen(!aiPanelOpen)}
            className={clsx(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors',
              aiPanelOpen
                ? 'bg-white text-slate-900 border-white'
                : 'bg-white/15 text-white border-white/20 hover:bg-white/25'
            )}
            title="KI-Assistent"
          >
            <Bot size={14} strokeWidth={1.75} />
            <span>KI-Assistent</span>
            {!aiPanelOpen && <Sparkles size={12} className="text-white/80" />}
          </button>

          <span className="text-[11px] text-white/40 tracking-wide hidden lg:inline">
            Demo-Umgebung — synthetische Daten
          </span>
        </div>
      </div>

      {/* View tabs */}
      <div className="px-6 flex gap-1 overflow-x-auto pb-0">
        {modes.map(m => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => onViewChange(m.id)}
              className={clsx(
                'flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-t-lg transition-all duration-200 whitespace-nowrap',
                activeView === m.id
                  ? 'bg-white text-slate-800'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              )}
            >
              <Icon size={16} strokeWidth={1.75} />
              {m.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
