/**
 * NewApplicationView -- Multi-section Kreditantrag (credit application) form.
 *
 * Sections:
 *   A  Antragsteller (company data)
 *   B  Geschaeftsfuehrung & Gesellschafter (dynamic table)
 *   C  Kreditwunsch (loan request)
 *   D  Bestehende Verbindlichkeiten (existing liabilities, dynamic table)
 *   +  KI-Voranalyse button with simulated result panel
 *
 * Uses local component state for every field and syncs to global context
 * via useApp().dispatch({type:'UPDATE_APPLICATION_DRAFT', data}).
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Building2,
  Users,
  Banknote,
  FileText,
  Plus,
  Trash2,
  ChevronDown,
  Search,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RECHTSFORMEN = [
  'GmbH',
  'GmbH & Co. KG',
  'AG',
  'UG',
  'OHG',
  'KG',
  'Einzelunternehmen',
  'eG',
  'GbR',
];

const KREDITARTEN = [
  'Investitionskredit',
  'Betriebsmittelkredit',
  'Kontokorrentlinie',
  'Avalkredit',
  'Immobilienfinanzierung',
];

const VERWENDUNG_KATEGORIEN = [
  'Maschine/Anlage',
  'Immobilie',
  'Betriebsmittel',
  'Akquisition',
  'Umschuldung',
  'Sonstiges',
];

const FUNKTIONEN = ['GF', 'Gesellschafter', 'Beides'];

const EMPTY_GF_ROW = {
  name: '',
  geb: '',
  funktion: 'GF',
  anteil: '',
  seit: '',
  erfahrung: '',
};

const EMPTY_VERBINDLICHKEIT = {
  glaeubiger: '',
  kreditart: '',
  ursprungsbetrag: '',
  restschuld: '',
  rate: '',
  zinssatz: '',
  laufzeitende: '',
  sicherheit: '',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fmt = new Intl.NumberFormat('de-DE');

/** Format a numeric value as German locale string. Returns '' for falsy. */
function formatDE(v) {
  if (v === '' || v === null || v === undefined) return '';
  const n = typeof v === 'string' ? parseInt(v, 10) : v;
  return isNaN(n) ? '' : fmt.format(n);
}

/** Parse a German formatted number string to an integer. */
function parseDE(str) {
  const raw = String(str).replace(/[^\d]/g, '');
  return raw ? parseInt(raw, 10) : '';
}

// ---------------------------------------------------------------------------
// Reusable tiny components
// ---------------------------------------------------------------------------

const inputCls =
  'w-full px-3 py-2 border border-border rounded-md text-sm font-body ' +
  'focus:outline-none focus:border-primary-light focus:ring-2 focus:ring-primary-light/10 ' +
  'placeholder:text-text-muted disabled:bg-gray-50 disabled:text-text-muted';

const selectCls =
  'w-full px-3 py-2 border border-border rounded-md text-sm font-body appearance-none bg-surface-card ' +
  'focus:outline-none focus:border-primary-light focus:ring-2 focus:ring-primary-light/10';

const labelCls =
  'block text-xs font-medium text-text-secondary mb-1 uppercase tracking-wider font-body';

const smallInputCls =
  'w-full px-2 py-1.5 border border-border rounded text-xs font-body ' +
  'focus:outline-none focus:border-primary-light focus:ring-2 focus:ring-primary-light/10 ' +
  'placeholder:text-text-muted';

const smallSelectCls =
  'w-full px-2 py-1.5 border border-border rounded text-xs font-body appearance-none bg-surface-card ' +
  'focus:outline-none focus:border-primary-light focus:ring-2 focus:ring-primary-light/10';

function Label({ children, htmlFor }) {
  return (
    <label className={labelCls} htmlFor={htmlFor}>
      {children}
    </label>
  );
}

function SectionCard({ icon: Icon, letter, title, children }) {
  return (
    <div className="bg-surface-card border border-border rounded-lg">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border">
        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/5 text-primary">
          <Icon size={16} />
        </div>
        <h3 className="text-sm font-headline font-semibold text-text-primary tracking-wide">
          <span className="text-primary-light mr-1.5">{letter}</span>
          {title}
        </h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/** Inline euro-formatted input. Shows formatted value on blur, raw on focus. */
function EuroInput({ value, onChange, placeholder = '0', id, disabled }) {
  const [focused, setFocused] = useState(false);
  const display = focused ? (value === '' ? '' : String(value)) : formatDE(value);

  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={display}
        onChange={(e) => onChange(parseDE(e.target.value))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        disabled={disabled}
        className={inputCls + ' pr-8 font-mono'}
      />
      <span
        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm pointer-events-none"
        aria-hidden="true"
      >
        &euro;
      </span>
    </div>
  );
}

/** Small euro input for tables. */
function SmallEuroInput({ value, onChange, placeholder = '0' }) {
  const [focused, setFocused] = useState(false);
  const display = focused ? (value === '' ? '' : String(value)) : formatDE(value);

  return (
    <div className="relative">
      <input
        type="text"
        inputMode="numeric"
        value={display}
        onChange={(e) => onChange(parseDE(e.target.value))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className={smallInputCls + ' pr-6 font-mono'}
      />
      <span
        className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted text-[10px] pointer-events-none"
        aria-hidden="true"
      >
        &euro;
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function NewApplicationView() {
  const { state, dispatch, navigate, getSelectedCompany } = useApp();
  const company = getSelectedCompany();
  const draft = state.applicationDraft;

  // Customer search
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [showErrors, setShowErrors] = useState(false);
  const errorRefs = useRef({});

  // ---- Section A: Antragsteller ----
  const [firma, setFirma] = useState(draft.firma || '');
  const [rechtsform, setRechtsform] = useState(draft.rechtsform || 'GmbH');
  const [hrb, setHrb] = useState(draft.hrb || '');
  const [amtsgericht, setAmtsgericht] = useState(draft.amtsgericht || '');
  const [gruendung, setGruendung] = useState(draft.gruendung || '');
  const [branche, setBranche] = useState(draft.branche || '');
  const [wzCode, setWzCode] = useState(draft.wz_code || '');
  const [strasse, setStrasse] = useState(draft.adresse?.strasse || '');
  const [plz, setPlz] = useState(draft.adresse?.plz || '');
  const [ort, setOrt] = useState(draft.adresse?.ort || '');
  const [umsatz, setUmsatz] = useState(draft.umsatz || '');
  const [mitarbeiter, setMitarbeiter] = useState(draft.mitarbeiter || '');
  const [steuerId, setSteuerId] = useState(draft.steuer_id || '');
  const [ustId, setUstId] = useState(draft.ust_id || '');
  const [hauptbank, setHauptbank] = useState(draft.hauptbank ?? true);

  // ---- Section B: GF & Gesellschafter ----
  const [gfRows, setGfRows] = useState(
    draft.gf && draft.gf.length > 0 ? draft.gf : [{ ...EMPTY_GF_ROW }]
  );

  // ---- Section C: Kreditwunsch ----
  const [kreditArt, setKreditArt] = useState(draft.kredit?.art || 'Investitionskredit');
  const [betrag, setBetrag] = useState(draft.kredit?.betrag || '');
  const [laufzeit, setLaufzeit] = useState(draft.kredit?.laufzeit || '');
  const [tilgungsfrei, setTilgungsfrei] = useState(draft.kredit?.tilgungsfrei || '');
  const [verwendung, setVerwendung] = useState(draft.kredit?.verwendung || '');
  const [verwendungKategorie, setVerwendungKategorie] = useState(
    draft.kredit?.verwendungKategorie || 'Maschine/Anlage'
  );
  const [auszahlung, setAuszahlung] = useState(draft.kredit?.auszahlung || '');
  const [sicherheiten, setSicherheiten] = useState(draft.sicherheiten_vorerfassung || '');

  // ---- Section D: Bestehende Verbindlichkeiten ----
  const [verbindlichkeiten, setVerbindlichkeiten] = useState(
    draft.bestehende_verbindlichkeiten && draft.bestehende_verbindlichkeiten.length > 0
      ? draft.bestehende_verbindlichkeiten
      : []
  );

  // Pre-fill from selected company (Bestandskunde)
  const didPrefill = useRef(false);
  useEffect(() => {
    if (company && !didPrefill.current) {
      didPrefill.current = true;
      setFirma(company.firma || '');
      setRechtsform(company.rechtsform || 'GmbH');
      setHrb(company.hrb || '');
      setAmtsgericht(company.amtsgericht || '');
      setGruendung(company.gruendung || '');
      setBranche(company.branche || '');
      setWzCode(company.wz_code || '');
      setStrasse(company.adresse?.strasse || '');
      setPlz(company.adresse?.plz || '');
      setOrt(company.adresse?.ort || '');
      setUmsatz(company.bilanz?.[2023]?.umsatz || '');
      setMitarbeiter(company.mitarbeiter || '');
      setSteuerId(company.steuer_id || '');
      setUstId(company.ust_id || '');
      setHauptbank(company.hauptbank ?? true);
      if (company.gf?.length) setGfRows(company.gf);
      setKreditArt(company.kredit?.art || 'Investitionskredit');
      setBetrag(company.kredit?.betrag || '');
      setLaufzeit(company.kredit?.laufzeit || '');
      setTilgungsfrei(company.kredit?.tilgungsfrei || '');
      setVerwendung(company.kredit?.verwendung || '');
      setVerwendungKategorie(company.kredit?.verwendungKategorie || 'Maschine/Anlage');
      setAuszahlung(company.kredit?.auszahlung || '');
      if (company.bestehende_verbindlichkeiten?.length) {
        setVerbindlichkeiten(company.bestehende_verbindlichkeiten);
      }
    }
  }, [company]);

  // Sync local state to global draft on every change (debounced would be
  // better in production, but for the demo this keeps things simple).
  useEffect(() => {
    dispatch({
      type: 'UPDATE_APPLICATION_DRAFT',
      data: {
        firma,
        rechtsform,
        hrb,
        amtsgericht,
        gruendung,
        branche,
        wz_code: wzCode,
        adresse: { strasse, plz, ort },
        umsatz,
        mitarbeiter,
        steuer_id: steuerId,
        ust_id: ustId,
        hauptbank,
        gf: gfRows,
        kredit: {
          art: kreditArt,
          betrag,
          laufzeit,
          tilgungsfrei,
          verwendung,
          verwendungKategorie,
          auszahlung,
        },
        sicherheiten_vorerfassung: sicherheiten,
        bestehende_verbindlichkeiten: verbindlichkeiten,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    firma, rechtsform, hrb, amtsgericht, gruendung, branche, wzCode,
    strasse, plz, ort, umsatz, mitarbeiter, steuerId, ustId, hauptbank,
    gfRows, kreditArt, betrag, laufzeit, tilgungsfrei, verwendung,
    verwendungKategorie, auszahlung, sicherheiten, verbindlichkeiten,
  ]);

  // ---- GF table helpers ----
  const updateGfRow = useCallback((idx, field, val) => {
    setGfRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: val } : r)));
  }, []);

  const addGfRow = useCallback(() => {
    setGfRows((prev) => [...prev, { ...EMPTY_GF_ROW }]);
  }, []);

  const removeGfRow = useCallback((idx) => {
    setGfRows((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));
  }, []);

  // ---- Verbindlichkeiten table helpers ----
  const updateVRow = useCallback((idx, field, val) => {
    setVerbindlichkeiten((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: val } : r))
    );
  }, []);

  const addVRow = useCallback(() => {
    setVerbindlichkeiten((prev) => [...prev, { ...EMPTY_VERBINDLICHKEIT }]);
  }, []);

  const removeVRow = useCallback((idx) => {
    setVerbindlichkeiten((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  // Customer search suggestions
  const searchResults = searchQuery.length >= 2
    ? state.companies.filter(c =>
        c.firma.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.hrb && c.hrb.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const selectCustomer = useCallback((c) => {
    dispatch({ type: 'SELECT_COMPANY', id: c.id });
    setSearchQuery('');
    setShowSuggestions(false);
    // Pre-fill is handled by the useEffect above
    didPrefill.current = false; // Reset so it re-fills
  }, [dispatch]);

  // Auto-validate when opening an existing company (show errors immediately)
  const didAutoValidate = useRef(false);
  useEffect(() => {
    if (company && didPrefill.current && !didAutoValidate.current) {
      didAutoValidate.current = true;
      // Run validation after prefill state has settled
      const timer = setTimeout(() => {
        const errors = [];
        if (!(company.firma || '').trim()) errors.push({ field: 'firma', label: 'Firmenname' });
        if (!(company.rechtsform)) errors.push({ field: 'rechtsform', label: 'Rechtsform' });
        if (!(company.branche || '').trim()) errors.push({ field: 'branche', label: 'Branche' });
        if (!company.gf?.[0]?.name?.trim()) errors.push({ field: 'gf', label: 'Mind. 1 Geschäftsführer' });
        if (!company.kredit?.art) errors.push({ field: 'kreditArt', label: 'Kreditart' });
        const b = company.kredit?.betrag || 0;
        if (!b) errors.push({ field: 'betrag', label: 'Kreditbetrag' });
        if (!company.kredit?.laufzeit) errors.push({ field: 'laufzeit', label: 'Laufzeit' });
        if (!(company.kredit?.verwendung || '').trim()) errors.push({ field: 'verwendung', label: 'Verwendungszweck' });
        if (!company.kredit?.auszahlung) errors.push({ field: 'auszahlung', label: 'Gewünschter Auszahlungstermin' });
        if (errors.length > 0) {
          setValidationErrors(errors);
          setShowErrors(true);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [company]);

  // Validation
  const validateForm = useCallback(() => {
    const errors = [];
    if (!firma.trim()) errors.push({ field: 'firma', label: 'Firmenname' });
    if (!rechtsform) errors.push({ field: 'rechtsform', label: 'Rechtsform' });
    if (!branche.trim()) errors.push({ field: 'branche', label: 'Branche' });
    if (!gfRows[0]?.name?.trim()) errors.push({ field: 'gf', label: 'Mind. 1 Geschäftsführer' });
    if (!kreditArt) errors.push({ field: 'kreditArt', label: 'Kreditart' });
    const b = typeof betrag === 'number' ? betrag : parseInt(betrag, 10) || 0;
    if (!b) errors.push({ field: 'betrag', label: 'Kreditbetrag' });
    if (!laufzeit) errors.push({ field: 'laufzeit', label: 'Laufzeit' });
    if (!verwendung.trim()) errors.push({ field: 'verwendung', label: 'Verwendungszweck' });
    if (!auszahlung) errors.push({ field: 'auszahlung', label: 'Gewünschter Auszahlungstermin' });
    return errors;
  }, [firma, rechtsform, branche, gfRows, kreditArt, betrag, laufzeit, verwendung, auszahlung]);

  const handleComplete = useCallback(() => {
    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      setShowErrors(true);
      // Scroll to first error
      const firstField = errors[0].field;
      const el = document.getElementById(firstField);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
      }
      return;
    }
    setShowErrors(false);
    setValidationErrors([]);
    if (company) {
      dispatch({ type: 'ADVANCE_STATUS', companyId: company.id });
    }
    navigate('kyc');
  }, [validateForm, company, dispatch, navigate]);

  const isFieldError = (fieldName) => showErrors && validationErrors.some(e => e.field === fieldName);

  // ---- Render ----
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-white">
          <FileText size={20} />
        </div>
        <div>
          <h2 className="text-lg font-headline font-semibold text-text-primary">
            {company ? `Kreditantrag – ${company.firma}` : 'Neuer Kreditantrag'}
          </h2>
          <p className="text-xs text-text-muted font-body">
            Erfasse alle relevanten Antragsdaten. Pflichtfelder sind mit * markiert.
          </p>
        </div>
      </div>

      {/* Customer search */}
      <div className="relative">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Kunde suchen (Name, Kundennr., HRB)..."
            className={inputCls + ' pl-10'}
          />
        </div>
        {showSuggestions && searchResults.length > 0 && (
          <div className="absolute z-20 w-full mt-1 bg-surface-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {searchResults.map(c => (
              <button
                key={c.id}
                type="button"
                onMouseDown={() => selectCustomer(c)}
                className="w-full text-left px-4 py-2.5 hover:bg-primary/5 text-sm font-body border-b border-border/50 last:border-0"
              >
                <span className="font-semibold text-text-primary">{c.firma}</span>
                <span className="text-text-muted ml-2 text-xs">{c.id} · {c.hrb}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Validation errors banner */}
      {showErrors && validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-danger mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-danger">Bitte fülle alle Pflichtfelder aus:</p>
            <p className="text-xs text-red-600 mt-1">{validationErrors.map(e => e.label).join(', ')}</p>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* SECTION A -- Antragsteller                                         */}
      {/* ================================================================== */}
      <SectionCard icon={Building2} letter="A" title="Antragsteller">
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <Label htmlFor="firma">Firmenname *</Label>
            <input
              id="firma"
              type="text"
              value={firma}
              onChange={(e) => setFirma(e.target.value)}
              placeholder="Mustermann GmbH"
              className={inputCls + (isFieldError('firma') ? ' border-danger ring-2 ring-danger/20 animate-shake' : '')}
            />
          </div>
          <div>
            <Label htmlFor="rechtsform">Rechtsform *</Label>
            <div className="relative">
              <select
                id="rechtsform"
                value={rechtsform}
                onChange={(e) => setRechtsform(e.target.value)}
                className={selectCls}
              >
                {RECHTSFORMEN.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="hrb">HRB/HRA-Nummer</Label>
            <input
              id="hrb"
              type="text"
              value={hrb}
              onChange={(e) => setHrb(e.target.value)}
              placeholder="HRB 12345"
              className={inputCls}
            />
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <Label htmlFor="amtsgericht">Amtsgericht</Label>
            <input
              id="amtsgericht"
              type="text"
              value={amtsgericht}
              onChange={(e) => setAmtsgericht(e.target.value)}
              placeholder="Frankfurt am Main"
              className={inputCls}
            />
          </div>
          <div>
            <Label htmlFor="gruendung">Gruendungsjahr *</Label>
            <input
              id="gruendung"
              type="number"
              value={gruendung}
              onChange={(e) => setGruendung(e.target.value)}
              placeholder="2010"
              min="1800"
              max="2026"
              className={inputCls + ' font-mono'}
            />
          </div>
          <div>
            <Label htmlFor="branche">Branche (WZ-2008)</Label>
            <div className="flex gap-2">
              <input
                id="branche"
                type="text"
                value={branche}
                onChange={(e) => setBranche(e.target.value)}
                placeholder="Maschinenbau"
                className={inputCls + ' flex-1'}
              />
              <input
                type="text"
                value={wzCode}
                onChange={(e) => setWzCode(e.target.value)}
                placeholder="28.1"
                className={inputCls + ' w-20 font-mono'}
                title="WZ-2008 Code"
              />
            </div>
          </div>
        </div>

        {/* Row 3 -- Adresse */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <Label htmlFor="strasse">Strasse</Label>
            <input
              id="strasse"
              type="text"
              value={strasse}
              onChange={(e) => setStrasse(e.target.value)}
              placeholder="Industriestr. 42"
              className={inputCls}
            />
          </div>
          <div>
            <Label htmlFor="plz">PLZ</Label>
            <input
              id="plz"
              type="text"
              value={plz}
              onChange={(e) => setPlz(e.target.value)}
              placeholder="60327"
              maxLength={5}
              className={inputCls + ' font-mono'}
            />
          </div>
          <div>
            <Label htmlFor="ort">Ort</Label>
            <input
              id="ort"
              type="text"
              value={ort}
              onChange={(e) => setOrt(e.target.value)}
              placeholder="Frankfurt am Main"
              className={inputCls}
            />
          </div>
        </div>

        {/* Row 4 -- Finanzen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <Label htmlFor="umsatz">Umsatz letztes GJ</Label>
            <EuroInput id="umsatz" value={umsatz} onChange={setUmsatz} placeholder="0" />
          </div>
          <div>
            <Label htmlFor="mitarbeiter">Mitarbeiterzahl</Label>
            <input
              id="mitarbeiter"
              type="number"
              value={mitarbeiter}
              onChange={(e) => setMitarbeiter(e.target.value)}
              placeholder="85"
              min="0"
              className={inputCls + ' font-mono'}
            />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hauptbank}
                onChange={(e) => setHauptbank(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary-light/20"
              />
              <span className="text-sm text-text-secondary font-body">
                Hauptbankverbindung
              </span>
            </label>
          </div>
        </div>

        {/* Row 5 -- Steuer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <Label htmlFor="steuerId">Steuer-ID</Label>
            <input
              id="steuerId"
              type="text"
              value={steuerId}
              onChange={(e) => setSteuerId(e.target.value)}
              placeholder="DE123456789"
              className={inputCls + ' font-mono'}
            />
          </div>
          <div>
            <Label htmlFor="ustId">USt-IdNr.</Label>
            <input
              id="ustId"
              type="text"
              value={ustId}
              onChange={(e) => setUstId(e.target.value)}
              placeholder="DE987654321"
              className={inputCls + ' font-mono'}
            />
          </div>
        </div>
      </SectionCard>

      {/* ================================================================== */}
      {/* SECTION B -- Geschaeftsfuehrung & Gesellschafter                    */}
      {/* ================================================================== */}
      <SectionCard icon={Users} letter="B" title="Geschaeftsfuehrung & Gesellschafter">
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-xs font-body">
            <thead>
              <tr className="border-b border-border">
                {['Name', 'Geburtsdatum', 'Funktion', 'Anteil %', 'seit (Jahr)', 'Branchenerf. (J.)', ''].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left text-[10px] font-medium text-text-muted uppercase tracking-wider pb-2 pr-2"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {gfRows.map((row, idx) => (
                <tr key={idx} className="border-b border-border/50 last:border-0">
                  <td className="py-2 pr-2 min-w-[160px]">
                    <input
                      type="text"
                      value={row.name}
                      onChange={(e) => updateGfRow(idx, 'name', e.target.value)}
                      placeholder="Max Mustermann"
                      className={smallInputCls}
                    />
                  </td>
                  <td className="py-2 pr-2 min-w-[130px]">
                    <input
                      type="date"
                      value={row.geb}
                      onChange={(e) => updateGfRow(idx, 'geb', e.target.value)}
                      className={smallInputCls + ' font-mono'}
                    />
                  </td>
                  <td className="py-2 pr-2 min-w-[120px]">
                    <div className="relative">
                      <select
                        value={row.funktion}
                        onChange={(e) => updateGfRow(idx, 'funktion', e.target.value)}
                        className={smallSelectCls}
                      >
                        {FUNKTIONEN.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={12}
                        className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted"
                      />
                    </div>
                  </td>
                  <td className="py-2 pr-2 w-20">
                    <input
                      type="number"
                      value={row.anteil}
                      onChange={(e) => updateGfRow(idx, 'anteil', e.target.value)}
                      placeholder="50"
                      min="0"
                      max="100"
                      className={smallInputCls + ' font-mono'}
                    />
                  </td>
                  <td className="py-2 pr-2 w-20">
                    <input
                      type="number"
                      value={row.seit}
                      onChange={(e) => updateGfRow(idx, 'seit', e.target.value)}
                      placeholder="2015"
                      min="1900"
                      max="2026"
                      className={smallInputCls + ' font-mono'}
                    />
                  </td>
                  <td className="py-2 pr-2 w-20">
                    <input
                      type="number"
                      value={row.erfahrung}
                      onChange={(e) => updateGfRow(idx, 'erfahrung', e.target.value)}
                      placeholder="10"
                      min="0"
                      className={smallInputCls + ' font-mono'}
                    />
                  </td>
                  <td className="py-2 w-8">
                    <button
                      type="button"
                      onClick={() => removeGfRow(idx)}
                      disabled={gfRows.length <= 1}
                      className="p-1 text-text-muted hover:text-danger disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Zeile entfernen"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          onClick={addGfRow}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-light transition-colors"
        >
          <Plus size={14} />
          Zeile hinzufuegen
        </button>
      </SectionCard>

      {/* ================================================================== */}
      {/* SECTION C -- Kreditwunsch                                          */}
      {/* ================================================================== */}
      <SectionCard icon={Banknote} letter="C" title="Kreditwunsch">
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="kreditArt">Kreditart *</Label>
            <div className="relative">
              <select
                id="kreditArt"
                value={kreditArt}
                onChange={(e) => setKreditArt(e.target.value)}
                className={selectCls}
              >
                {KREDITARTEN.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="betrag">Betrag *</Label>
            <EuroInput id="betrag" value={betrag} onChange={setBetrag} />
          </div>
          <div>
            <Label htmlFor="laufzeit">Laufzeit (Monate)</Label>
            <input
              id="laufzeit"
              type="number"
              value={laufzeit}
              onChange={(e) => setLaufzeit(e.target.value)}
              placeholder="60"
              min="1"
              className={inputCls + ' font-mono'}
            />
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <Label htmlFor="tilgungsfrei">Tilgungsfrei (Monate)</Label>
            <input
              id="tilgungsfrei"
              type="number"
              value={tilgungsfrei}
              onChange={(e) => setTilgungsfrei(e.target.value)}
              placeholder="6"
              min="0"
              className={inputCls + ' font-mono'}
            />
          </div>
          <div>
            <Label htmlFor="verwendungKategorie">Kategorie</Label>
            <div className="relative">
              <select
                id="verwendungKategorie"
                value={verwendungKategorie}
                onChange={(e) => setVerwendungKategorie(e.target.value)}
                className={selectCls}
              >
                {VERWENDUNG_KATEGORIEN.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="auszahlung">Gew. Auszahlungstermin</Label>
            <input
              id="auszahlung"
              type="date"
              value={auszahlung}
              onChange={(e) => setAuszahlung(e.target.value)}
              className={inputCls + ' font-mono'}
            />
          </div>
        </div>

        {/* Row 3 -- Verwendungszweck */}
        <div className="mt-4">
          <Label htmlFor="verwendung">Verwendungszweck *</Label>
          <textarea
            id="verwendung"
            value={verwendung}
            onChange={(e) => { setVerwendung(e.target.value); if (showErrors) setShowErrors(false); }}
            placeholder="Beschreibe den Verwendungszweck des Kredits..."
            rows={3}
            className={inputCls + ' resize-y' + (isFieldError('verwendung') ? ' border-danger ring-2 ring-danger/20 animate-shake' : '')}
          />
        </div>

        {/* Row 4 -- Sicherheiten */}
        <div className="mt-4">
          <Label htmlFor="sicherheiten">Vorhandene Sicherheiten</Label>
          <textarea
            id="sicherheiten"
            value={sicherheiten}
            onChange={(e) => setSicherheiten(e.target.value)}
            placeholder="z.B. Grundschuld auf Betriebsgelaende, Globalzession, Buergschaft..."
            rows={2}
            className={inputCls + ' resize-y'}
          />
        </div>
      </SectionCard>

      {/* ================================================================== */}
      {/* SECTION D -- Bestehende Verbindlichkeiten                          */}
      {/* ================================================================== */}
      <SectionCard icon={FileText} letter="D" title="Bestehende Verbindlichkeiten">
        {verbindlichkeiten.length > 0 ? (
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-xs font-body">
              <thead>
                <tr className="border-b border-border">
                  {[
                    'Glaeubiger',
                    'Kreditart',
                    'Ursprungsbetrag',
                    'Restschuld',
                    'Monatl. Rate',
                    'Zins %',
                    'Laufzeitende',
                    'Sicherheit',
                    '',
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left text-[10px] font-medium text-text-muted uppercase tracking-wider pb-2 pr-2"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {verbindlichkeiten.map((row, idx) => (
                  <tr key={idx} className="border-b border-border/50 last:border-0">
                    <td className="py-2 pr-2 min-w-[120px]">
                      <input
                        type="text"
                        value={row.glaeubiger}
                        onChange={(e) => updateVRow(idx, 'glaeubiger', e.target.value)}
                        placeholder="Sparkasse"
                        className={smallInputCls}
                      />
                    </td>
                    <td className="py-2 pr-2 min-w-[110px]">
                      <input
                        type="text"
                        value={row.kreditart}
                        onChange={(e) => updateVRow(idx, 'kreditart', e.target.value)}
                        placeholder="Investitionskredit"
                        className={smallInputCls}
                      />
                    </td>
                    <td className="py-2 pr-2 min-w-[100px]">
                      <SmallEuroInput
                        value={row.ursprungsbetrag}
                        onChange={(v) => updateVRow(idx, 'ursprungsbetrag', v)}
                      />
                    </td>
                    <td className="py-2 pr-2 min-w-[100px]">
                      <SmallEuroInput
                        value={row.restschuld}
                        onChange={(v) => updateVRow(idx, 'restschuld', v)}
                      />
                    </td>
                    <td className="py-2 pr-2 min-w-[100px]">
                      <SmallEuroInput
                        value={row.rate}
                        onChange={(v) => updateVRow(idx, 'rate', v)}
                      />
                    </td>
                    <td className="py-2 pr-2 w-16">
                      <input
                        type="text"
                        value={row.zinssatz}
                        onChange={(e) => updateVRow(idx, 'zinssatz', e.target.value)}
                        placeholder="3,5"
                        className={smallInputCls + ' font-mono'}
                      />
                    </td>
                    <td className="py-2 pr-2 min-w-[120px]">
                      <input
                        type="date"
                        value={row.laufzeitende}
                        onChange={(e) => updateVRow(idx, 'laufzeitende', e.target.value)}
                        className={smallInputCls + ' font-mono'}
                      />
                    </td>
                    <td className="py-2 pr-2 min-w-[110px]">
                      <input
                        type="text"
                        value={row.sicherheit}
                        onChange={(e) => updateVRow(idx, 'sicherheit', e.target.value)}
                        placeholder="Grundschuld"
                        className={smallInputCls}
                      />
                    </td>
                    <td className="py-2 w-8">
                      <button
                        type="button"
                        onClick={() => removeVRow(idx)}
                        className="p-1 text-text-muted hover:text-danger transition-colors"
                        title="Zeile entfernen"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-text-muted italic">
            Keine bestehenden Verbindlichkeiten erfasst.
          </p>
        )}
        <button
          type="button"
          onClick={addVRow}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-light transition-colors"
        >
          <Plus size={14} />
          Zeile hinzufuegen
        </button>
      </SectionCard>

      {/* ================================================================== */}
      {/* Kreditantrag abschließen                                           */}
      {/* ================================================================== */}
      <button
        type="button"
        onClick={handleComplete}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-base font-semibold font-body bg-accent text-white shadow-sm hover:bg-accent/90 active:bg-accent/80 transition-all duration-150"
      >
        Kreditantrag abschließen
        <ArrowRight size={20} />
      </button>
    </div>
  );
}
