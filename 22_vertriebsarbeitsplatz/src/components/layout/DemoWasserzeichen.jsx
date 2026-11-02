import useTranslation from '../../i18n/useTranslation';

// Dieselbe Logo-Quelle wie die Landing Page (öffentlicher Publishable-Key von
// logo.dev, wie in den übrigen Apps des Repos); fällt auf das lokale Logo zurück.
const DELOITTE_LOGO = 'https://img.logo.dev/deloitte.com?token=pk_H7vb5Y2lTsW47U4Xq-w3HA&size=128&format=png';
const DELOITTE_LOGO_LOKAL = 'images/6364529b74a1f1454594542e_Monitor Deloitte Logo.png';

// Festes Wasserzeichen als Lasche mittig an der Oberkante, auf allen Ansichten
// einschließlich der Landing Page mit dem Chat: „Deloitte. Demo“ und darunter
// „Synthetische Daten“. Es bleibt beim Scrollen stehen, nimmt keine
// Zeigerereignisse an und liegt über dem Kopf, aber unter Modals. Die oberste
// Zeile des GlobalHeader hält mit pt-14 den Streifen darunter frei, damit die
// Lasche auch bei schmalen Fenstern keinen Knopf überdeckt.
export default function DemoWasserzeichen() {
  const { t } = useTranslation();
  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-1/2 -translate-x-1/2 z-[55] pointer-events-none select-none flex flex-col items-center rounded-b-xl px-4 pt-1.5 pb-2"
      style={{
        background: 'color-mix(in oklab, var(--bg-card) 82%, transparent)',
        border: '1px solid var(--border-light)',
        borderTop: 'none',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        boxShadow: 'var(--card-shadow)',
      }}
    >
      <span className="flex items-center gap-2 leading-none">
        {/* Dunkle Deloitte-Kachel („D.“) wie auf der Landing Page, gleiche Quelle
            und gleicher Rückfall auf das lokale Logo. */}
        <img
          src={DELOITTE_LOGO}
          alt="Deloitte"
          className="h-6 w-auto object-contain rounded-[5px]"
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = DELOITTE_LOGO_LOKAL; }}
        />
        <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-(--text-primary)">{t('wasserzeichenDemo')}</span>
      </span>
      <span className="mt-1.5 text-[10px] leading-none tracking-wide text-(--text-tertiary)">{t('wasserzeichenSynthetisch')}</span>
    </div>
  );
}
