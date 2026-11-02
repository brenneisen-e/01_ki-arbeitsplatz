/**
 * Pipeline-Balken: die Stufen sind eine geordnete Reihe, deshalb tragen sie
 * eine Tonleiter der Modus-Chartfarbe (hell → dunkel, eine Farbe je Chart);
 * 2 px Lücke in der Kartenfarbe trennt die Segmente. Die `color`-Werte der
 * Segmente werden bewusst nicht mehr verwendet.
 */
export default function PipelineBar({ segments }) {
  const total = segments.reduce((s, seg) => s + seg.count, 0);
  if (total === 0) return null;

  const visible = segments.filter(seg => seg.count > 0);
  const steps = Math.max(visible.length - 1, 1);

  return (
    <div className="w-full">
      <div className="flex h-8 gap-[2px]">
        {visible.map((seg, i) => {
          const pct = (seg.count / total) * 100;
          // 40 % … 100 % der Modus-Chartfarbe, mit Weiß gemischt
          const mix = Math.round(40 + (60 * i) / steps);
          const dark = mix >= 65;
          return (
            <div
              key={seg.label}
              className="flex items-center justify-center text-xs font-semibold font-mono transition-all duration-500 relative group"
              style={{
                width: `${pct}%`,
                backgroundColor: `color-mix(in srgb, var(--mode-chart) ${mix}%, white)`,
                color: dark ? '#ffffff' : 'var(--text-primary)',
                borderRadius: i === 0 ? '8px 0 0 8px' : i === visible.length - 1 ? '0 8px 8px 0' : '0',
              }}
            >
              {pct > 8 && <span>{seg.count}</span>}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 surface-elevated rounded-lg text-(--text-primary) text-xs font-sans font-medium px-3 py-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {seg.label}: {seg.count} ({pct.toFixed(0)}%)
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex mt-2 gap-[2px]">
        {visible.map(seg => {
          const pct = (seg.count / total) * 100;
          return (
            <div key={seg.label} className="text-xs text-(--text-tertiary) text-center truncate" style={{ width: `${pct}%` }} title={seg.label}>
              {seg.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
