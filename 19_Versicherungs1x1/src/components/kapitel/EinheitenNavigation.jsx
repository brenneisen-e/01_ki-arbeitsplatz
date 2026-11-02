// EinheitenNavigation — Vor/Zurück auf Einheitenebene über Kapitelgrenzen
// hinweg, immer mit Kapitelname; dazu „Wissenscheck zu diesem Kapitel“ mit
// Fragenzahl und Dauer.
import { ChevronLeft, ChevronRight, ListChecks } from 'lucide-react';
import { useWissen } from '../../store/Wissen.jsx';
import Knopf from '../ui/Knopf.jsx';
import { nummer } from '../../lib/text.js';
import { mehrzahl, minuten } from '../../lib/format.js';
import { wissenscheckUmfang } from './inhalt.js';

function NavKarte({ richtung, ziel, aktuellesKapitelId }) {
  const { routeZuHash } = useWissen();
  if (!ziel) return <span className="einheiten-nav-leer" aria-hidden="true" />;
  const wechsel = ziel.kapitel.id !== aktuellesKapitelId;
  const weiter = richtung === 'weiter';
  return (
    <a
      className="einheiten-nav-karte"
      data-richtung={richtung}
      href={routeZuHash({ name: 'kapitel', kapitelId: ziel.kapitel.id, einheitId: ziel.einheit.id })}
      rel={weiter ? 'next' : 'prev'}
      aria-label={`${weiter ? 'Weiter' : 'Zurück'}: ${ziel.einheit.title}, Kapitel ${nummer(ziel.kapitelIndex)} ${ziel.kapitel.title}`}
    >
      <span className="einheiten-nav-richtung">
        {!weiter && <ChevronLeft size={14} aria-hidden="true" />}
        {weiter ? 'Weiter' : 'Zurück'}
        {weiter && <ChevronRight size={14} aria-hidden="true" />}
      </span>
      <span className="einheiten-nav-titel">{ziel.einheit.title}</span>
      <span className="einheiten-nav-kapitel" data-wechsel={wechsel ? 'true' : 'false'}>
        {wechsel ? (weiter ? 'Nächstes Kapitel' : 'Voriges Kapitel') : 'Kapitel'} {nummer(ziel.kapitelIndex)} · {ziel.kapitel.title}
      </span>
    </a>
  );
}

export default function EinheitenNavigation({ kapitel, einheit }) {
  const { naechsteEinheit, vorherigeEinheit, routeZuHash } = useWissen();
  const zurueck = vorherigeEinheit(kapitel.id, einheit.id);
  const weiter = naechsteEinheit(kapitel.id, einheit.id);
  const { fragen, minuten: dauer } = wissenscheckUmfang(kapitel);
  return (
    <nav className="einheiten-nav-huelle" aria-label="Vorige und nächste Lerneinheit">
      <div className="einheiten-nav">
        <NavKarte richtung="zurueck" ziel={zurueck} aktuellesKapitelId={kapitel.id} />
        <NavKarte richtung="weiter" ziel={weiter} aktuellesKapitelId={kapitel.id} />
      </div>
      {fragen > 0 && (
        <div className="einheit-fuss-aktionen">
          <Knopf variante="weich" symbol={ListChecks} href={routeZuHash({ name: 'wissenscheck', kapitelId: kapitel.id })}>
            Wissenscheck zu diesem Kapitel
          </Knopf>
          <span className="meta">{mehrzahl(fragen, 'Frage', 'Fragen')} · ca. {minuten(dauer)}</span>
        </div>
      )}
    </nav>
  );
}
