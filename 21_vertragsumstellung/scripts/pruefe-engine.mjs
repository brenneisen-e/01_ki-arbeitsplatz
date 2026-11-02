// ===========================================================================
// Engine-Prüfung (Paket ENGINE)
//
// Läuft ohne Browser direkt gegen src/lib und src/data. Prüft die
// Akzeptanzkriterien des Engine-Umbaus:
//
//   1  Szenarien rechnen unverändert (Regression gegen notierte Werte)
//   2  Makro = Summe Mikro; Kalibrierung trifft die gemeldete Vergütung
//   3  Bonusstaffel aus dem Hebel: Normierung aus -> Volumen folgt der
//      Staffel; Normierung an -> Volumen bleibt beim Budget
//   4  Zeilenhelfer und Sparten-Säulen liefern die Felder aus § 2.3/2.4
//   5  Schwellen der Staffel sind Hebel: eine gesenkte Schwelle hebt
//      Einheiten in die nächste Stufe; Schwellen bleiben aufsteigend;
//      der Wasserfall geht auch mit veränderter Schwelle exakt auf
//   Zusatz: istHebel() trifft die gemeldete Vergütung; jeder Hebel, der die
//      eingeschwungene Vergütung ändert, steht in einer Wasserfall-Stufe
//
// Aufruf: node scripts/pruefe-engine.mjs
// Die Quelldateien importieren ohne Dateiendung (Vite-Stil). Ein kleiner
// Auflösungs-Hook ergänzt .js/.jsx, damit Node sie direkt laden kann.
// ===========================================================================

import { register } from 'node:module'

const HOOK = `
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
export async function resolve(spezifikation, kontext, weiter) {
  if (spezifikation.startsWith('.') && !/\\.[a-z]+$/i.test(spezifikation) && kontext.parentURL) {
    const basis = new URL(spezifikation, kontext.parentURL).href
    for (const endung of ['.js', '.jsx', '/index.js', '/index.jsx']) {
      if (existsSync(fileURLToPath(basis + endung))) return weiter(basis + endung, kontext)
    }
  }
  return weiter(spezifikation, kontext)
}`
register('data:text/javascript,' + encodeURIComponent(HOOK), import.meta.url)

const modell = await import(new URL('../src/lib/modell.js', import.meta.url))
const hebelModul = await import(new URL('../src/lib/hebel.js', import.meta.url))
const { SZENARIEN } = await import(new URL('../src/lib/szenarien.js', import.meta.url))
const daten = await import(new URL('../src/data/einheiten.js', import.meta.url))

const { berechnePortfolio, berechneEinheit, pruefeKonsistenz, istBonusVolumen, wasserfall, WASSERFALL_STUFEN } = modell
const { EINHEITEN, pruefeKalibrierung, einheit } = daten
const { istHebel, HEBEL, ERWEITERT } = hebelModul

// ---------------------------------------------------------------------------
// Notierte Referenzwerte VOR dem Umbau (Lauf vom 09.09.2026, alte Engine).
// ziel.gesamt eingeschwungen und kassenwirksames Startjahr mit Übergang,
// je Szenario. Toleranz: 1 EUR.
// ---------------------------------------------------------------------------
const REFERENZ = {
  ist:                { zielGesamt: 65720828,           mitUebergang2028: 65720828 },
  budgetneutral:      { zielGesamt: 65965080.0802748,   mitUebergang2028: 61134835.27705121 },
  bestand:            { zielGesamt: 71515958.98587283,  mitUebergang2028: 62435388.31708912 },
  qualitaet:          { zielGesamt: 65881676.49867368,  mitUebergang2028: 61278675.56001958 },
  aktivierung:        { zielGesamt: 69488321.2575483,   mitUebergang2028: 67866665.78734958 },
  verbundfreundlich:  { zielGesamt: 66428368.90401596,  mitUebergang2028: 63763256.44457765 },
  einfach:            { zielGesamt: 64701693.285716325, mitUebergang2028: 61593624.80757302 },
}
const KALIBRIERUNG_ABWEICHUNGEN_VORHER = 0

const euro = v => new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(v) + ' EUR'
const prozent = v => new Intl.NumberFormat('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(v) + ' %'

let verfehlt = 0
function melde(nr, titel, ok, detail = '') {
  if (!ok) verfehlt += 1
  console.log(`${ok ? 'ok      ' : 'verfehlt'}  Kriterium ${nr}  ${titel}${detail ? '  —  ' + detail : ''}`)
}
const nahe = (a, b, tol = 1) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tol

// ---------------------------------------------------------------- Kriterium 1
console.log('Referenzwerte je Szenario (ziel.gesamt eingeschwungen · Startjahr 2028 mit Übergang):')
let k1 = true
const referenzPortfolio = berechnePortfolio(EINHEITEN, SZENARIEN[1].hebel)
for (const s of SZENARIEN) {
  const p = berechnePortfolio(EINHEITEN, s.hebel)
  const zielGesamt = p.ziel.gesamt
  const mitUebergang = p.verlauf[0].mitUebergang
  const ref = REFERENZ[s.id]
  const passt = ref ? nahe(zielGesamt, ref.zielGesamt) && nahe(mitUebergang, ref.mitUebergang2028) : null
  if (ref && !passt) k1 = false
  console.log(
    `  ${s.id.padEnd(18)} zielGesamt: ${zielGesamt}  mitUebergang2028: ${mitUebergang}` +
    `  (${euro(zielGesamt)} · ${prozent(p.verlauf[0].deltaProzent)})` +
    (ref ? (passt ? '  = Referenz' : `  WEICHT AB von ${ref.zielGesamt} / ${ref.mitUebergang2028}`) : '  (notiert)'))
}
melde(1, 'Szenarien rechnen wie vor dem Umbau (bis auf 1 EUR)', k1,
  `Budgetneutral: ${euro(referenzPortfolio.ziel.gesamt)} eingeschwungen, ${prozent(referenzPortfolio.verlauf[0].deltaProzent)} im Startjahr`)

// ---------------------------------------------------------------- Kriterium 2
const konsistenz = pruefeKonsistenz(EINHEITEN, SZENARIEN[1].hebel)
const kalibrierung = pruefeKalibrierung()
melde(2, 'Makro = Summe Mikro und Kalibrierung ohne neue Abweichungen',
  konsistenz.bestanden && kalibrierung.abweichungen.length <= KALIBRIERUNG_ABWEICHUNGEN_VORHER,
  `Abweichung Makro/Mikro ${konsistenz.abweichung.toFixed(2)} EUR · Kalibrierungsabweichungen ${kalibrierung.abweichungen.length}`)

// ---------------------------------------------------------------- Kriterium 3
try {
  const basis = SZENARIEN[1].hebel
  const ohneNorm = berechnePortfolio(EINHEITEN, { ...basis, bonusNormierung: 0 })
  const ohneNormHoch = berechnePortfolio(EINHEITEN, { ...basis, bonusNormierung: 0, bonusSatz4: 25 })
  const mitNormHoch = berechnePortfolio(EINHEITEN, { ...basis, bonusNormierung: 1, bonusSatz4: 25 })

  const steigt = ohneNormHoch.ziel.bonus > ohneNorm.ziel.bonus + 1
  const verteilung = ohneNormHoch.bonusVerteilung
  const verteilungOk = Array.isArray(verteilung) && verteilung.length === 6 &&
    verteilung.every(v => ['index', 'label', 'satzHeute', 'satzNeu', 'einheitenHeute', 'einheitenNeu', 'volumenHeute', 'volumenNeu']
      .every(f => v[f] !== undefined)) &&
    verteilung.reduce((s, v) => s + v.einheitenNeu, 0) === EINHEITEN.length &&
    nahe(verteilung.reduce((s, v) => s + v.volumenNeu, 0), ohneNormHoch.ziel.bonus)

  // Mit Normierung: Rohbonus × Faktor = heutiges Volumen × Budget (vor dem Gate)
  const budget = (basis.bonusBudget ?? 100) / 100
  const normiert = mitNormHoch.ergebnisse.reduce((s, e) => s + e.ziel.bonusRoh, 0) * mitNormHoch.bonusNormierung
  const beimBudget = nahe(normiert, istBonusVolumen(EINHEITEN) * budget)

  melde(3, 'Bonussatz Stufe 4 wirkt ohne Normierung; mit Normierung bleibt das Budget', steigt && verteilungOk && beimBudget,
    `Bonus ohne Normierung ${euro(ohneNorm.ziel.bonus)} → ${euro(ohneNormHoch.ziel.bonus)} bei Satz 25 %; ` +
    `normiert ${euro(normiert)} = Budget ${euro(istBonusVolumen(EINHEITEN) * budget)}`)
  if (verteilungOk) {
    for (const v of verteilung) {
      console.log(`    Stufe ${v.index + 1} ${v.label.padEnd(12)} Satz ${v.satzHeute} → ${v.satzNeu}  Einheiten ${v.einheitenHeute} → ${v.einheitenNeu}  Volumen ${euro(v.volumenHeute)} → ${euro(v.volumenNeu)}`)
    }
  }
} catch (fehler) {
  melde(3, 'Bonussatz Stufe 4 wirkt ohne Normierung; mit Normierung bleibt das Budget', false, String(fehler.message || fehler))
}

// ---------------------------------------------------------------- Kriterium 4
try {
  const { produktionszeilen, bestandszeilen, bonuszeilen, zuschusszeilen, summenzeile, spartenSaeulen } = modell
  const exportiert = [produktionszeilen, bestandszeilen, bonuszeilen, zuschusszeilen, summenzeile, spartenSaeulen]
    .every(f => typeof f === 'function')
  if (!exportiert) throw new Error('Zeilenhelfer nicht vollständig exportiert')

  const haus = einheit('osd') || EINHEITEN[0]
  const p = referenzPortfolio
  const einzel = p.ergebnisse.find(e => e.einheit.id === haus.id)

  const felder = ['id', 'sparte', 'produkt', 'bemessung', 'alt', 'neu', 'differenz']
  const hatFelder = (zeilen, n) => Array.isArray(zeilen) && zeilen.length === n &&
    zeilen.every(z => felder.every(f => z[f] !== undefined))

  const prodHaus = produktionszeilen(einzel.ist, einzel.ziel, haus)
  const prodPortfolio = produktionszeilen(p.ist, p.ziel, null)
  const bestHaus = bestandszeilen(einzel.ist, einzel.ziel, haus)
  const bonusHaus = bonuszeilen(einzel.ist, einzel.ziel)
  const zuHaus = zuschusszeilen(einzel.ist, einzel.ziel)
  const zuPortfolio = zuschusszeilen(p.ist, p.ziel)
  const summe = summenzeile(prodHaus)

  const prodOk = hatFelder(prodHaus, 5) && hatFelder(prodPortfolio, 5) &&
    nahe(summenzeile(prodHaus).neu, einzel.ziel.ap) && nahe(summenzeile(prodHaus).alt, einzel.ist.ap) &&
    nahe(summenzeile(prodPortfolio).neu, p.ziel.ap) && nahe(summenzeile(prodPortfolio).alt, p.ist.ap) &&
    prodHaus.map(z => z.id).join(',') === 'lebenBasis,lebenBav,lebenBio,kompositSuh,kompositKfz'
  // Die zwei Bestandszeilen müssen auch ohne Sparten-Spalte (Kasten) unterscheidbar sein
  const bestOk = hatFelder(bestHaus, 3) &&
    nahe(summenzeile(bestHaus).neu, einzel.ziel.lp + einzel.ziel.bp) &&
    // Sparte plus Produkt unterscheidet die Zeilen (Akte: Sparten-Spalte, Kasten: Produktname mit Sparte)
    new Set(bestHaus.map(z => `${z.sparte}·${z.produkt}`)).size === 3 &&
    bestHaus.filter(z => z.id.startsWith('bp')).every(z => z.sparte === 'Leben' || z.sparte === 'Komposit') &&
    bestHaus.find(z => z.id === 'bpLeben').produkt === 'Bestandsprovision' &&
    bestHaus.find(z => z.id === 'bpKomposit').produkt === 'Bestandsprovision'
  const bonusOk = Array.isArray(bonusHaus) && bonusHaus.length === 1 &&
    ['stufeAlt', 'stufeNeu', 'satzAlt', 'satzNeu', 'auszahlungsgrad'].every(f => bonusHaus[0][f] !== undefined) &&
    nahe(bonusHaus[0].neu, einzel.ziel.bonus)
  const zuOk = Array.isArray(zuHaus) && zuHaus.length >= 3 &&
    nahe(summenzeile(zuHaus).neu, einzel.ziel.zuschuesse) && nahe(summenzeile(zuPortfolio).neu, p.ziel.zuschuesse)
  const summeOk = summe && ['alt', 'neu', 'differenz'].every(f => Number.isFinite(summe[f])) &&
    nahe(summe.differenz, summe.neu - summe.alt)

  const saeulen = spartenSaeulen(haus)
  const saeulenOk = Array.isArray(saeulen) && saeulen.length === 4 &&
    saeulen.every(s => s.id && s.label && Array.isArray(s.werte) && s.werte.length === 3 &&
      s.werte.every(w => w.label && Number.isFinite(w.wert)) &&
      Array.isArray(s.stufen) && s.stufen.length === 4 && s.stufen.every(st => st.label && Number.isFinite(st.wert)) &&
      s.plan && Number.isFinite(s.plan.wert))

  const vorjahrOk = EINHEITEN.every(e => e.produktionVorjahr &&
    ['lebenBs', 'lebenBsBav', 'lebenBsBiometrie', 'kompositSuh', 'kompositKfz'].every(f => Number.isFinite(e.produktionVorjahr[f])) &&
    e.zielvorgabe && Number.isFinite(e.zielvorgabe.lebenBs) && Number.isFinite(e.zielvorgabe.komposit))

  const produktlinienOk = p.ergebnisse.every(e =>
    nahe(e.ziel.apLebenBasis + e.ziel.apLebenBav + e.ziel.apLebenBio, e.ziel.apLeben, 0.01) &&
    nahe(e.ziel.apKompositSuh + e.ziel.apKompositKfz, e.ziel.apKomposit, 0.01) &&
    e.ziel.bonusStufe && Number.isInteger(e.ziel.bonusStufe.index) &&
    e.ziel.zuschussTeile &&
    nahe(Object.values(e.ziel.zuschussTeile).reduce((s, v) => s + v, 0), e.ziel.zuschuesse, 0.01))

  melde(4, 'Zeilenhelfer, Produktlinien, Vorjahr und Sparten-Säulen liefern die Felder aus § 2',
    prodOk && bestOk && bonusOk && zuOk && summeOk && saeulenOk && vorjahrOk && produktlinienOk,
    `Produktionszeilen ${prodOk ? 'ok' : 'fehlt'} · Bestand ${bestOk ? 'ok' : 'fehlt'} · Bonus ${bonusOk ? 'ok' : 'fehlt'} · ` +
    `Zuschüsse ${zuOk ? 'ok' : 'fehlt'} · Summe ${summeOk ? 'ok' : 'fehlt'} · Säulen ${saeulenOk ? 'ok' : 'fehlt'} · ` +
    `Vorjahr ${vorjahrOk ? 'ok' : 'fehlt'} · Produktlinien ${produktlinienOk ? 'ok' : 'fehlt'}`)

  if (prodOk) {
    console.log(`    ${haus.kurz}: Abschluss ${euro(summe.alt)} → ${euro(summe.neu)} (${euro(summe.differenz)})`)
    for (const z of prodHaus) console.log(`      ${z.sparte.padEnd(9)} ${z.produkt.padEnd(24)} ${euro(z.bemessung).padStart(18)}  ${euro(z.alt).padStart(14)} → ${euro(z.neu).padStart(14)}`)
  }
} catch (fehler) {
  melde(4, 'Zeilenhelfer, Produktlinien, Vorjahr und Sparten-Säulen liefern die Felder aus § 2', false, String(fehler.message || fehler))
}

// ---------------------------------------------------------------- Kriterium 5
try {
  const { bonusStaffel, bonusSchwellen, spartenSaeulen } = modell
  const basis = SZENARIEN[1].hebel
  const vorher = berechnePortfolio(EINHEITEN, basis)
  // bonusSchwelle3 ist die Schwelle, ab der Stufe 4 beginnt (heute 105 %).
  // Gesenkt auf 100 % müssen Einheiten mit 100 – 105 % Zielerreichung von Stufe 3 nach Stufe 4 wechseln.
  const gesenkt = berechnePortfolio(EINHEITEN, { ...basis, bonusSchwelle3: 100 })
  const gewechselt = vorher.ergebnisse.filter(e => e.ziel.bonusStufe.index === 2)
    .map(e => gesenkt.ergebnisse.find(g => g.einheit.id === e.einheit.id))
    .filter(g => g.ziel.bonusStufe.index === 3)
  const stufe3Vorher = vorher.bonusVerteilung[2].einheitenNeu
  const stufe4Vorher = vorher.bonusVerteilung[3].einheitenNeu
  const stufe3Nachher = gesenkt.bonusVerteilung[2].einheitenNeu
  const stufe4Nachher = gesenkt.bonusVerteilung[3].einheitenNeu
  const wechselOk = gewechselt.length >= 1 && stufe4Nachher > stufe4Vorher && stufe3Nachher < stufe3Vorher
  const labelOk = gesenkt.bonusVerteilung[2].label === '95 – 100 %' && gesenkt.bonusVerteilung[3].label === '100 – 115 %'
    && gesenkt.bonusVerteilung[2].labelHeute === '95 – 105 %'

  // Basiswerte: Staffel entspricht der heutigen Staffel (Sätze, Schwellen, Labels)
  const heutige = bonusStaffel(istHebel())
  const heuteOk = heutige.every((st, i) => st.satz === modell.BONUS_STAFFEL[i].satz && st.bis === modell.BONUS_STAFFEL[i].bis
    && st.ab === modell.BONUS_STAFFEL[i].ab && st.label === modell.BONUS_STAFFEL[i].label)

  // Klemmung: Schwelle 4 unter Schwelle 3 gesetzt -> landet einen Punkt darüber; das Modell bleibt rechenbar
  const geklemmt = bonusSchwellen({ ...basis, bonusSchwelle4: 90 })
  const klemmOk = geklemmt[3] === geklemmt[2] + 1 && geklemmt.every((w, i) => i === 0 || w > geklemmt[i - 1])
  const geklemmtPortfolio = berechnePortfolio(EINHEITEN, { ...basis, bonusSchwelle4: 90 })
  const rechenbar = Number.isFinite(geklemmtPortfolio.ziel.gesamt)
    && geklemmtPortfolio.bonusVerteilung.reduce((a, v) => a + v.einheitenNeu, 0) === EINHEITEN.length

  // Sparten-Säulen folgen den Schwellen des Hebelsatzes
  const haus = einheit('osd') || EINHEITEN[0]
  const saeulenOk = spartenSaeulen(haus, { ...basis, bonusSchwelle3: 100 })[0].stufen[2].label === 'Stufe 4 · 100 %'
    && spartenSaeulen(haus)[0].stufen[2].label === 'Stufe 4 · 105 %'

  // Wasserfall: mit veränderter Schwelle (Normierung an und aus) muss die Brücke
  // je Einheit auf dasselbe Zielmodell führen wie berechneEinheit — sonst zeigt
  // die Akte im Verlauf einen anderen Zielmodell-Balken als der Steuerblock.
  const wasserfallLuecken = []
  for (const hebel of [{ ...basis, bonusSchwelle3: 100 }, { ...basis, bonusSchwelle3: 100, bonusNormierung: 0 }]) {
    const p = berechnePortfolio(EINHEITEN, hebel)
    for (const e of p.ergebnisse) {
      const bruecke = wasserfall(e.einheit, hebel, { bonusNormierung: p.bonusNormierung }).find(s => s.id === 'ziel').wert
      if (!nahe(bruecke, e.ziel.gesamt)) {
        wasserfallLuecken.push(`${e.einheit.kurz} (Normierung ${hebel.bonusNormierung ?? 1}): ${euro(bruecke)} statt ${euro(e.ziel.gesamt)}`)
      }
    }
  }
  const wasserfallOk = wasserfallLuecken.length === 0

  melde(5, 'Schwellen der Staffel sind Hebel: gesenkte Schwelle hebt Einheiten in die nächste Stufe, Wasserfall geht auf',
    wechselOk && labelOk && heuteOk && klemmOk && rechenbar && saeulenOk && wasserfallOk,
    `Schwelle Stufe 4 von 105 auf 100 %: ${gewechselt.length} Einheit(en) von Stufe 3 nach 4 ` +
    `(Stufe 3: ${stufe3Vorher} → ${stufe3Nachher}, Stufe 4: ${stufe4Vorher} → ${stufe4Nachher}) · ` +
    `Labels ${labelOk ? 'ok' : 'fehlt'} · Basis = heute ${heuteOk ? 'ok' : 'fehlt'} · Klemmung ${klemmOk && rechenbar ? 'ok' : 'fehlt'} · Säulen ${saeulenOk ? 'ok' : 'fehlt'} · ` +
    `Wasserfall ${wasserfallOk ? 'ok' : 'fehlt'}`)
  for (const l of wasserfallLuecken) console.log(`    Wasserfall-Lücke ${l}`)
  if (gewechselt.length) console.log(`    gewechselt: ${gewechselt.map(g => `${g.einheit.kurz} (${prozent(g.ziel.bonusStufe.zielerreichung * 100)})`).join(', ')}`)
} catch (fehler) {
  melde(5, 'Schwellen der Staffel sind Hebel: gesenkte Schwelle hebt Einheiten in die nächste Stufe, Wasserfall geht auf', false, String(fehler.message || fehler))
}

// ---------------------------------------------------------------- Zusatz: Basiswerte bilden heute nach
const istBasis = istHebel()
const heuteOk = EINHEITEN.every(e => {
  const r = berechneEinheit(e, istBasis, { bonusNormierung: 1 })
  return nahe(r.gesamt, e.gemeldet.gesamt, Math.max(1, e.gemeldet.gesamt * 0.0005))
})
console.log(`${heuteOk ? 'ok      ' : 'verfehlt'}  Zusatz       istHebel() trifft die gemeldete Vergütung jeder Einheit`)
if (!heuteOk) verfehlt += 1

// Jeder Hebel, der die eingeschwungene Vergütung einer Einheit verändert, muss
// in einer Wasserfall-Stufe stehen — sonst geht die Brücke für genau diesen
// Hebel nicht auf. Geprüft wird am Rand des Bereichs, der von der Basis abweicht.
const imWasserfall = new Set(WASSERFALL_STUFEN.flatMap(s => s.felder))
const fehltImWasserfall = []
const alleHebel = [
  ...HEBEL.map(h => ({ id: h.id, min: h.min, max: h.max, basis: h.basis })),
  ...Object.entries(ERWEITERT).map(([id, h]) => ({ id, min: h.min, max: h.max, basis: istBasis[id] })),
]
const basisSumme = EINHEITEN.reduce((s, e) => s + berechneEinheit(e, istBasis, { bonusNormierung: 1 }).gesamt, 0)
for (const h of alleHebel) {
  if (imWasserfall.has(h.id)) continue
  for (const wert of [h.min, h.max]) {
    if (!Number.isFinite(wert) || wert === h.basis) continue
    const summe = EINHEITEN.reduce((s, e) => s + berechneEinheit(e, { ...istBasis, [h.id]: wert }, { bonusNormierung: 1 }).gesamt, 0)
    if (!nahe(summe, basisSumme)) { fehltImWasserfall.push(`${h.id} (bei ${wert})`); break }
  }
}
console.log(`${fehltImWasserfall.length === 0 ? 'ok      ' : 'verfehlt'}  Zusatz       jeder wirksame Hebel steht in einer Wasserfall-Stufe` +
  (fehltImWasserfall.length ? `  —  fehlt: ${fehltImWasserfall.join(', ')}` : ''))
if (fehltImWasserfall.length) verfehlt += 1

console.log(verfehlt === 0 ? 'Engine-Prüfung bestanden.' : `Engine-Prüfung: ${verfehlt} Kriterium/Kriterien verfehlt.`)
process.exit(verfehlt === 0 ? 0 : 1)
