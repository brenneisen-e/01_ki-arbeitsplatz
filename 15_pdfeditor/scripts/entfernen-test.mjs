// Prueft, dass geaenderter Text wirklich aus dem PDF verschwindet und aller
// uebrige Text Zeichen fuer Zeichen an seinem Platz bleibt.
// Aufruf: node scripts/entfernen-test.mjs <datei.pdf> [...]
// Loescht auf Seite 1 jeden dritten Block und vergleicht die Textextraktion
// vorher/nachher.
import fs from 'node:fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { PdfSession } from '../src/lib/session.js';
import { itemsToRuns, runsToBlocks } from '../src/lib/textBlocks.js';

const load = async (data) => (await pdfjsLib.getDocument({ data: data.slice(), isEvalSupported: false, verbosity: 0 }).promise).getPage(1);
const items = async (page) => (await page.getTextContent({ includeMarkedContent: false, disableNormalization: true })).items.filter(i => i.str.trim());
const key = (i) => `${i.transform.map(v => v.toFixed(1)).join(',')}`;

let failed = 0;
for (const file of process.argv.slice(2)) {
  const bytes = new Uint8Array(fs.readFileSync(file));
  const session = await PdfSession.create(bytes);
  const page = await load(bytes);
  const content = await page.getTextContent({ includeMarkedContent: false, disableNormalization: true });
  const blocks = runsToBlocks(itemsToRuns(content.items), 0, content.styles);
  await page.getOperatorList();
  for (const b of blocks) {
    const f = page.commonObjs.has(b.fontName) ? page.commonObjs.get(b.fontName) : null;
    const entry = session.matchEntry(f ? f.name : null, 0);
    b.fontEntryId = entry ? entry.id : null;
  }
  const map = new Map(blocks.map(b => [b.id, b]));
  const targets = blocks.filter((_, i) => i % 3 === 0);
  const edits = new Map(targets.map(b => [b.id, { deleted: true }]));
  const { bytes: out } = await session.render(map, edits);

  const before = await items(page);
  const after = await items(await load(out));
  const inTarget = (it) => targets.some(b => b.text.includes(it.str.trim()) && b.lines.some(l => Math.abs(it.transform[5] - l.y) < 0.3 * b.size && it.transform[4] >= l.x - 1 && it.transform[4] <= l.x + l.width + 1 && Math.abs(Math.hypot(it.transform[2], it.transform[3]) - b.size) < 0.1 * b.size));
  const expected = before.filter(i => !inTarget(i));
  const afterText = after.map(i => i.str).join('');
  const expText = expected.map(i => i.str).join('');
  const leftovers = after.filter(inTarget);
  // Uebrige Glyphen muessen an denselben Stellen stehen.
  const expKeys = new Set(expected.map(key));
  const moved = after.filter(i => !expKeys.has(key(i)));
  const norm = (s) => s.replace(/\s+/g, '');
  const ok = leftovers.length === 0 && moved.length === 0 && norm(afterText) === norm(expText);
  if (!ok) failed++;
  if (!ok && process.env.DIFF) { const a = norm(afterText), e = norm(expText); let i = 0; while (a[i] === e[i]) i++; console.log('  nachher:', a.slice(i - 20, i + 60)); console.log('  erwartet:', e.slice(i - 20, i + 60)); }
  console.log(ok ? 'OK    ' : 'FEHLER', file.split('/').pop(), `| ${targets.length} Bloecke entfernt, ${after.length}/${before.length} Items`,
    leftovers.length ? `| Reste: ${JSON.stringify(leftovers.map(i => i.str).slice(0, 5))}` : '',
    moved.length ? `| verschoben/neu: ${JSON.stringify(moved.map(i => i.str).slice(0, 5))}` : '');
}
process.exit(failed ? 1 : 0);
