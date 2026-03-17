import { clsx } from 'clsx';
import useTranslation from '../../i18n/useTranslation';

export default function TabBar({ tabs, activeTab, onTabChange }) {
  const { t, lang } = useTranslation();
  return (
    <div className="flex gap-1 border-b border-slate-200 mb-6">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={clsx(
            'px-4 py-2.5 text-sm font-medium transition-all duration-200 border-b-2 -mb-px',
            activeTab === tab.id
              ? 'border-current text-slate-800'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          )}
          style={activeTab === tab.id ? { borderColor: 'var(--mode-primary-light)' } : undefined}
        >
          {tab.labelKey ? t(tab.labelKey) : (lang === 'en' && tab.labelEn ? tab.labelEn : tab.label)}
        </button>
      ))}
    </div>
  );
}
