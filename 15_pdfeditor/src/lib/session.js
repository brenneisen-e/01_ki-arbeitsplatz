// PdfSession: haelt das Original-PDF, kennt dessen Schriften und erzeugt aus
// den Textaenderungen ein neues PDF. Geaenderter Text wird mit der originalen
// Schriftressource geschrieben; nur wenn die eingebettete Schrift ein Zeichen
// nicht enthaelt, weichen wir auf eine passende Standardschrift aus.
import {
  PDFDocument, PDFName, PDFArray, PDFHexString, StandardFonts,
  pushGraphicsState, popGraphicsState, setFillingRgbColor, rectangle, fill,
  beginText, endText, setFontAndSize, setTextMatrix, showText, concatTransformationMatrix,
} from 'pdf-lib';
import { collectFonts, matchFont } from './fontRegistry.js';
import { buildEncoder, winAnsiCharset } from './fontEncoder.js';
import { removeTextFromPage } from './textRemoval.js';

export const STANDARD_FONTS = [
  { name: 'Helvetica', label: 'Helvetica', serif: false, mono: false, bold: false, italic: false },
  { name: 'Helvetica-Bold', label: 'Helvetica Fett', serif: false, mono: false, bold: true, italic: false },
  { name: 'Helvetica-Oblique', label: 'Helvetica Kursiv', serif: false, mono: false, bold: false, italic: true },
  { name: 'Helvetica-BoldOblique', label: 'Helvetica Fett Kursiv', serif: false, mono: false, bold: true, italic: true },
  { name: 'Times-Roman', label: 'Times', serif: true, mono: false, bold: false, italic: false },
  { name: 'Times-Bold', label: 'Times Fett', serif: true, mono: false, bold: true, italic: false },
  { name: 'Times-Italic', label: 'Times Kursiv', serif: true, mono: false, bold: false, italic: true },
  { name: 'Times-BoldItalic', label: 'Times Fett Kursiv', serif: true, mono: false, bold: true, italic: true },
  { name: 'Courier', label: 'Courier', serif: false, mono: true, bold: false, italic: false },
  { name: 'Courier-Bold', label: 'Courier Fett', serif: false, mono: true, bold: true, italic: false },
  { name: 'Courier-Oblique', label: 'Courier Kursiv', serif: false, mono: true, bold: false, italic: true },
  { name: 'Courier-BoldOblique', label: 'Courier Fett Kursiv', serif: false, mono: true, bold: true, italic: true },
];

export function pickStandardFont({ bold = false, italic = false, serif = false, mono = false } = {}) {
  const f = STANDARD_FONTS.find(s => s.bold === !!bold && s.italic === !!italic && s.serif === (!!serif && !mono) && s.mono === !!mono);
  return (f || STANDARD_FONTS[0]).name;
}

// Ordnet Namen nicht eingebetteter Schriften den Standard-14-Schriften zu.
export function standardFontFor(baseFont) {
  const n = (baseFont || '').replace(/^[A-Z]{6}\+/, '').toLowerCase().replace(/[\s_,]/g, '');
  const bold = /bold|black|heavy/.test(n), italic = /italic|oblique/.test(n);
  if (/courier|mono/.test(n)) return pickStandardFont({ bold, italic, mono: true });
  if (/times|georgia|serif|roman/.test(n) && !/sans/.test(n)) return pickStandardFont({ bold, italic, serif: true });
  if (/helvetica|arial|verdana|calibri|segoe|tahoma|sans/.test(n)) return pickStandardFont({ bold, italic });
  if (n === 'symbol' || /zapf|dingbat/.test(n)) return null;
  return pickStandardFont({ bold, italic });
}

const ALT = { ' ': ' ', '\t': ' ', '’': "'", '‘': "'", '“': '"', '”': '"', '„': '"', '–': '-', '—': '-', '−': '-', '…': '...' };

function ensureWrapped(page, ctx) {
  const raw = page.node.get(PDFName.of('Contents'));
  if (raw === undefined) return;
  const q = ctx.register(ctx.stream('q\n'));
  const Q = ctx.register(ctx.stream('Q\n'));
  if (raw instanceof PDFArray) {
    raw.insert(0, q);
    raw.push(Q);
  } else {
    page.node.set(PDFName.of('Contents'), ctx.obj([q, raw, Q]));
  }
}

export class PdfSession {
  static async create(bytes) {
    const copy = bytes instanceof Uint8Array ? bytes.slice() : new Uint8Array(bytes);
    const meta = await PDFDocument.load(copy, { ignoreEncryption: true, updateMetadata: false });
    return new PdfSession(copy, meta);
  }

  constructor(bytes, meta) {
    this.bytes = bytes;
    this.meta = meta;
    this.fontEntries = collectFonts(meta);
    this.encoders = new Map();
    this.stdFonts = new Map();
    this.pageCount = meta.getPageCount();
  }

  stdFont(name) {
    if (!this.stdFonts.has(name)) {
      try { this.stdFonts.set(name, this.meta.embedStandardFont(name)); } catch { this.stdFonts.set(name, null); }
    }
    return this.stdFonts.get(name);
  }

  getEntry(id) {
    return this.fontEntries.find(e => e.id === id) || null;
  }

  matchEntry(pdfjsName, pageIndex) {
    return matchFont(this.fontEntries, pdfjsName, pageIndex);
  }

  getEncoder(entryId) {
    if (!this.encoders.has(entryId)) {
      const entry = this.getEntry(entryId);
      let enc = null;
      if (entry && entry.ref) {
        try {
          enc = buildEncoder(this.meta.context, entry.dict, (baseFont) => {
            const std = standardFontFor(baseFont);
            return std ? this.stdFont(std) : null;
          });
        } catch (e) {
          console.warn('Encoder fuer Schrift fehlgeschlagen', entry.baseFont, e);
        }
      }
      this.encoders.set(entryId, enc);
    }
    return this.encoders.get(entryId);
  }

  /** Liste der im Dokument nutzbaren Schriften (fuer die Schriftauswahl). */
  usableFonts() {
    return this.fontEntries
      .map(e => ({ entry: e, encoder: this.getEncoder(e.id) }))
      .filter(x => x.encoder)
      .map(x => ({ id: x.entry.id, label: x.entry.baseFontPlain || x.entry.baseFont || x.entry.id, bold: x.encoder.bold, italic: x.encoder.italic, pages: [...x.entry.pages] }));
  }

  fontLabel(entry) {
    return entry ? (entry.baseFontPlain || entry.baseFont || 'Unbekannt') : 'Unbekannt';
  }

  sanitizeStd(text, stdFontName) {
    const set = winAnsiCharset();
    let out = '';
    const missing = [];
    for (const ch of text) {
      if (ch === '\n') { out += ch; continue; }
      if (set.has(ch.codePointAt(0))) { out += ch; continue; }
      const alt = ALT[ch];
      if (alt !== undefined && [...alt].every(a => set.has(a.codePointAt(0)))) { out += alt; continue; }
      if (!missing.includes(ch)) missing.push(ch);
      out += '?';
    }
    return { text: out, missing };
  }

  /**
   * Bestimmt die Schrift, mit der ein Block geschrieben wird.
   * choice: { type: 'entry', id } | { type: 'standard', name } | null (= Original)
   */
  resolveFont(block, choice, text) {
    const hint = block.pdfjsFont || {};
    const c = choice || (block.fontEntryId ? { type: 'entry', id: block.fontEntryId } : { type: 'standard', name: block.standardFont || pickStandardFont(hint) });
    if (c.type === 'entry') {
      const entry = this.getEntry(c.id);
      const encoder = entry ? this.getEncoder(c.id) : null;
      if (encoder) {
        const a = encoder.analyze(text);
        if (a.ok) {
          return { mode: 'entry', entry, encoder, label: this.fontLabel(entry), fallback: false, missing: [] };
        }
        const stdName = pickStandardFont(encoder);
        const s = this.sanitizeStd(text, stdName);
        return { mode: 'standard', entry, encoder, standardName: stdName, label: stdName, fallback: true, missing: a.missing, missingStd: s.missing, sanitized: s.text, originalLabel: this.fontLabel(entry) };
      }
      const stdName = standardFontFor(entry ? entry.baseFont : '') || pickStandardFont(hint);
      const s = this.sanitizeStd(text, stdName);
      return { mode: 'standard', entry, encoder: null, standardName: stdName, label: stdName, fallback: true, missing: [], missingStd: s.missing, sanitized: s.text, originalLabel: this.fontLabel(entry), reason: 'unsupported' };
    }
    const stdName = STANDARD_FONTS.some(s => s.name === c.name) ? c.name : 'Helvetica';
    const s = this.sanitizeStd(text, stdName);
    return { mode: 'standard', entry: null, encoder: null, standardName: stdName, label: stdName, fallback: false, missing: [], missingStd: s.missing, sanitized: s.text };
  }

  measure(font, line, size) {
    if (font.mode === 'entry') return font.encoder.widthOf(line, size);
    const f = this.stdFont(font.standardName);
    if (!f) return line.length * size * 0.5;
    try { return f.widthOfTextAtSize(this.sanitizeStd(line, font.standardName).text, size); } catch { return line.length * size * 0.5; }
  }

  /** Berechnet Zeilen, Positionen und Breiten fuer den (geaenderten) Block. */
  layout(block, edit = {}) {
    const text = edit.text ?? block.text;
    const size = edit.size ?? block.size;
    const scale = block.size ? size / block.size : 1;
    const lineHeight = (block.lineHeight || block.size * 1.2) * scale;
    const angle = block.angle || 0;
    const cos = Math.cos(angle), sin = Math.sin(angle);
    const x0 = block.x + (edit.dx || 0);
    const y0 = block.y + (edit.dy || 0);
    const font = this.resolveFont(block, edit.font, text);
    const lines = text.split('\n').map((t, i) => ({
      text: t,
      x: x0 + sin * i * lineHeight,
      y: y0 - cos * i * lineHeight,
      width: this.measure(font, t, size),
    }));
    const ascent = font.mode === 'entry' ? font.encoder.ascent : (block.ascent || 0.9);
    const descent = font.mode === 'entry' ? font.encoder.descent : (block.descent || -0.22);
    return { text, size, lineHeight, angle, x: x0, y: y0, lines, font, ascent, descent, color: edit.color || block.color || [0, 0, 0] };
  }

  /**
   * Wendet alle Aenderungen auf das Original an und liefert die neuen Bytes
   * plus einen Bericht je Block (verwendete Schrift, Ersatz, fehlende Zeichen).
   */
  async render(blocks, edits) {
    const doc = await PDFDocument.load(this.bytes.slice(), { ignoreEncryption: true, updateMetadata: false });
    const ctx = doc.context;
    const pages = doc.getPages();
    const stdCache = new Map();
    const getStd = (name) => {
      if (!stdCache.has(name)) stdCache.set(name, doc.embedStandardFont(name));
      return stdCache.get(name);
    };
    const wrapped = new Set();
    const fontKeys = new Map();
    const report = {};

    // Originaltext geaenderter Bloecke aus dem Seiteninhalt entfernen. Nur
    // Zeilen, deren Glyphen dort nicht gefunden werden (z. B. Text in
    // Form-XObjects), werden wie bisher mit einer Flaeche abgedeckt.
    const zonesByPage = new Map();
    for (const [id, edit] of edits) {
      const block = blocks.get(id);
      if (!block || !edit || block.added || !block.lines || !pages[block.pageIndex]) continue;
      let list = zonesByPage.get(block.pageIndex);
      if (!list) { list = []; zonesByPage.set(block.pageIndex, list); }
      const entry = block.fontEntryId ? this.getEntry(block.fontEntryId) : null;
      const fontName = entry ? entry.baseFontPlain || null : null;
      block.lines.forEach((line, i) => list.push({ id, line: i, x: line.x, y: line.y, width: line.width, size: block.size, angle: block.angle || 0, fontName }));
    }
    const removedLines = new Set();
    for (const [pageIndex, zones] of zonesByPage) {
      let removed = [];
      try { removed = removeTextFromPage(pages[pageIndex], zones); } catch (e) { console.warn('Text konnte nicht entfernt werden', e); }
      zones.forEach((z, k) => { if (removed[k] > 0) removedLines.add(z.id + ':' + z.line); });
    }

    for (const [id, edit] of edits) {
      const block = blocks.get(id);
      if (!block || !edit) continue;
      const page = pages[block.pageIndex];
      if (!page) continue;
      if (!wrapped.has(page)) { ensureWrapped(page, ctx); wrapped.add(page); }

      const lay = this.layout(block, edit);
      report[id] = { mode: lay.font.mode, label: lay.font.label, fallback: lay.font.fallback, missing: lay.font.missing, missingStd: lay.font.missingStd || [], originalLabel: lay.font.originalLabel, reason: lay.font.reason };

      const ops = [];
      const cos = Math.cos(lay.angle), sin = Math.sin(lay.angle);
      if (!block.added && block.lines && block.lines.length) {
        const bg = block.bg || [1, 1, 1];
        // Abdeckflaeche: Umlautpunkte und Akzente liegen oft ueber dem
        // gemeldeten Ascent, Unterlaengen unter dem Descent — deshalb grosszuegig,
        // aber nicht bis in die Nachbarzeile.
        const lh = (block.lineHeight || block.size * 1.2) / block.size;
        const asc = Math.min(Math.max(block.ascent || 0.9, 0.95), Math.max(lh - 0.22, 0.95));
        const desc = Math.min(block.descent || -0.22, -0.24);
        const pad = 0.6;
        block.lines.forEach((line, i) => {
          if (removedLines.has(id + ':' + i)) return;
          ops.push(
            pushGraphicsState(),
            concatTransformationMatrix(cos, sin, -sin, cos, line.x, line.y),
            setFillingRgbColor(bg[0], bg[1], bg[2]),
            rectangle(-pad, desc * block.size - pad, line.width + 2 * pad, (asc - desc) * block.size + 2 * pad),
            fill(),
            popGraphicsState(),
          );
        });
      }

      if (!edit.deleted && lay.text.trim() !== '') {
        let fontKey, encodeLine;
        if (lay.font.mode === 'entry') {
          const tag = 'entry:' + lay.font.entry.id;
          let keys = fontKeys.get(page);
          if (!keys) { keys = new Map(); fontKeys.set(page, keys); }
          if (!keys.has(tag)) {
            const key = page.node.newFontDictionaryKey('FEdit');
            page.node.setFontDictionary(key, lay.font.entry.ref);
            keys.set(tag, key);
          }
          fontKey = keys.get(tag);
          encodeLine = (t) => PDFHexString.of(lay.font.encoder.encodeHex(t));
        } else {
          const std = getStd(lay.font.standardName);
          const tag = 'std:' + lay.font.standardName;
          let keys = fontKeys.get(page);
          if (!keys) { keys = new Map(); fontKeys.set(page, keys); }
          if (!keys.has(tag)) {
            const key = page.node.newFontDictionaryKey('FStd');
            page.node.setFontDictionary(key, std.ref);
            keys.set(tag, key);
          }
          fontKey = keys.get(tag);
          encodeLine = (t) => std.encodeText(this.sanitizeStd(t, lay.font.standardName).text);
        }
        const color = lay.color;
        ops.push(pushGraphicsState(), beginText(), setFillingRgbColor(color[0], color[1], color[2]), setFontAndSize(fontKey, lay.size));
        for (const line of lay.lines) {
          if (!line.text) continue;
          ops.push(setTextMatrix(cos, sin, -sin, cos, line.x, line.y), showText(encodeLine(line.text)));
        }
        ops.push(endText(), popGraphicsState());
      }
      if (ops.length) page.pushOperators(...ops);
    }

    const bytes = await doc.save({ updateFieldAppearances: false });
    return { bytes, report };
  }
}
