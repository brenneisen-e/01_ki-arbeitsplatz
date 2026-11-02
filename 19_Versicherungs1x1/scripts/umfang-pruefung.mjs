// ===========================================================================
// Prüfung der Umfangssteuerung (Vorführ-/Freigabestand).
//
// Aufruf: node scripts/umfang-pruefung.mjs [URL] [Screenshot-Ordner]
//         Standard-URL http://127.0.0.1:4173/ ; ohne Ordner keine Bilder.
//
// Die Umfangssteuerung blendet Kapitel aus: Seitenleiste, Startseite,
// Kennzahlen, Suche, Glossar, Wissenscheck, Deeplinks und Fortschritt müssen
// dann übereinstimmend nur den sichtbaren Teil zeigen — und nirgends darf ein
// ausgeblendetes Kapitel durchscheinen (Titel im Text, Kennung im Markup).
//
// Alle Erwartungen kommen aus public/data/chapters.json, nicht aus festen
// Zahlen: das Skript bleibt gültig, wenn Kapitel dazukommen. Textvergleiche
// laufen über glatt(), weil lib/format.js geschützte Leerzeichen setzt.
// ===========================================================================
import { chromium } from 'playwright';
import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HIER = path.dirname(fileURLToPath(import.meta.url));
const BASIS = (process.argv[2] || 'http://127.0.0.1:4173/').replace(/\/?$/, '/');
const ORDNER = process.argv[3] || '';
const CHROME = process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
if (ORDNER) mkdirSync(ORDNER, { recursive: true });

const DATEN = JSON.parse(readFileSync(path.join(HIER, '..', 'public', 'data', 'chapters.json'), 'utf8'));

let fehler = 0;
let geprueft = 0;
const pruefe = (ok, was, zusatz = '') => {
  geprueft += 1;
  if (!ok) fehler += 1;
  console.log(`${ok ? 'OK  ' : 'FEHL'} ${was}${zusatz ? ` — ${zusatz}` : ''}`);
};
const glatt = (t) => String(t == null ? '' : t).replace(/ /g, ' ').trim();
const bild = async (seite, name) => { if (ORDNER) await seite.screenshot({ path: path.join(ORDNER, `${name}.png`) }); };

// --------------------------------------------------- Erwartungen aus den Daten
const KAPITEL = DATEN.chapters;
const ALLE_KAPITEL = KAPITEL.length;
const ALLE_EINHEITEN = KAPITEL.reduce((s, k) => s + (k.subChapters || []).length, 0);
const ALLE_FRAGEN = KAPITEL.reduce((s, k) => s + (k.quiz || []).length, 0);
const ALLE_BEGRIFFE = (DATEN.glossary || []).length;
const ERSTES = KAPITEL[0];
const ERSTES_EINHEITEN = (ERSTES.subChapters || []).length;
const ERSTES_FRAGEN = (ERSTES.quiz || []).length;
const VERSTECKT = KAPITEL.slice(1);
const VERSTECKT_IDS = VERSTECKT.map((k) => k.id);
const VERSTECKT_TITEL = VERSTECKT.map((k) => k.title);

const textVon = (o, out = []) => {
  if (typeof o === 'string') out.push(o);
  else if (Array.isArray(o)) o.forEach((x) => textVon(x, out));
  else if (o && typeof o === 'object') Object.values(o).forEach((x) => textVon(x, out));
  return out;
};
// Titel eines ausgeblendeten Kapitels taugen nur als Beweis, wenn sie nicht
// ohnehin im sichtbaren Kapitel oder im Glossar vorkommen („Kundengruppen“,
// „Regulatorik“ und „Zukunftsthemen“ sind auch Fachwörter und Schlagworte).
const SICHTBARER_TEXT = glatt([...textVon(ERSTES), ...textVon(DATEN.glossary || [])].join(' '));
const VERSTECKT_EINDEUTIG = VERSTECKT_TITEL.filter((t) => !SICHTBARER_TEXT.includes(t));
// Ein Glossarbegriff, der im sichtbaren Kapitel nicht vorkommt (für Deeplinks)
const BEGRIFF_AUSSERHALB = (DATEN.glossary || [])
  .find((g) => g.slug && g.term.length > 6 && !SICHTBARER_TEXT.includes(g.term));
const LESESTAND_PROZENT = `${Math.round((1 / ALLE_EINHEITEN) * 100)} %`;

console.log(`Grundlage: ${ALLE_KAPITEL} Kapitel, ${ALLE_EINHEITEN} Lerneinheiten, ${ALLE_FRAGEN} Fragen, ${ALLE_BEGRIFFE} Begriffe.`);
console.log(`Sichtbares Kapitel im Versuch: ${ERSTES.id} („${ERSTES.title}“) mit ${ERSTES_EINHEITEN} Einheiten und ${ERSTES_FRAGEN} Fragen.`);
console.log(`Beweistitel ausgeblendeter Kapitel: ${VERSTECKT_EINDEUTIG.join(' · ') || '(keine eindeutigen)'}\n`);

const browser = await chromium.launch({ executablePath: CHROME });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const seite = await ctx.newPage();
const konsole = [];
seite.on('console', (m) => { if (m.type() === 'error' && !/favicon/i.test(m.text())) konsole.push(m.text()); });
seite.on('pageerror', (e) => konsole.push(`pageerror: ${e.message}`));
seite.on('response', (r) => { if (r.status() >= 400) konsole.push(`HTTP ${r.status()} ${r.url()}`); });

const warte = async () => {
  await seite.waitForSelector('.sidebar-spalte .nav-nummer, .start-kennzahl', { timeout: 10000 });
  await seite.waitForTimeout(400);
};
const kapitelInSidebar = () => seite.$$eval('.sidebar-spalte .nav-eintrag .nav-nummer', (n) => n.length);
const sidebarTitel = () => seite.$$eval('.sidebar-spalte .nav-eintrag .nav-titel', (n) => n.map((e) => e.textContent.trim()));
// CountUp schreibt die Zahl zweimal (sichtbar + sr-only) — nur die sichtbare zählt.
const kennzahlen = () => seite.$$eval('.start-kennzahl', (n) => Object.fromEntries(n.map((e) => [
  e.querySelector('.start-kennzahl-label').textContent.trim(),
  (e.querySelector('.start-kennzahl-wert [aria-hidden="true"]') || e.querySelector('.start-kennzahl-wert')).textContent.trim(),
])));
const ringZahl = async () => glatt(await seite.$eval('.topbar-fortschritt .fortschrittsring-zahl', (e) => e.textContent).catch(() => '-'));
const sichtbarerText = async () => {
  const haupt = await seite.$eval('#inhalt', (e) => e.innerText);
  const leiste = await seite.$eval('.sidebar-spalte', (e) => e.innerText);
  const markup = await seite.$eval('#inhalt', (e) => e.innerHTML) + await seite.$eval('.sidebar-spalte', (e) => e.innerHTML);
  return { text: glatt(`${haupt}\n${leiste}`), markup };
};

// ------------------------------------------------------------ 1. Voller Umfang
await seite.goto(BASIS, { waitUntil: 'networkidle' });
await warte();
const k1 = await kennzahlen();
pruefe((await kapitelInSidebar()) === ALLE_KAPITEL, `voller Umfang: ${ALLE_KAPITEL} Kapitel in der Seitenleiste`, `${await kapitelInSidebar()}`);
pruefe(k1.Kapitel === String(ALLE_KAPITEL) && k1.Lerneinheiten === String(ALLE_EINHEITEN)
  && k1.Quizfragen === String(ALLE_FRAGEN) && k1.Fachbegriffe === String(ALLE_BEGRIFFE),
`voller Umfang: Kennzahlen ${ALLE_KAPITEL} / ${ALLE_EINHEITEN} / ${ALLE_FRAGEN} / ${ALLE_BEGRIFFE}`, JSON.stringify(k1));
const titelDa = (await sidebarTitel()).filter((t) => VERSTECKT_TITEL.includes(t)).length;
pruefe(titelDa === VERSTECKT_TITEL.length, 'voller Umfang: alle Kapiteltitel in der Seitenleiste', `${titelDa}/${VERSTECKT_TITEL.length}`);
pruefe((await seite.evaluate(() => document.documentElement.getAttribute('data-umfang'))) === null,
  'voller Umfang: kein data-umfang am Wurzelelement');
const punktVoll = await seite.evaluate(() => getComputedStyle(document.querySelector('.marke-monogramm'), '::after').content);
pruefe(punktVoll === 'none' || punktVoll === 'normal', 'voller Umfang: kein Punkt am Monogramm', punktVoll);
await bild(seite, '01-voll-start');

// Lesestand in einem später ausgeblendeten Kapitel anlegen
await seite.goto(`${BASIS}#/kapitel/${VERSTECKT_IDS[VERSTECKT_IDS.length - 1]}`, { waitUntil: 'networkidle' });
await seite.waitForTimeout(700);
const knopf = await seite.$('button:has-text("Als gelesen markieren")');
pruefe(Boolean(knopf), 'ausgeblendet-später: Gelesen-Knopf gefunden');
if (knopf) await knopf.click();
await seite.waitForTimeout(400);
await seite.goto(`${BASIS}#/`, { waitUntil: 'networkidle' });
await warte();
pruefe((await ringZahl()) === LESESTAND_PROZENT, `Lesestand gespeichert: Topbar zeigt ${LESESTAND_PROZENT}`, await ringZahl());

// -------------------------------------------------------- 2. ?umfang=erstes
await seite.goto(`${BASIS}?umfang=erstes`, { waitUntil: 'networkidle' });
await warte();
pruefe(!seite.url().includes('umfang='), 'Parameter ist aus der Adresszeile verschwunden', seite.url());
pruefe((await kapitelInSidebar()) === 1, 'begrenzt: genau ein Kapitel in der Seitenleiste', `${await kapitelInSidebar()}`);
const k2 = await kennzahlen();
pruefe(k2.Kapitel === '1' && k2.Lerneinheiten === String(ERSTES_EINHEITEN) && k2.Quizfragen === String(ERSTES_FRAGEN),
  `begrenzt: Kennzahlen 1 Kapitel, ${ERSTES_EINHEITEN} Lerneinheiten, ${ERSTES_FRAGEN} Fragen`, JSON.stringify(k2));
const begriffeImUmfang = Number(k2.Fachbegriffe);
pruefe(begriffeImUmfang > 0 && begriffeImUmfang < ALLE_BEGRIFFE,
  `begrenzt: Glossar auf die Begriffe des Kapitels beschränkt (${begriffeImUmfang} von ${ALLE_BEGRIFFE})`, k2.Fachbegriffe);
pruefe(Number(k2['Minuten Lesezeit']) > 0 && Number(k2['Minuten Lesezeit']) < Number(k1['Minuten Lesezeit']),
  'begrenzt: Lesezeit nur dieses Kapitels', `${k2['Minuten Lesezeit']} von ${k1['Minuten Lesezeit']}`);
const { text: sicht2, markup: markup2 } = await sichtbarerText();
const titelLeck = VERSTECKT_EINDEUTIG.filter((t) => sicht2.includes(t));
pruefe(titelLeck.length === 0, 'begrenzt: kein Titel eines ausgeblendeten Kapitels im sichtbaren Text', titelLeck.join(', '));
const idLeck = VERSTECKT_IDS.filter((t) => markup2.includes(t));
pruefe(idLeck.length === 0, 'begrenzt: keine Kennung eines ausgeblendeten Kapitels im Markup', idLeck.join(', '));
const karten = await seite.$$eval('.kapitel-karte', (n) => n.length);
pruefe(karten === 1, 'begrenzt: genau eine Kapitelkarte im Lernpfad', `${karten}`);
const wochenKapitel = await seite.$$eval('.woche-kapitel', (n) => n.length);
pruefe(wochenKapitel === 1, 'begrenzt: „Erste Woche“ führt nur das sichtbare Kapitel', `${wochenKapitel}`);
pruefe((await seite.evaluate(() => document.documentElement.getAttribute('data-umfang'))) === 'begrenzt',
  'begrenzt: data-umfang="begrenzt" am Wurzelelement');
const punkt = await seite.evaluate(() => {
  const s = getComputedStyle(document.querySelector('.marke-monogramm'), '::after');
  return { w: s.width, h: s.height, farbe: s.backgroundColor, titel: document.querySelector('.marke-monogramm').getAttribute('title') };
});
pruefe(punkt.w === '3px' && punkt.h === '3px' && punkt.farbe === 'rgb(134, 188, 37)' && punkt.titel === null,
  'begrenzt: 3-px-Punkt in Lime am Monogramm, ohne Titel', JSON.stringify(punkt));
pruefe((await ringZahl()) === '0 %', 'begrenzt: Fortschritt zählt nur sichtbare Kapitel (0 %)', await ringZahl());
await bild(seite, '02-begrenzt-start');

// ------------------------------------------------------------------ 3. Suche
for (const wort of ['Solvency', 'Provision', 'Regulatorik']) {
  await seite.keyboard.press('/');
  await seite.waitForSelector('.suche-eingabe', { timeout: 5000 });
  await seite.fill('.suche-eingabe', wort);
  await seite.waitForTimeout(600);
  const treffer = await seite.$$eval('.suche-treffer', (n) => n.map((e) => ({
    titel: (e.querySelector('.suche-treffer-titel')?.textContent || '').trim(),
    pfad: (e.querySelector('.suche-treffer-pfad')?.textContent || '').trim(),
    typ: e.getAttribute('data-typ') || '',
  })));
  const schlecht = treffer.filter((t) => VERSTECKT_TITEL.some(
    (v) => (t.typ !== 'glossar' && t.pfad.includes(v)) || t.titel === v,
  ));
  pruefe(schlecht.length === 0, `Suche „${wort}“: kein Treffer aus einem ausgeblendeten Kapitel`,
    schlecht.slice(0, 3).map((t) => `${t.titel} (${t.pfad})`).join(' | '));
  const markupPalette = await seite.$eval('.suche-palette', (e) => e.innerHTML);
  const paletteLeck = VERSTECKT_IDS.filter((id) => markupPalette.includes(id));
  pruefe(paletteLeck.length === 0, `Suche „${wort}“: keine Kennung eines ausgeblendeten Kapitels in der Palette`, paletteLeck.join(', '));
  if (wort === 'Solvency') await bild(seite, '03-suche-solvency');
  await seite.keyboard.press('Escape');
  await seite.waitForTimeout(250);
}

// ----------------------------------------------------------- 4. Wissenscheck
await seite.goto(`${BASIS}#/wissenscheck`, { waitUntil: 'networkidle' });
await seite.waitForTimeout(800);
await seite.click('[role="radio"]:has-text("Kapitel-Check")');
await seite.waitForTimeout(400);
const quizText = glatt(await seite.$eval('#inhalt', (e) => e.innerText));
const chips = await seite.$$eval('.kapitel-wahl-liste .chip', (n) => n.map((e) => e.innerText.replace(/\s+/g, ' ').trim()));
pruefe(chips.length === 1 && chips[0].includes(ERSTES.title.split(':')[0]),
  'Wissenscheck: Kapitelwahl zeigt nur das sichtbare Kapitel', `${chips.length}: ${chips.join(' | ')}`);
const fragenZahlen = [...new Set(quizText.match(/\d+ Fragen/g) || [])];
pruefe(fragenZahlen.every((f) => Number(f.split(' ')[0]) <= ERSTES_FRAGEN),
  `Wissenscheck: keine Fragenzahl über dem sichtbaren Umfang (${ERSTES_FRAGEN})`, fragenZahlen.join(', '));
const quizLeck = VERSTECKT_EINDEUTIG.filter((t) => quizText.includes(t));
pruefe(quizLeck.length === 0, 'Wissenscheck: kein ausgeblendetes Kapitel im Text', quizLeck.join(', '));
await bild(seite, '04-wissenscheck');

// -------------------------------------------------------------- 5. Deeplinks
const verstecktesKapitel = VERSTECKT[0];
const verstecktEinheit = (verstecktesKapitel.subChapters || [])[0];
const ziele = [
  [`#/kapitel/${verstecktesKapitel.id}/${verstecktEinheit ? verstecktEinheit.id : ''}`, 'Lerneinheit eines ausgeblendeten Kapitels'],
  [`#/kapitel/${verstecktesKapitel.id}`, 'ausgeblendetes Kapitel'],
  [`#/glossar/${BEGRIFF_AUSSERHALB ? BEGRIFF_AUSSERHALB.slug : 'gibt-es-nicht'}`, 'Glossarbegriff außerhalb des Umfangs'],
  ['#/glossar/gibt-es-gar-nicht', 'unbekannter Glossarbegriff'],
  [`#/wissenscheck/${verstecktesKapitel.id}`, 'Wissenscheck eines ausgeblendeten Kapitels'],
];
for (const [hash, was] of ziele) {
  await seite.goto(`${BASIS}${hash}`, { waitUntil: 'networkidle' });
  await seite.waitForTimeout(800);
  const hier = seite.url().split('#')[1] || '';
  const aufStart = Boolean(await seite.$('.start-hero'));
  const seitentext = glatt(await seite.$eval('#inhalt', (e) => e.innerText));
  const hinweis = /gibt es keinen Eintrag|nicht gefunden/.test(seitentext);
  pruefe(hier === '/' && aufStart && !hinweis, `Deeplink ${was}: still auf die Startseite`,
    `Hash #${hier}${hinweis ? ' + Hinweistext!' : ''}`);
}

// ------------------------------------------------- 6. Neuladen, Liste, Unsinn
await seite.goto(BASIS, { waitUntil: 'networkidle' });
await warte();
pruefe((await kapitelInSidebar()) === 1, 'Neuladen: Umfang bleibt (localStorage)', `${await kapitelInSidebar()}`);
await seite.goto(`${BASIS}?umfang=${ERSTES.id},kapitel-das-es-nicht-gibt`, { waitUntil: 'networkidle' });
await warte();
pruefe((await kapitelInSidebar()) === 1, 'Liste mit unbekannter Kennung: nur das bekannte Kapitel', `${await kapitelInSidebar()}`);
await seite.goto(`${BASIS}#/glossar?umfang=alles`, { waitUntil: 'networkidle' });
await seite.waitForTimeout(900);
pruefe(!seite.url().includes('umfang=') && (seite.url().split('#')[1] || '').startsWith('/glossar'),
  'Parameter hinter dem Hash: wirkt, verschwindet, Route bleibt', seite.url());
pruefe((await kapitelInSidebar()) === ALLE_KAPITEL, 'umfang=alles: alles wieder da', `${await kapitelInSidebar()}`);
await seite.goto(`${BASIS}?umfang=nur-quatsch`, { waitUntil: 'networkidle' });
await warte();
pruefe((await kapitelInSidebar()) === ALLE_KAPITEL, 'unbekannter Parameterwert: voller Umfang statt leerer App', `${await kapitelInSidebar()}`);

// ------------------------------------------------------------------ 7. Panel
await seite.goto(`${BASIS}?umfang=erstes`, { waitUntil: 'networkidle' });
await warte();
await seite.keyboard.press('Control+Shift+U');
await seite.waitForSelector('[role="dialog"]', { timeout: 5000 });
pruefe((await seite.$eval('[role="dialog"] h2', (e) => e.textContent.trim())) === 'Umfang',
  'Panel öffnet mit Strg+Umschalt+U und heißt „Umfang“');
const wirkung = glatt(await seite.$eval('.umfang-wirkung', (e) => e.innerText)).replace(/\s+/g, ' ');
const wirkungMuster = new RegExp(`^Sichtbar: 1 von ${ALLE_KAPITEL} Kapiteln, ${ERSTES_EINHEITEN} Lerneinheiten, ${ERSTES_FRAGEN} Fragen, \\d+ Min\\. Lesezeit$`);
pruefe(wirkungMuster.test(wirkung), 'Panel: Wirkungszeile', wirkung);
const kaestchen = await seite.$$eval('.umfang-zeile input[type="checkbox"]', (n) => n.map((e) => e.checked));
pruefe(kaestchen.length === ALLE_KAPITEL && kaestchen.filter(Boolean).length === 1 && kaestchen[0] === true,
  `Panel: ${ALLE_KAPITEL} Kapitel, nur das erste angehakt`, JSON.stringify(kaestchen));
const panelText = glatt(await seite.$eval('[role="dialog"]', (e) => e.innerText));
pruefe(!/Demo|Geheim|verbergen|verstecken|Kollege/i.test(panelText), 'Panel: sachliche Sprache ohne „Demo“ oder „Geheim“', panelText.slice(0, 80));
const profile = await seite.$$eval('[role="radiogroup"] [role="radio"]', (n) => n.map((e) => `${e.textContent.trim()}${e.getAttribute('aria-checked') === 'true' ? '*' : ''}`));
pruefe(profile.join(' | ') === 'Alles zeigen | Nur das erste Kapitel* | Eigene Auswahl',
  'Panel: Profilwahl mit „Nur das erste Kapitel“ aktiv', profile.join(' | '));
await bild(seite, '05-panel');

// Eigene Auswahl: zweites Kapitel dazu
await seite.click('.umfang-liste li:nth-child(2) input');
await seite.waitForTimeout(400);
pruefe((await kapitelInSidebar()) === 2, 'Panel: Kästchen wirkt sofort (2 Kapitel)', `${await kapitelInSidebar()}`);
const profile2 = await seite.$$eval('[role="radiogroup"] [role="radio"][aria-checked="true"]', (n) => n.map((e) => e.textContent.trim()));
pruefe(profile2.join('') === 'Eigene Auswahl', 'Panel: Profil springt auf „Eigene Auswahl“', profile2.join(''));
// alle Haken weg → voller Umfang statt leerer App
await seite.click('.umfang-liste li:nth-child(1) input');
await seite.click('.umfang-liste li:nth-child(2) input');
await seite.waitForTimeout(400);
pruefe((await kapitelInSidebar()) === ALLE_KAPITEL, 'Panel: kein Haken bedeutet voller Umfang (nie leer)', `${await kapitelInSidebar()}`);
await seite.click('[role="dialog"] button:has-text("Nur das erste Kapitel")');
await seite.waitForTimeout(400);
pruefe((await kapitelInSidebar()) === 1, 'Panel: „Nur das erste Kapitel“', `${await kapitelInSidebar()}`);
await seite.click('[role="dialog"] button:has-text("Alles zeigen")');
await seite.waitForTimeout(500);
pruefe((await kapitelInSidebar()) === ALLE_KAPITEL, 'Panel: „Alles zeigen“ bringt alles zurück', `${await kapitelInSidebar()}`);
pruefe((await ringZahl()) === LESESTAND_PROZENT, `Panel: gespeicherter Lesestand ist wieder da (${LESESTAND_PROZENT})`, await ringZahl());

// Fortschritt anzeigen aus / ein
await seite.click('.umfang-schalter input');
await seite.waitForTimeout(500);
pruefe((await ringZahl()) === '0 %', 'Fortschritt aus: Topbar-Ring 0 %', await ringZahl());
await seite.keyboard.press('Escape');
await seite.waitForTimeout(400);
const standText = glatt(await seite.$eval('#inhalt', (e) => e.innerText));
pruefe(/hier starten/i.test(standText) && new RegExp(`0 von ${ALLE_EINHEITEN} Lerneinheiten gelesen`).test(standText),
  `Fortschritt aus: „Hier starten“ und „0 von ${ALLE_EINHEITEN}“ in Dein Stand`,
  standText.match(new RegExp(`\\d+ von ${ALLE_EINHEITEN}[^\\n]*`))?.[0] || '');
pruefe(/Fällige Wiederholungen\s*keine/.test(standText), 'Fortschritt aus: keine fälligen Wiederholungen');
const ringeSidebar = await seite.$$eval('.sidebar-spalte .fortschrittsring', (n) => n.map((e) => e.getAttribute('aria-label') || ''));
pruefe(ringeSidebar.every((l) => /^0 von/.test(glatt(l))), 'Fortschritt aus: Ringe der Seitenleiste ohne Marken', ringeSidebar.slice(0, 3).map(glatt).join(' | '));
await bild(seite, '06-fortschritt-aus');
await seite.focus('.marke');
await seite.keyboard.press('Control+Shift+U');
await seite.waitForSelector('[role="dialog"]');
await seite.click('.umfang-schalter input');
await seite.waitForTimeout(500);
pruefe((await ringZahl()) === LESESTAND_PROZENT, 'Fortschritt ein: Stand kehrt zurück', await ringZahl());
const fokusImPanel = await seite.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]')));
pruefe(fokusImPanel, 'Panel: Fokus liegt im Dialog');
await seite.keyboard.press('Escape');
await seite.waitForTimeout(400);
pruefe(!(await seite.$('[role="dialog"]')), 'Panel: Esc schließt');
pruefe(await seite.evaluate(() => (document.activeElement?.className || '').includes('marke')),
  'Panel: Fokus kehrt zum Auslöser zurück', await seite.evaluate(() => document.activeElement?.className || document.activeElement?.tagName || ''));
// Kürzel steht nicht in der Tastaturhilfe
await seite.keyboard.press('?');
await seite.waitForSelector('[role="dialog"]');
const hilfe = glatt(await seite.$eval('[role="dialog"]', (e) => e.innerText));
pruefe(!/Umfang/i.test(hilfe), 'Tastaturhilfe nennt den Umfang nicht');
await seite.keyboard.press('Escape');
await seite.waitForTimeout(300);

// ------------------------------ 8. Suchindex erneuert sich ohne Neuladen
await seite.goto(`${BASIS}?umfang=erstes`, { waitUntil: 'networkidle' });
await warte();
const zaehleTreffer = async (wort) => {
  await seite.keyboard.press('/');
  await seite.waitForSelector('.suche-eingabe', { timeout: 5000 });
  await seite.fill('.suche-eingabe', wort);
  await seite.waitForTimeout(600);
  const n = await seite.$$eval('.suche-treffer', (k) => k.length);
  await seite.keyboard.press('Escape');
  await seite.waitForTimeout(250);
  return n;
};
const vorher = await zaehleTreffer('Solvency');
await seite.keyboard.press('Control+Shift+U');
await seite.waitForSelector('[role="dialog"]');
await seite.click('[role="dialog"] button:has-text("Alles zeigen")');
await seite.waitForTimeout(500);
await seite.keyboard.press('Escape');
await seite.waitForTimeout(400);
const nachher = await zaehleTreffer('Solvency');
pruefe(nachher > vorher, 'Suchindex erneuert sich beim Umfangswechsel ohne Neuladen', `${vorher} → ${nachher} Treffer`);

// -------------------------- 9. Umfangswechsel mitten im Wissenscheck
await seite.goto(`${BASIS}?umfang=alles`, { waitUntil: 'networkidle' });
await warte();
await seite.goto(`${BASIS}#/wissenscheck`, { waitUntil: 'networkidle' });
await seite.waitForTimeout(800);
await seite.click('[role="radio"]:has-text("Kompletttest")');
await seite.waitForTimeout(300);
await seite.click('button:has-text("Kompletttest starten"), button:has-text("Starten"), .quiz-start button');
await seite.waitForTimeout(700);
const inFrage = Boolean(await seite.$('.quiz-frage'));
await seite.keyboard.press('1');
await seite.waitForTimeout(400);
await seite.goto(`${BASIS}#/`, { waitUntil: 'networkidle' });
await warte();
await seite.keyboard.press('Control+Shift+U');
await seite.waitForSelector('[role="dialog"]');
await seite.click('[role="dialog"] button:has-text("Nur das erste Kapitel")');
await seite.waitForTimeout(400);
await seite.keyboard.press('Escape');
await seite.waitForTimeout(300);
await seite.goto(`${BASIS}#/wissenscheck`, { waitUntil: 'networkidle' });
await seite.waitForTimeout(900);
const nachWechsel = glatt(await seite.$eval('#inhalt', (e) => e.innerText));
pruefe(inFrage, 'Wissenscheck: Kompletttest gestartet (Vorbereitung des Falls)');
pruefe(!/Fortsetzen/.test(nachWechsel), 'Umfangswechsel im Durchgang: kein „Fortsetzen“ mit alten Fragen',
  nachWechsel.match(/Fortsetzen[^\n]*/)?.[0] || '');
const leckNachWechsel = VERSTECKT_EINDEUTIG.filter((t) => nachWechsel.includes(t));
pruefe(leckNachWechsel.length === 0, 'Umfangswechsel im Durchgang: kein ausgeblendetes Kapitel im Text', leckNachWechsel.join(', '));
await bild(seite, '08-wissenscheck-nach-wechsel');

// ------------------------------------------- 10. Kapitelseite und Glossar
await seite.goto(`${BASIS}?umfang=erstes`, { waitUntil: 'networkidle' });
await warte();
const einheitenLinks = await seite.$$eval('.sidebar-spalte .nav-einheiten a', (n) => n.map((e) => e.getAttribute('href')));
pruefe(einheitenLinks.length === 0 || einheitenLinks.every((h) => h.includes(ERSTES.id)),
  'Seitenleiste: Lerneinheiten nur aus dem sichtbaren Kapitel', einheitenLinks.join(' '));
// letzte Lerneinheit des sichtbaren Kapitels: kein Weg ins nächste Kapitel
const letzteEinheit = (ERSTES.subChapters || [])[ERSTES_EINHEITEN - 1];
await seite.goto(`${BASIS}#/kapitel/${ERSTES.id}/${letzteEinheit.id}`, { waitUntil: 'networkidle' });
await seite.waitForTimeout(900);
const seitenMarkup = await seite.$eval('.app', (e) => e.innerHTML);
const kapitelLeck = VERSTECKT_IDS.filter((id) => seitenMarkup.includes(id));
pruefe(kapitelLeck.length === 0, 'Kapitelseite: keine Kennung eines ausgeblendeten Kapitels im Markup', kapitelLeck.join(', '));
const weiterKnopf = await seite.$$eval('a, button', (n) => n.map((e) => e.innerText.replace(/\s+/g, ' ').trim())
  .filter((t) => /Nächstes Kapitel|Voriges Kapitel/.test(t)));
pruefe(weiterKnopf.length === 0, 'Kapitelseite: kein Weg über die Kapitelgrenze', weiterKnopf.join(' | '));
// alle Einheiten abhaken → Kapitelabschluss ohne nächstes Kapitel
for (const sc of ERSTES.subChapters || []) {
  await seite.goto(`${BASIS}#/kapitel/${ERSTES.id}/${sc.id}`, { waitUntil: 'networkidle' });
  await seite.waitForTimeout(500);
  const k = await seite.$('button:has-text("Als gelesen markieren")');
  if (k) await k.click();
  await seite.waitForTimeout(250);
}
const abschluss = glatt(await seite.$eval('#inhalt', (e) => e.innerText));
pruefe(/Kapitel 01 gelesen/.test(abschluss), 'Kapitelabschluss erscheint', abschluss.match(/Kapitel 01[^\n]*/)?.[0] || '');
pruefe(!/Weiter mit Kapitel 02/.test(abschluss), 'Kapitelabschluss verweist nicht auf ein ausgeblendetes Kapitel');
await bild(seite, '09-kapitelabschluss');
// Glossar
await seite.goto(`${BASIS}#/glossar`, { waitUntil: 'networkidle' });
await seite.waitForTimeout(900);
const begriffeSeite = await seite.$$eval('[id^="begriff-"]', (n) => n.length);
pruefe(begriffeSeite === begriffeImUmfang, `Glossarseite: genau die ${begriffeImUmfang} Begriffe des Umfangs`, `${begriffeSeite}`);
const glossarMarkup = await seite.$eval('#inhalt', (e) => e.innerHTML);
const glossarLeck = VERSTECKT_IDS.filter((id) => glossarMarkup.includes(id));
pruefe(glossarLeck.length === 0, 'Glossarseite: „Kommt vor in“ nur mit sichtbaren Kapiteln', glossarLeck.join(', '));
await bild(seite, '10-glossar');

// ---------------------------------------------------------------- 11. Überlauf
await seite.goto(`${BASIS}?umfang=erstes`, { waitUntil: 'networkidle' });
await warte();
for (const breite of [1600, 1280, 1024, 390]) {
  await seite.setViewportSize({ width: breite, height: 900 });
  await seite.waitForTimeout(250);
  await seite.keyboard.press('Control+Shift+U');
  await seite.waitForSelector('[role="dialog"]');
  await seite.waitForTimeout(350);
  const ueber = await seite.evaluate(() => {
    const dok = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
    const d = document.querySelector('[role="dialog"]');
    const innen = d ? d.scrollWidth > d.clientWidth + 1 : false;
    const liste = document.querySelector('.umfang-liste');
    return { dok, innen, liste: liste ? liste.scrollWidth > liste.clientWidth + 1 : false };
  });
  pruefe(!ueber.dok && !ueber.innen && !ueber.liste, `kein waagerechter Überlauf bei ${breite} px`, JSON.stringify(ueber));
  await bild(seite, `11-panel-${breite}`);
  await seite.keyboard.press('Escape');
  await seite.waitForTimeout(250);
}

pruefe(konsole.length === 0, 'keine Konsolen- oder Netzfehler', konsole.slice(0, 5).join(' | '));
console.log(`\n${geprueft} Prüfungen · ${fehler === 0 ? 'ALLES GRÜN' : `${fehler} FEHLER`}`);
await browser.close();
process.exit(fehler === 0 ? 0 : 1);
