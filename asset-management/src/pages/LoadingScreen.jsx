import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';

const STEPS = [
  { pct: 20, text: 'Loading portfolio data...' },
  { pct: 45, text: 'Connecting to event monitor...' },
  { pct: 65, text: 'Syncing cashflow data...' },
  { pct: 85, text: 'Preparing workflows...' },
  { pct: 100, text: 'Ready' },
];

export default function LoadingScreen({ onComplete }) {
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    if (stepIdx >= STEPS.length) {
      const timer = setTimeout(onComplete, 300);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setStepIdx(i => i + 1), 350);
    return () => clearTimeout(timer);
  }, [stepIdx, onComplete]);

  const step = STEPS[Math.min(stepIdx, STEPS.length - 1)];

  return (
    <div className="flex items-center justify-center min-h-screen"
         style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
      <div className="text-center w-[360px]">
        <div className="w-14 h-14 mx-auto mb-5 bg-blue-500/15 rounded-[14px] flex items-center justify-center text-blue-500">
          <Activity size={28} />
        </div>
        <h2 className="text-lg font-semibold text-slate-200 mb-6">Portfolio Management Dashboard</h2>
        <div className="mb-4">
          <div className="h-1 bg-white/10 rounded-sm overflow-hidden">
            <div className="h-full rounded-sm transition-[width] duration-300 ease-out"
                 style={{ width: `${step.pct}%`, background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)' }} />
          </div>
        </div>
        <p className="text-base text-slate-500">{step.text}</p>
      </div>
    </div>
  );
}
