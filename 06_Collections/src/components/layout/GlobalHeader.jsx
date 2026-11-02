import { useState } from 'react';
import { clsx } from 'clsx';
import {
  Home, ChevronDown, Landmark, LayoutGrid, AlertTriangle, CheckCircle2,
  MoreHorizontal, ScanLine, Upload, Download, Printer, MessageSquare, Bot, Clock,
  Sparkles, PieChart, Activity,
} from 'lucide-react';
import { useCollections } from '../../hooks/useCollections';
import { useClickOutside } from '../ui/primitives';
import { INSTITUT, DATENSTAND } from '../../data/portfolio';
import { buildNbaQueue } from '../../data/nextBestActions';
import { datum, uhrzeit } from '../../utils/format';
import { downloadDashboardSummary } from '../../utils/exportDoc';

function getBasePath() {
  const path = window.location.pathname;
  const marker = '/06_Collections/';
  if (path.includes(marker)) return path.substring(0, path.indexOf(marker)) + '/';
  return '/';
}

export const SECTIONS = [
  { id: 'cockpit', label: 'Cockpit', icon: Sparkles, desc: 'Was mache ich heute? Briefing und nächste Aktionen' },
  { id: 'portfolio', label: 'Portfolio', icon: PieChart, desc: 'Wie steht das Buch? Segmentierung und Kundenliste', badge: '10.234', badgeTon: 'primary' },
  { id: 'risiko', label: 'Risiko', icon: Activity, desc: 'Wohin bewegt es sich? Stage 2 und Stage 3 (NPL)', badge: '2.344', badgeTon: 'danger' },
];

const BADGE_TON = {
  primary: { color: '#fff', background: 'rgba(255,255,255,0.22)' },
  danger: { color: '#fecaca', background: 'rgba(239,68,68,0.28)' },
  warning: { color: '#fde68a', background: 'rgba(245,158,11,0.26)' },
};

function NavigationDropdown({ onClose }) {
  const { section, gotoSection } = useCollections();
  const ref = useClickOutside(onClose);
  return (
    <div ref={ref} className="dropdown-menu" style={{ minWidth: 330 }}>
      <div className="dropdown-title">Navigation</div>
      {SECTIONS.map(s => {
        const Icon = s.icon;
        return (
          <button
            key={s.id}
            className={clsx('dropdown-item', section === s.id && 'active')}
            onClick={() => { gotoSection(s.id); onClose(); }}
          >
            <Icon size={17} strokeWidth={1.75} className="shrink-0 text-slate-500" />
            <span className="flex-1 min-w-0">
              <span className="block text-[13px] font-semibold leading-tight">{s.label}</span>
              <span className="block text-[11px] text-slate-500 leading-snug">{s.desc}</span>
            </span>
            {s.badge && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                {s.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function AktionenDropdown({ onClose }) {
  const { setScannerOffen, toast } = useCollections();
  const ref = useClickOutside(onClose);

  const items = [
    {
      icon: ScanLine, titel: 'Akte scannen', desc: 'Dokumente per KI analysieren',
      onClick: () => setScannerOffen(true),
    },
    {
      icon: Upload, titel: 'Import', desc: 'CSV/Excel-Daten importieren',
      onClick: () => toast('Bulk-Import wird vorbereitet …', 'info'),
    },
    {
      icon: Download, titel: 'Export', desc: 'Dashboard-Zusammenfassung als Textdatei',
      onClick: () => { downloadDashboardSummary(); toast('Dashboard-Zusammenfassung wurde heruntergeladen', 'success'); },
    },
    {
      icon: Printer, titel: 'Tool-Übersicht drucken', desc: 'Komplette Demo als Druckansicht',
      onClick: () => window.print(),
    },
  ];

  return (
    <div ref={ref} className="dropdown-menu" style={{ minWidth: 320, right: 0, left: 'auto' }}>
      <div className="dropdown-title">Aktionen</div>
      {items.map(i => {
        const Icon = i.icon;
        return (
          <button key={i.titel} className="dropdown-item" onClick={() => { i.onClick(); onClose(); }}>
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'color-mix(in srgb, var(--mode-primary) 10%, white)', color: 'var(--mode-primary)' }}
            >
              <Icon size={15} strokeWidth={1.75} />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[13px] font-semibold leading-tight">{i.titel}</span>
              <span className="block text-[11px] text-slate-500 leading-snug">{i.desc}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function GlobalHeader() {
  const {
    section, gotoSection, chatOffen, setChatOffen, feedbackOffen, setFeedbackOffen,
    nbaEntfernt, freigegeben,
  } = useCollections();
  const [navOffen, setNavOffen] = useState(false);
  const [aktionenOffen, setAktionenOffen] = useState(false);

  const queue = buildNbaQueue(nbaEntfernt, freigegeben);
  const ueberfaellig = queue.filter(q => q.ueberfaellig).length;
  const freigabenOffen = queue.filter(q => q.typ === 'freigabe').length;

  return (
    <header className="transition-all duration-500 text-white shrink-0" style={{ background: INSTITUT.gradient }}>
      <div className="px-6 pt-5 pb-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <button
            onClick={() => { window.location.href = getBasePath(); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Zurück zur Startseite"
          >
            <Home size={16} strokeWidth={1.75} />
            <span className="text-xs font-medium hidden sm:inline">Startseite</span>
          </button>

          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white/15 border border-white/20">
            <span className="w-6 h-6 rounded bg-white flex items-center justify-center shrink-0" style={{ color: INSTITUT.primary }}>
              <Landmark size={14} strokeWidth={2} />
            </span>
            <span className="text-white font-bold text-sm">{INSTITUT.name}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center">
              <LayoutGrid size={22} className="text-white" strokeWidth={1.6} />
            </div>
            <div>
              <div className="text-white text-sm font-semibold tracking-tight">Collections Management</div>
              <div className="text-white/70 text-xs">{INSTITUT.bereich}</div>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-3 ml-2 pl-4 border-l border-white/20">
            <span className="flex items-center gap-1 text-white/80 text-xs">
              <CheckCircle2 size={13} className="text-white/60" />
              {queue.length} offene Aktionen
            </span>
            <span className="flex items-center gap-1 text-amber-200 text-xs">
              <AlertTriangle size={13} />
              {ueberfaellig} überfällig
            </span>
            {freigabenOffen > 0 && (
              <span className="flex items-center gap-1 text-amber-200 text-xs">
                <Bot size={13} />
                {freigabenOffen} Freigaben
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => { setNavOffen(v => !v); setAktionenOffen(false); }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition-colors border border-white/20 text-white text-xs font-medium"
            >
              <LayoutGrid size={14} strokeWidth={1.75} />
              <span>Navigation</span>
              <ChevronDown size={12} className={clsx('text-white/60 transition-transform', navOffen && 'rotate-180')} />
            </button>
            {navOffen && <NavigationDropdown onClose={() => setNavOffen(false)} />}
          </div>

          <button
            onClick={() => setFeedbackOffen(!feedbackOffen)}
            className={clsx(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors',
              feedbackOffen ? 'bg-white text-slate-900 border-white' : 'bg-white/15 text-white border-white/20 hover:bg-white/25',
            )}
            title="Feedback und Kommentare"
          >
            <MessageSquare size={14} strokeWidth={1.75} />
            <span>Feedback</span>
          </button>

          <button
            onClick={() => setChatOffen(!chatOffen)}
            className={clsx(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors',
              chatOffen ? 'bg-white text-slate-900 border-white' : 'bg-white/15 text-white border-white/20 hover:bg-white/25',
            )}
            title="Collections Assistent"
          >
            <Bot size={14} strokeWidth={1.75} />
            <span>KI-Assistent</span>
          </button>

          <div className="relative">
            <button
              onClick={() => { setAktionenOffen(v => !v); setNavOffen(false); }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition-colors border border-white/20 text-white text-xs font-medium"
            >
              <MoreHorizontal size={14} strokeWidth={1.75} />
              <span>Aktionen</span>
              <ChevronDown size={12} className={clsx('text-white/60 transition-transform', aktionenOffen && 'rotate-180')} />
            </button>
            {aktionenOffen && <AktionenDropdown onClose={() => setAktionenOffen(false)} />}
          </div>

          <span className="hidden lg:flex items-center gap-1.5 text-[11px] text-white/50 tracking-wide">
            <Clock size={12} />
            Stand {datum(DATENSTAND)}, {uhrzeit(DATENSTAND)}
          </span>
        </div>
      </div>

      <div className="px-6 flex justify-end -mt-1 pb-1">
        <span className="text-[11px] text-white/40 tracking-wide">Demo-Umgebung — synthetische Daten</span>
      </div>

      {/* Tab-Leiste */}
      <div className="px-6 flex gap-1 overflow-x-auto pb-0">
        {SECTIONS.map(s => {
          const Icon = s.icon;
          const aktiv = section === s.id;
          return (
            <button
              key={s.id}
              onClick={() => gotoSection(s.id)}
              className={clsx(
                'flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-t-lg transition-all duration-200 whitespace-nowrap',
                aktiv ? 'bg-white text-slate-800' : 'text-white/70 hover:text-white hover:bg-white/10',
              )}
            >
              <Icon size={16} strokeWidth={1.75} />
              {s.label}
              {s.badge && (
                <span
                  className="hidden xl:inline text-[10px] font-bold px-1.5 py-0.5 rounded tabular-nums"
                  style={aktiv
                    ? { background: '#f1f5f9', color: '#475569' }
                    : BADGE_TON[s.badgeTon] || BADGE_TON.primary}
                >
                  {s.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
}
