import { useState, useMemo } from 'react';

export default function CombinedRatioCalc() {
  const [schaden, setSchaden] = useState(65);
  const [kosten, setKosten] = useState(28);

  const { total, cls, interpretation } = useMemo(() => {
    const t = schaden + kosten;
    if (t < 100) return { total: t, cls: 'green', interpretation: `Versicherungstechnischer Gewinn von ${100 - t}%` };
    if (t === 100) return { total: t, cls: 'neutral', interpretation: 'Break-even — kein versicherungstechnischer Gewinn oder Verlust' };
    return { total: t, cls: 'red', interpretation: `Versicherungstechnischer Verlust von ${t - 100}%` };
  }, [schaden, kosten]);

  return (
    <div className="calculator my-6">
      <div className="text-base font-bold text-slate-900 mb-4">Combined Ratio Rechner</div>
      <div className="space-y-4 mb-5">
        <div>
          <label className="flex items-center justify-between text-sm text-slate-700 mb-1">
            <span>Schadenquote (Loss Ratio)</span>
            <span className="font-mono font-semibold">{schaden}%</span>
          </label>
          <input
            type="range"
            min="30"
            max="120"
            value={schaden}
            onChange={e => setSchaden(Number(e.target.value))}
            className="calc-slider w-full"
          />
        </div>
        <div>
          <label className="flex items-center justify-between text-sm text-slate-700 mb-1">
            <span>Kostenquote (Expense Ratio)</span>
            <span className="font-mono font-semibold">{kosten}%</span>
          </label>
          <input
            type="range"
            min="10"
            max="60"
            value={kosten}
            onChange={e => setKosten(Number(e.target.value))}
            className="calc-slider w-full"
          />
        </div>
      </div>
      <div className={`cr-result ${cls}`}>
        <div className="text-sm font-medium text-slate-600 mb-1">Combined Ratio</div>
        <div className="text-4xl font-bold font-mono">{total}%</div>
        <div className="text-sm mt-1">{interpretation}</div>
      </div>
    </div>
  );
}
