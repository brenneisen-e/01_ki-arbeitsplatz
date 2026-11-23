import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, Send, Mail, Loader2, Check } from 'lucide-react';
import { useMode } from '../../hooks/useMode';
import useTranslation from '../../i18n/useTranslation';
import { useNotizenStelle } from '../../notizen/stand';
import { baueAnschreiben } from '../../utils/anschreiben';
import { interpolateDynamicDates } from '../../utils/dynamicDates';

// Liest die auf der Landing-Page hinterlegten Berater-Stammdaten aus dem
// localStorage und ergänzt sie um den Mode-Default + ein passendes Anrede-
// Präfix („Ihre Beraterin Frau Müller" / „Ihr Berater Herr Schmidt").
// Im Englischen: „Your advisor Mr/Ms …".
function getBeraterSignatur(modeConfig, isEn) {
  const fullname = (typeof window !== 'undefined' && localStorage.getItem('kia_user_fullname')) || '';
  const gender = (typeof window !== 'undefined' && localStorage.getItem('kia_user_gender')) || '';
  const name = fullname.trim() || modeConfig?.beraterName || (isEn ? 'Your advisor' : 'Ihre Beraterin');
  const last = name.split(' ').filter(Boolean).pop() || name;
  const isWeiblich = gender === 'w' || gender === 'weiblich' || gender === 'female';
  const isMaennlich = gender === 'm' || gender === 'männlich' || gender === 'male';
  const titelW = modeConfig?.beraterTitelW || modeConfig?.beraterTitel || 'Beraterin';
  const titelM = modeConfig?.beraterTitelM || modeConfig?.beraterTitel || 'Berater';
  const anredePrefix = isEn
    ? (isMaennlich ? 'Your advisor Mr' : isWeiblich ? 'Your advisor Ms' : 'Your advisor')
    : (isMaennlich
        ? `Ihr ${titelM} Herr`
        : isWeiblich
          ? `Ihre ${titelW} Frau`
          : `${titelW || 'Ihre Beraterin'}`);
  return {
    line1: `${anredePrefix} ${last}`.trim(),
    line2: modeConfig?.institut || '',
  };
}

/**
 * AnschreibenModal
 *
 * Wird aus dem Leads-Tab gestartet (Button "Anschreiben formulieren") und
 * formuliert mit Hilfe der KI ein auf das konkrete Potenzial passendes
 * Kunden-Anschreiben. Der Text wird stufenweise generiert (Loading-Animation)
 * und kann dann "verschickt" werden — in der Demo erzeugt der Versand einen
 * Confirmation-Screen.
 *
 * Betreff, Brieftext und KI-Begründung baut `baueAnschreiben`
 * (utils/anschreiben.js) aus den Daten des Leads.
 */
export default function AnschreibenModal({ kunde, potential, onClose }) {
  const [phase, setPhase] = useState('generating'); // generating | ready | sending | sent
  // Das Notizfenster springt mit, solange das Anschreiben offen ist (src/notizen).
  useNotizenStelle('anschreiben');
  const { config, modeId } = useMode();
  const { t, lang } = useTranslation();
  const isEn = lang === 'en';
  const beraterSig = useMemo(() => getBeraterSignatur(config, isEn), [config, isEn]);
  const draft = useMemo(() => {
    const brief = baueAnschreiben({ kunde, potential, institut: config?.institut, modeId, signatur: beraterSig, isEn });
    return { subject: brief.betreff, body: brief.text, rationale: brief.begruendung, recipient: brief.empfaenger };
  }, [kunde, potential, config?.institut, modeId, beraterSig, isEn]);
  const [text, setText] = useState('');
  const [subject, setSubject] = useState(draft.subject);

  // KI-„Generierung" simulieren: kurze Verzögerung, dann Text einblenden.
  useEffect(() => {
    const tmr = setTimeout(() => {
      setText(draft.body);
      setPhase('ready');
    }, 1400);
    return () => clearTimeout(tmr);
  }, [draft.body]);

  // Betreff aktualisieren, wenn sich die Sprache (und damit der Draft) ändert.
  useEffect(() => { setSubject(draft.subject); }, [draft.subject]);

  // ESC zum Schließen
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSend = () => {
    setPhase('sending');
    // Animation läuft 1,4 s — danach in „sent" wechseln
    setTimeout(() => setPhase('sent'), 1500);
  };

  return createPortal(
    <div
      data-modal="anschreiben"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
      style={{ background: 'rgba(28, 26, 23, 0.45)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] overflow-hidden surface-elevated rounded-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-(--border-light)">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-(--mode-primary)">
              <Sparkles size={20} className="text-white" strokeWidth={2} />
            </div>
            <div>
              <h2 className="font-semibold text-(--text-primary)">{t('kiAnschreiben')}</h2>
              <p className="text-xs text-(--text-tertiary) mt-0.5">
                {interpolateDynamicDates(potential?.titel, { institut: config?.institut })} · {kunde?.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-(--bg-inset) transition-colors"
          >
            <X size={18} className="text-(--text-secondary)" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {phase === 'generating' && (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-(--mode-pastel) flex items-center justify-center">
                  <Sparkles size={26} className="text-(--mode-primary) animate-pulse" />
                </div>
                <Loader2 size={14} className="absolute -bottom-1 -right-1 text-(--mode-accent) animate-spin" />
              </div>
              <div>
                <p className="text-sm font-semibold text-(--text-primary)">{t('kiFormuliertAnschreiben')}</p>
                <p className="text-xs text-(--text-tertiary) mt-1">
                  {t('anschreibenAuswertung')}
                </p>
              </div>
            </div>
          )}

          {phase === 'sending' && (
            <div className="relative flex items-center justify-center py-16 min-h-[260px] overflow-hidden">
              {/* Brief faltet sich zusammen */}
              <div className="kia-letter-fold w-64 h-44 rounded-lg surface-card p-4 text-[10px] leading-snug text-(--text-tertiary) overflow-hidden">
                <div className="font-semibold text-(--text-secondary) mb-1.5">{subject}</div>
                <div className="space-y-0.5">
                  <div className="h-1.5 bg-(--bg-inset) rounded w-3/4" />
                  <div className="h-1.5 bg-(--bg-inset) rounded w-full" />
                  <div className="h-1.5 bg-(--bg-inset) rounded w-5/6" />
                  <div className="h-1.5 bg-(--bg-inset) rounded w-2/3" />
                  <div className="h-1.5 bg-(--bg-inset) rounded w-4/5" />
                  <div className="h-1.5 bg-(--bg-inset) rounded w-3/4" />
                </div>
              </div>
              {/* Umschlag fliegt nach oben rechts */}
              <div className="kia-envelope-fly">
                <svg viewBox="0 0 96 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
                  <rect x="2" y="6" width="92" height="54" rx="4" fill="var(--bg-card)" stroke="var(--mode-primary)" strokeWidth="2" />
                  <path d="M2 8 L48 38 L94 8" stroke="var(--mode-primary)" strokeWidth="2" fill="none" />
                  <path d="M2 60 L36 32 M94 60 L60 32" stroke="var(--mode-accent)" strokeWidth="1.5" fill="none" />
                </svg>
              </div>
              <div className="kia-envelope-swoosh" />
              <p className="absolute bottom-4 text-xs text-(--mode-primary) font-medium">{t('anschreibenWirdVersendet')}</p>
            </div>
          )}

          {(phase === 'ready' || phase === 'sent') && (
            <>
              {/* Signal-Rationale */}
              <div className="rounded-xl surface-inset p-4 border-l-[3px]" style={{ borderLeftColor: 'var(--quelle-kommunikation)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={14} className="text-(--quelle-kommunikation)" />
                  <span className="text-xs font-semibold text-(--quelle-kommunikation)">
                    {t('kiBegruendungAnschreiben')}
                  </span>
                </div>
                <ul className="text-sm text-(--text-primary) space-y-1 list-disc list-inside">
                  {draft.rationale.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>

              {/* Empfänger / Betreff */}
              <div className="grid grid-cols-[80px,1fr] gap-y-2 gap-x-3 text-sm">
                <span className="text-(--text-tertiary) pt-2">{t('anLabel')}</span>
                <div className="flex items-center gap-2 rounded-lg surface-inset px-3 py-2">
                  <Mail size={14} className="text-(--text-tertiary)" />
                  <span className="text-(--text-primary)">{draft.recipient}</span>
                </div>
                <span className="text-(--text-tertiary) pt-2">{t('betreffLabel')}</span>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={phase === 'sending' || phase === 'sent'}
                  className="rounded-lg surface-inset px-3 py-2 text-(--text-primary) placeholder:text-(--text-tertiary) disabled:opacity-70"
                />
              </div>

              {/* Textkörper */}
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={phase === 'sending' || phase === 'sent'}
                rows={14}
                className="w-full rounded-xl surface-inset px-4 py-3 text-sm text-(--text-primary) leading-relaxed font-mono disabled:opacity-70"
              />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-(--border-light) bg-(--bg-inset) flex items-center justify-between">
          <span className="text-xs text-(--text-tertiary)">
            {phase === 'sent' ? (
              <span className="flex items-center gap-1.5 text-(--color-success) font-medium">
                <Check size={14} /> {t('anschreibenVersendet')}
              </span>
            ) : phase === 'ready' ? (
              t('anschreibenGeneriertHinweis')
            ) : phase === 'sending' ? (
              t('versendeKurz')
            ) : (
              t('generiereAnschreiben')
            )}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-lg text-sm font-medium text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-card) transition-colors"
            >
              {phase === 'sent' ? t('schliessen') : t('abbrechen')}
            </button>
            {phase !== 'sent' && (
              <button
                onClick={handleSend}
                disabled={phase !== 'ready'}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-(--mode-primary) hover:bg-(--mode-primary-light) transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {phase === 'sending' ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> {t('versendeKurz')}
                  </>
                ) : (
                  <>
                    <Send size={14} /> {t('jetztVersenden')}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
