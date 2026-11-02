/**
 * Ein Beispiel-Eingang im Original: die Mail, wie sie im Postfach liegt, und
 * ihre Anhänge. Wer einen Anhang öffnet, sieht das Dokument an derselben
 * Stelle und kommt mit einem Klick zur Mail zurück.
 *
 * Bewusst ohne Deckblatt und Prüfungen – das ist der Blick vor der Analyse.
 * Ein Sprung in die vollständige Auswertung ist als Schaltfläche angeboten.
 */

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Mail, FileText, ListChecks } from 'lucide-react'
import MailAnsicht from './MailAnsicht'
import Dokumentansicht from './Dokumentansicht'

export default function EingangModal({ vorgang, onClose, aufPruefen }) {
  const [anhang, setAnhang] = useState(null)

  useEffect(() => { setAnhang(null) }, [vorgang])

  useEffect(() => {
    if (!vorgang) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [vorgang, onClose])

  if (!vorgang) return null

  const offenerAnhang = anhang === null ? null : vorgang.mail.anhaenge[anhang]

  // Als Portal, weil die Seite in einem animierten Container mit transform liegt.
  return createPortal((
    <div
      className="fixed inset-0 z-[1000] flex items-start justify-center bg-black/50 overflow-y-auto p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-xl shadow-2xl my-6 w-full max-w-3xl max-h-[92vh] flex flex-col animate-scale-in">
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
              {offenerAnhang ? <FileText size={13} /> : <Mail size={13} />}
              {offenerAnhang ? 'Anhang des Eingangs' : 'Eingang im Original'}
            </div>
            <div className="mt-0.5 flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg font-semibold text-slate-800">{vorgang.kunde}</h2>
              <span className="text-xs font-mono text-slate-400">{vorgang.id}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{vorgang.sparte}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors shrink-0">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto bg-slate-50/70 p-5">
          {offenerAnhang
            ? <Dokumentansicht vorgang={vorgang} anhang={offenerAnhang} onZurueck={() => setAnhang(null)} />
            : <MailAnsicht vorgang={vorgang} aufAnhang={setAnhang} />}
        </div>

        <div className="px-6 py-3 border-t border-slate-200 shrink-0 flex flex-wrap items-center gap-3">
          <p className="text-xs text-slate-500 flex-1 min-w-[240px]">
            So kommt der Vorgang an: Freitext, die Angaben verstreut, die Vollmacht nur im Anhang.
            Was die Analyse daraus macht, zeigt der letzte Schritt.
          </p>
          {aufPruefen && (
            <button
              onClick={() => aufPruefen(vorgang)}
              className="px-3 py-2 rounded-lg text-sm border border-slate-200 bg-white hover:bg-slate-50 flex items-center gap-1.5 text-slate-700"
            >
              <ListChecks size={14} /> Auswertung dieses Eingangs ansehen
            </button>
          )}
        </div>
      </div>
    </div>
  ), document.body)
}
