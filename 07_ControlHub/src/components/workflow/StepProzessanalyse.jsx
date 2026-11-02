import { useState, useRef, useEffect } from 'react';
import { CheckCircle2, Plus, Trash2, Edit3, Save, FileText, ArrowRight, Sparkles, Info } from 'lucide-react';
import { useControlHub } from '../../hooks/useControlHub';
import { DEMO_PROZESSE } from '../../data/risikoKatalog';
import DocumentUpload from '../upload/DocumentUpload';
import ProzessFlowChart from './ProzessFlowChart';
import AiExplanationModal from './AiExplanationModal';

function ProzessAuswahl({ onSelect }) {
  return (
    <div className="card-base p-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--mode-primary, #0F4D2A) 12%, white)', color: 'var(--mode-primary, #0F4D2A)' }}>
          <Sparkles size={18} />
        </div>
        <div>
          <div className="text-sm font-semibold">Schnellstart: Beispielprozess wählen</div>
          <div className="text-xs text-slate-500">Ohne Upload direkt in den Workflow einsteigen.</div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
        {DEMO_PROZESSE.map(p => (
          <button
            key={p.id}
            onClick={() => onSelect(p)}
            className="text-left p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <FileText size={14} className="text-slate-400" />
              <span className="text-sm font-semibold">{p.name}</span>
            </div>
            <div className="text-xs text-slate-500 line-clamp-2">{p.beschreibung}</div>
            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
              <span className="chip">{p.kategorie}</span>
              <span className="chip">{p.aktivitaeten.length} Aktivitäten</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function StepProzessanalyse({ onNext }) {
  const { session, startSession, updateAktivitaet, resetSession } = useControlHub();
  const [editingId, setEditingId] = useState(null);
  const [editVal, setEditVal] = useState({ name: '', beschreibung: '' });
  const [adding, setAdding] = useState(false);
  const [newAct, setNewAct] = useState({ name: '', beschreibung: '' });
  const [activeId, setActiveId] = useState(null);
  const [hoverId, setHoverId] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [infoPayload, setInfoPayload] = useState(null);
  const rowRefs = useRef({});

  const handleSelectActivity = (id) => {
    setActiveId(id);
    const el = rowRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setFullscreen(false);
  };

  // Highlight-Effekt nach Auswahl
  useEffect(() => {
    if (!activeId) return;
    const t = setTimeout(() => setActiveId(null), 1800);
    return () => clearTimeout(t);
  }, [activeId]);

  const effectiveActive = hoverId || activeId;

  // Kein aktiver Prozess → Auswahl/Upload
  if (!session) {
    return (
      <div className="space-y-5">
        <DocumentUpload />
        <ProzessAuswahl onSelect={(p) => startSession(p.id)} />
      </div>
    );
  }

  const startEdit = (a) => {
    setEditingId(a.id);
    setEditVal({ name: a.name, beschreibung: a.beschreibung });
  };

  const saveEdit = () => {
    if (editingId) {
      updateAktivitaet(editingId, { name: editVal.name, beschreibung: editVal.beschreibung });
      setEditingId(null);
    }
  };

  const toggleConfirmed = (a) => updateAktivitaet(a.id, { confirmed: !a.confirmed });

  const removeAkt = (a) => updateAktivitaet(a.id, { _remove: true, confirmed: false });
  // simplified: in einer realen App würden wir löschen — hier nur ein „remove"-Flag akzeptieren

  const addCustom = () => {
    if (!newAct.name) return;
    // Wir fügen via direktem State-Update über updateAktivitaet nicht hinzu (kein Add-Hook); deshalb über DOM-Helper.
    // Workaround: nutze ein generisches Custom-Add via session.aktivitaeten Erweiterung — nicht im Hook,
    // wir umgehen das mit einem schmutzigen Trick über window.
    const id = `custom-${Date.now()}`;
    // Wir nutzen updateAktivitaet mit einer „Insert"-Konvention: Da wir keinen Add-Hook haben,
    // fügen wir die Aktivität via direkte Mutation in localStorage — pragmatisch für die Demo.
    const raw = localStorage.getItem('controlhub_state_v1');
    if (raw) {
      try {
        const s = JSON.parse(raw);
        s.aktivitaeten.push({ id, name: newAct.name, beschreibung: newAct.beschreibung || '–', confirmed: true, custom: true });
        s.risikoCandidates[id] = [];
        localStorage.setItem('controlhub_state_v1', JSON.stringify(s));
        window.location.reload();
      } catch {}
    }
  };

  const confirmedCount = session.aktivitaeten.filter(a => a.confirmed && !a._remove).length;

  return (
    <div className="space-y-5">
      <div className="card-base p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-xs text-slate-500">Prozess</div>
            <div className="text-lg font-semibold">{session.name}</div>
            <div className="text-xs text-slate-500 mt-1">{session.beschreibung}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="chip selected"><CheckCircle2 size={12} /> {confirmedCount} / {session.aktivitaeten.length} bestätigt</span>
            <button
              onClick={resetSession}
              className="text-xs px-2 py-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Anderen Prozess wählen
            </button>
          </div>
        </div>
        {session.quelldokument && (
          <div className="mt-3 flex items-center gap-2 text-[12px] text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
            <FileText size={14} className="text-slate-400" />
            Quelle: <strong>{session.quelldokument.name}</strong>
          </div>
        )}
      </div>

      <ProzessFlowChart
        session={session}
        activeId={effectiveActive}
        onSelectActivity={handleSelectActivity}
        onHoverActivity={setHoverId}
        onInfoClick={(activity) => setInfoPayload({ type: 'activity', activity, session })}
        fullscreen={fullscreen}
        onToggleFullscreen={() => setFullscreen(v => !v)}
      />

      <div className="card-base">
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="text-sm font-semibold">Identifizierte Aktivitäten</div>
          <button
            onClick={() => setAdding(v => !v)}
            className="text-xs inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 hover:bg-slate-50"
          >
            <Plus size={13} /> Aktivität ergänzen
          </button>
        </div>
        <table className="matrix-table">
          <thead>
            <tr>
              <th style={{ width: 60 }}>Nr.</th>
              <th>Aktivität</th>
              <th>Beschreibung</th>
              <th style={{ width: 140 }}>Status</th>
              <th style={{ width: 110 }}></th>
            </tr>
          </thead>
          <tbody>
            {session.aktivitaeten.filter(a => !a._remove).map((a, i) => (
              <tr
                key={a.id}
                ref={(el) => { if (el) rowRefs.current[a.id] = el; }}
                onMouseEnter={() => setHoverId(a.id)}
                onMouseLeave={() => setHoverId(null)}
                className={`${editingId === a.id ? 'bg-emerald-50/40' : ''} ${effectiveActive === a.id ? 'bg-amber-50/70 transition-colors' : 'transition-colors'}`}
              >
                <td className="font-mono text-slate-400">{String(i + 1).padStart(2, '0')}</td>
                <td>
                  {editingId === a.id ? (
                    <input
                      value={editVal.name}
                      onChange={(e) => setEditVal(v => ({ ...v, name: e.target.value }))}
                      className="w-full px-2 py-1 rounded-md border border-slate-300 text-sm"
                    />
                  ) : (
                    <span className="font-semibold">{a.name}</span>
                  )}
                  {a.custom && <span className="ml-2 chip" style={{ background: '#FEF3C7', color: '#92400E', borderColor: '#FCD34D' }}>manuell</span>}
                </td>
                <td className="text-slate-600 text-[13px]">
                  {editingId === a.id ? (
                    <textarea
                      value={editVal.beschreibung}
                      onChange={(e) => setEditVal(v => ({ ...v, beschreibung: e.target.value }))}
                      className="w-full px-2 py-1 rounded-md border border-slate-300 text-sm resize-none"
                      rows={3}
                    />
                  ) : a.beschreibung}
                </td>
                <td>
                  <button
                    onClick={() => toggleConfirmed(a)}
                    className={`chip ${a.confirmed ? 'selected' : ''}`}
                    style={a.confirmed ? {} : { cursor: 'pointer' }}
                  >
                    <CheckCircle2 size={12} />
                    {a.confirmed ? 'Bestätigt' : 'Offen'}
                  </button>
                </td>
                <td>
                  {editingId === a.id ? (
                    <button onClick={saveEdit} className="text-emerald-700 inline-flex items-center gap-1 text-xs font-medium" title="Speichern">
                      <Save size={14} /> Speichern
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setInfoPayload({ type: 'activity', activity: a, session })}
                        className="text-slate-500 hover:text-emerald-700"
                        title="Wie hat die KI das erkannt?"
                      >
                        <Info size={14} />
                      </button>
                      <button onClick={() => startEdit(a)} className="text-slate-500 hover:text-emerald-700" title="Bearbeiten"><Edit3 size={14} /></button>
                      <button onClick={() => removeAkt(a)} className="text-slate-500 hover:text-red-600" title="Entfernen"><Trash2 size={14} /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {adding && (
              <tr>
                <td className="font-mono text-slate-400">+</td>
                <td>
                  <input
                    value={newAct.name}
                    onChange={(e) => setNewAct(v => ({ ...v, name: e.target.value }))}
                    placeholder="Aktivitätsname"
                    className="w-full px-2 py-1 rounded-md border border-slate-300 text-sm"
                  />
                </td>
                <td>
                  <input
                    value={newAct.beschreibung}
                    onChange={(e) => setNewAct(v => ({ ...v, beschreibung: e.target.value }))}
                    placeholder="Kurzbeschreibung"
                    className="w-full px-2 py-1 rounded-md border border-slate-300 text-sm"
                  />
                </td>
                <td></td>
                <td>
                  <button onClick={addCustom} className="text-emerald-700 inline-flex items-center gap-1 text-xs font-medium">
                    <Save size={14} /> Hinzufügen
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-slate-500">
          Tipp: Sie können Aktivitäten direkt bearbeiten, hinzufügen oder entfernen. Im nächsten Schritt schlägt ControlHub je Aktivität bis zu drei Risikokategorien vor.
        </div>
        <button
          onClick={onNext}
          disabled={confirmedCount === 0}
          className="px-4 py-2 rounded-lg text-white text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-50 transition-colors"
          style={{ background: 'var(--mode-primary, #0F4D2A)' }}
        >
          Schritt 2: Risikoidentifikation
          <ArrowRight size={16} />
        </button>
      </div>

      {infoPayload && <AiExplanationModal payload={infoPayload} onClose={() => setInfoPayload(null)} />}
    </div>
  );
}
