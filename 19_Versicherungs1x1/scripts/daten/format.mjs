/**
 * format.mjs – Formatregeln für sichtbaren Text (Datenaudit Abschnitt D, BRIEF Abschnitt 11 Punkt 6).
 * Gemeinsam genutzt von daten-bereinigung.mjs und daten-anreicherung.mjs.
 *
 * Prozent/Promille mit U+00A0 („6,6 %“), Euro hinter der Zahl („254 Mrd. €“), „…“/‚…‘, „ – “ statt „—“,
 * Bereiche „2020–2025“, Minus U+2212, „z. B.“, „§ 84“, „EUR“ → „€“. HTML-Tags, <code>-Formeln und
 * Quellen-Tooltips bleiben unverändert.
 */
export const NBSP = ' ';

/** Schlüssel, deren Werte technisch sind und nie umformatiert werden. */
export const AUSGENOMMENE_SCHLUESSEL = new Set(['id', 'type', 'icon', 'chartKey', 'treeKey', 'pageId', 'version', 'lastUpdated', 'bearbeitet',
  'sourceUrl', 'link', 'color', 'borderColor', 'backgroundColor', 'slug', 'status', 'next', 'start', 'source', 'target', 'direction', 'variant', 'einheitId']);

const FRAGMENT_REGELN = [
  // Emoji-Reste (Punkt 5)
  [/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]️?\s?/gu, ''],
  // D3 Euro vor Zahl mit Größenordnung: „€254 Mrd.“ → „254 Mrd. €“
  [/€\s?(\d[\d.,]*)\s?(Mrd\.|Mio\.|Bio\.|Tsd\.)/g, '$1 $2 €'],
  // D4 Euro vor ausgeschriebener Größenordnung: „€254 Milliarden“ → „254 Milliarden Euro“
  [/€\s?(\d[\d.,]*)\s(Milliarden|Millionen|Billionen)/g, '$1 $2 Euro'],
  // D5 Euro vor einfacher Zahl: „€66.150“ → „66.150 €“
  [/€\s?(\d[\d.,]*)/g, '$1 €'],
  // D6 EUR und $ vereinheitlichen
  [/(\d)\s?(Mrd\.|Mio\.|Bio\.|Tsd\.)\s?EUR(?![\p{L}])/gu, '$1 $2 €'],
  [/(\d[\d.,]*)\s?EUR(?![\p{L}])/gu, '$1 €'],
  [/(\(?)Mrd\. \$/g, '$1Mrd. USD'],
  // D7 geschütztes Leerzeichen vor Größenordnung und Währung
  [/(\d)[  ]?(Mrd\.|Mio\.|Bio\.|Tsd\.)(?![\p{L}])/gu, `$1${NBSP}$2`],
  [/(\d|Mrd\.|Mio\.|Bio\.|Tsd\.)[  ]?€/g, `$1${NBSP}€`],
  [/(\d|Mrd\.|Mio\.|Bio\.|Tsd\.)[  ]?USD(?![\p{L}])/gu, `$1${NBSP}USD`],
  // D8 Prozent und Promille mit geschütztem Leerzeichen
  [/(\d)[  ]?(%|‰)/g, `$1${NBSP}$2`],
  // D11 Minuszeichen vor Zahlen
  [/(^|[\s(„])-(\d)/g, '$1−$2'],
  // D9 Bereiche: Bindestrich zwischen Ziffern → Halbgeviertstrich
  [/(\d)-(\d)/g, '$1–$2'],
  // D10 Bereich mit Prozent nur am Ende
  [/(\d) %[  ]?–[  ]?(\d) %/g, `$1–$2${NBSP}%`],
  // D12 Geviertstrich → Halbgeviertstrich mit Leerzeichen; Platzhalterzelle „—“ → „–“
  [/^\s*—\s*$/, '–'],
  [/[  ]*—[  ]*/g, ' – '],
  // D16 Abkürzungen mit geschütztem Leerzeichen
  [/\bz\.\s?B\./g, `z.${NBSP}B.`], [/\bz\.\s?T\./g, `z.${NBSP}T.`], [/\bu\.\s?a\./g, `u.${NBSP}a.`], [/\bd\.\s?h\./g, `d.${NBSP}h.`],
  [/\bi\.\s?d\.\s?R\./g, `i.${NBSP}d.${NBSP}R.`], [/\bi\.\s?d\.\s?F\./g, `i.${NBSP}d.${NBSP}F.`], [/\bi\.\s?V\.\s?m\./g, `i.${NBSP}V.${NBSP}m.`],
  [/\bp\.\s?a\./g, `p.${NBSP}a.`], [/\bp\.\s?m\./g, `p.${NBSP}m.`], [/\be\.\s?V\./g, `e.${NBSP}V.`],
  // D17 Paragraphenzeichen mit geschütztem Leerzeichen
  [/§(§?)[  ]?(\d)/g, `§$1${NBSP}$2`],
  // D20 zusammengeklebte Sätze (Ausnahmen: Produktnamen mit Punkt wie msg.Life, msg.Insurance)
  [/([a-zäöüß])\.([A-ZÄÖÜ][a-zäöüß]{2,})/g, (m, a, b, pos, ganz) => (/msg$/.test(ganz.slice(0, pos + 1)) ? m : `${a}. ${b}`)],
];

/** D14: einfache gerade Anführungszeichen um Begriffe → „…“, Apostrophe in Namen (Moody's) bleiben. */
function einfacheAnfuehrungszeichen(t) {
  const geschuetzt = t.replace(/(\p{L})'s(?![\p{L}])/gu, '$1s');
  return geschuetzt.replace(/'([\p{L}\d][^'\n]{1,80}?)'(?![\p{L}])/gu, '„$1“').replace(//g, "'");
}

function formatiereFragment(t) {
  let s = t;
  for (const [re, ersatz] of FRAGMENT_REGELN) s = s.replace(re, ersatz);
  return einfacheAnfuehrungszeichen(s);
}

/** D15: innerhalb von „…“ weitere „…“ → ‚…‘ (nur bei ausgeglichenen Paaren). */
function verschachtelteAnfuehrungszeichen(t) {
  const teile = t.split(/(<[^>]+>)/);
  const text = teile.filter((f) => !f.startsWith('<')).join('');
  const auf = (text.match(/„/g) || []).length;
  const zu = (text.match(/“/g) || []).length;
  if (auf < 2 || auf !== zu) return t;
  let tiefe = 0;
  return teile.map((f) => (f.startsWith('<') ? f : f.replace(/[„“]/g, (ch) => {
    if (ch === '„') { tiefe += 1; return tiefe > 1 ? '‚' : '„'; }
    const r = tiefe > 1 ? '‘' : '“';
    tiefe -= 1;
    return r;
  }))).join('');
}

/** Formatiert einen sichtbaren String; HTML-Tags, <code>-Formeln und Quellen-Tooltips bleiben unverändert. */
export function formatiereText(s) {
  // D13 deutsche Anführungszeichen schließen (Tags werden atomar übersprungen)
  let t = s.replace(/„((?:[^"„“<]|<[^>]*>){1,400}?)"/g, '„$1“');
  const teile = t.split(/(<[^>]+>)/);
  let inCode = false;
  let inTooltip = false;
  for (let i = 0; i < teile.length; i += 1) {
    const tok = teile[i];
    if (tok.startsWith('<')) {
      if (/^<code\b/i.test(tok)) inCode = true;
      else if (/^<\/code>/i.test(tok)) inCode = false;
      else if (/^<span class="v1x1-cite-tooltip">/.test(tok)) inTooltip = true;
      else if (inTooltip && /^<\/span>/.test(tok)) inTooltip = false;
      continue;
    }
    if (inCode || inTooltip || !tok) continue;
    teile[i] = formatiereFragment(tok);
  }
  t = teile.join('');
  return verschachtelteAnfuehrungszeichen(t);
}

/** Wendet formatiereText auf alle sichtbaren Strings eines Objektbaums an (in place). */
export function formatiereBaum(v, schluessel = '') {
  if (typeof v === 'string') return AUSGENOMMENE_SCHLUESSEL.has(schluessel) ? v : formatiereText(v);
  if (Array.isArray(v)) return v.map((x) => formatiereBaum(x, schluessel));
  if (v && typeof v === 'object') { for (const k of Object.keys(v)) v[k] = formatiereBaum(v[k], k); return v; }
  return v;
}
