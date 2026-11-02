// Laedt ein PDF fuer die Bearbeitung: pdf-lib-Session (Schriften, Schreiben)
// und pdf.js-Dokument (Rendern, Textextraktion), plus alle Textbloecke.
import { PdfSession } from './session.js';
import { loadPdfjsDocument, extractBlocks, sampleColors } from './pdfjs.js';

export async function analyzeDocument(bytes, onProgress) {
  const session = await PdfSession.create(bytes);
  const pdfjsDoc = await loadPdfjsDocument(bytes);
  const pages = [];
  const blocks = new Map();
  for (let i = 0; i < pdfjsDoc.numPages; i++) {
    if (onProgress) onProgress(i + 1, pdfjsDoc.numPages);
    const page = await pdfjsDoc.getPage(i + 1);
    const viewport = page.getViewport({ scale: 1 });
    // Schriften laden (commonObjs), damit Namen und FontFaces verfuegbar sind
    try { await page.getOperatorList(); } catch (e) { console.warn('Seite konnte nicht vorbereitet werden', e); }
    const pageBlocks = await extractBlocks(page, i);
    for (const b of pageBlocks) {
      const entry = session.matchEntry(b.pdfjsFont?.name, i);
      b.fontEntryId = entry ? entry.id : null;
      b.color = [0, 0, 0];
      b.bg = [1, 1, 1];
      b.sampled = false;
      blocks.set(b.id, b);
    }
    pages.push({ index: i, width: viewport.width, height: viewport.height, rotation: viewport.rotation });
  }
  const usableFonts = session.usableFonts();
  const fontNameByEntry = new Map();
  for (const b of blocks.values()) if (b.fontEntryId && !fontNameByEntry.has(b.fontEntryId)) fontNameByEntry.set(b.fontEntryId, b.fontName);
  return { session, pdfjsDoc, pages, blocks, usableFonts, fontNameByEntry };
}

/** Rechteck (Canvas-Pixel) um alle Zeilen eines Layouts. */
export function layoutRect(viewport, lay) {
  const cos = Math.cos(lay.angle), sin = Math.sin(lay.angle);
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const asc = lay.ascent * lay.size, desc = lay.descent * lay.size;
  for (const l of lay.lines) {
    const w = Math.max(l.width, lay.size * 0.6);
    for (const [along, up] of [[0, asc], [w, asc], [0, desc], [w, desc]]) {
      const [vx, vy] = viewport.convertToViewportPoint(l.x + cos * along - sin * up, l.y + sin * along + cos * up);
      minX = Math.min(minX, vx); maxX = Math.max(maxX, vx);
      minY = Math.min(minY, vy); maxY = Math.max(maxY, vy);
    }
  }
  if (!isFinite(minX)) return { x: 0, y: 0, w: 0, h: 0 };
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

/**
 * Tastet Hintergrund- und Textfarbe fuer die angegebenen Bloecke ab, indem die
 * betroffenen Seiten offscreen gerendert werden (fuer die Stapelverarbeitung).
 */
export async function sampleBlockColors(pdfjsDoc, session, blocks) {
  const byPage = new Map();
  for (const b of blocks) {
    if (b.sampled || b.added) continue;
    if (!byPage.has(b.pageIndex)) byPage.set(b.pageIndex, []);
    byPage.get(b.pageIndex).push(b);
  }
  for (const [pageIndex, list] of byPage) {
    const page = await pdfjsDoc.getPage(pageIndex + 1);
    const scale = 1.5;
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    await page.render({ canvasContext: ctx, viewport }).promise;
    for (const b of list) {
      const lay = session.layout(b, {});
      const colors = sampleColors(ctx, layoutRect(viewport, lay), canvas.width, canvas.height);
      Object.assign(b, colors, { sampled: true });
    }
  }
}
