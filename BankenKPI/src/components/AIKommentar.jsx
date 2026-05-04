import { useMemo, useState } from 'react';
import {
  Sparkles, ChevronRight, RefreshCw, AlertTriangle, AlertCircle, CheckCircle2,
  Lightbulb, Globe2, Building2,
} from 'lucide-react';
import { buildKommentar } from '../data/aiAnalyse';
import { AMPEL_COLORS } from '../data/kpiData';
import RichText from './RichText';

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
              Branchenkontext, Produkt-Know-how und Cross-KPI-Bezüge
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
              className="px-5 py-5 flex gap-4 items-start animate-fade-in-up"
              style={{ animationDelay: i * 80 + 'ms' }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: cfg.bg, color: cfg.text }}
              >
                <Icon size={17} strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-slate-900 mb-1">{b.headline}</div>
                <RichText className="text-sm text-slate-700 leading-relaxed block mb-3">
                  {b.text}
                </RichText>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  {b.externalEffects?.length > 0 && (
                    <div className="bg-slate-50 rounded-lg px-4 py-3 border border-slate-200">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                        <Globe2 size={12} strokeWidth={2} />
                        Externe Effekte
                      </div>
                      <ul className="space-y-1.5">
                        {b.externalEffects.map((c, ci) => (
                          <li key={ci} className="text-sm text-slate-700 leading-relaxed flex gap-2">
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0 mt-2"
                              style={{ background: '#64748b' }}
                            />
                            <RichText>{c}</RichText>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {b.internalEffects?.length > 0 && (
                    <div className="rounded-lg px-4 py-3 border" style={{ background: '#f8fafc', borderColor: bank.primary + '40' }}>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: bank.primary }}>
                        <Building2 size={12} strokeWidth={2} />
                        Interne Effekte
                      </div>
                      <ul className="space-y-1.5">
                        {b.internalEffects.map((c, ci) => (
                          <li key={ci} className="text-sm text-slate-700 leading-relaxed flex gap-2">
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0 mt-2"
                              style={{ background: bank.primary }}
                            />
                            <RichText>{c}</RichText>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {b.recommendation && (
                  <div className="bg-slate-50 rounded-lg px-4 py-3 border border-slate-200 flex items-start gap-2">
                    <Lightbulb size={16} strokeWidth={1.75} className="text-slate-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Handlungsempfehlung
                      </div>
                      <RichText className="text-sm text-slate-700 leading-relaxed block">
                        {b.recommendation}
                      </RichText>
                    </div>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center gap-2 text-xs text-slate-400">
        <Sparkles size={12} strokeWidth={1.75} />
        <span>
          Generiert aus den im Dashboard angezeigten Werten. Trennung in <strong className="text-slate-600">Externe Effekte</strong>
          {' '}(Markt, Regulatorik, Wettbewerb) und <strong className="text-slate-600">Interne Effekte</strong>
          {' '}(eigene Aktionen, Pricing-Entscheidungen, Pipeline-Lage).
        </span>
      </div>
    </div>
  );
}
