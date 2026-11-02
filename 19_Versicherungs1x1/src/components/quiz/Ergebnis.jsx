// Ergebnis — Fortschrittsring (Stufe 120, Zahl innen) mit Prozent,
// „7 von 10“, Wertung in Erwachsenensprache,
// Hinweis auf „bestanden“ beim Kapitel-Check, Balken je Kapitel (ab zwei
// Kapiteln), Liste der falschen Fragen mit gewählter und richtiger Antwort
// und Nachlese-Link; Knöpfe „Fehler wiederholen“, „Neuer Durchgang“,
// „Zur Übersicht“. Keine Ampelfarben: der Ring ist grün wie alle Ringe,
// Farbe tragen nur richtig/falsch in der Fehlerliste.
import { useEffect, useRef } from 'react';
import { RotateCcw, Play, ArrowLeft, BookOpen, CircleCheck } from 'lucide-react';
import Knopf from '../ui/Knopf.jsx';
import Karte from '../ui/Karte.jsx';
import Pille from '../ui/Pille.jsx';
import Fortschrittsring from '../ui/Fortschrittsring.jsx';
import { routeZuHash } from '../../store/routen.js';
import { BESTANDEN_AB } from '../../store/Wissen.jsx';
import { MODUS_NAMEN, werte, zaehleErgebnis, ergebnisJeKapitel, beschreibeKapitel } from '../../lib/quiz.js';
import { anteil as anteilFormat, mehrzahl } from '../../lib/format.js';
import { nummer } from '../../lib/text.js';

export default function Ergebnis({ durchgang, antworten, kapitelListe, onFehlerWiederholen, onNeu, onUebersicht }) {
  const titelRef = useRef(null);
  useEffect(() => {
    if (window.scrollY > 0) window.scrollTo({ top: 0 });
    if (titelRef.current) titelRef.current.focus({ preventScroll: true });
  }, []);

  const { fragen, modus } = durchgang;
  const { richtig, gesamt, falsch } = zaehleErgebnis(fragen, antworten);
  const wertung = werte(richtig, gesamt);
  const jeKapitel = ergebnisJeKapitel(fragen, antworten);
  const einzelnesKapitel = modus === 'kapitel' && durchgang.kapitelIds.length === 1;
  const fehlenZumBestehen = Math.max(0, Math.ceil(gesamt * BESTANDEN_AB) - richtig);
  const kapitelText = beschreibeKapitel(modus, durchgang.kapitelIds, kapitelListe);

  return (
    <section className="quiz-ergebnis" aria-labelledby="ergebnis-titel">
      <div className="quiz-ergebnis-kopf">
        <Fortschrittsring groesse={120} zahlInnen anteil={wertung.anteil} label={`${anteilFormat(wertung.anteil)} richtig`} />
        <div className="quiz-ergebnis-titel">
          <div className="ueberschrift-meta">{MODUS_NAMEN[modus] || modus} · {kapitelText}</div>
          <h1 id="ergebnis-titel" ref={titelRef} tabIndex={-1}>{wertung.label}</h1>
          <p className="quiz-ergebnis-satz">
            <strong className="tabular">{richtig} von {gesamt}</strong> Fragen richtig
            {einzelnesKapitel && wertung.bestanden && (
              <>
                {' '}
                <Pille ton="erfolg" punkt>Kapitel bestanden</Pille>
              </>
            )}
          </p>
          {einzelnesKapitel && !wertung.bestanden && (
            <p className="nebentext" style={{ marginTop: 4 }}>
              Ab {anteilFormat(BESTANDEN_AB)} gilt das Kapitel als bestanden – dafür {fehlenZumBestehen === 1 ? 'fehlt noch eine richtige Antwort' : `fehlen noch ${mehrzahl(fehlenZumBestehen, 'richtige Antwort', 'richtige Antworten')}`}.
            </p>
          )}
        </div>
      </div>

      <div className="quiz-ergebnis-aktionen">
        {falsch.length > 0 && (
          <Knopf variante="primaer" symbol={RotateCcw} onClick={onFehlerWiederholen}>
            Fehler wiederholen ({falsch.length})
          </Knopf>
        )}
        <Knopf variante={falsch.length > 0 ? 'sekundaer' : 'primaer'} symbol={Play} onClick={onNeu}>Neuer Durchgang</Knopf>
        <Knopf variante="still" symbol={ArrowLeft} onClick={onUebersicht}>Zur Übersicht</Knopf>
      </div>

      <div className="quiz-ergebnis-abschnitte">
        {jeKapitel.length > 1 && (
          <Karte als="section" aria-labelledby="ergebnis-kapitel-titel">
            <div className="karte-kopf"><h2 id="ergebnis-kapitel-titel">Nach Kapitel</h2></div>
            <ul className="quiz-kapitel-balken">
              {jeKapitel.map((e) => (
                <li key={e.kapitelId}>
                  <a href={routeZuHash({ name: 'wissenscheck', kapitelId: e.kapitelId })} title={`Kapitel-Check ${e.kapitelTitel}`}>
                    <span className="quiz-kapitel-balken-nummer">{nummer(e.kapitelIndex)}</span> {e.kapitelTitel}
                  </a>
                  <span className="quiz-kapitel-balken-wert">{e.richtig} von {e.gesamt}</span>
                  <span className="quiz-kapitel-balken-spur" aria-hidden="true">
                    <span className="quiz-kapitel-balken-fuellung" style={{ width: `${e.anteil * 100}%` }} />
                  </span>
                </li>
              ))}
            </ul>
          </Karte>
        )}

        <Karte als="section" aria-labelledby="ergebnis-fehler-titel" className="quiz-fehler">
          <div className="karte-kopf">
            <h2 id="ergebnis-fehler-titel">{falsch.length > 0 ? `Falsch beantwortet (${falsch.length})` : 'Falsch beantwortet'}</h2>
          </div>
          {falsch.length === 0 ? (
            <p className="nebentext quiz-fehler-leer"><CircleCheck size={16} aria-hidden="true" /> Alle {mehrzahl(gesamt, 'Frage', 'Fragen')} richtig – nichts nachzulesen.</p>
          ) : (
            <ol className="quiz-fehler-liste">
              {falsch.map(({ frage, antwort }) => {
                const gewaehlt = antwort ? frage.optionen[antwort.gewaehlt] : null;
                const loesung = frage.optionen[frage.richtig];
                const href = routeZuHash({ name: 'kapitel', kapitelId: frage.kapitelId, einheitId: frage.einheitId || null });
                return (
                  <li key={frage.frageId}>
                    <div className="quiz-fehler-kopf">
                      <Pille>{nummer(frage.kapitelIndex)} · {frage.kapitelTitel}</Pille>
                    </div>
                    <div className="quiz-fehler-frage">{frage.text}</div>
                    <div className="quiz-fehler-antworten">
                      {gewaehlt
                        ? <span data-ton="fehler"><span className="quiz-fehler-label">Deine Antwort</span> {gewaehlt.buchstabe} · {gewaehlt.text}</span>
                        : <span data-ton="fehler"><span className="quiz-fehler-label">Nicht beantwortet</span></span>}
                      <span data-ton="erfolg"><span className="quiz-fehler-label">Richtig</span> {loesung.buchstabe} · {loesung.text}</span>
                    </div>
                    {frage.erklaerung && <p className="quiz-fehler-erklaerung">{frage.erklaerung}</p>}
                    <div className="quiz-fehler-fuss">
                      <Knopf variante="still" groesse="klein" symbol={BookOpen} href={href}>
                        Im Kapitel nachlesen
                        <span className="quiz-fehler-ziel">{frage.einheitTitel || frage.kapitelTitel}</span>
                      </Knopf>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </Karte>
      </div>
    </section>
  );
}
