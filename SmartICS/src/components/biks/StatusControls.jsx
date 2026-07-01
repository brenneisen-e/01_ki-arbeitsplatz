import { useState, useRef, useEffect } from 'react';
import { Circle, PencilLine, Clock, XCircle, CheckCircle2, ChevronDown, Check } from 'lucide-react';
import { BIKS_STATUS, STATUS_MAP } from '../../data/biksAgent';

const ICONS = { Circle, PencilLine, Clock, XCircle, CheckCircle2 };

export function StatusIcon({ statusId, size = 13 }) {
  const s = STATUS_MAP[statusId] || STATUS_MAP.neu;
  const Icon = ICONS[s.icon] || Circle;
  return <Icon size={size} style={{ color: s.color }} />;
}

// Kompakte, nicht interaktive Status-Anzeige
export function StatusBadge({ statusId, size = 'sm' }) {
  const s = STATUS_MAP[statusId] || STATUS_MAP.neu;
  const Icon = ICONS[s.icon] || Circle;
  const pad = size === 'sm' ? '0.14rem 0.5rem' : '0.28rem 0.7rem';
  const fs = size === 'sm' ? 11 : 12.5;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full font-semibold whitespace-nowrap"
      style={{ background: s.bg, color: s.color, border: `1px solid color-mix(in srgb, ${s.color} 30%, transparent)`, padding: pad, fontSize: fs }}
    >
      <Icon size={size === 'sm' ? 11 : 13} />
      {s.label}
    </span>
  );
}

// Interaktive Status-Auswahl (Dropdown)
export function StatusMenu({ statusId, onChange, size = 'sm', align = 'left' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const s = STATUS_MAP[statusId] || STATUS_MAP.neu;
  const Icon = ICONS[s.icon] || Circle;

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const pad = size === 'sm' ? '0.2rem 0.55rem' : '0.34rem 0.75rem';
  const fs = size === 'sm' ? 11.5 : 13;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }}
        className="inline-flex items-center gap-1.5 rounded-full font-semibold transition-shadow hover:shadow-sm"
        style={{ background: s.bg, color: s.color, border: `1px solid color-mix(in srgb, ${s.color} 32%, transparent)`, padding: pad, fontSize: fs }}
        title="Status ändern"
      >
        <Icon size={size === 'sm' ? 12 : 14} />
        {s.label}
        <ChevronDown size={12} className="opacity-60" />
      </button>
      {open && (
        <div
          className="absolute z-40 mt-1.5 rounded-xl bg-white shadow-lg p-1.5"
          style={{ border: '1px solid #E2E8F0', minWidth: 210, [align === 'right' ? 'right' : 'left']: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-2 pt-1 pb-1.5 text-[10px] font-bold tracking-wider uppercase text-slate-400">Status setzen</div>
          {BIKS_STATUS.map(opt => {
            const OptIcon = ICONS[opt.icon] || Circle;
            const active = opt.id === statusId;
            return (
              <button
                key={opt.id}
                onClick={() => { onChange(opt.id); setOpen(false); }}
                className="w-full flex items-start gap-2 px-2 py-1.5 rounded-lg text-left hover:bg-slate-50 transition-colors"
              >
                <span className="mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ background: opt.bg }}>
                  <OptIcon size={12} style={{ color: opt.color }} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-1.5">
                    <span className="text-[13px] font-semibold" style={{ color: opt.color }}>{opt.label}</span>
                    {active && <Check size={12} className="text-slate-400" />}
                  </span>
                  <span className="block text-[11px] text-slate-500 leading-snug">{opt.hint}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
