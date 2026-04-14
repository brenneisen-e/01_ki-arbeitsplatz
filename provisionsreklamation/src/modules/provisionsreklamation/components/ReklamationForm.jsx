import { useState, useMemo } from 'react';
import { clsx } from 'clsx';
import { Send, Upload, Shield, CheckCircle, Sparkles, User, Pencil } from 'lucide-react';
import useBeraterProfil from '../hooks/useBeraterProfil';
import BeraterProfilEditor from './BeraterProfilEditor';

const SPARTEN = [
  'Leben',
  'Kranken (PKV)',
  'Kranken (GKV-Zusatz)',
  'Sach/HUK',
  'Unfall',
  'Gewerbe',
];

const REKLAMATIONSTYPEN = [
  'Fehlende Abschlussprovision',
  'Falsche Bestandsprovision',
  'Unberechtigte Stornobuchung / Provisionsrückforderung',
  'Fehlende Dynamikprovision',
  'Falsche Vermittlerzuordnung',
  'Nicht ausgezahlte Stornoreserve',
  'Fehlende Superprovision / Differenzprovision',
  'Fehler nach Vertragsänderung / Nachtrag',
  'Sonstige',
];

const INITIAL_FORM = {
  vsNummer: '',
  sparte: '',
  vnName: '',
  vertragsbeginn: '',
  monatsbeitrag: '',
  reklamationstyp: '',
  zeitraumVon: '',
  zeitraumBis: '',
  erwartet: '',
  erhalten: '',
  beschreibung: '',
  courtageBezug: false,
  bestaetigung: false,
};

// Realistische Demo-Vorbelegung — passt zum Fehlerbild „fehlende Dynamik-AP
// auf Tarif T-FRV" (identischer Systemfehler wie RK-2026-0041/0045). Dadurch
// wird die Reklamation sofort als auffällig erkannt und reiht sich im
// Backoffice ins Muster ein.
const DEMO_FILL = {
  vsNummer: 'LV-2024-901337',
  sparte: 'Leben',
  vnName: 'Melanie Hoffmann',
  vertragsbeginn: '2024-09-01',
  monatsbeitrag: '175',
  reklamationstyp: 'Fehlende Dynamikprovision',
  zeitraumVon: '2025-09',
  zeitraumBis: '2026-03',
  erwartet: '168.00',
  erhalten: '0.00',
  beschreibung: 'Für den Vertrag meiner Kundin Melanie Hoffmann (VorsorgeFlex, Tarif T-FRV-2024) wurde zum 01.09.2025 die vertraglich vereinbarte 5%-Dynamikerhöhung wirksam. Die daraus resultierende Abschlussprovision auf den Mehrbeitrag wurde bis heute nicht abgerechnet. Es handelt sich offenbar um denselben systemischen Fehler, der bereits bei anderen T-FRV-Verträgen aufgetreten ist.',
  courtageBezug: false,
  bestaetigung: true,
};

export default function ReklamationForm({ onSubmit }) {
  const { profil, updateField, reset } = useBeraterProfil();
  const [showProfilEditor, setShowProfilEditor] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [vorgangsnummer, setVorgangsnummer] = useState('');

  const differenz = useMemo(() => {
    const erw = parseFloat(form.erwartet) || 0;
    const erh = parseFloat(form.erhalten) || 0;
    return (erh - erw).toFixed(2);
  }, [form.erwartet, form.erhalten]);

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const isValid = form.vsNummer && form.sparte && form.vnName && form.vertragsbeginn
    && form.reklamationstyp && form.zeitraumVon && form.zeitraumBis
    && form.erwartet && form.erhalten
    && form.beschreibung.length >= 50 && form.bestaetigung;

  const handleDemoFill = () => {
    setForm({ ...DEMO_FILL });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    setTimeout(() => {
      const nr = `RK-2026-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`;
      setVorgangsnummer(nr);
      setLoading(false);
      setSubmitted(true);
      if (onSubmit) {
        // Muster-Erkennung für Demo: Fehlende Dynamikprovision bei Tarif LV-*
        // matcht das T-FRV-Muster aus den bestehenden Demodaten.
        const matchesDynamikMuster =
          form.reklamationstyp === 'Fehlende Dynamikprovision' && /^LV-/i.test(form.vsNummer);
        onSubmit({
          id: nr,
          vermittler: profil.name,
          vermittlerNr: profil.vermittlerNr,
          agentur: profil.agentur,
          email: profil.email,
          foto: profil.foto || null,
          vsNummer: form.vsNummer,
          sparte: form.sparte,
          vnName: form.vnName,
          vertragsbeginn: form.vertragsbeginn,
          monatsbeitrag: parseFloat(form.monatsbeitrag) || 0,
          typ: form.reklamationstyp,
          zeitraumVon: form.zeitraumVon,
          zeitraumBis: form.zeitraumBis,
          erwartet: parseFloat(form.erwartet) || 0,
          erhalten: parseFloat(form.erhalten) || 0,
          differenz: parseFloat(differenz),
          beschreibung: form.beschreibung,
          status: 'Neu',
          eingangsdatum: new Date().toISOString().split('T')[0],
          auffaellig: matchesDynamikMuster,
          kiBewertung: matchesDynamikMuster ? 'orange' : 'gelb',
          isNeuEingereicht: true,
        });
      }
    }, 500);
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setSubmitted(false);
    setVorgangsnummer('');
  };

  if (submitted) {
    return (
      <div className="card-base p-8 text-center animate-fade-in-up">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-emerald-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Reklamation erfolgreich eingereicht</h3>
        <p className="text-sm text-slate-500 mb-4">
          Vorgangsnummer: <span className="font-mono font-semibold text-slate-700">{vorgangsnummer}</span>
        </p>
        <div className="card-base p-4 text-left max-w-md mx-auto mb-6">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Zusammenfassung</h4>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Berater</dt><dd className="font-medium">{profil.name}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">VS-Nr.</dt><dd className="font-medium">{form.vsNummer}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">VN</dt><dd className="font-medium">{form.vnName}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Typ</dt><dd className="font-medium">{form.reklamationstyp}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Differenz</dt><dd className="font-mono font-semibold text-red-600">{differenz} EUR</dd></div>
          </dl>
        </div>
        <p className="text-xs text-slate-400 mb-6">Der Vorgang ist jetzt im Tab „Backoffice" einsehbar. Bearbeitungszeit i.d.R. 5–10 Werktage.</p>
        <button onClick={handleReset} className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors">
          Neue Reklamation einreichen
        </button>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Demo-Aktion */}
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={handleDemoFill}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
            title="Formular mit realistischen Beispieldaten vorbelegen"
          >
            <Sparkles size={14} strokeWidth={2} />
            Demo-Daten eintragen
          </button>
        </div>

        {/* Block 1: Vermittlerdaten */}
        <div className="card-base p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-800">Vermittlerdaten</h3>
            <button
              type="button"
              onClick={() => setShowProfilEditor(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="Namen und Foto des Beraters hinterlegen"
            >
              <Pencil size={13} strokeWidth={2} />
              Bearbeiten
            </button>
          </div>
          <div className="flex items-start gap-4 mb-4">
            {profil.foto ? (
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-200 shrink-0">
                <img src={profil.foto} alt={profil.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center shrink-0">
                <User size={30} className="text-slate-400" strokeWidth={1.5} />
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">{profil.name}</p>
              <p className="text-xs text-slate-500">{profil.vermittlerNr} | {profil.agentur}</p>
              <p className="text-xs text-slate-400 mt-0.5">{profil.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Vermittlername" value={profil.name} readonly />
            <FormField label="Vermittlernummer" value={profil.vermittlerNr} readonly />
            <FormField label="Agentur / Maklerbüro" value={profil.agentur} readonly />
            <FormField label="E-Mail" value={profil.email} readonly />
          </div>
        </div>

        {/* Block 2: Betroffener Vertrag */}
        <div className="card-base p-6">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Betroffener Vertrag</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Versicherungsscheinnummer" value={form.vsNummer} onChange={handleChange('vsNummer')} placeholder="z.B. LV-2024-738291" required />
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Sparte <span className="text-red-400">*</span></label>
              <select value={form.sparte} onChange={handleChange('sparte')} required className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
                <option value="">Bitte wählen...</option>
                {SPARTEN.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <FormField label="Versicherungsnehmer (Name)" value={form.vnName} onChange={handleChange('vnName')} placeholder="Kundenname" required />
            <FormField label="Vertragsbeginn" type="date" value={form.vertragsbeginn} onChange={handleChange('vertragsbeginn')} required />
            <FormField label="Monatsbeitrag (EUR)" type="number" value={form.monatsbeitrag} onChange={handleChange('monatsbeitrag')} placeholder="z.B. 150.00" />
          </div>
        </div>

        {/* Block 3: Reklamationsdetails */}
        <div className="card-base p-6">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Reklamationsdetails</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Reklamationstyp <span className="text-red-400">*</span></label>
              <select value={form.reklamationstyp} onChange={handleChange('reklamationstyp')} required className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
                <option value="">Bitte wählen...</option>
                {REKLAMATIONSTYPEN.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <FormField label="Abrechnungszeitraum (von)" type="month" value={form.zeitraumVon} onChange={handleChange('zeitraumVon')} required />
            <FormField label="Abrechnungszeitraum (bis)" type="month" value={form.zeitraumBis} onChange={handleChange('zeitraumBis')} required />
            <FormField label="Erwarteter Betrag (EUR)" type="number" value={form.erwartet} onChange={handleChange('erwartet')} placeholder="0.00" required />
            <FormField label="Erhaltener Betrag (EUR)" type="number" value={form.erhalten} onChange={handleChange('erhalten')} placeholder="0.00" required />
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Differenz (EUR)</label>
              <input type="text" value={`${differenz} EUR`} readOnly className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-500 font-mono" />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Beschreibung / Begründung <span className="text-red-400">*</span>
              <span className="text-slate-400 font-normal ml-1">(min. 50 Zeichen)</span>
            </label>
            <textarea
              value={form.beschreibung}
              onChange={handleChange('beschreibung')}
              rows={4}
              required
              minLength={50}
              placeholder="Bitte beschreiben Sie den Sachverhalt möglichst detailliert..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-y"
            />
            <p className="text-xs text-slate-400 mt-1">{form.beschreibung.length}/50 Zeichen</p>
          </div>
          <div className="mt-4">
            <label className="block text-xs font-medium text-slate-600 mb-1">Dokumente</label>
            <div className="flex items-center gap-2 px-3 py-2 border border-dashed border-slate-300 rounded-lg bg-slate-50">
              <Upload size={16} className="text-slate-400" />
              <span className="text-xs text-slate-400">Provisionsabrechnung, Courtagevereinbarung, Korrespondenz (in Demo deaktiviert)</span>
            </div>
          </div>
          <label className="flex items-center gap-2 mt-4 text-sm text-slate-600 cursor-pointer">
            <input type="checkbox" checked={form.courtageBezug} onChange={handleChange('courtageBezug')} className="rounded border-slate-300" />
            Ich beziehe mich auf eine individuelle Courtagevereinbarung
          </label>
        </div>

        {/* Block 4: Rechtlicher Hinweis & Submit */}
        <div className="card-base p-6">
          <label className="flex items-start gap-2 text-sm text-slate-700 cursor-pointer">
            <input type="checkbox" checked={form.bestaetigung} onChange={handleChange('bestaetigung')} required className="rounded border-slate-300 mt-0.5" />
            <span>Ich bestätige die Richtigkeit meiner Angaben gemäß §87c HGB.</span>
          </label>
          <div className="flex items-start gap-2 mt-3 p-3 bg-slate-50 rounded-lg">
            <Shield size={14} className="text-slate-400 mt-0.5 shrink-0" />
            <p className="text-xs text-slate-400">
              Sie haben gem. §87c HGB einen Anspruch auf monatliche Provisionsabrechnung und einen
              jederzeit durchsetzbaren Anspruch auf Erteilung eines Buchauszugs.
            </p>
          </div>
          <div className="mt-4">
            <button
              type="submit"
              disabled={!isValid || loading}
              className={clsx(
                'flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg transition-colors',
                isValid && !loading
                  ? 'bg-slate-800 text-white hover:bg-slate-700'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              )}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Wird eingereicht...
                </>
              ) : (
                <>
                  <Send size={16} strokeWidth={1.75} />
                  Reklamation einreichen
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {showProfilEditor && (
        <BeraterProfilEditor
          profil={profil}
          onUpdate={updateField}
          onReset={reset}
          onClose={() => setShowProfilEditor(false)}
        />
      )}
    </>
  );
}

function FormField({ label, value, onChange, readonly, type = 'text', placeholder, required }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        readOnly={readonly}
        placeholder={placeholder}
        required={required}
        step={type === 'number' ? '0.01' : undefined}
        className={clsx(
          'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400',
          readonly ? 'bg-slate-50 text-slate-500' : 'bg-white'
        )}
      />
    </div>
  );
}
