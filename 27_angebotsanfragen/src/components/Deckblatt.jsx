/**
 * KI-Deckblatt zu einem Eingang.
 *
 * Aus dem unstrukturierten Eingang wird ein Blatt mit immer derselben
 * Gliederung: die acht Abschnitte der Sparte in der Reihenfolge, in der sie
 * im Angebotssystem erfasst werden, dazu Gesamteinschätzung und
 * Auffälligkeiten. Jede Zeile nennt ihre Quelle; ein Klick darauf springt im
 * Original zur Fundstelle.
 *
 * Die Marke steckt ausschließlich in den CSS-Variablen und in branding.js –
 * das Deckblatt kennt keinen Versicherernamen.
 */

import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import { FileSpreadsheet, HelpCircle, Sparkles, TextSearch, Database, MailQuestion, AlertTriangle, Info } from 'lucide-react'
import { abschnitteFuer, feld, layoutVon, VORGANGSFELDER, TREFFER } from '../utils/layouts'
import { statusJeFeld } from '../utils/pruefengine'
import { quelleKurz, quelleLang } from '../utils/markierung'
import { getMarke, begriffe } from '../utils/branding'
import { ERGEBNIS } from '../utils/ergebnis'
import { herkunft } from '../daten/vorgaenge'
import { rolleZu } from '../utils/rollen'
import LogoImg from './LogoImg'
import Legende from './Legende'

const CHIP = {
  gelesen: 'bg-yellow-100 text-yellow-900 border-yellow-300 hover:bg-yellow-200',
  interpretiert: 'bg-violet-100 text-violet-900 border-violet-300 hover:bg-violet-200',
  auffaellig: 'bg-orange-100 text-orange-900 border-orange-300 hover:bg-orange-200'
}

const WIRKUNG = {
  hinweis: { label: 'Hinweis', klasse: 'bg-sky-50 text-sky-700 border-sky-200', Icon: Info },
  rueckfrage: { label: 'Rückfrage', klasse: 'bg-amber-50 text-amber-800 border-amber-200', Icon: MailQuestion },
  sonderfall: { label: 'Sonderfall', klasse: 'bg-slate-100 text-slate-700 border-slate-300', Icon: AlertTriangle }
}

/** Chip mit der Quelle eines Wertes; Klick springt im Original zur Fundstelle. */
function Quelle({ feldKey, farbe, stellen, mehrere, onFeld }) {
  if (!stellen?.length) return null
  const seiten = [...new Set(stellen.map(s => quelleKurz(s, mehrere)))]
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onFeld?.(feldKey, 'klick') }}
      title={stellen.map(quelleLang).join('\n')}
      className={clsx('shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-3xs font-medium whitespace-nowrap transition-colors', CHIP[farbe] || CHIP.gelesen)}
    >
      <TextSearch size={10} strokeWidth={2.25} />
      {seiten[0]}{seiten.length > 1 && <span className="opacity-70">+{seiten.length - 1}</span>}
    </button>
  )
}

function Fundstellen({ stellen }) {
  if (!stellen?.length) return null
  return (
    <div className="mt-1 space-y-0.5">
      {stellen.slice(0, 4).map((s, i) => (
        <div key={i} className="text-2xs leading-snug text-slate-500">
          <span className="text-slate-400">{quelleLang(s)}: </span>
          <span className="text-slate-700">„{s.text.length > 90 ? s.text.slice(0, 88) + ' …' : s.text}“</span>
        </div>
      ))}
      {stellen.length > 4 && <div className="text-2xs text-slate-400">und {stellen.length - 4} weitere Fundstellen</div>}
    </div>
  )
}

function Zeile({ f, status, v, zeigtHilfe }) {
  const stellen = v.fundstellen[f.key]
  const aktiv = v.aktiv === f.key
  const fehlt = f.art === 'fehlt'
  const recherche = f.art === 'recherche'
  const leer = f.art === 'leer'
  const farbe = f.art === 'interpretiert' ? 'interpretiert' : fehlt ? 'auffaellig' : 'gelesen'

  return (
    <div
      data-zeile={f.key}
      onMouseEnter={() => v.onFeld?.(stellen ? f.key : null, 'hover')}
      onMouseLeave={() => v.onFeld?.(null, 'hover')}
      onClick={() => stellen && v.onFeld?.(f.key, 'klick')}
      className={clsx('border-l-[3px] pl-2.5 pr-2.5 py-1.5 transition-colors',
        stellen && 'cursor-pointer',
        aktiv ? 'border-l-(--mode-primary-light) bg-(--mode-pastel)'
          : fehlt ? 'border-l-red-400 bg-red-50/60'
          : recherche ? 'border-l-sky-400 bg-sky-50/60'
          : status === 'hinweis' ? 'border-l-sky-300'
          : 'border-l-transparent hover:bg-slate-50')}
    >
      <div className="grid grid-cols-[minmax(0,40%)_minmax(0,1fr)_auto] gap-2 items-baseline">
        <span className="text-xs text-slate-500 leading-snug">
          {f.label}
          {f.pflicht && <span className="text-slate-300" title="Pflichtangabe für das Angebot"> *</span>}
        </span>
        <span className={clsx('text-xs break-words leading-snug',
          fehlt ? 'text-red-700 font-medium' : recherche ? 'text-sky-800 font-medium' : leer ? 'text-slate-300' : 'text-slate-900 font-medium')}>
          {f.wert || (fehlt ? 'fehlt' : recherche ? 'im eigenen Haus nachschlagen' : 'nicht genannt')}
        </span>
        {stellen
          ? <Quelle feldKey={f.key} farbe={farbe} stellen={stellen} mehrere={v.mehrere} onFeld={v.onFeld} />
          : fehlt ? <span className="text-3xs px-1.5 py-0.5 rounded border border-red-200 bg-white text-red-700 whitespace-nowrap">Rückfrage</span>
          : recherche ? <span className="text-3xs px-1.5 py-0.5 rounded border border-sky-200 bg-white text-sky-700 whitespace-nowrap inline-flex items-center gap-1"><Database size={10} /> Recherche</span>
          : null}
      </div>
      {f.herleitung && (
        <div className={clsx('mt-0.5 text-2xs leading-snug flex gap-1.5', f.art === 'interpretiert' ? 'text-violet-800' : fehlt ? 'text-red-700' : 'text-slate-500')}>
          {f.art === 'interpretiert' && <Sparkles size={11} className="shrink-0 mt-0.5" />}
          <span>{f.herleitung}</span>
        </div>
      )}
      {zeigtHilfe && f.hilfe && <div className="mt-0.5 text-2xs leading-snug text-slate-400">{f.hilfe}</div>}
      {v.fest === f.key && <Fundstellen stellen={stellen} />}
    </div>
  )
}

function Abschnittskopf({ nr, titel, hinweis }) {
  return (
    <div className="px-3 py-1.5 text-xs font-semibold text-white flex items-baseline gap-2" style={{ backgroundColor: 'var(--mode-primary)' }}>
      <span className="font-mono opacity-80">{nr})</span>
      <span>{titel}</span>
      {hinweis && <span className="font-normal text-2xs opacity-70 truncate">{hinweis}</span>}
    </div>
  )
}

function Betriebsarten({ vorgang, v }) {
  const liste = vorgang.betriebsarten || []
  if (liste.length === 0) {
    return <div className="px-3 py-2 text-xs text-slate-300">nicht genannt</div>
  }
  const toene = { gruen: 'bg-emerald-50 text-emerald-700 border-emerald-200', blau: 'bg-sky-50 text-sky-700 border-sky-200', rot: 'bg-red-50 text-red-700 border-red-200' }
  return (
    <div className="divide-y divide-slate-100">
      {liste.map(b => {
        const stellen = v.fundstellen[b.key]
        const aktiv = v.aktiv === b.key
        const t = TREFFER[b.treffer] || TREFFER.naechste
        return (
          <div key={b.key} data-zeile={b.key}
            onMouseEnter={() => v.onFeld?.(b.key, 'hover')}
            onMouseLeave={() => v.onFeld?.(null, 'hover')}
            onClick={() => v.onFeld?.(b.key, 'klick')}
            className={clsx('border-l-[3px] pl-2.5 pr-2.5 py-1.5 cursor-pointer transition-colors',
              aktiv ? 'border-l-(--mode-primary-light) bg-(--mode-pastel)' : b.treffer === 'offen' ? 'border-l-red-400 bg-red-50/60' : 'border-l-transparent hover:bg-slate-50')}>
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-medium text-slate-900 leading-snug min-w-0 flex-1">{b.bezeichnung}</span>
              {(b.anteil || liste.length > 1) && (
                <span className={clsx('text-xs shrink-0', b.anteil ? 'font-mono text-slate-800' : 'text-slate-300')}>{b.anteil || 'Anteil offen'}</span>
              )}
              <Quelle feldKey={b.key} farbe="interpretiert" stellen={stellen} mehrere={v.mehrere} onFeld={v.onFeld} />
            </div>
            <div className="mt-0.5 flex items-start gap-2">
              <span className={clsx('text-3xs px-1.5 py-0.5 rounded border whitespace-nowrap shrink-0', toene[t.ton])}>{t.label}</span>
              <span className="text-2xs leading-snug text-slate-500">{b.begruendung}</span>
            </div>
            {v.fest === b.key && <Fundstellen stellen={stellen} />}
          </div>
        )
      })}
      {vorgang.betriebsartNotiz && (
        <div className="px-3 py-1.5 text-2xs leading-snug text-violet-800 flex gap-1.5">
          <Sparkles size={11} className="shrink-0 mt-0.5" /> {vorgang.betriebsartNotiz}
        </div>
      )}
    </div>
  )
}

function Risikofragen({ vorgang, v }) {
  const liste = vorgang.risikofragen || []
  return (
    <div>
      <div className="px-3 pt-2 pb-1 text-2xs uppercase tracking-wide text-slate-400">Risikofragen</div>
      {liste.length === 0
        ? <div className="px-3 pb-2 text-xs text-slate-300">keine beantwortet</div>
        : (
          <div className="divide-y divide-slate-100">
            {liste.map(r => {
              const stellen = v.fundstellen[r.key]
              const aktiv = v.aktiv === r.key
              return (
                <div key={r.key} data-zeile={r.key}
                  onMouseEnter={() => v.onFeld?.(r.key, 'hover')}
                  onMouseLeave={() => v.onFeld?.(null, 'hover')}
                  onClick={() => v.onFeld?.(r.key, 'klick')}
                  className={clsx('border-l-[3px] pl-2.5 pr-2.5 py-1 cursor-pointer transition-colors',
                    aktiv ? 'border-l-(--mode-primary-light) bg-(--mode-pastel)' : 'border-l-transparent hover:bg-slate-50')}>
                  <div className="grid grid-cols-[minmax(0,55%)_minmax(0,1fr)_auto] gap-2 items-baseline">
                    <span className="text-2xs text-slate-500 leading-snug">{r.frage}</span>
                    <span className="text-2xs font-medium text-slate-900 leading-snug break-words">{r.antwort}</span>
                    <Quelle feldKey={r.key} farbe="gelesen" stellen={stellen} mehrere={v.mehrere} onFeld={v.onFeld} />
                  </div>
                  {v.fest === r.key && <Fundstellen stellen={stellen} />}
                </div>
              )
            })}
          </div>
        )}
    </div>
  )
}

function Kopfzelle({ label, wert, ton, punkt }) {
  return (
    <div className="px-2.5 py-2 bg-slate-50 min-w-0">
      <div className="text-3xs uppercase tracking-wide text-slate-400 truncate">{label}</div>
      <div className={clsx('text-xs font-medium truncate flex items-center gap-1.5', ton || 'text-slate-800')} title={wert}>
        {punkt && <span className={`w-2 h-2 rounded-full shrink-0 ${punkt}`} />}
        <span className="truncate">{wert}</span>
      </div>
    </div>
  )
}

export default function Deckblatt({ vorgang, lauf, verknuepfung, aktiv = null, fest = null, sprung = null, onFeld }) {
  const [zeigtHilfe, setZeigtHilfe] = useState(false)
  const rahmen = useRef(null)
  const marke = getMarke()
  const B = begriffe()
  const layout = layoutVon(vorgang)
  const abschnitte = abschnitteFuer(vorgang)
  const status = statusJeFeld(lauf)
  const e = ERGEBNIS[lauf.ergebnis.art]
  // aktiv: hervorgehobene Zeile (auch beim Überfahren). fest: angeklickte Zeile, nur sie klappt ihre
  // Fundstellen auf – beim bloßen Überfahren darf keine Zeile wachsen, sonst springt der Inhalt unter dem Zeiger weg.
  const v = { fundstellen: verknuepfung.fundstellen, aktiv, fest, onFeld, mehrere: vorgang.dokumente.length > 1 }
  const auff = vorgang.auffaelligkeiten || []

  // Klick auf eine Fundstelle im Original: die Zeile des Deckblatts ins Blickfeld holen.
  useEffect(() => {
    if (sprung?.quelle !== 'dokument' || !sprung.key || !rahmen.current) return
    rolleZu(rahmen.current.querySelector(`[data-zeile="${CSS.escape(sprung.key)}"]`))
  }, [sprung])

  return (
    <div ref={rahmen} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Kopf des Formulars */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-200">
        <p className="text-2xs italic text-slate-400 leading-snug">
          Dieses Deckblatt entsteht automatisch aus dem Eingang. Es ersetzt das Lesen und Strukturieren,
          nicht die Entscheidung: Erfasst und versendet wird erst nach Prüfung durch die Sachbearbeitung.
        </p>
        <div className="mt-2.5 flex items-center gap-3">
          <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-white text-2xs font-semibold"
            style={{ background: 'var(--mode-gradient)' }}>
            {marke.logo ? <LogoImg name={marke.logo} size={22} /> : marke.kuerzel}
          </span>
          <div className="min-w-0">
            <div className="text-base font-semibold text-slate-900 leading-tight">Angebotsanfrage – KI-Deckblatt</div>
            <div className="text-2xs text-slate-400">
              {layout.id === 'sonstig'
                ? 'Kerndaten für die Weitergabe, kein Angebotslayout'
                : `Layout ${layout.kurz} · Reihenfolge der Erfassung ${B.imSystem}`}
            </div>
          </div>
          <button
            onClick={() => setZeigtHilfe(o => !o)}
            className={clsx('ml-auto shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-2xs border transition-colors',
              zeigtHilfe ? 'border-slate-300 bg-slate-100 text-slate-700' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50')}
          >
            <HelpCircle size={13} /> Feldhilfe
          </button>
        </div>
      </div>

      {/* Vorgang auf einen Blick */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-slate-200 border-b border-slate-200">
        <Kopfzelle label="Lfd-Nr" wert={vorgang.id} />
        <Kopfzelle label="Status" wert={e.titel} ton={e.text} punkt={e.punkt} />
        <Kopfzelle label="Layout" wert={layout.id === 'sonstig' ? 'kein Angebotslayout' : `${layout.kurz} · ${layout.name}`} />
        <Kopfzelle label="Eingang" wert={`${vorgang.eingang}, ${vorgang.uhrzeit} Uhr`} />
        <Kopfzelle label="Kanal" wert={vorgang.kanal} />
        <Kopfzelle label="Herkunft" wert={`${herkunft(vorgang)} · ${vorgang.form}`} />
      </div>

      <div className="px-3 py-2 border-b border-slate-100">
        <Legende mitDeckblatt />
      </div>

      <div className="divide-y divide-slate-100">
        {VORGANGSFELDER.map(k => <Zeile key={k} f={feld(vorgang, k)} status={status[k]} v={v} zeigtHilfe={zeigtHilfe} />)}
      </div>

      {/* Abschnitte in der Reihenfolge der Vorgabe */}
      {abschnitte.map(a => (
        <div key={a.nr}>
          <Abschnittskopf nr={a.nr} titel={a.titel} hinweis={a.hinweis} />
          {a.typ === 'betriebsarten'
            ? <Betriebsarten vorgang={vorgang} v={v} />
            : (
              <>
                <div className="divide-y divide-slate-100">
                  {a.zeilen.map(f => <Zeile key={f.key} f={f} status={status[f.key]} v={v} zeigtHilfe={zeigtHilfe} />)}
                </div>
                {a.gruppen.map(g => (
                  <div key={g.titel}>
                    <div className="px-3 py-1 text-2xs font-semibold text-slate-700 bg-slate-100 border-y border-slate-200">{g.titel}</div>
                    <div className="divide-y divide-slate-100">
                      {g.zeilen.map(f => <Zeile key={f.key} f={f} status={status[f.key]} v={v} zeigtHilfe={zeigtHilfe} />)}
                    </div>
                  </div>
                ))}
                {a.risikofragen && <Risikofragen vorgang={vorgang} v={v} />}
              </>
            )}
        </div>
      ))}

      {/* Einschätzung, Auffälligkeiten, Ergebnis */}
      <div>
        <div className="px-3 py-1.5 text-xs font-semibold text-white flex items-center gap-2" style={{ backgroundColor: 'var(--mode-primary)' }}>
          <FileSpreadsheet size={13} /> Einschätzung der KI
        </div>
        <div className="px-3 py-2.5 space-y-3">
          <div>
            <div className="text-2xs uppercase tracking-wide text-slate-400">Fachliche Gesamteinschätzung</div>
            <p className="text-xs text-slate-700 leading-relaxed mt-0.5">{vorgang.gesamteinschaetzung}</p>
          </div>
          <div>
            <div className="text-2xs uppercase tracking-wide text-slate-400">Auffälligkeiten und mögliche Probleme</div>
            {auff.length === 0
              ? <p className="text-xs text-slate-300 mt-0.5">keine</p>
              : (
                <div className="mt-1 space-y-1.5">
                  {auff.map(a => {
                    const w = WIRKUNG[a.wirkung] || WIRKUNG.hinweis
                    const stellen = v.fundstellen[a.key]
                    const istAktiv = aktiv === a.key
                    return (
                      <div key={a.key} data-zeile={a.key}
                        onMouseEnter={() => onFeld?.(a.key, 'hover')}
                        onMouseLeave={() => onFeld?.(null, 'hover')}
                        onClick={() => onFeld?.(a.key, 'klick')}
                        className={clsx('rounded-lg border px-2.5 py-2 cursor-pointer transition-colors',
                          istAktiv ? 'border-(--mode-primary-light) bg-(--mode-pastel)' : 'border-slate-200 hover:bg-slate-50')}>
                        <div className="flex items-center gap-2">
                          <span className={clsx('text-3xs px-1.5 py-0.5 rounded border whitespace-nowrap inline-flex items-center gap-1', w.klasse)}>
                            <w.Icon size={10} /> {w.label}
                          </span>
                          <span className="text-xs font-medium text-slate-900 min-w-0 flex-1 leading-snug">{a.titel}</span>
                          <Quelle feldKey={a.key} farbe="auffaellig" stellen={stellen} mehrere={v.mehrere} onFeld={onFeld} />
                        </div>
                        <p className="mt-1 text-2xs leading-snug text-slate-600">{a.text}</p>
                        {fest === a.key && <Fundstellen stellen={stellen} />}
                      </div>
                    )
                  })}
                </div>
              )}
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <e.Icon size={14} className={`${e.text} shrink-0`} strokeWidth={2} />
            <span className={`text-xs font-medium ${e.text}`}>{lauf.ergebnis.titel}</span>
            <span className="text-2xs text-slate-400 ml-auto">{lauf.bestanden} von {lauf.geprueft} Prüfungen ohne Befund</span>
          </div>
        </div>
      </div>
    </div>
  )
}
