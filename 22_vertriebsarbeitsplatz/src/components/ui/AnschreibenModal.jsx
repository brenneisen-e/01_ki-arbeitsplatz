import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, Send, Mail, Loader2, Check } from 'lucide-react';
import { useMode } from '../../hooks/useMode';
import useTranslation from '../../i18n/useTranslation';

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
 */
export default function AnschreibenModal({ kunde, potential, onClose }) {
  const [phase, setPhase] = useState('generating'); // generating | ready | sending | sent
  const { config } = useMode();
  const { t, lang } = useTranslation();
  const isEn = lang === 'en';
  const beraterSig = useMemo(() => getBeraterSignatur(config, isEn), [config, isEn]);
  const draft = useMemo(() => buildDraft(kunde, potential, beraterSig, isEn), [kunde, potential, beraterSig, isEn]);
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
                {potential?.titel} · {kunde?.name}
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

// ─── Demo-Draft-Generator ────────────────────────────────────────
function buildDraft(kunde, p, beraterSig, isEn) {
  const nachname = (kunde?.name || (isEn ? 'Customer' : 'Kunde')).split(' ').slice(-1)[0];
  const deAnrede = kunde?.anrede || 'Sehr geehrter Herr';
  const anrede = isEn
    ? (/frau/i.test(deAnrede) ? 'Dear Ms' : /herr/i.test(deAnrede) ? 'Dear Mr' : 'Dear')
    : deAnrede;
  const recipient = `${kunde?.name || ''} <${slug(kunde?.name || 'kunde')}@mail-demo.de>`;
  const sigLine1 = beraterSig?.line1 || (isEn ? 'Your advisor' : 'Ihre Beraterin');
  const sigLine2 = beraterSig?.line2 || '';
  const signatur = `${isEn ? 'Kind regards' : 'Herzliche Grüße'}\n${sigLine1}${sigLine2 ? '\n' + sigLine2 : ''}`;
  const institut = sigLine2 || (isEn ? 'your bank' : 'Ihre Bank');
  const partner = (function () {
    // Lazy import vermeiden — wir mappen die häufigsten Fälle direkt.
    const map = { 'Volksbank Mittelhessen': 'R+V', 'Sparkasse': 'Provinzial', 'Commerzbank': 'AMB', 'Deutsche Bank': 'Zurich', 'ING': 'NN', 'Zukunftsbank': 'Zukunftsversicherung' };
    return map[institut] || (isEn ? 'our insurance partner' : 'unserem Versicherungspartner');
  })();

  // Potenzial-spezifische Bausteine.
  const titel = p?.titel || (isEn ? 'advisory meeting' : 'Beratungsgespräch');
  const quellen = (p?.herleitung || []).slice(0, 3).map(h => `• ${h.label}: ${h.value}`).join('\n');

  // Story-spezifische Variante für das Flagship-Lead (Immobilienfinanzierung).
  const istImmo = /immobilienfinanzierung|kreditgespr|property financing|financing meeting/i.test(titel);
  const istVersicherung = /versicherung|haftpflicht|insurance|liability/i.test(titel);

  let body, subject, rationale;

  if (istImmo) {
    subject = isEn
      ? 'Your property plans: let us take the next step together'
      : 'Ihre Immobilienpläne – gemeinsam den nächsten Schritt gehen';
    rationale = isEn
      ? [
          'Expiring Commerzbank installment loan frees up EUR 840/month in 2 months (PSD2).',
          'Schwäbisch Hall building-savings contract (EUR 30,000) becomes ready for allocation in Q2/2026 (holdings).',
          'Subscriber to the "VR-Immobilien" newsletter for 24 months, recently clicked two articles on the KfW home-ownership programme.',
        ]
      : [
          'Auslaufender Ratenkredit bei der Commerzbank schafft in 2 Monaten 840 €/Mon. freie Liquidität (PSD2).',
          'Schwäbisch-Hall-Bausparvertrag (30.000 €) wird im Q2/2026 zuteilungsreif (Bestandsdaten).',
          'Seit 24 Monaten Abonnent des Newsletters „VR-Immobilien" – zuletzt zwei Artikel zum KfW-Wohneigentumsprogramm angeklickt.',
        ];
    body = isEn
?
`${anrede} ${nachname},

over the last few weeks we have seen three signals from you that fit together very well:

• Your installment loan with Commerzbank is due to expire in a few weeks; after that you will have around EUR 840 of additional liquidity available per month.
• Your building-savings contract with Schwäbisch Hall becomes ready for allocation in the second quarter of 2026; around EUR 30,000 will then be available as equity or for a special repayment.
• In addition, you have been a subscriber to our "VR-Immobilien & Finanzieren" newsletter for 2 years and have recently read several articles on building-savings and KfW support programmes.

For us, that is a clear sign that you are actively thinking about buying or modernising a property. I would gladly take 30 minutes to show you in person how financing through ${institut} could be structured, with concrete figures tailored to your situation.

Would a morning appointment next week at our branch suit you, or would you prefer to talk by video?

${signatur}`
:
`${anrede} ${nachname},

in den letzten Wochen haben wir bei Ihnen drei Signale gesehen, die sehr gut zusammenpassen:

• Ihr Ratenkredit bei der Commerzbank läuft planmäßig in wenigen Wochen aus – danach haben Sie rund 840 € zusätzliche Liquidität pro Monat zur Verfügung.
• Ihr Bausparvertrag bei Schwäbisch Hall wird im zweiten Quartal 2026 zuteilungsreif – rund 30.000 € stehen dann als Eigenkapital bzw. Sondertilgung bereit.
• Außerdem sind Sie seit 2 Jahren Abonnent unseres Newsletters „VR-Immobilien & Finanzieren" und haben zuletzt mehrfach Artikel rund um Bausparen und KfW-Förderprogramme gelesen.

Das ist für uns ein klares Zeichen, dass Sie sich aktiv mit dem Thema Immobilienkauf oder Modernisierung auseinandersetzen. Genau dafür würde ich mir gerne 30 Minuten Zeit nehmen und Ihnen in einem persönlichen Gespräch zeigen, wie eine Finanzierung über ${institut} strukturiert sein könnte – mit den konkreten Zahlen auf Ihre Situation zugeschnitten.

Passt Ihnen ein Termin nächste Woche vormittags in unserer Filiale oder möchten Sie lieber per Video sprechen?

${signatur}`;
  } else if (istVersicherung) {
    subject = isEn
      ? 'Your insurance cover: concrete savings opportunities for you'
      : `Ihr Versicherungsschutz – konkrete Einsparmöglichkeiten für Sie`;
    rationale = isEn
      ? [
          `Open Finance shows higher premiums with the third-party provider than with ${partner}.`,
          'Several contracts with different providers; bundling saves premium.',
          'Individual coverage gaps identified (no term life / accident cover).',
        ]
      : [
          `Open Finance zeigt höhere Prämien bei Fremdanbieter als bei ${partner}.`,
          'Mehrere Verträge bei verschiedenen Anbietern – Bündelung spart Prämie.',
          'Einzelne Absicherungslücken identifiziert (keine RLV / Unfall).',
        ];
    body = isEn
?
`${anrede} ${nachname},

based on your Open Finance consent we have analysed your current insurance contracts and found a few optimisation opportunities:

• Your fully comprehensive motor cover with HUK currently costs EUR 780 / year; with ${partner} the same protection would be possible for around EUR 620 / year.
• Your liability cover runs separately with another provider; in the ${partner} bundle it would already be included.
• I would also like to discuss a few open protection topics with you that would make sense with regard to your family.

I would gladly show you the concrete figures in a short conversation and we can find the package that suits you best together. Would an appointment next week suit you?

${signatur}`
:
`${anrede} ${nachname},

über Ihre Open-Finance-Einwilligung haben wir Ihre aktuellen Versicherungsverträge analysiert und einige Optimierungspotenziale entdeckt:

• Ihre KFZ-Vollkasko bei der HUK kostet aktuell 780 € / Jahr – bei ${partner} wäre derselbe Schutz für rund 620 € / Jahr möglich.
• Die Haftpflicht läuft separat bei einem anderen Anbieter – im ${partner}-Bündel wäre sie bereits enthalten.
• Außerdem möchte ich mit Ihnen einige offene Absicherungsthemen ansprechen, die im Hinblick auf Ihre Familie sinnvoll wären.

Gerne zeige ich Ihnen in einem kurzen Gespräch die konkreten Zahlen und wir finden gemeinsam das Paket, das für Sie am besten passt. Passt Ihnen nächste Woche ein Termin?

${signatur}`;
  } else {
    subject = isEn
      ? `${titel}: a suggestion for a short conversation`
      : `${titel} – Vorschlag für ein kurzes Gespräch`;
    rationale = isEn
      ? [
          `Potential from your lead board: ${titel}.`,
          'The AI detected independent signals in account activity and holdings.',
          'Recommended next step: a personal conversation.',
        ]
      : [
          `Potenzial aus Ihrem Lead-Board: ${titel}.`,
          'KI hat unabhängige Signale in den Kontoumsätzen und im Bestand erkannt.',
          'Empfohlener nächster Schritt: persönliches Gespräch.',
        ];
    const quellenBlockEn = quellen ? `Our assessment is based, among other things, on:\n${quellen}\n` : '';
    const quellenBlockDe = quellen ? `Unsere Einschätzung stützt sich dabei unter anderem auf:\n${quellen}\n` : '';
    body = isEn
?
`${anrede} ${nachname},

in our current analysis of your financial situation, one topic caught our attention that I would gladly share some information about:

${p?.beschreibung || titel}

${quellenBlockEn}I would be happy to show you in a short personal conversation what concrete benefits this could have for you.

Would you have a suitable appointment this week or next?

${signatur}`
:
`${anrede} ${nachname},

in unserer aktuellen Analyse Ihrer Finanzsituation ist uns ein Thema aufgefallen, zu dem ich Ihnen gerne ein paar Informationen geben möchte:

${p?.beschreibung || titel}

${quellenBlockDe}Gerne möchte ich Ihnen in einem kurzen persönlichen Gespräch zeigen, welche konkreten Vorteile sich daraus für Sie ergeben.

Hätten Sie diese oder nächste Woche einen passenden Termin?

${signatur}`;
  }

  return { body, subject, recipient, rationale };
}

function slug(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '');
}
