// ─────────────────────────────────────────────────────────────────────────────
// Review-Layer: Kommentare des Teams je Station.
//
// Drei Bereiche pro Uhrzeit — die Hypothese selbst, Ideen zur Szene, und
// Fehler in Bild oder Video. Jede Notiz traegt ihren Autor und kann als
// bestaetigt markiert werden.
//
// PERSISTENZ (zweistufig, wie beim Content-Editor):
//   1) sofort lokal (localStorage) — nichts geht verloren, auch offline.
//   2) geteilt ueber /api/review (Cloudflare KV) — damit das ganze Team
//      denselben Stand sieht. Fehlt die KV-Bindung, bleibt es beim lokalen
//      Stand; das Panel sagt das offen an, statt Teilen vorzutaeuschen.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from 'react'

const SPEICHER = 'ops2030:review'
const MODUS = 'ops2030:reviewmode'
const NAME = 'ops2030:reviewname'
const API = '/api/review'

export type ReviewBereich = 'hypothese' | 'szene' | 'fehler'

export type ReviewNotiz = {
  id: string
  station: string
  bereich: ReviewBereich
  text: string
  autor: string
  zeit: number
  bestaetigt?: boolean
}

/** Eine gespeicherte Fassung eines Textes — der Verlauf ist die Liste davon. */
export type TextFassung = { text: string; autor: string; zeit: number }

export type ReviewDaten = {
  notizen: ReviewNotiz[]
  /** Bearbeitete Texte je Schluessel `${station}|${feld}`, aelteste zuerst. */
  texte: Record<string, TextFassung[]>
}

/** Die vier bearbeitbaren Texte einer Station. Der Auftakt stellt eine
 *  Person vor statt eine These — dort heissen die Felder anders, genau wie
 *  die Marken auf der Buehne. */
export const FELDER: { id: string; titel: string }[] = [
  { id: 'hypothese', titel: 'Hypothesis' },
  { id: 'punkt0', titel: 'What changed' },
  { id: 'punkt1', titel: 'Evidence' },
  { id: 'punkt2', titel: 'So what' },
]

export const FELDER_PERSONA: { id: string; titel: string }[] = [
  { id: 'hypothese', titel: 'Intro line' },
  { id: 'punkt0', titel: 'Profile' },
  { id: 'punkt1', titel: 'Scope' },
  { id: 'punkt2', titel: 'This morning' },
]

export function textSchluessel(station: string, feld: string): string {
  return `${station}|${feld}`
}

/** Aktuell gueltiger Text: letzte Fassung, sonst das Original. */
export function aktuellerText(
  texte: Record<string, TextFassung[]>,
  station: string,
  feld: string,
  original: string,
): string {
  const v = texte[textSchluessel(station, feld)]
  return v && v.length ? v[v.length - 1].text : original
}

export function bereicheFuer(persona: boolean): { id: ReviewBereich; titel: string; hinweis: string }[] {
  if (!persona) return BEREICHE
  return [
    { id: 'hypothese', titel: 'Persona text', hinweis: 'Who Mara is, and how she is introduced' },
    BEREICHE[1],
    BEREICHE[2],
  ]
}

export const BEREICHE: { id: ReviewBereich; titel: string; hinweis: string }[] = [
  { id: 'hypothese', titel: 'Hypothesis', hinweis: 'Wording, evidence, numbers' },
  { id: 'szene', titel: 'Scene ideas', hinweis: 'What the scene should also tell' },
  { id: 'fehler', titel: 'Image & video issues', hinweis: 'What is wrong in the still or the transition' },
]

const LEER: ReviewDaten = { notizen: [], texte: {} }

function lokalLesen(): ReviewDaten {
  try {
    const roh = localStorage.getItem(SPEICHER)
    if (!roh) return LEER
    const d = JSON.parse(roh) as Partial<ReviewDaten>
    return {
      notizen: Array.isArray(d.notizen) ? d.notizen : [],
      texte: d.texte && typeof d.texte === 'object' ? d.texte : {},
    }
  } catch {
    return LEER
  }
}

function lokalSchreiben(d: ReviewDaten): void {
  try {
    localStorage.setItem(SPEICHER, JSON.stringify(d))
  } catch {
    /* privater Modus: dann eben ohne lokalen Puffer */
  }
}

export function reviewModusLesen(): boolean {
  try {
    return localStorage.getItem(MODUS) === '1'
  } catch {
    return false
  }
}

export function reviewModusSchreiben(an: boolean): void {
  try {
    localStorage.setItem(MODUS, an ? '1' : '0')
  } catch {
    /* egal */
  }
}

export function autorLesen(): string {
  try {
    return localStorage.getItem(NAME) ?? ''
  } catch {
    return ''
  }
}

export function autorSchreiben(name: string): void {
  try {
    localStorage.setItem(NAME, name)
  } catch {
    /* egal */
  }
}

async function serverLesen(): Promise<{ daten: ReviewDaten; geteilt: boolean } | null> {
  try {
    const res = await fetch(API, { cache: 'no-store' })
    if (!res.ok) return null
    const d = (await res.json()) as {
      notizen?: ReviewNotiz[]
      texte?: Record<string, TextFassung[]>
      geteilt?: boolean
    }
    return {
      daten: {
        notizen: Array.isArray(d.notizen) ? d.notizen : [],
        texte: d.texte && typeof d.texte === 'object' ? d.texte : {},
      },
      geteilt: !!d.geteilt,
    }
  } catch {
    return null
  }
}

async function serverSchreiben(d: ReviewDaten): Promise<boolean> {
  try {
    const res = await fetch(API, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(d),
    })
    return res.ok
  } catch {
    return false
  }
}

function id(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Haelt die Notizen, schreibt lokal sofort durch und schiebt den Stand
 * gebuendelt zum Server. `geteilt` sagt, ob der Server wirklich speichert.
 */
export function useReview(): {
  notizen: ReviewNotiz[]
  texte: Record<string, TextFassung[]>
  geteilt: boolean
  laedt: boolean
  anlegen: (station: string, bereich: ReviewBereich, text: string, autor: string) => void
  aendern: (id: string, text: string) => void
  loeschen: (id: string) => void
  bestaetigen: (id: string, an: boolean) => void
  textSetzen: (station: string, feld: string, text: string, autor: string, original: string) => void
  neuLaden: () => void
} {
  const [notizen, setNotizen] = useState<ReviewNotiz[]>(() => lokalLesen().notizen)
  const [texte, setTexte] = useState<Record<string, TextFassung[]>>(() => lokalLesen().texte)
  const [geteilt, setGeteilt] = useState(false)
  const [laedt, setLaedt] = useState(true)
  const schreibZeit = useRef<number | undefined>(undefined)

  const holen = useCallback(() => {
    setLaedt(true)
    void serverLesen().then((erg) => {
      setLaedt(false)
      if (!erg) return
      setGeteilt(erg.geteilt)
      // Der geteilte Stand fuehrt: sonst ueberschreibt ein alter lokaler
      // Puffer die Kommentare der Kolleginnen.
      if (erg.geteilt) {
        setNotizen(erg.daten.notizen)
        setTexte(erg.daten.texte)
        lokalSchreiben(erg.daten)
      }
    })
  }, [])

  useEffect(holen, [holen])

  const stand = useRef<ReviewDaten>({ notizen: [], texte: {} })
  stand.current = { notizen, texte }

  const sichern = useCallback((neu: Partial<ReviewDaten>) => {
    const daten: ReviewDaten = {
      notizen: neu.notizen ?? stand.current.notizen,
      texte: neu.texte ?? stand.current.texte,
    }
    if (neu.notizen) setNotizen(neu.notizen)
    if (neu.texte) setTexte(neu.texte)
    stand.current = daten
    lokalSchreiben(daten)
    window.clearTimeout(schreibZeit.current)
    schreibZeit.current = window.setTimeout(() => {
      void serverSchreiben(daten).then((ok) => setGeteilt((g) => ok || g))
    }, 600)
  }, [])

  const anlegen = useCallback(
    (station: string, bereich: ReviewBereich, text: string, autor: string) => {
      const sauber = text.trim()
      if (!sauber) return
      sichern({
        notizen: [
          ...notizen,
          { id: id(), station, bereich, text: sauber, autor, zeit: Date.now() },
        ],
      })
    },
    [notizen, sichern],
  )

  const aendern = useCallback(
    (nid: string, text: string) => {
      const sauber = text.trim()
      if (!sauber) return
      sichern({ notizen: notizen.map((n) => (n.id === nid ? { ...n, text: sauber } : n)) })
    },
    [notizen, sichern],
  )

  const loeschen = useCallback(
    (nid: string) => sichern({ notizen: notizen.filter((n) => n.id !== nid) }),
    [notizen, sichern],
  )

  const bestaetigen = useCallback(
    (nid: string, an: boolean) =>
      sichern({ notizen: notizen.map((n) => (n.id === nid ? { ...n, bestaetigt: an } : n)) }),
    [notizen, sichern],
  )

  const textSetzen = useCallback(
    (station: string, feld: string, text: string, autor: string, original: string) => {
      const sauber = text.trim()
      const k = textSchluessel(station, feld)
      const bisher = texte[k] ?? []
      const jetzt = bisher.length ? bisher[bisher.length - 1].text : original
      if (!sauber || sauber === jetzt) return
      // Erste Bearbeitung: das Original als Fassung 0 sichern, damit der
      // Verlauf zeigt, wovon ausgegangen wurde.
      const basis = bisher.length
        ? bisher
        : [{ text: original, autor: 'Original', zeit: 0 }]
      sichern({
        texte: { ...texte, [k]: [...basis, { text: sauber, autor, zeit: Date.now() }] },
      })
    },
    [texte, sichern],
  )

  return {
    notizen, texte, geteilt, laedt,
    anlegen, aendern, loeschen, bestaetigen, textSetzen, neuLaden: holen,
  }
}

/** Deutsches Datum-/Zeitformat fuer die Notizzeile. */
export function zeitText(ms: number): string {
  const d = new Date(ms)
  return `${d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}, ${d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`
}
