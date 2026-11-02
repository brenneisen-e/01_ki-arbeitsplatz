import { clsx } from 'clsx';
import useTranslation from '../../i18n/useTranslation';

/**
 * Reiterleiste auf heller Fläche: aktiver Reiter mit Unterstrich in der
 * Modusfarbe und Text in --text-primary, inaktive in --text-secondary.
 */
export default function TabBar({ tabs, activeTab, onTabChange }) {
  const { t, lang } = useTranslation();
  return (
    <div className="flex gap-1 border-b border-(--border-light) mb-6">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={clsx(
            'px-4 py-2.5 text-sm font-medium transition-colors duration-200 border-b-2 -mb-px',
            activeTab === tab.id
              ? 'border-(--mode-primary) text-(--text-primary)'
              : 'border-transparent text-(--text-secondary) hover:text-(--text-primary)'
          )}
        >
          {tab.labelKey ? t(tab.labelKey) : (lang === 'en' && tab.labelEn ? tab.labelEn : tab.label)}
        </button>
      ))}
    </div>
  );
}
