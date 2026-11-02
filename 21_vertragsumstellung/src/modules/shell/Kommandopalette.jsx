import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  Search, SlidersHorizontal, Building2, Layers, BookOpen, Palette, LayoutDashboard, CornerDownLeft, RotateCcw, Home,
} from 'lucide-react'
import { EINHEITEN, KANAL_LABEL } from '../../data/einheiten'
import { HEBEL } from '../../lib/hebel'
import { SZENARIEN } from '../../lib/szenarien'

export default function Kommandopalette({ offen, onSchliessen, navigiere, fassungen, onStudio, onDemoReset }) {
  const [suche, setSuche] = useState('')
  const [index, setIndex] = useState(0)
  // „Beispielhaus wählen …“ schaltet die Palette in einen zweiten Schritt:
  // die Liste zeigt dann nur Einheiten, Enter öffnet den Kasten mit dem
  // gewählten Haus. Esc führt zurück zur vollen Liste, nicht nach draußen.
  const [modus, setModus] = useState('alle')
  const eingabeRef = useRef(null)

  useEffect(() => {
    if (offen) {
      setSuche('')
      setIndex(0)
      setModus('alle')
      setTimeout(() => eingabeRef.current?.focus(), 20)
    }
  }, [offen])

  const beispielhausWaehlen = useCallback(() => {
    setModus('haus')
    setSuche('')
    setIndex(0)
    setTimeout(() => eingabeRef.current?.focus(), 20)
  }, [])

  const gruppen = useMemo(() => {
    const s = suche.trim().toLowerCase()
    const passt = (t) => !s || t.toLowerCase().includes(s)

    if (modus === 'haus') {
      const haeuser = EINHEITEN
        .filter(e => passt(`${e.name} ${e.kurz} ${e.sitz} ${e.region}`))
        .map(e => ({
          id: `bh-${e.id}`, label: e.name, neben: `${KANAL_LABEL[e.kanal] || ''} · ${e.sitz}`,
          ikone: Home, tun: () => navigiere(`simulation?haus=${e.id}`),
        }))
      return haeuser.length ? [{ titel: 'Beispielhaus für den Simulationskasten', eintraege: haeuser }] : []
    }

    const befehle = [
      { id: 'nav-start', label: 'Lagebild öffnen', ikone: LayoutDashboard, tun: () => navigiere('start') },
      { id: 'nav-sim', label: 'Simulationskasten öffnen', ikone: SlidersHorizontal, tun: () => navigiere('simulation'), neben: '1' },
      // Bleibt offen: der zweite Schritt listet die Einheiten (siehe modus).
      { id: 'sim-haus', label: 'Beispielhaus wählen …', ikone: Home, tun: beispielhausWaehlen, bleibtOffen: true },
      { id: 'nav-um', label: 'Umstellungstool öffnen', ikone: Building2, tun: () => navigiere('umstellung'), neben: '2' },
      { id: 'nav-fa', label: 'Fassungen verwalten', ikone: Layers, tun: () => navigiere('fassungen') },
      // Gleiche Wirkung wie #/start?frisch: Fassungsstand der Generalprobe löschen.
      ...(onDemoReset ? [{ id: 'demo-frisch', label: 'Demo zurücksetzen', ikone: RotateCcw, tun: onDemoReset, neben: 'Ausgangsfassung' }] : []),
      { id: 'nav-gr', label: 'Grundlagen und Formeln', ikone: BookOpen, tun: () => navigiere('grundlagen'), neben: '?' },
      { id: 'studio', label: 'Marken-Studio öffnen', ikone: Palette, tun: onStudio },
    ].filter(b => passt(b.label))

    const einheiten = EINHEITEN
      .filter(e => passt(`${e.name} ${e.sitz} ${e.region}`))
      .slice(0, 8)
      .map(e => ({
        id: `e-${e.id}`, label: e.name, neben: e.sitz,
        ikone: Building2, tun: () => navigiere(`umstellung/${e.id}`),
      }))

    const szenarien = SZENARIEN
      .filter(z => passt(`${z.name} ${z.beschreibung}`))
      .map(z => ({
        id: `s-${z.id}`, label: `Szenario: ${z.name}`, neben: z.kurz,
        ikone: SlidersHorizontal,
        tun: () => { fassungen.setzeHebel(z.hebel); navigiere('simulation') },
      }))

    const fassungsliste = fassungen.fassungen
      .filter(f => passt(f.name))
      .map(f => ({
        id: `f-${f.id}`, label: `Fassung: ${f.name}`, ikone: Layers,
        tun: () => fassungen.waehle(f.id),
      }))

    const regler = HEBEL
      .filter(h => s && passt(`${h.label} ${h.hinweis}`))
      .slice(0, 6)
      .map(h => ({
        id: `h-${h.id}`, label: `Regler: ${h.label}`, neben: h.kurz,
        ikone: SlidersHorizontal, tun: () => navigiere('simulation'),
      }))

    return [
      { titel: 'Befehle', eintraege: befehle },
      { titel: 'Einheiten', eintraege: einheiten },
      { titel: 'Szenarien', eintraege: szenarien },
      { titel: 'Fassungen', eintraege: fassungsliste },
      { titel: 'Regler', eintraege: regler },
    ].filter(g => g.eintraege.length > 0)
  }, [suche, modus, navigiere, fassungen, onStudio, onDemoReset, beispielhausWaehlen])

  const flach = useMemo(() => gruppen.flatMap(g => g.eintraege), [gruppen])

  useEffect(() => { setIndex(0) }, [suche])

  if (!offen) return null

  const ausfuehren = (e) => {
    if (!e) return
    e.tun?.()
    if (!e.bleibtOffen) onSchliessen()
  }

  const zurueckOderSchliessen = () => {
    if (modus === 'haus') { setModus('alle'); setSuche(''); setIndex(0) }
    else onSchliessen()
  }

  return createPortal(
    <>
      <div className="vg-schleier vg-nicht-drucken" onClick={onSchliessen} />
      <div
        className="vg-palette vg-nicht-drucken"
        role="dialog"
        aria-modal="true"
        aria-label="Befehle und Suche"
        onKeyDown={e => {
          if (e.key === 'ArrowDown') { e.preventDefault(); setIndex(i => Math.min(flach.length - 1, i + 1)) }
          if (e.key === 'ArrowUp') { e.preventDefault(); setIndex(i => Math.max(0, i - 1)) }
          if (e.key === 'Enter') { e.preventDefault(); ausfuehren(flach[index]) }
          if (e.key === 'Escape') { e.preventDefault(); zurueckOderSchliessen() }
        }}
      >
        <div className="vg-palette-eingabe">
          {modus === 'haus'
            ? <Home size={17} strokeWidth={2} style={{ color: 'var(--vg-text-3)' }} />
            : <Search size={17} strokeWidth={2} style={{ color: 'var(--vg-text-3)' }} />}
          <input
            ref={eingabeRef}
            value={suche}
            onChange={e => setSuche(e.target.value)}
            placeholder={modus === 'haus' ? 'Beispielhaus suchen — Name, Sitz oder Region' : 'Einheit, Szenario, Regler oder Befehl suchen'}
            aria-label={modus === 'haus' ? 'Beispielhaus suchen' : 'Suche'}
          />
          <span className="vg-taste" title={modus === 'haus' ? 'Zurück zur vollen Liste' : 'Schließen'}>Esc</span>
        </div>

        <div className="vg-palette-liste">
          {flach.length === 0 && (
            <div className="vg-leer" style={{ padding: 26 }}>
              <span className="vg-t-sm">Nichts gefunden.</span>
            </div>
          )}
          {gruppen.map(g => (
            <div key={g.titel}>
              <div className="vg-palette-gruppe">{g.titel}</div>
              {g.eintraege.map(e => {
                const i = flach.indexOf(e)
                return (
                  <button
                    key={e.id}
                    type="button"
                    className="vg-palette-eintrag"
                    data-aktiv={i === index}
                    onMouseEnter={() => setIndex(i)}
                    onClick={() => ausfuehren(e)}
                  >
                    <e.ikone size={15} strokeWidth={1.9} style={{ opacity: .6, flex: 'none' }} />
                    <span className="vg-kappen">{e.label}</span>
                    {e.neben && <span className="vg-palette-neben">{e.neben}</span>}
                    {i === index && <CornerDownLeft size={13} strokeWidth={2} style={{ opacity: .5 }} />}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </>,
    document.body,
  )
}
