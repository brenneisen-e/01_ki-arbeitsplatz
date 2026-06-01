import { ArrowLeft } from 'lucide-react';
import { useMode } from '../../hooks/useMode';
import useTranslation from '../../i18n/useTranslation';

/**
 * Wraps a legacy app.html module inside an iframe.
 * Provides a consistent header with back button.
 */
export default function LegacyModule() {
  const { legacyRoute, legacyTitle, goBack } = useMode();
  const { t } = useTranslation();

  // Build the iframe URL pointing to app.html with the legacy hash route
  const basePath = window.location.pathname;
  const appHtmlPath = basePath.includes('/vertriebsarbeitsplatz/')
    ? basePath.substring(0, basePath.indexOf('/vertriebsarbeitsplatz/')) + '/app.html'
    : '/app.html';
  const iframeSrc = `${appHtmlPath}#/${legacyRoute}`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Minimal header with back button */}
      <header className="bg-slate-800 px-4 py-3 flex items-center gap-3 shrink-0">
        <button
          onClick={goBack}
          className="text-white/70 hover:text-white transition-colors p-1"
        >
          <ArrowLeft size={20} strokeWidth={1.75} />
        </button>
        <span className="text-white text-sm font-medium">
          {legacyTitle || t('modul')}
        </span>
        <span className="text-white/40 text-xs ml-auto">
          {t('zurueckStartseite')}
        </span>
      </header>
      {/* iframe fills the remaining space */}
      <iframe
        src={iframeSrc}
        title={legacyTitle || 'Legacy Module'}
        className="flex-1 w-full border-0"
        style={{ minHeight: 'calc(100vh - 52px)' }}
      />
    </div>
  );
}
