import { useMemo } from 'react'
import { Schublade } from '../../ui/Schublade'
import { Karte, KarteKopf, KarteKoerper, Kpi, Hinweis } from '../../ui/basis'
import { VergleichsTafel } from '../../ui/Tafel'
import { PaarVergleich } from '../../charts'
import {
  BAUSTEINE, produktionszeilen, bestandszeilen, bonuszeilen, zuschusszeilen, summenzeile,
} from '../../lib/modell'
import { HEBEL, HEBEL_GRUPPEN } from '../../lib/hebel'
import { REFERENZZEITRAUM_TEXT } from '../../data/einheiten'
import { formatiere, EINHEIT_ZEICHEN } from '../../ui/Regler'
import { euro, euroKompaktDelta, prozentDelta, deltaTon } from '../../lib/format'

/**
 * ERKLÄRUNGS-SCHUBLADE des Simulationskastens — „so kommt die Zahl zustande“.
 *
 * Öffnet sich per Klick auf ein Säulenpaar im Steuerblock (Leben, Komposit,
 * Bonifikation, Zuschüsse) und zeigt für das Gesamtportfolio im
 * Referenzzeitraum: die drei Beträge (heute, Zielmodell, Veränderung), den
 * Rechenweg in einem Satz, die Vergütungskomponenten des Bausteins als
 * Säulenpaare heute gegen Zielmodell (AP, LP, BP — bei Leben zusätzlich die
 * Abschlussprovision nach Produkt), die Zeilen des Bausteins alt/neu und die
 * Regler mit Formeln. Alles aus derselben Portfoliorechnung; Tinte aus
 * Zahlersicht wie überall im Kasten.
 */

const SPALTEN = [
  { id: 'produkt', label: 'Zeile' },
  { id: 'bemessung', label: 'Bemessung' },
  { id: 'alt', label: 'Heute' },
  { id: 'neu', label: 'Zielmodell' },
  { id: 'differenz', label: 'Differenz' },
]

function zeilenFuer(id, ist, ziel, quelle) {
  if (id === 'leben') {
    return [
      ...produktionszeilen(ist, ziel, quelle).filter(z => z.sparte === 'Leben'),
      ...bestandszeilen(ist, ziel, quelle).filter(z => z.id === 'lpLeben' || z.id === 'bpLeben'),
    ]
  }
  if (id === 'komposit') {
    return [
      ...produktionszeilen(ist, ziel, quelle).filter(z => z.sparte === 'Komposit'),
      ...bestandszeilen(ist, ziel, quelle).filter(z => z.id === 'bpKomposit'),
    ]
  }
  if (id === 'bonus') return bonuszeilen(ist, ziel)
  return zuschusszeilen(ist, ziel)
}

/**
 * Vergütungskomponenten eines Bausteins als Paare heute/Zielmodell — aus den
 * Portfolio-Komponenten (berechnePortfolio) oder einem Einheitenergebnis.
 * Paare ohne Betrag in beiden Welten blendet der PaarVergleich selbst aus.
 */
function paareFuer(id, ist, ziel) {
  const p = (pid, label, kurz, feld, hinweis) => ({ id: pid, label, kurz, alt: feld(ist), neu: feld(ziel), hinweis })
  if (id === 'leben') {
    return {
      haupt: [
        p('ap', 'Abschlussprovision', 'AP', e => e.apLeben || 0, 'Einmalig beim Abschluss, in Promille der Beitragssumme.'),
        p('lp', 'Laufende Provision', 'LP', e => e.lp || 0, 'Je Jahrgang über die Laufzeit — im Referenzzeitraum mit allen Jahrgängen gerechnet.'),
        p('bp', 'Bestandsprovision', 'BP', e => e.bpLeben || 0, 'Prozent des Bestandsbeitrags Leben, jedes Jahr.'),
      ],
      detail: {
        titel: 'Abschlussprovision nach Produkt',
        unter: 'Basis, bAV mit Zuschlag, Biometrie mit Zuschlag',
        paare: [
          p('basis', 'Leben (Basis)', 'Basis', e => e.apLebenBasis || 0),
          p('bav', 'bAV', 'bAV', e => e.apLebenBav || 0),
          p('bio', 'Biometrie', 'Biometrie', e => e.apLebenBio || 0),
        ],
      },
    }
  }
  if (id === 'komposit') {
    return {
      haupt: [
        p('ap', 'Abschlussprovision', 'AP', e => e.apKomposit || 0, 'Einmalig beim Abschluss, in Prozent des Jahresnettobeitrags im Neugeschäft.'),
        p('bp', 'Bestandsprovision', 'BP', e => e.bpKomposit || 0, 'Prozent des Bestandsbeitrags Komposit, jedes Jahr.'),
      ],
      detail: {
        titel: 'Abschlussprovision nach Produkt',
        unter: 'Sach, Unfall, Haftpflicht mit vollem Satz; Kfz nur mit dem Rest nach Abschlag',
        paare: [
          p('suh', 'Sach, Unfall, Haftpflicht', 'SUH', e => e.apKompositSuh || 0),
          p('kfz', 'Kfz', 'Kfz', e => e.apKompositKfz || 0),
        ],
      },
    }
  }
  if (id === 'bonus') {
    return {
      haupt: [
        p('roh', 'Rohbonus vor Normierung und Gate', 'Rohbonus', e => e.bonusRoh || 0, 'Abschlussvergütung × Stufensatz der Staffel.'),
        p('bonus', 'Bonifikation gezahlt', 'gezahlt', e => e.bonus || 0, 'Nach Normierung auf das Bonusbudget und Auszahlungsgrad der Muss-Kriterien.'),
      ],
    }
  }
  const t = o => o.zuschussTeile || {}
  return {
    haupt: [
      p('kleinteilig', 'Kleinteilige Zuschüsse', 'Kleinteilig', e => t(e).kleinteilig || 0),
      p('sonder', 'Sonderzuschüsse', 'Sonder', e => t(e).sonder || 0),
      p('fix', 'Feste Zuschüsse', 'Fest', e => t(e).fix || 0),
      p('allgemein', 'Allgemeiner Zuschuss', 'Allgemein', e => t(e).allgemein || 0),
      p('standort', 'Standortzuschuss', 'Standort', e => t(e).standort || 0),
    ],
  }
}

/** „33,0 ‰“, „12 Jahre“, „an“ — in der Nachkommazahl des Reglers */
function wertMitEinheit(wert, def) {
  if (def.einheit === 'schalter') return formatiere(wert, def)
  return `${formatiere(wert, def)} ${EINHEIT_ZEICHEN[def.einheit] ?? ''}`.trim()
}

function BausteinInhalt({ def, portfolio, hebel, onSchliessen }) {
  const paare = useMemo(() => paareFuer(def.id, portfolio.ist, portfolio.ziel), [def, portfolio])

  const heute = def.mass(portfolio.ist)
  const neu = def.mass(portfolio.ziel)
  const delta = neu - heute
  const prozent = heute > 0 ? (delta / heute) * 100 : 0

  const zeilen = useMemo(() => zeilenFuer(def.id, portfolio.ist, portfolio.ziel, portfolio), [def, portfolio])
  const regler = useMemo(() => HEBEL.filter(h => def.hebelGruppen.includes(h.gruppe)), [def])
  const mitwirkend = HEBEL_GRUPPEN.filter(g => def.mitwirkend.includes(g.id)).map(g => g.titel)
  const lpDauer = Math.round(hebel.lpDauer ?? 0)

  return (
    <Schublade
      offen
      nichtModal
      breite="verhandlung"
      onSchliessen={onSchliessen}
      titel={`${def.label}: so kommt die Zahl zustande`}
      unter={`Gesamtportfolio im Referenzzeitraum ${REFERENZZEITRAUM_TEXT} · heute gegen Zielmodell`}
    >
      <div className="vg-stapel">
        <div className="vg-kennzahlreihe vg-kennzahlreihe-3">
          <Kpi titel="Heute (Referenzzeitraum)" wert={euro(heute)} fuss="gemeldet und kalibriert" />
          <Kpi titel="Zielmodell (Referenzzeitraum)" wert={euro(neu)} fuss="so gerechnet, als gälte es dort bereits vollständig" />
          <Kpi
            titel="Veränderung"
            wert={euroKompaktDelta(delta)}
            fuss={`${prozentDelta(prozent)} · aus Sicht des Zahlenden`}
            ton={deltaTon(delta, { zahlersicht: true })}
          />
        </div>

        <Hinweis>
          <strong>Rechenweg.</strong> {def.erklaerung}
          {def.id === 'leben' && lpDauer > 0 && (
            <> Die laufende Provision ist hier mit allen {lpDauer} Jahrgängen gerechnet; kassenwirksam baut sie
            sich ab 2028 Jahrgang für Jahrgang auf — daher die kumulierte Delle bis 2030 im Steuerblock.</>
          )}
        </Hinweis>

        <Karte>
          <KarteKopf
            titel="Vergütungskomponenten heute gegen Zielmodell"
            unter="Je Komponente zwei Säulen mit ihren Werten, das Delta als Marke darüber — hier unterscheidet sich die Vergütung der Sparte"
          />
          <KarteKoerper>
            <PaarVergleich paare={paare.haupt} hoehe={250} zahlersicht />
          </KarteKoerper>
        </Karte>

        {paare.detail && (
          <Karte>
            <KarteKopf titel={paare.detail.titel} unter={paare.detail.unter} />
            <KarteKoerper>
              <PaarVergleich paare={paare.detail.paare} hoehe={220} zahlersicht />
            </KarteKoerper>
          </Karte>
        )}

        <Karte>
          <KarteKopf titel={`Zeilen des Bausteins ${def.label}`} unter="Bemessung, heute, Zielmodell, Differenz — Beträge in EUR" />
          <KarteKoerper eng>
            <VergleichsTafel spalten={SPALTEN} zeilen={zeilen} summe={summenzeile(zeilen)} zahlersicht dicht />
          </KarteKoerper>
        </Karte>

        <Karte>
          <KarteKopf
            titel="Regler und Formeln"
            unter={mitwirkend.length ? `Als Faktoren wirken außerdem: ${mitwirkend.join(', ')}` : 'Alle Regler dieses Bausteins'}
          />
          <KarteKoerper eng>
            <div className="vg-tabelle-rahmen">
              <table className="vg-tabelle vg-tabelle-eng">
                <thead>
                  <tr>
                    <th>Regler</th>
                    <th data-num="true">heute</th>
                    <th data-num="true">Zielmodell</th>
                    <th>Formel</th>
                  </tr>
                </thead>
                <tbody>
                  {regler.map(r => {
                    const aktuell = hebel[r.id] ?? r.standard
                    const veraendert = Math.abs(aktuell - r.basis) > 1e-9
                    return (
                      <tr key={r.id}>
                        <td className="vg-erste-spalte">{r.label}</td>
                        <td data-num="true" className="vg-mono">{wertMitEinheit(r.basis, r)}</td>
                        <td data-num="true" className={`vg-mono${veraendert ? ' vg-stark' : ''}`}>{wertMitEinheit(aktuell, r)}</td>
                        <td className="vg-schwach">{r.wirkung}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </KarteKoerper>
        </Karte>
      </div>
    </Schublade>
  )
}

/**
 * Erklärungs-Schublade zu einem Baustein des Steuerblock-Säulenpaars.
 * Der Inhalt wird erst bei geöffneter Schublade aufgebaut.
 */
export default function BausteinErklaerung({ baustein, portfolio, hebel, onSchliessen }) {
  const def = baustein ? BAUSTEINE[baustein] : null
  if (!def) return null
  return <BausteinInhalt def={def} portfolio={portfolio} hebel={hebel} onSchliessen={onSchliessen} />
}
