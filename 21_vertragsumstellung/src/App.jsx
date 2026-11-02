import { useState, useEffect, useMemo, useCallback, useDeferredValue } from 'react'
import { MarkeProvider } from './marke/MarkeProvider'
import TopBar from './modules/shell/TopBar'
import Kontextleiste from './modules/shell/Kontextleiste'
import Kommandopalette from './modules/shell/Kommandopalette'
import Startseite from './modules/shell/Startseite'
import Grundlagen from './modules/shell/Grundlagen'
import MakroTool from './modules/makro/MakroTool'
import UmstellungTool from './modules/umstellung/UmstellungTool'
import Fassungsverwaltung from './modules/shell/Fassungsverwaltung'
import MarkenStudio from './marke/MarkenStudio'
import Tafelprobe from './modules/shell/Tafelprobe'
import { EINHEITEN, EINHEIT_INDEX, einheit as findeEinheit } from './data/einheiten'
import { berechnePortfolio } from './lib/modell'
import { useFassungen } from './lib/fassung'
import { mitUebergang } from './lib/bewegung'

const HEUTE = new Date().toISOString().slice(0, 10)

// ---------------------------------------------------------- Demo-Reset
// „#/start?frisch“ und der Palettenbefehl „Demo zurücksetzen“ löschen den
// Fassungsstand der Generalprobe. lib/fassung.js exportiert seine Schlüssel
// nicht; sie beginnen alle mit „vg.fassung“ (vg.fassungen.v2, vg.fassung.aktiv.v2).
// Die Marke (vg.marke.v2) bleibt absichtlich stehen.
const DEMO_SCHLUESSEL = /^vg\.fassung/

function frischGewuenscht() {
  return /\?frisch(?:[&=]|$)/.test(window.location.hash)
}

function loescheDemoStand() {
  try {
    Object.keys(localStorage)
      .filter(k => DEMO_SCHLUESSEL.test(k))
      .forEach(k => localStorage.removeItem(k))
  } catch { /* Speicher nicht verfügbar */ }
}

function demoZuruecksetzen() {
  loescheDemoStand()
  window.location.replace('#/start')
  window.location.reload()
}

// Beim Seitenaufruf mit ?frisch wird gelöscht, bevor irgendein Zustand aus
// dem Speicher gelesen wurde — dann genügt der bereinigte Hash, kein Reload.
if (typeof window !== 'undefined' && frischGewuenscht()) {
  loescheDemoStand()
  window.location.replace('#/start')
}

// ---------------------------------------------------------- Beispielhaus
// „#/simulation?haus=<kennung>“ öffnet den Simulationskasten mit einer
// gesetzten Einheit. Neben der Kennung (leipzig, osd) gelten Kurzname und
// Sitz (Leipzig) sowie die gebräuchlichen Kürzel aus Notizen und Links,
// die keine Kennung im Datensatz sind.
const HAUS_KUERZEL = { lpz: 'leipzig', dd: 'osd' }

const kennt = (obj, k) => Object.prototype.hasOwnProperty.call(obj, k)

function beispielhausAus(param) {
  if (!param) return null
  const p = param.trim().toLowerCase()
  if (kennt(EINHEIT_INDEX, p)) return p
  const treffer = EINHEITEN.find(e =>
    (e.kurz || '').toLowerCase() === p || (e.sitz || '').toLowerCase() === p)
  if (treffer) return treffer.id
  return kennt(HAUS_KUERZEL, p) && kennt(EINHEIT_INDEX, HAUS_KUERZEL[p]) ? HAUS_KUERZEL[p] : null
}

function leseRoute() {
  const hash = window.location.hash
  const roh = hash.replace(/^#\/?/, '').replace(/\?.*$/, '')
  const teile = roh.split('/').filter(Boolean)
  const abfrage = new URLSearchParams(hash.includes('?') ? hash.slice(hash.indexOf('?') + 1) : '')
  return {
    seite: teile[0] || 'start',
    id: teile[1] || null,
    unter: teile[2] || null,
    haus: beispielhausAus(abfrage.get('haus')),
  }
}

function Inhalt() {
  const [route, setRoute] = useState(leseRoute)
  const [paletteOffen, setPaletteOffen] = useState(false)
  const [studioOffen, setStudioOffen] = useState(false)

  const f = useFassungen(HEUTE)
  const hebel = f.aktiv?.hebel

  useEffect(() => {
    const auf = () => {
      // ?frisch zur Laufzeit: der Zustand ist schon geladen, also neu laden.
      if (frischGewuenscht()) { demoZuruecksetzen(); return }
      setRoute(leseRoute())
    }
    window.addEventListener('hashchange', auf)
    if (!window.location.hash) window.location.hash = '#/start'
    return () => window.removeEventListener('hashchange', auf)
  }, [])

  // Routenwechsel als View Transition: Root-Crossfade, der Steuerblock
  // morpht über seinen view-transition-name. Ohne Browserunterstützung
  // oder bei reduzierter Bewegung läuft fn() sofort und identisch.
  const navigiere = useCallback((pfad) => {
    mitUebergang(() => {
      window.location.hash = `#/${pfad}`
      window.scrollTo({ top: 0, behavior: 'instant' })
    })
  }, [])

  // Tastaturkürzel
  useEffect(() => {
    const auf = (e) => {
      const inFeld = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); setPaletteOffen(o => !o); return
      }
      if (inFeld) return
      if (e.key === '1') navigiere('simulation')
      if (e.key === '2') navigiere('umstellung')
      if (e.key === '0') navigiere('start')
      if (e.key === '?') navigiere('grundlagen')
    }
    document.addEventListener('keydown', auf)
    return () => document.removeEventListener('keydown', auf)
  }, [navigiere])

  // Zentrale Berechnung: eine Quelle für beide Werkzeuge
  const portfolio = useMemo(
    () => (hebel ? berechnePortfolio(EINHEITEN, hebel) : null),
    [hebel])

  // Teure Nebenrechnungen laufen verzögert, damit Regler flüssig bleiben
  const ruhigesPortfolio = useDeferredValue(portfolio)

  const gewaehlteEinheit = route.seite === 'umstellung' && route.id ? findeEinheit(route.id) : null

  if (!portfolio) return null

  const gemeinsam = {
    portfolio, ruhigesPortfolio, hebel, fassungen: f, navigiere, route,
    beispielhausId: route.haus,
  }

  return (
    <div className="vg-app">
      <TopBar
        route={route}
        navigiere={navigiere}
        portfolio={portfolio}
        fassungen={f}
        onPalette={() => setPaletteOffen(true)}
        onStudio={() => setStudioOffen(true)}
      />
      <Kontextleiste {...gemeinsam} einheit={gewaehlteEinheit} />

      <main className="vg-inhalt">
        {route.seite === 'start' && <Startseite {...gemeinsam} />}
        {route.seite === 'simulation' && <MakroTool {...gemeinsam} />}
        {route.seite === 'umstellung' && (
          <UmstellungTool {...gemeinsam} einheitId={route.id} onPalette={() => setPaletteOffen(true)} />
        )}
        {route.seite === 'fassungen' && <Fassungsverwaltung {...gemeinsam} />}
        {route.seite === 'grundlagen' && <Grundlagen {...gemeinsam} />}
        {/* Sichtprüfung der Tafelsprache: nur im Hash erreichbar, nicht in der Navigation. */}
        {route.seite === 'tafelprobe' && <Tafelprobe {...gemeinsam} />}
      </main>

      <Kommandopalette
        offen={paletteOffen}
        onSchliessen={() => setPaletteOffen(false)}
        navigiere={navigiere}
        fassungen={f}
        onStudio={() => setStudioOffen(true)}
        onDemoReset={demoZuruecksetzen}
      />
      <MarkenStudio offen={studioOffen} onSchliessen={() => setStudioOffen(false)} />
    </div>
  )
}

export default function App() {
  return (
    <MarkeProvider>
      <Inhalt />
    </MarkeProvider>
  )
}
