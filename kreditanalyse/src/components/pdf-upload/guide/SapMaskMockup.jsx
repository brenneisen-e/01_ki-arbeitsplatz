/**
 * SapMaskMockup.jsx
 *
 * Stilisierte Nachbildung einer SAP-Fiori-Maske aus dem
 * "Finanzierungsarbeitsplatz" (SAP S/4HANA Banking for Complex Loans).
 * Wir verwenden bewusst KEINE echten SAP-Screenshots aus dem Handbuch
 * (Urheberrecht), sondern bauen die Maske als HTML/CSS nach. So können
 * wir das Zielfeld direkt visuell hervorheben.
 *
 * Props:
 *   - title:           Titel der Maske (z.B. "Finanzierung anlegen")
 *   - breadcrumb:      Pfad der Fiori-Navigation
 *   - tabs:            Array der Registerkarten, eine davon hat `active: true`
 *   - fields:          Array der sichtbaren Felder { label, value, highlight? }
 *   - highlightedNote: Optionaler Callout-Text unter dem Highlight
 */

import { ChevronRight } from 'lucide-react';

export default function SapMaskMockup({ title, breadcrumb, tabs, fields, highlightedNote }) {
  return (
    <div className="rounded-lg border border-slate-200 shadow-sm overflow-hidden bg-white">
      {/* SAP-Fiori-Titelleiste */}
      <div className="bg-[#354a5f] px-4 py-2 flex items-center gap-3">
        <span className="text-[11px] font-semibold tracking-wider text-white/80 uppercase">
          SAP S/4HANA
        </span>
        <span className="text-[11px] text-white/50">Finanzierungsarbeitsplatz</span>
      </div>

      {/* Breadcrumb */}
      {breadcrumb && breadcrumb.length > 0 && (
        <div className="px-4 py-2 text-[11px] text-slate-500 font-body bg-slate-50 border-b border-slate-200 flex items-center gap-1 flex-wrap">
          {breadcrumb.map((b, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight size={10} className="text-slate-400" />}
              <span className={i === breadcrumb.length - 1 ? 'text-slate-700 font-semibold' : ''}>
                {b}
              </span>
            </span>
          ))}
        </div>
      )}

      {/* Maskentitel */}
      <div className="px-4 pt-3 pb-2">
        <h4 className="text-sm font-semibold text-slate-800 font-headline">{title}</h4>
      </div>

      {/* Registerkarten */}
      {tabs && tabs.length > 0 && (
        <div className="px-2 border-b border-slate-200 flex items-end gap-0 overflow-x-auto scrollbar-thin">
          {tabs.map((tab, i) => (
            <div
              key={i}
              className={
                'px-3 py-2 text-[11px] font-body whitespace-nowrap border-b-2 transition-colors ' +
                (tab.active
                  ? 'border-[#0a6ed1] text-[#0a6ed1] font-semibold bg-blue-50/40'
                  : 'border-transparent text-slate-500')
              }
            >
              {tab.label}
            </div>
          ))}
        </div>
      )}

      {/* Feldgitter */}
      <div className="p-4 bg-slate-50/40">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
          {fields.map((f, i) => (
            <div key={i} className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-wide text-slate-500 font-body">
                {f.label}
              </label>
              <div
                className={
                  'text-[12px] font-mono px-2 py-1.5 rounded border transition-colors ' +
                  (f.highlight
                    ? 'bg-amber-50 border-amber-400 text-slate-900 ring-2 ring-amber-300/60 shadow-sm'
                    : 'bg-white border-slate-300 text-slate-700')
                }
              >
                {f.value || <span className="text-slate-300">–</span>}
              </div>
              {f.highlight && highlightedNote && (
                <p className="text-[10px] text-amber-700 font-body mt-0.5">{highlightedNote}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
