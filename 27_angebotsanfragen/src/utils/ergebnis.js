/**
 * Die drei Ausgänge der Angebotsstrecke, mit Wortlaut, Icon und Farben.
 * Eine Quelle, damit Listen, Deckblatt, Prüfansicht und Präsentation
 * dieselben Begriffe und dieselben Farben verwenden.
 */

import { CheckCircle2, MailQuestion, UserSearch, Check, AlertTriangle, Info, Minus, Database } from 'lucide-react'

export const ERGEBNIS = {
  bereit: {
    titel: 'Erfassungsbereit', kurz: 'Grün', Icon: CheckCircle2,
    beschreibung: 'Alle Pflichtangaben liegen vor, das Deckblatt geht zur Erfassung',
    ton: 'text-emerald-600', text: 'text-emerald-700', dunkel: 'text-emerald-900',
    bg: 'bg-emerald-50', rand: 'border-emerald-200', balken: 'bg-emerald-500', punkt: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  rueckfrage: {
    titel: 'Rückfrage vorbereitet', kurz: 'Gelb', Icon: MailQuestion,
    beschreibung: 'Angaben fehlen, die Rückfrage an den Vermittler ist vorformuliert',
    ton: 'text-amber-600', text: 'text-amber-700', dunkel: 'text-amber-900',
    bg: 'bg-amber-50', rand: 'border-amber-200', balken: 'bg-amber-500', punkt: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  sonderfall: {
    titel: 'Sonderfall', kurz: 'Grau', Icon: UserSearch,
    beschreibung: 'Bleibt bewusst beim Menschen: Fachspezialisten oder anderer Bearbeitungsweg',
    ton: 'text-slate-600', text: 'text-slate-700', dunkel: 'text-slate-900',
    bg: 'bg-slate-100', rand: 'border-slate-300', balken: 'bg-slate-400', punkt: 'bg-slate-500',
    badge: 'bg-slate-100 text-slate-700 border-slate-300'
  }
}

export const ERGEBNIS_FOLGE = ['bereit', 'rueckfrage', 'sonderfall']

/** Status einer einzelnen Prüfung. */
export const PRUEF_STATUS = {
  ok: { Icon: Check, ton: 'text-emerald-600', bg: 'bg-emerald-50', rand: 'border-emerald-200', label: 'vorhanden' },
  fehlt: { Icon: MailQuestion, ton: 'text-amber-600', bg: 'bg-amber-50', rand: 'border-amber-200', label: 'Rückfrage' },
  hinweis: { Icon: Info, ton: 'text-sky-600', bg: 'bg-sky-50', rand: 'border-sky-200', label: 'Hinweis' },
  recherche: { Icon: Database, ton: 'text-indigo-600', bg: 'bg-indigo-50', rand: 'border-indigo-200', label: 'Recherche im Bestand' },
  sonderfall: { Icon: AlertTriangle, ton: 'text-slate-700', bg: 'bg-slate-100', rand: 'border-slate-300', label: 'Sonderfall' },
  neutral: { Icon: Minus, ton: 'text-slate-400', bg: 'bg-slate-50', rand: 'border-slate-200', label: 'nicht einschlägig' },
  uebersprungen: { Icon: Minus, ton: 'text-slate-300', bg: 'bg-slate-50/60', rand: 'border-slate-100', label: 'nicht mehr ausgeführt' }
}
