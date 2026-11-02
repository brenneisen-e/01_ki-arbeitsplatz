import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import NeuerAntragDialog from './NeuerAntragDialog';
import {
  LayoutDashboard, FileText, Shield, FileSearch, BarChart3,
  Lock, Gavel, Activity, ChevronLeft, ChevronRight, Building2,
  FileSignature, ClipboardList, Send, ShieldCheck, FilePlus2, FileSpreadsheet, CheckCircle2,
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'application', label: 'Kreditantrag', icon: FileText },
  { id: 'kyc', label: 'KYC & Compliance', icon: Shield },
  { id: 'analysis', label: '§18 KWG Prüfung', icon: FileSearch },
  { id: 'rating', label: 'Rating', icon: BarChart3 },
  { id: 'collateral', label: 'Sicherheiten', icon: Lock },
  { id: 'credit-proposal', label: 'Kreditempfehlung', icon: ClipboardList },
  { id: 'decision', label: 'Kreditentscheidung', icon: Gavel },
  { id: 'contract', label: 'Kreditvertrag', icon: FileSignature },
  { id: 'monitoring', label: 'Monitoring', icon: Activity },
  // Trenner: Werkzeuge außerhalb der Prozessschritte (Konsortialkredit-PDF,
  // Kontoanlage aus dem Vertrag, Compliance-Sicht zu KI-Governance und AI Act).
  { divider: true },
  { id: 'pdf-upload', label: 'Konsortialkredit-PDF', icon: FilePlus2 },
  { id: 'kontoanlage', label: 'Vertrag → Kreditkonto', icon: FileSpreadsheet },
  { id: 'compliance', label: 'Compliance-Sicht', icon: ShieldCheck },
];

export default function Sidebar() {
  const { state, navigate, dispatch, getSelectedCompany } = useApp();
  const { currentView, sidebarCollapsed } = state;
  const vorgang = getSelectedCompany();
  const [dialogOffen, setDialogOffen] = useState(false);
  const [hinweis, setHinweis] = useState(null);

  useEffect(() => {
    if (!hinweis) return undefined;
    const t = setTimeout(() => setHinweis(null), 4500);
    return () => clearTimeout(t);
  }, [hinweis]);

  // Aus einem laufenden Vorgang heraus erst nachfragen, sonst direkt starten
  const antragStellen = () => {
    if (vorgang) setDialogOffen(true);
    else if (currentView !== 'customer-application') dispatch({ type: 'NEUEN_ANTRAG_STARTEN' });
  };
  const neuenAntragStarten = () => {
    setDialogOffen(false);
    dispatch({ type: 'NEUEN_ANTRAG_STARTEN' });
    dispatch({ type: 'ADD_NOTIFICATION', notification: { text: `Vorgang ${vorgang.firma} gespeichert` } });
    setHinweis(vorgang.firma);
  };

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-surface-card border-r border-border flex flex-col transition-all duration-200 z-40 ${sidebarCollapsed ? 'w-16' : 'w-60'}`}>
      {/* Marke: Teil der dunklen Kopfleiste (gleicher Modus-Verlauf, am Fenster ausgerichtet) */}
      <div className="kopfleiste flex items-center gap-3 px-4 h-14 shrink-0">
        <div className="w-8 h-8 rounded-lg header-glass flex items-center justify-center shrink-0">
          <Building2 size={17} strokeWidth={1.5} className="text-gold" />
        </div>
        {!sidebarCollapsed && (
          <div className="min-w-0">
            <div className="text-sm font-medium font-headline text-white truncate">KI-Kreditanalyse</div>
            <div className="text-[11px] text-white/60 truncate">KI Vertriebsarbeitsplatz</div>
          </div>
        )}
      </div>

      {/* Kundenperspektive */}
      <div className="px-3 pt-4 pb-3">
        <button
          onClick={antragStellen}
          className={`w-full flex items-center gap-3 px-3 h-10 rounded-[10px] text-sm font-medium text-white transition-colors ${
            currentView === 'customer-application' ? 'bg-amber-700' : 'bg-amber-600 hover:bg-amber-700'
          }`}
          title={sidebarCollapsed ? 'Kreditantrag stellen (Kundenperspektive)' : undefined}
        >
          <Send size={17} strokeWidth={1.5} className="shrink-0" />
          {!sidebarCollapsed && <span className="truncate">Kreditantrag stellen</span>}
        </button>
        {!sidebarCollapsed && (
          <p className="text-[11px] text-text-muted mt-1.5 px-1">Kundenperspektive</p>
        )}
      </div>

      <div className="mx-4 border-t border-border" />

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto scrollbar-thin">
        <ul className="space-y-0.5 px-3">
          {navItems.map((item, idx) => {
            if (item.divider) {
              return (
                <li key={`divider-${idx}`} className="pt-3 mt-3 border-t border-border">
                  {!sidebarCollapsed && (
                    <p className="px-3 text-[11px] uppercase tracking-wider font-medium text-text-muted mb-1.5">
                      Werkzeuge
                    </p>
                  )}
                </li>
              );
            }
            const Icon = item.icon;
            const active = currentView === item.id;
            const zustand = active
              ? 'bg-[var(--mode-pastel)] text-primary font-medium'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-inset';
            return (
              <li key={item.id}>
                <button
                  onClick={() => navigate(item.id)}
                  className={`relative w-full flex items-center gap-3 px-3 h-10 rounded-[10px] text-sm transition-colors ${zustand}`}
                  title={sidebarCollapsed ? item.label : undefined}
                  aria-current={active ? 'page' : undefined}
                >
                  {active && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-gold" aria-hidden="true" />}
                  <Icon size={17} strokeWidth={1.5} className={`shrink-0 ${active ? 'text-primary' : 'text-text-muted'}`} />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Einklappen */}
      <button
        onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
        className="flex items-center justify-center h-11 border-t border-border text-text-muted hover:text-text-primary hover:bg-surface-inset transition-colors"
        title={sidebarCollapsed ? 'Navigation ausklappen' : 'Navigation einklappen'}
      >
        {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
      {dialogOffen && vorgang && (
        <NeuerAntragDialog company={vorgang} onBestaetigen={neuenAntragStarten} onAbbrechen={() => setDialogOffen(false)} />
      )}
      {hinweis && createPortal(
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] surface-elevated rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-text-primary" role="status">
          <CheckCircle2 size={18} strokeWidth={1.75} className="text-emerald-600 shrink-0" />
          <span>Vorgang <span className="font-medium">{hinweis}</span> gespeichert – neuer Antrag gestartet.</span>
        </div>,
        document.body,
      )}
    </aside>
  );
}
