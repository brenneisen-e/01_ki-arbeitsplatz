// ===========================================================================
// ArchetypenKarte.jsx — Blocktyp `archetypenKarte` (Deck-Folie 11):
// Landkarte der Marktteilnehmer. Spalten sind Gruppen von Archetypen
// (privatwirtschaftlicher Markt gegen gesetzliche Sozialversicherung), die
// Rolle bestimmt die Tönung (Risikoträger kräftig, kein Risikoträger
// neutral, Unterstützer als Band unten über die Spaltenbreite). Die Mitte
// („Endkunden“) steht als Kreis zwischen der ersten und der zweiten Spalte;
// `beziehungen` werden zu beschrifteten Pfeilen an der Mitte — die Richtung
// kommt aus von/nach, nicht aus der Art.
//
// Unter 660 px Blockbreite (und über den Umschalter) tritt die gestapelte
// Liste mit Rollen als Pillen an die Stelle der Karte.
// ===========================================================================
import { Fragment, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, Users } from 'lucide-react';
import Pille from '../ui/Pille.jsx';
import InlineHtml from './Inline.jsx';
import { AnsichtsWahl, GrafikRahmen, ersterText, useZweitfassung } from './grafikteile.jsx';

const ROLLEN = {
  traeger: { name: 'Risikoträger', ton: 'marke' },
  'kein-traeger': { name: 'Kein Risikoträger', ton: 'neutral' },
  unterstuetzer: { name: 'Unterstützer', ton: 'info' },
};
const ARTEN = { deckt: 'deckt', zahlt: 'zahlt', unterstuetzt: 'unterstützt' };

function falte(text) {
  return String(text ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
}

/** Rolle einer Gruppe, sonst null (unbekannte Werte gelten als „ohne Rolle“). */
function rolleVon(gruppe) {
  const r = String(gruppe?.rolle || '').trim();
  return ROLLEN[r] ? r : null;
}

/**
 * Eine Archetypen-Gruppe als Karte: Titel, Rolle als Pille, Beschreibung.
 * In der Karte trägt die Pille nur, wer von der Rolle seiner Spalte abweicht
 * (das Band über der Spalte nennt sie schon im Text); in der Liste immer.
 */
function Gruppe({ gruppe, zeigeRolle = true }) {
  const rolle = rolleVon(gruppe);
  return (
    <div className="bl-arch-gruppe" data-rolle={rolle || 'ohne'}>
      <div className="bl-arch-gruppe-kopf">
        <h5 className="bl-arch-gruppe-titel">{ersterText(gruppe.titel, gruppe.title)}</h5>
        {rolle && zeigeRolle && <Pille ton={ROLLEN[rolle].ton}>{ROLLEN[rolle].name}</Pille>}
      </div>
      {gruppe.text && <p className="bl-arch-gruppe-text"><InlineHtml html={String(gruppe.text)} begriffe={false} /></p>}
    </div>
  );
}

/**
 * Gleiche Art und Richtung auf einer Seite nur einmal als Pfeil zeigen —
 * „deckt“ gilt oft für mehrere Gruppen derselben Spalte. Die einzelnen Paare
 * stehen in der Vorlesefassung und vollständig in der Listenansicht.
 */
function buendle(liste) {
  const gebuendelt = new Map();
  for (const b of liste) {
    const schluessel = `${b.label}|${b.richtung}`;
    if (!gebuendelt.has(schluessel)) gebuendelt.set(schluessel, { ...b, paare: [] });
    gebuendelt.get(schluessel).paare.push(`${b.von} zu ${b.nach}`);
  }
  return [...gebuendelt.values()];
}

/** Beschriftete Pfeile an einer Seite der Mitte. */
function Verbindungen({ liste, seite }) {
  if (liste.length === 0) return null;
  return (
    <ul className="bl-arch-verbindungen" data-seite={seite}>
      {buendle(liste).map((b, i) => {
        const Pfeil = b.richtung === 'links' ? ArrowLeft : ArrowRight;
        return (
          <li key={i} className="bl-arch-verbindung">
            <Pfeil size={15} aria-hidden="true" />
            <span>{b.label}</span>
            <span className="sr-only">: {b.paare.join(', ')}</span>
          </li>
        );
      })}
    </ul>
  );
}

export default function ArchetypenKarte({ block }) {
  const [ansicht, setAnsicht] = useState('grafik');
  const { ref, schmal } = useZweitfassung(660);

  const modell = useMemo(() => {
    const spalten = (Array.isArray(block.spalten) ? block.spalten : [])
      .filter((s) => s && typeof s === 'object')
      .map((s) => {
        const gruppen = (Array.isArray(s.gruppen) ? s.gruppen : []).filter((g) => g && typeof g === 'object');
        const kern = gruppen.filter((g) => rolleVon(g) !== 'unterstuetzer');
        const zaehler = new Map();
        for (const g of kern) {
          const r = rolleVon(g);
          if (r) zaehler.set(r, (zaehler.get(r) || 0) + 1);
        }
        const vorherrschend = [...zaehler.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null;
        return {
          titel: ersterText(s.titel, s.title),
          hinweis: ersterText(s.hinweis),
          gruppen,
          kern,
          vorherrschend,
          baender: gruppen.filter((g) => rolleVon(g) === 'unterstuetzer'),
        };
      });
    const mitte = block.mitte && typeof block.mitte === 'object' ? block.mitte : null;
    const mitteNamen = new Set([falte(mitte?.titel), falte(mitte?.title)].filter(Boolean));
    // Welcher Name (Spalten- oder Gruppentitel) liegt in welcher Spalte?
    const spalteVon = new Map();
    spalten.forEach((s, i) => {
      if (s.titel) spalteVon.set(falte(s.titel), i);
      for (const g of s.gruppen) if (g.titel) spalteVon.set(falte(g.titel), i);
    });
    const beziehungen = (Array.isArray(block.beziehungen) ? block.beziehungen : [])
      .filter((b) => b && (b.von || b.nach))
      .map((b) => {
        const zurMitte = mitteNamen.has(falte(b.nach));
        const vonMitte = mitteNamen.has(falte(b.von));
        const gegen = zurMitte ? falte(b.von) : falte(b.nach);
        const spalte = spalteVon.has(gegen) ? spalteVon.get(gegen) : null;
        return {
          von: ersterText(b.von),
          nach: ersterText(b.nach),
          label: ARTEN[b.art] || ersterText(b.art) || 'wirkt auf',
          amKreis: (zurMitte || vonMitte) && spalte != null,
          zurMitte,
          spalte,
        };
      });
    return { spalten, mitte, beziehungen };
  }, [block]);

  const { spalten, mitte, beziehungen } = modell;
  if (spalten.length === 0 && !mitte) return null;
  const zeigeText = ansicht === 'text' || schmal;
  const mitteTitel = ersterText(mitte?.titel, mitte?.title);

  // Pfeile an der Mitte: links gehört zur ersten Spalte, rechts zu den übrigen.
  const seiten = { links: [], rechts: [] };
  for (const b of beziehungen) {
    if (!b.amKreis) continue;
    const links = b.spalte === 0;
    const nachInnen = b.zurMitte; // Pfeil zeigt auf die Mitte
    seiten[links ? 'links' : 'rechts'].push({ ...b, richtung: links === nachInnen ? 'rechts' : 'links' });
  }

  // Der Text der Mitte steht NICHT in der schmalen Mittelspalte: dort ergab er
  // eine drei Wörter breite, 13 Zeilen hohe Säule. Er läuft als eigene Zeile
  // unter der Karte auf Lesemaß — die Spalte trägt nur Kreis, Titel und Pfeile.
  const Mitte = mitte ? (
    <div className="bl-arch-mitte">
      <Verbindungen liste={seiten.links} seite="links" />
      <div className="bl-arch-kreis">
        <span className="bl-arch-kreis-scheibe" aria-hidden="true"><Users size={26} /></span>
        <span className="bl-arch-kreis-titel">{mitteTitel}</span>
      </div>
      <Verbindungen liste={seiten.rechts} seite="rechts" />
    </div>
  ) : null;

  return (
    <GrafikRahmen
      block={block}
      titelFallback="Archetypen des Marktes"
      className="bl-arch-block"
      aktionen={!schmal && <AnsichtsWahl wert={ansicht} onWechsel={setAnsicht} grafikLabel="Karte" textLabel="Liste" />}
    >
      <div ref={ref} className="bl-arch-huelle">
        {zeigeText ? (
          <div className="bl-arch-liste">
            {spalten.map((s, i) => (
              <section key={i} className="bl-arch-liste-spalte">
                <h4 className="bl-arch-liste-titel">{s.titel}</h4>
                {s.hinweis && <p className="bl-arch-liste-hinweis">{s.hinweis}</p>}
                <ul className="bl-arch-liste-gruppen">
                  {s.gruppen.map((g, j) => <li key={j}><Gruppe gruppe={g} /></li>)}
                </ul>
              </section>
            ))}
            {mitte && (
              <section className="bl-arch-liste-spalte">
                <h4 className="bl-arch-liste-titel">{mitteTitel}</h4>
                {mitte.text && <p className="bl-arch-liste-text">{mitte.text}</p>}
              </section>
            )}
            {beziehungen.length > 0 && (
              <section className="bl-arch-liste-spalte bl-arch-liste-breit">
                <h4 className="bl-arch-liste-titel">Beziehungen</h4>
                <ul className="bl-arch-liste-beziehungen">
                  {beziehungen.map((b, i) => (
                    <li key={i}>
                      <strong>{b.von}</strong>
                      <ArrowRight size={14} aria-hidden="true" />
                      <strong>{b.nach}</strong>
                      <span className="bl-arch-art">{b.label}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        ) : (
          <div className="bl-arch">
            {spalten.map((s, i) => (
              <Fragment key={i}>
                <div className="bl-arch-spalte">
                  {s.titel && <h4 className="bl-arch-spalte-titel">{s.titel}</h4>}
                  {s.hinweis && (
                    <p className="bl-arch-hinweis" data-stark={s.vorherrschend === 'traeger'}>{s.hinweis}</p>
                  )}
                  <div className="bl-arch-kern">
                    {s.kern.map((g, j) => (
                      <Gruppe key={j} gruppe={g} zeigeRolle={!s.hinweis || rolleVon(g) !== s.vorherrschend} />
                    ))}
                  </div>
                  {s.baender.map((g, j) => (
                    <div key={j} className="bl-arch-band">
                      <ArrowUp size={16} aria-hidden="true" className="bl-arch-band-pfeil" />
                      <Gruppe gruppe={g} />
                    </div>
                  ))}
                </div>
                {i === 0 && spalten.length > 1 && Mitte}
              </Fragment>
            ))}
            {spalten.length <= 1 && Mitte}
          </div>
        )}
        {!zeigeText && mitte && mitte.text && (
          <p className="bl-arch-mitte-text">
            <span className="bl-arch-mitte-marke">{mitteTitel}</span>
            {mitte.text}
          </p>
        )}
      </div>
    </GrafikRahmen>
  );
}
