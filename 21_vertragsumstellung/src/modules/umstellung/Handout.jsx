import { ArrowLeft, Printer } from 'lucide-react'
import { Btn, Kpi } from '../../ui/basis'
import { Verlauf, PaarVergleich, bauteilPaare } from '../../charts'
import { useMarke } from '../../marke/MarkeProvider'
import { MarkenFeld } from '../../marke/Wortmarke'
import { euro, prozentDelta, zahl, datumLang, deltaTon } from '../../lib/format'
import { argumentationskarten, kernaussage } from './verhandlung'
import { DEMO_HINWEIS, REFERENZZEITRAUM_TEXT } from '../../data/einheiten'

/**
 * Einseitiges Verhandlungs-Handout, druckbar auf A4.
 * Enthält nur, was im Gespräch gebraucht wird: die Kernaussage als Kopf,
 * drei Beträge in einer Zeile, Paarvergleich neben Verlauf und drei
 * belastbare Argumente. Kein Wasserfall — der Paarvergleich ist die erste
 * Darstellung der Veränderung.
 *
 * Der Verlauf bekommt eine feste Breite: recharts' ResponsiveContainer misst
 * im Druck-Layout keine Breite und ließ den Block leer. Ist die Spalte
 * schmaler als die feste Breite, skaliert das SVG über seine viewBox.
 */

// Das Paket darf keine eigene CSS-Datei anlegen und index.css gehört dem
// Gestaltungssystem; die wenigen Modulregeln (Blatt auf stillem Grund am
// Bildschirm, ohne Grund und Innenabstand im Druck) stehen deshalb hier.
const HANDOUT_CSS = `
.vg-handout-grund {
  margin: calc(-1 * var(--vg-d-inhalt-pad));
  padding: var(--vg-a10);
  background: var(--vg-still);
}
.vg-handout-blatt {
  max-width: 960px;
  margin: 0 auto;
  padding: var(--vg-a10);
  background: var(--vg-flaeche);
  border-radius: var(--vg-r-lg);
  min-width: 0;
}
.vg-handout-kern {
  margin: 0 0 var(--vg-a7);
  max-width: 60ch;
  font-size: var(--vg-fs-2xl);
  font-weight: 500;
  line-height: 1.22;
  letter-spacing: -0.021em;
  color: var(--vg-text);
}
.vg-handout-spalten {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--vg-a6);
  margin-bottom: var(--vg-a7);
}
.vg-handout-spalten > * { min-width: 0; }
.vg-handout-spalten .recharts-wrapper,
.vg-handout-spalten .recharts-surface { max-width: 100%; }
@media print {
  .vg-handout-grund { margin: 0; padding: 0; background: none; }
  .vg-handout-blatt { max-width: none; padding: 0; border-radius: 0; }
  /* Der allgemeine Druckrahmen (62 mm ≈ 234 px) wäre 6 px niedriger als
     der 240-px-Verlauf; die Spalten nehmen die Höhe ihres SVG. */
  .vg-handout-spalten .vg-diagramm { height: auto; }
}
`

export default function Handout({ ergebnis, portfolio, hebel, fassung, onZurueck }) {
  const { marke } = useMarke()
  const e = ergebnis.einheit
  const jahr1 = ergebnis.verlauf[0]
  const karten = argumentationskarten(ergebnis, hebel, portfolio).slice(0, 3)

  return (
    <div className="vg-handout-grund">
      <style>{HANDOUT_CSS}</style>

      <div className="vg-reihe-weit vg-nicht-drucken" style={{ maxWidth: 960, margin: '0 auto var(--vg-a6)' }}>
        <Btn ikone={ArrowLeft} onClick={onZurueck}>Zurück zur Akte</Btn>
        <Btn variante="primaer" ikone={Printer} onClick={() => window.print()}>Drucken oder als PDF sichern</Btn>
      </div>

      <div className="vg-handout-blatt vg-druckseite">
        <header className="vg-reihe-weit" style={{ paddingBottom: 14, borderBottom: '2px solid var(--brand-600)', marginBottom: 18 }}>
          <div className="vg-reihe" style={{ gap: 11 }}>
            <MarkenFeld size={34} />
            <div>
              <div className="vg-t-xl vg-fett" style={{ letterSpacing: '-.02em' }}>{marke.produktName}</div>
              <div className="vg-t-sm vg-schwach">{marke.mandantName} · {marke.sprache.modellZiel}</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="vg-t-sm vg-schwach">Verhandlungsunterlage · Stand {datumLang(new Date())}</div>
            <div className="vg-t-sm vg-schwach">Fassung „{fassung?.name}“</div>
          </div>
        </header>

        <h1 className="vg-t-3xl vg-fett" style={{ margin: '0 0 4px', letterSpacing: '-.025em' }}>{e.name}</h1>
        <p className="vg-gedaempft" style={{ margin: '0 0 14px' }}>
          {e.sitz} · Referenzzeitraum {REFERENZZEITRAUM_TEXT}
          {e.stammdaten && ` · ${zahl(e.stammdaten.bankkunden)} Bankkunden · ${zahl(e.stammdaten.sFinanzberater)} ${marke.sprache.berater}`}
        </p>

        <p className="vg-handout-kern">{kernaussage(ergebnis)}</p>

        <div className="vg-kennzahlreihe vg-kennzahlreihe-3" style={{ marginBottom: 'var(--vg-a7)' }}>
          <Kpi titel="Vergütung heute" wert={euro(ergebnis.ist.gesamt)} fuss="gemeldet im Referenzzeitraum" />
          <Kpi
            titel="Zielmodell"
            wert={euro(ergebnis.ziel.gesamt)}
            fuss={`${prozentDelta(ergebnis.delta.prozent)} · im Referenzzeitraum`}
            ton={deltaTon(ergebnis.delta.prozent)}
          />
          <Kpi
            titel="Forecast 2028"
            wert={euro(jahr1.mitUebergang)}
            fuss={`${prozentDelta(jahr1.deltaProzent)} · kassenwirksam, mit Übergangsregel`}
            ton={deltaTon(jahr1.deltaProzent)}
          />
        </div>

        <div className="vg-handout-spalten vg-druck-zusammen">
          <div>
            <h2 className="vg-t-lg vg-fett" style={{ margin: '0 0 8px' }}>Heute gegen Zielmodell</h2>
            <PaarVergleich paare={bauteilPaare(ergebnis.ist, ergebnis.ziel)} hoehe={220} animiert={false} />
          </div>
          <div>
            <h2 className="vg-t-lg vg-fett" style={{ margin: '0 0 8px' }}>Entwicklung 2028 bis 2035</h2>
            {/* 240 statt 220 px: bei 220 fällt der unterste Achsenwert auf die
                Höhe der Tiefpunkt-Unterzeile; 20 px mehr Zeichenfläche
                verschieben den Achsenausschnitt so, dass dort kein Tick liegt. */}
            <Verlauf reihe={ergebnis.verlauf} hoehe={240} breite={430} />
          </div>
        </div>

        <h2 className="vg-t-lg vg-fett" style={{ margin: '0 0 8px' }}>Argumentationslinie</h2>
        <div className="vg-stapel" style={{ gap: 10 }}>
          {karten.map((k, i) => (
            <div key={k.id} style={{ display: 'flex', gap: 12 }}>
              <div style={{
                flex: 'none', width: 22, height: 22, borderRadius: '50%',
                background: 'var(--brand-600)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 500,
              }}>{i + 1}</div>
              <div>
                <div className="vg-stark">{k.titel}</div>
                <div className="vg-merkzeile">{k.text}</div>
              </div>
            </div>
          ))}
        </div>

        <footer style={{ marginTop: 24, paddingTop: 12, borderTop: '1px solid var(--vg-rand)' }}>
          <p className="vg-t-xs vg-schwach" style={{ margin: 0 }}>
            {DEMO_HINWEIS} Erstellt mit {marke.produktName}. Sämtliche Werte sind aus dem eingestellten
            Modell gerechnet und mit der Fassung „{fassung?.name}“ reproduzierbar.
          </p>
        </footer>
      </div>
    </div>
  )
}
