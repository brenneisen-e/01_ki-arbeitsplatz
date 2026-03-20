export default function Timeline({ block }) {
  const events = block.events || [];

  return (
    <div className="my-6">
      {block.title && (
        <h3 className="text-base font-bold text-slate-900 mb-3">{block.title}</h3>
      )}
      <div className="timeline-track overflow-x-auto">
        {events.map((ev, i) => (
          <div key={i} className="timeline-event">
            <div className={`timeline-dot type-${ev.type || 'market'}`} />
            <div className="timeline-year">{ev.year}</div>
            <div className="timeline-title">{ev.title}</div>
            <div className="timeline-desc">{ev.description}</div>
          </div>
        ))}
      </div>
      <div className="timeline-legend">
        <span className="type-regulation">Regulatorik</span>
        <span className="type-market">Marktentwicklung</span>
        <span className="type-crisis">Krise</span>
        <span className="type-innovation">Innovation</span>
      </div>
    </div>
  );
}
