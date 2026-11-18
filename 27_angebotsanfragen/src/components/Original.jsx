/**
 * Der Eingang im Original samt Fundstellen.
 *
 * Oben steht, wie der Eingang im Postfach liegt (Absender, Betreff,
 * Anhänge). Darunter die Dokumente als Nachbau; hat der Eingang mehrere
 * (Mail und Anhang), wechselt man über die Reiter. Wird im Deckblatt ein Feld
 * angeklickt, springt die Ansicht zur ersten Fundstelle – auch über den
 * Reiter hinweg.
 */

import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import { Mail, Paperclip, FileText, Highlighter, ScanLine, ExternalLink } from 'lucide-react'
import Dokument from './Dokument'
import Legende from './Legende'
import { rolleZu, findeMarke } from '../utils/rollen'

export default function Original({ vorgang, verknuepfung, aktiv, sprung, onFeld, kopf = true }) {
  const [dokNr, setDokNr] = useState(0)
  const [marken, setMarken] = useState(true)
  // Bei einem hochgeladenen PDF lässt sich neben der Abschrift die Datei selbst ansehen.
  const rahmen = useRef(null)
  const { info, fundstellen } = verknuepfung
  const dokumente = vorgang.dokumente


  // Sprung zu einem Feld: erst den Reiter mit der ersten Fundstelle öffnen, dann hinrollen.
  useEffect(() => {
    if (!sprung?.key) return
    const erste = fundstellen[sprung.key]?.[0]
    if (!erste) return
    if (erste.dokNr !== dokNr) setDokNr(erste.dokNr)
    const t = setTimeout(() => rolleZu(findeMarke(rahmen.current, sprung.key)), erste.dokNr !== dokNr ? 80 : 0)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sprung])

  const dok = dokumente[dokNr] || dokumente[0]
  const { mail } = vorgang
  const anzahlMarken = Object.values(fundstellen).reduce((n, liste) => n + liste.length, 0)

  return (
    <div ref={rahmen} className="space-y-3">
      {kopf && (
        <div className="rounded-lg border border-slate-200 bg-white px-3.5 py-3">
          <div className="flex items-center gap-2 text-2xs uppercase tracking-wide text-slate-400">
            <Mail size={12} /> So liegt der Eingang im Postfach
          </div>
          <div className="mt-1.5 text-sm font-medium text-slate-800 leading-snug">{mail.betreff}</div>
          <div className="mt-1 text-xs text-slate-500">
            {mail.vonName} · an {mail.an} · {vorgang.eingang}, {vorgang.uhrzeit} Uhr
          </div>
          {mail.anhaenge.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {mail.anhaenge.map(a => (
                <span key={a.name} className="inline-flex items-center gap-1.5 text-2xs px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-600" title={a.info}>
                  <Paperclip size={11} className="text-slate-400" /> {a.name}
                  <span className="text-slate-400">· {a.typ}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {dokumente.length > 1 && dokumente.map((d, i) => (
          <button key={d.id} onClick={() => setDokNr(i)}
            className={clsx('px-2.5 py-1.5 rounded-lg text-xs border flex items-center gap-1.5 transition-colors',
              i === dokNr ? 'text-white border-transparent' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50')}
            style={i === dokNr ? { backgroundColor: 'var(--mode-primary-light)' } : undefined}>
            {i === 0 ? <Mail size={12} /> : <Paperclip size={12} />} {d.titel}
          </button>
        ))}
        {/* Das hochgeladene PDF öffnet in einem eigenen Tab: Die Sicherheitsregeln der
            Plattform lassen eingebettete Dateien aus dem Browserspeicher nicht zu. */}
        {vorgang.pdfUrl && (
          <a href={vorgang.pdfUrl} target="_blank" rel="noopener noreferrer"
            className="px-2.5 py-1.5 rounded-lg text-xs border bg-white border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 transition-colors">
            <FileText size={12} /> Hochgeladenes PDF öffnen <ExternalLink size={11} className="text-slate-400" />
          </a>
        )}
        <span className="text-xs text-slate-500 flex items-center gap-1.5">
          {dok.scan ? <ScanLine size={13} className="text-slate-400" /> : <FileText size={13} className="text-slate-400" />}
          {dok.art}
        </span>
        <button onClick={() => setMarken(m => !m)}
          className={clsx('ml-auto px-2.5 py-1.5 rounded-lg text-xs border flex items-center gap-1.5 transition-colors',
            marken ? 'border-slate-300 bg-slate-100 text-slate-700' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50')}
          title="Fundstellen der KI ein- oder ausblenden">
          <Highlighter size={12} /> {marken ? `${anzahlMarken} Fundstellen` : 'Fundstellen aus'}
        </button>
      </div>

      {marken && <Legende />}
      <Dokument dok={dok} info={info} onFeld={marken ? onFeld : undefined} markierung={{ an: marken, aktiv }} />
    </div>
  )
}
