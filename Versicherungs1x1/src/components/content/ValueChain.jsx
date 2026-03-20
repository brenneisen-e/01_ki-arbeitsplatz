import { useState } from 'react';
import { getIconComponent, ChevronRight } from '../ui/Icons';

export default function ValueChain({ block }) {
  const steps = block.steps || [];
  const [active, setActive] = useState(null);

  return (
    <div className="my-6">
      {block.title && (
        <h3 className="text-base font-bold text-slate-900 mb-3">{block.title}</h3>
      )}
      <div className="flex items-start gap-2 overflow-x-auto pb-2">
        {steps.map((step, i) => {
          const Icon = getIconComponent(step.icon || 'settings-2');
          const isActive = active === i;
          return (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`vc-step ${isActive ? 'active' : ''}`}
                onClick={() => setActive(isActive ? null : i)}
              >
                <div className="text-emerald-700 mb-2">
                  <Icon className="w-5 h-5 mx-auto" />
                </div>
                <div className="text-xs font-semibold text-slate-800">{step.label}</div>
                <div className="vc-step-detail">{step.description}</div>
              </div>
              {i < steps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
