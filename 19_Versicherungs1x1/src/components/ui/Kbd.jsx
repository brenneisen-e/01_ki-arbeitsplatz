// Kbd — Tastenkappe. <Tasten tasten={['mod','K']} /> zeigt „⌘ K“ auf dem Mac,
// „Strg K“ sonst. Pfeiltasten werden als Symbole gezeichnet, weil DM Sans
// keine waagerechten Pfeile führt.
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, CornerDownLeft } from 'lucide-react';

let macCache = null;
/** Läuft die App auf einem Mac (⌘ statt Strg)? */
export function istMac() {
  if (macCache !== null) return macCache;
  const plattform = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || navigator.userAgent || '';
  macCache = /mac|iphone|ipad|ipod/i.test(plattform);
  return macCache;
}

/** Beschriftung der Modifier-Taste. */
export function modTaste() {
  return istMac() ? '⌘' : 'Strg';
}

const SYMBOLE = {
  ArrowLeft: <ArrowLeft size={12} aria-label="Pfeil links" />,
  ArrowRight: <ArrowRight size={12} aria-label="Pfeil rechts" />,
  ArrowUp: <ArrowUp size={12} aria-label="Pfeil hoch" />,
  ArrowDown: <ArrowDown size={12} aria-label="Pfeil runter" />,
  Enter: <CornerDownLeft size={12} aria-label="Eingabetaste" />,
};

export function tastenText(taste) {
  if (taste === 'mod') return modTaste();
  if (taste === 'Esc' || taste === 'Escape') return 'Esc';
  return taste;
}

export default function Kbd({ taste, children, className = '', ...rest }) {
  const inhalt = taste ? (SYMBOLE[taste] || tastenText(taste)) : children;
  return <kbd className={`kbd ${className}`.trim()} {...rest}>{inhalt}</kbd>;
}

/** Eine Tastenfolge, z. B. ['mod', 'K']. */
export function Tasten({ tasten = [], className = '' }) {
  return (
    <span className={`kbd-reihe ${className}`.trim()}>
      {tasten.map((t, i) => <Kbd key={`${t}-${i}`} taste={t} />)}
    </span>
  );
}
