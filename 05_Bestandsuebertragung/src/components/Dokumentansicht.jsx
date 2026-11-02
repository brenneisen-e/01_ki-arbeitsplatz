/**
 * Ansicht eines Anhangs (Vollmacht, Untervollmacht, sonstige Dokumente).
 *
 * Die Ansicht bildet nach, was im Anhang steht – aufgebaut aus den Feldern des
 * Vorgangs. Fehlende Unterschriften, Blankovollmachten oder abweichende Namen
 * sind dadurch im Dokument selbst sichtbar und nicht nur im Prüfergebnis.
 */

import { ArrowLeft, AlertTriangle, FileText } from 'lucide-react'
import { baueDokument } from '../utils/dokumente'

function Unterschrift({ block }) {
  return (
    <div className="mt-6">
      <div className="text-[13px] text-slate-700">{block.ortDatum}</div>
      <div className="mt-5 h-11 flex items-end">
        {block.zustand === 'gezeichnet' && (
          <span className="font-signatur text-[26px] leading-none text-slate-700 -rotate-2 pl-3">{block.name}</span>
        )}
        {block.zustand === 'unleserlich' && (
          <span className="font-signatur text-[26px] leading-none text-slate-400 blur-[2.5px] opacity-70 -rotate-2 pl-3 select-none">
            {block.name}
          </span>
        )}
      </div>
      <div className="w-64 border-t border-slate-400" />
      <div className="mt-1 text-[11px] text-slate-500">
        Unterschrift {block.name || 'Vollmachtgeber'}
      </div>
      {block.zustand === 'leer' && (
        <div className="mt-1 text-[11px] text-red-600">Feld ist leer – keine Unterschrift vorhanden.</div>
      )}
      {block.zustand === 'unleserlich' && (
        <div className="mt-1 text-[11px] text-amber-600">Unterschriftsfeld im Scan nicht lesbar.</div>
      )}
    </div>
  )
}

export default function Dokumentansicht({ vorgang, anhang, onZurueck }) {
  const dok = baueDokument(vorgang, anhang)

  return (
    <div className="space-y-3">
      <button
        onClick={onZurueck}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft size={14} /> Zurück zum Eingang
      </button>

      {/* Kopf mit den Metadaten des Anhangs */}
      <div className="rounded-lg border border-slate-200 bg-white px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-slate-400 shrink-0" />
          <span className="text-xs font-medium text-slate-800 truncate">{dok.untertitel}</span>
        </div>
        <div className="mt-1.5 space-y-0.5">
          {dok.kopf.map(([label, wert]) => (
            <div key={label} className="text-[11px] text-slate-500">
              <span className="text-slate-400">{label}: </span>{wert || '–'}
            </div>
          ))}
        </div>
      </div>

      {/* Das Dokument selbst */}
      <div className="rounded-lg border border-slate-300 bg-white shadow-sm px-6 py-7">
        <h4 className="text-center text-sm font-semibold tracking-[0.18em] uppercase text-slate-900">{dok.titel}</h4>
        <div className="mt-5 space-y-3.5">
          {dok.bloecke.map((block, i) => {
            if (block.art === 'absatz') {
              return (
                <div key={i}>
                  <p className="text-[13px] leading-relaxed text-slate-700">{block.text}</p>
                  {block.warnung && (
                    <p className="mt-1 text-[11px] text-red-600 flex items-start gap-1.5">
                      <AlertTriangle size={11} className="mt-0.5 shrink-0" /> {block.warnung}
                    </p>
                  )}
                </div>
              )
            }
            if (block.art === 'partei') {
              return (
                <div key={i} className="pl-3 border-l-2 border-slate-200">
                  <div className="text-[11px] uppercase tracking-wide text-slate-400">{block.rolle}</div>
                  {block.zeilen.map((z, j) => (
                    <div key={j} className={`text-[13px] ${j === 0 ? 'font-medium text-slate-900' : 'text-slate-600'}`}>{z}</div>
                  ))}
                  {block.warnung && (
                    <p className="mt-1 text-[11px] text-red-600 flex items-start gap-1.5">
                      <AlertTriangle size={11} className="mt-0.5 shrink-0" /> {block.warnung}
                    </p>
                  )}
                </div>
              )
            }
            if (block.art === 'liste') {
              return (
                <ul key={i} className="space-y-1">
                  {block.punkte.map((p, j) => (
                    <li key={j} className="text-[13px] text-slate-700 flex gap-2">
                      <span className="text-slate-400">–</span><span>{p}</span>
                    </li>
                  ))}
                </ul>
              )
            }
            return <Unterschrift key={i} block={block} />
          })}
        </div>
      </div>

      {/* Was die Analyse aus dem Dokument gelesen hat */}
      {dok.maengel.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5">
          <div className="text-xs font-medium text-red-800 flex items-center gap-1.5">
            <AlertTriangle size={13} /> Im Dokument beanstandet
          </div>
          <ul className="mt-1 space-y-0.5">
            {dok.maengel.map((m, i) => (
              <li key={i} className="text-[11px] text-red-700">{m}</li>
            ))}
          </ul>
        </div>
      )}

      {dok.gelesen.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white px-3.5 py-2.5">
          <div className="text-[11px] uppercase tracking-wide text-slate-400">Aus diesem Dokument ins Deckblatt gelesen</div>
          <div className="mt-1.5 space-y-1">
            {dok.gelesen.map(([label, wert]) => (
              <div key={label} className="grid grid-cols-[minmax(0,55%)_minmax(0,45%)] gap-2 text-[11px] items-baseline">
                <span className="text-slate-500 leading-snug">{label}</span>
                <span className={`font-mono ${wert ? 'text-slate-700' : 'text-slate-300'}`}>{wert || 'leer'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
