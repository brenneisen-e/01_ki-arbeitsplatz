import { useCallback, useMemo, useState } from 'react'
import { ArrowRight, RefreshCw } from 'lucide-react'
import Steuerblock from '../../ui/Steuerblock'
import ReglerZeile from '../../ui/Regler'
import { Tafel, VergleichsTafel, StaffelTabelle, LabelWert } from '../../ui/Tafel'
import { Btn, Badge } from '../../ui/basis'
import { SpartenSaeulen, BestandBalken } from '../../charts'
import { HEBEL_INDEX, istHebel } from '../../lib/hebel'
import { REFERENZZEITRAUM_TEXT } from '../../data/einheiten'
import { euroKompakt, euro, achseEuro, prozent, zahl, datum } from '../../lib/format'

/**
 * TAFELPROBE — Sichtprüfung der Tafelsprache.
 *
 * Route #/tafelprobe (nur im Hash, nicht in der Navigation). Zeigt je ein
 * Beispiel aller Bauteile aus ui/Tafel.jsx, charts/stufen.jsx, der dichten
 * Reglerzeile und des Steuerblocks mit Stammdaten und Stapelbalken — mit
 * festen Beispieldaten, unabhängig von der Rechen-Engine. „Werte
 * verändern“ schaltet zwischen zwei Datenständen um, damit das Nachlaufen
 * der Zahlen sichtbar wird.
 */

// Zwei zusätzliche Hebel für die neuen Einheiten euro und schalter — lokal,
// damit die Probe nicht davon abhängt, ob die Engine sie schon führt.
const PROBE_HEBEL = {
  zuschussStandort: {
    id: 'zuschussStandort', gruppe: 'zuschuesse', label: 'Standortzuschuss je Geschäftsstelle', kurz: 'Standort',
    hinweis: 'Fester Betrag je Geschäftsstelle und Jahr.', einheit: 'euro',
    min: 0, max: 5000, step: 100, basis: 0, standard: 0, richtung: 'hoch-teurer',
  },
  bonusNormierung: {
    id: 'bonusNormierung', gruppe: 'bonus', label: 'Staffel auf Budget normieren', kurz: 'Normieren',
    hinweis: 'An: das Bonusvolumen bleibt beim Budget. Aus: die Staffel wirkt direkt.', einheit: 'schalter',
    min: 0, max: 1, step: 1, basis: 1, standard: 1, richtung: 'neutral',
  },
}
const hebelDef = (id) => HEBEL_INDEX[id] || PROBE_HEBEL[id]

// Kurznamen für die dichte Zeile — dieselben wie im Simulationskasten. Die
// vollen Bezeichnungen stehen im Tip am Namen.
const KURZ = {
  apLeben: 'AP Leben',
  apKomposit: 'AP Komposit',
  lpLeben: 'LP Leben',
  zuschussStandort: 'Standortzuschuss',
  bonusProgression: 'Progression',
  bonusNormierung: 'Auf Budget normieren',
  diskontsatz: 'Diskontsatz',
  bpKomposit: 'BP Komposit',
}
const dichteDef = (id) => {
  const def = hebelDef(id)
  return { ...def, label: KURZ[id] ?? def.kurz ?? def.label, hinweis: `${def.label}. ${def.hinweis}` }
}

// Einmal gebaut, damit die memoisierte Reglerzeile dieselbe def-Referenz bekommt
const DICHT_DEF = Object.fromEntries(
  ['apLeben', 'apKomposit', 'lpLeben', 'zuschussStandort', 'bonusProgression', 'bonusNormierung', 'diskontsatz', 'bpKomposit']
    .map(id => [id, dichteDef(id)]),
)

const STAFFEL_BASIS = [0, 6, 12, 19, 26, 32]
// Schwellen der Stufen 2–6 in Prozent der Zielerreichung; Stufe 1 hat keine
const SCHWELLEN_BASIS = [null, 85, 95, 105, 115, 125]

// Zwei Datenstände: heute und ein Zielmodell, dazu eine zweite Fassung des
// Zielmodells, um Zahlenlauf und Tonwechsel sichtbar zu machen.
const PRODUKTION = [
  { id: 'lebenBasis', sparte: 'Leben', produkt: 'Leben (Basis)', bemessung: 812_400_000, alt: 26_809_000 },
  { id: 'lebenBav', sparte: 'Leben', produkt: 'bAV', bemessung: 96_300_000, alt: 3_178_000 },
  { id: 'lebenBio', sparte: 'Leben', produkt: 'Biometrie', bemessung: 41_700_000, alt: 1_376_000 },
  { id: 'kompositSuh', sparte: 'Komposit', produkt: 'Sach, Unfall, Haftpflicht', bemessung: 38_900_000, alt: 7_780_000 },
  { id: 'kompositKfz', sparte: 'Komposit', produkt: 'Kfz', bemessung: 21_400_000, alt: 3_381_000 },
]
const FOLGE = [
  { id: 'lpLeben', sparte: 'Leben', produkt: 'Laufende Provision', bemessung: 950_400_000, alt: 0 },
  // Zweimal „Bestandsprovision“: ohne Sparten-Spalte hängt die Tafel die
  // Sparte an den Namen (Produktionszeilen), mit Spalte bleibt er kurz
  { id: 'bpLeben', sparte: 'Leben', produkt: 'Bestandsprovision', bemessung: 412_000_000, alt: 3_296_000 },
  { id: 'bpKomposit', sparte: 'Komposit', produkt: 'Bestandsprovision', bemessung: 318_000_000, alt: 11_130_000 },
]
const FAKTOREN = {
  a: { lebenBasis: 0.86, lebenBav: 0.92, lebenBio: 0.95, kompositSuh: 0.97, kompositKfz: 0.79, lpLeben: 6_270_000, bpLeben: 1.42, bpKomposit: 1.08, bonus: 1.18, zuschuesse: 0.62 },
  b: { lebenBasis: 0.74, lebenBav: 0.88, lebenBio: 0.9, kompositSuh: 1.02, kompositKfz: 0.79, lpLeben: 8_910_000, bpLeben: 1.6, bpKomposit: 1.12, bonus: 1.31, zuschuesse: 0.55 },
}

function zeilenMit(basis, f) {
  return basis.map(z => {
    const neu = z.id === 'lpLeben' ? f.lpLeben : Math.round(z.alt * f[z.id])
    return { ...z, neu, differenz: neu - z.alt }
  })
}
function summeVon(zeilen) {
  return zeilen.reduce((s, z) => ({ alt: s.alt + z.alt, neu: s.neu + z.neu, differenz: s.differenz + z.differenz }), { alt: 0, neu: 0, differenz: 0 })
}

const SPARTEN = [
  { id: 'leben', titel: 'Leben', unter: 'Beitragssumme · Stufen 85–115 %', werte: [812.4e6 * 0.93, 812.4e6, 812.4e6 * 0.965], plan: 812.4e6 / 0.97 },
  { id: 'komposit', titel: 'Komposit', unter: 'Jahresbeitrag · Stufen 85–115 %', werte: [60.3e6 * 1.04, 60.3e6, 60.3e6 * 1.02], plan: 60.3e6 / 1.08 },
]
const STUFEN_PROZENT = [85, 95, 105, 115]

export default function Tafelprobe({ navigiere }) {
  const [hebel, setHebel] = useState(() => ({ ...istHebel(), zuschussStandort: 0, bonusNormierung: 1, apLeben: 30 }))
  const [staffel, setStaffel] = useState(() => [0, 6, 12, 25, 26, 32])
  const [schwellen, setSchwellen] = useState(() => [...SCHWELLEN_BASIS])
  const [stand, setStand] = useState('a')
  const [hervor, setHervor] = useState('lebenBasis')

  const aendern = useCallback((id, wert) => setHebel(h => ({ ...h, [id]: wert })), [])
  const neutralstellen = useCallback((id) => setHebel(h => ({ ...h, [id]: hebelDef(id).basis })), [])
  const satzAendern = useCallback((index, wert) => {
    setStaffel(s => s.map((v, i) => (i === index ? wert : v)))
    setHebel(h => ({ ...h, bonusNormierung: 0 }))
  }, [])
  const schwelleAendern = useCallback((index, wert) => {
    setSchwellen(s => s.map((v, i) => (i === index ? wert : v)))
  }, [])

  const f = FAKTOREN[stand]
  const produktion = useMemo(() => zeilenMit(PRODUKTION, f), [f])
  const folge = useMemo(() => zeilenMit(FOLGE, f), [f])
  const bonus = useMemo(() => ({ alt: 6_120_000, neu: Math.round(6_120_000 * f.bonus) }), [f])
  const zuschuesse = useMemo(() => ({ alt: 2_960_000, neu: Math.round(2_960_000 * f.zuschuesse) }), [f])

  const summeAbschluss = summeVon(produktion)
  const summeFolge = summeVon(folge)
  const gesamtAlt = summeAbschluss.alt + summeFolge.alt + bonus.alt + zuschuesse.alt
  const gesamtNeu = summeAbschluss.neu + summeFolge.neu + bonus.neu + zuschuesse.neu
  const startjahr = Math.round(gesamtAlt * (stand === 'a' ? 0.93 : 0.97))

  const staffelZeilen = staffel.map((satz, i) => ({
    index: i,
    schwelle: schwellen[i],
    satzHeute: STAFFEL_BASIS[i],
    satzNeu: satz,
    einheitenHeute: [2, 4, 8, 5, 2, 1][i],
    einheitenNeu: [1, 3, 7, 7, 3, 1][i],
    volumenNeu: [0, 0.32, 1.44, 2.35, 1.31, 0.7][i] * 1e6 * (1 + (satz - STAFFEL_BASIS[i]) / 40),
  }))

  const stammdaten = [
    { label: 'Bilanzsumme', wert: euroKompakt(16.34e9) },
    { label: 'Mitarbeiter', wert: zahl(2412) },
    { label: 'Geschäftsstellen', wert: zahl(96) },
    { label: 'S-Finanzberater', wert: zahl(38) },
    { label: 'Vergütungsklasse', wert: 'A' },
    { label: 'Status der Verhandlung', wert: 'In Verhandlung', ton: 'warnung' },
    { label: 'Ansprechpartner', wert: 'Dr. Kathrin Vogelsang', unter: 'Vorstand Vertrieb' },
    { label: 'Nächster Termin', wert: datum('2026-10-14') },
  ]

  const stapel = {
    alt: { abschluss: summeAbschluss.alt, folge: summeFolge.alt, bonus: bonus.alt, zuschuesse: zuschuesse.alt },
    neu: { abschluss: summeAbschluss.neu, folge: summeFolge.neu, bonus: bonus.neu, zuschuesse: zuschuesse.neu },
  }

  const regler = (id, extra = {}) => (
    <ReglerZeile
      key={id}
      def={DICHT_DEF[id]}
      wert={hebel[id] ?? hebelDef(id).standard}
      onAendern={aendern}
      dicht
      {...extra}
    />
  )

  return (
    <div className="vg-stapel" style={{ gap: 'var(--vg-a6)' }}>
      <div className="vg-seitenkopf">
        <div className="vg-seitenkopf-titel">
          <h2>Tafelprobe</h2>
          <div className="vg-seitenkopf-unter">Sichtprüfung der Tafelsprache — alle Bauteile mit Beispieldaten, unabhängig von der Rechen-Engine.</div>
        </div>
        <div className="vg-seitenkopf-aktionen">
          <Badge ton="neutral">Datenstand {stand === 'a' ? 'A' : 'B'}</Badge>
          <Btn ikone={RefreshCw} onClick={() => setStand(s => (s === 'a' ? 'b' : 'a'))}>Werte verändern</Btn>
        </div>
      </div>

      <div className="vg-buehne">
        <Steuerblock
          oben="Sparkasse · Dresden"
          titel="Ostsächsische Sparkasse Dresden"
          unter="Das Zielmodell hebt den Bestandswert und senkt die Abschlussvergütung; im Startjahr liegt das Haus unter heute."
          marken={<><Badge ton="positiv" punkt>Gewinner</Badge><Badge ton="warnung">In Verhandlung</Badge></>}
          zurueck={navigiere ? () => navigiere('start') : undefined}
          heute={gesamtAlt}
          ziel={gesamtNeu}
          zeitraum={REFERENZZEITRAUM_TEXT}
          deltaLabel="Vergleich Referenzzeitraum*"
          zweiteSumme={{ label: 'kumuliert bis 2030 (Barwert)', heute: gesamtAlt, ziel: startjahr }}
          stammdaten={stammdaten}
          stapel={stapel}
          signale={[
            { label: 'barwertig je Jahrgang', prozent: stand === 'a' ? 1.4 : -0.8 },
            { label: 'Requalifizierung', prozent: 0.6 },
          ]}
          fuss={<><Btn>Handout</Btn><Btn variante="primaer" ikoneRechts={ArrowRight}>Verhandlungsmodus</Btn></>}
        />

        <div className="vg-tafeln">
          {/* Reihe 1: Eingabe-Tafeln */}
          <Tafel titel="Abschlussprovision" ton="eingabe" unter="dichte Reglerzeilen">
            {regler('apLeben', { onNeutralstellen: neutralstellen })}
            {regler('apKomposit', { onNeutralstellen: neutralstellen })}
            {regler('lpLeben')}
            {regler('zuschussStandort')}
          </Tafel>

          <Tafel
            titel="Bonifikation" ton="eingabe" dicht buendig
            zaehler={staffel.filter((v, i) => v !== STAFFEL_BASIS[i]).length + schwellen.filter((v, i) => v !== SCHWELLEN_BASIS[i]).length}
            unter="Schwelle und Satz je Stufe"
          >
            {/* Form ohne Spalte „Satz heute“: der heutige Satz steht klein
                unter der Eingabe; die Bereiche folgen aus den Schwellen */}
            <StaffelTabelle
              stufen={staffelZeilen}
              onSatz={satzAendern}
              onSchwelle={schwelleAendern}
              basis={STAFFEL_BASIS}
              spalten={['bereich', 'schwelle', 'satz', 'einheiten']}
            />
            <div style={{ padding: 'var(--vg-a2) var(--vg-a5)', borderTop: '1px solid var(--vg-rand)' }}>
              {regler('bonusProgression')}
              {regler('bonusNormierung')}
            </div>
          </Tafel>

          <Tafel titel="Garantien und Übergang" ton="sonst" unter="Label/Wert-Liste" dicht>
            <LabelWert zeilen={[
              { label: 'Besitzstandsquote', wert: prozent(90, 0) },
              { label: 'Einschleifphase', wert: '3 Jahre' },
              { label: 'Verlustdeckel im ersten Jahr', wert: prozent(8, 0), hinweis: 'Kein Haus verliert im Startjahr mehr als diesen Anteil.' },
              { label: 'Gewinndeckel', wert: 'keiner', ton: 'neutral' },
              { label: 'Stufe heute und neu', wert: <>Stufe 3 <span className="vg-pfeil" aria-hidden="true" /> Stufe 4</> },
              { label: '2028 nach Regel', wert: `${euroKompakt(startjahr)} · ${prozent(((startjahr - gesamtAlt) / gesamtAlt) * 100)}`, ton: 'negativ' },
              { label: 'Kosten der Regel, Jahr 1', wert: euroKompakt(659_000), ton: 'warnung', punkt: true },
              { label: 'Kosten der Regel, kumuliert', wert: euroKompakt(1_840_000) },
            ]} />
          </Tafel>

          {/* Reihe 2: Wirkungs-Tafeln */}
          <Tafel
            titel="Produktionszeilen — Gesamtportfolio"
            ton="abschluss" breit={2} dicht buendig
            unter="Abschnitte, Summe, Hervorhebung"
            aktionen={<Btn groesse="sm" variante="still" onClick={() => setHervor(h => (h === 'lebenBasis' ? 'kompositKfz' : 'lebenBasis'))}>Hervorhebung wechseln</Btn>}
          >
            <VergleichsTafel
              spalten={[
                { id: 'produkt', label: 'Produkt' },
                { id: 'bemessung', label: 'Bemessung' },
                { id: 'alt', label: 'Alt' },
                { id: 'neu', label: 'Neu' },
                { id: 'differenz', label: 'Differenz' },
              ]}
              abschnitte={[
                { id: 'abschluss', titel: 'Abschluss', zeilen: produktion },
                { id: 'folge', titel: 'Laufend und Bestand', zeilen: folge },
                { id: 'bonus', titel: 'Bonifikation', zeilen: [{ id: 'bonus', produkt: 'Bonifikation', alt: bonus.alt, neu: bonus.neu, differenz: bonus.neu - bonus.alt }] },
                { id: 'zuschuesse', titel: 'Zuschüsse', zeilen: [
                  { id: 'kleinteilig', produkt: 'Kleinteilige Zuschüsse', alt: 2_960_000, neu: zuschuesse.neu, differenz: zuschuesse.neu - 2_960_000 },
                  { id: 'standort', produkt: 'Standortzuschuss', alt: 0, neu: hebel.zuschussStandort * 96, differenz: hebel.zuschussStandort * 96 },
                ] },
              ]}
              summe={{ alt: gesamtAlt, neu: gesamtNeu + hebel.zuschussStandort * 96, differenz: gesamtNeu + hebel.zuschussStandort * 96 - gesamtAlt }}
              hervor={hervor}
            />
          </Tafel>

          <Tafel titel="Folgeprovisionen" ton="folge" breit={2} dicht buendig unter="mit Sparte und Bestand">
            <VergleichsTafel
              spalten={[
                { id: 'sparte', label: 'Sparte' },
                { id: 'produkt', label: 'Produkt' },
                { id: 'bemessung', label: 'Bestand' },
                { id: 'alt', label: 'FP alt' },
                { id: 'neu', label: 'FP neu' },
                { id: 'differenz', label: 'Differenz' },
              ]}
              zeilen={folge}
              summe={summeFolge}
            />
          </Tafel>

          {/* Einspaltige Form: ohne Sparte, kompakte Beträge; unter 300 px
              Tafelbreite weicht die Spalte Alt (weichend) */}
          <Tafel titel="Zuschüsse" ton="sonst" dicht buendig unter="einspaltig, in EUR">
            <VergleichsTafel
              spalten={[
                { id: 'produkt', label: 'Posten' },
                { id: 'alt', label: 'Alt', format: achseEuro },
                { id: 'neu', label: 'Neu', format: achseEuro },
                { id: 'differenz', label: 'Differenz', format: v => (Math.abs(v) < 0.5 ? '0' : (v > 0 ? '+' : '−') + achseEuro(Math.abs(v))) },
              ]}
              zeilen={[
                { id: 'kleinteilig', produkt: 'Kleinteilige Zuschüsse', alt: 2_960_000, neu: zuschuesse.neu, differenz: zuschuesse.neu - 2_960_000 },
                { id: 'allgemein', produkt: 'Allgemeiner Zuschuss', alt: 0, neu: 412_000, differenz: 412_000 },
                { id: 'standort', produkt: 'Standortzuschuss', alt: 0, neu: hebel.zuschussStandort * 96, differenz: hebel.zuschussStandort * 96 },
              ]}
              summe={{ alt: 2_960_000, neu: zuschuesse.neu + 412_000 + hebel.zuschussStandort * 96, differenz: zuschuesse.neu + 412_000 + hebel.zuschussStandort * 96 - 2_960_000 }}
              weichend={['alt']}
            />
          </Tafel>

          {/* Reihe 3: Diagramm-Tafeln und Aufklapp */}
          {SPARTEN.map(sp => (
            <Tafel key={sp.id} titel={sp.titel} ton="neutral" unter={sp.unter}>
              <SpartenSaeulen
                titel={sp.titel}
                werte={[{ label: '2024', wert: sp.werte[0] }, { label: '2025', wert: sp.werte[1] }, { label: 'Ø', wert: sp.werte[2] }]}
                stufen={STUFEN_PROZENT.map((p, i) => ({ label: `Stufe ${i + 2} · ${p} %`, wert: sp.plan * p / 100 }))}
                plan={{ label: 'Plan', wert: sp.plan }}
              />
            </Tafel>
          ))}

          <Tafel titel="Bestand" ton="neutral" unter="Balken und Stückzahlen">
            <BestandBalken zeilen={[
              { label: 'Leben, Jahresbeitrag', wert: 41.2e6, anzeige: euroKompakt(41.2e6), balken: true },
              { label: 'Komposit, Jahresbeitrag', wert: 31.8e6, anzeige: euroKompakt(31.8e6), balken: true },
              { label: 'Verträge', wert: 386_400, anzeige: zahl(386_400), balken: false },
              { label: 'Versicherungskunden', wert: 212_900, anzeige: zahl(212_900), balken: false },
            ]} />
          </Tafel>

          <Tafel titel="Weitere Stellhebel" ton="eingabe" aufklappbar offenStandard={false} zaehler={2} unter="zugeklappt, mit Zähler">
            {regler('diskontsatz')}
            {regler('bpKomposit')}
          </Tafel>

          <Tafel titel="Neutral ohne Band" ton="neutral" breit={2}>
            <p className="vg-merkzeile" style={{ margin: 0 }}>
              Fünf Töne: <strong>eingabe</strong> (Burgund weich), <strong>abschluss</strong> (Stahlblau weich),
              <strong> folge</strong> (Tiefgrün weich), <strong>sonst</strong> (neutral) und <strong>neutral</strong> (kein Band, nur Haarlinie).
              Beträge über 100 Mio. EUR stehen kompakt, darunter voll: {euro(41_200_000)} · {euroKompakt(812_400_000)}.
            </p>
          </Tafel>
        </div>
      </div>
    </div>
  )
}
