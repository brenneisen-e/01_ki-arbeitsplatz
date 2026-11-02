// ===========================================================================
// Entscheidungsbaum.jsx — Blocktyp `decisionTree` aus kapitel.decisionTrees:
// Frage als Karte, Optionen als Knöpfe, Verlauf als Brotkrumen (Klick springt
// zurück), Ergebnis mit Icon, Liste und Hinweis; „Zurück“ und „Neu starten“.
// Nach jeder Wahl wandert der Fokus auf die neue Frage bzw. das Ergebnis.
// ===========================================================================
import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { getIconComponent } from '../ui/Icons.jsx';
import BlockRahmen from './BlockRahmen.jsx';
import Knopf from '../ui/Knopf.jsx';

export default function Entscheidungsbaum({ block, kapitel }) {
  const baum = kapitel?.decisionTrees?.[block.treeKey];
  const [pfad, setPfad] = useState([]); // [{ knoten, wahl }]
  const [aktuell, setAktuell] = useState(baum?.start);
  const kopfRef = useRef(null);
  const ersterRender = useRef(true);

  useEffect(() => { setPfad([]); setAktuell(baum?.start); }, [baum]);
  useEffect(() => {
    if (ersterRender.current) { ersterRender.current = false; return; }
    kopfRef.current?.focus({ preventScroll: true });
  }, [aktuell]);

  const knoten = useMemo(() => (baum && aktuell ? baum.nodes?.[aktuell] : null), [baum, aktuell]);
  if (!baum || !knoten) return null;

  const waehle = (opt) => {
    if (!opt?.next || !baum.nodes?.[opt.next]) return;
    setPfad((p) => [...p, { knoten: aktuell, wahl: opt.label }]);
    setAktuell(opt.next);
  };
  const zurueckZu = (index) => {
    setAktuell(pfad[index].knoten);
    setPfad((p) => p.slice(0, index));
  };
  const neu = () => { setPfad([]); setAktuell(baum.start); };
  const titel = block.title || baum.title;

  return (
    <BlockRahmen titel={titel} className="bl-baum-block">
      <div className="bl-baum">
        {pfad.length > 0 && (
          <nav className="bl-baum-verlauf" aria-label="Bisherige Antworten">
            <ol>
              {pfad.map((schritt, i) => (
                <li key={i}>
                  <button type="button" className="bl-baum-krume" onClick={() => zurueckZu(i)} title="Zu dieser Frage zurück">{schritt.wahl}</button>
                  <ChevronRight size={12} aria-hidden="true" />
                </li>
              ))}
            </ol>
          </nav>
        )}
        {knoten.result ? (
          <ResultatKarte knoten={knoten} kopfRef={kopfRef} onZurueck={pfad.length ? () => zurueckZu(pfad.length - 1) : null} onNeu={neu} />
        ) : (
          <div className="bl-baum-karte" aria-live="polite">
            <h4 className="bl-baum-frage" ref={kopfRef} tabIndex={-1}>{knoten.question}</h4>
            <div className="bl-baum-optionen" role="group" aria-label="Antworten">
              {(knoten.options || []).map((opt, i) => (
                <button key={i} type="button" className="bl-baum-option" onClick={() => waehle(opt)}>
                  <span>{opt.label}</span>
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              ))}
            </div>
            {pfad.length > 0 && (
              <div className="bl-baum-fuss">
                <Knopf variante="still" groesse="klein" symbol={ChevronLeft} onClick={() => zurueckZu(pfad.length - 1)}>Zurück</Knopf>
                <Knopf variante="still" groesse="klein" symbol={RotateCcw} onClick={neu}>Neu starten</Knopf>
              </div>
            )}
          </div>
        )}
      </div>
    </BlockRahmen>
  );
}

function ResultatKarte({ knoten, kopfRef, onZurueck, onNeu }) {
  const Symbol = getIconComponent(knoten.icon || 'shield-check');
  return (
    <div className="bl-baum-karte bl-baum-ergebnis" aria-live="polite">
      <div className="bl-baum-ergebnis-kopf">
        <span className="bl-baum-ergebnis-symbol" aria-hidden="true"><Symbol size={22} /></span>
        <h4 className="bl-baum-frage" ref={kopfRef} tabIndex={-1}>{knoten.title}</h4>
      </div>
      {Array.isArray(knoten.items) && knoten.items.length > 0 && (
        <ul className="bl-baum-liste">
          {knoten.items.map((item, i) => (
            <li key={i}><Check size={15} aria-hidden="true" /><span>{item}</span></li>
          ))}
        </ul>
      )}
      {knoten.note && <p className="bl-baum-notiz">{knoten.note}</p>}
      <div className="bl-baum-fuss">
        {onZurueck && <Knopf variante="still" groesse="klein" symbol={ChevronLeft} onClick={onZurueck}>Zurück</Knopf>}
        <Knopf variante="weich" groesse="klein" symbol={RotateCcw} onClick={onNeu}>Neu starten</Knopf>
      </div>
    </div>
  );
}
