import { clsx } from 'clsx';

export default function KpiRow({ items }) {
  return (
    <div className="grid grid-cols-5 gap-3 mb-6 animate-fade-in">
      {items.map((item, i) => (
        <button key={i}
          onClick={item.onClick}
          className={clsx(
            'bg-white border border-slate-200 rounded-[10px] px-5 py-4 text-center transition-all cursor-pointer',
            'hover:bg-[#86BC25] hover:border-[#86BC25] hover:shadow-[0_4px_12px_rgba(134,188,37,0.3)] hover:-translate-y-0.5',
            'group',
            item.type === 'warning' && 'border-l-[3px] border-l-amber-500',
            item.type === 'info' && 'border-l-[3px] border-l-blue-500',
            item.type === 'success' && 'border-l-[3px] border-l-emerald-500',
          )}
        >
          <div className={clsx(
            'text-[28px] font-bold font-mono leading-tight group-hover:!text-white',
            item.type === 'warning' && 'text-amber-600',
            item.type === 'info' && 'text-blue-500',
            item.type === 'success' && 'text-emerald-600',
            item.type === 'neutral' && 'text-slate-800',
          )}>
            {item.value}
          </div>
          <div className="text-base text-slate-500 mt-1 group-hover:text-white">{item.label}</div>
        </button>
      ))}
    </div>
  );
}
