import { useState } from 'react';
import { clsx } from 'clsx';

export default function Card({ children, className, hover = false, hoverColor, onClick, padding = true }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={clsx(
        'rounded-xl border transition-all duration-200',
        padding && 'p-5',
        hover && 'hover:-translate-y-px hover:shadow-md cursor-pointer',
        onClick && 'cursor-pointer',
        isHovered && hoverColor ? 'border-transparent shadow-md' : 'border-slate-200',
        className
      )}
      style={{
        boxShadow: isHovered && hoverColor ? undefined : 'var(--card-shadow)',
        backgroundColor: isHovered && hoverColor ? hoverColor : '#ffffff',
      }}
      onClick={onClick}
      onMouseEnter={() => hoverColor && setIsHovered(true)}
      onMouseLeave={() => hoverColor && setIsHovered(false)}
    >
      {children}
    </div>
  );
}
