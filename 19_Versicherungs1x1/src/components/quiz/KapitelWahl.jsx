// KapitelWahl — Chips je Kapitel mit Nummer, Titel, Fragenzahl und dem
// letzten Ergebnis eines Kapitel-Checks; Haken, wenn das Kapitel bestanden
// ist. Mehrfachauswahl, dazu „Alle“ und „Keine“.
import { Check } from 'lucide-react';
import Chip from '../ui/Chip.jsx';
import Knopf from '../ui/Knopf.jsx';
import { anteil as anteilFormat, datum, mehrzahl } from '../../lib/format.js';
import { nummer } from '../../lib/text.js';

export default function KapitelWahl({ kapitelListe = [], gewaehlt = [], fragenJeKapitel, letzteErgebnisse, bestanden = {}, onUmschalten, onAlle, onKeine }) {
  const waehlbar = kapitelListe.filter((k) => (fragenJeKapitel?.get(k.id) || 0) > 0);
  const alleGewaehlt = waehlbar.length > 0 && waehlbar.every((k) => gewaehlt.includes(k.id));

  return (
    <div className="kapitel-wahl" role="group" aria-labelledby="kapitel-wahl-titel">
      <div className="kapitel-wahl-kopf">
        <h2 id="kapitel-wahl-titel">Kapitel wählen</h2>
        <span className="kapitel-wahl-knoepfe">
          <Knopf variante="still" groesse="klein" onClick={onAlle} disabled={alleGewaehlt}>Alle</Knopf>
          <Knopf variante="still" groesse="klein" onClick={onKeine} disabled={gewaehlt.length === 0}>Keine</Knopf>
        </span>
      </div>
      <div className="kapitel-wahl-liste">
        {kapitelListe.map((k, i) => {
          const anzahl = fragenJeKapitel?.get(k.id) || 0;
          const letztes = letzteErgebnisse?.get(k.id) || null;
          const istBestanden = Boolean(bestanden[k.id]);
          const aktiv = gewaehlt.includes(k.id);
          const zahl = letztes ? `${anzahl} · ${anteilFormat(letztes.anteil)}` : String(anzahl);
          const beschreibung = [
            `Kapitel ${nummer(i)} ${k.title}`,
            mehrzahl(anzahl, 'Frage', 'Fragen'),
            letztes ? `zuletzt ${letztes.richtig} von ${letztes.gesamt} am ${datum(letztes.zeit)}` : 'noch kein Kapitel-Check',
            istBestanden ? 'bestanden' : null,
          ].filter(Boolean).join(' · ');
          return (
            <Chip
              key={k.id}
              aktiv={aktiv}
              symbol={istBestanden ? Check : undefined}
              zahl={zahl}
              disabled={anzahl === 0}
              onClick={() => onUmschalten && onUmschalten(k.id)}
              aria-label={beschreibung}
              title={beschreibung}
              className={istBestanden ? 'kapitel-wahl-bestanden' : ''}
            >
              <span className="kapitel-wahl-nummer">{nummer(i)}</span> {k.title}
            </Chip>
          );
        })}
      </div>
    </div>
  );
}
