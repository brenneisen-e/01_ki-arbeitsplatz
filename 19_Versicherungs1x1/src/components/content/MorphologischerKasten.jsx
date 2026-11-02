// ===========================================================================
// MorphologischerKasten.jsx — Blocktyp `morphologischerKasten` (Deck-Folien
// 75–83): Projektverortung entlang von Dimensionen (Unternehmensbereich,
// Produktbereich, Kundensegment, Vertriebskanal). Jede Spalte ist eine
// Dimension, jedes Feld eine Option.
//
// Bedienung: Klick wählt, Pfeiltasten wandern innerhalb der Spalte, Leer-
// taste oder Eingabetaste wählt, Home/Ende springen. Mehrfachauswahl gilt in
// einer Dimension, wenn das Schema sie zulässt (ein Beispiel liefert dort
// eine Liste, oder die Dimension trägt `mehrfach: true`).
//
// Oben die Beispiel-Knöpfe: ein Klick setzt die Auswahl aller Dimensionen
// und zeigt die Projektkarte. Eine eigene Auswahl zeigt stattdessen die
// Zeile „Deine Einordnung: …“ mit „Zurücksetzen“ und, falls ein Beispiel
// genau passt, den Hinweis darauf. Der Zustand lebt in der Komponente.
// ===========================================================================
import { useId, useMemo, useRef, useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import Knopf from '../ui/Knopf.jsx';
import Pille from '../ui/Pille.jsx';
import InlineHtml from './Inline.jsx';
import { GrafikRahmen, alsListe, ersterText } from './grafikteile.jsx';

/** Optionen mit gleichem `gruppe`-Wert zu Blöcken zusammenfassen (z. B. SHUK über SHU und K). */
function gruppiere(optionen) {
  const bloecke = [];
  for (const o of optionen) {
    const g = ersterText(o.gruppe);
    const letzter = bloecke[bloecke.length - 1];
    if (g && letzter && letzter.gruppe === g) letzter.optionen.push(o);
    else bloecke.push({ gruppe: g, optionen: [o] });
  }
  return bloecke;
}

function gleicheMenge(a, b) {
  if (a.length !== b.length) return false;
  const m = new Set(a);
  return b.every((x) => m.has(x));
}

/**
 * Ein Leitwort am Anfang eines Punktes wird fett („Ausgangslage: …“) — im Deck
 * tragen die Projektpunkte diese Vorsilben (Folie 79).
 */
function mitLeitwort(text) {
  const t = String(text);
  const m = t.match(/^([A-ZÄÖÜ][^:<>]{2,26}):\s+([\s\S]+)$/);
  return m ? `<strong>${m[1]}:</strong> ${m[2]}` : t;
}

/**
 * Ein Teil der Projektkarte (Ausgangslage, Vorgehen, Ergebnis). Der Wert darf
 * ein Absatz oder eine Liste von Punkten sein — im Deck stehen dort
 * Aufzählungen („Hintergrund & Herausforderung“, Folie 79).
 */
function ProjektTeil({ titel, wert, className = '', symbol: Symbol = null }) {
  const punkte = Array.isArray(wert) ? alsListe(wert) : [];
  const text = Array.isArray(wert) ? '' : ersterText(wert);
  if (punkte.length === 0 && !text) return null;
  return (
    <div className={`bl-morph-projekt-teil ${className}`.trim()}>
      <h5>{titel}</h5>
      {text && <p><InlineHtml html={text} begriffe={false} /></p>}
      {punkte.length > 0 && (
        <ul>
          {punkte.map((p, i) => (
            <li key={i}>
              {Symbol && <Symbol size={15} aria-hidden="true" />}
              <span><InlineHtml html={mitLeitwort(p)} begriffe={false} /></span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function MorphologischerKasten({ block }) {
  const id = useId();
  const knoepfe = useRef({});
  const [auswahl, setAuswahl] = useState({});
  const [beispielId, setBeispielId] = useState(null);
  const [fokus, setFokus] = useState({});

  const modell = useMemo(() => {
    const dimensionen = (Array.isArray(block.dimensionen) ? block.dimensionen : [])
      .filter((d) => d && typeof d === 'object')
      .map((d, i) => {
        const optionen = (Array.isArray(d.optionen) ? d.optionen : [])
          .filter((o) => o && typeof o === 'object')
          .map((o, j) => ({ ...o, id: ersterText(o.id) || `o${j}`, label: ersterText(o.label, o.titel, o.id) }));
        return { ...d, id: ersterText(d.id) || `d${i}`, titel: ersterText(d.titel, d.title), optionen };
      })
      .filter((d) => d.optionen.length > 0);
    const beispiele = (Array.isArray(block.beispiele) ? block.beispiele : [])
      .filter((b) => b && typeof b === 'object')
      .map((b, i) => {
        const auswahlListen = {};
        for (const d of dimensionen) {
          const roh = b.auswahl && typeof b.auswahl === 'object' ? b.auswahl[d.id] : undefined;
          const ids = alsListe(roh).map(String).filter((x) => d.optionen.some((o) => o.id === x));
          if (ids.length) auswahlListen[d.id] = ids;
        }
        return { ...b, id: ersterText(b.id) || `b${i}`, titel: ersterText(b.titel, b.title), auswahlListen };
      });
    // Mehrfachauswahl: das Schema lässt sie zu, wo ein Beispiel eine Liste liefert.
    const mehrfach = {};
    for (const d of dimensionen) {
      mehrfach[d.id] = d.mehrfach === true
        || beispiele.some((b) => Array.isArray(b.auswahl?.[d.id]) && b.auswahl[d.id].length > 1);
    }
    return { dimensionen, beispiele, mehrfach };
  }, [block]);

  const { dimensionen, beispiele, mehrfach } = modell;
  if (dimensionen.length === 0) return null;

  const gewaehlt = (dimId, optId) => (auswahl[dimId] || []).includes(optId);
  const anzahlGewaehlt = dimensionen.reduce((s, d) => s + (auswahl[d.id] || []).length, 0);

  const passendes = beispiele.find((b) => dimensionen.every((d) => gleicheMenge(b.auswahlListen[d.id] || [], auswahl[d.id] || [])))
    || null;
  const offenesBeispiel = beispielId ? beispiele.find((b) => b.id === beispielId) || null : null;

  const schalte = (dimId, optId) => {
    setAuswahl((vorher) => {
      const jetzt = vorher[dimId] || [];
      let neu;
      if (jetzt.includes(optId)) neu = jetzt.filter((x) => x !== optId);
      else if (mehrfach[dimId]) neu = [...jetzt, optId];
      else neu = [optId];
      const kopie = { ...vorher };
      if (neu.length) kopie[dimId] = neu; else delete kopie[dimId];
      return kopie;
    });
    setBeispielId(null);
  };

  const ladeBeispiel = (b) => {
    const neu = {};
    for (const d of dimensionen) if (b.auswahlListen[d.id]?.length) neu[d.id] = [...b.auswahlListen[d.id]];
    setAuswahl(neu);
    setBeispielId(b.id);
  };

  const zuruecksetzen = () => {
    setAuswahl({});
    setBeispielId(null);
  };

  const aufTaste = (e, dimId, index, anzahl) => {
    let ziel = null;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') ziel = (index + 1) % anzahl;
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') ziel = (index - 1 + anzahl) % anzahl;
    else if (e.key === 'Home') ziel = 0;
    else if (e.key === 'End') ziel = anzahl - 1;
    if (ziel === null) return;
    e.preventDefault();
    setFokus((v) => ({ ...v, [dimId]: ziel }));
    knoepfe.current[dimId]?.[ziel]?.focus();
  };

  /** Tab-Stopp einer Spalte: das zuletzt berührte Feld, sonst das erste gewählte, sonst das erste. */
  const tabIndexVon = (d, index) => {
    const merk = fokus[d.id];
    if (typeof merk === 'number') return merk === index ? 0 : -1;
    const ersteGewaehlt = d.optionen.findIndex((o) => gewaehlt(d.id, o.id));
    const stopp = ersteGewaehlt >= 0 ? ersteGewaehlt : 0;
    return stopp === index ? 0 : -1;
  };

  const einordnung = dimensionen
    .flatMap((d) => (auswahl[d.id] || []).map((optId) => d.optionen.find((o) => o.id === optId)?.label).filter(Boolean))
    .join(' · ');

  return (
    <GrafikRahmen block={block} titelFallback="Morphologischer Kasten" className="bl-morph-block">
      <div className="bl-morph-huelle">
        {beispiele.length > 0 && (
          <div className="bl-morph-beispiele">
            <span className="bl-morph-beispiele-name" id={`${id}-bsp`}>Beispiel laden</span>
            <div className="bl-morph-beispiele-knoepfe" role="group" aria-labelledby={`${id}-bsp`}>
              {beispiele.map((b) => (
                <Knopf
                  key={b.id}
                  groesse="klein"
                  variante={beispielId === b.id ? 'primaer' : 'sekundaer'}
                  aria-pressed={beispielId === b.id}
                  onClick={() => ladeBeispiel(b)}
                >
                  {b.titel}
                </Knopf>
              ))}
            </div>
          </div>
        )}

        <div className="bl-morph">
          {dimensionen.map((d, di) => {
            let laufend = -1;
            return (
              <div key={d.id} className="bl-morph-spalte">
                <h4 className="bl-morph-spalte-titel" id={`${id}-dim-${di}`}>{d.titel}</h4>
                <p className="bl-morph-spalte-hinweis">{mehrfach[d.id] ? 'Mehrfachauswahl möglich' : 'Eine Auswahl'}</p>
                <div className="bl-morph-optionen" role="group" aria-labelledby={`${id}-dim-${di}`}>
                  {gruppiere(d.optionen).map((gruppe, gi) => {
                    const felder = gruppe.optionen.map((o) => {
                      laufend += 1;
                      const index = laufend;
                      const ist = gewaehlt(d.id, o.id);
                      return (
                        <button
                          key={o.id}
                          ref={(el) => {
                            if (!knoepfe.current[d.id]) knoepfe.current[d.id] = [];
                            knoepfe.current[d.id][index] = el;
                          }}
                          type="button"
                          className="bl-morph-option"
                          aria-pressed={ist}
                          tabIndex={tabIndexVon(d, index)}
                          onClick={() => schalte(d.id, o.id)}
                          onFocus={() => setFokus((v) => ({ ...v, [d.id]: index }))}
                          onKeyDown={(e) => aufTaste(e, d.id, index, d.optionen.length)}
                        >
                          {ist && <Check size={14} aria-hidden="true" />}
                          <span>{o.label}</span>
                        </button>
                      );
                    });
                    if (!gruppe.gruppe) return <div key={gi} className="bl-morph-felder">{felder}</div>;
                    return (
                      <div key={gi} className="bl-morph-gruppe">
                        <span className="bl-morph-gruppe-name">{gruppe.gruppe}</span>
                        <div className="bl-morph-felder">{felder}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {offenesBeispiel ? (
          <div className="bl-morph-projekt">
            <div className="bl-morph-projekt-kopf">
              <Pille ton="marke">Beispielprojekt</Pille>
              <h4 className="bl-morph-projekt-titel">{offenesBeispiel.titel}</h4>
            </div>
            {einordnung && <p className="bl-morph-projekt-einordnung">Einordnung: {einordnung}</p>}
            <ProjektTeil titel="Ausgangslage" wert={offenesBeispiel.ausgangslage} />
            <ProjektTeil titel="Vorgehen" wert={offenesBeispiel.vorgehen} />
            <ProjektTeil
              titel={(offenesBeispiel.ausgangslage || offenesBeispiel.vorgehen) ? 'Einordnung im Projekt' : 'Worum es geht'}
              wert={offenesBeispiel.text}
            />
            {offenesBeispiel.ergebnis && (
              <ProjektTeil
                titel={ersterText(offenesBeispiel.ergebnis.titel) || 'Ergebnis'}
                wert={alsListe(offenesBeispiel.ergebnis.punkte)}
                className="bl-morph-projekt-ergebnis"
                symbol={Check}
              />
            )}
            <div className="bl-morph-fuss">
              <Knopf groesse="klein" variante="still" symbol={RotateCcw} onClick={zuruecksetzen}>Zurücksetzen</Knopf>
            </div>
          </div>
        ) : (
          <div className="bl-morph-einordnung" aria-live="polite">
            {anzahlGewaehlt === 0 ? (
              <p className="bl-morph-einordnung-leer">Noch nichts gewählt – wähle je Dimension ein Feld oder lade ein Beispiel.</p>
            ) : (
              <>
                <p className="bl-morph-einordnung-zeile"><strong>Deine Einordnung:</strong> {einordnung}</p>
                {passendes && (
                  <p className="bl-morph-einordnung-treffer">
                    Diese Kombination entspricht dem Projekt „{passendes.titel}“.
                    <Knopf groesse="klein" variante="still" onClick={() => setBeispielId(passendes.id)}>Projekt zeigen</Knopf>
                  </p>
                )}
                <div className="bl-morph-fuss">
                  <Knopf groesse="klein" variante="still" symbol={RotateCcw} onClick={zuruecksetzen}>Zurücksetzen</Knopf>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </GrafikRahmen>
  );
}
