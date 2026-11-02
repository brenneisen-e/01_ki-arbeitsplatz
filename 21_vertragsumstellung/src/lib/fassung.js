// ============================================================
// FASSUNGEN
//
// Eine Fassung ist ein benannter, gespeicherter Hebelsatz mit
// Verhandlungsstand. Sie ist die gemeinsame Klammer beider
// Werkzeuge: was in der Simulation entschieden wird, liegt im
// Umstellungstool sofort auf dem Tisch.
// ============================================================

import { useCallback, useEffect, useMemo, useState } from 'react'
import { standardHebel, HEBEL, HEBEL_INDEX } from './hebel'
import { SZENARIO_INDEX } from './szenarien'

// v2 seit dem Umbau auf Simulationskasten und Akten-Dashboard: die Hebel
// tragen neue Bausteine (Staffelschwellen und -sätze, Normierung, neue
// Zuschüsse). Ältere Speicherstände starten deshalb frisch mit den
// Grundfassungen statt mit einem halb gewanderten Hebelsatz.
const SCHLUESSEL = 'vg.fassungen.v2'
const AKTIV_SCHLUESSEL = 'vg.fassung.aktiv.v2'

export const FASSUNG_STATUS = [
  { id: 'entwurf', label: 'Entwurf', ton: 'neutral' },
  { id: 'abstimmung', label: 'In Abstimmung', ton: 'info' },
  { id: 'verhandlung', label: 'In Verhandlung', ton: 'warnung' },
  { id: 'freigegeben', label: 'Freigegeben', ton: 'positiv' },
  { id: 'verworfen', label: 'Verworfen', ton: 'negativ' },
]

export const STATUS_INDEX = Object.fromEntries(FASSUNG_STATUS.map(s => [s.id, s]))

let zaehler = 0
function neueId() {
  zaehler += 1
  return `f${zaehler.toString(36)}${Math.trunc(performance.now()).toString(36)}`
}

export function neueFassung({ name, hebel, status = 'entwurf', notiz = '', stand }) {
  return {
    id: neueId(),
    name: name || 'Neue Fassung',
    hebel: { ...(hebel || standardHebel()) },
    status,
    notiz,
    zugestaendnisse: [],
    geaendert: stand || null,
  }
}

function grundbestand(stand) {
  return [
    neueFassung({ name: 'Zielmodell A — budgetneutral bis 2030', hebel: SZENARIO_INDEX.neutral2030.hebel, status: 'abstimmung', stand,
      notiz: 'Ausgangsvorschlag für die Fachkonzeption. Verlagerung von Abschluss- in laufende und Bestandsvergütung; kein Haus erhält weniger als heute, Gewinner erhalten ein Viertel ihres Gewinns von Anfang an.' }),
    neueFassung({ name: 'Zielmodell B — verbundfreundlich', hebel: SZENARIO_INDEX.verbundfreundlich.hebel, status: 'verhandlung', stand,
      notiz: 'Verhandlungsfassung für den Beirat. Höherer Kleininstitutssockel, milde Journey-Teilung.' }),
    neueFassung({ name: 'Vergleichsfassung — Aktivierung', hebel: SZENARIO_INDEX.aktivierung.hebel, status: 'entwurf', stand,
      notiz: 'Bewusst über der Budgetleitplanke. Dient als Gegenpol in der Gremiendiskussion.' }),
  ]
}

function lade(stand) {
  try {
    const roh = localStorage.getItem(SCHLUESSEL)
    if (roh) {
      const liste = JSON.parse(roh)
      if (Array.isArray(liste) && liste.length) {
        return liste.map(f => ({ ...f, hebel: { ...standardHebel(), ...f.hebel } }))
      }
    }
  } catch { /* Speicher nicht verfügbar */ }
  return grundbestand(stand)
}

/**
 * Zustand aller Fassungen inklusive Speicherung und Rücknahme.
 * Der Zeitstempel wird von außen gereicht, damit die Erzeugung
 * der Grundfassungen deterministisch bleibt.
 */
export function useFassungen(stand) {
  const [fassungen, setFassungen] = useState(() => lade(stand))
  const [aktivId, setAktivId] = useState(() => {
    try { return localStorage.getItem(AKTIV_SCHLUESSEL) || null } catch { return null }
  })
  const [rueckname, setRueckname] = useState(null)

  useEffect(() => {
    try { localStorage.setItem(SCHLUESSEL, JSON.stringify(fassungen)) } catch { /* egal */ }
  }, [fassungen])

  const aktiv = useMemo(
    () => fassungen.find(f => f.id === aktivId) || fassungen[0],
    [fassungen, aktivId])

  useEffect(() => {
    if (aktiv?.id) {
      try { localStorage.setItem(AKTIV_SCHLUESSEL, aktiv.id) } catch { /* egal */ }
    }
  }, [aktiv?.id])

  const waehle = useCallback((id) => setAktivId(id), [])

  const aendereHebel = useCallback((id, wert) => {
    setFassungen(liste => liste.map(f =>
      f.id === (aktivId || liste[0]?.id)
        ? { ...f, hebel: { ...f.hebel, [id]: wert }, geaendert: stand }
        : f))
  }, [aktivId, stand])

  const setzeHebel = useCallback((neu) => {
    setFassungen(liste => liste.map(f =>
      f.id === (aktivId || liste[0]?.id)
        ? { ...f, hebel: { ...f.hebel, ...neu }, geaendert: stand }
        : f))
  }, [aktivId, stand])

  const aendereFassung = useCallback((id, teil) => {
    setFassungen(liste => liste.map(f => f.id === id ? { ...f, ...teil, geaendert: stand } : f))
  }, [stand])

  const anlegen = useCallback((vorlage) => {
    const f = neueFassung({ ...vorlage, stand })
    setFassungen(liste => [...liste, f])
    setAktivId(f.id)
    return f
  }, [stand])

  const duplizieren = useCallback((id) => {
    setFassungen(liste => {
      const quelle = liste.find(f => f.id === id)
      if (!quelle) return liste
      const kopie = neueFassung({ name: `${quelle.name} (Kopie)`, hebel: quelle.hebel, notiz: quelle.notiz, stand })
      setAktivId(kopie.id)
      return [...liste, kopie]
    })
  }, [stand])

  const loeschen = useCallback((id) => {
    setFassungen(liste => {
      const weg = liste.find(f => f.id === id)
      const rest = liste.filter(f => f.id !== id)
      if (!rest.length) return liste
      if (weg) setRueckname({ art: 'loeschen', fassung: weg })
      if (id === aktivId) setAktivId(rest[0].id)
      return rest
    })
  }, [aktivId])

  const rueckgaengig = useCallback(() => {
    setRueckname(r => {
      if (r?.art === 'loeschen') setFassungen(liste => [...liste, r.fassung])
      return null
    })
  }, [])

  return {
    fassungen, aktiv, waehle, aendereHebel, setzeHebel, aendereFassung,
    anlegen, duplizieren, loeschen, rueckname, rueckgaengig, setFassungen,
  }
}

// --------------------------------------------------- Import und Export

export function fassungAlsJson(fassung) {
  return JSON.stringify({
    schema: 'verguetungswerk.fassung.v1',
    name: fassung.name,
    status: fassung.status,
    notiz: fassung.notiz,
    hebel: fassung.hebel,
  }, null, 2)
}

export function fassungAusJson(text) {
  const daten = JSON.parse(text)
  if (daten.schema !== 'verguetungswerk.fassung.v1') {
    throw new Error('Unbekanntes Format. Erwartet wird eine Fassungsdatei dieses Werkzeugs.')
  }
  const hebel = { ...standardHebel() }
  let uebernommen = 0
  for (const [k, v] of Object.entries(daten.hebel || {})) {
    if (HEBEL_INDEX[k] && Number.isFinite(v)) { hebel[k] = v; uebernommen += 1 }
    else if (!HEBEL_INDEX[k] && Number.isFinite(v)) { hebel[k] = v }
  }
  return { name: daten.name || 'Importierte Fassung', status: daten.status || 'entwurf', notiz: daten.notiz || '', hebel, uebernommen }
}

/** Unterschiede zweier Hebelsätze, nach Gruppe sortiert */
export function hebelUnterschiede(a, b) {
  return HEBEL
    .map(def => ({ def, a: a[def.id] ?? def.standard, b: b[def.id] ?? def.standard }))
    .filter(x => Math.abs(x.a - x.b) > 1e-9)
}

/** Abweichungen einer Fassung vom Vorschlagswert */
export function abweichungenVonStandard(hebel) {
  return HEBEL.filter(def => Math.abs((hebel[def.id] ?? def.standard) - def.standard) > 1e-9)
}
