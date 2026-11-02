// TiefenGruppen — die Blöcke der Einheit je Tiefe: Basis, dann unter einer
// Tiefenmarke „Vertiefung“, dann „Experte“ (Punkt + Wort + Lesezeit).
// Jede Gruppe geht an ContentBlocks nach dem Vertrag
//   <ContentBlocks bloecke={[{ block, tiefe, id }]} kapitel einheit />
// ContentBlocks lädt per React.lazy, damit Recharts nicht im Hauptbündel liegt.
import { lazy, Suspense } from 'react';
import { minuten } from '../../lib/format.js';

const ContentBlocks = lazy(() => import('../content/ContentBlocks.jsx'));

function Skelett() {
  return (
    <div className="kapitel-skelett" aria-busy="true" aria-label="Inhalt wird geladen">
      <div className="skelett" style={{ height: 18, width: '40%' }} />
      <div className="skelett" style={{ height: 14, width: '95%' }} />
      <div className="skelett" style={{ height: 14, width: '88%' }} />
      <div className="skelett" style={{ height: 14, width: '92%' }} />
      <div className="skelett" style={{ height: 160, width: '100%', marginTop: 8 }} />
    </div>
  );
}

export default function TiefenGruppen({ gruppen, kapitel, einheit }) {
  return (
    <Suspense fallback={<Skelett />}>
      {gruppen.map((g, i) => (
        <section key={g.wert} className="tiefen-abschnitt" data-tiefe={g.wert} aria-labelledby={`tiefe-${g.wert}`}>
          <div className="tiefen-trenner" id={`tiefe-${g.wert}`} data-erste={i === 0 ? 'true' : 'false'}>
            <span className="tiefen-punkt" style={{ '--tiefe-farbe': g.farbe }} aria-hidden="true" />
            <span className="tiefen-trenner-wort">{g.label}</span>
            <span className="meta">{minuten(g.minuten)}</span>
          </div>
          <div className="tiefen-gruppe">
            <ContentBlocks bloecke={g.bloecke} kapitel={kapitel} einheit={einheit} />
          </div>
        </section>
      ))}
    </Suspense>
  );
}
