import { useMemo, Fragment } from 'react';
import {
  Inbox,
  ShieldCheck,
  FileSearch,
  BarChart3,
  Lock,
  ClipboardList,
  Vote,
  CheckCircle2,
  FileSignature,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, daysRemaining, slaColor } from '../../utils/formatters';

/**
 * Pipeline column definitions.
 * Each column maps to one or more company statuses and specifies the target
 * detail-view that cards should navigate to when clicked.
 */
const COLUMNS = [
  {
    key: 'eingegangen',
    label: 'Eingegangen',
    statuses: ['eingegangen'],
    icon: Inbox,
    punkt: 'bg-blue-500',
    targetView: 'application',
  },
  {
    key: 'kyc',
    label: 'KYC',
    statuses: ['kyc'],
    icon: ShieldCheck,
    punkt: 'bg-amber-500',
    targetView: 'kyc',
  },
  {
    key: 'analysis',
    label: '§18 Prüfung',
    statuses: ['analysis'],
    icon: FileSearch,
    punkt: 'bg-indigo-500',
    targetView: 'analysis',
  },
  {
    key: 'rating',
    label: 'Rating',
    statuses: ['rating'],
    icon: BarChart3,
    punkt: 'bg-purple-500',
    targetView: 'rating',
  },
  {
    key: 'collateral',
    label: 'Sicherheiten',
    statuses: ['collateral'],
    icon: Lock,
    punkt: 'bg-cyan-500',
    targetView: 'collateral',
  },
  {
    key: 'credit-proposal',
    label: 'Kreditempfehlung',
    statuses: ['credit-proposal'],
    icon: ClipboardList,
    punkt: 'bg-teal-500',
    targetView: 'credit-proposal',
  },
  {
    key: 'voting',
    label: 'Votierung',
    statuses: ['voting', 'decision'],
    icon: Vote,
    punkt: 'bg-orange-500',
    targetView: 'decision',
  },
  {
    key: 'decided',
    label: 'Genehmigt',
    statuses: ['approved'],
    icon: CheckCircle2,
    punkt: 'bg-green-500',
    targetView: 'decision',
  },
  {
    key: 'contract',
    label: 'Kreditvertrag',
    statuses: ['contract'],
    icon: FileSignature,
    punkt: 'bg-emerald-500',
    targetView: 'contract',
  },
  {
    key: 'signature',
    label: 'Unterschrift / Rückläufer',
    statuses: ['signature_pending'],
    icon: FileSignature,
    punkt: 'bg-cyan-500',
    targetView: 'contract',
  },
  // "Abgelehnt" ist keine Prozess-Weiterführung, sondern ein Abzweig. Deshalb
  // steht diese Spalte ganz rechts und wird durch einen vertikalen Strich
  // visuell vom restlichen Workflow getrennt.
  {
    key: 'rejected',
    label: 'Abgelehnt',
    statuses: ['rejected'],
    icon: CheckCircle2,
    punkt: 'bg-red-500',
    targetView: 'decision',
    separator: true,
  },
];

/**
 * PipelineCard -- Compact card for a single credit application inside a
 * Kanban column.  Shows firma, kredit amount, branche, bearbeiter and an
 * SLA countdown (or final decision label for decided items).
 */
function PipelineCard({ company, onSelect }) {
  const days = daysRemaining(company.faellig);
  const slaColorClass = slaColor(days);
  const isDecided =
    company.status === 'approved' || company.status === 'rejected';

  return (
    <button
      type="button"
      onClick={() => onSelect(company)}
      className="w-full text-left bg-surface-card border border-border rounded-[10px] p-3 shadow-card hover:border-primary-light hover:shadow-[var(--card-shadow-hover)] transition-[box-shadow,border-color] duration-150 cursor-pointer group"
    >
      {/* Firma */}
      <p className="text-sm font-medium font-headline text-text-primary truncate group-hover:text-primary transition-colors">
        {company.firma}
      </p>

      {/* Kredit amount */}
      <p className="text-xs font-mono text-text-primary mt-1">
        {formatCurrency(company.kredit?.betrag)}
      </p>

      {/* Branche + Bearbeiter */}
      <div className="flex items-center justify-between mt-2">
        <span className="text-[11px] text-text-muted truncate max-w-[60%]">
          {company.branche}
        </span>
        <span className="text-[11px] text-text-secondary font-medium truncate">
          {company.bearbeiter}
        </span>
      </div>

      {/* SLA countdown or decision status */}
      {isDecided ? (
        <div className="mt-2 pt-2 border-t border-border">
          <span
            className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium ${
              company.status === 'approved' ? 'bg-[var(--tint-success)] text-emerald-700' : 'bg-[var(--tint-danger)] text-red-700'
            }`}
          >
            {company.status === 'approved' ? 'Genehmigt' : 'Abgelehnt'}
          </span>
        </div>
      ) : (
        days != null && (
          <div className="mt-2 pt-2 border-t border-border flex items-center justify-between">
            <span className="text-[11px] text-text-muted">Fällig</span>
            <span
              className={`text-[11px] font-medium font-mono ${slaColorClass}`}
            >
              {days > 0
                ? `${days} Tage`
                : days === 0
                ? 'Heute'
                : `${Math.abs(days)}T überf.`}
            </span>
          </div>
        )
      )}
    </button>
  );
}

/**
 * PipelineBoard -- Kanban-style board with seven columns representing the
 * credit-application workflow stages.  Each column shows the matching
 * companies as clickable cards.
 */
export default function PipelineBoard() {
  const { state, selectAndNavigate } = useApp();
  const companies = state.companies;

  const columnData = useMemo(() => {
    return COLUMNS.map((col) => ({
      ...col,
      companies: companies.filter((c) => col.statuses.includes(c.status)),
    }));
  }, [companies]);

  const handleSelect = (company, targetView) => {
    selectAndNavigate(company.id, targetView);
  };

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-3 min-w-max items-stretch">
        {columnData.map((col) => {
          const Icon = col.icon;
          return (
            <Fragment key={col.key}>
              {col.separator && (
                <div
                  className="flex flex-col items-center justify-stretch flex-shrink-0 mx-2"
                  aria-hidden="true"
                >
                  <div className="w-px flex-1 bg-border" />
                </div>
              )}
            <div
              className="flex flex-col w-48 flex-shrink-0"
            >
              {/* Spaltenkopf: weiße Fläche, Stufe als Punkt in gedämpfter Kategoriefarbe */}
              <div className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-t-xl border border-border bg-surface-card">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${col.punkt}`} aria-hidden="true" />
                  <Icon size={14} strokeWidth={1.5} className="text-text-muted shrink-0" />
                  <span className="text-xs font-medium font-headline text-text-primary truncate">
                    {col.label}
                  </span>
                </div>
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-surface-inset text-[11px] font-medium font-mono text-text-secondary">
                  {col.companies.length}
                </span>
              </div>

              {/* Column body -- scrollable when content overflows */}
              <div className="flex-1 bg-surface-inset border-x border-b border-border rounded-b-xl p-2 space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto">
                {col.companies.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <span className="text-xs text-text-muted italic">
                      Keine Anträge
                    </span>
                  </div>
                ) : (
                  col.companies.map((company) => (
                    <PipelineCard
                      key={company.id}
                      company={company}
                      onSelect={(c) => handleSelect(c, col.targetView)}
                    />
                  ))
                )}
              </div>
            </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
