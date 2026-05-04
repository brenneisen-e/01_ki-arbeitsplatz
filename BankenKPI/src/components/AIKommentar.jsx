import { useMemo, useState } from 'react';
import { Sparkles, ChevronRight, RefreshCw, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { buildKommentar } from '../data/aiAnalyse';
import { AMPEL_COLORS } from '../data/kpiData';

const SEVERITY_ICONS = {
  red:    AlertTriangle,
  yellow: AlertCircle,
  green:  CheckCircle2,
  gray:   ChevronRight,
};

export default function AIKommentar({ bank }) {
  const [version, setVersion] = useState(0);
  const bullets = useMemo(() => buildKommentar(), [version]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div
        className="px-5 py-4 flex items-center justify-between text-white"
        style={{ background: bank.gradient }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
            <Sparkles size={18} strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="font-semibold">KI-Kommentar mit Querlogik</h3>
            <p className="text-xs text-white/70">
              Automatische Analyse der Abweichungen, Cross-KPI-Bezüge und Handlungsempfehlungen
            </p>
          </div>
        </div>
        <button
          onClick={() => setVersion((v) => v + 1)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition-colors text-xs font-medium"
          title="Kommentar neu generieren"
        >
          <RefreshCw size={13} strokeWidth={1.75} />
          Neu generieren
        </button>
      </div>

      <ul className="divide-y divide-slate-100">
        {bullets.map((b, i) => {
          const Icon = SEVERITY_ICONS[b.severity] || ChevronRight;
          const cfg = AMPEL_COLORS[b.severity] || AMPEL_COLORS.gray;
          return (
            <li
              key={i}
              className="px-5 py-4 flex gap-3 items-start animate-fade-in-up"
              style={{ animationDelay: i * 80 + 'ms' }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: cfg.bg, color: cfg.text }}
              >
                <Icon size={16} strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-slate-800">{b.headline}</div>
                <p className="text-sm text-slate-600 leading-relaxed mt-0.5">{b.text}</p>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center gap-2 text-xs text-slate-400">
        <Sparkles size={12} strokeWidth={1.75} />
        <span>
          Generiert aus den im Dashboard angezeigten Werten. Querlogiken berücksichtigen
          Volumen × Marge sowie RWA × Produktivität × RoRaC.
        </span>
      </div>
    </div>
  );
}
