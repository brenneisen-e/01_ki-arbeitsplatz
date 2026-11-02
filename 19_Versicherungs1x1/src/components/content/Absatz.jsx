// ===========================================================================
// Absatz.jsx — Blocktyp `paragraph`: optionale Überschrift (h3), Inhalt im
// Lesemaß (16 px / 1,6) mit Quellenmarken und Glossarbegriffen. Ein Absatz
// nur mit Titel (Zwischenüberschrift aus den Daten) zeigt nur die Überschrift.
// ===========================================================================
import BlockRahmen from './BlockRahmen.jsx';
import InlineHtml from './Inline.jsx';

export default function Absatz({ block }) {
  const inhalt = typeof block.content === 'string' ? block.content.trim() : '';
  return (
    <BlockRahmen titel={block.title} className="bl-absatz" nurTitel={!inhalt}>
      {inhalt && (
        <div className="bl-prosa mass-text">
          <InlineHtml html={inhalt} />
        </div>
      )}
    </BlockRahmen>
  );
}
