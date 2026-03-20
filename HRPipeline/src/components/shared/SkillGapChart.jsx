export default function SkillGapChart({ skillGap }) {
  if (!skillGap) return null;

  return (
    <div className="hp-skill-gap">
      <h4>Skill-Gap-Analyse (Ist vs. Soll)</h4>
      {skillGap.dimensions.map((d, i) => {
        const gap = Math.max(0, d.required - d.current);
        const color = gap > 0 ? '#DC2626' : '#16A34A';
        return (
          <div key={i}>
            <div className="hp-skill-gap-row">
              <div className="hp-skill-gap-label">{d.label}</div>
              <div className="hp-skill-gap-bars">
                <div className="hp-skill-gap-current" style={{ width: `${d.current}%` }} />
                <div className="hp-skill-gap-required" style={{ left: `${d.required}%` }} title={`Anforderung: ${d.required}%`} />
              </div>
              <div className="hp-skill-gap-pct" style={{ color }}>
                {gap > 0 ? `-${gap}%` : 'OK'}
              </div>
            </div>
            {d.reason && (
              <div className="hp-skill-gap-reason">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                {d.reason}
              </div>
            )}
          </div>
        );
      })}
      {skillGap.training && (
        <div className="hp-training-rec"><strong>Weiterbildungsempfehlung:</strong> {skillGap.training}</div>
      )}
    </div>
  );
}
