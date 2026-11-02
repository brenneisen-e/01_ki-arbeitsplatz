import { useMemo } from 'react'
import { SlidersHorizontal, Building2, ArrowRight } from 'lucide-react'
import { Karte, KarteKopf, KarteKoerper, KarteFuss, Delta, Btn, Tip } from '../../ui/basis'
import { lageUrteil, ton, Farblegende } from '../../ui/Waage'
import { Verlauf, AnteilsBalken, AMPEL_FARBE, BAUTEIL_FARBE } from '../../charts'
import { useMarke } from '../../marke/MarkeProvider'
import { START_JAHR, KUMULIERT_BIS } from '../../lib/modell'
import { euroKompakt, euroKompaktDelta, prozent, prozentDelta, datum } from '../../lib/format'
import { useZaehlwert } from '../../lib/bewegung'
import WaageAchse from './WaageAchse'
import './start.css'

// Erscheinens-Staffel beim Öffnen der Route (§ 2 g): Leitband 0, Marker der
// Achse 500/620/740 (im Bauteil), Türen 900, Diagramm 1050 ms. Läuft nur
// beim Mount — die Klassen sitzen auf Hüllen, die kein Re-Render austauscht.
const STAFFEL = { tueren: 900, diagramm: 1050 }

const METHODE =
  'Gezeigt wird das schlechtere der beiden Budgetsignale — Vergleich Referenzzeitraum ' +
  'und kumuliert bis 2030 barwertig; der Barwert je Jahrgang steht nachrichtlich in Grau ' +
  'daneben. Mehr als heute ist ab ' +
  '1,5 % eine Warnung und ab 4 % eine Überschreitung des Budgets. Deutlich ' +
  'weniger als heute, unter −4 %, ist ebenfalls eine Warnung: dort verlieren ' +
  'die Institute, und wer verliert, stellt nicht um.'

/**
 * „61,1 statt 65,7 Mio. EUR“: die Einheit steht nur einmal, wenn beide
 * Beträge dieselbe Größenordnung haben — sonst tragen beide ihre eigene.
 */
function stattSatz(neu, alt) {
  const a = euroKompakt(neu), b = euroKompakt(alt)
  const zahlTeil = (s) => s.match(/^[−+\d.,]+/)?.[0] ?? s
  const einheit = (s) => s.slice(zahlTeil(s).length).trim()
  if (einheit(a) === einheit(b)) return `${zahlTeil(a)} statt ${b}`
  return `${a} statt ${b}`
}

/** Leitzahl während des Zählens: bei 0 ohne „±“, danach wie überall. */
function leitzahlText(wert, fertig) {
  if (!fertig && Math.abs(wert) < 0.05) return '0,0 %'
  return prozentDelta(wert)
}

function Tuer({ titel, text, ikone: Ikone, aufKlick, kind, taste }) {
  return (
    <Karte className="vg-tuer" onClick={aufKlick} role="link" tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); aufKlick() } }}>
      <KarteKopf
        titel={titel}
        unter={text}
        ikone={Ikone}
        aktionen={
          <span className="vg-reihe" style={{ gap: 8 }}>
            {taste && (
              <Tip text={`Taste ${taste}`}>
                <span className="vg-taste">{taste}</span>
              </Tip>
            )}
            <span className="vg-tuer-pfeil"><ArrowRight size={16} strokeWidth={2} /></span>
          </span>
        }
      />
      <KarteKoerper>{kind}</KarteKoerper>
    </Karte>
  )
}

/**
 * Leitband — die eine Zahl, die die Leitfrage beantwortet.
 * Gezeigt wird das SCHLECHTERE der beiden Budgetsignale (Vergleich
 * Referenzzeitraum, kumuliert bis 2030) im zweiseitigen Korridor
 * (Waage.jsx): über Budget, oder deutlich unter heute, weil dort die
 * Institute verlieren. Das andere steht mit ihm auf der Waageachse, der
 * Barwert je Jahrgang nachrichtlich in Grau, damit die Zahl nicht isoliert
 * gelesen wird.
 */
function Leitband({ portfolio, jahr1, meta }) {
  const signale = [
    { id: 'ein', label: 'Vergleich Referenzzeitraum', prozent: portfolio.delta.prozent,
      absolut: portfolio.delta.absolut,
      satz: `${stattSatz(portfolio.ziel.gesamt, portfolio.ist.gesamt)} im Referenzzeitraum` },
    { id: 'bw', label: 'barwertig je Jahrgang (nachrichtlich)', prozent: portfolio.barwert.prozent,
      absolut: portfolio.barwert.absolut, ton: 'neutral',
      satz: `${stattSatz(portfolio.barwert.ziel, portfolio.barwert.ist)} je Jahrgang, barwertig` },
    { id: 'kum', label: `kumuliert bis ${KUMULIERT_BIS} (Barwert)`, prozent: portfolio.kumuliert.prozent,
      absolut: portfolio.kumuliert.absolut,
      satz: `${stattSatz(portfolio.kumuliert.ziel, portfolio.kumuliert.heute)} kumuliert ${START_JAHR} bis ${KUMULIERT_BIS}, barwertig` },
  ]
  const lage = lageUrteil({ eingeschwungen: signale[0].prozent, startjahr: signale[2].prozent })
  const t = lage.ton
  const schlimmstes = signale.find(s => s.id !== 'bw' && s.prozent === lage.wert) ?? signale[0]
  const heuteZustand = signale.every(s => Math.abs(s.prozent) < 0.05)
  const urteil = lage.wort

  // Die Leitzahl zählt einmalig 900 ms von 0,0 % hoch; Ton und Tonkante
  // kommen erst ab 90 % des Wegs, damit die Zahl in Schwarz läuft und am
  // Ende Farbe bekommt.
  const ziel = schlimmstes.prozent
  const wert = useZaehlwert(ziel)
  const gefaerbt = Math.abs(wert) >= 0.9 * Math.abs(ziel)
  const tonZahl = gefaerbt ? ton(ziel) : undefined

  return (
    <section className="vg-leitband" data-ton={gefaerbt ? t : undefined}>
      <div className="vg-leitband-kopf">
        <Tip text={METHODE} breite={360}>
          <span className="vg-leitband-urteil" data-ton={t} tabIndex={0}>
            <span className="vg-punkt" />
            {urteil}
          </span>
        </Tip>
        <span className="vg-leitband-meta" title={meta}>{meta}</span>
      </div>

      <div className="vg-leitband-zahl">
        <span className="vg-leitband-wert" data-ton={tonZahl}>{leitzahlText(wert, gefaerbt)}</span>
        <span className="vg-leitband-satz">{schlimmstes.satz}</span>
      </div>
      {/* Alle drei Signale auf null: die Fassung rechnet wie heute — meist,
          weil das Szenario „Heute“ gewählt wurde. Das sagt die Seite, statt
          eine leere Waage zu zeigen. */}
      {heuteZustand && (
        <p className="vg-leitband-hinweis">
          Die aktive Fassung entspricht dem heutigen Modell.{' '}
          <a href="#/simulation">Im Simulationskasten</a> ein Szenario wählen oder einen Regler ziehen.
        </p>
      )}

      <WaageAchse signale={signale} leitId={schlimmstes.id} />
      <Farblegende />
    </section>
  )
}

/** Vergütungsstruktur auf drei Teile verdichtet; Bonifikation und Zuschüsse werden „übrige“. */
function strukturTeile(k) {
  return [
    { id: 'ap', label: 'Abschluss', wert: k.ap, farbe: BAUTEIL_FARBE.ap },
    { id: 'lp', label: 'Laufend', wert: k.lp, farbe: BAUTEIL_FARBE.lp },
    { id: 'bp', label: 'Bestand', wert: k.bp, farbe: BAUTEIL_FARBE.bp },
    { id: 'uebrige', label: 'übrige', wert: k.bonus + k.zuschuesse, farbe: 'var(--vg-viz-7)' },
  ]
}

export default function Startseite({ portfolio, navigiere }) {
  const { marke, sprache } = useMarke()
  const jahr1 = portfolio.verlauf[0]

  const verteilung = useMemo(() => {
    const v = portfolio.verteilungVolumen
    return [
      { id: 'gewinner', label: 'Gewinner', wert: v.gewinner, farbe: AMPEL_FARBE.gewinner },
      { id: 'neutral', label: 'Neutral', wert: v.neutral, farbe: AMPEL_FARBE.neutral },
      { id: 'verlierer', label: 'Verlierer', wert: v.verlierer, farbe: AMPEL_FARBE.kritisch },
    ]
  }, [portfolio])

  const istTeile = useMemo(() => strukturTeile(portfolio.ist), [portfolio])
  const zielTeile = useMemo(() => strukturTeile(portfolio.ziel), [portfolio])

  const groessteRueckgaenge = useMemo(() => portfolio.ergebnisse
    .filter(e => e.einheit.kanal === 'sparkasse')
    .sort((a, b) => a.delta.prozent - b.delta.prozent)
    .slice(0, 3), [portfolio])

  // Tiefpunkt wie im Verlauf (gehoben.jsx): das Jahr mit dem kleinsten
  // Abstand „mit Übergangsregel“ gegenüber heute.
  const tief = useMemo(() => portfolio.verlauf
    .reduce((a, r) => (r.delta < a.delta ? r : a), portfolio.verlauf[0]), [portfolio])

  const meta = `${sprache.modellZiel} · ${marke.mandantName} · Go-Live ${datum(`${START_JAHR}-01-01`)}`

  return (
    <div className="vg-start">
      <div className="vg-buehne-ein">
        <Leitband portfolio={portfolio} jahr1={jahr1} meta={meta} />
      </div>

      <div className="vg-raster vg-raster-2 vg-buehne-ein" style={{ animationDelay: `${STAFFEL.tueren}ms` }}>
        <Tuer
          titel="Simulationskasten"
          text="Alle Stellhebel in einem Kasten — AP, BP, Bonusstaffel, Garantien, Zuschüsse. Alles rechnet sofort."
          ikone={SlidersHorizontal}
          taste="1"
          aufKlick={() => navigiere('simulation')}
          kind={
            <div className="vg-tuer-vorschau">
              <div className="vg-tuer-balkenzeile">
                <span className="vg-tuer-balkenlabel">heute</span>
                <AnteilsBalken teile={istTeile} hoehe={8} mitLegende={false} />
              </div>
              <div className="vg-tuer-balkenzeile">
                <span className="vg-tuer-balkenlabel">Zielmodell</span>
                <AnteilsBalken teile={zielTeile} hoehe={8} mitLegende={false} />
              </div>
              <div className="vg-tuer-legende">
                {istTeile.slice(0, 3).map(t => (
                  <span className="vg-tuer-legende-eintrag" key={t.id}>
                    <span className="vg-legende-marke" style={{ background: t.farbe }} />
                    <span className="vg-tuer-legende-label">{t.label}</span>
                    <span className="vg-tuer-legende-wert">
                      {prozent(portfolio.struktur.ist[t.id] * 100, 0).replace(' %', '')}
                      {' '}<span className="vg-pfeil" aria-hidden="true" />{' '}
                      {prozent(portfolio.struktur.ziel[t.id] * 100, 0)}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          }
        />

        <Tuer
          titel="Umstellungstool"
          text="Je Institut ein Dashboard: Produktionszeilen, Bestand, Bonifikation, Garantien."
          ikone={Building2}
          taste="2"
          aufKlick={() => navigiere('umstellung')}
          kind={
            <div className="vg-stapel" style={{ gap: 11 }}>
              <div>
                <div className="vg-reihe-weit" style={{ marginBottom: 6 }}>
                  <span className="vg-kpi-titel" style={{ margin: 0 }}>Verteilung nach Vergütungsvolumen</span>
                  <span className="vg-t-sm vg-schwach">{portfolio.ergebnisse.length} Einheiten</span>
                </div>
                <AnteilsBalken teile={verteilung} />
              </div>
              <div className="vg-tuer-haeuser">
                <span className="vg-tuer-haeuser-kopf">Die drei Häuser mit dem größten Rückgang</span>
                {groessteRueckgaenge.map(e => (
                  <div className="vg-reihe-weit" key={e.einheit.id}>
                    <span className="vg-t-sm vg-kappen" title={e.einheit.name}>{e.einheit.name}</span>
                    <Delta prozent={e.delta.prozent} nurProzent />
                  </div>
                ))}
              </div>
            </div>
          }
        />
      </div>

      <div className="vg-buehne-ein" style={{ animationDelay: `${STAFFEL.diagramm}ms` }}>
        <Karte>
          <KarteKopf
            titel={`Forecast: was ${START_JAHR} bis ${portfolio.verlauf[portfolio.verlauf.length - 1].jahr} fließt`}
            unter={tief.delta < 0
              ? `gegenüber heute · Tiefpunkt ${tief.jahr}: ${euroKompaktDelta(tief.delta)}`
              : 'gegenüber heute'}
          />
          <KarteKoerper>
            <Verlauf reihe={portfolio.verlauf} hoehe={220} kompakt />
          </KarteKoerper>
          <KarteFuss>
            <Btn variante="still" groesse="sm" onClick={() => navigiere('grundlagen')}>
              Grundlagen und Annahmen
            </Btn>
          </KarteFuss>
        </Karte>
      </div>
    </div>
  )
}
