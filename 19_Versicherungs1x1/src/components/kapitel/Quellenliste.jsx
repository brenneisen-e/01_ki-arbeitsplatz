// Quellenliste — nummerierte, eindeutige Quellen der Lerneinheit am Ende.
// Einzige Grundlage ist `quellenDerEinheit` aus utils/citeMap.js: Reihenfolge
// des Auftretens, gleicher Text = gleiche Nummer, dieselben Nummern wie die
// Marken im Text (die Blöcke lesen sie über quellenNummern aus demselben
// Cache).
import { useMemo } from 'react';
import { BookMarked, ExternalLink } from 'lucide-react';
import { quellenDerEinheit } from '../../utils/citeMap.js';
import { mehrzahl } from '../../lib/format.js';

export default function Quellenliste({ einheit }) {
  const quellen = useMemo(
    () => quellenDerEinheit(einheit).filter((q) => q && q.text),
    [einheit],
  );
  if (quellen.length === 0) return null;
  return (
    <section className="quellen" aria-labelledby="quellen-titel">
      <h3 id="quellen-titel"><BookMarked size={15} aria-hidden="true" />{mehrzahl(quellen.length, 'Quelle', 'Quellen')} in dieser Lerneinheit</h3>
      <ol>
        {quellen.map((q, i) => {
          const nr = q.nummer ?? i + 1;
          return (
            <li key={`${nr}-${q.text}`} className="quelle" id={`quelle-${nr}`}>
              <span className="quelle-nummer" aria-hidden="true">{nr}</span>
              <span className="quelle-text">
                {q.url ? (
                  <a href={q.url} target="_blank" rel="noopener noreferrer">
                    {q.text}
                    <ExternalLink size={12} aria-label="(öffnet in neuem Tab)" />
                  </a>
                ) : (
                  <>
                    <span>{q.text}</span>
                    <span className="quelle-ohne">ohne Link</span>
                  </>
                )}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
