import { useMemo } from 'react'
import { euroKompaktDelta, prozentDelta } from '../lib/format'
import { useAnimierteZahl } from './basis'

/**
 * BUDGETWAAGE
 *
 * Das visuelle Leitmotiv der Anwendung. Sie beantwortet die Leitfrage
 * des Unternehmens, das die Vergütung zahlt: kostet das Zielmodell mehr
 * als heute?
 *
 * Wichtig: Die Frage hat DREI Antworten, die auseinanderfallen.
 *   eingeschwungen  „dauerhaft“: Jahreswert nach dem Hochlauf, alle Jahrgänge zahlen
 *   barwert         Vergütung je Neugeschäftsjahrgang, abgezinst
 *   startjahr       kumuliert 2028 bis 2030, barwertig (Preis der Einführungsphase)
 * Die Gesamtampel ist immer das SCHLECHTESTE der drei Signale — aus
 * Zahlersicht also das teuerste. Eine grüne Nadel neben zwei roten wäre
 * die gefährlichste Fehlinformation, die dieses Werkzeug liefern könnte.
 *
 * Zahlersicht heißt: die Budgetleitplanke ist eine Obergrenze. Mehr als
 * heute wird ab 1,5 % zur Warnung und ab 4 % zur Überschreitung. Deutlich
 * weniger als heute (unter −4 %) ist ebenfalls eine Warnung, denn dort
 * verlieren die Institute — wer verliert, stellt nicht um. Der Korridor
 * dazwischen ist der gesuchte Modus. Die Akte färbt aus Sicht des
 * Instituts (deltaTon).
 */

const SPANNE = 12 // Prozentpunkte je Seite

function position(prozent) {
  const p = Math.max(-SPANNE, Math.min(SPANNE, prozent))
  return 50 + (p / SPANNE) * 50
}

/**
 * Zweiseitiger Korridor: mehr als heute ist ab 1,5 % Warnung und ab 4 %
 * Überschreitung (Budget ist eine Obergrenze). Deutlich weniger als heute,
 * unter −4 %, ist ebenfalls Warnung: dort verlieren die Institute, und wer
 * verliert, stellt nicht um. Dazwischen hält das Modell das Budget.
 */
export function ton(prozent) {
  if (prozent > 4) return 'negativ'
  if (prozent > 1.5) return 'warnung'
  if (prozent < -4) return 'warnung'
  return 'positiv'
}

/** Wort zum Ton eines Signals — die Warnung nennt ihre Richtung */
export function tonWort(prozent) {
  const t = ton(prozent)
  if (t === 'negativ') return 'über Budget'
  if (t === 'warnung') return prozent > 0 ? 'leicht über Budget' : 'deutlich unter heute'
  return 'im Budget'
}

const RANG = { positiv: 0, warnung: 1, negativ: 2 }

/**
 * Das schlechtere der beiden Budget-Signale — Vergleich Referenzzeitraum
 * und kumuliert bis 2030 (Barwert): höchster Rang, bei Gleichstand der
 * größte Ausschlag. Liefert Ton, Wort und den Wert, der die Leitzahl trägt.
 * Der Barwert je Jahrgang wird nachrichtlich mitgeführt, aber nicht
 * gewertet: er misst vor allem, dass dieselbe Vergütung später fließt
 * (Abschluss- wird zu laufender Provision), nicht, ob das Budget hält.
 */
export function lageUrteil({ eingeschwungen, startjahr }) {
  const werte = [eingeschwungen, startjahr].filter(Number.isFinite)
  if (!werte.length) return { ton: 'positiv', wort: 'im Budget', wert: 0 }
  const wert = werte.reduce((a, b) => {
    const ra = RANG[ton(a)], rb = RANG[ton(b)]
    return rb > ra || (rb === ra && Math.abs(b) > Math.abs(a)) ? b : a
  })
  return { ton: ton(wert), wort: tonWort(wert), wert }
}

/** Schlechtestes der übergebenen Signale */
export function gesamtTon(...werte) {
  return werte
    .filter(v => Number.isFinite(v))
    .map(ton)
    .reduce((a, b) => (RANG[b] > RANG[a] ? b : a), 'positiv')
}

/**
 * Verbindlicher Klartextsatz zur Gesamtlage. Nennt immer alle drei
 * Größen, damit keine davon isoliert gelesen werden kann; gewertet werden
 * die beiden Budget-Sichten, der Barwert je Jahrgang steht nachrichtlich.
 */
export function lageSatz({ eingeschwungen, barwert, startjahr }) {
  const t = gesamtTon(eingeschwungen, startjahr)
  const zahlen = `Vergleich Referenzzeitraum ${prozentDelta(eingeschwungen)}, kumuliert bis 2030 barwertig ${prozentDelta(startjahr)}; nachrichtlich barwertig je Jahrgang ${prozentDelta(barwert)}.`
  const u = lageUrteil({ eingeschwungen, startjahr })
  if (t === 'positiv') return `${zahlen} Das Modell hält in beiden Budget-Sichten das Budget.`
  if (t === 'warnung' && u.wert > 0) return `${zahlen} Das Modell liegt in mindestens einer Budget-Sicht leicht über dem Budget.`
  if (t === 'warnung') return `${zahlen} Das Modell liegt in mindestens einer Budget-Sicht deutlich unter heute — dort verlieren die Institute.`
  return `${zahlen} In dieser Form überschreitet das Modell das Budget.`
}

export function WaageBand({ prozent, kompakt = false, marke }) {
  const p = useAnimierteZahl(prozent, 420)
  return (
    <div className={`vg-waage-band${kompakt ? ' vg-waage-band-kompakt' : ''}`} aria-hidden="true">
      <span className="vg-waage-zone" style={{ left: `${position(-1.5)}%`, width: `${position(1.5) - position(-1.5)}%` }} />
      <span className="vg-waage-mitte" />
      {marke != null && (
        <span
          className="vg-waage-nadel"
          data-ton="neutral"
          style={{ left: `${position(marke)}%`, opacity: .35, width: 2 }}
        />
      )}
      <span className="vg-waage-nadel" data-ton={ton(prozent)} style={{ left: `${position(p)}%` }} />
    </div>
  )
}

function Zeile({ titel, prozent, absolut, hinweis, marke }) {
  return (
    <div style={{ marginTop: 10 }}>
      <div className="vg-reihe-weit" style={{ marginBottom: 5 }}>
        <span className="vg-kpi-titel" style={{ margin: 0 }}>{titel}</span>
        <span className="vg-reihe" style={{ gap: 8 }}>
          {absolut != null && <span className="vg-mono vg-t-sm vg-schwach">{euroKompaktDelta(absolut)}</span>}
          <span className="vg-delta" data-ton={ton(prozent)}>{prozentDelta(prozent)}</span>
        </span>
      </div>
      <WaageBand prozent={prozent} kompakt marke={marke} />
      {hinweis && <p className="vg-merkzeile" style={{ margin: '6px 0 0' }}>{hinweis}</p>}
    </div>
  )
}

export default function Waage({
  eingeschwungen, barwert, startjahr, absolut, aktion,
}) {
  const t = gesamtTon(eingeschwungen, barwert, startjahr)
  const satz = useMemo(
    () => lageSatz({ eingeschwungen, barwert, startjahr }),
    [eingeschwungen, barwert, startjahr])

  return (
    <div className="vg-waage">
      <div className="vg-reihe-weit">
        <div className="vg-reihe" style={{ gap: 10 }}>
          <span className="vg-kpi-titel" style={{ margin: 0 }}>Gesamtlage</span>
          <span className="vg-delta vg-delta-gross" data-ton={t}>
            {lageUrteil({ eingeschwungen, barwert, startjahr }).wort}
          </span>
        </div>
        {aktion}
      </div>

      <p className="vg-merkzeile" style={{ margin: '4px 0 0' }}>{satz}</p>

      <Zeile
        titel="Vergleich Referenzzeitraum"
        prozent={eingeschwungen}
        absolut={absolut}
        hinweis="Zielmodell auf Produktion und Bestand des Referenzzeitraums, so gerechnet, als gälte es dort bereits vollständig (alle Jahrgänge der laufenden Provision zahlen)."
      />
      <Zeile
        titel="Barwert je Neugeschäftsjahrgang"
        prozent={barwert}
        hinweis="Was ein Partner über die gesamte Laufzeit an einem neu geschriebenen Vertrag verdient."
      />
      <Zeile
        titel="kumuliert bis 2030 (Barwert)"
        prozent={startjahr}
        hinweis="Veränderung der kassenwirksamen Jahre 2028 bis 2030 gegenüber heute, mit Übergangsregel, abgezinst — der Preis der Einführungsphase."
      />

      <div className="vg-waage-skala" style={{ marginTop: 8 }}>
        <span>−{SPANNE} %</span>
        <span>−4 %</span>
        <span style={{ fontWeight: 500, color: 'var(--vg-text-2)' }}>0 %</span>
        <span>+4 %</span>
        <span>+{SPANNE} %</span>
      </div>
    </div>
  )
}

/**
 * Legende der Farblogik — steht überall, wo Töne aus ton() gezeigt werden.
 *   zahlersicht  ergänzt die Regel für Zeilen und Regler des Kastens
 *   institut     stattdessen die Sicht des Hauses (Akte)
 */
export function Farblegende({ zahlersicht = false, institut = false }) {
  if (institut) {
    return (
      <div className="vg-farblegende" role="note">
        Farben aus Sicht des Instituts:{' '}
        <span className="vg-delta" data-ton="positiv">grün</span> gewinnt,{' '}
        <span className="vg-delta" data-ton="warnung">orange</span> nahezu unverändert,{' '}
        <span className="vg-delta" data-ton="negativ">rot</span> verliert.
        Zeilen: grün mehr Vergütung, rot weniger.
      </div>
    )
  }
  return (
    <div className="vg-farblegende" role="note">
      Ampel: <span className="vg-delta" data-ton="positiv">grün</span> im Budget (gleich oder bis 1,5 % mehr als heute) ·{' '}
      <span className="vg-delta" data-ton="warnung">orange</span> über 1,5 % mehr, oder über 4 % weniger (dort verlieren die Institute) ·{' '}
      <span className="vg-delta" data-ton="negativ">rot</span> über 4 % mehr.
      {zahlersicht && <> Zeilen und Regler: <span className="vg-delta" data-ton="warnung">orange</span> Mehrkosten, <span className="vg-delta" data-ton="positiv">grün</span> Ersparnis.</>}
    </div>
  )
}
