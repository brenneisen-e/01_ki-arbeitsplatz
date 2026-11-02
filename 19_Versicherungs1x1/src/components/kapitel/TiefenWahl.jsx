// TiefenWahl — Segment „Basis · Vertiefung · Experte“ auf dem persistenten
// Store-Wert. Tiefen ohne Inhalt in dieser Einheit sind deaktiviert (mit
// Hinweis als title und als sichtbare Zeile). Angezeigt wird die wirksame
// Tiefe: ist „Experte“ gewählt, die Einheit hat aber keinen Expertenteil,
// steht der Schalter auf dem, was tatsächlich zu sehen ist.
import { useWissen } from '../../store/Wissen.jsx';
import { TIEFEN, hatTiefe } from '../../lib/bloecke.js';
import Segment from '../ui/Segment.jsx';
import { wirksameTiefe } from './inhalt.js';

export default function TiefenWahl({ einheit, klein = false, hinweis = true }) {
  const { tiefe, setzeTiefe } = useWissen();
  const fehlend = TIEFEN.filter((t) => t.stufe > 1 && !hatTiefe(einheit, t.wert));
  const optionen = TIEFEN.map((t) => {
    const ohne = t.stufe > 1 && !hatTiefe(einheit, t.wert);
    return {
      wert: t.wert,
      label: t.label,
      punktFarbe: t.farbe,
      deaktiviert: ohne,
      hinweis: ohne ? `In dieser Lerneinheit ohne ${t.label}` : undefined,
    };
  });
  return (
    <div className="tiefenwahl">
      <Segment optionen={optionen} wert={wirksameTiefe(einheit, tiefe)} onWechsel={setzeTiefe} label="Tiefe wählen" klein={klein} />
      {hinweis && fehlend.length > 0 && (
        <span className="tiefenwahl-hinweis">In dieser Lerneinheit ohne {fehlend.map((t) => t.label).join(' und ')}</span>
      )}
    </div>
  );
}
