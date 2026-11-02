import { Fragment, useLayoutEffect } from 'react';
import { useMode } from '../../hooks/useMode';
import { istWhitelabel, setzeWhitelabel, ersetzeText } from '../../utils/whitelabel';

const ATTRIBUTE = ['title', 'alt', 'placeholder', 'aria-label'];
const AUSGENOMMEN = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'NOSCRIPT']);

/**
 * Whitelabel-Filter: Solange Zukunftsversicherung, Zukunftsbank oder
 * Zukunftsinvestment aktiv ist, ersetzt er in allem Sichtbaren (Text, Tooltips,
 * Alt-Texte, Platzhalter, auch in Portalen) die echten Versicherer der
 * Demo-Daten durch die fiktiven aus `utils/whitelabel.js`. So bleiben die
 * Demo-Daten für ERGO und die Volksbank geschrieben, und keine Ansicht muss
 * einzeln umgestellt werden. Ausgenommen sind Bereiche mit `data-echte-namen`
 * (die Auswahl der Institute zeigt weiter alle Marken).
 *
 * Beim Wechsel zwischen Whitelabel und echter Marke wird der Baum neu
 * aufgebaut (`key`), damit keine umgeschriebenen Texte stehen bleiben.
 */
export default function WhitelabelRahmen({ children }) {
  const { config, modeId } = useMode();
  const aktiv = istWhitelabel(config.institut);
  // Vor den Kindern setzen: LogoImg und Downloads lesen den Zustand beim Rendern.
  setzeWhitelabel(aktiv, modeId);

  useLayoutEffect(() => {
    if (!aktiv) return undefined;
    const geschuetzt = (el) => !el || AUSGENOMMEN.has(el.tagName) || !!el.closest('[data-echte-namen]');

    const text = (t) => {
      if (geschuetzt(t.parentElement)) return;
      const neu = ersetzeText(t.nodeValue, modeId);
      if (neu !== t.nodeValue) t.nodeValue = neu;
    };
    const attribute = (el) => {
      for (const a of ATTRIBUTE) {
        const alt = el.getAttribute(a);
        if (alt) {
          const neu = ersetzeText(alt, modeId);
          if (neu !== alt) el.setAttribute(a, neu);
        }
      }
    };
    const element = (el) => {
      if (geschuetzt(el)) return;
      attribute(el);
      const gang = document.createTreeWalker(el, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
      for (let n = gang.nextNode(); n; n = gang.nextNode()) {
        if (n.nodeType === Node.TEXT_NODE) text(n);
        else if (!geschuetzt(n)) attribute(n);
      }
    };

    element(document.body);
    const beobachter = new MutationObserver((liste) => {
      for (const m of liste) {
        if (m.type === 'characterData') text(m.target);
        else if (m.type === 'attributes') { if (!geschuetzt(m.target)) attribute(m.target); }
        else {
          m.addedNodes.forEach((n) => {
            if (n.nodeType === Node.TEXT_NODE) text(n);
            else if (n.nodeType === Node.ELEMENT_NODE) element(n);
          });
        }
      }
    });
    beobachter.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRIBUTE });
    return () => beobachter.disconnect();
  }, [aktiv, modeId]);

  return <Fragment key={aktiv ? 'whitelabel' : 'marke'}>{children}</Fragment>;
}
