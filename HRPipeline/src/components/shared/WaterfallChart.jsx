export default function WaterfallChart({ waterfall }) {
  if (!waterfall?.length) return null;
  const maxPoints = Math.max(...waterfall.map(w => Math.abs(w.points)));

  return (
    <div className="hp-waterfall" style={{ gridColumn: '1 / -1' }}>
      <h4>Score-Erklärung (SHAP-Analyse)</h4>
      {waterfall.map((w, i) => {
        const pct = (Math.abs(w.points) / maxPoints) * 100;
        const typeClass = w.type === 'positive' ? 'positive' : w.type === 'neutral' ? 'neutral' : 'negative';
        return (
          <div className="hp-waterfall-bar" key={i}>
            <div className="hp-waterfall-label">{w.label}</div>
            <div className="hp-waterfall-track">
              <div className={`hp-waterfall-fill ${typeClass}`} style={{ width: `${pct}%` }} />
            </div>
            <div className={`hp-waterfall-value ${typeClass}`}>
              {w.type === 'positive' ? '+' : ''}{w.points}
            </div>
          </div>
        );
      })}
    </div>
  );
}
