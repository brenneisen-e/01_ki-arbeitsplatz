// Baut aus einem Font-Dictionary des PDFs einen "Encoder": Er weiss, welche
// Unicode-Zeichen die eingebettete Schrift darstellen kann, wie diese Zeichen
// als Bytes im Content-Stream kodiert werden muessen und wie breit sie sind.
// Damit koennen wir geaenderten Text mit exakt derselben Schriftressource
// schreiben, die das PDF ohnehin schon enthaelt.
import { PDFName, PDFDict, PDFArray, PDFNumber, PDFStream } from 'pdf-lib';
import { parseToUnicodeCMap } from './cmap.js';
import { WinAnsiEncoding, MacRomanEncoding, StandardEncoding, getGlyphMap } from './encodings.js';
import { dictGet, lookup, num, nameStr, streamText } from './pdfObjects.js';

function glyphNameToUnicode(name) {
  if (!name) return null;
  const map = getGlyphMap();
  if (map.has(name)) return String.fromCodePoint(map.get(name));
  let m = /^uni([0-9A-Fa-f]{4})/.exec(name);
  if (m) return String.fromCodePoint(parseInt(m[1], 16));
  m = /^u([0-9A-Fa-f]{4,6})$/.exec(name);
  if (m) return String.fromCodePoint(parseInt(m[1], 16));
  if (name.length === 1) return name;
  return null;
}

let winAnsiSet = null;
/** Menge der Unicode-Codepoints, die die Standard-14-Schriften (WinAnsi) abdecken. */
export function winAnsiCharset() {
  if (!winAnsiSet) {
    winAnsiSet = new Set();
    for (const g of WinAnsiEncoding) { const u = glyphNameToUnicode(g); if (u) winAnsiSet.add(u.codePointAt(0)); }
  }
  return winAnsiSet;
}

function encodingTable(name) {
  switch (name) {
    case 'WinAnsiEncoding': return WinAnsiEncoding;
    case 'MacRomanEncoding': return MacRomanEncoding;
    case 'StandardEncoding': return StandardEncoding;
    default: return null;
  }
}

function toHex(bytes) {
  let s = '';
  for (const b of bytes) s += (b < 16 ? '0' : '') + b.toString(16);
  return s.toUpperCase();
}

// Ersetzt typografische Varianten, die in eingebetteten Teilmengen oft fehlen,
// durch schlichte Entsprechungen (nur wenn das Original fehlt).
const ALTERNATIVES = {
  ' ': ' ', ' ': ' ', ' ': ' ', '\t': ' ',
  '’': "'", '‘': "'", '“': '"', '”': '"', '„': '"',
  '–': '-', '—': '-', '−': '-', '…': '...',
};

function styleFromName(baseFont, flags, descriptor, ctx) {
  const n = (baseFont || '').toLowerCase();
  const stemV = num(dictGet(ctx, descriptor, 'StemV'), 0);
  const weight = num(dictGet(ctx, descriptor, 'FontWeight'), 0);
  const bold = /bold|black|heavy|semibold|demibold|extrabold/.test(n) || weight >= 600 || (weight === 0 && stemV >= 120 && !/light|regular/.test(n)) || !!(flags & (1 << 18));
  const italic = /italic|oblique/.test(n) || !!(flags & 64);
  const mono = !!(flags & 1) || /courier|mono|consolas|menlo/.test(n);
  const serif = !mono && (!!(flags & 2) || /times|georgia|garamond|cambria|book|serif|palatino|minion|baskerville|didot|century/.test(n)) && !/sans/.test(n);
  return { bold, italic, mono, serif };
}

function parseWidthsArray(ctx, arr, firstChar, missingWidth) {
  if (!(arr instanceof PDFArray)) return null;
  const widths = new Map();
  for (let i = 0; i < arr.size(); i++) {
    widths.set(firstChar + i, num(lookup(ctx, arr.get(i)), missingWidth));
  }
  return widths;
}

function parseCidWidths(ctx, w) {
  const widths = new Map();
  if (!(w instanceof PDFArray)) return widths;
  const items = [];
  for (let i = 0; i < w.size(); i++) items.push(lookup(ctx, w.get(i)));
  let i = 0;
  while (i < items.length) {
    const a = items[i];
    if (!(a instanceof PDFNumber)) { i++; continue; }
    const b = items[i + 1];
    if (b instanceof PDFArray) {
      let c = a.asNumber();
      for (let j = 0; j < b.size(); j++) widths.set(c++, num(lookup(ctx, b.get(j)), 0));
      i += 2;
    } else if (b instanceof PDFNumber && items[i + 2] instanceof PDFNumber) {
      const from = a.asNumber(), to = b.asNumber(), wv = items[i + 2].asNumber();
      for (let c = from; c <= to && c - from < 65536; c++) widths.set(c, wv);
      i += 3;
    } else {
      i++;
    }
  }
  return widths;
}

function readToUnicode(ctx, fontDict) {
  const tu = dictGet(ctx, fontDict, 'ToUnicode');
  if (!(tu instanceof PDFStream)) return null;
  const text = streamText(ctx, tu);
  if (!text) return null;
  try { return parseToUnicodeCMap(text); } catch (e) { console.warn('ToUnicode-CMap unlesbar', e); return null; }
}

function metrics(ctx, descriptor) {
  let ascent = num(dictGet(ctx, descriptor, 'Ascent'), 0) / 1000;
  let descent = num(dictGet(ctx, descriptor, 'Descent'), 0) / 1000;
  if (!(ascent > 0.3 && ascent < 1.5)) ascent = 0.9;
  if (!(descent < 0 && descent > -0.7)) descent = -0.22;
  return { ascent, descent };
}

/**
 * Baut den Encoder fuer ein Font-Dictionary.
 * @param ctx pdf-lib PDFContext
 * @param fontDict PDFDict der Schrift
 * @param stdFontProvider (baseFont) => pdf-lib PDFFont | null fuer Standard-14-Schriften ohne Widths
 * @returns Encoder oder null, wenn die Schrift nicht wiederverwendbar ist
 */
export function buildEncoder(ctx, fontDict, stdFontProvider) {
  if (!(fontDict instanceof PDFDict)) return null;
  const subtype = nameStr(dictGet(ctx, fontDict, 'Subtype')) || '';
  const baseFont = nameStr(dictGet(ctx, fontDict, 'BaseFont')) || '';
  if (subtype === 'Type3') return null;
  const descriptorTest = dictGet(ctx, fontDict, 'FontDescriptor');
  if (!(descriptorTest instanceof PDFDict) && /symbol|dingbat/i.test(baseFont)) return null;
  if (subtype === 'Type0') return buildType0(ctx, fontDict, baseFont);
  return buildSimple(ctx, fontDict, baseFont, subtype, stdFontProvider);
}

function finish(common, uniToCode, byteLen, widthOfCode, defaultWidth) {
  const keys = [...uniToCode.keys()];
  const maxKeyLen = keys.reduce((m, k) => Math.max(m, k.length), 1);

  function tokenize(text) {
    // Greedy: laengste passende Zeichenfolge zuerst (Ligaturen wie "fi").
    const out = [];
    let i = 0;
    while (i < text.length) {
      let matched = false;
      for (let len = Math.min(maxKeyLen, text.length - i); len >= 1; len--) {
        const key = text.substr(i, len);
        if (uniToCode.has(key)) { out.push({ ch: key, code: uniToCode.get(key) }); i += len; matched = true; break; }
      }
      if (matched) continue;
      const cp = text.codePointAt(i);
      const ch = String.fromCodePoint(cp);
      const alt = ALTERNATIVES[ch];
      if (alt !== undefined && [...alt].every(a => uniToCode.has(a))) {
        for (const a of alt) out.push({ ch: a, code: uniToCode.get(a) });
      } else {
        out.push({ ch, code: null });
      }
      i += ch.length;
    }
    return out;
  }

  return {
    ...common,
    analyze(text) {
      const missing = [];
      for (const t of tokenize(text)) if (t.code === null && !missing.includes(t.ch) && t.ch !== '\n' && t.ch !== '\r') missing.push(t.ch);
      return { ok: missing.length === 0, missing };
    },
    encodeHex(text) {
      const bytes = [];
      for (const t of tokenize(text)) {
        if (t.code === null) continue;
        for (let b = byteLen - 1; b >= 0; b--) bytes.push((t.code >> (8 * b)) & 0xff);
      }
      return toHex(bytes);
    },
    widthOf(text, size) {
      let w = 0;
      for (const t of tokenize(text)) {
        if (t.code === null) { w += defaultWidth * t.ch.length; continue; }
        const cw = widthOfCode(t.code, t.ch);
        w += (cw === undefined ? defaultWidth : cw);
      }
      return w / 1000 * size;
    },
  };
}

function buildSimple(ctx, fontDict, baseFont, subtype, stdFontProvider) {
  const descriptor = dictGet(ctx, fontDict, 'FontDescriptor');
  const flags = num(dictGet(ctx, descriptor, 'Flags'), 0);
  const symbolic = !!(flags & 4) && !(flags & 32);
  const embedded = descriptor instanceof PDFDict && ['FontFile', 'FontFile2', 'FontFile3'].some(k => descriptor.has(PDFName.of(k)));
  const style = styleFromName(baseFont, flags, descriptor, ctx);
  const { ascent, descent } = metrics(ctx, descriptor);

  const tu = readToUnicode(ctx, fontDict);
  const encObj = dictGet(ctx, fontDict, 'Encoding');
  let base = null;
  let differences = null;
  if (encObj instanceof PDFName) {
    base = encodingTable(encObj.decodeText());
  } else if (encObj instanceof PDFDict) {
    base = encodingTable(nameStr(dictGet(ctx, encObj, 'BaseEncoding')));
    const diff = dictGet(ctx, encObj, 'Differences');
    if (diff instanceof PDFArray) {
      differences = [];
      let code = 0;
      for (let i = 0; i < diff.size(); i++) {
        const el = lookup(ctx, diff.get(i));
        if (el instanceof PDFNumber) code = el.asNumber();
        else if (el instanceof PDFName) differences[code++] = el.decodeText();
      }
    }
  }
  if (!base && !(symbolic && embedded)) base = StandardEncoding;

  const codeToUni = new Map();
  if (base) for (let c = 0; c < 256; c++) { const u = glyphNameToUnicode(base[c]); if (u) codeToUni.set(c, u); }
  if (differences) differences.forEach((g, c) => { const u = glyphNameToUnicode(g); if (u) codeToUni.set(c, u); else codeToUni.delete(c); });
  if (tu) for (const [c, u] of tu.codeToUni) if (c < 256 && u) codeToUni.set(c, u);
  if (codeToUni.size === 0) return null;

  const firstChar = num(dictGet(ctx, fontDict, 'FirstChar'), 0);
  const missingWidth = num(dictGet(ctx, descriptor, 'MissingWidth'), 0);
  const widths = parseWidthsArray(ctx, dictGet(ctx, fontDict, 'Widths'), firstChar, missingWidth);
  let stdFont = null;
  if (!widths && !embedded && stdFontProvider) stdFont = stdFontProvider(baseFont);
  const stdChars = stdFont ? winAnsiCharset() : null;

  const available = (code, u) => {
    if (widths) return (widths.get(code) || 0) > 0 || u === ' ';
    if (stdChars) return stdChars.has(u.codePointAt(0));
    return true;
  };
  const uniToCode = new Map();
  for (const [c, u] of codeToUni) {
    if (!available(c, u)) continue;
    if (!uniToCode.has(u)) uniToCode.set(u, c);
  }
  if (uniToCode.size === 0) return null;

  const widthOfCode = (code, ch) => {
    if (widths) return widths.get(code);
    if (stdFont) { try { return stdFont.widthOfTextAtSize(ch, 1000); } catch { return undefined; } }
    return undefined;
  };
  return finish({ kind: 'simple', subtype, baseFont, embedded, symbolic, ascent, descent, ...style }, uniToCode, 1, widthOfCode, 500);
}

function buildType0(ctx, fontDict, baseFont) {
  const encObj = dictGet(ctx, fontDict, 'Encoding');
  if (nameStr(encObj) !== 'Identity-H') return null;
  const desc = dictGet(ctx, fontDict, 'DescendantFonts');
  const cidFont = desc instanceof PDFArray ? lookup(ctx, desc.get(0)) : null;
  if (!(cidFont instanceof PDFDict)) return null;
  const descriptor = dictGet(ctx, cidFont, 'FontDescriptor');
  const flags = num(dictGet(ctx, descriptor, 'Flags'), 0);
  const style = styleFromName(baseFont, flags, descriptor, ctx);
  const { ascent, descent } = metrics(ctx, descriptor);
  const tu = readToUnicode(ctx, fontDict);
  if (!tu || tu.codeToUni.size === 0) return null;
  const byteLen = tu.codeLengths.size ? Math.max(...tu.codeLengths) : 2;
  const dw = num(dictGet(ctx, cidFont, 'DW'), 1000);
  const widths = parseCidWidths(ctx, dictGet(ctx, cidFont, 'W'));

  const uniToCode = new Map();
  for (const [c, u] of tu.codeToUni) {
    if (!u) continue;
    if (!uniToCode.has(u)) uniToCode.set(u, c);
  }
  const widthOfCode = (code) => widths.has(code) ? widths.get(code) : dw;
  return finish({ kind: 'type0', subtype: 'Type0', baseFont, embedded: true, symbolic: false, ascent, descent, ...style }, uniToCode, byteLen, widthOfCode, dw);
}
