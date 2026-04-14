import { useState, useMemo, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import StepCompleteBar from '../shared/StepCompleteBar';
import {
  ArrowLeft,
  FileCheck,
  Users,
  ShieldAlert,
  SearchCheck,
  Upload,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Shield,
  Search,
  Loader2,
  Info,
  FileText,
  Calendar,
  User,
  MessageSquare,
  Building2,
  CheckCheck,
  CircleDot,
} from 'lucide-react';

// =============================================================================
// Constants
// =============================================================================

const TABS = [
  { id: 'identifizierung', label: 'Identifizierung & Legitimation', icon: FileCheck },
  { id: 'ubo', label: 'UBO-Ermittlung', icon: Users },
  { id: 'pep', label: 'PEP-Screening', icon: ShieldAlert },
  { id: 'sanktion', label: 'Sanktionslistenprüfung', icon: SearchCheck },
];

const DOCUMENT_STATUS_OPTIONS = [
  { value: 'offen', label: 'Offen', color: 'bg-gray-100 text-gray-700' },
  { value: 'eingereicht', label: 'Eingereicht', color: 'bg-blue-100 text-blue-700' },
  { value: 'geprueft', label: 'Geprüft', color: 'bg-green-100 text-green-700' },
  { value: 'mangel', label: 'Mangel', color: 'bg-red-100 text-red-700' },
];

// Dynamic date helper: returns a date N days ago as YYYY-MM-DD
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

const INITIAL_CHECKLIST = [
  { id: 'hrAuszug', name: 'Handelsregisterauszug (max. 3 Monate alt)', status: 'geprueft', checked: true, pruefDatum: daysAgo(4), pruefer: 'KM', comment: 'Aktuell, keine Beanstandung', kiGeprueft: true },
  { id: 'gesellschaftsvertrag', name: 'Gesellschaftsvertrag / Satzung (aktuell)', status: 'geprueft', checked: true, pruefDatum: daysAgo(4), pruefer: 'KM', comment: 'KI-Extraktion der Gesellschafterstruktur, manuell freigegeben', kiGeprueft: true },
  { id: 'gesellschafterliste', name: 'Gesellschafterliste (aktuell)', status: 'eingereicht', checked: false, pruefDatum: daysAgo(1), pruefer: '', comment: 'KI-Scan erfolgt, wartet auf menschliche Freigabe', kiGeprueft: true },
  { id: 'transparenzregister', name: 'Transparenzregisterauszug', status: 'geprueft', checked: true, pruefDatum: daysAgo(2), pruefer: 'KM', comment: 'Abgleich erfolgt', kiGeprueft: true },
  { id: 'legGF1', name: 'Legitimation GF 1 (Ausweiskopie)', status: 'geprueft', checked: true, pruefDatum: daysAgo(6), pruefer: 'SB', comment: '', kiGeprueft: true },
  { id: 'legGF2', name: 'Legitimation GF 2 (falls vorhanden)', status: 'offen', checked: false, pruefDatum: '', pruefer: '', comment: '', kiGeprueft: false },
  { id: 'gewerbe', name: 'Gewerbeanmeldung/-ummeldung', status: 'eingereicht', checked: false, pruefDatum: daysAgo(1), pruefer: '', comment: 'KI-Scan erfolgt, wartet auf menschliche Freigabe', kiGeprueft: true },
];

const PEP_CATEGORIES = [
  'Staatschef / Regierungschef',
  'Regierungsmitglied (Minister)',
  'Parlamentsabgeordneter',
  'Mitglied oberster Gerichte',
  'Mitglied Rechnungshof',
  'Zentralbankrat',
  'Botschafter / Geschäftsträger',
  'Höherer Offizier (Streitkräfte)',
  'Leitungsorgan staatl. Unternehmen',
];

const UBO_BERECHTIGUNG_OPTIONS = [
  'Kapitalanteile',
  'Stimmrechte',
  'Kontrolle auf sonstige Weise',
];

const LEGITIMATION_STATUS_OPTIONS = [
  { value: 'offen', label: 'Offen' },
  { value: 'eingereicht', label: 'Eingereicht' },
  { value: 'geprueft', label: 'Geprüft' },
];

const SANCTION_LISTS = [
  { id: 'eu_cfsp', label: 'EU CFSP' },
  { id: 'ofac_sdn', label: 'OFAC SDN' },
  { id: 'un_sc', label: 'UN Security Council' },
  { id: 'national', label: 'Nationale Terrorismusliste' },
];


// =============================================================================
// Main Component
// =============================================================================

export default function KYCView() {
  const { state, navigate, getSelectedCompany } = useApp();
  const company = getSelectedCompany();

  const [activeTab, setActiveTab] = useState('identifizierung');

  // ---- Checklist state (Tab 1) ----
  const [checklist, setChecklist] = useState(INITIAL_CHECKLIST);
  const [expandedItem, setExpandedItem] = useState(null);

  // ---- UBO state (Tab 2) ----
  const [uboDetails, setUboDetails] = useState({});

  // ---- PEP state (Tab 3) ----
  const [pepResults, setPepResults] = useState({});

  // ---- Sanctions state (Tab 4) ----
  const [sanctionChecked, setSanctionChecked] = useState(false);
  const [sanctionLoading, setSanctionLoading] = useState(false);
  const [sanctionResults, setSanctionResults] = useState(null);

  // ---------------------------------------------------------------------------
  // No company selected fallback
  // ---------------------------------------------------------------------------
  if (!state.selectedCompanyId || !company) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-32 space-y-6">
        <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center">
          <ArrowLeft size={28} strokeWidth={1.5} className="text-text-muted" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-lg font-semibold font-headline text-text-primary">
            Kein Kreditantrag ausgewählt
          </h2>
          <p className="text-sm font-body text-text-secondary max-w-md">
            Bitte wähle einen Kreditantrag im Dashboard aus, um die KYC &amp; Compliance-Prüfung durchzuführen.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('dashboard')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium font-body hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Zurück zum Dashboard
        </button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Compliance traffic-light logic
  // ---------------------------------------------------------------------------
  const complianceStatus = (() => {
    const total = checklist.length;
    const pruefCount = checklist.filter(i => i.status === 'geprueft').length;
    const mangelCount = checklist.filter(i => i.status === 'mangel').length;

    if (mangelCount > 0) return 'red';
    if (pruefCount === total) return 'green';
    return 'yellow';
  })();

  const complianceLabels = {
    green: 'Vollständig, keine Treffer',
    yellow: 'Unterlagen ausstehend oder Review erforderlich',
    red: 'Treffer oder schwere Mängel',
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <ShieldAlert size={20} strokeWidth={1.5} className="text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold font-headline text-text-primary">
            KYC &amp; Compliance
          </h1>
          <p className="text-sm font-body text-text-secondary">
            {company.firma} &middot; {company.rechtsform}
          </p>
        </div>
      </div>

      {/* ================================================================== */}
      {/* Tab Navigation -- pill buttons                                      */}
      {/* ================================================================== */}
      <div className="flex flex-wrap gap-2 bg-surface-card border border-border rounded-xl p-1.5">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium font-body transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:bg-surface hover:text-text-primary'
              }`}
            >
              <Icon size={16} strokeWidth={1.5} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ================================================================== */}
      {/* Tab Content                                                         */}
      {/* ================================================================== */}
      <div className="bg-surface-card border border-border rounded-xl p-6">
        {activeTab === 'identifizierung' && (
          <IdentifizierungTab
            checklist={checklist}
            setChecklist={setChecklist}
            expandedItem={expandedItem}
            setExpandedItem={setExpandedItem}
          />
        )}
        {activeTab === 'ubo' && (
          <UBOTab
            company={company}
            uboDetails={uboDetails}
            setUboDetails={setUboDetails}
          />
        )}
        {activeTab === 'pep' && (
          <PEPTab
            company={company}
            pepResults={pepResults}
            setPepResults={setPepResults}
          />
        )}
        {activeTab === 'sanktion' && (
          <SanktionTab
            company={company}
            sanctionChecked={sanctionChecked}
            setSanctionChecked={setSanctionChecked}
            sanctionLoading={sanctionLoading}
            setSanctionLoading={setSanctionLoading}
            sanctionResults={sanctionResults}
            setSanctionResults={setSanctionResults}
          />
        )}
      </div>

      {/* ================================================================== */}
      {/* Compliance-Gesamtampel                                              */}
      {/* ================================================================== */}
      <ComplianceTrafficLight status={complianceStatus} label={complianceLabels[complianceStatus]} />

      <StepCompleteBar currentStep="kyc" />
    </div>
  );
}


// =============================================================================
// Tab 1: Identifizierung & Legitimation
// =============================================================================

function IdentifizierungTab({ checklist, setChecklist, expandedItem, setExpandedItem }) {
  const completedCount = checklist.filter(i => i.status === 'geprueft').length;

  const updateItem = useCallback((id, updates) => {
    setChecklist(prev => prev.map(item => (item.id === id ? { ...item, ...updates } : item)));
  }, [setChecklist]);

  const toggleExpand = useCallback((id) => {
    setExpandedItem(prev => (prev === id ? null : id));
  }, [setExpandedItem]);

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold font-headline text-text-primary">
            Identifizierung &amp; Legitimation
          </h2>
          <p className="text-sm font-body text-text-muted mt-0.5">
            Dokumenten-Checkliste gemäß GwG / KWG-Anforderungen
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-body">
          <CheckCheck size={16} strokeWidth={1.5} className="text-green-600" />
          <span className="text-text-secondary">
            {completedCount} / {checklist.length} geprüft
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-surface rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${(completedCount / checklist.length) * 100}%` }}
        />
      </div>

      {/* Checklist items */}
      <div className="space-y-2">
        {checklist.map(item => {
          const isExpanded = expandedItem === item.id;
          const statusOption = DOCUMENT_STATUS_OPTIONS.find(o => o.value === item.status);

          return (
            <div
              key={item.id}
              className={`border rounded-lg transition-all ${
                item.status === 'geprueft'
                  ? 'border-green-200 bg-green-50/30'
                  : item.status === 'mangel'
                  ? 'border-red-200 bg-red-50/30'
                  : 'border-border bg-white'
              }`}
            >
              {/* Compact row */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
                onClick={() => toggleExpand(item.id)}
              >
                {/* Checkbox */}
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    updateItem(item.id, { checked: !item.checked });
                  }}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                    item.checked
                      ? 'bg-primary border-primary text-white'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {item.checked && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>

                {/* Document name */}
                <span className="flex-1 text-sm font-body text-text-primary">
                  {item.name}
                </span>

                {/* Status badge */}
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium font-body ${statusOption?.color || 'bg-gray-100 text-gray-700'}`}>
                  {statusOption?.label || item.status}
                </span>

                {/* KI geprüft badge */}
                {item.kiGeprueft && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-violet-100 text-violet-700 border border-violet-200"
                    title="Dokument wurde von der KI geprüft (OCR + Plausibilisierung) und wird durch einen Mitarbeiter freigegeben (Human-in-the-Loop)"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                    KI geprüft · menschliche Freigabe
                  </span>
                )}

                {/* Date indicator if checked */}
                {item.pruefDatum && (
                  <span className="text-xs font-mono text-text-muted hidden sm:inline">
                    {new Date(item.pruefDatum).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </span>
                )}

                {/* Expand chevron */}
                {isExpanded ? (
                  <ChevronDown size={16} strokeWidth={1.5} className="text-text-muted shrink-0" />
                ) : (
                  <ChevronRight size={16} strokeWidth={1.5} className="text-text-muted shrink-0" />
                )}
              </div>

              {/* Expanded detail area */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-border/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                    {/* Status dropdown */}
                    <div>
                      <label className="block text-xs font-medium font-body text-text-muted mb-1">
                        Status
                      </label>
                      <select
                        value={item.status}
                        onChange={e => updateItem(item.id, { status: e.target.value })}
                        className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm font-body text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      >
                        {DOCUMENT_STATUS_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Prüfdatum */}
                    <div>
                      <label className="block text-xs font-medium font-body text-text-muted mb-1">
                        <span className="inline-flex items-center gap-1">
                          <Calendar size={12} strokeWidth={1.5} />
                          Prüfdatum
                        </span>
                      </label>
                      <input
                        type="date"
                        value={item.pruefDatum}
                        onChange={e => updateItem(item.id, { pruefDatum: e.target.value })}
                        className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm font-mono text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      />
                    </div>

                    {/* Prüfer-Kürzel */}
                    <div>
                      <label className="block text-xs font-medium font-body text-text-muted mb-1">
                        <span className="inline-flex items-center gap-1">
                          <User size={12} strokeWidth={1.5} />
                          Prüfer-Kürzel
                        </span>
                      </label>
                      <input
                        type="text"
                        value={item.pruefer}
                        onChange={e => updateItem(item.id, { pruefer: e.target.value })}
                        placeholder="z.B. KM"
                        maxLength={4}
                        className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm font-mono text-text-primary uppercase focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      />
                    </div>

                    {/* Upload area */}
                    <div>
                      <label className="block text-xs font-medium font-body text-text-muted mb-1">
                        Dokument
                      </label>
                      <div className="flex items-center justify-center gap-2 w-full rounded-lg border-2 border-dashed border-border bg-surface px-3 py-2 text-sm font-body text-text-muted cursor-pointer hover:border-primary/40 hover:text-primary transition-colors">
                        <Upload size={14} strokeWidth={1.5} />
                        <span>Hochladen</span>
                      </div>
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="mt-3">
                    <label className="block text-xs font-medium font-body text-text-muted mb-1">
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare size={12} strokeWidth={1.5} />
                        Anmerkung
                      </span>
                    </label>
                    <textarea
                      value={item.comment}
                      onChange={e => updateItem(item.id, { comment: e.target.value })}
                      placeholder="Optionaler Kommentar..."
                      rows={2}
                      className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm font-body text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


// =============================================================================
// Tab 2: UBO-Ermittlung
// =============================================================================

function UBOTab({ company, uboDetails, setUboDetails }) {
  const shareholders = company.gf || [];
  const ubos = shareholders.filter(s => (s.anteil || 0) > 25);
  const hasNoUbo = ubos.length === 0;

  const getDetail = useCallback((name, field) => {
    return uboDetails[name]?.[field] || '';
  }, [uboDetails]);

  const setDetail = useCallback((name, field, value) => {
    setUboDetails(prev => ({
      ...prev,
      [name]: { ...(prev[name] || {}), [field]: value },
    }));
  }, [setUboDetails]);

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold font-headline text-text-primary">
            UBO-Ermittlung
          </h2>
          <p className="text-sm font-body text-text-muted mt-0.5">
            Wirtschaftlich Berechtigte gemäß §3 GwG ermitteln und dokumentieren
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-violet-100 text-violet-700 border border-violet-200">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          Durch KI geprüft
        </span>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Ownership Structure Visualization                                   */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-surface rounded-xl p-6">
        <h3 className="text-sm font-semibold font-headline text-text-secondary mb-6 uppercase tracking-wide">
          Beteiligungsstruktur
        </h3>

        <div className="flex flex-col items-center">
          {/* Company node */}
          <div className="flex items-center gap-3 bg-primary/10 border-2 border-primary rounded-xl px-6 py-3">
            <Building2 size={20} strokeWidth={1.5} className="text-primary" />
            <div>
              <div className="text-sm font-semibold font-headline text-text-primary">
                {company.firma}
              </div>
              <div className="text-xs font-body text-text-muted">
                {company.rechtsform} &middot; {company.branche}
              </div>
            </div>
          </div>

          {/* Connector line down */}
          <div className="w-px h-8 bg-border" />

          {/* Horizontal connector bar */}
          {shareholders.length > 1 && (
            <div className="relative w-full max-w-2xl">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px bg-border" style={{ width: `${Math.min(90, shareholders.length * 30)}%` }} />
            </div>
          )}

          {/* Shareholder nodes */}
          <div className="flex flex-wrap justify-center gap-6 mt-0">
            {shareholders.map((sh, idx) => {
              const isUbo = (sh.anteil || 0) > 25;
              return (
                <div key={idx} className="flex flex-col items-center">
                  {/* Connector line from bar */}
                  {shareholders.length > 1 && <div className="w-px h-6 bg-border" />}

                  <div className={`relative rounded-xl border-2 px-5 py-4 min-w-[200px] text-center transition-all ${
                    isUbo
                      ? 'border-green-400 bg-green-50 shadow-sm'
                      : 'border-border bg-white'
                  }`}>
                    {/* UBO shield badge */}
                    {isUbo && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 bg-green-500 text-white text-[10px] font-bold font-body uppercase tracking-wider rounded-full px-2.5 py-0.5">
                        <Shield size={10} strokeWidth={1.5} />
                        UBO
                      </div>
                    )}

                    <div className="w-10 h-10 rounded-full bg-surface mx-auto mb-2 flex items-center justify-center">
                      <User size={18} strokeWidth={1.5} className="text-text-muted" />
                    </div>
                    <div className="text-sm font-semibold font-body text-text-primary">
                      {sh.name}
                    </div>
                    <div className="text-xs font-body text-text-muted mt-0.5">
                      {sh.funktion}
                    </div>
                    <div className={`text-lg font-bold font-mono mt-1 ${
                      isUbo ? 'text-green-700' : 'text-text-primary'
                    }`}>
                      {sh.anteil}%
                    </div>
                    <div className="text-[11px] font-body text-text-muted mt-1">
                      seit {sh.seit}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Fallback note for fiktiver wB */}
          {hasNoUbo && (
            <div className="mt-6 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 max-w-lg">
              <AlertTriangle size={16} strokeWidth={1.5} className="text-amber-600 mt-0.5 shrink-0" />
              <div className="text-sm font-body text-amber-800">
                <strong>Hinweis:</strong> Kein Gesellschafter hält mehr als 25 % der Anteile.
                Gemäß §3 Abs. 2 GwG ist der gesetzliche Vertreter (fiktiver wirtschaftlich
                Berechtigter) zu dokumentieren.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* UBO Detail Table                                                    */}
      {/* ------------------------------------------------------------------ */}
      <div>
        <h3 className="text-sm font-semibold font-headline text-text-secondary mb-3 uppercase tracking-wide">
          UBO-Detaildaten
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Name</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Geburtsdatum</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Geburtsort</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Staatsangehörigkeit</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Wohnanschrift</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Art d. Berechtigung</th>
                <th className="text-center py-2 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Anteil %</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Legitimation</th>
              </tr>
            </thead>
            <tbody>
              {(ubos.length > 0 ? ubos : shareholders).map((person, idx) => (
                <tr key={idx} className="border-b border-border/50 hover:bg-surface/50 transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      {(person.anteil || 0) > 25 && (
                        <Shield size={14} strokeWidth={1.5} className="text-green-600 shrink-0" />
                      )}
                      <span className="font-medium text-text-primary">{person.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-text-secondary">{person.geb || '—'}</td>
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      value={getDetail(person.name, 'geburtsort')}
                      onChange={e => setDetail(person.name, 'geburtsort', e.target.value)}
                      placeholder="Ort"
                      className="w-full min-w-[100px] rounded border border-border bg-white px-2 py-1 text-sm font-body text-text-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      value={getDetail(person.name, 'staatsangehoerigkeit')}
                      onChange={e => setDetail(person.name, 'staatsangehoerigkeit', e.target.value)}
                      placeholder="z.B. deutsch"
                      className="w-full min-w-[100px] rounded border border-border bg-white px-2 py-1 text-sm font-body text-text-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      value={getDetail(person.name, 'wohnanschrift')}
                      onChange={e => setDetail(person.name, 'wohnanschrift', e.target.value)}
                      placeholder="Straße, PLZ Ort"
                      className="w-full min-w-[140px] rounded border border-border bg-white px-2 py-1 text-sm font-body text-text-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <select
                      value={getDetail(person.name, 'berechtigung') || 'Kapitalanteile'}
                      onChange={e => setDetail(person.name, 'berechtigung', e.target.value)}
                      className="w-full min-w-[120px] rounded border border-border bg-white px-2 py-1 text-sm font-body text-text-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                    >
                      {UBO_BERECHTIGUNG_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-semibold text-text-primary">
                    {person.anteil}%
                  </td>
                  <td className="py-2.5 px-3">
                    <select
                      value={getDetail(person.name, 'legitimation') || 'offen'}
                      onChange={e => setDetail(person.name, 'legitimation', e.target.value)}
                      className="w-full min-w-[100px] rounded border border-border bg-white px-2 py-1 text-sm font-body text-text-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                    >
                      {LEGITIMATION_STATUS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Transparenzregister-Check                                           */}
      {/* ------------------------------------------------------------------ */}
      <TransparenzregisterCheck company={company} shareholders={shareholders} />
    </div>
  );
}


// =============================================================================
// Transparenzregister-Check Card (Sub-component of Tab 2)
// =============================================================================

function TransparenzregisterCheck({ company, shareholders }) {
  const ubos = shareholders.filter(s => (s.anteil || 0) > 25);
  const displayPersons = ubos.length > 0 ? ubos : shareholders.slice(0, 1);

  return (
    <div className="bg-surface rounded-xl p-5 border border-border">
      <div className="flex items-center gap-2 mb-4">
        <FileText size={18} strokeWidth={1.5} className="text-primary" />
        <h3 className="text-sm font-semibold font-headline text-text-primary">
          Transparenzregister-Abgleich
        </h3>
      </div>
      <p className="text-xs font-body text-text-muted mb-4">
        Vergleich der erfassten UBO-Daten mit den im Transparenzregister hinterlegten Eintragungen (simuliert).
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Feld</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Erfasste Daten</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Registerdaten</th>
              <th className="text-center py-2 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Ergebnis</th>
            </tr>
          </thead>
          <tbody>
            {displayPersons.map((person, idx) => (
              <>
                {/* Separator row for multiple persons */}
                {idx > 0 && (
                  <tr key={`sep-${idx}`}>
                    <td colSpan={4} className="py-2 px-3">
                      <div className="border-t border-border" />
                    </td>
                  </tr>
                )}

                <tr key={`name-${idx}`} className="hover:bg-white/50">
                  <td className="py-1.5 px-3 text-text-muted">Name (UBO {idx + 1})</td>
                  <td className="py-1.5 px-3 text-text-primary font-medium">{person.name}</td>
                  <td className="py-1.5 px-3 text-text-primary">{person.name}</td>
                  <td className="py-1.5 px-3 text-center">
                    <MatchBadge match={true} />
                  </td>
                </tr>
                <tr key={`geb-${idx}`} className="hover:bg-white/50">
                  <td className="py-1.5 px-3 text-text-muted">Geburtsdatum</td>
                  <td className="py-1.5 px-3 font-mono text-text-primary">{person.geb}</td>
                  <td className="py-1.5 px-3 font-mono text-text-primary">{person.geb}</td>
                  <td className="py-1.5 px-3 text-center">
                    <MatchBadge match={true} />
                  </td>
                </tr>
                <tr key={`anteil-${idx}`} className="hover:bg-white/50">
                  <td className="py-1.5 px-3 text-text-muted">Anteil</td>
                  <td className="py-1.5 px-3 font-mono text-text-primary">{person.anteil}%</td>
                  <td className="py-1.5 px-3 font-mono text-text-primary">{person.anteil}%</td>
                  <td className="py-1.5 px-3 text-center">
                    <MatchBadge match={true} />
                  </td>
                </tr>
                <tr key={`art-${idx}`} className="hover:bg-white/50">
                  <td className="py-1.5 px-3 text-text-muted">Art d. Berechtigung</td>
                  <td className="py-1.5 px-3 text-text-primary">Kapitalanteile</td>
                  <td className="py-1.5 px-3 text-text-primary">Kapitalanteile</td>
                  <td className="py-1.5 px-3 text-center">
                    <MatchBadge match={true} />
                  </td>
                </tr>
              </>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
        <CheckCircle2 size={16} strokeWidth={1.5} className="text-green-600 shrink-0" />
        <span className="text-sm font-body text-green-800">
          Transparenzregister-Abgleich: Alle Daten stimmen überein.
        </span>
      </div>
    </div>
  );
}


// =============================================================================
// Match Badge (Sub-component)
// =============================================================================

function MatchBadge({ match }) {
  return match ? (
    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 rounded-full px-2 py-0.5 text-xs font-medium font-body">
      <CheckCircle2 size={12} strokeWidth={1.5} />
      Match
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 rounded-full px-2 py-0.5 text-xs font-medium font-body">
      <XCircle size={12} strokeWidth={1.5} />
      Mismatch
    </span>
  );
}


// =============================================================================
// Tab 3: PEP-Screening
// =============================================================================

function PEPTab({ company, pepResults, setPepResults }) {
  const persons = company.gf || [];

  const getPep = useCallback((name) => {
    return pepResults[name] || { result: 'kein_pep', category: '', nachlauf: '' };
  }, [pepResults]);

  const setPep = useCallback((name, field, value) => {
    setPepResults(prev => ({
      ...prev,
      [name]: { ...(prev[name] || { result: 'kein_pep', category: '', nachlauf: '' }), [field]: value },
    }));
  }, [setPepResults]);

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div>
        <h2 className="text-lg font-semibold font-headline text-text-primary">
          PEP-Screening
        </h2>
        <p className="text-sm font-body text-text-muted mt-0.5">
          Prüfung auf politisch exponierte Personen gemäß §1 Abs. 12 GwG
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
        <Info size={16} strokeWidth={1.5} className="text-blue-600 mt-0.5 shrink-0" />
        <div className="text-sm font-body text-blue-800">
          Gemäß GwG sind natürliche Personen, die ein hochrangiges öffentliches Amt
          auf nationaler oder internationaler Ebene ausüben oder innerhalb der letzten
          12 Monate ausgeübt haben, als PEP einzustufen. Dies gilt auch für unmittelbare
          Familienmitglieder und bekanntermaßen nahestehende Personen.
        </div>
      </div>

      {/* Person cards */}
      <div className="space-y-4">
        {persons.map((person, idx) => {
          const pep = getPep(person.name);
          const isPEP = pep.result !== 'kein_pep';

          return (
            <div
              key={idx}
              className={`border rounded-xl p-5 transition-all ${
                isPEP ? 'border-red-300 bg-red-50/40' : 'border-border bg-white'
              }`}
            >
              {/* Person header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isPEP ? 'bg-red-100' : 'bg-surface'
                }`}>
                  <User size={18} strokeWidth={1.5} className={isPEP ? 'text-red-600' : 'text-text-muted'} />
                </div>
                <div>
                  <div className="text-sm font-semibold font-body text-text-primary">
                    {person.name}
                  </div>
                  <div className="text-xs font-body text-text-muted">
                    {person.funktion} &middot; Anteil: {person.anteil}%
                  </div>
                </div>
              </div>

              {/* PEP radio buttons */}
              <div className="mb-4">
                <label className="block text-xs font-medium font-body text-text-muted mb-2">
                  PEP-Ergebnis
                </label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { value: 'kein_pep', label: 'Kein PEP' },
                    { value: 'pep', label: 'PEP' },
                    { value: 'familienmitglied', label: 'Familienmitglied PEP' },
                    { value: 'nahestehend', label: 'Nahestehende Person PEP' },
                  ].map(option => (
                    <label
                      key={option.value}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm font-body transition-colors ${
                        pep.result === option.value
                          ? option.value === 'kein_pep'
                            ? 'border-green-400 bg-green-50 text-green-800'
                            : 'border-red-400 bg-red-50 text-red-800'
                          : 'border-border bg-white text-text-secondary hover:bg-surface'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`pep-${person.name}`}
                        value={option.value}
                        checked={pep.result === option.value}
                        onChange={() => setPep(person.name, 'result', option.value)}
                        className="sr-only"
                      />
                      <CircleDot size={14} strokeWidth={1.5} className={
                        pep.result === option.value ? 'opacity-100' : 'opacity-30'
                      } />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* PEP detail fields (only shown if PEP selected) */}
              {isPEP && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* PEP Category */}
                    <div>
                      <label className="block text-xs font-medium font-body text-text-muted mb-1">
                        PEP-Kategorie
                      </label>
                      <select
                        value={pep.category}
                        onChange={e => setPep(person.name, 'category', e.target.value)}
                        className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm font-body text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      >
                        <option value="">Bitte auswählen...</option>
                        {PEP_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    {/* Nachlaufzeit */}
                    <div>
                      <label className="block text-xs font-medium font-body text-text-muted mb-1">
                        Seit wann aus Amt ausgeschieden?
                      </label>
                      <input
                        type="date"
                        value={pep.nachlauf}
                        onChange={e => setPep(person.name, 'nachlauf', e.target.value)}
                        className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm font-mono text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* PEP warning banner */}
                  <div className="flex items-start gap-2 bg-red-100 border border-red-300 rounded-lg px-4 py-3">
                    <ShieldAlert size={16} strokeWidth={1.5} className="text-red-700 mt-0.5 shrink-0" />
                    <div className="text-sm font-body text-red-800 font-medium">
                      Verstärkte Sorgfaltspflichten erforderlich – Genehmigung Führungsebene
                      gemäß §15 Abs. 4 GwG erforderlich.
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


// =============================================================================
// Tab 4: Sanktionslistenprüfung
// =============================================================================

function SanktionTab({
  company,
  sanctionChecked,
  setSanctionChecked,
  sanctionLoading,
  setSanctionLoading,
  sanctionResults,
  setSanctionResults,
}) {
  const persons = company.gf || [];

  // Build entities to check: company + all persons
  const entities = useMemo(() => {
    const list = [
      { name: company.firma, type: 'Unternehmen' },
      ...persons.map(p => ({ name: p.name, type: 'Natürliche Person' })),
    ];
    return list;
  }, [company.firma, persons]);

  // Generate demo results
  const generateResults = useCallback(() => {
    const results = {};
    entities.forEach(entity => {
      // Simulated: company named "Digital Commerce" or similar gets a fuzzy match warning
      const isFuzzyTarget = entity.name.toLowerCase().includes('digital') || entity.name.toLowerCase().includes('commerce');
      results[entity.name] = {
        eu_cfsp: isFuzzyTarget ? 'warning' : 'clear',
        ofac_sdn: 'clear',
        un_sc: 'clear',
        national: 'clear',
      };
    });
    return results;
  }, [entities]);

  const handleRunCheck = () => {
    setSanctionLoading(true);
    setSanctionChecked(false);
    setSanctionResults(null);

    // Simulated async screening
    setTimeout(() => {
      setSanctionResults(generateResults());
      setSanctionChecked(true);
      setSanctionLoading(false);
    }, 2000);
  };

  const resultIcon = (status) => {
    switch (status) {
      case 'clear':
        return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-100 text-green-600 text-sm font-bold" title="Kein Treffer">&#10003;</span>;
      case 'warning':
        return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-600 text-sm font-bold" title="Fuzzy Match">&#9888;</span>;
      case 'hit':
        return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-100 text-red-600 text-sm font-bold" title="Treffer">&#10005;</span>;
      default:
        return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-400 text-sm">—</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-lg font-semibold font-headline text-text-primary">
              Sanktionslistenprüfung
            </h2>
            <p className="text-sm font-body text-text-muted mt-0.5">
              Abgleich gegen internationale Sanktions- und Embargolisten
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-violet-100 text-violet-700 border border-violet-200">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            Durch KI geprüft
          </span>
        </div>
        <button
          type="button"
          onClick={handleRunCheck}
          disabled={sanctionLoading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium font-body hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {sanctionLoading ? (
            <>
              <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
              Prüfung läuft...
            </>
          ) : (
            <>
              <Search size={16} strokeWidth={1.5} />
              Prüfung durchführen
            </>
          )}
        </button>
      </div>

      {/* Checked lists info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {SANCTION_LISTS.map(list => (
          <div key={list.id} className="bg-surface rounded-lg px-4 py-3 border border-border">
            <div className="text-xs font-body text-text-muted uppercase tracking-wide mb-1">
              {list.label}
            </div>
            <div className="text-sm font-semibold font-body text-text-primary">
              {sanctionChecked ? 'Geprüft' : 'Ausstehend'}
            </div>
          </div>
        ))}
      </div>

      {/* Loading state */}
      {sanctionLoading && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-surface" />
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold font-body text-text-primary">
              Sanktionslistenabgleich wird durchgeführt...
            </p>
            <p className="text-xs font-body text-text-muted mt-1">
              Abfrage von {entities.length} {entities.length === 1 ? 'Entität' : 'Entitäten'} gegen {SANCTION_LISTS.length} Listen
            </p>
          </div>
        </div>
      )}

      {/* Results table */}
      {sanctionChecked && sanctionResults && !sanctionLoading && (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left py-3 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">
                    Name / Entität
                  </th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">
                    Typ
                  </th>
                  {SANCTION_LISTS.map(list => (
                    <th key={list.id} className="text-center py-3 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">
                      {list.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entities.map((entity, idx) => {
                  const results = sanctionResults[entity.name] || {};
                  const hasWarning = Object.values(results).some(r => r === 'warning');
                  const hasHit = Object.values(results).some(r => r === 'hit');

                  return (
                    <tr
                      key={idx}
                      className={`border-b border-border/50 transition-colors ${
                        hasHit
                          ? 'bg-red-50/50'
                          : hasWarning
                          ? 'bg-amber-50/50'
                          : 'hover:bg-surface/50'
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          {entity.type === 'Unternehmen' ? (
                            <Building2 size={14} strokeWidth={1.5} className="text-text-muted shrink-0" />
                          ) : (
                            <User size={14} strokeWidth={1.5} className="text-text-muted shrink-0" />
                          )}
                          <span className="font-medium text-text-primary">{entity.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-text-secondary">{entity.type}</td>
                      {SANCTION_LISTS.map(list => (
                        <td key={list.id} className="py-3 px-3 text-center">
                          {resultIcon(results[list.id])}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Fuzzy match warning detail */}
          {Object.entries(sanctionResults).some(([, r]) => Object.values(r).includes('warning')) && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
              <AlertTriangle size={16} strokeWidth={1.5} className="text-amber-600 mt-0.5 shrink-0" />
              <div className="text-sm font-body text-amber-800">
                <strong>Fuzzy Match erkannt:</strong> Bei mindestens einer Entität wurde eine
                partielle Namensübereinstimmung mit einem Listeneintrag festgestellt.
                Bitte prüfe den Treffer manuell und dokumentiere das Ergebnis.
              </div>
            </div>
          )}

          {/* All clear message */}
          {!Object.entries(sanctionResults).some(([, r]) => Object.values(r).includes('warning') || Object.values(r).includes('hit')) && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
              <CheckCircle2 size={16} strokeWidth={1.5} className="text-green-600 shrink-0" />
              <span className="text-sm font-body text-green-800">
                Keine Treffer auf Sanktionslisten. Alle Entitäten sind unbedenklich.
              </span>
            </div>
          )}

          {/* Timestamp */}
          <div className="text-xs font-mono text-text-muted text-right">
            Letzter Abgleich: {new Date().toLocaleString('de-DE')}
          </div>
        </div>
      )}

      {/* Initial state – no check run yet */}
      {!sanctionChecked && !sanctionLoading && (
        <div className="flex flex-col items-center justify-center py-12 space-y-3 text-center">
          <div className="w-14 h-14 rounded-full bg-surface flex items-center justify-center">
            <SearchCheck size={24} strokeWidth={1.5} className="text-text-muted" />
          </div>
          <p className="text-sm font-body text-text-secondary max-w-sm">
            Klicke auf &quot;Prüfung durchführen&quot;, um den Abgleich aller Personen und
            des Unternehmens gegen internationale Sanktionslisten zu starten.
          </p>
        </div>
      )}
    </div>
  );
}


// =============================================================================
// Compliance-Gesamtampel (Bottom summary)
// =============================================================================

function ComplianceTrafficLight({ status, label }) {
  const configs = {
    green: {
      dot: 'bg-green-500 shadow-green-500/40',
      ring: 'ring-green-200',
      bg: 'bg-green-50 border-green-200',
      text: 'text-green-800',
      icon: CheckCircle2,
      iconColor: 'text-green-600',
    },
    yellow: {
      dot: 'bg-amber-500 shadow-amber-500/40',
      ring: 'ring-amber-200',
      bg: 'bg-amber-50 border-amber-200',
      text: 'text-amber-800',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
    },
    red: {
      dot: 'bg-red-500 shadow-red-500/40',
      ring: 'ring-red-200',
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-800',
      icon: XCircle,
      iconColor: 'text-red-600',
    },
  };

  const config = configs[status] || configs.yellow;
  const StatusIcon = config.icon;

  return (
    <div className={`border rounded-xl p-5 ${config.bg}`}>
      <div className="flex items-center gap-4">
        {/* Traffic light dots */}
        <div className="flex flex-col gap-1.5 items-center">
          <div className={`w-5 h-5 rounded-full border-2 border-white/80 ${status === 'red' ? config.dot + ' shadow-lg' : 'bg-red-200/40'}`} />
          <div className={`w-5 h-5 rounded-full border-2 border-white/80 ${status === 'yellow' ? config.dot + ' shadow-lg' : 'bg-amber-200/40'}`} />
          <div className={`w-5 h-5 rounded-full border-2 border-white/80 ${status === 'green' ? config.dot + ' shadow-lg' : 'bg-green-200/40'}`} />
        </div>

        {/* Label */}
        <div className="flex items-center gap-3">
          <StatusIcon size={20} strokeWidth={1.5} className={config.iconColor} />
          <div>
            <div className={`text-sm font-semibold font-headline ${config.text}`}>
              Compliance-Gesamtampel
            </div>
            <div className={`text-sm font-body ${config.text} opacity-90`}>
              {label}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
