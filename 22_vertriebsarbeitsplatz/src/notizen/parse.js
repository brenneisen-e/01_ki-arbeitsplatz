// Parser für die Speakernotes in docs/speakernotes-*.md: dieselbe Blockstruktur
// wie das Notizfenster von Banking Horizon (03_banking-horizon/src/notizen/parse.ts),
// ergänzt um Anker. Ein Anker `{#name}` am Ende einer Abschnittsüberschrift oder
// einer Regieanweisung nennt die Stelle des Arbeitsplatzes, zu der die Notizen
// springen (Zuordnung in stellen.js).
//
//   ## 0:40 Übersicht: die Agenten haben vorgearbeitet (1 Minute) {#uebersicht}
//   [KI-Vertriebsassistent unten rechts öffnen.] {#assistent}

const ANKER = /\s*\{#([a-z0-9-]+)\}\s*$/;

/** Trennt einen Anker am Zeilenende ab. */
export function mitAnker(text) {
  const m = text.match(ANKER);
  return m ? { text: text.slice(0, m.index).trim(), anker: m[1] } : { text, anker: null };
}

export function inBloecke(md) {
  const z = md.split('\n');
  const out = [];
  let i = 0;
  while (i < z.length) {
    const l = z[i];
    if (!l.trim()) { i++; continue; }
    if (l.startsWith('# ')) { out.push({ typ: 'h1', text: l.slice(2).trim() }); i++; continue; }
    if (l.startsWith('## ')) { out.push({ typ: 'h2', ...mitAnker(l.slice(3).trim()) }); i++; continue; }
    if (l.trim() === '---') { out.push({ typ: 'hr' }); i++; continue; }
    if (l.startsWith('|')) {
      const zeilen = [];
      while (i < z.length && z[i].startsWith('|')) {
        if (!/^\|\s*-/.test(z[i])) zeilen.push(z[i].replace(/^\||\|$/g, '').split('|').map((c) => c.trim()));
        i++;
      }
      out.push({ typ: 'tabelle', zeilen });
      continue;
    }
    if (l.startsWith('- ')) {
      const punkte = [];
      while (i < z.length && (z[i].startsWith('- ') || z[i].startsWith('  '))) {
        if (z[i].startsWith('- ')) punkte.push(z[i].slice(2).trim());
        else punkte[punkte.length - 1] += ' ' + z[i].trim();
        i++;
      }
      out.push({ typ: 'liste', punkte });
      continue;
    }
    const teile = [];
    while (i < z.length && z[i].trim() && !/^(#{1,2} |\||- |---$)/.test(z[i])) { teile.push(z[i].trim()); i++; }
    out.push({ typ: 'p', ...mitAnker(teile.join(' ')) });
  }
  return out;
}

/** Drei Teile, getrennt durch die beiden Trennlinien: Vorspann, Rede, Anhang. */
export function teile(bloecke) {
  const gruppen = [[]];
  for (const b of bloecke) {
    if (b.typ === 'hr') gruppen.push([]);
    else gruppen[gruppen.length - 1].push(b);
  }
  return { vorspann: gruppen[0] ?? [], rede: gruppen[1] ?? [], anhang: gruppen[2] ?? [] };
}

const MARKE = /^(\d+:\d\d)\s+(.+?)\s+\((.+)\)$/;

function schlagwort(titel) {
  return titel.toLowerCase().replace(/[^a-z0-9äöüß]+/g, '-').replace(/^-|-$/g, '');
}

/** Abschnittsüberschrift „0:40 Titel: Zusatz (Dauer)“; der Chip im Kopf trägt
 *  den Titel bis zum Doppelpunkt. Ohne Zeitmarke kein Abschnitt (null). */
export function parseH2(block) {
  const m = block.text.match(MARKE);
  if (!m) return null;
  return {
    id: block.anker ?? schlagwort(m[2]),
    marke: m[1],
    titel: m[2],
    dauer: m[3],
    kurz: m[2].split(':')[0].trim(),
  };
}

/** Zu jedem Anker der Rede der Abschnitt, in dem er steht (für den aktiven Chip). */
export function ankerZuAbschnitt(rede) {
  const zuordnung = {};
  let abschnitt = null;
  for (const b of rede) {
    if (b.typ === 'h2') {
      abschnitt = parseH2(b)?.id ?? null;
      if (abschnitt) zuordnung[abschnitt] = abschnitt;
    } else if (b.typ === 'p' && b.anker && abschnitt) {
      zuordnung[b.anker] = abschnitt;
    }
  }
  return zuordnung;
}

// Sätze trennen für die Stichpunkt-Darstellung: Satzende, Leerraum, dann
// Großbuchstabe, Zahl oder öffnendes Anführungszeichen. Abkürzungen bleiben
// zusammen, sehr kurze Sätze hängen sich an den Vorgänger. Die Leerzeichen in
// zweiteiligen Abkürzungen („z. B.“) vertritt beim Trennen ein Zeichen aus dem
// privaten Bereich: ein geschütztes Leerzeichen zählte für \s als Leerraum,
// und „z. B. Auto“ zerfiele hinter dem „z.“.
const ZWEITEILIG = [/z\. B\./g, /u\. a\./g, /d\. h\./g, /o\. Ä\./g, /i\. d\. R\./g];
const ABKUERZUNG = /(?:\bbzw|\bca|\bDr|\bProf|\bNr|\bMio|\bMrd|\bTsd|\bvs|\betc|\binkl|\bggf|\bevtl|\bsog|\busw|z\. B|u\. a|d\. h|o\. Ä|i\. d\. R)\.$/;
const GESCHUETZT = '\ue000';

export function saetze(text) {
  let t = text;
  for (const re of ZWEITEILIG) t = t.replace(re, (m) => m.replace(/ /g, GESCHUETZT));
  const roh = t.split(/(?<=[.!?][“”"’)]?)\s+(?=[„"“(\[A-ZÄÖÜ0-9])/);
  const out = [];
  for (const s of roh) {
    const prev = out[out.length - 1];
    if (prev !== undefined && ABKUERZUNG.test(prev.replaceAll(GESCHUETZT, ' '))) out[out.length - 1] = prev + ' ' + s;
    else out.push(s);
  }
  const res = [];
  for (const s of out) {
    if (res.length && s.split(/\s+/).length < 4) res[res.length - 1] += ' ' + s;
    else res.push(s);
  }
  return res.map((s) => s.replaceAll(GESCHUETZT, ' '));
}
