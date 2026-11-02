#!/usr/bin/env node
/**
 * daten-anreicherung.mjs – trägt das redaktionelle Werk aus scripts/daten/anreicherung.json in
 * public/data/chapters.json ein (BRIEF.md Abschnitt 11, Punkte 12–14):
 *
 *   - je Lerneinheit `kurzgesagt` (2–4 Kernaussagen) und `lernziele` (2–3 Tätigkeitswörter-Sätze),
 *     einsortiert direkt hinter `subtitle`,
 *   - je Quizfrage `einheitId`, wo die Antwort sicher im Text einer Einheit steht,
 *   - neue Quizfragen (mit `einheitId`) für Lerneinheiten ohne Frage.
 *
 * Idempotent: Felder werden gesetzt, nicht angehängt; neue Fragen werden am Fragetext erkannt.
 * Die Formatregeln (Prozent mit U+00A0 usw.) gelten auch für die neuen Texte (scripts/daten/format.mjs).
 *
 * Aufruf:  node scripts/daten-anreicherung.mjs [--trocken]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { formatiereText } from './daten/format.mjs';

const HIER = path.dirname(fileURLToPath(import.meta.url));
const DATEI = path.resolve(HIER, '../public/data/chapters.json');
const QUELLE = path.resolve(HIER, 'daten/anreicherung.json');
const TROCKEN = process.argv.includes('--trocken');

const roh = fs.readFileSync(DATEI, 'utf8');
const daten = JSON.parse(roh);
const anreicherung = JSON.parse(fs.readFileSync(QUELLE, 'utf8'));
const protokoll = [];
const fehler = [];
const norm = (s) => String(s).replace(/[„“‚‘"']/g, '').replace(/\s+/g, ' ').trim().toLowerCase();

let einheitenMitText = 0;
let zuordnungen = 0;
let neueFragen = 0;

for (const c of daten.chapters) {
  const k = anreicherung.kapitel[c.id];
  if (!k) { protokoll.push(`${c.id}: keine Anreicherung vorhanden`); continue; }
  const einheitIds = new Set(c.subChapters.map((s) => s.id));

  // 1. kurzgesagt und lernziele je Einheit (Feldreihenfolge: id, title, icon, subtitle, kurzgesagt, lernziele, Rest)
  for (const s of c.subChapters) {
    const e = k.einheiten?.[s.id];
    if (!e) { fehler.push(`${c.id}/${s.id}: kurzgesagt/lernziele fehlen in anreicherung.json`); continue; }
    if (!Array.isArray(e.kurzgesagt) || e.kurzgesagt.length < 2 || e.kurzgesagt.length > 4) fehler.push(`${c.id}/${s.id}: kurzgesagt braucht 2–4 Sätze`);
    if (!Array.isArray(e.lernziele) || e.lernziele.length < 2 || e.lernziele.length > 3) fehler.push(`${c.id}/${s.id}: lernziele braucht 2–3 Einträge`);
    const kurzgesagt = (e.kurzgesagt || []).map(formatiereText);
    const lernziele = (e.lernziele || []).map(formatiereText);
    const { id, title, icon, subtitle, kurzgesagt: altK, lernziele: altL, ...rest } = s;
    void altK; void altL;
    for (const feld of Object.keys(s)) delete s[feld];
    Object.assign(s, { id, title, icon, subtitle, kurzgesagt, lernziele, ...rest });
    einheitenMitText += 1;
  }
  for (const id of Object.keys(k.einheiten || {})) if (!einheitIds.has(id)) fehler.push(`${c.id}: Einheit „${id}“ aus anreicherung.json existiert nicht`);

  // 2. einheitId je bestehender Frage (Index plus Fragebeginn als Sicherung)
  for (const z of k.quizEinheiten || []) {
    const q = c.quiz[z.index];
    if (!q) { fehler.push(`${c.id}.quiz[${z.index}]: Frage existiert nicht`); continue; }
    if (!norm(q.question).startsWith(norm(z.frage))) { fehler.push(`${c.id}.quiz[${z.index}]: Frage beginnt nicht mit „${z.frage}“ (ist: „${q.question.slice(0, 50)}“)`); continue; }
    if (!einheitIds.has(z.einheitId)) { fehler.push(`${c.id}.quiz[${z.index}]: einheitId „${z.einheitId}“ unbekannt`); continue; }
    q.einheitId = z.einheitId;
    zuordnungen += 1;
  }

  // 3. neue Fragen
  for (const f of k.neueFragen || []) {
    const kurz = f.question.slice(0, 45);
    if (!einheitIds.has(f.einheitId)) { fehler.push(`${c.id}: neue Frage „${kurz}“ mit unbekannter einheitId „${f.einheitId}“`); continue; }
    if (!Array.isArray(f.options) || f.options.length !== 4) { fehler.push(`${c.id}: neue Frage „${kurz}“ braucht vier Optionen`); continue; }
    if (!Number.isInteger(f.correct) || f.correct < 0 || f.correct > 3) { fehler.push(`${c.id}: neue Frage „${kurz}“ mit ungültigem correct`); continue; }
    if (!f.explanation) { fehler.push(`${c.id}: neue Frage „${kurz}“ ohne explanation`); continue; }
    const neu = { question: formatiereText(f.question), options: f.options.map(formatiereText), correct: f.correct, explanation: formatiereText(f.explanation), einheitId: f.einheitId };
    const vorhanden = c.quiz.find((q) => norm(q.question) === norm(f.question));
    if (vorhanden) { Object.assign(vorhanden, neu); continue; }
    c.quiz.push(neu);
    neueFragen += 1;
    protokoll.push(`${c.id}: neue Frage „${f.question.slice(0, 70)}“ → ${f.einheitId}`);
  }
}

const gesamtEinheiten = daten.chapters.reduce((a, c) => a + c.subChapters.length, 0);
const gesamtFragen = daten.chapters.reduce((a, c) => a + c.quiz.length, 0);
const mitEinheit = daten.chapters.reduce((a, c) => a + c.quiz.filter((q) => q.einheitId).length, 0);
const ausgabe = `${JSON.stringify(daten, null, 2)}\n`;
console.log(protokoll.join('\n'));
console.log(`Einheiten mit kurzgesagt/lernziele: ${einheitenMitText}/${gesamtEinheiten} | einheitId gesetzt: ${zuordnungen} (gesamt ${mitEinheit}/${gesamtFragen}) | neue Fragen in diesem Lauf: ${neueFragen} | Fragen gesamt: ${gesamtFragen}`);
for (const f of fehler) console.log(`FEHLER ${f}`);
console.log(`Bytes: ${Buffer.byteLength(roh)} → ${Buffer.byteLength(ausgabe)}${ausgabe === roh ? ' (unverändert)' : ''}`);
if (fehler.length) process.exit(1);
if (!TROCKEN && ausgabe !== roh) { fs.writeFileSync(DATEI, ausgabe); console.log(`geschrieben: ${DATEI}`); }
