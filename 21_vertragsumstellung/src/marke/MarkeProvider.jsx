import { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { ladeMarke, speichereMarke, markenVariablen, STANDARD_MARKE, setzeMarkePreset } from './marke'
import { mitUebergang } from '../lib/bewegung'

const MarkeKontext = createContext(null)

export function MarkeProvider({ children }) {
  const [marke, setMarke] = useState(ladeMarke)
  // Letzter Stand von Token und Thema: nur wenn sich davon etwas ändert,
  // läuft der Wechsel als View Transition (Vorlage, Farbe, Hell/Dunkel).
  // Beim ersten Schreiben und bei reinen Text- oder Dichteänderungen im
  // Studio bliebe ein Crossfade je Tastendruck nur im Weg.
  const letztesRef = useRef(null)

  // Markentoken auf den Wurzelknoten schreiben
  useEffect(() => {
    const wurzel = document.documentElement
    const vars = markenVariablen(marke)
    const signatur = JSON.stringify(vars) + '|' + marke.theme

    const schreiben = () => {
      for (const [k, v] of Object.entries(vars)) wurzel.style.setProperty(k, v)
      if (marke.theme === 'auto') wurzel.removeAttribute('data-theme')
      else wurzel.setAttribute('data-theme', marke.theme)
    }
    if (letztesRef.current !== null && letztesRef.current !== signatur) mitUebergang(schreiben)
    else schreiben()
    letztesRef.current = signatur

    if (marke.dichte === 'kompakt') wurzel.setAttribute('data-dichte', 'kompakt')
    else wurzel.removeAttribute('data-dichte')

    document.title = `${marke.produktName} — ${marke.mandantKurz}`
    speichereMarke(marke)
  }, [marke])

  const aendere = useCallback((teil) => {
    setMarke(m => ({ ...m, ...teil }))
  }, [])

  const aendereSprache = useCallback((teil) => {
    setMarke(m => ({ ...m, sprache: { ...m.sprache, ...teil } }))
  }, [])

  const setzePreset = useCallback((presetId) => {
    setMarke(m => setzeMarkePreset(m, presetId))
  }, [])

  const zuruecksetzen = useCallback(() => setMarke({ ...STANDARD_MARKE }), [])

  const wert = useMemo(() => ({
    marke,
    sprache: marke.sprache,
    aendere,
    aendereSprache,
    setzePreset,
    zuruecksetzen,
    setzeMarke: setMarke,
  }), [marke, aendere, aendereSprache, setzePreset, zuruecksetzen])

  return <MarkeKontext.Provider value={wert}>{children}</MarkeKontext.Provider>
}

export function useMarke() {
  const k = useContext(MarkeKontext)
  if (!k) throw new Error('useMarke muss innerhalb von MarkeProvider verwendet werden')
  return k
}

/** Nur die Sprachbausteine - der häufigste Zugriff */
export function useSprache() {
  return useMarke().sprache
}
