import { useMemo } from 'react'
import { BookOpen, ShieldCheck, Calculator, Database, CircleCheck, CircleAlert } from 'lucide-react'
import { Karte, KarteKopf, KarteKoerper, Badge, Hinweis, WertZeile, Aufklapp } from '../../ui/basis'
import Tabelle from '../../ui/Tabelle'
import {
  WAHLMODELLE, BONUS_STAFFEL, QUALITAETSKRITERIEN, QUALITAET_NEUTRAL, QUALITAETS_GEWICHTE,
  JOURNEYS, KANALFAKTOR, KOMPOSIT_VERTRAGSDAUER, WASSERFALL_STUFEN, STEUERUNGSZIELE,
  pruefeKonsistenz,
} from '../../lib/modell'
import { HEBEL, HEBEL_GRUPPEN, HEBEL_INDEX, ERWEITERT } from '../../lib/hebel'
import { LEITPLANKEN } from '../../lib/leitplanken'
import { EINHEITEN, PORTFOLIO_KENNZAHLEN, DEMO_HINWEIS, REFERENZZEITRAUM_TEXT, pruefeKalibrierung } from '../../data/einheiten'
import { euro, euroKompakt, prozent, zahl, datum } from '../../lib/format'

export default function Grundlagen({ hebel, portfolio }) {
  const konsistenz = useMemo(() => pruefeKonsistenz(EINHEITEN, hebel), [hebel])
  const kalibrierung = useMemo(() => pruefeKalibrierung(), [])

  return (
    <div className="vg-stapel">
      <div>
        <h2 className="vg-t-2xl vg-fett" style={{ margin: 0, letterSpacing: '-.02em' }}>Grundlagen</h2>
        <p className="vg-merkzeile" style={{ margin: '2px 0 0' }}>
          Datenherkunft, Annahmen, Formeln und Selbstprüfungen. Jede Zahl im Werkzeug lässt sich hier zurückverfolgen.
        </p>
      </div>

      <Hinweis ton="warnung">
        <strong>{DEMO_HINWEIS}</strong> Sämtliche Produktions-, Bestands- und Vergütungskennzahlen sind frei gewählte,
        in sich konsistente Demodaten in plausibler Größenordnung. Institutsstammdaten wie Bilanzsumme und
        Geschäftsstellenzahl orientieren sich an öffentlich verfügbaren Angaben, alle Versicherungskennzahlen sind fiktiv.
      </Hinweis>

      <div className="vg-raster vg-raster-2">
        <Karte>
          <KarteKopf titel="Selbstprüfung" unter="Läuft bei jedem Aufruf mit den aktuellen Reglerwerten" ikone={ShieldCheck} />
          <KarteKoerper>
            <div className="vg-stapel" style={{ gap: 10 }}>
              <div className="vg-hinweis" data-ton={konsistenz.bestanden ? 'positiv' : 'negativ'}>
                {konsistenz.bestanden ? <CircleCheck size={15} strokeWidth={1.9} /> : <CircleAlert size={15} strokeWidth={1.9} />}
                <div>
                  <strong>Makro gleich Summe Mikro.</strong> Die Gesamtrechnung ergibt {euro(konsistenz.makro)},
                  die Summe der Einzelrechnungen {euro(konsistenz.summeMikro)}. Abweichung {euro(konsistenz.abweichung)}.
                </div>
              </div>
              <div className="vg-hinweis" data-ton={kalibrierung.bestanden ? 'positiv' : 'warnung'}>
                {kalibrierung.bestanden ? <CircleCheck size={15} strokeWidth={1.9} /> : <CircleAlert size={15} strokeWidth={1.9} />}
                <div>
                  <strong>Kalibrierung auf die gemeldete Vergütung.</strong>{' '}
                  {kalibrierung.bestanden
                    ? `Alle ${EINHEITEN.length} Einheiten treffen ihre gemeldete Vergütung des Referenzjahres auf unter 0,05 Prozent genau.`
                    : `${kalibrierung.abweichungen.length} Einheiten weichen um mehr als 0,05 Prozent ab.`}
                </div>
              </div>
            </div>
          </KarteKoerper>
        </Karte>

        <Karte>
          <KarteKopf titel="Datengrundlage" unter={`Referenzzeitraum ${REFERENZZEITRAUM_TEXT} (letztes abgeschlossenes Wertungsjahr)`} ikone={Database} />
          <KarteKoerper>
            <WertZeile label="Vertriebseinheiten in der Rechnung" wert={zahl(EINHEITEN.length)} />
            <WertZeile label="Institute" wert={zahl(PORTFOLIO_KENNZAHLEN.institute)} />
            <WertZeile label="Agenturen (in Clustern geführt)" wert={zahl(PORTFOLIO_KENNZAHLEN.agenturen)} />
            <WertZeile label="Beitragseinnahmen Bestand" wert={euro(PORTFOLIO_KENNZAHLEN.beitragseinnahmen)} />
            <WertZeile label="Neugeschäft Leben (Beitragssumme)" wert={euro(PORTFOLIO_KENNZAHLEN.neugeschaeftLeben)} />
            <WertZeile label="Neugeschäft Komposit (Jahresbeitrag)" wert={euro(PORTFOLIO_KENNZAHLEN.neugeschaeftKomposit)} />
            <WertZeile label="Gemeldete Vergütung gesamt" wert={euro(PORTFOLIO_KENNZAHLEN.verguetungIst)} />
          </KarteKoerper>
        </Karte>
      </div>

      <Aufklapp titel="Rechenweg" unter="Wie aus Produktion, Bestand und Reglern eine Vergütung wird" offenStandard>
        <div className="vg-raster vg-raster-2" style={{ gap: 20, alignItems: 'start' }}>
          <div>
            <div className="vg-kpi-titel" style={{ marginBottom: 6 }}>Grundgedanke</div>
            <p className="vg-merkzeile" style={{ margin: 0 }}>
              Das heutige Modell ist kein Sonderfall, sondern derselbe Formelapparat mit den Basiswerten der Regler.
              Dadurch ist jeder Vergleich strukturell konsistent, und die Zerlegung im Wasserfall geht exakt auf.
              Makro ist definitionsgemäß die Summe der Einzelrechnungen — auch die Bonusstaffel wird institutsscharf
              gerechnet, weil eine Sprungstaffel auf dem Aggregat nicht korrekt wäre.
            </p>
          </div>

          <div>
            <div className="vg-kpi-titel" style={{ marginBottom: 6 }}>Kalibrierung</div>
            <p className="vg-merkzeile" style={{ margin: 0 }}>
              Für jede Einheit wird einmalig ein Faktor je Vergütungskomponente bestimmt, sodass die Modellrechnung
              mit den Basiswerten exakt die gemeldete Vergütung des Referenzjahres trifft. Dieser Faktor ist eine
              Konstante der Einheit und wirkt in beiden Welten gleich — Deltas, Wasserfall und Aggregation bleiben
              davon unberührt.
            </p>
          </div>

          <div>
            <div className="vg-kpi-titel" style={{ marginBottom: 6 }}>Zwei Bewertungssichten</div>
            <p className="vg-merkzeile" style={{ margin: 0 }}>
              <strong>Im Referenzzeitraum</strong> rechnet das Zielmodell auf Produktion und Bestand des letzten
              abgeschlossenen Wertungsjahres, so als gälte es dort bereits vollständig: alle Jahrgänge der laufenden
              Provision zahlen, das Modell ist eingeschwungen. Das ist Kalkulation auf gemeldeten Zahlen, keine
              Prognose. <strong>Kumuliert bis 2030 (Barwert)</strong> summiert die kassenwirksamen Jahre 2028 bis 2030
              gegenüber heute, mit Übergangsregel, abgezinst mit dem Diskontsatz der Fassung: der Preis der
              Einführungsphase. Der Forecast dahinter ist die Fortschreibung des Referenzzeitraums über den Aufbau
              der laufenden Provision, ohne Wachstumsannahme. Beide Sichten fallen auseinander, weil die laufende
              Provision sich erst über die Jahrgänge aufbaut — genau diese Lücke ist der Verhandlungsgegenstand.
            </p>
          </div>

          <div>
            <div className="vg-kpi-titel" style={{ marginBottom: 6 }}>Reihenfolge der Wasserfallstufen</div>
            <ol className="vg-merkzeile" style={{ margin: 0, paddingLeft: 20 }}>
              {WASSERFALL_STUFEN.map(s => (
                <li key={s.id} style={{ marginBottom: 3 }}>
                  <strong>{s.label}</strong> — {s.hinweis}
                </li>
              ))}
            </ol>
            <p className="vg-merkzeile" style={{ marginTop: 6 }}>
              Die Reihenfolge ist fachlich fixiert und nicht konfigurierbar, damit Wasserfälle zwischen Einheiten
              vergleichbar bleiben. Jede Stufe ist die Differenz zweier vollständiger Modellrechnungen.
            </p>
          </div>
        </div>
      </Aufklapp>

      <Aufklapp titel="Leitplanken der Fachkonzeption" unter="Welche Entscheidung in welchem Regler steckt" offenStandard>
        <p className="vg-merkzeile" style={{ marginTop: 0 }}>
          Die Regler sind keine freien Parameter, sondern die Übersetzung der fachlichen Leitplanken. Jede Leitplanke
          führt zu einer Maßnahme, jede Maßnahme zu benannten Reglern — so lässt sich jeder Simulationslauf auf eine
          Entscheidung der Fachkonzeption zurückführen. Neue Leitplanken werden hier ergänzt und bekommen ihre Regler.
        </p>
        <Tabelle
          eng
          spalten={[
            { id: 'leitplanke', label: 'Leitplanke', sortierbar: false, wert: l => l.leitplanke, zelle: l => <span className="vg-stark">{l.leitplanke}</span> },
            { id: 'massnahme', label: 'Maßnahme im Zielmodell', sortierbar: false, wert: l => l.massnahme },
            {
              id: 'hebel', label: 'Regler', sortierbar: false,
              wert: l => l.hebel.map(id => HEBEL_INDEX[id]?.label ?? id).join(', '),
              zelle: l => (
                <span className="vg-reihe vg-wrap" style={{ gap: 4 }}>
                  {l.hebel.map(id => <Badge key={id}>{HEBEL_INDEX[id]?.kurz ?? id}</Badge>)}
                </span>
              ),
            },
            { id: 'sichtbar', label: 'Sichtbar in', sortierbar: false, wert: l => l.sichtbar },
          ]}
          zeilen={LEITPLANKEN}
          schluessel={l => l.id}
        />
      </Aufklapp>

      <Aufklapp titel="Wahlmodelle" unter="Faktoren auf dieselben Basissätze">
        <Tabelle
          eng
          spalten={[
            { id: 'label', label: 'Modell', wert: m => m.label },
            { id: 'ap', label: 'Faktor AP Leben', num: true, wert: m => m.leben.ap, zelle: m => <span className="vg-mono">{zahl(m.leben.ap, 2)}</span> },
            { id: 'lp', label: 'Faktor LP Leben', num: true, wert: m => m.leben.lp, zelle: m => <span className="vg-mono">{zahl(m.leben.lp, 2)}</span> },
            { id: 'bp', label: 'Faktor BP Leben', num: true, wert: m => m.leben.bp, zelle: m => <span className="vg-mono">{zahl(m.leben.bp, 2)}</span> },
            { id: 'apk', label: 'Faktor AP Komposit', num: true, wert: m => m.komposit.ap, zelle: m => <span className="vg-mono">{zahl(m.komposit.ap, 2)}</span> },
            { id: 'bpk', label: 'Faktor BP Komposit', num: true, wert: m => m.komposit.bp, zelle: m => <span className="vg-mono">{zahl(m.komposit.bp, 2)}</span> },
            { id: 'b', label: 'Beschreibung', sortierbar: false, wert: m => m.beschreibung },
          ]}
          zeilen={Object.values(WAHLMODELLE)}
          schluessel={m => m.id}
        />
      </Aufklapp>

      <Aufklapp titel="Qualität und Requalifizierung" unter="Gewichte, Schwellen und Neutralitätsanker">
        <div className="vg-raster vg-raster-2">
          <div>
            <div className="vg-kpi-titel" style={{ marginBottom: 8 }}>Teilscores und Gewichte</div>
            {Object.entries(QUALITAETS_GEWICHTE).map(([k, v]) => (
              <WertZeile key={k} label={{
                storno: 'Stornoquote', duration: 'Beitragsduration',
                ausschoepfung: 'Bestandsausschöpfung', weiterbildung: 'Weiterbildung',
              }[k]} wert={prozent(v * 100, 0)} />
            ))}
            <p className="vg-merkzeile" style={{ marginTop: 10 }}>
              Der Neutralitätsanker liegt bei einem Score von <strong>{zahl(QUALITAET_NEUTRAL * 100)}</strong> von 100.
              Bei diesem Wert ist der Requalifizierungsfaktor exakt 1,00. Er entspricht dem gewichteten Durchschnitt
              des heutigen Portfolios — das Qualitätssystem verteilt damit um, es kürzt nicht.
            </p>
          </div>
          <div>
            <div className="vg-kpi-titel" style={{ marginBottom: 8 }}>Muss-Kriterien der Bonifikation</div>
            {QUALITAETSKRITERIEN.map((k, i) => (
              <div key={k.id} style={{ padding: '6px 0', borderBottom: '1px solid var(--vg-rand)' }}>
                <div className="vg-reihe" style={{ gap: 7 }}>
                  <Badge>{i + 1}</Badge>
                  <span className="vg-stark">{k.label}</span>
                </div>
                <p className="vg-merkzeile" style={{ margin: '3px 0 0' }}>{k.beschreibung}</p>
              </div>
            ))}
            <p className="vg-merkzeile" style={{ marginTop: 10 }}>
              Kein Kriterium verfehlt: 100 Prozent Auszahlung. Eines verfehlt: 75 Prozent. Zwei oder mehr: keine
              Auszahlung. Wie viele Kriterien geprüft werden, steuert der Regler „Anzahl Muss-Qualitätskriterien“.
            </p>
          </div>
        </div>
      </Aufklapp>

      <Aufklapp titel="Bonusstaffel" unter="Progressive Sprungstaffel auf Institutsebene">
        <Tabelle
          eng
          spalten={[
            { id: 'label', label: 'Zielerreichung', wert: s => s.label },
            { id: 'satz', label: 'Bonussatz auf die Abschlussvergütung', num: true, wert: s => s.satz, zelle: s => <span className="vg-mono">{prozent(s.satz * 100)}</span> },
          ]}
          zeilen={BONUS_STAFFEL}
          schluessel={s => s.label}
        />
        <p className="vg-merkzeile" style={{ marginTop: 10 }}>
          Der Regler „Progression“ spreizt die Sätze um ihren Mittelwert. Der Rohbonus wird anschließend auf das über
          den Regler „Bonusbudget“ gesetzte Volumen normiert — 100 Prozent bedeutet denselben Euro-Betrag wie heute,
          nur anders verteilt. Erst danach greift das Qualitätsgate, damit es real Geld einspart und nicht wegnormiert wird.
        </p>
      </Aufklapp>

      <Aufklapp titel="Journey-Teilung" unter="Wer welchen Teil der Kundenreise leistet">
        <Tabelle
          eng
          spalten={[
            { id: 'label', label: 'Journey', wert: j => j.label },
            { id: 'kontakt', label: 'Kontakt', wert: j => j.eigner.kontakt },
            { id: 'lead', label: 'Lead', wert: j => j.eigner.lead },
            { id: 'beratung', label: 'Beratung', wert: j => j.eigner.beratung },
            { id: 'abschluss', label: 'Abschluss', wert: j => j.eigner.abschluss },
            { id: 'betreuung', label: 'Betreuung', wert: j => j.eigner.betreuung },
          ]}
          zeilen={JOURNEYS}
          schluessel={j => j.id}
        />
        <p className="vg-merkzeile" style={{ marginTop: 10 }}>
          Kontakt zählt 10 Punkte, Lead 20, Beratung 30, Betreuung nach Reglerstellung, Abschluss den Rest.
          Der Partneranteil ist die Summe der Punkte, die auf ihn entfallen. Der Regler „Anteil hybrider
          Kundenreisen“ verschiebt Volumen aus der reinen Vertriebspartner-Journey in die übrigen drei.
        </p>
      </Aufklapp>

      <Aufklapp titel="Steuerungswirkung" unter="Wie die sechs Werte hergeleitet werden">
        {STEUERUNGSZIELE.map(z => (
          <div key={z.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--vg-rand)' }}>
            <div className="vg-stark">{z.label}</div>
            <p className="vg-merkzeile" style={{ margin: '2px 0 0' }}>{z.hinweis}</p>
          </div>
        ))}
        <p className="vg-merkzeile" style={{ marginTop: 10 }}>
          Alle Skalen sind auf 0 bis 100 normiert und aus den Reglerstellungen und Modellergebnissen gerechnet.
          Es gibt keine Punktvergabe nach Gefühl.
        </p>
      </Aufklapp>

      <Aufklapp titel="Alle Regler im Überblick" unter={`${HEBEL.length} Regler in ${HEBEL_GRUPPEN.length} Gruppen`}>
        <Tabelle
          eng
          hoch
          spalten={[
            { id: 'label', label: 'Regler', wert: h => h.label },
            { id: 'gruppe', label: 'Gruppe', wert: h => HEBEL_GRUPPEN.find(g => g.id === h.gruppe)?.kurz },
            { id: 'einheit', label: 'Einheit', wert: h => h.einheit },
            { id: 'basis', label: 'heute', num: true, wert: h => h.basis, zelle: h => <span className="vg-mono">{zahl(h.basis, 2)}</span> },
            { id: 'standard', label: 'Vorschlag', num: true, wert: h => h.standard, zelle: h => <span className="vg-mono">{zahl(h.standard, 2)}</span> },
            { id: 'aktuell', label: 'aktuell', num: true, wert: h => hebel[h.id] ?? h.standard, zelle: h => <span className="vg-mono vg-stark">{zahl(hebel[h.id] ?? h.standard, 2)}</span> },
            { id: 'wirkung', label: 'Wirkung', sortierbar: false, wert: h => h.wirkung },
          ]}
          zeilen={HEBEL}
          schluessel={h => h.id}
        />
      </Aufklapp>

      <Aufklapp titel="Weitere Annahmen">
        <div className="vg-raster vg-raster-2">
          <div>
            <div className="vg-kpi-titel" style={{ marginBottom: 8 }}>Modellkonstanten</div>
            <WertZeile label="Kanalfaktor Leben (Sparkasse / Agentur / Direkt)"
              wert={`${zahl(KANALFAKTOR.leben.sparkasse, 2)} / ${zahl(KANALFAKTOR.leben.ao, 2)} / ${zahl(KANALFAKTOR.leben.direkt, 2)}`} />
            <WertZeile label="Kanalfaktor Komposit (Sparkasse / Agentur / Direkt)"
              wert={`${zahl(KANALFAKTOR.komposit.sparkasse, 2)} / ${zahl(KANALFAKTOR.komposit.ao, 2)} / ${zahl(KANALFAKTOR.komposit.direkt, 2)}`} />
            <WertZeile label="Mittlere Vertragsdauer Komposit" wert={`${zahl(KOMPOSIT_VERTRAGSDAUER, 1)} Jahre`} />
            <WertZeile label="Volumenschwelle Kleininstitutssockel" wert={euro(800000)} />
            <WertZeile label="Start des Zielmodells" wert={datum('2028-01-01')} />
          </div>
          <div>
            <div className="vg-kpi-titel" style={{ marginBottom: 8 }}>Erweiterte Parameter</div>
            {Object.entries(ERWEITERT).map(([id, e]) => (
              <WertZeile
                key={id}
                label={e.label}
                wert={e.einheit === 'schalter'
                  ? ((hebel[id] ?? e.standard) ? 'an' : 'aus')
                  : `${zahl(hebel[id] ?? e.standard, 1)} ${e.einheit === 'prozent' ? '%' : e.einheit === 'jahre' ? 'Jahre' : ''}`}
                hinweis={e.hinweis}
              />
            ))}
          </div>
        </div>
      </Aufklapp>

      <Aufklapp titel="White Label" unter="Was austauschbar ist">
        <p className="vg-merkzeile" style={{ marginTop: 0 }}>
          Die Anwendung nennt keine Marke beim Namen. Produktname, Mandant, Farben, Wortmarke, Radien und alle
          Sprachbausteine kommen aus der Markenkonfiguration und lassen sich im Marken-Studio live ändern,
          als JSON exportieren und wieder einspielen. Es gibt keinen externen Logo-Abruf: die Bildmarke ist ein
          einfarbiges Inline-SVG, die Farbskala wird aus einer einzigen Primärfarbe berechnet.
        </p>
        <p className="vg-merkzeile">
          Einzige verbleibende Außenverbindung sind die beiden Schriftarten, die von Google Fonts geladen werden.
          Ohne Netz fällt die Anwendung auf Systemschriften zurück; Rechenkern, Daten und Marke funktionieren
          vollständig offline. Für einen Einsatz ohne jede Außenverbindung sind die Schriftdateien lokal
          mitzuliefern und der Import in <code>src/index.css</code> zu ersetzen.
        </p>
      </Aufklapp>
    </div>
  )
}
