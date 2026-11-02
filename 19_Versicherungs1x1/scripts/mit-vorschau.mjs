// ===========================================================================
// mit-vorschau.mjs — startet `vite preview`, wartet, bis der Server antwortet,
// führt den übergebenen Befehl dagegen aus und beendet den Server wieder.
// Damit läuft `npm run pruefen` in einem Zug durch, ohne dass jemand von Hand
// eine Vorschau starten (und hinterher vergessen) muss.
//
// Aufruf: node scripts/mit-vorschau.mjs <befehl> [argumente …]
//         mehrere Befehle mit „::“ trennen; jeder bekommt die URL angehängt
//         und läuft nur, wenn der vorige mit 0 endete.
//         PORT=4173 (Standard), HOST=127.0.0.1
// Läuft schon eine Vorschau auf dem Port, wird sie genutzt und nicht beendet.
// ===========================================================================
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HIER = path.dirname(fileURLToPath(import.meta.url));
const WURZEL = path.join(HIER, '..');
const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || '127.0.0.1';
const URL_BASIS = `http://${HOST}:${PORT}/`;
const BEFEHLE = process.argv.slice(2).reduce((liste, wort) => {
  if (wort === '::') liste.push([]);
  else liste[liste.length - 1].push(wort);
  return liste;
}, [[]]).filter((b) => b.length > 0);

if (BEFEHLE.length === 0) {
  console.error('mit-vorschau.mjs: kein Befehl übergeben.');
  process.exit(2);
}

async function antwortet() {
  try {
    const r = await fetch(URL_BASIS, { method: 'GET' });
    return r.ok;
  } catch { return false; }
}

async function warteAuf(sekunden = 30) {
  for (let i = 0; i < sekunden * 4; i += 1) {
    if (await antwortet()) return true;
    await new Promise((f) => setTimeout(f, 250));
  }
  return false;
}

let server = null;
if (await antwortet()) {
  console.log(`mit-vorschau: benutze die laufende Vorschau auf ${URL_BASIS}`);
} else {
  console.log(`mit-vorschau: starte die Vorschau auf ${URL_BASIS}`);
  server = spawn(process.execPath, [path.join(WURZEL, 'node_modules', 'vite', 'bin', 'vite.js'), 'preview', '--port', String(PORT), '--host', HOST], {
    cwd: WURZEL, stdio: ['ignore', 'pipe', 'pipe'],
  });
  server.stdout.on('data', () => {});
  server.stderr.on('data', (d) => process.stderr.write(d));
  if (!await warteAuf()) {
    console.error('mit-vorschau: Vorschau antwortet nicht.');
    server.kill('SIGTERM');
    process.exit(1);
  }
}

const beenden = (code) => {
  if (server && !server.killed) server.kill('SIGTERM');
  process.exit(code);
};
process.on('SIGINT', () => beenden(130));
process.on('SIGTERM', () => beenden(143));

for (const befehl of BEFEHLE) {
  console.log(`\nmit-vorschau: ${befehl.join(' ')} ${URL_BASIS}`);
  const code = await new Promise((fertig) => {
    const lauf = spawn(befehl[0], [...befehl.slice(1), URL_BASIS], { cwd: WURZEL, stdio: 'inherit' });
    lauf.on('exit', (c) => fertig(c === null ? 1 : c));
    lauf.on('error', (e) => { console.error('mit-vorschau:', e.message); fertig(1); });
  });
  if (code !== 0) beenden(code);
}
beenden(0);
