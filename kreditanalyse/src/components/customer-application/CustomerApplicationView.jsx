/**
 * CustomerApplicationView -- Customer-facing credit application form.
 * This is the "Kundenperspektive" pre-stage where customers submit their
 * own credit applications before they appear on the internal dashboard.
 *
 * Includes demo document upload with simulated AI extraction.
 */

import { useState, useCallback, useRef } from 'react';
import {
  Building2,
  Banknote,
  Send,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  UserCircle,
  Phone,
  Mail,
  Upload,
  FileText,
  Sparkles,
  Loader2,
  Download,
  X,
  Eye,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  generateBilanzPdf,
  generateGuvPdf,
  generateBwaPdf,
  DEMO_EXTRACTION_RESULT,
} from '../../utils/demoPdfGenerator';

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
const fmtCurrency = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 });

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

function SectionCard({ icon: Icon, title, badge, children }) {
  return (
    <div className="bg-surface-card border border-border rounded-lg">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border">
        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-amber-500/10 text-amber-600">
          <Icon size={16} />
        </div>
        <h3 className="text-sm font-headline font-semibold text-text-primary tracking-wide">
          {title}
        </h3>
        {badge && (
          <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
            {badge}
          </span>
        )}
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
// AI Extraction Steps (simulated)
// ---------------------------------------------------------------------------

const EXTRACTION_STEPS = [
  'Dokumente werden gelesen...',
  'Bilanzpositionen werden extrahiert...',
  'GuV-Daten werden analysiert...',
  'Kennzahlen werden berechnet...',
  'Unternehmensdaten werden zugeordnet...',
  'Antrag wird vorbefüllt...',
];

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

  // Document upload state
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [extracting, setExtracting] = useState(false);
  const [extractionStep, setExtractionStep] = useState(0);
  const [extractionDone, setExtractionDone] = useState(false);
  const [extractedSummary, setExtractedSummary] = useState(null);
  const fileInputRef = useRef(null);

  // UI state
  const [validationErrors, setValidationErrors] = useState([]);
  const [showErrors, setShowErrors] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isFieldError = (fieldName) => showErrors && validationErrors.some(e => e.field === fieldName);

  // Handle file upload (demo: accepts any file, simulates AI extraction)
  const handleFileUpload = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const newFiles = files.map(f => ({
      name: f.name,
      size: f.size,
      type: f.type,
      uploadedAt: new Date(),
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
    // Reset the input so the same file can be re-uploaded
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const removeFile = useCallback((idx) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
  }, []);

  // Simulated AI extraction
  const runExtraction = useCallback(() => {
    setExtracting(true);
    setExtractionStep(0);
    setExtractionDone(false);

    // Simulate step-by-step extraction with delays
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setExtractionStep(step);
      if (step >= EXTRACTION_STEPS.length) {
        clearInterval(interval);
        // Apply demo extraction result
        const d = DEMO_EXTRACTION_RESULT;
        setFirma(d.firma);
        setRechtsform(d.rechtsform);
        setBranche(d.branche);
        setGruendung(d.gruendung);
        setStrasse(d.strasse);
        setPlz(d.plz);
        setOrt(d.ort);
        setMitarbeiter(d.mitarbeiter);
        setAnsprechpartner(d.ansprechpartner);
        setPosition(d.position);
        setEmail(d.email);
        setTelefon(d.telefon);
        setKreditArt(d.kreditArt);
        setVerwendungKategorie(d.verwendungKategorie);
        setVerwendung(d.verwendung);
        setSicherheiten(d.sicherheiten);
        setExtractedSummary(d.financialSummary);
        setExtracting(false);
        setExtractionDone(true);
      }
    }, 600);
  }, []);

  const validateForm = useCallback(() => {
    const errors = [];
    if (!firma.trim()) errors.push({ field: 'firma', label: 'Firmenname' });
    if (!branche.trim()) errors.push({ field: 'branche', label: 'Branche' });
    if (!ansprechpartner.trim()) errors.push({ field: 'ansprechpartner', label: 'Ansprechpartner' });
    if (!email.trim()) errors.push({ field: 'email', label: 'E-Mail' });
    if (!kreditArt) errors.push({ field: 'kreditArt', label: 'Kreditart' });
    const b = typeof betrag === 'number' ? betrag : parseInt(betrag, 10) || 0;
    if (!b) errors.push({ field: 'betrag', label: 'Kreditbetrag' });
    if (!laufzeit) errors.push({ field: 'laufzeit', label: 'Gewünschte Laufzeit' });
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
        uploadedDocuments: uploadedFiles.map(f => ({ name: f.name, size: f.size, type: f.type, uploadedAt: f.uploadedAt?.toISOString?.() || new Date().toISOString() })),
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
            Vielen Dank für Ihren Kreditantrag. Unser Kreditteam wird Ihren Antrag
            prüfen und sich in Kürze bei Ihnen melden.
          </p>
          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setExtractionDone(false);
                setExtractedSummary(null);
                setUploadedFiles([]);
                setFirma(''); setBranche(''); setGruendung(''); setStrasse(''); setPlz('');
                setOrt(''); setMitarbeiter(''); setAnsprechpartner(''); setTelefon('');
                setEmail(''); setPosition(''); setBetrag(''); setLaufzeit('');
                setVerwendung(''); setSicherheiten('');
              }}
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
            Laden Sie Ihre Jahresabschlüsse (Bilanz, GuV, BWA) hoch – unsere KI füllt den Antrag automatisch für Sie aus.
            Nach Einreichung wird Ihr Antrag von unserem Kreditteam geprüft.
          </p>
        </div>
      </div>

      {/* Validation errors banner */}
      {showErrors && validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-danger mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-danger">Bitte füllen Sie alle Pflichtfelder aus:</p>
            <p className="text-xs text-red-600 mt-1">{validationErrors.map(e => e.label).join(', ')}</p>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* DOCUMENT UPLOAD SECTION                                            */}
      {/* ================================================================== */}
      <SectionCard icon={Upload} title="Dokumente hochladen" badge={extractionDone ? 'KI-Analyse abgeschlossen' : null}>
        {/* Demo documents download */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5">
          <div className="flex items-start gap-3">
            <Eye size={16} className="text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-blue-800">Demo-Dokumente herunterladen</p>
              <p className="text-xs text-blue-700 mt-0.5 mb-3">
                Laden Sie die Beispieldokumente der Müller Maschinenbau GmbH herunter, um die KI-Analyse zu testen.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={generateBilanzPdf}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-300 text-blue-700 rounded text-xs font-semibold hover:bg-blue-50 transition-colors"
                >
                  <Download size={12} /> Bilanz 2021–2023
                </button>
                <button
                  type="button"
                  onClick={generateGuvPdf}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-300 text-blue-700 rounded text-xs font-semibold hover:bg-blue-50 transition-colors"
                >
                  <Download size={12} /> GuV 2021–2023
                </button>
                <button
                  type="button"
                  onClick={generateBwaPdf}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-300 text-blue-700 rounded text-xs font-semibold hover:bg-blue-50 transition-colors"
                >
                  <Download size={12} /> BWA 12/2023
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Upload area */}
        <div
          className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/30 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.xlsx,.xls,.csv,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Upload size={28} strokeWidth={1.5} className="text-text-muted mx-auto mb-2" />
          <p className="text-sm text-text-secondary font-body">
            Dokumente hierhin ziehen oder <span className="text-amber-600 font-semibold">durchsuchen</span>
          </p>
          <p className="text-xs text-text-muted mt-1">
            PDF, Excel, Word – Bilanz, GuV, BWA, Jahresabschluss
          </p>
        </div>

        {/* Uploaded files list */}
        {uploadedFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            {uploadedFiles.map((file, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-surface rounded-lg px-4 py-2.5 border border-border">
                <FileText size={16} className="text-amber-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-body text-text-primary truncate">{file.name}</p>
                  <p className="text-xs text-text-muted">{(file.size / 1024).toFixed(0)} KB</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="p-1 text-text-muted hover:text-danger transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* AI extraction button + progress */}
        {uploadedFiles.length > 0 && !extractionDone && (
          <div className="mt-4">
            {extracting ? (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-5">
                <div className="flex items-center gap-3 mb-4">
                  <Loader2 size={20} className="text-amber-600 animate-spin" />
                  <p className="text-sm font-semibold text-amber-800">KI analysiert Ihre Dokumente...</p>
                </div>
                <div className="space-y-2">
                  {EXTRACTION_STEPS.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      {idx < extractionStep ? (
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                      ) : idx === extractionStep ? (
                        <Loader2 size={14} className="text-amber-600 animate-spin shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0" />
                      )}
                      <span className={`text-xs font-body ${idx < extractionStep ? 'text-emerald-700' : idx === extractionStep ? 'text-amber-800 font-semibold' : 'text-text-muted'}`}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={runExtraction}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-sm font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm"
              >
                <Sparkles size={18} />
                KI-Analyse starten – Antrag automatisch ausfüllen
              </button>
            )}
          </div>
        )}

        {/* Extraction result summary */}
        {extractionDone && extractedSummary && (
          <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <p className="text-sm font-semibold text-emerald-800">Daten erfolgreich extrahiert</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Umsatz 2023', value: fmtCurrency.format(extractedSummary.umsatz2023) },
                { label: 'Jahresüberschuss', value: fmtCurrency.format(extractedSummary.jahresueberschuss2023) },
                { label: 'EK-Quote', value: extractedSummary.eigenkapitalquote },
                { label: 'Umsatzrendite', value: extractedSummary.umsatzrendite },
              ].map((item) => (
                <div key={item.label} className="bg-white rounded-md p-2.5 border border-emerald-100">
                  <p className="text-[10px] text-text-muted uppercase tracking-wider">{item.label}</p>
                  <p className="text-sm font-mono font-semibold text-text-primary mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-emerald-700 mt-3">
              Alle Felder wurden vorbefüllt. Bitte prüfen Sie die Daten und passen Sie bei Bedarf an.
            </p>
          </div>
        )}
      </SectionCard>

      {/* ================================================================== */}
      {/* SECTION: Unternehmensdaten                                         */}
      {/* ================================================================== */}
      <SectionCard icon={Building2} title="Unternehmensdaten" badge={extractionDone ? 'Vorbefüllt' : null}>
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
            <Label htmlFor="gruendung">Gründungsjahr</Label>
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
              placeholder="z.B. Köln"
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <Label htmlFor="strasse">Straße</Label>
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
      <SectionCard icon={UserCircle} title="Ansprechpartner" badge={extractionDone ? 'Vorbefüllt' : null}>
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
              placeholder="Geschäftsführer"
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
      <SectionCard icon={Banknote} title="Kreditwunsch" badge={extractionDone ? 'Vorbefüllt' : null}>
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
            <Label htmlFor="betrag">Gewünschter Kreditbetrag *</Label>
            <EuroInput id="betrag" value={betrag} onChange={setBetrag} />
          </div>
          <div>
            <Label htmlFor="laufzeit">Gewünschte Laufzeit (Monate) *</Label>
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
            placeholder="Beschreiben Sie, wofür der Kredit verwendet werden soll..."
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
            placeholder="z.B. Grundschuld auf Betriebsgelände, Maschinen, Bürgschaften..."
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
