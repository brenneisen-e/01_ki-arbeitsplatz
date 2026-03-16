import { useState } from 'react';
import { clsx } from 'clsx';

export default function Card({ children, className, hover = true, onClick, padding = true }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={clsx(
        'rounded-xl border transition-all duration-200',
        padding && 'p-5',
        hover && 'hover:-translate-y-px hover:shadow-md cursor-pointer',
        onClick && 'cursor-pointer',
        hover && isHovered ? 'border-transparent shadow-md' : 'border-slate-200',
        className
      )}
      style={{
        boxShadow: hover && isHovered ? undefined : 'var(--card-shadow)',
        backgroundColor: hover && isHovered ? 'var(--mode-pastel)' : '#ffffff',
      }}
      onClick={onClick}
      onMouseEnter={() => hover && setIsHovered(true)}
      onMouseLeave={() => hover && setIsHovered(false)}
    >
      {children}
    </div>
  );
}
