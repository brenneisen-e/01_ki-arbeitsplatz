// ===========================================================================
// text.js — Textwerkzeuge: HTML entfernen, Wörter zählen, Lesezeit, Slugs.
// Alle Funktionen sind rein und ohne DOM-Zugriff (auch für Skripte nutzbar).
// ===========================================================================

const ENTITAETEN = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'",
  '&nbsp;': '\u00a0', '&ndash;': '\u2013', '&mdash;': '\u2014', '&euro;': '\u20ac', '&shy;': '',
  '&auml;': 'ä', '&ouml;': 'ö', '&uuml;': 'ü', '&Auml;': 'Ä', '&Ouml;': 'Ö', '&Uuml;': 'Ü', '&szlig;': 'ß',
  '&hellip;': '\u2026', '&laquo;': '\u00ab', '&raquo;': '\u00bb', '&bdquo;': '\u201e', '&ldquo;': '\u201c', '&rdquo;': '\u201d',
};

/** Löst eine benannte oder numerische Entity auf; Unbekanntes bleibt stehen. */
function entity(e) {
  if (ENTITAETEN[e] !== undefined) return ENTITAETEN[e];
  const num = e.match(/^&#(x?)([0-9a-f]+);$/i);
  if (num) {
    const code = parseInt(num[2], num[1] ? 16 : 10);
    return Number.isFinite(code) ? String.fromCodePoint(code) : e;
  }
  return e;
}

// Der Quellenverweis der Daten ist ein Span mit zwei inneren Spans (Nummer,
// Quellentext). Für Lesetext, Suche und Begriffssuche fällt er ganz weg.
const QUELLE = /<span class="v1x1-cite">(?:<span class="v1x1-cite-[a-z]+">[^<]*<\/span>)*<\/span>/g;

/**
 * Entfernt HTML-Auszeichnung und Quellenverweise, löst die gängigen Entities
 * auf und glättet Leerraum.
 * @param {string} html
 * @returns {string}
 */
export function entferneHtml(html) {
  if (html == null) return '';
  return String(html)
    .replace(QUELLE, ' ')
    // weiche Trennstriche sind unsichtbar (U+00AD in langen Komposita der
    // Grafiktitel) — sie dürfen weder Suche noch Wortzählung stören
    .replace(/\u00ad/g, '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|li|div|tr|h[1-6])>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&#?[a-z0-9]+;/gi, entity)
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Zählt Wörter (Folgen von Nicht-Leerraum). HTML wird vorher entfernt.
 * @param {string} text
 * @returns {number}
 */
export function woerter(text) {
  const rein = entferneHtml(text);
  if (!rein) return 0;
  return rein.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

/**
 * Sammelt den sichtbaren Text eines Inhaltsblocks (alle Typen), z. B. für
 * Lesezeit, Suche und Begriffssuche. Unbekannte Felder werden ignoriert.
 * @param {object} block
 * @returns {string}
 */
export function blockText(block) {
  if (!block || typeof block !== 'object') return '';
  const teile = [];
  const nimm = (x) => {
    if (typeof x === 'string') teile.push(x);
    else if (Array.isArray(x)) x.forEach(nimm);
    else if (x && typeof x === 'object' && typeof x.text === 'string') teile.push(x.text);
  };
  nimm(block.title);
  nimm(block.untertitel);
  nimm(block.caption);
  nimm(block.content);
  nimm(block.text);
  nimm(block.headers);
  nimm(block.kopf);
  nimm(block.columns);
  nimm(block.rows);
  for (const i of block.items || []) { nimm(i.title); nimm(i.description); }
  for (const e of block.events || []) { nimm(e.year); nimm(e.title); nimm(e.description); }
  for (const s of block.steps || []) { nimm(s.label); nimm(s.description); }
  for (const l of block.levels || []) { nimm(l.label); nimm(l.items); }
  // Grafiken des Sektortrainings: archetypenKarte, stufenTabelle,
  // morphologischerKasten, formelAufbau, simulationGrosseZahlen, risikokette,
  // prozessKette. Ihr sichtbarer Text steckt in eigenen Feldern; ohne diese
  // Zeilen unterschätzen Lesezeit, Suchindex und „Auf dieser Seite“ die Grafiken.
  for (const sp of block.spalten || []) {
    nimm(sp.titel); nimm(sp.hinweis);
    for (const g of sp.gruppen || []) { nimm(g.titel); nimm(g.text); }
  }
  if (block.mitte) { nimm(block.mitte.titel); nimm(block.mitte.text); }
  for (const b of block.beziehungen || []) { nimm(b.von); nimm(b.nach); }
  for (const z of block.zeilen || []) { nimm(z.text); nimm(z.bedeutung); nimm(z.formel); }
  for (const d of block.dimensionen || []) {
    nimm(d.titel);
    for (const o of d.optionen || []) nimm(o.label);
  }
  for (const b of block.beispiele || []) {
    nimm(b.titel); nimm(b.text);
    if (b.ergebnis) { nimm(b.ergebnis.titel); nimm(b.ergebnis.punkte); }
  }
  for (const g of block.glieder || []) { nimm(g.name); nimm(g.text); nimm(g.beispiel); }
  if (block.ergebnis && !Array.isArray(block.ergebnis)) { nimm(block.ergebnis.name); nimm(block.ergebnis.text); }
  nimm(block.erklaerung);
  for (const s of block.stufen || []) { nimm(s.titel); nimm(s.text); nimm(s.traegt); nimm(s.beispiel); nimm(s.uebergang); }
  for (const k of block.kern || []) {
    nimm(k.titel); nimm(k.text); nimm(k.aufgaben); nimm(k.projektfelder);
    for (const z of k.kennzahlen || []) { nimm(z.label); nimm(z.wert); }
  }
  for (const s of block.support || []) { nimm(s.titel); nimm(s.text); }
  nimm(block.fussnote);
  return entferneHtml(teile.join(' '));
}

/**
 * Lesezeit in Minuten bei 200 Wörtern pro Minute, aufgerundet, mindestens 1.
 * Nimmt eine Liste von Blöcken oder von Einträgen `{ block }` (alleBloecke).
 * @param {Array<object>} bloecke
 * @returns {number}
 */
export function lesezeitMinuten(bloecke) {
  const liste = Array.isArray(bloecke) ? bloecke : [];
  const anzahl = liste.reduce((summe, eintrag) => {
    const block = eintrag && eintrag.block ? eintrag.block : eintrag;
    return summe + woerter(blockText(block));
  }, 0);
  return Math.max(1, Math.ceil(anzahl / 200));
}

/**
 * ASCII-Slug: ä→ae, ö→oe, ü→ue, ß→ss, sonstige Diakritika entfernt,
 * alles außer a–z und 0–9 wird zu „-“.
 * @param {string} text
 * @returns {string}
 */
export function slug(text) {
  return String(text ?? '')
    .replace(/\u00ad/g, '')
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' und ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Kürzt auf höchstens n Zeichen an einer Wortgrenze und hängt „…“ an.
 * @param {string} text
 * @param {number} n
 * @returns {string}
 */
export function kuerze(text, n = 120) {
  const rein = entferneHtml(text);
  if (rein.length <= n) return rein;
  const schnitt = rein.slice(0, n + 1);
  const grenze = schnitt.lastIndexOf(' ');
  return (grenze > n * 0.6 ? schnitt.slice(0, grenze) : rein.slice(0, n)).replace(/[,;:–-]$/, '') + ' …';
}

/**
 * Faltet Umlaute und ß für tolerante Vergleiche („Solvency“ findet „Solvency“,
 * „muller“ findet „Müller“). Ergebnis ist kleingeschrieben.
 * @param {string} text
 * @returns {string}
 */
export function falte(text) {
  return String(text ?? '')
    .replace(/\u00ad/g, '')
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/** Kapitelnummer zweistellig: 1 → „01“. */
export function nummer(index) {
  return String(index + 1).padStart(2, '0');
}
