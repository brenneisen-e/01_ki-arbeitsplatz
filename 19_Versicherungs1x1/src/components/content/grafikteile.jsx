// ===========================================================================
// grafikteile.jsx — gemeinsame Bauteile der sieben Grafikblöcke aus dem
// Sektortraining: Rahmen mit Titel, Untertitel und Fußnote, Umschalter
// Grafik/Text, Messung der Blockbreite (für die textliche Zweitfassung).
//
// Kein eigener Rahmen um den ganzen Block — den setzt ContentBlocks. Jede
// Grafik nutzt denselben Kopf (h3 + Untertitel) und dieselbe Fußzeile
// (Fußnote der Folie, darunter „Quelle: …“).
// ===========================================================================
import { useRef } from 'react';
import BlockRahmen from './BlockRahmen.jsx';
import InlineHtml from './Inline.jsx';
import Segment from '../ui/Segment.jsx';
import { useBreite } from './hilfen.js';

/** Rechenzeichen ausgeschrieben — Vorlesehilfen sprechen „+“ und „=“ nicht mit. */
export const ZEICHEN_WORT = {
  '+': 'plus', '-': 'minus', '−': 'minus', '–': 'minus', '=': 'ergibt',
  '×': 'mal', '*': 'mal', '/': 'geteilt durch', ':': 'geteilt durch', '±': 'plus minus',
};

/** Erster nicht leerer Text aus mehreren Feldern (deutsche und englische Namen). */
export function ersterText(...werte) {
  for (const w of werte) {
    if (typeof w === 'string' && w.trim()) return w.trim();
  }
  return '';
}

/** Liste aus einem Feld, das auch ein einzelner String sein darf. */
export function alsListe(wert) {
  if (Array.isArray(wert)) return wert.filter((e) => e != null && e !== '');
  if (typeof wert === 'string' && wert.trim()) return [wert.trim()];
  return [];
}

/**
 * Einheitlicher Rahmen einer Grafik: Titel (h3), Untertitel, Inhalt,
 * Fußnote, Quellenzeile. Untertitel und Fußnote dürfen Inline-HTML und
 * Quellenmarken enthalten.
 */
export function GrafikRahmen({ block = {}, className = '', aktionen = null, titelFallback = '', children }) {
  const untertitel = ersterText(block.untertitel, block.subtitle);
  const fussnote = ersterText(block.fussnote, block.footnote);
  return (
    <BlockRahmen
      titel={ersterText(block.title, block.titel) || titelFallback}
      quelle={block.source}
      quelleUrl={block.sourceUrl}
      aktionen={aktionen}
      fuss={fussnote ? <p className="bl-grafik-fussnote"><InlineHtml html={fussnote} begriffe={false} /></p> : null}
      className={`bl-grafik ${className}`.trim()}
    >
      {untertitel && (
        <p className="bl-grafik-untertitel"><InlineHtml html={untertitel} begriffe={false} /></p>
      )}
      {children}
    </BlockRahmen>
  );
}

/**
 * Misst die Blockbreite und meldet, ob die Grafik in ihre textliche
 * Zweitfassung fallen soll. Vor der ersten Messung gilt „nicht schmal“,
 * damit nichts aufblitzt.
 * @param {number} grenze Blockbreite in px, unter der die Textfassung gilt
 * @returns {{ ref: object, breite: number, schmal: boolean }}
 */
export function useZweitfassung(grenze = 640) {
  const ref = useRef(null);
  const breite = useBreite(ref);
  return { ref, breite, schmal: breite > 0 && breite < grenze };
}

/** Umschalter Grafik ↔ Text für die Kopfzeile eines Grafikblocks. */
export function AnsichtsWahl({ wert, onWechsel, grafikLabel = 'Grafik', textLabel = 'Liste' }) {
  return (
    <Segment
      optionen={[{ wert: 'grafik', label: grafikLabel }, { wert: 'text', label: textLabel }]}
      wert={wert}
      onWechsel={onWechsel}
      label="Ansicht"
      klein
    />
  );
}
