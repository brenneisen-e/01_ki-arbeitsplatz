import { useMemo, useState } from 'react'
import { ArrowLeft, GitCompare } from 'lucide-react'
import { Karte, KarteKopf, KarteKoerper, Btn, Delta, Ampel, Leer, Segment, Aufklapp } from '../../ui/basis'
import { PaarVergleich, bauteilPaare } from '../../charts'
import { berechneEinzel } from '../../lib/modell'
import { euro, prozent, prozentDelta, zahl } from '../../lib/format'
import { KANAL_KURZ } from '../../data/einheiten'
import { STATUS_LABEL } from './verhandlung'
import './umstellung.css'

/** Nur bei Quoten ist „am meisten“ ein Verdienst — Beträge messen Größe. */
const QUOTEN = new Set(['qs', 're', 'gate', 'pq', 'storno', 'duration', 'aus'])

const ZEILEN = [
  { id: 'ist', label: 'Vergütung heute', wert: e => euro(e.ist.gesamt), roh: e => e.ist.gesamt },
  { id: 'ziel', label: 'Zielmodell im Referenzzeitraum', wert: e => euro(e.ziel.gesamt), roh: e => e.ziel.gesamt, stark: true },
  { id: 'delta', label: 'Veränderung', spezial: 'delta' },
  { id: 'jahr1', label: 'Forecast 2028, kassenwirksam', wert: e => euro(e.uebergang.wert), roh: e => e.uebergang.wert },
  { id: 'jahr1p', label: 'Veränderung Forecast 2028', spezial: 'uebergang' },
  { id: 'trenner1', trenner: true },
  { id: 'ap', label: 'Abschlussprovision', wert: e => euro(e.ziel.ap), roh: e => e.ziel.ap },
  { id: 'lp', label: 'Laufende Provision', wert: e => euro(e.ziel.lp), roh: e => e.ziel.lp },
  { id: 'bp', label: 'Bestandsprovision', wert: e => euro(e.ziel.bp), roh: e => e.ziel.bp },
  { id: 'bonus', label: 'Bonifikation', wert: e => euro(e.ziel.bonus), roh: e => e.ziel.bonus },
  { id: 'trenner2', trenner: true },
  { id: 'qs', label: 'Qualitätsscore', wert: e => `${zahl(e.ziel.qualitaetsScore * 100)} / 100`, roh: e => e.ziel.qualitaetsScore },
  { id: 're', label: 'Requalifizierungsfaktor', wert: e => prozentDelta((e.ziel.requalifizierungsFaktor - 1) * 100), roh: e => e.ziel.requalifizierungsFaktor },
  { id: 'gate', label: 'Auszahlungsgrad Bonus', wert: e => prozent(e.ziel.gate.grad * 100, 0), roh: e => e.ziel.gate.grad },
  { id: 'pq', label: 'Partneranteil Journey', wert: e => prozent(e.ziel.partnerQuote * 100), roh: e => e.ziel.partnerQuote },
  { id: 'trenner3', trenner: true },
  { id: 'storno', label: 'Stornoquote', wert: e => prozent(e.einheit.qualitaet.storno * 100), roh: e => -e.einheit.qualitaet.storno },
  { id: 'duration', label: 'Beitragsduration', wert: e => `${zahl(e.einheit.qualitaet.duration, 1)} Jahre`, roh: e => e.einheit.qualitaet.duration },
  { id: 'aus', label: 'Bestandsausschöpfung', wert: e => prozent(e.einheit.qualitaet.ausschoepfung * 100), roh: e => e.einheit.qualitaet.ausschoepfung },
]

export default function Vergleich({ ids, portfolio, hebel, navigiere }) {
  const [normiert, setNormiert] = useState('absolut')

  const spalten = useMemo(
    () => ids
      .map(id => portfolio.ergebnisse.find(e => e.einheit.id === id))
      .filter(Boolean)
      .map(e => berechneEinzel(e.einheit, hebel, { bonusNormierung: portfolio.bonusNormierung })),
    [ids, portfolio, hebel])

  if (spalten.length < 2) {
    return (
      <Leer
        titel="Zu wenige Einheiten gewählt"
        text="Für den Vergleich werden mindestens zwei Einheiten gebraucht."
        ikone={GitCompare}
        aktion={<Btn ikone={ArrowLeft} onClick={() => navigiere('umstellung')}>Zurück zum Lagebild</Btn>}
      />
    )
  }

  return (
    <div className="vg-stapel">
      <div className="vg-seitenkopf">
        <div className="vg-seitenkopf-titel">
          <div className="vg-reihe" style={{ gap: 12 }}>
            <Btn variante="still" nurIkone ikone={ArrowLeft} onClick={() => navigiere('umstellung')} aria-label="Zurück zum Lagebild" />
            <h2 style={{ margin: 0 }}>Vergleich</h2>
          </div>
          <span className="vg-seitenkopf-unter">
            {spalten.length} Einheiten nebeneinander — dieselbe Rechnung, unterschiedliche Ausgangslage.
          </span>
        </div>
      </div>

      {/* Zuerst die Reform in fünf Säulenpaaren je Haus — die erste Darstellung.
          Eigenes Raster statt vg-raster-3: das Gestaltungssystem stellt bei 1280
          auf zwei Spalten um, drei Karten brächen dann 2 + 1 (Umbruchregel § 8). */}
      <div className="vg-vergleich-raster" data-spalten={Math.min(spalten.length, 4)}>
        {spalten.map(e => {
          const st = STATUS_LABEL[e.einheit.verhandlung?.status || 'nicht_begonnen']
          return (
            <Karte key={e.einheit.id}>
              <KarteKopf
                titel={e.einheit.kurz || e.einheit.name}
                unter={`${KANAL_KURZ[e.einheit.kanal]} · ${st.label}`}
                aktionen={
                  <>
                    <Delta prozent={e.delta.prozent} nurProzent gross />
                    <Btn groesse="sm" onClick={() => navigiere(`umstellung/${e.einheit.id}`)}>Akte</Btn>
                  </>
                }
              />
              <KarteKoerper>
                <PaarVergleich paare={bauteilPaare(e.ist, e.ziel)} hoehe={230} />
              </KarteKoerper>
            </Karte>
          )
        })}
      </div>

      <Aufklapp
        titel="Alle Kennzahlen"
        unter="Vergütung, Bausteine und Qualität nebeneinander — die beste Quote je Zeile ist markiert"
      >
        <div className="vg-vergleich-umschalter">
          <Segment
            wert={normiert} onWaehle={setNormiert} klein
            optionen={[
              { id: 'absolut', label: 'Absolute Beträge' },
              { id: 'relativ', label: 'Je Euro heutiger Vergütung' },
            ]}
          />
        </div>
        <div className="vg-tabelle-rahmen">
          <table className="vg-tabelle">
            <thead>
              <tr>
                <th style={{ width: 250 }}>Kennzahl</th>
                {spalten.map(e => (
                  <th key={e.einheit.id} data-num="true">
                    <span className="vg-reihe" style={{ gap: 7, justifyContent: 'flex-end' }}>
                      <Ampel stufe={e.ampel} mitText={false} />
                      <span className="vg-kappen" style={{ maxWidth: 170 }}>{e.einheit.kurz || e.einheit.name}</span>
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ZEILEN.map(z => {
                if (z.trenner) {
                  return <tr key={z.id}><td colSpan={spalten.length + 1} style={{ height: 8, background: 'var(--vg-flaeche-2)', padding: 0 }} /></tr>
                }
                const werte = spalten.map(e => (z.roh ? z.roh(e) : 0))
                const bester = QUOTEN.has(z.id) ? Math.max(...werte) : null
                return (
                  <tr key={z.id}>
                    <td className="vg-erste-spalte">{z.label}</td>
                    {spalten.map((e, i) => {
                      if (z.spezial === 'delta') {
                        return <td key={e.einheit.id} data-num="true"><Delta prozent={e.delta.prozent} nurProzent /></td>
                      }
                      if (z.spezial === 'uebergang') {
                        return <td key={e.einheit.id} data-num="true"><Delta prozent={e.uebergang.prozent} nurProzent /></td>
                      }
                      const anzeige = normiert === 'relativ' && z.roh && e.ist.gesamt > 0 && z.id !== 'ist' && !QUOTEN.has(z.id)
                        ? `${zahl((z.roh(e) / e.ist.gesamt) * 100, 1)} %`
                        : z.wert(e)
                      const klassen = [
                        z.stark ? 'vg-stark' : '',
                        bester != null && werte[i] === bester ? 'vg-vergleich-bester' : '',
                      ].filter(Boolean).join(' ')
                      return (
                        <td key={e.einheit.id} data-num="true" className={klassen || undefined}>
                          <span className="vg-mono">{anzeige}</span>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Aufklapp>
    </div>
  )
}
