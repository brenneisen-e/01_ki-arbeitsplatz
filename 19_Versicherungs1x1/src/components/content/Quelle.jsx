// ===========================================================================
// Quelle.jsx — ein Quellenverweis im Text: <button> mit hochgestellter
// Nummer (Trefffläche 24 px über ::before), Popover per Hover, Klick und
// Tastatur (Enter/Leertaste; Esc schließt, Fokus kehrt zurück). Inhalt:
// Quellentext, „Quelle öffnen“ (citeMap) oder „Quelle ohne Link“ und
// „Zitat kopieren“ (Satz + Quelle). Ein per Hover geöffnetes Popover wird
// durch Klick „angeheftet“ und schließt dann erst per Klick, Esc oder Klick
// außerhalb.
// ===========================================================================
import { useCallback, useEffect, useRef, useState } from 'react';
import { Copy, ExternalLink, Check } from 'lucide-react';
import Popover from '../ui/Popover.jsx';
import Knopf from '../ui/Knopf.jsx';
import { getCiteUrl } from '../../utils/citeMap.js';
import { useKopieren } from './hilfen.js';

export default function Quelle({ text, nummer, satz = '' }) {
  const [offen, setOffen] = useState(false);
  // Öffnungsart als Zustand, weil sie über `fokus` ins Popover geht: per Zeiger
  // geöffnet wandert der Fokus NICHT (niemand verliert beim Lesen die Stelle),
  // per Klick oder Tastatur geöffnet schon (dann greift auch die Fokusfalle).
  const [art, setArt] = useState(null); // 'hover' | 'klick'
  const artRef = useRef(null);
  const setzeArt = useCallback((a) => { artRef.current = a; setArt(a); }, []);
  const timer = useRef(0);
  const [kopiert, kopiere] = useKopieren();
  const url = getCiteUrl(text);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const oeffne = useCallback((wie) => { window.clearTimeout(timer.current); setzeArt(wie); setOffen(true); }, [setzeArt]);
  const schliesse = useCallback(() => { window.clearTimeout(timer.current); setzeArt(null); setOffen(false); }, [setzeArt]);

  const beiZeigerRein = () => {
    window.clearTimeout(timer.current);
    if (!offen) timer.current = window.setTimeout(() => oeffne('hover'), 220);
  };
  const beiZeigerRaus = () => {
    window.clearTimeout(timer.current);
    if (artRef.current === 'hover') timer.current = window.setTimeout(schliesse, 260);
  };
  const beiKlick = (e) => {
    if (offen && artRef.current === 'hover') {
      // angeheftet: bleibt offen, das Popover soll nicht umschalten
      setzeArt('klick');
      e.preventDefault();
    } else if (!offen) {
      setzeArt('klick');
    }
  };

  const zitat = `${satz ? `„${satz}“ – ` : ''}Quelle: ${text}${url ? ` (${url})` : ''}`;

  const knopf = (
    <button
      type="button"
      className="bl-quelle"
      aria-label={`Quelle ${nummer}: ${text}`}
      onMouseEnter={beiZeigerRein}
      onMouseLeave={beiZeigerRaus}
      onClick={beiKlick}
    >
      <sup>{nummer}</sup>
    </button>
  );

  return (
    <Popover
      ausloeser={knopf}
      offen={offen}
      onOeffnen={() => oeffne(artRef.current || 'klick')}
      onSchliessen={schliesse}
      seite="oben"
      ausrichtung="mitte"
      titel={`Quelle ${nummer}`}
      fokus={art !== 'hover'}
      className="bl-quelle-popover"
    >
      <div
        className="bl-quelle-inhalt"
        data-autofokus
        tabIndex={-1}
        onMouseEnter={() => window.clearTimeout(timer.current)}
        onMouseLeave={beiZeigerRaus}
      >
        <div className="bl-quelle-kopf">
          <span className="bl-quelle-nr" aria-hidden="true">{nummer}</span>
          <span className="bl-quelle-art">Quelle</span>
        </div>
        <p className="bl-quelle-text">{text}</p>
        {satz && <p className="bl-quelle-satz" data-kappung="absicht">„{satz}“</p>}
        <div className="bl-quelle-aktionen">
          {url ? (
            <Knopf groesse="klein" symbol={ExternalLink} href={url} target="_blank" rel="noopener noreferrer">
              Quelle öffnen
            </Knopf>
          ) : (
            <span className="bl-quelle-ohne">Quelle ohne Link</span>
          )}
          <Knopf
            groesse="klein"
            variante="still"
            symbol={kopiert === 'kopiert' ? Check : Copy}
            onClick={() => kopiere(zitat)}
            aria-live="polite"
          >
            {kopiert === 'kopiert' ? 'Kopiert' : kopiert === 'fehler' ? 'Kopieren nicht möglich' : 'Zitat kopieren'}
          </Knopf>
        </div>
      </div>
    </Popover>
  );
}
