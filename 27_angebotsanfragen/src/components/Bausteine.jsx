/** Kleine Bausteine, die mehrere Seiten verwenden. */

import { clsx } from 'clsx'
import { ERGEBNIS } from '../utils/ergebnis'
import { layoutVon } from '../utils/layouts'

export function Kennzahl({ Icon, wert, label, ton = 'neutral' }) {
  const toene = { neutral: 'text-slate-800', gruen: 'text-emerald-600', gelb: 'text-amber-600', grau: 'text-slate-500' }
  return (
    <div className="card-base px-4 py-3.5 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
        <Icon size={18} className="text-slate-500" strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <div className={clsx('text-xl font-semibold leading-tight', toene[ton] || toene.neutral)}>{wert}</div>
        <div className="text-xs text-slate-500 leading-snug">{label}</div>
      </div>
    </div>
  )
}

export function ErgebnisBadge({ art, className = '' }) {
  const e = ERGEBNIS[art]
  return (
    <span className={clsx('text-xs px-2.5 py-1 rounded-full border inline-flex items-center gap-1.5 whitespace-nowrap', e.badge, className)}>
      <e.Icon size={12} /> {e.titel}
    </span>
  )
}

export function LayoutChip({ vorgang }) {
  const layout = layoutVon(vorgang)
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 whitespace-nowrap">
      {layout.id === 'sonstig' ? vorgang.vorgangsart : layout.kurz}
    </span>
  )
}

/**
 * Die Nummer einer Beispielanfrage aus dem Fachbereich. Dieselbe Kachel steht
 * überall, wo sich ein Beispiel direkt aufrufen lässt: im Kopf, auf der
 * Übersicht, in Listen und in der Präsentation.
 */
export function BeispielNummer({ nr, gross = false, className = '' }) {
  return (
    <span
      className={clsx('inline-flex items-center justify-center font-semibold text-white shrink-0 leading-none',
        gross ? 'w-11 h-11 rounded-xl text-xl' : 'w-5 h-5 rounded-md text-2xs', className)}
      style={{ backgroundColor: 'var(--mode-primary)' }}
    >
      {nr}
    </span>
  )
}

export function HerkunftChip({ vorgang }) {
  if (vorgang.live) {
    return <span className="text-2xs px-2 py-0.5 rounded-full bg-violet-50 border border-violet-200 text-violet-700 whitespace-nowrap">live gelesen</span>
  }
  return vorgang.beispiel
    ? (
      <span className="beispiel-marke text-xs font-semibold pl-0.5 pr-2.5 py-0.5 rounded-lg inline-flex items-center gap-1.5 whitespace-nowrap"
        title="Beispielanfrage aus dem Fachbereich">
        <BeispielNummer nr={vorgang.beispiel} /> Beispiel {vorgang.beispiel}
      </span>
    )
    : <span className="text-2xs px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-500 whitespace-nowrap">synthetisch</span>
}

export function auszug(text, laenge = 130) {
  const eins = (text || '').replace(/\s+/g, ' ').trim()
  return eins.length > laenge ? eins.slice(0, laenge).replace(/\s\S*$/, '') + ' …' : eins
}
