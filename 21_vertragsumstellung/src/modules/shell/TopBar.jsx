import { useState, useRef, useEffect } from 'react'
import {
  Search, Sun, Moon, MonitorSmartphone, Palette, ChevronDown, Check,
  SlidersHorizontal, Building2, LayoutDashboard, Layers, BookOpen, Rows3,
} from 'lucide-react'
import Wortmarke from '../../marke/Wortmarke'
import { useMarke } from '../../marke/MarkeProvider'
import { Btn, Tip } from '../../ui/basis'
import { gesamtTon, lageSatz } from '../../ui/Waage'
import { STATUS_INDEX } from '../../lib/fassung'
import './topbar.css'

/* Uniform führt kein ⌘ (U+2318); auf Windows und Linux war das Zeichen
   ohnehin das falsche Kürzel. */
const TASTENKUERZEL =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)
    ? 'Cmd K'
    : 'Strg K'

const NAV = [
  { id: 'start', label: 'Lagebild', ikone: LayoutDashboard, taste: '0' },
  { id: 'simulation', label: 'Simulationskasten', ikone: SlidersHorizontal, taste: '1' },
  { id: 'umstellung', label: 'Umstellungstool', ikone: Building2, taste: '2' },
  { id: 'fassungen', label: 'Fassungen', ikone: Layers },
]

function FassungsWaehler({ fassungen, navigiere, lage }) {
  const [offen, setOffen] = useState(false)
  const ref = useRef(null)
  // Die Sichten stehen nur noch im Steuerblock; die Topbar trägt von der
  // Gesamtlage allein den Ton als Punkt (beide Budget-Sichten, Barwert je
  // Jahrgang nachrichtlich), der Satz dazu liegt im title.
  const lageTon = gesamtTon(lage.eingeschwungen, lage.startjahr)

  useEffect(() => {
    if (!offen) return
    const auf = (e) => { if (ref.current && !ref.current.contains(e.target)) setOffen(false) }
    document.addEventListener('mousedown', auf)
    return () => document.removeEventListener('mousedown', auf)
  }, [offen])

  const aktiv = fassungen.aktiv
  const status = STATUS_INDEX[aktiv?.status]

  return (
    <div className="vg-topbar-waehler" style={{ position: 'relative', flex: '0 1 auto', minWidth: 0, maxWidth: '100%' }} ref={ref}>
      {/* Der Knopf kappt über min-width 0 selbst; die feste Obergrenze gilt
          nur bis 1280 px (topbar.css), darüber steht der Name ungekürzt. */}
      <button
        type="button"
        className="vg-btn"
        onClick={() => setOffen(o => !o)}
        style={{ flex: '0 1 auto', minWidth: 0, maxWidth: '100%' }}
        title="Fassung wechseln"
      >
        <Rows3 size={14} strokeWidth={1.9} style={{ opacity: .6, flex: 'none' }} />
        <span className="vg-waage-kompakt-punkt" data-ton={lageTon} title={lageSatz(lage)} aria-label={`Gesamtlage: ${lageSatz(lage)}`} role="img" />
        <span className="vg-kappen" style={{ flex: '0 1 auto', maxWidth: 240 }}>{aktiv?.name}</span>
        {status && <span className="vg-badge vg-topbar-schmal-weg" data-ton={status.ton}>{status.label}</span>}
        <ChevronDown size={13} strokeWidth={2.2} style={{ opacity: .55, flex: 'none', transform: offen ? 'rotate(180deg)' : 'none', transition: 'transform var(--vg-schnell)' }} />
      </button>

      {offen && (
        <div
          style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 'var(--vg-z-popover)',
            width: 330, padding: 6, borderRadius: 'var(--vg-r-lg)',
            background: 'var(--vg-flaeche)', border: '1px solid var(--vg-rand-stark)',
            boxShadow: 'var(--vg-s4)',
          }}
        >
          <div className="vg-palette-gruppe">Fassungen</div>
          {fassungen.fassungen.map(fa => {
            const st = STATUS_INDEX[fa.status]
            return (
              <button
                key={fa.id}
                type="button"
                className="vg-palette-eintrag"
                data-aktiv={fa.id === aktiv?.id}
                onClick={() => { fassungen.waehle(fa.id); setOffen(false) }}
              >
                <span className="vg-fuellen" style={{ minWidth: 0 }}>
                  <span className="vg-kappen vg-stark" style={{ display: 'block' }}>{fa.name}</span>
                  {st && <span className="vg-t-xs vg-schwach">{st.label}</span>}
                </span>
                {fa.id === aktiv?.id && <Check size={14} strokeWidth={2.4} className="vg-marke" />}
              </button>
            )
          })}
          <hr className="vg-trenner" style={{ margin: '6px 4px' }} />
          <button type="button" className="vg-palette-eintrag" onClick={() => { navigiere('fassungen'); setOffen(false) }}>
            <Layers size={14} strokeWidth={1.9} style={{ opacity: .6 }} />
            Fassungen verwalten und vergleichen
          </button>
        </div>
      )}
    </div>
  )
}

function ThemaWaehler() {
  const { marke, aendere } = useMarke()
  const naechstes = { auto: 'light', light: 'dark', dark: 'auto' }
  const Ikone = marke.theme === 'dark' ? Moon : marke.theme === 'light' ? Sun : MonitorSmartphone
  const text = marke.theme === 'dark' ? 'Dunkel' : marke.theme === 'light' ? 'Hell' : 'Systemeinstellung'
  return (
    <Tip text={`Darstellung: ${text}`}>
      <Btn variante="still" nurIkone ikone={Ikone} onClick={() => aendere({ theme: naechstes[marke.theme] })} aria-label={`Darstellung umschalten, aktuell ${text}`} />
    </Tip>
  )
}

export default function TopBar({ route, navigiere, portfolio, fassungen, onPalette, onStudio }) {
  return (
    <header className="vg-topbar vg-nicht-drucken">
      <Wortmarke />

      <nav className="vg-nav" aria-label="Hauptbereiche">
        {NAV.map(n => (
          <button
            key={n.id}
            type="button"
            className="vg-nav-eintrag"
            aria-current={route.seite === n.id ? 'page' : undefined}
            onClick={() => navigiere(n.id)}
          >
            <n.ikone size={14} strokeWidth={1.9} />
            {n.label}
          </button>
        ))}
      </nav>

      <div className="vg-topbar-mitte" style={{ justifyContent: 'flex-end' }}>
        <FassungsWaehler
          fassungen={fassungen}
          navigiere={navigiere}
          lage={{
            eingeschwungen: portfolio.delta.prozent,
            barwert: portfolio.barwert.prozent,
            startjahr: portfolio.kumuliert?.prozent ?? 0,
          }}
        />
      </div>

      <div className="vg-topbar-rechts">
        <Tip text="Suchen und Befehle · Strg + K">
          <Btn variante="still" ikone={Search} onClick={onPalette} groesse="sm">
            <span className="vg-taste vg-topbar-schmal-weg">{TASTENKUERZEL}</span>
          </Btn>
        </Tip>
        <ThemaWaehler />
        <Tip text="Marken-Studio: White-Label-Konfiguration">
          <Btn variante="still" nurIkone ikone={Palette} onClick={onStudio} aria-label="Marken-Studio öffnen" />
        </Tip>
        <Tip text="Grundlagen, Annahmen und Formeln">
          <Btn variante="still" nurIkone ikone={BookOpen} className="vg-topbar-grundlagen" onClick={() => navigiere('grundlagen')} aria-label="Grundlagen" />
        </Tip>
      </div>
    </header>
  )
}
