import { useEffect, useMemo, useState } from 'react';
import { X, Sparkles, Send, Mail, Loader2, Check } from 'lucide-react';
import { useMode } from '../../hooks/useMode';

// Liest die auf der Landing-Page hinterlegten Berater-Stammdaten aus dem
// localStorage und ergänzt sie um den Mode-Default + ein passendes Anrede-
// Präfix („Ihre Beraterin Frau Müller" / „Ihr Berater Herr Schmidt").
function getBeraterSignatur(modeConfig) {
  const fullname = (typeof window !== 'undefined' && localStorage.getItem('kia_user_fullname')) || '';
  const gender = (typeof window !== 'undefined' && localStorage.getItem('kia_user_gender')) || '';
  const name = fullname.trim() || modeConfig?.beraterName || 'Ihre Beraterin';
  const last = name.split(' ').filter(Boolean).pop() || name;
  const isWeiblich = gender === 'w' || gender === 'weiblich' || gender === 'female';
  const isMaennlich = gender === 'm' || gender === 'männlich' || gender === 'male';
  const titelW = modeConfig?.beraterTitelW || modeConfig?.beraterTitel || 'Beraterin';
  const titelM = modeConfig?.beraterTitelM || modeConfig?.beraterTitel || 'Berater';
  const anredePrefix = isMaennlich
    ? `Ihr ${titelM} Herr`
    : isWeiblich
      ? `Ihre ${titelW} Frau`
      : `${titelW || 'Ihre Beraterin'}`;
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
  const beraterSig = useMemo(() => getBeraterSignatur(config), [config]);
  const draft = useMemo(() => buildDraft(kunde, potential, beraterSig), [kunde, potential, beraterSig]);
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

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-200 bg-gradient-to-r from-violet-50 to-indigo-50">
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
              style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' }}
            >
              <Sparkles size={20} className="text-white" strokeWidth={2} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">KI-Anschreiben</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {potential?.titel} · {kunde?.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/70 transition-colors"
          >
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {phase === 'generating' && (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
                  <Sparkles size={26} className="text-violet-600 animate-pulse" />
                </div>
                <Loader2 size={14} className="absolute -bottom-1 -right-1 text-violet-600 animate-spin" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">KI formuliert Ihr Anschreiben …</p>
                <p className="text-xs text-slate-500 mt-1">
                  Werte Herleitung, Produktangebot und bisherige Kommunikation aus.
                </p>
              </div>
            </div>
          )}

          {phase === 'sending' && (
            <div className="relative flex items-center justify-center py-16 min-h-[260px] overflow-hidden">
              {/* Brief faltet sich zusammen */}
              <div className="kia-letter-fold w-64 h-44 rounded-lg border border-slate-200 bg-white shadow-md p-4 text-[10px] leading-snug text-slate-400 overflow-hidden">
                <div className="font-semibold text-slate-500 mb-1.5">{subject}</div>
                <div className="space-y-0.5">
                  <div className="h-1.5 bg-slate-100 rounded w-3/4" />
                  <div className="h-1.5 bg-slate-100 rounded w-full" />
                  <div className="h-1.5 bg-slate-100 rounded w-5/6" />
                  <div className="h-1.5 bg-slate-100 rounded w-2/3" />
                  <div className="h-1.5 bg-slate-100 rounded w-4/5" />
                  <div className="h-1.5 bg-slate-100 rounded w-3/4" />
                </div>
              </div>
              {/* Umschlag fliegt nach oben rechts */}
              <div className="kia-envelope-fly">
                <svg viewBox="0 0 96 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
                  <rect x="2" y="6" width="92" height="54" rx="4" fill="#ffffff" stroke="#6366f1" strokeWidth="2" />
                  <path d="M2 8 L48 38 L94 8" stroke="#6366f1" strokeWidth="2" fill="none" />
                  <path d="M2 60 L36 32 M94 60 L60 32" stroke="#a5b4fc" strokeWidth="1.5" fill="none" />
                </svg>
              </div>
              <div className="kia-envelope-swoosh" />
              <p className="absolute bottom-4 text-xs text-indigo-600 font-medium">Anschreiben wird verpackt und versendet …</p>
            </div>
          )}

          {(phase === 'ready' || phase === 'sent') && (
            <>
              {/* Signal-Rationale */}
              <div className="rounded-xl border border-indigo-100 bg-gradient-to-r from-violet-50 to-indigo-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={14} className="text-indigo-500" />
                  <span className="text-xs font-semibold text-indigo-600">
                    KI-Begründung des Anschreibens
                  </span>
                </div>
                <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
                  {draft.rationale.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>

              {/* Empfänger / Betreff */}
              <div className="grid grid-cols-[80px,1fr] gap-y-2 gap-x-3 text-sm">
                <span className="text-slate-400 pt-2">An</span>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 bg-slate-50">
                  <Mail size={14} className="text-slate-400" />
                  <span className="text-slate-700">{draft.recipient}</span>
                </div>
                <span className="text-slate-400 pt-2">Betreff</span>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={phase === 'sending' || phase === 'sent'}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-200 disabled:bg-slate-50"
                />
              </div>

              {/* Textkörper */}
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={phase === 'sending' || phase === 'sent'}
                rows={14}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 leading-relaxed font-mono focus:outline-none focus:ring-2 focus:ring-violet-200 disabled:bg-slate-50"
              />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {phase === 'sent' ? (
              <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                <Check size={14} /> Anschreiben versendet
              </span>
            ) : phase === 'ready' ? (
              'Text wurde generiert – du kannst ihn vor dem Versand noch anpassen.'
            ) : phase === 'sending' ? (
              'Versende …'
            ) : (
              'Generiere Anschreiben mit KI …'
            )}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {phase === 'sent' ? 'Schließen' : 'Abbrechen'}
            </button>
            {phase !== 'sent' && (
              <button
                onClick={handleSend}
                disabled={phase !== 'ready'}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' }}
              >
                {phase === 'sending' ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Versende …
                  </>
                ) : (
                  <>
                    <Send size={14} /> Jetzt versenden
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Demo-Draft-Generator ────────────────────────────────────────
function buildDraft(kunde, p, beraterSig) {
  const nachname = (kunde?.name || 'Kunde').split(' ').slice(-1)[0];
  const anrede = kunde?.anrede || 'Sehr geehrter Herr';
  const recipient = `${kunde?.name || ''} <${slug(kunde?.name || 'kunde')}@mail-demo.de>`;
  const sigLine1 = beraterSig?.line1 || 'Ihre Beraterin';
  const sigLine2 = beraterSig?.line2 || '';
  const signatur = `Herzliche Grüße\n${sigLine1}${sigLine2 ? '\n' + sigLine2 : ''}`;
  const institut = sigLine2 || 'Ihre Bank';
  const partner = (function () {
    // Lazy import vermeiden — wir mappen die häufigsten Fälle direkt.
    const map = { 'Volksbank Mittelhessen': 'R+V', 'Sparkasse': 'Provinzial', 'Commerzbank': 'AMB', 'Deutsche Bank': 'Zurich', 'ING': 'NN', 'Zukunftsbank': 'Zukunftsversicherung' };
    return map[institut] || 'unserem Versicherungspartner';
  })();

  // Potenzial-spezifische Bausteine.
  const titel = p?.titel || 'Beratungsgespräch';
  const quellen = (p?.herleitung || []).slice(0, 3).map(h => `• ${h.label}: ${h.value}`).join('\n');

  // Story-spezifische Variante für das Flagship-Lead (Immobilienfinanzierung).
  const istImmo = /immobilienfinanzierung|kreditgespr/i.test(titel);
  const istVersicherung = /versicherung|haftpflicht/i.test(titel);

  let body, subject, rationale;

  if (istImmo) {
    subject = 'Ihre Immobilienpläne – gemeinsam den nächsten Schritt gehen';
    rationale = [
      'Auslaufender KfW-Kredit schafft in 2 Monaten 840 €/Mon. freie Liquidität (PSD2).',
      'Schwäbisch-Hall-Bausparvertrag (30.000 €) wird im Q2/2026 zuteilungsreif (Bestandsdaten).',
      'Seit 24 Monaten Abonnent des Newsletters „VR-Immobilien" – zuletzt zwei Artikel zum KfW-Wohneigentumsprogramm angeklickt.',
    ];
    body =
`${anrede} ${nachname},

in den letzten Wochen haben wir bei Ihnen drei Signale gesehen, die sehr gut zusammenpassen:

• Ihr KfW-Kredit läuft planmäßig in wenigen Wochen aus – danach haben Sie rund 840 € zusätzliche Liquidität pro Monat zur Verfügung.
• Ihr Bausparvertrag bei Schwäbisch Hall wird im zweiten Quartal 2026 zuteilungsreif – rund 30.000 € stehen dann als Eigenkapital bzw. Sondertilgung bereit.
• Außerdem sind Sie seit 2 Jahren Abonnent unseres Newsletters „VR-Immobilien & Finanzieren" und haben zuletzt mehrfach Artikel rund um Bausparen und KfW-Förderprogramme gelesen.

Das ist für uns ein klares Zeichen, dass Sie sich aktiv mit dem Thema Immobilienkauf oder Modernisierung auseinandersetzen. Genau dafür würde ich mir gerne 30 Minuten Zeit nehmen und Ihnen in einem persönlichen Gespräch zeigen, wie eine Finanzierung über ${institut} strukturiert sein könnte – mit den konkreten Zahlen auf Ihre Situation zugeschnitten.

Passt Ihnen ein Termin nächste Woche vormittags in unserer Filiale oder möchten Sie lieber per Video sprechen?

${signatur}`;
  } else if (istVersicherung) {
    subject = `Ihr Versicherungsschutz – konkrete Einsparmöglichkeiten für Sie`;
    rationale = [
      `Open Finance zeigt höhere Prämien bei Fremdanbieter als bei ${partner}.`,
      'Mehrere Verträge bei verschiedenen Anbietern – Bündelung spart Prämie.',
      'Einzelne Absicherungslücken identifiziert (keine RLV / Unfall).',
    ];
    body =
`${anrede} ${nachname},

über Ihre Open-Finance-Einwilligung haben wir Ihre aktuellen Versicherungsverträge analysiert und einige Optimierungspotenziale entdeckt:

• Ihre KFZ-Vollkasko bei der HUK kostet aktuell 780 € / Jahr – bei ${partner} wäre derselbe Schutz für rund 620 € / Jahr möglich.
• Die Haftpflicht läuft separat bei einem anderen Anbieter – im ${partner}-Bündel wäre sie bereits enthalten.
• Außerdem möchte ich mit Ihnen einige offene Absicherungsthemen ansprechen, die im Hinblick auf Ihre Familie sinnvoll wären.

Gerne zeige ich Ihnen in einem kurzen Gespräch die konkreten Zahlen und wir finden gemeinsam das Paket, das für Sie am besten passt. Passt Ihnen nächste Woche ein Termin?

${signatur}`;
  } else {
    subject = `${titel} – Vorschlag für ein kurzes Gespräch`;
    rationale = [
      `Potenzial aus Ihrem Lead-Board: ${titel}.`,
      'KI hat unabhängige Signale in den Kontoumsätzen und im Bestand erkannt.',
      'Empfohlener nächster Schritt: persönliches Gespräch.',
    ];
    body =
`${anrede} ${nachname},

in unserer aktuellen Analyse Ihrer Finanzsituation ist uns ein Thema aufgefallen, zu dem ich Ihnen gerne ein paar Informationen geben möchte:

${p?.beschreibung || titel}

${quellen ? `Unsere Einschätzung stützt sich dabei unter anderem auf:\n${quellen}\n` : ''}
Gerne möchte ich Ihnen in einem kurzen persönlichen Gespräch zeigen, welche konkreten Vorteile sich daraus für Sie ergeben.

Hätten Sie diese oder nächste Woche einen passenden Termin?

${signatur}`;
  }

  return { body, subject, recipient, rationale };
}

function slug(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '');
}
