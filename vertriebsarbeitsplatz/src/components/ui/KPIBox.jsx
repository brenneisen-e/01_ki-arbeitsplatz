import { clsx } from 'clsx';
import * as LucideIcons from 'lucide-react';
import { useEffect, useState } from 'react';

function formatValue(wert, format) {
  if (format === 'eur') {
    if (wert >= 1000000) return `${(wert / 1000000).toLocaleString('de-DE', { maximumFractionDigits: 1 })} M\u20ac`;
    if (wert >= 1000) return `${(wert / 1000).toLocaleString('de-DE', { maximumFractionDigits: 0 })} k\u20ac`;
    return `${wert.toLocaleString('de-DE')} \u20ac`;
  }
  if (format === 'pct') return `${wert.toLocaleString('de-DE', { maximumFractionDigits: 1 })}%`;
  if (format === 'num') return wert.toLocaleString('de-DE');
  return String(wert);
}

export default function KPIBox({ icon, label, wert, format = 'num', trend, delay = 0 }) {
  const [displayed, setDisplayed] = useState(0);
  const Icon = LucideIcons[icon] || LucideIcons.BarChart3;
  const isPositive = trend >= 0;

  useEffect(() => {
    const duration = 800;
    const steps = 30;
    const stepTime = duration / steps;
    let current = 0;
    const timer = setInterval(() => {
      current++;
      const progress = current / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(wert * eased);
      if (current >= steps) {
        setDisplayed(wert);
        clearInterval(timer);
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [wert]);

  return (
    <div
      className="bg-white rounded-xl border border-slate-200 p-5 animate-fade-in-up"
      style={{ boxShadow: 'var(--card-shadow)', animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'color-mix(in srgb, var(--mode-primary-light) 10%, transparent)' }}
        >
          <Icon size={18} style={{ color: 'var(--mode-primary-light)' }} strokeWidth={1.75} />
        </div>
        {trend !== undefined && (
          <span className={clsx('text-xs font-medium', isPositive ? 'text-emerald-600' : 'text-red-500')}>
            {isPositive ? '\u2191' : '\u2193'} {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="font-mono text-3xl font-bold text-slate-900 mb-1" style={{ fontFeatureSettings: "'tnum'" }}>
        {formatValue(format === 'pct' ? displayed : Math.round(displayed), format)}
      </div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  );
}
