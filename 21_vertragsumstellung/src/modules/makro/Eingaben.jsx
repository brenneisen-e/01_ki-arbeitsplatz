import { useMemo } from 'react'
import ReglerZeile from '../../ui/Regler'
import { Tafel, StaffelTabelle } from '../../ui/Tafel'
import { Schalter, Tip } from '../../ui/basis'
import { HEBEL, HEBEL_INDEX, BONUS_SATZ_IDS, BONUS_SCHWELLE_IDS } from '../../lib/hebel'
import { bonusSchwellen } from '../../lib/modell'
import { zahl } from '../../lib/format'

/**
 * EINGABE-TAFELN des Simulationskastens — alle Stellhebel als dichte
 * Reglerzeilen, die Bonusstaffel als editierbare Tabelle (Schwellen und
 * Sätze). Das Bauteil liefert ein Fragment; die Tafeln stehen direkt im
 * Raster .vg-tafeln des Kastens, das sie über Klassen anordnet (makro.css):
 *
 *   Abschlussprovision · Laufende und Bestandsprovision · Bonifikation
 *   Garantien und Übergang · Zuschüsse                  · (Bonifikation)
 *   Weitere Stellhebel (flach über alle Spalten, zugeklappt)
 *
 * Die Bonifikations-Tafel ist die höchste; sie spannt zwei Reihen, damit
 * die kürzeren Tafeln keine leeren Flächen tragen.
 */

// Kurze Namen für die dichte Zeile: die Tafel trägt den Kontext („Abschluss-
// provision“), die Zeile nur noch das Unterscheidende. Der volle Name steht
// im Tip vor dem Hinweis.
const KASTEN_LABEL = {
  apLeben: 'AP Leben',
  zuschlagBav: 'Zuschlag bAV',
  zuschlagBiometrie: 'Zuschlag Biometrie',
  apKomposit: 'AP Komposit',
  kfzAbschlag: 'Kfz-Abschlag',
  lpLeben: 'LP Leben',
  lpDauer: 'LP-Laufzeit',
  bpLeben: 'BP Leben',
  bpKomposit: 'BP Komposit',
  bpAltbestand: 'BP Altbestand',
  bonusProgression: 'Progression',
  kleininstitutSockel: 'Institutssockel',
  qualitaetskriterien: 'Muss-Kriterien',
  bonusNormierung: 'Auf Budget normieren',
  besitzstandQuote: 'Besitzstand',
  besitzstandJahre: 'Einschleifphase',
  verlustdeckel: 'Verlustdeckel',
  gewinndeckel: 'Gewinndeckel',
  zuschussAllgemein: 'Allg. Zuschuss',
  zuschussStandort: 'Standortzuschuss',
  zuschussAbbau: 'Zuschussabbau',
  bonusBudget: 'Bonusbudget',
  anteilUmdecker: 'Umdecker',
  anteilHybrid: 'Hybrid',
  anteilLaufend: 'Laufend',
  qualitaetsSpreizung: 'Spreizung',
  stornoSchwelle: 'Storno-Schwelle',
  ausschoepfungsZuschlag: 'Ausschöpfung',
  journeyOmnikanal: 'Omnikanal',
  betreuungsGewicht: 'Betreuung',
  diskontsatz: 'Diskontsatz',
}

// Einmal gebaut, damit die memoisierte Reglerzeile dieselbe def-Referenz
// bekommt und nicht bei jedem Rendern des Kastens neu zeichnet.
const KASTEN_DEF = Object.fromEntries(HEBEL.map(def => [def.id, {
  ...def,
  label: KASTEN_LABEL[def.id] ?? def.kurz ?? def.label,
  hinweis: `${def.label}. ${def.hinweis}`,
}]))

const TAFELN = {
  abschluss: ['apLeben', 'zuschlagBav', 'zuschlagBiometrie', 'apKomposit', 'kfzAbschlag'],
  folge: ['lpLeben', 'lpDauer', 'bpLeben', 'bpKomposit', 'bpAltbestand'],
  bonus: ['bonusProgression', 'kleininstitutSockel', 'qualitaetskriterien'],
  uebergang: ['besitzstandQuote', 'besitzstandJahre', 'verlustdeckel', 'gewinndeckel'],
  zuschuesse: ['zuschussAllgemein', 'zuschussStandort', 'zuschussAbbau'],
}

/** Weitere Stellhebel, nach Gruppe — zugeklappt, aufgeklappt in zwei Spalten */
const WEITERE = [
  { id: 'wahlmodelle', titel: 'Wahlmodelle', hebel: ['anteilUmdecker', 'anteilHybrid', 'anteilLaufend'] },
  { id: 'qualitaet', titel: 'Qualität', hebel: ['qualitaetsSpreizung', 'stornoSchwelle', 'ausschoepfungsZuschlag'] },
  { id: 'journey', titel: 'Journey', hebel: ['journeyOmnikanal', 'betreuungsGewicht'] },
  { id: 'bonusRahmen', titel: 'Bonus und Bewertung', hebel: ['bonusBudget', 'diskontsatz'] },
]

/** Regler, die sich auf Budgetneutralität stellen lassen */
const NEUTRALSTELLBAR = ['apLeben', 'apKomposit', 'bpKomposit', 'bpLeben', 'lpLeben']

const SATZ_DEF = HEBEL_INDEX.bonusSatz1
const SCHWELLE_DEF = HEBEL_INDEX.bonusSchwelle1
const STAFFEL_BASIS = BONUS_SATZ_IDS.map(id => HEBEL_INDEX[id].basis)

function wertVon(hebel, id) {
  return hebel[id] ?? HEBEL_INDEX[id].standard
}

function anzahlVeraendert(hebel, ids) {
  return ids.filter(id => Math.abs(wertVon(hebel, id) - HEBEL_INDEX[id].basis) > 1e-9).length
}

/** Wert in den Bereich und auf den Schritt eines Hebels bringen */
function klemme(def, v) {
  return Math.min(def.max, Math.max(def.min, Math.round(v / def.step) * def.step))
}

/**
 * Umschalter „auf Budget normieren“ als eigene 44-px-Zeile — derselbe Bau
 * wie die dichte Reglerzeile (Name links, Stand rechts), aber mit einem
 * echten Schalter statt einer 0/1-Bahn.
 */
function SchalterZeile({ def, wert, onAendern }) {
  const an = wert >= 0.5
  const veraendert = Math.abs(wert - def.basis) > 1e-9
  return (
    <div className="vg-kasten-schalter" data-veraendert={veraendert}>
      <Tip text={def.hinweis} breite={330}>
        <span className="vg-regler-name">{def.label}</span>
      </Tip>
      <span className="vg-kasten-schalter-stand">{an ? 'an' : 'aus'}</span>
      <Schalter an={an} onAendern={(neu) => onAendern(def.id, neu ? 1 : 0)} label={def.label} />
    </div>
  )
}

export default function Eingaben({ hebel, onAendern, onNeutralstellen, portfolio }) {
  const regler = (id) => (
    <ReglerZeile
      key={id}
      def={KASTEN_DEF[id]}
      wert={wertVon(hebel, id)}
      onAendern={onAendern}
      onNeutralstellen={onNeutralstellen && NEUTRALSTELLBAR.includes(id) ? onNeutralstellen : undefined}
      dicht
    />
  )

  const normierungAn = wertVon(hebel, 'bonusNormierung') >= 0.5
  const faktor = normierungAn ? (portfolio?.bonusNormierung ?? 1) : 1

  // Solange die Normierung an ist, zahlt die Engine nicht den Hebelsatz,
  // sondern Hebelsatz × Normierungsfaktor. Die Tabelle zeigt als „Satz neu“
  // diesen effektiven Satz (auf den Schritt gerundet) — was gilt, nicht was
  // im Hebel steht. Ohne Normierung ist beides dasselbe.
  const effektiveSaetze = useMemo(
    () => Object.fromEntries(BONUS_SATZ_IDS.map(id => [id, klemme(SATZ_DEF, wertVon(hebel, id) * faktor)])),
    [hebel, faktor])

  // Bonusstaffel: Sätze effektiv (s. o.), Schwellen aus der Portfolio-
  // rechnung — die Engine klemmt sie aufsteigend, und die Tabelle soll
  // zeigen, was gilt. Stufe 1 hat keine Schwelle (die Engine liefert dort 0).
  const stufen = useMemo(() => (portfolio?.bonusVerteilung || []).map(s => ({
    index: s.index,
    label: s.label,
    schwelle: s.index === 0 ? null : s.schwelleNeu,
    satzHeute: s.satzHeute,
    satzNeu: effektiveSaetze[BONUS_SATZ_IDS[s.index]],
  })), [portfolio?.bonusVerteilung, effektiveSaetze])

  // Der erste Eingriff in die Staffel schaltet die Normierung ab: die
  // Staffel soll dann direkt wirken, sonst bliebe das Bonusvolumen beim
  // Budget stehen. Damit der Wechsel selbst nichts springen lässt (§ 10),
  // werden die effektiven Sätze — genau die, die die Tabelle schon zeigt —
  // als Hebel eingefroren; der getippte Wert ersetzt seinen Satz unverändert.
  const satzAendern = (index, wert) => {
    const id = BONUS_SATZ_IDS[index]
    if (!normierungAn) { onAendern(id, wert); return }
    onAendern(null, { ...effektiveSaetze, [id]: wert, bonusNormierung: 0 })
  }

  // Schwelle der Stufe `index` (ab Stufe 2): Hebel bonusSchwelle{index}.
  // Die Engine klemmt Schwellen aufsteigend (mindestens Vorgänger + 1); hier
  // wird schon der Hebel so geklemmt — nach unten wie nach oben —, damit
  // Feld, Bereich und Beschlussvorlage denselben Wert zeigen.
  const schwelleAendern = (index, wert) => {
    const id = BONUS_SCHWELLE_IDS[index - 1]
    if (!id) return
    const schwellen = bonusSchwellen(hebel)
    const unten = index >= 2 ? schwellen[index - 2] + 1 : SCHWELLE_DEF.min
    const oben = index < BONUS_SCHWELLE_IDS.length ? schwellen[index] - 1 : SCHWELLE_DEF.max
    const geklemmt = klemme(SCHWELLE_DEF, Math.min(Math.max(wert, unten), Math.max(unten, oben)))
    if (!normierungAn) { onAendern(id, geklemmt); return }
    onAendern(null, { ...effektiveSaetze, [id]: geklemmt, bonusNormierung: 0 })
  }

  // Der Tip des Umschalters erklärt, warum „Satz neu“ mit Normierung vom
  // Hebelsatz abweichen kann.
  const normierungDef = useMemo(() => ({
    ...KASTEN_DEF.bonusNormierung,
    hinweis: `${KASTEN_DEF.bonusNormierung.hinweis} Solange die Normierung an ist, zeigt die Staffel als „Satz neu“ `
      + `die effektiv gezahlten Sätze (Hebelsatz × Faktor ${zahl(faktor, 2)}); die Spalte „heute“ bleibt der Basiswert.`,
  }), [faktor])

  const zaehler = (ids) => anzahlVeraendert(hebel, ids) || undefined
  const staffelVeraendert = anzahlVeraendert(hebel, [...BONUS_SATZ_IDS, ...BONUS_SCHWELLE_IDS])
  const bonusVeraendert = staffelVeraendert + anzahlVeraendert(hebel, [...TAFELN.bonus, 'bonusNormierung'])
  const weitereIds = WEITERE.flatMap(g => g.hebel)
  const weitereVeraendert = anzahlVeraendert(hebel, weitereIds)

  return (
    <>
      <Tafel titel="Abschlussprovision" ton="eingabe" zaehler={zaehler(TAFELN.abschluss)} buendig>
        <div className="vg-kasten-regler">{TAFELN.abschluss.map(regler)}</div>
      </Tafel>

      <Tafel titel="Laufende und Bestandsprovision" ton="eingabe" zaehler={zaehler(TAFELN.folge)} buendig>
        <div className="vg-kasten-regler">{TAFELN.folge.map(regler)}</div>
      </Tafel>

      {/* Spannt zwei Reihen (makro.css) — rechts neben Reihe 1 und 2 */}
      <Tafel
        titel="Bonifikation"
        ton="eingabe"
        zaehler={bonusVeraendert || undefined}
        dicht
        buendig
        className="vg-kasten-tafel-bonus"
      >
        {/* Nur das Bedienen: Bereich, Schwelle, Satz neu (heute klein
            darunter). Einheiten und Volumen je Stufe stehen einmal — in der
            Wirkungs-Tafel „Bonusstaffel — wer landet wo“. */}
        <div className="vg-kasten-staffel">
          <StaffelTabelle
            stufen={stufen}
            onSatz={satzAendern}
            onSchwelle={schwelleAendern}
            basis={STAFFEL_BASIS}
            spalten={['bereich', 'schwelle', 'satz']}
            min={SATZ_DEF.min}
            max={SATZ_DEF.max}
            step={SATZ_DEF.step}
            schwelleMin={SCHWELLE_DEF.min}
            schwelleMax={SCHWELLE_DEF.max}
          />
        </div>
        <div className="vg-kasten-regler vg-kasten-regler-unter-tabelle">
          {regler('bonusProgression')}
          {regler('kleininstitutSockel')}
          <SchalterZeile
            def={normierungDef}
            wert={wertVon(hebel, 'bonusNormierung')}
            onAendern={onAendern}
          />
          {regler('qualitaetskriterien')}
        </div>
      </Tafel>

      <Tafel titel="Garantien und Übergang" ton="eingabe" zaehler={zaehler(TAFELN.uebergang)} buendig>
        <div className="vg-kasten-regler">{TAFELN.uebergang.map(regler)}</div>
      </Tafel>

      <Tafel titel="Zuschüsse" ton="eingabe" zaehler={zaehler(TAFELN.zuschuesse)} buendig>
        <div className="vg-kasten-regler">{TAFELN.zuschuesse.map(regler)}</div>
      </Tafel>

      {/* Flach über alle Spalten: zugeklappt nur der Kopf mit Zähler,
          aufgeklappt die vier Gruppen in zwei Spalten */}
      <Tafel
        titel="Weitere Stellhebel"
        ton="eingabe"
        zaehler={weitereVeraendert || undefined}
        unter={weitereVeraendert
          ? `${weitereVeraendert} verändert`
          : 'Wahlmodelle, Qualität, Journey, Bonusrahmen'}
        aufklappbar
        offenStandard={false}
        buendig
        className="vg-kasten-tafel-weitere"
      >
        <div className="vg-kasten-regler vg-kasten-regler-zweispaltig">
          {WEITERE.map(g => (
            <div className="vg-kasten-gruppe" key={g.id}>
              <div className="vg-kasten-zwischenkopf">{g.titel}</div>
              {g.hebel.map(regler)}
            </div>
          ))}
        </div>
      </Tafel>
    </>
  )
}
