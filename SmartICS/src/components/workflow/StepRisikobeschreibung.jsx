import { useMemo } from 'react';
import { ArrowRight, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useSmartIcs } from '../../hooks/useSmartIcs';
import { RISIKO_KATEGORIEN, RISIKO_BEWERTUNG_DEFAULT } from '../../data/risikoKatalog';

function getKategorie(id) { return RISIKO_KATEGORIEN.find(k => k.id === id); }
function getUnterart(katId, uaId) { return getKategorie(katId)?.unterarten.find(u => u.id === uaId); }

const W_OPTIONS = [
  RISIKO_BEWERTUNG_DEFAULT.low.eintrittsW,
  RISIKO_BEWERTUNG_DEFAULT.mid.eintrittsW,
  RISIKO_BEWERTUNG_DEFAULT.high.eintrittsW,
];
const S_OPTIONS = [
  RISIKO_BEWERTUNG_DEFAULT.low.schaden,
  RISIKO_BEWERTUNG_DEFAULT.mid.schaden,
  RISIKO_BEWERTUNG_DEFAULT.high.schaden,
];

function tierFromBewertung(eintrittsW, schaden) {
  const wHigh = eintrittsW.startsWith('Hoch');
  const wMid  = eintrittsW.startsWith('Mittel');
  const sHigh = schaden.startsWith('Hoch');
  const sMid  = schaden.startsWith('Mittel');
  if (wHigh && sHigh) return 'high';
  if ((wHigh && sMid) || (wMid && sHigh) || (wMid && sMid)) return 'mid';
  return 'low';
}

function TierPill({ tier }) {
  const labels = { high: 'Hohes Risiko', mid: 'Mittleres Risiko', low: 'Geringes Risiko' };
  const cls = tier === 'high' ? 'risk-tier-high' : tier === 'mid' ? 'risk-tier-mid' : 'risk-tier-low';
  return (
    <span className={`chip ${cls}`} style={{ fontWeight: 600 }}>
      <AlertTriangle size={11} />
      {labels[tier]}
    </span>
  );
}

export default function StepRisikobeschreibung({ onBack, onNext }) {
  const { session, updateRisiko, generateKontrollCandidates } = useSmartIcs();
  const selectedByAkt = useMemo(() => {
    if (!session) return [];
    return session.aktivitaeten
      .filter(a => !a._remove && a.confirmed)
      .map(a => ({
        aktivitaet: a,
        risiken: (session.risikoCandidates[a.id] || []).filter(r => r.selected),
      }))
      .filter(g => g.risiken.length > 0);
  }, [session]);

  if (!session) return null;

  const handleNext = () => {
    generateKontrollCandidates();
    onNext();
  };

  return (
    <div className="space-y-5">
      <div className="card-base p-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs text-slate-500">Schritt 3 – Risikobeschreibung</div>
          <div className="text-sm font-semibold mt-0.5">Detaillieren Sie Beschreibung, Eintrittswahrscheinlichkeit und Schadenshöhe.</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="chip selected">{selectedByAkt.reduce((s, g) => s + g.risiken.length, 0)} Risiken in Bearbeitung</span>
        </div>
      </div>

      {selectedByAkt.length === 0 && (
        <div className="card-base p-8 text-center text-slate-500 text-sm">
          Keine Risiken ausgewählt. Gehen Sie zurück zu Schritt 2 und markieren Sie mindestens ein Risiko.
        </div>
      )}

      {selectedByAkt.map(g => (
        <div key={g.aktivitaet.id} className="card-base">
          <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">{g.aktivitaet.name}</div>
              <div className="text-[11px] text-slate-500">{g.aktivitaet.beschreibung}</div>
            </div>
            <span className="chip">{g.risiken.length} Risiko{g.risiken.length !== 1 && 'en'}</span>
          </div>
          <div className="divide-y divide-slate-100">
            {g.risiken.map(r => {
              const k = getKategorie(r.kategorie);
              const u = getUnterart(r.kategorie, r.unterart);
              const tier = tierFromBewertung(r.eintrittsW, r.schaden);
              return (
                <div key={r.id} className="px-5 py-4 grid md:grid-cols-12 gap-3">
                  <div className="md:col-span-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ width: 8, height: 8, borderRadius: 999, background: k?.color || '#94A3B8', display: 'inline-block' }} />
                      <span className="text-[12px] font-semibold">{k?.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">{u?.name}</div>
                    <div className="mt-2">
                      <TierPill tier={tier} />
                    </div>
                  </div>
                  <div className="md:col-span-8 space-y-2">
                    <label className="block">
                      <span className="block text-[11px] font-semibold text-slate-700 mb-1">Beschreibung (Ursache · Ereignis · Wirkung)</span>
                      <textarea
                        value={r.finalBeschreibung}
                        onChange={(e) => updateRisiko(g.aktivitaet.id, r.id, { finalBeschreibung: e.target.value })}
                        rows={3}
                        className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-sm resize-none"
                      />
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="block">
                        <span className="block text-[11px] font-semibold text-slate-700 mb-1">Eintrittswahrscheinlichkeit</span>
                        <select
                          value={r.eintrittsW}
                          onChange={(e) => {
                            const w = e.target.value;
                            const t = tierFromBewertung(w, r.schaden);
                            updateRisiko(g.aktivitaet.id, r.id, { eintrittsW: w, tier: t });
                          }}
                          className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-sm"
                        >
                          {W_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </label>
                      <label className="block">
                        <span className="block text-[11px] font-semibold text-slate-700 mb-1">Finanzieller Schaden</span>
                        <select
                          value={r.schaden}
                          onChange={(e) => {
                            const s = e.target.value;
                            const t = tierFromBewertung(r.eintrittsW, s);
                            updateRisiko(g.aktivitaet.id, r.id, { schaden: s, tier: t });
                          }}
                          className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-sm"
                        >
                          {S_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex items-center justify-between gap-3">
        <button onClick={onBack} className="px-3 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 border border-slate-200 hover:bg-slate-50">
          <ArrowLeft size={14} /> Schritt 2
        </button>
        <button
          onClick={handleNext}
          disabled={selectedByAkt.length === 0}
          className="px-4 py-2 rounded-lg text-white text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-50 transition-colors"
          style={{ background: 'var(--mode-primary, #0F4D2A)' }}
        >
          Schritt 4: Kontrollidentifikation <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
