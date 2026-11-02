// ===========================================================================
// Vergütungswerk — Verhandlungsstand einer Fassung
//
// Der Verhandlungsmodus schreibt Zugeständnisse und Reglerbewegungen in die
// aktive Fassung. Damit niemand ein Zielmodell liest, das schon
// Zugeständnisse enthält, ohne es zu wissen, steht neben der Summe
// „Zielmodell“ im Steuerblock eine Marke „mit Zugeständnissen“; ihr Tooltip
// nennt, was gegenüber der Basis (die Fassung beim ersten Öffnen des
// Verhandlungsmodus) verändert ist.
// ===========================================================================

import { Tip } from '../../ui/basis'
import { HEBEL } from '../../lib/hebel'
import { formatiere, EINHEIT_ZEICHEN } from '../../ui/Regler'
import { euroKompakt } from '../../lib/format'
import { ZUGESTAENDNISSE } from './verhandlung'

function wertMitEinheit(wert, def) {
  if (def.einheit === 'schalter') return formatiere(wert, def)
  return `${formatiere(wert, def)} ${EINHEIT_ZEICHEN[def.einheit] ?? ''}`.trim()
}

/**
 * Was die Fassung gegenüber der Verhandlungsbasis verändert:
 * angewendete Zugeständnisse, bewegte Regler, individuelle Hauszuschüsse.
 * `einheitId` beschränkt die Zuschüsse auf ein Haus (Akte); ohne sie zählt
 * der Kasten alle Häuser.
 */
export function verhandlungsStand(fassung, hebel, einheitId = null) {
  const stand = fassung?.verhandlung
  const basis = stand?.basis || null
  const angewendet = (stand?.angewendet || [])
    .map(id => ZUGESTAENDNISSE.find(z => z.id === id))
    .filter(Boolean)
  const regler = basis
    ? HEBEL.filter(def => Math.abs((hebel?.[def.id] ?? def.standard) - (basis[def.id] ?? def.standard)) > 1e-9)
      .map(def => ({ def, von: basis[def.id] ?? def.standard, zu: hebel[def.id] ?? def.standard }))
    : []
  const zuschuesse = Object.entries(hebel?.hausZuschuesse || {})
    .filter(([id, v]) => Number(v) > 0 && (!einheitId || id === einheitId))
  return {
    aktiv: angewendet.length > 0 || regler.length > 0 || zuschuesse.length > 0,
    angewendet, regler, zuschuesse,
  }
}

export default function VerhandlungsMarke({ fassung, hebel, einheitId = null }) {
  const st = verhandlungsStand(fassung, hebel, einheitId)
  if (!st.aktiv) return null
  const teile = []
  if (st.angewendet.length) teile.push(`Angewendet: ${st.angewendet.map(z => z.label).join('; ')}.`)
  if (st.zuschuesse.length) {
    teile.push(einheitId
      ? `Individueller Zuschuss für dieses Haus: ${euroKompakt(st.zuschuesse[0][1])} je Jahr.`
      : `Individuelle Zuschüsse für ${st.zuschuesse.length} ${st.zuschuesse.length === 1 ? 'Haus' : 'Häuser'}: ${euroKompakt(st.zuschuesse.reduce((a, [, v]) => a + Number(v), 0))} je Jahr.`)
  }
  if (st.regler.length) {
    teile.push(`Regler gegenüber der Fassung: ${st.regler.map(r => `${r.def.kurz || r.def.label} ${wertMitEinheit(r.von, r.def)} auf ${wertMitEinheit(r.zu, r.def)}`).join('; ')}.`)
  }
  teile.push('Im Verhandlungsmodus lassen sich Zugeständnisse einzeln oder alle zurücknehmen.')
  return (
    <Tip text={teile.join(' ')}>
      <span className="vg-sb-zielmarke">mit Zugeständnissen</span>
    </Tip>
  )
}
