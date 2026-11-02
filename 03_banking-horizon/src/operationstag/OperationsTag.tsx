// ─────────────────────────────────────────────────────────────────────────────
// Ein Tag in Banking Operations 2030 — eigenständiges Tool.
//
// Mara, Operations-Spezialistin, durchläuft elf Stationen eines Montags (07:45
// bis 17:00). Links die Szene (Bild, später Veo-Videoübergang von Raum zu Raum),
// rechts die Hypothese mit Status quo, 2030, Wirkung und Leitfrage. Heller,
// ruhiger Auftritt in Aptos — bewusst der Gegenentwurf zum dunklen Holodeck.
//
// Die Klickstrecke ist linear (Vor/Zurück, Pfeiltasten, Stationsleiste); die
// analoge Uhr oben rechts wandert bei jedem Wechsel auf die Szenenzeit.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Briefcase,
  Clock3,
  History,
  Lightbulb,
  Eye,
  EyeOff,
  MessageSquare,
  Smartphone,
  Sparkles,
  Target,
  TrendingUp,
  User,
  Users,
  Workflow,
} from 'lucide-react'
import styles from './OperationsTag.module.css'
import { PUNKT_ANKER, SLOTS } from './ankerV05'
import { V08_ANKER, V08_MARKEN, v08Ausschnitt, v08Belege, v08Felder, type V08Marke } from './v08'
import {
  istBuehne,
  istVollbild,
  opsStationen,
  operationsStartIndex,
  opsBild,
  opsSchirmBild,
  type OpsStation,
  type OpsVariante,
} from './data'
import { AnalogUhr } from './AnalogUhr'
import { ReviewPanel } from './ReviewPanel'
import { aktuellerText, autorLesen, reviewModusLesen, reviewModusSchreiben, useReview } from './review'
import { SCHIRM_KAESTEN } from './schirmKaesten'
import { SCHIRM_KAESTEN_V08, kastenAufBuehne } from './schirmKaestenV08'
import { LOGO_MASKEN_V08, bankLogoLesen, bankLogoSchreiben } from './logoMaske'

type Props = {
  onExit: () => void
  /**
   * Fassung. `v01` zeigt Heute/2030, Wirkung und Leitfrage. `v02` zeigt allein
   * die 2030-Aussage, dafuer in deutlich groesserer Schrift, und laesst die
   * Bildunterschrift weg — alles Weitere gehoert dort auf die Tonspur.
   */
  variante?: OpsVariante
}

/** Phasen eines Übergangs: laden (Szene bleibt stehen) → spielt → raus. */
type Phase = 'laden' | 'spielt' | 'raus'

/**
 * Clips je Übergang — genau eine Datei pro Stationswechsel. Der Weg von der
 * Wohnung ins Gebäude entstand über den Türtrick aus zwei Veo-Aufnahmen, ist
 * aber schon beim Rendern zu einer Datei zusammengeblendet worden: beim
 * Abspielen darf es keine Naht geben, an der nachgeladen wird.
 */
function clipsFuer(n: number, variante: OpsVariante): string[] {
  const liste = opsStationen(variante)
  if (n < 0 || n >= liste.length - 1) return []
  // v02 hat einen eigenen Satz Uebergaenge, weil dort andere Raeume stehen.
  // v05 nutzt Bilder und Wege der v04 — reine Darstellungsfassung.
  const ordner = variante === 'v01' ? 'operations' : `operations-${variante === 'v05' ? 'v04' : variante}`
  const basis = `${import.meta.env.BASE_URL}videos/${ordner}/`
  return [`${basis}${liste[n].id}-${liste[n + 1].id}.mp4`]
}

/**
 * Hebt die Kernaussage eines Textes hervor. Mehr Auszeichnung als `**fett**`
 * gibt es hier bewusst nicht — die Inhalte sollen Fließtext bleiben.
 */
function mitFett(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((teil, n) =>
    teil.startsWith('**') && teil.endsWith('**') ? (
      <strong key={n}>{teil.slice(2, -2)}</strong>
    ) : (
      <span key={n}>{teil}</span>
    ),
  )
}

/**
 * Groesste Schriftgroesse, bei der der Text noch vollstaendig in sein Feld
 * passt. In der knappen Fassung steht nur ein Satz auf der Folie — der soll so
 * gross wie moeglich sein, aber nie abgeschnitten. Eine feste Groesse kann
 * beides nicht: kurze Aussagen wirken dann verloren, lange laufen unten raus.
 */
/**
 * Groesste Schriftgroesse, bei der der Text noch vollstaendig in sein Feld
 * passt — in BEIDE Richtungen. Die Hoehe allein genuegte, solange der Satz
 * umbrechen durfte; die einzeilige Hypothese der v08 laeuft statt dessen
 * seitlich heraus, deshalb zaehlt auch die Breite.
 *
 * Gesucht wird nicht die naechstkleinere, sondern die groesste passende
 * Groesse: ein kurzer Satz soll das Band FUELLEN, nicht verloren darin
 * stehen. Weil der Weg dorthin je nach Satz ueber hundert Schritte lang
 * waere und jeder Schritt das Layout neu rechnet, wird halbiert statt
 * gezaehlt — rund acht Messungen statt hundert.
 */
function einpassen(el: HTMLElement | null, max: number, min: number): void {
  if (!el) return
  const passt = (px: number): boolean => {
    el.style.fontSize = `${px}px`
    return el.scrollWidth <= el.clientWidth + 1 && el.scrollHeight <= el.clientHeight + 1
  }
  if (passt(max)) return
  let klein = min
  let gross = max
  while (gross - klein > 1) {
    const mitte = Math.floor((klein + gross) / 2)
    if (passt(mitte)) klein = mitte
    else gross = mitte
  }
  passt(klein)
}

/**
 * Die drei Punkte tragen immer dieselbe Beweisfuehrung: was sich geaendert
 * hat, woran man es misst, und was daraus folgt. Die feste Reihenfolge ist
 * Absicht — sie zwingt dazu, dass kein Punkt den Action Title wiederholt.
 * Der Auftakt stellt statt einer These eine Person vor und braucht deshalb
 * eigene Marken.
 */
const BELEG = [
  { marke: 'What changed', Symbol: Workflow },
  { marke: 'Evidence', Symbol: BarChart3 },
  { marke: 'So what', Symbol: Target },
]

/**
 * v08: die Marken haengen nicht mehr an der Position, sondern am Beleg selbst.
 * „Evidence" und „So what" waren im Review durchgefallen — „So what" klang
 * abweisend, „Evidence" musste erklaert werden. Der neue Dreiklang fuehrt
 * beschreibend hinein, deutet dann die Zahlen auf dem Schirm und endet bei der
 * Wirkung; die vierte Marke steht nur, wo Kunden wirklich betroffen sind.
 */
const V08_SYMBOL: Record<V08Marke, typeof Workflow> = {
  context: Eye,
  automation: Workflow,
  hitl: User,
  kunde: Users,
}

const BELEG_PERSONA = [
  { marke: 'Profile', Symbol: User },
  { marke: 'Scope', Symbol: Briefcase },
  { marke: 'This morning', Symbol: Smartphone },
]

/**
 * Zahl der Zeichen, die gerade geschrieben sind.
 *
 * Waehrend eines Szenenwechsels steht die Aussage der ZIELstation schon im
 * Kopf und wird Zeichen fuer Zeichen getippt — man liest sie also bereits,
 * waehrend der Weg noch laeuft. Ohne Wechsel steht sie sofort ganz da.
 */
function useSchreibmaschine(text: string, tippen: boolean, warten: number, dauer: number): number {
  const [n, setN] = useState(text.length)
  useEffect(() => {
    if (!tippen) {
      setN(text.length)
      return
    }
    setN(0)
    const start = performance.now()
    let id = requestAnimationFrame(function schritt() {
      const t = Math.min(1, (performance.now() - start - warten) / dauer)
      setN(Math.round(Math.max(0, t) * text.length))
      if (t < 1) id = requestAnimationFrame(schritt)
    })
    return () => cancelAnimationFrame(id)
  }, [text, tippen, warten, dauer])
  return n
}

export function OperationsTag({ onExit, variante = 'v01' }: Props): React.ReactElement {
  // v03 hat eine Station mehr; die Liste haengt deshalb an der Fassung.
  const stationen = opsStationen(variante)
  const knapp = variante !== 'v01'
  // v03: die Szene fuellt das Bild, darueber steht allein die Hypothese.
  const buehne = istBuehne(variante)
  // v05: Vollbild plus Sprechblasen — kein Seitenpanel, kein Zoom.
  const vollbild = istVollbild(variante)
  // v08: die Marken kommen aus der Fassung, nicht aus der Position, und es
  // gibt eine vierte fuer die Kundensicht.
  const v08 = variante === 'v08'

  /**
   * Marke und Symbol des n-ten Belegs. In v08 traegt jeder Beleg seine Marke
   * selbst; in allen aelteren Fassungen ergibt sie sich aus der Position.
   */
  const beleg = useCallback(
    (st: OpsStation, n: number): { marke: string; Symbol: typeof Workflow } => {
      if (st.art === 'persona') return BELEG_PERSONA[n] ?? BELEG_PERSONA[0]
      if (v08) {
        const b = v08Belege(st.id)[n]
        if (b) return { marke: V08_MARKEN[b.marke], Symbol: V08_SYMBOL[b.marke] }
      }
      return BELEG[n] ?? BELEG[2]
    },
    [v08],
  )

  /** Anker der Blasen in v08 — mit Rueckfall auf die der v05. */
  const v08Anker = useCallback(
    (id: string) => V08_ANKER[id] ?? PUNKT_ANKER[id] ?? [],
    [],
  )

  /**
   * Schluessel einer Station im Review-Speicher.
   *
   * v08 bekommt einen EIGENEN Raum (`v08:s3` statt `s3`). Beide Fassungen
   * liegen im selben geteilten Speicher; ohne das Praefix wuerden die
   * Kommentare zur v07 in der v08 mit auftauchen und — schlimmer — beim
   * Bearbeiten der Texte ueberschrieben. So bleibt in v07 alles stehen, wie
   * das Team es hinterlassen hat.
   */
  const raum = useCallback((id: string) => (v08 ? `v08:${id}` : id), [v08])
  // Ein geteilter Link `#/operations/<klick>` startet direkt auf seiner Station.
  const [i, setI] = useState(() => operationsStartIndex(variante))
  const station = stationen[i]
  const letzte = stationen.length - 1

  // Laufender Szenenübergang: Liste der Clips und der gerade sichtbare.
  const [clips, setClips] = useState<string[] | null>(null)
  const [clipNr, setClipNr] = useState(0)
  // Höchster Clip, der tatsächlich schon Bilder liefert. Nur bis hierhin wird
  // eingeblendet — ein noch puffernder Clip bliebe sonst schwarz.
  const [aktivNr, setAktivNr] = useState(-1)
  const [phase, setPhase] = useState<Phase>('laden')
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const aussage = useRef<HTMLParagraphElement>(null)
  // Buehne: derselbe Dienst fuer die Hypothese in der Kopfzeile.
  const kopfAussage = useRef<HTMLHeadingElement>(null)
  // Vollbild: die Aussage und die drei Belege lassen sich wegblenden,
  // damit die Szene selbst ungestoert gezeigt werden kann.
  const [zeigeThese, setzeZeigeThese] = useState(true)
  // Review-Modus: Kommentare des Teams je Station (geteilt ueber /api/review).
  const [review, setzeReview] = useState(reviewModusLesen)
  // Bank-Bildmarke auf den Bildschirmen: Standard aus (siehe logoMaske.ts).
  const [zeigeLogo, setzeZeigeLogo] = useState(bankLogoLesen)
  // Laeuft die Strecke eingebettet (Absprung aus dem Strukturbild, Kapitel 03)?
  // Dann schliesst der Rahmen aussen; eigener Overview-Knopf und Escape
  // fuehrten sonst mitten im Rahmen zurueck auf die Startseite.
  const eingebettet = typeof window !== 'undefined' && window.self !== window.top
  const [autor, setzeAutor] = useState(autorLesen)
  const notiz = useReview()

  // ── Vorabladen ────────────────────────────────────────────────────────────
  // Ein frisch eingehängtes <video> zeigt schwarz, solange es puffert. Deshalb
  // wird jeder Clip GENAU EINMAL geholt — als Blob in den Speicher, während man
  // noch die Hypothese liest — und später aus dem Speicher abgespielt. Wichtig:
  // niemals parallel dazu noch das <video> dieselbe Datei laden lassen; zwei
  // Downloads teilen sich die Leitung und beide werden langsam.
  const cache = useRef(new Map<string, string>())
  const laufend = useRef(new Map<string, Promise<string | null>>())
  const abbruch = useRef(new Map<string, AbortController>())
  const fortschritt = useRef(new Map<string, number>())

  const holen = useCallback((url: string): Promise<string | null> => {
    const fertig = cache.current.get(url)
    if (fertig) return Promise.resolve(fertig)
    const schon = laufend.current.get(url)
    if (schon) return schon

    const ac = new AbortController()
    abbruch.current.set(url, ac)
    const p = fetch(url, { signal: ac.signal })
      .then(async (r) => {
        if (!r.ok) return null
        const gesamt = Number(r.headers.get('content-length')) || 0
        const leser = r.body?.getReader()
        if (!leser) return URL.createObjectURL(await r.blob())
        const teile: Uint8Array[] = []
        let da = 0
        for (;;) {
          const { done, value } = await leser.read()
          if (done) break
          if (value) {
            teile.push(value)
            da += value.length
            if (gesamt) fortschritt.current.set(url, da / gesamt)
          }
        }
        fortschritt.current.set(url, 1)
        return URL.createObjectURL(new Blob(teile as BlobPart[], { type: 'video/mp4' }))
      })
      .then((obj) => {
        if (!obj) return null
        // Kein Speicherdeckel: die elf Clips zusammen sind rund 43 MB, und nur
        // wenn alle liegen bleiben, läuft die Strecke ohne Nachladen.
        cache.current.set(url, obj)
        return obj
      })
      .catch(() => null)
      .finally(() => {
        laufend.current.delete(url)
        abbruch.current.delete(url)
      })

    laufend.current.set(url, p)
    return p
  }, [])

  /**
   * Beim Betreten werden ALLE Übergänge geholt, in der Reihenfolge des Tages und
   * immer nur einer nach dem anderen. Nacheinander, weil parallele Downloads
   * sich die Leitung teilen und dann keiner fertig wird; in Tagesreihenfolge,
   * weil man den ersten zuerst braucht. Ist alles im Speicher, läuft die ganze
   * Strecke ohne einen einzigen Ladevorgang.
   */
  const [gesamtstand, setGesamtstand] = useState(0)
  // Zahl der bereits vollstaendig geholten Clips — die Anzeige nennt
  // Stueckzahlen, nicht nur Prozent: "7 von 12 Szenen" sagt mehr.
  const [fertigeClips, setFertigeClips] = useState(0)
  const alleUrls = useRef(
    Array.from({ length: opsStationen(variante).length - 1 }, (_, n) => clipsFuer(n, variante)).flat(),
  )

  // Waehrend ein Uebergang laeuft, RUHT die Vorabholung. Sonst laedt der
  // Hintergrund weiter, waehrend der sichtbare Clip Bilder braucht — auf
  // schmaler Leitung genau das Ruckeln, das man sieht. Und die Schlange
  // beginnt bei der Station, auf der man steht, nicht immer am Morgen.
  const uebergangLaeuft = useRef(false)
  useEffect(() => {
    uebergangLaeuft.current = !!clips
  }, [clips])

  const startIndex = useRef(i)

  useEffect(() => {
    let gestoppt = false
    const urls = alleUrls.current
    const ab = Math.max(0, Math.min(urls.length - 1, startIndex.current))
    const reihenfolge = [...urls.slice(ab), ...urls.slice(0, ab)]
    const warten = (ms: number) => new Promise((r) => window.setTimeout(r, ms))
    const laden = async () => {
      for (const url of reihenfolge) {
        while (!gestoppt && uebergangLaeuft.current) await warten(350)
        if (gestoppt) return
        await holen(url)
        if (!gestoppt) {
          const fertig = urls.filter((u) => cache.current.has(u)).length
          setFertigeClips(fertig)
          setGesamtstand(fertig / urls.length)
        }
      }
    }
    void laden()
    return () => {
      gestoppt = true
    }
  }, [holen])

  // Feinanzeige während einer laufenden Datei, damit der Balken nicht springt.
  useEffect(() => {
    if (gesamtstand >= 1) return
    const urls = alleUrls.current
    const id = window.setInterval(() => {
      const fertig = urls.filter((u) => cache.current.has(u)).length
      setFertigeClips(fertig)
      const laufendeAnteile = urls
        .filter((u) => !cache.current.has(u))
        .reduce((s, u) => s + (fortschritt.current.get(u) ?? 0), 0)
      setGesamtstand(Math.min(1, (fertig + laufendeAnteile) / urls.length))
    }, 250)
    return () => window.clearInterval(id)
  }, [gesamtstand])

  useEffect(() => {
    const gespeichert = cache.current
    return () => {
      for (const url of gespeichert.values()) URL.revokeObjectURL(url)
      gespeichert.clear()
    }
  }, [])

  /**
   * Quellen des laufenden Übergangs. Zwei Fälle, beide mit genau einer
   * Verbindung:
   *
   * • Der Clip liegt schon vollständig im Speicher (Regelfall, weil er während
   *   des Lesens geholt wurde) — dann spielt er sofort und ohne Puffern.
   * • Er ist noch unterwegs — dann wird der Vorabruf abgebrochen und das
   *   <video> streamt direkt von der Adresse. Es startet, sobald der Anfang da
   *   ist, statt auf die vollständige Datei zu warten.
   */
  const [quellen, setQuellen] = useState<string[]>([])
  const [ladestand, setLadestand] = useState(0)
  // Laufzeit des aktuellen Clips — die Uhr läuft genau so lange vor.
  const [uhrDauer, setUhrDauer] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (!clips) {
      setQuellen([])
      return
    }
    setQuellen(
      clips.map((url) => {
        const blob = cache.current.get(url)
        if (blob) return blob
        abbruch.current.get(url)?.abort()
        return url
      }),
    )
  }, [clips])

  // Ladebalken mitführen, solange gewartet wird.
  useEffect(() => {
    if (!clips || phase !== 'laden') return
    const lesen = () =>
      setLadestand(
        clips.reduce((s, url) => s + (cache.current.has(url) ? 1 : (fortschritt.current.get(url) ?? 0)), 0) /
          clips.length,
      )
    lesen()
    const id = window.setInterval(lesen, 150)
    return () => window.clearInterval(id)
  }, [clips, phase])

  // ── Ablauf ────────────────────────────────────────────────────────────────
  /** Übergang abbrechen bzw. abräumen. */
  const abraeumen = useCallback(() => {
    setClips(null)
    setClipNr(0)
    setAktivNr(-1)
    setPhase('laden')
    setUhrDauer(undefined)
  }, [])

  // Vorwärts immer über den Videoübergang: der Clip läuft, danach steht die
  // nächste Station. (Zustand bewusst außerhalb eines State-Updaters setzen —
  // Seiteneffekte darin führen dazu, dass der Clip nie erscheint.)
  // ── Kamerafahrt der Buehne (v04 und v08) ──────────────────────────────────
  // Nach der Ankunft faehrt die Buehne sanft NAH an den Bildschirm heran —
  // Monitorrand und ein Stueck Raum bleiben sichtbar, damit klar ist, wo man
  // ist. Vor dem naechsten Weg faehrt sie erst wieder heraus, dann startet
  // der Clip. Das scharfe UI-Overlay liegt deckungsgleich auf der gestanzten
  // Flaeche, damit die Schrift den Zoom uebersteht.
  //
  // v08 faehrt erst, wenn das Standbild steht — nicht schon im laufenden
  // Video wie v04 — und langsamer (siehe .root[data-hero] .leinwand). Ihre
  // Kaesten liegen in Szenenbild-Anteilen und werden weiter unten, sobald
  // der Bildausschnitt bekannt ist, auf die Buehne umgerechnet.
  const zoomFassung = variante === 'v04' || v08
  // Station, auf die es gerade zugeht (waehrend des Wegs schon das Ziel).
  const zielNr = clips && phase === 'spielt' ? Math.min(letzte, i + 1) : i
  const kastenRoh = zoomFassung
    ? (v08 ? SCHIRM_KAESTEN_V08 : SCHIRM_KAESTEN)[stationen[zielNr].id] ?? null
    : null

  // Die Leinwand ist die groesste 16:9-Flaeche, die in BEIDE Richtungen in
  // die Bildbox passt. Nur die Breite zu begrenzen hat im Weg-Modus (volle
  // Buehnenbreite, breiter als 16:9) die Leinwand ueber die Box hinaus
  // wachsen lassen — overflow: hidden schnitt das Video oben und unten ab.
  // Gemessen statt per Container-Query, weil die Query-Einheiten in dieser
  // Verschachtelung nicht zuverlaessig aufloesen.
  const bildBox = useRef<HTMLDivElement>(null)
  const [leinwandMass, setLeinwandMass] = useState<{ w: number; h: number } | null>(null)
  useEffect(() => {
    if (!buehne || !bildBox.current) return
    const el = bildBox.current
    const messen = () => {
      const b = el.getBoundingClientRect()
      const w = Math.min(b.width, (b.height * 16) / 9)
      setLeinwandMass({ w: Math.round(w), h: Math.round((w * 9) / 16) })
    }
    messen()
    const ro = new ResizeObserver(messen)
    ro.observe(el)
    return () => ro.disconnect()
  }, [buehne])
  const [nah, setNah] = useState(false)
  // Sprung ueber die Zeitleiste: sofort in der Nahansicht landen, ohne die
  // 1.35s-Fahrt — die ist ein Erzaehleffekt fuer die durchgehende Reise,
  // nicht fuer wahlfreien Zugriff.
  const sofort = useRef(false)
  const [ohneFahrt, setOhneFahrt] = useState(false)
  useEffect(() => {
    if (!ohneFahrt) return
    const id = window.requestAnimationFrame(() => setOhneFahrt(false))
    return () => window.cancelAnimationFrame(id)
  }, [ohneFahrt])
  // Welches Standbild wirklich im Browser angekommen ist. Die Fahrt darf
  // erst losgehen, wenn das Bild steht — sonst faehrt sie auf ein Bild zu,
  // das noch laedt, und beim Erscheinen sieht es aus wie ein Sprung.
  const [bildDa, setBildDa] = useState<string | null>(null)
  useEffect(() => {
    if (!zoomFassung || !kastenRoh) {
      setNah(false)
      return
    }
    if (clips) return
    if (sofort.current) {
      sofort.current = false
      // v04: Sprung ueber die Zeitleiste landet sofort in der Nahansicht.
      // v08 faehrt immer — auch nach einem Sprung oder rueckwaerts —, weil
      // die Fahrt dort Teil der Szene ist und nicht Erzaehleffekt der Reise.
      if (!v08) {
        setOhneFahrt(true)
        setNah(true)
        return
      }
      // Ein Sprung ist ein Schnitt: erst ohne Fahrt auf die Weitansicht,
      // von dort aus faehrt sie dann wie bei jeder Ankunft heran.
      setOhneFahrt(true)
      setNah(false)
    }
    if (v08 && bildDa !== station.id) return
    // Ankunft: kurz warten, dann heran. In v08 steht das Standbild erst
    // einen Moment, damit man den Raum gesehen hat, bevor es an den
    // Bildschirm geht.
    const t = window.setTimeout(() => setNah(true), v08 ? 900 : 450)
    return () => window.clearTimeout(t)
  }, [zoomFassung, clips, kastenRoh, station.id, v08, bildDa])

  // Am Ende des Wegs faehrt die Kamera bereits im laufenden Video heran: das
  // Bild wird smooth auf den Zielmonitor beschnitten, und das Standbild
  // uebernimmt nah — ohne Sprung, weil beide dasselbe letzte Bild tragen.
  const beiZeit = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      // v08 faehrt nicht im Video, sondern erst im Standbild.
      if (!zoomFassung || v08 || !clips || !kastenRoh) return
      const v = e.currentTarget
      if (clipNr === clips.length - 1 && Number.isFinite(v.duration)
          && v.duration - v.currentTime < 1.25) {
        setNah(true)
      }
    },
    [zoomFassung, v08, clips, kastenRoh, clipNr],
  )

  const vor = useCallback(() => {
    if (i >= letzte || clips) return
    const naechste = clipsFuer(i, variante)
    if (!naechste.length) {
      setI(Math.min(letzte, i + 1))
      return
    }
    setNah(false)
    setClips(naechste)
    setClipNr(0)
    setAktivNr(-1)
    setPhase('laden')
  }, [i, letzte, clips])

  const springe = useCallback(
    (ziel: number) => {
      sofort.current = true
      abraeumen()
      setI(Math.max(0, Math.min(letzte, ziel)))
    },
    [abraeumen, letzte],
  )

  const zurueck = useCallback(() => springe(i - 1), [springe, i])

  /**
   * Clip zu Ende: entweder folgt der zweite Clip des Türtricks, oder die
   * Zielstation wird gesetzt. Das Video bleibt dabei auf seinem letzten Bild
   * stehen und wird erst danach ausgeblendet — weil dieses letzte Bild exakt
   * das nächste Szenenbild ist, sieht man vom Wechsel nichts.
   */
  const clipFertig = useCallback(() => {
    if (!clips) return
    if (clipNr + 1 < clips.length) {
      setClipNr((n) => n + 1)
      return
    }
    setI((n) => Math.min(letzte, n + 1))
    setPhase('raus')
  }, [clips, clipNr, letzte])

  /**
   * Spielt ein Clip nicht ab, wird nicht sofort aufgegeben: liegt es an der
   * Blob-Quelle (etwa weil eine Content-Security-Policy `blob:` für Medien
   * verbietet), wird einmal auf die normale Adresse umgestellt. Erst wenn auch
   * die scheitert — Datei fehlt, Format wird nicht unterstützt —, geht es ohne
   * Übergang weiter, statt hängen zu bleiben.
   */
  const clipFehler = useCallback(() => {
    if (clips) {
      const n = clipNr
      if (quellen[n] && quellen[n] !== clips[n]) {
        setQuellen((q) => q.map((v, m) => (m === n ? clips[m] : v)))
        return
      }
    }
    springe(i + 1)
  }, [clips, clipNr, quellen, springe, i])

  /** Manuelles Überspringen — bricht den Übergang immer ab. */
  const ueberspringen = useCallback(() => springe(i + 1), [springe, i])

  // Nach dem Ausblenden das Video entfernen.
  useEffect(() => {
    if (phase !== 'raus') return
    const id = window.setTimeout(abraeumen, 180)
    return () => window.clearTimeout(id)
  }, [phase, abraeumen])

  /**
   * Ein Clip wird erst eingeblendet, wenn er wirklich Bilder liefert (Ereignis
   * `playing`) — bis dahin bleibt das Standbild der aktuellen Szene stehen, und
   * beim Türtrick bleibt der erste Clip auf seinem letzten Bild sichtbar,
   * während der zweite darüber aufblendet. So gibt es nie eine schwarze Fläche.
   */
  const laeuft = useCallback((n: number) => {
    setAktivNr((a) => Math.max(a, n))
    setPhase((p) => (p === 'laden' ? 'spielt' : p))
    // Die Uhr soll genau so lange vorlaufen, wie der Weg dauert — also die
    // echte Laufzeit des Clips übernehmen, sobald sie bekannt ist.
    const v = videoRefs.current[n]
    // Die Uhr soll VOR dem Clipende angekommen sein — laeuft sie exakt so
    // lange wie das Video, gleitet sie noch, wenn die naechste Station schon
    // steht, und der Wechsel wirkt, als warte er auf sie (Nutzerbefund).
    if (v && Number.isFinite(v.duration) && v.duration > 0) {
      setUhrDauer(Math.max(700, v.duration * 1000 - 900))
    }
  }, [])

  // Abspielen anstoßen, sobald ein Clip eingehängt oder gewechselt wird. Ein
  // abgelehntes play()-Versprechen bedeutet nur, dass der Browser Autoplay
  // blockiert; stummgeschaltete Videos sind davon nicht betroffen. Es wird
  // bewusst NICHT nach einer Frist abgebrochen — wer eine langsame Leitung hat,
  // wartet lieber kurz vor dem Standbild, als dass der Übergang verschluckt
  // wird. Zum Weiterspringen gibt es die Schaltfläche.
  useEffect(() => {
    if (!clips || phase === 'raus' || !quellen.length) return
    const v = videoRefs.current[clipNr]
    if (!v) return
    void v.play().catch(() => undefined)
  }, [clips, clipNr, phase, quellen])

  /**
   * Station, auf der man gedanklich steht. Sobald der Weg läuft, ist das schon
   * die Zielstation: die Uhr läuft dorthin vor und die Zeitleiste unten markiert
   * sie bereits — man ist ja unterwegs. Beim Ausblenden steht `i` schon auf dem
   * Ziel, deshalb dann wieder `i` selbst.
   */
  const zeigeNr = clips && phase === 'spielt' ? Math.min(letzte, i + 1) : i
  const uhrZeit = stationen[zeigeNr].zeit

  // Kopfzeile der Buehne: die Aussage der Station, auf die es gerade zugeht.
  // Die Auftaktszene hat keine Hypothese — dort stellt sich die Person vor.
  // Der Bildschirm der Station — im Ruhezustand steht er links gross, waehrend
  // des Wegs dagegen der Raum, damit das erste Videobild auf das Standbild
  // trifft. Stationen ohne Schirm zeigen weiter die Szene.
  const schirmBild = buehne ? opsSchirmBild(station, variante) : null

  const kopfStation = stationen[zeigeNr]
  // Im Review bearbeitete Texte gelten ueberall — sonst prueft das Team eine
  // Fassung, die auf der Buehne gar nicht steht.
  const kopfText =
    kopfStation.art === 'persona'
      ? kopfStation.persona?.kopfzeile ?? ''
      : aktuellerText(notiz.texte, raum(kopfStation.id), 'hypothese', kopfStation.hypothese)
  // Die Aussage steht nicht mehr ueber der Szene, sondern rechts — und erst,
  // wenn der Weg durch ist. Sie schreibt sich dann in knapp einer Sekunde
  // selbst, damit der Blick von der Szene auf den Satz gezogen wird.
  const getippt = useSchreibmaschine(kopfText, buehne && !clips, 220, 900)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Wer gerade eine Notiz schreibt, bewegt mit den Pfeiltasten den
      // Schreibcursor — nicht die Klickstrecke. Ohne diese Sperre wechselte
      // die Station mitten im Satz, und der Kommentar landete an der
      // naechsten Uhrzeit statt an der gemeinten (Befund aus dem Review).
      const ziel = e.target as HTMLElement | null
      const tippt =
        !!ziel
        && (ziel.tagName === 'INPUT'
          || ziel.tagName === 'TEXTAREA'
          || ziel.tagName === 'SELECT'
          || ziel.isContentEditable)
      if (tippt) return
      if (e.key === 'ArrowRight') vor()
      else if (e.key === 'ArrowLeft') zurueck()
      else if (e.key === 'Escape') {
        if (eingebettet) window.parent.postMessage('bz2030:demo-schliessen', '*')
        else onExit()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [vor, zurueck, onExit, eingebettet])

  // Deep-Link `#/operations/<klick>` mitschreiben, damit einzelne Stationen
  // teilbar sind.
  // Die 2030-Aussage der knappen Fassung so gross setzen, wie sie noch ganz
  // ins Feld passt — nach jedem Stationswechsel und bei jeder Groessenaenderung
  // des Fensters neu.
  useEffect(() => {
    if (!knapp) return
    // In der Buehne steht der Satz in der Kopfzeile und darf deutlich groesser
    // werden — er hat dort zwei ganze Zeilen ueber die volle Breite.
    const el = buehne ? kopfAussage.current : aussage.current
    // Im Vollbild liegt die Aussage AUF dem Bild: sie bleibt eine ruhige
    // Zeile am oberen Rand und darf den Sprechblasen nicht ins Feld wachsen.
    // v08: die Hypothese steht einzeilig ueber der vollen Breite — sie darf
    // dafuer weit herunterskalieren, statt in drei Zeilen zu laufen.
    // In v08 setzt die gemeinsame Groesse oben; hier wuerde sie nur ueberschrieben.
    const passen = () =>
      v08 ? undefined : einpassen(el, vollbild ? 54 : buehne ? 60 : 46, buehne ? 22 : 18)
    passen()
    const ro = new ResizeObserver(passen)
    if (el?.parentElement) ro.observe(el.parentElement)
    return () => ro.disconnect()
  }, [knapp, buehne, station.id, kopfText])

  // Deep-Link ohne Versionsnummer: `#/operations/<klick>`. Alte Links
  // (`#/v08/<klick>` und die Vorfassungen) landen hier und werden beim
  // ersten Rendern auf die versionslose Adresse umgeschrieben.
  useEffect(() => {
    const ziel = `#/operations/${station.klick}`
    if (window.location.hash !== ziel) {
      window.history.replaceState(null, '', ziel)
    }
  }, [station.klick])

  /**
   * EINE Schriftgroesse fuer alle Hypothesen.
   *
   * Je Satz einzeln einzupassen sieht beim Durchklicken aus, als springe das
   * Band: kurze Saetze werden gross, lange klein. Deshalb wird die Groesse
   * einmal aus dem LAENGSTEN Satz bestimmt und gilt dann fuer jede Station.
   * Gemessen wird an einem unsichtbaren Zwilling bei 100 px — Textbreite
   * waechst linear mit der Schriftgroesse, eine Messung je Satz genuegt.
   */
  const messRef = useRef<HTMLSpanElement>(null)
  const [theseGroesse, setzeTheseGroesse] = useState<number | null>(null)

  useEffect(() => {
    if (!v08) return
    const zwilling = messRef.current
    const band = kopfAussage.current
    if (!zwilling || !band) return
    const rechnen = () => {
      const breite = band.clientWidth
      const hoehe = band.clientHeight
      if (!breite || !hoehe) return
      let px = Math.floor(hoehe / 1.2)
      for (const st of stationen) {
        const t = st.art === 'persona' ? st.persona?.kopfzeile ?? '' : st.hypothese
        if (!t) continue
        zwilling.textContent = t
        const w = zwilling.offsetWidth
        if (w) px = Math.min(px, Math.floor((breite * 100) / w))
      }
      setzeTheseGroesse(Math.max(15, px))
    }
    rechnen()
    const beobachter = new ResizeObserver(rechnen)
    beobachter.observe(band)
    return () => beobachter.disconnect()
  }, [v08, stationen])

  /**
   * Bildausschnitt: die Szene laeuft ueber die volle Breite, also wird oben
   * und unten geschnitten. WO geschnitten wird, haengt an der Station — die
   * Wandanzeige um 09:00 sitzt oben, der Monitor sonst in der Mitte.
   */
  const [buehnenMass, setzeBuehnenMass] = useState<{ b: number; h: number } | null>(null)
  useEffect(() => {
    const box = bildBox.current
    if (!v08 || !box) return
    const messen = () => setzeBuehnenMass({ b: box.clientWidth, h: box.clientHeight })
    messen()
    const beobachter = new ResizeObserver(messen)
    beobachter.observe(box)
    return () => beobachter.disconnect()
  }, [v08])

  const ausschnitt = v08 && buehnenMass
    ? v08Ausschnitt(station.id, buehnenMass.b, buehnenMass.h)
    : null

  // Der Kasten in Anteilen der Leinwand. In v04 ist die Leinwand das Bild,
  // in v08 ist sie die Buehne und das Bild darin beschnitten — dann erst
  // umrechnen. Ohne Mass (erster Render) gibt es noch keine Fahrt.
  const kasten: [number, number, number, number] | null = !kastenRoh
    ? null
    : !v08
      ? kastenRoh
      : ausschnitt && buehnenMass
        ? kastenAufBuehne(kastenRoh, ausschnitt.fit, ausschnitt.position, buehnenMass.b, buehnenMass.h)
        : null

  // Maske ueber der Bank-Bildmarke der aktuellen Station — in Leinwand-
  // Anteilen, mit derselben Umrechnung wie das Bildschirm-Overlay, damit sie
  // in jeder Zoomstufe deckungsgleich auf der Marke liegt.
  const logoRoh = v08 && !zeigeLogo ? LOGO_MASKEN_V08[station.id] : undefined
  const logoMaske = logoRoh && ausschnitt && buehnenMass
    ? {
        box: kastenAufBuehne(
          logoRoh.box, ausschnitt.fit, ausschnitt.position, buehnenMass.b, buehnenMass.h,
        ),
        farbe: logoRoh.farbe,
      }
    : null

  let fahrt: React.CSSProperties | undefined
  if (kasten) {
    const rand = 0.055
    const x0 = Math.max(0, kasten[0] - rand)
    const y0 = Math.max(0, kasten[1] - rand * (16 / 9))
    const x1 = Math.min(1, kasten[2] + rand)
    const y1 = Math.min(1, kasten[3] + rand * (16 / 9))
    const mass = Math.min(1 / (x1 - x0), 1 / (y1 - y0), 2.05)
    fahrt = {
      transform: nah
        ? `scale(${mass.toFixed(4)}) translate(${((0.5 - (x0 + x1) / 2) * 100).toFixed(2)}%, ${((0.5 - (y0 + y1) / 2) * 100).toFixed(2)}%)`
        : 'scale(1) translate(0%, 0%)',
    }
  }

  /**
   * Bedienelemente. In v08 traegt die Kopfzeile allein die Hypothese — sie
   * bekommt damit die volle Breite und braucht statt drei nur noch zwei
   * Zeilen. Overview, Review und der Hypothesen-Schalter wandern nach unten
   * in die Uhrzeitleiste, wo ohnehin bedient wird.
   */
  const heroBedienung = vollbild && v08

  const uebersichtKnopf = eingebettet ? null : (
    <button type="button" className={styles.backBtn} onClick={onExit}>
      <ArrowLeft size={16} strokeWidth={2} aria-hidden />
      Overview
    </button>
  )

  const werkzeugLeiste = (
  <div className={styles.topRight}>
            {/* Solange die Übergänge geholt werden, sieht man wie weit es ist.
                Bedienen kann man das Tool die ganze Zeit — ein Clip, der beim
                Klick noch nicht da ist, wird stattdessen gestreamt. */}
            {gesamtstand < 1 && (
              <span className={styles.laden} data-pause={clips ? '' : undefined}>
                <span className={styles.ladenBalken}>
                  <i style={{ transform: `scaleX(${Math.max(0.02, gesamtstand)})` }} />
                </span>
                {fertigeClips} of {alleUrls.current.length} scenes
                {clips ? ' · paused' : ` · ${Math.round(gesamtstand * 100)} %`}
              </span>
            )}
            {/* In v08 bleibt die Leiste leer bis auf die Persona und den
                Schalter fuer die Bank-Bildmarke: die Fassung wird geteilt, und
                wer sie oeffnet, soll den Tag sehen — nicht Review-Werkzeug und
                Schalter. Die Hypothese steht immer. */}
            {!v08 && (
            <button
              type="button"
              className={styles.theseBtn}
              data-an={review || undefined}
              onClick={() => { const n = !review; setzeReview(n); reviewModusSchreiben(n) }}
              aria-pressed={review}
              title={review ? 'Close review mode' : 'Open review mode'}
            >
              <MessageSquare size={15} strokeWidth={2} aria-hidden />
              Review
              {notiz.notizen.length > 0 && (
                <span className={styles.reviewZahl}>{notiz.notizen.length}</span>
              )}
            </button>
            )}
            {vollbild && !v08 && (
              <button
                type="button"
                className={styles.theseBtn}
                onClick={() => setzeZeigeThese((z) => !z)}
                aria-pressed={!zeigeThese}
                title={zeigeThese ? 'Hide hypothesis and evidence' : 'Show hypothesis and evidence'}
              >
                {zeigeThese ? (
                  <EyeOff size={15} strokeWidth={2} aria-hidden />
                ) : (
                  <Eye size={15} strokeWidth={2} aria-hidden />
                )}
                {zeigeThese ? 'Hide hypothesis' : 'Show hypothesis'}
              </button>
            )}
            {v08 && (
              <button
                type="button"
                className={styles.theseBtn}
                data-an={zeigeLogo || undefined}
                onClick={() => {
                  const n = !zeigeLogo
                  setzeZeigeLogo(n)
                  bankLogoSchreiben(n)
                }}
                aria-pressed={zeigeLogo}
                title={zeigeLogo ? 'Hide the bank logo on the screens' : 'Show the bank logo on the screens'}
              >
                {zeigeLogo ? (
                  <Eye size={15} strokeWidth={2} aria-hidden />
                ) : (
                  <EyeOff size={15} strokeWidth={2} aria-hidden />
                )}
                Bank logo
              </button>
            )}
            <span className={styles.persona}>Mara · Operations</span>
          </div>
  )

  return (
    // Das Layout haengt am MODUS, nicht am Namen der Fassung: neue
    // Fassungen erben die Buehne, ohne dass CSS-Selektoren nachgepflegt
    // werden muessen (v06 fiel sonst auf das v01-Layout zurueck).
    <div
      className={styles.root}
      data-variante={variante}
      data-buehne={buehne ? '' : undefined}
      data-vollbild={vollbild ? '' : undefined}
      data-hero={vollbild && v08 ? '' : undefined}
      data-weg={clips ? '' : undefined}
      data-ohne-these={vollbild && !zeigeThese ? '' : undefined}
      /* Kein Band ueber dem Bild in zwei Faellen: bei Stationen ohne
         Hypothese (07:00, dort steht der Text in der Glastafel) und
         waehrend eines Weges — im Uebergang traegt das Bild allein, die
         Aussage der naechsten Station kommt erst, wenn sie da ist. */
      data-ohne-kopf={heroBedienung && (!kopfText || !!clips) ? '' : undefined}
    >
      {/* Kopfzeile und Markenband sind in v08 OVERLAYS auf der Szene, nicht
          Baender darueber. Grund: liegen sie ueber dem Bild, aendert sich die
          Buehnenhoehe nicht mehr, wenn das Markenband zum Weg verschwindet —
          vorher sprang das Bild in dem Moment, in dem ein Video anfing. Und
          die Szene bekommt die ganze Flaeche bis auf die Uhrzeitleiste. */}
      {!heroBedienung && (<>
        <header className={styles.topbar}>
          {!heroBedienung && uebersichtKnopf}
          {vollbild ? (
            <h1
              className={styles.aussage}
              ref={kopfAussage}
              data-aus={!zeigeThese || undefined}
              style={v08 && theseGroesse ? { fontSize: `${theseGroesse}px` } : undefined}
            >
              {kopfText.slice(0, getippt)}
              {getippt < kopfText.length && <span className={styles.kursor} aria-hidden />}
              <span className={styles.aussageRest}>{kopfText.slice(getippt)}</span>
            </h1>
          ) : (
            <span className={styles.wordmark}>
              A day in <span>Banking Operations 2030</span>
            </span>
          )}
          {!heroBedienung && werkzeugLeiste}
        </header>
        {v08 && (
          /* Unsichtbarer Zwilling zum Messen der Textbreite bei 100 px. Er steht
             bewusst AUSSERHALB der Kopfzeile: als deren Flex-Kind drueckte er die
             Ueberschrift auf ein Drittel der Breite zusammen. */
          <span className={styles.messZwilling} ref={messRef} aria-hidden />
        )}

        {/* v08: die Marken stehen als eigenes Band zwischen Hero-Box und Szene.
            Auf dem Bild lagen sie zwangslaeufig auf dem Monitor, daneben nahmen
            sie der Szene die Breite. Waehrend eines Weges sind sie weg: dort
            traegt die Hypothese allein, und das Video bekommt die Hoehe. */}
              {/* v08: die Marken stehen in EINER Spalte RECHTS neben der Szene,
            nicht auf ihr. Mara sitzt links im Bild, der Monitor in der
            Mitte — so bleiben beide immer vollstaendig zu sehen. Die
            verstreuten Blasen der v05 bis v07 lagen zwangslaeufig auf dem
            Monitor, sobald eine vierte Marke dazukam. */}
        {vollbild && v08 && zeigeThese && !clips
          && station.art !== 'persona' && !!station.punkte?.length && (
          <aside className={styles.spalte}>
            {station.punkte.slice(0, 4).map((roh, n) => {
              const t = aktuellerText(notiz.texte, raum(station.id), `punkt${n}`, roh)
              const { marke, Symbol } = beleg(station, n)
              return (
                <div
                  key={t}
                  className={styles.spaltePunkt}
                  style={{ animationDelay: `${0.35 + n * 0.28}s` }}
                >
                  <span className={styles.blaseMarke}>
                    <Symbol size={15} strokeWidth={2} aria-hidden />
                    {marke}
                  </span>
                  <p>{mitFett(t)}</p>
                </div>
              )
            })}
          </aside>
        )}
      </>)}
      <div className={styles.layout}>
        {heroBedienung && (<>
          <header className={styles.topbar}>
            {!heroBedienung && uebersichtKnopf}
            {vollbild ? (
              <h1
                className={styles.aussage}
                ref={kopfAussage}
                data-aus={!zeigeThese || undefined}
                style={v08 && theseGroesse ? { fontSize: `${theseGroesse}px` } : undefined}
              >
                {kopfText.slice(0, getippt)}
                {getippt < kopfText.length && <span className={styles.kursor} aria-hidden />}
                <span className={styles.aussageRest}>{kopfText.slice(getippt)}</span>
              </h1>
            ) : (
              <span className={styles.wordmark}>
                A day in <span>Banking Operations 2030</span>
              </span>
            )}
            {!heroBedienung && werkzeugLeiste}
          </header>
          {v08 && (
            /* Unsichtbarer Zwilling zum Messen der Textbreite bei 100 px. Er steht
               bewusst AUSSERHALB der Kopfzeile: als deren Flex-Kind drueckte er die
               Ueberschrift auf ein Drittel der Breite zusammen. */
            <span className={styles.messZwilling} ref={messRef} aria-hidden />
          )}

          {/* v08: die Marken stehen als eigenes Band zwischen Hero-Box und Szene.
              Auf dem Bild lagen sie zwangslaeufig auf dem Monitor, daneben nahmen
              sie der Szene die Breite. Waehrend eines Weges sind sie weg: dort
              traegt die Hypothese allein, und das Video bekommt die Hoehe. */}
                {/* v08: die Marken stehen in EINER Spalte RECHTS neben der Szene,
              nicht auf ihr. Mara sitzt links im Bild, der Monitor in der
              Mitte — so bleiben beide immer vollstaendig zu sehen. Die
              verstreuten Blasen der v05 bis v07 lagen zwangslaeufig auf dem
              Monitor, sobald eine vierte Marke dazukam. */}
          {vollbild && v08 && zeigeThese && !clips
            && station.art !== 'persona' && !!station.punkte?.length && (
            <aside className={styles.spalte}>
              {station.punkte.slice(0, 4).map((roh, n) => {
                const t = aktuellerText(notiz.texte, raum(station.id), `punkt${n}`, roh)
                const { marke, Symbol } = beleg(station, n)
                return (
                  <div
                    key={t}
                    className={styles.spaltePunkt}
                    style={{ animationDelay: `${0.35 + n * 0.28}s` }}
                  >
                    <span className={styles.blaseMarke}>
                      <Symbol size={15} strokeWidth={2} aria-hidden />
                      {marke}
                    </span>
                    <p>{mitFett(t)}</p>
                  </div>
                )
              })}
            </aside>
          )}
        </>)}
        <figure className={styles.szene}>
          {/* Die Uhr liegt als Overlay oben rechts auf der Szene — sie gehoert
              zum Bild, nicht zur Bedienleiste, und bleibt auch waehrend des
              Uebergangs sichtbar. */}
          {/* Im Ruhezustand steht die Zeit schon im Panel — die Uhr liegt dann
              nur auf dem Bildschirm herum. Waehrend des Wegs ist sie dagegen
              die einzige Anzeige und laeuft auf die Zielzeit vor. */}
          {/* In v08 steht die Uhr IMMER oben rechts: im Standbild als Angabe
              (Zifferblatt und Ziffern), im Weg als Bewegung (nur das
              Zifferblatt, gross). In den aelteren Fassungen steht die Zeit im
              Textpanel daneben — dort bleibt sie im Ruhezustand weg. */}
          {(v08 || !buehne || clips) && <AnalogUhr zeit={uhrZeit} dauer={uhrDauer} />}
          {/* Solange ein Szenenbild fehlt (wird ueber gpt-image-2 erzeugt), zeigt
              die Buehne einen ruhigen Platzhalter statt eines kaputten Bildes. */}
          <div className={styles.szeneBildBox} ref={bildBox}>
            {/* Bild und UI-Overlay fahren gemeinsam in der Leinwand: die
                Kamerafahrt ist EIN transform auf diesem Rahmen, dadurch bleibt
                das Overlay in jeder Zoomstufe deckungsgleich auf dem Schirm. */}
            <div
              className={styles.leinwand}
              style={{
                ...(buehne && leinwandMass
                  ? { ...fahrt, width: leinwandMass.w, height: leinwandMass.h }
                  : fahrt),
                ...(ohneFahrt ? { transition: 'none' } : null),
              }}
            >
              <img
                key={station.id}
                className={styles.szeneBild}
                style={ausschnitt
                  ? { objectFit: ausschnitt.fit, objectPosition: ausschnitt.position }
                  : undefined}
                src={opsBild(station, variante)}
                alt={station.szene}
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.parentElement?.parentElement?.setAttribute('data-leer', '')
                }}
                onLoad={(e) => {
                  e.currentTarget.parentElement?.parentElement?.removeAttribute('data-leer')
                  setBildDa(station.id)
                }}
              />
              {/* Das scharfe Original der Oberflaeche, exakt auf der Stanzflaeche.
                  Ohne dieses Overlay wuerde die Schrift beim Heranfahren weich —
                  das Standbild traegt sie nur in Szenenaufloesung. */}
              {kasten && schirmBild && !clips && (
                <img
                  className={styles.schirmOverlay}
                  src={schirmBild}
                  alt=""
                  aria-hidden
                  style={{
                    left: `${(kasten[0] * 100).toFixed(2)}%`,
                    top: `${(kasten[1] * 100).toFixed(2)}%`,
                    width: `${((kasten[2] - kasten[0]) * 100).toFixed(2)}%`,
                    height: `${((kasten[3] - kasten[1]) * 100).toFixed(2)}%`,
                  }}
                />
              )}
              {/* Bank-Bildmarke abgedeckt (Standard) — nicht waehrend eines
                  Wegs, dort traegt das Video. */}
              {logoMaske && !clips && (
                <span
                  className={styles.logoMaske}
                  aria-hidden
                  style={{
                    left: `${(logoMaske.box[0] * 100).toFixed(3)}%`,
                    top: `${(logoMaske.box[1] * 100).toFixed(3)}%`,
                    width: `${((logoMaske.box[2] - logoMaske.box[0]) * 100).toFixed(3)}%`,
                    height: `${((logoMaske.box[3] - logoMaske.box[1]) * 100).toFixed(3)}%`,
                    background: logoMaske.farbe,
                  }}
                />
              )}
            {clips && (
                <div className={styles.uebergang} data-phase={phase}>
                  {quellen.length === clips.length &&
                    clips.map((url, n) => (
                      <video
                        key={url}
                        ref={(el) => {
                          videoRefs.current[n] = el
                        }}
                        className={styles.uebergangVideo}
                        style={ausschnitt
                          ? { objectFit: ausschnitt.fit, objectPosition: ausschnitt.position }
                          : undefined}
                        data-sichtbar={n <= aktivNr || undefined}
                        src={quellen[n]}
                        muted
                        playsInline
                        preload="auto"
                        onPlaying={() => laeuft(n)}
                        onTimeUpdate={n === clipNr ? beiZeit : undefined}
                      onEnded={n === clipNr ? clipFertig : undefined}
                        onError={n === clipNr ? clipFehler : undefined}
                      />
                    ))}
                  {phase === 'laden' &&
                    (quellen.every((q) => q.startsWith('blob:')) ? (
                      /* Wird noch geholt: echter Fortschritt. */
                      <span className={styles.ladeBalken} aria-hidden>
                        <i style={{ transform: `scaleX(${Math.max(0.02, ladestand)})` }} />
                      </span>
                    ) : (
                      /* Wird gestreamt: Restdauer unbekannt, dafür kurz. */
                      <span className={styles.ladeBalken} data-unbestimmt aria-hidden>
                        <i />
                      </span>
                    ))}
                  <button type="button" className={styles.uebergangSkip} onClick={ueberspringen}>
                    Skip
                  </button>
                </div>
              )}
              {/* v05: die drei Belege als glaeserne Sprechblasen AUF dem Bild,
                  ohne Zeiger: die Blase steht bei ihrer Stelle, ein Keil
                  darauf wirkte aufgeklebt. Beim Auftakt statt dessen rechts
                  die Vorstellung: wer ist Mara. */}
              {vollbild && !v08 && zeigeThese && !clips && station.art !== 'persona' && !!station.punkte?.length && (
                <>
                  {station.punkte.slice(0, v08 ? 4 : 3).map((roh, n) => {
                    const t = aktuellerText(notiz.texte, raum(station.id), `punkt${n}`, roh)
                    const anker = (v08 ? v08Anker(station.id) : PUNKT_ANKER[station.id] ?? [])[n]
                    if (!anker) return null
                    const slot = SLOTS[anker.slot]
                    const { marke, Symbol } = beleg(station, n)
                    return (
                      <aside
                        key={t}
                        className={styles.blase}
                        style={{
                          left: `${slot.x * 100}%`,
                          top: `${slot.y * 100}%`,
                          animationDelay: `${0.45 + n * 0.35}s`,
                        }}
                      >
                        <span className={styles.blaseMarke}>
                          <Symbol size={15} strokeWidth={2} aria-hidden />
                          {marke}
                        </span>
                        {mitFett(t)}
                      </aside>
                    )
                  })}
                </>
              )}
            </div>
              {vollbild && !clips && station.art === 'persona' && station.persona && (
              <aside className={styles.personaGlas}>
                {/* v08: keine Marke „Who is Mara" mehr — der Absatz stellt sie
                    selbst vor. Ueberschrift ist der Moment, nicht der Name. */}
                {!v08 && (
                  <span className={styles.blaseMarke}>
                    <User size={15} strokeWidth={2} aria-hidden />
                    Who is Mara
                  </span>
                )}
                <h2>{v08 ? 'Start of a new day' : station.persona.name}</h2>
                <p>{mitFett(station.persona.text)}</p>
                <ul>
                  {station.punkte?.map((t, n) => {
                    const { marke, Symbol } = BELEG_PERSONA[n] ?? BELEG_PERSONA[0]
                    return (
                      <li key={t}>
                        <span className={styles.blaseMarke}>
                          <Symbol size={14} strokeWidth={2} aria-hidden />
                          {marke}
                        </span>
                        {mitFett(t)}
                      </li>
                    )
                  })}
                </ul>
              </aside>
            )}
            <span className={styles.szenePlatzhalter} aria-hidden>
              <Clock3 size={22} strokeWidth={1.8} />
              {station.zeit}
            </span>
            {/* Waehrend eines Uebergangs laeuft der Veo-Clip ueber der Szene und
                fuehrt Mara in den naechsten Raum. Er liegt exakt im selben
                Rahmen wie das Standbild und hat dasselbe Seitenverhaeltnis —
                sonst wuerde das Bild beim Start des Videos springen. */}

          </div>
          {/* In der knappen Fassung faellt die Bildunterschrift weg: sie
              wiederholt, was der Moderator ohnehin sagt, und nimmt der Szene
              ein Drittel der Hoehe. */}
          {!knapp && (
            <figcaption className={styles.szeneText} key={`t-${station.id}`}>
              <span className={styles.szeneZeit}>
                <Clock3 size={14} strokeWidth={2.2} aria-hidden />
                {station.zeit}
              </span>
              {station.szene}
            </figcaption>
          )}
        </figure>

        {vollbild ? null : buehne ? (
          !clips && (
            <aside className={styles.aussagePanel} key={`p-${station.id}`}>
              <span className={styles.panelKopf}>
                <Clock3 size={14} strokeWidth={2.2} aria-hidden />
                {station.zeit} · {station.dimension}
              </span>
              <h1 className={styles.panelTitel} ref={kopfAussage}>
                {kopfText.slice(0, getippt)}
                {getippt < kopfText.length && <span className={styles.kursor} aria-hidden />}
                <span className={styles.aussageRest}>{kopfText.slice(getippt)}</span>
              </h1>
              {station.punkte && (
                <ul className={styles.panelPunkte}>
                  {station.punkte.map((t, n) => {
                    const { marke, Symbol } = beleg(station, n)
                    return (
                      <li key={t}>
                        <span className={styles.punktSymbol} aria-hidden>
                          <Symbol size={17} strokeWidth={1.9} />
                        </span>
                        <span className={styles.punktMarke}>{marke}</span>
                        <span className={styles.punktText}>{mitFett(t)}</span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </aside>
          )
        ) : station.art === 'persona' && station.persona ? (
          /* Auftakt: statt einer Hypothese wird die Person vorgestellt. */
          <section className={styles.panel} key={station.id}>
            <span className={styles.dimension}>{station.dimension}</span>
            <h1 className={styles.hypothese}>{station.persona.name}</h1>
            <dl className={styles.steckbrief}>
              <div>
                <dt>Age</dt>
                <dd>{station.persona.alter}</dd>
              </div>
              <div>
                <dt>With the bank</dt>
                <dd>{station.persona.jahreImHaus} years</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>{station.persona.standort}</dd>
              </div>
              <div>
                <dt>Role</dt>
                <dd>{station.persona.rolle}</dd>
              </div>
            </dl>
            <p className={styles.personaText}>{mitFett(station.persona.text)}</p>
            {!knapp && (
              <div className={styles.leitfrage}>
                <Lightbulb size={18} strokeWidth={2} aria-hidden />
                <p>What does an ordinary Monday look like for Mara in 2030?</p>
              </div>
            )}
          </section>
        ) : (
        <section className={styles.panel} key={station.id}>
          <span className={styles.dimension}>{station.dimension}</span>
          <h1 className={styles.hypothese}>{station.hypothese}</h1>

          {knapp ? (
            /* Knappe Fassung: allein die 2030-Aussage, dafuer gross. Heute,
               Wirkung und Leitfrage sind bewusst nicht im Bild — sie gehoeren
               in die Erzaehlung, nicht auf die Folie. */
            <article className={styles.nur2030}>
              <span className={styles.nur2030Label}>
                <Sparkles size="1em" strokeWidth={2.2} aria-hidden />
                2030
              </span>
              <p className={styles.nur2030Text} ref={aussage}>
                {mitFett(station.future)}
              </p>
            </article>
          ) : (
            <>
              <div className={styles.vergleich}>
                <article className={styles.block}>
                  <span className={styles.blockLabel}>
                    <History size="1em" strokeWidth={2.2} aria-hidden />
                    Today
                  </span>
                  <p className={styles.blockText}>{mitFett(station.statusQuo)}</p>
                </article>
                <article className={styles.block} data-future>
                  <span className={styles.blockLabel}>
                    <Sparkles size="1em" strokeWidth={2.2} aria-hidden />
                    2030
                  </span>
                  <p className={styles.blockText}>{mitFett(station.future)}</p>
                </article>
              </div>

              {/* Leere Wirkung kommt aus der Excel mal als Gedanken-, mal als
                  Bindestrich — beides ist kein Inhalt. */}
              {!/^[-—–\s]*$/.test(station.impact) && (
                <div className={styles.impact}>
                  <span className={styles.impactLabel}>
                    <TrendingUp size="1em" strokeWidth={2.2} aria-hidden />
                    Impact
                  </span>
                  <p className={styles.impactText}>{mitFett(station.impact)}</p>
                </div>
              )}

              {station.leitfrage && (
                <div className={styles.leitfrage}>
                  <Lightbulb size={18} strokeWidth={2} aria-hidden />
                  <p>{station.leitfrage}</p>
                </div>
              )}
            </>
          )}
        </section>
        )}
      </div>

      <footer className={styles.pager}>
        {heroBedienung && uebersichtKnopf}
        <button
          type="button"
          className={styles.navBtn}
          onClick={zurueck}
          disabled={i === 0 || !!clips}
        >
          <ArrowLeft size={15} strokeWidth={2} aria-hidden />
          Back
        </button>

        <ol className={styles.dots}>
          {stationen.map((s, n) => (
            <li key={s.id}>
              <button
                type="button"
                className={styles.dot}
                data-active={n === zeigeNr || undefined}
                data-done={n < zeigeNr || undefined}
                onClick={() => springe(n)}
                aria-label={`${s.zeit}, ${s.dimension}`}
                aria-current={n === zeigeNr ? 'step' : undefined}
              >
                <span className={styles.dotZeit}>{s.zeit}</span>
              </button>
            </li>
          ))}
        </ol>

        <button
          type="button"
          className={`${styles.navBtn} ${styles.navBtnPrimary}`}
          onClick={vor}
          disabled={i === letzte || !!clips}
        >
          Next
          <ArrowRight size={15} strokeWidth={2} aria-hidden />
        </button>
        {heroBedienung && werkzeugLeiste}
      </footer>

      {review && (
        <ReviewPanel
          stationId={raum(station.id)}
          zeit={station.zeit}
          autor={autor}
          setzeAutor={setzeAutor}
          notizen={notiz.notizen}
          persona={station.art === 'persona'}
          texte={notiz.texte}
          original={{
            hypothese: station.art === 'persona'
              ? station.persona?.kopfzeile ?? ''
              : station.hypothese,
            punkt0: station.punkte?.[0] ?? '',
            punkt1: station.punkte?.[1] ?? '',
            punkt2: station.punkte?.[2] ?? '',
            punkt3: station.punkte?.[3] ?? '',
          }}
          // Der Auftakt hat keine eigenen v08-Belege — dort bleiben die
          // Persona-Felder stehen, sonst faende man im Panel nur noch
          // die Kopfzeile zum Bearbeiten.
          felder={v08 && v08Belege(station.id).length ? v08Felder(station.id) : undefined}
          geteilt={notiz.geteilt}
          anlegen={notiz.anlegen}
          aendern={notiz.aendern}
          loeschen={notiz.loeschen}
          bestaetigen={notiz.bestaetigen}
          textSetzen={notiz.textSetzen}
          schliessen={() => { setzeReview(false); reviewModusSchreiben(false) }}
        />
      )}
    </div>
  )
}
