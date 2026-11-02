import { AlertTriangle, ExternalLink, Handshake, Search, UserCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import styles from './FaktSlide.module.css'
import type { Lang } from '../i18n/LanguageContext'
import type { Fakt, FaktIcon } from '../data/fakten'

// ─────────────────────────────────────────────────────────────────────────────
// FaktSlide: der Studien-Schritt eines Kapitels (nach der Einstiegsbühne, vor
// den Hypothesen) als Zahlenfolie im Beratungsstil. Vier Kennzahlen in einer
// Reihe, jede gleich gebaut (Schlagwort, große Zahl, höchstens zwei Zeilen,
// Punktraster): das Raster hat 100 Punkte in fünf Reihen zu 20, gefüllt ist
// der Anteil, jede Reihe steht für 20 Prozent, damit „58 von 100“ zählbar
// wird. Alle vier Spalten laufen in der Akzentfarbe (Linie, Icon, Schlagwort,
// Punkte); die betonte Zahl (Vertrauen) trägt zusätzlich die Hantel: der
// betonte Wert gegen den höchsten der Quellen, mit Legende statt Beschriftung
// an den Punkten, damit nichts kollidiert. Darunter
// die Folgerung in einer Zeile, zuletzt die Quelle. Die Überschrift setzt der
// Reader.
// ─────────────────────────────────────────────────────────────────────────────

type Props = {
  fakt: Fakt
  lang: Lang
}

const STR: Record<Lang, { quelleOeffnen: string; von100: (n: number) => string }> = {
  de: { quelleOeffnen: 'Studie bei Deloitte Insights öffnen', von100: (n) => `${n} von 100` },
  en: { quelleOeffnen: 'Open the study at Deloitte Insights', von100: (n) => `${n} of 100` },
  fr: { quelleOeffnen: 'Ouvrir l’étude sur Deloitte Insights', von100: (n) => `${n} sur 100` },
}

const PUNKTE = Array.from({ length: 100 }, (_, i) => i)

// Ein einfarbiges Icon je Bereich, in der Kickerzeile vor dem Schlagwort.
const ICONS: Record<FaktIcon, LucideIcon> = {
  suche: Search,
  vertrauen: Handshake,
  kontrolle: UserCheck,
  risiko: AlertTriangle,
}

export function FaktSlide({ fakt, lang }: Props): React.ReactElement {
  const t = STR[lang]
  const betonterBalken = fakt.chart.balken.find((b) => b.betont) ?? fakt.chart.balken[0]
  const hoechsterBalken = fakt.chart.balken.reduce((a, b) => (b.wert > a.wert ? b : a), fakt.chart.balken[0])
  return (
    <div className={styles.fakt}>
      <p className={styles.basis}>{fakt.basis[lang]}</p>

      <div className={styles.reihe}>
        {fakt.kennzahlen.map((k) => {
          const Icon = ICONS[k.icon]
          return (
          <section className={styles.zahl} key={k.kicker.en} data-betont={k.betont || undefined}>
            <span className={styles.kickerZeile}>
              <span className={styles.icon} aria-hidden>
                <Icon size={17} strokeWidth={2} />
              </span>
              <span className={styles.kicker}>{k.kicker[lang]}</span>
            </span>
            <span className={styles.wert}>
              {k.wert}
              {k.einheit && <span className={styles.einheit}>{k.einheit}</span>}
            </span>
            <span className={styles.label}>{k.label[lang]}</span>
            <span className={styles.waffel} role="img" aria-label={t.von100(k.wert)}>
              {PUNKTE.map((i) => (
                <span className={styles.punkt} key={i} data-voll={i < k.wert || undefined} aria-hidden />
              ))}
            </span>
            {k.zeigtVergleich && betonterBalken !== hoechsterBalken && (
              <div className={styles.hantel} aria-label={fakt.chart.untertitel[lang]}>
                <span className={styles.hantelLegende}>
                  <span className={styles.legendeEintrag} data-betont>
                    <span className={styles.legendePunkt} aria-hidden />
                    {betonterBalken.label[lang]} {betonterBalken.wert} %
                  </span>
                  <span className={styles.legendeEintrag}>
                    <span className={styles.legendePunkt} aria-hidden />
                    {hoechsterBalken.label[lang]} {hoechsterBalken.wert} %
                  </span>
                </span>
                <span className={styles.hantelSpur} aria-hidden>
                  <span
                    className={styles.hantelLinie}
                    style={{ left: `${betonterBalken.wert}%`, width: `${hoechsterBalken.wert - betonterBalken.wert}%` }}
                  />
                  <span className={styles.hantelPunkt} data-betont style={{ left: `${betonterBalken.wert}%` }} />
                  <span className={styles.hantelPunkt} style={{ left: `${hoechsterBalken.wert}%` }} />
                </span>
              </div>
            )}
          </section>
          )
        })}
      </div>

      <p className={styles.folgerung}>
        <span className={styles.folgerungKicker}>{fakt.folgerung.kicker[lang]}</span>
        {fakt.folgerung.text[lang]}
      </p>

      <p className={styles.quelle}>
        {fakt.quelle[lang]}{' '}
        <a
          className={styles.quelleLink}
          href={fakt.quelleUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t.quelleOeffnen}
          title={t.quelleOeffnen}
        >
          <ExternalLink size={13} strokeWidth={2} aria-hidden />
          deloitte.com
        </a>
      </p>
    </div>
  )
}
