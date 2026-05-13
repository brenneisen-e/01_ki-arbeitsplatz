import { useMemo, useState } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle2, Plus, X } from 'lucide-react';
import { useSmartIcs } from '../../hooks/useSmartIcs';
import { RISIKO_KATEGORIEN } from '../../data/risikoKatalog';

function getKategorie(id) {
  return RISIKO_KATEGORIEN.find(k => k.id === id);
}
function getUnterart(katId, uaId) {
  return getKategorie(katId)?.unterarten.find(u => u.id === uaId);
}

function ConfidenceBadge({ confidence }) {
  const label = confidence === 'first' ? '1. Wahl' : confidence === 'second' ? '2. Wahl' : '3. Wahl';
  return <span className={`prob-badge ${confidence}`}>{label}</span>;
}

function AddRisikoModal({ aktivitaetId, onClose }) {
  const { addCustomRisiko } = useSmartIcs();
  const [kategorie, setKategorie] = useState(RISIKO_KATEGORIEN[0].id);
  const [unterart, setUnterart] = useState(RISIKO_KATEGORIEN[0].unterarten[0].id);
  const [beschreibung, setBeschreibung] = useState('');

  const kat = getKategorie(kategorie);

  const save = () => {
    if (!beschreibung.trim()) return;
    addCustomRisiko(aktivitaetId, { kategorie, unterart, beschreibung });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 animate-fade-in-up">
      <div className="card-base w-full max-w-lg">
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="text-sm font-semibold">Eigenes Risiko ergänzen</div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-3">
          <label className="block">
            <span className="block text-xs font-semibold text-slate-700 mb-1">Risikoart</span>
            <select
              value={kategorie}
              onChange={(e) => { setKategorie(e.target.value); setUnterart(getKategorie(e.target.value).unterarten[0].id); }}
              className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-sm"
            >
              {RISIKO_KATEGORIEN.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="block text-xs font-semibold text-slate-700 mb-1">Risiko-Unterart</span>
            <select
              value={unterart}
              onChange={(e) => setUnterart(e.target.value)}
              className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-sm"
            >
              {kat?.unterarten.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="block text-xs font-semibold text-slate-700 mb-1">Beschreibung</span>
            <textarea
              value={beschreibung}
              onChange={(e) => setBeschreibung(e.target.value)}
              rows={3}
              className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-sm resize-none"
              placeholder="Beschreibung des Risikos im Kontext der Aktivität …"
            />
          </label>
        </div>
        <div className="px-5 py-3 border-t border-slate-200 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg text-sm border border-slate-200 hover:bg-slate-50">Abbrechen</button>
          <button onClick={save} className="px-3 py-1.5 rounded-lg text-sm text-white" style={{ background: 'var(--mode-primary, #0F4D2A)' }}>Hinzufügen</button>
        </div>
      </div>
    </div>
  );
}

export default function StepRisikoidentifikation({ onBack, onNext }) {
  const { session, toggleRisiko } = useSmartIcs();
  const [addingFor, setAddingFor] = useState(null);

  const totalSelected = useMemo(() => {
    if (!session) return 0;
    return Object.values(session.risikoCandidates).flat().filter(r => r.selected).length;
  }, [session]);

  if (!session) return null;

  return (
    <div className="space-y-5">
      <div className="card-base p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs text-slate-500">Schritt 2 – Risikoidentifikation</div>
            <div className="text-sm font-semibold mt-0.5">Bestätigen Sie pro Aktivität die zutreffenden Risikokategorien.</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="chip selected"><CheckCircle2 size={12} /> {totalSelected} ausgewählt</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {session.aktivitaeten.filter(a => !a._remove && a.confirmed).map((a, idx) => {
          const candidates = session.risikoCandidates[a.id] || [];
          return (
            <div key={a.id} className="card-base">
              <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold font-mono shrink-0"
                    style={{ background: 'var(--mode-primary, #0F4D2A)', color: 'white' }}
                  >
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{a.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{a.beschreibung}</div>
                  </div>
                </div>
                <button
                  onClick={() => setAddingFor(a.id)}
                  className="text-[11px] inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 hover:bg-slate-50"
                >
                  <Plus size={12} /> Risiko ergänzen
                </button>
              </div>
              {candidates.length === 0 ? (
                <div className="px-5 py-6 text-center text-sm text-slate-500">
                  Keine Vorschläge — Sie können über „Risiko ergänzen" eigene Risiken hinzufügen.
                </div>
              ) : (
                <table className="matrix-table">
                  <thead>
                    <tr>
                      <th style={{ width: 90 }}>Confidence</th>
                      <th>Risikoart / Unterart</th>
                      <th>Beschreibung</th>
                      <th style={{ width: 140 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map(r => {
                      const k = getKategorie(r.kategorie);
                      const u = getUnterart(r.kategorie, r.unterart);
                      return (
                        <tr key={r.id}>
                          <td><ConfidenceBadge confidence={r.confidence} /></td>
                          <td>
                            <div className="flex items-center gap-2">
                              <span style={{ width: 8, height: 8, borderRadius: 999, background: k?.color || '#94A3B8', display: 'inline-block' }} />
                              <div className="font-semibold text-[13px]">{k?.name}</div>
                            </div>
                            <div className="text-[12px] text-slate-500 ml-3.5">{u?.name}</div>
                          </td>
                          <td className="text-[13px] text-slate-700">{r.beschreibung}</td>
                          <td>
                            <label className="inline-flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={r.selected}
                                onChange={() => toggleRisiko(a.id, r.id)}
                                className="w-4 h-4 accent-emerald-700"
                              />
                              <span className="text-xs text-slate-700 font-medium">Übernehmen</span>
                            </label>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="px-3 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 border border-slate-200 hover:bg-slate-50"
        >
          <ArrowLeft size={14} /> Schritt 1
        </button>
        <button
          onClick={onNext}
          disabled={totalSelected === 0}
          className="px-4 py-2 rounded-lg text-white text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-50 transition-colors"
          style={{ background: 'var(--mode-primary, #0F4D2A)' }}
        >
          Schritt 3: Risikobeschreibung <ArrowRight size={16} />
        </button>
      </div>

      {addingFor && <AddRisikoModal aktivitaetId={addingFor} onClose={() => setAddingFor(null)} />}
    </div>
  );
}
