// ─────────────────────────────────────────────────────────────────────────────
// Review-Panel: Kommentare des Teams zur gerade gezeigten Station.
//
// Drei Bereiche (Hypothese, Ideen zur Szene, Fehler in Bild/Video). Jede Notiz
// gehoert einer Person, laesst sich aendern, loeschen und als bestaetigt
// markieren. Der Stand liegt geteilt auf dem Server; ohne KV-Bindung sagt die
// Kopfzeile offen, dass er nur lokal liegt.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { Check, History, Pencil, Plus, Trash2, Users, X } from 'lucide-react'
import styles from './OperationsTag.module.css'
import {
  FELDER,
  FELDER_PERSONA,
  bereicheFuer,
  autorSchreiben,
  textSchluessel,
  zeitText,
  type ReviewBereich,
  type ReviewNotiz,
  type TextFassung,
} from './review'

type Props = {
  stationId: string
  zeit: string
  autor: string
  setzeAutor: (n: string) => void
  notizen: ReviewNotiz[]
  /** Auftakt: dort stellen die Texte eine Person vor, keine These. */
  persona: boolean
  texte: Record<string, TextFassung[]>
  /** Originaltexte der Station: Hypothese und die Belege. */
  original: Record<string, string>
  /**
   * Bearbeitbare Felder dieser Station. Ohne Angabe die feste Liste der
   * aelteren Fassungen; v08 gibt hier die Marken durch, die auf der Buehne
   * wirklich stehen — mal eine, mal vier.
   */
  felder?: { id: string; titel: string }[]
  geteilt: boolean
  anlegen: (station: string, bereich: ReviewBereich, text: string, autor: string) => void
  aendern: (id: string, text: string) => void
  loeschen: (id: string) => void
  bestaetigen: (id: string, an: boolean) => void
  textSetzen: (station: string, feld: string, text: string, autor: string, original: string) => void
  schliessen: () => void
}

export function ReviewPanel({
  stationId, zeit, autor, setzeAutor, notizen, persona, texte, original, felder, geteilt,
  anlegen, aendern, loeschen, bestaetigen, textSetzen, schliessen,
}: Props): React.ReactElement {
  const [entwurf, setEntwurf] = useState<Record<string, string>>({})
  const [bearbeitet, setBearbeitet] = useState<string | null>(null)
  const [bearbeitText, setBearbeitText] = useState('')
  const [nameEntwurf, setNameEntwurf] = useState('')
  // Textfelder: was gerade im Eingabefeld steht, und welcher Verlauf offen ist.
  const [textEntwurf, setTextEntwurf] = useState<Record<string, string>>({})
  const [verlaufOffen, setVerlaufOffen] = useState<string | null>(null)

  // Ohne Namen keine Notizen — sonst weiß niemand, von wem der Hinweis kommt.
  if (!autor) {
    return (
      <aside className={styles.review}>
        <header className={styles.reviewKopf}>
          <strong>Review</strong>
          <button type="button" className={styles.reviewX} onClick={schliessen} aria-label="Close">
            <X size={15} strokeWidth={2} aria-hidden />
          </button>
        </header>
        <form
          className={styles.reviewName}
          onSubmit={(e) => {
            e.preventDefault()
            const n = nameEntwurf.trim()
            if (!n) return
            autorSchreiben(n)
            setzeAutor(n)
          }}
        >
          <label htmlFor="reviewName">Your name (shown with every comment)</label>
          <input
            id="reviewName"
            value={nameEntwurf}
            onChange={(e) => setNameEntwurf(e.target.value)}
            placeholder="e.g. Eike Brenneisen"
            autoFocus
          />
          <button type="submit" className={styles.reviewPrimaer}>Start reviewing</button>
        </form>
      </aside>
    )
  }

  return (
    <aside className={styles.review}>
      <header className={styles.reviewKopf}>
        <strong>Review · {zeit}</strong>
        <span className={styles.reviewStand} data-geteilt={geteilt || undefined}>
          <Users size={13} strokeWidth={2} aria-hidden />
          {geteilt ? 'shared with the team' : 'this browser only'}
        </span>
        <button type="button" className={styles.reviewX} onClick={schliessen} aria-label="Close">
          <X size={15} strokeWidth={2} aria-hidden />
        </button>
      </header>

      <div className={styles.reviewKoerper}>
        <section className={styles.reviewBlock}>
          <h3>{persona ? 'Texts of the opening' : 'Texts of this station'}<span /></h3>
          <p className={styles.reviewHinweis}>
            Edit and save: every version is kept with its author and time.
          </p>
          {(felder ?? (persona ? FELDER_PERSONA : FELDER)).map((f) => {
            const k = textSchluessel(stationId, f.id)
            const fassungen = texte[k] ?? []
            const jetzt = fassungen.length
              ? fassungen[fassungen.length - 1].text
              : (original[f.id] ?? '')
            const entwurf = textEntwurf[k] ?? jetzt
            const geaendert = entwurf.trim() !== jetzt.trim()
            return (
              <div key={f.id} className={styles.reviewFeld}>
                <label htmlFor={`t-${k}`}>{f.titel}</label>
                <textarea
                  id={`t-${k}`}
                  value={entwurf}
                  onChange={(e) => setTextEntwurf((v) => ({ ...v, [k]: e.target.value }))}
                  rows={f.id === 'hypothese' ? 3 : 3}
                />
                <div className={styles.reviewZeile}>
                  <button
                    type="button"
                    className={styles.reviewPrimaer}
                    disabled={!geaendert}
                    onClick={() => {
                      textSetzen(stationId, f.id, entwurf, autor, original[f.id] ?? '')
                      setTextEntwurf((v) => {
                        const n = { ...v }
                        delete n[k]
                        return n
                      })
                    }}
                  >
                    Save
                  </button>
                  {fassungen.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setVerlaufOffen(verlaufOffen === k ? null : k)}
                    >
                      <History size={13} strokeWidth={2} aria-hidden />
                      {fassungen.length - 1} change{fassungen.length - 1 === 1 ? '' : 's'}
                    </button>
                  )}
                </div>
                {verlaufOffen === k && (
                  <ol className={styles.reviewVerlauf}>
                    {[...fassungen].reverse().map((v, n) => (
                      <li key={`${v.zeit}-${n}`}>
                        <span>
                          {v.autor}
                          {v.zeit > 0 ? ` · ${zeitText(v.zeit)}` : ''}
                        </span>
                        <p>{v.text}</p>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            )
          })}
        </section>

        {bereicheFuer(persona).map((b) => {
          const eigene = notizen.filter((n) => n.station === stationId && n.bereich === b.id)
          return (
            <section key={b.id} className={styles.reviewBlock}>
              <h3>
                {b.titel}
                <span>{eigene.length > 0 ? `${eigene.length}` : ''}</span>
              </h3>
              <p className={styles.reviewHinweis}>{b.hinweis}</p>

              <ul className={styles.reviewListe}>
                {eigene.map((n) => (
                  <li key={n.id} data-bestaetigt={n.bestaetigt || undefined}>
                    {bearbeitet === n.id ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          aendern(n.id, bearbeitText)
                          setBearbeitet(null)
                        }}
                      >
                        <textarea
                          value={bearbeitText}
                          onChange={(e) => setBearbeitText(e.target.value)}
                          rows={3}
                          autoFocus
                        />
                        <div className={styles.reviewZeile}>
                          <button type="submit" className={styles.reviewPrimaer}>Save</button>
                          <button type="button" onClick={() => setBearbeitet(null)}>Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <p>{n.text}</p>
                        <div className={styles.reviewMeta}>
                          <span>{n.autor} · {zeitText(n.zeit)}</span>
                          <button
                            type="button"
                            data-an={n.bestaetigt || undefined}
                            onClick={() => bestaetigen(n.id, !n.bestaetigt)}
                            title={n.bestaetigt ? 'Mark as open' : 'Mark as confirmed'}
                          >
                            <Check size={13} strokeWidth={2.4} aria-hidden />
                            {n.bestaetigt ? 'Confirmed' : 'Confirm'}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setBearbeitet(n.id); setBearbeitText(n.text) }}
                            title="Edit"
                          >
                            <Pencil size={13} strokeWidth={2} aria-hidden />
                          </button>
                          <button type="button" onClick={() => loeschen(n.id)} title="Delete">
                            <Trash2 size={13} strokeWidth={2} aria-hidden />
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>

              <form
                className={styles.reviewNeu}
                onSubmit={(e) => {
                  e.preventDefault()
                  anlegen(stationId, b.id, entwurf[b.id] ?? '', autor)
                  setEntwurf((v) => ({ ...v, [b.id]: '' }))
                }}
              >
                <textarea
                  value={entwurf[b.id] ?? ''}
                  onChange={(e) => setEntwurf((v) => ({ ...v, [b.id]: e.target.value }))}
                  placeholder={`Add a note: ${b.titel.toLowerCase()}`}
                  rows={2}
                />
                <button type="submit" className={styles.reviewPrimaer}>
                  <Plus size={14} strokeWidth={2.4} aria-hidden />
                  Add
                </button>
              </form>
            </section>
          )
        })}
      </div>
    </aside>
  )
}
