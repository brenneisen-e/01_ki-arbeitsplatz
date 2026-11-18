/**
 * Der Eingang im Original: Seiten eines Dokuments.
 *
 * Für die Beispielanfragen gibt es die Seiten des PDF als Bild (`seitenbilder`,
 * siehe utils/originalbild.js); die Fundstellen liegen dann als Leuchtstift
 * über dem Bild. Alle anderen Eingänge und die Abschrift entstehen als Nachbau
 * aus Blöcken, die Fundstellen stehen dort im Text.
 *
 * Jede Stelle, an der die KI einen Wert gelesen hat, ist im Text markiert
 * (gelb: wörtlich gelesen, violett: interpretiert, orange: Auffälligkeit).
 * Die kleine Ziffer hinter einer Markierung nennt den Abschnitt des
 * Deckblatts, in dem der Wert landet. Überfahren oder Anklicken einer
 * Markierung meldet das Feld nach oben; der Aufrufer koppelt damit das
 * Deckblatt.
 *
 * Steuerung über `markierung`:
 *   an        Markierungen überhaupt zeigen
 *   aktiv     Feld, das gerade hervorgehoben ist (Hover oder Klick)
 *   sichtbar  Set der Felder, deren Fundstellen schon zu sehen sind
 *             (Präsentationsmodus: die KI liest Feld für Feld); ohne Set alle
 *   laufend   Feld, das die KI gerade liest (pulsiert)
 *   stark     kräftige statt zarter Farbe
 *   ziffern   Abschnittsziffern zeigen
 */

import { createContext, useContext, useMemo, Fragment } from 'react'
import { clsx } from 'clsx'
import { Check, X, Mail, Phone, CalendarDays, ShieldCheck, Building2, Dot } from 'lucide-react'
import { zerlege } from '../utils/markierung'
import { SEITENFORMAT } from '../daten/originale'

const Kontext = createContext(null)

const SYMBOLE = { mail: Mail, telefon: Phone, kalender: CalendarDays, schild: ShieldCheck, gebaeude: Building2, punkt: Dot }

function Marke({ teil }) {
  const k = useContext(Kontext)
  const bekannt = teil.felder.filter(f => k.info[f])
  if (!k.an || bekannt.length === 0) return teil.text

  const sichtbare = k.sichtbar ? bekannt.filter(f => k.sichtbar.has(f)) : bekannt
  const laufend = k.laufend && bekannt.includes(k.laufend)
  const aktiv = !laufend && k.aktiv && sichtbare.includes(k.aktiv)
  const fuehrend = laufend ? k.laufend : aktiv ? k.aktiv : sichtbare[0]
  const an = sichtbare.length > 0 || laufend
  if (!an) return <mark className="fs" data-felder={bekannt.join(' ')}>{teil.text}</mark>

  const info = k.info[fuehrend]
  const bedienbar = Boolean(k.onFeld)
  return (
    <mark
      className={clsx('fs an', `art-${info.farbe}`, k.stark && 'stark', (aktiv || laufend) && 'aktiv')}
      data-felder={bekannt.join(' ')}
      title={info.titel}
      onMouseEnter={bedienbar ? () => k.onFeld(fuehrend, 'hover') : undefined}
      onMouseLeave={bedienbar ? () => k.onFeld(null, 'hover') : undefined}
      onClick={bedienbar ? (e) => { e.stopPropagation(); k.onFeld(fuehrend, 'klick') } : undefined}
    >
      {teil.text}
      {/* Wortverbinder davor: die Ziffer bricht nie allein in die nächste Zeile um */}
      {k.ziffern && info.nr !== '' && <>{'\u2060'}<sup className="fs-nr">{info.nr}</sup></>}
    </mark>
  )
}

/**
 * Fundstelle auf einer Originalseite: je Textzeile ein Rechteck über dem Bild.
 * Verhält sich wie `Marke`, nur dass der Text schon im Bild steht.
 */
function Bildmarke({ marke }) {
  const k = useContext(Kontext)
  const bekannt = marke.f.filter(f => k.info[f])
  if (!k.an || bekannt.length === 0 || marke.r.length === 0) return null

  const sichtbare = k.sichtbar ? bekannt.filter(f => k.sichtbar.has(f)) : bekannt
  const laufend = k.laufend && bekannt.includes(k.laufend)
  const aktiv = !laufend && k.aktiv && sichtbare.includes(k.aktiv)
  const fuehrend = laufend ? k.laufend : aktiv ? k.aktiv : sichtbare[0]
  const an = sichtbare.length > 0 || laufend
  const info = an ? k.info[fuehrend] : null
  const bedienbar = an && Boolean(k.onFeld)
  const letztes = marke.r[marke.r.length - 1]

  return (
    <>
      {marke.r.map((r, i) => (
        <mark
          key={i}
          className={clsx('fs bild', an && 'an', an && `art-${info.farbe}`, (aktiv || laufend) && 'aktiv')}
          data-felder={bekannt.join(' ')}
          title={an ? info.titel : undefined}
          style={{ left: `${r[0]}%`, top: `${r[1]}%`, width: `${r[2]}%`, height: `${r[3]}%` }}
          onMouseEnter={bedienbar ? () => k.onFeld(fuehrend, 'hover') : undefined}
          onMouseLeave={bedienbar ? () => k.onFeld(null, 'hover') : undefined}
          onClick={bedienbar ? (e) => { e.stopPropagation(); k.onFeld(fuehrend, 'klick') } : undefined}
        />
      ))}
      {/* Die Abschnittsziffer sitzt als eigenes Element an der letzten Zeile: Im Leuchtstift selbst
          würde sie mit dem Blatt verrechnet und verschwände. */}
      {an && k.ziffern && info.nr !== '' && (
        <span className="fs-nr bild" style={{ left: `${letztes[0] + letztes[2]}%`, top: `${letztes[1]}%` }}>{info.nr}</span>
      )}
    </>
  )
}

/** Text mit Fundstellen. */
function T({ text }) {
  const teile = useMemo(() => zerlege(text), [text])
  return teile.map((t, i) => t.felder
    ? <Marke key={i} teil={t} />
    : <Fragment key={i}>{t.text}</Fragment>)
}

function Kaestchen({ an }) {
  return (
    <span className="kaestchen" aria-hidden="true">
      [{an ? <Check size="0.8em" strokeWidth={3.5} style={{ display: 'inline', verticalAlign: '-0.08em' }} /> : ' '}]
    </span>
  )
}

function Optionen({ optionen, stil }) {
  if (stil === 'janein') {
    return (
      <span>
        {optionen.map((o, i) => (
          <span key={i} style={{ marginRight: '0.9em', whiteSpace: 'nowrap' }}>
            <T text={o.text} /> <Kaestchen an={o.x} />
          </span>
        ))}
      </span>
    )
  }
  if (stil === 'haken') {
    return (
      <ul className="dok-optionen haken">
        {optionen.map((o, i) => (
          <li key={i} className={o.x ? 'ja' : 'nein'}>
            {o.x ? <Check strokeWidth={2.25} /> : <X strokeWidth={2.25} />}
            <span><T text={o.text} /></span>
          </li>
        ))}
      </ul>
    )
  }
  return (
    <ul className="dok-optionen">
      {optionen.map((o, i) => (
        <li key={i}><Kaestchen an={o.x} /><span><T text={o.text} /></span></li>
      ))}
    </ul>
  )
}

function Tabelle({ block }) {
  return (
    <table className="dok-tabelle">
      {block.kopf && (
        <thead><tr>{block.kopf.map(k => <th key={k}>{k}</th>)}</tr></thead>
      )}
      <tbody>
        {block.zeilen.map((z, i) => {
          if (z.abschnitt) return <tr key={i} className="abschnitt"><td colSpan={2}><T text={z.abschnitt} /></td></tr>
          if (z.voll) return <tr key={i}><td colSpan={2} style={{ fontWeight: 700 }}><T text={z.voll} /></td></tr>
          return (
            <tr key={i}>
              <td><T text={z.l} /></td>
              <td style={{ whiteSpace: 'pre-wrap' }}>
                {z.optionen ? <Optionen optionen={z.optionen} stil={z.stil} /> : <T text={z.w} />}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function Block({ block }) {
  switch (block.t) {
    case 'p':
      return <p className={clsx('dok-p', block.stil)}><T text={block.text} /></p>
    case 'pt':
      // Live gelesener Eingang: der Text liegt schon in Stücken mit und ohne Fundstelle vor.
      return (
        <p className="dok-p">
          {block.teile.map((t, i) => t.felder ? <Marke key={i} teil={t} /> : <Fragment key={i}>{t.text}</Fragment>)}
        </p>
      )
    case 'titel':
      return <div className={clsx('dok-titel', block.stil)}><T text={block.text} /></div>
    case 'untertitel':
      return <div className="dok-untertitel"><T text={block.text} /></div>
    case 'h':
      return <div className="dok-h"><T text={block.text} /></div>
    case 'h2':
      return <div className="dok-h2"><T text={block.text} /></div>
    case 'kopf':
      return (
        <dl className={clsx('dok-kopf', block.stil)}>
          {block.zeilen.map(([l, w], i) => block.stil === 'inline'
            ? <div key={i}><dt>{l}</dt><dd><T text={w} /></dd></div>
            : <Fragment key={i}><dt>{l}</dt><dd style={{ whiteSpace: 'pre-wrap' }}><T text={w} /></dd></Fragment>)}
        </dl>
      )
    case 'linie':
      return <hr className={clsx('dok-linie', block.stark && 'stark')} />
    case 'abstand':
      return <div className="dok-abstand" />
    case 'seitenzahl':
      return <div className="dok-seitenzahl">{block.text}</div>
    case 'stempel':
      return <div className="dok-stempel">{block.text}</div>
    case 'unterschrift':
      return <div><span className="dok-unterschrift font-signatur">{block.name}</span></div>
    case 'fuss':
      return <div className="dok-fuss"><span><T text={block.links} /></span><span><T text={block.rechts} /></span></div>
    case 'logo':
      return <div className={clsx('dok-logo', block.stil)}><T text={block.text} /></div>
    case 'liste':
      return <ul className={clsx('dok-liste', block.stil)}>{block.punkte.map((punkt, i) => <li key={i}><T text={punkt} /></li>)}</ul>
    case 'kontakt':
      return (
        <ul className="dok-kontakt">
          {block.zeilen.map((z, i) => {
            const Symbol = SYMBOLE[z.icon] || Dot
            return <li key={i}><Symbol strokeWidth={1.75} /><span><T text={z.text} /></span></li>
          })}
        </ul>
      )
    case 'spalten':
      return (
        <div className="dok-spalten">
          {block.zellen.map((z, i) => {
            if (z.logo) return <div key={i} className="dok-logo gross">{z.logo}<small>{z.klein}</small></div>
            const Symbol = z.icon ? SYMBOLE[z.icon] : null
            return (
              <div key={i} className={clsx('dok-zelle', z.breit && 'breit')} style={{ fontSize: z.klein ? '0.82em' : undefined }}>
                {Symbol && <Symbol strokeWidth={1.75} />}
                <span><T text={z.text} /></span>
              </div>
            )
          })}
        </div>
      )
    case 'tabelle':
      return <Tabelle block={block} />
    default:
      return null
  }
}

export default function Dokument({ dok, info, markierung = {}, onFeld, seitenlabel = true, seitenbilder = null }) {
  const kontext = useMemo(() => ({
    info,
    an: markierung.an !== false,
    aktiv: markierung.aktiv || null,
    sichtbar: markierung.sichtbar || null,
    laufend: markierung.laufend || null,
    stark: Boolean(markierung.stark),
    ziffern: markierung.ziffern !== false,
    onFeld
  }), [info, markierung.an, markierung.aktiv, markierung.sichtbar, markierung.laufend, markierung.stark, markierung.ziffern, onFeld])

  const anzahl = dok.seiten.length

  if (seitenbilder) {
    return (
      <Kontext.Provider value={kontext}>
        <div className="space-y-4">
          {seitenbilder.map(seite => (
            <div key={seite.nr} data-seite={seite.nr}>
              {seitenlabel && (
                <div className="mb-1 flex items-center justify-between text-2xs text-slate-400">
                  <span>Seite {seite.nr} von {seitenbilder.length}</span>
                  {dok.scan && <span>Scan, per Texterkennung gelesen</span>}
                </div>
              )}
              <div className="dok-seite">
                <div className="dok-bildseite" style={{ aspectRatio: `${seite.breite || SEITENFORMAT.breite} / ${seite.hoehe || SEITENFORMAT.hoehe}` }}>
                  <img src={seite.url} alt={`Seite ${seite.nr} des Eingangs im Original`} decoding="async" draggable={false} />
                  {seite.marken.map((m, i) => <Bildmarke key={i} marke={m} />)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Kontext.Provider>
    )
  }

  return (
    <Kontext.Provider value={kontext}>
      <div className="space-y-4">
        {dok.seiten.map((bloecke, i) => (
          <div key={i} data-seite={i + 1}>
            {seitenlabel && (
              <div className="mb-1 flex items-center justify-between text-2xs text-slate-400">
                <span>Seite {i + 1} von {anzahl}</span>
                {dok.scan && <span>Scan, per Texterkennung gelesen</span>}
              </div>
            )}
            <div className={clsx('dok-seite', dok.scan && 'dok-scan')}>
              <div className={clsx('dok-blatt', `dok-${dok.stil}`)} style={bloecke.length <= 1 ? { minHeight: '20cqw' } : undefined}>
                {bloecke.map((block, j) => <Block key={j} block={block} />)}
                {bloecke.length <= 1 && <p className="dok-leer">Rest der Seite leer</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Kontext.Provider>
  )
}
