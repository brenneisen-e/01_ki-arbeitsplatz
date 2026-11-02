// ===========================================================================
// Inline.jsx — übersetzt das Absatz-HTML der Daten (strong, em, code,
// ul/ol/li, br, a, Quellenverweis-Spans) mit DOMParser in React-Knoten.
// Kein DOM-Nachbearbeiten per querySelector: Quellen werden zu <Quelle>,
// Glossarbegriffe zur ersten Nennung je Absatz zu <Begriff> — nie in
// Überschriften, nie in <code>, nie innerhalb einer Quelle. Die Nummer
// einer Quelle kommt aus dem Blockkontext (je Einheit fortlaufend); ohne
// Kontext gilt die Nummer aus den Daten.
// ===========================================================================
import { useMemo } from 'react';
import { useWissen } from '../../store/Wissen.jsx';
import { findeBegriffe } from '../../lib/begriffe.js';
import { entferneHtml } from '../../lib/text.js';
import Begriff from '../glossar/Begriff.jsx';
import Quelle from './Quelle.jsx';
import { useBlockKontext } from './Kontext.jsx';
import { satzUm } from './hilfen.js';

const IST_QUELLE = (el) => el.tagName === 'SPAN' && el.classList.contains('v1x1-cite');

function parse(html) {
  if (typeof DOMParser === 'undefined') return null;
  try {
    return new DOMParser().parseFromString(String(html), 'text/html').body;
  } catch {
    return null;
  }
}

/** Klartext des Absatzes plus die Klartext-Positionen aller Quellenmarken (in Dokumentreihenfolge). */
function klartextMitPositionen(wurzel) {
  let text = '';
  const positionen = [];
  const lauf = (knoten) => {
    for (const k of knoten.childNodes) {
      if (k.nodeType === 3) { text += k.nodeValue; continue; }
      if (k.nodeType !== 1) continue;
      if (IST_QUELLE(k)) { positionen.push(text.length); continue; }
      if (k.tagName === 'BR') { text += ' '; continue; }
      lauf(k);
      if (['LI', 'P', 'UL', 'OL', 'DIV'].includes(k.tagName)) text += ' ';
    }
  };
  lauf(wurzel);
  return { text, positionen };
}

function quelleAusSpan(el) {
  const num = el.querySelector('.v1x1-cite-num');
  const tip = el.querySelector('.v1x1-cite-tooltip');
  return { nummer: num ? num.textContent.trim() : '', text: tip ? tip.textContent.trim() : el.textContent.trim() };
}

function textMitBegriffen(text, zustand, opt) {
  if (!opt.glossar || !text.trim()) return text;
  const treffer = findeBegriffe(text, opt.glossar);
  if (!treffer.length) return text;
  const teile = [];
  let pos = 0;
  for (const t of treffer) {
    if (t.start < pos || zustand.verlinkt.has(t.slug)) continue;
    if (t.start > pos) teile.push(text.slice(pos, t.start));
    teile.push(<Begriff key={`g${zustand.n += 1}`} slug={t.slug}>{text.slice(t.start, t.ende)}</Begriff>);
    zustand.verlinkt.add(t.slug);
    pos = t.ende;
  }
  if (pos < text.length) teile.push(text.slice(pos));
  return teile;
}

function uebersetzeKinder(knoten, zustand, opt, inCode = false) {
  const ergebnis = [];
  for (const k of knoten.childNodes) {
    if (k.nodeType === 3) {
      const t = k.nodeValue;
      if (!t) continue;
      const teil = inCode ? t : textMitBegriffen(t, zustand, opt);
      if (Array.isArray(teil)) ergebnis.push(...teil);
      else ergebnis.push(teil);
      continue;
    }
    if (k.nodeType !== 1) continue;
    const key = `k${zustand.n += 1}`;
    const tag = k.tagName;
    if (IST_QUELLE(k)) {
      const q = quelleAusSpan(k);
      const index = zustand.quelle;
      zustand.quelle += 1;
      if (!opt.quellen || !q.text) continue;
      const nummer = opt.nummerFuer(q.text) ?? (Number(q.nummer) || q.nummer || '?');
      ergebnis.push(<Quelle key={key} text={q.text} nummer={nummer} satz={satzUm(zustand.klartext, zustand.positionen[index] ?? 0)} />);
      continue;
    }
    switch (tag) {
      case 'STRONG': case 'B':
        ergebnis.push(<strong key={key}>{uebersetzeKinder(k, zustand, opt, inCode)}</strong>); break;
      case 'EM': case 'I':
        ergebnis.push(<em key={key}>{uebersetzeKinder(k, zustand, opt, inCode)}</em>); break;
      case 'CODE':
        ergebnis.push(<code key={key}>{uebersetzeKinder(k, zustand, opt, true)}</code>); break;
      case 'SUP':
        ergebnis.push(<sup key={key}>{uebersetzeKinder(k, zustand, opt, inCode)}</sup>); break;
      case 'SUB':
        ergebnis.push(<sub key={key}>{uebersetzeKinder(k, zustand, opt, inCode)}</sub>); break;
      case 'UL':
        ergebnis.push(<ul key={key} className="bl-liste">{uebersetzeKinder(k, zustand, opt, inCode)}</ul>); break;
      case 'OL':
        ergebnis.push(<ol key={key} className="bl-liste">{uebersetzeKinder(k, zustand, opt, inCode)}</ol>); break;
      case 'LI':
        ergebnis.push(<li key={key}>{uebersetzeKinder(k, zustand, opt, inCode)}</li>); break;
      case 'P':
        ergebnis.push(<p key={key}>{uebersetzeKinder(k, zustand, opt, inCode)}</p>); break;
      case 'BR':
        ergebnis.push(<br key={key} />); break;
      case 'A': {
        const href = k.getAttribute('href') || '';
        if (/^https?:\/\//i.test(href)) {
          ergebnis.push(<a key={key} href={href} target="_blank" rel="noopener noreferrer">{uebersetzeKinder(k, zustand, opt, inCode)}</a>);
        } else {
          ergebnis.push(...uebersetzeKinder(k, zustand, opt, inCode));
        }
        break;
      }
      case 'SCRIPT': case 'STYLE':
        break;
      default:
        ergebnis.push(...uebersetzeKinder(k, zustand, opt, inCode));
    }
  }
  return ergebnis;
}

/**
 * HTML → React-Knoten. Reine Funktion (bis auf DOMParser), für Tests nutzbar.
 * @param {string} html
 * @param {{ glossar?: Array|null, nummerFuer?: (text:string)=>number|null, quellen?: boolean }} opt
 */
export function uebersetzeHtml(html, opt = {}) {
  if (html == null || html === '') return [];
  const wurzel = parse(html);
  if (!wurzel) return [entferneHtml(html)];
  const { text, positionen } = klartextMitPositionen(wurzel);
  const zustand = { verlinkt: new Set(), n: 0, quelle: 0, klartext: text, positionen };
  return uebersetzeKinder(wurzel, zustand, {
    glossar: opt.glossar || null,
    nummerFuer: opt.nummerFuer || (() => null),
    quellen: opt.quellen !== false,
  });
}

/**
 * <InlineHtml html="…" /> — mit Glossarbegriffen (erste Nennung) und Quellen.
 * `begriffe={false}` schaltet die Glossarverlinkung ab (Tabellenzellen, Kacheln).
 */
export default function InlineHtml({ html, begriffe = true, quellen = true }) {
  const { glossar } = useWissen();
  const { nummerFuer } = useBlockKontext();
  const knoten = useMemo(
    () => uebersetzeHtml(html, { glossar: begriffe ? glossar : null, nummerFuer, quellen }),
    [html, glossar, nummerFuer, begriffe, quellen],
  );
  return <>{knoten}</>;
}
