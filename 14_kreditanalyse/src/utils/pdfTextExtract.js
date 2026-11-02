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
 * Öffnet eine PDF aus einem ArrayBuffer. pdf.js übergibt den Puffer an den
 * Worker und macht ihn dabei unbrauchbar, deshalb geht eine Kopie hinein.
 */
export function openPdf(bytes) {
  return pdfjs.getDocument({ data: new Uint8Array(bytes.slice(0)) }).promise;
}

/**
 * Liest eine PDF mit Positionen: je Seite die Textzeilen, jede Zeile mit
 * ihren Zellen (Textstücke mit deutlichem Abstand dazwischen) und einem
 * Rahmen in Seitenkoordinaten (Ursprung oben links, Einheit pt). Grundlage
 * für tabellarische Unterlagen wie Mieterlisten und für die Markierung der
 * Fundstelle in der Vorschau.
 */
export async function extractPdfLayout(bytes) {
  const pdf = await openPdf(bytes);
  const seiten = [];
  for (let nr = 1; nr <= pdf.numPages; nr += 1) {
    const page = await pdf.getPage(nr);
    const viewport = page.getViewport({ scale: 1 });
    const content = await page.getTextContent();
    const stuecke = content.items
      .filter((it) => 'str' in it && it.str.trim() !== '')
      .map((it) => ({
        text: it.str.replace(/\u00a0/g, ' '),
        x: it.transform[4],
        y: it.transform[5],
        w: it.width,
        h: Math.abs(it.transform[3]) || it.height || 10,
      }))
      .sort((a, b) => b.y - a.y || a.x - b.x);

    // Stücke derselben Grundlinie bilden eine Zeile
    const gruppen = [];
    for (const s of stuecke) {
      const letzte = gruppen[gruppen.length - 1];
      if (letzte && Math.abs(letzte.y - s.y) <= Math.max(1.5, s.h * 0.35)) letzte.stuecke.push(s);
      else gruppen.push({ y: s.y, stuecke: [s] });
    }

    const zeilen = gruppen.map((g) => {
      const zellen = [];
      let hoehe = 0;
      for (const s of g.stuecke.sort((a, b) => a.x - b.x)) {
        hoehe = Math.max(hoehe, s.h);
        const letzte = zellen[zellen.length - 1];
        const luecke = letzte ? s.x - letzte.x1 : Infinity;
        if (letzte && luecke < Math.max(2.5, s.h * 0.6)) {
          letzte.text += (luecke > s.h * 0.12 ? ' ' : '') + s.text;
          letzte.x1 = Math.max(letzte.x1, s.x + s.w);
        } else {
          zellen.push({ text: s.text, x0: s.x, x1: s.x + s.w });
        }
      }
      zellen.forEach((z) => { z.text = z.text.replace(/\s+/g, ' ').trim(); });
      const x0 = Math.min(...zellen.map((z) => z.x0));
      const x1 = Math.max(...zellen.map((z) => z.x1));
      const [a, b, c, d] = viewport.convertToViewportRectangle([x0 - 2, g.y - hoehe * 0.3, x1 + 2, g.y + hoehe * 0.95]);
      return {
        zellen,
        text: zellen.map((z) => z.text).join('\t'),
        rahmen: { links: Math.min(a, c), oben: Math.min(b, d), rechts: Math.max(a, c), unten: Math.max(b, d) },
      };
    });
    seiten.push({ nr, breite: viewport.width, hoehe: viewport.height, zeilen });
  }
  await pdf.destroy();
  return { numPages: seiten.length, seiten };
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
