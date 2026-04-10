import { useState, useRef, useEffect, useMemo } from 'react';
import { Home, UserPlus, LayoutDashboard, Shield, ShieldCheck, ChevronDown, FileText, Download } from 'lucide-react';
import { clsx } from 'clsx';
import { useInstitut } from '../../hooks/useInstitut';
import { getInstitutLogoUrl } from '../../data/institutConfig';
import { getHRData } from '../../data/hrData';

function getBasePath() {
  const path = window.location.pathname;
  if (path.includes('/HRPipeline/')) {
    return path.substring(0, path.indexOf('/HRPipeline/')) + '/';
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
        letterSpacing: 0.5
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
    <div ref={ref} className="hp-institut-dropdown">
      <div className="hp-institut-dropdown-title">Institut wählen</div>
      {varianten.map(v => (
        <button
          key={v.institut}
          className={clsx('hp-institut-option', v.institut === institut.institut && 'active')}
          onClick={() => { switchInstitut(v); onClose(); }}
        >
          <div className="hp-institut-option-dot" style={{ background: v.colors.gradient }} />
          <InstitutLogo variant={v} className="hp-institut-option-logo" />
          <span>{v.institut}</span>
          {v.mode === 'generic' && (
            <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 600, color: '#64748b', background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>
              White Label
            </span>
          )}
          {v.institut === institut.institut && v.mode !== 'generic' && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14" style={{ marginLeft: 'auto', color: v.colors.primaryLight }}><polyline points="20 6 9 17 4 12"/></svg>
          )}
        </button>
      ))}
    </div>
  );
}

function CvTemplatesDropdown({ demoProfiles, profiles, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div ref={ref} className="hp-cv-templates-dropdown">
      <div className="hp-cv-templates-dropdown-head">
        <div className="hp-cv-templates-dropdown-title">CV-Vorlagen zum Ausprobieren</div>
        <p className="hp-cv-templates-dropdown-hint">
          Laden Sie eines der Beispiel-PDFs herunter und reichen Sie es über "Lebenslauf hochladen" wieder ein,
          um die KI-Analyse auf einem echten CV zu testen.
        </p>
      </div>
      <div className="hp-cv-templates-dropdown-list">
        {demoProfiles.filter(p => p.cvPdf).map(p => {
          const profile = profiles[p.id];
          return (
            <a
              key={p.id}
              href={p.cvPdf}
              download
              className="hp-cv-templates-dropdown-item"
              onClick={e => e.stopPropagation()}
            >
              {profile?.photo ? (
                <img src={profile.photo} alt={p.name} className="hp-cv-templates-dropdown-photo" />
              ) : (
                <div className="hp-cv-templates-dropdown-photo hp-cv-templates-dropdown-photo-fallback">
                  {p.initials}
                </div>
              )}
              <div className="hp-cv-templates-dropdown-info">
                <div className="hp-cv-templates-dropdown-name">
                  {p.name}
                  <span className={`hp-cv-templates-dropdown-dot score-${p.score}`} />
                </div>
                <div className="hp-cv-templates-dropdown-role">{p.role}</div>
                <div className="hp-cv-templates-dropdown-subtitle">{p.title}</div>
              </div>
              <Download size={16} className="hp-cv-templates-dropdown-icon" />
            </a>
          );
        })}
      </div>
    </div>
  );
}

export default function GlobalHeader({ currentMode, onModeChange }) {
  const { institut } = useInstitut();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cvDropdownOpen, setCvDropdownOpen] = useState(false);

  const hrData = useMemo(() => getHRData(institut.mode), [institut.mode]);

  const cvTemplates = useMemo(
    () => hrData.ui.demoProfiles.filter(p => p.cvPdf),
    [hrData]
  );

  const modes = [
    { id: 'bewerber', label: 'Bewerber-Portal', icon: UserPlus },
    { id: 'arbeitgeber', label: 'Recruiting Dashboard', icon: LayoutDashboard },
    { id: 'cockpit', label: 'HR-Cockpit', icon: Shield },
  ];

  return (
    <header className="transition-all duration-500" style={{ background: institut.colors.gradient }}>
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
              <InstitutLogo variant={institut} className="w-6 h-6 rounded object-contain bg-white" />
              <span className="text-white font-bold text-sm">{institut.institut}</span>
              {institut.mode === 'generic' && (
                <span className="text-[10px] font-semibold tracking-wide text-white/70 bg-white/15 px-1.5 py-0.5 rounded">
                  White Label
                </span>
              )}
              <ChevronDown size={14} className={clsx('text-white/60 transition-transform', dropdownOpen && 'rotate-180')} />
            </button>
            {dropdownOpen && <InstitutDropdown onClose={() => setDropdownOpen(false)} />}
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24" className="text-white">
                <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
            </div>
            <div>
              <div className="text-white text-sm font-medium">HR Pipeline</div>
              <div className="text-white/60 text-xs">KI-gestütztes Recruiting & Bewerbermanagement</div>
            </div>
          </div>

          {/* Compliance Badges */}
          <div className="flex items-center gap-2 ml-4 pl-4 border-l border-white/20">
            <span className="flex items-center gap-1 text-emerald-300 text-xs bg-white/10 px-2.5 py-1 rounded-full">
              <ShieldCheck size={13} />
              EU AI Act
            </span>
            <span className="flex items-center gap-1 text-emerald-300 text-xs bg-white/10 px-2.5 py-1 rounded-full">
              <ShieldCheck size={13} />
              DSGVO
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* CV-Vorlagen Button — nur wenn PDFs vorhanden */}
          {cvTemplates.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setCvDropdownOpen(v => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition-colors border border-white/20 text-white text-xs font-medium"
                title="CV-Vorlagen zum Testen herunterladen"
              >
                <FileText size={14} strokeWidth={1.75} />
                <span>Vorlagen</span>
                <ChevronDown size={12} className={clsx('text-white/60 transition-transform', cvDropdownOpen && 'rotate-180')} />
              </button>
              {cvDropdownOpen && (
                <CvTemplatesDropdown
                  demoProfiles={cvTemplates}
                  profiles={hrData.profiles}
                  onClose={() => setCvDropdownOpen(false)}
                />
              )}
            </div>
          )}

          <span className="text-[11px] text-white/40 tracking-wide">Demo-Umgebung — Rein synthetische Daten</span>
        </div>
      </div>

      {/* Mode Tab-Leiste */}
      <div className="px-6 flex gap-1 overflow-x-auto pb-0">
        {modes.map(mode => {
          const Icon = mode.icon;
          return (
            <button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              className={clsx(
                'flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-t-lg transition-all duration-200 whitespace-nowrap',
                currentMode === mode.id
                  ? 'bg-white text-slate-800'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              )}
            >
              <Icon size={16} strokeWidth={1.75} />
              {mode.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
