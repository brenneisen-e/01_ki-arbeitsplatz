import { useMemo, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { Karte, KarteKopf, KarteKoerper, Kpi, Btn, Hinweis } from '../../ui/basis'
import Tabelle from '../../ui/Tabelle'
import ReglerZeile from '../../ui/Regler'
import { Schublade } from '../../ui/Schublade'
import { PaarVergleich, spartenPaare } from '../../charts'
import { berechneEinzel, einheitMitSzenario } from '../../lib/modell'
import { REFERENZZEITRAUM_TEXT } from '../../data/einheiten'
import { euro, euroKompakt, euroKompaktDelta, prozent, prozentDelta, deltaTon } from '../../lib/format'

/**
 * SZENARIOANALYSE — Schublade der Institutsakte.
 *
 * Was passiert mit der Vergütung dieses Hauses, wenn im Referenzzeitraum
 * mehr oder weniger Produktion und Bestand stünde? Sechs Regler skalieren
 * Produktion (Leben, bAV, Biometrie, Komposit) und Bestand (Leben,
 * Komposit) in Prozent; beide Welten werden auf der veränderten Basis neu
 * gerechnet (`einheitMitSzenario`, `berechneEinzel`). Sätze, Kalibrierung
 * und Qualität bleiben, die Zielerreichung der Bonusstaffel folgt der
 * Produktion. So sieht man, wie das heutige und das neue Modell dieselbe
 * Mehrproduktion vergüten — die Steuerungswirkung des Zielmodells.
 */

const REGLER = [
  { id: 'leben', label: 'Produktion Leben (Basis)', hinweis: 'Beitragssumme Neugeschäft Leben ohne bAV und Biometrie' },
  { id: 'bav', label: 'Produktion bAV', hinweis: 'Beitragssumme Neugeschäft betriebliche Altersversorgung' },
  { id: 'biometrie', label: 'Produktion Biometrie', hinweis: 'Beitragssumme Neugeschäft Biometrie' },
  { id: 'komposit', label: 'Produktion Komposit', hinweis: 'Jahresbeitrag Neugeschäft Sach, Unfall, Haftpflicht und Kfz' },
  { id: 'bestandLeben', label: 'Bestand Leben', hinweis: 'Jahresbeitrag des betreuten Bestands Leben' },
  { id: 'bestandKomposit', label: 'Bestand Komposit', hinweis: 'Jahresbeitrag des betreuten Bestands Komposit' },
].map(r => ({
  ...r, kurz: r.label, gruppe: 'szenario', einheit: 'prozent',
  min: -50, max: 100, step: 5, standard: 0, basis: 0, wirkung: 'neutral',
}))

const LEER = Object.fromEntries(REGLER.map(r => [r.id, 0]))
const SPARTEN_LABEL = { leben: 'Leben', komposit: 'Komposit', bonus: 'Bonifikation', zu: 'Zuschüsse' }

const kompakt = v => euroKompakt(v, { einheit: false })
const kompaktDelta = v => (Math.abs(v) < 0.5 ? '–' : euroKompaktDelta(v).replace(' EUR', ''))
const tonDelta = v => (Math.abs(v) < 0.5 ? undefined : deltaTon(v))

export default function Szenarioanalyse({ offen, onSchliessen, einheit, ergebnis, hebel, portfolio }) {
  const [sz, setSz] = useState(LEER)
  const normierung = portfolio?.bonusNormierung ?? 1

  const variante = useMemo(
    () => einheitMitSzenario(einheit, sz, { leben: ergebnis.ist.apLeben, komposit: ergebnis.ist.apKomposit }),
    [einheit, sz, ergebnis])
  const szenario = useMemo(
    () => berechneEinzel(variante, hebel, { bonusNormierung: normierung }),
    [variante, hebel, normierung])

  const aktiv = Object.values(sz).some(v => v !== 0)
  const dHeute = szenario.ist.gesamt - ergebnis.ist.gesamt
  const dZiel = szenario.ziel.gesamt - ergebnis.ziel.gesamt

  const zeilen = useMemo(() => {
    const ref = spartenPaare(ergebnis.ist, ergebnis.ziel)
    const neu = spartenPaare(szenario.ist, szenario.ziel)
    const liste = ref.map((r, i) => ({
      id: r.id, sparte: SPARTEN_LABEL[r.id] ?? r.label,
      heuteRef: r.alt, heuteSz: neu[i].alt, dHeute: neu[i].alt - r.alt,
      zielRef: r.neu, zielSz: neu[i].neu, dZiel: neu[i].neu - r.neu,
    }))
    const summe = (k) => liste.reduce((s, z) => s + z[k], 0)
    liste.push({
      id: 'summe', sparte: 'Summe', summe: true,
      heuteRef: summe('heuteRef'), heuteSz: summe('heuteSz'), dHeute: summe('dHeute'),
      zielRef: summe('zielRef'), zielSz: summe('zielSz'), dZiel: summe('dZiel'),
    })
    return liste
  }, [ergebnis, szenario])

  if (!offen) return null

  const stufeRef = ergebnis.ziel.bonusStufe
  const stufeSz = szenario.ziel.bonusStufe
  const zelle = (v, stark) => <span className={`vg-mono${stark ? ' vg-stark' : ''}`}>{kompakt(v)}</span>
  const deltaZelle = (v) => <span className="vg-mono vg-delta" data-ton={tonDelta(v)}>{kompaktDelta(v)}</span>

  return (
    <Schublade
      offen
      nichtModal
      breite="verhandlung"
      onSchliessen={onSchliessen}
      titel="Szenarioanalyse"
      unter={`${einheit.name} · Produktion und Bestand gegenüber dem Referenzzeitraum ${REFERENZZEITRAUM_TEXT}`}
    >
      <div className="vg-stapel">
        <Karte>
          <KarteKopf
            titel="Annahmen"
            unter="Veränderung gegenüber dem Referenzzeitraum in Prozent — Sätze, Kalibrierung und Qualität bleiben"
            aktionen={<Btn variante="still" groesse="sm" ikone={RotateCcw} onClick={() => setSz(LEER)} disabled={!aktiv}>Zurücksetzen</Btn>}
          />
          <KarteKoerper eng>
            {REGLER.map(def => (
              <ReglerZeile
                key={def.id}
                def={def}
                wert={sz[def.id]}
                onAendern={(id, w) => setSz(s => ({ ...s, [id]: w }))}
                ohneChip
                hinweisZeigen
                dicht
              />
            ))}
          </KarteKoerper>
        </Karte>

        <div className="vg-kennzahlreihe vg-kennzahlreihe-3">
          <Kpi
            titel="Heute, im Szenario"
            wert={euro(szenario.ist.gesamt)}
            fuss={aktiv ? `gegenüber Referenz ${euroKompaktDelta(dHeute)}` : 'wie im Referenzzeitraum'}
            ton={aktiv ? deltaTon(dHeute) : 'neutral'}
          />
          <Kpi
            titel="Zielmodell, im Szenario"
            wert={euro(szenario.ziel.gesamt)}
            fuss={aktiv ? `gegenüber Referenz ${euroKompaktDelta(dZiel)}` : 'wie im Referenzzeitraum'}
            ton={aktiv ? deltaTon(dZiel) : 'neutral'}
          />
          <Kpi
            titel="Zielmodell gegen heute, im Szenario"
            wert={prozentDelta(szenario.delta.prozent)}
            fuss={`${euroKompaktDelta(szenario.delta.absolut)} · Referenz ${prozentDelta(ergebnis.delta.prozent)}`}
            ton={deltaTon(szenario.delta.absolut)}
          />
        </div>

        {/* Feste Zeilen statt Fließtext: die Zahlen ändern sich mit jedem
            Reglerschritt, der Kasten darf dabei nicht zwischen zwei und drei
            Zeilen springen. Tabellenziffern halten auch die Breite ruhig. */}
        <Hinweis>
          <div className="vg-sz-hinweis">
            <div>
              {/* beide Sätze passen in eine Zeile — sonst springt der Kasten beim ersten Reglerschritt */}
              {aktiv
                ? 'Dieselbe Veränderung vergüten die beiden Modelle so:'
                : 'Regler bewegen, beide Welten werden neu gerechnet:'}
            </div>
            <dl className="vg-sz-zeilen">
              <dt>Mehrvergütung heute</dt>
              <dd>{aktiv ? euroKompaktDelta(dHeute) : '–'}</dd>
              <dt>Mehrvergütung Zielmodell</dt>
              <dd>{aktiv ? euroKompaktDelta(dZiel) : '–'}</dd>
              <dt>Zielerreichung · Bonusstufe</dt>
              <dd>
                {prozent(ergebnis.ziel.bonusStufe.zielerreichung * 100, 0)} → {prozent(variante.zielerreichung * 100, 0)}
                {' · '}Stufe {stufeRef.index + 1} → {stufeSz.index + 1}
              </dd>
              <dt>Kassenwirksam 2028 nach Übergangsregel</dt>
              <dd>{euro(szenario.verlauf[0].mitUebergang)} · {prozentDelta(szenario.verlauf[0].deltaProzent)} gegenüber heute im Szenario</dd>
            </dl>
          </div>
        </Hinweis>

        <Karte>
          <KarteKopf titel="Sparten im Szenario" unter="Heute gegen Zielmodell auf der veränderten Produktion, Werte über den Säulen, Delta als Marke" />
          <KarteKoerper>
            <PaarVergleich paare={spartenPaare(szenario.ist, szenario.ziel)} hoehe={240} />
          </KarteKoerper>
        </Karte>

        <Karte>
          <KarteKopf titel="Referenz und Szenario je Sparte" unter="Beträge in EUR, kompakt — Δ ist Szenario gegen Referenz" />
          <KarteKoerper eng>
            <Tabelle
              eng
              spalten={[
                { id: 'sparte', label: 'Sparte', zelle: z => <span className={z.summe ? 'vg-stark' : undefined}>{z.sparte}</span> },
                { id: 'heuteRef', label: 'Heute, Referenz', num: true, zelle: z => zelle(z.heuteRef, z.summe) },
                { id: 'heuteSz', label: 'Heute, Szenario', num: true, zelle: z => zelle(z.heuteSz, z.summe) },
                { id: 'dHeute', label: 'Δ heute', num: true, zelle: z => deltaZelle(z.dHeute) },
                { id: 'zielRef', label: 'Zielmodell, Referenz', num: true, zelle: z => zelle(z.zielRef, z.summe) },
                { id: 'zielSz', label: 'Zielmodell, Szenario', num: true, zelle: z => zelle(z.zielSz, z.summe) },
                { id: 'dZiel', label: 'Δ Zielmodell', num: true, zelle: z => deltaZelle(z.dZiel) },
              ]}
              zeilen={zeilen}
              schluessel={z => z.id}
            />
          </KarteKoerper>
        </Karte>
      </div>
    </Schublade>
  )
}
