import { clsx } from 'clsx';

export default function Card({ children, className, hover = true, onClick, padding = true }) {
  return (
    <div
      className={clsx(
        'rounded-xl border border-slate-200 card-base',
        padding && 'p-5',
        hover ? 'card-hover cursor-pointer' : 'card-passthrough',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
