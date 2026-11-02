import { useEffect, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { Upload, FileText, Camera, X, ArrowRight, Check, Sparkles } from 'lucide-react';
import { SCANNER_SCHRITTE, ERKANNTE_FELDER, DOKUMENTTYPEN, KUNDENTYPEN, WAEHRUNGEN, FORDERUNGSKATEGORIEN, formularAusErkennung } from '../../data/scanner';
import { useCollections } from '../../hooks/useCollections';
import { Modal } from '../../components/ui/primitives';

function Schrittanzeige({ aktiv }) {
  return (
    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
      <div className="flex items-center justify-center gap-2">
        {SCANNER_SCHRITTE.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span
                className={clsx('w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 transition-colors',
                  s.id < aktiv ? 'text-white' : s.id === aktiv ? 'text-white' : 'bg-slate-200 text-slate-500')}
                style={s.id <= aktiv ? { background: s.id < aktiv ? '#10b981' : 'var(--mode-primary)' } : undefined}
              >
                {s.id < aktiv ? <Check size={13} strokeWidth={3} /> : s.id}
              </span>
              <span className={clsx('text-xs font-medium whitespace-nowrap',
                s.id === aktiv ? 'text-slate-900' : s.id < aktiv ? 'text-emerald-700' : 'text-slate-400')}>
                {s.label}
              </span>
            </div>
            {i < SCANNER_SCHRITTE.length - 1 && (
              <span className={clsx('w-10 h-0.5 rounded', s.id < aktiv ? 'bg-emerald-500' : 'bg-slate-200')} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Feld({ label, children, pflicht }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-slate-700 mb-1">
        {label}{pflicht && <span className="text-red-500"> *</span>}
      </span>
      {children}
    </label>
  );
}

const inputKlassen = 'w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-200';

export default function DocumentScannerModal() {
  const { scannerOffen, setScannerOffen, toast } = useCollections();
  const [schritt, setSchritt] = useState(1);
  const [datei, setDatei] = useState(null);
  const [vorschau, setVorschau] = useState(null);
  const [analysiert, setAnalysiert] = useState(false);
  const [felder, setFelder] = useState(() => Object.fromEntries(ERKANNTE_FELDER.map(f => [f.id, f.wert])));
  const [doktyp, setDoktyp] = useState('mahnung');
  const [formular, setFormular] = useState(formularAusErkennung);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const zuruecksetzen = () => {
    clearTimeout(timerRef.current);
    setSchritt(1); setDatei(null); setVorschau(null); setAnalysiert(false);
    setFelder(Object.fromEntries(ERKANNTE_FELDER.map(f => [f.id, f.wert])));
    setDoktyp('mahnung');
    setFormular(formularAusErkennung());
  };

  const schliessen = () => { setScannerOffen(false); zuruecksetzen(); };

  const dateiUebernehmen = f => {
    if (!f) return;
    setDatei(f);
    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = e => setVorschau(e.target.result);
      reader.readAsDataURL(f);
    } else {
      setVorschau(null);
    }
  };

  const analyseStarten = () => {
    if (!datei) { toast('Bitte laden Sie zuerst ein Dokument hoch.', 'error'); return; }
    setSchritt(2);
    setAnalysiert(false);
    timerRef.current = setTimeout(() => {
      setAnalysiert(true);
      toast('Dokumentenanalyse abgeschlossen', 'success');
    }, 1800);
  };

  const zuSchritt3 = () => {
    // Erkannte Werte in das Anlageformular uebernehmen (Legacy: goToStep3).
    const adresse = felder.adresse || '';
    const [strasse = '', ortTeil = ''] = adresse.split(',').map(s => s.trim());
    const plzOrt = ortTeil.match(/^(\d{5})\s+(.*)$/);
    setFormular(f => ({
      ...f,
      name: felder.name,
      strasse,
      plz: plzOrt ? plzOrt[1] : f.plz,
      ort: plzOrt ? plzOrt[2] : ortTeil,
      iban: felder.iban,
      betrag: Number(String(felder.betrag).replace(/[€\s.]/g, '').replace(',', '.')) || 0,
      faellig: felder.faellig,
    }));
    setSchritt(3);
  };

  const anlegen = () => {
    if (!formular.name || !formular.strasse || !formular.iban || !formular.betrag) {
      toast('Bitte füllen Sie alle Pflichtfelder aus.', 'error');
      return;
    }
    toast(`Kunde „${formular.name}" wurde angelegt und der Segmentierung hinzugefügt.`, 'success');
    schliessen();
  };

  if (!scannerOffen) return null;

  const footer = schritt === 1
    ? (
      <div className="flex justify-between">
        <button onClick={schliessen} className="px-4 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
          Abbrechen
        </button>
        <button
          onClick={analyseStarten}
          disabled={!datei}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'var(--mode-primary)' }}
        >
          <Sparkles size={15} strokeWidth={2} /> KI-Erkennung starten
        </button>
      </div>
    )
    : schritt === 2
      ? (
        <div className="flex justify-between">
          <button onClick={() => setSchritt(1)} className="px-4 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
            Zurück
          </button>
          <button
            onClick={zuSchritt3}
            disabled={!analysiert}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'var(--mode-primary)' }}
          >
            Weiter zur Kundenanlage <ArrowRight size={15} />
          </button>
        </div>
      )
      : (
        <div className="flex justify-between">
          <button onClick={() => setSchritt(2)} className="px-4 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
            Zurück
          </button>
          <button
            onClick={anlegen}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-opacity hover:opacity-90"
            style={{ background: 'var(--mode-primary)' }}
          >
            <Check size={15} strokeWidth={2.4} /> Kunde anlegen
          </button>
        </div>
      );

  return (
    <Modal
      offen
      onClose={schliessen}
      titel="Akte scannen"
      subtitel="Dokument hochladen, per KI auslesen und als neuen Fall anlegen"
      breite="max-w-4xl"
      footer={footer}
    >
      <Schrittanzeige aktiv={schritt} />

      {schritt === 1 && (
        <div className="p-6">
          {!datei ? (
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); dateiUebernehmen(e.dataTransfer.files?.[0]); }}
              className={clsx('rounded-2xl border-2 border-dashed px-8 py-14 text-center transition-colors',
                dragOver ? 'border-slate-400 bg-slate-50' : 'border-slate-200')}
            >
              <Upload size={36} className="mx-auto text-slate-300" strokeWidth={1.5} />
              <h3 className="text-base font-semibold text-slate-800 mt-4">Dokument hochladen</h3>
              <p className="text-sm text-slate-500 mt-1">
                Mahnung, Rechnung oder Kreditvertrag hierher ziehen — oder eine Datei auswählen.
              </p>
              <input
                ref={inputRef} type="file" accept="image/*,.pdf" className="hidden"
                onChange={e => dateiUebernehmen(e.target.files?.[0])}
              />
              <div className="flex items-center justify-center gap-2 mt-5">
                <button
                  onClick={() => inputRef.current?.click()}
                  className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-opacity hover:opacity-90"
                  style={{ background: 'var(--mode-primary)' }}
                >
                  Datei auswählen
                </button>
                <button
                  onClick={() => toast('Die Kamera-Aufnahme steht in dieser Demo nicht zur Verfügung.', 'info')}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Camera size={15} strokeWidth={1.9} /> Kamera
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-4">Unterstützte Formate: JPG, PNG, PDF</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 p-5 flex items-start gap-5">
              <div className="w-40 h-52 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                {vorschau
                  ? <img src={vorschau} alt="Vorschau des hochgeladenen Dokuments" className="w-full h-full object-contain" />
                  : <FileText size={40} className="text-slate-300" strokeWidth={1.4} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-800 truncate">{datei.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {(datei.size / 1024).toLocaleString('de-DE', { maximumFractionDigits: 0 })} KB · {datei.type || 'Unbekannter Typ'}
                </div>
                <button
                  onClick={() => { setDatei(null); setVorschau(null); }}
                  className="flex items-center gap-1.5 mt-4 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <X size={13} /> Entfernen
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {schritt === 2 && (
        <div className="p-6 grid grid-cols-[240px_1fr] gap-6">
          <div className="rounded-xl border border-slate-200 bg-slate-50 h-72 flex items-center justify-center overflow-hidden">
            {vorschau
              ? <img src={vorschau} alt="Analysiertes Dokument" className="w-full h-full object-contain" />
              : <FileText size={44} className="text-slate-300" strokeWidth={1.4} />}
          </div>

          <div>
            {!analysiert ? (
              <div className="h-72 flex flex-col items-center justify-center gap-3">
                <span
                  className="w-10 h-10 rounded-full border-[3px] border-slate-200 animate-spin-slow"
                  style={{ borderTopColor: 'var(--mode-primary)' }}
                  role="status"
                  aria-label="Analyse läuft"
                />
                <p className="text-sm text-slate-500">KI analysiert Dokument …</p>
              </div>
            ) : (
              <>
                <h4 className="text-sm font-semibold text-slate-800 mb-3">Erkannte Daten</h4>
                <div className="space-y-3">
                  {ERKANNTE_FELDER.map(f => (
                    <div key={f.id} className="flex items-end gap-3">
                      <Feld label={f.label}>
                        <input
                          type="text" value={felder[f.id]}
                          onChange={e => setFelder(v => ({ ...v, [f.id]: e.target.value }))}
                          className={inputKlassen}
                        />
                      </Feld>
                      <span
                        className={clsx('text-[11px] font-bold px-2 py-1 rounded shrink-0 mb-0.5',
                          f.konfidenz >= 95 ? 'text-emerald-700 bg-emerald-50'
                            : f.konfidenz >= 90 ? 'text-amber-700 bg-amber-50' : 'text-slate-600 bg-slate-100')}
                        title="Erkennungssicherheit"
                      >
                        {f.konfidenz} %
                      </span>
                    </div>
                  ))}
                  <Feld label="Dokumenttyp">
                    <select value={doktyp} onChange={e => setDoktyp(e.target.value)} className={inputKlassen}>
                      {DOKUMENTTYPEN.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                  </Feld>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {schritt === 3 && (
        <div className="p-6 space-y-5">
          <div>
            <h4 className="text-sm font-semibold text-slate-800 mb-3">Kundendaten</h4>
            <div className="grid grid-cols-2 gap-4">
              <Feld label="Kundentyp" pflicht>
                <select
                  value={formular.kundentyp}
                  onChange={e => setFormular(f => ({ ...f, kundentyp: e.target.value }))}
                  className={inputKlassen}
                >
                  {KUNDENTYPEN.map(k => <option key={k.value} value={k.value}>{k.label}</option>)}
                </select>
              </Feld>
              <Feld label="Name / Firma" pflicht>
                <input type="text" value={formular.name} onChange={e => setFormular(f => ({ ...f, name: e.target.value }))} className={inputKlassen} />
              </Feld>
              <Feld label="Straße, Hausnummer" pflicht>
                <input type="text" value={formular.strasse} onChange={e => setFormular(f => ({ ...f, strasse: e.target.value }))} className={inputKlassen} />
              </Feld>
              <div className="grid grid-cols-[100px_1fr] gap-3">
                <Feld label="PLZ" pflicht>
                  <input type="text" value={formular.plz} onChange={e => setFormular(f => ({ ...f, plz: e.target.value }))} className={inputKlassen} />
                </Feld>
                <Feld label="Ort" pflicht>
                  <input type="text" value={formular.ort} onChange={e => setFormular(f => ({ ...f, ort: e.target.value }))} className={inputKlassen} />
                </Feld>
              </div>
              <Feld label="Telefon">
                <input type="text" value={formular.telefon} onChange={e => setFormular(f => ({ ...f, telefon: e.target.value }))} className={inputKlassen} />
              </Feld>
              <Feld label="E-Mail">
                <input type="email" value={formular.email} onChange={e => setFormular(f => ({ ...f, email: e.target.value }))} className={inputKlassen} />
              </Feld>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-800 mb-3">Bankverbindung</h4>
            <div className="grid grid-cols-2 gap-4">
              <Feld label="IBAN" pflicht>
                <input type="text" value={formular.iban} onChange={e => setFormular(f => ({ ...f, iban: e.target.value }))} className={clsx(inputKlassen, 'font-mono text-xs')} />
              </Feld>
              <Feld label="BIC">
                <input type="text" value={formular.bic} onChange={e => setFormular(f => ({ ...f, bic: e.target.value }))} className={clsx(inputKlassen, 'font-mono text-xs')} />
              </Feld>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-800 mb-3">Forderung</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-[1fr_110px] gap-3">
                <Feld label="Betrag" pflicht>
                  <input
                    type="number" step="0.01" value={formular.betrag}
                    onChange={e => setFormular(f => ({ ...f, betrag: Number(e.target.value) }))}
                    className={inputKlassen}
                  />
                </Feld>
                <Feld label="Währung">
                  <select value={formular.waehrung} onChange={e => setFormular(f => ({ ...f, waehrung: e.target.value }))} className={inputKlassen}>
                    {WAEHRUNGEN.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                  </select>
                </Feld>
              </div>
              <Feld label="Fälligkeitsdatum (TT.MM.JJJJ)" pflicht>
                <input
                  type="text" value={formular.faellig} placeholder="15.10.2025"
                  onChange={e => setFormular(f => ({ ...f, faellig: e.target.value }))}
                  className={inputKlassen}
                />
              </Feld>
              <Feld label="Kategorie">
                <select value={formular.kategorie} onChange={e => setFormular(f => ({ ...f, kategorie: e.target.value }))} className={inputKlassen}>
                  {FORDERUNGSKATEGORIEN.map(k => <option key={k.value} value={k.value}>{k.label}</option>)}
                </select>
              </Feld>
              <Feld label="Notiz">
                <textarea
                  rows={3} value={formular.notiz} placeholder="Zusätzliche Informationen …"
                  onChange={e => setFormular(f => ({ ...f, notiz: e.target.value }))}
                  className={clsx(inputKlassen, 'resize-y')}
                />
              </Feld>
            </div>
          </div>

          {datei && (
            <div className="rounded-xl border border-slate-200 p-4 flex items-center gap-3">
              <div className="w-12 h-16 rounded border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                {vorschau
                  ? <img src={vorschau} alt="Angehängtes Dokument" className="w-full h-full object-contain" />
                  : <FileText size={20} className="text-slate-300" strokeWidth={1.5} />}
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Dokument angehängt</div>
                <div className="text-[13px] text-slate-800 truncate">{datei.name}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
