import { AMPEL_SCHWELLEN } from '../../lib/modell'
import { prozentDelta, deltaTon } from '../../lib/format'

/**
 * WEGBALKEN — das eine Zeichen je Einheit im Lagebild.
 *
 * Ein 6-px-Balken um die Nullmarke: die Füllung läuft von Null bis zur
 * Veränderung gegenüber heute, links rot, rechts grün. Die Skala (±skala %)
 * kommt vom Aufrufer aus dem GANZEN Portfolio, nie aus dem Filter — nur so
 * bedeutet dieselbe Länge in Kachel, Tabelle und Rändern dasselbe. Die
 * Kerbe steht bei der Schwelle „kritisch“ (−8 %); wo die Übergangsregel das
 * Startjahr kappt, sitzt eine hohle Marke bei der 2028-Veränderung.
 *
 * Werte außerhalb der Skala werden an den Rand gelegt, nicht verlängert.
 */
export default function Weg({ prozent, uebergang, skala = 30, breite }) {
  const s = Math.max(1e-9, skala)
  const lage = (v) => 50 + (Math.max(-s, Math.min(s, v)) / s) * 50
  const wert = Number.isFinite(prozent) ? prozent : 0
  const ende = lage(wert)
  const links = Math.min(50, ende)
  const laenge = Math.abs(ende - 50)

  // Die Marke nur, wenn die Übergangsregel wirklich etwas ändert —
  // sonst läge sie deckungsgleich auf dem Balkenende.
  const gekappt = Number.isFinite(uebergang) && Math.abs(uebergang - wert) > 0.5
  const kerbeSichtbar = Math.abs(AMPEL_SCHWELLEN.kritisch) <= s

  return (
    <div
      className="vg-weg"
      data-ton={deltaTon(wert)}
      style={breite ? { width: breite, flex: 'none' } : undefined}
      role="img"
      aria-label={`Veränderung ${prozentDelta(wert)}${gekappt ? `, 2028 ${prozentDelta(uebergang)}` : ''}`}
    >
      <span className="vg-weg-null" />
      <span className="vg-weg-fuellung" style={{ left: `${links}%`, width: `${laenge}%` }} />
      {kerbeSichtbar && (
        <span className="vg-weg-kerbe" style={{ left: `${lage(AMPEL_SCHWELLEN.kritisch)}%` }} />
      )}
      {gekappt && (
        <span
          className="vg-weg-marke"
          style={{ left: `${lage(uebergang)}%` }}
          title={`Übergangsregel kappt 2028 bei ${prozentDelta(uebergang)}`}
        />
      )}
    </div>
  )
}
