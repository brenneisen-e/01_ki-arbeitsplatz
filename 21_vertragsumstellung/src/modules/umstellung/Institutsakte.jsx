import { useState, useMemo, useCallback } from 'react'
import { Handshake, Copy, Users, Printer, Info, Check } from 'lucide-react'
import {
  Karte, KarteKopf, KarteKoerper, KarteFuss, Delta, Badge, Btn, Ampel,
  Hinweis, WertZeile, InfoTip, Leer, Aufklapp,
} from '../../ui/basis'
import Tabelle from '../../ui/Tabelle'
import { Wasserfall, Verlauf, BausteinVerlauf, AnteilsBalken, AMPEL_FARBE, verdichteStufen } from '../../charts'
import { berechneEinzel, bausteinVerlauf, KUMULIERT_BIS } from '../../lib/modell'
import { KANAL_KURZ, REFERENZZEITRAUM_TEXT, vertriebspartnerEinheiten } from '../../data/einheiten'
import { euro, euroKompakt, prozent, zahl, datum } from '../../lib/format'
import { mitUebergang } from '../../lib/bewegung'
import { argumentationskarten, einwaende, STATUS_LABEL, kernaussage } from './verhandlung'
import Handout from './Handout'
import Verhandlungsmodus from './Verhandlungsmodus'
import VerhandlungsMarke from './VerhandlungsMarke'
import { erklaereReferenzvergleich, erklaereKumuliert } from '../../lib/erklaerung'
import Uebersicht from './Uebersicht'
import Steuerblock from '../../ui/Steuerblock'
import { Farblegende } from '../../ui/Waage'
import './akte.css'

// Drei Hauptreiter tragen den Pitch (Übersicht, Verlauf, Argumente); die zwei
// Nebenreiter sind Nachschlagewerke und stehen rechts abgesetzt. Die
// Übersicht ist das Ein-Bild-Dashboard und der Standardreiter.
const REITER = [
  { id: 'uebersicht', label: 'Übersicht' },
  { id: 'verlauf', label: 'Verlauf 2028–2035' },
  { id: 'argumente', label: 'Argumente' },
  { id: 'partner', label: 'Vertriebspartner', neben: true },
  { id: 'stammdaten', label: 'Kennzahlen', neben: true },
]

// --------------------------------------------------- Steuerblock

/**
 * Der dunkle Steuer- und Summenblock der Akte: Haus, Ampel und Beirat oben,
 * die Kernaussage als Unterzeile, darunter der Stammdatenblock (Institut,
 * Verhandlungsstand, Ansprechpartner, Termin), dann heute / Zielmodell mit
 * zwei gleich schweren Plaketten (dauerhaft, Startjahr 2028), der
 * gestapelte Alt/Neu-Balken nach Bauteilen und die zwei Nebensignale, unten
 * Handout und Verhandlungsmodus. Die Mitte darf scrollen, der Fuß bleibt.
 */
function AktenSteuerblock({ einheit, ergebnis, hebel, fassung, navigiere, aufVerhandlung, aufHandout }) {
  const status = STATUS_LABEL[einheit.verhandlung?.status || 'nicht_begonnen']
  const jahr1 = ergebnis.verlauf[0]
  const { ist, ziel } = ergebnis
  // Nur Kanal und Sitz: die Bilanzsumme steht im Stammdatenblock und
  // ließ die Kopfzeile bei 1280 px neben „Zurück“ umbrechen.
  const oben = [KANAL_KURZ[einheit.kanal], einheit.sitz].filter(Boolean).join(' · ')

  // Der Verhandlungsstand steht im Stammdatenblock und nicht zusätzlich als
  // Abzeichen — jede Angabe genau einmal im Block.
  const s = einheit.stammdaten
  const v = einheit.verhandlung
  const stammdaten = [
    s && { id: 'bilanz', label: 'Bilanzsumme', wert: euroKompakt(s.bilanzsummeEur) },
    s && { id: 'mitarbeiter', label: 'Mitarbeiter', wert: zahl(s.mitarbeiter) },
    s && { id: 'gst', label: 'Geschäftsstellen', wert: zahl(s.geschaeftsstellenGesamt) },
    s && { id: 'sfb', label: 'S-Finanzberater', wert: zahl(s.sFinanzberater) },
    s && { id: 'vp', label: 'Vertriebspartner', wert: zahl(s.vertriebspartnerGesamt) },
    einheit.verguetungsklasse && { id: 'klasse', label: 'Vergütungsklasse', wert: einheit.verguetungsklasse },
    {
      id: 'status', label: 'Verhandlung', wert: status.label,
      ton: ['positiv', 'negativ', 'warnung'].includes(status.ton) ? status.ton : undefined,
    },
    // Name als Wert, Funktion als zweite, gedämpfte Zeile (`unter`): in einer
    // Zeile kappte „Dr. Kathrin Vogelsang, Vorstandsvorsitzende“ schon bei 336 px.
    v?.ansprechpartner && {
      id: 'ansprechpartner', label: 'Ansprechpartner',
      wert: v.ansprechpartner, unter: v.funktion || undefined,
    },
    v?.naechsterTermin && { id: 'termin', label: 'Nächster Termin', wert: datum(v.naechsterTermin) },
  ].filter(Boolean)

  // Tooltips der Plaketten: aus den Zahlen dieses Hauses erklärt
  const lpDauer = Math.round(ziel.lpDauer || hebel?.lpDauer || 12)
  const jahrVoll = ergebnis.eingeschwungen?.jahr ?? null
  const tipReferenz = erklaereReferenzvergleich({ heute: ist.gesamt, ziel: ziel.gesamt, zeitraum: REFERENZZEITRAUM_TEXT, lpDauer, jahrVoll })
  const tipKumuliert = erklaereKumuliert({
    kumuliert: ergebnis.kumuliert, verlauf: ergebnis.verlauf, heute: ist.gesamt, zielReferenz: ziel.gesamt,
    diskontsatz: hebel?.diskontsatz ?? 5, lpDauer, jahrVoll,
  })

  // Vier Segmente je Säule; ihre Summe ist exakt `gesamt` der jeweiligen Welt.
  const stapel = {
    alt: { abschluss: ist.ap, folge: ist.lp + ist.bp, bonus: ist.bonus, zuschuesse: ist.zuschuesse },
    neu: { abschluss: ziel.ap, folge: ziel.lp + ziel.bp, bonus: ziel.bonus, zuschuesse: ziel.zuschuesse },
  }

  return (
    <Steuerblock
      oben={oben}
      zurueck={() => navigiere('umstellung')}
      titel={einheit.name}
      unter={kernaussage(ergebnis)}
      marken={
        <>
          <Ampel stufe={ergebnis.ampel} />
          {einheit.verhandlung?.beiratsmitglied && <Badge ton="info">{einheit.verhandlung.beiratsrolle || 'Beiratsmitglied'}</Badge>}
        </>
      }
      stammdaten={stammdaten}
      heute={ist.gesamt}
      ziel={ziel.gesamt}
      zeitraum={REFERENZZEITRAUM_TEXT}
      deltaLabel="Vergleich Referenzzeitraum*"
      deltaTip={tipReferenz}
      zielMarke={<VerhandlungsMarke fassung={fassung} hebel={hebel} einheitId={einheit.id} />}
      zweiteSumme={{
        label: `kumuliert bis ${KUMULIERT_BIS} (Barwert)`,
        tip: tipKumuliert,
        heute: ergebnis.kumuliert.heute,
        ziel: ergebnis.kumuliert.ziel,
        // Sicht des Instituts; exakt heute (die Übergangsregel hält das Haus)
        // ist grau, ab einem halben Prozent gewinnt oder verliert das Haus,
        // dazwischen „nahezu unverändert“ (orange, wie die Legende sagt).
        ton: Math.abs(ergebnis.kumuliert.prozent) < 0.05 ? 'neutral'
          : ergebnis.kumuliert.prozent <= -0.5 ? 'negativ' : ergebnis.kumuliert.prozent >= 0.5 ? 'positiv' : 'warnung',
      }}
      stapel={stapel}
      signale={[
        { label: 'Barwert je Jahrgang', prozent: ergebnis.barwert.prozent,
          ton: Math.abs(ergebnis.barwert.prozent) <= 3 ? 'positiv' : 'warnung' },
        { label: 'Requalifizierung', prozent: (ziel.requalifizierungsFaktor - 1) * 100,
          ton: ziel.requalifizierungsFaktor >= 1 ? 'positiv' : 'warnung' },
      ]}
      einstellungen={<Farblegende institut />}
      fuss={
        <>
          <Btn ikone={Printer} onClick={aufHandout}>Handout</Btn>
          <Btn variante="primaer" ikone={Handshake} onClick={aufVerhandlung}>Verhandlungsmodus</Btn>
        </>
      }
    />
  )
}

// --------------------------------------------------- Verlauf

/**
 * Verlauf und Jahreswerte; darunter zugeklappt die Zerlegung „Wie die
 * Veränderung zustande kommt“ — sie hat den ersten Blick (Übersicht)
 * verlassen und bleibt hier nachschlagbar.
 */
function VerlaufTab({ ergebnis }) {
  const [stufe, setStufe] = useState(null)
  const reihe = ergebnis.verlauf
  const bausteine = useMemo(() => bausteinVerlauf(ergebnis), [ergebnis])
  // Die Kalenderjahre des Horizonts; die Säule „ab 2039“ (Jahr des vollen Aufbaus) (eingeschwungen)
  // zählt für Merksatz und Regelende nicht mit.
  const jahre = bausteine.filter(b => !b.eingeschwungen)
  const erstes = jahre[0]
  const letztes = jahre[jahre.length - 1]
  const regelEnde = [...jahre].reverse().find(b => b.uebergang > 0.5)
  const voll = ergebnis.eingeschwungen
  const kumuliert = reihe.reduce((s, v) => s + v.delta, 0)
  // „Im Plus“ heißt über heute, nicht exakt heute: mit Besitzstand 100 % und
  // Verlustdeckel 0 % hält die Übergangsregel ein Haus jahrelang genau auf
  // dem heutigen Wert — das ist kein Plus, sondern das Netz.
  const plus = reihe.find(v => v.deltaProzent > 0.05)
  const gehalten = (v) => Math.abs(v.deltaProzent) <= 0.05
  const startGehalten = reihe.length > 0 && gehalten(reihe[0])
  const alleGehalten = reihe.length > 0 && reihe.every(gehalten)
  const verlaufSatz = alleGehalten
    ? <> Die Übergangsregel hält das Haus in allen acht Jahren auf dem heutigen Niveau.</>
    : plus && startGehalten
      ? <> Bis {plus.jahr - 1} hält die Übergangsregel das Haus auf dem heutigen Niveau, ab <strong>{plus.jahr}</strong> liegt es im Plus.</>
      : plus
        ? <> Ab <strong>{plus.jahr}</strong> liegt das Haus im Plus.</>
        : <> Ein Ausgleich wird bis 2035 nicht erreicht.</>

  return (
    <div className="vg-stapel">
      <Karte>
        <KarteKopf
          titel="Forecast: Vergütung 2028 bis 2035"
          unter="Gestrichelt heute; dünn das Zielmodell ohne Übergangsregel, das mit der laufenden Provision aufwächst; kräftig, was mit Übergangsregel tatsächlich fließt — die Plakette rechnet mit der kräftigen Linie"
        />
        <KarteKoerper>
          <Verlauf reihe={reihe} hoehe={310} />
          <p className="vg-merkzeile" style={{ marginTop: 10 }}>
            Kumuliert über acht Jahre ergibt sich {euro(kumuliert)} gegenüber der Fortschreibung von heute.
            {verlaufSatz}
          </p>
        </KarteKoerper>
      </Karte>

      <Karte>
        <KarteKopf
          titel="Bausteine 2028 bis 2035"
          unter="Woraus die Vergütung im Zielmodell Jahr für Jahr besteht; über jeder Säule die Summe nach Übergangsregel und ihr Abstand zu heute, gestrichelt heute; rechts aufgehellt der eingeschwungene Zustand, der Wert des Referenzvergleichs"
        />
        <KarteKoerper>
          <BausteinVerlauf reihe={bausteine} hoehe={340} />
          <p className="vg-merkzeile" style={{ marginTop: 10 }}>
            Die Abschlussprovision steht ab 2028 bei {euroKompakt(erstes.ap)} statt {euroKompakt(ergebnis.ist.ap)} heute.
            {' '}Die laufende Provision wächst von {euroKompakt(erstes.lp)} (2028) auf {euroKompakt(letztes.lp)} (2035), eingeschwungen {euroKompakt(ergebnis.ziel.lp)}.
            {' '}Die Bestandsprovision liegt bei {euroKompakt(erstes.bp)} statt {euroKompakt(ergebnis.ist.bp)} heute.
            {regelEnde
              ? <> Was der Aufbau noch nicht hergibt, legt die Übergangsregel bis {regelEnde.jahr} nach, 2028 sind das {euroKompakt(erstes.uebergang)}.</>
              : <> Die Übergangsregel greift in keinem Jahr.</>}
            {voll && !voll.imHorizont && (voll.kostenUebergang > 0.5
              ? <> Eingeschwungen, wenn ab {voll.jahr} alle {zahl(voll.periode)} Jahrgänge der laufenden Provision zahlen, läge das Zielmodell bei {euroKompakt(voll.ziel)}, dem Wert des Referenzvergleichs im Steuerblock; die Übergangsregel hält das Haus auch dann auf {euroKompakt(voll.mitUebergang)}.</>
              : <> Eingeschwungen, wenn ab {voll.jahr} alle {zahl(voll.periode)} Jahrgänge der laufenden Provision zahlen, steht das Haus bei {euroKompakt(voll.mitUebergang)}: der Wert des Referenzvergleichs im Steuerblock, den der Horizont bis {letztes.jahr} noch nicht erreicht.</>)}
          </p>
        </KarteKoerper>
      </Karte>

      <Karte>
        <KarteKopf titel="Jahreswerte" unter="Alle Größen der Mehrjahresrechnung" />
        <KarteKoerper eng>
          <Tabelle
            eng
            spalten={[
              { id: 'jahr', label: 'Jahr' },
              { id: 'ist', label: 'Fortschreibung heute', num: true, zelle: v => <span className="vg-mono">{euro(v.ist)}</span> },
              { id: 'ziel', label: 'Zielmodell', num: true, zelle: v => <span className="vg-mono">{euro(v.ziel)}</span> },
              { id: 'mitUebergang', label: 'nach Übergangsregel', num: true, zelle: v => <span className="vg-mono vg-stark">{euro(v.mitUebergang)}</span> },
              { id: 'kosten', label: 'Kosten der Regel', num: true, wert: v => v.kostenUebergang, zelle: v => <span className="vg-mono vg-schwach">{v.kostenUebergang > 1 ? euro(v.kostenUebergang) : '–'}</span> },
              { id: 'delta', label: 'Veränderung', num: true, wert: v => v.deltaProzent, zelle: v => <Delta prozent={v.deltaProzent} nurProzent /> },
            ]}
            zeilen={reihe}
            schluessel={v => v.jahr}
          />
        </KarteKoerper>
      </Karte>

      <Aufklapp
        titel="Wie die Veränderung zustande kommt"
        unter="Vier Schritte, jeder die Differenz zweier vollständiger Modellrechnungen — die Zerlegung geht exakt auf."
      >
        <Wasserfall stufen={verdichteStufen(ergebnis.wasserfall)} hoehe={240} aufStufe={setStufe} />
        {stufe && stufe.typ === 'schritt' && (
          <div style={{ marginTop: 10 }}>
            <Hinweis ikone={Info}>
              <strong>{stufe.label}:</strong> {stufe.hinweis} Wirkung für dieses Haus:{' '}
              <strong>{euro(stufe.wert)}</strong>.
            </Hinweis>
          </div>
        )}
      </Aufklapp>
    </div>
  )
}

// --------------------------------------------------- Vertriebspartner

function PartnerTab({ einheit, hebel, portfolio }) {
  const [alle, setAlle] = useState(false)
  const partner = useMemo(() => vertriebspartnerEinheiten(einheit.id), [einheit.id])

  const ergebnisse = useMemo(
    () => partner.map(p => {
      const e = berechneEinzel(p, hebel, { jahre: 4, bonusNormierung: portfolio.bonusNormierung })
      return { p, e }
    }),
    [partner, hebel, portfolio.bonusNormierung])

  if (!ergebnisse.length) {
    return <Leer titel="Keine Einzelpartner hinterlegt" text="Für diese Einheit liegen keine Vertriebspartner in den Demodaten." ikone={Users} />
  }

  const sichtbar = alle ? ergebnisse : ergebnisse.slice(0, 40)
  const verteilung = ergebnisse.reduce((a, x) => {
    a[x.e.ampel] = (a[x.e.ampel] || 0) + 1
    return a
  }, {})
  const summeIst = ergebnisse.reduce((s, x) => s + x.e.ist.gesamt, 0)
  const summeZiel = ergebnisse.reduce((s, x) => s + x.e.ziel.gesamt, 0)
  const maxDelta = Math.max(...ergebnisse.map(x => Math.abs(x.e.delta.absolut)), 1)
  const stufen = [
    { id: 'gewinner', label: 'Gewinner' },
    { id: 'neutral', label: 'Neutral' },
    { id: 'beobachten', label: 'Beobachten' },
    { id: 'kritisch', label: 'Kritisch' },
  ]

  return (
    <div className="vg-stapel">
      <Karte>
        <KarteKopf
          titel="Vertriebspartner im Detail"
          unter={
            <>
              Dieselbe Rechnung, eine Ebene tiefer.
              <InfoTip text="Produktion und Bestand summieren sich exakt auf das Institut; die Vergütung weicht leicht ab, weil jeder Partner mit seinen eigenen Qualitätskennzahlen requalifiziert wird." />
            </>
          }
          ikone={Users}
          aktionen={
            <Btn groesse="sm" onClick={() => setAlle(a => !a)}>
              {alle ? 'Nur die größten 40' : `Alle ${ergebnisse.length} anzeigen`}
            </Btn>
          }
        />
        <KarteKoerper eng>
          {/* Die Verteilung bekommt eine eigene Zeile über der Tabelle: neben
              dem Knopf im Kartenkopf wurde die Legende bei 1280 px abgeschnitten. */}
          <div className="vg-akte-partnerverteilung" aria-label="Verteilung der Vertriebspartner nach Ampel">
            <AnteilsBalken
              hoehe={12}
              mitLegende={false}
              format={v => `${zahl(v)} Vertriebspartner`}
              teile={stufen.map(a => ({ id: a.id, label: a.label, wert: verteilung[a.id] || 0, farbe: AMPEL_FARBE[a.id] }))}
            />
            <div className="vg-akte-partnerverteilung-legende">
              {stufen.map(a => (
                <span key={a.id} className="vg-akte-partnerverteilung-eintrag">
                  <span className="vg-legende-marke" style={{ background: AMPEL_FARBE[a.id] }} aria-hidden="true" />
                  {zahl(verteilung[a.id] || 0)} {a.label}
                </span>
              ))}
            </div>
          </div>
          <Tabelle
            eng
            hoch
            klasse="vg-akte-partner"
            spalten={[
              {
                id: 'name', label: 'Name', wert: x => x.p.name,
                zelle: x => (
                  <span className="vg-reihe" style={{ gap: 7 }}>
                    <span className={`vg-ampel-punkt vg-ampel-${x.e.ampel}`} />
                    <span className="vg-kappen" style={{ maxWidth: 190 }}>{x.p.name}</span>
                  </span>
                ),
              },
              { id: 'rolle', label: 'Rolle', wert: x => x.p.rolle, zelle: x => <span className="vg-t-sm vg-schwach">{x.p.rolle}</span> },
              { id: 'gst', label: 'Geschäftsstelle', wert: x => x.p.geschaeftsstelle, zelle: x => <span className="vg-t-sm vg-schwach vg-kappen">{x.p.geschaeftsstelle}</span> },
              { id: 'modell', label: 'Wahlmodell', wert: x => x.p.wahlmodellPraeferenz, zelle: x => {
                const m = { apFpModell: 'AP/FP', hybridModell: 'Hybrid', laufendesModell: 'Laufend', umdeckerModell: 'Umdecker' }[x.p.wahlmodellPraeferenz] || '–'
                return <Badge>{m}</Badge>
              } },
              { id: 'storno', label: 'Storno', num: true, wert: x => x.p.qualitaet.storno, zelle: x => <span className="vg-mono vg-t-sm">{prozent(x.p.qualitaet.storno * 100)}</span> },
              { id: 'ist', label: 'heute', num: true, wert: x => x.e.ist.gesamt, zelle: x => <span className="vg-mono">{euro(x.e.ist.gesamt)}</span> },
              { id: 'ziel', label: 'Zielmodell', num: true, wert: x => x.e.ziel.gesamt, zelle: x => <span className="vg-mono vg-stark">{euro(x.e.ziel.gesamt)}</span> },
              {
                id: 'delta', label: 'Veränderung', num: true, wert: x => x.e.delta.prozent,
                zelle: x => (
                  <span className="vg-reihe" style={{ justifyContent: 'flex-end', gap: 8 }}>
                    <span style={{ width: 54 }}><DeltaBalkenIntern wert={x.e.delta.absolut} maximum={maxDelta} /></span>
                    <Delta prozent={x.e.delta.prozent} nurProzent />
                  </span>
                ),
              },
            ]}
            zeilen={sichtbar}
            schluessel={x => x.p.id}
            standardSortierung={{ id: 'ist', richtung: 'ab' }}
            fusszeile={{
              name: `${ergebnisse.length} Vertriebspartner`,
              ist: <span className="vg-mono">{euro(summeIst)}</span>,
              ziel: <span className="vg-mono">{euro(summeZiel)}</span>,
              delta: <Delta prozent={summeIst > 0 ? ((summeZiel - summeIst) / summeIst) * 100 : 0} nurProzent />,
            }}
          />
        </KarteKoerper>
        {!alle && ergebnisse.length > 40 && (
          <KarteFuss>
            Es werden die 40 produktionsstärksten Vertriebspartner gezeigt. Die Summenzeile bezieht sich auf alle {ergebnisse.length}.
          </KarteFuss>
        )}
      </Karte>
    </div>
  )
}

function DeltaBalkenIntern({ wert, maximum }) {
  const anteil = Math.max(-1, Math.min(1, wert / Math.max(1e-9, maximum)))
  const breite = Math.abs(anteil) * 50
  const links = anteil >= 0 ? 50 : 50 - breite
  return (
    <div className="vg-mini-balken" aria-hidden="true">
      <span style={{ left: `${links}%`, width: `${breite}%`, background: wert >= 0 ? 'var(--vg-positiv)' : 'var(--vg-negativ)' }} />
      <span style={{ left: '50%', width: 1, background: 'var(--vg-rand-stark)', borderRadius: 0 }} />
    </div>
  )
}

// --------------------------------------------------- Argumente

function ArgumenteTab({ ergebnis, hebel, portfolio }) {
  const karten = useMemo(() => argumentationskarten(ergebnis, hebel, portfolio), [ergebnis, hebel, portfolio])
  const fragen = useMemo(() => einwaende(ergebnis, hebel), [ergebnis, hebel])
  const [kopiert, setKopiert] = useState(null)

  const kopieren = useCallback((k) => {
    const text = `${k.titel}\n${k.text}\nQuelle: ${k.quelle}`
    navigator.clipboard?.writeText(text)
    setKopiert(k.id)
    setTimeout(() => setKopiert(null), 1600)
  }, [])

  return (
    <div className="vg-raster vg-raster-2">
      <div className="vg-stapel">
        <div className="vg-kpi-titel">Gesprächspunkte</div>
        {karten.map(k => (
          <Karte key={k.id}>
            <KarteKoerper>
              <div className="vg-reihe-weit" style={{ marginBottom: 6 }}>
                <span className="vg-reihe" style={{ gap: 8 }}>
                  <span className={`vg-ampel-punkt vg-ampel-${k.ton === 'positiv' ? 'gewinner' : k.ton === 'negativ' ? 'kritisch' : k.ton === 'warnung' ? 'beobachten' : 'neutral'}`} />
                  <span className="vg-t-lg vg-stark">{k.titel}</span>
                  <InfoTip text={`Quelle: ${k.quelle}`} />
                </span>
                <Btn
                  groesse="sm" variante="still" nurIkone
                  className="vg-akte-kopieren"
                  data-kopiert={kopiert === k.id}
                  ikone={kopiert === k.id ? Check : Copy}
                  onClick={() => kopieren(k)}
                  aria-label="Gesprächspunkt kopieren"
                  title="Gesprächspunkt kopieren"
                />
              </div>
              <p className="vg-merkzeile" style={{ margin: 0 }}>{k.text}</p>
            </KarteKoerper>
          </Karte>
        ))}
      </div>

      <div className="vg-stapel">
        <div className="vg-kpi-titel">Einwände und Antworten</div>
        <dl className="vg-einwand">
          {fragen.map((f, i) => (
            <div key={i}>
              <dt className="vg-stark">{f.frage}</dt>
              <dd className="vg-merkzeile">{f.antwort}</dd>
            </div>
          ))}
        </dl>

        {ergebnis.einheit.verhandlung?.forderungen?.length > 0 && (
          <Karte>
            <KarteKopf titel="Bekannte Forderungen" unter={`Stand ${datum(ergebnis.einheit.verhandlung.letzteGespraechsrunde)}`} />
            <KarteKoerper>
              <ul style={{ margin: 0, paddingLeft: 18 }} className="vg-stapel">
                {ergebnis.einheit.verhandlung.forderungen.map((f, i) => (
                  <li key={i} className="vg-t-md" style={{ marginBottom: 6 }}>{f}</li>
                ))}
              </ul>
            </KarteKoerper>
            <KarteFuss>
              Ansprechpartner: {ergebnis.einheit.verhandlung.ansprechpartner}
              {ergebnis.einheit.verhandlung.funktion && `, ${ergebnis.einheit.verhandlung.funktion}`}
              {ergebnis.einheit.verhandlung.naechsterTermin && ` · nächster Termin ${datum(ergebnis.einheit.verhandlung.naechsterTermin)}`}
            </KarteFuss>
          </Karte>
        )}
      </div>
    </div>
  )
}

// --------------------------------------------------- Stammdaten

function StammdatenTab({ einheit, ergebnis }) {
  const s = einheit.stammdaten
  const q = einheit.qualitaet
  return (
    <div className="vg-raster vg-raster-3">
      <Karte>
        <KarteKopf titel="Institut" />
        <KarteKoerper>
          {s && [
            ['Bilanzsumme', euro(s.bilanzsummeEur)],
            ['Mitarbeiter', zahl(s.mitarbeiter)],
            ['Geschäftsstellen', zahl(s.geschaeftsstellenGesamt)],
            ['Bankkunden', zahl(s.bankkunden)],
            ['S-Finanzberater', zahl(s.sFinanzberater)],
            ['Vertriebspartner', zahl(s.vertriebspartnerGesamt)],
          ].map(([l, w]) => <WertZeile key={l} label={l} wert={w} />)}
          {!s && <p className="vg-merkzeile">Für diese Einheit sind keine Institutsstammdaten hinterlegt.</p>}
        </KarteKoerper>
      </Karte>

      <Karte>
        <KarteKopf titel="Produktion und Bestand" unter={`Referenzzeitraum ${REFERENZZEITRAUM_TEXT}`} />
        <KarteKoerper>
          {[
            ['Neugeschäft Leben (Beitragssumme)', euro(einheit.produktion.lebenBs)],
            ['davon bAV', euro(einheit.produktion.lebenBsBav)],
            ['davon Biometrie', euro(einheit.produktion.lebenBsBiometrie)],
            ['Neugeschäft Komposit (Jahresbeitrag)', euro(einheit.produktion.kompositJahresbeitrag)],
            ['Bestandsbeitrag Leben', euro(einheit.bestand.lebenBeitrag)],
            ['Bestandsbeitrag Komposit', euro(einheit.bestand.kompositBeitrag)],
            ['Versicherungskunden', zahl(einheit.bestand.versicherungskunden)],
            ['Verträge', zahl(einheit.bestand.vertraege)],
          ].map(([l, w]) => <WertZeile key={l} label={l} wert={w} />)}
        </KarteKoerper>
      </Karte>

      <Karte>
        <KarteKopf titel="Qualität und Steuerung" />
        <KarteKoerper>
          {[
            ['Stornoquote Leben', prozent(q.storno * 100), 'Frühstorno im Referenzjahr'],
            ['Beitragsduration', `${zahl(q.duration, 1)} Jahre`, 'Mittlere Beitragszahlungsdauer im Neugeschäft'],
            ['Beitragsfreistellungsquote', prozent(q.beitragsfreistellung * 100)],
            ['Bestandsausschöpfung', prozent(q.ausschoepfung * 100), 'Anteil der Bankkunden mit Versicherungsvertrag'],
            ['Vertragsdichte', `${zahl(q.vertragsdichte, 2)} Verträge je Kunde`],
            ['Weiterbildungsquote', prozent(q.weiterbildung * 100)],
            ['Zielerreichung Vorjahr', prozent(einheit.zielerreichung * 100)],
            ['Anteil AP-only-Modell', prozent(einheit.apOnlyQuote * 100), 'Wahlverhalten im heutigen Modell'],
          ].map(([l, w, h]) => <WertZeile key={l} label={l} wert={w} hinweis={h} />)}
        </KarteKoerper>
      </Karte>
    </div>
  )
}

// --------------------------------------------------- Hauptkomponente

export default function Institutsakte({ einheit, portfolio, hebel, fassungen, navigiere }) {
  const [reiter, setReiter] = useState('uebersicht')
  const [verhandlung, setVerhandlung] = useState(false)
  const [handout, setHandout] = useState(false)

  const ergebnis = useMemo(
    () => berechneEinzel(einheit, hebel, { bonusNormierung: portfolio.bonusNormierung }),
    [einheit, hebel, portfolio.bonusNormierung])

  if (handout) {
    return (
      <Handout
        ergebnis={ergebnis}
        portfolio={portfolio}
        hebel={hebel}
        fassung={fassungen.aktiv}
        onZurueck={() => setHandout(false)}
      />
    )
  }

  const wechsleReiter = (id) => {
    if (id !== reiter) mitUebergang(() => setReiter(id))
  }
  const ersterNeben = REITER.find(r => r.neben)?.id

  // `vg-akte` trägt die Höhenregeln des Akten-Steuerblocks (akte.css): mit
  // Stammdaten und Stapelbalken ist er der vollste Block der Anwendung und
  // muss bei 1000 px Höhe ohne Scrollen bis zu den Signalen reichen.
  return (
    <div className="vg-stapel vg-akte">
      <div className="vg-buehne">
        <AktenSteuerblock
          einheit={einheit}
          ergebnis={ergebnis}
          hebel={hebel}
          fassung={fassungen.aktiv}
          navigiere={navigiere}
          aufVerhandlung={() => setVerhandlung(true)}
          aufHandout={() => setHandout(true)}
        />
        <div className="vg-stapel">
          <div className="vg-reiter" role="tablist">
            {REITER.map(r => (
              <button
                key={r.id}
                type="button"
                role="tab"
                aria-selected={reiter === r.id}
                className={r.neben
                  ? `vg-akte-reiter-neben${r.id === ersterNeben ? ' vg-akte-reiter-neben-erster' : ''}`
                  : undefined}
                onClick={() => wechsleReiter(r.id)}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div key={reiter} className="vg-buehne-ein">
            {reiter === 'uebersicht' && <Uebersicht einheit={einheit} ergebnis={ergebnis} hebel={hebel} portfolio={portfolio} />}
            {reiter === 'verlauf' && <VerlaufTab ergebnis={ergebnis} />}
            {reiter === 'partner' && <PartnerTab einheit={einheit} hebel={hebel} portfolio={portfolio} />}
            {reiter === 'argumente' && <ArgumenteTab ergebnis={ergebnis} hebel={hebel} portfolio={portfolio} />}
            {reiter === 'stammdaten' && <StammdatenTab einheit={einheit} ergebnis={ergebnis} />}
          </div>
        </div>
      </div>

      <Verhandlungsmodus
        offen={verhandlung}
        onSchliessen={() => setVerhandlung(false)}
        einheit={einheit}
        hebel={hebel}
        fassungen={fassungen}
        portfolio={portfolio}
      />
    </div>
  )
}
