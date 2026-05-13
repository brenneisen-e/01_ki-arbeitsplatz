import { CheckCircle2, FileText, AlertOctagon, ListChecks, KeyRound } from 'lucide-react';
import { useSmartIcs } from '../../hooks/useSmartIcs';
import StepProzessanalyse from './StepProzessanalyse';
import StepRisikoidentifikation from './StepRisikoidentifikation';
import StepRisikobeschreibung from './StepRisikobeschreibung';
import StepKontrollidentifikation from './StepKontrollidentifikation';

const STEPS = [
  { id: 0, label: 'Prozessanalyse',         icon: FileText,    sub: 'Aktivitäten extrahieren' },
  { id: 1, label: 'Risikoidentifikation',   icon: AlertOctagon,sub: 'Risikoarten vorschlagen' },
  { id: 2, label: 'Risikobeschreibung',     icon: ListChecks,  sub: 'Beschreibung & Bewertung' },
  { id: 3, label: 'Kontrollidentifikation', icon: KeyRound,    sub: 'Schlüsselkontrollen' },
];

function StepIndicator({ active, onStepClick }) {
  return (
    <ol className="card-base p-3 flex items-stretch overflow-x-auto">
      {STEPS.map((s, i) => {
        const Icon = s.icon;
        const isActive = i === active;
        const isDone = i < active;
        return (
          <li key={s.id} className="flex items-center min-w-0 flex-1 last:flex-1">
            <button
              type="button"
              onClick={() => onStepClick && onStepClick(i)}
              className="flex items-center gap-3 px-3 py-2 min-w-0 flex-1 text-left rounded-lg hover:bg-slate-50 transition-colors"
              title={`Zu Schritt ${i + 1} springen`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'text-white' : isDone ? 'text-emerald-700' : 'text-slate-500'}`}
                style={{
                  background: isActive
                    ? 'var(--mode-primary, #0F4D2A)'
                    : isDone
                    ? 'color-mix(in srgb, #16A34A 12%, white)'
                    : '#F1F5F9',
                }}
              >
                {isDone ? <CheckCircle2 size={18} /> : <Icon size={18} />}
              </div>
              <div className="min-w-0">
                <div className={`text-[11px] font-semibold tracking-wide uppercase ${isActive ? 'text-emerald-800' : 'text-slate-500'}`}>
                  Schritt {i + 1}
                </div>
                <div className="text-sm font-semibold truncate">{s.label}</div>
                <div className="text-[11px] text-slate-500 truncate">{s.sub}</div>
              </div>
            </button>
            {i < STEPS.length - 1 && (
              <div className="self-center mx-1 flex-1 h-px hidden md:block" style={{ background: isDone ? '#16A34A' : '#E2E8F0' }} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default function WorkflowView({ onSwitchToRkm }) {
  const { step, setStep, session } = useSmartIcs();

  return (
    <div className="space-y-5">
      {session && <StepIndicator active={step} onStepClick={setStep} />}

      {step === 0 && <StepProzessanalyse onNext={() => setStep(1)} />}
      {step === 1 && <StepRisikoidentifikation onBack={() => setStep(0)} onNext={() => setStep(2)} />}
      {step === 2 && <StepRisikobeschreibung onBack={() => setStep(1)} onNext={() => setStep(3)} />}
      {step === 3 && <StepKontrollidentifikation onBack={() => setStep(2)} onComplete={onSwitchToRkm} />}
    </div>
  );
}
