export default function ProgressSteps({ current, total }) {
  const dots = [];
  for (let i = 0; i <= total; i++) {
    const cls = i < current ? 'bg-emerald-600' : i === current ? 'bg-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.2)]' : 'bg-slate-300';
    dots.push(<div key={`d${i}`} className={`w-2 h-2 rounded-full shrink-0 ${cls}`} />);
    if (i < total) {
      const lineCls = i < current ? 'bg-emerald-600' : 'bg-slate-300';
      dots.push(<div key={`l${i}`} className={`w-4 h-0.5 ${lineCls}`} />);
    }
  }
  return (
    <div className="flex items-center gap-0">
      {dots}
      <span className="text-[15px] text-slate-500 ml-2 font-mono">{current}/{total}</span>
    </div>
  );
}
