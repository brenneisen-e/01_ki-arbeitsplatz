import { useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { X } from 'lucide-react';

/** Abschnittseinleitung ueber jeder Section (Legacy: .section-intro). */
export function SectionIntro({ titel, text, aktion }) {
  return (
    <div className="flex items-start justify-between gap-6 mb-6">
      <div className="max-w-4xl">
        <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">{titel}</h2>
        {text && <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>}
      </div>
      {aktion}
    </div>
  );
}

export function Card({ className, children, ...rest }) {
  return (
    <div className={clsx('card-base', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardTitle({ children, aktion }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 pt-4 pb-3">
      <h3 className="text-sm font-semibold text-slate-800">{children}</h3>
      {aktion}
    </div>
  );
}

export function Badge({ children, color, bg, className, ...rest }) {
  return (
    <span
      className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap', className)}
      style={{ color, background: bg }}
      {...rest}
    >
      {children}
    </span>
  );
}

/** Zwei gestapelte Fortschrittsbalken fuer Willingness / Ability. */
export function WaScore({ willingness, ability, kompakt = false }) {
  const zeile = (label, wert, farbe) => (
    <div className="flex items-center gap-1.5">
      <span className="w-2.5 text-[10px] font-bold text-slate-400">{label}</span>
      <div className="h-1.5 w-14 rounded-full bg-slate-200 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${wert}%`, background: farbe }} />
      </div>
      <span className="text-[10px] font-medium text-slate-600 tabular-nums w-8">{wert} %</span>
    </div>
  );
  return (
    <div className={clsx('flex flex-col', kompakt ? 'gap-0.5' : 'gap-1')}>
      {zeile('W', willingness, '#6366f1')}
      {zeile('A', ability, '#0ea5e9')}
    </div>
  );
}

/** Modaler Dialog mit Overlay, ESC-Handling und Fokus-Rueckgabe. */
export function Modal({ offen, onClose, titel, subtitel, breite = 'max-w-5xl', kopfExtra, children, footer }) {
  const zurueck = useRef(null);

  useEffect(() => {
    if (!offen) return undefined;
    zurueck.current = document.activeElement;
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
      if (zurueck.current instanceof HTMLElement) zurueck.current.focus();
    };
  }, [offen, onClose]);

  if (!offen) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 backdrop-blur-sm p-6 animate-fade-in"
      onClick={onClose}
      role="presentation"
    >
      <div
        className={clsx('bg-white rounded-2xl shadow-2xl w-full flex flex-col max-h-[92vh] animate-scale-in', breite)}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={titel}
      >
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-slate-900 truncate">{titel}</h3>
            {subtitel && <div className="text-xs text-slate-500 mt-0.5">{subtitel}</div>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {kopfExtra}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Schließen"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-slate-200 shrink-0">{footer}</div>}
      </div>
    </div>
  );
}

/** Von rechts einfahrende Schublade (Legacy: .ehemalige-drawer). */
export function Drawer({ offen, onClose, titel, subtitel, ikone, children, footer }) {
  useEffect(() => {
    if (!offen) return undefined;
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [offen, onClose]);

  if (!offen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[70] bg-slate-950/40 animate-fade-in" onClick={onClose} role="presentation" />
      <aside
        className="fixed top-0 right-0 bottom-0 z-[71] w-[420px] bg-white shadow-2xl flex flex-col animate-slide-in-right"
        role="dialog"
        aria-modal="true"
        aria-label={titel}
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-200">
          <div className="flex items-start gap-3 min-w-0">
            {ikone && (
              <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                {ikone}
              </span>
            )}
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-slate-900">{titel}</h3>
              {subtitel && <p className="text-xs text-slate-500 mt-0.5">{subtitel}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Schließen"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-slate-200">{footer}</div>}
      </aside>
    </>
  );
}

export function EmptyState({ text }) {
  return (
    <div className="py-12 text-center text-sm text-slate-400">{text}</div>
  );
}

/** Schliesst ein Overlay, sobald ausserhalb geklickt wird. */
export function useClickOutside(onClose) {
  const ref = useRef(null);
  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);
  return ref;
}
