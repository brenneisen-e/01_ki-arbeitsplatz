// Node-Testlauf ohne Browser: Bloecke extrahieren, einen Block aendern, Ergebnis
// wieder auslesen. Aufruf: node scripts/harness.mjs <datei.pdf> [neuer Text] [type0]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { PdfSession } from '../src/lib/session.js';
import { itemsToRuns, runsToBlocks } from '../src/lib/textBlocks.js';

const file = process.argv[2];
const newText = process.argv[3] || 'Geändert: Köln – 12,50 € Prüfung';
const bytes = new Uint8Array(fs.readFileSync(file));
const session = await PdfSession.create(bytes);
console.log('Fonts im Dokument:');
for (const e of session.fontEntries) {
  const enc = session.getEncoder(e.id);
  console.log(' ', e.id, e.subtype.padEnd(9), e.baseFont.padEnd(40), 'pages', [...e.pages].join(','), enc ? `encoder:${enc.kind} bold=${enc.bold} italic=${enc.italic} serif=${enc.serif} mono=${enc.mono} asc=${enc.ascent.toFixed(2)}` : 'KEIN ENCODER');
}
const doc = await pdfjsLib.getDocument({ data: bytes.slice(), isEvalSupported: false }).promise;
const page = await doc.getPage(1);
await page.getOperatorList();
const content = await page.getTextContent({ includeMarkedContent: false, disableNormalization: true });
const runs = itemsToRuns(content.items);
const blocks = runsToBlocks(runs, 0, content.styles);
console.log('Items', content.items.length, 'Runs', runs.length, 'Bloecke', blocks.length);
const blockMap = new Map();
for (const b of blocks) {
  const f = page.commonObjs.has(b.fontName) ? page.commonObjs.get(b.fontName) : null;
  b.pdfjsFont = { name: f ? f.name : null, bold: f ? f.bold : false, italic: f ? f.italic : false };
  const entry = session.matchEntry(b.pdfjsFont.name, 0);
  b.fontEntryId = entry ? entry.id : null;
  blockMap.set(b.id, b);
}
for (const b of blocks.slice(0, 25)) {
  console.log(`  [${b.id}] ${b.fontName} (${b.pdfjsFont.name} -> ${b.fontEntryId}) ${b.size.toFixed(1)}pt @${b.x.toFixed(1)},${b.y.toFixed(1)} w=${b.width.toFixed(1)} lh=${b.lineHeight.toFixed(1)} | ${JSON.stringify(b.text).slice(0, 90)}`);
}
// Erster Block mit Original-Font-Encoder -> Text aendern
const wantType0 = process.argv[4] === 'type0';
const target = blocks.find(b => b.fontEntryId && session.getEncoder(b.fontEntryId) && (!wantType0 || session.getEntry(b.fontEntryId).subtype === 'Type0')) || blocks[0];
// Ohne expliziten Text: Zeichen des Originals umkehren — so bleibt der Block
// in der Originalschrift kodierbar und der Roundtrip prueft die Codes exakt.
const effectiveText = process.argv[3] ? newText : [...target.text.split('\n')[0]].reverse().join('');
console.log('Ziel-Block', target.id, JSON.stringify(target.text.slice(0, 60)), '->', JSON.stringify(effectiveText));
const edits = new Map([[target.id, { text: effectiveText }]]);
const lay = session.layout(target, edits.get(target.id));
console.log('Layout:', lay.font.mode, lay.font.label, 'fallback', lay.font.fallback, 'missing', lay.font.missing, 'widths', lay.lines.map(l => l.width.toFixed(1)));
const t0 = Date.now();
const { bytes: out, report } = await session.render(blockMap, edits);
console.log('render ms', Date.now() - t0, 'report', JSON.stringify(report));
const outFile = path.join(os.tmpdir(), path.basename(file, '.pdf') + '_bearbeitet.pdf');
fs.writeFileSync(outFile, out);
// Round-Trip: neuen Text wieder extrahieren
const doc2 = await pdfjsLib.getDocument({ data: out.slice(), isEvalSupported: false }).promise;
const p2 = await doc2.getPage(1);
const c2 = await p2.getTextContent({ includeMarkedContent: false, disableNormalization: true });
const all = c2.items.map(i => i.str).join(' ');
// Der Originaltext muss wirklich aus dem Seiteninhalt verschwinden (nicht nur
// uebermalt sein). Er kann auf der Seite mehrfach vorkommen, deshalb zaehlen.
const count = (hay, needle) => hay.split(needle).length - 1;
const allBefore = content.items.map(i => i.str).join(' ');
const orig = target.text.split('\n')[0];
const leftover = count(all, orig) - count(allBefore, orig) + 1;
console.log('Roundtrip enthaelt neuen Text:', all.includes(effectiveText.split('\n')[0]) ? 'JA' : 'NEIN', '| Original noch vorhanden:', leftover > 0 ? 'JA (Fehler)' : 'nein');
console.log('->', outFile);
