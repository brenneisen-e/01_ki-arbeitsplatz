// GelesenKnopf — „Als gelesen markieren“ mit Rücknahme und Datum. Die große
// Fassung steht im Fuß der Einheit, die kleine in der rechten Leiste.
import { Check, CircleCheck } from 'lucide-react';
import { useWissen } from '../../store/Wissen.jsx';
import Knopf from '../ui/Knopf.jsx';
import { datum } from '../../lib/format.js';

export default function GelesenKnopf({ kapitel, einheit, klein = false, onZuruecknehmen }) {
  const { istGelesen, markiereGelesen, fortschritt, einheitSchluessel } = useWissen();
  const gelesen = istGelesen(kapitel.id, einheit.id);
  const zeit = fortschritt.gelesen[einheitSchluessel(kapitel.id, einheit.id)];

  if (gelesen) {
    return (
      <div className={`gelesen-stand ${klein ? 'gelesen-stand-klein' : ''}`.trim()} role="status">
        <CircleCheck size={klein ? 16 : 18} aria-hidden="true" />
        <span>Gelesen am {datum(zeit)}</span>
        <Knopf
          variante="still"
          groesse="klein"
          onClick={() => { onZuruecknehmen && onZuruecknehmen(); markiereGelesen(kapitel.id, einheit.id, false); }}
          aria-label={`Gelesen-Markierung für ${einheit.title} zurücknehmen`}
        >
          Zurücknehmen
        </Knopf>
      </div>
    );
  }
  return (
    <Knopf
      variante="primaer"
      groesse={klein ? 'klein' : 'gross'}
      symbol={Check}
      breit={klein}
      onClick={() => markiereGelesen(kapitel.id, einheit.id, true)}
    >
      Als gelesen markieren
    </Knopf>
  );
}
