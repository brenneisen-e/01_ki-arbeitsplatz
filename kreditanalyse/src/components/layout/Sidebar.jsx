import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard, FileText, Shield, FileSearch, BarChart3,
  Lock, Gavel, Activity, ChevronLeft, ChevronRight, Building2,
  FileSignature, ClipboardList, Send, ShieldCheck,
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
  { id: 'compliance', label: 'Compliance-Sicht', icon: ShieldCheck },
];

export default function Sidebar() {
  const { state, navigate, dispatch } = useApp();
  const { currentView, sidebarCollapsed } = state;

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-surface-dark text-white flex flex-col transition-all duration-200 z-40 ${sidebarCollapsed ? 'w-16' : 'w-60'}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10 shrink-0">
        <Building2 size={24} className="text-accent shrink-0" />
        {!sidebarCollapsed && (
          <div className="min-w-0">
            <div className="text-sm font-semibold font-headline truncate">KI-Kreditanalyse</div>
            <div className="text-[10px] text-text-muted">KI Vertriebsarbeitsplatz</div>
          </div>
        )}
      </div>

      {/* Customer application button */}
      <div className="px-2 pt-4 pb-2">
        <button
          onClick={() => navigate('customer-application')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
            currentView === 'customer-application'
              ? 'bg-amber-500 text-white'
              : 'bg-amber-500/90 text-white hover:bg-amber-500'
          }`}
          title={sidebarCollapsed ? 'Kreditantrag stellen (Kundenperspektive)' : undefined}
        >
          <Send size={18} strokeWidth={1.5} className="shrink-0" />
          {!sidebarCollapsed && <span className="truncate">Kreditantrag stellen</span>}
        </button>
        {!sidebarCollapsed && (
          <p className="text-[10px] text-text-muted mt-1 px-3">Kundenperspektive</p>
        )}
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-white/10" />

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentView === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => navigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    active
                      ? 'bg-primary text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon size={18} strokeWidth={1.5} className="shrink-0" />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
        className="flex items-center justify-center h-12 border-t border-white/10 text-gray-400 hover:text-white transition-colors"
      >
        {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}
