/**
 * daten-feinschliff.mjs — letzter Schritt der Datenkette (nach
 * daten-bereinigung, daten-anreicherung, daten-deck). Redaktionelle
 * Feinarbeit, die sich aus der Sichtprüfung der Grafiken und der
 * Wissenscheck-Zuordnung ergeben hat. Das Skript ist idempotent: es setzt
 * Werte, statt sie anzuhängen, und meldet, was es geändert hat.
 *
 *  1. Weiche Trennstriche (U+00AD) in den langen Komposita der
 *     `prozessKette.kern[].titel`. Sechs Kettenglieder teilen sich die
 *     Breite; ohne Trennstelle bricht ein Browser ohne deutsches
 *     Trennwörterbuch mitten im Wort („Produktentwicklu-ng“) oder lässt den
 *     Titel überlaufen. Der Trennstrich ist unsichtbar; Suche und Lesezeit
 *     räumen ihn über `entferneHtml`/`falte` wieder weg.
 *  2. `risikokette.stufen[].uebergang` — die Beschriftung des Pfeils zur
 *     nächsten Stufe. Ohne sie steht dreimal derselbe Rückfalltext
 *     „reicht Risiko weiter“. Wortlaut nach Folie 56 („Risikoabdeckung gegen
 *     Prämie“) bzw. aus dem Text der Stufe; Zession und Retrozession stehen
 *     als Begriffe im Glossar.
 *  3. `einheitId` für Bestandsquizfragen, deren Antwort im Text einer
 *     Lerneinheit DESSELBEN Kapitels steht (Brief §11.8: im Zweifel
 *     weglassen). Belegt im Bericht agent-18-qa.md.
 *  4. „~“ vor einer Zahl im Fließtext (Absatz, Hinweis) wird zu „rund“. In
 *     Tabellenzellen und Listen bleibt die knappe Form: dort steht die
 *     Näherung in einer engen Spalte, im Satz liest sie sich fremd.
 *
 * Aufruf: node scripts/daten-feinschliff.mjs [--still]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HIER = path.dirname(fileURLToPath(import.meta.url));
const DATEI = path.join(HIER, '..', 'public', 'data', 'chapters.json');
const STILL = process.argv.includes('--still');
const SHY = '­';

const daten = JSON.parse(fs.readFileSync(DATEI, 'utf8'));
let geaendert = 0;
const sage = (t) => { if (!STILL) console.log(t); };

// --- 1. weiche Trennstriche in den Kettengliedern ---------------------------
// Schlüssel ohne Trennstriche → Titel mit Trennstrichen.
const TRENNUNG = {
  'Produktentwicklung und -pflege': `Produkt${SHY}entwicklung und -pflege`,
  'Aktuariat, Underwriting, Rückversicherung': `Aktuariat, Under${SHY}writing, Rück${SHY}versicherung`,
  'Vertrieb und Marketing': `Vertrieb und Marke${SHY}ting`,
  'Policierung und Bestandsführung': `Policie${SHY}rung und Bestands${SHY}führung`,
  'Vertrag und Schaden': 'Vertrag und Schaden',
  'Kundenservice und Retention': `Kunden${SHY}service und Reten${SHY}tion`,
};

// --- 2. Pfeilbeschriftungen der Risikokette ---------------------------------
// Schlüssel: Titel der Stufe, von der der Pfeil ausgeht. Die letzte Stufe
// bekommt keinen Pfeil und deshalb keinen Eintrag.
const UEBERGAENGE = {
  Versicherungsnehmer: 'Risikoabdeckung gegen Prämie',
  Erstversicherer: 'Zession: Teile des Risikos und der Prämien',
  Rückversicherer: 'Retrozession: die Spitzen des Portfolios',
};

// --- 3. Quiz: einheitId für Bestandsfragen ---------------------------------
// Nur dort, wo die Antwort nachweislich im Text einer Lerneinheit desselben
// Kapitels steht. Die übrigen Fragen bleiben ohne (Begründung im Bericht).
const QUIZ_EINHEIT = [
  { kapitel: '04-vertriebswege', index: 2, einheit: 'direkt-online' },
];

function bloecke(kapitel) {
  const raus = [];
  for (const sc of kapitel.subChapters || []) {
    for (const lv of ['level1', 'level2', 'level3']) for (const b of sc[lv] || []) raus.push({ b, sc, lv });
  }
  return raus;
}

for (const kapitel of daten.chapters || []) {
  for (const { b, sc } of bloecke(kapitel)) {
    if (b.type === 'prozessKette') {
      for (const glied of b.kern || []) {
        const roh = String(glied.titel || '').split(SHY).join('');
        const ziel = TRENNUNG[roh];
        if (!ziel) { console.error(`WARNUNG: kein Trennmuster für „${roh}“ (${kapitel.id}/${sc.id})`); continue; }
        if (glied.titel !== ziel) { glied.titel = ziel; geaendert += 1; sage(`Trennstriche: ${kapitel.id}/${sc.id} · ${roh}`); }
      }
    }
    if (b.type === 'risikokette') {
      const stufen = b.stufen || [];
      stufen.forEach((st, i) => {
        if (i === stufen.length - 1) {
          if (st.uebergang !== undefined) { delete st.uebergang; geaendert += 1; sage(`Übergang entfernt (letzte Stufe): ${st.titel}`); }
          return;
        }
        const ziel = UEBERGAENGE[st.titel];
        if (!ziel) { console.error(`WARNUNG: keine Pfeilbeschriftung für Stufe „${st.titel}“ (${kapitel.id}/${sc.id})`); return; }
        if (st.uebergang !== ziel) { st.uebergang = ziel; geaendert += 1; sage(`Übergang: ${kapitel.id}/${sc.id} · ${st.titel} → „${ziel}“`); }
      });
    }
  }
}

// --- 4. „~“ im Fließtext ---------------------------------------------------
for (const kapitel of daten.chapters || []) {
  for (const { b, sc } of bloecke(kapitel)) {
    if (b.type !== 'paragraph' && b.type !== 'callout') continue;
    for (const feld of ['content', 'text']) {
      if (typeof b[feld] !== 'string' || !/~\d/.test(b[feld])) continue;
      const neu = b[feld].replace(/~(?=[\d])/g, 'rund ');
      if (neu !== b[feld]) { b[feld] = neu; geaendert += 1; sage(`„~“ → „rund“: ${kapitel.id}/${sc.id} (${b.type}.${feld})`); }
    }
  }
}

for (const { kapitel, index, einheit } of QUIZ_EINHEIT) {
  const k = (daten.chapters || []).find((c) => c.id === kapitel);
  if (!k) { console.error(`WARNUNG: Kapitel ${kapitel} fehlt`); continue; }
  const frage = (k.quiz || [])[index];
  if (!frage) { console.error(`WARNUNG: ${kapitel}.quiz[${index}] fehlt`); continue; }
  if (!(k.subChapters || []).some((sc) => sc.id === einheit)) { console.error(`WARNUNG: ${kapitel} hat keine Einheit ${einheit}`); continue; }
  if (frage.einheitId !== einheit) { frage.einheitId = einheit; geaendert += 1; sage(`einheitId: ${kapitel}.quiz[${index}] → ${einheit}`); }
}

if (geaendert === 0) sage('Feinschliff: nichts zu tun (Datei ist auf Stand).');
else {
  fs.writeFileSync(DATEI, `${JSON.stringify(daten, null, 2)}\n`, 'utf8');
  sage(`Feinschliff: ${geaendert} Änderung(en) geschrieben.`);
}
