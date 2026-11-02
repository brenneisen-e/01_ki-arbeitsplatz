// ===========================================================================
// Rauchtest — fährt die Anwendung einmal vollständig durch und schlägt an,
// sobald irgendwo etwas bricht. Vorbild: 21_vertragsumstellung/scripts/rauchtest.mjs.
//
// Anlass: Rollup prüft in JSX keine freien Bezeichner. Ein Bauteil, das
// importiert werden müsste und nicht importiert ist, baut fehlerfrei durch
// und wirft erst zur Laufzeit — weiße Seite, und zwar oft erst beim
// Überfahren eines Diagramms oder beim Öffnen eines Popovers. Genau diese
// Klasse Fehler fängt dieser Test. Er prüft zusätzlich alles, was ein Blick
// auf Screenshots nicht verlässlich sieht.
//
// Strecke (nichts ist hart verdrahtet, alles kommt aus chapters.json):
//   · Startseite leer und mit Fortschritt
//   · JEDE Lerneinheit in ALLEN drei Tiefen (Basis · Vertiefung · Experte)
//   · in der Tiefe „Experte“ (dort stehen alle Blöcke im DOM): jede Tafel und
//     jedes Diagramm mit der Maus anfahren, JEDE Quellen-Nummer anklicken,
//     Begriffe im Text anfahren und eine Hover-Card öffnen
//   · Glossar, Glossar-Deeplink, A–Z-Leiste, Themenfilter
//   · Wissenscheck: Einrichtung → Frage → Ergebnis, ausschließlich mit der
//     Tastatur (1–4, Enter), danach „Fehler wiederholen“ und Abbruch-Dialog
//   · Suchpalette mit Eingabe „Solvency“ und Enter auf einem Inhaltstreffer
//   · Tastaturhilfe („?“), Umfangs-Panel, Schublade bei 390 px
//
// Befunde:
//   · Laufzeit- und Konsolenfehler, HTTP-Antworten ab 400
//   · Emojis und Kästchen-Glyphen im DOM
//   · „€“ vor der Zahl im sichtbaren Text
//   · Balken-/Liniendiagramme ohne Achsenbeschriftung
//   · waagerechter Überlauf bei 1600, 1280, 1024 und 390 px — im Dokument,
//     in jeder Karte und in jedem Scrollrahmen darin (ein Rahmen mit
//     overflow-x: auto scrollt seitlich, ohne dass die Karte breiter würde)
//   · starke Kappungen (Ellipse mit weniger als der Hälfte des Textes,
//     geklemmte Zeilen mit verschluckter Zeile)
//   · Fokus ohne sichtbaren Ring (Stichprobe je Ansicht)
//   · Overlays, die Esc nicht schließt
//   · Textkontrast unter 4,5:1 bei Schrift bis 18 px (Stichprobe von 200
//     Textknoten je Ansicht, aus den berechneten Farben)
//   · Barrierefreiheit: axe-core auf allen Hauptansichten, „serious“ und
//     „critical“ zählen als Befund
//   · Schrift unter 12 px im sichtbaren Text
//
// Aufruf:
//   npm run build && npm run vorschau &
//   node scripts/rauchtest.mjs [URL]        # Standard http://127.0.0.1:4173/
//   Umgebung: CHROMIUM=<Pfad>, AXE=0 (axe überspringen),
//             NUR=<liste> (Abschnitte: einheiten,bloecke,glossar,quiz,suche,overlays,masse)
// ===========================================================================

import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HIER = path.dirname(fileURLToPath(import.meta.url));
const URL_BASIS = (process.argv[2] || 'http://127.0.0.1:4173/').replace(/\/?$/, '/');
const BROWSER = process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const MIT_AXE = process.env.AXE !== '0';
const NUR = (process.env.NUR || '').split(',').map((s) => s.trim()).filter(Boolean);
const laeuft = (abschnitt) => NUR.length === 0 || NUR.includes(abschnitt);

const DATEN = JSON.parse(readFileSync(path.join(HIER, '..', 'public', 'data', 'chapters.json'), 'utf8'));
const AXE_QUELLE = readFileSync(path.join(HIER, '..', 'node_modules', 'axe-core', 'axe.min.js'), 'utf8');

// Alle Lerneinheiten aus den Daten — der Test wächst mit dem Inhalt mit.
const EINHEITEN = DATEN.chapters.flatMap((k) => (k.subChapters || []).map((s) => ({
  kapitel: k.id, einheit: s.id, titel: s.title,
})));
const TIEFEN = ['basis', 'vertiefung', 'experte'];
// Blocktypen und die Einheit, in der sie zuerst vorkommen (Vollständigkeitsprobe)
const TYP_ORT = new Map();
for (const k of DATEN.chapters) {
  for (const s of k.subChapters || []) {
    for (const lv of ['level1', 'level2', 'level3']) {
      for (const b of s[lv] || []) if (b && b.type && !TYP_ORT.has(b.type)) TYP_ORT.set(b.type, `${k.id}/${s.id}`);
    }
  }
}

// Quellenmarken je Einheit (alle Tiefen) — jede muss als anklickbare Quelle
// gerendert werden, sonst verschluckt ein Renderer den Verweis.
const QUELLEN_SOLL = new Map();
{
  const strings = (o, out = []) => {
    if (typeof o === 'string') out.push(o);
    else if (Array.isArray(o)) o.forEach((x) => strings(x, out));
    else if (o && typeof o === 'object') Object.values(o).forEach((x) => strings(x, out));
    return out;
  };
  for (const k of DATEN.chapters) {
    for (const s of k.subChapters || []) {
      const n = ['level1', 'level2', 'level3']
        .flatMap((lv) => strings(s[lv] || []))
        .reduce((summe, t) => summe + (t.split('v1x1-cite"').length - 1), 0);
      QUELLEN_SOLL.set(`${k.id}/${s.id}`, n);
    }
  }
}

// --------------------------------------------------------------- Sammelstellen
const fehler = [];
const konsole = [];
const http = [];
const glyphen = new Set();
const euro = new Set();
const achsen = new Set();
const ueberlauf = [];
const kappungen = [];
const fokus = new Set();
const overlays = [];
const kontrast = new Set();
const kleinschrift = new Set();
const zielflaechen = new Set();
const axeBefunde = [];
const nichtGefunden = [];
let abbruch = null;

const browser = await chromium.launch({ executablePath: BROWSER });
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
await ctx.addInitScript(() => { try { localStorage.clear(); } catch { /* privates Fenster */ } });
const seite = await ctx.newPage();
seite.on('pageerror', (e) => fehler.push(String(e).split('\n')[0]));
seite.on('console', (m) => {
  if (m.type() !== 'error') return;
  const t = m.text().slice(0, 240);
  if (/favicon/i.test(t)) return;
  konsole.push(t);
});
seite.on('response', (r) => { if (r.status() >= 400) http.push(`${r.status()} ${r.url()}`); });

// ------------------------------------------------------------------- Werkzeuge
async function geheZu(hash, ms = 260) {
  await seite.evaluate((h) => { window.location.hash = h; }, hash);
  await seite.waitForTimeout(ms);
}
async function neuLaden(hash = '#/') {
  await seite.goto(`${URL_BASIS}${hash}`, { waitUntil: 'networkidle' });
  await seite.waitForTimeout(250);
}
async function klick(muster, ms = 300) {
  try {
    await seite.getByRole('button', { name: muster }).or(seite.getByRole('link', { name: muster })).first()
      .click({ timeout: 4000 });
    await seite.waitForTimeout(ms);
    return true;
  } catch { return false; }
}
async function pflichtKlick(muster, wo, ms) {
  const ok = await klick(muster, ms);
  if (!ok) nichtGefunden.push(`${wo}: Klickziel ${muster} nicht gefunden`);
  return ok;
}
async function erwarte(selektor, wo) {
  const n = await seite.locator(selektor).count().catch(() => 0);
  if (n === 0) nichtGefunden.push(`${wo}: ${selektor} nicht gefunden`);
  return n > 0;
}

// Zeichen, die im Produkt nichts zu suchen haben: Emojis (CLAUDE.md) und
// Glyphen, die als Kästchen erscheinen können.
const ZEICHEN_PRUEFUNG = `
  const emoji = /[\\u{1F000}-\\u{1FAFF}\\u{2600}-\\u{27BF}\\u{FE0F}\\u{1F1E6}-\\u{1F1FF}]/u;
  const kasten = /[\\u{FFFD}\\u{25A1}]/u;
`;

/** Emojis, Ersatzzeichen, „€“ vor der Zahl und Schrift unter 12 px im sichtbaren Text. */
async function textPruefen(wo) {
  const m = await seite.evaluate(`(() => {
    ${ZEICHEN_PRUEFUNG}
    const zeichen = new Set();
    const euroTreffer = new Set();
    const klein = new Set();
    const sichtbar = (el) => {
      if (!el) return false;
      const st = getComputedStyle(el);
      if (st.visibility === 'hidden' || st.display === 'none' || Number(st.opacity) === 0) return false;
      return el.getClientRects().length > 0;
    };
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) {
      const el = n.parentElement;
      if (!el || /^(SCRIPT|STYLE|TITLE)$/.test(el.tagName)) continue;
      const t = n.nodeValue;
      if (!t || !t.trim()) continue;
      if (emoji.test(t)) zeichen.add('Emoji in „' + t.trim().slice(0, 60) + '“');
      if (kasten.test(t)) zeichen.add('Ersatzzeichen in „' + t.trim().slice(0, 60) + '“');
      // Geviertstrich: der Brief schreibt „ – “ (Halbgeviertstrich mit Leerzeichen)
      if (t.includes('\u2014')) zeichen.add('Geviertstrich „—“ in „' + t.trim().slice(0, 60) + '“');
      // „€“ vor der Zahl — deutsche Schreibweise ist „12 €“
      if (/€\\s?\\d/.test(t)) euroTreffer.add(t.trim().slice(0, 70));
      if (!sichtbar(el)) continue;
      if (el.closest('.sr-only')) continue;
      const px = parseFloat(getComputedStyle(el).fontSize);
      if (px && px < 12) {
        const klasse = (typeof el.className === 'string' && el.className) || (el.className && el.className.baseVal) || el.tagName;
        klein.add(Math.round(px * 10) / 10 + ' px in .' + String(klasse).split(' ')[0] + ': „' + t.trim().slice(0, 40) + '“');
      }
    }
    return { zeichen: [...zeichen], euro: [...euroTreffer], klein: [...klein] };
  })()`).catch(() => null);
  if (!m) return;
  for (const z of m.zeichen) glyphen.add(`${wo}: ${z}`);
  for (const e of m.euro) euro.add(`${wo}: „${e}“`);
  for (const k of m.klein) kleinschrift.add(`${wo}: ${k}`);
}

/**
 * Balken- und Liniendiagramme brauchen beschriftete Achsen (UX-Audit: XAxis
 * und YAxis standen in einem Fragment, das Recharts ignoriert). Recharts lädt
 * per React.lazy — erst warten, bis jedes sichtbare Diagramm gezeichnet ist
 * oder auf Tabelle steht, sonst misst der Test das Ladebild.
 */
async function achsenPruefen(wo) {
  const zuPruefen = await seite.locator('[data-typ="chartBar"], [data-typ="chartLine"]').count().catch(() => 0);
  if (zuPruefen === 0) return;
  await seite.waitForFunction(() => [...document.querySelectorAll('[data-typ="chartBar"], [data-typ="chartLine"]')]
    .every((b) => b.getClientRects().length === 0 || b.querySelector('.recharts-wrapper') || b.querySelector('table')),
  null, { timeout: 4000 }).catch(() => {});
  const m = await seite.evaluate(() => {
    const raus = [];
    for (const block of document.querySelectorAll('[data-typ="chartBar"], [data-typ="chartLine"]')) {
      if (block.getClientRects().length === 0) continue;
      // nur das Diagramm selbst, nicht die Lucide-Symbole im Kopf; solange
      // das Bündel lädt (React.lazy), steht hier noch nichts — dann nicht messen
      const svg = block.querySelector('.recharts-wrapper svg, figure svg');
      if (!svg) continue;
      const ticks = svg.querySelectorAll('.recharts-cartesian-axis-tick-value, .recharts-cartesian-axis-tick text, text[data-achse]');
      const titel = (block.querySelector('.bl-titel') || {}).textContent || block.getAttribute('data-typ');
      if (ticks.length < 2) raus.push(`${titel.trim().slice(0, 50)}: ${ticks.length} Achsenbeschriftung(en)`);
    }
    return raus;
  }).catch(() => []);
  for (const a of m) achsen.add(`${wo}: ${a}`);
}

/**
 * Textkontrast: Stichprobe von 200 Textknoten. Gemessen wird die berechnete
 * Vordergrundfarbe gegen die erste deckende Hintergrundfarbe der Vorfahren.
 * Ab 18 px (bzw. 14 px fett) gilt 3:1, darunter 4,5:1 (WCAG AA).
 */
async function kontrastPruefen(wo) {
  const m = await seite.evaluate(() => {
    const zuRgb = (s) => {
      const t = String(s).match(/rgba?\(([^)]+)\)/);
      if (!t) return null;
      const v = t[1].split(',').map((x) => parseFloat(x));
      return { r: v[0], g: v[1], b: v[2], a: v.length > 3 ? v[3] : 1 };
    };
    const lin = (c) => { const x = c / 255; return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; };
    const leucht = (c) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
    const verhaeltnis = (a, b) => {
      const l1 = leucht(a);
      const l2 = leucht(b);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    };
    const mische = (vorn, hinten) => ({
      r: vorn.r * vorn.a + hinten.r * (1 - vorn.a),
      g: vorn.g * vorn.a + hinten.g * (1 - vorn.a),
      b: vorn.b * vorn.a + hinten.b * (1 - vorn.a),
      a: 1,
    });
    const hintergrund = (el) => {
      let k = el;
      let ergebnis = { r: 255, g: 255, b: 255, a: 1 };
      const stapel = [];
      while (k && k !== document.documentElement) {
        const bg = zuRgb(getComputedStyle(k).backgroundColor);
        if (bg && bg.a > 0) { stapel.push(bg); if (bg.a >= 0.999) break; }
        k = k.parentElement;
      }
      for (let i = stapel.length - 1; i >= 0; i -= 1) ergebnis = mische(stapel[i], ergebnis);
      return ergebnis;
    };
    const treffer = [];
    const knoten = [];
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) {
      const el = n.parentElement;
      if (!el || /^(SCRIPT|STYLE|TITLE)$/.test(el.tagName)) continue;
      if (!n.nodeValue || !n.nodeValue.trim()) continue;
      if (el.closest('.sr-only, [aria-hidden="true"]')) continue;
      if (el.getClientRects().length === 0) continue;
      const st = getComputedStyle(el);
      if (st.visibility === 'hidden' || Number(st.opacity) === 0) continue;
      knoten.push({ el, st, text: n.nodeValue.trim() });
      if (knoten.length >= 200) break;
    }
    for (const { el, st, text } of knoten) {
      const px = parseFloat(st.fontSize);
      const fett = Number(st.fontWeight) >= 700;
      const gross = px >= 24 || (px >= 18.67 && fett);
      const soll = gross ? 3 : 4.5;
      const vorn = zuRgb(st.color);
      if (!vorn) continue;
      const hinten = hintergrund(el);
      const v = verhaeltnis(vorn.a < 0.999 ? mische(vorn, hinten) : vorn, hinten);
      if (v + 0.05 < soll) {
        treffer.push(`${Math.round(v * 100) / 100}:1 (soll ${soll}) ${Math.round(px)} px ${st.color} auf rgb(${Math.round(hinten.r)},${Math.round(hinten.g)},${Math.round(hinten.b)}) „${text.slice(0, 40)}“`);
      }
    }
    return treffer;
  }).catch(() => []);
  for (const k of m) kontrast.add(`${wo}: ${k}`);
}

/**
 * Stichprobe: hat jedes per Tabulator fokussierte Element einen sichtbaren
 * Ring? Gemessen wird mit echten Tastendrücken — `element.focus()` aus dem
 * Skript löst `:focus-visible` nicht aus, und genau daran hängt der Ring.
 */
async function fokusPruefen(wo, anzahl = 18) {
  await seite.evaluate(() => { document.activeElement?.blur?.(); window.scrollTo(0, 0); });
  for (let i = 0; i < anzahl; i += 1) {
    await seite.keyboard.press('Tab');
    const m = await seite.evaluate(() => {
      const node = document.activeElement;
      if (!node || node === document.body || node === document.documentElement) return null;
      const st = getComputedStyle(node);
      const ring = (st.outlineStyle !== 'none' && st.outlineStyle !== '' && parseFloat(st.outlineWidth) >= 1)
        || (st.boxShadow && st.boxShadow !== 'none');
      return {
        ring,
        name: (node.getAttribute('aria-label') || node.textContent || node.tagName).trim().replace(/\s+/g, ' ').slice(0, 40),
        klasse: typeof node.className === 'string' && node.className ? node.className.split(' ')[0] : node.tagName,
      };
    }).catch(() => null);
    if (m && !m.ring) fokus.add(`${wo}: ${m.klasse} „${m.name}“ ohne sichtbaren Fokusring`);
  }
  await seite.evaluate(() => document.activeElement?.blur?.());
}

/**
 * Zielgrößen: jede Trefffläche mindestens 24 × 24 px (Brief §1.7, WCAG 2.2).
 * Ausgenommen sind Verweise im Fließtext (Quellenmarken und Glossarbegriffe
 * stehen mitten im Satz; WCAG nimmt „inline“ ausdrücklich aus) — die
 * Quellenmarke vergrößert ihre Fläche über ein ::before-Feld.
 */
async function zielgroessen(wo) {
  const m = await seite.evaluate(() => {
    const raus = [];
    const gesehen = new Set();
    const ZIELE = 'button:not([disabled]), a[href], input[type="checkbox"], input[type="radio"], [role="tab"], [role="radio"], [role="option"], [tabindex="0"]';
    for (const el of document.querySelectorAll(ZIELE)) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const st = getComputedStyle(el);
      if (st.display === 'inline' || el.closest('p, li, td, th, .bl-absatz')) continue; // Fließtext
      if (r.width >= 24 && r.height >= 24) continue;
      const name = (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 30);
      const klasse = (typeof el.className === 'string' && el.className ? el.className.split(' ')[0] : el.tagName);
      const schluessel = `${klasse}|${name}`;
      if (gesehen.has(schluessel)) continue;
      gesehen.add(schluessel);
      raus.push(`${klasse} „${name}“ ${Math.round(r.width)}×${Math.round(r.height)} px`);
    }
    return raus;
  }).catch(() => []);
  for (const z of m) zielflaechen.add(`${wo}: ${z}`);
}

/** Tafeln, Diagramme und Grafiken mit der Maus anfahren — Tooltips rendern erst dann. */
async function anfahren(selektor = '.bl-rahmen, .karte', maxN = 40) {
  const tafeln = seite.locator(selektor);
  const n = Math.min(await tafeln.count().catch(() => 0), maxN);
  for (let i = 0; i < n; i += 1) {
    const t = tafeln.nth(i);
    await t.scrollIntoViewIfNeeded().catch(() => {});
    const k = await t.boundingBox().catch(() => null);
    if (!k || k.width < 60) continue;
    for (const ay of [0.15, 0.5, 0.85]) {
      for (const ax of [0.2, 0.55, 0.9]) {
        await seite.mouse.move(k.x + k.width * ax, Math.min(k.y + k.height * ay, 960));
        await seite.waitForTimeout(25);
      }
    }
  }
  // Diagramme quer überfahren (Recharts-Tooltips)
  const dia = seite.locator('.recharts-wrapper, .bl-diagramm svg, .bl-grafik svg');
  const dn = Math.min(await dia.count().catch(() => 0), 20);
  for (let i = 0; i < dn; i += 1) {
    const k = await dia.nth(i).boundingBox().catch(() => null);
    if (!k || k.width < 60) continue;
    await dia.nth(i).scrollIntoViewIfNeeded().catch(() => {});
    const k2 = await dia.nth(i).boundingBox().catch(() => null);
    if (!k2) continue;
    for (const anteil of [0.15, 0.35, 0.55, 0.75, 0.95]) {
      await seite.mouse.move(k2.x + k2.width * anteil, k2.y + k2.height * 0.5);
      await seite.waitForTimeout(35);
    }
  }
  await seite.mouse.move(2, 2);
}

/** Jede Quellen-Nummer der Seite einmal öffnen und schließen. */
async function quellenKlicken(wo) {
  const q = seite.locator('.bl-quelle');
  const n = await q.count().catch(() => 0);
  for (let i = 0; i < n; i += 1) {
    const el = q.nth(i);
    await el.evaluate((node) => node.scrollIntoView({ block: 'center' })).catch(() => {});
    await seite.waitForTimeout(40);
    const geklickt = await el.click({ timeout: 2500 }).then(() => true).catch(() => false);
    if (!geklickt) { nichtGefunden.push(`${wo}: Quellen-Nummer ${i + 1} nicht klickbar`); continue; }
    await seite.waitForTimeout(60);
    const offen = await seite.locator('.popover-flaeche').count().catch(() => 0);
    if (offen === 0) nichtGefunden.push(`${wo}: Quelle ${i + 1} öffnet kein Popover`);
    await seite.keyboard.press('Escape');
    await seite.waitForTimeout(40);
  }
  return n;
}

/** Begriffe im Text anfahren und die Hover-Card öffnen (Öffnungsverzug ~450 ms). */
async function begriffeAnfahren(wo, maxN = 3) {
  const b = seite.locator('a.begriff');
  const n = await b.count().catch(() => 0);
  const bis = Math.min(n, maxN);
  for (let i = 0; i < bis; i += 1) {
    const el = b.nth(i);
    // In die Mitte des Fensters rollen, nicht nur „in den Blick“: unter der
    // klebenden Topbar läge der Zeiger sonst auf der Leiste, nicht am Begriff.
    await el.evaluate((node) => node.scrollIntoView({ block: 'center' })).catch(() => {});
    await seite.waitForTimeout(80);
    const k = await el.boundingBox().catch(() => null);
    if (!k) continue;
    await seite.mouse.move(k.x + k.width / 2, k.y + k.height / 2);
    // Öffnungsverzug der Hover-Card ist 600 ms (HOVER_MS in BegriffKarte.jsx)
    let karte = 0;
    for (let warte = 0; warte < 10 && karte === 0; warte += 1) {
      await seite.waitForTimeout(150);
      karte = await seite.locator('.hoverkarte').count().catch(() => 0);
    }
    if (karte === 0) nichtGefunden.push(`${wo}: Begriff „${(await el.textContent().catch(() => '')).trim()}“ öffnet keine Hover-Card`);
    else if (i === 0) {
      // Die Karte ist eine Zweitfassung des Glossareintrags: Esc muss sie schließen
      await seite.keyboard.press('Escape');
      await seite.waitForTimeout(120);
      if (await seite.locator('.hoverkarte').count().catch(() => 0) > 0) overlays.push(`${wo}: Hover-Card schließt nicht mit Esc`);
    }
    await seite.mouse.move(2, 2);
    await seite.waitForTimeout(80);
  }
  return n;
}

/** axe-core auf der aktuellen Ansicht; „serious“ und „critical“ zählen. */
async function axePruefen(wo) {
  if (!MIT_AXE) return;
  await seite.evaluate((quelle) => {
    if (!window.axe) {
      const s = document.createElement('script');
      s.textContent = quelle;
      document.head.appendChild(s);
    }
  }, AXE_QUELLE);
  const ergebnis = await seite.evaluate(async () => {
    const r = await window.axe.run(document, {
      resultTypes: ['violations'],
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] },
    });
    return r.violations
      .filter((v) => v.impact === 'serious' || v.impact === 'critical')
      .map((v) => ({
        id: v.id, impact: v.impact, hilfe: v.help, anzahl: v.nodes.length,
        wo: v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | '),
      }));
  }).catch((e) => [{ id: 'axe-lauf', impact: 'critical', hilfe: String(e).slice(0, 120), anzahl: 1, wo: '' }]);
  for (const v of ergebnis) axeBefunde.push(`${wo}: [${v.impact}] ${v.id} — ${v.hilfe} (${v.anzahl}×) ${v.wo}`);
}

/**
 * Waagerechter Überlauf und starke Kappungen der aktuellen Ansicht.
 * Gemessen wird: das Dokument, jede Karte/Tafel/Blockhülle und jeder
 * Scrollrahmen darin. Weiche Ellipsen zählen nicht als Überlauf (ihr
 * scrollWidth ist immer größer — das ist ihre Absicht), wohl aber als
 * Kappung, wenn weniger als die Hälfte des Textes sichtbar ist.
 */
async function masse(wo, breite) {
  const m = await seite.evaluate(() => {
    const innen = [];
    const gekappt = [];
    const gesehen = new Set();
    const sichtbar = (el) => el.clientWidth > 0 && el.getClientRects().length > 0;
    const name = (el) => {
      const k = (typeof el.className === 'string' ? el.className : '').split(' ').filter(Boolean).slice(0, 2).join('.');
      return k || el.tagName.toLowerCase();
    };
    const ort = (el) => {
      const block = el.closest('[data-block]');
      if (block) return `Block ${block.getAttribute('data-typ') || '?'}`;
      const karte = el.closest('.karte');
      if (karte) return 'Karte';
      const haupt = el.closest('main, .topbar, .sidebar-spalte, [role="dialog"]');
      return haupt ? (haupt.getAttribute('role') === 'dialog' ? 'Overlay' : name(haupt)) : 'Seite';
    };
    const melden = (el, grund) => {
      if (gesehen.has(el)) return;
      gesehen.add(el);
      innen.push(`${ort(el)}: ${name(el)} ${el.scrollWidth}/${el.clientWidth} px${grund ? ` (${grund})` : ''}`);
    };

    const FEST = '.karte, .bl-rahmen, [data-block], .topbar, .app-inhalt, [role="dialog"], .einheiten-leiste, .glossar-liste, .quiz-frage';
    for (const el of document.querySelectorAll(FEST)) {
      if (!sichtbar(el)) continue;
      const st = getComputedStyle(el);
      if (st.overflowX === 'auto' || st.overflowX === 'scroll' || st.overflowX === 'hidden') continue;
      if (el.scrollWidth > el.clientWidth + 1) melden(el, '');
    }

    const kandidaten = new Set();
    for (const wurzel of document.querySelectorAll('main, .topbar, [role="dialog"]')) {
      for (const el of wurzel.querySelectorAll('*')) {
        if (/^(SELECT|INPUT|TEXTAREA|OPTION|SVG|CANVAS|BR|IMG)$/i.test(el.tagName)) continue;
        if (el.closest('svg')) continue;
        if (sichtbar(el)) kandidaten.add(el);
      }
    }
    for (const el of kandidaten) {
      const st = getComputedStyle(el);
      const ox = st.overflowX;
      if ((ox === 'auto' || ox === 'scroll') && st.textOverflow !== 'ellipsis') {
        // data-rollen="absicht": Rahmen, die laut Brief bewusst seitlich rollen
        // (Einheitenleiste §12, breite Tabellen und Heatmaps §1.10). Sie tragen
        // Tastaturzugang und einen Namen; alles andere zählt als Befund.
        if (el.getAttribute('data-rollen') !== 'absicht' && el.scrollWidth > el.clientWidth + 1) melden(el, 'Scrollrahmen');
        continue;
      }
      if (gesehen.has(el)) continue;
      const text = (el.textContent || '').trim();
      if (!text) continue;
      // data-kappung="absicht": Auszüge, die von sich aus unvollständig sind
      // (Suchtreffer-Ausschnitt, zitierter Satz im Quellen-Popover).
      if (el.getAttribute('data-kappung') === 'absicht') continue;
      if (st.textOverflow === 'ellipsis' && ox !== 'visible' && el.scrollWidth > el.clientWidth + 1) {
        const anteil = el.clientWidth / el.scrollWidth;
        if (anteil < 0.5 || (el.clientWidth < 48 && el.scrollWidth - el.clientWidth > 8)) {
          gesehen.add(el);
          gekappt.push(`${ort(el)}: ${name(el)} „${text.slice(0, 40)}“ ${el.scrollWidth}/${el.clientWidth} px (${Math.round(anteil * 100)} % sichtbar)`);
        }
        continue;
      }
      const klemme = st.webkitLineClamp;
      if (klemme && klemme !== 'none' && st.overflowY !== 'visible' && el.scrollHeight > el.clientHeight + 2) {
        gesehen.add(el);
        gekappt.push(`${ort(el)}: ${name(el)} „${text.slice(0, 40)}“ ${el.scrollHeight}/${el.clientHeight} px hoch (${klemme} Zeilen)`);
      }
    }
    return { doc: document.documentElement.scrollWidth, fenster: window.innerWidth, innen, gekappt };
  }).catch(() => null);
  if (!m) return;
  const GRENZE = process.env.ALLE ? 999 : 5;
  if (m.doc > m.fenster + 1) ueberlauf.push(`${breite} px, ${wo}: Dokument ${m.doc} px breit (Fenster ${m.fenster})`);
  for (const i of m.innen.slice(0, GRENZE)) ueberlauf.push(`${breite} px, ${wo}: ${i}`);
  if (m.innen.length > GRENZE) ueberlauf.push(`${breite} px, ${wo}: … und ${m.innen.length - GRENZE} weitere`);
  for (const k of m.gekappt.slice(0, GRENZE)) kappungen.push(`${breite} px, ${wo}: ${k}`);
  if (m.gekappt.length > GRENZE) kappungen.push(`${breite} px, ${wo}: … und ${m.gekappt.length - GRENZE} weitere`);
}

/** Tiefe über den Segmentschalter setzen; meldet, ob sie in dieser Einheit wirkt. */
async function setzeTiefe(tiefe) {
  const label = { basis: 'Basis', vertiefung: 'Vertiefung', experte: 'Experte' }[tiefe];
  const knopf = seite.locator('.tiefenwahl .segment-option, .segment-option').filter({ hasText: new RegExp(`^${label}$`) }).first();
  if (await knopf.count() === 0) return false;
  if (await knopf.isDisabled().catch(() => false)) return false;
  await knopf.click({ timeout: 3000 }).catch(() => {});
  await seite.waitForTimeout(160);
  return true;
}

// =============================================================== Klickstrecke
try {
  await neuLaden('#/');
  await erwarte('.topbar', 'Startseite');
  await erwarte('main#inhalt', 'Startseite');
  await textPruefen('Startseite (leer)');
  await kontrastPruefen('Startseite (leer)');
  await zielgroessen('Startseite');
  await fokusPruefen('Startseite (leer)');
  await axePruefen('Startseite (leer)');
  await anfahren('.karte', 14);

  // ------------------------------------------------- alle Einheiten, alle Tiefen
  if (laeuft('einheiten')) {
    const bloeckeJeTiefe = {};
    for (const tiefe of TIEFEN) {
      let gesetzt = false;
      bloeckeJeTiefe[tiefe] = 0;
      for (const e of EINHEITEN) {
        await geheZu(`#/kapitel/${e.kapitel}/${e.einheit}`, 190);
        if (!gesetzt) gesetzt = await setzeTiefe(tiefe);
        const da = await seite.locator('#einheit-inhalt').count().catch(() => 0);
        if (da === 0) nichtGefunden.push(`Einheit ${e.kapitel}/${e.einheit} (${tiefe}): kein Artikel gerendert`);
        const bloecke = await seite.locator('[data-block]').count().catch(() => 0);
        bloeckeJeTiefe[tiefe] += bloecke;
        if (bloecke === 0) nichtGefunden.push(`Einheit ${e.kapitel}/${e.einheit} (${tiefe}): keine Blöcke`);
        await achsenPruefen(`${e.kapitel}/${e.einheit} (${tiefe})`);
        if (tiefe === 'basis') await textPruefen(`${e.kapitel}/${e.einheit}`);
      }
      // Die Tiefe bleibt gespeichert; vor der nächsten Runde neu setzen
      if (!gesetzt) nichtGefunden.push(`Tiefe „${tiefe}“ ließ sich in keiner Einheit setzen`);
    }
    console.log(`   Blöcke gerendert: Basis ${bloeckeJeTiefe.basis} · Vertiefung ${bloeckeJeTiefe.vertiefung} · Experte ${bloeckeJeTiefe.experte} (über ${EINHEITEN.length} Einheiten)`);
    if (!(bloeckeJeTiefe.basis < bloeckeJeTiefe.vertiefung && bloeckeJeTiefe.vertiefung < bloeckeJeTiefe.experte)) {
      nichtGefunden.push(`Tiefen wirken nicht: Basis ${bloeckeJeTiefe.basis}, Vertiefung ${bloeckeJeTiefe.vertiefung}, Experte ${bloeckeJeTiefe.experte} Blöcke`);
    }
  }

  // ------------------------------------- Blöcke anfahren, Quellen, Begriffe
  // In der Tiefe „Experte“ stehen alle Blöcke einer Einheit im DOM.
  if (laeuft('bloecke')) {
    let quellen = 0;
    let begriffe = 0;
    // Tiefe Experte: dann stehen alle Blöcke einer Einheit im DOM
    await geheZu(`#/kapitel/${EINHEITEN[0].kapitel}/${EINHEITEN[0].einheit}`, 300);
    for (const e of EINHEITEN) { if (await setzeTiefe('experte')) break; await geheZu(`#/kapitel/${e.kapitel}/${e.einheit}`, 200); }
    for (const e of EINHEITEN) {
      await geheZu(`#/kapitel/${e.kapitel}/${e.einheit}`, 240);
      await anfahren('.bl-rahmen', 30);
      const soll = QUELLEN_SOLL.get(`${e.kapitel}/${e.einheit}`) || 0;
      const ist = await seite.locator('.bl-quelle').count().catch(() => 0);
      if (ist !== soll) nichtGefunden.push(`${e.kapitel}/${e.einheit}: ${soll} Quellenmarken in den Daten, ${ist} anklickbare Quellen gerendert`);
      quellen += await quellenKlicken(`${e.kapitel}/${e.einheit}`);
      begriffe += await begriffeAnfahren(`${e.kapitel}/${e.einheit}`);
      await textPruefen(`${e.kapitel}/${e.einheit} (experte)`);
    }
    console.log(`   angefahren: ${EINHEITEN.length} Einheiten · ${quellen} von ${[...QUELLEN_SOLL.values()].reduce((a, b) => a + b, 0)} Quellen geklickt · ${begriffe} Begriffe im Text`);

    // Zweitfassungen der Grafiken und Diagramme („Tabelle“/„Liste“) einmal zeigen
    for (const [typ, ort] of TYP_ORT) {
      await geheZu(`#/kapitel/${ort}`, 240);
      const block = seite.locator(`[data-typ="${typ}"]`).first();
      if (await block.count() === 0) { nichtGefunden.push(`Blocktyp ${typ}: in ${ort} nicht gerendert`); continue; }
      await block.scrollIntoViewIfNeeded().catch(() => {});
      for (const muster of [/^Tabelle$/, /^Liste$/, /^Werte$/]) {
        const um = block.getByRole('button', { name: muster }).or(block.getByRole('radio', { name: muster })).first();
        if (await um.count().catch(() => 0)) {
          await um.click({ timeout: 2500 }).catch(() => {});
          await seite.waitForTimeout(160);
          await textPruefen(`Blocktyp ${typ} (Zweitfassung)`);
        }
      }
      // jeden interaktiven Knopf des Blocks einmal drücken (Kettenglieder,
      // Beispiele, Regler, Formelglieder …)
      const knoepfe = block.locator('button:visible');
      const n = Math.min(await knoepfe.count().catch(() => 0), 10);
      for (let i = 0; i < n; i += 1) await knoepfe.nth(i).click({ timeout: 2000 }).catch(() => {});
      const regler = block.locator('input[type="range"]');
      const rn = Math.min(await regler.count().catch(() => 0), 4);
      for (let i = 0; i < rn; i += 1) {
        await regler.nth(i).focus().catch(() => {});
        for (let s = 0; s < 4; s += 1) { await seite.keyboard.press('ArrowRight'); await seite.waitForTimeout(30); }
      }
      await seite.waitForTimeout(120);
      await textPruefen(`Blocktyp ${typ} (bedient)`);
      await achsenPruefen(`Blocktyp ${typ}`);
    }
  }

  // Tiefe zurück auf Basis
  await geheZu(`#/kapitel/${EINHEITEN[0].kapitel}/${EINHEITEN[0].einheit}`, 240);
  await setzeTiefe('basis');

  // Deeplink auf einen Block einer höheren Tiefe
  const tiefEinheit = EINHEITEN.find((e) => e.kapitel === '03-produktlandschaft') || EINHEITEN[0];
  await geheZu(`#/kapitel/${tiefEinheit.kapitel}/${tiefEinheit.einheit}/b8`, 500);
  if (await seite.locator('[data-block][data-hervor]').count().catch(() => 0) === 0) {
    const gibts = await seite.locator('#b8').count().catch(() => 0);
    if (gibts === 0) nichtGefunden.push('Deeplink b8: Block nicht gefunden');
  }
  await kontrastPruefen('Lerneinheit');
  await zielgroessen('Lerneinheit');
  await fokusPruefen('Lerneinheit');
  await axePruefen('Lerneinheit');

  // ------------------------------------------------------------------ Glossar
  if (laeuft('glossar')) {
    await geheZu('#/glossar', 400);
    await erwarte('.glossar-liste', 'Glossar');
    await erwarte('.glossar-az', 'Glossar (A–Z)');
    await textPruefen('Glossar');
    await kontrastPruefen('Glossar');
    await zielgroessen('Glossar');
    await fokusPruefen('Glossar');
    await axePruefen('Glossar');
    // Suchfeld, Themenfilter, Buchstabe
    const feld = seite.getByLabel('Glossar durchsuchen');
    if (await feld.count()) { await feld.fill('Solvency'); await seite.waitForTimeout(260); await feld.fill(''); }
    else nichtGefunden.push('Glossar: Suchfeld nicht gefunden');
    const tag = seite.locator('.glossar-tags button').first();
    if (await tag.count()) { await tag.click(); await seite.waitForTimeout(200); await tag.click(); }
    const buchstabe = seite.locator('.glossar-az button:not([disabled])').nth(3);
    if (await buchstabe.count()) { await buchstabe.click(); await seite.waitForTimeout(220); }
    // Deeplink auf einen Begriff
    const slug = (DATEN.glossary || []).find((g) => g.slug)?.slug;
    if (slug) {
      await geheZu(`#/glossar/${slug}`, 420);
      const hervor = await seite.locator('.glossar-eintrag-hervor').count().catch(() => 0);
      if (hervor === 0) nichtGefunden.push(`Glossar-Deeplink ${slug}: kein hervorgehobener Eintrag`);
      await textPruefen('Glossar (Deeplink)');
    }
  }

  // ------------------------------------------------------------- Wissenscheck
  if (laeuft('quiz')) {
    await geheZu('#/wissenscheck', 420);
    await erwarte('.modus-wahl', 'Wissenscheck (Einrichtung)');
    await textPruefen('Wissenscheck (Einrichtung)');
    await kontrastPruefen('Wissenscheck (Einrichtung)');
    await zielgroessen('Wissenscheck');
    await fokusPruefen('Wissenscheck (Einrichtung)');
    await axePruefen('Wissenscheck (Einrichtung)');

    await pflichtKlick(/starten$/, 'Wissenscheck', 500);
    if (await seite.locator('.quiz-frage').count()) {
      // vollständiger Durchgang nur mit der Tastatur
      for (let i = 0; i < 40; i += 1) {
        if (await seite.locator('.quiz-ergebnis').count()) break;
        if (await seite.locator('.quiz-frage').count() === 0) break;
        // Fragen haben drei oder vier Optionen — nur vorhandene Ziffern drücken
        const optionen = await seite.locator('.quiz-antwort').count().catch(() => 0);
        const taste = String((i % Math.max(1, optionen)) + 1);
        await seite.keyboard.press(taste);
        await seite.waitForTimeout(90);
        const gewaehlt = await seite.locator('.quiz-antwort[data-zustand]:not([data-zustand="offen"])').count().catch(() => 0);
        if (gewaehlt === 0) nichtGefunden.push(`Wissenscheck: Zifferntaste ${taste} wählt bei ${optionen} Optionen keine Antwort`);
        if (i === 0) {
          await textPruefen('Wissenscheck (Frage mit Rückmeldung)');
          await kontrastPruefen('Wissenscheck (Frage)');
          await axePruefen('Wissenscheck (Frage)');
        }
        await seite.keyboard.press('Enter');
        await seite.waitForTimeout(140);
      }
      if (await seite.locator('.quiz-ergebnis').count() === 0) nichtGefunden.push('Wissenscheck: Ergebnis nach dem Durchgang nicht erreicht');
      else {
        await textPruefen('Wissenscheck (Ergebnis)');
        await kontrastPruefen('Wissenscheck (Ergebnis)');
        await axePruefen('Wissenscheck (Ergebnis)');
        await anfahren('.karte', 8);
        // Fehler wiederholen und Durchgang per Esc abbrechen
        if (await klick(/Fehler wiederholen/, 450)) {
          await seite.keyboard.press('Escape');
          await seite.waitForTimeout(260);
          const dialog = await seite.locator('[role="dialog"]').count().catch(() => 0);
          if (dialog === 0) overlays.push('Wissenscheck: Esc im Durchgang öffnet keine Rückfrage');
          else {
            await axePruefen('Wissenscheck (Abbruch-Dialog)');
            await seite.keyboard.press('Escape');
            await seite.waitForTimeout(220);
            if (await seite.locator('[role="dialog"]').count().catch(() => 0) > 0) overlays.push('Wissenscheck: Abbruch-Dialog schließt nicht mit Esc');
          }
        }
      }
    } else {
      nichtGefunden.push('Wissenscheck: Frage nach dem Start nicht erschienen');
    }
    // Startseite mit Fortschritt
    await geheZu('#/', 420);
    await textPruefen('Startseite (mit Fortschritt)');
    await axePruefen('Startseite (mit Fortschritt)');
  }

  // -------------------------------------------------------------- Suchpalette
  if (laeuft('suche')) {
    await geheZu('#/', 300);
    await seite.keyboard.press('Control+k');
    await seite.waitForTimeout(320);
    if (await seite.locator('.suche-palette').count() === 0) nichtGefunden.push('Suche: Palette öffnet nicht mit Strg+K');
    else {
      await textPruefen('Suchpalette (leer)');
      await axePruefen('Suchpalette');
      await seite.keyboard.type('Solvency', { delay: 25 });
      await seite.waitForTimeout(420);
      const treffer = await seite.locator('.suche-treffer').count().catch(() => 0);
      if (treffer === 0) nichtGefunden.push('Suche: „Solvency“ liefert keine Treffer');
      await kontrastPruefen('Suchpalette (Treffer)');
      await zielgroessen('Suchpalette');
      // bis zu einem echten Inhaltstreffer laufen (data-typ="inhalt", also ein
      // Treffer im Volltext eines Blocks) und ihn mit Enter öffnen: die Palette
      // muss zum Block springen und ihn hervorheben, nicht nur die Einheit öffnen
      let inhalt = -1;
      for (let i = 0; i < treffer; i += 1) {
        const typ = await seite.locator('.suche-treffer').nth(i).getAttribute('data-typ').catch(() => null);
        if (typ === 'inhalt') { inhalt = i; break; }
      }
      if (inhalt < 0) nichtGefunden.push('Suche: kein Inhaltstreffer (data-typ="inhalt") für „Solvency“');
      else {
        for (let i = 0; i < inhalt; i += 1) { await seite.keyboard.press('ArrowDown'); await seite.waitForTimeout(40); }
        await seite.keyboard.press('Enter');
        await seite.waitForTimeout(900);
        const hash = await seite.evaluate(() => window.location.hash);
        if (!/^#\/kapitel\/[^/]+\/[^/]+\/b\d+$/.test(hash)) nichtGefunden.push(`Suche: Enter auf dem Inhaltstreffer führt nach „${hash}“ statt zur Fundstelle`);
        if (await seite.locator('[data-block][data-hervor]').count().catch(() => 0) === 0) {
          nichtGefunden.push('Suche: die Fundstelle wird nach dem Sprung nicht hervorgehoben');
        }
        if (await seite.locator('.suche-palette').count() > 0) overlays.push('Suche: Palette bleibt nach Enter offen');
      }
    }
    // Esc schließt die Palette
    await seite.keyboard.press('Control+k');
    await seite.waitForTimeout(280);
    await seite.keyboard.press('Escape');
    await seite.waitForTimeout(260);
    if (await seite.locator('.suche-palette').count() > 0) overlays.push('Suche: Palette schließt nicht mit Esc');
  }

  // ----------------------------------------------- Tastaturhilfe, Umfang, Drawer
  if (laeuft('overlays')) {
    await geheZu('#/', 300);
    await seite.keyboard.press('?');
    await seite.waitForTimeout(320);
    const hilfe = await seite.locator('[role="dialog"]').count().catch(() => 0);
    if (hilfe === 0) nichtGefunden.push('Tastaturhilfe: öffnet nicht mit „?“');
    else {
      // Zuerst der Fokus (ein Tastendruck später ist er schon weitergewandert),
      // dann die Inhaltsprüfungen.
      const innen = await seite.evaluate(() => {
        const d = document.querySelector('[role="dialog"]');
        return Boolean(d && d.contains(document.activeElement));
      });
      if (!innen) overlays.push('Tastaturhilfe: Fokus liegt nach dem Öffnen außerhalb des Dialogs');
      await textPruefen('Tastaturhilfe');
      await axePruefen('Tastaturhilfe');
      await seite.keyboard.press('Escape');
      await seite.waitForTimeout(280);
      if (await seite.locator('[role="dialog"]').count().catch(() => 0) > 0) overlays.push('Tastaturhilfe: schließt nicht mit Esc');
    }

    // Fokus-Rückgabe: von einem echten Auslöser aus öffnen und schließen. Der
    // Fokus muss danach wieder dort liegen — landet er im <body>, ist die
    // Rückgabe am noch gesetzten `inert` des Hintergrunds gescheitert.
    await seite.evaluate(() => { document.activeElement?.blur?.(); });
    await seite.keyboard.press('Tab');
    await seite.keyboard.press('Tab');
    const vorher = await seite.evaluate(() => {
      const a = document.activeElement;
      return a && a !== document.body ? (a.getAttribute('aria-label') || a.textContent || a.tagName).trim().slice(0, 40) : null;
    });
    await seite.keyboard.press('?');
    await seite.waitForTimeout(340);
    await seite.keyboard.press('Escape');
    await seite.waitForTimeout(340);
    const nachher = await seite.evaluate(() => {
      const a = document.activeElement;
      if (!a || a === document.body || a === document.documentElement) return '<body>';
      return (a.getAttribute('aria-label') || a.textContent || a.tagName).trim().slice(0, 40);
    });
    if (vorher && nachher !== vorher) overlays.push(`Tastaturhilfe: Fokus liegt nach dem Schließen auf „${nachher}“ statt auf dem Auslöser „${vorher}“`);
    // Dieselbe Probe für die Suchpalette (⌘/Strg+K aus einem Knopf heraus)
    await seite.keyboard.press('Control+k');
    await seite.waitForTimeout(320);
    await seite.keyboard.press('Escape');
    await seite.waitForTimeout(340);
    const nachSuche = await seite.evaluate(() => {
      const a = document.activeElement;
      if (!a || a === document.body || a === document.documentElement) return '<body>';
      return (a.getAttribute('aria-label') || a.textContent || a.tagName).trim().slice(0, 40);
    });
    if (vorher && nachSuche !== vorher) overlays.push(`Suchpalette: Fokus liegt nach dem Schließen auf „${nachSuche}“ statt auf dem Auslöser „${vorher}“`);
    await fokusPruefen('Startseite (Tabulatorlauf)', 24);

    // Umfangs-Panel: ⌘/Strg + Umschalt + U
    await seite.keyboard.press('Control+Shift+u');
    await seite.waitForTimeout(340);
    if (await seite.locator('[role="dialog"]').count().catch(() => 0) === 0) nichtGefunden.push('Umfang: Panel öffnet nicht mit Strg+Umschalt+U');
    else {
      await textPruefen('Umfangs-Panel');
      await axePruefen('Umfangs-Panel');
      await seite.keyboard.press('Escape');
      await seite.waitForTimeout(280);
      if (await seite.locator('[role="dialog"]').count().catch(() => 0) > 0) overlays.push('Umfang: Panel schließt nicht mit Esc');
    }

    // Schublade bei 390 px
    await seite.setViewportSize({ width: 390, height: 844 });
    await geheZu('#/', 380);
    const menue = seite.locator('.topbar-menue');
    if (await menue.count() === 0) nichtGefunden.push('Schublade: Menüknopf bei 390 px nicht gefunden');
    else {
      await menue.click();
      await seite.waitForTimeout(340);
      if (await seite.locator('.schublade-flaeche').count() === 0) nichtGefunden.push('Schublade: öffnet nicht');
      else {
        await textPruefen('Schublade (390)');
        await axePruefen('Schublade (390)');
        await seite.keyboard.press('Escape');
        await seite.waitForTimeout(300);
        if (await seite.locator('.schublade-flaeche').count() > 0) overlays.push('Schublade: schließt nicht mit Esc');
      }
    }
    await seite.setViewportSize({ width: 1600, height: 1000 });
  }
} catch (e) {
  abbruch = String(e).split('\n')[0];
}

// ============================================== Maße bei 1600/1280/1024/390
if (laeuft('masse')) {
  const ANSICHTEN = [
    ['Startseite', '#/'],
    ['Lerneinheit (Grundlagen)', '#/kapitel/grundlagen/grosse-zahlen'],
    ['Lerneinheit (Prozesskette)', '#/kapitel/07-wertschoepfungskette/ueberblick'],
    ['Lerneinheit (Archetypen)', '#/kapitel/02-marktteilnehmer/erstversicherer'],
    ['Lerneinheit (Stufentabelle)', '#/kapitel/geschaeftsmodell/guv'],
    ['Lerneinheit (Morph. Kasten)', '#/kapitel/beratungspraxis/verortung'],
    ['Lerneinheit (Produktlandschaft)', '#/kapitel/03-produktlandschaft/sach'],
    ['Glossar', '#/glossar'],
    ['Wissenscheck', '#/wissenscheck'],
  ];
  for (const breite of [1600, 1280, 1024, 390]) {
    await seite.setViewportSize({ width: breite, height: breite === 390 ? 844 : 1000 });
    for (const [name, hash] of ANSICHTEN) {
      await neuLaden(hash);
      // Experte zeigt alle Blöcke — die breitesten Tafeln inklusive
      if (hash.startsWith('#/kapitel')) { await setzeTiefe('experte'); await seite.waitForTimeout(220); }
      await masse(name, breite);
      if (breite === 390 || breite === 1024) await textPruefen(`${name} @${breite}`);
    }
    // Suchpalette und Tastaturhilfe auch messen (Brief: nie breiter als das Fenster)
    await neuLaden('#/');
    await seite.keyboard.press('Control+k');
    await seite.waitForTimeout(300);
    await seite.keyboard.type('Vers', { delay: 15 });
    await seite.waitForTimeout(320);
    await masse('Suchpalette', breite);
    await seite.keyboard.press('Escape');
    await seite.waitForTimeout(200);
    await seite.keyboard.press('?');
    await seite.waitForTimeout(300);
    await masse('Tastaturhilfe', breite);
    await seite.keyboard.press('Escape');
    await seite.waitForTimeout(200);
  }
}

await browser.close();

// ------------------------------------------------------------------- Bericht
const zeig = (titel, liste, max = process.env.ALLE ? 400 : 12) => {
  const l = [...liste];
  console.log(`${titel}: ${l.length}`);
  l.slice(0, max).forEach((x) => console.log('   ', x));
  if (l.length > max) console.log(`    … und ${l.length - max} weitere`);
};
console.log('');
if (abbruch) console.log('Klickstrecke abgebrochen:', abbruch);
zeig('Laufzeitfehler', fehler);
zeig('Konsolenfehler', konsole);
zeig('HTTP ab 400', http);
zeig('Nicht gefunden / Verhalten', nichtGefunden);
zeig('Emojis und Ersatzzeichen im DOM', glyphen);
zeig('„€“ vor der Zahl', euro);
zeig('Diagramme ohne Achsenbeschriftung', achsen);
zeig('Waagerechter Überlauf', ueberlauf);
zeig('Starke Kappungen', kappungen);
zeig('Fokus ohne sichtbaren Ring', fokus);
zeig('Overlays (Esc, Fokus)', overlays);
zeig('Textkontrast unter dem Soll', kontrast);
zeig('Schrift unter 12 px', kleinschrift);
zeig('Trefffläche unter 24 × 24 px', zielflaechen);
zeig('axe-core (serious/critical)', axeBefunde);

const summe = fehler.length + konsole.length + http.length + nichtGefunden.length
  + glyphen.size + euro.size + achsen.size + ueberlauf.length + kappungen.length
  + fokus.size + overlays.length + kontrast.size + kleinschrift.size + zielflaechen.size
  + axeBefunde.length + (abbruch ? 1 : 0);
console.log(summe === 0 ? '\nRauchtest bestanden.' : `\nRauchtest FEHLGESCHLAGEN — ${summe} Befund(e).`);
process.exit(summe === 0 ? 0 : 1);
