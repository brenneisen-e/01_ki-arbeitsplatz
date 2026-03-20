import { useState } from 'react';
import { ChevronDown } from '../ui/Icons';

export default function CollapsibleSection({ title, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="my-4">
      <button
        className={`section-trigger ${open ? 'open' : ''}`}
        onClick={() => setOpen(prev => !prev)}
      >
        <span>{title}</span>
        <ChevronDown className={`w-4 h-4 chevron transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`section-body ${open ? 'open' : ''}`}>
        <div className="pt-4">
          {children}
        </div>
      </div>
    </div>
  );
}
