// =============================================================================
// Wiederverwendbare jsPDF-Bausteine für die Smart-ICS-Demo-Dokumente.
// Zielformat: A4 hoch, 14 mm Rand, Standard-Helvetica.
// =============================================================================

export const PAGE = {
  width: 210,
  height: 297,
  marginLeft: 16,
  marginRight: 16,
  marginTop: 24,
  marginBottom: 22,
};

const COLOR_PRIMARY = [15, 77, 42];
const COLOR_ACCENT = [134, 188, 37];
const COLOR_BORDER = [226, 232, 240];
const COLOR_GREY = [100, 116, 139];
const COLOR_TEXT = [15, 23, 42];

// -------- Layout state -------------------------------------------------------

export function makeLayout(doc, meta) {
  const state = {
    doc,
    meta,
    y: PAGE.marginTop + 6,
    page: 1,
    docId: meta.docId,
    onHeader: meta.onHeader,
    onFooter: meta.onFooter,
  };
  state.onHeader && state.onHeader(state);
  return state;
}

export function ensureSpace(state, neededMm) {
  const available = PAGE.height - PAGE.marginBottom - state.y;
  if (available < neededMm) {
    state.onFooter && state.onFooter(state);
    state.doc.addPage();
    state.page += 1;
    state.y = PAGE.marginTop + 6;
    state.onHeader && state.onHeader(state);
  }
}

export function finalize(state) {
  state.onFooter && state.onFooter(state);
  // Re-stamp footer auf allen Seiten (z. B. für Seitenzahlen-Total)
  const total = state.doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    state.doc.setPage(i);
    if (state.onFooter) state.onFooter({ ...state, page: i, total });
  }
}

// -------- Building blocks ----------------------------------------------------

export function addCover(state, opts) {
  const { doc } = state;
  // Hintergrund
  doc.setFillColor(...COLOR_PRIMARY);
  doc.rect(0, 0, PAGE.width, 110, 'F');
  // Akzentbalken
  doc.setFillColor(...COLOR_ACCENT);
  doc.rect(0, 110, PAGE.width, 4, 'F');

  // Hand-rendered "Logo"
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(PAGE.marginLeft, 28, 28, 28, 4, 4, 'F');
  doc.setTextColor(...COLOR_PRIMARY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('S', PAGE.marginLeft + 14, 47, { align: 'center' });

  // Header-Texts
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('SMART ICS', PAGE.marginLeft + 36, 38);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Demo-Eingangsdokument · synthetische Daten', PAGE.marginLeft + 36, 44);

  // Klassifizierung oben rechts
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(PAGE.width - PAGE.marginRight - 50, 28, 50, 14, 2, 2, 'F');
  doc.setTextColor(...COLOR_PRIMARY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('VERTRAULICH', PAGE.width - PAGE.marginRight - 25, 35.5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Stufe 2 – Internal Use Only', PAGE.width - PAGE.marginRight - 25, 39.5, { align: 'center' });

  // Haupttitel im weißen Bereich
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  const titleLines = doc.splitTextToSize(opts.title, PAGE.width - PAGE.marginLeft - PAGE.marginRight);
  doc.text(titleLines, PAGE.marginLeft, 78);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(opts.subtitle, PAGE.marginLeft, 78 + titleLines.length * 8 + 4);

  // Meta-Block unten
  doc.setTextColor(...COLOR_TEXT);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Dokument-Steckbrief', PAGE.marginLeft, 130);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  let y = 138;
  for (const row of opts.metaRows) {
    doc.setTextColor(...COLOR_GREY);
    doc.text(row[0], PAGE.marginLeft, y);
    doc.setTextColor(...COLOR_TEXT);
    const wrapped = doc.splitTextToSize(row[1], PAGE.width - PAGE.marginLeft - PAGE.marginRight - 60);
    doc.text(wrapped, PAGE.marginLeft + 55, y);
    y += Math.max(5.5, wrapped.length * 4.5);
  }

  // Versions-Historie
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Versionshistorie', PAGE.marginLeft, y + 4);
  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setDrawColor(...COLOR_BORDER);
  doc.setLineWidth(0.2);
  // Tabellenkopf
  doc.setFillColor(241, 245, 249);
  doc.rect(PAGE.marginLeft, y - 3, PAGE.width - PAGE.marginLeft - PAGE.marginRight, 5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('Version', PAGE.marginLeft + 1, y);
  doc.text('Datum', PAGE.marginLeft + 22, y);
  doc.text('Autor', PAGE.marginLeft + 46, y);
  doc.text('Wesentliche Änderungen', PAGE.marginLeft + 78, y);
  doc.setFont('helvetica', 'normal');
  y += 3;
  for (const v of opts.versions) {
    y += 5;
    doc.setTextColor(...COLOR_TEXT);
    doc.text(v.version, PAGE.marginLeft + 1, y);
    doc.text(v.datum, PAGE.marginLeft + 22, y);
    doc.text(v.autor, PAGE.marginLeft + 46, y);
    const lines = doc.splitTextToSize(v.change, PAGE.width - PAGE.marginLeft - PAGE.marginRight - 78);
    doc.text(lines, PAGE.marginLeft + 78, y);
    if (lines.length > 1) y += (lines.length - 1) * 4;
    doc.setDrawColor(...COLOR_BORDER);
    doc.line(PAGE.marginLeft, y + 2, PAGE.width - PAGE.marginRight, y + 2);
  }

  // Footer unten — Verfasser, Genehmigung
  const footY = PAGE.height - 30;
  doc.setDrawColor(...COLOR_ACCENT);
  doc.setLineWidth(0.5);
  doc.line(PAGE.marginLeft, footY, PAGE.width - PAGE.marginRight, footY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COLOR_TEXT);
  doc.text('Genehmigt durch', PAGE.marginLeft, footY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLOR_GREY);
  doc.text(opts.approval, PAGE.marginLeft, footY + 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COLOR_TEXT);
  doc.text('Geltungsbereich', PAGE.width - PAGE.marginRight - 70, footY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLOR_GREY);
  doc.text(opts.scope, PAGE.width - PAGE.marginRight - 70, footY + 12);

  doc.addPage();
  state.page += 1;
  state.y = PAGE.marginTop + 6;
  state.onHeader && state.onHeader(state);
}

// Inhaltsverzeichnis (statisch — wir kennen die Kapitel)
export function addTableOfContents(state, items) {
  const { doc } = state;
  ensureSpace(state, 60);
  doc.setTextColor(...COLOR_TEXT);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('Inhaltsverzeichnis', PAGE.marginLeft, state.y);
  state.y += 7;
  doc.setDrawColor(...COLOR_ACCENT);
  doc.setLineWidth(0.6);
  doc.line(PAGE.marginLeft, state.y - 2, PAGE.marginLeft + 36, state.y - 2);
  state.y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  for (const it of items) {
    ensureSpace(state, 6);
    doc.setTextColor(...COLOR_TEXT);
    doc.setFont('helvetica', it.level === 1 ? 'bold' : 'normal');
    const indent = (it.level - 1) * 6;
    doc.text(`${it.no}`, PAGE.marginLeft + indent, state.y);
    doc.text(it.title, PAGE.marginLeft + indent + 16, state.y);
    // Punktelinie
    doc.setTextColor(...COLOR_GREY);
    const titleWidth = doc.getTextWidth(it.title);
    const dotStart = PAGE.marginLeft + indent + 16 + titleWidth + 2;
    const dotEnd = PAGE.width - PAGE.marginRight - 10;
    if (dotEnd > dotStart) {
      doc.setFontSize(8);
      doc.text(' . '.repeat(Math.floor((dotEnd - dotStart) / 2)), dotStart, state.y);
      doc.setFontSize(10);
    }
    doc.text(`${it.page}`, PAGE.width - PAGE.marginRight - 2, state.y, { align: 'right' });
    state.y += 6;
  }
  state.y += 4;
}

export function addH1(state, text) {
  ensureSpace(state, 20);
  const { doc } = state;
  doc.setTextColor(...COLOR_PRIMARY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(text, PAGE.marginLeft, state.y);
  state.y += 4;
  doc.setDrawColor(...COLOR_ACCENT);
  doc.setLineWidth(0.6);
  doc.line(PAGE.marginLeft, state.y, PAGE.marginLeft + 30, state.y);
  state.y += 8;
}

export function addH2(state, text) {
  ensureSpace(state, 12);
  const { doc } = state;
  doc.setTextColor(...COLOR_TEXT);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.text(text, PAGE.marginLeft, state.y);
  state.y += 6;
}

export function addH3(state, text) {
  ensureSpace(state, 10);
  const { doc } = state;
  doc.setTextColor(...COLOR_TEXT);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(text, PAGE.marginLeft, state.y);
  state.y += 5;
}

export function addParagraph(state, text, opts = {}) {
  const { doc } = state;
  doc.setTextColor(...COLOR_TEXT);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(opts.fontSize || 9.5);
  const width = PAGE.width - PAGE.marginLeft - PAGE.marginRight;
  const lines = doc.splitTextToSize(text, width);
  for (const line of lines) {
    ensureSpace(state, 5);
    doc.text(line, PAGE.marginLeft, state.y);
    state.y += 4.5;
  }
  state.y += 1.5;
}

export function addBullets(state, items, opts = {}) {
  const { doc } = state;
  doc.setTextColor(...COLOR_TEXT);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  const indent = opts.indent || 4;
  const bulletX = PAGE.marginLeft + indent;
  const textX = bulletX + 4;
  const width = PAGE.width - PAGE.marginLeft - PAGE.marginRight - indent - 4;
  for (const it of items) {
    const lines = doc.splitTextToSize(it, width);
    ensureSpace(state, lines.length * 4.5 + 1);
    doc.setFont('helvetica', 'bold');
    doc.text('·', bulletX, state.y);
    doc.setFont('helvetica', 'normal');
    doc.text(lines, textX, state.y);
    state.y += lines.length * 4.5 + 0.5;
  }
  state.y += 1;
}

export function addNumberedList(state, items) {
  const { doc } = state;
  doc.setTextColor(...COLOR_TEXT);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  const width = PAGE.width - PAGE.marginLeft - PAGE.marginRight - 8;
  items.forEach((it, idx) => {
    const lines = doc.splitTextToSize(it, width);
    ensureSpace(state, lines.length * 4.5 + 1);
    doc.setFont('helvetica', 'bold');
    doc.text(`${idx + 1}.`, PAGE.marginLeft, state.y);
    doc.setFont('helvetica', 'normal');
    doc.text(lines, PAGE.marginLeft + 8, state.y);
    state.y += lines.length * 4.5 + 0.5;
  });
  state.y += 1;
}

export function addCallout(state, type, title, text) {
  const { doc } = state;
  const colors = {
    info:    { fill: [239, 246, 255], border: [37, 99, 235], titleColor: [30, 64, 175] },
    warn:    { fill: [255, 247, 237], border: [217, 119, 6], titleColor: [154, 52, 18] },
    risk:    { fill: [254, 242, 242], border: [220, 38, 38], titleColor: [153, 27, 27] },
    success: { fill: [240, 253, 244], border: [22, 163, 74], titleColor: [20, 83, 45] },
    example: { fill: [248, 250, 252], border: [148, 163, 184], titleColor: [51, 65, 85] },
  };
  const c = colors[type] || colors.info;
  const width = PAGE.width - PAGE.marginLeft - PAGE.marginRight;
  const textLines = doc.splitTextToSize(text, width - 7);
  const boxH = 5 + textLines.length * 4.5 + 3;
  ensureSpace(state, boxH + 2);

  doc.setFillColor(...c.fill);
  doc.setDrawColor(...c.border);
  doc.setLineWidth(0.3);
  doc.rect(PAGE.marginLeft, state.y - 2, width, boxH, 'FD');

  // Akzent-Balken links
  doc.setFillColor(...c.border);
  doc.rect(PAGE.marginLeft, state.y - 2, 1.6, boxH, 'F');

  doc.setTextColor(...c.titleColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(title, PAGE.marginLeft + 4, state.y + 2.5);
  doc.setTextColor(...COLOR_TEXT);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(textLines, PAGE.marginLeft + 4, state.y + 7);
  state.y += boxH + 2.5;
}

export function addTable(state, columns, rows, opts = {}) {
  const { doc } = state;
  const fullWidth = PAGE.width - PAGE.marginLeft - PAGE.marginRight;
  // Spaltenbreiten relativ
  const totalRel = columns.reduce((s, c) => s + (c.width || 1), 0);
  const widths = columns.map(c => (c.width || 1) / totalRel * fullWidth);
  const rowH = opts.rowHeight || 6;
  const headerH = 6.5;
  const cellPadX = 1.5;

  // Header
  ensureSpace(state, headerH + rowH + 1);
  doc.setFillColor(...COLOR_PRIMARY);
  doc.rect(PAGE.marginLeft, state.y - 4, fullWidth, headerH, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  let x = PAGE.marginLeft;
  columns.forEach((c, i) => {
    doc.text(c.label, x + cellPadX, state.y);
    x += widths[i];
  });
  state.y += 3;

  // Rows
  doc.setTextColor(...COLOR_TEXT);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  rows.forEach((r, rIdx) => {
    // Pro Zelle: Höhe je nach längstem Text bestimmen
    const lineSets = r.map((cellVal, ci) => doc.splitTextToSize(String(cellVal ?? ''), widths[ci] - cellPadX * 2));
    const cellHeight = Math.max(rowH, lineSets.reduce((m, ls) => Math.max(m, ls.length * 4.2), 0) + 2);
    ensureSpace(state, cellHeight + 1);
    // Zebra
    if (rIdx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(PAGE.marginLeft, state.y - 4, fullWidth, cellHeight, 'F');
    }
    let cx = PAGE.marginLeft;
    lineSets.forEach((ls, ci) => {
      doc.text(ls, cx + cellPadX, state.y);
      cx += widths[ci];
    });
    state.y += cellHeight - 4;
    // Untere Linie
    doc.setDrawColor(...COLOR_BORDER);
    doc.setLineWidth(0.15);
    doc.line(PAGE.marginLeft, state.y, PAGE.width - PAGE.marginRight, state.y);
    state.y += 4;
  });
  state.y += 1;
}

export function addRunningHeader(state, opts) {
  const { doc } = state;
  // Linie oben
  doc.setDrawColor(...COLOR_BORDER);
  doc.setLineWidth(0.3);
  doc.line(PAGE.marginLeft, 14, PAGE.width - PAGE.marginRight, 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR_GREY);
  doc.text(opts.left, PAGE.marginLeft, 11);
  doc.text(opts.right, PAGE.width - PAGE.marginRight, 11, { align: 'right' });
}

export function addRunningFooter(state, opts) {
  const { doc } = state;
  doc.setDrawColor(...COLOR_BORDER);
  doc.setLineWidth(0.3);
  doc.line(PAGE.marginLeft, PAGE.height - 14, PAGE.width - PAGE.marginRight, PAGE.height - 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR_GREY);
  doc.text(opts.left, PAGE.marginLeft, PAGE.height - 9);
  doc.text(opts.right, PAGE.width - PAGE.marginRight, PAGE.height - 9, { align: 'right' });
}

export function spacer(state, mm = 3) {
  state.y += mm;
}
