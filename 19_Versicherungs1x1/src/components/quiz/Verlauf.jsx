// Verlauf — „Letzte Durchgänge“ aus fortschritt.quiz.verlauf (Datum, Modus,
// Kapitel, Ergebnis) und der Hinweis auf bestandene Kapitel mit Chips, die
// den Kapitel-Check erneut vorwählen.
import { Check } from 'lucide-react';
import Karte from '../ui/Karte.jsx';
import Chip from '../ui/Chip.jsx';
import { routeZuHash } from '../../store/routen.js';
import { MODUS_NAMEN, beschreibeKapitel } from '../../lib/quiz.js';
import { anteil as anteilFormat, datum, mehrzahl } from '../../lib/format.js';
import { nummer } from '../../lib/text.js';

const ANZAHL = 8;

export default function Verlauf({ verlauf = [], kapitelListe = [], bestanden = {} }) {
  const eintraege = verlauf.slice(0, ANZAHL);
  const bestandene = kapitelListe.map((k, i) => ({ kapitel: k, index: i })).filter(({ kapitel }) => bestanden[kapitel.id]);

  return (
    <div className="quiz-seitenleiste">
      <Karte als="section" aria-labelledby="verlauf-titel">
        <div className="karte-kopf"><h2 id="verlauf-titel">Letzte Durchgänge</h2></div>
        {eintraege.length === 0 ? (
          <p className="nebentext">Noch kein Durchgang. Ergebnisse bleiben auf diesem Gerät gespeichert.</p>
        ) : (
          <ol className="quiz-verlauf">
            {eintraege.map((v, i) => {
              const a = v.gesamt ? v.richtig / v.gesamt : 0;
              return (
                <li key={`${v.zeit}-${i}`}>
                  <span className="quiz-verlauf-datum">{datum(v.zeit)}</span>
                  <span className="quiz-verlauf-modus">{MODUS_NAMEN[v.modus] || v.modus}</span>
                  <span className="quiz-verlauf-wert">{v.richtig} von {v.gesamt}<small>{anteilFormat(a)}</small></span>
                  <span className="quiz-verlauf-kapitel">{beschreibeKapitel(v.modus, v.kapitelIds, kapitelListe)}</span>
                </li>
              );
            })}
          </ol>
        )}
      </Karte>

      <Karte als="section" aria-labelledby="bestanden-titel">
        <div className="karte-kopf">
          <h2 id="bestanden-titel">Bestandene Kapitel</h2>
          <span className="meta tabular">{bestandene.length} von {mehrzahl(kapitelListe.length, 'Kapitel', 'Kapiteln')}</span>
        </div>
        {bestandene.length === 0 ? (
          <p className="nebentext">Noch keines – ein Kapitel-Check mit 80 % oder mehr zählt als bestanden.</p>
        ) : (
          <div className="quiz-bestanden-liste">
            {bestandene.map(({ kapitel, index }) => (
              <Chip
                key={kapitel.id}
                symbol={Check}
                href={routeZuHash({ name: 'wissenscheck', kapitelId: kapitel.id })}
                title={`Bestanden am ${datum(bestanden[kapitel.id].zeit)} mit ${anteilFormat((bestanden[kapitel.id].prozent || 0) / 100)} – Kapitel-Check erneut starten`}
                className="kapitel-wahl-bestanden"
              >
                {nummer(index)} {kapitel.title}
              </Chip>
            ))}
          </div>
        )}
      </Karte>
    </div>
  );
}
