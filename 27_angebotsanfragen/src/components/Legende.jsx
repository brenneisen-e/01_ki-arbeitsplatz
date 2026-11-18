/** Farblegende der Fundstellen: wie die KI zu einem Wert gekommen ist. */
export default function Legende({ mitDeckblatt = false, className = '' }) {
  const proben = [
    ['probe-gelesen', 'wörtlich gelesen'],
    ['probe-interpretiert', 'interpretiert'],
    ['probe-auffaellig', 'Auffälligkeit']
  ]
  return (
    <div className={`flex flex-wrap items-center gap-x-3.5 gap-y-1 text-2xs text-slate-500 ${className}`}>
      {proben.map(([klasse, text]) => (
        <span key={text} className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <span className={`w-3 h-3 rounded-sm ${klasse}`} /> {text}
        </span>
      ))}
      {mitDeckblatt && (
        <>
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-3 h-3 rounded-sm bg-red-200" /> fehlt für das Angebot
          </span>
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-3 h-3 rounded-sm bg-sky-200" /> Recherche im Bestand
          </span>
        </>
      )}
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
        <span className="px-1 rounded-full text-[0.45rem] font-bold text-white leading-[0.7rem]" style={{ backgroundColor: 'var(--mode-primary)' }}>5</span>
        Abschnitt im Deckblatt
      </span>
    </div>
  )
}
