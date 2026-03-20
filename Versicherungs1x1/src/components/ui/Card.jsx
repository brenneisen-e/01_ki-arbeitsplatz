import clsx from 'clsx';

export default function Card({ children, className, hover, onClick, padding = true }) {
  return (
    <div
      className={clsx(
        'card-base',
        hover && 'card-hover cursor-pointer',
        padding && 'p-5',
        className,
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
