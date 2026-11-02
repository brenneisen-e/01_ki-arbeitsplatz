import { clsx } from 'clsx';
import { AlertCircle, AlertTriangle, Check, Info, X } from 'lucide-react';
import { useCollections } from '../../hooks/useCollections';

const STIL = {
  success: { icon: Check, ring: 'ring-emerald-200', bg: 'bg-emerald-50', text: 'text-emerald-800', iconColor: 'text-emerald-600' },
  error: { icon: AlertCircle, ring: 'ring-red-200', bg: 'bg-red-50', text: 'text-red-800', iconColor: 'text-red-600' },
  warning: { icon: AlertTriangle, ring: 'ring-amber-200', bg: 'bg-amber-50', text: 'text-amber-900', iconColor: 'text-amber-600' },
  info: { icon: Info, ring: 'ring-slate-200', bg: 'bg-white', text: 'text-slate-800', iconColor: 'text-slate-500' },
};

/** Ersetzt das Legacy-showNotification(). */
export default function Toasts() {
  const { toasts, schliesseToast } = useCollections();
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[95] flex flex-col gap-2 w-[min(520px,90vw)]" role="status" aria-live="polite">
      {toasts.map(t => {
        const s = STIL[t.art] || STIL.info;
        const Icon = s.icon;
        return (
          <div
            key={t.id}
            className={clsx('flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg ring-1 animate-fade-in-up', s.ring, s.bg, s.text)}
          >
            <Icon size={17} className={clsx('shrink-0 mt-0.5', s.iconColor)} strokeWidth={2} />
            <span className="text-sm leading-snug flex-1">{t.text}</span>
            <button
              onClick={() => schliesseToast(t.id)}
              className="shrink-0 opacity-50 hover:opacity-100 transition-opacity"
              aria-label="Meldung schließen"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
