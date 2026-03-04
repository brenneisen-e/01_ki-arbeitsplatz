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
  Sparkles,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
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
  const { state, dispatch } = useApp();
  const draft = state.applicationDraft;

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

  // ---- KI-Voranalyse ----
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const analysisRef = useRef(null);

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

  // ---- KI-Voranalyse simulation ----
  const runAnalysis = useCallback(() => {
    setAnalysisLoading(true);
    setAnalysisResult(null);

    setTimeout(() => {
      const b = typeof betrag === 'number' ? betrag : parseInt(betrag, 10) || 0;

      let color = 'green';
      let plausibilitaet = [];
      let fehlend = [];
      let risiko = [];

      if (b > 5000000) {
        color = 'red';
        plausibilitaet = [
          'Kreditbetrag liegt deutlich ueber dem branchenueblichen Durchschnitt.',
          'Verhaeltnis Kreditbetrag zu Umsatz erscheint auffaellig (> 50 %).',
          'Laufzeitlaenge in Relation zur Investitionsart pruefungsbeduertig.',
        ];
        fehlend = [
          'Jahresabschluesse der letzten 3 Jahre (testiert)',
          'Aktuelle BWA mit Summen- und Saldenliste',
          'Investitionsplan / Kostenvoranschlaege',
          'Gesellschaftsvertrag in aktueller Fassung',
          'Grundbuchauszug (bei Immobiliensicherheit)',
        ];
        risiko = [
          'Hohe Verschuldungsquote erwartet -- detaillierte Kapitaldienstfaehigkeitspruefung erforderlich.',
          'Branchenrisiko: konjunktursensitiver Sektor, Stresstest empfohlen.',
          'Sicherheitendeckung voraussichtlich unter 80 % -- Nachbesicherung pruefen.',
        ];
      } else if (b > 1000000) {
        color = 'yellow';
        plausibilitaet = [
          'Kreditbetrag im mittleren Segment -- plausibel fuer die angegebene Unternehmensgroesse.',
          'Verwendungszweck und Kategorie sind konsistent.',
          'Gruendungsjahr und Branchenerfahrung der GF passen zusammen.',
        ];
        fehlend = [
          'Jahresabschluesse der letzten 2 Jahre',
          'Aktuelle BWA (nicht aelter als 3 Monate)',
          'Liquiditaetsplanung fuer die Kreditlaufzeit',
          'Sicherheitennachweise (Grundbuch, Zessionsunterlagen)',
        ];
        risiko = [
          'Mittleres Risikoprofil -- Standardpruefung ausreichend.',
          'Tilgungsfreie Anlaufzeit beachten -- Kapitaldienstfaehigkeit ab Tilgungsbeginn pruefen.',
          'Bestehende Verbindlichkeiten in Gesamtobligo einbeziehen.',
        ];
      } else {
        color = 'green';
        plausibilitaet = [
          'Kreditbetrag im unteren Segment -- passt zur Unternehmensgroesse.',
          'Angaben sind in sich konsistent und vollstaendig.',
          'Keine offensichtlichen Auffaelligkeiten erkannt.',
        ];
        fehlend = [
          'Letzter Jahresabschluss (Bilanz / GuV)',
          'Aktuelle BWA',
          'Personalausweis-Kopien der Geschaeftsfuehrung',
        ];
        risiko = [
          'Geringes Risikoprofil bei vorlaeufiger Einschaetzung.',
          'Standardmaessige Bonitaetspruefung empfohlen.',
          'Sicherheitenstellung erscheint angemessen.',
        ];
      }

      setAnalysisResult({ color, plausibilitaet, fehlend, risiko });
      setAnalysisLoading(false);

      // Scroll to result
      setTimeout(() => {
        analysisRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }, 1500);
  }, [betrag]);

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
            Neuer Kreditantrag
          </h2>
          <p className="text-xs text-text-muted font-body">
            Erfassen Sie alle relevanten Antragsdaten. Pflichtfelder sind markiert.
          </p>
        </div>
      </div>

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
              className={inputCls}
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
            onChange={(e) => setVerwendung(e.target.value)}
            placeholder="Beschreiben Sie den Verwendungszweck des Kredits..."
            rows={3}
            className={inputCls + ' resize-y'}
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
      {/* KI-Voranalyse                                                      */}
      {/* ================================================================== */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={runAnalysis}
          disabled={analysisLoading}
          className={
            'inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold font-body ' +
            'bg-accent text-white shadow-sm ' +
            'hover:bg-accent/90 active:bg-accent/80 ' +
            'disabled:opacity-60 disabled:cursor-not-allowed ' +
            'transition-all duration-150'
          }
        >
          {analysisLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Sparkles size={18} />
          )}
          {analysisLoading ? 'Analyse laeuft...' : 'KI-Voranalyse starten'}
        </button>
      </div>

      {/* Analysis result panel */}
      {analysisResult && (
        <div
          ref={analysisRef}
          className="bg-surface-card border border-border rounded-lg overflow-hidden"
        >
          {/* Header with traffic light */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-gray-50/50">
            <div className="flex items-center gap-3">
              <Sparkles size={16} className="text-accent" />
              <h3 className="text-sm font-headline font-semibold text-text-primary">
                KI-Voranalyse Ergebnis
              </h3>
            </div>
            {/* Traffic light */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-white border border-border rounded-full px-3 py-1.5">
                <span
                  className={`w-3 h-3 rounded-full ${
                    analysisResult.color === 'green'
                      ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]'
                      : 'bg-gray-200'
                  }`}
                />
                <span
                  className={`w-3 h-3 rounded-full ${
                    analysisResult.color === 'yellow'
                      ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)]'
                      : 'bg-gray-200'
                  }`}
                />
                <span
                  className={`w-3 h-3 rounded-full ${
                    analysisResult.color === 'red'
                      ? 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]'
                      : 'bg-gray-200'
                  }`}
                />
              </div>
              <span
                className={`text-xs font-semibold font-body uppercase tracking-wider ${
                  analysisResult.color === 'green'
                    ? 'text-green-600'
                    : analysisResult.color === 'yellow'
                    ? 'text-amber-600'
                    : 'text-red-600'
                }`}
              >
                {analysisResult.color === 'green'
                  ? 'Positiv'
                  : analysisResult.color === 'yellow'
                  ? 'Pruefungsbedarf'
                  : 'Kritisch'}
              </span>
            </div>
          </div>

          <div className="p-5 space-y-5">
            {/* Plausibilitaet */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={15} className="text-accent" />
                <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider font-body">
                  Plausibilitaet
                </h4>
              </div>
              <ul className="space-y-1 ml-6">
                {analysisResult.plausibilitaet.map((item, i) => (
                  <li
                    key={i}
                    className="text-xs text-text-secondary font-body list-disc leading-relaxed"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Fehlende Unterlagen */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={15} className="text-accent-warm" />
                <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider font-body">
                  Fehlende Unterlagen
                </h4>
              </div>
              <ul className="space-y-1 ml-6">
                {analysisResult.fehlend.map((item, i) => (
                  <li
                    key={i}
                    className="text-xs text-text-secondary font-body list-disc leading-relaxed"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Erste Risikoeinschaetzung */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                {analysisResult.color === 'red' ? (
                  <XCircle size={15} className="text-danger" />
                ) : analysisResult.color === 'yellow' ? (
                  <AlertTriangle size={15} className="text-accent-warm" />
                ) : (
                  <CheckCircle2 size={15} className="text-accent" />
                )}
                <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider font-body">
                  Erste Risikoeinschaetzung
                </h4>
              </div>
              <ul className="space-y-1 ml-6">
                {analysisResult.risiko.map((item, i) => (
                  <li
                    key={i}
                    className="text-xs text-text-secondary font-body list-disc leading-relaxed"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
