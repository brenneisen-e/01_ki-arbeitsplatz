// ===========================================================================
// Importprüfung (übernommen aus vertragsumstellung, an dieses Projekt angepasst)
//
// Rollup prüft in JSX keine freien Bezeichner: ein Bauteil, das importiert
// werden müsste und nicht importiert ist, baut fehlerfrei durch und wirft
// erst zur Laufzeit (weiße Seite). Dieser Test liest jede Quelldatei,
// sammelt Importe und lokale Deklarationen und vergleicht sie mit den
// Bezeichnern, die als JSX-Element gesetzt oder als bekannte Hilfsfunktion
// (lib/*, store/*, React-Hooks) aufgerufen werden. Kein Browser nötig; findet
// auch, was nie angeklickt wird.
//
// Aufruf: node scripts/importpruefung.mjs   (Teil von npm run pruefen)
// ===========================================================================

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const WURZEL = 'src';

function dateien(verzeichnis) {
  return readdirSync(verzeichnis).flatMap((name) => {
    const pfad = join(verzeichnis, name);
    if (statSync(pfad).isDirectory()) return dateien(pfad);
    return ['.js', '.jsx'].includes(extname(pfad)) ? [pfad] : [];
  });
}

/** Bezeichner, die ohne Import verfügbar sind. */
const EINGEBAUT = new Set([
  'Math', 'JSON', 'Object', 'Array', 'String', 'Number', 'Boolean', 'Date', 'Map', 'Set',
  'Promise', 'Error', 'RegExp', 'Intl', 'console', 'window', 'document', 'navigator',
  'localStorage', 'sessionStorage', 'requestAnimationFrame', 'cancelAnimationFrame',
  'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'fetch', 'URL', 'Blob',
  'FileReader', 'Uint8Array', 'ArrayBuffer', 'TextEncoder', 'TextDecoder', 'structuredClone',
  'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'Infinity', 'NaN', 'undefined', 'globalThis',
  'process', 'Symbol', 'Proxy', 'Reflect', 'WeakMap', 'WeakSet', 'BigInt', 'Function',
  'MutationObserver', 'ResizeObserver', 'IntersectionObserver', 'AbortController', 'Event',
  'CustomEvent', 'NodeFilter', 'getComputedStyle', 'matchMedia', 'crypto', 'performance', 'Element',
  'HTMLElement', 'Node', 'DOMParser', 'history', 'location', 'ClipboardItem',
]);

/** Funktionen aus lib/, store/ und React, deren Aufruf einen Import voraussetzt. */
const PRUEF_FUNKTIONEN = [
  // React
  'useState', 'useEffect', 'useMemo', 'useCallback', 'useRef', 'useId', 'useLayoutEffect', 'useContext',
  'useReducer', 'useTransition', 'useDeferredValue', 'useSyncExternalStore', 'createContext', 'createPortal',
  'lazy', 'memo', 'forwardRef', 'cloneElement', 'isValidElement',
  // store
  'useWissen', 'useTastenkuerzel', 'einheitSchluessel', 'frageKennung', 'hashZuRoute', 'routeZuHash', 'routenGleich',
  // lib/format
  'zahl', 'prozent', 'anteil', 'euro', 'kompakt', 'datum', 'datumLang', 'uhrzeit', 'datumRelativ', 'minuten', 'mehrzahl', 'dezimalenVon',
  // lib/text
  'entferneHtml', 'woerter', 'lesezeitMinuten', 'slug', 'kuerze', 'falte', 'nummer', 'blockText',
  // lib/bloecke
  'alleBloecke', 'sichtbareBloecke', 'blockTitel', 'hatTiefe', 'tiefeFuerBlock', 'tiefeLabel', 'naechsteTiefe',
  'stufeFuerTiefe', 'tiefeFuerStufe', 'hatEigenenTitel',
  // lib/begriffe, lib/speicher
  'findeBegriffe', 'begriffeInEinheit', 'slugFuerBegriff', 'vorkommenJeBegriff', 'lade', 'speichere', 'entferne',
  // Icons
  'getIconComponent', 'ikone',
];
const AUFRUF = new RegExp(`\\b(${PRUEF_FUNKTIONEN.join('|')})\\s*\\(`, 'g');

/**
 * Entfernt Kommentare (`// …`, `/* … *\/`) und ersetzt sie durch Leerzeichen
 * gleicher Länge (Zeilenumbrüche bleiben). Ohne diesen Schritt zählt jeder
 * Bezeichner in einem Kommentar als Verwendung: „(<Quelle>)“ oder „wie
 * `falte()`“ in einem JSDoc lösten Fehlalarme aus. Zeichenketten, Vorlagen-
 * texte und Regex-Literale bleiben unangetastet, damit ein `'http://…'`
 * nicht die halbe Datei verschluckt.
 */
function ohneKommentare(quelle) {
  let aus = '';
  let i = 0;
  // Zeichen, nach denen ein „/“ einen Regex beginnt (und keine Division ist)
  const VOR_REGEX = new Set(['(', ',', '=', ':', '[', '!', '&', '|', '?', '{', '}', ';', '+', '-', '*', '%', '~', '^', '<', '>', '\n']);
  const letztesZeichen = () => {
    for (let k = aus.length - 1; k >= 0; k -= 1) {
      if (!/\s/.test(aus[k])) return aus[k];
      if (aus[k] === '\n') return '\n';
    }
    return '\n';
  };
  const wortDavor = () => (aus.match(/([A-Za-z$_][\w$]*)\s*$/) || [])[1];
  while (i < quelle.length) {
    const c = quelle[i];
    const d = quelle[i + 1];
    if (c === '/' && d === '/') {
      while (i < quelle.length && quelle[i] !== '\n') { aus += ' '; i += 1; }
    } else if (c === '/' && d === '*') {
      while (i < quelle.length && !(quelle[i] === '*' && quelle[i + 1] === '/')) {
        aus += quelle[i] === '\n' ? '\n' : ' ';
        i += 1;
      }
      aus += '  ';
      i += 2;
    } else if (c === '"' || c === "'" || c === '`') {
      aus += c; i += 1;
      while (i < quelle.length) {
        if (quelle[i] === '\\') { aus += quelle.slice(i, i + 2); i += 2; continue; }
        aus += quelle[i];
        i += 1;
        if (quelle[i - 1] === c) break;
      }
    } else if (c === '/' && (VOR_REGEX.has(letztesZeichen()) || ['return', 'typeof', 'case', 'in', 'of', 'new', 'delete', 'void'].includes(wortDavor()))) {
      // Regex-Literal: bis zum unmaskierten „/“ außerhalb einer Zeichenklasse
      aus += c; i += 1;
      let klasse = false;
      while (i < quelle.length && quelle[i] !== '\n') {
        if (quelle[i] === '\\') { aus += quelle.slice(i, i + 2); i += 2; continue; }
        if (quelle[i] === '[') klasse = true;
        else if (quelle[i] === ']') klasse = false;
        aus += quelle[i];
        i += 1;
        if (quelle[i - 1] === '/' && !klasse) break;
      }
    } else {
      aus += c;
      i += 1;
    }
  }
  return aus;
}

let treffer = 0;

for (const pfad of dateien(WURZEL)) {
  const quelle = ohneKommentare(readFileSync(pfad, 'utf8'));
  const bekannt = new Set(EINGEBAUT);

  // Importe: default, benannt (mit „as“), Namensräume
  for (const m of quelle.matchAll(/import\s+(?:(\w+)\s*,\s*)?\{([^}]*)\}\s+from/g)) {
    if (m[1]) bekannt.add(m[1]);
    for (const teil of m[2].split(',')) {
      const name = teil.split(' as ').pop().trim();
      if (name) bekannt.add(name);
    }
  }
  for (const m of quelle.matchAll(/import\s+(\w+)\s+from/g)) bekannt.add(m[1]);
  for (const m of quelle.matchAll(/import\s+\*\s+as\s+(\w+)\s+from/g)) bekannt.add(m[1]);

  // Deklarationen auf jeder Ebene (auch eingerückt)
  for (const m of quelle.matchAll(/^\s*(?:export\s+)?(?:default\s+)?(?:const|let|var|function|class)\s+(\w+)/gm)) bekannt.add(m[1]);
  // Destrukturierung, z. B. const { a, b: c } = useWissen()
  for (const m of quelle.matchAll(/^\s*(?:export\s+)?(?:const|let|var)\s*\{([^}]*)\}\s*=/gm)) {
    for (const teil of m[1].split(',')) {
      const name = teil.split(':').pop().split('=')[0].trim();
      if (name) bekannt.add(name);
    }
  }
  // Umbenennungen in Parameterlisten, z. B. function Knopf({ symbol: Symbol })
  const parameterlisten = [
    ...quelle.matchAll(/function\s+\w*\s*\(([\s\S]*?)\)\s*\{/g),
    ...quelle.matchAll(/\(([\s\S]{0,400}?)\)\s*=>/g),
  ];
  for (const m of parameterlisten) {
    for (const um of m[1].matchAll(/[\w'"]+\s*:\s*(\w+)/g)) bekannt.add(um[1]);
  }
  // Schleifenvariablen und Zuweisungen in Ausdrücken, z. B. const Icon = …, ({ icon: Icon })
  for (const m of quelle.matchAll(/(?:const|let|var)\s+(\w+)\s*=/g)) bekannt.add(m[1]);
  for (const m of quelle.matchAll(/\.map\(\((?:\{[^}]*\}|\w+)(?:,\s*\w+)?\)/g)) { /* Parameter sind keine Bauteile */ void m; }

  const fehlend = new Set();

  // JSX-Elemente mit Großbuchstaben sind Bauteile: importiert oder lokal deklariert
  for (const m of quelle.matchAll(/<([A-Z]\w*)[\s/>]/g)) {
    const name = m[1].split('.')[0];
    if (!bekannt.has(name)) fehlend.add(name);
  }
  // Aufrufe bekannter Hilfsfunktionen
  for (const m of quelle.matchAll(AUFRUF)) {
    if (!bekannt.has(m[1])) fehlend.add(m[1]);
  }

  if (fehlend.size) {
    treffer += fehlend.size;
    console.log(pfad);
    for (const n of [...fehlend].sort()) console.log(`    fehlender Import: ${n}`);
  }
}

console.log(treffer === 0
  ? 'Importprüfung bestanden.'
  : `Importprüfung FEHLGESCHLAGEN — ${treffer} Bezeichner ohne Import.`);
process.exit(treffer === 0 ? 0 : 1);
