/**
 * Die sechs Prozessschritte der Prüfstrecke, groß und anklickbar. Der
 * Knopf startet den Präsentationsmodus von vorn, jede Kachel ab ihrem
 * Schritt.
 */

import { Presentation, ArrowRight, ChevronRight } from 'lucide-react'
import { PROZESS } from '../utils/prozess'

export default function ProzessUebersicht({ aufAbspielen }) {
  return (
    <div className="card-base p-6">
      <div className="flex flex-wrap items-start gap-5">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-semibold text-slate-900">Prüfstrecke Bestandsübertragung</h2>
          <p className="mt-2 text-base text-slate-600 max-w-4xl leading-relaxed">
            Vom unstrukturierten Maklerschreiben zur Dunkelverarbeitung in sechs Schritten. Die Präsentation
            führt die Strecke an einem Eingang vor: eine Mail trifft ein, die KI strukturiert sie, der
            Prüfkatalog läuft, der Vorgang ist erledigt. Und zum Schluss dasselbe für das ganze Postfach.
          </p>
        </div>
        <button
          onClick={() => aufAbspielen(0)}
          className="px-6 py-3.5 rounded-xl text-lg font-medium text-white flex items-center gap-3 shadow-md hover:shadow-lg transition-shadow shrink-0"
          style={{ background: 'var(--mode-gradient)' }}
        >
          <span className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Presentation size={20} strokeWidth={1.75} />
          </span>
          Präsentation starten
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {PROZESS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => aufAbspielen(i)}
            className="prozess-kachel group relative text-left rounded-2xl border-2 border-slate-200 bg-white p-5 hover:shadow-md transition-all flex flex-col min-h-[240px]"
          >
            <span className="flex items-center justify-between">
              <span className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--mode-pastel)', color: 'var(--mode-primary-light)' }}>
                <s.Icon size={24} strokeWidth={1.75} />
              </span>
              <span className="text-3xl font-semibold text-slate-200 group-hover:text-slate-300 font-mono leading-none">
                {String(s.nr).padStart(2, '0')}
              </span>
            </span>
            <span className="mt-4 block text-lg font-semibold text-slate-900 leading-tight">{s.titel}</span>
            <span className="mt-1.5 block text-sm text-slate-600 leading-relaxed">{s.kurz}</span>
            <span className="mt-auto pt-4 flex items-center gap-1.5 text-xs whitespace-nowrap text-slate-400 group-hover:text-slate-700 transition-colors">
              <ArrowRight size={13} /> Ab hier starten
            </span>
            {i < PROZESS.length - 1 && (
              <ChevronRight size={18} className="hidden xl:block absolute -right-[19px] top-1/2 -translate-y-1/2 text-slate-300 z-10" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
