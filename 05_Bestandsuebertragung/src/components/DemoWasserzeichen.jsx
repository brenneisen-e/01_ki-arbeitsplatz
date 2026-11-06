import DELOITTE_LOGO_LOKAL from '../assets/deloitte-logo.png'
// Festes Wasserzeichen als Lasche mittig an der Oberkante, wie im
// Vertriebsarbeitsplatz: „Deloitte. Demo“ und darunter „Synthetische Daten“.
// Es bleibt beim Scrollen stehen, nimmt keine Zeigerereignisse an und liegt
// über dem Kopf, aber unter Modals und dem Präsentationsmodus.

// Dieselbe Logo-Quelle wie Landing Page und Vertriebsarbeitsplatz; fällt auf
// das lokale Logo der Plattform zurück.
const DELOITTE_LOGO = 'https://img.logo.dev/deloitte.com?token=pk_H7vb5Y2lTsW47U4Xq-w3HA&size=128&format=png'

export default function DemoWasserzeichen() {
  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-1/2 -translate-x-1/2 z-[55] pointer-events-none select-none flex flex-col items-center rounded-b-xl px-4 pt-1.5 pb-2"
      style={{
        background: 'color-mix(in oklab, #ffffff 82%, transparent)',
        border: '1px solid #e2e8f0',
        borderTop: 'none',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.08)',
      }}
    >
      <span className="flex items-center gap-2 leading-none">
        <img
          src={DELOITTE_LOGO}
          alt="Deloitte"
          className="h-6 w-auto object-contain rounded-[5px]"
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = DELOITTE_LOGO_LOKAL }}
        />
        <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-slate-900">Demo</span>
      </span>
      <span className="mt-1.5 text-[10px] leading-none tracking-wide text-slate-500">Synthetische Daten</span>
    </div>
  )
}
