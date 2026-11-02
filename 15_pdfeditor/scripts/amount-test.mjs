// Prueft die Betragserkennung an der Demo-Rechnung: PDF bauen, Bloecke wie in
// der App extrahieren, Betrag ermitteln. Aufruf: node scripts/amount-test.mjs
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { buildDemoPdf } from '../src/lib/demoPdf.js';
import { itemsToRuns, runsToBlocks } from '../src/lib/textBlocks.js';
import { findInvoiceAmount, amountPrefix } from '../src/lib/amount.js';

const bytes = await buildDemoPdf();
const doc = await pdfjsLib.getDocument({ data: bytes.slice(), isEvalSupported: false }).promise;
const alle = [];
for (let i = 0; i < doc.numPages; i++) {
  const page = await doc.getPage(i + 1);
  const content = await page.getTextContent({ includeMarkedContent: false, disableNormalization: true });
  alle.push(...runsToBlocks(itemsToRuns(content.items), i, content.styles));
}
const amount = findInvoiceAmount(alle);
const praefix = amountPrefix(amount);
console.log('Bloecke:', alle.length);
console.log('Erkannter Betrag:', amount ? amount.value : null, '->', JSON.stringify(praefix));
console.log('Dateiname:', praefix + 'Demo-Rechnung' + '_bearbeitet.pdf');
const ok = amount && Math.abs(amount.value - 6007.72) < 0.005;
console.log(ok ? 'OK: Gesamtbetrag erkannt' : 'FEHLER: erwartet 6007.72');
process.exit(ok ? 0 : 1);
