import { ChevronRight, AlertTriangle, CircleCheck, Info } from 'lucide-react'
import { DEMO_HINWEIS } from '../../data/einheiten'
import { lageUrteil, lageSatz } from '../../ui/Waage'

const TITEL = {
  start: 'Lagebild',
  simulation: 'Simulationskasten',
  umstellung: 'Umstellungstool',
  fassungen: 'Fassungen',
  grundlagen: 'Grundlagen',
}


/**
 * Pfadzeile: links der Ort (Seite › Einheit), rechts genau ein Abzeichen
 * der Gesamtlage und der Demodaten-Hinweis. Alle weiteren Zahlen stehen
 * im Steuerblock oder in den Grundlagen — hier nichts doppelt.
 */
export default function Kontextleiste({ route, portfolio, navigiere, einheit }) {
  const lage = {
    eingeschwungen: portfolio.delta.prozent,
    barwert: portfolio.barwert.prozent,
    startjahr: portfolio.kumuliert?.prozent ?? 0,
  }
  // Zweiseitiger Korridor (Waage.jsx): über Budget rot, leicht darüber oder
  // deutlich unter heute orange, dazwischen grün.
  const u = lageUrteil(lage)
  const t = u.ton

  // Das Abzeichen trägt nur das Urteil: die Zahl dahinter steht bereits im
  // Leitband (Start) oder in der 2028-Plakette des Steuerblocks — hier
  // stünde sie ein zweites Mal im Viewport. Der Satz mit den drei Sichten
  // bleibt als title erreichbar.

  return (
    <div className="vg-kontextleiste vg-nicht-drucken">
      <nav className="vg-reihe" style={{ gap: 5, flex: '0 1 auto', minWidth: 0 }} aria-label="Pfad">
        <button type="button" className="vg-btn vg-btn-still vg-btn-sm" style={{ flex: 'none' }} onClick={() => navigiere('start')}>
          {TITEL[route.seite] || 'Lagebild'}
        </button>
        {einheit && (
          <>
            <ChevronRight size={13} strokeWidth={2} style={{ opacity: .4, flex: 'none' }} />
            <span className="vg-t-md vg-stark vg-kappen" style={{ minWidth: 0 }} title={einheit.name}>{einheit.name}</span>
          </>
        )}
      </nav>

      <div className="vg-fuellen" />

      <span className="vg-badge" data-ton={t} title={lageSatz(lage)}>
        {t === 'positiv' ? <CircleCheck size={11} strokeWidth={2.2} /> : <AlertTriangle size={11} strokeWidth={2.2} />}
        {u.wort}
      </span>

      <span className="vg-reihe vg-t-sm vg-schwach" style={{ gap: 4 }} title={DEMO_HINWEIS}>
        <Info size={12} strokeWidth={2} />
        Demodaten
      </span>
    </div>
  )
}
