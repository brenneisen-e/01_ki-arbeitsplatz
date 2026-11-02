// Gruppiert die Text-Items von pdf.js (einzelne Woerter/Laeufe) zu editierbaren
// Bloecken: erst zu Zeilen gleicher Schrift und Groesse, dann zu Absaetzen aus
// buendig untereinander stehenden Zeilen. Koordinaten bleiben im PDF-Nutzer-
// raum (Ursprung unten links, Einheit Punkt), y = Grundlinie.

let blockCounter = 0;
export function nextBlockId() {
  blockCounter += 1;
  return 'b' + blockCounter;
}

function median(values) {
  const s = [...values].sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)] : 0;
}

export function itemsToRuns(items) {
  const runs = [];
  const prepared = [];
  for (const it of items) {
    if (!it || typeof it.str !== 'string' || it.str === '') continue;
    const [a, b, c, d, e, f] = it.transform;
    const size = Math.hypot(c, d);
    if (!(size > 0.5)) continue;
    const angle = Math.atan2(b, a);
    prepared.push({ str: it.str, x: e, y: f, width: it.width || 0, size, angle, fontName: it.fontName, mirrored: a * d - b * c < 0 });
  }
  // Lesereihenfolge: oben nach unten, links nach rechts.
  prepared.sort((p, q) => (Math.abs(q.y - p.y) > 0.5 * Math.min(p.size, q.size) ? q.y - p.y : p.x - q.x));

  for (const it of prepared) {
    let target = null;
    for (let i = runs.length - 1; i >= 0 && i >= runs.length - 12; i--) {
      const r = runs[i];
      if (r.fontName !== it.fontName) continue;
      if (Math.abs(r.size - it.size) > 0.04 * r.size) continue;
      if (Math.abs(r.angle - it.angle) > 0.01) continue;
      if (Math.abs(r.y - it.y) > 0.25 * r.size) continue;
      const gap = it.x - (r.x + r.width);
      if (gap < -0.35 * r.size || gap > 0.7 * r.size) continue;
      target = { run: r, gap };
      break;
    }
    if (target) {
      const { run, gap } = target;
      const needsSpace = gap > 0.11 * run.size && !/\s$/.test(run.text) && !/^\s/.test(it.str);
      run.text += (needsSpace ? ' ' : '') + it.str;
      // Leerraum-Items (z. B. Tabulatorluecken aus Chrome) verlaengern die
      // Zeile nicht, sonst reicht der Block bis in den Text rechts daneben.
      if (it.str.trim() !== '') run.width = Math.max(run.width, it.x + it.width - run.x);
    } else {
      runs.push({ ...it, text: it.str });
    }
  }
  for (const r of runs) {
    // Fuehrende/abschliessende Leerzeichen nicht in den Block uebernehmen,
    // aber die Startposition entsprechend verschieben ist nicht noetig: pdf.js
    // liefert Leerzeichen-Items meist ohne Breite.
    r.text = r.text.replace(/\s+$/g, '');
  }
  return runs.filter(r => r.text.trim() !== '' && !r.mirrored);
}

export function runsToBlocks(runs, pageIndex, styles) {
  const blocks = [];
  const sorted = [...runs].sort((p, q) => (Math.abs(q.y - p.y) > 0.5 * Math.min(p.size, q.size) ? q.y - p.y : p.x - q.x));
  // Laeufe, die links oder rechts auf derselben Grundlinie Nachbarn haben,
  // gehoeren zu gemischt formatierten Zeilen und werden nicht zu Absaetzen
  // zusammengefasst — sonst entstehen Bloecke aus Zeilenfragmenten.
  for (const r of sorted) {
    r.hasLeft = false; r.hasRight = false;
    for (const o of sorted) {
      if (o === r || Math.abs(o.y - r.y) > 0.25 * r.size) continue;
      if (o.x + o.width <= r.x + 0.3 * r.size && o.x + o.width > r.x - 3 * r.size) r.hasLeft = true;
      if (o.x >= r.x + r.width - 0.3 * r.size && o.x < r.x + r.width + 3 * r.size) r.hasRight = true;
    }
  }
  for (const r of sorted) {
    let target = null;
    for (let i = blocks.length - 1; i >= 0 && i >= blocks.length - 30; i--) {
      const b = blocks[i];
      if (b.fontName !== r.fontName || Math.abs(b.size - r.size) > 0.04 * b.size || Math.abs(b.angle - r.angle) > 0.01) continue;
      const last = b.lines[b.lines.length - 1];
      if (Math.abs(r.angle) > 0.01) continue; // gedrehten Text nicht zu Absaetzen verbinden
      if (last.hasRight || r.hasLeft) continue;
      if (Math.abs(last.x - r.x) > 0.6 * b.size) continue;
      const dy = last.y - r.y;
      if (dy < 0.8 * b.size || dy > 2.0 * b.size) continue;
      target = b;
      break;
    }
    if (target) {
      target.lines.push({ x: r.x, y: r.y, width: r.width, text: r.text, hasRight: r.hasRight });
    } else {
      blocks.push({ fontName: r.fontName, size: r.size, angle: r.angle, lines: [{ x: r.x, y: r.y, width: r.width, text: r.text, hasRight: r.hasRight }] });
    }
  }
  return blocks.map(b => {
    const style = (styles && styles[b.fontName]) || {};
    const dys = [];
    for (let i = 1; i < b.lines.length; i++) dys.push(b.lines[i - 1].y - b.lines[i].y);
    const lineHeight = dys.length ? median(dys) : b.size * 1.2;
    let ascent = typeof style.ascent === 'number' && style.ascent > 0.3 ? style.ascent : 0.9;
    let descent = typeof style.descent === 'number' && style.descent < 0 ? style.descent : -0.22;
    if (ascent > 1.3) ascent = 1.0;
    if (descent < -0.6) descent = -0.3;
    return {
      id: nextBlockId(),
      pageIndex,
      added: false,
      fontName: b.fontName,
      fontFamily: style.fontFamily || 'sans-serif',
      size: b.size,
      angle: b.angle,
      x: b.lines[0].x,
      y: b.lines[0].y,
      lines: b.lines.map(l => ({ x: l.x, y: l.y, width: l.width, text: l.text })),
      lineHeight,
      ascent,
      descent,
      text: b.lines.map(l => l.text).join('\n'),
      width: Math.max(...b.lines.map(l => l.width)),
    };
  });
}

/** Rechteck (PDF-Koordinaten) um alle Zeilen eines Layouts. */
export function layoutBounds(lines, size, ascent, descent) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const l of lines) {
    minX = Math.min(minX, l.x);
    maxX = Math.max(maxX, l.x + Math.max(l.width, size * 0.5));
    minY = Math.min(minY, l.y + descent * size);
    maxY = Math.max(maxY, l.y + ascent * size);
  }
  if (!isFinite(minX)) return { x: 0, y: 0, w: 0, h: 0 };
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}
