import { useEffect, useRef, useState } from 'react';
import { Check, Loader2, Brain, FileText, ShieldCheck } from 'lucide-react';
import { useBiks } from '../../hooks/useBiks';
import { AGENT_STEPS } from '../../data/biksAgent';

const STEP_MS = 1050;   // Dauer je Analyse-Schritt
const HOLD_MS = 650;    // Nachlauf vor Anzeige des Ergebnisses
const TOTAL = AGENT_STEPS.length * STEP_MS + HOLD_MS;

export default function ProcessingAnimation() {
  const { finishProcessing, pendingInput } = useBiks();
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(null);
  const doneRef = useRef(false);
  const rafRef = useRef(null);

  useEffect(() => {
    const tick = () => {
      if (startRef.current == null) startRef.current = performance.now();
      const e = performance.now() - startRef.current;
      setElapsed(e);
      if (e >= TOTAL) {
        if (!doneRef.current) {
          doneRef.current = true;
          finishProcessing();
        }
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentStep = Math.min(AGENT_STEPS.length - 1, Math.floor(elapsed / STEP_MS));
  const overall = Math.min(100, Math.round((elapsed / TOTAL) * 100));
  const withinStep = (elapsed % STEP_MS) / STEP_MS;

  const docName = pendingInput?.quelldokument?.name || 'Prozessdokument';

  return (
    <div className="max-w-[860px] mx-auto w-full animate-fade-in-up">
      <div className="card-base overflow-hidden">
        {/* Kopf */}
        <div className="px-6 py-5 text-white relative overflow-hidden" style={{ background: 'var(--mode-gradient, linear-gradient(135deg,#0F4D2A,#1D7B3F))' }}>
          <div className="absolute inset-0 opacity-20 processing-shimmer" />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
              <Brain size={24} className="animate-pulse-soft" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-bold flex items-center gap-2">
                IKS-Agent analysiert
                <span className="inline-flex gap-1">
                  <span className="thinking-dot" /><span className="thinking-dot" style={{ animationDelay: '0.2s' }} /><span className="thinking-dot" style={{ animationDelay: '0.4s' }} />
                </span>
              </div>
              <div className="text-[12.5px] text-white/80 truncate flex items-center gap-1.5 mt-0.5">
                <FileText size={12} /> {docName}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl font-bold tabular-nums">{overall}%</div>
              <div className="text-[11px] text-white/70">verarbeitet</div>
            </div>
          </div>
          {/* Fortschritt */}
          <div className="relative mt-4 h-1.5 rounded-full bg-white/20 overflow-hidden">
            <div className="h-full rounded-full bg-white transition-[width] duration-100" style={{ width: `${overall}%` }} />
          </div>
        </div>

        {/* Schritte */}
        <div className="p-5 space-y-1.5">
          {AGENT_STEPS.map((step, i) => {
            const isDone = i < currentStep;
            const isActive = i === currentStep;
            const isPending = i > currentStep;
            const notesToShow = isDone ? step.notes.length : isActive ? Math.min(step.notes.length, Math.ceil(withinStep * (step.notes.length + 0.5))) : 0;
            return (
              <div
                key={step.id}
                className="flex gap-3.5 rounded-xl p-3 transition-all duration-300"
                style={{
                  background: isActive ? 'color-mix(in srgb, var(--mode-primary, #0F4D2A) 6%, white)' : 'transparent',
                  opacity: isPending ? 0.45 : 1,
                }}
              >
                <div className="shrink-0 pt-0.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                    style={{
                      background: isDone ? 'color-mix(in srgb, #16A34A 14%, white)' : isActive ? 'var(--mode-primary, #0F4D2A)' : '#F1F5F9',
                      color: isDone ? '#16A34A' : isActive ? 'white' : '#94A3B8',
                    }}
                  >
                    {isDone ? <Check size={16} /> : isActive ? <Loader2 size={15} className="animate-spin" /> : <span className="text-[12px] font-mono font-semibold">{i + 1}</span>}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className={`text-[13.5px] font-semibold ${isActive ? '' : isDone ? 'text-slate-700' : 'text-slate-500'}`} style={isActive ? { color: 'var(--mode-primary, #0F4D2A)' } : undefined}>
                    {step.titel}
                  </div>
                  <div className="text-[12px] text-slate-500 leading-snug mt-0.5">{step.detail}</div>
                  {notesToShow > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {step.notes.slice(0, notesToShow).map((n, ni) => (
                        <span key={ni} className="chip animate-fade-in-up" style={{ background: 'white' }}>{n}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-5 py-3 border-t border-slate-100 flex items-center gap-2 text-[11.5px] text-slate-500">
          <ShieldCheck size={13} className="text-emerald-600" />
          Analyse gemäß Prompt-Vorgehenslogik · Priorisierung nach Schaden und Eintrittswahrscheinlichkeit · Begrenzung auf die fünf wesentlichsten Risiken.
        </div>
      </div>
    </div>
  );
}
