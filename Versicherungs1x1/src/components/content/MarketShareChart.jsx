import { useEffect, useState } from 'react';

const MARKET_DATA = [
  { label: 'Allianz', value: 17.4 },
  { label: 'R+V', value: 8.0 },
  { label: 'ERGO', value: 7.2 },
  { label: 'HUK-Coburg', value: 7.2 },
  { label: 'Debeka', value: 6.1 },
  { label: 'Talanx/HDI', value: 5.8 },
  { label: 'Generali', value: 5.5 },
  { label: 'BarmeniaGothaer', value: 3.5 },
];

export default function MarketShareChart() {
  const [animate, setAnimate] = useState(false);
  const maxVal = MARKET_DATA[0].value;

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="my-6">
      <div className="text-sm font-semibold text-slate-700 mb-3">
        Marktanteile der Top-Versicherer (Gesamtmarkt)
      </div>
      <div className="space-y-2">
        {MARKET_DATA.map((d, i) => {
          const pct = (d.value / maxVal * 100).toFixed(0);
          return (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-700 w-32 text-right">{d.label}</span>
              <div className="market-bar-track flex-1">
                <div
                  className="market-bar-fill"
                  style={{
                    width: animate ? `${pct}%` : '0%',
                    transitionDelay: `${i * 100}ms`,
                  }}
                >
                  {animate && <span>{d.value.toFixed(1)}%</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
