#!/usr/bin/env node
// ===========================================================================
// Notizen-Test
//
// Prüft das Notizfenster (speakernotes.html) und seine Kopplung an den
// Arbeitsplatz. Die Vorschau muss laufen:
//
//   npm run build && npm run vorschau &
//   npm run notizen-test
//
// Ohne Browser (immer):
//   · jedes Skript in docs/ hat Vorspann, Rede und Anhang, jeder Abschnitt
//     eine Zeitmarke; jeder Anker ist eine bekannte Stelle (stellen.js) oder
//     ein Abschnitt, kommt nur einmal vor, und keine Stelle fehlt
//   · kein Markdown im Redetext (das Fenster zeigt ihn wörtlich), keine Emojis
//
// Im Browser, je Modus (Versicherung, Banking):
//   · Kennwortkarte: falsches Kennwort bleibt draußen, gemerkter Zugang öffnet
//   · die Deloitte-Kachel in der Demo-Lasche öffnet das Notizfenster; es zeigt
//     das Skript des Modus und trägt keine Download-Lasche
//   · die Notizen springen an jeder Stelle des Klickpfads zum Anker des
//     Skripts (Landing Page, Übersicht, Assistent, Akte, Finanzübersicht,
//     Leads, Top-Lead, Anschreiben, nächster Tag, Gesprächsvorbereitung)
//   · was das Skript nennt, steht an der Stelle auch auf dem Bildschirm
//     (Namen im Radar, Top-Lead, Zahlen der Herleitung)
//   · Mausrad: senkrecht scrollt es die Notizen, waagerecht und mit Umschalt
//     den Arbeitsplatz; im Notizfenster abschaltbar; nach dem Schließen gehört
//     es wieder dem Arbeitsplatz
//   · „Folgen“ aus: kein Sprung, „Zur aktuellen Stelle“ holt nach
//   · Moduswechsel im Arbeitsplatz wechselt das Skript
//   · die Präsentation: am letzten Schritt steht der Abschnitt zur
//     Gesprächsvorbereitung, nicht der Tagesstart
//   · im Rahmen (iframe) ist die Kachel kein Knopf
//   · keine Laufzeit- und Konsolenfehler
//
// Braucht Playwright (im Projekt oder global installiert). Ein eigener
// Browser lässt sich über CHROMIUM=/pfad/zu/chrome vorgeben, die Adresse der
// Vorschau über BASIS=http://127.0.0.1:4322/ .
// ===========================================================================

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { ankerZuAbschnitt, inBloecke, parseH2, teile } from '../src/notizen/parse.js';
import { STELLEN, stelleAusStand } from '../src/notizen/stellen.js';

const HIER = path.dirname(fileURLToPath(import.meta.url));
const APP = path.resolve(HIER, '..');
const BASIS = (process.env.BASIS || 'http://127.0.0.1:4322/').replace(/\/?$/, '/');
const ZUGANG_KEY = 'bh-notizen-zugang';
const ZUGANG_HASH = fs.readFileSync(path.join(APP, 'src/notizen/zugang.js'), 'utf8').match(/ZUGANG_HASH = '([0-9a-f]{64})'/)[1];

const fehler = [];
let geprueft = 0;
function pruefe(bedingung, text) {
  geprueft++;
  if (!bedingung) { fehler.push(text); console.log(`  ✗ ${text}`); }
}

// ── Skripte ohne Browser ────────────────────────────────────────────────────
const SKRIPTE = fs.readdirSync(path.join(APP, 'docs'))
  .filter((d) => /^speakernotes-[a-z]+\.md$/.test(d))
  .map((d) => ({ modus: d.match(/^speakernotes-([a-z]+)\.md$/)[1], datei: d, md: fs.readFileSync(path.join(APP, 'docs', d), 'utf8') }));
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/u;

console.log('Skripte');
pruefe(SKRIPTE.length >= 2, 'docs/ enthält die Skripte für Versicherung und Banking');
for (const s of SKRIPTE) {
  const { vorspann, rede, anhang } = teile(inBloecke(s.md));
  pruefe(vorspann.some((b) => b.typ === 'h1'), `${s.datei}: Titel (# …) fehlt`);
  pruefe(vorspann.some((b) => b.typ === 'p' && b.text.startsWith('Rahmen: ')), `${s.datei}: Absatz „Rahmen: …“ fehlt`);
  pruefe(vorspann.some((b) => b.typ === 'liste'), `${s.datei}: Liste der Vorbereitung fehlt`);
  pruefe(rede.length > 0 && anhang.length > 0, `${s.datei}: drei Teile, getrennt durch --- (Vorspann, Rede, Anhang)`);
  const abschnitte = rede.filter((b) => b.typ === 'h2');
  for (const h of abschnitte) pruefe(parseH2(h), `${s.datei}: Abschnitt ohne Zeitmarke „0:00 Titel (Dauer)“: ${h.text}`);
  const anker = rede.flatMap((b) => ((b.typ === 'h2' || b.typ === 'p') && b.anker ? [b.anker] : []));
  const doppelt = anker.filter((a, i) => anker.indexOf(a) !== i);
  pruefe(doppelt.length === 0, `${s.datei}: Anker doppelt: ${doppelt.join(', ')}`);
  const abschnittIds = new Set(abschnitte.map((h) => parseH2(h)?.id));
  for (const a of anker) pruefe(a in STELLEN || abschnittIds.has(a), `${s.datei}: Anker {#${a}} ist keine Stelle aus stellen.js`);
  for (const stelle of Object.keys(STELLEN)) pruefe(anker.includes(stelle), `${s.datei}: Stelle {#${stelle}} fehlt (${STELLEN[stelle]})`);
  pruefe(Object.keys(ankerZuAbschnitt(rede)).length === anker.length, `${s.datei}: jeder Anker liegt in einem Abschnitt`);
  for (const b of rede) {
    if (b.typ !== 'p') continue;
    pruefe(!/\*\*|__|`/.test(b.text), `${s.datei}: Markdown im Redetext: ${b.text.slice(0, 60)}`);
    pruefe(!/\{#|#\}/.test(b.text), `${s.datei}: Anker nicht am Absatzende: ${b.text.slice(0, 60)}`);
  }
  pruefe(!EMOJI.test(s.md), `${s.datei}: Emoji im Skript`);
  s.rede = rede;
  s.text = rede.filter((b) => b.typ === 'p').map((b) => b.text).join(' ');
}
// Die Zuordnung selbst: aus jedem Stand eine bekannte Stelle oder keine
for (const stand of [
  { ansicht: 'landing' }, { ansicht: 'overview', reiter: 'uebersicht' }, { ansicht: 'overview', reiter: 'kunden' },
  { ansicht: 'detail', reiter: 'stammdaten' }, { ansicht: 'detail', reiter: 'impulse', topLead: true }, { ansicht: 'cockpit', reiter: 'cockpit' },
]) {
  const stelle = stelleAusStand(stand);
  pruefe(stelle === null || stelle in STELLEN, `stelleAusStand liefert unbekannte Stelle „${stelle}“`);
}

if (process.argv.includes('--ohne-browser')) abschluss();

// ── Browser ─────────────────────────────────────────────────────────────────
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch {
  console.error('\nPlaywright fehlt (npm i -D playwright oder global). Ohne Browser: npm run notizen-test -- --ohne-browser');
  process.exit(1);
}

// Was das Skript an einer Stelle nennt, steht dort auch auf dem Bildschirm.
const BELEGE = {
  versicherung: {
    kunde: 'KD00001',
    chip: 'Neue Leads anzeigen',
    uebersicht: ['Anna Hoffmann', 'Zweites Kind erwartet', 'Lisa Bauer'],
    assistent: ['Klaus Fischer', 'Allgemeiner Versicherungscheck'],
    finanzuebersicht: [/GESAMT\s*7\b/i],
    leads: ['Versicherungsprodukte', 'Bankprodukte', 'Anlageprodukte'],
    topLead: ['Allgemeiner Versicherungscheck', '69 %', '65 qm', '145 qm', '150k', '285k', /vier Fremd-Policen/],
    termin: ['Klaus Fischer'],
  },
  banking: {
    kunde: 'BK00001',
    chip: 'Meine neuen Leads',
    uebersicht: ['Andrea Lang', 'Praxis-Erweiterung', 'Stefan Braun'],
    assistent: ['Klaus Fischer', 'Kreditgespräch Immobilienfinanzierung'],
    finanzuebersicht: [/GESAMT\s*7\b/i],
    leads: ['Bankprodukte', 'Anlageprodukte', 'Versicherungsprodukte'],
    topLead: ['Kreditgespräch Immobilienfinanzierung', 'in 2 Monaten', '30.000 €', 'Newsletter'],
    termin: ['Klaus Fischer', 'Kreditgespräch Immobilienfinanzierung'],
  },
};

const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const warte = (ms) => new Promise((r) => setTimeout(r, ms));

function horche(seite, name) {
  seite.on('pageerror', (e) => { fehler.push(`${name}: Laufzeitfehler ${e.message}`); console.log(`  ✗ ${name}: Laufzeitfehler ${e.message}`); });
  seite.on('console', (m) => {
    if (m.type() !== 'error') return;
    const t = m.text();
    // Externe Dienste (Logos, Wetter, /api) dürfen fehlen.
    if (/Failed to load resource|net::ERR|logo\.dev|open-meteo|\/api\//.test(t)) return;
    fehler.push(`${name}: Konsole ${t}`); console.log(`  ✗ ${name}: Konsole ${t}`);
  });
}

async function neuerKontext({ zugang = true } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  await ctx.addInitScript(([key, hash, mitZugang]) => {
    try {
      localStorage.setItem('kia_user_name', 'Test');
      localStorage.setItem('kia_name_prompted', 'true');
      if (mitZugang) localStorage.setItem(key, hash);
    } catch { /* ohne Speicher */ }
  }, [ZUGANG_KEY, ZUGANG_HASH, zugang]);
  return ctx;
}

/** Stelle der Notizen: Anker direkt unter der Kopfzeile, aktiver Chip, Skript. */
async function lage(notizen) {
  return notizen.evaluate(() => {
    const kopf = document.querySelector('.kopf')?.getBoundingClientRect().height ?? 0;
    const anker = [...document.querySelectorAll('main h2[id], main .regie[id]')];
    // der Anker, der am nächsten unter der Kopfzeile steht
    let oben = null;
    for (const el of anker) {
      const ab = el.getBoundingClientRect().top - kopf;
      if (ab > -4 && (oben === null || ab < oben.ab)) oben = { id: el.id, ab: Math.round(ab) };
    }
    return {
      skript: document.documentElement.dataset.modus,
      oben,
      chip: document.querySelector('.chip[data-aktiv]')?.textContent ?? null,
      regie: document.querySelector('.regie[data-aktiv]')?.id ?? null,
      scrollY: Math.round(window.scrollY),
    };
  });
}

async function erwarteStelle(notizen, stelle, wo) {
  // Sanfter Sprung: warten, bis der Anker unter der Kopfzeile steht
  let l = null;
  for (let i = 0; i < 30; i++) {
    l = await lage(notizen);
    if (l.oben?.id === stelle && l.oben.ab <= 40) break;
    await warte(100);
  }
  pruefe(l.oben?.id === stelle && l.oben.ab <= 40, `${wo}: Notizen stehen bei „${l.oben?.id}“ (+${l.oben?.ab} px) statt bei „${stelle}“`);
  return l;
}

async function sichtbar(seite, belege, wo, wurzel = 'body') {
  const text = await seite.evaluate((s) => (document.querySelector(s) || document.body).innerText, wurzel);
  for (const b of belege) {
    const da = b instanceof RegExp ? b.test(text) : text.includes(b);
    pruefe(da, `${wo}: „${b}“ steht nicht auf dem Bildschirm, das Skript nennt es`);
  }
}

async function hash(seite, ziel) {
  await seite.evaluate((h) => { window.location.hash = h; }, ziel);
  await warte(900);
}

// ── Kennwortkarte ───────────────────────────────────────────────────────────
console.log('Kennwortkarte');
{
  const ctx = await neuerKontext({ zugang: false });
  const seite = await ctx.newPage();
  horche(seite, 'Kennwortkarte');
  await seite.goto(`${BASIS}speakernotes.html`);
  await seite.waitForSelector('.zugangKarte');
  pruefe(await seite.locator('main').count() === 0, 'ohne Kennwort sind die Notizen nicht zu sehen');
  await seite.fill('input[type=password]', 'falsch');
  await seite.keyboard.press('Enter');
  await seite.waitForSelector('.zugangFehler');
  pruefe(await seite.locator('main').count() === 0, 'ein falsches Kennwort öffnet die Notizen nicht');
  pruefe(await seite.locator('[data-dex-download]').count() === 0, 'das Notizfenster trägt keine Download-Lasche');
  await ctx.close();
}

// ── Kopplung je Modus ───────────────────────────────────────────────────────
for (const modus of ['versicherung', 'banking']) {
  console.log(`Kopplung: ${modus}`);
  const B = BELEGE[modus];
  const skript = SKRIPTE.find((s) => s.modus === modus);
  const ctx = await neuerKontext();
  const app = await ctx.newPage();
  horche(app, `${modus} Arbeitsplatz`);
  await app.goto(`${BASIS}#/${modus}/landing`);
  await app.waitForSelector('[data-praes="landing-chat"]');
  // Die Landing Page zeigt das zuletzt gewählte Modul; hier das des Tests.
  await app.evaluate((m) => localStorage.setItem('kia_last_mode', JSON.stringify({ modeId: m })), modus);
  await app.reload();
  await app.waitForSelector('[data-praes="landing-chat"]');

  // Öffnen über die Deloitte-Kachel
  const kachel = app.locator('[data-notizen-oeffnen]');
  pruefe(await kachel.count() === 1, `${modus}: die Deloitte-Kachel der Demo-Lasche ist der Knopf für die Notizen`);
  const [notizen] = await Promise.all([ctx.waitForEvent('page'), kachel.click()]);
  horche(notizen, `${modus} Notizfenster`);
  await notizen.waitForSelector('main');
  await notizen.setViewportSize({ width: 540, height: 780 });
  pruefe(/speakernotes\.html/.test(notizen.url()), `${modus}: die Kachel öffnet speakernotes.html`);
  pruefe(await notizen.locator('[data-dex-download]').count() === 0, `${modus}: das Notizfenster trägt keine Download-Lasche`);
  let l = await erwarteStelle(notizen, 'landing', `${modus} Landing Page`);
  pruefe(l.skript === modus, `${modus}: das Notizfenster zeigt das Skript „${l.skript}“`);
  // In einem 540 px breiten Fenster bleibt die Zeile der Bedienelemente einzeilig.
  const zeile = await notizen.evaluate(() => Math.round(document.querySelector('.kopfZeile').getBoundingClientRect().height));
  pruefe(zeile <= 32, `${modus}: die Bedienelemente im Kopf des Notizfensters stehen in einer Zeile (${zeile} px hoch)`);
  pruefe(/Landing Page/.test(l.chip ?? ''), `${modus} Landing Page: aktiver Chip ist „${l.chip}“`);

  // Übersicht
  await hash(app, `#/${modus}/overview/uebersicht`);
  await app.waitForSelector('[data-praes="agenten"]');
  l = await erwarteStelle(notizen, 'uebersicht', `${modus} Übersicht`);
  pruefe(/Übersicht/.test(l.chip ?? ''), `${modus} Übersicht: aktiver Chip ist „${l.chip}“`);
  await sichtbar(app, B.uebersicht, `${modus} Übersicht`);

  // Mausrad: senkrecht die Notizen, waagerecht und mit Umschalt der Arbeitsplatz
  await warte(1400); // Sperre nach dem Sprung abwarten
  await app.mouse.move(600, 500);
  let vorher = { n: (await lage(notizen)).scrollY, a: await app.evaluate(() => Math.round(window.scrollY)) };
  await app.mouse.wheel(0, 240);
  await warte(400);
  let nachher = { n: (await lage(notizen)).scrollY, a: await app.evaluate(() => Math.round(window.scrollY)) };
  pruefe(nachher.n - vorher.n === 240, `${modus} Mausrad senkrecht: die Notizen scrollen um ${nachher.n - vorher.n} statt 240 px`);
  pruefe(nachher.a === vorher.a, `${modus} Mausrad senkrecht: der Arbeitsplatz bleibt stehen (${vorher.a} → ${nachher.a})`);
  await app.mouse.wheel(260, 0);
  await warte(400);
  let dann = { n: (await lage(notizen)).scrollY, a: await app.evaluate(() => Math.round(window.scrollY)) };
  pruefe(dann.a - nachher.a === 260, `${modus} Mausrad waagerecht: der Arbeitsplatz scrollt um ${dann.a - nachher.a} statt 260 px`);
  pruefe(dann.n === nachher.n, `${modus} Mausrad waagerecht: die Notizen bleiben stehen`);
  await app.keyboard.down('Shift');
  await app.mouse.wheel(0, 120);
  await app.keyboard.up('Shift');
  await warte(400);
  const mitUmschalt = { n: (await lage(notizen)).scrollY, a: await app.evaluate(() => Math.round(window.scrollY)) };
  pruefe(mitUmschalt.a - dann.a === 120 && mitUmschalt.n === dann.n, `${modus} Umschalt + Mausrad: der Arbeitsplatz scrollt (${dann.a} → ${mitUmschalt.a}), die Notizen bleiben (${dann.n} → ${mitUmschalt.n})`);
  // im Notizfenster abschalten (Taste M)
  await notizen.keyboard.press('m');
  await warte(300);
  vorher = { n: (await lage(notizen)).scrollY, a: await app.evaluate(() => Math.round(window.scrollY)) };
  await app.mouse.wheel(0, 150);
  await warte(400);
  nachher = { n: (await lage(notizen)).scrollY, a: await app.evaluate(() => Math.round(window.scrollY)) };
  pruefe(nachher.a - vorher.a === 150 && nachher.n === vorher.n, `${modus} Mausrad abgeschaltet: der Arbeitsplatz scrollt (${vorher.a} → ${nachher.a}), die Notizen bleiben`);
  await notizen.keyboard.press('m');
  await app.evaluate(() => window.scrollTo(0, 0));

  // Assistent
  await app.locator('button[aria-label="KI-Vertriebsassistent"]').click();
  await app.waitForSelector('[data-praes="assistent"]');
  l = await erwarteStelle(notizen, 'assistent', `${modus} Assistent`);
  pruefe(l.regie === 'assistent', `${modus} Assistent: die Regieanweisung ist markiert`);
  const chip = app.locator('[data-praes="assistent"]').getByText(B.chip, { exact: true });
  pruefe(await chip.count() === 1, `${modus} Assistent: Chip „${B.chip}“ steht im Assistenten, das Skript nennt ihn`);
  pruefe(skript.text.includes(`Chip „${B.chip}“`), `${modus}: das Skript nennt den Chip „${B.chip}“`);
  await chip.click();
  await app.getByText('Kunden öffnen').last().waitFor({ timeout: 20000 });
  await sichtbar(app, B.assistent, `${modus} Assistent`, '[data-praes="assistent"]');
  const antwort = await app.locator('[data-praes="assistent"]').innerText();
  const quellen = antwort.match(/unabhängige Signale, ([^“„]+?), sprechen für/)?.[1] ?? '';
  pruefe(quellen && quellen.split(/, | und /).every((q) => /^[A-ZÄÖÜ]/.test(q)), `${modus} Assistent: jede Quelle des Top-Leads trägt eine Beschriftung („${quellen}“)`);
  pruefe(!/\.\. /.test(antwort), `${modus} Assistent: kein doppelter Punkt in der Antwort`);

  // Akte: der Assistent öffnet sich dort von selbst und zählt nicht
  await app.getByText('Kunden öffnen').last().click();
  await app.waitForSelector('[data-praes="akte-kopf"]');
  // Geprüft wird am Bildschirm, nicht an der Adresse: nach einem Sprung per
  // Hash (wie in diesem Test) zieht die Adresse beim nächsten Klick nicht nach.
  await sichtbar(app, B.assistent.slice(0, 1), `${modus} Akte`, '[data-praes="akte-kopf"]');
  // Die KI-Zusammenfassung der Akte nennt denselben Top-Lead wie der Assistent.
  await sichtbar(app, [new RegExp(`Top-Lead aktuell: „${B.assistent[1]}`)], `${modus} Akte, KI-Zusammenfassung`, '[data-praes="akte-kopf"]');
  l = await erwarteStelle(notizen, 'akte', `${modus} Akte`);
  pruefe(/Kundenakte/.test(l.chip ?? ''), `${modus} Akte: aktiver Chip ist „${l.chip}“`);

  // Haushaltsprofil hat keine Stelle: die Notizen bleiben stehen
  await hash(app, `#/${modus}/detail/${B.kunde}/finanzprofil`);
  await warte(600);
  l = await lage(notizen);
  pruefe(l.oben?.id === 'akte', `${modus} Haushaltsprofil: die Notizen bleiben bei der Akte (stehen bei „${l.oben?.id}“)`);

  // Finanzübersicht
  await hash(app, `#/${modus}/detail/${B.kunde}/openfinance`);
  l = await erwarteStelle(notizen, 'finanzuebersicht', `${modus} Finanzübersicht`);
  pruefe(/Kundenakte/.test(l.chip ?? ''), `${modus} Finanzübersicht: aktiver Chip ist „${l.chip}“`);
  await app.getByText('Externe Verknüpfungen').first().waitFor();
  await sichtbar(app, B.finanzuebersicht, `${modus} Finanzübersicht`);
  pruefe(/sieben Fremdinstituten/.test(skript.text), `${modus}: das Skript nennt sieben Fremdinstitute`);

  // Leads, Top-Lead, Anschreiben
  await hash(app, `#/${modus}/detail/${B.kunde}/impulse`);
  await app.waitForSelector('[data-praes="top-lead"]');
  l = await erwarteStelle(notizen, 'leads', `${modus} Leads`);
  await sichtbar(app, B.leads, `${modus} Leads`);
  await app.evaluate(() => window.dispatchEvent(new CustomEvent('kia-chatbot-close')));
  await app.locator('[data-praes="top-lead"] [data-praes-toggle]').click();
  l = await erwarteStelle(notizen, 'top-lead', `${modus} Top-Lead`);
  pruefe(/Leads/.test(l.chip ?? ''), `${modus} Top-Lead: aktiver Chip ist „${l.chip}“`);
  await sichtbar(app, B.topLead, `${modus} Top-Lead`, '[data-praes="top-lead"]');
  pruefe(!/\{\{|\}\}/.test(await app.locator('[data-praes="top-lead"]').innerText()), `${modus} Top-Lead: kein offener Platzhalter {{…}} in der Karte`);
  await app.locator('[data-praes="top-lead"]').getByText('Anschreiben formulieren').first().click();
  l = await erwarteStelle(notizen, 'anschreiben', `${modus} Anschreiben`);
  await app.keyboard.press('Escape');
  l = await erwarteStelle(notizen, 'top-lead', `${modus} Anschreiben geschlossen`);

  // Folgen aus: kein Sprung, die Kopfzeile behält ihre Höhe, „Zur aktuellen
  // Stelle“ holt nach
  await warte(700); // der sanfte Sprung ist zu Ende
  const kopfHoehe = () => notizen.evaluate(() => Math.round(document.querySelector('.kopf').getBoundingClientRect().height));
  const hoeheVorher = await kopfHoehe();
  vorher = (await lage(notizen)).scrollY;
  await notizen.keyboard.press('f');
  await hash(app, `#/${modus}/detail/${B.kunde}/stammdaten`);
  await warte(700);
  l = await lage(notizen);
  pruefe(l.scrollY === vorher, `${modus} Folgen aus: die Notizen bleiben stehen (${vorher} → ${l.scrollY})`);
  pruefe(await kopfHoehe() === hoeheVorher, `${modus} Folgen aus: die Kopfzeile behält ihre Höhe (${hoeheVorher} → ${await kopfHoehe()} px)`);
  const zurStelle = notizen.locator('[data-zur-stelle]');
  pruefe(await zurStelle.getAttribute('data-ruf') !== null, `${modus} Folgen aus: „Zur aktuellen Stelle“ ist hervorgehoben`);
  await zurStelle.click();
  await erwarteStelle(notizen, 'akte', `${modus} Zur aktuellen Stelle`);
  await notizen.keyboard.press('f');
  await warte(300);
  pruefe(await zurStelle.getAttribute('data-ruf') === null, `${modus} Folgen an: „Zur aktuellen Stelle“ ist nicht mehr hervorgehoben`);

  // Nächster Tag: die Uhr im Kopf, neuer Termin, Gesprächsvorbereitung
  await app.locator('header button:has(svg.lucide-clock)').first().click();
  await app.waitForSelector('[data-praes="termine"]', { timeout: 8000 });
  l = await erwarteStelle(notizen, 'naechster-tag', `${modus} nächster Tag`);
  pruefe(/Nächster Tag/.test(l.chip ?? ''), `${modus} nächster Tag: aktiver Chip ist „${l.chip}“`);
  const termin = app.locator('[data-praes="termine"] .row-hover').first();
  await termin.waitFor();
  await sichtbar(app, [...B.termin, /\+1/], `${modus} neuer Termin`, '[data-praes="termine"] .row-hover');
  await termin.click();
  await app.waitForSelector('[data-modal="terminprep"]');
  l = await erwarteStelle(notizen, 'vorbereitung', `${modus} Gesprächsvorbereitung`);
  await app.keyboard.press('Escape');
  await erwarteStelle(notizen, 'naechster-tag', `${modus} Vorbereitung geschlossen`);
  // Uhr zurückstellen
  await app.locator('header button:has(svg.lucide-clock)').first().click();
  await erwarteStelle(notizen, 'uebersicht', `${modus} Uhr zurückgestellt`);

  // Präsentation: letzter Schritt zeigt den Abschnitt zur Gesprächsvorbereitung
  await app.getByTitle('Präsentation starten').first().click();
  await app.waitForSelector('[role="dialog"][aria-label="Präsentation"]');
  await erwarteStelle(notizen, 'landing', `${modus} Präsentation Schritt 1`);
  for (let i = 0; i < 5; i++) { await app.keyboard.press('ArrowRight'); await warte(900); }
  await erwarteStelle(notizen, 'naechster-tag', `${modus} Präsentation letzter Schritt`);
  await app.keyboard.press('Escape');
  await erwarteStelle(notizen, 'uebersicht', `${modus} Präsentation beendet`);

  // Moduswechsel im Arbeitsplatz: das Skript wechselt mit
  const anderer = modus === 'versicherung' ? 'banking' : 'versicherung';
  await hash(app, `#/${anderer}/overview/uebersicht`);
  await app.waitForSelector('[data-praes="agenten"]');
  for (let i = 0; i < 30 && (await lage(notizen)).skript !== anderer; i++) await warte(100);
  l = await erwarteStelle(notizen, 'uebersicht', `${modus} → ${anderer}`);
  pruefe(l.skript === anderer, `Moduswechsel ${modus} → ${anderer}: das Notizfenster zeigt „${l.skript}“`);
  pruefe(new RegExp(`skript=${anderer}`).test(notizen.url()), `Moduswechsel ${modus} → ${anderer}: die Adresse des Notizfensters zieht nach`);
  // Vermögensverwaltung hat kein Skript: es bleibt stehen
  await hash(app, '#/vermoegensverwaltung/overview/uebersicht');
  await warte(800);
  pruefe((await lage(notizen)).skript === anderer, `${modus}: in der Vermögensverwaltung bleibt das Skript stehen`);

  // Skript von Hand wählen: hört auf zu folgen
  await hash(app, `#/${anderer}/overview/uebersicht`);
  await warte(600);
  await notizen.selectOption('select.skriptWahl', modus);
  await warte(400);
  await hash(app, `#/${anderer}/detail/${BELEGE[anderer].kunde}/stammdaten`);
  await warte(800);
  l = await lage(notizen);
  pruefe(l.skript === modus, `${modus}: von Hand gewähltes Skript bleibt stehen (zeigt „${l.skript}“)`);

  // Notizfenster zu: das Mausrad gehört wieder dem Arbeitsplatz
  await app.evaluate(() => window.scrollTo(0, 0));
  await notizen.close();
  await warte(500);
  await app.mouse.move(600, 500);
  await app.mouse.wheel(0, 180);
  await warte(400);
  pruefe(await app.evaluate(() => Math.round(window.scrollY)) === 180, `${modus}: nach dem Schließen des Notizfensters scrollt das Mausrad den Arbeitsplatz`);
  await ctx.close();
}

// ── Im Rahmen ist die Kachel kein Knopf ─────────────────────────────────────
console.log('Rahmen');
{
  const ctx = await neuerKontext();
  const seite = await ctx.newPage();
  await seite.setContent(`<iframe src="${BASIS}#/versicherung/landing" style="width:1400px;height:900px;border:0"></iframe>`);
  const rahmen = seite.frameLocator('iframe');
  await rahmen.locator('[data-praes="landing-chat"]').waitFor();
  pruefe(await rahmen.locator('[data-notizen-oeffnen]').count() === 0, 'im Rahmen (iframe) ist die Deloitte-Kachel kein Knopf');
  pruefe(await rahmen.locator('img[alt="Deloitte"]').count() >= 1, 'im Rahmen steht die Deloitte-Kachel als Bild');
  await ctx.close();
}

await browser.close();
abschluss();

function abschluss() {
  if (fehler.length) {
    console.log(`\n${fehler.length} von ${geprueft} Prüfungen fehlgeschlagen.`);
    process.exit(1);
  }
  console.log(`\nAlle ${geprueft} Prüfungen bestanden.`);
  process.exit(0);
}
