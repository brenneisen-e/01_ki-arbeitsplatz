import { useState } from 'react';
import { ChevronDown } from '../ui/Icons';

export default function RegulatoryPyramid({ block }) {
  const levels = block.levels || [];
  const [openLevels, setOpenLevels] = useState(new Set());

  const toggle = (idx) => {
    setOpenLevels(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div className="my-6">
      {block.title && (
        <h3 className="text-base font-bold text-slate-900 mb-3">{block.title}</h3>
      )}
      <div className="space-y-2">
        {levels.map((level, i) => {
          const isOpen = openLevels.has(i);
          return (
            <div
              key={i}
              className={`pyramid-level ${isOpen ? 'open' : ''}`}
              style={{
                background: `${level.color || '#E5E7EB'}1A`,
                borderColor: level.color || '#E5E7EB',
              }}
              onClick={() => toggle(i)}
            >
              <div className="pyramid-level-header">
                <span style={{ color: level.color || '#111827' }}>{level.label}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  style={{ color: level.color || '#6B7280' }}
                />
              </div>
              <ul className="pyramid-items">
                {(level.items || []).map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
