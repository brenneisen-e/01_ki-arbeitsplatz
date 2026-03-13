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
        isHovered ? 'border-transparent shadow-md' : 'border-slate-200',
        className
      )}
      style={{
        boxShadow: isHovered ? undefined : 'var(--card-shadow)',
        backgroundColor: isHovered ? 'var(--mode-pastel)' : '#ffffff',
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </div>
  );
}
