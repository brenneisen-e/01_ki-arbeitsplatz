import { memo } from 'react';
import { clsx } from 'clsx';

const PRIO_STYLES = {
  kritisch: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  sehr_hoch: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  hoch: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  mittel: 'bg-teal-50 text-teal-700 border-teal-200',
  niedrig: 'bg-gray-50 text-gray-600 border-gray-200',
};

const PRIO_LABELS = {
  kritisch: 'Sehr hoch',
  sehr_hoch: 'Sehr hoch',
  hoch: 'Hoch',
  mittel: 'Mittel',
  niedrig: 'Niedrig',
};

const QUELLEN_STYLES = {
  finanztransaktion: 'bg-emerald-50 text-emerald-700',
  bestand: 'bg-blue-50 text-blue-700',
  kommunikation: 'bg-violet-50 text-violet-700',
  wettbewerb: 'bg-amber-50 text-amber-700',
  lebensereignis: 'bg-pink-50 text-pink-700',
  direktvertrieb: 'bg-cyan-50 text-cyan-700',
  markt: 'bg-gray-50 text-gray-600',
};

const SPARTEN_STYLES = {
  leben: 'bg-blue-100 text-blue-700',
  kranken: 'bg-emerald-100 text-emerald-700',
  schaden: 'bg-violet-100 text-violet-700',
  kfz: 'bg-amber-100 text-amber-700',
};

const STATUS_STYLES = {
  aktiv: 'bg-emerald-50 text-emerald-700',
  optimierbar: 'bg-amber-50 text-amber-700',
  policiert: 'bg-emerald-50 text-emerald-700',
  ausgezahlt: 'bg-emerald-50 text-emerald-700',
  vermittelt: 'bg-blue-50 text-blue-700',
  eroeffnet: 'bg-emerald-50 text-emerald-700',
  genehmigt: 'bg-teal-50 text-teal-700',
  onboarding: 'bg-blue-50 text-blue-700',
  beantragt: 'bg-blue-50 text-blue-700',
  storniert: 'bg-red-50 text-red-600',
};

export const PrioBadge = memo(function PrioBadge({ prioritaet }) {
  return (
    <span className={clsx('rh-badge inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border', PRIO_STYLES[prioritaet] || PRIO_STYLES.niedrig)}>
      {PRIO_LABELS[prioritaet] || prioritaet.charAt(0).toUpperCase() + prioritaet.slice(1)}
    </span>
  );
});

export const QuellenBadge = memo(function QuellenBadge({ quelle }) {
  const label = {
    finanztransaktion: 'FinTx',
    bestand: 'Best.',
    kommunikation: 'Komm.',
    wettbewerb: 'Wettb.',
    lebensereignis: 'Leben.',
    direktvertrieb: 'Direktvertrieb',
    markt: 'Markt',
  };
  const display = label[quelle] || (quelle ? quelle.charAt(0).toUpperCase() + quelle.slice(1) : '');
  return (
    <span className={clsx('rh-badge inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium', QUELLEN_STYLES[quelle] || QUELLEN_STYLES.markt)}>
      {display}
    </span>
  );
});

export const SparteBadge = memo(function SparteBadge({ sparte }) {
  return (
    <span className={clsx('rh-badge inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', SPARTEN_STYLES[sparte] || 'bg-gray-100 text-gray-600')}>
      {sparte.charAt(0).toUpperCase() + sparte.slice(1)}
    </span>
  );
});

export const StatusBadge = memo(function StatusBadge({ status }) {
  return (
    <span className={clsx('rh-badge inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', STATUS_STYLES[status] || 'bg-gray-100 text-gray-600')}>
      {status === 'optimierbar' ? '\u26a0 Optim.' : status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
});
