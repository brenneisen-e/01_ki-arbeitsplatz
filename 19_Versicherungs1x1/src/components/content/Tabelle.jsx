// ===========================================================================
// Tabelle.jsx — Blocktypen `table` und `comparisonTable`.
// Kopf sticky (solange die Tabelle nicht seitlich scrollt), Zahlenspalten
// rechtsbündig mit Tabellenziffern (Spalte überwiegend numerisch), Sortierung
// mit deutschem Zahlenparsen („1.234,5“, „6,6 %“, „−0,5 %“), aria-sort,
// Zebra dezent, Hervorhebungsspalte in --marke-weich, seitliches Scrollen
// nur wenn nötig — dann mit Schattenkanten —, Statuszellen { text, status }
// mit Check/X/Minus, Inline-HTML (strong, code) in Zellen, „Als Text
// kopieren“ (Tab-getrennt für Excel und Folien).
// ===========================================================================
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Check, Copy, Minus, X } from 'lucide-react';
import BlockRahmen from './BlockRahmen.jsx';
import InlineHtml from './Inline.jsx';
import Knopf from '../ui/Knopf.jsx';
import { parseDeutscheZahl, zellenText, useBreite, useKopieren } from './hilfen.js';

const STATUS = {
  ja: { Symbol: Check, klasse: 'ja', name: 'Ja' },
  nein: { Symbol: X, klasse: 'nein', name: 'Nein' },
  teils: { Symbol: Minus, klasse: 'teils', name: 'Eingeschränkt' },
  teilweise: { Symbol: Minus, klasse: 'teils', name: 'Eingeschränkt' },
};

function StatusZelle({ zelle }) {
  const s = STATUS[String(zelle.status || '').toLowerCase()];
  const text = zelle.text != null && String(zelle.text).trim() ? String(zelle.text) : (s ? s.name : '');
  if (!s) return <>{text}</>;
  const { Symbol, klasse, name } = s;
  return (
    <span className={`bl-status bl-status-${klasse}`}>
      <Symbol size={15} aria-hidden="true" />
      <span className="sr-only">{name}: </span>
      <span>{text}</span>
    </span>
  );
}

function Zelle({ zelle }) {
  if (zelle == null) return null;
  if (typeof zelle === 'object') return <StatusZelle zelle={zelle} />;
  const s = String(zelle);
  if (s.indexOf('<') >= 0) return <InlineHtml html={s} begriffe={false} />;
  return <>{s}</>;
}

function spaltenAus(block) {
  const roh = block.headers || block.columns || [];
  return roh.map((c, i) => (typeof c === 'string' ? { key: i, label: c } : { key: c.key ?? i, label: c.label ?? String(c.key ?? i) }));
}

function zellenAus(zeile, spalten) {
  if (Array.isArray(zeile)) return spalten.map((_, i) => zeile[i]);
  if (zeile && typeof zeile === 'object') return spalten.map((c) => zeile[c.key]);
  return spalten.map(() => '');
}

function istNumerisch(text) {
  return /^[~≈><≥≤]?\s*[+\-−–]?\s*\d/.test(String(text).trim());
}

export default function Tabelle({ block }) {
  const spalten = useMemo(() => spaltenAus(block), [block]);
  const zeilen = useMemo(() => (block.rows || []).map((z) => zellenAus(z, spalten)), [block, spalten]);
  const sortierbar = Boolean(block.sortable);
  const [sortSpalte, setSortSpalte] = useState(null);
  const [richtung, setRichtung] = useState('auf');
  const huelleRef = useRef(null);
  const tabelleRef = useRef(null);
  const breite = useBreite(huelleRef);
  const [scrollt, setScrollt] = useState(false);
  const [kanten, setKanten] = useState({ links: false, rechts: false });
  const [kopiert, kopiere] = useKopieren();

  const numerisch = useMemo(() => spalten.map((_, ci) => {
    const werte = zeilen.map((z) => zellenText(z[ci]).trim()).filter(Boolean);
    if (werte.length === 0) return false;
    const zahlen = werte.filter((w) => istNumerisch(w) && parseDeutscheZahl(w) !== null).length;
    return zahlen / werte.length >= 0.6;
  }), [spalten, zeilen]);

  const hervor = useMemo(() => {
    if (block.highlightColumn == null) return -1;
    const h = block.highlightColumn;
    const idx = spalten.findIndex((c) => c.key === h || c.label === h);
    return idx >= 0 ? idx : (typeof h === 'number' ? h : -1);
  }, [block.highlightColumn, spalten]);

  const sortiert = useMemo(() => {
    if (!sortierbar || sortSpalte == null) return zeilen;
    const faktor = richtung === 'auf' ? 1 : -1;
    const kopie = zeilen.map((z, i) => ({ z, i }));
    kopie.sort((a, b) => {
      const ta = zellenText(a.z[sortSpalte]);
      const tb = zellenText(b.z[sortSpalte]);
      if (numerisch[sortSpalte]) {
        const na = parseDeutscheZahl(ta);
        const nb = parseDeutscheZahl(tb);
        if (na == null && nb == null) return a.i - b.i;
        if (na == null) return 1;
        if (nb == null) return -1;
        return (na - nb) * faktor || a.i - b.i;
      }
      return ta.localeCompare(tb, 'de', { numeric: true, sensitivity: 'base' }) * faktor || a.i - b.i;
    });
    return kopie.map((k) => k.z);
  }, [zeilen, sortierbar, sortSpalte, richtung, numerisch]);

  const sortiere = (ci) => {
    if (sortSpalte === ci) setRichtung((r) => (r === 'auf' ? 'ab' : 'auf'));
    else { setSortSpalte(ci); setRichtung('auf'); }
  };

  // Seitliches Scrollen nur, wenn die Tabelle breiter ist als ihr Platz
  useEffect(() => {
    const h = huelleRef.current;
    const t = tabelleRef.current;
    if (!h || !t) return;
    setScrollt(t.scrollWidth > h.clientWidth + 1);
  }, [breite, zeilen, spalten]);

  const messeKanten = useCallback(() => {
    const h = huelleRef.current;
    if (!h) return;
    setKanten({ links: h.scrollLeft > 1, rechts: h.scrollLeft + h.clientWidth < h.scrollWidth - 1 });
  }, []);
  useEffect(() => { if (scrollt) messeKanten(); }, [scrollt, breite, messeKanten]);

  const alsText = () => {
    const kopf = spalten.map((c) => c.label).join('\t');
    const koerper = sortiert.map((z) => z.map((c) => zellenText(c).replace(/\s+/g, ' ').trim()).join('\t'));
    return [kopf, ...koerper].join('\n');
  };

  const titel = block.title || block.caption;
  const kopierKnopf = (
    <Knopf groesse="klein" variante="still" symbol={kopiert === 'kopiert' ? Check : Copy} onClick={() => kopiere(alsText())} aria-live="polite">
      {kopiert === 'kopiert' ? 'Kopiert' : kopiert === 'fehler' ? 'Kopieren nicht möglich' : 'Als Text kopieren'}
    </Knopf>
  );

  return (
    <BlockRahmen titel={titel} quelle={block.source} quelleUrl={block.sourceUrl} aktionen={kopierKnopf} className="bl-tabellen-block">
      <div className="bl-tabelle-aussen" data-scrollt={scrollt} data-kante-links={kanten.links} data-kante-rechts={kanten.rechts}>
        <div className="bl-tabelle-huelle" data-rollen={scrollt ? 'absicht' : undefined} ref={huelleRef} onScroll={messeKanten} tabIndex={scrollt ? 0 : undefined} role={scrollt ? 'region' : undefined} aria-label={scrollt ? `${titel || 'Tabelle'} (seitlich scrollbar)` : undefined}>
          <table className="bl-tabelle" ref={tabelleRef}>
            {titel && <caption className="sr-only">{titel}</caption>}
            <thead>
              <tr>
                {spalten.map((c, ci) => {
                  const aktiv = sortierbar && sortSpalte === ci;
                  const Symbol = aktiv ? (richtung === 'auf' ? ArrowUp : ArrowDown) : ArrowUpDown;
                  return (
                    <th
                      key={ci}
                      scope="col"
                      className={[numerisch[ci] ? 'bl-zahl' : '', hervor === ci ? 'bl-hervor' : ''].filter(Boolean).join(' ')}
                      aria-sort={sortierbar ? (aktiv ? (richtung === 'auf' ? 'ascending' : 'descending') : 'none') : undefined}
                    >
                      {sortierbar ? (
                        <button type="button" className="bl-sortier" onClick={() => sortiere(ci)} data-aktiv={aktiv}>
                          <span>{c.label}</span>
                          <Symbol size={13} aria-hidden="true" />
                          <span className="sr-only">{aktiv ? (richtung === 'auf' ? ', aufsteigend sortiert' : ', absteigend sortiert') : ', sortieren'}</span>
                        </button>
                      ) : c.label}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {sortiert.map((z, ri) => (
                <tr key={ri}>
                  {z.map((zelle, ci) => (
                    <td key={ci} className={[numerisch[ci] ? 'bl-zahl' : '', hervor === ci ? 'bl-hervor' : ''].filter(Boolean).join(' ')}>
                      <Zelle zelle={zelle} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </BlockRahmen>
  );
}
