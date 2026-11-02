import { memo } from 'react';
import { clsx } from 'clsx';
import { AlertTriangle } from 'lucide-react';

/* Alle Badges: zart getönte Fläche, dunkler Text in der Statusfarbe, kein
   Rahmen in Signalfarbe. Die Tailwind-Signalstufen liegen auf den gedämpften
   Cockpit-Tönen; Quellen und Sparten nehmen ihre Tokens direkt. */

const BADGE_BASE = 'rh-badge inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium';

const PRIO_STYLES = {
  kritisch: 'bg-emerald-100 text-emerald-800',
  sehr_hoch: 'bg-emerald-100 text-emerald-800',
  hoch: 'bg-emerald-50 text-emerald-700',
  mittel: 'bg-teal-50 text-teal-700',
  niedrig: 'bg-slate-100 text-slate-600',
};

const PRIO_LABELS = {
  kritisch: 'Sehr hoch',
  sehr_hoch: 'Sehr hoch',
  hoch: 'Hoch',
  mittel: 'Mittel',
  niedrig: 'Niedrig',
};

// Quellen-Farben (OPT-19) aus den Tokens: Text in der Quellenfarbe, Fläche
// als 10-%-Tönung derselben Farbe.
const QUELLEN_TOKENS = {
  finanztransaktion: '--quelle-finanztransaktion',
  bestand: '--quelle-bestand',
  kommunikation: '--quelle-kommunikation',
  wettbewerb: '--quelle-wettbewerb',
  lebensereignis: '--quelle-lebensereignis',
  direktvertrieb: '--quelle-bestand',
  markt: '--quelle-markt',
};

const SPARTEN_TOKENS = {
  leben: '--sparte-leben',
  kranken: '--sparte-kranken',
  schaden: '--sparte-schaden',
  kfz: '--sparte-kfz',
};

function tintStyle(token) {
  return {
    color: `var(${token})`,
    backgroundColor: `color-mix(in srgb, var(${token}) 10%, transparent)`,
  };
}

const STATUS_STYLES = {
  aktiv: 'bg-(--tint-success) text-(--color-success)',
  optimierbar: 'bg-(--tint-warning) text-(--color-warning)',
  policiert: 'bg-(--tint-success) text-(--color-success)',
  ausgezahlt: 'bg-(--tint-success) text-(--color-success)',
  vermittelt: 'bg-(--tint-info) text-(--color-info)',
  eroeffnet: 'bg-(--tint-success) text-(--color-success)',
  genehmigt: 'bg-(--tint-success) text-(--color-success)',
  onboarding: 'bg-(--tint-info) text-(--color-info)',
  beantragt: 'bg-(--tint-info) text-(--color-info)',
  storniert: 'bg-(--tint-danger) text-(--color-danger)',
};

export const PrioBadge = memo(function PrioBadge({ prioritaet }) {
  return (
    <span className={clsx(BADGE_BASE, PRIO_STYLES[prioritaet] || PRIO_STYLES.niedrig)}>
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
    <span
      className="rh-badge inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium"
      style={tintStyle(QUELLEN_TOKENS[quelle] || QUELLEN_TOKENS.markt)}
    >
      {display}
    </span>
  );
});

export const SparteBadge = memo(function SparteBadge({ sparte }) {
  const token = SPARTEN_TOKENS[sparte];
  return (
    <span
      className={clsx(BADGE_BASE, !token && 'bg-slate-100 text-slate-600')}
      style={token ? tintStyle(token) : undefined}
    >
      {sparte.charAt(0).toUpperCase() + sparte.slice(1)}
    </span>
  );
});

export const StatusBadge = memo(function StatusBadge({ status }) {
  return (
    <span className={clsx(BADGE_BASE, STATUS_STYLES[status] || 'bg-slate-100 text-slate-600')}>
      {status === 'optimierbar' ? (
        <>
          <AlertTriangle size={11} strokeWidth={2} aria-hidden="true" />
          Optim.
        </>
      ) : (
        status.charAt(0).toUpperCase() + status.slice(1)
      )}
    </span>
  );
});
