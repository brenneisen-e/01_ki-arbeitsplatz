import { useEffect, useRef } from 'react';

export default function CountUp({ target, duration = 1200, decimals = 0 }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const val = target * eased;
      el.textContent = decimals > 0
        ? val.toFixed(decimals).replace('.', ',')
        : Math.round(val).toLocaleString('de-DE');
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, decimals]);

  return <span ref={ref} className="font-mono">0</span>;
}
