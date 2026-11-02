// Kapitelabschluss — stille Zeile auf der letzten Lerneinheit, sobald alle
// Einheiten des Kapitels gelesen sind: „Kapitel 03 gelesen – 8 von 8“ mit
// Knopf zum Wissenscheck (bzw. zum Wiederholen, wenn bestanden) und dem
// Sprung ins nächste Kapitel. Keine Fanfare, keine Animation.
import { CircleCheck, ListChecks, ArrowRight } from 'lucide-react';
import { useWissen } from '../../store/Wissen.jsx';
import Knopf from '../ui/Knopf.jsx';
import { nummer } from '../../lib/text.js';
import { datum, prozent, mehrzahl, minuten } from '../../lib/format.js';
import { wissenscheckUmfang } from './inhalt.js';

export default function Kapitelabschluss({ kapitel, kapitelIndex, einheit }) {
  const { fortschrittKapitel, fortschritt, naechsteEinheit, routeZuHash } = useWissen();
  const einheiten = kapitel.subChapters || [];
  const letzte = einheiten.length > 0 && einheiten[einheiten.length - 1].id === einheit.id;
  const f = fortschrittKapitel(kapitel.id);
  if (!letzte || f.gesamt === 0 || f.gelesen < f.gesamt) return null;
  const bestanden = fortschritt.bestanden[kapitel.id] || null;
  const naechste = naechsteEinheit(kapitel.id, einheit.id);
  const { fragen, minuten: dauer } = wissenscheckUmfang(kapitel);
  return (
    <section className="kapitel-abschluss" aria-label={`Kapitel ${nummer(kapitelIndex)} vollständig gelesen`}>
      <div className="kapitel-abschluss-text">
        <CircleCheck size={20} aria-hidden="true" />
        <div>
          <strong>Kapitel {nummer(kapitelIndex)} gelesen – {f.gelesen} von {f.gesamt}</strong>
          <span className="kapitel-abschluss-unter">
            {bestanden
              ? `Wissenscheck bestanden am ${datum(bestanden.zeit)} mit ${prozent(bestanden.prozent, 0)}`
              : fragen > 0 ? `Jetzt prüfen: ${mehrzahl(fragen, 'Frage', 'Fragen')} · ca. ${minuten(dauer)}` : 'Alle Lerneinheiten dieses Kapitels sind gelesen.'}
          </span>
        </div>
      </div>
      <div className="kapitel-abschluss-aktionen">
        {fragen > 0 && (
          <Knopf variante={bestanden ? 'sekundaer' : 'primaer'} symbol={ListChecks} href={routeZuHash({ name: 'wissenscheck', kapitelId: kapitel.id })}>
            {bestanden ? 'Wissenscheck wiederholen' : 'Wissenscheck starten'}
          </Knopf>
        )}
        {naechste && (
          <Knopf variante="still" symbolRechts={ArrowRight} href={routeZuHash({ name: 'kapitel', kapitelId: naechste.kapitel.id, einheitId: naechste.einheit.id })}>
            Weiter mit Kapitel {nummer(naechste.kapitelIndex)}
          </Knopf>
        )}
      </div>
    </section>
  );
}
