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
    headerColor: 'bg-blue-50 text-blue-700 border-blue-200',
    badgeColor: 'bg-blue-100 text-blue-700',
    targetView: 'application',
  },
  {
    key: 'kyc',
    label: 'KYC',
    statuses: ['kyc'],
    icon: ShieldCheck,
    headerColor: 'bg-amber-50 text-amber-700 border-amber-200',
    badgeColor: 'bg-amber-100 text-amber-700',
    targetView: 'kyc',
  },
  {
    key: 'analysis',
    label: '§18 Prüfung',
    statuses: ['analysis'],
    icon: FileSearch,
    headerColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    badgeColor: 'bg-indigo-100 text-indigo-700',
    targetView: 'analysis',
  },
  {
    key: 'rating',
    label: 'Rating',
    statuses: ['rating'],
    icon: BarChart3,
    headerColor: 'bg-purple-50 text-purple-700 border-purple-200',
    badgeColor: 'bg-purple-100 text-purple-700',
    targetView: 'rating',
  },
  {
    key: 'collateral',
    label: 'Sicherheiten',
    statuses: ['collateral'],
    icon: Lock,
    headerColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    badgeColor: 'bg-cyan-100 text-cyan-700',
    targetView: 'collateral',
  },
  {
    key: 'credit-proposal',
    label: 'Kreditempfehlung',
    statuses: ['credit-proposal'],
    icon: ClipboardList,
    headerColor: 'bg-teal-50 text-teal-700 border-teal-200',
    badgeColor: 'bg-teal-100 text-teal-700',
    targetView: 'credit-proposal',
  },
  {
    key: 'voting',
    label: 'Votierung',
    statuses: ['voting', 'decision'],
    icon: Vote,
    headerColor: 'bg-orange-50 text-orange-700 border-orange-200',
    badgeColor: 'bg-orange-100 text-orange-700',
    targetView: 'decision',
  },
  {
    key: 'decided',
    label: 'Genehmigt',
    statuses: ['approved'],
    icon: CheckCircle2,
    headerColor: 'bg-green-50 text-green-700 border-green-200',
    badgeColor: 'bg-green-100 text-green-700',
    targetView: 'decision',
  },
  {
    key: 'contract',
    label: 'Kreditvertrag',
    statuses: ['contract'],
    icon: FileSignature,
    headerColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    targetView: 'contract',
  },
  {
    key: 'signature',
    label: 'Unterschrift / Rückläufer',
    statuses: ['signature_pending'],
    icon: FileSignature,
    headerColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    badgeColor: 'bg-cyan-100 text-cyan-700',
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
    headerColor: 'bg-red-50 text-red-700 border-red-200',
    badgeColor: 'bg-red-100 text-red-700',
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
      className="w-full text-left bg-surface-card border border-border rounded-md p-3 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group"
    >
      {/* Firma */}
      <p className="text-sm font-semibold font-headline text-text-primary truncate group-hover:text-primary transition-colors">
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
            className={`text-[11px] font-semibold ${
              company.status === 'approved' ? 'text-accent' : 'text-danger'
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
              className={`text-[11px] font-semibold font-mono ${slaColorClass}`}
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
              {/* Column header */}
              <div
                className={`flex items-center justify-between px-3 py-2.5 rounded-t-lg border ${col.headerColor}`}
              >
                <div className="flex items-center gap-1.5">
                  <Icon size={14} strokeWidth={1.5} />
                  <span className="text-xs font-semibold font-headline">
                    {col.label}
                  </span>
                </div>
                <span
                  className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold font-mono ${col.badgeColor}`}
                >
                  {col.companies.length}
                </span>
              </div>

              {/* Column body -- scrollable when content overflows */}
              <div className="flex-1 bg-surface border-x border-b border-border rounded-b-lg p-2 space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto">
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
