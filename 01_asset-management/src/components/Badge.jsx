import { clsx } from 'clsx';

const STYLES = {
  // Event badges
  cashflow: 'bg-blue-100 text-blue-800',
  sod: 'bg-amber-100 text-amber-800',
  rebalance: 'bg-indigo-100 text-indigo-800',
  // Action badges
  draft: 'bg-slate-100 text-slate-600',
  'awaiting-approval': 'bg-amber-100 text-amber-800',
  'ptc-complete': 'bg-blue-100 text-blue-800',
  'publish-cash': 'bg-blue-100 text-blue-800',
  trading: 'bg-green-100 text-green-800',
  completed: 'bg-green-100 text-green-800',
  paused: 'bg-amber-100 text-amber-800',
  investigating: 'bg-indigo-100 text-indigo-800',
  optimizing: 'bg-indigo-100 text-indigo-800',
  'optimize-portfolio': 'bg-indigo-100 text-indigo-800',
  'approve-ptc-overrides': 'bg-amber-100 text-amber-800',
  'request-4-eye-check': 'bg-red-100 text-red-800',
  'send-orders': 'bg-green-100 text-green-800',
  '4-eye-check': 'bg-amber-100 text-amber-800',
  // Severity
  high: 'bg-amber-100 text-amber-800',
  medium: 'bg-indigo-100 text-indigo-800',
  low: 'bg-blue-100 text-blue-800',
  // Status
  'auto-resolved': 'bg-green-100 text-green-800',
  'manual-review': 'bg-amber-100 text-amber-800',
  active: 'bg-green-100 text-green-800',
  'trade-required': 'bg-amber-100 text-amber-800',
  'ptc-pending': 'bg-blue-100 text-blue-800',
  'sod-break': 'bg-amber-100 text-amber-800',
  rebalancing: 'bg-indigo-100 text-indigo-800',
  pending: 'bg-slate-100 text-slate-600',
  'ready-to-send': 'bg-blue-100 text-blue-800',
};

export default function Badge({ type, children, className, onClick }) {
  const key = type?.toLowerCase().replace(/\s+/g, '-') || '';
  return (
    <span
      onClick={onClick}
      className={clsx(
        'badge inline-block px-2.5 py-0.5 rounded-xl text-[15px] font-semibold',
        STYLES[key] || 'bg-slate-100 text-slate-600',
        onClick && 'cursor-pointer hover:-translate-y-px hover:shadow-md hover:brightness-95 transition-all',
        className,
      )}
    >
      {children}
    </span>
  );
}
