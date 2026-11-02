// ===========================================================================
// Vergütungswerk — Erklärung der Plaketten
//
// Die beiden Budget-Plaketten des Steuerblocks erklären im Tooltip, wie ihr
// Wert entsteht: Titel, drei Rechenzeilen (heute, Zielmodell, Differenz) und
// wenige Punkte — aus den Zahlen der Einheit oder des Portfolios, nicht aus
// festem Text. Die kumulierte Sicht beantwortet dabei die naheliegende Frage,
// warum sie kein Vielfaches des Referenzvergleichs ist: gezählt wird erst ab
// dem Start des Zielmodells, die laufende Provision wächst Jahrgang für
// Jahrgang auf, die Übergangsregel legt sich darüber, abgezinst wird mit dem
// Diskontsatz. Gerendert von `PlaketteTip` in `src/ui/Steuerblock.jsx`.
// ===========================================================================

import { euroKompakt, euroKompaktDelta, prozentDelta, zahl } from './format'

/** 8,69 Mio. EUR — zwei Stellen, damit heute, Zielmodell und Differenz zusammenpassen. */
const betrag = (v) => (Math.abs(v) >= 999_500 ? `${zahl(v / 1_000_000, 2)} Mio. EUR` : euroKompakt(v))
const delta = (d, p) => `${euroKompaktDelta(d)} · ${prozentDelta(p)}`

/**
 * Plakette „Vergleich Referenzzeitraum“: ein Wertungsjahr, zweimal gerechnet.
 */
export function erklaereReferenzvergleich({ heute, ziel, zeitraum, lpDauer = 12, jahrVoll = null }) {
  const d = ziel - heute
  const p = heute > 0 ? (d / heute) * 100 : 0
  return {
    titel: 'Vergleich Referenzzeitraum',
    unter: `Wertungsjahr ${zeitraum}, zweimal gerechnet`,
    zeilen: [
      { label: 'Heute', wert: betrag(heute) },
      { label: 'Zielmodell', wert: betrag(ziel) },
      { label: 'Differenz', wert: delta(d, p), summe: true },
    ],
    punkte: [
      'Gleiche Produktion, gleicher Bestand, neue Sätze',
      `Laufende Provision voll gezählt: alle ${zahl(lpDauer)} Jahrgänge${jahrVoll ? `, wie ab ${jahrVoll}` : ''}`,
      'Kalkulation auf Ist-Zahlen, keine Prognose',
    ],
  }
}

/**
 * Plakette „kumuliert bis 2030 (Barwert)“: Summe der Jahre nach Übergangsregel,
 * abgezinst — und warum das kein Vielfaches des Referenzvergleichs ist.
 * `verlauf` [{ jahr, periode, ist, ziel, mitUebergang }], `kumuliert` aus kumuliertBarwert().
 */
export function erklaereKumuliert({ kumuliert, verlauf, heute, zielReferenz, diskontsatz = 5, lpDauer = 12, jahrVoll = null }) {
  const jahre = (verlauf || []).filter(v => v.jahr <= kumuliert.bisJahr)
  const n = jahre.length
  if (!n) return null
  const erstes = jahre[0]
  const letztes = jahre[n - 1]
  const dRef = zielReferenz - heute
  const deltas = jahre.map(v => v.mitUebergang - v.ist)
  const gleich = deltas.every(x => Math.abs(x - deltas[0]) < 500)
  const proJahr = jahre.map(v => `${v.jahr} ${euroKompaktDelta(v.mitUebergang - v.ist)}`).join(', ')

  // Ohne Regel und mit Regel in einem Punkt: der Rückgang, den die Regel auffängt
  const ohne = `Ohne Übergangsregel ${erstes.jahr} ${erstes.ziel < erstes.ist ? 'nur' : 'schon'} ${euroKompakt(erstes.ziel)}`
  let regel
  if (deltas.every(x => Math.abs(x) < 500)) regel = `die Regel hält alle ${zahl(n)} Jahre auf heute`
  else if (gleich) regel = `die Regel legt ${euroKompaktDelta(deltas[0])} je Jahr auf heute`
  else regel = `nach Regel ${proJahr}`

  // „nicht 5 ab heute“: so viele Jahre wären es, zählte man vom laufenden Jahr
  const abHeute = kumuliert.bisJahr - new Date().getFullYear() + 1
  const zaehlung = `Gezählt wird ab ${erstes.jahr}, dem Start des Zielmodells: ${zahl(n)} Jahre`
    + (abHeute > n ? `, nicht ${zahl(abHeute)} ab heute` : '')

  return {
    titel: `Kumuliert bis ${kumuliert.bisJahr} (Barwert)`,
    unter: `${erstes.jahr} bis ${kumuliert.bisJahr}, kassenwirksam, mit ${zahl(diskontsatz)} % je Jahr abgezinst`,
    zeilen: [
      { label: `Heute × ${zahl(n)}`, wert: betrag(kumuliert.heute) },
      { label: 'Zielmodell nach Übergangsregel', wert: betrag(kumuliert.ziel) },
      { label: 'Differenz', wert: delta(kumuliert.absolut, kumuliert.prozent), summe: true },
    ],
    frage: Math.abs(dRef) > 500 ? `Warum nicht ${zahl(n)} × ${euroKompaktDelta(dRef)} = ${euroKompaktDelta(n * dRef)}?` : null,
    punkte: [
      zaehlung,
      `Laufende Provision wächst erst auf: ${erstes.jahr} zahlt 1 von ${zahl(lpDauer)} Jahrgängen, ${letztes.jahr} erst ${zahl(Math.min(letztes.periode ?? n, lpDauer))}`,
      `${ohne}; ${regel}`,
      jahrVoll ? `Voller Referenzvergleich erst ab ${jahrVoll}, wenn alle Jahrgänge laufen` : `Voller Referenzvergleich erst, wenn alle ${zahl(lpDauer)} Jahrgänge laufen`,
    ],
  }
}
