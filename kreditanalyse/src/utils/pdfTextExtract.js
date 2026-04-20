/**
 * pdfTextExtract.js
 *
 * Extrahiert reinen Text aus einer PDF-Datei mithilfe von pdfjs-dist.
 *
 * Nutzung:
 *   const { text, pages } = await extractPdfText(file);
 *
 * - `text`  : kompletter Text aller Seiten als ein String
 * - `pages` : Array mit Text pro Seite
 *
 * Der Worker wird via Vite `?url`-Import geladen, damit er lokal aus
 * `node_modules/pdfjs-dist` gebundelt wird (kein externer CDN).
 */

import * as pdfjs from 'pdfjs-dist/build/pdf.mjs';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

/**
 * Liest die Datei als ArrayBuffer.
 */
function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error('FileReader error'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Extrahiert den Text einer einzelnen Seite und normalisiert Whitespace.
 */
async function extractPageText(pdf, pageNumber) {
  const page = await pdf.getPage(pageNumber);
  const content = await page.getTextContent();
  const parts = content.items.map((item) => ('str' in item ? item.str : ''));
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * Hauptfunktion: PDF-File -> Klartext.
 */
export async function extractPdfText(file) {
  if (!file) throw new Error('Keine Datei übergeben.');
  const buffer = await readFileAsArrayBuffer(file);
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });
  const pdf = await loadingTask.promise;

  const pages = [];
  for (let i = 1; i <= pdf.numPages; i += 1) {
    pages.push(await extractPageText(pdf, i));
  }

  return {
    numPages: pdf.numPages,
    pages,
    text: pages.join('\n\n'),
  };
}
