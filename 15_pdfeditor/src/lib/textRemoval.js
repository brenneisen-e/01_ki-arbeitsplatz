// Entfernt den Originaltext geaenderter Bloecke wirklich aus dem Content-Stream
// der Seite, statt ihn nur weiss zu uebermalen. Sonst liegt der alte Text
// weiter im PDF: andere Editoren zeigen ihn wieder an, Suche und Kopieren
// finden ihn.
//
// Vorgehen: Der Content-Stream wird in Token zerlegt und mit Grafik- und
// Textzustand (CTM, Tm, Tf, Tc, Tw, Tz, Ts) nachgespielt. Fuer jede Glyphe
// eines Textoperators (Tj, TJ, ', ") wird ihre Lage im Nutzerraum bestimmt;
// liegt sie in einer Zeile eines zu entfernenden Blocks (gleiche Groesse,
// gleicher Winkel), wird sie aus dem Operator gestrichen und durch eine
// TJ-Verschiebung gleicher Breite ersetzt. So bleiben alle nachfolgenden
// Glyphen exakt an ihrem Platz. Alle uebrigen Bytes bleiben unveraendert.
import { PDFName, PDFArray, PDFDict, PDFNumber } from 'pdf-lib';
import { Font, FontNames } from '@pdf-lib/standard-fonts';
import { dictGet, lookup, num, nameStr, streamBytes, stripSubsetTag } from './pdfObjects.js';
import { WinAnsiEncoding, StandardEncoding } from './encodings.js';

// ---------------------------------------------------------------- Tokenizer

const WS = new Set([0, 9, 10, 12, 13, 32]);
const DELIM = new Set([40, 41, 60, 62, 91, 93, 123, 125, 47, 37]);

function isRegular(c) { return !WS.has(c) && !DELIM.has(c); }

function readLiteral(s, i) {
  // s[i] === '('
  const bytes = [];
  let depth = 1;
  i++;
  while (i < s.length) {
    const c = s.charCodeAt(i);
    if (c === 92) { // Backslash
      const n = s[i + 1];
      i += 2;
      if (n === undefined) break;
      if (n === 'n') bytes.push(10);
      else if (n === 'r') bytes.push(13);
      else if (n === 't') bytes.push(9);
      else if (n === 'b') bytes.push(8);
      else if (n === 'f') bytes.push(12);
      else if (n === '\r') { if (s[i] === '\n') i++; }
      else if (n === '\n') { /* Zeilenfortsetzung */ }
      else if (n >= '0' && n <= '7') {
        let oct = n;
        while (oct.length < 3 && s[i] >= '0' && s[i] <= '7') oct += s[i++];
        bytes.push(parseInt(oct, 8) & 0xff);
      } else bytes.push(n.charCodeAt(0));
      continue;
    }
    if (c === 40) depth++;
    else if (c === 41 && --depth === 0) { i++; break; }
    bytes.push(c);
    i++;
  }
  return { bytes, end: i };
}

function readHex(s, i) {
  // s[i] === '<'
  let j = i + 1, hex = '';
  while (j < s.length && s[j] !== '>') { if (/[0-9A-Fa-f]/.test(s[j])) hex += s[j]; j++; }
  if (hex.length % 2) hex += '0';
  const bytes = [];
  for (let k = 0; k < hex.length; k += 2) bytes.push(parseInt(hex.slice(k, k + 2), 16));
  return { bytes, end: j + 1 };
}

/** Liefert Token { type, value, start, end } fuer einen latin1-String. */
function* tokens(s) {
  let i = 0;
  while (i < s.length) {
    const c = s.charCodeAt(i);
    if (WS.has(c)) { i++; continue; }
    if (c === 37) { while (i < s.length && s[i] !== '\n' && s[i] !== '\r') i++; continue; }
    const start = i;
    if (c === 40) { const r = readLiteral(s, i); i = r.end; yield { type: 'str', value: r.bytes, start, end: i }; continue; }
    if (c === 60) {
      if (s[i + 1] === '<') { i += 2; yield { type: '<<', start, end: i }; continue; }
      const r = readHex(s, i); i = r.end; yield { type: 'str', value: r.bytes, start, end: i }; continue;
    }
    if (c === 62) { i += s[i + 1] === '>' ? 2 : 1; yield { type: '>>', start, end: i }; continue; }
    if (c === 91 || c === 93 || c === 123 || c === 125) { i++; yield { type: s[start], start, end: i }; continue; }
    if (c === 47) {
      i++;
      while (i < s.length && isRegular(s.charCodeAt(i))) i++;
      yield { type: 'name', value: s.slice(start + 1, i), start, end: i };
      continue;
    }
    while (i < s.length && isRegular(s.charCodeAt(i))) i++;
    if (i === start) { i++; continue; }
    const word = s.slice(start, i);
    if (/^[+-]?(\d+\.?\d*|\.\d+)$/.test(word)) { yield { type: 'num', value: Number(word), start, end: i }; continue; }
    if (word === 'true' || word === 'false' || word === 'null') { yield { type: 'lit', value: word, start, end: i }; continue; }
    if (word === 'ID') {
      // Inline-Bild: Binaerdaten bis zum freistehenden EI ueberspringen.
      let j = i + 1;
      const re = /[\0\t\n\f\r ]EI(?=[\0\t\n\f\r ]|$)/g;
      re.lastIndex = j;
      const m = re.exec(s);
      i = m ? m.index + 3 : s.length;
      yield { type: 'op', value: 'EI', start, end: i };
      continue;
    }
    yield { type: 'op', value: word, start, end: i };
  }
}

// ---------------------------------------------------------------- Schriften

const STD_NAMES = {
  helvetica: FontNames.Helvetica, 'helvetica-bold': FontNames.HelveticaBold,
  'helvetica-oblique': FontNames.HelveticaOblique, 'helvetica-boldoblique': FontNames.HelveticaBoldOblique,
  'times-roman': FontNames.TimesRoman, 'times-bold': FontNames.TimesRomanBold,
  'times-italic': FontNames.TimesRomanItalic, 'times-bolditalic': FontNames.TimesRomanBoldItalic,
  courier: FontNames.Courier, 'courier-bold': FontNames.CourierBold,
  'courier-oblique': FontNames.CourierOblique, 'courier-boldoblique': FontNames.CourierBoldOblique,
  symbol: FontNames.Symbol, zapfdingbats: FontNames.ZapfDingbats,
  arial: FontNames.Helvetica, 'arial,bold': FontNames.HelveticaBold, 'arial-boldmt': FontNames.HelveticaBold,
  arialmt: FontNames.Helvetica, timesnewroman: FontNames.TimesRoman, timesnewromanpsmt: FontNames.TimesRoman,
};

function stdMetrics(baseFont) {
  const n = stripSubsetTag(baseFont).toLowerCase();
  const name = STD_NAMES[n] || STD_NAMES[n.replace(/[\s,]/g, '')];
  if (!name) return null;
  try { return Font.load(name); } catch { return null; }
}

/**
 * Beschreibt, wie die Bytes eines Strings in Glyphen zerfallen und wie breit
 * diese sind (in Textraum-Einheiten je 1 pt Schriftgroesse). null, wenn die
 * Schrift sich nicht sicher zerlegen laesst — dann bleibt ihr Text unangetastet.
 */
function fontInfo(ctx, fontDict) {
  if (!(fontDict instanceof PDFDict)) return null;
  const subtype = nameStr(dictGet(ctx, fontDict, 'Subtype')) || '';
  if (subtype === 'Type0') {
    const enc = nameStr(dictGet(ctx, fontDict, 'Encoding'));
    if (enc !== 'Identity-H') return null;
    const desc = dictGet(ctx, fontDict, 'DescendantFonts');
    const cid = desc instanceof PDFArray ? lookup(ctx, desc.get(0)) : null;
    if (!(cid instanceof PDFDict)) return null;
    const dw = num(dictGet(ctx, cid, 'DW'), 1000);
    const widths = new Map();
    const w = dictGet(ctx, cid, 'W');
    if (w instanceof PDFArray) {
      const items = [];
      for (let i = 0; i < w.size(); i++) items.push(lookup(ctx, w.get(i)));
      for (let i = 0; i < items.length;) {
        const a = items[i], b = items[i + 1];
        if (!(a instanceof PDFNumber)) { i++; continue; }
        if (b instanceof PDFArray) {
          let c = a.asNumber();
          for (let j = 0; j < b.size(); j++) widths.set(c++, num(lookup(ctx, b.get(j)), dw));
          i += 2;
        } else if (b instanceof PDFNumber && items[i + 2] instanceof PDFNumber) {
          const to = b.asNumber(), v = items[i + 2].asNumber();
          for (let c = a.asNumber(); c <= to && widths.size < 200000; c++) widths.set(c, v);
          i += 3;
        } else i++;
      }
    }
    return { bytesPerCode: 2, width: (code) => (widths.has(code) ? widths.get(code) : dw) / 1000 };
  }

  const descriptor = dictGet(ctx, fontDict, 'FontDescriptor');
  const missing = num(dictGet(ctx, descriptor, 'MissingWidth'), 0);
  let scale = 1 / 1000;
  if (subtype === 'Type3') {
    const fm = dictGet(ctx, fontDict, 'FontMatrix');
    scale = fm instanceof PDFArray ? num(lookup(ctx, fm.get(0)), 0.001) : 0.001;
  }
  const wArr = dictGet(ctx, fontDict, 'Widths');
  if (wArr instanceof PDFArray) {
    const first = num(dictGet(ctx, fontDict, 'FirstChar'), 0);
    const list = [];
    for (let i = 0; i < wArr.size(); i++) list.push(num(lookup(ctx, wArr.get(i)), missing));
    return { bytesPerCode: 1, width: (code) => (code >= first && code - first < list.length ? list[code - first] : missing) * scale };
  }
  // Standard-14-Schrift ohne Widths: Metriken aus den AFM-Daten.
  const metrics = stdMetrics(nameStr(dictGet(ctx, fontDict, 'BaseFont')) || '');
  if (!metrics) return null;
  const encObj = dictGet(ctx, fontDict, 'Encoding');
  let table = /symbol|dingbat/i.test(metrics.FontName) ? null : StandardEncoding;
  const diffs = [];
  const baseName = encObj instanceof PDFName ? encObj.decodeText() : nameStr(dictGet(ctx, encObj, 'BaseEncoding'));
  if (baseName === 'WinAnsiEncoding') table = WinAnsiEncoding;
  if (encObj instanceof PDFDict) {
    const d = dictGet(ctx, encObj, 'Differences');
    if (d instanceof PDFArray) {
      let code = 0;
      for (let i = 0; i < d.size(); i++) {
        const el = lookup(ctx, d.get(i));
        if (el instanceof PDFNumber) code = el.asNumber();
        else if (el instanceof PDFName) diffs[code++] = el.decodeText();
      }
    }
  }
  const builtIn = new Map();
  for (const m of metrics.CharMetrics) if (m.C >= 0) builtIn.set(m.C, m.WX);
  return {
    bytesPerCode: 1,
    width: (code) => {
      const g = diffs[code] || (table ? table[code] : null);
      let wx = g ? metrics.getWidthOfGlyph(g) : builtIn.get(code);
      if (wx === undefined) wx = builtIn.get(code);
      return (wx === undefined ? 500 : wx) / 1000;
    },
  };
}

// ---------------------------------------------------------------- Matrizen

const mul = (m, n) => [
  m[0] * n[0] + m[1] * n[2], m[0] * n[1] + m[1] * n[3],
  m[2] * n[0] + m[3] * n[2], m[2] * n[1] + m[3] * n[3],
  m[4] * n[0] + m[5] * n[2] + n[4], m[4] * n[1] + m[5] * n[3] + n[5],
];
const apply = (m, x, y) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
const ID = [1, 0, 0, 1, 0, 0];

function hex(bytes) {
  let s = '';
  for (const b of bytes) s += (b < 16 ? '0' : '') + b.toString(16);
  return '<' + s.toUpperCase() + '>';
}
const fmt = (v) => (Math.abs(v) < 1e-6 ? '0' : String(Math.round(v * 1000) / 1000));

// ---------------------------------------------------------------- Kern

/**
 * Entfernt Glyphen aus einem Content-Stream.
 * @param content latin1-String des Content-Streams
 * @param fonts   (resourceName) => fontInfo | null
 * @param zones   [{ x, y, width, size, angle, fontName? }] Zeilen im Nutzerraum;
 *                fontName (BaseFont ohne Subset-Kennung) schraenkt auf eine
 *                Schrift ein, damit Nachbartext gleicher Groesse bleibt
 * @returns { content, removed: number[] } removed zaehlt Glyphen je Zone
 */
export function stripGlyphs(content, fonts, zones) {
  const removed = zones.map(() => 0);
  const zoneData = zones.map(z => ({ ...z, cos: Math.cos(z.angle || 0), sin: Math.sin(z.angle || 0) }));
  const hit = (m, adv, size, angle, fontName) => {
    // m: Glyphenmatrix im Nutzerraum (Ursprung = Grundlinie links)
    const [ox, oy] = apply(m, 0, 0);
    const [mx, my] = apply(m, adv / 2, 0);
    for (let k = 0; k < zoneData.length; k++) {
      const z = zoneData[k];
      if (Math.abs(size - z.size) > 0.12 * z.size) continue;
      if (z.fontName && fontName && z.fontName !== fontName) continue;
      let da = Math.abs(angle - (z.angle || 0)) % (2 * Math.PI);
      if (Math.min(da, 2 * Math.PI - da) > 0.03) continue;
      const u = (mx - z.x) * z.cos + (my - z.y) * z.sin;
      const v = -(oy - z.y) * z.cos + (ox - z.x) * z.sin;
      const pad = 0.15 * z.size;
      if (u < -pad || u > z.width + pad) continue;
      if (Math.abs(v) > 0.3 * z.size) continue;
      return k;
    }
    return -1;
  };

  const out = [];
  let last = 0;
  const gsStack = [];
  let ctm = ID;
  let ts = { font: null, size: 0, tc: 0, tw: 0, th: 1, tl: 0, rise: 0 };
  let tm = ID, tlm = ID;
  const operands = [];
  const arrayStack = [];
  let dictDepth = 0;

  const nextLine = () => { tlm = mul([1, 0, 0, 1, 0, -ts.tl], tlm); tm = tlm; };

  // Spielt einen Textoperator nach; liefert den Ersatz-Quelltext (TJ-Array)
  // oder null, wenn nichts entfernt wurde.
  const show = (parts) => {
    const info = ts.font ? fonts(ts.font) : null;
    const newParts = [];
    let changed = false;
    for (const p of parts) {
      if (typeof p === 'number') {
        tm = mul([1, 0, 0, 1, -p / 1000 * ts.size * ts.th, 0], tm);
        newParts.push(p);
        continue;
      }
      if (!info) {
        // Unbekannte Schrift: Breite nicht bestimmbar, Operator unveraendert.
        return { unknown: true };
      }
      const bpc = info.bytesPerCode;
      let kept = [];
      for (let i = 0; i + bpc <= p.length; i += bpc) {
        let code = 0;
        for (let b = 0; b < bpc; b++) code = code * 256 + p[i + b];
        const w0 = info.width(code);
        const tx = (w0 * ts.size + ts.tc + (bpc === 1 && code === 32 ? ts.tw : 0)) * ts.th;
        const trm = mul([ts.size * ts.th, 0, 0, ts.size, 0, ts.rise], mul(tm, ctm));
        const size = Math.hypot(trm[2], trm[3]);
        const angle = Math.atan2(trm[1], trm[0]);
        const adv = ts.size ? tx / (ts.size * ts.th || 1) : 0;
        const k = size > 0.01 ? hit(trm, adv, size, angle, info.name) : -1;
        if (k >= 0 && ts.size) {
          removed[k]++;
          changed = true;
          if (kept.length) { newParts.push(kept); kept = []; }
          newParts.push(-(tx / ts.th) / ts.size * 1000);
        } else {
          for (let b = 0; b < bpc; b++) kept.push(p[i + b]);
        }
        tm = mul([1, 0, 0, 1, tx, 0], tm);
      }
      if (kept.length) newParts.push(kept);
    }
    if (!changed) return null;
    // Aufeinanderfolgende Verschiebungen zusammenfassen.
    const merged = [];
    for (const p of newParts) {
      if (typeof p === 'number' && typeof merged[merged.length - 1] === 'number') merged[merged.length - 1] += p;
      else merged.push(p);
    }
    return '[' + merged.map(p => (typeof p === 'number' ? fmt(p) : hex(p))).join(' ') + '] TJ';
  };

  for (const t of tokens(content)) {
    if (t.type === '<<') { dictDepth++; operands.push(t); continue; }
    if (t.type === '>>') { dictDepth = Math.max(0, dictDepth - 1); operands.push(t); continue; }
    if (t.type === '[') { arrayStack.push([]); operands.push(t); continue; }
    if (t.type === ']') {
      const arr = arrayStack.pop() || [];
      // Array-Inhalt ersetzt die Einzeltoken ab '['
      let j = operands.length - 1;
      while (j >= 0 && operands[j].type !== '[') j--;
      const open = operands[j] || t;
      operands.length = Math.max(0, j);
      operands.push({ type: 'array', value: arr, start: open.start, end: t.end });
      if (arrayStack.length) arrayStack[arrayStack.length - 1].push(null); // verschachtelt: fuer TJ ohne Belang
      continue;
    }
    if (t.type !== 'op') {
      if (arrayStack.length && !dictDepth) arrayStack[arrayStack.length - 1].push(t.type === 'str' || t.type === 'num' ? t.value : null);
      operands.push(t);
      continue;
    }
    if (dictDepth || arrayStack.length) { operands.push(t); continue; }

    const op = t.value;
    const nums = operands.filter(o => o.type === 'num').map(o => o.value);
    const opStart = operands.length ? operands[0].start : t.start;
    let replacement = null;

    switch (op) {
      case 'q': gsStack.push({ ctm, ts: { ...ts } }); break;
      case 'Q': { const g = gsStack.pop(); if (g) { ctm = g.ctm; ts = g.ts; } break; }
      case 'cm': if (nums.length === 6) ctm = mul(nums, ctm); break;
      case 'BT': tm = ID; tlm = ID; break;
      case 'Tf': {
        const n = operands.find(o => o.type === 'name');
        ts.font = n ? n.value : null;
        ts.size = nums.length ? nums[nums.length - 1] : 0;
        break;
      }
      case 'Tc': if (nums.length) ts.tc = nums[0]; break;
      case 'Tw': if (nums.length) ts.tw = nums[0]; break;
      case 'Tz': if (nums.length) ts.th = nums[0] / 100; break;
      case 'TL': if (nums.length) ts.tl = nums[0]; break;
      case 'Ts': if (nums.length) ts.rise = nums[0]; break;
      case 'Td': if (nums.length === 2) { tlm = mul([1, 0, 0, 1, nums[0], nums[1]], tlm); tm = tlm; } break;
      case 'TD': if (nums.length === 2) { ts.tl = -nums[1]; tlm = mul([1, 0, 0, 1, nums[0], nums[1]], tlm); tm = tlm; } break;
      case 'Tm': if (nums.length === 6) { tlm = nums.slice(); tm = tlm; } break;
      case 'T*': nextLine(); break;
      case 'Tj': case "'": case '"': {
        let prefix = '';
        if (op === '"' && nums.length >= 2) { ts.tw = nums[0]; ts.tc = nums[1]; prefix = `${fmt(nums[0])} Tw ${fmt(nums[1])} Tc `; }
        if (op !== 'Tj') { nextLine(); prefix += 'T* '; }
        const s = operands.find(o => o.type === 'str');
        if (s) {
          const r = show([s.value]);
          if (typeof r === 'string') replacement = prefix + r;
        }
        break;
      }
      case 'TJ': {
        const a = operands.find(o => o.type === 'array');
        if (a) {
          const parts = a.value.filter(v => v !== null);
          const r = show(parts);
          if (typeof r === 'string') replacement = r;
        }
        break;
      }
      default: break;
    }

    if (replacement !== null) {
      out.push(content.slice(last, opStart), replacement);
      last = t.end;
    }
    operands.length = 0;
  }
  out.push(content.slice(last));
  return { content: out.join(''), removed };
}

function latin1(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return s;
}

function fromLatin1(s) {
  const b = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i) & 0xff;
  return b;
}

/**
 * Entfernt die Glyphen der angegebenen Zeilen aus dem Seiteninhalt (nur der
 * Content-Stream der Seite; Text in Form-XObjects bleibt unberuehrt).
 * @returns removed-Zaehler je Zone (0 = nichts gefunden, Aufrufer deckt ab)
 */
export function removeTextFromPage(page, zones) {
  if (!zones.length) return [];
  const ctx = page.doc.context;
  const raw = page.node.get(PDFName.of('Contents'));
  const contents = lookup(ctx, raw);
  const streams = contents instanceof PDFArray
    ? Array.from({ length: contents.size() }, (_, i) => contents.get(i))
    : raw ? [raw] : [];
  const parts = [];
  for (const s of streams) {
    const b = streamBytes(ctx, s);
    if (!b) return zones.map(() => 0);
    parts.push(latin1(b));
  }
  const text = parts.join('\n');

  let res;
  try { res = page.node.getInheritableAttribute(PDFName.of('Resources')); } catch { res = page.node.get(PDFName.of('Resources')); }
  const fontDict = dictGet(ctx, lookup(ctx, res), 'Font');
  const cache = new Map();
  const fonts = (name) => {
    if (!cache.has(name)) {
      let info = null;
      try {
        const dict = dictGet(ctx, fontDict, name);
        info = fontInfo(ctx, dict);
        if (info) info.name = stripSubsetTag(nameStr(dictGet(ctx, dict, 'BaseFont')) || '') || null;
      } catch (e) { console.warn('Schrift nicht lesbar', name, e); }
      cache.set(name, info);
    }
    return cache.get(name);
  };

  const { content, removed } = stripGlyphs(text, fonts, zones);
  if (removed.some(n => n > 0)) {
    const stream = ctx.flateStream(fromLatin1(content));
    page.node.set(PDFName.of('Contents'), ctx.register(stream));
  }
  return removed;
}

