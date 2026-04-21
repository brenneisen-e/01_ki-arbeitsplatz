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
 * Extrahiert den Text einer einzelnen Seite. pdf.js liefert pro Textitem ein
 * `hasEOL`-Flag (Zeilenende im Rendering). Das übersetzen wir in echte
 * Zeilenumbrüche, damit die Parser-Regexe pro Feld terminieren können.
 * Whitespace innerhalb einer Zeile wird dagegen auf ein einzelnes Space
 * normalisiert.
 */
async function extractPageText(pdf, pageNumber) {
  const page = await pdf.getPage(pageNumber);
  const content = await page.getTextContent();
  const lines = [];
  let current = '';
  for (const item of content.items) {
    if ('str' in item) current += item.str;
    if (item.hasEOL) {
      lines.push(current.replace(/[\t ]+/g, ' ').trim());
      current = '';
    } else {
      current += ' ';
    }
  }
  if (current.trim()) lines.push(current.replace(/[\t ]+/g, ' ').trim());
  return lines.filter((l) => l.length > 0).join('\n');
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
