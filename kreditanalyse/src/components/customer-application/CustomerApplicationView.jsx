/**
 * CustomerApplicationView -- Customer-facing credit application form.
 * This is the "Kundenperspektive" pre-stage where customers submit their
 * own credit applications before they appear on the internal dashboard.
 */

import { useState, useCallback } from 'react';
import {
  Building2,
  Users,
  Banknote,
  Send,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  UserCircle,
  Phone,
  Mail,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RECHTSFORMEN = [
  'GmbH', 'GmbH & Co. KG', 'AG', 'UG', 'OHG', 'KG',
  'Einzelunternehmen', 'eG', 'GbR',
];

const KREDITARTEN = [
  'Investitionskredit', 'Betriebsmittelkredit', 'Kontokorrentlinie',
  'Avalkredit', 'Immobilienfinanzierung',
];

const VERWENDUNG_KATEGORIEN = [
  'Maschine/Anlage', 'Immobilie', 'Betriebsmittel',
  'Akquisition', 'Umschuldung', 'Sonstiges',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fmt = new Intl.NumberFormat('de-DE');

function formatDE(v) {
  if (v === '' || v === null || v === undefined) return '';
  const n = typeof v === 'string' ? parseInt(v, 10) : v;
  return isNaN(n) ? '' : fmt.format(n);
}

function parseDE(str) {
  const raw = String(str).replace(/[^\d]/g, '');
  return raw ? parseInt(raw, 10) : '';
}

// ---------------------------------------------------------------------------
// Reusable tiny components
// ---------------------------------------------------------------------------

const inputCls =
  'w-full px-3 py-2 border border-border rounded-md text-sm font-body ' +
  'focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 ' +
  'placeholder:text-text-muted disabled:bg-gray-50 disabled:text-text-muted';

const selectCls =
  'w-full px-3 py-2 border border-border rounded-md text-sm font-body appearance-none bg-surface-card ' +
  'focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20';

const labelCls =
  'block text-xs font-medium text-text-secondary mb-1 uppercase tracking-wider font-body';

function Label({ children, htmlFor }) {
  return <label className={labelCls} htmlFor={htmlFor}>{children}</label>;
}

function SectionCard({ icon: Icon, title, children }) {
  return (
    <div className="bg-surface-card border border-border rounded-lg">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border">
        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-amber-500/10 text-amber-600">
          <Icon size={16} />
        </div>
        <h3 className="text-sm font-headline font-semibold text-text-primary tracking-wide">
          {title}
        </h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function EuroInput({ value, onChange, placeholder = '0', id }) {
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
        className={inputCls + ' pr-8 font-mono'}
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm pointer-events-none" aria-hidden="true">&euro;</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function CustomerApplicationView() {
  const { dispatch, navigate } = useApp();

  // Form state
  const [firma, setFirma] = useState('');
  const [rechtsform, setRechtsform] = useState('GmbH');
  const [branche, setBranche] = useState('');
  const [gruendung, setGruendung] = useState('');
  const [strasse, setStrasse] = useState('');
  const [plz, setPlz] = useState('');
  const [ort, setOrt] = useState('');
  const [mitarbeiter, setMitarbeiter] = useState('');

  // Contact person
  const [ansprechpartner, setAnsprechpartner] = useState('');
  const [telefon, setTelefon] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('');

  // Loan request
  const [kreditArt, setKreditArt] = useState('Investitionskredit');
  const [betrag, setBetrag] = useState('');
  const [laufzeit, setLaufzeit] = useState('');
  const [verwendungKategorie, setVerwendungKategorie] = useState('Maschine/Anlage');
  const [verwendung, setVerwendung] = useState('');
  const [sicherheiten, setSicherheiten] = useState('');

  // UI state
  const [validationErrors, setValidationErrors] = useState([]);
  const [showErrors, setShowErrors] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isFieldError = (fieldName) => showErrors && validationErrors.some(e => e.field === fieldName);

  const validateForm = useCallback(() => {
    const errors = [];
    if (!firma.trim()) errors.push({ field: 'firma', label: 'Firmenname' });
    if (!branche.trim()) errors.push({ field: 'branche', label: 'Branche' });
    if (!ansprechpartner.trim()) errors.push({ field: 'ansprechpartner', label: 'Ansprechpartner' });
    if (!email.trim()) errors.push({ field: 'email', label: 'E-Mail' });
    if (!kreditArt) errors.push({ field: 'kreditArt', label: 'Kreditart' });
    const b = typeof betrag === 'number' ? betrag : parseInt(betrag, 10) || 0;
    if (!b) errors.push({ field: 'betrag', label: 'Kreditbetrag' });
    if (!laufzeit) errors.push({ field: 'laufzeit', label: 'Gewuenschte Laufzeit' });
    if (!verwendung.trim()) errors.push({ field: 'verwendung', label: 'Verwendungszweck' });
    return errors;
  }, [firma, branche, ansprechpartner, email, kreditArt, betrag, laufzeit, verwendung]);

  const handleSubmit = useCallback(() => {
    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      setShowErrors(true);
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

    // Create a new company entry with status "eingegangen"
    const newId = `CRED-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`;
    dispatch({
      type: 'ADD_CUSTOMER_APPLICATION',
      company: {
        id: newId,
        firma,
        rechtsform,
        branche,
        gruendung: gruendung ? parseInt(gruendung, 10) : '',
        adresse: { strasse, plz, ort },
        mitarbeiter: mitarbeiter ? parseInt(mitarbeiter, 10) : '',
        ansprechpartner: { name: ansprechpartner, telefon, email, position },
        kredit: {
          art: kreditArt,
          betrag: typeof betrag === 'number' ? betrag : parseInt(betrag, 10) || 0,
          laufzeit: parseInt(laufzeit, 10) || 60,
          verwendung,
          verwendungKategorie,
        },
        sicherheiten_vorerfassung: sicherheiten,
        status: 'eingegangen',
      },
    });

    setSubmitted(true);
  }, [validateForm, firma, rechtsform, branche, gruendung, strasse, plz, ort,
      mitarbeiter, ansprechpartner, telefon, email, position, kreditArt,
      betrag, laufzeit, verwendung, verwendungKategorie, sicherheiten, dispatch]);

  // Success screen after submission
  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-20">
        <div className="bg-surface-card border border-border rounded-xl p-10 text-center space-y-5">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 size={36} strokeWidth={1.5} className="text-emerald-600" />
            </div>
          </div>
          <h2 className="text-xl font-headline font-bold text-text-primary">
            Kreditantrag erfolgreich eingereicht!
          </h2>
          <p className="text-sm text-text-secondary font-body max-w-md mx-auto">
            Vielen Dank fuer Ihren Kreditantrag. Unser Kreditteam wird Ihren Antrag
            prufen und sich in Kuerze bei Ihnen melden.
          </p>
          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-text-primary rounded-lg text-sm font-semibold hover:bg-surface transition-colors"
            >
              Neuen Antrag stellen
            </button>
            <button
              type="button"
              onClick={() => navigate('dashboard')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-light transition-colors"
            >
              Zum Dashboard (Intern)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-500 text-white">
          <Send size={20} />
        </div>
        <div>
          <h2 className="text-lg font-headline font-semibold text-text-primary">
            Kreditantrag stellen
          </h2>
          <p className="text-xs text-text-muted font-body">
            Kundenperspektive – Stellen Sie hier Ihren Kreditantrag. Pflichtfelder sind mit * markiert.
          </p>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle size={18} className="text-amber-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Hinweis</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Nach Einreichung wird Ihr Antrag von unserem Kreditteam geprueft. Sie erhalten zeitnah eine Rueckmeldung.
          </p>
        </div>
      </div>

      {/* Validation errors banner */}
      {showErrors && validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-danger mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-danger">Bitte fuellen Sie alle Pflichtfelder aus:</p>
            <p className="text-xs text-red-600 mt-1">{validationErrors.map(e => e.label).join(', ')}</p>
          </div>
        </div>
      )}

      {/* SECTION: Unternehmensdaten */}
      <SectionCard icon={Building2} title="Unternehmensdaten">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <Label htmlFor="firma">Firmenname *</Label>
            <input
              id="firma"
              type="text"
              value={firma}
              onChange={(e) => setFirma(e.target.value)}
              placeholder="Mustermann GmbH"
              className={inputCls + (isFieldError('firma') ? ' border-danger ring-2 ring-danger/20' : '')}
            />
          </div>
          <div>
            <Label htmlFor="rechtsform">Rechtsform</Label>
            <div className="relative">
              <select id="rechtsform" value={rechtsform} onChange={(e) => setRechtsform(e.target.value)} className={selectCls}>
                {RECHTSFORMEN.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted" />
            </div>
          </div>
          <div>
            <Label htmlFor="branche">Branche *</Label>
            <input
              id="branche"
              type="text"
              value={branche}
              onChange={(e) => setBranche(e.target.value)}
              placeholder="z.B. Maschinenbau"
              className={inputCls + (isFieldError('branche') ? ' border-danger ring-2 ring-danger/20' : '')}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <Label htmlFor="gruendung">Gruendungsjahr</Label>
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
            <Label htmlFor="mitarbeiter">Mitarbeiterzahl</Label>
            <input
              id="mitarbeiter"
              type="number"
              value={mitarbeiter}
              onChange={(e) => setMitarbeiter(e.target.value)}
              placeholder="50"
              min="0"
              className={inputCls + ' font-mono'}
            />
          </div>
          <div>
            <Label htmlFor="ort">Standort</Label>
            <input
              id="ort"
              type="text"
              value={ort}
              onChange={(e) => setOrt(e.target.value)}
              placeholder="z.B. Koeln"
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
              placeholder="50667"
              maxLength={5}
              className={inputCls + ' font-mono'}
            />
          </div>
        </div>
      </SectionCard>

      {/* SECTION: Ansprechpartner */}
      <SectionCard icon={UserCircle} title="Ansprechpartner">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="ansprechpartner">Name *</Label>
            <input
              id="ansprechpartner"
              type="text"
              value={ansprechpartner}
              onChange={(e) => setAnsprechpartner(e.target.value)}
              placeholder="Max Mustermann"
              className={inputCls + (isFieldError('ansprechpartner') ? ' border-danger ring-2 ring-danger/20' : '')}
            />
          </div>
          <div>
            <Label htmlFor="position">Position / Funktion</Label>
            <input
              id="position"
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Geschaeftsfuehrer"
              className={inputCls}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <Label htmlFor="email">E-Mail *</Label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="max@mustermann.de"
                className={inputCls + ' pl-9' + (isFieldError('email') ? ' border-danger ring-2 ring-danger/20' : '')}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="telefon">Telefon</Label>
            <div className="relative">
              <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                id="telefon"
                type="tel"
                value={telefon}
                onChange={(e) => setTelefon(e.target.value)}
                placeholder="+49 221 1234567"
                className={inputCls + ' pl-9'}
              />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* SECTION: Kreditwunsch */}
      <SectionCard icon={Banknote} title="Kreditwunsch">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="kreditArt">Kreditart *</Label>
            <div className="relative">
              <select id="kreditArt" value={kreditArt} onChange={(e) => setKreditArt(e.target.value)} className={selectCls}>
                {KREDITARTEN.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted" />
            </div>
          </div>
          <div>
            <Label htmlFor="betrag">Gewuenschter Kreditbetrag *</Label>
            <EuroInput id="betrag" value={betrag} onChange={setBetrag} />
          </div>
          <div>
            <Label htmlFor="laufzeit">Gewuenschte Laufzeit (Monate) *</Label>
            <input
              id="laufzeit"
              type="number"
              value={laufzeit}
              onChange={(e) => setLaufzeit(e.target.value)}
              placeholder="60"
              min="1"
              className={inputCls + ' font-mono' + (isFieldError('laufzeit') ? ' border-danger ring-2 ring-danger/20' : '')}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
          <div>
            <Label htmlFor="verwendungKategorie">Verwendungskategorie</Label>
            <div className="relative">
              <select id="verwendungKategorie" value={verwendungKategorie} onChange={(e) => setVerwendungKategorie(e.target.value)} className={selectCls}>
                {VERWENDUNG_KATEGORIEN.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted" />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="verwendung">Verwendungszweck *</Label>
          <textarea
            id="verwendung"
            value={verwendung}
            onChange={(e) => setVerwendung(e.target.value)}
            placeholder="Beschreiben Sie, wofuer der Kredit verwendet werden soll..."
            rows={3}
            className={inputCls + ' resize-y' + (isFieldError('verwendung') ? ' border-danger ring-2 ring-danger/20' : '')}
          />
        </div>

        <div className="mt-4">
          <Label htmlFor="sicherheiten">Vorhandene Sicherheiten (optional)</Label>
          <textarea
            id="sicherheiten"
            value={sicherheiten}
            onChange={(e) => setSicherheiten(e.target.value)}
            placeholder="z.B. Grundschuld auf Betriebsgelaende, Maschinen, Buergschaften..."
            rows={2}
            className={inputCls + ' resize-y'}
          />
        </div>
      </SectionCard>

      {/* Submit button */}
      <button
        type="button"
        onClick={handleSubmit}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-base font-semibold font-body bg-amber-500 text-white shadow-sm hover:bg-amber-600 active:bg-amber-700 transition-all duration-150"
      >
        <Send size={20} />
        Kreditantrag einreichen
      </button>
    </div>
  );
}
