/**
 * Die Mail eines Eingangs, so wie sie angekommen ist: Kopfzeilen, Betreff,
 * Freitext und die Anhänge. Die Anhänge sind Schaltflächen – der Aufrufer
 * entscheidet, was beim Öffnen passiert (in der Regel die Dokumentansicht).
 */

import { Paperclip, ChevronRight } from 'lucide-react'

export default function MailAnsicht({ vorgang, aufAnhang }) {
  const { mail } = vorgang

  return (
    <div className="card-base p-3.5 bg-white">
      <div className="text-xs text-slate-500 space-y-0.5">
        <div><span className="text-slate-400">Von: </span>{mail.vonName} &lt;{mail.von}&gt;</div>
        <div><span className="text-slate-400">An: </span>{mail.an}</div>
        <div><span className="text-slate-400">Eingang: </span>{mail.datum}</div>
      </div>
      <div className="mt-2 pt-2 border-t border-slate-100 text-sm font-medium text-slate-800">
        {mail.betreff}
      </div>
      <pre className="mt-2 text-xs text-slate-600 whitespace-pre-wrap font-sans leading-relaxed">
        {mail.text}
      </pre>

      {mail.anhaenge.length > 0 ? (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
          <div className="text-[11px] uppercase tracking-wide text-slate-400">
            {mail.anhaenge.length} {mail.anhaenge.length > 1 ? 'Anhänge' : 'Anhang'} – zum Öffnen anklicken
          </div>
          {mail.anhaenge.map((a, i) => (
            <button
              key={i}
              onClick={() => aufAnhang(i)}
              className="w-full text-left flex items-start gap-2 rounded-lg border border-slate-200 px-2.5 py-2 hover:border-slate-300 hover:bg-slate-50 transition-colors group"
            >
              <Paperclip size={12} className="text-slate-400 mt-0.5 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block text-xs text-slate-700 truncate group-hover:underline">{a.name}</span>
                <span className="block text-[11px] text-slate-400">{a.info}</span>
              </span>
              <ChevronRight size={13} className="text-slate-300 mt-0.5 shrink-0" />
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-amber-600">
          <Paperclip size={12} /> Keine Anhänge
        </div>
      )}
    </div>
  )
}
