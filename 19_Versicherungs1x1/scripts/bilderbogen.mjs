// ===========================================================================
// Bilderbogen — Screenshots aller Ansichten in mehreren Breiten.
//
// Aufruf: node scripts/bilderbogen.mjs <zielordner> [url]
//         BREITEN=1600,1280,1024,390 node scripts/bilderbogen.mjs bilder
//
// Legt je Breite einen Unterordner an. Zweck ist die Gestaltungsprüfung: wer
// das Aussehen beurteilt, soll jede Ansicht sehen, ohne selbst zu klicken.
//
// Bilder:
//   01 Startseite (leer · mit Fortschritt · unterer Teil)
//   02 Kapitelseite in drei Tiefen (Basis · Vertiefung · Experte)
//   03 die vier neuen Kapitel mit ihren Grafiken (Formelaufbau, Simulation,
//      Risikokette, Kundengruppen, Stufentabelle GuV, morphologischer Kasten)
//   04 Archetypenkarte und Prozesskette (Bestandskapitel mit neuen Grafiken)
//   05 Glossar (Liste · Filter · Deeplink · Hover-Card)
//   06 Wissenscheck (Einrichtung · Frage · Rückmeldung · Ergebnis)
//   07 Suchpalette (leer · Treffer)
//   08 Tastaturhilfe · 09 Umfangs-Panel · 10 Schublade (nur schmal)
//   11 Quellen-Popover · 12 Blocktypen-Bogen (jeder Typ einmal)
// ===========================================================================
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HIER = path.dirname(fileURLToPath(import.meta.url));
const ZIEL = process.argv[2] || 'bilder';
const URL_BASIS = (process.argv[3] || 'http://127.0.0.1:4173/').replace(/\/?$/, '/');
const BREITEN = (process.env.BREITEN || '1600,1280,1024,390').split(',').map(Number);
const BROWSER = process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const DATEN = JSON.parse(fs.readFileSync(path.join(HIER, '..', 'public', 'data', 'chapters.json'), 'utf8'));

// Je Blocktyp die Einheit, in der er zuerst vorkommt — für den Blocktypen-Bogen
const TYP_ORT = new Map();
for (const k of DATEN.chapters) {
  for (const s of k.subChapters || []) {
    for (const lv of ['level1', 'level2', 'level3']) {
      for (const b of s[lv] || []) if (b && b.type && !TYP_ORT.has(b.type)) TYP_ORT.set(b.type, { kapitel: k.id, einheit: s.id, titel: b.title || '' });
    }
  }
}

const browser = await chromium.launch({ executablePath: BROWSER });

for (const breite of BREITEN) {
  const ordner = path.join(ZIEL, String(breite));
  fs.mkdirSync(ordner, { recursive: true });
  const ctx = await browser.newContext({
    viewport: { width: breite, height: breite <= 480 ? 900 : 1100 },
    deviceScaleFactor: 1,
  });
  await ctx.addInitScript(() => { try { localStorage.clear(); } catch { /* privat */ } });
  const seite = await ctx.newPage();
  const fehler = [];
  seite.on('pageerror', (e) => fehler.push(String(e).split('\n')[0]));

  async function ruhe(ms = 450) {
    await seite.waitForTimeout(ms);
    await seite.mouse.move(2, 2);
    await seite.waitForTimeout(150);
  }
  async function schuss(name, y = 0) {
    await seite.evaluate((o) => window.scrollTo(0, o), y);
    await ruhe(320);
    await seite.screenshot({ path: path.join(ordner, `${name}.png`) });
    console.log(`  ${breite}  ${name}`);
  }
  async function gehe(hash, ms = 600) {
    await seite.goto(`${URL_BASIS}${hash}`, { waitUntil: 'networkidle' });
    await ruhe(ms);
  }
  async function klick(muster, ms = 400) {
    try {
      await seite.getByRole('button', { name: muster }).or(seite.getByRole('radio', { name: muster })).first().click({ timeout: 3500 });
      await seite.waitForTimeout(ms);
      return true;
    } catch { return false; }
  }
  async function tiefe(wert) {
    const label = { basis: 'Basis', vertiefung: 'Vertiefung', experte: 'Experte' }[wert];
    const knopf = seite.locator('.tiefenwahl .segment-option').filter({ hasText: new RegExp(`^${label}$`) }).first();
    if (await knopf.count() === 0 || await knopf.isDisabled().catch(() => true)) return false;
    await knopf.click().catch(() => {});
    await seite.waitForTimeout(350);
    return true;
  }
  /** Bild mit einem Block oben im Bild (unter der Topbar), damit er ganz zu sehen ist. */
  async function schussBeiBlock(name, typ) {
    const y = await seite.evaluate((t) => {
      const el = document.querySelector(`[data-typ="${t}"]`);
      if (!el) return null;
      const topbar = document.querySelector('.topbar');
      const versatz = (topbar ? topbar.getBoundingClientRect().height : 56) + 12;
      return Math.max(0, window.scrollY + el.getBoundingClientRect().top - versatz);
    }, typ);
    if (y === null) { console.log(`  ${breite}  ${name} — Blocktyp ${typ} nicht gefunden`); return; }
    await schuss(name, y);
  }

  // -------------------------------------------------------------- Startseite
  await gehe('#/');
  await schuss('01-start-oben');
  await schuss('01-start-unten', 900);
  await seite.evaluate(() => window.scrollTo(0, 99999));
  await ruhe(250);
  await schuss('01-start-ende', 99999);

  // ------------------------------------------------- Kapitelseite, drei Tiefen
  await gehe('#/kapitel/03-produktlandschaft/leben-rente');
  await tiefe('basis');
  await schuss('02-einheit-basis');
  await schuss('02-einheit-basis-mitte', 900);
  await tiefe('vertiefung');
  await schuss('02-einheit-vertiefung');
  await tiefe('experte');
  await schuss('02-einheit-experte');
  // Inhaltsverzeichnis kompakt aufklappen (unter 1440 px ein Knopf)
  if (await klick(/Auf dieser Seite/, 300)) await schuss('02-einheit-verzeichnis');
  await tiefe('basis');

  // ----------------------------------------------- die vier neuen Kapitel
  await gehe('#/kapitel/grundlagen/definition');
  await schuss('03-grundlagen-definition');
  await gehe('#/kapitel/grundlagen/praemie');
  await schussBeiBlock('03-grundlagen-formelaufbau', 'formelAufbau');
  await gehe('#/kapitel/grundlagen/grosse-zahlen');
  await schussBeiBlock('03-grundlagen-simulation', 'simulationGrosseZahlen');
  // Simulation bedient: Regler ein Stück nach rechts
  {
    const regler = seite.locator('[data-typ="simulationGrosseZahlen"] input[type="range"]').first();
    if (await regler.count()) {
      await regler.focus();
      for (let i = 0; i < 12; i += 1) { await seite.keyboard.press('ArrowRight'); await seite.waitForTimeout(20); }
      await schussBeiBlock('03-grundlagen-simulation-bedient', 'simulationGrosseZahlen');
    }
  }
  await gehe('#/kapitel/grundlagen/risikokette');
  await schussBeiBlock('03-grundlagen-risikokette', 'risikokette');
  await gehe('#/kapitel/kundengruppen/privatkunden');
  await schuss('03-kundengruppen-privat');
  await gehe('#/kapitel/kundengruppen/industriekunden');
  await schuss('03-kundengruppen-industrie');
  await gehe('#/kapitel/geschaeftsmodell/guv');
  await schussBeiBlock('03-geschaeftsmodell-stufentabelle', 'stufenTabelle');
  await gehe('#/kapitel/geschaeftsmodell/kennzahlen');
  await schussBeiBlock('03-geschaeftsmodell-rechner', 'combinedRatioCalc');
  await gehe('#/kapitel/beratungspraxis/verortung');
  await schussBeiBlock('03-beratungspraxis-morphkasten', 'morphologischerKasten');
  // Ein Beispiel des Kastens öffnen
  {
    const beispiel = seite.locator('[data-typ="morphologischerKasten"] button').filter({ hasText: /Wachstum|Vertrieb|Schaden|Kosten|Ziel/ }).first();
    if (await beispiel.count()) {
      await beispiel.click().catch(() => {});
      await seite.waitForTimeout(400);
      await schussBeiBlock('03-beratungspraxis-morphkasten-beispiel', 'morphologischerKasten');
    }
  }

  // ------------------------------- Archetypenkarte und Prozesskette
  await gehe('#/kapitel/02-marktteilnehmer/erstversicherer');
  await schussBeiBlock('04-archetypenkarte', 'archetypenKarte');
  await gehe('#/kapitel/07-wertschoepfungskette/ueberblick');
  await schussBeiBlock('04-prozesskette', 'prozessKette');
  {
    const glied = seite.locator('[data-typ="prozessKette"] button').nth(1);
    if (await glied.count()) {
      await glied.click().catch(() => {});
      await seite.waitForTimeout(400);
      await schussBeiBlock('04-prozesskette-geoeffnet', 'prozessKette');
    }
  }

  // ------------------------------------------------------------------ Glossar
  await gehe('#/glossar');
  await schuss('05-glossar');
  await schuss('05-glossar-mitte', 800);
  {
    const feld = seite.getByLabel('Glossar durchsuchen');
    if (await feld.count()) { await feld.fill('Solvency'); await seite.waitForTimeout(350); await schuss('05-glossar-suche'); await feld.fill(''); }
    const tag = seite.locator('.glossar-tags button').nth(2);
    if (await tag.count()) { await tag.click().catch(() => {}); await seite.waitForTimeout(300); await schuss('05-glossar-thema'); await tag.click().catch(() => {}); }
  }
  const slug = (DATEN.glossary || []).find((g) => g.slug === 'combined-ratio') || (DATEN.glossary || [])[0];
  if (slug && slug.slug) { await gehe(`#/glossar/${slug.slug}`, 800); await schuss('05-glossar-deeplink'); }
  // Hover-Card im Text
  await gehe('#/kapitel/07-wertschoepfungskette/ueberblick');
  {
    const begriff = seite.locator('a.begriff').first();
    if (await begriff.count()) {
      await begriff.scrollIntoViewIfNeeded().catch(() => {});
      const k = await begriff.boundingBox().catch(() => null);
      if (k) {
        await seite.mouse.move(k.x + k.width / 2, k.y + k.height / 2);
        await seite.waitForTimeout(900);
        await seite.screenshot({ path: path.join(ordner, '05-hoverkarte.png') });
        console.log(`  ${breite}  05-hoverkarte`);
        await seite.mouse.move(2, 2);
      }
    }
  }

  // -------------------------------------------------------------- Wissenscheck
  await gehe('#/wissenscheck');
  await schuss('06-wissenscheck-einrichtung');
  if (await klick(/^Kapitel-Check$/, 400)) await schuss('06-wissenscheck-kapitelwahl');
  await klick(/^Schnellcheck$/, 300);
  if (await klick(/starten$/, 700)) {
    await schuss('06-wissenscheck-frage');
    await seite.keyboard.press('1');
    await seite.waitForTimeout(400);
    await schuss('06-wissenscheck-rueckmeldung');
    for (let i = 0; i < 30; i += 1) {
      if (await seite.locator('.quiz-ergebnis').count()) break;
      const n = await seite.locator('.quiz-antwort').count().catch(() => 0);
      await seite.keyboard.press(String((i % Math.max(1, n)) + 1));
      await seite.waitForTimeout(80);
      await seite.keyboard.press('Enter');
      await seite.waitForTimeout(140);
    }
    if (await seite.locator('.quiz-ergebnis').count()) {
      await schuss('06-wissenscheck-ergebnis');
      await schuss('06-wissenscheck-ergebnis-unten', 800);
    }
  }
  // Startseite mit Fortschritt
  await gehe('#/');
  await schuss('06-start-mit-fortschritt');

  // --------------------------------------------------------------- Suchpalette
  await seite.keyboard.press('Control+k');
  await ruhe(500);
  await seite.screenshot({ path: path.join(ordner, '07-suche-leer.png') });
  console.log(`  ${breite}  07-suche-leer`);
  await seite.keyboard.type('Solvency', { delay: 25 });
  await seite.waitForTimeout(600);
  await seite.screenshot({ path: path.join(ordner, '07-suche-treffer.png') });
  console.log(`  ${breite}  07-suche-treffer`);
  await seite.keyboard.press('Escape');
  await ruhe(300);

  // --------------------------------------------- Tastaturhilfe, Umfang, Drawer
  await seite.keyboard.press('?');
  await ruhe(450);
  await seite.screenshot({ path: path.join(ordner, '08-tastaturhilfe.png') });
  console.log(`  ${breite}  08-tastaturhilfe`);
  await seite.keyboard.press('Escape');
  await ruhe(300);

  await seite.keyboard.press('Control+Shift+u');
  await ruhe(450);
  await seite.screenshot({ path: path.join(ordner, '09-umfang-panel.png') });
  console.log(`  ${breite}  09-umfang-panel`);
  await seite.keyboard.press('Escape');
  await ruhe(300);

  if (breite <= 1023) {
    const menue = seite.locator('.topbar-menue');
    if (await menue.count()) {
      await menue.click().catch(() => {});
      await ruhe(450);
      await seite.screenshot({ path: path.join(ordner, '10-schublade.png') });
      console.log(`  ${breite}  10-schublade`);
      await seite.keyboard.press('Escape');
      await ruhe(250);
    }
  }

  // ---------------------------------------------------------- Quellen-Popover
  await gehe('#/kapitel/01-marktueberblick/marktstruktur');
  {
    const q = seite.locator('.bl-quelle').first();
    if (await q.count()) {
      await q.scrollIntoViewIfNeeded().catch(() => {});
      await q.click().catch(() => {});
      await seite.waitForTimeout(450);
      await seite.screenshot({ path: path.join(ordner, '11-quellen-popover.png') });
      console.log(`  ${breite}  11-quellen-popover`);
      await seite.keyboard.press('Escape');
    }
  }

  // ------------------------------------------------------- Blocktypen-Bogen
  // Jeder der 25 Blocktypen einmal, als Element aufgenommen (nicht das Fenster),
  // damit die Gestaltungsprüfung jede Grafie einzeln beurteilen kann.
  fs.mkdirSync(path.join(ordner, '12-blocktypen'), { recursive: true });
  for (const [typ, ort] of TYP_ORT) {
    await gehe(`#/kapitel/${ort.kapitel}/${ort.einheit}`, 350);
    await tiefe('experte');
    const el = seite.locator(`[data-typ="${typ}"]`).first();
    if (await el.count() === 0) { console.log(`  ${breite}  Blocktyp ${typ} fehlt`); continue; }
    await el.scrollIntoViewIfNeeded().catch(() => {});
    await ruhe(300);
    await el.screenshot({ path: path.join(ordner, '12-blocktypen', `${typ}.png`) }).catch(() => {});
    console.log(`  ${breite}  12-blocktypen/${typ}`);
  }

  if (fehler.length) {
    console.log(`  ${breite}  LAUFZEITFEHLER: ${fehler.length}`);
    fehler.slice(0, 5).forEach((f) => console.log('     ', f));
  }
  await ctx.close();
}

await browser.close();
console.log(`\nBilderbogen liegt in ${path.resolve(ZIEL)} (Breiten: ${BREITEN.join(', ')}).`);
