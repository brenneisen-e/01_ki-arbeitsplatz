import { clsx } from 'clsx';

export default function Card({ children, className, hover = false, onClick, padding = true }) {
  return (
    <div
      className={clsx(
        'bg-white rounded-xl border border-slate-200 transition-all duration-200',
        padding && 'p-5',
        hover && 'hover:-translate-y-px hover:shadow-md cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
      style={{ boxShadow: 'var(--card-shadow)' }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
