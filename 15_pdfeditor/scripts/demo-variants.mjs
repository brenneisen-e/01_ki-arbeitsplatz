// Erzeugt Varianten der Demo-Rechnung (fuer Tests der Stapelverarbeitung).
// Aufruf: node scripts/demo-variants.mjs <zielordner>
import fs from 'node:fs';
import path from 'node:path';
import { buildDemoPdf } from '../src/lib/demoPdf.js';
const dir = process.argv[2] || '.';
fs.mkdirSync(dir, { recursive: true });
const variants = [
  { nummer: 'RE-2026-00419', datum: '26.08.2026', faellig: '09.09.2026', empfaenger: ['Musterkunde AG', 'Frau Anna Schmidt', 'Industriestraße 7', '40210 Düsseldorf', 'Deutschland'] },
  { nummer: 'RE-2026-00420', datum: '27.08.2026', faellig: '10.09.2026', empfaenger: ['Beispiel GmbH', 'Am Markt 3', '10115 Berlin', 'Deutschland'] },
];
for (const [i, v] of variants.entries()) {
  const bytes = await buildDemoPdf(v);
  const file = path.join(dir, `Rechnung_${v.nummer}.pdf`);
  fs.writeFileSync(file, bytes);
  console.log('geschrieben', file, bytes.length, 'Bytes', i);
}
