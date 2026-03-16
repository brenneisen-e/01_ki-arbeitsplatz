import { useState, useEffect, useCallback } from 'react';
import translations from './translations';

/**
 * Hook that returns a translation function t(key, params?).
 * Language is read from localStorage('kia_language'), default 'de'.
 *
 * Usage:
 *   const { t, lang } = useTranslation();
 *   t('startseite')             → 'Startseite' | 'Home'
 *   t('alleMandantenAnzeigen', { count: 5 })  → 'Alle 5 Mandanten anzeigen →'
 */
export default function useTranslation() {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('kia_language') || 'de'; } catch { return 'de'; }
  });

  useEffect(() => {
    // Listen for storage changes (e.g. language switched on landing page)
    const handler = () => {
      const next = localStorage.getItem('kia_language') || 'de';
      setLang(next);
    };
    window.addEventListener('storage', handler);
    // Also poll briefly in case same-tab change
    const interval = setInterval(() => {
      const current = localStorage.getItem('kia_language') || 'de';
      setLang(prev => prev !== current ? current : prev);
    }, 500);
    return () => { window.removeEventListener('storage', handler); clearInterval(interval); };
  }, []);

  const t = useCallback((key, params) => {
    const entry = translations[key];
    if (!entry) return key;
    let text = entry[lang] || entry.de || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v);
      });
    }
    return text;
  }, [lang]);

  return { t, lang };
}
