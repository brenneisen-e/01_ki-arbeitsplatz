import { getIconComponent } from '../ui/Icons';

export default function InfoKachelGrid({ block }) {
  const items = block.items || [];

  return (
    <div className="my-4">
      {block.title && (
        <h3 className="text-base font-bold text-slate-900 mb-3">{block.title}</h3>
      )}
      <div className="info-kachel-grid">
        {items.map((item, i) => {
          const Icon = getIconComponent(item.icon || 'info');
          return (
            <div key={i} className="info-kachel">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                style={{ background: 'var(--mode-pastel)', color: 'var(--mode-primary)' }}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="font-semibold text-sm text-slate-800 mb-1">{item.title}</div>
              <div className="text-xs text-slate-600 leading-relaxed">{item.description}</div>
              {item.link && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-600 font-medium mt-2 inline-block hover:underline"
                >
                  Mehr erfahren →
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
