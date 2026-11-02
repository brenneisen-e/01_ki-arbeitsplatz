import { useRef, useState } from 'react';
import { X, Upload, Trash2, User, RotateCcw } from 'lucide-react';

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

export default function BeraterProfilEditor({ profil, onUpdate, onReset, onClose }) {
  const fileInputRef = useRef(null);
  const [error, setError] = useState('');

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Bitte nur Bilddateien (JPG, PNG, WebP) auswählen.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('Bild zu groß (max. 2 MB).');
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUpdate('foto', reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="card-base bg-white w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-800">Berater-Profil bearbeiten</h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
            title="Schließen"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Foto */}
          <div className="flex items-center gap-4">
            {profil.foto ? (
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-200 shrink-0">
                <img src={profil.foto} alt={profil.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center shrink-0">
                <User size={36} className="text-slate-400" strokeWidth={1.5} />
              </div>
            )}
            <div className="flex-1 space-y-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                <Upload size={14} /> Foto hochladen
              </button>
              {profil.foto && (
                <button
                  type="button"
                  onClick={() => onUpdate('foto', null)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <Trash2 size={14} /> Foto entfernen
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="hidden"
              />
              <p className="text-[11px] text-slate-400">JPG / PNG / WebP, max. 2 MB</p>
            </div>
          </div>

          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1.5">
              {error}
            </div>
          )}

          {/* Felder */}
          <Field label="Name des Beraters" value={profil.name} onChange={(v) => onUpdate('name', v)} />
          <Field label="Vermittlernummer" value={profil.vermittlerNr} onChange={(v) => onUpdate('vermittlerNr', v)} />
          <Field label="Agentur / Maklerbüro" value={profil.agentur} onChange={(v) => onUpdate('agentur', v)} />
          <Field label="E-Mail" value={profil.email} onChange={(v) => onUpdate('email', v)} type="email" />
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
          >
            <RotateCcw size={14} /> Standard wiederherstellen
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            Fertig
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
      />
    </div>
  );
}
