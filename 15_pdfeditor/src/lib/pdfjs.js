import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import workerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';
import { itemsToRuns, runsToBlocks } from './textBlocks.js';

let configured = false;
export function configurePdfjs() {
  if (configured) return;
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
  configured = true;
}

export async function loadPdfjsDocument(bytes) {
  configurePdfjs();
  // pdf.js uebernimmt den Puffer (Transfer) — deshalb eine Kopie uebergeben.
  const task = pdfjsLib.getDocument({
    data: bytes.slice(),
    isEvalSupported: false,
    standardFontDataUrl: new URL('standard_fonts/', window.location.href).href,
  });
  return task.promise;
}

/** Liest Schriftinformationen (Name, fett, kursiv) aus pdf.js fuer einen Font. */
export function pdfjsFontInfo(page, fontName, style) {
  let info = { name: null, bold: false, italic: false, serif: false, mono: false };
  try {
    if (page.commonObjs.has(fontName)) {
      const f = page.commonObjs.get(fontName);
      if (f) info = { ...info, name: f.name || null, bold: !!f.bold || !!f.black, italic: !!f.italic };
    }
  } catch { /* Font noch nicht geladen */ }
  const fam = (style && style.fontFamily) || '';
  info.serif = /serif/.test(fam) && !/sans/.test(fam);
  info.mono = /mono/.test(fam);
  const n = (info.name || '').toLowerCase();
  if (/bold|black|heavy|semibold/.test(n)) info.bold = true;
  if (/italic|oblique/.test(n)) info.italic = true;
  return info;
}

/** Extrahiert die editierbaren Textbloecke einer Seite. */
export async function extractBlocks(page, pageIndex) {
  const content = await page.getTextContent({ includeMarkedContent: false, disableNormalization: true });
  const runs = itemsToRuns(content.items);
  const blocks = runsToBlocks(runs, pageIndex, content.styles);
  for (const b of blocks) b.pdfjsFont = pdfjsFontInfo(page, b.fontName, content.styles[b.fontName]);
  return blocks;
}

function quantize(r, g, b) {
  return ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
}

/**
 * Bestimmt Hintergrund- und Textfarbe eines Blocks aus dem gerenderten Canvas.
 * rect: { x, y, w, h } in Canvas-Pixeln.
 */
export function sampleColors(ctx2d, rect, canvasW, canvasH) {
  const x0 = Math.max(0, Math.floor(rect.x)), y0 = Math.max(0, Math.floor(rect.y));
  const x1 = Math.min(canvasW, Math.ceil(rect.x + rect.w)), y1 = Math.min(canvasH, Math.ceil(rect.y + rect.h));
  if (x1 - x0 < 1 || y1 - y0 < 1) return { bg: [1, 1, 1], color: [0, 0, 0] };
  const pad = 3;
  const ox0 = Math.max(0, x0 - pad), oy0 = Math.max(0, y0 - pad);
  const ox1 = Math.min(canvasW, x1 + pad), oy1 = Math.min(canvasH, y1 + pad);
  let data;
  try { data = ctx2d.getImageData(ox0, oy0, ox1 - ox0, oy1 - oy0).data; } catch { return { bg: [1, 1, 1], color: [0, 0, 0] }; }
  const w = ox1 - ox0;
  const counts = new Map();
  const inner = [];
  for (let y = oy0; y < oy1; y++) {
    for (let x = ox0; x < ox1; x++) {
      const i = ((y - oy0) * w + (x - ox0)) * 4;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const insideText = x >= x0 && x < x1 && y >= y0 && y < y1;
      if (insideText) { inner.push(r, g, b); continue; }
      const key = quantize(r, g, b);
      const c = counts.get(key);
      if (c) { c.n++; c.r += r; c.g += g; c.b += b; } else counts.set(key, { n: 1, r, g, b });
    }
  }
  let bg = [255, 255, 255];
  let bestN = 0;
  for (const c of counts.values()) if (c.n > bestN) { bestN = c.n; bg = [c.r / c.n, c.g / c.n, c.b / c.n]; }
  // Textfarbe: der Pixel mit dem groessten Abstand zum Hintergrund
  let color = null, bestD = 0;
  const colCounts = new Map();
  for (let i = 0; i < inner.length; i += 3) {
    const d = Math.abs(inner[i] - bg[0]) + Math.abs(inner[i + 1] - bg[1]) + Math.abs(inner[i + 2] - bg[2]);
    if (d > bestD) bestD = d;
    if (d > 120) {
      const key = quantize(inner[i], inner[i + 1], inner[i + 2]);
      const c = colCounts.get(key);
      if (c) { c.n++; c.r += inner[i]; c.g += inner[i + 1]; c.b += inner[i + 2]; } else colCounts.set(key, { n: 1, r: inner[i], g: inner[i + 1], b: inner[i + 2] });
    }
  }
  if (colCounts.size) {
    // Haeufigste deutlich abweichende Farbe, nach "Abstand * Haeufigkeit"
    let best = 0;
    for (const c of colCounts.values()) {
      const rr = c.r / c.n, gg = c.g / c.n, bb = c.b / c.n;
      const d = Math.abs(rr - bg[0]) + Math.abs(gg - bg[1]) + Math.abs(bb - bg[2]);
      const s = c.n * d;
      if (s > best) { best = s; color = [rr, gg, bb]; }
    }
  }
  if (!color) color = bg[0] + bg[1] + bg[2] > 384 ? [0, 0, 0] : [255, 255, 255];
  return { bg: bg.map(v => Math.round(v) / 255), color: color.map(v => Math.round(v) / 255) };
}
