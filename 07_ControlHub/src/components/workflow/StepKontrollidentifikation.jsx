import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Key, ShieldCheck, Plus, X } from 'lucide-react';
import { useControlHub } from '../../hooks/useControlHub';
import { RISIKO_KATEGORIEN, KONTROLL_ARTEN, KONTROLL_FREQUENZ } from '../../data/risikoKatalog';

function getKategorie(id) { return RISIKO_KATEGORIEN.find(k => k.id === id); }
function getUnterart(katId, uaId) { return getKategorie(katId)?.unterarten.find(u => u.id === uaId); }

function frequenzLabel(id) {
  return KONTROLL_FREQUENZ.find(f => f.id === id)?.name || id;
}

function AddKontrolleModal({ risikoId, onClose }) {
  const { addCustomKontrolle } = useControlHub();
  const [name, setName] = useState('');
  const [art, setArt] = useState('praeventiv');
  const [typ, setTyp] = useState('manuell');
  const [frequenz, setFrequenz] = useState('jede-transaktion');
  const [wer, setWer] = useState('');
  const [was, setWas] = useState('');
  const [wann, setWann] = useState('');
  const [wo, setWo] = useState('');
  const [wie, setWie] = useState('');
  const [beschreibung, setBeschreibung] = useState('');

  const save = () => {
    if (!name.trim()) return;
    addCustomKontrolle(risikoId, { name, art, typ, frequenz, wer, was, wann, wo, wie, beschreibung });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="card-base w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
          <div className="text-sm font-semibold">Eigene Kontrolle ergänzen</div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-3">
          <label className="block">
            <span className="block text-xs font-semibold text-slate-700 mb-1">Kontrollbezeichnung</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-sm" />
          </label>
          <div className="grid grid-cols-3 gap-3">
            <label className="block">
              <span className="block text-xs font-semibold text-slate-700 mb-1">Art</span>
              <select value={art} onChange={(e) => setArt(e.target.value)} className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-sm">
                {KONTROLL_ARTEN.filter(a => ['praeventiv', 'detektiv'].includes(a.id)).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="block text-xs font-semibold text-slate-700 mb-1">Typ</span>
              <select value={typ} onChange={(e) => setTyp(e.target.value)} className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-sm">
                {KONTROLL_ARTEN.filter(a => ['manuell', 'automatisch', 'hybrid'].includes(a.id)).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="block text-xs font-semibold text-slate-700 mb-1">Frequenz</span>
              <select value={frequenz} onChange={(e) => setFrequenz(e.target.value)} className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-sm">
                {KONTROLL_FREQUENZ.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block"><span className="block text-xs font-semibold text-slate-700 mb-1">Wer</span><input value={wer} onChange={(e) => setWer(e.target.value)} className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-sm" /></label>
            <label className="block"><span className="block text-xs font-semibold text-slate-700 mb-1">Was</span><input value={was} onChange={(e) => setWas(e.target.value)} className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-sm" /></label>
            <label className="block"><span className="block text-xs font-semibold text-slate-700 mb-1">Wann</span><input value={wann} onChange={(e) => setWann(e.target.value)} className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-sm" /></label>
            <label className="block"><span className="block text-xs font-semibold text-slate-700 mb-1">Wo</span><input value={wo} onChange={(e) => setWo(e.target.value)} className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-sm" /></label>
          </div>
          <label className="block"><span className="block text-xs font-semibold text-slate-700 mb-1">Wie</span><input value={wie} onChange={(e) => setWie(e.target.value)} className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-sm" /></label>
          <label className="block"><span className="block text-xs font-semibold text-slate-700 mb-1">Kontrollbeschreibung</span><textarea value={beschreibung} onChange={(e) => setBeschreibung(e.target.value)} rows={3} className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-sm resize-none" /></label>
        </div>
        <div className="px-5 py-3 border-t border-slate-200 flex justify-end gap-2 sticky bottom-0 bg-white">
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg text-sm border border-slate-200 hover:bg-slate-50">Abbrechen</button>
          <button onClick={save} className="px-3 py-1.5 rounded-lg text-sm text-white" style={{ background: 'var(--mode-primary, #0F4D2A)' }}>Hinzufügen</button>
        </div>
      </div>
    </div>
  );
}

export default function StepKontrollidentifikation({ onBack, onComplete }) {
  const { session, toggleKontrolle, toggleIsKey, updateKontrolle, generateKontrollCandidates } = useControlHub();
  const [addingFor, setAddingFor] = useState(null);

  const groupedByAkt = useMemo(() => {
    if (!session) return [];
    return session.aktivitaeten
      .filter(a => !a._remove && a.confirmed)
      .map(a => ({
        aktivitaet: a,
        risiken: (session.risikoCandidates[a.id] || []).filter(r => r.selected),
      }))
      .filter(g => g.risiken.length > 0);
  }, [session]);

  // Hat noch keine Kontrollen → generieren
  const hasKontrollen = session && Object.keys(session.kontrollCandidates).length > 0;

  if (!session) return null;

  const totalKey = Object.values(session.kontrollCandidates).flat().filter(k => k.selected && k.isKey).length;
  const totalSelected = Object.values(session.kontrollCandidates).flat().filter(k => k.selected).length;

  return (
    <div className="space-y-5">
      <div className="card-base p-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs text-slate-500">Schritt 4 – Kontrollidentifikation</div>
          <div className="text-sm font-semibold mt-0.5">Wählen Sie für jedes Risiko mindestens eine Schlüsselkontrolle und ergänzen Sie die W-Fragen.</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="chip selected"><Key size={11} /> {totalKey} Schlüsselkontrollen</span>
          <span className="chip">{totalSelected} Kontrollen gesamt</span>
          {!hasKontrollen && (
            <button onClick={generateKontrollCandidates} className="text-xs px-2.5 py-1 rounded-md text-white" style={{ background: 'var(--mode-primary, #0F4D2A)' }}>
              Kontrollvorschläge generieren
            </button>
          )}
        </div>
      </div>

      {!hasKontrollen && (
        <div className="card-base p-8 text-center text-slate-500 text-sm">
          Klicken Sie auf „Kontrollvorschläge generieren", um Agent 3 Vorschläge je Risiko erzeugen zu lassen.
        </div>
      )}

      {groupedByAkt.map(g => (
        <div key={g.aktivitaet.id} className="card-base">
          <div className="px-5 py-3 border-b border-slate-200">
            <div className="text-sm font-semibold">{g.aktivitaet.name}</div>
            <div className="text-[11px] text-slate-500">{g.aktivitaet.beschreibung}</div>
          </div>
          <div className="divide-y divide-slate-100">
            {g.risiken.map(r => {
              const k = getKategorie(r.kategorie);
              const u = getUnterart(r.kategorie, r.unterart);
              const list = session.kontrollCandidates[r.id] || [];
              return (
                <div key={r.id} className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span style={{ width: 8, height: 8, borderRadius: 999, background: k?.color || '#94A3B8', display: 'inline-block' }} />
                        <span className="text-[13px] font-semibold">{k?.name}</span>
                        <span className="text-[12px] text-slate-500">· {u?.name}</span>
                      </div>
                      <div className="text-[13px] text-slate-700 mt-1 max-w-3xl">{r.finalBeschreibung || r.beschreibung}</div>
                    </div>
                    <button
                      onClick={() => setAddingFor(r.id)}
                      className="text-[11px] inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 hover:bg-slate-50 shrink-0"
                    >
                      <Plus size={12} /> Kontrolle ergänzen
                    </button>
                  </div>
                  {list.length === 0 ? (
                    <div className="text-xs text-slate-400 italic">Noch keine Kontrollvorschläge — klicken Sie oben auf „Kontrollvorschläge generieren".</div>
                  ) : (
                    <div className="space-y-2">
                      {list.map(c => (
                        <div
                          key={c.id}
                          className={`border rounded-lg p-3 transition-colors ${c.selected ? 'bg-emerald-50/50' : 'bg-white'}`}
                          style={{ borderColor: c.isKey ? '#16A34A' : '#E2E8F0', borderLeftWidth: c.isKey ? 3 : 1 }}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={c.selected}
                              onChange={() => toggleKontrolle(r.id, c.id)}
                              className="mt-1 w-4 h-4 accent-emerald-700"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <input
                                  type="text"
                                  value={c.name}
                                  onChange={(e) => updateKontrolle(r.id, c.id, { name: e.target.value })}
                                  className="font-semibold text-sm bg-transparent border-b border-dashed border-slate-300 px-0.5 focus:outline-none focus:border-emerald-700"
                                  style={{ minWidth: 220 }}
                                />
                                <span className="chip" style={{ background: c.art === 'praeventiv' ? '#DBEAFE' : '#FEF3C7', color: c.art === 'praeventiv' ? '#1E40AF' : '#92400E', borderColor: 'transparent' }}>
                                  {KONTROLL_ARTEN.find(a => a.id === c.art)?.name}
                                </span>
                                <span className="chip">{KONTROLL_ARTEN.find(a => a.id === c.typ)?.name}</span>
                                <span className="chip">{frequenzLabel(c.frequenz)}</span>
                                <button
                                  onClick={() => toggleIsKey(r.id, c.id)}
                                  className={`chip inline-flex items-center gap-1 cursor-pointer ${c.isKey ? 'selected' : ''}`}
                                  title="Als Schlüsselkontrolle markieren"
                                >
                                  <Key size={11} /> {c.isKey ? 'Schlüsselkontrolle' : 'Als Schlüssel markieren'}
                                </button>
                              </div>
                              <div className="text-[13px] text-slate-700 mb-2">{c.beschreibung}</div>
                              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-[12px]">
                                {[
                                  ['Wer', 'wer'],
                                  ['Was', 'was'],
                                  ['Wann', 'wann'],
                                  ['Wo', 'wo'],
                                  ['Wie', 'wie'],
                                ].map(([label, key]) => (
                                  <div key={key}>
                                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{label}</div>
                                    <input
                                      type="text"
                                      value={c[key] || ''}
                                      onChange={(e) => updateKontrolle(r.id, c.id, { [key]: e.target.value })}
                                      className="w-full text-[12px] px-1.5 py-1 rounded border border-slate-200 bg-white"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex items-center justify-between gap-3">
        <button onClick={onBack} className="px-3 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 border border-slate-200 hover:bg-slate-50">
          <ArrowLeft size={14} /> Schritt 3
        </button>
        <button
          onClick={onComplete}
          disabled={totalKey === 0}
          className="px-4 py-2 rounded-lg text-white text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-50 transition-colors"
          style={{ background: 'var(--mode-primary, #0F4D2A)' }}
        >
          <ShieldCheck size={16} /> Zur Risiko-Kontroll-Matrix
        </button>
      </div>

      {addingFor && <AddKontrolleModal risikoId={addingFor} onClose={() => setAddingFor(null)} />}
    </div>
  );
}
