import { clsx } from 'clsx';

/**
 * Karte des Cockpits: weiße Fläche, Hairline, 14 px Radius, weicher Schatten
 * (Farben und Schatten aus .card-base, Hover-Anheben aus .card-hover).
 */
export default function Card({ children, className, hover = true, onClick, padding = true }) {
  return (
    <div
      className={clsx(
        'rounded-(--card-radius) border border-(--border-light) card-base',
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
