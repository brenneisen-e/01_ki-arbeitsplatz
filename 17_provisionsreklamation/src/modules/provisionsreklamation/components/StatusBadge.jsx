import { clsx } from 'clsx';
import { Clock, CheckCircle, XCircle, AlertTriangle, FileText, MessageCircle } from 'lucide-react';

const STATUS_CONFIG = {
  'Neu': {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: FileText,
  },
  'In Bearbeitung': {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: Clock,
  },
  'Geklärt': {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: CheckCircle,
  },
  'Beantwortet': {
    bg: 'bg-slate-50',
    text: 'text-slate-600',
    border: 'border-slate-200',
    icon: MessageCircle,
  },
  'Abgelehnt': {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: XCircle,
  },
  'Eskaliert': {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    icon: AlertTriangle,
  },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['Neu'];
  const Icon = config.icon;

  return (
    <span className={clsx(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
      config.bg, config.text, config.border
    )}>
      <Icon size={12} strokeWidth={2} />
      {status}
    </span>
  );
}
